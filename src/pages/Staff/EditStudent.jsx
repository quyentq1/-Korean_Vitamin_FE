import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User, Mail, Phone, ChevronLeft, Save, X,
    CheckCircle, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import staffService from '../../services/staffService';

/**
 * Edit Student Page
 * Staff can edit student information
 */
const EditStudent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { studentId } = useParams();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        avatar: '',
        notes: ''
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Debug: log studentId from URL
        console.log('EditStudent - studentId from useParams:', studentId);
        console.log('EditStudent - studentId type:', typeof studentId);
        console.log('EditStudent - studentId === undefined:', studentId === undefined);
        console.log('EditStudent - studentId === "undefined":', studentId === 'undefined');

        // Validate studentId before fetching
        if (!studentId || studentId === 'undefined' || studentId === undefined) {
            console.error('EditStudent - Invalid studentId detected:', studentId);
            setError('ID học viên không hợp lệ');
            setLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'ID học viên không hợp lệ',
                confirmButtonColor: '#667eea',
            }).then(() => {
                navigate('/student-management');
            });
            return;
        }

        const fetchStudentDetails = async () => {
            try {
                setLoading(true);
                const response = await staffService.getStudentDetails(studentId);
                setStudent(response);
                setFormData({
                    fullName: response.fullName || '',
                    email: response.email || '',
                    phone: response.phone || '',
                    avatar: response.avatar || '',
                    notes: response.notes || ''
                });
            } catch (error) {
                console.error('Error fetching student details:', error);
                setError(error.message || 'Không thể tải thông tin học viên');
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: error.message || 'Không thể tải thông tin học viên',
                    confirmButtonColor: '#667eea',
                }).then(() => {
                    navigate('/student-management');
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStudentDetails();
    }, [studentId]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName || formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (!formData.phone || !/^[0-9]{10,11}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
        }
        if (formData.notes && formData.notes.length > 500) {
            newErrors.notes = 'Ghi chú không được quá 500 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            Swal.fire({
                icon: 'warning',
                title: 'Dữ liệu không hợp lệ',
                text: 'Vui lòng kiểm tra lại các thông tin',
                confirmButtonColor: '#667eea',
            });
            return;
        }

        try {
            setSaving(true);
            await staffService.updateStudent(studentId, formData);

            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Thông tin học viên đã được cập nhật',
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                navigate(`/student-management/${studentId}`);
            });
        } catch (error) {
            console.error('Error updating student:', error);

            const errorMsg = error.message || 'Không thể cập nhật thông tin học viên';
            const isValidationError = errorMsg.includes('Dữ liệu không hợp lệ');

            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                [isValidationError ? 'html' : 'text']: errorMsg.replace(/\n/g, '<br/>'),
                confirmButtonColor: '#667eea',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/student-management/${studentId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Quay lại</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Chỉnh Sửa Học Viên</h1>
                    <p className="text-gray-500 mt-1">{student?.studentCode || 'N/A'}</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                            {formData.avatar ? (
                                <img
                                    src={formData.avatar}
                                    alt={formData.fullName}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl">
                                    {formData.fullName?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{formData.fullName}</h3>
                                <p className="text-gray-500 text-sm">{formData.email}</p>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Thông Tin Cá Nhân
                            </h3>
                            <div className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Họ và Tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                            errors.fullName
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-200'
                                        }`}
                                        placeholder="Nhập họ và tên đầy đủ"
                                    />
                                    {errors.fullName && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.fullName}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                            errors.email
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-200'
                                        }`}
                                        placeholder="example@email.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Số Điện Thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                            errors.phone
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-200'
                                        }`}
                                        placeholder="09xxxxxxxxx"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Avatar URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Ảnh Đại Diện (URL)
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.avatar}
                                        onChange={(e) => handleInputChange('avatar', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">Để trống nếu không muốn đổi ảnh</p>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Ghi Chú
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        rows={4}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${
                                            errors.notes
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-200'
                                        }`}
                                        placeholder="Nhập ghi chú về học viên..."
                                    />
                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.notes}
                                        </p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        {formData.notes.length}/500 ký tự
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                                        <span>Đang lưu...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Lưu Thay Đổi</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <X className="w-4 h-4" />
                                <span>Hủy</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditStudent;
