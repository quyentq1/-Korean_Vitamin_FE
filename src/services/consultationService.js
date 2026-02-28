import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Consultation Service
 * Gửi yêu cầu tư vấn lên backend — BUG-02 fix
 */
const consultationService = {
    /**
     * Gửi form tư vấn của khách (sau khi hết 2 bài test miễn phí)
     * @param {Object} formData - { fullName, email, phone, contactTime, testInterested, message }
     */
    submitConsultation: async (formData) => {
        const response = await axios.post(
            `${API_BASE}/api/public/consultation`,
            {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                contactTime: formData.contactTime,
                testInterested: formData.testInterested,
                message: formData.message || '',
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
            }
        );
        return response.data;
    },
};

export default consultationService;
