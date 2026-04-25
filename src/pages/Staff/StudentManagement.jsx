import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Search, Plus, UserPlus, Scan, Filter, ChevronLeft, ChevronRight,
    Eye, Edit, Ban, CheckCircle, Loader2, Mail, Phone
} from 'lucide-react';
import Swal from 'sweetalert2';
import staffService from '../../services/staffService';

/**
 * Student Management Page
 * Features: List, Search, Filter, Create (Manual/OCR), View, Edit, Deactivate
 */
const StudentManagement = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // State
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });

    // Filters
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Fetch students
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await staffService.getStudents({
                page: pagination.page,
                size: pagination.size,
                search: searchKeyword,
                status: statusFilter
            });

            if (response) {
                setStudents(response.students || response.content || []);
                setPagination({
                    page: response.pageable?.pageNumber || 0,
                    size: response.pageable?.pageSize || 10,
                    totalElements: response.totalElements || 0,
                    totalPages: response.totalPages || 0
                });
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            Swal.fire({
                icon: 'error',
                title: t('errors.error') || 'Lỗi',
                text: error.message || t('errors.tryAgain') || 'Vui lòng thử lại',
                confirmButtonColor: '#667eea',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [pagination.page, pagination.size]);

    // Search handler
    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 0 }));
        fetchStudents();
    };

    // Reset filters
    const handleResetFilters = () => {
        setSearchKeyword('');
        setStatusFilter('');
        setPagination(prev => ({ ...prev, page: 0 }));
        setTimeout(fetchStudents, 0);
    };

    // Toggle student status
    const handleToggleStatus = async (studentId, studentName, currentStatus) => {
        const action = currentStatus ? t('staff.students.deactivate') : t('staff.students.activate');
        const confirmText = currentStatus
            ? `${t('staff.students.deactivate')}: ${studentName}?`
            : `${t('staff.students.activate')}: ${studentName}?`;

        const result = await Swal.fire({
            icon: 'question',
            title: action,
            text: confirmText,
            showCancelButton: true,
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            confirmButtonColor: '#667eea',
        });

        if (result.isConfirmed) {
            try {
                await staffService.updateStudentStatus(studentId, !currentStatus);
                await fetchStudents();
                Swal.fire({
                    icon: 'success',
                    title: t('studentManagement.success', 'Thành công'),
                    text: t('studentManagement.statusUpdated', 'Đã {{action}} {{name}}', { action: action.toLowerCase(), name: studentName }),
                    timer: 1500,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: t('errors.error'),
                    text: error.message,
                    confirmButtonColor: '#667eea',
                });
            }
        }
    };

    // View student details
    const handleViewDetails = (studentId) => {
        console.log('handleViewDetails called with studentId:', studentId, 'Type:', typeof studentId);
        if (!studentId || studentId === 'undefined') {
            console.error('Invalid studentId:', studentId);
            return;
        }
        navigate(`/student-management/${studentId}`);
    };

    // Edit student
    const handleEditStudent = (studentId) => {
        console.log('handleEditStudent called with studentId:', studentId, 'Type:', typeof studentId);
        if (!studentId || studentId === 'undefined') {
            console.error('Invalid studentId:', studentId);
            return;
        }
        navigate(`/student-management/${studentId}/edit`);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('staff.students.title')}</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {t('staff.students.title').toLowerCase()} • {pagination.totalElements} {t('common.students')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/student-management/create-manual')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('staff.students.createManual')}</span>
                            <span className="sm:hidden">{t('common.create')}</span>
                        </button>
                        <button
                            onClick={() => navigate('/student-management/create-ocr')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
                        >
                            <Scan className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('staff.students.createOCR')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('staff.students.searchPlaceholder')}
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                            {t('common.search')}
                        </button>
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                            showFilters
                                ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                                : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        {t('common.filter')}
                    </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t('staff.students.status')}
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="">{t('staff.students.allStatus')}</option>
                                    <option value="active">{t('staff.students.active')}</option>
                                    <option value="inactive">{t('staff.students.inactive')}</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleResetFilters}
                                    className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                                >
                                    {t('common.reset')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="py-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : students.length > 0 ? (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            {t('staff.students.fullName')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            {t('common.email')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            {t('common.phone')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            {t('staff.students.courses')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            {t('staff.students.status')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            {t('staff.students.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map((student, index) => {
                                        // Debug log
                                        console.log(`Student [${index}]:`, student);
                                        console.log(`Student [${index}].id:`, student?.id, 'Type:', typeof student?.id);

                                        return (
                                        <tr key={student?.id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {student.avatar ? (
                                                        <img
                                                            src={student.avatar}
                                                            alt={student.fullName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                            {student.fullName?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900">{student.fullName}</div>
                                                        <div className="text-xs text-gray-500">{student.studentCode}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {student.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    {student.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">
                                                    {student.enrolledCourses || 0} {t('staff.students.courses')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {student.activeClasses || 0} {t('staff.students.activeClasses')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    student.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {student.isActive ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3" />
                                                            {t('staff.students.active')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ban className="w-3 h-3" />
                                                            {t('staff.students.inactive')}
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(student?.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title={t('staff.students.viewDetails')}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditStudent(student?.id)}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title={t('staff.students.edit')}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(student?.id, student?.fullName, student?.isActive)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            student?.isActive
                                                                ? 'text-red-600 hover:bg-red-50'
                                                                : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                        title={student?.isActive ? t('staff.students.deactivate') : t('staff.students.activate')}
                                                    >
                                                        {student?.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {students.map((student, index) => {
                                console.log(`Mobile Student [${index}]:`, student);
                                console.log(`Mobile Student [${index}].id:`, student?.id, 'Type:', typeof student?.id);

                                return (
                                <div key={student?.id || index} className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {student.avatar ? (
                                                <img
                                                    src={student.avatar}
                                                    alt={student.fullName}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                                    {student.fullName?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-semibold text-gray-900">{student.fullName}</div>
                                                <div className="text-xs text-gray-500">{student.studentCode}</div>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                            student.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {student.isActive ? t('staff.students.active') : t('staff.students.inactive')}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 mb-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {student.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            {student.phone}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => handleViewDetails(student?.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {t('staff.students.viewDetails')}
                                        </button>
                                        <button
                                            onClick={() => handleEditStudent(student?.id)}
                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(student?.id, student?.fullName, student?.isActive)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                student?.isActive
                                                    ? 'text-red-600 hover:bg-red-50'
                                                    : 'text-green-600 hover:bg-green-50'
                                            }`}
                                        >
                                            {student?.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {pagination.page * pagination.size + 1} to {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements} students
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                                        disabled={pagination.page === 0}
                                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="px-3 py-1 text-sm font-medium text-gray-700">
                                        {pagination.page + 1} / {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.page + 1, prev.totalPages - 1) }))}
                                        disabled={pagination.page >= pagination.totalPages - 1}
                                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t('staff.students.noStudentsFound')}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            {searchKeyword || statusFilter ? t('common.noData') : t('staff.students.noStudentsFound')}
                        </p>
                        {!searchKeyword && !statusFilter && (
                            <button
                                onClick={() => navigate('/student-management/create-manual')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
                            >
                                <UserPlus className="w-4 h-4" />
                                {t('staff.students.addStudent')}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentManagement;

