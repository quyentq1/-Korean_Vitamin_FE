import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import classService from '../../services/classService';
import courseService from '../../services/courseService';

const ClassManagement = () => {
    const { t } = useTranslation();
    const [view, setView] = useState('list');
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [courses, setCourses] = useState([]);

    // Detail Modal State
    const [selectedClass, setSelectedClass] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [classStudents, setClassStudents] = useState([]);
    const [classTeachers, setClassTeachers] = useState([]);

    // Schedule & Attendance State
    const [schedules, setSchedules] = useState([]);
    const [selectedClassName, setSelectedClassName] = useState('');
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [attendanceList, setAttendanceList] = useState([]);

    // Form State for New Class
    const [newClass, setNewClass] = useState({
        courseId: '',
        classCode: '',
        className: '',
        capacity: 30,
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchClasses();
        fetchCourses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const data = await classService.getAllClasses();
            setClasses(data);
        } catch (error) {
            console.error("Failed to fetch classes", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const data = await courseService.getActiveCourses();
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await classService.createClass(newClass);
            setIsCreateModalOpen(false);
            fetchClasses();
            setNewClass({
                courseId: '',
                classCode: '',
                className: '',
                capacity: 30,
                startDate: '',
                endDate: '',
            });
            alert("Tạo lớp thành công!");
        } catch (error) {
            console.error("Failed to create class", error);
            alert("Lỗi khi tạo lớp: " + (error.response?.data?.message || error.message));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewClass(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenDetail = async (cls) => {
        setSelectedClass(cls);
        setIsDetailModalOpen(true);
        try {
            const students = await classService.getStudents(cls.id);
            setClassStudents(students);
            const teachers = await classService.getTeachers(cls.id);
            setClassTeachers(teachers);
        } catch (error) {
            console.error("Failed to fetch details", error);
            setClassStudents([]);
            setClassTeachers([]);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        const studentId = e.target.studentId.value;
        try {
            await classService.addStudent(selectedClass.id, studentId);
            alert("Thêm học viên thành công");
            const students = await classService.getStudents(selectedClass.id);
            setClassStudents(students);
            e.target.reset();
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Không thể thêm học viên"));
        }
    };

    const handleAssignTeacher = async (e) => {
        e.preventDefault();
        const teacherId = e.target.teacherId.value;
        const isPrimary = e.target.isPrimary.checked;
        try {
            await classService.assignTeacher(selectedClass.id, teacherId, isPrimary);
            alert("Gán giáo viên thành công");
            const teachers = await classService.getTeachers(selectedClass.id);
            setClassTeachers(teachers);
            e.target.reset();
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Không thể gán giáo viên"));
        }
    };

    // --- Schedule Logic ---

    const handleViewSchedule = async (cls) => {
        setSelectedClassName(cls.className);
        setView('calendar');
        setLoading(true);
        try {
            const data = await classService.getSchedules(cls.id);
            data.sort((a, b) => new Date(a.lessonDate) - new Date(b.lessonDate));
            setSchedules(data);
        } catch (error) {
            console.error("Failed to fetch schedules", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAttendance = async (schedule) => {
        setSelectedSchedule(schedule);
        try {
            const atts = await classService.getAttendance(schedule.id);
            if (atts && atts.length > 0) {
                setAttendanceList(atts.map(a => ({
                    studentId: a.student.id,
                    studentName: a.student.fullName,
                    status: a.status,
                    id: a.id
                })));
            } else {
                // Note: In real app, we should probably auto-init attendance records for all students
                // For now, we just warn if no records exist.
                // Ideally: Backend should have "get or create" logic.
                alert("Chưa có bản ghi điểm danh. Vui lòng tạo danh sách điểm danh trước (Chưa implement).");
            }
            setIsAttendanceModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch attendance", error);
        }
    };

    const handleSaveAttendance = async () => {
        try {
            const payload = attendanceList.map(a => ({
                id: a.id,
                student: { id: a.studentId },
                status: a.status
            }));
            await classService.markAttendance(selectedSchedule.id, payload);
            alert("Lưu điểm danh thành công!");
            setIsAttendanceModalOpen(false);
        } catch (error) {
            console.error("Failed to save attendance", error);
            alert("Lỗi lưu điểm danh");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8 flex justify-between items-center">
                        <div>
                            {view === 'calendar' ? (
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-700 font-medium">← Quay lại</button>
                                    <h1 className="text-2xl font-bold">{selectedClassName} - Lịch học</h1>
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                        {t('classMgmt.title', 'Quản Lý Lớp Học')}
                                    </h1>
                                    <p className="text-gray-600 text-sm sm:text-base">
                                        {t('classMgmt.subtitle', 'Tạo và quản lý các lớp học')}
                                    </p>
                                </div>
                            )}
                        </div>
                        {view === 'list' && (
                            <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-lg transition">
                                ➕ {t('classMgmt.createClass', 'Tạo Lớp Mới')}
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    {view === 'list' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.length === 0 ? (
                                <p className="col-span-full text-center py-12 text-gray-500">Chưa có lớp học nào.</p>
                            ) : classes.map((cls) => (
                                <div key={cls.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col">
                                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold">{cls.className}</h3>
                                            <span className="px-2 py-1 bg-white/20 rounded text-xs">{cls.status}</span>
                                        </div>
                                        <p className="text-xs opacity-90">Code: {cls.classCode}</p>
                                    </div>
                                    <div className="p-4 space-y-3 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <span>🗓️ {cls.startDate} → {cls.endDate}</span>
                                        </div>
                                        <div className="pt-3 grid grid-cols-2 gap-2 mt-auto">
                                            <button onClick={() => handleOpenDetail(cls)} className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100">
                                                👥 Chi tiết
                                            </button>
                                            <button onClick={() => handleViewSchedule(cls)} className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100">
                                                📅 Lịch học
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {schedules.length === 0 ? <p>Chưa có lịch học.</p> : schedules.map(sch => (
                                <div key={sch.id} className="bg-white p-4 rounded-xl shadow border-l-4 border-primary-500 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">Buổi {sch.lessonNumber}: {sch.topic}</h3>
                                        <p className="text-gray-600">📅 {sch.lessonDate} | ⏰ {sch.startTime} - {sch.endTime} | 📍 {sch.room}</p>
                                    </div>
                                    <button
                                        onClick={() => handleOpenAttendance(sch)}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
                                    >
                                        📝 Điểm danh
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Class Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold mb-4">Tạo Lớp Mới</h2>
                        <form onSubmit={handleCreateClass} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Khóa học</label>
                                <select name="courseId" value={newClass.courseId} onChange={handleInputChange} className="w-full border rounded-lg p-2" required>
                                    <option value="">Chọn khóa học...</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Mã lớp</label>
                                <input type="text" name="classCode" value={newClass.classCode} onChange={handleInputChange} className="w-full border rounded-lg p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên lớp</label>
                                <input type="text" name="className" value={newClass.className} onChange={handleInputChange} className="w-full border rounded-lg p-2" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                                    <input type="date" name="startDate" value={newClass.startDate} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                                    <input type="date" name="endDate" value={newClass.endDate} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Sĩ số</label>
                                <input type="number" name="capacity" value={newClass.capacity} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Tạo lớp</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Class Detail Modal */}
            {isDetailModalOpen && selectedClass && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">{selectedClass.className}</h2>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        {/* Teachers */}
                        <div className="mb-6">
                            <h3 className="font-bold mb-2">Giáo viên</h3>
                            <form onSubmit={handleAssignTeacher} className="flex gap-2 mb-2">
                                <input name="teacherId" placeholder="ID Giáo viên" className="border rounded p-1 flex-1" required />
                                <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="isPrimary" /> Chính</label>
                                <button className="bg-orange-500 text-white px-3 rounded">Gán</button>
                            </form>
                            <div className="space-y-1">
                                {classTeachers.map(t => (
                                    <div key={t.id} className="text-sm p-2 bg-gray-50 rounded flex justify-between">
                                        <span>{t.fullName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Students */}
                        <div>
                            <h3 className="font-bold mb-2">Học viên</h3>
                            <form onSubmit={handleAddStudent} className="flex gap-2 mb-2">
                                <input name="studentId" placeholder="ID Học viên" className="border rounded p-1 flex-1" required />
                                <button className="bg-green-600 text-white px-3 rounded">Thêm</button>
                            </form>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                {classStudents.map(s => (
                                    <div key={s.id} className="text-sm p-2 bg-gray-50 rounded flex justify-between">
                                        <span>{s.fullName}</span>
                                        <span className="text-gray-500">{s.email}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Modal */}
            {isAttendanceModalOpen && selectedSchedule && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Điểm danh - {selectedSchedule.lessonDate}</h2>
                            <button onClick={() => setIsAttendanceModalOpen(false)}>✕</button>
                        </div>
                        <div className="space-y-2 mb-4">
                            {attendanceList.map((att, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                    <span className="font-medium">{att.studentName}</span>
                                    <select
                                        value={att.status}
                                        onChange={(e) => {
                                            const newStats = [...attendanceList];
                                            newStats[idx].status = e.target.value;
                                            setAttendanceList(newStats);
                                        }}
                                        className="border rounded p-1 text-sm"
                                    >
                                        <option value="PRESENT">Đúng giờ</option>
                                        <option value="LATE">Đi muộn</option>
                                        <option value="ABSENT">Vắng mặt</option>
                                        <option value="EXCUSED">Có phép</option>
                                    </select>
                                </div>
                            ))}
                            {attendanceList.length === 0 && <p className="text-gray-500 text-center">Không có dữ liệu.</p>}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAttendanceModalOpen(false)} className="px-3 py-2 bg-gray-200 rounded">Hủy</button>
                            <button onClick={handleSaveAttendance} className="px-3 py-2 bg-blue-600 text-white rounded">Lưu</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ClassManagement;
