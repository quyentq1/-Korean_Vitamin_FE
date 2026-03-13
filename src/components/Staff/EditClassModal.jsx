import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Users, MapPin } from 'lucide-react';
import staffService from '../../services/staffService';
import courseService from '../../services/courseService';

const EditClassModal = ({ classData, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [courses, setCourses] = useState([]);

    const [formData, setFormData] = useState({
        courseId: '',
        classCode: '',
        className: '',
        capacity: 30,
        startDate: '',
        endDate: '',
        room: '',
        status: 'PLANNED'
    });

    useEffect(() => {
        fetchCourses();
        if (classData) {
            setFormData({
                courseId: classData.courseId || '',
                classCode: classData.classCode || '',
                className: classData.className || '',
                capacity: classData.capacity || 30,
                startDate: classData.startDate ? classData.startDate.split('T')[0] : '',
                endDate: classData.endDate ? classData.endDate.split('T')[0] : '',
                room: classData.room || '',
                status: classData.status || 'PLANNED'
            });
        }
    }, [classData]);

    const fetchCourses = async () => {
        try {
            const response = await courseService.getAllCourses();
            const activeCourses = response.filter(c => c.status === 'PUBLISHED' || c.isActive);
            setCourses(activeCourses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.courseId) {
            newErrors.courseId = t('class.edit.errors.courseRequired', 'Vui lòng chọn khóa học');
        }
        if (!formData.classCode) {
            newErrors.classCode = t('class.edit.errors.codeRequired', 'Vui lòng nhập mã lớp');
        }
        if (!formData.className) {
            newErrors.className = t('class.edit.errors.nameRequired', 'Vui lòng nhập tên lớp');
        }
        if (!formData.capacity || formData.capacity <= 0) {
            newErrors.capacity = t('class.edit.errors.capacityInvalid', 'Sĩ số phải lớn hơn 0');
        }
        if (!formData.startDate) {
            newErrors.startDate = t('class.edit.errors.startDateRequired', 'Vui lòng chọn ngày bắt đầu');
        }
        if (!formData.endDate) {
            newErrors.endDate = t('class.edit.errors.endDateRequired', 'Vui lòng chọn ngày kết thúc');
        }
        if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
            newErrors.endDate = t('class.edit.errors.endDateAfterStart', 'Ngày kết thúc phải sau ngày bắt đầu');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const { courseId, ...restFormData } = formData;
            const payload = {
                ...restFormData,
                course: { id: courseId }
            };

            await staffService.updateClass(classData.id, payload);

            onSuccess?.();
        } catch (error) {
            console.error('Error updating class:', error);
            if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else {
                setErrors({ submit: t('class.edit.errors.updateFailed', 'Không thể cập nhật lớp học. Vui lòng thử lại.') });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {t('class.edit.title', 'Cập Nhật Thông Tin Lớp')}
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
                    {/* Course Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('class.edit.course', 'Khóa học')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="courseId"
                            value={formData.courseId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">{t('class.edit.selectCourse', 'Chọn khóa học')}</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name} ({course.code})
                                </option>
                            ))}
                        </select>
                        {errors.courseId && (
                            <p className="mt-1 text-sm text-red-600">{errors.courseId}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Class Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('class.edit.code', 'Mã lớp')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="classCode"
                                value={formData.classCode}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.classCode && (
                                <p className="mt-1 text-sm text-red-600">{errors.classCode}</p>
                            )}
                        </div>

                        {/* Class Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('class.edit.name', 'Tên lớp')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="className"
                                value={formData.className}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.className && (
                                <p className="mt-1 text-sm text-red-600">{errors.className}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Capacity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Users className="w-4 h-4 inline mr-1" />
                                {t('class.edit.capacity', 'Sĩ số')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                min="1"
                                max="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.capacity && (
                                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
                            )}
                        </div>

                        {/* Room */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                {t('class.edit.room', 'Phòng học')}
                            </label>
                            <input
                                type="text"
                                name="room"
                                value={formData.room}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.room && (
                                <p className="mt-1 text-sm text-red-600">{errors.room}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {t('class.edit.startDate', 'Ngày bắt đầu')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.startDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                            )}
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {t('class.edit.endDate', 'Ngày kết thúc')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                min={formData.startDate || new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.endDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('class.edit.status', 'Trạng thái')}
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="PLANNED">{t('class.status.planned', 'Đã lên lịch')}</option>
                            <option value="ONGOING">{t('class.status.ongoing', 'Đang hoạt động')}</option>
                            <option value="COMPLETED">{t('class.status.completed', 'Đã kết thúc')}</option>
                            <option value="CANCELLED">{t('class.status.cancelled', 'Đã hủy')}</option>
                        </select>
                    </div>

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
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('common.updating', 'Đang cập nhật...') : t('class.edit.submit', 'Cập Nhật')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClassModal;
