import axiosClient from '../api/axiosClient';

/**
 * Student Service
 * API calls for student-related functionality
 */
export const studentService = {
    // Get writing submissions
    getWritingSubmissions: async () => {
        try {
            const response = await axiosClient.get('/api/student/writing-submissions');
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

            const response = await axiosClient.post('/api/student/writing-submissions', formData, {
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
            const response = await axiosClient.get('/api/student/dashboard');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    },

    // Get student courses
    getCourses: async () => {
        try {
            const response = await axiosClient.get('/api/student/courses');
            return response.data;
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    },

    // Get student tests
    getTests: async () => {
        try {
            const response = await axiosClient.get('/api/student/tests');
            return response.data;
        } catch (error) {
            console.error('Error fetching tests:', error);
            throw error;
        }
    },

    // ==================== REPORTS & FEEDBACK ====================

    /**
     * Create a student report/feedback
     * POST /api/student/reports
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
     * GET /api/student/reports
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
     * GET /api/student/my-classes
     */
    getMyClasses: async () => {
        try {
            return await axiosClient.get('/student/my-classes');
        } catch (error) {
            console.error('Error fetching my classes:', error);
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
    }
};

export default studentService;
