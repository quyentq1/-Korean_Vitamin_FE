import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import useDebounce from '../../hooks/useDebounce';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Users,
  Settings,
  BookOpen,
  Search,
  Wand2,
  CheckSquare,
  Square,
  BarChart,
  Lightbulb,
  Loader2,
  X
} from 'lucide-react';

// UI Components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import Section from '../../components/ui/Section';

// Services
import teacherService from '../../services/teacherService';

// New Components
import ExamStructureBuilder from '../../components/Teacher/ExamStructureBuilder';
import QuestionReplacerModal from '../../components/Teacher/QuestionReplacerModal';
import QuestionBankModal from '../../components/Teacher/QuestionBankModal';

// Utils
import { validateExamBeforePublish, canEditExam } from '../../utils/examValidator';
import { getQuestionStructure, READING_STRUCTURE, LISTENING_STRUCTURE, WRITING_STRUCTURE } from '../../constants/topikStructure';
import { getClassQuestionPoints } from '../../constants/topikClassStructure';

// Styles
import styles from './ExamEditor.module.css';

const ExamEditor = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exam, setExam] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [courses, setCourses] = useState([]);

  // Title validation state
  const [titleChecking, setTitleChecking] = useState(false);
  const [titleExists, setTitleExists] = useState(false);
  const [titleErrorMessage, setTitleErrorMessage] = useState('');

  // Code validation state
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeExists, setCodeExists] = useState(false);
  const [codeErrorMessage, setCodeErrorMessage] = useState('');

  // Get courseId from URL query parameter (when coming from MyCourses page)
  const courseIdFromUrl = searchParams.get('courseId');
  // Get classId from URL query parameter (when coming from ClassExamManagement page)
  const classIdFromUrl = searchParams.get('classId');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    duration: 70,
    passingScore: 80,
    published: false,
    courseId: courseIdFromUrl || '', // Pre-fill if coming from MyCourses
    classId: classIdFromUrl || '', // NEW: Pre-fill if coming from ClassExamManagement
    examType: 'MIXED', // Default exam type
    examCategory: classIdFromUrl ? 'PRACTICE' : 'PRACTICE', // Force PRACTICE when creating exam for a class
    unit: 1 // NEW: Unit for Class exams (1-12)
  });

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Question Bank Modal
  const [showQuestionBankModal, setShowQuestionBankModal] = useState(false);
  const [selectedQuestionsFromBank, setSelectedQuestionsFromBank] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // NEW: Auto-generate mode states
  const [autoGenerateMode, setAutoGenerateMode] = useState(false);
  const [showStructureBuilder, setShowStructureBuilder] = useState(false);
  const [courseQuestions, setCourseQuestions] = useState([]); // Questions from course for filtering

  // NEW: Question replacement states
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedQuestionIndices, setSelectedQuestionIndices] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set()); // For checkbox selection

  // Fetch exam details (only in edit mode)
  useEffect(() => {
    if (id && id !== 'create') {
      fetchExamDetails();
    } else {
      // Create mode - load courses and set loading to false
      fetchCourses();
      setLoading(false);
    }
  }, [id]);

  // Debounced title validation
  const debouncedTitle = useDebounce(formData.title, 500);

  useEffect(() => {
    const checkTitleExists = async () => {
      // Only check if title is not empty and at least 3 characters
      if (!debouncedTitle || debouncedTitle.trim().length < 3) {
        setTitleExists(false);
        setTitleErrorMessage('');
        setTitleChecking(false);
        return;
      }

      setTitleChecking(true);
      setTitleErrorMessage('');

      try {
        // Check title exists (exclude current exam when editing)
        const excludeId = id && id !== 'create' ? parseInt(id) : null;
        const response = await teacherService.checkExamTitleExists(debouncedTitle.trim(), excludeId);

        setTitleExists(response.exists);
        if (response.exists) {
          setTitleErrorMessage(response.message || 'Tiêu đề bài kiểm tra đã tồn tại!');
        }
      } catch (err) {
        console.error('Failed to check title:', err);
        setTitleErrorMessage('');
      } finally {
        setTitleChecking(false);
      }
    };

    checkTitleExists();
  }, [debouncedTitle, id]);

  // Debounced code validation
  const debouncedCode = useDebounce(formData.code, 500);

  useEffect(() => {
    const checkCodeExists = async () => {
      // Only check if code is not empty and at least 2 characters
      if (!debouncedCode || debouncedCode.trim().length < 2) {
        setCodeExists(false);
        setCodeErrorMessage('');
        setCodeChecking(false);
        return;
      }

      setCodeChecking(true);
      setCodeErrorMessage('');

      try {
        // Check code exists (exclude current exam when editing)
        const excludeId = id && id !== 'create' ? parseInt(id) : null;
        const response = await teacherService.checkExamCodeExists(debouncedCode.trim(), excludeId);

        setCodeExists(response.exists);
        if (response.exists) {
          setCodeErrorMessage(response.message || 'Mã bài kiểm tra đã tồn tại!');
        }
      } catch (err) {
        console.error('Failed to check code:', err);
        setCodeErrorMessage('');
      } finally {
        setCodeChecking(false);
      }
    };

    checkCodeExists();
  }, [debouncedCode, id]);

  // Fetch assigned courses
  const fetchCourses = async () => {
    try {
      const data = await teacherService.getAssignedCourses();
      setCourses(data || []);

      // If coming from MyCourses with courseId, find and store course info
      if (courseIdFromUrl) {
        const selectedCourse = data.find(c => c.id === parseInt(courseIdFromUrl));
        if (selectedCourse) {
          setSelectedCourseInfo(selectedCourse);
          // FIX: Also load questions for this course
          await loadQuestionsForCourse(selectedCourse);
        }
      }

      // NEW: If coming from ClassExamManagement with classId, fetch class info
      if (classIdFromUrl) {
        await fetchClassInfo(classIdFromUrl);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  // NEW: Fetch class info when creating exam from class
  const fetchClassInfo = async (classId) => {
    try {
      const classData = await teacherService.getClassInfo(classId);
      setSelectedClassInfo(classData);

      // Load questions for the class's course
      if (classData.course) {
        await loadQuestionsForCourse(classData.course);
      }
    } catch (err) {
      console.error('Failed to load class info:', err);
    }
  };

  // Store selected course info when coming from MyCourses
  const [selectedCourseInfo, setSelectedCourseInfo] = useState(null);
  // Store selected class info when coming from ClassExamManagement
  const [selectedClassInfo, setSelectedClassInfo] = useState(null);

  const fetchExamDetails = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getExam(id);
      setExam(response);

      // Check if exam is already approved or published - cannot edit
      if (response.approvalStatus === 'APPROVED' || response.published) {
        await Swal.fire({
          icon: 'warning',
          title: 'Không thể chỉnh sửa',
          text: response.published
            ? 'Bài kiểm tra này đã xuất bản. Không thể chỉnh sửa.'
            : 'Bài kiểm tra này đã được duyệt. Không thể chỉnh sửa bài thi đã được duyệt.',
          confirmButtonColor: '#ef4444',
          footer: 'Vui lòng liên hệ Education Manager nếu cần thay đổi.'
        });

        // Navigate back to exam management
        navigate('/teacher/exam-management');
        setLoading(false);
        return;
      }

      // Check if this exam belongs to a class
      if (response.classId || response.classEntity) {
        // Load class info
        const classId = response.classId || response.classEntity?.id;
        try {
          const classData = await teacherService.getClassInfo(classId);
          setSelectedClassInfo(classData);

          // IMPORTANT: Also load course info for the class to load questions
          if (classData.course) {
            setSelectedCourseInfo(classData.course);

            // Load questions for this course
            await loadQuestionsForCourse(classData.course);
          }
        } catch (err) {
          console.error('Failed to load class info:', err);
        }
      } else if (response.courseId) {
        // Load course info for non-class exams
        try {
          const data = await teacherService.getAssignedCourses();
          const selectedCourse = data.find(c => c.id === response.courseId);
          if (selectedCourse) {
            setSelectedCourseInfo(selectedCourse);

            // Load questions for this course
            await loadQuestionsForCourse(selectedCourse);
          }
        } catch (err) {
          console.error('Failed to load course info:', err);
        }
      }

      // Set form data
      setFormData({
        title: response.title || '',
        code: response.code || '',
        description: response.description || '',
        duration: response.durationMinutes || response.duration || 70,
        passingScore: response.passingScore || 80,
        published: response.published || false,
        courseId: response.courseId || '',
        classId: response.classId || response.classEntity?.id || '', // NEW: Include classId
        examType: response.examType || response.type || 'MIXED', // Default to MIXED if missing
        examCategory: response.examCategory || 'PRACTICE', // NEW: Load examCategory from API
        unit: response.unit || 1 // NEW: Load unit for Class exams
      });

      // Set questions - map examQuestions to question format
      const mappedQuestions = (response.examQuestions || []).map(eq => {
        const q = eq.question;
        return {
          id: q?.id,
          orderNumber: eq.questionOrder,
          points: eq.points || 1,
          content: q?.questionText || q?.content || 'N/A',
          questionText: q?.questionText || q?.content || 'N/A',
          questionType: q?.questionType,
          level: q?.level,
          unit: q?.unit,
          category: q?.category?.name || q?.categoryName || 'N/A',
          categoryName: q?.category?.name || q?.categoryName || 'N/A',
          topikType: q?.topikType,
          difficulty: q?.difficulty,
          answers: q?.options || [],
          options: q?.options || [],
          correctAnswer: q?.correctAnswer,
          explanation: q?.explanation,
          imageUrl: q?.imageUrl,
          questionMediaUrl: q?.questionMediaUrl,
          isFromExam: true // Mark as loaded from exam
        };
      });
      setQuestions(mappedQuestions);
      console.log('Loaded questions from exam:', mappedQuestions);
      setError('');
    } catch (err) {
      console.error('Failed to load exam:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi tải thông tin bài kiểm tra.';

      // Show error alert instead of silent error
      await Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: errorMessage + (err.response?.status === 404 ? '\n\nBài kiểm tra không tồn tại hoặc bạn không có quyền truy cập.' : ''),
        confirmButtonColor: '#ef4444',
        footer: '<a href="/teacher/exam-management" class="text-blue-600 underline">Về danh sách bài kiểm tra</a>'
      });

      setError(errorMessage);
      // Navigate back to exam management after error
      setTimeout(() => {
        navigate('/teacher/exam-management');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle form change
  const handleFormChange = async (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Load questions when course is selected
    if (field === 'courseId' && value) {
      const selectedCourse = courses.find(c => c.id === parseInt(value));
      if (selectedCourse) {
        setSelectedCourseInfo(selectedCourse);
        await loadQuestionsForCourse(selectedCourse);
      }
    }

    // NEW: Load Class questions when unit is selected
    if (field === 'unit' && value && formData.classId) {
      console.log(`Unit changed to ${value}, loading Class questions...`);
      await loadQuestionsForClass(value);
    }
  };

  // Load questions by course level
  const loadQuestionsForCourse = async (course) => {
    try {
      const questions = await teacherService.getQuestionsByCourseLevel(course.level);
      setAvailableQuestions(questions || []);
      // NEW: Also load for Structure Builder
      setCourseQuestions(questions || []);
    } catch (err) {
      console.error('Failed to load questions for course:', err);
      setAvailableQuestions([]);
      setCourseQuestions([]);
    }
  };

  // NEW: Load Class questions by unit
  const loadQuestionsForClass = async (unit) => {
    try {
      console.log('=== loadQuestionsForClass ===');
      console.log('Fetching questions for unit:', unit);

      // For Class exams, we need to load questions by unit
      // Using getQuestions API with unit filter
      const response = await teacherService.getQuestions({
        unit: unit, // Filter by unit
        pageSize: 1000 // Get all questions for this unit
      });

      // Extract questions array from response
      const questions = response?.data || response || [];

      console.log('Response received:', response);
      console.log('Questions loaded:', questions.length);
      console.log('Sample questions:', questions.slice(0, 3).map(q => ({
        id: q.id,
        unit: q.unit,
        verificationStatus: q.verificationStatus,
        topikType: q.topikType
      })));

      setAvailableQuestions(questions);

      console.log(`Loaded ${questions.length} Class questions for Unit ${unit}`);
      console.log('=============================');
    } catch (err) {
      console.error('Failed to load questions for class:', err);
      setAvailableQuestions([]);
    }
  };

  // Store available questions for selected course
  const [availableQuestions, setAvailableQuestions] = useState([]);

  // Handle question change
  const handleQuestionChange = (index, field, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Add question
  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      category: 'N1',
      type: 'MULTIPLE_CHOICE',
      content: '',
      answers: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'MEDIUM',
      points: 1,
      isNew: true
    };
    setQuestions(prev => [...prev, newQuestion]);
    setActiveTab('questions');
  };

  // Delete question
  const handleDeleteQuestion = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  const confirmDeleteQuestion = () => {
    setQuestions(prev => prev.filter(q => q.id !== questionToDelete.id));
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  };

  // Open Question Bank Modal
  const handleOpenQuestionBank = () => {
    console.log('=== Opening Question Bank Modal ===');
    console.log('formData.classId:', formData.classId);
    console.log('formData.unit:', formData.unit);
    console.log('selectedClassInfo:', selectedClassInfo);
    console.log('selectedCourseInfo:', selectedCourseInfo);
    console.log('availableQuestions.length:', availableQuestions.length);
    console.log('Sample availableQuestions:', availableQuestions.slice(0, 3).map(q => ({
      id: q.id,
      unit: q.unit,
      verificationStatus: q.verificationStatus
    })));
    console.log('====================================');

    // For Class exams, check if class is selected
    if (formData.classId) {
      if (!selectedClassInfo) {
        setError(t('exam.selectClassFirst', 'Vui lòng chọn lớp trước.'));
        return;
      }
      if (!formData.unit) {
        setError(t('exam.selectUnitFirst', 'Vui lòng chọn Unit trước.'));
        return;
      }
    } else {
      // For Course exams, check if course is selected
      if (!selectedCourseInfo) {
        setError(t('exam.selectCourseFirst', 'Vui lòng chọn khóa học trước.'));
        return;
      }
    }
    setSelectedQuestionsFromBank([]);
    setSearchTerm('');
    setShowQuestionBankModal(true);
  };

  // Toggle question selection from bank
  const handleToggleQuestionFromBank = (question) => {
    setSelectedQuestionsFromBank(prev => {
      const exists = prev.find(q => q.id === question.id);
      if (exists) {
        return prev.filter(q => q.id !== question.id);
      } else {
        return [...prev, question];
      }
    });
  };

  // Add selected questions from bank to exam
  const handleAddQuestionsFromBank = () => {
    const newQuestions = selectedQuestionsFromBank.map(q => {
      // Auto-set points based on topikType from structure
      let points = 1; // Default

      if (formData.classId) {
        // CLASS exam - use topikClassStructure
        if (q.topikType) {
          points = getClassQuestionPoints(q.topikType);
        }
      } else {
        // COURSE exam - use topikStructure
        if (q.topikType) {
          // Get category from topikType (R, L, W)
          const category = q.topikType.startsWith('R') ? 'READING' :
                          q.topikType.startsWith('L') ? 'LISTENING' :
                          q.topikType.startsWith('W') ? 'WRITING' : null;

          if (category) {
            // Get structure from topikStructure
            const structures = {
              'READING': READING_STRUCTURE,
              'LISTENING': LISTENING_STRUCTURE,
              'WRITING': WRITING_STRUCTURE
            };
            const structure = structures[category]?.find(s => s.type === q.topikType);
            points = structure?.pointsPerQuestion || 1;
          }
        }
      }

      return {
        id: q.id,
        category: q.category?.name || 'N1',
        type: q.questionType,
        content: q.questionText || q.content,
        imageUrl: q.imageUrl,
        answers: q.options || [],
        correctAnswer: null,
        level: q.level,
        topikType: q.topikType, // Store topikType for reference
        points: points, // ✅ Auto-set from structure
        isNew: false
      };
    });

    setQuestions(prev => [...prev, ...newQuestions]);
    setShowQuestionBankModal(false);
    setSelectedQuestionsFromBank([]);
    setActiveTab('questions');
  };

  // Preview question
  const handlePreviewQuestion = (question) => {
    setPreviewQuestion(question);
    setShowPreviewModal(true);
  };

  // Save exam
  const handleSave = async () => {
    setSaving(true);
    try {
      const isCreateMode = !id || id === 'create';

      if (isCreateMode) {
        // Validate required fields - courseId OR classId is required
        if (!formData.courseId && !formData.classId) {
          Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng chọn khóa học hoặc lớp học.',
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        // Validate title
        if (!formData.title || formData.title.trim() === '') {
          Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: t('exam.titleRequired', 'Vui lòng nhập tên bài kiểm tra.'),
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        // Validate title uniqueness
        if (titleExists) {
          Swal.fire({
            icon: 'warning',
            title: 'Tiêu đề bị trùng',
            text: titleErrorMessage || 'Tiêu đề bài kiểm tra đã tồn tại. Vui lòng chọn tiêu đề khác.',
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        // Validate code
        if (!formData.code || formData.code.trim() === '') {
          Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng nhập mã bài kiểm tra.',
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        // Validate code uniqueness
        if (codeExists) {
          Swal.fire({
            icon: 'warning',
            title: 'Mã bài kiểm tra bị trùng',
            text: codeErrorMessage || 'Mã bài kiểm tra đã tồn tại trong hệ thống. Vui lòng chọn mã khác.',
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        // Validate duration
        if (!formData.duration || formData.duration <= 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: t('exam.durationRequired', 'Vui lòng nhập thời gian làm bài (phút).'),
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        // Validate passingScore
        if (!formData.passingScore || formData.passingScore <= 0 || formData.passingScore > 100) {
          Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: t('exam.passingScoreRequired', 'Vui lòng nhập điểm đạt (0-100).'),
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        // Validate examType
        if (!formData.examType) {
          Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: t('exam.examTypeRequired', 'Vui lòng chọn hình thức bài thi.'),
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        // Validate examCategory
        if (!formData.examCategory) {
          Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: t('exam.examCategoryRequired', 'Vui lòng chọn loại đề thi.'),
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        // Validate questions - must have at least one question
        if (!questions || questions.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Thiếu câu hỏi',
            text: t('exam.questionsRequired', 'Vui lòng thêm ít nhất một câu hỏi vào bài kiểm tra.'),
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        // Create new exam - backend expects { exam: {...}, courseId: ..., classId: ..., questions: [...] }
        // courseId/classId is sent separately (not nested in exam) because backend needs to convert it to Course/Class entity
        const { courseId, classId, duration, code, ...examData } = formData; // Extract courseId, classId and unused fields

        // Calculate totalPoints from questions if not provided
        const totalPoints = questions.filter(q => !q.isNew).reduce((sum, q) => sum + (q.points || 1), 0);

        const requestData = {
          exam: {
            ...examData,
            durationMinutes: duration, // Map frontend 'duration' to backend 'durationMinutes'
            totalPoints: totalPoints > 0 ? totalPoints : 100, // Set from questions or default to 100
            unit: formData.unit // NEW: Include unit for Class exams
          },
          ...(courseId && { courseId: parseInt(courseId) }), // Send courseId at request level if present
          ...(classId && { classId: parseInt(classId) }), // NEW: Send classId at request level if present
          questions: questions.filter(q => !q.isNew)
        };

        const response = await teacherService.createExam(requestData);

        // Auto-submit exam for approval after creation (only for course exams, not class exams)
        // Class exams are automatically available to the class
        if (!classId) {
          try {
            await teacherService.submitExamForApproval(response.id);
            console.log('Exam submitted for approval:', response.id);
          } catch (submitError) {
            console.warn('Failed to auto-submit exam for approval:', submitError);
            // Don't fail the entire flow if submission fails
          }
        }

        // Show success alert
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: classId
            ? 'Đã tạo bài kiểm tra cho lớp học thành công!'
            : t('exam.createSuccess', 'Đã tạo bài kiểm tra thành công! Đang chờ Education Manager duyệt.'),
          confirmButtonColor: '#10b981'
        });

        setError('');
        // Navigate back to exam management
        navigate('/teacher/exam-management');
      } else {
        // Validate required fields for update mode
        if (!formData.title || formData.title.trim() === '') {
          Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: t('exam.titleRequired', 'Vui lòng nhập tên bài kiểm tra.'),
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        if (!formData.duration || formData.duration <= 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: t('exam.durationRequired', 'Vui lòng nhập thời gian làm bài (phút).'),
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        if (!formData.passingScore || formData.passingScore <= 0 || formData.passingScore > 100) {
          Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: t('exam.passingScoreRequired', 'Vui lòng nhập điểm đạt (0-100).'),
            confirmButtonColor: '#3b82f6'
          });
          setSaving(false);
          return;
        }

        // Check if exam is approved - show warning
        if (exam?.approvalStatus === 'APPROVED') {
          const { value: confirm } = await Swal.fire({
            icon: 'warning',
            title: 'Cảnh báo: Bài thi đã được duyệt!',
            text: 'Bài thi này đã được Education Manager duyệt. Nếu bạn chỉnh sửa, bài thi sẽ được chuyển về trạng thái "Chờ duyệt" và cần gửi lại cho Education Manager phê duyệt trước khi công bố.',
            input: 'checkbox',
            inputPlaceholder: 'Tôi hiểu và muốn tiếp tục chỉnh sửa',
            confirmButtonText: 'Tiếp tục chỉnh sửa',
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Hủy',
            showCancelButton: true,
            inputValidator: (result) => {
              if (!result) {
                return 'Bạn cần tick vào checkbox để xác nhận!';
              }
            }
          });

          if (!confirm) {
            setSaving(false);
            return;
          }
        }

        // Update existing exam - map frontend field names to backend field names
        const { duration, ...restFormData } = formData;
        await teacherService.updateExam(id, {
          ...restFormData,
          durationMinutes: duration, // map 'duration' -> 'durationMinutes'
          unit: formData.unit,       // ensure unit is included
          questions: questions.filter(q => !q.isNew)
        });

        // Show success alert
        const wasApproved = exam?.approvalStatus === 'APPROVED';
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: wasApproved
            ? 'Đã lưu bài kiểm tra! Bài thi đã được chuyển về trạng thái "Chờ duyệt" và gửi lại cho Education Manager phê duyệt.'
            : t('exam.saveSuccess', 'Đã lưu bài kiểm tra thành công!'),
          confirmButtonColor: '#10b981'
        });

        // Reload exam data if status changed
        if (wasApproved) {
          // Refetch exam data to get updated status
          window.location.reload();
        }

        setError('');
      }
    } catch (err) {
      console.error(err);

      // Show error alert
      await Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: err.response?.data?.message || t('exam.saveError', 'Lỗi khi lưu bài kiểm tra.'),
        confirmButtonColor: '#ef4444'
      });

      setSuccess('');
    } finally {
      setSaving(false);
    }
  };

  // ==================== NEW HANDLERS ====================

  // Handle auto-generate exam from TOPIK structure
  const handleAutoGenerate = async (blueprint) => {
    try {
      // Call API để random questions theo blueprint
      const requestData = {
        blueprint,
        ...(formData.courseId && { courseId: parseInt(formData.courseId) }), // Send courseId if present
        ...(formData.classId && { classId: parseInt(formData.classId) }), // NEW: Send classId if present
        examCategory: formData.examCategory
      };

      const response = await teacherService.generateExamFromBlueprint(requestData);

      // Set questions vào state với orderNumber
      const questionsWithOrder = (response.questions || []).map((q, index) => ({
        ...q,
        orderNumber: index + 1
      }));

      setQuestions(questionsWithOrder);

      // Tự động set thời gian dựa trên TOPIK level
      const newDuration = blueprint.topikLevel === 'TOPIK_I' ? 100 : 180;
      setFormData(prev => ({
        ...prev,
        duration: newDuration
      }));

      setShowStructureBuilder(false);
      setAutoGenerateMode(false);
      setSuccess(`Đã tạo đề thi tự động theo cấu trúc ${blueprint.topikLevel}! (${questionsWithOrder.length} câu hỏi)`);
      setError('');

      // Switch to questions tab
      setActiveTab('questions');
    } catch (err) {
      console.error('Error generating exam:', err);
      setError('Không thể tạo đề thi tự động: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle replace questions
  const handleReplaceQuestions = (replacements) => {
    const newQuestions = [...questions];

    replacements.forEach(({ old, new: newQ, index }) => {
      newQuestions[index] = {
        ...newQ,
        orderNumber: index + 1
      };
    });

    setQuestions(newQuestions);
    setSuccess(`Đã đổi ${replacements.length} câu hỏi thành công!`);
    setError('');
  };

  // Handle publish toggle with validation
  const handlePublishToggle = async (value) => {
    if (value) {
      // Validate trước khi publish
      const validation = validateExamBeforePublish(formData, questions);

      if (!validation.valid) {
        setError('Không thể publish đề thi:\n' + validation.errors.join('\n'));
        return;
      }

      if (validation.warnings.length > 0) {
        const confirmed = window.confirm(
          'Cảnh báo:\n' + validation.warnings.join('\n') + '\n\nBạn có chắc muốn publish?'
        );
        if (!confirmed) return;
      }
    }

    // Set published value
    handleFormChange('published', value);
  };

  // Toggle question selection (for bulk replace)
  const toggleQuestionSelection = (index) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  // Check if exam can be edited
  const checkCanEdit = () => {
    if (exam && exam.published) {
      setError('Đề thi đã published. Không thể chỉnh sửa. Vui lòng unpublish trước.');
      return false;
    }
    return true;
  };

  // ==================== END NEW HANDLERS ====================

  // Get question type badge
  const getQuestionTypeBadge = (type) => {
    const typeConfig = {
      MULTIPLE_CHOICE: { variant: 'success', label: t('exam.type.multipleChoice', 'Trắc nghiệm') },
      WRITING: { variant: 'info', label: t('exam.type.writing', 'Viết') },
      LISTENING: { variant: 'warning', label: t('exam.type.listening', 'Nghe') },
      READING: { variant: 'purple', label: t('exam.type.reading', 'Đọc hiểu') },
      MIXED: { variant: 'primary', label: t('exam.type.mixed', 'Hỗn hợp') }
    };
    
    const config = typeConfig[type] || typeConfig.MIXED;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      EASY: { variant: 'success', label: t('exam.difficulty.easy', 'Dễ') },
      MEDIUM: { variant: 'warning', label: t('exam.difficulty.medium', 'Trung bình') },
      HARD: { variant: 'error', label: t('exam.difficulty.hard', 'Khó') }
    };
    
    const config = difficultyConfig[difficulty] || difficultyConfig.MEDIUM;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <PageContainer>
        <Loading.PageLoading />
      </PageContainer>
    );
  }

  const isCreateMode = !id || id === 'create';

  return (
    <PageContainer className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Optimized Page Header with Progress */}
      <div className="bg-white shadow-sm border-b border-gray-200 rounded-t-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => navigate('/exam-management')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isCreateMode ? t('exam.create', 'Tạo Bài Kiểm Tra Mới') : t('exam.edit', 'Chỉnh Sửa Bài Kiểm Tra')}
                </h1>
              </div>
              <p className="text-sm text-gray-500 ml-10">
                {exam?.code || t('exam.createSubtitle', 'Tạo bài kiểm tra mới cho khóa học')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Progress Indicator */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${formData.title ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${formData.courseId || formData.classId ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${questions.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-xs text-gray-600 ml-2">
                  {questions.length > 0 ? 'Hoàn thành' : 'Đang tạo'}
                </span>
              </div>
              <Button
                variant="primary"
                icon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                disabled={saving || titleExists || codeExists}
                className="shadow-lg"
                title={
                  titleExists
                    ? 'Tiêu đề bị trùng'
                    : codeExists
                    ? 'Mã bài kiểm tra bị trùng'
                    : ''
                }
              >
                {saving ? (
                  <>
                    <Loading.Spinner size="sm" />
                    {t('exam.saving', 'Đang lưu...')}
                  </>
                ) : (
                  t('exam.save', 'Lưu')
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts with improved styling */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {success && (
          <Alert
            variant="success"
            icon={<CheckCircle2 className="w-5 h-5" />}
            className="shadow-lg border-l-4 border-green-500"
            dismissible
            onDismiss={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {error && (
          <Alert
            variant="error"
            icon={<AlertCircle className="w-5 h-5" />}
            className="shadow-lg border-l-4 border-red-500"
            dismissible
            onDismiss={() => setError('')}
          >
            {error}
          </Alert>
        )}
      </div>

      {/* Main Content - Optimized 3-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* Left Column - Main Form (2 columns wide) */}
          <div className="xl:col-span-3">
            <Card className="shadow-xl border-0 overflow-hidden">
              {/* Modern Tabs */}
              <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex">
                <button
                  className={`flex-1 py-4 px-8 font-semibold text-sm transition-all duration-200 relative ${
                    activeTab === 'details'
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Settings className={`w-5 h-5 ${activeTab === 'details' ? 'animate-pulse' : ''}`} />
                    <span>{t('exam.details', 'Thông Tin')}</span>
                  </div>
                  {activeTab === 'details' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
                  )}
                </button>
                <button
                  className={`flex-1 py-4 px-8 font-semibold text-sm transition-all duration-200 relative ${
                    activeTab === 'questions'
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('questions')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FileText className={`w-5 h-5 ${activeTab === 'questions' ? 'animate-pulse' : ''}`} />
                    <span>{t('exam.questions', 'Câu Hỏi')}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      questions.length > 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {questions.length}
                    </span>
                  </div>
                  {activeTab === 'questions' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
                  )}
                </button>
                </div>
              </div>

              {/* Details Tab Content - Optimized Layout */}
              {activeTab === 'details' && (
                <div className="p-8 space-y-8">

                {/* Section: Basic Info */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('exam.title', 'Tiêu đề')} *
                      </label>
                      <Input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        placeholder={t('exam.titlePlaceholder', 'Nhập tiêu đề bài kiểm tra...')}
                        className={`text-lg font-medium ${
                          titleExists ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />

                      {/* Real-time validation feedback */}
                      {formData.title && formData.title.trim().length >= 3 && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          {titleChecking ? (
                            <div className="flex items-center gap-2 text-gray-500">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Đang kiểm tra...</span>
                            </div>
                          ) : titleExists ? (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              <span>{titleErrorMessage || 'Tiêu đề đã tồn tại!'}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Tiêu đề có thể sử dụng</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Code */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('exam.code', 'Mã bài kiểm tra')} *
                      </label>
                      <Input
                        type="text"
                        value={formData.code}
                        onChange={(e) => handleFormChange('code', e.target.value)}
                        placeholder={t('exam.codePlaceholder', 'VD: EXAM-001')}
                        className={`${
                          codeExists ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />

                      {/* Real-time validation feedback */}
                      {formData.code && formData.code.trim().length >= 2 && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          {codeChecking ? (
                            <div className="flex items-center gap-2 text-gray-500">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Đang kiểm tra...</span>
                            </div>
                          ) : codeExists ? (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              <span>{codeErrorMessage || 'Mã bài kiểm tra đã tồn tại!'}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Mã có thể sử dụng</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Course Selection - ONLY show for Course exams, NOT Class exams */}
                    {isCreateMode && !selectedCourseInfo && !selectedClassInfo && !(classIdFromUrl || formData.classId) && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('exam.course', 'Khóa học')} *
                        </label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                          value={formData.courseId}
                          onChange={(e) => handleFormChange('courseId', e.target.value)}
                          required
                        >
                          <option value="">{t('exam.selectCourse', '-- Chọn khóa học --')}</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.name} ({course.code})
                            </option>
                          ))}
                        </select>
                        {courses.length === 0 && (
                          <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {t('exam.noCoursesAssigned', 'Bạn chưa được assigned vào khóa học nào.')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Selected Course Display */}
                    {selectedCourseInfo && !selectedClassInfo && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('exam.course', 'Khóa học')}
                          {!isCreateMode && <span className="ml-2 text-xs text-gray-500">(Không thể thay đổi)</span>}
                        </label>
                        <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-gray-700">
                          <div className="font-semibold text-blue-900">{selectedCourseInfo.name}</div>
                          <div className="text-sm text-blue-600">{selectedCourseInfo.code}</div>
                        </div>
                        <input type="hidden" name="courseId" value={formData.courseId} />
                      </div>
                    )}

                    {/* NEW: Selected Class Display (when creating/editing exam for a class) */}
                    {selectedClassInfo && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('exam.class', 'Lớp học')}
                          {!isCreateMode && <span className="ml-2 text-xs text-gray-500">(Không thể thay đổi - Bài thi này thuộc về lớp này)</span>}
                        </label>
                        <div className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-gray-700">
                          <div className="font-semibold text-purple-900">{selectedClassInfo.className}</div>
                          <div className="text-sm text-purple-600">{selectedClassInfo.classCode} • {selectedClassInfo.course?.name || ''}</div>
                        </div>
                        <input type="hidden" name="classId" value={formData.classId} />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('exam.description', 'Mô tả')}
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder={t('exam.descriptionPlaceholder', 'Nhập mô tả bài kiểm tra...')}
                    />
                  </div>
                </div>

                {/* Section: Exam Configuration */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Cấu hình bài thi</h3>
                  </div>

                  {/* Exam Type & Category in one row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Exam Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('exam.examType', 'Hình thức bài thi')}
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                        value={formData.examType}
                        onChange={(e) => handleFormChange('examType', e.target.value)}
                      >
                        <option value="MULTIPLE_CHOICE">{t('exam.type.multipleChoice', 'Trắc nghiệm')}</option>
                        <option value="WRITING">{t('exam.type.writing', 'Viết')}</option>
                        <option value="LISTENING">{t('exam.type.listening', 'Nghe hiểu')}</option>
                        <option value="READING">{t('exam.type.reading', 'Đọc hiểu')}</option>
                        <option value="MIXED">{t('exam.type.mixed', 'Hỗn hợp')}</option>
                      </select>
                    </div>

                    {/* Exam Category - Visual Card Selection */}
                    {!classIdFromUrl && !formData.classId && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('exam.examCategory', 'Phân loại bài thi')}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleFormChange('examCategory', 'PRACTICE')}
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                              formData.examCategory === 'PRACTICE'
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 bg-white'
                            }`}
                          >
                            <div className="flex flex-col items-center text-center">
                              <span className="text-3xl mb-2">📚</span>
                              <div className={`font-semibold text-sm mb-1 ${
                                formData.examCategory === 'PRACTICE' ? 'text-blue-700' : 'text-gray-700'
                              }`}>
                                Bài luyện tập
                              </div>
                              <div className="text-xs text-gray-500">
                                Cho học viên trong khóa
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleFormChange('examCategory', 'MOCK')}
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                              formData.examCategory === 'MOCK'
                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                                : 'border-gray-200 hover:border-purple-300 bg-white'
                            }`}
                          >
                            <div className="flex flex-col items-center text-center">
                              <span className="text-3xl mb-2">🎯</span>
                              <div className={`font-semibold text-sm mb-1 ${
                                formData.examCategory === 'MOCK' ? 'text-purple-700' : 'text-gray-700'
                              }`}>
                                Mock Test
                              </div>
                              <div className="text-xs text-gray-500">
                                Cho Guest/FreeTest
                              </div>
                            </div>
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {formData.examCategory === 'MOCK'
                            ? 'Bài Mock sẽ hiển thị cho khách (Guest) trong trang FreeTest'
                            : 'Bài luyện tập chỉ hiển thị cho học viên đã đăng ký khóa học'}
                        </p>
                      </div>
                    )}

                    {/* Show info badge when exam is for a specific class */}
                    {(classIdFromUrl || formData.classId) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-900">Bài kiểm tra cho lớp học</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          Bài kiểm tra này sẽ được gán cho lớp học và chỉ hiển thị cho học viên trong lớp.
                          Loại bài thi: <strong>Bài luyện tập (PRACTICE)</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mode Selection (Auto vs Manual) - Enhanced */}
                  {isCreateMode && (selectedCourseInfo || selectedClassInfo) && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Wand2 className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-bold text-gray-900">Chọn chế độ tạo đề thi</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Manual Mode */}
                        <button
                          type="button"
                          onClick={() => {
                            setAutoGenerateMode(false);
                            setShowStructureBuilder(false);
                          }}
                          className={`p-5 border-2 rounded-xl text-left transition-all duration-200 group ${
                            !autoGenerateMode
                              ? 'border-indigo-500 bg-white shadow-lg scale-105'
                              : 'border-gray-200 hover:border-indigo-300 bg-white/50 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                              !autoGenerateMode
                                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg'
                                : 'bg-gray-300 group-hover:bg-indigo-200'
                            }`}>
                              <Edit className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className={`font-bold mb-1 ${!autoGenerateMode ? 'text-indigo-700' : 'text-gray-700'}`}>
                                ✋ Tự chọn câu hỏi
                              </div>
                              <div className="text-sm text-gray-600">
                                Tự động chọn từng câu hỏi từ Question Bank theo ý muốn
                              </div>
                              {!autoGenerateMode && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Đang chọn
                                </div>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Auto Mode */}
                        <button
                          type="button"
                          onClick={() => {
                            setAutoGenerateMode(true);
                            setShowStructureBuilder(true);
                          }}
                          className={`p-5 border-2 rounded-xl text-left transition-all duration-200 group ${
                            autoGenerateMode
                              ? 'border-purple-500 bg-white shadow-lg scale-105'
                              : 'border-gray-200 hover:border-purple-300 bg-white/50 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                              autoGenerateMode
                                ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg'
                                : 'bg-gray-300 group-hover:bg-purple-200'
                            }`}>
                              <Wand2 className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className={`font-bold mb-1 ${autoGenerateMode ? 'text-purple-700' : 'text-gray-700'}`}>
                                ✨ Tạo tự động
                              </div>
                              <div className="text-sm text-gray-600">
                                Random câu hỏi theo cấu trúc TOPIK tự động
                              </div>
                              {autoGenerateMode && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-purple-600 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Đang chọn
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Exam Structure Builder (when auto mode is selected) */}
                  {autoGenerateMode && showStructureBuilder && (selectedCourseInfo || selectedClassInfo) && (
                    <div className="mt-6 p-6 bg-white rounded-xl border-2 border-purple-200 shadow-lg">
                      <ExamStructureBuilder
                        topikLevel={selectedClassInfo ? 'TOPIK_II' : (selectedCourseInfo?.level === 'BEGINNER' ? 'TOPIK_I' : 'TOPIK_II')}
                        onGenerate={handleAutoGenerate}
                        questionBank={courseQuestions || []}
                        courseLevel={selectedCourseInfo?.level || selectedClassInfo?.course?.level}
                        isClassExam={!!selectedClassInfo}
                      />
                    </div>
                  )}
                </div>

                {/* Section: Exam Settings */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Cài đặt bài thi</h3>
                  </div>

                  {/* Duration, Passing Score, Max Attempts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          {t('exam.duration', 'Thời gian (phút)')}
                        </div>
                      </label>
                      <Input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => handleFormChange('duration', e.target.value ? parseInt(e.target.value) : 70)}
                        min={1}
                        max={300}
                        className="text-lg font-semibold"
                      />
                    </div>

                    {/* Passing Score */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {t('exam.passingScore', 'Điểm đạt (%)')}
                        </div>
                      </label>
                      <Input
                        type="number"
                        value={formData.passingScore}
                        onChange={(e) => handleFormChange('passingScore', e.target.value ? parseInt(e.target.value) : 80)}
                        min={0}
                        max={100}
                        className="text-lg font-semibold"
                      />
                    </div>

                    {/* Unit - Only for Class Exams */}
                    {formData.classId && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-500" />
                            Unit (1-12)
                          </div>
                        </label>
                        <select
                          value={formData.unit}
                          onChange={(e) => handleFormChange('unit', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white text-lg font-semibold"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(unitNum => (
                            <option key={unitNum} value={unitNum}>
                              Unit {unitNum}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

            {/* Questions Tab Content */}
            {activeTab === 'questions' && (
              <div className="p-6">
                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  <Button
                    variant="secondary"
                    className="w-full"
                    icon={<BookOpen className="w-4 h-4" />}
                    onClick={handleOpenQuestionBank}
                    disabled={(!selectedCourseInfo && !selectedClassInfo) || exam?.published}
                  >
                    {t('exam.selectFromQuestionBank', 'Chọn từ Ngân Hàng Câu Hỏi')}
                    {!selectedCourseInfo && !selectedClassInfo && ` (${t('exam.selectCourseOrClassFirst', 'Chọn khóa học hoặc lớp học trước')})`}
                  </Button>

                  {/* NEW: Replace Questions Buttons */}
                  {questions.length > 0 && !exam?.published && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">🔄 Đổi câu hỏi</h4>
                          <p className="text-xs text-gray-600">
                            Chọn câu hỏi để thay thế bằng câu hỏi khác từ Question Bank
                          </p>
                        </div>
                        {selectedQuestions.size > 0 && (
                          <span className="text-sm font-medium text-indigo-600">
                            {selectedQuestions.size} đã chọn
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (selectedQuestions.size > 0) {
                              setSelectedQuestionIndices(Array.from(selectedQuestions));
                              setShowReplaceModal(true);
                            } else {
                              setError('Vui lòng chọn ít nhất 1 câu hỏi để đổi');
                            }
                          }}
                          disabled={selectedQuestions.size === 0}
                          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedQuestions.size > 0
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Đổi câu đã chọn
                        </button>

                        <button
                          onClick={() => {
                            setSelectedQuestionIndices(questions.map((_, i) => i));
                            setShowReplaceModal(true);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
                        >
                          Đổi tất cả
                        </button>

                        {selectedQuestions.size > 0 && (
                          <button
                            onClick={() => setSelectedQuestions(new Set())}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all"
                          >
                            Bỏ chọn
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const isSelected = selectedQuestions.has(index);

                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border transition-all ${
                          question.isNew
                            ? 'border-primary-200 bg-primary-50'
                            : isSelected
                              ? 'border-indigo-500 bg-indigo-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                        } ${exam?.published ? 'opacity-75' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* NEW: Checkbox for selection */}
                          {!exam?.published && (
                            <button
                              onClick={() => toggleQuestionSelection(index)}
                              className="mt-1 flex-shrink-0"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-indigo-600" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-500">
                                #{index + 1}
                              </span>
                              {question.topikType && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                  {question.topikType}
                                </span>
                              )}
                              {getQuestionTypeBadge(question.category || question.type)}
                              {getDifficultyBadge(question.difficulty)}
                              {question.verificationStatus === 'APPROVED' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                  ✓ Đã duyệt
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-900 line-clamp-2" dangerouslySetInnerHTML={{ __html: question.content }} />
                            {question.imageUrl && (
                                <div className="mt-1 text-xs text-blue-500 font-medium flex items-center gap-1">
                                    🖼️ Có hình ảnh đính kèm
                                </div>
                            )}
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => handlePreviewQuestion(question)}
                              title={t('exam.preview', 'Xem trước')}
                            />
                            {!exam?.published && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={<Edit className="w-4 h-4" />}
                                  onClick={() => navigate(`/teacher/questions/${question.id}/edit`)}
                                  title={t('exam.edit', 'Chỉnh sửa')}
                                />
                                <Button
                                  variant="danger"
                                  size="sm"
                                  icon={<Trash2 className="w-4 h-4" />}
                                  onClick={() => handleDeleteQuestion(question)}
                                  title={t('exam.delete', 'Xóa')}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {questions.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Chưa có câu hỏi nào</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Thêm câu hỏi mới hoặc chọn từ Question Bank
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
          </div>

          {/* Right Sidebar - Quick Stats & Preview */}
          <div className="xl:col-span-1 space-y-6">

            {/* Quick Stats Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Thống kê nhanh</h3>
                </div>

                <div className="space-y-4">
                  {/* Question Count */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Số câu hỏi</p>
                        <p className="text-3xl font-bold">{questions.length}</p>
                      </div>
                      <FileText className="w-10 h-10 text-white/30" />
                    </div>
                    {questions.length > 0 && (
                      <div className="mt-2 text-xs text-blue-100">
                        {questions.filter(q => q.type === 'MULTIPLE_CHOICE').length} Trắc nghiệm,
                        {' '}{questions.filter(q => q.type === 'WRITING').length} Tự luận
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Thời lượng</p>
                        <p className="text-3xl font-bold">{formData.duration}</p>
                      </div>
                      <Clock className="w-10 h-10 text-white/30" />
                    </div>
                    <p className="mt-2 text-xs text-blue-100">phút</p>
                  </div>

                  {/* Total Points */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Điểm đạt</p>
                        <p className="text-3xl font-bold">{formData.passingScore}%</p>
                      </div>
                      <CheckCircle2 className="w-10 h-10 text-white/30" />
                    </div>
                  </div>
                </div>

                {/* Exam Category Badge */}
                <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${
                  formData.examCategory === 'MOCK'
                    ? 'bg-purple-500 text-white'
                    : 'bg-green-500 text-white'
                }`}>
                  {formData.examCategory === 'MOCK' ? '🎯 Mock Test' : '📚 Bài Luyện Tập'}
                </div>
              </div>
            </Card>

            {/* Exam Type Badge */}
            <Card className="shadow-md border-0">
              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Hình thức thi</h4>
                <div className="flex flex-wrap gap-2">
                  {getQuestionTypeBadge(formData.examType)}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Trạng thái</span>
                    {formData.published ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        ✅ Đã đăng
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                        ⏳ Nháp
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Tips */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <div className="p-6">
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Mẹo nhanh
                </h4>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Chọn "Tạo tự động" để random theo cấu trúc TOPIK</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Bài Mock hiển thị cho Guest, Practice cho Student</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Published exam không thể chỉnh sửa</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Question Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setQuestionToDelete(null);
        }}
        size="md"
        title={t('exam.deleteQuestionConfirmTitle', 'Xác Nhận Xóa Câu Hỏi')}
      >
        <div className="space-y-4">
          <Alert variant="warning">
            {t('exam.deleteQuestionWarning', 'Bạn có chắc chắn muốn xóa câu hỏi này?')}
          </Alert>

          {questionToDelete && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900"><span dangerouslySetInnerHTML={{ __html: questionToDelete.content }} /></p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowDeleteModal(false);
                setQuestionToDelete(null);
              }}
            >
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={confirmDeleteQuestion}
            >
              {t('exam.confirmDelete', 'Xóa')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Question Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewQuestion(null);
        }}
        size="lg"
        title={t('exam.questionPreview', 'Xem Trước Câu Hỏi')}
      >
        {previewQuestion && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getQuestionTypeBadge(previewQuestion.type)}
                {getDifficultyBadge(previewQuestion.difficulty)}
              </div>
              <div className="text-gray-900 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewQuestion.content }} />
              {previewQuestion.imageUrl && (
                <div className="mt-4 flex justify-center">
                  <img src={previewQuestion.imageUrl} alt="Hình ảnh câu hỏi" className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </div>

            {previewQuestion.answers && previewQuestion.answers.length > 0 && (
              <div className="space-y-2">
                {previewQuestion.answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      index === previewQuestion.correctAnswer
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-gray-900"><span dangerouslySetInnerHTML={{ __html: answer }} /></span>
                      {index === previewQuestion.correctAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Question Bank Modal */}
      {showQuestionBankModal && (
        <QuestionBankModal
          isOpen={showQuestionBankModal}
          onClose={() => {
            setShowQuestionBankModal(false);
            setSelectedQuestionsFromBank([]);
            setSearchTerm('');
          }}
          availableQuestions={availableQuestions}
          selectedQuestions={selectedQuestionsFromBank}
          onToggleSelection={handleToggleQuestionFromBank}
          onAddSelected={() => {
            handleAddQuestionsFromBank();
            setShowQuestionBankModal(false);
          }}
          courseInfo={selectedClassInfo?.course || selectedCourseInfo}
          unit={formData.classId ? formData.unit : null} // NEW: Pass unit for Class exams
        />
      )}

      {/* NEW: Question Replacer Modal */}
      <QuestionReplacerModal
        isOpen={showReplaceModal}
        onClose={() => {
          setShowReplaceModal(false);
          setSelectedQuestionIndices([]);
        }}
        onReplace={handleReplaceQuestions}
        currentQuestions={questions}
        questionBank={courseQuestions || []}
        selectedIndices={selectedQuestionIndices}
        examCategory={formData.examCategory}
        courseLevel={selectedCourseInfo?.level}
      />

      {/* Loading Overlay */}
      {saving && (
        <Loading.Overlay
          message={t('exam.saving', 'Đang lưu bài kiểm tra...')}
        />
      )}
    </PageContainer>
  );
};

export default ExamEditor;
