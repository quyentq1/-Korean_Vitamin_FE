import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award, CheckCircle, XCircle, Clock, Eye, FileText } from 'lucide-react';
import studentService from '../../services/studentService';
import CertificateDetailModal from '../../components/Student/CertificateDetailModal';

const CertificateView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await studentService.getCertificateSubmissions();
      setSubmissions(response?.data || response || []);
    } catch (error) {
      console.error('Error fetching certificate submissions:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING':  { text: t('student.certificates.statusPending'),  className: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
      'APPROVED': { text: t('student.certificates.statusApproved'), className: 'bg-green-100  text-green-700  border-green-300',  icon: CheckCircle },
      'REJECTED': { text: t('student.certificates.statusRejected'), className: 'bg-red-100    text-red-700    border-red-300',    icon: XCircle },
    };
    const badge = badges[status] || badges['PENDING'];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getCertificateTypeText = (type) => {
    const types = {
      'TOPIK': 'TOPIK', 'OPIc': 'OPIc', 'EPS_TOPIK': 'EPS TOPIK',
      'OTHER': t('student.certificates.other'),
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">{t('student.certificates.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('student.certificates.title')}</h1>
              <p className="text-indigo-100 text-lg">{t('student.certificates.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {submissions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <Award className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">{t('student.certificates.noSubmissions')}</h3>
            <p className="text-gray-500 mb-6">{t('student.certificates.noSubmissionsSubtext')}</p>
            <button
              onClick={() => navigate('/student/my-courses')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              {t('student.certificates.viewCourses')}
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {submissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {submission.classStudent?.classEntity?.course?.name || t('student.certificates.course')}
                      </h3>
                      {getStatusBadge(submission.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{t('student.certificates.certificateType')}: {getCertificateTypeText(submission.certificateType)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{t('student.certificates.submittedAt')}: {new Date(submission.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      {submission.classStudent?.classEntity?.className && (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          <span>{submission.classStudent.classEntity.className}</span>
                        </div>
                      )}
                    </div>

                    {submission.notes && (
                      <p className="mt-2 text-sm text-gray-600 italic">
                        {t('student.certificates.note')}: {submission.notes}
                      </p>
                    )}

                    {submission.status === 'REJECTED' && submission.reviewNote && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 font-medium">{t('student.certificates.rejectionReason')}:</p>
                        <p className="text-sm text-red-600 mt-1">{submission.reviewNote}</p>
                      </div>
                    )}
                    {submission.status === 'APPROVED' && submission.reviewNote && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">{submission.reviewNote}</p>
                      </div>
                    )}
                  </div>

                  {/* Single "Xem" button → opens detail modal */}
                  <div className="shrink-0">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="px-5 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-semibold text-sm hover:bg-indigo-100 transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {t('student.certificates.view')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate detail + edit modal */}
      <CertificateDetailModal
        isOpen={!!selectedSubmission}
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        onUpdated={() => {
          fetchSubmissions();
          setSelectedSubmission(null);
        }}
      />
    </div>
  );
};

export default CertificateView;
