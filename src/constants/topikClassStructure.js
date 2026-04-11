/**
 * TOPIK CLASS EXAM Structure Constants
 * Định nghĩa cấu trúc đề thi cho LỚP HỌC (CLASS) - không phải exam chính thức
 * Điểm số và cấu trúc được đơn giản hóa để phù hợp với exercises trong lớp
 */

/**
 * Cấu trúc phần Đọc (Reading) - Class Exam
 */
export const CLASS_READING_STRUCTURE = [
  {
    type: 'R10',
    name: 'Đọc hiểu câu đơn lẻ',
    range: [1, 10], // Có thể dùng cho 10 câu đầu
    count: 10,
    description: 'Đọc một câu/đoạn rất ngắn và trả lời câu hỏi (dễ hơn R9 trong TOPIK chính thức)',
    category: 'READING',
    difficulty: 'BEGINNER',
    pointsPerQuestion: 1,
    answerType: 'MULTIPLE_CHOICE' // Chọn đáp án A, B, C, D
  }
];

/**
 * Cấu trúc phần Nghe (Listening) - Class Exam
 */
export const CLASS_LISTENING_STRUCTURE = [
  {
    type: 'L8',
    name: 'Nghe hội thoại ngắn',
    range: [1, 10], // Có thể dùng cho 10 câu
    count: 10,
    description: 'Nghe đoạn hội thoại 2-3 câu và chọn đáp án (đơn giản hơn L7 trong TOPIK chính thức)',
    category: 'LISTENING',
    difficulty: 'BEGINNER',
    pointsPerQuestion: 1,
    answerType: 'MULTIPLE_CHOICE' // Chọn đáp án A, B, C, D
  },
  {
    type: 'L9',
    name: 'Nghe điền từ (Dictation)',
    range: [11, 20], // Có thể dùng cho 10 câu
    count: 10,
    description: 'Nghe đoạn hội thoại/ngắn và điền từ bị thiếu vào chỗ trống (TEXT INPUT, không phải multiple choice)',
    category: 'LISTENING',
    difficulty: 'INTERMEDIATE',
    pointsPerQuestion: 1,
    answerType: 'TEXT_INPUT' // Học sinh điền từ vào chỗ trống
  }
];

/**
 * Cấu trúc phần Viết (Writing) - Class Exam
 */
export const CLASS_WRITING_STRUCTURE = [
  {
    type: 'W55',
    name: 'Viết câu ngắn',
    range: [1, 5], // Có thể dùng cho 5 câu
    count: 5,
    description: 'Viết 1-2 câu hoàn thành theo yêu cầu (email ngắn, tin nhắn, câu mô tả đơn giản)',
    category: 'WRITING',
    difficulty: 'INTERMEDIATE',
    pointsPerQuestion: 10,
    answerType: 'TEXT_INPUT' // Học sinh viết câu
  }
];

/**
 * Cấu trúc đề thi Class (Lớp học)
 * Dùng cho exercises, quizzes trong lớp - không phải exam chính thức
 */
export const CLASS_EXAM_STRUCTURE = {
  reading: CLASS_READING_STRUCTURE,
  listening: CLASS_LISTENING_STRUCTURE,
  writing: CLASS_WRITING_STRUCTURE,
  totalQuestions: 25, // 10 R10 + 10 (L8+L9) + 5 W55
  duration: 60, // 60 phút
  passingScore: 15
};

/**
 * Mapping question type to structure for CLASS
 */
export const CLASS_QUESTION_TYPE_MAPPING = {
  'READING': CLASS_READING_STRUCTURE,
  'LISTENING': CLASS_LISTENING_STRUCTURE,
  'WRITING': CLASS_WRITING_STRUCTURE
};

/**
 * Get class question structure by type
 * @param {string} category - READING, LISTENING, WRITING
 * @param {string} type - R10, L8, L9, W55
 * @returns {object|null} - Cấu trúc câu hỏi hoặc null
 */
export const getClassQuestionStructure = (category, type) => {
  const structures = CLASS_QUESTION_TYPE_MAPPING[category] || [];
  return structures.find(s => s.type === type) || null;
};

/**
 * Get points per question for class exam type
 * @param {string} type - R10, L8, L9, W55
 * @returns {number} - Số điểm
 */
export const getClassQuestionPoints = (type) => {
  const allStructures = [
    ...CLASS_READING_STRUCTURE,
    ...CLASS_LISTENING_STRUCTURE,
    ...CLASS_WRITING_STRUCTURE
  ];
  const structure = allStructures.find(s => s.type === type);
  return structure?.pointsPerQuestion || 1;
};

/**
 * Get answer type for class exam question
 * @param {string} type - R10, L8, L9, W55
 * @returns {string} - MULTIPLE_CHOICE hoặc TEXT_INPUT
 */
export const getClassQuestionAnswerType = (type) => {
  const allStructures = [
    ...CLASS_READING_STRUCTURE,
    ...CLASS_LISTENING_STRUCTURE,
    ...CLASS_WRITING_STRUCTURE
  ];
  const structure = allStructures.find(s => s.type === type);
  return structure?.answerType || 'MULTIPLE_CHOICE';
};

/**
 * Get all available question types for class
 * @returns {array} - [{type, name, points, answerType}]
 */
export const getAllClassQuestionTypes = () => {
  return [
    ...CLASS_READING_STRUCTURE.map(s => ({
      type: s.type,
      name: s.name,
      category: s.category,
      points: s.pointsPerQuestion,
      answerType: s.answerType,
      description: s.description
    })),
    ...CLASS_LISTENING_STRUCTURE.map(s => ({
      type: s.type,
      name: s.name,
      category: s.category,
      points: s.pointsPerQuestion,
      answerType: s.answerType,
      description: s.description
    })),
    ...CLASS_WRITING_STRUCTURE.map(s => ({
      type: s.type,
      name: s.name,
      category: s.category,
      points: s.pointsPerQuestion,
      answerType: s.answerType,
      description: s.description
    }))
  ];
};

export default {
  CLASS_READING_STRUCTURE,
  CLASS_LISTENING_STRUCTURE,
  CLASS_WRITING_STRUCTURE,
  CLASS_EXAM_STRUCTURE,
  CLASS_QUESTION_TYPE_MAPPING,
  getClassQuestionStructure,
  getClassQuestionPoints,
  getClassQuestionAnswerType,
  getAllClassQuestionTypes
};
