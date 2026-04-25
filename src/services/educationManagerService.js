import axiosClient from '../api/axiosClient';

/**
 * Education Manager Service
 * API calls for Education Manager operations
 */
const educationManagerService = {

    // ==================== COURSE MANAGEMENT ====================

    uploadCourseThumbnail: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await axiosClient.post('/education-manager/upload/course-thumbnail', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    getAllCourses: async () => {
        return await axiosClient.get('/education-manager/courses');
    },

    getDashboardStats: async () => {
        return await axiosClient.get('/education-manager/dashboard/stats');
    },

    getCourseById: async (id) => {
        return await axiosClient.get(`/education-manager/courses/${id}`);
    },

    createCourse: async (courseData) => {
        return await axiosClient.post('/education-manager/courses', courseData);
    },

    updateCourse: async (id, courseData) => {
        return await axiosClient.put(`/education-manager/courses/${id}`, courseData);
    },

    deleteCourse: async (id) => {
        return await axiosClient.delete(`/education-manager/courses/${id}`);
    },

    publishCourse: async (id) => {
        return await axiosClient.post(`/education-manager/courses/${id}/publish`);
    },

    unpublishCourse: async (id) => {
        return await axiosClient.post(`/education-manager/courses/${id}/unpublish`);
    },

    archiveCourse: async (id) => {
        return await axiosClient.post(`/education-manager/courses/${id}/archive`);
    },

    getCoursesByStatus: async (status) => {
        return await axiosClient.get(`/education-manager/courses/status/${status}`);
    },

    // ==================== TEACHER MANAGEMENT ====================

    getAllTeachers: async () => {
        return await axiosClient.get('/education-manager/teachers');
    },

    getClassTeachers: async (classId) => {
        return await axiosClient.get(`/classes/${classId}/teachers`);
    },

    assignTeacherToClass: async (classId, teacherId, isPrimary = false) => {
        return await axiosClient.post(`/classes/${classId}/teachers?isPrimary=${isPrimary}`, { teacherId: Number(teacherId) }, {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    // ==================== STUDENT MANAGEMENT ====================

    getAllStudents: async (params = {}) => {
        return await axiosClient.get('/education-manager/students', { params });
    },

    getAvailableStudents: async () => {
        return await axiosClient.get('/education-manager/students/available');
    },

    getClassStudents: async (classId) => {
        return await axiosClient.get(`/classes/${classId}/students`);
    },

    addStudentToClass: async (classId, requestData) => {
        return await axiosClient.post(`/classes/${classId}/students`, requestData);
    },

    removeStudentFromClass: async (classId, studentId) => {
        return await axiosClient.delete(`/classes/${classId}/students/${studentId}`);
    },

    // ==================== CLASS LIST ====================

    getAllClasses: async () => {
        return await axiosClient.get('/classes');
    },

    getClassDetails: async (classId) => {
        return await axiosClient.get(`/classes/${classId}`);
    },

    checkClassAvailability: async (classId) => {
        return await axiosClient.get(`/classes/${classId}/can-enroll`);
    },

    deleteClass: async (classId) => {
        return await axiosClient.delete(`/classes/${classId}`);
    },

    createSchedule: async (classId, scheduleData) => {
        return await axiosClient.post(`/classes/${classId}/schedules`, scheduleData);
    },

    updateSchedule: async (classId, scheduleId, scheduleData) => {
        return await axiosClient.put(`/classes/${classId}/schedules/${scheduleId}`, scheduleData);
    },

    // ==================== TEST / EXAM MANAGEMENT ====================

    // BUG-26, EM-BUG-07,08,09,10,11,12 FIX: Changed from /admin/exams to /education-manager/exams
    getExamsByCourse: async (courseId) => {
        return await axiosClient.get(`/education-manager/exams/course/${courseId}`);
    },

    getExamById: async (id) => {
        return await axiosClient.get(`/education-manager/exams/${id}`);
    },

    createExam: async (examData) => {
        return await axiosClient.post('/education-manager/exams', examData);
    },

    updateExam: async (id, examData) => {
        return await axiosClient.put(`/education-manager/exams/${id}`, examData);
    },

    deleteExam: async (id) => {
        return await axiosClient.delete(`/education-manager/exams/${id}`);
    },

    publishExam: async (id, published) => {
        return await axiosClient.post(`/education-manager/exams/${id}/publish`, { published });
    },

    // ==================== EXAM APPROVAL ====================

    // Get pending exams waiting for approval
    getPendingExams: async () => {
        return await axiosClient.get('/education-manager/exams/pending');
    },

    // Get exams by approval status
    getExamsByStatus: async (status) => {
        return await axiosClient.get(`/education-manager/exams/status/${status}`);
    },

    // Approve or reject an exam
    approveExam: async (examId, data) => {
        return await axiosClient.post(`/education-manager/exams/${examId}/approve`, data);
    },

    // Get exam details for review
    getExamForReview: async (id) => {
        return await axiosClient.get(`/education-manager/exams/${id}`);
    },

    // Get exam approval history
    getExamHistory: async (id) => {
        return await axiosClient.get(`/education-manager/exams/${id}/history`);
    },

    // Get all questions from QuestionBank (created by Teachers)
    getAllQuestions: async () => {
        return await axiosClient.get('/teacher/questions');
    },

    // ==================== QUESTION APPROVAL ====================

    // Get pending questions waiting for approval
    getPendingQuestions: async () => {
        return await axiosClient.get('/education-manager/questions/pending');
    },

    // Get questions by verification status
    getQuestionsByStatus: async (status) => {
        return await axiosClient.get(`/education-manager/questions/status/${status}`);
    },

    // Approve a question
    approveQuestion: async (id, feedback = '') => {
        return await axiosClient.post(`/education-manager/questions/${id}/approve`, { feedback });
    },

    // Reject a question
    rejectQuestion: async (id, feedback) => {
        return await axiosClient.post(`/education-manager/questions/${id}/reject`, { feedback });
    },

    // Bulk approve questions
    bulkApproveQuestions: async (ids, feedback = '') => {
        return await axiosClient.post('/education-manager/questions/bulk-approve', { questionIds: ids, feedback });
    },

    // Bulk reject questions
    bulkRejectQuestions: async (ids, reason) => {
        return await axiosClient.post('/education-manager/questions/bulk-reject', { questionIds: ids, reason });
    },

    // Check for duplicate questions
    checkDuplicate: async (questionText) => {
        return await axiosClient.post('/education-manager/questions/check-duplicate', {
            text: questionText
        });
    },

    // Batch check for duplicate questions (performance optimization)
    checkDuplicatesBatch: async (questionTexts) => {
        return await axiosClient.post('/education-manager/questions/check-duplicates-batch', {
            texts: questionTexts
        });
    },

    // Get question details for review
    getQuestionForReview: async (id) => {
        return await axiosClient.get(`/education-manager/questions/${id}`);
    },

    // Update question (Education Manager edit before approval)
    updateQuestion: async (id, updates) => {
        return await axiosClient.put(`/education-manager/questions/${id}`, updates);
    },

    // Get question approval history
    getQuestionHistory: async (id) => {
        return await axiosClient.get(`/education-manager/questions/${id}/history`);
    },

    // ==================== NOTIFICATIONS ====================

    // Get user notifications
    getNotifications: async () => {
        return await axiosClient.get('/education-manager/notifications');
    },

    // Get unread notification count
    getUnreadCount: async () => {
        return await axiosClient.get('/education-manager/notifications/unread-count');
    },

    // Mark notification as read
    markAsRead: async (id) => {
        return await axiosClient.put(`/education-manager/notifications/${id}/read`);
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        return await axiosClient.put('/education-manager/notifications/read-all');
    },

    // Cleanup old notifications
    cleanupNotifications: async () => {
        return await axiosClient.delete('/education-manager/notifications/cleanup');
    },

    // ==================== SCHEDULE MANAGEMENT ====================

    createClassSchedule: async (classId, scheduleData) => {
        return await axiosClient.post(`/education-manager/classes/${classId}/schedules`, scheduleData);
    },

    updateClassSchedule: async (classId, scheduleId, scheduleData) => {
        return await axiosClient.put(`/education-manager/classes/${classId}/schedules/${scheduleId}`, scheduleData);
    },

    deleteClassSchedule: async (classId, scheduleId) => {
        return await axiosClient.delete(`/education-manager/classes/${classId}/schedules/${scheduleId}`);
    },

    // ==================== ATTENDANCE MANAGEMENT ====================

    getClassAttendanceHistory: async (classId) => {
        return await axiosClient.get(`/education-manager/classes/${classId}/attendance-history`);
    },

    getClassAttendanceStats: async (classId) => {
        return await axiosClient.get(`/education-manager/classes/${classId}/attendance-stats`);
    },

    getScheduleAttendance: async (scheduleId) => {
        return await axiosClient.get(`/education-manager/attendance/schedule/${scheduleId}`);
    },

    getTeacherTeachingDays: async (params = {}) => {
        return await axiosClient.get('/education-manager/teachers/teaching-days', { params });
    },

    getStudentAttendanceDays: async () => {
        return await axiosClient.get('/education-manager/students/attendance-days');
    },

    unlockStudent: async (studentId) => {
        return await axiosClient.post(`/education-manager/students/${studentId}/unlock`);
    },

    // ==================== CERTIFICATE APPROVAL ====================

    getCertificates: async (status) => {
        const params = status && status !== 'all' ? { status } : {};
        // axiosClient interceptor already returns response.data — no extra .data needed
        return await axiosClient.get('/education-manager/certificates', { params });
    },

    approveCertificate: async (id) => {
        return await axiosClient.post(`/education-manager/certificates/${id}/approve`);
    },

    rejectCertificate: async (id, reason) => {
        return await axiosClient.post(`/education-manager/certificates/${id}/reject`, { reason });
    },
};

export default educationManagerService;
