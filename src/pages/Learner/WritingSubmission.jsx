import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const WritingSubmission = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('submit');
    const [writingText, setWritingText] = useState('');

    const submissions = [
        { id: 1, title: 'Essay: My Hometown', date: '2024-12-15', status: 'graded', score: 85, feedback: 'Excellent structure!' },
        { id: 2, title: 'Letter Writing', date: '2024-12-10', status: 'pending', score: null, feedback: null },
        { id: 3, title: 'Short Paragraph', date: '2024-12-05', status: 'graded', score: 78, feedback: 'Good vocabulary, work on grammar' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                {t('writing.title', 'Nộp Bài Viết')}
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                                {t('writing.subtitle', 'Gửi bài viết và nhận feedback từ giáo viên')}
                            </p>
                        </div>

                        {/* Tabs - Stack on mobile */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                            <button
                                onClick={() => setActiveTab('submit')}
                                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition text-sm sm:text-base ${activeTab === 'submit'
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                ✍️ {t('writing.newSubmission', 'Nộp Bài Mới')}
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition text-sm sm:text-base ${activeTab === 'history'
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                📚 {t('writing.history', 'Bài Đã Nộp')}
                            </button>
                        </div>

                        {/* Content */}
                        {activeTab === 'submit' ? (
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                                    {t('writing.submitTitle', 'Nộp Bài Viết Mới')}
                                </h2>

                                <div className="space-y-4 sm:space-y-6">
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                            {t('writing.assignmentTitle', 'Tiêu đề bài viết')}
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                                            placeholder={t('writing.titlePlaceholder', 'Nhập tiêu đề...')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                            {t('writing.content', 'Nội dung')}
                                        </label>
                                        <textarea
                                            value={writingText}
                                            onChange={(e) => setWritingText(e.target.value)}
                                            className="w-full h-64 sm:h-96 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none text-sm sm:text-base"
                                            placeholder={t('writing.contentPlaceholder', 'Nhập nội dung bài viết...')}
                                        />
                                        <div className="mt-2 flex justify-between text-xs sm:text-sm text-gray-500">
                                            <span>{writingText.length} {t('writing.characters', 'ký tự')}</span>
                                            <span>{writingText.split(/\s+/).filter(w => w).length} {t('writing.words', 'từ')}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                            {t('writing.attachFile', 'Đính kèm file (không bắt buộc)')}
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-primary-400 transition cursor-pointer">
                                            <div className="text-3xl sm:text-4xl mb-2">📎</div>
                                            <p className="text-gray-600 text-sm sm:text-base">{t('writing.dragDrop', 'Kéo thả file hoặc click để chọn')}</p>
                                            <p className="text-xs sm:text-sm text-gray-400 mt-1">PDF, DOC, DOCX (Max 10MB)</p>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-xl transition text-sm sm:text-base">
                                        {t('writing.submit', 'Nộp Bài')} →
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {submissions.map((sub) => (
                                    <div key={sub.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{sub.title}</h3>
                                                <p className="text-xs sm:text-sm text-gray-600">
                                                    📅 {sub.date}
                                                </p>
                                            </div>
                                            <div className="self-start sm:self-auto sm:text-right">
                                                {sub.status === 'graded' ? (
                                                    <div className="flex items-center gap-3 sm:block">
                                                        <span className="px-3 sm:px-4 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                                                            ✓ {t('writing.graded', 'Đã chấm')}
                                                        </span>
                                                        <div className="text-2xl sm:text-3xl font-bold text-green-600 sm:mt-2">{sub.score}%</div>
                                                    </div>
                                                ) : (
                                                    <span className="px-3 sm:px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                                                        ⏳ {t('writing.pending', 'Đang chấm')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {sub.feedback && (
                                            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
                                                <div className="flex items-start gap-2">
                                                    <div className="text-xl sm:text-2xl">💬</div>
                                                    <div>
                                                        <div className="font-medium text-gray-700 mb-1 text-sm sm:text-base">{t('writing.teacherFeedback', 'Nhận xét của giáo viên:')}</div>
                                                        <p className="text-gray-600 text-sm sm:text-base">{sub.feedback}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default WritingSubmission;
