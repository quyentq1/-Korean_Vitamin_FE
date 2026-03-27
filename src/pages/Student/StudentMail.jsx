import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainer, PageHeader } from '../../components/ui';
import Mail from '../../components/Mail';

/**
 * StudentMail - Mail page for Student
 */
const StudentMail = () => {
  const { t } = useTranslation();

  return (
    <PageContainer variant="wide">
      <PageHeader
        title="Hộp thư"
        subtitle="Quản lý email và thông báo"
      />
      <Mail userRole="student" />
    </PageContainer>
  );
};

export default StudentMail;
