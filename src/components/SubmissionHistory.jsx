import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Filter, Download, Eye } from 'lucide-react';
import axiosClient from '../api/axiosClient';

/**
 * SubmissionHistory - Component hiển thị lịch sử nộp bài
 * Phase 1: Critical Assignments
 *
 * Features:
 * - View all submissions (writing & speaking)
 * - Filter by status, type, date
 * - View submission details
 * - Download submissions
 * - Compare multiple attempts
 */
const SubmissionHistory = ({ userId, assignmentType = 'all' }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        status: 'all',
        type: assignmentType,
        dateRange: 'all'
    });
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, [userId, assignmentType]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const endpoint = assignmentType === 'speaking'
                ? `/api/learner/speaking-submissions`
                : assignmentType === 'writing'
                ? `/api/learner/writing-submissions`
                : `/api/learner/submissions`;

            const response = await axiosClient.get(endpoint);
            setSubmissions(response.data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        if (filter.status !== 'all' && submission.status !== filter.status) return false;
        if (filter.type !== 'all' && submission.type !== filter.type) return false;
        if (filter.dateRange !== 'all') {
            const submissionDate = new Date(submission.submittedAt);
            const now = new Date();
            const daysDiff = Math.floor((now - submissionDate) / (1000 * 60 * 60 * 24));
            if (filter.dateRange === 'week' && daysDiff > 7) return false;
            if (filter.dateRange === 'month' && daysDiff > 30) return false;
        }
        return true;
    });

    const getStatusBadge = (status) => {
        const statusConfig = {
            GRADED: { color: 'green', icon: CheckCircle, label: 'Đã chấm' },
            PENDING: { color: 'yellow', icon: Clock, label: 'Chờ chấm' },
            REVIEWED: { color: 'blue', icon: Eye, label: 'Đã xem' },
            RETURNED: { color: 'orange', icon: AlertCircle, label: 'Cần làm lại' }
        };
        const config = statusConfig[status] || { color: 'gray', icon: Clock, label: status };
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-${config.color}-100 text-${config.color}-700`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const getTypeLabel = (type) => {
        const types = {
            WRITING: 'Viết',
            SPEAKING: 'Nói',
            PROJECT: 'Dự án'
        };
        return types[type] || type;
    };

    const viewSubmissionDetail = async (submissionId) => {
        try {
            const response = await axiosClient.get(`/api/learner/submissions/${submissionId}`);
            setSelectedSubmission(response.data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error fetching submission details:', error);
        }
    };

    const downloadSubmission = async (submission) => {
        try {
            const response = await axiosClient.get(`/api/learner/submissions/${submission.id}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `submission-${submission.id}.${submission.type === 'WRITING' ? 'pdf' : 'zip'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading submission:', error);
        }
    };

    const getScoreColor = (score, maxScore = 10) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Lịch sử nộp bài</h2>
                    <Filter className="w-5 h-5 text-gray-500" />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="GRADED">Đã chấm</option>
                        <option value="PENDING">Chờ chấm</option>
                        <option value="REVIEWED">Đã xem</option>
                        <option value="RETURNED">Cần làm lại</option>
                    </select>

                    {assignmentType === 'all' && (
                        <select
                            value={filter.type}
                            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">Tất cả loại</option>
                            <option value="WRITING">Bài viết</option>
                            <option value="SPEAKING">Bài nói</option>
                            <option value="PROJECT">Dự án</option>
                        </select>
                    )}

                    <select
                        value={filter.dateRange}
                        onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="all">Tất cả thời gian</option>
                        <option value="week">7 ngày qua</option>
                        <option value="month">30 ngày qua</option>
                    </select>
                </div>
            </div>

            {/* Submissions List */}
            <div className="divide-y divide-gray-200">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Không có bài nộp nào</p>
                    </div>
                ) : (
                    filteredSubmissions.map((submission) => (
                        <div
                            key={submission.id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-medium text-gray-900">{submission.assignmentTitle}</h3>
                                        <span className="text-xs text-gray-500">•</span>
                                        <span className="text-xs text-gray-600">{getTypeLabel(submission.type)}</span>
                                        {getStatusBadge(submission.status)}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Nộp lúc: {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                                    </p>
                                    {submission.status === 'GRADED' && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-lg font-bold ${getScoreColor(submission.score, submission.maxScore)}`}>
                                                    {submission.score}/{submission.maxScore}
                                                </span>
                                                <span className="text-sm text-gray-600">điểm</span>
                                            </div>
                                            {submission.feedback && (
                                                <p className="text-sm text-gray-700 flex-1">
                                                    <span className="font-medium">Nhận xét:</span> {submission.feedback}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => viewSubmissionDetail(submission.id)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Xem chi tiết"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => downloadSubmission(submission)}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Tải xuống"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Attempt Count */}
                            {submission.attemptNumber && (
                                <div className="mt-2">
                                    <span className="text-xs text-gray-500">
                                        Lần nộp: {submission.attemptNumber}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Chi tiết bài nộp
                                </h3>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Assignment Info */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">{selectedSubmission.assignmentTitle}</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Loại:</span>
                                        <span className="ml-2 font-medium">{getTypeLabel(selectedSubmission.type)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Ngày nộp:</span>
                                        <span className="ml-2 font-medium">
                                            {new Date(selectedSubmission.submittedAt).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    {selectedSubmission.attemptNumber && (
                                        <div>
                                            <span className="text-gray-600">Lần nộp:</span>
                                            <span className="ml-2 font-medium">#{selectedSubmission.attemptNumber}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span className="ml-2">{getStatusBadge(selectedSubmission.status)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            {selectedSubmission.content && (
                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Nội dung</h5>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                                            {selectedSubmission.content}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Audio Files (for speaking) */}
                            {selectedSubmission.audioFiles && selectedSubmission.audioFiles.length > 0 && (
                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Bản ghi âm</h5>
                                    <div className="space-y-2">
                                        {selectedSubmission.audioFiles.map((audio, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <audio src={audio.url} controls className="flex-1" />
                                                <a
                                                    href={audio.url}
                                                    download
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                )}

                            {/* Attached Files */}
                            {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Tài liệu đính kèm</h5>
                                    <div className="space-y-2">
                                        {selectedSubmission.attachments.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.url}
                                                download
                                                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <span className="text-sm text-blue-600">{file.name}</span>
                                                <Download className="w-4 h-4 text-gray-500" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Grading */}
                            {selectedSubmission.status === 'GRADED' && (
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`text-2xl font-bold ${getScoreColor(selectedSubmission.score, selectedSubmission.maxScore)}`}>
                                            {selectedSubmission.score}/{selectedSubmission.maxScore}
                                        </span>
                                        <span className="text-green-700 font-medium">Điểm</span>
                                    </div>
                                    {selectedSubmission.feedback && (
                                        <div>
                                            <p className="font-medium text-green-900 mb-1">Nhận xét:</p>
                                            <p className="text-sm text-green-800">{selectedSubmission.feedback}</p>
                                        </div>
                                    )}
                                    {selectedSubmission.gradedAt && (
                                        <p className="text-xs text-green-600 mt-2">
                                            Chấm lúc: {new Date(selectedSubmission.gradedAt).toLocaleString('vi-VN')}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* AI Suggestions (if available) */}
                            {selectedSubmission.aiSuggestions && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="font-medium text-blue-900 mb-2">💡 Gợi ý cải thiện (AI):</p>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        {selectedSubmission.aiSuggestions.map((suggestion, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span>•</span>
                                                <span>{suggestion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => downloadSubmission(selectedSubmission)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Tải xuống
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubmissionHistory;
