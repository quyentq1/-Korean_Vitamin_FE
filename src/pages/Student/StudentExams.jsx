import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Users, CheckCircle, XCircle, Calendar, BookOpen, Search, Play, Eye } from 'lucide-react';
import studentService from '../../services/studentService';
import classService from '../../services/classService';

const StudentExams = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchExams();
  }, [filter]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const classesData = await classService.getMyClasses();
      const userClasses = classesData || [];
      const enrolledCourseIds = new Set();
      userClasses.forEach(classEnrollment => {
        const courseId = classEnrollment.courseId || classEnrollment.classEntity?.courseId || classEnrollment.course?.id;
        if (courseId) enrolledCourseIds.add(courseId);
      });

      const response = await studentService.getExams(filter);
      const allExams = response?.data || response || [];
      const accessibleExams = allExams.filter(exam => {
        const examCourseId = exam.courseId || exam.course?.id;
        return enrolledCourseIds.has(examCourseId);
      });

      const mappedExams = accessibleExams.map(exam => ({
        id: exam.id,
        title: exam.title || 'Bài kiểm tra',
        course: exam.courseName || exam.course?.name || 'Khóa học',
        examDate: exam.availableFrom || exam.startDate,
        duration: exam.durationMinutes || exam.duration || 60,
        questions: exam.totalQuestions || 0,
        points: exam.totalPoints || 100,
        status: exam.status || 'AVAILABLE',
        attempts: exam.attemptsCount || 0,
        maxAttempts: exam.maxAttempts || 1,
        score: exam.bestScore || exam.lastScore || null
      }));

      setExams(mappedExams);
    } catch (error) {
      console.error('Error:', error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'AVAILABLE': { text: 'Sẵn sàng', color: 'bg-green-100 text-green-700' },
      'COMPLETED': { text: 'Hoàn thành', color: 'bg-blue-100 text-blue-700' },
      'MISSED': { text: 'Bỏ lỡ', color: 'bg-red-100 text-red-700' },
    };
    const badge = badges[status] || badges['AVAILABLE'];
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>{badge.text}</span>;
  };

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Bài kiểm tra</h1>
          <p className="text-indigo-100">Xem và làm bài kiểm tra của bạn</p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bài kiểm tra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'AVAILABLE', 'COMPLETED', 'MISSED'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filter === f
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f === 'ALL' ? 'Tất cả' : f === 'AVAILABLE' ? 'Sẵn sàng' : f === 'COMPLETED' ? 'Hoàn thành' : 'Bỏ lỡ'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exams List */}
        {filteredExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <FileText className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy bài kiểm tra</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{exam.title}</h3>
                      {getStatusBadge(exam.status)}
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {exam.course}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{exam.duration} phút</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{exam.questions} câu</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{exam.points} điểm</span>
                  </div>
                </div>

                {exam.score && (
                  <div className="mb-4 p-3 bg-green-50 rounded-xl">
                    <p className="text-sm text-gray-600">Điểm cao nhất</p>
                    <p className="text-2xl font-bold text-green-600">{exam.score}</p>
                  </div>
                )}

                <button
                  onClick={() => exam.status === 'AVAILABLE' ? navigate(`/exam/${exam.id}/intro`) : navigate(`/student/results/${exam.id}`)}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {exam.status === 'AVAILABLE' ? <><Play className="w-4 h-4" /> Bắt đầu</> : <><Eye className="w-4 h-4" /> Xem kết quả</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExams;
