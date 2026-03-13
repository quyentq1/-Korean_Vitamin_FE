import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, UserPlus, UserCheck, Crown, Trash2, AlertCircle } from 'lucide-react';
import staffService from '../../services/staffService';
import educationManagerService from '../../services/educationManagerService';
import userService from '../../services/userService';
import classService from '../../services/classService';
import Swal from 'sweetalert2';

const AssignTeacherModal = ({ classId, currentTeachers = [], onClose, onSuccess, onRemoveTeacher, userRole }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [isPrimary, setIsPrimary] = useState(false);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            // Use appropriate service based on user role
            const response = userRole === 'EDUCATION_MANAGER'
                ? await educationManagerService.getAllTeachers()
                : await userService.getUsersByRole('TEACHER');

            // Filter out teachers already assigned to this class
            const availableTeachers = response.filter(
                teacher => !currentTeachers.some(ct => ct.id === teacher.id)
            );
            setTeachers(availableTeachers);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTeacherId) {
            setErrors({ teacher: t('class.assignTeacher.errors.teacherRequired', 'Vui lòng chọn giáo viên') });
            return;
        }

        try {
            setLoading(true);

            // Use appropriate service based on user role
            if (userRole === 'EDUCATION_MANAGER') {
                await educationManagerService.assignTeacherToClass(classId, selectedTeacherId, isPrimary);
            } else {
                await staffService.assignTeacherToClass(classId, selectedTeacherId, isPrimary);
            }

            onSuccess?.();
        } catch (error) {
            console.error('Error assigning teacher:', error);
            if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else {
                setErrors({ submit: t('class.assignTeacher.errors.assignFailed', 'Không thể gán giáo viên. Vui lòng thử lại.') });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveTeacher = async (teacherId, teacherName) => {
        const result = await Swal.fire({
            title: 'Loại Bỏ Giáo Viên?',
            text: `Bạn có chắc muốn loại bỏ ${teacherName} khỏi lớp học này?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f56565',
            cancelButtonColor: '#667eea',
            confirmButtonText: 'Loại bỏ',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await classService.removeTeacher(classId, teacherId);
                Swal.fire({
                    icon: 'success',
                    title: 'Đã Loại Bỏ',
                    text: 'Giáo viên đã được loại bỏ khỏi lớp học',
                    timer: 1500,
                    showConfirmButton: false
                });
                onRemoveTeacher?.();
            } catch (error) {
                console.error('Error removing teacher:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: error.response?.data?.message || 'Không thể loại bỏ giáo viên'
                });
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        {currentTeachers.length > 0
                            ? t('class.assignTeacher.changeTitle', 'Đổi Giáo Viên')
                            : t('class.assignTeacher.title', 'Gán Giáo Viên Vào Lớp')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Current Teachers */}
                    {currentTeachers.length > 0 && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('class.assignTeacher.currentTeachers', 'Giáo viên hiện tại:')}
                            </label>
                            <div className="space-y-2">
                                {currentTeachers.map((teacher, index) => (
                                    <div
                                        key={teacher.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                                    >
                                        <div className="flex items-center gap-2">
                                            {teacher.isPrimary && <Crown className="w-4 h-4 text-yellow-500" />}
                                            <div>
                                                <p className="font-medium text-gray-900">{teacher.fullName || teacher.username}</p>
                                                <p className="text-sm text-gray-500">{teacher.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                {teacher.isPrimary
                                                    ? t('class.assignTeacher.primary', 'Chính')
                                                    : t('class.assignTeacher.secondary', 'Phụ')}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTeacher(teacher.id, teacher.fullName || teacher.username)}
                                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Loại bỏ giáo viên"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Teacher Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {currentTeachers.length > 0
                                ? t('class.assignTeacher.selectNewTeacher', 'Chọn giáo viên mới')
                                : t('class.assignTeacher.selectTeacher', 'Chọn giáo viên')
                            } <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedTeacherId}
                            onChange={(e) => {
                                setSelectedTeacherId(e.target.value);
                                if (errors.teacher) {
                                    setErrors({});
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">{t('class.assignTeacher.selectPlaceholder', 'Chọn giáo viên...')}</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.fullName || teacher.username} ({teacher.email})
                                </option>
                            ))}
                        </select>
                        {errors.teacher && (
                            <p className="mt-1 text-sm text-red-600">{errors.teacher}</p>
                        )}
                    </div>

                    {/* Is Primary Checkbox */}
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <input
                            type="checkbox"
                            id="isPrimary"
                            checked={isPrimary}
                            onChange={(e) => setIsPrimary(e.target.checked)}
                            className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <label htmlFor="isPrimary" className="flex items-center gap-2 cursor-pointer">
                            <Crown className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-900">
                                {t('class.assignTeacher.isPrimary', 'Giáo viên chính')}
                            </span>
                        </label>
                        <p className="text-xs text-gray-600 ml-6">
                            {t('class.assignTeacher.isPrimaryHint', 'Giáo viên chính có trách nhiệm chính trong lớp')}
                        </p>
                    </div>

                    {/* Warning when replacing teacher */}
                    {currentTeachers.length > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-orange-900">
                                    {t('class.assignTeacher.replaceWarning', 'Thay thế giáo viên hiện tại')}
                                </p>
                                <p className="text-xs text-orange-700 mt-1">
                                    {t('class.assignTeacher.replaceWarningHint', 'Giáo viên hiện tại sẽ bị thay thế và có thể được gán vào lớp khác.')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* No Teachers Available */}
                    {teachers.length === 0 && !selectedTeacherId && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                            <UserCheck className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">
                                {t('class.assignTeacher.noTeachers', 'Không có giáo viên nào khả dụng. Tất cả giáo viên đã được gán vào lớp này.')}
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{errors.submit}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('common.cancel', 'Hủy')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || teachers.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? t('common.assigning', 'Đang xử lý...')
                                : currentTeachers.length > 0
                                    ? t('class.assignTeacher.changeSubmit', 'Đổi Giáo Viên')
                                    : t('class.assignTeacher.submit', 'Gán Giáo Viên')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignTeacherModal;
