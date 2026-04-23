import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Eye } from 'lucide-react';

/**
 * CreateFillBlankQuestion - Component tạo câu hỏi điền từ
 * Priority 1: Question Bank
 */
const CreateFillBlankQuestion = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        questionText: '',
        category: '',
        difficulty: 'MEDIUM',
        points: 1,
        blanks: [],
        correctAnswers: [''],
        explanation: '',
        tags: []
    });

    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const addBlank = () => {
        setFormData({
            ...formData,
            blanks: [...formData.blanks, ''],
            correctAnswers: [...formData.correctAnswers, '']
        });
    };

    const removeBlank = (index) => {
        if (formData.blanks.length > 1) {
            const newBlanks = formData.blanks.filter((_, i) => i !== index);
            const newAnswers = formData.correctAnswers.filter((_, i) => i !== index);
            setFormData({
                ...formData,
                blanks: newBlanks,
                correctAnswers: newAnswers
            });
        }
    };

    const handleBlankChange = (index, value) => {
        const newBlanks = [...formData.blanks];
        newBlanks[index] = value;
        setFormData({ ...formData, blanks: newBlanks });
    };

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...formData.correctAnswers];
        newAnswers[index] = value;
        setFormData({ ...formData, correctAnswers: newAnswers });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.questionText.trim()) {
            newErrors.questionText = t('teacher.createFillBlank.errorQuestionRequired');
        }

        if (formData.blanks.length === 0 || formData.blanks.every(b => !b.trim())) {
            newErrors.blanks = t('teacher.createFillBlank.errorMinBlank');
        }

        if (formData.correctAnswers.some(a => !a.trim())) {
            newErrors.correctAnswers = t('teacher.createFillBlank.errorAnswerRequired');
        }

        if (!formData.category) {
            newErrors.category = t('teacher.createFillBlank.errorCategoryRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            onSubmit({
                ...formData,
                questionType: 'FILL_BLANK',
                questionText: formatQuestionText()
            });
        }
    };

    const formatQuestionText = () => {
        let text = formData.questionText;
        formData.blanks.forEach((blank, index) => {
            if (blank) {
                text = text.replace(blank, '______');
            }
        });
        return text;
    };

    const renderPreview = () => {
        let text = formData.questionText;
        formData.blanks.forEach((blank, index) => {
            if (blank) {
                text = text.replace(blank, `<span class="inline-block border-b-2 border-indigo-500 px-2 min-w-[60px] text-center">(${index + 1})</span>`);
            }
        });
        return text;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {t('teacher.createFillBlank.title')}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {t('teacher.createFillBlank.subtitle')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                        title={t('teacher.createFillBlank.preview')}
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Instructions */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">{t('teacher.createFillBlank.guide')}</h4>
                    <p className="text-sm text-blue-800">
                        {t('teacher.createFillBlank.guideDesc')}
                    </p>
                </div>

                {/* Question Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('teacher.createFillBlank.fullSentence')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.questionText}
                        onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                        placeholder={t('teacher.createFillBlank.fullSentencePlaceholder')}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                            errors.questionText ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.questionText && (
                        <p className="text-sm text-red-600 mt-1">{errors.questionText}</p>
                    )}
                </div>

                {/* Blanks */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('teacher.createFillBlank.blanks')} <span className="text-red-500">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={addBlank}
                            className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            {t('teacher.createFillBlank.addBlank')}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.blanks.map((blank, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            {t('teacher.createFillBlank.selectWordForBlank')}
                                        </label>
                                        <input
                                            type="text"
                                            value={blank}
                                            onChange={(e) => handleBlankChange(index, e.target.value)}
                                            placeholder={t('teacher.createFillBlank.wordExample')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            {t('teacher.createFillBlank.correctAnswer')}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.correctAnswers[index]}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                            placeholder={t('teacher.createFillBlank.answerPlaceholder')}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm ${
                                                errors.correctAnswers ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.correctAnswers && index === 0 && (
                                            <p className="text-xs text-red-600 mt-1">{errors.correctAnswers}</p>
                                        )}
                                    </div>
                                </div>
                                {formData.blanks.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeBlank(index)}
                                        className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        {t('teacher.createFillBlank.removeBlank')}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {errors.blanks && (
                        <p className="text-sm text-red-600 mt-2">{errors.blanks}</p>
                    )}
                </div>

                {/* Category & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teacher.createFillBlank.category')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                errors.category ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">{t('teacher.createFillBlank.selectCategory')}</option>
                            <option value="Grammar">{t('teacher.createFillBlank.catGrammar')}</option>
                            <option value="Vocabulary">{t('teacher.createFillBlank.catVocabulary')}</option>
                            <option value="Reading">{t('teacher.createFillBlank.catReading')}</option>
                            <option value="Listening">{t('teacher.createFillBlank.catListening')}</option>
                            <option value="Writing">{t('teacher.createFillBlank.catWriting')}</option>
                        </select>
                        {errors.category && (
                            <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teacher.createFillBlank.difficulty')}
                        </label>
                        <select
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="EASY">{t('teacher.createFillBlank.easy')}</option>
                            <option value="MEDIUM">{t('teacher.createFillBlank.medium')}</option>
                            <option value="HARD">{t('teacher.createFillBlank.hard')}</option>
                        </select>
                    </div>
                </div>

                {/* Points */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('teacher.createFillBlank.points')}
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* Explanation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('teacher.createFillBlank.explanationOptional')}
                    </label>
                    <textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        placeholder={t('teacher.createFillBlank.explanationPlaceholder')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    />
                </div>

                {/* Preview */}
                {showPreview && formData.questionText && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('teacher.createFillBlank.preview')}</h4>
                        <div className="bg-white p-4 rounded-lg">
                            <p
                                className="text-gray-900 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: renderPreview() }}
                            />
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    <strong>{t('teacher.createFillBlank.answerLabel')}</strong>
                                </p>
                                <ol className="list-decimal list-inside mt-2 space-y-1">
                                    {formData.correctAnswers.filter(a => a.trim()).map((answer, index) => (
                                        <li key={index} className="text-sm">
                                            ({index + 1}) {answer}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {t('teacher.createFillBlank.cancel')}
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
                    >
                        {t('teacher.createFillBlank.saveQuestion')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateFillBlankQuestion;
