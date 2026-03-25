/**
 * TOPIK Exam Structure Constants
 * Định nghĩa cấu trúc đề thi TOPIK I và TOPIK II
 */

/**
 * Cấu trúc phần Đọc (Reading) - TOPIK II
 * 50 câu hỏi với 10 dạng bài
 */
export const READING_STRUCTURE = [
  {
    type: 'R1',
    name: 'Chọn ngữ pháp/từ vựng',
    range: [1, 4],
    count: 4,
    description: 'Chọn ngữ pháp/từ vựng phù hợp điền vào chỗ trống',
    category: 'READING',
    difficulty: 'BEGINNER',
    pointsPerQuestion: 1
  },
  {
    type: 'R2',
    name: 'Đọc hiểu văn bản thực tế',
    range: [5, 8],
    count: 4,
    description: 'Đọc hiểu nội dung các văn bản thực tế (poster, quảng cáo, ghi chú)',
    category: 'READING',
    difficulty: 'BEGINNER',
    pointsPerQuestion: 1
  },
  {
    type: 'R3',
    name: 'Đọc biểu đồ, bảng biểu',
    range: [9, 12],
    count: 4,
    description: 'Đọc biểu đồ, bảng biểu và chọn đáp án đúng với nội dung',
    category: 'READING',
    difficulty: 'BEGINNER',
    pointsPerQuestion: 1
  },
  {
    type: 'R4',
    name: 'Sắp xếp thứ tự câu',
    range: [13, 15],
    count: 3,
    description: 'Sắp xếp thứ tự các câu để tạo thành một đoạn văn hoàn chỉnh',
    category: 'READING',
    difficulty: 'INTERMEDIATE',
    pointsPerQuestion: 1
  },
  {
    type: 'R5',
    name: 'Đọc đoạn văn cơ bản',
    range: [16, 22],
    count: 7,
    description: 'Đọc đoạn văn và chọn đáp án đúng/sai hoặc điền vào chỗ trống',
    category: 'READING',
    difficulty: 'INTERMEDIATE',
    pointsPerQuestion: 1
  },
  {
    type: 'R6',
    name: 'Đọc bài viết ngắn',
    range: [23, 31],
    count: 9,
    description: 'Đọc các bài báo, bài viết ngắn và trả lời câu hỏi về tâm trạng nhân vật, nội dung chính',
    category: 'READING',
    difficulty: 'INTERMEDIATE',
    pointsPerQuestion: 1
  },
  {
    type: 'R7',
    name: 'Đọc đoạn văn dài',
    range: [32, 41],
    count: 10,
    description: 'Đọc các đoạn văn dài hơn về các chủ đề xã hội, văn hóa',
    category: 'READING',
    difficulty: 'ADVANCED',
    pointsPerQuestion: 1
  },
  {
    type: 'R8',
    name: 'Chọn tiêu đề/chủ đề chính',
    range: [42, 45],
    count: 4,
    description: 'Chọn tiêu đề, chủ đề chính của đoạn văn hoặc chọn câu phù hợp để điền vào vị trí gạch chân',
    category: 'READING',
    difficulty: 'ADVANCED',
    pointsPerQuestion: 1
  },
  {
    type: 'R9',
    name: 'Đọc bài viết chuyên sâu (2 câu/bài)',
    range: [46, 50],
    count: 5,
    description: 'Đọc các bài viết chuyên sâu (khoa học, kinh tế, văn học) - 2 câu cho mỗi bài',
    category: 'READING',
    difficulty: 'ADVANCED',
    pointsPerQuestion: 2
  }
];

/**
 * Cấu trúc phần Nghe (Listening) - TOPIK II
 * 50 câu hỏi với 10 dạng bài
 */
export const LISTENING_STRUCTURE = [
  {
    type: 'L1',
    name: 'Nghe chọn hình/biểu đồ',
    range: [1, 3],
    count: 3,
    description: 'Nghe hội thoại và chọn hình ảnh/biểu đồ tương ứng',
    category: 'LISTENING',
    difficulty: 'BEGINNER',
    pointsPerQuestion: 1
  },
  {
    type: 'L2',
    name: 'Nghe chọn câu trả lời',
    range: [4, 8],
    count: 5,
    description: 'Nghe câu hỏi và chọn câu trả lời tiếp theo phù hợp nhất',
    category: 'LISTENING',
    difficulty: 'BEGINNER',
    pointsPerQuestion: 1
  },
  {
    type: 'L3',
    name: 'Nghe chọn hành động',
    range: [9, 12],
    count: 4,
    description: 'Nghe hội thoại và chọn hành động tiếp theo của nhân vật',
    category: 'LISTENING',
    difficulty: 'BEGINNER',
    pointsPerQuestion: 1
  },
  {
    type: 'L4',
    name: 'Nghe chọn nội dung giống',
    range: [13, 16],
    count: 4,
    description: 'Nghe hội thoại và chọn đáp án có nội dung giống với những gì đã nghe',
    category: 'LISTENING',
    difficulty: 'INTERMEDIATE',
    pointsPerQuestion: 1
  },
  {
    type: 'L5',
    name: 'Nghe chọn suy nghĩ/ý định',
    range: [17, 21],
    count: 5,
    description: 'Nghe hội thoại và chọn đáp án đúng về suy nghĩ/ý định trọng tâm của nhân vật',
    category: 'LISTENING',
    difficulty: 'INTERMEDIATE',
    pointsPerQuestion: 1
  },
  {
    type: 'L6',
    name: 'Nghe hội thoại dài',
    range: [22, 36],
    count: 15,
    description: 'Nghe các đoạn hội thoại dài, tin tức, bài phỏng vấn và trả lời câu hỏi về nội dung chi tiết',
    category: 'LISTENING',
    difficulty: 'INTERMEDIATE',
    pointsPerQuestion: 1
  },
  {
    type: 'L7',
    name: 'Nghe bài giảng chuyên môn (2 câu/bài)',
    range: [37, 50],
    count: 14,
    description: 'Nghe các bài giảng, tọa đàm (2 câu cho mỗi bài)',
    category: 'LISTENING',
    difficulty: 'ADVANCED',
    pointsPerQuestion: 1
  }
];

