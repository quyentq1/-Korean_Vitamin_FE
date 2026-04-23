import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import Swal from 'sweetalert2';

/**
 * ImportQuestions - Component import câu hỏi từ Excel
 * Priority 3: Excel Import Enhancements
 */
const ImportQuestions = ({ teacherId, onImportComplete, onClose }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, []);

    const handleFileSelect = (selectedFile) => {
        setError(null);
        setResult(null);

        if (!selectedFile) {
            return;
        }

        // Check file extension
        const fileName = selectedFile.name.toLowerCase();
        if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
            setError(t('teacher.importQuestions.errorExcelOnly'));
            return;
        }

        // Check file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError(t('teacher.importQuestions.errorFileSize'));
            return;
        }

        setFile(selectedFile);
    };

    const handleDownloadTemplate = async () => {
        setDownloading(true);
        try {
            const response = await teacherService.downloadImportTemplate();

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'QuestionImportTemplate.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            Swal.fire({
                icon: 'success',
                title: t('teacher.importQuestions.success'),
                text: t('teacher.importQuestions.templateDownloaded'),
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Error downloading template:', err);
            Swal.fire({
                icon: 'error',
                title: t('teacher.importQuestions.error'),
                text: t('teacher.importQuestions.cannotDownloadTemplate'),
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setDownloading(false);
        }
    };

    const handleImport = async () => {
        if (!file) {
            setError(t('teacher.importQuestions.errorSelectFile'));
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const response = await teacherService.importQuestions(file, teacherId);
            setResult(response.data);

            Swal.fire({
                icon: 'success',
                title: t('teacher.importQuestions.importSuccess'),
                html: `
                    <p>${t('teacher.importQuestions.importedCount', { count: response.data?.length || 0 })}</p>
                `,
                confirmButtonColor: '#22c55e'
            }).then(() => {
                if (onImportComplete) {
                    onImportComplete(response.data);
                }
                onClose();
            });
        } catch (err) {
            console.error('Error importing questions:', err);
            const errorMessage = err.response?.data?.message || t('teacher.importQuestions.cannotImport');
            setError(errorMessage);

            Swal.fire({
                icon: 'error',
                title: t('teacher.importQuestions.importError'),
                text: errorMessage,
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{t('teacher.importQuestions.title')}</h3>
                            <p className="text-sm text-gray-600">
                                {t('teacher.importQuestions.subtitle')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-6">
                {/* Download Template */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="text-sm font-semibold text-blue-900 mb-1">
                                {t('teacher.importQuestions.downloadTemplate')}
                            </h4>
                            <p className="text-xs text-blue-700">
                                {t('teacher.importQuestions.downloadTemplateDesc')}
                            </p>
                        </div>
                        <button
                            onClick={handleDownloadTemplate}
                            disabled={downloading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                        >
                            {downloading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('teacher.importQuestions.downloading')}
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    {t('teacher.importQuestions.downloadTemplateBtn')}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Upload Area */}
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
                        ${dragging
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }
                    `}
                >
                    <input
                        type="file"
                        id="file-upload"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />

                    {!file ? (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Upload className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">
                                    {t('teacher.importQuestions.dragDrop')}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {t('teacher.importQuestions.orClickToSelect')}
                                </p>
                            </div>
                            <p className="text-xs text-gray-400">
                                {t('teacher.importQuestions.acceptedFormats')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">{file.name}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {formatFileSize(file.size)}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                    setError(null);
                                    setResult(null);
                                }}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                {t('teacher.importQuestions.removeFile')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Format Instructions */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        {t('teacher.importQuestions.excelFormat')}
                    </h4>
                    <div className="text-xs text-gray-600 space-y-2">
                        <p>{t('teacher.importQuestions.excelFormatDesc')}</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li><strong>CategoryName</strong> - {t('teacher.importQuestions.colCategoryName')}</li>
                            <li><strong>Type</strong> - {t('teacher.importQuestions.colType')}</li>
                            <li><strong>QuestionText</strong> - {t('teacher.importQuestions.colQuestionText')}</li>
                            <li><strong>Difficulty</strong> - {t('teacher.importQuestions.colDifficulty')}</li>
                            <li><strong>Points</strong> - {t('teacher.importQuestions.colPoints')}</li>
                            <li><strong>CorrectAnswer</strong> - {t('teacher.importQuestions.colCorrectAnswer')}</li>
                            <li><strong>Options</strong> - {t('teacher.importQuestions.colOptions')}</li>
                        </ol>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">{t('teacher.importQuestions.error')}</p>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-400 hover:text-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">{t('teacher.importQuestions.success')}</p>
                            <p className="text-sm text-green-700 mt-1">
                                {t('teacher.importQuestions.importedToBank', { count: result.length || 0 })}
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {t('teacher.importQuestions.cancel')}
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file || uploading}
                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('teacher.importQuestions.importing')}
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                {t('teacher.importQuestions.importBtn')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportQuestions;
