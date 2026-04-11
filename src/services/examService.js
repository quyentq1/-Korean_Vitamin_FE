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

    // Get Attempt History
    getAttemptHistory: async () => {
        return await axiosClient.get('/student/attempts/history');
    },

    // Submit Answer
    submitAnswer: async (attemptId, data) => {
        return await axiosClient.post(`/student/attempts/${attemptId}/answer`, data);
    },

    // Submit Exam
    submitExam: async (attemptId) => {
        return await axiosClient.post(`/student/attempts/${attemptId}/submit`);
    },

    // ==================== Education Manager APIs ====================

    // Get pending exams waiting for approval
    getPendingExams: async () => {
        return await axiosClient.get('/education-manager/exams/pending');
    },

    // Get exams by category (MOCK vs PRACTICE)
    getExamsByCategory: async (category) => {
        return await axiosClient.get('/education-manager/exams/category/' + category);
    },

    // Get PRACTICE exams for a specific course (for students)
    getPracticeExamsByCourse: async (courseId) => {
        return await axiosClient.get(`/education-manager/exams/course/${courseId}`, {
            params: { examCategory: 'PRACTICE' }
        });
    },

    // Get all exams by course (used by StudentExamList)
    getExamsByCourse: async (courseId) => {
        return await axiosClient.get(`/education-manager/exams/course/${courseId}`);
    },

    // Get available exams for student (course-level + class-level)
    // Returns: { courseExams: [...], classExams: [...] }
    getAvailableExamsForStudent: async (courseId) => {
        return await axiosClient.get(`/student/exams/course/${courseId}`);
    },

    // Get MOCK exams for public/guest (for FreeTest)
    getMockExams: async () => {
        return await axiosClient.get('/guest/exams', {
            params: { examCategory: 'MOCK' }
        });
    },

    // Get MOCK exams for a specific course (for FreeTest by course)
    getMockExamsByCourse: async (courseId) => {
        return await axiosClient.get(`/guest/exams/course/${courseId}`);
    },

    // Get exams by approval status
    getExamsByStatus: async (status) => {
        return await axiosClient.get(`/education-manager/exams/status/${status}`);
    },

    // Approve or reject an exam
    approveExam: async (examId, data) => {
        return await axiosClient.post(`/education-manager/exams/${examId}/approve`, data);
    },

    // Get exam details with questions for approval review
    getExamDetailsForApproval: async (examId) => {
        return await axiosClient.get(`/education-manager/exams/${examId}/details`);
    },

    // ==================== Teacher APIs ====================

    // Get exams submitted by teacher with approval status
    getSubmittedExams: async (params = {}) => {
        return await axiosClient.get('/teacher/exams/submitted', { params });
    },

    // Get approval status for a specific exam
    getExamApproval: async (examId) => {
        return await axiosClient.get(`/teacher/exams/${examId}/approval`);
    }
};

export default examService;
