import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from '../pages/Teacher/ExamEditor.module.css';

/**
 * Enhanced Button Component with Smooth Animations
 *
 * Variants: primary, secondary, danger, success, warning
 * Sizes: sm, md, lg
 * Features:
 * - Ripple effect on click
 * - Smooth hover animations
 * - Loading state with spinner
 * - Disabled state
 * - Icon support
 * - Full width option
 */
const EnhancedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl shadow-md transition-all duration-300 ease-out relative overflow-hidden';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300 hover:shadow-lg',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-md pointer-events-none';

  const rippleClasses = 'btn-ripple';

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled || loading ? disabledClasses : ''}
    ${rippleClasses}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Ripple Effect Element */}
      <span className="absolute inset-0 rounded-xl" aria-hidden="true"></span>

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loading ? 'Đang xử lý...' : children}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
          </>
        )}
      </span>
    </button>
  );
};

/**
 * Action Button with Icon Only (for table rows, cards, etc.)
 */
export const ActionButton = ({
  icon,
  tooltip,
  variant = 'default',
  onClick,
  disabled = false,
  className = '',
}) => {
  const variantClasses = {
    default: 'text-gray-600 hover:text-blue-600 hover:bg-blue-50',
    edit: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50',
    delete: 'text-red-600 hover:text-red-700 hover:bg-red-50',
    view: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
    success: 'text-green-600 hover:text-green-700 hover:bg-green-50',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-2 rounded-lg transition-all duration-200 ease-out
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : 'hover:scale-110 active:scale-95'}
        ${className}
      `}
      title={tooltip}
      aria-label={tooltip}
    >
      {icon}
    </button>
  );
};

/**
 * Floating Action Button
 */
export const FloatingActionButton = ({
  icon,
  tooltip,
  onClick,
  disabled = false,
  position = 'bottom-right',
  className = '',
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        fixed ${positionClasses[position]}
        w-14 h-14 rounded-full
        bg-gradient-to-r from-blue-600 to-blue-700 text-white
        shadow-xl flex items-center justify-center
        transition-all duration-300 ease-out
        hover:scale-110 hover:shadow-2xl hover:from-blue-700 hover:to-blue-800
        active:scale-100 active:shadow-xl
        ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}
        ${className}
      `}
      title={tooltip}
      aria-label={tooltip}
    >
      {icon}
    </button>
  );
};

/**
 * Toggle Button Group
 */
const ToggleButtonGroup = ({ options, value, onChange, orientation = 'horizontal' }) => {
  const orientationClasses = orientation === 'horizontal' ? 'flex-row' : 'flex-col';

  return (
    <div className={`inline-flex ${orientationClasses} gap-2 p-1 bg-gray-100 rounded-xl`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-200 ease-out
            ${value === option.value
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }
          `}
        >
          {option.icon && <span className="mr-2">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default EnhancedButton;
export { ActionButton, FloatingActionButton, ToggleButtonGroup };
