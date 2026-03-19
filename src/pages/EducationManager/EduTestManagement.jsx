import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import Swal from 'sweetalert2';

const EduTestManagement = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [coursesLoading, setCoursesLoading] = useState(true);

    useEffect(() => {
        educationManagerService.getAllCourses()
            .then(data => setCourses(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setCoursesLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedCourse) { setExams([]); return; }
        setLoading(true);
        educationManagerService.getExamsByCourse(selectedCourse)
            .then(data => setExams(Array.isArray(data) ? data : []))
            .catch(() => setExams([]))
            .finally(() => setLoading(false));
    }, [selectedCourse]);

    const handleTogglePublish = async (exam) => {
        try {
            await educationManagerService.publishExam(exam.id, !exam.published);
            setExams(prev => prev.map(e => e.id === exam.id ? { ...e, published: !e.published } : e));
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

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài Test</h1>
                    <p className="text-gray-500 text-sm">Tạo, sửa, xóa bài test cho từng khóa học</p>
                </div>
                {selectedCourse && (
                    <button
                        onClick={() => navigate(`/edu-manager/tests/create?courseId=${selectedCourse}`)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors font-medium"
                    >
                        <Plus className="w-4 h-4" /> Tạo bài test
                    </button>
                )}
            </div>

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
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Navigating to:', `/edu-manager/tests/create?courseId=${selectedCourse}`);
                                    navigate(`/edu-manager/tests/create?courseId=${selectedCourse}`);
                                }}
                                className="text-green-600 hover:underline text-sm font-medium cursor-pointer"
                            >
                                + Tạo bài test đầu tiên
                            </button>
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
        </div>
    );
};

export default EduTestManagement;
