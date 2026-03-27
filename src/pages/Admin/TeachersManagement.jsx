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
      setError('Không thể tải danh sách giáo viên');
    } finally {
      setLoading(false);
    }
  }, []);

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
    const action = teacher.active ? 'khóa' : 'mở khóa';
    const result = await Swal.fire({
      icon: 'question',
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản?`,
      text: `Bạn có chắc chắn muốn ${action} tài khoản của ${teacher.fullName}?`,
      showCancelButton: true,
      confirmButtonText: 'Có, đồng ý',
      cancelButtonText: 'Hủy',
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
        Swal.fire('Thành công', `Đã ${action} tài khoản`, 'success');
      } catch (err) {
        Swal.fire('Lỗi', 'Không thể thay đổi trạng thái tài khoản', 'error');
      }
    }
  };

  // Handle delete
  const handleDelete = async (teacher) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Xóa giáo viên?',
      text: `Bạn có chắc chắn muốn xóa ${teacher.fullName}? Hành động này không thể hoàn tác.`,
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc3545',
    });

    if (result.isConfirmed) {
      try {
        await axiosClient.delete(`/admin/users/${teacher.id}`);
        await fetchTeachers();
        Swal.fire('Thành công', 'Đã xóa giáo viên', 'success');
      } catch (err) {
        Swal.fire('Lỗi', 'Không thể xóa giáo viên', 'error');
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
        title="Quản lý Giáo viên"
        subtitle="Quản lý thông tin và phân công giáo viên"
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
              <p className="text-blue-100 text-sm font-medium">Tổng giáo viên</p>
              <p className="text-3xl font-bold mt-1">{teachers.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Đang hoạt động</p>
              <p className="text-3xl font-bold mt-1">{teachers.filter(t => t.active).length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Tài khoản bị khóa</p>
              <p className="text-3xl font-bold mt-1">{teachers.filter(t => !t.active).length}</p>
            </div>
            <Lock className="w-12 h-12 text-amber-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Đang phân công</p>
              <p className="text-3xl font-bold mt-1">
                {teachers.reduce((sum, t) => sum + (t.assignedCourses || 0), 0)}
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
              placeholder="Tìm kiếm giáo viên..."
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
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Bị khóa</option>
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
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="courses-desc">Số khóa học ↓</option>
              <option value="courses-asc">Số khóa học ↑</option>
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
            </select>

            <Button
              variant="outline"
              onClick={fetchTeachers}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
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
                  Giáo viên
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Khóa học
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">Không tìm thấy giáo viên nào</p>
                    <p className="text-sm">Thử thay đổi điều kiện tìm kiếm</p>
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
                        <span className="text-sm text-gray-500">khóa học</span>
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
                            Hoạt động
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            Đã khóa
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
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(teacher)}
                          title={teacher.active ? 'Khóa tài khoản' : 'Mở khóa'}
                          className={teacher.active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {teacher.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(teacher)}
                          title="Xóa"
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
                  <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                  <p className="font-medium">{selectedTeacher.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Số khóa học</p>
                  <p className="font-medium">{selectedTeacher.assignedCourses || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                  <Badge type={selectedTeacher.active ? 'success' : 'danger'}>
                    {selectedTeacher.active ? 'Hoạt động' : 'Đã khóa'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày tham gia</p>
                  <p className="font-medium">
                    {selectedTeacher.createdAt ? new Date(selectedTeacher.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Đăng nhập lần cuối</p>
                  <p className="font-medium">
                    {selectedTeacher.lastLogin ? new Date(selectedTeacher.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  navigate(`/admin/teachers/${selectedTeacher.id}`);
                }}
              >
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeachersManagement;
