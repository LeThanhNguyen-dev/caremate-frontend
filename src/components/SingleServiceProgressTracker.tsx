import { CheckCircleIcon, ClockIcon, PlayIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import caremateApi from '../api/caremateApi';
import type { BookingDetailDto } from '../api/frontend-api-contract';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useState } from 'react';

type Props = {
  booking: BookingDetailDto;
  onProgressChanged?: () => void;
};

const steps = [
  { status: 'pending_confirm', label: 'Chờ xác nhận', description: 'Y tá đang xem và xác nhận lịch hẹn.' },
  { status: 'confirmed', label: 'Đã xác nhận', description: 'Lịch hẹn đã được y tá nhận.' },
  { status: 'in_progress', label: 'Đang thực hiện', description: 'Y tá đã bắt đầu buổi chăm sóc.' },
  { status: 'completed', label: 'Hoàn thành', description: 'Buổi chăm sóc đã kết thúc.' },
];

const terminalLabels: Record<string, { label: string; description: string }> = {
  cancelled: { label: 'Đã hủy', description: 'Lịch hẹn đã được hủy.' },
  rejected: { label: 'Bị từ chối', description: 'Y tá đã từ chối lịch hẹn này.' },
};

const timelineStatusLabels: Record<string, string> = {
  pending_confirm: 'Chưa bắt đầu',
  confirmed: 'Chưa bắt đầu',
  in_progress: 'Đang chăm sóc',
  completed: 'Hoàn thành',
};

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa có';

const formatTime = (value?: string | null) =>
  value ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa có';

const formatDuration = (minutes?: number | null) => {
  if (!minutes && minutes !== 0) return 'Chưa có';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours <= 0) return `${mins} phút`;
  return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
};

const SingleServiceProgressTracker = ({ booking, onProgressChanged }: Props) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [nurseNote, setNurseNote] = useState('');

  const isNurse = user?.role === 'nurse_confirmed';
  const currentIndex = steps.findIndex((step) => step.status === booking.status);
  const isTerminal = booking.status === 'cancelled' || booking.status === 'rejected';
  const isLate = !isTerminal && booking.status !== 'completed' && new Date(booking.startTime).getTime() < Date.now() && !booking.checkInTime;
  const progressPercent = isTerminal ? 100 : currentIndex >= 0 ? Math.round((currentIndex / (steps.length - 1)) * 100) : 0;
  const displayStatus = isLate ? 'Trễ giờ' : terminalLabels[booking.status]?.label || timelineStatusLabels[booking.status] || booking.status;

  const updateStatus = async (nextStatus: string, successMessage: string) => {
    try {
      setActionLoading(true);
      await caremateApi.updateBookingStatus(booking.id, { status: nextStatus, note: nurseNote || undefined });
      setNurseNote('');
      showToast(successMessage, 'success');
      onProgressChanged?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || 'Không thể cập nhật tiến độ lịch hẹn.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mt-12 overflow-hidden rounded-xl border border-slate-50 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.06)]">
      <div className="bg-slate-900 p-8 text-white">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">Tiến độ dịch vụ lẻ</h3>
            <p className="mt-2 text-sm font-medium text-white/50">
              Khách hàng theo dõi được trạng thái thực hiện của buổi chăm sóc này.
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
            <div className="mt-2 text-sm font-black text-slate-900">{formatDateTime(booking.startTime)}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Check-in thực tế</div>
            <div className="mt-2 text-sm font-black text-slate-900">{formatTime(booking.checkInTime)}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Check-out thực tế</div>
            <div className="mt-2 text-sm font-black text-slate-900">{formatTime(booking.checkOutTime)}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Tổng thời gian thực tế</div>
            <div className="mt-2 text-sm font-black text-slate-900">{formatDuration(booking.actualDurationMinutes)}</div>
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
      </div>
    </div>
  );
};

export default SingleServiceProgressTracker;
