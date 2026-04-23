import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import examPublicService from '../../services/examPublicService';
import useExamSecurity from '../../hooks/useExamSecurity';
import useExamTimer from '../../hooks/useExamTimer';
import useTestTracking from '../../hooks/useTestTracking';
import { useGuestContext } from '../../hooks/useGuestContext';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

const TestRunner = () => {
    const { testId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { recordTestCompletion, handleLimitExceeded } = useTestTracking();
    const { recordTestCompletion: recordGuestCompletion } = useGuestContext();
    const { isAuthenticated } = useAuth();

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
        setTimeout(() => setShowCheatWarning(false), 3000);
    });

    // Timer Hook
    const { formattedTime, startTimer, stopTimer, progress: timeProgress } = useExamTimer(
        test ? test.duration : 0,
        () => handleSubmit(true)
    );

    // Initial Load
    useEffect(() => {
        const initTest = async () => {
            try {
                setLoading(true);
                const attemptData = await examPublicService.startGuestExam(testId);

                setAttemptId(attemptData.id);

                const examObj = attemptData.exam;
                if (!examObj || !examObj.examQuestions) {
                    throw new Error("Dữ liệu đề thi không hợp lệ từ máy chủ");
                }

                const formattedTest = {
                    id: examObj.id,
                    title: examObj.title,
                    duration: examObj.durationMinutes,
                    courseId: examObj.course?.id || null,
                    questions: examObj.examQuestions.map(eq => ({
                        examQuestionId: eq.id,
                        id: eq.question.id,
                        content: eq.question.questionText,
                        type: eq.question.questionType === 'LISTENING' ? 'LC' : 'RC',
                        audioUrl: eq.question.questionMediaUrl,
                        imageUrl: eq.question.imageUrl || null,
                        options: eq.question.options.map(opt => ({
                            id: opt.id,
                            content: opt.optionText
                        }))
                    }))
                };

                setTest(formattedTest);

            } catch (error) {
                console.error("Error loading test:", error);

                let errorMessage = "Không thể tải bài thi. ";

                if (error.isNetworkError) {
                    errorMessage += error.isTimeout
                        ? "Yêu cầu quá thời gian. Vui lòng thử lại."
                        : "Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng.";
                } else if (error.isServerError) {
                    errorMessage += "Lỗi máy chủ. Vui lòng thử lại sau.";
                } else if (error.isClientError) {
                    if (error.status === 400) {
                        if (error.details?.code === 'LIMIT_EXCEEDED' || error.message?.includes('LIMIT_EXCEEDED')) {
                            handleLimitExceeded();

                            Swal.fire({
                                icon: 'warning',
                                title: 'Đã hết lượt miễn phí!',
                                text: 'Bạn đã dùng hết 2 lượt thi miễn phí. Vui lòng đăng ký tài khoản để tiếp tục học.',
                                confirmButtonText: 'Đăng ký ngay',
                                cancelButtonText: 'Về trang chủ',
                                showCancelButton: true,
                                confirmButtonColor: '#3b82f6',
                                cancelButtonColor: '#6b7280',
                                reverseButtons: true
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    navigate('/signup');
                                } else {
                                    navigate('/free-tests');
                                }
                            });
                            return;
                        }
                        errorMessage += "Dữ liệu không hợp lệ.";
                    } else if (error.status === 404) {
                        errorMessage += "Không tìm thấy bài thi này.";
                    } else {
                        errorMessage += error.message || "Vui lòng thử lại.";
                    }
                } else {
                    errorMessage += error.message || "Vui lòng thử lại.";
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Không thể tải bài thi',
                    text: errorMessage,
                    confirmButtonText: 'Về trang chủ',
                    confirmButtonColor: '#3b82f6'
                }).then(() => {
                    navigate('/free-tests');
                });
            } finally {
                setLoading(false);
            }
        };

        if (testId) {
            initTest();
        }
    }, [testId, navigate]);

    // Start timer and enter fullscreen when test loads
    useEffect(() => {
        if (test) {
            startTimer();
            document.documentElement.requestFullscreen().catch(() => { });
        }
        return () => stopTimer();
    }, [test]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAnswerChange = async (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));

        const qData = test.questions.find(q => q.id === questionId);
        if (qData && attemptId) {
            try {
                await examPublicService.submitAnswer(attemptId, qData.examQuestionId, value);
            } catch (error) {
                console.error("Failed to save answer silently:", error);
            }
        }
    };

    const handleSubmit = async (autoSubmit = false) => {
        const showConfirmAndSubmit = async () => {
            const result = await Swal.fire({
                icon: 'question',
                title: 'Xác nhận nộp bài',
                text: 'Bạn có chắc chắn muốn nộp bài? Hành động này không thể hoàn tác.',
                showCancelButton: true,
                confirmButtonText: 'Nộp bài',
                cancelButtonText: 'Làm tiếp',
                confirmButtonColor: '#22c55e',
                cancelButtonColor: '#6b7280',
                reverseButtons: true
            });

            if (result.isConfirmed) {
                await performSubmit();
            }
        };

        const performSubmit = async () => {
            setIsSubmitting(true);
            stopTimer();
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }

            try {
                const finalAttempt = await examPublicService.submitExam(attemptId);

                const score = finalAttempt.autoScore ? Math.floor(finalAttempt.autoScore) :
                    finalAttempt.totalScore ? Math.floor(finalAttempt.totalScore) : 0;
                const correctAnswers = finalAttempt.correctAnswers || 0;

                recordTestCompletion(testId, Object.keys(answers), score, attemptId);

                if (!isAuthenticated && finalAttempt) {
                    recordGuestCompletion(
                        testId,
                        attemptId,
                        test.id,
                        score,
                        correctAnswers
                    );
                }

                navigate(`/test-result/${testId}`, {
                    state: {
                        attemptId: attemptId,
                        finalAttempt: finalAttempt,
                        totalQuestions: test.questions.length,
                        questions: test.questions,
                        violations: violationCount,
                        courseId: test.courseId
                    }
                });

            } catch (error) {
                console.error("Submit error", error);

                let errorMessage = "Lỗi nộp bài. ";

                if (error.isNetworkError) {
                    errorMessage += error.isTimeout
                        ? "Yêu cầu quá thời gian. Vui lòng thử lại."
                        : "Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng.";
                } else if (error.isServerError) {
                    errorMessage += "Lỗi máy chủ. Vui lòng thử lại sau.";
                } else if (error.isClientError) {
                    if (error.status === 400) {
                        if (error.details?.code === 'LIMIT_EXCEEDED' || error.message?.includes('LIMIT_EXCEEDED')) {
                            handleLimitExceeded();
                            errorMessage = "Bạn đã hết lượt làm bài miễn phí (2/2). Vui lòng đăng ký tài khoản.";
                        } else {
                            errorMessage += "Dữ liệu không hợp lệ.";
                        }
                    } else if (error.status === 404) {
                        errorMessage += "Không tìm thấy bài thi.";
                    } else if (error.status === 409) {
                        errorMessage += "Bài thi đã được nộp rồi.";
                    } else {
                        errorMessage += error.message || "Vui lòng thử lại.";
                    }
                } else {
                    errorMessage += error.message || "Vui lòng thử lại.";
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi nộp bài',
                    text: errorMessage,
                    confirmButtonText: 'Đồng ý',
                    confirmButtonColor: '#ef4444'
                });
                setIsSubmitting(false);
            }
        };

        if (!autoSubmit) {
            await showConfirmAndSubmit();
        } else {
            await performSubmit();
        }
    };

    if (loading || !test) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Đang chuẩn bị phòng thi...</p>
                </div>
            </div>
        );
    }

    const currentQuestionData = test.questions[currentQuestion];
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="h-screen flex flex-col bg-gray-100 overflow-hidden select-none">
            {/* Header */}
            <header className="h-16 bg-gray-900 text-white shadow-lg flex items-center justify-between px-6 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-lg leading-tight tracking-wide">BÀI THI THỬ MIỄN PHÍ</span>
                        <span className="text-xs text-gray-400 font-mono">Test ID: {testId}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3 border border-gray-700">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Thời gian còn lại</span>
                        <span className={`font-mono text-xl font-bold ${Number(formattedTime.split(':')[0]) < 5 ? 'text-red-500 animate-pulse' : 'text-white'
                            }`}>
                            {formattedTime}
                        </span>
                    </div>

                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-lg hover:shadow-red-500/30"
                    >
                        {isSubmitting ? 'ĐANG NỘP...' : 'NỘP BÀI'}
                    </button>
                </div>
            </header>

            {/* Violation Banner */}
            {violationCount > 0 && (
                <div className="bg-red-600 text-white px-4 py-1 text-center text-sm font-bold animate-pulse">
                    ⚠️ PHÁT HIỆN {violationCount} LẦN VI PHẠM QUY CHẾ THI
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Question Palette */}
                <aside className="w-72 bg-white border-r border-gray-200 flex flex-col hidden md:flex z-10">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-700 text-sm uppercase">Câu hỏi</h3>
                            <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">{answeredCount}/{test.questions.length}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(answeredCount / test.questions.length) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="grid grid-cols-5 gap-2">
                            {test.questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestion(idx)}
                                    className={`aspect-square rounded-lg font-bold text-xs transition relative ${currentQuestion === idx
                                        ? 'bg-gray-900 text-white ring-2 ring-offset-2 ring-gray-900'
                                        : answers[q.id]
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    {idx + 1}
                                    {answers[q.id] && (
                                        <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full -mt-0.5 -mr-0.5"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                        <p>• Màu xanh: Đã trả lời</p>
                        <p>• Màu đen: Đang chọn</p>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-100 relative">
                    {/* Cheat Warning Overlay */}
                    {showCheatWarning && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-white p-6 md:p-8 rounded-2xl max-w-md text-center shadow-2xl mx-4 animate-bounce-in">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                    ⚠️
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">CẢNH BÁO VI PHẠM!</h2>
                                <p className="text-gray-600 mb-6">
                                    Hệ thống phát hiện bạn đã rời khỏi màn hình hoặc cố gắng thực hiện thao tác cấm.
                                    <br /><br />
                                    <strong>Vi phạm này đã được ghi lại.</strong> Nếu tiếp tục, bài thi của bạn sẽ bị hủy bỏ.
                                </p>
                                <button
                                    onClick={() => setShowCheatWarning(false)}
                                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
                                >
                                    TÔI ĐÃ HIỂU
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Question Card */}
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
                        <div className="p-6 sm:p-10 flex-1">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="bg-gray-900 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg shadow-gray-200">
                                        Câu {currentQuestion + 1}
                                    </span>
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                        currentQuestionData.type === 'LC'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {currentQuestionData.type}
                                    </span>
                                </div>
                            </div>

                            {currentQuestionData.type === 'LC' && currentQuestionData.audioUrl && (
                                <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-sm">
                                        <span>🎧</span> Phần Nghe
                                    </div>
                                    <audio controls className="w-full h-10">
                                        <source src={currentQuestionData.audioUrl} type="audio/mpeg" />
                                    </audio>
                                </div>
                            )}

                            {currentQuestionData.imageUrl && (
                                <div className="mb-6">
                                    <img
                                        src={currentQuestionData.imageUrl}
                                        alt="Hình ảnh câu hỏi"
                                        className="max-w-full rounded-xl border border-gray-200 shadow-sm mx-auto block"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            )}

                            <h2 className="text-xl sm:text-2xl font-medium text-gray-800 mb-8 leading-relaxed">
                                <div dangerouslySetInnerHTML={{ __html: currentQuestionData.content }} />
                            </h2>

                            {/* Options */}
                            <div className="space-y-4 max-w-2xl">
                                {currentQuestionData.options.map(opt => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${answers[currentQuestionData.id] == opt.id
                                            ? 'border-gray-900 bg-gray-50'
                                            : 'border-gray-100 hover:border-gray-300 hover:bg-white'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${answers[currentQuestionData.id] == opt.id
                                            ? 'border-gray-900'
                                            : 'border-gray-300 group-hover:border-gray-400'
                                            }`}>
                                            {answers[currentQuestionData.id] == opt.id && (
                                                <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
                                            )}
                                        </div>
                                        <span className={`text-lg ${answers[currentQuestionData.id] == opt.id ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                            <span dangerouslySetInnerHTML={{ __html: opt.content }} />
                                        </span>
                                        <input
                                            type="radio"
                                            name={`q-${currentQuestionData.id}`}
                                            value={opt.id}
                                            checked={answers[currentQuestionData.id] == opt.id}
                                            onChange={() => handleAnswerChange(currentQuestionData.id, opt.id)}
                                            className="hidden"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="bg-gray-50 p-4 sm:px-10 py-6 border-t border-gray-100 flex justify-between items-center">
                            <button
                                disabled={currentQuestion === 0}
                                onClick={() => setCurrentQuestion(prev => prev - 1)}
                                className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                ← Quay lại
                            </button>

                            <div className="hidden sm:block text-gray-400 text-sm font-medium">
                                Sử dụng phím mũi tên để điều hướng nhanh
                            </div>

                            <button
                                disabled={currentQuestion === test.questions.length - 1}
                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-gray-900/20"
                            >
                                Tiếp theo →
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TestRunner;
