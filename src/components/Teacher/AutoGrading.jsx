import { useState, useEffect } from 'react';
import { Bot, CheckCircle, Clock, AlertCircle, Loader2, Award } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import Swal from 'sweetalert2';

/**
 * AutoGrading - Component tự động chấm bài
 * Priority 3: Advanced Exam Features
 */
const AutoGrading = ({ attemptId, onGradingComplete }) => {
    const [grading, setGrading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleAutoGrade = async () => {
        setGrading(true);
        setError(null);

        try {
            const response = await teacherService.autoGradeAttempt(attemptId);
            setResult(response.data);

            const autoScore = response.data?.autoScore || 0;
            const autoGradedCount = response.data?.autoGradedCount || 0;
            const needsManualGrading = response.data?.needsManualGrading || 0;
            const totalQuestions = response.data?.totalQuestions || 0;
            const status = response.data?.status;

            let message = `
                <div class="text-left">
                    <p class="mb-2">Kết quả chấm tự động:</p>
                    <ul class="space-y-1">
                        <li>✅ Đã chấm: <strong>${autoGradedCount}/${totalQuestions}</strong> câu</li>
                        <li>📊 Điểm số: <strong>${autoScore}</strong></li>
            `;

            if (needsManualGrading > 0) {
                message += `
                        <li>⏳ Cần chấm tay: <strong>${needsManualGrading}</strong> câu</li>
                        <li>📝 Trạng thái: <strong>Chờ chấm tay</strong></li>
                `;
            } else {
                message += `
                        <li>✅ Trạng thái: <strong>Đã hoàn thành</strong></li>
                `;
            }

            message += `
                    </ul>
                </div>
            `;

            Swal.fire({
                icon: needsManualGrading > 0 ? 'info' : 'success',
                title: needsManualGrading > 0 ? 'Chấm xong phần tự động' : 'Chấm hoàn tất!',
                html: message,
                confirmButtonColor: needsManualGrading > 0 ? '#6366f1' : '#22c55e'
            });

            if (onGradingComplete) {
                onGradingComplete(response.data);
            }
        } catch (err) {
            console.error('Error auto-grading:', err);
            const errorMessage = err.response?.data?.message || 'Không thể chấm bài tự động';
            setError(errorMessage);

            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: errorMessage,
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setGrading(false);
        }
    };

    const handleGetPercentage = async () => {
        try {
            const response = await teacherService.getScorePercentage(attemptId);
            const percentage = response.data || 0;

            Swal.fire({
                icon: 'info',
                title: 'Tỷ lệ điểm số',
                html: `
                    <div class="text-center">
                        <p class="text-5xl font-bold text-indigo-600 mb-2">${percentage}%</p>
                        <p class="text-gray-600">Tổng điểm</p>
                    </div>
                `,
                confirmButtonColor: '#6366f1'
            });
        } catch (err) {
            console.error('Error getting percentage:', err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể lấy tỷ lệ điểm số',
                confirmButtonColor: '#ef4444'
            });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Chấm Tự Động</h3>
                        <p className="text-sm text-gray-600">
                            Tự động chấm các câu hỏi trắc nghiệm và tự luận ngắn
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-6">
                {/* Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        🤖 Chấm tự động做什么?
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• <strong>Trắc nghiệm:</strong> Chấm tự động dựa trên đáp án đúng</li>
                        <li>• <strong>Tự luận ngắn:</strong> So sánh với đáp án, cho điểm partial nếu có từ khóa đúng</li>
                        <li>• <strong>Tự luận dài/Viết/Nghe:</strong> Yêu cầu chấm tay</li>
                    </ul>
                </div>

                {/* Result */}
                {result && (
                    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">Kết quả chấm</p>
                                <div className="mt-2 space-y-1 text-sm text-green-700">
                                    <div className="flex items-center gap-2">
                                        <span>Đã chấm:</span>
                                        <span className="font-semibold">{result.autoGradedCount}/{result.totalQuestions}</span>
                                        <span>câu</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>Điểm số:</span>
                                        <span className="font-semibold">{result.autoScore}</span>
                                    </div>
                                    {result.needsManualGrading > 0 && (
                                        <div className="flex items-center gap-2 text-orange-700">
                                            <Clock className="w-4 h-4" />
                                            <span>Cần chấm tay:</span>
                                            <span className="font-semibold">{result.needsManualGrading}</span>
                                            <span>câu</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">Lỗi</p>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleAutoGrade}
                        disabled={grading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                        {grading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Đang chấm...
                            </>
                        ) : (
                            <>
                                <Bot className="w-5 h-5" />
                                Bắt Đầu Chấm Tự Động
                            </>
                        )}
                    </button>

                    {result && result.autoScore !== undefined && (
                        <button
                            onClick={handleGetPercentage}
                            className="w-full px-6 py-3 bg-white border-2 border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Award className="w-5 h-5" />
                            Xem Tỷ Lệ Điểm Số
                        </button>
                    )}
                </div>

                {/* Status Badge */}
                {result?.status && (
                    <div className="mt-4 flex justify-center">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                            result.status === 'GRADED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            {result.status === 'GRADED' ? (
                                <>✅ Đã hoàn thành</>
                            ) : (
                                <>⏳ Chờ chấm tay</>
                            )}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutoGrading;
