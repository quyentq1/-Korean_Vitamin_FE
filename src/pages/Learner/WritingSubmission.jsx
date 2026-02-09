import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  RefreshCw,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import studentService from '../../services/studentService';
import { 
  PageContainer, 
  PageHeader, 
  Card, 
  Button, 
  Alert, 
  Loading, 
  Badge
} from '../../components/ui';

/**
 * WritingSubmission Component
 * 
 * Enhanced writing submission page with:
 * - Rich text editor with formatting toolbar
 * - AI feedback display
 * - Submission history
 * - Modern UI components
 * 
 * @component
 */
const WritingSubmission = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('submit'); // 'submit', 'history'
  const [writingText, setWritingText] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Mock submission data - will be replaced with API call
  const mockSubmissions = [
    { 
      id: 1, 
      title: 'Essay: My Hometown', 
      date: '2024-12-15', 
      status: 'graded', 
      score: 85, 
      feedback: 'Excellent structure! Your essay has a clear introduction, body, and conclusion. Good use of vocabulary and grammar.',
      aiFeedback: {
        score: 88,
        strengths: ['Clear structure', 'Good vocabulary', 'Proper grammar'],
        improvements: ['Add more examples', 'Expand conclusion', 'Use more transition words'],
        suggestions: ['Consider adding personal anecdotes', 'Try to vary sentence structure']
      }
    },
    { 
      id: 2, 
      title: 'Letter Writing', 
      date: '2024-12-10', 
      status: 'pending', 
      score: null, 
      feedback: null,
      aiFeedback: null
    },
    { 
      id: 3, 
      title: 'Short Paragraph', 
      date: '2024-12-05', 
      status: 'graded', 
      score: 78, 
      feedback: 'Good vocabulary, work on grammar. Try to use more complex sentence structures.',
      aiFeedback: {
        score: 75,
        strengths: ['Good vocabulary', 'Clear message'],
        improvements: ['Grammar issues', 'Sentence variety'],
        suggestions: ['Study more grammar rules', 'Practice writing longer texts']
      }
    },
    { 
      id: 4, 
      title: 'Descriptive Essay', 
      date: '2024-12-01', 
      status: 'graded', 
      score: 92, 
      feedback: 'Excellent descriptive writing! Very detailed and engaging.',
      aiFeedback: {
        score: 90,
        strengths: ['Detailed descriptions', 'Excellent vocabulary', 'Perfect grammar'],
        improvements: ['None'],
        suggestions: ['Keep up the great work']
      }
    },
  ];

  // Fetch submissions from API
  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      // TODO: Replace with actual API call
      // const data = await studentService.getWritingSubmissions();
      // setSubmissions(data || []);
      
      // Using mock data for now
      setSubmissions(mockSubmissions);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(t('writing.error.fetchFailed', 'Không thể tải danh sách bài nộp. Vui lòng thử lại sau.'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle file drop
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!title.trim() || !writingText.trim()) {
      setError(t('writing.error.emptyFields', 'Vui lòng nhập tiêu đề và nội dung bài viết.'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // await studentService.submitWriting({ title, content: writingText, file: selectedFile });
      
      // Simulate AI analysis
      setAiAnalyzing(true);
      
      // Simulate AI feedback after 2 seconds
      setTimeout(() => {
        setAiAnalyzing(false);
        setAiFeedback({
          score: 85,
          strengths: ['Clear structure', 'Good vocabulary'],
          improvements: ['Add more examples', 'Expand conclusion'],
          suggestions: ['Consider adding personal anecdotes']
        });
        setIsSubmitting(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting writing:', err);
      setError(t('writing.error.submitFailed', 'Không thể nộp bài viết. Vui lòng thử lại sau.'));
      setIsSubmitting(false);
    }
  };

  // Handle AI analysis
  const handleAiAnalysis = () => {
    if (!writingText.trim()) {
      setError(t('writing.error.emptyContent', 'Vui lòng nhập nội dung bài viết để phân tích.'));
      return;
    }

    setAiAnalyzing(true);
    setError('');

    // Simulate AI analysis
    setTimeout(() => {
      setAiFeedback({
        score: 82,
        strengths: ['Good introduction', 'Clear topic'],
        improvements: ['Need more examples', 'Conclusion needs work'],
        suggestions: ['Add more transitions', 'Use more descriptive language']
      });
      setAiAnalyzing(false);
    }, 1500);
  };

  // Handle view submission detail
  const handleViewDetail = (submissionId) => {
    const submission = submissions.find(s => s.id === submissionId);
    setSelectedSubmission(submission);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchSubmissions();
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedSubmission(null);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'graded':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'info';
    }
  };

  // Character count
  const characterCount = writingText.length;
  const wordCount = writingText.trim().split(/\s+/).filter(w => w).length;

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading.Spinner size="xl" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('writing.title', 'Nộp Bài Viết')}
        subtitle={t('writing.subtitle', 'Gửi bài viết và nhận feedback từ giáo viên')}
        actions={[
          {
            label: t('common.refresh', 'Làm mới'),
            icon: RefreshCw,
            onClick: handleRefresh,
            variant: 'ghost',
          },
        ]}
      />

      {/* Error Alert */}
      {error && (
        <Alert type="error" dismissible onDismiss={() => setError('')} className="mb-6">
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={activeTab === 'submit' ? 'primary' : 'ghost'}
          size="lg"
          icon={<FileText className="w-5 h-5" />}
          onClick={() => handleTabChange('submit')}
        >
          {t('writing.newSubmission', 'Nộp Bài Mới')}
        </Button>
        <Button
          variant={activeTab === 'history' ? 'primary' : 'ghost'}
          size="lg"
          icon={<Clock className="w-5 h-5" />}
          onClick={() => handleTabChange('history')}
        >
          {t('writing.history', 'Bài Đã Nộp')}
        </Button>
      </div>

      {/* Submit Tab */}
      {activeTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Editor */}
          <div className="lg:col-span-2">
            <Card>
              {/* Card Header */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t('writing.submitTitle', 'Nộp Bài Viết Mới')}
                </h2>
                <p className="text-sm text-gray-600">
                  {t('writing.submitDescription', 'Nhập tiêu đề và nội dung bài viết của bạn. Bạn có thể đính kèm file nếu cần thiết.')}
                </p>
              </div>

              {/* Title Input */}
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-2 text-sm">
                  {t('writing.assignmentTitle', 'Tiêu đề bài viết')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all"
                  placeholder={t('writing.titlePlaceholder', 'Nhập tiêu đề...')}
                />
              </div>

              {/* Rich Text Editor */}
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-2 text-sm">
                  {t('writing.content', 'Nội dung')}
                </label>
                
                {/* Formatting Toolbar */}
                <div className="mb-2 flex flex-wrap gap-1 p-2 bg-gray-50 rounded-t-xl border-2 border-b-0 border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('writing-textarea');
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      textarea.value = text.substring(0, start) + '**' + text.substring(start, end) + '**';
                      textarea.focus();
                      textarea.setSelectionRange(start + 2, end + 2);
                    }}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('writing-textarea');
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      textarea.value = text.substring(0, start) + '*' + text.substring(start, end) + '*';
                      textarea.focus();
                      textarea.setSelectionRange(start + 1, end + 1);
                    }}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('writing-textarea');
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      textarea.value = text.substring(0, start) + '<u>' + text.substring(start, end) + '</u>';
                      textarea.focus();
                      textarea.setSelectionRange(start + 3, end + 3);
                    }}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  id="writing-textarea"
                  value={writingText}
                  onChange={(e) => setWritingText(e.target.value)}
                  className="w-full min-h-[300px] px-4 py-3 border-2 border-gray-200 rounded-b-xl focus:border-primary-500 focus:outline-none resize-none transition-all text-sm"
                  placeholder={t('writing.contentPlaceholder', 'Nhập nội dung bài viết...')}
                />

                {/* Character/Word Count */}
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-4 py-2 bg-gray-50">
                  <span>{characterCount} {t('writing.characters', 'ký tự')}</span>
                  <span>{wordCount} {t('writing.words', 'từ')}</span>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-2 text-sm">
                  {t('writing.attachFile', 'Đính kèm file (không bắt buộc)')}
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition cursor-pointer"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-primary-500', 'bg-primary-50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-primary-500', 'bg-primary-50');
                  }}
                  onDrop={handleFileDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="text-4xl mb-2">
                    {selectedFile ? (
                      <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                    ) : (
                      <AlertCircle className="w-16 h-16 mx-auto text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {t('writing.dragDrop', 'Kéo thả file hoặc click để chọn')}
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-gray-500">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              </div>

              {/* AI Analysis Button */}
              <div className="mb-4">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<RefreshCw className="w-5 h-5" />}
                  onClick={handleAiAnalysis}
                  disabled={aiAnalyzing}
                  className="w-full"
                >
                  {aiAnalyzing ? t('writing.analyzing', 'Đang phân tích...') : t('writing.analyzeWithAI', 'Phân tích với AI')}
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                size="lg"
                icon={<Send className="w-5 h-5" />}
                onClick={handleSubmit}
                disabled={isSubmitting || aiAnalyzing}
                className="w-full"
              >
                {isSubmitting ? t('writing.submitting', 'Đang nộp...') : t('writing.submit', 'Nộp Bài')}
              </Button>
            </Card>
          </div>

          {/* Right Column - AI Feedback */}
          <div className="lg:col-span-1">
            <Card>
              {/* Card Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {t('writing.aiFeedback', 'Phản Hồi AI')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('writing.aiFeedbackDescription', 'Nhận phản hồi tức thời từ AI để cải thiện bài viết của bạn')}
                </p>
              </div>

              {aiAnalyzing ? (
                <div className="text-center py-8">
                  <Loading.Spinner size="lg" />
                  <p className="text-sm text-gray-600 mt-4">
                    {t('writing.analyzing', 'Đang phân tích...')}
                  </p>
                </div>
              ) : aiFeedback ? (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="text-center py-4">
                    <div className="text-5xl font-bold text-primary-600 mb-2">
                      {aiFeedback.score}
                    </div>
                    <p className="text-sm text-gray-600">
                      {t('writing.overallScore', 'Điểm tổng quan')}
                    </p>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      {t('writing.strengths', 'Điểm mạnh')}
                    </h4>
                    <ul className="space-y-2">
                      {aiFeedback.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      {t('writing.improvements', 'Cần cải thiện')}
                    </h4>
                    <ul className="space-y-2">
                      {aiFeedback.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-yellow-500 mt-0.5">!</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-blue-500" />
                      {t('writing.suggestions', 'Gợi ý')}
                    </h4>
                    <ul className="space-y-2">
                      {aiFeedback.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-blue-500 mt-0.5">→</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-600">
                    {t('writing.noFeedback', 'Chưa có phản hồi AI')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('writing.noFeedbackDescription', 'Nhập nội dung bài viết và nhấn "Phân tích với AI" để nhận phản hồi')}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Submission Count */}
          <div className="mb-4 text-gray-600">
            {t('writing.submissionCount', 'Có {{count}} bài nộp', { count: submissions.length })}
          </div>

          {/* Submission Cards */}
          {submissions.map((submission) => (
            <Card
              key={submission.id}
              className="hover:shadow-lg transition cursor-pointer"
              onClick={() => handleViewDetail(submission.id)}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">
                      {submission.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(submission.date).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(submission.status)}>
                    {t(`writing.status.${submission.status}`, submission.status)}
                  </Badge>
                </div>

                {/* Score */}
                {submission.status === 'graded' && (
                  <div className="mb-3">
                    <div className="text-3xl font-bold text-primary-600">
                      {submission.score}%
                    </div>
                    <p className="text-sm text-gray-600">
                      {t('writing.score', 'Điểm')}
                    </p>
                  </div>
                )}

                {/* Feedback Preview */}
                {submission.feedback && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div className="font-semibold text-gray-900 text-sm">
                        {t('writing.teacherFeedback', 'Nhận xét của giáo viên')}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement download functionality
                    }}
                  >
                    {t('writing.download', 'Tải xuống')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(submission.id);
                    }}
                  >
                    {t('common.viewDetail', 'Xem chi tiết')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Empty State */}
          {submissions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {t('writing.noSubmissions', 'Chưa có bài nộp nào')}
              </p>
              <p className="text-sm text-gray-500">
                {t('writing.noSubmissionsDescription', 'Bạn chưa nộp bài viết nào. Hãy nộp bài đầu tiên của bạn!')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {t('writing.submissionDetail', 'Chi tiết bài nộp')}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<X className="w-5 h-5" />}
                  onClick={() => setSelectedSubmission(null)}
                >
                  {t('common.close', 'Đóng')}
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Title & Date */}
              <div>
                <h4 className="font-semibold text-gray-900 text-lg mb-2">
                  {selectedSubmission.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {new Date(selectedSubmission.date).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Score & Status */}
              <div className="flex items-center gap-6">
                {selectedSubmission.status === 'graded' && (
                  <div>
                    <div className="text-4xl font-bold text-primary-600">
                      {selectedSubmission.score}%
                    </div>
                    <p className="text-sm text-gray-600">
                      {t('writing.score', 'Điểm')}
                    </p>
                  </div>
                )}
                <Badge variant={getStatusBadgeVariant(selectedSubmission.status)}>
                  {t(`writing.status.${selectedSubmission.status}`, selectedSubmission.status)}
                </Badge>
              </div>

              {/* Teacher Feedback */}
              {selectedSubmission.feedback && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-2 mb-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {t('writing.teacherFeedback', 'Nhận xét của giáo viên')}
                    </h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedSubmission.feedback}
                  </p>
                </div>
              )}

              {/* AI Feedback */}
              {selectedSubmission.aiFeedback && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-start gap-2 mb-3">
                    <RefreshCw className="w-6 h-6 text-purple-500" />
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {t('writing.aiFeedback', 'Phản hồi AI')}
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {/* Score */}
                    <div className="text-center py-2">
                      <div className="text-3xl font-bold text-purple-600">
                        {selectedSubmission.aiFeedback.score}
                      </div>
                      <p className="text-sm text-gray-600">
                        {t('writing.overallScore', 'Điểm tổng quan')}
                      </p>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        {t('writing.strengths', 'Điểm mạnh')}
                      </h5>
                      <ul className="space-y-2">
                        {selectedSubmission.aiFeedback.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-green-500">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        {t('writing.improvements', 'Cần cải thiện')}
                      </h5>
                      <ul className="space-y-2">
                        {selectedSubmission.aiFeedback.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-yellow-500">!</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Suggestions */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-blue-500" />
                        {t('writing.suggestions', 'Gợi ý')}
                      </h5>
                      <ul className="space-y-2">
                        {selectedSubmission.aiFeedback.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-blue-500">→</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="primary"
                  icon={<Download className="w-5 h-5" />}
                  onClick={() => {
                    // TODO: Implement download functionality
                  }}
                >
                  {t('writing.download', 'Tải xuống')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedSubmission(null)}
                >
                  {t('common.close', 'Đóng')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </PageContainer>
  );
};

export default WritingSubmission;
