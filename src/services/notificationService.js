import axiosClient from '../api/axiosClient';

/**
 * Notification Service - Common notification endpoints for all users
 * Used by Teacher, Student, and Education Manager
 */
const notificationService = {
    // Get user notifications
    getNotifications: async () => {
        return await axiosClient.get('/notifications');
    },

    // Get unread notification count
    getUnreadCount: async () => {
        return await axiosClient.get('/notifications/unread-count');
    },

    // Mark notification as read
    markAsRead: async (id) => {
        return await axiosClient.put(`/notifications/${id}/read`);
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        return await axiosClient.put('/notifications/read-all');
    },
};

export default notificationService;
