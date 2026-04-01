import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
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

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [examStats, setExamStats] = useState(null);
  const [classStats, setClassStats] = useState(null);
  const [userTrend, setUserTrend] = useState([]);
  const [examTrend, setExamTrend] = useState([]);
  const [timeRange, setTimeRange] = useState(30);
  const [comparison, setComparison] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, courseStatsRes, examStatsRes, classStatsRes, userTrendRes, examTrendRes] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getCourseStats(),
        adminService.getExamStats(),
        adminService.getClassStats(),
        adminService.getUserTrend(timeRange),
        adminService.getExamTrend(timeRange)
      ]);

      // Handle response - axios already unwraps .data
      setStats(statsRes || null);
      setCourseStats(courseStatsRes || null);
      setExamStats(examStatsRes || null);
      setClassStats(classStatsRes || null);
      setUserTrend(userTrendRes || []);
      setExamTrend(examTrendRes || []);
      setError('');
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');

      // Set default values to prevent crashes
      setStats({
        totalUsers: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
        activeUsers: 0,
        totalCourses: 0,
        totalExams: 0,
        totalClasses: 0,
        pendingApprovals: 0
      });
      setCourseStats({
        totalCourses: 0,
        activeCourses: 0,
        enrollmentRate: 0,
        completionRate: 0,
        totalEnrollments: 0,
        completedEnrollments: 0
      });
      setExamStats({
        totalExams: 0,
        publishedExams: 0,
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        passedAttempts: 0,
        failedAttempts: 0
      });
      setClassStats({
        totalClasses: 0,
        activeClasses: 0,
        averageClassSize: 0,
        totalStudentsInClasses: 0,
        totalTeachersAssigned: 0
      });
      setUserTrend([]);
      setExamTrend([]);
    } finally {
      setLoading(false);
    }
  };

  const handleComparePeriods = async () => {
    setShowComparison(true);
    try {
      const period1End = new Date();
      const period1Start = new Date(period1End.getTime() - timeRange * 24 * 60 * 60 * 1000);

      const period2Start = new Date(period1Start.getTime() - timeRange * 24 * 60 * 60 * 1000);
      const period2End = period1Start;

      const comparisonRes = await adminService.compareTimePeriods(
        period1Start.toISOString(),
        period1End.toISOString(),
        period2Start.toISOString(),
        period2End.toISOString()
      );

      setComparison(comparisonRes.data);
    } catch (err) {
      console.error('Failed to load comparison data:', err);
      setError('Failed to load comparison data');
    }
  };

  // Format data for charts
  const userTrendData = userTrend.map(point => ({
    date: new Date(point.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    users: point.value,
    label: point.label
  }));

  const examTrendData = examTrend.map(point => ({
    date: new Date(point.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    attempts: point.value,
    label: point.label
  }));

  // Role distribution data
  const roleDistributionData = [
    { name: 'Students', value: stats?.totalUsers - stats?.activeUsers || 0, color: '#10b981' },
    { name: 'Teachers', value: Math.floor((stats?.totalUsers || 0) * 0.15), color: '#3b82f6' },
    { name: 'Admin', value: Math.floor((stats?.totalUsers || 0) * 0.05), color: '#ef4444' },
    { name: 'Staff', value: Math.floor((stats?.totalUsers || 0) * 0.1), color: '#f59e0b' }
  ];

  // Calculate growth rate
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

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
        title={t('admin.dashboard.title', 'Admin Dashboard')}
        subtitle={t('admin.dashboard.subtitle', 'Platform overview and analytics')}
        breadcrumbs={[
          { label: t('nav.admin', 'Admin'), path: '/admin' },
          { label: t('nav.dashboard', 'Dashboard') }
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
              onClick={fetchDashboardData}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        }
      />

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Users */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{stats?.newUsersThisWeek || 0} this week
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Active Users */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
              <p className="text-xs text-gray-500 mt-2">
                {stats?.totalUsers ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Total Courses */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalCourses || 0}</p>
              <p className="text-xs text-blue-600 mt-2">Active programs</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Total Exams */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Exams</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalExams || 0}</p>
              <p className="text-xs text-orange-600 mt-2">All categories</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Second Row - Classes & Approvals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Total Classes */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Classes</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalClasses || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Active learning groups</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.pendingApprovals || 0}</p>
              <p className="text-xs text-yellow-600 mt-2">Require attention</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Growth Trend</h3>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Last {timeRange} days</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userTrendData}>
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
                tickFormatter={(value) => value}
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

        {/* Exam Trend Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Exam Attempts</h3>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Last {timeRange} days</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={examTrendData}>
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
              <Bar dataKey="attempts" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Third Row - Course & Class Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Course Statistics */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Course Performance</h3>
            <BookOpen className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Courses</span>
              <span className="text-2xl font-bold text-gray-900">{courseStats?.totalCourses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Courses</span>
              <span className="text-2xl font-bold text-green-600">{courseStats?.activeCourses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Enrollment Rate</span>
              <span className="text-2xl font-bold text-blue-600">
                {courseStats?.enrollmentRate ? `${courseStats.enrollmentRate.toFixed(1)}%` : '0%'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-2xl font-bold text-purple-600">
                {courseStats?.completionRate ? `${courseStats.completionRate.toFixed(1)}%` : '0%'}
              </span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Enrollments</span>
                <span className="font-semibold">{courseStats?.totalEnrollments || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${courseStats?.completionRate || 0}%`
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{courseStats?.completedEnrollments || 0} completed</p>
            </div>
          </div>
        </Card>

        {/* Class Statistics */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Class Statistics</h3>
            <GraduationCap className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Classes</span>
              <span className="text-2xl font-bold text-gray-900">{classStats?.totalClasses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Classes</span>
              <span className="text-2xl font-bold text-green-600">{classStats?.activeClasses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Class Size</span>
              <span className="text-2xl font-bold text-blue-600">
                {classStats?.averageClassSize ? classStats.averageClassSize.toFixed(1) : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Students</span>
              <span className="text-2xl font-bold text-indigo-600">{classStats?.totalStudentsInClasses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Teachers Assigned</span>
              <span className="text-2xl font-bold text-orange-600">{classStats?.totalTeachersAssigned || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Fourth Row - Exam Statistics & Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Exam Statistics */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Exam Performance</h3>
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Exams</p>
              <p className="text-2xl font-bold text-blue-600">{examStats?.totalExams || 0}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Published</p>
              <p className="text-2xl font-bold text-green-600">{examStats?.publishedExams || 0}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Attempts</p>
              <p className="text-2xl font-bold text-purple-600">{examStats?.totalAttempts || 0}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Pass Rate</p>
              <p className="text-2xl font-bold text-orange-600">
                {examStats?.passRate ? `${examStats.passRate.toFixed(1)}%` : '0%'}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Score</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {examStats?.averageScore ? examStats.averageScore.toFixed(1) : '0'}
                </span>
                <span className="text-sm text-gray-500">/ 100</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${examStats?.averageScore || 0}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600">Passed: {examStats?.passedAttempts || 0}</span>
              <span className="text-red-600">Failed: {examStats?.failedAttempts || 0}</span>
            </div>
          </div>
        </Card>

        {/* Role Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roleDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roleDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {roleDistributionData.map((role, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className="text-gray-600">{role.name}</span>
                </div>
                <span className="font-semibold">{role.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fifth Row - Time Period Comparison */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Time Period Comparison</h3>
            <p className="text-sm text-gray-500">Compare current period with previous period</p>
          </div>
          <button
            onClick={handleComparePeriods}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Compare Periods
          </button>
        </div>

        {showComparison && comparison ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Users Comparison */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Users Growth</span>
                {comparison.userGrowthRate >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className={`text-2xl font-bold ${comparison.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.userGrowthRate >= 0 ? '+' : ''}{comparison.userGrowthRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {comparison.period1.totalUsers} vs {comparison.period2.totalUsers}
              </p>
            </div>

            {/* Exams Comparison */}
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Exams Growth</span>
                {comparison.examGrowthRate >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className={`text-2xl font-bold ${comparison.examGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.examGrowthRate >= 0 ? '+' : ''}{comparison.examGrowthRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {comparison.period1.totalExams} vs {comparison.period2.totalExams}
              </p>
            </div>

            {/* Courses Comparison */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Courses Growth</span>
                {comparison.courseGrowthRate >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className={`text-2xl font-bold ${comparison.courseGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.courseGrowthRate >= 0 ? '+' : ''}{comparison.courseGrowthRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {comparison.period1.totalCourses} vs {comparison.period2.totalCourses}
              </p>
            </div>

            {/* Classes Comparison */}
            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Classes Growth</span>
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                +{((comparison.period1.totalClasses - comparison.period2.totalClasses) / (comparison.period2.totalClasses || 1) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {comparison.period1.totalClasses} vs {comparison.period2.totalClasses}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Click "Compare Periods" to see growth analysis</p>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default AdminDashboard;
