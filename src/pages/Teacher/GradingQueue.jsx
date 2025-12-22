import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import teacherService from '../../services/teacherService';

const GradingQueue = () => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState('all');

    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await teacherService.getPendingGrading();
                // Transform data for UI if needed
                // Backend returns ExamAttempt list. 
                // We need: id, student name, title (exam title), assignmentType (question type?), submittedDate, class name.
                // This might require enriching data on backend or extra fetches.
                // Assuming ExamAttempt has: student (User), exam (Exam), submitTime.
                const data = res.data.map(att => ({
                    id: att.id,
                    student: att.student?.fullName || 'Unknown',
                    title: att.exam?.title || 'Untitled Exam',
                    assignmentType: 'Mixed', // Logic needed to detect if writing/speaking
                    submittedDate: new Date(att.submitTime).toLocaleDateString(),
                    class: 'N/A', // Class info might be missing in Attempt entity directly
                    aiScore: 0, // Placeholder
                    aiSuggestions: []
                }));
                setSubmissions(data);
            } catch (error) {
                console.error("Failed to load grading queue", error);
            }
        };
        fetchQueue();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('grading.title', 'Hàng Đợi Chấm Bài')}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('grading.subtitle', 'Chấm bài viết và nói với hỗ trợ AI')}
                        </p>
                    </div>

                    {/* Stats - Responsive grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                        {[
                            { label: t('grading.pending', 'Chờ chấm'), value: 12, color: 'from-yellow-500 to-yellow-600', icon: '⏳' },
                            { label: t('grading.graded', 'Đã chấm'), value: 45, color: 'from-green-500 to-green-600', icon: '✅' },
                            { label: t('grading.avgTime', 'TB thời gian'), value: '15m', color: 'from-blue-500 to-blue-600', icon: '⏱️' },
                            { label: t('grading.thisWeek', 'Tuần này'), value: 8, color: 'from-purple-500 to-purple-600', icon: '📅' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                                <div className={`bg-gradient-to-r ${stat.color} p-3 sm:p-4 text-white`}>
                                    <div className="text-xl sm:text-3xl mb-1">{stat.icon}</div>
                                    <div className="text-xl sm:text-3xl font-bold">{stat.value}</div>
                                </div>
                                <div className="p-3 sm:p-4">
                                    <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters - Scrollable on mobile */}
                    <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {['all', 'writing', 'speaking'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 sm:px-6 py-2 rounded-xl font-medium transition whitespace-nowrap text-sm sm:text-base ${filter === type ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'
                                    }`}
                            >
                                {t(`grading.${type}`, type)}
                            </button>
                        ))}
                    </div>

                    {/* Submissions List */}
                    <div className="space-y-4">
                        {submissions.map((sub) => (
                            <div key={sub.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{sub.title}</h3>
                                        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                            <span>👤 {sub.student}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>📚 {sub.class}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>📅 {sub.submittedDate}</span>
                                        </div>
                                    </div>
                                    <span className={`self-start px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${sub.assignmentType === 'writing'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-purple-100 text-purple-700'
                                        }`}>
                                        {sub.assignmentType === 'writing' ? '✍️ Viết' : '🎤 Nói'}
                                    </span>
                                </div>

                                {/* AI Analysis */}
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3 sm:p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-xl sm:text-2xl">🤖</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2 gap-2">
                                                <span className="font-bold text-gray-900 text-sm sm:text-base">
                                                    {t('grading.aiAnalysis', 'Phân Tích AI')}
                                                </span>
                                                <span className="text-xl sm:text-2xl font-bold text-purple-600">{sub.aiScore}%</span>
                                            </div>
                                            <div className="space-y-1">
                                                {sub.aiSuggestions.map((suggestion, idx) => (
                                                    <div key={idx} className="text-xs sm:text-sm text-gray-700">
                                                        • {suggestion}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <button className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-lg transition text-sm sm:text-base">
                                        {t('grading.startGrading', 'Bắt Đầu Chấm')}
                                    </button>
                                    <button className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition text-sm sm:text-base">
                                        {t('grading.preview', 'Xem Trước')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default GradingQueue;
