import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const TeacherDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const stats = {
        classes: 3,
        students: 75,
        pendingGrades: 12,
        questionsCreated: 145
    };

    const upcomingClasses = [
        { title: 'Advanced A1 - Grammar', date: '2024-12-22', time: '14:00', students: 25 },
        { title: 'Intermediate B2 - Speaking', date: '2024-12-24', time: '16:00', students: 30 }
    ];

    const recentActivity = [
        { type: 'grade', text: 'Chấm 5 bài viết của lớp Advanced A1', time: '2 giờ trước' },
        { type: 'question', text: 'Thêm 3 câu hỏi mới vào Question Bank', time: '5 giờ trước' },
        { type: 'quiz', text: 'Tạo quiz cuối buổi cho Lesson 10', time: '1 ngày trước' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('teacherDash.welcome', 'Chào Teacher')} 👋
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('teacherDash.subtitle', 'Tổng quan công việc giảng dạy của bạn')}
                        </p>
                    </div>

                    {/* Stats Cards - Grid cols 2 on mobile */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                        {[
                            { label: t('teacherDash.myClasses', 'Lớp của tôi'), value: stats.classes, icon: '📚', color: 'from-blue-500 to-blue-600' },
                            { label: t('teacherDash.totalStudents', 'Tổng học viên'), value: stats.students, icon: '👥', color: 'from-green-500 to-green-600' },
                            { label: t('teacherDash.pendingGrades', 'Chờ chấm'), value: stats.pendingGrades, icon: '⏳', color: 'from-orange-500 to-orange-600' },
                            { label: t('teacherDash.questionsCreated', 'Câu hỏi đã tạo'), value: stats.questionsCreated, icon: '❓', color: 'from-purple-500 to-purple-600' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:-translate-y-1 transition-all">
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
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Upcoming Classes */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    {t('teacherDash.upcomingClasses', 'Lớp Học Sắp Tới')}
                                </h2>
                                <div className="space-y-3">
                                    {upcomingClasses.map((cls, idx) => (
                                        <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">{cls.title}</h3>
                                            <div className="flex flex-wrap gap-y-2 gap-x-4 mt-2 text-xs sm:text-sm text-gray-600">
                                                <span>📅 {cls.date}</span>
                                                <span>⏰ {cls.time}</span>
                                                <span>👥 {cls.students} {t('teacherDash.students', 'học viên')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    {t('teacherDash.recentActivity', 'Hoạt Động Gần Đây')}
                                </h2>
                                <div className="space-y-3">
                                    {recentActivity.map((activity, idx) => (
                                        <div key={idx} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                                            <div className="text-xl sm:text-2xl">
                                                {activity.type === 'grade' ? '✅' : activity.type === 'question' ? '❓' : '📝'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-800 text-sm sm:text-base">{activity.text}</p>
                                                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
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
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    {t('teacherDash.quickActions', 'Thao Tác Nhanh')}
                                </h2>
                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                                    <button
                                        onClick={() => navigate('/grading-queue')}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition text-sm sm:text-base"
                                    >
                                        ⏳ {t('teacherDash.gradeAssignments', 'Chấm Bài')}
                                    </button>
                                    <button
                                        onClick={() => navigate('/question-bank')}
                                        className="w-full px-4 py-3 border-2 border-primary-200 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition text-sm sm:text-base"
                                    >
                                        ❓ {t('teacherDash.manageQuestions', 'QL Câu Hỏi')}
                                    </button>
                                    <button
                                        onClick={() => navigate('/create-quiz')}
                                        className="w-full px-4 py-3 border-2 border-primary-200 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition text-sm sm:text-base"
                                    >
                                        📝 {t('teacherDash.createQuiz', 'Tạo Quiz')}
                                    </button>
                                    <button
                                        onClick={() => navigate('/teacher-reports')}
                                        className="w-full px-4 py-3 border-2 border-primary-200 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition text-sm sm:text-base"
                                    >
                                        📊 {t('teacherDash.viewReports', 'Xem Báo Cáo')}
                                    </button>
                                </div>
                            </div>

                            {/* Performance Summary */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    {t('teacherDash.thisMonth', 'Tháng Này')}
                                </h2>
                                <div className="space-y-4 text-sm sm:text-base">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('teacherDash.classesTaught', 'Buổi dạy')}</span>
                                        <span className="font-bold text-gray-900">24</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('teacherDash.assignmentsGraded', 'Bài đã chấm')}</span>
                                        <span className="font-bold text-gray-900">156</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('teacherDash.avgGradingTime', 'TB thời gian chấm')}</span>
                                        <span className="font-bold text-gray-900">12m</span>
                                    </div>
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

export default TeacherDashboard;
