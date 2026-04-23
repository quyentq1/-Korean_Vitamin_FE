import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Award, CheckCircle2, XCircle, Clock, Eye, FileText, Search } from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import educationManagerService from '../../services/educationManagerService';

const CertificateApproval = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await educationManagerService.getCertificates();
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = submissions.filter(s => {
    const matchesTab = activeTab === 'ALL' || s.status === activeTab;
    const matchesSearch = !searchTerm ||
      (s.student?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.classStudent?.classEntity?.course?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    PENDING: submissions.filter(s => s.status === 'PENDING').length,
    APPROVED: submissions.filter(s => s.status === 'APPROVED').length,
    REJECTED: submissions.filter(s => s.status === 'REJECTED').length,
    ALL: submissions.length,
  };

  const handleApprove = async (submission) => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Duyệt chứng chỉ',
      html: `Duyệt chứng chỉ của <strong>${submission.student?.fullName}</strong>?<br/>Khóa học sẽ được đánh dấu <strong>HOÀN THÀNH</strong>.`,
      showCancelButton: true,
      confirmButtonText: 'Duyệt',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await educationManagerService.approveCertificate(submission.id);
      await Swal.fire({ icon: 'success', title: 'Đã duyệt!', text: 'Chứng chỉ đã được phê duyệt. Khóa học hoàn thành.', confirmButtonColor: '#22c55e', timer: 2000, timerProgressBar: true, showConfirmButton: false });
      fetchSubmissions();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: err.response?.data?.message || 'Không thể duyệt.', confirmButtonColor: '#ef4444' });
    }
  };

  const handleReject = async (submission) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Từ chối chứng chỉ',
      input: 'textarea',
      inputLabel: 'Lý do từ chối',
      inputPlaceholder: 'Nhập lý do...',
      showCancelButton: true,
      confirmButtonText: 'Từ chối',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      inputValidator: (value) => !value && 'Vui lòng nhập lý do',
    });

    if (!result.isConfirmed) return;

    try {
      await educationManagerService.rejectCertificate(submission.id, result.value);
      await Swal.fire({ icon: 'success', title: 'Đã từ chối', confirmButtonColor: '#22c55e', timer: 2000, timerProgressBar: true, showConfirmButton: false });
      fetchSubmissions();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: err.response?.data?.message || 'Không thể từ chối.', confirmButtonColor: '#ef4444' });
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { variant: 'warning', icon: <Clock className="w-3 h-3" />, text: 'Chờ duyệt' },
      APPROVED: { variant: 'success', icon: <CheckCircle2 className="w-3 h-3" />, text: 'Đã duyệt' },
      REJECTED: { variant: 'danger', icon: <XCircle className="w-3 h-3" />, text: 'Từ chối' },
    };
    const c = config[status] || config.PENDING;
    return <Badge variant={c.variant} size="sm" className="flex items-center gap-1">{c.icon}{c.text}</Badge>;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Duyệt Chứng Chỉ"
        subtitle="Học viên nộp chứng chỉ TOPIK/OPIc/EPS — duyệt để hoàn thành khóa"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Education Manager', href: '/edu-manager' },
          { label: 'Duyệt chứng chỉ' },
        ]}
      />

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px gap-2">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'PENDING' ? 'Chờ duyệt' : tab === 'APPROVED' ? 'Đã duyệt' : tab === 'REJECTED' ? 'Từ chối' : 'Tất cả'}
              {counts[tab] > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo tên học viên hoặc khóa học..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center"><Loading.PageLoading /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không có chứng chỉ nào.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(sub => (
            <Card key={sub.id}>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-lg">{sub.student?.fullName || 'Học viên'}</h3>
                      {getStatusBadge(sub.status)}
                      <Badge variant="secondary" size="sm">{sub.certificateType || 'OTHER'}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {sub.classStudent?.classEntity?.course?.name || '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>{sub.classStudent?.classEntity?.className || '—'}</span>
                      </span>
                      <span>{new Date(sub.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    {sub.notes && (
                      <p className="mt-2 text-sm text-gray-500 italic">"{sub.notes}"</p>
                    )}

                    {sub.reviewNote && (
                      <p className="mt-1 text-sm text-red-600">Lý do từ chối: {sub.reviewNote}</p>
                    )}

                    {/* Certificate preview */}
                    {sub.certificateUrl && (
                      <button
                        onClick={() => setPreviewUrl(sub.certificateUrl)}
                        className="mt-3 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Xem chứng chỉ
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  {sub.status === 'PENDING' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="primary" size="sm" icon={<CheckCircle2 className="w-4 h-4" />} onClick={() => handleApprove(sub)}>
                        Duyệt
                      </Button>
                      <Button variant="danger" size="sm" icon={<XCircle className="w-4 h-4" />} onClick={() => handleReject(sub)}>
                        Từ chối
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Image preview modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[1500] bg-black/70 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-xl max-w-3xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-3 flex justify-between items-center border-b">
              <span className="font-semibold text-gray-700">Xem chứng chỉ</span>
              <button onClick={() => setPreviewUrl(null)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4">
              {previewUrl.endsWith('.pdf') ? (
                <iframe src={previewUrl} className="w-full h-[70vh]" title="Certificate PDF" />
              ) : (
                <img src={previewUrl} alt="Certificate" className="max-w-full rounded-lg" />
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default CertificateApproval;
