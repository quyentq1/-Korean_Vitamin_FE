import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Download,
  X,
  File,
  FileSpreadsheet,
  Loader2,
  AlertTriangle
} from 'lucide-react';

// UI Components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import FileUpload from '../../components/ui/FileUpload';

// Services
import teacherService from '../../services/teacherService';

const QuestionImport = () => {
  const { t } = useTranslation();
  
  // State
  const [activeTab, setActiveTab] = useState('excel');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [importStats, setImportStats] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    duplicates: 0
  });

  // File validation
  const validateFile = (file) => {
    const validExtensions = activeTab === 'excel' 
      ? ['.xlsx', '.xls'] 
      : ['.docx', '.doc'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const maxSize = activeTab === 'excel' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for Excel, 10MB for Word

    // Check file type
    if (!validExtensions.includes(fileExtension)) {
      setError(t('import.invalidFileType', `Vui lòng chọn file ${validExtensions.join(' hoặc ')}`));
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      setError(t('import.fileTooLarge', `File quá lớn. Kích thước tối đa: ${maxSizeMB}MB`));
      return false;
    }

    setError('');
    return true;
  };

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setPreviewData(null);
      setResult(null);
      
      // Parse file for preview
      parseFileForPreview(selectedFile);
    }
  };

  // Parse file for preview (mock implementation)
  const parseFileForPreview = async (file) => {
    setPreviewing(true);
    try {
      // In real implementation, this would parse the actual file
      // For now, we'll simulate parsing with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockQuestions = [
        {
          id: 1,
          category: 'N1',
          type: 'MULTIPLE_CHOICE',
          content: '다음 중 어법적으로 올바른 문장은?',
          answers: ['A. 가고 싶다', 'B. 가고 싶어요', 'C. 가고 싶습니다', 'D. 가고 싶었어요'],
          correctAnswer: 'C',
          difficulty: 'MEDIUM',
          isValid: true
        },
        {
          id: 2,
          category: 'N2',
          type: 'LISTENING',
          content: '대화를 듣고 질문에 답하시오.',
          answers: ['A. 도서관', 'B. 식당', 'C. 교실', 'D. 운동장'],
          correctAnswer: 'B',
          difficulty: 'HARD',
          isValid: true
        },
        {
          id: 3,
          category: 'N1',
          type: 'WRITING',
          content: '다음 주제에 대해 200자 이내로 쓰시오.',
          answers: ['N/A'],
          correctAnswer: 'N/A',
          difficulty: 'EASY',
          isValid: false,
          error: 'Thiếu nội dung câu hỏi'
        }
      ];

      setParsedQuestions(mockQuestions);
      setImportStats({
        total: mockQuestions.length,
        valid: mockQuestions.filter(q => q.isValid).length,
        invalid: mockQuestions.filter(q => !q.isValid).length,
        duplicates: 0
      });

      setPreviewData({
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
        fileType: file.type,
        questionCount: mockQuestions.length,
        categories: [...new Set(mockQuestions.map(q => q.category))],
        types: [...new Set(mockQuestions.map(q => q.type))]
      });
    } catch (err) {
      setError(t('import.parseError', 'Lỗi khi phân tích file. Vui lòng kiểm tra lại định dạng.'));
      console.error(err);
    } finally {
      setPreviewing(false);
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const serviceCall = activeTab === 'excel'
        ? teacherService.importQuestions(file)
        : teacherService.importQuestionsWord(file);

      const response = await serviceCall;

      setResult({
        type: 'success',
        message: t('import.success', 'Đã nhập thành công {{count}} câu hỏi!', { count: response?.length || parsedQuestions.length }),
        data: response
      });
      
      // Reset form
      setFile(null);
      setPreviewData(null);
      setParsedQuestions([]);
      setShowConfirmModal(false);
    } catch (err) {
      console.error(err);
      setResult({
        type: 'error',
        message: err.response?.data?.message || t('import.error', 'Lỗi khi xử lý file. Vui lòng kiểm tra lại định dạng.')
      });
    } finally {
      setUploading(false);
    }
  };

  // Download template
  const handleDownloadTemplate = () => {
    const templateUrl = activeTab === 'excel' 
      ? '/templates/question_import_template.xlsx'
      : '/templates/question_import_template.docx';
    
    // In real implementation, this would download the actual template file
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = activeTab === 'excel' ? 'question_import_template.xlsx' : 'question_import_template.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset form
  const handleReset = () => {
    setFile(null);
    setPreviewData(null);
    setParsedQuestions([]);
    setResult(null);
    setError('');
    setShowConfirmModal(false);
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('import.title', 'Nhập Câu Hỏi Hàng Loạt')}
        subtitle={t('import.subtitle', 'Nhập danh sách câu hỏi nhanh chóng từ file Excel hoặc Word')}
        breadcrumbs={[
          { label: t('nav.home', 'Trang chủ'), href: '/' },
          { label: t('nav.teacher', 'Giáo viên'), href: '/teacher' },
          { label: t('import.title', 'Nhập Câu Hỏi') }
        ]}
        actions={
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownloadTemplate}
          >
            {t('import.downloadTemplate', 'Tải File Mẫu')}
          </Button>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          icon={<AlertTriangle className="w-5 h-5" />}
          className="mb-6"
          dismissible
          onDismiss={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Result Alert */}
      {result && (
        <Alert
          variant={result.type === 'success' ? 'success' : 'error'}
          icon={result.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          className="mb-6"
          dismissible
          onDismiss={() => setResult(null)}
        >
          {result.message}
        </Alert>
      )}

      {/* Main Card */}
      <Card className="mb-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`flex-1 py-4 px-6 font-medium text-sm transition-colors ${
                activeTab === 'excel'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActiveTab('excel');
                handleReset();
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                {t('import.fromExcel', 'Nhập từ Excel')}
              </div>
            </button>
            <button
              className={`flex-1 py-4 px-6 font-medium text-sm transition-colors ${
                activeTab === 'word'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActiveTab('word');
                handleReset();
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                {t('import.fromWord', 'Nhập từ Word')}
              </div>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <File className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">
                {t('import.instructions', 'Hướng dẫn định dạng {{type}}', { type: activeTab === 'excel' ? 'Excel' : 'Word' })}
              </h3>
              {activeTab === 'excel' ? (
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>{t('import.excelCol1', 'Cột A: Category (VD: N1, N2, R1...)')}</li>
                  <li>{t('import.excelCol2', 'Cột B: Question Type (MULTIPLE_CHOICE, LISTENING...)')}</li>
                  <li>{t('import.excelCol3', 'Cột C: Content (Nội dung câu hỏi)')}</li>
                  <li>{t('import.excelCol4', 'Cột D-G: Answers (Các lựa chọn trả lời)')}</li>
                  <li>{t('import.excelCol5', 'Cột H: Correct Answer (VD: 1, 2, A, B...)')}</li>
                </ul>
              ) : (
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>{t('import.wordRule1', 'Định dạng từng câu hỏi theo chuẩn chung.')}</li>
                  <li>{t('import.wordRule2', 'Bắt đầu bằng số thứ tự (VD: 1. Câu hỏi...)')}</li>
                  <li>{t('import.wordRule3', 'Các đáp án đánh dấu A. B. C. D.')}</li>
                  <li>{t('import.wordRule4', 'Đáp án đúng gạch chân hoặc in đậm.')}</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="p-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={activeTab === 'excel' ? ['.xlsx', '.xls'] : ['.docx', '.doc']}
            maxSize={activeTab === 'excel' ? 5 : 10}
            maxSizeUnit="MB"
            label={t('import.uploadLabel', 'Kéo thả file vào đây hoặc click để chọn file')}
            subLabel={t('import.uploadSubLabel', `Chấp nhận file ${activeTab === 'excel' ? '.xlsx, .xls' : '.docx, .doc'} (tối đa ${activeTab === 'excel' ? '5' : '10'}MB)`)}
            icon={<Upload className="w-12 h-12" />}
          />

          {/* File Info */}
          {file && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<X className="w-4 h-4" />}
                  onClick={handleReset}
                >
                  {t('common.remove', 'Xóa')}
                </Button>
              </div>
            </div>
          )}

          {/* Preview Button */}
          {file && previewData && (
            <div className="mt-4">
              <Button
                variant="secondary"
                className="w-full"
                icon={<Eye className="w-4 h-4" />}
                onClick={() => setShowConfirmModal(true)}
              >
                {t('import.previewQuestions', 'Xem Trước Câu Hỏi')}
              </Button>
            </div>
          )}

          {/* Import Button */}
          {file && previewData && (
            <div className="mt-4">
              <Button
                variant="primary"
                className="w-full"
                icon={<Upload className="w-4 h-4" />}
                onClick={handleImport}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('import.processing', 'Đang xử lý...')}
                  </>
                ) : (
                  t('import.startImport', 'Bắt Đầu Import')
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        size="3xl"
        title={t('import.previewTitle', 'Xem Trước Câu Hỏi')}
      >
        <div className="space-y-6">
          {/* File Info */}
          {previewData && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">
                {t('import.fileInfo', 'Thông Tin File')}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">{t('import.fileName', 'Tên file')}</p>
                  <p className="font-medium">{previewData.fileName}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('import.fileSize', 'Kích thước')}</p>
                  <p className="font-medium">{previewData.fileSize}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('import.questionCount', 'Số câu hỏi')}</p>
                  <p className="font-medium">{previewData.questionCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('import.categories', 'Danh mục')}</p>
                  <p className="font-medium">{previewData.categories.join(', ')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Import Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
              <p className="text-2xl font-bold text-blue-600">{importStats.total}</p>
              <p className="text-sm text-blue-700">{t('import.total', 'Tổng')}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
              <p className="text-2xl font-bold text-green-600">{importStats.valid}</p>
              <p className="text-sm text-green-700">{t('import.valid', 'Hợp lệ')}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
              <p className="text-2xl font-bold text-red-600">{importStats.invalid}</p>
              <p className="text-sm text-red-700">{t('import.invalid', 'Lỗi')}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-center">
              <p className="text-2xl font-bold text-yellow-600">{importStats.duplicates}</p>
              <p className="text-sm text-yellow-700">{t('import.duplicates', 'Trùng')}</p>
            </div>
          </div>

          {/* Questions List */}
          <div className="max-h-96 overflow-y-auto">
            <h4 className="font-semibold text-gray-900 mb-3">
              {t('import.questionList', 'Danh Sách Câu Hỏi')}
            </h4>
            <div className="space-y-3">
              {parsedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border ${
                    question.isValid
                      ? 'border-gray-200 bg-white'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                        {question.category}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                        {question.type}
                      </span>
                    </div>
                    {!question.isValid && (
                      <span className="text-xs text-red-600 font-medium">
                        {question.error}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{question.content}</p>
                  {question.answers.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <p className="font-medium mb-1">{t('import.answers', 'Đáp án')}:</p>
                      <ul className="list-disc list-inside">
                        {question.answers.map((answer, i) => (
                          <li key={i} className={i === 0 ? 'font-medium' : ''}>
                            {answer}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowConfirmModal(false)}
            >
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              icon={<Upload className="w-4 h-4" />}
              onClick={handleImport}
              disabled={uploading || importStats.invalid > 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('import.processing', 'Đang xử lý...')}
                </>
              ) : (
                t('import.confirmImport', 'Xác Nhận Import')
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Loading Overlay */}
      {uploading && (
        <Loading.Overlay
          message={t('import.importing', 'Đang nhập câu hỏi...')}
        />
      )}
    </PageContainer>
  );
};

export default QuestionImport;
