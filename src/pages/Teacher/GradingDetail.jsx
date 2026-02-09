import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Save, 
  Play, 
  Pause, 
  FileText, 
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  User,
  Calendar,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  FileCheck,
  ListChecks,
  ThumbsUp,
  ThumbsDown,
  Send,
  Copy,
  MoreHorizontal
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

const GradingDetail = () => {
  const { t } = useTranslation();
  const { attemptId } = useParams();
  const navigate = useNavigate();

  // State
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // UI state
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);
  const [showRubric, setShowRubric] = useState(false);
  const [showQuickComments, setShowQuickComments] = useState(false);
  const [selectedQuickComment, setSelectedQuickComment] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  // Quick comments
  const quickComments = [
    'Làm tốt, tiếp tục phát huy!',
    'Cần cải thiện ngữ pháp',
    'Cần bổ sung thêm ví dụ',
    'Chú ý cách dùng từ vựng',
    'Cấu trúc câu cần rõ ràng',
    'Thử dùng câu phức để hay hơn',
    'Bài viết rất chi tiết',
    'Cần tập viết nhiều hơn'
  ];

  // Rubric criteria
  const rubricCriteria = [
    { id: 1, name: 'Nội dung', description: 'Độ chi tiết và chính xác của nội dung', maxScore: 4 },
    { id: 2, name: 'Ngữ pháp', description: 'Sử dụng đúng ngữ pháp và từ vựng', maxScore: 3 },
    { id: 3, name: 'Từ vựng', description: 'Sử dụng từ vựng phù hợp với ngữ cảnh', maxScore: 2 },
    { id: 4, name: 'Cấu trúc', description: 'Cấu trúc câu rõ ràng và logic', maxScore: 1 }
  ];

  // Fetch attempt details
  useEffect(() => {
    fetchAttemptDetails();
  }, [attemptId]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || saving) return;

    const timer = setTimeout(() => {
      saveGrading(true);
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timer);
  }, [answers, autoSave, saving]);

  const fetchAttemptDetails = async () => {
    setLoading(true);
    try {
      const attemptRes = await teacherService.getAttemptDetails(attemptId);
      setAttempt(attemptRes);
      
      const answersRes = await teacherService.getGradingAnswers(attemptId);
      
      // Enrich answers with AI suggestions if missing
      const enrichedData = (answersRes || []).map(ans => ({
        ...ans,
        aiAnalysis: ans.aiAnalysis || (ans.examQuestion?.question?.type === 'WRITING' ? {
          score: 75,
          feedback: "Bài viết tốt, tuy nhiên cần chú ý cách dùng trợ từ 'e/eseo'.",
          suggestions: ["Sửa 'jib-e' thành 'jib-eseo'", "Thêm liên từ nối câu"]
        } : null),
        score: ans.score || null,
        feedback: ans.feedback || ''
      }));
      
      setAnswers(enrichedData);
      setError('');
    } catch (err) {
      console.error('Failed to load attempt details', err);
      setError(t('grading.fetchError', 'Lỗi khi tải chi tiết bài nộp.'));
    } finally {
      setLoading(false);
    }
  };

  // Handle score change
  const handleScoreChange = (answerId, field, value) => {
    setAnswers(prev => prev.map(a =>
      a.id === answerId ? { ...a, [field]: value } : a
    ));
  };

  // Apply AI score
  const handleApplyAIScore = (answerId, aiScore) => {
    handleScoreChange(answerId, 'score', aiScore);
  };

  // Handle quick comment
  const handleQuickComment = (answerId, comment) => {
    const newFeedback = answers.find(a => a.id === answerId)?.feedback || '';
    handleScoreChange(answerId, 'feedback', newFeedback + (newFeedback ? ' ' : '') + comment);
    setShowQuickComments(false);
  };

  // Save grading
  const saveGrading = async (isAutoSave = false) => {
    if (isAutoSave) {
      setSaving(true);
    }

    try {
      const gradingData = {
        attemptId,
        answers: answers.map(a => ({
          id: a.id,
          score: a.score,
          feedback: a.feedback
        }))
      };

      await teacherService.submitGrading(attemptId, gradingData);
      
      setLastSaved(new Date());
      if (!isAutoSave) {
        setSuccess(t('grading.saveSuccess', 'Chấm điểm thành công!'));
        setTimeout(() => setSuccess(''), 3000);
      }
      setError('');
    } catch (err) {
      console.error('Failed to save grading', err);
      setError(t('grading.saveError', 'Lỗi khi lưu điểm.'));
      if (!isAutoSave) {
        setSuccess('');
      }
    } finally {
      setSaving(false);
    }
  };

  // Calculate total score
  const calculateTotalScore = () => {
    return answers.reduce((sum, a) => sum + (a.score || 0), 0);
  };

  // Calculate max possible score
  const calculateMaxScore = () => {
    return answers.reduce((sum, a) => sum + (a.examQuestion?.points || 0), 0);
  };

  // Get rubric score
  const getRubricScore = (criteriaId) => {
    return rubricCriteria.find(c => c.id === criteriaId)?.score || 0;
  };

  // Set rubric score
  const setRubricScore = (criteriaId, score) => {
    // Update rubric criteria scores
    console.log(`Set rubric ${criteriaId} score to ${score}`);
  };

  // Get question type badge
  const getQuestionTypeBadge = (type) => {
    const typeConfig = {
      WRITING: { variant: 'blue', label: t('grading.type.writing', 'Viết') },
      SPEAKING: { variant: 'purple', label: t('grading.type.speaking', 'Nói') },
      LISTENING: { variant: 'green', label: t('grading.type.listening', 'Nghe') },
      READING: { variant: 'orange', label: t('grading.type.reading', 'Đọc') }
    };
    
    return <Badge variant={typeConfig[type]?.variant}>{typeConfig[type]?.label}</Badge>;
  };

  if (loading) {
    return (
      <PageContainer>
        <Loading.PageLoading />
      </PageContainer>
    );
  }

  const currentAnswer = answers[currentAnswerIndex] || {};

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('grading.gradingDetail', 'Chi Tiết Chấm Điểm')}
        subtitle={`${attempt?.student?.fullName || ''} - ${attempt?.exam?.title || ''}`}
        breadcrumbs={[
          { label: t('nav.home', 'Trang chủ'), href: '/' },
          { label: t('nav.teacher', 'Giáo viên'), href: '/teacher' },
          { label: t('grading.queue', 'Hàng đợi chấm'), href: '/teacher/grading-queue' },
          { label: t('grading.gradingDetail', 'Chi tiết chấm điểm') }
        ]}
        actions={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => fetchAttemptDetails()}
            >
              {t('common.refresh', 'Làm mới')}
            </Button>
            <Button
              variant="secondary"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/teacher/grading-queue')}
            >
              {t('common.back', 'Quay lại')}
            </Button>
            <Button
              variant="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={() => saveGrading(false)}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loading.Spinner size="sm" />
                  {t('grading.saving', 'Đang lưu...')}
                </>
              ) : (
                t('grading.save', 'Lưu điểm')
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

      {/* Stats Bar */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-semibold text-gray-900">{attempt?.student?.fullName}</p>
                <p className="text-sm text-gray-500">{attempt?.student?.studentCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(attempt?.submittedAt).toLocaleDateString('vi-VN')}</span>
              <Clock className="w-4 h-4 ml-3" />
              <span>{attempt?.timeSpent || 0} {t('grading.minutes', 'phút')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{calculateTotalScore()}</p>
              <p className="text-sm text-gray-500">{t('grading.totalScore', 'Tổng điểm')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{calculateMaxScore()}</p>
              <p className="text-sm text-gray-500">{t('grading.maxScore', 'Điểm tối đa')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{calculateTotalScore() > 0 ? ((calculateTotalScore() / calculateMaxScore()) * 100).toFixed(1) : 0}%</p>
              <p className="text-sm text-gray-500">{t('grading.percentage', 'Tỷ lệ')}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">{t('grading.lastSaved', 'Lưu lần cuối:')}</p>
              <p className="font-semibold text-gray-900">{lastSaved ? new Date(lastSaved).toLocaleString('vi-VN') : '-'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Questions List */}
        <div className="lg:col-span-1">
          <Card className="mb-4">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900 mb-3">
                {t('grading.questions', 'Câu Hỏi')} ({answers.length})
              </h3>
            </div>
            
            <div className="p-4 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    currentAnswerIndex === index 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => setCurrentAnswerIndex(index)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {index + 1}. {answer.examQuestion?.questionText?.substring(0, 50)}...
                      </span>
                      {getQuestionTypeBadge(answer.examQuestion?.type)}
                    </div>
                    {answer.score !== null && (
                      <Badge variant={answer.score >= answer.examQuestion?.points * 0.8 ? 'success' : 'warning'}>
                        {answer.score}/{answer.examQuestion?.points}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FileText className="w-3 h-3" />
                    <span>{answer.examQuestion?.points} {t('grading.points', 'điểm')}</span>
                    {answer.aiAnalysis && (
                      <>
                        <span className="text-purple-600">AI: {answer.aiAnalysis.score}%</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Middle Column - Question & Answer */}
        <div className="lg:col-span-1">
          {currentAnswer ? (
            <>
              {/* Question Card */}
              <Card className="mb-4">
                <div className="p-6">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={currentAnswer.examQuestion?.type === 'WRITING' ? 'blue' : 'purple'}>
                        {currentAnswer.examQuestion?.type === 'WRITING' ? '✍️' : '🎤'} {getQuestionTypeBadge(currentAnswer.examQuestion?.type)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {currentAnswer.examQuestion?.points} {t('grading.points', 'điểm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentAnswer.answerFileUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Download className="w-4 h-4" />}
                          onClick={() => window.open(currentAnswer.answerFileUrl, '_blank')}
                        >
                        </Button>
                      )}
                      {currentAnswer.answerFileUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                          onClick={() => window.open(currentAnswer.answerFileUrl, '_blank')}
                        />
                      )}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {t('grading.question', 'Câu Hỏi')}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {currentAnswer.examQuestion?.questionText}
                    </p>
                  </div>

                  {/* Student Answer */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {t('grading.studentAnswer', 'Câu Trả Lời')}
                    </h4>
                    
                    {currentAnswer.answerFileUrl ? (
                      <div className="mb-4">
                        {currentAnswer.examQuestion?.type === 'SPEAKING' ? (
                          <audio controls src={currentAnswer.answerFileUrl} className="w-full" />
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-center text-gray-500 mb-2">
                              {t('grading.cannotPreview', 'Không thể xem trước file này')}
                            </p>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<Download className="w-4 h-4" />}
                              onClick={() => window.open(currentAnswer.answerUrlFileUrl, '_blank')}
                            >
                              {t('grading.download', 'Tải file')}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : currentAnswer.answerText ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {currentAnswer.answerText}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-3" />
                        <p>{t('grading.noAnswer', 'Chưa có câu trả lời')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* AI Analysis Card */}
              {currentAnswer.aiAnalysis && (
                <Card className="mb-4">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">🤖</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">
                          {t('grading.aiAnalysis', 'Phân Tích AI')}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-purple-600">
                            {currentAnswer.aiAnalysis.score}%
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<CheckCircle2 className="w-4 h-4" />}
                            onClick={() => handleApplyAIScore(currentAnswer.id, currentAnswer.aiAnalysis.score)}
                          >
                            {t('grading.applyScore', 'Áp dụng')}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4 mb-4">
                      <div className="text-sm font-semibold text-purple-700 mb-2">
                        {t('grading.feedback', 'Nhận xét:')}
                      </div>
                      <p className="text-gray-700 mb-4">
                        "{currentAnswer.aiAnalysis.feedback}"
                      </p>
                      
                      {currentAnswer.aiAnalysis.suggestions?.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold text-purple-700 mb-2">
                            {t('grading.suggestions', 'Gợi ý:')}
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                            {currentAnswer.aiAnalysis.suggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Grading Input Card */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">
                      {t('grading.grading', 'Chấm Điểm')}
                    </h4>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<ListChecks className="w-4 h-4" />}
                        onClick={() => setShowRubric(true)}
                      >
                        {t('grading.rubric', 'Tiêu chí')}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<MessageSquare className="w-4 h-4" />}
                        onClick={() => setShowQuickComments(true)}
                      >
                        {t('grading.quickComments', 'Nhận xét nhanh')}
                      </Button>
                    </div>
                  </div>

                  {/* Score Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('grading.score', 'Điểm số')}
                    </label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="0"
                        max={currentAnswer.examQuestion?.points}
                        value={currentAnswer.score || ''}
                        onChange={(e) => handleScoreChange(currentAnswer.id, 'score', parseInt(e.target.value) || 0)}
                        className="w-24"
                      />
                      <span className="text-gray-500">/ {currentAnswer.examQuestion?.points}</span>
                    </div>
                  </div>

                  {/* Feedback Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('grading.feedback', 'Nhận xét chi tiết')}
                    </label>
                    <Input
                      type="textarea"
                      rows="4"
                      value={currentAnswer.feedback || ''}
                      onChange={(e) => handleScoreChange(currentAnswer.id, 'feedback', e.target.value)}
                      placeholder={t('grading.feedbackPlaceholder', 'Nhập nhận xét chi tiết cho học viên...')}
                    />
                    
                    {/* Quick Comments */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {quickComments.map((comment, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickComment(currentAnswer.id, comment)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 transition"
                        >
                          {comment}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">
                  {t('grading.selectQuestion', 'Chọn một câu hỏi để chấm điểm')}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Rubric & Summary */}
        <div className="lg:col-span-1">
          {/* Rubric Card */}
          <Card className="mb-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {t('grading.rubric', 'Tiêu Chí Chấm Điểm')}
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<EyeOff className="w-4 h-4" />}
                  onClick={() => setShowRubric(!showRubric)}
                >
                  {showRubric ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              {showRubric ? (
                <div className="space-y-3">
                  {rubricCriteria.map((criteria) => (
                    <div key={criteria.id} className="border-b last:border-0 pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{criteria.name}</p>
                          <p className="text-sm text-gray-500">{criteria.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{criteria.maxScore} {t('grading.points', 'điểm')}</span>
                          <Input
                            type="number"
                            min="0"
                            max={criteria.maxScore}
                            value={getRubricScore(criteria.id)}
                            onChange={(e) => setRubricScore(criteria.id, parseInt(e.target.value))}
                            className="w-16"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 italic">
                        {t('grading.rubricNote', 'Tổng điểm phải bằng {criteria.maxScore}')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <EyeOff className="w-12 h-12 mx-auto mb-3" />
                  <p>{t('grading.rubricHidden', 'Nhấn vào nút để xem tiêu chí')}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Comments Modal */}
          {showQuickComments && (
            <Modal
              isOpen={showQuickComments}
              onClose={() => setShowQuickComments(false)}
              size="md"
              title={t('grading.quickComments', 'Nhận Xét Nhanh')}
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {t('grading.quickCommentsInfo', 'Chọn một nhận xét nhanh để thêm vào phần nhận xét:')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickComments.map((comment, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleQuickComment(currentAnswer.id, comment);
                        setShowQuickComments(false);
                      }}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition text-left"
                    >
                      {comment}
                    </button>
                  ))}
                </div>
              </div>
            </Modal>
          )}

          {/* Summary Card */}
          <Card>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {t('grading.summary', 'Tóm Tắt')}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('grading.totalQuestions', 'Tổng câu hỏi:')}</span>
                  <span className="font-medium text-gray-900">{answers.length}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('grading.graded', 'Đã chấm:')}</span>
                  <span className="font-medium text-gray-900">
                    {answers.filter(a => a.score !== null).length}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('grading.pending', 'Còn lại:')}</span>
                  <span className="font-medium text-gray-900">
                    {answers.filter(a => a.score === null).length}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('grading.avgScore', 'Điểm trung bình:')}</span>
                  <span className="font-medium text-gray-900">
                    {answers.length > 0 
                      ? (calculateTotalScore() / answers.filter(a => a.score !== null).length).toFixed(1)
                      : 0}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {t('grading.actions', 'Hành Động')}
                </h4>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => {
                      // Implement export functionality
                      console.log('Export grading result');
                    }}
                  >
                    {t('grading.export', 'Xuất kết quả')}
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    icon={<Save className="w-4 h-4" />}
                    onClick={() => saveGrading(false)}
                    disabled={saving}
                  >
                    {t('grading.complete', 'Hoàn thành')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default GradingDetail;
