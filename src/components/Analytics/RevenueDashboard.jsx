import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Receipt, Calendar, Download, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';

/**
 * RevenueDashboard - Component hiển thị doanh thu
 * Phase 5: Analytics
 *
 * Features:
 * - Total revenue tracking
 * - Monthly/weekly revenue trends
 * - Revenue by course
 * - Revenue by source
 * - Payment status breakdown
 * - Outstanding payments
 */
const RevenueDashboard = ({ timeRange = 'month' }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(timeRange);

    useEffect(() => {
        fetchRevenueData();
    }, [selectedPeriod]);

    const fetchRevenueData = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/analytics/revenue', {
                params: { period: selectedPeriod }
            });
            setRevenueData(response.data);
        } catch (error) {
            console.error('Error fetching revenue data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!revenueData) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('analytics.revenue.heading')}</h2>
                    <p className="text-gray-600">{t('analytics.revenue.description')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                        <option value="week">{t('analytics.revenue.period.week')}</option>
                        <option value="month">{t('analytics.revenue.period.month')}</option>
                        <option value="quarter">{t('analytics.revenue.period.quarter')}</option>
                        <option value="year">{t('analytics.revenue.period.year')}</option>
                    </select>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        {t('analytics.revenue.exportReport')}
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title={t('analytics.revenue.cards.totalRevenue')}
                    value={revenueData.totalRevenue}
                    format="currency"
                    icon={<DollarSign className="w-5 h-5" />}
                    color="green"
                    trend={revenueData.revenueTrend}
                />
                <MetricCard
                    title={t('analytics.revenue.cards.paid')}
                    value={revenueData.paidAmount}
                    format="currency"
                    icon={<Receipt className="w-5 h-5" />}
                    color="blue"
                />
                <MetricCard
                    title={t('analytics.revenue.cards.pending')}
                    value={revenueData.pendingAmount}
                    format="currency"
                    icon={<Calendar className="w-5 h-5" />}
                    color="orange"
                />
                <MetricCard
                    title={t('analytics.revenue.cards.studentCount')}
                    value={revenueData.studentCount}
                    icon={<Users className="w-5 h-5" />}
                    color="purple"
                    trend={revenueData.studentTrend}
                />
            </div>

            {/* Revenue Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">{t('analytics.revenue.sections.revenueTrend')}</h3>
                    <RevenueTrendChart data={revenueData.trendData} />
                </div>

                {/* Revenue by Course */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">{t('analytics.revenue.sections.revenueByCourse')}</h3>
                    <div className="space-y-3">
                        {revenueData.byCourse?.map((course, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{course.name}</span>
                                <span className="text-sm font-medium text-green-600">
                                    {course.amount.toLocaleString()} VNĐ
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">{t('analytics.revenue.sections.paymentStatus')}</h3>
                <div className="grid grid-cols-3 gap-4">
                    <PaymentStatusCard
                        title={t('analytics.revenue.status.paid')}
                        count={revenueData.paymentStatus.paid}
                        amount={revenueData.paymentStatus.paidAmount}
                        color="green"
                    />
                    <PaymentStatusCard
                        title={t('analytics.revenue.status.waiting')}
                        count={revenueData.paymentStatus.pending}
                        amount={revenueData.paymentStatus.pendingAmount}
                        color="yellow"
                    />
                    <PaymentStatusCard
                        title={t('analytics.revenue.status.overdue')}
                        count={revenueData.paymentStatus.overdue}
                        amount={revenueData.paymentStatus.overdueAmount}
                        color="red"
                    />
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, format, icon, color, trend }) => {
    const formatValue = (val, fmt) => {
        if (fmt === 'currency') return val.toLocaleString() + ' VNĐ';
        return val;
    };

    const colorClasses = {
        green: 'bg-green-50 text-green-700 border-green-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200'
    };

    return (
        <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
                {trend !== undefined && (
                    <span className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend >= 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold">{formatValue(value, format)}</p>
            <p className="text-xs opacity-75 mt-1">{title}</p>
        </div>
    );
};

const PaymentStatusCard = ({ title, count, amount, color }) => {
    const bgColors = {
        green: 'bg-green-50',
        yellow: 'bg-yellow-50',
        red: 'bg-red-50'
    };

    return (
        <div className={`p-4 rounded-lg ${bgColors[color]}`}>
            <p className="text-sm text-gray-700 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{count}</p>
            <p className="text-xs text-gray-600">{amount.toLocaleString()} VNĐ</p>
        </div>
    );
};

const RevenueTrendChart = ({ data }) => {
    return (
        <div className="h-48 flex items-end justify-between gap-2">
            {data?.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                        className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-all cursor-pointer relative group"
                        style={{ height: `${item.percentage}%` }}
                    >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {item.amount.toLocaleString()} VNĐ
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{item.label}</p>
                </div>
            ))}
        </div>
    );
};

const LoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
        </div>
    </div>
);

const EmptyState = () => {
    const { t } = useTranslation();
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('analytics.revenue.emptyState')}</p>
        </div>
    );
};

export default RevenueDashboard;
