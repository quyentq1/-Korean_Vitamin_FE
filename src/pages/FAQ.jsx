import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { faqService } from '../services/faqService';
import './FAQ.css';

const FAQ = () => {
    const { t, i18n } = useTranslation();
    const [faqs, setFaqs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchFAQs();
        fetchCategories();
    }, [i18n.language]);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const response = await faqService.getFAQs(i18n.language || 'vi');
            setFaqs(response.data || []);
        } catch (err) {
            console.error('Error fetching FAQs:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await faqService.getCategories(i18n.language || 'vi');
            setCategories(['all', ...(response.data || [])]);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleSearch = async (keyword) => {
        setSearchKeyword(keyword);
        if (keyword.trim()) {
            try {
                setLoading(true);
                const response = await faqService.searchFAQs(keyword, i18n.language || 'vi');
                setFaqs(response.data || []);
            } catch (err) {
                console.error('Error searching FAQs:', err);
            } finally {
                setLoading(false);
            }
        } else {
            fetchFAQs();
        }
    };

    const handleCategoryChange = async (category) => {
        setSelectedCategory(category);
        if (category === 'all') {
            fetchFAQs();
        } else {
            try {
                setLoading(true);
                const response = await faqService.getFAQsByCategory(category, i18n.language || 'vi');
                setFaqs(response.data || []);
            } catch (err) {
                console.error('Error fetching FAQs by category:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'all': '📚',
            'general': '📋',
            'course': '📖',
            'payment': '💳',
            'account': '👤',
            'technical': '🔧',
            'topik': '🎯',
            'default': '❓'
        };
        return icons[category] || icons['default'];
    };

    return (
        <div className="faq-page">
            {/* Hero Section */}
            <div className="faq-hero">
                <div className="faq-hero-content">
                    <h1 className="faq-hero-title">
                        <span className="faq-icon">💡</span>
                        {t('faq.pageTitle', 'Câu Hỏi Thường Gặp')}
                    </h1>
                    <p className="faq-hero-subtitle">
                        {t('faq.pageSubtitle', 'Tìm câu trả lời cho mọi thắc mắc của bạn về khóa học, thanh toán và nhiều hơn nữa')}
                    </p>
                </div>
            </div>

            {/* Search Section */}
            <div className="faq-search-section">
                <div className="faq-search-container">
                    <div className="faq-search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="faq-search-input"
                            placeholder={t('faq.searchPlaceholder', 'Tìm kiếm câu hỏi...')}
                            value={searchKeyword}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {searchKeyword && (
                            <button
                                className="clear-search"
                                onClick={() => handleSearch('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Categories Filter */}
            <div className="faq-categories-section">
                <div className="faq-categories-container">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`faq-category-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(category)}
                        >
                            <span className="category-icon">
                                {getCategoryIcon(category)}
                            </span>
                            <span className="category-label">
                                {t(`faq.category.${category}`, category === 'all' ? t('faq.allCategories', 'Tất cả') : category)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* FAQ List */}
            <div className="faq-content-section">
                <div className="faq-container">
                    {loading ? (
                        <div className="faq-loading">
                            <div className="spinner"></div>
                            <p>{t('common.loading', 'Đang tải...')}</p>
                        </div>
                    ) : faqs.length === 0 ? (
                        <div className="faq-empty">
                            <span className="empty-icon">🔍</span>
                            <h3>{t('faq.noResults', 'Không tìm thấy kết quả')}</h3>
                            <p>{t('faq.tryDifferentKeyword', 'Thử từ khóa khác hoặc chọn danh mục khác')}</p>
                        </div>
                    ) : (
                        <div className="faq-list">
                            {faqs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className={`faq-item ${expandedId === faq.id ? 'expanded' : ''}`}
                                >
                                    <div
                                        className="faq-question"
                                        onClick={() => toggleExpand(faq.id)}
                                    >
                                        <div className="question-content">
                                            {faq.category && (
                                                <span className="question-category">
                                                    {getCategoryIcon(faq.category.toLowerCase())}
                                                </span>
                                            )}
                                            <h3 className="question-text">{faq.question}</h3>
                                        </div>
                                        <div className="expand-icon">
                                            {expandedId === faq.id ? '−' : '+'}
                                        </div>
                                    </div>
                                    <div className={`faq-answer ${expandedId === faq.id ? 'visible' : ''}`}>
                                        <div className="answer-content">
                                            <p>{faq.answer}</p>
                                            {faq.viewCount !== undefined && (
                                                <span className="view-count">
                                                    {t('faq.views', 'lượt xem')}: {faq.viewCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Contact CTA */}
            {!searchKeyword && selectedCategory === 'all' && (
                <div className="faq-contact-cta">
                    <div className="cta-content">
                        <h2>{t('faq.stillHaveQuestions', 'Vẫn còn thắc mắc?')}</h2>
                        <p>{t('faq.contactUsDesc', 'Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn')}</p>
                        <button className="cta-button">
                            {t('faq.contactUs', 'Liên hệ ngay')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FAQ;
