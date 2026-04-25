import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { teacherService } from '../services/teacherService';
import Swal from 'sweetalert2';
import { X, Calendar, Clock, AlertTriangle, Loader2 } from 'lucide-react';

const RescheduleSessionModal = ({ session, onClose, onSuccess, classStartDate, classEndDate }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newStartTime, setNewStartTime] = useState(session?.startTime?.substring(0, 5) || '');
    const [newEndTime, setNewEndTime] = useState(session?.endTime?.substring(0, 5) || '');
    const [reason, setReason] = useState('');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    // Compute max date from class end date
    const maxDate = classEndDate || null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newDate) { Swal.fire(t('common.missingInfo'), t('component.reschedule.selectDate'), 'warning'); return; }
        if (!newStartTime) { Swal.fire(t('common.missingInfo'), t('component.reschedule.selectStartTime'), 'warning'); return; }
        if (!newEndTime) { Swal.fire(t('common.missingInfo'), t('component.reschedule.selectEndTime'), 'warning'); return; }
        if (newStartTime >= newEndTime) { Swal.fire(t('common.error'), t('component.reschedule.endTimeAfterStart'), 'warning'); return; }
        if (!reason.trim()) { Swal.fire(t('common.missingInfo'), t('component.reschedule.enterReason'), 'warning'); return; }

        // Validate date is within class date range
        if (classStartDate && newDate < classStartDate) {
            Swal.fire(t('common.error'), t('component.reschedule.dateBeforeClassStart', { date: new Date(classStartDate).toLocaleDateString('vi-VN') }), 'warning');
            return;
        }
        if (classEndDate && newDate > classEndDate) {
            Swal.fire(t('common.error'), t('component.reschedule.dateAfterClassEnd', { date: new Date(classEndDate).toLocaleDateString('vi-VN') }), 'warning');
            return;
        }

        setLoading(true);
        try {
            await teacherService.rescheduleSession(session.scheduleId, {
                newDate,
                newStartTime,
                newEndTime,
                reason: reason.trim()
            });
            Swal.fire({
                icon: 'success',
                title: t('component.reschedule.success'),
                text: t('component.reschedule.successMessage'),
                confirmButtonColor: '#6366f1',
                timer: 3000,
                timerProgressBar: true
            });
            onSuccess();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: t('component.reschedule.failed'),
                text: err?.response?.data?.message || t('common.tryAgain'),
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return dateStr; }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl relative">
                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white/70 rounded-2xl z-10 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-600">{t('component.reschedule.processing')}</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl px-6 py-5 text-white flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold">{t('component.reschedule.title')}</h2>
                        <p className="text-indigo-100 text-sm mt-0.5">{t('component.reschedule.sessionInfo', { lesson: session?.lessonNumber, className: session?.className })}</p>
                    </div>
                    <button onClick={onClose} disabled={loading}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Current Info */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{t('component.reschedule.currentSchedule')}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-700">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            <span className="font-medium">{formatDate(session?.lessonDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            <span className="font-medium">{session?.startTime?.substring(0, 5)} - {session?.endTime?.substring(0, 5)}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-800">{t('component.reschedule.warning')}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t('component.reschedule.newDate')} <span className="text-red-500">*</span>
                        </label>
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                            min={minDate} max={maxDate} disabled={loading}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t('component.reschedule.startTime')} <span className="text-red-500">*</span>
                            </label>
                            <input type="time" value={newStartTime} onChange={e => setNewStartTime(e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t('component.reschedule.endTime')} <span className="text-red-500">*</span>
                            </label>
                            <input type="time" value={newEndTime} onChange={e => setNewEndTime(e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t('component.reschedule.reason')} <span className="text-red-500">*</span>
                        </label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)}
                            rows={3} placeholder={t('component.reschedule.reasonPlaceholder')} disabled={loading}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} disabled={loading}
                            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-all inline-flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? t('common.processing') : t('component.reschedule.confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RescheduleSessionModal;
