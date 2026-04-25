import React, { useState, useRef, useEffect } from 'react';
import {
    X, Award, CheckCircle, XCircle, Clock,
    Upload, FileText, Image as ImageIcon, ExternalLink,
    Loader2, RefreshCw, AlertTriangle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { studentService } from '../../services/studentService';
import { useTranslation } from 'react-i18next';

const STATUS_CONFIG = {
    PENDING:  { labelKey: 'component.certificateDetail.pending',    className: 'bg-yellow-100 text-yellow-700 border-yellow-300', Icon: Clock },
    APPROVED: { labelKey: 'component.certificateDetail.approved',   className: 'bg-green-100  text-green-700  border-green-300',  Icon: CheckCircle },
    REJECTED: { labelKey: 'component.certificateDetail.rejected',   className: 'bg-red-100    text-red-700    border-red-300',    Icon: XCircle },
};

const CERT_TYPE_LABEL = { TOPIK: 'TOPIK', OPIc: 'OPIc', EPS_TOPIK: 'EPS-TOPIK', OTHER: 'component.certificateDetail.other' };

/** Check whether a URL is an image (by extension or Cloudinary pattern) */
const isImage = (url = '') => /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url) || url.includes('/image/upload/');
const isPdf   = (url = '') => /\.pdf(\?|$)/i.test(url) || url.includes('/raw/upload/');

