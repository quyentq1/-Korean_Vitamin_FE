import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Eye, BookOpen, Users } from 'lucide-react';
import examService from '../../services/examService';

const ExamHistory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'course', 'class'
    const [attempts, setAttempts] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            console.log('📚 Fetching exam history...');
            const data = await examService.getAttemptHistory();
            console.log('📊 Exam history received:', data);
            console.log('📝 Number of attempts:', data?.length || 0);

            if (data && data.length > 0) {
                console.log('🔍 First attempt:', data[0]);
                console.log('❓ First attempt exam:', data[0].exam);
                console.log('❓ First attempt status:', data[0].status);
            }

            setAttempts(data || []);
        } catch (error) {
            console.error('❌ Failed to fetch exam history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
            case 'GRADED':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Hoàn thành
                    </span>
                );
            case 'IN_PROGRESS':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Đang làm
                    </span>
                );
            case 'PENDING_MANUAL_GRADE':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Chấm chờ
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {status}
                    </span>
                );
        }
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600 bg-green-50';
        if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getExamSourceBadge = (exam) => {
        if (exam?.classEntity || exam?.classId) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                    <Users className="w-3 h-3" />
                    Lớp học
                </span>
            );
        } else if (exam?.course || exam?.courseId) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                    <BookOpen className="w-3 h-3" />
                    Khóa học
                </span>
            );
        }
        return null;
    };

    const getFilteredAttempts = () => {
        switch (activeTab) {
            case 'course':
                return attempts.filter(attempt =>
                    attempt.exam?.course && !attempt.exam?.classEntity && !attempt.exam?.classId
                );
            case 'class':
                return attempts.filter(attempt =>
                    attempt.exam?.classEntity || attempt.exam?.classId
                );
            default:
                return attempts;
        }
    };

    const filteredAttempts = getFilteredAttempts();
    const stats = {
        total: attempts.length,
        course: attempts.filter(a => a.exam?.course && !a.exam?.classEntity && !a.exam?.classId).length,
        class: attempts.filter(a => a.exam?.classEntity || a.exam?.classId).length
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Lịch sử thi</h1>
                    <p className="text-gray-600 mt-1">Xem lại tất cả các bài thi bạn đã làm</p>
                </div>

                {/* Tabs */}
                {attempts.length > 0 && (
                    <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b border-gray-200">
                            <div className="flex gap-8 px-6">
                                {[
                                    { key: 'all', label: 'Tất cả', count: stats.total },
                                    { key: 'course', label: 'Khóa học', count: stats.course, icon: BookOpen },
                                    { key: 'class', label: 'Lớp học', count: stats.class, icon: Users }
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                                            activeTab === tab.key
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {tab.icon && <tab.icon className="w-4 h-4" />}
                                        <span>{tab.label}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            activeTab === tab.key
                                                ? 'bg-indigo-100 text-indigo-600'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {filteredAttempts.length === 0 && attempts.length > 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <div className="text-gray-400 mb-4">
                            <Clock className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {activeTab === 'course' ? 'Chưa có bài thi khóa học nào' :
                             activeTab === 'class' ? 'Chưa có bài thi lớp học nào' :
                             'Chưa có bài thi nào'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {activeTab === 'course' ? 'Bạn chưa thực hiện bài thi nào thuộc khóa học.' :
                             activeTab === 'class' ? 'Bạn chưa thực hiện bài thi nào thuộc lớp học.' :
                             'Bạn chưa thực hiện bài kiểm tra nào. Hãy bắt đầu với một bài thi nhé!'}
                        </p>
                        <button
                            onClick={() => navigate('/student/exams')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
                        >
                            Xem bài thi
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bài thi</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nguồn</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Thời gian</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Điểm số</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredAttempts.map((attempt) => {
                                        const percentage = attempt.exam?.totalPoints
                                            ? Math.round((attempt.totalScore / attempt.exam.totalPoints) * 100)
                                            : 0;

                                        return (
                                            <tr key={attempt.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {attempt.exam?.title || 'Bài thi không tên'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {attempt.exam?.course?.name || ''}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getExamSourceBadge(attempt.exam)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600">
                                                        <p>Bắt đầu: {new Date(attempt.startTime).toLocaleString('vi-VN')}</p>
                                                        {attempt.submitTime && (
                                                            <p>Nộp: {new Date(attempt.submitTime).toLocaleString('vi-VN')}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {attempt.status === 'COMPLETED' || attempt.status === 'GRADED' || attempt.status === 'PENDING_MANUAL_GRADE' ? (
                                                        attempt.totalScore > 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-lg font-bold ${getScoreColor(percentage)} px-3 py-1 rounded-lg`}>
                                                                    {attempt.totalScore}/{attempt.exam?.totalPoints || 0}
                                                                </span>
                                                                <span className="text-sm text-gray-500">({percentage}%)</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 italic">Đang chấm</span>
                                                        )
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(attempt.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {attempt.status === 'COMPLETED' || attempt.status === 'GRADED' || attempt.status === 'PENDING_MANUAL_GRADE' ? (
                                                            <button
                                                                onClick={() => navigate(`/exam/result/${attempt.id}`)}
                                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-1"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                Xem kết quả
                                                            </button>
                                                        ) : attempt.status === 'IN_PROGRESS' ? (
                                                            <button
                                                                onClick={() => navigate(`/exam/${attempt.exam?.id}/taking/${attempt.id}`)}
                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-1"
                                                            >
                                                                <Clock className="w-4 h-4" />
                                                                Tiếp tục
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamHistory;
