import { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import RescheduleSessionModal from '../../components/RescheduleSessionModal';
import {
    ChevronRight, ChevronLeft, Users, Calendar, BookOpen,
    Clock, AlertTriangle, Lock, Save, XCircle, MapPin,
    CheckCircle, AlertCircle, CheckSquare, ClipboardCheck, CalendarClock
} from 'lucide-react';

const TeacherClassManagement = () => {
    const { t } = useTranslation();
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [classResults, setClassResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const [editSession, setEditSession] = useState(null);
    const [editData, setEditData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [rescheduleSession, setRescheduleSession] = useState(null);

    useEffect(() => { fetchClasses(); }, []);

    const fetchClasses = async () => {
        try {
            const data = await teacherService.getTeacherClasses();
            setClasses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const selectClass = async (classId) => {
        setSelectedClassId(classId);
        setActiveTab('overview');
        setEditSession(null);
        setMessage(null);
        if (!classId) { setClassResults(null); return; }
        setLoading(true);
        try {
            const data = await teacherService.getClassAttendanceResults(classId);
            setClassResults(data);
        } catch (error) {
            console.error('Error fetching class data:', error);
            setClassResults(null);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = async (session) => {
        setMessage(null);
        try {
            const data = await teacherService.getScheduleAttendance(session.scheduleId);
            const studentList = data.students || [];
            if (studentList.length > 0) {
                const mapped = studentList.map(s => ({
                    studentId: s.studentId, studentName: s.studentName, avatar: s.avatar, status: s.status
                }));
                setEditData(mapped);
                setOriginalData(mapped.map(s => ({ ...s })));
            } else {
                const classStudents = await teacherService.getClassStudents(selectedClassId);
                const arr = Array.isArray(classStudents) ? classStudents : [];
                const mapped = arr.map(s => ({
                    studentId: s.id, studentName: s.fullName, avatar: s.avatar, status: 'ABSENT'
                }));
                setEditData(mapped);
                setOriginalData(mapped.map(s => ({ ...s })));
            }
            setEditSession(session);
        } catch (error) {
            console.error('Error loading attendance:', error);
            setMessage({ type: 'error', text: t('teacher.classMgmt.cannotLoadStudents') });
        }
    };

    const toggleStatus = (studentId) => {
        setEditData(prev => prev.map(a =>
            a.studentId === studentId ? { ...a, status: a.status === 'ABSENT' ? 'PRESENT' : 'ABSENT' } : a
        ));
    };

    const markAllPresent = () => setEditData(prev => prev.map(a => ({ ...a, status: 'PRESENT' })));

    const handleSave = async () => {
        if (!editSession || saving) return;
        setSaving(true);
        setMessage(null);
        try {
            await teacherService.saveAttendance({
                scheduleId: editSession.scheduleId,
                attendanceRecords: editData.map(a => ({ studentId: a.studentId, status: a.status }))
            });
            setMessage({ type: 'success', text: t('teacher.classMgmt.saveSuccess') });
            setEditSession(null);
            selectClass(selectedClassId);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data?.error || t('teacher.classMgmt.saveError');
            setMessage({ type: 'error', text: msg });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => { setEditData(originalData); setMessage(null); };
    const handleBack = () => { setEditSession(null); setEditData([]); setOriginalData([]); setMessage(null); };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try { return format(new Date(dateStr), 'EEE, dd/MM/yyyy', { locale: vi }); } catch { return dateStr; }
    };
    const hasChanges = JSON.stringify(editData) !== JSON.stringify(originalData);
    const selectedClass = classes.find(c => c.id === selectedClassId);
    const sessions = classResults?.sessionStats || [];
    const studentStats = classResults?.studentStats || [];

    const avgRate = studentStats.length > 0
        ? Math.round(studentStats.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / studentStats.length * 100) / 100
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">

                {/* ==================== GRADIENT HEADER BANNER ==================== */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 rounded-2xl p-6 lg:p-8 mb-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold">{t('teacher.classMgmt.title')}</h1>
                                <p className="text-purple-100 text-sm mt-0.5">
                                    {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================== STATS SUMMARY CARDS ==================== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 group">
                        <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">{classes.length}</div>
                        <div className="text-xs text-gray-500 mt-1">{t('teacher.classMgmt.totalClasses')}</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 group">
                        <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">{classResults?.totalStudents || 0}</div>
                        <div className="text-xs text-gray-500 mt-1">{t('teacher.classMgmt.students')}</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 group">
                        <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-violet-600 bg-clip-text text-transparent">{classResults?.totalSessions || 0}</div>
                        <div className="text-xs text-gray-500 mt-1">{t('teacher.classMgmt.totalSessions')}</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 group">
                        <div className="w-11 h-11 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 mb-3 group-hover:scale-110 transition-transform">
                            <ClipboardCheck className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">{avgRate}%</div>
                        <div className="text-xs text-gray-500 mt-1">{t('teacher.classMgmt.attendanceRate')}</div>
                    </div>
                </div>

                {/* ==================== MAIN GRID ==================== */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* ========== LEFT: CLASS LIST ========== */}
                    <div className="lg:col-span-1">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5" />
                            {t('teacher.classMgmt.classes')} ({classes.length})
                        </h2>
                        <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-1">
                            {classes.length === 0 ? (
                                <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400 border border-gray-100">
                                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                                    {t('teacher.classMgmt.noClassesAssigned')}
                                </div>
                            ) : classes.map(cls => (
                                <div key={cls.id} onClick={() => selectClass(cls.id)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
                                        selectedClassId === cls.id
                                            ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg shadow-indigo-100/50'
                                            : 'border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5'
                                    }`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-semibold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">{cls.className}</div>
                                            <span className={`inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                                selectedClassId === cls.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                                            }`}>{cls.classCode}</span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 mt-1 transition-transform ${
                                            selectedClassId === cls.id ? 'text-indigo-500 translate-x-0.5' : 'text-gray-300'
                                        }`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ========== RIGHT: CLASS DETAIL ========== */}
                    <div className="lg:col-span-3">

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                    <p className="text-gray-400 text-sm">{t('common.loading')}</p>
                                </div>
                            </div>
                        ) : !selectedClassId ? (
                            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                                <h3 className="text-lg font-semibold text-gray-400 mb-1">{t('teacher.classMgmt.selectClass')}</h3>
                                <p className="text-sm text-gray-300">{t('teacher.classMgmt.selectClassHint')}</p>
                            </div>
                        ) : editSession ? (
                            /* ==================== ATTENDANCE EDIT VIEW ==================== */
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <button onClick={handleBack}
                                        className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all">
                                        <ChevronLeft className="w-4 h-4" /> {t('common.back')}
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-sm text-gray-600 font-medium">{selectedClass?.className}</span>
                                </div>

                                {message && (
                                    <div className={`mb-4 p-4 rounded-2xl flex items-center gap-2 ${
                                        message.type === 'success'
                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-100'
                                            : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-100'
                                    }`}>
                                        {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                        {message.text}
                                    </div>
                                )}

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    {/* Gradient Header */}
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg font-bold">
                                                    {editSession.lessonNumber ? `${t('teacher.classMgmt.session')} ${editSession.lessonNumber}` : ''} {t('teacher.classMgmt.attendance')}
                                                </h2>
                                                <p className="text-indigo-100 text-sm mt-0.5">{formatDate(editSession.lessonDate)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl font-medium">
                                                    {t('teacher.classMgmt.present')}: {editData.filter(a => a.status === 'PRESENT').length}
                                                </span>
                                                <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl font-medium">
                                                    {t('teacher.classMgmt.absent')}: {editData.filter(a => a.status === 'ABSENT').length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider w-16">{t('teacher.classMgmt.index')}</th>
                                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">{t('teacher.classMgmt.students')}</th>
                                                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase tracking-wider">{t('common.status')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {editData.map((student, index) => (
                                                    <tr key={student.studentId} className="hover:bg-indigo-50/30 transition-colors">
                                                        <td className="px-5 py-4 text-sm text-gray-400 font-medium">{index + 1}</td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {student.avatar ? (
                                                                    <img src={student.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100" />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                                                        {student.studentName?.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <span className="text-sm font-medium text-gray-800">{student.studentName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button onClick={() => toggleStatus(student.studentId)}
                                                                    className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                                                        student.status === 'PRESENT'
                                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-200'
                                                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                                    }`}>{t('teacher.classMgmt.present')}</button>
                                                                <button onClick={() => toggleStatus(student.studentId)}
                                                                    className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                                                        student.status === 'ABSENT'
                                                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200'
                                                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                                    }`}>{t('teacher.classMgmt.absent')}</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="bg-gray-50/80 border-t border-gray-100 p-5">
                                        <div className="flex items-center gap-3">
                                            <button onClick={markAllPresent}
                                                className="px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 text-sm font-medium transition-all border border-emerald-200">
                                                <CheckSquare className="w-4 h-4 inline mr-1.5" />
                                                {t('teacher.classMgmt.markAllPresent')}
                                            </button>
                                            <div className="flex-1"></div>
                                            <button onClick={handleCancel} disabled={saving || !hasChanges}
                                                className="px-5 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium disabled:opacity-40 border border-gray-200 transition-all">
                                                <XCircle className="w-4 h-4 inline mr-1.5" />
                                                {t('common.cancel')}
                                            </button>
                                            <button onClick={handleSave} disabled={saving}
                                                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 font-medium transition-all duration-300 shadow-md shadow-indigo-200">
                                                <Save className="w-4 h-4 inline mr-1.5" />
                                                {saving ? t('common.loading') : t('common.save')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ==================== MAIN VIEW WITH TABS ==================== */
                            <div className="space-y-5">

                                {/* Class Header Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-gray-50 to-indigo-50/50 p-5 border-b border-gray-100">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                    {selectedClass?.className?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-800">{selectedClass?.className}</h2>
                                                    <p className="text-sm text-gray-500">{selectedClass?.classCode}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 text-sm">
                                                <span className="flex items-center gap-1.5 text-gray-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                                                    <Users className="w-4 h-4 text-indigo-500" /> {classResults?.totalStudents || 0} {t('teacher.classMgmt.studentsCount')}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-gray-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                                                    <Calendar className="w-4 h-4 text-purple-500" /> {classResults?.totalSessions || 0} {t('teacher.classMgmt.sessionsCount')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 p-2 bg-gray-50/50">
                                        <button onClick={() => setActiveTab('overview')}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                                                activeTab === 'overview' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' : 'text-gray-600 hover:bg-white'
                                            }`}>{t('teacher.classMgmt.overview')}</button>
                                        <button onClick={() => setActiveTab('schedule')}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                                                activeTab === 'schedule' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' : 'text-gray-600 hover:bg-white'
                                            }`}>{t('teacher.classMgmt.schedule')}</button>
                                        <button onClick={() => setActiveTab('attendance')}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                                                activeTab === 'attendance' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' : 'text-gray-600 hover:bg-white'
                                            }`}>{t('teacher.classMgmt.attendance')}</button>
                                    </div>
                                </div>

                                {/* ===== TAB: OVERVIEW ===== */}
                                {activeTab === 'overview' && (
                                    <>
                                        {studentStats.length > 0 && (
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-green-200 group-hover:scale-110 transition-transform">
                                                        <CheckCircle className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-green-600">{studentStats.filter(s => !s.isLocked && !s.isWarning).length}</div>
                                                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t('teacher.classMgmt.normal')}</div>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500 p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-200 group-hover:scale-110 transition-transform">
                                                        <AlertTriangle className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-amber-600">{studentStats.filter(s => s.isWarning).length}</div>
                                                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t('teacher.classMgmt.warning')}</div>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500 p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center shadow-md shadow-red-200 group-hover:scale-110 transition-transform">
                                                        <Lock className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-red-600">{studentStats.filter(s => s.isLocked).length}</div>
                                                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t('teacher.classMgmt.locked')}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-100">
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider w-16">{t('teacher.classMgmt.index')}</th>
                                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">{t('teacher.classMgmt.students')}</th>
                                                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase tracking-wider">{t('teacher.classMgmt.rate')}</th>
                                                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase tracking-wider">{t('teacher.classMgmt.presentAbsent')}</th>
                                                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase tracking-wider">{t('common.status')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {studentStats.length === 0 ? (
                                                        <tr><td colSpan="5" className="px-5 py-10 text-center text-gray-400">{t('teacher.classMgmt.noStudents')}</td></tr>
                                                    ) : studentStats.map((stat, index) => (
                                                        <tr key={stat.studentId} className="hover:bg-indigo-50/30 transition-colors">
                                                            <td className="px-5 py-4 text-sm text-gray-400 font-medium">{index + 1}</td>
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    {stat.avatar ? (
                                                                        <img src={stat.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100" />
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                                                            {stat.studentName?.charAt(0)}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-800">{stat.studentName}</div>
                                                                        <div className="text-xs text-gray-400">{stat.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4 text-center">
                                                                <span className={`text-sm font-bold ${
                                                                    stat.attendanceRate >= 80 ? 'text-green-600' :
                                                                    stat.attendanceRate >= 60 ? 'text-amber-600' : 'text-red-600'
                                                                }`}>{stat.attendanceRate}%</span>
                                                            </td>
                                                            <td className="px-5 py-4 text-center text-sm">
                                                                <span className="text-green-600 font-medium">{stat.presentCount}</span>
                                                                <span className="text-gray-300 mx-1">/</span>
                                                                <span className="text-red-500 font-medium">{stat.absentCount}</span>
                                                            </td>
                                                            <td className="px-5 py-4 text-center">
                                                                {stat.isLocked ? (
                                                                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                                                                        <Lock className="w-3 h-3" /> {t('teacher.classMgmt.lockedShort')}
                                                                    </span>
                                                                ) : stat.isWarning ? (
                                                                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                                                                        <AlertTriangle className="w-3 h-3" /> {t('teacher.classMgmt.warning')}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">{t('teacher.classMgmt.normal')}</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}

                                {/* ===== TAB: SCHEDULE ===== */}
                                {activeTab === 'schedule' && (
                                    <div className="space-y-3">
                                        {sessions.length === 0 ? (
                                            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                                                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                                                <p className="text-gray-400">{t('teacher.classMgmt.noSchedule')}</p>
                                            </div>
                                        ) : sessions.map(session => {
                                            const marked = session.totalMarked > 0;
                                            const canMark = new Date() >= new Date(`${session.lessonDate}T${session.startTime || '00:00'}`);
                                            const isFuture = new Date(`${session.lessonDate}T23:59`) > new Date();
                                            const d = new Date();
                                            const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                                            const canReschedule = !marked && session.lessonDate > today && session.status !== 'CANCELLED';
                                            const borderColor = marked ? 'border-l-green-500' : canMark ? 'border-l-indigo-500' : 'border-l-gray-300';
                                            return (
                                                <div key={session.scheduleId}
                                                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${borderColor} p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white text-[10px] font-bold shadow-sm ${
                                                                marked
                                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                                                    : canMark
                                                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                                                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                                            }`}>
                                                                <span className="uppercase tracking-wider">{t('teacher.classMgmt.session')}</span>
                                                                <span className="text-xl leading-none">{session.lessonNumber}</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-800">{formatDate(session.lessonDate)}</div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                                                    <span>{session.startTime?.substring(0, 5)} - {session.endTime?.substring(0, 5)}</span>
                                                                    {session.room && (
                                                                        <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                                                            <MapPin className="w-3 h-3" /> {t('teacher.classMgmt.room')} {session.room}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {session.topic && <div className="text-xs text-gray-400 mt-1">{session.topic}</div>}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {canReschedule && (
                                                                <button onClick={() => setRescheduleSession(session)}
                                                                    className="px-3 py-2.5 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 text-sm font-medium transition-all border border-amber-200">
                                                                    <CalendarClock className="w-4 h-4 inline mr-1" /> {t('teacher.classMgmt.reschedule')}
                                                                </button>
                                                            )}
                                                            {marked ? (
                                                                <>
                                                                    <button onClick={() => startEdit(session)}
                                                                        className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg text-sm font-medium transition-all duration-300">
                                                                        {t('common.edit')}
                                                                    </button>
                                                                    <div className="bg-gray-50 rounded-xl p-2 text-right min-w-[90px]">
                                                                        <div className="text-xs text-green-600 font-semibold">{session.present} {t('teacher.classMgmt.present')}</div>
                                                                        <div className="text-xs text-red-500 font-semibold">{session.absent} {t('teacher.classMgmt.absent')}</div>
                                                                    </div>
                                                                </>
                                                            ) : canMark ? (
                                                                <button onClick={() => startEdit(session)}
                                                                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg text-sm font-medium transition-all duration-300">
                                                                    {t('teacher.classMgmt.takeAttendance')}
                                                                </button>
                                                            ) : (
                                                                <span className="px-4 py-2.5 bg-gray-50 text-gray-400 rounded-xl text-sm border border-gray-100">
                                                                    {t('teacher.classMgmt.notTimeYet')} ({session.startTime?.substring(0, 5)})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* ===== TAB: ATTENDANCE DETAIL ===== */}
                                {activeTab === 'attendance' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        {/* Student Summary */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 border-b border-gray-100">
                                                <h3 className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                                                    <Users className="w-4 h-4" /> {t('teacher.classMgmt.summary')} ({studentStats.length} {t('teacher.classMgmt.students')})
                                                </h3>
                                            </div>
                                            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                                                {studentStats.length === 0 ? (
                                                    <div className="p-6 text-center text-gray-400 text-sm">{t('teacher.classMgmt.noData')}</div>
                                                ) : studentStats.map(stat => (
                                                    <div key={stat.studentId} className="px-5 py-3 flex items-center justify-between hover:bg-indigo-50/30 transition-colors">
                                                        <div className="flex items-center gap-2.5">
                                                            {stat.avatar ? (
                                                                <img src={stat.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                                                                    {stat.studentName?.charAt(0)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-800">{stat.studentName}</span>
                                                                <div className="text-xs text-gray-400">
                                                                    <span className="text-green-600">{stat.presentCount} {t('teacher.classMgmt.presentShort')}</span>
                                                                    <span className="mx-0.5">/</span>
                                                                    <span className="text-red-500">{stat.absentCount} {t('teacher.classMgmt.absentShort')}</span>
                                                                    <span className="ml-1 font-semibold" style={{ color: stat.attendanceRate >= 80 ? '#059669' : stat.attendanceRate >= 60 ? '#d97706' : '#dc2626' }}>
                                                                        {stat.attendanceRate}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {stat.isLocked ? (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">{t('teacher.classMgmt.lockedShort')}</span>
                                                        ) : stat.isWarning ? (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{t('teacher.classMgmt.warningShort')}</span>
                                                        ) : (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{t('teacher.classMgmt.ok')}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Session Timeline */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 border-b border-gray-100">
                                                <h3 className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" /> {t('teacher.classMgmt.sessionDetails')} ({sessions.length})
                                                </h3>
                                            </div>
                                            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                                                {sessions.length === 0 ? (
                                                    <div className="p-6 text-center text-gray-400 text-sm">{t('teacher.classMgmt.noSessions')}</div>
                                                ) : sessions.map(session => {
                                                    const marked = session.totalMarked > 0;
                                                    const canMark = new Date() >= new Date(`${session.lessonDate}T${session.startTime || '00:00'}`);
                                                    return (
                                                    <div key={session.scheduleId}
                                                        className={`px-5 py-3.5 flex items-center justify-between transition-colors group ${
                                                            (marked || canMark) ? 'hover:bg-indigo-50/30 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                                                        }`}
                                                        onClick={() => { if (marked || canMark) startEdit(session); }}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded-full shrink-0 ${
                                                                session.totalMarked > 0 ? 'bg-green-500 ring-[3px] ring-green-100' : 'bg-gray-300 ring-[3px] ring-gray-100'
                                                            }`} />
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                                    {t('teacher.classMgmt.session')} {session.lessonNumber} - {formatDate(session.lessonDate)}
                                                                </div>
                                                                <div className="text-xs text-gray-400 mt-0.5">
                                                                    {session.startTime?.substring(0, 5)} - {session.endTime?.substring(0, 5)}
                                                                    {session.room && <span className="ml-1.5">• {t('teacher.classMgmt.room')} {session.room}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {session.totalMarked > 0 ? (
                                                                <>
                                                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{session.present} {t('teacher.classMgmt.present')}</span>
                                                                    <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{session.absent} {t('teacher.classMgmt.absent')}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{t('teacher.classMgmt.notAttendedYet')}</span>
                                                            )}
                                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                                        </div>
                                                    </div>
                                                );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {rescheduleSession && (
                <RescheduleSessionModal
                    session={{ ...rescheduleSession, className: selectedClass?.className }}
                    classStartDate={selectedClass?.startDate}
                    classEndDate={selectedClass?.endDate}
                    onClose={() => setRescheduleSession(null)}
                    onSuccess={() => {
                        setRescheduleSession(null);
                        setMessage({ type: 'success', text: t('teacher.classMgmt.rescheduleSuccess') });
                        selectClass(selectedClassId);
                    }}
                />
            )}
        </div>
    );
};

export default TeacherClassManagement;
