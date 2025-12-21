import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Forum = () => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', name: t('forum.all', 'Tất cả'), icon: '📚', count: 45 },
        { id: 'grammar', name: t('forum.grammar', 'Ngữ pháp'), icon: '📖', count: 12 },
        { id: 'vocabulary', name: t('forum.vocabulary', 'Từ vựng'), icon: '📝', count: 15 },
        { id: 'speaking', name: t('forum.speaking', 'Luyện nói'), icon: '🗣️', count: 8 },
        { id: 'general', name: t('forum.general', 'Chung'), icon: '💬', count: 10 }
    ];

    const threads = [
        {
            id: 1,
            title: 'Sự khác biệt giữa -이/가 và -은/는?',
            category: 'grammar',
            author: 'Nguyen Van A',
            replies: 12,
            views: 145,
            lastActivity: '10 phút trước',
            hasTeacherReply: true
        },
        {
            id: 2,
            title: 'Cách học từ vựng hiệu quả cho TOPIK II',
            category: 'vocabulary',
            author: 'Le Thi B',
            replies: 8,
            views: 89,
            lastActivity: '1 giờ trước',
            hasTeacherReply: false
        },
        {
            id: 3,
            title: 'Tìm bạn luyện nói tiếng Hàn',
            category: 'speaking',
            author: 'Tran Van C',
            replies: 24,
            views: 203,
            lastActivity: '30 phút trước',
            hasTeacherReply: false
        }
    ];

    const filteredThreads = activeCategory === 'all'
        ? threads
        : threads.filter(t => t.category === activeCategory);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('forum.title', 'Diễn Đàn Học Viên')}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('forum.subtitle', 'Cùng nhau học tập và chia sẻ kinh nghiệm')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                        {/* Categories Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-24">
                                <h2 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                                    {t('forum.categories', 'Chủ Đề')}
                                </h2>
                                {/* Mobile: Single column list, not horizontal scroll to ensure visibility */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition text-sm sm:text-base ${activeCategory === cat.id
                                                ? 'bg-primary-600 text-white shadow-lg'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span>{cat.icon}</span>
                                                <span className="font-medium">{cat.name}</span>
                                            </span>
                                            <span className={`text-xs sm:text-sm px-2 py-0.5 sm:py-1 rounded-full ${activeCategory === cat.id ? 'bg-white/20' : 'bg-gray-200'
                                                }`}>
                                                {cat.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <button className="w-full mt-4 sm:mt-6 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-lg transition text-sm sm:text-base">
                                    ➕ {t('forum.newThread', 'Tạo Bài Viết')}
                                </button>
                            </div>
                        </div>

                        {/* Threads List */}
                        <div className="lg:col-span-3">
                            <div className="space-y-3 sm:space-y-4">
                                {filteredThreads.map((thread) => (
                                    <div key={thread.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition cursor-pointer">
                                        <div className="flex gap-3 sm:gap-4">
                                            {/* Author Avatar - Smaller on mobile */}
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                                                {thread.author.charAt(0)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                                                    <div>
                                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 hover:text-primary-600 transition break-words">
                                                            {thread.title}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-600">
                                                            <span>{thread.author}</span>
                                                            <span>•</span>
                                                            <span>{thread.lastActivity}</span>
                                                        </div>
                                                    </div>
                                                    {thread.hasTeacherReply && (
                                                        <span className="self-start px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap">
                                                            ✓ {t('forum.teacherReply', 'GV đã trả lời')}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        💬 {thread.replies} {t('forum.replies', 'phản hồi')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        👁️ {thread.views} {t('forum.views', 'lượt xem')}
                                                    </span>
                                                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                        {categories.find(c => c.id === thread.category)?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-6 sm:mt-8 flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((page) => (
                                    <button
                                        key={page}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition text-sm sm:text-base ${page === 1
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Forum;
