import { useState, useEffect } from 'react';
import { Mic, Volume2, Waveform, CheckCircle, AlertTriangle, Lightbulb, Star, Sparkles } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Swal from 'sweetalert2';

/**
 * AISpeakingFeedback - Component hiển thị phân tích chi tiết từ AI cho bài nói
 * Phase 2: AI Integration
 *
 * Features:
 * - Pronunciation analysis
 * - Fluency assessment
 * - Grammar accuracy
 * - Vocabulary usage
 * - Audio quality metrics
 * - Pitch & tone analysis
 * - Speaking rate analysis
 */
const AISpeakingFeedback = ({ submissionId, audioUrl, autoAnalyze = false }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        pronunciation: true,
        fluency: true,
        grammar: false,
        vocabulary: false,
        audioQuality: false,
        recommendations: false
    });

    useEffect(() => {
        if (autoAnalyze && audioUrl) {
            analyzeAudio();
        }
    }, [submissionId, audioUrl]);

    const analyzeAudio = async () => {
        if (!audioUrl) {
            Swal.fire({
                icon: 'warning',
                title: 'Thiếu audio',
                text: 'Vui lòng tải lên hoặc ghi âm bài nói trước khi phân tích',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        setAnalyzing(true);
        try {
            const response = await axiosClient.post('/api/ai/speaking/analyze', {
                audioUrl,
                submissionId: submissionId || null
            });
            setFeedback(response.data);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi phân tích',
                text: error.response?.data?.message || 'Không thể phân tích bài nói. Vui lòng thử lại.',
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

    const getScoreColor = (score, max = 100) => {
        const percentage = (score / max) * 100;
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score, max = 100) => {
        const percentage = (score / max) * 100;
        if (percentage >= 80) return 'bg-green-50 border-green-200';
        if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    if (analyzing) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="animate-pulse flex justify-center mb-4">
                    <div className="flex items-end gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-2 bg-purple-600 rounded-full"
                                style={{ height: `${20 + Math.random() * 30}px`, animationDelay: `${i * 0.1}s` }}
                            ></div>
                        ))}
                    </div>
                </div>
                <p className="text-gray-700 font-medium mb-2">Đang phân tích bài nói...</p>
                <p className="text-sm text-gray-500">AI đang phân tích phát âm, ngữ điệu và trôi chảy</p>
            </div>
        );
    }

    if (!feedback) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center py-8">
                    <Mic className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Phân tích bài nói bằng AI
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Nhận phản hồi chi tiết về phát âm, ngữ điệu, độ trôi chảy và ngữ pháp
                    </p>
                    <button
                        onClick={analyzeAudio}
                        disabled={!audioUrl}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                        <Sparkles className="w-5 h-5" />
                        Phân tích ngay
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-purple-100 text-sm mb-1">Điểm tổng quan</p>
                        <p className="text-4xl font-bold">{feedback.overallScore}/100</p>
                    </div>
                    <div className="text-right">
                        <p className="text-purple-100 text-sm mb-1">Trình độ nói</p>
                        <p className="text-xl font-semibold">{feedback.proficiencyLevel}</p>
                    </div>
                </div>
                {feedback.duration && (
                    <p className="text-purple-100 text-sm mt-3">Thời lượng: {feedback.duration} giây</p>
                )}
            </div>

            {/* Quick Scores */}
            <div className="grid grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <p className={`text-2xl font-bold ${getScoreColor(feedback.pronunciationScore)}`}>
                        {feedback.pronunciationScore}
                    </p>
                    <p className="text-xs text-gray-600">Phát âm</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <p className={`text-2xl font-bold ${getScoreColor(feedback.fluencyScore)}`}>
                        {feedback.fluencyScore}
                    </p>
                    <p className="text-xs text-gray-600">Troi chảy</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <p className={`text-2xl font-bold ${getScoreColor(feedback.grammarScore)}`}>
                        {feedback.grammarScore}
                    </p>
                    <p className="text-xs text-gray-600">Ngữ pháp</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <p className={`text-2xl font-bold ${getScoreColor(feedback.vocabularyScore)}`}>
                        {feedback.vocabularyScore}
                    </p>
                    <p className="text-xs text-gray-600">Từ vựng</p>
                </div>
            </div>

            {/* Pronunciation Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('pronunciation')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-gray-900">Phát âm</h3>
                        <span className={`text-sm px-2 py-1 rounded ${getScoreBgColor(feedback.pronunciationScore)}`}>
                            {feedback.pronunciationScore}/100
                        </span>
                    </div>
                    <span className="text-gray-400">{expandedSections.pronunciation ? '▲' : '▼'}</span>
                </button>

                {expandedSections.pronunciation && feedback.pronunciationDetails && (
                    <div className="px-6 pb-4 space-y-4">
                        {/* Overall Assessment */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900 font-medium mb-2">
                                Đánh giá chung: {feedback.pronunciationDetails.assessment}
                            </p>
                            <p className="text-xs text-blue-700">
                                {feedback.pronunciationDetails.description}
                            </p>
                        </div>

                        {/* Word-by-Word Analysis */}
                        {feedback.pronunciationDetails.words && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2 text-sm">Chi tiết từng từ:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.pronunciationDetails.words.map((word, idx) => (
                                        <span
                                            key={idx}
                                            className={`px-3 py-1 rounded-full text-sm ${
                                                word.accurate
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                            title={`Độ chính xác: ${Math.round(word.accuracy)}%`}
                                        >
                                            {word.word}
                                            {!word.accurate && (
                                                <span className="ml-1 text-xs opacity-75">
                                                    ({word.correction || word.phonetic})
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Problem Sounds */}
                        {feedback.pronunciationDetails.problemSounds && (
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <h4 className="font-medium text-yellow-900 mb-2 text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Âm cần cải thiện:
                                </h4>
                                <div className="space-y-1">
                                    {feedback.pronunciationDetails.problemSounds.map((sound, idx) => (
                                        <div key={idx} className="text-sm text-yellow-800">
                                            <strong>{sound.sound}</strong> - {sound.tip}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        {feedback.pronunciationDetails.tips && (
                            <ul className="space-y-2">
                                {feedback.pronunciationDetails.tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-gray-50 rounded">
                                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* Fluency Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('fluency')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Waveform className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-gray-900">Độ trôi chảy</h3>
                        <span className={`text-sm px-2 py-1 rounded ${getScoreBgColor(feedback.fluencyScore)}`}>
                            {feedback.fluencyScore}/100
                        </span>
                    </div>
                    <span className="text-gray-400">{expandedSections.fluency ? '▲' : '▼'}</span>
                </button>

                {expandedSections.fluency && feedback.fluencyDetails && (
                    <div className="px-6 pb-4 space-y-4">
                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-purple-50 rounded-lg text-center">
                                <p className="text-lg font-bold text-purple-600">
                                    {feedback.fluencyDetails.speakingRate}
                                </p>
                                <p className="text-xs text-gray-600">Từ/phút</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg text-center">
                                <p className="text-lg font-bold text-blue-600">
                                    {feedback.fluencyDetails.pauseCount}
                                </p>
                                <p className="text-xs text-gray-600">S lần ngừng</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg text-center">
                                <p className="text-lg font-bold text-green-600">
                                    {feedback.fluencyDetails.articulationRate}
                                </p>
                                <p className="text-xs text-gray-600">Âm/giây</p>
                            </div>
                        </div>

                        {/* Flow Rating */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">Đánh giá luồng nói:</span>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                                i < feedback.fluencyDetails.flowRating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Hesitation Analysis */}
                        {feedback.fluencyDetails.hesitations && (
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <h4 className="font-medium text-yellow-900 mb-2 text-sm">
                                    Vùng ngập ngừng:
                                </h4>
                                <p className="text-sm text-yellow-800">
                                    {feedback.fluencyDetails.hesitations.description}
                                </p>
                            </div>
                        )}

                        {/* Tips */}
                        {feedback.fluencyDetails.tips && (
                            <ul className="space-y-2">
                                {feedback.fluencyDetails.tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-gray-50 rounded">
                                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* Grammar in Speaking */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('grammar')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${feedback.grammarErrors > 0 ? 'text-orange-500' : 'text-green-500'}`} />
                        <h3 className="font-semibold text-gray-900">Ngữ pháp khi nói</h3>
                        <span className="text-sm text-gray-500">({feedback.grammarErrors || 0} lỗi)</span>
                    </div>
                    <span className="text-gray-400">{expandedSections.grammar ? '▲' : '▼'}</span>
                </button>

                {expandedSections.grammar && feedback.grammarDetails && (
                    <div className="px-6 pb-4 space-y-3">
                        {feedback.grammarErrors === 0 ? (
                            <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <p className="text-sm text-green-800">Không phát hiện lỗi ngữ pháp!</p>
                            </div>
                        ) : (
                            <>
                                {feedback.grammarDetails.errors?.map((error, idx) => (
                                    <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <p className="text-sm text-orange-900 mb-1">
                                            <strong>{error.type}:</strong> "{error.original}"
                                        </p>
                                        <p className="text-sm text-green-700">
                                            Nên nói: "{error.correction}"
                                        </p>
                                        {error.tip && (
                                            <p className="text-xs text-orange-700 mt-1">{error.tip}</p>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Good Grammar Points */}
                        {feedback.grammarDetails.strengths && (
                            <div className="p-3 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2 text-sm flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Điểm tốt:
                                </h4>
                                <ul className="space-y-1">
                                    {feedback.grammarDetails.strengths.map((strength, idx) => (
                                        <li key={idx} className="text-sm text-green-800">• {strength}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Vocabulary in Speaking */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('vocabulary')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-semibold text-gray-900">Từ vựng đã dùng</h3>
                        <span className="text-sm text-gray-500">({feedback.uniqueWords || 0} từ)</span>
                    </div>
                    <span className="text-gray-400">{expandedSections.vocabulary ? '▲' : '▼'}</span>
                </button>

                {expandedSections.vocabulary && feedback.vocabularyDetails && (
                    <div className="px-6 pb-4 space-y-4">
                        {/* Vocabulary Range */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-green-50 rounded-lg text-center">
                                <p className="text-lg font-bold text-green-600">{feedback.vocabStats.basic}</p>
                                <p className="text-xs text-gray-600">Cơ bản</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg text-center">
                                <p className="text-lg font-bold text-blue-600">{feedback.vocabStats.intermediate}</p>
                                <p className="text-xs text-gray-600">Trung cấp</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg text-center">
                                <p className="text-lg font-bold text-purple-600">{feedback.vocabStats.advanced}</p>
                                <p className="text-xs text-gray-600">Nâng cao</p>
                            </div>
                        </div>

                        {/* Suggested Words */}
                        {feedback.vocabularyDetails.suggestions && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2 text-sm">
                                    Từ vựng nên dùng để nâng cấp:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.vocabularyDetails.suggestions.map((word, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                        >
                                            {word.word} <span className="text-xs opacity-75">→ {word.alternative}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Audio Quality */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('audioQuality')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">Chất lượng âm thanh</h3>
                    </div>
                    <span className="text-gray-400">{expandedSections.audioQuality ? '▲' : '▼'}</span>
                </button>

                {expandedSections.audioQuality && feedback.audioQuality && (
                    <div className="px-6 pb-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Độ rõ</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${feedback.audioQuality.clarity}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">{feedback.audioQuality.clarity}%</span>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Tiếng ồn</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-red-600 h-2 rounded-full"
                                            style={{ width: `${feedback.audioQuality.noiseLevel}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">{feedback.audioQuality.noiseLevel}%</span>
                                </div>
                            </div>
                        </div>

                        {feedback.audioQuality.feedback && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">{feedback.audioQuality.feedback}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Overall Recommendations */}
            {expandedSections.recommendations && feedback.recommendations && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        Đề xuất luyện tập
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
                    onClick={analyzeAudio}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                    <Sparkles className="w-4 h-4" />
                    Phân tích lại
                </button>
            </div>
        </div>
    );
};

export default AISpeakingFeedback;
