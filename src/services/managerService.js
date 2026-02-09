import axiosClient from '../api/axiosClient';

export const managerService = {
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
