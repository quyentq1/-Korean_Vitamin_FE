import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  BarChart3
} from 'lucide-react';

// UI Components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Alert from '../../components/ui/Alert';

// Recharts
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Services
import adminService from '../../services/adminService';

const Analytics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState(30);

  // Data
  const [platformStats, setPlatformStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [examStats, setExamStats] = useState(null);
  const [classStats, setClassStats] = useState(null);
  const [userTrend, setUserTrend] = useState([]);
  const [examTrend, setExamTrend] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [
        platformRes,
        courseRes,
        examRes,
        classRes,
        userTrendRes,
        examTrendRes
      ] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getCourseStats(),
        adminService.getExamStats(),
        adminService.getClassStats(),
        adminService.getUserTrend(timeRange),
        adminService.getExamTrend(timeRange)
      ]);

      setPlatformStats(platformRes.data);
      setCourseStats(courseRes.data);
      setExamStats(examRes.data);
      setClassStats(classRes.data);
      setUserTrend(userTrendRes.data);
      setExamTrend(examTrendRes.data);
      setError('');
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Format data for charts
  const userTrendFormatted = userTrend.map(point => ({
    date: new Date(point.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    users: point.value
  }));

  const examTrendFormatted = examTrend.map(point => ({
    date: new Date(point.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    attempts: point.value
  }));

  // Course performance data
  const coursePerformanceData = [
    { name: 'Enrolled', value: courseStats?.totalEnrollments || 0, color: '#3b82f6' },
    { name: 'Completed', value: courseStats?.completedEnrollments || 0, color: '#10b981' },
    { name: 'In Progress', value: (courseStats?.totalEnrollments || 0) - (courseStats?.completedEnrollments || 0), color: '#f59e0b' }
  ];

  // Exam score distribution
  const examScoreData = [
    { range: '0-40', count: Math.floor((examStats?.totalAttempts || 0) * 0.1), color: '#ef4444' },
    { range: '41-60', count: Math.floor((examStats?.totalAttempts || 0) * 0.2), color: '#f59e0b' },
    { range: '61-80', count: Math.floor((examStats?.totalAttempts || 0) * 0.4), color: '#3b82f6' },
    { range: '81-100', count: Math.floor((examStats?.totalAttempts || 0) * 0.3), color: '#10b981' }
  ];

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('admin.analytics.title', 'Analytics Dashboard')}
        subtitle={t('admin.analytics.subtitle', 'Detailed platform analytics and insights')}
        breadcrumbs={[
          { label: t('nav.admin', 'Admin'), path: '/admin' },
          { label: t('nav.analytics', 'Analytics') }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={fetchAnalyticsData}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        }
      />

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold">{platformStats?.totalUsers || 0}</p>
              <p className="text-blue-100 text-xs mt-2">
                +{platformStats?.newUsersThisMonth || 0} this month
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-200 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Active Courses</p>
              <p className="text-3xl font-bold">{courseStats?.activeCourses || 0}</p>
              <p className="text-green-100 text-xs mt-2">
                {courseStats?.totalCourses || 0} total courses
              </p>
            </div>
            <BookOpen className="w-12 h-12 text-green-200 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Exam Attempts</p>
              <p className="text-3xl font-bold">{examStats?.totalAttempts || 0}</p>
              <p className="text-purple-100 text-xs mt-2">
                Avg: {examStats?.averageScore?.toFixed(1) || '0'} points
              </p>
            </div>
            <FileText className="w-12 h-12 text-purple-200 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Active Classes</p>
              <p className="text-3xl font-bold">{classStats?.activeClasses || 0}</p>
              <p className="text-orange-100 text-xs mt-2">
                Avg size: {classStats?.averageClassSize?.toFixed(1) || '0'}
              </p>
            </div>
            <GraduationCap className="w-12 h-12 text-orange-200 opacity-50" />
          </div>
        </Card>
      </div>

      {/* User Growth Trend */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">User Growth Trend</h3>
            <p className="text-sm text-gray-500">New user registrations over time</p>
          </div>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={userTrendFormatted}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUsers)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Course & Exam Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Course Completion */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Course Performance</h3>
              <p className="text-sm text-gray-500">Enrollment and completion rates</p>
            </div>
            <BookOpen className="w-5 h-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={coursePerformanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {coursePerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{courseStats?.enrollmentRate?.toFixed(1) || 0}%</p>
              <p className="text-xs text-gray-500">Enrollment Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{courseStats?.completionRate?.toFixed(1) || 0}%</p>
              <p className="text-xs text-gray-500">Completion Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{courseStats?.totalEnrollments || 0}</p>
              <p className="text-xs text-gray-500">Total Enrollments</p>
            </div>
          </div>
        </Card>

        {/* Exam Score Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Exam Performance</h3>
              <p className="text-sm text-gray-500">Score distribution analysis</p>
            </div>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={examScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {examScoreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-600">{examStats?.averageScore?.toFixed(1) || 0}</p>
              <p className="text-xs text-gray-500">Average Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{examStats?.passRate?.toFixed(1) || 0}%</p>
              <p className="text-xs text-gray-500">Pass Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{examStats?.totalAttempts || 0}</p>
              <p className="text-xs text-gray-500">Total Attempts</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Exam Attempts Trend */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Exam Attempts Trend</h3>
            <p className="text-sm text-gray-500">Daily exam activity</p>
          </div>
          <Calendar className="w-5 h-5 text-orange-500" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={examTrendFormatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey="attempts"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </PageContainer>
  );
};

export default Analytics;
