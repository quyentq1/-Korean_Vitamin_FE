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
import classService from '../../services/classService';
import studentService from '../../services/studentService';

const StudentClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [classData, setClassData] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      setLoading(true);

      // Get class details from backend (returns DTO directly)
      const response = await studentService.getClassDetails(classId);

      // Response is now a DTO object with all fields
      setClassData(response);
      setEnrollment(response);
      setSchedules(response.schedules || []);
      setQuizzes(response.quizzes || []);
    } catch (error) {
      console.error('Error fetching class data:', error);
    } finally {
      setLoading(false);
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

  const getScheduleStatusBadge = (status) => {
    const badges = {
      'SCHEDULED': { text: 'Sắp tới', className: 'bg-blue-100 text-blue-700' },
      'COMPLETED': { text: 'Đã xong', className: 'bg-green-100 text-green-700' },
      'CANCELLED': { text: 'Đã hủy', className: 'bg-red-100 text-red-700' }
    };
    const badge = badges[status] || { text: status, className: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${badge.className}`}>{badge.text}</span>;
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
              {['overview', 'schedule', 'quizzes'].map(tab => (
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
                  {tab === 'quizzes' && 'Bài kiểm tra'}
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
                    <p className="text-xs text-gray-600">Bài kiểm tra</p>
                    <p className="font-bold text-gray-900">{quizzes.length}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <Clock className="w-5 h-5 text-amber-600 mb-2" />
                    <p className="text-xs text-gray-600">Sắp tới</p>
                    <p className="font-bold text-gray-900">{schedules.filter(s => s.status === 'SCHEDULED').length}</p>
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
                              {getScheduleStatusBadge(schedule.status)}
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

            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài kiểm tra trong lớp</h3>

                {quizzes.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có bài kiểm tra nào</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">{quiz.title}</h4>
                            {quiz.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
                            )}
                          </div>
                          {quiz.lessonNumber && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                              Buổi {quiz.lessonNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          {quiz.durationMinutes && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{quiz.durationMinutes} phút</span>
                            </div>
                          )}
                          {quiz.totalPoints && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{quiz.totalPoints} điểm</span>
                            </div>
                          )}
                          {quiz.quizDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(quiz.quizDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                          )}
                        </div>

                        {quiz.active ? (
                          <div className="text-center text-sm text-green-600 font-medium">
                            ✓ Đang hoạt động
                          </div>
                        ) : (
                          <div className="text-center text-sm text-gray-400">
                            Chưa kích hoạt
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClassDetail;
