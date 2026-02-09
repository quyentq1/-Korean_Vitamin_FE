import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ManualStudentForm from './ManualStudentForm';
import OCRStudentForm from './OCRStudentForm';

const AddStudentModal = ({ onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('manual'); // manual | ocr

    const handleSuccess = () => {
        // You might want to show a toast here in parent
        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 bg-black bg-opacity-60 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-4 sm:p-6 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {t('staff.addStudent.title', 'Thêm Học Viên Mới')}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {t('staff.addStudent.subtitle', 'Nhập thông tin thủ công hoặc sử dụng OCR')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 shrink-0">
                    <button
                        className={`flex-1 py-4 text-sm font-bold transition relative ${activeTab === 'manual'
                                ? 'text-primary-600 bg-primary-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        onClick={() => setActiveTab('manual')}
                    >
                        ✍️ {t('staff.addStudent.manualTab', 'Nhập Thủ Công')}
                        {activeTab === 'manual' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600"></div>
                        )}
                    </button>
                    <button
                        className={`flex-1 py-4 text-sm font-bold transition relative ${activeTab === 'ocr'
                                ? 'text-blue-600 bg-blue-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        onClick={() => setActiveTab('ocr')}
                    >
                        📷 {t('staff.addStudent.ocrTab', 'Quét OCR Form')}
                        {activeTab === 'ocr' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
                        )}
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {activeTab === 'manual' ? (
                        <ManualStudentForm onSuccess={handleSuccess} onCancel={onClose} />
                    ) : (
                        <OCRStudentForm onSuccess={handleSuccess} onCancel={onClose} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;
