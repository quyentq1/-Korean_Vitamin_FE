import { useState, useEffect, useMemo } from 'react';
import educationManagerService from '../../services/educationManagerService';
import {
    Search, Filter, Users, Calendar, CheckCircle, AlertTriangle, Lock,
    Unlock, ChevronLeft, ChevronRight, BookOpen, ClipboardCheck, Clock,
    ArrowLeft, UserCheck, UserX
} from 'lucide-react';

const PAGE_SIZE = 15;

const EduAttendanceHistory = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('students');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('name');

    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionDetail, setSessionDetail] = useState(null);
    const [sessionLoading, setSessionLoading] = useState(false);

    useEffect(() => { fetchClasses(); }, []);

    const fetchClasses = async () => {
        try {
            const data = await educationManagerService.getAllClasses();
            setClasses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const selectClass = async (classId) => {
        setSelectedClass(classId);
        setLoading(true);
        setSearchTerm('');
        setStatusFilter('all');
        setCurrentPage(1);
        setSortBy('name');
        try {
            const data = await educationManagerService.getClassAttendanceHistory(classId);
            setStats(data);
        } catch (error) {
            console.error('Error fetching attendance stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async (studentId, studentName) => {
        if (!window.confirm(`Mở khóa tài khoản của ${studentName}?`)) return;
        try {
            await educationManagerService.unlockStudent(studentId);
            selectClass(selectedClass);
        } catch (error) {
            console.error('Error unlocking student:', error);
        }
    };

    const viewSessionDetail = async (session) => {
        setSelectedSession(session);
        setSessionLoading(true);
        try {
            const data = await educationManagerService.getScheduleAttendance(session.scheduleId);
            setSessionDetail(data);
        } catch (error) {
            console.error('Error fetching session detail:', error);
            setSessionDetail(null);
        } finally {
            setSessionLoading(false);
        }
    };

    const closeSessionDetail = () => {
        setSelectedSession(null);
        setSessionDetail(null);
    };

    const filteredStudents = useMemo(() => {
        let list = stats?.studentStats || [];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(s =>
                s.studentName?.toLowerCase().includes(term) ||
                s.email?.toLowerCase().includes(term)
            );
        }

        if (statusFilter === 'normal') list = list.filter(s => !s.isLocked && !s.isWarning);
        else if (statusFilter === 'warning') list = list.filter(s => s.isWarning && !s.isLocked);
        else if (statusFilter === 'locked') list = list.filter(s => s.isLocked);

        if (sortBy === 'name') list.sort((a, b) => a.studentName?.localeCompare(b.studentName));
        else if (sortBy === 'rate_asc') list.sort((a, b) => (a.attendanceRate || 0) - (b.attendanceRate || 0));
        else if (sortBy === 'rate_desc') list.sort((a, b) => (b.attendanceRate || 0) - (a.attendanceRate || 0));
        else if (sortBy === 'absent') list.sort((a, b) => (b.absentCount || 0) - (a.absentCount || 0));

        return list;
    }, [stats, searchTerm, statusFilter, sortBy]);

    const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
    const pagedStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const countNormal = (stats?.studentStats || []).filter(s => !s.isLocked && !s.isWarning).length;
    const countWarning = (stats?.studentStats || []).filter(s => s.isWarning && !s.isLocked).length;
    const countLocked = (stats?.studentStats || []).filter(s => s.isLocked).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 rounded-2xl p-6 lg:p-8 mb-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32" />
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <ClipboardCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Lịch sử điểm danh</h1>
                            <p className="text-purple-100 text-sm mt-0.5">
                                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Class List */}
                    <div className="lg:col-span-1">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5" /> Lớp học ({classes.length})
                        </h2>
                        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
                            {classes.length === 0 ? (
                                <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400 border border-gray-100">
                                    Chưa có lớp học
                                </div>
                            ) : classes.map(cls => (
                                <button key={cls.id} onClick={() => selectClass(cls.id)}
                                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 group ${
                                        selectedClass === cls.id
                                            ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg shadow-indigo-100/50'
                                            : 'border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5'
                                    }`}>
                                    <div className="font-semibold text-sm text-gray-800 group-hover:text-indigo-600 transition-colors">{cls.className}</div>
                                    <span className={`inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                        selectedClass === cls.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                                    }`}>{cls.classCode}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                    <p className="text-gray-400 text-sm">Đang tải...</p>
                                </div>
                            </div>
                        ) : !stats ? (
                            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                                <h3 className="text-lg font-semibold text-gray-400 mb-1">Chọn lớp học</h3>
                                <p className="text-sm text-gray-300">Chọn lớp từ danh sách bên trái để xem điểm danh</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-gray-800">{stats.totalSessions}</div>
                                            <div className="text-xs text-gray-400">Tổng buổi</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-gray-800">{stats.totalStudents}</div>
                                            <div className="text-xs text-gray-400">Học viên</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-green-600">{countNormal}</div>
                                            <div className="text-xs text-gray-400">Bình thường</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-amber-600">{countWarning}</div>
                                            <div className="text-xs text-gray-400">Cảnh báo</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-red-600">{countLocked}</div>
                                            <div className="text-xs text-gray-400">Đã khóa</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="flex gap-1 p-2 bg-gray-50/50 border-b border-gray-100">
                                        <button onClick={() => setActiveTab('students')}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                activeTab === 'students'
                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                                                    : 'text-gray-600 hover:bg-white'
                                            }`}>
                                            <Users className="w-4 h-4 inline mr-1.5" /> Theo học viên
                                        </button>
                                        <button onClick={() => setActiveTab('sessions')}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                activeTab === 'sessions'
                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                                                    : 'text-gray-600 hover:bg-white'
                                            }`}>
                                            <Calendar className="w-4 h-4 inline mr-1.5" /> Theo buổi học
                                        </button>
                                    </div>

                                    {/* Tab: Students */}
                                    {activeTab === 'students' && (
                                        <div>
                                            {/* Toolbar */}
                                            <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
                                                <div className="relative flex-1 min-w-[200px]">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input type="text" placeholder="Tìm tên hoặc email..."
                                                        value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                                </div>
                                                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                                                    <option value="all">Tất cả trạng thái</option>
                                                    <option value="normal">Bình thường</option>
                                                    <option value="warning">Cảnh báo</option>
                                                    <option value="locked">Đã khóa</option>
                                                </select>
                                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                                                    <option value="name">Sắp xếp: Tên A-Z</option>
                                                    <option value="rate_asc">Tỷ lệ: Thấp → Cao</option>
                                                    <option value="rate_desc">Tỷ lệ: Cao → Thấp</option>
                                                    <option value="absent">Vắng nhiều nhất</option>
                                                </select>
                                            </div>

                                            {/* Table */}
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead>
                                                        <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase w-16">STT</th>
                                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase">Học viên</th>
                                                            <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase">Có mặt</th>
                                                            <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase">Vắng</th>
                                                            <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase">Tỷ lệ</th>
                                                            <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase">Trạng thái</th>
                                                            <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase">Hành động</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {pagedStudents.length === 0 ? (
                                                            <tr><td colSpan="7" className="px-5 py-10 text-center text-gray-400">
                                                                <Search className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                                                                Không tìm thấy học viên
                                                            </td></tr>
                                                        ) : pagedStudents.map((s, i) => (
                                                            <tr key={s.studentId} className="hover:bg-indigo-50/30 transition-colors">
                                                                <td className="px-5 py-3.5 text-sm text-gray-400 font-medium">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                                                                <td className="px-5 py-3.5">
                                                                    <div className="flex items-center gap-3">
                                                                        {s.avatar ? (
                                                                            <img src={s.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100" />
                                                                        ) : (
                                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                                                                {s.studentName?.charAt(0)}
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-800">{s.studentName}</div>
                                                                            <div className="text-xs text-gray-400">{s.email}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-3.5 text-center text-sm font-medium text-green-600">{s.presentCount}</td>
                                                                <td className="px-5 py-3.5 text-center text-sm font-medium text-red-500">{s.absentCount}</td>
                                                                <td className="px-5 py-3.5 text-center">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                            <div className={`h-full rounded-full ${
                                                                                s.attendanceRate >= 80 ? 'bg-green-500' :
                                                                                s.attendanceRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                                            }`} style={{ width: `${s.attendanceRate || 0}%` }} />
                                                                        </div>
                                                                        <span className={`text-sm font-bold ${
                                                                            s.attendanceRate >= 80 ? 'text-green-600' :
                                                                            s.attendanceRate >= 50 ? 'text-amber-600' : 'text-red-600'
                                                                        }`}>{s.attendanceRate}%</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-3.5 text-center">
                                                                    {s.isLocked ? (
                                                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                                                                            <Lock className="w-3 h-3" /> Khóa
                                                                        </span>
                                                                    ) : s.isWarning ? (
                                                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                                                                            <AlertTriangle className="w-3 h-3" /> Cảnh báo
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                                                            <CheckCircle className="w-3 h-3" /> Bình thường
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-5 py-3.5 text-center">
                                                                    {s.isLocked && (
                                                                        <button onClick={() => handleUnlock(s.studentId, s.studentName)}
                                                                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium transition-colors">
                                                                            <Unlock className="w-3 h-3" /> Mở khóa
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                                                    <span className="text-xs text-gray-400">
                                                        Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} / {filteredStudents.length} học viên
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
                                    )}

                                    {/* Tab: Sessions */}
                                    {activeTab === 'sessions' && (
                                        selectedSession ? (
                                            /* ===== Session Detail View ===== */
                                            <div>
                                                <button onClick={closeSessionDetail}
                                                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all mb-4">
                                                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                                                </button>

                                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-bold">Buổi {selectedSession.lessonNumber}</h3>
                                                            <p className="text-indigo-100 text-sm mt-1">
                                                                {selectedSession.lessonDate && new Date(selectedSession.lessonDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                                <span className="ml-2">
                                                                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                                                                    {selectedSession.startTime?.substring(0, 5)} - {selectedSession.endTime?.substring(0, 5)}
                                                                </span>
                                                                {selectedSession.topic && <span className="ml-2">• {selectedSession.topic}</span>}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <div className="text-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                                                                <div className="text-2xl font-bold">{selectedSession.present}</div>
                                                                <div className="text-xs text-indigo-100">Có mặt</div>
                                                            </div>
                                                            <div className="text-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                                                                <div className="text-2xl font-bold">{selectedSession.absent}</div>
                                                                <div className="text-xs text-indigo-100">Vắng</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {sessionLoading ? (
                                                    <div className="flex justify-center py-12">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                    </div>
                                                ) : sessionDetail?.students?.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full">
                                                            <thead>
                                                                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase w-16">STT</th>
                                                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase">Học viên</th>
                                                                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase">Trạng thái</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-50">
                                                                {sessionDetail.students
                                                                    .sort((a, b) => a.status === b.status ? a.studentName?.localeCompare(b.studentName) : (a.status === 'ABSENT' ? -1 : 1))
                                                                    .map((s, i) => (
                                                                    <tr key={s.studentId} className={`hover:bg-indigo-50/30 transition-colors ${s.status === 'ABSENT' ? 'bg-red-50/30' : ''}`}>
                                                                        <td className="px-5 py-3.5 text-sm text-gray-400 font-medium">{i + 1}</td>
                                                                        <td className="px-5 py-3.5">
                                                                            <div className="flex items-center gap-3">
                                                                                {s.avatar ? (
                                                                                    <img src={s.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100" />
                                                                                ) : (
                                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                                                                        {s.studentName?.charAt(0)}
                                                                                    </div>
                                                                                )}
                                                                                <span className="text-sm font-medium text-gray-800">{s.studentName}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-5 py-3.5 text-center">
                                                                            {s.status === 'PRESENT' ? (
                                                                                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium">
                                                                                    <UserCheck className="w-3.5 h-3.5" /> Có mặt
                                                                                </span>
                                                                            ) : (
                                                                                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-100 text-red-700 font-medium">
                                                                                    <UserX className="w-3.5 h-3.5" /> Vắng mặt
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="p-10 text-center text-gray-400">
                                                        <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                                                        Buổi học này chưa có dữ liệu điểm danh
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                        <div className="divide-y divide-gray-50">
                                            {(stats.sessionStats || []).length === 0 ? (
                                                <div className="p-10 text-center text-gray-400">
                                                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                                                    Chưa có buổi học
                                                </div>
                                            ) : (stats.sessionStats || []).map(session => {
                                                const total = session.present + session.absent;
                                                const rate = total > 0 ? Math.round((session.present / total) * 100) : 0;
                                                return (
                                                    <div key={session.scheduleId}
                                                        onClick={() => session.totalMarked > 0 && viewSessionDetail(session)}
                                                        className={`px-5 py-4 flex items-center justify-between transition-colors group ${
                                                            session.totalMarked > 0 ? 'hover:bg-indigo-50/30 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                                                        }`}>
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white text-[10px] font-bold shadow-sm ${
                                                                session.totalMarked > 0
                                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                                                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                                            }`}>
                                                                <span className="uppercase tracking-wider">Buổi</span>
                                                                <span className="text-lg leading-none">{session.lessonNumber}</span>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                                    {session.lessonDate && new Date(session.lessonDate).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                                </div>
                                                                <div className="text-xs text-gray-400 mt-0.5">
                                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                                    {session.startTime?.substring(0, 5)} - {session.endTime?.substring(0, 5)}
                                                                    {session.topic && <span className="ml-2">• {session.topic}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {session.totalMarked > 0 ? (
                                                                <>
                                                                    <div className="text-right">
                                                                        <div className="text-xs font-medium text-green-600">{session.present} Có mặt</div>
                                                                        <div className="text-xs font-medium text-red-500">{session.absent} Vắng</div>
                                                                    </div>
                                                                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
                                                                    </div>
                                                                    <span className="text-sm font-bold text-green-600 min-w-[40px] text-right">{rate}%</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Chưa điểm danh</span>
                                                            )}
                                                            <ChevronRight className={`w-4 h-4 ${session.totalMarked > 0 ? 'text-gray-300 group-hover:text-indigo-400' : 'text-gray-200'} transition-colors`} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EduAttendanceHistory;
