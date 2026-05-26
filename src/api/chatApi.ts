import axiosInstance from './axios';

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: number;
  bookingId: number | null;
  user1Id: number;
  user2Id: number;
  type: string;
  peerName?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  canSend: boolean;
  createdAt: string;
}

export const chatApi = {
  getConversations: async () => {
    const response = await axiosInstance.get<Conversation[]>('/api/chat/conversations');
    return response.data;
  },

  getMessages: async (conversationId: number) => {
    const response = await axiosInstance.get<ChatMessage[]>(`/api/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (conversationId: number, content: string) => {
    const response = await axiosInstance.post<ChatMessage>(`/api/chat/conversations/${conversationId}/messages`, { content });
    return response.data;
  },

  getOrCreateByBooking: async (bookingId: number) => {
    const response = await axiosInstance.post<Conversation>(`/api/chat/conversations/by-booking/${bookingId}`);
    return response.data;
  },

  getOrCreateSupport: async (userId?: number) => {
    const response = await axiosInstance.post<Conversation>('/api/chat/conversations/support', { userId });
    return response.data;
  }
};

export default chatApi;
