import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import courseService from '../../services/courseService';

const CourseList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseService.getActiveCourses();
                setCourses(data);
            } catch (err) {
                setError('Failed to load courses.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <div className="pt-24 pb-12 container mx-auto px-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                    {t('courses.title', 'Danh sách Khóa học')}
                </h1>

                {error && <p className="text-red-500 text-center mb-8">{error}</p>}

                {courses.length === 0 && !error ? (
                    <p className="text-gray-600 text-center">Hiện chưa có khóa học nào đang mở.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map(course => (
                            <div key={course.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col">
                                <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                                    {course.code || '📚'}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
                                        {course.description}
                                    </p>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                        <span className="text-primary-600 font-bold">
                                            {course.fee ? `${course.fee.toLocaleString()} VND` : 'Liên hệ'}
                                        </span>
                                        <button
                                            onClick={() => navigate(`/courses/${course.id}`)}
                                            className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium hover:bg-primary-200 transition"
                                        >
                                            Chi tiết →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default CourseList;
