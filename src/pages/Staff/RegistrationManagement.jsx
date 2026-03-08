import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Eye,
  Check,
  X,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageContainer } from '../../components/ui/PageContainer';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Alert } from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import staffService from '../../services/staffService';
import Swal from 'sweetalert2';

const RegistrationManagement = () => {
  const { t } = useTranslation();

  // States
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  // Modal states
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignClassModal, setShowAssignClassModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);

  // Form states
  const [selectedClass, setSelectedClass] = useState(null);
  const [accountFormData, setAccountFormData] = useState({
    studentName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, statusFilter, courseFilter]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await staffService.getRegistrations();
      setRegistrations(response.data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      Swal.fire({
        icon: 'error',
        title: t('staff.registrations.error.loadFailed'),
        text: error.response?.data?.message || 'Failed to load registrations'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = [...registrations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(reg =>
        reg.studentName?.toLowerCase().includes(term) ||
        reg.email?.toLowerCase().includes(term) ||
        reg.phone?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.status === statusFilter);
    }

    if (courseFilter !== 'all') {
      filtered = filtered.filter(reg => reg.courseId === courseFilter);
    }

    setFilteredRegistrations(filtered);
  };

  const handleApprove = async (registrationId) => {
    const result = await Swal.fire({
      title: t('staff.registrations.confirmApprove'),
      text: t('staff.registrations.approveConfirmText'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#48bb78',
      cancelButtonColor: '#667eea',
      confirmButtonText: t('common.yes'),
      cancelButtonText: t('common.no')
    });

    if (result.isConfirmed) {
      try {
        await staffService.approveRegistration(registrationId);
        Swal.fire({
          icon: 'success',
          title: t('staff.registrations.approveSuccess'),
          timer: 1500,
          showConfirmButton: false
        });
        fetchRegistrations();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: t('staff.registrations.approveFailed'),
          text: error.response?.data?.message
        });
      }
    }
  };

  const handleReject = async (registrationId) => {
    const { value: reason } = await Swal.fire({
      title: t('staff.registrations.confirmReject'),
      input: 'text',
      inputLabel: t('staff.registrations.rejectReason'),
      inputPlaceholder: t('staff.registrations.enterReason'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f56565',
      cancelButtonColor: '#667eea',
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      inputValidator: (value) => {
        return !value || value.length < 3 ? t('staff.registrations.reasonRequired') : null;
      }
    });

    if (reason) {
      try {
        await staffService.rejectRegistration(registrationId, reason);
        Swal.fire({
          icon: 'success',
          title: t('staff.registrations.rejectSuccess'),
          timer: 1500,
          showConfirmButton: false
        });
        fetchRegistrations();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: t('staff.registrations.rejectFailed'),
          text: error.response?.data?.message
        });
      }
    }
  };

  const handleViewDetail = async (registration) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
  };

  const handleAssignClass = async (registration) => {
    setSelectedRegistration(registration);
    setShowAssignClassModal(true);

    // Fetch available classes for the course
    try {
      const classes = await staffService.getAvailableClasses(registration.courseId);
      setAvailableClasses(classes.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleConfirmAssignClass = async () => {
    if (!selectedClass) {
      Swal.fire({
        icon: 'warning',
        title: t('staff.registrations.selectClass'),
        text: t('staff.registrations.selectClassRequired')
      });
      return;
    }

    try {
      await staffService.assignClassToRegistration(selectedRegistration.id, selectedClass);
      Swal.fire({
        icon: 'success',
        title: t('staff.registrations.classAssigned'),
        timer: 1500,
        showConfirmButton: false
      });
      setShowAssignClassModal(false);
      fetchRegistrations();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('staff.registrations.assignFailed'),
        text: error.response?.data?.message
      });
    }
  };

  const handleCreateAccount = async (registration) => {
    setSelectedRegistration(registration);
    setShowCreateAccountModal(true);
    setAccountFormData({
      studentName: registration.studentName || '',
      email: registration.email || '',
      phone: registration.phone || ''
    });
  };

  const handleConfirmCreateAccount = async () => {
    try {
      await staffService.createAccountFromRegistration(
        selectedRegistration.id,
        accountFormData
      );
      Swal.fire({
        icon: 'success',
        title: t('staff.registrations.accountCreated'),
        text: t('staff.registrations.accountCreatedSuccess'),
        timer: 1500,
        showConfirmButton: false
      });
      setShowCreateAccountModal(false);
      fetchRegistrations();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('staff.registrations.createAccountFailed'),
        text: error.response?.data?.message
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CONTACTED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      case 'CONTACTED': return <FileText className="w-4 h-4" />;
      default: return null;
    }
  };

  // Expandable card state
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title={t('staff.registrations.title')}
        subtitle={t('staff.registrations.subtitle')}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.search')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={t('staff.registrations.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full h-[42px]"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('staff.registrations.status')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-[42px]"
            >
              <option value="all">{t('staff.registrations.allStatus')}</option>
              <option value="PENDING">{t('staff.registrations.pending')}</option>
              <option value="APPROVED">{t('staff.registrations.approved')}</option>
              <option value="REJECTED">{t('staff.registrations.rejected')}</option>
              <option value="CONTACTED">{t('staff.registrations.contacted')}</option>
            </select>
          </div>

          {/* Refresh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              &nbsp;
            </label>
            <Button
              variant="secondary"
              onClick={fetchRegistrations}
              disabled={loading}
              className="w-full h-[42px]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loading />
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">{t('staff.registrations.noRegistrations')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRegistrations.map((registration) => (
            <div
              key={registration.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Card Header - Always Visible */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCard(registration.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Side - Status + Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Status Icon */}
                    <div className={`p-2.5 rounded-full ${getStatusColor(registration.status)} shrink-0`}>
                      {getStatusIcon(registration.status)}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 mb-1.5">
                        {registration.studentName || t('staff.registrations.unknown')}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          <span className="truncate">{registration.email}</span>
                        </span>
                        <span className="flex items-center">
                          <Phone className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          <span className="truncate">{registration.phone}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Badge + Expand Icon */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Badge */}
                    <Badge variant="outline" className={getStatusColor(registration.status)}>
                      {t(`staff.registrations.${registration.status.toLowerCase()}`)}
                    </Badge>

                    {/* Expand/Collapse Icon */}
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${
                        expandedCard === registration.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Course Info */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <span className="flex items-center text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2 shrink-0" />
                    {registration.courseName || '-'}
                  </span>
                  <span className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 shrink-0" />
                    {registration.createdAt ? new Date(registration.createdAt).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>

              {/* Expanded Content - Details & Actions */}
              {expandedCard === registration.id && (
                <div className="border-t border-gray-200 p-5 bg-gradient-to-br from-gray-50 to-blue-50/30">
                  {/* Additional Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {t('staff.registrations.message')}
                      </p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {registration.message || '-'}
                      </p>
                    </div>
                    {registration.notes && (
                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          {t('staff.registrations.notes')}
                        </p>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {registration.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(registration.id);
                      }}
                      disabled={registration.status === 'APPROVED'}
                      className="flex items-center shadow-sm"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      {t('staff.registrations.approve')}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(registration.id);
                      }}
                      disabled={registration.status === 'REJECTED'}
                      className="flex items-center shadow-sm"
                    >
                      <X className="w-4 h-4 mr-1.5" />
                      {t('staff.registrations.reject')}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignClass(registration);
                      }}
                      className="flex items-center shadow-sm"
                    >
                      <Users className="w-4 h-4 mr-1.5" />
                      {t('staff.registrations.assignClass')}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateAccount(registration);
                      }}
                      className="flex items-center shadow-sm"
                    >
                      <User className="w-4 h-4 mr-1.5" />
                      {t('staff.registrations.createAccount')}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(registration);
                      }}
                      className="flex items-center shadow-sm"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      {t('common.view')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assign Class Modal */}
      <Modal
        isOpen={showAssignClassModal}
        onClose={() => {
          setShowAssignClassModal(false);
          setSelectedClass(null);
          setSelectedRegistration(null);
        }}
        title={t('staff.registrations.assignClass')}
        size="max-w-md"
      >
        <div className="space-y-5">
          {/* Student Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm font-medium text-gray-700 mb-1">
              {t('staff.registrations.student')}:
            </p>
            <p className="text-base font-semibold text-gray-900 mb-2">
              {selectedRegistration?.studentName}
            </p>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {t('staff.registrations.course')}:
            </p>
            <p className="text-base font-semibold text-gray-900">
              {selectedRegistration?.courseName}
            </p>
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('staff.registrations.selectClass')} <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">{t('staff.registrations.chooseClass')}</option>
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className} ({cls.classCode}) - {cls.currentEnrollment}/{cls.capacity}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAssignClassModal(false);
                setSelectedClass(null);
                setSelectedRegistration(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleConfirmAssignClass}>
              {t('common.confirm')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Account Modal */}
      <Modal
        isOpen={showCreateAccountModal}
        onClose={() => {
          setShowCreateAccountModal(false);
          setAccountFormData({ studentName: '', email: '', phone: '' });
          setSelectedRegistration(null);
        }}
        title={t('staff.registrations.createAccountTitle')}
        size="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('staff.students.fullName')} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={accountFormData.studentName}
              onChange={(e) => setAccountFormData({ ...accountFormData, studentName: e.target.value })}
              placeholder={t('staff.registrations.studentNamePlaceholder')}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('staff.students.email')} <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={accountFormData.email}
              onChange={(e) => setAccountFormData({ ...accountFormData, email: e.target.value })}
              placeholder={t('staff.registrations.emailPlaceholder')}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('staff.students.phone')} <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              value={accountFormData.phone}
              onChange={(e) => setAccountFormData({ ...accountFormData, phone: e.target.value })}
              placeholder={t('staff.registrations.phonePlaceholder')}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateAccountModal(false);
                setAccountFormData({ studentName: '', email: '', phone: '' });
                setSelectedRegistration(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleConfirmCreateAccount}>
              {t('staff.registrations.createAccountButton')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default RegistrationManagement;
