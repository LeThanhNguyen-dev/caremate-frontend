import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import caremateApi from '../api/caremateApi';
import type { AvailabilitySlotDto, BookingDetailDto, PackageSessionDto } from '../api/frontend-api-contract';
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
import { useAuth } from '../hooks/useAuth';
import NursePendingApproval from '../components/nurse/NursePendingApproval';

const HOURS = Array.from({ length: 13 }, (_, index) => index + 7);
const HOUR_HEIGHT = 56;
const DEFAULT_DURATION_HOURS = 2;
const PACKAGE_SESSION_DURATION_HOURS = 2;

type SchedulePackageSession = PackageSessionDto & {
    bookingId: number;
    serviceName: string;
    bookingStatus: string;
    totalSessions: number;
};

const loadPackageSessions = async (bookings: BookingDetailDto[]): Promise<SchedulePackageSession[]> => {
    const packageBookings = bookings.filter(
        (booking) => booking.serviceKind === 'package' || Boolean(booking.packageDays && booking.packageDays > 0),
    );

    const progresses = await Promise.all(
        packageBookings.map(async (booking) => {
            try {
                const progress = await caremateApi.getPackageProgress(booking.id);
                return progress.sessions.map((session) => ({
                    ...session,
                    bookingId: booking.id,
                    serviceName: booking.serviceName,
                    bookingStatus: booking.status,
                    totalSessions: progress.totalSessions,
                }));
            } catch {
                return [];
            }
        }),
    );

    return progresses.flat();
};

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
    const { user } = useAuth();
    const { showToast } = useToast();

    const [anchorDate, setAnchorDate] = useState(new Date());
    const [slots, setSlots] = useState<AvailabilitySlotDto[]>([]);
    const [bookings, setBookings] = useState<BookingDetailDto[]>([]);
    const [packageSessions, setPackageSessions] = useState<SchedulePackageSession[]>([]);
    const [slotModalOpen, setSlotModalOpen] = useState(false);
    const [currentTimestamp] = useState(() => Date.now());
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
            const sessionData = await loadPackageSessions(bookingData);
            setSlots(slotData);
            setBookings(bookingData);
            setPackageSessions(sessionData);
        } catch {
            showToast('Không thể tải dữ liệu lịch làm việc.', 'error');
        }
    }, [showToast]);

    useEffect(() => {
        let isActive = true;

        const loadSchedule = async () => {
            try {
                const [slotData, bookingData] = await Promise.all([
                    caremateApi.getMyAvailability(),
                    caremateApi.getMyNurseBookings(),
                ]);
                const sessionData = await loadPackageSessions(bookingData);

                if (isActive) {
                    setSlots(slotData);
                    setBookings(bookingData);
                    setPackageSessions(sessionData);
                }
            } catch {
                showToast('Không thể tải dữ liệu lịch làm việc.', 'error');
            }
        };

        void loadSchedule();

        return () => {
            isActive = false;
        };
    }, [showToast]);

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
        const firstHour = HOURS[0];
        const lastHour = HOURS[HOURS.length - 1] + 1;
        const rawStartHour = start.getHours() + start.getMinutes() / 60;
        const rawEndHour = end.getHours() + end.getMinutes() / 60;
        if (rawEndHour <= firstHour || rawStartHour >= lastHour) {
            return { display: 'none' };
        }
        const startHour = Math.max(firstHour, rawStartHour);
        const endHour = Math.min(lastHour, rawEndHour);
        const visibleDuration = Math.max(0.75, endHour - startHour);
        return {
            top: `${(startHour - firstHour) * HOUR_HEIGHT}px`,
            height: `${visibleDuration * HOUR_HEIGHT}px`,
        };
    };

    const getPackageSessionStyle = (startTime: string) => {
        const start = new Date(startTime);
        const end = new Date(start);
        end.setHours(end.getHours() + PACKAGE_SESSION_DURATION_HOURS);
        return getSlotStyle(start.toISOString(), end.toISOString());
    };

    const getEventsForDay = (day: Date) => {
        const dayKey = formatDateValue(day);
        return {
            slots: slots.filter((slot) => formatDateValue(new Date(slot.startTime)) === dayKey),
            bookings: bookings.filter(
                (booking) =>
                    booking.serviceKind !== 'package' &&
                    !booking.packageDays &&
                    formatDateValue(new Date(booking.startTime)) === dayKey &&
                    booking.status !== 'cancelled',
            ),
            packageSessions: packageSessions.filter(
                (session) =>
                    formatDateValue(new Date(session.sessionDate)) === dayKey &&
                    session.bookingStatus !== 'cancelled' &&
                    session.bookingStatus !== 'rejected',
            ),
        };
    };

    const stats = {
        free: slots.filter((slot) => slot.isAvailable).length,
        booked: slots.filter((slot) => !slot.isAvailable).length,
        upcoming: bookings.filter((booking) => new Date(booking.startTime).getTime() >= currentTimestamp).length,
    };

    if (user?.role !== 'nurse_confirmed') {
        return <NursePendingApproval />;
    }

    return (
        <div className="space-y-6 pb-12 selection:bg-emerald-100">
            <section className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="luxury-card relative overflow-hidden border-none bg-slate-900 p-6 text-white shadow-xl lg:p-7">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-white">Quản trị thời gian</div>
                        <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">Lịch làm việc của bạn</h1>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <button onClick={() => setAnchorDate(new Date())} className="h-10 rounded-xl border border-white/10 bg-white/10 px-5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/20">Hôm nay</button>
                            <button data-tour="nurse-schedule-create" onClick={() => setSlotModalOpen(true)} className="flex h-10 items-center gap-2 rounded-xl bg-[#10B981] px-5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95">
                                <PlusIcon className="h-4 w-4" /> Tạo slot rảnh
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3">
                    {[
                        { label: 'Slot còn trống', value: stats.free, icon: ClockIcon, color: 'text-[#10B981] bg-emerald-50' },
                        { label: 'Slot đã được đặt', value: stats.booked, icon: CheckBadgeIcon, color: 'text-[#10B981] bg-emerald-50' },
                        { label: 'Booking sắp tới', value: stats.upcoming, icon: CalendarIcon, color: 'text-[#10B981] bg-emerald-50' },
                    ].map((item) => (
                        <div key={item.label} className="luxury-card flex items-center gap-4 border-none p-4 shadow-md">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                                <div className="mt-0.5 text-xl font-black text-slate-900">{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section data-tour="nurse-schedule-calendar" className="luxury-card overflow-hidden border-none p-0 shadow-lg">
                <div className="flex flex-col gap-4 border-b border-slate-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                            <button onClick={() => setAnchorDate(addDays(anchorDate, -7))} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-all hover:bg-slate-100"><ChevronLeftIcon className="h-4 w-4" /></button>
                            <button onClick={() => setAnchorDate(addDays(anchorDate, 7))} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-all hover:bg-slate-100"><ChevronRightIcon className="h-4 w-4" /></button>
                        </div>
                        <h3 className="text-lg font-black text-slate-900">Tháng {new Intl.DateTimeFormat('vi-VN', { month: 'numeric', year: 'numeric' }).format(anchorDate)}</h3>
                    </div>
                </div>

                <div className="custom-scrollbar relative max-h-[640px] overflow-auto bg-slate-100/60">
                    <div className="min-w-[860px]">
                        <div className="sticky top-0 z-10 flex bg-white border-b border-slate-200 shadow-sm">
                            <div className="w-20 shrink-0 border-r border-slate-200 bg-slate-100/70"></div>
                            {weekDays.map((day) => (
                                <div key={day.toISOString()} className="flex-1 border-r border-slate-200 px-2 py-4 text-center last:border-r-0">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{day.toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
                                    <div className={`mt-2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-base font-black ${
                                        formatDateValue(day) === formatDateValue(new Date()) ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-100 text-slate-950'
                                    }`}>{day.getDate()}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex">
                            <div className="w-20 shrink-0 border-r border-slate-200 bg-slate-100/70">
                                {HOURS.map((hour) => (
                                    <div key={hour} className="relative border-b border-slate-200 pr-3 text-right" style={{ height: `${HOUR_HEIGHT}px` }}>
                                        <span className="absolute right-3 top-2 rounded-lg bg-white px-2 py-0.5 text-[9px] font-black uppercase text-slate-600 shadow-sm">{String(hour).padStart(2, '0')}:00</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-1 relative">
                                {weekDays.map((day) => {
                                    const events = getEventsForDay(day);
                                    return (
                                        <div key={day.toISOString()} className="relative flex-1 border-r border-slate-200 bg-white last:border-r-0">
                                            {HOURS.map((hour) => (
                                                <button key={`${day.toISOString()}-${hour}`} type="button" onClick={() => openSlotModal(day, hour)} className="block w-full border-b border-slate-200 bg-white hover:bg-emerald-50/60 transition-colors" style={{ height: `${HOUR_HEIGHT}px` }} />
                                            ))}
                                            {events.slots.map((slot) => (
                                                <div key={slot.id} className="group/slot absolute left-1.5 right-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[11px] text-emerald-700 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md" style={getSlotStyle(slot.startTime, slot.endTime)}>
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Khung rảnh</div>
                                                            <div className="mt-0.5 font-black">
                                                                {new Date(slot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                                {' - '}
                                                                {new Date(slot.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); void deleteSlot(slot.id); }} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/slot:opacity-100"><XMarkIcon className="h-4 w-4" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {events.bookings.map((booking) => (
                                                <div key={booking.id} className="absolute left-1.5 right-1.5 z-10 rounded-lg border border-slate-900 bg-slate-900 p-2.5 text-[11px] text-white shadow-lg ring-1 ring-white" style={getSlotStyle(booking.startTime, booking.endTime)}>
                                                    <div className="font-black text-[10px] uppercase text-[#10B981] mb-1">Lịch hẹn khách</div>
                                                    <div className="font-black leading-tight">#{booking.id} - {booking.serviceName}</div>
                                                    <div className="mt-2 text-[10px] font-bold text-white/70">
                                                        {new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                        {' - '}
                                                        {new Date(booking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            ))}
                                            {events.packageSessions.map((session) => (
                                                <Link
                                                    key={session.id}
                                                    to={`/bookings/${session.bookingId}`}
                                                    className={`absolute left-1.5 right-1.5 z-20 rounded-lg border-l-4 p-2.5 text-[11px] text-white shadow-lg transition hover:scale-[1.01] ${
                                                        session.status === 'completed'
                                                            ? 'border-emerald-300 bg-emerald-600'
                                                            : session.status === 'checked_in'
                                                                ? 'border-pink-200 bg-[#EC4899]'
                                                                : 'border-violet-200 bg-violet-600'
                                                    }`}
                                                    style={getPackageSessionStyle(session.sessionDate)}
                                                >
                                                    <div className="mb-1 text-[10px] font-black uppercase text-white/70">
                                                        Gói #{session.bookingId} - Buổi {session.sessionNumber}/{session.totalSessions}
                                                    </div>
                                                    <div className="font-black leading-tight">{session.title || session.serviceName}</div>
                                                    <div className="mt-1 text-[10px] font-bold text-white/70">
                                                        {new Date(session.sessionDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </Link>
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
                        <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Tạo slot rảnh mới</h3>
                        <form onSubmit={createSlot} className="space-y-6">
                            <div>
                                <label className="form-label">Ngày thực hiện</label>
                                <input type="date" className="form-input" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Thời gian bắt đầu</label>
                                    <input type="time" className="form-input" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">Thời gian kết thúc</label>
                                    <input type="time" className="form-input" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} required />
                                </div>
                            </div>
                            <button type="submit" className="bg-[#10B981] text-white w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all">Xác nhận lưu lịch</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NurseSchedulePage;
