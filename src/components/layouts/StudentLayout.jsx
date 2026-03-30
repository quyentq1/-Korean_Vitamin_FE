import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import studentService from '../../services/studentService';
import {
  BookOpen,
  FileText,
  Clock,
  Trophy,
  Target,
  BarChart3,
  User,
  LogOut,
  Search,
  Menu,
  X,
  Home,
  GraduationCap,
  ClipboardCheck,
  Calendar,
  Settings,
  Bell
} from 'lucide-react';
import Swal from 'sweetalert2';
import LanguageSwitcher from '../LanguageSwitcher';
import NotificationBell from '../NotificationBell';

/**
 * StudentLayout - Sidebar và Topbar cho Student
 */
const StudentLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedExams: 0,
    averageScore: 0
  });

  // Fetch student stats for sidebar
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardData, examResults] = await Promise.all([
          studentService.getDashboardData().catch(() => null),
          studentService.getExamResults().catch(() => ({ results: [] }))
        ]);

        setStats({
          totalCourses: dashboardData?.totalCourses || 0,
          completedExams: examResults?.results?.length || 0,
          averageScore: examResults?.results?.length > 0
            ? Math.round(examResults.results.reduce((sum, r) => sum + (r.totalScore || 0), 0) / examResults.results.length)
            : 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Handle logout
  const handleLogout = () => {
    Swal.fire({
      icon: 'question',
      title: t('auth.logout'),
      text: t('auth.logoutConfirm'),
      showCancelButton: true,
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  // Sidebar navigation items
  const navItems = useMemo(() => [
    { icon: <Home className="w-5 h-5" />, label: 'Trang chủ', path: '/student' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Khóa học', path: '/student/my-courses' },
    { icon: <FileText className="w-5 h-5" />, label: 'Bài kiểm tra', path: '/student/exams' },
    { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Lịch sử thi', path: '/student/attempts/history' },
    { icon: <Trophy className="w-5 h-5" />, label: 'Kết quả', path: '/student/results' },
    { icon: <GraduationCap className="w-5 h-5" />, label: 'Tiến độ', path: '/student/progress' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Thống kê', path: '/student/statistics' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Lịch học', path: '/student/schedule' },
  ], []);

  // Check if current path is active
  const isActive = (path) => {
    if (path === '/student') {
      return location.pathname === '/student';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xl font-bold text-white">Korean Vitamin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Student Info Card */}
        <div className="p-4 m-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user?.fullName || user?.username || 'Học viên'}
              </p>
              <p className="text-xs text-indigo-600 truncate">
                Học viên
              </p>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-indigo-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">Khóa học</p>
              <p className="text-sm font-bold text-indigo-600">{stats.totalCourses}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Bài kiểm tra</p>
              <p className="text-sm font-bold text-purple-600">{stats.completedExams}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Điểm TB</p>
              <p className="text-sm font-bold text-pink-600">{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive(item.path)
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <button
            onClick={() => navigate('/student/profile')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all mb-2"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">{t('student.profile', 'Hồ sơ')}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('auth.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2 w-80">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.search') || 'Tìm kiếm...'}
                className="bg-transparent border-none outline-none ml-3 w-full text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationBell />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Menu (Desktop) */}
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.fullName || user?.username || 'Student'}
                </p>
                <p className="text-xs text-gray-500">
                  {t('role.student')}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'S'}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                title={t('auth.logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
