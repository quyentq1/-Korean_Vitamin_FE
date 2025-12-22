import axiosClient from '../api/axiosClient';

const examPublicService = {
    // Exam details for public/guest access
    getExamDetails: async (examId) => {
        return await axiosClient.get(`/api/exams/${examId}`);
    },
};

export default examPublicService;