const CertificateDetailModal = ({ isOpen, onClose, submission, onUpdated }) => {
    const { t } = useTranslation();
    const inputRef = useRef(null);

    const [newFile, setNewFile]       = useState(null);
    const [certType, setCertType]     = useState(submission?.certificateType || 'TOPIK');
    const [notes, setNotes]           = useState(submission?.notes || '');
    const [dragActive, setDragActive] = useState(false);
    const [saving, setSaving]         = useState(false);
    const [editMode, setEditMode]     = useState(false);

    // Reset edit state whenever submission changes (e.g. user opens a different card)
    useEffect(() => {
        if (submission) {
            setCertType(submission.certificateType || 'TOPIK');
            setNotes(submission.notes || '');
            setNewFile(null);
            setEditMode(false);
        }
    }, [submission]);

    if (!isOpen || !submission) return null;

    const canEdit = submission.status !== 'APPROVED';
    const fileUrl = submission.certificateUrl;
    const status  = STATUS_CONFIG[submission.status] || STATUS_CONFIG.PENDING;
    const StatusIcon = status.Icon;
    const statusLabel = t(status.labelKey);

    /* ───── File helpers ───── */
    const handleFileSelect = (f) => {
        if (!f) return;
        const ext = '.' + f.name.split('.').pop().toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
            Swal.fire({ icon: 'error', title: t('component.certificateDetail.invalidFormat'), text: t('component.certificateDetail.acceptedFormats'), confirmButtonColor: '#ef4444' });
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            Swal.fire({ icon: 'error', title: t('component.certificateDetail.fileTooLarge'), text: t('component.certificateDetail.maxSize'), confirmButtonColor: '#ef4444' });
            return;
        }
        setNewFile(f);
    };

    /* ───── Save ───── */
    const handleSave = async () => {
        if (!newFile) return;
        setSaving(true);
        try {
            await studentService.updateCertificateFile({
                id: submission.id,
                file: newFile,
                certificateType: certType,
                notes,
            });
            await Swal.fire({
                icon: 'success',
                title: t('component.certificateDetail.updateSuccess'),
                text: t('component.certificateDetail.updateSuccessDesc'),
                confirmButtonColor: '#22c55e',
            });
            onUpdated?.();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || t('component.certificateDetail.errorOccurred');
            Swal.fire({ icon: 'error', title: t('component.certificateDetail.error'), text: msg, confirmButtonColor: '#ef4444' });
        } finally {
            setSaving(false);
        }
    };

    /* ───── Certificate preview ───── */
    const renderPreview = () => {
        if (isImage(fileUrl)) {
            return (
                <img
                    src={fileUrl}
                    alt="certificate"
                    className="w-full rounded-xl object-contain max-h-[55vh] border border-gray-200 shadow"
                />
            );
        }
        if (isPdf(fileUrl)) {
            return (
                <iframe
                    src={fileUrl}
                    title="certificate-pdf"
                    className="w-full rounded-xl border border-gray-200 shadow"
                    style={{ height: '55vh' }}
                />
            );
        }
        /* Fallback – unknown type */
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 gap-3">
                <FileText className="w-14 h-14 text-gray-400" />
                <p className="text-gray-500 text-sm">{t('component.certificateDetail.cannotPreview')}</p>
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                    <ExternalLink className="w-4 h-4" /> {t('component.certificateDetail.openInNewTab')}
                </a>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-scale-up">

                {/* ── Header ── */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <Award className="w-6 h-6" />
                        <div>
                            <h2 className="text-lg font-bold leading-tight">
                                {submission.classStudent?.classEntity?.course?.name || t('component.certificateDetail.certificate')}
                            </h2>
                            <p className="text-indigo-200 text-xs mt-0.5">
                                {submission.classStudent?.classEntity?.className}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition" disabled={saving}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Body (scrollable) ── */}
                <div className="overflow-y-auto flex-1 p-6 space-y-5">

                    {/* Status + meta */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${status.className}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusLabel}
                        </span>
                        <span className="text-xs text-gray-500">
                            {t('component.certificateDetail.type')}: <strong>{typeof CERT_TYPE_LABEL[submission.certificateType] === 'string' && !CERT_TYPE_LABEL[submission.certificateType].includes('.') ? CERT_TYPE_LABEL[submission.certificateType] : t(CERT_TYPE_LABEL[submission.certificateType])}</strong>
                        </span>
                        <span className="text-xs text-gray-500">
                            {t('component.certificateDetail.submitted')}: <strong>{new Date(submission.createdAt).toLocaleDateString('vi-VN')}</strong>
                        </span>
                    </div>

                    {/* Review note */}
                    {submission.status === 'REJECTED' && submission.reviewNote && (
                        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold mb-0.5">{t('component.certificateDetail.rejectReason')}:</p>
                                <p>{submission.reviewNote}</p>
                            </div>
                        </div>
                    )}
                    {submission.status === 'APPROVED' && submission.reviewNote && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                            {submission.reviewNote}
                        </div>
                    )}

                    {/* ── Preview ── */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-700">{t('component.certificateDetail.currentFile')}</p>
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition"
                            >
                                <ExternalLink className="w-3.5 h-3.5" /> {t('component.certificateDetail.openNewTab')}
                            </a>
                        </div>
                        {renderPreview()}
                    </div>

                    {/* ── Edit section (PENDING / REJECTED only) ── */}
                    {canEdit && (
                        <>
                            {!editMode ? (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="w-full py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-semibold text-sm hover:border-indigo-500 hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    {t('component.certificateDetail.changeFile')}
                                </button>
                            ) : (
                                <div className="space-y-4 bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                                    <p className="text-sm font-semibold text-indigo-800">{t('component.certificateDetail.updateCertificate')}</p>

                                    {/* File upload */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t('component.certificateDetail.newFile')} *</label>
                                        <input
                                            ref={inputRef}
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={e => handleFileSelect(e.target.files?.[0])}
                                            className="hidden"
                                        />
                                        {newFile ? (
                                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                                                <div className="flex items-center gap-2">
                                                    {isImage(newFile.name) ? <ImageIcon className="w-4 h-4 text-green-600" /> : <FileText className="w-4 h-4 text-green-600" />}
                                                    <span className="text-green-700 font-medium text-sm truncate max-w-[260px]">{newFile.name}</span>
                                                    <span className="text-xs text-gray-400">({(newFile.size / 1024).toFixed(0)} KB)</span>
                                                </div>
                                                <button onClick={() => setNewFile(null)} className="text-gray-400 hover:text-red-500">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => inputRef.current?.click()}
                                                onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
                                                onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                                                onDragOver={e => e.preventDefault()}
                                                onDrop={e => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files?.[0]); }}
                                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${dragActive ? 'border-indigo-400 bg-indigo-100' : 'border-gray-300 hover:border-indigo-400 bg-white'}`}
                                            >
                                                <Upload className="w-7 h-7 text-gray-400 mx-auto mb-1" />
                                                <p className="text-sm text-gray-500">{t('component.certificateDetail.dragDrop', 'Kéo thả hoặc')} <span className="text-indigo-600 font-medium">{t('component.certificateDetail.selectFile', 'chọn file')}</span></p>
                                                <p className="text-xs text-gray-400 mt-0.5">{t('component.certificateDetail.fileFormats')}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cert type */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t('component.certificateDetail.certType')}</label>
                                        <select
                                            value={certType}
                                            onChange={e => setCertType(e.target.value)}
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                        >
                                            <option value="TOPIK">TOPIK</option>
                                            <option value="OPIc">OPIc</option>
                                            <option value="EPS_TOPIK">EPS-TOPIK</option>
                                            <option value="OTHER">{t('component.certificateDetail.other')}</option>
                                        </select>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t('component.certificateDetail.notes')} <span className="font-normal text-gray-400">({t('component.certificateDetail.optional')})</span></label>
                                        <textarea
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            rows={2}
                                            maxLength={500}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none bg-white"
                                            placeholder={t('component.certificateDetail.notesPlaceholder')}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="p-5 border-t border-gray-100 flex gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition"
                    >
                        {t('common.close', 'Đóng')}
                    </button>
                    {canEdit && editMode && (
                        <button
                            onClick={handleSave}
                            disabled={saving || !newFile}
                            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('common.saving', 'Đang lưu...')}</> : <><Upload className="w-4 h-4" /> {t('common.saveChanges', 'Lưu thay đổi')}</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificateDetailModal;
