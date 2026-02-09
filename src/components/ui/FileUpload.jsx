import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, Music, File } from 'lucide-react';

/**
 * FileUpload Component
 * Comprehensive file upload with drag and drop support
 */
export const FileUpload = ({
  onFilesChange,
  accept = '*',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  disabled = false,
  showPreview = true,
  className = '',
  ...props
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const inputRef = useRef(null);

  const validateFile = useCallback((file) => {
    const newErrors = [];
    
    // Check file size
    if (file.size > maxSize) {
      newErrors.push(`${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`);
    }
    
    // Check file type
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type || getFileExtension(file.name);
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileType === type;
        }
        return file.type === type || file.type.startsWith(type);
      });
      
      if (!isAccepted) {
        newErrors.push(`${file.name} is not a valid file type`);
      }
    }
    
    return newErrors;
  }, [accept, maxSize]);

  const handleFiles = useCallback((newFiles) => {
    const validFiles = [];
    const newErrors = [];
    
    for (const file of newFiles) {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        newErrors.push(...fileErrors);
      }
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
    } else {
      setErrors([]);
    }
    
    const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
    const limitedFiles = updatedFiles.slice(0, maxFiles);
    
    setFiles(limitedFiles);
    if (onFilesChange) {
      onFilesChange(limitedFiles);
    }
  }, [files, multiple, maxFiles, validateFile, onFilesChange]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [disabled, handleFiles]);

  const handleInputChange = useCallback((e) => {
    if (disabled) return;
    
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
    
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [disabled, handleFiles]);

  const handleRemoveFile = useCallback((index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (onFilesChange) {
      onFilesChange(updatedFiles);
    }
  }, [files, onFilesChange]);

  const handleClick = useCallback(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className={`w-12 h-12 ${dragActive ? 'text-primary-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-lg font-medium text-gray-700">
              {dragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500">
              or <span className="text-primary-500">browse</span> to choose files
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Max {maxFiles} file{maxFiles > 1 ? 's' : ''}, {formatFileSize(maxSize)} each
          </p>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm text-error-600">
              <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File Preview */}
      {showPreview && files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Selected Files ({files.length})
          </h4>
          <FileList files={files} onRemove={handleRemoveFile} />
        </div>
      )}
    </div>
  );
};

/**
 * FileDropzone Component
 * Standalone drag and drop zone
 */
export const FileDropzone = ({
  onDrop,
  accept = '*',
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
  disabled = false,
  className = '',
  ...props
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (onDrop) {
      onDrop(droppedFiles);
    }
  }, [disabled, onDrop]);

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center transition-colors
        ${dragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      <Upload className={`mx-auto w-16 h-16 ${dragActive ? 'text-primary-500' : 'text-gray-400'}`} />
      <p className="mt-4 text-lg font-medium text-gray-700">
        {dragActive ? 'Drop files here' : 'Drag & drop files here'}
      </p>
      <p className="text-sm text-gray-500">
        Max {maxFiles} file{maxFiles > 1 ? 's' : ''}, {formatFileSize(maxSize)} each
      </p>
    </div>
  );
};

/**
 * FilePreview Component
 * Individual file preview with remove button
 */
export const FilePreview = ({
  file,
  onRemove,
  className = '',
  ...props
}) => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.onerror = () => setError(true);
      reader.readAsDataURL(file);
    }
  }, [file]);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (file.type.startsWith('audio/')) return <Music className="w-8 h-8" />;
    if (file.type.startsWith('text/') || file.type.includes('document')) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  return (
    <div className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${className}`} {...props}>
      <div className="flex items-center space-x-3">
        {preview && !error ? (
          <img
            src={preview}
            alt={file.name}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center bg-white rounded border border-gray-200">
            {getFileIcon()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        </div>
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(file)}
          className="p-1.5 text-gray-400 hover:text-error-600 transition-colors"
          title="Remove file"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

/**
 * FileList Component
 * List of uploaded files with previews
 */
export const FileList = ({
  files = [],
  onRemove,
  className = '',
  ...props
}) => {
  if (files.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {files.map((file, index) => (
        <FilePreview
          key={index}
          file={file}
          onRemove={() => onRemove && onRemove(index)}
        />
      ))}
    </div>
  );
};

/**
 * ImageUpload Component
 * Specialized upload for images with preview
 */
export const ImageUpload = ({
  onImageChange,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  disabled = false,
  previewSize = 'w-32 h-32',
  className = '',
  ...props
}) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`Image size must be less than ${formatFileSize(maxSize)}`);
      return;
    }

    setError(null);
    setImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    if (onImageChange) {
      onImageChange(file);
    }
  }, [maxSize, onImageChange]);

  const handleRemove = useCallback(() => {
    setImage(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onImageChange) {
      onImageChange(null);
    }
  }, [onImageChange]);

  const handleClick = useCallback(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className={`w-full ${className}`} {...props}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleImageChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Preview Area */}
      <div
        onClick={handleClick}
        className={`
          relative ${previewSize} border-2 border-dashed rounded-lg flex items-center justify-center
          cursor-pointer transition-colors overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400'}
        `}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                title="Remove image"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </>
        ) : (
          <div className="text-center space-y-2">
            <Upload className="mx-auto w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-500">Click to upload image</p>
            <p className="text-xs text-gray-400">Max {formatFileSize(maxSize)}</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
};

/**
 * FileProgress Component
 * File upload with progress indicator
 */
export const FileProgress = ({
  file,
  progress = 0,
  error = null,
  onCancel,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-3 bg-gray-50 rounded-lg ${className}`} {...props}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <FileText className="w-8 h-8 text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-error-600 transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            error ? 'bg-error-500' : 'bg-primary-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status */}
      <p className="mt-2 text-xs text-gray-600">
        {error ? error : `${progress}% uploaded`}
      </p>
    </div>
  );
};

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Default export for backward compatibility
export default FileUpload;
