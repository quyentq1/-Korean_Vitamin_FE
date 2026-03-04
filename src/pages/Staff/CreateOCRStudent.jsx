import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Upload, Image as ImageIcon, Scan, CheckCircle, AlertCircle,
    Loader2, ArrowLeft, Save, Edit, Eye, FileText, User
} from 'lucide-react';
import Swal from 'sweetalert2';
import staffService from '../../services/staffService';

/**
 * OCR Student Creation Component
 * Upload image → OCR Processing → Preview/Edit → Create Student
 */
const CreateOCRStudent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Upload, 2: Preview/Edit, 3: Processing
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [ocrData, setOcrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);

    // Editable OCR data
    const [editableData, setEditableData] = useState({
        studentName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: 'male',
        courseCode: '',
        courseId: '',
        classId: '',
        notes: ''
    });

    // Handle file selection
    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/webp'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Invalid file type. Please upload JPG, PNG, BMP, or WebP images.');
            return;
        }

        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size exceeds 10MB. Please upload a smaller file.');
            return;
        }

        setFile(selectedFile);
        setError('');

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
    };

    // Handle drag and drop
    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            const event = { target: { files: [droppedFile] } };
            handleFileSelect(event);
        }
    };

    // Process OCR
    const handleProcessOCR = async () => {
        if (!file) return;

        try {
            setLoading(true);
            setError('');

            const response = await staffService.uploadOCRImage(file);

            if (response && response.success) {
                const extractedData = response.data || {};
                setOcrData(extractedData);

                // Populate editable form
                setEditableData({
                    studentName: extractedData.studentName || '',
                    email: extractedData.email || '',
                    phone: extractedData.phone || '',
                    address: extractedData.address || '',
                    dateOfBirth: extractedData.dateOfBirth || '',
                    gender: extractedData.gender || 'male',
                    courseCode: extractedData.courseCode || '',
                    courseId: extractedData.courseId || '',
                    classId: extractedData.classId || '',
                    notes: extractedData.notes || ''
                });

                setStep(2);
            } else {
                setError(response?.error || 'OCR processing failed. Please try again.');
            }
        } catch (err) {
            console.error('OCR Error:', err);
            setError(err.message || 'Failed to process image. Please ensure the image is clear and all fields are visible.');
        } finally {
            setLoading(false);
        }
    };

    // Handle input change in edit mode
    const handleInputChange = (field, value) => {
        setEditableData(prev => ({ ...prev, [field]: value }));
    };

    // Validate and submit
    const handleSubmit = async () => {
        // Validation
        if (!editableData.studentName.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Student name is required',
                confirmButtonColor: '#667eea',
            });
            return;
        }

        if (!editableData.email.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Email is required',
                confirmButtonColor: '#667eea',
            });
            return;
        }

        if (!editableData.phone.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Phone number is required',
                confirmButtonColor: '#667eea',
            });
            return;
        }

        try {
            setProcessing(true);

            const response = await staffService.createStudentFromOCR({
                ...editableData,
                ocrImageUrl: preview,
                rawOcrText: ocrData?.rawText || ''
            });

            Swal.fire({
                icon: 'success',
                title: t('staff.createStudent.success'),
                text: t('staff.createStudent.emailSent'),
                confirmButtonColor: '#667eea',
            }).then(() => {
                navigate('/student-management');
            });
        } catch (err) {
            console.error('Create Student Error:', err);
            Swal.fire({
                icon: 'error',
                title: t('errors.error') || 'Lỗi',
                text: err.message || t('errors.tryAgain') || 'Failed to create student',
                confirmButtonColor: '#667eea',
            });
        } finally {
            setProcessing(false);
        }
    };

    // Reset
    const handleReset = () => {
        setStep(1);
        setFile(null);
        setPreview(null);
        setOcrData(null);
        setError('');
        setEditMode(false);
        setEditableData({
            studentName: '',
            email: '',
            phone: '',
            address: '',
            dateOfBirth: '',
            gender: 'male',
            courseCode: '',
            courseId: '',
            classId: '',
            notes: ''
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/student-management')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t('common.back')}
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                        <Scan className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('staff.createStudent.title')}</h1>
                        <p className="text-gray-500 text-sm">{t('staff.createStudent.ocrTitle')}</p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                        <Upload className="w-4 h-4" />
                        Upload Image
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300" />
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                        <Eye className="w-4 h-4" />
                        Preview & Edit
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300" />
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        step === 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                        <CheckCircle className="w-4 h-4" />
                        Complete
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
                {/* Step 1: Upload Image */}
                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Upload Area */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Upload className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {t('staff.ocrUpload.uploadForm')}
                                </h2>
                            </div>

                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                                    preview
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                                }`}
                            >
                                {preview ? (
                                    <div className="space-y-4">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="max-h-64 mx-auto rounded-lg shadow-md"
                                        />
                                        <div className="text-sm text-gray-600">
                                            <p className="font-medium">{file?.name}</p>
                                            <p className="text-gray-500">
                                                {(file?.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setFile(null);
                                                setPreview(null);
                                            }}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                                            <ImageIcon className="w-8 h-8 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium mb-1">
                                                Drag & drop image here
                                            </p>
                                            <p className="text-gray-500 text-sm">or</p>
                                        </div>
                                        <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer font-medium">
                                            <Upload className="w-4 h-4" />
                                            {t('staff.ocrUpload.chooseFile')}
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/bmp,image/webp"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            {t('staff.ocrUpload.support')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleProcessOCR}
                                disabled={!file || loading}
                                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t('staff.ocrUpload.processing')}
                                    </>
                                ) : (
                                    <>
                                        <Scan className="w-5 h-5" />
                                        {t('staff.ocrUpload.processOcr')}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Instructions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Instructions
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <h3 className="font-medium text-blue-900 mb-2">
                                        📷 Photo Guidelines
                                    </h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Ensure good lighting</li>
                                        <li>• Keep the document flat</li>
                                        <li>• All text should be clearly visible</li>
                                        <li>• Avoid reflections and shadows</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-green-50 rounded-xl">
                                    <h3 className="font-medium text-green-900 mb-2">
                                        ✅ Required Fields
                                    </h3>
                                    <ul className="text-sm text-green-800 space-y-1">
                                        <li>• Student Name (Họ và tên)</li>
                                        <li>• Email Address</li>
                                        <li>• Phone Number</li>
                                        <li>• Date of Birth (optional)</li>
                                        <li>• Address (optional)</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl">
                                    <h3 className="font-medium text-amber-900 mb-2">
                                        💡 Tips
                                    </h3>
                                    <ul className="text-sm text-amber-800 space-y-1">
                                        <li>• You can edit extracted data before creating</li>
                                        <li>• Password will be auto-generated</li>
                                        <li>• Welcome email will be sent automatically</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Preview & Edit */}
                {step === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Original Image */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-purple-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Original Image
                                    </h2>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Upload New Image
                                </button>
                            </div>
                            <img
                                src={preview}
                                alt="Original"
                                className="w-full rounded-lg shadow-md"
                            />
                        </div>

                        {/* Extracted Data */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {t('staff.ocrUpload.extractedInfo')}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    {editMode ? 'View Mode' : 'Edit Mode'}
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {/* Student Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('staff.createStudent.fullName')} <span className="text-red-500">*</span>
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={editableData.studentName}
                                            onChange={(e) => handleInputChange('studentName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">
                                            {editableData.studentName || t('staff.ocrUpload.notDetected')}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('common.email')} <span className="text-red-500">*</span>
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="email"
                                            value={editableData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">
                                            {editableData.email || t('staff.ocrUpload.notDetected')}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('common.phone')} <span className="text-red-500">*</span>
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="tel"
                                            value={editableData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">
                                            {editableData.phone || t('staff.ocrUpload.notDetected')}
                                        </p>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('staff.createStudent.address')}
                                    </label>
                                    {editMode ? (
                                        <textarea
                                            value={editableData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                        />
                                    ) : (
                                        <p className="text-gray-900">
                                            {editableData.address || t('staff.ocrUpload.notDetected')}
                                        </p>
                                    )}
                                </div>

                                {/* Course Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('staff.ocrUpload.courseCode')}
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={editableData.courseCode}
                                            onChange={(e) => handleInputChange('courseCode', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    ) : (
                                        <p className="text-gray-900">
                                            {editableData.courseCode || t('staff.ocrUpload.notDetected')}
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('staff.createStudent.notes')}
                                    </label>
                                    {editMode ? (
                                        <textarea
                                            value={editableData.notes}
                                            onChange={(e) => handleInputChange('notes', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                        />
                                    ) : (
                                        <p className="text-gray-900">
                                            {editableData.notes || '-'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleReset}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Create Student
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateOCRStudent;
