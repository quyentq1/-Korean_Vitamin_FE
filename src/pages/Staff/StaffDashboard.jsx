import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, BookOpen, ClipboardList, Bell, ChevronRight, UserCheck, Clock, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import staffService from '../../services/staffService';

/**
 * BUG-04 FIX: Staff Dashboard — thay thế "Coming soon" placeholder
 * Staff Dashboard with real API integration and bilingual support
 */
const StaffDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeClasses: 0,
        pendingRegistrations: 0,
        newConsultations: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);

    // Fetch dashboard stats from API
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
                        newConsultations: response.newConsultations || 0
                    });

                    // Set recent activities if available
                    if (response.recentActivities) {
                        setRecentActivities(response.recentActivities);
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);

                // Show error notification
                Swal.fire({
                    icon: 'error',
                    title: t('errors.error') || 'Lỗi',
                    text: error.message || t('errors.tryAgain') || 'Vui lòng thử lại',
                    confirmButtonColor: '#667eea',
                });

                // Set default values on error
                setStats({
                    totalStudents: 0,
                    activeClasses: 0,
                    pendingRegistrations: 0,
                    newConsultations: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [t]);

    const statCards = [
        {
            label: t('staff.dashboard.totalStudents'),
            value: stats.totalStudents,
            icon: <Users className="w-6 h-6" />,
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
        },
        {
            label: t('staff.dashboard.activeClasses'),
            value: stats.activeClasses,
            icon: <BookOpen className="w-6 h-6" />,
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
        },
        {
            label: t('staff.dashboard.pendingRegistrations'),
            value: stats.pendingRegistrations,
            icon: <ClipboardList className="w-6 h-6" />,
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50',
            text: 'text-amber-700',
        },
        {
            label: t('staff.dashboard.newConsultations'),
            value: stats.newConsultations,
            icon: <Bell className="w-6 h-6" />,
            color: 'from-purple-500 to-purple-600',
            bg: 'bg-purple-50',
            text: 'text-purple-700',
        },
    ];

    const quickLinks = [
        {
            label: t('staff.dashboard.studentManagement'),
            desc: t('staff.dashboard.studentManagementDesc'),
            path: '/student-management',
            icon: '👤',
            color: 'hover:border-blue-400'
        },
        {
            label: t('staff.dashboard.classManagement'),
            desc: t('staff.dashboard.classManagementDesc'),
            path: '/class-management',
            icon: '🏫',
            color: 'hover:border-emerald-400'
        },
        {
            label: t('staff.dashboard.roleManagement'),
            desc: t('staff.dashboard.roleManagementDesc'),
            path: '/role-management',
            icon: '🔐',
            color: 'hover:border-purple-400'
        },
        {
            label: t('staff.dashboard.registrationManagement'),
            desc: t('staff.dashboard.registrationManagementDesc'),
            path: '/registration-management',
            icon: '📋',
            color: 'hover:border-amber-400'
        },
    ];

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
                        🏢
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('staff.dashboard.title')}</h1>
                        <p className="text-gray-500 text-sm">{t('staff.dashboard.subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center ${card.text} mb-3`}>
                            {card.icon}
                        </div>
                        <div className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                            {card.value}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('staff.dashboard.quickAccess')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickLinks.map((link, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(link.path)}
                            className={`bg-white rounded-2xl border-2 border-gray-100 ${link.color} p-5 text-left hover:shadow-md transition-all duration-200 group`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{link.icon}</span>
                                    <div>
                                        <div className="font-semibold text-gray-900">{link.label}</div>
                                        <div className="text-sm text-gray-500 mt-0.5">{link.desc}</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-800">{t('staff.dashboard.recentActivity')}</h2>
                </div>

                {recentActivities.length > 0 ? (
                    <div className="space-y-3">
                        {recentActivities.map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="text-gray-700 text-sm">{item.text}</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.badgeColor}`}>
                                        {item.badge}
                                    </span>
                                    <span className="text-xs text-gray-400 hidden sm:block">{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">{t('common.noData')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
