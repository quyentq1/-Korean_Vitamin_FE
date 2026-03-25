import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  FileText,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  GraduationCap,
  Users,
  Award,
  BarChart3
} from 'lucide-react';
import studentService from '../../services/studentService';
import {
  PageContainer,
  PageHeader,
  Card,
  Button
} from '../../components/ui';

/**
 * StudentDashboard - Dashboard cho Student
 */
const StudentDashboard = () => {
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
      // TODO: Gọi API thực tế khi có backend
      // const data = await studentService.getDashboardStats();

      // Mock data for now
      setStats({
        totalCourses: 5,
        activeCourses: 3,
        completedExams: 12,
        averageScore: 85.5,
        upcomingExams: [
          { id: 1, title: 'Kiểm tra giữa kỳ - TOPIK I', date: '2026-03-25 10:00', course: 'Hàn Quốc Cơ Bản' },
          { id: 2, title: 'Kiểm tra từ vựng - Ngữ pháp', date: '2026-03-26 14:00', course: 'Ngữ Pháp Hàn Quốc' },
        ],
        recentActivities: [
          { id: 1, type: 'exam_completed', title: 'Hoàn thành bài kiểm tra: Chữ Hán Nâng Cao', score: 90, date: '2026-03-22' },
          { id: 2, type: 'lesson_completed', title: 'Hoàn thành bài: Đại từ số 1', course: 'Hàn Quốc Cơ Bản', date: '2026-03-21' },
          { id: 3, type: 'achievement_earned', title: 'Thành tự: Học tập chăm chỉ', date: '2026-03-20' },
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="wide">
      <PageHeader
        title={t('student.dashboard.title', 'Xin chào!')}
        subtitle={t('student.dashboard.subtitle', 'Sẵn sàng cho bài học hôm nay')}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Khóa học</p>
              <p className="text-3xl font-bold mt-1">{stats.totalCourses}</p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Đang học</p>
              <p className="text-3xl font-bold mt-1">{stats.activeCourses}</p>
            </div>
            <GraduationCap className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Bài kiểm tra</p>
              <p className="text-3xl font-bold mt-1">{stats.completedExams}</p>
            </div>
            <FileText className="w-12 h-12 text-purple-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Điểm trung bình</p>
              <p className="text-3xl font-bold mt-1">{stats.averageScore}%</p>
            </div>
            <Trophy className="w-12 h-12 text-amber-200" />
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Exams & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Exams */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📅 Sắp tới</h3>
              <Button variant="ghost" size="sm">
                Xem tất cả
              </Button>
            </div>
            <div className="space-y-3">
              {stats.upcomingExams.length > 0 ? (
                stats.upcomingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{exam.title}</p>
                      <p className="text-sm text-gray-600">{exam.course}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-indigo-600">{exam.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Không có bài kiểm tra sắp tới
                </div>
              )}
            </div>
          </Card>

          {/* Progress Overview */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📊 Tiến độ học tập</h3>
              <Button variant="ghost" size="sm">
                Chi tiết
              </Button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Hàn Quốc Cơ Bản', progress: 75, total: 20, completed: 15 },
                { name: 'Ngữ Pháp Hàn Quốc', progress: 60, total: 25, completed: 15 },
                { name: 'Chữ Hán Nâng Cao', progress: 40, total: 30, completed: 12 },
              ].map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{course.name}</span>
                    <span className="text-gray-600">{course.completed}/{course.total} bài</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activities */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">⏰ Hoạt động gần đây</h3>
              <Button variant="ghost" size="sm">
                Xem tất cả
              </Button>
            </div>
            <div className="space-y-3">
              {stats.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    activity.type === 'exam_completed' ? 'bg-green-100 text-green-600' :
                    activity.type === 'lesson_completed' ? 'bg-blue-100 text-blue-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {activity.type === 'exam_completed' && <CheckCircle className="w-5 h-5" />}
                    {activity.type === 'lesson_completed' && <BookOpen className="w-5 h-5" />}
                    {activity.type === 'achievement_earned' && <Award className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                  {activity.score && (
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">{activity.score}</span>
                      <span className="text-xs text-gray-500">điểm</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Hành động nhanh</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="primary"
                className="flex flex-col items-center gap-2 p-4 h-auto"
                onClick={() => navigate('/student/exams')}
              >
                <FileText className="w-6 h-6" />
                <span className="text-sm">Bài kiểm tra</span>
              </Button>
              <Button
                variant="secondary"
                className="flex flex-col items-center gap-2 p-4 h-auto"
                onClick={() => navigate('/student/my-courses')}
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-sm">Khóa học</span>
              </Button>
              <Button
                variant="secondary"
                className="flex flex-col items-center gap-2 p-4 h-auto"
                onClick={() => navigate('/student/progress')}
              >
                <TrendingUp className="w-6 h-6" />
                <span className="text-sm">Tiến độ</span>
              </Button>
              <Button
                variant="secondary"
                className="flex flex-col items-center gap-2 p-4 h-auto"
                onClick={() => navigate('/student/statistics')}
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">Thống kê</span>
              </Button>
            </div>
          </Card>

          {/* Achievements */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Thành tự</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🔥', name: 'Học tập chăm chỉ', unlocked: true },
                { icon: '⭐', name: 'Xuất sắc', unlocked: true },
                { icon: '📚', name: 'Người đọc', unlocked: true },
                { icon: '🎯', name: 'Chính xác', unlocked: false },
                { icon: '💪', name: 'Kiên trì', unlocked: false },
                { icon: '🏅', name: 'Hoàn thành', unlocked: false },
              ].map((achievement, index) => (
                <div
                  key={index}
                  className={`text-center p-3 rounded-xl border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                  title={achievement.name}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Study Time */}
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-8 h-8" />
              <div>
                <p className="text-indigo-100 text-sm">Thời gian học</p>
                <p className="text-2xl font-bold">Hôm nay</p>
              </div>
            </div>
            <div className="text-center py-4">
              <p className="text-5xl font-bold">2.5</p>
              <p className="text-indigo-200">giờ</p>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-indigo-200">{day}</p>
                  <div className={`h-2 rounded-full ${i < 5 ? 'bg-white' : 'bg-indigo-400'}`} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default StudentDashboard;
