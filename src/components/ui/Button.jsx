import React from 'react';
import { Check, X, ChevronLeft, ChevronRight, Save, Trash2, Edit3, Upload, Download, Plus } from 'lucide-react';

/**
 * Button Component - Reusable button variants following design system
 * 
 * Variants: primary, secondary, ghost, danger, icon
 * Sizes: sm, md, lg
 */

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  fullWidth = false,
  onClick,
  type = 'button',
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-400 text-white hover:bg-primary-500 hover:shadow-teal-lg active:bg-primary-600 active:scale-95 shadow-teal',
    secondary: 'bg-white text-primary-500 border border-primary-400 hover:bg-primary-50 hover:shadow-lg active:bg-primary-100',
    ghost: 'bg-transparent text-primary-500 hover:bg-primary-50 active:bg-primary-100',
    danger: 'bg-error-500 text-white hover:bg-error-600 hover:shadow-xl active:bg-error-700',
    icon: 'p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors'
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`;
  
  // Render icon
  const renderIcon = () => {
    if (!Icon) return null;
    
    const iconSize = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    
    // Check if Icon is a JSX element (has type and props) or a component
    if (React.isValidElement(Icon)) {
      // It's a JSX element, just render it
      return (
        <span style={iconPosition === 'right' ? { marginLeft: '0.5rem' } : { marginRight: '0.5rem' }}>
          {Icon}
        </span>
      );
    }
    
    // It's a component, render it with className
    return (
      <Icon 
        className={iconSize[size]} 
        style={iconPosition === 'right' ? { marginLeft: '0.5rem' } : { marginRight: '0.5rem' }}
      />
    );
  };
  
  // Render loading spinner
  const renderLoading = () => {
    if (!loading) return null;
    
    return (
      <svg 
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8 0 4 4 0 018 8 0 4zm-2 0a1 1 0 011 0 2 2 0 012 0 2z"
        ></path>
      </svg>
    );
  };
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && renderLoading()}
      {!loading && iconPosition === 'left' && renderIcon()}
      {children}
      {!loading && iconPosition === 'right' && renderIcon()}
    </button>
  );
};

// Pre-configured button components for common use cases
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const IconButton = (props) => <Button variant="icon" {...props} />;

// Icon-specific button components
export const SaveButton = ({ loading, ...props }) => (
  <PrimaryButton icon={Save} iconPosition="left" loading={loading} {...props}>
    Save
  </PrimaryButton>
);

export const CancelButton = (props) => (
  <SecondaryButton {...props}>
    Cancel
  </SecondaryButton>
);

export const DeleteButton = ({ loading, ...props }) => (
  <DangerButton icon={Trash2} iconPosition="left" loading={loading} {...props}>
    Delete
  </DangerButton>
);

export const EditButton = (props) => (
  <SecondaryButton icon={Edit3} iconPosition="left" {...props}>
    Edit
  </SecondaryButton>
);

export const BackButton = (props) => (
  <GhostButton icon={ChevronLeft} iconPosition="left" {...props}>
    Back
  </GhostButton>
);

export const NextButton = (props) => (
  <PrimaryButton icon={ChevronRight} iconPosition="right" {...props}>
    Next
  </PrimaryButton>
);

export const UploadButton = ({ loading, ...props }) => (
  <SecondaryButton icon={Upload} iconPosition="left" loading={loading} {...props}>
    Upload
  </SecondaryButton>
);

export const DownloadButton = (props) => (
  <SecondaryButton icon={Download} iconPosition="left" {...props}>
    Download
  </SecondaryButton>
);

export const AddButton = (props) => (
  <PrimaryButton icon={Plus} iconPosition="left" {...props}>
    Add
  </PrimaryButton>
);

export default Button;
