import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

/**
 * CreateMCQQuestion - Component tạo câu hỏi trắc nghiệm
 * Priority 1: Question Bank
 */
const CreateMCQQuestion = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        questionText: '',
        category: '',
        difficulty: 'MEDIUM',
        points: 1,
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        tags: []
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        if (formData.options.length < 6) {
            setFormData({ ...formData, options: [...formData.options, ''] });
        }
    };

    const removeOption = (index) => {
        if (formData.options.length > 2) {
            const newOptions = formData.options.filter((_, i) => i !== index);
            setFormData({ ...formData, options: newOptions });
        }
    };

    const setCorrectAnswer = (index) => {
        setFormData({ ...formData, correctAnswer: formData.options[index] });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.questionText.trim()) {
            newErrors.questionText = t('teacher.createMCQ.errorQuestionRequired');
        }

        const validOptions = formData.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
            newErrors.options = t('teacher.createMCQ.errorMinOptions');
        }

        if (!formData.correctAnswer) {
            newErrors.correctAnswer = t('teacher.createMCQ.errorCorrectAnswer');
        }

        if (!formData.category) {
            newErrors.category = t('teacher.createMCQ.errorCategoryRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            onSubmit({
                ...formData,
                questionType: 'MULTIPLE_CHOICE'
            });
        }
    };

    const difficultyColors = {
        EASY: 'bg-green-100 text-green-700',
        MEDIUM: 'bg-yellow-100 text-yellow-700',
        HARD: 'bg-red-100 text-red-700'
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900">
                    {t('teacher.createMCQ.title')}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    {t('teacher.createMCQ.subtitle')}
                </p>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Question Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('teacher.createMCQ.questionContent')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.questionText}
                        onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                        placeholder={t('teacher.createMCQ.questionPlaceholder')}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
                            errors.questionText ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.questionText && (
                        <p className="text-sm text-red-600 mt-1">{errors.questionText}</p>
                    )}
                </div>

                {/* Category & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teacher.createMCQ.category')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                errors.category ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">{t('teacher.createMCQ.selectCategory')}</option>
                            <option value="Grammar">{t('teacher.createMCQ.catGrammar')}</option>
                            <option value="Vocabulary">{t('teacher.createMCQ.catVocabulary')}</option>
                            <option value="Reading">{t('teacher.createMCQ.catReading')}</option>
                            <option value="Listening">{t('teacher.createMCQ.catListening')}</option>
                            <option value="Writing">{t('teacher.createMCQ.catWriting')}</option>
                            <option value="Speaking">{t('teacher.createMCQ.catSpeaking')}</option>
                            <option value="Culture">{t('teacher.createMCQ.catCulture')}</option>
                        </select>
                        {errors.category && (
                            <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teacher.createMCQ.difficulty')}
                        </label>
                        <select
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="EASY">{t('teacher.createMCQ.easy')}</option>
                            <option value="MEDIUM">{t('teacher.createMCQ.medium')}</option>
                            <option value="HARD">{t('teacher.createMCQ.hard')}</option>
                        </select>
                    </div>
                </div>

                {/* Points */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('teacher.createMCQ.points')}
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Options */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('teacher.createMCQ.answers')} <span className="text-red-500">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={addOption}
                            disabled={formData.options.length >= 6}
                            className="text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            {t('teacher.createMCQ.addAnswer')}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCorrectAnswer(index)}
                                    className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        formData.correctAnswer === option
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-gray-300 hover:border-green-500'
                                    }`}
                                >
                                    {formData.correctAnswer === option ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                                    )}
                                </button>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={t('teacher.createMCQ.answerN', { n: index + 1 })}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {formData.options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {errors.options && (
                        <p className="text-sm text-red-600 mt-2">{errors.options}</p>
                    )}

                    {errors.correctAnswer && (
                        <p className="text-sm text-red-600 mt-2">{errors.correctAnswer}</p>
                    )}
                </div>

                {/* Explanation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('teacher.createMCQ.explanationOptional')}
                    </label>
                    <textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        placeholder={t('teacher.createMCQ.explanationPlaceholder')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('teacher.createMCQ.tagsOptional')}
                    </label>
                    <input
                        type="text"
                        value={formData.tags.join(', ')}
                        onChange={(e) => setFormData({
                            ...formData,
                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        })}
                        placeholder="VD: grammar, present-tense, beginner"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('teacher.createMCQ.preview')}</h4>
                    <div className="bg-white p-4 rounded-lg">
                        <p className="font-medium text-gray-900 mb-3">
                            {formData.questionText || t('teacher.createMCQ.questionContentPlaceholder')}
                        </p>
                        <div className="space-y-2">
                            {formData.options.filter(opt => opt.trim()).map((option, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border-2 ${
                                        formData.correctAnswer === option
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-full border-2 ${
                                            formData.correctAnswer === option
                                                ? 'border-green-500 bg-green-500'
                                                : 'border-gray-300'
                                        }`} />
                                        <span>{option}</span>
                                        {formData.correctAnswer === option && (
                                            <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {t('teacher.createMCQ.cancel')}
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                    >
                        {t('teacher.createMCQ.saveQuestion')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateMCQQuestion;
