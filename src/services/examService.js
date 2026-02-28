import axiosClient from '../api/axiosClient';

export const examService = {
    // Get all published exams (Public/Guest view)
    getPublishedExams: async () => {
        return await axiosClient.get('/student/exams'); // Or public endpoint if exists
    },

    // Get specific exam details
    getExamDetails: async (id) => {
        return await axiosClient.get(`/student/exams/${id}`);
    },

    // Start Exam (Handles both Student and Guest via different endpoints based on auth)
    startExam: async (examId, isGuest = false) => {
        if (isGuest) {
            return await axiosClient.post(`/guest/exams/${examId}/start`);
        } else {
            return await axiosClient.post(`/student/exams/${examId}/start`);
        }
    },

    // Get Attempt Details
    getAttemptDetails: async (attemptId) => {
        return await axiosClient.get(`/student/attempts/${attemptId}`);
    },

    // Submit Answer
    submitAnswer: async (attemptId, data) => {
        return await axiosClient.post(`/student/attempts/${attemptId}/answer`, data);
    },

    // Submit Exam
    submitExam: async (attemptId) => {
        return await axiosClient.post(`/student/attempts/${attemptId}/submit`);
    }
};

export default examService;
