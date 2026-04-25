import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import educationManagerService from '../../services/educationManagerService';
import Swal from 'sweetalert2';

const EduScheduleManagement = () => {
    const { t } = useTranslation();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [form, setForm] = useState({ lessonNumber: '', lessonDate: '', startTime: '', endTime: '', topic: '', room: '' });
    const toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });

    useEffect(() => { fetchClasses(); }, []);

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
                const normalizedSchedules = cls.schedules.map(s => ({ ...s, id: s.id || s.scheduleId }));
                setSchedules(normalizedSchedules);
            } else {
                const detail = await educationManagerService.getClassDetails(classId);
                const rawSchedules = detail?.schedules || detail?.data?.schedules || [];
                const normalizedSchedules = rawSchedules.map(s => ({ ...s, id: s.id || s.scheduleId }));
                setSchedules(normalizedSchedules);
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
            toast.fire({ icon: 'error', title: t('eduManager.schedule.fillAllFields') });
            return;
        }
        if (form.startTime >= form.endTime) {
            toast.fire({ icon: 'error', title: t('eduManager.schedule.startTimeBeforeEnd') });
            return;
        }
        const cls = classes.find(c => c.id === selectedClass);
        if (cls) {
            if (cls.startDate && form.lessonDate < cls.startDate) {
                toast.fire({ icon: 'error', title: t('eduManager.schedule.dateBeforeStart', { date: new Date(cls.startDate).toLocaleDateString('vi-VN') }) });
                return;
            }
            if (cls.endDate && form.lessonDate > cls.endDate) {
                toast.fire({ icon: 'error', title: t('eduManager.schedule.dateAfterEnd', { date: new Date(cls.endDate).toLocaleDateString('vi-VN') }) });
                return;
            }
        }
        try {
            await educationManagerService.createClassSchedule(selectedClass, {
                lessonNumber: parseInt(form.lessonNumber), lessonDate: form.lessonDate,
                startTime: form.startTime + ':00', endTime: form.endTime + ':00',
                topic: form.topic, room: form.room, status: 'SCHEDULED'
            });
            setShowAddModal(false);
            setForm({ lessonNumber: '', lessonDate: '', startTime: '', endTime: '', topic: '', room: '' });
            toast.fire({ icon: 'success', title: t('eduManager.schedule.addSuccess') });
            selectClass(selectedClass);
        } catch (error) {
            toast.fire({ icon: 'error', title: t('eduManager.schedule.addError') });
        }
    };

    const handleEditSchedule = async () => {
        if (!selectedClass || !editingSchedule) return;
        if (form.startTime >= form.endTime) {
            toast.fire({ icon: 'error', title: t('eduManager.schedule.startTimeBeforeEnd') });
            return;
        }
        const cls = classes.find(c => c.id === selectedClass);
        if (cls) {
            if (cls.startDate && form.lessonDate < cls.startDate) {
                toast.fire({ icon: 'error', title: t('eduManager.schedule.dateBeforeStart', { date: new Date(cls.startDate).toLocaleDateString('vi-VN') }) });
                return;
            }
            if (cls.endDate && form.lessonDate > cls.endDate) {
                toast.fire({ icon: 'error', title: t('eduManager.schedule.dateAfterEnd', { date: new Date(cls.endDate).toLocaleDateString('vi-VN') }) });
                return;
            }
        }
        try {
            await educationManagerService.updateClassSchedule(selectedClass, editingSchedule.id, {
                lessonNumber: parseInt(form.lessonNumber), lessonDate: form.lessonDate,
                startTime: form.startTime + ':00', endTime: form.endTime + ':00',
                topic: form.topic, room: form.room, status: 'SCHEDULED'
            });
            setEditingSchedule(null);
            setForm({ lessonNumber: '', lessonDate: '', startTime: '', endTime: '', topic: '', room: '' });
            toast.fire({ icon: 'success', title: t('eduManager.schedule.updateSuccess') });
            selectClass(selectedClass);
        } catch (error) {
            toast.fire({ icon: 'error', title: t('eduManager.schedule.updateError') });
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        const schedule = schedules.find(s => s.id === scheduleId);
        if (schedule?.status === 'COMPLETED') {
            toast.fire({ icon: 'error', title: t('eduManager.schedule.cannotDeleteCompleted') });
            return;
        }
        const result = await Swal.fire({
            icon: 'warning', title: t('eduManager.schedule.deleteSchedule'),
            text: t('eduManager.schedule.deleteConfirm'),
            showCancelButton: true, confirmButtonColor: '#ef4444',
            confirmButtonText: t('eduManager.schedule.delete'), cancelButtonText: t('eduManager.schedule.cancel'),
        });
        if (!result.isConfirmed) return;
        try {
            await educationManagerService.deleteClassSchedule(selectedClass, scheduleId);
            toast.fire({ icon: 'success', title: t('eduManager.schedule.deleteSuccess') });
            selectClass(selectedClass);
        } catch (error) {
            toast.fire({ icon: 'error', title: t('eduManager.schedule.deleteError') });
        }
    };

    const openEditModal = (schedule) => {
        if (schedule.status === 'COMPLETED') {
            toast.fire({ icon: 'error', title: t('eduManager.schedule.cannotEditCompleted') });
            return;
        }
        setEditingSchedule(schedule);
        setForm({
            lessonNumber: schedule.lessonNumber?.toString() || '',
            lessonDate: schedule.lessonDate || '',
            startTime: schedule.startTime?.substring(0, 5) || '',
            endTime: schedule.endTime?.substring(0, 5) || '',
            topic: schedule.topic || '', room: schedule.room || ''
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
                <h1 className="text-2xl font-bold text-gray-800">{t('eduManager.schedule.title')}</h1>
                {selectedClass && (
                    <button onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                        + {t('eduManager.schedule.addSchedule')}
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('eduManager.schedule.selectClass')}</h2>
                    <div className="space-y-2">
                        {classes.map((cls) => (
                            <button key={cls.id} onClick={() => selectClass(cls.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                    selectedClass === cls.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300'
                                }`}>
                                <div className="font-medium text-sm">{cls.className}</div>
                                <div className="text-xs text-gray-500">{cls.classCode}</div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : selectedClass ? (
                        <div className="bg-white rounded-lg border overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('eduManager.schedule.colSession')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('eduManager.schedule.colDate')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('eduManager.schedule.colTime')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('eduManager.schedule.colTopic')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('eduManager.schedule.colRoom')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('eduManager.schedule.colStatus')}</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">{t('eduManager.schedule.colAction')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {schedules.map((s) => (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-700">{t('eduManager.schedule.session')} {s.lessonNumber}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{s.lessonDate && new Date(s.lessonDate).toLocaleDateString('vi-VN')}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{s.topic || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{s.room || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    s.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                    s.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {s.status === 'COMPLETED' ? t('eduManager.schedule.completed') :
                                                     s.status === 'CANCELLED' ? t('eduManager.schedule.cancelled') :
                                                     s.status === 'RESCHEDULED' ? t('eduManager.schedule.rescheduled') : t('eduManager.schedule.scheduledStatus')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {s.status === 'COMPLETED' ? (
                                                    <span className="text-xs text-gray-400">{t('eduManager.schedule.attendanceTaken')}</span>
                                                ) : (
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => openEditModal(s)} className="text-xs text-indigo-600 hover:text-indigo-800">{t('eduManager.schedule.edit')}</button>
                                                    <button onClick={() => handleDeleteSchedule(s.id)} className="text-xs text-red-600 hover:text-red-800">{t('eduManager.schedule.delete')}</button>
                                                </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {schedules.length === 0 && (
                                        <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-400">{t('eduManager.schedule.noSchedules')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-400">{t('eduManager.schedule.selectClassHint')}</div>
                    )}
                </div>
            </div>
            {(showAddModal || editingSchedule) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">{editingSchedule ? t('eduManager.schedule.editSchedule') : t('eduManager.schedule.addSchedule')}</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('eduManager.schedule.sessionNumber')}</label>
                                <input type="number" value={form.lessonNumber} onChange={e => setForm({...form, lessonNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('eduManager.schedule.lessonDate')}</label>
                                <input type="date" value={form.lessonDate} onChange={e => setForm({...form, lessonDate: e.target.value})}
                                    min={classes.find(c => c.id === selectedClass)?.startDate || undefined}
                                    max={classes.find(c => c.id === selectedClass)?.endDate || undefined} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('eduManager.schedule.startTime')}</label>
                                    <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('eduManager.schedule.endTime')}</label>
                                    <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('eduManager.schedule.colTopic')}</label>
                                <input type="text" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('eduManager.schedule.colRoom')}</label>
                                <input type="text" value={form.room} onChange={e => setForm({...form, room: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={closeModal} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">{t('eduManager.schedule.cancel')}</button>
                            <button onClick={editingSchedule ? handleEditSchedule : handleAddSchedule}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                                {editingSchedule ? t('eduManager.schedule.update') : t('eduManager.schedule.add')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EduScheduleManagement;
