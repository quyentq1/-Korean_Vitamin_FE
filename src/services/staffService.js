import axiosClient from '../api/axiosClient';

/**
 * Staff Service
 * API calls for Staff management operations
 */
export const staffService = {
    // ==================== DASHBOARD ====================

    /**
     * Get dashboard statistics
     * GET /api/staff/dashboard/stats
     */
    getDashboardStats: async () => {
        try {
            return await axiosClient.get('/staff/dashboard/stats');
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // ==================== STUDENT MANAGEMENT ====================

    /**
     * Get students list with pagination and filters
     * GET /api/staff/students?page=0&size=10&search=keyword&status=active
     */
    getStudents: async (params = {}) => {
        try {
            const { page = 0, size = 10, search = '', status = '' } = params;
            return await axiosClient.get('/staff/students', {
                params: { page, size, search, status }
            });
        } catch (error) {
            console.error('Error fetching students:', error);
            throw error;
        }
    },

    /**
     * Get student details by ID
     * GET /api/staff/students/{id}
     */
    getStudentDetails: async (studentId) => {
        try {
            return await axiosClient.get(`/staff/students/${studentId}`);
        } catch (error) {
            console.error('Error fetching student details:', error);
            throw error;
        }
    },

    /**
     * Create student account manually
     * POST /api/staff/students/manual
     */
    createManualStudent: async (studentData) => {
        try {
            return await axiosClient.post('/staff/students/manual', studentData);
        } catch (error) {
            console.error('Error creating manual student:', error);
            throw error;
        }
    },

    /**
     * Update student information
     * PUT /api/staff/students/{id}
     */
    updateStudent: async (studentId, studentData) => {
        try {
            return await axiosClient.put(`/staff/students/${studentId}`, studentData);
        } catch (error) {
            console.error('Error updating student:', error);
            throw error;
        }
    },

    /**
     * Activate/Deactivate student
     * PATCH /api/staff/students/{id}/status
     */
    updateStudentStatus: async (studentId, isActive) => {
        try {
            return await axiosClient.patch(`/staff/students/${studentId}/status`, { isActive });
        } catch (error) {
            console.error('Error updating student status:', error);
            throw error;
        }
    },

    // ==================== OCR STUDENT CREATION ====================

    /**
     * Upload image for OCR processing
     * POST /api/staff/students/ocr/upload
     */
    uploadOCRImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            return await axiosClient.post('/staff/students/ocr/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Error uploading OCR image:', error);
            throw error;
        }
    },

    /**
     * Create student from OCR data
     * POST /api/staff/students/ocr/process
     */
    createStudentFromOCR: async (ocrData) => {
        try {
            return await axiosClient.post('/staff/students/ocr/process', ocrData);
        } catch (error) {
            console.error('Error creating student from OCR:', error);
            throw error;
        }
    },

    /**
     * Batch create students from OCR
     * POST /api/staff/students/ocr/batch
     */
    batchCreateStudents: async (files) => {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            return await axiosClient.post('/staff/students/ocr/batch', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Error batch creating students:', error);
            throw error;
        }
    },

    // ==================== CLASS MANAGEMENT ====================

    /**
     * Get all classes
     * GET /api/staff/classes
     */
    getClasses: async (params = {}) => {
        try {
            return await axiosClient.get('/staff/classes', { params });
        } catch (error) {
            console.error('Error fetching classes:', error);
            throw error;
        }
    },

    /**
     * Get class details
     * GET /api/staff/classes/{id}
     */
    getClassDetails: async (classId) => {
        try {
            return await axiosClient.get(`/staff/classes/${classId}`);
        } catch (error) {
            console.error('Error fetching class details:', error);
            throw error;
        }
    },

    /**
     * Get students in a class
     * GET /api/staff/classes/{id}/students
     */
    getClassStudents: async (classId) => {
        try {
            return await axiosClient.get(`/staff/classes/${classId}/students`);
        } catch (error) {
            console.error('Error fetching class students:', error);
            throw error;
        }
    },

    /**
     * Add student to class
     * POST /api/staff/classes/{id}/students
     * Body: { studentId: number, enrollmentDate?: string, notes?: string }
     */
    addStudentToClass: async (classId, requestData) => {
        try {
            return await axiosClient.post(`/staff/classes/${classId}/students`, requestData);
        } catch (error) {
            console.error('Error adding student to class:', error);
            throw error;
        }
    },

    /**
     * Remove student from class
     * DELETE /api/staff/classes/{id}/students/{studentId}
     */
    removeStudentFromClass: async (classId, studentId) => {
        try {
            return await axiosClient.delete(`/staff/classes/${classId}/students/${studentId}`);
        } catch (error) {
            console.error('Error removing student from class:', error);
            throw error;
        }
    },

    /**
     * Assign teacher to class
     * POST /api/classes/{id}/teachers?isPrimary={boolean}
     * Body: teacherId (number)
     */
    assignTeacherToClass: async (classId, teacherId, isPrimary = false) => {
        try {
            return await axiosClient.post(`/classes/${classId}/teachers?isPrimary=${isPrimary}`, teacherId, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error assigning teacher to class:', error);
            throw error;
        }
    },

    /**
     * Get teachers in a class
     * GET /api/classes/{id}/teachers
     */
    getClassTeachers: async (classId) => {
        try {
            return await axiosClient.get(`/classes/${classId}/teachers`);
        } catch (error) {
            console.error('Error fetching class teachers:', error);
            throw error;
        }
    },

    // ==================== ATTENDANCE ====================

    /**
     * Get attendance records for a schedule
     * GET /api/staff/schedules/{scheduleId}/attendance
     */
    getAttendanceForSchedule: async (scheduleId) => {
        try {
            return await axiosClient.get(`/staff/schedules/${scheduleId}/attendance`);
        } catch (error) {
            console.error('Error fetching attendance for schedule:', error);
            throw error;
        }
    },

    /**
     * Mark attendance for students
     * POST /api/staff/attendance/mark
     * Body: { scheduleId: number, attendanceRecords: [{ studentId, status, notes }] }
     */
    markAttendance: async (attendanceData) => {
        try {
            return await axiosClient.post('/staff/attendance/mark', attendanceData);
        } catch (error) {
            console.error('Error marking attendance:', error);
            throw error;
        }
    },

    /**
     * Get attendance statistics for a class
     * GET /api/staff/classes/{id}/attendance-stats
     */
    getAttendanceStats: async (classId) => {
        try {
            return await axiosClient.get(`/staff/classes/${classId}/attendance-stats`);
        } catch (error) {
            console.error('Error fetching attendance stats:', error);
            throw error;
        }
    },

    /**
     * Get student attendance in a class
     * GET /api/staff/classes/{id}/students/{studentId}/attendance
     */
    getStudentAttendanceInClass: async (classId, studentId) => {
        try {
            return await axiosClient.get(`/staff/classes/${classId}/students/${studentId}/attendance`);
        } catch (error) {
            console.error('Error fetching student attendance:', error);
            throw error;
        }
    },

    /**
     * Initialize attendance for a schedule
     * POST /api/staff/schedules/{scheduleId}/attendance/initialize
     */
    initializeAttendanceForSchedule: async (scheduleId) => {
        try {
            return await axiosClient.post(`/staff/schedules/${scheduleId}/attendance/initialize`);
        } catch (error) {
            console.error('Error initializing attendance:', error);
            throw error;
        }
    },

    // ==================== REGISTRATIONS ====================

    /**
     * Get all registrations
     * GET /api/staff/registrations
     */
    getRegistrations: async (params = {}) => {
        try {
            return await axiosClient.get('/staff/registrations', { params });
        } catch (error) {
            console.error('Error fetching registrations:', error);
            throw error;
        }
    },

    /**
     * Get registration details
     * GET /api/staff/registrations/{id}
     */
    getRegistrationDetails: async (registrationId) => {
        try {
            return await axiosClient.get(`/staff/registrations/${registrationId}`);
        } catch (error) {
            console.error('Error fetching registration details:', error);
            throw error;
        }
    },

    /**
     * Approve registration
     * PATCH /api/staff/registrations/{id}/approve
     */
    approveRegistration: async (registrationId) => {
        try {
            return await axiosClient.patch(`/staff/registrations/${registrationId}/approve`);
        } catch (error) {
            console.error('Error approving registration:', error);
            throw error;
        }
    },

    /**
     * Reject registration
     * PATCH /api/staff/registrations/{id}/reject
     */
    rejectRegistration: async (registrationId, reason) => {
        try {
            return await axiosClient.patch(`/staff/registrations/${registrationId}/reject`, { reason });
        } catch (error) {
            console.error('Error rejecting registration:', error);
            throw error;
        }
    },

    /**
     * Create student account from registration
     * POST /api/staff/registrations/{id}/create-account
     */
    createAccountFromRegistration: async (registrationId, studentInfo) => {
        try {
            return await axiosClient.post(`/staff/registrations/${registrationId}/create-account`, studentInfo);
        } catch (error) {
            console.error('Error creating account from registration:', error);
            throw error;
        }
    },

    /**
     * Assign class to registration
     * POST /api/staff/registrations/{id}/assign-class
     */
    assignClassToRegistration: async (registrationId, classId) => {
        try {
            return await axiosClient.post(`/staff/registrations/${registrationId}/assign-class`, { classId });
        } catch (error) {
            console.error('Error assigning class:', error);
            throw error;
        }
    },

    // ==================== NOTES ====================

    /**
     * Get student notes
     * GET /api/staff/students/{id}/notes
     */
    getStudentNotes: async (studentId) => {
        try {
            return await axiosClient.get(`/staff/students/${studentId}/notes`);
        } catch (error) {
            console.error('Error fetching student notes:', error);
            throw error;
        }
    },

    /**
     * Add note to student
     * POST /api/staff/students/{id}/notes
     */
    addStudentNote: async (studentId, noteData) => {
        try {
            return await axiosClient.post(`/staff/students/${studentId}/notes`, noteData);
        } catch (error) {
            console.error('Error adding student note:', error);
            throw error;
        }
    },

    // ==================== REPORTS ====================

    /**
     * Get attendance report for a class
     * POST /api/staff/reports/attendance
     */
    getAttendanceReport: async (reportRequest) => {
        try {
            return await axiosClient.post('/staff/reports/attendance', reportRequest);
        } catch (error) {
            console.error('Error generating attendance report:', error);
            throw error;
        }
    },

    /**
     * Get registration report
     * GET /api/staff/reports/registrations
     */
    getRegistrationReport: async (params = {}) => {
        try {
            return await axiosClient.get('/staff/reports/registrations', { params });
        } catch (error) {
            console.error('Error fetching registration report:', error);
            throw error;
        }
    },

    // ==================== ANNOUNCEMENTS ====================

    /**
     * Get all announcements
     * GET /api/staff/announcements
     */
    getAnnouncements: async () => {
        try {
            return await axiosClient.get('/staff/announcements');
        } catch (error) {
            console.error('Error fetching announcements:', error);
            throw error;
        }
    },

    /**
     * Create announcement
     * POST /api/staff/announcements
     */
    createAnnouncement: async (announcementData) => {
        try {
            return await axiosClient.post('/staff/announcements', announcementData);
        } catch (error) {
            console.error('Error creating announcement:', error);
            throw error;
        }
    },

    /**
     * Update announcement
     * PUT /api/staff/announcements/{id}
     */
    updateAnnouncement: async (announcementId, announcementData) => {
        try {
            return await axiosClient.put(`/staff/announcements/${announcementId}`, announcementData);
        } catch (error) {
            console.error('Error updating announcement:', error);
            throw error;
        }
    },

    // ==================== COURSES ====================

    /**
     * Get all courses for staff
     */
    getCourses: async () => {
        try {
            return await axiosClient.get('/public/courses');
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    },

    /**
     * Get available classes for a course
     */
    getAvailableClasses: async (courseId) => {
        try {
            const params = courseId ? { courseId } : {};
            return await axiosClient.get(`/staff/classes`, { params });
        } catch (error) {
            console.error('Error fetching available classes:', error);
            throw error;
        }
    },

    // ==================== TEACHER REPORTS ====================

    /**
     * Get all teacher reports for a class
     * GET /api/staff/reports/teacher?classId={id}
     */
    getTeacherReports: async (classId) => {
        try {
            return await axiosClient.get('/staff/reports/teacher', {
                params: { classId }
            });
        } catch (error) {
            console.error('Error fetching teacher reports:', error);
            throw error;
        }
    },

    /**
     * Get detailed teacher report for a student in a class
     * GET /api/staff/reports/teacher/detail?classId={classId}&studentId={studentId}
     */
    getStudentReportDetail: async (classId, studentId) => {
        try {
            return await axiosClient.get('/staff/reports/teacher/detail', {
                params: { classId, studentId }
            });
        } catch (error) {
            console.error('Error fetching student report detail:', error);
            throw error;
        }
    },

    // ==================== STUDENT REPORTS (Feedback from students) ====================

    /**
     * Get all student reports (reports sent by students to staff)
     * GET /api/staff/reports/student?classId={id}&status={status}
     */
    getStudentReports: async (classId, status) => {
        try {
            const params = {};
            if (classId) params.classId = classId;
            if (status) params.status = status;
            return await axiosClient.get('/staff/reports/student', { params });
        } catch (error) {
            console.error('Error fetching student reports:', error);
            throw error;
        }
    },

    /**
     * Get student report detail
     * GET /api/staff/reports/student/{id}
     */
    getStudentFeedbackDetail: async (reportId) => {
        try {
            return await axiosClient.get(`/staff/reports/student/${reportId}`);
        } catch (error) {
            console.error('Error fetching student feedback detail:', error);
            throw error;
        }
    },

    /**
     * Respond to student report
     * POST /api/staff/reports/student/{id}/respond
     */
    respondToStudentReport: async (reportId, response) => {
        try {
            return await axiosClient.post(`/staff/reports/student/${reportId}/respond`, { response });
        } catch (error) {
            console.error('Error responding to student report:', error);
            throw error;
        }
    },

    /**
     * Resolve student report
     * POST /api/staff/reports/student/{id}/resolve
     */
    resolveStudentReport: async (reportId) => {
        try {
            return await axiosClient.post(`/staff/reports/student/${reportId}/resolve`);
        } catch (error) {
            console.error('Error resolving student report:', error);
            throw error;
        }
    }
};

export default staffService;
