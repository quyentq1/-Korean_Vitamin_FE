import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  UserPlus,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import PageContainer from '../../components/ui/PageContainer';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Loading } from '../../components/ui/Loading';
import axiosClient from '../../api/axiosClient';

const RegistrationManagement = () => {
  const { t } = useTranslation();
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [registrationToView, setRegistrationToView] = useState(null);
  const [registrationToApprove, setRegistrationToApprove] = useState(null);
  const [registrationToReject, setRegistrationToReject] = useState(null);
  const [registrationToCreateAccount, setRegistrationToCreateAccount] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [newRegistration, setNewRegistration] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    courseId: '',
    paymentMethod: 'CASH',
    paymentStatus: 'PENDING',
    notes: ''
  });
  const [courses, setCourses] = useState([]);

  // Fetch registrations and courses
  useEffect(() => {
    fetchRegistrations();
    fetchCourses();
  }, [statusFilter]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      let url = '/staff/registrations';
      if (statusFilter !== 'all') {
        url = `/staff/registrations/status/${statusFilter}`;
      }
      const response = await axiosClient.get(url);
      setRegistrations(response.data || []);
      setFilteredRegistrations(response.data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setError(t('registrationManagement.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axiosClient.get('/api/public/courses');
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Filter and sort registrations
  useEffect(() => {
    let filtered = [...registrations];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(reg =>
        reg.name?.toLowerCase().includes(term) ||
        reg.email?.toLowerCase().includes(term) ||
        reg.phone?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredRegistrations(filtered);
    setCurrentPage(1);
  }, [registrations, searchTerm, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handle approve
  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await axiosClient.patch(`/staff/registrations/${registrationToApprove.id}/approve`);
      setAlert({ show: true, type: 'success', message: t('registrationManagement.approveSuccess') });
      setShowApproveModal(false);
      setRegistrationToApprove(null);
      fetchRegistrations();
    } catch (error) {
      console.error('Error approving registration:', error);
      setAlert({ show: true, type: 'error', message: t('registrationManagement.approveError') });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    try {
      setActionLoading(true);
      await axiosClient.patch(`/staff/registrations/${registrationToReject.id}/reject`, {
        reason: rejectReason
      });
      setAlert({ show: true, type: 'success', message: t('registrationManagement.rejectSuccess') });
      setShowRejectModal(false);
      setRegistrationToReject(null);
      setRejectReason('');
      fetchRegistrations();
    } catch (error) {
      console.error('Error rejecting registration:', error);
      setAlert({ show: true, type: 'error', message: t('registrationManagement.rejectError') });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle create account
  const handleCreateAccount = async () => {
    try {
      setActionLoading(true);
      await axiosClient.post(`/staff/registrations/${registrationToCreateAccount.id}/create-account`);
      setAlert({ show: true, type: 'success', message: t('registrationManagement.createAccountSuccess') });
      setShowCreateAccountModal(false);
      setRegistrationToCreateAccount(null);
      fetchRegistrations();
    } catch (error) {
      console.error('Error creating account:', error);
      setAlert({ show: true, type: 'error', message: t('registrationManagement.createAccountError') });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle create registration
  const handleCreateRegistration = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await axiosClient.post('/staff/registrations', newRegistration);
      setAlert({ show: true, type: 'success', message: t('registrationManagement.createSuccess') });
      setShowCreateModal(false);
      setNewRegistration({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        courseId: '',
        paymentMethod: 'CASH',
        paymentStatus: 'PENDING',
        notes: ''
      });
      fetchRegistrations();
    } catch (error) {
      console.error('Error creating registration:', error);
      setAlert({ show: true, type: 'error', message: t('registrationManagement.createError') });
    } finally {
      setActionLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'name',
      label: t('registrationManagement.name'),
      render: (registration) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
            {registration.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{registration.name}</div>
            <div className="text-sm text-gray-500">{registration.email}</div>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'phone',
      label: t('registrationManagement.phone'),
      render: (registration) => (
        <span className="text-gray-600">{registration.phone || '-'}</span>
      ),
      sortable: true
    },
    {
      key: 'courseName',
      label: t('registrationManagement.course'),
      render: (registration) => (
        <span className="text-gray-600">{registration.courseName || '-'}</span>
      ),
      sortable: true
    },
    {
      key: 'paymentMethod',
      label: t('registrationManagement.paymentMethod'),
      render: (registration) => (
        <Badge variant="info">
          {registration.paymentMethod || '-'}
        </Badge>
      ),
      sortable: true
    },
    {
      key: 'paymentStatus',
      label: t('registrationManagement.paymentStatus'),
      render: (registration) => (
        <Badge
          variant={registration.paymentStatus === 'PAID' ? 'success' : 'warning'}
        >
          {registration.paymentStatus || '-'}
        </Badge>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: t('registrationManagement.status'),
      render: (registration) => (
        <Badge
          variant={
            registration.status === 'APPROVED' ? 'success' :
              registration.status === 'REJECTED' ? 'error' : 'warning'
          }
        >
          {registration.status || '-'}
        </Badge>
      ),
      sortable: true
    },
    {
      key: 'registrationDate',
      label: t('registrationManagement.registrationDate'),
      render: (registration) => (
        <span className="text-gray-600">
          {registration.registrationDate ? new Date(registration.registrationDate).toLocaleDateString() : '-'}
        </span>
      ),
      sortable: true
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (registration) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setRegistrationToView(registration);
              setShowViewModal(true);
            }}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title={t('common.view')}
          >
            <Eye className="w-4 h-4" />
          </button>
          {registration.status === 'PENDING' && (
            <>
              <button
                onClick={() => {
                  setRegistrationToApprove(registration);
                  setShowApproveModal(true);
                }}
                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title={t('registrationManagement.approve')}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setRegistrationToReject(registration);
                  setShowRejectModal(true);
                }}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t('registrationManagement.reject')}
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {registration.status === 'APPROVED' && !registration.hasAccount && (
            <button
              onClick={() => {
                setRegistrationToCreateAccount(registration);
                setShowCreateAccountModal(true);
              }}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={t('registrationManagement.createAccount')}
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      sortable: false
    }
  ];

  if (loading) {
    return (
      <PageContainer>
        <PageLoading />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert type="error" message={error} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Alert */}
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title={t('registrationManagement.title')}
        subtitle={t('registrationManagement.subtitle')}
        actions={
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={fetchRegistrations}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('common.refresh')}
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('registrationManagement.createRegistration')}
            </Button>
          </div>
        }
      />

      {/* Status Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex space-x-2">
          {['all', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {status === 'all'
                ? t('registrationManagement.allStatus')
                : t(`registrationManagement.status.${status.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('registrationManagement.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortField(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="registrationDate-desc">{t('registrationManagement.newestFirst')}</option>
              <option value="registrationDate-asc">{t('registrationManagement.oldestFirst')}</option>
              <option value="name-asc">{t('registrationManagement.nameAsc')}</option>
              <option value="name-desc">{t('registrationManagement.nameDesc')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('registrationManagement.totalRegistrations')}</p>
              <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
            </div>
            <Filter className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('registrationManagement.pending')}</p>
              <p className="text-2xl font-bold text-yellow-600">
                {registrations.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('registrationManagement.approved')}</p>
              <p className="text-2xl font-bold text-green-600">
                {registrations.filter(r => r.status === 'APPROVED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('registrationManagement.rejected')}</p>
              <p className="text-2xl font-bold text-red-600">
                {registrations.filter(r => r.status === 'REJECTED').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {paginatedRegistrations.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('registrationManagement.noRegistrationsFound')}</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={paginatedRegistrations}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {t('registrationManagement.showing')} {startIndex + 1} - {Math.min(endIndex, filteredRegistrations.length)} {t('common.of')} {filteredRegistrations.length}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              {t('common.previous')}
            </Button>
            <span className="px-4 py-2 bg-gray-100 rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}

      {/* View Registration Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setRegistrationToView(null);
        }}
        title={t('registrationManagement.registrationDetails')}
        size="lg"
      >
        {registrationToView && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl">
                {registrationToView.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{registrationToView.name}</h3>
                <p className="text-gray-500">{registrationToView.email}</p>
                <Badge
                  variant={
                    registrationToView.status === 'APPROVED' ? 'success' :
                      registrationToView.status === 'REJECTED' ? 'error' : 'warning'
                  }
                  className="mt-2"
                >
                  {registrationToView.status}
                </Badge>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('registrationManagement.phone')}</p>
                  <p className="font-medium">{registrationToView.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('registrationManagement.dateOfBirth')}</p>
                  <p className="font-medium">
                    {registrationToView.dateOfBirth
                      ? new Date(registrationToView.dateOfBirth).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('registrationManagement.course')}</p>
                  <p className="font-medium">{registrationToView.courseName || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('registrationManagement.paymentMethod')}</p>
                  <p className="font-medium">{registrationToView.paymentMethod || '-'}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            {registrationToView.address && (
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('registrationManagement.address')}</p>
                <p className="text-gray-900">{registrationToView.address}</p>
              </div>
            )}

            {/* Notes */}
            {registrationToView.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('registrationManagement.notes')}</p>
                <p className="text-gray-900">{registrationToView.notes}</p>
              </div>
            )}

            {/* Reject Reason */}
            {registrationToView.rejectReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 mb-1">{t('registrationManagement.rejectReason')}</p>
                <p className="text-red-900">{registrationToView.rejectReason}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 justify-end pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setRegistrationToView(null);
                }}
              >
                {t('common.close')}
              </Button>
              {registrationToView.status === 'PENDING' && (
                <>
                  <Button
                    variant="success"
                    onClick={() => {
                      setShowViewModal(false);
                      setRegistrationToApprove(registrationToView);
                      setShowApproveModal(true);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('registrationManagement.approve')}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setShowViewModal(false);
                      setRegistrationToReject(registrationToView);
                      setShowRejectModal(true);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {t('registrationManagement.reject')}
                  </Button>
                </>
              )}
              {registrationToView.status === 'APPROVED' && !registrationToView.hasAccount && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowViewModal(false);
                    setRegistrationToCreateAccount(registrationToView);
                    setShowCreateAccountModal(true);
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('registrationManagement.createAccount')}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setRegistrationToApprove(null);
        }}
        title={t('registrationManagement.approveRegistration')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {t('registrationManagement.approveConfirmation')} <strong>{registrationToApprove?.name}</strong>?
          </p>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowApproveModal(false);
                setRegistrationToApprove(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loading type="spinner" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('registrationManagement.approve')}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRegistrationToReject(null);
          setRejectReason('');
        }}
        title={t('registrationManagement.rejectRegistration')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {t('registrationManagement.rejectConfirmation')} <strong>{registrationToReject?.name}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('registrationManagement.rejectReason')}
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder={t('registrationManagement.rejectReasonPlaceholder')}
            />
          </div>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowRejectModal(false);
                setRegistrationToReject(null);
                setRejectReason('');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              {actionLoading ? (
                <Loading type="spinner" />
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  {t('registrationManagement.reject')}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Account Modal */}
      <Modal
        isOpen={showCreateAccountModal}
        onClose={() => {
          setShowCreateAccountModal(false);
          setRegistrationToCreateAccount(null);
        }}
        title={t('registrationManagement.createAccount')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {t('registrationManagement.createAccountConfirmation')} <strong>{registrationToCreateAccount?.name}</strong>?
          </p>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateAccountModal(false);
                setRegistrationToCreateAccount(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateAccount}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loading type="spinner" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('registrationManagement.createAccount')}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Registration Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewRegistration({
            name: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            address: '',
            courseId: '',
            paymentMethod: 'CASH',
            paymentStatus: 'PENDING',
            notes: ''
          });
        }}
        title={t('registrationManagement.createRegistration')}
        size="lg"
      >
        <form onSubmit={handleCreateRegistration} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('registrationManagement.name')} *
              </label>
              <Input
                type="text"
                value={newRegistration.name}
                onChange={(e) => setNewRegistration({ ...newRegistration, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('registrationManagement.email')} *
              </label>
              <Input
                type="email"
                value={newRegistration.email}
                onChange={(e) => setNewRegistration({ ...newRegistration, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('registrationManagement.phone')} *
              </label>
              <Input
                type="tel"
                value={newRegistration.phone}
                onChange={(e) => setNewRegistration({ ...newRegistration, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('registrationManagement.dateOfBirth')}
              </label>
              <Input
                type="date"
                value={newRegistration.dateOfBirth}
                onChange={(e) => setNewRegistration({ ...newRegistration, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('registrationManagement.address')}
              </label>
              <Input
                type="text"
                value={newRegistration.address}
                onChange={(e) => setNewRegistration({ ...newRegistration, address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('registrationManagement.course')} *
              </label>
              <select
                value={newRegistration.courseId}
                onChange={(e) => setNewRegistration({ ...newRegistration, courseId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">{t('registrationManagement.selectCourse')}</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('registrationManagement.paymentMethod')} *
              </label>
              <select
                value={newRegistration.paymentMethod}
                onChange={(e) => setNewRegistration({ ...newRegistration, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="CASH">{t('registrationManagement.cash')}</option>
                <option value="BANK_TRANSFER">{t('registrationManagement.bankTransfer')}</option>
                <option value="MOMO">{t('registrationManagement.momo')}</option>
                <option value="ZALOPAY">{t('registrationManagement.zaloPay')}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('registrationManagement.notes')}
              </label>
              <textarea
                value={newRegistration.notes}
                onChange={(e) => setNewRegistration({ ...newRegistration, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
          <div className="flex space-x-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setNewRegistration({
                  name: '',
                  email: '',
                  phone: '',
                  dateOfBirth: '',
                  address: '',
                  courseId: '',
                  paymentMethod: 'CASH',
                  paymentStatus: 'PENDING',
                  notes: ''
                });
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loading type="spinner" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('registrationManagement.createRegistration')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default RegistrationManagement;
