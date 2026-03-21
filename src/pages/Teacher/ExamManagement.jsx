import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  Clock,
  Filter,
  Search,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  FileText
} from 'lucide-react';

// UI Components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

// Services
import teacherService from '../../services/teacherService';
import examService from '../../services/examService';

const ExamManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [exams, setExams] = useState([]); // Now contains ExamApproval objects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [examToPublish, setExamToPublish] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch exams with approval status
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await examService.getSubmittedExams();
      setExams(response || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError(t('exam.fetchError', 'Lỗi khi tải danh sách bài kiểm tra.'));
    } finally {
      setLoading(false);
    }
  };

  // Filter exams - now works with ExamApproval objects
  const filteredExams = exams.filter(approval => {
    const exam = approval.exam;
    const matchesSearch = exam?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam?.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || approval.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || exam?.course?.name === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Sort exams - now works with ExamApproval objects
  const sortedExams = [...filteredExams].sort((a, b) => {
    let comparison = 0;
    const aValue = sortBy === 'createdAt' ? a.submittedAt : a[sortBy];
    const bValue = sortBy === 'createdAt' ? b.submittedAt : b[sortBy];
    if (aValue < bValue) comparison = -1;
    if (aValue > bValue) comparison = 1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle publish/unpublish
  const handlePublishToggle = (exam) => {
    setExamToPublish(exam);
    setShowPublishModal(true);
  };

  const confirmPublish = async () => {
    if (!examToPublish) return;

    setPublishing(true);
    try {
      await teacherService.toggleExamPublish(examToPublish.id, !examToPublish.published);
      
      // Update local state
      setExams(exams.map(exam => 
        exam.id === examToPublish.id 
          ? { ...exam, published: !exam.published }
          : exam
      ));
      
      setShowPublishModal(false);
      setExamToPublish(null);
    } catch (err) {
      console.error(err);
      setError(t('exam.publishError', 'Lỗi khi cập nhật trạng thái bài kiểm tra.'));
    } finally {
      setPublishing(false);
    }
  };

  // Handle delete
  const handleDelete = (exam) => {
    setExamToDelete(exam);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!examToDelete) return;

    setDeleting(true);
    try {
      await teacherService.deleteExam(examToDelete.id);
      
      // Update local state
      setExams(exams.filter(exam => exam.id !== examToDelete.id));
      
      setShowDeleteModal(false);
      setExamToDelete(null);
    } catch (err) {
      console.error(err);
      setError(t('exam.deleteError', 'Lỗi khi xóa bài kiểm tra.'));
    } finally {
      setDeleting(false);
    }
  };

  // Get approval status badge
  const getStatusBadge = (approval) => {
    switch (approval.status) {
      case 'PENDING':
        return <Badge variant="warning">{t('exam.pending', 'Chờ duyệt')}</Badge>;
      case 'APPROVED':
        return <Badge variant="success">{t('exam.approved', 'Đã duyệt')}</Badge>;
      case 'REJECTED':
        return <Badge variant="error">{t('exam.rejected', 'Bị từ chối')}</Badge>;
      default:
        return <Badge variant="secondary">{approval.status}</Badge>;
    }
  };

  // Get exam type badge
  const getTypeBadge = (type) => {
    const typeConfig = {
      QUIZ: { variant: 'success', label: t('exam.type.quiz', 'Trắc nghiệm') },
      WRITING: { variant: 'info', label: t('exam.type.writing', 'Viết') },
      LISTENING: { variant: 'warning', label: t('exam.type.listening', 'Nghe') },
      READING: { variant: 'purple', label: t('exam.type.reading', 'Đọc hiểu') },
      MIXED: { variant: 'primary', label: t('exam.type.mixed', 'Hỗn hợp') }
    };
    
    const config = typeConfig[type] || typeConfig.MIXED;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Get unique courses from exam approvals
  const courses = [...new Set(exams.map(approval => approval.exam?.course?.name).filter(Boolean))];

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('exam.management', 'Quản Lý Bài Kiểm Tra')}
        subtitle={t('exam.managementSubtitle', 'Tạo, chỉnh sửa và quản lý các bài kiểm tra')}
        breadcrumbs={[
          { label: t('nav.home', 'Trang chủ'), href: '/' },
          { label: t('nav.teacher', 'Giáo viên'), href: '/teacher' },
          { label: t('exam.management', 'Quản Lý Bài Kiểm Tra') }
        ]}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/teacher/exam-management/create')}
          >
            {t('exam.create', 'Tạo Bài Kiểm Tra Mới')}
          </Button>
        }
      />

      {/* Info Alert - Approval Workflow Notice */}
      <Alert variant="info" icon={<AlertCircle className="w-5 h-5" />} className="mb-6">
        <div className="font-medium mb-1">Quy trình phê duyệt đề thi</div>
        <div className="text-sm">
          Khi bạn tạo đề thi mới, nó sẽ ở trạng thái <strong>Chờ duyệt</strong>. Education Manager sẽ xem xét và phê duyệt trước khi đề thi được công bố.
          Bạn sẽ nhận được email thông báo khi đề thi được duyệt hoặc từ chối.
        </div>
      </Alert>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          icon={<AlertCircle className="w-5 h-5" />}
          className="mb-6"
          dismissible
          onDismiss={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Filters Card */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">
              {t('exam.filters', 'Bộ Lọc')}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder={t('exam.searchPlaceholder', 'Tìm kiếm theo tên hoặc mã bài kiểm tra...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>

            {/* Status Filter */}
            <div>
              <Input
                type="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: t('exam.allStatus', 'Tất cả trạng thái') },
                  { value: 'PENDING', label: t('exam.pending', 'Chờ duyệt') },
                  { value: 'APPROVED', label: t('exam.approved', 'Đã duyệt') },
                  { value: 'REJECTED', label: t('exam.rejected', 'Bị từ chối') }
                ]}
              />
            </div>

            {/* Course Filter */}
            <div>
              <Input
                type="select"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                options={[
                  { value: 'all', label: t('exam.allCourses', 'Tất cả khóa học') },
                  ...courses.map(course => ({ value: course, label: course }))
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Exams List */}
      <Card>
        {loading ? (
          <div className="p-12 text-center">
            <Loading.PageLoading />
          </div>
        ) : sortedExams.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">
              {t('exam.noExams', 'Không tìm thấy bài kiểm tra nào')}
            </p>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/teacher/exam-management/create')}
            >
              {t('exam.createFirst', 'Tạo Bài Kiểm Tra Đầu Tiên')}
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedExams.map((approval) => {
              const exam = approval.exam;
              if (!exam) return null;

              return (
                <div key={approval.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    {/* Exam Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {exam.title}
                        </h3>
                        <span className="text-sm text-gray-500">({exam.code})</span>
                        {getStatusBadge(approval)}
                        {exam.examType && getTypeBadge(exam.examType)}
                      </div>

                      <p className="text-gray-600 mb-3">{exam.description}</p>

                      {/* Show feedback if rejected */}
                      {approval.status === 'REJECTED' && approval.feedback && (
                        <Alert variant="error" className="mb-3" icon={<AlertCircle className="w-4 h-4" />}>
                          <div className="font-medium text-sm">Phản hồi từ Education Manager:</div>
                          <div className="text-sm mt-1">{approval.feedback}</div>
                        </Alert>
                      )}

                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{exam.examQuestions?.length || exam.totalQuestions || 0} {t('exam.questions', 'câu hỏi')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{exam.durationMinutes} {t('exam.minutes', 'phút')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(approval.submittedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {exam.course?.name && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{exam.course.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => navigate(`/exam-attempts/${exam.id}`)}
                        title={t('exam.viewAttempts', 'Xem kết quả')}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => navigate(`/exam-editor/${exam.id}`)}
                        title={t('exam.edit', 'Chỉnh sửa')}
                        disabled={approval.status === 'APPROVED'}
                        className={approval.status === 'APPROVED' ? 'opacity-50 cursor-not-allowed' : ''}
                      />
                      {approval.status === 'APPROVED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => handlePublishToggle(exam)}
                          title={exam.published ? t('exam.unpublish', 'Hủy đăng') : t('exam.publish', 'Đăng')}
                        />
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDelete(exam)}
                        title={t('exam.delete', 'Xóa')}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setExamToDelete(null);
        }}
        size="md"
        title={t('exam.deleteConfirmTitle', 'Xác Nhận Xóa')}
      >
        <div className="space-y-4">
          <Alert variant="warning">
            {t('exam.deleteWarning', 'Bạn có chắc chắn muốn xóa bài kiểm tra này? Hành động này không thể hoàn tác.')}
          </Alert>

          {examToDelete && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">{examToDelete.title}</p>
              <p className="text-sm text-gray-500">{examToDelete.code}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowDeleteModal(false);
                setExamToDelete(null);
              }}
            >
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loading.Spinner size="sm" />
                  {t('exam.deleting', 'Đang xóa...')}
                </>
              ) : (
                t('exam.confirmDelete', 'Xóa Bài Kiểm Tra')
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Publish Confirmation Modal */}
      <Modal
        isOpen={showPublishModal}
        onClose={() => {
          setShowPublishModal(false);
          setExamToPublish(null);
        }}
        size="md"
        title={examToPublish?.published ? t('exam.unpublishConfirmTitle', 'Hủy Đăng') : t('exam.publishConfirmTitle', 'Đăng Bài Kiểm Tra')}
      >
        <div className="space-y-4">
          <Alert variant={examToPublish?.published ? 'warning' : 'info'}>
            {examToPublish?.published 
              ? t('exam.unpublishWarning', 'Hủy đăng sẽ ẩn bài kiểm tra khỏi danh sách công khai. Bạn có chắc chắn?')
              : t('exam.publishInfo', 'Đăng bài kiểm tra sẽ cho phép sinh viên tham gia. Bạn có chắc chắn?')
            }
          </Alert>

          {examToPublish && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">{examToPublish.title}</p>
              <p className="text-sm text-gray-500">{examToPublish.code}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowPublishModal(false);
                setExamToPublish(null);
              }}
            >
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button
              variant={examToPublish?.published ? 'warning' : 'primary'}
              className="flex-1"
              icon={examToPublish?.published ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              onClick={confirmPublish}
              disabled={publishing}
            >
              {publishing ? (
                <>
                  <Loading.Spinner size="sm" />
                  {t('exam.processing', 'Đang xử lý...')}
                </>
              ) : (
                examToPublish?.published ? t('exam.confirmUnpublish', 'Hủy Đăng') : t('exam.confirmPublish', 'Đăng')
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ExamManagement;
