import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import userService from '../../services/userService';

const ManualStudentForm = ({ onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        address: '',
        course: 'TOPIK I',
        expirationDate: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = t('validation.required', 'Bắt buộc nhập');
        if (!formData.email.trim()) newErrors.email = t('validation.required', 'Bắt buộc nhập');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('validation.email', 'Email không hợp lệ');

        if (!formData.phone.trim()) newErrors.phone = t('validation.required', 'Bắt buộc nhập');
        if (!formData.expirationDate) newErrors.expirationDate = t('validation.required', 'Bắt buộc nhập');

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSubmitting(true);
        try {
            await userService.createStudent({
                ...formData,
                username: formData.email, // Auto-generate username from email
                password: 'password123',  // Default password
            });
            onSuccess();
        } catch (error) {
            console.error('Error creating student:', error);
            alert(error.response?.data?.message || 'Failed to create student');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('studentMgmt.fullName', 'Họ và tên')} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('studentMgmt.email', 'Email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('studentMgmt.phone', 'Số điện thoại')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
            </div>

            {/* DOB & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('studentMgmt.dob', 'Ngày sinh')}
                    </label>
                    <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('studentMgmt.address', 'Địa chỉ')}
                    </label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>
            </div>

            {/* Course & Expiration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('studentMgmt.course', 'Khóa học')}
                    </label>
                    <select
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                        <option value="TOPIK I">TOPIK I</option>
                        <option value="TOPIK II Intermediate">TOPIK II Intermediate</option>
                        <option value="TOPIK II Advanced">TOPIK II Advanced</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('studentMgmt.expirationDate', 'Ngày hết hạn')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.expirationDate ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.expirationDate && <p className="text-red-500 text-xs mt-1">{errors.expirationDate}</p>}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                    {t('common.cancel', 'Hủy')}
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium shadow-md disabled:opacity-50"
                >
                    {submitting ? t('common.saving', 'Đang lưu...') : t('common.save', 'Lưu Học Viên')}
                </button>
            </div>
        </form>
    );
};

export default ManualStudentForm;
