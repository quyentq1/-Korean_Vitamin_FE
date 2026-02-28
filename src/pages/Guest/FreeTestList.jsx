import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ConsultationPopup from '../../components/ConsultationPopup';
import { useAuth } from '../../contexts/AuthContext';
import useTestTracking from '../../hooks/useTestTracking';
import consultationService from '../../services/consultationService';
import examPublicService from '../../services/examPublicService';

const FreeTestList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [showConsultationPopup, setShowConsultationPopup] = useState(false);

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

    // Use tracking hook instead of IPTracker
    const {
        loading,
        remainingFreeTests,
        hasQuota,
        hasCompletedTest,
    } = useTestTracking();

    const [tests, setTests] = useState([]);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const examData = await examPublicService.getGuestExams();

                if (!examData || examData.length === 0) {
                    // API returned empty - no published exams yet, show empty state
                    setTests([]);
                    return;
                }

                // Transform backend data to fit UI
                const formattedTests = examData.map(exam => ({
                    id: exam.id,
                    title: exam.title,
                    description: exam.description || t('freeTest.desc', 'Chưa có mô tả chi tiết'),
                    duration: exam.durationMinutes,
                    totalQuestions: exam.totalPoints,
                    sections: [
                        { name: t('freeTest.listening', 'Nghe'), questions: Math.floor((exam.totalPoints || 0) / 2) },
                        { name: t('freeTest.reading', 'Đọc'), questions: Math.ceil((exam.totalPoints || 0) / 2) }
                    ],
                    icon: exam.id % 2 === 0 ? '✍️' : '📝',
                    color: exam.id % 2 === 0 ? 'from-secondary-500 to-secondary-700' : 'from-primary-500 to-primary-700'
                }));
                setTests(formattedTests);
            } catch (error) {
                console.error("Lỗi lấy danh sách đề thi:", error);
                // Do NOT use mock data with fake IDs — just show empty state
                setTests([]);
            }
        };
        fetchExams();
    }, [t]);

    const handleStartTest = (testId, index) => {
        const completed = hasCompletedTest(testId);

        // If test is beyond free quota and not completed, show consultation popup
        if (index >= 2 && !completed) {
            setShowConsultationPopup(true);
            return;
        }

        // BUG-01 FIX: /test-runner is now a public route, no login required
        navigate(`/test-runner/${testId}`);
    };

    const handleConsultationSubmit = async (formData) => {
        // BUG-02 FIX: Send to real backend API
        await consultationService.submitConsultation(formData);
        setShowConsultationPopup(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <Navbar />
                <div className="pt-20 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">{t('common.loading', 'Đang tải...')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Hero Section */}
                    <div className="text-center mb-8 sm:mb-12">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                            {t('freeTest.title', 'Bài Test Miễn Phí')}
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 mb-6">
                            {t('freeTest.subtitle', 'Làm thử 2 bài test miễn phí để đánh giá trình độ của bạn')}
                        </p>

                        {/* Quota Display */}
                        <div className="inline-flex items-center gap-3 bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg border-2 border-primary-200">
                            <div className="flex items-center gap-2">
                                <span className="text-xl sm:text-2xl">🎯</span>
                                <span className="font-medium text-gray-700 text-sm sm:text-base">
                                    {t('freeTest.remaining', 'Còn lại')}:
                                </span>
                                <span className="text-xl sm:text-2xl font-bold text-primary-600">
                                    {remainingFreeTests}/2
                                </span>
                                <span className="text-gray-600 text-sm sm:text-base">
                                    {t('freeTest.tests', 'bài test')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Test Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
                        {tests.map((test, index) => {
                            const completed = hasCompletedTest(test.id);
                            const isLocked = index >= 2 && !hasQuota && !completed;
                            const canTake = index < 2 || hasQuota || completed;

                            return (
                                <div
                                    key={test.id}
                                    className={`bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${isLocked
                                        ? 'opacity-75 transform scale-95'
                                        : 'hover:shadow-2xl hover:-translate-y-1'
                                        }`}
                                >
                                    {/* Header */}
                                    <div className={`bg-gradient-to-r ${test.color} p-4 sm:p-6 text-white relative`}>
                                        {isLocked && (
                                            <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                                <span className="text-xs font-bold">🔒 ĐÃ KHÓA</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-3xl sm:text-4xl">{test.icon}</span>
                                            <div>
                                                <div className="text-xs sm:text-sm opacity-90">
                                                    {t('freeTest.testNumber', 'Bài Test')} {index + 1}
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-bold">{test.title}</h3>
                                            </div>
                                        </div>
                                        <p className="text-white/90 text-sm sm:text-base">{test.description}</p>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 sm:p-6">
                                        {/* Test Info */}
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-gray-600 text-sm sm:text-base">{test.duration} {t('common.minutes', 'phút')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span className="text-gray-600 text-sm sm:text-base">{test.totalQuestions} {t('common.questions', 'câu hỏi')}</span>
                                            </div>
                                        </div>

                                        {/* Sections */}
                                        <div className="space-y-2 mb-6">
                                            {test.sections.map((section, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm sm:text-base">
                                                    <span className="font-medium text-gray-700">{section.name}</span>
                                                    <span className="text-primary-600 font-bold">{section.questions} {t('common.questions', 'câu')}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Status Badge */}
                                        {completed && (
                                            <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg flex items-center gap-2">
                                                <svg className="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-success-700 font-medium text-sm sm:text-base">
                                                    {t('freeTest.completed', 'Đã hoàn thành')}
                                                </span>
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <button
                                            onClick={() => handleStartTest(test.id, index)}
                                            className={`w-full py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 text-sm sm:text-base ${isLocked
                                                ? 'bg-gray-300 text-gray-600 cursor-pointer hover:bg-gray-400'
                                                : canTake
                                                    ? `bg-gradient-to-r ${test.color} text-white hover:shadow-xl transform hover:-translate-y-0.5`
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {isLocked ? (
                                                <>🔒 {t('freeTest.requestAccess', 'Yêu Cầu Truy Cập')}</>
                                            ) : completed ? (
                                                t('freeTest.retake', 'Làm lại')
                                            ) : canTake ? (
                                                t('freeTest.start', 'Bắt đầu làm bài')
                                            ) : (
                                                t('freeTest.locked', 'Đã hết lượt')
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* No Quota Info */}
                    {!hasQuota && (
                        <div className="mt-8 sm:mt-12 max-w-2xl mx-auto bg-gradient-to-r from-warning-50 to-warning-100 border-2 border-warning-300 rounded-2xl p-6 sm:p-8 text-center">
                            <div className="text-4xl sm:text-5xl mb-4">🎓</div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                                {t('freeTest.noQuotaTitle', 'Bạn đã hoàn thành 2 bài test miễn phí!')}
                            </h3>
                            <p className="text-gray-700 mb-6 text-sm sm:text-base">
                                {t('freeTest.noQuotaDesc', 'Click "Yêu Cầu Truy Cập" trên bất kỳ test nào để liên hệ tư vấn.')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Consultation Popup */}
            <ConsultationPopup
                isOpen={showConsultationPopup}
                onClose={() => setShowConsultationPopup(false)}
                onSubmit={handleConsultationSubmit}
            />

            <Footer />
        </div>
    );
};

export default FreeTestList;

