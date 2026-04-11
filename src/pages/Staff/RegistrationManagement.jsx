import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageContainer } from '../../components/ui/PageContainer';
import ConsultationList from './ConsultationList';

const RegistrationManagement = () => {
  const { t } = useTranslation();

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Yêu Cầu Tư Vấn"
        subtitle="Quản lý danh sách khách hàng để lại thông tin yêu cầu tư vấn"
      />

      <ConsultationList />
    </PageContainer>
  );
};

export default RegistrationManagement;
