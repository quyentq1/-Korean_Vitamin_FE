import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Eye, Filter, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

/**
 * QuestionApproval - Manager duyệt câu hỏi
 * Priority 1: Question Bank (Manager)
 */
const QuestionApproval = () => {
    const { t } = useTranslation();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const fetchPendingQuestions = async () => {
        // In real implementation, fetch from API
        setLoading(false);
    };

    useEffect(() => {
        fetchPendingQuestions();
    }, [filter]);

    const handleApprove = async (question) => {
        const result = await Swal.fire({
            icon: 'question',
            title: 'Duyệt câu hỏi?',
            text: 'Câu hỏi này sẽ được công bố và sử dụng trong các bài kiểm tra',
            showCancelButton: true,
            confirmButtonText: 'Duyệt',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed) {
            // Call API to approve
            Swal.fire({
                icon: 'success',
                title: 'Đã duyệt',
                timer: 2000,
                showConfirmButton: false
            });
            fetchPendingQuestions();
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
            // Call API to reject with reason
            Swal.fire({
                icon: 'success',
                title: 'Đã từ chối',
                timer: 2000,
                showConfirmButton: false
            });
            fetchPendingQuestions();
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
                <h1 className="text-2xl font-bold text-gray-900">Duyệt Câu Hỏi</h1>
                <p className="text-gray-600 mt-1">Xem và duyệt các câu hỏi do giáo viên tạo</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="APPROVED">Đã duyệt</option>
                        <option value="REJECTED">Đã từ chối</option>
                        <option value="ALL">Tất cả</option>
                    </select>

                    <button
                        onClick={fetchPendingQuestions}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Không có câu hỏi nào cần duyệt</p>
                    </div>
                ) : (
                    questions.map((question) => (
                        <div
                            key={question.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(question.questionType)}`}>
                                            {question.questionType}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyBadge(question.difficulty)}`}>
                                            {question.difficulty}
                                        </span>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                            {question.category}
                                        </span>
                                    </div>

                                    <p className="text-gray-900 font-medium mb-2">
                                        {question.questionText || question.content}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>👤 {question.createdBy?.fullName || question.createdBy?.username}</span>
                                        <span>📅 {new Date(question.createdAt).toLocaleDateString('vi-VN')}</span>
                                        <span>⭐ {question.points} điểm</span>
                                    </div>

                                    {question.audioUrl && (
                                        <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                                            <audio controls src={question.audioUrl} className="w-full h-8" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleViewDetail(question)}
                                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Xem chi tiết"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleApprove(question)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Duyệt
                                    </button>
                                    <button
                                        onClick={() => handleReject(question)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedQuestion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Chi Tiết Câu Hỏi</h3>
                        </div>
                        <div className="p-6">
                            {/* Question content display */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Nội dung:</p>
                                    <p className="text-gray-900">{selectedQuestion.questionText}</p>
                                </div>

                                {selectedQuestion.options && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Đáp án:</p>
                                        <ul className="space-y-1">
                                            {selectedQuestion.options.map((opt, i) => (
                                                <li key={i} className={`p-2 rounded ${
                                                    opt === selectedQuestion.correctAnswer
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {i + 1}. {opt}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedQuestion.explanation && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Giải thích:</p>
                                        <p className="text-gray-700">{selectedQuestion.explanation}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionApproval;
