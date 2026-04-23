import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Edit,
  Clock,
  Users,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download
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

const ExamDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExamDetail();
  }, [id]);

  const fetchExamDetail = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getExam(id);
      setExam(data);
      setError('');
    } catch (err) {
      console.error('Error fetching exam detail:', err);
      setError(t('exam.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="p-12 text-center">
          <Loading.PageLoading />
        </div>
      </PageContainer>
    );
  }

  if (error || !exam) {
    return (
      <PageContainer>
        <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
          {error || t('teacher.examDetail.notFound')}
        </Alert>
      </PageContainer>
    );
  }

  // Get status badge
  const getStatusBadge = () => {
    if (exam.approvalStatus === 'PENDING') {
      return <Badge variant="warning">{t('exam.pending')}</Badge>;
    } else if (exam.approvalStatus === 'APPROVED') {
      if (exam.published) {
        return <Badge variant="success">{t('exam.published')}</Badge>;
      }
      return <Badge variant="info">{t('exam.approved')}</Badge>;
    } else if (exam.approvalStatus === 'REJECTED') {
      return <Badge variant="error">{t('exam.rejected')}</Badge>;
    }
    return exam.published ? (
      <Badge variant="success">{t('exam.published')}</Badge>
    ) : (
      <Badge variant="secondary">{t('teacher.examDetail.draft')}</Badge>
    );
  };

  // Get exam category badge
  const getCategoryBadge = () => {
    if (exam.examCategory === 'MOCK') {
      return <Badge variant="primary" className="bg-purple-100 text-purple-700">FreeTest</Badge>;
    }
    return <Badge variant="info">{t('teacher.examDetail.practice')}</Badge>;
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={exam.title || t('teacher.examDetail.noTitle')}
        subtitle={t('teacher.examDetail.subtitle', { category: exam.examCategory === 'MOCK' ? 'FreeTest' : t('teacher.examDetail.practice') })}
        breadcrumbs={[
          { label: t('nav.home'), href: '/' },
          { label: t('roles.TEACHER'), href: '/teacher' },
          { label: t('teacher.exams.title'), href: '/teacher/exam-management' },
          { label: exam.title || t('common.view') }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => navigate(`/teacher/exam-editor/${exam.id}`)}
            >
              {t('common.edit')}
            </Button>
          </div>
        }
      />

      {/* Show feedback if rejected */}
      {exam.approvalStatus === 'REJECTED' && exam.feedback && (
        <Alert variant="error" className="mb-6" icon={<AlertCircle className="w-4 h-4" />}>
          <div className="font-medium mb-1">{t('teacher.examDetail.managerFeedback')}</div>
          <div className="text-sm">{exam.feedback}</div>
        </Alert>
      )}

      {/* Exam Info Card */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
                {exam.code && (
                  <span className="text-lg text-gray-500">({exam.code})</span>
                )}
                {getStatusBadge()}
                {getCategoryBadge()}
              </div>

              {exam.description && (
                <p className="text-gray-600 mb-4">{exam.description}</p>
              )}

              {/* Exam Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">{t('teacher.examDetail.questionCount')}</div>
                    <div className="font-semibold text-gray-900">
                      {exam.examQuestions?.length || exam.totalQuestions || 0} {t('common.questions')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-500">{t('teacher.examDetail.duration')}</div>
                    <div className="font-semibold text-gray-900">
                      {exam.durationMinutes || exam.duration || 0} {t('common.minutes')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">{t('teacher.examDetail.passScore')}</div>
                    <div className="font-semibold text-gray-900">
                      {exam.passingScore || 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>{t('teacher.examDetail.maxPoints')}: <strong>{exam.totalPoints || 0}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{t('teacher.examDetail.createdAt')}: <strong>{new Date(exam.createdAt || exam.submittedAt).toLocaleDateString('vi-VN')}</strong></span>
            </div>
            {exam.course?.name && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>{t('teacher.examDetail.course')}: <strong>{exam.course.name}</strong></span>
              </div>
            )}
            {exam.createdBy?.fullName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{t('teacher.examDetail.createdBy')}: <strong>{exam.createdBy.fullName}</strong></span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Questions List */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {t('teacher.examDetail.questionList')} ({exam.examQuestions?.length || exam.totalQuestions || 0})
          </h2>

          {!exam.examQuestions || exam.examQuestions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t('teacher.examDetail.noQuestions')}
            </div>
          ) : (
            <div className="space-y-4">
              {exam.examQuestions.map((eq, index) => (
                <div
                  key={eq.id || index}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                          {eq.questionOrder || index + 1}
                        </span>
                        <Badge variant="secondary" size="sm">
                          {eq.points || 1} {t('teacher.examDetail.points')}
                        </Badge>
                        {eq.question?.topikType && (
                          <Badge variant="info" size="sm">
                            {eq.question.topikType}
                          </Badge>
                        )}
                      </div>

                      {eq.question && (
                        <>
                          <div
                            className="text-gray-900 font-medium mb-2 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: eq.question.questionText }}
                          />

                          {eq.question.imageUrl && (
                            <div className="mb-3">
                              <img
                                src={eq.question.imageUrl}
                                alt={t('teacher.examDetail.questionImage')}
                                className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                          )}

                          {eq.question.options && eq.question.options.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                              {eq.question.options.map((option, optIndex) => (
                                <div
                                  key={option.id || optIndex}
                                  className={`p-3 rounded-lg border ${
                                    option.isCorrect
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">
                                      {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    <span className="text-sm text-gray-900">
                                      {option.optionText}
                                    </span>
                                    {option.isCorrect && (
                                      <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {eq.question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-sm font-medium text-blue-900 mb-1">{t('teacher.examDetail.explanation')}:</div>
                              <div className="text-sm text-blue-800">{eq.question.explanation}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </PageContainer>
  );
};

export default ExamDetail;
