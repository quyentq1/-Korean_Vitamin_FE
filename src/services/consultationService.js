import axios from 'axios';
import axiosClient from '../api/axiosClient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Consultation Service
 * Gửi yêu cầu tư vấn lên backend — BUG-02 fix
 */
const consultationService = {
    /**
     * Kiểm tra email/sdt đã có đơn tư vấn chưa duyệt chưa
     * GET /api/public/consultation/check?email=...&phone=...
     * @returns {{ hasPending: boolean, field: "email"|"phone"|"" }}
     */
    checkPending: async (email, phone) => {
        const params = {};
        if (email) params.email = email;
        if (phone) params.phone = phone;
        const response = await axios.get(
            `${API_BASE}/api/public/consultation/check`,
            { params, timeout: 8000 }
        );
        return response.data;
    },

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

    /**
     * Lấy danh sách yêu cầu tư vấn (Dành cho Staff/Admin)
     * GET /api/staff/consultations
     */
    getConsultations: async (status) => {
        const params = status && status !== 'all' ? { status } : {};
        const response = await axiosClient.get('/staff/consultations', { params });
        // Return .data directly as per axiosClient pattern in this project
        return response.data || response;
    },

    /**
     * Cập nhật trạng thái yêu cầu tư vấn
     * PATCH /api/staff/consultations/{id}/status
     */
    updateStatus: async (id, status) => {
        const response = await axiosClient.patch(`/staff/consultations/${id}/status`, { status });
        return response.data || response;
    },

    /**
     * Staff/Admin tạo tài khoản thủ công từ yêu cầu tư vấn
     * POST /api/staff/consultations/{id}/create-account
     */
    createAccount: async (id, data) => {
        const response = await axiosClient.post(`/staff/consultations/${id}/create-account`, data || {});
        return response.data || response;
    },

    /**
     * Staff/Admin từ chối yêu cầu tư vấn và gửi email báo lý do
     * POST /api/staff/consultations/{id}/reject
     */
    rejectConsultation: async (id, reason) => {
        const response = await axiosClient.post(`/staff/consultations/${id}/reject`, { reason });
        return response.data || response;
    }
};

export default consultationService;
