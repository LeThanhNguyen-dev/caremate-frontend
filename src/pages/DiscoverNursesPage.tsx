import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AdjustmentsHorizontalIcon,
    CheckBadgeIcon,
    MagnifyingGlassIcon,
    StarIcon,
    UserGroupIcon,
    WalletIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import caremateApi from '../api/caremateApi';
import type { NurseDiscoveryDto, ServiceDetailDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';

const daNangDistricts = [
    { value: 'all', label: 'Tất cả Đà Nẵng', latitude: 16.0544, longitude: 108.2022 },
    { value: 'Hải Châu', label: 'Hải Châu', latitude: 16.0678, longitude: 108.2208 },
    { value: 'Thanh Khê', label: 'Thanh Khê', latitude: 16.0707, longitude: 108.1906 },
    { value: 'Sơn Trà', label: 'Sơn Trà', latitude: 16.1062, longitude: 108.2529 },
    { value: 'Ngũ Hành Sơn', label: 'Ngũ Hành Sơn', latitude: 16.0037, longitude: 108.2647 },
    { value: 'Liên Chiểu', label: 'Liên Chiểu', latitude: 16.0744, longitude: 108.1491 },
    { value: 'Cẩm Lệ', label: 'Cẩm Lệ', latitude: 16.0169, longitude: 108.2047 },
    { value: 'Hòa Vang', label: 'Hòa Vang', latitude: 16.0390, longitude: 108.1135 },
];

const toCoordinate = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = typeof value === 'number' ? value : Number(String(value).trim());
    return Number.isFinite(parsed) ? parsed : null;
};

