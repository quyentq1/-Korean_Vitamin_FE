/**
 * Utility functions for filtering and selecting unique questions
 * Used for Type 1 free tests to prevent duplicate questions
 */

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Filter out questions that have already been used
 * @param {Array} questionBank - Full pool of available questions
 * @param {Array} usedQuestionIds - Array of question IDs already shown
 * @param {Number} requiredCount - Number of questions needed
 * @returns {Array} - Filtered and shuffled questions
 * @throws {Error} - If not enough unique questions available
 */
export const filterUniqueQuestions = (questionBank, usedQuestionIds = [], requiredCount) => {
    if (!Array.isArray(questionBank) || questionBank.length === 0) {
        throw new Error('Question bank is empty or invalid');
    }

    // Filter out used questions
    const availableQuestions = questionBank.filter(q => {
        return !usedQuestionIds.includes(q.id);
    });

    // Check if we have enough questions
    if (availableQuestions.length < requiredCount) {
        throw new Error(
            `Not enough unique questions available. Need: ${requiredCount}, Available: ${availableQuestions.length}`
        );
    }

    // Shuffle and select required count
    const shuffled = shuffleArray(availableQuestions);
    return shuffled.slice(0, requiredCount);
};

/**
 * Select random questions from a pool
 * @param {Array} questions - Questions to select from
 * @param {Number} count - Number to select
 * @returns {Array} - Random selection of questions
 */
export const selectRandomQuestions = (questions, count) => {
    if (!Array.isArray(questions) || questions.length === 0) {
        return [];
    }

    const actualCount = Math.min(count, questions.length);
    return shuffleArray(questions).slice(0, actualCount);
};

/**
 * Group questions by category
 * @param {Array} questions - Questions to group
 * @returns {Object} - Questions grouped by category ID
 */
export const groupQuestionsByCategory = (questions) => {
    return questions.reduce((acc, question) => {
        const categoryId = question.categoryId || 'uncategorized';
        if (!acc[categoryId]) {
            acc[categoryId] = [];
        }
        acc[categoryId].push(question);
        return acc;
    }, {});
};

/**
 * Get question IDs from question array
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Array of question IDs
 */
export const extractQuestionIds = (questions) => {
    if (!Array.isArray(questions)) {
        return [];
    }
    return questions.map(q => q.id).filter(id => id !== undefined && id !== null);
};
