import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import { useAuth } from '../contexts/AuthContext';
import courseService from '../services/courseService';

const CourseDetail = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Ref để theo dõi việc đã redirect chưa
    const hasRedirectedRef = useRef(false);

    // Redirect nếu user đã đăng nhập
    useEffect(() => {
        if (isAuthenticated && user?.role && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            const roleRoutes = {
                'ADMIN': '/admin',
                'MANAGER': '/manager',
                'TEACHER': '/teacher-dashboard',
                'STAFF': '/staff',
                'STUDENT': '/learner-dashboard',
                'LEARNER': '/learner-dashboard'
            };
            const redirectPath = roleRoutes[user.role] || '/';
            navigate(redirectPath, { replace: true });
        }

        // Reset ref khi không còn authenticated (đăng xuất)
        if (!isAuthenticated) {
            hasRedirectedRef.current = false;
        }
    }, [isAuthenticated, user, navigate]);

    // Legacy static data for fallback (optional, or just remove if fully dynamic)
    const staticCourseData = {
        'topik': {
            title: 'TOPIK I & II',
            icon: '📚',
            color: 'from-orange-500 to-orange-700',
            bgColor: 'bg-orange-500',
            desc: t('landing.courses.topik.desc', 'Chứng chỉ tiếng Hàn phổ biến nhất, 6 cấp độ từ 1-6'),
            fullDesc: t('courseDetail.topik.fullDesc', 'TOPIK (Test of Proficiency in Korean) là kỳ thi năng lực tiếng Hàn được công nhận rộng rãi trên toàn thế giới.'),
            whyLearn: [
                t('courseDetail.topik.why1', 'Học bổng du học Hàn Quốc'),
                t('courseDetail.topik.why2', 'Cơ hội việc làm tại các công ty Hàn'),
            ],
            curriculum: []
        },
        // ... other static types
    };

    useEffect(() => {
        const fetchCourse = async () => {
            // Check if ID is a number (Database ID)
            if (!isNaN(id)) {
                try {
                    const data = await courseService.getCourseById(id);
                    // Map API data to UI structure if needed
                    // API Course: { id, name, description, fee, ... }
                    // UI Expects: { title, icon, color, desc, fullDesc, whyLearn, curriculum }

                    setCourse({
                        title: data.name,
                        icon: '🎓', // Default icon
                        color: 'from-blue-500 to-blue-700',
                        bgColor: 'bg-blue-500',
                        desc: `${data.code || ''} - ${data.schedule || ''}`,
                        fullDesc: data.description,
                        whyLearn: [t('courseDetail.whyLearnDefault', 'Chương trình chuẩn quốc tế'), t('courseDetail.whyLearnDefault2', 'Giảng viên giàu kinh nghiệm')], // Should come from DB ideally
                        curriculum: [], // Should come from DB modules
                        fee: data.fee
                    });
                } catch (err) {
                    setError('Failed to load course details.');
                } finally {
                    setLoading(false);
                }
            } else {
                // Handle static IDs (topik, opic, etc.)
                const staticData = staticCourseData[id];
                if (staticData) {
                    setCourse(staticData);
                    setLoading(false);
                } else {
                    setError('Course not found');
                    setLoading(false);
                }
            }
        };

        fetchCourse();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    if (error || !course) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || 'Course not found'}</div>;

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
                                        ⏱️ {t('courseDetail.hours', 'Lịch học')}: {course.schedule || 'Linh hoạt'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Left Column - Course Info */}
                        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                            {/* About */}
                            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
                                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                                    <span className={`w-8 h-8 ${course.bgColor} rounded-lg flex items-center justify-center text-white text-sm`}>
                                        ℹ️
                                    </span>
                                    {t('courseDetail.about', 'Về khóa học')}
                                </h2>
                                <p className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                                    {course.fullDesc}
                                </p>
                            </div>

                            {/* Why Learn */}
                            {course.whyLearn && course.whyLearn.length > 0 && (
                                <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
                                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                                        {t('courseDetail.whyLearn', 'Tại sao nên học?')}
                                    </h2>
                                    <div className="space-y-3 sm:space-y-4">
                                        {course.whyLearn.map((reason, index) => (
                                            <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${course.bgColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base`}>
                                                    {index + 1}
                                                </div>
                                                <p className="text-gray-700 flex-1 pt-1.5 sm:pt-2 text-sm sm:text-base">{reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Enrollment Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl sticky top-24 border-t-4 border-primary-500">
                                <div className="text-center mb-4 sm:mb-6">
                                    <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">
                                        {course.fee ? `${course.fee.toLocaleString()} VND` : t('courseDetail.contactForPrice', 'Liên hệ')}
                                    </div>
                                    <p className="text-gray-500 text-sm sm:text-base">
                                        {t('courseDetail.flexibleSchedule', 'Lịch học linh hoạt')}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setIsContactModalOpen(true)}
                                    className={`w-full py-3 sm:py-4 bg-gradient-to-r ${course.color} text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 mb-3 text-sm sm:text-base`}
                                >
                                    {t('courseDetail.contactNow', 'Liên hệ tư vấn ngay')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />

            <Footer />
        </div>
    );
};

export default CourseDetail;
