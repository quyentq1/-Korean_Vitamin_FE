import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Mail, Phone, Lock, Calendar, AlertCircle } from 'lucide-react';

/**
 * Input Component - Reusable input components following design system
 * 
 * Variants: text, email, phone, password, select, textarea, date
 * Features: Label, error message, icon, helper text, disabled state
 */

export const Input = forwardRef(({ 
  type = 'text',
  label,
  placeholder,
  error,
  icon: Icon,
  helperText,
  disabled = false,
  className = '',
  id,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  required = false,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Calculate padding based on icon and password toggle
  const hasLeftIcon = !!Icon;
  const isPasswordInput = type === 'password';
  const hasRightIcon = isPasswordInput;
  
  // Dynamic padding classes to prevent icon overlap
  const paddingLeft = hasLeftIcon ? 'pl-10' : 'pl-4';
  const paddingRight = hasRightIcon ? 'pr-10' : 'pr-4';
  
  const baseClasses = `w-full border rounded-lg ${paddingLeft} ${paddingRight} py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75 disabled:bg-gray-100 disabled:border-gray-200`;
  
  const stateClasses = {
    default: 'border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:ring-primary-200',
    error: 'border-error-500 bg-error-50 text-error-700 placeholder:text-error-400 focus:border-error-500 focus:ring-error-200',
    focused: 'border-primary-400 ring-2 ring-primary-200'
  };
  
  const inputType = type || 'text';
  const hasError = !!error;
  const isFocusedState = isFocused;
  
  // Password toggle logic
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label 
          htmlFor={id || name}
          className={`block text-sm font-medium text-gray-700 mb-2 ${required ? 'after:content-[\"*\"]' : ''}`}
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>
      )}
      
      <input
        ref={ref}
        type={isPasswordInput && !showPassword ? 'password' : type}
        id={id || name}
        name={name}
        value={value}
        onChange={(e) => {
          onChange && onChange(e);
        }}
        onFocus={() => {
          setIsFocused(true);
          onFocus && onFocus();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur && onBlur();
        }}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={`${baseClasses} ${hasError ? stateClasses.error : isFocusedState ? stateClasses.focused : stateClasses.default}`}
        {...props}
      />
      
      {helperText && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-error-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </p>
      )}
      
      {isPasswordInput && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
});

// Pre-configured input components
export const TextInput = (props) => <Input type="text" {...props} />;
export const EmailInput = (props) => <Input type="email" icon={Mail} {...props} />;
export const PhoneInput = (props) => <Input type="tel" icon={Phone} {...props} />;
export const PasswordInput = ({ 
  showPassword: externalShowPassword, 
  onTogglePassword: externalOnTogglePassword, 
  icon: Icon,
  label,
  placeholder,
  error,
  disabled = false,
  className = '',
  id,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  required = false,
  ...props 
}) => {
  const [internalShowPassword, setInternalShowPassword] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const showPassword = externalShowPassword !== undefined ? externalShowPassword : internalShowPassword;
  const togglePassword = externalOnTogglePassword || (() => setInternalShowPassword(!internalShowPassword));
  
  const [isFocused, setIsFocused] = useState(false);
  
  // Calculate padding based on icon and password toggle
  const hasLeftIcon = !!Icon;
  const hasRightIcon = true; // Password input always has toggle button
  
  // Dynamic padding classes to prevent icon overlap
  const paddingLeft = hasLeftIcon ? 'pl-10' : 'pl-4';
  const paddingRight = 'pr-10'; // Always have password toggle
  
  const baseClasses = `w-full border rounded-lg ${paddingLeft} ${paddingRight} py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75 disabled:bg-gray-100 disabled:border-gray-200`;
  
  const stateClasses = {
    default: 'border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:ring-primary-200',
    error: 'border-error-500 bg-error-50 text-error-700 placeholder:text-error-400 focus:border-error-500 focus:ring-error-200',
    focused: 'border-primary-400 ring-2 ring-primary-200'
  };
  
  const hasError = !!error;
  const isFocusedState = isFocused;
  
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label 
          htmlFor={id || name}
          className={`block text-sm font-medium text-gray-700 mb-2 ${required ? 'after:content-[\"*\"]' : ''}`}
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>
      )}
      
      <input
        type={showPassword ? 'text' : 'password'}
        id={id || name}
        name={name}
        value={value}
        onChange={(e) => {
          onChange && onChange(e);
        }}
        onFocus={() => {
          setIsFocused(true);
          onFocus && onFocus();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur && onBlur();
        }}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={`${baseClasses} ${hasError ? stateClasses.error : isFocusedState ? stateClasses.focused : stateClasses.default}`}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-error-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </p>
      )}
      
      <button
        type="button"
        onClick={togglePassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
};
export const SelectInput = ({
  label,
  options = [],
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:border-primary-400 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 disabled:bg-gray-100 disabled:border-gray-200 ${disabled ? '' : 'bg-white'} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const TextareaInput = ({
  label,
  placeholder,
  rows = 4,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-offset-2 focus:outline-none resize-none disabled:cursor-not-allowed disabled:opacity-75 disabled:bg-gray-100 disabled:border-gray-200 ${error ? 'border-error-500 bg-error-50' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-600">
          {error}
        </p>
      )}
    </div>
  );
};

export const DateInput = ({
  label,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type="date"
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:border-primary-400 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 disabled:bg-gray-100 disabled:border-gray-200 ${error ? 'border-error-500 bg-error-50' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
