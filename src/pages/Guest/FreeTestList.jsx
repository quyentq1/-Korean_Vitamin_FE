import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ipTracker from '../../utils/IPTracker';

const FreeTestList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [quota, setQuota] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuota();
    }, []);

    const loadQuota = async () => {
        setLoading(true);
        try {
            const quotaData = await ipTracker.checkQuota();
            setQuota(quotaData);
        } catch (error) {
            console.error('Error loading quota:', error);
        } finally {
            setLoading(false);
        }
    };

    const tests = [
        {
            id: 'test-1',
            title: t('freeTest.test1.title', 'TOPIK Level 1 - Cơ Bản'),
            description: t('freeTest.test1.desc', 'Kiểm tra kỹ năng nghe và đọc cơ bản'),
            duration: 60,
            totalQuestions: 40,
            sections: [
                { name: t('freeTest.listening', 'Nghe'), questions: 20 },
                { name: t('freeTest.reading', 'Đọc'), questions: 20 }
            ],
            icon: '📝',
            color: 'from-blue-500 to-blue-700'
        },
        {
            id: 'test-2',
            title: t('freeTest.test2.title', 'TOPIK Level 2 - Nâng Cao'),
            description: t('freeTest.test2.desc', 'Kiểm tra toàn diện: Nghe, Đọc, Viết'),
            duration: 90,
            totalQuestions: 42,
            sections: [
                { name: t('freeTest.listening', 'Nghe'), questions: 20 },
                { name: t('freeTest.reading', 'Đọc'), questions: 20 },
                { name: t('freeTest.writing', 'Viết'), questions: 2 }
            ],
            icon: '✍️',
            color: 'from-purple-500 to-purple-700'
        }
    ];

    const handleStartTest = (testId) => {
        if (!quota || !quota.hasQuota) {
            alert(t('freeTest.noQuota', 'Bạn đã hết lượt test miễn phí. Vui lòng liên hệ để làm thêm!'));
            return;
        }
        navigate(`/test-runner/${testId}`);
    };

    const isTestCompleted = (testId) => {
        if (!quota || !quota.testHistory) return false;
        return quota.testHistory.some(t => t.testId === testId && t.completed);
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
                        <div className="inline-flex items-center gap-3 bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-xl sm:text-2xl">🎯</span>
                                <span className="font-medium text-gray-700 text-sm sm:text-base">
                                    {t('freeTest.remaining', 'Còn lại')}:
                                </span>
                                <span className="text-xl sm:text-2xl font-bold text-primary-600">
                                    {quota?.remaining || 0}/{quota?.total || 2}
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
                            const completed = isTestCompleted(test.id);
                            const canTake = quota?.hasQuota || completed;

                            return (
                                <div
                                    key={test.id}
                                    className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    {/* Header */}
                                    <div className={`bg-gradient-to-r ${test.color} p-4 sm:p-6 text-white`}>
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
                                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-green-700 font-medium text-sm sm:text-base">
                                                    {t('freeTest.completed', 'Đã hoàn thành')}
                                                </span>
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <button
                                            onClick={() => handleStartTest(test.id)}
                                            disabled={!canTake}
                                            className={`w-full py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 text-sm sm:text-base ${canTake
                                                ? `bg-gradient-to-r ${test.color} text-white hover:shadow-xl transform hover:-translate-y-0.5`
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {completed
                                                ? t('freeTest.retake', 'Làm lại')
                                                : canTake
                                                    ? t('freeTest.start', 'Bắt đầu làm bài')
                                                    : t('freeTest.locked', 'Đã hết lượt')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* No Quota Warning */}
                    {quota && !quota.hasQuota && (
                        <div className="mt-8 sm:mt-12 max-w-2xl mx-auto bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-2xl p-6 sm:p-8 text-center">
                            <div className="text-4xl sm:text-5xl mb-4">🔒</div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                                {t('freeTest.noQuotaTitle', 'Bạn đã hoàn thành 2 bài test miễn phí!')}
                            </h3>
                            <p className="text-gray-700 mb-6 text-sm sm:text-base">
                                {t('freeTest.noQuotaDesc', 'Liên hệ với chúng tôi để mua gói test hoặc đăng ký khóa học để làm thêm nhiều bài test khác.')}
                            </p>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                            >
                                {t('freeTest.contactNow', 'Liên hệ ngay')} →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default FreeTestList;
