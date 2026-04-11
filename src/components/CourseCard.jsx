import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui';
import StatusBadge from './ui/StatusBadge';

/**
 * CourseCard Component - Based on Figma Course Card Design
 * Displays course information in a card format
 */
const CourseCard = ({ course, onConsultationClick, status }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/courses/${course.id}`);
    };

    const handleConsultationClick = (e) => {
        e.stopPropagation();
        if (onConsultationClick) {
            onConsultationClick(course);
        }
    };

    // Determine level badge color
    const getLevelBadge = (level) => {
        const levelMap = {
            'BEGINNER': { color: 'beginner', label: 'Beginner' },
            'INTERMEDIATE': { color: 'intermediate', label: 'Intermediate' },
            'ADVANCED': { color: 'advanced', label: 'Advanced' },
        };
        return levelMap[level] || { color: 'neutral', label: level || 'Beginner' };
    };

    const levelBadge = getLevelBadge(course.level);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Calculate available slots
    const availableSlots = course.capacity !== undefined && course.enrolledCount !== undefined
        ? course.capacity - course.enrolledCount
        : null;

    return (
        <div
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
            onClick={handleClick}
        >
            {/* Course Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                {course.thumbnailUrl ? (
                    <img
                        src={course.thumbnailUrl}
                        alt={course.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-6xl text-white/80">📚</span>
                )}

                {/* Status Badge - Top Right */}
                {status && (
                    <div className="absolute top-3 right-3">
                        <StatusBadge status={status} size="sm" />
                    </div>
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
                            <span>{course.duration} giờ</span>
                        </div>
                    )}
                    {course.schedule && (
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{course.schedule}</span>
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
                    <div className="flex gap-2">
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
                        <button
                            onClick={handleConsultationClick}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                        >
                            <span className="text-xl">💬</span>
                            <span className="hidden sm:inline">Nhận Tư Vấn Ngay</span>
                        </button>
                    </div>
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
        enrolledCount: PropTypes.number,
        capacity: PropTypes.number,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        imageUrl: PropTypes.string,
        status: PropTypes.oneOf(['OPENING', 'COMING_SOON', 'CLOSED']),
    }).isRequired,
    onConsultationClick: PropTypes.func,
};

export default CourseCard;
