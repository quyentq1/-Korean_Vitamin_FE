import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, BookOpen, Clock, UserCheck, AlertCircle } from 'lucide-react';
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
        setLoading(true);
        examService.getPendingExams()
            .then(data => setPendingApprovals(Array.isArray(data) ? data : []))
            .catch(() => setPendingApprovals([]))
            .finally(() => setLoading(false));
    }, [activeTab]);

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
            title: 'Phê duyệt bài thi',
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
                await examService.approveExam(approval.exam.id, { status: 'APPROVED', feedback });
                setPendingApprovals(prev => prev.filter(a => a.id !== approval.id));
                Swal.fire({
                    icon: 'success',
                    title: 'Đã phê duyệt!',
                    text: 'Bài thi đã được phê duyệt và email đã được gửi cho giáo viên.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (e) {
                Swal.fire('Lỗi', 'Không thể phê duyệt bài thi', 'error');
            }
        }
    };

    const handleReject = async (approval) => {
        const { value: feedback } = await Swal.fire({
            title: 'Từ chối bài thi',
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
                await examService.approveExam(approval.exam.id, { status: 'REJECTED', feedback });
                setPendingApprovals(prev => prev.filter(a => a.id !== approval.id));
                Swal.fire({
                    icon: 'success',
                    title: 'Đã từ chối!',
                    text: 'Bài thi đã bị từ chối và email đã được gửi cho giáo viên.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (e) {
                Swal.fire('Lỗi', 'Không thể từ chối bài thi', 'error');
            }
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
                /* Pending exams tab */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Đang tải đề thi chờ duyệt...</div>
                    ) : pendingApprovals.length === 0 ? (
                        <div className="p-12 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-400">Không có đề thi nào đang chờ phê duyệt</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {['Tên đề thi', 'Khóa học', 'Giáo viên', 'Ngày nộp', 'Thao tác'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {pendingApprovals.map(approval => (
                                    <tr key={approval.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 font-medium text-gray-900">{approval.exam.title}</td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{approval.exam.course?.name}</td>
                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="w-4 h-4 text-gray-400" />
                                                {approval.submittedBy?.fullName || approval.submittedBy?.username}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {new Date(approval.submittedAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApprove(approval)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Duyệt
                                                </button>
                                                <button
                                                    onClick={() => handleReject(approval)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Từ chối
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/edu-manager/tests/edit/${approval.exam.id}`)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                    title="Xem chi tiết"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default EduTestManagement;
