import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User, Mail, Phone, MapPin, Calendar, Loader2, ArrowLeft,
    Save, XCircle, Upload, Image as ImageIcon
} from 'lucide-react';
import Swal from 'sweetalert2';
import staffService from '../../services/staffService';

/**
 * Edit Student Page
 * Form to edit student information
 */
const EditStudent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id: studentId } = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [student, setStudent] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        gender: 'MALE',
        email: '',
        phone: '',
        address: '',
        avatar: ''
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    // Fetch student data on mount
    useEffect(() => {
        const fetchStudent = async () => {
            try {
                setLoading(true);
                const response = await staffService.getStudentDetails(studentId);
                setStudent(response);

                // Populate form
                setFormData({
                    fullName: response.fullName || '',
                    dateOfBirth: response.dateOfBirth || '',
                    gender: response.gender ? response.gender.toUpperCase() : 'MALE',
                    email: response.email || '',
                    phone: response.phone || '',
                    address: response.address || '',
                    avatar: response.avatar || ''
                });
            } catch (error) {
                console.error('Error fetching student:', error);
                Swal.fire({
                    icon: 'error',
                    title: t('editStudent.error', 'Lỗi'),
                    text: t('editStudent.cannotLoadStudent', 'Không thể tải thông tin học viên'),
                    confirmButtonColor: '#667eea',
                }).then(() => {
                    navigate('/student-management');
                });
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            fetchStudent();
        }
    }, [studentId, navigate]);

    // Handle avatar upload
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingAvatar(true);
            const response = await staffService.uploadStudentAvatar(file);
            setFormData(prev => ({ ...prev, avatar: response.data?.url || response.url }));
            Swal.fire({
                icon: 'success',
                title: t('editStudent.success', 'Thành công'),
                text: t('editStudent.avatarUploaded', 'Đã tải lên ảnh đại diện'),
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: t('editStudent.error', 'Lỗi'),
                text: t('editStudent.avatarUploadFailed', 'Không thể tải lên ảnh đại diện'),
                confirmButtonColor: '#667eea',
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Handle input change
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = t('editStudent.fullNameRequired', 'Họ và tên là bắt buộc');
        }
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = t('editStudent.dobRequired', 'Ngày sinh là bắt buộc');
        }
        if (!formData.email.trim()) {
            newErrors.email = t('editStudent.emailRequired', 'Email là bắt buộc');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('editStudent.emailInvalid', 'Email không hợp lệ');
        }
        if (!formData.phone.trim()) {
            newErrors.phone = t('editStudent.phoneRequired', 'Số điện thoại là bắt buộc');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            await staffService.updateStudent(studentId, formData);

            Swal.fire({
                icon: 'success',
                title: t('editStudent.success', 'Thành công'),
                text: t('editStudent.studentUpdated', 'Đã cập nhật thông tin học viên'),
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                navigate(`/student-management/${studentId}`);
            });
        } catch (error) {
            console.error('Error updating student:', error);
            Swal.fire({
                icon: 'error',
                title: t('editStudent.error', 'Lỗi'),
                text: error.message || t('editStudent.cannotUpdate', 'Không thể cập nhật thông tin'),
                confirmButtonColor: '#667eea',
            });
        } finally {
            setSaving(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        navigate(`/student-management/${studentId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t('common.back')}
                </button>

                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 group">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Avatar" className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-100" />
                        ) : (
                            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-sm">
                                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                            </div>
                        )}

                        <label className={`absolute inset-0 bg-black/50 rounded-xl cursor-pointer flex flex-col items-center justify-center text-white transition-opacity ${uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {uploadingAvatar ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Upload className="w-6 h-6" />
                            )}
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
                        </label>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t('editStudent.title', 'Chỉnh sửa học viên')}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {student?.fullName} • {student?.studentCode || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            {t('editStudent.personalInfo', 'Thông tin cá nhân')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('editStudent.fullName', 'Họ và tên')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    placeholder={t('editStudent.fullNamePlaceholder', 'Nhập họ và tên')}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                />
                                {errors.fullName && (
                                    <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                        <XCircle className="w-3 h-3" />
                                        {errors.fullName}
                                    </div>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('editStudent.dob', 'Ngày sinh')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                />
                                {errors.dateOfBirth && (
                                    <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                        <XCircle className="w-3 h-3" />
                                        {errors.dateOfBirth}
                                    </div>
                                )}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('editStudent.gender', 'Giới tính')}
                                </label>
                                <div className="flex gap-3">
                                    {['MALE', 'FEMALE', 'OTHER'].map((gender) => (
                                        <label
                                            key={gender}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl cursor-pointer transition-all ${formData.gender === gender
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={gender}
                                                checked={formData.gender === gender}
                                                onChange={(e) => handleChange('gender', e.target.value)}
                                                className="hidden"
                                            />
                                            <span className="capitalize">
                                                {gender === 'MALE' ? t('editStudent.male', 'Nam') : gender === 'FEMALE' ? t('editStudent.female', 'Nữ') : t('editStudent.other', 'Khác')}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('editStudent.email', 'Email')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        placeholder="email@example.com"
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 outline-none transition-all"
                                    />
                                </div>
                                {errors.email && (
                                    <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                        <XCircle className="w-3 h-3" />
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('editStudent.phone', 'Số điện thoại')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="0xxxxxxxxx"
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                            }`}
                                    />
                                </div>
                                {errors.phone && (
                                    <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                        <XCircle className="w-3 h-3" />
                                        {errors.phone}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Address - Full width */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('editStudent.address', 'Địa chỉ')}
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder={t('editStudent.addressPlaceholder', 'Nhập địa chỉ')}
                                    rows={3}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Warning Note */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 text-yellow-600 mt-0.5">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-yellow-900">{t('editStudent.warning', 'Lưu ý')}</h4>
                                <p className="text-sm text-yellow-800 mt-1">
                                    {t('editStudent.warningText', 'Thay đổi thông tin cá nhân có thể ảnh hưởng đến các dữ liệu liên quan như điểm danh, báo cáo. Vui lòng kiểm tra kỹ trước khi lưu.')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                            disabled={saving}
                        >
                            {t('common.cancel', 'Hủy')}
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('editStudent.saving', 'Đang lưu...')}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {t('editStudent.saveChanges', 'Lưu thay đổi')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStudent;
