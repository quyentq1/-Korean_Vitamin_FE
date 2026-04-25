import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, PhoneCall, CheckCircle, Mail, Phone, Clock, FileText, XCircle, UserPlus, XSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import Input from '../../components/ui/Input';
import Swal from 'sweetalert2';
import consultationService from '../../services/consultationService';

const ConsultationList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    filterConsultations();
  }, [consultations, searchTerm, statusFilter]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const data = await consultationService.getConsultations();
      const items = Array.isArray(data) ? data : data.data || [];
      setConsultations(items);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      Swal.fire({
        icon: 'error',
        title: t('errors.error'),
        text: t('staff.consultationList.errorLoadText')
      });
    } finally {
      setLoading(false);
    }
  };

  const filterConsultations = () => {
    let filtered = [...consultations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.fullName?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.phone?.includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredConsultations(filtered);
  };

  const handleCreateAccount = (item) => {
    navigate('/student-management/create-manual', {
      state: {
        prefilledData: item,
        fromConsultationId: item.id
      }
    });
  };

  const handleReject = async (id) => {
    const { value: reason } = await Swal.fire({
      title: t('staff.consultationList.rejectTitle'),
      input: 'textarea',
      inputLabel: t('staff.consultationList.rejectInputLabel'),
      inputPlaceholder: t('staff.consultationList.rejectInputPlaceholder'),
      inputAttributes: {
        'aria-label': t('staff.consultationList.rejectInputLabel')
      },
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: t('staff.consultationList.rejectConfirmBtn'),
      cancelButtonText: t('common.cancel'),
      inputValidator: (value) => {
        if (!value || value.trim().length < 5) {
          return t('staff.consultationList.rejectValidation');
        }
      }
    });

    if (reason) {
      try {
        Swal.fire({
          title: t('staff.consultationList.sendingEmail'),
          text: t('staff.consultationList.sendingEmailText'),
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await consultationService.rejectConsultation(id, reason);

        Swal.fire({
          icon: 'success',
          title: t('staff.consultationList.rejectedTitle'),
          text: t('staff.consultationList.rejectedText'),
          timer: 2000,
          showConfirmButton: false
        });
        fetchConsultations();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: t('errors.error'),
          text: error.response?.data?.message || t('staff.consultationList.rejectError')
        });
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await consultationService.updateStatus(id, newStatus);
      Swal.fire({
        icon: 'success',
        title: t('staff.consultationList.successTitle'),
        text: t('staff.consultationList.statusUpdateSuccess'),
        timer: 1500,
        showConfirmButton: false
      });
      fetchConsultations();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('errors.error'),
        text: t('staff.consultationList.statusUpdateError')
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONTACTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ACCOUNT_CREATED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'NEW': return t('staff.consultationList.statusNew');
      case 'CONTACTED': return t('staff.consultationList.statusContacted');
      case 'CLOSED': return t('staff.consultationList.statusClosed');
      case 'ACCOUNT_CREATED': return t('staff.consultationList.statusAccountCreated');
      case 'REJECTED': return t('staff.consultationList.statusRejected');
      default: return status;
    }
  };

  const translateContactTime = (time) => {
    switch(time) {
      case 'morning': return t('staff.consultationList.timeMorning');
      case 'afternoon': return t('staff.consultationList.timeAfternoon');
      case 'evening': return t('staff.consultationList.timeEvening');
      default: return time;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={t('staff.consultationList.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none h-[42px]"
            >
              <option value="all">{t('staff.consultationList.allStatus')}</option>
              <option value="NEW">{t('staff.consultationList.statusNew')}</option>
              <option value="CONTACTED">{t('staff.consultationList.statusContacted')}</option>
              <option value="ACCOUNT_CREATED">{t('staff.consultationList.statusAccountCreated')}</option>
              <option value="REJECTED">{t('staff.consultationList.statusRejected')}</option>
              <option value="CLOSED">{t('staff.consultationList.statusClosed')}</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center h-48 items-center bg-white rounded-xl">
          <Loading />
        </div>
      ) : filteredConsultations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">{t('staff.consultationList.noConsultations')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredConsultations.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Info Block */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{item.fullName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                      {translateStatus(item.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{item.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{item.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{t('staff.consultationList.callAt')}: <span className="font-medium">{translateContactTime(item.contactTime)}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{t('staff.consultationList.createdAt')}: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {item.message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic border-l-4 border-gray-300">
                      "{item.message}"
                    </div>
                  )}
                </div>

                {/* Actions Block */}
                <div className="flex flex-row md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4 justify-start">
                  {(item.status === 'NEW' || item.status === 'CONTACTED') && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCreateAccount(item)}
                        className="flex items-center shadow-sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {t('staff.consultationList.createAccount')}
                      </Button>

                      {item.status === 'NEW' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUpdateStatus(item.id, 'CONTACTED')}
                          className="flex items-center shadow-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <PhoneCall className="w-4 h-4 mr-2" />
                          {t('staff.consultationList.consulted')}
                        </Button>
                      )}

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(item.id)}
                        className="flex items-center shadow-sm border-transparent bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        <XSquare className="w-4 h-4 mr-2" />
                        {t('staff.consultationList.rejectRequest')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultationList;
