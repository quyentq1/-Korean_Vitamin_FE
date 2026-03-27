import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  FileText,
  BookOpen,
  Play,
  CheckCircle2,
  Lock,
  TrendingUp,
  Calendar,
  Award,
  Filter,
  Users
} from 'lucide-react';
import examService from '../../services/examService';
import { useAuth } from '../../contexts/AuthContext';

/**
 * StudentExamList - Danh sách bài luyện tập trong khóa học
 * Chỉ hiển thị PRACTICE exams cho học viên đã đăng ký khóa học
 */
const StudentExamList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();

  const [courseExams, setCourseExams] = useState([]);  // Course-level exams (all students)
  const [classExams, setClassExams] = useState([]);    // Class-specific exams
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseInfo, setCourseInfo] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, available, completed, locked
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    locked: 0
  });

  useEffect(() => {
    if (courseId) {
      fetchPracticeExams();
    }
  }, [courseId]);

  const fetchPracticeExams = async () => {
    setLoading(true);
    try {
      // Fetch both course-level and class-level exams
      const response = await examService.getAvailableExamsForStudent(courseId);

      const courseLevelExams = response.courseExams || [];
      const classLevelExams = response.classExams || [];

      // Process course-level exams
      const courseExamsWithStatus = await processExamList(courseLevelExams);

      // Process class-level exams
      const classExamsWithStatus = await processExamList(classLevelExams);

      setCourseExams(courseExamsWithStatus);
      setClassExams(classExamsWithStatus);

      // Calculate combined stats
      const allExams = [...courseExamsWithStatus, ...classExamsWithStatus];
      const stats = {
        total: allExams.length,
        completed: allExams.filter(e => e.status === 'completed').length,
        inProgress: allExams.filter(e => e.status === 'in_progress').length,
        locked: allExams.filter(e => e.status === 'locked').length
      };
      setStats(stats);

      // Get course info if available
      if (practiceExams.length > 0 && practiceExams[0].course) {
        setCourseInfo(practiceExams[0].course);
      }

      setError('');
    } catch (err) {
      console.error('Failed to fetch practice exams:', err);
      setError(t('exam.fetchError', 'Không thể tải danh sách bài luyện tập.'));
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (exam, attempts) => {
    const completedAttempts = attempts.filter(a => a.completedAt);

    // REMOVED: maxAttempts limit - practice exams have unlimited attempts
    if (completedAttempts.length > 0) {
      return 'in_progress';
    } else {
      return 'available';
    }
  };

  const canStartExam = (exam, attempts) => {
    // REMOVED: maxAttempts limit - practice exams have unlimited attempts
    return true;
  };

  const handleStartExam = (exam) => {
    if (!exam.canStart) {
      return;
    }
    navigate(`/exam/${exam.id}/intro`);
  };

  const getFilteredExams = () => {
    if (filterStatus === 'all') return exams;
    return exams.filter(exam => exam.status === filterStatus);
  };

  const getExamTypeBadge = (type) => {
    const config = {
      'MULTIPLE_CHOICE': { label: 'Trắc nghiệm', color: 'bg-blue-100 text-blue-700' },
      'WRITING': { label: 'Viết', color: 'bg-green-100 text-green-700' },
      'LISTENING': { label: 'Nghe', color: 'bg-purple-100 text-purple-700' },
      'READING': { label: 'Đọc hiểu', color: 'bg-orange-100 text-orange-700' },
      'SPEAKING': { label: 'Nói', color: 'bg-pink-100 text-pink-700' },
      'MIXED': { label: 'Hỗn hợp', color: 'bg-indigo-100 text-indigo-700' }
    };
    return config[type] || config.MIXED;
  };

  // Helper function to process exam list and add status
  const processExamList = async (exams) => {
    const examsWithStatus = await Promise.all(
      exams.map(async (exam) => {
        try {
          // Get attempts for this exam (if available)
          const attempts = await examService.getExamAttempts(exam.id);
          const completedAttempts = attempts.filter(a => a.completedAt);

          return {
            ...exam,
            attempts: attempts || [],
            completedAttempts: completedAttempts.length,
            bestScore: completedAttempts.length > 0
              ? Math.max(...completedAttempts.map(a => a.totalScore || 0))
              : null,
            status: getExamStatus(exam, attempts || []),
            canStart: canStartExam(exam, attempts || [])
          };
        } catch (err) {
          // If getting attempts fails, still show the exam
          return {
            ...exam,
            attempts: [],
            completedAttempts: 0,
            bestScore: null,
            status: 'available',
            canStart: true
          };
        }
      })
    );

    return examsWithStatus;
  };

  const getStatusBadge = (status) => {
    const config = {
      'available': { label: 'Có thể làm', color: 'bg-green-100 text-green-700', icon: <Play className="w-3 h-3" /> },
      'in_progress': { label: 'Đang làm', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
      'completed': { label: 'Hoàn thành', color: 'bg-gray-100 text-gray-700', icon: <CheckCircle2 className="w-3 h-3" /> },
      'locked': { label: 'Đã khóa', color: 'bg-red-100 text-red-700', icon: <Lock className="w-3 h-3" /> }
    };
    return config[status] || config.available;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredExams = getFilteredExams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Khóa học</span>
            <span>/</span>
            <span className="font-medium">{courseInfo?.name || 'Bài luyện tập'}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bài Luyện Tập</h1>
          <p className="text-gray-600">
            Làm các bài luyện tập để cải thiện kỹ năng của bạn. Bài kiểm tra chỉ hiển thị khi bạn đã đăng ký khóa học.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Tổng bài</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-xs text-gray-500">Hoàn thành</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                <p className="text-xs text-gray-500">Đang làm</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">Tiến độ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Lọc:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus('available')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'available'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Có thể làm
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'in_progress'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đang làm ({stats.inProgress})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hoàn thành ({stats.completed})
            </button>
          </div>
        </div>

        {/* Course-Level Exams Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  📚 Bài Luyện Tập Khóa Học
                </h2>
                <p className="text-sm text-gray-600">
                  Dành cho tất cả học viên trong khóa học
                </p>
              </div>
            </div>
          </div>

          {courseExams.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100 mb-6">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không có bài luyện tập khóa học nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courseExams.map((exam) => {
                const typeBadge = getExamTypeBadge(exam.skillType || exam.examType);
                const statusBadge = getStatusBadge(exam.status);

                return (
                  <div
                    key={exam.id}
                    className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all hover:shadow-md ${
                      exam.canStart
                        ? 'border-blue-100 hover:border-blue-200'
                        : 'border-gray-100 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Header with Badge */}
                        <div className="flex items-start gap-3 mb-3">
                          <h3 className="text-lg font-bold text-gray-900">{exam.title}</h3>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                            Khóa học
                          </span>
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${typeBadge.color}`}>
                            {typeBadge.label}
                          </span>
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${statusBadge.color}`}>
                            {statusBadge.icon}
                            {statusBadge.label}
                          </span>
                        </div>

                        {/* Description */}
                        {exam.description && (
                          <p className="text-gray-600 text-sm mb-3">{exam.description}</p>
                        )}

                        {/* Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{exam.durationMinutes} phút</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4" />
                            <span>{exam.examQuestions?.length || exam.totalQuestions || 0} câu hỏi</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4" />
                            <span>Đạt: {exam.passingScore || 60}%</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Award className="w-4 h-4" />
                            <span>Lần làm: {exam.completedAttempts || 0}</span>
                          </div>
                          {exam.bestScore !== null && (
                            <div className="flex items-center gap-1.5 text-green-600 font-medium">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Điểm cao nhất: {exam.bestScore}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleStartExam(exam)}
                        disabled={!exam.canStart}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                          exam.canStart
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:-translate-y-0.5'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {exam.status === 'completed' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Đã hoàn thành
                          </>
                        ) : exam.status === 'in_progress' ? (
                          <>
                            <Play className="w-4 h-4" />
                            Tiếp tục
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Bắt đầu
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Class-Specific Exams Section */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  🎯 Bài Luyện Tập Theo Lớp
                </h2>
                <p className="text-sm text-gray-600">
                  Dành riêng cho lớp học của bạn
                </p>
              </div>
            </div>
          </div>

          {classExams.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không có bài luyện tập theo lớp nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {classExams.map((exam) => {
                const typeBadge = getExamTypeBadge(exam.skillType || exam.examType);
                const statusBadge = getStatusBadge(exam.status);
                const className = exam.classEntity?.className || 'Lớp học';

                return (
                  <div
                    key={exam.id}
                    className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all hover:shadow-md ${
                      exam.canStart
                        ? 'border-purple-100 hover:border-purple-200'
                        : 'border-gray-100 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Header with Badge */}
                        <div className="flex items-start gap-3 mb-3">
                          <h3 className="text-lg font-bold text-gray-900">{exam.title}</h3>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                            {className}
                          </span>
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${typeBadge.color}`}>
                            {typeBadge.label}
                          </span>
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${statusBadge.color}`}>
                            {statusBadge.icon}
                            {statusBadge.label}
                          </span>
                        </div>

                        {/* Description */}
                        {exam.description && (
                          <p className="text-gray-600 text-sm mb-3">{exam.description}</p>
                        )}

                        {/* Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{exam.durationMinutes} phút</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4" />
                            <span>{exam.examQuestions?.length || exam.totalQuestions || 0} câu hỏi</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4" />
                            <span>Đạt: {exam.passingScore || 60}%</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Award className="w-4 h-4" />
                            <span>Lần làm: {exam.completedAttempts || 0}</span>
                          </div>
                          {exam.bestScore !== null && (
                            <div className="flex items-center gap-1.5 text-green-600 font-medium">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Điểm cao nhất: {exam.bestScore}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleStartExam(exam)}
                        disabled={!exam.canStart}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                          exam.canStart
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg hover:-translate-y-0.5'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {exam.status === 'completed' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Đã hoàn thành
                          </>
                        ) : exam.status === 'in_progress' ? (
                          <>
                            <Play className="w-4 h-4" />
                            Tiếp tục
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Bắt đầu
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentExamList;
