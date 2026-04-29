import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import caremateApi from '../api/caremateApi';
import type { BookingDetailDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';
import { 
    CalendarIcon, 
    ClockIcon, 
    MapPinIcon, 
    UserIcon, 
    ChatBubbleLeftRightIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending_confirm: { label: 'Chờ xác nhận', color: 'bg-amber-50 text-amber-600', icon: ClockIcon },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-600', icon: CheckCircleIcon },
    in_progress: { label: 'Đang thực hiện', color: 'bg-green-50 text-green-600', icon: ClockIcon },
    completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
    cancelled: { label: 'Đã hủy', color: 'bg-red-50 text-red-600', icon: XCircleIcon },
    rejected: { label: 'Bị từ chối', color: 'bg-red-100 text-red-700', icon: XCircleIcon },
};

const BookingDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [detail, setDetail] = useState<BookingDetailDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await caremateApi.getBookingById(Number(id));
                setDetail(data);
            } catch {
                showToast('Không thể tải chi tiết lịch hẹn.', 'error');
                navigate('/my-bookings');
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [id, navigate, showToast]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">Đang tải chi tiết...</span>
                </div>
            </div>
        );
    }

    if (!detail) return null;

    const status = statusConfig[detail.status] || { label: detail.status, color: 'bg-slate-100 text-slate-600', icon: ClockIcon };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand mb-8 transition-all"
            >
                <ArrowLeftIcon className="h-4 w-4" /> Quay lại
            </button>

            <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr]">
                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="luxury-card p-10 border-none shadow-xl"
                    >
                        <div className="flex items-start justify-between mb-10">
                            <div>
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                    <status.icon className="h-4 w-4" />
                                    {status.label}
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 mt-6">{detail.serviceName}</h1>
                                <p className="text-sm font-bold text-slate-400 mt-2">Mã lịch hẹn: #{detail.id}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tổng thanh toán</div>
                                <div className="text-3xl font-black text-brand mt-1">{detail.totalPrice.toLocaleString('vi-VN')}đ</div>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8 py-10 border-y border-slate-50">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày phục vụ</div>
                                    <div className="text-sm font-black text-slate-900 mt-1">{new Date(detail.startTime).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <ClockIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian</div>
                                    <div className="text-sm font-black text-slate-900 mt-1">
                                        {new Date(detail.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(detail.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <MapPinIcon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Địa chỉ phục vụ</div>
                                    <div className="text-sm font-black text-slate-900 mt-1 leading-relaxed">
                                        {detail.address || 'Địa chỉ đã lưu trong hồ sơ'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="luxury-card p-10 border-none shadow-xl">
                        <h3 className="text-lg font-black text-slate-900 mb-6">Ghi chú từ khách hàng</h3>
                        <div className="p-6 rounded-2xl bg-slate-50 text-sm font-medium text-slate-600 leading-relaxed italic">
                            "{detail.notes || 'Không có ghi chú thêm cho lịch hẹn này.'}"
                        </div>
                    </div>
                </div>

                <aside className="space-y-8">
                    <div className="luxury-card p-8 border-none shadow-xl text-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Đối tác thực hiện</div>
                        <div className="h-20 w-20 rounded-3xl bg-slate-50 mx-auto flex items-center justify-center text-brand font-black text-2xl shadow-inner mb-4">
                            N
                        </div>
                        <h4 className="text-lg font-black text-slate-900">Y tá CareMate</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand mt-1">Điều dưỡng chuyên nghiệp</p>
                        
                        <div className="mt-8 flex flex-col gap-3">
                            <button className="btn-primary w-full py-3.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                <ChatBubbleLeftRightIcon className="h-4 w-4" /> Nhắn tin
                            </button>
                            <button className="btn-secondary w-full py-3.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                <UserIcon className="h-4 w-4" /> Xem hồ sơ
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default BookingDetailPage;
