import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Save,
  RefreshCw,
  Users,
  Calendar,
  ChevronLeft,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageContainer } from '../../components/ui/PageContainer';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Alert } from '../../components/ui/Alert';
import staffService from '../../services/staffService';
import Swal from 'sweetalert2';

const ClassAttendance = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  // States
  const [classData, setClassData] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState(null);

  useEffect(() => {
    fetchClassData();
  }, [id]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const [classDetail, stats] = await Promise.all([
        staffService.getClassDetails(id),
        staffService.getAttendanceStats(id)
      ]);

      setClassData(classDetail.data);
      setSchedules(classDetail.data.schedules || []);
      setStudents(classDetail.data.students || []);
      setAttendanceStats(stats.data);
    } catch (error) {
      console.error('Error fetching class data:', error);
      Swal.fire({
        icon: 'error',
        title: t('staff.attendance.error.loadFailed'),
        text: error.response?.data?.message || 'Failed to load class data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSelect = async (schedule) => {
    setSelectedSchedule(schedule);

    try {
      setLoading(true);
      const attendance = await staffService.getAttendanceForSchedule(schedule.scheduleId);
      setAttendanceRecords(attendance.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      // If no attendance exists, initialize it
      Swal.fire({
        icon: 'question',
        title: t('staff.attendance.noAttendance'),
        text: t('staff.attendance.initializePrompt'),
        showCancelButton: true,
        confirmButtonText: t('common.yes'),
        cancelButtonText: t('common.no')
      }).then((result) => {
        if (result.isConfirmed) {
          initializeAttendance(schedule.scheduleId);
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeAttendance = async (scheduleId) => {
    try {
      setInitializing(true);
      await staffService.initializeAttendanceForSchedule(scheduleId);
      Swal.fire({
        icon: 'success',
        title: t('staff.attendance.initialized'),
        timer: 1500,
        showConfirmButton: false
      });
      // Reload attendance
      const attendance = await staffService.getAttendanceForSchedule(scheduleId);
      setAttendanceRecords(attendance.data || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('staff.attendance.initializeFailed'),
        text: error.response?.data?.message
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleMarkAttendance = (studentId, status) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.studentId === studentId
          ? { ...record, status }
          : record
      )
    );
  };

  const handleMarkAll = (status) => {
    setAttendanceRecords(prev =>
      prev.map(record => ({ ...record, status }))
    );
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);

      const payload = {
        scheduleId: selectedSchedule.scheduleId,
        attendanceRecords: attendanceRecords.map(record => ({
          studentId: record.studentId,
          status: record.status,
          notes: record.notes || ''
        }))
      };

      await staffService.markAttendance(payload);

      Swal.fire({
        icon: 'success',
        title: t('staff.attendance.saved'),
        timer: 1500,
        showConfirmButton: false
      });

      // Reload stats
      const stats = await staffService.getAttendanceStats(id);
      setAttendanceStats(stats.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('staff.attendance.saveFailed'),
        text: error.response?.data?.message
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="w-4 h-4" />;
      case 'ABSENT': return <XCircle className="w-4 h-4" />;
      case 'LATE': return <Clock className="w-4 h-4" />;
      case 'EXCUSED': return <FileText className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading && !classData) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <Loading />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-4"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {t('common.back')}
        </button>

        <PageHeader
          title={classData?.className || ''}
          subtitle={t('staff.attendance.title')}
        />

        {/* Stats Cards */}
        {attendanceStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('staff.attendance.averageRate')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {attendanceStats.averageAttendanceRate?.toFixed(1) || 0}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('staff.attendance.present')}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {attendanceStats.presentCount || 0}
                  </p>
                </div>
                <CheckSquare className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('staff.attendance.absent')}</p>
                  <p className="text-2xl font-bold text-red-600">
                    {attendanceStats.absentCount || 0}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('staff.attendance.late')}</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {attendanceStats.lateCount || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-purple-600" />
          {t('staff.attendance.selectSchedule')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule) => (
            <button
              key={schedule.scheduleId}
              onClick={() => handleScheduleSelect(schedule)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedSchedule?.scheduleId === schedule.scheduleId
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className={
                  schedule.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  schedule.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {t(`staff.class.detail.schedule.status.${schedule.status.toLowerCase()}`)}
                </Badge>
                <span className="text-sm font-medium text-purple-600">
                  #{schedule.lessonNumber}
                </span>
              </div>
              <p className="text-sm text-gray-900 font-medium">
                {new Date(schedule.lessonDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                {schedule.startTime} - {schedule.endTime}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {schedule.topic || '-'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Marking */}
      {selectedSchedule && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  {t('staff.attendance.markAttendance')}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t('staff.attendance.lesson')} #{selectedSchedule.lessonNumber} - {new Date(selectedSchedule.lessonDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleMarkAll('PRESENT')}
                  disabled={loading}
                  className="flex items-center"
                >
                  <CheckSquare className="w-4 h-4 mr-1" />
                  {t('staff.attendance.markAllPresent')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleMarkAll('ABSENT')}
                  disabled={loading}
                  className="flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  {t('staff.attendance.markAllAbsent')}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loading />
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">{t('staff.attendance.noStudents')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {attendanceRecords.map((record) => (
                  <div
                    key={record.studentId}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                        {record.studentName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{record.studentName}</p>
                        <p className="text-sm text-gray-500">{record.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {['PRESENT', 'LATE', 'EXCUSED', 'ABSENT'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleMarkAttendance(record.studentId, status)}
                          className={`px-3 py-2 rounded-lg border-2 transition-all flex items-center space-x-1 ${
                            record.status === status
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-purple-300 text-gray-600'
                          }`}
                        >
                          {getStatusIcon(status)}
                          <span className="text-sm font-medium">
                            {t(`staff.attendance.status.${status.toLowerCase()}`)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Save Button */}
            {attendanceRecords.length > 0 && (
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedSchedule(null)}
                  disabled={saving}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveAttendance}
                  disabled={saving || initializing}
                  className="flex items-center"
                >
                  {saving || initializing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {t('common.save')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ClassAttendance;
