import axiosClient from '../api/axiosClient';

/**
 * Speaking Submission Service
 * Phase 1: Critical Assignments
 *
 * API endpoints for speaking assignment submissions
 */

const speakingService = {
    /**
     * Get all speaking assignments for current learner
     * GET /api/learner/speaking-assignments
     */
    getSpeakingAssignments: async () => {
        return await axiosClient.get('/api/learner/speaking-assignments');
    },

    /**
     * Get speaking assignment details
     * GET /api/learner/speaking-assignments/{id}
     */
    getSpeakingAssignment: async (id) => {
        return await axiosClient.get(`/api/learner/speaking-assignments/${id}`);
    },

    /**
     * Submit speaking assignment with audio files
     * POST /api/learner/speaking-assignments/{id}/submit
     * @param {string} id - Assignment ID
     * @param {FormData} formData - FormData with recordings and audioFile
     */
    submitSpeakingAssignment: async (id, formData) => {
        return await axiosClient.post(`/api/learner/speaking-assignments/${id}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /**
     * Get submission history for an assignment
     * GET /api/learner/speaking-assignments/{id}/submissions
     */
    getSubmissionHistory: async (id) => {
        return await axiosClient.get(`/api/learner/speaking-assignments/${id}/submissions`);
    },

    /**
     * Get specific submission details
     * GET /api/learner/speaking-submissions/{id}
     */
    getSubmission: async (id) => {
        return await axiosClient.get(`/api/learner/speaking-submissions/${id}`);
    },

    /**
     * Get all speaking submissions for current learner
     * GET /api/learner/speaking-submissions
     */
    getAllSubmissions: async () => {
        return await axiosClient.get('/api/learner/speaking-submissions');
    },

    // TEACHER METHODS

    /**
     * Teacher: Create speaking assignment
     * POST /api/teacher/speaking-assignments
     */
    createSpeakingAssignment: async (assignmentData) => {
        return await axiosClient.post('/api/teacher/speaking-assignments', assignmentData);
    },

    /**
     * Teacher: Get all speaking assignments
     * GET /api/teacher/speaking-assignments
     */
    getTeacherSpeakingAssignments: async () => {
        return await axiosClient.get('/api/teacher/speaking-assignments');
    },

    /**
     * Teacher: Update speaking assignment
     * PUT /api/teacher/speaking-assignments/{id}
     */
    updateSpeakingAssignment: async (id, assignmentData) => {
        return await axiosClient.put(`/api/teacher/speaking-assignments/${id}`, assignmentData);
    },

    /**
     * Teacher: Delete speaking assignment
     * DELETE /api/teacher/speaking-assignments/{id}
     */
    deleteSpeakingAssignment: async (id) => {
        return await axiosClient.delete(`/api/teacher/speaking-assignments/${id}`);
    },

    /**
     * Teacher: Get pending submissions (waiting for grading)
     * GET /api/teacher/speaking-submissions/pending
     */
    getPendingSubmissions: async () => {
        return await axiosClient.get('/api/teacher/speaking-submissions/pending');
    },

    /**
     * Teacher: Grade speaking submission with AI assistance
     * POST /api/teacher/speaking-submissions/{id}/grade
     */
    gradeSpeakingSubmission: async (id, gradeData) => {
        return await axiosClient.post(`/api/teacher/speaking-submissions/${id}/grade`, gradeData);
    },

    /**
     * Teacher: Request AI scoring for speaking submission
     * POST /api/teacher/speaking-submissions/{id}/ai-score
     */
    requestAIScoring: async (id) => {
        return await axiosClient.post(`/api/teacher/speaking-submissions/${id}/ai-score`);
    },

    /**
     * Teacher: Get submissions by assignment
     * GET /api/teacher/speaking-assignments/{id}/submissions
     */
    getAssignmentSubmissions: async (id) => {
        return await axiosClient.get(`/api/teacher/speaking-assignments/${id}/submissions`);
    }
};

export default speakingService;
