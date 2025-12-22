import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';

const GradingDetail = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Need endpoint to get answers for attempt
                // ExamAttemptService.getAttemptAnswers -> TeacherController needs endpoint?
                // Let's assume we add GET /teacher/grading/{attemptId}/answers
                // For now, let's use a generic endpoint or mock if backend missing

                // Note: I missed adding GET answers endpoint in TeacherController. 
                // Will fetch generic attempts first or mock.
                // Actually ExamAttemptService has getAttemptAnswers, but not exposed in Controller yet.
                // I will add it in next step.
                const res = await api.get('/teacher/grading/${attemptId}/answers');
                 setAnswers(res.data);
            } catch (error) {
                console.error("Failed to load answers", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [attemptId]);

    const handleGradeChange = (id, field, value) => {
        setAnswers(prev => prev.map(a => 
            a.id === id ? { ...a, [field]: value } : a
        ));
    };

    const handleSubmit = async () => {
        try {
            await api.post('/teacher/grading/${attemptId}/submit', answers);
            alert("Chấm điểm thành công!");
            navigate('/grading-queue');
        } catch (error) {
            console.error(error);
            alert("Lỗi khi lưu điểm");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8 mt-20">
                <h1 className="text-2xl font-bold mb-6">Chấm Bài - Attempt #{attemptId}</h1>
                
                <div className="space-y-6">
                    {answers.map((ans, idx) => (
                        <div key={ans.id} className="bg-white rounded-xl shadow p-6">
                            <div className="mb-4">
                                <span className="font-bold text-gray-500 text-sm uppercase">Câu hỏi {idx + 1} ({ans.examQuestion?.points} điểm)</span>
                                <p className="text-lg font-medium mt-2">{ans.examQuestion?.question?.questionText}</p>
                            </div>

                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                                <span className="block text-sm text-gray-500 mb-2">Bài làm của học viên:</span>
                                {ans.answerFileUrl ? (
                                    <audio controls src={ans.answerFileUrl} className="w-full" />
                                ) : (
                                    <p className="whitespace-pre-wrap text-gray-800">{ans.answerText}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Điểm số</label>
                                    <input 
                                        type="number" 
                                        value={ans.score || ''}
                                        onChange={(e) => handleGradeChange(ans.id, 'score', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary-500"
                                        max={ans.examQuestion?.points}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nhận xét</label>
                                    <textarea 
                                        value={ans.feedback || ''}
                                        onChange={(e) => handleGradeChange(ans.id, 'feedback', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary-500"
                                        rows="2"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="sticky bottom-0 bg-white border-t p-4 mt-8 flex justify-end shadow-lg">
                    <button 
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg"
                    >
                        Hoàn tất chấm điểm
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default GradingDetail;
