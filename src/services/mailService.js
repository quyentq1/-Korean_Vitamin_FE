import axiosClient from '../api/axiosClient';

/**
 * Mail Service
 * API calls for mail/messaging functionality
 */
export const mailService = {
    // ==================== INBOX ====================

    /**
     * Get all mails from inbox
     * GET /api/mail/inbox
     */
    getInbox: async () => {
        try {
            return await axiosClient.get('/mail/inbox');
        } catch (error) {
            console.error('Error fetching inbox:', error);
            throw error;
        }
    },

    /**
     * Get mails from a specific folder
     * GET /api/mail/{folder}
     * @param {string} folder - inbox, sent, drafts, trash, starred, archive
     */
    getMails: async (folder = 'inbox') => {
        try {
            return await axiosClient.get(`/mail/${folder}`);
        } catch (error) {
            console.error(`Error fetching ${folder}:`, error);
            throw error;
        }
    },

    // ==================== SINGLE MAIL ====================

    /**
     * Get mail detail by ID
     * GET /api/mail/{id}
     */
    getMailById: async (mailId) => {
        try {
            return await axiosClient.get(`/mail/${mailId}`);
        } catch (error) {
            console.error('Error fetching mail:', error);
            throw error;
        }
    },

    /**
     * Mark mail as read
     * PUT /api/mail/{id}/read
     */
    markAsRead: async (mailId) => {
        try {
            return await axiosClient.put(`/mail/${mailId}/read`);
        } catch (error) {
            console.error('Error marking mail as read:', error);
            throw error;
        }
    },

    /**
     * Mark mail as unread
     * PUT /api/mail/{id}/unread
     */
    markAsUnread: async (mailId) => {
        try {
            return await axiosClient.put(`/mail/${mailId}/unread`);
        } catch (error) {
            console.error('Error marking mail as unread:', error);
            throw error;
        }
    },

    // ==================== SEND MAIL ====================

    /**
     * Send a new mail
     * POST /api/mail/send
     */
    sendMail: async (mailData) => {
        try {
            const formData = new FormData();
            formData.append('to', mailData.to);
            formData.append('subject', mailData.subject);
            formData.append('body', mailData.body);

            if (mailData.attachments && mailData.attachments.length > 0) {
                mailData.attachments.forEach(file => {
                    formData.append('attachments', file);
                });
            }

            return await axiosClient.post('/mail/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Error sending mail:', error);
            throw error;
        }
    },

    /**
     * Save mail as draft
     * POST /api/mail/drafts
     */
    saveDraft: async (mailData) => {
        try {
            return await axiosClient.post('/mail/drafts', mailData);
        } catch (error) {
            console.error('Error saving draft:', error);
            throw error;
        }
    },

    // ==================== REPLY & FORWARD ====================

    /**
     * Reply to a mail
     * POST /api/mail/{id}/reply
     */
    replyToMail: async (mailId, replyData) => {
        try {
            return await axiosClient.post(`/mail/${mailId}/reply`, replyData);
        } catch (error) {
            console.error('Error replying to mail:', error);
            throw error;
        }
    },

    /**
     * Forward a mail
     * POST /api/mail/{id}/forward
     */
    forwardMail: async (mailId, forwardData) => {
        try {
            return await axiosClient.post(`/mail/${mailId}/forward`, forwardData);
        } catch (error) {
            console.error('Error forwarding mail:', error);
            throw error;
        }
    },

    // ==================== MAIL ACTIONS ====================

    /**
     * Star/unstar a mail
     * PUT /api/mail/{id}/star
     */
    toggleStar: async (mailId) => {
        try {
            return await axiosClient.put(`/mail/${mailId}/star`);
        } catch (error) {
            console.error('Error toggling star:', error);
            throw error;
        }
    },

    /**
     * Archive a mail
     * PUT /api/mail/{id}/archive
     */
    archiveMail: async (mailId) => {
        try {
            return await axiosClient.put(`/mail/${mailId}/archive`);
        } catch (error) {
            console.error('Error archiving mail:', error);
            throw error;
        }
    },

    /**
     * Move mail to trash
     * PUT /api/mail/{id}/trash
     */
    trashMail: async (mailId) => {
        try {
            return await axiosClient.put(`/mail/${mailId}/trash`);
        } catch (error) {
            console.error('Error trashing mail:', error);
            throw error;
        }
    },

    /**
     * Delete mail permanently
     * DELETE /api/mail/{id}
     */
    deleteMail: async (mailId) => {
        try {
            return await axiosClient.delete(`/mail/${mailId}`);
        } catch (error) {
            console.error('Error deleting mail:', error);
            throw error;
        }
    },

    /**
     * Restore mail from trash
     * PUT /api/mail/{id}/restore
     */
    restoreMail: async (mailId) => {
        try {
            return await axiosClient.put(`/mail/${mailId}/restore`);
        } catch (error) {
            console.error('Error restoring mail:', error);
            throw error;
        }
    },

    // ==================== BULK ACTIONS ====================

    /**
     * Mark multiple mails as read
     * PUT /api/mail/bulk/read
     */
    bulkMarkAsRead: async (mailIds) => {
        try {
            return await axiosClient.put('/mail/bulk/read', { mailIds });
        } catch (error) {
            console.error('Error bulk marking as read:', error);
            throw error;
        }
    },

    /**
     * Delete multiple mails
     * PUT /api/mail/bulk/delete
     */
    bulkDelete: async (mailIds) => {
        try {
            return await axiosClient.put('/mail/bulk/delete', { mailIds });
        } catch (error) {
            console.error('Error bulk deleting:', error);
            throw error;
        }
    },

    // ==================== SEARCH & FILTER ====================

    /**
     * Search mails
     * GET /api/mail/search?q={query}
     */
    searchMails: async (query, folder = 'all') => {
        try {
            return await axiosClient.get(`/mail/search?q=${encodeURIComponent(query)}&folder=${folder}`);
        } catch (error) {
            console.error('Error searching mails:', error);
            throw error;
        }
    },

    /**
     * Get unread count
     * GET /api/mail/unread-count
     */
    getUnreadCount: async () => {
        try {
            return await axiosClient.get('/mail/unread-count');
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    },

    // ==================== ATTACHMENTS ====================

    /**
     * Download attachment
     * GET /api/mail/attachments/{id}
     */
    downloadAttachment: async (attachmentId) => {
        try {
            const response = await axiosClient.get(`/mail/attachments/${attachmentId}`, {
                responseType: 'blob'
            });
            return response;
        } catch (error) {
            console.error('Error downloading attachment:', error);
            throw error;
        }
    },

    // ==================== SETTINGS ====================

    /**
     * Get mail settings
     * GET /api/mail/settings
     */
    getSettings: async () => {
        try {
            return await axiosClient.get('/mail/settings');
        } catch (error) {
            console.error('Error fetching mail settings:', error);
            throw error;
        }
    },

    /**
     * Update mail settings
     * PUT /api/mail/settings
     */
    updateSettings: async (settings) => {
        try {
            return await axiosClient.put('/mail/settings', settings);
        } catch (error) {
            console.error('Error updating mail settings:', error);
            throw error;
        }
    },

    // ==================== NOTIFICATIONS ====================

    /**
     * Get mail notifications
     * GET /api/mail/notifications
     */
    getNotifications: async () => {
        try {
            return await axiosClient.get('/mail/notifications');
        } catch (error) {
            console.error('Error fetching mail notifications:', error);
            throw error;
        }
    },

    /**
     * Mark notification as read
     * PUT /api/mail/notifications/{id}/read
     */
    markNotificationAsRead: async (notificationId) => {
        try {
            return await axiosClient.put(`/mail/notifications/${notificationId}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },
};

export default mailService;
