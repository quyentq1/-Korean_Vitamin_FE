import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatusBadge Component
 * Displays course status badges (OPENING, COMING_SOON, CLOSED)
 */
const StatusBadge = ({ status, size = 'md' }) => {
    const getStatusConfig = (status) => {
        const statusMap = {
            'OPENING': {
                label: 'Đang Mở',
                color: 'from-blue-400 to-blue-600',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-700',
                borderColor: 'border-blue-200'
            },
            'COMING_SOON': {
                label: 'Sắp Khai Giảng',
                color: 'from-yellow-400 to-yellow-600',
                bgColor: 'bg-yellow-50',
                textColor: 'text-yellow-700',
                borderColor: 'border-yellow-200'
            },
            'CLOSED': {
                label: 'Đã Đóng',
                color: 'from-gray-400 to-gray-600',
                bgColor: 'bg-gray-50',
                textColor: 'text-gray-700',
                borderColor: 'border-gray-200'
            }
        };
        return statusMap[status] || statusMap['OPENING'];
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1 text-base'
    };

    const config = getStatusConfig(status);

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} border-2 ${sizeClasses[size]}`}
        >
            {config.label}
        </span>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.oneOf(['OPENING', 'COMING_SOON', 'CLOSED']),
    size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default StatusBadge;
