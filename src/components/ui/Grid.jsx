import React from 'react';

/**
 * Grid Component
 * 
 * Grid and Flex layout utilities for consistent spacing and alignment.
 * 
 * @component
 * @example
 * ```jsx
 * <Grid cols={3} gap={6}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Grid>
 * ```
 * 
 * @example Flex layout
 * ```jsx
 * <Flex justify="between" align="center">
 *   <div>Left content</div>
 *   <div>Right content</div>
 * </Flex>
 * ```
 * 
 * @example Stack layout
 * ```jsx
 * <Stack gap={4}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Stack>
 * ```
 */

/**
 * Grid component for responsive grid layouts
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Grid items
 * @param {number} [props.cols=1] - Number of columns (1-4)
 * @param {number} [props.gap=4] - Gap between items (Tailwind spacing scale)
 * @param {boolean} [props.responsive=true] - Enable responsive behavior
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Object} [props.style] - Additional inline styles
 * @param {string} [props.id] - Grid ID
 */
export const Grid = ({
  children,
  cols = 1,
  gap = 4,
  responsive = true,
  className = '',
  style = {},
  id,
  ...props
}) => {
  // Column configurations
  const colConfigs = {
    1: responsive ? 'grid-cols-1' : 'grid-cols-1',
    2: responsive 
      ? 'grid-cols-1 md:grid-cols-2' 
      : 'grid-cols-2',
    3: responsive 
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
      : 'grid-cols-3',
    4: responsive 
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
      : 'grid-cols-4',
  };

  const colClass = colConfigs[cols] || colConfigs[1];
  const gapClass = `gap-${gap}`;

  return (
    <div
      id={id}
      className={`grid ${colClass} ${gapClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Flex component for flex layouts
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Flex items
 * @param {string} [props.direction='row'] - Flex direction: 'row', 'col', 'row-reverse', 'col-reverse'
 * @param {string} [props.justify='start'] - Justify content: 'start', 'end', 'center', 'between', 'around', 'evenly'
 * @param {string} [props.align='start'] - Align items: 'start', 'end', 'center', 'stretch', 'baseline'
 * @param {boolean} [props.wrap=false] - Enable flex wrap
 * @param {number} [props.gap=4] - Gap between items (Tailwind spacing scale)
 * @param {boolean} [props.inline=false] - Inline flex
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Object} [props.style] - Additional inline styles
 * @param {string} [props.id] - Flex container ID
 */
export const Flex = ({
  children,
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 4,
  inline = false,
  className = '',
  style = {},
  id,
  ...props
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const gapClass = gap > 0 ? `gap-${gap}` : '';

  return (
    <div
      id={id}
      className={`
        ${inline ? 'inline-flex' : 'flex'}
        ${directionClasses[direction] || directionClasses.row}
        ${justifyClasses[justify] || justifyClasses.start}
        ${alignClasses[align] || alignClasses.start}
        ${wrap ? 'flex-wrap' : 'flex-nowrap'}
        ${gapClass}
        ${className}
      `}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Stack component for vertical stacking
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Stack items
 * @param {number} [props.gap=4] - Gap between items (Tailwind spacing scale)
 * @param {string} [props.align='start'] - Horizontal alignment: 'start', 'center', 'end', 'stretch'
 * @param {boolean} [props.divider=false] - Show dividers between items
 * @param {string} [props.dividerColor='gray-200'] - Divider color
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Object} [props.style] - Additional inline styles
 * @param {string} [props.id] - Stack ID
 */
export const Stack = ({
  children,
  gap = 4,
  align = 'start',
  divider = false,
  dividerColor = 'gray-200',
  className = '',
  style = {},
  id,
  ...props
}) => {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const gapClass = gap > 0 ? `gap-${gap}` : '';
  const dividerClass = `border-b border-${dividerColor}`;

  return (
    <div
      id={id}
      className={`flex flex-col ${alignClasses[align] || alignClasses.start} ${gapClass} ${className}`}
      style={style}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <React.Fragment key={index}>
          {child}
          {divider && index < React.Children.count(children) - 1 && (
            <div className={`my-${gap / 2} ${dividerClass}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * Spacer component for adding space
 * 
 * @param {Object} props
 * @param {number} [props.size=4] - Space size (Tailwind spacing scale)
 * @param {string} [props.direction='vertical'] - Direction: 'vertical', 'horizontal'
 * @param {boolean} [props.flex=false] - Use flex to fill remaining space
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Object} [props.style] - Additional inline styles
 */
export const Spacer = ({ size = 4, direction = 'vertical', flex = false, className = '', style = {}, ...props }) => {
  const sizeClass = `m-${direction === 'vertical' ? 'y' : 'x'}-${size}`;
  
  if (flex) {
    return <div className={`flex-1 ${className}`} style={style} {...props} />;
  }

  return <div className={`${sizeClass} ${className}`} style={style} {...props} />;
};

/**
 * Container component for content wrapping
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Container content
 * @param {string} [props.size='md'] - Container size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} [props.centered=false] - Center content horizontally
 * @param {boolean} [props.padded=true] - Add padding
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Object} [props.style] - Additional inline styles
 * @param {string} [props.id] - Container ID
 */
export const Container = ({
  children,
  size = 'md',
  centered = false,
  padded = true,
  className = '',
  style = {},
  id,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const centeredClass = centered ? 'mx-auto' : '';
  const paddedClass = padded ? 'px-4 sm:px-6 lg:px-8' : '';

  return (
    <div
      id={id}
      className={`${sizeClass} ${centeredClass} ${paddedClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Row component for horizontal layout
 */
export const Row = ({ children, gap = 4, align = 'center', className = '', ...props }) => (
  <Flex direction="row" gap={gap} align={align} className={className} {...props}>
    {children}
  </Flex>
);

/**
 * Column component for vertical layout
 */
export const Column = ({ children, gap = 4, align = 'start', className = '', ...props }) => (
  <Flex direction="col" gap={gap} align={align} className={className} {...props}>
    {children}
  </Flex>
);

/**
 * Center component for centering content
 */
export const Center = ({ children, both = false, className = '', ...props }) => (
  <Flex
    justify="center"
    align={both ? 'center' : 'start'}
    className={className}
    {...props}
  >
    {children}
  </Flex>
);

/**
 * Between component for space-between layout
 */
export const Between = ({ children, className = '', ...props }) => (
  <Flex justify="between" align="center" className={className} {...props}>
    {children}
  </Flex>
);

/**
 * Grid2Cols - 2 column grid
 */
export const Grid2Cols = ({ children, gap = 6, className = '', ...props }) => (
  <Grid cols={2} gap={gap} className={className} {...props}>
    {children}
  </Grid>
);

/**
 * Grid3Cols - 3 column grid
 */
export const Grid3Cols = ({ children, gap = 6, className = '', ...props }) => (
  <Grid cols={3} gap={gap} className={className} {...props}>
    {children}
  </Grid>
);

/**
 * Grid4Cols - 4 column grid
 */
export const Grid4Cols = ({ children, gap = 6, className = '', ...props }) => (
  <Grid cols={4} gap={gap} className={className} {...props}>
    {children}
  </Grid>
);

/**
 * GridAuto - Auto-fit grid
 */
export const GridAuto = ({ 
  children, 
  minColWidth = 250, 
  gap = 6, 
  className = '', 
  ...props 
}) => (
  <div
    className={`grid gap-${gap} ${className}`}
    style={{ 
      gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}px, 1fr))` 
    }}
    {...props}
  >
    {children}
  </div>
);

/**
 * Wrap component for wrapping flex items
 */
export const Wrap = ({ children, gap = 4, justify = 'start', className = '', ...props }) => (
  <Flex wrap gap={gap} justify={justify} className={className} {...props}>
    {children}
  </Flex>
);

/**
 * VSpace - Vertical space
 */
export const VSpace = ({ size = 4, className = '', ...props }) => (
  <Spacer size={size} direction="vertical" className={className} {...props} />
);

/**
 * HSpace - Horizontal space
 */
export const HSpace = ({ size = 4, className = '', ...props }) => (
  <Spacer size={size} direction="horizontal" className={className} {...props} />
);

/**
 * FlexGrow - Flex item that grows
 */
export const FlexGrow = ({ children, className = '', ...props }) => (
  <div className={`flex-1 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * FlexShrink - Flex item that doesn't shrink
 */
export const FlexShrink = ({ children, className = '', ...props }) => (
  <div className={`flex-shrink-0 ${className}`} {...props}>
    {children}
  </div>
);

export default Grid;
