/**
 * Admin Service - API calls for Admin functionality
 * Senior-level implementation with proper error handling
 */

import axiosClient from '../api/axiosClient';

/**
 * Admin Service - All admin-related API calls
 */
export const adminService = {
  // ==================== DASHBOARD ====================

  /**
   * Get dashboard statistics
   * GET /api/admin/dashboard/stats
   *
   * Returns: {
   *   totalUsers: number,
   *   totalStudents: number,
   *   totalTeachers: number,
   *   totalCourses: number,
   *   totalExams: number,
   *   publishedExams: number,
   *   pendingApprovals: number,
   *   activeUsers: number,
   *   newUsersThisMonth: number,
   *   revenue: number
   * }
   */
  getDashboardStats: async () => {
    return await axiosClient.get('/admin/dashboard/stats');
  },

  // ==================== TEACHERS MANAGEMENT ====================

  /**
   * Get all teachers with detailed information
   * GET /api/admin/teachers
   *
   * Returns: Array of teachers with assignedCourses count
   */
  getTeachers: async () => {
    return await axiosClient.get('/admin/teachers');
  },

  /**
   * Get teacher details by ID
   * GET /api/admin/teachers/{id}
   *
   * Returns: Teacher object with assigned courses
   */
  getTeacherDetails: async (id) => {
    return await axiosClient.get(`/admin/teachers/${id}`);
  },

  /**
   * Create a new teacher
   * POST /api/admin/users (with role=TEACHER)
   */
  createTeacher: async (teacherData) => {
    return await axiosClient.post('/admin/users', {
      ...teacherData,
      role: 'TEACHER'
    });
  },

  /**
   * Update teacher information
   * PUT /api/admin/users/{id}
   */
  updateTeacher: async (id, teacherData) => {
    return await axiosClient.put(`/admin/users/${id}`, teacherData);
  },

  /**
   * Delete teacher
   * DELETE /api/admin/users/{id}
   */
  deleteTeacher: async (id) => {
    return await axiosClient.delete(`/admin/users/${id}`);
  },

  // ==================== APPROVALS MANAGEMENT ====================

  /**
   * Get all approvals with optional status filter
   * GET /api/admin/approvals?status={status}
   *
   * Query params:
   * - status: 'pending' | 'approved' | 'rejected' | 'all'
   *
   * Returns: {
   *   examApprovals: [...],
   *   total: number
   * }
   */
  getApprovals: async (status = null) => {
    const params = status ? { status } : {};
    return await axiosClient.get('/admin/approvals', { params });
  },

  /**
   * Get pending approvals count
   * GET /api/admin/approvals/pending/count
   *
   * Returns: { count: number }
   */
  getPendingApprovalsCount: async () => {
    return await axiosClient.get('/admin/approvals/pending/count');
  },

  /**
   * Get pending approvals only
   * Convenience method
   */
  getPendingApprovals: async () => {
    return await axiosClient.get('/admin/approvals?status=pending');
  },

  /**
   * Approve an exam
   * POST /api/admin/approvals/exams/{id}/approve
   *
   * Body: { feedback: string }
   */
  approveExam: async (id, feedback = 'Approved by Admin') => {
    return await axiosClient.post(`/admin/approvals/exams/${id}/approve`, {
      feedback
    });
  },

  /**
   * Reject an exam
   * POST /api/admin/approvals/exams/{id}/reject
   *
   * Body: { feedback: string }
   */
  rejectExam: async (id, feedback = 'Rejected by Admin') => {
    return await axiosClient.post(`/admin/approvals/exams/${id}/reject`, {
      feedback
    });
  },

  /**
   * Bulk approve exams
   * POST /api/admin/approvals/exams/bulk-approve
   *
   * Body: { examIds: number[], feedback: string }
   */
  bulkApproveExams: async (examIds, feedback = 'Bulk approved') => {
    const promises = examIds.map(id =>
      axiosClient.post(`/admin/approvals/exams/${id}/approve`, { feedback })
    );
    return await Promise.all(promises);
  },

  /**
   * Bulk reject exams
   * POST /api/admin/approvals/exams/bulk-reject
   *
   * Body: { examIds: number[], feedback: string }
   */
  bulkRejectExams: async (examIds, feedback = 'Bulk rejected') => {
    const promises = examIds.map(id =>
      axiosClient.post(`/admin/approvals/exams/${id}/reject`, { feedback })
    );
    return await Promise.all(promises);
  },

  // ==================== REPORTS ====================

  /**
   * Get system reports summary
   * GET /api/admin/reports/summary
   *
   * Query params:
   * - startDate: string (ISO date)
   * - endDate: string (ISO date)
   *
   * Returns: Summary statistics
   */
  getReportsSummary: async (params = {}) => {
    return await axiosClient.get('/admin/reports/summary', { params });
  },

  /**
   * Get user activity report
   * GET /api/admin/reports/user-activity
   *
   * Returns: Array of user activity data
   */
  getUserActivityReport: async () => {
    return await axiosClient.get('/admin/reports/user-activity');
  },

  /**
   * Get exam performance report
   * GET /api/admin/reports/exam-performance
   *
   * Query params:
   * - startDate: string
   * - endDate: string
   * - courseId: number (optional)
   */
  getExamPerformanceReport: async (params = {}) => {
    return await axiosClient.get('/admin/reports/exam-performance', { params });
  },

  /**
   * Get course completion report
   * GET /api/admin/reports/course-completion
   */
  getCourseCompletionReport: async (params = {}) => {
    return await axiosClient.get('/admin/reports/course-completion', { params });
  },

  /**
   * Export report to PDF
   * GET /api/admin/reports/export/pdf
   *
   * Query params:
   * - reportType: 'user-activity' | 'exam-performance' | 'course-completion'
   * - startDate: string
   * - endDate: string
   *
   * Returns: PDF file blob
   */
  exportReportToPDF: async (reportType, params = {}) => {
    return await axiosClient.get('/admin/reports/export/pdf', {
      params: { reportType, ...params },
      responseType: 'blob'
    });
  },

  /**
   * Export report to Excel
   * GET /api/admin/reports/export/excel
   *
   * Returns: Excel file blob
   */
  exportReportToExcel: async (reportType, params = {}) => {
    return await axiosClient.get('/admin/reports/export/excel', {
      params: { reportType, ...params },
      responseType: 'blob'
    });
  },

  // ==================== STATISTICS & ANALYTICS ====================

  /**
   * Get user statistics
   * GET /api/admin/statistics/users
   *
   * Returns: {
   *   byRole: { students: number, teachers: number, ... },
   *   total: number,
   *   active: number,
   *   inactive: number
   * }
   */
  getUserStatistics: async () => {
    return await axiosClient.get('/admin/statistics/users');
  },

  /**
   * Get exam statistics
   * GET /api/admin/statistics/exams
   *
   * Returns: {
   *   total: number,
   *   published: number,
   *   unpublished: number,
   *   byCategory: { MOCK: number, PRACTICE: number }
   * }
   */
  getExamStatistics: async () => {
    return await axiosClient.get('/admin/statistics/exams');
  },

  /**
   * Get course statistics
   * GET /api/admin/statistics/courses
   */
  getCourseStatistics: async () => {
    return await axiosClient.get('/admin/statistics/courses');
  },

  /**
   * Get revenue statistics
   * GET /api/admin/statistics/revenue
   *
   * Query params:
   * - startDate: string
   * - endDate: string
   * - groupBy: 'day' | 'week' | 'month'
   */
  getRevenueStatistics: async (params = {}) => {
    return await axiosClient.get('/admin/statistics/revenue', { params });
  },

  /**
   * Get growth metrics
   * GET /api/admin/growth/metrics
   *
   * Query params:
   * - days: number (default: 30)
   *
   * Returns: {
   *   newUsers: number,
   *   userGrowthRate: number,
   *   newExams: number,
   *   newCourses: number
   * }
   */
  getGrowthMetrics: async (days = 30) => {
    return await axiosClient.get('/admin/growth/metrics', {
      params: { days }
    });
  },

  /**
   * Get user growth chart data
   * GET /api/admin/growth/users
   *
   * Query params:
   * - days: number
   *
   * Returns: Array of { date: string, count: number }
   */
  getUserGrowthData: async (days = 30) => {
    return await axiosClient.get('/admin/growth/users', {
      params: { days }
    });
  },

  /**
   * Get revenue growth chart data
   * GET /api/admin/growth/revenue
   *
   * Query params:
   * - days: number
   * - groupBy: 'day' | 'week' | 'month'
   */
  getRevenueGrowthData: async (days = 30, groupBy = 'day') => {
    return await axiosClient.get('/admin/growth/revenue', {
      params: { days, groupBy }
    });
  },

  /**
   * Get course enrollment trends
   * GET /api/admin/growth/enrollments
   *
   * Query params:
   * - days: number
   * - courseId: number (optional)
   */
  getEnrollmentTrends: async (days = 30, courseId = null) => {
    return await axiosClient.get('/admin/growth/enrollments', {
      params: { days, courseId }
    });
  },

  // ==================== NEW STATISTICS ENDPOINTS ====================

  /**
   * Get platform overview statistics
   * GET /api/admin/stats/platform
   */
  getPlatformStats: async () => {
    return await axiosClient.get('/admin/stats/platform');
  },

  /**
   * Get course statistics
   * GET /api/admin/stats/courses
   */
  getCourseStats: async (startDate, endDate) => {
    return await axiosClient.get('/admin/stats/courses', {
      params: { startDate, endDate }
    });
  },

  /**
   * Get exam statistics
   * GET /api/admin/stats/exams
   */
  getExamStats: async (startDate, endDate) => {
    return await axiosClient.get('/admin/stats/exams', {
      params: { startDate, endDate }
    });
  },

  /**
   * Get class statistics
   * GET /api/admin/stats/classes
   */
  getClassStats: async (startDate, endDate) => {
    return await axiosClient.get('/admin/stats/classes', {
      params: { startDate, endDate }
    });
  },

  /**
   * Get user trend data for charts
   * GET /api/admin/stats/users-trend
   */
  getUserTrend: async (days = 30) => {
    return await axiosClient.get('/admin/stats/users-trend', {
      params: { days }
    });
  },

  /**
   * Get exam trend data for charts
   * GET /api/admin/stats/exam-trend
   */
  getExamTrend: async (days = 30) => {
    return await axiosClient.get('/admin/stats/exam-trend', {
      params: { days }
    });
  },

  /**
   * Compare two time periods
   * GET /api/admin/stats/compare
   */
  compareTimePeriods: async (period1Start, period1End, period2Start, period2End) => {
    return await axiosClient.get('/admin/stats/compare', {
      params: {
        period1Start,
        period1End,
        period2Start,
        period2End
      }
    });
  },

  // ==================== USERS MANAGEMENT (Enhanced) ====================

  /**
   * Get all users with pagination and filtering
   * GET /api/admin/users
   */
  getUsers: async (params = {}) => {
    const { page = 0, size = 10, role, status, search } = params;
    return await axiosClient.get('/admin/users', {
      params: { page, size, role, status, search }
    });
  },

  /**
   * Get user by ID
   * GET /api/admin/users/{id}
   */
  getUserById: async (id) => {
    return await axiosClient.get(`/admin/users/${id}`);
  },

  /**
   * Create new user
   * POST /api/admin/users
   */
  createUser: async (userData) => {
    return await axiosClient.post('/admin/users', userData);
  },

  /**
   * Update user
   * PUT /api/admin/users/{id}
   */
  updateUser: async (id, userData) => {
    return await axiosClient.put(`/admin/users/${id}`, userData);
  },

  /**
   * Delete user
   * DELETE /api/admin/users/{id}
   */
  deleteUser: async (id) => {
    return await axiosClient.delete(`/admin/users/${id}`);
  },

  /**
   * Toggle user active status
   * PATCH /api/admin/users/{id}/toggle-status
   */
  toggleUserStatus: async (id) => {
    return await axiosClient.patch(`/admin/users/${id}/toggle-status`);
  },

  /**
   * Change user role
   * PATCH /api/admin/users/{id}/role
   */
  changeUserRole: async (id, role) => {
    return await axiosClient.patch(`/admin/users/${id}/role`, { role });
  },

  /**
   * Lock user account
   * POST /api/admin/users/{id}/lock
   */
  lockUser: async (id, reason, adminId) => {
    return await axiosClient.post(`/admin/users/${id}/lock`, { reason, adminId });
  },

  /**
   * Unlock user account
   * POST /api/admin/users/{id}/unlock
   */
  unlockUser: async (id) => {
    return await axiosClient.post(`/admin/users/${id}/unlock`);
  },

  /**
   * Reset user password
   * PATCH /api/admin/users/{id}/reset-password
   */
  resetPassword: async (id, newPassword) => {
    return await axiosClient.patch(`/admin/users/${id}/reset-password`, { newPassword });
  },

  /**
   * Upload user avatar
   * POST /api/admin/users/upload-avatar
   */
  uploadUserAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await axiosClient.post('/admin/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error uploading user avatar:', error);
      throw error;
    }
  },

  // ==================== ADVANCED ANALYTICS ====================

  /**
   * Get exam intelligence - detailed exam analytics
   * GET /api/admin/analytics/exam-intelligence
   */
  getExamIntelligence: async (startDate, endDate) => {
    return await axiosClient.get('/admin/analytics/exam-intelligence', {
      params: { startDate, endDate }
    });
  },

  /**
   * Get comparative analytics for period-over-period comparison
   * GET /api/admin/analytics/comparative
   */
  getComparativeAnalytics: async (periodStart, periodEnd) => {
    return await axiosClient.get('/admin/analytics/comparative', {
      params: { periodStart, periodEnd }
    });
  },

  /**
   * Get user segmentation analytics
   * GET /api/admin/analytics/user-segments
   */
  getUserSegments: async () => {
    return await axiosClient.get('/admin/analytics/user-segments');
  },

  /**
   * Get content performance analytics
   * GET /api/admin/analytics/content-performance
   */
  getContentPerformance: async () => {
    return await axiosClient.get('/admin/analytics/content-performance');
  },

  /**
   * Get cohort analysis
   * GET /api/admin/analytics/cohort
   */
  getCohortAnalysis: async () => {
    return await axiosClient.get('/admin/analytics/cohort');
  },

  /**
   * Get churn risk analysis
   * GET /api/admin/analytics/churn-risk
   */
  getChurnRisk: async () => {
    return await axiosClient.get('/admin/analytics/churn-risk');
  },

  /**
   * Export analytics report
   * POST /api/admin/analytics/export
   */
  exportAnalytics: async (exportData) => {
    return await axiosClient.post('/admin/analytics/export', exportData);
  },

  // ==================== EXAMS MANAGEMENT (Re-export from examService) ====================

  /**
   * These methods are delegated to examService
   * Import them from examService.js instead
   */
  // getAllExams: async () => examService.getAllExams(),
  // getExamById: async (id) => examService.getExamById(id),
  // createExam: async (exam) => examService.createExam(exam),
  // updateExam: async (id, exam) => examService.updateExam(id, exam),
  // deleteExam: async (id) => examService.deleteExam(id),
  // publishExam: async (id, published) => examService.publishExam(id, published),

  // ==================== HELPER METHODS ====================

  /**
   * Handle API errors consistently
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default error message
   * @throws {Error} - Rethrown with additional context
   */
  handleError: (error, defaultMessage = 'An error occurred') => {
    console.error('AdminService Error:', error);

    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || defaultMessage;
      const status = error.response.status;
      throw new Error(`${message} (Status: ${status})`);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error - Unable to reach server');
    } else {
      // Error in request configuration
      throw new Error(error.message || defaultMessage);
    }
  },

  /**
   * Transform API response data
   * Useful for normalizing data from backend
   */
  transformResponse: (response) => {
    return response.data;
  }
};

export default adminService;
