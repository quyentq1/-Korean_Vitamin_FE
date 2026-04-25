import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  UserPlus,
  Download,
  MoreVertical,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageContainer } from '../../components/ui/PageContainer';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Loading } from '../../components/ui/Loading';
import CreateClassModal from '../../components/Staff/CreateClassModal';
import staffService from '../../services/staffService';
import educationManagerService from '../../services/educationManagerService';
import Swal from 'sweetalert2';
import courseService from '../../services/courseService';

const ClassManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isManager = user?.role === 'EDUCATION_MANAGER';

  const ts = (key, fallback) => {
    const result = t(key);
    return result && typeof result === 'string' && result.trim() ? result : fallback;
  };

  const [view, setView] = useState('list');
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortField, setSortField] = useState('className');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [classTeachers, setClassTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [courses, setCourses] = useState([]);

  const [newClass, setNewClass] = useState({
    courseId: '',
    classCode: '',
    className: '',
    capacity: 30,
    startDate: '',
    endDate: '',
    room: '',
  });
  const [newSchedule, setNewSchedule] = useState({
    lessonNumber: '',
    topic: '',
    date: '',
    startTime: '',
    endTime: '',
    room: '',
  });
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchCourses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = isManager
        ? await educationManagerService.getAllClasses()
        : await staffService.getClasses();

      let classesData = [];
      if (response?.classes) {
        classesData = response.classes;
      } else if (response?.data?.classes) {
        classesData = response.data.classes;
      } else if (response?.content) {
        classesData = response.content;
      } else if (Array.isArray(response)) {
        classesData = response;
      } else if (Array.isArray(response?.data)) {
        classesData = response.data;
      }

      setClasses(classesData);
      setFilteredClasses(classesData);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError(t('classManagement.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = isManager
        ? await educationManagerService.getAllCourses()
        : await staffService.getCourses();

      let coursesData = [];
      if (Array.isArray(response)) {
        coursesData = response;
      } else if (response?.data) {
        coursesData = Array.isArray(response.data) ? response.data : [];
      } else if (response?.courses) {
        coursesData = response.courses;
      }

      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    let filtered = [...classes];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cls =>
        cls.className?.toLowerCase().includes(term) ||
        cls.classCode?.toLowerCase().includes(term) ||
        cls.courseName?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(cls => cls.status === statusFilter);
    }

    if (courseFilter !== 'all') {
      filtered = filtered.filter(cls => cls.courseId === courseFilter);
    }

    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredClasses(filtered);
    setCurrentPage(1);
  }, [classes, searchTerm, statusFilter, courseFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await staffService.createClass(newClass);
      setAlert({ show: true, type: 'success', message: t('classManagement.createClassSuccess') });
      setIsCreateModalOpen(false);
      setNewClass({
        courseId: '',
        classCode: '',
        className: '',
        capacity: 30,
        startDate: '',
        endDate: '',
        room: '',
      });
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      setAlert({ show: true, type: 'error', message: t('classManagement.createClassError') });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDetail = (cls) => {
    const path = isManager ? `/edu-manager/classes/${cls.id}` : `/classes/${cls.id}`;
    navigate(path);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const studentId = e.target.studentId.value;
    try {
      const service = isManager ? educationManagerService : staffService;
      await service.addStudentToClass(selectedClass.id, { studentId: Number(studentId) });
      setAlert({ show: true, type: 'success', message: t('classManagement.addStudentSuccess') });
      const students = await service.getClassStudents(selectedClass.id);
      setClassStudents(students || []);
      e.target.reset();
    } catch (error) {
      console.error('Error adding student:', error);
      setAlert({ show: true, type: 'error', message: t('classManagement.addStudentError') });
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    const teacherId = e.target.teacherId.value;
    const isPrimary = e.target.isPrimary.checked;
    try {
      const service = isManager ? educationManagerService : staffService;
      await service.assignTeacherToClass(selectedClass.id, teacherId, isPrimary);
      setAlert({ show: true, type: 'success', message: t('classManagement.assignTeacherSuccess') });
      const teachers = await service.getClassTeachers(selectedClass.id);
      setClassTeachers(teachers || []);
      e.target.reset();
    } catch (error) {
      console.error('Error assigning teacher:', error);
      setAlert({ show: true, type: 'error', message: t('classManagement.assignTeacherError') });
    }
  };

  const handleOpenSchedule = async (cls) => {
    setSelectedClass(cls);
    setIsScheduleModalOpen(true);
    try {
      const data = await staffService.getSchedules(cls.id);
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await staffService.createSchedule(selectedClass.id, newSchedule);
      setAlert({ show: true, type: 'success', message: t('classManagement.createScheduleSuccess') });
      setIsScheduleModalOpen(false);
      setNewSchedule({
        lessonNumber: '',
        topic: '',
        date: '',
        startTime: '',
        endTime: '',
        room: '',
      });
    } catch (error) {
      console.error('Error creating schedule:', error);
      setAlert({ show: true, type: 'error', message: t('classManagement.createScheduleError') });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAttendance = async (schedule) => {
    setSelectedSchedule(schedule);
    setIsAttendanceModalOpen(true);
    try {
      const atts = await staffService.getAttendanceForSchedule(schedule.id);
      if (atts && atts.length > 0) {
        setAttendanceList(atts.map(a => ({
          studentId: a.studentId,
          studentName: a.studentName,
          status: a.status,
          id: a.id
        })));
      } else {
        const students = await staffService.getClassStudents(selectedClass.id);
        setAttendanceList((students || []).map(s => ({
          studentId: s.id,
          studentName: s.fullName,
          status: 'ABSENT',
          id: null
        })));
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceList([]);
    }
  };

  const handleSaveAttendance = async () => {
    setActionLoading(true);
    try {
      const payload = attendanceList.map(a => ({
        id: a.id,
        studentId: a.studentId,
        status: a.status
      }));
      await staffService.markAttendance(selectedSchedule.id, payload);
      setAlert({ show: true, type: 'success', message: t('classManagement.saveAttendanceSuccess') });
      setIsAttendanceModalOpen(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setAlert({ show: true, type: 'error', message: t('classManagement.saveAttendanceError') });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    const result = await Swal.fire({
      icon: 'question',
      title: t('staff.classManagement.confirmDelete'),
      text: t('classManagement.deleteScheduleConfirmation'),
      showCancelButton: true,
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel'),
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    setActionLoading(true);
    try {
      await staffService.deleteSchedule(scheduleId);
      setAlert({ show: true, type: 'success', message: t('classManagement.deleteScheduleSuccess') });

      if (selectedClass) {
        handleOpenSchedule(selectedClass);
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setAlert({ show: true, type: 'error', message: t('classManagement.deleteScheduleError') });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClass = async (cls) => {
    const result = await Swal.fire({
      icon: 'question',
      title: t('staff.classManagement.confirmDelete'),
      text: t('classManagement.deleteConfirmation', { name: cls.className }),
      showCancelButton: true,
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel'),
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await staffService.deleteClass(cls.id);
        setAlert({ show: true, type: 'success', message: t('classManagement.deleteSuccess') });
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        setAlert({ show: true, type: 'error', message: t('classManagement.deleteError') });
      }
    }
  };

  const getStatusLabel = (status) => {
    const statusConfig = {
      'PLANNED': t('staff.classManagement.statusPlanned'),
      'ONGOING': t('staff.classManagement.statusOngoing'),
      'ACTIVE': t('staff.classManagement.statusOngoing'),
      'INACTIVE': t('staff.classManagement.statusInactive'),
      'CANCELLED': t('staff.classManagement.statusCancelled'),
      'COMPLETED': t('staff.classManagement.statusCompleted')
    };
    return statusConfig[status] || status;
  };

  const getStatusVariant = (status) => {
    const variantConfig = {
      'PLANNED': 'info',
      'ONGOING': 'success',
      'ACTIVE': 'success',
      'INACTIVE': 'warning',
      'CANCELLED': 'error',
      'COMPLETED': 'neutral'
    };
    return variantConfig[status] || 'neutral';
  };

  const columns = useMemo(() => [
    {
      key: 'className',
      label: ts('classManagement.className', 'Class Name'),
      render: (cls) => (
        <div className="flex items-center space-x-3">
          <span className="font-medium text-gray-900">{cls.className}</span>
          <span className="text-sm text-gray-500">({cls.classCode})</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'courseName',
      label: ts('classManagement.course', 'Course'),
      render: (cls) => (
        <span className="text-gray-600">
          {cls.courseName || cls.course?.name || <span className="text-gray-400 italic">{t('staff.classManagement.noCourse')}</span>}
        </span>
      ),
      sortable: true
    },
    {
      key: 'teacherName',
      label: ts('classManagement.teacher', 'Teacher'),
      render: (cls) => {
        let teacherNames = null;

        if (cls.teacherName) {
          teacherNames = cls.teacherName;
        }
        else if (cls.teachers && cls.teachers.length > 0) {
          teacherNames = cls.teachers
            .map(tc => tc.teacher?.fullName || tc.teacher?.name || tc.fullName || tc.name)
            .filter(name => name)
            .join(', ');
        }
        else if (cls.classEntity && cls.classEntity.teacher) {
          const tc = cls.classEntity.teacher;
          teacherNames = tc.fullName || tc.name;
        }
        else if (cls.teacher) {
          teacherNames = cls.teacher.fullName || cls.teacher.name;
        }

        return (
          <span className="text-gray-600">
            {teacherNames || <span className="text-orange-600 italic">{t('staff.classManagement.noTeacherAssigned')}</span>}
          </span>
        );
      },
      sortable: true
    },
    {
      key: 'studentCount',
      label: ts('classManagement.studentCount', 'Student Count'),
      render: (cls) => {
        const count = cls.currentEnrollment || cls.studentCount || 0;
        return (
          <Badge variant="info">{count}</Badge>
        );
      },
      sortable: true
    },
    {
      key: 'capacity',
      label: ts('classManagement.capacity', 'Capacity'),
      render: (cls) => {
        const currentEnrollment = cls.currentEnrollment || cls.studentCount || 0;
        const capacity = cls.capacity || 30;
        const isFull = currentEnrollment >= capacity;
        const isAlmostFull = currentEnrollment / capacity > 0.8 && !isFull;

        return (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${
              isFull
                ? 'text-red-600'
                : isAlmostFull
                  ? 'text-orange-600'
                  : 'text-green-600'
            }`}>
              {currentEnrollment}/{capacity}
            </span>

            {isFull && (
              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                {t('staff.classManagement.full')}
              </span>
            )}
          </div>
        );
      },
      sortable: true
    },
    {
      key: 'startDate',
      label: ts('classManagement.startDate', 'Start Date'),
      render: (cls) => (
        <span className="text-gray-600">
          {cls.startDate ? new Date(cls.startDate).toLocaleDateString() : '-'}
        </span>
      ),
      sortable: true
    },
    {
      key: 'endDate',
      label: ts('classManagement.endDate', 'End Date'),
      render: (cls) => (
        <span className="text-gray-600">
          {cls.endDate ? new Date(cls.endDate).toLocaleDateString() : '-'}
        </span>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: ts('classManagement.status', 'Status'),
      render: (cls) => {
        return (
          <Badge variant={getStatusVariant(cls.status)}>
            {getStatusLabel(cls.status)}
          </Badge>
        );
      },
      sortable: true
    },
    {
      key: 'actions',
      label: ts('common.actions', 'Actions'),
      render: (cls) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenDetail(cls)}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title={ts('common.view', 'View')}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenSchedule(cls)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={ts('classManagement.schedule', 'Schedule')}
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => isManager ? handleDeleteClass(cls) : null}
            disabled={!isManager}
            className={`p-1.5 rounded-lg transition-colors ${isManager
              ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              : 'text-gray-300 cursor-not-allowed'
              }`}
            title={!isManager ? t('staff.classManagement.managerOnlyDelete') : ts('common.delete', 'Delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      sortable: false
    }
  ], [t]);

  if (loading) {
    return (
      <PageContainer variant="full">
        <Loading />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="full">
        <Alert type="error" message={error} />
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="full">
      {/* Alert */}
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title={t('classManagement.title')}
        subtitle={t('classManagement.subtitle')}
        actions={
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={fetchClasses}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('common.refresh')}
            </Button>
            <Button
              variant="primary"
              onClick={() => isManager ? setIsCreateModalOpen(true) : null}
              disabled={!isManager}
              title={!isManager ? t('staff.classManagement.managerOnlyCreate') : ''}
              className={!isManager ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('classManagement.createClass')}
            </Button>
          </div>
        }
      />

      {/* View Toggle */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setView('list')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${view === 'list'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Users className="w-4 h-4 mr-2" />
            {t('classManagement.listView')}
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${view === 'calendar'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {t('classManagement.calendarView')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('classManagement.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">{t('classManagement.allStatus')}</option>
              <option value="ACTIVE">{t('classManagement.active')}</option>
              <option value="INACTIVE">{t('classManagement.inactive')}</option>
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">{t('classManagement.allCourses')}</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('classManagement.totalClasses')}</p>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('classManagement.activeClasses')}</p>
              <p className="text-2xl font-bold text-green-600">
                {classes.filter(c => c.status === 'ACTIVE' || c.status === 'ONGOING' || c.status === 'PLANNED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('classManagement.inactiveClasses')}</p>
              <p className="text-2xl font-bold text-yellow-600">
                {classes.filter(c => c.status === 'INACTIVE' || c.status === 'CANCELLED' || c.status === 'COMPLETED').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('classManagement.totalStudents')}</p>
              <p className="text-2xl font-bold text-primary-600">
                {classes.reduce((sum, cls) => sum + (cls.currentEnrollment || cls.studentCount || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {paginatedClasses.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('classManagement.noClassesFound')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto lg:overflow-x-visible">
                <table className="w-full min-w-[900px] lg:min-w-0 lg:table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      {columns.map(col => (
                        <th
                          key={col.key}
                          onClick={() => col.sortable && handleSort(col.key)}
                          className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                        >
                          {col.label}
                          {col.sortable && sortField === col.key && (
                            <span className="ml-1">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClasses.map((cls) => (
                      <tr key={cls.id} className="border-t border-gray-200 hover:bg-gray-50">
                        {columns.map(col => (
                          <td key={col.key} className="px-4 py-4">
                            {col.render(cls)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-gray-500">
                    {t('classManagement.showing')} {startIndex + 1} - {Math.min(endIndex, filteredClasses.length)} {t('common.of')} {filteredClasses.length}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      {'←'} {t('common.previous')}
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);

                        if (!showPage) {
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="px-2 text-gray-400">...</span>;
                          }
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {t('common.next')} {'→'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedClasses.map(cls => (
            <div key={cls.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{cls.className}</h3>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={getStatusVariant(cls.status)}
                      className="text-xs font-semibold px-3 py-1.5 shadow-sm"
                    >
                      {getStatusLabel(cls.status)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {cls.startDate} - {cls.endDate}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenDetail(cls)}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {ts('common.view', 'View')}
                  </button>
                  <button
                    onClick={() => handleOpenSchedule(cls)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {ts('classManagement.schedule', 'Schedule')}
                  </button>
                  <button
                    onClick={() => isManager ? handleDeleteClass(cls) : null}
                    disabled={!isManager}
                    className={`flex items-center px-3 py-2 rounded-lg ${isManager
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-300 text-white cursor-not-allowed'
                      }`}
                    title={!isManager ? t('staff.classManagement.managerOnlyDelete') : ''}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {ts('common.delete', 'Delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Card View Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mt-4">
              <div className="text-sm text-gray-500">
                {t('classManagement.showing')} {startIndex + 1} - {Math.min(endIndex, filteredClasses.length)} {t('common.of')} {filteredClasses.length}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  {'←'} {t('common.previous')}
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-gray-400">...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('common.next')} {'→'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Class Modal */}
      {isCreateModalOpen && (
        <CreateClassModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchClasses();
            setAlert({ show: true, type: 'success', message: t('classManagement.createClassSuccess') });
          }}
        />
      )}

      {/* Class Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClass(null);
          setClassStudents([]);
          setClassTeachers([]);
        }}
        title={selectedClass?.className || t('classManagement.classDetails')}
        size="2xl"
      >
        {selectedClass && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl">
                {selectedClass.className?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedClass.className}</h3>
                <p className="text-gray-500">
                  {selectedClass.courseName || selectedClass.course?.name || <span className="text-orange-600">{t('staff.classManagement.noCourse')}</span>}
                </p>
                <Badge
                  variant={getStatusVariant(selectedClass.status)}
                  className="mt-2 text-xs font-semibold px-3 py-1.5 shadow-sm"
                >
                  {getStatusLabel(selectedClass.status)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('classManagement.classCode')}</p>
                  <p className="font-medium">{selectedClass.classCode || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('classManagement.capacity')}</p>
                  <p className="font-medium">{selectedClass.capacity || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('classManagement.duration')}</p>
                  <p className="font-medium">
                    {selectedClass.startDate && selectedClass.endDate
                      ? `${new Date(selectedClass.startDate).toLocaleDateString()} - ${new Date(selectedClass.endDate).toLocaleDateString()}`
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('classManagement.room')}</p>
                  <p className="font-medium">{selectedClass.room || '-'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  {t('classManagement.students')} ({classStudents.length})
                </h4>
              </div>
              {classStudents.length === 0 ? (
                <p className="text-gray-500">{t('classManagement.noStudents')}</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {classStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium block">{student.fullName}</span>
                        <span className="text-sm text-gray-500">{student.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  {t('classManagement.teachers')} ({classTeachers.length})
                </h4>
              </div>
              {classTeachers.length === 0 ? (
                <p className="text-orange-600 italic">{t('staff.classManagement.noTeacherAssigned')}</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {classTeachers.map(teacher => (
                    <div key={teacher.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium block">{teacher.fullName}</span>
                        <span className="text-sm text-gray-500">{teacher.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedClass(null);
                  setClassStudents([]);
                  setClassTeachers([]);
                }}
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedClass(null);
          setSchedules([]);
        }}
        title={`${t('classManagement.schedules')} - ${selectedClass?.className}`}
        size="xl"
      >
        {selectedClass && (
          <div className="space-y-6">
            <div className="space-y-3">
              {schedules.length === 0 ? (
                <p className="text-gray-500 text-center">{t('classManagement.noSchedules')}</p>
              ) : (
                schedules.map(sch => (
                  <div key={sch.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{sch.topic}</h4>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-2" />
                        {sch.date} | {sch.startTime} - {sch.endTime}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        {sch.room || '-'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleOpenAttendance(sch)}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {t('classManagement.attendance')}
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(sch.id)}
                        disabled={actionLoading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Attendance Modal */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setSelectedSchedule(null);
          setAttendanceList([]);
        }}
        title={`${t('classManagement.attendance')} - ${selectedSchedule?.topic}`}
        size="lg"
      >
        {selectedSchedule && (
          <div className="space-y-6">
            {attendanceList.length === 0 ? (
              <p className="text-gray-500 text-center">{t('classManagement.noAttendance')}</p>
            ) : (
              <div className="space-y-3">
                {attendanceList.map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium block">{att.studentName}</span>
                    </div>
                    <select
                      value={att.status}
                      disabled={!isManager}
                      onChange={(e) => {
                        const newStats = [...attendanceList];
                        newStats[idx].status = e.target.value;
                        setAttendanceList(newStats);
                      }}
                      className="border rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      <option value="PRESENT">{t('classManagement.present')}</option>
                      <option value="LATE">{t('classManagement.late')}</option>
                      <option value="ABSENT">{t('classManagement.absent')}</option>
                      <option value="EXCUSED">{t('classManagement.excused')}</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">{t('classManagement.quickActions')}</p>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  disabled={!isManager}
                  title={!isManager ? t('staff.classManagement.managerOnlyAction') : ''}
                  className={!isManager ? 'opacity-50 cursor-not-allowed' : ''}
                  onClick={() => {
                    const newStats = attendanceList.map(a => ({ ...a, status: 'PRESENT' }));
                    setAttendanceList(newStats);
                  }}
                >
                  {t('classManagement.markAllPresent')}
                </Button>
                <Button
                  variant="secondary"
                  disabled={!isManager}
                  title={!isManager ? t('staff.classManagement.managerOnlyAction') : ''}
                  className={!isManager ? 'opacity-50 cursor-not-allowed' : ''}
                  onClick={() => {
                    const newStats = attendanceList.map(a => ({ ...a, status: 'ABSENT' }));
                    setAttendanceList(newStats);
                  }}
                >
                  {t('classManagement.markAllAbsent')}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="primary"
                onClick={handleSaveAttendance}
                disabled={actionLoading || !isManager}
                title={!isManager ? t('staff.classManagement.managerOnlySave') : ''}
                className={!isManager ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {actionLoading ? (
                  <Loading type="spinner" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('classManagement.saveAttendance')}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ClassManagement;
