import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import {
  Award, CheckCircle2, XCircle, Clock, Eye, FileText,
  Search, X, User, BookOpen, CalendarDays, MessageSquare,
  ExternalLink, ChevronRight, AlertTriangle, BadgeCheck,
} from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import educationManagerService from '../../services/educationManagerService';

/* ─── helpers ─── */
const isImage = (url = '') => /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url) || url.includes('/image/upload/');
const isPdf   = (url = '') => /\.pdf(\?|$)/i.test(url) || url.includes('/raw/upload/');

const STATUS_CONFIG = {
  PENDING:  { cls: 'bg-amber-100 text-amber-700 border-amber-300',  Icon: Clock },
  APPROVED: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', Icon: BadgeCheck },
  REJECTED: { cls: 'bg-red-100 text-red-700 border-red-300',        Icon: XCircle },
};

const getStatusLabel = (status, t) => {
  switch (status) {
    case 'PENDING': return t('eduManager.certificateApproval.statusPending');
    case 'APPROVED': return t('eduManager.certificateApproval.statusApproved');
    case 'REJECTED': return t('eduManager.certificateApproval.statusRejected');
    default: return status;
  }
};

const getCertLabel = (type, t) => {
  const map = { TOPIK: 'TOPIK', OPIc: 'OPIc', EPS_TOPIK: 'EPS-TOPIK', OTHER: t('eduManager.certificateApproval.other') };
  return map[type] || type;
};

