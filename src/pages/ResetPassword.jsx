import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import {
    Button,
    TextInput,
    PasswordInput,
    Alert,
    PageContainer,
    LoadingOverlay
} from '../components/ui';
import Swal from 'sweetalert2';

const ResetPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get token from URL
    const token = searchParams.get('token');

    // Form state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    // UI state
    const [resetSuccess, setResetSuccess] = useState(false);

    useEffect(() => {
        setIsLoaded(true);

        // Check if token exists
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: t('resetPassword.noTokenTitle', 'Không tìm thấy token'),
                text: t('resetPassword.noTokenMessage', 'Link đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu lại.'),
                confirmButtonColor: '#EF4444',
                confirmButtonText: t('common.ok', 'OK')
            }).then(() => {
                navigate('/forgot-password');
            });
        }
    }, [token]);

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!newPassword) {
            newErrors.newPassword = t('auth.validation.passwordRequired', 'Mật khẩu là bắt buộc');
        } else if (newPassword.length < 6) {
            newErrors.newPassword = t('auth.validation.passwordMinLength', 'Mật khẩu phải có ít nhất 6 ký tự');
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = t('resetPassword.confirmPasswordRequired', 'Vui lòng xác nhận mật khẩu');
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = t('resetPassword.passwordsNotMatch', 'Mật khẩu xác nhận không khớp');
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
            const response = await fetch(`${baseURL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: newPassword,
                    confirmPassword: confirmPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setResetSuccess(true);

                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: t('resetPassword.successTitle', 'Mật khẩu đã thay đổi!'),
                    text: t('resetPassword.successMessage', 'Mật khẩu của bạn đã được đặt lại thành công.'),
                    confirmButtonColor: '#10B981',
                    confirmButtonText: t('resetPassword.goToLogin', 'Đến trang đăng nhập')
                }).then(() => {
                    navigate('/login');
                });
            } else {
                throw new Error(data.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Reset password error:', error);

            Swal.fire({
                icon: 'error',
                title: t('resetPassword.errorTitle', 'Có lỗi xảy ra'),
                text: error.message || t('resetPassword.errorMessage', 'Không thể đặt lại mật khẩu. Link có thể đã hết hạn.'),
                confirmButtonColor: '#EF4444',
                confirmButtonText: t('common.ok', 'OK')
            });
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
        if (errors.newPassword) {
            setErrors({ ...errors, newPassword: '' });
        }
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        if (errors.confirmPassword) {
            setErrors({ ...errors, confirmPassword: '' });
        }
    };

    if (!token) {
        return null;
    }

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
                                        <Lock className="w-7 h-7 text-white" />
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
                                    {t('resetPassword.infoTitle', 'Đặt lại mật khẩu')}
                                </h2>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {t('resetPassword.infoMessage', 'Tạo mật khẩu mới mạnh và an toàn cho tài khoản của bạn.')}
                                </p>

                                {/* Password Tips */}
                                <div className="space-y-3">
                                    <p className="font-semibold text-gray-900">{t('resetPassword.passwordTips', 'Mẹo mạnh mật khẩu:')}</p>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">✓</span>
                                            <span>{t('resetPassword.tip1', 'Ít nhất 6 ký tự')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">✓</span>
                                            <span>{t('resetPassword.tip2', 'Kết hợp chữ hoa, thường, số và ký tự đặc biệt')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">✓</span>
                                            <span>{t('resetPassword.tip3', 'Không sử dụng thông tin cá nhân')}</span>
                                        </li>
                                    </ul>
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
                                        <Lock className="w-7 h-7 text-white" />
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
                        {resetSuccess ? (
                            <div className={`bg-white rounded-2xl shadow-2xl p-8 sm:p-10 text-center transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                    {t('resetPassword.successTitle', 'Mật khẩu đã thay đổi!')}
                                </h2>
                                <p className="text-gray-600 mb-8">
                                    {t('resetPassword.successInfo', 'Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.')}
                                </p>
                                <Button
                                    onClick={() => navigate('/login')}
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    className="shadow-lg hover:shadow-xl transition-all"
                                >
                                    {t('resetPassword.goToLogin', 'Đến trang đăng nhập')}
                                </Button>
                            </div>
                        ) : (
                            <div className={`bg-white rounded-2xl shadow-2xl p-8 sm:p-10 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                {/* Header */}
                                <div className="mb-8">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                        {t('resetPassword.title', 'Đặt lại mật khẩu')}
                                    </h2>
                                    <p className="text-base sm:text-lg text-gray-600">
                                        {t('resetPassword.subtitle', 'Nhập mật khẩu mới cho tài khoản của bạn')}
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* New Password Field */}
                                    <div>
                                        <PasswordInput
                                            label={t('resetPassword.newPasswordLabel', 'Mật khẩu mới')}
                                            placeholder={t('resetPassword.newPasswordPlaceholder', 'Nhập mật khẩu mới')}
                                            value={newPassword}
                                            onChange={handleNewPasswordChange}
                                            error={errors.newPassword}
                                            required
                                            showPassword={showPassword}
                                            onTogglePassword={togglePasswordVisibility}
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div>
                                        <PasswordInput
                                            label={t('resetPassword.confirmPasswordLabel', 'Xác nhận mật khẩu')}
                                            placeholder={t('resetPassword.confirmPasswordPlaceholder', 'Nhập lại mật khẩu mới')}
                                            value={confirmPassword}
                                            onChange={handleConfirmPasswordChange}
                                            error={errors.confirmPassword}
                                            required
                                            showPassword={showConfirmPassword}
                                            onTogglePassword={toggleConfirmPasswordVisibility}
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        loading={loading}
                                        className="shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                                    >
                                        {t('resetPassword.submit', 'Đặt lại mật khẩu')}
                                    </Button>
                                </form>

                                {/* Footer */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">
                                            {t('resetPassword.rememberPassword', 'Nhớ lại mật khẩu?')}{' '}
                                            <Link
                                                to="/login"
                                                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                            >
                                                {t('auth.login', 'Đăng nhập')}
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default ResetPassword;
