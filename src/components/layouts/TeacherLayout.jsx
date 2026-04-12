import { useState, useMemo } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
    BookOpen, FileText, Users, TrendingUp, LogOut, Search,
    Menu, X, Home, CheckCircle, Clock, Library
} from 'lucide-react';
import Swal from 'sweetalert2';
import LanguageSwitcher from '../LanguageSwitcher';
import NotificationBell from '../NotificationBell';

/**
 * TeacherLayout - Sidebar và Topbar chung cho tất cả Teacher pages
 */
const TeacherLayout = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
        { icon: <Home className="w-5 h-5" />, label: t('teacher.dashboard.home'), path: '/teacher' },
        { icon: <Library className="w-5 h-5" />, label: t('teacher.dashboard.myCourses'), path: '/teacher/my-courses' },
        { icon: <FileText className="w-5 h-5" />, label: t('teacher.dashboard.examManagement'), path: '/teacher/exam-management' },
        { icon: <Users className="w-5 h-5" />, label: 'Bài Kiểm Tra Lớp', path: '/teacher/class-exams' },
        { icon: <BookOpen className="w-5 h-5" />, label: t('teacher.dashboard.questionBank'), path: '/teacher/question-bank' },
        { icon: <CheckCircle className="w-5 h-5" />, label: t('teacher.dashboard.grading'), path: '/teacher/grading-queue' },
        { icon: <TrendingUp className="w-5 h-5" />, label: t('teacher.dashboard.reports'), path: '/teacher/reports' },
    ], [t]);

    // Check if current path is active
    const isActive = (path) => {
        if (path === '/teacher-dashboard') {
            return location.pathname === '/teacher-dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
                transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
                transition-transform duration-300 ease-in-out flex flex-col
            `}>
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg font-bold">K</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800">Korean Vitamin</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
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
                                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }
                            `}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Sidebar Footer - User Info */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'T'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                                {user?.fullName || user?.username || 'Teacher'}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                                {t('role.teacher')}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                            title={t('auth.logout')}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
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
                                placeholder={t('common.search')}
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
                                    {user?.fullName || user?.username || 'Teacher'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {t('role.teacher')}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'T'}
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

export default TeacherLayout;
