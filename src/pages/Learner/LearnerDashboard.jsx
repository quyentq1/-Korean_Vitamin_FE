import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const LearnerDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Mock data
    const stats = {
        testsCompleted: 8,
        avgScore: 82,
        studyHours: 45,
        classesAttended: 12
    };

    const recentTests = [
        { name: 'TOPIK Level 2', date: '2024-12-15', score: 85, status: 'completed' },
        { name: 'TOPIK Level 1', date: '2024-12-10', score: 78, status: 'completed' }
    ];

    const upcomingClasses = [
        { title: 'Grammar Advanced', date: '2024-12-22', time: '14:00', teacher: 'Ms. Park' },
        { title: 'Speaking Practice', date: '2024-12-24', time: '16:00', teacher: 'Mr. Kim' }
    ];

    const learningProgress = [
        { skill: t('learner.listening', 'Listening'), progress: 85, color: 'bg-blue-500' },
        { skill: t('learner.reading', 'Reading'), progress: 78, color: 'bg-green-500' },
        { skill: t('learner.writing', 'Writing'), progress: 65, color: 'bg-yellow-500' },
        { skill: t('learner.speaking', 'Speaking'), progress: 70, color: 'bg-purple-500' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('learner.welcome', 'Chào mừng trở lại')} 👋
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('learner.subtitle', 'Tiếp tục hành trình chinh phục tiếng Hàn của bạn')}
                        </p>
                    </div>

                    {/* Stats Cards - Grid cols 2 on mobile */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                        {[
                            { label: t('learner.testsCompleted', 'Bài test hoàn thành'), value: stats.testsCompleted, icon: '📝', color: 'from-blue-500 to-blue-600' },
                            { label: t('learner.avgScore', 'Điểm trung bình'), value: `${stats.avgScore}%`, icon: '⭐', color: 'from-green-500 to-green-600' },
                            { label: t('learner.studyHours', 'Giờ học tích lũy'), value: stats.studyHours, icon: '⏱️', color: 'from-purple-500 to-purple-600' },
                            { label: t('learner.classesAttended', 'Buổi học đã tham gia'), value: stats.classesAttended, icon: '👨‍🏫', color: 'from-orange-500 to-orange-600' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all">
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Learning Progress & Tests */}
                        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                            {/* Progress */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                                    {t('learner.progressTitle', 'Tiến Độ Học Tập')}
                                </h2>
                                <div className="space-y-4">
                                    {learningProgress.map((item, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between mb-2 text-sm sm:text-base">
                                                <span className="font-medium text-gray-700">{item.skill}</span>
                                                <span className="font-bold text-gray-900">{item.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
                                                <div
                                                    className={`${item.color} h-2.5 sm:h-3 rounded-full transition-all duration-500`}
                                                    style={{ width: `${item.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Tests */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                                        {t('learner.recentTests', 'Bài Test Gần Đây')}
                                    </h2>
                                    <button
                                        onClick={() => navigate('/test-library')}
                                        className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
                                    >
                                        {t('learner.viewAll', 'Xem tất cả')} →
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {recentTests.map((test, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">{test.name}</h3>
                                                <p className="text-xs sm:text-sm text-gray-600">{test.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg sm:text-2xl font-bold text-green-600">{test.score}%</div>
                                                <span className="text-xs text-gray-500">{t('learner.completed', 'Hoàn thành')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                                    {t('learner.quickActions', 'Thao Tác Nhanh')}
                                </h2>
                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                                    <button
                                        onClick={() => navigate('/test-library')}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg transition text-sm sm:text-base"
                                    >
                                        📝 {t('learner.takeTest', 'Làm Bài Test')}
                                    </button>
                                    <button
                                        onClick={() => navigate('/my-schedule')}
                                        className="w-full px-4 py-3 border-2 border-primary-200 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition text-sm sm:text-base"
                                    >
                                        📅 {t('learner.viewSchedule', 'Xem Lịch Học')}
                                    </button>
                                    <button
                                        onClick={() => navigate('/writing-submission')}
                                        className="w-full px-4 py-3 border-2 border-primary-200 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition text-sm sm:text-base"
                                    >
                                        ✍️ {t('learner.submitWriting', 'Nộp Bài Viết')}
                                    </button>
                                    <button
                                        onClick={() => navigate('/forum')}
                                        className="w-full px-4 py-3 border-2 border-primary-200 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition text-sm sm:text-base"
                                    >
                                        💬 {t('learner.forum', 'Diễn Đàn')}
                                    </button>
                                </div>
                            </div>

                            {/* Upcoming Classes */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                                    {t('learner.upcomingClasses', 'Lớp Học Sắp Tới')}
                                </h2>
                                <div className="space-y-3">
                                    {upcomingClasses.map((cls, idx) => (
                                        <div key={idx} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                                            <h3 className="font-bold text-gray-900 text-sm">{cls.title}</h3>
                                            <p className="text-xs text-gray-600 mt-1">
                                                📅 {cls.date} • ⏰ {cls.time}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                👨‍🏫 {cls.teacher}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default LearnerDashboard;
