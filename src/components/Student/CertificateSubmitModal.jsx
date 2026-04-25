import React, { useState, useRef } from 'react';
import { X, Upload, Award, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { studentService } from '../../services/studentService';
import { useTranslation } from 'react-i18next';

const CertificateSubmitModal = ({ isOpen, onClose, eligibleCourses, onSubmitted, isResubmission = false }) => {
    const { t } = useTranslation();
    const [selectedCourse, setSelectedCourse] = useState(isResubmission && eligibleCourses?.length > 0 ? eligibleCourses[0].classStudentId : '');
    const [certType, setCertType] = useState('TOPIK');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileSelect = (f) => {
        if (!f) return;
        const ext = '.' + f.name.split('.').pop().toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
            Swal.fire({ icon: 'error', title: t('student.certificate.invalidFormat'), text: t('student.certificate.invalidFormatMsg'), confirmButtonColor: '#ef4444' });
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            Swal.fire({ icon: 'error', title: t('student.certificate.fileTooLarge'), text: t('student.certificate.maxSize10MB'), confirmButtonColor: '#ef4444' });
            return;
        }
        setFile(f);
    };

    const handleSubmit = async () => {
        if (!selectedCourse || !file) {
            Swal.fire({ icon: 'warning', title: t('student.certificate.missingInfo'), text: t('student.certificate.selectCourseAndFile'), confirmButtonColor: '#3b82f6' });
            return;
        }

        setSubmitting(true);
        try {
            await studentService.submitCertificate({
                classStudentId: selectedCourse,
                certificateType: certType,
                notes,
                file,
            });

            await Swal.fire({
                icon: 'success',
                title: t('student.certificate.submitSuccess'),
                text: t('student.certificate.submitSuccessMsg'),
                confirmButtonColor: '#22c55e',
            });

            onSubmitted?.();
            onClose();
            setSelectedCourse('');
            setCertType('TOPIK');
            setNotes('');
            setFile(null);
        } catch (err) {
            const msg = err.response?.data?.message || t('student.certificate.submitErrorMsg');
            Swal.fire({ icon: 'error', title: t('student.certificate.error'), text: msg, confirmButtonColor: '#ef4444' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            onClose();
            setSelectedCourse('');
            setCertType('TOPIK');
            setNotes('');
            setFile(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-up overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Award className="w-6 h-6" />
                        <h2 className="text-lg font-bold">{isResubmission ? t('student.certificate.resubmitTitle') : t('student.certificate.title')}</h2>
                    </div>
                    <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Select course */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('student.certificate.course')} *</label>
                        <select
                            value={selectedCourse}
                            onChange={e => setSelectedCourse(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                            <option value="">{t('student.certificate.selectCourse')}</option>
                            {eligibleCourses?.map(c => (
                                <option key={c.classStudentId} value={c.classStudentId}>
                                    {c.courseName} — {c.className}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Certificate type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('student.certificate.certificateType')}</label>
                        <select
                            value={certType}
                            onChange={e => setCertType(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                            <option value="TOPIK">TOPIK</option>
                            <option value="OPIc">OPIc</option>
                            <option value="EPS_TOPIK">EPS-TOPIK</option>
                            <option value="OTHER">{t('student.certificate.other')}</option>
                        </select>
                    </div>

                    {/* File upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('student.certificate.certificateFile')} *</label>
                        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => handleFileSelect(e.target.files?.[0])} className="hidden" />
                        {file ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-600 font-medium text-sm truncate max-w-[250px]">{file.name}</span>
                                    <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
                                </div>
                                <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <div
                                onClick={() => inputRef.current?.click()}
                                onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files?.[0]); }}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
                            >
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">{t('student.certificate.dragDropFile')}</p>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('student.certificate.notes')} <span className="text-gray-400 font-normal">({t('student.certificate.optional')})</span></label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={2}
                            maxLength={500}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                            placeholder={t('student.certificate.notesPlaceholder')}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={handleClose} disabled={submitting} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !selectedCourse || !file}
                            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('student.certificate.submitting')}</> : (isResubmission ? t('student.certificate.resubmit') : t('student.certificate.submitCertificate'))}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateSubmitModal;
