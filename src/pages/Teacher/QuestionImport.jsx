import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import teacherService from '../../services/teacherService';

const QuestionImport = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
        setResult(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Vui lòng chọn file!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            // Adjust endpoint if needed based on TeacherController mapping
            // TeacherController is @RequestMapping("/api/teacher")
            const response = await teacherService.importQuestions(file);
            setResult('Thành công! Đã nhập ' + response.length + ' câu hỏi.');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Lỗi khi upload file.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8 mt-20 max-w-2xl">
                <div className="bg-white rounded-xl shadow p-8">
                    <h1 className="text-2xl font-bold mb-6">Nhập Câu Hỏi Từ Excel</h1>

                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        <p className="font-bold mb-1">Hướng dẫn:</p>
                        <ul className="list-disc list-inside">
                            <li>Sử dụng file Excel (.xlsx).</li>
                            <li>Cột 1: Danh mục (Category)</li>
                            <li>Cột 2: Loại câu (MULTIPLE_CHOICE, SHORT_ANSWER)</li>
                            <li>Cột 3: Nội dung câu hỏi</li>
                            <li>Cột 4: Độ khó (EASY, MEDIUM, HARD)</li>
                            <li>Cột 5: Điểm số</li>
                            <li>Cột 6: Đáp án đúng</li>
                            <li>Cột 7: Các lựa chọn (cách nhau bởi dấu |)</li>
                        </ul>
                        <a href="#" className="block mt-2 text-blue-600 underline hover:text-blue-800">Tải file mẫu</a>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition cursor-pointer relative">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".xlsx, .xls"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="space-y-2">
                                <span className="text-4xl">📂</span>
                                <p className="text-gray-600 font-medium">
                                    {file ? file.name : "Kéo thả file vào đây hoặc click để chọn"}
                                </p>
                            </div>
                        </div>

                        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                        {result && <div className="p-3 bg-green-100 text-green-700 rounded-lg">{result}</div>}

                        <button
                            type="submit"
                            disabled={uploading || !file}
                            className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 transition"
                        >
                            {uploading ? "Đang xử lý..." : "Bắt đầu Import"}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default QuestionImport;
