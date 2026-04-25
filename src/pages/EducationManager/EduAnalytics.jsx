import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle, XCircle, Clock, Users,
    FileText, AlertCircle, BarChart3, Calendar, BookOpen,
    GraduationCap, ClipboardCheck, Award, Target, UserCheck, UserX,
    RefreshCw, Layers, TrendingUp, TrendingDown, Activity
} from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import examService from '../../services/examService';

const TABS = [
    { key: 'overview', labelKey: 'eduManager.analytics.tabOverview', icon: BarChart3 },
    { key: 'schedule', labelKey: 'eduManager.analytics.tabSchedule', icon: Calendar },
    { key: 'courses', labelKey: 'eduManager.analytics.tabCourses', icon: BookOpen },
    { key: 'attendance', labelKey: 'eduManager.analytics.tabAttendance', icon: ClipboardCheck },
    { key: 'classes', labelKey: 'eduManager.analytics.tabClasses', icon: Users },
    { key: 'exams', labelKey: 'eduManager.analytics.tabExams', icon: FileText },
];

const EduAnalytics = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [pendingExams, setPendingExams] = useState([]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [statsData, coursesData, classesData, teachersData, pendingData] = await Promise.allSettled([
                educationManagerService.getDashboardStats(),
                educationManagerService.getAllCourses(),
                educationManagerService.getAllClasses(),
                educationManagerService.getAllTeachers(),
                examService.getPendingExams ? examService.getPendingExams() : Promise.resolve([]),
            ]);
            setDashboardStats(statsData.status === 'fulfilled' ? (statsData.value?.data || statsData.value || {}) : {});
            setCourses(coursesData.status === 'fulfilled' ? (Array.isArray(coursesData.value) ? coursesData.value : []) : []);
            setClasses(classesData.status === 'fulfilled' ? (Array.isArray(classesData.value) ? classesData.value : []) : []);
            setTeachers(teachersData.status === 'fulfilled' ? (Array.isArray(teachersData.value) ? teachersData.value : []) : []);
            setPendingExams(pendingData.status === 'fulfilled' ? (Array.isArray(pendingData.value) ? pendingData.value : []) : []);
        } catch (error) {
            console.error('Failed to fetch analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    const courseStats = useMemo(() => {
        const published = courses.filter(c => c.status === 'PUBLISHED').length;
        const draft = courses.filter(c => c.status === 'DRAFT').length;
        const archived = courses.filter(c => c.status === 'ARCHIVED').length;
        const avgPrice = courses.length > 0
            ? Math.round(courses.reduce((sum, c) => sum + (Number(c.price) || 0), 0) / courses.length)
            : 0;
        const maxPrice = courses.length > 0 ? Math.max(...courses.map(c => Number(c.price) || 0)) : 0;
        const minPrice = courses.length > 0 ? Math.min(...courses.filter(c => c.price > 0).map(c => Number(c.price))) || 0 : 0;
        return { published, draft, archived, total: courses.length, avgPrice, maxPrice, minPrice };
    }, [courses]);

    const classStats = useMemo(() => {
        const totalStudents = classes.reduce((sum, c) => sum + (c.currentEnrollment || 0), 0);
        const activeClasses = classes.filter(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS' || (c.startDate && c.endDate)).length;
        const avgStudents = classes.length > 0 ? Math.round(totalStudents / classes.length) : 0;
        const maxStudents = classes.length > 0 ? Math.max(...classes.map(c => c.currentEnrollment || 0)) : 0;
        return { total: classes.length, totalStudents, activeClasses, avgStudents, maxStudents };
    }, [classes]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('eduManager.analytics.loadingStats')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('eduManager.analytics.title')}</h1>
                        <p className="text-sm text-gray-500 mt-1">{t('eduManager.analytics.subtitle')}</p>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                        <RefreshCw className="w-4 h-4" /> {t('eduManager.analytics.refresh')}
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 overflow-x-auto">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all text-sm whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {t(tab.labelKey)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <OverviewTab
                    dashboardStats={dashboardStats}
                    courseStats={courseStats}
                    classStats={classStats}
                    teachers={teachers}
                    pendingExams={pendingExams}
                    classes={classes}
                />
            )}
            {activeTab === 'schedule' && <ScheduleTab classes={classes} />}
            {activeTab === 'courses' && <CoursesTab courses={courses} courseStats={courseStats} />}
            {activeTab === 'attendance' && <AttendanceTab classes={classes} />}
            {activeTab === 'classes' && <ClassesTab classes={classes} classStats={classStats} teachers={teachers} />}
            {activeTab === 'exams' && <ExamsTab pendingExams={pendingExams} courses={courses} dashboardStats={dashboardStats} />}
        </div>
    );
};

