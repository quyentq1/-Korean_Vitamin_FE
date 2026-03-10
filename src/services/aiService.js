import axiosClient from '../api/axiosClient';

/**
 * AI Service
 * Phase 2: AI Integration
 *
 * All AI-related API calls for writing, speaking, and improvement recommendations
 */

const aiService = {
    // ==================== WRITING ANALYSIS ====================

    /**
     * Analyze writing submission with AI
     * POST /api/ai/writing/analyze
     * @param {object} data - { content, submissionId }
     */
    analyzeWriting: async (data) => {
        return await axiosClient.post('/api/ai/writing/analyze', {
            content: data.content,
            submissionId: data.submissionId || null
        });
    },

    /**
     * Get detailed grammar analysis
     * POST /api/ai/writing/grammar
     */
    analyzeGrammar: async (content) => {
        return await axiosClient.post('/api/ai/writing/grammar', { content });
    },

    /**
     * Get vocabulary analysis and suggestions
     * POST /api/ai/writing/vocabulary
     */
    analyzeVocabulary: async (content) => {
        return await axiosClient.post('/api/ai/writing/vocabulary', { content });
    },

    /**
     * Check plagiarism
     * POST /api/ai/writing/plagiarism
     */
    checkPlagiarism: async (content) => {
        return await axiosClient.post('/api/ai/writing/plagiarism', { content });
    },

    /**
     * Get style and tone analysis
     * POST /api/ai/writing/style
     */
    analyzeStyle: async (content) => {
        return await axiosClient.post('/api/ai/writing/style', { content });
    },

    /**
     * Get structure analysis
     * POST /api/ai/writing/structure
     */
    analyzeStructure: async (content) => {
        return await axiosClient.post('/api/ai/writing/structure', { content });
    },

    /**
     * Get writing improvement suggestions
     * POST /api/ai/writing/suggestions
     */
    getWritingSuggestions: async (content) => {
        return await axiosClient.post('/api/ai/writing/suggestions', { content });
    },

    // ==================== SPEAKING ANALYSIS ====================

    /**
     * Analyze speaking submission with AI
     * POST /api/ai/speaking/analyze
     * @param {object} data - { audioUrl, submissionId }
     */
    analyzeSpeaking: async (data) => {
        return await axiosClient.post('/api/ai/speaking/analyze', {
            audioUrl: data.audioUrl,
            submissionId: data.submissionId || null
        });
    },

    /**
     * Analyze pronunciation
     * POST /api/ai/speaking/pronunciation
     */
    analyzePronunciation: async (audioUrl) => {
        return await axiosClient.post('/api/ai/speaking/pronunciation', { audioUrl });
    },

    /**
     * Analyze fluency
     * POST /api/ai/speaking/fluency
     */
    analyzeFluency: async (audioUrl) => {
        return await axiosClient.post('/api/ai/speaking/fluency', { audioUrl });
    },

    /**
     * Detect grammar in speech
     * POST /api/ai/speaking/grammar
     */
    detectSpeechGrammar: async (audioUrl) => {
        return await axiosClient.post('/api/ai/speaking/grammar', { audioUrl });
    },

    /**
     * Analyze vocabulary in speech
     * POST /api/ai/speaking/vocabulary
     */
    analyzeSpeechVocabulary: async (audioUrl) => {
        return await axiosClient.post('/api/ai/speaking/vocabulary', { audioUrl });
    },

    /**
     * Check audio quality
     * POST /api/ai/speaking/audio-quality
     */
    checkAudioQuality: async (audioUrl) => {
        return await axiosClient.post('/api/ai/speaking/audio-quality', { audioUrl });
    },

    /**
     * Get speaking improvement tips
     * POST /api/ai/speaking/tips
     */
    getSpeakingTips: async (audioUrl) => {
        return await axiosClient.post('/api/ai/speaking/tips', { audioUrl });
    },

    // ==================== IMPROVEMENT RECOMMENDATIONS ====================

    /**
     * Get personalized improvement tips
     * GET /api/ai/improvement-tips
     * @param {string} userId - User ID
     * @param {string} subject - Subject filter (optional)
     */
    getImprovementTips: async (userId, subject = 'all') => {
        return await axiosClient.get('/api/ai/improvement-tips', {
            params: { userId, subject }
        });
    },

    /**
     * Generate personalized study plan
     * POST /api/ai/study-plan/generate
     */
    generateStudyPlan: async (userId, goals, timeAvailable) => {
        return await axiosClient.post('/api/ai/study-plan/generate', {
            userId,
            goals,
            timeAvailable
        });
    },

    /**
     * Get recommended practice exercises
     * GET /api/ai/practice-exercises
     */
    getPracticeExercises: async (userId, weakAreas, level) => {
        return await axiosClient.get('/api/ai/practice-exercises', {
            params: { userId, weakAreas, level }
        });
    },

    /**
     * Get resource recommendations
     * GET /api/ai/resources
     */
    getResourceRecommendations: async (userId, subject, level) => {
        return await axiosClient.get('/api/ai/resources', {
            params: { userId, subject, level }
        });
    },

    /**
     * Get progress insights
     * GET /api/ai/progress-insights
     */
    getProgressInsights: async (userId) => {
        return await axiosClient.get('/api/ai/progress-insights', {
            params: { userId }
        });
    },

    // ==================== COURSE CONSULTATION (CHATBOT) ====================

    /**
     * Chat with AI for course consultation
     * POST /api/ai/chatbot/course-consultation
     */
    courseConsultation: async (message, context) => {
        return await axiosClient.post('/api/ai/chatbot/course-consultation', {
            message,
            context
        });
    },

    /**
     * Get course recommendations
     * POST /api/ai/recommendations/courses
     */
    getCourseRecommendations: async (userId, level, interests) => {
        return await axiosClient.post('/api/ai/recommendations/courses', {
            userId,
            level,
            interests
        });
    },

    /**
     * Answer FAQ questions
     * POST /api/ai/chatbot/faq
     */
    askFAQ: async (question) => {
        return await axiosClient.post('/api/ai/chatbot/faq', { question });
    },

    /**
     * Get study guidance
     * POST /api/ai/chatbot/study-guidance
     */
    getStudyGuidance: async (userId, query) => {
        return await axiosClient.post('/api/ai/chatbot/study-guidance', {
            userId,
            query
        });
    },

    // ==================== TEACHER AI ASSISTANCE ====================

    /**
     * Teacher: Request AI grading assistance for writing
     * POST /api/ai/teacher/writing-grade
     */
    assistWritingGrading: async (submissionId) => {
        return await axiosClient.post('/api/ai/teacher/writing-grade', {
            submissionId
        });
    },

    /**
     * Teacher: Request AI grading assistance for speaking
     * POST /api/ai/teacher/speaking-grade
     */
    assistSpeakingGrading: async (submissionId) => {
        return await axiosClient.post('/api/ai/teacher/speaking-grade', {
            submissionId
        });
    },

    /**
     * Teacher: Generate assignment rubric
     * POST /api/ai/teacher/generate-rubric
     */
    generateRubric: async (assignmentType, requirements) => {
        return await axiosClient.post('/api/ai/teacher/generate-rubric', {
            assignmentType,
            requirements
        });
    },

    /**
     * Teacher: Get feedback suggestions
     * POST /api/ai/teacher/feedback-suggestions
     */
    getFeedbackSuggestions: async (submissionId, score) => {
        return await axiosClient.post('/api/ai/teacher/feedback-suggestions', {
            submissionId,
            score
        });
    },

    /**
     * Teacher: Batch analyze submissions
     * POST /api/ai/teacher/batch-analyze
     */
    batchAnalyzeSubmissions: async (submissionIds) => {
        return await axiosClient.post('/api/ai/teacher/batch-analyze', {
            submissionIds
        });
    },

    // ==================== OCR & DOCUMENT PROCESSING ====================

    /**
     * OCR: Parse document image/PDF
     * POST /api/ai/ocr/parse
     */
    parseDocument: async (file, type) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type); // 'registration' or other
        return await axiosClient.post('/api/ai/ocr/parse', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /**
     * OCR: Get OCR history
     * GET /api/ai/ocr/history
     */
    getOCRHistory: async () => {
        return await axiosClient.get('/api/ai/ocr/history');
    },

    /**
     * OCR: Reprocess OCR result
     * POST /api/ai/ocr/reprocess
     */
    reprocessOCR: async (ocrId) => {
        return await axiosClient.post(`/api/ai/ocr/reprocess/${ocrId}`);
    },

    // ==================== ANALYTICS & INSIGHTS ====================

    /**
     * Get learner progress dashboard
     * GET /api/ai/analytics/learner-progress
     */
    getLearnerProgress: async (userId) => {
        return await axiosClient.get('/api/ai/analytics/learner-progress', {
            params: { userId }
        });
    },

    /**
     * Get performance predictions
     * GET /api/ai/analytics/predictions
     */
    getPredictions: async (userId) => {
        return await axiosClient.get('/api/ai/analytics/predictions', {
            params: { userId }
        });
    },

    /**
     * Get learning path recommendations
     * GET /api/ai/analytics/learning-path
     */
    getLearningPath: async (userId, goal) => {
        return await axiosClient.get('/api/ai/analytics/learning-path', {
            params: { userId, goal }
        });
    },

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Check AI service health
     * GET /api/ai/health
     */
    healthCheck: async () => {
        return await axiosClient.get('/api/ai/health');
    },

    /**
     * Get AI model version info
     * GET /api/ai/model-info
     */
    getModelInfo: async () => {
        return await axiosClient.get('/api/ai/model-info');
    },

    /**
     * Get AI usage statistics (for admin)
     * GET /api/ai/usage-stats
     */
    getUsageStats: async (startDate, endDate) => {
        return await axiosClient.get('/api/ai/usage-stats', {
            params: { startDate, endDate }
        });
    }
};

export default aiService;
