import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * Section Component
 * 
 * A section component for grouping related content with optional title and actions.
 * 
 * @component
 * @example
 * ```jsx
 * <Section title="Personal Information">
 *   <div>Content here</div>
 * </Section>
 * ```
 * 
 * @example With description and actions
 * ```jsx
 * <Section
 *   title="Account Settings"
 *   description="Manage your account preferences"
 *   actions={<Button>Save</Button>}
 * >
 *   <div>Content here</div>
 * </Section>
 * ```
 * 
 * @example Collapsible section
 * ```jsx
 * <Section title="Advanced Settings" collapsible defaultExpanded={false}>
 *   <div>Content here</div>
 * </Section>
 * ```
 * 
 * @example With variant
 * ```jsx
 * <Section title="Section" variant="card">
 *   <div>Content here</div>
 * </Section>
 * ```
 */

/**
 * Main Section component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @param {string} [props.title] - Section title
 * @param {string} [props.description] - Section description
 * @param {React.ReactNode} [props.actions] - Action buttons/elements
 * @param {string} [props.variant='default'] - Section variant: 'default', 'bordered', 'card', 'transparent'
 * @param {boolean} [props.collapsible=false] - Whether section is collapsible
 * @param {boolean} [props.defaultExpanded=true] - Default expanded state for collapsible sections
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Object} [props.style] - Additional inline styles
 * @param {string} [props.id] - Section ID
 * @param {boolean} [props.divider=true] - Show divider after section
 * @param {string} [props.padding='default'] - Padding: 'none', 'sm', 'default', 'lg'
 * @param {boolean} [props.loading=false] - Show loading state
 * @param {string} [props.status] - Status: 'info', 'warning', 'success', 'error'
 * @param {React.ReactNode} [props.icon] - Custom icon for section header
 */
export const Section = ({
  children,
  title,
  description,
  actions,
  variant = 'default',
  collapsible = false,
  defaultExpanded = true,
  className = '',
  style = {},
  id,
  divider = true,
  padding = 'default',
  loading = false,
  status,
  icon: Icon,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Variant styles
  const variantClasses = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200 rounded-lg',
    card: 'bg-white rounded-lg shadow-md',
    transparent: 'bg-transparent',
  };

  // Padding styles
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  // Status icons
  const statusIcons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: XCircle,
  };

  const statusColors = {
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    success: 'text-green-500',
    error: 'text-red-500',
  };

  const StatusIcon = status ? statusIcons[status] : Icon;
  const statusColor = status ? statusColors[status] : 'text-gray-500';

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section
      id={id}
      className={`
        ${variantClasses[variant] || variantClasses.default}
        ${paddingClasses[padding] || paddingClasses.default}
        ${divider && !collapsible ? 'mb-6' : ''}
        ${className}
      `}
      style={style}
      {...props}
    >
      {/* Section Header */}
      {(title || description || actions || collapsible) && (
        <div className={`flex items-start justify-between gap-4 ${padding !== 'none' ? 'mb-4' : ''}`}>
          <div className="flex-1">
            {/* Title with icon and collapsible toggle */}
            <div className="flex items-center gap-2">
              {StatusIcon && (
                React.isValidElement(StatusIcon) ? StatusIcon : <StatusIcon className={`w-5 h-5 ${statusColor}`} />
              )}
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {collapsible && (
                <button
                  onClick={handleToggle}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-600 mt-1">
                {description}
              </p>
            )}
          </div>
          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Section Content */}
      {(!collapsible || isExpanded) && (
        <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            children
          )}
        </div>
      )}

      {/* Divider */}
      {divider && !collapsible && (
        <div className="mt-6 border-t border-gray-200"></div>
      )}
    </section>
  );
};

/**
 * CollapsibleSection - Pre-configured collapsible section
 */
export const CollapsibleSection = ({ children, defaultExpanded = true, ...props }) => (
  <Section collapsible defaultExpanded={defaultExpanded} {...props}>
    {children}
  </Section>
);

/**
 * CardSection - Section with card variant
 */
export const CardSection = ({ children, ...props }) => (
  <Section variant="card" {...props}>
    {children}
  </Section>
);

/**
 * BorderedSection - Section with bordered variant
 */
export const BorderedSection = ({ children, ...props }) => (
  <Section variant="bordered" {...props}>
    {children}
  </Section>
);

/**
 * InfoSection - Section with info status
 */
export const InfoSection = ({ children, ...props }) => (
  <Section status="info" {...props}>
    {children}
  </Section>
);

/**
 * WarningSection - Section with warning status
 */
export const WarningSection = ({ children, ...props }) => (
  <Section status="warning" {...props}>
    {children}
  </Section>
);

/**
 * SuccessSection - Section with success status
 */
export const SuccessSection = ({ children, ...props }) => (
  <Section status="success" {...props}>
    {children}
  </Section>
);

/**
 * ErrorSection - Section with error status
 */
export const ErrorSection = ({ children, ...props }) => (
  <Section status="error" {...props}>
    {children}
  </Section>
);

/**
 * SectionGroup - Group multiple sections together
 */
export const SectionGroup = ({ children, className = '', ...props }) => (
  <div className={`space-y-6 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * SectionTabs - Tabbed sections
 */
export const SectionTabs = ({ tabs, activeTab, onChangeTab, className = '', ...props }) => (
  <div className={className} {...props}>
    {/* Tab Navigation */}
    <div className="border-b border-gray-200 mb-4">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>

    {/* Tab Content */}
    {tabs.map((tab) => (
      <div
        key={tab.id}
        className={activeTab === tab.id ? '' : 'hidden'}
        role="tabpanel"
        aria-labelledby={`tab-${tab.id}`}
      >
        {tab.content}
      </div>
    ))}
  </div>
);

/**
 * SectionList - List of items within a section
 */
export const SectionList = ({ items, className = '', ...props }) => (
  <ul className={`divide-y divide-gray-200 ${className}`} {...props}>
    {items.map((item, index) => (
      <li key={index} className="py-3">
        {item}
      </li>
    ))}
  </ul>
);

/**
 * SectionGrid - Grid layout within a section
 */
export const SectionGrid = ({
  children,
  cols = 2,
  gap = 4,
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
      className={`grid ${gridCols[cols] || gridCols[2]} ${gapClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * SectionActions - Action buttons container for sections
 */
export const SectionActions = ({ children, align = 'right', className = '', ...props }) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={`flex items-center gap-2 ${alignClasses[align] || alignClasses.right} ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * SectionFooter - Footer area within a section
 */
export const SectionFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-6 pt-4 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * SectionEmpty - Empty state for sections
 */
export const SectionEmpty = ({
  icon: Icon = AlertCircle,
  title = 'No data available',
  description = 'There is no content to display at this time.',
  action = null,
  className = '',
  ...props
}) => (
  <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`} {...props}>
    <div className="mb-4">
      {React.isValidElement(Icon) ? Icon : <Icon className="w-12 h-12 text-gray-400" />}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-500 mb-4 max-w-sm">
      {description}
    </p>
    {action && (
      <div>
        {action}
      </div>
    )}
  </div>
);

export default Section;
