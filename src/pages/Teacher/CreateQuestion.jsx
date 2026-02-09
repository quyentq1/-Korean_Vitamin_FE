import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  Upload,
  X,
  Plus,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react';
import teacherService from '../../services/teacherService';
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Alert,
  Loading,
  Badge,
  Modal,
  FileUpload
} from '../../components/ui';

/**
 * CreateQuestion Component
 *
 * Enhanced question creation with:
 * - Multi-step form
 * - Rich text editor (simulated)
 * - Image/audio upload
 * - Preview before save
 *
 * @component
 */
const CreateQuestion = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Question state
  const [question, setQuestion] = useState({
    type: 'MULTIPLE_CHOICE',
    category: 'N1',
    difficulty: 'EASY',
    content: '',
    answers: [
      { id: 1, content: '', isCorrect: false },
      { id: 2, content: '', isCorrect: false },
      { id: 3, content: '', isCorrect: false },
      { id: 4, content: '', isCorrect: false },
    ],
    explanation: '',
    imageFile: null,
    audioFile: null,
    videoFile: null
  });

  // Auto-save state
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-save effect
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (question.content || question.answers.some(a => a.content)) {
        handleAutoSave();
      }
    }, 5000); // Auto-save every 5 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [question]);

  // Handle auto-save
  const handleAutoSave = async () => {
    setAutoSaving(true);
    try {
      // TODO: Implement auto-save to localStorage or API
      // localStorage.setItem('draft-question', JSON.stringify(question));
      setLastSaved(new Date());
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setAutoSaving(false);
    }
  };

  // Validate current step
  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!question.type) errors.type = t('qb.error.required', 'Vui lòng chọn loại câu hỏi');
      if (!question.category) errors.category = t('qb.error.required', 'Vui lòng chọn danh mục');
      if (!question.difficulty) errors.difficulty = t('qb.error.required', 'Vui lòng chọn độ khó');
    }

    if (step === 2) {
      if (!question.content.trim()) errors.content = t('qb.error.required', 'Vui lòng nhập nội dung câu hỏi');
    }

    if (step === 3) {
      if (['MULTIPLE_CHOICE', 'READING', 'LISTENING'].includes(question.type)) {
        const hasAnswer = question.answers.some(a => a.content.trim());
        const hasCorrect = question.answers.some(a => a.isCorrect);
        
        if (!hasAnswer) errors.answers = t('qb.error.required', 'Vui lòng nhập ít nhất một đáp án');
        if (!hasCorrect) errors.correct = t('qb.error.required', 'Vui lòng chọn đáp án đúng');
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle answer change
  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...question.answers];
    if (field === 'isCorrect') {
      newAnswers.forEach(a => a.isCorrect = false); // Only one correct answer for now
    }
    newAnswers[index][field] = value;
    setQuestion(prev => ({ ...prev, answers: newAnswers }));
  };

  // Handle add answer
  const handleAddAnswer = () => {
    const newAnswer = {
      id: question.answers.length + 1,
      content: '',
      isCorrect: false
    };
    setQuestion(prev => ({ ...prev, answers: [...prev.answers, newAnswer] }));
  };

  // Handle remove answer
  const handleRemoveAnswer = (index) => {
    if (question.answers.length <= 2) {
      setError(t('qb.error.minAnswers', 'Cần ít nhất 2 đáp án'));
      return;
    }
    setQuestion(prev => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index)
    }));
  };

  // Handle file upload
  const handleFileUpload = (field, file) => {
    setQuestion(prev => ({ ...prev, [field]: file }));
  };

  // Handle preview
  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // await teacherService.createQuestion(question);
      
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      
      // Clear draft
      // localStorage.removeItem('draft-question');
      
      setError('');
      navigate('/question-bank');
    } catch (err) {
      console.error('Error creating question:', err);
      setError(t('qb.error.createFailed', 'Không thể tạo câu hỏi. Vui lòng thử lại sau.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Render step 1: Basic Info
  const renderStep1 = () => {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            {t('qb.step1.title', 'Thông tin cơ bản')}
          </h3>
          
          <div className="space-y-6">
            {/* Question Type */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                {t('qb.type', 'Loại câu hỏi')} <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
                value={question.type}
                onChange={e => setQuestion({ ...question, type: e.target.value })}
              >
                <option value="MULTIPLE_CHOICE">{t('qb.multipleChoice', 'Trắc Nghiệm')}</option>
                <option value="LISTENING">{t('qb.listening', 'Nghe Hiểu')}</option>
                <option value="WRITING">{t('qb.writing', 'Viết')}</option>
                <option value="READING">{t('qb.reading', 'Đọc Hiểu')}</option>
                <option value="TRANSLATION">{t('qb.translation', 'Dịch')}</option>
              </select>
              {validationErrors.type && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.type}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                {t('qb.category', 'Danh mục')} <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
                value={question.category}
                onChange={e => setQuestion({ ...question, category: e.target.value })}
              >
                <option value="N1">N1 - Sơ Cấp 1</option>
                <option value="N2">N2 - Sơ Cấp 2</option>
                <option value="N3">N3 - Trung Cấp 1</option>
                <option value="N4">N4 - Trung Cấp 2</option>
                <option value="N5">N5 - Cao Cấp</option>
              </select>
              {validationErrors.category && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.category}
                </p>
              )}
            </div>

            {/* Difficulty */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                {t('qb.difficulty', 'Độ khó')} <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
                value={question.difficulty}
                onChange={e => setQuestion({ ...question, difficulty: e.target.value })}
              >
                <option value="EASY">{t('qb.easy', 'Dễ')}</option>
                <option value="MEDIUM">{t('qb.medium', 'Trung bình')}</option>
                <option value="HARD">{t('qb.hard', 'Khó')}</option>
              </select>
              {validationErrors.difficulty && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.difficulty}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Render step 2: Question Content
  const renderStep2 = () => {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            {t('qb.step2.title', 'Nội dung câu hỏi')}
          </h3>
          
          <div className="space-y-6">
            {/* Question Content */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                {t('qb.content', 'Nội dung')} <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition min-h-[200px]"
                placeholder={t('qb.contentPlaceholder', 'Nhập nội dung câu hỏi...')}
                value={question.content}
                onChange={e => setQuestion({ ...question, content: e.target.value })}
              />
              {validationErrors.content && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.content}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                {t('qb.image', 'Hình ảnh')}
              </label>
              <FileUpload
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
                onFileChange={(file) => handleFileUpload('imageFile', file)}
                preview={question.imageFile}
              />
            </div>

            {/* Audio Upload (for Listening) */}
            {question.type === 'LISTENING' && (
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  {t('qb.audio', 'File âm thanh')}
                </label>
                <FileUpload
                  accept="audio/*"
                  maxSize={10 * 1024 * 1024} // 10MB
                  onFileChange={(file) => handleFileUpload('audioFile', file)}
                  preview={question.audioFile}
                />
              </div>
            )}

            {/* Video Upload (for Writing/Translation) */}
            {['WRITING', 'TRANSLATION'].includes(question.type) && (
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  {t('qb.video', 'Video')}
                </label>
                <FileUpload
                  accept="video/*"
                  maxSize={50 * 1024 * 1024} // 50MB
                  onFileChange={(file) => handleFileUpload('videoFile', file)}
                  preview={question.videoFile}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Render step 3: Answers
  const renderStep3 = () => {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            {t('qb.step3.title', 'Đáp án')}
          </h3>
          
          {/* Multiple Choice Answers */}
          {['MULTIPLE_CHOICE', 'READING', 'LISTENING'].includes(question.type) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <label className="block font-medium text-gray-700">
                  {t('qb.answers', 'Đáp án lựa chọn')}
                </label>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleAddAnswer}
                >
                  {t('qb.addAnswer', 'Thêm đáp án')}
                </Button>
              </div>
              
              {question.answers.map((ans, idx) => (
                <div
                  key={ans.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition ${
                    ans.isCorrect
                      ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center h-5">
                    <input
                      id={`ans-${idx}`}
                      type="radio"
                      name="correct-answer"
                      className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                      checked={ans.isCorrect}
                      onChange={(e) => handleAnswerChange(idx, 'isCorrect', e.target.checked)}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border-0 bg-transparent focus:ring-0 placeholder-gray-400 font-medium"
                      placeholder={`${t('qb.answerPlaceholder', 'Nhập đáp án')} ${idx + 1}...`}
                      value={ans.content}
                      onChange={(e) => handleAnswerChange(idx, 'content', e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleRemoveAnswer(idx)}
                    disabled={question.answers.length <= 2}
                  />
                  {ans.isCorrect && (
                    <Badge variant="success" size="sm">
                      {t('qb.correct', 'Đúng')}
                    </Badge>
                  )}
                </div>
              ))}
              
              {validationErrors.answers && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.answers}
                </p>
              )}
              {validationErrors.correct && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.correct}
                </p>
              )}
            </div>
          )}

          {/* Explanation */}
          <div className="mt-6">
            <label className="block font-medium text-gray-700 mb-2">
              {t('qb.explanation', 'Giải thích')}
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition min-h-[150px]"
              placeholder={t('qb.explanationPlaceholder', 'Giải thích tại sao đáp án đúng...')}
              value={question.explanation}
              onChange={e => setQuestion({ ...question, explanation: e.target.value })}
            />
          </div>
        </div>
      </Card>
    );
  };

  // Render step 4: Preview
  const renderStep4 = () => {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            {t('qb.step4.title', 'Xem trước')}
          </h3>
          
          <div className="space-y-6">
            {/* Question Preview */}
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="info" size="sm">
                  {question.type}
                </Badge>
                <Badge variant="info" size="sm">
                  {question.category}
                </Badge>
                <Badge variant={question.difficulty === 'EASY' ? 'success' : question.difficulty === 'MEDIUM' ? 'warning' : 'error'}>
                  {question.difficulty}
                </Badge>
              </div>
              <p className="text-gray-900 font-medium">{question.content || t('qb.noContent', 'Chưa có nội dung')}</p>
            </div>

            {/* Image Preview */}
            {question.imageFile && (
              <div className="p-6 bg-gray-50 rounded-xl">
                <img
                  src={URL.createObjectURL(question.imageFile)}
                  alt="Question image"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* Audio Preview */}
            {question.audioFile && (
              <div className="p-6 bg-gray-50 rounded-xl">
                <audio controls className="w-full">
                  <source src={URL.createObjectURL(question.audioFile)} type={question.audioFile.type} />
                </audio>
              </div>
            )}

            {/* Video Preview */}
            {question.videoFile && (
              <div className="p-6 bg-gray-50 rounded-xl">
                <video controls className="max-w-full h-auto rounded-lg">
                  <source src={URL.createObjectURL(question.videoFile)} type={question.videoFile.type} />
                </video>
              </div>
            )}

            {/* Answers Preview */}
            {['MULTIPLE_CHOICE', 'READING', 'LISTENING'].includes(question.type) && (
              <div className="space-y-3">
                <label className="block font-medium text-gray-700">
                  {t('qb.answers', 'Đáp án')}
                </label>
                {question.answers.map((ans, idx) => (
                  <div
                    key={ans.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      ans.isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <span className="font-mono text-gray-500">{String.fromCharCode(65 + idx)}.</span>
                    <span className="flex-1">{ans.content || t('qb.noContent', 'Chưa có nội dung')}</span>
                    {ans.isCorrect && (
                      <Badge variant="success" size="sm">
                        <Check className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Explanation Preview */}
            {question.explanation && (
              <div className="p-6 bg-blue-50 rounded-xl">
                <label className="block font-medium text-blue-900 mb-2">
                  {t('qb.explanation', 'Giải thích')}
                </label>
                <p className="text-blue-700">{question.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Render step indicator
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
          <React.Fragment key={step}>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition ${
                currentStep === step
                  ? 'bg-primary-600 text-white'
                  : currentStep > step
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > step ? <Check className="w-5 h-5" /> : step}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`w-16 h-1 ${
                  currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render preview modal
  const renderPreviewModal = () => {
    return (
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={t('qb.previewTitle', 'Xem trước câu hỏi')}
        size="2xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowPreviewModal(false)}
            >
              {t('common.close', 'Đóng')}
            </Button>
            <Button
              variant="primary"
              icon={<Save className="w-5 h-5" />}
              onClick={() => {
                setShowPreviewModal(false);
                handleSubmit();
              }}
              disabled={submitting}
            >
              {submitting ? t('qb.saving', 'Đang lưu...') : t('qb.save', 'Lưu')}
            </Button>
          </div>
        }
      >
        {renderStep4()}
      </Modal>
    );
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('qb.createNew', 'Tạo Câu Hỏi Mới')}
        subtitle={t('qb.createSubtitle', 'Tạo câu hỏi mới cho ngân hàng câu hỏi')}
        actions={[
          {
            label: t('qb.preview', 'Xem trước'),
            icon: Eye,
            variant: 'ghost',
            onClick: handlePreview,
          },
        ]}
      />

      {/* Error Alert */}
      {error && (
        <Alert type="error" dismissible onDismiss={() => setError('')} className="mb-6">
          {error}
        </Alert>
      )}

      {/* Auto-save indicator */}
      {autoSaving && (
        <Alert type="info" className="mb-6">
          {t('qb.autoSaving', 'Đang tự động lưu...')}
        </Alert>
      )}
      {lastSaved && !autoSaving && (
        <div className="text-sm text-gray-500 mb-6">
          {t('qb.lastSaved', 'Lưu lần cuối:')} {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="secondary"
          icon={<ArrowLeft className="w-5 h-5" />}
          onClick={handlePreviousStep}
          disabled={currentStep === 1}
        >
          {t('common.previous', 'Quay lại')}
        </Button>
        
        {currentStep < totalSteps ? (
          <Button
            variant="primary"
            icon={<ArrowRight className="w-5 h-5" />}
            onClick={handleNextStep}
          >
            {t('common.next', 'Tiếp theo')}
          </Button>
        ) : (
          <Button
            variant="primary"
            icon={<Save className="w-5 h-5" />}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? t('qb.saving', 'Đang lưu...') : t('qb.save', 'Lưu câu hỏi')}
          </Button>
        )}
      </div>

      {/* Preview Modal */}
      {renderPreviewModal()}
    </PageContainer>
  );
};

export default CreateQuestion;
