import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import examService from '../../services/examService';

const ExamIntro = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching exam details for ID:', examId);
                const res = await examService.getExamDetails(examId);
                console.log('Exam response:', res);
                setExam(res);
            } catch (error) {
                console.error("Failed to load exam:", error);
                const errorMessage = error.response?.data?.message || error.message || t('exam.intro.loadError', 'Không thể tải thông tin bài thi.');
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (examId) {
            fetchExam();
        }
    }, [examId]);

    const handleStart = async () => {
        try {
            const attempt = await examService.startExam(examId, false);
            navigate(`/exam/${examId}/taking/${attempt.id}`);
        } catch (error) {
            console.error("Failed to start exam attempt", error);
            const errorMessage = error.response?.data?.message || error.message || t('exam.intro.startError', 'Không thể bắt đầu làm bài. Vui lòng thử lại.');

            if (errorMessage.includes("CLASS_EXAM_ATTEMPT_LIMIT")) {
                setError(t('exam.intro.attemptLimit', 'Bạn đã hoàn thành bài thi này. Bài luyện tập trong lớp học chỉ được thi 1 lần.'));
            } else {
                setError(errorMessage);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">{t('exam.intro.loading', 'Đang tải thông tin bài thi...')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{t('exam.intro.error', 'Lỗi')}</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/student')}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            {t('exam.intro.goHome', 'Về trang chủ')}
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            {t('exam.intro.retry', 'Thử lại')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-xl font-semibold mb-2">{t('exam.intro.notFound', 'Không tìm thấy bài thi')}</p>
                    <button
                        onClick={() => navigate('/student')}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        {t('exam.intro.goHome', 'Về trang chủ')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <h1 className="text-3xl font-bold mb-4">{exam?.title}</h1>
                    <p className="text-gray-600 mb-6">{exam?.description}</p>

                    <div className="grid grid-cols-2 gap-6 mb-8 text-left bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <div>
                            <span className="block text-sm text-gray-500">{t('exam.intro.duration', 'Thời gian')}</span>
                            <span className="font-bold text-lg text-blue-900">{exam?.durationMinutes} {t('exam.intro.minutes', 'phút')}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">{t('exam.intro.questionCount', 'Số câu hỏi')}</span>
                            <span className="font-bold text-lg text-blue-900">{exam?.examQuestions?.length || exam?.totalQuestions || 0} {t('exam.intro.questions', 'câu')}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">{t('exam.intro.totalPoints', 'Tổng điểm')}</span>
                            <span className="font-bold text-lg text-blue-900">{exam?.totalPoints || 100} {t('exam.intro.points', 'điểm')}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">{t('exam.intro.passingScore', 'Điểm đạt')}</span>
                            <span className="font-bold text-lg text-blue-900">{exam?.passingScore || 60}%</span>
                        </div>
                        <div className="col-span-2">
                            <span className="block text-sm text-gray-500 mb-1">{t('exam.intro.importantNote', 'Lưu ý quan trọng')}</span>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                <li>{t('exam.intro.note1', 'Không thoát trình duyệt trong quá trình làm bài.')}</li>
                                <li>{t('exam.intro.note2', 'Kết nối mạng ổn định.')}</li>
                                <li>{t('exam.intro.note3', 'Hệ thống sẽ tự động nộp bài khi hết giờ.')}</li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
                        className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold text-lg hover:shadow-lg transform hover:-translate-y-1 transition"
                    >
                        {t('exam.intro.startExam', 'Bắt đầu làm bài')}
                    </button>
                    <p className="mt-4 text-xs text-gray-400">{t('exam.intro.agreement', 'Nhấn bắt đầu đồng nghĩa với việc bạn đồng ý với quy chế thi.')}</p>
                </div>
            </div>
        </div>
    );
};

export default ExamIntro;
