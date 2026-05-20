import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    AcademicCapIcon,
    Squares2X2Icon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import caremateApi from '../api/caremateApi';
import type { ServiceDetailDto, NurseDiscoveryDto, PackageScheduleEntryDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';

const categoryLabels: Record<string, string> = {
    'cham-me-sau-sinh': 'Chăm mẹ sau sinh',
    'cham-be-so-sinh': 'Chăm bé sơ sinh',
    'phuc-hoi-suc-khoe': 'Phục hồi sức khỏe',
    'tu-van-tai-nha': 'Tư vấn tại nhà',
    'ho-tro-tinh-than': 'Hỗ trợ tinh thần',
};

const categoryDescriptions: Record<string, string> = {
    'cham-me-sau-sinh': 'Các dịch vụ hỗ trợ mẹ hồi phục, nghỉ ngơi và thích nghi tốt hơn sau sinh.',
    'cham-be-so-sinh': 'Nhóm dịch vụ tập trung vào việc chăm sóc, vệ sinh và theo dõi em bé tại nhà.',
    'phuc-hoi-suc-khoe': 'Các giải pháp hỗ trợ giảm đau, phục hồi cơ thể và theo dõi sức khỏe sau sinh.',
    'tu-van-tai-nha': 'Các buổi tư vấn chuyên sâu giúp gia đình hiểu và chăm bé đúng cách hơn.',
    'ho-tro-tinh-than': 'Dịch vụ đồng hành cùng mẹ trong giai đoạn dễ mệt mỏi, căng thẳng và quá tải.',
};

const includedServiceLabels: Record<string, string> = {
    'baby-bathing': 'Tắm bé',
    'mother-health-monitoring': 'Theo dõi mẹ',
    'baby-health-monitoring': 'Theo dõi bé',
    'breastfeeding-support': 'Hỗ trợ cho bú',
    'postpartum-massage': 'Massage sau sinh',
    'nutrition-consultation': 'Tư vấn dinh dưỡng',
    'night-care': 'Chăm bé ban đêm',
    'house-support': 'Hỗ trợ việc nhà',
    'mental-wellness': 'Hỗ trợ tâm lý',
    'emergency-consultation': 'Tư vấn khẩn',
};

const getCategoryLabel = (category: string) => {
    if (category === 'goi-dich-vu') return 'Gói dịch vụ';
    if (category === 'ho-tro-gia-dinh') return 'Hỗ trợ gia đình';
    return categoryLabels[category] ?? category;
};

const getIncludedServiceLabels = (service: ServiceDetailDto) =>
    service.includedServiceKeys
        ?.split(',')
        .map((key) => includedServiceLabels[key.trim()] ?? key.trim())
        .filter(Boolean) ?? [];

const getScheduleServiceLabels = (keys?: string | null) =>
    keys
        ?.split(',')
        .map((key) => includedServiceLabels[key.trim()] ?? key.trim())
        .filter(Boolean) ?? [];

const getPrimaryServiceText = (service: ServiceDetailDto, day: number) => {
    const labels = getIncludedServiceLabels(service);
    if (labels.length === 0) return 'Kiểm tra sức khỏe, chăm sóc cơ bản và tư vấn tại nhà.';

    const start = (day - 1) % labels.length;
    const ordered = [...labels.slice(start), ...labels.slice(0, start)].slice(0, Math.min(3, labels.length));
    return `Tập trung vào ${ordered.join(', ')} và ghi nhận tình trạng của mẹ/bé trong ngày.`;
};

const getVisiblePackageSchedule = (service?: ServiceDetailDto | null): PackageScheduleEntryDto[] => {
    if (!service || service.serviceKind !== 'package') return [];
    if (service.packageSchedule?.length > 0) return service.packageSchedule;

    const totalDays = service.packageDays ?? 0;
    if (totalDays <= 0) return [];

    return Array.from({ length: totalDays }, (_, index) => {
        const day = index + 1;
        return {
            day,
            title: day === 1
                ? 'Ngày 1: Đánh giá ban đầu'
                : day === totalDays
                    ? `Ngày ${day}: Tổng kết liệu trình`
                    : `Ngày ${day}: Chăm sóc theo kế hoạch`,
            description: day === 1
                ? 'Y tá đánh giá tình trạng ban đầu, thống nhất mục tiêu chăm sóc và bắt đầu các hạng mục trong gói.'
                : day === totalDays
                    ? 'Hoàn tất các hạng mục còn lại, tổng kết tiến triển và hướng dẫn gia đình tiếp tục chăm sóc sau gói.'
                    : getPrimaryServiceText(service, day),
            serviceKeys: service.includedServiceKeys,
        };
    });
};

const getScheduleDescription = (service: ServiceDetailDto, item: PackageScheduleEntryDto) =>
    item.description || getPrimaryServiceText(service, item.day);

const getCompactScheduleDescription = (service: ServiceDetailDto, item: PackageScheduleEntryDto) => {
    const description = getScheduleDescription(service, item).replace(/\s+/g, ' ').trim();
    if (description.length <= 110) return description;
    return `${description.slice(0, 107).trim()}...`;
};

const getScheduleTitle = (item: PackageScheduleEntryDto) => {
    const title = item.title?.trim();
    if (!title) return `Buổi ${item.day}`;

    const segments = title.split(':');
    return segments.length > 1 ? segments.slice(1).join(':').trim() : title;
};

const ServicesPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [services, setServices] = useState<ServiceDetailDto[]>([]);
    const [nurses, setNurses] = useState<NurseDiscoveryDto[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [nursesLoading, setNursesLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scheduleWeekIndex, setScheduleWeekIndex] = useState(0);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const serviceData = await caremateApi.getServices();
                const activeServices = serviceData.filter(s => s.status === 'active');
                setServices(activeServices);

                if (activeServices.length > 0) {
                    const firstId = activeServices[0].id;
                    setSelectedServiceId(firstId);
                    setSelectedCategory(activeServices[0].category);
                    const nurseData = await caremateApi.getNurses({ serviceId: firstId });
                    setNurses(nurseData);
                }
            } catch {
                showToast('Không thể kết nối đến hệ thống dữ liệu.', 'error');
            } finally {
                setLoading(false);
            }
        };
        void init();
    }, [showToast]);

    const handleServiceSelect = async (service: ServiceDetailDto) => {
        if (service.id === selectedServiceId) return;
        setSelectedServiceId(service.id);
        setSelectedCategory(service.category);
        setScheduleWeekIndex(0);
        try {
            setNursesLoading(true);
            const nurseData = await caremateApi.getNurses({ serviceId: service.id });
            setNurses(nurseData);
        } catch {
            showToast('Lỗi khi tải danh sách điều dưỡng.', 'error');
        } finally {
            setNursesLoading(false);
        }
    };

    const categories = useMemo(() => {
        const uniqueCategories = Array.from(
            new Set(
                services
                    .map(service => service.category?.trim())
                    .filter((category): category is string => Boolean(category))
            )
        );
        return ['all', ...uniqueCategories];
    }, [services]);

    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchSearch =
                service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

            const normalizedCategory = service.category?.trim() ?? '';
            const matchCategory = selectedCategory === 'all' || normalizedCategory === selectedCategory;
            return matchSearch && matchCategory;
        });
    }, [services, searchQuery, selectedCategory]);

    const selectedService = useMemo(() => services.find(s => s.id === selectedServiceId), [services, selectedServiceId]);
    const featuredNurse = useMemo(() => nurses[0] ?? null, [nurses]);
    const remainingNurses = useMemo(
        () => nurses.filter(nurse => nurse.userId !== featuredNurse?.userId),
        [nurses, featuredNurse]
    );
    const selectedPackageSchedule = useMemo(() => getVisiblePackageSchedule(selectedService), [selectedService]);
    const totalScheduleWeeks = Math.max(1, Math.ceil(selectedPackageSchedule.length / 7));
    const currentWeekSchedule = useMemo(
        () => selectedPackageSchedule.slice(scheduleWeekIndex * 7, scheduleWeekIndex * 7 + 7),
        [selectedPackageSchedule, scheduleWeekIndex]
    );
    const selectedCategoryDescription =
        selectedCategory === 'goi-dich-vu'
            ? 'Các gói nhiều ngày kết hợp nhiều dịch vụ, phù hợp khi gia đình cần lịch chăm sóc liên tục.'
            : selectedCategory === 'ho-tro-gia-dinh'
                ? 'Hỗ trợ các việc nhẹ quanh không gian chăm sóc để gia đình giảm tải.'
                : categoryDescriptions[selectedCategory];

    useEffect(() => {
        if (scheduleWeekIndex > totalScheduleWeeks - 1) {
            setScheduleWeekIndex(Math.max(0, totalScheduleWeeks - 1));
        }
    }, [scheduleWeekIndex, totalScheduleWeeks]);

    if (loading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-brand border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang chuẩn bị dịch vụ...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FCFCFD]">
            <section className="relative overflow-hidden bg-slate-900 pb-28 pt-24">
                <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-brand/10 blur-[120px] -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-brand/5 blur-[100px] -mb-32 -ml-32"></div>

                <div className="relative z-10 w-full px-4 text-center sm:px-6 lg:px-10 2xl:px-12">
                    <div className="mx-auto max-w-5xl">
                        <div className="mx-auto mb-6 w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-white/80">
                            Hệ thống dịch vụ CareMate
                        </div>
                        <h1 className="mb-6 text-4xl font-black leading-tight text-white lg:text-6xl">
                            Chọn dịch vụ chăm sóc
                            <br />
                            <span className="text-brand">theo cách dễ hiểu và dễ quyết định hơn</span>
                        </h1>
                        <p className="mx-auto max-w-3xl text-base font-medium leading-8 text-white/55 lg:text-lg">
                            Từ việc lọc dịch vụ, xem lộ trình từng buổi cho đến chọn điều dưỡng phù hợp, toàn bộ hành trình được sắp lại để gia đình đọc nhanh và hình dung rõ hơn.
                        </p>
                    </div>
                </div>
            </section>

            <div className="relative z-20 mx-auto -mt-12 w-full max-w-[1680px] px-2 sm:px-4 lg:px-4">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8">
                    <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="flex items-center gap-4">
                            <Squares2X2Icon className="h-6 w-6 text-brand" />
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-slate-900">1. Chọn nhóm dịch vụ phù hợp</h2>
                                <p className="mt-1 text-sm font-medium leading-7 text-slate-500">Dịch vụ được chia theo nhóm để gia đình lọc nhanh, đọc nhanh và ra quyết định đỡ mệt hơn.</p>
                            </div>
                        </div>

                        <div className="relative w-full max-w-md group">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand" />
                            <input
                                type="text"
                                placeholder="Tìm dịch vụ theo tên hoặc mô tả..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border-none bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand/10"
                            />
                        </div>
                    </div>

                    <div className="mb-8 flex flex-wrap gap-3">
                        {categories.map((category) => {
                            const active = selectedCategory === category;
                            const label = category === 'all' ? 'Tất cả dịch vụ' : getCategoryLabel(category);
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setSelectedCategory(category)}
                                    className={`rounded-full px-5 py-3 text-sm font-black transition ${
                                        active
                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                            : 'bg-slate-100 text-slate-600 hover:bg-brand/10 hover:text-brand'
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {selectedCategory !== 'all' && selectedCategoryDescription && (
                        <div className="mb-10 rounded-2xl bg-brand/5 px-5 py-4 text-[15px] font-medium leading-7 text-slate-600">
                            <span className="font-black text-slate-900">{getCategoryLabel(selectedCategory)}:</span>{' '}
                            {selectedCategoryDescription}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredServices.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => void handleServiceSelect(service)}
                                className={`rounded-[24px] p-6 text-left transition-all duration-300 ${
                                    selectedServiceId === service.id
                                        ? 'bg-[#FFF7FA] shadow-[0_12px_30px_rgba(232,90,139,0.10)] ring-1 ring-brand/40'
                                        : 'bg-slate-50/60 hover:bg-slate-50'
                                }`}
                            >
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                                        selectedServiceId === service.id ? 'bg-brand text-white' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                        <SparklesIcon className="h-6 w-6" />
                                    </div>
                                    {service.category && (
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                            {getCategoryLabel(service.category)}
                                        </span>
                                    )}
                                </div>
                                <div className={`mb-2 text-base font-black leading-6 ${
                                    selectedServiceId === service.id ? 'text-brand' : 'text-slate-900'
                                }`}>
                                    {service.name}
                                </div>
                                <p className="mb-5 line-clamp-3 text-sm font-medium leading-7 text-slate-500">
                                    {service.description}
                                </p>
                                {service.serviceKind === 'package' && (
                                    <div className="mb-4 space-y-2">
                                        {service.packageDays && (
                                            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">
                                                {service.packageDays} ngày
                                            </div>
                                        )}
                                        {getVisiblePackageSchedule(service).length > 0 && (
                                            <div className="text-[10px] font-bold text-slate-400">
                                                Có lộ trình chi tiết {getVisiblePackageSchedule(service).length} buổi
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {getIncludedServiceLabels(service).slice(0, 4).map((item) => (
                                                <span key={item} className="rounded-full bg-brand/5 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="text-sm font-black text-slate-900">
                                    Từ {service.basePrice.toLocaleString('vi-VN')}đ
                                </div>
                            </button>
                        ))}
                    </div>

                    {selectedService?.serviceKind === 'package' && selectedPackageSchedule.length > 0 && (
                        <div className="mt-12 rounded-[24px] bg-white p-6 md:p-8">
                            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <div className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">LỊCH TRÌNH GÓI DỊCH VỤ</div>
                                    <h3 className="text-[30px] font-black leading-tight text-[#111827]">Lộ trình chăm sóc 7 ngày</h3>
                                    <p className="mt-2 text-[16px] font-normal leading-[1.7] text-[#6B7280]">
                                        Thiết kế riêng cho mẹ sau sinh để gia đình theo dõi từng bước dễ hơn.
                                    </p>
                                    <div className="mt-4 inline-flex rounded-full bg-[#FDF2F8] px-4 py-2 text-[14px] font-bold text-[#DB2777]">
                                        7 buổi • {selectedService?.estimatedDurationMinutes ?? 90} phút/buổi
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-900">
                                        Tuần {scheduleWeekIndex + 1}/{totalScheduleWeeks}
                                    </div>
                                    <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-900">
                                        {selectedPackageSchedule.length} buổi chăm sóc
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-slate-50 p-4">
                                <div className="text-[15px] font-medium leading-[1.7] text-[#6B7280]">
                                    Đang xem từ ngày {currentWeekSchedule[0]?.day ?? 1} đến ngày {currentWeekSchedule[currentWeekSchedule.length - 1]?.day ?? 1}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setScheduleWeekIndex((value) => Math.max(0, value - 1))}
                                        disabled={scheduleWeekIndex === 0}
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Tuần trước
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setScheduleWeekIndex((value) => Math.min(totalScheduleWeeks - 1, value + 1))}
                                        disabled={scheduleWeekIndex >= totalScheduleWeeks - 1}
                                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Tuần sau
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {currentWeekSchedule.map((item, index) => {
                                    const label = getScheduleServiceLabels(item.serviceKeys).slice(0, 1).join('') || 'Chăm sóc';
                                    const isFirst = index === 0;
                                    const isLast = index === currentWeekSchedule.length - 1;
                                    const isAccent = index % 3 === 0;

                                    return (
                                        <details
                                            key={`${scheduleWeekIndex}-${item.day}`}
                                            open={index === 0}
                                            className={`group rounded-[18px] border border-transparent p-5 transition-all duration-300 ${
                                                isFirst
                                                    ? 'bg-white shadow-[0_18px_40px_rgba(236,72,153,0.12)] ring-1 ring-brand/25'
                                                    : isAccent
                                                        ? 'bg-[#FFF7FA]'
                                                        : 'bg-slate-50'
                                            }`}
                                        >
                                            <summary className="flex cursor-pointer list-none gap-4 text-left">
                                                <div className="relative flex w-14 shrink-0 justify-center">
                                                    {!isLast && <div className="absolute top-12 h-[calc(100%+1rem)] w-[2px] bg-slate-300" />}
                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition-all duration-300 ${isFirst ? 'scale-105 bg-brand text-white shadow-[0_10px_24px_rgba(236,72,153,0.28)]' : 'bg-white text-slate-700'}`}>
                                                        {item.day}
                                                    </div>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                        <div className="min-w-0">
                                                            <div className="text-[13px] font-medium text-[#9CA3AF]">Ngày {item.day}</div>
                                                            <div className="mt-1 text-[22px] font-bold leading-tight text-[#111827]">
                                                                {getScheduleTitle(item)}
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 rounded-full bg-[#FDF2F8] px-3.5 py-2 text-right text-[12px] font-bold text-[#DB2777]">
                                                            <div>{label}</div>
                                                            <div className="mt-0.5 text-[11px] font-semibold text-[#EC4899]">{selectedService?.estimatedDurationMinutes ?? 90} phút</div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 text-[16px] font-normal leading-[1.7] text-[#6B7280]">
                                                        <span className="group-open:hidden">{getCompactScheduleDescription(selectedService, item)}</span>
                                                        <span className="hidden group-open:block">{getScheduleDescription(selectedService, item)}</span>
                                                    </div>

                                                    <div className="mt-3 text-[14px] font-semibold text-brand group-open:hidden">
                                                        Xem thêm
                                                    </div>
                                                    <div className="mt-3 hidden text-[14px] font-semibold text-slate-400 group-open:block">
                                                        Thu gọn
                                                    </div>
                                                </div>
                                            </summary>
                                        </details>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <aside className="rounded-[28px] bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] xl:sticky xl:top-24 xl:self-start">
                    <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Dịch vụ đã chọn</div>
                    <div className="mt-4 text-[32px] font-black leading-tight text-slate-900">{selectedService?.name}</div>
                    <div className="mt-4 text-[15px] font-medium leading-7 text-slate-500">
                        {selectedService?.packageDays ?? 1} buổi • {selectedService?.estimatedDurationMinutes} phút/buổi
                    </div>
                    <div className="mt-8 text-[32px] font-black leading-none text-brand">
                        {selectedService?.basePrice.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="mt-4 space-y-2 text-[15px] font-medium leading-6 text-slate-500">
                        <div>Thanh toán linh hoạt</div>
                        <div>Hỗ trợ đổi lịch miễn phí</div>
                    </div>

                    <div className="mt-8 rounded-[24px] bg-slate-50 p-5">
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Y tá đi kèm</div>
                        {featuredNurse ? (
                            <div className="mt-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-xl font-black text-brand">
                                        {featuredNurse.avatar ? <img src={featuredNurse.avatar} alt={featuredNurse.fullName} className="h-full w-full object-cover" /> : featuredNurse.fullName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[22px] font-black leading-tight text-slate-900">{featuredNurse.fullName}</div>
                                        <div className="mt-1 text-[14px] font-medium text-slate-500">{featuredNurse.specialization || 'Y tá chăm sóc tại nhà'}</div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600">
                                        {featuredNurse.yearsExperience}+ năm kinh nghiệm
                                    </span>
                                    <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600">
                                        {featuredNurse.serviceRadiusKm} km hỗ trợ
                                    </span>
                                    <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600">
                                        {featuredNurse.averageRating.toFixed(1)} đánh giá
                                    </span>
                                </div>

                                <p className="mt-4 text-[14px] font-medium leading-6 text-slate-500">
                                    Phù hợp để khách xem nhanh hồ sơ và đặt lịch ngay với gói dịch vụ này.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/nurses/${featuredNurse.userId}?serviceId=${selectedServiceId}`)}
                                        className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                                    >
                                        Xem hồ sơ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/nurses/${featuredNurse.userId}?serviceId=${selectedServiceId}`)}
                                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                                    >
                                        Đặt lịch
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 text-[14px] font-medium leading-6 text-slate-500">
                                Danh sách y tá phù hợp sẽ hiển thị ngay bên dưới khi có dữ liệu.
                            </div>
                        )}
                    </div>
                </aside>
            </div>
            <div className="mx-auto w-full max-w-[1680px] px-2 py-10 sm:px-4 lg:px-4">
                <div className={`transition-opacity duration-300 ${nursesLoading ? 'opacity-50' : 'opacity-100'}`}>
                        <AnimatePresence mode="wait">
                            {nurses.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center rounded-[28px] bg-slate-50 py-40"
                                >
                                    <AcademicCapIcon className="mb-6 h-16 w-16 text-slate-300" />
                                    <h3 className="text-xl font-black text-slate-900">Ch?a t?m th?y y t? ph? h?p</h3>
                                    <p className="mt-2 text-sm font-medium text-slate-500">H?y th? ch?n nh?m d?ch v? kh?c ho?c quay l?i sau.</p>
                                </motion.div>
                            ) : remainingNurses.length === 0 ? (
                                <motion.div
                                    key="featured-only"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="rounded-[28px] bg-white px-6 py-8 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                                >
                                    <h3 className="text-xl font-black text-slate-900">Đã có y tá đi kèm gói dịch vụ này</h3>
                                    <p className="mt-2 text-[15px] font-medium leading-7 text-slate-500">
                                        Bạn có thể xem hồ sơ hoặc đặt lịch ngay từ card dịch vụ đã chọn ở bên trên.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={selectedServiceId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid gap-5"
                                >
                                    {remainingNurses.map((nurse, idx) => {
                                        return (
                                            <motion.div
                                                key={nurse.userId}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.04 }}
                                                className="rounded-[24px] bg-white px-6 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
                                            >
                                                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_220px_190px] xl:items-center">
                                                    <div className="flex min-w-0 gap-4">
                                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-2xl font-black text-brand">
                                                            {nurse.avatar ? <img src={nurse.avatar} alt={nurse.fullName} className="h-full w-full object-cover" /> : nurse.fullName.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-[28px] font-black leading-tight text-slate-900">{nurse.fullName}</h3>
                                                            <p className="mt-1 text-[15px] font-medium text-slate-500">{nurse.specialization || 'Y tá chăm sóc tại nhà'}</p>
                                                            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-2 text-sm font-black text-yellow-700">{nurse.averageRating.toFixed(1)} đánh giá</div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-[13px] font-semibold text-slate-400">Thông tin nhanh</div>
                                                        <div className="mt-2 text-[16px] font-black text-slate-900">{nurse.yearsExperience}+ năm kinh nghiệm</div>
                                                        <div className="mt-1 text-[16px] font-black text-slate-900">{nurse.serviceRadiusKm} km hỗ trợ</div>
                                                    </div>

                                                    <div className="xl:text-right">
                                                        <div className="text-[28px] font-black text-brand">{(nurse.servicePrice ?? selectedService?.basePrice ?? 0).toLocaleString('vi-VN')}đ</div>
                                                        <div className="mt-1 text-sm font-medium text-slate-400">{nurse.serviceUnit === 'hourly' ? 'Giá theo giờ' : 'Phù hợp với gói bạn đã chọn'}</div>
                                                    </div>
                                                </div>

                                                <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                    <div className="max-w-[520px]">
                                                        <div className="text-sm font-black text-slate-900">Phù hợp với gói bạn đã chọn</div>
                                                        <div className="mt-1 text-[15px] font-medium text-slate-500">Xem nhanh kinh nghiệm, bán kính hỗ trợ và mức giá trước khi đặt lịch.</div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/nurses/${nurse.userId}?serviceId=${selectedServiceId}`)}
                                                            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                                                        >
                                                            Xem hồ sơ
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/nurses/${nurse.userId}?serviceId=${selectedServiceId}`)}
                                                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                                                        >
                                                            Đặt lịch
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
