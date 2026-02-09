import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Settings
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

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exam, setExam] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    duration: 60,
    passingScore: 60,
    maxAttempts: 3,
    published: false,
    courseId: '',
    type: 'MIXED'
  });

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Fetch exam details
  useEffect(() => {
    fetchExamDetails();
  }, [id]);

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
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  // Preview question
  const handlePreviewQuestion = (question) => {
    setPreviewQuestion(question);
    setShowPreviewModal(true);
  };

  // Save exam
  const handleSave = async () => {
    setSaving(true);
    try {
      await teacherService.updateExam(id, {
        ...formData,
        questions: questions.filter(q => !q.isNew)
      });

      setSuccess(t('exam.saveSuccess', 'Đã lưu bài kiểm tra thành công!'));
      setError('');
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

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('exam.edit', 'Chỉnh Sửa Bài Kiểm Tra')}
        subtitle={exam?.code || ''}
        breadcrumbs={[
          { label: t('nav.home', 'Trang chủ'), href: '/' },
          { label: t('nav.teacher', 'Giáo viên'), href: '/teacher' },
          { label: t('exam.management', 'Quản Lý Bài Kiểm Tra'), href: '/exam-management' },
          { label: exam?.title || t('exam.edit', 'Chỉnh Sửa') }
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
                  className="w-full mb-4"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleAddQuestion}
                >
                  {t('exam.addQuestion', 'Thêm Câu Hỏi Mới')}
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
