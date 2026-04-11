import React, { useState } from 'react';
import aiService from '../../services/aiService';

/**
 * AI Answer Explanation Component for Korean Learning
 * Provides AI-powered explanations for Korean quiz/exam answers
 */
const AIAnswerExplanation = ({ question, studentAnswer, onExplanationReceived }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleExplain = async () => {
    // Toggle if already loaded
    if (explanation) {
      setShowExplanation(!showExplanation);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await aiService.explainKoreanAnswer({
        questionText: question.text || question.questionText,
        correctAnswer: question.correctAnswer,
        studentAnswer: studentAnswer,
        questionType: question.type || question.questionType || 'grammar', // grammar|vocabulary|listening|reading|writing
        topikLevel: question.topikLevel || question.level || 'TOPIK_I' // TOPIK_I|TOPIK_II|GENERAL
      });

      setExplanation(data);
      setShowExplanation(true);

      // Notify parent component
      if (onExplanationReceived) {
        onExplanationReceived(data);
      }

    } catch (error) {
      console.error('AI explanation error:', error);
      setError('AI tạm thời không khả dụng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    const typeIcons = {
      grammar: '📝',
      vocabulary: '📚',
      listening: '🎧',
      reading: '📖',
      writing: '✍️'
    };
    return typeIcons[type] || '💡';
  };

  const getCorrectAnswerText = () => {
    if (!question.correctAnswer) return '';

    // For multiple choice, show the correct option
    if (question.options && Array.isArray(question.options)) {
      const correctOption = question.options.find(opt => opt.id === question.correctAnswer);
      return correctOption ? correctOption.text : question.correctAnswer;
    }

    return question.correctAnswer;
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleExplain}
        disabled={loading}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            AI đang phân tích...
          </>
        ) : explanation ? (
          <>
            <span>{getIconForType(question.type || question.questionType)}</span>
            {showExplanation ? 'Ẩn giải thích' : 'Hiện giải thích'}
          </>
        ) : (
          <>
            <span>{getIconForType(question.type || question.questionType)}</span>
            Giải thích đáp án
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {explanation && showExplanation && (
        <div className="mt-4 p-5 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-xl border-2 border-purple-200 shadow-md animate-slide-in">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-200">
            <span className="text-2xl">🤖</span>
            <strong className="text-purple-900 text-base">Giải thích từ AI:</strong>
          </div>

          <div className="mb-4">
            <p className="text-gray-800 leading-relaxed text-sm">{explanation.explanation}</p>
          </div>

          {explanation.grammarPoint && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm">
                <strong className="text-blue-900">Điểm ngữ pháp:</strong>{' '}
                <span className="text-blue-800">{explanation.grammarPoint}</span>
              </p>
            </div>
          )}

          {explanation.tip && (
            <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-2">
              <span className="text-xl flex-shrink-0">💡</span>
              <p className="text-sm text-yellow-900 flex-1">{explanation.tip}</p>
            </div>
          )}

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm">
              <strong className="text-green-900">Đáp án đúng:</strong>{' '}
              <span className="text-green-800 font-medium">{getCorrectAnswerText()}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnswerExplanation;
