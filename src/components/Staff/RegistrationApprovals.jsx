import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Eye, Search, Filter, FileText, Phone, Mail, Calendar, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Swal from 'sweetalert2';

/**
 * RegistrationApprovals - Component quản lý duyệt đăng ký học viên
 * Phase 5: Analytics / Staff Feature
 *
 * Features:
 * - View all registration requests
 * - Approve/Reject registrations
 * - Filter by status
 * - Search functionality
 * - View registration details
 * - Export registrations
 */
const RegistrationApprovals = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Filters
    const [filter, setFilter] = useState({
        status: 'all',
        course: 'all',
        search: ''
    });

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/staff/registrations', {
                params: filter
            });
            setRegistrations(response.data || []);
        } catch (error) {
            console.error('Error fetching registrations:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải danh sách đăng ký',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (registrationId) => {
        const result = await Swal.fire({
            icon: 'question',
            title: 'Duyệt đăng ký?',
            text: 'Xác nhận duyệt học viên này vào khóa học',
            showCancelButton: true,
            confirmButtonText: 'Duyệt',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7280'
        });

        if (!result.isConfirmed) return;

        try {
            await axiosClient.put(`/api/staff/registrations/${registrationId}/approve`);
            await Swal.fire({
                icon: 'success',
                title: 'Đã duyệt',
                text: 'Đã duyệt đăng ký học viên thành công',
                timer: 2000,
                showConfirmButton: false
            });
            fetchRegistrations();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: error.response?.data?.message || 'Không thể duyệt đăng ký',
                confirmButtonColor: '#6366f1'
            });
        }
    };

    const handleReject = async (registrationId) => {
        const { value: reason } = await Swal.fire({
            icon: 'question',
            title: 'Từ chối đăng ký?',
            text: 'Vui lòng nhập lý do từ chối',
            input: 'textarea',
            inputPlaceholder: 'Nhập lý do từ chối...',
            showCancelButton: true,
            confirmButtonText: 'Từ chối',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            inputValidator: (value) => {
                if (!value) return 'Vui lòng nhập lý do từ chối';
                return true;
            }
        });

        if (!reason) return;

        try {
            await axiosClient.put(`/api/staff/registrations/${registrationId}/reject`, { reason });
            await Swal.fire({
                icon: 'success',
                title: 'Đã từ chối',
                text: 'Đã từ chối đăng ký học viên',
                timer: 2000,
                showConfirmButton: false
            });
            fetchRegistrations();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể từ chối đăng ký',
                confirmButtonColor: '#6366f1'
            });
        }
    };

    const handleViewDetail = (registration) => {
        setSelectedRegistration(registration);
        setShowDetailModal(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Chờ xử lý', icon: Clock },
            approved: { color: 'bg-green-100 text-green-700', label: 'Đã duyệt', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-700', label: 'Đã từ chối', icon: XCircle }
        };
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesStatus = filter.status === 'all' || reg.status === filter.status;
        const matchesCourse = filter.course === 'all' || reg.courseId === filter.course;
        const matchesSearch = filter.search === '' ||
            reg.fullName?.toLowerCase().includes(filter.search.toLowerCase()) ||
            reg.email?.toLowerCase().includes(filter.search.toLowerCase()) ||
            reg.phone?.includes(filter.search);

        return matchesStatus && matchesCourse && matchesSearch;
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-white" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Duyệt Đăng Ký</h2>
                        <p className="text-purple-100 text-sm">Quản lý và duyệt đăng ký học viên</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Đã từ chối</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={filter.course}
                            onChange={(e) => setFilter({ ...filter, course: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">Tất cả khóa học</option>
                            {/* Options will be loaded from API */}
                        </select>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, SĐT..."
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Registrations Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học viên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đăng ký</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nguồn</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                </td>
                            </tr>
                        ) : filteredRegistrations.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Không có đăng ký nào
                                </td>
                            </tr>
                        ) : (
                            filteredRegistrations.map((reg) => (
                                <tr key={reg.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{reg.fullName}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {reg.email}
                                                </p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {reg.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{reg.courseName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(reg.registrationDate).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(reg.status)}
                                        {reg.rejectionReason && (
                                            <p className="text-xs text-red-600 mt-1">{reg.rejectionReason}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                                            reg.source === 'web' ? 'bg-blue-100 text-blue-700' :
                                            reg.source === 'ocr' ? 'bg-purple-100 text-purple-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {reg.source === 'web' ? 'Website' :
                                             reg.source === 'ocr' ? 'OCR' :
                                             reg.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewDetail(reg)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {reg.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(reg.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                        title="Duyệt"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(reg.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                        title="Từ chối"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedRegistration && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">Chi tiết đăng ký</h3>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Personal Info */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Thông tin cá nhân
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Họ tên:</span>
                                        <span className="ml-2 font-medium">{selectedRegistration.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Ngày sinh:</span>
                                        <span className="ml-2 font-medium">{selectedRegistration.dateOfBirth || 'Chưa cung cấp'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Email:</span>
                                        <span className="ml-2 font-medium">{selectedRegistration.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">SĐT:</span>
                                        <span className="ml-2 font-medium">{selectedRegistration.phone}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Địa chỉ:</span>
                                        <span className="ml-2 font-medium">{selectedRegistration.address || 'Chưa cung cấp'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Course Info */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                    Thông tin khóa học
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Khóa học:</span>
                                        <span className="ml-2 font-medium">{selectedRegistration.courseName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Ngày đăng ký:</span>
                                        <span className="ml-2 font-medium">
                                            {new Date(selectedRegistration.registrationDate).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            {selectedRegistration.note && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Ghi chú</h4>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                        {selectedRegistration.note}
                                    </p>
                                </div>
                            )}

                            {/* OCR Result */}
                            {selectedRegistration.ocrResult && (
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Kết quả OCR
                                    </h4>
                                    <p className="text-sm text-purple-800">
                                        Độ chính xác: {selectedRegistration.ocrConfidence}%
                                    </p>
                                </div>
                            )}

                            {/* Warning if pending */}
                            {selectedRegistration.status === 'pending' && (
                                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-yellow-900">Chờ xử lý</p>
                                            <p className="text-sm text-yellow-800 mt-1">
                                                Hãy kiểm tra thông tin và duyệt hoặc từ chối đăng ký này
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Đóng
                            </button>
                            {selectedRegistration.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleReject(selectedRegistration.id);
                                        }}
                                        className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                                    >
                                        Từ chối
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleApprove(selectedRegistration.id);
                                        }}
                                        className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                                    >
                                        Duyệt
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistrationApprovals;
