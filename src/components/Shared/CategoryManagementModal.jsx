import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import Input from '../ui/Input';

const CATEGORY_ICONS = [
    { id: 'book', name: '📚', label: 'Sách' },
    { id: 'question', name: '❓', label: 'Hỏi đáp' },
    { id: 'lightbulb', name: '💡', label: 'Ý tưởng' },
    { id: 'star', name: '⭐', label: 'Nổi bật' },
    { id: 'fire', name: '🔥', label: 'Nóng' },
    { id: 'trophy', name: '🏆', label: 'Cúp' },
    { id: 'heart', name: '❤️', label: 'Yêu thích' },
    { id: 'rocket', name: '🚀', label: 'Khởi đầu' },
    { id: 'target', name: '🎯', label: 'Mục tiêu' },
    { id: 'graduation-cap', name: '🎓', label: 'Tốt nghiệp' },
];

const CategoryManagementModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'book',
        color: '#3DCBB1',
    });

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/forum/categories');
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError(t('forum.fetchCategoriesError', 'Không thể tải danh mục'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axiosClient.post('/api/forum/categories', {
                name: formData.name,
                description: formData.description,
                icon: formData.icon,
                color: formData.color,
            });

            setFormData({
                name: '',
                description: '',
                icon: 'book',
                color: '#3DCBB1',
            });

            if (onSuccess) {
                onSuccess();
            }

            await fetchCategories();
        } catch (error) {
            console.error('Error creating category:', error);
            setError(error.response?.data?.message || t('forum.createCategoryError', 'Không thể tạo danh mục'));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('forum.createCategory', 'Tạo Danh Mục Mới')}
            size="md"
        >
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forum.categoryName')} *
                    </label>
                    <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={t('forum.categoryNamePlaceholder', 'Ví dụ: TOPIK, OPIc, EPS-TOPIK')}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forum.categoryDescription')}
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder={t('forum.categoryDescriptionPlaceholder', 'Mô tả ngắn gọn về danh mục...')}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forum.selectIcon')}
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {CATEGORY_ICONS.map((icon) => (
                            <button
                                key={icon.id}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, icon: icon.id }))}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    formData.icon === icon.id
                                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="text-2xl">{icon.name}</div>
                                <div className="text-xs text-gray-500">{icon.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forum.selectColor')}
                    </label>
                    <div className="flex gap-2">
                        {['#3DCBB1', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899'].map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, color }))}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${
                                    formData.color === color
                                        ? 'ring-2 ring-offset-2 ring-primary-500'
                                        : 'hover:ring-2 hover:ring-gray-200'
                                }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                {categories.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('forum.existingCategories', 'Danh mục hiện tại')}
                        </label>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{cat.icon || '📁'}</span>
                                        <span className="font-medium text-gray-700">{cat.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {cat.postsCount || 0} {t('forum.threads', 'bài viết')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading || !formData.name.trim()}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                {t('forum.creating', 'Đang tạo...')}
                            </div>
                        ) : (
                            <>
                                <X className="w-4 h-4 mr-2" />
                                {t('forum.createCategory', 'Tạo Danh Mục')}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CategoryManagementModal;
