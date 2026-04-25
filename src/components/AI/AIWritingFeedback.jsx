import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, AlertTriangle, Lightbulb, BookOpen, RefreshCw, Sparkles } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Swal from 'sweetalert2';

/**
 * AIWritingFeedback - Component hiển thị phân tích chi tiết từ AI cho bài viết
 * Phase 2: AI Integration
 *
 * Features:
 * - Detailed grammar analysis
 * - Vocabulary assessment
 * - Structure evaluation
 * - Style suggestions
 * - Plagiarism check
 * - Improvement recommendations
 */
const AIWritingFeedback = ({ submissionId, content, autoAnalyze = false }) => {
    const { t } = useTranslation();
    const [analyzing, setAnalyzing] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        grammar: true,
        vocabulary: true,
        structure: false,
        style: false,
        plagiarism: false
    });

    useEffect(() => {
        if (autoAnalyze && content) {
            analyzeContent();
        }
    }, [submissionId, content]);

    const analyzeContent = async () => {
        if (!content || content.trim().length < 50) {
            Swal.fire({
                icon: 'warning',
                title: t('ai.aiWritingFeedback.swalContentTooShortTitle'),
                text: t('ai.aiWritingFeedback.swalContentTooShortText'),
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        setAnalyzing(true);
        try {
            const response = await axiosClient.post('/api/ai/writing/analyze', {
                content,
                submissionId: submissionId || null
            });
            setFeedback(response.data);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: t('ai.aiWritingFeedback.swalErrorTitle'),
                text: error.response?.data?.message || t('ai.aiWritingFeedback.swalErrorText'),
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section]
        });
    };

    const getGrammarColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getVocabLevelColor = (level) => {
        switch (level) {
            case 'advanced': return 'text-green-600';
            case 'intermediate': return 'text-blue-600';
            case 'basic': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    if (analyzing) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium mb-2">{t('ai.aiWritingFeedback.analyzing')}</p>
                <p className="text-sm text-gray-500">{t('ai.aiWritingFeedback.analyzingSubtitle')}</p>
            </div>
        );
    }

    if (!feedback) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center py-8">
                    <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('ai.aiWritingFeedback.title')}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {t('ai.aiWritingFeedback.subtitle')}
                    </p>
                    <button
                        onClick={analyzeContent}
                        disabled={!content || content.trim().length < 50}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                        <Sparkles className="w-5 h-5" />
                        {t('ai.aiWritingFeedback.analyzeBtn')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-purple-100 text-sm mb-1">{t('ai.aiWritingFeedback.overallScore')}</p>
                        <p className="text-4xl font-bold">{feedback.overallScore}/100</p>
                    </div>
                    <div className="text-right">
                        <p className="text-purple-100 text-sm mb-1">{t('ai.aiWritingFeedback.proficiencyLevel')}</p>
                        <p className="text-xl font-semibold">{feedback.proficiencyLevel}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-green-600">{feedback.vocabStats.unique}</p>
                    <p className="text-xs text-gray-600">{t('ai.aiWritingFeedback.vocab')}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-blue-600">{feedback.vocabStats.advanced}</p>
                    <p className="text-xs text-gray-600">{t('ai.aiWritingFeedback.advanced')}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{feedback.grammarErrors}</p>
                    <p className="text-xs text-gray-600">{t('ai.aiWritingFeedback.grammarErrors')}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-purple-600">{feedback.sentenceCount}</p>
                    <p className="text-xs text-gray-600">{t('ai.aiWritingFeedback.sentences')}</p>
                </div>
            </div>

            {/* Grammar Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('grammar')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${feedback.grammarErrors > 0 ? 'text-red-500' : 'text-green-500'}`} />
                        <h3 className="font-semibold text-gray-900">{t('ai.aiWritingFeedback.grammarSection')}</h3>
                        <span className="text-sm text-gray-500">({feedback.grammarErrors?.length || 0} {t('ai.aiWritingFeedback.errors')})</span>
                    </div>
                    <span className="text-gray-400">{expandedSections.grammar ? '▲' : '▼'}</span>
                </button>

                {expandedSections.grammar && feedback.grammarErrors && (
                    <div className="px-6 pb-4 space-y-3">
                        {feedback.grammarErrors.length === 0 ? (
                            <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <p className="text-sm text-green-800">{t('ai.aiWritingFeedback.noGrammarErrors')}</p>
                            </div>
                        ) : (
                            feedback.grammarErrors.map((error, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border ${getGrammarColor(error.severity)}`}>
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="font-medium text-sm">{error.type}</p>
                                        <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                                            {t('ai.aiWritingFeedback.line')} {error.line}
                                        </span>
                                    </div>
                                    <p className="text-sm mb-2">
                                        <span className="line-through opacity-60">{error.original}</span>
                                    </p>
                                    <p className="text-sm font-medium">
                                        {t('ai.aiWritingFeedback.suggestion')}: <span className="text-green-700">{error.correction}</span>
                                    </p>
                                    {error.explanation && (
                                        <p className="text-xs mt-2 opacity-75">{error.explanation}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Vocabulary Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('vocabulary')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-gray-900">{t('ai.aiWritingFeedback.vocabularySection')}</h3>
                        <span className="text-sm text-gray-500">({feedback.vocabAnalysis?.words?.length || 0} {t('ai.aiWritingFeedback.words')})</span>
                    </div>
                    <span className="text-gray-400">{expandedSections.vocabulary ? '▲' : '▼'}</span>
                </button>

                {expandedSections.vocabulary && feedback.vocabAnalysis && (
                    <div className="px-6 pb-4 space-y-4">
                        {/* Vocabulary Level Distribution */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-green-50 rounded-lg text-center">
                                <p className="text-lg font-bold text-green-600">{feedback.vocabStats.basic}</p>
                                <p className="text-xs text-gray-600">{t('ai.aiWritingFeedback.basic')}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg text-center">
                                <p className="text-lg font-bold text-blue-600">{feedback.vocabStats.intermediate}</p>
                                <p className="text-xs text-gray-600">TOPIK II</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg text-center">
                                <p className="text-lg font-bold text-purple-600">{feedback.vocabStats.advanced}</p>
                                <p className="text-xs text-gray-600">{t('ai.aiWritingFeedback.advanced')}</p>
                            </div>
                        </div>

                        {/* Suggested Words */}
                        {feedback.vocabAnalysis.suggestions && feedback.vocabAnalysis.suggestions.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2 text-sm">{t('ai.aiWritingFeedback.suggestedWords')}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.vocabAnalysis.suggestions.map((word, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm cursor-help"
                                            title={word.meaning}
                                        >
                                            {word.word} <span className="text-xs opacity-75">({word.level})</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Repeated Words */}
                        {feedback.vocabAnalysis.repeated && feedback.vocabAnalysis.repeated.length > 0 && (
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <h4 className="font-medium text-yellow-900 mb-2 text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {t('ai.aiWritingFeedback.repeatedWords')}:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.vocabAnalysis.repeated.map((word, idx) => (
                                        <span key={idx} className="text-sm text-yellow-800">
                                            <strong>{word.word}</strong> ({word.count}x)
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Structure Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('structure')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-semibold text-gray-900">{t('ai.aiWritingFeedback.structureSection')}</h3>
                        <span className={`text-sm px-2 py-1 rounded ${
                            feedback.structureScore >= 80 ? 'bg-green-100 text-green-700' :
                            feedback.structureScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {feedback.structureScore}/100
                        </span>
                    </div>
                    <span className="text-gray-400">{expandedSections.structure ? '▲' : '▼'}</span>
                </button>

                {expandedSections.structure && feedback.structureAnalysis && (
                    <div className="px-6 pb-4 space-y-3">
                        {/* Paragraph Structure */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2 text-sm">{t('ai.aiWritingFeedback.paragraphStructure')}</h4>
                            <div className="space-y-2">
                                {feedback.structureAnalysis.paragraphs?.map((para, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">{t('ai.aiWritingFeedback.paragraph')} {idx + 1}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">{para.sentences} {t('ai.aiWritingFeedback.sentences')}</span>
                                            <CheckCircle className={`w-4 h-4 ${para.valid ? 'text-green-500' : 'text-yellow-500'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Suggestions */}
                        {feedback.structureAnalysis.suggestions && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2 text-sm">{t('ai.aiWritingFeedback.structureSuggestions')}</h4>
                                <ul className="space-y-2">
                                    {feedback.structureAnalysis.suggestions.map((suggestion, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="text-blue-500 mt-0.5">•</span>
                                            <span>{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Style & Tone */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('style')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-gray-900">{t('ai.aiWritingFeedback.styleSection')}</h3>
                    </div>
                    <span className="text-gray-400">{expandedSections.style ? '▲' : '▼'}</span>
                </button>

                {expandedSections.style && feedback.styleAnalysis && (
                    <div className="px-6 pb-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">{t('ai.aiWritingFeedback.tone')}</p>
                                <p className="font-medium text-purple-900">{feedback.styleAnalysis.tone}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">{t('ai.aiWritingFeedback.formality')}</p>
                                <p className="font-medium text-blue-900">{feedback.styleAnalysis.formality}</p>
                            </div>
                        </div>

                        {feedback.styleAnalysis.suggestions && (
                            <ul className="space-y-2">
                                {feedback.styleAnalysis.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-gray-50 rounded">
                                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* Plagiarism Check */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('plagiarism')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 ${feedback.plagiarismScore < 10 ? 'text-green-500' : 'text-orange-500'}`} />
                        <h3 className="font-semibold text-gray-900">{t('ai.aiWritingFeedback.plagiarismSection')}</h3>
                        <span className={`text-sm px-2 py-1 rounded ${
                            feedback.plagiarismScore < 10 ? 'bg-green-100 text-green-700' :
                            feedback.plagiarismScore < 30 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {feedback.plagiarismScore}% {t('ai.aiWritingFeedback.similar')}
                        </span>
                    </div>
                    <span className="text-gray-400">{expandedSections.plagiarism ? '▲' : '▼'}</span>
                </button>

                {expandedSections.plagiarism && feedback.plagiarismDetails && (
                    <div className="px-6 pb-4">
                        {feedback.plagiarismScore < 10 ? (
                            <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <p className="text-sm text-green-800">
                                    {t('ai.aiWritingFeedback.noPlagiarism')}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {feedback.plagiarismDetails.matches?.map((match, idx) => (
                                    <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <p className="text-sm text-orange-900 mb-1">
                                            {match.text.substring(0, 100)}...
                                        </p>
                                        <p className="text-xs text-orange-700">
                                            {t('ai.aiWritingFeedback.source')}: {match.source}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Overall Recommendations */}
            {feedback.recommendations && feedback.recommendations.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        {t('ai.aiWritingFeedback.improvementRecommendations')}
                    </h3>
                    <ul className="space-y-2">
                        {feedback.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-purple-600 font-bold">{idx + 1}.</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Re-analyze Button */}
            <div className="flex justify-center">
                <button
                    onClick={analyzeContent}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                    <RefreshCw className="w-4 h-4" />
                    {t('ai.aiWritingFeedback.reAnalyze')}
                </button>
            </div>
        </div>
    );
};

export default AIWritingFeedback;
