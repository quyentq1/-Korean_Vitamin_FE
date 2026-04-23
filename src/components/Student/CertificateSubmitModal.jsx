import React, { useState, useRef } from 'react';
import { X, Upload, Award, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { studentService } from '../../services/studentService';

const CertificateSubmitModal = ({ isOpen, onClose, eligibleCourses, onSubmitted }) => {
    const [selectedCourse, setSelectedCourse] = useState('');
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
            Swal.fire({ icon: 'error', title: 'Sai định dạng', text: 'Chỉ chấp nhận file JPG, PNG hoặc PDF', confirmButtonColor: '#ef4444' });
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            Swal.fire({ icon: 'error', title: 'File quá lớn', text: 'Tối đa 10MB', confirmButtonColor: '#ef4444' });
            return;
        }
        setFile(f);
    };

    const handleSubmit = async () => {
        if (!selectedCourse || !file) {
            Swal.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Vui lòng chọn khóa học và tải file chứng chỉ.', confirmButtonColor: '#3b82f6' });
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
                title: 'Nộp thành công!',
                text: 'Chứng chỉ đã được gửi. Vui lòng chờ Education Manager duyệt.',
                confirmButtonColor: '#22c55e',
            });

            onSubmitted?.();
            onClose();
            setSelectedCourse('');
            setCertType('TOPIK');
            setNotes('');
            setFile(null);
        } catch (err) {
            const msg = err.response?.data?.message || 'Lỗi khi nộp chứng chỉ. Vui lòng thử lại.';
            Swal.fire({ icon: 'error', title: 'Lỗi', text: msg, confirmButtonColor: '#ef4444' });
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
        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-up overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Award className="w-6 h-6" />
                        <h2 className="text-lg font-bold">Nộp chứng chỉ</h2>
                    </div>
                    <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Select course */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Khóa học *</label>
                        <select
                            value={selectedCourse}
                            onChange={e => setSelectedCourse(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                            <option value="">— Chọn khóa học —</option>
                            {eligibleCourses?.map(c => (
                                <option key={c.classStudentId} value={c.classStudentId}>
                                    {c.courseName} — {c.className}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Certificate type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Loại chứng chỉ</label>
                        <select
                            value={certType}
                            onChange={e => setCertType(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                            <option value="TOPIK">TOPIK</option>
                            <option value="OPIc">OPIc</option>
                            <option value="EPS_TOPIK">EPS-TOPIK</option>
                            <option value="OTHER">Khác</option>
                        </select>
                    </div>

                    {/* File upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">File chứng chỉ (JPG, PNG, PDF) *</label>
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
                                <p className="text-sm text-gray-600">Click hoặc kéo thả file vào đây</p>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú <span className="text-gray-400 font-normal">(không bắt buộc)</span></label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={2}
                            maxLength={500}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                            placeholder="VD: Đã thi TOPIK II cấp 4 tại Hàn Quốc..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={handleClose} disabled={submitting} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !selectedCourse || !file}
                            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</> : 'Gửi chứng chỉ'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateSubmitModal;
