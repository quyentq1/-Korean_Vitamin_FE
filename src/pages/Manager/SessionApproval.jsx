import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { managerService } from '../../services/managerService';
import { Calendar, Clock, MapPin, User, Check, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const SessionApproval = () => {
    const { t } = useTranslation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterClass, setFilterClass] = useState('');
    const [classes, setClasses] = useState([]);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchRequests();
        fetchClasses();
    }, [filterClass]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            let response;

            if (filterClass) {
                response = await managerService.getPendingReschedulesByClass(filterClass);
            } else {
                response = await managerService.getPendingReschedules();
            }

            setRequests(response.data || []);
        } catch (error) {
            console.error('Error fetching reschedule requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        // You might need to add this endpoint to the service
        // For now, we'll extract unique classes from requests
        const uniqueClasses = [...new Set(requests.map(req => req.classId).filter(Boolean))];
        setClasses(uniqueClasses);
    };

    const handleApprove = async (sessionId) => {
        if (!confirm(t('manager.sessions.confirmApprove'))) return;

        try {
            setProcessing(sessionId);
            await managerService.approveReschedule(sessionId);
            fetchRequests();
        } catch (error) {
            console.error('Error approving reschedule:', error);
            // Show error notification
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (sessionId) => {
        const reason = prompt(t('manager.sessions.rejectReason'));
        if (!reason) return; // User cancelled or empty reason

        try {
            setProcessing(sessionId);
            await managerService.rejectReschedule(sessionId, reason);
            fetchRequests();
        } catch (error) {
            console.error('Error rejecting reschedule:', error);
            // Show error notification
        } finally {
            setProcessing(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-blue-100 text-blue-800';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'IN_PROGRESS':
                return 'bg-yellow-100 text-yellow-800';
            case 'NO_SHOW':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('manager.sessions.title')}
                    </h1>
                    <p className="text-gray-600">
                        {t('manager.sessions.subtitle')}
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('manager.sessions.filterByClass')}
                            </label>
                            <select
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">{t('manager.sessions.allClasses')}</option>
                                {classes.map(classId => (
                                    <option key={classId} value={classId}>
                                        Class {classId}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">
                                {t('manager.sessions.totalRequests')}: <span className="font-semibold">{requests.length}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Requests List */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t('manager.sessions.noRequests')}
                        </h3>
                        <p className="text-gray-600">
                            {t('manager.sessions.noRequestsDescription')}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    {/* Request Info */}
                                    <div className="flex-1 min-w-0">
                                        {/* Header: Session ID + Status */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {request.sessionId}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                                                {t(`teacher.sessions.status.${request.status.toLowerCase()}`)}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                                {t('manager.sessions.pendingApproval')}
                                            </span>
                                        </div>

                                        {/* Class & Teacher Info */}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                            {request.class && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    <span className="font-medium">{request.class.className}</span>
                                                    <span className="mx-1">•</span>
                                                    <span>{request.class.classCode}</span>
                                                </div>
                                            )}
                                            {request.teacher && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    <span>{request.teacher.fullName}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Current Schedule */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                                {t('manager.sessions.currentSchedule')}
                                            </h4>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {request.sessionDate && format(new Date(request.sessionDate), 'EEEE, dd/MM/yyyy', { locale: vi })}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {request.startTime} - {request.endTime}
                                                </div>
                                                {request.location && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {request.location}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Requested Schedule */}
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h4 className="text-sm font-medium text-blue-900 mb-2">
                                                {t('manager.sessions.requestedSchedule')}
                                            </h4>
                                            <div className="flex flex-wrap gap-4 text-sm text-blue-800">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {request.requestedDate && format(new Date(request.requestedDate), 'EEEE, dd/MM/yyyy', { locale: vi })}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {request.requestedStartTime} - {request.requestedEndTime}
                                                </div>
                                            </div>
                                            {request.rescheduleReason && (
                                                <div className="mt-2 pt-2 border-t border-blue-300">
                                                    <p className="text-sm text-blue-800">
                                                        <span className="font-medium">{t('manager.sessions.reason')}:</span> {request.rescheduleReason}
                                                    </p>
                                                </div>
                                            )}
                                            {request.requestedAt && (
                                                <p className="text-xs text-blue-600 mt-2">
                                                    {t('manager.sessions.requestedAt')}: {format(new Date(request.requestedAt), 'dd/MM/yyyy HH:mm')}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleApprove(request.id)}
                                            disabled={processing === request.id}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Check className="w-4 h-4" />
                                            {processing === request.id ? t('common.processing') : t('manager.sessions.approve')}
                                        </button>
                                        <button
                                            onClick={() => handleReject(request.id)}
                                            disabled={processing === request.id}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <X className="w-4 h-4" />
                                            {processing === request.id ? t('common.processing') : t('manager.sessions.reject')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionApproval;
