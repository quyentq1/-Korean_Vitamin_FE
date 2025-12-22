import axiosClient from '../api/axiosClient';

const authService = {
    login: async (username, password) => {
        const response = await axiosClient.post('/auth/login', { username, password });
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify({
                id: response.id,
                username: response.username,
                fullName: response.fullName,
                email: response.email,
                role: response.roles // Note: BE might return 'role' or 'roles', need to match BE Response
            }));
        }
        return response;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    }
};

export default authService;
