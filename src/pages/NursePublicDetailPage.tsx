import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
import goongApi, { createGoongSessionToken, extractGoongAddressParts, type GoongPrediction } from '../api/goongApi';
import GoongAddressMap from '../components/GoongAddressMap';
import type {
  AvailabilitySlotDto,
  NurseDiscoveryDto,
  NurseProfileDetailDto,
  ReviewDto,
  ServiceDetailDto,
} from '../api/frontend-api-contract';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { trackEvent } from '../hooks/useAnalytics';

const toDateInputValue = (value: Date) => value.toLocaleDateString('en-CA');

const addDays = (date: string, offset: number) => {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + offset);
  return toDateInputValue(value);
};

const addMinutesIso = (value: string, minutes: number) => {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() + Math.max(minutes, 1));
  return date.toISOString();
};

const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN');
const formatTime = (value: string) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const pendingBookingStorageKey = 'caremate_pending_booking';

const formatRelativeDate = (value: string | null, t: any) => {
  if (!value) return t('nurseDetail.time.recently');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('nurseDetail.time.recently');

  const diffDays = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return t('nurseDetail.time.today');
  if (diffDays === 1) return t('nurseDetail.time.oneDayAgo');
  if (diffDays < 7) return t('nurseDetail.time.daysAgo', { days: diffDays });
  if (diffDays < 30) return t('nurseDetail.time.weeksAgo', { weeks: Math.floor(diffDays / 7) });
  return date.toLocaleDateString('vi-VN');
};

