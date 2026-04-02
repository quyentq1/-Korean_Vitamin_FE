import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  Activity,
  Target,
  BarChart3,
  Clock,
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

// Custom Hooks
import useAnalyticsData from '../../hooks/useAnalyticsData';

// Services
import adminService from '../../services/adminService';

// Utils
import Swal from 'sweetalert2';

// Color Palette
const PALETTE = {
  primary: {
    blue: '#3b82f6',
    green: '#10b981',
    orange: '#f97316',
    purple: '#8b5cf6',
    red: '#ef4444',
    yellow: '#f59e0b',
    cyan: '#06b6d4',
    pink: '#ec4899'
  },
  gradients: {
    blue: ['from-blue-500', 'to-blue-600'],
    green: ['from-emerald-500', 'to-green-600'],
    orange: ['from-orange-500', 'to-orange-600'],
    purple: ['from-violet-500', 'to-purple-600'],
    red: ['from-red-500', 'to-rose-600']
  }
};

/**
 * Analytics Dashboard - Modern Implementation
 * Fully responsive with optimized CSS and real-time data
 */
const Analytics = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState(30);

  // Fetch analytics data using custom hook
  const { data, loading, error, refresh } = useAnalyticsData(timeRange);

  // Format chart data with null safety - MUST be before any conditional returns
  const userTrendFormatted = useMemo(() =>
    (data?.userTrend || []).map(point => ({
      date: new Date(point.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
      users: point.value || 0
    })), [data?.userTrend]);

  const examTrendFormatted = useMemo(() =>
    (data?.examTrend || []).map(point => ({
      date: new Date(point.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
      attempts: point.value || 0
    })), [data?.examTrend]);

  const examScoreData = useMemo(() =>
    data?.examIntelligence?.scoreDistribution?.map(bucket => ({
      range: bucket.range,
      count: bucket.count || 0,
      percentage: bucket.percentage || 0
    })) || [
      { range: '0-40', count: 0, percentage: 0 },
      { range: '41-60', count: 0, percentage: 0 },
      { range: '61-80', count: 0, percentage: 0 },
      { range: '81-100', count: 0, percentage: 0 }
    ], [data?.examIntelligence?.scoreDistribution]);

  const levelDistributionData = useMemo(() =>
    (data?.userSegments?.levelDistribution || []).map(level => ({
      name: level.level,
      value: level.count || 0,
      percentage: level.percentage || 0
    })), [data?.userSegments?.levelDistribution]);

  const activitySegmentsData = useMemo(() =>
    data?.userSegments?.activitySegments ? [
      { name: 'Hoạt động', value: data.userSegments.activitySegments.active || 0, color: PALETTE.primary.green },
      { name: 'Nguy cơ', value: data.userSegments.activitySegments.atRisk || 0, color: PALETTE.primary.yellow },
      { name: 'Ngưng hoạt động', value: data.userSegments.activitySegments.churned || 0, color: PALETTE.primary.red }
    ] : [], [data?.userSegments?.activitySegments]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    Toast.fire({ icon: type, title: message });
  };

  // Export handler
  const handleExport = async (format) => {
    try {
      showToast(`Đang xuất báo cáo ${format.toUpperCase()}...`, 'info');
      const response = await adminService.exportAnalytics({
        type: format,
        dateRange: timeRange,
        sections: ['overview', 'users', 'exams', 'courses', 'classes']
      });
      if (response?.message) {
        showToast(response.message, 'success');
      }
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Xuất báo cáo thất bại', 'error');
    }
  };

  // Format trend indicator component
  const TrendBadge = ({ trend, value }) => {
    if (!trend) return null;

    const isUp = trend.direction === 'up';
    const isDown = trend.direction === 'down';

    const styles = {
      up: 'bg-green-500/20 text-green-700 border-green-500/30',
      down: 'bg-red-500/20 text-red-700 border-red-500/30',
      neutral: 'bg-gray-500/20 text-gray-700 border-gray-500/30'
    };

    const Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border ${styles[trend.direction]}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">{Math.abs(value || trend.percentage || 0).toFixed(1)}%</span>
      </div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loading size="lg" />
            <p className="text-gray-500 mt-4 text-sm">Đang tải dữ liệu phân tích...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <Alert variant="danger" className="mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Không thể tải dữ liệu</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </Alert>
      </PageContainer>
    );
  }

  const {
    platformStats,
    courseStats,
    examStats,
    classStats,
    userTrend = [],
    examTrend = [],
    examIntelligence,
    comparative,
    userSegments,
    cohortAnalysis,
    churnRisk
  } = data || {};

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Phân tích dữ liệu"
        subtitle="Thống kê toàn diện về hoạt động nền tảng"
        breadcrumbs={[
          { label: 'Admin', path: '/admin' },
          { label: 'Phân tích' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
            >
              <option value={7}>7 ngày qua</option>
              <option value={30}>30 ngày qua</option>
              <option value={90}>90 ngày qua</option>
            </select>
            <button
              onClick={refresh}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm hover:shadow-md"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>
        }
      />

      {/* ==================== AI INSIGHTS PANEL ==================== */}
      {(churnRisk?.highRiskUsers > 0 || courseStats?.completionRate < 50) && (
        <Card className="mb-6 border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
              <p className="text-sm text-gray-500">Đề xuất dựa trên dữ liệu thực tế</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {churnRisk?.highRiskUsers > 0 && (
              <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-lg shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-1">Nguy cơ rời bỏ cao</h4>
                    <p className="text-sm text-red-700 mb-3">
                      {churnRisk.highRiskUsers} người dùng có nguy cơ rời bỏ ({churnRisk.overallChurnRate?.toFixed(1)}%)
                    </p>
                    <button
                      className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      onClick={() => {/* Navigate */}}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            )}

            {courseStats?.completionRate < 50 && (
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg shrink-0">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-900 mb-1">Tỷ lệ hoàn thành thấp</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Chỉ {courseStats.completionRate?.toFixed(1)}% học viên hoàn thành khóa học
                    </p>
                    <button className="text-xs bg-yellow-600 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-700 transition-colors font-medium">
                      Xem khóa học
                    </button>
                  </div>
                </div>
              </div>
            )}

            {userSegments?.activitySegments?.activeRate > 50 && (
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-1">Tương tác tốt</h4>
                    <p className="text-sm text-green-700">
                      {userSegments.activitySegments.activeRate?.toFixed(1)}% người dùng đang hoạt động
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ==================== OVERVIEW CARDS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Total Users Card */}
        <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className={`absolute inset-0 bg-gradient-to-br ${PALETTE.gradients.blue.join(' ')} opacity-95`} />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-150" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              {comparative?.userTrend && <TrendBadge trend={comparative.userTrend} />}
            </div>
            <p className="text-blue-100 text-sm font-medium mb-1">Tổng người dùng</p>
            <p className="text-4xl font-bold text-white mb-2">
              {platformStats?.totalUsers?.toLocaleString() || '0'}
            </p>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Clock className="w-4 h-4" />
              <span>+{platformStats?.newUsersThisMonth || 0} tháng này</span>
            </div>
          </div>
        </Card>

        {/* Active Courses Card */}
        <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className={`absolute inset-0 bg-gradient-to-br ${PALETTE.gradients.green.join(' ')} opacity-95`} />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-150" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              {comparative?.courseTrend && <TrendBadge trend={comparative.courseTrend} />}
            </div>
            <p className="text-green-100 text-sm font-medium mb-1">Khóa học hoạt động</p>
            <p className="text-4xl font-bold text-white mb-2">
              {courseStats?.activeCourses || 0}
            </p>
            <div className="flex items-center gap-2 text-green-100 text-sm">
              <BookOpen className="w-4 h-4" />
              <span>{courseStats?.totalCourses || 0} tổng khóa</span>
            </div>
          </div>
        </Card>

        {/* Exam Attempts Card */}
        <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className={`absolute inset-0 bg-gradient-to-br ${PALETTE.gradients.purple.join(' ')} opacity-95`} />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-150" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              {comparative?.examTrend && <TrendBadge trend={comparative.examTrend} />}
            </div>
            <p className="text-purple-100 text-sm font-medium mb-1">Lần thi</p>
            <p className="text-4xl font-bold text-white mb-2">
              {examStats?.totalAttempts?.toLocaleString() || '0'}
            </p>
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <Activity className="w-4 h-4" />
              <span>Trung bình {examStats?.averageScore?.toFixed(1) || '0'} điểm</span>
            </div>
          </div>
        </Card>

        {/* Active Classes Card */}
        <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className={`absolute inset-0 bg-gradient-to-br ${PALETTE.gradients.orange.join(' ')} opacity-95`} />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-150" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-orange-100 text-sm font-medium mb-1">Lớp học hoạt động</p>
            <p className="text-4xl font-bold text-white mb-2">
              {classStats?.activeClasses || 0}
            </p>
            <div className="flex items-center gap-2 text-orange-100 text-sm">
              <Users className="w-4 h-4" />
              <span>Trung bình {classStats?.averageClassSize?.toFixed(1) || '0'} HV/lớp</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ==================== CHARTS ROW 1 ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Trend */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Xu hướng người dùng</h3>
              <p className="text-sm text-gray-500">Đăng ký mới theo thời gian</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userTrendFormatted}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PALETTE.primary.blue} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={PALETTE.primary.blue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke={PALETTE.primary.blue}
                strokeWidth={3}
                fill="url(#colorUsers)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Exam Score Distribution */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Phân bố điểm thi</h3>
              <p className="text-sm text-gray-500">Thống kê điểm số thực tế</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={examScoreData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="range"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  name === 'count' ? `${value} lần` : `${value?.toFixed(1)}%`,
                  name === 'count' ? 'Số lần' : 'Tỷ lệ'
                ]}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={40}>
                {examScoreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.range === '81-100' ? PALETTE.primary.green :
                    entry.range === '61-80' ? PALETTE.primary.blue :
                    entry.range === '41-60' ? PALETTE.primary.yellow :
                    PALETTE.primary.red
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-700">
                {examStats?.averageScore?.toFixed(1) || '0'}
              </p>
              <p className="text-xs text-purple-600 font-medium">Điểm trung bình</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-700">
                {examStats?.passRate?.toFixed(1) || '0'}%
              </p>
              <p className="text-xs text-green-600 font-medium">Tỷ lệ đạt</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ==================== USER SEGMENTATION ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Level Distribution */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Phân bố trình độ</h3>
              <p className="text-sm text-gray-500">Theo cấp độ học vấn</p>
            </div>
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Users className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
          {levelDistributionData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={levelDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {levelDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.name === 'BEGINNER' ? PALETTE.primary.blue :
                        entry.name === 'INTERMEDIATE' ? PALETTE.primary.green :
                        entry.name === 'ADVANCED' ? PALETTE.primary.purple :
                        entry.name === 'TOPIK_I' ? PALETTE.primary.orange :
                        PALETTE.primary.cyan
                      } />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có dữ liệu phân bố trình độ</p>
            </div>
          )}
        </Card>

        {/* Activity Status */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Trạng thái hoạt động</h3>
              <p className="text-sm text-gray-500">Theo mức độ tương tác</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
          {activitySegmentsData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={activitySegmentsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {activitySegmentsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {activitySegmentsData.map((segment, index) => (
                  <div key={index} className={`text-center p-3 rounded-xl bg-${segment.color === PALETTE.primary.green ? 'green' : segment.color === PALETTE.primary.yellow ? 'yellow' : 'red'}-50`}>
                    <p className="text-lg font-bold text-gray-900">{segment.value}</p>
                    <p className="text-xs text-gray-600">{segment.name}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có dữ liệu hoạt động</p>
            </div>
          )}
        </Card>
      </div>

      {/* ==================== EXAM ATTEMPTS TREND ==================== */}
      <Card className="p-6 mb-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Xu hướng thi</h3>
            <p className="text-sm text-gray-500">Hoạt động thi hàng ngày</p>
          </div>
          <div className="p-2 bg-orange-100 rounded-lg">
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={examTrendFormatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey="attempts"
              stroke={PALETTE.primary.orange}
              strokeWidth={3}
              dot={{ fill: PALETTE.primary.orange, r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ==================== COHORT ANALYSIS ==================== */}
      {cohortAnalysis?.cohorts && cohortAnalysis.cohorts.length > 0 && (
        <Card className="p-6 mb-6 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Phân tích Cohort</h3>
              <p className="text-sm text-gray-500">Tỷ lệ giữ chân theo đợt đăng ký</p>
            </div>
            <div className="p-2 bg-pink-100 rounded-lg">
              <Calendar className="w-5 h-5 text-pink-600" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-bold text-gray-700 text-sm">Đợt</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700 text-sm">Số lượng</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700 text-sm">Tuần 1</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700 text-sm">Tuần 2</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700 text-sm">Tuần 4</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700 text-sm">Tuần 8</th>
                </tr>
              </thead>
              <tbody>
                {cohortAnalysis.cohorts.map((cohort, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-900">{cohort.cohortMonth}</td>
                    <td className="py-4 px-4 text-center text-gray-700">{cohort.cohortSize}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                        cohort.week1Retention >= 80 ? 'bg-green-100 text-green-800' :
                        cohort.week1Retention >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {cohort.week1Retention?.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                        cohort.week2Retention >= 70 ? 'bg-green-100 text-green-800' :
                        cohort.week2Retention >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {cohort.week2Retention?.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                        cohort.week4Retention >= 60 ? 'bg-green-100 text-green-800' :
                        cohort.week4Retention >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {cohort.week4Retention?.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                        cohort.week8Retention >= 50 ? 'bg-green-100 text-green-800' :
                        cohort.week8Retention >= 30 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {cohort.week8Retention?.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ==================== CHURN RISK ==================== */}
      {churnRisk && (
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Phân tích rời bỏ</h3>
              <p className="text-sm text-gray-500">Dự đoán nguy cơ người dùng rời bỏ</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>

          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <p className="text-3xl font-bold text-blue-900">{churnRisk.totalUsers}</p>
              <p className="text-sm text-blue-700 font-medium">Tổng người dùng</p>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <p className="text-3xl font-bold text-red-700">{churnRisk.overallChurnRate?.toFixed(1)}%</p>
              <p className="text-sm text-red-600 font-medium">Tỷ lệ rời bỏ hiện tại</p>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <p className="text-3xl font-bold text-orange-700">{churnRisk.predictedChurnRate?.toFixed(1)}%</p>
              <p className="text-sm text-orange-600 font-medium">Dự đoán 30 ngày</p>
            </div>
          </div>

          {/* Risk Segments */}
          {churnRisk.riskSegments && churnRisk.riskSegments.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-4">Phân khúc rủi ro</h4>
              <div className="grid grid-cols-3 gap-4">
                {churnRisk.riskSegments.map((segment, index) => (
                  <div key={index} className={`p-5 rounded-xl border-2 ${
                    segment.segment === 'high' ? 'border-red-400 bg-gradient-to-br from-red-50 to-red-100' :
                    segment.segment === 'medium' ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100' :
                    'border-green-400 bg-gradient-to-br from-green-50 to-green-100'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold capitalize text-gray-900">
                        {segment.segment === 'high' ? 'Cao' : segment.segment === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                      <span className="text-2xl font-bold">{segment.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${segment.percentage}%`,
                          backgroundColor: segment.segment === 'high' ? PALETTE.primary.red :
                                       segment.segment === 'medium' ? PALETTE.primary.yellow :
                                       PALETTE.primary.green
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{segment.percentage?.toFixed(1)}% người dùng</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* At-Risk Users */}
          {churnRisk.atRiskUsers && churnRisk.atRiskUsers.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Top người dùng nguy cơ cao</h4>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Người dùng</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Rủi ro</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Điểm</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Ngày không hoạt động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {churnRisk.atRiskUsers.slice(0, 10).map((user, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.fullName || user.username}</p>
                              <p className="text-xs text-gray-500">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            user.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {user.riskLevel === 'high' ? 'Cao' : 'Trung bình'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${user.riskScore}%`,
                                  backgroundColor: user.riskScore > 70 ? PALETTE.primary.red : PALETTE.primary.yellow
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700">{user.riskScore?.toFixed(0)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">{user.daysInactive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}
    </PageContainer>
  );
};

export default Analytics;
