import { useEffect, useState } from 'react';
import { Search, UserPlus, UserMinus, RefreshCw } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import Swal from 'sweetalert2';

const EduTeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [classTeachers, setClassTeachers] = useState([]);
    const [assigning, setAssigning] = useState(false);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const [teachersData, classesData] = await Promise.all([
                educationManagerService.getAllTeachers(),
                educationManagerService.getAllClasses(),
            ]);
            setTeachers(Array.isArray(teachersData) ? teachersData : []);
            setClasses(Array.isArray(classesData) ? classesData : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassTeachers = async (classId) => {
        if (!classId) return;
        try {
            const data = await educationManagerService.getClassTeachers(classId);
            setClassTeachers(Array.isArray(data) ? data : []);
        } catch (e) { setClassTeachers([]); }
    };

    useEffect(() => { fetchTeachers(); }, []);
    useEffect(() => { fetchClassTeachers(selectedClass); }, [selectedClass]);

    const handleAssign = async (teacherId) => {
        if (!selectedClass) return Swal.fire('Chú ý', 'Vui lòng chọn lớp học trước', 'warning');
        setAssigning(true);
        try {
            await educationManagerService.assignTeacherToClass(selectedClass, teacherId, false);
            fetchClassTeachers(selectedClass);
            Swal.fire({ icon: 'success', title: 'Đã assign!', toast: true, timer: 1500, showConfirmButton: false, position: 'top-end' });
        } catch (e) {
            Swal.fire('Lỗi', 'Không thể phân công giáo viên', 'error');
        } finally {
            setAssigning(false);
        }
    };

    const isAssigned = (teacherId) => classTeachers.some(t => t.id === teacherId);
    const filtered = teachers.filter(t => t.fullName?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Giáo viên</h1>
                    <p className="text-gray-500 text-sm">{teachers.length} giáo viên trong hệ thống</p>
                </div>
                <button onClick={fetchTeachers} className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4" /> Làm mới
                </button>
            </div>

            {/* Class selector */}
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                <label className="block text-sm font-semibold text-violet-700 mb-2">Chọn lớp để assign / xem giáo viên</label>
                <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full sm:w-80 px-3 py-2 border border-violet-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-400 outline-none"
                >
                    <option value="">-- Chọn lớp học --</option>
                    {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.className} ({cls.classCode})</option>)}
                </select>
                {selectedClass && classTeachers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {classTeachers.map(t => (
                            <span key={t.id} className="text-xs bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full font-medium">
                                ✓ {t.fullName}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" placeholder="Tìm kiếm giáo viên..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none" />
                </div>
            </div>

            {/* Teacher list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Không tìm thấy giáo viên nào</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['Giáo viên', 'Email', 'Trạng thái lớp', 'Thao tác'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(teacher => (
                                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {teacher.fullName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{teacher.fullName}</p>
                                                <p className="text-xs text-gray-400">{teacher.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600">{teacher.email}</td>
                                    <td className="px-5 py-4">
                                        {selectedClass && (
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isAssigned(teacher.id) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {isAssigned(teacher.id) ? '✓ Đã assign' : 'Chưa assign'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {selectedClass && !isAssigned(teacher.id) && (
                                            <button
                                                onClick={() => handleAssign(teacher.id)}
                                                disabled={assigning}
                                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors"
                                            >
                                                <UserPlus className="w-3.5 h-3.5" /> Assign vào lớp
                                            </button>
                                        )}
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

export default EduTeacherManagement;
