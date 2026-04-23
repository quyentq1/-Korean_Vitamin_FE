import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Clock,
  Users,
  TrendingUp,
  Play,
  CheckCircle,
  Lock,
  Calendar,
  Award,
  BarChart,
  Grid,
  List,
  Search,
  Filter
} from 'lucide-react';
import studentService from '../../services/studentService';
import classService from '../../services/classService';
import CertificateSubmitModal from '../../components/Student/CertificateSubmitModal';

/**
 * MyCourses - Modern UI
 */
const MyCourses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCertModal, setShowCertModal] = useState(false);
  const [eligibleCourses, setEligibleCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
    studentService.getCertificateEligible().then(setEligibleCourses).catch(() => {});
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      // Debug: Log API response
      const response = await classService.getMyClasses();
      console.log('🔍 API Response from /student/my-classes:', response);

      const classesData = response?.data || response || [];
      console.log('📦 Parsed classesData:', classesData);
      console.log('📊 classesData length:', classesData.length);
      console.log('🔍 classesData isArray:', Array.isArray(classesData));

      if (!Array.isArray(classesData)) {
        console.error('❌ classesData is not an array:', classesData);
        setCourses([]);
        return;
      }

      const coursesMap = new Map();

      classesData.forEach((classEnrollment, index) => {
        console.log(`\n🔄 Processing class ${index}:`, classEnrollment);

        // Handle different response structures (nested or flat)
        // New backend API returns flat structure, old might return nested
        const courseId = classEnrollment?.courseId ||
                        classEnrollment?.classEntity?.courseId ||
                        classEnrollment?.course?.id;

        const classInfo = {
          id: classEnrollment?.classId || classEnrollment?.classEntity?.id || classEnrollment?.id,
          className: classEnrollment?.className || classEnrollment?.classEntity?.className,
          classCode: classEnrollment?.classCode || classEnrollment?.classEntity?.classCode,
          courseId: courseId,
          courseName: classEnrollment?.courseName || classEnrollment?.classEntity?.course?.name,
          courseCode: classEnrollment?.courseCode || classEnrollment?.classEntity?.course?.code,
          courseDescription: classEnrollment?.courseDescription || classEnrollment?.classEntity?.course?.description,
          courseThumbnail: classEnrollment?.courseThumbnail || classEnrollment?.classEntity?.course?.thumbnailUrl || classEnrollment?.classEntity?.thumbnail,
          teacherName: classEnrollment?.teacherName || classEnrollment?.classEntity?.teacher?.fullName,
          schedule: classEnrollment?.schedule || classEnrollment?.classEntity?.schedule,
          room: classEnrollment?.room || classEnrollment?.classEntity?.room
        };

        console.log(`  - classInfo:`, classInfo);
        console.log(`  - courseId:`, courseId);

        if (courseId) {
          if (!coursesMap.has(courseId)) {
            const courseData = {
              id: courseId,
              name: classInfo.courseName || t('student.myCourses.defaultCourseName'),
              code: classInfo.courseCode || '',
              description: classInfo.courseDescription || '',
              thumbnail: classInfo.courseThumbnail || null,
              teacher: classInfo.teacherName || t('student.myCourses.defaultTeacher'),
              progress: classEnrollment?.progress || 0,
              status: (classEnrollment?.status || 'ACTIVE').toUpperCase(),
              enrolledDate: classEnrollment?.enrollmentDate,
              classes: []
            };

            console.log(`  ✅ Creating new course:`, courseData);
            coursesMap.set(courseId, courseData);
          } else {
            console.log(`  📝 Course ${courseId} already exists, adding class`);
          }

          const course = coursesMap.get(courseId);
          const classData = {
            id: classInfo.id,
            name: classInfo.className || t('student.myCourses.defaultClassName'),
            code: classInfo.classCode || '',
            schedule: classInfo.schedule,
            room: classInfo.room
          };
          course.classes.push(classData);
          console.log(`  ➕ Added class to course:`, classData);
        } else {
          console.log(`  ⚠️ Skipping class ${index} - no courseId`);
        }
      });

      const finalCourses = Array.from(coursesMap.values());
      console.log('\n✅ Final courses array:', finalCourses);
      console.log('✅ Total unique courses:', finalCourses.length);

      setCourses(finalCourses);
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      console.error('Error details:', error.response?.data, error.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'ACTIVE': { text: t('student.myCourses.statusActive'), className: 'bg-green-100 text-green-700 border-green-300' },
      'COMPLETED': { text: t('student.myCourses.statusCompleted'), className: 'bg-blue-100 text-blue-700 border-blue-300' },
      'DROPPED': { text: t('student.myCourses.statusDropped'), className: 'bg-red-100 text-red-700 border-red-300' },
    };
    const badge = badges[status] || badges['ACTIVE'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-green-500 to-emerald-600';
    if (progress >= 50) return 'from-blue-500 to-indigo-600';
    if (progress >= 20) return 'from-yellow-500 to-orange-600';
    return 'from-gray-400 to-gray-500';
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">{t('student.myCourses.loading')}</p>
          <p className="text-sm text-gray-400">{t('student.myCourses.loadingSubtext')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('student.myCourses.title')}</h1>
              <p className="text-indigo-100 text-lg">{t('student.myCourses.subtitle')}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Grid className="w-6 h-6" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <List className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-lg border border-indigo-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                <p className="text-xs text-gray-500">{t('student.myCourses.totalCourses')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-green-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.status === 'ACTIVE').length}</p>
                <p className="text-xs text-gray-500">{t('student.myCourses.activeCourses')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-purple-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.status === 'COMPLETED').length}</p>
                <p className="text-xs text-gray-500">{t('student.myCourses.completedCourses')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-amber-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length) : 0}%
                </p>
                <p className="text-xs text-gray-500">{t('student.myCourses.avgProgress')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('student.myCourses.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-lg"
            />
          </div>
        </div>

        {/* Courses */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <BookOpen className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">{t('student.myCourses.noCoursesTitle')}</h3>
            <p className="text-gray-500 mb-6">{t('student.myCourses.noCoursesSubtitle')}</p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              {t('student.myCourses.viewCourses')}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white/50 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(course.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {course.name}
                  </h3>

                  {course.code && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg mb-3 font-mono">
                      {course.code}
                    </span>
                  )}

                  {course.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{course.teacher}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 font-medium">{t('student.myCourses.progress')}</span>
                      <span className="font-bold text-gray-900">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(course.progress)} rounded-full transition-all duration-500`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {course.classes.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{t('student.myCourses.classCount', { count: course.classes.length })}</span>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group-hover:gap-3"
                  >
                    <Play className="w-4 h-4" />
                    {t('student.myCourses.continueLearning')}
                  </button>
                  {course.status === 'ACTIVE' && eligibleCourses.some(e => e.courseId == course.id) && (
                    <button
                      onClick={() => setShowCertModal(true)}
                      className="w-full py-2.5 mt-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-semibold hover:bg-amber-100 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Award className="w-4 h-4" />
                      {t('student.myCourses.submitCertificate')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex gap-6">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.name}
                      className="w-40 h-40 object-cover rounded-xl shrink-0"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                      <BookOpen className="w-16 h-16 text-white/50" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                          {getStatusBadge(course.status)}
                        </div>
                        {course.code && (
                          <span className="text-xs text-gray-500 font-mono">{course.code}</span>
                        )}
                      </div>
                    </div>

                    {course.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{course.teacher}</span>
                      </div>
                      {course.classes.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{t('student.myCourses.classCountShort', { count: course.classes.length })}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 font-medium">{t('student.myCourses.progress')}</span>
                          <span className="font-bold text-gray-900">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getProgressColor(course.progress)} rounded-full`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/student/courses/${course.id}`)}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        {t('student.myCourses.continue')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CertificateSubmitModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        eligibleCourses={eligibleCourses}
        onSubmitted={() => {
          fetchCourses();
          studentService.getCertificateEligible().then(setEligibleCourses).catch(() => {});
        }}
      />
    </div>
  );
};

export default MyCourses;
