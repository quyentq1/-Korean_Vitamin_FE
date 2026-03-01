import axiosClient from '../api/axiosClient';

export const lessonService = {
    // Public: Get preview lessons for a course (guest accessible)
    getPreviewLessons: async (courseId) => {
        return await axiosClient.get(`/lessons/course/${courseId}/preview`);
    },

    // Authenticated: Get all lessons for a course
    getCourseLessons: async (courseId) => {
        return await axiosClient.get(`/lessons/course/${courseId}`);
    },

    // Authenticated: Get a specific lesson
    getLessonById: async (id) => {
        return await axiosClient.get(`/lessons/${id}`);
    },

    // Admin: Create a new lesson
    createLesson: async (lesson) => {
        return await axiosClient.post('/lessons', lesson);
    },

    // Admin: Update a lesson
    updateLesson: async (id, lesson) => {
        return await axiosClient.put(`/lessons/${id}`, lesson);
    },

    // Admin: Delete a lesson
    deleteLesson: async (id) => {
        return await axiosClient.delete(`/lessons/${id}`);
    }
};

export default lessonService;
