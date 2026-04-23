import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  Plus,
  Check,
  BookOpen,
  FileText,
  Loader2,
  ChevronDown,
  Info,
  Filter,
  Eye
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import styles from '../../pages/Teacher/ExamEditor.module.css';

/**
 * Enhanced Question Bank Modal Component
 *
 * Features:
 * - Smooth animations and transitions
 * - Enhanced checkbox states
 * - Real-time search with debouncing
 * - Better visual feedback
 * - Keyboard shortcuts
 * - Accessibility improvements
 */
const QuestionBankModal = ({
  isOpen,
  onClose,
  availableQuestions,
  selectedQuestions,
  onToggleSelection,
  onAddSelected,
  courseInfo,
  unit = null // NEW: Unit for Class exams (1-12)
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterTopikType, setFilterTopikType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search and filter
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('=== QuestionBankModal Filter Debug ===');
      console.log('availableQuestions.length:', availableQuestions.length);
      console.log('unit prop:', unit);
      console.log('searchTerm:', searchTerm);
      console.log('filterTopikType:', filterTopikType);

      let filtered = availableQuestions;

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(q =>
          (q.questionText || q.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (q.topikType || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log('After search filter:', filtered.length);
      }

      // Filter by topikType
      if (filterTopikType) {
        filtered = filtered.filter(q => q.topikType === filterTopikType);
        console.log('After topikType filter:', filtered.length);
      }

      // Filter by unit (for Class exams)
      if (unit !== null && unit !== undefined) {
        console.log('Filtering by unit:', unit);
        console.log('Questions before unit filter:', filtered.map(q => ({ id: q.id, unit: q.unit, verificationStatus: q.verificationStatus })));
        filtered = filtered.filter(q => q.unit === unit);
        console.log('After unit filter:', filtered.length);
      }

      // NEW: Filter by verification status - ONLY show APPROVED questions
      console.log('Questions before verification filter:', filtered.map(q => ({ id: q.id, unit: q.unit, verificationStatus: q.verificationStatus })));
      filtered = filtered.filter(q => q.verificationStatus === 'APPROVED');
      console.log('After verification filter:', filtered.length);

      console.log('Final filteredQuestions.length:', filtered.length);
      console.log('=====================================');

      setFilteredQuestions(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filterTopikType, availableQuestions, unit]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      // ESC to close
      if (e.key === 'Escape') {
        onClose();
      }

      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('question-search')?.focus();
      }

      // Enter to add selected (if has selection)
      if (e.key === 'Enter' && selectedQuestions.length > 0 && e.ctrlKey) {
        e.preventDefault();
        onAddSelected();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, selectedQuestions]);

  const topikTypes = [...new Set(availableQuestions.map(q => q.topikType).filter(Boolean))];

  if (!isOpen) return null;

  const displayQuestions = filteredQuestions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with animation */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        style={{ opacity: '1' }}
      ></div>

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col transform transition-all duration-300"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {t('exam.questionBank', 'Ngân Hàng Câu Hỏi')}
                </h3>
                {courseInfo && (
                  <p className="text-sm text-blue-100 mt-0.5">
                    {courseInfo.name} ({courseInfo.level})
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg">
              <FileText className="w-4 h-4 text-white" />
              <span className="text-white font-medium">
                {availableQuestions.length} {t('teacher.questionBank.questions')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg">
              <Check className="w-4 h-4 text-white" />
              <span className="text-white font-medium">
                {selectedQuestions.length} {t('teacher.questionBank.selected')}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="question-search"
                type="text"
                placeholder={t('exam.searchQuestions', 'Tìm kiếm câu hỏi... (Ctrl+K)')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border-2 transition-all duration-200 ${
                showFilters
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="Toggle filters"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Pills */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-2 animate-fadeIn">
              <button
                onClick={() => setFilterTopikType('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  !filterTopikType
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {t('teacher.questionBank.all')}
              </button>
              {topikTypes.slice(0, 10).map(topikType => (
                <button
                  key={topikType}
                  onClick={() => setFilterTopikType(filterTopikType === topikType ? '' : topikType)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    filterTopikType === topikType
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {topikType}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto smooth-scroll p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">{t('teacher.questionBank.loadingQuestions')}</p>
            </div>
          ) : displayQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">
                {searchTerm ? t('teacher.questionBank.noResults') : t('teacher.questionBank.noQuestions')}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  {t('teacher.questionBank.clearFilters')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {displayQuestions.map((question, index) => {
                const isSelected = selectedQuestions.find(q => q.id === question.id);
                const isAlreadyAdded = question.isAlreadyAdded;

                return (
                  <div
                    key={question.id}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.01]'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
                    } ${isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => !isAlreadyAdded && onToggleSelection(question)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Custom Checkbox */}
                      <div className="relative mt-1">
                        <div className={`w-5 h-5 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 group-hover:border-blue-400'
                        } ${isAlreadyAdded ? 'bg-gray-100 border-gray-300' : ''}`}>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="info" size="sm">
                            {question.categoryName || question.category?.name || 'N/A'}
                          </Badge>
                          {/* Show Unit for Class questions, Level for Course questions */}
                          {question.unit ? (
                            <Badge variant="purple" size="sm">
                              Unit {question.unit}
                            </Badge>
                          ) : (
                            <Badge variant="warning" size="sm">
                              {question.level?.replace('LEVEL_', 'Level ') || 'N/A'}
                            </Badge>
                          )}
                          {question.topikType && (
                            <Badge variant="success" size="sm">
                              {question.topikType}
                            </Badge>
                          )}
                          {/* Verification Status Badge */}
                          {question.verificationStatus && (
                            <Badge
                              variant={question.verificationStatus === 'APPROVED' ? 'success' : question.verificationStatus === 'REJECTED' ? 'error' : 'warning'}
                              size="sm"
                            >
                              {question.verificationStatus === 'APPROVED' ? '✅' : question.verificationStatus === 'REJECTED' ? '❌' : '⏳'} {question.verificationStatus}
                            </Badge>
                          )}
                          {isAlreadyAdded && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              <Check className="w-3 h-3" />
                              {t('teacher.questionBank.alreadyAdded')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {question.questionText || question.content || 'No content'}
                        </p>
                        {question.options && question.options.length > 0 && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                            <span>{question.options.length} {t('teacher.questionBank.answers')}</span>
                            <span>•</span>
                            <span>{question.points || 1} {t('teacher.questionBank.points')}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Preview functionality
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        aria-label="Preview"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && !isAlreadyAdded && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedQuestions.length > 0 ? (
                <span className="font-medium text-blue-700">
                  {t('teacher.questionBank.selectedCount', { count: selectedQuestions.length })}
                </span>
              ) : (
                <span>{t('teacher.questionBank.noneSelected')}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              >
                {t('teacher.questionBank.cancel')}
              </button>
              <button
                onClick={onAddSelected}
                disabled={selectedQuestions.length === 0}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('teacher.questionBank.add')} {selectedQuestions.length > 0 && `(${selectedQuestions.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBankModal;
