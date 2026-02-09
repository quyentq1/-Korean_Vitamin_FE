import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, TrendingUp } from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import { Card, StatsCard } from '../../components/ui/Card';
import teacherService from '../../services/teacherService';

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalExams: 0,
    totalQuestions: 0,
    pendingGrading: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch data from services
      const [exams, questions, grading] = await Promise.all([
        teacherService.getExams().catch(() => ({ data: [] })),
        teacherService.getQuestions().catch(() => ({ data: [] })),
        teacherService.getPendingGrading().catch(() => [])
      ]);

      setStats({
        totalExams: exams.data?.length || 0,
        totalQuestions: questions.data?.length || 0,
        pendingGrading: grading.length || 0,
        totalStudents: 0 // This would come from a students endpoint
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: t('teacherDashboard.createExam'),
      description: t('teacherDashboard.createExamDesc'),
      icon: FileText,
      onClick: () => navigate('/exam-management'),
      color: 'primary'
    },
    {
      title: t('teacherDashboard.manageQuestions'),
      description: t('teacherDashboard.manageQuestionsDesc'),
      icon: BookOpen,
      onClick: () => navigate('/question-bank'),
      color: 'secondary'
    },
    {
      title: t('teacherDashboard.gradeSubmissions'),
      description: t('teacherDashboard.gradeSubmissionsDesc'),
      icon: Users,
      onClick: () => navigate('/grading-queue'),
      color: 'success'
    },
    {
      title: t('teacherDashboard.viewReports'),
      description: t('teacherDashboard.viewReportsDesc'),
      icon: TrendingUp,
      onClick: () => navigate('/teacher-reports'),
      color: 'warning'
    }
  ];

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('teacherDashboard.title')}
        subtitle={t('teacherDashboard.subtitle')}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title={t('teacherDashboard.totalExams')}
          value={stats.totalExams}
          icon={FileText}
          color="primary"
        />
        <StatsCard
          title={t('teacherDashboard.totalQuestions')}
          value={stats.totalQuestions}
          icon={BookOpen}
          color="secondary"
        />
        <StatsCard
          title={t('teacherDashboard.pendingGrading')}
          value={stats.pendingGrading}
          icon={Users}
          color="warning"
        />
        <StatsCard
          title={t('teacherDashboard.totalStudents')}
          value={stats.totalStudents}
          icon={TrendingUp}
          color="success"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t('teacherDashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              hover={true}
              className="cursor-pointer"
              onClick={action.onClick}
            >
              <div className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  action.color === 'primary' ? 'bg-primary-100 text-primary-600' :
                  action.color === 'secondary' ? 'bg-gray-100 text-gray-600' :
                  action.color === 'success' ? 'bg-green-100 text-green-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t('teacherDashboard.recentActivity')}
        </h2>
        <div className="text-center py-8 text-gray-500">
          <p>{t('teacherDashboard.noRecentActivity')}</p>
        </div>
      </Card>
    </PageContainer>
  );
};

export default TeacherDashboard;
