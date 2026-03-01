import axiosClient from '../api/axiosClient';

export const searchService = {
    // Search across courses and exams
    search: async (keyword, type = 'all') => {
        return await axiosClient.get(`/search?q=${encodeURIComponent(keyword)}&type=${type}`);
    },

    // Search only courses
    searchCourses: async (keyword) => {
        return await axiosClient.get(`/search?q=${encodeURIComponent(keyword)}&type=courses`);
    },

    // Search only exams
    searchExams: async (keyword) => {
        return await axiosClient.get(`/search?q=${encodeURIComponent(keyword)}&type=exams`);
    }
};

export default searchService;
