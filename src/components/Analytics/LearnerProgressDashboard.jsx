import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Award, BookOpen, Target, Calendar, BarChart3, LineChart } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

/**
 * LearnerProgressDashboard - Component hiển thị tiến độ học tập
 * Phase 5: Analytics
 *
 * Features:
 * - Overall progress tracking
 * - Course completion rates
 * - Grade trends
 * - Attendance statistics
 * - Assignment completion
 * - Test score history
 * - Learning path visualization
 */
const LearnerProgressDashboard = ({ userId, timeRange = '30d' }) => {
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState(null);
    const [selectedTab, setSelectedTab] = useState('overview');

    useEffect(() => {
        fetchProgressData();
    }, [userId, timeRange]);

    const fetchProgressData = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/api/analytics/learner-progress/${userId}`, {
                params: { timeRange }
            });
            setProgressData(response.data);
        } catch (error) {
            console.error('Error fetching progress data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Đang tải dữ liệu tiến độ...</p>
            </div>
        );
    }

    if (!progressData) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Không có dữ liệu tiến độ</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Tiến độ học tập</h2>
                    <p className="text-gray-600">Theo dõi và phân tích kết quả học tập</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={timeRange}
                        onChange={(e) => window.location.reload()} // In real app, update state
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                        <option value="7d">7 ngày</option>
                        <option value="30d">30 ngày</option>
                        <option value="90d">90 ngày</option>
                        <option value="all">Tất cả</option>
                    </select>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Điểm trung bình"
                    value={progressData.averageScore}
                    unit="/100"
                    icon={<Award className="w-5 h-5" />}
                    color="green"
                    trend={progressData.scoreTrend}
                />
                <StatCard
                    title="Khóa học đã hoàn thành"
                    value={progressData.completedCourses}
                    icon={<BookOpen className="w-5 h-5" />}
                    color="blue"
                    trend={progressData.courseTrend}
                />
                <StatCard
                    title="Bài tập đã nộp"
                    value={progressData.assignmentsCompleted}
                    icon={<Target className="w-5 h-5" />}
                    color="purple"
                    trend={progressData.assignmentTrend}
                />
                <StatCard
                    title="Điểm danh"
                    value={progressData.attendanceRate}
                    unit="%"
                    icon={<Calendar className="w-5 h-5" />}
                    color="orange"
                    trend={progressData.attendanceTrend}
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-6">
                    {['overview', 'courses', 'assignments', 'tests'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                selectedTab === tab
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab === 'overview' ? 'Tổng quan' :
                             tab === 'courses' ? 'Khóa học' :
                             tab === 'assignments' ? 'Bài tập' : 'Bài kiểm tra'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {selectedTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Score Trend Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <LineChart className="w-5 h-5 text-green-600" />
                            Xu hướng điểm số
                        </h3>
                        <ScoreChart data={progressData.scoreHistory} />
                    </div>

                    {/* Course Progress */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Tiến độ khóa học
                        </h3>
                        <div className="space-y-4">
                            {progressData.courses?.map((course, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900">{course.name}</span>
                                        <span className="text-sm text-gray-600">{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedTab === 'courses' && (
                <CourseProgressList courses={progressData.coursesDetail} />
            )}

            {selectedTab === 'assignments' && (
                <AssignmentProgressList assignments={progressData.assignmentsDetail} />
            )}

            {selectedTab === 'tests' && (
                <TestProgressList tests={progressData.testsDetail} />
            )}
        </div>
    );
};

// Helper Components
const StatCard = ({ title, value, unit, icon, color, trend }) => {
    const colorClasses = {
        green: 'bg-green-50 text-green-700 border-green-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200'
    };

    const isPositive = trend > 0;

    return (
        <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses.color}`}>
                    {icon}
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold">{value}{unit}</p>
            <p className="text-xs opacity-75 mt-1">{title}</p>
        </div>
    );
};

const ScoreChart = ({ data }) => {
    // Simplified chart visualization
    const maxScore = 100;
    const chartHeight = 150;

    return (
        <div className="relative h-40">
            <div className="absolute inset-0 flex items-end justify-between gap-1">
                {data?.map((point, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                        <div
                            className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                            style={{ height: `${(point.score / maxScore) * chartHeight}px` }}
                            title={`${point.score} - ${point.date}`}
                        ></div>
                    </div>
                ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-300"></div>
        </div>
    );
};

const CourseProgressList = ({ courses }) => (
    <div className="space-y-4">
        {courses?.map((course, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h4 className="font-medium text-gray-900">{course.name}</h4>
                        <p className="text-sm text-gray-600">{course.instructor}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        course.status === 'completed' ? 'bg-green-100 text-green-700' :
                        course.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                        {course.status === 'completed' ? 'Đã hoàn thành' :
                         course.status === 'in_progress' ? 'Đang học' : 'Chưa bắt đầu'}
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Tiến độ:</span>
                        <span className="ml-2 font-medium">{course.progress}%</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Điểm trung bình:</span>
                        <span className="ml-2 font-medium">{course.avgScore}/100</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Số buổi học:</span>
                        <span className="ml-2 font-medium">{course.attended}/{course.total}</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const AssignmentProgressList = ({ assignments }) => (
    <div className="space-y-4">
        {assignments?.map((assignment, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                        <p className="text-sm text-gray-600">{assignment.course}</p>
                    </div>
                    <div className="text-right">
                        {assignment.score ? (
                            <p className="text-lg font-bold text-green-600">{assignment.score}/100</p>
                        ) : (
                            <p className="text-sm text-gray-500">Chưa chấm</p>
                        )}
                        <p className="text-xs text-gray-500">{assignment.submittedAt}</p>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const TestProgressList = ({ tests }) => (
    <div className="space-y-4">
        {tests?.map((test, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{test.title}</h4>
                        <p className="text-sm text-gray-600">{test.type}</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-lg font-bold ${test.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {test.score}/100
                        </p>
                        <p className="text-xs text-gray-500">{test.date}</p>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default LearnerProgressDashboard;
