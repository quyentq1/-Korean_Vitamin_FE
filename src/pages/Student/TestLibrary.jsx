import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Clock, BookOpen, Play } from 'lucide-react';
import studentService from '../../services/studentService';
import classService from '../../services/classService';

const TestLibrary = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const classesData = await classService.getMyClasses();
        const userClasses = classesData || [];
        const enrolledCourseIds = new Set();
        userClasses.forEach(classEnrollment => {
          const courseId = classEnrollment.courseId || classEnrollment.classEntity?.courseId || classEnrollment.course?.id;
          if (courseId) enrolledCourseIds.add(courseId);
        });

        const response = await studentService.getExams('AVAILABLE');
        const allExams = response?.data || response || [];
        const accessibleExams = allExams.filter(exam => {
          const examCourseId = exam.courseId || exam.course?.id;
          return enrolledCourseIds.has(examCourseId);
        });

        setTests(Array.isArray(accessibleExams) ? accessibleExams : []);
      } catch (err) {
        console.error('Failed:', err);
        setError(t('student.testLibrary.fetchError'));
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const filteredTests = tests.filter(test =>
    test.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-2">{t('student.testLibrary.title')}</h1>
          <p className="text-indigo-100">{t('student.testLibrary.subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('student.testLibrary.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none shadow-lg"
          />
        </div>

        {/* Test Count */}
        <div className="mb-6">
          <span className="text-gray-600">{t('student.testLibrary.testCount', { count: filteredTests.length })}</span>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <BookOpen className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">{t('student.testLibrary.noTestsFound')}</h3>
            <p className="text-gray-500">{t('student.testLibrary.tryDifferentKeyword')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div key={test.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{t('student.testLibrary.available')}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {test.title || t('student.testLibrary.defaultTestTitle')}
                  </h3>

                  {test.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{test.description}</p>
                  )}

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{test.durationMinutes || test.duration || 60} {t('common.minutes')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{test.totalPoints || test.points || 100} {t('student.testLibrary.points')}</span>
                    </div>
                    {test.courseName && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{test.courseName}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/exam/${test.id}/intro`)}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {t('student.testLibrary.startTest')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestLibrary;
