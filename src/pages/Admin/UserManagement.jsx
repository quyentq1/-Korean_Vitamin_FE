import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import userService from '../../services/userService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const UserManagement = () => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState('all');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('userMgmt.title', 'Quản Lý Người Dùng')}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('userMgmt.subtitle', 'Quản lý tất cả người dùng trên hệ thống')}
                        </p>
                    </div>

                    {/* Filters & Actions */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <div className="flex w-full lg:w-auto overflow-x-auto pb-2 -mx-4 px-4 lg:-mx-0 lg:px-0 gap-2 hide-scrollbar">
                            {['all', 'learner', 'teacher', 'staff', 'manager', 'admin'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setFilter(r)}
                                    className={`px-4 py-2 rounded-xl font-medium transition whitespace-nowrap text-sm sm:text-base ${filter === r ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                                        }`}
                                >
                                    {t(`userMgmt.${r}`, r)}
                                </button>
                            ))}
                        </div>
                        <button className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-lg transition text-sm sm:text-base">
                            ➕ {t('userMgmt.addUser', 'Thêm Người Dùng')}
                        </button>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 lg:hidden">
                        {users.map((user) => (
                            <div key={user.id} className="bg-white rounded-xl shadow-md p-4 space-y-3 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-400 to-primary-600"></div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                </div>
                                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                                    <div className="flex gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'Learner' ? 'bg-blue-100 text-blue-700' :
                                            user.role === 'Teacher' ? 'bg-green-100 text-green-700' :
                                                user.role === 'Staff' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">{user.lastLogin}</span>
                                </div>
                                <div className="text-xs text-gray-500 px-4 pb-2">
                                    Expires: <span className="text-red-500">{user.expirationDate || 'N/A'}</span>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">👁️ View</button>
                                    <button className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium">✏️ Edit</button>
                                    <button className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium">🗑️ Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        <input type="checkbox" className="w-4 h-4" />
                                    </th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-700">{t('userMgmt.name', 'Tên')}</th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-700">{t('userMgmt.email', 'Email')}</th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-700">{t('userMgmt.role', 'Vai trò')}</th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-700">{t('userMgmt.status', 'Trạng thái')}</th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-700">{t('userMgmt.expirationDate', 'Ngày hết hạn')}</th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-700">{t('userMgmt.lastLogin', 'Đăng nhập cuối')}</th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-700">{t('userMgmt.actions', 'Thao tác')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <input type="checkbox" className="w-4 h-4" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.role === 'Learner' ? 'bg-blue-100 text-blue-700' :
                                                user.role === 'Teacher' ? 'bg-green-100 text-green-700' :
                                                    user.role === 'Staff' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-red-600">{user.expirationDate || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.lastLogin}</td>
                                        <td className="px-6 py-4">
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
            </div>

            <Footer />
        </div>
    );
};

export default UserManagement;
