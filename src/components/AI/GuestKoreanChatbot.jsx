import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import aiService from '../../services/aiService';

/**
 * Guest Korean Learning Chatbot Widget
 * Floating chatbot for visitors without login
 * Supports Korean language learning queries
 */
const GuestKoreanChatbot = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  // Don't show if authenticated user - MUST be before all hooks!
  if (isAuthenticated) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [remaining, setRemaining] = useState(20);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(null);

  // Initialize session ID
  useEffect(() => {
    let sessionId = localStorage.getItem('krChatSession');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('krChatSession', sessionId);
    }
    sessionIdRef.current = sessionId;

    // Welcome message
    setMessages([
      {
        role: 'assistant',
        content: t('ai.guestKoreanChatbot.welcomeMessage')
      }
    ]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();

    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const data = await aiService.chatKorean({
        message: userMessage,
        sessionId: sessionIdRef.current,
        history: newMessages.slice(-10) // Send last 10 messages
      });

      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      setRemaining(data.remainingMessages || 0);

    } catch (error) {
      console.error('Chatbot error:', error);

      // Add error message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: t('ai.guestKoreanChatbot.errorMessage')
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getQuickActions = () => [
    { label: t('ai.guestKoreanChatbot.quickAction1Label'), message: t('ai.guestKoreanChatbot.quickAction1Message') },
    { label: t('ai.guestKoreanChatbot.quickAction2Label'), message: t('ai.guestKoreanChatbot.quickAction2Message') },
    { label: t('ai.guestKoreanChatbot.quickAction3Label'), message: t('ai.guestKoreanChatbot.quickAction3Message') },
    { label: t('ai.guestKoreanChatbot.quickAction4Label'), message: t('ai.guestKoreanChatbot.quickAction4Message') }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-2xl font-bold hover:scale-110 transform"
          title={t('ai.guestKoreanChatbot.toggleTitle')}
        >
          한
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇰🇷</span>
              <span className="font-semibold">{t('ai.guestKoreanChatbot.headerTitle')}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              title={t('ai.guestKoreanChatbot.closeChat')}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-200">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (show when no conversation) */}
          {messages.length <= 1 && (
            <div className="px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0">
              <div className="text-xs font-semibold text-gray-700 mb-2">{t('ai.guestKoreanChatbot.faqTitle')}:</div>
              <div className="flex flex-wrap gap-2">
                {getQuickActions().map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(action.message)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs rounded-full border border-red-200 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rate Limit Warning */}
          {remaining <= 5 && remaining > 0 && (
            <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200 flex-shrink-0">
              <p className="text-xs text-yellow-800 text-center">
                ⚠️ {t('ai.guestKoreanChatbot.remainingWarning', { count: remaining })}
              </p>
            </div>
          )}

          {remaining === 0 && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex-shrink-0">
              <p className="text-xs text-red-800 text-center">
                {t('ai.guestKoreanChatbot.noMessagesLeft')}
              </p>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200 flex gap-2 flex-shrink-0">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('ai.guestKoreanChatbot.placeholder')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              rows={1}
              disabled={remaining === 0 || isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || remaining === 0 || isTyping}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
            >
              {isTyping ? '...' : t('ai.guestKoreanChatbot.sendBtn')}
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <p className="text-xs text-gray-600 text-center">
              ⚡ Powered by AI • {t('ai.guestKoreanChatbot.messagesLeft', { count: remaining })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestKoreanChatbot;
