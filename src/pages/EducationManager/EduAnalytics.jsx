import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Users,
    FileText, AlertCircle, BarChart3, Activity, Calendar
} from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';

const EduAnalytics = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, all

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await educationManagerService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thống kê...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Tổng Câu Hỏi',
            value: stats?.totalQuestions || 0,
            icon: <FileText className="w-6 h-6" />,
            color: 'from-purple-500 to-violet-600',
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            change: stats?.questionGrowth || '+0%',
            positive: true
        },
        {
            title: 'Chờ Duyệt',
            value: stats?.pendingQuestions || 0,
            icon: <Clock className="w-6 h-6" />,
            color: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            change: 'Cần xử lý',
            positive: false,
            urgent: (stats?.pendingQuestions || 0) > 0
        },
        {
            title: 'Đã Duyệt',
            value: stats?.approvedQuestions || 0,
            icon: <CheckCircle className="w-6 h-6" />,
            color: 'from-emerald-500 to-green-600',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            change: stats?.approvalRate || '0%',
            positive: true
        },
        {
            title: 'Đã Từ Chối',
            value: stats?.rejectedQuestions || 0,
            icon: <XCircle className="w-6 h-6" />,
            color: 'from-rose-500 to-red-600',
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            change: stats?.rejectionRate || '0%',
            positive: false
        },
        {
            title: 'Đề Thi Chờ Duyệt',
            value: stats?.pendingExams || 0,
            icon: <FileText className="w-6 h-6" />,
            color: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            change: 'Cần xử lý',
            positive: false,
            urgent: (stats?.pendingExams || 0) > 0
        },
        {
            title: 'Đề Thi Đã Duyệt',
            value: stats?.approvedExams || 0,
            icon: <CheckCircle className="w-6 h-6" />,
            color: 'from-cyan-500 to-teal-600',
            bg: 'bg-cyan-50',
            text: 'text-cyan-700',
            change: '+0%',
            positive: true
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                        <p className="text-sm sm:text-base text-gray-600">Thống kê và phân tích hoạt động phê duyệt</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="7d">7 ngày qua</option>
                            <option value="30d">30 ngày qua</option>
                            <option value="90d">90 ngày qua</option>
                            <option value="all">Tất cả</option>
                        </select>
                        <button
                            onClick={fetchStats}
                            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Activity className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        className={`bg-white rounded-2xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-all ${
                            card.urgent ? 'border-2 border-amber-400 animate-pulse-slow' : 'border border-gray-100'
                        }`}
                    >
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${card.bg} rounded-xl flex items-center justify-center ${card.text} mb-2`}>
                                {card.icon}
                            </div>
                            {card.change && (
                                <div className={`flex items-center gap-1 text-xs font-medium ${
                                    card.positive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {card.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {card.change}
                                </div>
                            )}
                        </div>
                        <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent mb-1`}>
                            {card.value}
                        </div>
                        <div className="text-sm text-gray-600">{card.title}</div>
                        {card.urgent && (
                            <div className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Cần xử lý
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-6 sm:mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Tác Vụ Nhanh</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <button
                        onClick={() => navigate('/edu-manager/qb-approval')}
                        className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-100 hover:border-amber-400 hover:shadow-md transition-all text-left group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Duyệt Câu Hỏi</h3>
                                <p className="text-xs text-gray-500">Phê duyệt ngân hàng câu hỏi</p>
                            </div>
                        </div>
                        {(stats?.pendingQuestions || 0) > 0 && (
                            <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {stats.pendingQuestions} chờ duyệt
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => navigate('/edu-manager/test-approval')}
                        className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-100 hover:border-blue-400 hover:shadow-md transition-all text-left group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Duyệt Đề Thi</h3>
                                <p className="text-xs text-gray-500">Phê duyệt đề thi</p>
                            </div>
                        </div>
                        {(stats?.pendingExams || 0) > 0 && (
                            <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {stats.pendingExams} chờ duyệt
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => navigate('/edu-manager/courses')}
                        className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-100 hover:border-purple-400 hover:shadow-md transition-all text-left group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Quản Lý Khóa Học</h3>
                                <p className="text-xs text-gray-500">{stats?.totalCourses || 0} khóa học</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/edu-manager/teachers')}
                        className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-100 hover:border-green-400 hover:shadow-md transition-all text-left group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">Giáo Viên</h3>
                                <p className="text-xs text-gray-500">{stats?.totalTeachers || 0} giáo viên</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Approval Rate */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Tỷ Lệ Duyệt</h3>
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-indigo-600" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <MetricBar
                            label="Câu hỏi"
                            value={stats?.approvedQuestions || 0}
                            total={stats?.totalQuestions || 0}
                            color="green"
                        />
                        <MetricBar
                            label="Đề thi"
                            value={stats?.approvedExams || 0}
                            total={(stats?.approvedExams || 0) + (stats?.pendingExams || 0) + (stats?.rejectedExams || 0)}
                            color="blue"
                        />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Hoạt Động Gần Đây</h3>
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[
                            { type: 'approve', text: 'Đã duyệt 5 câu hỏi', time: '5 phút trước', icon: '✅' },
                            { type: 'reject', text: 'Đã từ chối đề thi "Final Test"', time: '1 giờ trước', icon: '❌' },
                            { type: 'submit', text: 'Teacher Nguyễn A đã nộp 10 câu hỏi mới', time: '2 giờ trước', icon: '📝' },
                            { type: 'approve', text: 'Đã duyệt đề thi "Midterm Exam"', time: '3 giờ trước', icon: '✅' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                                <span className="text-lg">{item.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{item.text}</p>
                                    <p className="text-xs text-gray-500">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricBar = ({ label, value, total, color }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    const colorClasses = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        red: 'bg-red-500'
    };

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">{label}</span>
                <span className="text-gray-900 font-bold">{value}/{total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                <div
                    className={`h-full ${colorClasses[color]} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">{percentage}% đã duyệt</p>
        </div>
    );
};

export default EduAnalytics;
