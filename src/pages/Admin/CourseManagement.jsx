import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import { Table, Button, Input, Modal, Badge, Alert, PageHeader, PageActions, PageContainer, Card } from '../../components/ui';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

const CourseManagement = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    // State
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [courseStudents, setCourseStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Fetch courses
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await courseService.getAllCourses();
            
            // Apply filters
            let filtered = data;
            
            // Search filter
            if (searchTerm) {
                filtered = filtered.filter(course => 
                    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.code.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            // Level filter
            if (levelFilter !== 'all') {
                filtered = filtered.filter(course => course.level === levelFilter);
            }
            
            // Status filter
            if (statusFilter !== 'all') {
                filtered = filtered.filter(course => course.status === statusFilter);
            }
            
            // Sort
            filtered.sort((a, b) => {
                let comparison = 0;
                if (sortBy === 'name') {
                    comparison = a.name.localeCompare(b.name);
                } else if (sortBy === 'code') {
                    comparison = a.code.localeCompare(b.code);
                } else if (sortBy === 'level') {
                    comparison = a.level.localeCompare(b.level);
                } else if (sortBy === 'price') {
                    comparison = a.price - b.price;
                } else if (sortBy === 'duration') {
                    comparison = a.duration - b.duration;
                }
                return sortOrder === 'asc' ? comparison : -comparison;
            });
            
            // Pagination
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
            
            setCourses(paginated);
            setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            setError(t('courseMgmt.fetchError', 'Không thể tải danh sách khóa học'));
        } finally {
            setLoading(false);
        }
    }, [searchTerm, levelFilter, statusFilter, sortBy, sortOrder, currentPage, itemsPerPage]);
    
    useEffect(() => {
        fetchCourses();
    }, [searchTerm, levelFilter, statusFilter, sortBy, sortOrder, currentPage, itemsPerPage]);
    
    // Handle course selection
    const handleSelectCourse = (courseId) => {
        setSelectedCourses(prev => 
            prev.includes(courseId) 
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };
    
    const handleSelectAll = () => {
        if (selectedCourses.length === courses.length) {
            setSelectedCourses([]);
        } else {
            setSelectedCourses(courses.map(c => c.id));
        }
    };
    
    // Handle delete
    const handleDelete = async (course) => {
        const result = await Swal.fire({
            icon: 'question',
            title: t('courseMgmt.confirmDeleteTitle', 'Confirm Delete'),
            text: t('courseMgmt.confirmDelete', `Are you sure you want to delete course ${course.name}?`),
            showCancelButton: true,
            confirmButtonText: t('common.delete', 'Delete'),
            cancelButtonText: t('common.cancel', 'Cancel'),
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await courseService.deleteCourse(course.id);
            await fetchCourses();
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Failed to delete course:", error);
            setError(t('courseMgmt.deleteError', 'Không thể xóa khóa học'));
        }
    };

    const handleBulkDelete = async () => {
        const result = await Swal.fire({
            icon: 'question',
            title: t('courseMgmt.confirmBulkDeleteTitle', 'Confirm Bulk Delete'),
            text: t('courseMgmt.confirmBulkDelete', `Are you sure you want to delete ${selectedCourses.length} selected courses?`),
            showCancelButton: true,
            confirmButtonText: t('common.delete', 'Delete'),
            cancelButtonText: t('common.cancel', 'Cancel'),
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }
        
        try {
            await Promise.all(selectedCourses.map(id => courseService.deleteCourse(id)));
            setSelectedCourses([]);
            await fetchCourses();
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Failed to bulk delete courses:", error);
            setError(t('courseMgmt.bulkDeleteError', 'Không thể xóa khóa học'));
        }
    };
    
    // Handle create course
    const handleCreateCourse = async (formData) => {
        try {
            await courseService.createCourse(formData);
            setShowCreateModal(false);
            await fetchCourses();
        } catch (error) {
            console.error("Failed to create course:", error);
            setError(t('courseMgmt.createError', 'Không thể tạo khóa học'));
        }
    };
    
    // Handle update course
    const handleUpdateCourse = async (formData) => {
        if (!currentCourse) return;
        
        try {
            await courseService.updateCourse(currentCourse.id, formData);
            setShowEditModal(false);
            setCurrentCourse(null);
            await fetchCourses();
        } catch (error) {
            console.error("Failed to update course:", error);
            setError(t('courseMgmt.updateError', 'Không thể cập nhật khóa học'));
        }
    };
    
    // Handle view students
    const handleViewStudents = async (course) => {
        setLoadingStudents(true);
        try {
            const students = await courseService.getCourseStudents(course.id);
            setCourseStudents(students);
            setCurrentCourse(course);
            setShowStudentsModal(true);
        } catch (error) {
            console.error("Failed to fetch course students:", error);
            setError(t('courseMgmt.fetchStudentsError', 'Không thể tải danh sách học viên'));
        } finally {
            setLoadingStudents(false);
        }
    };

    // Priority 2: Course Status Management
    const handlePublishCourse = async (course) => {
        try {
            await courseService.publishCourse(course.id);
            Swal.fire({
                icon: 'success',
                title: t('common.success', 'Success'),
                text: t('courseMgmt.publishedSuccess', 'Course has been published'),
                timer: 2000,
                showConfirmButton: false
            });
            await fetchCourses();
        } catch (error) {
            console.error("Failed to publish course:", error);
            Swal.fire({
                icon: 'error',
                title: t('common.error', 'Error'),
                text: t('courseMgmt.publishError', 'Unable to publish course'),
                confirmButtonColor: '#ef4444'
            });
        }
    };

    const handleUnpublishCourse = async (course) => {
        const result = await Swal.fire({
            icon: 'question',
            title: t('courseMgmt.unpublishTitle', 'Unpublish Course?'),
            text: t('courseMgmt.unpublishText', `Course ${course.name} will be reverted to draft status`),
            showCancelButton: true,
            confirmButtonText: t('courseMgmt.unpublish', 'Unpublish'),
            cancelButtonText: t('common.close', 'Close'),
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed) {
            try {
                await courseService.unpublishCourse(course.id);
                Swal.fire({
                    icon: 'success',
                    title: t('common.success', 'Success'),
                    text: t('courseMgmt.unpublishedSuccess', 'Course has been unpublished'),
                    timer: 2000,
                    showConfirmButton: false
                });
                await fetchCourses();
            } catch (error) {
                console.error("Failed to unpublish course:", error);
                Swal.fire({
                    icon: 'error',
                    title: t('common.error', 'Error'),
                    text: t('courseMgmt.unpublishError', 'Unable to unpublish course'),
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };

    const handleArchiveCourse = async (course) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: t('courseMgmt.archiveTitle', 'Archive Course?'),
            text: t('courseMgmt.archiveText', `Course ${course.name} will be archived and no longer visible`),
            showCancelButton: true,
            confirmButtonText: t('courseMgmt.archive', 'Archive'),
            cancelButtonText: t('common.cancel', 'Cancel'),
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed) {
            try {
                await courseService.archiveCourse(course.id);
                Swal.fire({
                    icon: 'success',
                    title: t('common.success', 'Success'),
                    text: t('courseMgmt.archivedSuccess', 'Course has been archived'),
                    timer: 2000,
                    showConfirmButton: false
                });
                await fetchCourses();
            } catch (error) {
                console.error("Failed to archive course:", error);
                Swal.fire({
                    icon: 'error',
                    title: t('common.error', 'Error'),
                    text: t('courseMgmt.archiveError', 'Unable to archive course'),
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };
    
    // Reset filters
    const handleResetFilters = () => {
        setSearchTerm('');
        setLevelFilter('all');
        setStatusFilter('all');
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
    };
    
    // Render level badge
    const renderLevelBadge = (level) => {
        const colors = {
            'beginner': 'bg-yellow-100 text-yellow-700',
            'intermediate': 'bg-blue-100 text-blue-700',
            'advanced': 'bg-pink-100 text-pink-700'
        };
        return <Badge variant="level" className={colors[level] || 'bg-gray-100 text-gray-700'}>{level}</Badge>;
    };
    
    // Render status badge
    const renderStatusBadge = (status) => {
        const colors = {
            'PUBLISHED': 'bg-green-100 text-green-700',
            'DRAFT': 'bg-yellow-100 text-yellow-700',
            'ARCHIVED': 'bg-gray-100 text-gray-700',
            'active': 'bg-green-100 text-green-700',
            'inactive': 'bg-gray-100 text-gray-700',
            'draft': 'bg-yellow-100 text-yellow-700'
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
                    checked={selectedCourses.includes(row.id)}
                    onChange={() => handleSelectCourse(row.id)}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
            )
        },
        {
            key: 'code',
            header: t('courseMgmt.code', 'Mã'),
            sortable: true,
            render: (row) => <span className="font-mono text-sm text-gray-600">{row.code}</span>
        },
        {
            key: 'name',
            header: t('courseMgmt.name', 'Tên khóa học'),
            sortable: true,
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.name}</div>
                    <div className="text-sm text-gray-500">{row.description}</div>
                </div>
            )
        },
        {
            key: 'level',
            header: t('courseMgmt.level', 'Trình độ'),
            sortable: true,
            render: (row) => renderLevelBadge(row.level)
        },
        {
            key: 'duration',
            header: t('courseMgmt.duration', 'Thời lượng'),
            sortable: true,
            render: (row) => <span className="text-gray-600">{row.duration} {t('common.hours', 'giờ')}</span>
        },
        {
            key: 'price',
            header: t('courseMgmt.price', 'Giá'),
            sortable: true,
            render: (row) => <span className="text-gray-600">{row.price.toLocaleString()} {t('common.vnd', 'VND')}</span>
        },
        {
            key: 'status',
            header: t('courseMgmt.status', 'Trạng thái'),
            sortable: true,
            render: (row) => renderStatusBadge(row.status)
        },
        {
            key: 'actions',
            header: t('courseMgmt.actions', 'Thao tác'),
            width: '200px',
            render: (row) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        icon="👥"
                        onClick={() => handleViewStudents(row)}
                    >
                        {t('courseMgmt.students', 'Học viên')}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        icon="✏️"
                        onClick={() => {
                            setCurrentCourse(row);
                            setShowEditModal(true);
                        }}
                    >
                        {t('courseMgmt.edit', 'Sửa')}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        icon="🗑️"
                        onClick={() => handleDelete(row)}
                    >
                        {t('courseMgmt.delete', 'Xóa')}
                    </Button>
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
                    title={t('courseMgmt.title', 'Quản Lý Khóa Học')}
                    subtitle={t('courseMgmt.subtitle', 'Quản lý tất cả khóa học trên hệ thống')}
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
                title={t('courseMgmt.title', 'Quản Lý Khóa Học')}
                subtitle={t('courseMgmt.subtitle', 'Quản lý tất cả khóa học trên hệ thống')}
            >
                <PageActions>
                    <Button
                        variant="primary"
                        icon="➕"
                        onClick={() => setShowCreateModal(true)}
                    >
                        {t('courseMgmt.addCourse', 'Thêm Khóa Học')}
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
                            placeholder={t('courseMgmt.searchPlaceholder', 'Tìm kiếm theo tên hoặc mã...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon="🔍"
                        />
                    </div>
                    
                    {/* Level Filter */}
                    <div>
                        <Input
                            type="select"
                            label={t('courseMgmt.levelFilter', 'Lọc theo trình độ')}
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            icon="📊"
                        >
                            <option value="all">{t('courseMgmt.allLevels', 'Tất cả')}</option>
                            <option value="beginner">{t('courseMgmt.beginner', 'TOPIK I')}</option>
                            <option value="intermediate">{t('courseMgmt.intermediate', 'TOPIK II')}</option>
                            <option value="advanced">{t('courseMgmt.advanced', 'ESP')}</option>
                        </Input>
                    </div>
                    
                    {/* Status Filter */}
                    <div>
                        <Input
                            type="select"
                            label={t('courseMgmt.statusFilter', 'Lọc theo trạng thái')}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            icon="📊"
                        >
                            <option value="all">{t('courseMgmt.allStatuses', 'Tất cả')}</option>
                            <option value="PUBLISHED">{t('courseMgmt.published', 'Đã công bố')}</option>
                            <option value="DRAFT">{t('courseMgmt.draft', 'Bản nháp')}</option>
                            <option value="ARCHIVED">{t('courseMgmt.archived', 'Đã lưu trữ')}</option>
                        </Input>
                    </div>

                    {/* Sort */}
                    <div>
                        <Input
                            type="select"
                            label={t('courseMgmt.sortBy', 'Sắp xếp theo')}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            icon="📊"
                        >
                            <option value="name">{t('courseMgmt.name', 'Tên')}</option>
                            <option value="code">{t('courseMgmt.code', 'Mã')}</option>
                            <option value="level">{t('courseMgmt.level', 'Trình độ')}</option>
                            <option value="price">{t('courseMgmt.price', 'Giá')}</option>
                            <option value="duration">{t('courseMgmt.duration', 'Thời lượng')}</option>
                        </Input>
                    </div>
                    
                    {/* Sort Order */}
                    <div>
                        <Input
                            type="select"
                            label={t('courseMgmt.sortOrder', 'Thứ tự')}
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            icon="⬆️⬇️"
                        >
                            <option value="asc">{t('courseMgmt.ascending', 'Tăng dần')}</option>
                            <option value="desc">{t('courseMgmt.descending', 'Giảm dần')}</option>
                        </Input>
                    </div>
                    
                    {/* Reset Button */}
                    <div className="flex items-end">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleResetFilters}
                        >
                            {t('courseMgmt.resetFilters', 'Đặt lại')}
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedCourses.length > 0 && (
                <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-700">
                        {t('courseMgmt.selectedCount', 'Đã chọn')} <span className="font-bold">{selectedCourses.length}</span> {t('courseMgmt.courses', 'khóa học')}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setShowDeleteModal(true)}
                            icon="🗑️"
                        >
                            {t('courseMgmt.bulkDelete', 'Xóa đã chọn')}
                        </Button>
                    </div>
                </div>
            )}
            
            {/* Courses Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Table
                    columns={columns}
                    data={courses}
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
                title={t('courseMgmt.deleteConfirmTitle', 'Xác nhận xóa')}
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
                    {t('courseMgmt.deleteConfirmMessage', `Bạn có chắc chắn muốn xóa ${selectedCourses.length > 1 ? `${selectedCourses.length} khóa học đã chọn?` : 'khóa học này?'} Hành động này không thể hoàn tác.`)}
                </p>
            </Modal>
            
            {/* Create Course Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={t('courseMgmt.createCourseTitle', 'Tạo Khóa Học Mới')}
                size="lg"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                            {t('common.cancel', 'Hủy')}
                        </Button>
                        <Button variant="primary" onClick={() => {
                            const form = document.getElementById('createCourseForm');
                            if (form) {
                                const formData = new FormData(form);
                                const data = {
                                    name: formData.get('name'),
                                    code: formData.get('code'),
                                    description: formData.get('description'),
                                    level: formData.get('level'),
                                    duration: parseInt(formData.get('duration')) || 0,
                                    price: parseFloat(formData.get('price')) || 0
                                };
                                handleCreateCourse(data);
                            }
                        }}>
                            {t('common.create', 'Tạo')}
                        </Button>
                    </>
                }
            >
                <form id="createCourseForm" className="space-y-4">
                    <Input
                        type="text"
                        name="name"
                        label={t('courseMgmt.name', 'Tên khóa học')}
                        placeholder={t('courseMgmt.namePlaceholder', 'Nhập tên khóa học...')}
                        required
                    />
                    <Input
                        type="text"
                        name="code"
                        label={t('courseMgmt.code', 'Mã khóa học')}
                        placeholder={t('courseMgmt.codePlaceholder', 'Nhập mã khóa học...')}
                        required
                    />
                    <Input
                        type="textarea"
                        name="description"
                        label={t('courseMgmt.description', 'Mô tả')}
                        placeholder={t('courseMgmt.descriptionPlaceholder', 'Nhập mô tả...')}
                        rows={3}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="select"
                            name="level"
                            label={t('courseMgmt.level', 'Trình độ')}
                            placeholder={t('courseMgmt.levelPlaceholder', 'Chọn trình độ...')}
                            required
                        >
                            <option value="beginner">{t('courseMgmt.beginner', 'TOPIK I')}</option>
                            <option value="intermediate">{t('courseMgmt.intermediate', 'TOPIK II')}</option>
                            <option value="advanced">{t('courseMgmt.advanced', 'ESP')}</option>
                        </Input>
                        <Input
                            type="number"
                            name="duration"
                            label={t('courseMgmt.duration', 'Thời lượng (giờ)')}
                            placeholder="0"
                            min="0"
                            required
                        />
                    </div>
                    <Input
                        type="number"
                        name="price"
                        label={t('courseMgmt.price', 'Giá (VND)')}
                        placeholder="0"
                        min="0"
                        required
                    />
                </form>
            </Modal>
            
            {/* Edit Course Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setCurrentCourse(null);
                }}
                title={t('courseMgmt.editCourseTitle', 'Sửa Thông Tin Khóa Học')}
                size="lg"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => {
                            setShowEditModal(false);
                            setCurrentCourse(null);
                        }}>
                            {t('common.cancel', 'Hủy')}
                        </Button>
                        <Button variant="primary" onClick={() => {
                            const form = document.getElementById('editCourseForm');
                            if (form && currentCourse) {
                                const formData = new FormData(form);
                                const data = {
                                    name: formData.get('name'),
                                    code: formData.get('code'),
                                    description: formData.get('description'),
                                    level: formData.get('level'),
                                    duration: parseInt(formData.get('duration')) || 0,
                                    price: parseFloat(formData.get('price')) || 0
                                };
                                handleUpdateCourse(data);
                            }
                        }}>
                            {t('common.save', 'Lưu thay đổi')}
                        </Button>
                    </>
                }
            >
                {currentCourse && (
                    <form id="editCourseForm" className="space-y-4">
                        <Input
                            type="text"
                            name="name"
                            label={t('courseMgmt.name', 'Tên khóa học')}
                            defaultValue={currentCourse.name}
                            placeholder={t('courseMgmt.namePlaceholder', 'Nhập tên khóa học...')}
                            required
                        />
                        <Input
                            type="text"
                            name="code"
                            label={t('courseMgmt.code', 'Mã khóa học')}
                            defaultValue={currentCourse.code}
                            placeholder={t('courseMgmt.codePlaceholder', 'Nhập mã khóa học...')}
                            required
                        />
                        <Input
                            type="textarea"
                            name="description"
                            label={t('courseMgmt.description', 'Mô tả')}
                            defaultValue={currentCourse.description}
                            placeholder={t('courseMgmt.descriptionPlaceholder', 'Nhập mô tả...')}
                            rows={3}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="select"
                                name="level"
                                label={t('courseMgmt.level', 'Trình độ')}
                                defaultValue={currentCourse.level}
                                placeholder={t('courseMgmt.levelPlaceholder', 'Chọn trình độ...')}
                                required
                            >
                                <option value="beginner">{t('courseMgmt.beginner', 'TOPIK I')}</option>
                                <option value="intermediate">{t('courseMgmt.intermediate', 'TOPIK II')}</option>
                                <option value="advanced">{t('courseMgmt.advanced', 'ESP')}</option>
                            </Input>
                            <Input
                                type="number"
                                name="duration"
                                label={t('courseMgmt.duration', 'Thời lượng (giờ)')}
                                defaultValue={currentCourse.duration}
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>
                        <Input
                            type="number"
                            name="price"
                            label={t('courseMgmt.price', 'Giá (VND)')}
                            defaultValue={currentCourse.price}
                            placeholder="0"
                            min="0"
                            required
                        />
                    </form>
                )}
            </Modal>
            
            {/* View Students Modal */}
            <Modal
                isOpen={showStudentsModal}
                onClose={() => {
                    setShowStudentsModal(false);
                    setCurrentCourse(null);
                    setCourseStudents([]);
                }}
                title={t('courseMgmt.studentsTitle', `Học viên của ${currentCourse?.name || ''}`)}
                size="xl"
                footer={
                    <Button variant="ghost" onClick={() => {
                        setShowStudentsModal(false);
                        setCurrentCourse(null);
                        setCourseStudents([]);
                    }}>
                        {t('common.close', 'Đóng')}
                    </Button>
                }
            >
                {loadingStudents ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : courseStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {t('courseMgmt.noStudents', 'Chưa có học viên nào trong khóa học này')}
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('courseMgmt.studentName', 'Tên học viên')}</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('courseMgmt.studentEmail', 'Email')}</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('courseMgmt.studentStatus', 'Trạng thái')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseStudents.map((student, index) => (
                                    <tr key={index} className="border-b border-gray-100">
                                        <td className="px-4 py-3">{student.name}</td>
                                        <td className="px-4 py-3">{student.email}</td>
                                        <td className="px-4 py-3">
                                            {renderStatusBadge(student.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>
            
            <Footer />
        </PageContainer>
    );
};

export default CourseManagement;