const DiscoverNursesPage = () => {
    const [searchParams] = useSearchParams();
    const serviceId = searchParams.get('serviceId');
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [nurses, setNurses] = useState<NurseDiscoveryDto[]>([]);
    const [services, setServices] = useState<ServiceDetailDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('bestMatch');
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [customerAddressLoaded, setCustomerAddressLoaded] = useState(false);
    const [customerAddress, setCustomerAddress] = useState<{
        fullAddress: string | null;
        ward: string | null;
        district: string | null;
        latitude: number | null;
        longitude: number | null;
    } | null>(null);
    const shouldUseCustomerCoordinates = selectedDistrict !== 'all' || sortBy === 'nearest';
    const matchingLocation = selectedDistrict === 'all'
        ? {
            latitude: shouldUseCustomerCoordinates ? customerAddress?.latitude ?? undefined : undefined,
            longitude: shouldUseCustomerCoordinates ? customerAddress?.longitude ?? undefined : undefined,
            district: undefined,
        }
        : {
            latitude: shouldUseCustomerCoordinates ? customerAddress?.latitude ?? undefined : undefined,
            longitude: shouldUseCustomerCoordinates ? customerAddress?.longitude ?? undefined : undefined,
            district: selectedDistrict,
        };

    useEffect(() => {
        const loadCustomerAddress = async () => {
            try {
                const profile = await caremateApi.getMyProfile();
                const address = profile.defaultAddress ?? {
                    fullAddress: profile.address ?? '',
                    ward: profile.ward ?? null,
                    district: profile.district ?? null,
                    latitude: profile.latitude ?? null,
                    longitude: profile.longitude ?? null,
                };
                setCustomerAddress({
                    fullAddress: address.fullAddress || profile.address || null,
                    ward: address.ward,
                    district: address.district,
                    latitude: toCoordinate(address.latitude),
                    longitude: toCoordinate(address.longitude),
                });
            } catch {
                setCustomerAddress(null);
            } finally {
                setCustomerAddressLoaded(true);
            }
        };

        void loadCustomerAddress();
    }, []);

    useEffect(() => {
        if (!serviceId) {
            showToast('Hãy chọn dịch vụ trước khi tìm y tá.', 'warning');
            navigate('/services');
        }
    }, [navigate, serviceId, showToast]);

    useEffect(() => {
        const load = async () => {
            if (!serviceId || !customerAddressLoaded) return;

            const isInitialLoad = services.length === 0 && nurses.length === 0;

            try {
                if (isInitialLoad) setLoading(true);
                const [nurseData, serviceData] = await Promise.all([
                    caremateApi.getNurses({
                        serviceId: Number(serviceId),
                        latitude: matchingLocation.latitude,
                        longitude: matchingLocation.longitude,
                        district: matchingLocation.district,
                        sortBy: sortBy === 'bestMatch' ? 'bestMatch' : undefined,
                    }),
                    caremateApi.getServices(),
                ]);
                setNurses(nurseData);
                setServices(serviceData);
            } catch {
                showToast('Không thể tải danh sách y tá theo dịch vụ đã chọn.', 'error');
            } finally {
                if (isInitialLoad) setLoading(false);
            }
        };

        void load();
    }, [customerAddressLoaded, matchingLocation.district, matchingLocation.latitude, matchingLocation.longitude, serviceId, showToast, sortBy]);

    const selectedService = useMemo(
        () => services.find((item) => item.id === Number(serviceId)),
        [serviceId, services],
    );

    const filtered = useMemo(() => {
        let result = [...nurses];

        if (search.trim()) {
            const keyword = search.toLowerCase();
            result = result.filter(
                (item) =>
                    item.fullName.toLowerCase().includes(keyword) ||
                    (item.specialization || '').toLowerCase().includes(keyword) ||
                    (item.bio || '').toLowerCase().includes(keyword),
            );
        }

        result.sort((a, b) => {
            if (sortBy === 'bestMatch') return (b.matchScore ?? 0) - (a.matchScore ?? 0);
            if (sortBy === 'nearest') return (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER);
            if (sortBy === 'experience') return b.yearsExperience - a.yearsExperience;
            if (sortBy === 'price') return (a.servicePrice ?? 0) - (b.servicePrice ?? 0);
            if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
            return b.averageRating - a.averageRating;
        });

        return result;
    }, [nurses, search, sortBy]);

    const statCards = [
        { label: 'Dịch vụ đang chọn', value: selectedService?.name || 'Đang tải...', icon: AdjustmentsHorizontalIcon },
        { label: 'Y tá phù hợp', value: filtered.length, icon: UserGroupIcon },
        {
            label: 'Mức giá từ',
            value: filtered.length
                ? `${Math.min(...filtered.map((item) => item.servicePrice ?? 0)).toLocaleString('vi-VN')} VND`
                : 'N/A',
            icon: WalletIcon,
        },
    ];
    const isFilteringByDistrict = selectedDistrict !== 'all';

    if (loading) {
        return (
            <div className="min-h-[520px] bg-[#fbfaf8] px-5 py-8 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="animate-pulse rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/40">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-slate-100" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 w-2/3 rounded bg-slate-100" />
                                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <div className="h-3 rounded bg-slate-100" />
                                <div className="h-3 w-5/6 rounded bg-slate-100" />
                                <div className="h-3 w-3/5 rounded bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fbfaf8] px-5 py-8 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/55 sm:p-10"
                    >
                        <div className="accent-label">Bước 2</div>
                        <h1 className="mt-4 font-heading text-4xl font-black leading-tight tracking-tight text-[#10233F] md:text-5xl">
                            Danh sách y tá đã lọc theo đúng dịch vụ bạn vừa chọn.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
                            Chỉ hiển thị những y tá có mở dịch vụ này, giúp bạn xem đúng hồ sơ, đúng giá và đặt lịch nhanh hơn.
                        </p>
                    </motion.div>

                    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                        {statCards.map((card, index) => (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.06 }}
                                className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/45 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 sm:p-6"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{card.label}</div>
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                                        <card.icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-3 text-xl font-black leading-snug text-[#10233F]">{card.value}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/35 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Dịch vụ đã khóa</div>
                            <div className="mt-2 font-heading text-2xl font-bold text-[#10233F]">{selectedService?.name}</div>
                            <div className="mt-1 text-sm text-slate-600">
                                Cần đổi dịch vụ? Quay lại bước 1 để tìm đúng nhóm y tá tương ứng.
                            </div>
                        </div>
                        <Link to="/services" className="btn-secondary btn-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/10">
                            Quay lại chọn dịch vụ
                        </Link>
                    </div>
                </section>

                <section className="rounded-[1.5rem] border border-brand/10 bg-[#FDF2F8] p-5 shadow-lg shadow-slate-200/25 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-xs font-black uppercase tracking-[0.24em] text-brand">
                                {isFilteringByDistrict ? 'Đang lọc theo khu vực' : 'Đang hiển thị toàn Đà Nẵng'}
                            </div>
                            <div className="mt-2 text-xl font-black text-[#10233F]">
                                {isFilteringByDistrict
                                    ? daNangDistricts.find((item) => item.value === selectedDistrict)?.label
                                    : 'Tất cả y tá có dịch vụ này'}
                            </div>
                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                                {isFilteringByDistrict
                                    ? 'Danh sách đang được lọc theo quận bạn chọn ở ô bên dưới.'
                                    : sortBy === 'nearest' && customerAddress?.fullAddress
                                        ? `Đang sắp xếp theo địa chỉ hồ sơ của bạn: ${customerAddress.fullAddress}.`
                                        : 'Đang hiển thị toàn bộ y tá có mở dịch vụ này tại Đà Nẵng.'}
                            </p>
                        </div>
                        <Link to="/profile" className="rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-brand shadow-sm transition hover:-translate-y-0.5 hover:bg-brand hover:text-white">
                            Cập nhật địa chỉ
                        </Link>
                    </div>
                </section>

                <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/35 sm:p-6">
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px_240px]">
                        <div className="relative">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-brand" />
                            <input
                                type="text"
                                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-14 pr-5 text-sm font-bold text-[#10233F] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                                placeholder="Tìm theo tên, bio, chuyên môn..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <AdjustmentsHorizontalIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand" />
                            <select
                                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-10 text-sm font-black text-[#10233F] shadow-sm outline-none transition focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                                value={selectedDistrict}
                                onChange={(event) => setSelectedDistrict(event.target.value)}
                            >
                                {daNangDistricts.map((district) => (
                                    <option key={district.value} value={district.value}>{district.label}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">⌄</div>
                        </div>
                        <div className="relative">
                            <AdjustmentsHorizontalIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand" />
                            <select
                                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-10 text-sm font-black text-[#10233F] shadow-sm outline-none transition focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value)}
                            >
                                <option value="bestMatch">Phù hợp nhất</option>
                                <option value="nearest">Gần khách hàng nhất</option>
                                <option value="rating">Đánh giá cao nhất</option>
                                <option value="experience">Kinh nghiệm nhiều nhất</option>
                                <option value="price">Giá hợp lý nhất</option>
                                <option value="name">Tên A-Z</option>
                            </select>
                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">⌄</div>
                        </div>
                    </div>
                </section>

                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-title">Không tìm thấy y tá phù hợp</div>
                        <div className="empty-state-text">Thử đổi từ khóa tìm kiếm hoặc quay lại chọn một dịch vụ khác.</div>
                    </div>
                ) : (
                    <motion.div className="grid min-h-[760px] grid-cols-1 content-start gap-5 md:grid-cols-2 xl:grid-cols-3">
                        <AnimatePresence mode="wait" initial={false}>
                            {filtered.map((nurse, index) => (
                                <motion.div
                                    key={nurse.userId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ delay: Math.min(index * 0.015, 0.08), duration: 0.18 }}
                                    className="group flex h-full flex-col rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/35 transition duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-2xl hover:shadow-slate-200/80"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#10233F] text-2xl font-black text-white shadow-lg shadow-[#10233F]/10">
                                                {nurse.avatar ? (
                                                    <img src={nurse.avatar} alt={nurse.fullName} className="h-full w-full object-cover" />
                                                ) : (
                                                    nurse.fullName.charAt(0).toUpperCase()
                                                )}
                                                <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-xl bg-emerald-500 text-white ring-2 ring-white">
                                                    <CheckBadgeIcon className="h-4 w-4" />
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate font-heading text-[22px] font-black leading-tight text-[#10233F]">{nurse.fullName}</div>
                                                <div className="mt-1 truncate text-sm font-semibold text-slate-500">
                                                    {nurse.specialization || 'Chuyên viên chăm sóc tại nhà'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-black text-amber-600 ring-1 ring-amber-100">
                                            <StarSolidIcon className="h-4 w-4" />
                                            {nurse.averageRating.toFixed(1)}
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-2xl bg-[#FDF2F8] p-4 ring-1 ring-brand/10">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-brand">Điểm gợi ý</div>
                                                <div className="mt-1 text-2xl font-black leading-none text-[#10233F]">{nurse.matchScore ?? 0}% phù hợp</div>
                                            </div>
                                            {nurse.distanceKm != null && (
                                                <div className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-slate-600 shadow-sm">
                                                    {nurse.distanceKm.toFixed(1)} km đường thẳng
                                                </div>
                                            )}
                                        </div>
                                        {nurse.matchReasons && nurse.matchReasons.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {nurse.matchReasons.slice(0, 3).map((reason) => (
                                                    <span key={reason} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                                        {reason}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-5 flex-1 overflow-hidden text-sm font-medium leading-7 text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                                        {nurse.bio || 'Hồ sơ đang được bổ sung mô tả chi tiết về kinh nghiệm chăm sóc.'}
                                    </p>

                                    <div className="mt-6 grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Số sao</div>
                                            <div className="mt-2 flex items-center gap-1 text-amber-400">
                                                {Array.from({ length: 5 }, (_, starIndex) => (
                                                    <StarSolidIcon
                                                        key={starIndex}
                                                        className={`h-4 w-4 ${starIndex < Math.round(nurse.averageRating) ? 'text-amber-400' : 'text-slate-200'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Trình độ</div>
                                            <div className="mt-2 truncate text-sm font-black text-[#10233F]">
                                                {nurse.specialization || 'Điều dưỡng chăm sóc'}
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Kinh nghiệm</div>
                                            <div className="mt-2 text-sm font-black text-[#10233F]">{nurse.yearsExperience} năm</div>
                                        </div>
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Giá dịch vụ</div>
                                            <div className="mt-2 text-sm font-black text-[#10233F]">
                                                {(nurse.servicePrice ?? 0).toLocaleString('vi-VN')} VND
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-600">
                                        <CheckBadgeIcon className="h-4 w-4" />
                                        Đã xác minh hồ sơ
                                        <StarIcon className="ml-auto h-4 w-4 text-brand" />
                                    </div>

                                    <Link
                                        to={`/nurses/${nurse.userId}?serviceId=${serviceId}`}
                                        className="btn-primary mt-6 w-full justify-between transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/20"
                                    >
                                        Xem hồ sơ và đặt lịch
                                        <span className="text-lg leading-none">→</span>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default DiscoverNursesPage;
