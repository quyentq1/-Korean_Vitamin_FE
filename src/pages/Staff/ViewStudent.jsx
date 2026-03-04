import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User, Mail, Phone, Calendar, BookOpen, ChevronLeft,
    Edit, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import Swal from 'sweetalert2';
import staffService from '../../services/staffService';

/**
 * View Student Details Page
 * Staff can view detailed information about a student
 */
const ViewStudent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { studentId } = useParams();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Debug: log studentId from URL
        console.log('ViewStudent - studentId from useParams:', studentId);
        console.log('ViewStudent - studentId type:', typeof studentId);
        console.log('ViewStudent - studentId === undefined:', studentId === undefined);
        console.log('ViewStudent - studentId === "undefined":', studentId === 'undefined');

        // Validate studentId before fetching
        if (!studentId || studentId === 'undefined' || studentId === undefined) {
            console.error('ViewStudent - Invalid studentId detected:', studentId);
            setError('ID học viên không hợp lệ');
            setLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'ID học viên không hợp lệ',
                confirmButtonColor: '#667eea',
            }).then(() => {
                navigate('/student-management');
            });
            return;
        }

        const fetchStudentDetails = async () => {
            try {
                setLoading(true);
                const response = await staffService.getStudentDetails(studentId);
                setStudent(response);
            } catch (error) {
                console.error('Error fetching student details:', error);
                setError(error.message || 'Không thể tải thông tin học viên');
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: error.message || 'Không thể tải thông tin học viên',
                    confirmButtonColor: '#667eea',
                }).then(() => {
                    navigate('/student-management');
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStudentDetails();
    }, [studentId]);

    const handleEdit = () => {
        navigate(`/student-management/${studentId}/edit`);
    };

    const handleBack = () => {
        navigate('/student-management');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Quay lại</span>
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Học Viên</h1>
                            <p className="text-gray-500 mt-1">Mã học viên: {student.studentCode || 'N/A'}</p>
                        </div>
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Chỉnh Sửa</span>
                        </button>
                    </div>
                </div>

                {/* Student Information Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header with Avatar */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                        <div className="flex items-center gap-6">
                            {student.avatar ? (
                                <img
                                    src={student.avatar}
                                    alt={student.fullName}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-3xl border-4 border-white/30">
                                    {student.fullName?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold">{student.fullName}</h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                                        student.active
                                            ? 'bg-green-400/30 text-green-100'
                                            : 'bg-red-400/30 text-red-100'
                                    }`}>
                                        {student.active ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Đang hoạt động</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-4 h-4" />
                                                <span>Ngừng học</span>
                                            </>
                                        )}
                                    </span>
                                    <span className="text-white/80 text-sm">•</span>
                                    <span className="text-white/80 text-sm">{student.role || 'STUDENT'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Contact Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Thông Tin Liên Hệ
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="text-gray-900 font-medium">{student.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Điện thoại</p>
                                            <p className="text-gray-900 font-medium">{student.phone}</p>
                                        </div>
                                    </div>
                                    {student.createdAt && (
                                        <div className="flex items-start gap-3">
                                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Ngày tham gia</p>
                                                <p className="text-gray-900 font-medium">
                                                    {new Date(student.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Course Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    Thông Tin Khóa Học
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Số khóa học đã đăng ký</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {student.enrolledCourses?.length || student.courses?.length || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Lớp đang học</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {student.activeClasses?.length || 0}
                                        </p>
                                    </div>
                                    {student.lastLoginAt && (
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Lần cuối đăng nhập</p>
                                                <p className="text-gray-900 font-medium text-sm">
                                                    {new Date(student.lastLoginAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Enrolled Courses List */}
                        {(student.enrolledCourses || student.courses) && (student.enrolledCourses.length > 0 || student.courses.length > 0) && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Khóa Học Đang Theo</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(student.enrolledCourses || student.courses).map((course, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <p className="font-medium text-gray-900">{course.name || course.courseName}</p>
                                            {course.code && (
                                                <p className="text-sm text-gray-500">Mã: {course.code}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {student.notes && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ghi Chú</h3>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{student.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleEdit}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Chỉnh Sửa</span>
                    </button>
                    <button
                        onClick={handleBack}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Quay Lại</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewStudent;
