import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import examService from '../../services/examService';
import useExamSecurity from '../../hooks/useExamSecurity';
import useExamTimer from '../../hooks/useExamTimer';
import { generateExamVariant } from '../../utils/examVariantGenerator';
import Swal from 'sweetalert2';

const ExamTaking = () => {
    const { examId, attemptId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [exam, setExam] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCheatWarning, setShowCheatWarning] = useState(false);

    const { violationCount, resetViolations } = useExamSecurity((type) => {
        setShowCheatWarning(true);
        examService.logViolation(attemptId, type).catch(console.error);
    });

    const [duration, setDuration] = useState(0);
    const { formattedTime, startTimer, stopTimer, progress: timeProgress } = useExamTimer(
        duration,
        () => handleSubmit(true)
    );

    useEffect(() => {
        const initExam = async () => {
            try {
                setLoading(true);
                const attemptData = await examService.getAttemptDetails(attemptId);
                console.log('📦 Attempt data received:', attemptData);
                const examObj = attemptData.exam;
                console.log('📝 Exam object:', examObj);
                console.log('❓ Exam questions:', examObj?.examQuestions);

                if (!examObj || !examObj.examQuestions) {
                    console.error('❌ Invalid exam data:', { examObj, hasExamQuestions: !!examObj?.examQuestions });
                    throw new Error(t('exam.taking.invalidData', 'Dữ liệu đề thi không hợp lệ từ máy chủ'));
                }

                const formattedQuestions = examObj.examQuestions.map(eq => ({
                    examQuestionId: eq.id,
                    id: eq.question.id,
                    text: eq.question.questionText,
                    type: eq.question.questionType === 'LISTENING' ? 'LC' :
                          eq.question.questionType === 'WRITING' ? 'WR' : 'RC',
                    questionType: eq.question.questionType,
                    mediaUrl: eq.question.questionMediaUrl,
                    imageUrl: eq.question.imageUrl || null,
                    options: eq.question.options.map(opt => ({
                        id: opt.id,
                        text: opt.optionText
                    }))
                }));

                setExam({
                    id: examObj.id,
                    title: examObj.title,
                    duration: examObj.durationMinutes,
                    questions: formattedQuestions
                });
                setDuration(examObj.durationMinutes);

            } catch (error) {
                console.error("Failed to load exam", error);
                Swal.fire({
                    icon: 'error',
                    title: t('exam.taking.loadErrorTitle', 'Lỗi tải đề thi'),
                    text: t('exam.taking.loadErrorText', 'Không thể tải bài thi. Vui lòng thử lại.'),
                    confirmButtonText: t('exam.taking.goHome', 'Về trang chủ'),
                    confirmButtonColor: '#3b82f6'
                }).then(() => {
                    navigate('/dashboard');
                });
            } finally {
                setLoading(false);
            }
        };

        if (attemptId) {
            initExam();
        }
    }, [attemptId, examId, navigate]);

    useEffect(() => {
        if (exam) {
            startTimer();
            document.documentElement.requestFullscreen().catch(() => { });
        }
        return () => stopTimer();
    }, [exam]);

    const handleAnswer = async (val) => {
        setAnswers(prev => ({ ...prev, [exam.questions[currentQuestionIndex].id]: val }));

        try {
            const qData = exam.questions[currentQuestionIndex];
            await examService.submitAnswer(attemptId, {
                examQuestionId: qData.examQuestionId,
                answerText: String(val)
            });
        } catch (error) {
            console.error("Failed to sync answer:", error);
        }
    };

    const handleSubmit = async (autoSubmit = false) => {
        const showConfirmAndSubmit = async () => {
            const result = await Swal.fire({
                icon: 'question',
                title: t('exam.taking.confirmSubmitTitle', 'Xác nhận nộp bài'),
                text: t('exam.taking.confirmSubmitText', 'Bạn có chắc chắn muốn nộp bài? Hành động này không thể hoàn tác.'),
                showCancelButton: true,
                confirmButtonText: t('exam.taking.submit', 'Nộp bài'),
                cancelButtonText: t('exam.taking.continueExam', 'Làm tiếp'),
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
                await examService.submitExam(attemptId);
                navigate(`/exam/result/${attemptId}`);
            } catch (error) {
                console.error("Submit error", error);
                Swal.fire({
                    icon: 'error',
                    title: t('exam.taking.submitErrorTitle', 'Lỗi nộp bài'),
                    text: t('exam.taking.submitErrorText', 'Không thể nộp bài thi. Vui lòng thử lại.'),
                    confirmButtonText: t('exam.taking.ok', 'Đồng ý'),
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

    if (loading || !exam) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">{t('exam.taking.preparing', 'Đang chuẩn bị phòng thi...')}</p>
                </div>
            </div>
        );
    }

    const currentQ = exam.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="h-screen flex flex-col bg-gray-100 overflow-hidden select-none">
            {/* Secure Header */}
            <header className="h-16 bg-gray-900 text-white shadow-lg flex items-center justify-between px-6 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-lg leading-tight tracking-wide">{t('exam.taking.officialExam', 'KỲ THI CHÍNH THỨC')}</span>
                        <span className="text-xs text-gray-400 font-mono">Attempt ID: {attemptId}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3 border border-gray-700">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('exam.taking.timeRemaining', 'Thời gian còn lại')}</span>
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
                        {isSubmitting ? t('exam.taking.submitting', 'ĐANG NỘP...') : t('exam.taking.submitBtn', 'NỘP BÀI')}
                    </button>
                </div>
            </header>

            {/* Violation Wrapper */}
            {violationCount > 0 && (
                <div className="bg-red-600 text-white px-4 py-1 text-center text-sm font-bold animate-pulse">
                    ⚠️ {t('exam.taking.violationDetected', 'PHÁT HIỆN')} {violationCount} {t('exam.taking.violationCount', 'LẦN VI PHẠM QUY CHẾ THI')}
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Question Palette */}
                <aside className="w-72 bg-white border-r border-gray-200 flex flex-col hidden md:flex z-10">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-700 text-sm uppercase">{t('exam.taking.questions', 'Câu hỏi')}</h3>
                            <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">{answeredCount}/{exam.questions.length}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(answeredCount / exam.questions.length) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="grid grid-cols-5 gap-2">
                            {exam.questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`aspect-square rounded-lg font-bold text-xs transition relative ${currentQuestionIndex === idx
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
                        <p>• {t('exam.taking.answered', 'Màu xanh')}: {t('exam.taking.answeredLabel', 'Đã trả lời')}</p>
                        <p>• {t('exam.taking.current', 'Màu đen')}: {t('exam.taking.currentLabel', 'Đang chọn')}</p>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-100 relative">
                    {/* Mobile Warning Overlay */}
                    {showCheatWarning && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-white p-6 md:p-8 rounded-2xl max-w-md text-center shadow-2xl mx-4 animate-bounce-in">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                    ⚠️
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('exam.taking.cheatWarningTitle', 'CẢNH BÁO VI PHẠM!')}</h2>
                                <p className="text-gray-600 mb-6">
                                    {t('exam.taking.cheatWarningText', 'Hệ thống phát hiện bạn đã rời khỏi màn hình hoặc cố gắng thực hiện thao tác cấm.')}
                                    <br /><br />
                                    <strong>{t('exam.taking.cheatWarningRecorded', 'Vi phạm này đã được ghi lại.')}</strong> {t('exam.taking.cheatWarningConsequence', 'Nếu tiếp tục, bài thi của bạn sẽ bị hủy bỏ.')}
                                </p>
                                <button
                                    onClick={() => setShowCheatWarning(false)}
                                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
                                >
                                    {t('exam.taking.understood', 'TÔI ĐÃ HIỂU')}
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
                                        {t('exam.taking.question', 'Câu')} {currentQuestionIndex + 1}
                                    </span>
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                        currentQ.type === 'WR'
                                            ? 'bg-purple-100 text-purple-700'
                                            : currentQ.type === 'LC'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {currentQ.type === 'WR' ? t('exam.taking.writing', 'Viết') : currentQ.type}
                                    </span>
                                </div>
                            </div>

                            {currentQ.mediaUrl && (
                                <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-sm">
                                        <span>🎧</span> {t('exam.taking.listening', 'Phần Nghe')}
                                    </div>
                                    <audio controls className="w-full h-10">
                                        <source src={currentQ.mediaUrl} type="audio/mpeg" />
                                    </audio>
                                </div>
                            )}

                            {currentQ.imageUrl && (
                                <div className="mb-6">
                                    <img
                                        src={currentQ.imageUrl}
                                        alt={t('exam.taking.questionImage', 'Hình ảnh câu hỏi')}
                                        className="max-w-full rounded-xl border border-gray-200 shadow-sm mx-auto block"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            )}

                            <h2 className="text-xl sm:text-2xl font-medium text-gray-800 mb-8 leading-relaxed">
                                <div dangerouslySetInnerHTML={{ __html: currentQ.text }} />
                            </h2>

                            {/* Writing Section */}
                            {currentQ.questionType === 'WRITING' || (!currentQ.options || currentQ.options.length === 0) ? (
                                <div className="space-y-4 max-w-3xl">
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                        <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
                                            <span>✍️</span> {t('exam.taking.writingSection', 'Phần Viết')}
                                        </div>
                                        <p className="text-sm text-blue-700">
                                            {t('exam.taking.writingInstruction', 'Hãy viết câu trả lời của bạn vào ô bên dưới. Bạn có thể viết bằng tiếng Hàn hoặc tiếng Việt.')}
                                        </p>
                                    </div>
                                    <textarea
                                        className="w-full border-2 border-gray-200 rounded-xl p-4 min-h-[250px] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-lg resize-y"
                                        placeholder={t('exam.taking.writingPlaceholder', 'Nhập câu trả lời của bạn tại đây...')}
                                        value={answers[currentQ.id] || ''}
                                        onChange={(e) => handleAnswer(e.target.value)}
                                    />
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>{(answers[currentQ.id] || '').length} {t('exam.taking.characters', 'ký tự')}</span>
                                        <span className="text-gray-400">{t('exam.taking.noCharLimit', 'Không giới hạn ký tự')}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 max-w-2xl">
                                    {currentQ.options.map(opt => (
                                        <label
                                            key={opt.id}
                                            className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${answers[currentQ.id] == opt.id
                                                ? 'border-gray-900 bg-gray-50'
                                                : 'border-gray-100 hover:border-gray-300 hover:bg-white'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${answers[currentQ.id] == opt.id
                                                ? 'border-gray-900'
                                                : 'border-gray-300 group-hover:border-gray-400'
                                                }`}>
                                                {answers[currentQ.id] == opt.id && (
                                                    <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
                                                )}
                                            </div>
                                            <span className={`text-lg ${answers[currentQ.id] == opt.id ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                                            </span>
                                            <input
                                                type="radio"
                                                name={`q-${currentQ.id}`}
                                                value={opt.id}
                                                checked={answers[currentQ.id] == opt.id}
                                                onChange={() => handleAnswer(opt.id)}
                                                className="hidden"
                                            />
                                        </label>
                                    ))}
                                </div>
                            )}
                            </div>

                            {/* Navigation Footer */}
                            <div className="bg-gray-50 p-4 sm:px-10 py-6 border-t border-gray-100 flex justify-between items-center">
                                <button
                                    disabled={currentQuestionIndex === 0}
                                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                    className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    ← {t('exam.taking.previous', 'Quay lại')}
                                </button>

                                <div className="hidden sm:block text-gray-400 text-sm font-medium">
                                    {t('exam.taking.arrowKeyNav', 'Sử dụng phím mũi tên để điều hướng nhanh')}
                                </div>

                                <button
                                    disabled={currentQuestionIndex === exam.questions.length - 1}
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-gray-900/20"
                                >
                                    {t('exam.taking.next', 'Tiếp theo')} →
                                </button>
                            </div>
                        </div>
                </main>
            </div>
        </div >
    );
};

export default ExamTaking;
