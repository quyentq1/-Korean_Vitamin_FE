import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const QuestionBank = () => {
    const { t } = useTranslation();
    const [view, setView] = useState('list');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const questions = [
        { id: 'Q001', category: 'N1', type: 'listening', difficulty: 'easy', status: 'approved', createdBy: 'Teacher Park' },
        { id: 'Q002', category: 'R3', type: 'reading', difficulty: 'medium', status: 'pending', createdBy: 'Teacher Kim' },
        { id: 'Q003', category: 'N2', type: 'listening', difficulty: 'hard', status: 'approved', createdBy: 'Teacher Lee' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('qb.title', 'Ngân Hàng Câu Hỏi')}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('qb.subtitle', 'Quản lý và tạo câu hỏi cho các bài test')}
                        </p>
                    </div>

                    {/* Actions Bar - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <button
                                onClick={() => setView('list')}
                                className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition text-sm sm:text-base ${view === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
                            >
                                📋 <span className="hidden sm:inline">{t('qb.listView', 'Danh sách')}</span>
                            </button>
                            <button
                                onClick={() => setView('categories')}
                                className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition text-sm sm:text-base ${view === 'categories' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
                            >
                                🗂️ <span className="hidden sm:inline">{t('qb.categoryView', 'Theo danh mục')}</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-lg transition text-sm sm:text-base"
                        >
                            ➕ {t('qb.createNew', 'Tạo Câu Hỏi Mới')}
                        </button>
                    </div>

                    {/* Filters - Responsive grid */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                            <select className="px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base">
                                <option value="">{t('qb.allTypes', 'Tất cả loại')}</option>
                                <option value="listening">{t('qb.listening', 'Nghe')}</option>
                                <option value="reading">{t('qb.reading', 'Đọc')}</option>
                                <option value="writing">{t('qb.writing', 'Viết')}</option>
                            </select>

                            <select className="px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base">
                                <option value="">{t('qb.allCategories', 'Tất cả danh mục')}</option>
                                <option value="N1">N1</option>
                                <option value="N2">N2</option>
                                <option value="R1">R1</option>
                            </select>

                            <select className="px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base">
                                <option value="">{t('qb.allDifficulty', 'Tất cả độ khó')}</option>
                                <option value="easy">{t('qb.easy', 'Dễ')}</option>
                                <option value="medium">{t('qb.medium', 'Trung bình')}</option>
                                <option value="hard">{t('qb.hard', 'Khó')}</option>
                            </select>

                            <select className="px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base">
                                <option value="">{t('qb.allStatus', 'Tất cả trạng thái')}</option>
                                <option value="approved">{t('qb.approved', 'Đã duyệt')}</option>
                                <option value="pending">{t('qb.pending', 'Chờ duyệt')}</option>
                                <option value="rejected">{t('qb.rejected', 'Từ chối')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Questions List - Card view on mobile, Table on desktop */}
                    {/* Mobile Card View */}
                    <div className="block lg:hidden space-y-4">
                        {questions.map((q) => (
                            <div key={q.id} className="bg-white rounded-2xl shadow-lg p-4 sm:p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-bold text-primary-600">{q.id}</span>
                                    <div className="flex gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${q.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                q.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {q.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                    <div>
                                        <span className="text-gray-500">Category:</span>
                                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{q.category}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Type:</span>
                                        <span className="ml-2 text-gray-700">{q.type}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Difficulty:</span>
                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>{q.difficulty}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">By:</span>
                                        <span className="ml-2 text-gray-700">{q.createdBy}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-gray-100">
                                    <button className="flex-1 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium text-sm">👁️ View</button>
                                    <button className="flex-1 py-2 text-green-600 bg-green-50 rounded-lg font-medium text-sm">✏️ Edit</button>
                                    <button className="flex-1 py-2 text-red-600 bg-red-50 rounded-lg font-medium text-sm">🗑️ Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-bold text-gray-700">{t('qb.id', 'ID')}</th>
                                        <th className="px-6 py-4 text-left font-bold text-gray-700">{t('qb.category', 'Danh mục')}</th>
                                        <th className="px-6 py-4 text-left font-bold text-gray-700">{t('qb.type', 'Loại')}</th>
                                        <th className="px-6 py-4 text-left font-bold text-gray-700">{t('qb.difficulty', 'Độ khó')}</th>
                                        <th className="px-6 py-4 text-left font-bold text-gray-700">{t('qb.status', 'Trạng thái')}</th>
                                        <th className="px-6 py-4 text-left font-bold text-gray-700">{t('qb.createdBy', 'Tạo bởi')}</th>
                                        <th className="px-6 py-4 text-left font-bold text-gray-700">{t('qb.actions', 'Thao tác')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {questions.map((q) => (
                                        <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-medium text-primary-600">{q.id}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                    {q.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{q.type}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${q.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        q.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {q.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{q.createdBy}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">👁️</button>
                                                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">✏️</button>
                                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default QuestionBank;
