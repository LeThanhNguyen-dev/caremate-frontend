import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { jwtDecode } from 'jwt-decode';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import caremateApi from '../api/caremateApi';
import type { ChatMessage, Conversation } from '../api/frontend-api-contract';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

type TokenClaims = {
  sub?: string;
  nameid?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
};

const getUserIdFromToken = (token: string | null) => {
  if (!token) return 0;
  try {
    const claims = jwtDecode<TokenClaims>(token);
    return Number(
      claims.nameid ??
      claims.sub ??
      claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
      0
    );
  } catch {
    return 0;
  }
};

const ChatPage = () => {
  const { bookingId } = useParams<{ bookingId?: string }>();
  const { user, accessToken } = useAuth();
  const { showToast } = useToast();
  const myUserId = useMemo(() => getUserIdFromToken(accessToken), [accessToken]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await caremateApi.getConversations();
        setConversations(list);

        if (bookingId) {
          const conversation = await caremateApi.createConversationByBooking(Number(bookingId));
          setActiveConversation(conversation);
          setConversations((prev) => {
            const next = prev.filter((item) => item.id !== conversation.id);
            return [conversation, ...next];
          });
        } else if (!isAdmin) {
          const conversation = await caremateApi.createSupportConversation();
          setActiveConversation(conversation);
          setConversations((prev) => {
            const next = prev.filter((item) => item.id !== conversation.id);
            return [conversation, ...next];
          });
        } else {
          const firstSupport = list.find((item) => item.type === 'support') ?? list[0] ?? null;
          setActiveConversation(firstSupport);
        }
      } catch (error) {
        console.error('Failed to load chat', error);
        showToast('Không thể tải tin nhắn.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [bookingId, isAdmin, showToast]);

  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    let isActive = true;
    const loadMessages = async () => {
      const data = await caremateApi.getMessages(activeConversation.id);
      if (isActive) setMessages(data);
    };

    void loadMessages();
    return () => {
      isActive = false;
    };
  }, [activeConversation]);

  useEffect(() => {
    if (!accessToken || !activeConversation) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL || 'http://localhost:5244'}/hubs/chat`, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .build();

    connection.on('MessageReceived', (message: ChatMessage) => {
      if (message.conversationId !== activeConversation.id) return;
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    connection.on('MessagesRead', (payload: { messageIds?: number[] }) => {
      const ids = new Set(payload.messageIds ?? []);
      setMessages((prev) => prev.map((item) => ids.has(item.id) ? { ...item, isRead: true } : item));
    });

    connection.start()
      .then(() => connection.invoke('JoinConversation', activeConversation.id))
      .catch((error) => console.error('Chat SignalR error', error));

    connectionRef.current = connection;
    return () => {
      void connection.invoke('LeaveConversation', activeConversation.id).catch(() => undefined);
      void connection.stop();
      connectionRef.current = null;
    };
  }, [accessToken, activeConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!activeConversation || !content) return;

    try {
      setDraft('');
      const message = await caremateApi.sendMessage(activeConversation.id, { content });
      setMessages((prev) => prev.some((item) => item.id === message.id) ? prev : [...prev, message]);
    } catch (error) {
      console.error('Failed to send message', error);
      showToast('Hội thoại đặt lịch đã kết thúc hoặc không thể gửi tin.', 'warning');
      setDraft(content);
    }
  };

  const title = activeConversation?.type === 'support'
    ? 'Hỗ trợ CareMate'
    : `Lịch hẹn #CM-${activeConversation?.bookingId ?? ''}`;

  return (
    <div className="bg-slate-50 px-4 py-8 lg:px-8">
      <div className="mx-auto grid h-[calc(100vh-11rem)] min-h-[560px] max-w-7xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-[340px_1fr]">
        <aside className="flex min-h-0 flex-col border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">Tin nhắn</div>
              <div className="text-xs font-bold text-slate-400">Realtime CareMate</div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="p-6 text-sm font-bold text-slate-400">Đang tải...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-sm font-bold text-slate-400">Chưa có hội thoại.</div>
            ) : conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setActiveConversation(conversation)}
                className={`mb-2 flex w-full items-start gap-3 rounded-xl p-4 text-left transition ${
                  activeConversation?.id === conversation.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-brand/10'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  conversation.type === 'support' ? 'bg-blue-500 text-white' : 'bg-brand text-white'
                }`}>
                  {conversation.type === 'support' ? <ShieldCheckIcon className="h-5 w-5" /> : <ChatBubbleLeftRightIcon className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-black">
                    {conversation.type === 'support' ? (isAdmin ? conversation.peerName || 'Người dùng' : 'Admin CareMate') : conversation.peerName || `Booking #${conversation.bookingId}`}
                  </div>
                  <div className={`mt-1 truncate text-xs font-bold ${activeConversation?.id === conversation.id ? 'text-white/60' : 'text-slate-400'}`}>
                    {conversation.lastMessage || (conversation.canSend ? 'Sẵn sàng nhắn tin' : 'Hội thoại đã đóng')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h1 className="text-xl font-black text-slate-900">{title}</h1>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                {activeConversation?.canSend ? 'Đang mở' : 'Chỉ xem lịch sử'}
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-5">
            {messages.map((message) => {
              const mine = message.senderId === myUserId;
              return (
                <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] rounded-xl px-4 py-3 text-sm font-semibold shadow-sm ${
                    mine ? 'bg-brand text-white' : 'bg-white text-slate-700 border border-slate-100'
                  }`}>
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    <div className={`mt-2 text-[10px] font-black uppercase tracking-widest ${mine ? 'text-white/50' : 'text-slate-300'}`}>
                      {new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-100 bg-white p-4">
            {!activeConversation?.canSend ? (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                Hội thoại với y tá chỉ mở trong phiên đặt. Bạn vẫn có thể xem lại lịch sử tin nhắn.
              </div>
            ) : (
              <div className="flex items-end gap-3">
                <input
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  className="block h-12 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="Nhập tin nhắn..."
                />
                <button
                  onClick={() => void sendMessage()}
                  disabled={!draft.trim()}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:bg-slate-200"
                  title="Gửi tin nhắn"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChatPage;
