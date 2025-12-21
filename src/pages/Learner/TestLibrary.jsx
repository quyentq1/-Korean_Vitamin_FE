import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const TestLibrary = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

    const tests = [
        {
            id: 'test-1',
            title: 'TOPIK Level 1',
            type: 'TOPIK',
            difficulty: 'beginner',
            duration: 60,
            attempts: 3,
            bestScore: 85,
            lastAttempt: '2024-12-15'
        },
        {
            id: 'test-2',
            title: 'TOPIK Level 2',
            type: 'TOPIK',
            difficulty: 'intermediate',
            duration: 90,
            attempts: 2,
            bestScore: 78,
            lastAttempt: '2024-12-10'
        }
    ];

    const filteredTests = filter === 'all' ? tests : tests.filter(t => t.type.toLowerCase() === filter);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('testLibrary.title', 'Thư Viện Bài Test')}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('testLibrary.subtitle', 'Luyện tập không giới hạn với các bài test chất lượng')}
                        </p>
                    </div>

                    {/* Filters - Scrollable on mobile */}
                    <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {['all', 'topik', 'opic', 'eps'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 sm:px-6 py-2 rounded-xl font-medium transition whitespace-nowrap text-sm sm:text-base ${filter === type
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {t(`testLibrary.filter.${type}`, type.toUpperCase())}
                            </button>
                        ))}
                    </div>

                    {/* Test Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {filteredTests.map((test) => (
                            <div key={test.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 sm:p-6 text-white">
                                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                                        <div>
                                            <span className="text-xs sm:text-sm opacity-90">{test.type}</span>
                                            <h3 className="text-xl sm:text-2xl font-bold">{test.title}</h3>
                                        </div>
                                        <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm">
                                            {t(`testLibrary.${test.difficulty}`, test.difficulty)}
                                        </span>
                                    </div>
                                    <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
                                        <span>⏱️ {test.duration} {t('common.minutes', 'phút')}</span>
                                        <span>🎯 {test.attempts} {t('testLibrary.attempts', 'lần làm')}</span>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <div className="text-xs sm:text-sm text-gray-600">{t('testLibrary.bestScore', 'Điểm cao nhất')}</div>
                                            <div className="text-2xl sm:text-3xl font-bold text-green-600">{test.bestScore}%</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs sm:text-sm text-gray-600">{t('testLibrary.lastAttempt', 'Lần cuối')}</div>
                                            <div className="text-xs sm:text-sm font-medium text-gray-900">{test.lastAttempt}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 sm:gap-3">
                                        <button
                                            onClick={() => navigate(`/test-runner/${test.id}`)}
                                            className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-lg transition text-sm sm:text-base"
                                        >
                                            {t('testLibrary.start', 'Bắt đầu làm bài')}
                                        </button>
                                        <button
                                            onClick={() => navigate(`/test-history/${test.id}`)}
                                            className="px-4 py-2.5 sm:py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition text-sm sm:text-base"
                                        >
                                            📊
                                        </button>
                                    </div>
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

export default TestLibrary;
