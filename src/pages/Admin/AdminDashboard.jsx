import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  Settings,
  UserPlus,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react';
import { PageHeader, Card, Button, Alert } from '../../components/ui';
import adminService from '../../services/adminService';
import AIAdminAnalytics from '../../components/AI/AIAdminAnalytics';

/**
 * Admin Dashboard Component
 * Trang tổng quan cho Admin với thống kê, biểu đồ và hoạt động gần đây
 * Senior-level implementation with real API integration
 */
const AdminDashboard = () => {
  // State cho thống kê
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalExams: 0,
    publishedExams: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    revenue: 0
  });

  // State cho hoạt động gần đây
  const [recentActivities, setRecentActivities] = useState([]);

  // State cho loading và error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch dashboard statistics from API
  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getDashboardStats();
      const data = response?.data || response || {};

      // Transform API response to match state structure with fallbacks
      setStats({
        totalUsers: data?.totalUsers || 0,
        totalStudents: data?.totalStudents || 0,
        totalTeachers: data?.totalTeachers || 0,
        totalCourses: data?.totalCourses || 0,
        totalExams: data?.totalExams || 0,
        publishedExams: data?.publishedExams || 0,
        pendingApprovals: data?.pendingApprovals || 0,
        activeUsers: data?.activeUsers || 0,
        newUsersThisMonth: data?.newUsersThisMonth || 0,
        revenue: data?.revenue || 0
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalCourses: 0,
        totalExams: 0,
        publishedExams: 0,
        pendingApprovals: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        revenue: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Mock activities for now (can be replaced with real API later)
  useEffect(() => {
    const mockActivities = [
      {
        id: 1,
        type: 'user',
        action: 'Người dùng mới đăng ký',
        user: 'Nguyễn Văn A',
        time: '5 phút trước',
        icon: UserPlus,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        id: 2,
        type: 'course',
        action: 'Khóa học mới được tạo',
        user: 'Giáo viên Trần B',
        time: '15 phút trước',
        icon: BookOpen,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        id: 3,
        type: 'exam',
        action: 'Bài kiểm tra mới được thêm',
        user: 'Giáo viên Lê C',
        time: '30 phút trước',
        icon: FileText,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      {
        id: 4,
        type: 'payment',
        action: 'Thanh toán thành công',
        user: 'Học viên Phạm D',
        time: '1 giờ trước',
        icon: DollarSign,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100'
      },
      {
        id: 5,
        type: 'alert',
        action: `${stats.pendingApprovals} bài thi chờ duyệt`,
        user: 'Hệ thống',
        time: 'Vừa xong',
        icon: AlertCircle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100'
      }
    ];

    setRecentActivities(mockActivities);
  }, [stats.pendingApprovals]);

  // Format số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format số lượng
  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  // Quick links - Updated with new admin routes
  const quickLinks = [
    {
      title: 'Quản lý người dùng',
      description: 'Thêm, sửa, xóa người dùng',
      icon: Users,
      path: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Quản lý giáo viên',
      description: 'Quản lý thông tin giáo viên',
      icon: GraduationCap,
      path: '/admin/teachers',
      color: 'bg-indigo-500'
    },
    {
      title: 'Quản lý khóa học',
      description: 'Quản lý nội dung khóa học',
      icon: BookOpen,
      path: '/admin/courses',
      color: 'bg-green-500'
    },
    {
      title: 'Phê duyệt',
      description: `${stats.pendingApprovals} bài thi chờ duyệt`,
      icon: CheckCircle,
      path: '/admin/approvals',
      color: stats.pendingApprovals > 0 ? 'bg-amber-500' : 'bg-gray-500'
    },
    {
      title: 'Thống kê',
      description: 'Xem báo cáo và thống kê',
      icon: TrendingUp,
      path: '/admin/statistics',
      color: 'bg-purple-500'
    },
    {
      title: 'Cài đặt hệ thống',
      description: 'Cấu hình hệ thống',
      icon: Settings,
      path: '/admin/settings',
      color: 'bg-gray-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Tổng quan hệ thống"
      />

      {/* AI Analytics Section */}
      <AIAdminAnalytics onAnalyticsReceived={(data) => console.log('AI Analytics received:', data)} />

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tổng người dùng */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng người dùng</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{stats.newUsersThisMonth} tháng này
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Tổng học viên */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng học viên</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalStudents)}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {stats.activeUsers} đang hoạt động
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Tổng khóa học */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng khóa học</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalCourses)}</p>
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {stats.totalExams} bài kiểm tra
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Bài thi */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bài thi</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalExams)}</p>
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {stats.publishedExams} đã xuất bản
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Thống kê chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Số lượng giáo viên */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Giáo viên</h3>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{formatNumber(stats.totalTeachers)}</p>
          <p className="text-sm text-gray-600">Giáo viên đang hoạt động</p>
        </Card>

        {/* Lần thi */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Lần thi</h3>
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{formatNumber(stats.publishedExams)}</p>
          <p className="text-sm text-gray-600">Đã xuất bản</p>
        </Card>

        {/* Chờ phê duyệt */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Chờ phê duyệt</h3>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{formatNumber(stats.pendingApprovals)}</p>
          <p className="text-sm text-gray-600">Bài thi/chương trình</p>
        </Card>
      </div>

      {/* Hoạt động gần đây */}
      <Card className="mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
          <Link
            to="/"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`w-10 h-10 ${activity.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                <activity.icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.action}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {activity.user} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Thông báo hệ thống */}
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông báo hệ thống</h3>
        <div className="space-y-3">
          {stats.pendingApprovals > 0 ? (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Chờ phê duyệt</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Có {stats.pendingApprovals} bài thi/chương trình đang chờ phê duyệt.
                </p>
              </div>
            </div>
          ) : null}
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Tổng quan hệ thống</p>
              <p className="text-xs text-green-700 mt-1">
                {stats.activeUsers} / {stats.totalUsers} người dùng đang hoạt động.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
