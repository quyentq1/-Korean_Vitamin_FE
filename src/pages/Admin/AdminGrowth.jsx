import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  Award,
  Calendar,
  Target,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Globe,
  Smartphone,
  Eye
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  Card,
  Button
} from '../../components/ui';

/**
 * AdminGrowth - Phân tích Tăng trưởng cho Admin
 * Trang chuyên sâu về metrics tăng trưởng và KPIs
 */
const AdminGrowth = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [kpis, setKpis] = useState({
    userAcquisition: { current: 0, previous: 0, growth: 0 },
    revenue: { current: 0, previous: 0, growth: 0 },
    engagement: { current: 0, previous: 0, growth: 0 },
    retention: { current: 0, previous: 0, growth: 0 },
    conversion: { current: 0, previous: 0, growth: 0 },
    nps: { current: 0, previous: 0, growth: 0 }
  });
  const [growthData, setGrowthData] = useState({
    monthlyUsers: [],
    revenueByMonth: [],
    topSources: [],
    userSegments: [],
    cohortRetention: []
  });

  useEffect(() => {
    fetchGrowthData();
  }, [period]);

  const fetchGrowthData = async () => {
    try {
      setLoading(true);
      // TODO: Gọi API thực tế
      // const data = await adminService.getGrowthData(period);

      // Mock data
      const mockKpis = {
        userAcquisition: {
          current: period === 'month' ? 1256 : period === 'quarter' ? 3890 : 15670,
          previous: period === 'month' ? 1116 : period === 'quarter' ? 3400 : 13500,
          growth: 12.5
        },
        revenue: {
          current: period === 'month' ? 485000000 : period === 'quarter' ? 1520000000 : 5800000000,
          previous: period === 'month' ? 392000000 : period === 'quarter' ? 1280000000 : 4900000000,
          growth: 23.7
        },
        engagement: {
          current: 78.5,
          previous: 72.3,
          growth: 8.6
        },
        retention: {
          current: 85.2,
          previous: 82.1,
          growth: 3.8
        },
        conversion: {
          current: 12.8,
          previous: 10.5,
          growth: 21.9
        },
        nps: {
          current: 72,
          previous: 68,
          growth: 5.9
        }
      };

      const mockGrowthData = {
        monthlyUsers: [
          { month: 'T8', users: 850, new: 120 },
          { month: 'T9', users: 920, new: 135 },
          { month: 'T10', users: 1010, new: 145 },
          { month: 'T11', users: 1105, new: 158 },
          { month: 'T12', users: 1180, new: 172 },
          { month: 'T1', users: 1256, new: 189 },
        ],
        revenueByMonth: [
          { month: 'T8', revenue: 280000000 },
          { month: 'T9', revenue: 320000000 },
          { month: 'T10', revenue: 355000000 },
          { month: 'T11', revenue: 410000000 },
          { month: 'T12', revenue: 485000000 },
          { month: 'T1', revenue: 520000000 },
        ],
        topSources: [
          { source: 'Google', icon: <Globe className="w-5 h-5" />, users: 456, percentage: 36, color: 'from-blue-500 to-blue-600' },
          { source: 'Facebook', icon: <Users className="w-5 h-5" />, users: 312, percentage: 25, color: 'from-blue-600 to-indigo-600' },
          { source: 'Direct', icon: <Eye className="w-5 h-5" />, users: 234, percentage: 19, color: 'from-green-500 to-green-600' },
          { source: 'YouTube', icon: <Play className="w-5 h-5" />, users: 189, percentage: 15, color: 'from-red-500 to-red-600' },
          { source: 'Other', icon: <Activity className="w-5 h-5" />, users: 65, percentage: 5, color: 'from-gray-500 to-gray-600' },
        ],
        userSegments: [
          { segment: 'Free', users: 678, percentage: 54, revenue: 0 },
          { segment: 'Basic', users: 356, percentage: 28, revenue: 178000000 },
          { segment: 'Premium', users: 189, percentage: 15, revenue: 256000000 },
          { segment: 'Enterprise', users: 33, percentage: 3, revenue: 51000000 },
        ],
        cohortRetention: [
          { cohort: 'T8/25', m0: 100, m1: 85, m2: 78, m3: 72, m4: 68, m5: 65 },
          { cohort: 'T9/25', m0: 100, m1: 87, m2: 80, m3: 75, m4: 71, m5: null },
          { cohort: 'T10/25', m0: 100, m1: 89, m2: 82, m3: 77, m4: null, m5: null },
          { cohort: 'T11/25', m0: 100, m1: 91, m2: 84, m3: null, m4: null, m5: null },
          { cohort: 'T12/25', m0: 100, m1: 93, m2: null, m3: null, m4: null, m5: null },
        ]
      };

      setKpis(mockKpis);
      setGrowthData(mockGrowthData);
    } catch (error) {
      console.error('Error fetching growth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value;
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="wide">
      <PageHeader
        title={t('admin.growth.title', 'Phân tích Tăng trưởng')}
        subtitle={t('admin.growth.subtitle', 'Theo dõi KPIs và metrics tăng trưởng')}
      />

      {/* Period Selector */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{t('admin.growth.period', 'Period')}:</span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { value: 'month', label: t('admin.growth.month', 'Month') },
              { value: 'quarter', label: t('admin.growth.quarter', 'Quarter') },
              { value: 'year', label: t('admin.growth.year', 'Year') },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  period === p.value
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* User Acquisition */}
        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              kpis.userAcquisition.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {kpis.userAcquisition.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {kpis.userAcquisition.growth >= 0 ? '+' : ''}{kpis.userAcquisition.growth}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">{t('admin.growth.newUsers', 'New Users')}</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.userAcquisition.current.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">
            {t('admin.growth.previousPeriod', 'Previous Period')}: {kpis.userAcquisition.previous.toLocaleString()}
          </p>
        </Card>

        {/* Revenue */}
        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              kpis.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {kpis.revenue.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {kpis.revenue.growth >= 0 ? '+' : ''}{kpis.revenue.growth}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">{t('admin.growth.revenue', 'Revenue')}</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.revenue.current)}đ</p>
          <p className="text-xs text-gray-500 mt-1">
            {t('admin.growth.previousPeriod', 'Previous Period')}: {formatCurrency(kpis.revenue.previous)}đ
          </p>
        </Card>

        {/* Engagement */}
        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
              <Activity className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              kpis.engagement.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {kpis.engagement.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {kpis.engagement.growth >= 0 ? '+' : ''}{kpis.engagement.growth}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">{t('admin.growth.engagement', 'Engagement')}</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.engagement.current}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {t('admin.growth.previousPeriod', 'Previous Period')}: {kpis.engagement.previous}%
          </p>
        </Card>

        {/* Retention */}
        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
              <Target className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              kpis.retention.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {kpis.retention.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {kpis.retention.growth >= 0 ? '+' : ''}{kpis.retention.growth}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">{t('admin.growth.retention', 'Retention')}</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.retention.current}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {t('admin.growth.previousPeriod', 'Previous Period')}: {kpis.retention.previous}%
          </p>
        </Card>

        {/* Conversion */}
        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white">
              <Zap className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              kpis.conversion.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {kpis.conversion.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {kpis.conversion.growth >= 0 ? '+' : ''}{kpis.conversion.growth}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">{t('admin.growth.conversion', 'Conversion Rate')}</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.conversion.current}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {t('admin.growth.previousPeriod', 'Previous Period')}: {kpis.conversion.previous}%
          </p>
        </Card>

        {/* NPS */}
        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
              <Award className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              kpis.nps.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {kpis.nps.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {kpis.nps.growth >= 0 ? '+' : ''}{kpis.nps.growth}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">{t('admin.growth.npsScore', 'NPS Score')}</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.nps.current}</p>
          <p className="text-xs text-gray-500 mt-1">
            {t('admin.growth.previousPeriod', 'Previous Period')}: {kpis.nps.previous}
          </p>
        </Card>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('admin.growth.userGrowth', 'User Growth')}</h3>
              <p className="text-sm text-gray-500">{t('admin.growth.last6Months', 'Last 6 months')}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            {growthData.monthlyUsers.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-12">{item.month}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                    style={{ width: `${(item.users / 1400) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs font-medium text-white mix-blend-difference">
                      {item.users.toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-green-600 font-medium w-16">
                  +{item.new}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('admin.growth.revenueTrend', 'Revenue Trend')}</h3>
              <p className="text-sm text-gray-500">{t('admin.growth.last6Months', 'Last 6 months')}</p>
            </div>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            {growthData.revenueByMonth.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-12">{item.month}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                    style={{ width: `${(item.revenue / 600000000) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs font-medium text-white mix-blend-difference">
                      {formatCurrency(item.revenue)}đ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Acquisition Sources & User Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Sources */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('admin.growth.trafficSources', 'Traffic Sources')}</h3>
              <p className="text-sm text-gray-500">{t('admin.growth.top5Sources', 'Top 5 user sources')}</p>
            </div>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {growthData.topSources.map((source, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${source.color} rounded-lg flex items-center justify-center text-white shrink-0`}>
                  {source.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{source.source}</span>
                    <span className="text-sm text-gray-600">{source.users}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-500 w-12 text-right">
                  {source.percentage}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* User Segments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('admin.growth.userSegments', 'User Segments')}</h3>
              <p className="text-sm text-gray-500">{t('admin.growth.byServicePlan', 'By service plan')}</p>
            </div>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {growthData.userSegments.map((segment, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${
                  segment.segment === 'Free' ? 'bg-gray-400' :
                  segment.segment === 'Basic' ? 'bg-blue-500' :
                  segment.segment === 'Premium' ? 'bg-purple-500' :
                  'bg-gradient-to-br from-amber-500 to-orange-500'
                }`}>
                  {segment.segment.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{segment.segment}</p>
                  <p className="text-xs text-gray-500">
                    {segment.users.toLocaleString()} users ({segment.percentage}%)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {segment.revenue > 0 ? formatCurrency(segment.revenue) + 'đ' : '-'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cohort Retention */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cohort Retention</h3>
            <p className="text-sm text-gray-500">{t('admin.growth.cohortRetentionDesc', 'Retention rate by user cohort')}</p>
          </div>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cohort</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">M0</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">M1</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">M2</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">M3</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">M4</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">M5</th>
              </tr>
            </thead>
            <tbody>
              {growthData.cohortRetention.map((cohort, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{cohort.cohort}</td>
                  {[0, 1, 2, 3, 4, 5].map((month) => {
                    const value = cohort[`m${month}`];
                    if (value === null) {
                      return <td key={month} className="py-3 px-4 text-center text-gray-300">-</td>;
                    }
                    const color = value >= 80 ? 'bg-green-100 text-green-700' :
                                  value >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700';
                    return (
                      <td key={month} className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-sm font-medium ${color}`}>
                          {value}%
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 {t('admin.growth.insight', 'Insight')}:</strong> {t('admin.growth.insightText', 'Average retention rate of 80%+ after the first month indicates user satisfaction with the product. Focus on onboarding to improve first-month retention.')}
          </p>
        </div>
      </Card>
    </PageContainer>
  );
};

export default AdminGrowth;
