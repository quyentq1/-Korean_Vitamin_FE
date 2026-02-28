import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, ClipboardList, Bell, ChevronRight, UserCheck, Clock } from 'lucide-react';

/**
 * BUG-04 FIX: Staff Dashboard — thay thế "Coming soon" placeholder
 */
const StaffDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ students: 0, classes: 0, pendingReg: 0, newConsultations: 0 });

    // Mock stats — sẽ kết nối API thực sau
    useEffect(() => {
        setStats({ students: 128, classes: 12, pendingReg: 5, newConsultations: 3 });
    }, []);

    const statCards = [
        {
            label: 'Tổng Học Viên',
            value: stats.students,
            icon: <Users className="w-6 h-6" />,
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
        },
        {
            label: 'Lớp Đang Hoạt Động',
            value: stats.classes,
            icon: <BookOpen className="w-6 h-6" />,
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
        },
        {
            label: 'Đăng Ký Chờ Xử Lý',
            value: stats.pendingReg,
            icon: <ClipboardList className="w-6 h-6" />,
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50',
            text: 'text-amber-700',
        },
        {
            label: 'Tư Vấn Mới',
            value: stats.newConsultations,
            icon: <Bell className="w-6 h-6" />,
            color: 'from-purple-500 to-purple-600',
            bg: 'bg-purple-50',
            text: 'text-purple-700',
        },
    ];

    const quickLinks = [
        { label: 'Quản Lý Học Viên', desc: 'Xem, thêm, chỉnh sửa thông tin học viên', path: '/student-management', icon: '👤', color: 'hover:border-blue-400' },
        { label: 'Quản Lý Lớp Học', desc: 'Tạo lớp, xếp lịch, phân giáo viên', path: '/class-management', icon: '🏫', color: 'hover:border-emerald-400' },
        { label: 'Phân Quyền', desc: 'Quản lý vai trò và quyền truy cập', path: '/role-management', icon: '🔐', color: 'hover:border-purple-400' },
        { label: 'Đăng Ký Khoá Học', desc: 'Xem và xử lý đơn đăng ký mới', path: '/registration-management', icon: '📋', color: 'hover:border-amber-400' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
                        🏢
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
                        <p className="text-gray-500 text-sm">Tổng quan hoạt động của trung tâm</p>
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
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Truy Cập Nhanh</h2>
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

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-800">Hoạt Động Gần Đây</h2>
                </div>
                <div className="space-y-3">
                    {[
                        { icon: '📝', text: 'Đăng ký mới từ Nguyễn Văn A — TOPIK 2', time: '5 phút trước', badge: 'Mới', badgeColor: 'bg-green-100 text-green-700' },
                        { icon: '✅', text: 'Lớp TK-24A đã được tạo thành công', time: '1 giờ trước', badge: 'Hoàn thành', badgeColor: 'bg-blue-100 text-blue-700' },
                        { icon: '💬', text: 'Yêu cầu tư vấn từ khách — SĐT 0901234567', time: '2 giờ trước', badge: 'Chờ xử lý', badgeColor: 'bg-amber-100 text-amber-700' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-gray-700 text-sm">{item.text}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                                <span className="text-xs text-gray-400 hidden sm:block">{item.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
