import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen, FileText, Clock, Filter } from 'lucide-react';
import { searchService } from '../services/searchService';
import './SearchPage.css';

const SearchPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        if (query.trim()) {
            performSearch(query, filterType);
        }
    }, [query, filterType]);

    const performSearch = async (searchQuery, type = 'all') => {
        try {
            setLoading(true);
            const response = await searchService.search(searchQuery, type);
            setResults(response.data || []);
        } catch (err) {
            console.error('Search error:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (type) => {
        setFilterType(type);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'course':
                return <BookOpen className="w-5 h-5" />;
            case 'exam':
                return <FileText className="w-5 h-5" />;
            default:
                return <Search className="w-5 h-5" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'course':
                return t('search.course', 'Khóa học');
            case 'exam':
                return t('search.exam', 'Bài test');
            default:
                return '';
        }
    };

    const groupedResults = results.reduce((acc, result) => {
        if (!acc[result.type]) {
            acc[result.type] = [];
        }
        acc[result.type].push(result);
        return acc;
    }, {});

    return (
        <div className="search-page">
            {/* Hero Section */}
            <div className="search-hero">
                <div className="search-hero-content">
                    <h1 className="search-hero-title">
                        <Search className="hero-icon" />
                        {t('search.title', 'Tìm Kiếm')}
                    </h1>
                    <div className="search-hero-query">
                        "{query}"
                    </div>
                    <p className="search-hero-subtitle">
                        {t('search.subtitle', 'Tìm kiếm khóa học và bài test phù hợp với bạn')}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="search-filters">
                <div className="filters-container">
                    <button
                        className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                        onClick={() => handleTypeChange('all')}
                    >
                        {t('search.all', 'Tất cả')}
                    </button>
                    <button
                        className={`filter-btn ${filterType === 'courses' ? 'active' : ''}`}
                        onClick={() => handleTypeChange('courses')}
                    >
                        <BookOpen className="w-4 h-4" />
                        {t('search.courses', 'Khóa học')}
                    </button>
                    <button
                        className={`filter-btn ${filterType === 'exams' ? 'active' : ''}`}
                        onClick={() => handleTypeChange('exams')}
                    >
                        <FileText className="w-4 h-4" />
                        {t('search.exams', 'Bài test')}
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="search-results-section">
                <div className="results-container">
                    {loading ? (
                        <div className="search-loading-large">
                            <div className="spinner"></div>
                            <p>{t('common.loading', 'Đang tải...')}</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="search-no-results-large">
                            <Search className="no-results-icon-large" />
                            <h2>{t('search.noResultsTitle', 'Không tìm thấy kết quả')}</h2>
                            <p>{t('search.tryDifferentKeywords', 'Thử từ khóa khác hoặc bộ lọc khác')}</p>
                        </div>
                    ) : (
                        <>
                          <div className="results-count-header">
                              <span className="count">
                                  {results.length} {t('search.resultsFound', 'kết quả tìm thấy')}
                              </span>
                              <span className="query">
                                  "{query}"
                              </span>
                          </div>

                          {Object.keys(groupedResults).map(type => (
                              <div key={type} className="result-group">
                                  <div className="result-group-header">
                                      {getIcon(type)}
                                      <h2>{getTypeLabel(type)}</h2>
                                      <span className="group-count">{groupedResults[type].length}</span>
                                  </div>
                                  <div className="result-group-list">
                                      {groupedResults[type].map((result) => (
                                          <div
                                              key={`${type}-${result.id}`}
                                              className="search-result-card"
                                              onClick={() => navigate(result.url)}
                                          >
                                              <div className="result-card-icon">
                                                  {getIcon(type)}
                                              </div>
                                              <div className="result-card-content">
                                                  <div className="result-card-header">
                                                      <span className="result-card-type-badge">
                                                          {getTypeLabel(type)}
                                                      </span>
                                                      {result.duration && (
                                                          <span className="result-card-meta">
                                                              <Clock className="w-4 h-4" />
                                                              {result.duration} {t('search.minutes', 'phút')}
                                                          </span>
                                                      )}
                                                      {result.questionCount && (
                                                          <span className="result-card-meta">
                                                              <FileText className="w-4 h-4" />
                                                              {result.questionCount} {t('search.questions', 'câu hỏi')}
                                                          </span>
                                                      )}
                                                  </div>
                                                  <h3 className="result-card-title">{result.title}</h3>
                                                  {result.description && (
                                                      <p className="result-card-description">
                                                          {result.description}
                                                      </p>
                                                  )}
                                                  {result.code && (
                                                      <span className="result-card-code">{result.code}</span>
                                                  )}
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
