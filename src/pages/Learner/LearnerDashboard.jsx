import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock, 
  Users,
  CheckCircle,
  X,
  Download,
  Search,
  Filter,
  RefreshCw,
  Settings
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import studentService from '../../services/studentService';
import { 
  PageContainer, 
  PageHeader, 
  Card, 
  StatsCard, 
  Section, 
  Button, 
  Alert,
  Loading,
  Badge,
  Grid
} from '../../components/ui';

/**
 * LearnerDashboard Component
 * 
 * Enhanced learner dashboard with:
 * - Integration with GET /api/student/results API
 * - Interactive charts (recharts)
 * - Recent exams with status badges
 * - Upcoming classes with attendance status
 * - Quick actions
 * - Modern UI components
 * 
 * @component
 */
const LearnerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    testsCompleted: 0,
    avgScore: 0,
    studyHours: 0,
    classesAttended: 0,
  });
  const [recentExams, setRecentExams] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [learningProgress, setLearningProgress] = useState([]);

  // Fetch student results and stats
  const fetchStudentData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch exam results
      const resultsData = await studentService.getExamResults();
      setRecentExams(resultsData.results || []);

      // Calculate stats from results
      const completedTests = resultsData.results?.filter(r => r.status === 'COMPLETED') || [];
      const avgScore = completedTests.length > 0 
        ? Math.round(completedTests.reduce((sum, r) => sum + r.score, 0) / completedTests.length)
        : 0;
      
      setStats({
        testsCompleted: completedTests.length,
        avgScore: avgScore,
        studyHours: resultsData.studyHours || 0,
        classesAttended: resultsData.classesAttended || 0,
      });

      // Fetch learning progress
      const progressData = await studentService.getLearningProgress();
      setLearningProgress(progressData || []);

      // Fetch upcoming classes
      const classesData = await studentService.getUpcomingClasses();
      setUpcomingClasses(classesData || []);

    } catch (err) {
      console.error('Error fetching student data:', err);
      setError(t('learner.error.fetchFailed', 'Không thể tải dữ liệu. Vui lòng thử lại sau.'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchStudentData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchStudentData();
  };

  // Handle exam click
  const handleExamClick = (examId) => {
    navigate(`/exam-result/${examId}`);
  };

  // Handle class click
  const handleClassClick = (classId) => {
    navigate(`/class-detail/${classId}`);
  };

  // Prepare chart data
  const progressChartData = learningProgress.map(item => ({
    skill: item.skill,
    progress: item.progress,
    fullMark: 100,
  }));

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading.Spinner size="xl" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('learner.dashboardTitle', 'Dashboard Học Viên')}
        subtitle={t('learner.dashboardSubtitle', 'Xem tiến độ học tập của bạn')}
        actions={[
          {
            label: t('common.refresh', 'Làm mới'),
            icon: RefreshCw,
            onClick: handleRefresh,
            variant: 'ghost',
          },
        ]}
      />

      {/* Error Alert */}
      {error && (
        <Alert type="error" dismissible onDismiss={() => setError('')} className="mb-6">
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid3Cols gap="4" className="mb-6">
        <StatsCard
          title={t('learner.testsCompleted', 'Bài test hoàn thành')}
          value={stats.testsCompleted}
          icon={<BookOpen className="w-6 h-6" />}
          trend={stats.testsCompleted > 0 ? 'up' : 'neutral'}
          trendValue={stats.testsCompleted > 0 ? '+5' : null}
          color="primary"
        />
        <StatsCard
          title={t('learner.avgScore', 'Điểm trung bình')}
          value={`${stats.avgScore}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={stats.avgScore >= 80 ? 'up' : 'down'}
          trendValue={`${stats.avgScore >= 80 ? '+3' : '-2'}%`}
          color={stats.avgScore >= 80 ? 'success' : 'warning'}
        />
        <StatsCard
          title={t('learner.studyHours', 'Giờ học tích lũy')}
          value={stats.studyHours}
          icon={<Clock className="w-6 h-6" />}
          trend="up"
          trendValue="+12h"
          color="info"
        />
        <StatsCard
          title={t('learner.classesAttended', 'Buổi học đã tham gia')}
          value={stats.classesAttended}
          icon={<Users className="w-6 h-6" />}
          trend="up"
          trendValue="+2"
          color="warning"
        />
      </Grid3Cols>

      {/* Main Content Grid */}
      <Grid2Cols gap="6">
        {/* Left Column - Learning Progress & Recent Exams */}
        <div className="space-y-6">
          {/* Learning Progress Section */}
          <Section
            title={t('learner.progressTitle', 'Tiến Độ Học Tập')}
            icon={<TrendingUp className="w-5 h-5 text-primary-600" />}
            actions={
              <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
                {t('common.downloadReport', 'Tải báo cáo')}
              </Button>
            }
          >
            {/* Progress Bar Chart */}
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressChartData}>
                  <CartesianGrid strokeDasharray="3 3 0" vertical={false} />
                  <XAxis dataKey="skill" axisLine={false} tickLine={false} />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      color: '#F3F4F6',
                      borderRadius: '8px',
                      fontSize: '13px',
                      padding: '8px 12px'
                    }}
                  />
                  <Bar 
                    dataKey="progress" 
                    fill="#3DCBB1" 
                    radius={[8, 8, 0, 8]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Skill Progress Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {learningProgress.map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{item.skill}</h3>
                      <Badge variant={item.progress >= 80 ? 'success' : item.progress >= 60 ? 'warning' : 'error'}>
                        {item.progress}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.progress >= 80 ? 'bg-green-500' :
                          item.progress >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {item.progress >= 80 
                        ? t('learner.progress.excellent', 'Xuất sắc')
                        : item.progress >= 60 
                          ? t('learner.progress.good', 'Khá')
                          : t('learner.progress.needsImprovement', 'Cần cải thiện')
                      }
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          {/* Recent Exams Section */}
          <Section
            title={t('learner.recentExams', 'Bài Thi Gần Đây')}
            icon={<FileText className="w-5 h-5 text-primary-600" />}
            actions={
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/test-library')}
              >
                {t('learner.viewAll', 'Xem tất cả')}
              </Button>
            }
          >
            {recentExams.length > 0 ? (
              <div className="space-y-3">
                {recentExams.map((exam) => (
                  <Card 
                    key={exam.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleExamClick(exam.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            exam.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                            exam.status === 'PASSED' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {exam.status === 'COMPLETED' && <CheckCircle className="w-5 h-5" />}
                            {exam.status === 'PASSED' && <CheckCircle className="w-5 h-5" />}
                            {exam.status === 'FAILED' && <X className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{exam.examName}</h3>
                            <p className="text-sm text-gray-500">{exam.courseName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{exam.score}</div>
                          <p className="text-xs text-gray-500">{exam.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <Badge 
                          variant={exam.status === 'COMPLETED' ? 'success' : 
                                  exam.status === 'PASSED' ? 'warning' : 
                                  exam.status === 'FAILED' ? 'error' : 'info'}
                        >
                          {exam.status}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={<Download className="w-4 h-4" />}
                        >
                          {t('common.viewDetail', 'Xem chi tiết')}
                        </Button>
                      </div>
                      </div>
                    </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{t('learner.noExams', 'Chưa có bài thi nào')}</p>
              </div>
            )}
          </Section>
        </div>

        {/* Right Column - Upcoming Classes & Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Classes Section */}
          <Section
            title={t('learner.upcomingClasses', 'Lớp Học Sắp Tới')}
            icon={<Calendar className="w-5 h-5 text-primary-600" />}
          >
            {upcomingClasses.length > 0 ? (
              <div className="space-y-3">
                {upcomingClasses.map((cls) => (
                  <Card 
                    key={cls.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleClassClick(cls.id)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        cls.attendanceStatus === 'PRESENT' ? 'bg-green-100 text-green-600' :
                        cls.attendanceStatus === 'ABSENT' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{cls.className}</h3>
                        <p className="text-sm text-gray-500">{cls.courseName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{cls.date}</span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{cls.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{cls.teacher}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <Badge 
                        variant={cls.attendanceStatus === 'PRESENT' ? 'success' : 
                                cls.attendanceStatus === 'ABSENT' ? 'error' : 'info'}
                      >
                        {cls.attendanceStatus}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate('/my-schedule')}
                      >
                        {t('learner.viewSchedule', 'Xem lịch')}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{t('learner.noUpcomingClasses', 'Không có lớp học sắp tới')}</p>
              </div>
            )}
          </Section>

          {/* Quick Actions Section */}
          <Section
            title={t('learner.quickActions', 'Thao Tác Nhanh')}
            icon={<FileText className="w-5 h-5 text-primary-600" />}
          >
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="primary"
                size="lg"
                icon={<BookOpen className="w-5 h-5" />}
                onClick={() => navigate('/test-library')}
                className="w-full"
              >
                {t('learner.takeTest', 'Làm Bài Test')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={<Calendar className="w-5 h-5" />}
                onClick={() => navigate('/my-schedule')}
                className="w-full"
              >
                {t('learner.viewSchedule', 'Xem Lịch Học')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={<FileText className="w-5 h-5" />}
                onClick={() => navigate('/writing-submission')}
                className="w-full"
              >
                {t('learner.submitWriting', 'Nộp Bài Viết')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={<Users className="w-5 h-5" />}
                onClick={() => navigate('/forum')}
                className="w-full"
              >
                {t('learner.forum', 'Diễn Đàn')}
              </Button>
            </div>

            {/* Additional Quick Links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">
                {t('learner.quickLinks', 'Liên Kết Nhanh')}
              </h4>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="md"
                  icon={<Search className="w-4 h-4" />}
                  onClick={() => navigate('/courses')}
                  className="w-full justify-start"
                >
                  {t('learner.browseCourses', 'Duyệt Khóa Học')}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  icon={<Filter className="w-4 h-4" />}
                  onClick={() => navigate('/prep')}
                  className="w-full justify-start"
                >
                  {t('learner.examPrep', 'Luyện Thi TOPIK')}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  icon={<Settings className="w-4 h-4" />}
                  onClick={() => navigate('/profile')}
                  className="w-full justify-start"
                >
                  {t('learner.settings', 'Cài Đặt')}
                </Button>
              </div>
            </div>
          </Section>
        </div>
      </Grid2Cols>

      {/* Footer */}
      <Footer />
    </PageContainer>
  );
};

export default LearnerDashboard;
