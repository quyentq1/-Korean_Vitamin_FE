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
  Clock,
  GraduationCap,
  Star,
  Send
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

  // Teacher reports states
  const [teacherReports, setTeacherReports] = useState([]);
  const [teacherReportsLoading, setTeacherReportsLoading] = useState(false);
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);
  const [showReportDetailModal, setShowReportDetailModal] = useState(false);

  // Student feedback states
  const [studentReports, setStudentReports] = useState([]);
  const [studentReportsLoading, setStudentReportsLoading] = useState(false);
  const [selectedStudentReport, setSelectedStudentReport] = useState(null);
  const [showStudentReportModal, setShowStudentReportModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  // Teacher Reports Handlers
  const handleFetchTeacherReports = async () => {
    if (!selectedClass) {
      Swal.fire({
        icon: 'warning',
        title: t('staff.reports.selectClass'),
        text: t('staff.reports.selectClassRequired')
      });
      return;
    }

    try {
      setTeacherReportsLoading(true);
      const response = await staffService.getTeacherReports(selectedClass);
      setTeacherReports(response.data || []);
    } catch (error) {
      console.error('Error fetching teacher reports:', error);
      Swal.fire({
        icon: 'error',
        title: t('staff.reports.error.fetchFailed'),
        text: error.response?.data?.message || 'Failed to fetch teacher reports'
      });
    } finally {
      setTeacherReportsLoading(false);
    }
  };

  const handleViewReportDetail = async (report) => {
    try {
      const response = await staffService.getStudentReportDetail(selectedClass, report.student.id);
      setSelectedReportDetail(response.data);
      setShowReportDetailModal(true);
    } catch (error) {
      console.error('Error fetching report detail:', error);
      Swal.fire({
        icon: 'error',
        title: t('staff.reports.error.fetchDetailFailed'),
        text: error.response?.data?.message || 'Failed to fetch report detail'
      });
    }
  };

  // Student Feedback Handlers
  const handleFetchStudentReports = async () => {
    if (!selectedClass) {
      Swal.fire({
        icon: 'warning',
        title: t('staff.reports.selectClass'),
        text: t('staff.reports.selectClassRequired')
      });
      return;
    }

    try {
      setStudentReportsLoading(true);
      const response = await staffService.getStudentReports(selectedClass, statusFilter);
      setStudentReports(response.data || []);
    } catch (error) {
      console.error('Error fetching student reports:', error);
      Swal.fire({
        icon: 'error',
        title: t('staff.reports.error.fetchFailed'),
        text: error.response?.data?.message || 'Failed to fetch student reports'
      });
    } finally {
      setStudentReportsLoading(false);
    }
  };

  const handleViewStudentReport = (report) => {
    setSelectedStudentReport(report);
    setResponseText(report.response || '');
    setShowStudentReportModal(true);
  };

  const handleRespondToReport = async () => {
    if (!selectedStudentReport || !responseText.trim()) {
      Swal.fire({
        icon: 'warning',
        title: t('staff.reports.warning'),
        text: t('staff.reports.responseRequired')
      });
      return;
    }

    try {
      await staffService.respondToStudentReport(selectedStudentReport.id, responseText);
      Swal.fire({
        icon: 'success',
        title: t('staff.reports.success'),
        text: t('staff.reports.responseSent')
      });
      setShowStudentReportModal(false);
      handleFetchStudentReports(); // Refresh list
    } catch (error) {
      console.error('Error responding to report:', error);
      Swal.fire({
        icon: 'error',
        title: t('staff.reports.error.respondFailed'),
        text: error.response?.data?.message || 'Failed to send response'
      });
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await staffService.resolveStudentReport(reportId);
      Swal.fire({
        icon: 'success',
        title: t('staff.reports.success'),
        text: t('staff.reports.reportResolved')
      });
      handleFetchStudentReports(); // Refresh list
    } catch (error) {
      console.error('Error resolving report:', error);
      Swal.fire({
        icon: 'error',
        title: t('staff.reports.error.resolveFailed'),
        text: error.response?.data?.message || 'Failed to resolve report'
      });
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
              { key: 'teacher', label: t('staff.reports.tabs.teacher'), icon: GraduationCap },
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
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-purple-600" />
              {t('staff.reports.filters')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('staff.class.className')}
                </label>
                <select
                  value={selectedClass || ''}
                  onChange={(e) => setSelectedClass(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-[42px]"
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
                  className="w-full h-[42px]"
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
                  className="w-full h-[42px]"
                />
              </div>

              <div>
                <Button
                  variant="primary"
                  onClick={handleGenerateAttendanceReport}
                  disabled={loading}
                  className="w-full h-[42px] shadow-sm"
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
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{t('staff.attendance.average')}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {attendanceReport.overall?.averageAttendanceRate?.toFixed(1) || 0}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{t('staff.attendance.present')}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {attendanceReport.overall?.presentCount || 0}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-5 border border-red-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{t('staff.attendance.absent')}</p>
                    <p className="text-2xl font-bold text-red-600">
                      {attendanceReport.overall?.absentCount || 0}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-5 border border-yellow-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{t('staff.attendance.late')}</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {attendanceReport.overall?.lateCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Attendance Table */}
              {attendanceReport.studentAttendance && attendanceReport.studentAttendance.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    {t('staff.reports.byStudent')}
                  </h3>

                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {t('staff.students.fullName')}
                          </th>
                          <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
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

      {/* Teacher Reports Tab */}
      {activeTab === 'teacher' && (
        <div className="space-y-6">
          {/* Report Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-purple-600" />
              {t('staff.reports.filters')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('staff.class.className')}
                </label>
                <select
                  value={selectedClass || ''}
                  onChange={(e) => setSelectedClass(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-[42px]"
                >
                  <option value="">{t('staff.reports.selectClass')}</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className} ({cls.classCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  &nbsp;
                </label>
                <Button
                  variant="primary"
                  onClick={handleFetchTeacherReports}
                  disabled={teacherReportsLoading}
                  className="w-full h-[42px] shadow-sm"
                >
                  {teacherReportsLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      {t('staff.reports.fetchReports')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Reports List */}
          {teacherReports.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-purple-600" />
                  {t('staff.reports.teacherReportsList')} ({teacherReports.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {t('staff.reports.reportDate')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {t('staff.reports.student')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {t('staff.reports.teacher')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {t('staff.reports.attendanceRate')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {teacherReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(report.reportDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.student.name}
                          </div>
                          <div className="text-xs text-gray-500">{report.student.email}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.teacher.name}
                          </div>
                          <div className="text-sm text-gray-500">{report.teacher.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAttendanceRateColor(report.attendanceRate || 0)}`}>
                            {report.attendanceRate || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewReportDetail(report)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            {t('common.view')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {teacherReports.length === 0 && !teacherReportsLoading && selectedClass && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('staff.reports.noReports')}
              </h3>
              <p className="text-gray-500">{t('staff.reports.noReportsDesc')}</p>
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
        <div className="space-y-6">
          {/* Report Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-purple-600" />
              {t('staff.reports.filters')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('staff.class.className')}
                </label>
                <select
                  value={selectedClass || ''}
                  onChange={(e) => setSelectedClass(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-[42px]"
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
                  {t('staff.reports.status')}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-[42px]"
                >
                  <option value="">{t('staff.reports.allStatus')}</option>
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Button
                  variant="primary"
                  onClick={handleFetchStudentReports}
                  disabled={studentReportsLoading}
                  className="w-full h-[42px] shadow-sm"
                >
                  {studentReportsLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      {t('staff.reports.fetchReports')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Student Reports List */}
          {studentReports.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  {t('staff.reports.studentReportsList')} ({studentReports.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {t('staff.reports.createdAt')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {t('staff.reports.student')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {t('staff.reports.type')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {t('staff.reports.subject')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {t('staff.reports.status')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {studentReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.student?.name || '-'}
                          </div>
                          <div className="text-xs text-gray-500">{report.student?.email || '-'}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                            report.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                            report.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.reportType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {report.subject}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            report.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleViewStudentReport(report)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              {t('common.view')}
                            </Button>
                            {report.status !== 'RESOLVED' && report.status !== 'CLOSED' && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleResolveReport(report.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {t('staff.reports.resolve')}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {studentReports.length === 0 && !studentReportsLoading && selectedClass && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('staff.reports.noReports')}
              </h3>
              <p className="text-gray-500">{t('staff.reports.noStudentReportsDesc')}</p>
            </div>
          )}
        </div>
      )}

      {/* Student Report Detail Modal */}
      {showStudentReportModal && selectedStudentReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                {t('staff.reports.studentFeedback')}
              </h2>
              <button
                onClick={() => {
                  setShowStudentReportModal(false);
                  setSelectedStudentReport(null);
                  setResponseText('');
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Student Info */}
              {selectedStudentReport.student && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {t('staff.reports.from')}
                  </h4>
                  <p className="text-sm font-medium text-blue-800">{selectedStudentReport.student.name}</p>
                  <p className="text-xs text-blue-600 mt-1">{selectedStudentReport.student.email}</p>
                </div>
              )}

              {/* Report Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{t('staff.reports.type')}: {selectedStudentReport.reportType}</h4>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">{selectedStudentReport.subject}</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedStudentReport.content}</p>
                </div>
              </div>

              {/* Response Section */}
              {selectedStudentReport.response ? (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    {t('staff.reports.previousResponse')}
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedStudentReport.response}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('staff.reports.yourResponse')}</h4>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder={t('staff.reports.responsePlaceholder')}
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="primary"
                      onClick={handleRespondToReport}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {t('staff.reports.sendResponse')}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                <span>{t('staff.reports.createdAt')}: {new Date(selectedStudentReport.createdAt).toLocaleString()}</span>
                <span className={`px-2 py-1 rounded ${
                  selectedStudentReport.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  selectedStudentReport.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedStudentReport.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {showReportDetailModal && selectedReportDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-600" />
                {t('staff.reports.reportDetail')}
              </h2>
              <button
                onClick={() => {
                  setShowReportDetailModal(false);
                  setSelectedReportDetail(null);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Student & Teacher Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {t('staff.reports.student')}
                  </h4>
                  <p className="text-sm font-medium text-blue-800">{selectedReportDetail.student.name}</p>
                  <p className="text-xs text-blue-600 mt-1">{selectedReportDetail.student.email}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    {t('staff.reports.teacher')}
                  </h4>
                  <p className="text-sm font-medium text-green-800">{selectedReportDetail.teacher.name}</p>
                  <p className="text-xs text-green-600 mt-1">{selectedReportDetail.teacher.email}</p>
                </div>
              </div>

              {/* Report Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">{t('staff.reports.progress')}</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700">{selectedReportDetail.progress || '-'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">{t('staff.reports.strengths')}</h4>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-gray-700">{selectedReportDetail.strengths || '-'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">{t('staff.reports.weaknesses')}</h4>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-gray-700">{selectedReportDetail.weaknesses || '-'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">{t('staff.reports.recommendations')}</h4>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-700">{selectedReportDetail.recommendations || '-'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                <span>{t('staff.reports.reportDate')}: {new Date(selectedReportDetail.reportDate).toLocaleDateString()}</span>
                <span>{t('staff.reports.lastUpdated')}: {new Date(selectedReportDetail.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default StaffReports;
