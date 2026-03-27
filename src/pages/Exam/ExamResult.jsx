import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { CheckCircle2, XCircle, Clock, Award, TrendingUp, Home, Redo } from 'lucide-react';
import examService from '../../services/examService';

const ExamResult = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { width, height } = useWindowSize();

    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const [attempt, setAttempt] = useState(null);
    const [exam, setExam] = useState(null);

    useEffect(() => {
        fetchResult();
    }, [attemptId]);

    const fetchResult = async () => {
        try {
            setLoading(true);
            const attemptData = await examService.getAttemptDetails(attemptId);
            setAttempt(attemptData);

            if (attemptData.exam) {
                setExam(attemptData.exam);
            }

            // Show confetti if score >= 80%
            const percentage = attemptData.totalScore
                ? Math.round((attemptData.totalScore / attemptData.exam?.totalPoints) * 100)
                : 0;

            if (percentage >= 80) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        } catch (error) {
            console.error('Failed to fetch result:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'from-green-500 to-emerald-600';
        if (score >= 60) return 'from-yellow-400 to-orange-500';
        return 'from-red-500 to-pink-600';
    };

    const getScoreBgColor = (score) => {
        if (score >= 80) return 'shadow-green-500/30';
        if (score >= 60) return 'shadow-orange-500/30';
        return 'shadow-red-500/30';
    };

    const getScoreLabel = (score) => {
        if (score >= 90) return 'Xuất sắc';
        if (score >= 80) return 'Giỏi';
        if (score >= 70) return 'Khá';
        if (score >= 60) return 'Đạt';
        return 'Cần cố gắng';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Đang tính điểm...</p>
                </div>
            </div>
        );
    }

    if (!attempt || !exam) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center text-red-500">
                    <p className="text-xl font-semibold mb-2">Không tìm thấy kết quả</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const scorePercentage = attempt.totalScore
        ? Math.round((attempt.totalScore / exam.totalPoints) * 100)
        : 0;
    const passed = scorePercentage >= (exam.passingScore || 60);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {showConfetti && (
                <Confetti
                    width={width}
                    height={height}
                    numberOfPieces={200}
                    recycle={false}
                />
            )}

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Kết Quả Bài Thi</h1>
                    <p className="text-gray-600">{exam.title}</p>
                </div>

                {/* Score Card */}
                <div className={`bg-gradient-to-br ${getScoreColor(scorePercentage)} rounded-3xl p-8 mb-8 text-white shadow-2xl ${getScoreBgColor(scorePercentage)}`}>
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                            <span className="text-6xl font-bold">{scorePercentage}%</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">{getScoreLabel(scorePercentage)}</h2>
                        <p className="text-white/90 text-lg mb-4">
                            {passed ? '🎉 Chúc mừng bạn đã hoàn thành bài thi!' : '💪 Hãy cố gắng hơn ở lần sau!'}
                        </p>
                        <div className="flex items-center justify-center gap-8 text-sm">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                <span>Đạt: {exam.passingScore || 60}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                <span>Điểm của bạn: {attempt.totalScore || 0}/{exam.totalPoints}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Thời gian làm bài</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {attempt.submitTime && attempt.startTime
                                        ? `${Math.round((new Date(attempt.submitTime) - new Date(attempt.startTime)) / 60000)} phút`
                                        : exam.durationMinutes + ' phút'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Câu đúng</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {attempt.answers?.filter(a => a.isCorrect).length || 0}/{exam.examQuestions?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Xếp loại</p>
                                <p className="text-xl font-bold text-gray-900">{getScoreLabel(scorePercentage)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Answer Details */}
                {attempt.answers && attempt.answers.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Chi tiết câu trả lời</h3>
                        <div className="space-y-3">
                            {attempt.answers.map((answer, index) => {
                                const question = answer.examQuestion?.question;
                                if (!question) return null;

                                const isCorrect = answer.isCorrect;

                                return (
                                    <div
                                        key={answer.id}
                                        className={`p-4 rounded-xl border-2 ${
                                            isCorrect
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-red-200 bg-red-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                isCorrect ? 'bg-green-500' : 'bg-red-500'
                                            }`}>
                                                {isCorrect ? (
                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 mb-1">
                                                    Câu {index + 1}: {question.questionText?.substring(0, 100)}...
                                                </p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                        {isCorrect ? 'Chính xác' : 'Sai'}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        Điểm: {answer.score || 0}/{answer.examQuestion?.points || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Về trang chủ
                    </button>
                    <button
                        onClick={() => navigate(`/courses/${exam.course?.id}/exams`)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                        <Redo className="w-5 h-5" />
                        Làm bài khác
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamResult;
