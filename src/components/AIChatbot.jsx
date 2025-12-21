import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AIChatbot = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: t('chatbot.welcome', 'Xin chào! Tôi có thể giúp gì cho bạn?') }
    ]);
    const [input, setInput] = useState('');

    const quickActions = [
        { id: 1, text: t('chatbot.q1', 'Thông tin khóa học'), icon: '📚' },
        { id: 2, text: t('chatbot.q2', 'Lịch học của tôi'), icon: '📅' },
        { id: 3, text: t('chatbot.q3', 'Học phí'), icon: '💰' },
        { id: 4, text: t('chatbot.q4', 'Liên hệ tư vấn'), icon: '📞' }
    ];

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages([...messages, { type: 'user', text: input }]);

        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: t('chatbot.response', 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ trả lời ngay.')
            }]);
        }, 1000);

        setInput('');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                                    🤖
                                </div>
                                <div>
                                    <div className="font-bold">{t('chatbot.title', 'AI Hỗ Trợ')}</div>
                                    <div className="text-xs opacity-90">{t('chatbot.online', 'Đang hoạt động')}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 rounded-lg p-1 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.type === 'user'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-white text-gray-800 shadow'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Quick Actions */}
                        {messages.length === 1 && (
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => setInput(action.text)}
                                        className="px-3 py-2 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition text-sm font-medium text-gray-700 flex items-center gap-2"
                                    >
                                        <span>{action.icon}</span>
                                        <span>{action.text}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={t('chatbot.placeholder', 'Nhập tin nhắn...')}
                                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                            />
                            <button
                                onClick={handleSend}
                                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-2xl hover:shadow-xl transition-all flex items-center justify-center text-3xl hover:scale-110"
            >
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};

export default AIChatbot;
