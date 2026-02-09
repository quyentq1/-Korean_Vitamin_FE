import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Settings,
  Globe,
  ChevronDown,
  Home,
  BookOpen,
  GraduationCap,
  Users,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import authService from '../services/authService';

/**
 * Navbar Component
 *
 * Enhanced navbar with role-based menu, user profile dropdown,
 * notification bell, language switcher, and mobile hamburger menu.
 *
 * Features:
 * - Role-based navigation (ADMIN, STAFF, TEACHER, STUDENT)
 * - User profile dropdown with actions
 * - Notification bell with badge
 * - Language switcher
 * - Responsive mobile menu
 * - Transparent on homepage, solid on scroll
 * - Smooth scroll to sections
 *
 * @component
 */
const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user from localStorage
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsProfileOpen(false);
    setIsNotificationOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Role-based navigation links
  const getNavLinks = () => {
    const role = currentUser?.role;
    
    // Public links (always visible)
    const publicLinks = [
      { link: '/', label: t('nav.home', 'Trang chủ'), icon: Home },
      { link: '/courses', label: t('nav.courses', 'Khóa học'), icon: BookOpen },
      { link: '/curriculum', label: t('nav.curriculum', 'Giáo trình'), icon: GraduationCap },
      { link: '/prep', label: t('nav.prep', 'Luyện thi'), icon: FileText },
    ];

    // Role-specific links
    if (!role) {
      return [
        ...publicLinks,
        { link: '/login', label: t('nav.login', 'Đăng nhập'), isAuth: true },
        { link: '/register', label: t('nav.register', 'Đăng ký'), isAuth: true },
      ];
    }

    switch (role) {
      case 'STUDENT':
        return [
          ...publicLinks,
          { link: '/learner-dashboard', label: t('nav.studentDashboard', 'Dashboard'), icon: Home },
          { link: '/test-library', label: t('nav.testLibrary', 'Thư viện đề thi'), icon: BookOpen },
          { link: '/my-schedule', label: t('nav.mySchedule', 'Lịch học'), icon: Calendar },
          { link: '/writing-submission', label: t('nav.writingSubmission', 'Bài viết'), icon: FileText },
          { link: '/forum', label: t('nav.forum', 'Diễn đàn'), icon: Users },
        ];
      
      case 'TEACHER':
        return [
          ...publicLinks,
          { link: '/teacher-dashboard', label: t('nav.teacherDashboard', 'Dashboard'), icon: Home },
          { link: '/question-bank', label: t('nav.questionBank', 'Ngân hàng câu hỏi'), icon: BookOpen },
          { link: '/grading-queue', label: t('nav.gradingQueue', 'Hàng đợi chấm'), icon: CheckCircle },
          { link: '/teacher-reports', label: t('nav.reports', 'Báo cáo'), icon: FileText },
          { link: '/forum', label: t('nav.forum', 'Diễn đàn'), icon: Users },
        ];
      
      case 'STAFF':
        return [
          ...publicLinks,
          { link: '/student-management', label: t('nav.studentManagement', 'Quản lý học viên'), icon: Users },
          { link: '/class-management', label: t('nav.classManagement', 'Quản lý lớp học'), icon: Calendar },
          { link: '/role-management', label: t('nav.roleManagement', 'Quản lý vai trò'), icon: Settings },
          { link: '/forum', label: t('nav.forum', 'Diễn đàn'), icon: Users },
        ];
      
      case 'ADMIN':
        return [
          ...publicLinks,
          { link: '/user-management', label: t('nav.userManagement', 'Quản lý người dùng'), icon: Users },
          { link: '/system-settings', label: t('nav.systemSettings', 'Cài đặt hệ thống'), icon: Settings },
          { link: '/qb-approval', label: t('nav.qbApproval', 'Duyệt câu hỏi'), icon: CheckCircle },
          { link: '/forum', label: t('nav.forum', 'Diễn đàn'), icon: Users },
        ];
      
      default:
        return publicLinks;
    }
  };

  const navLinks = getNavLinks();

  // Handle language toggle
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  // Handle navigation click
  const handleNavClick = (item) => {
    if (item.isAnchor) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(item.link);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(item.link);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(item.link);
    }
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsNotificationOpen(false);
  };

  // Check if we're on homepage to apply transparent background
  const isHomePage = location.pathname === '/';
  const shouldBeTransparent = isHomePage && !isScrolled;

  // Notification items (mock data)
  const notifications = [
    { id: 1, title: t('notification.newExam', 'Đề thi mới đã được thêm'), time: '5 phút trước', type: 'info', read: false },
    { id: 2, title: t('notification.examResult', 'Kết quả đề thi đã có sẵn'), time: '1 giờ trước', type: 'success', read: false },
    { id: 3, title: t('notification.classReminder', 'Nhắc nhở: Lớp học bắt đầu lúc 14:00'), time: '2 giờ trước', type: 'warning', read: true },
  ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${shouldBeTransparent ? 'bg-transparent py-4' : 'bg-white shadow-md py-2'
            }`}>
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-primary-700 mr-2">🇰🇷</span>
                            <span className="text-xl font-bold text-primary-700 mr-2">
                                <img
                                    src="https://flagcdn.com/w20/kr.png"
                                    alt="Korean Flag"
                                    className="w-6 align-middle"
                                />
                            </span>
                        </div>
                        <span className={`text-xl font-bold hidden sm:block ${isScrolled ? 'text-primary-700' : 'text-primary-700'
                            }`}>
                            {t('landing.nav.title', 'Korean Vitamin')}
                        </span>
                    </div>

                    {/* Desktop Nav Links - Button Style */}
                    <div className="hidden lg:flex items-center gap-4">
                        {navLinks.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleNavClick(item)}
                                className={`px-4 py-2 text-sm font-bold border-2 rounded-xl transition duration-300 whitespace-nowrap ${shouldBeTransparent
                                    ? 'text-white border-white/30 bg-white/10 hover:bg-white hover:text-primary-600 backdrop-blur-sm'
                                    : 'text-primary-600 border-primary-200 hover:border-primary-500 hover:bg-primary-50'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Actions & Mobile Menu Button */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleLanguage}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition hidden sm:flex ${shouldBeTransparent ? 'text-white hover:bg-white/20' : 'hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            <img
                                src={i18n.language === 'en' ? 'https://flagcdn.com/w20/vn.png' : 'https://flagcdn.com/w20/gb.png'}
                                alt="flag"
                                className="w-5 h-4"
                            />
                            <span className="text-sm font-medium">
                                {i18n.language === 'en' ? 'VN' : 'EN'}
                            </span>
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className={`px-6 py-2 rounded-xl transition font-medium whitespace-nowrap hidden sm:block ${shouldBeTransparent
                                ? 'bg-white text-primary-600 hover:bg-gray-100 shadow-lg'
                                : 'bg-primary-500 text-white hover:bg-primary-600'
                                }`}
                        >
                            {t('landing.nav.login', 'Đăng nhập')}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            className={`lg:hidden p-2 rounded-lg ${shouldBeTransparent ? 'text-white hover:bg-white/20' : 'text-primary-600 hover:bg-primary-50'
                                }`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl p-4 flex flex-col gap-4 animate-slide-down">
                        {navLinks.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleNavClick(item)}
                                className="block w-full px-4 py-3 text-center font-bold text-primary-600 border-2 border-primary-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition"
                            >
                                {item.label}
                            </button>
                        ))}
                        <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100">
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <img
                                    src={i18n.language === 'en' ? 'https://flagcdn.com/w20/vn.png' : 'https://flagcdn.com/w20/gb.png'}
                                    alt="flag"
                                    className="w-5 h-4"
                                />
                                <span className="text-sm font-medium">
                                    {i18n.language === 'en' ? 'Tiếng Việt' : 'English'}
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/login');
                                    setIsMobileMenuOpen(false);
                                }}
                                className="px-6 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition"
                            >
                                {t('landing.nav.login', 'Đăng nhập')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
