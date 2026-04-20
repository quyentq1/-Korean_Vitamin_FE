import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  FileText,
  Play,
  CheckCircle,
  User,
  AlertCircle
} from 'lucide-react';
import studentService from '../../services/studentService';
import examService from '../../services/examService';
import StudentAttendanceTab from '../../components/Student/StudentAttendanceTab';
import Swal from 'sweetalert2';

const StudentClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [classData, setClassData] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    console.log('🔍 StudentClassDetail mounted with classId:', classId);
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      setLoading(true);

      console.log('📡 Fetching class details for classId:', classId);

      // Get class details from backend (returns DTO directly)
      const response = await studentService.getClassDetails(classId);

      console.log('📦 Class data response:', response);

      // Response is now a DTO object with all fields
      setClassData(response);
      setEnrollment(response);
      setSchedules(response.schedules || []);

      // Fetch PRACTICE exams for this class
      try {
        const examsResponse = await studentService.getClassExams(classId);
        console.log('📦 Exams response:', examsResponse);
        const allExams = Array.isArray(examsResponse) ? examsResponse : [];
        // Filter only PRACTICE exams
        const practiceExams = allExams.filter(exam => exam.examCategory === 'PRACTICE');
        console.log('✅ Filtered PRACTICE exams:', practiceExams);
        setExams(practiceExams);
      } catch (examError) {
        console.error('❌ Error fetching exams:', examError);
        setExams([]);
      }
    } catch (error) {
      console.error('❌ Error fetching class data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      const attempt = await examService.startExam(examId, false);
      navigate(`/exam/${examId}/taking/${attempt.id}`);
    } catch (error) {
      console.error('Failed to start exam:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể bắt đầu làm bài.';

      // Check if it's class exam limit error
      if (errorMessage.includes('CLASS_EXAM_ATTEMPT_LIMIT')) {
        Swal.fire({
          icon: 'warning',
          title: 'Đã hết lượt thi',
          text: 'Bạn đã hoàn thành bài thi này. Bài luyện tập trong lớp học chỉ được thi 1 lần.',
          confirmButtonColor: '#667eea',
          confirmButtonText: 'Đã hiểu'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Không thể bắt đầu làm bài',
          text: errorMessage,
          confirmButtonColor: '#667eea',
          confirmButtonText: 'Đóng'
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PLANNED': { text: 'Đ lên kế hoạch', className: 'bg-gray-100 text-gray-700' },
      'ONGOING': { text: 'Đang diễn ra', className: 'bg-blue-100 text-blue-700' },
      'COMPLETED': { text: 'Đã kết thúc', className: 'bg-green-100 text-green-700' },
      'CANCELLED': { text: 'Đã hủy', className: 'bg-red-100 text-red-700' }
    };
    const badge = badges[status] || badges['PLANNED'];
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}>{badge.text}</span>;
  };

  const getScheduleStatusBadge = (schedule) => {
    if (schedule.status === 'CANCELLED') {
      return <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">Đã hủy</span>;
    }
    if (schedule.status === 'COMPLETED') {
      return <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Đã xong</span>;
    }
    const now = new Date();
    const scheduleEnd = new Date(`${schedule.lessonDate}T${schedule.endTime || '23:59'}`);
    if (scheduleEnd < now) {
      return <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">Đã qua</span>;
    }
    return <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">Sắp tới</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/student/my-courses')}
            className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <AlertCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy lớp học</h3>
            <p className="text-gray-500">Bạn chưa tham gia lớp học này</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/student/my-courses')}
          className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại khóa học của tôi
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h1 className="text-3xl font-bold">{classData.className}</h1>
                <p className="text-indigo-100">
                  <span className="mr-4">Mã lớp: {classData.classCode}</span>
                  {classData.enrollmentStatus && (
                    <span>
                      Trạng thái: {classData.enrollmentStatus === 'ACTIVE' ? 'Đang học' : classData.enrollmentStatus}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 bg-gray-50">
            <div className="flex gap-6 overflow-x-auto">
              {['overview', 'schedule', 'exams', 'attendance'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'overview' && 'Tổng quan'}
                  {tab === 'schedule' && 'Lịch học'}
                  {tab === 'exams' && 'Bài luyện tập'}
                  {tab === 'attendance' && 'Điểm danh'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Class Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-xl p-5">
                    <BookOpen className="w-6 h-6 text-blue-600 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Khóa học</p>
                    <p className="font-bold text-gray-900">{classData.courseName || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">{classData.courseCode || ''}</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-5">
                    <Users className="w-6 h-6 text-green-600 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Sĩ số</p>
                    <p className="font-bold text-gray-900">
                      {classData.currentEnrollment || 0} / {classData.capacity || 0}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-5">
                    <Calendar className="w-6 h-6 text-purple-600 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Thời gian</p>
                    <p className="font-bold text-gray-900">
                      {classData.startDate ? new Date(classData.startDate).toLocaleDateString('vi-VN') : 'N/A'} - {classData.endDate ? new Date(classData.endDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Trạng thái lớp</p>
                      {getStatusBadge(classData.status)}
                    </div>
                    {classData.enrollmentDate && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Ngày tham gia</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(classData.enrollmentDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <Calendar className="w-5 h-5 text-indigo-600 mb-2" />
                    <p className="text-xs text-gray-600">Tổng số buổi</p>
                    <p className="font-bold text-gray-900">{schedules.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                    <p className="text-xs text-gray-600">Đã hoàn thành</p>
                    <p className="font-bold text-gray-900">{schedules.filter(s => s.status === 'COMPLETED').length}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <FileText className="w-5 h-5 text-blue-600 mb-2" />
                    <p className="text-xs text-gray-600">Bài luyện tập</p>
                    <p className="font-bold text-gray-900">{exams.length}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <Clock className="w-5 h-5 text-amber-600 mb-2" />
                    <p className="text-xs text-gray-600">Sắp tới</p>
                    <p className="font-bold text-gray-900">{schedules.filter(s => s.status === 'SCHEDULED' && new Date(`${s.lessonDate}T${s.endTime || '23:59'}`) >= new Date()).length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch học</h3>

                {schedules.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có lịch học</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-gray-900">Buổi {schedule.lessonNumber}</span>
                              {getScheduleStatusBadge(schedule)}
                            </div>
                            {schedule.topic && (
                              <p className="text-gray-700 mb-2">{schedule.topic}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{schedule.lessonDate ? new Date(schedule.lessonDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          {schedule.room && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{schedule.room}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Exams Tab */}
            {activeTab === 'exams' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài luyện tập của lớp</h3>

                {exams.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có bài luyện tập nào</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exams.map((exam) => (
                      <div
                        key={exam.id}
                        className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">{exam.title}</h4>
                            {exam.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{exam.description}</p>
                            )}
                          </div>
                          {exam.examType && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                              {exam.examType === 'MIXED' ? 'Hỗn hợp' : exam.examType}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{exam.durationMinutes || exam.duration || 60} phút</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{exam.totalQuestions || 0} câu</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>{exam.passingScore || 70}% đạt</span>
                          </div>
                        </div>

                        {exam.attemptsCount > 0 && exam.bestScore && (
                          <div className="mb-4 p-3 bg-green-50 rounded-xl">
                            <p className="text-sm text-gray-600">Điểm cao nhất</p>
                            <p className="text-xl font-bold text-green-600">{exam.bestScore}</p>
                          </div>
                        )}

                        <button
                          onClick={() => handleStartExam(exam.id)}
                          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          {exam.attemptsCount > 0 ? 'Làm lại' : 'Bắt đầu'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <StudentAttendanceTab classId={classId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClassDetail;
