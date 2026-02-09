import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Filter,
  RefreshCw,
  Video,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import studentService from '../../services/studentService';
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Alert,
  Loading,
  Badge
} from '../../components/ui';

/**
 * MySchedule Component
 *
 * Enhanced schedule page with:
 * - Calendar view (grid layout)
 * - List view (timeline layout)
 * - Filter by class
 * - Attendance status badges
 * - Integrate GET /api/classes/{id}/schedules
 *
 * @component
 */
const MySchedule = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('week'); // 'week', 'month', 'list'
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);

  // Mock class data - will be replaced with API call
  const mockClasses = [
    { id: 1, name: 'TOPIK I - Grammar', code: 'TOPIK1-G' },
    { id: 2, name: 'TOPIK I - Listening', code: 'TOPIK1-L' },
    { id: 3, name: 'TOPIK II - Reading', code: 'TOPIK2-R' },
    { id: 4, name: 'TOPIK II - Speaking', code: 'TOPIK2-S' },
  ];

  // Mock schedule data - will be replaced with API call
  const mockSchedules = [
    {
      id: 1,
      title: 'Grammar Advanced',
      date: '2024-12-22',
      time: '14:00-16:00',
      teacher: 'Ms. Park',
      type: 'online',
      room: 'Zoom Room 1',
      classId: 1,
      attendanceStatus: 'present',
      description: 'Advanced grammar lesson for TOPIK I'
    },
    {
      id: 2,
      title: 'Speaking Practice',
      date: '2024-12-24',
      time: '16:00-18:00',
      teacher: 'Mr. Kim',
      type: 'offline',
      room: 'Room 301',
      classId: 2,
      attendanceStatus: 'absent',
      description: 'Speaking practice session'
    },
    {
      id: 3,
      title: 'Listening Skills',
      date: '2024-12-26',
      time: '10:00-12:00',
      teacher: 'Ms. Lee',
      type: 'online',
      room: 'Zoom Room 2',
      classId: 1,
      attendanceStatus: 'pending',
      description: 'Listening comprehension practice'
    },
    {
      id: 4,
      title: 'Writing Workshop',
      date: '2024-12-28',
      time: '14:00-16:00',
      teacher: 'Mr. Choi',
      type: 'offline',
      room: 'Room 205',
      classId: 3,
      attendanceStatus: 'present',
      description: 'Writing skills workshop'
    },
    {
      id: 5,
      title: 'Reading Practice',
      date: '2024-12-30',
      time: '09:00-11:00',
      teacher: 'Ms. Kim',
      type: 'online',
      room: 'Zoom Room 3',
      classId: 2,
      attendanceStatus: 'pending',
      description: 'Reading comprehension practice'
    },
    {
      id: 6,
      title: 'Speaking Mock Test',
      date: '2024-12-31',
      time: '15:00-17:00',
      teacher: 'Mr. Lee',
      type: 'offline',
      room: 'Room 402',
      classId: 4,
      attendanceStatus: 'absent',
      description: 'Mock speaking test for TOPIK II'
    },
  ];

  // Fetch schedules from API
  const fetchSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      // TODO: Replace with actual API call
      // const data = await studentService.getUpcomingClasses();
      // setSchedules(data || []);
      
      // Using mock data for now
      setSchedules(mockSchedules);
      setClasses(mockClasses);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError(t('schedule.error.fetchFailed', 'Không thể tải lịch học. Vui lòng thử lại sau.'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Filter schedules based on selected class
  const filteredSchedules = selectedClass === 'all'
    ? schedules
    : schedules.filter(s => s.classId === parseInt(selectedClass));

  // Get days in month for calendar view
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ day: null, date: null });
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ day: i, date: new Date(year, month, i) });
    }
    
    return days;
  };

  // Get schedules for a specific date
  const getSchedulesForDate = (date) => {
    return filteredSchedules.filter(s => {
      const scheduleDate = new Date(s.date);
      return scheduleDate.getDate() === date.getDate() &&
             scheduleDate.getMonth() === date.getMonth() &&
             scheduleDate.getFullYear() === date.getFullYear();
    });
  };

  // Get attendance badge variant
  const getAttendanceBadgeVariant = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Handle view change
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Handle class filter change
  const handleClassChange = (classId) => {
    setSelectedClass(classId);
  };

  // Handle date change (for month view)
  const handleDateChange = (direction) => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchSchedules();
  };

  // Handle schedule click
  const handleScheduleClick = (scheduleId) => {
    navigate(`/class-detail/${scheduleId}`);
  };

  // Handle join class
  const handleJoinClass = (schedule) => {
    if (schedule.type === 'online') {
      window.open(schedule.room, '_blank');
    } else {
      navigate(`/class-detail/${schedule.id}`);
    }
  };

  // Get current month name
  const getCurrentMonthName = () => {
    return selectedDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading.Spinner size="xl" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('schedule.title', 'Lịch Học Của Tôi')}
        subtitle={t('schedule.subtitle', 'Quản lý lịch học và tham gia lớp học đúng giờ')}
        actions={[
          {
            label: t('common.refresh', 'Làm mới'),
            icon: RefreshCw,
            onClick: handleRefresh,
            variant: 'ghost',
          },
        ]}
      />

      {/* Error Alert */}
      {error && (
        <Alert type="error" dismissible onDismiss={() => setError('')} className="mb-6">
          {error}
        </Alert>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        {/* Class Filter */}
        <div className="relative">
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
          >
            <option value="all">{t('schedule.allClasses', 'Tất cả lớp')}</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          {['week', 'month', 'list'].map((v) => (
            <Button
              key={v}
              variant={view === v ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange(v)}
            >
              {t(`schedule.view.${v}`, v)}
            </Button>
          ))}
        </div>
      </div>

      {/* Schedule Count */}
      <div className="mb-4 text-gray-600">
        {t('schedule.scheduleCount', 'Có {{count}} buổi học', { count: filteredSchedules.length })}
      </div>

      {/* Calendar View */}
      {view === 'month' && (
        <Card>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDateChange('prev')}
            >
              {t('common.previous', 'Tháng trước')}
            </Button>
            <h3 className="text-xl font-bold text-gray-900">
              {getCurrentMonthName()}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDateChange('next')}
            >
              {t('common.next', 'Tháng sau')}
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 text-sm">
                {day}
              </div>
            ))}

            {/* Days */}
            {getDaysInMonth(selectedDate).map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 border-2 border-gray-100 rounded-lg cursor-pointer hover:border-primary-300 transition ${
                  day.day ? 'bg-white' : 'bg-gray-50'
                }`}
                onClick={() => day.date && setSelectedDate(day.date)}
              >
                {day.day && (
                  <>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {day.day}
                    </div>
                    <div className="space-y-1">
                      {getSchedulesForDate(day.date).slice(0, 2).map((schedule) => (
                        <div
                          key={schedule.id}
                          className="text-xs p-1 rounded bg-primary-50 text-primary-700 truncate cursor-pointer hover:bg-primary-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScheduleClick(schedule.id);
                          }}
                        >
                          {schedule.time}
                        </div>
                      ))}
                      {getSchedulesForDate(day.date).length > 2 && (
                        <div className="text-xs text-center text-gray-500">
                          +{getSchedulesForDate(day.date).length - 2}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="space-y-4">
          {/* Week Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {t('schedule.currentWeek', 'Tuần này')}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              icon={Calendar}
            >
              {t('schedule.viewFullCalendar', 'Xem lịch đầy đủ')}
            </Button>
          </div>

          {/* Week Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
              <div key={day} className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600 text-center">
                  {t(`schedule.day.${day.toLowerCase()}`, day)}
                </h4>
                {filteredSchedules
                  .filter(s => new Date(s.date).getDay() === (index + 1) % 7)
                  .map((schedule) => (
                    <Card
                      key={schedule.id}
                      className="hover:shadow-lg transition cursor-pointer"
                      onClick={() => handleScheduleClick(schedule.id)}
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-gray-900 text-sm truncate">
                            {schedule.title}
                          </h5>
                          <Badge variant={getAttendanceBadgeVariant(schedule.attendanceStatus)}>
                            {t(`schedule.attendance.${schedule.attendanceStatus}`, schedule.attendanceStatus)}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {schedule.time}
                          </div>
                          <div className="flex items-center gap-1">
                            {schedule.type === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {schedule.type === 'online' ? 'Online' : schedule.room}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-4">
          {filteredSchedules.map((schedule) => (
            <Card
              key={schedule.id}
              className="hover:shadow-lg transition cursor-pointer"
              onClick={() => handleScheduleClick(schedule.id)}
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  {/* Date */}
                  <div className="text-center bg-white rounded-xl p-3 sm:p-4 shadow-sm min-w-[70px] sm:min-w-[80px]">
                    <div className="text-2xl sm:text-3xl font-bold text-primary-600">
                      {new Date(schedule.date).getDate()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {new Date(schedule.date).toLocaleDateString('vi-VN', { month: 'short' })}
                    </div>
                  </div>

                  {/* Class Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">
                        {schedule.title}
                      </h3>
                      <Badge variant={getAttendanceBadgeVariant(schedule.attendanceStatus)}>
                        {t(`schedule.attendance.${schedule.attendanceStatus}`, schedule.attendanceStatus)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {schedule.description}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {schedule.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {schedule.teacher}
                      </span>
                      <span className="flex items-center gap-1">
                        {schedule.type === 'online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        {schedule.type === 'online' ? 'Online' : schedule.room}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col lg:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinClass(schedule);
                      }}
                    >
                      {schedule.type === 'online' ? t('schedule.join', 'Tham gia') : t('schedule.details', 'Chi tiết')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/class-detail/${schedule.id}`);
                      }}
                    >
                      {t('common.viewDetail', 'Xem chi tiết')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredSchedules.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {t('schedule.noSchedules', 'Không có lịch học nào')}
          </p>
          <p className="text-sm text-gray-500">
            {t('schedule.noSchedulesDescription', 'Bạn chưa có lịch học nào trong khoảng thời gian này')}
          </p>
        </div>
      )}

      {/* Request Change Button */}
      <div className="mt-6 text-center">
        <Button
          variant="secondary"
          size="lg"
          icon={AlertCircle}
          onClick={() => navigate('/schedule-change-request')}
        >
          {t('schedule.requestChange', 'Yêu Cầu Đổi Lịch')}
        </Button>
      </div>

      {/* Footer */}
      <Footer />
    </PageContainer>
  );
};

export default MySchedule;
