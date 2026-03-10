import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, FileText, AlertTriangle, CheckCircle, Play } from 'lucide-react';
import Swal from 'sweetalert2';

/**
 * ExamIntro - Giới thiệu đề thi trước khi làm
 * Priority 1: Exam System (Learner)
 */
const ExamIntro = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        // Fetch exam details
        setLoading(false);
    }, [examId]);

    const handleStartExam = async () => {
        if (!agreed) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa đồng ý',
                text: 'Vui lòng đọc và đồng ý với quy chế thi',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        const result = await Swal.fire({
            icon: 'question',
            title: 'Bắt đầu làm bài?',
            text: 'Bài thi sẽ được tính thời gian từ khi bạn bấm bắt đầu',
            showCancelButton: true,
            confirmButtonText: 'Bắt đầu ngay',
            cancelButtonText: 'Đợi chút',
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed) {
            navigate(`/exam-screen/${examId}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-600">Không tìm thấy bài kiểm tra</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 text-center">
                        <FileText className="w-16 h-16 text-white mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-white mb-2">{exam.title}</h1>
                        <p className="text-indigo-100">{exam.description}</p>
                    </div>
                </div>

                {/* Exam Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bài thi</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-600">{exam.durationMinutes}</p>
                            <p className="text-sm text-gray-600">Phút</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-green-600">{exam.totalQuestions}</p>
                            <p className="text-sm text-gray-600">Câu hỏi</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <span className="text-2xl font-bold text-purple-600">{exam.totalMarks}</span>
                            <p className="text-sm text-gray-600">Tổng điểm</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <span className="text-2xl font-bold text-orange-600">{exam.passingMarks}</span>
                            <p className="text-sm text-gray-600">Điểm đạt</p>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 inline mr-2" />
                        Quy chế thi
                    </h2>
                    <div className="prose prose-sm max-w-none text-gray-700">
                        <pre className="whitespace-pre-wrap font-sans">
                            {exam.instructions || `1. Thời gian làm bài: ${exam.durationMinutes} phút
2. Không được sử dụng tài liệu trong khi thi
3. Không được thoát trình duyệt khi đang làm bài
4. Bài thi sẽ tự động nộp khi hết giờ
5. Bạn có thể nộp bài sớm nếu hoàn thành
6. Kết quả sẽ được hiển thị sau khi nộp bài
7. Các câu hỏi tự luận sẽ được chấm sau`}
                        </pre>
                    </div>
                </div>

                {/* Attempts History */}
                {attempts.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử làm bài</h2>
                        <div className="space-y-3">
                            {attempts.map((attempt, index) => (
                                <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Lần {index + 1}</p>
                                        <p className="text-xs text-gray-600">
                                            {new Date(attempt.startedAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {attempt.status === 'GRADED' ? (
                                            <>
                                                <p className="text-lg font-bold text-green-600">{attempt.score}/{exam.totalMarks}</p>
                                                <p className="text-xs text-green-600">Đã hoàn thành</p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-yellow-600">Chờ chấm</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Agreement */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                            Tôi đã đọc và đồng ý với quy chế thi. Tôi hiểu rằng thời gian sẽ được tính từ khi bắt đầu làm bài.
                        </span>
                    </label>

                    <button
                        onClick={handleStartExam}
                        disabled={!agreed}
                        className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                            agreed
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg'
                                : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        <Play className="w-5 h-5" />
                        Bắt đầu làm bài ngay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamIntro;
