import axiosClient from '../api/axiosClient';

const teacherService = {
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
    getClassReports: async () => {
        return await axiosClient.get('/api/teacher/reports/classes');
    },

    getTopStudents: async () => {
        return await axiosClient.get('/api/teacher/reports/top-students');
    },

    // Question Import
    importQuestions: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        return await axiosClient.post('/api/teacher/questions/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default teacherService;
