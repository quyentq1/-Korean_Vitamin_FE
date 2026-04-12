import React from 'react';
import { X } from 'lucide-react';
import AIAnswerExplanation from '../AI/AIAnswerExplanation';

const ExamReviewModal = ({ isOpen, onClose, attempt, exam }) => {
    if (!isOpen || !attempt || !exam) return null;

    const questions = exam.examQuestions || [];

    // Calculate totalPoints from exam questions if not set or is 0
    const calculatedTotalPoints = exam.totalPoints && exam.totalPoints > 0
        ? exam.totalPoints
        : questions.reduce((sum, eq) => sum + (eq.points || 0), 0);

    // Fallback: use autoScore if totalScore is null
    const actualScore = attempt.totalScore != null ? attempt.totalScore : attempt.autoScore;

    // Calculate pass/fail
    const scorePercentage = actualScore && calculatedTotalPoints > 0
        ? Math.round((actualScore / calculatedTotalPoints) * 100)
        : 0;
    const passed = scorePercentage >= (exam.passingScore || 60);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] xl:max-w-7xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 shrink-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Xem lại bài thi</h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">{exam.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6 max-w-5xl mx-auto">
                        {questions.map((eq, index) => {
                            const question = eq.question;
                            const userAnswer = attempt.answers?.find(a => a.examQuestion?.id === eq.id);
                            const isCorrect = userAnswer?.isCorrect || false;
                            const userSelectedOptionId = userAnswer?.answerText;

                            // Debug log cho Writing/Speaking
                            if (question.questionType === 'WRITING' || question.questionType === 'SPEAKING') {
                                console.log('📝 Writing/Speaking Answer:', {
                                    questionId: eq.id,
                                    questionType: question.questionType,
                                    userAnswer,
                                    allFields: userAnswer ? Object.keys(userAnswer) : [],
                                    feedback: userAnswer?.feedback,
                                    teacherFeedback: userAnswer?.teacherFeedback,
                                    manualGrade: userAnswer?.manualGrade
                                });
                            }

                            // Kiểm tra loại câu hỏi
                            const isWritingOrSpeaking = question.questionType === 'WRITING' || question.questionType === 'SPEAKING';
                            const isMultipleChoice = question.questionType === 'READING' || question.questionType === 'LISTENING' || question.questionType === 'MULTIPLE_CHOICE';

                            // Tìm đáp án đúng (chỉ cho trắc nghiệm)
                            const correctOption = isMultipleChoice ? question.options?.find(opt => opt.isCorrect) : null;
                            const userSelectedOption = isMultipleChoice ? question.options?.find(opt => opt.id.toString() === userSelectedOptionId) : null;

                            // Xác định màu border và icon
                            const getBorderColor = () => {
                                if (isWritingOrSpeaking) {
                                    // Writing/Speaking: màu cam (chờ chấm) hoặc xanh (đã chấm)
                                    const hasScore = userAnswer?.score !== null && userAnswer?.score !== undefined;
                                    return hasScore ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50';
                                }
                                // Multiple choice: xanh (đúng) hoặc đỏ (sai)
                                return isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
                            };

                            const getIconColor = () => {
                                if (isWritingOrSpeaking) {
                                    const hasScore = userAnswer?.score !== null && userAnswer?.score !== undefined;
                                    return hasScore ? 'bg-blue-500' : 'bg-orange-500';
                                }
                                return isCorrect ? 'bg-green-500' : 'bg-red-500';
                            };

                            const getIconText = () => {
                                if (isWritingOrSpeaking) {
                                    const hasScore = userAnswer?.score !== null && userAnswer?.score !== undefined;
                                    return hasScore ? '✓' : '?';
                                }
                                return isCorrect ? '✓' : '✗';
                            };

                            return (
                                <div
                                    key={eq.id}
                                    className={`p-3 sm:p-6 rounded-xl border-2 ${getBorderColor()}`}
                                >
                                    {/* Question Header */}
                                    <div className="flex items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${getIconColor()}`}>
                                            <span className="text-white font-bold text-sm sm:text-base">{getIconText()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                                                <span className="text-xs sm:text-sm font-semibold text-gray-500">
                                                    Câu {index + 1}
                                                </span>
                                                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                                                    question.questionType === 'LISTENING'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : question.questionType === 'READING'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : question.questionType === 'WRITING'
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : question.questionType === 'SPEAKING'
                                                        ? 'bg-pink-100 text-pink-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {question.questionType === 'WRITING' ? 'WRITING' :
                                                     question.questionType === 'SPEAKING' ? 'SPEAKING' :
                                                     question.questionType || 'MULTIPLE_CHOICE'}
                                                </span>
                                                <span className="text-xs sm:text-sm text-gray-500">
                                                    {eq.points || 1} điểm
                                                </span>
                                            </div>
                                            <p className="text-sm sm:text-base text-gray-900 font-medium whitespace-pre-wrap">
                                                <span dangerouslySetInnerHTML={{ __html: question.questionText }} />
                                            </p>

                                            {/* Question image (if any) */}
                                            {question.imageUrl && (
                                                <div className="mt-3">
                                                    <img
                                                        src={question.imageUrl}
                                                        alt="Hình ảnh câu hỏi"
                                                        className="max-w-full max-h-80 rounded-xl border border-gray-200 shadow-sm"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Audio (Listening) */}
                                    {question.questionType === 'LISTENING' && question.questionMediaUrl && (
                                        <div className="mb-3 ml-14">
                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <p className="text-xs font-semibold text-blue-800 mb-2">🔊 File nghe:</p>
                                                <audio controls className="w-full h-10">
                                                    <source src={question.questionMediaUrl} type="audio/mpeg" />
                                                </audio>
                                            </div>
                                        </div>
                                    )}

                                    {/* Multiple Choice Options */}
                                    {isMultipleChoice && question.options && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-14">
                                            {question.options.map((option, optIndex) => {
                                                const isUserSelected = option.id.toString() === userSelectedOptionId;
                                                const isCorrectAnswer = option.isCorrect;

                                                return (
                                                    <div
                                                        key={option.id}
                                                        className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
                                                            isCorrectAnswer
                                                                ? 'border-green-400 bg-green-50'
                                                                : isUserSelected
                                                                ? 'border-red-300 bg-red-50'
                                                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                            isCorrectAnswer
                                                                ? 'bg-green-500 text-white'
                                                                : isUserSelected
                                                                ? 'bg-red-500 text-white'
                                                                : 'bg-gray-300 text-gray-600'
                                                        }`}>
                                                            {String.fromCharCode(65 + optIndex)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-gray-900"><span dangerouslySetInnerHTML={{ __html: option.optionText }} /></p>
                                                            <div className="flex gap-2 mt-1">
                                                                {isUserSelected && (
                                                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                                        Bạn chọn
                                                                    </span>
                                                                )}
                                                                {isCorrectAnswer && (
                                                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                                                        Đáp án đúng
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Writing/Speaking Answer */}
                                    {isWritingOrSpeaking && userAnswer && (
                                        <div className="ml-14 space-y-3">
                                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                                <p className="text-xs font-semibold text-gray-500 mb-2">
                                                    📝 Câu trả lời của bạn:
                                                </p>
                                                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                                    {userAnswer.answerText || 'Không có câu trả lời'}
                                                </p>
                                            </div>

                                            {/* Feedback từ giáo viên - từ root level của answer */}
                                            {userAnswer.feedback && userAnswer.feedback.trim() && (
                                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                    <p className="text-xs font-semibold text-blue-900 mb-1">
                                                        💬 Nhận xét của giáo viên:
                                                    </p>
                                                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                                        {userAnswer.feedback}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Hiển thị người chấm và thời gian */}
                                            {userAnswer.gradedBy && (
                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <p className="text-xs text-gray-600">
                                                        ✍️ Chấm bởi: <span className="font-semibold text-gray-900">{userAnswer.gradedBy}</span>
                                                        {userAnswer.gradedAt && (
                                                            <span className="ml-2">
                                                                • {new Date(userAnswer.gradedAt).toLocaleString('vi-VN')}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Explanation if available (only for multiple choice) */}
                                    {isMultipleChoice && question.explanation && (
                                        <div className="mt-4 ml-14 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm font-semibold text-blue-900 mb-1">
                                                💡 Giải thích:
                                            </p>
                                            <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                                {question.explanation}
                                            </p>
                                        </div>
                                    )}

                                    {/* AI Answer Explanation - For all question types */}
                                    <div className="mt-4 ml-14">
                                        <AIAnswerExplanation
                                            question={{
                                                ...question,
                                                questionType: question.questionType || 'MULTIPLE_CHOICE',
                                                topikLevel: exam.topikLevel || 'TOPIK_I',
                                                text: question.questionText
                                            }}
                                            studentAnswer={isMultipleChoice
                                                ? (userSelectedOption ? userSelectedOption.optionText : null)
                                                : (userAnswer ? userAnswer.answerText : null)
                                            }
                                            correctAnswer={correctOption ? correctOption.optionText : question.correctAnswer}
                                        />
                                    </div>

                                    {/* User answer details */}
                                    {userAnswer && (
                                        <div className="mt-4 ml-4 p-3 bg-white rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">
                                                Chi tiết câu trả lời:
                                            </p>
                                            <div className="flex items-center gap-4 text-sm">
                                                {isWritingOrSpeaking ? (
                                                    <>
                                                        <span className={`font-semibold ${
                                                            userAnswer.score !== null && userAnswer.score !== undefined
                                                                ? 'text-blue-600'
                                                                : 'text-orange-600'
                                                        }`}>
                                                            {userAnswer.score !== null && userAnswer.score !== undefined
                                                                ? 'Đã chấm'
                                                                : 'Chờ chấm'}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            Điểm: {userAnswer.score !== null && userAnswer.score !== undefined ? userAnswer.score : '-'}/{eq.points || 1}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className={`font-semibold ${
                                                            isCorrect ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {isCorrect ? 'Chính xác' : 'Sai'}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            Điểm: {userAnswer.score || 0}/{eq.points || 1}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-3 sm:p-6 border-t border-gray-200 shrink-0 bg-gray-50 rounded-b-2xl">
                    <div className="flex items-center gap-3">
                        {/* Pass/Fail Badge */}
                        <div className={`px-4 py-2 rounded-lg font-bold text-base ${
                            passed
                                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                : 'bg-red-100 text-red-700 border-2 border-red-300'
                        }`}>
                            {passed ? '✓ ĐẠT' : '✗ KHÔNG ĐẠT'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">{actualScore || 0}/{calculatedTotalPoints} điểm</span>
                            <span className="mx-1">•</span>
                            <span>{scorePercentage}%</span>
                            <span className="mx-1">•</span>
                            <span>Đạt: {exam.passingScore || 60}%</span>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                                                        >
                                                            Đóng
                                                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamReviewModal;
