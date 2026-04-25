import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, FileText, Calendar, ChevronRight, Clock, AlertCircle, ClipboardCheck } from 'lucide-react';
import managerService from '../../services/managerService';

/**
 * BUG-04 FIX: Manager Dashboard — thay thế "Coming soon" placeholder
 */
const ManagerDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pendingQB: 0,
        approvedQB: 0,
        scheduleRequests: 0,
        totalQuestions: 0,
        pendingExams: 0,
        approvedExams: 0
    });
    const [loading, setLoading] = useState(true);

    // Fetch stats từ API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await managerService.getDashboardStats();
                setStats({
                    pendingQB: data.pendingQuestions || 0,
                    approvedQB: data.approvedQuestions || 0,
                    scheduleRequests: data.rescheduleRequests || 0,
                    totalQuestions: data.totalQuestions || 0,
                    pendingExams: data.pendingExams || 0,
                    approvedExams: data.approvedExams || 0
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
                // Fallback to zero stats on error
                setStats({ pendingQB: 0, approvedQB: 0, scheduleRequests: 0, totalQuestions: 0, pendingExams: 0, approvedExams: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            label: t('manager.dashboard.pendingQuestions'),
            value: stats.pendingQB,
            icon: <AlertCircle className="w-6 h-6" />,
            color: 'from-amber-500 to-orange-500',
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            urgent: stats.pendingQB > 0,
        },
        {
            label: t('manager.dashboard.approvedQuestions'),
            value: stats.approvedQB,
            icon: <CheckSquare className="w-6 h-6" />,
            color: 'from-emerald-500 to-green-600',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            urgent: false,
        },
        {
            label: t('manager.dashboard.pendingExams'),
            value: stats.pendingExams,
            icon: <ClipboardCheck className="w-6 h-6" />,
            color: 'from-rose-500 to-pink-600',
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            urgent: stats.pendingExams > 0,
        },
        {
            label: t('manager.dashboard.approvedExams'),
            value: stats.approvedExams,
            icon: <FileText className="w-6 h-6" />,
            color: 'from-cyan-500 to-teal-600',
            bg: 'bg-cyan-50',
            text: 'text-cyan-700',
            urgent: false,
        },
        {
            label: t('manager.dashboard.scheduleRequests'),
            value: stats.scheduleRequests,
            icon: <Calendar className="w-6 h-6" />,
            color: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            urgent: stats.scheduleRequests > 0,
        },
        {
            label: t('manager.dashboard.totalQuestions'),
            value: stats.totalQuestions,
            icon: <FileText className="w-6 h-6" />,
            color: 'from-purple-500 to-violet-600',
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            urgent: false,
        },
    ];

    const quickLinks = [
        { label: t('manager.dashboard.approveQB'), desc: t('manager.dashboard.approveQBDesc'), path: '/edu-manager/qb-approval', icon: '✅', color: 'hover:border-amber-400', badge: stats.pendingQB },
        { label: t('manager.dashboard.approveExams'), desc: t('manager.dashboard.approveExamsDesc'), path: '/edu-manager/test-approval', icon: '📝', color: 'hover:border-rose-400', badge: stats.pendingExams },
        { label: t('manager.dashboard.assignTeachers'), desc: t('manager.dashboard.assignTeachersDesc'), path: '/class-management', icon: '👩‍🏫', color: 'hover:border-blue-400', badge: 0 },
        { label: t('manager.dashboard.approveReschedule'), desc: t('manager.dashboard.approveRescheduleDesc'), path: '/session-approval', icon: '📅', color: 'hover:border-green-400', badge: stats.scheduleRequests },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                        📊
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                        <p className="text-gray-500 text-sm">{t('manager.dashboard.headerSubtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <div key={i} className={`bg-white rounded-2xl shadow-sm border-2 p-5 hover:shadow-md transition-shadow ${card.urgent ? 'border-amber-300 animate-pulse-slow' : 'border-gray-100'}`}>
                        <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center ${card.text} mb-3`}>
                            {card.icon}
                        </div>
                        <div className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                            {card.value}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{card.label}</div>
                        {card.urgent && (
                            <div className="text-xs text-amber-600 font-medium mt-1">{t('manager.dashboard.needsAttention')}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('manager.dashboard.priorityActions')}</h2>
                <div className="flex flex-col gap-4">
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
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{link.label}</span>
                                            {link.badge > 0 && (
                                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-0.5">{link.desc}</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent QB Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">{t('manager.dashboard.recentPendingQuestions')}</h2>
                    </div>
                    <button
                        onClick={() => navigate('/edu-manager/qb-approval')}
                        className="text-sm text-indigo-600 font-medium hover:underline"
                    >
                        {t('manager.dashboard.viewAll')} →
                    </button>
                </div>
                <div className="space-y-3">
                    {[
                        { teacher: t('manager.dashboard.sampleTeacher1'), question: t('manager.dashboard.sampleQuestion1'), level: 'TOPIK I', time: t('manager.dashboard.time10mAgo') },
                        { teacher: t('manager.dashboard.sampleTeacher2'), question: t('manager.dashboard.sampleQuestion2'), level: 'TOPIK II', time: t('manager.dashboard.time45mAgo') },
                        { teacher: t('manager.dashboard.sampleTeacher3'), question: t('manager.dashboard.sampleQuestion3'), level: 'TOPIK II', time: t('manager.dashboard.time2hAgo') },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
                            <div>
                                <div className="text-sm font-medium text-gray-900">{item.question}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {item.teacher} · <span className="text-indigo-600">{item.level}</span>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0 ml-4">{item.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Exam Approval Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">{t('manager.dashboard.recentPendingExams')}</h2>
                    </div>
                    <button
                        onClick={() => navigate('/edu-manager/test-approval')}
                        className="text-sm text-indigo-600 font-medium hover:underline"
                    >
                        {t('manager.dashboard.viewAll')} →
                    </button>
                </div>
                <div className="space-y-3">
                    {[
                        { teacher: t('manager.dashboard.sampleExamTeacher1'), exam: t('manager.dashboard.sampleExam1'), course: 'Beginner Korean', time: t('manager.dashboard.time5mAgo') },
                        { teacher: t('manager.dashboard.sampleExamTeacher2'), exam: t('manager.dashboard.sampleExam2'), course: 'Intermediate Korean', time: t('manager.dashboard.time1hAgo') },
                        { teacher: t('manager.dashboard.sampleExamTeacher3'), exam: t('manager.dashboard.sampleExam3'), course: 'Advanced Korean', time: t('manager.dashboard.time3hAgo') },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
                            <div>
                                <div className="text-sm font-medium text-gray-900">{item.exam}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {item.teacher} · <span className="text-rose-600">{item.course}</span>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0 ml-4">{item.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
