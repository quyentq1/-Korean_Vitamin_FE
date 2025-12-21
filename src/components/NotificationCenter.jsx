import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const NotificationCenter = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'class', title: t('notif.classReminder', 'Nhắc nhở lớp học'), message: 'Lớp Grammar Advanced bắt đầu lúc 14:00', time: '10 phút trước', unread: true },
        { id: 2, type: 'grade', title: t('notif.graded', 'Bài đã được chấm'), message: 'Essay của bạn đã được chấm: 85%', time: '1 giờ trước', unread: true },
        { id: 3, type: 'message', title: t('notif.newMessage', 'Tin nhắn mới'), message: 'Teacher Park đã trả lời câu hỏi của bạn', time: '2 giờ trước', unread: false }
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, unread: false } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'class': return '📚';
            case 'grade': return '✅';
            case 'message': return '💬';
            default: return '🔔';
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition"
            >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border overflow-hidden z-50 animate-slide-down">
                    {/* Header */}
                    <div className="p-4 border-b bg-gradient-to-r from-primary-50 to-blue-50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-lg">
                                {t('notif.title', 'Thông Báo')}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    {t('notif.markAllRead', 'Đánh dấu đã đọc')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="text-5xl mb-2">🔔</div>
                                <p>{t('notif.empty', 'Không có thông báo mới')}</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => markAsRead(notif.id)}
                                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${notif.unread ? 'bg-blue-50/50' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="text-3xl">{getIcon(notif.type)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="font-bold text-gray-900">{notif.title}</h4>
                                                {notif.unread && (
                                                    <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{notif.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t bg-gray-50 text-center">
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            {t('notif.viewAll', 'Xem tất cả thông báo')} →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
