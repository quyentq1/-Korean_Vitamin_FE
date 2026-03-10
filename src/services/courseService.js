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

    // Staff/Admin methods can be added here or in a separate adminCourseService
    // For now keeping it simple.
    getAllCourses: async () => {
        return await axiosClient.get('/admin/courses');
    },

    createCourse: async (course) => {
        return await axiosClient.post('/admin/courses', course);
    },

    updateCourse: async (id, course) => {
        return await axiosClient.put(`/admin/courses/${id}`, course);
    },

    deleteCourse: async (id) => {
        return await axiosClient.delete(`/admin/courses/${id}`);
    },

    getCourseStudents: async (id) => {
        return await axiosClient.get(`/admin/courses/${id}/students`);
    },

    // Admin: Publish course
    publishCourse: async (id) => {
        return await axiosClient.post(`/admin/courses/${id}/publish`);
    },

    // Admin: Unpublish course
    unpublishCourse: async (id) => {
        return await axiosClient.post(`/admin/courses/${id}/unpublish`);
    },

    // Admin: Archive course
    archiveCourse: async (id) => {
        return await axiosClient.post(`/admin/courses/${id}/archive`);
    },

    // Admin: Update course metadata
    updateCourseMetadata: async (id, metadata) => {
        return await axiosClient.patch(`/admin/courses/${id}/metadata`, metadata);
    },

    // Admin: Get courses by status
    getCoursesByStatus: async (status) => {
        return await axiosClient.get(`/admin/courses/status/${status}`);
    }
};

export default courseService;
