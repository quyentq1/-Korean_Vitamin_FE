import axiosClient from '../api/axiosClient';

export const faqService = {
    // Get all FAQs with language filter
    getFAQs: async (lang = 'vi') => {
        return await axiosClient.get(`/faq?lang=${lang}`);
    },

    // Get FAQ categories
    getCategories: async (lang = 'vi') => {
        return await axiosClient.get(`/faq/categories?lang=${lang}`);
    },

    // Get FAQs by category
    getFAQsByCategory: async (category, lang = 'vi') => {
        return await axiosClient.get(`/faq/category/${category}?lang=${lang}`);
    },

    // Search FAQs
    searchFAQs: async (keyword, lang = 'vi') => {
        return await axiosClient.get(`/faq/search?keyword=${encodeURIComponent(keyword)}&lang=${lang}`);
    },

    // Get a specific FAQ
    getFAQById: async (id) => {
        return await axiosClient.get(`/faq/${id}`);
    },

    // Admin: Create FAQ
    createFAQ: async (faq) => {
        return await axiosClient.post('/faq', faq);
    },

    // Admin: Update FAQ
    updateFAQ: async (id, faq) => {
        return await axiosClient.put(`/faq/${id}`, faq);
    },

    // Admin: Delete FAQ
    deleteFAQ: async (id) => {
        return await axiosClient.delete(`/faq/${id}`);
    }
};

export default faqService;
