import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  Play,
  ArrowLeft,
  CheckCircle,
  FileText,
  MapPin,
  Globe,
  Award,
  DollarSign,
  User,
  Tags,
  CheckCircle2,
  Video,
  Eye
} from 'lucide-react';
import classService from '../../services/classService';
import studentService from '../../services/studentService';
import courseService from '../../services/courseService';
import lessonService from '../../services/lessonService';
import CertificateSubmitModal from '../../components/Student/CertificateSubmitModal';

const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [courseData, setCourseData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [exams, setExams] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [eligibleCourses, setEligibleCourses] = useState([]);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      // Fetch full course details (public API, may fail)
      try {
        const courseDetails = await courseService.getCourseById(courseId);
        setCourseData(courseDetails);
      } catch (err) {
        console.warn('Failed to fetch course details from public API:', err);
      }

      // Get my classes and filter by this course
      let courseClasses = [];
      try {
        const classesData = await classService.getMyClasses();
        const allClasses = Array.isArray(classesData) ? classesData : (classesData?.data || []);
        courseClasses = allClasses.filter(cls =>
          String(cls.courseId) === String(courseId)
        );
      } catch (err) {
        console.warn('Failed to fetch my classes:', err);
      }

      setClasses(courseClasses);

      // Get schedules for all classes
      const allSchedules = [];
      for (const cls of courseClasses) {
        try {
          const classSchedules = await classService.getClassSchedules(cls.classId);
          allSchedules.push(...(Array.isArray(classSchedules) ? classSchedules : []).map(s => ({
            ...s,
            className: cls.className
          })));
        } catch (err) {
          console.warn(`Failed to fetch schedules for class ${cls.classId}`);
        }
      }
      setSchedules(allSchedules);

      // Get exams for this course
      try {
        const examsData = await studentService.getExams('AVAILABLE');
        const allExams = Array.isArray(examsData) ? examsData : (examsData?.data || []);
        const courseExams = allExams.filter(
          exam => String(exam.courseId) === String(courseId) || String(exam.course?.id) === String(courseId)
        );
        setExams(courseExams);
      } catch (err) {
        console.warn('Failed to fetch exams');
      }

      // Get lessons
      try {
        setLessonsLoading(true);
        const res = await lessonService.getCourseLessons(courseId);
        const list = Array.isArray(res) ? res : (res?.data || []);
        list.sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));
        setLessons(list);
      } catch (err) {
        console.warn('Failed to fetch lessons');
      } finally {
        setLessonsLoading(false);
      }

      // Fetch eligible courses for certificate
      try {
        const eligible = await studentService.getCertificateEligible();
        setEligibleCourses(Array.isArray(eligible) ? eligible : []);
      } catch (err) {
        console.warn('Failed to fetch eligible courses');
      }

    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const levelLabels = {
    'BEGINNER': 'TOPIK I',
    'INTERMEDIATE': 'TOPIK II',
    'ADVANCED': 'ESP'
  };

  // Parse YouTube ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^#&?]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    return null;
  };

  const youtubeId = courseData?.promoVideoUrl ? getYouTubeId(courseData.promoVideoUrl) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!courseData && classes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/student/my-courses')}
            className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại khóa học của tôi
          </button>

          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <BookOpen className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy khóa học</h3>
            <p className="text-gray-500">Bạn chưa đăng ký khóa học này</p>
          </div>
        </div>
      </div>
    );
  }

  // Use courseData if available, otherwise use first class data
  const displayCourse = courseData || (classes.length > 0 ? {
    id: classes[0].courseId,
    name: classes[0].courseName,
    code: classes[0].courseCode,
    description: classes[0].courseDescription,
    thumbnailUrl: classes[0].courseThumbnail,
    teacherName: classes[0].teacherName
  } : null);

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
              <div className="flex items-center gap-4">
                {displayCourse?.thumbnailUrl && (
                  <img
                    src={displayCourse.thumbnailUrl}
                    alt={displayCourse.name}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-white/30 shadow-lg"
                  />
                )}
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{displayCourse?.name}</h1>
                  <p className="text-indigo-100">
                    {displayCourse?.code && <span className="mr-4">Mã: {displayCourse.code}</span>}
                    {classes[0]?.teacherName && <span>Giáo viên: {classes[0].teacherName}</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 bg-gray-50">
            <div className="flex gap-6 overflow-x-auto">
              {['overview', 'curriculum', 'requirements', 'myclasses', 'instructor'].map(tab => (
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
                  {tab === 'curriculum' && 'Giáo trình'}
                  {tab === 'requirements' && 'Yêu cầu'}
                  {tab === 'myclasses' && 'Lớp học của tôi'}
                  {tab === 'instructor' && 'Giáo viên'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Video Preview */}
                {youtubeId ? (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-5 h-5 text-red-500" />
                      <span className="font-semibold text-gray-700">Video giới thiệu</span>
                    </div>
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title="Course preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                ) : displayCourse?.thumbnailUrl && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold text-gray-700">Ảnh khóa học</span>
                    </div>
                    <img
                      src={displayCourse.thumbnailUrl}
                      alt={displayCourse.name}
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                )}

                {/* Description */}
                {displayCourse?.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả khóa học</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{displayCourse.description}</p>
                  </div>
                )}

                {/* Quick Info Grid */}
                {courseData && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <BookOpen className="w-5 h-5 text-blue-600 mb-2" />
                      <p className="text-xs text-gray-600">Trình độ</p>
                      <p className="font-semibold text-gray-900">{levelLabels[courseData.level] || courseData.level}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <Clock className="w-5 h-5 text-green-600 mb-2" />
                      <p className="text-xs text-gray-600">Thời lượng</p>
                      <p className="font-semibold text-gray-900">{courseData.duration || 0} giờ</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <DollarSign className="w-5 h-5 text-amber-600 mb-2" />
                      <p className="text-xs text-gray-600">Học phí</p>
                      <p className="font-semibold text-gray-900">
                        {new Intl.NumberFormat('vi-VN').format(courseData.fee || 0)}₫
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <Calendar className="w-5 h-5 text-purple-600 mb-2" />
                      <p className="text-xs text-gray-600">Lớp học</p>
                      <p className="font-semibold text-gray-900">{classes.length}</p>
                    </div>
                  </div>
                )}

                {/* Objectives */}
                {courseData?.objectives && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Mục tiêu khóa học
                    </h3>
                    <div className="text-gray-700 whitespace-pre-wrap space-y-1">
                      {courseData.objectives.split('\n').map((line, idx) => (
                        <p key={idx} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>{line}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {courseData?.courseTags && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Tags className="w-5 h-5 text-indigo-600" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {courseData.courseTags.split(',').map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
              <div className="space-y-6">
                {/* Lessons */}
                {lessonsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  </div>
                ) : lessons.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        Bài học ({lessons.length})
                      </h3>
                      <span className="text-sm text-gray-400">
                        Tổng: {lessons.reduce((s, l) => s + (l.durationMinutes || 0), 0)} phút
                      </span>
                    </div>
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                          className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                            {lesson.lessonOrder}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 truncate">{lesson.title}</span>
                              {lesson.isPreview && (
                                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                  <Eye className="w-3 h-3 inline mr-0.5" />Xem trước
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                              {lesson.durationMinutes && <span>{lesson.durationMinutes} phút</span>}
                              {lesson.videoUrl && <span className="flex items-center gap-0.5"><Video className="w-3 h-3" /> Video</span>}
                              {lesson.description && <span className="truncate max-w-[200px]">{lesson.description}</span>}
                            </div>
                          </div>
                          <svg className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${expandedLesson === lesson.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {expandedLesson === lesson.id && (
                          <div className="px-4 pb-4 border-t border-gray-100">
                            {lesson.videoUrl && (
                              <div className="mb-3">
                                {lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') ? (
                                  (() => {
                                    const match = lesson.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^#&?]{11})/);
                                    return match ? (
                                      <iframe width="100%" style={{ aspectRatio: '16/9', height: 'auto' }} src={`https://www.youtube.com/embed/${match[1]}`} frameBorder="0" allowFullScreen className="rounded-lg" />
                                    ) : (
                                      <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline text-sm">Mở video</a>
                                    );
                                  })()
                                ) : (
                                  <video src={lesson.videoUrl} controls className="w-full rounded-lg" />
                                )}
                              </div>
                            )}
                            {lesson.content ? (
                              <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: lesson.content }} />
                            ) : (
                              <p className="text-sm text-gray-400 italic">Chưa có nội dung chi tiết</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có giáo trình</p>
                  </div>
                )}

                {courseData?.testSummary && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      Cấu trúc bài kiểm tra
                    </h3>
                    <div className="text-gray-700 whitespace-pre-wrap prose prose-sm max-w-none">
                      {courseData.testSummary}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Requirements Tab */}
            {activeTab === 'requirements' && (
              <div className="space-y-6">
                {courseData?.requirements ? (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Yêu cầu / Điều kiện tiên quyết</h3>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {courseData.requirements}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    <p>Không có yêu cầu đặc biệt</p>
                  </div>
                )}

                {courseData?.schedule && (
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      Lịch học mẫu
                    </h3>
                    <p className="text-gray-700">{courseData.schedule}</p>
                  </div>
                )}
              </div>
            )}

            {/* My Classes Tab */}
            {activeTab === 'myclasses' && (
              <div className="space-y-6">
                {/* Enrolled Classes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    Lớp học của tôi
                  </h3>

                  {classes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Chưa có lớp học</p>
                  ) : (
                    <div className="space-y-4">
                      {classes.map((cls) => (
                        <div
                          key={cls.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => navigate(`/student/class/${cls.classId}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-gray-900">{cls.className}</h4>
                              <p className="text-sm text-gray-500 font-mono">{cls.classCode}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              cls.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {cls.status === 'ACTIVE' ? 'Đang học' : cls.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {cls.schedule && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{cls.schedule}</span>
                              </div>
                            )}
                            {cls.room && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{cls.room}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-indigo-600 mt-2">Click để xem chi tiết →</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certificate Submit */}
                {eligibleCourses.length > 0 && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      Nộp chứng chỉ
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Bạn có thể nộp chứng chỉ TOPIK/OPIc cho các lớp đã hoàn thành với tỷ lệ điểm danh trên 80%.
                    </p>
                    <button
                      onClick={() => setShowCertModal(true)}
                      className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition flex items-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      Nộp chứng chỉ
                    </button>
                  </div>
                )}

                <CertificateSubmitModal
                  isOpen={showCertModal}
                  onClose={() => setShowCertModal(false)}
                  eligibleCourses={eligibleCourses}
                  onSubmitted={fetchCourseData}
                />

                {/* Schedule */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    Lịch học
                  </h3>

                  {schedules.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Chưa có lịch học</p>
                  ) : (
                    <div className="space-y-3">
                      {schedules.map((schedule, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-indigo-600" />
                                <span className="font-semibold text-gray-900">Buổi {schedule.lessonNumber}</span>
                              </div>
                              {schedule.className && (
                                <p className="text-xs text-gray-500">{schedule.className}</p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              schedule.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              schedule.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {schedule.status === 'COMPLETED' ? 'Đã xong' :
                               schedule.status === 'SCHEDULED' ? 'Sắp tới' : schedule.status}
                            </span>
                          </div>

                          {schedule.topic && (
                            <p className="text-sm text-gray-700 mb-2">{schedule.topic}</p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{schedule.lessonDate ? new Date(schedule.lessonDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{schedule.startTime} - {schedule.endTime}</span>
                            </div>
                            {schedule.room && (
                              <div className="flex items-center gap-2">
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

                {/* Available Exams */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    Bài kiểm tra
                  </h3>

                  {exams.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Chưa có bài kiểm tra</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {exams.map((exam) => (
                        <div
                          key={exam.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all"
                        >
                          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {exam.title}
                          </h4>

                          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{exam.durationMinutes || exam.duration || 60} phút</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{exam.totalQuestions || 0} câu</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/exam/${exam.id}/intro`)}
                            className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Bắt đầu
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructor Tab */}
            {activeTab === 'instructor' && (
              <div className="space-y-6">
                {courseData?.instructorInfo ? (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      Thông tin giáo viên
                    </h3>
                    <div className="text-gray-700 whitespace-pre-wrap prose prose-sm max-w-none">
                      {courseData.instructorInfo}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có thông tin giáo viên</p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-lg font-bold mb-4">Tiến độ học tập</h3>

                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Số buổi đã hoàn thành</span>
                        <span className="text-xl font-bold">
                          {schedules.filter(s => s.status === 'COMPLETED').length}/{schedules.length}
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all"
                          style={{
                            width: `${schedules.length > 0 ? (schedules.filter(s => s.status === 'COMPLETED').length / schedules.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Số bài kiểm tra</span>
                        <span className="text-xl font-bold">{exams.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseDetail;
