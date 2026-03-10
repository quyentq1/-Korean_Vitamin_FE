import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, FileText } from 'lucide-react';

/**
 * CreateReadingQuestion - Component tạo câu hỏi đọc hiểu
 * Priority 1: Question Bank
 */
const CreateReadingQuestion = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        passageTitle: '',
        passageContent: '',
        passageType: 'ACADEMIC', // ACADEMIC, NEWS, STORY, CONVERSATION
        category: 'Reading',
        difficulty: 'MEDIUM',
        points: 2,
        questions: [
            {
                questionText: '',
                options: ['', '', '', ''],
                correctAnswer: '',
                explanation: ''
            }
        ],
        tags: []
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                {
                    questionText: '',
                    options: ['', '', '', ''],
                    correctAnswer: '',
                    explanation: ''
                }
            ]
        });
    };

    const removeQuestion = (index) => {
        if (formData.questions.length > 1) {
            const newQuestions = formData.questions.filter((_, i) => i !== index);
            setFormData({ ...formData, questions: newQuestions });
        }
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateQuestionOption = (questionIndex, optionIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[questionIndex].options[optionIndex] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const setQuestionCorrectAnswer = (questionIndex, optionIndex) => {
        const newQuestions = [...formData.questions];
        const option = newQuestions[questionIndex].options[optionIndex];
        newQuestions[questionIndex].correctAnswer = option;
        setFormData({ ...formData, questions: newQuestions });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.passageTitle.trim()) {
            newErrors.passageTitle = 'Vui lòng nhập tiêu đề bài đọc';
        }

        if (!formData.passageContent.trim()) {
            newErrors.passageContent = 'Vui lòng nhập nội dung bài đọc';
        }

        formData.questions.forEach((q, index) => {
            if (!q.questionText.trim()) {
                newErrors[`question_${index}`] = 'Câu hỏi không được để trống';
            }
            const validOptions = q.options.filter(opt => opt.trim());
            if (validOptions.length < 2) {
                newErrors[`options_${index}`] = 'Cần ít nhất 2 đáp án';
            }
            if (!q.correctAnswer) {
                newErrors[`answer_${index}`] = 'Chưa chọn đáp án đúng';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            onSubmit({
                ...formData,
                questionType: 'READING'
            });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Tạo Câu Hỏi Đọc Hiểu
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Tạo bài đọc với nhiều câu hỏi đi kèm
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Passage Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiêu đề bài đọc <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.passageTitle}
                            onChange={(e) => setFormData({ ...formData, passageTitle: e.target.value })}
                            placeholder="VD: Bài đọc về văn hóa Hàn Quốc"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                                errors.passageTitle ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.passageTitle && (
                            <p className="text-sm text-red-600 mt-1">{errors.passageTitle}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại bài đọc
                        </label>
                        <select
                            value={formData.passageType}
                            onChange={(e) => setFormData({ ...formData, passageType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="ACADEMIC">Học thuật</option>
                            <option value="NEWS">Tin tức</option>
                            <option value="STORY">Truyện ngắn</option>
                            <option value="CONVERSATION">Hội thoại</option>
                            <option value="ANNOUNCEMENT">Thông báo</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội dung bài đọc <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.passageContent}
                            onChange={(e) => setFormData({ ...formData, passageContent: e.target.value })}
                            placeholder="Dán nội dung bài đọc tại đây..."
                            rows={10}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none ${
                                errors.passageContent ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.passageContent && (
                            <p className="text-sm text-red-600 mt-1">{errors.passageContent}</p>
                        )}
                    </div>
                </div>

                {/* Difficulty & Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Độ khó
                        </label>
                        <select
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="EASY">Dễ</option>
                            <option value="MEDIUM">Trung bình</option>
                            <option value="HARD">Khó</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điểm mỗi câu
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                </div>

                {/* Questions */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold text-gray-900">
                            Câu hỏi ({formData.questions.length})
                        </h4>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="px-4 py-2 text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm câu hỏi
                        </button>
                    </div>

                    <div className="space-y-6">
                        {formData.questions.map((question, qIndex) => (
                            <div key={qIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-3">
                                    <h5 className="text-sm font-semibold text-gray-900">
                                        Câu {qIndex + 1}
                                    </h5>
                                    {formData.questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(qIndex)}
                                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Question Text */}
                                <div className="mb-3">
                                    <textarea
                                        value={question.questionText}
                                        onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                                        placeholder="Nhập câu hỏi..."
                                        rows={2}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm ${
                                            errors[`question_${qIndex}`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors[`question_${qIndex}`] && (
                                        <p className="text-xs text-red-600 mt-1">{errors[`question_${qIndex}`]}</p>
                                    )}
                                </div>

                                {/* Options */}
                                <div className="space-y-2 mb-3">
                                    {question.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setQuestionCorrectAnswer(qIndex, oIndex)}
                                                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                    question.correctAnswer === option
                                                        ? 'bg-purple-500 border-purple-500 text-white'
                                                        : 'border-gray-300 hover:border-purple-500'
                                                }`}
                                            >
                                                {question.correctAnswer === option && '✓'}
                                            </button>
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                                                placeholder={`Đáp án ${oIndex + 1}`}
                                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                            />
                                        </div>
                                    ))}
                                    {errors[`options_${qIndex}`] && (
                                        <p className="text-xs text-red-600 mt-1">{errors[`options_${qIndex}`]}</p>
                                    )}
                                    {errors[`answer_${qIndex}`] && (
                                        <p className="text-xs text-red-600 mt-1">{errors[`answer_${qIndex}`]}</p>
                                    )}
                                </div>

                                {/* Explanation */}
                                <div>
                                    <input
                                        type="text"
                                        value={question.explanation}
                                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                        placeholder="Giải thích (optional)"
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (Optional)
                    </label>
                    <input
                        type="text"
                        value={formData.tags.join(', ')}
                        onChange={(e) => setFormData({
                            ...formData,
                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        })}
                        placeholder="VD: culture, traditions, reading"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Xem trước</h4>
                    <div className="bg-white p-4 rounded-lg max-h-96 overflow-y-auto">
                        <h5 className="font-semibold text-gray-900 mb-2">{formData.passageTitle || 'Tiêu đề...'}</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">
                            {formData.passageContent || 'Nội dung bài đọc...'}
                        </p>
                        <div className="border-t border-gray-200 pt-4">
                            {formData.questions.map((q, index) => (
                                <div key={index} className="mb-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {index + 1}. {q.questionText || 'Câu hỏi...'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
                    >
                        Lưu Bài Đọc
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateReadingQuestion;
