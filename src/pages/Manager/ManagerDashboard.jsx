import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, FileText, Calendar, ChevronRight, Clock, AlertCircle } from 'lucide-react';

/**
 * BUG-04 FIX: Manager Dashboard — thay thế "Coming soon" placeholder
 */
const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ pendingQB: 0, approvedQB: 0, scheduleRequests: 0, totalQuestions: 0 });

    // Mock stats — sẽ kết nối API thực sau
    useEffect(() => {
        setStats({ pendingQB: 7, approvedQB: 243, scheduleRequests: 2, totalQuestions: 250 });
    }, []);

    const statCards = [
        {
            label: 'Câu Hỏi Chờ Duyệt',
            value: stats.pendingQB,
            icon: <AlertCircle className="w-6 h-6" />,
            color: 'from-amber-500 to-orange-500',
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            urgent: stats.pendingQB > 0,
        },
        {
            label: 'Câu Hỏi Đã Duyệt',
            value: stats.approvedQB,
            icon: <CheckSquare className="w-6 h-6" />,
            color: 'from-emerald-500 to-green-600',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            urgent: false,
        },
        {
            label: 'Yêu Cầu Đổi Lịch',
            value: stats.scheduleRequests,
            icon: <Calendar className="w-6 h-6" />,
            color: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            urgent: stats.scheduleRequests > 0,
        },
        {
            label: 'Tổng Câu Hỏi trong QB',
            value: stats.totalQuestions,
            icon: <FileText className="w-6 h-6" />,
            color: 'from-purple-500 to-violet-600',
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            urgent: false,
        },
    ];

    const quickLinks = [
        { label: 'Duyệt Ngân Hàng Câu Hỏi', desc: 'Xem xét và phê duyệt câu hỏi từ giáo viên', path: '/qb-approval', icon: '✅', color: 'hover:border-amber-400', badge: stats.pendingQB },
        { label: 'Phân Công Giáo Viên', desc: 'Giao lớp và bài kiểm tra cho giáo viên', path: '/class-management', icon: '👩‍🏫', color: 'hover:border-blue-400', badge: 0 },
        { label: 'Duyệt Yêu Cầu Đổi Lịch', desc: 'Xem xét đề nghị thay đổi lịch từ giáo viên', path: '/class-management', icon: '📅', color: 'hover:border-green-400', badge: stats.scheduleRequests },
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
                        <p className="text-gray-500 text-sm">Quản lý chất lượng đề thi và lịch giảng dạy</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                            <div className="text-xs text-amber-600 font-medium mt-1">⚡ Cần xử lý</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Tác Vụ Ưu Tiên</h2>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">Câu Hỏi Chờ Duyệt Gần Đây</h2>
                    </div>
                    <button
                        onClick={() => navigate('/qb-approval')}
                        className="text-sm text-indigo-600 font-medium hover:underline"
                    >
                        Xem tất cả →
                    </button>
                </div>
                <div className="space-y-3">
                    {[
                        { teacher: 'GV. Nguyễn Thị B', question: 'Dạng N3 - Nghe hiểu đoạn hội thoại ngắn', level: 'TOPIK I', time: '10 phút trước' },
                        { teacher: 'GV. Trần Văn C', question: 'Dạng R2 - Đọc hiểu bảng thông báo', level: 'TOPIK II', time: '45 phút trước' },
                        { teacher: 'GV. Lê Thị D', question: 'Dạng W1 - Viết câu theo gợi ý', level: 'TOPIK II', time: '2 giờ trước' },
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
        </div>
    );
};

export default ManagerDashboard;
