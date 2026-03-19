import axiosClient from '../api/axiosClient';

export const managerService = {
    // Dashboard Stats
    getDashboardStats: async () => {
        return await axiosClient.get('/api/manager/dashboard-stats');
    },

    // Session Approvals
    getPendingReschedules: async () => {
        return await axiosClient.get('/api/manager/sessions/pending');
    },

    getPendingReschedulesByClass: async (classId) => {
        return await axiosClient.get(`/api/manager/sessions/pending/class/${classId}`);
    },

    approveReschedule: async (sessionId) => {
        return await axiosClient.put(`/api/manager/sessions/${sessionId}/approve`);
    },

    rejectReschedule: async (sessionId, reason) => {
        return await axiosClient.put(`/api/manager/sessions/${sessionId}/reject`, null, {
            params: { reason }
        });
    },

    // Question Bank Approval
    getPendingQuestions: async () => {
        return await axiosClient.get('/api/manager/questions/pending');
    },

    checkDuplicate: async (questionText) => {
        return await axiosClient.post('/api/manager/questions/check-duplicate', {
            text: questionText
        });
    },

    approveQuestion: async (id) => {
        return await axiosClient.post(`/api/manager/questions/${id}/approve`);
    },

    rejectQuestion: async (id) => {
        return await axiosClient.post(`/api/manager/questions/${id}/reject`);
    },
};

export default managerService;
