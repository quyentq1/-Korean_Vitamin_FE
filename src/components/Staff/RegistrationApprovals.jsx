import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Eye, Search, Filter, FileText, Phone, Mail, Calendar, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
                title: t('common.error'),
                text: t('staff.registrationApprovals.loadError'),
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (registrationId) => {
        const result = await Swal.fire({
            icon: 'question',
            title: t('staff.registrationApprovals.approveTitle'),
            text: t('staff.registrationApprovals.approveText'),
            showCancelButton: true,
            confirmButtonText: t('staff.registrationApprovals.approve'),
            cancelButtonText: t('common.cancel'),
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7280'
        });

        if (!result.isConfirmed) return;

        try {
            await axiosClient.put(`/api/staff/registrations/${registrationId}/approve`);
            await Swal.fire({
                icon: 'success',
                title: t('staff.registrationApprovals.approvedTitle'),
                text: t('staff.registrationApprovals.approvedText'),
                timer: 2000,
                showConfirmButton: false
            });
            fetchRegistrations();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: t('common.error'),
                text: error.response?.data?.message || t('staff.registrationApprovals.approveError'),
                confirmButtonColor: '#6366f1'
            });
        }
    };

    const handleReject = async (registrationId) => {
        const { value: reason } = await Swal.fire({
            icon: 'question',
            title: t('staff.registrationApprovals.rejectTitle'),
            text: t('staff.registrationApprovals.rejectText'),
            input: 'textarea',
            inputPlaceholder: t('staff.registrationApprovals.rejectPlaceholder'),
            showCancelButton: true,
            confirmButtonText: t('staff.registrationApprovals.reject'),
            cancelButtonText: t('common.cancel'),
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            inputValidator: (value) => {
                if (!value) return t('staff.registrationApprovals.rejectReasonRequired');
                return true;
            }
        });

        if (!reason) return;

        try {
            await axiosClient.put(`/api/staff/registrations/${registrationId}/reject`, { reason });
            await Swal.fire({
                icon: 'success',
                title: t('staff.registrationApprovals.rejectedTitle'),
                text: t('staff.registrationApprovals.rejectedText'),
                timer: 2000,
                showConfirmButton: false
            });
            fetchRegistrations();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: t('common.error'),
                text: t('staff.registrationApprovals.rejectError'),
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
            pending: { color: 'bg-yellow-100 text-yellow-700', label: t('staff.registrationApprovals.statusPending'), icon: Clock },
            approved: { color: 'bg-green-100 text-green-700', label: t('staff.registrationApprovals.statusApproved'), icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-700', label: t('staff.registrationApprovals.statusRejected'), icon: XCircle }
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
                        <h2 className="text-xl font-bold text-white">{t('staff.registrationApprovals.title')}</h2>
                        <p className="text-purple-100 text-sm">{t('staff.registrationApprovals.subtitle')}</p>
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
                            <option value="all">{t('staff.registrationApprovals.allStatus')}</option>
                            <option value="pending">{t('staff.registrationApprovals.statusPending')}</option>
                            <option value="approved">{t('staff.registrationApprovals.statusApproved')}</option>
                            <option value="rejected">{t('staff.registrationApprovals.statusRejected')}</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={filter.course}
                            onChange={(e) => setFilter({ ...filter, course: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">{t('staff.registrationApprovals.allCourses')}</option>
                            {/* Options will be loaded from API */}
                        </select>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('staff.registrationApprovals.searchPlaceholder')}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.registrationApprovals.colStudent')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.registrationApprovals.colCourse')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.registrationApprovals.colDate')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.registrationApprovals.colStatus')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('staff.registrationApprovals.colSource')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('staff.registrationApprovals.colActions')}</th>
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
                                    {t('staff.registrationApprovals.noRegistrations')}
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
                                                title={t('staff.registrationApprovals.viewDetail')}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {reg.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(reg.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                        title={t('staff.registrationApprovals.approve')}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(reg.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                        title={t('staff.registrationApprovals.reject')}
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
                                <h3 className="text-xl font-semibold text-gray-900">{t('staff.registrationApprovals.detailTitle')}</h3>
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
                                    {t('staff.registrationApprovals.personalInfo')}
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">{t('staff.registrationApprovals.fullName')}:</span>
                                        <span className="ml-2 font-medium">{selectedRegistration.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">{t('staff.registrationApprovals.dob')}:</span>
                                        <span className="ml-2 font-medium">{selectedRegistration.dateOfBirth || t('staff.registrationApprovals.notProvided')}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">{t('staff.registrationApprovals.email')}:</span>
                                        <span className="ml-2 font-medium">{selectedRegistration.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">{t('staff.registrationApprovals.phone')}:</span>
                                        <span className="ml-2 font-medium">{selectedRegistration.phone}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-600">{t('staff.registrationApprovals.address')}:</span>
                                        <span className="ml-2 font-medium">{selectedRegistration.address || t('staff.registrationApprovals.notProvided')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Course Info */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                    {t('staff.registrationApprovals.courseInfo')}
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">{t('staff.registrationApprovals.course')}:</span>
                                        <span className="ml-2 font-medium">{selectedRegistration.courseName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">{t('staff.registrationApprovals.registrationDate')}:</span>
                                        <span className="ml-2 font-medium">
                                            {new Date(selectedRegistration.registrationDate).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            {selectedRegistration.note && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">{t('staff.registrationApprovals.note')}</h4>
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
                                        {t('staff.registrationApprovals.ocrResult')}
                                    </h4>
                                    <p className="text-sm text-purple-800">
                                        {t('staff.registrationApprovals.accuracy')}: {selectedRegistration.ocrConfidence}%
                                    </p>
                                </div>
                            )}

                            {/* Warning if pending */}
                            {selectedRegistration.status === 'pending' && (
                                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-yellow-900">{t('staff.registrationApprovals.pendingStatus')}</p>
                                            <p className="text-sm text-yellow-800 mt-1">
                                                {t('staff.registrationApprovals.pendingHint')}
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
                                {t('staff.registrationApprovals.close')}
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
                                        {t('staff.registrationApprovals.reject')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleApprove(selectedRegistration.id);
                                        }}
                                        className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                                    >
                                        {t('staff.registrationApprovals.approve')}
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
