import React from 'react';

/**
 * Spinner Component
 * Loading spinner with different sizes and colors
 */
export const Spinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '', 
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    primary: 'border-primary-400 border-t-transparent',
    secondary: 'border-navy-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
  };

  return (
    <div
      className={`inline-block rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * DotsSpinner Component
 * Three dots bouncing animation
 */
export const DotsSpinner = ({ size = 'md', className = '', ...props }) => {
  const sizeClasses = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`} {...props}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} bg-primary-400 rounded-full animate-bounce`}
          style={{
            animationDelay: `${index * 0.15}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
};

/**
 * PulseSpinner Component
 * Pulsing circle animation
 */
export const PulseSpinner = ({ size = 'md', color = 'primary', className = '', ...props }) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'bg-primary-400',
    secondary: 'bg-navy-500',
    white: 'bg-white',
    gray: 'bg-gray-400',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse ${className}`}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * BarSpinner Component
 * Horizontal loading bar
 */
export const BarSpinner = ({ 
  width = '100%', 
  height = 'h-1', 
  color = 'primary', 
  className = '', 
  ...props 
}) => {
  const colorClasses = {
    primary: 'bg-primary-400',
    secondary: 'bg-navy-500',
    white: 'bg-white',
    gray: 'bg-gray-400',
  };

  return (
    <div
      className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden ${className}`}
      {...props}
    >
      <div
        className={`h-full ${colorClasses[color]} rounded-full animate-shimmer`}
        style={{
          width: '40%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
    </div>
  );
};

/**
 * Skeleton Component
 * Placeholder skeleton for loading content
 */
export const Skeleton = ({ 
  variant = 'rectangular', 
  width = '100%', 
  height = 'h-4', 
  className = '', 
  ...props 
}) => {
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
};

/**
 * SkeletonCard Component
 * Card skeleton with image, title, and content
 */
export const SkeletonCard = ({ className = '', ...props }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`} {...props}>
    {/* Image skeleton */}
    <Skeleton variant="rectangular" width="100%" height="h-48" className="rounded-none" />
    <div className="p-4 space-y-3">
      {/* Title skeleton */}
      <Skeleton variant="text" width="80%" height="h-6" />
      {/* Description skeleton */}
      <Skeleton variant="text" width="100%" height="h-4" />
      <Skeleton variant="text" width="90%" height="h-4" />
      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="circular" width="w-8 h-8" />
        <Skeleton variant="text" width="30%" height="h-4" />
      </div>
    </div>
  </div>
);

/**
 * SkeletonTable Component
 * Table skeleton with header and rows
 */
export const SkeletonTable = ({ 
  rows = 5, 
  columns = 4, 
  className = '', 
  ...props 
}) => (
  <div className={`w-full ${className}`} {...props}>
    {/* Header skeleton */}
    <div className="flex space-x-4 mb-4 pb-2 border-b border-gray-200">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={`header-${index}`} variant="text" width={`${100 / columns}%`} height="h-6" />
      ))}
    </div>
    {/* Row skeletons */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-4 mb-3">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={`cell-${rowIndex}-${colIndex}`} 
            variant="text" 
            width={`${100 / columns}%`} 
            height="h-4" 
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * SkeletonList Component
 * List skeleton with avatar and content
 */
export const SkeletonList = ({ count = 5, className = '', ...props }) => (
  <div className={`space-y-4 ${className}`} {...props}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        {/* Avatar skeleton */}
        <Skeleton variant="circular" width="w-12 h-12" />
        {/* Content skeleton */}
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height="h-4" />
          <Skeleton variant="text" width="40%" height="h-3" />
        </div>
        {/* Action skeleton */}
        <Skeleton variant="rectangular" width="w-20 h-8" />
      </div>
    ))}
  </div>
);

/**
 * LoadingOverlay Component
 * Full page overlay with spinner
 */
export const LoadingOverlay = ({ 
  show = false, 
  message = 'Loading...', 
  spinner = <Spinner size="lg" />,
  className = '', 
  ...props 
}) => {
  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
      role="status"
      aria-label={message}
      {...props}
    >
      <div className="text-center space-y-4">
        {spinner}
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

/**
 * InlineLoading Component
 * Inline loading with spinner and text
 */
export const InlineLoading = ({ 
  message = 'Loading...', 
  spinner = <Spinner size="sm" />,
  className = '', 
  ...props 
}) => (
  <div className={`flex items-center space-x-2 ${className}`} {...props}>
    {spinner}
    <span className="text-sm text-gray-600">{message}</span>
  </div>
);

/**
 * PageLoading Component
 * Full page loading with centered spinner
 */
export const PageLoading = ({ 
  message = 'Loading...', 
  size = 'xl', 
  className = '', 
  ...props 
}) => (
  <div className={`min-h-screen flex items-center justify-center ${className}`} {...props}>
    <div className="text-center space-y-4">
      <Spinner size={size} />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

// Pre-configured spinner exports
export const SmallSpinner = (props) => <Spinner size="sm" {...props} />;
export const MediumSpinner = (props) => <Spinner size="md" {...props} />;
export const LargeSpinner = (props) => <Spinner size="lg" {...props} />;
export const ExtraLargeSpinner = (props) => <Spinner size="xl" {...props} />;

// Add shimmer animation to tailwind config if not present
// Add this to tailwind.config.js keyframes:
// shimmer: {
//   '0%, 100%': { transform: 'translateX(-100%)' },
//   '50%': { transform: 'translateX(100%)' },
// },

// Default export for backward compatibility
export const Loading = ({ 
  message = 'Loading...', 
  size = 'md', 
  className = '', 
  ...props 
}) => (
  <div className={`min-h-screen flex items-center justify-center ${className}`} {...props}>
    <div className="text-center space-y-4">
      <Spinner size={size} />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

// Attach sub-components as properties for backward compatibility
Loading.Spinner = Spinner;
Loading.DotsSpinner = DotsSpinner;
Loading.PulseSpinner = PulseSpinner;
Loading.BarSpinner = BarSpinner;
Loading.Skeleton = Skeleton;
Loading.SkeletonCard = SkeletonCard;
Loading.SkeletonTable = SkeletonTable;
Loading.SkeletonList = SkeletonList;
Loading.LoadingOverlay = LoadingOverlay;
Loading.InlineLoading = InlineLoading;
Loading.PageLoading = PageLoading;
Loading.SmallSpinner = SmallSpinner;
Loading.MediumSpinner = MediumSpinner;
Loading.LargeSpinner = LargeSpinner;
Loading.ExtraLargeSpinner = ExtraLargeSpinner;

export default Loading;
