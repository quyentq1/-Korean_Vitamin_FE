import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import userService from '../../services/userService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const StudentManagement = () => {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ fullName: '', email: '', expirationDate: '', username: '', password: '' });

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
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await userService.createStudent({
                fullName: newItem.fullName,
                email: newItem.email,
                username: newItem.email, // Using email as username for simplicity or add field
                password: 'password123', // Default password or add field
                expirationDate: newItem.expirationDate
            });
            setShowModal(false);
            fetchStudents();
            setNewItem({ fullName: '', email: '', expirationDate: '', username: '', password: '' });
        } catch (error) {
            alert('Failed to create student: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('studentMgmt.title', 'Quản Lý Học Viên')}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('studentMgmt.subtitle', 'Quản lý thông tin và tiến độ học viên')}
                        </p>
                    </div>

                    {/* Actions Bar - Stack on mobile */}
                    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder={t('studentMgmt.search', 'Tìm kiếm học viên...')}
                                className="px-4 py-2.5 w-full sm:w-64 lg:w-80 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                            />
                            <select className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base">
                                <option value="">{t('studentMgmt.allClasses', 'Tất cả lớp')}</option>
                                <option value="advanced">Advanced</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="beginner">Beginner</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 sm:flex gap-2 sm:gap-3">
                            <button className="px-3 sm:px-4 lg:px-6 py-2.5 border-2 border-primary-300 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition text-xs sm:text-sm">
                                📥 <span className="hidden sm:inline">{t('studentMgmt.import', 'Import CSV')}</span>
                                <span className="sm:hidden">CSV</span>
                            </button>
                            <button className="px-3 sm:px-4 lg:px-6 py-2.5 border-2 border-primary-300 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition text-xs sm:text-sm">
                                📷 <span className="hidden sm:inline">{t('studentMgmt.ocr', 'OCR Import')}</span>
                                <span className="sm:hidden">OCR</span>
                            </button>
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-3 sm:px-4 lg:px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-lg transition text-xs sm:text-sm"
                            >
                                ➕ <span className="hidden sm:inline">{t('studentMgmt.addNew', 'Thêm Học Viên')}</span>
                                <span className="sm:hidden">Add</span>
                            </button>
                        </div>
                    </div>

                    {/* Students - Card view on mobile, Table on desktop */}
                    {/* Mobile Card View */}
                    <div className="block lg:hidden space-y-4">
                        {students.map((student) => (
                            <div key={student.id} className="bg-white rounded-2xl shadow-lg p-4 sm:p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {student.fullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{student.fullName}</h3>
                                            <p className="text-xs text-gray-500">{student.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {student.status === 'active' ? t('studentMgmt.active', 'Hoạt động') : t('studentMgmt.locked', 'Đã khóa')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                    <div>
                                        <span className="text-gray-500 text-xs">{t('studentMgmt.class', 'Lớp')}:</span>
                                        <div className="mt-0.5">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{student.class}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs">{t('studentMgmt.enrollDate', 'Ngày Nhập Học')}:</span>
                                        <div className="mt-0.5 text-gray-700">{student.enrollDate}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs">{t('studentMgmt.expirationDate', 'Ngày Hết Hạn')}:</span>
                                        <div className="mt-0.5 text-red-600">{student.expirationDate}</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>{t('studentMgmt.progress', 'Tiến Độ')}</span>
                                        <span className="font-medium">{student.progress}%</span>
                                    </div>
                                    <div className="bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                                            style={{ width: `${student.freeTestCount || 0}%` }} // Using freeTestCount as progress proxy for now
                                        ></div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-gray-100">
                                    <button className="flex-1 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium text-sm">👁️ View</button>
                                    <button className="flex-1 py-2 text-green-600 bg-green-50 rounded-lg font-medium text-sm">✏️ Edit</button>
                                    <button className="flex-1 py-2 text-red-600 bg-red-50 rounded-lg font-medium text-sm">🗑️ Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4 text-left font-bold text-gray-700">
                                            <input type="checkbox" className="w-4 h-4" />
                                        </th>
                                        <th className="px-4 py-4 text-left font-bold text-gray-700">{t('studentMgmt.name', 'Họ Tên')}</th>
                                        <th className="px-4 py-4 text-left font-bold text-gray-700">{t('studentMgmt.email', 'Email')}</th>
                                        <th className="px-4 py-4 text-left font-bold text-gray-700">{t('studentMgmt.class', 'Lớp')}</th>
                                        <th className="px-4 py-4 text-left font-bold text-gray-700">{t('studentMgmt.enrollDate', 'Ngày Nhập Học')}</th>
                                        <th className="px-4 py-4 text-left font-bold text-gray-700">{t('studentMgmt.expirationDate', 'Ngày Hết Hạn')}</th>
                                        <th className="px-4 py-4 text-left font-bold text-gray-700 min-w-[150px]">{t('studentMgmt.progress', 'Tiến Độ')}</th>
                                        <th className="px-4 py-4 text-left font-bold text-gray-700">{t('studentMgmt.status', 'Trạng Thái')}</th>
                                        <th className="px-4 py-4 text-left font-bold text-gray-700">{t('studentMgmt.actions', 'Thao Tác')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="px-4 py-4">
                                                <input type="checkbox" className="w-4 h-4" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {student.fullName?.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{student.fullName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-600">{student.email}</td>
                                            <td className="px-4 py-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                    {student.class}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-600">{student.enrollDate}</td>
                                            <td className="px-4 py-4 text-red-600 font-medium">{student.expirationDate}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                                                            style={{ width: `${student.freeTestCount || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{student.freeTestCount || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {student.status === 'active' ? t('studentMgmt.active', 'Hoạt động') : t('studentMgmt.locked', 'Đã khóa')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2">
                                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">👁️</button>
                                                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">✏️</button>
                                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Modal */}
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                                <h2 className="text-2xl font-bold mb-4">{t('studentMgmt.addNew', 'Thêm Học Viên')}</h2>
                                <form className="space-y-4" onSubmit={handleCreate}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Họ Tên</label>
                                        <input
                                            type="text"
                                            value={newItem.fullName}
                                            onChange={(e) => setNewItem({ ...newItem, fullName: e.target.value })}
                                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            value={newItem.email}
                                            onChange={(e) => setNewItem({ ...newItem, email: e.target.value })}
                                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Ngày Hết Hạn</label>
                                        <input
                                            type="date"
                                            value={newItem.expirationDate}
                                            onChange={(e) => setNewItem({ ...newItem, expirationDate: e.target.value })}
                                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Lưu</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default StudentManagement;
