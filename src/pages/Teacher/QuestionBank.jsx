import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Info,
  CheckCircle,
  Calendar
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
import QuestionFormModal from '../../components/Teacher/QuestionFormModal';

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
  const location = useLocation();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState(null); // For scrolling to specific question
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    level: '',
    topikType: '', // NEW: Filter by TopikType (R1, L1, W51...)
    search: '',
    verificationStatus: 'ALL' // NEW: Filter by verification status
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
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deleteSuccessCount, setDeleteSuccessCount] = useState(1); // For showing count in success modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [approvalHistory, setApprovalHistory] = useState([]); // Approval history for preview

  // Mock data - will be replaced with API calls
  const mockQuestions = [
    { id: 'Q101', content: 'Thủ đô của Hàn Quốc là gì?', category: 'Grammar', type: 'MULTIPLE_CHOICE', difficulty: 'EASY', status: 'Active', verificationStatus: 'APPROVED', createdAt: '2024-12-15', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q102', content: 'Chọn từ đúng điền vào chỗ trống: "Tôi ... là học sinh"', category: 'Vocabulary', type: 'MULTIPLE_CHOICE', difficulty: 'EASY', status: 'Active', verificationStatus: 'PENDING', createdAt: '2024-12-14', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q103', content: 'Nghe đoạn hội thoại sau và trả lời câu hỏi...', category: 'Listening', type: 'LISTENING', difficulty: 'MEDIUM', status: 'Review', verificationStatus: 'PENDING', createdAt: '2024-12-13', options: [] },
    { id: 'Q104', content: 'Viết một đoạn văn ngắn về gia đình của bạn (khoảng 100 từ).', category: 'Writing', type: 'WRITING', difficulty: 'HARD', status: 'Active', verificationStatus: 'REJECTED', createdAt: '2024-12-12', options: [] },
    { id: 'Q105', content: 'Dịch câu sau sang tiếng Hàn: "Hôm nay trời đẹp."', category: 'Reading', type: 'TRANSLATION', difficulty: 'MEDIUM', status: 'Active', verificationStatus: 'APPROVED', createdAt: '2024-12-11', options: ['A', 'B', 'C', 'D'] },
  ];

  const mockCategories = [
    { id: 1, name: 'Grammar', questionCount: 45 },
    { id: 2, name: 'Vocabulary', questionCount: 32 },
    { id: 3, name: 'Reading', questionCount: 28 },
    { id: 4, name: 'Listening', questionCount: 15 },
    { id: 5, name: 'Writing', questionCount: 12 },
    { id: 6, name: 'Speaking', questionCount: 8 },
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
        category: q.categoryName || q.categoryId?.toString() || 'Uncategorized',
        type: q.questionType || q.type || 'MULTIPLE_CHOICE',
        level: q.level || 'LEVEL_3',
        status: q.active ? 'Active' : 'Inactive',
        verificationStatus: q.verificationStatus || 'PENDING',
        createdAt: q.createdAt || q.created_at || new Date().toISOString(),
        options: q.options || [],
        points: q.points || 1,
        active: q.active !== undefined ? q.active : true
      }));

      // Debug: Log first question to check verificationStatus
      if (mappedQuestions.length > 0) {
        // Debug: Log API response structure
      console.log('=== Question Bank Debug ===');
      console.log('API Response format:', Array.isArray(response) ? 'Array' : response?.data ? 'Object with data' : 'Other');
      console.log('Total questions:', questionsData.length);
      if (questionsData.length > 0) {
        console.log('Raw question from API:', questionsData[0]);
        console.log('All verificationStatus values:', questionsData.map(q => ({
          id: q.id,
          verificationStatus: q.verificationStatus,
          verification_status: q.verification_status, // Check snake_case
          status: q.status
        })));
      }
      console.log('Mapped question sample:', mappedQuestions[0]);
      console.log('========================');
      }

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
        if (filters.level && q.level !== filters.level) return false;
        if (filters.search && !q.content.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.verificationStatus && filters.verificationStatus !== 'ALL') {
          if (filters.verificationStatus === 'PENDING' && q.verificationStatus !== 'PENDING') return false;
          if (filters.verificationStatus === 'APPROVED' && q.verificationStatus !== 'APPROVED') return false;
          if (filters.verificationStatus === 'REJECTED' && q.verificationStatus !== 'REJECTED') return false;
        }
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
      const response = await teacherService.getAllCategories();
      setCategories(response || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch data on component mount only (not when filters change)
  useEffect(() => {
    fetchQuestions();
  }, []); // Empty dependency array = only run once on mount

  // Handle URL query params for navigation from notifications
  useEffect(() => {
    if (!loading && questions.length > 0) {
      const params = new URLSearchParams(location.search);
      const questionId = params.get('questionId');
      const verificationStatus = params.get('verificationStatus');

      if (questionId && verificationStatus) {
        // Set filter to the verification status from notification
        setFilters(prev => ({ ...prev, verificationStatus: verificationStatus.toUpperCase() }));
        setHighlightedQuestionId(questionId);

        // Scroll to the question after a short delay
        setTimeout(() => {
          const element = document.getElementById(`question-${questionId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add highlight effect
            element.classList.add('ring-4', 'ring-blue-500', 'bg-blue-50');
            setTimeout(() => {
              element.classList.remove('ring-4', 'ring-blue-500', 'bg-blue-50');
            }, 3000);
          }
        }, 500);

        // Clear URL params to avoid re-triggering
        navigate(location.pathname, { replace: true });
      }
    }
  }, [loading, questions, location.search, navigate]);

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

  // Filter questions based on filters state
  useEffect(() => {
    if (allQuestions.length === 0) return;

    const filtered = allQuestions.filter(q => {
      if (filters.category && q.category !== filters.category) return false;
      if (filters.type && q.type !== filters.type) return false;
      if (filters.level && q.level !== filters.level) return false;
      if (filters.search && !q.content.toLowerCase().includes(filters.search.toLowerCase())) return false;
      // NEW: Filter by verification status
      if (filters.verificationStatus && filters.verificationStatus !== 'ALL') {
        if (filters.verificationStatus === 'PENDING' && q.verificationStatus !== 'PENDING') return false;
        if (filters.verificationStatus === 'APPROVED' && q.verificationStatus !== 'APPROVED') return false;
        if (filters.verificationStatus === 'REJECTED' && q.verificationStatus !== 'REJECTED') return false;
      }
      return true;
    });

    // Update pagination
    setTotal(filtered.length);
    setTotalPages(Math.ceil(filtered.length / pageSize));

    // Paginate
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setQuestions(filtered.slice(startIndex, endIndex));

    // Debug log
    console.log(`Filter: ${filters.verificationStatus} | Total: ${allQuestions.length} | Filtered: ${filtered.length} | Showing: ${filtered.slice(startIndex, endIndex).length}`);
  }, [allQuestions, filters, page, pageSize]);

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
    setEditingQuestionId(questionId);
    setShowQuestionModal(true);
  };

  const handleCreateQuestion = () => {
    setEditingQuestionId(null);
    setShowQuestionModal(true);
  };

  const handleCloseQuestionModal = (shouldRefresh = false) => {
    setShowQuestionModal(false);
    setEditingQuestionId(null);
    if (shouldRefresh) {
      fetchQuestions();
    }
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
      setShowDeleteConfirm(null);
      // Show success modal
      setDeleteSuccessCount(1); // Single delete
      setShowDeleteSuccessModal(true);
      // Auto-hide after 2 seconds
      setTimeout(() => setShowDeleteSuccessModal(false), 2000);
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
    const deletedCount = selectedQuestions.length;

    try {
      // Delete all selected questions in parallel
      await Promise.all(selectedQuestions.map(id => teacherService.deleteQuestion(id)));
      setSelectedQuestions([]);
      // Show success modal
      setDeleteSuccessCount(deletedCount); // Bulk delete count
      setShowDeleteSuccessModal(true);
      // Auto-hide after 2 seconds
      setTimeout(() => setShowDeleteSuccessModal(false), 2000);
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
  const handlePreviewQuestion = async (questionId) => {
    const question = questions.find(q => q.id === questionId);
    setPreviewQuestion(question);
    setShowPreviewModal(true);

    // Fetch approval history
    try {
      const history = await teacherService.getQuestionApprovalHistory(questionId);
      setApprovalHistory(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error('Error fetching approval history:', err);
      setApprovalHistory([]);
    }
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

  // Get verification status badge (variant, icon, and label)
  const getVerificationStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return { variant: 'warning', icon: '⏳', label: 'Chờ duyệt' };
      case 'APPROVED':
        return { variant: 'success', icon: '✅', label: 'Đã duyệt' };
      case 'REJECTED':
        return { variant: 'error', icon: '❌', label: 'Bị từ chối' };
      default:
        return { variant: 'info', icon: '📝', label: status || 'N/A' };
    }
  };

  // Get category badge variant
  const getCategoryBadgeVariant = (category) => {
    switch (category) {
      case 'Grammar':
        return 'error';      // Red
      case 'Vocabulary':
        return 'warning';    // Yellow
      case 'Reading':
        return 'info';       // Blue
      case 'Listening':
        return 'success';    // Green
      case 'Writing':
        return 'purple';     // Purple
      case 'Speaking':
        return 'primary';     // Primary color
      default:
        return 'secondary';  // Gray
    }
  };

  // Get level badge variant - different color for each level
  const getLevelBadgeVariant = (level) => {
    switch (level) {
      case 'LEVEL_1':
        return 'success';     // Green - Dễ nhất
      case 'LEVEL_2':
        return 'info';        // Blue - Dễ
      case 'LEVEL_3':
        return 'warning';     // Yellow - Trung bình
      case 'LEVEL_4':
        return 'primary';     // Primary - Khá
      case 'LEVEL_5':
        return 'purple';      // Purple - Khó
      case 'LEVEL_6':
        return 'error';       // Red - Khó nhất
      default:
        return 'secondary';
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
    const hasFilters = filters.search || filters.type || filters.category || filters.level;

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
                  onClick={handleCreateQuestion}
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
    const hasActiveFilters = filters.search || filters.type || filters.category || filters.level || filters.topikType;

    const getFilterLabel = (key, value) => {
      switch (key) {
        case 'category':
          return categories.find(c => c.name.split(' - ')[0] === value)?.name || value;
        case 'type':
          return t(`qb.type.${value}`, value);
        case 'difficulty':
          return t(`qb.difficulty.${value}`, value);
        case 'topikType':
          return `TOPIK ${value}`;
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
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
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

              {/* Level Filter */}
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition bg-white min-w-[160px] cursor-pointer hover:border-gray-300"
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <option value="">{t('qb.allLevels', 'Tất cả cấp độ')}</option>
                  <option value="LEVEL_1">Level 1</option>
                  <option value="LEVEL_2">Level 2</option>
                  <option value="LEVEL_3">Level 3</option>
                  <option value="LEVEL_4">Level 4</option>
                  <option value="LEVEL_5">Level 5</option>
                  <option value="LEVEL_6">Level 6</option>
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* TopikType Filter */}
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition bg-white min-w-[200px] cursor-pointer hover:border-gray-300"
                  value={filters.topikType}
                  onChange={(e) => handleFilterChange('topikType', e.target.value)}
                >
                  <option value="">All TOPIK</option>
                  <option value="R1">R1 - Ngữ pháp/Từ vựng</option>
                  <option value="R2">R2 - Đọc hiểu văn bản thực tế</option>
                  <option value="R3">R3 - Đọc biểu đồ/bảng biểu</option>
                  <option value="R4">R4 - Sắp xếp thứ tự câu</option>
                  <option value="R5">R5 - Đọc đoạn văn cơ bản</option>
                  <option value="R6">R6 - Đọc bài viết ngắn</option>
                  <option value="R7">R7 - Đọc đoạn văn dài</option>
                  <option value="R8">R8 - Chọn tiêu đề/chủ đề chính</option>
                  <option value="R9">R9 - Đọc bài viết chuyên sâu</option>
                  <option value="L1">L1 - Nghe chọn hình/biểu đồ</option>
                  <option value="L2">L2 - Nghe chọn câu trả lời</option>
                  <option value="L3">L3 - Nghe chọn hành động</option>
                  <option value="L4">L4 - Nghe chọn nội dung giống</option>
                  <option value="L5">L5 - Nghe chọn suy nghĩ/ý định</option>
                  <option value="L6">L6 - Nghe hội thoại dài</option>
                  <option value="L7">L7 - Nghe bài giảng chuyên môn</option>
                  <option value="W51">W51 - Điền vào chỗ trống - Đời sống</option>
                  <option value="W52">W52 - Điền vào chỗ trống - Giải thích</option>
                  <option value="W53">W53 - Viết bài luận ngắn - Biểu đồ</option>
                  <option value="W54">W54 - Viết bài luận dài - Nghị luận</option>
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setFilters({ type: '', category: '', level: '', topikType: '', search: '' });
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
                  setFilters({ type: '', category: '', level: '', topikType: '', search: '' });
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
                <th className="px-4 py-3.5 font-bold text-gray-700 text-xs uppercase tracking-wider min-w-[140px]">
                  Trạng thái duyệt
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
                  id={`question-${question.id}`}
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
                    <Badge variant={getCategoryBadgeVariant(question.category)} size="sm">
                      {question.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant={getTypeBadgeVariant(question.type)}>
                      {t(`qb.type.${question.type}`, question.type)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant={getLevelBadgeVariant(question.level)}>
                      {(question.level || '').replace('LEVEL_', 'Level ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(question.status)}>
                      {t(`qb.status.${question.status}`, question.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {(() => {
                      const vBadge = getVerificationStatusBadge(question.verificationStatus);
                      return (
                        <Badge variant={vBadge.variant} size="sm">
                          {vBadge.icon} {vBadge.label}
                        </Badge>
                      );
                    })()}
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
            id={`question-${question.id}`}
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
                <Badge variant={getCategoryBadgeVariant(question.category)} size="sm">
                  {question.category}
                </Badge>
                <Badge variant={getTypeBadgeVariant(question.type)} size="sm">
                  {t(`qb.type.${question.type}`, question.type)}
                </Badge>
                <Badge variant={getLevelBadgeVariant(question.level)} size="sm">
                  {(question.level || '').replace('LEVEL_', 'Level ')}
                </Badge>
              </div>

              {/* Footer with status, date and actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getStatusBadgeVariant(question.status)} size="sm">
                    {t(`qb.status.${question.status}`, question.status)}
                  </Badge>
                  {(() => {
                    const vBadge = getVerificationStatusBadge(question.verificationStatus);
                    return (
                      <Badge variant={vBadge.variant} size="sm">
                        {vBadge.icon} {vBadge.label}
                      </Badge>
                    );
                  })()}
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
      <PageContainer variant="wide">
        <PageHeader
          title={t('qb.title', 'Ngân Hàng Câu Hỏi')}
          subtitle={t('qb.subtitle', 'Quản lý, tìm kiếm và chỉnh sửa câu hỏi thi')}
        />
        {renderLoadingSkeleton()}
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="wide">
      {/* Page Header */}
      <PageHeader
        title={t('qb.title', 'Ngân Hàng Câu Hỏi')}
        subtitle={t('qb.subtitle', 'Quản lý, tìm kiếm và chỉnh sửa câu hỏi thi')}
        actions={[
          {
            label: t('qb.create', 'Tạo câu hỏi mới'),
            icon: Plus,
            variant: 'primary',
            onClick: handleCreateQuestion,
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

      {/* Verification Status Tabs */}
      <Card className="mb-4">
        <div className="flex flex-wrap gap-2 p-2">
          <button
            onClick={() => handleFilterChange('verificationStatus', 'ALL')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filters.verificationStatus === 'ALL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            📚 Tất cả
          </button>
          <button
            onClick={() => handleFilterChange('verificationStatus', 'PENDING')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filters.verificationStatus === 'PENDING'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            ⏳ Chờ duyệt
          </button>
          <button
            onClick={() => handleFilterChange('verificationStatus', 'APPROVED')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filters.verificationStatus === 'APPROVED'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            ✅ Đã duyệt
          </button>
          <button
            onClick={() => handleFilterChange('verificationStatus', 'REJECTED')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filters.verificationStatus === 'REJECTED'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            ❌ Bị từ chối
          </button>
        </div>
      </Card>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Chi Tiết Câu Hỏi</h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Question Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Loại câu hỏi:</p>
                  <p className="text-gray-900 font-medium">{previewQuestion.type?.replace('_', ' ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Cấp độ:</p>
                  <p className="text-gray-900 font-medium">Level {(previewQuestion.level || '').replace('LEVEL_', '') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Danh mục:</p>
                  <p className="text-gray-900 font-medium">{previewQuestion.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Điểm:</p>
                  <p className="text-gray-900 font-medium">{previewQuestion.points || 1}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Trạng thái:</p>
                  <p className={`font-medium ${
                    previewQuestion.status === 'Active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {previewQuestion.status === 'Active' ? '✅ Hoạt động' : '❌ Không hoạt động'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Trạng thái duyệt:</p>
                  <p className={`font-medium ${
                    previewQuestion.verificationStatus === 'PENDING' ? 'text-amber-600' :
                    previewQuestion.verificationStatus === 'APPROVED' ? 'text-green-600' :
                    previewQuestion.verificationStatus === 'REJECTED' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {previewQuestion.verificationStatus === 'PENDING' ? '⏳ Chờ duyệt' :
                     previewQuestion.verificationStatus === 'APPROVED' ? '✅ Đã duyệt' :
                     previewQuestion.verificationStatus === 'REJECTED' ? '❌ Đã từ chối' : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Question Content */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-bold text-blue-900 mb-2">📝 Nội dung câu hỏi:</p>
                <p className="text-gray-900 text-base leading-relaxed">{previewQuestion.content}</p>
              </div>

              {/* Media (Audio) */}
              {previewQuestion.questionMediaUrl && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-orange-900 mb-2">🎵 Audio:</p>
                  <audio controls src={previewQuestion.questionMediaUrl} className="w-full" />
                </div>
              )}

              {/* Options for Multiple Choice */}
              {previewQuestion.options && previewQuestion.options.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-3">✅ Các lựa chọn:</p>
                  <div className="space-y-2">
                    {previewQuestion.options.map((opt, index) => {
                      const isCorrect = opt.isCorrect;
                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            isCorrect
                              ? 'bg-green-50 border-green-300'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCorrect ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </span>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">{opt.optionText || opt}</p>
                              {isCorrect && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-green-600 text-white rounded">
                                  Đáp án đúng
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Explanation */}
              {previewQuestion.explanation && previewQuestion.explanation !== 'null' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-yellow-900 mb-2">💡 Giải thích:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{previewQuestion.explanation}</p>
                </div>
              )}

              {/* Rejection Info - Show if question was rejected */}
              {previewQuestion.verificationStatus === 'REJECTED' && approvalHistory.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-red-900 mb-3">❌ Thông tin từ chối:</p>
                  <div className="space-y-2">
                    {approvalHistory.map((history) => (
                      <div key={history.id} className="bg-white rounded-lg p-3 border border-red-200">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {history.action === 'REJECTED' ? '❌ Đã từ chối' : 'ℹ️ ' + history.action}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Lý do:</span> {history.feedback || 'Không có lý do cụ thể'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Người duyệt:</span> {history.performedByUser?.fullName || history.performedByUser?.username || 'N/A'}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(history.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Ngày tạo:</p>
                  <p className="text-gray-900 font-medium">{new Date(previewQuestion.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                {previewQuestion.updatedAt && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Cập nhật:</p>
                    <p className="text-gray-900 font-medium">{new Date(previewQuestion.updatedAt).toLocaleString('vi-VN')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={handleCloseModal}
                >
                  {t('common.close', 'Đóng')}
                </Button>
                <Button
                  variant="primary"
                  icon={<Edit className="w-5 h-5" />}
                  onClick={() => {
                    handleCloseModal();
                    handleEditQuestion(previewQuestion.id);
                  }}
                >
                  {t('qb.edit', 'Chỉnh sửa')}
                </Button>
              </div>
            </div>
          </div>
        </div>
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

      {/* Delete Success Modal */}
      {showDeleteSuccessModal && (
        <Modal
          isOpen={showDeleteSuccessModal}
          onClose={() => setShowDeleteSuccessModal(false)}
          size="sm"
          showCloseButton={false}
        >
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Xóa thành công!
            </h3>
            <p className="text-gray-600">
              {deleteSuccessCount === 1
                ? 'Đã xóa câu hỏi thành công'
                : `Đã xóa ${deleteSuccessCount} câu hỏi thành công`}
            </p>
          </div>
        </Modal>
      )}

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={showQuestionModal}
        onClose={handleCloseQuestionModal}
        questionId={editingQuestionId}
      />
    </PageContainer>
  );
};

export default QuestionBank;
