import type { TFunction } from 'i18next';

export const getStatusLabel = (t: TFunction, status: string): string => {
    return t(`common.status.${status}`, { defaultValue: status });
};

export const getRefundStatusLabel = (t: TFunction, status: string): string => {
    return t(`common.refundStatus.${status}`, { defaultValue: status });
};

export const STATUS_LABELS: Record<string, string> = {
    pending_confirm: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    in_progress: 'Đang thực hiện',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    rejected: 'Bị từ chối',
};

export const REFUND_STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ hoàn tiền',
    completed: 'Đã hoàn tiền',
    failed: 'Hoàn tiền lỗi',
};

export const PLATFORM_FEE_RATE = 0.15;

export const getPlatformFee = (totalPrice: number) => Math.round(totalPrice * PLATFORM_FEE_RATE);

export const formatDateTime = (t: TFunction, value?: string | null) =>
    value ? new Date(value).toLocaleString(t('language.code', { defaultValue: 'vi-VN' }), { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : t('common.time.notAvailable');

export const formatTime = (t: TFunction, value?: string | null) =>
    value ? new Date(value).toLocaleTimeString(t('language.code', { defaultValue: 'vi-VN' }), { hour: '2-digit', minute: '2-digit' }) : t('common.time.notAvailable');

export const formatDuration = (t: TFunction, start?: string | null, end?: string | null) => {
    if (!start || !end) return t('common.time.notAvailable');
    const minutes = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours <= 0) return t('common.time.minutes', { count: mins });
    return mins > 0 ? t('common.time.hoursAndMinutes', { hours, minutes: mins }) : t('common.time.hours', { count: hours });
};

export const formatDurationMinutes = (t: TFunction, minutes?: number | null) => {
    if (!minutes && minutes !== 0) return t('common.time.notAvailable');
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours <= 0) return t('common.time.minutes', { count: mins });
    return mins > 0 ? t('common.time.hoursAndMinutes', { hours, minutes: mins }) : t('common.time.hours', { count: hours });
};

export const getQuickFeedbackTags = (t: TFunction): string[] => {
    return t('common.feedbackTags', { returnObjects: true }) as string[];
};