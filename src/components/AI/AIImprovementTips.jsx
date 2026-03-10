import { useState, useEffect } from 'react';
import { Lightbulb, BookOpen, Target, TrendingUp, Video, FileText, Headphones, Sparkles, ChevronRight } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

/**
 * AIImprovementTips - Component hiển thị gợi ý cải thiện cá nhân hóa từ AI
 * Phase 2: AI Integration
 *
 * Features:
 * - Personalized learning recommendations
 * - Practice exercise suggestions
 * - Resource recommendations (videos, articles, etc.)
 * - Study plan generation
 * - Progress tracking insights
 * - Weak point identification
 */
const AIImprovementTips = ({ userId, subject = 'all' }) => {
    const [loading, setLoading] = useState(true);
    const [tips, setTips] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedTip, setExpandedTip] = useState(null);

    useEffect(() => {
        fetchImprovementTips();
    }, [userId, subject]);

    const fetchImprovementTips = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/ai/improvement-tips', {
                params: { userId, subject }
            });
            setTips(response.data);
        } catch (error) {
            console.error('Error fetching improvement tips:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
            grammar: <FileText className="w-5 h-5" />,
            vocabulary: <BookOpen className="w-5 h-5" />,
            speaking: <Video className="w-5 h-5" />,
            listening: <Headphones className="w-5 h-5" />,
            writing: <FileText className="w-5 h-5" />,
            overall: <Target className="w-5 h-5" />
        };
        return icons[category] || <Lightbulb className="w-5 h-5" />;
    };

    const getCategoryColor = (category) => {
        const colors = {
            grammar: 'text-blue-600 bg-blue-50 border-blue-200',
            vocabulary: 'text-purple-600 bg-purple-50 border-purple-200',
            speaking: 'text-pink-600 bg-pink-50 border-pink-200',
            listening: 'text-green-600 bg-green-50 border-green-200',
            writing: 'text-indigo-600 bg-indigo-50 border-indigo-200',
            overall: 'text-orange-600 bg-orange-50 border-orange-200'
        };
        return colors[category] || 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-300';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'low': return 'bg-green-100 text-green-700 border-green-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium mb-2">Đang phân tích và tạo gợi ý...</p>
                <p className="text-sm text-gray-500">AI đang phân tích tiến độ học tập của bạn</p>
            </div>
        );
    }

    if (!tips) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center py-8">
                    <Sparkles className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Không có gợi ý nào
                    </h3>
                    <p className="text-sm text-gray-600">
                        Hãy làm thêm bài tập để nhận được gợi ý cải thiện cá nhân hóa
                    </p>
                </div>
            </div>
        );
    }

    const filteredTips = selectedCategory === 'all'
        ? tips.tips
        : tips.tips.filter(tip => tip.category === selectedCategory);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                    <Lightbulb className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Gợi ý cải thiện từ AI</h2>
                        <p className="text-yellow-100 text-sm">Dựa trên tiến độ học tập của bạn</p>
                    </div>
                </div>
                {tips.summary && (
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <p className="text-sm">{tips.summary}</p>
                    </div>
                )}
            </div>

            {/* Weak Points Alert */}
            {tips.weakPoints && tips.weakPoints.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Cần tập trung cải thiện:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {tips.weakPoints.map((point, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                            >
                                {point}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === 'all'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Tất cả ({tips.tips.length})
                </button>
                {['grammar', 'vocabulary', 'speaking', 'listening', 'writing'].map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                            selectedCategory === category
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Improvement Tips List */}
            <div className="space-y-4">
                {filteredTips.map((tip, idx) => (
                    <div
                        key={idx}
                        className={`bg-white rounded-xl shadow-sm border-2 transition-all overflow-hidden ${
                            expandedTip === idx ? 'border-blue-500' : 'border-gray-200'
                        }`}
                    >
                        <button
                            onClick={() => setExpandedTip(expandedTip === idx ? null : idx)}
                            className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start gap-4 flex-1 text-left">
                                <div className={`p-3 rounded-lg ${getCategoryColor(tip.category)}`}>
                                    {getCategoryIcon(tip.category)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900">{tip.title}</h3>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(tip.priority)}`}>
                                            {tip.priority === 'high' ? 'Ưu tiên cao' :
                                             tip.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                        </span>
                                        <span className="text-xs text-gray-500 capitalize">{tip.category}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{tip.description}</p>
                                </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                                expandedTip === idx ? 'rotate-90' : ''
                            }`} />
                        </button>

                        {expandedTip === idx && (
                            <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                                {/* Detailed Explanation */}
                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Giải thích chi tiết:</h4>
                                    <p className="text-sm text-gray-700">{tip.detailedExplanation}</p>
                                </div>

                                {/* Action Steps */}
                                {tip.actionSteps && (
                                    <div className="mb-4">
                                        <h4 className="font-medium text-gray-900 mb-2 text-sm flex items-center gap-2">
                                            <Target className="w-4 h-4 text-blue-500" />
                                            Các bước thực hiện:
                                        </h4>
                                        <ol className="space-y-2">
                                            {tip.actionSteps.map((step, stepIdx) => (
                                                <li key={stepIdx} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="text-blue-600 font-bold">{stepIdx + 1}.</span>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}

                                {/* Practice Exercises */}
                                {tip.practiceExercises && tip.practiceExercises.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-medium text-gray-900 mb-2 text-sm flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                            Bài tập luyện tập:
                                        </h4>
                                        <div className="space-y-2">
                                            {tip.practiceExercises.map((exercise, exIdx) => (
                                                <div key={exIdx} className="p-3 bg-green-50 rounded-lg">
                                                    <p className="text-sm text-green-900 font-medium mb-1">{exercise.title}</p>
                                                    <p className="text-xs text-green-700">{exercise.description}</p>
                                                    {exercise.duration && (
                                                        <p className="text-xs text-green-600 mt-1">
                                                            Thời gian: {exercise.duration}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Resources */}
                                {tip.resources && tip.resources.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-medium text-gray-900 mb-2 text-sm flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-purple-500" />
                                            Tài liệu tham khảo:
                                        </h4>
                                        <div className="space-y-2">
                                            {tip.resources.map((resource, resIdx) => (
                                                <a
                                                    key={resIdx}
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                                >
                                                    <div className="p-2 bg-white rounded">
                                                        {resource.type === 'video' ? <Video className="w-4 h-4 text-purple-600" /> :
                                                         resource.type === 'article' ? <FileText className="w-4 h-4 text-purple-600" /> :
                                                         <BookOpen className="w-4 h-4 text-purple-600" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-purple-900">{resource.title}</p>
                                                        <p className="text-xs text-purple-700">{resource.source}</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-purple-600" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Estimated Time */}
                                {tip.estimatedTime && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-900">
                                            <strong>Thời gian ước tính:</strong> {tip.estimatedTime}
                                        </p>
                                    </div>
                                )}

                                {/* Tags */}
                                {tip.tags && tip.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {tip.tags.map((tag, tagIdx) => (
                                            <span
                                                key={tagIdx}
                                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Study Plan Recommendation */}
            {tips.studyPlan && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Kế hoạch học tập đề xuất
                    </h3>
                    <div className="space-y-3">
                        {tips.studyPlan.map((plan, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{plan.title}</p>
                                    <p className="text-sm text-gray-600">{plan.description}</p>
                                    {plan.duration && (
                                        <p className="text-xs text-gray-500 mt-1">⏱️ {plan.duration}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Progress Insight */}
            {tips.progressInsight && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Tiến độ học tập
                    </h3>
                    <p className="text-sm text-green-800 mb-4">{tips.progressInsight.overall}</p>

                    {tips.progressInsight.areas && (
                        <div className="space-y-3">
                            {tips.progressInsight.areas.map((area, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-green-900">{area.name}</span>
                                        <span className="text-sm text-green-700">{area.progress}%</span>
                                    </div>
                                    <div className="w-full bg-green-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all"
                                            style={{ width: `${area.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-center">
                <button
                    onClick={fetchImprovementTips}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                    <Sparkles className="w-4 h-4" />
                    Làm mới gợi ý
                </button>
            </div>
        </div>
    );
};

export default AIImprovementTips;
