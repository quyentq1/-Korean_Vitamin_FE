import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import educationManagerService from '../../services/educationManagerService';
import teacherService from '../../services/teacherService';
import {
    ChevronLeft, ChevronRight, Filter, ArrowUpDown, CheckCircle, XCircle,
    AlertCircle, CheckSquare, Eye, X, Info, FileText, Lock, ChevronUp, ChevronDown
} from 'lucide-react';
import Swal from 'sweetalert2';

const QBApproval = () => {
    const { t } = useTranslation();
    const [questions, setQuestions] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]); // Store all fetched questions
    const [loading, setLoading] = useState(true);

    // NEW: Tab state (COURSE vs CLASS)
    const [activeTab, setActiveTab] = useState('COURSE'); // 'COURSE' or 'CLASS'

    // Status filter (PENDING, REJECTED, APPROVED)
    const [statusFilter, setStatusFilter] = useState('PENDING');

    // Filter states
    const [selectedLevel, setSelectedLevel] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedType, setSelectedType] = useState('ALL');

    // Sort states
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Bulk selection states
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Preview modal state
    const [previewQuestion, setPreviewQuestion] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [approvalHistory, setApprovalHistory] = useState([]);

    useEffect(() => {
        console.log('🚀 QBApproval Component Mounted! Active Tab:', activeTab);
        console.log('=== Component Mounted ===');
        fetchQuestions();
    }, [statusFilter]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);

            let res;
            if (statusFilter === 'PENDING') {
                res = await educationManagerService.getPendingQuestions();
            } else {
                res = await educationManagerService.getQuestionsByStatus(statusFilter);
            }

            if (!res || !Array.isArray(res)) {
                console.error('Invalid response:', res);
                setQuestions([]);
                return;
            }

            console.log(`Fetched ${statusFilter} questions:`, res.length);

            // Only check duplicates for PENDING questions
            let data = res;
            if (statusFilter === 'PENDING') {
                // Performance optimization: Use batch duplicate check
                let duplicateScores = {};
                if (res.length > 0) {
                    try {
                        const questionTexts = res.map(q => q.questionText);
                        const batchResult = await educationManagerService.checkDuplicatesBatch(questionTexts);

                        if (batchResult && batchResult.results) {
                            duplicateScores = batchResult.results.reduce((acc, result) => {
                                acc[result.text] = result.score;
                                return acc;
                            }, {});
                        }
                    } catch (err) {
                        console.error('Batch duplicate check failed, falling back to individual checks:', err);
                        // Fallback: Check individually
                        const scores = await Promise.all(res.map(async (q) => {
                            try {
                                const check = await educationManagerService.checkDuplicate(q.questionText);
                                return { id: q.id, score: check.score };
                            } catch (err) {
                                return { id: q.id, score: 0 };
                            }
                        }));
                        duplicateScores = scores.reduce((acc, item) => {
                            const q = res.find(q => q.id === item.id);
                            if (q) acc[q.questionText] = item.score;
                            return acc;
                        }, {});
                    }
                }

                // Merge with duplicate scores
                data = res.map(q => ({
                    ...q,
                    duplicateScore: duplicateScores[q.questionText] || 0
                }));
            }

            console.log('Processed questions:', data.length);
            console.log('First 3 questions:', data.slice(0, 3).map(q => ({
                id: q.id,
                unit: q.unit,
                level: q.level,
                hasUnit: !!q.unit,
                hasLevel: !!q.level
            })));
            setAllQuestions(data);
            console.log('✓ setAllQuestions called with', data.length, 'questions');
        } catch (error) {
            console.error(`Failed to fetch ${statusFilter} questions:`, error);
            setAllQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    // NEW: Filter questions by activeTab (COURSE vs CLASS)
    useEffect(() => {
        let filtered = allQuestions;

        console.log('=== Tab Filter Debug ===');
        console.log('Active Tab:', activeTab);
        console.log('Total questions before filter:', allQuestions.length);

        if (activeTab === 'COURSE') {
            // Course questions: KHÔNG có unit (unit is null) và CÓ level
            filtered = allQuestions.filter(q => !q.unit && q.level);
            console.log('Course questions (no unit, has level):', filtered.length);
        } else if (activeTab === 'CLASS') {
            // Class questions: CÓ unit (unit is not null)
            filtered = allQuestions.filter(q => q.unit !== null && q.unit !== undefined);
            console.log('Class questions (has unit):', filtered.length);
        }

        console.log('Final questions count:', filtered.length);
        console.log('=========================');
        setQuestions(filtered);
    }, [allQuestions, activeTab]);

    const handleApprove = async (id) => {
        try {
            await educationManagerService.approveQuestion(id);
            // Update allQuestions instead of questions
            setAllQuestions(prev => prev.filter(q => q.id !== id));
            setSelectedIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            Swal.fire({
                icon: 'success',
                title: t('manager.qbApproval.approved'),
                text: t('manager.qbApproval.approvedSuccess'),
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Failed to approve", error);
            Swal.fire({
                icon: 'error',
                title: t('common.error'),
                text: t('manager.qbApproval.approveFailed'),
            });
        }
    };

    const handleReject = async (id) => {
        const { value: feedback } = await Swal.fire({
            title: t('manager.qbApproval.rejectTitle'),
            input: 'textarea',
            inputLabel: t('manager.qbApproval.rejectReasonLabel'),
            inputPlaceholder: t('manager.qbApproval.rejectPlaceholder'),
            inputAttributes: {
                'aria-label': 'Type your comment here'
            },
            showCancelButton: true,
            confirmButtonText: t('common.reject'),
            cancelButtonText: t('common.cancel'),
            confirmButtonColor: '#d33',
            inputValidator: (value) => {
                if (!value) {
                    return t('manager.qbApproval.rejectReasonRequired');
                }
            }
        });

        if (feedback) {
            try {
                await educationManagerService.rejectQuestion(id, feedback);
                // Update allQuestions instead of questions
                setAllQuestions(prev => prev.filter(q => q.id !== id));
                setSelectedIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
                Swal.fire({
                    icon: 'success',
                    title: t('manager.qbApproval.rejected'),
                    text: t('manager.qbApproval.rejectedSuccess'),
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("Failed to reject", error);
                Swal.fire({
                    icon: 'error',
                    title: t('common.error'),
                    text: t('manager.qbApproval.rejectFailed'),
                });
            }
        }
    };

    // Bulk selection handlers
    const handleSelectOne = (id) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const allIds = new Set(paginatedQuestions.map(q => q.id));
        setSelectedIds(prev => {
            return prev.size === paginatedQuestions.length ? new Set() : allIds;
        });
    };

    const handleSelectPage = () => {
        const pageIds = new Set(paginatedQuestions.map(q => q.id));
        setSelectedIds(prev => {
            const allPageSelected = pageIds.size === paginatedQuestions.length &&
                [...pageIds].every(id => prev.has(id));
            if (allPageSelected) {
                const newSet = new Set(prev);
                pageIds.forEach(id => newSet.delete(id));
                return newSet;
            } else {
                return new Set([...prev, ...pageIds]);
            }
        });
    };

    const handleClearSelection = () => {
        setSelectedIds(new Set());
    };

    // Bulk actions
    const handleBulkApprove = async () => {
        if (selectedIds.size === 0) return;

        const { value: confirm } = await Swal.fire({
            title: t('manager.qbApproval.bulkApproveTitle'),
            text: t('manager.qbApproval.bulkApproveText', { count: selectedIds.size }),
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('manager.qbApproval.approveAll'),
            cancelButtonText: t('common.cancel')
        });

        if (confirm) {
            setBulkActionLoading(true);
            try {
                await Promise.all(
                    [...selectedIds].map(id => educationManagerService.approveQuestion(id))
                );
                // Update allQuestions instead of setPendingQuestions
                setAllQuestions(prev => prev.filter(q => !selectedIds.has(q.id)));
                setSelectedIds(new Set());
                Swal.fire({
                    icon: 'success',
                    title: t('manager.qbApproval.approved'),
                    text: t('manager.qbApproval.bulkApprovedSuccess', { count: selectedIds.size }),
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("Bulk approve failed", error);
                Swal.fire({
                    icon: 'error',
                    title: t('common.error'),
                    text: t('manager.qbApproval.bulkApproveFailed'),
                });
            } finally {
                setBulkActionLoading(false);
            }
        }
    };

    const handleBulkReject = async () => {
        if (selectedIds.size === 0) return;

        const { value: feedback } = await Swal.fire({
            title: t('manager.qbApproval.bulkRejectTitle', { count: selectedIds.size }),
            input: 'textarea',
            inputLabel: t('manager.qbApproval.bulkRejectReasonLabel'),
            inputPlaceholder: t('manager.qbApproval.bulkRejectPlaceholder'),
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('manager.qbApproval.rejectAll'),
            cancelButtonText: t('common.cancel'),
            inputValidator: (value) => {
                if (!value) {
                    return t('manager.qbApproval.rejectReasonRequired');
                }
            }
        });

        if (feedback) {
            setBulkActionLoading(true);
            try {
                await Promise.all(
                    [...selectedIds].map(id => educationManagerService.rejectQuestion(id, feedback))
                );
                // Update allQuestions instead of setPendingQuestions
                setAllQuestions(prev => prev.filter(q => !selectedIds.has(q.id)));
                setSelectedIds(new Set());
                Swal.fire({
                    icon: 'success',
                    title: t('manager.qbApproval.rejected'),
                    text: t('manager.qbApproval.bulkRejectedSuccess', { count: selectedIds.size }),
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("Bulk reject failed", error);
                Swal.fire({
                    icon: 'error',
                    title: t('common.error'),
                    text: t('manager.qbApproval.bulkRejectFailed'),
                });
            } finally {
                setBulkActionLoading(false);
            }
        }
    };

    // Preview modal
    const handlePreview = async (question) => {
        console.log('=== Preview Question Debug ===');
        console.log('Question ID:', question.id);
        console.log('Question from list imageUrl:', question.imageUrl);
        console.log('Question from list image_url:', question.image_url);

        // Fetch full question details to get imageUrl
        let fullQuestion = null;
        try {
            // Try education manager service first
            fullQuestion = await educationManagerService.getQuestionForReview(question.id);
            console.log('✓ Fetched from EduManager API');
            console.log('Full question imageUrl:', fullQuestion?.imageUrl);
            console.log('Full question image_url:', fullQuestion?.image_url);
        } catch (eduError) {
            console.error('✗ Failed to fetch from EduManager API:', eduError);
            // Fallback to teacher service
            try {
                fullQuestion = await teacherService.getQuestion(question.id);
                console.log('✓ Fetched from Teacher API');
                console.log('Full question imageUrl:', fullQuestion?.imageUrl);
            } catch (teacherError) {
                console.error('✗ Failed to fetch from Teacher API:', teacherError);
            }
        }

        if (fullQuestion) {
            console.log('✓ Setting previewQuestion with imageUrl:', fullQuestion.imageUrl || fullQuestion.image_url);
            setPreviewQuestion(fullQuestion);
        } else {
            // Last resort: use question from list
            console.warn('⚠ Using question from list as fallback');
            console.warn('Fallback imageUrl:', question.imageUrl || question.image_url);
            setPreviewQuestion(question);
        }

        setShowPreviewModal(true);

        // Fetch approval history
        try {
            const history = await educationManagerService.getQuestionHistory(question.id);
            setApprovalHistory(history || []);
        } catch (error) {
            console.error('Failed to fetch approval history:', error);
            setApprovalHistory([]);
        }

        console.log('============================');
    };

    // Get unique values for filters
    const categories = useMemo(() => {
        const cats = new Set(questions.map(q => q.categoryName).filter(Boolean));
        return ['ALL', ...Array.from(cats).sort()];
    }, [questions]);

    const levels = useMemo(() => {
        const lvls = new Set(questions.map(q => q.level));
        return ['ALL', ...Array.from(lvls).sort()];
    }, [questions]);

    const types = useMemo(() => {
        const typs = new Set(questions.map(q => q.questionType));
        return ['ALL', ...Array.from(typs).sort()];
    }, [questions]);

    // Filter questions
    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            // Filter by level (for COURSE) or unit (for CLASS)
            let matchLevelUnit = true;
            if (activeTab === 'COURSE') {
                matchLevelUnit = selectedLevel === 'ALL' || q.level === selectedLevel;
            } else if (activeTab === 'CLASS') {
                // For CLASS, selectedLevel contains unit values (LEVEL_1 to LEVEL_12)
                matchLevelUnit = selectedLevel === 'ALL' || q.unit === parseInt(selectedLevel.replace('LEVEL_', ''));
            }

            const matchCategory = selectedCategory === 'ALL' || q.categoryName === selectedCategory;
            const matchType = selectedType === 'ALL' || q.questionType === selectedType;
            return matchLevelUnit && matchCategory && matchType;
        });
    }, [questions, selectedLevel, selectedCategory, selectedType, activeTab]);

    // Sort questions
    const sortedQuestions = useMemo(() => {
        const sorted = [...filteredQuestions].sort((a, b) => {
            let compareValue = 0;

            switch (sortBy) {
                case 'createdAt':
                    compareValue = new Date(a.createdAt) - new Date(b.createdAt);
                    break;
                case 'level':
                    if (activeTab === 'COURSE') {
                        const levelOrder = { 'LEVEL_1': 1, 'LEVEL_2': 2, 'LEVEL_3': 3, 'LEVEL_4': 4, 'LEVEL_5': 5, 'LEVEL_6': 6 };
                        compareValue = (levelOrder[a.level] || 0) - (levelOrder[b.level] || 0);
                    } else if (activeTab === 'CLASS') {
                        // Sort by unit for CLASS questions
                        compareValue = (a.unit || 0) - (b.unit || 0);
                    }
                    break;
                case 'points':
                    compareValue = a.points - b.points;
                    break;
                case 'duplicateScore':
                    compareValue = a.duplicateScore - b.duplicateScore;
                    break;
                default:
                    compareValue = 0;
            }

            return sortOrder === 'asc' ? compareValue : -compareValue;
        });
        return sorted;
    }, [filteredQuestions, sortBy, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(sortedQuestions.length / itemsPerPage);
    const paginatedQuestions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedQuestions.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedQuestions, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedLevel, selectedCategory, selectedType, sortBy, sortOrder]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('manager.qbApproval.loadingQuestions')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="pt-20 sm:pt-24 pb-8 sm:pb-16 container mx-auto px-4 sm:px-6">
                {/* Debug log */}
                {console.log('🎯 RENDER QBApproval - activeTab:', activeTab, '| allQuestions:', allQuestions.length, '| questions:', questions.length)}
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {statusFilter === 'PENDING' && t('manager.qbApproval.titlePending')}
                            {statusFilter === 'REJECTED' && t('manager.qbApproval.titleRejected')}
                            {statusFilter === 'APPROVED' && t('manager.qbApproval.titleApproved')}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            activeTab === 'COURSE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                            {activeTab === 'COURSE' ? t('manager.qbApproval.tabCourse') : t('manager.qbApproval.tabClass')}
                        </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">
                        {t('manager.qbApproval.questionSummary', { total: questions.length, tabLabel: activeTab === 'COURSE' ? t('manager.qbApproval.courseLabel') : t('manager.qbApproval.classLabel'), filtered: filteredQuestions.length })}
                    </p>
                </div>

                {/* Bulk Action Bar - Only show for PENDING status */}
                {selectedIds.size > 0 && statusFilter === 'PENDING' && (
                    <div
                        className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 animate-fade-in"
                        role="region"
                        aria-label="Bulk actions"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                                <span className="font-semibold text-indigo-900">
                                    {t('manager.qbApproval.selectedCount', { count: selectedIds.size })}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Bulk action buttons">
                                <button
                                    onClick={handleClearSelection}
                                    className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                    aria-label={t('manager.qbApproval.clearSelection')}
                                    type="button"
                                >
                                    {t('manager.qbApproval.clearSelection')}
                                </button>
                                <button
                                    onClick={handleBulkApprove}
                                    disabled={bulkActionLoading}
                                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
                                    aria-label={t('manager.qbApproval.approveSelected', { count: selectedIds.size })}
                                    aria-busy={bulkActionLoading}
                                    type="button"
                                >
                                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                    {t('manager.qbApproval.approveAll')}
                                </button>
                                <button
                                    onClick={handleBulkReject}
                                    disabled={bulkActionLoading}
                                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
                                    aria-label={t('manager.qbApproval.rejectSelected', { count: selectedIds.size })}
                                    aria-busy={bulkActionLoading}
                                    type="button"
                                >
                                    <XCircle className="w-4 h-4" aria-hidden="true" />
                                    {t('manager.qbApproval.rejectAll')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                    {/* NEW: Course/Class Tabs */}
                    <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 border-b border-gray-200 pb-4">
                        <button
                            onClick={() => {
                                setActiveTab('COURSE');
                                setCurrentPage(1); // Reset pagination when switching tabs
                            }}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                activeTab === 'COURSE'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            type="button"
                        >
                            {t('manager.qbApproval.courseQuestions')}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('CLASS');
                                setCurrentPage(1); // Reset pagination when switching tabs
                            }}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                activeTab === 'CLASS'
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            type="button"
                        >
                            {t('manager.qbApproval.classQuestions')}
                        </button>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 border-b border-gray-200 pb-4">
                        <button
                            onClick={() => setStatusFilter('PENDING')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                statusFilter === 'PENDING'
                                    ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                            }`}
                            type="button"
                        >
                            {t('manager.qbApproval.statusPending')}
                        </button>
                        <button
                            onClick={() => setStatusFilter('REJECTED')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                statusFilter === 'REJECTED'
                                    ? 'bg-red-100 text-red-800 border-2 border-red-300'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                            }`}
                            type="button"
                        >
                            {t('manager.qbApproval.statusRejected')}
                        </button>
                        <button
                            onClick={() => setStatusFilter('APPROVED')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                statusFilter === 'APPROVED'
                                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                            }`}
                            type="button"
                        >
                            {t('manager.qbApproval.statusApproved')}
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" aria-hidden="true" />
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{t('manager.qbApproval.detailedFilters')}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSelectPage}
                                className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                aria-label={t('manager.qbApproval.selectCurrentPage')}
                                type="button"
                            >
                                {t('manager.qbApproval.selectCurrentPage')}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" role="group" aria-label={t('manager.qbApproval.questionFilters')}>
                        {/* Level Filter - Only for COURSE */}
                        {activeTab === 'COURSE' && (
                            <div>
                                <label htmlFor="level-filter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                    Level
                                </label>
                                <select
                                    id="level-filter"
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    aria-label={t('manager.qbApproval.filterByLevel')}
                                >
                                    {levels.map(level => (
                                        <option key={level} value={level}>
                                            {level === 'ALL' ? t('common.all') : level}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Unit Filter - Only for CLASS */}
                        {activeTab === 'CLASS' && (
                            <div>
                                <label htmlFor="unit-filter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                    Unit
                                </label>
                                <select
                                    id="unit-filter"
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    aria-label={t('manager.qbApproval.filterByUnit')}
                                >
                                    {[...Array.from({length: 12}, (_, i) => i + 1), 'ALL'].map(unit => (
                                        <option key={unit === 'ALL' ? 'ALL' : unit} value={unit === 'ALL' ? 'ALL' : `LEVEL_${unit}`}>
                                            {unit === 'ALL' ? t('common.all') : `Unit ${unit}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Category Filter */}
                        <div>
                            <label htmlFor="category-filter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                {t('manager.qbApproval.category')}
                            </label>
                            <select
                                id="category-filter"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                aria-label={t('manager.qbApproval.filterByCategory')}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'ALL' ? t('common.all') : cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label htmlFor="type-filter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                {t('manager.qbApproval.questionType')}
                            </label>
                            <select
                                id="type-filter"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                aria-label={t('manager.qbApproval.filterByType')}
                            >
                                {types.map(type => (
                                    <option key={type} value={type}>
                                        {type === 'ALL' ? t('common.all') : type.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="w-4 h-4 text-gray-500" aria-hidden="true" />
                                <label htmlFor="sort-select" className="text-xs sm:text-sm font-medium text-gray-700">
                                    {t('manager.qbApproval.sortBy')}:
                                </label>
                            </div>
                            <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('manager.qbApproval.sortOptions')}>
                                <select
                                    id="sort-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    aria-label={t('manager.qbApproval.selectSortCriteria')}
                                >
                                    <option value="createdAt">{t('manager.qbApproval.sortCreatedDate')}</option>
                                    <option value="level">Level</option>
                                    <option value="points">{t('manager.qbApproval.sortPoints')}</option>
                                    <option value="duplicateScore">{t('manager.qbApproval.sortDuplicateScore')}</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    aria-label={sortOrder === 'asc' ? t('manager.qbApproval.sortAscending') : t('manager.qbApproval.sortDescending')}
                                    aria-pressed={sortOrder === 'asc'}
                                    type="button"
                                >
                                    {sortOrder === 'asc' ? t('manager.qbApproval.ascending') : t('manager.qbApproval.descending')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                {paginatedQuestions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-6 sm:p-12 text-center">
                        <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-gray-600">
                            {filteredQuestions.length === 0
                                ? t('manager.qbApproval.noMatchingQuestions')
                                : t('manager.qbApproval.noPendingQuestions')}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Select All Bar - Only show for PENDING */}
                        {statusFilter === 'PENDING' && (
                            <div className="bg-white rounded-t-xl shadow-sm px-4 py-2 sm:px-6 sm:py-3 border-b border-gray-200 flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={paginatedQuestions.length > 0 && paginatedQuestions.every(q => selectedIds.has(q.id))}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                                        {t('manager.qbApproval.selectAllOnPage', { count: paginatedQuestions.length })}
                                    </span>
                                </label>
                            </div>
                        )}

                        <div className={`space-y-0 sm:space-y-4 ${statusFilter === 'PENDING' ? '' : 'pt-4 sm:pt-6'}`}>
                            {paginatedQuestions.map((q) => (
                                <div
                                    key={q.id}
                                    className={`bg-white shadow-sm hover:shadow-md transition-shadow p-3 sm:p-6 border-l-4 ${
                                        selectedIds.has(q.id) ? 'border-indigo-600 bg-indigo-50' : 'border-transparent'
                                    }`}
                                >
                                    <div className="flex flex-col gap-3 sm:gap-4">
                                        <div className="flex items-start gap-3">
                                            {/* Checkbox - Only show for PENDING */}
                                            {statusFilter === 'PENDING' && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(q.id)}
                                                    onChange={() => handleSelectOne(q.id)}
                                                    className="w-4 h-4 sm:w-5 sm:h-5 mt-1 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                                />
                                            )}
                                            {statusFilter !== 'PENDING' && <div className="w-4 h-4 sm:w-5 sm:h-5"></div>}

                                            <div className="flex-1 min-w-0">
                                                {/* Badges */}
                                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                                    <span className="font-bold text-indigo-600 text-sm">#{q.id}</span>
                                                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-semibold rounded uppercase">
                                                        {q.questionType.replace(/_/g, ' ')}
                                                    </span>
                                                    {/* Show Level for COURSE questions, Unit for CLASS questions */}
                                                    {q.unit ? (
                                                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-800 text-[10px] sm:text-xs font-semibold rounded">
                                                            Unit {q.unit}
                                                        </span>
                                                    ) : (
                                                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-semibold rounded">
                                                            {q.level}
                                                        </span>
                                                    )}
                                                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-800 text-[10px] sm:text-xs font-semibold rounded">
                                                        {q.categoryName || 'N/A'}
                                                    </span>
                                                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-800 text-[10px] sm:text-xs font-semibold rounded">
                                                        {q.points} pts
                                                    </span>
                                                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded ${
                                                        q.duplicateScore > 50
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-emerald-100 text-emerald-800'
                                                    }`}>
                                                        {t('manager.qbApproval.duplicate')}: {q.duplicateScore}%
                                                    </span>
                                                    {q.createdBy && (
                                                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-[10px] sm:text-xs font-semibold rounded">
                                                            👤 {q.createdBy.fullName || q.createdBy.username || 'Unknown'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Question Text */}
                                                <p className="text-gray-800 font-medium text-base sm:text-lg mb-2 sm:mb-3 break-words">{q.questionText}</p>

                                                {/* Options Preview */}
                                                {q.options && q.options.length > 0 && (
                                                    <div className="text-xs sm:text-sm text-gray-600 mb-2">
                                                        <span className="font-semibold">{t('manager.qbApproval.answer')}:</span>{' '}
                                                        {q.options.filter(o => o.isCorrect).map(o => `${o.optionOrder}. ${o.optionText}`).join(', ')}
                                                    </div>
                                                )}

                                                {/* Explanation Preview */}
                                                {q.explanation && q.explanation !== 'null' && !q.explanation.includes('[APPROVAL FEEDBACK]') && !q.explanation.includes('[REJECTION REASON]') && (
                                                    <div className="text-xs sm:text-sm text-gray-600 italic truncate">
                                                        {t('manager.qbApproval.explanation')}: {q.explanation}
                                                    </div>
                                                )}

                                                {/* Rejection Badge */}
                                                {q.verificationStatus === 'REJECTED' && (
                                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-50 border border-red-200 rounded-lg">
                                                        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                                                        <span className="text-xs sm:text-sm font-medium text-red-700">
                                                            {t('manager.qbApproval.rejectedViewDetails')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap items-center gap-2 pl-7 sm:pl-9">
                                            <button
                                                onClick={() => handlePreview(q)}
                                                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                            >
                                                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                {t('common.view')}
                                            </button>
                                            {statusFilter === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(q.id)}
                                                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-xs sm:text-sm"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        {t('common.approve')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(q.id)}
                                                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-xs sm:text-sm"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        {t('common.reject')}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav
                                className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white rounded-xl shadow-sm p-3 sm:p-4 rounded-t-xl border-t-2"
                                aria-label={t('manager.qbApproval.pagination')}
                                role="navigation"
                            >
                                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                    <span className="hidden sm:inline">{t('manager.qbApproval.showing', { from: (currentPage - 1) * itemsPerPage + 1, to: Math.min(currentPage * itemsPerPage, sortedQuestions.length), total: sortedQuestions.length })}</span>
                                    <span className="sm:hidden">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedQuestions.length)} / {sortedQuestions.length}</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2" role="group" aria-label={t('manager.qbApproval.selectPage')}>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label={t('manager.qbApproval.prevPage')}
                                        type="button"
                                    >
                                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        const isActivePage = currentPage === pageNum;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                                    isActivePage
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'border border-gray-300 hover:bg-gray-50'
                                                }`}
                                                aria-label={`${t('manager.qbApproval.page')} ${pageNum}`}
                                                aria-current={isActivePage ? 'page' : undefined}
                                                type="button"
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label={t('manager.qbApproval.nextPage')}
                                        type="button"
                                    >
                                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </nav>
                        )}
                    </>
                )}
            </div>

            {/* Detailed Preview Modal */}
            {showPreviewModal && previewQuestion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Eye className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{t('manager.qbApproval.questionDetail')}</h3>
                                        <p className="text-sm text-blue-100 mt-0.5">ID: #{previewQuestion.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPreviewModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Status badges */}
                            <div className="flex items-center gap-2 mt-4 flex-wrap">
                                <span className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
                                    previewQuestion.verificationStatus === 'APPROVED' ? 'bg-green-500 text-white' :
                                    previewQuestion.verificationStatus === 'REJECTED' ? 'bg-red-500 text-white' :
                                    'bg-amber-500 text-white'
                                }`}>
                                    {previewQuestion.verificationStatus === 'APPROVED' ? t('manager.qbApproval.badgeApproved') :
                                     previewQuestion.verificationStatus === 'REJECTED' ? t('manager.qbApproval.badgeRejected') : t('manager.qbApproval.badgePending')}
                                </span>
                                <span className="px-3 py-1.5 bg-white/20 text-white rounded-lg font-semibold text-sm">
                                    {previewQuestion.questionType?.replace(/_/g, ' ')}
                                </span>
                                <span className="px-3 py-1.5 bg-white/20 text-white rounded-lg font-semibold text-sm">
                                    {previewQuestion.level}
                                </span>
                                <span className="px-3 py-1.5 bg-white/20 text-white rounded-lg font-semibold text-sm">
                                    {previewQuestion.points} {t('manager.qbApproval.points')}
                                </span>
                                {previewQuestion.duplicateScore !== undefined && (
                                    <span className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
                                        previewQuestion.duplicateScore > 50
                                            ? 'bg-red-500 text-white'
                                            : 'bg-green-500 text-white'
                                    }`}>
                                        {t('manager.qbApproval.duplicate')}: {previewQuestion.duplicateScore}%
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Question Info Bar */}
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg font-semibold">
                                    {previewQuestion.categoryName || 'N/A'}
                                </span>
                            </div>

                            {/* Question Content Card */}
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">{t('manager.qbApproval.questionContent')}</h4>
                                </div>
                                <p className="text-gray-900 text-base leading-relaxed pl-11">{previewQuestion.questionText}</p>
                            </div>

                            {/* Question Image */}
                            {previewQuestion.imageUrl && (
                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-700">{t('manager.qbApproval.image')}</p>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <img
                                            src={previewQuestion.imageUrl}
                                            alt="Question image"
                                            className="max-w-full h-auto mx-auto rounded-lg shadow-sm"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                console.error('Failed to load image:', previewQuestion.imageUrl);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Audio */}
                            {previewQuestion.questionMediaUrl && (
                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-700">{t('manager.qbApproval.audio')}</p>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <audio controls src={previewQuestion.questionMediaUrl} className="w-full" />
                                    </div>
                                </div>
                            )}

                            {/* Options */}
                            {previewQuestion.options && previewQuestion.options.length > 0 && (
                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-700">{t('manager.qbApproval.options')}</p>
                                    </div>
                                    <div className="p-4 bg-white space-y-3">
                                        {previewQuestion.options.map((opt) => (
                                            <div
                                                key={opt.id}
                                                className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                                                    opt.isCorrect
                                                        ? 'bg-green-50 border-green-300 shadow-sm'
                                                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                                                    opt.isCorrect ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {opt.optionOrder}
                                                </span>
                                                <div className="flex-1">
                                                    <p className={`font-medium ${opt.isCorrect ? 'text-green-900' : 'text-gray-900'}`}>
                                                        {opt.optionText}
                                                    </p>
                                                    {opt.isCorrect && (
                                                        <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-semibold bg-green-600 text-white rounded-md">
                                                            {t('manager.qbApproval.correctAnswer')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Correct Answer for non-MCQ */}
                            {previewQuestion.correctAnswer && (
                                <div className="rounded-xl overflow-hidden border border-green-200">
                                    <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                                        <p className="text-sm font-semibold text-green-800">{t('manager.qbApproval.correctAnswer')}</p>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <p className="text-green-900 font-medium">{previewQuestion.correctAnswer}</p>
                                    </div>
                                </div>
                            )}

                            {/* Explanation */}
                            {previewQuestion.explanation &&
                             previewQuestion.explanation !== 'null' &&
                             !previewQuestion.explanation.includes('[APPROVAL FEEDBACK]') &&
                             !previewQuestion.explanation.includes('[REJECTION REASON]') && (
                                <div className="rounded-xl overflow-hidden border border-blue-200">
                                    <div className="bg-blue-50 px-4 py-2 border-b border-blue-200">
                                        <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                                            {t('manager.qbApproval.explanation')}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{previewQuestion.explanation}</p>
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <p className="text-gray-500 text-xs font-medium mb-1">{t('manager.qbApproval.createdDate')}</p>
                                    <p className="text-gray-900 font-medium">{new Date(previewQuestion.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <p className="text-gray-500 text-xs font-medium mb-1">{t('manager.qbApproval.updatedDate')}</p>
                                    <p className="text-gray-900 font-medium">{new Date(previewQuestion.updatedAt).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>

                            {/* Approval History */}
                            {approvalHistory.length > 0 && (
                                <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-700">{t('manager.qbApproval.approvalHistory')}</p>
                                    </div>
                                    <div className="p-4 bg-white space-y-3">
                                        {approvalHistory.map((history) => (
                                            <div
                                                key={history.id}
                                                className={`p-3 rounded-lg border ${
                                                    history.action === 'REJECTED'
                                                        ? 'bg-red-50 border-red-200'
                                                        : history.action === 'APPROVED'
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    {history.action === 'REJECTED' ? (
                                                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-xs font-semibold ${
                                                                history.action === 'REJECTED'
                                                                    ? 'text-red-800'
                                                                    : 'text-green-800'
                                                            }`}>
                                                                {history.action === 'APPROVED' ? t('manager.qbApproval.badgeApproved') : t('manager.qbApproval.badgeRejected')}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(history.createdAt).toLocaleString('vi-VN')}
                                                            </span>
                                                        </div>
                                                        {history.feedback && (
                                                            <p className="text-xs text-gray-700 mt-1">
                                                                <span className="font-medium">{t('manager.qbApproval.reason')}:</span> {history.feedback}
                                                            </p>
                                                        )}
                                                        {history.performedByUser && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {t('manager.qbApproval.by')} {history.performedByUser.fullName || history.performedByUser.username}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowPreviewModal(false)}
                                    className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                >
                                    {t('common.close')}
                                </button>
                                {statusFilter === 'PENDING' && previewQuestion.verificationStatus === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowPreviewModal(false);
                                                handleReject(previewQuestion.id);
                                            }}
                                            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {t('common.reject')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowPreviewModal(false);
                                                handleApprove(previewQuestion.id);
                                            }}
                                            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {t('manager.qbApproval.approveThisQuestion')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QBApproval;
