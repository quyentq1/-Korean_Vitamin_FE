import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ConsultationPopup Modal Component
 * Shown to guests after completing 2 free tests
 * Collects contact information for staff follow-up
 */
const ConsultationPopup = ({ isOpen, onClose, onSubmit }) => {
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        contactTime: 'afternoon',
        message: '',
        testInterested: 'test-3',
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = t('consultation.errorName', 'Vui lòng nhập họ tên');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('consultation.errorEmail', 'Vui lòng nhập email');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('consultation.errorEmailInvalid', 'Email không hợp lệ');
        }

        if (!formData.phone.trim()) {
            newErrors.phone = t('consultation.errorPhone', 'Vui lòng nhập số điện thoại');
        } else if (!/^0\d{9}$/.test(formData.phone)) {
            newErrors.phone = t('consultation.errorPhoneInvalid', 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)');
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(formData);
            // Reset form
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                contactTime: 'afternoon',
                message: '',
                testInterested: 'test-3',
            });
            setErrors({});
        } catch (error) {
            console.error('Error submitting consultation:', error);
            alert(t('consultation.errorSubmit', 'Có lỗi xảy ra. Vui lòng thử lại!'));
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
            {/* Modal Container */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-up overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">
                                {t('consultation.title', 'Mở Khóa Thêm Bài Test')}
                            </h2>
                            <p className="text-white/90 text-sm">
                                {t('consultation.subtitle', 'Bạn đã hoàn thành 2 bài test miễn phí!')}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition"
                        >
                            <span className="text-2xl">×</span>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-gray-600 text-sm mb-4">
                        {t('consultation.description', 'Yêu cầu tư vấn để tiếp tục làm thêm bài test hoặc đăng ký khóa học.')}
                    </p>

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('consultation.fullName', 'Họ và tên')} <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition ${errors.fullName ? 'border-error-500' : 'border-gray-200'
                                }`}
                            placeholder={t('consultation.fullNamePlaceholder', 'Nguyễn Văn A')}
                        />
                        {errors.fullName && (
                            <p className="text-error-500 text-sm mt-1">{errors.fullName}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('consultation.email', 'Email')} <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition ${errors.email ? 'border-error-500' : 'border-gray-200'
                                }`}
                            placeholder="example@email.com"
                        />
                        {errors.email && (
                            <p className="text-error-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('consultation.phone', 'Số điện thoại')} <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition ${errors.phone ? 'border-error-500' : 'border-gray-200'
                                }`}
                            placeholder="0123456789"
                        />
                        {errors.phone && (
                            <p className="text-error-500 text-sm mt-1">{errors.phone}</p>
                        )}
                    </div>

                    {/* Contact Time */}
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

                    {/* Test Interested */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('consultation.testInterested', 'Test quan tâm')}
                        </label>
                        <select
                            name="testInterested"
                            value={formData.testInterested}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition"
                        >
                            <option value="test-3">Test 3</option>
                            <option value="test-4">Test 4</option>
                            <option value="test-5">Test 5</option>
                            <option value="all">{t('consultation.allTests', 'Tất cả bài test')}</option>
                        </select>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('consultation.message', 'Lời nhắn')} <span className="text-gray-400 text-xs">(optional)</span>
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition resize-none"
                            placeholder={t('consultation.messagePlaceholder', 'Nhập ghi chú hoặc yêu cầu của bạn...')}
                        />
                    </div>

                    {/* Actions */}
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
            </div>
        </div>
    );
};

export default ConsultationPopup;
