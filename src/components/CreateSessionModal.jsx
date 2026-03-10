import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { teacherService } from '../services/teacherService';
import { X } from 'lucide-react';

const CreateSessionModal = ({ session, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [errors, setErrors] = useState({});
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        classId: session?.classId || '',
        sessionId: session?.sessionId || '',
        sessionDate: session?.sessionDate || '',
        startTime: session?.startTime || '09:00',
        endTime: session?.endTime || '11:00',
        location: session?.location || '',
        notes: session?.notes || '',
        lessonCovered: session?.lessonCovered || ''
    });

    useEffect(() => {
        fetchClasses();
        if (session) {
            setFormData({
                classId: session.classId,
                sessionId: session.sessionId,
                sessionDate: session.sessionDate,
                startTime: session.startTime,
                endTime: session.endTime,
                location: session.location || '',
                notes: session.notes || '',
                lessonCovered: session.lessonCovered || ''
            });
        }
    }, [session]);

    const fetchClasses = async () => {
        try {
            const response = await teacherService.getTeacherClasses();
            setClasses(response.data || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

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

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.classId) {
            newErrors.classId = t('teacher.createSession.errors.classRequired');
        }
        if (!formData.sessionId) {
            newErrors.sessionId = t('teacher.createSession.errors.sessionIdRequired');
        }
        if (!formData.sessionDate) {
            newErrors.sessionDate = t('teacher.createSession.errors.dateRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!formData.startTime) {
            newErrors.startTime = t('teacher.createSession.errors.startTimeRequired');
        }
        if (!formData.endTime) {
            newErrors.endTime = t('teacher.createSession.errors.endTimeRequired');
        }
        if (formData.startTime >= formData.endTime) {
            newErrors.endTime = t('teacher.createSession.errors.endTimeAfterStart');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep1() || !validateStep2()) {
            return;
        }

        try {
            setLoading(true);

            // Convert date format if needed
            const sessionData = {
                ...formData,
                sessionDate: formData.sessionDate // Keep as ISO string
            };

            if (session) {
                await teacherService.updateSession(session.id, sessionData);
            } else {
                await teacherService.createSession(sessionData);
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving session:', error);
            if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else {
                setErrors({ submit: t('teacher.createSession.errors.saveFailed') });
            }
        } finally {
            setLoading(false);
        }
    };

    const isEditMode = !!session;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEditMode ? t('teacher.createSession.editTitle') : t('teacher.createSession.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                                1
                            </div>
                            <span className={`ml-2 text-sm font-medium ${
                                currentStep >= 1 ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                                {t('teacher.createSession.steps.basic')}
                            </span>
                        </div>
                        <div className={`flex-1 h-1 mx-4 ${
                            currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                        }`}></div>
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                                2
                            </div>
                            <span className={`ml-2 text-sm font-medium ${
                                currentStep >= 2 ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                                {t('teacher.createSession.steps.details')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            {/* Class Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('teacher.createSession.class')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="classId"
                                    value={formData.classId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isEditMode}
                                >
                                    <option value="">{t('teacher.createSession.selectClass')}</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.className} ({cls.classCode})
                                        </option>
                                    ))}
                                </select>
                                {errors.classId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.classId}</p>
                                )}
                            </div>

                            {/* Session ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('teacher.createSession.sessionId')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="sessionId"
                                    value={formData.sessionId}
                                    onChange={handleChange}
                                    placeholder={t('teacher.createSession.sessionIdPlaceholder')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.sessionId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.sessionId}</p>
                                )}
                            </div>

                            {/* Session Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('teacher.createSession.sessionDate')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="sessionDate"
                                    value={formData.sessionDate}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.sessionDate && (
                                    <p className="mt-1 text-sm text-red-600">{errors.sessionDate}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Time & Details */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            {/* Time Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('teacher.createSession.startTime')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.startTime && (
                                        <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('teacher.createSession.endTime')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.endTime && (
                                        <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('teacher.createSession.location')}
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder={t('teacher.createSession.locationPlaceholder')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('teacher.createSession.notes')}
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder={t('teacher.createSession.notesPlaceholder')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Lesson Covered (only for edit mode) */}
                            {isEditMode && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('teacher.createSession.lessonCovered')}
                                    </label>
                                    <textarea
                                        name="lessonCovered"
                                        value={formData.lessonCovered}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder={t('teacher.createSession.lessonCoveredPlaceholder')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error Message */}
                    {errors.submit && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{errors.submit}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex justify-between">
                        <button
                            type="button"
                            onClick={() => {
                                if (currentStep === 1) {
                                    onClose();
                                } else {
                                    setCurrentStep(1);
                                }
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {currentStep === 1 ? t('common.cancel') : t('common.back')}
                        </button>

                        {currentStep === 1 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (validateStep1()) {
                                        setCurrentStep(2);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {t('common.next')}
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? t('common.saving') : (isEditMode ? t('common.update') : t('common.create'))}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSessionModal;
