import axiosClient from '../api/axiosClient';

export const teacherService = {
    // Grading
    getPendingGrading: async () => {
        return await axiosClient.get('/teacher/grading/pending');
    },

    getGradingAnswers: async (attemptId) => {
        return await axiosClient.get(`/teacher/grading/${attemptId}/answers`);
    },

    submitGrading: async (attemptId, answers) => {
        return await axiosClient.post(`/teacher/grading/${attemptId}/submit`, answers);
    },

    // Sessions
    getTeacherSessions: async (params) => {
        return await axiosClient.get('/teacher/sessions', { params });
    },

    getUpcomingSessions: async () => {
        return await axiosClient.get('/teacher/sessions/upcoming');
    },

    getPastSessions: async () => {
        return await axiosClient.get('/teacher/sessions/past');
    },

    getSessionDetails: async (sessionId) => {
        return await axiosClient.get(`/teacher/sessions/${sessionId}`);
    },

    createSession: async (sessionData) => {
        return await axiosClient.post('/teacher/sessions', sessionData);
    },

    updateSession: async (sessionId, sessionData) => {
        return await axiosClient.put(`/teacher/sessions/${sessionId}`, sessionData);
    },

    cancelSession: async (sessionId, reason) => {
        return await axiosClient.delete(`/teacher/sessions/${sessionId}`, {
            params: { reason }
        });
    },

    requestReschedule: async (sessionId, rescheduleData) => {
        return await axiosClient.post(`/teacher/sessions/${sessionId}/reschedule`, rescheduleData);
    },

    // Reports
    getClassReports: async (params) => {
        return await axiosClient.get('/teacher/reports/classes', { params });
    },
    
    getTopStudents: async (params) => {
        return await axiosClient.get('/teacher/reports/top-students', { params });
    },

    exportReports: async (params) => {
        return await axiosClient.get('/teacher/reports/export', {
            params,
            responseType: params.format === 'excel' ? 'blob' : 'arraybuffer'
        });
    },

    // Exam Management
    getExams: async (params) => {
        return await axiosClient.get('/teacher/exams', { params });
    },

    getExam: async (id) => {
        return await axiosClient.get(`/teacher/exams/${id}`);
    },

    createExam: async (data) => {
        return await axiosClient.post('/teacher/exams', data);
    },

    updateExam: async (id, data) => {
        return await axiosClient.put(`/teacher/exams/${id}`, data);
    },

    deleteExam: async (id) => {
        return await axiosClient.delete(`/teacher/exams/${id}`);
    },

    toggleExamPublish: async (id, published) => {
        return await axiosClient.patch(`/teacher/exams/${id}/publish`, { published });
    },

    getExamAttempts: async (id) => {
        return await axiosClient.get(`/teacher/exams/${id}/attempts`);
    },

    // Question Management
    getQuestions: async (params) => {
        return await axiosClient.get('/teacher/questions', { params });
    },

    getQuestion: async (id) => {
        return await axiosClient.get(`/teacher/questions/${id}`);
    },

    createQuestion: async (data) => {
        return await axiosClient.post('/teacher/questions', data);
    },

    updateQuestion: async (id, data) => {
        return await axiosClient.put(`/teacher/questions/${id}`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    deleteQuestion: async (id) => {
        return await axiosClient.delete(`/teacher/questions/${id}`);
    },

    // Question Import
    importQuestions: async (file, teacherId) => {
        const formData = new FormData();
        formData.append('file', file);
        return await axiosClient.post(`/teacher/questions/import?teacherId=${teacherId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    importQuestionsWord: async (file, teacherId) => {
        const formData = new FormData();
        formData.append('file', file);
        return await axiosClient.post(`/teacher/questions/import-word?teacherId=${teacherId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // Generate Excel import template
    downloadImportTemplate: async () => {
        return await axiosClient.get('/teacher/questions/import-template', {
            responseType: 'blob'
        });
    },

    // Audio Upload
    uploadAudio: async (file) => {
        const formData = new FormData();
        formData.append('audio', file);
        return await axiosClient.post('/teacher/questions/upload-audio', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    uploadQuestionAudio: async (questionId, file) => {
        const formData = new FormData();
        formData.append('audio', file);
        return await axiosClient.post(`/teacher/questions/${questionId}/audio`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // Exam Generation - Generate Quiz A/B variants
    generateQuizVariants: async (examId, teacherId) => {
        return await axiosClient.post(`/teacher/exams/${examId}/generate-variants`, null, {
            params: { teacherId }
        });
    },

    // Auto-grading
    autoGradeAttempt: async (attemptId) => {
        return await axiosClient.post(`/teacher/attempts/${attemptId}/auto-grade`);
    },

    getScorePercentage: async (attemptId) => {
        return await axiosClient.get(`/teacher/attempts/${attemptId}/percentage`);
    },

    // Learning Reports
    createLearningReport: async (reportData) => {
        return await axiosClient.post('/teacher/reports', reportData);
    },

    getTeacherLearningReports: async (classId) => {
        return await axiosClient.get('/teacher/reports', {
            params: classId ? { classId } : {}
        });
    },

    // Classes
    getTeacherClasses: async () => {
        return await axiosClient.get('/teacher/classes');
    },

    getClassStudents: async (classId) => {
        return await axiosClient.get(`/teacher/classes/${classId}/students`);
    },

    // Tag Management
    getTags: async (params) => {
        return await axiosClient.get('/teacher/tags', { params });
    },

    getTag: async (id) => {
        return await axiosClient.get(`/teacher/tags/${id}`);
    },

    createTag: async (data) => {
        return await axiosClient.post('/teacher/tags', data);
    },

    updateTag: async (id, data) => {
        return await axiosClient.put(`/teacher/tags/${id}`, data);
    },

    deleteTag: async (id) => {
        return await axiosClient.delete(`/teacher/tags/${id}`);
    },

    // Report Management - Send to Staff
    sendReportToStaff: async (reportData) => {
        return await axiosClient.post('/teacher/reports/send-to-staff', reportData);
    },

    getStaffList: async () => {
        return await axiosClient.get('/teacher/reports/staff-list');
    }
};

export default teacherService;
