import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import examPublicService from '../../services/examPublicService'; // Use public service for free tests
import useExamSecurity from '../../hooks/useExamSecurity';
import useExamTimer from '../../hooks/useExamTimer';
import useTestTracking from '../../hooks/useTestTracking';

const TestRunner = () => {
    const { testId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { recordTestCompletion } = useTestTracking();

    const [test, setTest] = useState(null);
    const [attemptId, setAttemptId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCheatWarning, setShowCheatWarning] = useState(false);

    // Security Hook
    const { violationCount, resetViolations } = useExamSecurity((type) => {
        setShowCheatWarning(true);
        // Hide warning after 3s
        setTimeout(() => setShowCheatWarning(false), 3000);
    });

    // Timer Hook (Initialized after test loads)
    const { formattedTime, startTimer, stopTimer, progress: timeProgress } = useExamTimer(
        test ? test.duration : 0, // Duration in minutes
        () => handleSubmit(true) // Auto-submit on time up
    );

    // Initial Load
    useEffect(() => {
        const initTest = async () => {
            try {
                setLoading(true);
                // Call real API: Start exam attempt
                const attemptData = await examPublicService.startGuestExam(testId);

                setAttemptId(attemptData.id);

                const examObj = attemptData.exam;
                if (!examObj || !examObj.examQuestions) {
                    throw new Error("Dữ liệu đề thi không hợp lệ từ máy chủ");
                }

                // Transform BE format to UI format
                const formattedTest = {
                    id: examObj.id,
                    title: examObj.title,
                    duration: examObj.durationMinutes,
                    questions: examObj.examQuestions.map(eq => ({
                        examQuestionId: eq.id,
                        id: eq.question.id,
                        content: eq.question.questionText,
                        type: eq.question.questionType === 'LISTENING' ? 'LC' : 'RC',
                        audioUrl: eq.question.questionMediaUrl,
                        options: eq.question.options.map(opt => ({
                            id: opt.id,
                            content: opt.optionText
                        }))
                    }))
                };

                setTest(formattedTest);

            } catch (error) {
                console.error("Error loading test:", error);
                if (error?.status === 400 && error.message?.includes('LIMIT_EXCEEDED')) {
                    alert('Bạn đã hết lượt làm bài miễn phí (2/2). Vui lòng để lại thông tin tư vấn!');
                } else {
                    alert("Không thể tải bài thi. Vui lòng thử lại sau.");
                }
                navigate('/free-tests');
            } finally {
                setLoading(false);
            }
        };

        if (testId) {
            initTest();
        }
    }, [testId, navigate]);

    // Start timer when test is loaded
    useEffect(() => {
        if (test) {
            startTimer();
        }
        return () => stopTimer();
    }, [test]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAnswerChange = async (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));

        // Find examQuestionId to submit
        const qData = test.questions.find(q => q.id === questionId);
        if (qData && attemptId) {
            try {
                // Save answer directly to backend
                // Optional text value can be used if it's not a standard multiple choice ID
                await examPublicService.submitAnswer(attemptId, qData.examQuestionId, value);
            } catch (error) {
                console.error("Failed to save answer silently:", error);
                // We don't block UI if silent save fails, but in production we'd queue retries
            }
        }
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (!autoSubmit && !window.confirm(t('testRunner.confirmSubmit', 'Bạn có chắc chắn muốn nộp bài?'))) {
            return;
        }

        setIsSubmitting(true);
        stopTimer();

        try {
            // Record completion locally to trigger Consultation popup on FreeTestList page later
            recordTestCompletion(testId, Object.keys(answers), 0);

            // Call API to fully submit exam and calculate grade
            const finalAttempt = await examPublicService.submitExam(attemptId);

            // Navigate to results
            navigate(`/test-result/${testId}`, {
                state: {
                    attemptId: attemptId,
                    finalAttempt: finalAttempt,
                    totalQuestions: test.questions.length,
                    violations: violationCount
                }
            });

        } catch (error) {
            console.error("Submit error:", error);
            alert("Lỗi nộp bài. Vui lòng kiểm tra đường truyền mạng.");
            setIsSubmitting(false);
        }
    };

    if (loading || !test) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Đang tải đề thi...</p>
                </div>
            </div>
        );
    }

    const currentQuestionData = test.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / test.questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col select-none">
            {/* Header - Minimalist for focus */}
            <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 h-16 sm:h-20">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold">
                            Q{currentQuestion + 1}
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 line-clamp-1">{test.title}</h1>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{answeredCount}/{test.questions.length} đã làm</span>
                                {violationCount > 0 && (
                                    <span className="text-red-500 font-bold">
                                        ⚠️ {violationCount} vi phạm
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Timer */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${Number(formattedTime.split(':')[0]) < 5
                            ? 'bg-red-50 text-red-600 animate-pulse'
                            : 'bg-gray-100 text-gray-700'
                            }`}>
                            <span>⏱️</span>
                            {formattedTime}
                        </div>

                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={isSubmitting}
                            className="hidden sm:block px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition shadow-md"
                        >
                            {isSubmitting ? 'Đang nộp...' : 'Nộp Bài'}
                        </button>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
                    <div
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Cheat Warning Overlay */
                showCheatWarning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <div className="bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce font-bold text-lg">
                            ⚠️ CẢNH BÁO: Phát hiện hành vi gian lận!
                        </div>
                    </div>
                )}

            {/* Main Content */}
            <main className="flex-grow pt-24 sm:pt-32 pb-24 container mx-auto px-4 sm:px-6 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 min-h-[400px]">
                    {/* Question Content */}
                    <div className="mb-8">
                        {currentQuestionData.type === 'LC' && (
                            <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-3 mb-2 font-bold text-blue-800">
                                    <span>🔊</span>
                                    <span>Phần Nghe</span>
                                </div>
                                <audio controls className="w-full">
                                    <source src={currentQuestionData.audioUrl || "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}

                        <div className="text-lg sm:text-xl text-gray-800 leading-relaxed font-medium">
                            {currentQuestionData.content}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestionData.options.map((option) => (
                            <label
                                key={option.id}
                                className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${answers[currentQuestionData.id] === option.id
                                    ? 'border-primary-500 bg-primary-50/50'
                                    : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${answers[currentQuestionData.id] === option.id
                                    ? 'border-primary-500 bg-primary-500'
                                    : 'border-gray-300 group-hover:border-primary-400'
                                    }`}>
                                    {answers[currentQuestionData.id] === option.id && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <span className={`text-base sm:text-lg ${answers[currentQuestionData.id] === option.id ? 'text-primary-900 font-medium' : 'text-gray-700'
                                    }`}>
                                    {option.content}
                                </span>
                                <input
                                    type="radio"
                                    name={`q-${currentQuestionData.id}`}
                                    className="hidden"
                                    checked={answers[currentQuestionData.id] === option.id}
                                    onChange={() => handleAnswerChange(currentQuestionData.id, option.id)}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Question Navigation Grid - Mobile Details */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Danh sách câu hỏi</h3>
                    <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-2">
                        {test.questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestion(idx)}
                                className={`h-8 rounded-lg text-xs font-bold transition-colors ${idx === currentQuestion
                                    ? 'bg-primary-600 text-white'
                                    : answers[q.id]
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
                <div className="container mx-auto flex items-center justify-between gap-4 max-w-4xl">
                    <button
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        ← {t('testRunner.prev', 'Trước')}
                    </button>

                    <span className="text-sm font-medium text-gray-500 hidden sm:block">
                        {t('testRunner.selectAnswer', 'Chọn đáp án đúng nhất')}
                    </span>

                    <div className="flex gap-3">
                        {currentQuestion === test.questions.length - 1 ? (
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 sm:hidden"
                            >
                                Nộp Bài
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestion(prev => Math.min(test.questions.length - 1, prev + 1))}
                                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                            >
                                {t('testRunner.next', 'Tiếp theo')} →
                            </button>
                        )}

                        {/* Desktop Submit Button in Header, Mobile Logic Handled above */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestRunner;

