import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ClassManagement = () => {
    const { t } = useTranslation();
    const [view, setView] = useState('list');

    const classes = [
        {
            id: 1,
            name: 'Advanced A1',
            teacher: 'Teacher Park',
            students: 25,
            capacity: 30,
            schedule: 'Mon/Wed 14:00-16:00',
            startDate: '2024-01-15',
            endDate: '2024-06-15',
            status: 'active'
        },
        {
            id: 2,
            name: 'Intermediate B2',
            teacher: 'Teacher Kim',
            students: 30,
            capacity: 30,
            schedule: 'Tue/Thu 16:00-18:00',
            startDate: '2024-02-01',
            endDate: '2024-07-01',
            status: 'active'
        },
        {
            id: 3,
            name: 'Beginner C1',
            teacher: 'Teacher Lee',
            students: 20,
            capacity: 25,
            schedule: 'Mon/Wed/Fri 10:00-12:00',
            startDate: '2024-03-01',
            endDate: '2024-08-01',
            status: 'enrolling'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('classMgmt.title', 'Quản Lý Lớp Học')}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('classMgmt.subtitle', 'Tạo và quản lý các lớp học, phân công giáo viên')}
                        </p>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex gap-2 sm:gap-3">
                            <button
                                onClick={() => setView('list')}
                                className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition text-sm sm:text-base ${view === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'
                                    }`}
                            >
                                📋 <span className="hidden sm:inline">{t('classMgmt.listView', 'Danh sách')}</span>
                            </button>
                            <button
                                onClick={() => setView('calendar')}
                                className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition text-sm sm:text-base ${view === 'calendar' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'
                                    }`}
                            >
                                📅 <span className="hidden sm:inline">{t('classMgmt.calendarView', 'Lịch')}</span>
                            </button>
                        </div>

                        <button className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-lg transition text-sm sm:text-base">
                            ➕ {t('classMgmt.createClass', 'Tạo Lớp Mới')}
                        </button>
                    </div>

                    {/* Classes Grid - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {classes.map((cls) => (
                            <div key={cls.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 sm:p-6 text-white">
                                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                                        <div>
                                            <h3 className="text-lg sm:text-2xl font-bold">{cls.name}</h3>
                                            <p className="text-xs sm:text-sm opacity-90 mt-1">👨‍🏫 {cls.teacher}</p>
                                        </div>
                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${cls.status === 'active' ? 'bg-green-400/30 text-white' : 'bg-yellow-400/30 text-white'
                                            }`}>
                                            {cls.status === 'active' ? t('classMgmt.active', 'Đang học') : t('classMgmt.enrolling', 'Đang tuyển')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-white/20 rounded-full h-2">
                                            <div
                                                className="bg-white h-2 rounded-full"
                                                style={{ width: `${(cls.students / cls.capacity) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs sm:text-sm">{cls.students}/{cls.capacity}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="text-lg sm:text-xl">📅</span>
                                        <span className="text-xs sm:text-sm">{cls.schedule}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="text-lg sm:text-xl">🗓️</span>
                                        <span className="text-xs sm:text-sm">{cls.startDate} → {cls.endDate}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-3 sm:pt-4 grid grid-cols-2 gap-2">
                                        <button className="px-3 sm:px-4 py-2 bg-primary-50 text-primary-600 rounded-lg font-medium hover:bg-primary-100 transition text-xs sm:text-sm">
                                            👥 {t('classMgmt.students', 'Học viên')}
                                        </button>
                                        <button className="px-3 sm:px-4 py-2 bg-gray-50 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition text-xs sm:text-sm">
                                            ✏️ {t('classMgmt.edit', 'Sửa')}
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

export default ClassManagement;
