import React from 'react';

/**
 * PageContainer Component
 * 
 * A wrapper component for page content with consistent padding and max-width.
 * 
 * @component
 * @example
 * ```jsx
 * <PageContainer>
 *   <PageHeader title="Dashboard" />
 *   <div>Page content here</div>
 * </PageContainer>
 * ```
 * 
 * @example With variant
 * ```jsx
 * <PageContainer variant="narrow">
 *   <div>Content with narrow width</div>
 * </PageContainer>
 * ```
 * 
 * @example With header and footer
 * ```jsx
 * <PageContainer
 *   header={<div>Custom header</div>}
 *   footer={<div>Custom footer</div>}
 * >
 *   <div>Content</div>
 * </PageContainer>
 * ```
 */

/**
 * Main PageContainer component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @param {string} [props.variant='default'] - Width variant: 'default', 'narrow', 'wide', 'full'
 * @param {React.ReactNode} [props.header] - Optional header content
 * @param {React.ReactNode} [props.footer] - Optional footer content
 * @param {boolean} [props.scrollable=true] - Whether content area is scrollable
 * @param {string} [props.backgroundColor='bg-gray-50'] - Background color class
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Object} [props.style] - Additional inline styles
 * @param {string} [props.id] - Container ID
 */
export const PageContainer = ({
  children,
  variant = 'default',
  header,
  footer,
  scrollable = true,
  backgroundColor = 'bg-gray-50',
  className = '',
  style = {},
  id,
  ...props
}) => {
  // Width variants
  const variantClasses = {
    default: 'max-w-7xl mx-auto',
    narrow: 'max-w-4xl mx-auto',
    wide: 'max-w-9xl mx-auto',
    full: 'w-full',
  };

  const widthClass = variantClasses[variant] || variantClasses.default;

  return (
    <div
      id={id}
      className={`min-h-screen ${backgroundColor} ${className}`}
      style={style}
      {...props}
    >
      {/* Optional Header */}
      {header && (
        <div className="bg-white border-b border-gray-200">
          <div className={`${widthClass} px-4 sm:px-6 lg:px-8 py-4`}>
            {header}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`
          ${scrollable ? 'overflow-y-auto' : ''}
          ${widthClass}
          px-4 sm:px-6 lg:px-8
          py-6 sm:py-8
        `}
      >
        {children}
      </div>

      {/* Optional Footer */}
      {footer && (
        <div className="bg-white border-t border-gray-200 mt-auto">
          <div className={`${widthClass} px-4 sm:px-6 lg:px-8 py-4`}>
            {footer}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * NarrowPageContainer - Container with narrow width (max-w-4xl)
 * Useful for forms, settings pages, and focused content
 */
export const NarrowPageContainer = ({ children, ...props }) => (
  <PageContainer variant="narrow" {...props}>
    {children}
  </PageContainer>
);

/**
 * WidePageContainer - Container with wide width (max-w-9xl)
 * Useful for dashboards, data tables, and content-rich pages
 */
export const WidePageContainer = ({ children, ...props }) => (
  <PageContainer variant="wide" {...props}>
    {children}
  </PageContainer>
);

/**
 * FullPageContainer - Container with full width
 * Useful for full-screen layouts and specialized pages
 */
export const FullPageContainer = ({ children, ...props }) => (
  <PageContainer variant="full" {...props}>
    {children}
  </PageContainer>
);

/**
 * ContentContainer - Inner content wrapper without page-level styling
 * Useful for nested content areas
 */
export const ContentContainer = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantClasses = {
    default: 'max-w-7xl mx-auto',
    narrow: 'max-w-4xl mx-auto',
    wide: 'max-w-9xl mx-auto',
    full: 'w-full',
  };

  const widthClass = variantClasses[variant] || variantClasses.default;

  return (
    <div
      className={`${widthClass} px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * PageContent - Main content area with proper spacing
 */
export const PageContent = ({ children, className = '', ...props }) => (
  <div className={`py-6 sm:py-8 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * PageSection - Section within a page with spacing
 */
export const PageSection = ({
  children,
  title,
  description,
  className = '',
  ...props
}) => (
  <section className={`mb-8 last:mb-0 ${className}`} {...props}>
    {(title || description) && (
      <div className="mb-4">
        {title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>
    )}
    {children}
  </section>
);

/**
 * PageGrid - Grid layout for page content
 */
export const PageGrid = ({
  children,
  cols = 1,
  gap = 6,
  className = '',
  ...props
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClass = `gap-${gap}`;

  return (
    <div
      className={`grid ${gridCols[cols] || gridCols[1]} ${gapClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * PageSplit - Two-column layout for pages
 */
export const PageSplit = ({
  left,
  right,
  leftWidth = 'w-1/3',
  rightWidth = 'w-2/3',
  className = '',
  ...props
}) => (
  <div className={`flex flex-col lg:flex-row gap-6 ${className}`} {...props}>
    <div className={`${leftWidth}`}>
      {left}
    </div>
    <div className={`${rightWidth}`}>
      {right}
    </div>
  </div>
);

export default PageContainer;
