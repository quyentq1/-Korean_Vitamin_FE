import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Users, Send, Search, CheckSquare, Square, CheckCircle, AlertCircle, X, Filter, RotateCcw } from 'lucide-react';
import Swal from 'sweetalert2';

import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

import { staffService } from '../../services/staffService';

const MailManagement = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Filter state
    const [filterCourses, setFilterCourses] = useState([]);
    const [filterClasses, setFilterClasses] = useState([]);
    const [filterTeachers, setFilterTeachers] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    // Form state
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());
    const [customEmails, setCustomEmails] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Load filter options on mount
    useEffect(() => {
        loadFilters();
    }, []);

    // Reload users when filters change
    useEffect(() => {
        fetchUsers();
    }, [selectedCourse, selectedClass, selectedTeacher, selectedRole]);

    const loadFilters = async () => {
        try {
            const data = await staffService.getMailFilters();
            setFilterCourses(data.courses || []);
            setFilterClasses(data.classes || []);
            setFilterTeachers(data.teachers || []);
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedCourse) params.courseId = selectedCourse;
            if (selectedClass) params.classId = selectedClass;
            if (selectedTeacher) params.teacherId = selectedTeacher;
            if (selectedRole) params.role = selectedRole;
            const data = await staffService.getMailUsers(params);
            setUsers(data || []);
            setSelectedUserIds(new Set());
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: t('staff.mailManagement.errorLoadTitle'),
                text: t('staff.mailManagement.errorLoadText')
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = useMemo(() => {
        if (!selectedCourse) return filterClasses;
        return filterClasses.filter(c => String(c.courseId) === String(selectedCourse));
    }, [filterClasses, selectedCourse]);

    const handleClearFilters = () => {
        setSelectedCourse('');
        setSelectedClass('');
        setSelectedTeacher('');
        setSelectedRole('');
    };

    const hasActiveFilters = selectedCourse || selectedClass || selectedTeacher || selectedRole;

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        const q = searchQuery.toLowerCase();
        return users.filter(u =>
            (u.fullName && u.fullName.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q))
        );
    }, [searchQuery, users]);

    const handleSelectAll = () => {
        if (selectedUserIds.size === filteredUsers.length) {
            setSelectedUserIds(new Set());
        } else {
            setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleToggleUser = (id) => {
        const newSet = new Set(selectedUserIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedUserIds(newSet);
    };

    const handleSendMail = async (e) => {
        e.preventDefault();

        const customEmailList = customEmails.split(',').map(e => e.trim()).filter(e => e);

        if (selectedUserIds.size === 0 && customEmailList.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: t('staff.mailManagement.missingRecipientTitle'),
                text: t('staff.mailManagement.missingRecipientText')
            });
            return;
        }

        if (!subject.trim()) {
            Swal.fire({ icon: 'warning', title: t('staff.mailManagement.missingSubjectTitle'), text: t('staff.mailManagement.missingSubjectText') });
            return;
        }

        if (!content.trim()) {
            Swal.fire({ icon: 'warning', title: t('staff.mailManagement.missingContentTitle'), text: t('staff.mailManagement.missingContentText') });
            return;
        }

        try {
            setSending(true);

            Swal.fire({
                title: t('staff.mailManagement.sendingTitle'),
                text: t('staff.mailManagement.sendingText'),
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const payload = {
                userIds: Array.from(selectedUserIds),
                customEmails: customEmailList,
                subject: subject.trim(),
                content: content.trim()
            };

            await staffService.sendCustomMail(payload);

            await Swal.fire({
                icon: 'success',
                title: t('staff.mailManagement.sendSuccessTitle'),
                text: t('staff.mailManagement.sendSuccessText'),
                confirmButtonColor: '#22c55e'
            });

            setSubject('');
            setContent('');
            setCustomEmails('');
            setSelectedUserIds(new Set());

        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: t('staff.mailManagement.sendErrorTitle'),
                text: error.message || t('staff.mailManagement.sendErrorText'),
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title={t('staff.mailManagement.pageTitle')}
                subtitle={t('staff.mailManagement.pageSubtitle')}
                breadcrumbs={[
                    { label: 'Staff', path: '/staff' },
                    { label: t('staff.mailManagement.breadcrumbLabel') }
                ]}
            />

            {/* Filter Bar */}
            <Card className="bg-white shadow-sm border border-gray-100 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Filter className="w-4 h-4 text-indigo-500" />
                        {t('staff.mailManagement.recipientFilter')}
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" />
                            {t('staff.mailManagement.clearFilter')}
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {/* Role filter */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('staff.mailManagement.roleLabel')}</label>
                        <select
                            value={selectedRole}
                            onChange={e => setSelectedRole(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                            <option value="">{t('staff.mailManagement.allRoles')}</option>
                            <option value="STUDENT">{t('staff.mailManagement.roleStudent')}</option>
                            <option value="TEACHER">{t('staff.mailManagement.roleTeacher')}</option>
                            <option value="STAFF">{t('staff.mailManagement.roleStaff')}</option>
                            <option value="EDUCATION_MANAGER">{t('staff.mailManagement.roleEduManager')}</option>
                            <option value="ADMIN">{t('staff.mailManagement.roleAdmin')}</option>
                        </select>
                    </div>

                    {/* Course filter */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('staff.mailManagement.courseLabel')}</label>
                        <select
                            value={selectedCourse}
                            onChange={e => {
                                setSelectedCourse(e.target.value);
                                setSelectedClass('');
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                            <option value="">{t('staff.mailManagement.allCourses')}</option>
                            {filterCourses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Class filter */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('staff.mailManagement.classLabel')}</label>
                        <select
                            value={selectedClass}
                            onChange={e => setSelectedClass(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                            <option value="">{t('staff.mailManagement.allClasses')}</option>
                            {filteredClasses.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.className} {c.status !== 'ONGOING' ? `(${c.status})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Teacher filter */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('staff.mailManagement.teacherLabel')}</label>
                        <select
                            value={selectedTeacher}
                            onChange={e => setSelectedTeacher(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                            <option value="">{t('staff.mailManagement.allTeachers')}</option>
                            {filterTeachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Result count */}
                    <div className="flex items-end">
                        <div className="text-xs text-gray-500">
                            {loading ? t('common.loading') : t('staff.mailManagement.usersFound', { count: users.length })}
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Recipients */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="flex flex-col h-full bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                {t('staff.mailManagement.systemRecipients')}
                            </h3>
                            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {t('staff.mailManagement.selectedCount', { count: selectedUserIds.size })}
                            </span>
                        </div>

                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('staff.mailManagement.searchNameOrEmail')}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[400px] p-2">
                            {loading ? (
                                <div className="text-center py-6 text-gray-500 text-sm">{t('staff.mailManagement.loadingList')}</div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 text-sm">
                                    {t('staff.mailManagement.noUsersFound')}
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="block mx-auto mt-2 text-indigo-500 hover:underline text-xs"
                                        >
                                            {t('staff.mailManagement.clearFilter')}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <div
                                        onClick={handleSelectAll}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer mb-2 border-b border-gray-100 pb-3"
                                    >
                                        {selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0 ? (
                                            <CheckSquare className="w-5 h-5 text-blue-500" />
                                        ) : (
                                            <Square className="w-5 h-5 text-gray-300" />
                                        )}
                                        <span className="font-semibold text-gray-800 text-sm">{t('staff.mailManagement.selectAll', { count: filteredUsers.length })}</span>
                                    </div>

                                    {filteredUsers.map(user => (
                                        <div
                                            key={user.id}
                                            onClick={() => handleToggleUser(user.id)}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                                        >
                                            {selectedUserIds.has(user.id) ? (
                                                <CheckSquare className="w-5 h-5 text-blue-500 shrink-0" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-300 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{user.fullName || 'No Name'}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                {user.classes && user.classes.length > 0 && (
                                                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                                        {user.classes.map(c => c.className).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                {user.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right: Email form */}
                <div className="lg:col-span-2">
                    <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden p-6">
                        <form onSubmit={handleSendMail} className="space-y-6">

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('staff.mailManagement.extraEmailLabel')}
                                </label>
                                <textarea
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder={t('staff.mailManagement.extraEmailPlaceholder')}
                                    value={customEmails}
                                    onChange={(e) => setCustomEmails(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">{t('staff.mailManagement.extraEmailHint')}</p>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('staff.mailManagement.subjectLabel')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder={t('staff.mailManagement.subjectPlaceholder')}
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('staff.mailManagement.contentLabel')} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={12}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                                    placeholder={t('staff.mailManagement.contentPlaceholder')}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    icon={sending ? undefined : <Send className="w-4 h-4" />}
                                    disabled={sending}
                                    className="px-6"
                                >
                                    {sending ? t('staff.mailManagement.sendingMail') : t('staff.mailManagement.sendEmail')}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

            </div>

            {/* Full-screen blocking overlay while sending */}
            {sending && (
                <div className="fixed inset-0 z-[1500] bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-sm font-semibold text-gray-700">{t('staff.mailManagement.sendingOverlayTitle')}</p>
                        <p className="text-xs text-gray-400">{t('staff.mailManagement.sendingOverlayText')}</p>
                    </div>
                </div>
            )}
        </PageContainer>
    );
};

export default MailManagement;
