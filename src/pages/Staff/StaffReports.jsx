import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageContainer } from '../../components/ui/PageContainer';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import Input from '../../components/ui/Input';
import staffService from '../../services/staffService';
import Swal from 'sweetalert2';

const StaffReports = () => {
  const { t } = useTranslation();

  // States
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);

  // Report data states
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await staffService.getClasses();
      setClasses(response.data?.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleGenerateAttendanceReport = async () => {
    if (!selectedClass) {
      Swal.fire({
        icon: 'warning',
        title: t('staff.reports.selectClass'),
        text: t('staff.reports.selectClassRequired')
      });
      return;
    }

    try {
      setLoading(true);
      const request = {
        classId: selectedClass,
        startDate: startDate || null,
        endDate: endDate || null,
        groupBy: 'STUDENT',
        includeDetails: true
      };

      const response = await staffService.getAttendanceReport(request);
      setAttendanceReport(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
      Swal.fire({
        icon: 'error',
        title: t('staff.reports.error.generateFailed'),
        text: error.response?.data?.message || 'Failed to generate report'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    Swal.fire({
      icon: 'info',
      title: t('staff.reports.export.title'),
      text: t('staff.reports.export.comingSoon')
    });
  };

  const getAttendanceRateColor = (rate) => {
    if (rate >= 90) return 'text-green-600 bg-green-50';
    if (rate >= 75) return 'text-blue-600 bg-blue-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAttendanceStatusBadge = (status) => {
    switch (status) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800';
      case 'GOOD': return 'bg-blue-100 text-blue-800';
      case 'AVERAGE': return 'bg-yellow-100 text-yellow-800';
      case 'POOR': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title={t('staff.reports.title')}
        subtitle={t('staff.reports.subtitle')}
      />

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'attendance', label: t('staff.reports.tabs.attendance'), icon: FileText },
              { key: 'registration', label: t('staff.reports.tabs.registration'), icon: Users },
              { key: 'students', label: t('staff.reports.tabs.students'), icon: Users }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Attendance Report Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Report Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-purple-600" />
              {t('staff.reports.filters')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('staff.class.className')}
                </label>
                <select
                  value={selectedClass || ''}
                  onChange={(e) => setSelectedClass(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{t('staff.reports.selectClass')}</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className} ({cls.classCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('staff.reports.startDate')}
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('staff.reports.endDate')}
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-end space-x-2">
                <Button
                  variant="primary"
                  onClick={handleGenerateAttendanceReport}
                  disabled={loading}
                  className="flex-1"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('staff.reports.generateReport')}
                </Button>
              </div>
            </div>
          </div>

          {/* Report Results */}
          {attendanceReport && (
            <div className="space-y-6">
              {/* Overall Statistics */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                    {attendanceReport.className} - {t('staff.reports.attendanceOverview')}
                  </h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExportReport}
                    className="flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('staff.reports.export')}
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">{t('staff.attendance.average')}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {attendanceReport.overall?.averageAttendanceRate?.toFixed(1) || 0}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">{t('staff.attendance.present')}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {attendanceReport.overall?.presentCount || 0}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">{t('staff.attendance.absent')}</p>
                    <p className="text-2xl font-bold text-red-600">
                      {attendanceReport.overall?.absentCount || 0}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">{t('staff.attendance.late')}</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {attendanceReport.overall?.lateCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Attendance Table */}
              {attendanceReport.studentAttendance && attendanceReport.studentAttendance.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    {t('staff.reports.byStudent')}
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            {t('staff.students.fullName')}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            {t('staff.attendance.present')}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            {t('staff.attendance.absent')}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            {t('staff.attendance.late')}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            {t('staff.attendance.average')}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            {t('staff.reports.status')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceReport.studentAttendance.map((student) => (
                          <tr key={student.studentId} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{student.studentName}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-900">
                              {student.presentCount || 0}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-900">
                              {student.absentCount || 0}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-900">
                              {student.lateCount || 0}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getAttendanceRateColor(student.attendanceRate)}`}>
                                {student.attendanceRate?.toFixed(1) || 0}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge className={getAttendanceStatusBadge(student.status)}>
                                {t(`staff.reports.status.${student.status.toLowerCase()}`)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Registration Report Tab */}
      {activeTab === 'registration' && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('staff.reports.registrationReport')}
          </h3>
          <p className="text-gray-500">{t('staff.reports.comingSoon')}</p>
        </div>
      )}

      {/* Students Report Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('staff.reports.studentReport')}
          </h3>
          <p className="text-gray-500">{t('staff.reports.comingSoon')}</p>
        </div>
      )}
    </PageContainer>
  );
};

export default StaffReports;
