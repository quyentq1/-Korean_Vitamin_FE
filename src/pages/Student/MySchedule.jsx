import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, Users, RefreshCw, Video } from 'lucide-react';
import classService from '../../services/classService';

const MySchedule = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);

  const fetchSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const classesData = await classService.getMyClasses();
      const classesList = classesData || [];

      const uniqueClasses = classesList.map(cls => ({
        id: cls.classId || cls.classEntity?.id || cls.id,
        name: cls.className || cls.classEntity?.className || t('student.mySchedule.defaultClassName'),
        code: cls.classCode || cls.classEntity?.classCode || 'N/A'
      }));

      setClasses(uniqueClasses);

      const allSchedules = [];
      for (const cls of classesList) {
        const classId = cls.classId || cls.classEntity?.id || cls.id;
        if (classId) {
          try {
            const schedulesData = await classService.getClassSchedules(classId);
            const schedulesWithClassInfo = (schedulesData || []).map(schedule => ({
              ...schedule,
              classId: classId,
              className: cls.className || cls.classEntity?.className
            }));
            allSchedules.push(...schedulesWithClassInfo);
          } catch (err) {
            console.warn(`Failed to fetch schedules for class ${classId}:`, err);
          }
        }
      }

      setSchedules(allSchedules);
    } catch (err) {
      console.error('Error:', err);
      setError(t('student.mySchedule.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('student.mySchedule.title')}</h1>
              <p className="text-indigo-100">{t('student.mySchedule.subtitle')}</p>
            </div>
            <button
              onClick={fetchSchedules}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{schedules.length}</p>
                <p className="text-sm text-gray-500">{t('student.mySchedule.sessions')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{classes.length}</p>
                <p className="text-sm text-gray-500">{t('student.mySchedule.classes')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{schedules.length > 0 ? t('student.mySchedule.hasSchedule') : t('student.mySchedule.upcoming')}</p>
                <p className="text-sm text-gray-500">{t('student.mySchedule.statusLabel')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedules List */}
        {schedules.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">{t('student.mySchedule.noScheduleTitle')}</h3>
            <p className="text-gray-500">{t('student.mySchedule.noScheduleDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {schedules.map((schedule, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        {schedule.date || schedule.lessonDate ? new Date(schedule.date || schedule.lessonDate).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : t('student.mySchedule.noDate')}
                      </h3>
                    </div>
                    {schedule.className && (
                      <p className="text-sm text-gray-600 mb-2">{schedule.className}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                  {schedule.room && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{schedule.room}</span>
                    </div>
                  )}
                </div>

                {schedule.topic && (
                  <div className="mb-4 p-3 bg-indigo-50 rounded-xl">
                    <p className="text-sm text-gray-700">{schedule.topic}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    schedule.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                    schedule.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {schedule.status === 'SCHEDULED' ? t('student.mySchedule.statusScheduled') :
                     schedule.status === 'COMPLETED' ? t('student.mySchedule.statusCompleted') : schedule.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySchedule;
