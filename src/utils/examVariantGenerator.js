/**
 * Utility to generate unique exam variants by shuffling questions and answers
 * Used for Type 2 (Mock Test) and Type 3 (Official Exam)
 */

export const generateExamVariant = (examData, studentId) => {
    if (!examData || !examData.sections) return examData;

    // Use studentId as seed for deterministic shuffle if needed
    // For now, simpler random shuffle

    const shuffledSections = examData.sections.map(section => ({
        ...section,
        questions: shuffleQuestions(section.questions)
    }));

    return {
        ...examData,
        sections: shuffledSections,
        variantId: `VAR_${Date.now()}_${studentId}`
    };
};

const shuffleQuestions = (questions) => {
    if (!questions) return [];

    // Deep copy
    const shuffled = JSON.parse(JSON.stringify(questions));

    // Shuffle questions
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Shuffle options for each question
    shuffled.forEach(q => {
        if (q.options && Array.isArray(q.options)) {
            for (let i = q.options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
            }
        }
    });

    return shuffled;
};

export default { generateExamVariant };
