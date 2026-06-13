import { useContext } from 'react';
import { ChatbotContext } from '../contexts/ChatbotContextObject';

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider');
  }
  return context;
};
