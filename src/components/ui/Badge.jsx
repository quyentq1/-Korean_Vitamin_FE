import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Badge Component - Reusable badge/tag components following design system
 *
 * Variants: Level (beginner, intermediate, advanced), Status, Success, Warning, Error, Info
 * Features: Icon support, Dismissible badges
 */

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon,
  dismissible = false,
  onDismiss,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
    info: 'bg-info-100 text-info-700',
    neutral: 'bg-gray-50 text-gray-600 border border-gray-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {Icon && (React.isValidElement(Icon) ? Icon : <Icon className="w-3 h-3" />)}
      {children}
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-1 hover:opacity-75 transition-opacity"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </span>
  );
};

// Level Badge Component
export const LevelBadge = ({ level, className = '', ...props }) => {
  const { t } = useTranslation();
  const levelConfig = {
    beginner: { label: t('ui.badge.beginner'), className: 'bg-badge-beginner bg text-badge-beginner-text' },
    intermediate: { label: t('ui.badge.intermediate'), className: 'bg-badge-intermediate bg text-badge-intermediate-text' },
    advanced: { label: t('ui.badge.advanced'), className: 'bg-badge-advanced bg text-badge-advanced-text' }
  };

  const config = levelConfig[level?.toLowerCase()] || levelConfig.beginner;

  return (
    <Badge variant="default" className={`${config.className} ${className}`} {...props}>
      {config.label}
    </Badge>
  );
};

// Status Badge Component
export const StatusBadge = ({ status, className = '', ...props }) => {
  const { t } = useTranslation();
  const statusConfig = {
    active: { label: t('ui.statusBadge.active'), className: 'bg-success-100 text-success-700' },
    inactive: { label: t('ui.statusBadge.inactive'), className: 'bg-gray-100 text-gray-600' },
    pending: { label: t('ui.statusBadge.pending'), className: 'bg-warning-100 text-warning-700' },
    completed: { label: t('ui.statusBadge.completed'), className: 'bg-success-100 text-success-700' },
    cancelled: { label: t('ui.statusBadge.cancelled'), className: 'bg-error-100 text-error-700' },
    draft: { label: t('ui.statusBadge.draft'), className: 'bg-gray-100 text-gray-600' }
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;

  return (
    <Badge variant="default" className={`${config.className} ${className}`} {...props}>
      {config.label}
    </Badge>
  );
};

// Success Badge Component
export const SuccessBadge = ({ children, className = '', ...props }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="success" className={className} {...props}>
      {children || t('ui.badge.success')}
    </Badge>
  );
};

// Warning Badge Component
export const WarningBadge = ({ children, className = '', ...props }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="warning" className={className} {...props}>
      {children || t('ui.badge.warning')}
    </Badge>
  );
};

// Error Badge Component
export const ErrorBadge = ({ children, className = '', ...props }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="error" className={className} {...props}>
      {children || t('ui.badge.error')}
    </Badge>
  );
};

// Info Badge Component
export const InfoBadge = ({ children, className = '', ...props }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="info" className={className} {...props}>
      {children || t('ui.badge.info')}
    </Badge>
  );
};

// Count Badge Component
export const CountBadge = ({ count, max = 99, className = '', ...props }) => {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge variant="primary" className={`min-w-6 justify-center ${className}`} {...props}>
      {displayCount}
    </Badge>
  );
};

// New Badge Component
export const NewBadge = ({ className = '', ...props }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="success" className={`text-xs font-bold ${className}`} {...props}>
      {t('ui.badge.new')}
    </Badge>
  );
};

// Featured Badge Component
export const FeaturedBadge = ({ className = '', ...props }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="warning" className={`text-xs font-bold ${className}`} {...props}>
      {t('ui.badge.featured')}
    </Badge>
  );
};

// Popular Badge Component
export const PopularBadge = ({ className = '', ...props }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="primary" className={`text-xs font-bold ${className}`} {...props}>
      {t('ui.badge.popular')}
    </Badge>
  );
};

export default Badge;
