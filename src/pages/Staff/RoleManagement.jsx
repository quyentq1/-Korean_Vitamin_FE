import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Check,
  X,
  Search,
  Filter,
  MoreVertical,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageContainer } from '../../components/ui/PageContainer';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Loading } from '../../components/ui/Loading';
import userService from '../../services/userService';

const RoleManagement = () => {
  const { t } = useTranslation();

  // Main States
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleUsers, setRoleUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Form States
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [],
  });

  const [editRole, setEditRole] = useState({
    id: '',
    name: '',
    description: '',
    permissions: [],
  });

  // Available permissions
  const availablePermissions = [
    { id: 'view_tests', name: 'Xem bài kiểm tra', category: 'Tests' },
    { id: 'take_tests', name: 'Làm bài kiểm tra', category: 'Tests' },
    { id: 'create_questions', name: 'Tạo câu hỏi', category: 'Questions' },
    { id: 'edit_questions', name: 'Sửa câu hỏi', category: 'Questions' },
    { id: 'delete_questions', name: 'Xóa câu hỏi', category: 'Questions' },
    { id: 'create_quizzes', name: 'Tạo bài kiểm tra', category: 'Quizzes' },
    { id: 'grade_assignments', name: 'Chấm bài tập', category: 'Grading' },
    { id: 'view_reports', name: 'Xem báo cáo', category: 'Reports' },
    { id: 'manage_classes', name: 'Quản lý lớp học', category: 'Classes' },
    { id: 'manage_students', name: 'Quản lý học viên', category: 'Students' },
    { id: 'assign_roles', name: 'Gán vai trò', category: 'Users' },
    { id: 'import_students', name: 'Nhập học viên', category: 'Students' },
    { id: 'approve_questions', name: 'Duyệt câu hỏi', category: 'Questions' },
    { id: 'assign_teachers', name: 'Gán giáo viên', category: 'Classes' },
    { id: 'approve_schedules', name: 'Duyệt lịch học', category: 'Classes' },
    { id: 'system_settings', name: 'Cài đặt hệ thống', category: 'System' },
    { id: 'user_management', name: 'Quản lý người dùng', category: 'Users' },
    { id: 'view_logs', name: 'Xem logs', category: 'System' },
    { id: 'manage_payments', name: 'Quản lý thanh toán', category: 'Payments' },
    { id: 'full_access', name: 'Truy cập toàn quyền', category: 'System' },
  ];

  // Color mapping for roles
  const colorMap = {
    'GUEST': { bg: 'from-gray-500 to-gray-600', badge: 'bg-gray-100 text-gray-700', icon: '👤' },
    'LEARNER': { bg: 'from-blue-500 to-blue-600', badge: 'bg-blue-100 text-blue-700', icon: '📚' },
    'TEACHER': { bg: 'from-green-500 to-green-600', badge: 'bg-green-100 text-green-700', icon: '👨‍🏫' },
    'STAFF': { bg: 'from-purple-500 to-purple-600', badge: 'bg-purple-100 text-purple-700', icon: '👔' },
    'MANAGER': { bg: 'from-orange-500 to-orange-600', badge: 'bg-orange-100 text-orange-700', icon: '📊' },
    'ADMIN': { bg: 'from-red-500 to-red-600', badge: 'bg-red-100 text-red-700', icon: '⚙️' },
  };

  // Fetch roles
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await userService.getRoles();
      setRoles(response.data || []);
      setFilteredRoles(response.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError(t('roleManagement.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort roles
  useEffect(() => {
    let filtered = [...roles];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(role =>
        role.name?.toLowerCase().includes(term) ||
        role.description?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(role => role.status === statusFilter);
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

    setFilteredRoles(filtered);
    setCurrentPage(1);
  }, [roles, searchTerm, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handle create role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await userService.createRole(newRole);
      setAlert({ show: true, type: 'success', message: t('roleManagement.createRoleSuccess') });
      setIsCreateModalOpen(false);
      setNewRole({
        name: '',
        description: '',
        permissions: [],
      });
      fetchRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      setAlert({ show: true, type: 'error', message: t('roleManagement.createRoleError') });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit role
  const handleEditRole = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await userService.updateRole(editRole.id, editRole);
      setAlert({ show: true, type: 'success', message: t('roleManagement.updateRoleSuccess') });
      setIsEditModalOpen(false);
      setEditRole({
        id: '',
        name: '',
        description: '',
        permissions: [],
      });
      fetchRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      setAlert({ show: true, type: 'error', message: t('roleManagement.updateRoleError') });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete role
  const handleDeleteRole = async (role) => {
    if (window.confirm(t('roleManagement.deleteConfirmation', `Bạn có chắc muốn xóa vai trò ${role.name}?`))) {
      try {
        await userService.deleteRole(role.id);
        setAlert({ show: true, type: 'success', message: t('roleManagement.deleteRoleSuccess') });
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        setAlert({ show: true, type: 'error', message: t('roleManagement.deleteRoleError') });
      }
    }
  };

  // Handle open permission modal
  const handleOpenPermissionModal = async (role) => {
    setSelectedRole(role);
    setIsPermissionModalOpen(true);
  };

  // Handle save permissions
  const handleSavePermissions = async () => {
    setActionLoading(true);
    try {
      await userService.updateRolePermissions(selectedRole.id, selectedRole.permissions);
      setAlert({ show: true, type: 'success', message: t('roleManagement.updatePermissionsSuccess') });
      setIsPermissionModalOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('Error updating permissions:', error);
      setAlert({ show: true, type: 'error', message: t('roleManagement.updatePermissionsError') });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle open assign modal
  const handleOpenAssignModal = async (role) => {
    setSelectedRole(role);
    setIsAssignModalOpen(true);
    try {
      const response = await userService.getUsersByRole(role.id);
      setRoleUsers(response.data || []);
      const allUsers = await userService.getAllUsers();
      const assignedUserIds = (response.data || []).map(u => u.id);
      setAvailableUsers((allUsers.data || []).filter(u => !assignedUserIds.includes(u.id)));
    } catch (error) {
      console.error('Error fetching users:', error);
      setRoleUsers([]);
      setAvailableUsers([]);
    }
  };

  // Handle assign user to role
  const handleAssignUser = async (userId) => {
    try {
      await userService.assignRole(userId, selectedRole.id);
      setAlert({ show: true, type: 'success', message: t('roleManagement.assignUserSuccess') });
      handleOpenAssignModal(selectedRole);
    } catch (error) {
      console.error('Error assigning user:', error);
      setAlert({ show: true, type: 'error', message: t('roleManagement.assignUserError') });
    }
  };

  // Handle remove user from role
  const handleRemoveUser = async (userId) => {
    try {
      await userService.removeRole(userId);
      setAlert({ show: true, type: 'success', message: t('roleManagement.removeUserSuccess') });
      handleOpenAssignModal(selectedRole);
    } catch (error) {
      console.error('Error removing user:', error);
      setAlert({ show: true, type: 'error', message: t('roleManagement.removeUserError') });
    }
  };

  // Table columns
  const columns = [
    {
      key: 'name',
      label: t('roleManagement.roleName'),
      render: (role) => (
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${colorMap[role.name]?.bg || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white font-bold`}>
            {colorMap[role.name]?.icon || '🔒'}
          </div>
          <div>
            <span className="font-medium text-gray-900">{role.name}</span>
            <p className="text-sm text-gray-500">{role.description || '-'}</p>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'userCount',
      label: t('roleManagement.userCount'),
      render: (role) => (
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <Badge variant="info">{role.userCount || 0}</Badge>
        </div>
      ),
      sortable: true
    },
    {
      key: 'permissions',
      label: t('roleManagement.permissions'),
      render: (role) => (
        <div className="flex flex-wrap gap-1">
          {(role.permissions || []).slice(0, 3).map(perm => (
            <Badge key={perm} variant="secondary" className="text-xs">
              {perm}
            </Badge>
          ))}
          {(role.permissions || []).length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{(role.permissions || []).length - 3}
            </Badge>
          )}
        </div>
      ),
      sortable: false
    },
    {
      key: 'status',
      label: t('roleManagement.status'),
      render: (role) => (
        <Badge
          variant={role.status === 'ACTIVE' ? 'success' : 'warning'}
        >
          {role.status || '-'}
        </Badge>
      ),
      sortable: true
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (role) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenPermissionModal(role)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={t('roleManagement.managePermissions')}
          >
            <Lock className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenAssignModal(role)}
            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title={t('roleManagement.assignUsers')}
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditRole({
                id: role.id,
                name: role.name,
                description: role.description,
                permissions: role.permissions || [],
              });
              setIsEditModalOpen(true);
            }}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title={t('common.edit')}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteRole(role)}
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
        title={t('roleManagement.title')}
        subtitle={t('roleManagement.subtitle')}
        actions={
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={fetchRoles}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('common.refresh')}
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('roleManagement.createRole')}
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('roleManagement.totalRoles')}</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('roleManagement.activeRoles')}</p>
              <p className="text-2xl font-bold text-green-600">
                {roles.filter(r => r.status === 'ACTIVE').length}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('roleManagement.totalUsers')}</p>
              <p className="text-2xl font-bold text-primary-600">
                {roles.reduce((sum, role) => sum + (role.userCount || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('roleManagement.totalPermissions')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {availablePermissions.length}
              </p>
            </div>
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('roleManagement.searchPlaceholder')}
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
              <option value="all">{t('roleManagement.allStatus')}</option>
              <option value="ACTIVE">{t('roleManagement.active')}</option>
              <option value="INACTIVE">{t('roleManagement.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {paginatedRoles.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('roleManagement.noRolesFound')}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    {col.label}
                    {col.sortable && (
                      <span className="ml-1">
                        {sortField === col.key && sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRoles.map((role, index) => (
                <tr key={role.id} className="border-t border-gray-200 hover:bg-gray-50">
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                      {col.render(role)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-4">
            <div className="text-sm text-gray-500">
              {t('common.showing')} {startIndex + 1} - {Math.min(endIndex, filteredRoles.length)} {t('common.of')} {filteredRoles.length}
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
      </div>

      {/* Permissions Matrix */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          <Lock className="w-5 h-5 inline mr-2" />
          {t('roleManagement.permissionsMatrix')}
        </h2>

        <div className="overflow-x-auto -mx-4 px-4">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 text-sm">
                    {t('roleManagement.permission')}
                  </th>
                  {paginatedRoles.map(role => (
                    <th key={role.id} className="px-4 py-3 text-center font-bold text-gray-700 text-sm">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {availablePermissions.map((perm, idx) => (
                  <tr key={perm.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-gray-700 text-sm">
                      <div>
                        <span className="font-medium">{perm.name}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {perm.category}
                        </Badge>
                      </div>
                    </td>
                    {paginatedRoles.map(role => (
                      <td key={role.id} className="px-4 py-3 text-center">
                        <span className={`inline-block w-5 h-5 rounded ${(role.permissions || []).includes(perm.id)
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                          }`}></span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Role Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewRole({
            name: '',
            description: '',
            permissions: [],
          });
        }}
        title={t('roleManagement.createRole')}
        size="lg"
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('roleManagement.roleName')} *
            </label>
            <Input
              type="text"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('roleManagement.description')}
            </label>
            <Input
              type="text"
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('roleManagement.permissions')}
            </label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
              {availablePermissions.map(perm => (
                <label key={perm.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={newRole.permissions.includes(perm.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewRole({
                          ...newRole,
                          permissions: [...newRole.permissions, perm.id]
                        });
                      } else {
                        setNewRole({
                          ...newRole,
                          permissions: newRole.permissions.filter(p => p !== perm.id)
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{perm.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewRole({
                  name: '',
                  description: '',
                  permissions: [],
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
                  {t('roleManagement.createRole')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditRole({
            id: '',
            name: '',
            description: '',
            permissions: [],
          });
        }}
        title={t('roleManagement.editRole')}
        size="lg"
      >
        <form onSubmit={handleEditRole} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('roleManagement.roleName')} *
            </label>
            <Input
              type="text"
              value={editRole.name}
              onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('roleManagement.description')}
            </label>
            <Input
              type="text"
              value={editRole.description}
              onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('roleManagement.permissions')}
            </label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
              {availablePermissions.map(perm => (
                <label key={perm.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={editRole.permissions.includes(perm.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditRole({
                          ...editRole,
                          permissions: [...editRole.permissions, perm.id]
                        });
                      } else {
                        setEditRole({
                          ...editRole,
                          permissions: editRole.permissions.filter(p => p !== perm.id)
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{perm.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditRole({
                  id: '',
                  name: '',
                  description: '',
                  permissions: [],
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
                  <Edit className="w-4 h-4 mr-2" />
                  {t('roleManagement.updateRole')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Permission Management Modal */}
      <Modal
        isOpen={isPermissionModalOpen}
        onClose={() => {
          setIsPermissionModalOpen(false);
          setSelectedRole(null);
        }}
        title={`${t('roleManagement.managePermissions')} - ${selectedRole?.name}`}
        size="xl"
      >
        {selectedRole && (
          <div className="space-y-4">
            <p className="text-gray-600">{t('roleManagement.managePermissionsDescription')}</p>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-3">
              {availablePermissions.map(perm => (
                <label key={perm.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={(selectedRole.permissions || []).includes(perm.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRole({
                          ...selectedRole,
                          permissions: [...(selectedRole.permissions || []), perm.id]
                        });
                      } else {
                        setSelectedRole({
                          ...selectedRole,
                          permissions: (selectedRole.permissions || []).filter(p => p !== perm.id)
                        });
                      }
                    }}
                  />
                  <span className="flex-1 text-sm">{perm.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {perm.category}
                  </Badge>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsPermissionModalOpen(false);
                  setSelectedRole(null);
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleSavePermissions}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loading type="spinner" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    {t('roleManagement.savePermissions')}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal >

      {/* Assign Users Modal */}
      < Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedRole(null);
          setRoleUsers([]);
          setAvailableUsers([]);
        }}
        title={`${t('roleManagement.assignUsers')} - ${selectedRole?.name}`}
        size="xl"
      >
        {selectedRole && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-gray-900">{selectedRole.name}</span>
              <Badge variant="info">{roleUsers.length} {t('roleManagement.users')}</Badge>
            </div>

            {/* Assigned Users */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{t('roleManagement.assignedUsers')}</h4>
              {roleUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('roleManagement.noAssignedUsers')}</p>
              ) : (
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                  {roleUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="flex-1">
                        <span className="font-medium">{user.fullName}</span>
                        <span className="text-sm text-gray-500">{user.email}</span>
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Users */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{t('roleManagement.availableUsers')}</h4>
              {availableUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('roleManagement.noAvailableUsers')}</p>
              ) : (
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                  {availableUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="flex-1">
                        <span className="font-medium">{user.fullName}</span>
                        <span className="text-sm text-gray-500">{user.email}</span>
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAssignUser(user.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedRole(null);
                  setRoleUsers([]);
                  setAvailableUsers([]);
                }}
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        )}
      </Modal >
    </PageContainer >
  );
};

export default RoleManagement;
