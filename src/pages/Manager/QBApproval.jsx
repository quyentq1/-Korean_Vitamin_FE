import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import managerService from '../../services/managerService';

const QBApproval = () => {
    const { t } = useTranslation();
    const [pendingQuestions, setPendingQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await managerService.getPendingQuestions();
            const data = await Promise.all(res.data.map(async (q) => {
                // Check duplicate for each
                // Note: Heavy operation if list is long, optimize in real app
                const check = await managerService.checkDuplicate(q.questionText);
                return { ...q, duplicateScore: check.data.score };
            }));
            setPendingQuestions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await managerService.approveQuestion(id);
            setPendingQuestions(prev => prev.filter(q => q.id !== id));
        } catch (error) {
            console.error("Failed to approve", error);
        }
    };

    const handleReject = async (id) => {
        try {
            await managerService.rejectQuestion(id);
            setPendingQuestions(prev => prev.filter(q => q.id !== id));
        } catch (error) {
            console.error("Failed to reject", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />
            <div className="pt-24 pb-16 container mx-auto px-6">
                <h1 className="text-3xl font-bold mb-8">Phê Duyệt Câu Hỏi</h1>

                {loading ? <p>Loading...</p> : (
                    <div className="space-y-4">
                        {pendingQuestions.length === 0 && <p>Không có câu hỏi nào chờ duyệt.</p>}
                        {pendingQuestions.map((q) => (
                            <div key={q.id} className="bg-white rounded-xl shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex gap-2 mb-2">
                                            <span className="font-bold text-primary-600">#{q.id}</span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded uppercase">{q.questionType}</span>
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded uppercase">{q.difficulty}</span>
                                        </div>
                                        <p className="text-gray-800 font-medium">{q.questionText}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded text-sm font-bold ${q.duplicateScore > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        Trùng lặp: {q.duplicateScore}%
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => handleApprove(q.id)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">✓ Duyệt</button>
                                    <button onClick={() => handleReject(q.id)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">✗ Từ chối</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default QBApproval;
