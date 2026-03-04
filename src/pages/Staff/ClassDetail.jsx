import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  CheckCircle,
  BookOpen,
  Info,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  Plus,
  Trash2,
  Search,
  Filter,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageContainer } from '../../components/ui/PageContainer';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Alert } from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import staffService from '../../services/staffService';
import Swal from 'sweetalert2';

const ClassDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Main States
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Students Tab States
  const [studentSearch, setStudentSearch] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await staffService.getClassDetails(id);
      setClassData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching class details:', err);
      setError(err.response?.data?.message || 'Failed to load class details');
      Swal.fire({
        icon: 'error',
        title: t('staff.class.detail.error.loadFailed'),
        text: err.response?.data?.message || 'Failed to load class details',
        confirmButtonColor: '#667eea'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId, studentName) => {
    const result = await Swal.fire({
      title: t('staff.class.detail.students.removeConfirmTitle'),
      text: t('staff.class.detail.students.removeConfirmText', { name: studentName }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f56565',
      cancelButtonColor: '#667eea',
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    });

    if (result.isConfirmed) {
      try {
        await staffService.removeStudentFromClass(id, studentId);
        Swal.fire({
          icon: 'success',
          title: t('staff.class.detail.students.removeSuccess'),
          timer: 1500,
          showConfirmButton: false
        });
        fetchClassDetails();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: t('staff.class.detail.students.removeFailed'),
          text: err.response?.data?.message || 'Failed to remove student'
        });
      }
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) {
      Swal.fire({
        icon: 'warning',
        title: t('staff.class.detail.students.selectStudent'),
        text: t('staff.class.detail.students.selectStudentRequired')
      });
      return;
    }

    try {
      await staffService.addStudentToClass(id, {
        studentId: selectedStudent,
        enrollmentDate: new Date().toISOString().split('T')[0]
      });
      Swal.fire({
        icon: 'success',
        title: t('staff.class.detail.students.addSuccess'),
        timer: 1500,
        showConfirmButton: false
      });
      setShowAddStudentModal(false);
      setSelectedStudent(null);
      fetchClassDetails();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t('staff.class.detail.students.addFailed'),
        text: err.response?.data?.message || 'Failed to add student'
      });
    }
  };

  // Filter students
  const filteredStudents = classData?.students?.filter(student =>
    student.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearch.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <Loading />
        </div>
      </PageContainer>
    );
  }

  if (error || !classData) {
    return (
      <PageContainer>
        <Alert type="error" message={error || t('staff.class.detail.error.notFound')} />
      </PageContainer>
    );
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED': return 'bg-yellow-100 text-yellow-800';
      case 'ONGOING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get enrollment status color
  const getEnrollmentStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DROPPED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/staff/classes')}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('common.back')}
        </button>

        <PageHeader
          title={classData.className}
          subtitle={classData.classCode}
        />

        <div className="flex flex-wrap gap-4 mt-4">
          <Badge className={getStatusColor(classData.status)}>
            {t(`staff.class.status.${classData.status.toLowerCase()}`)}
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            {classData.courseName}
          </Badge>
          <Badge className="bg-gray-100 text-gray-800">
            {classData.currentEnrollment}/{classData.capacity} {t('staff.class.detail.students')}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: t('staff.class.detail.tabs.overview'), icon: Info },
            { key: 'students', label: t('staff.class.detail.tabs.students'), icon: Users },
            { key: 'attendance', label: t('staff.class.detail.tabs.attendance'), icon: CheckCircle },
            { key: 'schedule', label: t('staff.class.detail.tabs.schedule'), icon: Calendar }
          ].map(tab => (
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

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {t('staff.class.detail.overview.title')}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Course Information */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6">
                <h4 className="text-sm font-semibold text-purple-900 mb-4 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t('staff.class.detail.overview.courseInfo')}
                </h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('staff.class.courseName')}</dt>
                    <dd className="text-sm text-gray-900">{classData.courseName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('staff.class.courseCode')}</dt>
                    <dd className="text-sm text-gray-900">{classData.courseCode}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('staff.class.schedule')}</dt>
                    <dd className="text-sm text-gray-900">{classData.schedule || '-'}</dd>
                  </div>
                </dl>
              </div>

              {/* Schedule Information */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6">
                <h4 className="text-sm font-semibold text-blue-900 mb-4 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('staff.class.detail.overview.scheduleInfo')}
                </h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('staff.class.startDate')}</dt>
                    <dd className="text-sm text-gray-900">
                      {classData.startDate ? new Date(classData.startDate).toLocaleDateString() : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('staff.class.endDate')}</dt>
                    <dd className="text-sm text-gray-900">
                      {classData.endDate ? new Date(classData.endDate).toLocaleDateString() : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('staff.class.room')}</dt>
                    <dd className="text-sm text-gray-900">{classData.room || '-'}</dd>
                  </div>
                </dl>
              </div>

              {/* Teacher Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                <h4 className="text-sm font-semibold text-green-900 mb-4 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {t('staff.class.detail.overview.teacherInfo')}
                </h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('staff.class.teacherName')}</dt>
                    <dd className="text-sm text-gray-900">{classData.teacherName || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('staff.class.teacherEmail')}</dt>
                    <dd className="text-sm text-gray-900">{classData.teacherEmail || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('staff.class.teacherPhone')}</dt>
                    <dd className="text-sm text-gray-900">{classData.teacherPhone || '-'}</dd>
                  </div>
                </dl>
              </div>

              {/* Statistics */}
              {classData.statistics && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6">
                  <h4 className="text-sm font-semibold text-amber-900 mb-4 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('staff.class.detail.overview.statistics')}
                  </h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">{t('staff.class.detail.overview.totalStudents')}</dt>
                      <dd className="text-sm font-semibold text-gray-900">{classData.statistics.totalStudents}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">{t('staff.class.detail.overview.activeStudents')}</dt>
                      <dd className="text-sm font-semibold text-green-600">{classData.statistics.activeStudents}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">{t('staff.class.detail.overview.completedLessons')}</dt>
                      <dd className="text-sm font-semibold text-blue-600">
                        {classData.statistics.completedLessons}/{classData.statistics.totalLessons}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">{t('staff.class.detail.overview.upcomingLessons')}</dt>
                      <dd className="text-sm font-semibold text-purple-600">{classData.statistics.upcomingLessons}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('staff.class.detail.students.title')} ({filteredStudents.length})
              </h3>
              <Button
                variant="primary"
                onClick={() => setShowAddStudentModal(true)}
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('staff.class.detail.students.addStudent')}
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder={t('staff.class.detail.students.searchPlaceholder')}
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Students List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('staff.class.detail.students.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('staff.class.detail.students.email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('staff.class.detail.students.phone')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('staff.class.detail.students.enrollmentDate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('staff.class.detail.students.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        {t('staff.class.detail.students.noStudents')}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                              {student.studentName.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getEnrollmentStatusColor(student.status)}>
                            {t(`staff.class.detail.students.status.${student.status.toLowerCase()}`)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleRemoveStudent(student.studentId, student.studentName)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('staff.class.detail.attendance.title')}
              </h3>
              <Button
                variant="primary"
                onClick={() => navigate(`/classes/${id}/attendance`)}
                className="flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('staff.class.detail.attendance.viewFullAttendance')}
              </Button>
            </div>

            {/* Attendance Statistics Preview */}
            {classData.statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{t('staff.attendance.average')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {classData.statistics.averageAttendanceRate?.toFixed(1) || 0}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{t('staff.attendance.completedLessons')}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {classData.statistics.completedLessons}/{classData.statistics.totalLessons}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{t('staff.class.detail.overview.totalStudents')}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {classData.statistics.totalStudents}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{t('staff.class.detail.overview.upcomingLessons')}</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {classData.statistics.upcomingLessons}
                  </p>
                </div>
              </div>
            )}

            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">{t('staff.attendance.selectSchedule')}</p>
              <Button
                variant="primary"
                onClick={() => navigate(`/classes/${id}/attendance`)}
                className="inline-flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('staff.class.detail.attendance.viewFullAttendance')}
              </Button>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {t('staff.class.detail.schedule.title')}
            </h3>
            {classData.schedules && classData.schedules.length > 0 ? (
              <div className="space-y-4">
                {classData.schedules.map((schedule) => (
                  <div
                    key={schedule.scheduleId}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                          {schedule.lessonNumber}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {t('staff.class.detail.schedule.lesson')} {schedule.lessonNumber}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(schedule.lessonDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                        <p className="text-sm text-gray-500">{schedule.topic || '-'}</p>
                      </div>
                      <Badge className={
                        schedule.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        schedule.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {t(`staff.class.detail.schedule.status.${schedule.status.toLowerCase()}`)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">{t('staff.class.detail.schedule.noSchedule')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddStudentModal}
        onClose={() => {
          setShowAddStudentModal(false);
          setSelectedStudent(null);
        }}
        title={t('staff.class.detail.students.addStudent')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('staff.class.detail.students.selectStudent')}
            </label>
            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">{t('staff.class.detail.students.chooseStudent')}</option>
              {availableStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.fullName} - {student.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddStudentModal(false);
                setSelectedStudent(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleAddStudent}>
              {t('common.add')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ClassDetail;
