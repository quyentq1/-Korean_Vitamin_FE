import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const RoleManagement = () => {
    const { t } = useTranslation();

    const roles = [
        {
            id: 1,
            name: 'Guest',
            users: 0,
            color: 'gray',
            permissions: ['view_free_tests', 'take_free_tests_limited']
        },
        {
            id: 2,
            name: 'Learner',
            users: 150,
            color: 'blue',
            permissions: ['view_tests', 'take_unlimited_tests', 'access_schedule', 'submit_writing', 'access_forum']
        },
        {
            id: 3,
            name: 'Teacher',
            users: 8,
            color: 'green',
            permissions: ['create_questions', 'grade_assignments', 'create_quizzes', 'view_reports', 'manage_classes']
        },
        {
            id: 4,
            name: 'Staff',
            users: 5,
            color: 'purple',
            permissions: ['manage_students', 'manage_classes', 'assign_roles', 'csv_import', 'ocr_import']
        },
        {
            id: 5,
            name: 'Education Manager',
            users: 2,
            color: 'orange',
            permissions: ['approve_questions', 'assign_teachers', 'approve_schedules', 'view_all_reports']
        },
        {
            id: 6,
            name: 'Admin',
            users: 1,
            color: 'red',
            permissions: ['full_access', 'system_settings', 'user_management', 'view_logs', 'manage_payments']
        }
    ];

    const colorMap = {
        gray: { bg: 'from-gray-500 to-gray-600', badge: 'bg-gray-100 text-gray-700' },
        blue: { bg: 'from-blue-500 to-blue-600', badge: 'bg-blue-100 text-blue-700' },
        green: { bg: 'from-green-500 to-green-600', badge: 'bg-green-100 text-green-700' },
        purple: { bg: 'from-purple-500 to-purple-600', badge: 'bg-purple-100 text-purple-700' },
        orange: { bg: 'from-orange-500 to-orange-600', badge: 'bg-orange-100 text-orange-700' },
        red: { bg: 'from-red-500 to-red-600', badge: 'bg-red-100 text-red-700' }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {t('roleMgmt.title', 'Quản Lý Vai Trò')}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {t('roleMgmt.subtitle', 'Cấu hình vai trò và quyền truy cập hệ thống')}
                        </p>
                    </div>

                    {/* Roles Grid - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {roles.map((role) => (
                            <div key={role.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                                {/* Header */}
                                <div className={`bg-gradient-to-r ${colorMap[role.color].bg} p-4 sm:p-6 text-white`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg sm:text-2xl font-bold">{role.name}</h3>
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            <span className="text-lg sm:text-2xl">
                                                {role.id === 1 ? '👤' : role.id === 2 ? '🎓' : role.id === 3 ? '👨‍🏫' : role.id === 4 ? '👔' : role.id === 5 ? '📊' : '⚙️'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm opacity-90">
                                        {role.users} {t('roleMgmt.users', 'người dùng')}
                                    </p>
                                </div>

                                {/* Permissions */}
                                <div className="p-4 sm:p-6">
                                    <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                                        {t('roleMgmt.permissions', 'Quyền hạn')}
                                    </h4>
                                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                                        {role.permissions.slice(0, 4).map((perm, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                                <span className="text-green-500">✓</span>
                                                <span className="truncate">{perm.replace(/_/g, ' ')}</span>
                                            </div>
                                        ))}
                                        {role.permissions.length > 4 && (
                                            <div className="text-xs sm:text-sm text-primary-600 font-medium">
                                                +{role.permissions.length - 4} {t('roleMgmt.more', 'thêm')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 px-3 sm:px-4 py-2 bg-primary-50 text-primary-600 rounded-lg font-medium hover:bg-primary-100 transition text-xs sm:text-sm">
                                            ✏️ {t('roleMgmt.edit', 'Sửa')}
                                        </button>
                                        <button className="px-3 sm:px-4 py-2 bg-gray-50 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition text-xs sm:text-sm">
                                            👥
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Permissions Matrix - Hide on mobile, scroll on tablet */}
                    <div className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                            {t('roleMgmt.permissionsMatrix', 'Ma Trận Quyền Hạn')}
                        </h2>

                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <div className="min-w-[600px] px-4 sm:px-0">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-gray-700 text-xs sm:text-sm">{t('roleMgmt.permission', 'Quyền')}</th>
                                            {roles.map((role) => (
                                                <th key={role.id} className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-gray-700 text-xs sm:text-sm">
                                                    <span className="hidden sm:inline">{role.name}</span>
                                                    <span className="sm:hidden">{role.name.charAt(0)}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {['View Tests', 'Take Tests', 'Grade Assignments', 'Manage Students', 'System Settings'].map((perm, idx) => (
                                            <tr key={idx} className="border-b border-gray-100">
                                                <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm">{perm}</td>
                                                {roles.map((role) => (
                                                    <td key={role.id} className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                                                        <span className={`inline-block w-5 h-5 sm:w-6 sm:h-6 rounded ${(role.id >= 2 && perm === 'View Tests') ||
                                                                (role.id >= 2 && perm === 'Take Tests') ||
                                                                (role.id >= 3 && perm === 'Grade Assignments') ||
                                                                (role.id >= 4 && perm === 'Manage Students') ||
                                                                (role.id === 6 && perm === 'System Settings')
                                                                ? 'bg-green-500'
                                                                : 'bg-gray-200'
                                                            }`}></span>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default RoleManagement;
