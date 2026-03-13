import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, Users, GraduationCap, FileText, TrendingUp, TrendingDown,
    PlusCircle, ArrowUpRight, Clock, Star, AlertCircle, CheckCircle2,
    BarChart3, Activity
} from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';

const EduManagerDashboard = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        educationManagerService.getAllCourses()
            .then(data => setCourses(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const published = courses.filter(c => c.status === 'PUBLISHED').length;
    const draft = courses.filter(c => c.status === 'DRAFT').length;
    const archived = courses.filter(c => c.status === 'ARCHIVED').length;
    const recentCourses = [...courses].slice(0, 6);

    // Skeleton loader
    const Skeleton = ({ className }) => (
        <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
    );

    const statCards = [
        {
            label: 'Tổng khóa học',
            value: courses.length,
            sub: `${published} đã publish`,
            icon: BookOpen,
            gradient: 'from-violet-500 to-purple-700',
            iconBg: 'bg-violet-100 text-violet-700',
            trend: '+2 tháng này',
            up: true,
            path: '/edu-manager/courses',
        },
        {
            label: 'Khóa học Active',
            value: published,
            sub: `${draft} bản nháp`,
            icon: CheckCircle2,
            gradient: 'from-emerald-500 to-green-700',
            iconBg: 'bg-emerald-100 text-emerald-700',
            trend: `${published > 0 ? Math.round(published / Math.max(courses.length, 1) * 100) : 0}% tổng số`,
            up: true,
            path: '/edu-manager/courses',
        },
        {
            label: 'Giáo viên',
            value: '—',
            sub: 'Đang hoạt động',
            icon: GraduationCap,
            gradient: 'from-blue-500 to-cyan-600',
            iconBg: 'bg-blue-100 text-blue-700',
            trend: 'Xem danh sách',
            up: true,
            path: '/edu-manager/teachers',
        },
        {
            label: 'Học viên',
            value: '—',
            sub: 'Đã đăng ký',
            icon: Users,
            gradient: 'from-orange-500 to-red-600',
            iconBg: 'bg-orange-100 text-orange-700',
            trend: 'Xem danh sách',
            up: true,
            path: '/edu-manager/students',
        },
    ];

    const quickActions = [
        { icon: PlusCircle, label: 'Tạo khóa học', desc: 'Thêm khóa học mới', color: 'bg-violet-600 hover:bg-violet-700', path: '/edu-manager/courses/create' },
        { icon: FileText, label: 'Tạo bài test', desc: 'Soạn bài kiểm tra', color: 'bg-green-600 hover:bg-green-700', path: '/edu-manager/tests' },
        { icon: GraduationCap, label: 'Assign giáo viên', desc: 'Phân công vào lớp', color: 'bg-blue-600 hover:bg-blue-700', path: '/edu-manager/teachers' },
        { icon: Users, label: 'Quản lý học viên', desc: 'Thêm vào lớp học', color: 'bg-orange-500 hover:bg-orange-600', path: '/edu-manager/students' },
    ];

    const statusMap = {
        PUBLISHED: { label: 'Published', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
        DRAFT: { label: 'Draft', dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-600 ring-slate-200' },
        ARCHIVED: { label: 'Archived', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
    };

    return (
        <div className="space-y-7 w-full">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/edu-manager/courses/create')}
                    className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl hover:bg-violet-700 active:scale-95 transition-all font-medium text-sm shadow-sm shadow-violet-200"
                >
                    <PlusCircle className="w-4 h-4" />
                    Tạo khóa học mới
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {statCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={i}
                            onClick={() => navigate(card.path)}
                            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-bold text-slate-900">
                                    {loading ? <span className="inline-block w-10 h-8 bg-slate-200 rounded animate-pulse" /> : card.value}
                                </p>
                                <p className="text-sm font-medium text-slate-700">{card.label}</p>
                                <p className="text-xs text-slate-400">{card.sub}</p>
                            </div>
                            <div className={`mt-4 flex items-center gap-1 text-xs font-medium ${card.up ? 'text-emerald-600' : 'text-red-500'}`}>
                                {card.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                {card.trend}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Course status breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <BarChart3 className="w-4.5 h-4.5 text-violet-600" style={{ width: '1.125rem', height: '1.125rem' }} />
                        <h2 className="font-semibold text-slate-800">Phân bổ khóa học</h2>
                    </div>
                    {loading ? (
                        <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                    ) : courses.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">Chưa có khóa học</p>
                    ) : (
                        <div className="space-y-4">
                            {[
                                { label: 'Published', count: published, color: 'bg-emerald-500' },
                                { label: 'Draft', count: draft, color: 'bg-slate-400' },
                                { label: 'Archived', count: archived, color: 'bg-amber-400' },
                            ].map(item => {
                                const pct = courses.length > 0 ? Math.round((item.count / courses.length) * 100) : 0;
                                return (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-slate-600 font-medium">{item.label}</span>
                                            <span className="text-slate-900 font-bold">{item.count}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{pct}% tổng số</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <Activity className="w-4 h-4 text-violet-600" />
                        <h2 className="font-semibold text-slate-800">Thao tác nhanh</h2>
                    </div>
                    <div className="space-y-2.5">
                        {quickActions.map((action, i) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={i}
                                    onClick={() => navigate(action.path)}
                                    className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                                >
                                    <div className={`w-9 h-9 rounded-xl ${action.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                                        <p className="text-xs text-slate-400">{action.desc}</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-violet-500 transition-colors" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Status summary */}
                <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-2xl p-5 text-white shadow-xl">
                    <h2 className="font-semibold text-violet-200 mb-1">Tóm tắt hệ thống</h2>
                    <p className="text-xs text-violet-400 mb-5">Education Manager Portal</p>
                    <div className="space-y-4">
                        {[
                            { label: 'Quản lý khóa học', desc: 'Tạo, sửa, publish, archive', ok: true },
                            { label: 'Phân công giáo viên', desc: 'Assign teacher vào lớp', ok: true },
                            { label: 'Quản lý học viên', desc: 'Thêm học viên vào lớp', ok: true },
                            { label: 'Soạn bài kiểm tra', desc: 'Chọn câu hoặc random QB', ok: true },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.ok ? 'bg-emerald-400/20 text-emerald-400' : 'bg-red-400/20 text-red-400'}`}>
                                    {item.ok
                                        ? <CheckCircle2 className="w-3.5 h-3.5" />
                                        : <AlertCircle className="w-3.5 h-3.5" />
                                    }
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white leading-none">{item.label}</p>
                                    <p className="text-xs text-violet-400 mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Courses Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-violet-600" />
                        <h2 className="font-semibold text-slate-800">Khóa học gần đây</h2>
                    </div>
                    <button
                        onClick={() => navigate('/edu-manager/courses')}
                        className="text-sm text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1"
                    >
                        Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
                ) : recentCourses.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="w-7 h-7 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">Chưa có khóa học nào</p>
                        <button onClick={() => navigate('/edu-manager/courses/create')} className="mt-3 text-violet-600 hover:underline text-sm font-medium">
                            + Tạo khóa học đầu tiên
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50">
                                {['Khóa học', 'Mã', 'Giá', 'Thời lượng', 'Trạng thái', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentCourses.map(course => {
                                const status = statusMap[course.status] || statusMap.DRAFT;
                                return (
                                    <tr key={course.id} className="hover:bg-violet-50/30 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                                                    <BookOpen className="w-4 h-4 text-violet-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-sm">{course.name}</p>
                                                    <p className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">{course.description || 'Chưa có mô tả'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">{course.code}</code>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-700 font-medium">
                                            {course.price ? `${Number(course.price).toLocaleString('vi-VN')}₫` : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-500">
                                            {course.duration ? (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />{course.duration}h
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ring-1 ${status.badge}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => navigate(`/edu-manager/courses/edit/${course.id}`)}
                                                className="text-xs text-violet-600 hover:text-violet-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Chỉnh sửa →
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EduManagerDashboard;
