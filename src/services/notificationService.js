import axiosClient from '../api/axiosClient';

/**
 * Notification Service
 * Phase 4: Notifications
 *
 * API endpoints for notification management
 */

const notificationService = {
    /**
     * Get all notifications for current user
     * GET /api/notifications
     */
    getNotifications: async () => {
        return await axiosClient.get('/api/notifications');
    },

    /**
     * Get unread notifications count
     * GET /api/notifications/unread-count
     */
    getUnreadCount: async () => {
        return await axiosClient.get('/api/notifications/unread-count');
    },

    /**
     * Mark notification as read
     * PUT /api/notifications/{id}/read
     */
    markAsRead: async (id) => {
        return await axiosClient.put(`/api/notifications/${id}/read`);
    },

    /**
     * Mark all notifications as read
     * PUT /api/notifications/read-all
     */
    markAllAsRead: async () => {
        return await axiosClient.put('/api/notifications/read-all');
    },

    /**
     * Delete notification
     * DELETE /api/notifications/{id}
     */
    deleteNotification: async (id) => {
        return await axiosClient.delete(`/api/notifications/${id}`);
    },

    /**
     * Delete all notifications
     * DELETE /api/notifications/all
     */
    deleteAllNotifications: async () => {
        return await axiosClient.delete('/api/notifications/all');
    },

    /**
     * Update notification preferences
     * PUT /api/users/{userId}/notification-preferences
     */
    updatePreferences: async (userId, preferences) => {
        return await axiosClient.put(`/api/users/${userId}/notification-preferences`, preferences);
    },

    /**
     * Get notification preferences
     * GET /api/users/{userId}/notification-preferences
     */
    getPreferences: async (userId) => {
        return await axiosClient.get(`/api/users/${userId}/notification-preferences`);
    },

    // STAFF/ADMIN METHODS

    /**
     * Send notification to class
     * POST /api/staff/notifications/class-broadcast
     */
    sendToClass: async (classId, data) => {
        return await axiosClient.post(`/api/staff/notifications/class-broadcast/${classId}`, data);
    },

    /**
     * Send notification to multiple users
     * POST /api/staff/notifications/broadcast
     */
    sendBroadcast: async (data) => {
        return await axiosClient.post('/api/staff/notifications/broadcast', data);
    },

    /**
     * Notify on class join request
     * POST /api/staff/notifications/class-join-request
     */
    notifyClassJoinRequest: async (classId, studentId) => {
        return await axiosClient.post('/api/staff/notifications/class-join-request', {
            classId,
            studentId
        });
    },

    /**
     * Get notification statistics (admin)
     * GET /api/admin/notifications/statistics
     */
    getStatistics: async () => {
        return await axiosClient.get('/api/admin/notifications/statistics');
    }
};

export default notificationService;