/**
 * Cấu trúc phần Viết (Writing) - TOPIK II
 * 4 câu hỏi (51-54)
 */
export const WRITING_STRUCTURE = [
  {
    type: 'W51',
    name: 'Điền vào chỗ trống (Đời sống)',
    range: [51, 51],
    count: 1,
    description: 'Hoàn thành một đoạn văn ngắn về đời sống (thông báo, email, tin nhắn) bằng 1-2 câu phù hợp ngữ cảnh',
    category: 'WRITING',
    difficulty: 'INTERMEDIATE',
    pointsPerQuestion: 10
  },
  {
    type: 'W52',
    name: 'Điền vào chỗ trống (Giải thích)',
    range: [52, 52],
    count: 1,
    description: 'Hoàn thành một đoạn văn giải thích một khái niệm, hiện tượng bằng 1-2 câu logic, sử dụng ngữ pháp trung cấp',
    category: 'WRITING',
    difficulty: 'INTERMEDIATE',
    pointsPerQuestion: 10
  },
  {
    type: 'W53',
    name: 'Viết bài luận ngắn (Biểu đồ)',
    range: [53, 53],
    count: 1,
    description: 'Phân tích biểu đồ (dạng cột, tròn) và viết một đoạn văn 200-300 chữ mô tả, giải thích xu hướng, nguyên nhân',
    category: 'WRITING',
    difficulty: 'ADVANCED',
    pointsPerQuestion: 30
  },
  {
    type: 'W54',
    name: 'Viết bài luận dài (Nghị luận)',
    range: [54, 54],
    count: 1,
    description: 'Viết một bài nghị luận 600-700 chữ trình bày quan điểm về một vấn đề xã hội, trích dẫn được đưa ra',
    category: 'WRITING',
    difficulty: 'ADVANCED',
    pointsPerQuestion: 50
  }
];

/**
 * Cấu trúc đề thi TOPIK I (Cấp độ 1-2)
 */
export const TOPIK_I_STRUCTURE = {
  reading: READING_STRUCTURE.filter(q => q.difficulty === 'BEGINNER').slice(0, 6), // R1-R6
  listening: LISTENING_STRUCTURE.filter(q => q.difficulty === 'BEGINNER').slice(0, 6), // L1-L6
  totalQuestions: 40,
  duration: 100,
  passingScore: 80
};

/**
 * Cấu trúc đề thi TOPIK II (Cấp độ 3-6)
 */
export const TOPIK_II_STRUCTURE = {
  reading: READING_STRUCTURE, // R1-R10 (50 câu)
  listening: LISTENING_STRUCTURE, // L1-L8 (50 câu)
  writing: WRITING_STRUCTURE, // W51-W54 (4 câu)
  totalQuestions: 104,
  duration: 180,
  passingScore: 120
};

/**
 * Mapping question type to structure
 */
export const QUESTION_TYPE_MAPPING = {
  'READING': READING_STRUCTURE,
  'LISTENING': LISTENING_STRUCTURE,
  'WRITING': WRITING_STRUCTURE
};

/**
 * Get question structure by type and number
 * @param {string} category - READING, LISTENING, WRITING
 * @param {number} questionNumber - Số thứ tự câu hỏi
 * @returns {object|null} - Cấu trúc câu hỏi hoặc null
 */
export const getQuestionStructure = (category, questionNumber) => {
  const structures = QUESTION_TYPE_MAPPING[category] || [];
  return structures.find(s =>
    questionNumber >= s.range[0] && questionNumber <= s.range[1]
  ) || null;
};

/**
 * Get all question types for a category
 * @param {string} category - READING, LISTENING, WRITING
 * @returns {array} - Danh sách các loại câu hỏi
 */
export const getQuestionTypes = (category) => {
  const structures = QUESTION_TYPE_MAPPING[category] || [];
  return [...new Set(structures.map(s => s.type))].sort();
};

/**
 * Validate question number belongs to correct type
 * @param {string} category - READING, LISTENING, WRITING
 * @param {string} type - R1, R2, L1, W51, etc.
 * @param {number} questionNumber - Số thứ tự câu hỏi
 * @returns {boolean}
 */
export const validateQuestionType = (category, type, questionNumber) => {
  const structure = getQuestionStructure(category, questionNumber);
  return structure && structure.type === type;
};

export default {
  READING_STRUCTURE,
  LISTENING_STRUCTURE,
  WRITING_STRUCTURE,
  TOPIK_I_STRUCTURE,
  TOPIK_II_STRUCTURE,
  QUESTION_TYPE_MAPPING,
  getQuestionStructure,
  getQuestionTypes,
  validateQuestionType
};
