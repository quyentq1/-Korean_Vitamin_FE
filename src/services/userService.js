import axiosClient from '../api/axiosClient';

export const userService = {
    // Admin: Get all users
    getAllUsers: async () => {
        return await axiosClient.get('/admin/users');
    },

    // Admin: Get users by role
    getUsersByRole: async (role) => {
        return await axiosClient.get(`/admin/users/role/${role}`);
    },

    // Admin: Create user
    createUser: async (user) => {
        return await axiosClient.post('/admin/users', user);
    },

    // Admin: Update user
    updateUser: async (id, user) => {
        return await axiosClient.put(`/admin/users/${id}`, user);
    },

    // Admin: Delete user
    deleteUser: async (id) => {
        return await axiosClient.delete(`/admin/users/${id}`);
    },

    // Admin: Lock user account
    lockAccount: async (id, data) => {
        return await axiosClient.post(`/admin/users/${id}/lock`, data);
    },

    // Admin: Unlock user account
    unlockAccount: async (id) => {
        return await axiosClient.post(`/admin/users/${id}/unlock`);
    },

    // Admin: Reset password
    resetPassword: async (id, data) => {
        return await axiosClient.patch(`/admin/users/${id}/reset-password`, data);
    },

    // Admin: Get users with filters
    getUsersWithFilters: async (params) => {
        return await axiosClient.get('/admin/users/filter', { params });
    },

    // Staff: Get students
    getStudents: async () => {
        return await axiosClient.get('/staff/students');
    },

    // Staff: Create student directly
    createStudent: async (student) => {
        return await axiosClient.post('/staff/students', student);
    },

    // Staff: Create student account from registration
    createStudentFromRegistration: async (registrationId, data) => {
        return await axiosClient.post(`/staff/registrations/${registrationId}/create-account`, data);
    }
};

export default userService;
