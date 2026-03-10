import axiosClient from '../api/axiosClient';

/**
 * Enrollment Service
 * Phase 5: Analytics
 *
 * API endpoints for enrollment analytics and management
 */

const enrollmentService = {
    /**
     * Get enrollment statistics
     * GET /api/analytics/enrollments
     */
    getEnrollmentStats: async (params) => {
        return await axiosClient.get('/api/analytics/enrollments', { params });
    },

    /**
     * Get enrollment by course
     * GET /api/analytics/enrollments/by-course
     */
    getEnrollmentsByCourse: async (courseId, period) => {
        return await axiosClient.get(`/api/analytics/enrollments/by-course/${courseId}`, {
            params: { period }
        });
    },

    /**
     * Get enrollment trend data
     * GET /api/analytics/enrollments/trend
     */
    getEnrollmentTrend: async (period, granularity) => {
        return await axiosClient.get('/api/analytics/enrollments/trend', {
            params: { period, granularity }
        });
    },

    /**
     * Get conversion funnel
     * GET /api/analytics/enrollments/funnel
     */
    getConversionFunnel: async (period) => {
        return await axiosClient.get('/api/analytics/enrollments/funnel', {
            params: { period }
        });
    },

    /**
     * Get recent registrations
     * GET /api/analytics/enrollments/recent
     */
    getRecentRegistrations: async (limit = 10) => {
        return await axiosClient.get('/api/analytics/enrollments/recent', {
            params: { limit }
        });
    },

    /**
     * Export enrollment data
     * GET /api/analytics/enrollments/export
     */
    exportEnrollments: async (params) => {
        return await axiosClient.get('/api/analytics/enrollments/export', {
            params,
            responseType: 'blob'
        });
    },

    /**
     * Get pending registrations count
     * GET /api/analytics/enrollments/pending-count
     */
    getPendingCount: async () => {
        return await axiosClient.get('/api/analytics/enrollments/pending-count');
    },

    // STAFF/ADMIN METHODS

    /**
     * Get all registrations (staff view)
     * GET /api/staff/registrations
     */
    getAllRegistrations: async (filters) => {
        return await axiosClient.get('/api/staff/registrations', {
            params: filters
        });
    },

    /**
     * Get registration details
     * GET /api/staff/registrations/{id}
     */
    getRegistrationDetails: async (id) => {
        return await axiosClient.get(`/api/staff/registrations/${id}`);
    },

    /**
     * Approve registration
     * PUT /api/staff/registrations/{id}/approve
     */
    approveRegistration: async (id) => {
        return await axiosClient.put(`/api/staff/registrations/${id}/approve`);
    },

    /**
     * Reject registration
     * PUT /api/staff/registrations/{id}/reject
     */
    rejectRegistration: async (id, reason) => {
        return await axiosClient.put(`/api/staff/registrations/${id}/reject`, { reason });
    },

    /**
     * Bulk approve registrations
     * POST /api/staff/registrations/bulk-approve
     */
    bulkApprove: async (registrationIds) => {
        return await axiosClient.post('/api/staff/registrations/bulk-approve', {
            registrationIds
        });
    },

    /**
     * Get registration statistics (for dashboard)
     * GET /api/staff/registrations/statistics
     */
    getRegistrationStatistics: async (period) => {
        return await axiosClient.get('/api/staff/registrations/statistics', {
            params: { period }
        });
    },

    /**
     * Search registrations
     * GET /api/staff/registrations/search
     */
    searchRegistrations: async (query, filters) => {
        return await axiosClient.get('/api/staff/registrations/search', {
            params: { query, ...filters }
        });
    },

    /**
     * Export registrations to Excel
     * GET /api/staff/registrations/export
     */
    exportRegistrations: async (filters) => {
        return await axiosClient.get('/api/staff/registrations/export', {
            params: filters,
            responseType: 'blob'
        });
    },

    /**
     * Get enrollment by source
     * GET /api/analytics/enrollments/by-source
     */
    getEnrollmentsBySource: async (period) => {
        return await axiosClient.get('/api/analytics/enrollments/by-source', {
            params: { period }
        });
    },

    /**
     * Get enrollment by status
     * GET /api/analytics/enrollments/by-status
     */
    getEnrollmentsByStatus: async (status, period) => {
        return await axiosClient.get('/api/analytics/enrollments/by-status', {
            params: { status, period }
        });
    },

    /**
     * Get daily enrollment counts
     * GET /api/analytics/enrollments/daily
     */
    getDailyEnrollments: async (startDate, endDate) => {
        return await axiosClient.get('/api/analytics/enrollments/daily', {
            params: { startDate, endDate }
        });
    },

    /**
     * Get monthly enrollment counts
     * GET /api/analytics/enrollments/monthly
     */
    getMonthlyEnrollments: async (year) => {
        return await axiosClient.get('/api/analytics/enrollments/monthly', {
            params: { year }
        });
    }
};

export default enrollmentService;
