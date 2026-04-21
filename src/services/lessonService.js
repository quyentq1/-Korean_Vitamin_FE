import axiosClient from '../api/axiosClient';

export const lessonService = {
    // Public: Get preview lessons for a course (guest accessible)
    getPreviewLessons: async (courseId) => {
        return await axiosClient.get(`/lessons/course/${courseId}/preview`);
    },

    // Authenticated: Get published lessons for a course
    getCourseLessons: async (courseId) => {
        return await axiosClient.get(`/lessons/course/${courseId}`);
    },

    // Admin: Get all lessons for a course (including unpublished)
    getAllCourseLessons: async (courseId) => {
        return await axiosClient.get(`/lessons/course/${courseId}/all`);
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
    },

    // Admin: Reorder lessons
    reorderLessons: async (lessonIds) => {
        return await axiosClient.put('/lessons/reorder', lessonIds);
    },

    // Admin: Upload image for lesson content
    uploadLessonImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await axiosClient.post('/lessons/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Admin: Upload video for lesson
    uploadLessonVideo: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await axiosClient.post('/lessons/upload-video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export default lessonService;
