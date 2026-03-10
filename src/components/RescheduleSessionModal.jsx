import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { teacherService } from '../services/teacherService';
import { X, Calendar, Clock } from 'lucide-react';

const RescheduleSessionModal = ({ session, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        newDate: '',
        newStartTime: session?.startTime || '09:00',
        newEndTime: session?.endTime || '11:00',
        reason: ''
    });

    useEffect(() => {
        if (session) {
            setFormData({
                newDate: '',
                newStartTime: session.startTime,
                newEndTime: session.endTime,
                reason: ''
            });
        }
    }, [session]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.newDate) {
            newErrors.newDate = t('teacher.rescheduleSession.errors.dateRequired');
        }
        if (!formData.newStartTime) {
            newErrors.newStartTime = t('teacher.rescheduleSession.errors.startTimeRequired');
        }
        if (!formData.newEndTime) {
            newErrors.newEndTime = t('teacher.rescheduleSession.errors.endTimeRequired');
        }
        if (formData.newStartTime >= formData.newEndTime) {
            newErrors.newEndTime = t('teacher.rescheduleSession.errors.endTimeAfterStart');
        }
        if (!formData.reason) {
            newErrors.reason = t('teacher.rescheduleSession.errors.reasonRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setLoading(true);

            const rescheduleData = {
                newDate: formData.newDate,
                newStartTime: formData.newStartTime,
                newEndTime: formData.newEndTime,
                reason: formData.reason
            };

            await teacherService.requestReschedule(session.id, rescheduleData);

            onSuccess();
        } catch (error) {
            console.error('Error requesting reschedule:', error);
            if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else {
                setErrors({ submit: t('teacher.rescheduleSession.errors.requestFailed') });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {t('teacher.rescheduleSession.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Current Session Info */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        {t('teacher.rescheduleSession.currentSession')}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{session?.sessionDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{session?.startTime} - {session?.endTime}</span>
                        </div>
                        {session?.location && (
                            <div className="text-gray-600">
                                <span className="font-medium">{t('teacher.rescheduleSession.location')}:</span> {session.location}
                            </div>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Warning Message */}
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                {t('teacher.rescheduleSession.warning')}
                            </p>
                        </div>

                        {/* New Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('teacher.rescheduleSession.newDate')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="newDate"
                                value={formData.newDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.newDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.newDate}</p>
                            )}
                        </div>

                        {/* New Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('teacher.rescheduleSession.newStartTime')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="newStartTime"
                                    value={formData.newStartTime}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.newStartTime && (
                                    <p className="mt-1 text-sm text-red-600">{errors.newStartTime}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('teacher.rescheduleSession.newEndTime')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="newEndTime"
                                    value={formData.newEndTime}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.newEndTime && (
                                    <p className="mt-1 text-sm text-red-600">{errors.newEndTime}</p>
                                )}
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('teacher.rescheduleSession.reason')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows={4}
                                placeholder={t('teacher.rescheduleSession.reasonPlaceholder')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.reason && (
                                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                            )}
                        </div>

                        {/* Additional Notes */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                {t('teacher.rescheduleSession.info')}
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{errors.submit}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('common.submitting') : t('teacher.rescheduleSession.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RescheduleSessionModal;
