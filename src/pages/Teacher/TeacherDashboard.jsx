import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users, FileText, TrendingUp, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import teacherService from '../../services/teacherService';

/**
 * Teacher Dashboard - Enhanced UI with stats and quick actions
 */
const TeacherDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalExams: 0,
    totalQuestions: 0,
    pendingGrading: 0,
    totalStudents: 0,
    totalClasses: 0,
    upcomingSessions: 0
  });
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data from services
      const [exams, questions, grading, sessions, classes] = await Promise.all([
        teacherService.getExams().catch(() => ({ data: [] })),
        teacherService.getQuestions().catch(() => ({ data: [] })),
        teacherService.getPendingGrading().catch(() => []),
        teacherService.getUpcomingSessions().catch(() => ({ data: [] })),
        teacherService.getTeacherClasses().catch(() => ({ data: [] }))
      ]);

      // Debug: log responses
      console.log('Dashboard API Responses:', {
        exams,
        questions,
        grading,
        sessions,
        classes
      });

      setStats({
        totalExams: Array.isArray(exams) ? exams.length : (exams.data?.length || exams.content?.length || 0),
        totalQuestions: Array.isArray(questions) ? questions.length : (questions.data?.length || questions.content?.length || 0),
        pendingGrading: Array.isArray(grading) ? grading.length : (grading.data?.length || grading.content?.length || 0),
        totalStudents: 0, // Will be implemented later
        totalClasses: Array.isArray(classes) ? classes.length : (classes.data?.length || classes.content?.length || 0),
        upcomingSessions: Array.isArray(sessions) ? sessions.length : (sessions.data?.length || sessions.content?.length || 0)
      });
      
      setMyClasses(Array.isArray(classes) ? classes : (classes.data || classes.content || []));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stat Cards Configuration
  const statCards = useMemo(() => [
    {
      label: t('teacher.dashboard.totalExams'),
      value: stats.totalExams,
      icon: <FileText className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      urgent: false,
    },
    {
      label: t('teacher.dashboard.totalQuestions'),
      value: stats.totalQuestions,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      urgent: false,
    },
    {
      label: t('teacher.dashboard.totalClasses', 'My Classes'),
      value: stats.totalClasses,
      icon: <Users className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-600',
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      urgent: false,
    },
    {
      label: t('teacher.dashboard.pendingGrading'),
      value: stats.pendingGrading,
      icon: <Clock className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      urgent: stats.pendingGrading > 0,
    },
    {
      label: t('teacher.dashboard.upcomingSessions'),
      value: stats.upcomingSessions,
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-purple-500 to-violet-600',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      urgent: false,
    },
  ], [t, stats]);

  // Quick Actions Configuration
  const quickActions = useMemo(() => [
    {
      title: t('teacher.dashboard.createExam'),
      description: t('teacher.dashboard.createExamDesc'),
      icon: '📝',
      path: '/teacher/exam-management',
      color: 'hover:border-blue-400',
      badge: 0
    },
    {
      title: t('teacher.dashboard.manageQuestions'),
      description: t('teacher.dashboard.manageQuestionsDesc'),
      icon: '❓',
      path: '/teacher/question-bank',
      color: 'hover:border-green-400',
      badge: 0
    },
    {
      title: t('teacher.dashboard.manageSessions'),
      description: t('teacher.dashboard.manageSessionsDesc'),
      icon: '📅',
      path: '/teacher/sessions',
      color: 'hover:border-purple-400',
      badge: stats.upcomingSessions
    },
    {
      title: t('teacher.dashboard.gradeSubmissions'),
      description: t('teacher.dashboard.gradeSubmissionsDesc'),
      icon: '✅',
      path: '/teacher/grading-queue',
      color: 'hover:border-amber-400',
      badge: stats.pendingGrading
    },
    {
      title: t('teacher.dashboard.viewReports'),
      description: t('teacher.dashboard.viewReportsDesc'),
      icon: '📊',
      path: '/teacher/reports',
      color: 'hover:border-pink-400',
      badge: 0
    }
  ], [t, stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-xl">
            👨‍🏫
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('teacher.dashboard.title')}</h1>
            <p className="text-gray-500 text-sm">{t('teacher.dashboard.subtitle')}</p>
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
              <div className="text-xs text-amber-600 font-medium mt-1">⚡ {t('teacher.dashboard.urgent')}</div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('teacher.dashboard.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className={`bg-white rounded-xl border-2 p-4 text-left hover:shadow-lg transition-all ${action.color} ${
                action.badge > 0 ? 'border-l-4 border-l-amber-500' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-3xl">{action.icon}</div>
                {action.badge > 0 && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    {action.badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* My Classes */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('teacher.dashboard.myClasses', 'Lớp học của tôi')}</h2>
        {myClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClasses.map((cls, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cls.className}</h3>
                    <p className="text-sm text-gray-500">{cls.course}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                    {cls.classCode}
                  </span>
                </div>
                {cls.isPrimary && (
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    <CheckCircle className="w-3.5 h-3.5" /> {t('teacher.dashboard.primaryTeacher')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>{t('teacher.dashboard.noClasses', 'Bạn chưa được phân công lớp học nào.')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
