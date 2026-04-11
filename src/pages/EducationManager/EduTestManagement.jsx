import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, BookOpen, Clock, UserCheck, AlertCircle, Eye, RefreshCw, FileText, Users, Calendar } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import examService from '../../services/examService';
import Swal from 'sweetalert2';

const EduTestManagement = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [exams, setExams] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('published'); // 'published' or 'pending'
    const [selectedExam, setSelectedExam] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        educationManagerService.getAllCourses()
            .then(data => setCourses(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setCoursesLoading(false));
    }, []);

    // Load published exams by course
    useEffect(() => {
        if (activeTab !== 'published') return;
        if (!selectedCourse) { setExams([]); return; }
        setLoading(true);
        educationManagerService.getExamsByCourse(selectedCourse)
            .then(data => setExams(Array.isArray(data) ? data : []))
            .catch(() => setExams([]))
            .finally(() => setLoading(false));
    }, [selectedCourse, activeTab]);

    // Load pending exams (all courses)
    useEffect(() => {
        if (activeTab !== 'pending') return;
        fetchPendingExams();
    }, [activeTab]);

    const fetchPendingExams = async () => {
        setLoading(true);
        try {
            const data = await examService.getPendingExams();
            setPendingApprovals(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch pending exams:', error);
            setPendingApprovals([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPublishedExams = async () => {
        if (!selectedCourse) return;
        setLoading(true);
        try {
            const data = await educationManagerService.getExamsByCourse(selectedCourse);
            setExams(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch exams:', error);
            setExams([]);
        } finally {
            setLoading(false);
        }
    };

    // Load published exams by course
    useEffect(() => {
        if (activeTab !== 'published') return;
        if (!selectedCourse) { setExams([]); return; }
        fetchPublishedExams();
    }, [selectedCourse, activeTab]);

    const handleTogglePublish = async (exam) => {
        try {
            await educationManagerService.publishExam(exam.id, !exam.published);
            setExams(prev => prev.map(e => e.id === exam.id ? { ...e, published: !exam.published } : e));
        } catch (e) {
            Swal.fire('Lỗi', 'Không thể thay đổi trạng thái bài test', 'error');
        }
    };

    const handleDelete = async (exam) => {
        const result = await Swal.fire({
            title: 'Xóa bài test?',
            text: `Xóa "${exam.title || exam.name}"?`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#ef4444', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy',
        });
        if (result.isConfirmed) {
            try {
                await educationManagerService.deleteExam(exam.id);
                setExams(prev => prev.filter(e => e.id !== exam.id));
                Swal.fire({ icon: 'success', title: 'Đã xóa!', toast: true, timer: 1500, showConfirmButton: false, position: 'top-end' });
            } catch (e) {
                Swal.fire('Lỗi', 'Không thể xóa bài test', 'error');
            }
        }
    };

    const handleApprove = async (approval) => {
        const { value: feedback } = await Swal.fire({
            title: '✅ Phê duyệt bài thi',
            text: `Phê duyệt đề thi "${approval.exam.title || approval.exam.name}"?`,
            input: 'textarea',
            inputLabel: 'Nhập phản hồi (tùy chọn)',
            inputPlaceholder: 'Nhập ghi chú hoặc để trống...',
            showCancelButton: true,
            confirmButtonText: 'Phê duyệt',
            confirmButtonColor: '#10B981',
            cancelButtonText: 'Hủy',
        });

        if (feedback !== undefined) {
            try {
                setActionLoading(true);
                await examService.approveExam(approval.exam.id, { status: 'APPROVED', feedback });
                setPendingApprovals(prev => prev.filter(a => a.id !== approval.id));
                Swal.fire({
                    icon: 'success',
                    title: 'Đã phê duyệt!',
                    text: 'Bài thi đã được phê duyệt. Giáo viên có thể publish bài thi này.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (e) {
                console.error('Failed to approve exam:', e);
                Swal.fire('Lỗi', 'Không thể phê duyệt bài thi', 'error');
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleReject = async (approval) => {
        const { value: feedback } = await Swal.fire({
            title: '❌ Từ chối bài thi',
            text: `Từ chối đề thi "${approval.exam.title || approval.exam.name}"?`,
            input: 'textarea',
            inputLabel: 'Nhập lý do từ chối (bắt buộc)',
            inputPlaceholder: 'Vui lòng nhập lý do từ chối...',
            inputValidator: (value) => {
                if (!value) return 'Bạn phải nhập lý do từ chối!';
            },
            showCancelButton: true,
            confirmButtonText: 'Từ chối',
            confirmButtonColor: '#EF4444',
            cancelButtonText: 'Hủy',
        });

        if (feedback) {
            try {
                setActionLoading(true);
                await examService.approveExam(approval.exam.id, { status: 'REJECTED', feedback });
                setPendingApprovals(prev => prev.filter(a => a.id !== approval.id));
                Swal.fire({
                    icon: 'success',
                    title: 'Đã từ chối!',
                    text: 'Bài thi đã bị từ chối. Giáo viên sẽ nhận được thông báo.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (e) {
                console.error('Failed to reject exam:', e);
                Swal.fire('Lỗi', 'Không thể từ chối bài thi', 'error');
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleViewDetail = async (approval) => {
        try {
            const examDetails = await educationManagerService.getExamById(approval.exam.id);
            setSelectedExam({
                ...approval,
                exam: examDetails
            });
            setShowDetailModal(true);
        } catch (error) {
            console.error('Failed to fetch exam details:', error);
            Swal.fire('Lỗi', 'Không thể tải chi tiết bài thi', 'error');
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài Test</h1>
                    <p className="text-gray-500 text-sm">Tạo, sửa, xóa bài test và phê duyệt đề thi</p>
                </div>
            </div>

            {/* Tab toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('published')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'published'
                            ? 'bg-white text-green-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    Bài test đã đăng
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'pending'
                            ? 'bg-white text-amber-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <Clock className="w-4 h-4" />
                    Chờ phê duyệt
                    {pendingApprovals.length > 0 && (
                        <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {pendingApprovals.length}
                        </span>
                    )}
                </button>
            </div>

            {activeTab === 'published' ? (
                <>
                    {/* Course selector */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <BookOpen className="w-4 h-4 inline mr-1 text-green-600" /> Chọn khóa học
                        </label>
                        {coursesLoading ? (
                            <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-80" />
                        ) : (
                            <select
                                value={selectedCourse}
                                onChange={e => setSelectedCourse(e.target.value)}
                                className="w-full sm:w-96 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none"
                            >
                                <option value="">-- Chọn khóa học để xem bài test --</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                        )}
                    </div>

                    {/* Exam list */}
                    {selectedCourse && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {loading ? (
                                <div className="p-8 text-center text-gray-400">Đang tải bài test...</div>
                            ) : exams.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-gray-400 mb-3">Chưa có bài test nào cho khóa học này</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            {['Tên bài test', 'Thời gian', 'Số câu', 'Trạng thái', 'Thao tác'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {exams.map(exam => (
                                            <tr key={exam.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-4 font-medium text-gray-900">{exam.title || exam.name}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{exam.durationMinutes ? `${exam.durationMinutes} phút` : '—'}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{exam.examQuestions?.length || exam.totalQuestions || '—'}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${exam.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {exam.published ? 'Đã publish' : 'Bản nháp'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => navigate(`/edu-manager/tests/edit/${exam.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50"><Edit2 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleTogglePublish(exam)} className={`p-1.5 rounded-lg ${exam.published ? 'text-amber-400 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`}>
                                                            {exam.published ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                        </button>
                                                        <button onClick={() => handleDelete(exam)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            ) : (
                /* Pending exams tab - IMPROVED */
                <>
                    {/* Header with refresh button */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                ⏳ Đề thi chờ phê duyệt
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Review và phê duyệt các đề thi do giáo viên gửi
                            </p>
                        </div>
                        <button
                            onClick={fetchPendingExams}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Làm mới"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-gray-500">Đang tải đề thi chờ duyệt...</p>
                            </div>
                        ) : pendingApprovals.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Không có đề thi nào chờ phê duyệt!</p>
                                <p className="text-gray-400 text-sm mt-2">Tất cả đề thi đã được xử lý</p>
                            </div>
                        ) : (
                            pendingApprovals.map(approval => (
                                <div
                                    key={approval.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-6">
                                        {/* Left: Exam Info */}
                                        <div className="flex-1">
                                            {/* Header with badges */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    📝 {approval.exam.title || approval.exam.name || 'N/A'}
                                                </h3>
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                                                    {approval.exam.code || 'N/A'}
                                                </span>
                                            </div>

                                            {/* Course info */}
                                            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
                                                <div>
                                                    <p className="text-xs text-blue-600 font-medium mb-1">📚 Khóa học:</p>
                                                    <p className="text-sm font-semibold text-blue-900">
                                                        {approval.exam.course?.name || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-blue-600 font-medium mb-1">🎓 Cấp độ:</p>
                                                    <p className="text-sm font-semibold text-blue-900">
                                                        {approval.exam.course?.level || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Exam Details */}
                                            <div className="grid grid-cols-4 gap-3 mb-4">
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                                        <Clock className="w-3 h-3" />
                                                        Thời gian
                                                    </div>
                                                    <p className="text-base font-bold text-gray-900">
                                                        {approval.exam.duration || approval.exam.durationMinutes || 0} phút
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                                        <FileText className="w-3 h-3" />
                                                        Số câu hỏi
                                                    </div>
                                                    <p className="text-base font-bold text-gray-900">
                                                        {approval.exam.examQuestions?.length || approval.exam.totalQuestions || 0}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                                        ⭐ Điểm đạt
                                                    </div>
                                                    <p className="text-base font-bold text-gray-900">
                                                        {approval.exam.passingScore || 0}%
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Teacher & Date */}
                                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="w-4 h-4" />
                                                    <span>
                                                        <span className="font-medium">Người tạo:</span>{' '}
                                                        {approval.submittedBy?.fullName || approval.submittedBy?.username || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>
                                                        <span className="font-medium">Ngày gửi:</span>{' '}
                                                        {new Date(approval.submittedAt).toLocaleString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {approval.exam.description && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1">Mô tả:</p>
                                                    <p className="text-sm text-gray-700 line-clamp-2">{approval.exam.description}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleViewDetail(approval)}
                                                disabled={actionLoading}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Xem chi tiết đề thi"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleApprove(approval)}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                                                title="Duyệt đề thi"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Duyệt
                                            </button>
                                            <button
                                                onClick={() => handleReject(approval)}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                                                title="Từ chối đề thi"
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
                </>
            )}

            {/* Exam Detail Modal */}
            {showDetailModal && selectedExam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Chi Tiết Đề Thi</h3>
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
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm font-bold text-blue-900 mb-2">📝 Tên đề thi:</p>
                                    <p className="text-gray-900 font-medium">{selectedExam.exam.title || selectedExam.exam.name || 'N/A'}</p>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm font-bold text-blue-900 mb-2">🔢 Mã đề thi:</p>
                                    <p className="text-gray-900 font-medium">{selectedExam.exam.code || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Course Info */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm font-bold text-green-900 mb-2">📚 Thông tin khóa học:</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-green-600">Tên khóa học:</p>
                                        <p className="text-gray-900 font-medium">{selectedExam.exam.course?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-600">Cấp độ:</p>
                                        <p className="text-gray-900 font-medium">{selectedExam.exam.course?.level || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Exam Parameters */}
                            <div className="grid grid-cols-4 gap-3">
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-xs text-purple-600 font-medium mb-1">⏱️ Thời gian</p>
                                    <p className="text-lg font-bold text-purple-900">{selectedExam.exam.duration || selectedExam.exam.durationMinutes || 0} phút</p>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-xs text-purple-600 font-medium mb-1">📄 Số câu hỏi</p>
                                    <p className="text-lg font-bold text-purple-900">{selectedExam.exam.examQuestions?.length || selectedExam.exam.totalQuestions || 0}</p>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-xs text-purple-600 font-medium mb-1">⭐ Điểm đạt</p>
                                    <p className="text-lg font-bold text-purple-900">{selectedExam.exam.passingScore || 0}%</p>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedExam.exam.description && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm font-bold text-gray-900 mb-2">📋 Mô tả:</p>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedExam.exam.description}</p>
                                </div>
                            )}

                            {/* Questions Preview */}
                            {selectedExam.exam.examQuestions && selectedExam.exam.examQuestions.length > 0 && (
                                <div>
                                    <p className="text-sm font-bold text-gray-900 mb-3">📝 Danh sách câu hỏi:</p>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {selectedExam.exam.examQuestions.slice(0, 5).map((eq, index) => (
                                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-blue-600">Câu {index + 1}:</span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                                                        {eq.question?.questionType || 'N/A'}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-green-200 text-green-700">
                                                        {eq.points || 1} điểm
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-700 line-clamp-2" dangerouslySetInnerHTML={{ __html: eq.question?.questionText || 'N/A' }} />
                                                {eq.question?.imageUrl && (
                                                    <div className="mt-2 text-xs text-blue-500 font-medium flex items-center gap-1">
                                                        🖼️ Có hình ảnh đính kèm
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {selectedExam.exam.examQuestions.length > 5 && (
                                            <p className="text-center text-sm text-gray-500 italic">
                                                ... và {selectedExam.exam.examQuestions.length - 5} câu hỏi khác
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Submit Info */}
                            <div className="grid grid-cols-2 gap-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div>
                                    <p className="text-xs text-yellow-600 font-medium mb-1">👤 Người gửi:</p>
                                    <p className="text-gray-900 font-medium">{selectedExam.submittedBy?.fullName || selectedExam.submittedBy?.username || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-yellow-600 font-medium mb-1">📅 Ngày gửi:</p>
                                    <p className="text-gray-900 font-medium">{new Date(selectedExam.submittedAt).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Đóng
                                </button>
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
                                    Duyệt đề thi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EduTestManagement;
