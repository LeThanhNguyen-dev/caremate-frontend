import { useState, type ReactNode } from 'react';
import caremateApi from '../api/caremateApi';
import { ChatbotContext, type LocalAiChatMessage } from './ChatbotContextObject';
import { getErrorMessage } from '../utils/apiError';

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalAiChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

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
      setError(getErrorMessage(err, 'CareMate AI đang tạm thời không phản hồi.'));
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
