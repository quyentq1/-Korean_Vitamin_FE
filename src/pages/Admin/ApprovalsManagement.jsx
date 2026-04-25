import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  GraduationCap,
  FileText,
  Calendar,
  Search,
  Filter,
  Eye,
  Mail,
  Shield,
  AlertCircle
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Badge
} from '../../components/ui';
import Swal from 'sweetalert2';

/**
 * ApprovalsManagement - Admin Approvals Management
 */
const ApprovalsManagement = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, [filterType, filterStatus]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      // TODO: Call actual API
      // const data = await adminService.getApprovals(filterType, filterStatus);

      // Mock data
      const mockApprovals = [
        {
          id: 1,
          type: 'TEACHER_REGISTRATION',
          typeLabel: t('admin.approvals.teacherRegistration', 'Teacher Registration'),
          applicant: {
            id: 101,
            fullName: 'Choi Soo Young',
            email: 'choi.sooyoung@email.com',
            phone: '0901234570',
            avatar: 'C'
          },
          data: {
            specialization: t('admin.approvals.specialization', 'Reading, Writing'),
            experience: 2,
            qualifications: [t('admin.approvals.topikLevel5', 'TOPIK Level 5 Certificate')],
            bio: t('admin.approvals.bio1', 'Enthusiastic young lecturer.'),
            cvFile: 'cv_choi_sooyoung.pdf'
          },
          status: 'PENDING',
          submittedAt: '2026-03-22T10:30:00',
          notes: ''
        },
        {
          id: 2,
          type: 'TEACHER_REGISTRATION',
          typeLabel: t('admin.approvals.teacherRegistration', 'Teacher Registration'),
          applicant: {
            id: 102,
            fullName: 'Jung Hae In',
            email: 'jung.haein@email.com',
            phone: '0901234571',
            avatar: 'J'
          },
          data: {
            specialization: t('admin.approvals.specialization2', 'Listening, Speaking'),
            experience: 4,
            qualifications: [t('admin.approvals.masterKorean', 'Master of Korean Language'), t('admin.approvals.topikLevel6', 'TOPIK Level 6 Certificate')],
            bio: t('admin.approvals.bio2', 'Lecturer specializing in communication skills.'),
            cvFile: 'cv_jung_haein.pdf'
          },
          status: 'PENDING',
          submittedAt: '2026-03-21T15:20:00',
          notes: ''
        },
        {
          id: 3,
          type: 'COURSE_CREATION',
          typeLabel: t('admin.approvals.courseCreation', 'Course Creation'),
          applicant: {
            id: 2,
            fullName: 'Lee Su Jin',
            email: 'lee.sujin@koreanvitamin.com',
            phone: '0901234568',
            avatar: 'L'
          },
          data: {
            courseName: t('admin.approvals.koreanConversation3', 'Korean Conversation 3'),
            level: 'INTERMEDIATE',
            duration: 12,
            price: 2500000,
            description: t('admin.approvals.courseDesc', 'Advanced course for workplace communication skills.'),
            syllabusFile: 'syllabus_giaothiep3.pdf'
          },
          status: 'PENDING',
          submittedAt: '2026-03-20T09:15:00',
          notes: ''
        },
        {
          id: 4,
          type: 'STUDENT_REFUND',
          typeLabel: t('admin.approvals.studentRefund', 'Student Refund'),
          applicant: {
            id: 201,
            fullName: 'Nguyen Van A',
            email: 'student.a@email.com',
            phone: '0912345678',
            avatar: 'N'
          },
          data: {
            courseId: 5,
            courseName: t('admin.approvals.basicKorean', 'Basic Korean'),
            enrollmentDate: '2026-03-01',
            reason: t('admin.approvals.refundReason', 'Personal reasons, unable to continue.'),
            refundAmount: 1500000,
            paymentMethod: t('admin.approvals.bankTransfer', 'Bank Transfer')
          },
          status: 'REJECTED',
          submittedAt: '2026-03-19T14:00:00',
          notes: t('admin.approvals.rejectionNote', 'Over 50% of course completed, not eligible for refund per policy.'),
          reviewedBy: 'Admin',
          reviewedAt: '2026-03-20T10:00:00'
        },
        {
          id: 5,
          type: 'TEACHER_REGISTRATION',
          typeLabel: t('admin.approvals.teacherRegistration', 'Teacher Registration'),
          applicant: {
            id: 103,
            fullName: 'Kim Go Eun',
            email: 'kim.goeun@email.com',
            phone: '0901234572',
            avatar: 'K'
          },
          data: {
            specialization: 'TOPIK I, TOPIK II',
            experience: 6,
            qualifications: [t('admin.approvals.phdKorean', 'PhD in Korean Language'), t('admin.approvals.topikLevel6', 'TOPIK Level 6 Certificate')],
            bio: t('admin.approvals.bio3', 'Senior lecturer with many years of experience.'),
            cvFile: 'cv_kim_goeun.pdf'
          },
          status: 'APPROVED',
          submittedAt: '2026-03-18T11:00:00',
          notes: t('admin.approvals.approvalNote', 'Meets requirements, registration approved.'),
          reviewedBy: 'Admin',
          reviewedAt: '2026-03-19T09:00:00'
        }
      ];

      let filtered = mockApprovals;

      if (filterType !== 'ALL') {
        filtered = filtered.filter(a => a.type === filterType);
      }

      if (filterStatus !== 'ALL') {
        filtered = filtered.filter(a => a.status === filterStatus);
      }

      setApprovals(filtered);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId) => {
    const result = await Swal.fire({
      icon: 'question',
      title: t('admin.approvals.confirmApproveTitle', 'Confirm Approval'),
      text: t('admin.approvals.confirmApproveText', 'Are you sure you want to approve this request?'),
      showCancelButton: true,
      confirmButtonText: t('admin.approvals.approve', 'Approve'),
      cancelButtonText: t('common.cancel', 'Cancel'),
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#667eea',
    });

    if (result.isConfirmed) {
      try {
        // TODO: Call actual API
        // await adminService.approveRequest(approvalId);

        Swal.fire({
          icon: 'success',
          title: t('admin.approvals.approved', 'Approved'),
          text: t('admin.approvals.approvedText', 'Request has been approved successfully'),
          confirmButtonColor: '#22c55e',
        });

        fetchApprovals();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: t('common.error', 'Error'),
          text: t('admin.approvals.approveError', 'Unable to approve request'),
          confirmButtonColor: '#d33',
        });
      }
    }
  };

  const handleReject = async (approvalId) => {
    const { value: reason } = await Swal.fire({
      icon: 'warning',
      title: t('admin.approvals.rejectTitle', 'Reject Request'),
      text: t('admin.approvals.rejectReasonPrompt', 'Please enter the reason for rejection:'),
      input: 'textarea',
      inputPlaceholder: t('admin.approvals.enterReason', 'Enter reason...'),
      showCancelButton: true,
      confirmButtonText: t('admin.approvals.reject', 'Reject'),
      cancelButtonText: t('common.cancel', 'Cancel'),
      confirmButtonColor: '#d33',
      cancelButtonColor: '#667eea',
      inputValidator: (value) => {
        if (!value) {
          return t('admin.approvals.rejectReasonRequired', 'Please enter a reason for rejection!');
        }
      }
    });

    if (reason) {
      try {
        // TODO: Call actual API
        // await adminService.rejectRequest(approvalId, reason);

        Swal.fire({
          icon: 'success',
          title: t('admin.approvals.rejected', 'Rejected'),
          text: t('admin.approvals.rejectedText', 'Request has been rejected'),
          confirmButtonColor: '#667eea',
        });

        fetchApprovals();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: t('common.error', 'Error'),
          text: t('admin.approvals.rejectError', 'Unable to reject request'),
          confirmButtonColor: '#d33',
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" size="sm">⏳ {t('admin.approvals.pending', 'Pending')}</Badge>;
      case 'APPROVED':
        return <Badge variant="success" size="sm">✅ {t('admin.approvals.approved', 'Approved')}</Badge>;
      case 'REJECTED':
        return <Badge variant="error" size="sm">❌ {t('admin.approvals.rejected', 'Rejected')}</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'TEACHER_REGISTRATION':
        return <GraduationCap className="w-5 h-5 text-indigo-600" />;
      case 'COURSE_CREATION':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'STUDENT_REFUND':
        return <Shield className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch =
      approval.applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.typeLabel.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

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
        title={t('admin.approvals.title', 'Approval Management')}
        subtitle={t('admin.approvals.subtitle', 'Process pending approval requests')}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">{t('admin.approvals.pending', 'Pending')}</p>
              <p className="text-3xl font-bold mt-1">{approvals.filter(a => a.status === 'PENDING').length}</p>
            </div>
            <Clock className="w-12 h-12 text-amber-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">{t('admin.approvals.approved', 'Approved')}</p>
              <p className="text-3xl font-bold mt-1">{approvals.filter(a => a.status === 'APPROVED').length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">{t('admin.approvals.rejected', 'Rejected')}</p>
              <p className="text-3xl font-bold mt-1">{approvals.filter(a => a.status === 'REJECTED').length}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('admin.approvals.totalRequests', 'Total Requests')}</p>
              <p className="text-3xl font-bold mt-1">{approvals.length}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-200" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.approvals.searchPlaceholder', 'Search requests...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">{t('admin.approvals.allTypes', 'All Types')}</option>
              <option value="TEACHER_REGISTRATION">{t('admin.approvals.teacherRegistration', 'Teacher Registration')}</option>
              <option value="COURSE_CREATION">{t('admin.approvals.courseCreation', 'Course Creation')}</option>
              <option value="STUDENT_REFUND">{t('admin.approvals.studentRefund', 'Refund')}</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">{t('admin.approvals.allStatuses', 'All Statuses')}</option>
              <option value="PENDING">{t('admin.approvals.pending', 'Pending')}</option>
              <option value="APPROVED">{t('admin.approvals.approved', 'Approved')}</option>
              <option value="REJECTED">{t('admin.approvals.rejected', 'Rejected')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <Card
            key={approval.id}
            className={`hover:shadow-lg transition-all duration-300 ${
              approval.status === 'PENDING' ? 'border-l-4 border-l-amber-500' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  approval.type === 'TEACHER_REGISTRATION' ? 'bg-indigo-100' :
                  approval.type === 'COURSE_CREATION' ? 'bg-green-100' :
                  'bg-amber-100'
                }`}>
                  {getTypeIcon(approval.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{approval.typeLabel}</h3>
                        {getStatusBadge(approval.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {t('admin.approvals.requestCode', 'Request ID')}: #{approval.id}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(approval.submittedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  {/* Applicant Info */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {approval.applicant.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{approval.applicant.fullName}</p>
                      <p className="text-xs text-gray-600">{approval.applicant.email}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    {approval.type === 'TEACHER_REGISTRATION' && (
                      <>
                        <div>
                          <span className="text-gray-500">{t('admin.approvals.specialization', 'Specialization')}:</span>
                          <span className="ml-2 font-medium text-gray-900">{approval.data.specialization}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('admin.approvals.experience', 'Experience')}:</span>
                          <span className="ml-2 font-medium text-gray-900">{approval.data.experience} {t('admin.approvals.years', 'years')}</span>
                        </div>
                      </>
                    )}
                    {approval.type === 'COURSE_CREATION' && (
                      <>
                        <div>
                          <span className="text-gray-500">{t('admin.approvals.courseName', 'Course Name')}:</span>
                          <span className="ml-2 font-medium text-gray-900">{approval.data.courseName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('admin.approvals.duration', 'Duration')}:</span>
                          <span className="ml-2 font-medium text-gray-900">{approval.data.duration} {t('admin.approvals.weeks', 'weeks')}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('admin.approvals.level', 'Level')}:</span>
                          <span className="ml-2 font-medium text-gray-900">{approval.data.level}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('admin.approvals.tuitionFee', 'Tuition Fee')}:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {approval.data.price.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </>
                    )}
                    {approval.type === 'STUDENT_REFUND' && (
                      <>
                        <div>
                          <span className="text-gray-500">{t('admin.approvals.course', 'Course')}:</span>
                          <span className="ml-2 font-medium text-gray-900">{approval.data.courseName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('admin.approvals.refundAmount', 'Refund Amount')}:</span>
                          <span className="ml-2 font-medium text-red-600">
                            {approval.data.refundAmount.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Notes */}
                  {approval.notes && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-amber-800 font-medium">{t('admin.approvals.notes', 'Notes')}:</p>
                          <p className="text-sm text-amber-700">{approval.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      {approval.status === 'PENDING' ? (
                        <span>⏳ {t('admin.approvals.awaitingProcess', 'Awaiting Process')}</span>
                      ) : (
                        <span>
                          {t('admin.approvals.processedBy', 'Processed by')} {approval.reviewedBy} {t('common.on', 'on')} {new Date(approval.reviewedAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedApproval(approval);
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t('admin.approvals.details', 'Details')}
                      </Button>

                      {approval.status === 'PENDING' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(approval.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t('admin.approvals.approve', 'Approve')}
                          </Button>
                          <Button
                            variant="error"
                            size="sm"
                            onClick={() => handleReject(approval.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            {t('admin.approvals.reject', 'Reject')}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredApprovals.length === 0 && (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{t('admin.approvals.noRequests', 'No requests found')}</p>
          <p className="text-gray-400 text-sm mt-2">{t('admin.approvals.tryChangeFilters', 'Try changing filters to see other requests')}</p>
        </Card>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{t('admin.approvals.requestDetails', 'Request Details')}</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Type & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(selectedApproval.type)}
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedApproval.typeLabel}</h4>
                    <p className="text-sm text-gray-600">{t('admin.approvals.code', 'Code')}: #{selectedApproval.id}</p>
                  </div>
                </div>
                {getStatusBadge(selectedApproval.status)}
              </div>

              {/* Applicant */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-3">{t('admin.approvals.applicant', 'Applicant')}</h5>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedApproval.applicant.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedApproval.applicant.fullName}</p>
                    <p className="text-sm text-gray-600">{selectedApproval.applicant.email}</p>
                    <p className="text-sm text-gray-600">{selectedApproval.applicant.phone}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">{t('admin.approvals.detailedInfo', 'Detailed Information')}</h5>
                <div className="space-y-2 text-sm">
                  {Object.entries(selectedApproval.data).map(([key, value]) => {
                    if (key === 'cvFile' || key === 'syllabusFile') return null;
                    return (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500 capitalize">
                          {key === 'courseName' ? t('admin.approvals.courseName', 'Course Name') :
                           key === 'specialization' ? t('admin.approvals.specialization', 'Specialization') :
                           key === 'experience' ? t('admin.approvals.experience', 'Experience') :
                           key === 'duration' ? t('admin.approvals.duration', 'Duration') :
                           key === 'price' ? t('admin.approvals.tuitionFee', 'Tuition Fee') :
                           key === 'refundAmount' ? t('admin.approvals.refundAmount', 'Refund Amount') :
                           key === 'reason' ? t('admin.approvals.reason', 'Reason') :
                           key}
                        </span>
                        <span className="font-medium text-gray-900 text-right">
                          {key === 'price' || key === 'refundAmount'
                            ? `${value.toLocaleString('vi-VN')}đ`
                            : typeof value === 'object'
                            ? value.join(', ')
                            : value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attachments */}
              {(selectedApproval.data.cvFile || selectedApproval.data.syllabusFile) && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">{t('admin.approvals.attachments', 'Attachments')}</h5>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {selectedApproval.data.cvFile || selectedApproval.data.syllabusFile}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedApproval.notes && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h5 className="font-semibold text-amber-900 mb-2">{t('admin.approvals.notes', 'Notes')}</h5>
                  <p className="text-sm text-amber-800">{selectedApproval.notes}</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">{t('admin.approvals.timeline', 'Timeline')}</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{t('admin.approvals.submittedDate', 'Submitted')}: {new Date(selectedApproval.submittedAt).toLocaleString('vi-VN')}</span>
                  </div>
                  {selectedApproval.reviewedAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>
                        {t('admin.approvals.processedDate', 'Processed')}: {new Date(selectedApproval.reviewedAt).toLocaleString('vi-VN')} {t('common.by', 'by')} {selectedApproval.reviewedBy}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                {t('common.close', 'Close')}
              </Button>
              {selectedApproval.status === 'PENDING' && (
                <div className="flex gap-2">
                  <Button
                    variant="error"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleReject(selectedApproval.id);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {t('admin.approvals.reject', 'Reject')}
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleApprove(selectedApproval.id);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('admin.approvals.approve', 'Approve')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ApprovalsManagement;
