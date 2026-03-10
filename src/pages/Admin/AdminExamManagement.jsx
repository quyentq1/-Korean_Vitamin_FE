import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Eye, Lock, Unlock, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

/**
 * AdminExamManagement - Quản lý đề thi cho Admin
 * Priority 1: Exam System
 */
const AdminExamManagement = () => {
    const { t } = useTranslation();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PUBLISHED, DRAFT, ARCHIVED

    const fetchExams = async () => {
        setLoading(true);
        // Fetch from API
        setLoading(false);
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleDelete = async (exam) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Xóa đề thi?',
            text: `Bạn có chắc muốn xóa "${exam.title}"?`,
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#ef4444'
        });

        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: 'Đã xóa',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    const handleTogglePublish = async (exam) => {
        const action = exam.published ? 'hủy công bố' : 'công bố';
        const result = await Swal.fire({
            icon: 'question',
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} đề thi?`,
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản Lý Đề Thi</h1>
                    <p className="text-gray-600 mt-1">Tạo và quản lý các bài kiểm tra</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Tạo Đề Thi Mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex gap-3">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setFilter('PUBLISHED')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'PUBLISHED' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        Đã công bố
                    </button>
                    <button
                        onClick={() => setFilter('DRAFT')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'DRAFT' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        Bản nháp
                    </button>
                    <button
                        onClick={() => setFilter('ARCHIVED')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'ARCHIVED' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        Lưu trữ
                    </button>
                </div>
            </div>

            {/* Exams List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {exams.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có đề thi nào</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Tên đề thi</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Khóa học</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Số câu</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Thời gian</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {exams.map((exam) => (
                                <tr key={exam.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{exam.title}</p>
                                        <p className="text-sm text-gray-500">{exam.description}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{exam.courseName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{exam.totalQuestions}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{exam.durationMinutes} phút</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            exam.published ? 'bg-green-100 text-green-700' :
                                            exam.archived ? 'bg-gray-100 text-gray-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {exam.published ? 'Đã công bố' : exam.archived ? 'Lưu trữ' : 'Bản nháp'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-gray-600 hover:text-indigo-600" title="Xem">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-600 hover:text-blue-600" title="Sửa">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleTogglePublish(exam)}
                                                className="p-2 text-gray-600 hover:text-yellow-600"
                                                title={exam.published ? 'Hủy công bố' : 'Công bố'}
                                            >
                                                {exam.published ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(exam)}
                                                className="p-2 text-gray-600 hover:text-red-600"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminExamManagement;
