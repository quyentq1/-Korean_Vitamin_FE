import axiosClient from '../api/axiosClient';

export const teacherService = {
    // Grading
    getPendingGrading: async () => {
        return await axiosClient.get('/teacher/grading/pending');
    },

    // BUG-03 FIX: Changed from /teacher/grading/${attemptId}/answers to /teacher/attempts/${attemptId}
    getGradingAnswers: async (attemptId) => {
        return await axiosClient.get(`/teacher/attempts/${attemptId}`);
    },

    // BUG-04 FIX: Changed endpoint and body format
    // Old: POST /teacher/grading/${attemptId}/submit with answers array
    // New: POST /teacher/grading/grade with { attemptId, examQuestionId, score, feedback }
    submitGrading: async (attemptId, examQuestionId, score, feedback) => {
        return await axiosClient.post('/teacher/grading/grade', {
            attemptId,
            examQuestionId,
            score,
            feedback
        });
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

    exportReports: async (params = {}) => {
        const { startDate, endDate, classId } = params;
        return await axiosClient.get('/teacher/reports/export', {
            params: { startDate, endDate, classId },
            responseType: 'blob'
        });
    },

    // Exam Management
    getExams: async (params) => {
        return await axiosClient.get('/teacher/exams', { params });
    },

    // Get exams by course ID (includes both published and draft)
    getExamsByCourse: async (courseId) => {
        return await axiosClient.get(`/teacher/courses/${courseId}/exams`);
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

    // Exam Approval - Get submitted exams with approval status
    getSubmittedExams: async () => {
        return await axiosClient.get('/teacher/exams/submitted');
    },

    getExamApproval: async (examId) => {
        return await axiosClient.get(`/teacher/exams/${examId}/approval`);
    },

    submitExamForApproval: async (examId) => {
        return await axiosClient.post(`/teacher/exams/${examId}/submit`);
    },

    getExamApprovalHistory: async (examId) => {
        return await axiosClient.get(`/teacher/exams/${examId}/approval-history`);
    },

    // ==================== NEW: Exam Generation & Question Methods ====================

    // Generate exam from TOPIK structure blueprint
    generateExamFromBlueprint: async (requestData) => {
        return await axiosClient.post('/teacher/exams/generate-blueprint', requestData);
    },

    // Get questions by course for Structure Builder
    getCourseQuestions: async (courseId) => {
        return await axiosClient.get(`/teacher/courses/${courseId}/questions`);
    },

    // Get questions by TOPIK type (R1, R2, L1, etc.)
    getQuestionsByTopikType: async (type, courseId) => {
        return await axiosClient.get(`/teacher/questions/topik-type/${type}`, {
            params: { courseId }
        });
    },

    // Search question by code
    searchQuestionByCode: async (code) => {
        return await axiosClient.get('/teacher/questions/search', {
            params: { code }
        });
    },


    // Course Management
    getAssignedCourses: async () => {
        return await axiosClient.get('/teacher/courses');
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

    getQuestionApprovalHistory: async (id) => {
        return await axiosClient.get(`/teacher/questions/${id}/approval-history`);
    },

    // Question Import
    importQuestions: async (file) => {
        // BUG-36 FIX: Removed teacherId parameter - BE gets it from Authentication
        const formData = new FormData();
        formData.append('file', file);
        return await axiosClient.post(`/teacher/questions/import`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    importQuestionsWord: async (file) => {
        // BUG-08, BUG-36 FIX: Removed teacherId parameter
        const formData = new FormData();
        formData.append('file', file);
        return await axiosClient.post(`/teacher/questions/import-word`, formData, {
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
    generateQuizVariants: async (examId) => {
        // BUG-09 FIX: Removed teacherId parameter - BE gets it from Authentication
        return await axiosClient.post(`/teacher/exams/${examId}/generate-variants`);
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
        // BUG-11 FIX: Changed from /teacher/classes/${classId}/students to /classes/${classId}/students
        return await axiosClient.get(`/classes/${classId}/students`);
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
    },

    // Question Categories
    getAllCategories: async () => {
        return await axiosClient.get('/teacher/categories');
    },

    createCategory: async (category) => {
        return await axiosClient.post('/teacher/categories', category);
    },

    // Get questions by course level
    getQuestionsByCourseLevel: async (courseLevel) => {
        return await axiosClient.get('/teacher/questions/by-course-level', {
            params: { courseLevel }
        });
    }
};

export default teacherService;
