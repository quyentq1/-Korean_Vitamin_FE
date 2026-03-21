import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Users,
  Settings,
  BookOpen,
  Search
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
import Section from '../../components/ui/Section';

// Services
import teacherService from '../../services/teacherService';

const ExamEditor = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exam, setExam] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [courses, setCourses] = useState([]);

  // Get courseId from URL query parameter (when coming from MyCourses page)
  const courseIdFromUrl = searchParams.get('courseId');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    duration: 60,
    passingScore: 60,
    maxAttempts: 3,
    published: false,
    courseId: courseIdFromUrl || '', // Pre-fill if coming from MyCourses
    type: 'MIXED'
  });

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Question Bank Modal
  const [showQuestionBankModal, setShowQuestionBankModal] = useState(false);
  const [selectedQuestionsFromBank, setSelectedQuestionsFromBank] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch exam details (only in edit mode)
  useEffect(() => {
    if (id && id !== 'create') {
      fetchExamDetails();
    } else {
      // Create mode - load courses and set loading to false
      fetchCourses();
      setLoading(false);
    }
  }, [id]);

  // Fetch assigned courses
  const fetchCourses = async () => {
    try {
      const data = await teacherService.getAssignedCourses();
      setCourses(data || []);

      // If coming from MyCourses with courseId, find and store course info
      if (courseIdFromUrl) {
        const selectedCourse = data.find(c => c.id === parseInt(courseIdFromUrl));
        if (selectedCourse) {
          setSelectedCourseInfo(selectedCourse);
        }
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  // Store selected course info when coming from MyCourses
  const [selectedCourseInfo, setSelectedCourseInfo] = useState(null);

  const fetchExamDetails = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getExam(id);
      setExam(response);

      // Set form data
      setFormData({
        title: response.title || '',
        code: response.code || '',
        description: response.description || '',
        duration: response.duration || 60,
        passingScore: response.passingScore || 60,
        maxAttempts: response.maxAttempts || 3,
        published: response.published || false,
        courseId: response.courseId || '',
        type: response.type || 'MIXED'
      });

      // Set questions
      setQuestions(response.questions || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError(t('exam.fetchError', 'Lỗi khi tải thông tin bài kiểm tra.'));
    } finally {
      setLoading(false);
    }
  };

  // Handle form change
  const handleFormChange = async (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Load questions when course is selected
    if (field === 'courseId' && value) {
      const selectedCourse = courses.find(c => c.id === parseInt(value));
      if (selectedCourse) {
        setSelectedCourseInfo(selectedCourse);
        await loadQuestionsForCourse(selectedCourse);
      }
    }
  };

  // Load questions by course level
  const loadQuestionsForCourse = async (course) => {
    try {
      const questions = await teacherService.getQuestionsByCourseLevel(course.level);
      setAvailableQuestions(questions || []);
    } catch (err) {
      console.error('Failed to load questions for course:', err);
      setAvailableQuestions([]);
    }
  };

  // Store available questions for selected course
  const [availableQuestions, setAvailableQuestions] = useState([]);

  // Handle question change
  const handleQuestionChange = (index, field, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Add question
  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      category: 'N1',
      type: 'MULTIPLE_CHOICE',
      content: '',
      answers: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'MEDIUM',
      points: 1,
      isNew: true
    };
    setQuestions(prev => [...prev, newQuestion]);
    setActiveTab('questions');
  };

  // Delete question
  const handleDeleteQuestion = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  const confirmDeleteQuestion = () => {
    setQuestions(prev => prev.filter(q => q.id !== questionToDelete.id));
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  };

  // Open Question Bank Modal
  const handleOpenQuestionBank = () => {
    if (!selectedCourseInfo) {
      setError(t('exam.selectCourseFirst', 'Vui lòng chọn khóa học trước.'));
      return;
    }
    setSelectedQuestionsFromBank([]);
    setSearchTerm('');
    setShowQuestionBankModal(true);
  };

  // Toggle question selection from bank
  const handleToggleQuestionFromBank = (question) => {
    setSelectedQuestionsFromBank(prev => {
      const exists = prev.find(q => q.id === question.id);
      if (exists) {
        return prev.filter(q => q.id !== question.id);
      } else {
        return [...prev, question];
      }
    });
  };

  // Add selected questions from bank to exam
  const handleAddQuestionsFromBank = () => {
    const newQuestions = selectedQuestionsFromBank.map(q => ({
      id: q.id,
      category: q.category?.name || 'N1',
      type: q.questionType,
      content: q.questionText || q.content,
      answers: q.options || [],
      correctAnswer: null,
      level: q.level,
      points: q.points || 1,
      isNew: false
    }));

    setQuestions(prev => [...prev, ...newQuestions]);
    setShowQuestionBankModal(false);
    setSelectedQuestionsFromBank([]);
    setActiveTab('questions');
  };

  // Preview question
  const handlePreviewQuestion = (question) => {
    setPreviewQuestion(question);
    setShowPreviewModal(true);
  };

  // Save exam
  const handleSave = async () => {
    setSaving(true);
    try {
      const isCreateMode = !id || id === 'create';

      if (isCreateMode) {
        // Validate required fields
        if (!formData.courseId) {
          setError(t('exam.courseRequired', 'Vui lòng chọn khóa học.'));
          setSaving(false);
          return;
        }

        // Create new exam - backend expects { exam: {...}, questions: [...] }
        const requestData = {
          exam: {
            ...formData,
            courseId: parseInt(formData.courseId) // Convert to number
          },
          questions: questions.filter(q => !q.isNew)
        };

        const response = await teacherService.createExam(requestData);
        setSuccess(t('exam.createSuccess', 'Đã tạo bài kiểm tra thành công! Đang chờ Education Manager duyệt.'));
        setError('');
        // Navigate to edit mode after creation
        setTimeout(() => {
          navigate(`/exam-editor/${response.id}`);
        }, 1500);
      } else {
        // Update existing exam
        await teacherService.updateExam(id, {
          ...formData,
          questions: questions.filter(q => !q.isNew)
        });
        setSuccess(t('exam.saveSuccess', 'Đã lưu bài kiểm tra thành công!'));
        setError('');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || t('exam.saveError', 'Lỗi khi lưu bài kiểm tra.'));
      setSuccess('');
    } finally {
      setSaving(false);
    }
  };

  // Get question type badge
  const getQuestionTypeBadge = (type) => {
    const typeConfig = {
      MULTIPLE_CHOICE: { variant: 'success', label: t('exam.type.multipleChoice', 'Trắc nghiệm') },
      WRITING: { variant: 'info', label: t('exam.type.writing', 'Viết') },
      LISTENING: { variant: 'warning', label: t('exam.type.listening', 'Nghe') },
      READING: { variant: 'purple', label: t('exam.type.reading', 'Đọc hiểu') },
      MIXED: { variant: 'primary', label: t('exam.type.mixed', 'Hỗn hợp') }
    };
    
    const config = typeConfig[type] || typeConfig.MIXED;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      EASY: { variant: 'success', label: t('exam.difficulty.easy', 'Dễ') },
      MEDIUM: { variant: 'warning', label: t('exam.difficulty.medium', 'Trung bình') },
      HARD: { variant: 'error', label: t('exam.difficulty.hard', 'Khó') }
    };
    
    const config = difficultyConfig[difficulty] || difficultyConfig.MEDIUM;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <PageContainer>
        <Loading.PageLoading />
      </PageContainer>
    );
  }

  const isCreateMode = !id || id === 'create';

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={isCreateMode ? t('exam.create', 'Tạo Bài Kiểm Tra Mới') : t('exam.edit', 'Chỉnh Sửa Bài Kiểm Tra')}
        subtitle={exam?.code || t('exam.createSubtitle', 'Tạo bài kiểm tra mới cho khóa học')}
        breadcrumbs={[
          { label: t('nav.home', 'Trang chủ'), href: '/' },
          { label: t('nav.teacher', 'Giáo viên'), href: '/teacher' },
          { label: t('exam.management', 'Quản Lý Bài Kiểm Tra'), href: '/exam-management' },
          { label: isCreateMode ? t('exam.create', 'Tạo Mới') : (exam?.title || t('exam.edit', 'Chỉnh Sửa')) }
        ]}
        actions={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/exam-management')}
            >
              {t('common.back', 'Quay lại')}
            </Button>
            <Button
              variant="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loading.Spinner size="sm" />
                  {t('exam.saving', 'Đang lưu...')}
                </>
              ) : (
                t('exam.save', 'Lưu')
              )}
            </Button>
          </div>
        }
      />

      {/* Success Alert */}
      {success && (
        <Alert
          variant="success"
          icon={<CheckCircle2 className="w-5 h-5" />}
          className="mb-6"
          dismissible
          onDismiss={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Exam Details */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  className={`flex-1 py-4 px-6 font-medium text-sm transition-colors ${
                    activeTab === 'details'
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Settings className="w-5 h-5" />
                    {t('exam.details', 'Thông Tin')}
                  </div>
                </button>
                <button
                  className={`flex-1 py-4 px-6 font-medium text-sm transition-colors ${
                    activeTab === 'questions'
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('questions')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" />
                    {t('exam.questions', 'Câu Hỏi')} ({questions.length})
                  </div>
                </button>
              </div>
            </div>

            {/* Details Tab Content */}
            {activeTab === 'details' && (
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('exam.title', 'Tiêu đề')} *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder={t('exam.titlePlaceholder', 'Nhập tiêu đề bài kiểm tra...')}
                  />
                </div>

                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('exam.code', 'Mã bài kiểm tra')} *
                  </label>
                  <Input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleFormChange('code', e.target.value)}
                    placeholder={t('exam.codePlaceholder', 'VD: EXAM-001')}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('exam.description', 'Mô tả')}
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder={t('exam.descriptionPlaceholder', 'Nhập mô tả bài kiểm tra...')}
                  />
                </div>

                {/* Course Selection (Required for create mode) */}
                {isCreateMode && !selectedCourseInfo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('exam.course', 'Khóa học')} *
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      value={formData.courseId}
                      onChange={(e) => handleFormChange('courseId', e.target.value)}
                      required
                    >
                      <option value="">{t('exam.selectCourse', '-- Chọn khóa học --')}</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name} ({course.code})
                        </option>
                      ))}
                    </select>
                    {courses.length === 0 && (
                      <p className="mt-1 text-sm text-amber-600">
                        {t('exam.noCoursesAssigned', 'Bạn chưa được assigned vào khóa học nào.')}
                      </p>
                    )}
                  </div>
                )}

                {/* Selected Course Display (when coming from MyCourses) */}
                {isCreateMode && selectedCourseInfo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('exam.course', 'Khóa học')}
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                      <div className="font-medium">{selectedCourseInfo.name}</div>
                      <div className="text-sm text-gray-500">{selectedCourseInfo.code}</div>
                    </div>
                    <input type="hidden" name="courseId" value={formData.courseId} />
                  </div>
                )}

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('exam.type', 'Loại bài kiểm tra')}
                  </label>
                  <Input
                    type="select"
                    value={formData.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    options={[
                      { value: 'MULTIPLE_CHOICE', label: t('exam.type.multipleChoice', 'Trắc nghiệm') },
                      { value: 'WRITING', label: t('exam.type.writing', 'Viết') },
                      { value: 'LISTENING', label: t('exam.type.listening', 'Nghe') },
                      { value: 'READING', label: t('exam.type.reading', 'Đọc hiểu') },
                      { value: 'MIXED', label: t('exam.type.mixed', 'Hỗn hợp') }
                    ]}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('exam.duration', 'Thời gian (phút)')}
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
                    min={1}
                    max={300}
                  />
                </div>

                {/* Passing Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('exam.passingScore', 'Điểm đạt (%)')}
                  </label>
                  <Input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => handleFormChange('passingScore', parseInt(e.target.value))}
                    min={0}
                    max={100}
                  />
                </div>

                {/* Max Attempts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('exam.maxAttempts', 'Số lần thi tối đa')}
                  </label>
                  <Input
                    type="number"
                    value={formData.maxAttempts}
                    onChange={(e) => handleFormChange('maxAttempts', parseInt(e.target.value))}
                    min={1}
                    max={10}
                  />
                </div>

                {/* Published */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{t('exam.published', 'Đăng bài kiểm tra')}</p>
                    <p className="text-sm text-gray-500">{t('exam.publishedInfo', 'Cho phép sinh viên tham gia')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.published}
                      onChange={(e) => handleFormChange('published', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:after:border-t-2 peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Questions Tab Content */}
            {activeTab === 'questions' && (
              <div className="p-6">
                <Button
                  variant="primary"
                  className="w-full mb-3"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleAddQuestion}
                >
                  {t('exam.addQuestion', 'Thêm Câu Hỏi Mới')}
                </Button>

                <Button
                  variant="secondary"
                  className="w-full mb-4"
                  icon={<BookOpen className="w-4 h-4" />}
                  onClick={handleOpenQuestionBank}
                  disabled={!selectedCourseInfo}
                >
                  {t('exam.selectFromQuestionBank', 'Chọn từ Ngân Hàng Câu Hỏi')}
                  {!selectedCourseInfo && ` (${t('exam.selectCourseFirst', 'Chọn khóa học trước')})`}
                </Button>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        question.isNew
                          ? 'border-primary-200 bg-primary-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            {getQuestionTypeBadge(question.type)}
                            {getDifficultyBadge(question.difficulty)}
                          </div>
                          <p className="text-sm text-gray-900">{question.content}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => handlePreviewQuestion(question)}
                            title={t('exam.preview', 'Xem trước')}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={() => navigate(`/teacher/questions/${question.id}/edit`)}
                            title={t('exam.edit', 'Chỉnh sửa')}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleDeleteQuestion(question)}
                            title={t('exam.delete', 'Xóa')}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Exam Stats */}
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                {t('exam.stats', 'Thống Kê')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{questions.length}</p>
                  <p className="text-sm text-blue-700">{t('exam.totalQuestions', 'Tổng câu hỏi')}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{formData.duration}</p>
                  <p className="text-sm text-green-700">{t('exam.duration', 'Phút')}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{formData.passingScore}%</p>
                  <p className="text-sm text-purple-700">{t('exam.passingScore', 'Điểm đạt')}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-600">{formData.maxAttempts}</p>
                  <p className="text-sm text-orange-700">{t('exam.maxAttempts', 'Lần thi')}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {t('exam.preview', 'Xem Trước')}
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">{formData.title}</h4>
                <p className="text-sm text-gray-500 mb-4">{formData.code}</p>
                
                <Section title={t('exam.examInfo', 'Thông Tin Bài Kiểm Tra')}>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('exam.type', 'Loại')}</span>
                      <span className="font-medium">{getQuestionTypeBadge(formData.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('exam.duration', 'Thời gian')}</span>
                      <span className="font-medium">{formData.duration} {t('exam.minutes', 'phút')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('exam.passingScore', 'Điểm đạt')}</span>
                      <span className="font-medium">{formData.passingScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('exam.maxAttempts', 'Số lần thi')}</span>
                      <span className="font-medium">{formData.maxAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('exam.published', 'Trạng thái')}</span>
                      <span className="font-medium">
                        {formData.published ? (
                          <Badge variant="success">{t('exam.published', 'Đã đăng')}</Badge>
                        ) : (
                          <Badge variant="warning">{t('exam.unpublished', 'Chưa đăng')}</Badge>
                        )}
                      </span>
                    </div>
                  </div>
                </Section>

                {formData.description && (
                  <Section title={t('exam.description', 'Mô tả')}>
                    <p className="text-sm text-gray-700">{formData.description}</p>
                  </Section>
                )}

                <Section title={t('exam.questions', 'Câu Hỏi')}>
                  <div className="space-y-3">
                    {questions.slice(0, 5).map((question, index) => (
                      <div key={question.id} className="p-3 bg-white rounded border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          {getQuestionTypeBadge(question.type)}
                          {getDifficultyBadge(question.difficulty)}
                        </div>
                        <p className="text-sm text-gray-900">{question.content}</p>
                      </div>
                    ))}
                    {questions.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        {t('exam.moreQuestions', '... và {{count}} câu hỏi khác', { count: questions.length - 5 })}
                      </p>
                    )}
                  </div>
                </Section>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Question Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setQuestionToDelete(null);
        }}
        size="md"
        title={t('exam.deleteQuestionConfirmTitle', 'Xác Nhận Xóa Câu Hỏi')}
      >
        <div className="space-y-4">
          <Alert variant="warning">
            {t('exam.deleteQuestionWarning', 'Bạn có chắc chắn muốn xóa câu hỏi này?')}
          </Alert>

          {questionToDelete && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{questionToDelete.content}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowDeleteModal(false);
                setQuestionToDelete(null);
              }}
            >
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={confirmDeleteQuestion}
            >
              {t('exam.confirmDelete', 'Xóa')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Question Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewQuestion(null);
        }}
        size="lg"
        title={t('exam.questionPreview', 'Xem Trước Câu Hỏi')}
      >
        {previewQuestion && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getQuestionTypeBadge(previewQuestion.type)}
                {getDifficultyBadge(previewQuestion.difficulty)}
              </div>
              <p className="text-gray-900">{previewQuestion.content}</p>
            </div>

            {previewQuestion.answers && previewQuestion.answers.length > 0 && (
              <div className="space-y-2">
                {previewQuestion.answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      index === previewQuestion.correctAnswer
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-gray-900">{answer}</span>
                      {index === previewQuestion.correctAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Question Bank Modal */}
      {showQuestionBankModal && (
        <Modal
          isOpen={showQuestionBankModal}
          onClose={() => setShowQuestionBankModal(false)}
          title={t('exam.questionBank', 'Ngân Hàng Câu Hỏi')}
          size="xl"
        >
          <div className="space-y-4">
            {/* Course Info */}
            {selectedCourseInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {selectedCourseInfo.name} ({selectedCourseInfo.level})
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  {t('exam.showingQuestionsForLevel', 'Đang hiển thị câu hỏi phù hợp với trình độ này')}
                </p>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('exam.searchQuestions', 'Tìm kiếm câu hỏi...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Questions List */}
            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {availableQuestions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>{t('exam.noQuestionsAvailable', 'Không có câu hỏi nào phù hợp.')}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {availableQuestions
                    .filter(q =>
                      !searchTerm ||
                      (q.questionText || q.content || '').toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(question => {
                      const isSelected = selectedQuestionsFromBank.find(q => q.id === question.id);
                      const isAlreadyAdded = questions.find(q => q.id === question.id);

                      return (
                        <div
                          key={question.id}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-primary-50' : ''
                          } ${isAlreadyAdded ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected || false}
                              onChange={() => handleToggleQuestionFromBank(question)}
                              disabled={isAlreadyAdded}
                              className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="info" size="sm">
                                  {question.categoryName || question.category?.name || 'N/A'}
                                </Badge>
                                <Badge variant="warning" size="sm">
                                  {question.level?.replace('LEVEL_', 'Level ') || 'N/A'}
                                </Badge>
                                {isAlreadyAdded && (
                                  <span className="text-xs text-gray-500">
                                    {t('exam.alreadyAdded', 'Đã thêm')}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-900">
                                {question.questionText || question.content || 'No content'}
                              </p>
                              {question.options && question.options.length > 0 && (
                                <div className="mt-2 text-xs text-gray-500">
                                  {question.options.length} {t('exam.answers', 'đáp án')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Selected Count */}
            {selectedQuestionsFromBank.length > 0 && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                <p className="text-sm text-primary-900">
                  {t('exam.selectedCount', 'Đã chọn {{count}} câu hỏi', {
                    count: selectedQuestionsFromBank.length
                  })}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowQuestionBankModal(false)}
              >
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button
                variant="primary"
                onClick={handleAddQuestionsFromBank}
                disabled={selectedQuestionsFromBank.length === 0}
              >
                {t('exam.addSelected', 'Thêm {{count}} câu hỏi', {
                  count: selectedQuestionsFromBank.length
                })}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Loading Overlay */}
      {saving && (
        <Loading.Overlay
          message={t('exam.saving', 'Đang lưu bài kiểm tra...')}
        />
      )}
    </PageContainer>
  );
};

export default ExamEditor;
