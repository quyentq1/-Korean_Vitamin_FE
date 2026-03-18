import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock } from 'lucide-react';
import userService from '../../services/userService';
import { Table, Button, Input, Modal, Badge, Alert, PageHeader, PageActions, PageContainer } from '../../components/ui';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LockAccountModal from '../../components/Admin/LockAccountModal';
import UnlockAccountModal from '../../components/Admin/UnlockAccountModal';

const UserManagement = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    // State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [importFile, setImportFile] = useState(null);

    // Form states for Add/Edit User
    const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'STUDENT' });
    const [editUser, setEditUser] = useState({ fullName: '', email: '', role: '', active: true });
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
        setError(null);
        try {
            let data;
            if (roleFilter !== 'all') {
                data = await userService.getUsersByRole(roleFilter);
            } else {
                data = await userService.getAllUsers();
            }
            
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
            setError(t('userMgmt.fetchError', 'Không thể tải danh sách người dùng'));
        } finally {
            setLoading(false);
        }
    }, [roleFilter, statusFilter, searchTerm, sortBy, sortOrder, currentPage, itemsPerPage]);
    
    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter, searchTerm, sortBy, sortOrder, currentPage, itemsPerPage]);
    
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
            setSelectedUsers(users.map(u => u.id));
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
        } catch (error) {
            console.error("Failed to delete user:", error);
            setError(t('userMgmt.deleteError', 'Không thể xóa người dùng'));
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
        } catch (error) {
            console.error("Failed to bulk delete users:", error);
            setError(t('userMgmt.bulkDeleteError', 'Không thể xóa người dùng'));
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
            setError(t('userMgmt.toggleStatusError', 'Không thể cập nhật trạng thái người dùng'));
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
        } catch (error) {
            console.error("Failed to lock account:", error);
            setError(t('userMgmt.lockError', 'Không thể khóa tài khoản'));
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
        } catch (error) {
            console.error("Failed to unlock account:", error);
            setError(t('userMgmt.unlockError', 'Không thể mở khóa tài khoản'));
        }
    };

    // Handle Add User
    const handleAddUser = async () => {
        try {
            await userService.createUser(newUser);
            setNewUser({ fullName: '', email: '', password: '', role: 'STUDENT' });
            setShowAddUserModal(false);
            await fetchUsers();
        } catch (error) {
            console.error("Failed to create user:", error);
            setError(t('userMgmt.createError', 'Không thể tạo người dùng'));
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
        } catch (error) {
            console.error("Failed to update user:", error);
            setError(t('userMgmt.updateError', 'Không thể cập nhật người dùng'));
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
            setError(t('userMgmt.noFileSelected', 'Vui lòng chọn file CSV'));
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
            setError(t('userMgmt.parseCSVError', 'Không thể đọc file CSV'));
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
        } catch (error) {
            console.error("Failed to import users:", error);
            setError(t('userMgmt.importError', 'Không thể nhập người dùng'));
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
    const columns = [
        {
            key: 'select',
            header: '',
            width: '50px',
            render: (row) => (
                <input
                    type="checkbox"
                    checked={selectedUsers.includes(row.id)}
                    onChange={() => handleSelectUser(row.id)}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
            )
        },
        {
            key: 'name',
            header: t('userMgmt.name', 'Tên'),
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {row.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{row.name}</span>
                </div>
            )
        },
        {
            key: 'email',
            header: t('userMgmt.email', 'Email'),
            sortable: true,
            render: (row) => <span className="text-gray-600">{row.email}</span>
        },
        {
            key: 'role',
            header: t('userMgmt.role', 'Vai trò'),
            sortable: true,
            render: (row) => renderRoleBadge(row.role)
        },
        {
            key: 'status',
            header: t('userMgmt.status', 'Trạng thái'),
            sortable: true,
            render: (row) => renderStatusBadge(row.status)
        },
        {
            key: 'expirationDate',
            header: t('userMgmt.expirationDate', 'Ngày hết hạn'),
            sortable: true,
            render: (row) => <span className="text-gray-600">{row.expirationDate || 'N/A'}</span>
        },
        {
            key: 'lastLogin',
            header: t('userMgmt.lastLogin', 'Đăng nhập cuối'),
            sortable: true,
            render: (row) => <span className="text-gray-600">{row.lastLogin || 'N/A'}</span>
        },
        {
            key: 'actions',
            header: t('userMgmt.actions', 'Thao tác'),
            width: '200px',
            render: (row) => (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        icon="👁️"
                        onClick={() => {
                            setCurrentUser(row);
                            setEditUser({
                                fullName: row.fullName || row.name || '',
                                email: row.email || '',
                                role: row.role || '',
                                active: row.active !== undefined ? row.active : (row.status === 'active')
                            });
                            setShowEditUserModal(true);
                        }}
                        title={t('userMgmt.view', 'Xem')}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        icon="✏️"
                        onClick={() => {
                            setCurrentUser(row);
                            setEditUser({
                                fullName: row.fullName || row.name || '',
                                email: row.email || '',
                                role: row.role || '',
                                active: row.active !== undefined ? row.active : (row.status === 'active')
                            });
                            setShowEditUserModal(true);
                        }}
                        title={t('userMgmt.edit', 'Sửa')}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<Lock className="w-4 h-4" />}
                        onClick={() => handleLockAccount(row)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title={t('userMgmt.lock', 'Khóa')}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<Unlock className="w-4 h-4" />}
                        onClick={() => handleUnlockAccount(row)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title={t('userMgmt.unlock', 'Mở khóa')}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        icon="🗑️"
                        onClick={() => handleDelete(row)}
                        className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                        title={t('userMgmt.delete', 'Xóa')}
                    />
                </div>
            )
        }
    ];
    
    // Pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    
    if (loading) {
        return (
            <PageContainer>
                <Navbar />
                <PageHeader
                    title={t('userMgmt.title', 'Quản Lý Người Dùng')}
                    subtitle={t('userMgmt.subtitle', 'Quản lý tất cả người dùng trên hệ thống')}
                />
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </PageContainer>
        );
    }
    
    return (
        <PageContainer>
            <Navbar />
            
            <PageHeader
                title={t('userMgmt.title', 'Quản Lý Người Dùng')}
                subtitle={t('userMgmt.subtitle', 'Quản lý tất cả người dùng trên hệ thống')}
            >
                <PageActions>
                    <Button
                        variant="primary"
                        icon="➕"
                        onClick={() => setShowAddUserModal(true)}
                    >
                        {t('userMgmt.addUser', 'Thêm Người Dùng')}
                    </Button>
                    <Button
                        variant="secondary"
                        icon="📥"
                        onClick={() => setShowImportModal(true)}
                    >
                        {t('userMgmt.importCSV', 'Nhập CSV')}
                    </Button>
                    <Button
                        variant="secondary"
                        icon="📤"
                        onClick={handleExportCSV}
                    >
                        {t('userMgmt.exportCSV', 'Xuất CSV')}
                    </Button>
                </PageActions>
            </PageHeader>
            
            {error && (
                <Alert variant="error" dismissible onDismiss={() => setError(null)}>
                    {error}
                </Alert>
            )}
            
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <Input
                            type="text"
                            placeholder={t('userMgmt.searchPlaceholder', 'Tìm kiếm theo tên hoặc email...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon="🔍"
                        />
                    </div>
                    
                    {/* Role Filter */}
                    <div>
                        <Input
                            type="select"
                            label={t('userMgmt.roleFilter', 'Lọc theo vai trò')}
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            icon="👤"
                        >
                            <option value="all">{t('userMgmt.allRoles', 'Tất cả')}</option>
                            <option value="STUDENT">{t('userMgmt.learner', 'Học viên')}</option>
                            <option value="TEACHER">{t('userMgmt.teacher', 'Giảng viên')}</option>
                            <option value="STAFF">{t('userMgmt.staff', 'Nhân viên')}</option>
                            <option value="MANAGER">{t('userMgmt.manager', 'Quản lý')}</option>
                            <option value="EDUCATION_MANAGER">{t('userMgmt.eduManager', 'Giáo dục viên')}</option>
                            <option value="ADMIN">{t('userMgmt.admin', 'Quản trị viên')}</option>
                        </Input>
                    </div>
                    
                    {/* Status Filter */}
                    <div>
                        <Input
                            type="select"
                            label={t('userMgmt.statusFilter', 'Lọc theo trạng thái')}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            icon="📊"
                        >
                            <option value="all">{t('userMgmt.allStatuses', 'Tất cả')}</option>
                            <option value="active">{t('userMgmt.active', 'Hoạt động')}</option>
                            <option value="inactive">{t('userMgmt.inactive', 'Không hoạt động')}</option>
                            <option value="pending">{t('userMgmt.pending', 'Chờ duyệt')}</option>
                            <option value="suspended">{t('userMgmt.suspended', 'Tạm khóa')}</option>
                        </Input>
                    </div>
                    
                    {/* Sort */}
                    <div>
                        <Input
                            type="select"
                            label={t('userMgmt.sortBy', 'Sắp xếp theo')}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            icon="📊"
                        >
                            <option value="name">{t('userMgmt.name', 'Tên')}</option>
                            <option value="email">{t('userMgmt.email', 'Email')}</option>
                            <option value="role">{t('userMgmt.role', 'Vai trò')}</option>
                            <option value="status">{t('userMgmt.status', 'Trạng thái')}</option>
                            <option value="lastLogin">{t('userMgmt.lastLogin', 'Đăng nhập cuối')}</option>
                        </Input>
                    </div>
                    
                    {/* Sort Order */}
                    <div>
                        <Input
                            type="select"
                            label={t('userMgmt.sortOrder', 'Thứ tự')}
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            icon="⬆️⬇️"
                        >
                            <option value="asc">{t('userMgmt.ascending', 'Tăng dần')}</option>
                            <option value="desc">{t('userMgmt.descending', 'Giảm dần')}</option>
                        </Input>
                    </div>
                    
                    {/* Reset Button */}
                    <div className="flex items-end">
                        <Button
                            variant="secondary"
                            size="sm"
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
                            icon="🗑️"
                        >
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
                                } catch (error) {
                                    console.error("Failed to activate users:", error);
                                    setError(t('userMgmt.activateError', 'Không thể kích hoạt người dùng'));
                                }
                            }}
                            icon="✅"
                        >
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
                                } catch (error) {
                                    console.error("Failed to deactivate users:", error);
                                    setError(t('userMgmt.deactivateError', 'Không thể vô hiệu hóa người dùng'));
                                }
                            }}
                            icon="⏸️"
                        >
                            {t('userMgmt.deactivateAll', 'Vô hiệu hóa tất cả')}
                        </Button>
                    </div>
                </div>
            )}
            
            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Table
                    columns={columns}
                    data={users}
                    loading={loading}
                    pagination={{
                        currentPage,
                        totalPages,
                        itemsPerPage,
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
                    <Input
                        type="text"
                        label={t('userMgmt.name', 'Tên đầy đủ')}
                        placeholder={t('userMgmt.namePlaceholder', 'Nhập tên...')}
                        value={newUser.fullName}
                        onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    />
                    <Input
                        type="email"
                        label={t('userMgmt.email', 'Email')}
                        placeholder={t('userMgmt.emailPlaceholder', 'Nhập email...')}
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                    <Input
                        type="password"
                        label={t('userMgmt.password', 'Mật khẩu')}
                        placeholder={t('userMgmt.passwordPlaceholder', 'Nhập mật khẩu...')}
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                    <Input
                        type="select"
                        label={t('userMgmt.role', 'Vai trò')}
                        placeholder={t('userMgmt.rolePlaceholder', 'Chọn vai trò...')}
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                        <option value="STUDENT">{t('userMgmt.learner', 'Học viên')}</option>
                        <option value="TEACHER">{t('userMgmt.teacher', 'Giảng viên')}</option>
                        <option value="STAFF">{t('userMgmt.staff', 'Nhân viên')}</option>
                        <option value="MANAGER">{t('userMgmt.manager', 'Quản lý')}</option>
                        <option value="ADMIN">{t('userMgmt.admin', 'Quản trị viên')}</option>
                    </Input>
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
                size="lg"
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
                    <div className="space-y-4">
                        <Input
                            type="text"
                            label={t('userMgmt.name', 'Tên đầy đủ')}
                            value={editUser.fullName || ''}
                            placeholder={t('userMgmt.namePlaceholder', 'Nhập tên...')}
                            onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                        />
                        <Input
                            type="email"
                            label={t('userMgmt.email', 'Email')}
                            value={editUser.email || ''}
                            placeholder={t('userMgmt.emailPlaceholder', 'Nhập email...')}
                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                        />
                        <Input
                            type="select"
                            label={t('userMgmt.role', 'Vai trò')}
                            value={editUser.role || ''}
                            placeholder={t('userMgmt.rolePlaceholder', 'Chọn vai trò...')}
                            onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                        >
                            <option value="STUDENT">{t('userMgmt.learner', 'Học viên')}</option>
                            <option value="TEACHER">{t('userMgmt.teacher', 'Giảng viên')}</option>
                            <option value="STAFF">{t('userMgmt.staff', 'Nhân viên')}</option>
                            <option value="MANAGER">{t('userMgmt.manager', 'Quản lý')}</option>
                            <option value="EDUCATION_MANAGER">{t('userMgmt.eduManager', 'Giáo dục viên')}</option>
                            <option value="ADMIN">{t('userMgmt.admin', 'Quản trị viên')}</option>
                        </Input>
                        <Input
                            type="select"
                            label={t('userMgmt.status', 'Trạng thái')}
                            value={editUser.active !== undefined ? (editUser.active ? 'true' : 'false') : ''}
                            placeholder={t('userMgmt.statusPlaceholder', 'Chọn trạng thái...')}
                            onChange={(e) => setEditUser({ ...editUser, active: e.target.value === 'true' })}
                        >
                            <option value="true">{t('userMgmt.active', 'Hoạt động')}</option>
                            <option value="false">{t('userMgmt.inactive', 'Không hoạt động')}</option>
                        </Input>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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

            {/* Unlock Account Modal */}
            {showUnlockModal && currentUser && (
                <UnlockAccountModal
                    user={currentUser}
                    onClose={() => setShowUnlockModal(false)}
                    onSubmit={handleUnlockSubmit}
                />
            )}

            <Footer />
        </PageContainer>
    );
};

export default UserManagement;
