import { useEffect, useState, useMemo } from 'react';
import { Search, GraduationCap, RefreshCw, Filter, X, Clock, Calendar } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';

const EduTeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachingStats, setTeachingStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (monthFilter) {
                const [y, m] = monthFilter.split('-');
                const start = `${y}-${m}-01`;
                const end = `${y}-${m}-${new Date(y, m, 0).getDate()}`;
                params.startDate = start;
                params.endDate = end;
            }
            const [teachersData, classesData, statsData] = await Promise.all([
                educationManagerService.getAllTeachers(),
                educationManagerService.getAllClasses(),
                educationManagerService.getTeacherTeachingDays(params),
            ]);
            setTeachers(Array.isArray(teachersData) ? teachersData : []);
            setClasses(Array.isArray(classesData) ? classesData : []);
            setTeachingStats(Array.isArray(statsData) ? statsData : []);
        } catch (e) {
            console.error('Error fetching teacher data:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [monthFilter]);

    const statsMap = useMemo(() => {
        const map = {};
        teachingStats.forEach(s => { map[s.teacherId] = s; });
        return map;
    }, [teachingStats]);

    const enrichedTeachers = useMemo(() => {
        return teachers.map(t => {
            const stats = statsMap[t.id] || {};
            return {
                ...t,
                totalTeachingDays: stats.totalTeachingDays || 0,
                classBreakdown: stats.classBreakdown || [],
            };
        });
    }, [teachers, statsMap]);

    const filteredTeachers = useMemo(() => {
        let list = enrichedTeachers;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(t =>
                t.fullName?.toLowerCase().includes(term) ||
                t.email?.toLowerCase().includes(term)
            );
        }
        if (classFilter) {
            const filterClassId = Number(classFilter);
            list = list.filter(t =>
                t.classBreakdown.some(cb => cb.classId === filterClassId)
            );
        }
        return list;
    }, [enrichedTeachers, searchTerm, classFilter]);

    const totalSessions = enrichedTeachers.reduce((sum, t) => sum + t.totalTeachingDays, 0);

    // Generate month options (last 12 months)
    const monthOptions = useMemo(() => {
        const opts = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
            opts.push({ value: val, label });
        }
        return opts;
    }, []);

    // Get current month label
    const currentMonthLabel = useMemo(() => {
        const opt = monthOptions.find(m => m.value === monthFilter);
        return opt?.label || 'Tất cả';
    }, [monthFilter, monthOptions]);

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Giáo viên</h1>
                    <p className="text-gray-500 text-sm">{filteredTeachers.length} giáo viên • {totalSessions} buổi dạy {monthFilter ? `(${currentMonthLabel})` : ''}</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Làm mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm giáo viên..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <select
                    value={classFilter}
                    onChange={e => setClassFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="">Tất cả lớp</option>
                    {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.className}</option>
                    ))}
                </select>
                <select
                    value={monthFilter}
                    onChange={e => setMonthFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="">Tất cả tháng</option>
                    {monthOptions.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
                {(searchTerm || classFilter || monthFilter) && (
                    <button
                        onClick={() => { setSearchTerm(''); setClassFilter(''); setMonthFilter(''); }}
                        className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <X className="w-3.5 h-3.5" /> Xóa lọc
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-400 text-sm">Đang tải...</p>
                    </div>
                ) : filteredTeachers.length === 0 ? (
                    <div className="p-12 text-center">
                        <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                        <p className="text-gray-400">Không tìm thấy giáo viên</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Giáo viên</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Lớp đã dạy</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Ngày bắt đầu</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Ngày kết thúc</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Tổng buổi dạy</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTeachers.map(teacher => {
                                    if (teacher.classBreakdown.length === 0) {
                                        return (
                                            <tr key={teacher.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                            {teacher.fullName?.charAt(0) || 'G'}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-800">{teacher.fullName}</div>
                                                            <div className="text-xs text-gray-400">{teacher.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-400 italic">Chưa dạy</td>
                                                <td className="px-5 py-4 text-center text-sm text-gray-300">-</td>
                                                <td className="px-5 py-4 text-center text-sm text-gray-300">-</td>
                                                <td className="px-5 py-4 text-center text-sm text-gray-300">0</td>
                                            </tr>
                                        );
                                    }

                                    return teacher.classBreakdown.map((cb, idx) => {
                                        const cls = classes.find(c => c.id === cb.classId);
                                        return (
                                            <tr key={`${teacher.id}-${cb.classId}`} className="hover:bg-gray-50">
                                                {idx === 0 ? (
                                                    <td className="px-5 py-4" rowSpan={teacher.classBreakdown.length}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                                {teacher.fullName?.charAt(0) || 'G'}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-800">{teacher.fullName}</div>
                                                                <div className="text-xs text-gray-400">{teacher.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                ) : null}
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                                                        <GraduationCap className="w-3.5 h-3.5" />
                                                        {cb.className}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center text-sm text-gray-600">
                                                    {cls?.startDate ? new Date(cls.startDate).toLocaleDateString('vi-VN') : '-'}
                                                </td>
                                                <td className="px-5 py-4 text-center text-sm text-gray-600">
                                                    {cls?.endDate ? new Date(cls.endDate).toLocaleDateString('vi-VN') : '-'}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`text-sm font-bold ${
                                                        cb.teachingDays > 0 ? 'text-indigo-600' : 'text-gray-300'
                                                    }`}>
                                                        {cb.teachingDays}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EduTeacherManagement;
