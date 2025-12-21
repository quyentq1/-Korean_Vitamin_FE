import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const MySchedule = () => {
    const { t } = useTranslation();
    const [view, setView] = useState('week');

    const classes = [
        { id: 1, title: 'Grammar Advanced', date: '2024-12-22', time: '14:00-16:00', teacher: 'Ms. Park', type: 'online', room: 'Zoom Room 1' },
        { id: 2, title: 'Speaking Practice', date: '2024-12-24', time: '16:00-18:00', teacher: 'Mr. Kim', type: 'offline', room: 'Room 301' },
        { id: 3, title: 'Listening Skills', date: '2024-12-26', time: '10:00-12:00', teacher: 'Ms. Lee', type: 'online', room: 'Zoom Room 2' },
        { id: 4, title: 'Writing Workshop', date: '2024-12-28', time: '14:00-16:00', teacher: 'Mr. Choi', type: 'offline', room: 'Room 205' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('schedule.title', 'Lịch Học Của Tôi')}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('schedule.subtitle', 'Quản lý lịch học và tham gia lớp học đúng giờ')}
                        </p>
                    </div>

                    {/* View Toggle - Scrollable on mobile */}
                    <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {['week', 'month', 'list'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-4 sm:px-6 py-2 rounded-xl font-medium transition whitespace-nowrap text-sm sm:text-base ${view === v
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {t(`schedule.view.${v}`, v)}
                            </button>
                        ))}
                    </div>

                    {/* Calendar/List View */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            {classes.map((cls) => (
                                <div key={cls.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100 hover:shadow-md transition">
                                    {/* Date & Title Group */}
                                    <div className="flex items-center gap-4 sm:gap-6 flex-1">
                                        {/* Date */}
                                        <div className="text-center bg-white rounded-xl p-3 sm:p-4 shadow-sm min-w-[70px] sm:min-w-[80px]">
                                            <div className="text-2xl sm:text-3xl font-bold text-primary-600">
                                                {new Date(cls.date).getDate()}
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-600">
                                                {new Date(cls.date).toLocaleDateString('vi-VN', { month: 'short' })}
                                            </div>
                                        </div>

                                        {/* Class Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">{cls.title}</h3>
                                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    ⏰ {cls.time}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    👨‍🏫 {cls.teacher}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    {cls.type === 'online' ? '💻' : '🏫'} {cls.room}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex sm:flex-col lg:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                        <button className="flex-1 sm:flex-none px-4 py-2 sm:py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:shadow-lg transition text-sm sm:text-base whitespace-nowrap">
                                            {cls.type === 'online' ? t('schedule.join', 'Tham gia') : t('schedule.details', 'Chi tiết')}
                                        </button>
                                        <button className="px-3 sm:px-2 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600">
                                            ⋮
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Request Change Button */}
                    <div className="mt-6 sm:mt-8 text-center">
                        <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-primary-300 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition text-sm sm:text-base">
                            📝 {t('schedule.requestChange', 'Yêu Cầu Đổi Lịch')}
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default MySchedule;
