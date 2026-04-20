import { useState } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, BookOpen, Users, GraduationCap, ClipboardList,
    LogOut, Menu, X, ChevronRight, Settings, User,
    CheckCircle, FileCheck, BarChart3, Calendar, ClipboardCheck, TrendingUp
} from 'lucide-react';
import Swal from 'sweetalert2';
import NotificationBell from '../NotificationBell';

const navItems = [
    {
        section: 'Tổng quan',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/edu-manager' },
            { icon: BarChart3, label: 'Analytics', path: '/edu-manager/analytics' },
        ]
    },
    {
        section: 'Duyệt',
        items: [
            { icon: CheckCircle, label: 'Duyệt Câu Hỏi', path: '/edu-manager/qb-approval' },
            { icon: FileCheck, label: 'Duyệt Bài Thi', path: '/edu-manager/exam-approval' },
            { icon: FileCheck, label: 'Duyệt Đề Thi', path: '/edu-manager/test-approval' },
        ]
    },
    {
        section: 'Quản lý',
        items: [
            { icon: BookOpen, label: 'Khóa học', path: '/edu-manager/courses' },
            { icon: Users, label: 'Lớp học', path: '/edu-manager/classes' },
            { icon: ClipboardList, label: 'Bài test', path: '/edu-manager/tests' },
            { icon: Calendar, label: 'Quản lý lịch học', path: '/edu-manager/schedules' },
        ]
    },
    {
        section: 'Điểm danh',
        items: [
            { icon: ClipboardCheck, label: 'Lịch sử điểm danh', path: '/edu-manager/attendance' },
            { icon: TrendingUp, label: 'Thống kê dạy/học', path: '/edu-manager/teaching-stats' },
        ]
    },
];

const EducationManagerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        Swal.fire({
            icon: 'question', title: 'Đăng xuất?',
            text: 'Bạn có chắc chắn muốn đăng xuất?',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed', cancelButtonColor: '#6b7280',
            confirmButtonText: 'Đăng xuất', cancelButtonText: 'Hủy',
        }).then(r => r.isConfirmed && logout());
    };

    const isActive = (path) => {
        if (path === '/edu-manager') return location.pathname === '/edu-manager';
        return location.pathname.startsWith(path);
    };

    const currentPageLabel = navItems.flatMap(s => s.items).find(i => isActive(i.path))?.label || 'Dashboard';

    return (
        <div className="min-h-screen flex" style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#f1f5f9' }}>

            {/* ===== SIDEBAR ===== */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 flex flex-col
                w-64 bg-gradient-to-b from-[#1e1b4b] to-[#312e81]
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                lg:static lg:shrink-0 shadow-2xl
            `}>
                {/* Brand */}
                <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-sm">KV</span>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-none">Korean Vitamin</p>
                            <p className="text-violet-300 text-xs mt-0.5">Edu Manager</p>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-5 overflow-y-auto px-3 space-y-6">
                    {navItems.map((section) => (
                        <div key={section.section}>
                            <p className="text-violet-400 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
                                {section.section}
                            </p>
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${active
                                                ? 'bg-white/15 text-white shadow-sm'
                                                : 'text-violet-200 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-violet-300' : 'text-violet-400 group-hover:text-violet-300'}`} style={{ width: '1.125rem', height: '1.125rem' }} />
                                            <span className="text-sm font-medium flex-1">{item.label}</span>
                                            {active && <ChevronRight className="w-3.5 h-3.5 text-violet-300" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User card */}
                <div className="px-3 pb-4 shrink-0">
                    <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {user?.fullName?.charAt(0) || 'E'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{user?.fullName || user?.username}</p>
                            <p className="text-violet-300 text-xs">Education Manager</p>
                        </div>
                        <button onClick={handleLogout} title="Đăng xuất" className="text-violet-300 hover:text-red-400 transition-colors shrink-0">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ===== MAIN AREA ===== */}
            <div className="flex-1 min-w-0 flex flex-col">

                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-5 lg:px-8 shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                            <Menu className="w-5 h-5" />
                        </button>
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Edu Manager</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                            <span className="font-semibold text-gray-800">{currentPageLabel}</span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <NotificationBell />

                        <div className="w-px h-6 bg-gray-200 mx-1" />

                        {/* User info */}
                        <div className="flex items-center gap-2.5">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800 leading-none">{user?.fullName || user?.username}</p>
                                <p className="text-xs text-violet-600 mt-0.5">Education Manager</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {user?.fullName?.charAt(0) || 'E'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-5 lg:p-8 min-h-0 w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default EducationManagerLayout;
