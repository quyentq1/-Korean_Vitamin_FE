import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock, Mail, User, Phone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGuestContext } from '../hooks/useGuestContext';
import {
    Button,
    TextInput,
    PasswordInput,
    Alert,
    PageContainer,
    LoadingOverlay
} from '../components/ui';
import Swal from 'sweetalert2';

const Signup = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const {
        recordCourseInterest,
        clearGuestContext,
        getGuestDataForSignup,
        hasActivityToMigrate
    } = useGuestContext();

    // Form state
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    const hasRedirectedRef = useRef(false);

    // If already authenticated, redirect to dashboard
    const { isAuthenticated, getDefaultRoute } = useAuth();

    useEffect(() => {
        setIsLoaded(true);

        if (isAuthenticated && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            navigate(getDefaultRoute(), { replace: true });
        }
    }, [isAuthenticated, navigate, getDefaultRoute]);

    // Validation
    const validateForm = () => {
        const newErrors = {};

        // Full name
        if (!fullName.trim()) {
            newErrors.fullName = t('auth.validation.fullNameRequired');
        } else if (fullName.length < 2) {
            newErrors.fullName = t('auth.validation.fullNameMinLength');
        } else if (fullName.length > 100) {
            newErrors.fullName = t('auth.validation.fullNameMaxLength');
        }

        // Username
        if (!username.trim()) {
            newErrors.username = t('auth.validation.usernameRequired');
        } else if (username.length < 3) {
            newErrors.username = t('auth.validation.usernameMinLength');
        } else if (username.length > 50) {
            newErrors.username = t('auth.validation.usernameMaxLength');
        } else if (!/^[a-zA-Z0-9_@.-]+$/.test(username)) {
            newErrors.username = t('auth.validation.usernameInvalid');
        }

        // Email
        if (!email.trim()) {
            newErrors.email = t('auth.validation.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t('auth.validation.emailInvalid');
        }

        // Phone
        if (!phone.trim()) {
            newErrors.phone = t('auth.validation.phoneRequired');
        } else if (!/^[0-9]{10,}$/.test(phone.replace(/\s/g, ''))) {
            newErrors.phone = t('auth.validation.phoneInvalid');
        }

        // Password
        if (!password) {
            newErrors.password = t('auth.validation.passwordRequired');
        } else if (password.length < 6) {
            newErrors.password = t('auth.validation.passwordMinLength');
        } else if (password.length > 50) {
            newErrors.password = t('auth.validation.passwordMaxLength');
        }

        // Confirm password
        if (!confirmPassword) {
            newErrors.confirmPassword = t('auth.validation.confirmPasswordRequired');
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = t('auth.validation.passwordMismatch');
        }

        // Terms and privacy
        if (!agreeTerms) {
            newErrors.terms = t('auth.validation.termsRequired');
        }
        if (!agreePrivacy) {
            newErrors.privacy = t('auth.validation.privacyRequired');
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
            const guestData = hasActivityToMigrate() ? getGuestDataForSignup() : {};

            const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
            const response = await fetch(`${baseURL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    fullName,
                    username,
                    email,
                    phone,
                    password,
                    confirmPassword,
                    ...guestData
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Clear guest context after successful signup
                clearGuestContext();

                // Check if email verification is required
                const requiresVerification = data.requiresVerification || data.emailVerificationRequired;

                // Show success message with email verification notice
                if (requiresVerification) {
                    await Swal.fire({
                        icon: 'success',
                        title: t('auth.registerSuccess', 'Đăng ký thành công!'),
                        html: `
                            <div class="text-left">
                                <p class="mb-3">${t('auth.registerSuccessMessage', 'Tài khoản của bạn đã được tạo.')}</p>
                                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <div class="flex items-start gap-3">
                                        <svg class="w-6 h-6 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0l2.17-6.45A2 2 0 0012.83 8.74M3 8l9 11m9-11v6m0 6V8m0-6v2m0-2h9m-9 0H3" />
                                        </svg>
                                        <div>
                                            <p class="font-semibold text-blue-900 mb-1">${t('auth.verificationRequired', 'Xác minh email')}</p>
                                            <p class="text-sm text-blue-700">${t('auth.verificationEmailSent', `Chúng tôi đã gửi email xác minh đến <strong>${email}</strong>. Vui lòng kiểm tra email và nhấn vào link xác minh để kích hoạt tài khoản.`)}</p>
                                        </div>
                                    </div>
                                </div>
                                <p class="text-sm text-gray-600 mb-4">${t('auth.checkSpam', 'Nếu không thấy email, hãy kiểm tra thư mục spam.')}</p>
                            </div>
                        `,
                        showConfirmButton: true,
                        confirmButtonText: t('auth.continueToLogin', 'Tiếp tục đăng nhập'),
                        confirmButtonColor: '#3B82F6',
                        showDenyButton: true,
                        denyButtonText: t('auth.resendEmail', 'Gửi lại email'),
                        denyButtonColor: '#6B7280',
                    }).then((result) => {
                        if (result.isDismissed) {
                            // User clicked Resend Email or closed
                            // They will be redirected to login anyway
                        }
                    });

                    // Resend verification email if user requested
                    if (result.dismiss === Swal.DismissReason.deny) {
                        try {
                            await import('../services/authService').then(({ authService }) => {
                                return authService.resendVerificationEmail(email);
                            });
                            await Swal.fire({
                                icon: 'info',
                                title: t('auth.emailSent', 'Đã gửi lại'),
                                text: t('auth.verificationEmailResent', `Email xác minh mới đã được gửi đến ${email}. Kiểm tra hộp thư của bạn.`),
                                confirmButtonColor: '#3B82F6',
                            });
                        } catch (err) {
                            console.error('Failed to resend verification email:', err);
                        }
                    }
                } else {
                    await Swal.fire({
                        icon: 'success',
                        title: t('auth.registerSuccess', 'Đăng ký thành công!'),
                        text: t('auth.registerSuccessMessage', 'Tài khoản của bạn đã được tạo. Bạn sẽ được chuyển đến trang đăng nhập trong giây lát.'),
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }

                // Auto login and redirect
                if (login && typeof login === 'function') {
                    login(username, password, false);
                }

                // Redirect to appropriate dashboard or last visited page
                const redirectPath = data.redirectPath || '/learner-dashboard';
                setTimeout(() => {
                    navigate(redirectPath, { replace: true });
                }, requiresVerification ? 3000 : 2000);
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Signup error:', error);

            Swal.fire({
                icon: 'error',
                title: t('auth.registerFailed', 'Đăng ký thất bại'),
                text: error.message || t('auth.registerFailedMessage', 'Vui lòng thử lại.'),
                confirmButtonColor: '#EF4444',
                confirmButtonText: t('common.ok', 'OK'),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleToggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleInputChange = (field, value) => {
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }

        // Update field value
        switch (field) {
            case 'fullName':
                setFullName(value);
                break;
            case 'username':
                setUsername(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'phone':
                setPhone(value);
                break;
            case 'password':
                setPassword(value);
                break;
            case 'confirmPassword':
                setConfirmPassword(value);
                break;
        }
    };

    return (
        <PageContainer variant="full">
            {loading && <LoadingOverlay />}

            {/* Split Layout Container */}
            <div className="min-h-screen flex">
                {/* Left Side - Branding & Benefits */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-50 via-blue-50 to-teal-50 relative overflow-hidden">
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center items-center h-full p-8 xl:p-12">
                        <div className="max-w-md w-full">
                            {/* Logo */}
                            <Link to="/" className="inline-block mb-8">
                                <div className={`flex items-center gap-3 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                                        <User className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-3xl font-bold text-gray-900">
                                            Korean Vitamin
                                        </h1>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {t('auth.tagline', 'Improve your Korean every day')}
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            {/* Benefits Card */}
                            <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    {t('auth.benefitsTitle', 'Why Join Us?')}
                                </h2>

                                {/* Guest Migration Notice */}
                                {hasActivityToMigrate() && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-900 mb-1">
                                                    {t('auth.guestMigrationTitle', 'We remember your progress!')}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {t('auth.guestMigrationMessage', 'Your test history and course interests will be saved to your account.')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Benefits List */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Lock className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{t('auth.benefit1Title', '2 Free Tests')}</p>
                                            <p className="text-sm text-gray-600">{t('auth.benefit1Desc', 'Start with 2 free practice tests')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{t('auth.benefit2Title', 'Track Progress')}</p>
                                            <p className="text-sm text-gray-600">{t('auth.benefit2Desc', 'Monitor your learning journey')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{t('auth.benefit3Title', 'Personalized Learning')}</p>
                                            <p className="text-sm text-gray-600">{t('auth.benefit3Desc', 'AI-powered study recommendations')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Signup Form */}
                <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-white">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                            <Link to="/" className="inline-block">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <User className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            Korean Vitamin
                                        </h1>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {t('auth.tagline', 'Improve your Korean every day')}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Signup Card */}
                        <div className={`bg-white rounded-2xl shadow-2xl p-8 sm:p-10 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            {/* Header */}
                            <div className="mb-8">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                    {t('auth.registerTitle', 'Create new account')}
                                </h2>
                                <p className="text-base sm:text-lg text-gray-600">
                                    {t('auth.registerSubtitle', 'Fill in your information to get started')}
                                </p>
                            </div>

                            {/* Terms Error */}
                            {errors.terms && (
                                <Alert
                                    type="error"
                                    className="mb-6"
                                >
                                    {errors.terms}
                                </Alert>
                            )}

                            {/* Signup Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Full Name Field */}
                                <div>
                                    <TextInput
                                        label={t('auth.fullName')}
                                        placeholder={t('auth.fullNamePlaceholder')}
                                        value={fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        error={errors.fullName}
                                        required
                                        icon={User}
                                        autoFocus
                                        autoComplete="name"
                                    />
                                </div>

                                {/* Username Field */}
                                <div>
                                    <TextInput
                                        label={t('auth.username')}
                                        placeholder={t('auth.usernamePlaceholder')}
                                        value={username}
                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                        error={errors.username}
                                        required
                                        autoComplete="username"
                                    />
                                </div>

                                {/* Email Field */}
                                <div>
                                    <TextInput
                                        label={t('auth.email')}
                                        placeholder={t('auth.emailPlaceholder')}
                                        type="email"
                                        value={email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        error={errors.email}
                                        required
                                        icon={Mail}
                                        autoComplete="email"
                                    />
                                </div>

                                {/* Phone Field */}
                                <div>
                                    <TextInput
                                        label={t('auth.phone')}
                                        placeholder={t('auth.phonePlaceholder')}
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        error={errors.phone}
                                        required
                                        icon={Phone}
                                        autoComplete="tel"
                                    />
                                </div>

                                {/* Password Field */}
                                <div>
                                    <PasswordInput
                                        label={t('auth.password')}
                                        placeholder={t('auth.passwordPlaceholder')}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors({ ...errors, password: '' });
                                        }}
                                        error={errors.password}
                                        required
                                        showPassword={showPassword}
                                        onTogglePassword={handleTogglePassword}
                                        autoComplete="new-password"
                                    />
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <PasswordInput
                                        label={t('auth.confirmPassword')}
                                        placeholder={t('auth.confirmPasswordPlaceholder')}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                                        }}
                                        error={errors.confirmPassword}
                                        required
                                        showPassword={showConfirmPassword}
                                        onTogglePassword={handleToggleConfirmPassword}
                                        autoComplete="new-password"
                                    />
                                </div>

                                {/* Terms and Privacy */}
                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={agreeTerms}
                                            onChange={(e) => {
                                                setAgreeTerms(e.target.checked);
                                                if (errors.terms) setErrors({ ...errors, terms: '' });
                                            }}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-400 focus:ring-2 cursor-pointer mt-1"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {t('auth.agreeTerms')}{' '}
                                            <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                                                {t('auth.termsOfService')}
                                            </Link>
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={agreePrivacy}
                                            onChange={(e) => {
                                                setAgreePrivacy(e.target.checked);
                                                if (errors.privacy) setErrors({ ...errors, privacy: '' });
                                            }}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-400 focus:ring-2 cursor-pointer mt-1"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {t('auth.agreePrivacy')}{' '}
                                            <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                                                {t('auth.privacyPolicy')}
                                            </Link>
                                        </span>
                                    </label>
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
                                    {t('auth.register', 'Register Now')}
                                </Button>
                            </form>

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        {t('auth.hasAccount')}{' '}
                                        <Link
                                            to="/login"
                                            className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                        >
                                            {t('auth.login', 'Login')}
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Copyright - Mobile */}
                        <div className="mt-6 text-center lg:hidden">
                            <p className="text-xs text-gray-400">
                                © 2025 Korean Vitamin. {t('auth.allRightsReserved')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Links - Desktop (Fixed at bottom) */}
                <div className="hidden lg:flex fixed bottom-0 left-1/2 w-1/2 items-center justify-center p-4 bg-gradient-to-t from-transparent to-blue-50">
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link
                            to="/about"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105"
                        >
                            {t('auth.about')}
                        </Link>
                        <span className="text-gray-400">|</span>
                        <Link
                            to="/contact"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105"
                        >
                            {t('auth.contact')}
                        </Link>
                        <span className="text-gray-400">|</span>
                        <Link
                            to="/privacy"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105"
                        >
                            {t('auth.privacy')}
                        </Link>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default Signup;
