import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import aiService from '../../services/aiService';

/**
 * AI Admin Analytics Component
 * Provides AI-powered insights on Korean learning data for administrators
 */
const AIAdminAnalytics = ({ onAnalyticsReceived }) => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [dateRange, setDateRange] = useState({
    reportType: 'topic_analysis',
    dateFrom: getLastWeekDate(),
    dateTo: getTodayDate()
  });

  function getLastWeekDate() {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  }

  function getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  const handleGenerateAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await aiService.getAnalytics(dateRange);

      setAnalytics(data);
      setShowAnalytics(true);

      // Notify parent component
      if (onAnalyticsReceived) {
        onAnalyticsReceived(data);
      }

    } catch (error) {
      console.error('AI analytics error:', error);
      setError(t('ai.aiAdminAnalytics.errorGenerate'));
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (reportType) => {
    setDateRange(prev => ({ ...prev, reportType }));
    // Clear previous analytics when changing report type
    if (analytics) {
      setAnalytics(null);
      setShowAnalytics(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl shadow-md p-5">
        <div className="mb-5">
          <h3 className="text-xl font-bold text-gray-900 mb-1">🤖 {t('ai.aiAdminAnalytics.title')}</h3>
          <p className="text-sm text-gray-600">
            {t('ai.aiAdminAnalytics.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">{t('ai.aiAdminAnalytics.reportTypeLabel')}</label>
            <select
              value={dateRange.reportType}
              onChange={(e) => handleReportTypeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
            >
              <option value="topic_analysis">{t('ai.aiAdminAnalytics.topicAnalysis')}</option>
              <option value="weekly_summary">{t('ai.aiAdminAnalytics.weeklySummary')}</option>
              <option value="student_group_analysis">{t('ai.aiAdminAnalytics.studentGroupAnalysis')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">{t('ai.aiAdminAnalytics.dateFromLabel')}</label>
            <input
              type="date"
              value={dateRange.dateFrom}
              onChange={(e) => setDateRange({ ...dateRange, dateFrom: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">{t('ai.aiAdminAnalytics.dateToLabel')}</label>
            <input
              type="date"
              value={dateRange.dateTo}
              onChange={(e) => setDateRange({ ...dateRange, dateTo: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
            />
          </div>

          <button
            onClick={handleGenerateAnalytics}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('ai.aiAdminAnalytics.analyzing')}
              </>
            ) : (
              <>
                📊 {t('ai.aiAdminAnalytics.generateBtn')}
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {analytics && showAnalytics && (
        <div className="mt-5 p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 rounded-xl border-2 border-blue-200 shadow-md">
          {/* Summary Section */}
          <div className="flex items-start gap-4 p-5 bg-white rounded-lg shadow-sm mb-5">
            <div className="text-5xl">📈</div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-blue-900 mb-3">{t('ai.aiAdminAnalytics.overview')}</h4>
              <p className="text-gray-800 leading-relaxed mb-2">{analytics.summary}</p>
              {analytics.generatedAt && (
                <span className="text-xs text-gray-600">
                  Generated: {new Date(analytics.generatedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Recommendations Section */}
          {analytics.recommendations && analytics.recommendations.length > 0 && (
            <div className="mb-5 p-5 bg-white rounded-lg shadow-sm">
              <h4 className="text-base font-bold text-blue-900 mb-4">💡 {t('ai.aiAdminAnalytics.improvementSuggestions')}</h4>
              <ul className="space-y-2">
                {analytics.recommendations.map((rec, index) => (
                  <li key={index} className="p-3 bg-blue-50 border-l-3 border-blue-500 rounded text-sm text-blue-900 leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weak Topics Section */}
          {analytics.weakTopics && analytics.weakTopics.length > 0 && (
            <div className="mb-5 p-5 bg-white rounded-lg shadow-sm">
              <h4 className="text-base font-bold text-red-700 mb-4">⚠️ {t('ai.aiAdminAnalytics.weakTopics')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.weakTopics.map((topic, index) => (
                  <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm font-bold text-red-900 mb-1">{topic.topic}</div>
                    <div className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded inline-block mb-2">
                      {topic.level}
                    </div>
                    <div
                      className={`text-2xl font-bold mb-2 ${
                        topic.correctRate >= 70 ? 'text-green-600' :
                        topic.correctRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}
                    >
                      {topic.correctRate}% {t('ai.aiAdminAnalytics.correct')}
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          topic.correctRate >= 70 ? 'bg-green-500' :
                          topic.correctRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${topic.correctRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cached Info */}
          {analytics.cachedUntil && (
            <div className="p-3 bg-blue-100 rounded-lg text-center">
              <p className="text-xs text-blue-800">
                ℹ️ {t('ai.aiAdminAnalytics.cachedUntil')}: {new Date(analytics.cachedUntil).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAdminAnalytics;
