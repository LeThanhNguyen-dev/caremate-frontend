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

export const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa có';

export const formatTime = (value?: string | null) =>
    value ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa có';

export const formatDuration = (start?: string | null, end?: string | null) => {
    if (!start || !end) return 'Chưa có';
    const minutes = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours <= 0) return `${mins} phút`;
    return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
};

export const formatDurationMinutes = (minutes?: number | null) => {
    if (!minutes && minutes !== 0) return 'Chưa có';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours <= 0) return `${mins} phút`;
    return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
};

export const QUICK_FEEDBACK_TAGS = ['Đúng giờ', 'Thái độ tốt', 'Chăm sóc kỹ', 'Tư vấn dễ hiểu', 'Bé/mẹ thoải mái', 'Cần cải thiện giao tiếp', 'Chưa đúng mong đợi'];