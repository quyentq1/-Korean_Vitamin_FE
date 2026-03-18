import { useEffect, useState } from 'react';
import { Search, UserPlus, RefreshCw } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import Swal from 'sweetalert2';

const EduStudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [classStudents, setClassStudents] = useState([]);
    const [assigning, setAssigning] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [studentsResp, classesResp] = await Promise.all([
                educationManagerService.getAllStudents({ size: 100 }),
                educationManagerService.getAllClasses(),
            ]);
            const studentList = studentsResp?.students || studentsResp?.content || (Array.isArray(studentsResp) ? studentsResp : []);
            setStudents(studentList);
            setClasses(Array.isArray(classesResp) ? classesResp : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassStudents = async (classId) => {
        if (!classId) return;
        try {
            const data = await educationManagerService.getClassStudents(classId);
            setClassStudents(Array.isArray(data) ? data : []);
        } catch (e) { setClassStudents([]); }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { fetchClassStudents(selectedClass); }, [selectedClass]);

    const handleAssign = async (studentId) => {
        if (!selectedClass) return Swal.fire('Chú ý', 'Vui lòng chọn lớp học trước', 'warning');
        setAssigning(true);
        try {
            await educationManagerService.addStudentToClass(selectedClass, { studentId: Number(studentId) });
            fetchClassStudents(selectedClass);
            Swal.fire({ icon: 'success', title: 'Đã thêm học viên!', toast: true, timer: 1500, showConfirmButton: false, position: 'top-end' });
        } catch (e) {
            Swal.fire('Lỗi', e?.message || 'Không thể thêm học viên vào lớp', 'error');
        } finally {
            setAssigning(false);
        }
    };

    const isAssigned = (studentId) => classStudents.some(s => s.id === studentId);
    const filtered = students.filter(s =>
        s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Học viên</h1>
                    <p className="text-gray-500 text-sm">{students.length} học viên trong hệ thống</p>
                </div>
                <button onClick={fetchData} className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4" /> Làm mới
                </button>
            </div>

            {/* Class selector */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <label className="block text-sm font-semibold text-orange-700 mb-2">Chọn lớp để assign học viên</label>
                <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full sm:w-80 px-3 py-2 border border-orange-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-400 outline-none"
                >
                    <option value="">-- Chọn lớp học --</option>
                    {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.className} ({cls.classCode})</option>)}
                </select>
                {selectedClass && (
                    <p className="mt-2 text-xs text-orange-600">{classStudents.length} học viên đang trong lớp này</p>
                )}
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" placeholder="Tìm kiếm học viên theo tên, email..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
            </div>

            {/* Student list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Không tìm thấy học viên</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['Học viên', 'Email', 'Trạng thái', 'Thao tác'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(student => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {student.fullName?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{student.fullName}</p>
                                                <p className="text-xs text-gray-400">{student.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600">{student.email}</td>
                                    <td className="px-5 py-4">
                                        {selectedClass && (
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isAssigned(student.id) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {isAssigned(student.id) ? '✓ Đã trong lớp' : 'Chưa vào lớp'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {selectedClass && !isAssigned(student.id) && (
                                            <button
                                                onClick={() => handleAssign(student.id)}
                                                disabled={assigning}
                                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-colors"
                                            >
                                                <UserPlus className="w-3.5 h-3.5" /> Thêm vào lớp
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

export default EduStudentManagement;
