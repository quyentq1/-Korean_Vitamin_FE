import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Loading } from '../../components/ui/Loading';
import classService from '../../services/classService';
import courseService from '../../services/courseService';

const ClassManagement = () => {
  const { t } = useTranslation();
  
  // Main States
  const [view, setView] = useState('list'); // list | calendar
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortField, setSortField] = useState('className');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal States
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
  
  // Form States
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
  
  // Fetch classes and courses
  useEffect(() => {
    fetchClasses();
    fetchCourses();
  }, []);
  
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.getAllClasses();
      setClasses(response.data || []);
      setFilteredClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError(t('classManagement.fetchError'));
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCourses = async () => {
    try {
      const response = await courseService.getActiveCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  
  // Filter and sort classes
  useEffect(() => {
    let filtered = [...classes];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cls => 
        cls.className?.toLowerCase().includes(term) ||
        cls.classCode?.toLowerCase().includes(term) ||
        cls.courseName?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cls => cls.status === statusFilter);
    }
    
    // Apply course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(cls => cls.courseId === courseFilter);
    }
    
    // Apply sorting
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
  
  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  // Handle create class
  const handleCreateClass = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await classService.createClass(newClass);
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
  
  // Handle open detail modal
  const handleOpenDetail = async (cls) => {
    setSelectedClass(cls);
    setIsDetailModalOpen(true);
    try {
      const [students, teachers] = await Promise.all([
        classService.getStudents(cls.id),
        classService.getTeachers(cls.id),
      ]);
      setClassStudents(students || []);
      setClassTeachers(teachers || []);
    } catch (error) {
      console.error('Error fetching class details:', error);
      setClassStudents([]);
      setClassTeachers([]);
    }
  };
  
  // Handle add student to class
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const studentId = e.target.studentId.value;
    try {
      await classService.addStudent(selectedClass.id, studentId);
      setAlert({ show: true, type: 'success', message: t('classManagement.addStudentSuccess') });
      const students = await classService.getStudents(selectedClass.id);
      setClassStudents(students || []);
      e.target.reset();
    } catch (error) {
      console.error('Error adding student:', error);
      setAlert({ show: true, type: 'error', message: t('classManagement.addStudentError') });
    }
  };
  
  // Handle assign teacher
  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    const teacherId = e.target.teacherId.value;
    const isPrimary = e.target.isPrimary.checked;
    try {
      await classService.assignTeacher(selectedClass.id, teacherId, isPrimary);
      setAlert({ show: true, type: 'success', message: t('classManagement.assignTeacherSuccess') });
      const teachers = await classService.getTeachers(selectedClass.id);
      setClassTeachers(teachers || []);
      e.target.reset();
    } catch (error) {
      console.error('Error assigning teacher:', error);
      setAlert({ show: true, type: 'error', message: t('classManagement.assignTeacherError') });
    }
  };
  
  // Handle open schedule modal
  const handleOpenSchedule = async (cls) => {
    setSelectedClass(cls);
    setIsScheduleModalOpen(true);
    try {
      const data = await classService.getSchedules(cls.id);
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    }
  };
  
  // Handle create schedule
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await classService.createSchedule(selectedClass.id, newSchedule);
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
  
  // Handle open attendance modal
  const handleOpenAttendance = async (schedule) => {
    setSelectedSchedule(schedule);
    setIsAttendanceModalOpen(true);
    try {
      const atts = await classService.getAttendance(schedule.id);
      if (atts && atts.length > 0) {
        setAttendanceList(atts.map(a => ({
          studentId: a.studentId,
          studentName: a.studentName,
          status: a.status,
          id: a.id
        })));
      } else {
        // Auto-init attendance records for all students
        const students = await classService.getStudents(selectedClass.id);
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
  
  // Handle save attendance
  const handleSaveAttendance = async () => {
    setActionLoading(true);
    try {
      const payload = attendanceList.map(a => ({
        id: a.id,
        studentId: a.studentId,
        status: a.status
      }));
      await classService.markAttendance(selectedSchedule.id, payload);
      setAlert({ show: true, type: 'success', message: t('classManagement.saveAttendanceSuccess') });
      setIsAttendanceModalOpen(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setAlert({ show: true, type: 'error', message: t('classManagement.saveAttendanceError') });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle delete class
  const handleDeleteClass = async (cls) => {
    if (window.confirm(t('classManagement.deleteConfirmation') || `Bạn có chắc muốn xóa lớp ${cls.className}?`)) {
      try {
        await classService.deleteClass(cls.id);
        setAlert({ show: true, type: 'success', message: t('classManagement.deleteSuccess') });
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        setAlert({ show: true, type: 'error', message: t('classManagement.deleteError') });
      }
    }
  };
  
  // Table columns
  const columns = [
    {
      key: 'className',
      label: t('classManagement.className'),
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
      label: t('classManagement.course'),
      render: (cls) => (
        <span className="text-gray-600">{cls.courseName || '-'}</span>
      ),
      sortable: true
    },
    {
      key: 'teacherName',
      label: t('classManagement.teacher'),
      render: (cls) => (
        <span className="text-gray-600">{cls.teacherName || '-'}</span>
      ),
      sortable: true
    },
    {
      key: 'studentCount',
      label: t('classManagement.studentCount'),
      render: (cls) => (
        <Badge variant="info">{cls.studentCount || 0}</Badge>
      ),
      sortable: true
    },
    {
      key: 'capacity',
      label: t('classManagement.capacity'),
      render: (cls) => (
        <span className="text-gray-600">{cls.capacity || '-'}</span>
      ),
      sortable: true
    },
    {
      key: 'startDate',
      label: t('classManagement.startDate'),
      render: (cls) => (
        <span className="text-gray-600">
          {cls.startDate ? new Date(cls.startDate).toLocaleDateString() : '-'}
        </span>
      ),
      sortable: true
    },
    {
      key: 'endDate',
      label: t('classManagement.endDate'),
      render: (cls) => (
        <span className="text-gray-600">
          {cls.endDate ? new Date(cls.endDate).toLocaleDateString() : '-'}
        </span>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: t('classManagement.status'),
      render: (cls) => (
        <Badge
          variant={
            cls.status === 'ACTIVE' ? 'success' :
            cls.status === 'INACTIVE' ? 'warning' : 'error'
          }
        >
          {cls.status || '-'}
        </Badge>
      ),
      sortable: true
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (cls) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenDetail(cls)}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title={t('common.view')}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenSchedule(cls)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={t('classManagement.schedule')}
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClass(cls)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={t('common.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      sortable: false
    }
  ];
  
  if (loading) {
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );
  }
  
  if (error) {
    return (
      <PageContainer>
        <Alert type="error" message={error} />
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
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
              onClick={() => setIsCreateModalOpen(true)}
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
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            {t('classManagement.listView')}
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'calendar'
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
                {classes.filter(c => c.status === 'ACTIVE').length}
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
                {classes.filter(c => c.status === 'INACTIVE').length}
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
                {classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)}
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
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {columns.map(col => (
                      <th
                        key={col.key}
                        onClick={() => col.sortable && handleSort(col.key)}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
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
                        <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                          {col.render(cls)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-gray-500">
                    {t('classManagement.showing')} {startIndex + 1} - {Math.min(endIndex, filteredClasses.length)} {t('common.of')} {filteredClasses.length}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      {t('common.previous')}
                    </Button>
                    <span className="px-4 py-2 bg-gray-100 rounded-lg">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {t('common.next')}
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
                      variant={
                        cls.status === 'ACTIVE' ? 'success' :
                        cls.status === 'INACTIVE' ? 'warning' : 'error'
                      }
                    >
                      {cls.status}
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
                    {t('common.view')}
                  </button>
                  <button
                    onClick={() => handleOpenSchedule(cls)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('classManagement.schedule')}
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls)}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create Class Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
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
        }}
        title={t('classManagement.createClass')}
        size="lg"
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classManagement.course')} *
              </label>
              <select
                value={newClass.courseId}
                onChange={(e) => setNewClass({ ...newClass, courseId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">{t('classManagement.selectCourse')}</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classManagement.classCode')} *
              </label>
              <Input
                type="text"
                value={newClass.classCode}
                onChange={(e) => setNewClass({ ...newClass, classCode: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classManagement.className')} *
              </label>
              <Input
                type="text"
                value={newClass.className}
                onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classManagement.capacity')} *
              </label>
              <Input
                type="number"
                value={newClass.capacity}
                onChange={(e) => setNewClass({ ...newClass, capacity: parseInt(e.target.value) })}
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classManagement.startDate')} *
              </label>
              <Input
                type="date"
                value={newClass.startDate}
                onChange={(e) => setNewClass({ ...newClass, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classManagement.endDate')} *
              </label>
              <Input
                type="date"
                value={newClass.endDate}
                onChange={(e) => setNewClass({ ...newClass, endDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classManagement.room')}
              </label>
              <Input
                type="text"
                value={newClass.room}
                onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
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
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loading type="spinner" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('classManagement.createClass')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
      
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
                <p className="text-gray-500">{selectedClass.courseName || '-'}</p>
                <Badge
                  variant={
                    selectedClass.status === 'ACTIVE' ? 'success' :
                    selectedClass.status === 'INACTIVE' ? 'warning' : 'error'
                  }
                  className="mt-2"
                >
                  {selectedClass.status || '-'}
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
                <p className="text-gray-500">{t('classManagement.noTeachers')}</p>
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
                    <button
                      onClick={() => handleOpenAttendance(sch)}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-4"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {t('classManagement.attendance')}
                    </button>
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
                      onChange={(e) => {
                        const newStats = [...attendanceList];
                        newStats[idx].status = e.target.value;
                        setAttendanceList(newStats);
                      }}
                      className="border rounded px-2 py-1 text-sm"
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
                  onClick={() => {
                    const newStats = attendanceList.map(a => ({ ...a, status: 'PRESENT' }));
                    setAttendanceList(newStats);
                  }}
                >
                  {t('classManagement.markAllPresent')}
                </Button>
                <Button
                  variant="secondary"
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
                disabled={actionLoading}
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