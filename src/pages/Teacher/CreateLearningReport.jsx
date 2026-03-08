import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Save,
  X,
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  Star,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import teacherService from '../../services/teacherService';
import Swal from 'sweetalert2';

/**
 * CreateLearningReport Modal
 * Teachers create learning reports for students
 */
const CreateLearningReport = ({ isOpen, onClose, onSuccess, classId }) => {
  const { t } = useTranslation();

  // Form states
  const [formData, setFormData] = useState({
    classId: classId || '',
    studentId: '',
    reportDate: new Date().toISOString().split('T')[0],
    attendanceRate: '',
    progress: '',
    strengths: '',
    weaknesses: '',
    recommendations: ''
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [step, setStep] = useState(1); // Multi-step form: 1 = Select student, 2 = Fill report

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
      if (formData.classId) {
        fetchStudents(formData.classId);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.classId) {
      fetchStudents(formData.classId);
    }
  }, [formData.classId]);

  const fetchClasses = async () => {
    try {
      const response = await teacherService.getTeacherClasses();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await teacherService.getClassStudents(classId);
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.studentId) {
      Swal.fire({
        icon: 'warning',
        title: t('teacher.reports.warning'),
        text: t('teacher.reports.selectStudentRequired')
      });
      return;
    }

    if (!formData.progress || formData.progress.trim().length < 10) {
      Swal.fire({
        icon: 'warning',
        title: t('teacher.reports.warning'),
        text: t('teacher.reports.progressRequired')
      });
      return;
    }

    try {
      setLoading(true);

      const request = {
        classId: Number(formData.classId),
        studentId: Number(formData.studentId),
        reportDate: formData.reportDate,
        attendanceRate: formData.attendanceRate ? parseFloat(formData.attendanceRate) : null,
        progress: formData.progress,
        strengths: formData.strengths || null,
        weaknesses: formData.weaknesses || null,
        recommendations: formData.recommendations || null
      };

      await teacherService.createLearningReport(request);

      Swal.fire({
        icon: 'success',
        title: t('teacher.reports.success'),
        text: t('teacher.reports.reportCreated')
      });

      // Reset form
      setFormData({
        classId: classId || '',
        studentId: '',
        reportDate: new Date().toISOString().split('T')[0],
        attendanceRate: '',
        progress: '',
        strengths: '',
        weaknesses: '',
        recommendations: ''
      });
      setStep(1);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Error creating report:', error);
      Swal.fire({
        icon: 'error',
        title: t('teacher.reports.error.createFailed'),
        text: error.response?.data?.message || 'Failed to create report'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classes.find(c => c.id === Number(formData.classId));
  const selectedStudent = students.find(s => s.id === Number(formData.studentId));

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setStep(1);
        setFormData({
          classId: classId || '',
          studentId: '',
          reportDate: new Date().toISOString().split('T')[0],
          attendanceRate: '',
          progress: '',
          strengths: '',
          weaknesses: '',
          recommendations: ''
        });
      }}
      title={
        <div className="flex items-center">
          <FileText className="w-6 h-6 mr-2 text-purple-600" />
          {t('teacher.reports.createReport')}
        </div>
      }
      size="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center px-4 py-2 rounded-lg ${step === 1 ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Users className="w-4 h-4 mr-2" />
              {t('teacher.reports.step1')}
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center px-4 py-2 rounded-lg ${step === 2 ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <FileText className="w-4 h-4 mr-2" />
              {t('teacher.reports.step2')}
            </div>
          </div>
        </div>

        {/* Step 1: Select Student */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('staff.class.className')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value, studentId: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">{t('teacher.reports.selectClass')}</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.className} ({cls.classCode})
                  </option>
                ))}
              </select>
            </div>

            {formData.classId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('staff.class.students')} <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => setFormData({ ...formData, studentId: student.id })}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-purple-50 transition-colors ${
                          formData.studentId === String(student.id) ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{student.fullName}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                          {formData.studentId === String(student.id) && (
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      {t('teacher.reports.noStudents')}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep(2)}
                disabled={!formData.studentId}
                className="flex items-center"
              >
                {t('common.next')}
                <TrendingUp className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Fill Report */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Selected Student Info */}
            {selectedStudent && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900">{selectedStudent.fullName}</p>
                    <p className="text-sm text-purple-600">{selectedStudent.email}</p>
                  </div>
                  {selectedClass && (
                    <Badge variant="info" className="ml-auto">
                      {selectedClass.className}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('teacher.reports.reportDate')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.reportDate}
                  onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('teacher.reports.attendanceRate')} (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.attendanceRate}
                  onChange={(e) => setFormData({ ...formData, attendanceRate: e.target.value })}
                  placeholder="0-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('teacher.reports.progress')} <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(min 10 characters)</span>
              </label>
              <textarea
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder={t('teacher.reports.progressPlaceholder')}
                required
                minLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('teacher.reports.strengths')}
              </label>
              <textarea
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder={t('teacher.reports.strengthsPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('teacher.reports.weaknesses')}
              </label>
              <textarea
                value={formData.weaknesses}
                onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder={t('teacher.reports.weaknessesPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('teacher.reports.recommendations')}
              </label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('teacher.reports.recommendationsPlaceholder')}
              />
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                className="flex items-center"
              >
                <TrendingUp className="w-4 h-4 mr-2 transform rotate-180" />
                {t('common.previous')}
              </Button>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    onClose();
                    setStep(1);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('common.cancel')}
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex items-center"
                >
                  {loading ? (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {t('teacher.reports.submit')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CreateLearningReport;
