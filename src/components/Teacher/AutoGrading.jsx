import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, CheckCircle, Clock, AlertCircle, Loader2, Award } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import Swal from 'sweetalert2';

/**
 * AutoGrading - Component tự động chấm bài
 * Priority 3: Advanced Exam Features
 */
const AutoGrading = ({ attemptId, onGradingComplete }) => {
    const { t } = useTranslation();
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
                    <p class="mb-2">${t('teacher.autoGrading.autoResultTitle')}</p>
                    <ul class="space-y-1">
                        <li>✅ ${t('teacher.autoGrading.graded')}: <strong>${autoGradedCount}/${totalQuestions}</strong> ${t('teacher.autoGrading.questions')}</li>
                        <li>📊 ${t('teacher.autoGrading.scoreLabel')}: <strong>${autoScore}</strong></li>
            `;

            if (needsManualGrading > 0) {
                message += `
                        <li>⏳ ${t('teacher.autoGrading.needsManual')}: <strong>${needsManualGrading}</strong> ${t('teacher.autoGrading.questions')}</li>
                        <li>📝 ${t('teacher.autoGrading.status')}: <strong>${t('teacher.autoGrading.waitingManual')}</strong></li>
                `;
            } else {
                message += `
                        <li>✅ ${t('teacher.autoGrading.status')}: <strong>${t('teacher.autoGrading.completed')}</strong></li>
                `;
            }

            message += `
                    </ul>
                </div>
            `;

            Swal.fire({
                icon: needsManualGrading > 0 ? 'info' : 'success',
                title: needsManualGrading > 0 ? t('teacher.autoGrading.autoDone') : t('teacher.autoGrading.allDone'),
                html: message,
                confirmButtonColor: needsManualGrading > 0 ? '#6366f1' : '#22c55e'
            });

            if (onGradingComplete) {
                onGradingComplete(response.data);
            }
        } catch (err) {
            console.error('Error auto-grading:', err);
            const errorMessage = err.response?.data?.message || t('teacher.autoGrading.cannotAutoGrade');
            setError(errorMessage);

            Swal.fire({
                icon: 'error',
                title: t('teacher.autoGrading.error'),
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
                title: t('teacher.autoGrading.scorePercentage'),
                html: `
                    <div class="text-center">
                        <p class="text-5xl font-bold text-indigo-600 mb-2">${percentage}%</p>
                        <p class="text-gray-600">${t('teacher.autoGrading.totalScore')}</p>
                    </div>
                `,
                confirmButtonColor: '#6366f1'
            });
        } catch (err) {
            console.error('Error getting percentage:', err);
            Swal.fire({
                icon: 'error',
                title: t('teacher.autoGrading.error'),
                text: t('teacher.autoGrading.cannotGetPercentage'),
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
                        <h3 className="text-lg font-semibold text-gray-900">{t('teacher.autoGrading.title')}</h3>
                        <p className="text-sm text-gray-600">
                            {t('teacher.autoGrading.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-6">
                {/* Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        {t('teacher.autoGrading.whatDoesAutoGradingDo')}
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• <strong>{t('teacher.autoGrading.multipleChoice')}:</strong> {t('teacher.autoGrading.multipleChoiceDesc')}</li>
                        <li>• <strong>{t('teacher.autoGrading.shortAnswer')}:</strong> {t('teacher.autoGrading.shortAnswerDesc')}</li>
                        <li>• <strong>{t('teacher.autoGrading.longAnswer')}:</strong> {t('teacher.autoGrading.longAnswerDesc')}</li>
                    </ul>
                </div>

                {/* Result */}
                {result && (
                    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">{t('teacher.autoGrading.gradingResult')}</p>
                                <div className="mt-2 space-y-1 text-sm text-green-700">
                                    <div className="flex items-center gap-2">
                                        <span>{t('teacher.autoGrading.graded')}:</span>
                                        <span className="font-semibold">{result.autoGradedCount}/{result.totalQuestions}</span>
                                        <span>{t('teacher.autoGrading.questions')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>{t('teacher.autoGrading.scoreLabel')}:</span>
                                        <span className="font-semibold">{result.autoScore}</span>
                                    </div>
                                    {result.needsManualGrading > 0 && (
                                        <div className="flex items-center gap-2 text-orange-700">
                                            <Clock className="w-4 h-4" />
                                            <span>{t('teacher.autoGrading.needsManual')}:</span>
                                            <span className="font-semibold">{result.needsManualGrading}</span>
                                            <span>{t('teacher.autoGrading.questions')}</span>
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
                            <p className="text-sm font-medium text-red-900">{t('teacher.autoGrading.error')}</p>
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
                                {t('teacher.autoGrading.grading')}
                            </>
                        ) : (
                            <>
                                <Bot className="w-5 h-5" />
                                {t('teacher.autoGrading.startAutoGrading')}
                            </>
                        )}
                    </button>

                    {result && result.autoScore !== undefined && (
                        <button
                            onClick={handleGetPercentage}
                            className="w-full px-6 py-3 bg-white border-2 border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Award className="w-5 h-5" />
                            {t('teacher.autoGrading.viewScorePercentage')}
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
                                <>✅ {t('teacher.autoGrading.completed')}</>
                            ) : (
                                <>⏳ {t('teacher.autoGrading.waitingManual')}</>
                            )}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutoGrading;
