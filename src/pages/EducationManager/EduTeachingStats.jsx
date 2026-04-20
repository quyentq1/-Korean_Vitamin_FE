import { useState, useEffect, useMemo } from 'react';
import educationManagerService from '../../services/educationManagerService';
import {
    Search, Users, GraduationCap, Calendar, CheckCircle, XCircle,
    ChevronLeft, ChevronRight, BookOpen, TrendingUp, Clock
} from 'lucide-react';

const PAGE_SIZE = 15;

const EduTeachingStats = () => {
    const [activeTab, setActiveTab] = useState('teachers');
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState({});

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [teacherData, studentData] = await Promise.all([
                educationManagerService.getTeacherTeachingDays(),
                educationManagerService.getStudentAttendanceDays()
            ]);
            setTeachers(Array.isArray(teacherData) ? teacherData : []);
            setStudents(Array.isArray(studentData) ? studentData : []);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

    // Teachers
    const filteredTeachers = useMemo(() => {
        let list = [...teachers];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(t =>
                t.teacherName?.toLowerCase().includes(term) ||
                t.classBreakdown?.some(c => c.className?.toLowerCase().includes(term))
            );
        }
        if (sortBy === 'name') list.sort((a, b) => a.teacherName?.localeCompare(b.teacherName));
        else if (sortBy === 'days_desc') list.sort((a, b) => (b.totalTeachingDays || 0) - (a.totalTeachingDays || 0));
        else if (sortBy === 'days_asc') list.sort((a, b) => (a.totalTeachingDays || 0) - (b.totalTeachingDays || 0));
        else if (sortBy === 'classes') list.sort((a, b) => (b.classBreakdown?.length || 0) - (a.classBreakdown?.length || 0));
        return list;
    }, [teachers, searchTerm, sortBy]);

    // Students
    const filteredStudents = useMemo(() => {
        let list = [...students];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(s =>
                s.studentName?.toLowerCase().includes(term) ||
                s.classBreakdown?.some(c => c.className?.toLowerCase().includes(term))
            );
        }
        if (sortBy === 'name') list.sort((a, b) => a.studentName?.localeCompare(b.studentName));
        else if (sortBy === 'present_desc') list.sort((a, b) => (b.totalDaysPresent || 0) - (a.totalDaysPresent || 0));
        else if (sortBy === 'absent_desc') list.sort((a, b) => (b.totalDaysAbsent || 0) - (a.totalDaysAbsent || 0));
        else if (sortBy === 'rate_asc') {
            list.sort((a, b) => {
                const ra = a.totalDaysPresent + a.totalDaysAbsent > 0 ? a.totalDaysPresent / (a.totalDaysPresent + a.totalDaysAbsent) : 0;
                const rb = b.totalDaysPresent + b.totalDaysAbsent > 0 ? b.totalDaysPresent / (b.totalDaysPresent + b.totalDaysAbsent) : 0;
                return ra - rb;
            });
        }
        return list;
    }, [students, searchTerm, sortBy]);

    const currentData = activeTab === 'teachers' ? filteredTeachers : filteredStudents;
    const totalPages = Math.ceil(currentData.length / PAGE_SIZE);
    const pagedData = currentData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const totalTeachingDays = teachers.reduce((s, t) => s + (t.totalTeachingDays || 0), 0);
    const totalPresentDays = students.reduce((s, st) => s + (st.totalDaysPresent || 0), 0);
    const totalAbsentDays = students.reduce((s, st) => s + (st.totalDaysAbsent || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-400 text-sm">Đang tải thống kê...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 rounded-2xl p-6 lg:p-8 mb-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32" />
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Thống kê dạy / học</h1>
                            <p className="text-purple-100 text-sm mt-0.5">
                                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                        <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">{teachers.length}</div>
                            <div className="text-xs text-gray-400">Giáo viên</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                        <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">{students.length}</div>
                            <div className="text-xs text-gray-400">Học viên</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 p-4 flex items-center gap-3 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                        <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">{totalPresentDays}</div>
                            <div className="text-xs text-gray-400">Ngày có mặt</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500 p-4 flex items-center gap-3 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                        <div className="w-11 h-11 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-red-600">{totalAbsentDays}</div>
                            <div className="text-xs text-gray-400">Ngày vắng</div>
                        </div>
                    </div>
                </div>

                {/* Main Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Tabs + Toolbar */}
                    <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex gap-1 mr-auto">
                            <button onClick={() => { setActiveTab('teachers'); setSearchTerm(''); setCurrentPage(1); }}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    activeTab === 'teachers'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-white'
                                }`}>
                                <GraduationCap className="w-4 h-4 inline mr-1.5" /> Giáo viên
                            </button>
                            <button onClick={() => { setActiveTab('students'); setSearchTerm(''); setCurrentPage(1); }}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    activeTab === 'students'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-white'
                                }`}>
                                <Users className="w-4 h-4 inline mr-1.5" /> Học viên
                            </button>
                        </div>
                        <div className="relative min-w-[180px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Tìm tên..."
                                value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                        </div>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                            {activeTab === 'teachers' ? (
                                <>
                                    <option value="name">Tên A-Z</option>
                                    <option value="days_desc">Ngày dạy: Nhiều nhất</option>
                                    <option value="days_asc">Ngày dạy: Ít nhất</option>
                                    <option value="classes">Nhiều lớp nhất</option>
                                </>
                            ) : (
                                <>
                                    <option value="name">Tên A-Z</option>
                                    <option value="present_desc">Có mặt: Nhiều nhất</option>
                                    <option value="absent_desc">Vắng: Nhiều nhất</option>
                                    <option value="rate_asc">Tỷ lệ: Thấp nhất</option>
                                </>
                            )}
                        </select>
                    </div>

                    {/* Teacher Table */}
                    {activeTab === 'teachers' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase w-16">STT</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase">Giáo viên</th>
                                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase">Tổng ngày dạy</th>
                                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase">Số lớp</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase">Chi tiết lớp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pagedData.length === 0 ? (
                                        <tr><td colSpan="5" className="px-5 py-10 text-center text-gray-400">
                                            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                                            Không tìm thấy giáo viên
                                        </td></tr>
                                    ) : pagedData.map((t, i) => {
                                        const expanded = expandedRows[t.teacherId];
                                        const breakdown = t.classBreakdown || [];
                                        return (
                                            <tr key={t.teacherId} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="px-5 py-3.5 text-sm text-gray-400 font-medium">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                                            {t.teacherName?.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-800">{t.teacherName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className="text-lg font-bold text-indigo-600">{t.totalTeachingDays}</span>
                                                    <span className="text-xs text-gray-400 ml-1">ngày</span>
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                                                        <BookOpen className="w-3 h-3" /> {breakdown.length}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {breakdown.length === 0 ? (
                                                        <span className="text-xs text-gray-400">Chưa phân công</span>
                                                    ) : breakdown.length <= 2 || expanded ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {breakdown.map(c => (
                                                                <span key={c.classId} className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-medium border border-purple-100">
                                                                    {c.className}: <strong>{c.teachingDays}</strong> ngày
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-medium border border-purple-100">
                                                                {breakdown[0].className}: <strong>{breakdown[0].teachingDays}</strong> ngày
                                                            </span>
                                                            <button onClick={() => toggleRow(t.teacherId)}
                                                                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                                                                +{breakdown.length - 1} lớp khác
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Student Table */}
                    {activeTab === 'students' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase w-16">STT</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase">Học viên</th>
                                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase">Có mặt</th>
                                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase">Vắng</th>
                                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase">Tỷ lệ</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase">Chi tiết lớp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pagedData.length === 0 ? (
                                        <tr><td colSpan="6" className="px-5 py-10 text-center text-gray-400">
                                            <Users className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                                            Không tìm thấy học viên
                                        </td></tr>
                                    ) : pagedData.map((s, i) => {
                                        const total = (s.totalDaysPresent || 0) + (s.totalDaysAbsent || 0);
                                        const rate = total > 0 ? Math.round((s.totalDaysPresent / total) * 100) : 0;
                                        const expanded = expandedRows[s.studentId];
                                        const breakdown = s.classBreakdown || [];
                                        return (
                                            <tr key={s.studentId} className={`hover:bg-indigo-50/30 transition-colors ${rate < 80 && total > 0 ? 'bg-red-50/20' : ''}`}>
                                                <td className="px-5 py-3.5 text-sm text-gray-400 font-medium">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                                            {s.studentName?.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-800">{s.studentName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-center text-sm font-bold text-green-600">{s.totalDaysPresent}</td>
                                                <td className="px-5 py-3.5 text-center text-sm font-bold text-red-500">{s.totalDaysAbsent}</td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${
                                                                rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                            }`} style={{ width: `${rate}%` }} />
                                                        </div>
                                                        <span className={`text-sm font-bold ${
                                                            rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600'
                                                        }`}>{rate}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {breakdown.length === 0 ? (
                                                        <span className="text-xs text-gray-400">Chưa đăng ký</span>
                                                    ) : breakdown.length <= 2 || expanded ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {breakdown.map(c => {
                                                                const cRate = c.totalSessions > 0 ? Math.round((c.presentDays / c.totalSessions) * 100) : 0;
                                                                return (
                                                                    <span key={c.classId} className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${
                                                                        cRate >= 80
                                                                            ? 'bg-green-50 text-green-700 border-green-100'
                                                                            : 'bg-red-50 text-red-700 border-red-100'
                                                                    }`}>
                                                                        {c.className}: <strong>{c.presentDays}</strong>/{c.totalSessions}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 font-medium border border-gray-100">
                                                                {breakdown[0].className}: <strong>{breakdown[0].presentDays}</strong>/{breakdown[0].totalSessions}
                                                            </span>
                                                            <button onClick={() => toggleRow(s.studentId)}
                                                                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                                                                +{breakdown.length - 1} lớp khác
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                            <span className="text-xs text-gray-400">
                                Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, currentData.length)} / {currentData.length} {activeTab === 'teachers' ? 'giáo viên' : 'học viên'}
                            </span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                    className="p-2 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .reduce((acc, p, i, arr) => {
                                        if (i > 0 && arr[i - 1] < p - 1) acc.push('...');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) =>
                                        p === '...' ? (
                                            <span key={`dot-${i}`} className="px-2 text-xs text-gray-400">...</span>
                                        ) : (
                                            <button key={p} onClick={() => setCurrentPage(p)}
                                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                                    currentPage === p
                                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
                                                        : 'hover:bg-white text-gray-600'
                                                }`}>{p}</button>
                                        )
                                    )
                                }
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EduTeachingStats;
