import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * PageHeader Component
 * 
 * A header component for pages with title, subtitle, breadcrumbs, and actions.
 * 
 * @component
 * @example
 * ```jsx
 * <PageHeader
 *   title="Page Title"
 *   subtitle="Page description"
 *   breadcrumbs={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Current Page' }
 *   ]}
 *   actions={<Button>Action</Button>}
 * />
 * ```
 */

export const PageHeader = ({
    title,
    subtitle,
    breadcrumbs = [],
    actions,
    children,
    className = '',
    ...props
}) => {
    return (
        <div className={`mb-6 ${className}`} {...props}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 mb-3 text-sm" aria-label="Breadcrumb">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            {crumb.href ? (
                                <a
                                    href={crumb.href}
                                    className="text-gray-500 hover:text-primary-600 transition-colors"
                                >
                                    {crumb.label}
                                </a>
                            ) : (
                                <span className="text-gray-900 font-medium">
                                    {crumb.label}
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            {/* Header Content */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Title and Subtitle */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-gray-600">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Actions */}
                {(actions || children) && (
                    <div className="flex-shrink-0">
                        {actions}
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export const PageActions = ({ children, className = '' }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        {children}
    </div>
);

export const PageTitle = ({ children, className = '' }) => (
    <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 mb-1 ${className}`}>
        {children}
    </h1>
);

export const Breadcrumb = ({ items }) => (
    <nav className="flex items-center gap-2 mb-3 text-sm" aria-label="Breadcrumb">
        {items.map((crumb, index) => (
            <React.Fragment key={index}>
                {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                {crumb.href ? (
                    <a
                        href={crumb.href}
                        className="text-gray-500 hover:text-primary-600 transition-colors"
                    >
                        {crumb.label}
                    </a>
                ) : (
                    <span className="text-gray-900 font-medium">
                        {crumb.label}
                    </span>
                )}
            </React.Fragment>
        ))}
    </nav>
);

export default PageHeader;
