import { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { useTranslation } from 'react-i18next';

const StudentAttendanceTab = ({ classId }) => {
    const { t } = useTranslation();
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionList, setSessionList] = useState(null);
    const [overview, setOverview] = useState(null);

    useEffect(() => {
        fetchData();
    }, [classId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [historyData, overviewData] = await Promise.all([
                studentService.getClassAttendance(classId),
                studentService.getAttendanceOverview()
            ]);
            setAttendanceHistory(Array.isArray(historyData) ? historyData : []);
            const classOverview = (Array.isArray(overviewData) ? overviewData : [])
                .find(o => o.classId === Number(classId));
            setOverview(classOverview || null);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewSessionList = async (scheduleId) => {
        try {
            const data = await studentService.getSessionAttendanceList(classId, scheduleId);
            setSelectedSession(selectedSession === scheduleId ? null : scheduleId);
            setSessionList(data);
        } catch (error) {
            console.error('Error fetching session list:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const presentCount = attendanceHistory.filter(a => a.status === 'PRESENT').length;
    const absentCount = attendanceHistory.filter(a => a.status === 'ABSENT').length;
    const totalSessions = attendanceHistory.length;
    const rate = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : 100;

    return (
        <div className="space-y-6">
            {/* Overview Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
                    <div className="text-sm text-blue-500">{t('student.attendance.totalSessions')}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                    <div className="text-sm text-green-500">{t('student.attendance.present')}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                    <div className="text-sm text-red-500">{t('student.attendance.absent')}</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-600">{rate}%</div>
                    <div className="text-sm text-indigo-500">{t('student.attendance.attendanceRate')}</div>
                </div>
            </div>

            {/* Progress Bar */}
            {overview && (
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{t('student.attendance.presentRate')}</span>
                        <span className="text-sm text-gray-500">{overview.attendanceRate?.toFixed(1) || rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all ${
                                rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(rate, 100)}%` }}
                        ></div>
                    </div>
                    {overview.isWarning && (
                        <p className="mt-2 text-sm text-yellow-600">
                            {t('student.attendance.warning20Percent')}
                        </p>
                    )}
                    {overview.isLocked && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                            {t('student.attendance.lockedWarning')}
                        </p>
                    )}
                </div>
            )}

            {/* Attendance History */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                    <h3 className="font-semibold text-gray-700">{t('student.attendance.attendanceHistory')}</h3>
                </div>
                {attendanceHistory.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">{t('student.attendance.noAttendanceData')}</div>
                ) : (
                    <div className="divide-y">
                        {attendanceHistory.map((record) => (
                            <div key={record.attendanceId || record.scheduleId}>
                                <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-500">{t('student.attendance.session')} {record.lessonNumber}</span>
                                        <span className="text-sm text-gray-600">
                                            {record.lessonDate && new Date(record.lessonDate).toLocaleDateString('vi-VN')}
                                        </span>
                                        {record.topic && (
                                            <span className="text-xs text-gray-400">({record.topic})</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            record.status === 'PRESENT'
                                                ? 'bg-green-100 text-green-700'
                                                : record.status === 'ABSENT'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {record.status === 'PRESENT' ? t('student.attendance.present') : record.status === 'ABSENT' ? t('student.attendance.absent') : record.status}
                                        </span>
                                        <button
                                            onClick={() => viewSessionList(record.scheduleId)}
                                            className="text-xs text-indigo-600 hover:text-indigo-800"
                                        >
                                            {t('student.attendance.viewClass')}
                                        </button>
                                    </div>
                                </div>
                                {selectedSession === record.scheduleId && sessionList && (
                                    <div className="px-4 py-3 bg-gray-50 border-t">
                                        <div className="text-xs font-medium text-gray-500 mb-2">
                                            {t('student.attendance.classAttendanceList')} - {t('student.attendance.session')} {sessionList.lessonNumber} ({sessionList.lessonDate && new Date(sessionList.lessonDate).toLocaleDateString('vi-VN')})
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {(sessionList.students || []).map((s) => (
                                                <div key={s.studentId} className="flex items-center gap-2 text-xs">
                                                    <span className={`w-2 h-2 rounded-full ${s.status === 'PRESENT' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {s.avatar ? (
                                                        <img src={s.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-medium text-indigo-600">{s.studentName?.charAt(0)}</div>
                                                    )}
                                                    <span className="text-gray-600">{s.studentName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendanceTab;
