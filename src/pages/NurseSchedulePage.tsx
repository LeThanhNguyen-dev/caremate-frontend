import { useEffect, useMemo, useState, useCallback } from 'react';
import caremateApi from '../api/caremateApi';
import type { AvailabilitySlotDto, BookingDetailDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';
import { 
    CalendarIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    PlusIcon, 
    ClockIcon,
    CheckBadgeIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const HOURS = Array.from({ length: 13 }, (_, index) => index + 7);
const HOUR_HEIGHT = 80;
const DEFAULT_DURATION_HOURS = 2;

const getWeekStart = (date: Date) => {
    const copy = new Date(date);
    const day = copy.getDay();
    const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
    copy.setDate(diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
};

const addDays = (date: Date, amount: number) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + amount);
    return copy;
};

const formatDateValue = (date: Date) => date.toLocaleDateString('en-CA');
const formatTimeValue = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

const NurseSchedulePage = () => {
    const { showToast } = useToast();
    const [anchorDate, setAnchorDate] = useState(new Date());
    const [slots, setSlots] = useState<AvailabilitySlotDto[]>([]);
    const [bookings, setBookings] = useState<BookingDetailDto[]>([]);
    const [slotModalOpen, setSlotModalOpen] = useState(false);
    const [slotForm, setSlotForm] = useState({
        date: formatDateValue(new Date()),
        startTime: '08:00',
        endTime: '10:00',
    });

    const load = useCallback(async () => {
        try {
            const [slotData, bookingData] = await Promise.all([
                caremateApi.getMyAvailability(),
                caremateApi.getMyNurseBookings(),
            ]);
            setSlots(slotData);
            setBookings(bookingData);
        } catch {
            showToast('Không thể tải dữ liệu lịch làm việc.', 'error');
        }
    }, [showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const weekDays = useMemo(() => {
        const start = getWeekStart(anchorDate);
        return Array.from({ length: 7 }, (_, index) => addDays(start, index));
    }, [anchorDate]);

    const openSlotModal = (day: Date, hour: number) => {
        const start = formatTimeValue(hour);
        const end = formatTimeValue(Math.min(hour + DEFAULT_DURATION_HOURS, 21));
        setSlotForm({
            date: formatDateValue(day),
            startTime: start,
            endTime: end,
        });
        setSlotModalOpen(true);
    };

    const createSlot = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await caremateApi.createAvailability({
                startTime: `${slotForm.date}T${slotForm.startTime}:00`,
                endTime: `${slotForm.date}T${slotForm.endTime}:00`,
            });
            showToast('Tạo lịch rảnh thành công.', 'success');
            setSlotModalOpen(false);
            await load();
        } catch {
            showToast('Không thể tạo lịch rảnh.', 'error');
        }
    };

    const deleteSlot = async (slotId: number) => {
        try {
            await caremateApi.deleteAvailability(slotId);
            showToast('Đã xóa slot rảnh.', 'success');
            await load();
        } catch {
            showToast('Không thể xóa slot này.', 'error');
        }
    };

    const getSlotStyle = (startTime: string, endTime: string) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const startHour = start.getHours() + start.getMinutes() / 60;
        const endHour = end.getHours() + end.getMinutes() / 60;
        return {
            top: `${(startHour - HOURS[0]) * HOUR_HEIGHT}px`,
            height: `${(endHour - startHour) * HOUR_HEIGHT}px`,
        };
    };

    const getEventsForDay = (day: Date) => {
        const dayKey = formatDateValue(day);
        return {
            slots: slots.filter((slot) => formatDateValue(new Date(slot.startTime)) === dayKey),
            bookings: bookings.filter(
                (booking) =>
                    formatDateValue(new Date(booking.startTime)) === dayKey && booking.status !== 'cancelled',
            ),
        };
    };

    const stats = {
        free: slots.filter((slot) => !slot.isBooked).length,
        booked: slots.filter((slot) => slot.isBooked).length,
        upcoming: bookings.filter((booking) => new Date(booking.startTime).getTime() >= Date.now()).length,
    };

    return (
        <div className="space-y-12 pb-20 selection:bg-nurse/10">
            <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
                <div className="luxury-card bg-[#111827] text-white p-12 border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-nurse/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10">
                        <div className="accent-label !bg-white/10 !text-white border-white/10">Lịch làm việc</div>
                        <h1 className="text-4xl font-black text-white mt-4">Quản lý thời gian</h1>
                        <div className="mt-8 flex gap-4">
                            <button onClick={() => setAnchorDate(new Date())} className="btn-secondary !bg-white/10 !border-white/10 !text-white hover:!bg-white/20 px-8 text-xs font-black uppercase tracking-widest">Hôm nay</button>
                            <button onClick={() => setSlotModalOpen(true)} className="btn-primary !bg-nurse shadow-lg shadow-nurse/20 px-8 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <PlusIcon className="h-4 w-4" /> Tạo slot
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    {[
                        { label: 'Slot còn trống', value: stats.free, icon: ClockIcon, color: 'text-nurse bg-nurse/5' },
                        { label: 'Slot đã đặt', value: stats.booked, icon: CheckBadgeIcon, color: 'text-green-600 bg-green-50' },
                        { label: 'Booking sắp tới', value: stats.upcoming, icon: CalendarIcon, color: 'text-blue-600 bg-blue-50' },
                    ].map((item) => (
                        <div key={item.label} className="luxury-card p-6 flex items-center gap-5 border-none shadow-lg">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                                <div className="mt-1 text-2xl font-black text-slate-900">{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="luxury-card p-0 overflow-hidden border-none shadow-xl">
                <div className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                            <button onClick={() => setAnchorDate(addDays(anchorDate, -7))} className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100"><ChevronLeftIcon className="h-5 w-5" /></button>
                            <button onClick={() => setAnchorDate(addDays(anchorDate, 7))} className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100"><ChevronRightIcon className="h-5 w-5" /></button>
                        </div>
                        <h3 className="text-xl font-black text-slate-900">{new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(anchorDate)}</h3>
                    </div>
                </div>

                <div className="relative overflow-auto max-h-[800px]">
                    <div className="min-w-[1000px]">
                        <div className="sticky top-0 z-10 flex bg-white border-b border-slate-50">
                            <div className="w-24 shrink-0 border-r border-slate-50 bg-slate-50/20"></div>
                            {weekDays.map((day) => (
                                <div key={day.toISOString()} className="flex-1 border-r border-slate-50 px-3 py-6 text-center">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{day.toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
                                    <div className="mt-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-lg font-black">{day.getDate()}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex">
                            <div className="w-24 shrink-0 border-r border-slate-50 bg-slate-50/20">
                                {HOURS.map((hour) => (
                                    <div key={hour} className="relative text-right pr-4" style={{ height: `${HOUR_HEIGHT}px` }}>
                                        <span className="absolute right-4 top-2 text-[10px] font-black text-slate-300 uppercase">{String(hour).padStart(2, '0')}:00</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-1 relative">
                                {weekDays.map((day) => {
                                    const events = getEventsForDay(day);
                                    return (
                                        <div key={day.toISOString()} className="relative flex-1 border-r border-slate-50 last:border-r-0">
                                            {HOURS.map((hour) => (
                                                <button key={`${day.toISOString()}-${hour}`} type="button" onClick={() => openSlotModal(day, hour)} className="block w-full border-b border-slate-50/50 hover:bg-nurse/[0.03]" style={{ height: `${HOUR_HEIGHT}px` }} />
                                            ))}
                                            {events.slots.map((slot) => (
                                                <div key={slot.id} className="absolute left-2 right-2 rounded-2xl p-4 text-xs bg-nurse/5 border border-nurse/20 text-nurse shadow-sm" style={getSlotStyle(slot.startTime, slot.endTime)}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="font-bold">{new Date(slot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); void deleteSlot(slot.id); }} className="text-red-500"><XMarkIcon className="h-4 w-4" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {events.bookings.map((booking) => (
                                                <div key={booking.id} className="absolute left-2 right-2 rounded-2xl bg-[#111827] p-4 text-xs text-white shadow-xl z-10" style={getSlotStyle(booking.startTime, booking.endTime)}>
                                                    <div className="font-black text-[10px] uppercase text-nurse">Lịch hẹn</div>
                                                    <div className="mt-1 font-black leading-tight">#{booking.id}</div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {slotModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSlotModalOpen(false)} />
                    <div className="relative w-full max-w-md luxury-card p-10 bg-white border-none shadow-2xl">
                        <h3 className="text-2xl font-black text-slate-900 mb-8">Tạo slot rảnh</h3>
                        <form onSubmit={createSlot} className="space-y-6">
                            <div>
                                <label className="form-label">Ngày</label>
                                <input type="date" className="form-input" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Bắt đầu</label>
                                    <input type="time" className="form-input" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">Kết thúc</label>
                                    <input type="time" className="form-input" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} required />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary w-full py-4 text-[10px] font-black uppercase tracking-widest">Xác nhận tạo</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NurseSchedulePage;
