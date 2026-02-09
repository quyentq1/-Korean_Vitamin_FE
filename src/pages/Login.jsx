import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, BookOpen, GraduationCap, Users, Award, Sparkles, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  Button,
  TextInput,
  PasswordInput,
  Alert,
  PageContainer,
  LoadingOverlay
} from '../components/ui';
import { handleLoginSubmit } from '../utils/loginHandler';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, getDefaultRoute, user } = useAuth();

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [loginError, setLoginError] = useState(''); // Lỗi đăng nhập cục bộ (invalid credentials)
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Session expired notification state
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionMessage, setSessionMessage] = useState('');
  
  const [isLoaded, setIsLoaded] = useState(false);

  const hasRedirectedRef = useRef(false);

  const from = location.state?.from?.pathname || null;
  const logoutReason = location.state?.logoutReason;
  const logoutMessage = location.state?.logoutMessage;

  // Hiển thị thông báo session expired nếu có (chỉ khi đến từ redirect, không phải từ lỗi đăng nhập)
  useEffect(() => {
    if (logoutMessage && logoutReason === 'SESSION_EXPIRED') {
      setSessionExpired(true);
      setSessionMessage(logoutMessage);
      // Xóa state để không hiển thị lại khi reload
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [logoutMessage, logoutReason, location.pathname, navigate]);

  useEffect(() => {
    setIsLoaded(true);

    if (isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      const redirectPath = from || getDefaultRoute();
      navigate(redirectPath, { replace: true });
    }

    if (!isAuthenticated) {
      hasRedirectedRef.current = false;
    }
  }, [isAuthenticated, navigate, from, getDefaultRoute, user]);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    // Validate username
    if (!username.trim()) {
      newErrors.username = t('auth.validation.usernameRequired', 'Tên đăng nhập là bắt buộc');
    } else if (username.length < 3) {
      newErrors.username = t('auth.validation.usernameMinLength', 'Tên đăng nhập phải có ít nhất 3 ký tự');
    } else if (!/^[a-zA-Z0-9_@.-]+$/.test(username)) {
      newErrors.username = t('auth.validation.usernameInvalid', 'Tên đăng nhập chỉ được chứa chữ cái, số và các ký tự đặc biệt: _@.-');
    }
    
    // Validate password
    if (!password) {
      newErrors.password = t('auth.validation.passwordRequired', 'Mật khẩu là bắt buộc');
    } else if (password.length < 6) {
      newErrors.password = t('auth.validation.passwordMinLength', 'Mật khẩu phải có ít nhất 6 ký tự');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle login submission
   * Gọi API đăng nhập và xử lý kết quả sử dụng Fetch API và SweetAlert2
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(''); // Chỉ xóa lỗi đăng nhập, không xóa session expired notification
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    // Sử dụng handleLoginSubmit từ loginHandler với Fetch API và SweetAlert2
    await handleLoginSubmit(
      username,
      password,
      setLoading,
      // Success callback - cập nhật AuthContext khi đăng nhập thành công
      (result) => {
        // Cập nhật AuthContext state
        if (login && typeof login === 'function') {
          // Gọi login function từ AuthContext để cập nhật state
          login(result.username, result.password, rememberMe);
        }
      },
      // Error callback (tùy chọn - SweetAlert2 đã xử lý hiển thị lỗi)
      (errorMessage) => {
        // SweetAlert2 đã hiển thị lỗi popup, không cần làm gì thêm
        console.log('Login error handled by SweetAlert2:', errorMessage);
      }
    );
  };

  // Handle input changes
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errors.username) {
      setErrors({ ...errors, username: '' });
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors({ ...errors, password: '' });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Handle forgot password click
   */
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  /**
   * Handle contact staff click
   */
  const handleContactStaff = () => {
    navigate('/contact');
  };

  return (
    <PageContainer variant="full">
      {/* Loading Overlay */}
      {loading && <LoadingOverlay />}

      {/* Split Layout Container */}
      <div className="min-h-screen flex">
        {/* Left Side - Branding & Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-50 via-teal-100 to-primary-50 relative overflow-hidden">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-300 rounded-full blur-2xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full p-8 xl:p-12">
            <div className="max-w-md w-full">
              {/* Logo */}
              <Link to="/" className="inline-block mb-8">
                <div className={`flex items-center gap-3 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
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

              {/* Welcome Message */}
              <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('auth.welcomeTitle', 'Chào mừng đến với Korean Vitamin')}
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {t('auth.welcomeMessage', 'Nền tảng học tiếng Hàn hàng đầu Việt Nam với công nghệ AI tiên tiến. Bắt đầu hành trình chinh phục TOPIK ngay hôm nay!')}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">10K+</p>
                    <p className="text-xs text-gray-600">{t('auth.students', 'Học viên')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Award className="w-6 h-6 text-teal-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">98%</p>
                    <p className="text-xs text-gray-600">{t('auth.passRate', 'Tỷ lệ đỗ')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <GraduationCap className="w-6 h-6 text-primary-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">500+</p>
                    <p className="text-xs text-gray-600">{t('auth.courses', 'Khóa học')}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t('auth.feature1Title', 'Giáo trình chuẩn hóa')}</h3>
                    <p className="text-sm text-gray-600">{t('auth.feature1Desc', 'Lộ trình học bài bản từ cơ bản đến nâng cao')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t('auth.feature2Title', 'Chấm điểm tự động')}</h3>
                    <p className="text-sm text-gray-600">{t('auth.feature2Desc', 'AI chấm bài viết và nói với phản hồi chi tiết')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
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

            {/* Login Card */}
            <div className={`bg-white rounded-2xl shadow-2xl p-8 sm:p-10 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {t('auth.loginTitle', 'Chào mừng trở lại!')}
                </h2>
                <p className="text-base sm:text-lg text-gray-600">
                  {t('auth.loginSubtitle', 'Vui lòng nhập thông tin đăng nhập để tiếp tục')}
                </p>
              </div>

              {/* Session Expired Alert - chỉ hiển thị khi có thông báo từ location.state */}
              {sessionExpired && (
                <Alert
                  type="warning"
                  className="mb-6"
                  dismissible
                  onDismiss={() => setSessionExpired(false)}
                >
                  {sessionMessage}
                </Alert>
              )}

              {/* Login Error Alert - chỉ hiển thị khi có lỗi đăng nhập cục bộ */}
              {loginError && (
                <Alert
                  type="error"
                  className="mb-6"
                  dismissible
                  onDismiss={() => setLoginError('')}
                >
                  {loginError}
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                  <TextInput
                    label={t('auth.username', 'Tên đăng nhập')}
                    placeholder={t('auth.usernamePlaceholder', 'Nhập tên đăng nhập của bạn')}
                    value={username}
                    onChange={handleUsernameChange}
                    error={errors.username}
                    required
                    icon={Mail}
                    autoFocus
                    autoComplete="username"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <PasswordInput
                    label={t('auth.password', 'Mật khẩu')}
                    placeholder={t('auth.passwordPlaceholder', 'Nhập mật khẩu của bạn')}
                    value={password}
                    onChange={handlePasswordChange}
                    error={errors.password}
                    required
                    showPassword={showPassword}
                    onTogglePassword={togglePasswordVisibility}
                    autoComplete="current-password"
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  {/* Remember Me */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-400 focus:ring-2 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      {t('auth.rememberMe', 'Ghi nhớ đăng nhập')}
                    </span>
                  </label>

                  {/* Forgot Password Link */}
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {t('auth.forgotPassword', 'Quên mật khẩu?')}
                  </button>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                  className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  {t('auth.login', 'Đăng nhập')}
                </Button>
              </form>

              {/* Contact Staff Message */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {t('auth.contactStaff', 'Liên hệ nhân viên để đăng ký tài khoản')}
                  </p>
                  <button
                    type="button"
                    onClick={handleContactStaff}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {t('auth.contactUs', 'Liên hệ ngay')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Links - Mobile */}
            <div className="mt-8 text-center lg:hidden">
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/about"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-105"
                >
                  {t('auth.about', 'Về chúng tôi')}
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/contact"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-105"
                >
                  {t('auth.contact', 'Liên hệ hỗ trợ')}
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-105"
                >
                  {t('auth.privacy', 'Chính sách bảo mật')}
                </Link>
              </div>
            </div>

            {/* Copyright - Mobile */}
            <div className="mt-6 text-center lg:hidden">
              <p className="text-xs text-gray-400">
                © 2025 Korean Vitamin. {t('auth.allRightsReserved', 'Tất cả quyền được bảo lưu.')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links - Desktop (Fixed at bottom) */}
        <div className="hidden lg:flex fixed bottom-0 left-1/2 w-1/2 items-center justify-center p-4 bg-gradient-to-t from-transparent to-teal-50">
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/about"
              className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105"
            >
              {t('auth.about', 'Về chúng tôi')}
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              to="/contact"
              className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105"
            >
              {t('auth.contact', 'Liên hệ hỗ trợ')}
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              to="/privacy"
              className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105"
            >
              {t('auth.privacy', 'Chính sách bảo mật')}
            </Link>
          </div>
          {/* Copyright - Desktop */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              © 2025 Korean Vitamin. {t('auth.allRightsReserved', 'Tất cả quyền được bảo lưu.')}
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Login;
