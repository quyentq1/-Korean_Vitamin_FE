import axiosClient from '../api/axiosClient';

export const teacherService = {
    // Grading
    getPendingGrading: async () => {
        return await axiosClient.get('/api/teacher/grading/pending');
    },

    getGradingAnswers: async (attemptId) => {
        return await axiosClient.get(`/api/teacher/grading/${attemptId}/answers`);
    },

    submitGrading: async (attemptId, answers) => {
        return await axiosClient.post(`/api/teacher/grading/${attemptId}/submit`, answers);
    },

    // Reports
    getClassReports: async (params) => {
        return await axiosClient.get('/api/teacher/reports/classes', { params });
    },
    
    getTopStudents: async (params) => {
        return await axiosClient.get('/api/teacher/reports/top-students', { params });
    },
    
    exportReports: async (params) => {
        return await axiosClient.get('/api/teacher/reports/export', {
            params,
            responseType: params.format === 'excel' ? 'blob' : 'arraybuffer'
        });
    },

    // Exam Management
    getExams: async (params) => {
        return await axiosClient.get('/api/teacher/exams', { params });
    },

    getExam: async (id) => {
        return await axiosClient.get(`/api/teacher/exams/${id}`);
    },

    createExam: async (data) => {
        return await axiosClient.post('/api/teacher/exams', data);
    },

    updateExam: async (id, data) => {
        return await axiosClient.put(`/api/teacher/exams/${id}`, data);
    },

    deleteExam: async (id) => {
        return await axiosClient.delete(`/api/teacher/exams/${id}`);
    },

    toggleExamPublish: async (id, published) => {
        return await axiosClient.patch(`/api/teacher/exams/${id}/publish`, { published });
    },

    getExamAttempts: async (id) => {
        return await axiosClient.get(`/api/teacher/exams/${id}/attempts`);
    },

    // Question Management
    getQuestions: async (params) => {
        return await axiosClient.get('/api/teacher/questions', { params });
    },

    createQuestion: async (data) => {
        return await axiosClient.post('/api/teacher/questions', data);
    },

    updateQuestion: async (id, data) => {
        return await axiosClient.put(`/api/teacher/questions/${id}`, data);
    },

    deleteQuestion: async (id) => {
        return await axiosClient.delete(`/api/teacher/questions/${id}`);
    },

    // Question Import
    importQuestions: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await axiosClient.post('/api/teacher/questions/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    importQuestionsWord: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await axiosClient.post('/api/teacher/questions/import-word', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default teacherService;
