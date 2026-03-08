import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Users, UserPlus, BookOpen, ClipboardList, Bell,
    UserCheck, Clock, Loader2, TrendingUp, Award,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import staffService from '../../services/staffService';

/**
 * Staff Dashboard - Main dashboard content
 * Note: Sidebar và Topbar đã được chuyển sang StaffLayout
 */
const StaffDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeClasses: 0,
        pendingRegistrations: 0,
        newConsultations: 0,
        studentsChange: 0,
        classesChange: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);

    // Fetch dashboard stats
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await staffService.getDashboardStats();

                if (response) {
                    setStats({
                        totalStudents: response.totalStudents || 0,
                        activeClasses: response.activeClasses || 0,
                        pendingRegistrations: response.pendingRegistrations || 0,
                        newConsultations: response.newConsultations || 0,
                        studentsChange: response.studentsChange || 0,
                        classesChange: response.classesChange || 0
                    });

                    if (response.recentActivities) {
                        setRecentActivities(response.recentActivities);
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                Swal.fire({
                    icon: 'error',
                    title: t('errors.error') || 'Lỗi',
                    text: error.message || t('errors.tryAgain') || 'Vui lòng thử lại',
                    confirmButtonColor: '#667eea',
                });

                setStats({
                    totalStudents: 0,
                    activeClasses: 0,
                    pendingRegistrations: 0,
                    newConsultations: 0,
                    studentsChange: 0,
                    classesChange: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [t]);

    // Stats cards configuration
    const statCards = [
        {
            label: t('staff.dashboard.totalStudents'),
            value: stats.totalStudents,
            change: stats.studentsChange,
            icon: <Users className="w-6 h-6" />,
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            label: t('staff.dashboard.activeClasses'),
            value: stats.activeClasses,
            change: stats.classesChange,
            icon: <BookOpen className="w-6 h-6" />,
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            gradient: 'from-emerald-500 to-teal-500',
        },
        {
            label: t('staff.dashboard.pendingRegistrations'),
            value: stats.pendingRegistrations,
            icon: <ClipboardList className="w-6 h-6" />,
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            gradient: 'from-amber-500 to-orange-500',
        },
        {
            label: t('staff.dashboard.newConsultations'),
            value: stats.newConsultations,
            icon: <Bell className="w-6 h-6" />,
            color: 'from-purple-500 to-purple-600',
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            gradient: 'from-purple-500 to-pink-500',
        },
    ];

    // Quick action cards
    const quickActions = [
        {
            label: t('staff.dashboard.addStudent'),
            desc: t('staff.dashboard.addStudentDesc'),
            path: '/student-management/create-manual',
            icon: <UserPlus className="w-6 h-6" />,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
        },
        {
            label: t('staff.dashboard.viewReports'),
            desc: t('staff.dashboard.viewReportsDesc'),
            path: '/reports',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
        },
        {
            label: t('staff.dashboard.manageClasses'),
            desc: t('staff.dashboard.manageClassesDesc'),
            path: '/class-management',
            icon: <BookOpen className="w-6 h-6" />,
            color: 'bg-gradient-to-br from-amber-500 to-amber-600',
        },
        {
            label: t('staff.dashboard.manageRegistrations'),
            desc: t('staff.dashboard.manageRegistrationsDesc'),
            path: '/registrations',
            icon: <ClipboardList className="w-6 h-6" />,
            color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        },
    ];

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-2xl p-6 lg:p-8 mb-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>

                <div className="relative z-10">
                    <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                        {t('staff.dashboard.welcome') || 'Xin chào'}! 👋
                    </h1>
                    <p className="text-blue-100 text-sm lg:text-base">
                        {t('staff.dashboard.welcomeDesc') || 'Đây là trang dashboard của bạn. Quản lý tất cả hoạt động tại đây.'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 mt-6">
                    <button
                        onClick={() => navigate('/student-management/create-manual')}
                        className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2"
                    >
                        <Users className="w-5 h-5" />
                        <span>{t('staff.dashboard.addStudent') || 'Thêm học viên'}</span>
                    </button>
                    <button
                        onClick={() => navigate('/class-management')}
                        className="bg-white/20 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2"
                    >
                        <BookOpen className="w-5 h-5" />
                        <span>{t('staff.dashboard.manageClasses') || 'Quản lý lớp'}</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 hover:shadow-lg transition-all duration-300 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center ${card.text} group-hover:scale-110 transition-transform`}>
                                {card.icon}
                            </div>
                            {card.change !== undefined && (
                                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                                    card.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {card.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {Math.abs(card.change)}%
                                </span>
                            )}
                        </div>
                        <div className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent mb-1`}>
                            {card.value}
                        </div>
                        <div className="text-sm text-gray-500">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-500" />
                        {t('staff.dashboard.quickActions') || 'Hành động nhanh'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(action.path)}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                                    {action.icon}
                                </div>
                                <div className="font-semibold text-gray-900 mb-1">{action.label}</div>
                                <div className="text-sm text-gray-500">{action.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        {t('staff.dashboard.recentActivity') || 'Hoạt động gần đây'}
                    </h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        {recentActivities.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivities.slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800 font-medium truncate">{item.text}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">{t('common.noData') || 'Không có dữ liệu'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
