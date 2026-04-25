import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, AlertTriangle, CheckCircle, BookOpen, Calendar, X, Lock } from 'lucide-react';
import authService from '../../services/authService';
import Swal from 'sweetalert2';

/**
 * CourseStatus - Hiển thị trạng thái khóa học và auto-lock
 * Cảnh báo learner khi sắp hết hạn hoặc bị khóa
 */
const CourseStatus = () => {
  const { t } = useTranslation();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const accountLocked = false; // Sẽ lấy từ user status

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const data = await authService.getEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status based on days remaining
  const getEnrollmentStatus = (endDate) => {
    const days = getDaysRemaining(endDate);
    if (days < 0) return 'expired';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'active';
  };

  // Get status config
  const getStatusConfig = (status) => {
    switch (status) {
      case 'expired':
        return {
          color: 'red',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          icon: Lock,
          text: t('component.courseStatus.expired', 'Đã hết hạn'),
          description: t('component.courseStatus.expiredDesc', 'Khóa học đã kết thúc')
        };
      case 'critical':
        return {
          color: 'red',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          icon: AlertTriangle,
          text: t('component.courseStatus.critical', 'Sắp hết hạn'),
          description: t('component.courseStatus.criticalDesc', 'Còn ít hơn 7 ngày')
        };
      case 'warning':
        return {
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          icon: Clock,
          text: t('component.courseStatus.warning', 'Sắp hết hạn'),
          description: t('component.courseStatus.warningDesc', 'Còn ít hơn 30 ngày')
        };
      default:
        return {
          color: 'green',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          icon: CheckCircle,
          text: t('component.courseStatus.active', 'Đang học'),
          description: t('component.courseStatus.activeDesc', 'Đang trong thời hạn')
        };
    }
  };

  if (loading) {
    return (
    <div className="animate-pulse space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
      ))}
    </div>
  );
  }

  if (enrollments.length === 0) {
    return (
    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600 mb-1">{t('component.courseStatus.noCourses', 'Bạn chưa tham gia khóa học nào')}</p>
        <p className="text-sm text-gray-500">
          <a href="/courses" className="text-blue-600 hover:underline">
            {t('component.courseStatus.viewCourses', 'Xem danh sách khóa học')}
          </a>
        </p>
    </div>
  );
  }

  // Check if any enrollment is expired or critical
  const hasCriticalOrExpired = enrollments.some(e => {
    const status = getEnrollmentStatus(e.endDate);
    return status === 'expired' || status === 'critical';
  });

  return (
    <div className="space-y-4">
      {/* Warning Alert */}
      {hasCriticalOrExpired && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">
                {t('component.courseStatus.warningTitle', 'Cảnh báo: Tài khoản của bạn có thể bị khóa')}
              </h4>
              <p className="text-sm text-red-700">
                {t('component.courseStatus.warningDesc', 'Một hoặc nhiều khóa học của bạn đã hết hạn hoặc sắp hết hạn. Vui lòng liên hệ Staff để gia hạn hoặc đăng ký khóa học mới.')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enrollments List */}
      {enrollments.map((enrollment, index) => {
        const status = getEnrollmentStatus(enrollment.endDate);
        const config = getStatusConfig(status);
        const daysRemaining = getDaysRemaining(enrollment(enrollment.endDate));

        return (
          <div
            key={index}
            className={`p-4 rounded-xl border-2 ${
              status === 'expired'
                ? 'bg-red-50 border-red-200'
                : status === 'critical'
                ? 'bg-red-50 border-red-200'
                : status === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-2">
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <config.icon className={`w-5 h-5 ${config.textColor}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {enrollment.courseName || enrollment.className || t('component.courseStatus.course', 'Khóa học')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {enrollment.classCode || enrollment.courseCode}
                  </p>
                </div>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
                {config.text}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">{t('component.courseStatus.studyPeriod', 'Thời gian học')}</p>
                <p className="font-medium text-gray-900">
                  {new Date(enrollment.startDate).toLocaleDateString('vi-VN')} - {new Date(enrollment.endDate).toLocaleDateString('vi-VN')}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">{t('component.courseStatus.daysRemaining', 'Số ngày còn lại')}</p>
                <p className={`font-semibold ${
                  daysRemaining < 0
                    ? 'text-red-600'
                    : daysRemaining <= 7
                      ? 'text-red-600'
                      : daysRemaining <= 30
                        ? 'text-yellow-600'
                        : 'text-green-600'
                }`}>
                  {daysRemaining < 0
                    ? t('component.courseStatus.expired', 'Đã hết hạn')
                    : `${daysRemaining} ${t('component.courseStatus.days', 'ngày')}`
                  }
                </p>
              </div>
            </div>

            {/* Actions for expired/critical */}
            {status === 'expired' && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-red-200">
                <p className="text-sm text-red-700 mb-2">
                  {t('component.courseStatus.courseEnded', 'Khóa học này đã kết thúc. Vui lòng liên hệ để gia hạn hoặc đăng ký khóa học mới.')}
                </p>
                <button
                  onClick={() => window.location.href = '/courses'}
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('component.courseStatus.viewOtherCourses', 'Xem khóa học khác')}
                </button>
              </div>
            )}

            {/* Warning for critical */}
            {status === 'critical' && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  {t('component.courseStatus.courseEnding', '⚠️ Khóa học sẽ kết thúc trong {{days}} ngày nữa.', { days: daysRemaining })}
                  <a href="/contact" className="text-blue-600 hover:underline font-medium">
                    {' '}{t('component.courseStatus.contactNow', 'Liên hệ ngay')}
                  </a>
                  {' '}{t('component.courseStatus.toRenew', 'để gia hạn.')}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Contact Staff Button */}
      <button
        onClick={() => window.location.href = '/contact'}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        {t('component.courseStatus.contactStaff', 'Liên hệ Staff để gia hạn')}
      </button>
    </div>
  );
};

export default CourseStatus;
