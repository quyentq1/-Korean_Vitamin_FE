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
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'course', 'class'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 exams per page (2 rows of 3 cards)

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

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedCourse, selectedClass, searchQuery]);

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
          return exam.classId === selectedClass.id;
        }

        // If course selected, show exams for that course (both course-level and class-level)
        if (selectedCourse) {
          return exam.courseId === selectedCourse.id;
        }

        // If nothing selected, show all PRACTICE exams for enrolled courses
        const enrolledCourseIds = new Set(
          myClasses
            .map(cls => cls.course?.id || cls.courseId)
            .filter(Boolean)
        );
        return enrolledCourseIds.has(exam.courseId);
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
    // Check isPassed field from backend first, fallback to calculation
    const hasAttempt = exam.attemptsCount > 0;
    const isPassed = exam.isPassed !== null ? exam.isPassed :
      (exam.bestScore && exam.bestScore >= (exam.passingScore || 70));

    if (hasAttempt && isPassed) {
      return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle className="w-3 h-3" />
        Đạt
      </span>;
    } else if (hasAttempt && !isPassed) {
      return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <XCircle className="w-3 h-3" />
        Chưa đạt
      </span>;
    } else {
      return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        <Clock className="w-3 h-3" />
        Chưa làm
      </span>;
    }
  };

  const getExamSourceBadge = (exam) => {
    // Check if it's a class exam (has classId or className from ExamListResponse)
    if (exam.classId || exam.className) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-2 border-purple-200 shadow-sm">
          <Users className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-medium">{exam.className || 'Lớp học'}</span>
          <span className="text-purple-400">•</span>
          <span className="text-purple-800 font-medium">{exam.courseName || 'Khóa học'}</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border-2 border-indigo-200 shadow-sm">
          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-medium">{exam.courseName || 'Khóa học'}</span>
          <span className="text-indigo-400">•</span>
          <span className="text-indigo-800 font-medium">Chung cho tất cả lớp</span>
        </div>
      );
    }
  };

  const filteredExams = allExams.filter(exam =>
    exam.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter exams based on active tab
  const getFilteredExamsByTab = () => {
    if (activeTab === 'course') {
      return filteredExams.filter(exam => !exam.classId);
    } else if (activeTab === 'class') {
      return filteredExams.filter(exam => exam.classId);
    }
    return filteredExams;
  };

  const displayExams = getFilteredExamsByTab();

  // Pagination logic
  const totalPages = Math.ceil(displayExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExams = displayExams.slice(startIndex, endIndex);

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
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 001.293-1.707L6.586 4H4a1 1 0 01-1-1z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Bộ lọc bài thi</h2>
          </div>
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
                className={`w-full px-4 py-3 rounded-xl border-2 text-left flex items-center justify-between transition-colors ${!selectedCourse
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
              <div className="flex flex-wrap items-center gap-3">
                {selectedCourse && (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 rounded-xl border-2 border-indigo-200 shadow-sm">
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{selectedCourse.name}</span>
                      {selectedClass ? (
                        <span className="bg-indigo-200 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                          {allExams.filter(e => e.courseId === selectedCourse.id && e.classId === selectedClass.id).length}
                        </span>
                      ) : (
                        <span className="bg-indigo-200 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                          {allExams.filter(e => e.courseId === selectedCourse.id).length}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCourse(null);
                        setSelectedClass(null);
                      }}
                      className="ml-1 hover:bg-indigo-100 rounded-lg p-0.5 transition-colors flex-shrink-0"
                      title="Bỏ chọn khóa học"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {selectedClass && (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl border-2 border-purple-200 shadow-sm">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{selectedClass.className}</span>
                      <span className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-0.5 rounded-full">
                        {allExams.filter(e => e.classId === selectedClass.id).length}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedClass(null)}
                      className="ml-1 hover:bg-purple-100 rounded-lg p-0.5 transition-colors flex-shrink-0"
                      title="Bỏ chọn lớp học"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 mb-6 shadow-lg border border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Tất cả ({filteredExams.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('course')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'course'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Bài thi chung ({filteredExams.filter(e => !e.classId).length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('class')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'class'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                <span>Bài thi lớp ({filteredExams.filter(e => e.classId).length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-semibold mb-1">Sử dụng tab để lọc bài thi</p>
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Bài thi chung:</span> Áp dụng cho tất cả lớp trong khóa học • {' '}
                <span className="font-semibold">Bài thi lớp:</span> Được giao riêng cho lớp của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Exams List */}
        {displayExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <FileText className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy bài luyện tập</h3>
            <p className="text-gray-500">
              {selectedCourse || selectedClass
                ? 'Thử chọn khóa học/lớp học khác hoặc thay đổi bộ lọc'
                : activeTab !== 'all'
                  ? `Không có bài thi trong tab này. Hãy thử tab khác.`
                  : 'Bạn chưa có bài luyện tập nào. Hãy đăng ký khóa học để được giao bài tập.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 flex items-center justify-between">
              <div>
                Hiển thị <span className="font-semibold text-gray-900">{startIndex + 1}-{Math.min(endIndex, displayExams.length)}</span> trong <span className="font-semibold text-gray-900">{displayExams.length}</span> bài luyện tập
                {activeTab !== 'all' && (
                  <span className="text-gray-500">
                    {' '}trong tab "<span className="font-medium text-gray-700">
                      {activeTab === 'course' ? 'Bài thi chung' : 'Bài thi lớp'}
                    </span>"
                  </span>
                )}
              </div>
              {totalPages > 1 && (
                <div className="text-xs text-gray-500">
                  Trang {currentPage} / {totalPages}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginatedExams.map((exam) => (
                <div
                  key={exam.id}
                  // Thêm flex, flex-col và h-full vào đây
                  className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 flex flex-col h-full ${exam.classId ? 'border-purple-100' : 'border-indigo-100'
                    }`}
                >
                  {/* Bọc toàn bộ nội dung phía trên vào thẻ flex-1 */}
                  <div className="flex-1">
                    {/* Header: Title + Badges */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-900 flex-1">{exam.title}</h3>
                        {getStatusBadge(exam)}
                      </div>
                      {getExamSourceBadge(exam)}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-4"></div>

                    {/* Exam Info */}
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{exam.durationMinutes || exam.duration || 60} phút</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">{exam.totalQuestions || 0} câu</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{exam.passingScore || 70}% đạt</span>
                        </div>
                      </div>
                    </div>

                    {/* Best Score Display - Đã sửa lỗi hiển thị số 0 */}
                    {exam.bestScore !== null && exam.bestScore !== undefined && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Điểm cao nhất</p>
                            <p className="text-2xl font-bold text-green-600">{exam.bestScore}</p>
                          </div>
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button - Nằm ở cuối nhờ flex-1 của khối trên đẩy xuống */}
                  <div className="mt-4 mt-auto">
                    <button
                      onClick={() => handleStartExam(exam.id)}
                      className={`w-full px-6 py-3 bg-gradient-to-r text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${exam.classId
                          ? 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                          : 'from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                        }`}
                    >
                      {exam.attemptsCount > 0 ? (
                        <><Play className="w-4 h-4" /> Làm lại bài</>
                      ) : (
                        <><Play className="w-4 h-4" /> Bắt đầu làm bài</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between gap-4">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Trước
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, and pages around current page
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      if (!showPage) {
                        // Show ellipsis for hidden pages
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-2 py-1 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    Tiếp
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentExams;
