import { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, CheckCircle, Clock, XCircle, BarChart3, Filter, Download } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Swal from 'sweetalert2';

/**
 * EnrollmentDashboard - Component hiển thị thống kê đăng ký học viên
 * Phase 5: Analytics
 *
 * Features:
 * - Total enrollments tracking
 * - Enrollment by course
 * - Enrollment status breakdown
 * - Monthly/weekly trends
 * - Conversion rates
 * - Pending registrations
 * - Export functionality
 */
const EnrollmentDashboard = ({ timeRange = 'month' }) => {
    const [loading, setLoading] = useState(true);
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(timeRange);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchEnrollmentData();
    }, [selectedPeriod, statusFilter]);

    const fetchEnrollmentData = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/analytics/enrollments', {
                params: { period: selectedPeriod, status: statusFilter }
            });
            setEnrollmentData(response.data);
        } catch (error) {
            console.error('Error fetching enrollment data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải dữ liệu đăng ký',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axiosClient.get('/api/analytics/enrollments/export', {
                params: { period: selectedPeriod, status: statusFilter },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `enrollments-${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            await Swal.fire({
                icon: 'success',
                title: 'Đã xuất',
                text: 'File Excel đã được tải xuống',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể xuất báo cáo',
                confirmButtonColor: '#6366f1'
            });
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Đang tải dữ liệu đăng ký...</p>
            </div>
        );
    }

    if (!enrollmentData) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Không có dữ liệu đăng ký</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thống Kê Đăng Ký</h2>
                    <p className="text-gray-600">Theo dõi và phân tích dữ liệu đăng ký học viên</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                        <option value="quarter">Quý này</option>
                        <option value="year">Năm nay</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                    </select>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Xuất Excel
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <MetricCard
                    title="Tổng đăng ký"
                    value={enrollmentData.totalEnrollments}
                    icon={<Users className="w-5 h-5" />}
                    color="purple"
                    trend={enrollmentData.enrollmentTrend}
                />
                <MetricCard
                    title="Đã duyệt"
                    value={enrollmentData.approved}
                    icon={<CheckCircle className="w-5 h-5" />}
                    color="green"
                />
                <MetricCard
                    title="Chờ xử lý"
                    value={enrollmentData.pending}
                    icon={<Clock className="w-5 h-5" />}
                    color="yellow"
                />
                <MetricCard
                    title="Đã từ chối"
                    value={enrollmentData.rejected}
                    icon={<XCircle className="w-5 h-5" />}
                    color="red"
                />
                <MetricCard
                    title="Tỷ lệ chuyển đổi"
                    value={enrollmentData.conversionRate}
                    unit="%"
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="blue"
                    trend={enrollmentData.conversionTrend}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enrollment Trend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Xu hướng đăng ký
                    </h3>
                    <EnrollmentTrendChart data={enrollmentData.trendData} />
                </div>

                {/* Enrollment by Course */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Đăng ký theo khóa học
                    </h3>
                    <div className="space-y-3">
                        {enrollmentData.byCourse?.map((course, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{course.name}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${course.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="ml-4 text-right">
                                    <p className="text-lg font-bold text-blue-600">{course.count}</p>
                                    <p className="text-xs text-gray-500">{course.percentage}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Đăng ký gần đây</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Ngày đăng ký</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nguồn</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {enrollmentData.recentRegistrations?.map((reg, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <p className="text-sm font-medium text-gray-900">{reg.fullName}</p>
                                        <p className="text-xs text-gray-500">{reg.email}</p>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{reg.course}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        {new Date(reg.registrationDate).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                                            reg.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            reg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {reg.status === 'approved' ? 'Đã duyệt' :
                                             reg.status === 'pending' ? 'Chờ xử lý' : 'Đã từ chối'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{reg.source}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Phễu chuyển đổi</h3>
                <div className="flex items-center justify-between">
                    {enrollmentData.funnel?.map((stage, idx) => (
                        <React.Fragment key={idx}>
                            <div className="text-center">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 ${
                                    idx === 0 ? 'bg-blue-100' :
                                    idx === 1 ? 'bg-purple-100' :
                                    idx === 2 ? 'bg-green-100' :
                                    'bg-gray-100'
                                }`}>
                                    <p className="text-2xl font-bold text-gray-900">{stage.count}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{stage.label}</p>
                                <p className="text-xs text-gray-500">{stage.percentage}%</p>
                            </div>
                            {idx < enrollmentData.funnel.length - 1 && (
                                <div className="flex-1 h-1 bg-gray-200 mx-4 relative">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                                        style={{ width: `${stage.dropOff}%` }}
                                    ></div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper Components
const MetricCard = ({ title, value, unit, icon, color, trend }) => {
    const colorClasses = {
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200'
    };

    const isPositive = trend > 0;

    return (
        <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
                {trend !== undefined && (
                    <span className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold">
                {value}{unit}
            </p>
            <p className="text-xs opacity-75 mt-1">{title}</p>
        </div>
    );
};

const EnrollmentTrendChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-gray-400">
                <BarChart3 className="w-12 h-12" />
                <p className="ml-2">Không có dữ liệu</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.count));

    return (
        <div className="h-48 flex items-end justify-between gap-2">
            {data.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                        className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t hover:from-purple-700 hover:to-purple-500 transition-all cursor-pointer relative group"
                        style={{ height: `${(item.count / maxValue) * 150}px` }}
                    >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            {item.count} đăng ký
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center">{item.label}</p>
                </div>
            ))}
        </div>
    );
};

export default EnrollmentDashboard;
