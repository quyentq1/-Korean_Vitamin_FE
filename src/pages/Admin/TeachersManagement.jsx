import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Badge,
  Table
} from '../../components/ui';
import Swal from 'sweetalert2';

/**
 * TeachersManagement - Quản lý Teachers cho Admin
 */
const TeachersManagement = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      // TODO: Gọi API thực tế
      // const data = await adminService.getTeachers();

      // Mock data
      const mockTeachers = [
        {
          id: 1,
          username: 'teacher.kim',
          fullName: 'Kim Min Jun',
          email: 'kim.minjun@koreanvitamin.com',
          phone: '0901234567',
          status: 'ACTIVE',
          specialization: 'TOPIK I, TOPIK II',
          courses: 5,
          students: 156,
          rating: 4.8,
          experience: 5,
          joinDate: '2021-03-15',
          lastActive: '2026-03-23T09:30:00',
          qualifications: ['Chứng chỉ TOPIK Level 6', 'Bằng Cử nhân Ngôn ngữ Hàn'],
          bio: 'Giảng viên giàu kinh nghiệm với phương pháp giảng dạy hiện đại.'
        },
        {
          id: 2,
          username: 'teacher.lee',
          fullName: 'Lee Su Jin',
          email: 'lee.sujin@koreanvitamin.com',
          phone: '0901234568',
          status: 'ACTIVE',
          specialization: 'Ngữ pháp, Chữ Hán',
          courses: 3,
          students: 89,
          rating: 4.9,
          experience: 7,
          joinDate: '2019-06-20',
          lastActive: '2026-03-23T08:15:00',
          qualifications: ['Thạc sĩ Ngôn ngữ Hàn', 'Chứng chỉ sư phạm'],
          bio: 'Chuyên gia về ngữ pháp và chữ Hán Hàn Quốc.'
        },
        {
          id: 3,
          username: 'teacher.park',
          fullName: 'Park Ji Hoon',
          email: 'park.jihoon@koreanvitamin.com',
          phone: '0901234569',
          status: 'INACTIVE',
          specialization: 'Nghe hiểu, Nói',
          courses: 2,
          students: 45,
          rating: 4.7,
          experience: 3,
          joinDate: '2023-01-10',
          lastActive: '2026-03-20T14:20:00',
          qualifications: ['Chứng chỉ TOPIK Level 6'],
          bio: 'Giảng viên chuyên về kỹ năng nghe và nói.'
        },
        {
          id: 4,
          username: 'teacher.choi',
          fullName: 'Choi Soo Young',
          email: 'choi.sooyoung@koreanvitamin.com',
          phone: '0901234570',
          status: 'PENDING',
          specialization: 'Đọc hiểu, Viết',
          courses: 0,
          students: 0,
          rating: 0,
          experience: 2,
          joinDate: '2026-03-22',
          lastActive: null,
          qualifications: ['Chứng chỉ TOPIK Level 5'],
          bio: 'Giảng viên mới đăng ký.'
        }
      ];

      setTeachers(mockTeachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (teacherId, newStatus) => {
    try {
      // TODO: Gọi API thực tế
      // await adminService.updateTeacherStatus(teacherId, newStatus);

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: `Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} giáo viên`,
        confirmButtonColor: '#667eea',
      });

      fetchTeachers();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể cập nhật trạng thái giáo viên',
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa giáo viên này không?',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#667eea',
    });

    if (result.isConfirmed) {
      try {
        // TODO: Gọi API thực tế
        // await adminService.deleteTeacher(teacherId);

        Swal.fire({
          icon: 'success',
          title: 'Đã xóa',
          text: 'Giáo viên đã được xóa thành công',
          confirmButtonColor: '#667eea',
        });

        fetchTeachers();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể xóa giáo viên',
          confirmButtonColor: '#d33',
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success" size="sm">✅ Hoạt động</Badge>;
      case 'INACTIVE':
        return <Badge variant="secondary" size="sm">⏸️ Không hoạt động</Badge>;
      case 'PENDING':
        return <Badge variant="warning" size="sm">⏳ Chờ duyệt</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch =
      teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'ALL' || teacher.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="wide">
      <PageHeader
        title={t('admin.teachers.title', 'Quản lý Giáo viên')}
        subtitle={t('admin.teachers.subtitle', 'Quản lý thông tin và hoạt động của giáo viên')}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng giáo viên</p>
              <p className="text-3xl font-bold mt-1">{teachers.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Đang hoạt động</p>
              <p className="text-3xl font-bold mt-1">{teachers.filter(t => t.status === 'ACTIVE').length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Chờ duyệt</p>
              <p className="text-3xl font-bold mt-1">{teachers.filter(t => t.status === 'PENDING').length}</p>
            </div>
            <Clock className="w-12 h-12 text-amber-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Đánh giá TB</p>
              <p className="text-3xl font-bold mt-1">
                {teachers.length > 0
                  ? (teachers.reduce((sum, t) => sum + (t.rating || 0), 0) / teachers.length).toFixed(1)
                  : '0'}
              </p>
            </div>
            <Award className="w-12 h-12 text-purple-200" />
          </div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm giáo viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
              <option value="PENDING">Chờ duyệt</option>
            </select>
          </div>

          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Thêm giáo viên
          </Button>
        </div>
      </Card>

      {/* Teachers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card
            key={teacher.id}
            className="hover:shadow-lg transition-all duration-300"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0">
                  {teacher.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {teacher.fullName}
                    </h3>
                    {getStatusBadge(teacher.status)}
                  </div>
                  <p className="text-sm text-gray-600">@{teacher.username}</p>
                  <p className="text-xs text-gray-500">{teacher.email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BookOpen className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Khóa học</p>
                  <p className="text-sm font-bold text-gray-900">{teacher.courses}</p>
                </div>
                <div className="text-center">
                  <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Học viên</p>
                  <p className="text-sm font-bold text-gray-900">{teacher.students}</p>
                </div>
                <div className="text-center">
                  <Award className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Đánh giá</p>
                  <p className="text-sm font-bold text-gray-900">{teacher.rating || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Kinh nghiệm</p>
                  <p className="text-sm font-bold text-gray-900">{teacher.exams} năm</p>
                </div>
              </div>

              {/* Specialization */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Chuyên môn:</p>
                <div className="flex flex-wrap gap-1">
                  {teacher.specialization.split(',').map((spec, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-lg"
                    >
                      {spec.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedTeacher(teacher);
                    setShowDetailModal(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Chi tiết
                </Button>
                <Button variant="secondary" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                {teacher.status === 'ACTIVE' && (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleStatusChange(teacher.id, 'INACTIVE')}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
                {teacher.status === 'INACTIVE' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleStatusChange(teacher.id, 'ACTIVE')}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
                {teacher.status === 'PENDING' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleStatusChange(teacher.id, 'ACTIVE')}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="error"
                      size="sm"
                      onClick={() => handleDeleteTeacher(teacher.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <Card className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Không tìm thấy giáo viên nào</p>
          <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc thêm giáo viên mới</p>
        </Card>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Chi tiết giáo viên</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-3xl">
                  {selectedTeacher.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedTeacher.fullName}</h4>
                  <p className="text-gray-600">@{selectedTeacher.username}</p>
                  {getStatusBadge(selectedTeacher.status)}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Thông tin liên hệ</h5>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Email:</span> {selectedTeacher.email}</p>
                  <p><span className="text-gray-500">SĐT:</span> {selectedTeacher.phone}</p>
                </div>
              </div>

              {/* Teaching Info */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Thông tin giảng dạy</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><span className="text-gray-500">Chuyên môn:</span> {selectedTeacher.specialization}</p>
                  <p><span className="text-gray-500">Kinh nghiệm:</span> {selectedTeacher.experience} năm</p>
                  <p><span className="text-gray-500">Số khóa học:</span> {selectedTeacher.courses}</p>
                  <p><span className="text-gray-500">Học viên:</span> {selectedTeacher.students}</p>
                  <p><span className="text-gray-500">Đánh giá:</span> {selectedTeacher.rating}/5.0</p>
                  <p><span className="text-gray-500">Ngày tham gia:</span> {new Date(selectedTeacher.joinDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Bằng cấp</h5>
                <div className="space-y-1">
                  {selectedTeacher.qualifications.map((qual, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{qual}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Giới thiệu</h5>
                <p className="text-sm text-gray-600">{selectedTeacher.bio}</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                Đóng
              </Button>
              <Button variant="primary">
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default TeachersManagement;
