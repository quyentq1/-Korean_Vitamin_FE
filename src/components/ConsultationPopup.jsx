import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import consultationService from '../services/consultationService';

const ConsultationPopup = ({ isOpen, onClose, onSubmit }) => {
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        contactTime: 'afternoon',
        message: '',
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess, onClose]);

    const sanitizeValue = (name, value) => {
        switch (name) {
            case 'fullName':
                return value
                    .replace(/\s+/g, ' ')
                    .replace(/^\s+/g, '');
            case 'email':
                return value.replace(/\s/g, '').toLowerCase();
            case 'phone':
                return value.replace(/[^\d]/g, '').slice(0, 10);
            case 'message':
                return value.replace(/^\s+/g, '');
            default:
                return value;
        }
    };

    const validateField = (name, value) => {
        const trimmedValue = typeof value === 'string' ? value.trim() : value;

        switch (name) {
            case 'fullName': {
                if (!trimmedValue) {
                    return t('consultation.errorNameRequired', 'Vui lòng nhập họ và tên');
                }

                if (trimmedValue.length < 2) {
                    return t('consultation.errorNameTooShort', 'Họ và tên phải có ít nhất 2 ký tự');
                }

                if (trimmedValue.length > 50) {
                    return t('consultation.errorNameTooLong', 'Họ và tên không được vượt quá 50 ký tự');
                }

                // Chỉ cho phép chữ cái tiếng Việt, khoảng trắng
                if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(trimmedValue)) {
                    return t(
                        'consultation.errorNameInvalid',
                        'Họ và tên không được chứa số hoặc ký tự đặc biệt'
                    );
                }

                // Không cho nhập toàn khoảng trắng hoặc quá nhiều khoảng trắng liên tiếp
                if (/\s{2,}/.test(value)) {
                    return t(
                        'consultation.errorNameSpacing',
                        'Họ và tên không được chứa quá nhiều khoảng trắng liên tiếp'
                    );
                }

                return '';
            }

            case 'email': {
                if (!trimmedValue) {
                    return t('consultation.errorEmailRequired', 'Vui lòng nhập email');
                }

                if (trimmedValue.length > 100) {
                    return t('consultation.errorEmailTooLong', 'Email không được vượt quá 100 ký tự');
                }

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
                    return t('consultation.errorEmailInvalid', 'Email không đúng định dạng');
                }

                if (trimmedValue.includes('..')) {
                    return t(
                        'consultation.errorEmailConsecutiveDots',
                        'Email không được chứa 2 dấu chấm liên tiếp'
                    );
                }

                return '';
            }

            case 'phone': {
                if (!trimmedValue) {
                    return t('consultation.errorPhoneRequired', 'Vui lòng nhập số điện thoại');
                }

                if (!/^0\d+$/.test(trimmedValue)) {
                    return t(
                        'consultation.errorPhoneStartZero',
                        'Số điện thoại phải bắt đầu bằng số 0'
                    );
                }

                if (trimmedValue.length < 10) {
                    return t(
                        'consultation.errorPhoneTooShort',
                        'Số điện thoại phải gồm đúng 10 chữ số'
                    );
                }

                if (trimmedValue.length > 10) {
                    return t(
                        'consultation.errorPhoneTooLong',
                        'Số điện thoại không được vượt quá 10 chữ số'
                    );
                }

                if (!/^0\d{9}$/.test(trimmedValue)) {
                    return t(
                        'consultation.errorPhoneInvalid',
                        'Số điện thoại không hợp lệ, vui lòng nhập 10 số và bắt đầu bằng 0'
                    );
                }

                return '';
            }

            case 'message': {
                if (trimmedValue && trimmedValue.length > 500) {
                    return t(
                        'consultation.errorMessageTooLong',
                        'Lời nhắn không được vượt quá 500 ký tự'
                    );
                }
                return '';
            }

            default:
                return '';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        Object.keys(formData).forEach((field) => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
            }
        });

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = sanitizeValue(name, value);

        setFormData((prev) => ({
            ...prev,
            [name]: sanitizedValue,
        }));

        // Validate realtime sau khi người dùng đã chạm vào field
        if (touched[name]) {
            const error = validateField(name, sanitizedValue);
            setErrors((prev) => ({
                ...prev,
                [name]: error,
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;

        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }));

        const error = validateField(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});

        setTouched(allTouched);

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setSubmitting(true);
        try {
            // Check duplicate pending consultation
            try {
                const checkResult = await consultationService.checkPending(
                    formData.email.trim().toLowerCase(),
                    formData.phone.trim()
                );

                if (checkResult.hasPending) {
                    setSubmitting(false);
                    onClose();

                    const fieldLabel = checkResult.field === 'email'
                        ? formData.email.trim()
                        : formData.phone.trim();
                    const fieldType = checkResult.field === 'email' ? t('component.consultation.email') : t('component.consultation.phone');

                    Swal.fire({
                        icon: 'warning',
                        title: t('component.consultation.alreadyRequested', 'Đã gửi yêu cầu trước đó'),
                        html: `<strong>${fieldType}</strong> <em>${fieldLabel}</em> ${t('component.consultation.pendingRequest', 'đã có đơn tư vấn đang chờ xử lý.<br>Vui lòng đợi nhân viên liên hệ lại nhé!')}`,
                        confirmButtonText: t('component.consultation.understood', 'Đã hiểu'),
                        confirmButtonColor: '#3b82f6',
                    });
                    return;
                }
            } catch (checkError) {
                console.warn('Check pending failed, proceeding with submission:', checkError);
            }

            await onSubmit({
                ...formData,
                fullName: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                message: formData.message.trim(),
            });

            setShowSuccess(true);
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                contactTime: 'afternoon',
                message: '',
            });
            setErrors({});
            setTouched({});
        } catch (error) {
            console.error('Error submitting consultation:', error);
            setErrors({
                submit: t('consultation.errorSubmit', 'Có lỗi xảy ra. Vui lòng thử lại!')
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-up overflow-hidden">
                {showSuccess ? (
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            {t('consultation.successTitle', 'Đăng Ký Tư Vấn Thành Công!')}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {t('consultation.successMessage', 'Cảm ơn bạn đã đăng ký! Nhân viên tư vấn sẽ liên hệ hỗ trợ trong vòng 24 giờ.')}
                        </p>
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📞</span>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-green-800">
                                        {t('consultation.contactInfo', 'Thông tin liên hệ:')}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        Hotline: 1900 xxxx | Email: support@koreanvitamin.com
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-lg transition active:scale-95"
                        >
                            {t('consultation.close', 'Đóng')}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                            <h2 className="text-2xl font-bold mb-1">
                                {t('consultation.title', 'Đăng Ký Tư Vấn')}
                            </h2>
                            <p className="text-white/90 text-sm">
                                {t('consultation.subtitle', 'Nhân viên sẽ liên hệ hỗ trợ bạn trong vòng 24 giờ')}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('consultation.fullName', 'Họ và tên')} <span className="text-error-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    maxLength={50}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                                        errors.fullName
                                            ? 'border-red-500 focus:ring-red-200'
                                            : 'border-gray-200 focus:ring-primary-500/20'
                                    }`}
                                    placeholder={t('consultation.fullNamePlaceholder', 'Nguyễn Văn A')}
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('consultation.email', 'Email')} <span className="text-error-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    maxLength={100}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                                        errors.email
                                            ? 'border-red-500 focus:ring-red-200'
                                            : 'border-gray-200 focus:ring-primary-500/20'
                                    }`}
                                    placeholder="example@email.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('consultation.phone', 'Số điện thoại')} <span className="text-error-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    inputMode="numeric"
                                    maxLength={10}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                                        errors.phone
                                            ? 'border-red-500 focus:ring-red-200'
                                            : 'border-gray-200 focus:ring-primary-500/20'
                                    }`}
                                    placeholder="0869627078"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('consultation.contactTime', 'Thời gian liên hệ')}
                                </label>
                                <select
                                    name="contactTime"
                                    value={formData.contactTime}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition"
                                >
                                    <option value="morning">{t('consultation.morning', 'Buổi Sáng (8h-12h)')}</option>
                                    <option value="afternoon">{t('consultation.afternoon', 'Buổi Chiều (13h-17h)')}</option>
                                    <option value="evening">{t('consultation.evening', 'Buổi Tối (18h-20h)')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('consultation.message', 'Lời nhắn')} <span className="text-gray-400 text-xs">(optional)</span>
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    rows="3"
                                    maxLength={500}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition resize-none ${
                                        errors.message
                                            ? 'border-red-500 focus:ring-red-200'
                                            : 'border-gray-200 focus:ring-primary-500/20'
                                    }`}
                                    placeholder={t('consultation.messagePlaceholder', 'Nhập ghi chú hoặc yêu cầu của bạn...')}
                                />
                                {errors.message && (
                                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                                )}
                            </div>

                            {errors.submit && (
                                <p className="text-red-500 text-sm">{errors.submit}</p>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                                >
                                    {t('consultation.cancel', 'Hủy')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting
                                        ? t('consultation.submitting', 'Đang gửi...')
                                        : t('consultation.submit', 'Yêu Cầu Tư Vấn')}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConsultationPopup;