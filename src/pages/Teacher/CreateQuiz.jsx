import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const CreateQuiz = () => {
    const { t } = useTranslation();
    const [quizType, setQuizType] = useState('auto');
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                {t('createQuiz.title', 'Tạo Quiz Cuối Buổi')}
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                                {t('createQuiz.subtitle', 'Tạo bài kiểm tra nhanh cho học viên sau buổi học')}
                            </p>
                        </div>

                        {/* Quiz Type Selection */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                                {t('createQuiz.quizType', 'Loại Quiz')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                <button
                                    onClick={() => setQuizType('auto')}
                                    className={`p-4 sm:p-6 border-2 rounded-xl transition text-left ${quizType === 'auto'
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-primary-300'
                                        }`}
                                >
                                    <div className="text-3xl sm:text-4xl mb-2">🎲</div>
                                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                                        {t('createQuiz.autoGenerate', 'Tự Động Từ Question Bank')}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        {t('createQuiz.autoDesc', 'Chọn câu hỏi ngẫu nhiên từ ngân hàng câu hỏi theo lesson tag')}
                                    </p>
                                </button>

                                <button
                                    onClick={() => setQuizType('manual')}
                                    className={`p-4 sm:p-6 border-2 rounded-xl transition text-left ${quizType === 'manual'
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-primary-300'
                                        }`}
                                >
                                    <div className="text-3xl sm:text-4xl mb-2">✍️</div>
                                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                                        {t('createQuiz.manual', 'Tạo Câu Hỏi Riêng')}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        {t('createQuiz.manualDesc', 'Tự tạo câu hỏi hoàn toàn mới cho quiz này')}
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Quiz Configuration */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                                {t('createQuiz.config', 'Cấu Hình Quiz')}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                        {t('createQuiz.quizTitle', 'Tiêu đề Quiz')}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                                        placeholder={t('createQuiz.titlePlaceholder', 'VD: Quiz Cuối Buổi - Lesson 5')}
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                        {t('createQuiz.class', 'Lớp Học')}
                                    </label>
                                    <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base">
                                        <option value="">{t('createQuiz.selectClass', 'Chọn lớp...')}</option>
                                        <option value="1">Advanced A1</option>
                                        <option value="2">Intermediate B2</option>
                                        <option value="3">Beginner C1</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                        {t('createQuiz.lessonTag', 'Lesson Tag')}
                                    </label>
                                    <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base">
                                        <option value="">{t('createQuiz.selectLesson', 'Chọn lesson...')}</option>
                                        <option value="1">Lesson 1: Greetings</option>
                                        <option value="2">Lesson 2: Numbers</option>
                                        <option value="3">Lesson 3: Family</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                        {t('createQuiz.questionCount', 'Số Câu Hỏi')}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        defaultValue="10"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                        {t('createQuiz.duration', 'Thời Gian (phút)')}
                                    </label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="60"
                                        defaultValue="15"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm sm:text-base">
                                        {t('createQuiz.dueDate', 'Hạn Nộp')}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Question Preview (if auto) */}
                        {quizType === 'auto' && (
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                                    {t('createQuiz.preview', 'Xem Trước Câu Hỏi')}
                                </h2>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-3 sm:p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                                            <div className="mr-2">
                                                <span className="font-medium text-gray-900 text-sm sm:text-base">Q{i}: </span>
                                                <span className="text-gray-600 text-sm sm:text-base">Sample question from Question Bank...</span>
                                            </div>
                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0">🗑️</button>
                                        </div>
                                    ))}
                                </div>
                                <button className="mt-4 px-4 sm:px-6 py-2 border-2 border-primary-300 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition text-sm sm:text-base">
                                    + {t('createQuiz.regenerate', 'Tạo Lại Câu Hỏi')}
                                </button>
                            </div>
                        )}

                        {/* Manual Question Creator */}
                        {quizType === 'manual' && (
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                                    {t('createQuiz.createQuestions', 'Tạo Câu Hỏi')}
                                </h2>

                                <div className="space-y-4 mb-4">
                                    <div className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl text-center">
                                        <div className="text-3xl sm:text-4xl mb-2">➕</div>
                                        <p className="text-gray-600 text-sm sm:text-base">{t('createQuiz.addQuestion', 'Thêm câu hỏi mới')}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button className="flex-1 px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:shadow-xl transition text-sm sm:text-base">
                                {t('createQuiz.create', 'Tạo Quiz')} →
                            </button>
                            <button className="px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition text-sm sm:text-base">
                                {t('createQuiz.cancel', 'Hủy')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CreateQuiz;
