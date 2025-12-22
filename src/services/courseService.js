import axiosClient from '../api/axiosClient';

const courseService = {
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
    }
};

export default courseService;
