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

    // Get all questions from QuestionBank (created by Teachers)
    getAllQuestions: async () => {
        return await axiosClient.get('/teacher/questions');
    },
};

export default educationManagerService;
