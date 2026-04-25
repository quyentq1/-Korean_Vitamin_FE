import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Eye, Filter, RefreshCw, FileText, Clock, User, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import teacherService from '../../services/teacherService';
import Swal from 'sweetalert2';

/**
 * QuestionApproval - Education Manager duyệt câu hỏi
 * Updated to use education-manager endpoints
 */
const QuestionApproval = () => {
    const { t } = useTranslation();
    const [questions, setQuestions] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]); // NEW: Store all questions
    const [loading, setLoading] = useState(true);

    // NEW: Tab state (COURSE vs CLASS)
    const [activeTab, setActiveTab] = useState('COURSE'); // 'COURSE' or 'CLASS'

    const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        const pendingIds = questions.filter(q => q.verificationStatus === 'PENDING').map(q => q.id);
        if (selectedIds.size === pendingIds.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(pendingIds));
        }
    };

    const fetchPendingQuestions = async () => {
        try {
            setLoading(true);
            let data;

            // Fetch based on filter
            if (filter === 'ALL') {
                // For ALL, we need to fetch from different statuses or combine them
                // For now, just fetch pending as default
                data = await educationManagerService.getPendingQuestions();
            } else if (filter === 'PENDING') {
                data = await educationManagerService.getPendingQuestions();
            } else {
                data = await educationManagerService.getQuestionsByStatus(filter);
            }

            setAllQuestions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            Swal.fire({
                icon: 'error',
                title: t('common.error'),
                text: t('manager.questionApproval.fetchFailed'),
                timer: 2000,
                showConfirmButton: false
            });
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

    useEffect(() => {
        fetchPendingQuestions();
    }, [filter]);

    const handleApprove = async (question) => {
        const { value: feedback } = await Swal.fire({
            icon: 'question',
            title: t('manager.questionApproval.approveTitle'),
            text: t('manager.questionApproval.approveText'),
            input: 'textarea',
            inputLabel: t('manager.questionApproval.feedbackLabel'),
            inputPlaceholder: t('manager.questionApproval.feedbackPlaceholder'),
            showCancelButton: true,
            confirmButtonText: t('common.approve'),
            cancelButtonText: t('common.cancel'),
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7280'
        });

        if (Swal.DismissReason.reason !== null && feedback !== undefined) {
            try {
                setActionLoading(true);
                await educationManagerService.approveQuestion(question.id, feedback || '');
                Swal.fire({
                    icon: 'success',
                    title: t('manager.questionApproval.approved'),
                    text: t('manager.questionApproval.approvedSuccess'),
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchPendingQuestions();
            } catch (error) {
                console.error('Failed to approve question:', error);
                Swal.fire({
                    icon: 'error',
                    title: t('common.error'),
                    text: t('manager.questionApproval.approveFailed'),
                    timer: 2000,
                    showConfirmButton: false
                });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleReject = async (question) => {
        const { value: reason } = await Swal.fire({
            icon: 'warning',
            title: t('manager.questionApproval.rejectTitle'),
            input: 'textarea',
            inputLabel: t('manager.questionApproval.rejectReasonLabel'),
            inputPlaceholder: t('manager.questionApproval.rejectPlaceholder'),
            showCancelButton: true,
            confirmButtonText: t('common.reject'),
            cancelButtonText: t('common.cancel'),
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            inputValidator: (value) => {
                if (!value) return t('manager.questionApproval.rejectReasonRequired');
            }
        });

        if (reason) {
            try {
                setActionLoading(true);
                await educationManagerService.rejectQuestion(question.id, reason);
                Swal.fire({
                    icon: 'success',
                    title: t('manager.questionApproval.rejected'),
                    text: t('manager.questionApproval.rejectedSuccess'),
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchPendingQuestions();
            } catch (error) {
                console.error('Failed to reject question:', error);
                Swal.fire({
                    icon: 'error',
                    title: t('common.error'),
                    text: t('manager.questionApproval.rejectFailed'),
                    timer: 2000,
                    showConfirmButton: false
                });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleViewDetail = (question) => {
        setSelectedQuestion(question);
        setShowDetailModal(true);
    };

    const handleBulkApprove = async () => {
        const { value: feedback } = await Swal.fire({
            icon: 'question',
            title: t('manager.questionApproval.bulkApproveTitle', { count: selectedIds.size }),
            input: 'textarea',
            inputLabel: t('manager.questionApproval.feedbackLabel'),
            inputPlaceholder: t('manager.questionApproval.feedbackPlaceholder'),
            showCancelButton: true,
            confirmButtonText: t('manager.questionApproval.approveAll'),
            cancelButtonText: t('common.cancel'),
            confirmButtonColor: '#22c55e',
        });
        if (feedback !== undefined) {
            try {
                setActionLoading(true);
                await educationManagerService.bulkApproveQuestions([...selectedIds], feedback || '');
                setSelectedIds(new Set());
                Swal.fire({ icon: 'success', title: t('manager.questionApproval.bulkApprovedSuccess', { count: selectedIds.size }), timer: 2000, showConfirmButton: false });
                fetchPendingQuestions();
            } catch (error) {
                Swal.fire({ icon: 'error', title: t('common.error'), text: t('manager.questionApproval.approveFailed'), timer: 2000, showConfirmButton: false });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleBulkReject = async () => {
        const { value: reason } = await Swal.fire({
            icon: 'warning',
            title: t('manager.questionApproval.bulkRejectTitle', { count: selectedIds.size }),
            input: 'textarea',
            inputLabel: t('manager.questionApproval.rejectReasonLabel'),
            inputPlaceholder: t('manager.questionApproval.bulkRejectPlaceholder'),
            showCancelButton: true,
            confirmButtonText: t('manager.questionApproval.rejectAll'),
            cancelButtonText: t('common.cancel'),
            confirmButtonColor: '#ef4444',
            inputValidator: (value) => { if (!value) return t('manager.questionApproval.rejectReasonRequired'); }
        });
        if (reason) {
            try {
                setActionLoading(true);
                await educationManagerService.bulkRejectQuestions([...selectedIds], reason);
                setSelectedIds(new Set());
                Swal.fire({ icon: 'success', title: t('manager.questionApproval.bulkRejectedSuccess', { count: selectedIds.size }), timer: 2000, showConfirmButton: false });
                fetchPendingQuestions();
            } catch (error) {
                Swal.fire({ icon: 'error', title: t('common.error'), text: t('manager.questionApproval.rejectFailed'), timer: 2000, showConfirmButton: false });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const getTypeBadge = (type) => {
        const colors = {
            'MULTIPLE_CHOICE': 'bg-blue-100 text-blue-700',
            'FILL_BLANK': 'bg-green-100 text-green-700',
            'READING': 'bg-purple-100 text-purple-700',
            'LISTENING': 'bg-orange-100 text-orange-700'
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const getDifficultyBadge = (difficulty) => {
        const colors = {
            'EASY': 'bg-green-100 text-green-700',
            'MEDIUM': 'bg-yellow-100 text-yellow-700',
            'HARD': 'bg-red-100 text-red-700'
        };
        return colors[difficulty] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('manager.questionApproval.title')}</h1>
                        <p className="text-gray-600 mt-1">{t('manager.questionApproval.subtitle')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <span className="text-sm font-medium text-blue-900">
                                {t('manager.questionApproval.questionCount', { count: questions.length })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{t('manager.questionApproval.filterByStatus')}:</span>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="PENDING">{t('manager.questionApproval.statusPending')}</option>
                            <option value="APPROVED">{t('manager.questionApproval.statusApproved')}</option>
                            <option value="REJECTED">{t('manager.questionApproval.statusRejected')}</option>
                            <option value="ALL">{t('manager.questionApproval.statusAll')}</option>
                        </select>

                        <button
                            onClick={fetchPendingQuestions}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title={t('common.refresh')}
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {questions.filter(q => q.verificationStatus === 'PENDING').length > 0 && (
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer ml-2">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size > 0 && selectedIds.size === questions.filter(q => q.verificationStatus === 'PENDING').length}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                {t('manager.questionApproval.selectAll')}
                            </label>
                        )}
                    </div>

                    {/* Tab buttons */}
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('COURSE')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                activeTab === 'COURSE'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {t('manager.questionApproval.tabCourse', { count: allQuestions.filter(q => !q.unit && q.level).length })}
                        </button>
                        <button
                            onClick={() => setActiveTab('CLASS')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                activeTab === 'CLASS'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {t('manager.questionApproval.tabClass', { count: allQuestions.filter(q => q.unit !== null && q.unit !== undefined).length })}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-700">{t('manager.questionApproval.selectedCount', { count: selectedIds.size })}</span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBulkApprove}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> {t('manager.questionApproval.approveAll')}
                        </button>
                        <button
                            onClick={handleBulkReject}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            <XCircle className="w-4 h-4" /> {t('manager.questionApproval.rejectAll')}
                        </button>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
                        >
                            {t('manager.questionApproval.clearSelection')}
                        </button>
                    </div>
                </div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">{t('manager.questionApproval.noQuestions')}</p>
                        <p className="text-gray-400 text-sm mt-2">{t('manager.questionApproval.noQuestionsHint')}</p>
                    </div>
                ) : (
                    questions.map((question) => (
                        <div
                            key={question.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4">
                                {/* Checkbox */}
                                {question.verificationStatus === 'PENDING' && (
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(question.id)}
                                        onChange={() => toggleSelect(question.id)}
                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1 shrink-0"
                                    />
                                )}

                                {/* Left: Question Info */}
                                <div className="flex-1">
                                    {/* Badges */}
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            question.questionType === 'MULTIPLE_CHOICE' ? 'bg-blue-100 text-blue-700' :
                                            question.questionType === 'FILL_BLANK' ? 'bg-green-100 text-green-700' :
                                            question.questionType === 'READING' ? 'bg-purple-100 text-purple-700' :
                                            question.questionType === 'LISTENING' ? 'bg-orange-100 text-orange-700' :
                                            question.questionType === 'WRITING' ? 'bg-pink-100 text-pink-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {question.questionType?.replace('_', ' ') || 'N/A'}
                                        </span>

                                        {question.level && (
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                question.level === 'LEVEL_1' || question.level === 'LEVEL_2' ? 'bg-green-100 text-green-700' :
                                                question.level === 'LEVEL_3' || question.level === 'LEVEL_4' ? 'bg-yellow-100 text-yellow-700' :
                                                question.level === 'LEVEL_5' || question.level === 'LEVEL_6' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                Level {(question.level || '').replace('LEVEL_', '') || 'N/A'}
                                            </span>
                                        )}
                                        {question.unit && (
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700`}>
                                                Unit {question.unit || 'N/A'}
                                            </span>
                                        )}

                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                                            {question.categoryName || question.category?.name || 'N/A'}
                                        </span>

                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            question.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                            question.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            question.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {question.verificationStatus === 'PENDING' ? t('manager.questionApproval.badgePending') :
                                             question.verificationStatus === 'APPROVED' ? t('manager.questionApproval.badgeApproved') :
                                             question.verificationStatus === 'REJECTED' ? t('manager.questionApproval.badgeRejected') : 'N/A'}
                                        </span>

                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                            {question.points || 1} {t('manager.questionApproval.points')}
                                        </span>
                                    </div>

                                    {/* Question Content */}
                                    <div className="mb-3">
                                        <p className="text-gray-900 font-semibold text-base mb-2">
                                            <span dangerouslySetInnerHTML={{ __html: question.questionText || question.content || 'N/A' }} />
                                        </p>
                                        {question.explanation && (
                                            <div className="bg-gray-50 rounded-lg p-3 mt-2">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">{t('manager.questionApproval.explanation')}:</span> {question.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Media */}
                                    {question.questionMediaUrl && (
                                        <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                            <p className="text-xs font-medium text-orange-700 mb-2">{t('manager.questionApproval.audio')}:</p>
                                            <audio controls src={question.questionMediaUrl} className="w-full h-8" />
                                        </div>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            <span>{question.createdBy?.fullName || question.createdBy?.username || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{new Date(question.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        {question.verificationStatus === 'REJECTED' && (
                                            <div className="flex items-center gap-1 text-red-600">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span>{t('manager.questionApproval.badgeRejected')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleViewDetail(question)}
                                        disabled={actionLoading}
                                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                                        title={t('common.viewDetail')}
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    {question.verificationStatus === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(question)}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={t('manager.questionApproval.approveQuestion')}
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                {t('common.approve')}
                                            </button>
                                            <button
                                                onClick={() => handleReject(question)}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={t('manager.questionApproval.rejectQuestion')}
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {t('common.reject')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedQuestion && (
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
                                        <h3 className="text-xl font-bold text-white">{t('manager.questionApproval.questionDetail')}</h3>
                                        <p className="text-sm text-blue-100 mt-0.5">ID: {selectedQuestion.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            {/* Status badges */}
                            <div className="flex items-center gap-2 mt-4">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    selectedQuestion.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                                    selectedQuestion.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                                    'bg-amber-100 text-amber-700 border border-amber-200'
                                }`}>
                                    {selectedQuestion.verificationStatus === 'APPROVED' ? t('manager.questionApproval.badgeApproved') :
                                     selectedQuestion.verificationStatus === 'REJECTED' ? t('manager.questionApproval.badgeRejected') : t('manager.questionApproval.badgePending')}
                                </span>
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                    {selectedQuestion.points || 1} {t('manager.questionApproval.points')}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Question Info Bar */}
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    selectedQuestion.questionType === 'MULTIPLE_CHOICE' ? 'bg-blue-100 text-blue-700' :
                                    selectedQuestion.questionType === 'FILL_BLANK' ? 'bg-green-100 text-green-700' :
                                    selectedQuestion.questionType === 'READING' ? 'bg-purple-100 text-purple-700' :
                                    selectedQuestion.questionType === 'LISTENING' ? 'bg-orange-100 text-orange-700' :
                                    selectedQuestion.questionType === 'WRITING' ? 'bg-pink-100 text-pink-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {selectedQuestion.questionType?.replace('_', ' ') || 'N/A'}
                                </span>
                                {selectedQuestion.level && (
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        selectedQuestion.level === 'LEVEL_1' || selectedQuestion.level === 'LEVEL_2' ? 'bg-green-100 text-green-700' :
                                        selectedQuestion.level === 'LEVEL_3' || selectedQuestion.level === 'LEVEL_4' ? 'bg-yellow-100 text-yellow-700' :
                                        selectedQuestion.level === 'LEVEL_5' || selectedQuestion.level === 'LEVEL_6' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        Level {(selectedQuestion.level || '').replace('LEVEL_', '') || 'N/A'}
                                    </span>
                                )}
                                {selectedQuestion.unit && (
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                                        Unit {selectedQuestion.unit || 'N/A'}
                                    </span>
                                )}
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                                    {selectedQuestion.categoryName || selectedQuestion.category?.name || 'N/A'}
                                </span>
                            </div>

                            {/* Question Content Card */}
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">{t('manager.questionApproval.questionContent')}</h4>
                                </div>
                                <p className="text-gray-900 text-base leading-relaxed pl-11">
                                    <span dangerouslySetInnerHTML={{ __html: selectedQuestion.questionText || selectedQuestion.content || 'N/A' }} />
                                </p>
                            </div>

                            {/* Question Image */}
                            {selectedQuestion.imageUrl && (
                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            {t('manager.questionApproval.image')}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <img
                                            src={selectedQuestion.imageUrl}
                                            alt="Question image"
                                            className="max-w-full h-auto mx-auto rounded-lg shadow-sm"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                console.error('Failed to load image:', selectedQuestion.imageUrl);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Audio */}
                            {selectedQuestion.questionMediaUrl && (
                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            {t('manager.questionApproval.audio')}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <audio controls src={selectedQuestion.questionMediaUrl} className="w-full" />
                                    </div>
                                </div>
                            )}

                            {/* Options */}
                            {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-700">{t('manager.questionApproval.options')}</p>
                                    </div>
                                    <div className="p-4 bg-white space-y-3">
                                        {selectedQuestion.options.map((opt, index) => {
                                            const isCorrect = opt.isCorrect || opt === selectedQuestion.correctAnswer;
                                            return (
                                                <div
                                                    key={index}
                                                    className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                                                        isCorrect
                                                            ? 'bg-green-50 border-green-300'
                                                            : 'bg-gray-50 border-gray-200'
                                                    }`}
                                                >
                                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                                        isCorrect ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'
                                                    }`}>
                                                        {String.fromCharCode(65 + index)}
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className="text-gray-900 font-medium">
                                                            <span dangerouslySetInnerHTML={{ __html: opt.optionText || opt }} />
                                                        </p>
                                                        {isCorrect && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-green-600 text-white rounded">
                                                                {t('manager.questionApproval.correctAnswer')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Explanation */}
                            {selectedQuestion.explanation && selectedQuestion.explanation !== 'null' && (
                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            {t('manager.questionApproval.explanation')}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedQuestion.explanation}</p>
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <p className="text-gray-500 text-xs font-medium mb-1">{t('manager.questionApproval.createdBy')}</p>
                                    <p className="text-gray-900 font-medium">{selectedQuestion.createdBy?.fullName || selectedQuestion.createdBy?.username || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <p className="text-gray-500 text-xs font-medium mb-1">{t('manager.questionApproval.createdDate')}</p>
                                    <p className="text-gray-900 font-medium">{new Date(selectedQuestion.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                                {selectedQuestion.updatedAt && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <p className="text-gray-500 text-xs font-medium mb-1">{t('manager.questionApproval.updatedDate')}</p>
                                        <p className="text-gray-900 font-medium">{new Date(selectedQuestion.updatedAt).toLocaleString('vi-VN')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                    {t('common.close')}
                                </button>
                                {selectedQuestion.verificationStatus === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowDetailModal(false);
                                                handleReject(selectedQuestion);
                                            }}
                                            disabled={actionLoading}
                                            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {t('common.reject')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDetailModal(false);
                                                handleApprove(selectedQuestion);
                                            }}
                                            disabled={actionLoading}
                                            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {t('manager.questionApproval.approveQuestion')}
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

export default QuestionApproval;
