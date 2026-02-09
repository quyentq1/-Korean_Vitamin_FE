import { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';
import { PageHeader, Card } from '../../components/ui';

/**
 * Admin Dashboard Component
 * Trang tổng quan cho Admin với thống kê, biểu đồ và hoạt động gần đây
 */
const AdminDashboard = () => {
  // State cho thống kê
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalExams: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    activeUsers: 0
  });

  // State cho hoạt động gần đây
  const [recentActivities, setRecentActivities] = useState([]);

  // State cho loading
  const [loading, setLoading] = useState(true);

  // Giả lập dữ liệu thống kê
  useEffect(() => {
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
    const mockStats = {
      totalUsers: 1250,
      totalStudents: 980,
      totalTeachers: 45,
      totalCourses: 32,
      totalExams: 156,
      totalRevenue: 45000000,
      newUsersThisMonth: 125,
      activeUsers: 856
    };

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
        action: 'Cảnh báo hệ thống',
        user: 'Hệ thống',
        time: '2 giờ trước',
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      }
    ];

    setStats(mockStats);
    setRecentActivities(mockActivities);
    setLoading(false);
  }, []);

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

  // Quick links
  const quickLinks = [
    {
      title: 'Quản lý người dùng',
      description: 'Thêm, sửa, xóa người dùng',
      icon: Users,
      path: '/user-management',
      color: 'bg-blue-500'
    },
    {
      title: 'Quản lý khóa học',
      description: 'Quản lý nội dung khóa học',
      icon: BookOpen,
      path: '/course-management',
      color: 'bg-green-500'
    },
    {
      title: 'Quản lý đăng ký',
      description: 'Xem và duyệt đăng ký',
      icon: FileText,
      path: '/registration-management',
      color: 'bg-purple-500'
    },
    {
      title: 'Cài đặt hệ thống',
      description: 'Cấu hình hệ thống',
      icon: Settings,
      path: '/system-settings',
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
        showBackButton={false}
      />

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

        {/* Doanh thu */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Doanh thu</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% so với tháng trước
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
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

        {/* Tỷ lệ hoàn thành */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tỷ lệ hoàn thành</h3>
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">78%</p>
          <p className="text-sm text-gray-600">Học viên hoàn thành khóa học</p>
        </Card>

        {/* Thời gian trung bình */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Thời gian học</h3>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">4.5h</p>
          <p className="text-sm text-gray-600">Trung bình mỗi ngày</p>
        </Card>
      </div>

      {/* Liên kết nhanh và hoạt động gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liên kết nhanh */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên kết nhanh</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="group"
              >
                <div className="p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <link.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                        {link.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Hoạt động gần đây */}
        <Card className="p-6">
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
      </div>

      {/* Thông báo hệ thống */}
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông báo hệ thống</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">Cập nhật hệ thống</p>
              <p className="text-xs text-yellow-700 mt-1">
                Hệ thống sẽ được bảo trì vào ngày 15/02/2025 từ 22:00 đến 23:00.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Tính năng mới</p>
              <p className="text-xs text-green-700 mt-1">
                Tính năng chấm bài viết bằng AI đã được cập nhật và cải thiện độ chính xác.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
