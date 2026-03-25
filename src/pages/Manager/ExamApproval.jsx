import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Eye, Filter, RefreshCw, FileText, Clock, User, AlertTriangle, BookOpen, List, Calendar } from 'lucide-react';
import examService from '../../services/examService';
import Swal from 'sweetalert2';

/**
 * ExamApproval - Education Manager duyệt bài thi
 * Similar to QuestionApproval but for exams
 */
const ExamApproval = () => {
    const { t } = useTranslation();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
    const [selectedExam, setSelectedExam] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchPendingExams = async () => {
        try {
            setLoading(true);
            let data;

            // Fetch based on filter
            if (filter === 'ALL') {
                // For ALL, we need to fetch from different statuses or combine them
                // For now, just fetch pending as default
                data = await examService.getPendingExams();
            } else if (filter === 'PENDING') {
                data = await examService.getPendingExams();
            } else {
                data = await examService.getExamsByStatus(filter);
            }

            setExams(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch exams:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải danh sách bài thi',
                timer: 2000,
                showConfirmButton: false
            });
            setExams([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingExams();
    }, [filter]);

    const handleApprove = async (examApproval) => {
        const { value: feedback } = await Swal.fire({
            icon: 'question',
            title: 'Duyệt bài thi?',
            text: 'Bài thi này sẽ được công bố và giáo viên có thể sử dụng cho các lớp học',
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
                // examApproval contains { id, exam, status, submittedAt, feedback }
                await examService.approveExam(examApproval.id, { feedback: feedback || '', approved: true });
                Swal.fire({
                    icon: 'success',
                    title: 'Đã duyệt!',
                    text: 'Bài thi đã được phê duyệt thành công',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchPendingExams();
            } catch (error) {
                console.error('Failed to approve exam:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể duyệt bài thi',
                    timer: 2000,
                    showConfirmButton: false
                });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleReject = async (examApproval) => {
        const { value: reason } = await Swal.fire({
            icon: 'warning',
            title: 'Từ chối bài thi?',
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
                await examService.approveExam(examApproval.id, { feedback: reason, approved: false });
                Swal.fire({
                    icon: 'success',
                    title: 'Đã từ chối',
                    text: 'Bài thi đã bị từ chối và giáo viên sẽ được thông báo',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchPendingExams();
            } catch (error) {
                console.error('Failed to reject exam:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể từ chối bài thi',
                    timer: 2000,
                    showConfirmButton: false
                });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleViewDetail = (examApproval) => {
        setSelectedExam(examApproval);
        setShowDetailModal(true);
    };

    const getExamTypeBadge = (type) => {
        const colors = {
            'QUIZ': 'bg-blue-100 text-blue-700',
            'WRITING': 'bg-green-100 text-green-700',
            'LISTENING': 'bg-purple-100 text-purple-700',
            'READING': 'bg-orange-100 text-orange-700',
            'MIXED': 'bg-indigo-100 text-indigo-700'
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const getStatusBadge = (status) => {
        const colors = {
            'PENDING': 'bg-amber-100 text-amber-700',
            'APPROVED': 'bg-green-100 text-green-700',
            'REJECTED': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
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
                        <h1 className="text-2xl font-bold text-gray-900">Duyệt Bài Thi</h1>
                        <p className="text-gray-600 mt-1">Xem và duyệt các bài thi do giáo viên tạo</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <span className="text-sm font-medium text-blue-900">
                                {exams.length} bài thi
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
                        onClick={fetchPendingExams}
                        disabled={loading}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Làm mới"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Exams List */}
            <div className="space-y-4">
                {exams.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Không có bài thi nào</p>
                        <p className="text-gray-400 text-sm mt-2">Thử đổi bộ lọc hoặc kiểm tra lại sau</p>
                    </div>
                ) : (
                    exams.map((examApproval) => {
                        const exam = examApproval.exam;
                        if (!exam) return null;

                        return (
                            <div
                                key={examApproval.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left: Exam Info */}
                                    <div className="flex-1">
                                        {/* Badges */}
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getExamTypeBadge(exam.examType)}`}>
                                                {exam.examType || 'N/A'}
                                            </span>

                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(examApproval.status)}`}>
                                                {examApproval.status === 'PENDING' ? '⏳ Chờ duyệt' :
                                                 examApproval.status === 'APPROVED' ? '✅ Đã duyệt' :
                                                 examApproval.status === 'REJECTED' ? '❌ Đã từ chối' : 'N/A'}
                                            </span>

                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                                                {exam.code || 'N/A'}
                                            </span>

                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                                ⏱️ {exam.durationMinutes || 0} phút
                                            </span>

                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                                                ❓ {exam.examQuestions?.length || exam.totalQuestions || 0} câu
                                            </span>
                                        </div>

                                        {/* Exam Title & Description */}
                                        <div className="mb-3">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                {exam.title || 'Không có tiêu đề'}
                                            </h3>
                                            {exam.description && (
                                                <p className="text-gray-600 text-sm">{exam.description}</p>
                                            )}
                                        </div>

                                        {/* Course Info */}
                                        {exam.course && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <BookOpen className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-700">
                                                    Khóa học: <span className="font-medium">{exam.course.name || 'N/A'}</span>
                                                </span>
                                            </div>
                                        )}

                                        {/* Show feedback if rejected */}
                                        {examApproval.status === 'REJECTED' && examApproval.feedback && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-red-900">Lý do từ chối:</p>
                                                        <p className="text-sm text-red-700 mt-1">{examApproval.feedback}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                <span>Người tạo: {exam.createdBy?.fullName || exam.createdBy?.username || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>Ngày gửi: {new Date(examApproval.submittedAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleViewDetail(examApproval)}
                                            disabled={actionLoading}
                                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Xem chi tiết"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        {examApproval.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(examApproval)}
                                                    disabled={actionLoading}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Duyệt bài thi"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Duyệt
                                                </button>
                                                <button
                                                    onClick={() => handleReject(examApproval)}
                                                    disabled={actionLoading}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Từ chối bài thi"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Từ chối
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedExam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Chi Tiết Bài Thi</h3>
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
                            {(() => {
                                const exam = selectedExam.exam;
                                if (!exam) return null;

                                return (
                                    <>
                                        {/* Exam Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Mã bài thi:</p>
                                                <p className="text-gray-900 font-medium">{exam.code || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Loại bài thi:</p>
                                                <p className="text-gray-900 font-medium">{exam.examType || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Thời lượng:</p>
                                                <p className="text-gray-900 font-medium">{exam.durationMinutes || 0} phút</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Số câu hỏi:</p>
                                                <p className="text-gray-900 font-medium">{exam.examQuestions?.length || exam.totalQuestions || 0} câu</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Trạng thái:</p>
                                                <p className={`font-medium ${
                                                    selectedExam.status === 'PENDING' ? 'text-amber-600' :
                                                    selectedExam.status === 'APPROVED' ? 'text-green-600' :
                                                    selectedExam.status === 'REJECTED' ? 'text-red-600' :
                                                    'text-gray-600'
                                                }`}>
                                                    {selectedExam.status === 'PENDING' ? '⏳ Chờ duyệt' :
                                                     selectedExam.status === 'APPROVED' ? '✅ Đã duyệt' :
                                                     selectedExam.status === 'REJECTED' ? '❌ Đã từ chối' : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Người tạo:</p>
                                                <p className="text-gray-900 font-medium">{exam.createdBy?.fullName || exam.createdBy?.username || 'N/A'}</p>
                                            </div>
                                            {exam.course && (
                                                <div className="col-span-2">
                                                    <p className="text-sm font-medium text-gray-500 mb-1">Khóa học:</p>
                                                    <p className="text-gray-900 font-medium">{exam.course.name || 'N/A'}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Title & Description */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-sm font-bold text-blue-900 mb-2">📝 Tiêu đề:</p>
                                            <p className="text-gray-900 text-lg font-semibold">{exam.title || 'Không có tiêu đề'}</p>
                                            {exam.description && (
                                                <>
                                                    <p className="text-sm font-bold text-blue-900 mb-2 mt-4">Mô tả:</p>
                                                    <p className="text-gray-700">{exam.description}</p>
                                                </>
                                            )}
                                        </div>

                                        {/* Questions Preview */}
                                        {exam.examQuestions && exam.examQuestions.length > 0 && (
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 mb-3">✅ Danh sách câu hỏi:</p>
                                                <div className="space-y-2">
                                                    {exam.examQuestions.slice(0, 5).map((q, index) => (
                                                        <div key={q.id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                            <div className="flex items-start gap-3">
                                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                                                                    {index + 1}
                                                                </span>
                                                                <div className="flex-1">
                                                                    <p className="text-gray-900 text-sm font-medium">
                                                                        {q.questionText || q.content || 'N/A'}
                                                                    </p>
                                                                    {q.questionType && (
                                                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded">
                                                                            {q.questionType.replace('_', ' ')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {exam.examQuestions.length > 5 && (
                                                        <p className="text-sm text-gray-500 text-center pt-2">
                                                            ... và {exam.examQuestions.length - 5} câu hỏi khác
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Rejection Feedback */}
                                        {selectedExam.status === 'REJECTED' && selectedExam.feedback && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <p className="text-sm font-bold text-red-900 mb-2">❌ Lý do từ chối:</p>
                                                <p className="text-gray-700">{selectedExam.feedback}</p>
                                            </div>
                                        )}

                                        {/* Metadata */}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-gray-500">Ngày tạo bài thi:</p>
                                                <p className="text-gray-900 font-medium">{new Date(exam.createdAt).toLocaleString('vi-VN')}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-gray-500">Ngày gửi duyệt:</p>
                                                <p className="text-gray-900 font-medium">{new Date(selectedExam.submittedAt).toLocaleString('vi-VN')}</p>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Footer Actions */}
                        {selectedExam.status === 'PENDING' && (
                            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleReject(selectedExam);
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
                                            handleApprove(selectedExam);
                                        }}
                                        disabled={actionLoading}
                                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Duyệt bài thi
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

export default ExamApproval;
