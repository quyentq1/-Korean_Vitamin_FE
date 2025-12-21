import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const QBApproval = () => {
    const { t } = useTranslation();

    const pendingQuestions = [
        { id: 'Q156', category: 'N3', type: 'listening', difficulty: 'medium', createdBy: 'Teacher Park', submittedDate: '2024-12-20', duplicateScore: 5 },
        { id: 'Q157', category: 'R2', type: 'reading', difficulty: 'easy', createdBy: 'Teacher Kim', submittedDate: '2024-12-19', duplicateScore: 85 },
        { id: 'Q158', category: 'W1', type: 'writing', difficulty: 'hard', createdBy: 'Teacher Lee', submittedDate: '2024-12-18', duplicateScore: 12 }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('qbApproval.title', 'Phê Duyệt Question Bank')}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('qbApproval.subtitle', 'Xem xét và phê duyệt câu hỏi từ giáo viên')}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-4">
                            <div className="flex items-center gap-3 sm:block">
                                <div className="text-yellow-600 text-2xl sm:text-3xl sm:mb-2">⏳</div>
                                <div className="text-gray-600 font-medium sm:hidden">{t('qbApproval.pending', 'Chờ duyệt')}</div>
                            </div>
                            <div className="text-right sm:text-left">
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900">12</div>
                                <div className="text-gray-600 text-sm hidden sm:block">{t('qbApproval.pending', 'Chờ duyệt')}</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-4">
                            <div className="flex items-center gap-3 sm:block">
                                <div className="text-green-600 text-2xl sm:text-3xl sm:mb-2">✅</div>
                                <div className="text-gray-600 font-medium sm:hidden">{t('qbApproval.approved', 'Đã duyệt')}</div>
                            </div>
                            <div className="text-right sm:text-left">
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900">145</div>
                                <div className="text-gray-600 text-sm hidden sm:block">{t('qbApproval.approved', 'Đã duyệt')}</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-4">
                            <div className="flex items-center gap-3 sm:block">
                                <div className="text-red-600 text-2xl sm:text-3xl sm:mb-2">❌</div>
                                <div className="text-gray-600 font-medium sm:hidden">{t('qbApproval.rejected', 'Từ chối')}</div>
                            </div>
                            <div className="text-right sm:text-left">
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900">8</div>
                                <div className="text-gray-600 text-sm hidden sm:block">{t('qbApproval.rejected', 'Từ chối')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Questions */}
                    <div className="space-y-4">
                        {pendingQuestions.map((q) => (
                            <div key={q.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition">
                                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                                    <div className="flex-1 w-full sm:w-auto">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-lg sm:text-xl font-bold text-primary-600">{q.id}</span>
                                            <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                                                {q.category}
                                            </span>
                                            <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium">
                                                {q.type}
                                            </span>
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {q.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            {t('qbApproval.createdBy', 'Tạo bởi')}: {q.createdBy} • {q.submittedDate}
                                        </p>
                                    </div>

                                    {/* Duplicate Detection */}
                                    <div className={`flex items-center gap-2 sm:block px-3 sm:px-4 py-2 rounded-xl w-full sm:w-auto ${q.duplicateScore > 70 ? 'bg-red-100' : q.duplicateScore > 30 ? 'bg-yellow-100' : 'bg-green-100'
                                        }`}>
                                        <div className="text-xs text-gray-600 sm:mb-1">{t('qbApproval.duplicateCheck', 'Trùng lặp')}:</div>
                                        <div className={`text-lg sm:text-2xl font-bold ml-auto sm:ml-0 ${q.duplicateScore > 70 ? 'text-red-600' : q.duplicateScore > 30 ? 'text-yellow-600' : 'text-green-600'
                                            }`}>
                                            {q.duplicateScore}%
                                        </div>
                                    </div>
                                </div>

                                {/* Question Preview */}
                                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl mb-4">
                                    <p className="text-gray-700 text-sm sm:text-base">
                                        <strong>{t('qbApproval.question', 'Câu hỏi')}:</strong> Sample question text here Lorem ipsum dolor sit amet...
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <button className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition text-sm sm:text-base">
                                        ✓ {t('qbApproval.approve', 'Phê Duyệt')}
                                    </button>
                                    <button className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition text-sm sm:text-base">
                                        ✗ {t('qbApproval.reject', 'Từ Chối')}
                                    </button>
                                    <button className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition text-sm sm:text-base">
                                        {t('qbApproval.viewDetail', 'Chi tiết')}
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

export default QBApproval;
