import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Download, 
  ArrowLeft, 
  Filter, 
  Search, 
  Users, 
  Calendar, 
  Clock, 
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// UI Components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';

// Services
import teacherService from '../../services/teacherService';

const ExamAttempts = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch attempts
  useEffect(() => {
    fetchAttempts();
  }, [id]);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getExamAttempts(id);
      setAttempts(response || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError(t('exam.attemptsFetchError', 'Lỗi khi tải danh sách lần thi.'));
    } finally {
      setLoading(false);
    }
  };

  // Filter attempts
  const filteredAttempts = attempts.filter(attempt => {
    const matchesSearch = attempt.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attempt.studentCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || attempt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort attempts
  const sortedAttempts = [...filteredAttempts].sort((a, b) => {
    let comparison = 0;
    if (a[sortBy] < b[sortBy]) comparison = -1;
    if (a[sortBy] > b[sortBy]) comparison = 1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get status badge
  const getStatusBadge = (attempt) => {
    const statusConfig = {
      IN_PROGRESS: { variant: 'info', label: t('exam.status.inProgress', 'Đang làm') },
      SUBMITTED: { variant: 'warning', label: t('exam.status.submitted', 'Đã nộp') },
      GRADED: { variant: 'success', label: t('exam.status.graded', 'Đã chấm') },
      REVIEWED: { variant: 'purple', label: t('exam.status.reviewed', 'Đã xem') }
    };
    
    const config = statusConfig[attempt.status] || statusConfig.IN_PROGRESS;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Get score trend
  const getScoreTrend = (attempt) => {
    if (attempt.score === null || attempt.score === undefined) return null;
    
    // Compare with average
    const avgScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length;
    
    if (attempt.score > avgScore) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (attempt.score < avgScore) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle export
  const handleExport = async () => {
    setExporting(true);
    try {
      // Create CSV content
      const headers = [
        t('exam.studentName', 'Tên sinh viên'),
        t('exam.studentCode', 'Mã sinh viên'),
        t('exam.score', 'Điểm số'),
        t('exam.status', 'Trạng thái'),
        t('exam.submittedAt', 'Ngày nộp'),
        t('exam.completedAt', 'Ngày hoàn thành'),
        t('exam.timeSpent', 'Thời gian làm bài')
      ];
      
      const csvContent = [
        headers.join(','),
        ...sortedAttempts.map(attempt => [
          attempt.studentName || '',
          attempt.studentCode || '',
          attempt.score || 0,
          attempt.status || '',
          attempt.submittedAt || '',
          attempt.completedAt || '',
          attempt.timeSpent || ''
        ])
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exam-attempts-${id}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowExportModal(false);
    } catch (err) {
      console.error(err);
      setError(t('exam.exportError', 'Lỗi khi xuất file CSV.'));
    } finally {
      setExporting(false);
    }
  };

  // Get pagination data
  const paginatedAttempts = sortedAttempts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedAttempts.length / itemsPerPage);

  // Table columns
  const columns = [
    {
      key: 'studentName',
      title: t('exam.studentName', 'Tên sinh viên'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.studentName}</p>
          <p className="text-sm text-gray-500">{row.studentCode}</p>
        </div>
      )
    },
    {
      key: 'score',
      title: t('exam.score', 'Điểm số'),
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">{row.score || 0}</span>
          {getScoreTrend(row)}
        </div>
      )
    },
    {
      key: 'status',
      title: t('exam.status', 'Trạng thái'),
      sortable: true,
      render: (row) => getStatusBadge(row)
    },
    {
      key: 'submittedAt',
      title: t('exam.submittedAt', 'Ngày nộp'),
      sortable: true,
      render: (row) => (
        <div className="text-sm text-gray-600">
          {new Date(row.submittedAt).toLocaleDateString('vi-VN')}
        </div>
      )
    },
    {
      key: 'completedAt',
      title: t('exam.completedAt', 'Ngày hoàn thành'),
      sortable: true,
      render: (row) => (
        <div className="text-sm text-gray-600">
          {row.completedAt ? new Date(row.completedAt).toLocaleDateString('vi-VN') : '-'}
        </div>
      )
    },
    {
      key: 'timeSpent',
      title: t('exam.timeSpent', 'Thời gian làm bài'),
      sortable: true,
      render: (row) => (
        <div className="text-sm text-gray-600">
          {row.timeSpent ? `${row.timeSpent} ${t('exam.minutes', 'phút')}` : '-'}
        </div>
      )
    }
  ];

  // Calculate statistics
  const stats = {
    total: attempts.length,
    completed: attempts.filter(a => a.status === 'GRADED').length,
    inProgress: attempts.filter(a => a.status === 'IN_PROGRESS').length,
    submitted: attempts.filter(a => a.status === 'SUBMITTED').length,
    reviewed: attempts.filter(a => a.status === 'REVIEWED').length,
    averageScore: attempts.length > 0 
      ? (attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length).toFixed(1)
      : 0,
    highestScore: attempts.length > 0 
      ? Math.max(...attempts.map(a => a.score || 0))
      : 0,
    lowestScore: attempts.length > 0 
      ? Math.min(...attempts.map(a => a.score || 0))
      : 0
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('exam.attempts', 'Kết Quả Lần Thi')}
        subtitle={t('exam.attemptsSubtitle', 'Xem và quản lý kết quả sinh viên')}
        breadcrumbs={[
          { label: t('nav.home', 'Trang chủ'), href: '/' },
          { label: t('nav.teacher', 'Giáo viên'), href: '/teacher' },
          { label: t('exam.management', 'Quản Lý Bài Kiểm Tra'), href: '/exam-management' },
          { label: t('exam.attempts', 'Kết Quả Lần Thi') }
        ]}
        actions={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/exam-management')}
            >
              {t('common.back', 'Quay lại')}
            </Button>
            <Button
              variant="primary"
              icon={<Download className="w-4 h-4" />}
              onClick={() => setShowExportModal(true)}
            >
              {t('exam.exportCSV', 'Xuất CSV')}
            </Button>
          </div>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          icon={<AlertCircle className="w-5 h-5" />}
          className="mb-6"
          dismissible
          onDismiss={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">{t('exam.totalAttempts', 'Tổng lần thi')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-500">{t('exam.completed', 'Đã hoàn thành')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.averageScore}</p>
          <p className="text-sm text-gray-500">{t('exam.averageScore', 'Điểm trung bình')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.highestScore}</p>
          <p className="text-sm text-gray-500">{t('exam.highestScore', 'Điểm cao nhất')}</p>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">
              {t('exam.filters', 'Bộ Lọc')}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder={t('exam.searchStudentPlaceholder', 'Tìm kiếm theo tên hoặc mã sinh viên...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Status Filter */}
            <div>
              <Input
                type="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: t('exam.allStatus', 'Tất cả trạng thái') },
                  { value: 'IN_PROGRESS', label: t('exam.status.inProgress', 'Đang làm') },
                  { value: 'SUBMITTED', label: t('exam.status.submitted', 'Đã nộp') },
                  { value: 'GRADED', label: t('exam.status.graded', 'Đã chấm') },
                  { value: 'REVIEWED', label: t('exam.status.reviewed', 'Đã xem') }
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Attempts Table */}
      <Card>
        {loading ? (
          <div className="p-12 text-center">
            <Loading.PageLoading />
          </div>
        ) : sortedAttempts.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">
              {t('exam.noAttempts', 'Không tìm thấy lần thi nào')}
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={paginatedAttempts}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            pagination={{
              currentPage,
              totalPages,
              itemsPerPage,
              totalItems: sortedAttempts.length,
              onPageChange: (page) => setCurrentPage(page)
            }}
            emptyMessage={t('exam.noAttempts', 'Không tìm thấy lần thi nào')}
          />
        )}
      </Card>

      {/* Export Confirmation Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        size="md"
        title={t('exam.exportConfirmTitle', 'Xác Nhận Xuất CSV')}
      >
        <div className="space-y-4">
          <Alert variant="info">
            {t('exam.exportInfo', 'Xuất danh sách kết quả lần thi ra file CSV để phân tích thêm.')}
          </Alert>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              {t('exam.exportColumns', 'File sẽ bao gồm các cột:')}
            </p>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
              <li>{t('exam.studentName', 'Tên sinh viên')}</li>
              <li>{t('exam.studentCode', 'Mã sinh viên')}</li>
              <li>{t('exam.score', 'Điểm số')}</li>
              <li>{t('exam.status', 'Trạng thái')}</li>
              <li>{t('exam.submittedAt', 'Ngày nộp')}</li>
              <li>{t('exam.completedAt', 'Ngày hoàn thành')}</li>
              <li>{t('exam.timeSpent', 'Thời gian làm bài')}</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowExportModal(false)}
            >
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <Loading.Spinner size="sm" />
                  {t('exam.exporting', 'Đang xuất...')}
                </>
              ) : (
                t('exam.confirmExport', 'Xuất File')
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ExamAttempts;
