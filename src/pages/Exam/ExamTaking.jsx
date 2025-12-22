import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ExamTaking = () => {
    const { examId, attemptId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false); // Mock loading
    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 mins in seconds
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [questions, setQuestions] = useState([]);
    const [showWarning, setShowWarning] = useState(false);

    // Anti-cheat: Tab switching
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setShowWarning(true);
                // Could verify logic to auto-submit or penalize
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Mock Questions Init
    useEffect(() => {
        // Fetch questions for attempt
        setQuestions([
            { id: 1, type: 'MULTIPLE_CHOICE', text: 'Thủ đô của Hàn Quốc là gì?', options: [{ id: 1, text: 'Seoul' }, { id: 2, text: 'Busan' }, { id: 3, text: 'Incheon' }, { id: 4, text: 'Daegu' }] },
            { id: 2, type: 'SHORT_ANSWER', text: 'Viết từ "Xin chào" bằng tiếng Hàn.' },
            { id: 3, type: 'LISTENING', text: 'Nghe đoạn hội thoại và chọn đáp án đúng.', mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', options: [{ id: 1, text: 'Option A' }, { id: 2, text: 'Option B' }] }
        ]);
    }, []);

    const handleSubmit = async () => {
        // API Call to submit
        alert("Nộp bài thành công!");
        navigate('/exams/result/' + attemptId); // Mock result page
    };

    const handleAnswer = (val) => {
        setAnswers(prev => ({ ...prev, [questions[currentQuestionIndex].id]: val }));
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return <div>Loading...</div>;

    const currentQ = questions[currentQuestionIndex];

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
                <h1 className="font-bold text-gray-800">Exam #{examId} - Attempt #{attemptId}</h1>
                <div className="text-2xl font-mono font-bold text-primary-600">
                    {formatTime(timeLeft)}
                </div>
                <button onClick={handleSubmit} className="px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600">
                    Nộp bài
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Question Palette */}
                <div className="w-64 bg-white border-r p-4 overflow-y-auto hidden md:block">
                    <h3 className="font-bold mb-4 text-gray-500 uppercase text-xs">Danh sách câu hỏi</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={'w-10 h-10 rounded-lg font-bold text-sm transition ' +
                                    currentQuestionIndex === idx
                                    ? 'bg-primary-600 text-white'
                                    : answers[q.id] ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
                    {currentQ && (
                        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 min-h-[400px]">
                            <div className="mb-6 flex items-start gap-4">
                                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded font-bold text-sm">
                                    Câu {currentQuestionIndex + 1}
                                </span>
                                <span className="text-gray-500 text-sm uppercase tracking-wider">{currentQ.type}</span>
                            </div>

                            <p className="text-xl font-medium text-gray-800 mb-8 leading-relaxed">
                                {currentQ.text}
                            </p>

                            {/* Question Content based on Type */}
                            {currentQ.mediaUrl && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                    <audio controls className="w-full">
                                        <source src={currentQ.mediaUrl} type="audio/mpeg" />
                                    </audio>
                                </div>
                            )}

                            <div className="space-y-3">
                                {currentQ.options ? (
                                    currentQ.options.map(opt => (
                                        <label key={opt.id} className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition">
                                            <input
                                                type="radio"
                                                name={`q-${currentQ.id}`}
                                                value={opt.id}
                                                checked={answers[currentQ.id] == opt.id}
                                                onChange={() => handleAnswer(opt.id)}
                                                className="w-5 h-5 text-primary-600"
                                            />
                                            <span className="text-lg">{opt.text}</span>
                                        </label>
                                    ))
                                ) : (
                                    <textarea
                                        className="w-full border rounded-xl p-4 min-h-[150px] focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Nhập câu trả lời của bạn..."
                                        value={answers[currentQ.id] || ''}
                                        onChange={(e) => handleAnswer(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="max-w-3xl mx-auto mt-8 flex justify-between">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="px-6 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Câu trước
                        </button>
                        <button
                            disabled={currentQuestionIndex === questions.length - 1}
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                            Câu tiếp
                        </button>
                    </div>
                </div>
            </div>

            {/* Anti-cheat Warning Modal */}
            {
                showWarning && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl max-w-sm text-center">
                            <div className="text-4xl mb-4">⚠️</div>
                            <h2 className="text-xl font-bold text-red-600 mb-2">Cảnh báo gian lận!</h2>
                            <p className="text-gray-600 mb-6">Bạn vừa rời khỏi màn hình làm bài. Hành động này đã được ghi lại. Nếu tái phạm, bài thi sẽ bị hủy.</p>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold"
                            >
                                Tôi đã hiểu
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ExamTaking;
