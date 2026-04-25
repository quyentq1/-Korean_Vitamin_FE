import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tag as TagIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import teacherService from '../../services/teacherService';
import Swal from 'sweetalert2';
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Input,
  Badge,
  Loading
} from '../../components/ui';

/**
 * TagManagement - Trang Quản Lý Tag cho Giáo Viên
 * Cho phép tạo, sửa, xóa tags dùng cho câu hỏi
 */
const TagManagement = () => {
  const { t } = useTranslation();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    category: 'GRAMMAR'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Categories
  const categories = [
    { value: 'GRAMMAR', label: t('tagManagement.categoryGrammar') },
    { value: 'VOCABULARY', label: t('tagManagement.categoryVocabulary') },
    { value: 'READING', label: t('tagManagement.categoryReading') },
    { value: 'WRITING', label: t('tagManagement.categoryWriting') },
    { value: 'LISTENING', label: t('tagManagement.categoryListening') },
    { value: 'SPEAKING', label: t('tagManagement.categorySpeaking') },
    { value: 'CULTURE', label: t('tagManagement.categoryCulture') },
    { value: 'OTHER', label: t('tagManagement.categoryOther') }
  ];

  // Color options
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await teacherService.getTags();
      setTags(response || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(t('tagManagement.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      category: 'GRAMMAR'
    });
    setFormError('');
    setShowCreateModal(true);
  };

  const handleEdit = (tag) => {
    setSelectedTag(tag);
    setFormData({
      name: tag.name || '',
      description: tag.description || '',
      color: tag.color || '#3b82f6',
      category: tag.category || 'OTHER'
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleDelete = async (tag) => {
    const result = await Swal.fire({
      title: t('tagManagement.deleteTitle'),
      text: t('tagManagement.deleteText', { name: tag.name }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f56565',
      cancelButtonColor: '#667eea',
      confirmButtonText: t('tagManagement.delete'),
      cancelButtonText: t('common.cancel'),
      input: 'text',
      inputPlaceholder: t('tagManagement.deleteConfirmPlaceholder'),
      inputValidator: (value) => {
        if (value !== 'DELETE') {
          return t('tagManagement.deleteConfirmError');
        }
      }
    });

    if (result.isConfirmed) {
      try {
        await teacherService.deleteTag(tag.id);
        Swal.fire({
          icon: 'success',
          title: t('tagManagement.deleted'),
          text: t('tagManagement.deletedSuccess'),
          timer: 1500,
          showConfirmButton: false
        });
        fetchTags();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: t('common.error'),
          text: err.response?.data?.message || t('tagManagement.deleteError')
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        category: formData.category
      };

      if (showEditModal && selectedTag) {
        await teacherService.updateTag(selectedTag.id, data);
        Swal.fire({
          icon: 'success',
          title: t('tagManagement.updateSuccess'),
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await teacherService.createTag(data);
        Swal.fire({
          icon: 'success',
          title: t('tagManagement.createSuccess'),
          timer: 1500,
          showConfirmButton: false
        });
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      fetchTags();
    } catch (err) {
      console.error('Error saving tag:', err);
      setFormError(err.response?.data?.message || t('tagManagement.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  // Filter tags based on search
  const filteredTags = tags.filter(tag =>
    tag.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get category label
  const getCategoryLabel = (category) => {
    return categories.find(c => c.value === category)?.label || category;
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
      {/* Header */}
      <PageHeader
        title={t('tagManagement.title')}
        subtitle={t('tagManagement.subtitle')}
        actions={[
          {
            label: t('tagManagement.createNew'),
            icon: Plus,
            onClick: handleCreate,
            variant: 'primary'
          }
        ]}
      />

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tagManagement.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Tags Grid */}
      {filteredTags.length === 0 ? (
        <Card className="text-center py-12">
          <TagIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? t('tagManagement.noSearchResults') : t('tagManagement.noTags')}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? t('tagManagement.tryDifferentSearch')
              : t('tagManagement.createFirstTag')}
          </p>
          {!searchTerm && (
            <Button variant="primary" icon={Plus} onClick={handleCreate}>
              {t('tagManagement.createNew')}
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag)}
                    className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {tag.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {tag.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <Badge className="bg-gray-100 text-gray-700 text-xs">
                  {getCategoryLabel(tag.category)}
                </Badge>
                <span className="text-xs text-gray-500">
                  {tag.questionCount || 0} {t('tagManagement.questions')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <TagIcon className="w-5 h-5" />
                {showEditModal ? t('tagManagement.editTag') : t('tagManagement.createNew')}
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tagManagement.tagName')} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('tagManagement.tagNamePlaceholder')}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tagManagement.category')}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tagManagement.color')}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        formData.color === color
                          ? 'border-gray-900 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tagManagement.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('tagManagement.descriptionPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.name.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('tagManagement.saving')}
                    </>
                  ) : showEditModal ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t('tagManagement.update')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {t('tagManagement.create')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default TagManagement;
