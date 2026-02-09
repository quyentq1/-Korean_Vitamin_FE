import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc, 
  CheckSquare, 
  Square, 
  FileText, 
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Edit3,
  CheckCheck
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

const GradingQueue = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Sort
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Batch selection
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modals
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchAction, setBatchAction] = useState('');
  
  // Fetch submissions
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getPendingGrading();
      // Transform data for UI
      const data = (response || []).map(att => ({
        id: att.id,
        studentName: att.student?.fullName || 'Unknown',
        studentCode: att.student?.studentCode || 'N/A',
        title: att.exam?.title || 'Untitled Exam',
        type: getAssignmentType(att.exam),
        submittedAt: att.submitTime,
        completedAt: att.completedAt,
        timeSpent: att.timeSpent,
        status: att.status,
        aiScore: att.aiScore || 0,
        aiSuggestions: att.aiSuggestions || [],
        className: att.class?.name || 'N/A'
      }));
      setSubmissions(data);
      setError('');
    } catch (err) {
      console.error('Failed to load grading queue', err);
      setError(t('grading.fetchError', 'Lỗi khi tải hàng đợi chấm.'));
    } finally {
      setLoading(false);
    }
  };

  // Get assignment type
  const getAssignmentType = (exam) => {
    if (!exam) return 'mixed';
    if (exam.type === 'WRITING') return 'writing';
    if (exam.type === 'SPEAKING') return 'speaking';
    return 'mixed';
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.studentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || sub.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && new Date(sub.submittedAt) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      matchesDate = matchesDate && new Date(sub.submittedAt) <= new Date(dateRange.end);
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Sort submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    let comparison = 0;
    if (a[sortBy] < b[sortBy]) comparison = -1;
    if (a[sortBy] > b[sortBy]) comparison = 1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(sortedSubmissions.map(s => s.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectSubmission = (id) => {
    if (selectedSubmissions.includes(id)) {
      setSelectedSubmissions(selectedSubmissions.filter(sid => sid !== id));
    } else {
      setSelectedSubmissions([...selectedSubmissions, id]);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { variant: 'warning', label: t('grading.status.pending', 'Chờ chấm') },
      GRADED: { variant: 'success', label: t('grading.status.graded', 'Đã chấm') },
      REVIEWED: { variant: 'info', label: t('grading.status.reviewed', 'Đã xem') }
    };
    
    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Get type badge
  const getTypeBadge = (type) => {
    const typeConfig = {
      writing: { variant: 'blue', label: t('grading.type.writing', 'Viết') },
      speaking: { variant: 'purple', label: t('grading.type.speaking', 'Nói') },
      mixed: { variant: 'gray', label: t('grading.type.mixed', 'Hỗn hợp') }
    };
    
    const config = typeConfig[type] || typeConfig.mixed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Handle batch action
  const handleBatchAction = (action) => {
    setBatchAction(action);
    setShowBatchModal(true);
  };

  const confirmBatchAction = async () => {
    try {
      // Implement batch action logic
      console.log(`Batch ${batchAction}:`, selectedSubmissions);
      setShowBatchModal(false);
      setSelectedSubmissions([]);
      setSelectAll(false);
      fetchSubmissions();
    } catch (err) {
      console.error('Batch action failed', err);
      setError(t('grading.batchActionError', 'Lỗi khi thực hiện hành động hàng loạt.'));
    }
  };

  // Get pagination data
  const paginatedSubmissions = sortedSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedSubmissions.length / itemsPerPage);

  // Table columns
  const columns = [
    {
      key: 'select',
      title: (
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2"
        >
          {selectAll ? (
            <CheckSquare className="w-5 h-5 text-primary-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400" />
          )}
        </button>
      ),
      render: (row) => (
        <button
          onClick={() => handleSelectSubmission(row.id)}
          className="flex items-center gap-2"
        >
          {selectedSubmissions.includes(row.id) ? (
            <CheckSquare className="w-5 h-5 text-primary-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400" />
          )}
        </button>
      )
    },
    {
      key: 'studentName',
      title: t('grading.student', 'Sinh viên'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.studentName}</p>
          <p className="text-sm text-gray-500">{row.studentCode}</p>
        </div>
      )
    },
    {
      key: 'title',
      title: t('grading.assignment', 'Bài tập'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-sm text-gray-500">{row.className}</p>
        </div>
      )
    },
    {
      key: 'type',
      title: t('grading.type', 'Loại'),
      sortable: true,
      render: (row) => getTypeBadge(row.type)
    },
    {
      key: 'submittedAt',
      title: t('grading.submittedAt', 'Ngày nộp'),
      sortable: true,
      render: (row) => (
        <div className="text-sm text-gray-600">
          {new Date(row.submittedAt).toLocaleDateString('vi-VN')}
        </div>
      )
    },
    {
      key: 'aiScore',
      title: t('grading.aiScore', 'Điểm AI'),
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-purple-600">{row.aiScore}%</span>
          {row.aiSuggestions.length > 0 && (
            <Badge variant="info" size="sm">
              {row.aiSuggestions.length} {t('grading.suggestions', 'gợi ý')}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: t('grading.status', 'Trạng thái'),
      sortable: true,
      render: (row) => getStatusBadge(row.status)
    }
  ];

  // Calculate statistics
  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'PENDING').length,
    graded: submissions.filter(s => s.status === 'GRADED').length,
    writing: submissions.filter(s => s.type === 'writing').length,
    speaking: submissions.filter(s => s.type === 'speaking').length,
    avgAiScore: submissions.length > 0 
      ? (submissions.reduce((sum, s) => sum + s.aiScore, 0) / submissions.length).toFixed(1)
      : 0
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('grading.title', 'Hàng Đợi Chấm Bài')}
        subtitle={t('grading.subtitle', 'Chấm bài viết và nói với hỗ trợ AI')}
        breadcrumbs={[
          { label: t('nav.home', 'Trang chủ'), href: '/' },
          { label: t('nav.teacher', 'Giáo viên'), href: '/teacher' },
          { label: t('grading.title', 'Hàng Đợi Chấm Bài') }
        ]}
        actions={
          <div className="flex gap-3">
            {selectedSubmissions.length > 0 && (
              <>
                <Button
                  variant="secondary"
                  icon={<CheckCheck className="w-4 h-4" />}
                  onClick={() => handleBatchAction('grade')}
                >
                  {t('grading.batchGrade', 'Chấm hàng loạt')}
                </Button>
                <Button
                  variant="secondary"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => handleBatchAction('export')}
                >
                  {t('grading.batchExport', 'Xuất hàng loạt')}
                </Button>
              </>
            )}
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
          <p className="text-sm text-gray-500">{t('grading.total', 'Tổng bài')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">{t('grading.pending', 'Chờ chấm')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
          <p className="text-sm text-gray-500">{t('grading.graded', 'Đã chấm')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.avgAiScore}%</p>
          <p className="text-sm text-gray-500">{t('grading.avgAiScore', 'Điểm AI TB')}</p>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">
              {t('grading.filters', 'Bộ Lọc')}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder={t('grading.searchPlaceholder', 'Tìm kiếm theo tên, mã sinh viên hoặc bài tập...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Type Filter */}
            <div>
              <Input
                type="select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: 'all', label: t('grading.allTypes', 'Tất cả loại') },
                  { value: 'writing', label: t('grading.type.writing', 'Viết') },
                  { value: 'speaking', label: t('grading.type.speaking', 'Nói') }
                ]}
              />
            </div>

            {/* Status Filter */}
            <div>
              <Input
                type="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: t('grading.allStatus', 'Tất cả trạng thái') },
                  { value: 'PENDING', label: t('grading.status.pending', 'Chờ chấm') },
                  { value: 'GRADED', label: t('grading.status.graded', 'Đã chấm') },
                  { value: 'REVIEWED', label: t('grading.status.reviewed', 'Đã xem') }
                ]}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('grading.dateFrom', 'Từ ngày')}
              </label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('grading.dateTo', 'Đến ngày')}
              </label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Submissions Table */}
      <Card>
        {loading ? (
          <div className="p-12 text-center">
            <Loading.PageLoading />
          </div>
        ) : sortedSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">
              {t('grading.noSubmissions', 'Không tìm thấy bài nộp nào')}
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={paginatedSubmissions}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            pagination={{
              currentPage,
              totalPages,
              itemsPerPage,
              totalItems: sortedSubmissions.length,
              onPageChange: (page) => setCurrentPage(page)
            }}
            emptyMessage={t('grading.noSubmissions', 'Không tìm thấy bài nộp nào')}
          />
        )}
      </Card>

      {/* Batch Action Confirmation Modal */}
      <Modal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        size="md"
        title={t('grading.batchActionTitle', 'Xác Nhận Hành Động Hàng Loạt')}
      >
        <div className="space-y-4">
          <Alert variant="info">
            {batchAction === 'grade' 
              ? t('grading.batchGradeConfirm', 'Bạn có chắc chắn muốn chấm {count} bài nộp đã chọn?')
              : t('grading.batchExportConfirm', 'Bạn có chắc chắn muốn xuất {count} bài nộp đã chọn?')
            }
          </Alert>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              {t('grading.selectedCount', 'Số lượng đã chọn: {count}')}
            </p>
            <p className="text-sm text-gray-700">
              {selectedSubmissions.length} {t('grading.submissions', 'bài nộp')}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowBatchModal(false)}
            >
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              icon={batchAction === 'grade' ? <CheckCheck className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              onClick={confirmBatchAction}
            >
              {batchAction === 'grade' 
                ? t('grading.confirmGrade', 'Xác Nhận Chấm')
                : t('grading.confirmExport', 'Xác Nhận Xuất')
              }
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default GradingQueue;
