import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, FileText, Play, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * ExamList - Danh sách đề thi cho Learner
 * Priority 1: Exam System (Learner)
 */
const ExamList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('available'); // available, completed, all

    useEffect(() => {
        // Fetch exams and attempts
        setLoading(false);
    }, []);

    const handleStartExam = (exam) => {
        navigate(`/exam-intro/${exam.id}`);
    };

    const getExamStatus = (exam) => {
        const examAttempts = attempts.filter(a => a.examId === exam.id);
        if (examAttempts.length === 0) return 'available';
        if (examAttempts.some(a => a.status === 'GRADED')) return 'completed';
        return 'in_progress';
    };

    const filteredExams = exams.filter(exam => {
        const status = getExamStatus(exam);
        if (filter === 'available') return status === 'available';
        if (filter === 'completed') return status === 'completed';
        return true;
    });

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Bài Kiểm Tra</h1>
                <p className="text-gray-600 mt-1">Làm các bài kiểm tra để kiểm tra kiến thức</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex gap-3">
                    <button
                        onClick={() => setFilter('available')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'available' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        Có thể làm
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        Đã hoàn thành
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        Tất cả
                    </button>
                </div>
            </div>

            {/* Exams Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExams.map((exam) => {
                        const status = getExamStatus(exam);
                        const examAttempts = attempts.filter(a => a.examId === exam.id);

                        return (
                            <div
                                key={exam.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-indigo-100 rounded-lg">
                                        <FileText className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    {status === 'completed' ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                            <CheckCircle className="w-3 h-3 inline mr-1" />
                                            Đã xong
                                        </span>
                                    ) : status === 'in_progress' ? (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                            Đang làm
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                            Có thể làm
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exam.description}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        <span>{exam.durationMinutes} phút</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FileText className="w-4 h-4" />
                                        <span>{exam.totalQuestions} câu hỏi</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>⭐ {exam.totalMarks} điểm</span>
                                        <span>•</span>
                                        <span>Đạt: {exam.passingMarks} điểm</span>
                                    </div>
                                </div>

                                {status === 'completed' && examAttempts.length > 0 && (
                                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm text-green-800">
                                            Lần làm tốt nhất: <strong>{Math.max(...examAttempts.map(a => a.score || 0))} điểm</strong>
                                        </p>
                                        <p className="text-xs text-green-600">
                                            {examAttempts.length} lần làm
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleStartExam(exam)}
                                    disabled={status === 'in_progress'}
                                    className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                        status === 'available'
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : status === 'completed'
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {status === 'available' ? (
                                        <>
                                            <Play className="w-4 h-4" />
                                            Bắt đầu
                                        </>
                                    ) : status === 'completed' ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Làm lại
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            Đang làm bài
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filteredExams.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Không có bài kiểm tra nào</p>
                </div>
            )}
        </div>
    );
};

export default ExamList;
