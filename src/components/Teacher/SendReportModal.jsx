import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Users, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import teacherService from '../../services/teacherService';
import Swal from 'sweetalert2';

/**
 * SendReportModal - Modal gửi báo cáo cho Staff
 * @param {Object} reportData - Dữ liệu báo cáo cần gửi
 * @param {Function} onClose - Đóng modal
 * @param {Function} onSuccess - Callback khi gửi thành công
 */
const SendReportModal = ({ reportData, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('all'); // 'all' hoặc staff ID
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStaffList();
    }, []);

    const fetchStaffList = async () => {
        try {
            const response = await teacherService.getStaffList();
            setStaffList(response || []);
        } catch (err) {
            console.error('Error fetching staff list:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            setError('Vui lòng nhập nội dung tin nhắn');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = {
                ...reportData,
                message: message.trim(),
                recipientStaffId: selectedStaff === 'all' ? null : selectedStaff,
                sendToAll: selectedStaff === 'all'
            };

            await teacherService.sendReportToStaff(data);

            Swal.fire({
                icon: 'success',
                title: 'Đã Gửi Báo Cáo!',
                text: selectedStaff === 'all'
                    ? 'Báo cáo đã được gửi cho tất cả Staff.'
                    : 'Báo cáo đã được gửi cho Staff.',
                timer: 2000,
                showConfirmButton: false
            });

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Error sending report:', err);
            setError(err.response?.data?.message || 'Không thể gửi báo cáo. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 border-b border-blue-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <Send className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Gửi Báo Cáo Cho Staff</h3>
                            <p className="text-sm text-blue-100">
                                {reportData?.title || 'Báo cáo học tập'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Report Info */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium">{reportData?.title || 'Báo cáo'}</p>
                                {reportData?.classId && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        Lớp: {reportData.className}
                                    </p>
                                )}
                                {reportData?.dateRange && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        Thời gian: {reportData.dateRange}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Staff Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Users className="w-4 h-4 inline mr-1" />
                            Người Nhận
                        </label>
                        <select
                            value={selectedStaff}
                            onChange={(e) => {
                                setSelectedStaff(e.target.value);
                                if (error) setError('');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả Staff</option>
                            {staffList.map(staff => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.fullName || staff.username} - {staff.email}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            {selectedStaff === 'all'
                                ? 'Báo cáo sẽ được gửi cho tất cả Staff đang hoạt động'
                                : 'Chỉ Staff được chọn sẽ nhận báo cáo'
                            }
                        </p>
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội Dung Tin Nhắn <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Nhập nội dung tin nhắn hoặc ghi chú cho Staff..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {message.length}/500 ký tự
                        </p>
                    </div>

                    {/* Info */}
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">Thông báo sẽ được gửi</p>
                                <p className="text-xs">Staff sẽ nhận thông báo báo cáo mới và có thể xem chi tiết.</p>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Gửi Báo Cáo
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SendReportModal;
