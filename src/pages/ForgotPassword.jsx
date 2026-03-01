import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
    Button,
    TextInput,
    Alert,
    PageContainer,
    LoadingOverlay
} from '../components/ui';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Form state
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    // UI state
    const [emailSent, setEmailSent] = useState(false);
    const [sentToEmail, setSentToEmail] = useState('');

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = t('auth.validation.emailRequired', 'Email là bắt buộc');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t('auth.validation.emailInvalid', 'Email không hợp lệ');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
            const response = await fetch(`${baseURL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setEmailSent(true);
                setSentToEmail(email);

                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: t('forgotPassword.successTitle', 'Đã gửi email!'),
                    text: t('forgotPassword.successMessage', 'Chúng tôi đã gửi email đặt lại mật khẩu đến ') + email,
                    confirmButtonColor: '#10B981',
                    confirmButtonText: t('common.ok', 'OK')
                });
            } else {
                throw new Error(data.message || 'Failed to send reset email');
            }
        } catch (error) {
            console.error('Forgot password error:', error);

            Swal.fire({
                icon: 'error',
                title: t('forgotPassword.errorTitle', 'Có lỗi xảy ra'),
                text: error.message || t('forgotPassword.errorMessage', 'Không thể gửi email. Vui lòng thử lại.'),
                confirmButtonColor: '#EF4444',
                confirmButtonText: t('common.ok', 'OK')
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = () => {
        setEmailSent(false);
        setSentToEmail('');
        handleSubmit(new Event('submit'));
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <PageContainer variant="full">
            {loading && <LoadingOverlay />}

            <div className="min-h-screen flex">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-50 via-teal-100 to-primary-50 relative overflow-hidden">
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center items-center h-full p-8 xl:p-12">
                        <div className="max-w-md w-full">
                            {/* Logo */}
                            <Link to="/" className="inline-block mb-8">
                                <div className={`flex items-center gap-3 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Mail className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-3xl font-bold text-gray-900">
                                            Korean Vitamin
                                        </h1>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {t('auth.tagline', 'Nâng cao tiếng Hàn mỗi ngày')}
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            {/* Info Card */}
                            <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    {t('forgotPassword.infoTitle', 'Quên mật khẩu?')}
                                </h2>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {t('forgotPassword.infoMessage', 'Đừng lo lắng! Chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản.')}
                                </p>

                                {/* Steps */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-primary-600 font-bold">1</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{t('forgotPassword.step1Title', 'Nhập email')}</p>
                                            <p className="text-sm text-gray-600">{t('forgotPassword.step1Desc', 'Địa chỉ email bạn dùng để đăng ký')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-primary-600 font-bold">2</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{t('forgotPassword.step2Title', 'Kiểm tra email')}</p>
                                            <p className="text-sm text-gray-600">{t('forgotPassword.step2Desc', 'Nhận email đặt lại mật khẩu trong vài phút')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-primary-600 font-bold">3</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{t('forgotPassword.step3Title', 'Đặt lại mật khẩu')}</p>
                                            <p className="text-sm text-gray-600">{t('forgotPassword.step3Desc', 'Nhấp vào link trong email để đặt lại mật khẩu')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-white">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                            <Link to="/" className="inline-block">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Mail className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            Korean Vitamin
                                        </h1>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {t('auth.tagline', 'Nâng cao tiếng Hàn mỗi ngày')}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Form Card */}
                        <div className={`bg-white rounded-2xl shadow-2xl p-8 sm:p-10 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            {/* Header */}
                            <div className="mb-8">
                                <button
                                    onClick={handleBackToLogin}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-sm font-medium">{t('common.back', 'Quay lại')}</span>
                                </button>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                    {t('forgotPassword.title', 'Quên mật khẩu?')}
                                </h2>
                                <p className="text-base sm:text-lg text-gray-600">
                                    {t('forgotPassword.subtitle', 'Nhập email để nhận link đặt lại mật khẩu')}
                                </p>
                            </div>

                            {/* Success State */}
                            {emailSent ? (
                                <div className="space-y-6">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {t('forgotPassword.emailSentTitle', 'Đã gửi email!')}
                                        </h3>
                                        <p className="text-gray-700 mb-4">
                                            {t('forgotPassword.emailSentTo', 'Chúng tôi đã gửi email đặt lại mật khẩu đến:')}
                                        </p>
                                        <p className="font-semibold text-primary-600 break-all">
                                            {sentToEmail}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-4">
                                            {t('forgotPassword.checkSpam', 'Nếu bạn không thấy email, hãy kiểm tra thư mục spam.')}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <Button
                                            onClick={handleBackToLogin}
                                            variant="primary"
                                            size="lg"
                                            fullWidth
                                            className="shadow-lg hover:shadow-xl transition-all"
                                        >
                                            {t('forgotPassword.backToLogin', 'Về trang đăng nhập')}
                                        </Button>
                                        <button
                                            onClick={handleResendEmail}
                                            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                        >
                                            {t('forgotPassword.resendEmail', 'Gửi lại email')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Email Field */}
                                        <div>
                                            <TextInput
                                                label={t('forgotPassword.emailLabel', 'Email')}
                                                placeholder={t('forgotPassword.emailPlaceholder', 'Nhập email đăng ký của bạn')}
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (errors.email) {
                                                        setErrors({ ...errors, email: '' });
                                                    }
                                                }}
                                                error={errors.email}
                                                required
                                                icon={Mail}
                                                autoFocus
                                                autoComplete="email"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            fullWidth
                                            loading={loading}
                                            icon={<Mail className="w-5 h-5" />}
                                            className="shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                                        >
                                            {t('forgotPassword.submit', 'Gửi link đặt lại')}
                                        </Button>
                                    </form>

                                    {/* Footer */}
                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600">
                                                {t('forgotPassword.rememberPassword', 'Nhớ lại mật khẩu?')}{' '}
                                                <Link
                                                    to="/login"
                                                    className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                                >
                                                    {t('auth.login', 'Đăng nhập')}
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default ForgotPassword;