/* ─── Certificate Detail Modal ─── */
const CertDetailModal = ({ sub, onClose, onApprove, onReject }) => {
  const { t } = useTranslation();
  if (!sub) return null;
  const st = STATUS_CONFIG[sub.status] || STATUS_CONFIG.PENDING;
  const St = st.Icon;
  const fileUrl = sub.certificateUrl || '';

  return (
    <div className="fixed inset-0 z-[2000] flex items-stretch bg-black/70 backdrop-blur-sm">
      {/* Overlay close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal panel */}
      <div
        className="relative ml-auto flex flex-col lg:flex-row w-full max-w-5xl bg-white shadow-2xl overflow-hidden"
        style={{ animation: 'slideInRight .25s cubic-bezier(.4,0,.2,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── LEFT PANEL ── */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col bg-gradient-to-b from-indigo-700 via-purple-700 to-indigo-800 text-white">

          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-200" />
                <span className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">{t('eduManager.certificateApproval.certificate')}</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/15 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student avatar + name */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                {(sub.student?.fullName || 'S')[0]}
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">{sub.student?.fullName || t('eduManager.certificateApproval.student')}</p>
                <p className="text-indigo-200 text-xs">{sub.student?.email || ''}</p>
              </div>
            </div>
          </div>

          {/* Info list */}
          <div className="p-6 space-y-4 flex-1">
            <InfoRow icon={BookOpen} label={t('eduManager.certificateApproval.course')} value={sub.classStudent?.classEntity?.course?.name || '—'} />
            <InfoRow icon={CalendarDays} label={t('eduManager.certificateApproval.class')} value={sub.classStudent?.classEntity?.className || '—'} />
            <InfoRow icon={FileText} label={t('eduManager.certificateApproval.certType')} value={getCertLabel(sub.certificateType, t)} />
            <InfoRow icon={CalendarDays} label={t('eduManager.certificateApproval.submittedAt')} value={new Date(sub.createdAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })} />

            {/* Status badge */}
            <div className="pt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-white/10 border-white/20 text-white`}>
                <St className="w-3.5 h-3.5" /> {getStatusLabel(sub.status, t)}
              </span>
            </div>

            {/* Notes */}
            {sub.notes && (
              <div className="bg-white/10 rounded-xl p-3 text-sm text-indigo-100 italic">
                <MessageSquare className="w-3.5 h-3.5 inline mr-1 opacity-70" />
                "{sub.notes}"
              </div>
            )}

            {/* Review note (rejected) */}
            {sub.reviewNote && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-sm text-red-100">
                <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                {sub.reviewNote}
              </div>
            )}
          </div>

          {/* Actions */}
          {sub.status === 'PENDING' && (
            <div className="p-6 border-t border-white/10 space-y-3">
              <button
                onClick={() => onApprove(sub)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-900/30"
              >
                <CheckCircle2 className="w-4 h-4" /> {t('eduManager.certificateApproval.approveBtn')}
              </button>
              <button
                onClick={() => onReject(sub)}
                className="w-full py-3 bg-white/10 hover:bg-red-500/70 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition border border-white/20"
              >
                <XCircle className="w-4 h-4" /> {t('eduManager.certificateApproval.rejectBtn')}
              </button>
            </div>
          )}

          {sub.status !== 'PENDING' && (
            <div className="p-6 border-t border-white/10">
              <button
                onClick={onClose}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition"
              >
                {t('common.close')}
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL — Preview ── */}
        <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
          <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <p className="font-semibold text-gray-800 text-sm">{t('eduManager.certificateApproval.viewCert')}</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> {t('eduManager.certificateApproval.openNewTab')}
            </a>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {!fileUrl ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                <FileText className="w-16 h-16 opacity-30" />
                <p>{t('eduManager.certificateApproval.noCertFile')}</p>
              </div>
            ) : isImage(fileUrl) ? (
              <img
                src={fileUrl}
                alt="certificate"
                className="w-full max-w-2xl mx-auto rounded-xl shadow-lg object-contain border border-gray-200"
              />
            ) : isPdf(fileUrl) ? (
              <iframe
                src={fileUrl}
                title="certificate-pdf"
                className="w-full rounded-xl border border-gray-200 shadow"
                style={{ height: '75vh' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                <FileText className="w-14 h-14 opacity-30" />
                <p className="text-sm">{t('eduManager.certificateApproval.cannotPreview')}</p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 transition"
                >
                  <ExternalLink className="w-4 h-4" /> {t('eduManager.certificateApproval.openFile')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <Icon className="w-4 h-4 text-indigo-300 mt-0.5 shrink-0" />
    <div>
      <p className="text-indigo-300 text-xs">{label}</p>
      <p className="text-white text-sm font-medium leading-snug">{value}</p>
    </div>
  </div>
);

/* ─── Main Page ─── */
const CertificateApproval = () => {
  const { t } = useTranslation();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await educationManagerService.getCertificates();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = submissions.filter(s => {
    const matchTab    = activeTab === 'ALL' || s.status === activeTab;
    const matchSearch = !searchTerm ||
      (s.student?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.classStudent?.classEntity?.course?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    PENDING:  submissions.filter(s => s.status === 'PENDING').length,
    APPROVED: submissions.filter(s => s.status === 'APPROVED').length,
    REJECTED: submissions.filter(s => s.status === 'REJECTED').length,
    ALL:      submissions.length,
  };

  const handleApprove = async (sub) => {
    const res = await Swal.fire({
      icon: 'question',
      title: t('eduManager.certificateApproval.approveTitle'),
      html: `${t('eduManager.certificateApproval.approveHtml', { name: sub.student?.fullName })}`,
      showCancelButton: true,
      confirmButtonText: t('eduManager.certificateApproval.approveBtn'), cancelButtonText: t('common.cancel'),
      confirmButtonColor: '#22c55e', cancelButtonColor: '#6b7280', reverseButtons: true,
    });
    if (!res.isConfirmed) return;
    try {
      await educationManagerService.approveCertificate(sub.id);
      await Swal.fire({ icon: 'success', title: t('eduManager.certificateApproval.approved'), timer: 1800, showConfirmButton: false, timerProgressBar: true });
      setSelectedSub(null);
      fetchSubmissions();
    } catch (err) {
      Swal.fire({ icon: 'error', title: t('common.error'), text: err?.message || t('eduManager.certificateApproval.cannotApprove'), confirmButtonColor: '#ef4444' });
    }
  };

  const handleReject = async (sub) => {
    const res = await Swal.fire({
      icon: 'warning', title: t('eduManager.certificateApproval.rejectTitle'),
      input: 'textarea', inputLabel: t('eduManager.certificateApproval.rejectReason'), inputPlaceholder: t('eduManager.certificateApproval.rejectReasonPlaceholder'),
      showCancelButton: true, confirmButtonText: t('eduManager.certificateApproval.rejectBtn'), cancelButtonText: t('common.cancel'),
      confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280',
      inputValidator: v => !v && t('eduManager.certificateApproval.rejectReasonRequired'),
    });
    if (!res.isConfirmed) return;
    try {
      await educationManagerService.rejectCertificate(sub.id, res.value);
      await Swal.fire({ icon: 'success', title: t('eduManager.certificateApproval.rejected'), timer: 1800, showConfirmButton: false, timerProgressBar: true });
      setSelectedSub(null);
      fetchSubmissions();
    } catch (err) {
      Swal.fire({ icon: 'error', title: t('common.error'), text: err?.message || t('eduManager.certificateApproval.cannotReject'), confirmButtonColor: '#ef4444' });
    }
  };

  const TABS = [
    { key: 'PENDING', label: t('eduManager.certificateApproval.pending'), color: 'text-amber-600 border-amber-500' },
    { key: 'APPROVED', label: t('eduManager.certificateApproval.approved'), color: 'text-emerald-600 border-emerald-500' },
    { key: 'REJECTED', label: t('eduManager.certificateApproval.rejected'), color: 'text-red-600 border-red-500' },
    { key: 'ALL', label: t('eduManager.certificateApproval.all'), color: 'text-indigo-600 border-indigo-500' },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t('eduManager.certificateApproval.title')}
        subtitle={t('eduManager.certificateApproval.subtitle')}
        breadcrumbs={[
          { label: t('common.home'), href: '/' },
          { label: 'Education Manager', href: '/edu-manager' },
          { label: t('eduManager.certificateApproval.title') },
        ]}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: t('eduManager.certificateApproval.pending'), count: counts.PENDING,  bg: 'from-amber-50 to-orange-50',   border: 'border-amber-200',   text: 'text-amber-700',   icon: Clock },
          { label: t('eduManager.certificateApproval.approved'),  count: counts.APPROVED, bg: 'from-emerald-50 to-green-50',  border: 'border-emerald-200', text: 'text-emerald-700', icon: BadgeCheck },
          { label: t('eduManager.certificateApproval.rejected'),   count: counts.REJECTED, bg: 'from-red-50 to-rose-50',       border: 'border-red-200',     text: 'text-red-700',     icon: XCircle },
          { label: t('eduManager.certificateApproval.all'), count: counts.ALL,      bg: 'from-indigo-50 to-purple-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  icon: Award },
        ].map(({ label, count, bg, border, text, icon: Icon }) => (
          <div key={label} className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl p-4 flex items-center gap-3`}>
            <div className={`p-2 rounded-xl bg-white/70 ${text}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${text}`}>{count}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-4 flex-wrap gap-3">
          <nav className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? `bg-indigo-600 text-white shadow-sm`
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                {counts[tab.key] > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {counts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('eduManager.certificateApproval.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          {loading ? (
            <div className="p-16 flex justify-center"><Loading.PageLoading /></div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Award className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Không có chứng chỉ nào</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-t border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left font-semibold">Học viên</th>
                  <th className="px-6 py-3 text-left font-semibold">Khóa / Lớp</th>
                  <th className="px-6 py-3 text-left font-semibold">Loại CK</th>
                  <th className="px-6 py-3 text-left font-semibold">Ngày nộp</th>
                  <th className="px-6 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-6 py-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(sub => {
                  const st = STATUS[sub.status] || STATUS.PENDING;
                  const St = st.Icon;
                  return (
                    <tr key={sub.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {(sub.student?.fullName || 'S')[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{sub.student?.fullName || '—'}</p>
                            <p className="text-xs text-gray-400">{sub.student?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800">{sub.classStudent?.classEntity?.course?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{sub.classStudent?.classEntity?.className || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg">
                          {CERT_LABEL[sub.certificateType] || sub.certificateType || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
                          <St className="w-3 h-3" /> {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <CertDetailModal
        sub={selectedSub}
        onClose={() => setSelectedSub(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </PageContainer>
  );
};

export default CertificateApproval;
