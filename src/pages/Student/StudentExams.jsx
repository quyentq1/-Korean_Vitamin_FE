import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Users, CheckCircle, XCircle, Calendar, BookOpen, Search, Play, ChevronDown } from 'lucide-react';
import studentService from '../../services/studentService';
import classService from '../../services/classService';
import examService from '../../services/examService';
import Swal from 'sweetalert2';

const StudentExams = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allExams, setAllExams] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // Get unique courses from classes
  const courses = [...new Map(
    myClasses
      .map(cls => ({
        id: cls.course?.id || cls.courseId,
        name: cls.course?.name || cls.courseName,
        code: cls.course?.code || cls.courseCode
      }))
      .filter(c => c.id)
      .map(c => [c.id, c])
  ).values()];

  // Get classes for selected course
  const classesForSelectedCourse = selectedCourse
    ? myClasses.filter(cls =>
        (cls.course?.id || cls.courseId) === selectedCourse.id
      )
    : [];

  useEffect(() => {
    fetchMyClasses();
  }, []);

  useEffect(() => {
    if (myClasses.length > 0) {
      fetchExams();
    }
  }, [myClasses, selectedCourse, selectedClass]);

  const fetchMyClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getMyClasses();
      setMyClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setMyClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await studentService.getExams('ALL');
      const exams = response?.data || response || [];

      // Filter: Only PRACTICE exams (exclude MOCK)
      // Match with student's enrolled courses/classes
      const filteredExams = exams.filter(exam => {
        // Exclude MOCK tests (for guests only)
        if (exam.examCategory === 'MOCK') {
          return false;
        }

        // Must be PRACTICE
        if (exam.examCategory !== 'PRACTICE') {
          return false;
        }

        // If class selected, only show exams for that class
        if (selectedClass) {
          return (exam.classId || exam.classEntity?.id) === selectedClass.id;
        }

        // If course selected, show exams for that course (both course-level and class-level)
        if (selectedCourse) {
          const examCourseId = exam.courseId || exam.course?.id;
          return examCourseId === selectedCourse.id;
        }

        // If nothing selected, show all PRACTICE exams for enrolled courses
        const enrolledCourseIds = new Set(
          myClasses
            .map(cls => cls.course?.id || cls.courseId)
            .filter(Boolean)
        );
        const examCourseId = exam.courseId || exam.course?.id;
        return enrolledCourseIds.has(examCourseId);
      });

      setAllExams(filteredExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setAllExams([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (exam) => {
    const hasAttempt = exam.attemptsCount > 0;
    const isPassed = exam.bestScore && exam.bestScore >= (exam.passingScore || 70);

    if (hasAttempt && isPassed) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Đạt</span>;
    } else if (hasAttempt && !isPassed) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Chưa đạt</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Chưa làm</span>;
    }
  };

  const getExamSourceBadge = (exam) => {
    if (exam.classId || exam.classEntity) {
      return <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">Lớp: {exam.classEntity?.className || 'Class'}</span>;
    } else {
      return <span className="px-2 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-700">Khóa học</span>;
    }
  };

  const filteredExams = allExams.filter(exam =>
    exam.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (loading && myClasses.length === 0) {
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
          <h1 className="text-3xl font-bold mb-2">Bài luyện tập</h1>
          <p className="text-indigo-100">Làm bài kiểm tra của khóa học và lớp học</p>
        </div>

        {/* Filters: Course & Class Selectors */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Course Selector */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Chọn khóa học
              </label>
              <button
                onClick={() => {
                  setShowCourseDropdown(!showCourseDropdown);
                  setShowClassDropdown(false);
                }}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-indigo-500 outline-none text-left flex items-center justify-between"
              >
                <span>{selectedCourse ? selectedCourse.name : 'Tất cả khóa học'}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showCourseDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCourseDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border-2 border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCourse(null);
                      setSelectedClass(null);
                      setShowCourseDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100"
                  >
                    Tất cả khóa học
                  </button>
                  {courses.map(course => (
                    <button
                      key={course.id}
                      onClick={() => {
                        setSelectedCourse(course);
                        setSelectedClass(null);
                        setShowCourseDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-semibold">{course.name}</div>
                      {course.code && <div className="text-xs text-gray-500">{course.code}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Class Selector */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Chọn lớp học
              </label>
              <button
                onClick={() => {
                  if (!selectedCourse) return;
                  setShowClassDropdown(!showClassDropdown);
                  setShowCourseDropdown(false);
                }}
                disabled={!selectedCourse}
                className={`w-full px-4 py-3 rounded-xl border-2 text-left flex items-center justify-between transition-colors ${
                  !selectedCourse
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border-gray-200 focus:border-indigo-500 outline-none'
                }`}
              >
                <span>{selectedClass ? selectedClass.className : 'Tất cả lớp học'}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showClassDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showClassDropdown && selectedCourse && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border-2 border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedClass(null);
                      setShowClassDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100"
                  >
                    Tất cả lớp học
                  </button>
                  {classesForSelectedCourse.map(cls => (
                    <button
                      key={cls.id}
                      onClick={() => {
                        setSelectedClass(cls);
                        setShowClassDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-semibold">{cls.className}</div>
                      {cls.classCode && <div className="text-xs text-gray-500">{cls.classCode}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Nhập tên bài kiểm tra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCourse || selectedClass) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                {selectedCourse && (
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">{selectedCourse.name}</span>
                    <button
                      onClick={() => {
                        setSelectedCourse(null);
                        setSelectedClass(null);
                      }}
                      className="hover:text-indigo-900"
                    >
                      ×
                    </button>
                  </div>
                )}
                {selectedClass && (
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">{selectedClass.className}</span>
                    <button
                      onClick={() => setSelectedClass(null)}
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Chỉ hiển thị bài luyện tập (PRACTICE)</strong> cho các khóa học và lớp học bạn đã đăng ký.
            Mock Test (đề thi thử miễn phí) không hiển thị ở đây.
          </p>
        </div>

        {/* Exams List */}
        {filteredExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <FileText className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy bài luyện tập</h3>
            <p className="text-gray-500">
              {selectedCourse || selectedClass
                ? 'Thử chọn khóa học/lớp học khác hoặc thay đổi bộ lọc'
                : 'Bạn chưa có bài luyện tập nào. Hãy đăng ký khóa học để được giao bài tập.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Hiển thị <span className="font-semibold text-gray-900">{filteredExams.length}</span> bài luyện tập
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredExams.map((exam) => (
                <div key={exam.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">{exam.title}</h3>
                        {getStatusBadge(exam)}
                        {getExamSourceBadge(exam)}
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {exam.course?.name || exam.courseName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{exam.durationMinutes || exam.duration || 60} phút</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{exam.totalQuestions || 0} câu</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{exam.passingScore || 70}% đạt</span>
                    </div>
                  </div>

                  {exam.bestScore && (
                    <div className="mb-4 p-3 bg-green-50 rounded-xl">
                      <p className="text-sm text-gray-600">Điểm cao nhất</p>
                      <p className="text-2xl font-bold text-green-600">{exam.bestScore}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleStartExam(exam.id)}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {exam.attemptsCount > 0 ? <><Play className="w-4 h-4" /> Làm lại</> : <><Play className="w-4 h-4" /> Bắt đầu</>}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentExams;
