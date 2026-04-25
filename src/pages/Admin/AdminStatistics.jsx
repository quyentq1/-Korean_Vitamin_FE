import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  TrendingUp,
  DollarSign,
  BookOpen,
  GraduationCap,
  Award,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  Card,
  Button
} from '../../components/ui';

/**
 * AdminStatistics - Thống kê và Phân tích cho Admin
 */
const AdminStatistics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({
    users: { total: 0, new: 0, growth: 0 },
    students: { total: 0, active: 0, growth: 0 },
    teachers: { total: 0, active: 0, growth: 0 },
    courses: { total: 0, active: 0, growth: 0 },
    revenue: { total: 0, growth: 0 },
    exams: { total: 0, completed: 0, avgScore: 0 }
  });
  const [charts, setCharts] = useState({
    userGrowth: [],
    revenueChart: [],
    courseEnrollment: [],
    teacherPerformance: []
  });

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      // TODO: Gọi API thực tế
      // const data = await adminService.getStatistics(timeRange);

      // Mock data based on time range
      const mockStats = {
        users: {
          total: 1256,
          new: timeRange === '7d' ? 45 : timeRange === '30d' ? 189 : 567,
          growth: 12.5
        },
        students: {
          total: 1089,
          active: 856,
          growth: 15.3
        },
        teachers: {
          total: 167,
          active: 142,
          growth: 8.7
        },
        courses: {
          total: 45,
          active: 38,
          growth: 6.8
        },
        revenue: {
          total: timeRange === '7d' ? 125000000 : timeRange === '30d' ? 485000000 : 1520000000,
          growth: 23.7
        },
        exams: {
          total: 234,
          completed: 198,
          avgScore: 78.5
        }
      };

      const mockCharts = {
        userGrowth: [
          { date: '17/03', students: 820, teachers: 140, total: 960 },
          { date: '18/03', students: 835, teachers: 142, total: 977 },
          { date: '19/03', students: 850, teachers: 145, total: 995 },
          { date: '20/03', students: 865, teachers: 148, total: 1013 },
          { date: '21/03', students: 880, teachers: 150, total: 1030 },
          { date: '22/03', students: 895, teachers: 155, total: 1050 },
          { date: '23/03', students: 910, teachers: 160, total: 1070 },
        ],
        revenueChart: [
          { date: '17/03', revenue: 15500000 },
          { date: '18/03', revenue: 18200000 },
          { date: '19/03', revenue: 16800000 },
          { date: '20/03', revenue: 21000000 },
          { date: '21/03', revenue: 19500000 },
          { date: '22/03', revenue: 17500000 },
          { date: '23/03', revenue: 16500000 },
        ],
        courseEnrollment: [
          { name: 'Hàn Quốc Cơ Bản', students: 256, percentage: 85 },
          { name: 'Ngữ Pháp Hàn Quốc', students: 189, percentage: 75 },
          { name: 'TOPIK I', students: 145, percentage: 72 },
          { name: 'Chữ Hán Nâng Cao', students: 98, percentage: 65 },
          { name: 'Hàn Quốc Giao Tiếp', students: 87, percentage: 58 },
        ],
        teacherPerformance: [
          { name: 'Lee Su Jin', students: 156, rating: 4.9, courses: 3 },
          { name: 'Kim Min Jun', students: 134, rating: 4.8, courses: 5 },
          { name: 'Park Ji Hoon', students: 98, rating: 4.7, courses: 2 },
          { name: 'Choi Soo Young', students: 87, rating: 4.6, courses: 2 },
          { name: 'Jung Hae In', students: 76, rating: 4.9, courses: 1 },
        ]
      };

      setStats(mockStats);
      setCharts(mockCharts);
    } catch (error) {
      console.error('Error fetching statistics:', error);
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
        title={t('admin.statistics.title', 'Thống kê & Phân tích')}
        subtitle={t('admin.statistics.subtitle', 'Xem và phân tích dữ liệu hệ thống')}
      />

      {/* Time Range Selector */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{t('admin.statistics.timeRange', 'Time Range')}:</span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { value: '7d', label: t('admin.statistics.7days', '7 Days') },
              { value: '30d', label: t('admin.statistics.30days', '30 Days') },
              { value: '90d', label: t('admin.statistics.90days', '90 Days') },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  timeRange === range.value
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-12 h-12 text-blue-200" />
            <span className={`text-sm font-medium ${stats.users.growth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {stats.users.growth >= 0 ? '+' : ''}{stats.users.growth}%
            </span>
          </div>
          <p className="text-blue-100 text-sm">{t('admin.statistics.totalUsers', 'Total Users')}</p>
          <p className="text-3xl font-bold">{stats.users.total.toLocaleString()}</p>
          <p className="text-blue-200 text-xs mt-1">
            +{stats.users.new} {t('admin.statistics.newUsers', 'new users')}
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <div className="flex items-center justify-between mb-2">
            <GraduationCap className="w-12 h-12 text-green-200" />
            <span className={`text-sm font-medium ${stats.students.growth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {stats.students.growth >= 0 ? '+' : ''}{stats.students.growth}%
            </span>
          </div>
          <p className="text-green-100 text-sm">{t('admin.statistics.students', 'Students')}</p>
          <p className="text-3xl font-bold">{stats.students.total.toLocaleString()}</p>
          <p className="text-green-200 text-xs mt-1">
            {stats.students.active} {t('admin.statistics.active', 'active')}
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-12 h-12 text-purple-200" />
            <span className={`text-sm font-medium ${stats.courses.growth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {stats.courses.growth >= 0 ? '+' : ''}{stats.courses.growth}%
            </span>
          </div>
          <p className="text-purple-100 text-sm">{t('admin.statistics.courses', 'Courses')}</p>
          <p className="text-3xl font-bold">{stats.courses.total}</p>
          <p className="text-purple-200 text-xs mt-1">
            {stats.courses.active} {t('admin.statistics.active', 'active')}
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-12 h-12 text-amber-200" />
            <span className={`text-sm font-medium ${stats.revenue.growth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {stats.revenue.growth >= 0 ? '+' : ''}{stats.revenue.growth}%
            </span>
          </div>
          <p className="text-amber-100 text-sm">{t('admin.statistics.revenue', 'Revenue')}</p>
          <p className="text-3xl font-bold">
            {(stats.revenue.total / 1000000).toFixed(0)}M
          </p>
          <p className="text-amber-200 text-xs mt-1">
            VNĐ
          </p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('admin.statistics.userGrowth', 'User Growth')}</h3>
              <p className="text-sm text-gray-500">{t('admin.statistics.userGrowthDesc', 'Number of users over time')}</p>
            </div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {charts.userGrowth.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end justify-center h-48">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${(item.students / 1000) * 100}%` }}
                    title={`${t('admin.statistics.students', 'Students')}: ${item.students}`}
                  />
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t transition-all hover:from-purple-600 hover:to-purple-500"
                    style={{ height: `${(item.teachers / 200) * 100}%` }}
                    title={`${t('admin.statistics.teachers', 'Teachers')}: ${item.teachers}`}
                  />
                </div>
                <span className="text-xs text-gray-500">{item.date}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-gray-600">{t('admin.statistics.students', 'Students')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded" />
              <span className="text-gray-600">{t('admin.statistics.teachers', 'Teachers')}</span>
            </div>
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('admin.statistics.revenue', 'Revenue')}</h3>
              <p className="text-sm text-gray-500">{t('admin.statistics.revenueDesc', 'Revenue over time')}</p>
            </div>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {charts.revenueChart.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all hover:from-green-600 hover:to-green-500 h-48 relative group">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {(item.revenue / 1000000).toFixed(1)}M
                  </div>
                </div>
                <span className="text-xs text-gray-500">{item.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Course Enrollment & Teacher Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Course Enrollment */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('admin.statistics.popularCourses', 'Popular Courses')}</h3>
              <p className="text-sm text-gray-500">{t('admin.statistics.popularCoursesDesc', 'Student enrollment by course')}</p>
            </div>
            <BookOpen className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {charts.courseEnrollment.map((course, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{course.name}</span>
                  <span className="text-gray-600">{course.students} {t('admin.statistics.students', 'students')}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${course.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Teacher Performance */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('admin.statistics.teacherPerformance', 'Teacher Performance')}</h3>
              <p className="text-sm text-gray-500">{t('admin.statistics.teacherPerformanceDesc', 'Top teachers by student count')}</p>
            </div>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {charts.teacherPerformance.map((teacher, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  {teacher.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{teacher.name}</p>
                  <p className="text-xs text-gray-500">
                    {teacher.students} {t('admin.statistics.students', 'students')} • {teacher.courses} {t('admin.statistics.courses', 'courses')}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Award className="w-4 h-4" />
                  <span className="font-bold">{teacher.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Exam Statistics */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t('admin.statistics.examStats', 'Exam Statistics')}</h3>
            <p className="text-sm text-gray-500">{t('admin.statistics.examStatsDesc', 'Overview of exams')}</p>
          </div>
          <Target className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
              {stats.exams.total}
            </div>
            <p className="text-sm text-gray-600 mb-1">{t('admin.statistics.totalExams', 'Total Exams')}</p>
            <p className="text-xs text-gray-500">{t('admin.statistics.createdInSystem', 'Created in the system')}</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
              {stats.exams.completed}
            </div>
            <p className="text-sm text-gray-600 mb-1">{t('admin.statistics.completed', 'Completed')}</p>
            <p className="text-xs text-gray-500">
              {((stats.exams.completed / stats.exams.total) * 100).toFixed(1)}% {t('admin.statistics.completionRate', 'completion rate')}
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
              {stats.exams.avgScore}
            </div>
            <p className="text-sm text-gray-600 mb-1">{t('admin.statistics.avgScore', 'Average Score')}</p>
            <p className="text-xs text-gray-500">{t('admin.statistics.ofAllExams', 'Of all exams')}</p>
          </div>
        </div>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('admin.statistics.activeTeachers', 'Active Teachers')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.teachers.active}/{stats.teachers.total}</p>
              <p className="text-xs text-green-600">
                +{stats.teachers.growth}% {t('admin.statistics.vsPreviousPeriod', 'vs previous period')}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('admin.statistics.avgTime', 'Average Time')}</p>
              <p className="text-2xl font-bold text-gray-900">2.5 {t('admin.statistics.hoursPerDay', 'hrs/day')}</p>
              <p className="text-xs text-blue-600">
                {t('admin.statistics.studentStudyTime', 'Student study time')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default AdminStatistics;
