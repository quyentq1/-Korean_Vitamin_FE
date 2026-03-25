import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  X,
  Plus,
  Trash2,
  Type,
  BookOpen,
  BarChart3,
  Lightbulb,
  FileText,
  AlignLeft,
  CheckCircle2,
  Mic,
  Upload,
  Volume2
} from 'lucide-react';
import teacherService from '../../services/teacherService';
import { Button, Modal } from '../ui';

/**
 * QuestionFormModal Component
 *
 * Modal form for creating/editing questions
 *
 * @component
 */
const QuestionFormModal = ({ isOpen, onClose, questionId }) => {
  const { t } = useTranslation();
  const isEditMode = !!questionId;

  // State
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(isEditMode);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Audio upload state
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const audioInputRef = React.useRef(null);

  // Question state
  const [question, setQuestion] = useState({
    questionType: 'MULTIPLE_CHOICE',
    answerType: 'SINGLE', // SINGLE or MULTIPLE - determines if answers are radio or checkbox
    category: '',
    level: 'LEVEL_1',
    topikType: '', // NEW: TOPIK type (R1, L1, W51...)
    points: 1, // NEW: Default points
    content: '',
    answers: [
      { id: 1, content: '', isCorrect: false },
      { id: 2, content: '', isCorrect: false },
      { id: 3, content: '', isCorrect: false },
      { id: 4, content: '', isCorrect: false },
    ],
    explanation: '',
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Categories state
  const [categories, setCategories] = useState([]);

  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await teacherService.getAllCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        // Fallback to default categories if API fails
        setCategories([
          { id: 1, name: 'Grammar' },
          { id: 2, name: 'Vocabulary' },
          { id: 3, name: 'Reading' },
          { id: 4, name: 'Listening' },
          { id: 5, name: 'Writing' }
        ]);
      }
    };
    fetchCategories();
  }, []);
  // Load existing question when in edit mode
  useEffect(() => {
    if (!isEditMode) {
      setQuestion({
        questionType: 'MULTIPLE_CHOICE',
        answerType: 'MULTIPLE',
        category: '',
        level: 'LEVEL_1',
        topikType: '', // NEW: Reset topikType
        content: '',
        answers: [
          { id: 1, content: '', isCorrect: false },
          { id: 2, content: '', isCorrect: false },
          { id: 3, content: '', isCorrect: false },
          { id: 4, content: '', isCorrect: false },
        ],
        explanation: '',
      });
      // Reset audio when creating new question
      setAudioUrl('');
      setAudioFile(null);
      return;
    }

    const loadQuestion = async () => {
      setLoadingQuestion(true);
      try {
        const response = await teacherService.getQuestion(questionId);
        const data = response.data || response;

        console.log('=== LOAD QUESTION DATA ===');
        console.log('Raw response:', response);
        console.log('Data keys:', Object.keys(data));
        console.log('Answers from API:', data.answers);
        console.log('Options from API:', data.options);
        console.log('Answers count:', data.answers?.length);
        console.log('Options count:', data.options?.length);

        // Handle category
        let categoryValue = '';
        if (typeof data.category === 'object' && data.category !== null) {
          // Category could be {id: 1, name: 'Grammar'} or just an ID wrapped in object
          categoryValue = data.category.id?.toString() ||
                         data.category.id ||
                         data.category.categoryId?.toString() ||
                         data.category.name?.toString() ||
                         '';
          console.log('Category object:', data.category, 'Mapped to:', categoryValue);
        } else if (data.category) {
          categoryValue = data.category.toString();
          console.log('Category primitive:', data.category, 'Mapped to:', categoryValue);
        }

        // Also try to get category from categoryName or categoryId
        if (!categoryValue && data.categoryName) {
          // Try to find category by name
          const matchingCat = categories.find(c =>
            c.name === data.categoryName ||
            c.name.split(' - ')[0] === data.categoryName
          );
          categoryValue = matchingCat?.id?.toString() || '';
          console.log('Category from categoryName:', data.categoryName, 'Found:', matchingCat);
        }

        // Handle answers
        let mappedAnswers = [
          { id: 1, content: '', isCorrect: false },
          { id: 2, content: '', isCorrect: false },
          { id: 3, content: '', isCorrect: false },
          { id: 4, content: '', isCorrect: false },
        ];

        if (data.answers && Array.isArray(data.answers)) {
          console.log('Loading from data.answers:', data.answers);
          mappedAnswers = data.answers.map((ans, index) => ({
            id: ans.id || ans.answerId || index + 1,
            content: ans.answerText || ans.content || ans.text || '',
            isCorrect: ans.isCorrect || ans.correct || false
          }));
        } else if (data.options && Array.isArray(data.options)) {
          console.log('Loading from data.options:', data.options);
          mappedAnswers = data.options.map((opt, index) => ({
            id: opt.id || opt.optionId || index + 1,
            content: opt.optionText || opt.content || opt.text || '',
            isCorrect: opt.isCorrect || opt.correct || false
          }));
        } else {
          console.log('No answers or options found in data');
        }

        console.log('Mapped answers:', mappedAnswers);

        // Load question type and answer type from backend
        let questionTypeValue = data.questionType || data.type || 'MULTIPLE_CHOICE';
        let answerTypeValue = data.answerType || 'MULTIPLE'; // Read from backend if available

        // Fallback: Determine answerType from questionType for old data
        if (!data.answerType) {
          if (questionTypeValue === 'SINGLE_CHOICE') {
            answerTypeValue = 'SINGLE';
          } else if (questionTypeValue === 'MULTIPLE_CHOICE' ||
                     questionTypeValue === 'LISTENING' ||
                     questionTypeValue === 'READING') {
            answerTypeValue = 'MULTIPLE';
          }
        }

        // Handle topikType - could be enum object {name: "R1"} or string "R1"
        let topikTypeValue = '';
        if (typeof data.topikType === 'object' && data.topikType !== null) {
          topikTypeValue = data.topikType.name || '';
        } else if (data.topikType) {
          topikTypeValue = data.topikType;
        } else if (data.topik_type) {
          topikTypeValue = data.topik_type;
        }

        console.log('Setting question state with:', {
          questionType: questionTypeValue,
          answerType: answerTypeValue,
          category: categoryValue,
          level: data.level,
          topikType: topikTypeValue,
          topikTypeRaw: data.topikType,
          answersCount: mappedAnswers.length,
          answers: mappedAnswers
        });

        setQuestion({
          questionType: questionTypeValue,
          answerType: answerTypeValue,
          category: categoryValue,
          level: data.level || 'LEVEL_1',
          topikType: topikTypeValue, // NEW: Load topikType
          points: data.points || 1, // NEW: Load points
          content: data.questionText || data.content || '',
          answers: mappedAnswers,
          explanation: data.explanation || data.explain || data.solution || data.explanationText || '',
        });

        // Load audio URL if exists
        console.log('Loading question data:', data);
        console.log('questionMediaUrl:', data.questionMediaUrl);
        console.log('audioUrl:', data.audioUrl);

        if (data.questionMediaUrl || data.audioUrl) {
          setAudioUrl(data.questionMediaUrl || data.audioUrl);
          console.log('Audio URL set to:', data.questionMediaUrl || data.audioUrl);
        } else {
          setAudioUrl('');
          console.log('No audio URL found, set to empty');
        }
      } catch (err) {
        console.error('Error loading question:', err);
        setError('Không thể tải dữ liệu câu hỏi. Vui lòng thử lại.');
      } finally {
        setLoadingQuestion(false);
      }
    };
    loadQuestion();
  }, [questionId, isEditMode]);

  // Auto-reset answerType when questionType changes
  useEffect(() => {
    if (question.questionType === 'FILL_BLANK' ||
        question.questionType === 'WRITING' ||
        question.questionType === 'SPEAKING' ||
        question.questionType === 'SHORT_ANSWER' ||
        question.questionType === 'ESSAY') {
      // These types don't need answerType, set to null or undefined
      setQuestion(prev => ({ ...prev, answerType: undefined }));
    } else if (question.questionType === 'SINGLE_CHOICE') {
      // SINGLE_CHOICE always uses SINGLE answer type
      setQuestion(prev => ({ ...prev, answerType: 'SINGLE' }));
    } else if (question.questionType === 'MULTIPLE_CHOICE' ||
               question.questionType === 'LISTENING' ||
               question.questionType === 'READING') {
      // These types support both SINGLE and MULTIPLE
      // Only set default if answerType is not already set
      if (!question.answerType ||
          question.answerType === 'undefined' ||
          !['SINGLE', 'MULTIPLE'].includes(question.answerType)) {
        setQuestion(prev => ({ ...prev, answerType: 'MULTIPLE' }));
      }
    }
  }, [question.questionType]);

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!question.questionType) errors.questionType = 'Vui lòng chọn loại câu hỏi';
    if (!question.category) errors.category = 'Vui lòng chọn danh mục';
    if (!question.level) errors.level = 'Vui lòng chọn cấp độ';

    // Only validate topikType for NEW questions (not edit mode)
    // Old questions might not have topikType
    if (!isEditMode && !question.topikType) {
      errors.topikType = 'Vui lòng chọn Topik Type';
    }

    if (!question.content.trim()) errors.content = 'Vui lòng nhập nội dung câu hỏi';

    if (['MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'READING', 'LISTENING'].includes(question.questionType)) {
      const hasAnswer = question.answers.some(a => a.content.trim());
      const hasCorrect = question.answers.some(a => a.isCorrect);

      if (!hasAnswer) errors.answers = 'Vui lòng nhập ít nhất một đáp án';
      if (!hasCorrect) errors.correct = 'Vui lòng chọn ít nhất một đáp án đúng';
    }

    // Validate audio for LISTENING questions
    if (question.questionType === 'LISTENING' && !audioUrl) {
      errors.audio = 'Vui lòng upload file audio cho câu hỏi nghe hiểu';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      // Prepare request data with proper format for backend
      // Backend expects: { question: {...}, options: [...] }
      const categoryNum = parseInt(question.category) || 1;

      // Send questionType and answerType separately - backend now supports both!
      const requestData = {
        question: {
          questionType: question.questionType,
          answerType: question.answerType,
          category: {
            id: categoryNum
          },
          level: question.level,
          topikType: question.topikType || null, // NEW: Include topikType
          questionText: question.content,
          explanation: question.explanation,
          questionMediaUrl: audioUrl || null,
          points: question.points || 1, // Use points from state or default to 1
          active: true
        },
        options: question.answers.map(ans => ({
          optionText: ans.content,
          isCorrect: ans.isCorrect
        }))
      };

      console.log('=== SUBMIT FORM ===');
      console.log('Question state:', question);
      console.log('topikType value:', question.topikType);
      console.log('topikType type:', typeof question.topikType);
      console.log('Current audioUrl state:', audioUrl);
      console.log('questionMediaUrl being sent:', requestData.question.questionMediaUrl);
      console.log('Full request data:', JSON.stringify(requestData, null, 2));

      if (isEditMode) {
        const response = await teacherService.updateQuestion(questionId, requestData);
        console.log('Update response:', response);
        setSuccessMessage('Cập nhật câu hỏi thành công!');
      } else {
        const response = await teacherService.createQuestion(requestData);
        console.log('Create response:', response);
        setSuccessMessage('Tạo câu hỏi mới thành công!');
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error saving question:', err);
      setError(isEditMode
        ? 'Không thể cập nhật câu hỏi. Vui lòng thử lại.'
        : 'Không thể tạo câu hỏi. Vui lòng thử lại sau.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle success modal confirm
  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    onClose(true); // Close with refresh = true
  };

  // Handle close modal
  const handleClose = () => {
    if (!submitting) {
      onClose(false);
    }
  };

  // Update answer
  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...question.answers];

    if (field === 'isCorrect') {
      if (question.answerType === 'SINGLE') {
        // For single choice, only one answer can be correct
        newAnswers.forEach((ans, i) => {
          ans.isCorrect = i === index;
        });
      } else {
        // For multiple choice, toggle the correct status (multi-select allowed)
        newAnswers[index][field] = !newAnswers[index][field];
      }
    } else {
      newAnswers[index][field] = value;
    }

    setQuestion({ ...question, answers: newAnswers });
  };

  // Add answer
  const handleAddAnswer = () => {
    setQuestion({
      ...question,
      answers: [
        ...question.answers,
        { id: question.answers.length + 1, content: '', isCorrect: false }
      ]
    });
  };

  // Remove answer
  const handleRemoveAnswer = (index) => {
    if (question.answers.length <= 2) return; // Minimum 2 answers
    const newAnswers = question.answers.filter((_, i) => i !== index);
    setQuestion({ ...question, answers: newAnswers });
  };

  // Handle audio file selection
  const handleAudioFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/aac'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg|aac)$/i)) {
        setError('Chỉ chấp nhận file audio (mp3, wav, m4a, ogg, aac)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File audio không vượt quá 10MB');
        return;
      }

      setAudioFile(file);
      setError('');
    }
  };

  // Handle upload audio
  const handleUploadAudio = async () => {
    if (!audioFile) return;

    setUploadingAudio(true);
    setError('');

    try {
      console.log('Uploading audio file:', audioFile.name);
      const response = await teacherService.uploadAudio(audioFile);
      console.log('Upload audio response:', response);

      // AxiosClient interceptor already unwraps response.data
      // So response here IS the data, not response.data
      const url = response.audioUrl || response.url || response;
      console.log('Extracted audio URL:', url);

      if (url) {
        setAudioUrl(url);
        setAudioFile(null);
        console.log('✅ Audio URL set successfully:', url);
        setError(''); // Clear any previous errors
      } else {
        console.error('❌ No URL in response:', response);
        setError('Không thể upload audio. Server không trả về URL.');
      }
    } catch (err) {
      console.error('❌ Error uploading audio:', err);
      setError('Không thể upload audio. Vui lòng thử lại.');
    } finally {
      setUploadingAudio(false);
    }
  };

  // Handle remove audio
  const handleRemoveAudio = () => {
    setAudioUrl('');
    setAudioFile(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  if (loadingQuestion) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEditMode ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
        size="2xl"
      >
        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-3 sm:mt-4 text-gray-600 font-medium text-sm sm:text-base">Đang tải dữ liệu...</p>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEditMode ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
        size="full"
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 sm:px-6 py-3 w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 sm:px-6 py-3 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
            >
              {submitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang lưu...
                </span>
              ) : isEditMode ? (
                'Cập nhật'
              ) : (
                'Tạo câu hỏi'
              )}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Error message */}
          {error && (
            <div className="p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-r-xl text-red-700 flex items-start gap-3 text-sm">
              <X className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Basic Info Section */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Thông tin cơ bản</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Type className="w-4 h-4 text-gray-500" />
                  Loại câu hỏi <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white shadow-sm text-sm"
                  value={question.questionType}
                  onChange={e => setQuestion({ ...question, questionType: e.target.value })}
                >
                  <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                  <option value="FILL_BLANK">Điền vào chỗ trống</option>
                  <option value="READING">Đọc hiểu</option>
                  <option value="LISTENING">Nghe hiểu</option>
                  <option value="WRITING">Viết</option>
                  <option value="SPEAKING">Nói</option>
                </select>
                {validationErrors.questionType && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />{validationErrors.questionType}
                  </p>
                )}
              </div>

              {/* Answer Type - Show for MULTIPLE_CHOICE, LISTENING, READING */}
              {['MULTIPLE_CHOICE', 'LISTENING', 'READING'].includes(question.questionType) && (
                <div>
                  <label className="block font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    Loại đáp án <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white shadow-sm text-sm"
                    value={question.answerType}
                    onChange={e => setQuestion({ ...question, answerType: e.target.value })}
                  >
                    <option value="SINGLE">Một đáp án đúng</option>
                    <option value="MULTIPLE">Nhiều đáp án đúng</option>
                  </select>
                  <p className="text-gray-500 text-xs mt-1">
                    {question.answerType === 'SINGLE' ? 'Radio button - Chỉ chọn 1' : 'Checkbox - Chọn nhiều'}
                  </p>
                </div>
              )}

              <div>
                <label className="block font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white shadow-sm text-sm"
                  value={question.category}
                  onChange={e => setQuestion({ ...question, category: e.target.value })}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {validationErrors.category && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />{validationErrors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  Cấp độ <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white shadow-sm text-sm"
                  value={question.level}
                  onChange={e => setQuestion({ ...question, level: e.target.value })}
                >
                  <option value="LEVEL_1">Level 1 - Dễ nhất</option>
                  <option value="LEVEL_2">Level 2 - Dễ</option>
                  <option value="LEVEL_3">Level 3 - Trung bình</option>
                  <option value="LEVEL_4">Level 4 - Khá</option>
                  <option value="LEVEL_5">Level 5 - Khó</option>
                  <option value="LEVEL_6">Level 6 - Khó nhất</option>
                </select>
                {validationErrors.level && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />{validationErrors.level}
                  </p>
                )}
              </div>

              {/* TopikType */}
              <div>
                <label className="block font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Topik Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white shadow-sm text-sm"
                  value={question.topikType}
                  onChange={e => setQuestion({ ...question, topikType: e.target.value })}
                >
                  <option value="">-- Chọn Topik Type --</option>
                  <option value="R1">R1 - Ngữ pháp/Từ vựng</option>
                  <option value="R2">R2 - Đọc hiểu văn bản thực tế</option>
                  <option value="R3">R3 - Đọc biểu đồ/bảng biểu</option>
                  <option value="R4">R4 - Sắp xếp thứ tự câu</option>
                  <option value="R5">R5 - Đọc đoạn văn cơ bản</option>
                  <option value="R6">R6 - Đọc bài viết ngắn</option>
                  <option value="R7">R7 - Đọc đoạn văn dài</option>
                  <option value="R8">R8 - Chọn tiêu đề/chủ đề chính</option>
                  <option value="R9">R9 - Đọc bài viết chuyên sâu</option>
                  <option value="L1">L1 - Nghe chọn hình/biểu đồ</option>
                  <option value="L2">L2 - Nghe chọn câu trả lời</option>
                  <option value="L3">L3 - Nghe chọn hành động</option>
                  <option value="L4">L4 - Nghe chọn nội dung giống</option>
                  <option value="L5">L5 - Nghe chọn suy nghĩ/ý định</option>
                  <option value="L6">L6 - Nghe hội thoại dài</option>
                  <option value="L7">L7 - Nghe bài giảng chuyên môn</option>
                  <option value="W51">W51 - Điền vào chỗ trống - Đời sống</option>
                  <option value="W52">W52 - Điền vào chỗ trống - Giải thích</option>
                  <option value="W53">W53 - Viết bài luận ngắn - Biểu đồ</option>
                  <option value="W54">W54 - Viết bài luận dài - Nghị luận</option>
                </select>
                {validationErrors.topikType && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />{validationErrors.topikType}
                  </p>
                )}
              </div>

              {/* Points */}
              <div>
                <label className="block font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Lightbulb className="w-4 h-4 text-gray-500" />
                  Điểm <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white shadow-sm text-sm"
                  value={question.points}
                  onChange={e => setQuestion({ ...question, points: parseInt(e.target.value) || 1 })}
                  placeholder="Nhập điểm cho câu hỏi"
                />
              </div>
            </div>
          </div>

          {/* Question Content Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-200">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <AlignLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Nội dung câu hỏi</h3>
            </div>

            <textarea
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none transition-all bg-white shadow-sm text-sm"
              placeholder="Nhập nội dung câu hỏi..."
              value={question.content}
              onChange={e => setQuestion({ ...question, content: e.target.value })}
            />
            {validationErrors.content && (
              <p className="text-red-500 text-xs sm:text-sm mt-2 flex items-center gap-1">
                <X className="w-3 h-3" />{validationErrors.content}
              </p>
            )}
          </div>

          {/* Answers Section */}
          {['MULTIPLE_CHOICE', 'LISTENING', 'READING'].includes(question.questionType) && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Đáp án</h3>
                  <span className="text-xs text-gray-500">
                    {question.answerType === 'SINGLE'
                      ? '(Chỉ chọn 1 đáp án đúng)'
                      : '(Có thể chọn nhiều đáp án đúng)'}
                  </span>
                </div>
                {question.answers.length < 6 && (
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg text-sm w-full sm:w-auto"
                    onClick={handleAddAnswer}
                  >
                    <Plus className="w-4 h-4" />
                    Thêm đáp án
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {question.answers.map((answer, index) => (
                  <div
                    key={answer.id}
                    className={`flex items-center gap-2 sm:gap-3 p-3 rounded-xl border-2 transition-all ${
                      answer.isCorrect
                        ? 'bg-green-100 border-green-400 shadow-md'
                        : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-md'
                    }`}
                  >
                    <label className="cursor-pointer relative flex-shrink-0">
                      {question.answerType === 'SINGLE' ? (
                        <>
                          <input
                            type="radio"
                            name="correct-answer"
                            checked={answer.isCorrect}
                            onChange={() => handleAnswerChange(index, 'isCorrect')}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            answer.isCorrect
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-green-400 bg-white'
                          }`}>
                            {answer.isCorrect && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                          </div>
                        </>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            checked={answer.isCorrect}
                            onChange={() => handleAnswerChange(index, 'isCorrect')}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center transition-all ${
                            answer.isCorrect
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-green-400 bg-white'
                          }`}>
                            {answer.isCorrect && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                          </div>
                        </>
                      )}
                    </label>

                    <input
                      type="text"
                      className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all bg-white text-sm"
                      placeholder={`Đáp án ${index + 1}`}
                      value={answer.content}
                      onChange={e => handleAnswerChange(index, 'content', e.target.value)}
                    />

                    {question.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAnswer(index)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {validationErrors.answers && (
                <p className="text-red-500 text-xs sm:text-sm mt-3 flex items-center gap-1">
                  <X className="w-3 h-3" />{validationErrors.answers}
                </p>
              )}
              {validationErrors.correct && (
                <p className="text-red-500 text-xs sm:text-sm mt-3 flex items-center gap-1">
                  <X className="w-3 h-3" />{validationErrors.correct}
                </p>
              )}
            </div>
          )}

          {/* Explanation Section */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 sm:p-6 border border-amber-200">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Giải thích</h3>
            </div>

            <textarea
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none resize-none transition-all bg-white shadow-sm text-sm"
              placeholder="Nhập giải thích cho câu hỏi để giúp học viên hiểu rõ hơn..."
              value={question.explanation}
              onChange={e => setQuestion({ ...question, explanation: e.target.value })}
            />
          </div>

          {/* Audio Section - Only for LISTENING type */}
          {question.questionType === 'LISTENING' && (
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 sm:p-6 border border-purple-200">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">File Audio (Nghe hiểu)</h3>
              </div>

              {audioUrl ? (
                // Display existing audio
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-purple-200">
                    <Volume2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <audio
                      controls
                      className="flex-1 h-10"
                      src={audioUrl}
                    >
                      Your browser does not support the audio element.
                    </audio>
                    <button
                      type="button"
                      onClick={handleRemoveAudio}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all flex-shrink-0"
                      title="Xóa audio"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                // Upload new audio
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileSelect}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all bg-white text-sm file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                    <button
                      type="button"
                      onClick={handleUploadAudio}
                      disabled={!audioFile || uploadingAudio}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl transition-all shadow-md hover:shadow-lg text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      {uploadingAudio ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Đang upload...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                  {audioFile && (
                    <div className="flex items-center gap-2 p-2 bg-purple-100 rounded-lg text-sm text-purple-700">
                      <Volume2 className="w-4 h-4" />
                      <span className="flex-1 truncate">{audioFile.name}</span>
                      <span className="text-xs text-purple-600">({(audioFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Supports: mp3, wav, m4a, ogg, aac (Max: 10MB)
                  </p>
                  {validationErrors.audio && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <X className="w-3 h-3" />{validationErrors.audio}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </form>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {}}
        title=""
        size="md"
        footer={null}
      >
        <div className="text-center py-6 sm:py-8 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-4 sm:mb-5 shadow-lg">
            <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
            Hoàn thành!
          </h3>
          <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6">
            {successMessage}
          </p>
          <Button
            variant="primary"
            onClick={handleSuccessConfirm}
            className="px-6 sm:px-8 py-3 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
          >
            Đóng
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default QuestionFormModal;