const NursePublicDetailPage = () => {
  const { t, i18n } = useTranslation();
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
  const [addressSuggestions, setAddressSuggestions] = useState<GoongPrediction[]>([]);
  const [addressSuggestionsOpen, setAddressSuggestionsOpen] = useState(false);
  const [addressLookupLoading, setAddressLookupLoading] = useState(false);
  const goongSessionTokenRef = useRef(createGoongSessionToken());
  const suppressNextAddressLookupRef = useRef(false);
  const [bookingLocation, setBookingLocation] = useState<{ latitude: number; longitude: number } | null>(null);
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
      showToast(t('nurseDetail.toastNoService'), 'warning');
      navigate('/services');
    }
  }, [navigate, serviceIdFromUrl, showToast, t]);

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
          showToast(t('nurseDetail.toastNoMatch'), 'warning');
          navigate('/services');
          return;
        }

        setProfile(profileData);
        setSlots(slotData);
        setService(serviceData);
        setNurseCard(match);
        setReviews(reviewData);
        trackEvent('engagement', 'view_nurse_profile', `nurseId:${userId}`);
        trackEvent('engagement', 'view_service', `serviceId:${serviceData.id}`);

        if (serviceData.serviceKind === 'package' || serviceData.packageDays) {
          setSelectedDate(toDateInputValue(new Date()));
        }
      } catch {
        showToast(t('nurseDetail.toastError'), 'error');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [i18n.language, navigate, serviceIdFromUrl, showToast, userId]);

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

  const packageAvailableSlotsByDate = useMemo(
    () =>
      packageDates.map((date) => ({
        date,
        slots: (slotsByDate[date] || []).filter((slot) => slot.isAvailable),
      })),
    [packageDates, slotsByDate],
  );

  const singleAvailableSlotsByDate = useMemo(
    () =>
      availableDates.map((date) => ({
        date,
        slots: (slotsByDate[date] || []).filter((slot) => slot.isAvailable),
      })).filter((item) => item.slots.length > 0),
    [availableDates, slotsByDate],
  );

  const packageScheduleComplete = packageDates.length > 0 && packageDates.every((date) => Boolean(packageSessionStarts[date]));
  const canSubmit = Boolean(bookingForm.address && (isPackage ? packageScheduleComplete : bookingForm.startTime && selectedSlotId));

  useEffect(() => {
    const input = bookingForm.address.trim();

    if (suppressNextAddressLookupRef.current) {
      suppressNextAddressLookupRef.current = false;
      return;
    }

    if (!goongApi.hasApiKey || input.length < 3) {
      setAddressSuggestions([]);
      setAddressLookupLoading(false);
      return;
    }

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setAddressLookupLoading(true);
      void goongApi
        .autocomplete(input, goongSessionTokenRef.current, abortController.signal)
        .then((suggestions) => {
          setAddressSuggestions(suggestions);
        })
        .catch((error: unknown) => {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            setAddressSuggestions([]);
          }
        })
        .finally(() => {
          if (!abortController.signal.aborted) {
            setAddressLookupLoading(false);
          }
        });
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [bookingForm.address]);

  useEffect(() => {
    if (!isPackage && availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, isPackage, selectedDate]);

  const handleSelectSlot = (slot: AvailabilitySlotDto) => {
    if (!slot.isAvailable) return;
    const bookingEndTime = addMinutesIso(slot.startTime, service?.estimatedDurationMinutes ?? 1);
    setSelectedDate(new Date(slot.startTime).toLocaleDateString('en-CA'));
    setSelectedSlotId(slot.id);
    setBookingForm((prev) => ({
      ...prev,
      startTime: slot.startTime,
      endTime: bookingEndTime,
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

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBookingForm({ ...bookingForm, address: event.target.value });
    setBookingLocation(null);
    setAddressSuggestionsOpen(true);
  };

  const handleSelectAddress = async (suggestion: GoongPrediction) => {
    const fallbackAddress = suggestion.description;

    suppressNextAddressLookupRef.current = true;
    setBookingForm((prev) => ({ ...prev, address: fallbackAddress }));
    setAddressSuggestionsOpen(false);
    setAddressSuggestions([]);

    try {
      const detail = await goongApi.getPlaceDetail(suggestion.place_id, goongSessionTokenRef.current);
      const addressParts = extractGoongAddressParts(detail, fallbackAddress);

      if (addressParts.latitude != null && addressParts.longitude != null) {
        setBookingLocation({
          latitude: addressParts.latitude,
          longitude: addressParts.longitude,
        });
      }

      suppressNextAddressLookupRef.current = true;
      setBookingForm((prev) => ({
        ...prev,
        address: addressParts.fullAddress || fallbackAddress,
      }));
      goongSessionTokenRef.current = createGoongSessionToken();
    } catch {
      suppressNextAddressLookupRef.current = true;
      setBookingForm((prev) => ({ ...prev, address: fallbackAddress }));
    }
  };

  const handleMapLocationSelect = async (location: { latitude: number; longitude: number }) => {
    setBookingLocation(location);
    setAddressLookupLoading(true);

    try {
      const detail = await goongApi.reverseGeocode(location.latitude, location.longitude);
      const fallbackAddress = `${location.latitude}, ${location.longitude}`;
      const addressParts = extractGoongAddressParts(detail, fallbackAddress);

      suppressNextAddressLookupRef.current = true;
      setBookingForm((prev) => ({
        ...prev,
        address: addressParts.fullAddress || fallbackAddress,
      }));
      setAddressSuggestionsOpen(false);
      setAddressSuggestions([]);
    } catch {
      suppressNextAddressLookupRef.current = true;
      setBookingForm((prev) => ({
        ...prev,
        address: `${location.latitude}, ${location.longitude}`,
      }));
    } finally {
      setAddressLookupLoading(false);
    }
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
        latitude: bookingLocation?.latitude,
        longitude: bookingLocation?.longitude,
        notes: bookingForm.notes || null,
      };

      if (!isPackage) {
        payload.availabilitySlotId = selectedSlotId ?? undefined;
        payload.endTime = bookingForm.endTime;
      } else {
        payload.packageSessionStartTimes = packageDates.map((date) => packageSessionStarts[date]);
      }

      const paymentPayload = {
        ...payload,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      };

      trackEvent('conversion', 'start_booking', `serviceId:${bookingForm.serviceId}`);
      localStorage.setItem(pendingBookingStorageKey, JSON.stringify(payload));
      const paymentLink = await caremateApi.createPayOSBookingPaymentLink(paymentPayload);
      window.location.href = paymentLink.checkoutUrl;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      showToast(axiosError.response?.data?.message || t('nurseDetail.bookError'), 'error');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-[linear-gradient(180deg,#fbfaf8_0%,#ffffff_55%,#fff7fb_100%)] px-5 py-32">
        <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <div className="animate-pulse rounded-2xl bg-white p-10 shadow-xl shadow-slate-200/60">
              <div className="flex gap-8">
                <div className="h-44 w-44 rounded-2xl bg-slate-100" />
                <div className="flex-1 space-y-4">
                  <div className="h-4 w-40 rounded bg-slate-100" />
                  <div className="h-10 w-2/3 rounded bg-slate-100" />
                  <div className="h-5 w-1/2 rounded bg-slate-100" />
                  <div className="h-20 w-full rounded bg-slate-100" />
                </div>
              </div>
            </div>
            <div className="animate-pulse rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/60">
              <div className="h-8 w-56 rounded bg-slate-100" />
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 rounded-2xl bg-slate-100" />)}
              </div>
            </div>
          </div>
          <div className="animate-pulse rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/60">
            <div className="h-4 w-36 rounded bg-slate-100" />
            <div className="mt-5 h-8 w-2/3 rounded bg-slate-100" />
            <div className="mt-8 h-24 rounded-2xl bg-slate-100" />
            <div className="mt-6 h-14 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !service || !nurseCard) return null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbfaf8_0%,#ffffff_44%,#fff7fb_100%)] pb-48 pt-32 selection:bg-[#EC4899]/10 sm:pb-40">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-6">
        <button
          onClick={() => navigate(-1)}
          className="group mb-12 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#6B7280] transition-colors hover:text-[#EC4899]"
        >
          <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          {t('nurseDetail.back')}
        </button>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-10">
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="luxury-card flex flex-col items-start gap-8 p-6 sm:flex-row sm:gap-14 sm:p-10">
              <div className="relative shrink-0">
                <div className="h-32 w-32 overflow-hidden rounded-2xl border-[6px] border-white bg-[#FDF2F8] shadow-2xl shadow-slate-200 sm:h-48 sm:w-48 sm:border-[8px]">
                  {nurseCard.avatar ? (
                    <img src={nurseCard.avatar} alt={profile.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-black text-[#EC4899] sm:text-5xl">
                      {profile.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#EC4899] text-white shadow-lg sm:h-10 sm:w-10">
                  <CheckBadgeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="inline-flex h-8 items-center rounded-full bg-[#FDF2F8] px-4 text-[9px] font-black uppercase leading-none tracking-[0.22em] text-[#DB2777] ring-1 ring-[#FBCFE8] sm:h-10 sm:px-5 sm:text-[10px]">
                    {t('nurseDetail.professionalProfile')}
                  </div>
                  <div className="inline-flex h-8 items-center gap-1.5 rounded-full bg-emerald-50 px-4 text-[9px] font-black uppercase leading-none tracking-[0.22em] text-emerald-600 ring-1 ring-emerald-100 sm:h-10 sm:gap-2 sm:px-5 sm:text-[10px]">
                    <CheckBadgeIcon className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                    <span>{t('nurseDetail.verified')}</span>
                  </div>
                </div>
                <h1 className="mt-4 break-words text-2xl font-black leading-[1.1] text-[#10233F] sm:text-4xl">{profile.fullName}</h1>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-[#6B7280]">
                  <div className="flex items-center gap-2 rounded-xl border border-[#F3E8FF] bg-white px-4 py-2">
                    <AcademicCapIcon className="h-5 w-5 text-[#EC4899]" />
                    {t('nurseDetail.yearsExp', { years: profile.yearsExperience })}
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-[#F3E8FF] bg-white px-4 py-2">
                    <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                    {t('nurseDetail.reviews', { rating: nurseCard.averageRating.toFixed(1) })}
                  </div>
                  {(profile.address || profile.defaultAddress?.fullAddress || profile.district) && (
                    <div className="flex items-center gap-2 rounded-xl border border-[#F3E8FF] bg-white px-4 py-2">
                      <MapPinIcon className="h-5 w-5 shrink-0 text-[#EC4899]" />
                      <span className="break-words text-left text-[13px] leading-snug">
                        {profile.address || profile.defaultAddress?.fullAddress || t('nurseDetail.area', { district: profile.district })}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-8 text-[18px] italic leading-[1.75] text-[#6B7280]">
                  "{profile.bio || t('nurseDetail.defaultBio')}"
                </p>
              </div>
            </motion.section>

            <section data-tour="booking-schedule" className="luxury-card p-6 pb-28 sm:p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#10233F] sm:text-[24px]">
                    {isPackage ? t('nurseDetail.schedulePackageTitle') : t('nurseDetail.scheduleSingleTitle')}
                  </h2>
                  <p className="mt-2 text-[16px] leading-[1.7] text-[#6B7280]">
                    {isPackage
                      ? t('nurseDetail.schedulePackageDesc')
                      : t('nurseDetail.scheduleSingleDesc')}
                  </p>
                </div>
                <CalendarIcon className="h-10 w-10 text-[#EC4899]/30" />
              </div>

              {isPackage ? (
                <div className="space-y-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">
                        {t('nurseDetail.startDate')}
                      </label>
                      <input
                        type="date"
                        min={toDateInputValue(new Date())}
                        value={selectedDate}
                        onChange={(event) => handlePackageStartDate(event.target.value)}
                        className="w-full rounded-2xl border-none bg-[#F9FAFB] p-5 text-[16px] font-semibold text-[#10233F] outline-none focus:ring-2 focus:ring-[#EC4899]/20"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">
                        {t('nurseDetail.progress')}
                      </label>
                      <div className="rounded-2xl bg-[#F9FAFB] p-5">
                        <div className="text-2xl font-black text-[#10233F]">
                          {Object.keys(packageSessionStarts).length}/{packageDates.length}
                        </div>
                        <div className="mt-1 text-[15px] leading-[1.7] text-[#6B7280]">{t('nurseDetail.daysSelected')}</div>
                        <div className="mt-4 inline-flex rounded-full bg-[#FDF2F8] px-3 py-2 text-[12px] font-bold text-[#DB2777]">
                          {t('nurseDetail.showAvailable')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {packageDates.length === 0 || packageAvailableSlotsByDate.every((item) => item.slots.length === 0) ? (
                    <div className="rounded-2xl bg-[#F9FAFB] p-8 text-center text-[15px] leading-[1.7] text-[#6B7280]">
                      {t('nurseDetail.noPackageSlots')}
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {packageAvailableSlotsByDate.map(({ date, slots }, index) => {
                        if (slots.length === 0) return null;

                        return (
                          <div key={date} className="rounded-2xl bg-[#F9FAFB] p-5">
                            <div className="mb-4 flex items-start justify-between gap-4">
                              <div>
                                <div className="text-[13px] font-medium text-[#9CA3AF]">{t('nurseDetail.day', { index: index + 1 })}</div>
                                <div className="mt-1 text-[20px] font-bold text-[#10233F]">{formatDate(date)}</div>
                              </div>
                              {packageSessionStarts[date] && (
                                <div className="rounded-full bg-[#FDF2F8] px-3 py-1.5 text-[12px] font-bold text-[#DB2777]">{t('nurseDetail.selected')}</div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {slots.map((slot) => {
                                const active = packageSessionStarts[date] === slot.startTime;
                                return (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    data-tour="booking-slot"
                                    onClick={() => handlePackageSlotSelect(date, slot)}
                                    className={`rounded-2xl px-4 py-4 text-left ring-1 ring-transparent transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                                      active
                                        ? 'bg-[#EC4899] text-white shadow-[0_16px_30px_rgba(236,72,153,0.28)] ring-[#EC4899]/20'
                                        : 'bg-white text-[#10233F] hover:bg-[#FFF7FA] hover:ring-[#EC4899]/15'
                                    }`}
                                  >
                                    <div className="text-[16px] font-bold">{formatTime(slot.startTime)}</div>
                                    <div className={`mt-1 text-[13px] ${active ? 'text-white/80' : 'text-[#9CA3AF]'}`}>
                                      {formatTime(slot.endTime)}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="rounded-2xl bg-[#FFF7FA] p-5 text-[15px] leading-[1.7] text-[#6B7280]">
                    {t('nurseDetail.packageNote')}
                  </div>
                </div>
              ) : singleAvailableSlotsByDate.length === 0 ? (
                <div className="rounded-2xl bg-[#F9FAFB] py-16 text-center">
                  <ClockIcon className="mx-auto mb-4 h-10 w-10 text-[#9CA3AF]" />
                  <p className="text-[15px] leading-[1.7] text-[#6B7280]">{t('nurseDetail.noSingleSlots')}</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">
                        {t('nurseDetail.selectedSchedule')}
                      </label>
                      <div className="rounded-2xl bg-[#F9FAFB] p-5">
                        <div className="text-2xl font-black text-[#10233F]">
                          {bookingForm.startTime ? formatDate(new Date(bookingForm.startTime).toLocaleDateString('en-CA')) : t('nurseDetail.notSelected')}
                        </div>
                        <div className="mt-1 text-[15px] leading-[1.7] text-[#6B7280]">
                          {bookingForm.startTime
                            ? `${formatTime(bookingForm.startTime)} - ${formatTime(bookingForm.endTime)}`
                            : t('nurseDetail.selectBelow')}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">
                        {t('nurseDetail.availableSchedule')}
                      </label>
                      <div className="rounded-2xl bg-[#F9FAFB] p-5">
                        <div className="text-2xl font-black text-[#10233F]">
                          {singleAvailableSlotsByDate.length}
                        </div>
                        <div className="mt-1 text-[15px] leading-[1.7] text-[#6B7280]">{t('nurseDetail.daysAvailable')}</div>
                        <div className="mt-4 inline-flex rounded-full bg-[#FDF2F8] px-3 py-2 text-[12px] font-bold text-[#DB2777]">
                          {t('nurseDetail.showBookable')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {singleAvailableSlotsByDate.map(({ date, slots }) => {
                      const parsed = new Date(`${date}T00:00:00`);
                      return (
                        <div key={date} className="rounded-2xl bg-[#F9FAFB] p-5">
                          <div className="mb-4">
                            <div className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#9CA3AF]">
                              {parsed.toLocaleDateString('vi-VN', { weekday: 'long' })}
                            </div>
                            <div className="mt-1 text-[20px] font-bold text-[#10233F]">{formatDate(date)}</div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {slots.map((slot) => {
                              const active = selectedSlotId === slot.id;
                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  data-tour="booking-slot"
                                  onClick={() => handleSelectSlot(slot)}
                                  className={`rounded-2xl px-4 py-4 text-left ring-1 ring-transparent transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                                      active
                                        ? 'bg-[#EC4899] text-white shadow-[0_16px_30px_rgba(236,72,153,0.28)] ring-[#EC4899]/20'
                                        : 'bg-white text-[#10233F] hover:bg-[#FFF7FA] hover:ring-[#EC4899]/15'
                                    }`}
                                >
                                  <div className="text-[16px] font-bold">{formatTime(slot.startTime)}</div>
                                  <div className={`mt-1 text-[13px] ${active ? 'text-white/80' : 'text-[#9CA3AF]'}`}>
                                    {t('nurseDetail.durationTo', { mins: service.estimatedDurationMinutes, time: formatTime(addMinutesIso(slot.startTime, service.estimatedDurationMinutes)) })}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-2xl bg-[#FFF7FA] p-5 text-[15px] leading-[1.7] text-[#6B7280]">
                    {t('nurseDetail.singleNote')}
                  </div>
                </div>
              )}
            </section>

            <section className="luxury-card p-6 sm:p-10">
              <div className="mb-8 flex items-center justify-between sm:mb-10">
                <div>
                  <h2 className="text-xl font-black text-[#10233F] sm:text-2xl">{t('nurseDetail.customerReviewsTitle')}</h2>
                  <p className="mt-1 text-sm font-bold text-[#6B7280]">{t('nurseDetail.customerReviewsDesc')}</p>
                </div>
                <ChatBubbleBottomCenterTextIcon className="h-10 w-10 text-[#EC4899]/30" />
              </div>

              {reviews.length === 0 ? (
                <p className="py-10 text-center text-sm font-bold text-[#6B7280]">{t('nurseDetail.noReviews')}</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-[#F3E8FF] bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDF2F8] text-lg font-black text-[#EC4899] shadow-sm">
                            {review.customerName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="text-[15px] font-black text-[#10233F]">{review.customerName || t('nurseDetail.anonymous')}</div>
                            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">{formatRelativeDate(review.createdAt, t)}</div>
                          </div>
                        </div>
                        <div className="rounded-full bg-amber-50 px-3 py-2">
                          <div className="flex gap-0.5">
                          {[...Array(5)].map((_, index) => (
                            <StarSolidIcon key={index} className={`h-4 w-4 ${index < review.rating ? 'text-yellow-400' : 'text-slate-200'}`} />
                          ))}
                          </div>
                        </div>
                      </div>
                      <p className="mt-6 text-[15px] font-medium leading-[1.75] text-[#6B7280]">{review.comment || t('nurseDetail.noComment')}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-32">
            <section className="luxury-card border-none bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-8">
              <div className="accent-label !bg-[#FDF2F8] !text-[#DB2777]">{t('nurseDetail.serviceInfo')}</div>
              <h2 className="text-xl font-black text-[#10233F] sm:text-[24px]">{service.name}</h2>
              <p className="mt-3 text-[15px] leading-[1.7] text-[#6B7280]">
                {isPackage ? t('nurseDetail.packagePricing') : t('nurseDetail.singlePricing')}
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-[#F9FAFB] p-5">
                  <div className="flex items-center gap-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-[#EC4899]" />
                    <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">{t('nurseDetail.estimatedCost')}</span>
                  </div>
                  <span className="text-[24px] font-black text-[#EC4899]">{(nurseCard.servicePrice ?? service.basePrice).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#F9FAFB] p-5">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-6 w-6 text-[#EC4899]" />
                    <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">{isPackage ? t('nurseDetail.durationLabelPackage') : t('nurseDetail.durationLabelSingle')}</span>
                  </div>
                  <span className="text-[20px] font-black text-[#10233F]">{isPackage ? t('nurseDetail.packageDays', { days: service.packageDays }) : t('nurseDetail.singleMins', { mins: service.estimatedDurationMinutes })}</span>
                </div>
              </div>

              <form onSubmit={submitBooking} className="mt-8 space-y-5">
                <div data-tour="booking-address">
                  <label className="ml-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">{t('nurseDetail.addressLabel')}</label>
                  <div className="relative mt-2">
                    <MapPinIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="text"
                      placeholder={t('nurseDetail.addressPlaceholder')}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-[15px] font-semibold text-[#10233F] shadow-sm placeholder:text-[#9CA3AF] focus:border-[#EC4899]/30 focus:bg-white focus:ring-4 focus:ring-[#EC4899]/10"
                      value={bookingForm.address}
                      onBlur={() => window.setTimeout(() => setAddressSuggestionsOpen(false), 150)}
                      onChange={handleAddressChange}
                      onFocus={() => setAddressSuggestionsOpen(addressSuggestions.length > 0)}
                      required
                    />
                    {addressLookupLoading && (
                      <div className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-[#EC4899] border-t-transparent" />
                    )}
                    {addressSuggestionsOpen && addressSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#F3E8FF] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                        {addressSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.place_id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => void handleSelectAddress(suggestion)}
                            className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#FFF7FA]"
                          >
                            <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#EC4899]" />
                            <span className="min-w-0">
                              <span className="block truncate text-[14px] font-bold text-[#10233F]">
                                {suggestion.structured_formatting?.main_text || suggestion.description}
                              </span>
                              {suggestion.structured_formatting?.secondary_text && (
                                <span className="mt-0.5 block truncate text-[12px] font-medium text-[#6B7280]">
                                  {suggestion.structured_formatting.secondary_text}
                                </span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <GoongAddressMap
                      latitude={bookingLocation?.latitude}
                      longitude={bookingLocation?.longitude}
                      heightClassName="h-[220px]"
                      helperText={t('nurseDetail.mapHelper')}
                      onSelectLocation={(location) => void handleMapLocationSelect(location)}
                    />
                  </div>
                  {!goongApi.hasApiKey && (
                    <p className="ml-1 mt-2 text-[12px] font-medium text-[#9CA3AF]">
                      Backend cần GOONG_API_KEY để bật gợi ý địa chỉ Goong.
                    </p>
                  )}
                </div>
                <div>
                  <label className="ml-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">{t('nurseDetail.notesLabel')}</label>
                  <div className="relative mt-2">
                    <ChatBubbleBottomCenterTextIcon className="absolute left-4 top-4 h-5 w-5 text-[#9CA3AF]" />
                    <textarea
                      placeholder={t('nurseDetail.notesPlaceholder')}
                      rows={3}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-[15px] font-semibold text-[#10233F] shadow-sm placeholder:text-[#9CA3AF] focus:border-[#EC4899]/30 focus:bg-white focus:ring-4 focus:ring-[#EC4899]/10"
                      value={bookingForm.notes}
                      onChange={(event) => setBookingForm({ ...bookingForm, notes: event.target.value })}
                    />
                  </div>
                </div>

                {!isAuthenticated ? (
                  <button type="button" data-tour="booking-submit" onClick={() => navigate('/login')} className="btn-primary w-full rounded-2xl !bg-[#10233F] py-5 text-[15px] font-black !text-white shadow-xl shadow-[#10233F]/10 hover:!bg-slate-800">
                    {t('nurseDetail.loginToBook')}
                  </button>
                ) : (
                  <button type="submit" data-tour="booking-submit" disabled={booking || !canSubmit} className="btn-primary w-full rounded-2xl !bg-[#EC4899] py-5 text-[15px] font-black !text-white shadow-[0_18px_30px_rgba(236,72,153,0.25)] disabled:opacity-30 disabled:shadow-none">
                    {booking ? t('nurseDetail.processing') : t('nurseDetail.continueBooking')}
                  </button>
                )}
              </form>

              <div className="mt-8 flex items-center gap-3 pt-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#9CA3AF]">
                <ShieldCheckIcon className="h-5 w-5 text-[#EC4899]" />
                {t('nurseDetail.securePayment')}
              </div>
            </section>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF2F8] text-[#EC4899]">
                  <HeartIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[15px] font-black text-[#10233F]">{t('nurseDetail.support247')}</div>
                  <div className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">{t('nurseDetail.emergencySupport')}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      {isAuthenticated && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 lg:px-6">
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] sm:text-[13px]">{t('nurseDetail.progressLabel')}</div>
              <div className="mt-0.5 truncate text-[13px] font-bold text-[#10233F] sm:mt-1 sm:text-[16px]">
                {canSubmit ? t('nurseDetail.readyToContinue') : t('nurseDetail.selectToContinue')}
              </div>
            </div>
            <button
              type="button"
              data-tour="booking-submit"
              disabled={!canSubmit || booking}
              onClick={() => document.querySelector('form')?.requestSubmit()}
              className="shrink-0 rounded-xl bg-[#EC4899] px-5 py-3 text-[13px] font-black text-white shadow-[0_18px_30px_rgba(236,72,153,0.22)] transition hover:bg-[#db2777] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:rounded-2xl sm:px-6 sm:py-4 sm:text-[14px]"
            >
              {booking ? t('nurseDetail.processing') : t('nurseDetail.continueBooking')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NursePublicDetailPage;



