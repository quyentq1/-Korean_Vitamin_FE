import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User, Mail, Phone, MapPin, Calendar, GraduationCap, BookOpen,
    CheckCircle, XCircle, Clock, Edit, Ban, ArrowLeft, Loader2,
    Users, FileText, StickyNote, Activity
} from 'lucide-react';
import Swal from 'sweetalert2';
import staffService from '../../services/staffService';

const StudentDetail = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id: studentId } = useParams();

    const [activeTab, setActiveTab] = useState('overview');
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                setLoading(true);
                const response = await staffService.getStudentDetails(studentId);
                setStudent(response);
            } catch (error) {
                console.error('Error fetching student details:', error);
                Swal.fire({
                    icon: 'error',
                    title: t('errors.error'),
                    text: t('staff.studentDetail.errorLoadText'),
                    confirmButtonColor: '#667eea',
                });
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            fetchStudentDetails();
        }
    }, [studentId]);

    useEffect(() => {
        if (activeTab === 'notes' && studentId) {
            const fetchNotes = async () => {
                try {
                    const response = await staffService.getStudentNotes(studentId);
                    setNotes(response || []);
                } catch (error) {
                    console.error('Error fetching notes:', error);
                }
            };
            fetchNotes();
        }
    }, [activeTab, studentId]);

    const handleToggleStatus = async () => {
        const action = student.active ? t('staff.studentDetail.deactivate') : t('staff.studentDetail.activate');
        const result = await Swal.fire({
            icon: 'question',
            title: action,
            text: t('staff.studentDetail.toggleStatusConfirm', { action, name: student.fullName }),
            showCancelButton: true,
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            confirmButtonColor: '#667eea',
        });

        if (result.isConfirmed) {
            try {
                await staffService.updateStudentStatus(studentId, !student.active);
                const response = await staffService.getStudentDetails(studentId);
                setStudent(response);
                Swal.fire({
                    icon: 'success',
                    title: t('staff.studentDetail.successTitle'),
                    text: t('staff.studentDetail.toggleStatusSuccess', { action: action.toLowerCase() }),
                    timer: 1500,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: t('errors.error'),
                    text: error.message,
                    confirmButtonColor: '#667eea',
                });
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return '-';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('staff.studentDetail.notFound')}</h2>
                    <button
                        onClick={() => navigate('/student-management')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {t('staff.studentDetail.backToList')}
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: t('staff.studentDetail.tabOverview'), icon: User },
        { id: 'classes', label: t('staff.studentDetail.tabClasses'), icon: GraduationCap },
        { id: 'attendance', label: t('staff.studentDetail.tabAttendance'), icon: CheckCircle },
        { id: 'notes', label: t('staff.studentDetail.tabNotes'), icon: StickyNote },
        { id: 'activity', label: t('staff.studentDetail.tabActivity'), icon: Activity },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/student-management')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t('common.back')}
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Student Info */}
                        <div className="flex items-center gap-4">
                            {student.avatar ? (
                                <img
                                    src={student.avatar}
                                    alt={student.fullName}
                                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                                    {student.fullName?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{student.fullName}</h1>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                    <span className="text-gray-500">{t('staff.studentDetail.studentCode')}: {student.studentCode || 'N/A'}</span>
                                    <span>•</span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${student.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {student.isActive ? (
                                            <>
                                                <CheckCircle className="w-3 h-3" />
                                                {t('staff.studentDetail.activeStatus')}
                                            </>
                                        ) : (
                                            <>
                                                <Ban className="w-3 h-3" />
                                                {t('staff.studentDetail.disabledStatus')}
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(`/student-management/${studentId}/edit`)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium"
                            >
                                <Edit className="w-4 h-4" />
                                {t('common.edit')}
                            </button>
                            <button
                                onClick={handleToggleStatus}
                                className={`flex items-center gap-2 px-4 py-2 text-white rounded-xl transition-colors text-sm font-medium ${student.active
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-green-500 hover:bg-green-600'
                                    }`}
                            >
                                {student.active ? (
                                    <>
                                        <Ban className="w-4 h-4" />
                                        {t('staff.studentDetail.deactivate')}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        {t('staff.studentDetail.activate')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
                <div className="flex overflow-x-auto border-b border-gray-100">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            {t('staff.studentDetail.personalInfo')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Full Name */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <User className="w-4 h-4" />
                                    {t('staff.createStudent.fullName')}
                                </div>
                                <div className="font-semibold text-gray-900">{student.fullName}</div>
                            </div>

                            {/* Date of Birth */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <Calendar className="w-4 h-4" />
                                    {t('staff.students.dob')}
                                </div>
                                <div className="font-semibold text-gray-900">
                                    {formatDate(student.dateOfBirth)} ({calculateAge(student.dateOfBirth)} {t('staff.studentDetail.yearsOld')})
                                </div>
                            </div>

                            {/* Gender */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <User className="w-4 h-4" />
                                    {t('staff.students.gender')}
                                </div>
                                <div className="font-semibold text-gray-900 capitalize">
                                    {student.gender === 'male' ? t('staff.students.male') : student.gender === 'female' ? t('staff.students.female') : t('staff.students.other')}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <Mail className="w-4 h-4" />
                                    {t('common.email')}
                                </div>
                                <div className="font-semibold text-gray-900 text-sm break-all">
                                    {student.email || '-'}
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <Phone className="w-4 h-4" />
                                    {t('common.phone')}
                                </div>
                                <div className="font-semibold text-gray-900">{student.phone || '-'}</div>
                            </div>

                            {/* Address */}
                            <div className="bg-gray-50 rounded-xl p-4 md:col-span-2 lg:col-span-1">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <MapPin className="w-4 h-4" />
                                    {t('common.address')}
                                </div>
                                <div className="font-semibold text-gray-900 text-sm">
                                    {student.address || t('staff.studentDetail.notUpdated')}
                                </div>
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-3">{t('staff.studentDetail.accountInfo')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="text-sm text-blue-600 mb-1">{t('common.status')}</div>
                                    <div className="font-semibold text-blue-900">
                                        {student.isActive ? t('staff.studentDetail.activeStatus') : t('staff.studentDetail.lockedStatus')}
                                    </div>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <div className="text-sm text-purple-600 mb-1">{t('staff.studentDetail.currentClasses')}</div>
                                    <div className="font-semibold text-purple-900">
                                        {student.totalClasses || student.classes?.length || 0}
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="text-sm text-green-600 mb-1">{t('staff.studentDetail.totalCourses')}</div>
                                    <div className="font-semibold text-green-900">
                                        {student.totalCourses || 0}
                                    </div>
                                </div>
                                <div className="bg-amber-50 rounded-xl p-4">
                                    <div className="text-sm text-amber-600 mb-1">{t('staff.studentDetail.attendance')}</div>
                                    <div className="font-semibold text-amber-900">
                                        {student.attendanceRate ? `${Math.round(student.attendanceRate)}%` : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Classes Tab */}
                {activeTab === 'classes' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            {t('staff.studentDetail.enrolledClasses')}
                        </h2>

                        {student.classes && student.classes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {student.classes.map((classInfo) => (
                                    <div
                                        key={classInfo.classId}
                                        className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{classInfo.className}</h3>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {t('staff.studentDetail.classCode')}: {classInfo.classCode || 'N/A'}
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                <CheckCircle className="w-3 h-3" />
                                                {t('staff.studentDetail.studying')}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {classInfo.schedule && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    {classInfo.schedule}
                                                </div>
                                            )}
                                            {classInfo.startDate && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {formatDate(classInfo.startDate)}
                                                    {classInfo.endDate && ` - ${formatDate(classInfo.endDate)}`}
                                                </div>
                                            )}
                                            {classInfo.teacherName && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {t('staff.studentDetail.teacher')}: {classInfo.teacherName}
                                                </div>
                                            )}
                                            {classInfo.room && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    {t('staff.studentDetail.room')}: {classInfo.room}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => navigate(`/classes/${classInfo.classId}`)}
                                            className="mt-3 w-full py-2 text-center text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                        >
                                            {t('staff.studentDetail.viewClassDetail')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">{t('staff.studentDetail.noClasses')}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Attendance Tab */}
                {activeTab === 'attendance' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            {t('staff.studentDetail.attendanceHistory')}
                        </h2>

                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">{t('staff.studentDetail.attendanceDev')}</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {t('staff.studentDetail.attendanceDevHint')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <StickyNote className="w-5 h-5 text-blue-600" />
                                {t('staff.studentDetail.staffNotes')}
                            </h2>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                                {t('staff.notes.addNote')}
                            </button>
                        </div>

                        {notes.length > 0 ? (
                            <div className="space-y-3">
                                {notes.map((note) => (
                                    <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-yellow-600" />
                                                <span className="font-medium text-gray-900">{note.createdBy}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                                        </div>
                                        <p className="text-gray-700 text-sm">{note.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <StickyNote className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">{t('staff.notes.noNotes')}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            {t('staff.studentDetail.activityHistory')}
                        </h2>

                        <div className="text-center py-12">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">{t('staff.studentDetail.activityDev')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetail;
