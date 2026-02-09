import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Award,
  Filter,
  RefreshCw,
  Printer,
  FileSpreadsheet,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trophy,
  Star,
  Medal,
  Crown
} from 'lucide-react';

// UI Components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Section from '../../components/ui/Section';

// Charts
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Services
import teacherService from '../../services/teacherService';

const TeacherReports = () => {
  const { t } = useTranslation();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter state
  const [selectedClass, setSelectedClass] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Data state
  const [classData, setClassData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  // Export state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exporting, setExporting] = useState(false);

  // Chart colors
  const COLORS = ['#3DCBB1', '#2D3E50', '#F59E0B', '#EF4444', '#10B981', '#6366F1'];

  // Fetch data
  useEffect(() => {
    fetchReportsData();
  }, [selectedClass, dateRange, customStartDate, customEndDate]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClass !== 'all') {
        params.classId = selectedClass;
      }
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      } else {
        params.range = dateRange;
      }

      const [classRes, topRes] = await Promise.all([
        teacherService.getClassReports(params),
        teacherService.getTopStudents(params)
      ]);

      setClassData(classRes || []);

      // Add rank to students
      const rankedStudents = (topRes || []).map((s, i) => ({ ...s, rank: i + 1 }));
      setTopStudents(rankedStudents);

      // Prepare chart data
      prepareChartData(classRes || []);
      setError('');
    } catch (err) {
      console.error('Failed to load reports', err);
      setError(t('reports.fetchError', 'Lỗi khi tải báo cáo.'));
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (data) => {
    // Performance data for line chart
    const performance = data.map(cls => ({
      name: cls.name,
      avgScore: cls.avgScore || 0,
      attendance: cls.attendance || 0,
      progress: cls.progress || 0
    }));
    setPerformanceData(performance);

    // Attendance data for pie chart
    const attendance = data.map(cls => ({
      name: cls.name,
      value: cls.attendance || 0
    }));
    setAttendanceData(attendance);
  };

  // Handle export
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        format: exportFormat,
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        range: dateRange,
        startDate: customStartDate,
        endDate: customEndDate
      };

      await teacherService.exportReports(params);
      setSuccess(t('reports.exportSuccess', 'Xuất báo cáo thành công!'));
      setTimeout(() => setSuccess(''), 3000);
      setShowExportModal(false);
      setError('');
    } catch (err) {
      console.error('Failed to export', err);
      setError(t('reports.exportError', 'Lỗi khi xuất báo cáo.'));
      setSuccess('');
    } finally {
      setExporting(false);
    }
  };

  // Get rank icon
  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-500">#{rank}</span>;
  };

  if (loading) {
    return (
      <PageContainer>
        <Loading.PageLoading />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('reports.title', 'Báo Cáo Giảng Dạy')}
        subtitle={t('reports.subtitle', 'Theo dõi hiệu suất lớp học và học viên')}
        breadcrumbs={[
          { label: t('nav.home', 'Trang chủ'), href: '/' },
          { label: t('nav.teacher', 'Giáo viên'), href: '/teacher' },
          { label: t('reports.title', 'Báo cáo giảng dạy') }
        ]}
        actions={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => fetchReportsData()}
            >
              {t('common.refresh', 'Làm mới')}
            </Button>
            <Button
              variant="primary"
              icon={<Download className="w-4 h-4" />}
              onClick={() => setShowExportModal(true)}
            >
              {t('reports.export', 'Xuất báo cáo')}
            </Button>
          </div>
        }
      />

      {/* Success Alert */}
      {success && (
        <Alert
          variant="success"
          icon={<CheckCircle2 className="w-5 h-5" />}
          className="mb-6"
          dismissible
          onDismiss={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          icon={<AlertCircle className="w-5 h-5" />}
          className="mb-6"
          dismissible
          onDismiss={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">
              {t('reports.filters', 'Bộ lọc')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reports.selectClass', 'Chọn lớp')}
              </label>
              <Input
                type="select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                options={[
                  { value: 'all', label: t('reports.allClasses', 'Tất cả lớp') },
                  ...classData.map(cls => ({ value: cls.id, label: cls.name }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reports.dateRange', 'Khoảng thời gian')}
              </label>
              <Input
                type="select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={[
                  { value: 'week', label: t('reports.thisWeek', 'Tuần này') },
                  { value: 'month', label: t('reports.thisMonth', 'Tháng này') },
                  { value: 'quarter', label: t('reports.thisQuarter', 'Quý này') },
                  { value: 'year', label: t('reports.thisYear', 'Năm này') },
                  { value: 'custom', label: t('reports.custom', 'Tùy chỉnh') }
                ]}
              />
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('reports.startDate', 'Ngày bắt đầu')}
                  </label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('reports.endDate', 'Ngày kết thúc')}
                  </label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <Badge variant="success">+12%</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {classData.reduce((sum, c) => sum + (c.students || 0), 0)}
            </p>
            <p className="text-sm text-gray-500">{t('reports.totalStudents', 'Tổng học viên')}</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <Badge variant="success">+8%</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {classData.length > 0
                ? (classData.reduce((sum, c) => sum + (c.avgScore || 0), 0) / classData.length).toFixed(1)
                : 0}%
            </p>
            <p className="text-sm text-gray-500">{t('reports.avgScore', 'Điểm trung bình')}</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <Badge variant="warning">-2%</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {classData.length > 0
                ? (classData.reduce((sum, c) => sum + (c.attendance || 0), 0) / classData.length).toFixed(1)
                : 0}%
            </p>
            <p className="text-sm text-gray-500">{t('reports.avgAttendance', 'Điểm danh TB')}</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <Badge variant="success">+5%</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {classData.length > 0
                ? (classData.reduce((sum, c) => sum + (c.progress || 0), 0) / classData.length).toFixed(1)
                : 0}%
            </p>
            <p className="text-sm text-gray-500">{t('reports.avgProgress', 'Tiến độ TB')}</p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance Chart */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">
                {t('reports.performanceChart', 'Biểu đồ hiệu suất')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                icon={<MoreHorizontal className="w-4 h-4" />}
              />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#3DCBB1"
                  strokeWidth={2}
                  name={t('reports.avgScore', 'Điểm TB')}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#10B981"
                  strokeWidth={2}
                  name={t('reports.attendance', 'Điểm danh')}
                />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="#6366F1"
                  strokeWidth={2}
                  name={t('reports.progress', 'Tiến độ')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Attendance Chart */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">
                {t('reports.attendanceChart', 'Biểu đồ điểm danh')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                icon={<MoreHorizontal className="w-4 h-4" />}
              />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Class Performance Cards */}
      <Section
        title={t('reports.classPerformance', 'Hiệu Suất Lớp Học')}
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classData.map((cls, idx) => (
            <Card key={idx} className="hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{cls.name}</h4>
                    <p className="text-sm text-gray-500">
                      {cls.students} {t('reports.students', 'học viên')}
                    </p>
                  </div>
                  <Badge variant={cls.avgScore >= 80 ? 'success' : cls.avgScore >= 60 ? 'warning' : 'error'}>
                    {cls.avgScore}%
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-600">{t('reports.avgScore', 'Điểm TB')}</span>
                      <span className="font-medium text-gray-900">{cls.avgScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${cls.avgScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-600">{t('reports.attendance', 'Điểm danh')}</span>
                      <span className="font-medium text-gray-900">{cls.attendance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${cls.attendance}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-600">{t('reports.progress', 'Tiến độ')}</span>
                      <span className="font-medium text-gray-900">{cls.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${cls.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Top Students */}
      <Section
        title={t('reports.topStudents', 'Học Viên Xuất Sắc')}
        className="mb-6"
      >
        <Card>
          <div className="p-6">
            <div className="space-y-3">
              {topStudents.map((student) => (
                <div
                  key={student.rank}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${student.rank <= 3
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                      : 'bg-white border-gray-200'
                    }`}
                >
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(student.rank)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {student.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {student.className} • {student.testsCompleted} {t('reports.tests', 'bài test')}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {student.score}%
                    </div>
                    <p className="text-xs text-gray-500">{t('reports.avgScore', 'Điểm TB')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Section>

      {/* Export Modal */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          size="md"
          title={t('reports.exportModal', 'Xuất Báo Cáo')}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t('reports.exportModalInfo', 'Chọn định dạng file để xuất báo cáo:')}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setExportFormat('pdf')}
                className={`p-4 rounded-lg border-2 text-left transition ${exportFormat === 'pdf'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                  }`}
              >
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="font-medium text-gray-900 text-center">PDF</p>
                <p className="text-xs text-gray-500 text-center">
                  {t('reports.pdfDesc', 'Tài liệu in ấn')}
                </p>
              </button>

              <button
                onClick={() => setExportFormat('excel')}
                className={`p-4 rounded-lg border-2 text-left transition ${exportFormat === 'excel'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                  }`}
              >
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="font-medium text-gray-900 text-center">Excel</p>
                <p className="text-xs text-gray-500 text-center">
                  {t('reports.excelDesc', 'Dữ liệu có thể chỉnh sửa')}
                </p>
              </button>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowExportModal(false)}
              >
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                icon={<Download className="w-4 h-4" />}
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <Loading.Spinner size="sm" />
                    {t('reports.exporting', 'Đang xuất...')}
                  </>
                ) : (
                  t('reports.export', 'Xuất báo cáo')
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default TeacherReports;
