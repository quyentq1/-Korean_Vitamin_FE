import React from 'react';
import { BookOpen, Clock, Users, TrendingUp, Star } from 'lucide-react';

/**
 * Card Component - Reusable card components following design system
 * 
 * Variants: Basic, Course, Stats
 * Features: Hover effects, Shadow, Border radius
 */

export const Card = ({
  children,
  className = '',
  hover = false,
  shadow = 'default',
  ...props
}) => {
  const shadowClasses = {
    sm: 'shadow-sm',
    default: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    teal: 'shadow-teal',
    'teal-lg': 'shadow-teal-lg',
    none: 'shadow-none'
  };

  return (
    <div
      className={`bg-white rounded-2xl ${shadowClasses[shadow]} ${hover ? 'hover:shadow-xl transition-shadow duration-300' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Course Card Component
export const CourseCard = ({
  title,
  description,
  level,
  duration,
  price,
  image,
  teacher,
  rating,
  students,
  onClick,
  className = '',
  ...props
}) => {
  const levelColors = {
    beginner: 'bg-badge-beginner bg text-badge-beginner-text',
    intermediate: 'bg-badge-intermediate bg text-badge-intermediate-text',
    advanced: 'bg-badge-advanced bg text-badge-advanced-text'
  };

  return (
    <Card
      hover={true}
      className={`cursor-pointer overflow-hidden ${className}`}
      onClick={onClick}
      {...props}
    >
      {/* Course Image */}
      {image && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          {/* Level Badge */}
          {level && (
            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${levelColors[level] || levelColors.beginner}`}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
          )}
          {/* Rating Badge */}
          {rating && (
            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-gray-900 flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {rating}
            </span>
          )}
        </div>
      )}

      {/* Course Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {title}
        </h3>
        
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Course Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {duration}
            </span>
          )}
          {students && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {students}
            </span>
          )}
        </div>

        {/* Teacher Info */}
        {teacher && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
              {teacher.charAt(0)}
            </div>
            <span className="text-sm text-gray-700">{teacher}</span>
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          {price && (
            <span className="text-xl font-bold text-primary-600">
              {price}
            </span>
          )}
          <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">
            Xem chi tiết
          </button>
        </div>
      </div>
    </Card>
  );
};

// Stats Card Component
export const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary',
  className = '',
  ...props
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-gray-50 text-gray-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
    info: 'bg-info-50 text-info-600'
  };

  const isPositive = change >= 0;

  return (
    <Card className={`p-6 ${className}`} {...props}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900">
            {value}
          </h3>
          {change !== undefined && (
            <p className={`text-sm font-medium mt-2 flex items-center gap-1 ${isPositive ? 'text-success-600' : 'text-error-600'}`}>
              <TrendingUp className={`w-4 h-4 ${isPositive ? '' : 'rotate-180'}`} />
              {Math.abs(change)}% {isPositive ? 'tăng' : 'giảm'}
            </p>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            {React.isValidElement(Icon) ? Icon : <Icon className="w-6 h-6" />}
          </div>
        )}
      </div>
    </Card>
  );
};

// Basic Card Component
export const BasicCard = ({
  title,
  children,
  className = '',
  ...props
}) => {
  return (
    <Card className={`p-6 ${className}`} {...props}>
      {title && (
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      <div className="text-gray-700">
        {children}
      </div>
    </Card>
  );
};

export default Card;
