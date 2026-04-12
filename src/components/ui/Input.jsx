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
  
  const hasLeftIcon = !!Icon;
  const isPasswordInput = type === 'password';
  
  const paddingLeft = hasLeftIcon ? 'pl-10' : 'pl-4';
  const paddingRight = isPasswordInput ? 'pr-10' : 'pr-4';
  
  const baseClasses = `w-full border rounded-lg ${paddingLeft} ${paddingRight} py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75 disabled:bg-gray-100 disabled:border-gray-200`;
  
  const stateClasses = {
    default: 'border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:ring-primary-200',
    error: 'border-error-500 bg-error-50 text-error-700 placeholder:text-error-400 focus:border-error-500 focus:ring-error-200',
    focused: 'border-primary-400 ring-2 ring-primary-200'
  };
  
  const hasError = !!error;
  
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={id || name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Wrapper riêng cho input + icons */}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 inset-y-0 flex items-center text-gray-400 z-10 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          ref={ref}
          type={isPasswordInput && !showPassword ? 'password' : type}
          id={id || name}
          name={name}
          value={value}
          onChange={(e) => onChange && onChange(e)}
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
          className={`${baseClasses} ${hasError ? stateClasses.error : isFocused ? stateClasses.focused : stateClasses.default}`}
          {...props}
        />
        
        {isPasswordInput && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 inset-y-0 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      
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
  const [isFocused, setIsFocused] = useState(false);
  
  const showPassword = externalShowPassword !== undefined ? externalShowPassword : internalShowPassword;
  const togglePassword = externalOnTogglePassword || (() => setInternalShowPassword(!internalShowPassword));
  
  const hasLeftIcon = !!Icon;
  const paddingLeft = hasLeftIcon ? 'pl-10' : 'pl-4';
  
  const baseClasses = `w-full border rounded-lg ${paddingLeft} pr-10 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75 disabled:bg-gray-100 disabled:border-gray-200`;
  
  const stateClasses = {
    default: 'border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:ring-primary-200',
    error: 'border-error-500 bg-error-50 text-error-700 placeholder:text-error-400 focus:border-error-500 focus:ring-error-200',
    focused: 'border-primary-400 ring-2 ring-primary-200'
  };
  
  const hasError = !!error;
  
  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={id || name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Wrapper riêng cho input + icons */}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 inset-y-0 flex items-center text-gray-400 z-10 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          type={showPassword ? 'text' : 'password'}
          id={id || name}
          name={name}
          value={value}
          onChange={(e) => onChange && onChange(e)}
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
          className={`${baseClasses} ${hasError ? stateClasses.error : isFocused ? stateClasses.focused : stateClasses.default}`}
          {...props}
        />
        
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 inset-y-0 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </p>
      )}
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