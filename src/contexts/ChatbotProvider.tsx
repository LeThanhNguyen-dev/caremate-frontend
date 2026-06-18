import { useState, type ReactNode } from 'react';
import caremateApi from '../api/caremateApi';
import { ChatbotContext, type LocalAiChatMessage } from './ChatbotContextObject';
import { getErrorMessage } from '../utils/apiError';
import { useAuth } from '../hooks/useAuth';

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalAiChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    if (isAuthLoading || !isAuthenticated) {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng CareMate AI.');
      return;
    }

    const localMessage: LocalAiChatMessage = {
      messageId: `local-${Date.now()}`,
      conversationId,
      role: 'user',
      content: trimmed,
      safetyFlag: false,
      safetyTriggeredBy: null,
      ctaAction: null,
      disclaimer: '',
      fallbackMode: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, localMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = conversationId
        ? await caremateApi.sendAiChatMessage(conversationId, { content: trimmed })
        : await caremateApi.sendAiChatMessageNewConversation({ content: trimmed });

      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

      setMessages((prev) => [...prev, response]);
    } catch (err) {
      const message = getErrorMessage(err, 'CareMate AI dang tam thoi khong phan hoi.');
      setError(
        message.includes('401')
          ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng CareMate AI.'
          : message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatbotContext.Provider value={{
      isOpen,
      messages,
      isLoading,
      error,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      sendMessage,
    }}>
      {children}
    </ChatbotContext.Provider>
  );
};
