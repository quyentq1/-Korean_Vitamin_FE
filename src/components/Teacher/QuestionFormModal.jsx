import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  X,
  Plus,
  Trash2,
  Type,
  BarChart3,
  Lightbulb,
  FileText,
  AlignLeft,
  CheckCircle2,
  Mic,
  Upload,
  Volume2,
  Info
} from 'lucide-react';
import teacherService from '../../services/teacherService';
import { Button, Modal } from '../ui';
import { getAllClassQuestionTypes, getClassQuestionAnswerType, getClassQuestionPoints } from '../../constants/topikClassStructure';
import { QUESTION_TYPE_MAPPING } from '../../constants/topikStructure';

/**
 * QuestionFormModal Component
 *
 * Modal form for creating/editing questions
 *
 * @component
 */
const QuestionFormModal = ({ isOpen, onClose, questionId, defaultTarget = 'COURSE' }) => {
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

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = React.useRef(null);

  // Question state
  const [question, setQuestion] = useState({
    questionTarget: 'COURSE', // NEW: COURSE or CLASS
    questionType: 'MULTIPLE_CHOICE',
    answerType: 'SINGLE', // ALWAYS SINGLE - only one correct answer
    category: '',
    level: 'LEVEL_1', // For COURSE
    unit: 1, // For CLASS - Unit from 1-12
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
    textAnswer: '', // NEW: For L9 type (fill in the blank)
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});
  // Load existing question when in edit mode
  useEffect(() => {
    if (!isEditMode) {
      setQuestion({
        questionTarget: defaultTarget, // Use defaultTarget from props
        questionType: 'MULTIPLE_CHOICE',
        answerType: 'SINGLE',
        category: '',
        level: 'LEVEL_1',
        unit: 1,
        topikType: '', // NEW: Reset topikType
        points: 1,
        content: '',
        answers: [
          { id: 1, content: '', isCorrect: false },
          { id: 2, content: '', isCorrect: false },
          { id: 3, content: '', isCorrect: false },
          { id: 4, content: '', isCorrect: false },
        ],
        explanation: '',
        textAnswer: '',
      });
      // Reset audio and image when creating new question
      setAudioUrl('');
      setAudioFile(null);
      setImageUrl('');
      setImageFile(null);
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

        // Debug: Log ALL fields from backend
        console.log('=== Load Question Debug ===');
        console.log('Raw data from backend:', JSON.stringify(data, null, 2));
        console.log('level:', data.level);
        console.log('unit:', data.unit);
        console.log('topikType:', data.topikType);
        console.log('=======================');

        // Auto-determine questionTarget from level/unit
        // Backend doesn't have questionTarget field, so we calculate it
        let calculatedQuestionTarget = 'COURSE'; // Default
        if (data.unit !== null && data.unit !== undefined) {
          calculatedQuestionTarget = 'CLASS'; // Has unit → Class question
        } else if (data.level) {
          calculatedQuestionTarget = 'COURSE'; // Has level → Course question
        }

        console.log('Calculated questionTarget:', calculatedQuestionTarget);

        console.log('Setting question state with:', {
          questionType: questionTypeValue,
          answerType: answerTypeValue,
          level: data.level,
          topikType: topikTypeValue,
          topikTypeRaw: data.topikType,
          answersCount: mappedAnswers.length,
          answers: mappedAnswers
        });

        setQuestion({
          questionTarget: calculatedQuestionTarget, // Use calculated value from level/unit
          questionType: questionTypeValue,
          answerType: 'SINGLE', // ALWAYS SINGLE - override from API
          level: data.level || 'LEVEL_1',
          unit: data.unit || 1, // NEW: Load unit for CLASS
          topikType: topikTypeValue, // NEW: Load topikType
          points: data.points || 1, // NEW: Load points
          content: data.questionText || data.content || '',
          answers: mappedAnswers,
          explanation: data.explanation || data.explain || data.solution || data.explanationText || '',
          textAnswer: data.textAnswer || '',
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

        // Load image URL if exists
        console.log('imageUrl:', data.imageUrl);
        console.log('image_url:', data.image_url);

        if (data.imageUrl || data.image_url) {
          setImageUrl(data.imageUrl || data.image_url);
          console.log('Image URL set to:', data.imageUrl || data.image_url);
        } else {
          setImageUrl('');
          console.log('No image URL found, set to empty');
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

  // Auto-set questionType based on topikType
  useEffect(() => {
    if (question.topikType) {
      let newQuestionType = 'MULTIPLE_CHOICE'; // Default

      // Determine questionType from topikType prefix
      const prefix = question.topikType.charAt(0); // R, L, or W

      if (prefix === 'R') {
        newQuestionType = 'READING';
      } else if (prefix === 'L') {
        newQuestionType = 'LISTENING';
      } else if (prefix === 'W') {
        newQuestionType = 'WRITING';
      }

      setQuestion(prev => ({ ...prev, questionType: newQuestionType }));
    }
  }, [question.topikType]);

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!question.questionTarget) errors.questionTarget = 'Vui lòng chọn đối tượng câu hỏi';
    // questionType is auto-set from topikType, no need to validate

    // Validate level for COURSE, unit for CLASS
    if (question.questionTarget === 'COURSE') {
      if (!question.level) errors.level = 'Vui lòng chọn cấp độ';
    } else if (question.questionTarget === 'CLASS') {
      if (!question.unit) errors.unit = 'Vui lòng chọn Unit';
    }

    // Only validate topikType for NEW questions (not edit mode)
    // Old questions might not have topikType
    if (!isEditMode && !question.topikType) {
      errors.topikType = 'Vui lòng chọn Topik Type';
    }

    if (!question.content.trim()) errors.content = 'Vui lòng nhập nội dung câu hỏi';

    // For TEXT_INPUT types (L9, W55), validate textAnswer instead of answers
    if (question.questionTarget === 'CLASS' && question.topikType) {
      const answerType = getClassQuestionAnswerType(question.topikType);
      if (answerType === 'TEXT_INPUT') {
        if (!question.textAnswer.trim()) {
          errors.textAnswer = 'Vui lòng nhập đáp án đúng';
        }
      }
    }

    // For MULTIPLE_CHOICE types, validate answers
    if (['MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'READING', 'LISTENING'].includes(question.questionType)) {
      // Skip if it's a TEXT_INPUT type
      if (question.questionTarget === 'CLASS' && question.topikType) {
        const answerType = getClassQuestionAnswerType(question.topikType);
        if (answerType === 'TEXT_INPUT') {
          // Already validated above
        } else {
          const hasAnswer = question.answers.some(a => a.content.trim());
          const hasCorrect = question.answers.some(a => a.isCorrect);

          if (!hasAnswer) errors.answers = 'Vui lòng nhập ít nhất một đáp án';
          if (!hasCorrect) errors.correct = 'Vui lòng chọn ít nhất một đáp án đúng';
        }
      } else {
        const hasAnswer = question.answers.some(a => a.content.trim());
        const hasCorrect = question.answers.some(a => a.isCorrect);

        if (!hasAnswer) errors.answers = 'Vui lòng nhập ít nhất một đáp án';
        if (!hasCorrect) errors.correct = 'Vui lòng chọn ít nhất một đáp án đúng';
      }
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

      // Send questionType and answerType separately - backend now supports both!
      // Determine if this question should use text input based on answerType
      let useTextInput = false;
      if (question.questionTarget === 'CLASS' && question.topikType) {
        useTextInput = getClassQuestionAnswerType(question.topikType) === 'TEXT_INPUT';
      }

      const requestData = {
        question: {
          questionTarget: question.questionTarget, // NEW: COURSE or CLASS
          questionType: question.questionType,
          answerType: question.answerType,
          ...(question.questionTarget === 'COURSE'
            ? { level: question.level }
            : { unit: question.unit }
          ), // NEW: level for COURSE, unit for CLASS
          topikType: question.topikType || null, // NEW: Include topikType
          questionText: question.content,
          explanation: question.explanation,
          questionMediaUrl: audioUrl || null,
          imageUrl: imageUrl || null, // NEW: Include imageUrl (URL from upload endpoint)
          // Points NOT included - will be auto-set when added to exam based on structure
          active: true,
          textAnswer: question.textAnswer || null, // For TEXT_INPUT types (L9, W55)
        },
        options: useTextInput
          ? [] // No options for TEXT_INPUT types
          : question.answers.map(ans => ({
            optionText: ans.content,
            isCorrect: ans.isCorrect
          }))
      };

      console.log('=== SUBMIT FORM ===');
      console.log('Question state:', question);
      console.log('topikType value:', question.topikType);
      console.log('Current audioUrl state:', audioUrl);
      console.log('questionMediaUrl being sent:', requestData.question.questionMediaUrl);
      console.log('imageUrl being sent:', requestData.question.imageUrl);
      console.log('Full request data:', JSON.stringify(requestData, null, 2));

      if (isEditMode) {
        const response = await teacherService.updateQuestion(questionId, requestData);
        console.log('Update response:', response);
        setSuccessMessage('Cập nhật câu hỏi thành công!');

        // Reload question data after update to show latest values
        try {
          const updatedData = await teacherService.getQuestion(questionId);
          const data = await updatedData.json();

          // Re-calculate questionTarget from updated level/unit
          let calculatedQuestionTarget = 'COURSE';
          if (data.unit !== null && data.unit !== undefined) {
            calculatedQuestionTarget = 'CLASS';
          } else if (data.level) {
            calculatedQuestionTarget = 'COURSE';
          }

          // Update question state with latest data from backend
          setQuestion(prev => ({
            ...prev,
            questionTarget: calculatedQuestionTarget,
            level: data.level || prev.level,
            unit: data.unit !== undefined ? data.unit : prev.unit,
            topikType: data.topikType || prev.topikType,
            imageUrl: data.imageUrl || data.image_url || prev.imageUrl,
            content: data.questionText || data.content || prev.content,
            explanation: data.explanation || prev.explanation
          }));

          console.log('Reloaded question data after update:', data);
        } catch (reloadErr) {
          console.error('Error reloading question data:', reloadErr);
          // Continue anyway - update was successful
        }
      } else {
        const response = await teacherService.createQuestion(requestData);
        console.log('Create response:', response);
        setSuccessMessage('Tạo câu hỏi mới thành công!');
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
      // ALWAYS single choice - only one answer can be correct
      newAnswers.forEach((ans, i) => {
        ans.isCorrect = i === index;
      });
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

  // Handle image file selection
  // Handle image file selection + Auto upload immediately
  const handleImageFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      setError('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File ảnh không vượt quá 5MB');
      return;
    }

    setImageFile(file);
    setError('');

    // Auto upload immediately
    setUploadingImage(true);

    try {
      console.log('Auto-uploading image file:', file.name);
      const response = await teacherService.uploadImage(file);
      console.log('Upload image response:', response);

      const url = response?.url || response?.imageUrl || response;
      console.log('Extracted image URL:', url);

      if (url) {
        setImageUrl(url);
        setImageFile(null); // Clear file after successful upload
        console.log('✅ Image uploaded successfully:', url);
        setError('');
      } else {
        console.error('❌ No URL in response:', response);
        setError('Không thể upload ảnh. Server không trả về URL.');
      }
    } catch (err) {
      console.error('❌ Error uploading image:', err);
      setError('Không thể upload ảnh. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setImageUrl('');
    setImageFile(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
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
              {/* Question Target: CLASS or COURSE */}
              <div>
                <label className="block font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Type className="w-4 h-4 text-gray-500" />
                  Đối tượng câu hỏi <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white shadow-sm text-sm"
                  value={question.questionTarget}
                  onChange={e => {
                    const newTarget = e.target.value;
                    setQuestion({ ...question, questionTarget: newTarget, topikType: '' });
                  }}
                >
                  <option value="COURSE">Khóa học (Course)</option>
                  <option value="CLASS">Lớp học (Class)</option>
                </select>
                {validationErrors.questionTarget && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />{validationErrors.questionTarget}
                  </p>
                )}
              </div>

              {/* Level (for COURSE) or Unit (for CLASS) */}
              {question.questionTarget === 'COURSE' ? (
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
              ) : (
                <div>
                  <label className="block font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white shadow-sm text-sm"
                    value={question.unit}
                    onChange={e => setQuestion({ ...question, unit: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(unitNum => (
                      <option key={unitNum} value={unitNum}>
                        Unit {unitNum}
                      </option>
                    ))}
                  </select>
                  {validationErrors.unit && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                      <X className="w-3 h-3" />{validationErrors.unit}
                    </p>
                  )}
                </div>
              )}

              {/* TopikType - Show different options based on questionTarget */}
              <div>
                <label className="block font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Topik Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white shadow-sm text-sm"
                  value={question.topikType}
                  onChange={e => {
                    const newTopikType = e.target.value;
                    setQuestion({ ...question, topikType: newTopikType });
                  }}
                >
                  <option value="">-- Chọn Topik Type --</option>
                  {question.questionTarget === 'CLASS' ? (
                    // Class options từ topikClassStructure.js
                    getAllClassQuestionTypes().map(type => (
                      <option key={type.type} value={type.type}>
                        {type.type} - {type.name} ({type.points} điểm - {type.answerType === 'TEXT_INPUT' ? 'Text Input' : 'Multiple Choice'})
                      </option>
                    ))
                  ) : (
                    // Course options từ topikStructure.js
                    <>
                      {QUESTION_TYPE_MAPPING.READING?.map(r => (
                        <option key={r.type} value={r.type}>
                          {r.type} - {r.name} ({r.pointsPerQuestion} điểm)
                        </option>
                      ))}
                      {QUESTION_TYPE_MAPPING.LISTENING?.map(l => (
                        <option key={l.type} value={l.type}>
                          {l.type} - {l.name} ({l.pointsPerQuestion} điểm)
                        </option>
                      ))}
                      {QUESTION_TYPE_MAPPING.WRITING?.map(w => (
                        <option key={w.type} value={w.type}>
                          {w.type} - {w.name} ({w.pointsPerQuestion} điểm)
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {validationErrors.topikType && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />{validationErrors.topikType}
                  </p>
                )}
              </div>

              {/* Points Info - NOT editable, just for display */}
              {question.questionTarget === 'CLASS' && question.topikType && (
                <div>
                  <label className="block font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Lightbulb className="w-4 h-4 text-gray-500" />
                    Điểm (tự động theo cấu trúc)
                  </label>
                  <div className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm font-medium">
                    {getClassQuestionPoints(question.topikType)} điểm
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Điểm sẽ được tự động set khi thêm vào đề thi
                  </p>
                </div>
              )}
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

            {/* Image Upload Section */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <label className="block font-medium text-gray-700 text-sm sm:text-base">Hình ảnh (tùy chọn)</label>
              </div>

              {imageUrl ? (
                // Display existing image
                <div className="space-y-3">
                  <div className="relative p-3 bg-white rounded-xl border border-blue-200">
                    <img
                      src={imageUrl}
                      alt="Question"
                      className="w-full max-h-64 object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-5 right-5 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-md"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // Upload new image (auto-uploads on selection)
                <div className="space-y-3">
                  {uploadingImage ? (
                    <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-sm text-blue-700 font-medium">Đang tải ảnh lên...</span>
                    </div>
                  ) : (
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white text-sm file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                    />
                  )}
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Hỗ trợ: jpg, jpeg, png, gif, webp (Tối đa: 5MB) - Ảnh sẽ tự động tải lên khi chọn
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Answers Section - Only show for MULTIPLE_CHOICE types */}
          {(() => {
            // Determine if this question should use text input or multiple choice
            let useTextInput = false;

            if (question.questionTarget === 'CLASS' && question.topikType) {
              // Check answerType from class structure
              const answerType = getClassQuestionAnswerType(question.topikType);
              useTextInput = answerType === 'TEXT_INPUT';
            }

            // Show multiple choice answers if not text input and question type allows it
            return !useTextInput && ['MULTIPLE_CHOICE', 'LISTENING', 'READING'].includes(question.questionType);
          })() && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Đáp án</h3>
                  <span className="text-xs text-gray-500">(Chọn 1 đáp án đúng)</span>
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

          {/* Text Answer Section for TEXT_INPUT types (L9, W55, etc.) */}
          {(() => {
            if (question.questionTarget === 'CLASS' && question.topikType) {
              const answerType = getClassQuestionAnswerType(question.topikType);
              if (answerType === 'TEXT_INPUT') {
                // Get question info
                const allTypes = getAllClassQuestionTypes();
                const typeInfo = allTypes.find(t => t.type === question.topikType);
                return true;
              }
            }
            return false;
          })() && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 sm:p-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  {(() => {
                    const allTypes = getAllClassQuestionTypes();
                    const typeInfo = allTypes.find(t => t.type === question.topikType);
                    return typeInfo?.name || 'Đáp án dạng văn bản';
                  })()}
                </h3>
                <span className="text-xs text-gray-500">
                  ({question.topikType} - Text Input)
                </span>
              </div>

              <textarea
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none resize-none transition-all bg-white shadow-sm text-sm"
                placeholder={
                  question.topikType === 'L9'
                    ? 'Nhập đáp án đúng cho câu hỏi điền vào chỗ trống...'
                    : question.topikType === 'W55'
                    ? 'Nhập câu mẫu/ví dụ cho câu viết ngắn...'
                    : 'Nhập đáp án...'
                }
                value={question.textAnswer}
                onChange={e => setQuestion({ ...question, textAnswer: e.target.value })}
              />
              {validationErrors.textAnswer && (
                <p className="text-red-500 text-xs sm:text-sm mt-2 flex items-center gap-1">
                  <X className="w-3 h-3" />{validationErrors.textAnswer}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {question.topikType === 'L9'
                  ? 'Lưu ý: L9 là loại câu hỏi điền từ vào chỗ trống, học sinh sẽ nhập văn bản thay vì chọn đáp án'
                  : question.topikType === 'W55'
                  ? 'Lưu ý: W55 là loại câu hỏi viết câu ngắn (1-2 câu), học sinh sẽ nhập câu của mình'
                  : 'Lưu ý: Đây là loại câu hỏi dạng văn bản, học sinh sẽ nhập câu trả lời'}
              </p>
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
