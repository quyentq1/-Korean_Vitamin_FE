import axiosClient from '../api/axiosClient';

export const classService = {
    getMyClasses: async () => {
        return await axiosClient.get('/student/my-classes');
    },

    getAllClasses: async () => {
        return await axiosClient.get('/classes');
    },

    getClassById: async (id) => {
        return await axiosClient.get(`/classes/${id}`);
    },

    createClass: async (data) => {
        return await axiosClient.post('/classes', data);
    },

    updateClass: async (id, data) => {
        return await axiosClient.put(`/classes/${id}`, data);
    },

    getStudents: async (classId) => {
        return await axiosClient.get(`/classes/${classId}/students`);
    },

    addStudent: async (classId, studentId) => {
        return await axiosClient.post(`/classes/${classId}/students`, studentId, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    getTeachers: async (classId) => {
        return await axiosClient.get(`/classes/${classId}/teachers`);
    },

    assignTeacher: async (classId, teacherId, isPrimary = false) => {
        return await axiosClient.post(`/classes/${classId}/teachers?isPrimary=${isPrimary}`, teacherId, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    getClassSchedules: async (classId) => {
        return await axiosClient.get(`/classes/${classId}/schedules`);
    },

    getMySchedules: async () => {
        return await axiosClient.get('/student/my-schedules');
    },

    deleteClass: async (id) => {
        return await axiosClient.delete(`/classes/${id}`);
    },

    removeTeacher: async (classId, teacherId) => {
        return await axiosClient.delete(`/classes/${classId}/teachers/${teacherId}`);
    }
};

export default classService;
