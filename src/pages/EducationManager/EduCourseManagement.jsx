import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Eye, CheckCircle, XCircle, Archive, RefreshCw } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import Swal from 'sweetalert2';
import CourseDetailModal from '../../components/EducationManager/CourseDetailModal';

const statusConfig = {
    PUBLISHED: { label: 'Đã publish', color: 'bg-green-100 text-green-700' },
    DRAFT: { label: 'Bản nháp', color: 'bg-gray-100 text-gray-600' },
    ARCHIVED: { label: 'Lưu trữ', color: 'bg-amber-100 text-amber-700' },
};

const EduCourseManagement = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedCourse, setSelectedCourse] = useState(null);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await educationManagerService.getAllCourses();
            const list = Array.isArray(data) ? data : [];
            setCourses(list);
            setFiltered(list);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    useEffect(() => {
        let result = [...courses];
        if (search) result = result.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.code?.toLowerCase().includes(search.toLowerCase()));
        if (statusFilter !== 'all') result = result.filter(c => c.status === statusFilter);
        setFiltered(result);
    }, [courses, search, statusFilter]);

    const handlePublish = async (course) => {
        try {
            if (course.status === 'PUBLISHED') {
                await educationManagerService.unpublishCourse(course.id);
            } else {
                await educationManagerService.publishCourse(course.id);
            }
            fetchCourses();
        } catch (e) {
            Swal.fire('Lỗi', 'Không thể thay đổi trạng thái', 'error');
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Khóa học</h1>
                    <p className="text-gray-500 text-sm">{filtered.length} khóa học</p>
                </div>
                <button
                    onClick={() => navigate('/edu-manager/courses/create')}
                    className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-xl hover:bg-violet-700 transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" /> Tạo khóa học
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm khóa học..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="DRAFT">Bản nháp</option>
                    <option value="PUBLISHED">Đã publish</option>
                    <option value="ARCHIVED">Lưu trữ</option>
                </select>
                <button onClick={fetchCourses} className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4" /> Làm mới
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-400">Không có khóa học nào</p>
                        <button onClick={() => navigate('/edu-manager/courses/create')} className="mt-4 text-violet-600 hover:underline text-sm">+ Tạo khóa học đầu tiên</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {['Tên khóa học', 'Mã', 'Giá', 'Trạng thái', 'Thao tác'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(course => (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-900">{course.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{course.description}</p>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{course.code}</td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{course.price?.toLocaleString('vi-VN')}₫</td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[course.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                                                {statusConfig[course.status]?.label || course.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => setSelectedCourse(course)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
                                                <button onClick={() => navigate(`/edu-manager/courses/edit/${course.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handlePublish(course)} className={`p-1.5 rounded-lg ${course.status === 'PUBLISHED' ? 'text-amber-400 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`} title={course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}>
                                                    {course.status === 'PUBLISHED' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Course Detail Modal */}
            {selectedCourse && (
                <CourseDetailModal
                    course={selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                />
            )}
        </div>
    );
};

export default EduCourseManagement;
