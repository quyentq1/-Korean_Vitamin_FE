import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wand2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  BookOpen,
  Headphones,
  PenTool,
  Plus,
  Minus
} from 'lucide-react';
import {
  TOPIK_I_STRUCTURE,
  TOPIK_II_STRUCTURE,
  READING_STRUCTURE,
  LISTENING_STRUCTURE,
  WRITING_STRUCTURE,
  getQuestionStructure
} from '../../constants/topikStructure';

/**
 * ExamStructureBuilder Component
 * Xây dựng cấu trúc đề thi TOPIK và tự động random câu hỏi theo cấu trúc
 *
 * @param {object} props
 * @param {string} props.topikLevel - TOPIK_I hoặc TOPIK_II
 * @param {function} props.onGenerate - Callback khi generate đề thi
 * @param {array} props.questionBank - Danh sách câu hỏi từ Question Bank
 * @param {object} props.courseLevel - Level của khóa học (BEGINNER, INTERMEDIATE, ADVANCED)
 * @param {boolean} props.isClassExam - true nếu tạo đề cho Class (có Writing), false nếu cho Course (không có Writing)
 */
const ExamStructureBuilder = ({
  topikLevel = 'TOPIK_II',
  onGenerate,
  questionBank = [],
  courseLevel = null,
  isClassExam = false // NEW: Default to false (no Writing for Course exams)
}) => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState({
    reading: true,
    listening: true,
    writing: true
  });
  const [selectedSections, setSelectedSections] = useState({
    reading: true,
    listening: true,
    writing: isClassExam // Writing chỉ được chọn khi tạo đề cho Class
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // NEW: Advanced custom mode - allow user to customize each topikType
  const [advancedCustomMode, setAdvancedCustomMode] = useState(false);
  const [topikTypeCounts, setTopikTypeCounts] = useState({});

  // NEW: Update selectedSections when isClassExam prop changes
  React.useEffect(() => {
    setSelectedSections(prev => ({
      ...prev,
      writing: isClassExam
    }));
  }, [isClassExam]);

  // Initialize topikTypeCounts from CURRENT structure's defaults (preserves values when switching Auto→Custom)
  React.useEffect(() => {
    const structure = topikLevel === 'TOPIK_I' ? TOPIK_I_STRUCTURE : TOPIK_II_STRUCTURE;
    const defaultCounts = {};

    // Only initialize types that exist in this exam's structure
    [
      ...(structure.reading || []),
      ...(structure.listening || []),
      ...(structure.writing || [])
    ].forEach(item => {
      defaultCounts[item.type] = item.count; // Pre-fill with structure default
    });

    setTopikTypeCounts(defaultCounts);
  }, [topikLevel]);

  const structure = topikLevel === 'TOPIK_I' ? TOPIK_I_STRUCTURE : TOPIK_II_STRUCTURE;

  // Get TopikTypes ONLY from the current exam structure (not global lists)
  // This ensures Custom mode stays within the bounds of the defined exam structure
  const getTopikTypesByCategory = () => {
    const currentStructure = topikLevel === 'TOPIK_I' ? TOPIK_I_STRUCTURE : TOPIK_II_STRUCTURE;
    return {
      READING: currentStructure.reading || [],
      LISTENING: currentStructure.listening || [],
      WRITING: currentStructure.writing || []
    };
  };

  // Toggle section expand/collapse
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle section selection
  const toggleSectionSelection = (section) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'READING': return <BookOpen className="w-4 h-4" />;
      case 'LISTENING': return <Headphones className="w-4 h-4" />;
      case 'WRITING': return <PenTool className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'READING': return 'from-blue-500 to-blue-700';
      case 'LISTENING': return 'from-purple-500 to-purple-700';
      case 'WRITING': return 'from-green-500 to-green-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  // Check if questions available for a topikType
  const getQuestionCountForTopikType = (topikType) => {
    return questionBank.filter(q =>
      q.topikType === topikType &&
      q.verificationStatus === 'APPROVED'
    ).length;
  };

  // Check availability status for each topikType
  const getTopikTypeAvailability = (topikType, requiredCount) => {
    const available = getQuestionCountForTopikType(topikType);

    if (available >= requiredCount) {
      return {
        status: 'sufficient',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircle2 className="w-4 h-4" />,
        message: `${available}/${requiredCount} ${t('teacher.examStructure.questions')}`
      };
    } else if (available > 0) {
      return {
        status: 'insufficient',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: <AlertCircle className="w-4 h-4" />,
        message: `${available}/${requiredCount} ${t('teacher.examStructure.questionsMissing')}`
      };
    } else {
      return {
        status: 'empty',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <AlertCircle className="w-4 h-4" />,
        message: `0/${requiredCount} ${t('teacher.examStructure.questionsNone')}`
      };
    }
  };

  // Update topikType count
  const updateTopikTypeCount = (topikType, value) => {
    setTopikTypeCounts(prev => ({
      ...prev,
      [topikType]: Math.max(0, parseInt(value) || 0)
    }));
  };

  // Increment/decrement topikType count
  const adjustTopikTypeCount = (topikType, delta) => {
    setTopikTypeCounts(prev => ({
      ...prev,
      [topikType]: Math.max(0, (prev[topikType] || 0) + delta)
    }));
  };

  // Generate exam
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let blueprint = {
        topikLevel,
        sections: []
      };

      if (advancedCustomMode) {
        // ADVANCED CUSTOM MODE: Use topikType-specific counts
        const topikTypesByCategory = getTopikTypesByCategory();

        // Process Reading topikTypes
        if (selectedSections.reading) {
          topikTypesByCategory.READING.forEach(item => {
            const count = topikTypeCounts[item.type] || 0;
            if (count > 0) {
              blueprint.sections.push({
                type: item.type, // Backend ExamBlueprintSectionDTO expects 'type' field
                category: 'READING',
                count: count,
                range: [1, count],
                pointsPerQuestion: item.pointsPerQuestion || 1,
                description: item.description,
                difficultyLevel: 'MIXED'
              });
            }
          });
        }

        // Process Listening topikTypes
        if (selectedSections.listening) {
          topikTypesByCategory.LISTENING.forEach(item => {
            const count = topikTypeCounts[item.type] || 0;
            if (count > 0) {
              blueprint.sections.push({
                type: item.type, // Backend ExamBlueprintSectionDTO expects 'type' field
                category: 'LISTENING',
                count: count,
                range: [1, count],
                pointsPerQuestion: item.pointsPerQuestion || 1,
                description: item.description,
                difficultyLevel: 'MIXED'
              });
            }
          });
        }

        // Process Writing topikTypes
        if (selectedSections.writing) {
          topikTypesByCategory.WRITING.forEach(item => {
            const count = topikTypeCounts[item.type] || 0;
            if (count > 0) {
              blueprint.sections.push({
                type: item.type, // Backend ExamBlueprintSectionDTO expects 'type' field
                category: 'WRITING',
                count: count,
                range: [1, count],
                pointsPerQuestion: item.pointsPerQuestion || 10,
                description: item.description,
                difficultyLevel: 'MIXED'
              });
            }
          });
        }
      } else {
        // AUTO MODE: Follow TOPIK structure exactly
        if (selectedSections.reading && structure.reading) {
          blueprint.sections.push(...structure.reading.map(item => ({
            ...item,
            category: 'READING'
          })));
        }

        if (selectedSections.listening && structure.listening) {
          blueprint.sections.push(...structure.listening.map(item => ({
            ...item,
            category: 'LISTENING'
          })));
        }

        if (selectedSections.writing && structure.writing) {
          blueprint.sections.push(...structure.writing.map(item => ({
            ...item,
            category: 'WRITING'
          })));
        }
      }

      if (onGenerate) {
        await onGenerate(blueprint);
      }
    } catch (error) {
      console.error('Error generating exam:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalQuestions = 0;
    let totalPoints = 0;
    let canGenerate = true;

    if (advancedCustomMode) {
      // ADVANCED CUSTOM MODE: Calculate from topikType counts
      const topikTypesByCategory = getTopikTypesByCategory();

      // Process Reading
      if (selectedSections.reading) {
        topikTypesByCategory.READING.forEach(item => {
          const count = topikTypeCounts[item.type] || 0;
          const available = getQuestionCountForTopikType(item.type);

          if (count > 0) {
            totalQuestions += count;
            totalPoints += count * (item.pointsPerQuestion || 1);
            if (available < count) canGenerate = false;
          }
        });
      }

      // Process Listening
      if (selectedSections.listening) {
        topikTypesByCategory.LISTENING.forEach(item => {
          const count = topikTypeCounts[item.type] || 0;
          const available = getQuestionCountForTopikType(item.type);

          if (count > 0) {
            totalQuestions += count;
            totalPoints += count * (item.pointsPerQuestion || 1);
            if (available < count) canGenerate = false;
          }
        });
      }

      // Process Writing
      if (selectedSections.writing) {
        topikTypesByCategory.WRITING.forEach(item => {
          const count = topikTypeCounts[item.type] || 0;
          const available = getQuestionCountForTopikType(item.type);

          if (count > 0) {
            totalQuestions += count;
            totalPoints += count * (item.pointsPerQuestion || 10);
            if (available < count) canGenerate = false;
          }
        });
      }

      return { totalQuestions, totalPoints, canGenerate };
    }

    // AUTO MODE: Calculate from structure
    const sections = [];

    if (selectedSections.reading && structure.reading) {
      structure.reading.forEach(item => {
        const available = getQuestionCountForTopikType(item.type);
        totalQuestions += item.count;
        totalPoints += item.count * (item.pointsPerQuestion || 1);
        if (available < item.count) canGenerate = false;
        sections.push({ ...item, category: 'READING' });
      });
    }

    if (selectedSections.listening && structure.listening) {
      structure.listening.forEach(item => {
        const available = getQuestionCountForTopikType(item.type);
        totalQuestions += item.count;
        totalPoints += item.count * (item.pointsPerQuestion || 1);
        if (available < item.count) canGenerate = false;
        sections.push({ ...item, category: 'LISTENING' });
      });
    }

    if (selectedSections.writing && structure.writing) {
      structure.writing.forEach(item => {
        const available = getQuestionCountForTopikType(item.type);
        totalQuestions += item.count;
        totalPoints += item.count * (item.pointsPerQuestion || 1);
        if (available < item.count) canGenerate = false;
        sections.push({ ...item, category: 'WRITING' });
      });
    }

    return { totalQuestions, totalPoints, canGenerate, sections };
  };

  const totals = calculateTotals();
  const topikTypesByCategory = getTopikTypesByCategory();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('teacher.examStructure.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {topikLevel === 'TOPIK_I' ? t('teacher.examStructure.topikI') : t('teacher.examStructure.topikII')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      {courseLevel && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Info className="w-4 h-4" />
            <span>
              {t('teacher.examStructure.courseLevel')} <strong>{courseLevel === 'BEGINNER' ? 'TOPIK I' : courseLevel === 'INTERMEDIATE' ? 'TOPIK II' : 'ESP'}</strong>
              - {t('teacher.examStructure.courseLevelDesc')}
            </span>
          </div>
        </div>
      )}

      {/* NEW: Info about Writing section availability */}
      {!isClassExam && (
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <Info className="w-4 h-4" />
            <span>
              <strong>{t('teacher.examStructure.note')}:</strong> {t('teacher.examStructure.writingOnlyForClass')}
            </span>
          </div>
        </div>
      )}

      {/* Section Toggles & Mode Toggle */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">{t('teacher.examStructure.selectSections')}:</span>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSections.reading}
                onChange={() => toggleSectionSelection('reading')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('teacher.examStructure.reading')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSections.listening}
                onChange={() => toggleSectionSelection('listening')}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{t('teacher.examStructure.listening')}</span>
            </label>

            {/* NEW: Only show Writing option for Class exams */}
            {isClassExam && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSections.writing}
                  onChange={() => toggleSectionSelection('writing')}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{t('teacher.examStructure.writing')}</span>
              </label>
            )}
          </div>

          {/* Mode Toggle - Auto vs Advanced Custom */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAdvancedCustomMode(false)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                !advancedCustomMode
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Auto (TOPIK)
            </button>
            <button
              onClick={() => setAdvancedCustomMode(true)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                advancedCustomMode
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Custom (TopikType)
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Custom Mode - TopikType Selection */}
      {advancedCustomMode && (
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="flex items-center gap-2 mb-4 text-amber-800">
            <Info className="w-4 h-4" />
            <span className="text-sm font-semibold">{t('teacher.examStructure.customTopikType')}</span>
          </div>
          <p className="text-xs text-amber-600 mb-4">
            {t('teacher.examStructure.customDesc', { level: topikLevel === 'TOPIK_I' ? 'TOPIK I' : 'TOPIK II' })}
          </p>

          <div className="space-y-4">
            {/* Reading TopikTypes */}
            {selectedSections.reading && (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3 text-blue-700 font-semibold">
                  <BookOpen className="w-4 h-4" />
                  <span>{t('teacher.examStructure.reading')}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {topikTypesByCategory.READING.map(item => {
                    const availability = getTopikTypeAvailability(item.type, topikTypeCounts[item.type] || 0);
                    return (
                      <div key={item.type} className={`p-3 rounded-lg border ${availability.borderColor} ${availability.bgColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">{item.type}</span>
                          <span className="text-xs text-gray-500">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => adjustTopikTypeCount(item.type, -1)}
                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            disabled={!topikTypeCounts[item.type]}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={item.count * 2}
                            value={topikTypeCounts[item.type] || 0}
                            onChange={(e) => updateTopikTypeCount(item.type, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          />
                          <button
                            onClick={() => adjustTopikTypeCount(item.type, 1)}
                            className="w-6 h-6 rounded bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className={`text-xs ${availability.color} flex items-center gap-1`}>
                          {availability.icon}
                          {availability.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Listening TopikTypes */}
            {selectedSections.listening && (
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3 text-purple-700 font-semibold">
                  <Headphones className="w-4 h-4" />
                  <span>{t('teacher.examStructure.listening')}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {topikTypesByCategory.LISTENING.map(item => {
                    const availability = getTopikTypeAvailability(item.type, topikTypeCounts[item.type] || 0);
                    return (
                      <div key={item.type} className={`p-3 rounded-lg border ${availability.borderColor} ${availability.bgColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">{item.type}</span>
                          <span className="text-xs text-gray-500">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => adjustTopikTypeCount(item.type, -1)}
                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            disabled={!topikTypeCounts[item.type]}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={item.count * 2}
                            value={topikTypeCounts[item.type] || 0}
                            onChange={(e) => updateTopikTypeCount(item.type, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          />
                          <button
                            onClick={() => adjustTopikTypeCount(item.type, 1)}
                            className="w-6 h-6 rounded bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className={`text-xs ${availability.color} flex items-center gap-1`}>
                          {availability.icon}
                          {availability.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Writing TopikTypes */}
            {isClassExam && selectedSections.writing && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3 text-green-700 font-semibold">
                  <PenTool className="w-4 h-4" />
                  <span>{t('teacher.examStructure.writing')}</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {topikTypesByCategory.WRITING.map(item => {
                    const availability = getTopikTypeAvailability(item.type, topikTypeCounts[item.type] || 0);
                    return (
                      <div key={item.type} className={`p-3 rounded-lg border ${availability.borderColor} ${availability.bgColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">{item.type}</span>
                          <span className="text-xs text-gray-500">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => adjustTopikTypeCount(item.type, -1)}
                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            disabled={!topikTypeCounts[item.type]}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={item.count * 2}
                            value={topikTypeCounts[item.type] || 0}
                            onChange={(e) => updateTopikTypeCount(item.type, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          />
                          <button
                            onClick={() => adjustTopikTypeCount(item.type, 1)}
                            className="w-6 h-6 rounded bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className={`text-xs ${availability.color} flex items-center gap-1`}>
                          {availability.icon}
                          {availability.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <p className="mt-3 text-xs text-amber-700">
            {t('teacher.examStructure.customWarning')}
          </p>
        </div>
      )}

      {/* Auto Mode - Structure Preview */}
      {!advancedCustomMode && (
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {/* Reading Section */}
          {structure.reading && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('reading')}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-between hover:from-blue-100 hover:to-blue-150 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">{t('teacher.examStructure.sectionReading')}</span>
                  <span className="text-sm text-gray-600">
                    {structure.reading.reduce((sum, item) => sum + item.count, 0)} {t('teacher.examStructure.questions')}
                  </span>
                </div>
                {expandedSections.reading ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {expandedSections.reading && (
                <div className="p-4 space-y-2 bg-white">
                  {structure.reading.map((item, index) => {
                    const availability = getTopikTypeAvailability(item.type, item.count);
                    return (
                      <div
                        key={`R-${index}`}
                        className={`flex items-center justify-between p-3 rounded-lg border ${availability.bgColor} ${availability.borderColor}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{item.type}</span>
                            <span className="text-xs text-gray-500">{t('teacher.examStructure.questionRange', { from: item.range[0], to: item.range[1] })}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${availability.bgColor} ${availability.color}`}>
                              {availability.message}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">{item.count} {t('teacher.examStructure.questions')}</div>
                          <div className="text-xs text-gray-500">{item.pointsPerQuestion} {t('teacher.examStructure.pointsPerQuestion')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Listening Section */}
          {structure.listening && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('listening')}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 flex items-center justify-between hover:from-purple-100 hover:to-purple-150 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">{t('teacher.examStructure.sectionListening')}</span>
                  <span className="text-sm text-gray-600">
                    {structure.listening.reduce((sum, item) => sum + item.count, 0)} {t('teacher.examStructure.questions')}
                  </span>
                </div>
                {expandedSections.listening ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {expandedSections.listening && (
                <div className="p-4 space-y-2 bg-white">
                  {structure.listening.map((item, index) => {
                    const availability = getTopikTypeAvailability(item.type, item.count);
                    return (
                      <div
                        key={`L-${index}`}
                        className={`flex items-center justify-between p-3 rounded-lg border ${availability.bgColor} ${availability.borderColor}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{item.type}</span>
                            <span className="text-xs text-gray-500">{t('teacher.examStructure.questionRange', { from: item.range[0], to: item.range[1] })}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${availability.bgColor} ${availability.color}`}>
                              {availability.message}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">{item.count} {t('teacher.examStructure.questions')}</div>
                          <div className="text-xs text-gray-500">{item.pointsPerQuestion} {t('teacher.examStructure.pointsPerQuestion')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Writing Section */}
          {isClassExam && structure.writing && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('writing')}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 flex items-center justify-between hover:from-green-100 hover:to-green-150 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">{t('teacher.examStructure.sectionWriting')}</span>
                  <span className="text-sm text-gray-600">
                    {structure.writing.reduce((sum, item) => sum + item.count, 0)} {t('teacher.examStructure.questions')}
                  </span>
                </div>
                {expandedSections.writing ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {expandedSections.writing && (
                <div className="p-4 space-y-2 bg-white">
                  {structure.writing.map((item, index) => {
                    const availability = getTopikTypeAvailability(item.type, item.count);
                    return (
                      <div
                        key={`W-${index}`}
                        className={`flex items-center justify-between p-3 rounded-lg border ${availability.bgColor} ${availability.borderColor}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{item.type}</span>
                            <span className="text-xs text-gray-500">{t('teacher.examStructure.questionRange', { from: item.range[0], to: item.range[1] })}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${availability.bgColor} ${availability.color}`}>
                              {availability.message}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">{item.count} {t('teacher.examStructure.questions')}</div>
                          <div className="text-xs text-gray-500">{item.pointsPerQuestion} {t('teacher.examStructure.pointsPerQuestion')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <span className="text-gray-600">{t('teacher.examStructure.totalQuestions')}: </span>
              <span className="font-bold text-gray-900">{totals.totalQuestions}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">{t('teacher.examStructure.totalPoints')}: </span>
              <span className="font-bold text-gray-900">{totals.totalPoints}</span>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!totals.canGenerate || totals.totalQuestions === 0 || isGenerating}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
              !totals.canGenerate || totals.totalQuestions === 0 || isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                {t('teacher.examStructure.generating')}
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                {t('teacher.examStructure.generateExam')}
              </>
            )}
          </button>
        </div>

        {!totals.canGenerate && totals.totalQuestions > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span>{t('teacher.examStructure.notEnoughQuestions')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamStructureBuilder;
