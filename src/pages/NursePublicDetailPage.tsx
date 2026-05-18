import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AcademicCapIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckBadgeIcon,
  ChevronLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  HeartIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import caremateApi from '../api/caremateApi';
import type {
  AvailabilitySlotDto,
  NurseDiscoveryDto,
  NurseProfileDetailDto,
  ReviewDto,
  ServiceDetailDto,
} from '../api/frontend-api-contract';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const toDateInputValue = (value: Date) => value.toLocaleDateString('en-CA');

const addDays = (date: string, offset: number) => {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + offset);
  return toDateInputValue(value);
};

const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN');
const formatTime = (value: string) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const formatTimeKey = (value: string) => new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const fullDayTimeRows = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`);

const formatRelativeDate = (value: string | null) => {
  if (!value) return 'Gần đây';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Gần đây';

  const diffDays = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return '1 ngày trước';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return date.toLocaleDateString('vi-VN');
};

const NursePublicDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceIdFromUrl = searchParams.get('serviceId');
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<NurseProfileDetailDto | null>(null);
  const [service, setService] = useState<ServiceDetailDto | null>(null);
  const [nurseCard, setNurseCard] = useState<NurseDiscoveryDto | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [packageSessionStarts, setPackageSessionStarts] = useState<Record<string, string>>({});
  const [bookingForm, setBookingForm] = useState({
    serviceId: serviceIdFromUrl || '',
    startTime: '',
    endTime: '',
    address: '',
    notes: '',
  });

  const isPackage = service?.serviceKind === 'package' || Boolean(service?.packageDays && service.packageDays > 0);

  useEffect(() => {
    if (!serviceIdFromUrl) {
      showToast('Hãy chọn dịch vụ trước khi xem hồ sơ y tá.', 'warning');
      navigate('/services');
    }
  }, [navigate, serviceIdFromUrl, showToast]);

  useEffect(() => {
    const load = async () => {
      if (!userId || !serviceIdFromUrl) return;

      try {
        setLoading(true);
        const [profileData, slotData, serviceData, matchingNurses, reviewData] = await Promise.all([
          caremateApi.getNurseByUserId(Number(userId)),
          caremateApi.getNurseAvailabilityByUserId(Number(userId)),
          caremateApi.getServiceById(Number(serviceIdFromUrl)),
          caremateApi.getNurses({ serviceId: Number(serviceIdFromUrl) }),
          caremateApi.getReviews({ nurseId: Number(userId), serviceId: Number(serviceIdFromUrl) }).catch(() => []),
        ]);

        const match = matchingNurses.find((item) => item.userId === Number(userId));
        if (!match) {
          showToast('Y tá này không cung cấp dịch vụ bạn đã chọn.', 'warning');
          navigate('/services');
          return;
        }

        setProfile(profileData);
        setSlots(slotData);
        setService(serviceData);
        setNurseCard(match);
        setReviews(reviewData);

        if (serviceData.serviceKind === 'package' || serviceData.packageDays) {
          setSelectedDate(toDateInputValue(new Date()));
        }
      } catch {
        showToast('Không thể tải thông tin y tá.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [navigate, serviceIdFromUrl, showToast, userId]);

  const slotsByDate = useMemo(() => {
    return slots.reduce<Record<string, AvailabilitySlotDto[]>>((accumulator, slot) => {
      const dateKey = new Date(slot.startTime).toLocaleDateString('en-CA');
      accumulator[dateKey] = [...(accumulator[dateKey] || []), slot];
      return accumulator;
    }, {});
  }, [slots]);

  const availableDates = useMemo(
    () => Object.keys(slotsByDate).filter((date) => (slotsByDate[date] || []).some((slot) => slot.isAvailable)).sort(),
    [slotsByDate],
  );

  const packageDates = useMemo(() => {
    if (!isPackage || !service?.packageDays || !selectedDate) return [];
    return Array.from({ length: service.packageDays }, (_, offset) => addDays(selectedDate, offset));
  }, [isPackage, selectedDate, service?.packageDays]);

  const packageTimeRows = useMemo(() => {
    const times = new Set<string>(fullDayTimeRows);
    packageDates.forEach((date) => {
      (slotsByDate[date] || []).forEach((slot) => times.add(formatTimeKey(slot.startTime)));
    });
    return Array.from(times).sort();
  }, [packageDates, slotsByDate]);

  const singleTimeRows = useMemo(() => {
    const times = new Set<string>(fullDayTimeRows);
    availableDates.forEach((date) => {
      (slotsByDate[date] || []).forEach((slot) => times.add(formatTimeKey(slot.startTime)));
    });
    return Array.from(times).sort();
  }, [availableDates, slotsByDate]);

  const packageScheduleComplete = packageDates.length > 0 && packageDates.every((date) => Boolean(packageSessionStarts[date]));
  const canSubmit = Boolean(bookingForm.address && (isPackage ? packageScheduleComplete : bookingForm.startTime && selectedSlotId));

  useEffect(() => {
    if (!isPackage && availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, isPackage, selectedDate]);

  const getSlotForDateTime = (date: string, time: string) =>
    (slotsByDate[date] || []).find((slot) => formatTimeKey(slot.startTime) === time);

  const handleSelectSlot = (slot: AvailabilitySlotDto) => {
    if (!slot.isAvailable) return;
    setSelectedDate(new Date(slot.startTime).toLocaleDateString('en-CA'));
    setSelectedSlotId(slot.id);
    setBookingForm((prev) => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
  };

  const handlePackageStartDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlotId(null);
    setPackageSessionStarts({});
    setBookingForm((prev) => ({ ...prev, startTime: '', endTime: '' }));
  };

  const handlePackageSlotSelect = (date: string, slot: AvailabilitySlotDto) => {
    if (!slot.isAvailable) return;

    const nextStarts = {
      ...packageSessionStarts,
      [date]: slot.startTime,
    };
    const orderedStarts = packageDates.map((item) => nextStarts[item]).filter(Boolean);

    setPackageSessionStarts(nextStarts);
    setBookingForm((prev) => ({
      ...prev,
      startTime: orderedStarts[0] || '',
      endTime: '',
    }));
  };

  const submitBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setBooking(true);
      const payload: Record<string, unknown> = {
        nurseId: Number(userId),
        serviceId: Number(bookingForm.serviceId),
        startTime: bookingForm.startTime,
        address: bookingForm.address,
        notes: bookingForm.notes || null,
      };

      if (!isPackage) {
        payload.availabilitySlotId = selectedSlotId ?? undefined;
        payload.endTime = bookingForm.endTime;
      } else {
        payload.packageSessionStartTimes = packageDates.map((date) => packageSessionStarts[date]);
      }

      await caremateApi.createBooking(payload);
      showToast('Đặt lịch thành công! Bạn có thể theo dõi trong mục lịch hẹn.', 'success');
      navigate('/my-bookings');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      showToast(axiosError.response?.data?.message || 'Không thể đặt lịch. Vui lòng kiểm tra lại thông tin.', 'error');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#EC4899] border-t-transparent"></div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#6B7280]">Đang tải hồ sơ...</span>
        </div>
      </div>
    );
  }

  if (!profile || !service || !nurseCard) return null;

  return (
    <div className="min-h-screen bg-[#FDF2F8]/30 pb-32 pt-32 selection:bg-[#EC4899]/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="group mb-12 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#6B7280] transition-colors hover:text-[#EC4899]"
        >
          <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Quay lại
        </button>

        <div className="grid items-start gap-12 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            <section className="luxury-card flex flex-col items-start gap-10 p-10 sm:flex-row">
              <div className="relative shrink-0">
                <div className="h-40 w-40 overflow-hidden rounded-2xl border-4 border-[#FDF2F8] bg-[#FDF2F8] shadow-2xl">
                  {nurseCard.avatar ? (
                    <img src={nurseCard.avatar} alt={profile.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl font-black text-[#EC4899]">
                      {profile.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EC4899] text-white shadow-lg">
                  <CheckBadgeIcon className="h-6 w-6" />
                </div>
              </div>

              <div className="flex-1">
                <div className="accent-label">Hồ sơ y tá chuyên nghiệp</div>
                <h1 className="text-4xl font-black text-[#111827]">{profile.fullName}</h1>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-[#6B7280]">
                  <div className="flex items-center gap-2 rounded-xl border border-[#F3E8FF] bg-white px-4 py-2">
                    <AcademicCapIcon className="h-5 w-5 text-[#EC4899]" />
                    {profile.yearsExperience} năm kinh nghiệm
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-[#F3E8FF] bg-white px-4 py-2">
                    <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                    {nurseCard.averageRating.toFixed(1)} đánh giá
                  </div>
                </div>
                <p className="mt-8 text-lg italic leading-relaxed text-[#6B7280]">
                  "{profile.bio || 'Tôi cam kết mang lại sự chăm sóc tận tâm và an toàn cho gia đình bạn.'}"
                </p>
              </div>
            </section>

            <section className="luxury-card p-10">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#111827]">
                    {isPackage ? 'Chọn lịch cho từng ngày trong gói' : 'Lịch làm việc trống'}
                  </h2>
                  <p className="mt-1 text-sm font-bold text-[#6B7280]">
                    {isPackage
                      ? 'Sau khi chọn ngày bắt đầu, hãy chọn một khung giờ còn trống cho từng ngày.'
                      : 'Vui lòng chọn thời gian bạn muốn y tá đến phục vụ.'}
                  </p>
                </div>
                <CalendarIcon className="h-10 w-10 text-[#EC4899]/30" />
              </div>

              {isPackage ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      min={toDateInputValue(new Date())}
                      value={selectedDate}
                      onChange={(event) => handlePackageStartDate(event.target.value)}
                      className="w-full rounded-2xl border-2 border-[#F3E8FF] bg-white p-5 text-sm font-black text-[#111827] outline-none focus:border-[#EC4899]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">
                      Tiến độ chọn giờ
                    </label>
                    <div className="rounded-2xl border-2 border-[#F3E8FF] bg-white p-5">
                      <div className="text-2xl font-black text-[#111827]">
                        {Object.keys(packageSessionStarts).length}/{packageDates.length}
                      </div>
                      <div className="mt-1 text-xs font-bold text-[#6B7280]">ngày đã chọn giờ chăm sóc</div>
                      <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                        <span className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-600">Có thể chọn</span>
                        <span className="rounded-lg bg-red-50 px-3 py-2 text-red-500">Y tá bận</span>
                        <span className="rounded-lg bg-slate-100 px-3 py-2 text-slate-400">Không mở slot</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    {packageDates.length === 0 || packageTimeRows.length === 0 ? (
                      <div className="rounded-2xl border-2 border-dashed border-[#F3E8FF] bg-white p-8 text-center text-sm font-bold leading-6 text-[#6B7280]">
                        Y tá chưa mở slot trong các ngày của gói. Vui lòng chọn ngày bắt đầu khác.
                      </div>
                    ) : (
                      <div className="custom-scrollbar max-h-[560px] overflow-auto rounded-2xl border border-[#F3E8FF] bg-white shadow-inner shadow-pink-50">
                        <div
                          className="grid min-w-max"
                          style={{ gridTemplateColumns: `112px repeat(${packageDates.length}, minmax(150px, 1fr))` }}
                        >
                          <div className="sticky left-0 top-0 z-30 border-b border-r border-[#F3E8FF] bg-[#FDF2F8] p-4 text-xs font-black text-[#111827] shadow-sm">
                            Giờ
                          </div>
                          {packageDates.map((date, index) => (
                            <div key={date} className="sticky top-0 z-20 border-b border-r border-[#F3E8FF] bg-[#FDF2F8] p-4 text-center shadow-sm last:border-r-0">
                              <div className="text-xs font-black text-[#111827]">Ngày {index + 1}</div>
                              <div className="mt-1 text-[10px] font-bold text-[#6B7280]">{formatDate(date)}</div>
                            </div>
                          ))}

                          {packageTimeRows.map((time) => (
                            <div key={time} className="contents">
                              <div className="sticky left-0 z-10 border-b border-r border-[#F3E8FF] bg-white p-3 text-center text-sm font-black text-[#111827] shadow-sm">
                                {time}
                              </div>
                              {packageDates.map((date) => {
                                const slot = getSlotForDateTime(date, time);
                                const active = slot ? packageSessionStarts[date] === slot.startTime : false;

                                if (!slot) {
                                  return (
                                    <div key={`${date}-${time}`} className="border-b border-r border-[#F3E8FF] bg-slate-50 p-2 last:border-r-0">
                                      <div className="rounded-xl bg-slate-100 px-3 py-4 text-center text-xs font-black text-slate-400">
                                        Không mở
                                      </div>
                                    </div>
                                  );
                                }

                                if (!slot.isAvailable) {
                                  return (
                                    <div key={slot.id} className="border-b border-r border-[#F3E8FF] bg-red-50/40 p-2 last:border-r-0">
                                      <button
                                        type="button"
                                        disabled
                                        className="w-full cursor-not-allowed rounded-xl border-2 border-red-100 bg-red-50 px-3 py-4 text-center text-xs font-black text-red-500"
                                      >
                                        Bận
                                      </button>
                                    </div>
                                  );
                                }

                                return (
                                  <div key={slot.id} className="border-b border-r border-[#F3E8FF] p-2 last:border-r-0">
                                    <button
                                      type="button"
                                      onClick={() => handlePackageSlotSelect(date, slot)}
                                      className={`w-full rounded-xl border-2 px-3 py-4 text-center text-xs font-black transition ${
                                        active
                                          ? 'border-[#EC4899] bg-[#FDF2F8] text-[#EC4899] shadow-md'
                                          : 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-[#EC4899] hover:bg-white hover:text-[#EC4899]'
                                      }`}
                                    >
                                      {active ? 'Đã chọn' : 'Chọn'}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2 rounded-2xl bg-[#FDF2F8] p-5 text-sm font-bold leading-6 text-[#6B7280]">
                    Chọn một ô xanh cho từng ngày trong gói. Ô đỏ là khung giờ y tá đã bận, hệ thống vẫn kiểm tra trùng lịch lần nữa trước khi tạo đặt lịch.
                  </div>
                </div>
              ) : availableDates.length === 0 || singleTimeRows.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[#F3E8FF] py-16 text-center">
                  <ClockIcon className="mx-auto mb-4 h-10 w-10 text-[#9CA3AF]" />
                  <p className="text-sm font-bold text-[#6B7280]">Y tá hiện không còn lịch trống cho dịch vụ này.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">
                      Lịch đã chọn
                    </label>
                    <div className="rounded-2xl border-2 border-[#F3E8FF] bg-white p-5">
                      <div className="text-2xl font-black text-[#111827]">
                        {bookingForm.startTime ? formatDate(new Date(bookingForm.startTime).toLocaleDateString('en-CA')) : 'Chưa chọn'}
                      </div>
                      <div className="mt-1 text-xs font-bold text-[#6B7280]">
                        {bookingForm.startTime
                          ? `${formatTime(bookingForm.startTime)} - ${formatTime(bookingForm.endTime)}`
                          : 'Chọn một ô xanh trong bảng lịch'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">
                      Trạng thái slot
                    </label>
                    <div className="rounded-2xl border-2 border-[#F3E8FF] bg-white p-5">
                      <div className="text-2xl font-black text-[#111827]">
                        {availableDates.length}
                      </div>
                      <div className="mt-1 text-xs font-bold text-[#6B7280]">ngày còn khung giờ trống</div>
                      <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                        <span className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-600">Có thể chọn</span>
                        <span className="rounded-lg bg-red-50 px-3 py-2 text-red-500">Y tá bận</span>
                        <span className="rounded-lg bg-slate-100 px-3 py-2 text-slate-400">Không mở slot</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="custom-scrollbar max-h-[560px] overflow-auto rounded-2xl border border-[#F3E8FF] bg-white shadow-inner shadow-pink-50">
                      <div
                        className="grid min-w-max"
                        style={{ gridTemplateColumns: `112px repeat(${availableDates.length}, minmax(150px, 1fr))` }}
                      >
                        <div className="sticky left-0 top-0 z-30 border-b border-r border-[#F3E8FF] bg-[#FDF2F8] p-4 text-xs font-black text-[#111827] shadow-sm">
                          Giờ
                        </div>
                        {availableDates.map((date) => {
                          const parsed = new Date(`${date}T00:00:00`);
                          return (
                            <div key={date} className="sticky top-0 z-20 border-b border-r border-[#F3E8FF] bg-[#FDF2F8] p-4 text-center shadow-sm last:border-r-0">
                              <div className="text-xs font-black text-[#111827]">
                                {parsed.toLocaleDateString('vi-VN', { weekday: 'short' })}
                              </div>
                              <div className="mt-1 text-[10px] font-bold text-[#6B7280]">{formatDate(date)}</div>
                            </div>
                          );
                        })}

                        {singleTimeRows.map((time) => (
                          <div key={time} className="contents">
                            <div className="sticky left-0 z-10 border-b border-r border-[#F3E8FF] bg-white p-3 text-center text-sm font-black text-[#111827] shadow-sm">
                              {time}
                            </div>
                            {availableDates.map((date) => {
                              const slot = getSlotForDateTime(date, time);
                              const active = slot ? selectedSlotId === slot.id : false;

                              if (!slot) {
                                return (
                                  <div key={`${date}-${time}`} className="border-b border-r border-[#F3E8FF] bg-slate-50 p-2 last:border-r-0">
                                    <div className="rounded-xl bg-slate-100 px-3 py-4 text-center text-xs font-black text-slate-400">
                                      Không mở
                                    </div>
                                  </div>
                                );
                              }

                              if (!slot.isAvailable) {
                                return (
                                  <div key={slot.id} className="border-b border-r border-[#F3E8FF] bg-red-50/40 p-2 last:border-r-0">
                                    <button
                                      type="button"
                                      disabled
                                      className="w-full cursor-not-allowed rounded-xl border-2 border-red-100 bg-red-50 px-3 py-4 text-center text-xs font-black text-red-500"
                                    >
                                      Bận
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <div key={slot.id} className="border-b border-r border-[#F3E8FF] p-2 last:border-r-0">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectSlot(slot)}
                                    className={`w-full rounded-xl border-2 px-3 py-4 text-center text-xs font-black transition ${
                                      active
                                        ? 'border-[#EC4899] bg-[#FDF2F8] text-[#EC4899] shadow-md'
                                        : 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-[#EC4899] hover:bg-white hover:text-[#EC4899]'
                                    }`}
                                  >
                                    {active ? 'Đã chọn' : 'Chọn'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2 rounded-2xl bg-[#FDF2F8] p-5 text-sm font-bold leading-6 text-[#6B7280]">
                    Chọn một ô xanh để đặt dịch vụ lẻ. Ô đỏ là khung giờ y tá đã bận, hệ thống vẫn kiểm tra trùng lịch lần nữa trước khi tạo đặt lịch.
                  </div>
                </div>
              )}
            </section>

            <section className="luxury-card p-10">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#111827]">Đánh giá từ khách hàng</h2>
                  <p className="mt-1 text-sm font-bold text-[#6B7280]">Cảm nhận thực tế của các gia đình đã sử dụng dịch vụ.</p>
                </div>
                <ChatBubbleBottomCenterTextIcon className="h-10 w-10 text-[#EC4899]/30" />
              </div>

              {reviews.length === 0 ? (
                <p className="py-10 text-center text-sm font-bold text-[#6B7280]">Chưa có đánh giá nào cho dịch vụ này.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-[#F3E8FF] bg-[#FDF2F8]/50 p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#EC4899] shadow-sm">
                            {review.customerName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="text-sm font-black text-[#111827]">{review.customerName || 'Khách hàng ẩn danh'}</div>
                            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">{formatRelativeDate(review.createdAt)}</div>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, index) => (
                            <StarSolidIcon key={index} className={`h-4 w-4 ${index < review.rating ? 'text-yellow-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="mt-6 text-sm font-medium leading-relaxed text-[#6B7280]">{review.comment || 'Không có nhận xét chi tiết.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-32">
            <section className="luxury-card border-none bg-[#111827] p-10 text-white shadow-2xl shadow-pink-100">
              <div className="accent-label border-white/10 !bg-white/10 !text-white">Thông tin dịch vụ</div>
              <h2 className="text-2xl font-black text-white">{service.name}</h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                {isPackage ? 'Gói dịch vụ được tính theo toàn bộ lộ trình chăm sóc.' : 'Đơn giá chính thức được tính dựa trên khung giờ bạn lựa chọn.'}
              </p>

              <div className="mt-10 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-[#EC4899]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white/60">Chi phí dự kiến</span>
                  </div>
                  <span className="text-xl font-black text-[#EC4899]">{(nurseCard.servicePrice ?? service.basePrice).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-6 w-6 text-[#EC4899]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white/60">{isPackage ? 'Lộ trình' : 'Thời lượng'}</span>
                  </div>
                  <span className="text-lg font-black text-white">{isPackage ? `${service.packageDays} ngày` : `${service.estimatedDurationMinutes} phút`}</span>
                </div>
              </div>

              <form onSubmit={submitBooking} className="mt-12 space-y-6">
                <div>
                  <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Địa chỉ phục vụ</label>
                  <div className="relative mt-2">
                    <MapPinIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      placeholder="Số nhà, tên đường, quận..."
                      className="w-full rounded-2xl border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-white/20 focus:border-[#EC4899] focus:ring-1 focus:ring-[#EC4899]"
                      value={bookingForm.address}
                      onChange={(event) => setBookingForm({ ...bookingForm, address: event.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Ghi chú cho y tá</label>
                  <div className="relative mt-2">
                    <ChatBubbleBottomCenterTextIcon className="absolute left-4 top-4 h-5 w-5 text-white/30" />
                    <textarea
                      placeholder="Lưu ý đặc biệt nếu có..."
                      rows={3}
                      className="w-full rounded-2xl border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-white/20 focus:border-[#EC4899] focus:ring-1 focus:ring-[#EC4899]"
                      value={bookingForm.notes}
                      onChange={(event) => setBookingForm({ ...bookingForm, notes: event.target.value })}
                    />
                  </div>
                </div>

                {!isAuthenticated ? (
                  <button type="button" onClick={() => navigate('/login')} className="btn-primary w-full rounded-2xl !bg-white py-5 text-xs font-black uppercase tracking-[0.2em] !text-[#111827] shadow-none hover:!bg-[#FDF2F8]">
                    Đăng nhập để đặt lịch
                  </button>
                ) : (
                  <button type="submit" disabled={booking || !canSubmit} className="btn-primary w-full rounded-2xl !bg-[#EC4899] py-5 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-pink-900/40 disabled:opacity-30 disabled:shadow-none">
                    {booking ? 'Đang xử lý...' : isPackage ? 'Xác nhận đặt gói' : 'Xác nhận đặt ngay'}
                  </button>
                )}
              </form>

              <div className="mt-10 flex items-center gap-3 border-t border-white/5 pt-8 text-[10px] font-black uppercase tracking-widest text-white/30">
                <ShieldCheckIcon className="h-5 w-5 text-[#EC4899]" />
                Thanh toán an toàn & bảo mật
              </div>
            </section>

            <div className="rounded-2xl border border-[#F3E8FF] bg-white p-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF2F8] text-[#EC4899]">
                  <HeartIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-[#111827]">Chăm sóc 24/7</div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Hỗ trợ khẩn cấp</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NursePublicDetailPage;
