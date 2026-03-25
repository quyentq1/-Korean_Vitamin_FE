import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Button,
  Input
} from '../ui';
import {
  Search,
  RefreshCw,
  CheckSquare,
  Square,
  X,
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

/**
 * QuestionReplacerModal Component
 * Modal để đổi câu hỏi trong đề thi
 *
 * Features:
 * - Đổi câu hỏi lẻ (1 câu)
 * - Đổi nhiều câu hỏi cùng lúc
 * - Đổi bằng mã câu hỏi
 * - Random câu hỏi mới từ Question Bank
 */
const QuestionReplacerModal = ({
  isOpen,
  onClose,
  onReplace,
  currentQuestions = [], // Danh sách câu hỏi hiện tại trong đề
  questionBank = [], // Danh sách câu hỏi từ Question Bank
  selectedIndices = [], // Indices của câu hỏi cần đổi
  examCategory = 'PRACTICE',
  courseLevel = null
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState('select'); // 'select' | 'byCode' | 'byRandom' | 'confirm'
  const [selectedForReplacement, setSelectedForReplacement] = useState([]);
  const [questionCode, setQuestionCode] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [replacementMap, setReplacementMap] = useState({}); // { oldQuestionId: newQuestion }
  const [selectedNewQuestions, setSelectedNewQuestions] = useState([]);

  useEffect(() => {
    if (isOpen && selectedIndices.length > 0) {
      setSelectedForReplacement(selectedIndices);
      setStep('select');
    }
  }, [isOpen, selectedIndices]);

  // Get question structure for a position
  const getQuestionRequirement = (index) => {
    const question = currentQuestions[index];
    if (!question) return null;

    return {
      category: question.category,
      topikType: question.topikType,
      difficulty: question.difficulty,
      questionNumber: index + 1
    };
  };

  // Search question by code
  const handleSearchByCode = async () => {
    if (!questionCode.trim()) return;

    setIsSearching(true);
    try {
      const result = questionBank.find(q =>
        q.code === questionCode.trim() ||
        q.id === questionCode.trim()
      );

      if (result) {
        setSearchResults([result]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching question:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Get available questions from bank (excluding current)
  const getAvailableQuestions = (currentIndex) => {
    const currentQuestion = currentQuestions[currentIndex];
    if (!currentQuestion) return [];

    return questionBank.filter(q => {
      // Exclude current question and questions already in exam
      const isCurrentQuestion = q.id === currentQuestion.id;
      const isInExam = currentQuestions.some(cq => cq.id === q.id);

      // Filter by category and type
      const matchesCategory = !currentQuestion.category || q.category === currentQuestion.category;
      const matchesType = !currentQuestion.topikType || q.topikType === currentQuestion.topikType;
      const isApproved = q.verificationStatus === 'APPROVED';

      return !isCurrentQuestion && !isInExam && matchesCategory && matchesType && isApproved;
    });
  };

  // Random select new question
  const handleRandomSelect = (currentIndex) => {
    const available = getAvailableQuestions(currentIndex);
    if (available.length === 0) return null;

    // Filter by course level if provided
    let filtered = available;
    if (courseLevel) {
      filtered = available.filter(q => q.difficulty === courseLevel);
    }

    // If no questions match level, use all available
    const pool = filtered.length > 0 ? filtered : available;

    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  };

  // Replace with random question
  const handleReplaceWithRandom = () => {
    const newMap = { ...replacementMap };

    selectedForReplacement.forEach(index => {
      const newQuestion = handleRandomSelect(index);
      if (newQuestion) {
        const oldQuestion = currentQuestions[index];
        newMap[oldQuestion.id] = {
          old: oldQuestion,
          new: newQuestion,
          index: index
        };
      }
    });

    setReplacementMap(newMap);
    setStep('confirm');
  };

  // Replace with specific question (by code or selection)
  const handleReplaceWithSelected = () => {
    if (selectedNewQuestions.length !== selectedForReplacement.length) {
      alert('Vui lòng chọn câu hỏi mới cho tất cả các câu cần đổi');
      return;
    }

    const newMap = { ...replacementMap };

    selectedForReplacement.forEach((index, i) => {
      const oldQuestion = currentQuestions[index];
      const newQuestion = selectedNewQuestions[i];
      newMap[oldQuestion.id] = {
        old: oldQuestion,
        new: newQuestion,
        index: index
      };
    });

    setReplacementMap(newMap);
    setStep('confirm');
  };

  // Confirm replacement
  const handleConfirmReplacement = () => {
    if (onReplace) {
      const replacements = Object.values(replacementMap);
      onReplace(replacements);
    }
    handleClose();
  };

  // Close modal
  const handleClose = () => {
    setStep('select');
    setSelectedForReplacement([]);
    setQuestionCode('');
    setSearchResults([]);
    setReplacementMap({});
    setSelectedNewQuestions([]);
    onClose();
  };

  // Toggle question selection
  const toggleQuestionSelection = (index) => {
    setSelectedForReplacement(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('exam.replaceQuestion', 'Đổi Câu Hỏi')}
      size="2xl"
    >
      <div className="space-y-6">
        {/* Step 1: Select Questions to Replace */}
        {step === 'select' && (
          <>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Chọn câu hỏi cần đổi
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedIndices.map(index => {
                  const question = currentQuestions[index];
                  if (!question) return null;

                  const isSelected = selectedForReplacement.includes(index);
                  const available = getAvailableQuestions(index).length;

                  return (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleQuestionSelection(index)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-0.5">
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                Câu {index + 1}
                              </span>
                              {question.topikType && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                  {question.topikType}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {question.content}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs">
                              {available > 0 ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {available} câu có thể thay thế
                                </span>
                              ) : (
                                <span className="text-red-600 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Không có câu thay thế
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Replacement Options */}
            {selectedForReplacement.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Chọn cách đổi câu hỏi ({selectedForReplacement.length} câu)
                </h4>

                <div className="space-y-3">
                  <button
                    onClick={() => setStep('byRandom')}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Random tự động</div>
                        <div className="text-sm text-gray-600">
                          Hệ thống tự động chọn câu hỏi ngẫu nhiên phù hợp
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setStep('byCode')}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Search className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Nhập mã câu hỏi</div>
                        <div className="text-sm text-gray-600">
                          Tìm câu hỏi theo mã câu hỏi cụ thể
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 2: Replace by Random */}
        {step === 'byRandom' && (
          <>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Xác nhận đổi câu hỏi ngẫu nhiên
              </h3>
              <p className="text-gray-600 mb-4">
                Hệ thống sẽ tự động chọn {selectedForReplacement.length} câu hỏi ngẫu nhiên
                từ ngân hàng câu hỏi phù hợp với từng loại câu hỏi.
              </p>

              <div className="space-y-2">
                {selectedForReplacement.map(index => {
                  const question = currentQuestions[index];
                  const available = getAvailableQuestions(index).length;

                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Câu {index + 1}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {question.topikType || question.category}
                          </span>
                        </div>
                        <span className={`text-sm ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {available} câu có thể thay thế
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep('select')}
              >
                Quay lại
              </Button>
              <Button
                variant="primary"
                onClick={handleReplaceWithRandom}
                disabled={selectedForReplacement.some(i => getAvailableQuestions(i).length === 0)}
              >
                Xác nhận Random
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Replace by Code */}
        {step === 'byCode' && (
          <>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Tìm câu hỏi theo mã
              </h3>

              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nhập mã câu hỏi (VD: Q12345 hoặc R1-001)"
                  value={questionCode}
                  onChange={(e) => setQuestionCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchByCode()}
                />
                <Button
                  variant="primary"
                  onClick={handleSearchByCode}
                  disabled={isSearching || !questionCode.trim()}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map(question => (
                    <div
                      key={question.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer"
                      onClick={() => {
                        setSelectedNewQuestions([question]);
                        handleReplaceWithSelected();
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{question.code}</span>
                        {question.topikType && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {question.topikType}
                          </span>
                        )}
                        {question.verificationStatus === 'APPROVED' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Đã duyệt
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{question.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && questionCode.trim() && !isSearching && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Không tìm thấy câu hỏi với mã: {questionCode}</p>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={() => setStep('select')}
            >
              Quay lại
            </Button>
          </>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && (
          <>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Xác nhận thay đổi
              </h3>

              <div className="space-y-3">
                {Object.values(replacementMap).map(({ old, new: newQ, index }) => (
                  <div key={old.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">Câu {index + 1}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-green-600">Đã đổi</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-xs text-red-700 font-medium mb-1">Câu cũ</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{old.content}</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-xs text-green-700 font-medium mb-1">Câu mới</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{newQ.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep('select')}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmReplacement}
              >
                Xác nhận thay đổi
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default QuestionReplacerModal;
