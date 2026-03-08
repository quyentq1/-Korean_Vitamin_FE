import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Send,
  X,
  AlertCircle,
  CheckCircle,
  Users,
  FileText,
  Flag,
  Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import studentService from '../../services/studentService';
import Swal from 'sweetalert2';

/**
 * CreateStudentReport Modal
 * Learners send reports/feedback to Staff/Teachers
 */
const CreateStudentReport = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();

  // Form states
  const [formData, setFormData] = useState({
    classId: '',
    recipientId: '',
    reportType: 'FEEDBACK',
    subject: '',
    content: '',
    priority: 'MEDIUM'
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchMyClasses();
      fetchStaff();
    }
  }, [isOpen]);

  const fetchMyClasses = async () => {
    try {
      const response = await studentService.getMyClasses();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      // Get all users with STAFF or TEACHER role
      const response = await studentService.getStaff();
      setStaff(response.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.subject || formData.subject.trim().length < 5) {
      Swal.fire({
        icon: 'warning',
        title: t('learner.reports.warning'),
        text: t('learner.reports.subjectRequired')
      });
      return;
    }

    if (!formData.content || formData.content.trim().length < 10) {
      Swal.fire({
        icon: 'warning',
        title: t('learner.reports.warning'),
        text: t('learner.reports.contentRequired')
      });
      return;
    }

    try {
      setLoading(true);

      const request = {
        reportType: formData.reportType,
        subject: formData.subject,
        content: formData.content,
        classId: formData.classId ? Number(formData.classId) : null,
        recipientId: formData.recipientId ? Number(formData.recipientId) : null,
        priority: formData.priority
      };

      await studentService.createStudentReport(request);

      Swal.fire({
        icon: 'success',
        title: t('learner.reports.success'),
        text: t('learner.reports.reportSubmitted')
      });

      // Reset form
      setFormData({
        classId: '',
        recipientId: '',
        reportType: 'FEEDBACK',
        subject: '',
        content: '',
        priority: 'MEDIUM'
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      Swal.fire({
        icon: 'error',
        title: t('learner.reports.error.submitFailed'),
        text: error.response?.data?.message || 'Failed to submit report'
      });
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { value: 'FEEDBACK', label: t('learner.reports.types.feedback'), color: 'bg-blue-100 text-blue-800', icon: '💬' },
    { value: 'ISSUE', label: t('learner.reports.types.issue'), color: 'bg-red-100 text-red-800', icon: '⚠️' },
    { value: 'QUESTION', label: t('learner.reports.types.question'), color: 'bg-purple-100 text-purple-800', icon: '❓' },
    { value: 'REQUEST', label: t('learner.reports.types.request'), color: 'bg-green-100 text-green-800', icon: '🙏' },
    { value: 'COMPLAINT', label: t('learner.reports.types.complaint'), color: 'bg-orange-100 text-orange-800', icon: '📢' },
    { value: 'OTHER', label: t('learner.reports.types.other'), color: 'bg-gray-100 text-gray-800', icon: '📝' }
  ];

  const priorities = [
    { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800', icon: '🟢' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
    { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-800', icon: '🔴' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setFormData({
          classId: '',
          recipientId: '',
          reportType: 'FEEDBACK',
          subject: '',
          content: '',
          priority: 'MEDIUM'
        });
      }}
      title={
        <div className="flex items-center">
          <Send className="w-6 h-6 mr-2 text-blue-600" />
          {t('learner.reports.createReport')}
        </div>
      }
      size="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('learner.reports.reportType')} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, reportType: type.value })}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  formData.reportType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <p className="text-sm font-medium mt-1">{type.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('learner.reports.subject')} <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-2">(min 5 characters)</span>
          </label>
          <Input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder={t('learner.reports.subjectPlaceholder')}
            required
            minLength={5}
            maxLength={200}
          />
        </div>

        {/* Class (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('learner.reports.relatedClass')} ({t('common.optional')})
          </label>
          <select
            value={formData.classId}
            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('learner.reports.noClass')}</option>
            {classes.map((cls) => (
              <option key={cls.classEntity?.id} value={cls.classEntity?.id}>
                {cls.classEntity?.className} ({cls.classEntity?.classCode})
              </option>
            ))}
          </select>
        </div>

        {/* Recipient (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('learner.reports.recipient')} ({t('common.optional')})
          </label>
          <select
            value={formData.recipientId}
            onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('learner.reports.anyStaff')}</option>
            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.fullName} - {person.role}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('learner.reports.priority')} <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            {priorities.map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() => setFormData({ ...formData, priority: priority.value })}
                className={`flex-1 px-4 py-2 rounded-lg border-2 text-center transition-all ${
                  formData.priority === priority.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{priority.icon}</span>
                <p className="text-sm font-medium mt-1">{priority.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('learner.reports.content')} <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-2">(min 10 characters)</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={t('learner.reports.contentPlaceholder')}
            required
            minLength={10}
            maxLength={5000}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onClose();
              setFormData({
                classId: '',
                recipientId: '',
                reportType: 'FEEDBACK',
                subject: '',
                content: '',
                priority: 'MEDIUM'
              });
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
                {t('common.submitting')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t('learner.reports.submit')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateStudentReport;
