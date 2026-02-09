import React from 'react';

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
    info: 'bg-info-100 text-info-700'
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
  const levelConfig = {
    beginner: { label: 'Người mới bắt đầu', className: 'bg-badge-beginner bg text-badge-beginner-text' },
    intermediate: { label: 'Trung cấp', className: 'bg-badge-intermediate bg text-badge-intermediate-text' },
    advanced: { label: 'Cao cấp', className: 'bg-badge-advanced bg text-badge-advanced-text' }
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
  const statusConfig = {
    active: { label: 'Đang hoạt động', className: 'bg-success-100 text-success-700' },
    inactive: { label: 'Không hoạt động', className: 'bg-gray-100 text-gray-600' },
    pending: { label: 'Đang chờ', className: 'bg-warning-100 text-warning-700' },
    completed: { label: 'Hoàn thành', className: 'bg-success-100 text-success-700' },
    cancelled: { label: 'Đã hủy', className: 'bg-error-100 text-error-700' },
    draft: { label: 'Nháp', className: 'bg-gray-100 text-gray-600' }
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;

  return (
    <Badge variant="default" className={`${config.className} ${className}`} {...props}>
      {config.label}
    </Badge>
  );
};

// Success Badge Component
export const SuccessBadge = ({ children, className = '', ...props }) => (
  <Badge variant="success" className={className} {...props}>
    {children || 'Thành công'}
  </Badge>
);

// Warning Badge Component
export const WarningBadge = ({ children, className = '', ...props }) => (
  <Badge variant="warning" className={className} {...props}>
    {children || 'Cảnh báo'}
  </Badge>
);

// Error Badge Component
export const ErrorBadge = ({ children, className = '', ...props }) => (
  <Badge variant="error" className={className} {...props}>
    {children || 'Lỗi'}
  </Badge>
);

// Info Badge Component
export const InfoBadge = ({ children, className = '', ...props }) => (
  <Badge variant="info" className={className} {...props}>
    {children || 'Thông tin'}
  </Badge>
);

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
export const NewBadge = ({ className = '', ...props }) => (
  <Badge variant="success" className={`text-xs font-bold ${className}`} {...props}>
    Mới
  </Badge>
);

// Featured Badge Component
export const FeaturedBadge = ({ className = '', ...props }) => (
  <Badge variant="warning" className={`text-xs font-bold ${className}`} {...props}>
    Nổi bật
  </Badge>
);

// Popular Badge Component
export const PopularBadge = ({ className = '', ...props }) => (
  <Badge variant="primary" className={`text-xs font-bold ${className}`} {...props}>
    Phổ biến
  </Badge>
);

export default Badge;
