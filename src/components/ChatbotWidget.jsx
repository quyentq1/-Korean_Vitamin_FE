import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ChatbotWidget = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Xin chào! Tôi có thể giúp gì cho bạn về các khóa học tiếng Hàn?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");

        // Simulate AI Response
        setTimeout(() => {
            let botText = "Cảm ơn bạn đã quan tâm. Vui lòng để lại số điện thoại để tư vấn viên liên hệ.";
            const lowerInput = userMsg.text.toLowerCase();

            if (lowerInput.includes("giá") || lowerInput.includes("học phí")) {
                botText = "Khóa sơ cấp A1: 2.500.000đ/khóa. Trung cấp B2: 3.500.000đ/khóa. Bạn quan tâm khóa nào ạ?";
            } else if (lowerInput.includes("lịch") || lowerInput.includes("thời gian")) {
                botText = "Chúng tôi có lớp sáng (8h-10h), chiều (14h-16h) và tối (18h-20h).";
            } else if (lowerInput.includes("địa chỉ") || lowerInput.includes("ở đâu")) {
                botText = "Trung tâm có cơ sở tại Hà Nội và TP.HCM. Bạn đang ở khu vực nào?";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: botText, sender: 'bot' }]);
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
                >
                    <span className="text-3xl">💬</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] border border-gray-100 animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-4 rounded-t-2xl flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">AI</div>
                            <div>
                                <h3 className="font-bold text-sm">Trợ lý ảo Korena</h3>
                                <p className="text-xs opacity-80">Luôn sẵn sàng 24/7</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 rounded-full p-1">
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                        ? 'bg-primary-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t bg-white rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập câu hỏi..."
                                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500 bg-gray-50"
                            />
                            <button
                                onClick={handleSend}
                                className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatbotWidget;
