import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
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
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  X,
  Link as LinkIcon,
  Copy
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

// Services
import teacherService from '../../services/teacherService';
import examService from '../../services/examService';

const ExamManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseIdFromUrl = searchParams.get('courseId');

  // State
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState(courseIdFromUrl || 'all');
  const [activeTab, setActiveTab] = useState('COURSE_PRACTICE'); // 'COURSE_PRACTICE', 'CLASS_PRACTICE', 'MOCK'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [examToPublish, setExamToPublish] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch exams with approval status
  useEffect(() => {
    fetchExams();
  }, [courseIdFromUrl]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      // Get exams from teacher's assigned classes only
      const examsData = await teacherService.getMyAssignedExams();

      // DEBUG: Log chi tiết
      window.examsDebug = examsData;
      console.table('Fetched exams from assigned classes:', examsData);

      if (!examsData || examsData.length === 0) {
        console.warn('NO EXAMS - Teacher not assigned to any classes or no exams in assigned classes');
        setExams([]);
        setLoading(false);
        return;
      }

      // Extract courseId from exam.course object
      const processedExams = examsData.map(exam => ({
        ...exam,
        courseId: exam.course?.id || exam.courseId
      }));

      console.table('Processed exams:', processedExams);
      setExams(processedExams);
      setError('');
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError(t('exam.fetchError', 'Lỗi khi tải danh sách bài kiểm tra.'));
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter exams - only filter by published status and exam category
  const filteredExams = exams.filter(exam => {
    if (!exam) return false;

    // Use debounced search
    const matchesSearch = !debouncedSearch ||
                         exam?.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         exam?.code?.toLowerCase().includes(debouncedSearch.toLowerCase());

    // Filter by tab (COURSE_PRACTICE, CLASS_PRACTICE, MOCK)
    let matchesTab = false;
    if (activeTab === 'COURSE_PRACTICE') {
      // Course practice exams: PRACTICE category AND NO classEntity/classId
      matchesTab = exam?.examCategory === 'PRACTICE' && !exam.classEntity && !exam.classId;
    } else if (activeTab === 'CLASS_PRACTICE') {
      // Class practice exams: PRACTICE category AND HAS classEntity/classId
      matchesTab = exam?.examCategory === 'PRACTICE' && (exam.classEntity || exam.classId);
    } else if (activeTab === 'MOCK') {
      // Mock exams: MOCK category
      matchesTab = exam?.examCategory === 'MOCK';
    }

    // Filter by published status only
    let matchesStatus = true;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'published') {
      matchesStatus = exam?.published === true;
    } else if (statusFilter === 'draft') {
      matchesStatus = exam?.published !== true;
    } else {
      // Remove approval status filters (pending, approved, rejected)
      matchesStatus = true;
    }

    // Filter by course - prioritize courseIdFromUrl from URL
    let matchesCourse = true;
    if (courseIdFromUrl) {
      matchesCourse = exam?.courseId == courseIdFromUrl;
    } else if (courseFilter !== 'all') {
      matchesCourse = exam?.course?.name === courseFilter;
    }

    return matchesSearch && matchesTab && matchesStatus && matchesCourse;
  });

  // Sort exams by createdAt descending
  const sortedExams = [...filteredExams].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB - dateA;
  });

  // Debug log
  console.log('=== EXAM DEBUG ===');
  console.log('Total exams from assigned classes:', exams.length);
  console.log('Filtered exams:', filteredExams.length);
  console.log('Sorted exams:', sortedExams.length);
  console.log('Search term:', searchTerm, '→ Debounced:', debouncedSearch);
  console.log('Status filter:', statusFilter);
  console.log('Course filter:', courseFilter);
  console.log('CourseId from URL:', courseIdFromUrl);

  // Log each exam with filter status
  exams.forEach(exam => {
    console.log(`Exam ${exam.id}:`, {
      title: exam.title,
      examCategory: exam.examCategory,
      published: exam.published,
      courseId: exam.courseId,
      courseName: exam.course?.name,
      matchesSearch: !debouncedSearch || exam?.title?.toLowerCase().includes(debouncedSearch.toLowerCase()),
      matchesCategory: exam?.examCategory === activeTab,
      matchesCourse: !courseIdFromUrl || exam?.courseId == courseIdFromUrl
    });
  });

  // Handle sort
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

  // Get published status badge
  const getPublishedBadge = (exam) => {
    if (exam.approvalStatus === 'APPROVED') {
      return <Badge variant="info">{t('exam.approved', 'Đã duyệt')}</Badge>;
    }
    if (exam.approvalStatus === 'REJECTED') {
      return <Badge variant="danger">{t('exam.rejected', 'Từ chối')}</Badge>;
    }
    if (exam.published) {
      return <Badge variant="success">{t('exam.published', 'Đã xuất bản')}</Badge>;
    }
    return <Badge variant="secondary">{t('exam.draft', 'Nháp')}</Badge>;
  };

  // Check if exam is locked (approved or published — cannot edit/delete)
  const isLocked = (exam) => {
    return exam.published || exam.approvalStatus === 'APPROVED';
  };

  // Generate student link for exam
  const getExamLink = (exam) => {
    const base = window.location.origin;
    const isClassExam = exam.examCategory === 'PRACTICE' && (exam.classEntity || exam.classId);
    const courseId = exam.course?.id || exam.courseId;
    const classId = exam.classEntity?.id || exam.classId;

    if (isClassExam && classId) {
      return `${base}/student/class/${classId}`;
    }
    if (courseId) {
      return `${base}/student/courses/${courseId}`;
    }
    return `${base}/exam/${exam.id}/intro`;
  };

  // Copy exam link to clipboard
  const handleCopyLink = async (exam) => {
    const link = getExamLink(exam);
    try {
      await navigator.clipboard.writeText(link);
      Swal.fire({
        icon: 'success',
        title: 'Đã sao chép!',
        html: `<div class="text-sm text-gray-600 break-all">${link}</div>`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      Swal.fire({
        icon: 'success',
        title: 'Đã sao chép!',
        html: `<div class="text-sm text-gray-600 break-all">${link}</div>`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  // Get exam type badge
  const getTypeBadge = (type) => {
    const typeConfig = {
      QUIZ: { variant: 'success', label: t('exam.type.quiz', 'Trắc nghiệm') },
      WRITING: { variant: 'info', label: t('exam.type.writing', 'Viết') },
      LISTENING: { variant: 'warning', label: t('exam.type.listening', 'Nghe') },
      READING: { variant: 'purple', label: t('exam.type.reading', 'Đọc hiểu') },
      MIXED: { variant: 'primary', label: t('exam.type.mixed', 'Hỗn hợp') },
      MULTIPLE_CHOICE: { variant: 'success', label: t('exam.type.multipleChoice', 'Trắc nghiệm') }
    };

    const config = typeConfig[type] || typeConfig.MIXED;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Get unique courses from exams
  const courses = [...new Set(exams.map(exam => exam?.course?.name).filter(Boolean))];

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={activeTab === 'MOCK' ? 'Quản Lý FreeTest' : 'Quản Lý Đề Luyện Thi'}
        subtitle={activeTab === 'MOCK'
          ? 'Tạo và quản lý các đề thi thử miễn phí (FreeTest)'
          : 'Tạo, chỉnh sửa và quản lý các đề luyện thi cho học viên'}
        breadcrumbs={[
          { label: t('nav.home', 'Trang chủ'), href: '/' },
          { label: t('nav.teacher', 'Giáo viên'), href: '/teacher' },
          { label: activeTab === 'MOCK' ? 'Quản Lý FreeTest' : 'Quản Lý Đề Luyện Thi' }
        ]}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate(
              courseIdFromUrl
                ? `/teacher/exam-management/create?courseId=${courseIdFromUrl}&examCategory=${activeTab}`
                : `/teacher/exam-management/create?examCategory=${activeTab}`
            )}
          >
            {t('exam.create', `Tạo ${activeTab === 'MOCK' ? 'FreeTest' : 'Đề Luyện Thi'} Mới`)}
          </Button>
        }
      />

      {/* Info Alert - Approval Workflow Notice */}
      <Alert variant="info" icon={<AlertCircle className="w-5 h-5" />} className="mb-6">
        <div className="font-medium mb-1">
          {activeTab === 'MOCK' ? 'Quy trình phê duyệt FreeTest' :
           activeTab === 'CLASS_PRACTICE' ? 'Quy trình phê duyệt đề luyện thi cho Lớp học' :
           'Quy trình phê duyệt đề luyện thi cho Khóa học'}
        </div>
        <div className="text-sm">
          {activeTab === 'MOCK' ? (
            <>
              FreeTest là <strong>đề thi thử miễn phí</strong> dành cho tất cả người dùng (không cần đăng ký).
              Khi tạo FreeTest mới, nó sẽ ở trạng thái <strong>Chờ duyệt</strong>. Education Manager sẽ xem xét và phê duyệt.
            </>
          ) : activeTab === 'CLASS_PRACTICE' ? (
            <>
              Đề luyện thi cho <strong>lớp học</strong> dành cho học viên trong lớp cụ thể.
              Khi tạo đề mới, nó sẽ ở trạng thái <strong>Chờ duyệt</strong>. Education Manager sẽ xem xét và phê duyệt.
            </>
          ) : (
            <>
              Đề luyện thi cho <strong>khóa học</strong> dành cho học viên đã đăng ký khóa học.
              Khi tạo đề mới, nó sẽ ở trạng thái <strong>Chờ duyệt</strong>. Education Manager sẽ xem xét và phê duyệt.
            </>
          )}
        </div>
      </Alert>

      {/* Course Filter Indicator */}
      {courseFilter !== 'all' && courseIdFromUrl && (
        <div className="mb-6 flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Đang lọc theo khóa học (Course ID: {courseIdFromUrl})
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/teacher/exam-management')}
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}

      {/* Exam Category Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px gap-2">
            <button
              onClick={() => setActiveTab('COURSE_PRACTICE')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'COURSE_PRACTICE'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>📚 Khóa Học</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('CLASS_PRACTICE')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'CLASS_PRACTICE'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>👥 Lớp Học</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('MOCK')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'MOCK'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>🆓 FreeTest</span>
              </div>
            </button>
          </nav>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          {activeTab === 'COURSE_PRACTICE' ? (
            <p>Đề thi luyện thi cho <strong>khóa học</strong> - học viên đã đăng ký khóa học</p>
          ) : activeTab === 'CLASS_PRACTICE' ? (
            <p>Đề thi luyện thi cho <strong>lớp học</strong> - học viên trong lớp cụ thể</p>
          ) : (
            <p>Đề thi thử miễn phí cho tất cả người dùng (FreeTest)</p>
          )}
        </div>
      </div>

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">
                {t('exam.filters', 'Bộ Lọc')}
              </h3>
            </div>

            {/* Active Filters Display */}
            <div className="flex items-center gap-2">
              {searchTerm && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  <Search className="w-3 h-3" />
                  <span>{searchTerm}</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {statusFilter !== 'all' && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  <span>{statusFilter === 'published' ? 'Đã xuất bản' : 'Nháp'}</span>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {courseFilter !== 'all' && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                  <span>{courseFilter}</span>
                  <button
                    onClick={() => setCourseFilter('all')}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t('exam.searchPlaceholder', 'Tìm kiếm theo tên hoặc mã bài kiểm tra...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white pr-10"
              >
                <option value="all">{t('exam.allStatus', 'Tất cả trạng thái')}</option>
                <option value="published">{t('exam.published', 'Đã xuất bản')}</option>
                <option value="draft">{t('exam.draft', 'Nháp')}</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Course Filter */}
            <div className="relative">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white pr-10"
              >
                <option value="all">{t('exam.allCourses', 'Tất cả khóa học')}</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold text-gray-900">{sortedExams.length}</span> / <span className="font-semibold text-gray-900">{exams.length}</span> bài kiểm tra
            </p>
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
              {activeTab === 'MOCK'
                ? 'Không tìm thấy đề FreeTest nào'
                : activeTab === 'CLASS_PRACTICE'
                ? 'Không tìm thấy đề luyện thi cho lớp học nào'
                : 'Không tìm thấy đề luyện thi cho khóa học nào'}
            </p>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate(
                courseIdFromUrl
                  ? `/teacher/exam-management/create?courseId=${courseIdFromUrl}&examCategory=${activeTab === 'MOCK' ? 'MOCK' : 'PRACTICE'}`
                  : `/teacher/exam-management/create?examCategory=${activeTab === 'MOCK' ? 'MOCK' : 'PRACTICE'}`
              )}
            >
              {activeTab === 'MOCK' ? 'Tạo FreeTest Đầu Tiên' :
               activeTab === 'CLASS_PRACTICE' ? 'Tạo Đề Lớp Học Đầu Tiên' :
               'Tạo Đề Khóa Học Đầu Tiên'}
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedExams.map((exam) => {
              if (!exam) return null;

              // Debug log
              console.log('Rendering exam:', exam.id, exam);

              return (
                <div key={exam.id} className="p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                  <div className="flex items-start justify-between gap-4">
                    {/* Exam Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {exam.title || 'Không có tiêu đề'}
                        </h3>
                        {exam.code && (
                          <span className="text-sm text-gray-500">({exam.code})</span>
                        )}
                        {getPublishedBadge(exam)}
                        {exam.examCategory === 'MOCK' && (
                          <Badge variant="primary" size="sm" className="bg-purple-100 text-purple-700">
                            🆓 FreeTest
                          </Badge>
                        )}
                        {exam.examCategory === 'PRACTICE' && (exam.classEntity || exam.classId) && (
                          <Badge variant="warning" size="sm" className="bg-orange-100 text-orange-700">
                            👥 Lớp học
                          </Badge>
                        )}
                        {exam.examCategory === 'PRACTICE' && !(exam.classEntity || exam.classId) && (
                          <Badge variant="success" size="sm" className="bg-green-100 text-green-700">
                            📚 Khóa học
                          </Badge>
                        )}
                        {exam.examType && getTypeBadge(exam.examType)}
                      </div>

                      {exam.description && (
                        <p className="text-gray-600 mb-3">{exam.description}</p>
                      )}

                      {/* Show feedback if rejected */}
                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {exam.examQuestions?.length || exam.totalQuestions || exam.questions?.length || 0} {t('exam.questions', 'câu hỏi')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {exam.durationMinutes || exam.duration || 0} {t('exam.minutes', 'phút')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {exam.course?.name && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{exam.course.name}</span>
                          </div>
                        )}
                        {exam.passingScore && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Đạt: {exam.passingScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => navigate(`/teacher/exam-detail/${exam.id}`)}
                        title={t('exam.viewDetail', 'Xem chi tiết')}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => navigate(`/teacher/exam-editor/${exam.id}`)}
                        title={isLocked(exam) ? 'Không thể chỉnh sửa (đã duyệt/xuất bản)' : t('exam.edit', 'Chỉnh sửa')}
                        disabled={isLocked(exam)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Copy className="w-4 h-4" />}
                        onClick={() => handleCopyLink(exam)}
                        title="Sao chép link gửi cho học viên"
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
