import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

import teacherService from '../../services/teacherService';

const TeacherReports = () => {
    const { t } = useTranslation();
    const [selectedClass, setSelectedClass] = useState('all');
    const [dateRange, setDateRange] = useState('month');
    const [classData, setClassData] = useState([]);
    const [topStudents, setTopStudents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classRes, topRes] = await Promise.all([
                    api.get('/teacher/reports/classes'),
                    api.get('/teacher/reports/top-students')
                ]);
                setClassData(classRes.data);

                // Add rank
                const rankedStudents = topRes.data.map((s, i) => ({ ...s, rank: i + 1 }));
                setTopStudents(rankedStudents);
            } catch (error) {
                console.error("Failed to load reports", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('reports.title', 'Báo Cáo Giảng Dạy')}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('reports.subtitle', 'Theo dõi hiệu suất lớp học và học viên')}
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                            >
                                <option value="all">{t('reports.allClasses', 'Tất cả lớp')}</option>
                                <option value="1">Advanced A1</option>
                                <option value="2">Intermediate B2</option>
                                <option value="3">Beginner C1</option>
                            </select>

                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                            >
                                <option value="week">{t('reports.thisWeek', 'Tuần này')}</option>
                                <option value="month">{t('reports.thisMonth', 'Tháng này')}</option>
                                <option value="quarter">{t('reports.thisQuarter', 'Quý này')}</option>
                                <option value="year">{t('reports.thisYear', 'Năm này')}</option>
                            </select>

                            <button className="px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition text-sm sm:text-base">
                                📥 {t('reports.exportPDF', 'Xuất PDF')}
                            </button>
                        </div>
                    </div>

                    {/* Class Performance Cards */}
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                            {t('reports.classPerformance', 'Hiệu Suất Lớp Học')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {classData.map((cls, idx) => (
                                <div key={idx} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
                                        <h3 className="font-bold text-lg sm:text-xl">{cls.name}</h3>
                                        <p className="text-xs sm:text-sm opacity-90">{cls.students} {t('reports.students', 'học viên')}</p>
                                    </div>
                                    <div className="p-4 sm:p-6 space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-1 text-sm sm:text-base">
                                                <span className="text-gray-600">{t('reports.avgScore', 'Điểm TB')}</span>
                                                <span className="font-bold text-primary-600">{cls.avgScore}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${cls.avgScore}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1 text-sm sm:text-base">
                                                <span className="text-gray-600">{t('reports.attendance', 'Điểm danh')}</span>
                                                <span className="font-bold text-green-600">{cls.attendance}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${cls.attendance}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1 text-sm sm:text-base">
                                                <span className="text-gray-600">{t('reports.progress', 'Tiến độ')}</span>
                                                <span className="font-bold text-blue-600">{cls.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${cls.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Students */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                            🏆 {t('reports.topStudents', 'Học Viên Xuất Sắc')}
                        </h2>
                        <div className="space-y-3">
                            {topStudents.map((student) => (
                                <div key={student.rank} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                                    <div className="flex items-center gap-4 sm:w-auto">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl ${student.rank === 1 ? 'bg-yellow-400 text-white' :
                                            student.rank === 2 ? 'bg-gray-300 text-white' :
                                                'bg-orange-300 text-white'
                                            }`}>
                                            #{student.rank}
                                        </div>
                                        <h3 className="font-bold text-gray-900 sm:hidden">{student.name}</h3>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 hidden sm:block truncate">{student.name}</h3>
                                        <p className="text-xs sm:text-sm text-gray-600">{student.class} • {student.tests} {t('reports.testsCompleted', 'bài test')}</p>
                                    </div>
                                    <div className="flex justify-between sm:block sm:text-right mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-yellow-200">
                                        <span className="text-sm font-medium text-gray-600 sm:hidden">{t('reports.avgScore', 'Điểm TB')}:</span>
                                        <div>
                                            <div className="text-xl sm:text-3xl font-bold text-green-600">{student.score}%</div>
                                            <p className="text-xs text-gray-500 hidden sm:block">{t('reports.avgScore', 'Điểm TB')}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TeacherReports;
