import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle as InfoIcon, X } from 'lucide-react';

/**
 * Alert Component - Reusable alert/notification components following design system
 * 
 * Variants: default, success, warning, error, info
 * Features: Dismissible alerts, Icon support, Auto-dismiss
 */

export const Alert = ({
  type = 'default',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}) => {
  const typeConfig = {
    default: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgClass: 'bg-gray-50 border-gray-200 text-gray-800',
      iconClass: 'text-error-600'
    },
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgClass: 'bg-success-50 border-success-200 text-success-800',
      iconClass: 'text-success-600'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bgClass: 'bg-warning-50 border-warning-200 text-warning-800',
      iconClass: 'text-warning-600'
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgClass: 'bg-error-50 border-error-200 text-error-800',
      iconClass: 'text-error-600'
    },
    info: {
      icon: <InfoIcon className="w-5 h-5" />,
      bgClass: 'bg-info-50 border-info-200 text-info-800',
      iconClass: 'text-info-600'
    }
  };

  const config = typeConfig[type] || typeConfig.default;

  return (
    <div
      className={`rounded-xl border ${config.bgClass} p-4 ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold text-gray-900 mb-1">
              {title}
            </h4>
          )}
          <div className="text-sm text-gray-700">
            {children}
          </div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Success Alert Component
export const SuccessAlert = ({ title, children, dismissible, onDismiss, className = '', ...props }) => (
  <Alert
    type="success"
    title={title}
    dismissible={dismissible}
    onDismiss={onDismiss}
    className={className}
    {...props}
  >
    {children}
  </Alert>
);

// Warning Alert Component
export const WarningAlert = ({ title, children, dismissible, onDismiss, className = '', ...props }) => (
  <Alert
    type="warning"
    title={title}
    dismissible={dismissible}
    onDismiss={onDismiss}
    className={className}
    {...props}
  >
    {children}
  </Alert>
);

// Error Alert Component
export const ErrorAlert = ({ title, children, dismissible, onDismiss, className = '', ...props }) => (
  <Alert
    type="error"
    title={title}
    dismissible={dismissible}
    onDismiss={onDismiss}
    className={className}
    {...props}
  >
    {children}
  </Alert>
);

// Info Alert Component
export const InfoAlert = ({ title, children, dismissible, onDismiss, className = '', ...props }) => (
  <Alert
    type="info"
    title={title}
    dismissible={dismissible}
    onDismiss={onDismiss}
    className={className}
    {...props}
  >
    {children}
  </Alert>
);

// Inline Alert Component (for smaller notifications)
export const InlineAlert = ({ type = 'default', children, className = '', ...props }) => {
  const typeClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    info: 'bg-info-100 text-info-800'
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${typeClasses[type]} ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
};

export default Alert;
