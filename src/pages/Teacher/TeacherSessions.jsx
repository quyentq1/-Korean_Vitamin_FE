import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { teacherService } from '../../services/teacherService';
import { Calendar, Clock, MapPin, Plus, Edit, X, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import CreateSessionModal from '../../components/CreateSessionModal';
import RescheduleSessionModal from '../../components/RescheduleSessionModal';
import Swal from 'sweetalert2';

const TeacherSessions = () => {
    const { t } = useTranslation();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, [activeTab, startDate, endDate]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            let response;

            if (activeTab === 'upcoming') {
                response = await teacherService.getUpcomingSessions();
            } else if (activeTab === 'past') {
                response = await teacherService.getPastSessions();
            } else {
                // All sessions with date filter
                const params = {};
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                response = await teacherService.getTeacherSessions(params);
            }

            setSessions(response.data || []);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            // Show error notification
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = () => {
        setSelectedSession(null);
        setShowCreateModal(true);
    };

    const handleEditSession = (session) => {
        setSelectedSession(session);
        setShowCreateModal(true);
    };

    const handleRescheduleSession = (session) => {
        setSelectedSession(session);
        setShowRescheduleModal(true);
    };

    const handleCancelSession = async (sessionId) => {
        // Show confirmation first
        const confirmResult = await Swal.fire({
            icon: 'question',
            title: 'Hủy buổi học',
            text: t('teacher.sessions.confirmCancel') || 'Bạn có chắc muốn hủy buổi học này?',
            showCancelButton: true,
            confirmButtonText: 'Hủy',
            cancelButtonText: 'Không',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            reverseButtons: true
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        // Show input for reason
        const { value: reason } = await Swal.fire({
            icon: 'question',
            title: 'Lý do hủy',
            text: t('teacher.sessions.cancelReason') || 'Vui lòng nhập lý do hủy buổi học',
            input: 'text',
            inputPlaceholder: 'Nhập lý do...',
            showCancelButton: true,
            confirmButtonText: 'Hủy buổi',
            cancelButtonText: 'Bỏ qua',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            reverseButtons: true,
            inputValidator: (value) => {
                if (!value || value.trim() === '') {
                    return 'Vui lòng nhập lý do!'
                }
                return true
            }
        });

        if (reason === null || reason === undefined) {
            return; // User cancelled
        }

        try {
            await teacherService.cancelSession(sessionId, reason);
            fetchSessions();
            Swal.fire({
                icon: 'success',
                title: 'Đã hủy',
                text: 'Buổi học đã được hủy thành công.',
                confirmButtonText: 'Đồng ý',
                confirmButtonColor: '#22c55e',
                timer: 2000
            });
        } catch (error) {
            console.error('Error cancelling session:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể hủy buổi học. Vui lòng thử lại.',
                confirmButtonText: 'Đồng ý',
                confirmButtonColor: '#ef4444'
            });
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

    const getRescheduleStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800';
            default:
                return '';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('teacher.sessions.title')}
                    </h1>
                    <p className="text-gray-600">
                        {t('teacher.sessions.subtitle')}
                    </p>
                </div>

                {/* Actions Bar */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeTab === 'upcoming'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {t('teacher.sessions.upcoming')}
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeTab === 'past'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {t('teacher.sessions.past')}
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeTab === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {t('teacher.sessions.all')}
                            </button>
                        </div>

                        {/* Create Button */}
                        <button
                            onClick={handleCreateSession}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            {t('teacher.sessions.createSession')}
                        </button>
                    </div>

                    {/* Date Filter (only show for 'all' tab) */}
                    {activeTab === 'all' && (
                        <div className="mt-4 flex flex-wrap gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('teacher.sessions.startDate')}
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('teacher.sessions.endDate')}
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Sessions List */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t('teacher.sessions.noSessions')}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {t('teacher.sessions.noSessionsDescription')}
                        </p>
                        <button
                            onClick={handleCreateSession}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            {t('teacher.sessions.createFirstSession')}
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    {/* Session Info */}
                                    <div className="flex-1 min-w-0">
                                        {/* Header: Session ID + Statuses */}
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {session.sessionId}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                                                {t(`teacher.sessions.status.${session.status.toLowerCase()}`)}
                                            </span>
                                            {session.rescheduleRequested && (
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRescheduleStatusColor(session.rescheduleStatus)}`}>
                                                    {t(`teacher.sessions.rescheduleStatus.${session.rescheduleStatus.toLowerCase()}`)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Class Info */}
                                        {session.class && (
                                            <div className="text-sm text-gray-600 mb-2">
                                                <span className="font-medium">{session.class.className}</span>
                                                <span className="mx-2">•</span>
                                                <span>{session.class.classCode}</span>
                                            </div>
                                        )}

                                        {/* Date, Time, Location */}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {session.sessionDate && format(new Date(session.sessionDate), 'EEEE, dd/MM/yyyy', { locale: vi })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {session.startTime} - {session.endTime}
                                            </div>
                                            {session.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {session.location}
                                                </div>
                                            )}
                                        </div>

                                        {/* Notes */}
                                        {session.notes && (
                                            <div className="text-sm text-gray-600 mb-2">
                                                <span className="font-medium">{t('teacher.sessions.notes')}:</span>
                                                <span className="ml-1">{session.notes}</span>
                                            </div>
                                        )}

                                        {/* Reschedule Request Info */}
                                        {session.rescheduleRequested && session.rescheduleStatus === 'PENDING' && (
                                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <p className="text-sm font-medium text-yellow-800 mb-1">
                                                    {t('teacher.sessions.reschedulePending')}
                                                </p>
                                                <p className="text-sm text-yellow-700">
                                                    {t('teacher.sessions.requestedTime')}: {session.requestedDate} ({session.requestedStartTime} - {session.requestedEndTime})
                                                </p>
                                                {session.rescheduleReason && (
                                                    <p className="text-sm text-yellow-700 mt-1">
                                                        <span className="font-medium">{t('teacher.sessions.reason')}:</span> {session.rescheduleReason}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Rejection Reason */}
                                        {session.rescheduleRequested && session.rescheduleStatus === 'REJECTED' && session.rescheduleRejectionReason && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm font-medium text-red-800 mb-1">
                                                    {t('teacher.sessions.rescheduleRejected')}
                                                </p>
                                                <p className="text-sm text-red-700">
                                                    <span className="font-medium">{t('teacher.sessions.reason')}:</span> {session.rescheduleRejectionReason}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        {session.status === 'SCHEDULED' && (
                                            <>
                                                <button
                                                    onClick={() => handleEditSession(session)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    {t('teacher.sessions.edit')}
                                                </button>
                                                <button
                                                    onClick={() => handleRescheduleSession(session)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    {t('teacher.sessions.reschedule')}
                                                </button>
                                                <button
                                                    onClick={() => handleCancelSession(session.id)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                    {t('teacher.sessions.cancel')}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <CreateSessionModal
                    session={selectedSession}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchSessions();
                    }}
                />
            )}

            {/* Reschedule Modal */}
            {showRescheduleModal && (
                <RescheduleSessionModal
                    session={selectedSession}
                    onClose={() => setShowRescheduleModal(false)}
                    onSuccess={() => {
                        setShowRescheduleModal(false);
                        fetchSessions();
                    }}
                />
            )}
        </div>
    );
};

export default TeacherSessions;
