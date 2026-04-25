import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Target, Clock, Plus, Trash2 } from 'lucide-react';

/**
 * ExamBlueprint - Component thiết kế blueprint đề thi
 * Priority 1: Exam System (Admin)
 */
const ExamBlueprint = ({ blueprint, onChange, onGenerate }) => {
    const { t } = useTranslation();
    const [sections, setSections] = useState(blueprint?.sections || []);

    const addSection = () => {
        setSections([...sections, {
            category: '',
            difficulty: '',
            questionType: '',
            count: 5,
            pointsPerQuestion: 1
        }]);
    };

    const removeSection = (index) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    const updateSection = (index, field, value) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setSections(newSections);
    };

    const calculateTotal = () => {
        return sections.reduce((acc, section) => ({
            questions: acc.questions + (section.count || 0),
            points: acc.points + (section.count || 0) * (section.pointsPerQuestion || 0)
        }), { questions: 0, points: 0 });
    };

    const totals = calculateTotal();

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                    <Layers className="w-6 h-6 text-indigo-600" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{t('admin.examBlueprint.title')}</h3>
                        <p className="text-sm text-gray-600">{t('admin.examBlueprint.subtitle')}</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">{t('admin.examBlueprint.totalQuestions')}</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{totals.questions}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">{t('admin.examBlueprint.totalPoints')}</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{totals.points}</p>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {t('admin.examBlueprint.category')}
                                    </label>
                                    <select
                                        value={section.category}
                                        onChange={(e) => updateSection(index, 'category', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="">{t('admin.examBlueprint.select')}</option>
                                        <option value="Grammar">{t('admin.examBlueprint.grammar')}</option>
                                        <option value="Vocabulary">{t('admin.examBlueprint.vocabulary')}</option>
                                        <option value="Reading">{t('admin.examBlueprint.reading')}</option>
                                        <option value="Listening">{t('admin.examBlueprint.listening')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {t('admin.examBlueprint.difficulty')}
                                    </label>
                                    <select
                                        value={section.difficulty}
                                        onChange={(e) => updateSection(index, 'difficulty', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="">{t('admin.examBlueprint.select')}</option>
                                        <option value="EASY">{t('admin.examBlueprint.easy')}</option>
                                        <option value="MEDIUM">{t('admin.examBlueprint.medium')}</option>
                                        <option value="HARD">{t('admin.examBlueprint.hard')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {t('admin.examBlueprint.questionType')}
                                    </label>
                                    <select
                                        value={section.questionType}
                                        onChange={(e) => updateSection(index, 'questionType', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="">{t('admin.examBlueprint.select')}</option>
                                        <option value="MULTIPLE_CHOICE">{t('admin.examBlueprint.multipleChoice')}</option>
                                        <option value="FILL_BLANK">{t('admin.examBlueprint.fillBlank')}</option>
                                        <option value="SHORT_ANSWER">{t('admin.examBlueprint.shortAnswer')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {t('admin.examBlueprint.quantity')}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={section.count}
                                        onChange={(e) => updateSection(index, 'count', parseInt(e.target.value))}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {t('admin.examBlueprint.pointsPerQuestion')}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={section.pointsPerQuestion}
                                        onChange={(e) => updateSection(index, 'pointsPerQuestion', parseInt(e.target.value))}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {sections.length > 1 && (
                                        <button
                                            onClick={() => removeSection(index)}
                                            className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addSection}
                    className="mt-4 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    {t('admin.examBlueprint.addSection')}
                </button>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => onChange({ sections })}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        {t('admin.examBlueprint.save')}
                    </button>
                    <button
                        onClick={() => onGenerate(sections)}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
                    >
                        <Target className="w-4 h-4" />
                        {t('admin.examBlueprint.generate')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamBlueprint;
