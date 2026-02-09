import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import UpgradeModal from '../../components/UpgradeModal';
import ipTracker from '../../utils/IPTracker';

const TestResult = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { width, height } = useWindowSize();

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [quota, setQuota] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // Mock result data 
    const result = {
        score: 85,
        totalQuestions: 40,
        correctAnswers: 34,
        sections: [
            { name: t('testResult.listening', 'Nghe Hiểu (듣기)'), score: 90, total: 20, correct: 18 },
            { name: t('testResult.reading', 'Đọc Hiểu (읽기)'), score: 80, total: 20, correct: 16 }
        ],
        aiFeedback: {
            strengths: [
                t('testResult.strength1', 'Khả năng bắt từ khóa trong bài nghe rất tốt.'),
                t('testResult.strength2', 'Vốn từ vựng chủ đề "Sinh hoạt hàng ngày" phong phú.')
            ],
            weaknesses: [
                t('testResult.weakness1', 'Còn gặp khó khăn với cấu trúc câu phủ định kép.'),
                t('testResult.weakness2', 'Tốc độ đọc hiểu văn bản dài cần cải thiện.')
            ],
            recommendations: [
                t('testResult.rec1', 'Ôn tập lại ngữ pháp bài 15-20 (giáo trình Vitamin 2).'),
                t('testResult.rec2', 'Luyện nghe thụ động podcast tiếng Hàn mỗi ngày 15 phút.'),
                t('testResult.rec3', 'Thực hành đọc nhanh (skimming) các bài báo ngắn.')
            ]
        }
    };

    useEffect(() => {
        checkQuotaAndShowModal();
        if (result.score >= 80) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 8000);
        }
    }, []);

    const checkQuotaAndShowModal = async () => {
        const quotaData = await ipTracker.checkQuota();
        setQuota(quotaData);

        if (await ipTracker.shouldShowUpgradePopup()) {
            setTimeout(() => setShowUpgradeModal(true), 2000);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600';
        if (score >= 60) return 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600';
        return 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600';
    };

    const getScoreBgColor = (score) => {
        if (score >= 80) return 'from-green-500 to-emerald-600 shadow-green-500/30';
        if (score >= 60) return 'from-yellow-400 to-orange-500 shadow-orange-500/30';
        return 'from-red-500 to-pink-600 shadow-red-500/30';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-x-hidden">
            <Navbar />
            {showConfetti && <Confetti width={width / 1.1} height={height} numberOfPieces={200} recycle={false} />}

            <main className="flex-1 pt-24 pb-20">
                <div className="container mx-auto px-4 sm:px-6 max-w-5xl">

                    {/* Hero Section */}
                    <div className="text-center mb-12 animate-fade-in-up">
                        <div className="inline-block p-4 rounded-full bg-white shadow-xl mb-6 transform hover:scale-110 transition duration-300">
                            <span className="text-6xl filter drop-shadow-md">
                                {result.score >= 80 ? '🏆' : result.score >= 60 ? '🌟' : '💪'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            {result.score >= 80
                                ? t('testResult.excellent', 'Tuyệt Vời! Kết Quả Xuất Sắc')
                                : result.score >= 60
                                    ? t('testResult.good', 'Làm Tốt Lắm! Kết Quả Khả Quan')
                                    : t('testResult.needImprovement', 'Đừng Nản Chí! Hãy Cố Gắng Hơn')}
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            {t('testResult.subtitle', 'Bạn đã hoàn thành bài kiểm tra. Dưới đây là phân tích chi tiết về hiệu suất của bạn.')}
                        </p>
                    </div>

                    {/* Main Score Card */}
                    <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden mb-12 transform hover:scale-[1.01] transition duration-500 border border-gray-100 animate-slide-up">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Left: Score Visual */}
                            <div className={`relative p-10 flex flex-col items-center justify-center text-white bg-gradient-to-br ${getScoreBgColor(result.score)}`}>
                                <div className="text-center z-10">
                                    <span className="block text-2xl font-medium opacity-90 mb-2 uppercase tracking-widest">{t('testResult.totalScore', 'Tổng Điểm')}</span>
                                    <div className="text-8xl font-black tracking-tighter mb-4 filter drop-shadow-lg">
                                        {result.score}<span className="text-4xl align-top opacity-80">%</span>
                                    </div>
                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
                                        <span className="font-bold text-lg">{result.correctAnswers}/{result.totalQuestions}</span>
                                        <span className="text-sm opacity-90">{t('testResult.correct', 'Câu Đúng')}</span>
                                    </div>
                                </div>
                                {/* Decorative circles */}
                                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl translate-x-1/3 translate-y-1/3"></div>
                            </div>

                            {/* Right: Breakdown */}
                            <div className="p-10 flex flex-col justify-center">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    📊 {t('testResult.breakdown', 'Chi Tiết Kỹ Năng')}
                                </h3>
                                <div className="space-y-6">
                                    {result.sections.map((section, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="font-bold text-gray-700 text-lg">{section.name}</span>
                                                <span className={`font-black text-xl ${getScoreColor(section.score)}`}>
                                                    {section.score}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getScoreBgColor(section.score)}`}
                                                    style={{ width: `${section.score}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1 text-right">
                                                {section.correct}/{section.total} câu đúng
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Feedback Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        {/* Strengths */}
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-3xl mb-6 text-green-600">
                                ⭐
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('testResult.strengths', 'Điểm Mạnh')}</h3>
                            <ul className="space-y-4">
                                {result.aiFeedback.strengths.map((item, idx) => (
                                    <li key={idx} className="flex gap-3 text-gray-700 group">
                                        <span className="mt-1 w-5 h-5 flex items-center justify-center bg-green-500 text-white rounded-full text-xs shrink-0 group-hover:scale-110 transition">✓</span>
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mb-6 text-orange-600">
                                🎯
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('testResult.weaknesses', 'Cần Cải Thiện')}</h3>
                            <ul className="space-y-4">
                                {result.aiFeedback.weaknesses.map((item, idx) => (
                                    <li key={idx} className="flex gap-3 text-gray-700 group">
                                        <span className="mt-1 w-5 h-5 flex items-center justify-center bg-orange-500 text-white rounded-full text-xs shrink-0 group-hover:scale-110 transition">!</span>
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-gradient-to-b from-blue-50 to-white rounded-3xl shadow-lg border border-blue-100 p-8 hover:shadow-xl transition duration-300 animate-slide-up lg:col-span-1" style={{ animationDelay: '0.3s' }}>
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-6 text-blue-600">
                                💡
                            </div>
                            <h3 className="text-xl font-bold text-blue-900 mb-4">{t('testResult.recTitle', 'Gợi Ý Từ AI')}</h3>
                            <ul className="space-y-4">
                                {result.aiFeedback.recommendations.map((item, idx) => (
                                    <li key={idx} className="flex gap-3 text-gray-700 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                        <span className="mt-1 text-blue-500 font-bold">→</span>
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        {quota && quota.hasQuota && (
                            <button
                                onClick={() => navigate(`/test-runner/${testId}`)}
                                className="px-8 py-4 bg-white border-2 border-primary-500 text-primary-600 rounded-2xl font-bold hover:bg-primary-50 transition transform hover:-translate-y-1 text-lg shadow-sm"
                            >
                                🔄 {t('testResult.retake', 'Làm Lại Bài Test')}
                            </button>
                        )}

                        <button
                            onClick={() => navigate('/free-tests')}
                            className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition transform hover:-translate-y-1 text-lg"
                        >
                            🔎 {t('testResult.findMore', 'Tìm Bài Test Khác')}
                        </button>

                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
                        >
                            <span>👑</span> {t('testResult.upgrade', 'Nâng Cấp VIP Ngay')}
                        </button>
                    </div>
                </div>
            </main>

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
