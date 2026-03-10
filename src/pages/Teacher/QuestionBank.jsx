import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  X,
  CheckSquare,
  Square,
  List,
  Grid3x3,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  FileQuestion,
  AlertCircle,
  Info
} from 'lucide-react';
import teacherService from '../../services/teacherService';
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Alert,
  Badge,
  Modal
} from '../../components/ui';

/**
 * QuestionBank Component
 *
 * Enhanced question bank page with:
 * - Improved filter
 * - Bulk actions
 * - Preview modal
 * - Category creation modal
 * - Integrate POST /api/teacher/categories
 *
 * @component
 */
const QuestionBank = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    difficulty: '',
    search: ''
  });
  const [view, setView] = useState('list'); // 'list' or 'grid'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [allQuestions, setAllQuestions] = useState([]); // Store all questions for client-side pagination
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Mock data - will be replaced with API calls
  const mockQuestions = [
    { id: 'Q101', content: 'Thủ đô của Hàn Quốc là gì?', category: 'N1', type: 'MULTIPLE_CHOICE', difficulty: 'EASY', status: 'Active', createdAt: '2024-12-15', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q102', content: 'Chọn từ đúng điền vào chỗ trống: "Tôi ... là học sinh"', category: 'N1', type: 'MULTIPLE_CHOICE', difficulty: 'EASY', status: 'Active', createdAt: '2024-12-14', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q103', content: 'Nghe đoạn hội thoại sau và trả lời câu hỏi...', category: 'N2', type: 'LISTENING', difficulty: 'MEDIUM', status: 'Review', createdAt: '2024-12-13', options: [] },
    { id: 'Q104', content: 'Viết một đoạn văn ngắn về gia đình của bạn (khoảng 100 từ).', category: 'N3', type: 'WRITING', difficulty: 'HARD', status: 'Active', createdAt: '2024-12-12', options: [] },
    { id: 'Q105', content: 'Dịch câu sau sang tiếng Hàn: "Hôm nay trời đẹp."', category: 'N1', type: 'TRANSLATION', difficulty: 'MEDIUM', status: 'Active', createdAt: '2024-12-11', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q106', content: 'Điền vào chỗ trống: Seoul ___ thủ đô của Hàn Quốc.', category: 'N2', type: 'MULTIPLE_CHOICE', difficulty: 'HARD', status: 'Active', createdAt: '2024-12-10', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q107', content: 'Chọn từ đúng: "Tôi (yêu/thích) ___ màu xanh dương."', category: 'N3', type: 'MULTIPLE_CHOICE', difficulty: 'EASY', status: 'Active', createdAt: '2024-12-09', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q108', content: 'Viết một đoạn văn ngắn về sở thích của bạn.', category: 'N3', type: 'WRITING', difficulty: 'MEDIUM', status: 'Active', createdAt: '2024-12-08', options: [] },
    { id: 'Q109', content: 'Nghe và chọn hình ảnh đúng theo đoạn hội thoại.', category: 'N1', type: 'LISTENING', difficulty: 'EASY', status: 'Active', createdAt: '2024-12-07', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q110', content: 'Dịch: "Tôi đi học bằng xe buýt mọi ngày."', category: 'N2', type: 'TRANSLATION', difficulty: 'MEDIUM', status: 'Review', createdAt: '2024-12-06', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q111', content: 'Chọn động từ đúng: "Hôm qua tôi ___ đến công viên."', category: 'N2', type: 'MULTIPLE_CHOICE', difficulty: 'MEDIUM', status: 'Active', createdAt: '2024-12-05', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q112', content: 'Viết email giới thiệu bản thân (150-200 từ).', category: 'N3', type: 'WRITING', difficulty: 'HARD', status: 'Active', createdAt: '2024-12-04', options: [] },
  ];

  const mockCategories = [
    { id: 1, name: 'N1 - Sơ Cấp 1', questionCount: 45 },
    { id: 2, name: 'N2 - Sơ Cấp 2', questionCount: 32 },
    { id: 3, name: 'N3 - Sơ Cấp 3', questionCount: 28 },
    { id: 4, name: 'N4 - Sơ Cấp 4', questionCount: 15 },
    { id: 5, name: 'N5 - Sơ Cấp 5', questionCount: 12 },
  ];

  // Fetch questions from API
  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await teacherService.getQuestions({ page, pageSize, ...filters });

      // Handle different response formats
      let questionsData = [];
      let totalCount = 0;
      let totalPagesCount = 1;

      // Format 1: { data: [...], total: X, totalPages: Y }
      if (response?.data && Array.isArray(response.data)) {
        questionsData = response.data;
        totalCount = response.total || response.data.length;
        totalPagesCount = response.totalPages || Math.ceil(totalCount / pageSize);
      }
      // Format 2: Direct array [...]
      else if (Array.isArray(response)) {
        questionsData = response;
        totalCount = response.length;
        totalPagesCount = Math.ceil(totalCount / pageSize);
      }
      // Format 3: { results: [...], count: X }
      else if (response?.results && Array.isArray(response.results)) {
        questionsData = response.results;
        totalCount = response.count || response.results.length;
        totalPagesCount = Math.ceil(totalCount / pageSize);
      }
      else {
        console.warn('Unexpected API response format:', response);
        throw new Error('Invalid response format');
      }

      // Map API response to component format
      const mappedQuestions = questionsData.map(q => ({
        id: q.id?.toString() || Math.random().toString(36).substr(2, 9),
        content: q.questionText || q.content || q.text || 'No content',
        category: q.category?.id?.toString() || q.category?.toString() || 'N/A',
        type: q.questionType || q.type || 'MULTIPLE_CHOICE',
        difficulty: q.difficulty || 'MEDIUM',
        status: q.verificationStatus || q.status || (q.active ? 'Active' : 'Inactive'),
        createdAt: q.createdAt || q.created_at || new Date().toISOString(),
        options: q.options || [],
        points: q.points || 1,
        active: q.active !== undefined ? q.active : true
      }));

      // Store all questions for client-side pagination
      setAllQuestions(mappedQuestions);
      setTotal(totalCount);
      setTotalPages(totalPagesCount);

      // Apply client-side pagination - slice questions for current page
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedQuestions = mappedQuestions.slice(startIndex, endIndex);
      setQuestions(paginatedQuestions);

      // Also fetch categories
      await fetchCategories();
    } catch (err) {
      console.error('Error fetching questions:', err);
      // Check if it's a network error or invalid response
      if (err.message === 'Invalid response format') {
        setError(t('qb.error.invalidResponse', 'Định dạng API không hợp lệ. Vui lòng kiểm tra lại.'));
      } else {
        setError(t('qb.error.fetchFailed', 'Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.'));
      }
      // Fallback to mock data if API fails
      await new Promise(r => setTimeout(r, 500));
      const filteredQuestions = mockQuestions.filter(q => {
        if (filters.category && q.category !== filters.category) return false;
        if (filters.type && q.type !== filters.type) return false;
        if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
        if (filters.search && !q.content.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      });
      setAllQuestions(filteredQuestions);
      setTotal(filteredQuestions.length);
      setTotalPages(Math.ceil(filteredQuestions.length / pageSize));
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      setQuestions(filteredQuestions.slice(startIndex, endIndex));
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await teacherService.getCategories();
      // setCategories(response.data);
      setCategories(mockCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  // Handle client-side pagination when page or pageSize changes
  useEffect(() => {
    if (allQuestions.length > 0) {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedQuestions = allQuestions.slice(startIndex, endIndex);
      setQuestions(paginatedQuestions);

      // Recalculate totalPages if pageSize changed
      const newTotalPages = Math.ceil(allQuestions.length / pageSize);
      setTotalPages(newTotalPages);
    }
  }, [page, pageSize, allQuestions]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setPage(1);
  };

  // Handle search change
  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPage(1);
  };

  // Handle edit question
  const handleEditQuestion = (questionId) => {
    navigate(`/teacher/questions/edit/${questionId}`);
  };

  // Handle delete question
  const handleDeleteQuestion = async (questionId) => {
    setShowDeleteConfirm(questionId);
  };

  // Confirm delete question
  const confirmDeleteQuestion = async () => {
    if (!showDeleteConfirm) return;

    setIsDeleting(true);
    setError('');

    try {
      await teacherService.deleteQuestion(showDeleteConfirm);
      setQuestions(prev => prev.filter(q => q.id !== showDeleteConfirm));
      setSuccess(t('qb.success.delete', 'Đã xóa câu hỏi thành công!'));
      setTimeout(() => setSuccess(''), 3000);
      setShowDeleteConfirm(null);
      // Refresh questions list
      await fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(t('qb.error.deleteFailed', 'Không thể xóa câu hỏi. Vui lòng thử lại sau.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle bulk select
  const handleBulkSelect = (questionId) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    } else {
      setSelectedQuestions(prev => [...prev, questionId]);
    }
  };

  // Handle select all
  const areAllCurrentPageSelected = () => {
    return questions.length > 0 &&
      questions.every(q => selectedQuestions.includes(q.id));
  };

  const handleSelectAll = () => {
    const allCurrentPageSelected = areAllCurrentPageSelected();

    if (allCurrentPageSelected) {
      // Deselect all questions on current page
      const currentPageIds = questions.map(q => q.id);
      setSelectedQuestions(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      // Select all questions on current page (add to existing selection)
      const currentPageIds = questions.map(q => q.id);
      setSelectedQuestions(prev => {
        const newSelection = [...prev];
        currentPageIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      // Delete all selected questions in parallel
      await Promise.all(selectedQuestions.map(id => teacherService.deleteQuestion(id)));
      setSuccess(t('qb.success.bulkDelete', `Đã xóa ${selectedQuestions.length} câu hỏi thành công!`));
      setTimeout(() => setSuccess(''), 3000);
      setSelectedQuestions([]);
      // Refresh questions list
      await fetchQuestions();
    } catch (err) {
      console.error('Error bulk deleting questions:', err);
      setError(t('qb.error.bulkDeleteFailed', 'Không thể xóa câu hỏi. Vui lòng thử lại sau.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle clear all selections
  const handleClearSelection = () => {
    setSelectedQuestions([]);
  };

  // Handle preview question
  const handlePreviewQuestion = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    setPreviewQuestion(question);
    setShowPreviewModal(true);
  };

  // Handle create category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError(t('qb.error.emptyCategoryName', 'Vui lòng nhập tên danh mục.'));
      return;
    }

    setIsSavingCategory(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // await teacherService.createCategory({ name: newCategoryName });
      await fetchCategories();
      setSuccess(t('qb.success.createCategory', 'Đã tạo danh mục thành công!'));
      setTimeout(() => setSuccess(''), 3000);
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Error creating category:', err);
      setError(t('qb.error.createCategoryFailed', 'Không thể tạo danh mục. Vui lòng thử lại sau.'));
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowPreviewModal(false);
    setShowCategoryModal(false);
    setPreviewQuestion(null);
    setNewCategoryName('');
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Active':
      case 'APPROVED':
        return 'success';
      case 'Review':
      case 'PENDING':
        return 'warning';
      case 'Inactive':
      case 'REJECTED':
        return 'error';
      default:
        return 'info';
    }
  };

  // Get difficulty badge variant
  const getDifficultyBadgeVariant = (difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HARD':
        return 'error';
      default:
        return 'info';
    }
  };

  // Get type badge variant
  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'info';
      case 'LISTENING':
        return 'success';
      case 'WRITING':
      case 'SHORT_ANSWER':
      case 'ESSAY':
        return 'warning';
      case 'TRANSLATION':
      case 'SPEAKING':
        return 'error';
      default:
        return 'info';
    }
  };

  // Render pagination
  const renderPagination = () => {
    const getPageNumbers = () => {
      const pages = [];
      const showEllipsis = totalPages > 7;

      if (!showEllipsis) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (page <= 3) {
          pages.push(1, 2, 3, 4, '...', totalPages);
        } else if (page >= totalPages - 2) {
          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
        }
      }
      return pages;
    };

    const pageSizeOptions = [5, 10, 15, 20, 50];

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {t('qb.show', 'Hiển thị')}
          </span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition cursor-pointer hover:border-gray-300"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600">
            {t('qb.perPage', '/ trang')}
          </span>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title={t('qb.firstPage', 'Trang đầu')}
            >
              <ChevronFirst className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title={t('qb.prevPage', 'Trang trước')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[40px] h-10 rounded-lg font-medium transition ${
                    page === p
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title={t('qb.nextPage', 'Trang sau')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title={t('qb.lastPage', 'Trang cuối')}
            >
              <ChevronLast className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page Info */}
        <div className="text-sm text-gray-600">
          {t('qb.pageInfo', 'Trang {{page}}/{{total}}', { page, total: totalPages })}
        </div>
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const hasFilters = filters.search || filters.type || filters.category || filters.difficulty;

    return (
      <Card className="py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            {hasFilters ? (
              <Search className="w-10 h-10 text-gray-400" />
            ) : (
              <FileQuestion className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {hasFilters
              ? t('qb.noSearchResults', 'Không tìm thấy kết quả nào')
              : t('qb.noQuestions', 'Chưa có câu hỏi nào')}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {hasFilters
              ? t('qb.tryDifferentFilters', 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.')
              : t('qb.createFirstQuestion', 'Bắt đầu bằng cách tạo câu hỏi đầu tiên của bạn.')}
          </p>
          <div className="flex items-center justify-center gap-3">
            {hasFilters ? (
              <Button
                variant="primary"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={() => {
                  setFilters({ type: '', category: '', difficulty: '', search: '' });
                  setPage(1);
                }}
              >
                {t('qb.clearFilters', 'Xóa bộ lọc')}
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate('/teacher/questions/create')}
                >
                  {t('qb.createQuestion', 'Tạo câu hỏi mới')}
                </Button>
                <Button
                  variant="secondary"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => navigate('/question-import')}
                >
                  {t('qb.importExcel', 'Import Excel')}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => {
    return (
      <Card className="overflow-hidden">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-6 bg-gray-200 rounded-full w-8"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 bg-gray-200 rounded-lg w-28"></div>
              <div className="h-9 bg-gray-200 rounded-lg w-28"></div>
            </div>
          </div>

          {/* Table skeleton */}
          <div className="space-y-3">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
                <div className="w-24 h-6 bg-gray-200 rounded"></div>
                <div className="w-24 h-6 bg-gray-200 rounded"></div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                <div className="flex gap-1.5">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  // Render filter bar
  const renderFilterBar = () => {
    const hasActiveFilters = filters.search || filters.type || filters.category || filters.difficulty;

    const getFilterLabel = (key, value) => {
      switch (key) {
        case 'category':
          return categories.find(c => c.name.split(' - ')[0] === value)?.name || value;
        case 'type':
          return t(`qb.type.${value}`, value);
        case 'difficulty':
          return t(`qb.difficulty.${value}`, value);
        case 'search':
          return value;
        default:
          return value;
      }
    };

    const activeFilters = Object.entries(filters).filter(([key, value]) => value);

    return (
      <Card className="mb-6">
        <div className="flex flex-col gap-4">
          {/* Search and Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('qb.searchPlaceholder', 'Tìm kiếm câu hỏi...')}
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition bg-white min-w-[160px] cursor-pointer hover:border-gray-300"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">{t('qb.allCategories', 'Tất cả danh mục')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name.split(' - ')[0]}>{cat.name}</option>
                  ))}
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition bg-white min-w-[160px] cursor-pointer hover:border-gray-300"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">{t('qb.allTypes', 'Tất cả loại')}</option>
                  <option value="MULTIPLE_CHOICE">{t('qb.multipleChoice', 'Trắc Nghiệm')}</option>
                  <option value="SHORT_ANSWER">{t('qb.shortAnswer', 'Ngắn')}</option>
                  <option value="ESSAY">{t('qb.essay', 'Tự Luận')}</option>
                  <option value="LISTENING">{t('qb.listening', 'Nghe Hiểu')}</option>
                  <option value="SPEAKING">{t('qb.speaking', 'Nói')}</option>
                  <option value="WRITING">{t('qb.writing', 'Viết')}</option>
                  <option value="TRANSLATION">{t('qb.translation', 'Dịch')}</option>
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Difficulty Filter */}
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition bg-white min-w-[160px] cursor-pointer hover:border-gray-300"
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                >
                  <option value="">{t('qb.allDifficulties', 'Tất cả mức độ')}</option>
                  <option value="EASY">{t('qb.easy', 'Dễ')}</option>
                  <option value="MEDIUM">{t('qb.medium', 'Trung bình')}</option>
                  <option value="HARD">{t('qb.hard', 'Khó')}</option>
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setFilters({ type: '', category: '', difficulty: '', search: '' });
                  setPage(1);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" />
                {t('qb.clearFilters', 'Xóa bộ lọc')}
              </button>
            )}
          </div>

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium">
                {t('qb.activeFilters', 'Bộ lọc đang áp dụng:')}
              </span>
              {activeFilters.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                >
                  <span>{getFilterLabel(key, value)}</span>
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="hover:bg-blue-100 rounded p-0.5 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => {
                  setFilters({ type: '', category: '', difficulty: '', search: '' });
                  setPage(1);
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
              >
                {t('qb.clearAll', 'Xóa tất cả')}
              </button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Render question list
  const renderQuestionList = () => {
    return (
      <Card className="overflow-hidden">
        {/* Card Header with Bulk Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-4 pt-4 mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900">
              {t('qb.questionList', 'Danh sách câu hỏi')}
            </h3>
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {total}
            </span>
            {selectedQuestions.length > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                {selectedQuestions.length} {t('qb.selected', 'đã chọn')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSelectAll}
              disabled={questions.length === 0}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
            >
              {areAllCurrentPageSelected() ? (
                <>
                  <Square className="w-4 h-4" />
                  {t('qb.deselectAll', 'Bỏ chọn')}
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  {t('qb.selectAll', 'Chọn tất cả')}
                </>
              )}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedQuestions.length === 0 || isDeleting}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 hover:shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
              {t('qb.deleteSelected', 'Xóa đã chọn')}
            </button>
            {selectedQuestions.length > 0 && (
              <button
                onClick={handleClearSelection}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <X className="w-4 h-4" />
                {t('qb.clearSelection', 'Xóa chọn')}
              </button>
            )}
          </div>
        </div>

        {/* Questions Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="sticky left-0 z-10 px-4 py-3.5 font-bold text-gray-700 text-xs uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100 border-r border-gray-200">
                  <input
                    type="checkbox"
                    checked={areAllCurrentPageSelected()}
                    onChange={handleSelectAll}
                    className="cursor-pointer w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                </th>
                <th className="px-4 py-3.5 font-bold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">
                  {t('qb.id', 'ID')}
                </th>
                <th className="px-4 py-3.5 font-bold text-gray-700 text-xs uppercase tracking-wider min-w-[280px] max-w-[400px]">
                  {t('qb.content', 'Nội dung')}
                </th>
                <th className="px-4 py-3.5 font-bold text-gray-700 text-xs uppercase tracking-wider min-w-[120px]">
                  {t('qb.category', 'Danh mục')}
                </th>
                <th className="px-4 py-3.5 font-bold text-gray-700 text-xs uppercase tracking-wider min-w-[140px]">
                  {t('qb.type', 'Loại')}
                </th>
                <th className="px-4 py-3.5 font-bold text-gray-700 text-xs uppercase tracking-wider min-w-[110px]">
                  {t('qb.difficulty', 'Độ khó')}
                </th>
                <th className="px-4 py-3.5 font-bold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">
                  {t('qb.status', 'Trạng thái')}
                </th>
                <th className="px-4 py-3.5 font-bold text-gray-700 text-xs uppercase tracking-wider min-w-[110px]">
                  {t('qb.createdAt', 'Ngày tạo')}
                </th>
                <th className="sticky right-0 z-10 px-4 py-3.5 font-bold text-gray-700 text-xs uppercase tracking-wider min-w-[140px] text-center bg-gradient-to-r from-gray-50 to-gray-100 border-l border-gray-200">
                  {t('qb.actions', 'Thao tác')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {questions.map((question) => (
                <tr
                  key={question.id}
                  className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group ${
                    selectedQuestions.includes(question.id) ? 'bg-blue-50/80' : ''
                  }`}
                >
                  <td className="sticky left-0 z-10 px-4 py-4 bg-white group-hover:bg-blue-50/80 border-r border-gray-100">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => handleBulkSelect(question.id)}
                      className="cursor-pointer w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-mono text-xs font-medium">
                      {question.id}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-gray-900 font-medium line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {question.content}
                    </p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant="info" size="sm">
                      {question.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant={getTypeBadgeVariant(question.type)}>
                      {t(`qb.type.${question.type}`, question.type)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant={getDifficultyBadgeVariant(question.difficulty)}>
                      {t(`qb.difficulty.${question.difficulty}`, question.difficulty)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(question.status)}>
                      {t(`qb.status.${question.status}`, question.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 font-medium">
                      {new Date(question.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </span>
                  </td>
                  <td className="sticky right-0 z-10 px-4 py-4 bg-white group-hover:bg-blue-50/80 border-l border-gray-100">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewQuestion(question.id);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group/btn relative"
                        title={t('qb.preview', 'Xem')}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                          {t('qb.preview', 'Xem')}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditQuestion(question.id);
                        }}
                        className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 group/btn relative"
                        title={t('qb.edit', 'Sửa')}
                      >
                        <Edit className="w-4 h-4" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                          {t('qb.edit', 'Sửa')}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(question.id);
                        }}
                        disabled={isDeleting}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group/btn relative disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:bg-transparent"
                        title={t('qb.delete', 'Xóa')}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                          {t('qb.delete', 'Xóa')}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  // Render question grid
  const renderQuestionGrid = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {questions.map((question) => (
          <Card
            key={question.id}
            className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            {/* Status indicator bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              question.status === 'Active' ? 'bg-green-500' :
              question.status === 'Review' ? 'bg-amber-500' :
              'bg-red-500'
            }`}></div>

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-mono text-xs font-medium mb-2">
                    {question.id}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-3 leading-snug">
                    {question.content}
                  </h3>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="info" size="sm">
                  {question.category}
                </Badge>
                <Badge variant={getTypeBadgeVariant(question.type)} size="sm">
                  {t(`qb.type.${question.type}`, question.type)}
                </Badge>
                <Badge variant={getDifficultyBadgeVariant(question.difficulty)} size="sm">
                  {t(`qb.difficulty.${question.difficulty}`, question.difficulty)}
                </Badge>
              </div>

              {/* Footer with status, date and actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(question.status)} size="sm">
                    {t(`qb.status.${question.status}`, question.status)}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {new Date(question.createdAt).toLocaleDateString('vi-VN', {
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </span>
              </div>

              {/* Action buttons overlay */}
              <div className="absolute top-12 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewQuestion(question.id);
                  }}
                  className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition"
                  title={t('qb.preview', 'Xem')}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditQuestion(question.id);
                  }}
                  className="p-2 text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-lg transition"
                  title={t('qb.edit', 'Sửa')}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuestion(question.id);
                  }}
                  disabled={isDeleting}
                  className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg transition disabled:opacity-40"
                  title={t('qb.delete', 'Xóa')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title={t('qb.title', 'Ngân Hàng Câu Hỏi')}
          subtitle={t('qb.subtitle', 'Quản lý, tìm kiếm và chỉnh sửa câu hỏi thi')}
        />
        {renderLoadingSkeleton()}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('qb.title', 'Ngân Hàng Câu Hỏi')}
        subtitle={t('qb.subtitle', 'Quản lý, tìm kiếm và chỉnh sửa câu hỏi thi')}
        actions={[
          {
            label: t('qb.create', 'Tạo câu hỏi mới'),
            icon: Plus,
            variant: 'primary',
            onClick: () => navigate('/teacher/questions/create'),
          },
          {
            label: t('qb.import', 'Import Excel'),
            icon: Download,
            variant: 'secondary',
            onClick: () => navigate('/question-import'),
          },
          {
            label: t('qb.createCategory', 'Tạo danh mục'),
            icon: Plus,
            variant: 'ghost',
            onClick: () => setShowCategoryModal(true),
          },
          {
            label: t('common.refresh', 'Làm mới'),
            icon: RefreshCw,
            variant: 'ghost',
            onClick: fetchQuestions,
          },
        ]}
      />

      {/* Error Alert */}
      {error && (
        <Alert type="error" dismissible onDismiss={() => setError('')} className="mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert type="success" dismissible onDismiss={() => setSuccess('')} className="mb-6">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        </Alert>
      )}

      {/* Filter Bar */}
      {renderFilterBar()}

      {/* View Toggle & Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          {total > 0 && (
            <>
              {t('qb.showing', 'Hiển thị')} <span className="font-semibold">{(page - 1) * pageSize + 1}</span> - <span className="font-semibold">{Math.min(page * pageSize, total)}</span> / <span className="font-semibold">{total}</span> {t('qb.totalQuestions', 'câu hỏi')}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition ${
              view === 'list'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
            title={t('qb.listView', 'Dạng danh sách')}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition ${
              view === 'grid'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
            title={t('qb.gridView', 'Dạng lưới')}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {questions.length === 0 ? renderEmptyState() : (
        <>
          {view === 'list' ? renderQuestionList() : renderQuestionGrid()}
          {renderPagination()}
        </>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewQuestion && (
        <Modal
          isOpen={showPreviewModal}
          onClose={handleCloseModal}
          title={t('qb.previewTitle', 'Xem chi tiết câu hỏi')}
          size="2xl"
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
              >
                {t('common.close', 'Đóng')}
              </Button>
              <Button
                variant="primary"
                icon={<Edit className="w-5 h-5" />}
                onClick={() => handleEditQuestion(previewQuestion.id)}
              >
                {t('qb.edit', 'Chỉnh sửa')}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <span className="font-semibold text-gray-900">{t('qb.content', 'Nội dung')}</span>
              <p className="text-gray-700 mt-2">{previewQuestion.content}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{t('qb.category', 'Danh mục')}</span>
              <Badge variant="info" size="sm">
                {previewQuestion.category}
              </Badge>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{t('qb.type', 'Loại câu hỏi')}</span>
              <Badge variant={getTypeBadgeVariant(previewQuestion.type)}>
                {t(`qb.type.${previewQuestion.type}`, previewQuestion.type)}
              </Badge>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{t('qb.difficulty', 'Độ khó')}</span>
              <Badge variant={getDifficultyBadgeVariant(previewQuestion.difficulty)}>
                {t(`qb.difficulty.${previewQuestion.difficulty}`, previewQuestion.difficulty)}
              </Badge>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{t('qb.status', 'Trạng thái')}</span>
              <Badge variant={getStatusBadgeVariant(previewQuestion.status)}>
                {t(`qb.status.${previewQuestion.status}`, previewQuestion.status)}
              </Badge>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{t('qb.options', 'Các lựa chọn')}</span>
              <div className="mt-2">
                {previewQuestion.options && previewQuestion.options.map((opt, index) => (
                  <Badge key={index} variant="info" size="sm" className="mr-2">
                    {opt}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{t('qb.createdAt', 'Ngày tạo')}</span>
              <p className="text-gray-700">
                {new Date(previewQuestion.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <Modal
          isOpen={showCategoryModal}
          onClose={handleCloseModal}
          title={t('qb.createCategory', 'Tạo danh mục mới')}
          size="md"
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
              >
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button
                variant="primary"
                icon={<Plus className="w-5 h-5" />}
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || isSavingCategory}
              >
                {isSavingCategory ? t('qb.creating', 'Đang tạo...') : t('qb.create', 'Tạo')}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                {t('qb.categoryName', 'Tên danh mục')}
              </label>
              <input
                type="text"
                placeholder={t('qb.categoryPlaceholder', 'Nhập tên danh mục...')}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          title={t('qb.confirmDeleteTitle', 'Xác nhận xóa')}
          size="md"
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 className="w-5 h-5" />}
                onClick={confirmDeleteQuestion}
                disabled={isDeleting}
              >
                {isDeleting ? t('qb.deleting', 'Đang xóa...') : t('qb.confirmDelete', 'Xóa câu hỏi')}
              </Button>
            </div>
          }
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t('qb.confirmDeleteMessage', 'Bạn có chắc muốn xóa câu hỏi này?')}
            </h3>
            <p className="text-gray-600">
              {t('qb.deleteWarning', 'Hành động này không thể hoàn tác. Câu hỏi sẽ bị xóa vĩnh viễn.')}
            </p>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default QuestionBank;
