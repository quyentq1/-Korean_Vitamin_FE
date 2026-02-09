import axiosClient from '../api/axiosClient';

export const ocrService = {
    // Process form image via OCR
    processFormImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        return await axiosClient.post('/api/staff/ocr/process', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Export OCR result to Word document
    exportToWord: async (text, studentName) => {
        return await axiosClient.post('/api/staff/ocr/export', {
            ocrText: text,
            studentName: studentName,
        });
    },
};

export default ocrService;
