import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import examService from '../../services/examService';
import UpgradePopup from '../../components/UpgradePopup';

const TestRunner = () => {
    const { testId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUpgradePopup, setShowUpgradePopup] = useState(false);
    const [attemptId, setAttemptId] = useState(null);

    // Exam state
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Fetch & Start Exam
    useEffect(() => {
        const initExam = async () => {
            try {
                setLoading(true);
                // 1. Fetch Exam Details (Title, Description, etc. - Public info)
                // Note: Real API might separate "Details" from "Content/Questions"
                // Assuming startExam returns everything or we allow fetching details first.
                // For now, let's try starting it directly.

                const isGuest = !localStorage.getItem('token'); // Simple check

                // Start Exam Request
                const response = await examService.startExam(testId, isGuest);
                const attemptData = response;

                setAttemptId(attemptData.id);
                setTest(attemptData.exam); // Assuming BE returns exam inside attempt

                // Initialize answers if continuing (logic to be added later)
                // For now new attempt

            } catch (err) {
                console.error("Exam Start Error:", err);
                if (err.response && err.response.data && err.response.data.message && err.response.data.message.includes('LIMIT_EXCEEDED')) {
                    setShowUpgradePopup(true);
                } else {
                    setError('Không thể bắt đầu bài thi. Vui lòng thử lại.');
                }
            } finally {
                setLoading(false);
            }
        };

        initExam();
    }, [testId]);

    // Timer countdown
    useEffect(() => {
        if (!test) return;

        // Use test duration
        setTimeRemaining(test.durationMinutes * 60);

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 0) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [test]);

    // Anti-cheat: Disable copy/paste
    useEffect(() => {
        const disableCopyPaste = (e) => {
            e.preventDefault();
            return false;
        };

        document.addEventListener('copy', disableCopyPaste);
        document.addEventListener('cut', disableCopyPaste);
        document.addEventListener('paste', disableCopyPaste);

        return () => {
            document.removeEventListener('copy', disableCopyPaste);
            document.removeEventListener('cut', disableCopyPaste);
            document.removeEventListener('paste', disableCopyPaste);
        };
    }, []);

    // Anti-cheat: Warn on tab switch
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.warn('User switched tabs during exam!');
                // Optionally record this event or show warning
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleSubmit = async () => {
        if (!window.confirm(t('testRunner.confirmSubmit', 'Bạn có chắc muốn nộp bài?'))) {
            return;
        }

        setIsSubmitting(true);
        try {
            await examService.submitExam(attemptId);
            navigate(`/test-result/${testId}`, { state: { answers, score: null } }); // Redirect to result
        } catch (err) {
            alert('Lỗi nộp bài: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Đang tải đề thi...</p>
                </div>
            </div>
        );
    }

    if (showUpgradePopup) {
        return <UpgradePopup onClose={() => navigate('/')} />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Đã xảy ra lỗi</h2>
                    <p className="text-gray-600">{error}</p>
                    <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    if (!test) return null;

    // Helper to get current display logic
    // We assume backend returns `examQuestions` list.
    // Frontend needs to group them by section if structure differs?
    // Let's assume flattened structure for MVP or map it.
    // For now, I will wrap the flat questions into a single "Section" to reuse UI or adapt UI.

    // Quick Adapt: Map backend `test.examQuestions` to UI `currentQuestionData`
    const questions = test.examQuestions || [];
    const currentQuestionData = questions[currentQuestion];

    // Calculate progress
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Fixed Header */}
            <div className="fixed top-16 left-0 right-0 bg-white border-b shadow-sm z-40">
                <div className="container mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Test Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{test.title}</h1>
                            <div className="text-xs sm:text-sm text-gray-600 truncate">
                                {t('testRunner.question', 'Câu')} {currentQuestion + 1}/{questions.length}
                            </div>
                        </div>

                        {/* Timer */}
                        <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shrink-0 ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-sm sm:text-lg">{formatTime(timeRemaining)}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                            className="bg-primary-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow pt-32 sm:pt-36 pb-24">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8">
                        {/* Question */}
                        <div className="mb-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-primary-100 text-primary-700 font-bold px-2 py-1 sm:px-3 rounded-lg text-xs sm:text-sm shrink-0">
                                    Q{currentQuestion + 1}
                                </div>
                                <div className="flex-1">
                                    {/* Question Text from BE */}
                                    <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
                                        {currentQuestionData?.question?.content}
                                    </p>
                                </div>
                            </div>

                            {/* Audio Player for Listening */}
                            {currentQuestionData?.question?.audioUrl && (
                                <div className="mb-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                                    <audio controls className="w-full">
                                        <source src={currentQuestionData.question.audioUrl} type="audio/mpeg" />
                                    </audio>
                                </div>
                            )}

                            {/* Answer Options */}
                            {currentQuestionData?.question?.questionType === 'ESSAY' ? (
                                <textarea
                                    value={answers[currentQuestionData.id] || ''}
                                    onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
                                    className="w-full h-48 sm:h-64 p-3 sm:p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none text-sm sm:text-base"
                                    placeholder={t('testRunner.writePlaceholder', 'Nhập câu trả lời của bạn...')}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {/* Assuming Options are loaded or part of Question Object */}
                                    {/* Check if options exist in question object (BE usually sends them if Type is MC) */}
                                    {/* For MVP, let's assume options are in currentQuestionData.question.options */}
                                    {/* NOTE: Teacher Controller logic showed: question.setOptions() */}
                                    {currentQuestionData?.question?.options?.map((option) => (
                                        <label
                                            key={option.id}
                                            className={`flex items-center gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${answers[currentQuestionData.id] === option.id
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${currentQuestionData.id}`}
                                                value={option.id}
                                                checked={answers[currentQuestionData.id] === option.id} // Storing Option ID
                                                onChange={() => handleAnswerChange(currentQuestionData.id, option.id)}
                                                className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 shrink-0"
                                            />
                                            <span className="font-bold text-gray-700 text-sm sm:text-base">{option.optionLabel}</span>
                                            <span className="text-gray-600 text-sm sm:text-base">{option.content}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-6 border-t gap-3">
                            <button
                                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestion === 0}
                                className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                ← {t('testRunner.previous', 'Trước')}
                            </button>

                            {currentQuestion === questions.length - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 text-sm sm:text-base"
                                >
                                    {isSubmitting ? t('testRunner.submitting', 'Đang nộp...') : t('testRunner.submit', 'Nộp bài')}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 text-sm sm:text-base"
                                >
                                    {t('testRunner.next', 'Sau')} →
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Question Navigator */}
                    <div className="max-w-4xl mx-auto mt-6 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">{t('testRunner.questionNav', 'Danh sách câu hỏi')}</h3>
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                            {questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestion(idx)}
                                    className={`aspect-square rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center justify-center ${idx === currentQuestion
                                        ? 'bg-primary-600 text-white'
                                        : answers[q.id]
                                            ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestRunner;
