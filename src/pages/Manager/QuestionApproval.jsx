import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Eye, Filter, RefreshCw, FileText, Clock, User, AlertTriangle } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import Swal from 'sweetalert2';

/**
 * QuestionApproval - Education Manager duyệt câu hỏi
 * Updated to use education-manager endpoints
 */
const QuestionApproval = () => {
    const { t } = useTranslation();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

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

            setQuestions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải danh sách câu hỏi',
                timer: 2000,
                showConfirmButton: false
            });
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingQuestions();
    }, [filter]);

    const handleApprove = async (question) => {
        const { value: feedback } = await Swal.fire({
            icon: 'question',
            title: 'Duyệt câu hỏi?',
            text: 'Câu hỏi này sẽ được công bố và giáo viên có thể sử dụng trong các bài kiểm tra',
            input: 'textarea',
            inputLabel: 'Phản hồi (tùy chọn)',
            inputPlaceholder: 'Nhập ghi chú hoặc để trống...',
            showCancelButton: true,
            confirmButtonText: 'Duyệt',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7280'
        });

        if (Swal.DismissReason.reason !== null && feedback !== undefined) {
            try {
                setActionLoading(true);
                await educationManagerService.approveQuestion(question.id, feedback || '');
                Swal.fire({
                    icon: 'success',
                    title: 'Đã duyệt!',
                    text: 'Câu hỏi đã được phê duyệt thành công',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchPendingQuestions();
            } catch (error) {
                console.error('Failed to approve question:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể duyệt câu hỏi',
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
            title: 'Từ chối câu hỏi?',
            input: 'textarea',
            inputLabel: 'Lý do từ chối',
            inputPlaceholder: 'Nhập lý do từ chối...',
            showCancelButton: true,
            confirmButtonText: 'Từ chối',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            inputValidator: (value) => {
                if (!value) return 'Vui lòng nhập lý do từ chối';
            }
        });

        if (reason) {
            try {
                setActionLoading(true);
                await educationManagerService.rejectQuestion(question.id, reason);
                Swal.fire({
                    icon: 'success',
                    title: 'Đã từ chối',
                    text: 'Câu hỏi đã bị từ chối và giáo viên sẽ được thông báo',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchPendingQuestions();
            } catch (error) {
                console.error('Failed to reject question:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể từ chối câu hỏi',
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
                        <h1 className="text-2xl font-bold text-gray-900">Duyệt Câu Hỏi</h1>
                        <p className="text-gray-600 mt-1">Xem và duyệt các câu hỏi do giáo viên tạo</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <span className="text-sm font-medium text-blue-900">
                                {questions.length} câu hỏi
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="PENDING">⏳ Chờ duyệt</option>
                        <option value="APPROVED">✅ Đã duyệt</option>
                        <option value="REJECTED">❌ Đã từ chối</option>
                        <option value="ALL">📋 Tất cả</option>
                    </select>

                    <button
                        onClick={fetchPendingQuestions}
                        disabled={loading}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Làm mới"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Không có câu hỏi nào</p>
                        <p className="text-gray-400 text-sm mt-2">Thử đổi bộ lọc hoặc kiểm tra lại sau</p>
                    </div>
                ) : (
                    questions.map((question) => (
                        <div
                            key={question.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4">
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

                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            question.level === 'LEVEL_1' || question.level === 'LEVEL_2' ? 'bg-green-100 text-green-700' :
                                            question.level === 'LEVEL_3' || question.level === 'LEVEL_4' ? 'bg-yellow-100 text-yellow-700' :
                                            question.level === 'LEVEL_5' || question.level === 'LEVEL_6' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            Level {(question.level || '').replace('LEVEL_', '') || 'N/A'}
                                        </span>

                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                                            {question.categoryName || question.category?.name || 'N/A'}
                                        </span>

                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            question.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                            question.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            question.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {question.verificationStatus === 'PENDING' ? '⏳ Chờ duyệt' :
                                             question.verificationStatus === 'APPROVED' ? '✅ Đã duyệt' :
                                             question.verificationStatus === 'REJECTED' ? '❌ Đã từ chối' : 'N/A'}
                                        </span>

                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                            ⭐ {question.points || 1} điểm
                                        </span>
                                    </div>

                                    {/* Question Content */}
                                    <div className="mb-3">
                                        <p className="text-gray-900 font-semibold text-base mb-2">
                                            {question.questionText || question.content || 'N/A'}
                                        </p>
                                        {question.explanation && (
                                            <div className="bg-gray-50 rounded-lg p-3 mt-2">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Giải thích:</span> {question.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Media */}
                                    {question.questionMediaUrl && (
                                        <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                            <p className="text-xs font-medium text-orange-700 mb-2">🎵 Audio:</p>
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
                                                <span>Đã từ chối</span>
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
                                        title="Xem chi tiết"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    {question.verificationStatus === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(question)}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Duyệt câu hỏi"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Duyệt
                                            </button>
                                            <button
                                                onClick={() => handleReject(question)}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Từ chối câu hỏi"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Từ chối
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Chi Tiết Câu Hỏi</h3>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Question Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Loại câu hỏi:</p>
                                    <p className="text-gray-900 font-medium">{selectedQuestion.questionType?.replace('_', ' ') || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Cấp độ:</p>
                                    <p className="text-gray-900 font-medium">Level {(selectedQuestion.level || '').replace('LEVEL_', '') || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Danh mục:</p>
                                    <p className="text-gray-900 font-medium">{selectedQuestion.categoryName || selectedQuestion.category?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Điểm:</p>
                                    <p className="text-gray-900 font-medium">{selectedQuestion.points || 1}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Trạng thái:</p>
                                    <p className={`font-medium ${
                                        selectedQuestion.verificationStatus === 'PENDING' ? 'text-amber-600' :
                                        selectedQuestion.verificationStatus === 'APPROVED' ? 'text-green-600' :
                                        selectedQuestion.verificationStatus === 'REJECTED' ? 'text-red-600' :
                                        'text-gray-600'
                                    }`}>
                                        {selectedQuestion.verificationStatus === 'PENDING' ? '⏳ Chờ duyệt' :
                                         selectedQuestion.verificationStatus === 'APPROVED' ? '✅ Đã duyệt' :
                                         selectedQuestion.verificationStatus === 'REJECTED' ? '❌ Đã từ chối' : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Người tạo:</p>
                                    <p className="text-gray-900 font-medium">{selectedQuestion.createdBy?.fullName || selectedQuestion.createdBy?.username || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Question Content */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-bold text-blue-900 mb-2">📝 Nội dung câu hỏi:</p>
                                <p className="text-gray-900 text-base leading-relaxed">{selectedQuestion.questionText || selectedQuestion.content || 'N/A'}</p>
                            </div>

                            {/* Media */}
                            {selectedQuestion.questionMediaUrl && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <p className="text-sm font-bold text-orange-900 mb-2">🎵 Audio:</p>
                                    <audio controls src={selectedQuestion.questionMediaUrl} className="w-full" />
                                </div>
                            )}

                            {/* Options for Multiple Choice */}
                            {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                                <div>
                                    <p className="text-sm font-bold text-gray-900 mb-3">✅ Các lựa chọn:</p>
                                    <div className="space-y-2">
                                        {selectedQuestion.options.map((opt, index) => {
                                            const isCorrect = opt.isCorrect || opt === selectedQuestion.correctAnswer;
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
                            {selectedQuestion.explanation && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm font-bold text-yellow-900 mb-2">💡 Giải thích:</p>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedQuestion.explanation}</p>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-gray-500">Ngày tạo:</p>
                                    <p className="text-gray-900 font-medium">{new Date(selectedQuestion.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-gray-500">Cập nhật:</p>
                                    <p className="text-gray-900 font-medium">{new Date(selectedQuestion.updatedAt).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        {selectedQuestion.verificationStatus === 'PENDING' && (
                            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleReject(selectedQuestion);
                                        }}
                                        disabled={actionLoading}
                                        className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Từ chối
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
                                        Duyệt câu hỏi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionApproval;
