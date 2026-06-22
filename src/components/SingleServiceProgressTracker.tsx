import { CheckCircleIcon, ClockIcon, PlayIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import caremateApi from '../api/caremateApi';
import type { BookingDetailDto } from '../api/frontend-api-contract';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useState } from 'react';
import { formatDateTime, formatTime, formatDurationMinutes, getQuickFeedbackTags } from '../constants/booking';
import { useTranslation } from 'react-i18next';

type Props = {
  booking: BookingDetailDto;
  onProgressChanged?: () => void;
};

const SingleServiceProgressTracker = ({ booking, onProgressChanged }: Props) => {
  const { t } = useTranslation();
  const steps = [
    { status: 'pending_confirm', label: t('singleServiceTracker.steps.pending_confirm.label'), description: t('singleServiceTracker.steps.pending_confirm.desc') },
    { status: 'confirmed', label: t('singleServiceTracker.steps.confirmed.label'), description: t('singleServiceTracker.steps.confirmed.desc') },
    { status: 'in_progress', label: t('singleServiceTracker.steps.in_progress.label'), description: t('singleServiceTracker.steps.in_progress.desc') },
    { status: 'completed', label: t('singleServiceTracker.steps.completed.label'), description: t('singleServiceTracker.steps.completed.desc') },
  ];

  const terminalLabels: Record<string, { label: string; description: string }> = {
    cancelled: { label: t('singleServiceTracker.terminal.cancelled.label'), description: t('singleServiceTracker.terminal.cancelled.desc') },
    rejected: { label: t('singleServiceTracker.terminal.rejected.label'), description: t('singleServiceTracker.terminal.rejected.desc') },
  };

  const timelineStatusLabels: Record<string, string> = {
    pending_confirm: t('singleServiceTracker.status.pending'),
    confirmed: t('singleServiceTracker.status.pending'),
    in_progress: t('singleServiceTracker.status.in_progress'),
    completed: t('singleServiceTracker.status.completed'),
  };

  const { user } = useAuth();
  const { showToast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [nurseNote, setNurseNote] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: booking.customerSessionRating ?? 5, note: booking.customerSessionNote ?? '', tags: booking.customerSessionTags ?? [] });
  const [reviewLoading, setReviewLoading] = useState(false);

  const isNurse = user?.role === 'nurse_confirmed';
  const isCustomer = user?.role === 'customer';
  const currentIndex = steps.findIndex((step) => step.status === booking.status);
  const isTerminal = booking.status === 'cancelled' || booking.status === 'rejected';
  const isLate = !isTerminal && booking.status !== 'completed' && new Date(booking.startTime).getTime() < Date.now() && !booking.checkInTime;
  const progressPercent = isTerminal ? 100 : currentIndex >= 0 ? Math.round((currentIndex / (steps.length - 1)) * 100) : 0;
  const displayStatus = isLate ? t('singleServiceTracker.status.late') : terminalLabels[booking.status]?.label || timelineStatusLabels[booking.status] || booking.status;

  const updateStatus = async (nextStatus: string, successMessage: string) => {
    try {
      setActionLoading(true);
      await caremateApi.updateBookingStatus(booking.id, { status: nextStatus, note: nurseNote || undefined });
      setNurseNote('');
      showToast(successMessage, 'success');
      onProgressChanged?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || t('singleServiceTracker.updateError'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleReviewTag = (tag: string) => {
    setReviewForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((item) => item !== tag) : [...prev.tags, tag],
    }));
  };

  const submitReview = async () => {
    try {
      setReviewLoading(true);
      await caremateApi.submitSingleSessionFeedback(booking.id, {
        rating: reviewForm.rating,
        note: reviewForm.note.trim() || undefined,
        tags: reviewForm.tags,
      });
      showToast(t('singleServiceTracker.ratingSuccess'), 'success');
      onProgressChanged?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || t('singleServiceTracker.ratingError'), 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="mt-12 overflow-hidden rounded-xl border border-slate-50 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.06)]">
      <div className="bg-slate-900 p-8 text-white">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">{t('singleServiceTracker.title')}</h3>
            <p className="mt-2 text-sm font-medium text-white/50">
              {t('singleServiceTracker.subtitle')}
            </p>
          </div>
          <div className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${isLate ? 'bg-amber-400 text-slate-950' : 'bg-white/10'}`}>
            {displayStatus}
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${isTerminal ? 'bg-red-400' : 'bg-gradient-to-r from-brand to-pink-400'}`}
          />
        </div>
        <div className="mt-2 text-right text-[10px] font-black tracking-widest text-white/50">{progressPercent}%</div>
      </div>

      {isNurse && !isTerminal && booking.status !== 'completed' && (
        <div className="border-b border-slate-100 bg-slate-50/70 p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-brand">Điểm danh buổi chăm sóc</div>
              <h4 className="mt-2 text-xl font-black text-slate-900">
                {booking.status === 'confirmed' ? 'Sẵn sàng bắt đầu buổi chăm sóc' : 'Buổi chăm sóc đang được thực hiện'}
              </h4>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                Ghi chú được lưu lại để gia đình và y tá cùng xem sau buổi chăm sóc.
              </p>
            </div>
            <div>
              <textarea
                value={nurseNote}
                onChange={(event) => setNurseNote(event.target.value)}
                rows={3}
                placeholder={booking.status === 'in_progress' ? 'Ghi chú sau buổi chăm sóc...' : 'Ghi chú lúc bắt đầu ca...'}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
              <div className="mt-3 flex gap-3">
              {booking.status === 'confirmed' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => void updateStatus('in_progress', 'Đã bắt đầu buổi chăm sóc.')}
                  className="rounded-xl bg-brand px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading ? 'Đang lưu...' : 'Check-in'}
                </button>
              )}
              {booking.status === 'in_progress' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => void updateStatus('completed', 'Đã hoàn thành buổi chăm sóc.')}
                  className="rounded-xl bg-emerald-600 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-600/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading ? 'Đang lưu...' : 'Check-out hoàn thành'}
                </button>
              )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Giờ bắt đầu dự kiến</div>
            <div className="mt-2 text-sm font-black text-slate-900">{formatDateTime(t, booking.startTime)}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Check-in thực tế</div>
            <div className="mt-2 text-sm font-black text-slate-900">{formatTime(t, booking.checkInTime)}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Check-out thực tế</div>
            <div className="mt-2 text-sm font-black text-slate-900">{formatTime(t, booking.checkOutTime)}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Tổng thời gian thực tế</div>
            <div className="mt-2 text-sm font-black text-slate-900">{formatDurationMinutes(t, booking.actualDurationMinutes)}</div>
          </div>
        </div>

        {isTerminal ? (
          <div className="flex gap-5 rounded-xl border border-red-100 bg-red-50 p-6">
            <XCircleIcon className="h-8 w-8 shrink-0 text-red-500" />
            <div>
              <h4 className="font-black text-red-700">{terminalLabels[booking.status].label}</h4>
              <p className="mt-1 text-sm font-medium leading-6 text-red-500">{terminalLabels[booking.status].description}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => {
              const completed = currentIndex > index;
              const active = currentIndex === index;
              const pending = currentIndex < index;

              return (
                <div
                  key={step.status}
                  className={`rounded-xl border p-5 ${
                    completed
                      ? 'border-emerald-100 bg-emerald-50'
                      : active
                        ? 'border-brand/20 bg-brand/5'
                        : 'border-slate-100 bg-slate-50/70'
                  } ${pending ? 'opacity-60' : ''}`}
                >
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${
                      completed
                        ? 'bg-emerald-500 text-white'
                        : active
                          ? 'bg-brand text-white'
                          : 'bg-white text-slate-300'
                    }`}
                  >
                    {completed ? <CheckCircleIcon className="h-5 w-5" /> : active ? <PlayIcon className="h-5 w-5" /> : <ClockIcon className="h-5 w-5" />}
                  </div>
                  <div className="text-sm font-black text-slate-900">{step.label}</div>
                  <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{step.description}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-brand/10 bg-brand/5 p-6">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Ghi chú sau buổi chăm sóc</div>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-700">
            {booking.nurseNote || 'Y tá chưa để lại ghi chú sau buổi chăm sóc.'}
          </p>
        </div>

        {booking.customerSessionRating ? (
          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Đánh giá của khách</div>
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon key={index} className={`h-5 w-5 ${index < (booking.customerSessionRating ?? 0) ? 'opacity-100' : 'opacity-25'}`} />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-700">
              {booking.customerSessionNote || 'Khách hàng chưa để lại ghi chú.'}
            </p>
            {(booking.customerSessionTags?.length ?? 0) > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {booking.customerSessionTags?.map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : isCustomer && booking.status === 'completed' ? (
          <div className="mt-4 rounded-xl border border-brand/10 bg-brand/5 p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Đánh giá buổi chăm sóc</div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const star = index + 1;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                    className="rounded-lg p-1 text-yellow-400 transition hover:scale-110"
                  >
                    <StarIcon className={`h-7 w-7 ${star <= reviewForm.rating ? 'opacity-100' : 'opacity-25'}`} />
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {getQuickFeedbackTags(t).map((tag: string) => {
                const active = reviewForm.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleReviewTag(tag)}
                    className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition ${
                      active
                        ? 'border-brand bg-brand text-white shadow-lg shadow-pink-500/10'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-brand hover:text-brand'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <textarea
              value={reviewForm.note}
              onChange={(event) => setReviewForm((prev) => ({ ...prev, note: event.target.value }))}
              rows={3}
              maxLength={1000}
              placeholder="Ghi chú cảm nhận sau buổi chăm sóc..."
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
            <button
              type="button"
              disabled={reviewLoading}
              onClick={() => void submitReview()}
              className="mt-3 rounded-xl bg-brand px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reviewLoading ? 'Đang lưu...' : 'Lưu đánh giá'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SingleServiceProgressTracker;
