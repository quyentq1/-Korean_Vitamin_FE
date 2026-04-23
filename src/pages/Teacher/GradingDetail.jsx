import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Save,
  FileText,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// UI Components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';

// Services
import teacherService from '../../services/teacherService';
import AIGradingAssistant from '../../components/AI/AIGradingAssistant';

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

  // Grading queue state
  const [gradingQueue, setGradingQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);

  // Fetch grading queue
  const fetchGradingQueue = async () => {
    try {
      const data = await teacherService.getPendingGrading();
      console.log('📦 Grading Queue Response:', data);
      setGradingQueue(data || []);

      // Find current attempt index
      const index = data?.findIndex(a => a.id?.toString() === attemptId);
      if (index !== undefined && index >= 0) {
        setCurrentQueueIndex(index);
      }
      console.log('✅ Grading queue loaded:', data?.length, 'items, current index:', index);
    } catch (err) {
      console.error('Failed to fetch grading queue:', err);
    }
  };

  // Fetch attempt details and grading queue
  useEffect(() => {
    fetchAttemptDetails();
    fetchGradingQueue();
  }, [attemptId]);

  const fetchAttemptDetails = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getGradingAnswers(attemptId);

      console.log('📦 Grading Detail API Response:', data);
      console.log('📦 Attempt:', data);
      console.log('📦 Answers:', data?.answers);

      if (data) {
        setAttempt(data);

        // Enrich answers with AI suggestions if missing
        const enrichedData = (data.answers || []).map(ans => {
          console.log('📦 Processing answer:', ans);
          return {
            ...ans,
            examQuestion: {
              id: ans.examQuestionId,
              type: ans.questionType,
              questionText: ans.questionText,
              points: ans.points
            },
            aiAnalysis: ans.aiAnalysis || null,
            score: ans.score !== undefined ? ans.score : null, // Fix: don't use || for 0
            feedback: ans.feedback || ''
          };
        });

        console.log('✅ Enriched answers:', enrichedData);
        setAnswers(enrichedData);
      }
      setError('');
    } catch (err) {
      console.error('Failed to load attempt details', err);
      setError(t('grading.fetchError', 'Lỗi khi tải chi tiết bài nộp.'));
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (answerId, field, value) => {
    console.log('📝 handleScoreChange:', { answerId, field, value, valueType: typeof value });
    setAnswers(prev => {
      const updated = prev.map(a =>
        a.id === answerId ? { ...a, [field]: value } : a
      );
      console.log('✅ Updated answer:', updated.find(a => a.id === answerId));
      console.log('✅ All answers scores:', updated.map(a => ({ id: a.id, score: a.score, scoreType: typeof a.score })));
      return updated;
    });
  };

  // Navigate to specific exam in queue
  const handleNavigateToExam = (examId) => {
    navigate(`/teacher/grading/${examId}`);
  };

  // Navigate to previous exam
  const handlePreviousExam = () => {
    if (currentQueueIndex > 0) {
      const prevExam = gradingQueue[currentQueueIndex - 1];
      navigate(`/teacher/grading/${prevExam.id}`);
    }
  };

  // Navigate to next exam
  const handleNextExam = () => {
    if (currentQueueIndex < gradingQueue.length - 1) {
      const nextExam = gradingQueue[currentQueueIndex + 1];
      navigate(`/teacher/grading/${nextExam.id}`);
    }
  };

  // Save grading
  const saveGrading = async () => {
    // Validation: Check if all questions have scores (0 is valid score)
    const ungradedQuestions = answers.filter(a => a.score === null || a.score === undefined);

    if (ungradedQuestions.length > 0) {
      // Show warning popup - DON'T save, just alert
      const count = ungradedQuestions.length;
      Swal.fire({
        title: t('grading.incompleteTitle', 'Chưa chấm xong tất cả câu hỏi'),
        html: t('grading.incompleteMessage', 'Bạn cần chấm thêm <strong>{{count}}</strong> câu hỏi nữa.<br/>Vui lòng chấm điểm tất cả các câu hỏi trước khi lưu!', { count }),
        icon: 'warning',
        confirmButtonText: t('grading.understood', 'Đã hiểu'),
        confirmButtonColor: '#f59e0b',
        customClass: {
          popup: 'swal2-popup'
        }
      });
      return; // Don't save
    }

    // All questions graded, proceed to save
    await performSave();
  };

  const performSave = async () => {
    setSaving(true);
    try {
      // DEBUG: Log all answers before filtering
      console.log('📊 All answers:', answers.map(a => ({
        id: a.id,
        examQuestionId: a.examQuestionId,
        score: a.score,
        scoreType: typeof a.score
      })));

      // Prepare grades for submission
      const gradesToSubmit = answers
        .filter(a => {
          const hasScore = a.score !== null && a.score !== undefined && !isNaN(a.score);
          console.log(`Filtering answer ${a.id}: score=${a.score}, hasScore=${hasScore}`);
          return hasScore;
        })
        .map(a => ({
          attemptId: Number(attemptId),
          examQuestionId: Number(a.examQuestionId),
          score: Number(a.score), // Ensure number type
          feedback: a.feedback || ''
        }));

      console.log('💾 Grades to submit:', gradesToSubmit);
      console.log('💾 Count:', gradesToSubmit.length, 'out of', answers.length);

      // Call API for each grade
      for (const grade of gradesToSubmit) {
        await teacherService.submitGrading(
          grade.attemptId,
          grade.examQuestionId,
          grade.score,
          grade.feedback
        );
        console.log('✅ Saved grade for question:', grade.examQuestionId);
      }

      // Show SweetAlert2 success toast
      Swal.fire({
        icon: 'success',
        title: t('grading.savedTitle', 'Chấm điểm thành công!'),
        text: t('grading.savedMessage', 'Đã chấm xong {{count}} câu hỏi và lưu điểm thành công!', { count: gradesToSubmit.length }),
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      }).then(() => {
        // Navigate back to dashboard after toast
        navigate('/teacher/grading-queue');
      });

      setError('');
    } catch (err) {
      console.error('Failed to save grading', err);

      const errorMsg = err.response?.data?.message || err.message || t('grading.saveError', 'Có lỗi xảy ra khi lưu điểm');

      setError(errorMsg);

      // Show error toast
      Swal.fire({
        icon: 'error',
        title: t('grading.saveFailedTitle', 'Lưu điểm thất bại'),
        text: t('grading.saveFailedMessage', 'Không thể lưu điểm. Vui lòng thử lại!'),
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Calculate scores
  const calculateTotalScore = () => {
    return answers.reduce((sum, a) => sum + (a.score || 0), 0);
  };

  const calculateMaxScore = () => {
    return answers.reduce((sum, a) => sum + (a.examQuestion?.points || 0), 0);
  };

  const getQuestionTypeBadge = (type) => {
    const badges = {
      'WRITING': { label: t('grading.type.writing', 'Viết'), variant: 'blue' },
      'SPEAKING': { label: t('grading.type.speaking', 'Nói'), variant: 'purple' },
      'READING': { label: t('grading.type.reading', 'Đọc'), variant: 'green' },
      'LISTENING': { label: t('grading.type.listening', 'Nghe'), variant: 'orange' }
    };
    return badges[type]?.label || type;
  };

  const currentAnswer = answers[currentAnswerIndex];

  // Calculate progress - count questions that have been scored (including 0)
  const gradedCount = answers.filter(a => a.score !== null && a.score !== undefined).length;
  const progressPercent = answers.length > 0 ? (gradedCount / answers.length) * 100 : 0;

  // Format date safely
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('vi-VN');
    } catch (e) {
      console.error('Date parse error:', e, 'dateStr:', dateStr);
      return '-';
    }
  };

  // Calculate time spent in minutes
  const getTimeSpent = () => {
    // First try direct field
    if (attempt?.timeSpent) {
      return attempt.timeSpent;
    }

    // Calculate from startTime and endTime
    if (attempt?.startTime && attempt?.endTime) {
      try {
        const start = new Date(attempt.startTime);
        const end = new Date(attempt.endTime);
        const diffMs = end.getTime() - start.getTime();
        return Math.floor(diffMs / 60000); // Convert to minutes
      } catch (e) {
        console.error('Time calculation error:', e);
        return 0;
      }
    }

    return 0;
  };

  // Helper function to map question type to task type for AI grading
  const getTaskTypeFromQuestionType = (questionType) => {
    const typeMapping = {
      'WRITING': 'WRITING_54',  // Long essay
      'SPEAKING': 'WRITING_54',  // Speaking also uses essay grading
      'READING': 'WRITING_52',    // Short explanation
      'LISTENING': 'WRITING_51',   // Fill in blank
      'MULTIPLE_CHOICE': 'WRITING_51'
    };
    return typeMapping[questionType] || 'WRITING_54';
  };

  // Helper function to handle applying AI score
  const handleApplyAIScore = (answerId, aiGradeData) => {
    try {
      const score = typeof aiGradeData === 'number' ? aiGradeData : (aiGradeData.totalScore || aiGradeData.score || 0);
      handleScoreChange(answerId, 'score', score);
      
      const feedback = aiGradeData.overallFeedback || aiGradeData.feedback;
      if (feedback) {
        handleScoreChange(answerId, 'feedback', feedback);
      }

      // Show success message
      Swal.fire({
        icon: 'success',
        title: t('grading.aiAppliedTitle', 'Đã áp dụng điểm AI'),
        text: t('grading.aiAppliedMessage', 'Điểm {{score}} và nhận xét đã được điền tự động. Nhớ bấm "Lưu điểm" sau khi hoàn tất.', { score }),
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error applying AI score:', error);
      Swal.fire({
        icon: 'error',
        title: t('grading.error', 'Lỗi'),
        text: t('grading.aiApplyError', 'Không thể áp dụng điểm AI. Vui lòng thử lại.'),
        confirmButtonText: 'OK'
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title={t('grading.title', 'Chấm Điểm Bài Làm')}
        subtitle={attempt?.examTitle || 'Loading...'}
        breadcrumbs={[
          { label: t('nav.teacher', 'Giáo Viên'), path: '/teacher' },
          { label: t('grading.gradingQueue', 'Hàng Đợi Chấm'), path: '/teacher/grading-queue' },
          { label: attempt?.studentName || '...' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/teacher/grading')}
            >
              {t('common.back', 'Quay Lại')}
            </Button>

            {/* Queue Navigation */}
            {gradingQueue.length > 0 && (
              <>
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousExam}
                  disabled={currentQueueIndex === 0}
                  title={t('grading.previousExam', 'Bài trước')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Exam Selector Dropdown */}
                <div className="relative">
                  <select
                    value={attemptId}
                    onChange={(e) => handleNavigateToExam(e.target.value)}
                    className="px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {gradingQueue.map((exam, index) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.exam?.title || t('grading.examNumber', 'Bài thi {{number}}', { number: index + 1 })} - {exam.student?.fullName || t('grading.noName', 'Không tên')} ({index + 1}/{gradingQueue.length})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Progress Badge */}
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <span className="font-semibold text-blue-700">
                    {currentQueueIndex + 1}/{gradingQueue.length}
                  </span>
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextExam}
                  disabled={currentQueueIndex === gradingQueue.length - 1}
                  title={t('grading.nextExam', 'Bài tiếp theo')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Alerts */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Compact Info Bar */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* Student Info */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{attempt?.studentName}</p>
                  <p className="text-sm text-gray-500">{attempt?.studentCode || 'N/A'}</p>
                </div>
              </div>

              <div className="h-10 w-px bg-gray-200"></div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(attempt?.submitTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeSpent()} {t('grading.minutes', 'phút')}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{calculateTotalScore() || 0}</p>
                <p className="text-xs text-gray-500">/ {calculateMaxScore() || 0} {t('grading.points', 'điểm')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{gradedCount}/{answers.length || 0}</p>
                <p className="text-xs text-gray-500">{t('grading.graded', 'Đã chấm')}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{t('grading.progress', 'Tiến độ chấm điểm')}</span>
              <span className="text-sm text-gray-600">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Grading Queue Table */}
      <Card className="mb-6">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="font-semibold text-gray-900">
            📋 {t('grading.queueList', 'Danh Sách Bài Thi Chờ Chấm')} ({gradingQueue.length})
          </h3>
        </div>

        {gradingQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-16 border-r border-gray-200">
                    {t('grading.index', 'STT')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    {t('grading.examName', 'Tên Bài Thi')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    {t('grading.student', 'Sinh Viên')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-28 border-r border-gray-200">
                    {t('grading.type', 'Loại')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-36 border-r border-gray-200">
                    {t('grading.submitTime', 'Thời Gian Nộp')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32 border-r border-gray-200">
                    {t('grading.status', 'Trạng Thái')}
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-28">
                    {t('grading.action', 'Thao Tác')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gradingQueue.map((item, index) => {
                  const isCurrent = item.id?.toString() === attemptId;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        isCurrent ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => handleNavigateToExam(item.id)}
                    >
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-semibold ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {item.exam?.title || t('grading.examNumber', 'Bài thi {{number}}', { number: index + 1 })}
                        </div>
                        {item.class?.name && (
                          <div className="text-xs text-gray-500 mt-1">{item.class.name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{item.student?.fullName || t('grading.noName', 'Không tên')}</div>
                        <div className="text-xs text-gray-500">{item.student?.studentCode || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            item.exam?.examCategory === 'WRITING' ? 'blue' :
                            item.exam?.examCategory === 'SPEAKING' ? 'purple' : 'indigo'
                          }
                          size="sm"
                        >
                          {item.exam?.examCategory || 'MIXED'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(item.submitTime || item.endTime)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            item.status === 'GRADED' ? 'success' :
                            item.status === 'PENDING_MANUAL_GRADE' ? 'warning' : 'default'
                          }
                          size="sm"
                        >
                          {item.status === 'GRADED' ? t('grading.graded', 'Đã chấm') :
                           item.status === 'PENDING_MANUAL_GRADE' ? t('grading.pending', 'Chờ chấm') :
                           item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant={isCurrent ? 'primary' : 'outline'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToExam(item.id);
                          }}
                        >
                          {isCurrent ? t('grading.current', 'Đang xem') : t('grading.view', 'Xem')}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>{t('grading.noQueue', 'Không có bài thi nào trong hàng đợi')}</p>
          </div>
        )}
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left - Questions List */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900 text-sm">
                {t('grading.questions', 'Câu Hỏi')} ({answers.length})
              </h3>
            </div>

            <div className="p-3 space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
              {answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    currentAnswerIndex === index
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                  }`}
                  onClick={() => setCurrentAnswerIndex(index)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-900 flex-shrink-0">
                        {index + 1}.
                      </span>
                      <span className="text-xs text-gray-600 truncate">
                        {answer.examQuestion?.questionText?.substring(0, 40)}...
                      </span>
                    </div>
                    {answer.score !== null ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant={answer.examQuestion?.type === 'WRITING' ? 'blue' : 'purple'}
                      size="sm"
                    >
                      {getQuestionTypeBadge(answer.examQuestion?.type)}
                    </Badge>
                    <span className="text-xs font-medium text-gray-700">
                      {(answer.score !== null && answer.score !== undefined) ? answer.score : '-'}/{answer.examQuestion?.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right - Content */}
        <div className="lg:col-span-3 space-y-4">
          {currentAnswer ? (
            <>
              {/* Question Card */}
              <Card>
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={currentAnswer.examQuestion?.type === 'WRITING' ? 'blue' : 'purple'}
                      >
                        {getQuestionTypeBadge(currentAnswer.examQuestion?.type)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {currentAnswer.examQuestion?.points} {t('grading.points', 'điểm')}
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-500 mb-1">{t('grading.question', 'Câu hỏi')}</p>
                    {currentAnswer.examQuestion?.questionText ? (
                      <div
                        className="text-gray-900 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: currentAnswer.examQuestion?.questionText || ''
                        }}
                      />
                    ) : (
                      <p className="text-gray-400 text-sm">{t('grading.noQuestion', 'Không có nội dung')}</p>
                    )}
                  </div>

                  {/* Student Answer */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700 mb-2 font-medium">{t('grading.studentAnswer', 'Bài làm')}</p>
                    {currentAnswer.answerText ? (
                      <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {currentAnswer.answerText}
                      </div>
                    ) : currentAnswer.answerFileUrl ? (
                      <div className="text-center py-4">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                        <p className="text-sm text-gray-500">{t('grading.fileAnswer', 'Đã nộp bài qua file')}</p>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{t('grading.noAnswer', 'Chưa có câu trả lời')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* AI Grading Assistant - Real AI Integration */}
              {currentAnswer && (
                <AIGradingAssistant
                  examAttempt={attempt}
                  writingQuestion={{
                    ...currentAnswer.examQuestion,
                    prompt: currentAnswer.examQuestion?.questionText,
                    taskType: getTaskTypeFromQuestionType(currentAnswer.examQuestion?.type),
                    maxScore: currentAnswer.examQuestion?.points || 10,
                    topikLevel: attempt?.exam?.topikLevel || 'TOPIK_II'
                  }}
                  onGradeReceived={(aiGradeData) => handleApplyAIScore(currentAnswer.id, aiGradeData)}
                />
              )}

              {/* AI Analysis (Mock) - Legacy (can be removed later) */}
              <Card>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{t('grading.aiSuggestion', 'Gợi ý chấm điểm')}</h4>
                        <p className="text-xs text-gray-500">{t('grading.aiSuggestionDesc', 'Tham khảo cho giáo viên')}</p>
                      </div>
                    </div>
                  </div>

                  {currentAnswer.aiAnalysis ? (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-bold text-purple-600">
                            {currentAnswer.aiAnalysis.score}
                          </span>
                          <span className="text-sm text-gray-600">/ {currentAnswer.examQuestion?.points}</span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleApplyAIScore(currentAnswer.id, currentAnswer.aiAnalysis)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          {t('grading.apply', 'Áp dụng')}
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">{t('grading.feedback', 'Nhận xét')}</p>
                          <p className="text-sm text-gray-600 bg-white rounded p-3">
                            {currentAnswer.aiAnalysis.feedback}
                          </p>
                        </div>

                        {currentAnswer.aiAnalysis.suggestions?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">{t('grading.suggestions', 'Gợi ý')}</p>
                            <ul className="space-y-1">
                              {currentAnswer.aiAnalysis.suggestions.map((s, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-purple-500 mt-1">•</span>
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <RefreshCw className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t('grading.noAIAnalysis', 'Chưa có phân tích AI')}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Grading Input */}
              <Card>
                <div className="p-5">
                  <h4 className="font-semibold text-gray-900 mb-4">{t('grading.grading', 'Chấm điểm')}</h4>

                  {/* Score Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('grading.score', 'Điểm số')}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max={currentAnswer.examQuestion?.points || 0}
                        step="0.5"
                        value={currentAnswer.score ?? ''}
                        onChange={(e) => {
                          const valStr = e.target.value;
                          console.log('📝 Score input changed (raw):', valStr, 'for answer:', currentAnswer.id);

                          const maxPoints = currentAnswer.examQuestion?.points || 0;

                          // Nếu rỗng, set null
                          if (valStr === '' || valStr === '-') {
                            handleScoreChange(currentAnswer.id, 'score', null);
                            return;
                          }

                          // Parse giá trị
                          const val = parseFloat(valStr);

                          // Validate: không cho nhập âm hoặc lớn hơn max
                          if (isNaN(val)) {
                            return; // Không update nếu không phải số
                          }

                          if (val < 0) {
                            handleScoreChange(currentAnswer.id, 'score', 0);
                            return;
                          }

                          if (val > maxPoints) {
                            // Không cho nhập quá max - tự động clamp về max
                            handleScoreChange(currentAnswer.id, 'score', maxPoints);
                            setError(t('grading.scoreMaxWarning', 'Điểm không được vượt quá {max}', { max: maxPoints }));
                            setTimeout(() => setError(''), 3000);
                            return;
                          }

                          // Giá trị hợp lệ
                          handleScoreChange(currentAnswer.id, 'score', val);
                        }}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                      />
                      <span className="text-gray-500">/ {currentAnswer.examQuestion?.points}</span>
                    </div>
                    {currentAnswer.score > (currentAnswer.examQuestion?.points || 0) && (
                      <p className="text-xs text-red-500 mt-1">
                        {t('grading.scoreWarning', '⚠️ Điểm vượt quá quy định! Tối đa: {max}', { max: currentAnswer.examQuestion?.points })}
                      </p>
                    )}
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('grading.teacherFeedback', 'Nhận xét của giáo viên')}
                    </label>
                    <textarea
                      rows="4"
                      value={currentAnswer.feedback || ''}
                      onChange={(e) => handleScoreChange(currentAnswer.id, 'feedback', e.target.value)}
                      placeholder={t('grading.feedbackPlaceholder', 'Nhập nhận xét chi tiết cho học viên...')}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <Card>
                <div className="p-5">
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      variant="secondary"
                      icon={<Download className="w-4 h-4" />}
                      onClick={() => console.log('Export')}
                    >
                      {t('grading.export', 'Xuất PDF')}
                    </Button>
                    <Button
                      variant="primary"
                      icon={<Save className="w-4 h-4" />}
                      onClick={() => saveGrading()}
                      loading={saving}
                    >
                      {saving ? t('grading.saving', 'Đang lưu...') : t('grading.save', 'Lưu điểm')}
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">{t('grading.selectQuestion', 'Chọn một câu hỏi để chấm điểm')}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );

};

export default GradingDetail;
