import { useState, useEffect } from 'react';
import { History, Eye, RefreshCw, Download, FileText, AlertCircle, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Swal from 'sweetalert2';

/**
 * OCRHistory - Component hiển thị lịch sử các lần OCR
 * Phase 3: OCR & Automation
 *
 * Features:
 * - View all OCR processing history
 * - Filter by status, type, date
 * - View OCR results
 * - Reprocess failed OCR
 * - Download OCR results
 * - Search functionality
 */
const OCRHistory = ({ staffId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [reprocessing, setReprocessing] = useState({});

    // Filters
    const [filter, setFilter] = useState({
        status: 'all',
        type: 'all',
        dateRange: 'all',
        search: ''
    });

    useEffect(() => {
        fetchOCRHistory();
    }, [staffId]);

    const fetchOCRHistory = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/ai/ocr/history');
            setHistory(response.data || []);
        } catch (error) {
            console.error('Error fetching OCR history:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải lịch sử OCR',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReprocess = async (ocrId) => {
        const result = await Swal.fire({
            icon: 'question',
            title: 'Xử lý lại?',
            text: 'Thao tác này sẽ xử lý lại OCR với cấu hình hiện tại',
            showCancelButton: true,
            confirmButtonText: 'Xử lý lại',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#6b7280'
        });

        if (!result.isConfirmed) return;

        setReprocessing({ ...reprocessing, [ocrId]: true });
        try {
            await axiosClient.post(`/api/ai/ocr/reprocess/${ocrId}`);
            await Swal.fire({
                icon: 'success',
                title: 'Đã gửi yêu cầu',
                text: 'Đang xử lý lại OCR. Vui lòng đợi kết quả.',
                timer: 2000,
                showConfirmButton: false
            });
            fetchOCRHistory();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể xử lý lại OCR',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setReprocessing({ ...reprocessing, [ocrId]: false });
        }
    };

    const handleViewDetail = (record) => {
        setSelectedRecord(record);
        setShowDetailModal(true);
    };

    const handleDownloadResult = async (record) => {
        try {
            const response = await axiosClient.get(`/api/ai/ocr/download/${record.id}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ocr-result-${record.id}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải xuống kết quả',
                confirmButtonColor: '#6366f1'
            });
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            COMPLETED: { color: 'green', icon: CheckCircle, label: 'Hoàn thành' },
            PROCESSING: { color: 'blue', icon: Clock, label: 'Đang xử lý' },
            FAILED: { color: 'red', icon: AlertCircle, label: 'Thất bại' },
            PENDING: { color: 'yellow', icon: Clock, label: 'Chờ xử lý' }
        };
        const config = statusConfig[status] || statusConfig.PENDING;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-${config.color}-100 text-${config.color}-700`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const getTypeLabel = (type) => {
        const types = {
            registration: 'Đơn đăng ký',
            id_card: 'CMND/CCCD',
            certificate: 'Chứng chỉ',
            other: 'Khác'
        };
        return types[type] || type;
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 90) return 'text-green-600';
        if (confidence >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Filter history
    const filteredHistory = history.filter(record => {
        const matchesStatus = filter.status === 'all' || record.status === filter.status;
        const matchesType = filter.type === 'all' || record.type === filter.type;
        const matchesSearch = filter.search === '' ||
            record.fileName?.toLowerCase().includes(filter.search.toLowerCase()) ||
            record.extractedData?.fullName?.toLowerCase().includes(filter.search.toLowerCase());
        const matchesDate = filter.dateRange === 'all' || checkDateInRange(record.processedAt, filter.dateRange);

        return matchesStatus && matchesType && matchesSearch && matchesDate;
    });

    const checkDateInRange = (dateString, range) => {
        if (!dateString) return true;
        const date = new Date(dateString);
        const now = new Date();
        const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (range === 'week') return daysDiff <= 7;
        if (range === 'month') return daysDiff <= 30;
        return true;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <History className="w-6 h-6 text-blue-600" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Lịch sử OCR</h2>
                            <p className="text-sm text-gray-600">Xem và quản lý các lần xử lý OCR</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên file hoặc học sinh..."
                                value={filter.search}
                                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="PROCESSING">Đang xử lý</option>
                            <option value="FAILED">Thất bại</option>
                            <option value="PENDING">Chờ xử lý</option>
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <select
                            value={filter.type}
                            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả loại</option>
                            <option value="registration">Đơn đăng ký</option>
                            <option value="id_card">CMND/CCCD</option>
                            <option value="certificate">Chứng chỉ</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="md:col-span-2">
                        <select
                            value={filter.dateRange}
                            onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả thời gian</option>
                            <option value="week">7 ngày qua</option>
                            <option value="month">30 ngày qua</option>
                        </select>
                    </div>

                    {/* Refresh Button */}
                    <div className="flex items-end">
                        <button
                            onClick={fetchOCRHistory}
                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Làm mới
                        </button>
                    </div>
                </div>
            </div>

            {/* History List */}
            <div className="divide-y divide-gray-200">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Đang tải lịch sử...</p>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Không có bản ghi OCR nào</p>
                    </div>
                ) : (
                    filteredHistory.map((record) => (
                        <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-medium text-gray-900">{record.fileName || 'Unknown'}</h3>
                                        <span className="text-xs text-gray-500">•</span>
                                        <span className="text-xs text-gray-600">{getTypeLabel(record.type)}</span>
                                        {getStatusBadge(record.status)}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                                        <div>
                                            <span className="text-gray-600">Người tạo: </span>
                                            <span className="font-medium">{record.createdBy || 'System'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Ngày xử lý: </span>
                                            <span className="font-medium">
                                                {record.processedAt ? new Date(record.processedAt).toLocaleString('vi-VN') : '-'}
                                            </span>
                                        </div>
                                        {record.confidence && (
                                            <div>
                                                <span className="text-gray-600">Độ chính xác: </span>
                                                <span className={`font-medium ${getConfidenceColor(record.confidence)}`}>
                                                    {record.confidence}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {record.extractedData && record.extractedData.fullName && (
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">Họ tên:</span> {record.extractedData.fullName}
                                        </p>
                                    )}

                                    {record.errorMessage && (
                                        <p className="text-sm text-red-600 mt-1">
                                            <AlertCircle className="w-4 h-4 inline mr-1" />
                                            {record.errorMessage}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleViewDetail(record)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Xem chi tiết"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    {record.status === 'FAILED' && (
                                        <button
                                            onClick={() => handleReprocess(record.id)}
                                            disabled={reprocessing[record.id]}
                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Xử lý lại"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${reprocessing[record.id] ? 'animate-spin' : ''}`} />
                                        </button>
                                    )}
                                    {record.status === 'COMPLETED' && (
                                        <button
                                            onClick={() => handleDownloadResult(record)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Tải xuống"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">Chi tiết OCR</h3>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">File:</span>
                                        <span className="ml-2 font-medium">{selectedRecord.fileName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Loại:</span>
                                        <span className="ml-2 font-medium">{getTypeLabel(selectedRecord.type)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span className="ml-2">{getStatusBadge(selectedRecord.status)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Ngày tạo:</span>
                                        <span className="ml-2 font-medium">
                                            {new Date(selectedRecord.createdAt).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    {selectedRecord.confidence && (
                                        <div>
                                            <span className="text-gray-600">Độ chính xác:</span>
                                            <span className={`ml-2 font-bold ${getConfidenceColor(selectedRecord.confidence)}`}>
                                                {selectedRecord.confidence}%
                                            </span>
                                        </div>
                                    )}
                                    {selectedRecord.processingTime && (
                                        <div>
                                            <span className="text-gray-600">Thời gian xử lý:</span>
                                            <span className="ml-2 font-medium">{selectedRecord.processingTime}ms</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Extracted Data */}
                            {selectedRecord.extractedData && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Dữ liệu trích xuất</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                                            {JSON.stringify(selectedRecord.extractedData, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {selectedRecord.errorMessage && (
                                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                    <h4 className="font-medium text-red-900 mb-2">Lỗi</h4>
                                    <p className="text-sm text-red-800">{selectedRecord.errorMessage}</p>
                                </div>
                            )}

                            {/* Warning */}
                            {selectedRecord.warning && (
                                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <h4 className="font-medium text-yellow-900 mb-2">Cảnh báo</h4>
                                    <p className="text-sm text-yellow-800">{selectedRecord.warning}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                {selectedRecord.status === 'FAILED' && (
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleReprocess(selectedRecord.id);
                                        }}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Xử lý lại
                                    </button>
                                )}
                                {selectedRecord.status === 'COMPLETED' && (
                                    <button
                                        onClick={() => handleDownloadResult(selectedRecord)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Tải xuống kết quả
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OCRHistory;
