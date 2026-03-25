import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainer, PageHeader } from '../../components/ui';
import Mail from '../../components/Mail';

/**
 * AdminMail - Mail page for Admin
 */
const AdminMail = () => {
  const { t } = useTranslation();

  return (
    <PageContainer variant="wide">
      <PageHeader
        title={t('admin.mail.title', 'Hộp thư')}
        subtitle={t('admin.mail.subtitle', 'Quản lý email và thông báo hệ thống')}
      />
      <Mail userRole="admin" />
    </PageContainer>
  );
};

export default AdminMail;
