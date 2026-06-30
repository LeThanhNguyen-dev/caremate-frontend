import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useChatbot } from '../hooks/useChatbot';
import { useTranslation } from 'react-i18next';

const FloatingChatbot = () => {
  const { isAuthenticated, user } = useAuth();
  const { isOpen, open, close, messages, isLoading, error, sendMessage } = useChatbot();
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  if (!isAuthenticated || !user || user.role !== 'customer') return null;

  const sendDraft = () => {
    const content = draft.trim();
    if (!content || isLoading) return;

    setDraft('');
    void sendMessage(content);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    sendDraft();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendDraft();
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-[160] sm:right-6 lg:bottom-6">
      {isOpen ? (
        <section className="flex h-[min(640px,calc(100vh-48px))] w-[min(390px,calc(100vw-48px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 sm:h-[520px]">
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <div className="text-sm font-black text-slate-950">{t('common.chatbot.title')}</div>
              <div className="text-[11px] font-bold text-slate-400">{t('common.chatbot.subtitle')}</div>
            </div>
            <button onClick={close} className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={t('common.chatbot.close')}>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </header>

          <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-[11px] font-bold leading-5 text-amber-800">
            {t('common.chatbot.disclaimer')}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.length === 0 && (
              <div className="rounded-xl bg-white p-4 text-sm font-semibold leading-6 text-slate-600 shadow-sm">
                {t('common.chatbot.welcome')}
              </div>
            )}
            {messages.map((message) => (
              <div key={message.messageId} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm font-semibold leading-6 shadow-sm ${message.role === 'user' ? 'bg-slate-950 text-white' : message.safetyFlag ? 'bg-red-50 text-red-800 ring-1 ring-red-100' : 'bg-white text-slate-700'}`}>
                  {message.content}
                  {message.ctaAction === 'contact_nurse' && (
                    <a href="/my-bookings" className="mt-3 inline-flex rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white">
                      {t('common.chatbot.contactNurse')}
                    </a>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-400 shadow-sm">
                {t('common.chatbot.loading')}
              </div>
            )}
            {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={submit} className="flex gap-2 border-t border-slate-100 bg-white p-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={800}
              placeholder={t('common.chatbot.placeholder')}
              className="max-h-24 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold outline-none transition focus:border-teal-400 focus:ring-3 focus:ring-teal-50"
            />
            <button disabled={isLoading || !draft.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-600 text-white transition hover:bg-teal-700 disabled:opacity-40" aria-label={t('common.chatbot.send')}>
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </section>
      ) : (
        <button onClick={open} className="flex h-14 w-14 items-center justify-center gap-3 rounded-full bg-slate-950 text-sm font-black text-white shadow-2xl shadow-slate-900/25 transition hover:bg-teal-700 sm:w-auto sm:px-5">
          <ChatBubbleLeftRightIcon className="h-6 w-6 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">{t('common.chatbot.open')}</span>
        </button>
      )}
    </div>
  );
};

export default FloatingChatbot;
