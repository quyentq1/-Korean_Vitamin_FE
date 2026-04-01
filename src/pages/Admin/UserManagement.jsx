import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, Eye, Edit2, Trash2, CheckCircle, PauseCircle, Download, Upload, Plus, Search, Filter, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import userService from '../../services/userService';
import adminService from '../../services/adminService';
import { Table, Button, Modal, Badge, PageHeader, PageActions, FullPageContainer } from '../../components/ui';
import LockAccountModal from '../../components/Admin/LockAccountModal';
import UnlockAccountModal from '../../components/Admin/UnlockAccountModal';

const UserManagement = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Toast notification helper
    const showToast = (message, type = 'error') => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

        Toast.fire({
            icon: type,
            title: message
        });
    };

    // State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [importFile, setImportFile] = useState(null);

    // Form states for Add/Edit User
    const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'STUDENT' });
    const [editUser, setEditUser] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        gender: '',
        dateOfBirth: '',
        avatar: '',
        role: '',
        active: true,
        paymentTier: 'BASIC',
        isPremium: false,
        accountNonLocked: true,
        expirationDate: ''
    });
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [importPreview, setImportPreview] = useState(null);
    const [importing, setImporting] = useState(false);

    // Filters
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            let response;
            if (roleFilter !== 'all') {
                response = await userService.getUsersByRole(roleFilter);
            } else {
                response = await userService.getAllUsers();
            }

            // Handle both direct array and wrapped response
            let data = Array.isArray(response) ? response : (response?.data || response?.results || []);

            // Filter out ADMIN users
            data = data.filter(user => user?.role !== 'ADMIN' && user?.role !== 'Admin');

            // Apply filters
            let filtered = data;

            // Status filter
            if (statusFilter !== 'all') {
                filtered = filtered.filter(user => {
                    const isActive = user.active !== undefined ? user.active : (user.status === 'active');
                    if (statusFilter === 'active') return isActive;
                    if (statusFilter === 'inactive') return !isActive;
                    return user.status === statusFilter;
                });
            }

            // Search filter
            if (searchTerm) {
                filtered = filtered.filter(user =>
                    (user.fullName || user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Sort
            filtered.sort((a, b) => {
                let comparison = 0;
                if (sortBy === 'name') {
                    const aName = a.fullName || a.name || '';
                    const bName = b.fullName || b.name || '';
                    comparison = aName.localeCompare(bName);
                } else if (sortBy === 'email') {
                    comparison = a.email.localeCompare(b.email);
                } else if (sortBy === 'role') {
                    comparison = a.role.localeCompare(b.role);
                } else if (sortBy === 'status') {
                    const aStatus = a.active !== undefined ? (a.active ? 'active' : 'inactive') : (a.status || '');
                    const bStatus = b.active !== undefined ? (b.active ? 'active' : 'inactive') : (b.status || '');
                    comparison = aStatus.localeCompare(bStatus);
                } else if (sortBy === 'lastLogin') {
                    comparison = new Date(a.lastLogin || 0) - new Date(b.lastLogin || 0);
                }
                return sortOrder === 'asc' ? comparison : -comparison;
            });

            // Pagination
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

            setUsers(paginated);
            setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        } catch (error) {
            console.error("Failed to fetch users:", error);
            showToast(t('userMgmt.fetchError', 'Không thể tải danh sách người dùng'), 'error');
        } finally {
            setLoading(false);
        }
    }, [roleFilter, statusFilter, searchTerm, sortBy, sortOrder, currentPage, itemsPerPage, t]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle user selection
    const handleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u?.id || u?.userId || u?.pk).filter(Boolean));
        }
    };

    // Handle delete
    const handleDelete = async (user) => {
        if (!window.confirm(t('userMgmt.confirmDelete', `Bạn có chắc chắn muốn xóa người dùng ${user.name}?`))) {
            return;
        }

        try {
            await userService.deleteUser(user.id);
            await fetchUsers();
            setShowDeleteModal(false);
            showToast('Xóa người dùng thành công!', 'success');
        } catch (error) {
            console.error("Failed to delete user:", error);
            showToast(t('userMgmt.deleteError', 'Không thể xóa người dùng'), 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(t('userMgmt.confirmBulkDelete', `Bạn có chắc chắn muốn xóa ${selectedUsers.length} người dùng đã chọn?`))) {
            return;
        }

        try {
            await Promise.all(selectedUsers.map(id => userService.deleteUser(id)));
            setSelectedUsers([]);
            await fetchUsers();
            setShowDeleteModal(false);
            showToast('Xóa người dùng thành công!', 'success');
        } catch (error) {
            console.error("Failed to bulk delete users:", error);
            showToast(t('userMgmt.bulkDeleteError', 'Không thể xóa người dùng'), 'error');
        }
    };

    // Handle activate/deactivate
    const handleToggleStatus = async (user) => {
        try {
            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            await userService.updateUser(user.id, { ...user, status: newStatus });
            await fetchUsers();
        } catch (error) {
            console.error("Failed to toggle user status:", error);
            showToast(t('userMgmt.toggleStatusError', 'Không thể cập nhật trạng thái người dùng'), 'error');
        }
    };

    // Handle lock account
    const handleLockAccount = (user) => {
        setCurrentUser(user);
        setShowLockModal(true);
    };

    const handleLockSubmit = async (reason) => {
        try {
            await userService.lockAccount(currentUser.id, { reason });
            setShowLockModal(false);
            await fetchUsers();
            showToast('Khóa tài khoản thành công!', 'success');
        } catch (error) {
            console.error("Failed to lock account:", error);
            showToast(t('userMgmt.lockError', 'Không thể khóa tài khoản'), 'error');
        }
    };

    // Handle unlock account
    const handleUnlockAccount = (user) => {
        setCurrentUser(user);
        setShowUnlockModal(true);
    };

    const handleUnlockSubmit = async () => {
        try {
            await userService.unlockAccount(currentUser.id);
            setShowUnlockModal(false);
            await fetchUsers();
            showToast('Mở khóa tài khoản thành công!', 'success');
        } catch (error) {
            console.error("Failed to unlock account:", error);
            showToast(t('userMgmt.unlockError', 'Không thể mở khóa tài khoản'), 'error');
        }
    };

    // Handle Add User
    const handleAddUser = async () => {
        try {
            await userService.createUser(newUser);
            setNewUser({ fullName: '', email: '', password: '', role: 'STUDENT' });
            setShowAddUserModal(false);
            await fetchUsers();
            showToast('Tạo người dùng thành công!', 'success');
        } catch (error) {
            console.error("Failed to create user:", error);
            showToast(t('userMgmt.createError', 'Không thể tạo người dùng'), 'error');
        }
    };

    // Handle Edit User
    const handleEditUser = async () => {
        try {
            await userService.updateUser(currentUser.id, editUser);
            setEditUser({ fullName: '', email: '', role: '', active: true });
            setShowEditUserModal(false);
            setCurrentUser(null);
            await fetchUsers();
            showToast('Cập nhật người dùng thành công!', 'success');
        } catch (error) {
            console.error("Failed to update user:", error);
            showToast(t('userMgmt.updateError', 'Không thể cập nhật người dùng'), 'error');
        }
    };

    // Handle export CSV
    const handleExportCSV = () => {
        const headers = ['ID', 'Tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày hết hạn', 'Đăng nhập cuối'];
        const csvContent = [
            headers.join(','),
            ...users.map(user => [
                user.id,
                user.name,
                user.email,
                user.role,
                user.status,
                user.expirationDate || 'N/A',
                user.lastLogin
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'users.csv';
        link.click();
        window.URL.revokeObjectURL(url);
    };

    // Handle import CSV
    const handleImportCSV = async () => {
        if (!importFile) {
            showToast(t('userMgmt.noFileSelected', 'Vui lòng chọn file CSV'), 'warning');
            return;
        }

        setImporting(true);
        try {
            const text = await importFile.text();
            const lines = text.split('\n');
            const headers = lines[0].split(',');
            const usersData = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                if (values.length === headers.length) {
                    usersData.push({
                        name: values[1]?.trim(),
                        email: values[2]?.trim(),
                        role: values[3]?.trim(),
                        status: values[4]?.trim() || 'active'
                    });
                }
            }

            setImportPreview(usersData);
        } catch (error) {
            console.error("Failed to parse CSV:", error);
            showToast(t('userMgmt.parseCSVError', 'Không thể đọc file CSV'), 'error');
        } finally {
            setImporting(false);
        }
    };

    const handleConfirmImport = async () => {
        if (!importPreview || importPreview.length === 0) {
            return;
        }

        setImporting(true);
        try {
            await Promise.all(importPreview.map(user => userService.createUser(user)));
            setShowImportModal(false);
            setImportFile(null);
            setImportPreview(null);
            await fetchUsers();
            showToast('Nhập người dùng từ CSV thành công!', 'success');
        } catch (error) {
            console.error("Failed to import users:", error);
            showToast(t('userMgmt.importError', 'Không thể nhập người dùng'), 'error');
        } finally {
            setImporting(false);
        }
    };

    // Reset filters
    const handleResetFilters = () => {
        setRoleFilter('all');
        setStatusFilter('all');
        setSearchTerm('');
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
    };

    // Handle avatar upload
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Vui lòng chọn file ảnh', 'warning');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Kích thước file không được quá 5MB', 'warning');
            return;
        }

        try {
            setUploadingAvatar(true);
            const response = await adminService.uploadUserAvatar(file);
            setEditUser(prev => ({ ...prev, avatar: response.data?.url || response.url }));
            showToast('Đã tải lên ảnh đại diện thành công!', 'success');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showToast('Không thể tải lên ảnh đại diện', 'error');
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Render role badge
    const renderRoleBadge = (role) => {
        const colors = {
            'Learner': 'bg-blue-100 text-blue-700',
            'Teacher': 'bg-green-100 text-green-700',
            'Staff': 'bg-purple-100 text-purple-700',
            'Manager': 'bg-orange-100 text-orange-700',
            'Admin': 'bg-red-100 text-red-700'
        };
        return <Badge variant="status" className={colors[role] || 'bg-gray-100 text-gray-700'}>{role}</Badge>;
    };

    // Render status badge
    const renderStatusBadge = (status) => {
        const colors = {
            'active': 'bg-green-100 text-green-700',
            'inactive': 'bg-gray-100 text-gray-700',
            'pending': 'bg-yellow-100 text-yellow-700',
            'suspended': 'bg-red-100 text-red-700'
        };
        return <Badge variant="status" className={colors[status] || 'bg-gray-100 text-gray-700'}>{status}</Badge>;
    };

    // Table columns
    const columns = useMemo(() => [
        {
            key: 'select',
            header: '',
            className: 'w-12',
            render: (value, row) => {
                const userId = row?.id || row?.userId || row?.pk;
                if (!userId) return null;
                return (
                    <input
                        type="checkbox"
                        checked={selectedUsers.includes(userId)}
                        onChange={() => handleSelectUser(userId)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                );
            }
        },
        {
            key: 'name',
            header: t('userMgmt.name', 'Tên'),
            sortable: true,
            className: 'min-w-[200px]',
            render: (value, row) => {
                const displayName = row?.fullName || row?.name || row?.username || 'Unknown';
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 shrink-0">
                            {row?.avatar ? (
                                <img
                                    src={row.avatar}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {displayName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="font-medium text-gray-900">{displayName}</span>
                    </div>
                );
            }
        },
        {
            key: 'email',
            header: t('userMgmt.email', 'Email'),
            sortable: true,
            className: 'min-w-[200px]',
            render: (value, row) => <span className="text-gray-600">{row?.email || 'N/A'}</span>
        },
        {
            key: 'role',
            header: t('userMgmt.role', 'Vai trò'),
            sortable: true,
            className: 'min-w-[120px]',
            render: (value, row) => renderRoleBadge(row?.role)
        },
        {
            key: 'status',
            header: t('userMgmt.status', 'Trạng thái'),
            sortable: true,
            className: 'min-w-[120px]',
            render: (value, row) => {
                const statusStr = row?.active !== undefined ? (row?.active ? 'active' : 'inactive') : row?.status;
                return renderStatusBadge(statusStr);
            }
        },
        {
            key: 'expirationDate',
            header: t('userMgmt.expirationDate', 'Ngày hết hạn'),
            sortable: true,
            className: 'min-w-[120px]',
            render: (value, row) => <span className="text-gray-600">{row?.expirationDate || 'N/A'}</span>
        },
        {
            key: 'lastLogin',
            header: t('userMgmt.lastLogin', 'Đăng nhập cuối'),
            sortable: true,
            className: 'min-w-[150px]',
            render: (value, row) => <span className="text-gray-600">{row?.lastLogin || 'N/A'}</span>
        },
        {
            key: 'actions',
            header: t('userMgmt.actions', 'Thao tác'),
            className: 'min-w-[200px]',
            render: (value, row) => {
                const userId = row?.id || row?.userId || row?.pk;
                if (!userId) return null;

                return (
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setCurrentUser(row);
                                setShowViewModal(true);
                            }}
                            title={t('userMgmt.view', 'Xem chi tiết')}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setCurrentUser(row);
                                setEditUser({
                                    fullName: row?.fullName || row?.name || '',
                                    email: row?.email || '',
                                    phone: row?.phone || '',
                                    address: row?.address || '',
                                    gender: row?.gender || '',
                                    dateOfBirth: row?.dateOfBirth || '',
                                    avatar: row?.avatar || '',
                                    role: row?.role || '',
                                    active: row?.active !== undefined ? row?.active : (row?.status === 'active'),
                                    paymentTier: row?.paymentTier || 'BASIC',
                                    isPremium: row?.isPremium || false,
                                    accountNonLocked: row?.accountNonLocked !== false,
                                    expirationDate: row?.expirationDate || ''
                                });
                                setShowEditUserModal(true);
                            }}
                            title={t('userMgmt.edit', 'Sửa')}
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLockAccount(row)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title={t('userMgmt.lock', 'Khóa')}
                        >
                            <Lock className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnlockAccount(row)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title={t('userMgmt.unlock', 'Mở khóa')}
                        >
                            <Unlock className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(row)}
                            className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                            title={t('userMgmt.delete', 'Xóa')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                );
            }
        }
    ], [selectedUsers, t]);

    // Pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <FullPageContainer>
                <PageHeader
                    title={t('userMgmt.title', 'Quản Lý Người Dùng')}
                    subtitle={t('userMgmt.subtitle', 'Quản lý tất cả người dùng trên hệ thống')}
                />
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </FullPageContainer>
        );
    }

    return (
        <FullPageContainer>
            <PageHeader
                title={t('userMgmt.title', 'Quản Lý Người Dùng')}
                subtitle={t('userMgmt.subtitle', 'Quản lý tất cả người dùng trên hệ thống')}
            >
                <PageActions>
                    <Button
                        variant="primary"
                        onClick={() => setShowAddUserModal(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('userMgmt.addUser', 'Thêm Người Dùng')}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setShowImportModal(true)}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        {t('userMgmt.importCSV', 'Nhập CSV')}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleExportCSV}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {t('userMgmt.exportCSV', 'Xuất CSV')}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={fetchUsers}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('userMgmt.refresh', 'Làm mới')}
                    </Button>
                </PageActions>
            </PageHeader>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        {t('userMgmt.filters', 'Bộ lọc và tìm kiếm')}
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('userMgmt.searchPlaceholder', 'Tìm kiếm theo tên hoặc email...')}
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('userMgmt.searchPlaceholder', 'Tìm kiếm theo tên hoặc email...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('userMgmt.roleFilter', 'Lọc theo vai trò')}
                        </label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">{t('userMgmt.allRoles', 'Tất cả')}</option>
                            <option value="STUDENT">{t('userMgmt.learner', 'Học viên')}</option>
                            <option value="TEACHER">{t('userMgmt.teacher', 'Giảng viên')}</option>
                            <option value="STAFF">{t('userMgmt.staff', 'Nhân viên')}</option>
                            <option value="MANAGER">{t('userMgmt.manager', 'Quản lý')}</option>
                            <option value="EDUCATION_MANAGER">{t('userMgmt.eduManager', 'Giáo dục viên')}</option>
                            <option value="ADMIN">{t('userMgmt.admin', 'Quản trị viên')}</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('userMgmt.statusFilter', 'Lọc theo trạng thái')}
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">{t('userMgmt.allStatuses', 'Tất cả')}</option>
                            <option value="active">{t('userMgmt.active', 'Hoạt động')}</option>
                            <option value="inactive">{t('userMgmt.inactive', 'Không hoạt động')}</option>
                            <option value="pending">{t('userMgmt.pending', 'Chờ duyệt')}</option>
                            <option value="suspended">{t('userMgmt.suspended', 'Tạm khóa')}</option>
                        </select>
                    </div>

                    {/* Reset Button */}
                    <div className="flex items-end">
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={handleResetFilters}
                        >
                            {t('userMgmt.resetFilters', 'Đặt lại')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-700">
                        {t('userMgmt.selectedCount', 'Đã chọn')} <span className="font-bold">{selectedUsers.length}</span> {t('userMgmt.users', 'người dùng')}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('userMgmt.bulkDelete', 'Xóa đã chọn')}
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={async () => {
                                try {
                                    await Promise.all(selectedUsers.map(id => userService.updateUser(id, { status: 'active' })));
                                    setSelectedUsers([]);
                                    await fetchUsers();
                                    showToast('Kích hoạt người dùng thành công!', 'success');
                                } catch (error) {
                                    console.error("Failed to activate users:", error);
                                    showToast(t('userMgmt.activateError', 'Không thể kích hoạt người dùng'), 'error');
                                }
                            }}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {t('userMgmt.activateAll', 'Kích hoạt tất cả')}
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                                try {
                                    await Promise.all(selectedUsers.map(id => userService.updateUser(id, { status: 'inactive' })));
                                    setSelectedUsers([]);
                                    await fetchUsers();
                                    showToast('Vô hiệu hóa người dùng thành công!', 'success');
                                } catch (error) {
                                    console.error("Failed to deactivate users:", error);
                                    showToast(t('userMgmt.deactivateError', 'Không thể vô hiệu hóa người dùng'), 'error');
                                }
                            }}
                        >
                            <PauseCircle className="w-4 h-4 mr-2" />
                            {t('userMgmt.deactivateAll', 'Vô hiệu hóa tất cả')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
                <Table
                    columns={columns}
                    data={users}
                    loading={loading}
                    pagination={{
                        currentPage,
                        totalPages,
                        itemsPerPage,
                        totalItems: users.length * totalPages,
                        onPageChange: handlePageChange
                    }}
                    sorting={{
                        sortBy,
                        sortOrder,
                        onSort: (column) => {
                            if (column.sortable) {
                                const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                                setSortBy(column.key);
                                setSortOrder(newOrder);
                            }
                        }
                    }}
                    className="w-full"
                />
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={t('userMgmt.deleteConfirmTitle', 'Xác nhận xóa')}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                            {t('common.cancel', 'Hủy')}
                        </Button>
                        <Button variant="danger" onClick={handleBulkDelete}>
                            {t('common.confirm', 'Xác nhận')}
                        </Button>
                    </>
                }
            >
                <p className="text-gray-600 mb-4">
                    {t('userMgmt.deleteConfirmMessage', `Bạn có chắc chắn muốn xóa ${selectedUsers.length > 1 ? `${selectedUsers.length} người dùng đã chọn?` : 'người dùng này?'} Hành động này không thể hoàn tác.`)}
                </p>
            </Modal>

            {/* Add User Modal */}
            <Modal
                isOpen={showAddUserModal}
                onClose={() => setShowAddUserModal(false)}
                title={t('userMgmt.addUserTitle', 'Thêm Người Dùng Mới')}
                size="lg"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowAddUserModal(false)}>
                            {t('common.cancel', 'Hủy')}
                        </Button>
                        <Button variant="primary" onClick={handleAddUser}>
                            {t('common.create', 'Tạo')}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('userMgmt.name', 'Tên đầy đủ')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('userMgmt.namePlaceholder', 'Nhập tên...')}
                            value={newUser.fullName}
                            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('userMgmt.email', 'Email')}
                        </label>
                        <input
                            type="email"
                            placeholder={t('userMgmt.emailPlaceholder', 'Nhập email...')}
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('userMgmt.password', 'Mật khẩu')}
                        </label>
                        <input
                            type="password"
                            placeholder={t('userMgmt.passwordPlaceholder', 'Nhập mật khẩu...')}
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('userMgmt.role', 'Vai trò')}
                        </label>
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="STUDENT">{t('userMgmt.learner', 'Học viên')}</option>
                            <option value="TEACHER">{t('userMgmt.teacher', 'Giảng viên')}</option>
                            <option value="STAFF">{t('userMgmt.staff', 'Nhân viên')}</option>
                            <option value="MANAGER">{t('userMgmt.manager', 'Quản lý')}</option>
                            <option value="ADMIN">{t('userMgmt.admin', 'Quản trị viên')}</option>
                        </select>
                    </div>
                </div>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={showEditUserModal}
                onClose={() => {
                    setShowEditUserModal(false);
                    setCurrentUser(null);
                }}
                title={t('userMgmt.editUserTitle', 'Sửa Thông Tin Người Dùng')}
                size="3xl"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => {
                            setShowEditUserModal(false);
                            setCurrentUser(null);
                        }}>
                            {t('common.cancel', 'Hủy')}
                        </Button>
                        <Button variant="primary" onClick={handleEditUser}>
                            {t('common.save', 'Lưu thay đổi')}
                        </Button>
                    </>
                }
            >
                {currentUser && (
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                Thông tin cơ bản
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('userMgmt.name', 'Tên đầy đủ')}
                                    </label>
                                    <input
                                        type="text"
                                        value={editUser.fullName || ''}
                                        placeholder="Nhập tên..."
                                        onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('userMgmt.email', 'Email')}
                                    </label>
                                    <input
                                        type="email"
                                        value={editUser.email || ''}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                        title="Email không thể thay đổi"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="text"
                                        value={editUser.phone || ''}
                                        placeholder="Nhập số điện thoại..."
                                        onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giới tính
                                    </label>
                                    <select
                                        value={editUser.gender || ''}
                                        onChange={(e) => setEditUser({ ...editUser, gender: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Chưa chọn</option>
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngày sinh
                                    </label>
                                    <input
                                        type="date"
                                        value={editUser.dateOfBirth || ''}
                                        onChange={(e) => setEditUser({ ...editUser, dateOfBirth: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ảnh đại diện
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {/* Avatar Preview */}
                                        <div className="relative w-20 h-20 shrink-0">
                                            {editUser.avatar ? (
                                                <img
                                                    src={editUser.avatar}
                                                    alt="Avatar preview"
                                                    className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">No Image</span>
                                                </div>
                                            )}
                                            {uploadingAvatar && (
                                                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Upload Button */}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                id="avatar-upload"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                disabled={uploadingAvatar}
                                            />
                                            <label
                                                htmlFor="avatar-upload"
                                                className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-all ${
                                                    uploadingAvatar
                                                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                                                        : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                                                }`}
                                            >
                                                <Upload className="w-4 h-4" />
                                                <span className="text-sm font-medium">
                                                    {uploadingAvatar ? 'Đang tải lên...' : 'Chọn ảnh'}
                                                </span>
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">JPG, PNG (tối đa 5MB)</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Địa chỉ
                                    </label>
                                    <input
                                        type="text"
                                        value={editUser.address || ''}
                                        placeholder="Nhập địa chỉ..."
                                        onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div>
                            <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                Thông tin tài khoản
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('userMgmt.role', 'Vai trò')}
                                    </label>
                                    <select
                                        value={editUser.role || ''}
                                        onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="STUDENT">Học viên</option>
                                        <option value="TEACHER">Giảng viên</option>
                                        <option value="STAFF">Nhân viên</option>
                                        <option value="MANAGER">Quản lý</option>
                                        <option value="EDUCATION_MANAGER">Giáo dục viên</option>
                                        <option value="ADMIN">Quản trị viên</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('userMgmt.status', 'Trạng thái')}
                                    </label>
                                    <select
                                        value={editUser.active !== undefined ? (editUser.active ? 'true' : 'false') : ''}
                                        onChange={(e) => setEditUser({ ...editUser, active: e.target.value === 'true' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="true">Hoạt động</option>
                                        <option value="false">Không hoạt động</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại tài khoản
                                    </label>
                                    <select
                                        value={editUser.paymentTier || 'BASIC'}
                                        onChange={(e) => setEditUser({ ...editUser, paymentTier: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="BASIC">Cơ bản</option>
                                        <option value="PREMIUM">Premium</option>
                                        <option value="VIP">VIP</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Additional Settings */}
                        <div>
                            <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Cài đặt thêm
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isPremium"
                                        checked={editUser.isPremium || false}
                                        onChange={(e) => setEditUser({ ...editUser, isPremium: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="isPremium" className="text-sm font-medium text-gray-700">
                                        Tài khoản Premium
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="accountNonLocked"
                                        checked={editUser.accountNonLocked !== false}
                                        onChange={(e) => setEditUser({ ...editUser, accountNonLocked: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="accountNonLocked" className="text-sm font-medium text-gray-700">
                                        Cho phép đăng nhập
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Expiration Date */}
                        <div>
                            <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                Thời hạn
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngày hết hạn
                                    </label>
                                    <input
                                        type="date"
                                        value={editUser.expirationDate || ''}
                                        onChange={(e) => setEditUser({ ...editUser, expirationDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Để trống nếu không giới hạn</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Import CSV Modal */}
            <Modal
                isOpen={showImportModal}
                onClose={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportPreview(null);
                }}
                title={t('userMgmt.importCSVTitle', 'Nhập Người Dùng Từ CSV')}
                size="lg"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => {
                            setShowImportModal(false);
                            setImportFile(null);
                            setImportPreview(null);
                        }}>
                            {t('common.cancel', 'Hủy')}
                        </Button>
                        {importPreview && importPreview.length > 0 && (
                            <Button
                                variant="primary"
                                onClick={handleConfirmImport}
                                loading={importing}
                            >
                                {t('userMgmt.import', 'Nhập')}
                            </Button>
                        )}
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('userMgmt.selectCSVFile', 'Chọn file CSV')}
                        </label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setImportFile(e.target.files[0])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <Button
                        variant="secondary"
                        onClick={handleImportCSV}
                        loading={importing}
                        disabled={!importFile}
                    >
                        {t('userMgmt.previewCSV', 'Xem trước CSV')}
                    </Button>

                    {importPreview && importPreview.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                {t('userMgmt.preview', 'Xem trước')} ({importPreview.length} {t('userMgmt.users', 'người dùng')})
                            </h3>
                            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left">{t('userMgmt.name', 'Tên')}</th>
                                            <th className="px-3 py-2 text-left">{t('userMgmt.email', 'Email')}</th>
                                            <th className="px-3 py-2 text-left">{t('userMgmt.role', 'Vai trò')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importPreview.map((user, index) => (
                                            <tr key={index} className="border-b border-gray-100">
                                                <td className="px-3 py-2">{user.name}</td>
                                                <td className="px-3 py-2">{user.email}</td>
                                                <td className="px-3 py-2">{user.role}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="text-xs text-gray-500">
                        <p>{t('userMgmt.csvFormat', 'Định dạng CSV: Tên, Email, Vai trò, Trạng thái')}</p>
                        <p>{t('userMgmt.csvExample', 'Ví dụ: Nguyễn Văn A, nguyenvana@email.com, Learner, active')}</p>
                    </div>
                </div>
            </Modal>

            {/* Lock Account Modal */}
            {showLockModal && currentUser && (
                <LockAccountModal
                    user={currentUser}
                    onClose={() => setShowLockModal(false)}
                    onSubmit={handleLockSubmit}
                />
            )}

            {/* View User Details Modal */}
            <Modal
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setCurrentUser(null);
                }}
                title="Chi Tiết Người Dùng"
                size="3xl"
                className=""
            >
                {currentUser && (
                    <div className="space-y-6">
                        {/* Avatar & Basic Info */}
                        <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                {currentUser?.avatar ? (
                                    <img
                                        src={currentUser.avatar}
                                        alt={currentUser?.fullName || currentUser?.name || 'Avatar'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-3xl">
                                        {(currentUser?.fullName || currentUser?.name || currentUser?.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                    {currentUser?.fullName || currentUser?.name || 'Unknown'}
                                </h3>
                                <p className="text-gray-600">@{currentUser?.username || 'N/A'}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        currentUser?.role === 'STUDENT' ? 'bg-blue-100 text-blue-700' :
                                        currentUser?.role === 'TEACHER' ? 'bg-green-100 text-green-700' :
                                        currentUser?.role === 'STAFF' ? 'bg-purple-100 text-purple-700' :
                                        currentUser?.role === 'EDUCATION_MANAGER' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {currentUser?.role || 'N/A'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        currentUser?.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {currentUser?.active ? 'Hoạt động' : 'Không hoạt động'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Contact Information */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Thông Tin Liên Hệ
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Email</span>
                                        <span className="text-sm font-medium text-gray-900">{currentUser?.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Điện thoại</span>
                                        <span className="text-sm font-medium text-gray-900">{currentUser?.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-gray-500">Địa chỉ</span>
                                        <span className="text-sm font-medium text-gray-900">{currentUser?.address || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Thông Tin Cá Nhân
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Giới tính</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {currentUser?.gender === 'MALE' ? 'Nam' :
                                             currentUser?.gender === 'FEMALE' ? 'Nữ' :
                                             currentUser?.gender || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Ngày sinh</span>
                                        <span className="text-sm font-medium text-gray-900">{currentUser?.dateOfBirth || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-gray-500">Avatar</span>
                                        {currentUser?.avatar ? (
                                            <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-medium text-gray-900">N/A</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                    Thông Tin Tài Khoản
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">ID</span>
                                        <span className="text-sm font-medium text-gray-900">#{currentUser?.id || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Trạng thái</span>
                                        <span className={`text-sm font-medium ${
                                            currentUser?.active ? 'text-green-600' : 'text-gray-600'
                                        }`}>
                                            {currentUser?.active ? '✓ Hoạt động' : '✗ Không hoạt động'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Khóa tài khoản</span>
                                        <span className={`text-sm font-medium ${
                                            currentUser?.accountNonLocked !== false ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {currentUser?.accountNonLocked !== false ? '✓ Bình thường' : '✗ Đã khóa'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-gray-500">Premium</span>
                                        <span className={`text-sm font-medium ${
                                            currentUser?.isPremium ? 'text-amber-600' : 'text-gray-600'
                                        }`}>
                                            {currentUser?.isPremium ? '⭐ Premium' : 'Thường'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* System Information */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                    Thông Tin Hệ Thống
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Ngày tạo</span>
                                        <span className="text-sm font-medium text-gray-900">{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Cập nhật lần cuối</span>
                                        <span className="text-sm font-medium text-gray-900">{currentUser?.updatedAt ? new Date(currentUser.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Đăng nhập cuối</span>
                                        <span className="text-sm font-medium text-gray-900">{currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Số lần đăng nhập</span>
                                        <span className="text-sm font-medium text-gray-900">{currentUser?.loginCount || 0} lần</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-gray-500">Lần thử miễn phí</span>
                                        <span className="text-sm font-medium text-gray-900">{currentUser?.freeTestCount || 0} lần</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Status Details */}
                        {(currentUser?.lockedAt || currentUser?.lockedReason || currentUser?.expirationDate) && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                    Trạng Thái Đặc Biệt
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {currentUser?.lockedAt && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Ngày khóa</p>
                                            <p className="text-sm font-medium text-gray-900">{new Date(currentUser.lockedAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                    )}
                                    {currentUser?.lockedReason && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Lý do khóa</p>
                                            <p className="text-sm font-medium text-gray-900">{currentUser.lockedReason}</p>
                                        </div>
                                    )}
                                    {currentUser?.expirationDate && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Ngày hết hạn</p>
                                            <p className="text-sm font-medium text-gray-900">{new Date(currentUser.expirationDate).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setShowViewModal(false);
                                    setEditUser({
                                        fullName: currentUser?.fullName || currentUser?.name || '',
                                        email: currentUser?.email || '',
                                        phone: currentUser?.phone || '',
                                        address: currentUser?.address || '',
                                        gender: currentUser?.gender || '',
                                        dateOfBirth: currentUser?.dateOfBirth || '',
                                        avatar: currentUser?.avatar || '',
                                        role: currentUser?.role || '',
                                        active: currentUser?.active !== undefined ? currentUser?.active : true,
                                        paymentTier: currentUser?.paymentTier || 'BASIC',
                                        isPremium: currentUser?.isPremium || false,
                                        accountNonLocked: currentUser?.accountNonLocked !== false,
                                        expirationDate: currentUser?.expirationDate || ''
                                    });
                                    setShowEditUserModal(true);
                                }}
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setShowViewModal(false)}
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Unlock Account Modal */}
            {showUnlockModal && currentUser && (
                <UnlockAccountModal
                    user={currentUser}
                    onClose={() => setShowUnlockModal(false)}
                    onSubmit={handleUnlockSubmit}
                />
            )}

        </FullPageContainer>
    );
};

export default UserManagement;
