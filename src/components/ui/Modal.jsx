import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal Component - Reusable modal/dialog component following design system
 * 
 * Features: Close on escape, Close on backdrop click, Animation, Size variants
 */

export const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  footer,
  className = '',
  overlayClassName = '',
  ...props
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  // Size classes with responsive max-width and height
  const sizeClasses = {
    sm: 'max-w-sm max-h-[90vh]',
    md: 'max-w-md max-h-[90vh]',
    lg: 'max-w-lg max-h-[90vh]',
    xl: 'max-w-xl max-h-[90vh]',
    '2xl': 'max-w-2xl max-h-[90vh]',
    '3xl': 'max-w-3xl max-h-[90vh]',
    full: 'max-w-full mx-4 max-h-[90vh]'
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 ${overlayClassName}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} flex flex-col ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all z-10"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Modal Header */}
        {title && (
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4 pr-12 sm:pr-14 flex-shrink-0">
            <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-gray-900">
              {title}
            </h2>
          </div>
        )}

        {/* Modal Body - Scrollable */}
        <div className="px-4 sm:px-6 py-2 sm:py-4 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Modal Header Component
export const ModalHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Modal Body Component
export const ModalBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex-1 overflow-auto ${className}`} {...props}>
      {children}
    </div>
  );
};

// Modal Footer Component
export const ModalFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Pre-configured modal sizes
export const SmallModal = (props) => <Modal size="sm" {...props} />;
export const MediumModal = (props) => <Modal size="md" {...props} />;
export const LargeModal = (props) => <Modal size="lg" {...props} />;
export const ExtraLargeModal = (props) => <Modal size="xl" {...props} />;
export const FullModal = (props) => <Modal size="full" {...props} />;

export default Modal;
