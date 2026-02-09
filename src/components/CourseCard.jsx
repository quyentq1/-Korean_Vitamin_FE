import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui';

/**
 * CourseCard Component - Based on Figma Course Card Design
 * Displays course information in a card format
 */
const CourseCard = ({ course }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/courses/${course.id}`);
    };

    // Determine level badge color
    const getLevelBadge = (level) => {
        const levelMap = {
            'BEGINNER': { color: 'beginner', label: 'Beginner' },
            'INTERMEDIATE': { color: 'intermediate', label: 'Intermediate' },
            'ADVANCED': { color: 'advanced', label: 'Advanced' },
        };
        return levelMap[level] || { color: 'neutral', label: level };
    };

    const levelBadge = getLevelBadge(course.level);

    return (
        <div
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
            onClick={handleClick}
        >
            {/* Course Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                {course.imageUrl ? (
                    <img
                        src={course.imageUrl}
                        alt={course.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-6xl text-white/80">📚</span>
                )}

                {/* Level Badge - Top Left */}
                <div className="absolute top-3 left-3">
                    <Badge color={levelBadge.color} size="sm">
                        {levelBadge.label}
                    </Badge>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Course Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.name}
                </h3>

                {/* Course Description */}
                <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
                    {course.description || 'Khóa học tiếng Hàn chất lượng cao với đội ngũ giảng viên giàu kinh nghiệm.'}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    {course.duration && (
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{course.duration} hours</span>
                        </div>
                    )}
                    {course.studentCount !== undefined && (
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>{course.studentCount} students</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary-500">
                            {course.fee ? `${course.fee.toLocaleString()}đ` : 'Free'}
                        </span>
                    </div>
                    <button
                        className="flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors group"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                    >
                        View Details
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

CourseCard.propTypes = {
    course: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        level: PropTypes.string,
        fee: PropTypes.number,
        duration: PropTypes.number,
        studentCount: PropTypes.number,
        imageUrl: PropTypes.string,
    }).isRequired,
};

export default CourseCard;
