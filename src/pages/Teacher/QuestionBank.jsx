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
  MoreVertical,
  List
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import teacherService from '../../services/teacherService';
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Alert,
  Loading,
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
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mock data - will be replaced with API calls
  const mockQuestions = [
    { id: 'Q101', content: 'Thủ đô của Hàn Quốc là gì?', category: 'N1', type: 'MULTIPLE_CHOICE', difficulty: 'EASY', status: 'Active', createdAt: '2024-12-15', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q102', content: 'Chọn từ đúng điền vào chỗ trống: "Tôi ... là học sinh"', category: 'N1', type: 'MULTIPLE_CHOICE', difficulty: 'EASY', status: 'Active', createdAt: '2024-12-14', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q103', content: 'Nghe đoạn hội thoại sau và trả lời...', category: 'N2', type: 'LISTENING', difficulty: 'MEDIUM', status: 'Review', createdAt: '2024-12-13', options: [] },
    { id: 'Q104', content: 'Viết một đoạn văn ngắn về gia đình.', category: 'N3', type: 'WRITING', difficulty: 'HARD', status: 'Active', createdAt: '2024-12-12', options: [] },
    { id: 'Q105', content: 'Dịch câu sau: "Hôm nay trời đẹp."', category: 'N1', type: 'TRANSLATION', difficulty: 'MEDIUM', status: 'Active', createdAt: '2024-12-11', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q106', content: 'Thủ đô của Seoul là gì?', category: 'N2', type: 'MULTIPLE_CHOICE', difficulty: 'HARD', status: 'Active', createdAt: '2024-12-10', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q107', content: 'Chọn từ đúng điền vào chỗ trống: "Tôi yêu thích màu xanh dương."', category: 'N3', type: 'MULTIPLE_CHOICE', difficulty: 'EASY', status: 'Active', createdAt: '2024-12-09', options: ['A', 'B', 'C', 'D'] },
    { id: 'Q108', content: 'Viết một đoạn văn ngắn về sở thích của bạn.', category: 'N3', type: 'WRITING', difficulty: 'MEDIUM', status: 'Active', createdAt: '2024-12-08', options: [] },
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
      // TODO: Replace with actual API call
      // const response = await teacherService.getQuestions({ page, ...filters });
      // setQuestions(response.data);
      // setTotalPages(response.totalPages);
      
      // Using mock data for now
      await new Promise(r => setTimeout(r, 500));
      setQuestions(mockQuestions.filter(q => {
        if (filters.category && q.category !== filters.category) return false;
        if (filters.type && q.type !== filters.type) return false;
        if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
        if (filters.search && !q.content.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      }));
      setTotalPages(5);
      setCategories(mockCategories);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(t('qb.error.fetchFailed', 'Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.'));
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

  // Fetch data on component mount
  useEffect(() => {
    fetchQuestions();
  }, [page, filters]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Handle search change
  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPage(1);
  };

  // Handle view detail
  const handleViewDetail = (questionId) => {
    navigate(`/question-detail/${questionId}`);
  };

  // Handle edit question
  const handleEditQuestion = (questionId) => {
    navigate('/teacher/questions/create');
  };

  // Handle delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm(t('qb.confirmDelete', 'Bạn có chắc muốn xóa câu hỏi này?'))) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // await teacherService.deleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      setError('');
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
  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      return;
    }

    if (!window.confirm(t('qb.confirmBulkDelete', `Bạn có chắc muốn xóa ${selectedQuestions.length} câu hỏi đã chọn?`))) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      // TODO: Replace with actual API calls
      // await Promise.all(selectedQuestions.map(id => teacherService.deleteQuestion(id)));
      setQuestions(prev => prev.filter(q => !selectedQuestions.includes(q.id)));
      setSelectedQuestions([]);
      setError('');
    } catch (err) {
      console.error('Error bulk deleting questions:', err);
      setError(t('qb.error.bulkDeleteFailed', 'Không thể xóa câu hỏi. Vui lòng thử lại sau.'));
    } finally {
      setIsDeleting(false);
    }
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
      setNewCategoryName('');
      setShowCategoryModal(false);
      setError('');
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
        return 'success';
      case 'Review':
        return 'warning';
      case 'Inactive':
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
        return 'warning';
      case 'TRANSLATION':
        return 'error';
      default:
        return 'info';
    }
  };

  // Render filter bar
  const renderFilterBar = () => {
    return (
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('qb.searchPlaceholder', 'Tìm kiếm câu hỏi...')}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
              <option value="">{t('qb.allCategories', 'Tất cả danh mục')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name.split(' - ')[0]}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-48">
            <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">{t('qb.allTypes', 'Tất cả loại')}</option>
              <option value="MULTIPLE_CHOICE">{t('qb.multipleChoice', 'Trắc Nghiệm')}</option>
              <option value="LISTENING">{t('qb.listening', 'Nghe Hiểu')}</option>
              <option value="WRITING">{t('qb.writing', 'Viết')}</option>
              <option value="TRANSLATION">{t('qb.translation', 'Dịch')}</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="w-full md:w-48">
            <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="">{t('qb.allDifficulties', 'Tất cả mức độ')}</option>
              <option value="EASY">{t('qb.easy', 'Dễ')}</option>
              <option value="MEDIUM">{t('qb.medium', 'Trung bình')}</option>
              <option value="HARD">{t('qb.hard', 'Khó')}</option>
            </select>
          </div>

          {/* Clear Filters */}
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              setFilters({ type: '', category: '', difficulty: '', search: '' });
              setPage(1);
              fetchQuestions();
            }}
          >
            {t('qb.clearFilters', 'Xóa bộ lọc')}
          </Button>
        </div>
      </Card>
    );
  };

  // Render question list
  const renderQuestionList = () => {
    return (
      <Card>
        {/* Card Header with Bulk Actions */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {t('qb.questionList', 'Danh sách câu hỏi')}
            </h3>
            <Badge variant="info" size="sm">
              {questions.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={selectedQuestions.length === questions.length ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
              onClick={handleSelectAll}
              disabled={questions.length === 0}
            >
              {selectedQuestions.length === questions.length ? t('qb.deselectAll', 'Bỏ chọn') : t('qb.selectAll', 'Chọn tất cả')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleBulkDelete}
              disabled={selectedQuestions.length === 0 || isDeleting}
            >
              {t('qb.deleteSelected', 'Xóa đã chọn')}
            </Button>
          </div>
        </div>

        {/* Questions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                    <th className="px-4 py-3 font-bold text-gray-600 text-sm uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.length === questions.length && questions.length > 0}
                        onChange={handleSelectAll}
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 text-sm uppercase tracking-wider w-20">
                      {t('qb.id', 'ID')}
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 text-sm uppercase tracking-wider flex-1">
                      {t('qb.content', 'Nội dung')}
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 text-sm uppercase tracking-wider w-32">
                      {t('qb.category', 'Danh mục')}
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 text-sm uppercase tracking-wider w-32">
                      {t('qb.type', 'Loại')}
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 text-sm uppercase tracking-wider w-32">
                      {t('qb.difficulty', 'Độ khó')}
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 text-sm uppercase tracking-wider w-28">
                      {t('qb.status', 'Trạng thái')}
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 text-sm uppercase tracking-wider w-32">
                      {t('qb.createdAt', 'Ngày tạo')}
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-600 text-sm uppercase tracking-wider w-32">
                      {t('qb.actions', 'Thao tác')}
                    </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {questions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50 transition group">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => handleBulkSelect(question.id)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm text-gray-600">{question.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-gray-900 line-clamp-2">{question.content}</p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="info" size="sm">
                      {question.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getTypeBadgeVariant(question.type)}>
                      {t(`qb.type.${question.type}`, question.type)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getDifficultyBadgeVariant(question.difficulty)}>
                      {t(`qb.difficulty.${question.difficulty}`, question.difficulty)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getStatusBadgeVariant(question.status)}>
                      {t(`qb.status.${question.status}`, question.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(question.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handlePreviewQuestion(question.id)}
                      >
                        {t('qb.preview', 'Xem')}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => handleEditQuestion(question.id)}
                      >
                        {t('qb.edit', 'Sửa')}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDeleteQuestion(question.id)}
                        disabled={isDeleting}
                      >
                        {t('qb.delete', 'Xóa')}
                      </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questions.map((question) => (
          <Card
            key={question.id}
            className="hover:shadow-lg transition cursor-pointer"
            onClick={() => handleViewDetail(question.id)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                    {question.content}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getTypeBadgeVariant(question.type)}>
                      {t(`qb.type.${question.type}`, question.type)}
                    </Badge>
                    <Badge variant={getDifficultyBadgeVariant(question.difficulty)}>
                      {t(`qb.difficulty.${question.difficulty}`, question.difficulty)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<MoreVertical className="w-4 h-4" />}
                  >
                    ...
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusBadgeVariant(question.status)}>
                  {t(`qb.status.${question.status}`, question.status)}
                </Badge>
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(question.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading.Spinner size="xl" />
        </div>
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
          {error}
        </Alert>
      )}

      {/* Filter Bar */}
      {renderFilterBar()}

      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <Button
          variant={view === 'list' ? 'primary' : 'ghost'}
          size="lg"
          icon={view === 'list' ? <List className="w-5 h-5" /> : <Square className="w-5 h-5" />}
          onClick={() => setView(view === 'list' ? 'grid' : 'list')}
        >
          {view === 'list' ? t('qb.listView', 'Dạng danh sách') : t('qb.gridView', 'Dạng lưới')}
        </Button>
      </div>

      {/* Content */}
      {view === 'list' ? renderQuestionList() : renderQuestionGrid()}

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

      {/* Footer */}
      <Footer />
    </PageContainer>
  );
};

export default QuestionBank;
