import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, AlertTriangle, AlertOctagon, Users, Calendar, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';
import staffService from '../../services/staffService';
import educationManagerService from '../../services/educationManagerService';

/**
 * DeleteClassModal - Modal xác nhận xóa lớp học
 * @param {Object} classData - Thông tin lớp học cần xóa
 * @param {Function} onClose - Đóng modal
 * @param {Function} onSuccess - Callback khi xóa thành công
 */
const DeleteClassModal = ({ classData, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const isManager = user?.role === 'EDUCATION_MANAGER';
    const [deleting, setDeleting] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');

    // Count active students
    const activeStudentCount = classData?.students?.filter(s => s.status === 'ACTIVE').length ||
                              classData?.currentEnrollment ||
                              classData?.studentCount ||
                              0;

    const handleDelete = async () => {
        // Validate confirmation text
        if (confirmText !== 'DELETE') {
            setError('Bạn phải nhập "DELETE" để xác nhận xóa lớp học này.');
            return;
        }

        setDeleting(true);
        setError('');

        try {
            // Use appropriate service based on user role
            const service = isManager ? educationManagerService : staffService;
            await service.deleteClass(classData.id);

            // Show success message
            await Swal.fire({
                icon: 'success',
                title: t('class.delete.success', 'Đã Xóa Lớp Học!'),
                text: t('class.delete.successMessage', 'Lớp học đã được xóa thành công.'),
                confirmButtonColor: '#10b981',
            });

            // Call success callback
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Error deleting class:', err);
            const errorMessage = err.response?.data?.message || err.message || t('class.delete.error', 'Không thể xóa lớp học. Vui lòng thử lại.');
            setError(errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Xóa Lớp Học</h3>
                            <p className="text-sm text-gray-600">
                                {classData?.className || classData?.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Active Students Warning */}
                    {activeStudentCount > 0 && (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-semibold mb-1">⚠️ Cảnh báo: Lớp học đang có học viên</p>
                                    <p className="text-yellow-700">
                                        Lớp này hiện tại có <strong>{activeStudentCount} học viên</strong> đang học.
                                        Bạn cần xóa hoặc chuyển tất cả học viên sang lớp khác trước khi xóa lớp học này.
                                    </p>
                                    <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                                        <p className="font-medium">Các bước cần thực hiện:</p>
                                        <ol className="list-decimal list-inside mt-1 space-y-1">
                                            <li>Chuyển học viên sang lớp khác (nếu cần)</li>
                                            <li>Xóa hết học viên khỏi lớp hiện tại</li>
                                            <li>Sau đó mới có thể xóa lớp học</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warning Message */}
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-800">
                                <p className="font-semibold mb-1">Cảnh báo quan trọng</p>
                                <p className="text-red-700">
                                    Hành động này <strong>không thể hoàn tác</strong>. Tất cả dữ liệu liên quan đến lớp học này sẽ bị xóa vĩnh viễn, bao gồm:
                                </p>
                                <ul className="list-disc list-inside mt-2 text-red-700 space-y-1">
                                    <li>Danh sách học viên và thông tin ghi danh</li>
                                    <li>Giáo viên được phân công</li>
                                    <li>Lịch học và các buổi học</li>
                                    <li>Lịch sử điểm danh</li>
                                    <li>Bài kiểm tra và kết quả</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nhập <span className="font-mono font-bold text-red-600">DELETE</span> để xác nhận
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Nhập DELETE để xác nhận"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 uppercase"
                            disabled={deleting}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Hành động này sẽ ảnh hưởng đến {classData?.studentCount || 0} học viên.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Class Info */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-sm space-y-1">
                            <p><span className="font-medium">Mã lớp:</span> {classData?.classCode || classData?.code}</p>
                            <p><span className="font-medium">Khóa học:</span> {classData?.courseName || classData?.course?.name}</p>
                            <p><span className="font-medium">Giáo viên:</span> {classData?.teacherName || classData?.teacher?.fullName || 'Chưa gán'}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={deleting}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting || confirmText !== 'DELETE' || activeStudentCount > 0}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            title={activeStudentCount > 0 ? 'Không thể xóa lớp khi đang có học viên' : ''}
                        >
                            {deleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang xóa...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Xóa Lớp Học
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteClassModal;
