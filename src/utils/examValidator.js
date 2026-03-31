/**
 * Exam Validator Utility
 * Validate exam before publishing
 */

/**
 * Validate exam before publishing
 * @param {object} exam - Exam object to validate
 * @param {array} questions - List of questions in exam
 * @returns {object} - { valid: boolean, errors: array, warnings: array }
 */
export const validateExamBeforePublish = (exam, questions = []) => {
  const errors = [];
  const warnings = [];

  // 1. Basic field validation
  if (!exam.title || exam.title.trim() === '') {
    errors.push('Thiếu tiêu đề đề thi');
  }

  if (!exam.code || exam.code.trim() === '') {
    errors.push('Thiếu mã đề thi');
  }

  if (!exam.duration || exam.duration < 10) {
    errors.push('Thời gian làm bài phải ít nhất 10 phút');
  }

  if (!exam.passingScore || exam.passingScore < 0 || exam.passingScore > 100) {
    errors.push('Điểm đạt phải từ 0-100');
  }

  // courseId only required when NOT creating exam for a class
  // (class exams are linked to course via class)
  if (!exam.courseId && !exam.classId) {
    errors.push('Thiếu khóa học');
  }

  // 2. Questions validation
  if (!questions || questions.length === 0) {
    errors.push('Đề thi phải có ít nhất 1 câu hỏi');
  } else {
    // Check minimum questions for each category
    const readingQuestions = questions.filter(q => q.category === 'READING');
    const listeningQuestions = questions.filter(q => q.category === 'LISTENING');
    const writingQuestions = questions.filter(q => q.category === 'WRITING');

    if (exam.examType === 'MIXED' || exam.examType === 'READING') {
      if (readingQuestions.length < 5) {
        warnings.push('Phần Đọc nên có ít nhất 5 câu hỏi');
      }
    }

    if (exam.examType === 'MIXED' || exam.examType === 'LISTENING') {
      if (listeningQuestions.length < 5) {
        warnings.push('Phần Nghe nên có ít nhất 5 câu hỏi');
      }
    }

    if (exam.examType === 'MIXED' || exam.examType === 'WRITING') {
      if (writingQuestions.length < 1 && exam.examType === 'WRITING') {
        warnings.push('Phần Viết nên có ít nhất 1 câu hỏi');
      }
    }

    // Check question verification status
    const unapprovedQuestions = questions.filter(q => q.verificationStatus !== 'APPROVED');
    if (unapprovedQuestions.length > 0) {
      warnings.push(`${unapprovedQuestions.length} câu hỏi chưa được duyệt (${unapprovedQuestions.map(q => q.code || q.id).join(', ')})`);
    }

    // Check for duplicate questions
    const questionIds = questions.map(q => q.id);
    const duplicateIds = questionIds.filter((id, index) => questionIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Có câu hỏi trùng lặp: ${duplicateIds.join(', ')}`);
    }

    // Check question order and numbering
    let hasOrderIssue = false;
    questions.forEach((q, index) => {
      if (q.orderNumber !== undefined && q.orderNumber !== index + 1) {
        hasOrderIssue = true;
      }
    });
    if (hasOrderIssue) {
      warnings.push('Thứ tự câu hỏi không đúng, vui lòng sắp xếp lại');
    }
  }

  // 3. Category-specific validation
  if (exam.examCategory === 'MOCK') {
    // Mock tests should have full TOPIK structure
    const totalQuestions = questions.length;
    if (totalQuestions < 40) {
      warnings.push('Đề Mock Test nên có ít nhất 40 câu hỏi (TOPIK I)');
    }
    if (totalQuestions < 104 && exam.examType === 'MIXED') {
      warnings.push('Đề Mock Test TOPIK II nên có 104 câu hỏi (50 Đọc + 50 Nghe + 4 Viết)');
    }
  } else if (exam.examCategory === 'PRACTICE') {
    // Practice exams can be flexible
    if (questions.length < 5) {
      warnings.push('Đề luyện tập nên có ít nhất 5 câu hỏi');
    }
  }

  // 4. Check if exam is already published
  if (exam.published) {
    errors.push('Đề thi đã được published, không thể chỉnh sửa');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Check if exam can be edited
 * @param {object} exam - Exam object
 * @returns {object} - { canEdit: boolean, reason: string }
 */
export const canEditExam = (exam) => {
  if (!exam) {
    return { canEdit: false, reason: 'Không tìm thấy đề thi' };
  }

  if (exam.published) {
    return {
      canEdit: false,
      reason: 'Đề thi đã published. Không thể chỉnh sửa. Vui lòng unpublish trước.'
    };
  }

  return { canEdit: true, reason: '' };
};

/**
 * Check if exam can be deleted
 * @param {object} exam - Exam object
 * @param {number} attemptCount - Number of attempts made
 * @returns {object} - { canDelete: boolean, reason: string }
 */
export const canDeleteExam = (exam, attemptCount = 0) => {
  if (!exam) {
    return { canDelete: false, reason: 'Không tìm thấy đề thi' };
  }

  if (exam.published && attemptCount > 0) {
    return {
      canDelete: false,
      reason: `Đã có ${attemptCount} lượt làm bài. Không thể xóa.`
    };
  }

  if (exam.published) {
    return {
      canDelete: false,
      reason: 'Đề thi đã published. Vui lòng unpublish trước.'
    };
  }

  return { canDelete: true, reason: '' };
};

/**
 * Validate question structure for TOPIK
 * @param {array} questions - List of questions
 * @param {string} structure - 'TOPIK_I' or 'TOPIK_II'
 * @returns {object} - { valid: boolean, issues: array }
 */
export const validateTopikStructure = (questions, structure = 'TOPIK_II') => {
  const issues = [];

  // Group questions by category
  const readingQuestions = questions.filter(q => q.category === 'READING');
  const listeningQuestions = questions.filter(q => q.category === 'LISTENING');
  const writingQuestions = questions.filter(q => q.category === 'WRITING');

  if (structure === 'TOPIK_II') {
    // TOPIK II: 50 Reading + 50 Listening + 4 Writing = 104 questions
    if (readingQuestions.length < 50) {
      issues.push(`Phần Đọc: ${readingQuestions.length}/50 câu (thiếu ${50 - readingQuestions.length} câu)`);
    }
    if (listeningQuestions.length < 50) {
      issues.push(`Phần Nghe: ${listeningQuestions.length}/50 câu (thiếu ${50 - listeningQuestions.length} câu)`);
    }
    if (writingQuestions.length < 4) {
      issues.push(`Phần Viết: ${writingQuestions.length}/4 câu (thiếu ${4 - writingQuestions.length} câu)`);
    }
  } else {
    // TOPIK I: ~20 Reading + ~20 Listening = 40 questions
    if (readingQuestions.length < 20) {
      issues.push(`Phần Đọc: ${readingQuestions.length}/20 câu (thiếu ${20 - readingQuestions.length} câu)`);
    }
    if (listeningQuestions.length < 20) {
      issues.push(`Phần Nghe: ${listeningQuestions.length}/20 câu (thiếu ${20 - listeningQuestions.length} câu)`);
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
};

export default {
  validateExamBeforePublish,
  canEditExam,
  canDeleteExam,
  validateTopikStructure
};
