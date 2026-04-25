import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  Shield,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { PageHeader, Card, Button, Badge, Table, Modal, Alert } from '../../components/ui';
import Swal from 'sweetalert2';

/**
 * TeachersManagement - Advanced Teacher Management for Admin
 * Optimized UI/UX with modern design patterns
 */
const TeachersManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/admin/teachers');
      setTeachers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setError(t('admin.teachers.fetchError', 'Unable to load teacher list'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Filter and sort teachers
  const filteredTeachers = teachers
    .filter(teacher => {
      // Search filter
      const matchesSearch =
        (teacher.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.username || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && teacher.active) ||
        (statusFilter === 'inactive' && !teacher.active);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = (a.fullName || '').localeCompare(b.fullName || '');
      } else if (sortBy === 'email') {
        comparison = (a.email || '').localeCompare(b.email || '');
      } else if (sortBy === 'courses') {
        comparison = (a.assignedCourses || 0) - (b.assignedCourses || 0);
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle view details
  const handleViewDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailModal(true);
  };

  // Handle lock/unlock
  const handleToggleStatus = async (teacher) => {
    const action = teacher.active ? t('admin.teachers.lock', 'lock') : t('admin.teachers.unlock', 'unlock');
    const result = await Swal.fire({
      icon: 'question',
      title: t('admin.teachers.toggleStatusTitle', `${action.charAt(0).toUpperCase() + action.slice(1)} account?`),
      text: t('admin.teachers.toggleStatusText', `Are you sure you want to ${action} ${teacher.fullName}'s account?`),
      showCancelButton: true,
      confirmButtonText: t('common.yes', 'Yes, confirm'),
      cancelButtonText: t('common.cancel', 'Cancel'),
      confirmButtonColor: teacher.active ? '#dc3545' : '#28a745',
    });

    if (result.isConfirmed) {
      try {
        if (teacher.active) {
          await axiosClient.post(`/admin/users/${teacher.id}/lock`, {
            reason: 'Locked by Admin',
            adminId: 1
          });
        } else {
          await axiosClient.post(`/admin/users/${teacher.id}/unlock`);
        }
        await fetchTeachers();
        Swal.fire(t('common.success', 'Success'), t('admin.teachers.toggleStatusSuccess', `Account ${action}ed`), 'success');
      } catch (err) {
        Swal.fire(t('common.error', 'Error'), t('admin.teachers.toggleStatusError', 'Unable to change account status'), 'error');
      }
    }
  };

  // Handle delete
  const handleDelete = async (teacher) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: t('admin.teachers.deleteTitle', 'Delete Teacher?'),
      text: t('admin.teachers.deleteText', `Are you sure you want to delete ${teacher.fullName}? This action cannot be undone.`),
      showCancelButton: true,
      confirmButtonText: t('common.delete', 'Delete'),
      cancelButtonText: t('common.cancel', 'Cancel'),
      confirmButtonColor: '#dc3545',
    });

    if (result.isConfirmed) {
      try {
        await axiosClient.delete(`/admin/users/${teacher.id}`);
        await fetchTeachers();
        Swal.fire(t('common.success', 'Success'), t('admin.teachers.deleteSuccess', 'Teacher deleted'), 'success');
      } catch (err) {
        Swal.fire(t('common.error', 'Error'), t('admin.teachers.deleteError', 'Unable to delete teacher'), 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('admin.teachers.title', 'Teacher Management')}
        subtitle={t('admin.teachers.subtitle', 'Manage teacher information and assignments')}
        icon={<Users className="w-8 h-8" />}
      />

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('admin.teachers.totalTeachers', 'Total Teachers')}</p>
              <p className="text-3xl font-bold mt-1">{teachers.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">{t('admin.teachers.active', 'Active')}</p>
              <p className="text-3xl font-bold mt-1">{teachers.filter(tc => tc.active).length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">{t('admin.teachers.locked', 'Locked Accounts')}</p>
              <p className="text-3xl font-bold mt-1">{teachers.filter(tc => !tc.active).length}</p>
            </div>
            <Lock className="w-12 h-12 text-amber-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">{t('admin.teachers.assigned', 'Assigned')}</p>
              <p className="text-3xl font-bold mt-1">
                {teachers.reduce((sum, tc) => sum + (tc.assignedCourses || 0), 0)}
              </p>
            </div>
            <BookOpen className="w-12 h-12 text-purple-200" />
          </div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('admin.teachers.searchPlaceholder', 'Search teachers...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('admin.teachers.allStatuses', 'All Statuses')}</option>
              <option value="active">{t('admin.teachers.active', 'Active')}</option>
              <option value="inactive">{t('admin.teachers.locked', 'Locked')}</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name-asc">{t('admin.teachers.nameAZ', 'Name A-Z')}</option>
              <option value="name-desc">{t('admin.teachers.nameZA', 'Name Z-A')}</option>
              <option value="courses-desc">{t('admin.teachers.coursesDesc', 'Courses ↓')}</option>
              <option value="courses-asc">{t('admin.teachers.coursesAsc', 'Courses ↑')}</option>
              <option value="createdAt-desc">{t('admin.teachers.newest', 'Newest')}</option>
              <option value="createdAt-asc">{t('admin.teachers.oldest', 'Oldest')}</option>
            </select>

            <Button
              variant="outline"
              onClick={fetchTeachers}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.refresh', 'Refresh')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Teachers Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('admin.teachers.teacher', 'Teacher')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('admin.teachers.contact', 'Contact')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('admin.teachers.courses', 'Courses')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('admin.teachers.status', 'Status')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('admin.teachers.joinDate', 'Join Date')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('admin.teachers.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">{t('admin.teachers.noTeachers', 'No teachers found')}</p>
                    <p className="text-sm">{t('admin.teachers.tryChangeSearch', 'Try changing search criteria')}</p>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {(teacher.fullName || teacher.username || 'T').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{teacher.fullName || teacher.username}</p>
                          <p className="text-sm text-gray-500">@{teacher.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {teacher.email}
                        </div>
                        {teacher.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {teacher.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{teacher.assignedCourses || 0}</span>
                        <span className="text-sm text-gray-500">{t('admin.teachers.courses', 'courses')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        type={teacher.active ? 'success' : 'danger'}
                        className="inline-flex items-center gap-1"
                      >
                        {teacher.active ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            {t('admin.teachers.active', 'Active')}
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            {t('admin.teachers.locked', 'Locked')}
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(teacher)}
                          title={t('admin.teachers.viewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(teacher)}
                          title={teacher.active ? t('admin.teachers.lockAccount', 'Lock Account') : t('admin.teachers.unlockAccount', 'Unlock')}
                          className={teacher.active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {teacher.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(teacher)}
                          title={t('common.delete', 'Delete')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedTeacher && (
        <Modal onClose={() => setShowDetailModal(false)}>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {(selectedTeacher.fullName || selectedTeacher.username || 'T').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedTeacher.fullName || selectedTeacher.username}
                </h3>
                <p className="text-gray-500">@{selectedTeacher.username}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium">{selectedTeacher.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('admin.teachers.phone', 'Phone')}</p>
                  <p className="font-medium">{selectedTeacher.phone || t('common.notSet', 'N/A')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('admin.teachers.courseCount', 'Course Count')}</p>
                  <p className="font-medium">{selectedTeacher.assignedCourses || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('admin.teachers.status', 'Status')}</p>
                  <Badge type={selectedTeacher.active ? 'success' : 'danger'}>
                    {selectedTeacher.active ? t('admin.teachers.active', 'Active') : t('admin.teachers.locked', 'Locked')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('admin.teachers.joinDate', 'Join Date')}</p>
                  <p className="font-medium">
                    {selectedTeacher.createdAt ? new Date(selectedTeacher.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('admin.teachers.lastLogin', 'Last Login')}</p>
                  <p className="font-medium">
                    {selectedTeacher.lastLogin ? new Date(selectedTeacher.lastLogin).toLocaleString('vi-VN') : t('admin.teachers.neverLoggedIn', 'Never logged in')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                {t('common.close', 'Close')}
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  navigate(`/admin/teachers/${selectedTeacher.id}`);
                }}
              >
                {t('common.edit', 'Edit')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeachersManagement;
