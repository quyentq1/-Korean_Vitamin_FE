import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X, Clock, FileText, BookOpen } from 'lucide-react';
import { searchService } from '../services/searchService';
import './SearchBar.css';

const SearchBar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showResults || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleResultClick(results[selectedIndex]);
          } else if (query.trim()) {
            navigateToSearchPage();
          }
          break;
        case 'Escape':
          setShowResults(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showResults, results, selectedIndex, query]);

  const performSearch = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await searchService.search(searchQuery, 'all');
      setResults(response.data || []);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleResultClick = (result) => {
    setShowResults(false);
    setQuery('');
    setResults([]);
    navigate(result.url);
  };

  const navigateToSearchPage = () => {
    setShowResults(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigateToSearchPage();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'exam':
        return <FileText className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
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

  return (
    <div className="search-bar" ref={searchRef}>
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={t('search.placeholder', 'Tìm kiếm khóa học, bài test...')}
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (query.trim().length >= 2 && results.length > 0) {
                setShowResults(true);
              }
            }}
          />
          {query && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {showResults && (
        <div className="search-results-dropdown">
          {loading ? (
            <div className="search-loading">
              <div className="spinner-small"></div>
              <span>{t('common.loading', 'Đang tải...')}</span>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="search-results-header">
                <span className="results-count">
                  {results.length} {t('search.results', 'kết quả')}
                </span>
              </div>
              <div className="search-results-list">
                {results.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className={`search-result-item ${
                      index === selectedIndex ? 'selected' : ''
                    }`}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="result-icon">
                      {getIcon(result.type)}
                    </div>
                    <div className="result-content">
                      <div className="result-header">
                        <span className="result-type-badge">
                          {getTypeLabel(result.type)}
                        </span>
                        {result.duration && (
                          <span className="result-meta">
                            <Clock className="w-3 h-3" />
                            {result.duration} {t('search.minutes', 'phút')}
                          </span>
                        )}
                        {result.questionCount && (
                          <span className="result-meta">
                            <FileText className="w-3 h-3" />
                            {result.questionCount} {t('search.questions', 'câu hỏi')}
                          </span>
                        )}
                      </div>
                      <h4 className="result-title">{result.title}</h4>
                      {result.description && (
                        <p className="result-description">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="search-view-all"
                onClick={navigateToSearchPage}
              >
                {t('search.viewAllResults', 'Xem tất cả kết quả')}
              </div>
            </>
          ) : query.trim().length >= 2 ? (
            <div className="search-no-results">
              <Search className="no-results-icon" />
              <p>{t('search.noResults', 'Không tìm thấy kết quả nào')}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