const OverviewTab = ({ dashboardStats, courseStats, classStats, teachers, pendingExams, classes }) => {
    const { t } = useTranslation();
    const totalQuestions = (dashboardStats.approvedQuestions || 0) + (dashboardStats.pendingQuestions || 0) + (dashboardStats.rejectedQuestions || 0);
    const approvalRate = totalQuestions > 0
        ? Math.round(((dashboardStats.approvedQuestions || 0) / totalQuestions) * 100) : 0;
    const rejectionRate = totalQuestions > 0
        ? Math.round(((dashboardStats.rejectedQuestions || 0) / totalQuestions) * 100) : 0;
    const pendingRate = totalQuestions > 0
        ? Math.round(((dashboardStats.pendingQuestions || 0) / totalQuestions) * 100) : 0;

    const [scheduleOverview, setScheduleOverview] = useState({ total: 0, completed: 0, upcoming: 0 });
    useEffect(() => {
        if (classes.length === 0) return;
        let total = 0, completed = 0, upcoming = 0;
        const today = new Date().toISOString().split('T')[0];
        Promise.allSettled(
            classes.map(cls => educationManagerService.getClassDetails(cls.id))
        ).then(results => {
            results.forEach(r => {
                if (r.status === 'fulfilled') {
                    const schedules = r.value?.schedules || r.value?.data?.schedules || [];
                    total += schedules.length;
                    completed += schedules.filter(s => s.status === 'COMPLETED').length;
                    upcoming += schedules.filter(s => s.lessonDate >= today && s.status !== 'COMPLETED' && s.status !== 'CANCELLED').length;
                }
            });
            setScheduleOverview({ total, completed, upcoming });
        });
    }, [classes]);

    return (
        <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard icon={BookOpen} label={t('eduManager.analytics.kpiCourses')} value={courseStats.total} sub={`${courseStats.published} active`} color="violet" />
                <KpiCard icon={Users} label={t('eduManager.analytics.kpiClasses')} value={classStats.total} sub={`${classStats.totalStudents} ${t('eduManager.analytics.kpiStudents')}`} color="blue" />
                <KpiCard icon={GraduationCap} label={t('eduManager.analytics.kpiTeachers')} value={teachers.length} sub={t('eduManager.analytics.subActive')} color="emerald" />
                <KpiCard icon={Calendar} label={t('eduManager.analytics.kpiSessions')} value={scheduleOverview.total} sub={`${scheduleOverview.completed} ${t('eduManager.analytics.subCompleted')}`} color="cyan" />
                <KpiCard icon={FileText} label={t('eduManager.analytics.kpiQuestions')} value={totalQuestions} sub={`${dashboardStats.pendingQuestions || 0} ${t('eduManager.analytics.subPending')}`} color="amber" />
                <KpiCard icon={ClipboardCheck} label={t('eduManager.analytics.kpiPendingExams')} value={pendingExams.length} sub={pendingExams.length > 0 ? t('eduManager.analytics.subNeedAction') : t('eduManager.analytics.subReady')} color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Question Approval Donut */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Target className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.questionApprovalRate')}</h3>
                    </div>
                    <div className="flex items-center gap-8">
                        <DonutChart
                            segments={[
                                { value: dashboardStats.approvedQuestions || 0, color: '#10b981', label: t('eduManager.analytics.approved') },
                                { value: dashboardStats.rejectedQuestions || 0, color: '#ef4444', label: t('eduManager.analytics.rejected') },
                                { value: dashboardStats.pendingQuestions || 0, color: '#f59e0b', label: t('eduManager.analytics.pendingApproval') },
                            ]}
                            total={totalQuestions}
                        />
                        <div className="flex-1 space-y-3">
                            <LegendItem color="bg-emerald-500" label={t('eduManager.analytics.approved')} value={dashboardStats.approvedQuestions || 0} pct={approvalRate} />
                            <LegendItem color="bg-red-500" label={t('eduManager.analytics.rejected')} value={dashboardStats.rejectedQuestions || 0} pct={rejectionRate} />
                            <LegendItem color="bg-amber-500" label={t('eduManager.analytics.pendingApproval')} value={dashboardStats.pendingQuestions || 0} pct={pendingRate} />
                        </div>
                    </div>
                </div>

                {/* Course Status Pie */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-violet-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.courseStatusDistribution')}</h3>
                    </div>
                    <div className="flex items-center gap-8">
                        <DonutChart
                            segments={[
                                { value: courseStats.published, color: '#10b981', label: 'Published' },
                                { value: courseStats.draft, color: '#94a3b8', label: 'Draft' },
                                { value: courseStats.archived, color: '#f59e0b', label: 'Archived' },
                            ]}
                            total={courseStats.total}
                        />
                        <div className="flex-1 space-y-3">
                            <LegendItem color="bg-emerald-500" label="Published" value={courseStats.published} pct={courseStats.total > 0 ? Math.round((courseStats.published / courseStats.total) * 100) : 0} />
                            <LegendItem color="bg-slate-400" label="Draft" value={courseStats.draft} pct={courseStats.total > 0 ? Math.round((courseStats.draft / courseStats.total) * 100) : 0} />
                            <LegendItem color="bg-amber-400" label="Archived" value={courseStats.archived} pct={courseStats.total > 0 ? Math.round((courseStats.archived / courseStats.total) * 100) : 0} />
                        </div>
                    </div>
                </div>
            </div>

            {/* System Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.systemOverview')}</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <SummaryMetric label={t('eduManager.analytics.questionApprovalRateLabel')} value={`${approvalRate}%`} trend={approvalRate >= 70 ? 'up' : 'down'} />
                    <SummaryMetric label={t('eduManager.analytics.coursePublishRate')} value={courseStats.total > 0 ? `${Math.round((courseStats.published / courseStats.total) * 100)}%` : '0%'} trend={courseStats.published >= courseStats.draft ? 'up' : 'down'} />
                    <SummaryMetric label={t('eduManager.analytics.activeClassesLabel')} value={`${classStats.activeClasses}/${classStats.total}`} trend={classStats.activeClasses === classStats.total ? 'up' : 'down'} />
                    <SummaryMetric label={t('eduManager.analytics.avgStudentsPerClass')} value={classStats.avgStudents} trend="neutral" />
                    <SummaryMetric label={t('eduManager.analytics.pendingExamsLabel')} value={pendingExams.length} trend={pendingExams.length === 0 ? 'up' : 'down'} />
                </div>
            </div>
        </div>
    );
};

const ScheduleTab = ({ classes }) => {
    const { t } = useTranslation();
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [scheduleData, setScheduleData] = useState({
        totalSchedules: 0, completedSchedules: 0, scheduledSchedules: 0,
        cancelledSchedules: 0, rescheduledSchedules: 0, upcomingCount: 0,
        pastIncompleteCount: 0, classScheduleMap: [], dailyMap: {},
        completionRate: 0, cancellationRate: 0,
    });

    useEffect(() => {
        if (classes.length === 0) { setScheduleLoading(false); return; }
        setScheduleLoading(true);
        const today = new Date().toISOString().split('T')[0];
        let totalSchedules = 0, completedSchedules = 0, scheduledSchedules = 0;
        let cancelledSchedules = 0, rescheduledSchedules = 0, upcomingCount = 0, pastIncompleteCount = 0;
        const classScheduleMap = [];
        const dailyMap = {};

        Promise.allSettled(
            classes.map(cls => educationManagerService.getClassDetails(cls.id))
        ).then(results => {
            results.forEach((r, idx) => {
                if (r.status !== 'fulfilled') return;
                const cls = r.value?.data || r.value || {};
                const schedules = cls.schedules || [];
                totalSchedules += schedules.length;
                const completed = schedules.filter(s => s.status === 'COMPLETED').length;
                const scheduled = schedules.filter(s => s.status === 'SCHEDULED').length;
                const cancelled = schedules.filter(s => s.status === 'CANCELLED').length;
                const rescheduled = schedules.filter(s => s.status === 'RESCHEDULED').length;
                const upcoming = schedules.filter(s => s.lessonDate >= today && s.status !== 'CANCELLED' && s.status !== 'COMPLETED').length;
                const pastIncomplete = schedules.filter(s => s.lessonDate < today && s.status === 'SCHEDULED').length;
                completedSchedules += completed;
                scheduledSchedules += scheduled;
                cancelledSchedules += cancelled;
                rescheduledSchedules += rescheduled;
                upcomingCount += upcoming;
                pastIncompleteCount += pastIncomplete;

                if (schedules.length > 0) {
                    classScheduleMap.push({
                        className: classes[idx].className,
                        classCode: classes[idx].classCode,
                        total: schedules.length,
                        completed, scheduled, cancelled, rescheduled, upcoming, pastIncomplete,
                        completionRate: schedules.length > 0 ? Math.round((completed / schedules.length) * 100) : 0,
                    });
                }
                schedules.forEach(s => {
                    if (s.lessonDate && s.status !== 'CANCELLED') {
                        const dow = new Date(s.lessonDate).getDay();
                        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                        const key = dayNames[dow];
                        dailyMap[key] = (dailyMap[key] || 0) + 1;
                    }
                });
            });
            setScheduleData({
                totalSchedules, completedSchedules, scheduledSchedules, cancelledSchedules, rescheduledSchedules,
                upcomingCount, pastIncompleteCount, classScheduleMap, dailyMap,
                completionRate: totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0,
                cancellationRate: totalSchedules > 0 ? Math.round((cancelledSchedules / totalSchedules) * 100) : 0,
            });
            setScheduleLoading(false);
        });
    }, [classes]);

    const dayOrder = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const maxDaily = Math.max(...Object.values(scheduleData.dailyMap), 1);

    if (scheduleLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">{t('eduManager.analytics.loadingScheduleData')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard icon={Calendar} label={t('eduManager.analytics.totalSessions')} value={scheduleData.totalSchedules} color="indigo" />
                <KpiCard icon={CheckCircle} label={t('eduManager.analytics.completed')} value={scheduleData.completedSchedules} color="emerald" />
                <KpiCard icon={Clock} label={t('eduManager.analytics.upcoming')} value={scheduleData.upcomingCount} color="blue" />
                <KpiCard icon={Calendar} label={t('eduManager.analytics.scheduled')} value={scheduleData.scheduledSchedules} color="cyan" />
                <KpiCard icon={XCircle} label={t('eduManager.analytics.cancelled')} value={scheduleData.cancelledSchedules} color="rose" />
                <KpiCard icon={AlertCircle} label={t('eduManager.analytics.overdue')} value={scheduleData.pastIncompleteCount} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overall Completion Donut */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Target className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.overallCompletionRate')}</h3>
                    </div>
                    <div className="flex items-center gap-8">
                        <DonutChart
                            segments={[
                                { value: scheduleData.completedSchedules, color: '#10b981', label: t('eduManager.analytics.completed') },
                                { value: scheduleData.cancelledSchedules, color: '#ef4444', label: t('eduManager.analytics.cancelled') },
                                { value: scheduleData.totalSchedules - scheduleData.completedSchedules - scheduleData.cancelledSchedules, color: '#6366f1', label: t('eduManager.analytics.remaining') },
                            ]}
                            total={scheduleData.totalSchedules}
                        />
                        <div className="flex-1 space-y-3">
                            <LegendItem color="bg-emerald-500" label={t('eduManager.analytics.completed')} value={scheduleData.completedSchedules} pct={scheduleData.completionRate} />
                            <LegendItem color="bg-red-500" label={t('eduManager.analytics.cancelled')} value={scheduleData.cancelledSchedules} pct={scheduleData.cancellationRate} />
                            <LegendItem color="bg-indigo-500" label={t('eduManager.analytics.remaining')} value={scheduleData.totalSchedules - scheduleData.completedSchedules - scheduleData.cancelledSchedules} pct={100 - scheduleData.completionRate - scheduleData.cancellationRate} />
                        </div>
                    </div>
                </div>

                {/* Day of Week Distribution */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-violet-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.dayOfWeekDistribution')}</h3>
                    </div>
                    <div className="flex items-end gap-3 h-48">
                        {dayOrder.map(day => {
                            const count = scheduleData.dailyMap[day] || 0;
                            const heightPct = maxDaily > 0 ? Math.round((count / maxDaily) * 100) : 0;
                            return (
                                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-xs font-bold text-gray-700">{count}</span>
                                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '160px' }}>
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-lg transition-all duration-700"
                                            style={{ height: `${heightPct}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">{day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Per-Class Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.scheduleProgressByClass')}</h3>
                </div>
                {scheduleData.classScheduleMap.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                        {t('eduManager.analytics.noSchedulesCreated')}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {scheduleData.classScheduleMap
                            .sort((a, b) => b.completionRate - a.completionRate)
                            .map((cls, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <span className="font-semibold text-gray-800">{cls.className}</span>
                                            <span className="text-xs text-gray-400 ml-2">({cls.classCode})</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="text-emerald-600 font-medium">{cls.completed} {t('eduManager.analytics.completed')}</span>
                                            <span className="text-blue-600 font-medium">{cls.upcoming} {t('eduManager.analytics.upcoming')}</span>
                                            {cls.cancelled > 0 && <span className="text-red-500 font-medium">{cls.cancelled} {t('eduManager.analytics.cancelled')}</span>}
                                        </div>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${cls.total > 0 ? (cls.completed / cls.total) * 100 : 0}%` }} />
                                        <div className="h-full bg-red-400 transition-all duration-700" style={{ width: `${cls.total > 0 ? (cls.cancelled / cls.total) * 100 : 0}%` }} />
                                        <div className="h-full bg-indigo-400 transition-all duration-700" style={{ width: `${cls.total > 0 ? (cls.scheduled / cls.total) * 100 : 0}%` }} />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <div className="text-xs text-gray-500">{cls.completionRate}% {t('eduManager.analytics.completed')} ({cls.total} {t('eduManager.analytics.sessions')})</div>
                                        <div className="flex gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {t('eduManager.analytics.completed')}</span>
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> {t('eduManager.analytics.cancelled')}</span>
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /> {t('eduManager.analytics.scheduled')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CoursesTab = ({ courses, courseStats }) => {
    const { t } = useTranslation();
    const priceDistribution = useMemo(() => {
        const ranges = [
            { label: t('eduManager.analytics.priceFree'), min: 0, max: 0, count: 0, color: '#10b981' },
            { label: '< 500K', min: 1, max: 500000, count: 0, color: '#3b82f6' },
            { label: '500K - 1M', min: 500001, max: 1000000, count: 0, color: '#6366f1' },
            { label: '1M - 3M', min: 1000001, max: 3000000, count: 0, color: '#8b5cf6' },
            { label: '> 3M', min: 3000001, max: Infinity, count: 0, color: '#ef4444' },
        ];
        courses.forEach(c => {
            const price = Number(c.price) || 0;
            for (const range of ranges) {
                if (price >= range.min && price <= range.max) { range.count++; break; }
            }
        });
        return ranges;
    }, [courses, t]);

    const maxPriceBucket = Math.max(...priceDistribution.map(r => r.count), 1);
    const totalRevenue = courses.reduce((sum, c) => sum + (Number(c.price) || 0), 0);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard icon={BookOpen} label={t('eduManager.analytics.totalCourses')} value={courseStats.total} color="violet" />
                <KpiCard icon={CheckCircle} label={t('eduManager.analytics.published')} value={courseStats.published} color="emerald" />
                <KpiCard icon={FileText} label={t('eduManager.analytics.draft')} value={courseStats.draft} color="slate" />
                <KpiCard icon={Award} label={t('eduManager.analytics.avgPrice')} value={`${(courseStats.avgPrice / 1000).toFixed(0)}K`} color="amber" />
                <KpiCard icon={TrendingUp} label={t('eduManager.analytics.maxPrice')} value={`${(courseStats.maxPrice / 1000000).toFixed(1)}M`} color="rose" />
                <KpiCard icon={TrendingDown} label={t('eduManager.analytics.totalValue')} value={`${(totalRevenue / 1000000).toFixed(1)}M`} color="cyan" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Price Distribution Bar Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Layers className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.coursePriceDistribution')}</h3>
                    </div>
                    <div className="space-y-4">
                        {priceDistribution.map(item => {
                            const pct = maxPriceBucket > 0 ? Math.round((item.count / maxPriceBucket) * 100) : 0;
                            return (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-600 font-medium">{item.label}</span>
                                        <span className="text-gray-900 font-bold">{item.count} {t('eduManager.analytics.coursesUnit')}</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Donut */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-violet-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.courseStatusRate')}</h3>
                    </div>
                    <div className="flex items-center gap-8">
                        <DonutChart
                            segments={[
                                { value: courseStats.published, color: '#10b981', label: 'Published' },
                                { value: courseStats.draft, color: '#94a3b8', label: 'Draft' },
                                { value: courseStats.archived, color: '#f59e0b', label: 'Archived' },
                            ]}
                            total={courseStats.total}
                        />
                        <div className="flex-1 space-y-4">
                            <LegendItem color="bg-emerald-500" label="Published" value={courseStats.published} pct={courseStats.total > 0 ? Math.round((courseStats.published / courseStats.total) * 100) : 0} />
                            <LegendItem color="bg-slate-400" label="Draft" value={courseStats.draft} pct={courseStats.total > 0 ? Math.round((courseStats.draft / courseStats.total) * 100) : 0} />
                            <LegendItem color="bg-amber-400" label="Archived" value={courseStats.archived} pct={courseStats.total > 0 ? Math.round((courseStats.archived / courseStats.total) * 100) : 0} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Price Comparison Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.coursePriceComparison')}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colCourse')}</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colCode')}</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colPrice')}</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colVsAvg')}</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colStatus')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {courses.map(course => {
                                const diff = courseStats.avgPrice > 0 ? Math.round(((Number(course.price) || 0) - courseStats.avgPrice) / courseStats.avgPrice * 100) : 0;
                                return (
                                    <tr key={course.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3 text-sm font-medium text-gray-800">{course.name}</td>
                                        <td className="px-5 py-3 text-center text-sm text-gray-500">{course.code}</td>
                                        <td className="px-5 py-3 text-center text-sm font-bold text-gray-800">{(Number(course.price) || 0).toLocaleString('vi-VN')}d</td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`text-xs font-bold flex items-center justify-center gap-1 ${diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {diff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {diff >= 0 ? '+' : ''}{diff}%
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                                course.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                                                course.status === 'ARCHIVED' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>{course.status === 'PUBLISHED' ? 'Published' : course.status === 'ARCHIVED' ? 'Archived' : 'Draft'}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {courses.length === 0 && (
                                <tr><td colSpan="5" className="px-5 py-10 text-center text-gray-400">{t('eduManager.analytics.noCourses')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AttendanceTab = ({ classes }) => {
    const { t } = useTranslation();
    const [selectedClass, setSelectedClass] = useState(null);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [attLoading, setAttLoading] = useState(false);

    const handleSelectClass = async (classId) => {
        setSelectedClass(classId);
        setAttLoading(true);
        try {
            const data = await educationManagerService.getClassAttendanceHistory(classId);
            setAttendanceStats(data);
        } catch (error) {
            console.error('Error fetching attendance stats:', error);
            setAttendanceStats(null);
        } finally {
            setAttLoading(false);
        }
    };

    const attendanceSummary = useMemo(() => {
        if (!attendanceStats) return null;
        const students = attendanceStats.studentStats || [];
        const normal = students.filter(s => !s.isLocked && !s.isWarning).length;
        const warning = students.filter(s => s.isWarning && !s.isLocked).length;
        const locked = students.filter(s => s.isLocked).length;
        const avgRate = students.length > 0
            ? Math.round(students.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / students.length)
            : 0;
        const excellent = students.filter(s => s.attendanceRate >= 90).length;
        const good = students.filter(s => s.attendanceRate >= 80 && s.attendanceRate < 90).length;
        const average = students.filter(s => s.attendanceRate >= 50 && s.attendanceRate < 80).length;
        const poor = students.filter(s => s.attendanceRate < 50).length;
        return { total: students.length, normal, warning, locked, avgRate, excellent, good, average, poor };
    }, [attendanceStats]);

    const sessionTrend = useMemo(() => {
        if (!attendanceStats?.sessionStats) return [];
        return attendanceStats.sessionStats
            .filter(s => s.totalMarked > 0)
            .map(s => {
                const total = s.present + s.absent;
                return {
                    lesson: `B${s.lessonNumber}`,
                    rate: total > 0 ? Math.round((s.present / total) * 100) : 0,
                    present: s.present,
                    absent: s.absent,
                };
            });
    }, [attendanceStats]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Class Selector */}
                <div className="lg:col-span-1">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">{t('eduManager.analytics.selectClass')}</h3>
                    <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {classes.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">{t('eduManager.analytics.noClasses')}</div>
                        ) : classes.map(cls => (
                            <button
                                key={cls.id}
                                onClick={() => handleSelectClass(cls.id)}
                                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                                    selectedClass === cls.id
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-100 bg-white hover:border-indigo-200'
                                }`}
                            >
                                <div className="font-medium text-sm text-gray-800">{cls.className}</div>
                                <div className="text-xs text-gray-400">{cls.classCode}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Analytics */}
                <div className="lg:col-span-3">
                    {attLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : !attendanceStats ? (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                            <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                            <h3 className="text-lg font-semibold text-gray-400">{t('eduManager.analytics.selectClassForAttendance')}</h3>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                <KpiCard icon={Calendar} label={t('eduManager.analytics.totalSessions')} value={attendanceStats.totalSessions || 0} color="indigo" />
                                <KpiCard icon={Users} label={t('eduManager.analytics.kpiStudents')} value={attendanceSummary.total} color="violet" />
                                <KpiCard icon={UserCheck} label={t('eduManager.analytics.normal')} value={attendanceSummary.normal} color="emerald" />
                                <KpiCard icon={AlertCircle} label={t('eduManager.analytics.warning')} value={attendanceSummary.warning} color="amber" />
                                <KpiCard icon={UserX} label={t('eduManager.analytics.locked')} value={attendanceSummary.locked} color="rose" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Average Attendance Donut */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Target className="w-5 h-5 text-indigo-600" />
                                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.avgAttendanceRate')}</h3>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <DonutChart
                                            segments={[
                                                { value: attendanceSummary.avgRate, color: '#6366f1', label: t('eduManager.analytics.present') },
                                                { value: 100 - attendanceSummary.avgRate, color: '#e5e7eb', label: t('eduManager.analytics.absent') },
                                            ]}
                                            total={100}
                                            centerLabel={`${attendanceSummary.avgRate}%`}
                                        />
                                        <div className="flex-1 space-y-3">
                                            <LegendItem color="bg-emerald-500" label={t('eduManager.analytics.excellent90')} value={attendanceSummary.excellent} />
                                            <LegendItem color="bg-blue-500" label={t('eduManager.analytics.good80')} value={attendanceSummary.good} />
                                            <LegendItem color="bg-amber-500" label={t('eduManager.analytics.average50')} value={attendanceSummary.average} />
                                            <LegendItem color="bg-red-500" label={t('eduManager.analytics.poor50')} value={attendanceSummary.poor} />
                                        </div>
                                    </div>
                                </div>

                                {/* Attendance Rate Distribution */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <BarChart3 className="w-5 h-5 text-violet-600" />
                                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.attendanceLevelDistribution')}</h3>
                                    </div>
                                    {attendanceSummary.total === 0 ? (
                                        <div className="text-center py-8 text-gray-400">{t('eduManager.analytics.noData')}</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {[
                                                { label: t('eduManager.analytics.excellent90'), count: attendanceSummary.excellent, color: 'bg-emerald-500' },
                                                { label: t('eduManager.analytics.good80'), count: attendanceSummary.good, color: 'bg-blue-500' },
                                                { label: t('eduManager.analytics.average50'), count: attendanceSummary.average, color: 'bg-amber-500' },
                                                { label: t('eduManager.analytics.poor50'), count: attendanceSummary.poor, color: 'bg-red-500' },
                                            ].map(item => {
                                                const pct = Math.round((item.count / attendanceSummary.total) * 100);
                                                return (
                                                    <div key={item.label}>
                                                        <div className="flex justify-between text-sm mb-1.5">
                                                            <span className="text-gray-600 font-medium">{item.label}</span>
                                                            <span className="font-bold text-gray-800">{item.count} ({pct}%)</span>
                                                        </div>
                                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Session Attendance Trend Bar Chart */}
                            {sessionTrend.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Activity className="w-5 h-5 text-indigo-600" />
                                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.attendanceRateBySession')}</h3>
                                    </div>
                                    <div className="flex items-end gap-2 h-48">
                                        {sessionTrend.map((s, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                <span className="text-xs font-bold text-gray-700">{s.rate}%</span>
                                                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '160px' }}>
                                                    <div
                                                        className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700 ${
                                                            s.rate >= 80 ? 'bg-gradient-to-t from-emerald-500 to-emerald-300' :
                                                            s.rate >= 50 ? 'bg-gradient-to-t from-amber-500 to-amber-300' :
                                                            'bg-gradient-to-t from-red-500 to-red-300'
                                                        }`}
                                                        style={{ height: `${s.rate}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium">{s.lesson}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 mt-4 justify-center text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {'≥'}80%</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 50-79%</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> &lt;50%</span>
                                    </div>
                                </div>
                            )}

                            {/* Student Attendance Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-5 border-b border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.studentAttendanceDetail')}</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{t('eduManager.analytics.colStudent')}</th>
                                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">{t('eduManager.analytics.colPresent')}</th>
                                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">{t('eduManager.analytics.colAbsent')}</th>
                                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">{t('eduManager.analytics.colRate')}</th>
                                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">{t('eduManager.analytics.colStatus')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(attendanceStats.studentStats || []).map((s, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                                                {s.studentName?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-800">{s.studentName}</div>
                                                                <div className="text-xs text-gray-400">{s.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-center text-sm font-medium text-emerald-600">{s.presentCount}</td>
                                                    <td className="px-5 py-3 text-center text-sm font-medium text-red-500">{s.absentCount}</td>
                                                    <td className="px-5 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${
                                                                    s.attendanceRate >= 80 ? 'bg-emerald-500' :
                                                                    s.attendanceRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                                }`} style={{ width: `${s.attendanceRate || 0}%` }} />
                                                            </div>
                                                            <span className={`text-sm font-bold ${
                                                                s.attendanceRate >= 80 ? 'text-emerald-600' :
                                                                s.attendanceRate >= 50 ? 'text-amber-600' : 'text-red-600'
                                                            }`}>{s.attendanceRate}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        {s.isLocked ? (
                                                            <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">{t('eduManager.analytics.locked')}</span>
                                                        ) : s.isWarning ? (
                                                            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">{t('eduManager.analytics.warning')}</span>
                                                        ) : (
                                                            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">{t('eduManager.analytics.normal')}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ClassesTab = ({ classes, classStats }) => {
    const { t } = useTranslation();
    const [classDetails, setClassDetails] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(true);

    useEffect(() => {
        if (classes.length === 0) { setDetailsLoading(false); return; }
        setDetailsLoading(true);
        Promise.allSettled(
            classes.map(cls => educationManagerService.getClassDetails(cls.id))
        ).then(results => {
            const details = results.map((r, idx) => {
                const detail = r.status === 'fulfilled' ? (r.value?.data || r.value || {}) : {};
                const schedules = detail.schedules || [];
                return {
                    ...classes[idx],
                    currentEnrollment: classes[idx].currentEnrollment || 0,
                    capacity: classes[idx].capacity || 0,
                    scheduleCount: schedules.length,
                    completedSchedules: schedules.filter(s => s.status === 'COMPLETED').length,
                };
            });
            setClassDetails(details.sort((a, b) => b.currentEnrollment - a.currentEnrollment));
            setDetailsLoading(false);
        });
    }, [classes]);

    const maxStudents = classStats.maxStudents || 1;
    const totalSchedules = classDetails.reduce((sum, c) => sum + c.scheduleCount, 0);
    const avgSchedules = classDetails.length > 0 ? (totalSchedules / classDetails.length).toFixed(1) : 0;

    if (detailsLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">{t('eduManager.analytics.loadingClassData')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <KpiCard icon={Users} label={t('eduManager.analytics.totalClasses')} value={classStats.total} color="blue" />
                <KpiCard icon={Users} label={t('eduManager.analytics.totalStudents')} value={classStats.totalStudents} color="violet" />
                <KpiCard icon={Calendar} label={t('eduManager.analytics.activeClassesLabel')} value={classStats.activeClasses} color="emerald" />
                <KpiCard icon={GraduationCap} label={t('eduManager.analytics.avgStudentsPerClass')} value={classStats.avgStudents} color="amber" />
                <KpiCard icon={Calendar} label={t('eduManager.analytics.avgSessionsPerClass')} value={avgSchedules} color="cyan" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Size Horizontal Bar Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.classSize')}</h3>
                    </div>
                    {classDetails.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">{t('eduManager.analytics.noClasses')}</div>
                    ) : (
                        <div className="space-y-3">
                            {classDetails.map(cls => {
                                const pct = Math.round((cls.currentEnrollment / maxStudents) * 100);
                                return (
                                    <div key={cls.id}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 text-sm font-medium text-gray-700 truncate">{cls.className}</div>
                                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden relative">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${
                                                        pct >= 80 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                                        pct >= 50 ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                                                        'bg-gradient-to-r from-slate-300 to-slate-400'
                                                    }`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="w-14 text-right text-sm font-bold text-gray-800">{cls.currentEnrollment} SV</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Class Schedule Completion */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Target className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.classCompletionProgress')}</h3>
                    </div>
                    {classDetails.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">{t('eduManager.analytics.noClasses')}</div>
                    ) : (
                        <div className="space-y-3">
                            {classDetails.map(cls => {
                                const pct = cls.scheduleCount > 0 ? Math.round((cls.completedSchedules / cls.scheduleCount) * 100) : 0;
                                return (
                                    <div key={cls.id}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-700 font-medium truncate max-w-[60%]">{cls.className}</span>
                                            <span className="text-gray-500 font-medium">{cls.completedSchedules}/{cls.scheduleCount} {t('eduManager.analytics.sessions')}</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${
                                                    pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-400'
                                                }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-400 text-right mt-0.5">{pct}%</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.classSummaryTable')}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colClass')}</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colCode')}</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colStudents')}</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colCapacity')}</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colSessions')}</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.completed')}</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colContribution')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {classDetails.map(cls => {
                                const studentPct = classStats.totalStudents > 0 ? Math.round((cls.currentEnrollment / classStats.totalStudents) * 100) : 0;
                                return (
                                    <tr key={cls.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3 text-sm font-medium text-gray-800">{cls.className}</td>
                                        <td className="px-5 py-3 text-center text-sm text-gray-500">{cls.classCode}</td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="text-sm font-bold text-blue-600">{cls.currentEnrollment}</span>
                                        </td>
                                        <td className="px-5 py-3 text-center text-sm text-gray-600">{cls.capacity || '-'}</td>
                                        <td className="px-5 py-3 text-center text-sm text-gray-600">{cls.scheduleCount}</td>
                                        <td className="px-5 py-3 text-center text-sm text-emerald-600 font-medium">{cls.completedSchedules}</td>
                                        <td className="px-5 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${studentPct}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-gray-600">{studentPct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ExamsTab = ({ pendingExams, courses, dashboardStats }) => {
    const { t } = useTranslation();
    const examStats = useMemo(() => {
        const totalPendingQ = pendingExams.reduce((sum, p) => sum + (p.exam?.examQuestions?.length || p.exam?.totalQuestions || 0), 0);
        const avgDuration = pendingExams.length > 0
            ? Math.round(pendingExams.reduce((sum, p) => sum + (p.exam?.duration || p.exam?.durationMinutes || 0), 0) / pendingExams.length)
            : 0;
        const byCourse = {};
        pendingExams.forEach(p => {
            const name = p.exam?.course?.name || t('eduManager.analytics.unknown');
            byCourse[name] = (byCourse[name] || 0) + 1;
        });
        const courseLabels = Object.entries(byCourse).map(([name, count]) => ({ name, count }));
        const maxByCourse = Math.max(...courseLabels.map(c => c.count), 1);
        return { totalPendingQ, avgDuration, courseLabels, maxByCourse };
    }, [pendingExams, t]);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard icon={FileText} label={t('eduManager.analytics.pendingApprovalShort')} value={pendingExams.length} color="amber" />
                <KpiCard icon={FileText} label={t('eduManager.analytics.totalPendingQuestions')} value={examStats.totalPendingQ} color="blue" />
                <KpiCard icon={Clock} label={t('eduManager.analytics.avgDuration')} value={`${examStats.avgDuration} ${t('eduManager.analytics.minutes')}`} color="cyan" />
                <KpiCard icon={CheckCircle} label={t('eduManager.analytics.approved')} value={dashboardStats.approvedExams || 0} color="emerald" />
                <KpiCard icon={XCircle} label={t('eduManager.analytics.rejected')} value={dashboardStats.rejectedExams || 0} color="rose" />
                <KpiCard icon={BookOpen} label={t('eduManager.analytics.totalExams')} value={(dashboardStats.approvedExams || 0) + (dashboardStats.rejectedExams || 0) + pendingExams.length} color="violet" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Exam Approval Status Donut */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Target className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.examApprovalRate')}</h3>
                    </div>
                    <div className="flex items-center gap-8">
                        <DonutChart
                            segments={[
                                { value: dashboardStats.approvedExams || 0, color: '#10b981', label: t('eduManager.analytics.approved') },
                                { value: dashboardStats.rejectedExams || 0, color: '#ef4444', label: t('eduManager.analytics.rejected') },
                                { value: pendingExams.length, color: '#f59e0b', label: t('eduManager.analytics.pendingApproval') },
                            ]}
                            total={(dashboardStats.approvedExams || 0) + (dashboardStats.rejectedExams || 0) + pendingExams.length}
                        />
                        <div className="flex-1 space-y-3">
                            <LegendItem color="bg-emerald-500" label={t('eduManager.analytics.approved')} value={dashboardStats.approvedExams || 0} />
                            <LegendItem color="bg-red-500" label={t('eduManager.analytics.rejected')} value={dashboardStats.rejectedExams || 0} />
                            <LegendItem color="bg-amber-500" label={t('eduManager.analytics.pendingApproval')} value={pendingExams.length} />
                        </div>
                    </div>
                </div>

                {/* Pending Exams by Course */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-violet-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.pendingExamsByCourse')}</h3>
                    </div>
                    {examStats.courseLabels.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                            <p className="text-gray-400">{t('eduManager.analytics.noPendingExams')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {examStats.courseLabels.map(item => {
                                const pct = Math.round((item.count / examStats.maxByCourse) * 100);
                                return (
                                    <div key={item.name}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-gray-600 font-medium truncate max-w-[70%]">{item.name}</span>
                                            <span className="text-gray-900 font-bold">{item.count} {t('eduManager.analytics.examsUnit')}</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Pending Exam Details Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">{t('eduManager.analytics.pendingExamDetails')}</h3>
                </div>
                {pendingExams.length === 0 ? (
                    <div className="p-12 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-300" />
                        <p className="text-gray-500 text-lg">{t('eduManager.analytics.allExamsProcessed')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colExam')}</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colCourse')}</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colQuestions')}</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colDuration')}</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colSubmitter')}</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('eduManager.analytics.colSubmittedDate')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {pendingExams.map(approval => (
                                    <tr key={approval.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <div className="text-sm font-semibold text-gray-800">{approval.exam?.title || approval.exam?.name || 'N/A'}</div>
                                            <div className="text-xs text-gray-400">{approval.exam?.code || ''}</div>
                                        </td>
                                        <td className="px-5 py-3 text-center text-sm text-gray-600">{approval.exam?.course?.name || 'N/A'}</td>
                                        <td className="px-5 py-3 text-center text-sm font-bold text-gray-800">{approval.exam?.examQuestions?.length || approval.exam?.totalQuestions || 0}</td>
                                        <td className="px-5 py-3 text-center text-sm text-gray-600">{approval.exam?.duration || approval.exam?.durationMinutes || 0} {t('eduManager.analytics.minutes')}</td>
                                        <td className="px-5 py-3 text-center text-sm text-gray-600">{approval.submittedBy?.fullName || approval.submittedBy?.username || 'N/A'}</td>
                                        <td className="px-5 py-3 text-center text-sm text-gray-500">{new Date(approval.submittedAt).toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const KpiCard = ({ icon: Icon, label, value, sub, color }) => {
    const colors = {
        violet: { bg: 'bg-violet-50', text: 'text-violet-700', grad: 'from-violet-500 to-purple-600' },
        blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   grad: 'from-blue-500 to-cyan-600' },
        emerald:{ bg: 'bg-emerald-50', text: 'text-emerald-700', grad: 'from-emerald-500 to-teal-600' },
        amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  grad: 'from-amber-500 to-orange-600' },
        rose:   { bg: 'bg-rose-50',   text: 'text-rose-700',   grad: 'from-rose-500 to-red-600' },
        cyan:   { bg: 'bg-cyan-50',   text: 'text-cyan-700',   grad: 'from-cyan-500 to-blue-600' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', grad: 'from-indigo-500 to-blue-600' },
        slate:  { bg: 'bg-slate-50',  text: 'text-slate-700',  grad: 'from-slate-500 to-gray-600' },
    };
    const c = colors[color] || colors.indigo;
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center ${c.text} mb-3`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className={`text-2xl font-bold bg-gradient-to-r ${c.grad} bg-clip-text text-transparent`}>{value}</div>
            <div className="text-sm text-gray-600 mt-1">{label}</div>
            {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
    );
};

const DonutChart = ({ segments, total, centerLabel }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    return (
        <div className="relative w-36 h-36 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="14" />
                {segments.map((seg, i) => {
                    const pct = total > 0 ? seg.value / total : 0;
                    const dashLen = pct * circumference;
                    const el = (
                        <circle key={i} cx="60" cy="60" r={radius} fill="none" stroke={seg.color} strokeWidth="14"
                            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                            strokeDashoffset={-offset}
                            strokeLinecap="butt" />
                    );
                    offset += dashLen;
                    return el;
                })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-800">{centerLabel || total}</span>
            </div>
        </div>
    );
};

const LegendItem = ({ color, label, value, pct }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${color} shrink-0`} />
            <span className="text-sm text-gray-600">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">{value}</span>
            {pct !== undefined && <span className="text-xs text-gray-400">({pct}%)</span>}
        </div>
    </div>
);

const SummaryMetric = ({ label, value, trend }) => (
    <div className="bg-gray-50 rounded-xl p-4 text-center">
        <div className={`text-2xl font-bold ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-800'}`}>
            {value}
        </div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
        <div className="mt-1">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400 mx-auto" />}
            {trend === 'neutral' && <div className="w-4 h-0.5 bg-gray-300 mx-auto mt-2" />}
        </div>
    </div>
);

export default EduAnalytics;
