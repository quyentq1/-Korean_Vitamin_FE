import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

/**
 * VariantGenerator - Component tạo Quiz A và Quiz B variants
 * Priority 3: Quiz A/B Variant Generation
 */
const VariantGenerator = ({ exam, onGenerate, onCancel }) => {
    const { t } = useTranslation();
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);
        setResult(null);

        try {
            const teacherId = localStorage.getItem('userId') || 1;
            const response = await onGenerate(exam.id, teacherId);
            setResult(response.data);

            Swal.fire({
                icon: 'success',
                title: t('teacher.variantGenerator.success'),
                html: `
                    <p>${t('teacher.variantGenerator.createdVariants')}</p>
                    <ul class="text-left mt-3 space-y-1">
                        <li>• Quiz A: ${response.data.examA?.title || exam.title}</li>
                        <li>• Quiz B: ${response.data.examB?.title}</li>
                    </ul>
                `,
                confirmButtonColor: '#6366f1'
            });
        } catch (err) {
            console.error('Error generating variants:', err);
            setError(err.response?.data?.message || t('teacher.variantGenerator.cannotCreate'));
            Swal.fire({
                icon: 'error',
                title: t('teacher.variantGenerator.error'),
                text: error || t('teacher.variantGenerator.cannotCreate'),
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setGenerating(false);
        }
    };

    const getExamStructure = () => {
        if (!exam || !exam.examQuestions) return null;

        const structure = {};
        exam.examQuestions.forEach(eq => {
            const key = `${eq.question.category?.name || 'Uncategorized'}_${eq.question.questionType}_${eq.question.difficulty}`;
            if (!structure[key]) {
                structure[key] = {
                    category: eq.question.category?.name || 'Uncategorized',
                    type: eq.question.questionType,
                    difficulty: eq.question.difficulty,
                    count: 0,
                    points: eq.points
                };
            }
            structure[key].count++;
        });

        return Object.values(structure);
    };

    const structure = getExamStructure();

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Copy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{t('teacher.variantGenerator.title')}</h3>
                        <p className="text-sm text-gray-600">
                            {t('teacher.variantGenerator.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-6">
                {/* Original Exam Info */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('teacher.variantGenerator.originalExam')}</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-900">{exam?.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{exam?.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                            <span>⏱️ {exam?.durationMinutes} {t('teacher.variantGenerator.minutes')}</span>
                            <span>📝 {exam?.totalPoints} {t('teacher.variantGenerator.points')}</span>
                            <span>❓ {exam?.examQuestions?.length || 0} {t('teacher.variantGenerator.questions')}</span>
                        </div>
                    </div>
                </div>

                {/* Exam Structure */}
                {structure && structure.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            {t('teacher.variantGenerator.examStructure')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {structure.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-gray-200 rounded-lg p-3"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-indigo-600">
                                            {item.category}
                                        </span>
                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                            {item.count} {t('teacher.variantGenerator.questions')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                        <span>{item.type}</span>
                                        <span>•</span>
                                        <span>{item.difficulty}</span>
                                        <span>•</span>
                                        <span>{item.points} {t('teacher.variantGenerator.pointsPerQuestion')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* How it works */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        {t('teacher.variantGenerator.howItWorks')}
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>{t('teacher.variantGenerator.howItWorks1')}</li>
                        <li>{t('teacher.variantGenerator.howItWorks2')}</li>
                        <li>{t('teacher.variantGenerator.howItWorks3')}</li>
                        <li>{t('teacher.variantGenerator.howItWorks4')}</li>
                    </ul>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">{t('teacher.variantGenerator.error')}</p>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">{t('teacher.variantGenerator.success')}</p>
                                <p className="text-sm text-green-700 mt-1">
                                    {t('teacher.variantGenerator.successDesc')}
                                </p>
                                {result.examA && (
                                    <p className="text-xs text-green-700 mt-2">
                                        Quiz A ID: {result.examA.id}
                                    </p>
                                )}
                                {result.examB && (
                                    <p className="text-xs text-green-700">
                                        Quiz B ID: {result.examB.id}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={generating}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {t('teacher.variantGenerator.cancel')}
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('teacher.variantGenerator.generating')}
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                {t('teacher.variantGenerator.generateBtn')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VariantGenerator;
