import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CourseCard from '../../components/CourseCard';
import { Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import courseService from '../../services/courseService';

const CourseList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('ALL');

    // Ref để theo dõi việc đã redirect chưa
    const hasRedirectedRef = useRef(false);

    // Redirect nếu user đã đăng nhập
    useEffect(() => {
        if (isAuthenticated && user?.role && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            const roleRoutes = {
                'ADMIN': '/admin',
                'MANAGER': '/manager',
                'TEACHER': '/teacher-dashboard',
                'STAFF': '/staff',
                'STUDENT': '/learner-dashboard',
                'LEARNER': '/learner-dashboard'
            };
            const redirectPath = roleRoutes[user.role] || '/';
            navigate(redirectPath, { replace: true });
        }

        // Reset ref khi không còn authenticated (đăng xuất)
        if (!isAuthenticated) {
            hasRedirectedRef.current = false;
        }
    }, [isAuthenticated, user, navigate]);

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

    // Filter courses
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLevel = selectedLevel === 'ALL' || course.level === selectedLevel;
        return matchesSearch && matchesLevel;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
                    <p className="mt-4 text-gray-600">Loading courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            {/* Hero Section with Search */}
            <div className="bg-gradient-to-br from-primary-400 to-primary-600 pt-24 pb-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {t('courses.title', 'Explore Our Courses')}
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 mb-8">
                            {t('courses.subtitle', 'Master Korean language with our comprehensive courses')}
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white rounded-full p-2 flex items-center shadow-lg max-w-2xl mx-auto">
                            <input
                                type="text"
                                placeholder={t('courses.searchPlaceholder', 'Search courses...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 px-6 py-3 text-gray-900 bg-transparent focus:outline-none"
                            />
                            <button className="bg-primary-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-600 transition-colors flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-12">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <span className="text-sm font-medium text-gray-700">Filter by level:</span>
                    <div className="flex flex-wrap gap-2">
                        {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(level => (
                            <button
                                key={level}
                                onClick={() => setSelectedLevel(level)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedLevel === level
                                        ? 'bg-primary-400 text-white shadow-teal'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {level === 'ALL' ? 'All Levels' : level.charAt(0) + level.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto text-sm text-gray-600">
                        {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-8 flex items-center gap-3">
                        <svg className="w-5 h-5 text-error-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-error-700">{error}</p>
                    </div>
                )}

                {/* Course Grid */}
                {filteredCourses.length === 0 && !error ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || selectedLevel !== 'ALL'
                                ? 'Try adjusting your filters or search term'
                                : 'No courses are currently available'}
                        </p>
                        {(searchTerm || selectedLevel !== 'ALL') && (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedLevel('ALL');
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {filteredCourses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default CourseList;
