import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  MoreVertical,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import PageContainer from '../../components/ui/PageContainer';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Loading } from '../../components/ui/Loading';
import { userService } from '../../services/userService';

const StudentManagement = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [studentToView, setStudentToView] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  const [courses, setCourses] = useState([]);

  // Fetch students and courses
  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsersByRole('STUDENT');
      setStudents(response.data || []);
      setFilteredStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(t('error.fetchStudents'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/public/courses');
      const data = await response.json();
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Filter and sort students
  useEffect(() => {
    let filtered = [...students];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term) ||
        student.phone?.toLowerCase().includes(term) ||
        student.studentCode?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student =>
        student.status === statusFilter
      );
    }

    // Apply course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(student =>
        student.courseId === courseFilter
      );
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

    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [students, searchTerm, statusFilter, courseFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handle selection
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(paginatedStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId, checked) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  // Handle delete
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.deleteUser(studentToDelete.id);
      setAlert({ show: true, type: 'success', message: t('studentManagement.deleteSuccess') });
      setShowDeleteModal(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      setAlert({ show: true, type: 'error', message: t('studentManagement.deleteError') });
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    try {
      if (action === 'delete') {
        await Promise.all(selectedStudents.map(id => userService.deleteUser(id)));
        setAlert({ show: true, type: 'success', message: t('studentManagement.bulkDeleteSuccess') });
      } else if (action === 'activate') {
        await Promise.all(selectedStudents.map(id => userService.updateUserStatus(id, 'ACTIVE')));
        setAlert({ show: true, type: 'success', message: t('studentManagement.bulkActivateSuccess') });
      } else if (action === 'deactivate') {
        await Promise.all(selectedStudents.map(id => userService.updateUserStatus(id, 'INACTIVE')));
        setAlert({ show: true, type: 'success', message: t('studentManagement.bulkDeactivateSuccess') });
      }
      setShowBulkActionModal(false);
      setSelectedStudents([]);
      fetchStudents();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setAlert({ show: true, type: 'error', message: t('studentManagement.bulkActionError') });
    }
  };

  // Handle export
  const handleExport = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Student Code', 'Course', 'Status', 'Registration Date'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(student => [
        student.id,
        student.name,
        student.email,
        student.phone,
        student.studentCode,
        student.courseName,
        student.status,
        student.registrationDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Table columns
  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
      render: (student) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(student.id)}
          onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
      sortable: false
    },
    {
      key: 'studentCode',
      label: t('studentManagement.studentCode'),
      render: (student) => (
        <span className="font-medium text-gray-900">{student.studentCode || '-'}</span>
      ),
      sortable: true
    },
    {
      key: 'name',
      label: t('studentManagement.name'),
      render: (student) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
            {student.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{student.name}</div>
            <div className="text-sm text-gray-500">{student.email}</div>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'phone',
      label: t('studentManagement.phone'),
      render: (student) => (
        <span className="text-gray-600">{student.phone || '-'}</span>
      ),
      sortable: true
    },
    {
      key: 'courseName',
      label: t('studentManagement.course'),
      render: (student) => (
        <span className="text-gray-600">{student.courseName || '-'}</span>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: t('studentManagement.status'),
      render: (student) => (
        <Badge
          variant={student.status === 'ACTIVE' ? 'success' : 'warning'}
        >
          {student.status === 'ACTIVE' ? t('status.active') : t('status.inactive')}
        </Badge>
      ),
      sortable: true
    },
    {
      key: 'registrationDate',
      label: t('studentManagement.registrationDate'),
      render: (student) => (
        <span className="text-gray-600">
          {student.registrationDate ? new Date(student.registrationDate).toLocaleDateString() : '-'}
        </span>
      ),
      sortable: true
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (student) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setStudentToView(student);
              setShowViewModal(true);
            }}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title={t('common.view')}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(student)}
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
        <PageLoading />
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
        title={t('studentManagement.title')}
        subtitle={t('studentManagement.subtitle')}
        actions={
          <div className="flex items-center space-x-3">
            {selectedStudents.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => setShowBulkActionModal(true)}
              >
                <MoreVertical className="w-4 h-4 mr-2" />
                {t('studentManagement.bulkActions')} ({selectedStudents.length})
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              {t('common.export')}
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('studentManagement.searchPlaceholder')}
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
              <option value="all">{t('studentManagement.allStatus')}</option>
              <option value="ACTIVE">{t('status.active')}</option>
              <option value="INACTIVE">{t('status.inactive')}</option>
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">{t('studentManagement.allCourses')}</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || statusFilter !== 'all' || courseFilter !== 'all') && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-500">{t('studentManagement.activeFilters')}:</span>
            {searchTerm && (
              <Badge variant="info" className="flex items-center">
                {t('studentManagement.search')}: {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 hover:text-gray-900"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="info" className="flex items-center">
                {t('studentManagement.status')}: {statusFilter}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="ml-2 hover:text-gray-900"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {courseFilter !== 'all' && (
              <Badge variant="info" className="flex items-center">
                {t('studentManagement.course')}: {courses.find(c => c.id === courseFilter)?.name}
                <button
                  onClick={() => setCourseFilter('all')}
                  className="ml-2 hover:text-gray-900"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('studentManagement.totalStudents')}</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('studentManagement.activeStudents')}</p>
              <p className="text-2xl font-bold text-green-600">
                {students.filter(s => s.status === 'ACTIVE').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('studentManagement.inactiveStudents')}</p>
              <p className="text-2xl font-bold text-yellow-600">
                {students.filter(s => s.status === 'INACTIVE').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('studentManagement.filteredResults')}</p>
              <p className="text-2xl font-bold text-primary-600">{filteredStudents.length}</p>
            </div>
            <Filter className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {paginatedStudents.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('studentManagement.noStudentsFound')}</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={paginatedStudents}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {t('studentManagement.showing')} {startIndex + 1} - {Math.min(endIndex, filteredStudents.length)} {t('common.of')} {filteredStudents.length}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStudentToDelete(null);
        }}
        title={t('studentManagement.deleteStudent')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {t('studentManagement.deleteConfirmation')} <strong>{studentToDelete?.name}</strong>?
          </p>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setStudentToDelete(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Student Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setStudentToView(null);
        }}
        title={t('studentManagement.studentDetails')}
        size="lg"
      >
        {studentToView && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl">
                {studentToView.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{studentToView.name}</h3>
                <p className="text-gray-500">{studentToView.email}</p>
                <Badge
                  variant={studentToView.status === 'ACTIVE' ? 'success' : 'warning'}
                  className="mt-2"
                >
                  {studentToView.status === 'ACTIVE' ? t('status.active') : t('status.inactive')}
                </Badge>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('studentManagement.studentCode')}</p>
                  <p className="font-medium">{studentToView.studentCode || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('studentManagement.phone')}</p>
                  <p className="font-medium">{studentToView.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('studentManagement.course')}</p>
                  <p className="font-medium">{studentToView.courseName || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('studentManagement.registrationDate')}</p>
                  <p className="font-medium">
                    {studentToView.registrationDate
                      ? new Date(studentToView.registrationDate).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 justify-end pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setStudentToView(null);
                }}
              >
                {t('common.close')}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowViewModal(false);
                  handleDeleteClick(studentToView);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('common.delete')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Action Modal */}
      <Modal
        isOpen={showBulkActionModal}
        onClose={() => {
          setShowBulkActionModal(false);
          setBulkAction(null);
        }}
        title={t('studentManagement.bulkActions')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {t('studentManagement.selectedCount')}: <strong>{selectedStudents.length}</strong>
          </p>
          <div className="space-y-2">
            <Button
              variant="danger"
              onClick={() => {
                setBulkAction('delete');
                handleBulkAction('delete');
              }}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('studentManagement.deleteSelected')}
            </Button>
            <Button
              variant="success"
              onClick={() => {
                setBulkAction('activate');
                handleBulkAction('activate');
              }}
              className="w-full"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              {t('studentManagement.activateSelected')}
            </Button>
            <Button
              variant="warning"
              onClick={() => {
                setBulkAction('deactivate');
                handleBulkAction('deactivate');
              }}
              className="w-full"
            >
              <UserX className="w-4 h-4 mr-2" />
              {t('studentManagement.deactivateSelected')}
            </Button>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setShowBulkActionModal(false);
              setBulkAction(null);
            }}
            className="w-full"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default StudentManagement;
