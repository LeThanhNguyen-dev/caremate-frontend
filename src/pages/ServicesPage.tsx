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
    SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import caremateApi from '../api/caremateApi';
import type { ServiceDetailDto, NurseDiscoveryDto } from '../api/frontend-api-contract';
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
                    .filter((category): category is string => Boolean(category) && category in categoryLabels)
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
                            const label = category === 'all' ? 'Tất cả dịch vụ' : (categoryLabels[category] ?? category);
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

                    {selectedCategory !== 'all' && categoryLabels[selectedCategory] && categoryDescriptions[selectedCategory] && (
                        <div className="mb-8 rounded-3xl border border-brand/10 bg-brand/5 px-5 py-4 text-sm font-medium leading-7 text-slate-600">
                            <span className="font-black text-slate-900">{categoryLabels[selectedCategory]}:</span>{' '}
                            {categoryDescriptions[selectedCategory]}
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
                                    {categoryLabels[service.category] && (
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                            {categoryLabels[service.category]}
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
                                <div className="text-sm font-black text-slate-900">
                                    Từ {service.basePrice.toLocaleString('vi-VN')}đ
                                </div>
                            </button>
                        ))}
                    </div>
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
