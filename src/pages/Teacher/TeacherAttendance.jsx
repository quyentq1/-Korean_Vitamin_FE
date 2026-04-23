import { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, History, ChevronRight, Users, Calendar } from 'lucide-react';

const TeacherAttendance = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('today');

    // Today attendance state
    const [todaySchedules, setTodaySchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // History state
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [classResults, setClassResults] = useState(null);
    const [selectedHistorySession, setSelectedHistorySession] = useState(null);
    const [historyAttendance, setHistoryAttendance] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        fetchTodaySchedules();
        fetchTeacherClasses();
    }, []);

    // ==================== TODAY ATTENDANCE ====================

    const fetchTodaySchedules = async () => {
        setLoading(true);
        try {
            const data = await teacherService.getTodaySchedules();
            setTodaySchedules(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching today schedules:', error);
            setMessage({ type: 'error', text: t('teacher.attendance.cannotLoadSchedule') });
        } finally {
            setLoading(false);
        }
    };

    const selectSchedule = async (schedule) => {
        setSelectedSchedule(schedule);
        setMessage(null);
        try {
            const result = await teacherService.getScheduleAttendance(schedule.scheduleId);
            const studentList = result.students || [];
            setStudents(studentList);

            if (studentList.length > 0) {
                setAttendanceData(studentList.map(s => ({
                    studentId: s.studentId,
                    studentName: s.studentName,
                    avatar: s.avatar,
                    status: s.status
                })));
            } else {
                const classStudents = await teacherService.getClassStudents(schedule.classId);
                const studentArr = Array.isArray(classStudents) ? classStudents : [];
                setAttendanceData(studentArr.map(s => ({
                    studentId: s.id,
                    studentName: s.fullName,
                    avatar: s.avatar,
                    status: 'ABSENT'
                })));
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
            setMessage({ type: 'error', text: t('teacher.attendance.cannotLoadStudents') });
        }
    };

    const toggleStatus = (studentId) => {
        setAttendanceData(prev =>
            prev.map(a => a.studentId === studentId
                ? { ...a, status: a.status === 'ABSENT' ? 'PRESENT' : 'ABSENT' }
                : a
            )
        );
    };

    const saveAttendance = async () => {
        if (!selectedSchedule) return;
        setSaving(true);
        setMessage(null);
        try {
            await teacherService.markAttendance({
                scheduleId: selectedSchedule.scheduleId,
                attendanceRecords: attendanceData.map(a => ({
                    studentId: a.studentId,
                    status: a.status
                }))
            });
            setMessage({ type: 'success', text: t('teacher.attendance.markSuccess') });
            fetchTodaySchedules();
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data?.error || t('teacher.attendance.markError');
            setMessage({ type: 'error', text: msg });
        } finally {
            setSaving(false);
        }
    };

    const updateSingle = async (studentId, newStatus) => {
        try {
            await teacherService.updateAttendance(selectedSchedule.scheduleId, studentId, newStatus);
            setAttendanceData(prev =>
                prev.map(a => a.studentId === studentId ? { ...a, status: newStatus } : a)
            );
            setMessage({ type: 'success', text: t('teacher.attendance.updateSuccess') });
        } catch (error) {
            setMessage({ type: 'error', text: t('teacher.attendance.updateError') });
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'PRESENT') return 'bg-green-100 text-green-700';
        if (status === 'ABSENT') return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    const getStatusLabel = (status) => {
        if (status === 'PRESENT') return t('teacher.attendance.present');
        if (status === 'ABSENT') return t('teacher.attendance.absent');
        return status;
    };

    // ==================== ATTENDANCE HISTORY ====================

    const fetchTeacherClasses = async () => {
        try {
            const data = await teacherService.getTeacherClasses();
            setTeacherClasses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching teacher classes:', error);
        }
    };

    const selectClass = async (classId) => {
        setSelectedClassId(classId);
        setSelectedHistorySession(null);
        setHistoryAttendance(null);
        if (!classId) {
            setClassResults(null);
            return;
        }
        setHistoryLoading(true);
        try {
            const data = await teacherService.getClassAttendanceResults(classId);
            setClassResults(data);
        } catch (error) {
            console.error('Error fetching class attendance:', error);
            setClassResults(null);
        } finally {
            setHistoryLoading(false);
        }
    };

    const viewHistorySession = async (session) => {
        setSelectedHistorySession(session);
        try {
            const data = await teacherService.getScheduleAttendance(session.scheduleId);
            setHistoryAttendance(data);
        } catch (error) {
            console.error('Error fetching session attendance:', error);
            setHistoryAttendance(null);
        }
    };

    // ==================== RENDER ====================

    if (loading && activeTab === 'today') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">{t('teacher.attendance.title')}</h1>
                <span className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('today')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                        activeTab === 'today'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <ClipboardCheck className="w-5 h-5" />
                    {t('teacher.attendance.todayTab')}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                        activeTab === 'history'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <History className="w-5 h-5" />
                    {t('teacher.attendance.historyTab')}
                </button>
            </div>

            {message && (
                <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* ==================== TAB: TODAY ==================== */}
            {activeTab === 'today' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">{t('teacher.attendance.todaySchedule')}</h2>
                        {todaySchedules.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                                {t('teacher.attendance.noScheduleToday')}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todaySchedules.map((schedule) => (
                                    <div
                                        key={schedule.scheduleId}
                                        onClick={() => selectSchedule(schedule)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                            selectedSchedule?.scheduleId === schedule.scheduleId
                                                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                                : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow'
                                        }`}
                                    >
                                        <div className="font-semibold text-gray-800">{schedule.className}</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Buổi {schedule.lessonNumber} | {schedule.startTime?.substring(0, 5)} - {schedule.endTime?.substring(0, 5)}
                                        </div>
                                        {schedule.topic && (
                                            <div className="text-sm text-gray-500 mt-1">{schedule.topic}</div>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                schedule.attendanceCompleted
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {schedule.attendanceCompleted ? t('teacher.attendance.completed') : t('teacher.attendance.notCompleted')}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {schedule.attendanceCount || 0}/{schedule.totalStudents || 0}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        {selectedSchedule ? (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-700">
                                            {selectedSchedule.className} - Buổi {selectedSchedule.lessonNumber}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {selectedSchedule.startTime?.substring(0, 5)} - {selectedSchedule.endTime?.substring(0, 5)}
                                            {selectedSchedule.topic && ` | ${selectedSchedule.topic}`}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                                            {t('teacher.attendance.present')}: {attendanceData.filter(a => a.status === 'PRESENT').length}
                                        </span>
                                        <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                                            {t('teacher.attendance.absent')}: {attendanceData.filter(a => a.status === 'ABSENT').length}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg border overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('teacher.attendance.index')}</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('teacher.attendance.student')}</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('common.status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {attendanceData.map((student, index) => (
                                                <tr key={student.studentId} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                                        <div className="flex items-center gap-2">
                                                            {student.avatar ? (
                                                                <img src={student.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">{student.studentName?.charAt(0)}</div>
                                                            )}
                                                            {student.studentName}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => toggleStatus(student.studentId)}
                                                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                                                    student.status === 'PRESENT'
                                                                        ? 'bg-green-500 text-white shadow-sm'
                                                                        : 'bg-gray-200 text-gray-500'
                                                                }`}
                                                            >
                                                                {t('teacher.attendance.present')}
                                                            </button>
                                                            <button
                                                                onClick={() => toggleStatus(student.studentId)}
                                                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                                                    student.status === 'ABSENT'
                                                                        ? 'bg-red-500 text-white shadow-sm'
                                                                        : 'bg-gray-200 text-gray-500'
                                                                }`}
                                                            >
                                                                {t('teacher.attendance.absent')}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center gap-3 mt-4">
                                    <button
                                        onClick={saveAttendance}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                                    >
                                        {saving ? t('common.loading') : t('teacher.attendance.save')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAttendanceData(prev => prev.map(a => ({ ...a, status: 'PRESENT' })));
                                        }}
                                        className="px-4 py-2.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                                    >
                                        {t('teacher.attendance.markAllPresent')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-400">
                                {t('teacher.attendance.selectSchedule')}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ==================== TAB: HISTORY ==================== */}
            {activeTab === 'history' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Class selector + Session list */}
                    <div className="lg:col-span-1 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('teacher.attendance.selectClass')}</label>
                            <select
                                value={selectedClassId || ''}
                                onChange={(e) => selectClass(e.target.value || null)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            >
                                <option value="">{t('teacher.attendance.selectClassPlaceholder')}</option>
                                {teacherClasses.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.className}</option>
                                ))}
                            </select>
                        </div>

                        {historyLoading && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        )}

                        {classResults && !historyLoading && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {t('teacher.attendance.scheduleCount', { count: classResults.totalSessions || 0 })}
                                </h3>
                                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                    {(classResults.sessionStats || []).length === 0 ? (
                                        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
                                            {t('teacher.attendance.noSchedule')}
                                        </div>
                                    ) : (
                                        classResults.sessionStats.map(session => (
                                            <div
                                                key={session.scheduleId}
                                                onClick={() => viewHistorySession(session)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                    selectedHistorySession?.scheduleId === session.scheduleId
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-800">
                                                            {t('teacher.attendance.session')} {session.lessonNumber}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            {session.lessonDate}
                                                            {session.topic ? ` • ${session.topic}` : ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {session.totalMarked > 0 ? (
                                                            <>
                                                                <span className="text-xs text-green-600 font-medium">
                                                                    {session.present} {t('teacher.attendance.presentShort')}
                                                                </span>
                                                                <span className="text-xs text-red-500 font-medium">
                                                                    {session.absent} {t('teacher.attendance.absentShort')}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">{t('teacher.attendance.notCompleted')}</span>
                                                        )}
                                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Session detail / Student stats */}
                    <div className="lg:col-span-2">
                        {/* View selected session attendance */}
                        {selectedHistorySession && historyAttendance ? (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-700">
                                            {classResults?.className} - Buổi {selectedHistorySession.lessonNumber}
                                        </h2>
                                        <p className="text-sm text-gray-500">{selectedHistorySession.lessonDate}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                                            {t('teacher.attendance.present')}: {historyAttendance.students?.filter(s => s.status === 'PRESENT').length || 0}
                                        </span>
                                        <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                                            {t('teacher.attendance.absent')}: {historyAttendance.students?.filter(s => s.status === 'ABSENT').length || 0}
                                        </span>
                                    </div>
                                </div>

                                {historyAttendance.students?.length > 0 ? (
                                    <div className="bg-white rounded-lg border overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học viên</th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {historyAttendance.students.map((student, index) => (
                                                    <tr key={student.studentId} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                                            <div className="flex items-center gap-2">
                                                                {student.avatar ? (
                                                                    <img src={student.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                                                                ) : (
                                                                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">{student.studentName?.charAt(0)}</div>
                                                                )}
                                                                {student.studentName}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(student.status)}`}>
                                                                {getStatusLabel(student.status)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                                        {t('teacher.attendance.noSessionData')}
                                    </div>
                                )}

                                {/* Back button */}
                                <button
                                    onClick={() => { setSelectedHistorySession(null); setHistoryAttendance(null); }}
                                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    &larr; {t('teacher.attendance.backToSessionList')}
                                </button>
                            </div>
                        ) : classResults && !historyLoading ? (
                            /* Show student attendance summary */
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-700">
                                        {classResults.className} - {t('teacher.attendance.overview')}
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="text-gray-500">
                                            <Users className="w-4 h-4 inline mr-1" />
                                            {classResults.totalStudents || 0} {t('teacher.attendance.students')}
                                        </span>
                                        <span className="text-gray-500">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            {classResults.totalSessions || 0} {t('teacher.attendance.sessions')}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg border overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('teacher.attendance.index')}</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('teacher.attendance.student')}</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('teacher.attendance.rate')}</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('teacher.attendance.present')}</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('teacher.attendance.absent')}</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('common.status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {(classResults.studentStats || []).map((stat, index) => (
                                                <tr key={stat.studentId} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                                        <div className="flex items-center gap-2">
                                                            {stat.avatar ? (
                                                                <img src={stat.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">{stat.studentName?.charAt(0)}</div>
                                                            )}
                                                            <div>
                                                                <div>{stat.studentName}</div>
                                                                <div className="text-xs text-gray-400">{stat.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`text-sm font-semibold ${
                                                            stat.attendanceRate >= 80 ? 'text-green-600' :
                                                            stat.attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                        }`}>
                                                            {stat.attendanceRate}%
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm text-green-600 font-medium">
                                                        {stat.presentCount}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm text-red-500 font-medium">
                                                        {stat.absentCount}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {stat.isLocked ? (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">{t('teacher.attendance.locked')}</span>
                                                        ) : stat.isWarning ? (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">{t('teacher.attendance.warning')}</span>
                                                        ) : (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">{t('teacher.attendance.normal')}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-400">
                                {selectedClassId
                                    ? t('common.loading')
                                    : t('teacher.attendance.selectClassToView')}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;
