import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';

/**
 * QuestionSearchFilter - Component tìm kiếm và lọc câu hỏi
 * Priority 1: Question Bank
 */
const QuestionSearchFilter = ({ onFilterChange, initialFilters = {} }) => {
    const { t } = useTranslation();
    const [filters, setFilters] = useState({
        searchTerm: '',
        category: '',
        questionType: '',
        difficulty: '',
        status: '',
        tags: '',
        ...initialFilters
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filters);
        }
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            searchTerm: '',
            category: '',
            questionType: '',
            difficulty: '',
            status: '',
            tags: ''
        });
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    const categories = [
        'Grammar',
        'Vocabulary',
        'Reading',
        'Listening',
        'Writing',
        'Speaking',
        'Culture'
    ];

    const questionTypes = [
        { value: 'MULTIPLE_CHOICE', label: t('teacher.questionFilter.typeMCQ') },
        { value: 'FILL_BLANK', label: t('teacher.questionFilter.typeFillBlank') },
        { value: 'READING', label: t('teacher.questionFilter.typeReading') },
        { value: 'LISTENING', label: t('teacher.questionFilter.typeListening') },
        { value: 'WRITING', label: t('teacher.questionFilter.typeWriting') },
        { value: 'SPEAKING', label: t('teacher.questionFilter.typeSpeaking') },
        { value: 'SHORT_ANSWER', label: t('teacher.questionFilter.typeShortAnswer') },
        { value: 'ESSAY', label: t('teacher.questionFilter.typeEssay') }
    ];

    const difficulties = [
        { value: 'EASY', label: t('teacher.questionFilter.easy'), color: 'bg-green-100 text-green-700' },
        { value: 'MEDIUM', label: t('teacher.questionFilter.medium'), color: 'bg-yellow-100 text-yellow-700' },
        { value: 'HARD', label: t('teacher.questionFilter.hard'), color: 'bg-red-100 text-red-700' }
    ];

    const statuses = [
        { value: 'DRAFT', label: t('teacher.questionFilter.statusDraft'), color: 'bg-gray-100 text-gray-700' },
        { value: 'PENDING', label: t('teacher.questionFilter.statusPending'), color: 'bg-yellow-100 text-yellow-700' },
        { value: 'APPROVED', label: t('teacher.questionFilter.statusApproved'), color: 'bg-green-100 text-green-700' },
        { value: 'REJECTED', label: t('teacher.questionFilter.statusRejected'), color: 'bg-red-100 text-red-700' }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Main Search Bar */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            placeholder={t('teacher.questionFilter.searchPlaceholder')}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {filters.searchTerm && (
                            <button
                                onClick={() => handleFilterChange('searchTerm', '')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 transition-colors ${
                            showAdvanced || hasActiveFilters
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        {t('teacher.questionFilter.filter')}
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {t('teacher.questionFilter.clearFilters')}
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Category */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                {t('teacher.questionFilter.category')}
                            </label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="">{t('teacher.questionFilter.all')}</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Question Type */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                {t('teacher.questionFilter.questionType')}
                            </label>
                            <select
                                value={filters.questionType}
                                onChange={(e) => handleFilterChange('questionType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="">{t('teacher.questionFilter.all')}</option>
                                {questionTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                {t('teacher.questionFilter.difficulty')}
                            </label>
                            <select
                                value={filters.difficulty}
                                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="">{t('teacher.questionFilter.all')}</option>
                                {difficulties.map(diff => (
                                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                {t('teacher.questionFilter.status')}
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="">{t('teacher.questionFilter.all')}</option>
                                {statuses.map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                {t('teacher.questionFilter.tags')}
                            </label>
                            <input
                                type="text"
                                value={filters.tags}
                                onChange={(e) => handleFilterChange('tags', e.target.value)}
                                placeholder="VD: present-tense, beginner"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                {filters.category && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                        {t('teacher.questionFilter.category')}: {filters.category}
                                        <button
                                            onClick={() => handleFilterChange('category', '')}
                                            className="hover:text-indigo-900"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.questionType && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                        {t('teacher.questionFilter.typeShort')}: {questionTypes.find(t => t.value === filters.questionType)?.label}
                                        <button
                                            onClick={() => handleFilterChange('questionType', '')}
                                            className="hover:text-indigo-900"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.difficulty && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                        {t('teacher.questionFilter.difficulty')}: {difficulties.find(d => d.value === filters.difficulty)?.label}
                                        <button
                                            onClick={() => handleFilterChange('difficulty', '')}
                                            className="hover:text-indigo-900"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.status && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                        {t('teacher.questionFilter.status')}: {statuses.find(s => s.value === filters.status)?.label}
                                        <button
                                            onClick={() => handleFilterChange('status', '')}
                                            className="hover:text-indigo-900"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionSearchFilter;
