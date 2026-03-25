import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  TrendingUp,
  BarChart3,
  Users,
  BookOpen,
  Award
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Badge
} from '../../components/ui';

/**
 * ReportsManagement - Quản lý Báo cáo cho Admin
 */
const ReportsManagement = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filterType, filterStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // TODO: Gọi API thực tế
      // const data = await adminService.getReports(filterType, filterStatus);

      // Mock data
      const mockReports = [
        {
          id: 1,
          type: 'BUG_REPORT',
          typeLabel: 'Báo cáo lỗi',
          title: 'Lỗi hiển thị bài kiểm tra',
          reporter: {
            id: 201,
            fullName: 'Nguyễn Văn A',
            email: 'student.a@email.com',
            role: 'STUDENT',
            avatar: 'N'
          },
          description: 'Khi làm bài kiểm tra TOPIK I, câu hỏi số 15 không hiển thị hình ảnh. Em đã thử refresh nhưng vẫn không được.',
          priority: 'HIGH',
          status: 'PENDING',
          submittedAt: '2026-03-23T08:30:00',
          category: 'Technical',
          attachments: ['screenshot_error.png']
        },
        {
          id: 2,
          type: 'FEEDBACK',
          typeLabel: 'Phản hồi',
          title: 'Giao diện học tập rất tốt!',
          reporter: {
            id: 202,
            fullName: 'Trần Thị B',
            email: 'student.b@email.com',
            role: 'STUDENT',
            avatar: 'T'
          },
          description: 'Em rất thích giao diện học tập mới, rất trực quan và dễ sử dụng. Tuy nhiên, em mong muốn có thêm bài tập về nhà tự động.',
          priority: 'LOW',
          status: 'RESOLVED',
          submittedAt: '2026-03-22T14:20:00',
          category: 'Feature Request',
          attachments: []
        },
        {
          id: 3,
          type: 'ABUSE_REPORT',
          typeLabel: 'Báo cáo vi phạm',
          title: 'Người dùng spam trong bình luận',
          reporter: {
            id: 2,
            fullName: 'Lee Su Jin',
            email: 'lee.sujin@koreanvitamin.com',
            role: 'TEACHER',
            avatar: 'L'
          },
          description: 'Học viên username "student_spam" đang spam bình luận không liên quan trong bài giảng. Mong admin xử lý.',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          submittedAt: '2026-03-21T10:15:00',
          category: 'Community',
          attachments: ['spam_screenshot.png'],
          reportedUser: {
            id: 301,
            username: 'student_spam',
            fullName: 'Unknown'
          }
        },
        {
          id: 4,
          type: 'BUG_REPORT',
          typeLabel: 'Báo cáo lỗi',
          title: 'Không thể nộp bài viết',
          reporter: {
            id: 203,
            fullName: 'Lê Văn C',
            email: 'student.c@email.com',
            role: 'STUDENT',
            avatar: 'L'
          },
          description: 'Em click nộp bài nhưng hệ thống báo lỗi "Network Error". Đã thử nhiều lần nhưng không được.',
          priority: 'HIGH',
          status: 'PENDING',
          submittedAt: '2026-03-23T09:00:00',
          category: 'Technical',
          attachments: []
        },
        {
          id: 5,
          type: 'FEEDBACK',
          typeLabel: 'Phản hồi',
          title: 'Mong muốn thêm tính năng chat trực tiếp',
          reporter: {
            id: 204,
            fullName: 'Phạm Thị D',
            email: 'student.d@email.com',
            role: 'STUDENT',
            avatar: 'P'
          },
          description: 'Em mong muốn có tính năng chat trực tiếp với giáo viên để có thể hỏi bài nhanh hơn.',
          priority: 'MEDIUM',
          status: 'PENDING',
          submittedAt: '2026-03-20T16:45:00',
          category: 'Feature Request',
          attachments: []
        },
        {
          id: 6,
          type: 'ABUSE_REPORT',
          typeLabel: 'Báo cáo vi phạm',
          title: 'Giáo viên không phản hồi',
          reporter: {
            id: 205,
            fullName: 'Hoàng Văn E',
            email: 'student.e@email.com',
            role: 'STUDENT',
            avatar: 'H'
          },
          description: 'Em đã gửi email hỏi bài nhưng giáo viên không phản hồi sau 3 ngày.',
          priority: 'MEDIUM',
          status: 'RESOLVED',
          submittedAt: '2026-03-19T11:30:00',
          category: 'Service Quality',
          attachments: ['email_screenshot.png'],
          notes: 'Đã liên hệ giáo viên và giải quyết xong.'
        }
      ];

      let filtered = mockReports;

      if (filterType !== 'ALL') {
        filtered = filtered.filter(r => r.type === filterType);
      }

      if (filterStatus !== 'ALL') {
        filtered = filtered.filter(r => r.status === filterStatus);
      }

      setReports(filtered);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" size="sm">⏳ Chờ xử lý</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="info" size="sm">🔄 Đang xử lý</Badge>;
      case 'RESOLVED':
        return <Badge variant="success" size="sm">✅ Đã giải quyết</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="error" size="sm">🔴 Cao</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning" size="sm">🟡 Trung bình</Badge>;
      case 'LOW':
        return <Badge variant="secondary" size="sm">🟢 Thấp</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'BUG_REPORT':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'FEEDBACK':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'ABUSE_REPORT':
        return <Shield className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporter.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
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
        title={t('admin.reports.title', 'Quản lý Báo cáo')}
        subtitle={t('admin.reports.subtitle', 'Xử lý báo cáo, lỗi và phản hồi từ người dùng')}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng báo cáo</p>
              <p className="text-3xl font-bold mt-1">{reports.length}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Chờ xử lý</p>
              <p className="text-3xl font-bold mt-1">{reports.filter(r => r.status === 'PENDING').length}</p>
            </div>
            <Clock className="w-12 h-12 text-amber-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Đang xử lý</p>
              <p className="text-3xl font-bold mt-1">{reports.filter(r => r.status === 'IN_PROGRESS').length}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Đã giải quyết</p>
              <p className="text-3xl font-bold mt-1">{reports.filter(r => r.status === 'RESOLVED').length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Ưu tiên cao</p>
              <p className="text-3xl font-bold mt-1">{reports.filter(r => r.priority === 'HIGH').length}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-200" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm báo cáo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="BUG_REPORT">Báo cáo lỗi</option>
              <option value="FEEDBACK">Phản hồi</option>
              <option value="ABUSE_REPORT">Vi phạm</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã giải quyết</option>
            </select>

            <Button variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card
            key={report.id}
            className={`hover:shadow-lg transition-all duration-300 ${
              report.priority === 'HIGH' ? 'border-l-4 border-l-red-500' :
              report.status === 'PENDING' ? 'border-l-4 border-l-amber-500' :
              ''
            }`}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  report.type === 'BUG_REPORT' ? 'bg-red-100' :
                  report.type === 'FEEDBACK' ? 'bg-green-100' :
                  'bg-amber-100'
                }`}>
                  {getTypeIcon(report.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-900">{report.title}</h3>
                        {getStatusBadge(report.status)}
                        {getPriorityBadge(report.priority)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {report.typeLabel} • #{report.id}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 shrink-0 ml-4">
                      {new Date(report.submittedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  {/* Reporter Info */}
                  <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {report.reporter.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{report.reporter.fullName}</p>
                        <Badge variant="secondary" size="sm">
                          {report.reporter.role === 'STUDENT' ? 'Học viên' : 'Giáo viên'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{report.reporter.email}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 line-clamp-2">{report.description}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {report.category}
                    </span>
                    {report.attachments?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {report.attachments.length} tệp đính kèm
                      </span>
                    )}
                    {report.reportedUser && (
                      <span className="flex items-center gap-1 text-red-600">
                        <User className="w-3 h-3" />
                        Người bị báo cáo: {report.reportedUser.username}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      {report.status === 'PENDING' && (
                        <Button variant="secondary" size="sm">
                          Bắt đầu xử lý
                        </Button>
                      )}
                      {report.status === 'IN_PROGRESS' && (
                        <Button variant="success" size="sm">
                          Đánh dấu đã xong
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Không có báo cáo nào</p>
          <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc để xem các báo cáo khác</p>
        </Card>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Chi tiết báo cáo</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Type & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(selectedReport.type)}
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedReport.title}</h4>
                    <p className="text-sm text-gray-600">
                      {selectedReport.typeLabel} • #{selectedReport.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedReport.status)}
                  {getPriorityBadge(selectedReport.priority)}
                </div>
              </div>

              {/* Reporter */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-3">Người báo cáo</h5>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedReport.reporter.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedReport.reporter.fullName}</p>
                    <p className="text-sm text-gray-600">{selectedReport.reporter.email}</p>
                    <Badge variant="secondary" size="sm" className="mt-1">
                      {selectedReport.reporter.role === 'STUDENT' ? 'Học viên' : 'Giáo viên'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Reported User (if abuse report) */}
              {selectedReport.reportedUser && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="font-semibold text-red-900 mb-3">Người bị báo cáo</h5>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedReport.reportedUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-red-900">{selectedReport.reportedUser.username}</p>
                      <p className="text-sm text-red-700">{selectedReport.reportedUser.fullName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Nội dung</h5>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedReport.description}
                </p>
              </div>

              {/* Attachments */}
              {selectedReport.attachments?.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Tài liệu đính kèm</h5>
                  <div className="space-y-2">
                    {selectedReport.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <span className="text-sm text-gray-700">{file}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedReport.notes && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-semibold text-green-900 mb-2">Ghi chú xử lý</h5>
                  <p className="text-sm text-green-800">{selectedReport.notes}</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Timeline</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Ngày gửi: {new Date(selectedReport.submittedAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                Đóng
              </Button>
              <div className="flex gap-2">
                {selectedReport.status === 'PENDING' && (
                  <>
                    <Button variant="secondary">
                      Bắt đầu xử lý
                    </Button>
                  </>
                )}
                {selectedReport.status === 'IN_PROGRESS' && (
                  <Button variant="success">
                    Đánh dấu đã xong
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ReportsManagement;
