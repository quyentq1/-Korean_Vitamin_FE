import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import UpgradeModal from '../../components/UpgradeModal';
import ipTracker from '../../utils/IPTracker';

const TestResult = () => {
    const { testId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [quota, setQuota] = useState(null);

    // Mock result data - in real app, calculate from backend
    const result = {
        score: 75,
        totalQuestions: 40,
        correctAnswers: 30,
        sections: [
            { name: t('testResult.listening', 'Nghe'), score: 80, total: 20, correct: 16 },
            { name: t('testResult.reading', 'Đọc'), score: 70, total: 20, correct: 14 }
        ],
        aiFeedback: {
            strengths: [
                t('testResult.strength1', 'Kỹ năng nghe tốt, bắt được ý chính'),
                t('testResult.strength2', 'Từ vựng cơ bản vững chắc')
            ],
            weaknesses: [
                t('testResult.weakness1', 'Cần cải thiện ngữ pháp câu phức'),
                t('testResult.weakness2', 'Đọc hiểu văn bản dài cần luyện tập thêm')
            ],
            recommendations: [
                t('testResult.rec1', 'Học thêm về cấu trúc câu nâng cao'),
                t('testResult.rec2', 'Đọc nhiều bài báo, truyện ngắn tiếng Hàn'),
                t('testResult.rec3', 'Luyện tập với bài test khó hơn')
            ]
        }
    };

    useEffect(() => {
        checkQuotaAndShowModal();
    }, []);

    const checkQuotaAndShowModal = async () => {
        const quotaData = await ipTracker.checkQuota();
        setQuota(quotaData);

        // Show upgrade modal if used all free tests
        if (await ipTracker.shouldShowUpgradePopup()) {
            setTimeout(() => setShowUpgradeModal(true), 1000);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score) => {
        if (score >= 80) return 'from-green-500 to-green-600';
        if (score >= 60) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">
                            {result.score >= 80 ? '🎉' : result.score >= 60 ? '👍' : '📚'}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                            {t('testResult.title', 'Kết Quả Bài Test')}
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600">
                            {result.score >= 80
                                ? t('testResult.excellent', 'Xuất sắc! Bạn đã làm rất tốt!')
                                : result.score >= 60
                                    ? t('testResult.good', 'Tốt! Tiếp tục cố gắng!')
                                    : t('testResult.needImprovement', 'Cần cải thiện. Đừng bỏ cuộc!')}
                        </p>
                    </div>

                    {/* Overall Score Card */}
                    <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
                            <div className={`bg-gradient-to-r ${getScoreBgColor(result.score)} p-6 sm:p-8 text-white`}>
                                <div className="text-center">
                                    <div className="text-6xl sm:text-7xl font-bold mb-2">{result.score}%</div>
                                    <div className="text-xl sm:text-2xl">{result.correctAnswers}/{result.totalQuestions} {t('testResult.correct', 'câu đúng')}</div>
                                </div>
                            </div>

                            {/* Section Breakdown */}
                            <div className="p-4 sm:p-8">
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                                    {t('testResult.breakdown', 'Chi Tiết Theo Phần')}
                                </h3>
                                <div className="space-y-4">
                                    {result.sections.map((section, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm sm:text-base">{section.name}</h4>
                                                <p className="text-xs sm:text-sm text-gray-600">
                                                    {section.correct}/{section.total} {t('testResult.questions', 'câu hỏi')}
                                                </p>
                                            </div>
                                            <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(section.score)}`}>
                                                {section.score}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Feedback */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl">
                                    🤖
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {t('testResult.aiFeedback', 'AI Phân Tích & Nhận Xét')}
                                </h3>
                            </div>

                            {/* Strengths */}
                            <div className="mb-6">
                                <h4 className="flex items-center gap-2 font-bold text-green-700 mb-3 text-sm sm:text-base">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {t('testResult.strengths', 'Điểm Mạnh')}
                                </h4>
                                <ul className="space-y-2">
                                    {result.aiFeedback.strengths.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                                            <span className="text-green-500 mt-1">✓</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="mb-6">
                                <h4 className="flex items-center gap-2 font-bold text-orange-700 mb-3 text-sm sm:text-base">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {t('testResult.weaknesses', 'Điểm Cần Cải Thiện')}
                                </h4>
                                <ul className="space-y-2">
                                    {result.aiFeedback.weaknesses.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                                            <span className="text-orange-500 mt-1">⚠</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Recommendations */}
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-blue-700 mb-3 text-sm sm:text-base">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {t('testResult.recommendations', 'Khuyến Nghị Học Tập')}
                                </h4>
                                <ul className="space-y-2">
                                    {result.aiFeedback.recommendations.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                                            <span className="text-blue-500 mt-1">→</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="max-w-4xl mx-auto mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <button
                            onClick={() => navigate('/free-tests')}
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-xl transition-all text-sm sm:text-base"
                        >
                            {t('testResult.backToTests', 'Quay Lại Danh Sách Test')}
                        </button>

                        {quota && quota.hasQuota && (
                            <button
                                onClick={() => navigate(`/test-runner/${testId}`)}
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-primary-500 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-all text-sm sm:text-base"
                            >
                                {t('testResult.retake', 'Làm Lại Bài Test')}
                            </button>
                        )}

                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-xl transition-all text-sm sm:text-base"
                        >
                            {t('testResult.upgrade', 'Nâng Cấp Tài Khoản')}
                        </button>
                    </div>
                </div>
            </div>

            <Footer />

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                testsTaken={quota?.completed || 0}
            />
        </div>
    );
};

export default TestResult;
