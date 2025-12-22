import axiosClient from '../api/axiosClient';

const userService = {
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
