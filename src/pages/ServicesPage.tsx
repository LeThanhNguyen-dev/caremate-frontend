import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    AcademicCapIcon,
    ShieldCheckIcon,
    HeartIcon,
    ArrowRightIcon,
    CheckBadgeIcon,
    ClockIcon,
    Squares2X2Icon,
    SparklesIcon,
    CalendarDaysIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
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

const getScheduleHighlights = (description: string) =>
    description
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean);

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
    const selectedPackageSchedule = useMemo(() => getVisiblePackageSchedule(selectedService), [selectedService]);
    const selectedCategoryDescription =
        selectedCategory === 'goi-dich-vu'
            ? 'Các gói nhiều ngày kết hợp nhiều dịch vụ, phù hợp khi gia đình cần lịch chăm sóc liên tục.'
            : selectedCategory === 'ho-tro-gia-dinh'
                ? 'Hỗ trợ các việc nhẹ quanh không gian chăm sóc để gia đình giảm tải.'
                : categoryDescriptions[selectedCategory];

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
        <div className="min-h-screen bg-white">
            <section className="relative overflow-hidden bg-slate-900 pb-40 pt-32">
                <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-brand/10 blur-[120px] -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-brand/5 blur-[100px] -mb-32 -ml-32"></div>

                <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="mx-auto mb-6 w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-white/80">
                            Hệ thống dịch vụ CareMate
                        </div>
                        <h1 className="mb-8 text-4xl font-black leading-tight text-white lg:text-7xl">
                            Danh mục dịch vụ <br /> <span className="text-brand">rõ loại, dễ chọn, dễ đặt</span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-white/50">
                            Chọn đúng nhóm dịch vụ bạn cần cho mẹ và bé, xem điều dưỡng phù hợp và đặt lịch nhanh ngay trong một nơi.
                        </p>
                    </div>
                </div>
            </section>

            <div className="relative z-20 mx-auto -mt-20 max-w-7xl px-6 lg:px-8">
                <div className="rounded-[28px] border border-slate-50 bg-white p-8 shadow-2xl shadow-slate-200/50">
                    <div className="mb-8 flex flex-col gap-6 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <Squares2X2Icon className="h-6 w-6 text-brand" />
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Danh mục dịch vụ</h2>
                                <p className="mt-1 text-sm font-medium text-slate-500">Dịch vụ đã được chia theo nhóm để gia đình dễ tìm hơn.</p>
                            </div>
                        </div>

                        <div className="relative w-full max-w-sm group">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand" />
                            <input
                                type="text"
                                placeholder="Tìm dịch vụ theo tên hoặc mô tả..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-2xl border-none bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand/10"
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
                        <div className="mb-8 rounded-3xl border border-brand/10 bg-brand/5 px-5 py-4 text-sm font-medium leading-7 text-slate-600">
                            <span className="font-black text-slate-900">{getCategoryLabel(selectedCategory)}:</span>{' '}
                            {selectedCategoryDescription}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {filteredServices.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => void handleServiceSelect(service)}
                                className={`rounded-3xl border-2 p-5 text-left transition-all duration-300 ${
                                    selectedServiceId === service.id
                                        ? 'border-brand bg-brand/5 shadow-lg shadow-pink-500/10'
                                        : 'border-slate-100 bg-white hover:border-brand/20 hover:bg-slate-50/60'
                                }`}
                            >
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
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
                                <p className="mb-4 line-clamp-3 text-sm font-medium leading-6 text-slate-500">
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
                        <div className="mt-10 rounded-[28px] border border-brand/10 bg-slate-50 p-8">
                            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand">
                                        Lộ trình gói dịch vụ
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">
                                        {selectedService.name}
                                    </h3>
                                    <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-slate-500">
                                        Khách hàng xem trước từng ngày chăm sóc, các dịch vụ được thực hiện và nội dung y tá sẽ theo dõi trong quá trình hoàn thành gói.
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm">
                                    {selectedPackageSchedule.length} buổi chăm sóc
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {selectedPackageSchedule.map((item) => {
                                    const serviceLabels = getScheduleServiceLabels(item.serviceKeys).slice(0, 3);
                                    const description = getScheduleDescription(selectedService, item);
                                    const highlights = getScheduleHighlights(description);

                                    return (
                                        <div
                                            key={item.day}
                                            className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-xl hover:shadow-slate-200/70"
                                        >
                                            <div className="mb-4 flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-lg font-black text-white shadow-lg shadow-brand/20">
                                                        {item.day}
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-brand">
                                                            Buổi chăm sóc
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                            <CalendarDaysIcon className="h-4 w-4" />
                                                            Ngày {item.day}
                                                        </div>
                                                    </div>
                                                </div>
                                                {serviceLabels.length > 0 && (
                                                    <div className="flex max-w-[52%] flex-wrap justify-end gap-1.5">
                                                        {serviceLabels.map((label) => (
                                                            <span key={label} className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold leading-none text-brand">
                                                                {label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-base font-black leading-snug text-slate-900">
                                                {item.title || `Buổi ${item.day}`}
                                            </div>

                                            {highlights.length > 1 ? (
                                                <ul className="mt-4 space-y-2">
                                                    {highlights.slice(0, 2).map((highlight) => (
                                                        <li key={highlight} className="flex gap-2.5 text-sm font-medium leading-6 text-slate-600">
                                                            <CheckCircleIcon className="mt-1 h-4 w-4 shrink-0 text-brand" />
                                                            <span>{highlight}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-slate-600">
                                                    {description}
                                                </p>
                                            )}
                                            <details className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                                <summary className="cursor-pointer list-none text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 transition hover:text-brand">
                                                    Xem nội dung đầy đủ
                                                </summary>
                                                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                                                    {description}
                                                </p>
                                            </details>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
                <div className="flex flex-col items-start gap-16 lg:flex-row">
                    <aside className="w-full shrink-0 space-y-8 lg:w-80">
                        <div className="relative overflow-hidden rounded-[28px] bg-slate-900 p-10 text-white">
                            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-brand/10 blur-3xl -mr-16 -mt-16"></div>
                            <ShieldCheckIcon className="mb-8 h-12 w-12 text-brand" />
                            <h3 className="mb-4 text-2xl font-black">Cam kết chất lượng</h3>
                            <p className="mb-8 text-sm font-medium leading-relaxed text-white/50">
                                Tất cả điều dưỡng trên CareMate đều trải qua quy trình xác minh chặt chẽ trước khi nhận việc.
                            </p>
                            <ul className="space-y-4">
                                {['Bằng cấp chính quy', 'Kinh nghiệm thực tế', 'Lý lịch rõ ràng', 'Kỹ năng giao tiếp tốt'].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-xs font-bold">
                                        <CheckBadgeIcon className="h-4 w-4 text-brand" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-[28px] border border-brand/10 bg-brand-soft p-8">
                            <h4 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-900">Chi phí tham khảo</h4>
                            <div className="mb-2 text-3xl font-black text-brand">
                                {selectedService?.basePrice.toLocaleString('vi-VN')}đ
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Giá gốc cho 1 buổi • {selectedService?.estimatedDurationMinutes} phút
                            </div>
                            {selectedService && (
                                <p className="mt-5 text-sm font-medium leading-6 text-slate-600">
                                    {selectedService.description}
                                </p>
                            )}
                        </div>
                        {selectedService?.serviceKind === 'package' && selectedPackageSchedule.length > 0 && (
                            <div className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-sm">
                                <div className="mb-2 text-sm font-black uppercase tracking-widest text-slate-900">
                                    Lộ trình gói dịch vụ
                                </div>
                                <p className="mb-6 text-sm font-medium leading-6 text-slate-500">
                                    Khách hàng có thể xem từng buổi chăm sóc trước khi chọn y tá và đặt lịch.
                                </p>
                                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
                                    {selectedPackageSchedule.map((item) => (
                                        <div key={item.day} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">
                                                    Ngày {item.day}
                                                </div>
                                                {getScheduleServiceLabels(item.serviceKeys).length > 0 && (
                                                    <div className="text-[10px] font-bold text-slate-400">
                                                        {getScheduleServiceLabels(item.serviceKeys).slice(0, 2).join(' + ')}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="line-clamp-2 text-sm font-black leading-5 text-slate-900">
                                                {item.title || `Buổi ${item.day}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    <main className="flex-1">
                        <div className="mb-12 flex items-center justify-between">
                            <div>
                                <h2 className="mb-2 text-3xl font-black text-slate-900">Điều dưỡng sẵn sàng hỗ trợ</h2>
                                <p className="font-medium text-slate-500">
                                    Tìm thấy {nurses.length} điều dưỡng cho dịch vụ {selectedService?.name}
                                </p>
                            </div>
                            {nursesLoading && (
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent"></div>
                            )}
                        </div>

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
                                        <h3 className="text-xl font-black text-slate-900">Chưa tìm thấy điều dưỡng phù hợp</h3>
                                        <p className="mt-2 text-sm font-medium text-slate-500">Hãy thử chọn nhóm dịch vụ khác hoặc quay lại sau.</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={selectedServiceId}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid gap-8 md:grid-cols-2"
                                    >
                                        {nurses.map((nurse, idx) => (
                                            <motion.div
                                                key={nurse.userId}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group rounded-[28px] border border-slate-100 bg-white p-8 transition-all duration-500 hover:border-brand/20 hover:shadow-2xl hover:shadow-pink-500/5"
                                            >
                                                <div className="mb-8 flex items-start justify-between">
                                                    <div className="relative">
                                                        <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-slate-50 bg-slate-100">
                                                            {nurse.avatar
                                                                ? <img src={nurse.avatar} alt={nurse.fullName} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                                : <div className="flex h-full w-full items-center justify-center text-3xl font-black text-brand">{nurse.fullName.charAt(0)}</div>
                                                            }
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-brand shadow-lg">
                                                            <CheckBadgeIcon className="h-4 w-4 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end text-right">
                                                        <div className="flex items-center gap-1 rounded-xl border border-yellow-100 bg-yellow-50 px-3 py-1.5 text-yellow-600">
                                                            <StarSolid className="h-3.5 w-3.5" />
                                                            <span className="text-xs font-black">{nurse.averageRating.toFixed(1)}</span>
                                                        </div>
                                                        <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            Đánh giá tốt
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className="mb-2 text-2xl font-black text-slate-900">{nurse.fullName}</h3>
                                                <p className="mb-8 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                                                    {nurse.specialization || 'Điều dưỡng chuyên môn cao'}
                                                </p>

                                                <div className="mb-10 grid grid-cols-2 gap-4">
                                                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                                        <ClockIcon className="mb-2 h-5 w-5 text-brand" />
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Kinh nghiệm</div>
                                                        <div className="text-sm font-black text-slate-900">{nurse.yearsExperience}+ năm</div>
                                                    </div>
                                                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                                        <HeartIcon className="mb-2 h-5 w-5 text-brand" />
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Bán kính hỗ trợ</div>
                                                        <div className="text-sm font-black text-slate-900">{nurse.serviceRadiusKm} km</div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => navigate(`/nurses/${nurse.userId}?serviceId=${selectedServiceId}`)}
                                                    className="group/btn w-full btn-primary"
                                                >
                                                    Xem hồ sơ và đặt lịch
                                                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
