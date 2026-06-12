import { useEffect, useState, type ComponentType, type SVGProps } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import caremateApi from '../api/caremateApi';
import type { BookingDetailDto, BookingStatusHistoryDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';
import { 
    CalendarIcon, 
    ClockIcon, 
    MapPinIcon, 
    UserIcon, 
    ChatBubbleLeftRightIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import PackageProgressTracker from '../components/PackageProgressTracker';
import SingleServiceProgressTracker from '../components/SingleServiceProgressTracker';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const statusConfig: Record<string, { label: string; color: string; icon: IconComponent }> = {
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
    const [history, setHistory] = useState<BookingStatusHistoryDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!id) {
                console.error('[BookingDetail] No ID found in params');
                return;
            }
            try {
                console.log(`[BookingDetail] Fetching booking ${id}...`);
                setLoading(true);
                const [data, statusHistory] = await Promise.all([
                    caremateApi.getBookingById(Number(id)),
                    caremateApi.getBookingHistory(Number(id)).catch(() => []),
                ]);
                console.log('[BookingDetail] Data received:', data);
                setDetail(data);
                setHistory(statusHistory);
            } catch (err) {
                console.error('[BookingDetail] Error loading detail:', err);
                showToast('Không thể tải chi tiết lịch hẹn. Vui lòng thử lại.', 'error');
                navigate('/my-bookings');
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [id, navigate, showToast]);

    const refreshDetail = async () => {
        if (!id) return;
        const [data, statusHistory] = await Promise.all([
            caremateApi.getBookingById(Number(id)),
            caremateApi.getBookingHistory(Number(id)).catch(() => []),
        ]);
        setDetail(data);
        setHistory(statusHistory);
    };

    if (loading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center bg-[#FAFAFA]">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-16 w-16 animate-spin rounded-full border-[3px] border-brand border-t-transparent shadow-xl"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Đang khởi tạo dữ liệu...</span>
                </div>
            </div>
        );
    }

    if (!detail) return null;

    const status = statusConfig[detail.status] || { label: detail.status, color: 'bg-slate-100 text-slate-600', icon: ClockIcon };

    return (
        <div className="min-h-screen bg-[#FAFAFA] py-24 px-6 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand/5 blur-[150px] rounded-full -mr-96 -mt-96 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-soft/30 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <button 
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-brand mb-16 transition-all"
                >
                    <div className="h-10 w-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:border-brand group-hover:bg-brand group-hover:text-white transition-all">
                        <ArrowLeftIcon className="h-4 w-4" />
                    </div>
                    Quay lại danh sách
                </button>

                <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12"
                    >
                        {/* Main Boarding Pass Card */}
                        <div className="relative bg-white rounded-xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.06)] border border-slate-50">
                            {/* Header Section */}
                            <div className="bg-[#10233F] p-12 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 blur-[80px] -mr-32 -mt-32"></div>
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                    <div>
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-xl border border-white/10 ${status.color.replace('bg-', 'bg-white/10 !text-').replace('text-', '')}`}>
                                            <status.icon className="h-4 w-4" />
                                            {status.label}
                                        </div>
                                        <h1 className="text-4xl font-black mt-8 tracking-tight">{detail.serviceName}</h1>
                                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-4">Booking ID: <span className="text-white/60">#CM-{detail.id}</span></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Phí dịch vụ</div>
                                        <div className="text-5xl font-black text-brand tracking-tighter">{detail.totalPrice.toLocaleString('vi-VN')}đ</div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="p-12">
                                <div className="grid md:grid-cols-2 gap-16 py-12 border-b border-slate-50">
                                    <div className="space-y-8">
                                        <div className="flex items-start gap-6">
                                            <div className="h-14 w-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                                <CalendarIcon className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Ngày phục vụ</div>
                                                <div className="text-lg font-black text-[#10233F] capitalize">
                                                    {new Date(detail.startTime).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-6">
                                            <div className="h-14 w-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                                <ClockIcon className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Khung giờ vàng</div>
                                                <div className="text-lg font-black text-[#10233F] tracking-tight">
                                                    {new Date(detail.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} 
                                                    <span className="mx-3 text-slate-200">/</span>
                                                    {new Date(detail.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-start gap-6">
                                            <div className="h-14 w-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                                <MapPinIcon className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Địa điểm chăm sóc</div>
                                                <div className="text-lg font-black text-[#10233F] leading-tight max-w-sm">
                                                    {detail.address || 'Hồ sơ khách hàng CareMate'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                <div className="mt-12">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-slate-50"></div>
                                        Yêu cầu đặc biệt
                                        <div className="h-px flex-1 bg-slate-50"></div>
                                    </div>
                                    <div className="bg-slate-50/50 rounded-xl p-8 border border-slate-50 italic font-medium text-slate-500 leading-loose text-center">
                                        "{detail.notes || 'Khách hàng không để lại ghi chú bổ sung.'}"
                                    </div>
                                </div>
                            </div>
                        </div>

                        {detail.packageDays && detail.packageDays > 0 ? (
                            <PackageProgressTracker
                                bookingId={detail.id}
                                packageDays={detail.packageDays}
                                bookingStatus={detail.status}
                                finalReviewRating={detail.finalReviewRating}
                                finalReviewComment={detail.finalReviewComment}
                                finalReviewCreatedAt={detail.finalReviewCreatedAt}
                                onProgressChanged={() => void refreshDetail()}
                            />
                        ) : (
                            <SingleServiceProgressTracker
                                booking={detail}
                                onProgressChanged={() => void refreshDetail()}
                            />
                        )}

                        {history.length > 0 && (
                            <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
                                <div className="mb-6 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Lịch sử trạng thái</div>
                                <div className="space-y-4">
                                    {history.map((item) => (
                                        <div key={item.id} className="flex gap-4 rounded-xl bg-slate-50 p-4">
                                            <div className="mt-1 h-3 w-3 rounded-full bg-brand" />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-black text-[#10233F]">{statusConfig[item.status]?.label ?? item.status}</div>
                                                <div className="mt-1 text-xs font-bold text-slate-500">
                                                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                                                    {item.changedByName ? ` · ${item.changedByName}` : ''}
                                                </div>
                                                {item.note && <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{item.note}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Sidebar Actions */}
                    <aside className="space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl p-10 shadow-2xl shadow-[#10233F]/5 border border-slate-50 text-center"
                        >
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-8">Điều dưỡng thực hiện</div>
                            <div className="relative inline-block mb-6">
                                <div className="h-32 w-32 rounded-xl bg-brand text-white flex items-center justify-center font-black text-5xl shadow-2xl shadow-pink-500/20">
                                    {detail.nurseName?.charAt(0) || 'N'}
                                </div>
                                <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-brand">
                                    <CheckCircleIcon className="h-6 w-6" />
                                </div>
                            </div>
                            <h4 className="text-2xl font-black text-[#10233F] tracking-tight">{detail.nurseName || 'Y tá CareMate'}</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand mt-2">Xác minh chuyên nghiệp</p>
                            
                            <div className="mt-12 grid gap-4">
                                <button
                                    onClick={() => navigate(`/chat/bookings/${detail.id}`)}
                                    className="w-full py-5 rounded-xl bg-[#10233F] text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand transition-all shadow-xl shadow-[#10233F]/10 active:scale-95"
                                >
                                    <ChatBubbleLeftRightIcon className="h-5 w-5" /> Trò chuyện trực tuyến
                                </button>
                                <button className="w-full py-5 rounded-xl bg-white border-2 border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:border-brand hover:text-brand transition-all active:scale-95">
                                    <UserIcon className="h-5 w-5" /> Xem hồ sơ y tế
                                </button>
                            </div>
                        </motion.div>

                        <div className="bg-brand rounded-xl p-10 text-white text-center relative overflow-hidden group cursor-pointer shadow-2xl shadow-pink-500/20">
                            <div className="absolute inset-0 bg-brand-deep opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10">
                                <SparklesIcon className="h-10 w-10 mx-auto mb-6 opacity-50" />
                                <h5 className="text-sm font-black uppercase tracking-[0.2em] mb-2">Đặc quyền CareMate</h5>
                                <p className="text-[10px] font-bold text-white/60 leading-relaxed">Nhận bảo hiểm trách nhiệm y khoa lên đến 100tr cho mỗi lịch hẹn.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailPage;
