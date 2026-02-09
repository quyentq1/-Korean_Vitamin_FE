import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import userService from '../../services/userService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AddStudentModal from '../../components/Staff/AddStudentModal';

const StudentManagement = () => {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [classFilter, setClassFilter] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await userService.getStudents();
            setStudents(data);
        } catch (error) {
            console.error("Failed to fetch students", error);
            // Fallback for demo if API fails
            setStudents([
                { id: 1, fullName: 'Nguyen Van A', email: 'a@test.com', class: 'TOPIK I', status: 'active', progress: 45 },
                { id: 2, fullName: 'Tran Thi B', email: 'b@test.com', class: 'TOPIK II', status: 'active', progress: 70 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuccess = () => {
        setShowModal(false);
        fetchStudents();
        // Show simplified toast/alert here
        alert(t('staff.studentCreated', 'Đã thêm học viên thành công!'));
    };

    // Filtering logic
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.fullName?.toLowerCase().includes(filter.toLowerCase()) ||
            student.email?.toLowerCase().includes(filter.toLowerCase());
        const matchesClass = classFilter ? student.class === classFilter : true;
        return matchesSearch && matchesClass;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                {t('studentMgmt.title', 'Quản Lý Học Viên')}
                            </h1>
                            <p className="text-gray-600 text-sm">
                                {t('studentMgmt.subtitle', 'Quản lý thông tin, tiến độ và đăng ký khóa học')}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold hover:shadow-lg transition transform hover:-translate-y-0.5"
                        >
                            <span className="text-xl">+</span>
                            {t('studentMgmt.addNew', 'Thêm Học Viên')}
                        </button>
                    </div>

                    {/* Filters & Actions */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                <input
                                    type="text"
                                    placeholder={t('studentMgmt.search', 'Tìm kiếm tên, email...')}
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 w-full sm:w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                />
                            </div>
                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            >
                                <option value="">{t('studentMgmt.allClasses', 'Tất cả lớp')}</option>
                                <option value="TOPIK I">TOPIK I</option>
                                <option value="TOPIK II">TOPIK II</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition">
                                📥 Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Học Viên</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Khóa Học</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tiến Độ</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center font-bold text-sm">
                                                                {student.fullName?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{student.fullName}</div>
                                                                <div className="text-sm text-gray-500">{student.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                            {student.class}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="w-full max-w-[140px]">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span className="text-gray-500">Course</span>
                                                                <span className="font-medium text-gray-700">{student.progress}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-primary-500 h-1.5 rounded-full"
                                                                    style={{ width: `${student.progress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.status === 'active'
                                                                ? 'bg-green-50 text-green-700'
                                                                : 'bg-red-50 text-red-700'
                                                            }`}>
                                                            {student.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                                👁️
                                                            </button>
                                                            <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition">
                                                                ✏️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                    Không tìm thấy học viên nào phù hợp.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden space-y-4">
                                {filteredStudents.map((student) => (
                                    <div key={student.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                                                    {student.fullName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{student.fullName}</div>
                                                    <div className="text-sm text-gray-500">{student.email}</div>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </div>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between border-b border-gray-50 pb-2">
                                                <span className="text-gray-500">Khóa học</span>
                                                <span className="font-medium text-blue-600">{student.class}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-1">
                                                <span className="text-gray-500">Tiến độ</span>
                                                <div className="w-24 bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-500 h-2 rounded-full"
                                                        style={{ width: `${student.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2 pt-3 border-t border-gray-100">
                                            <button className="flex-1 py-2 text-blue-600 bg-blue-50 rounded-lg text-sm font-medium">Chi tiết</button>
                                            <button className="flex-1 py-2 text-primary-600 bg-primary-50 rounded-lg text-sm font-medium">Sửa</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <AddStudentModal
                    onClose={() => setShowModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            <Footer />
        </div>
    );
};

export default StudentManagement;

