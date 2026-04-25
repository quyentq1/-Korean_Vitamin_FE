import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Clock, ArrowRight, Video, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ConsultationPopup from '../components/ConsultationPopup';
import consultationService from '../services/consultationService';
import CoursePreview from '../components/CoursePreview';
import { useAuth } from '../contexts/AuthContext';
import { useGuestContext } from '../hooks/useGuestContext';
import courseService from '../services/courseService';
import examService from '../services/examService';
import lessonService from '../services/lessonService';

const CourseDetail = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { recordCourseInterest } = useGuestContext();
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [practiceExams, setPracticeExams] = useState([]);
    const [examsLoading, setExamsLoading] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [lessonsLoading, setLessonsLoading] = useState(false);
    const [expandedLesson, setExpandedLesson] = useState(null);

    // Legacy static data for fallback
    const staticCourseData = {
        'topik': {
            title: t('page.courseDetail.topik.title'),
            icon: '📝',
            color: 'from-blue-500 to-blue-700',
            bgColor: 'bg-blue-500',
            desc: t('page.courseDetail.topik.desc'),
            fullDesc: t('page.courseDetail.topik.fullDesc'),
            whyLearn: [
                t('page.courseDetail.topik.why1'),
                t('page.courseDetail.topik.why2'),
                t('page.courseDetail.topik.why3')
            ],
            curriculum: [
                { module: t('page.courseDetail.topik.mod1'), lessons: 20 },
                { module: t('page.courseDetail.topik.mod2'), lessons: 15 },
                { module: t('page.courseDetail.topik.mod3'), lessons: 20 },
                { module: t('page.courseDetail.topik.mod4'), lessons: 15 }
            ]
        },
        'opic': {
            title: t('page.courseDetail.opic.title'),
            icon: '🎤',
            color: 'from-purple-500 to-purple-700',
            bgColor: 'bg-purple-500',
            desc: t('page.courseDetail.opic.desc'),
            fullDesc: t('page.courseDetail.opic.fullDesc'),
            whyLearn: [
                t('page.courseDetail.opic.why1'),
                t('page.courseDetail.opic.why2'),
                t('page.courseDetail.opic.why3')
            ],
            curriculum: [
                { module: t('page.courseDetail.opic.mod1'), lessons: 10 },
                { module: t('page.courseDetail.opic.mod2'), lessons: 15 },
                { module: t('page.courseDetail.opic.mod3'), lessons: 20 },
                { module: t('page.courseDetail.opic.mod4'), lessons: 10 }
            ]
        },
        'eps': {
            title: t('page.courseDetail.eps.title'),
            icon: '✈️',
            color: 'from-emerald-500 to-emerald-700',
            bgColor: 'bg-emerald-500',
            desc: t('page.courseDetail.eps.desc'),
            fullDesc: t('page.courseDetail.eps.fullDesc'),
            whyLearn: [
                t('page.courseDetail.eps.why1'),
                t('page.courseDetail.eps.why2'),
                t('page.courseDetail.eps.why3')
            ],
            curriculum: [
                { module: t('page.courseDetail.eps.mod1'), lessons: 20 },
                { module: t('page.courseDetail.eps.mod2'), lessons: 25 },
                { module: t('page.courseDetail.eps.mod3'), lessons: 15 },
                { module: t('page.courseDetail.eps.mod4'), lessons: 20 }
            ]
        }
    };

    // Fetch course details
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                console.log('[CourseDetail] Fetching course with id:', id);
                setLoading(true);

                // Check if ID is a number (database course) or string (static course)
                if (!isNaN(id)) {
                    // Database course - fetch from API
                    try {
                        const data = await courseService.getCourseById(id);
                        console.log('Course data from API:', data);

                        setCourse({
                            id: data.id,
                            title: data.name,
                            icon: '🎓',
                            color: 'from-blue-500 to-blue-700',
                            bgColor: 'bg-blue-500',
                            desc: `${data.code || ''} - ${data.schedule || ''}`,
                            fullDesc: data.description || t('courseDetail.noDescription', 'Không có mô tả'),
                            whyLearn: data.objectives ? data.objectives.split('\n').filter(Boolean) : ['Chương trình chuẩn quốc tế', 'Giảng viên giàu kinh nghiệm'],
                            curriculum: data.modules || [],
                            fee: data.fee ? `${data.fee.toLocaleString()}đ` : null,
                            level: data.level,
                            duration: data.duration,
                            startDate: data.startDate,
                            endDate: data.endDate,
                            capacity: data.capacity,
                            enrolledCount: data.enrolledCount,
                            availableSlots: data.availableSlots,
                            requirements: data.requirements,
                            schedule: data.schedule
                        });

                        // Fetch lessons for DB courses
                        setLessonsLoading(true);
                        lessonService.getCourseLessons(data.id)
                            .then(res => {
                                const list = Array.isArray(res) ? res : (res.data || []);
                                list.sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));
                                setLessons(list);
                            })
                            .catch(() => setLessons([]))
                            .finally(() => setLessonsLoading(false));

                        // Record course interest for guest users
                        if (!isAuthenticated) {
                            recordCourseInterest(parseInt(id));
                        }
                    } catch (err) {
                        console.error('Error fetching course:', err);
                        setError(t('courseDetail.errorLoading', 'Không thể tải thông tin khóa học.'));
                    }
                } else {
                    // Handle static IDs (topik, opic, eps, etc.)
                    const staticData = staticCourseData[id];
                    if (staticData) {
                        setCourse(staticData);

                        // Record course interest for guest users
                        if (!isAuthenticated) {
                            recordCourseInterest(id);
                        }
                    } else {
                        setError(t('courseDetail.notFound', 'Không tìm thấy khóa học.'));
                    }
                }
            } catch (err) {
                console.error('Error in fetchCourse:', err);
                setError(t('courseDetail.errorLoading', 'Không thể tải thông tin khóa học.'));
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Fetch practice exams when course is loaded and user is authenticated
    const fetchPracticeExams = useCallback(async (courseId) => {
        if (!courseId || isNaN(courseId)) return;

        console.log('[CourseDetail] Fetching practice exams for course:', courseId);
        setExamsLoading(true);
        try {
            const response = await examService.getPracticeExamsByCourse(courseId);
            const exams = Array.isArray(response) ? response : [];
            // Filter only PRACTICE exams and published
            const practiceExams = exams.filter(exam =>
                exam.examCategory === 'PRACTICE' && exam.published
            );
            setPracticeExams(practiceExams);
        } catch (err) {
            console.error('Failed to fetch practice exams:', err);
            setPracticeExams([]);
        } finally {
            setExamsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (course && course.id && !isNaN(course.id) && isAuthenticated) {
            fetchPracticeExams(course.id);
        }
    }, [course?.id, isAuthenticated, fetchPracticeExams]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error || !course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-red-500">
                    <p className="text-xl font-semibold mb-2">{t('courseDetail.error', 'Lỗi')}</p>
                    <p>{error || t('courseDetail.notFound', 'Không tìm thấy khóa học.')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20">
                {/* Hero Section */}
                <div className={`bg-gradient-to-r ${course.color} text-white py-12 sm:py-16`}>
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-5xl sm:text-7xl shadow-2xl shrink-0">
                                {course.icon}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">{course.title}</h1>
                                <p className="text-lg sm:text-2xl text-white/90 mb-4">{course.desc}</p>
                                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
                                    <span className="px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-xs sm:text-sm font-medium">
                                        ⏱️ {t('courseDetail.hours', 'giờ học')}: {course.schedule || 'Linh hoạt'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Banner CTA - Nổi bật cho Guest User */}
                <div className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 py-6 sm:py-8 shadow-lg">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                                    🎯 {t('courseDetail.discoverSkills', 'Khám phá năng lực tiếng Hàn của bạn ngay!')}
                                </h3>
                                <p className="text-white/90 text-sm sm:text-base">
                                    {t('courseDetail.freeTestBanner', 'Thi thử miễn phí - Không cần đăng ký - Nhận kết quả ngay lập tức')}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate(`/free-tests?course=${id}`)}
                                className="px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 whitespace-nowrap group"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-2xl group-hover:rotate-12 transition-transform">🚀</span>
                                    <span>{t('courseDetail.startFreeTest', 'Bắt Đầu Thi Thử')}</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    {/* Course Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {/* Level Badge */}
                        {course.level && (
                            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                                    {course.level === 'BEGINNER' ? '🌱' : course.level === 'INTERMEDIATE' ? '📚' : '🎯'}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('courseDetail.level', 'Độ khó')}</p>
                                    <p className="font-semibold text-gray-900">
                                        {course.level === 'BEGINNER' ? 'TOPIK I' : course.level === 'INTERMEDIATE' ? 'TOPIK II' : 'ESP'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Duration */}
                        {course.duration && (
                            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                                    ⏱️
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('courseDetail.duration', 'Thời lượng')}</p>
                                    <p className="font-semibold text-gray-900">{course.duration} giờ</p>
                                </div>
                            </div>
                        )}

                        {/* Schedule */}
                        {course.schedule && (
                            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                                    📅
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('courseDetail.schedule', 'Lịch học')}</p>
                                    <p className="font-semibold text-gray-900 text-sm">{course.schedule}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Requirements */}
                    {course.requirements && (
                        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('courseDetail.requirements', 'Yêu cầu khóa học')}</h2>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {course.requirements}
                            </div>
                        </div>
                    )}

                    {/* Pass Criteria - NEW */}
                    {(course.passCriteria || (course.level && course.duration)) && (
                        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('courseDetail.passCriteria', 'Điều kiện qua môn')}</h2>

                            {course.passCriteria ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Passing Score */}
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">🎯</span>
                                                <span className="font-medium text-gray-900">{t('courseDetail.passingScore', 'Điểm qua môn')}</span>
                                            </div>
                                            <span className="text-2xl font-bold text-green-600">
                                                {course.passCriteria.passingScore || 70}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Attendance */}
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">📋</span>
                                                <span className="font-medium text-gray-900">{t('courseDetail.attendance', 'Điểm danh')}</span>
                                            </div>
                                            <span className="text-2xl font-bold text-blue-600">
                                                {course.passCriteria.requiredAttendance || 80}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Certificate */}
                                    {course.passCriteria.certificateCriteria && (
                                        <div className="md:col-span-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                            <div className="flex items-start gap-2">
                                                <span className="text-2xl">🏆</span>
                                                <div>
                                                    <p className="font-medium text-gray-900 mb-1">{t('courseDetail.certificate', 'Cấp chứng chỉ')}</p>
                                                    <p className="text-sm text-gray-700">{course.passCriteria.certificateCriteria}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Default pass criteria if not specified */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">🎯</span>
                                                <span className="font-medium text-gray-900">{t('courseDetail.passingScore', 'Điểm qua môn')}</span>
                                            </div>
                                            <span className="text-2xl font-bold text-green-600">70%</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">📋</span>
                                                <span className="font-medium text-gray-900">{t('courseDetail.attendance', 'Điểm danh')}</span>
                                            </div>
                                            <span className="text-2xl font-bold text-blue-600">80%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                    <strong>💡 {t('courseDetail.note', 'Lưu ý')}:</strong> {t('courseDetail.noteText', 'Đạt điểm cao hơn yêu cầu sẽ giúp hồ sơ của bạn đẹp hơn khi xin việc hoặc du học!')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('courseDetail.about', 'Về khóa học')}</h2>
                        <p className="text-gray-700 leading-relaxed">{course.fullDesc}</p>
                    </div>

                    {/* Why Learn */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('courseDetail.whyLearn', 'Tại sao nên học?')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {course.whyLearn?.map((reason, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-green-600 text-sm">✓</span>
                                    </div>
                                    <span className="text-gray-700">{reason}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Requirements */}
                    {course.requirements && (
                        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('courseDetail.requirements', 'Yêu cầu khóa học')}</h2>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {course.requirements}
                            </div>
                        </div>
                    )}

                    {/* Curriculum */}
                    {!isNaN(id) && lessons.length > 0 ? (
                        /* DB course with lessons from API */
                        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('courseDetail.curriculum', 'Nội dung khóa học')}</h2>
                            <p className="text-sm text-gray-400 mb-4">{lessons.length} {t('courseDetail.lessonsUnit', 'bài học')} &middot; {lessons.reduce((s, l) => s + (l.durationMinutes || 0), 0)} {t('common.minutes', 'phút')}</p>
                            <div className="space-y-3">
                                {lessons.map((lesson) => (
                                    <div key={lesson.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                                            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                                                {lesson.lessonOrder}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900 truncate">{lesson.title}</span>
                                                    {lesson.isPreview && (
                                                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                                            <Eye className="w-3 h-3 inline mr-0.5" />{t('courseDetail.free', 'Miễn phí')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                                                    {lesson.durationMinutes && <span>{lesson.durationMinutes} {t('common.minutes', 'phút')}</span>}
                                                    {lesson.videoUrl && <span className="flex items-center gap-0.5"><Video className="w-3 h-3" /> {t('courseDetail.video', 'Video')}</span>}
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
                                                                    <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">{t('courseDetail.openVideo', 'Mở video')}</a>
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
                                                    <p className="text-sm text-gray-400 italic">{t('courseDetail.noContent', 'Chưa có nội dung chi tiết')}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : course.curriculum && course.curriculum.length > 0 ? (
                        /* Static course with hardcoded curriculum */
                        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('courseDetail.curriculum', 'Nội dung khóa học')}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {course.curriculum.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            {item.module || item.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {item.lessons ? `${item.lessons} ${t('courseDetail.lessonsUnit', 'bài học')}` : `${item.hours || item.lessonCount || 0} ${t('courseDetail.hoursUnit', 'giờ')}`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : !isNaN(id) && lessonsLoading ? (
                        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : null}

                    {/* Practice Exams Section - NEW */}
                    {practiceExams.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        📚 {t('courseDetail.practiceExams', 'Bài Luyện Tập')}
                                    </h2>
                                    <p className="text-gray-600">
                                        {t('courseDetail.practiceExamsDesc', 'Làm các bài luyện tập để cải thiện kỹ năng của bạn')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(`/courses/${course.id}/exams`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    {t('courseDetail.viewAll', 'Xem tất cả')}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Exam Preview Cards (max 3) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {practiceExams.slice(0, 3).map((exam) => (
                                    <div
                                        key={exam.id}
                                        className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                                        onClick={() => navigate(`/courses/${course.id}/exams`)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                                                {exam.title}
                                            </h3>
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 shrink-0 ml-2">
                                                {exam.examType?.replace('_', ' ') || 'MIXED'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{exam.durationMinutes} {t('common.minutes', 'phút')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                <span>{exam.examQuestions?.length || exam.totalQuestions || 0} {t('common.questions', 'câu hỏi')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" />
                                                <span>{t('courseDetail.passScore', 'Đạt')}: {exam.passingScore || 60}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {practiceExams.length > 3 && (
                                <div className="text-center mt-4">
                                    <p className="text-gray-500 text-sm">
                                        {t('courseDetail.moreExams', 'Và')} {practiceExams.length - 3} {t('courseDetail.moreExamsSuffix', 'bài luyện tập khác...')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        {/* Nổi bật: Thi thử miễn phí */}
                        <button
                            onClick={() => navigate(`/free-tests?course=${id}`)}
                            className="group relative px-6 sm:px-8 py-4 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-pulse-slow"
                        >
                            <span className="absolute inset-0 bg-white/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <span className="relative flex items-center gap-2">
                                <span className="text-2xl group-hover:rotate-12 transition-transform">🎯</span>
                                <span>{t('courseDetail.freeTest', 'Thi Thử Miễn Phí')}</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>

                        <button
                            onClick={() => setIsContactModalOpen(true)}
                            className="px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                        >
                            {t('courseDetail.contactNow', 'Liên hệ tư vấn ngay')}
                        </button>
                        {course.fee && (
                            <div className="px-6 sm:px-8 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-semibold">
                                {course.fee}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
            <ConsultationPopup isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} onSubmit={async (formData) => {
                await consultationService.submitConsultation(formData);
            }} />
        </div>
    );
};

export default CourseDetail;
