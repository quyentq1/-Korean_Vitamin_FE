import React, { useState } from 'react';
import aiService from '../../services/aiService';

/**
 * AI Grading Assistant Component for Korean Writing
 * Provides AI-powered grading and feedback for TOPIK writing tasks
 */
const AIGradingAssistant = ({ examAttempt, writingQuestion, onGradeReceived }) => {
  const [grading, setGrading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGrading, setShowGrading] = useState(false);

  const handleGrade = async () => {
    // Toggle if already loaded
    if (grading) {
      setShowGrading(!showGrading);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find answer in the answers array using examQuestionId
      const answerTarget = examAttempt.answers?.find(
        a => a.examQuestionId === writingQuestion.id || a.examQuestion?.id === writingQuestion.id
      );
      
      const studentEssay = answerTarget?.answerText || 
                          examAttempt.answers?.[writingQuestion.id] ||
                          examAttempt.studentAnswers?.[writingQuestion.id] ||
                          '';

      const data = await aiService.gradeKoreanWriting({
        writingPrompt: writingQuestion.prompt || writingQuestion.text,
        studentEssay: studentEssay,
        topikLevel: writingQuestion.topikLevel || 'TOPIK_II',
        taskType: writingQuestion.taskType || 'WRITING_54',
        maxScore: writingQuestion.maxScore || writingQuestion.points || 40
      });

      setGrading(data);
      setShowGrading(true);

      // Notify parent component
      if (onGradeReceived) {
        onGradeReceived(data);
      }

    } catch (error) {
      console.error('AI grading error:', error);
      setError('Chấm điểm AI thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getGradeLabel = (percentage) => {
    if (percentage >= 80) return 'Giỏi';
    if (percentage >= 60) return 'Khá';
    if (percentage >= 40) return 'Trung bình';
    return 'Cần cải thiện';
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleGrade}
        disabled={loading}
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            AI đang chấm...
          </>
        ) : grading ? (
          <>
            <span>✨</span>
            {showGrading ? 'Ẩn điểm AI' : 'Hiện điểm AI'}
          </>
        ) : (
          <>
            <span>✨</span>
            Gợi ý chấm điểm AI
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {grading && showGrading && (
        <div className="mt-4 p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl border-2 border-emerald-200 shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <strong className="text-emerald-900 text-base">Đánh giá từ AI</strong>
            </div>
            {grading.confidence && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                Độ tin cậy: {Math.round(grading.confidence * 100)}%
              </span>
            )}
          </div>

          {/* Overall Score */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke={Math.round((grading.totalScore / grading.maxScore) * 100) >= 80 ? '#10B981' :
                         Math.round((grading.totalScore / grading.maxScore) * 100) >= 60 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(grading.totalScore / grading.maxScore) * 100 * 2.2} 220`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{grading.totalScore}</span>
                <span className="text-xs text-gray-500">/ {grading.maxScore}</span>
              </div>
            </div>
            <div className="flex-1">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-1 ${getGradeColor((grading.totalScore / grading.maxScore) * 100)}`}>
                {getGradeLabel((grading.totalScore / grading.maxScore) * 100)}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((grading.totalScore / grading.maxScore) * 100)}%
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          {grading.breakdown && (
            <div className="mb-5 p-4 bg-white rounded-lg shadow-sm">
              <h4 className="text-base font-semibold text-gray-900 mb-3">Chi tiết điểm số:</h4>
              <div className="space-y-3">
                {grading.breakdown.content && renderScoreBar('Nội dung', grading.breakdown.content)}
                {grading.breakdown.structure && renderScoreBar('Cấu trúc', grading.breakdown.structure)}
                {grading.breakdown.grammar && renderScoreBar('Ngữ pháp', grading.breakdown.grammar)}
                {grading.breakdown.vocabulary && renderScoreBar('Từ vựng', grading.breakdown.vocabulary)}
              </div>
            </div>
          )}

          {/* Overall Feedback */}
          {grading.overallFeedback && (
            <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">📝 Nhận xét chung:</h4>
              <p className="text-sm text-blue-800 leading-relaxed">{grading.overallFeedback}</p>
            </div>
          )}

          {/* Corrections */}
          {grading.corrections && grading.corrections.length > 0 && (
            <div className="mb-5 p-4 bg-white rounded-lg shadow-sm">
              <h4 className="text-base font-semibold text-gray-900 mb-3">✏️ Gợi ý sửa đổi:</h4>
              <div className="space-y-3">
                {grading.corrections.map((correction, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <del className="text-red-600 line-through">{correction.original}</del>
                      <span className="text-gray-400">→</span>
                      <ins className="text-green-600 underline">{correction.suggested}</ins>
                    </div>
                    <p className="text-sm text-gray-700">💡 {correction.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons for Teacher */}
          <div className="flex gap-3">
            <button
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm hover:shadow"
              onClick={() => onGradeReceived && onGradeReceived(grading)}
            >
              ✓ Chấp nhận điểm AI
            </button>
            <button
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm hover:shadow"
              onClick={() => setShowGrading(false)}
            >
              ✎️ Chấm lại thủ công
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function renderScoreBar(label, scoreData) {
    const percentage = (scoreData.score / scoreData.max) * 100;

    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-semibold text-gray-900">{scoreData.score}/{scoreData.max}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {scoreData.comment && (
          <p className="text-xs text-gray-600 mt-1">{scoreData.comment}</p>
        )}
      </div>
    );
  }
};

export default AIGradingAssistant;
