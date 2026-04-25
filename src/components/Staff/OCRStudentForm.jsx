import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import ocrService from '../../services/ocrService';
import userService from '../../services/userService';
import axiosClient from '../../api/axiosClient';
 
const OCRStudentForm = ({ onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef(null);
 
    // States
    const [step, setStep] = useState('upload'); // upload | review
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState(null);
 
    // Extracted Data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        address: '',
        course: 'TOPIK I',
        expirationDate: '',
    });
 
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
            processImage(file);
        }
    };
 
    const processImage = async (file) => {
        setLoading(true);
        try {
            // Call OCR Service
            const result = await ocrService.processFormImage(file);
 
            // Map result to form data (assuming result structure)
            // Backend should return JSON map of fields
            setFormData(prev => ({
                ...prev,
                fullName: result.name || '',
                dob: result.dob || '',
                phone: result.phone || '',
                address: result.address || '',
                email: result.email || '', // OCR might not capture email well
                expirationDate: result.expiryDate || '', // Assuming form has some date
            }));
 
            setStep('review');
        } catch (err) {
            console.error('OCR Error:', err);
            setError(t('ocr.error', 'Không thể đọc dữ liệu từ hình ảnh. Vui lòng thử lại hoặc nhập thủ công.'));
            setPreviewUrl(null);
        } finally {
            setLoading(false);
        }
    };
 
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userService.createStudent({
                ...formData,
                username: formData.email,
                password: 'password123',
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || t('ocr.createStudentFailed', 'Failed to create student from OCR data'));
        } finally {
            setLoading(false);
        }
    };
 
    const handleRetake = () => {
        setStep('upload');
        setPreviewUrl(null);
        setError(null);
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            dob: '',
            address: '',
            course: 'TOPIK I',
            expirationDate: '',
        });
    };

    const handleExportWord = async () => {
        try {
            setExporting(true);
            const response = await axiosClient.post('/staff/ocr/export-word', {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                dob: formData.dob,
                address: formData.address,
                course: formData.course,
                expirationDate: formData.expirationDate,
            }, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `student_registration_${formData.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting to Word:', error);
            setError(t('ocr.exportWordFailed', 'Failed to export to Word document'));
        } finally {
            setExporting(false);
        }
    };
 
    // Step 1: Upload UI
    if (step === 'upload') {
        return (
            <div className="text-center py-8">
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
 
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-primary-300 bg-primary-50 rounded-2xl p-8 cursor-pointer hover:bg-primary-100 transition duration-300"
                >
                    {loading ? (
                        <div className="space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="text-primary-700 font-medium">{t('ocr.processing', 'Đang xử lý hình ảnh...')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-5xl">📷</div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{t('ocr.uploadTitle', 'Tải lên hình ảnh đơn đăng ký')}</h3>
                                <p className="text-gray-500 text-sm mt-1">{t('ocr.uploadDesc', 'Hỗ trợ JPG, PNG. Đảm bảo ảnh rõ nét.')}</p>
                            </div>
                            <button className="px-6 py-2 bg-white border border-primary-200 text-primary-700 rounded-xl font-medium shadow-sm">
                                {t('ocr.chooseFile', 'Chọn File')}
                            </button>
                        </div>
                    )}
                </div>
 
                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        ⚠️ {error}
                    </div>
                )}
 
                <div className="flex justify-center mt-6">
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        {t('common.cancel', 'Hủy bỏ')}
                    </button>
                </div>
            </div>
        );
    }
 
    // Step 2: Review UI
    return (
        <div className="space-y-6">
            <div className="flex gap-6">
                {/* Image Preview (Left Side) */}
                <div className="w-1/3 hidden sm:block">
                    <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 sticky top-4">
                        <img src={previewUrl} alt="Form Preview" className="w-full h-auto object-contain" />
                        <button
                            onClick={handleRetake}
                            className="w-full py-2 bg-gray-800 text-white text-sm hover:bg-black transition"
                        >
                            🔄 {t('ocr.reupload', 'Chọn ảnh khác')}
                        </button>
                    </div>
                </div>
 
                {/* Form Data (Right Side) */}
                <div className="flex-1">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                        <span className="text-2xl">🤖</span>
                        <div>
                            <h4 className="font-bold text-blue-800 text-sm">{t('ocr.successTitle', 'Dữ liệu đã được trích xuất!')}</h4>
                            <p className="text-blue-600 text-xs mt-1">
                                {t('ocr.successDesc', 'Vui lòng kiểm tra và chỉnh sửa lại các thông tin bên dưới nếu cần thiết.')}
                            </p>
                        </div>
                    </div>
 
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                {t('studentMgmt.fullName', 'Họ và tên')}
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleFormChange}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500/20 font-medium text-gray-900"
                            />
                        </div>
 
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                    {t('studentMgmt.dob', 'Ngày sinh')}
                                </label>
                                <input
                                    type="text"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500/20"
                                    placeholder="dd/mm/yyyy"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                    {t('studentMgmt.phone', 'SĐT')}
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500/20"
                                />
                            </div>
                        </div>
 
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                {t('studentMgmt.email', 'Email')}
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
 
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                {t('studentMgmt.address', 'Địa chỉ')}
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleFormChange}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
 
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                    {t('studentMgmt.course', 'Khóa học')}
                                </label>
                                <select
                                    name="course"
                                    value={formData.course}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                >
                                    <option value="TOPIK I">TOPIK I</option>
                                    <option value="TOPIK II Intermediate">TOPIK II Intermediate</option>
                                    <option value="TOPIK II Advanced">TOPIK II Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                    {t('studentMgmt.expirationDate', 'Ngày hết hạn')}
                                </label>
                                <input
                                    type="date"
                                    name="expirationDate"
                                    value={formData.expirationDate}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500/20"
                                />
                            </div>
                        </div>
 
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                            <button
                                type="button"
                                onClick={handleExportWord}
                                disabled={exporting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md disabled:opacity-50 flex items-center gap-2"
                            >
                                {exporting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                {t('ocr.exportWord', 'Xuất Word')}
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                            >
                                {t('common.cancel', 'Hủy bỏ')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-md disabled:opacity-50"
                            >
                                {loading ? t('common.saving', 'Đang lưu...') : t('common.confirm', 'Xác nhận & Tạo')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
 
export default OCRStudentForm;
