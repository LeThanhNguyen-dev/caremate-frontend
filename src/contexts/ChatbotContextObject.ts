import { createContext } from 'react';
import type { AiChatMessageDto } from '../api/frontend-api-contract';

export type LocalAiChatMessage = AiChatMessageDto | {
  messageId: string;
  conversationId: string | null;
  role: 'user';
  content: string;
  safetyFlag: false;
  safetyTriggeredBy: null;
  ctaAction: null;
  disclaimer: string;
  fallbackMode: false;
  createdAt: string;
};

export type ChatbotContextValue = {
  isOpen: boolean;
  messages: LocalAiChatMessage[];
  isLoading: boolean;
  error: string | null;
  open: () => void;
  close: () => void;
  sendMessage: (content: string) => Promise<void>;
};

export const ChatbotContext = createContext<ChatbotContextValue | undefined>(undefined);
