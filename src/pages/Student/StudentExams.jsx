import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  BookOpen,
  Filter,
  Search
} from 'lucide-react';
import studentService from '../../services/studentService';
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Badge
} from '../../components/ui';

/**
 * StudentExams - Danh sách bài kiểm tra cho Student
 */
const StudentExams = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, AVAILABLE, COMPLETED, MISSED

  useEffect(() => {
    fetchExams();
  }, [filter]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      // TODO: Gọi API thực tế
      // const data = await studentService.getExams(filter);

      // Mock data
      const mockExams = [
        {
          id: 1,
          title: 'Kiểm tra giữa kỳ - TOPIK I',
          course: 'Hàn Quốc Cơ Bản',
          examDate: '2026-03-25T10:00:00',
          duration: 60,
          questions: 30,
          points: 100,
          status: 'AVAILABLE',
          attempts: 0,
          maxAttempts: 1,
          description: 'Kiểm tra kiến thức cơ bản về tiếng Hàn'
        },
        {
          id: 2,
          title: 'Kiểm tra từ vựng - Ngữ pháp',
          course: 'Ngữ Pháp Hàn Quốc',
          examDate: '2026-03-26T14:00:00',
          duration: 45,
          questions: 25,
          points: 80,
          status: 'AVAILABLE',
          attempts: 0,
          maxAttempts: 2,
          description: 'Kiểm tra kiến thức ngữ pháp'
        },
        {
          id: 3,
          title: 'Kiểm tra Chữ Hán',
          course: 'Chữ Hán Nâng Cao',
          examDate: '2026-03-20T09:00:00',
          duration: 90,
          questions: 50,
          points: 120,
          status: 'COMPLETED',
          attempts: 1,
          maxAttempts: 1,
          score: 90,
          description: 'Kiểm tra kiến thức chữ Hán'
        },
        {
          id: 4,
          title: 'Kiểm tra Nghe Hiểu',
          course: 'Hàn Quốc Cơ Bản',
          examDate: '2026-03-15T10:00:00',
          duration: 60,
          questions: 40,
          points: 100,
          status: 'MISSED',
          attempts: 0,
          maxAttempts: 1,
          description: 'Bạn đã bỏ lỡ bài kiểm tra này'
        }
      ];

      let filtered = mockExams;
      if (filter !== 'ALL') {
        filtered = mockExams.filter(exam => exam.status === filter);
      }
      setExams(filtered);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  const handleViewResult = (examId) => {
    navigate(`/student/results/${examId}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge variant="success" size="sm">✅ Sẵn sàng</Badge>;
      case 'COMPLETED':
        return <Badge variant="info" size="sm">✏️ Hoàn thành</Badge>;
      case 'MISSED':
        return <Badge variant="error" size="sm">❌ Bỏ lỡ</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="wide">
      <PageHeader
        title={t('student.exams.title', 'Bài Kiểm Tra')}
        subtitle={t('student.exams.subtitle', 'Xem và làm bài kiểm tra')}
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Lọc:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'ALL', label: 'Tất cả', icon: '📋' },
              { value: 'AVAILABLE', label: 'Sẵn sàng', icon: '✅' },
              { value: 'COMPLETED', label: 'Hoàn thành', icon: '✏️' },
              { value: 'MISSED', label: 'Bỏ lỡ', icon: '❌' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === f.value
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Exams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card
            key={exam.id}
            className="hover:shadow-xl transition-all duration-300 group"
          >
            {/* Status Bar */}
            <div className={`h-1 w-full ${
              exam.status === 'AVAILABLE' ? 'bg-green-500' :
              exam.status === 'COMPLETED' ? 'bg-blue-500' :
              'bg-red-500'
            }`} />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{exam.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{exam.course}</p>
                  {getStatusBadge(exam.status)}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(exam.examDate).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{exam.duration} phút</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{exam.questions} câu hỏi</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{exam.points} điểm</span>
                </div>
              </div>

              {/* Score for completed exams */}
              {exam.status === 'COMPLETED' && exam.score && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Điểm của bạn:</span>
                    <span className="text-2xl font-bold text-green-600">{exam.score}</span>
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exam.description}</p>

              {/* Actions */}
              <div className="flex gap-2">
                {exam.status === 'AVAILABLE' && exam.attempts < exam.maxAttempts && (
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => handleStartExam(exam.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Bắt đầu
                  </Button>
                )}
                {exam.status === 'COMPLETED' && (
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleViewResult(exam.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem kết quả
                  </Button>
                )}
                {exam.status === 'MISSED' && (
                  <Button
                    variant="ghost"
                    className="flex-1"
                    disabled
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Đã kết thúc
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {exams.length === 0 && (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Không có bài kiểm tra nào</p>
          <p className="text-gray-400 text-sm mt-2">Thử đổi bộ lọc để xem bài kiểm tra khác</p>
        </Card>
      )}
    </PageContainer>
  );
};

export default StudentExams;
