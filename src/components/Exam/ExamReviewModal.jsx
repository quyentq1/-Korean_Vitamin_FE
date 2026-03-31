import React from 'react';
import { X } from 'lucide-react';

const ExamReviewModal = ({ isOpen, onClose, attempt, exam }) => {
    if (!isOpen || !attempt || !exam) return null;

    const questions = exam.examQuestions || [];

    // Calculate pass/fail
    const scorePercentage = attempt.totalScore
        ? Math.round((attempt.totalScore / exam.totalPoints) * 100)
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

                            // Tìm đáp án đúng
                            const correctOption = question.options?.find(opt => opt.isCorrect);
                            const userSelectedOption = question.options?.find(opt => opt.id.toString() === userSelectedOptionId);

                            return (
                                <div
                                    key={eq.id}
                                    className={`p-3 sm:p-6 rounded-xl border-2 ${
                                        isCorrect
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-red-200 bg-red-50'
                                    }`}
                                >
                                    {/* Question Header */}
                                    <div className="flex items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                                            isCorrect ? 'bg-green-500' : 'bg-red-500'
                                        }`}>
                                            {isCorrect ? (
                                                <span className="text-white font-bold text-sm sm:text-base">✓</span>
                                            ) : (
                                                <span className="text-white font-bold text-sm sm:text-base">✗</span>
                                            )}
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
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {question.questionType || 'MULTIPLE_CHOICE'}
                                                </span>
                                                <span className="text-xs sm:text-sm text-gray-500">
                                                    {eq.points || 1} điểm
                                                </span>
                                            </div>
                                            <p className="text-sm sm:text-base text-gray-900 font-medium whitespace-pre-wrap">
                                                <span dangerouslySetInnerHTML={{ __html: question.questionText }} />
                                            </p>
                                        </div>
                                    </div>

                                    {/* Options */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-14">
                                        {question.options?.map((option, optIndex) => {
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

                                    {/* Explanation if available */}
                                    {question.explanation && (
                                        <div className="mt-4 ml-14 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm font-semibold text-blue-900 mb-1">
                                                💡 Giải thích:
                                            </p>
                                            <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                                {question.explanation}
                                            </p>
                                        </div>
                                    )}

                                    {/* User answer details */}
                                    {userAnswer && (
                                        <div className="mt-4 ml-4 p-3 bg-white rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">
                                                Chi tiết câu trả lời:
                                            </p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className={`font-semibold ${
                                                    isCorrect ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {isCorrect ? 'Chính xác' : 'Sai'}
                                                </span>
                                                <span className="text-gray-500">
                                                    Điểm: {userAnswer.score || 0}/{eq.points || 1}
                                                </span>
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
                            <span className="font-semibold">{attempt.totalScore || 0}/{exam.totalPoints || 0} điểm</span>
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
