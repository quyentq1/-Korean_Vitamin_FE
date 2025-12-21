import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Dashboard = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            {/* Content with top padding for fixed navbar */}
            <div className="pt-20">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8 sm:py-12">
                    <div className="container mx-auto px-4 sm:px-6">
                        <h1 className="text-2xl sm:text-4xl font-bold mb-2">
                            {t('dashboard.welcome', 'Xin chào, Học viên!')}
                        </h1>
                        <p className="text-primary-100 text-sm sm:text-base">
                            {t('dashboard.subtitle', 'Chào mừng trở lại với Korean Vitamin')}
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                        {/* Stat Card 1 */}
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-primary-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">
                                {t('dashboard.studyTime', 'Thời gian học')}
                            </h3>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">12h 30m</p>
                            <p className="text-xs text-green-600 mt-2">↑ 15% {t('dashboard.thisWeek', 'tuần này')}</p>
                        </div>

                        {/* Stat Card 2 */}
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">
                                {t('dashboard.testsCompleted', 'Bài test hoàn thành')}
                            </h3>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">5</p>
                            <p className="text-xs text-green-600 mt-2">↑ 2 {t('dashboard.thisWeek', 'tuần này')}</p>
                        </div>

                        {/* Stat Card 3 */}
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">
                                {t('dashboard.reviewItems', 'Từ cần ôn')}
                            </h3>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">12</p>
                            <p className="text-xs text-orange-600 mt-2">
                                {t('dashboard.needReview', 'Cần ôn tập')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                {t('dashboard.recentActivity', 'Hoạt động gần đây')}
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                {[
                                    { icon: '📚', title: 'Hoàn thành Bài 3 - TOPIK I', time: '2 giờ trước', color: 'bg-blue-100 text-blue-600' },
                                    { icon: '✍️', title: 'Nộp bài viết - Đề 15', time: '5 giờ trước', color: 'bg-green-100 text-green-600' },
                                    { icon: '🎯', title: 'Đạt 85 điểm - Mock Test', time: '1 ngày trước', color: 'bg-purple-100 text-purple-600' },
                                ].map((activity, index) => (
                                    <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${activity.color} rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0`}>
                                            {activity.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{activity.title}</h4>
                                            <p className="text-xs sm:text-sm text-gray-500">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Schedule */}
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                {t('dashboard.upcomingSchedule', 'Lịch học sắp tới')}
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                {[
                                    { date: { day: '22', month: 'T12' }, title: 'Luyện nói - OPIc', time: '10:00 - 11:30', type: 'online' },
                                    { date: { day: '23', month: 'T12' }, title: 'Ngữ pháp nâng cao', time: '14:00 - 15:30', type: 'offline' },
                                    { date: { day: '25', month: 'T12' }, title: 'Thi thử TOPIK II', time: '09:00 - 12:00', type: 'online' },
                                ].map((schedule, index) => (
                                    <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                                        <div className="text-center flex-shrink-0">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white flex flex-col items-center justify-center shadow-lg">
                                                <div className="text-[10px] sm:text-xs font-medium opacity-90">{schedule.date.month}</div>
                                                <div className="text-xl sm:text-2xl font-bold">{schedule.date.day}</div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{schedule.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs sm:text-sm text-gray-500">{schedule.time}</span>
                                                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${schedule.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {schedule.type === 'online' ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 sm:mt-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('dashboard.quickActions', 'Thao tác nhanh')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                            {[
                                { icon: '📝', title: 'Thi thử', color: 'from-blue-500 to-blue-600' },
                                { icon: '📖', title: 'Học từ vựng', color: 'from-green-500 to-green-600' },
                                { icon: '💬', title: 'Forum', color: 'from-purple-500 to-purple-600' },
                                { icon: '📊', title: 'Xem điểm', color: 'from-orange-500 to-orange-600' },
                            ].map((action, index) => (
                                <button
                                    key={index}
                                    className={`bg-gradient-to-br ${action.color} text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                                >
                                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{action.icon}</div>
                                    <h3 className="font-bold text-sm sm:text-lg">{action.title}</h3>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Dashboard;
