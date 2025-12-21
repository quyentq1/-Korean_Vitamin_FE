import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ipTracker from '../../utils/IPTracker';

const TestRunner = () => {
    const { testId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [currentSection, setCurrentSection] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock test data - in real app, fetch from API
    const testData = {
        'test-1': {
            title: 'TOPIK Level 1',
            duration: 60,
            sections: [
                {
                    name: t('testRunner.listening', 'Nghe'),
                    questions: Array.from({ length: 20 }, (_, i) => ({
                        id: `L${i + 1}`,
                        text: `Câu hỏi nghe số ${i + 1}`,
                        audioUrl: '/audio/sample.mp3',
                        options: ['A', 'B', 'C', 'D']
                    }))
                },
                {
                    name: t('testRunner.reading', 'Đọc'),
                    questions: Array.from({ length: 20 }, (_, i) => ({
                        id: `R${i + 1}`,
                        text: `Câu hỏi đọc số ${i + 1}: Lorem ipsum dolor sit amet...`,
                        options: ['A', 'B', 'C', 'D']
                    }))
                }
            ]
        },
        'test-2': {
            title: 'TOPIK Level 2',
            duration: 90,
            sections: [
                {
                    name: t('testRunner.listening', 'Nghe'),
                    questions: Array.from({ length: 20 }, (_, i) => ({
                        id: `L${i + 1}`,
                        text: `Câu hỏi nghe số ${i + 1}`,
                        audioUrl: '/audio/sample.mp3',
                        options: ['A', 'B', 'C', 'D']
                    }))
                },
                {
                    name: t('testRunner.reading', 'Đọc'),
                    questions: Array.from({ length: 20 }, (_, i) => ({
                        id: `R${i + 1}`,
                        text: `Câu hỏi đọc số ${i + 1}: Lorem ipsum dolor sit amet...`,
                        options: ['A', 'B', 'C', 'D']
                    }))
                },
                {
                    name: t('testRunner.writing', 'Viết'),
                    questions: [
                        { id: 'W1', text: 'Viết đoạn văn ngắn (200-300 từ)', type: 'essay' },
                        { id: 'W2', text: 'Viết bài luận (600-700 từ)', type: 'essay' }
                    ]
                }
            ]
        }
    };

    const test = testData[testId] || testData['test-1'];
    const currentSectionData = test.sections[currentSection];
    const currentQuestionData = currentSectionData.questions[currentQuestion];

    // Timer countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 0) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Keyboard lock (disable certain keys)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'u')
            ) {
                e.preventDefault();
                return false;
            }
        };

        // Disable right-click
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleNext = () => {
        if (currentQuestion < currentSectionData.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else if (currentSection < test.sections.length - 1) {
            setCurrentSection(currentSection + 1);
            setCurrentQuestion(0);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        } else if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
            setCurrentQuestion(test.sections[currentSection - 1].questions.length - 1);
        }
    };

    const handleSubmit = async () => {
        if (!window.confirm(t('testRunner.confirmSubmit', 'Bạn có chắc muốn nộp bài?'))) {
            return;
        }

        setIsSubmitting(true);

        // Record test completion
        await ipTracker.recordTestAttempt(testId, true, null);

        // Navigate to results
        navigate(`/test-result/${testId}`, { state: { answers } });
    };

    const progress = ((currentSection * 100 + (currentQuestion / currentSectionData.questions.length) * 100) / test.sections.length);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Fixed Header */}
            <div className="fixed top-16 left-0 right-0 bg-white border-b shadow-sm z-40">
                <div className="container mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Test Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{test.title}</h1>
                            <div className="text-xs sm:text-sm text-gray-600 truncate">
                                {currentSectionData.name} - {t('testRunner.question', 'Câu')} {currentQuestion + 1}/{currentSectionData.questions.length}
                            </div>
                        </div>

                        {/* Timer */}
                        <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shrink-0 ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-sm sm:text-lg">{formatTime(timeRemaining)}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                            className="bg-primary-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow pt-32 sm:pt-36 pb-24">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8">
                        {/* Question */}
                        <div className="mb-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-primary-100 text-primary-700 font-bold px-2 py-1 sm:px-3 rounded-lg text-xs sm:text-sm shrink-0">
                                    {currentQuestionData.id}
                                </div>
                                <div className="flex-1">
                                    <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
                                        {currentQuestionData.text}
                                    </p>
                                </div>
                            </div>

                            {/* Audio Player for Listening */}
                            {currentQuestionData.audioUrl && (
                                <div className="mb-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                                    <audio controls className="w-full">
                                        <source src={currentQuestionData.audioUrl} type="audio/mpeg" />
                                    </audio>
                                </div>
                            )}

                            {/* Answer Options */}
                            {currentQuestionData.type === 'essay' ? (
                                <textarea
                                    value={answers[currentQuestionData.id] || ''}
                                    onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
                                    className="w-full h-48 sm:h-64 p-3 sm:p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none text-sm sm:text-base"
                                    placeholder={t('testRunner.writePlaceholder', 'Nhập câu trả lời của bạn...')}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {currentQuestionData.options.map((option) => (
                                        <label
                                            key={option}
                                            className={`flex items-center gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${answers[currentQuestionData.id] === option
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={currentQuestionData.id}
                                                value={option}
                                                checked={answers[currentQuestionData.id] === option}
                                                onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
                                                className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 shrink-0"
                                            />
                                            <span className="font-bold text-gray-700 text-sm sm:text-base">{option}</span>
                                            <span className="text-gray-600 text-sm sm:text-base">Option {option} text here</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-6 border-t gap-3">
                            <button
                                onClick={handlePrevious}
                                disabled={currentSection === 0 && currentQuestion === 0}
                                className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                ← {t('testRunner.previous', 'Trước')}
                            </button>

                            {currentSection === test.sections.length - 1 && currentQuestion === currentSectionData.questions.length - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 text-sm sm:text-base"
                                >
                                    {isSubmitting ? t('testRunner.submitting', 'Đang nộp...') : t('testRunner.submit', 'Nộp bài')}
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 text-sm sm:text-base"
                                >
                                    {t('testRunner.next', 'Sau')} →
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Question Navigator */}
                    <div className="max-w-4xl mx-auto mt-6 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">{t('testRunner.questionNav', 'Danh sách câu hỏi')}</h3>
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                            {test.sections.map((section, sIdx) =>
                                section.questions.map((q, qIdx) => (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            setCurrentSection(sIdx);
                                            setCurrentQuestion(qIdx);
                                        }}
                                        className={`aspect-square rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center justify-center ${sIdx === currentSection && qIdx === currentQuestion
                                            ? 'bg-primary-600 text-white'
                                            : answers[q.id]
                                                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {q.id}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestRunner;
