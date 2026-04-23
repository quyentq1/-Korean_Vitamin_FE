import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  FileText,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
  BarChart3,
  ArrowRight,
  Play,
  Star,
  Target
} from 'lucide-react';
import studentService from '../../services/studentService';

/**
 * StudentDashboard - Dashboard for Student with Modern UI
 */
const StudentDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    completedExams: 0,
    averageScore: 0,
    upcomingExams: [],
    recentActivities: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        dashboardData,
        examResults,
        learningProgress,
        upcomingExams
      ] = await Promise.all([
        studentService.getDashboardData().catch(() => null),
        studentService.getExamResults().catch(() => ({ results: [] })),
        studentService.getLearningProgress().catch(() => []),
        studentService.getExams('AVAILABLE').catch(() => ({ data: [] }))
      ]);

      const totalCourses = learningProgress?.length || 0;
      const activeCourses = learningProgress?.filter(c => c.status === 'ACTIVE')?.length || 0;
      const completedExams = examResults?.results?.length || 0;
      const averageScore = examResults?.results?.length > 0
        ? Math.round(examResults.results.reduce((sum, r) => sum + (r.totalScore || 0), 0) / examResults.results.length)
        : 0;

      const mappedUpcomingExams = (upcomingExams?.data || []).slice(0, 3).map(exam => ({
        id: exam.id,
        title: exam.title || t('student.dashboard.defaultExamTitle'),
        date: exam.availableFrom || new Date().toISOString(),
        course: exam.courseName || t('student.dashboard.defaultCourseName')
      }));

      const mappedRecentActivities = (examResults?.results || []).slice(0, 4).map(result => ({
        id: result.id,
        type: 'exam_completed',
        title: t('student.dashboard.activityCompleted', { title: result.examTitle || t('student.dashboard.defaultExamTitle') }),
        score: Math.round(result.totalScore || 0),
        date: result.submitTime ? new Date(result.submitTime).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')
      }));

      setStats({
        totalCourses,
        activeCourses,
        completedExams,
        averageScore,
        upcomingExams: mappedUpcomingExams,
        recentActivities: mappedRecentActivities
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalCourses: 0,
        activeCourses: 0,
        completedExams: 0,
        averageScore: 0,
        upcomingExams: [],
        recentActivities: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {t('student.dashboard.welcomeGreeting')}
              </h1>
              <p className="text-indigo-100 text-lg">
                {t('student.dashboard.welcomeSubtitle')}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                <Award className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-indigo-100/50 hover:shadow-xl transition-all duration-300 border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                <p className="text-sm text-gray-500">{t('student.dashboard.courses')}</p>
              </div>
            </div>
            <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-green-100/50 hover:shadow-xl transition-all duration-300 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                <Play className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.activeCourses}</p>
                <p className="text-sm text-gray-500">{t('student.dashboard.activeCourses')}</p>
              </div>
            </div>
            <div className="h-2 bg-green-50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" style={{ width: `${(stats.activeCourses / stats.totalCourses) * 100 || 0}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-purple-100/50 hover:shadow-xl transition-all duration-300 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.completedExams}</p>
                <p className="text-sm text-gray-500">{t('student.dashboard.exams')}</p>
              </div>
            </div>
            <div className="h-2 bg-purple-50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-amber-100/50 hover:shadow-xl transition-all duration-300 border border-amber-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
                <p className="text-sm text-gray-500">{t('student.dashboard.avgScore')}</p>
              </div>
            </div>
            <div className="h-2 bg-amber-50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full" style={{ width: `${stats.averageScore}%` }}></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-indigo-600" />
                {t('student.dashboard.quickActions')}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/student/my-courses')}
                  className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-4 transition-all duration-300 border-2 border-transparent hover:border-blue-300"
                >
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold text-gray-800 text-center">{t('student.dashboard.courses')}</p>
                </button>
                <button
                  onClick={() => navigate('/student/exams')}
                  className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl p-4 transition-all duration-300 border-2 border-transparent hover:border-purple-300"
                >
                  <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold text-gray-800 text-center">{t('student.dashboard.exams')}</p>
                </button>
              </div>
            </div>

            {/* Upcoming Exams */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-red-600" />
                  {t('student.dashboard.upcoming')}
                </h2>
                <button
                  onClick={() => navigate('/student/exams')}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 hover:underline"
                >
                  {t('student.dashboard.viewAll')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {stats.upcomingExams.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="group bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-xl p-4 transition-all duration-300 border-2 border-transparent hover:border-indigo-200 cursor-pointer"
                      onClick={() => navigate(`/student/exams`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {exam.title}
                          </h3>
                          <p className="text-sm text-gray-600">{exam.course}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-indigo-600">
                            {new Date(exam.date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t('student.dashboard.noUpcomingExams')}</p>
                </div>
              )}
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                {t('student.dashboard.recentActivity')}
              </h2>

              {stats.recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shrink-0 shadow-md">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.date}</p>
                      </div>
                      {activity.score && (
                        <div className="text-right shrink-0">
                          <span className="text-lg font-bold text-green-600">{activity.score}</span>
                          <span className="text-xs text-gray-500 ml-1">{t('student.dashboard.pointsLabel')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t('student.dashboard.noRecentActivity')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border-2 border-amber-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-600" />
                {t('student.dashboard.achievements')}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '🔥', name: t('student.dashboard.achieveDiligent'), unlocked: true },
                  { icon: '⭐', name: t('student.dashboard.achieveExcellent'), unlocked: true },
                  { icon: '📚', name: t('student.dashboard.achieveLearning'), unlocked: true },
                  { icon: '🎯', name: t('student.dashboard.achieveAccurate'), unlocked: false },
                  { icon: '💪', name: t('student.dashboard.achievePersistent'), unlocked: false },
                  { icon: '🏅', name: t('student.dashboard.achieveComplete'), unlocked: false },
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className={`text-center p-3 rounded-xl border-2 transition-all ${
                      achievement.unlocked
                        ? 'bg-white border-amber-300 shadow-md hover:shadow-lg cursor-pointer'
                        : 'bg-gray-100/50 border-gray-200 opacity-50'
                    }`}
                    title={achievement.name}
                  >
                    <span className="text-2xl block mb-1">{achievement.icon}</span>
                    <span className="text-xs font-medium text-gray-700 block truncate">
                      {achievement.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Time */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8" />
                <div>
                  <p className="text-indigo-100 text-sm">{t('student.dashboard.studyTime')}</p>
                  <p className="text-xl font-bold">{t('student.dashboard.today')}</p>
                </div>
              </div>
              <div className="text-center py-6 bg-white/10 rounded-xl backdrop-blur-sm mb-4">
                <p className="text-5xl font-bold">2.5</p>
                <p className="text-indigo-200">{t('student.dashboard.hours')}</p>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {[t('student.dashboard.mon'), t('student.dashboard.tue'), t('student.dashboard.wed'), t('student.dashboard.thu'), t('student.dashboard.fri'), t('student.dashboard.sat'), t('student.dashboard.sun')].map((day, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-indigo-200">{day}</p>
                    <div className={`h-2 rounded-full mx-auto ${i < 5 ? 'bg-white' : 'bg-white/30'}`} style={{ width: '80%' }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
                {t('student.dashboard.progress')}
              </h2>
              <div className="space-y-4">
                {[
                  { name: t('student.dashboard.progressKoreanBasic'), progress: 75, color: 'from-blue-500 to-blue-600' },
                  { name: t('student.dashboard.progressGrammar'), progress: 60, color: 'from-purple-500 to-purple-600' },
                  { name: t('student.dashboard.progressHanja'), progress: 40, color: 'from-pink-500 to-pink-600' },
                ].map((course, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900 truncate">{course.name}</span>
                      <span className="text-gray-600 font-semibold">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${course.color} rounded-full transition-all duration-500`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
