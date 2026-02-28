import axiosClient from '../api/axiosClient';

export const examPublicService = {
    // Get all guest exams
    getGuestExams: async () => {
        return await axiosClient.get('/guest/exams');
    },

    // Exam details for public/guest access
    getExamDetails: async (examId) => {
        return await axiosClient.get(`/guest/exams/${examId}`);
    },

    // Start a guest exam
    startGuestExam: async (examId) => {
        return await axiosClient.post(`/guest/exams/${examId}/start`);
    },

    // Submit a single answer during the exam
    submitAnswer: async (attemptId, examQuestionId, answerText) => {
        return await axiosClient.post(`/guest/attempts/${attemptId}/answer`, {
            examQuestionId: examQuestionId,
            answerText: String(answerText)
        });
    },

    // Submit the whole exam
    submitExam: async (attemptId) => {
        return await axiosClient.post(`/guest/attempts/${attemptId}/submit`);
    }
};

export default examPublicService;


