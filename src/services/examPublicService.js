import axiosClient from '../api/axiosClient';

export const examPublicService = {
    // Get all guest exams
    getGuestExams: async () => {
        return await axiosClient.get('/api/guest/exams');
    },
    
    // Start a guest exam
    startGuestExam: async (examId) => {
        return await axiosClient.post(`/api/guest/exams/${examId}/start`);
    },
    
    // Exam details for public/guest access
    getExamDetails: async (examId) => {
        return await axiosClient.get(`/api/guest/exams/${examId}`);
    },

    // Generate guest test with unique questions (client-side filtering)
    generateGuestTest: async (excludeQuestionIds = []) => {
        try {
            // TODO: If backend supports it, send excludeQuestionIds
            // For now, we'll fetch exam and filter client-side
            const response = await axiosClient.get('/api/guest/exams');
            // Frontend will filter using questionFilter.js
            return response.data;
        } catch (error) {
            console.error('Error generating guest test:', error);
            // Fallback: return standard exam
            return await axiosClient.get('/api/guest/exams/1');
        }
    },
};

export default examPublicService;

