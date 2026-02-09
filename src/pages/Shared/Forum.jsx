import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, ThumbsUp, ThumbsDown, Pin, PinOff } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CategoryManagementModal from '../../components/Shared/CategoryManagementModal';

const Forum = () => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeCategory, searchTerm]);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setUserRole(user.role);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };
        fetchUserRole();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catsRes, postsRes] = await Promise.all([
                axiosClient.get('/api/forum/categories'),
                axiosClient.get(activeCategory
                    ? `/api/forum/posts?categoryId=${activeCategory}&search=${encodeURIComponent(searchTerm)}`
                    : `/api/forum/posts?search=${encodeURIComponent(searchTerm)}`
                )
            ]);
            setCategories(catsRes);
            setPosts(postsRes);
        } catch (error) {
            console.error("Failed to load forum data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePinToggle = async (postId, currentStatus) => {
        try {
            await axiosClient.put(`/api/forum/posts/${postId}/pin`, {
                pinned: !currentStatus
            });
            fetchData();
        } catch (error) {
            console.error('Error toggling pin:', error);
        }
    };

    const handleVote = async (postId, voteType) => {
        try {
            await axiosClient.post(`/api/forum/posts/${postId}/vote`, {
                voteType
            });
            fetchData();
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    // Helper to format date
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('vi-VN');
    };

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
                        
                        {/* Search Bar */}
                        <div className="mt-4 flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder={t('forum.searchPlaceholder', 'Tìm kiếm bài viết...')}
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                                />
                            </div>
                            {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                                <button
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    className="px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-lg transition text-sm sm:text-base flex items-center gap-2"
                                >
                                    <span>➕</span>
                                    {t('forum.createCategory', 'Tạo Danh Mục')}
                                </button>
                            )}
                        </div>
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
                                    <button
                                        onClick={() => setActiveCategory(null)}
                                        className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition text-sm sm:text-base ${activeCategory === null
                                            ? 'bg-primary-600 text-white shadow-lg'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>📚</span>
                                            <span className="font-medium">{t('forum.all', 'Tất cả')}</span>
                                        </span>
                                    </button>

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
                                                <span>📂</span>
                                                <span className="font-medium">{cat.name}</span>
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
                            {loading ? <div className="text-center py-10">Loading...</div> : (
                                <div className="space-y-3 sm:space-y-4">
                                    {posts.length === 0 && <div className="text-center text-gray-500 py-10">Chưa có bài viết nào.</div>}
                                    {posts.map((post) => (
                                        <div key={post.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition cursor-pointer">
                                            <div className="flex gap-3 sm:gap-4">
                                                {/* Author Avatar */}
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                                                    {post.author ? post.author.fullName.charAt(0) : 'U'}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                                                        <div>
                                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 hover:text-primary-600 transition break-words">
                                                                {post.title}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-600">
                                                                <span>{post.author ? post.author.fullName : 'Unknown'}</span>
                                                                <span>•</span>
                                                                <span>{formatDate(post.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            💬 {post.commentsCount} {t('forum.replies', 'phản hồi')}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            👁️ {post.views} {t('forum.views', 'lượt xem')}
                                                        </span>
                                                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                            {post.category ? post.category.name : 'General'}
                                                        </span>
                                                        
                                                        {/* Pin Button (Admin/Manager only) */}
                                                        {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePinToggle(post.id, post.pinned);
                                                                }}
                                                                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
                                                                    post.pinned
                                                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                }`}
                                                                title={post.pinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                                                            >
                                                                {post.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                                                                {post.pinned ? 'Đã ghim' : 'Ghim'}
                                                            </button>
                                                        )}
                                                        
                                                        {/* Vote Buttons */}
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleVote(post.id, 'UP');
                                                                }}
                                                                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
                                                                    post.userVote === 'UP'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                }`}
                                                                title="Thích bài viết"
                                                            >
                                                                <ThumbsUp className="w-4 h-4" />
                                                                <span>{post.upvotes || 0}</span>
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleVote(post.id, 'DOWN');
                                                                }}
                                                                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
                                                                    post.userVote === 'DOWN'
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                }`}
                                                                title="Không thích bài viết"
                                                            >
                                                                <ThumbsDown className="w-4 h-4" />
                                                                <span>{post.downvotes || 0}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

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

            <CategoryManagementModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSuccess={() => {
                    fetchData();
                }}
            />
            <Footer />
        </div>
    );
};

export default Forum;
