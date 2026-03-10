import axiosClient from '../api/axiosClient';

/**
 * Writing Submission Service
 * Phase 1: Critical Assignments
 *
 * API endpoints for writing assignment submissions
 */

const writingService = {
    /**
     * Get all writing assignments for current learner
     * GET /api/learner/writing-assignments
     */
    getWritingAssignments: async () => {
        return await axiosClient.get('/api/learner/writing-assignments');
    },

    /**
     * Get writing assignment details
     * GET /api/learner/writing-assignments/{id}
     */
    getWritingAssignment: async (id) => {
        return await axiosClient.get(`/api/learner/writing-assignments/${id}`);
    },

    /**
     * Submit writing assignment
     * POST /api/learner/writing-assignments/{id}/submit
     * @param {string} id - Assignment ID
     * @param {object} data - { title, content, file }
     */
    submitWritingAssignment: async (id, data) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('content', data.content);
        if (data.file) {
            formData.append('file', data.file);
        }
        return await axiosClient.post(`/api/learner/writing-assignments/${id}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /**
     * Get AI feedback for writing (real-time analysis before submission)
     * POST /api/learner/writing/analyze
     * @param {object} data - { title, content }
     */
    analyzeWithAI: async (data) => {
        return await axiosClient.post('/api/learner/writing/analyze', {
            title: data.title,
            content: data.content
        });
    },

    /**
     * Get submission history for an assignment
     * GET /api/learner/writing-assignments/{id}/submissions
     */
    getSubmissionHistory: async (id) => {
        return await axiosClient.get(`/api/learner/writing-assignments/${id}/submissions`);
    },

    /**
     * Get specific submission details
     * GET /api/learner/writing-submissions/{id}
     */
    getSubmission: async (id) => {
        return await axiosClient.get(`/api/learner/writing-submissions/${id}`);
    },

    /**
     * Get all writing submissions for current learner
     * GET /api/learner/writing-submissions
     */
    getAllSubmissions: async () => {
        return await axiosClient.get('/api/learner/writing-submissions');
    },

    /**
     * Download submission as PDF
     * GET /api/learner/writing-submissions/{id}/download
     */
    downloadSubmission: async (id) => {
        return await axiosClient.get(`/api/learner/writing-submissions/${id}/download`, {
            responseType: 'blob'
        });
    },

    // TEACHER METHODS

    /**
     * Teacher: Create writing assignment
     * POST /api/teacher/writing-assignments
     */
    createWritingAssignment: async (assignmentData) => {
        return await axiosClient.post('/api/teacher/writing-assignments', assignmentData);
    },

    /**
     * Teacher: Get all writing assignments
     * GET /api/teacher/writing-assignments
     */
    getTeacherWritingAssignments: async () => {
        return await axiosClient.get('/api/teacher/writing-assignments');
    },

    /**
     * Teacher: Update writing assignment
     * PUT /api/teacher/writing-assignments/{id}
     */
    updateWritingAssignment: async (id, assignmentData) => {
        return await axiosClient.put(`/api/teacher/writing-assignments/${id}`, assignmentData);
    },

    /**
     * Teacher: Delete writing assignment
     * DELETE /api/teacher/writing-assignments/{id}
     */
    deleteWritingAssignment: async (id) => {
        return await axiosClient.delete(`/api/teacher/writing-assignments/${id}`);
    },

    /**
     * Teacher: Get pending submissions (waiting for grading)
     * GET /api/teacher/writing-submissions/pending
     */
    getPendingSubmissions: async () => {
        return await axiosClient.get('/api/teacher/writing-submissions/pending');
    },

    /**
     * Teacher: Grade writing submission
     * POST /api/teacher/writing-submissions/{id}/grade
     * @param {string} id - Submission ID
     * @param {object} gradeData - { score, feedback, rubricScores }
     */
    gradeWritingSubmission: async (id, gradeData) => {
        return await axiosClient.post(`/api/teacher/writing-submissions/${id}/grade`, gradeData);
    },

    /**
     * Teacher: Request AI scoring for writing submission
     * POST /api/teacher/writing-submissions/{id}/ai-score
     */
    requestAIScoring: async (id) => {
        return await axiosClient.post(`/api/teacher/writing-submissions/${id}/ai-score`);
    },

    /**
     * Teacher: Get AI suggested grading with detailed feedback
     * POST /api/teacher/writing-submissions/{id}/ai-feedback
     */
    requestAIFeedback: async (id) => {
        return await axiosClient.post(`/api/teacher/writing-submissions/${id}/ai-feedback`);
    },

    /**
     * Teacher: Get submissions by assignment
     * GET /api/teacher/writing-assignments/{id}/submissions
     */
    getAssignmentSubmissions: async (id) => {
        return await axiosClient.get(`/api/teacher/writing-assignments/${id}/submissions`);
    },

    /**
     * Teacher: Bulk grade multiple submissions
     * POST /api/teacher/writing-submissions/bulk-grade
     */
    bulkGradeSubmissions: async (submissions) => {
        return await axiosClient.post('/api/teacher/writing-submissions/bulk-grade', {
            submissions
        });
    }
};

export default writingService;
