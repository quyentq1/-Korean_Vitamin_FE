import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, Plus, FileText, Clock, Users, Edit, Eye, Trash2,
  CheckCircle, XCircle, AlertCircle, Filter
} from 'lucide-react';
import examService from '../../services/examService';
import classService from '../../services/classService';
import Swal from 'sweetalert2';

/**
 * ClassExamManagement - Teacher creates exams for specific classes
 * Only shows classes where the teacher is assigned
 */
const ClassExamManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { classId } = useParams();

  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch classes where teacher is assigned
  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  // Fetch exams when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchClassExams(selectedClass.id);
    }
  }, [selectedClass]);

  const fetchTeacherClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getTeacherClasses();
      setClasses(Array.isArray(data) ? data : []);

      // Auto-select if classId in URL
      if (classId) {
        const targetClass = (Array.isArray(data) ? data : []).find(c => c.id == classId);
        if (targetClass) {
          setSelectedClass(targetClass);
        }
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Không thể tải danh sách lớp học.');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassExams = async (classId) => {
    try {
      const data = await classService.getClassExams(classId);
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
      setExams([]);
    }
  };

  const handleCreateExam = () => {
    if (!selectedClass) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn lớp',
        text: 'Vui lòng chọn lớp học trước khi tạo bài kiểm tra.',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }
    navigate(`/teacher/exam-management/create?classId=${selectedClass.id}`);
  };

  const handleEditExam = (examId) => {
    navigate(`/teacher/exam-editor/${examId}`);
  };

  const handleViewExam = (examId) => {
    navigate(`/teacher/exam-detail/${examId}`);
  };

  const handleDeleteExam = async (exam) => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Xóa bài kiểm tra?',
      text: `Bạn có chắc chắn muốn xóa "${exam.title}"? Hành động này không thể hoàn tác.`,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await examService.deleteExam(exam.id);
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: 'Bài kiểm tra đã được xóa thành công.',
          timer: 2000,
          showConfirmButton: false
        });
        fetchClassExams(selectedClass.id);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể xóa bài kiểm tra.',
          confirmButtonColor: '#7c3aed'
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'APPROVED': { label: '✅ Đã duyệt', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'PENDING': { label: '⏳ Chờ duyệt', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      'REJECTED': { label: '❌ Đã từ chối', color: 'bg-red-100 text-red-700', icon: XCircle },
    };
    return config[status] || config.PENDING;
  };

  const getExamTypeBadge = (type) => {
    const config = {
      'PRACTICE': { label: 'Luyện tập', color: 'bg-blue-100 text-blue-700' },
      'MOCK': { label: 'Mock Test', color: 'bg-purple-100 text-purple-700' },
      'CERTIFICATE': { label: 'Chứng chỉ', color: 'bg-orange-100 text-orange-700' },
    };
    return config[type] || config.PRACTICE;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản Lý Bài Kiểm Tra Theo Lớp</h1>
            <p className="text-gray-600 mt-1">
              Tạo và quản lý bài kiểm tra cho từng lớp học
            </p>
          </div>
          <button
            onClick={handleCreateExam}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Tạo Bài Kiểm Tra
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Class Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn Lớp Học</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedClass?.id === cls.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedClass?.id === cls.id ? 'bg-indigo-600' : 'bg-gray-200'
                }`}>
                  <BookOpen className={`w-5 h-5 ${selectedClass?.id === cls.id ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">{cls.className}</p>
                  <p className="text-sm text-gray-600">{cls.classCode}</p>
                  <p className="text-xs text-gray-500 mt-1">{cls.course?.name}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Exams List */}
      {selectedClass ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Bài Kiểm Tra - {selectedClass.className}
              </h2>
              <p className="text-sm text-gray-600">
                {exams.length} bài kiểm tra
              </p>
            </div>
          </div>

          {exams.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có bài kiểm tra nào</p>
              <p className="text-gray-400 text-sm mt-2">
                Tạo bài kiểm tra đầu tiên cho lớp học này
              </p>
              <button
                onClick={handleCreateExam}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Tạo Bài Kiểm Tra
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => {
                const statusBadge = getStatusBadge(exam.approvalStatus);
                const typeBadge = getExamTypeBadge(exam.examType);

                return (
                  <div
                    key={exam.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${typeBadge.color}`}>
                            {typeBadge.label}
                          </span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                          {!exam.published && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                              📝 Nháp
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {exam.title}
                        </h3>
                        {exam.description && (
                          <p className="text-gray-600 text-sm mb-3">{exam.description}</p>
                        )}

                        {/* Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{exam.durationMinutes} phút</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{exam.examQuestions?.length || 0} câu hỏi</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>Đạt: {exam.passingScore}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewExam(exam.id)}
                          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditExam(exam.id)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Chọn một lớp học để xem bài kiểm tra</p>
        </div>
      )}
    </div>
  );
};

export default ClassExamManagement;
