import { useState, useEffect } from 'react';
import educationManagerService from '../../services/educationManagerService';

const EduScheduleManagement = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [form, setForm] = useState({ lessonNumber: '', lessonDate: '', startTime: '', endTime: '', topic: '', room: '' });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const data = await educationManagerService.getAllClasses();
            setClasses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const selectClass = async (classId) => {
        setSelectedClass(classId);
        setLoading(true);
        try {
            const cls = classes.find(c => c.id === classId);
            if (cls && cls.schedules) {
                setSchedules(cls.schedules);
            } else {
                const detail = await educationManagerService.getClassDetails(classId);
                setSchedules(detail?.schedules || []);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSchedule = async () => {
        if (!selectedClass || !form.lessonNumber || !form.lessonDate || !form.startTime || !form.endTime) {
            setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin' });
            return;
        }

        // Validate date is within class date range
        const cls = classes.find(c => c.id === selectedClass);
        if (cls) {
            if (cls.startDate && form.lessonDate < cls.startDate) {
                setMessage({ type: 'error', text: `Ngày học không được trước ngày bắt đầu lớp học (${new Date(cls.startDate).toLocaleDateString('vi-VN')})` });
                return;
            }
            if (cls.endDate && form.lessonDate > cls.endDate) {
                setMessage({ type: 'error', text: `Ngày học không được sau ngày kết thúc lớp học (${new Date(cls.endDate).toLocaleDateString('vi-VN')})` });
                return;
            }
        }
        try {
            await educationManagerService.createClassSchedule(selectedClass, {
                lessonNumber: parseInt(form.lessonNumber),
                lessonDate: form.lessonDate,
                startTime: form.startTime + ':00',
                endTime: form.endTime + ':00',
                topic: form.topic,
                room: form.room,
                status: 'SCHEDULED'
            });
            setShowAddModal(false);
            setForm({ lessonNumber: '', lessonDate: '', startTime: '', endTime: '', topic: '', room: '' });
            setMessage({ type: 'success', text: 'Thêm lịch học thành công!' });
            selectClass(selectedClass);
        } catch (error) {
            setMessage({ type: 'error', text: 'Lỗi khi thêm lịch học' });
        }
    };

    const handleEditSchedule = async () => {
        if (!selectedClass || !editingSchedule) return;

        // Validate date is within class date range
        const cls = classes.find(c => c.id === selectedClass);
        if (cls) {
            if (cls.startDate && form.lessonDate < cls.startDate) {
                setMessage({ type: 'error', text: `Ngày học không được trước ngày bắt đầu lớp học (${new Date(cls.startDate).toLocaleDateString('vi-VN')})` });
                return;
            }
            if (cls.endDate && form.lessonDate > cls.endDate) {
                setMessage({ type: 'error', text: `Ngày học không được sau ngày kết thúc lớp học (${new Date(cls.endDate).toLocaleDateString('vi-VN')})` });
                return;
            }
        }
        try {
            await educationManagerService.updateClassSchedule(selectedClass, editingSchedule.id, {
                lessonNumber: parseInt(form.lessonNumber),
                lessonDate: form.lessonDate,
                startTime: form.startTime + ':00',
                endTime: form.endTime + ':00',
                topic: form.topic,
                room: form.room,
                status: 'SCHEDULED'
            });
            setEditingSchedule(null);
            setForm({ lessonNumber: '', lessonDate: '', startTime: '', endTime: '', topic: '', room: '' });
            setMessage({ type: 'success', text: 'Cập nhật lịch học thành công!' });
            selectClass(selectedClass);
        } catch (error) {
            setMessage({ type: 'error', text: 'Lỗi khi cập nhật lịch học' });
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!window.confirm('Bạn có chắc muốn xóa lịch học này?')) return;
        try {
            await educationManagerService.deleteClassSchedule(selectedClass, scheduleId);
            setMessage({ type: 'success', text: 'Xóa lịch học thành công!' });
            selectClass(selectedClass);
        } catch (error) {
            setMessage({ type: 'error', text: 'Lỗi khi xóa lịch học' });
        }
    };

    const openEditModal = (schedule) => {
        setEditingSchedule(schedule);
        setForm({
            lessonNumber: schedule.lessonNumber?.toString() || '',
            lessonDate: schedule.lessonDate || '',
            startTime: schedule.startTime?.substring(0, 5) || '',
            endTime: schedule.endTime?.substring(0, 5) || '',
            topic: schedule.topic || '',
            room: schedule.room || ''
        });
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingSchedule(null);
        setForm({ lessonNumber: '', lessonDate: '', startTime: '', endTime: '', topic: '', room: '' });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý lịch học</h1>
                {selectedClass && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                    >
                        + Thêm lịch học
                    </button>
                )}
            </div>

            {message && (
                <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Class list */}
                <div className="lg:col-span-1">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Chọn lớp</h2>
                    <div className="space-y-2">
                        {classes.map((cls) => (
                            <button
                                key={cls.id}
                                onClick={() => selectClass(cls.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                    selectedClass === cls.id
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-200 bg-white hover:border-indigo-300'
                                }`}
                            >
                                <div className="font-medium text-sm">{cls.className}</div>
                                <div className="text-xs text-gray-500">{cls.classCode}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Schedules */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : selectedClass ? (
                        <div className="bg-white rounded-lg border overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Buổi</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Ngày</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Giờ</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Chủ đề</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Phòng</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Trạng thái</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {schedules.map((s) => (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-700">Buổi {s.lessonNumber}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {s.lessonDate && new Date(s.lessonDate).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{s.topic || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{s.room || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    s.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                    s.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {s.status === 'COMPLETED' ? 'Hoàn thành' :
                                                     s.status === 'CANCELLED' ? 'Đã hủy' :
                                                     s.status === 'RESCHEDULED' ? 'Đổi lịch' : 'Đã lên lịch'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(s)}
                                                        className="text-xs text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSchedule(s.id)}
                                                        className="text-xs text-red-600 hover:text-red-800"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {schedules.length === 0 && (
                                        <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-400">Chưa có lịch học</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-400">
                            Chọn lớp để quản lý lịch học
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || editingSchedule) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">{editingSchedule ? 'Sửa lịch học' : 'Thêm lịch học'}</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Buổi số</label>
                                <input type="number" value={form.lessonNumber} onChange={e => setForm({...form, lessonNumber: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày học</label>
                                <input type="date" value={form.lessonDate} onChange={e => setForm({...form, lessonDate: e.target.value})}
                                    min={classes.find(c => c.id === selectedClass)?.startDate || undefined}
                                    max={classes.find(c => c.id === selectedClass)?.endDate || undefined}
                                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu</label>
                                    <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc</label>
                                    <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề</label>
                                <input type="text" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng</label>
                                <input type="text" value={form.room} onChange={e => setForm({...form, room: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={closeModal} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Hủy</button>
                            <button
                                onClick={editingSchedule ? handleEditSchedule : handleAddSchedule}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                            >
                                {editingSchedule ? 'Cập nhật' : 'Thêm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EduScheduleManagement;
