import axiosClient from '../api/axiosClient';

export const courseService = {
    // Public: Get all active courses
    getActiveCourses: async () => {
        return await axiosClient.get('/public/courses');
    },

    // Public: Get course details
    getCourseById: async (id) => {
        return await axiosClient.get(`/public/courses/${id}`);
    },

    // Get course with complete test and pass criteria information
    getCourseWithTests: async (id) => {
        return await axiosClient.get(`/public/courses/${id}/with-tests`);
    },

    // Get pass criteria for a course
    getPassCriteria: async (id) => {
        return await axiosClient.get(`/public/courses/${id}/pass-criteria`);
    },

    // Education Manager: Update pass criteria
    updatePassCriteria: async (id, criteria) => {
        return await axiosClient.put(`/education-manager/courses/${id}/pass-criteria`, criteria);
    },

    // Education Manager: Update syllabus
    updateSyllabus: async (id, syllabus) => {
        return await axiosClient.put(`/education-manager/courses/${id}/syllabus`, { syllabus });
    },

    // Education Manager: Get all courses (including drafts)
    getAllCourses: async () => {
        return await axiosClient.get('/education-manager/courses');
    },

    // Education Manager: Create course
    createCourse: async (course) => {
        return await axiosClient.post('/education-manager/courses', course);
    },

    // Education Manager: Update course
    updateCourse: async (id, course) => {
        return await axiosClient.put(`/education-manager/courses/${id}`, course);
    },

    // Education Manager: Delete course
    deleteCourse: async (id) => {
        return await axiosClient.delete(`/education-manager/courses/${id}`);
    },

    // Education Manager: Get students in course
    getCourseStudents: async (id) => {
        return await axiosClient.get(`/education-manager/courses/${id}/students`);
    },

    // Education Manager: Publish course
    publishCourse: async (id) => {
        return await axiosClient.post(`/education-manager/courses/${id}/publish`);
    },

    // Education Manager: Unpublish course
    unpublishCourse: async (id) => {
        return await axiosClient.post(`/education-manager/courses/${id}/unpublish`);
    },

    // Education Manager: Archive course
    archiveCourse: async (id) => {
        return await axiosClient.post(`/education-manager/courses/${id}/archive`);
    },

    // Education Manager: Update course metadata
    updateCourseMetadata: async (id, metadata) => {
        return await axiosClient.patch(`/education-manager/courses/${id}/metadata`, metadata);
    },

    // Education Manager: Get courses by status
    getCoursesByStatus: async (status) => {
        return await axiosClient.get(`/education-manager/courses/status/${status}`);
    }
};

export default courseService;
