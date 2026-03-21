import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Plus,
  FileText,
  Users,
  Clock,
  Calendar,
  ChevronRight,
  Award
} from 'lucide-react';

// UI Components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';

// Services
import teacherService from '../../services/teacherService';

const MyCourses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await teacherService.getAssignedCourses();
      setCourses(data || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level) => {
    const levelConfig = {
      BEGINNER: { variant: 'success', label: t('course.level.beginner', 'Sơ cấp') },
      INTERMEDIATE: { variant: 'warning', label: t('course.level.intermediate', 'Trung cấp') },
      ADVANCED: { variant: 'error', label: t('course.level.advanced', 'Cao cấp') }
    };

    const config = levelConfig[level] || levelConfig.BEGINNER;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary', label: t('course.status.draft', 'Bản nháp') },
      PUBLISHED: { variant: 'success', label: t('course.status.published', 'Đã công bố') },
      ARCHIVED: { variant: 'default', label: t('course.status.archived', 'Lưu trữ') }
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <PageContainer>
        <Loading.PageLoading />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('teacher.myCourses', 'Khóa Học Của Tôi')}
        subtitle={t('teacher.myCoursesSubtitle', 'Các khóa học bạn được phụ trách')}
        breadcrumbs={[
          { label: t('nav.home', 'Trang chủ'), href: '/' },
          { label: t('nav.teacher', 'Giáo viên'), href: '/teacher' },
          { label: t('teacher.myCourses', 'Khóa Học Của Tôi') }
        ]}
      />

      {/* No Courses */}
      {courses.length === 0 && (
        <Card className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('teacher.noCoursesAssigned', 'Chưa được assigned khóa học nào')}
          </h3>
          <p className="text-gray-500 mb-6">
            {t('teacher.contactManager', 'Vui lòng liên hệ Education Manager để được assigned vào khóa học.')}
          </p>
        </Card>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            {/* Course Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {course.code}
                  </p>
                </div>
                {getLevelBadge(course.level)}
              </div>

              {/* Course Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Course Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration || 60} {t('course.minutes', 'phút')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Award className="w-4 h-4" />
                  <span>{course.fee?.toLocaleString() || 0} ₫</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                {getStatusBadge(course.status)}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate(`/teacher/exam-management/create?courseId=${course.id}`)}
                >
                  {t('exam.createForCourse', 'Tạo Đề Thi')}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  icon={<FileText className="w-4 h-4" />}
                  onClick={() => navigate(`/teacher/exam-management?courseId=${course.id}`)}
                >
                  {t('exam.viewExams', 'Xem Đề Thi')}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

export default MyCourses;
