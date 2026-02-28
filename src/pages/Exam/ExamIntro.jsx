import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import examService from '../../services/examService';

const ExamIntro = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                setLoading(true);
                const res = await examService.getExamDetails(examId);
                setExam(res);
            } catch (error) {
                console.error("Failed to load exam", error);
                alert("Không thể tải thông tin bài thi.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        if (examId) {
            fetchExam();
        }
    }, [examId, navigate]);

    const handleStart = async () => {
        try {
            const attempt = await examService.startExam(examId, false);
            navigate(`/exam/${examId}/taking/${attempt.id}`);
        } catch (error) {
            console.error("Failed to start exam attempt", error);
            alert("Không thể bắt đầu làm bài. Vui lòng thử lại.");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl mt-20">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <h1 className="text-3xl font-bold mb-4">{exam?.title}</h1>
                    <p className="text-gray-600 mb-6">{exam?.description}</p>

                    <div className="grid grid-cols-2 gap-6 mb-8 text-left max-w-md mx-auto bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <div>
                            <span className="block text-sm text-gray-500">Thời gian</span>
                            <span className="font-bold text-lg text-blue-900">{exam?.durationMinutes} phút</span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">Tổng điểm</span>
                            <span className="font-bold text-lg text-blue-900">{exam?.totalPoints}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="block text-sm text-gray-500 mb-1">Lưu ý quan trọng</span>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                <li>Không thoát trình duyệt trong quá trình làm bài.</li>
                                <li>Kết nối mạng ổn định.</li>
                                <li>Hệ thống sẽ tự động nộp bài khi hết giờ.</li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
                        className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold text-lg hover:shadow-lg transform hover:-translate-y-1 transition"
                    >
                        Bắt đầu làm bài
                    </button>
                    <p className="mt-4 text-xs text-gray-400">Nhấn bắt đầu đồng nghĩa với việc bạn đồng ý với quy chế thi.</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ExamIntro;
