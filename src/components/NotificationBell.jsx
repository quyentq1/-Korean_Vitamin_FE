import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, ExternalLink, Clock, AlertCircle, Info } from 'lucide-react';
import notificationService from '../services/notificationService';

const NotificationBell = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch notifications on mount
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Refetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            setNotifications(data || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const data = await notificationService.getUnreadCount();
            setUnreadCount(data?.count || 0);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const handleMarkAsRead = async (id, event) => {
        if (event) event.stopPropagation();
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, isRead: true } : notif
                )
            );
            fetchUnreadCount();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        // Mark as read if unread
        if (!notification.isRead) {
            handleMarkAsRead(notification.id, null);
        }

        // Close dropdown
        setIsOpen(false);

        // Navigate using React Router
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'QUESTION_APPROVED':
                return (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                    </div>
                );
            case 'QUESTION_REJECTED':
                return (
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                );
            case 'EXAM_APPROVED':
                return (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                    </div>
                );
            case 'EXAM_REJECTED':
                return (
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                );
        }
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full ring-2 ring-white animate-pulse px-1.5 shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Panel */}
                    <div className="absolute right-0 top-full mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-violet-50 to-purple-50 shrink-0">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Thông báo</h3>
                                {unreadCount > 0 && (
                                    <p className="text-xs text-gray-600 mt-0.5">{unreadCount} thông báo chưa đọc</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs text-violet-600 hover:text-violet-700 font-medium hover:bg-violet-100 px-2 py-1 rounded-lg transition-colors"
                                    >
                                        Đọc tất cả
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-violet-600"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Bell className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">Chưa có thông báo nào</p>
                                    <p className="text-gray-400 text-xs mt-1">Bạn sẽ nhận thông báo khi có cập nhật</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`px-5 py-4 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 cursor-pointer transition-all duration-200 ${
                                                !notification.isRead ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''
                                            }`}
                                        >
                                            <div className="flex gap-4">
                                                {/* Icon */}
                                                <div className="shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <p className={`text-sm font-semibold ${
                                                            !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                                                        }`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                                className="shrink-0 text-violet-600 hover:text-violet-700 hover:bg-violet-100 p-1 rounded-full transition-all"
                                                                title="Đánh dấu đã đọc"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{formatTime(notification.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full text-center text-sm text-gray-600 hover:text-gray-900 font-medium py-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
