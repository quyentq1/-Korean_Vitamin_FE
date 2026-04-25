import { useState, useEffect } from 'react';
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
  AlertCircle,
  Edit,
  UserPlus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageContainer } from '../../components/ui/PageContainer';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Alert } from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import EditClassModal from '../../components/Staff/EditClassModal';
import AssignTeacherModal from '../../components/Staff/AssignTeacherModal';
import DeleteClassModal from '../../components/Staff/DeleteClassModal';
import AddScheduleModal from '../../components/Staff/AddScheduleModal';
import EditScheduleModal from '../../components/Staff/EditScheduleModal';
import staffService from '../../services/staffService';
import educationManagerService from '../../services/educationManagerService';
import classService from '../../services/classService';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

const ClassDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const hasTeacher = classData?.teacherName != null && classData?.teacherName !== '-' && classData.teacherName !== '-';
  const hasStudents = classData?.students && classData.students.length > 0;
  const canViewAttendance = hasTeacher && hasStudents;

  const isManager = user?.role === 'EDUCATION_MANAGER';
  const isTeacher = user?.role === 'TEACHER';

  const [studentSearch, setStudentSearch] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classAvailability, setClassAvailability] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [selectedScheduleToEdit, setSelectedScheduleToEdit] = useState(null);

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  useEffect(() => {
    if (showAddStudentModal) {
      fetchAvailableStudents();
      checkClassAvailability();
    }
  }, [showAddStudentModal]);

  const fetchAvailableStudents = async () => {
    try {
      const response = isManager
        ? await educationManagerService.getAvailableStudents()
        : await staffService.getStudents();

      const enrolledStudentIds = classData?.students?.map(s => s.studentId) || [];
      const available = isManager
        ? response
        : response.filter(student => !enrolledStudentIds.includes(student.id));

      setAvailableStudents(available);
    } catch (err) {
      console.error('Error fetching available students:', err);
    }
  };

  const checkClassAvailability = async () => {
    try {
      const service = isManager ? educationManagerService : staffService;
      const data = await service.checkClassAvailability(id);
      setClassAvailability(data);
    } catch (err) {
      console.error('Error checking class availability:', err);
      setClassAvailability(null);
    }
  };

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = isManager
        ? await educationManagerService.getClassDetails(id)
        : await staffService.getClassDetails(id);
      setClassData(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching class details:', err);
      setError(err.message || 'Failed to load class details');
      Swal.fire({
        icon: 'error',
        title: t('staff.class.detail.error.loadFailed'),
        text: err.message || 'Failed to load class details',
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
        const service = isManager ? educationManagerService : staffService;
        await service.removeStudentFromClass(id, studentId);
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
      const service = isManager ? educationManagerService : staffService;
      await service.addStudentToClass(id, {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED': return 'bg-yellow-100 text-yellow-800';
      case 'ONGOING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnrollmentStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DROPPED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnrollmentStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return t('staff.classDetail.enrollmentActive');
      case 'DROPPED': return t('staff.classDetail.enrollmentDropped');
      case 'COMPLETED': return t('staff.classDetail.enrollmentCompleted');
      default: return status || t('staff.classDetail.enrollmentActive');
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/class-management')}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('common.back')}
        </button>

        <PageHeader
          title={classData.className}
          subtitle={classData.classCode}
          actions={
            <div className="flex gap-2">
              <Button
                variant="ghost"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => isManager ? setShowDeleteModal(true) : null}
                disabled={!isManager}
                title={!isManager ? t('staff.classDetail.managerOnlyDelete') : ''}
                className={isManager ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-gray-400 cursor-not-allowed"}
              >
                {t('common.delete')}
              </Button>
              <Button
                variant="primary"
                icon={<Edit className="w-4 h-4" />}
                onClick={() => isManager ? setShowEditModal(true) : null}
                disabled={!isManager}
                title={!isManager ? t('staff.classDetail.managerOnlyEdit') : ''}
                className={!isManager ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {t('common.edit')}
              </Button>
            </div>
          }
        />

        <div className="flex flex-wrap gap-4 mt-4">
          <Badge className={getStatusColor(classData.status)}>
            {t(`staff.class.status.${classData.status.toLowerCase()}`)}
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            {classData.courseName}
          </Badge>
          <Badge className="bg-gray-100 text-gray-800">
            {classData.currentEnrollment}/{classData.capacity} {t('staff.class.students')}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: t('staff.class.detail.tabs.overview'), icon: Info },
            { key: 'students', label: t('staff.class.detail.tabs.students'), icon: Users },
            { key: 'attendance', label: t('staff.class.detail.tabs.attendance'), icon: CheckCircle, disabled: !canViewAttendance },
            { key: 'schedule', label: t('staff.class.detail.tabs.schedule'), icon: Calendar }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === 'attendance' && !canViewAttendance) {
                  Swal.fire({
                    icon: 'info',
                    title: t('staff.classDetail.cannotViewAttendance'),
                    text: !hasTeacher ? t('staff.classDetail.noTeacher') : t('staff.classDetail.noStudents'),
                    confirmButtonColor: '#667eea'
                  });
                } else {
                  setActiveTab(tab.key);
                }
              }}
              disabled={tab.disabled}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${
                tab.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
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
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-green-900 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {t('staff.class.detail.overview.teacherInfo')}
                  </h4>
                  {isManager && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<UserPlus className="w-4 h-4" />}
                      onClick={() => setShowAssignTeacherModal(true)}
                    >
                      {classData?.teacherName && classData.teacherName !== '-'
                        ? t('class.assignTeacher.changeButton', 'Change Teacher')
                        : t('class.assignTeacher.button', 'Assign Teacher')}
                    </Button>
                  )}
                </div>
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
              {isManager && (
                <Button
                  variant="primary"
                  onClick={() => setShowAddStudentModal(true)}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('staff.class.detail.students.addStudent')}
                </Button>
              )}
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
                            {getEnrollmentStatusLabel(student.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {isManager ? (
                            <button
                              onClick={() => handleRemoveStudent(student.studentId, student.studentName)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title={t('staff.class.detail.students.remove')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-gray-300">
                              <Trash2 className="w-4 h-4" />
                            </span>
                          )}
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
            {!canViewAttendance ? (
              <div className="text-center py-16">
                <CheckCircle className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  {t('staff.classDetail.cannotViewAttendance')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {!hasTeacher && !hasStudents
                    ? t('staff.classDetail.noTeacherAndStudents')
                    : !hasTeacher
                      ? t('staff.classDetail.noTeacher')
                      : t('staff.classDetail.noStudents')}
                </p>
                <div className="flex items-center justify-center gap-6 text-sm">
                  {!hasTeacher && (
                    <div className="flex items-center text-gray-500">
                      <User className="w-5 h-5 mr-2" />
                      <span>{t('staff.classDetail.noTeacherAssigned')}</span>
                    </div>
                  )}
                  {!hasStudents && (
                    <div className="flex items-center text-gray-500">
                      <Users className="w-5 h-5 mr-2" />
                      <span>{t('staff.classDetail.noStudentsYet')}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('staff.class.detail.attendance.title')}
                  </h3>
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
                  <p className="text-sm text-gray-600">{t('staff.attendance.completedLessons', 'Buổi đã hoàn thành')}</p>
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
              <p className="text-gray-500 mb-4">
                {isTeacher
                  ? t('staff.attendance.selectSchedule')
                  : t('staff.classDetail.selectScheduleToView')}
              </p>
            </div>
              </>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('staff.class.detail.schedule.title')}
              </h3>
              {isManager && (
                <Button
                  variant="primary"
                  onClick={() => setShowAddScheduleModal(true)}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('staff.class.detail.schedule.addSchedule', 'Add Schedule')}
                </Button>
              )}
            </div>
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
                        {t(`staff.class.detail.schedule.status.${schedule.status.toLowerCase()}`, schedule.status === 'COMPLETED' ? 'Completed' : schedule.status === 'SCHEDULED' ? 'Scheduled' : schedule.status)}
                      </Badge>
                      {isManager && (
                        <button
                          onClick={() => {
                            setSelectedScheduleToEdit(schedule);
                            setShowEditScheduleModal(true);
                          }}
                          className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('staff.classDetail.editSchedule')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
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
          setClassAvailability(null);
        }}
        title={t('staff.class.detail.students.addStudent')}
      >
        <div className="space-y-4">
          {/* Class Availability Info */}
          {classAvailability && (
            <div className={`p-4 rounded-lg border ${
              !classAvailability.canEnroll
                ? 'bg-red-50 border-red-200'
                : classAvailability.isFull
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {!classAvailability.canEnroll ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : classAvailability.isFull ? (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {!classAvailability.canEnroll
                      ? (classAvailability.isExpired ? t('staff.classDetail.classExpired') : t('staff.classDetail.cannotAddStudent'))
                      : classAvailability.isFull
                        ? t('staff.classDetail.classFull')
                        : t('staff.classDetail.canAddStudent')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('staff.classDetail.capacityLabel')}: <strong>{classAvailability.currentEnrollment}/{classAvailability.capacity}</strong>
                    {classAvailability.availableSlots > 0 && (
                      <span> ({t('staff.classDetail.remaining')}: {classAvailability.availableSlots})</span>
                    )}
                    {classAvailability.isExpired && classAvailability.endDate && (
                      <span className="ml-2 text-red-600">
                        - {t('staff.classDetail.expiredOn')} {new Date(classAvailability.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('staff.class.detail.students.selectStudent')}
            </label>
            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(Number(e.target.value))}
              disabled={!classAvailability?.canEnroll}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                !classAvailability?.canEnroll
                  ? 'bg-gray-100 cursor-not-allowed opacity-60'
                  : 'border-gray-300'
              }`}
            >
              <option value="">{t('staff.class.detail.students.chooseStudent')}</option>
              {availableStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.fullName} - {student.email}
                </option>
              ))}
            </select>
            {!classAvailability?.canEnroll && classAvailability && (
              <p className="mt-2 text-sm text-red-600">
                {classAvailability.isExpired
                  ? t('staff.classDetail.cannotAddExpired')
                  : t('staff.classDetail.classMaxReached')}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddStudentModal(false);
                setSelectedStudent(null);
                setClassAvailability(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleAddStudent}
              disabled={!classAvailability?.canEnroll || !selectedStudent}
              className={!classAvailability?.canEnroll ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {t('common.add', 'Add')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Class Modal */}
      {showEditModal && (
        <EditClassModal
          classData={classData}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchClassDetails();
            Swal.fire({
              icon: 'success',
              title: t('class.edit.success', 'Update successful'),
              timer: 1500,
              showConfirmButton: false
            });
          }}
        />
      )}

      {/* Assign Teacher Modal */}
      {showAssignTeacherModal && classData && (
        <AssignTeacherModal
          classId={id}
          currentTeachers={classData.teachers || []}
          userRole={user?.role}
          onClose={() => setShowAssignTeacherModal(false)}
          onSuccess={() => {
            setShowAssignTeacherModal(false);
            const hasTeacher = classData?.teacherName && classData.teacherName !== '-';
            fetchClassDetails();
            Swal.fire({
              icon: 'success',
              title: hasTeacher
                ? t('class.assignTeacher.changeSuccess', 'Teacher changed successfully')
                : t('class.assignTeacher.success', 'Teacher assigned successfully'),
              timer: 1500,
              showConfirmButton: false
            });
          }}
          onRemoveTeacher={() => {
            fetchClassDetails();
          }}
        />
      )}

      {/* Delete Class Modal */}
      {showDeleteModal && classData && (
        <DeleteClassModal
          classData={classData}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => {
            setShowDeleteModal(false);
            navigate('/staff/class-management');
          }}
        />
      )}

      {/* Add Schedule Modal */}
      {showAddScheduleModal && (
        <AddScheduleModal
          classId={id}
          classStartDate={classData?.startDate}
          classEndDate={classData?.endDate}
          onClose={() => setShowAddScheduleModal(false)}
          onSuccess={() => {
            setShowAddScheduleModal(false);
            fetchClassDetails();
          }}
        />
      )}

      {/* Edit Schedule Modal */}
      {showEditScheduleModal && selectedScheduleToEdit && (
        <EditScheduleModal
          classId={id}
          classStartDate={classData?.startDate}
          classEndDate={classData?.endDate}
          schedule={selectedScheduleToEdit}
          onClose={() => {
            setShowEditScheduleModal(false);
            setSelectedScheduleToEdit(null);
          }}
          onSuccess={() => {
            setShowEditScheduleModal(false);
            setSelectedScheduleToEdit(null);
            fetchClassDetails();
          }}
        />
      )}
    </PageContainer>
  );
};

export default ClassDetail;
