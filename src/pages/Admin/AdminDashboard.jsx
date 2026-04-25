import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

const AdminDashboard = () => {
  const { t } = useTranslation();
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

  const [recentActivities, setRecentActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getDashboardStats();
      const data = response?.data || response || {};

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
      setError(t('admin.dashboard.fetchError'));
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
  }, [t]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  useEffect(() => {
    const mockActivities = [
      {
        id: 1,
        type: 'user',
        action: t('admin.dashboard.activityNewUser'),
        user: 'Nguyễn Văn A',
        time: t('admin.dashboard.timeMinutesAgo', { count: 5 }),
        icon: UserPlus,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        id: 2,
        type: 'course',
        action: t('admin.dashboard.activityNewCourse'),
        user: t('admin.dashboard.teacherTranB'),
        time: t('admin.dashboard.timeMinutesAgo', { count: 15 }),
        icon: BookOpen,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        id: 3,
        type: 'exam',
        action: t('admin.dashboard.activityNewExam'),
        user: t('admin.dashboard.teacherLeC'),
        time: t('admin.dashboard.timeMinutesAgo', { count: 30 }),
        icon: FileText,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      {
        id: 4,
        type: 'payment',
        action: t('admin.dashboard.activityPaymentSuccess'),
        user: t('admin.dashboard.studentPhamD'),
        time: t('admin.dashboard.timeHoursAgo', { count: 1 }),
        icon: DollarSign,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100'
      },
      {
        id: 5,
        type: 'alert',
        action: t('admin.dashboard.pendingExamsWaiting', { count: stats.pendingApprovals }),
        user: t('admin.dashboard.system'),
        time: t('admin.dashboard.justNow'),
        icon: AlertCircle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100'
      }
    ];

    setRecentActivities(mockActivities);
  }, [stats.pendingApprovals, t]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const quickLinks = [
    {
      title: t('admin.dashboard.linkUserManagement'),
      description: t('admin.dashboard.linkUserManagementDesc'),
      icon: Users,
      path: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: t('admin.dashboard.linkTeacherManagement'),
      description: t('admin.dashboard.linkTeacherManagementDesc'),
      icon: GraduationCap,
      path: '/admin/teachers',
      color: 'bg-indigo-500'
    },
    {
      title: t('admin.dashboard.linkCourseManagement'),
      description: t('admin.dashboard.linkCourseManagementDesc'),
      icon: BookOpen,
      path: '/admin/courses',
      color: 'bg-green-500'
    },
    {
      title: t('admin.dashboard.linkApprovals'),
      description: t('admin.dashboard.pendingExamsWaiting', { count: stats.pendingApprovals }),
      icon: CheckCircle,
      path: '/admin/approvals',
      color: stats.pendingApprovals > 0 ? 'bg-amber-500' : 'bg-gray-500'
    },
    {
      title: t('admin.dashboard.linkStatistics'),
      description: t('admin.dashboard.linkStatisticsDesc'),
      icon: TrendingUp,
      path: '/admin/statistics',
      color: 'bg-purple-500'
    },
    {
      title: t('admin.dashboard.linkSystemSettings'),
      description: t('admin.dashboard.linkSystemSettingsDesc'),
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
        title={t('admin.dashboard.title', 'Admin Dashboard')}
        subtitle={t('admin.dashboard.subtitle')}
      />

      <AIAdminAnalytics onAnalyticsReceived={(data) => console.log('AI Analytics received:', data)} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('admin.dashboard.totalUsers')}</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{stats.newUsersThisMonth} {t('admin.dashboard.thisMonth')}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('admin.dashboard.totalStudents')}</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalStudents)}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {stats.activeUsers} {t('admin.dashboard.active')}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('admin.dashboard.totalCourses')}</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalCourses)}</p>
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {stats.totalExams} {t('admin.dashboard.exams')}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('admin.dashboard.examPapers')}</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalExams)}</p>
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {stats.publishedExams} {t('admin.dashboard.published')}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('admin.dashboard.teachers')}</h3>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{formatNumber(stats.totalTeachers)}</p>
          <p className="text-sm text-gray-600">{t('admin.dashboard.activeTeachers')}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('admin.dashboard.examAttempts')}</h3>
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{formatNumber(stats.publishedExams)}</p>
          <p className="text-sm text-gray-600">{t('admin.dashboard.published')}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('admin.dashboard.pendingApproval')}</h3>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{formatNumber(stats.pendingApprovals)}</p>
          <p className="text-sm text-gray-600">{t('admin.dashboard.examsPrograms')}</p>
        </Card>
      </div>

      <Card className="mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('admin.dashboard.recentActivities')}</h3>
          <Link
            to="/"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {t('admin.dashboard.viewAll')}
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

      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.dashboard.systemNotifications')}</h3>
        <div className="space-y-3">
          {stats.pendingApprovals > 0 ? (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">{t('admin.dashboard.pendingApproval')}</p>
                <p className="text-xs text-yellow-700 mt-1">
                  {t('admin.dashboard.pendingApprovalMessage', { count: stats.pendingApprovals })}
                </p>
              </div>
            </div>
          ) : null}
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">{t('admin.dashboard.systemOverview')}</p>
              <p className="text-xs text-green-700 mt-1">
                {t('admin.dashboard.activeUsersCount', { active: stats.activeUsers, total: stats.totalUsers })}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
