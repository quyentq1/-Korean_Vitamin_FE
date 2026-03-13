import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Clock } from 'lucide-react';
import educationManagerService from '../../services/educationManagerService';
import Swal from 'sweetalert2';

const EditScheduleModal = ({ classId, schedule, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [lessonNumber, setLessonNumber] = useState('');
    const [lessonDate, setLessonDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [topic, setTopic] = useState('');
    const [room, setRoom] = useState('');
    const [status, setStatus] = useState('SCHEDULED');

    useEffect(() => {
        if (schedule) {
            setLessonNumber(schedule.lessonNumber || '');
            setLessonDate(schedule.lessonDate || '');
            setStartTime(schedule.startTime || '');
            setEndTime(schedule.endTime || '');
            setTopic(schedule.topic || '');
            setRoom(schedule.room || '');
            setStatus(schedule.status || 'SCHEDULED');
        }
    }, [schedule]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!lessonNumber || !lessonDate || !startTime || !endTime) {
            Swal.fire({
                icon: 'warning',
                title: 'Thiếu thông tin',
                text: 'Vui lòng nhập số buổi, ngày học và giờ học',
                confirmButtonColor: '#667eea'
            });
            return;
        }

        try {
            setLoading(true);

            const scheduleData = {
                lessonNumber: parseInt(lessonNumber),
                lessonDate: lessonDate,
                startTime: startTime,
                endTime: endTime,
                topic: topic || null,
                room: room || null,
                status: status
            };

            await educationManagerService.updateSchedule(classId, schedule.scheduleId, scheduleData);

            Swal.fire({
                icon: 'success',
                title: 'Cập nhật lịch học thành công',
                timer: 1500,
                showConfirmButton: false
            });

            onSuccess?.();
        } catch (error) {
            console.error('Error updating schedule:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: error.response?.data?.message || 'Không thể cập nhật lịch học',
                confirmButtonColor: '#667eea'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Chỉnh Sửa Lịch Học
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Lesson Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số buổi <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={lessonNumber}
                            onChange={(e) => setLessonNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1, 2, 3..."
                            min="1"
                        />
                    </div>

                    {/* Lesson Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày học <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={lessonDate}
                            onChange={(e) => setLessonDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giờ bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giờ kết thúc <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Topic */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chủ đề
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Chủ đề bài học..."
                        />
                    </div>

                    {/* Room */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phòng học
                        </label>
                        <input
                            type="text"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Phòng 301, A101..."
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="SCHEDULED">Đã lên lịch</option>
                            <option value="COMPLETED">Đã hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                            <option value="RESCHEDULED">Đã dời lịch</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditScheduleModal;
