import axiosClient from '../api/axiosClient';

/**
 * Student Service
 * API calls for student-related functionality
 */
export const studentService = {
    // Get writing submissions
    getWritingSubmissions: async () => {
        try {
            const response = await axiosClient.get('/student/writing-submissions');
            return response.data;
        } catch (error) {
            console.error('Error fetching writing submissions:', error);
            throw error;
        }
    },

    // Submit writing assignment
    submitWriting: async (data) => {
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('content', data.content);
            if (data.file) {
                formData.append('file', data.file);
            }

            const response = await axiosClient.post('/student/writing-submissions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error submitting writing:', error);
            throw error;
        }
    },

    // Get student dashboard data
    getDashboardData: async () => {
        try {
            const response = await axiosClient.get('/student/dashboard');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    },

    // Get student courses
    getCourses: async () => {
        try {
            const response = await axiosClient.get('/student/courses');
            return response.data;
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    },

    // Get student tests
    getTests: async () => {
        try {
            const response = await axiosClient.get('/student/tests');
            return response.data;
        } catch (error) {
            console.error('Error fetching tests:', error);
            throw error;
        }
    },

    // ==================== REPORTS & FEEDBACK ====================

    /**
     * Create a student report/feedback
     * POST /student/reports
     */
    createStudentReport: async (reportData) => {
        try {
            return await axiosClient.post('/student/reports', reportData);
        } catch (error) {
            console.error('Error creating student report:', error);
            throw error;
        }
    },

    /**
     * Get all reports submitted by current student
     * GET /student/reports
     */
    getMyReports: async () => {
        try {
            return await axiosClient.get('/student/reports');
        } catch (error) {
            console.error('Error fetching my reports:', error);
            throw error;
        }
    },

    // ==================== CLASSES ====================

    /**
     * Get student's classes
     * GET /student/my-classes
     */
    getMyClasses: async () => {
        try {
            return await axiosClient.get('/student/my-classes');
        } catch (error) {
            console.error('Error fetching my classes:', error);
            throw error;
        }
    },

    /**
     * Get class details for student
     * GET /student/classes/{classId}
     */
    getClassDetails: async (classId) => {
        try {
            return await axiosClient.get(`/student/classes/${classId}`);
        } catch (error) {
            console.error('Error fetching class details:', error);
            throw error;
        }
    },

    /**
     * Get exams for a specific class (student endpoint)
     * GET /student/classes/{classId}/exams
     */
    getClassExams: async (classId) => {
        try {
            return await axiosClient.get(`/student/classes/${classId}/exams`);
        } catch (error) {
            console.error('Error fetching class exams:', error);
            throw error;
        }
    },

    // ==================== STAFF ====================

    /**
     * Get all staff (teachers and staff members)
     * This would typically be from a public endpoint
     */
    getStaff: async () => {
        try {
            // Try to get from public endpoint
            return await axiosClient.get('/public/users/staff');
        } catch (error) {
            console.error('Error fetching staff:', error);
            // Return empty array if endpoint doesn't exist yet
            return { data: [] };
        }
    },

    // ==================== DASHBOARD METHODS ====================

    // BUG-STU-01 FIX: Added getExamResults method
    getExamResults: async () => {
        try {
            const response = await axiosClient.get('/student/results');
            return {
                results: response.data,
                studyHours: 0,
                classesAttended: 0
            };
        } catch (error) {
            console.error('Error fetching exam results:', error);
            throw error;
        }
    },

    // BUG-STU-01 FIX: Added getLearningProgress method
    getLearningProgress: async () => {
        try {
            const data = await axiosClient.get('/student/enrollments');
            // Check if data exists and is an array
            // Note: axiosClient already returns response.data directly
            if (!data || !Array.isArray(data)) {
                console.warn('Learning progress data is not an array:', data);
                return [];
            }
            // Transform enrollments to progress format
            return data.map(enrollment => ({
                courseId: enrollment.courseId,
                courseName: enrollment.courseName,
                progress: enrollment.progress || 0,
                status: enrollment.status
            }));
        } catch (error) {
            console.error('Error fetching learning progress:', error);
            // Return empty array on error instead of throwing
            return [];
        }
    },

    // BUG-STU-01 FIX: Added getUpcomingClasses method
    getUpcomingClasses: async () => {
        try {
            const data = await axiosClient.get('/student/my-classes');
            // Check if data exists and is an array
            // Note: axiosClient already returns response.data directly
            if (!data || !Array.isArray(data)) {
                console.warn('Upcoming classes data is not an array:', data);
                return [];
            }
            // Filter for upcoming classes and return formatted data
            return data.map(classStudent => ({
                id: classStudent.classId,
                className: classStudent.className,
                schedule: classStudent.schedule,
                teacher: classStudent.teacher,
                startTime: classStudent.startTime
            }));
        } catch (error) {
            console.error('Error fetching upcoming classes:', error);
            return [];
        }
    },

    // ==================== EXAMS ====================

    /**
     * Get all exams with optional filter
     * GET /student/exams?filter=ALL|AVAILABLE|COMPLETED|MISSED
     */
    getExams: async (filter = 'ALL') => {
        return await axiosClient.get(`/student/exams?filter=${filter}`);
    },

    /**
     * Get exam detail
     * GET /student/exams/{id}
     */
    getExamDetail: async (examId) => {
        return await axiosClient.get(`/student/exams/${examId}`);
    },

    /**
     * Start an exam
     * POST /student/exams/{id}/start
     */
    startExam: async (examId) => {
        return await axiosClient.post(`/student/exams/${examId}/start`);
    },

    /**
     * Submit exam answers
     * POST /student/exams/{id}/submit
     */
    submitExam: async (examId, answers) => {
        return await axiosClient.post(`/student/exams/${examId}/submit`, { answers });
    },

    // ==================== RESULTS ====================

    /**
     * Get all exam results
     * GET /student/results
     */
    getResults: async () => {
        return await axiosClient.get('/student/results');
    },

    /**
     * Get result detail
     * GET /student/results/{id}
     */
    getResultDetail: async (resultId) => {
        return await axiosClient.get(`/student/results/${resultId}`);
    },

    // ==================== PROFILE ====================

    /**
     * Get student profile
     * GET /student/profile
     */
    getProfile: async () => {
        return await axiosClient.get('/student/profile');
    },

    /**
     * Update student profile
     * PUT /student/profile
     */
    updateProfile: async (data) => {
        return await axiosClient.put('/student/profile', data);
    },

    /**
     * Change password
     * POST /student/change-password
     */
    changePassword: async (data) => {
        return await axiosClient.post('/student/change-password', data);
    }
};

export default studentService;
