import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import studentService from '../../services/studentService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Alert,
  Loading,
  Badge
} from '../../components/ui';

/**
 * TestLibrary Component
 *
 * Enhanced test library with:
 * - Card layout for tests
 * - Filter by course/category
 * - Search functionality
 * - Status badges
 * - Modern UI components
 *
 * @component
 */
const TestLibrary = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Tests from API
  const [tests, setTests] = useState([]);

  // Fetch exams from API
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await studentService.getAvailableExams();
        setTests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch exams:', err);
        setError(err?.message || 'Không thể tải danh sách bài test');
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Filter tests based on search, category, difficulty, and status
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || test.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === 'all' || test.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  // Get unique categories and difficulties from tests
  const categories = [...new Set(tests.map(t => t.category))];
  const difficulties = [...new Set(tests.map(t => t.difficulty))];

  // Handle test click
  const handleTestClick = (testId) => {
    const test = tests.find(t => t.id === testId);
    if (test.status === 'locked') {
      setError(t('testLibrary.testLocked', 'Bạn cần hoàn thành bài test trước trước khi làm bài test này.'));
      return;
    }
    navigate(`/test-runner/${testId}`);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulty(difficulty);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  // Get badge variant based on status
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'available':
        return 'info';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'locked':
        return 'error';
      default:
        return 'info';
    }
  };

  // Get badge variant based on difficulty
  const getDifficultyBadgeVariant = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'beginner';
      case 'intermediate':
        return 'intermediate';
      case 'advanced':
        return 'advanced';
      default:
        return 'info';
    }
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
        title={t('testLibrary.title', 'Thư Viện Bài Test')}
        subtitle={t('testLibrary.subtitle', 'Luyện tập không giới hạn với các bài test chất lượng')}
      />

      {/* Error Alert */}
      {error && (
        <Alert type="error" dismissible onDismiss={() => setError('')} className="mb-6">
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={t('testLibrary.searchPlaceholder', 'Tìm kiếm bài test...')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 pl-12 pr-4 bg-white rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
          >
            <option value="all">{t('testLibrary.allCategories', 'Tất cả')}</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {t(`testLibrary.category.${category}`, category)}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="relative">
          <select
            value={selectedDifficulty}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            className="px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
          >
            <option value="all">{t('testLibrary.allDifficulties', 'Tất cả trình độ')}</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {t(`testLibrary.difficulty.${difficulty}`, difficulty)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
          >
            <option value="all">{t('testLibrary.allStatuses', 'Tất cả trạng thái')}</option>
            <option value="available">{t('testLibrary.status.available', 'Có sẵn')}</option>
            <option value="in-progress">{t('testLibrary.status.inProgress', 'Đang làm')}</option>
            <option value="completed">{t('testLibrary.status.completed', 'Đã hoàn thành')}</option>
            <option value="locked">{t('testLibrary.status.locked', 'Đã khóa')}</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedStatus !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedDifficulty('all');
              setSelectedStatus('all');
            }}
          >
            {t('testLibrary.clearFilters', 'Bỏ bộ lọc')}
          </Button>
        )}
      </div>

      {/* Test Count */}
      <div className="mb-4 text-gray-600">
        {t('testLibrary.testCount', 'Có {{count}} bài test', { count: filteredTests.length })}
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <Card
            key={test.id}
            className="hover:shadow-lg transition-all cursor-pointer"
            onClick={() => handleTestClick(test.id)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                  {test.thumbnail}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg sm:text-xl">{test.title}</h3>
                  <p className="text-sm text-gray-500">{test.course}</p>
                </div>
              </div>
              <Badge
                variant={getStatusBadgeVariant(test.status)}
                className="shrink-0"
              >
                {t(`testLibrary.status.${test.status}`, test.status)}
              </Badge>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {test.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant={getDifficultyBadgeVariant(tag)}
                  className="shrink-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <span>⏱️ {test.duration} {t('common.minutes', 'phút')}</span>
              <span>📝 {test.questions} {t('testLibrary.questions', 'câu hỏi')}</span>
              {test.attempts > 0 && (
                <span>🎯 {test.bestScore}% {t('testLibrary.bestScore', 'điểm cao nhất')}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">
              {test.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                {test.attempts > 0 ? (
                  <span>{t('testLibrary.attempts', 'Đã làm {{count}} lần', { count: test.attempts })}</span>
                ) : (
                  <span>{t('testLibrary.notStarted', 'Chưa làm')}</span>
                )}
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleTestClick(test.id)}
                disabled={test.status === 'locked'}
              >
                {test.status === 'available' && t('testLibrary.start', 'Bắt đầu')}
                {test.status === 'in-progress' && t('testLibrary.continue', 'Tiếp tục')}
                {test.status === 'completed' && t('testLibrary.retry', 'Làm lại')}
                {test.status === 'locked' && t('testLibrary.locked', 'Đã khóa')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTests.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            {t('testLibrary.noTests', 'Không tìm thấy bài test nào')}
          </p>
          <p className="text-sm text-gray-500">
            {t('testLibrary.noTestsDescription', 'Thử bỏ bộ lọc để tìm bài test phù hợp với bạn')}
          </p>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </PageContainer>
  );
};

export default TestLibrary;
