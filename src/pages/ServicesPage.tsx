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

const ServicesPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [services, setServices] = useState<ServiceDetailDto[]>([]);
    const [nurses, setNurses] = useState<NurseDiscoveryDto[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [nursesLoading, setNursesLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Load initial data (Services + Initial Nurses)
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

    // Handle Service Change (only reload nurses, no full-page flash)
    const handleServiceSelect = async (id: number) => {
        if (id === selectedServiceId) return;
        setSelectedServiceId(id);
        try {
            setNursesLoading(true);
            const nurseData = await caremateApi.getNurses({ serviceId: id });
            setNurses(nurseData);
        } catch {
            showToast('Lỗi khi tải danh sách điều dưỡng.', 'error');
        } finally {
            setNursesLoading(false);
        }
    };

    const filteredServices = useMemo(() => {
        return services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [services, searchQuery]);

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
        <div className="bg-white min-h-screen">
            {/* Header / Hero Section */}
            <section className="bg-slate-900 pt-32 pb-40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 blur-[120px] -mr-48 -mt-48 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand/5 blur-[100px] -ml-32 -mb-32 rounded-full"></div>
                
                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="accent-label !bg-white/10 !text-white border-white/20 mx-auto">Hệ thống dịch vụ CareMate</div>
                        <h1 className="text-4xl lg:text-7xl font-black text-white mb-8 leading-tight">
                            Giải pháp chăm sóc <br /> <span className="text-brand">chuyên sâu</span>
                        </h1>
                        <p className="text-lg text-white/40 font-medium leading-relaxed max-w-xl mx-auto">
                            Duyệt qua danh mục dịch vụ đa dạng và chọn lựa điều dưỡng phù hợp nhất cho gia đình bạn.
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8 -mt-20">
                <div className="bg-white rounded-xl shadow-2xl shadow-slate-200/50 p-8 border border-slate-50">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                        <div className="flex items-center gap-4">
                            <Squares2X2Icon className="h-6 w-6 text-brand" />
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Danh mục dịch vụ</h2>
                        </div>
                        <div className="relative w-64 group">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Tìm dịch vụ..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand/10 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredServices.map((service) => (
                            <button 
                                key={service.id} 
                                onClick={() => handleServiceSelect(service.id)}
                                className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-500 border-2 ${
                                    selectedServiceId === service.id 
                                    ? 'bg-brand/5 border-brand shadow-lg shadow-pink-500/10' 
                                    : 'bg-white border-slate-50 hover:border-brand/20 hover:bg-slate-50/50'
                                }`}
                            >
                                <div className={`h-12 w-12 rounded-lg flex items-center justify-center transition-colors ${
                                    selectedServiceId === service.id ? 'bg-brand text-white' : 'bg-slate-50 text-slate-400'
                                }`}>
                                    <SparklesIcon className="h-6 w-6" />
                                </div>
                                <div className="text-center">
                                    <div className={`text-[11px] font-black uppercase tracking-tight leading-tight ${
                                        selectedServiceId === service.id ? 'text-brand' : 'text-slate-600'
                                    }`}>
                                        {service.name}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
                <div className="flex flex-col lg:flex-row items-start gap-16">
                    {/* Trust Sidebar */}
                    <aside className="w-full lg:w-80 shrink-0 space-y-8">
                        <div className="luxury-card p-10 bg-slate-900 text-white border-none shadow-none relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                            <ShieldCheckIcon className="h-12 w-12 text-brand mb-8" />
                            <h3 className="text-2xl font-black mb-4">Cam kết chất lượng</h3>
                            <p className="text-white/40 text-sm font-medium leading-relaxed mb-8">Tất cả y tá trên CareMate đều phải trải qua 5 bước kiểm định nghiêm ngặt trước khi nhận việc.</p>
                            <ul className="space-y-4">
                                {['Bằng cấp chính quy', 'Kinh nghiệm > 3 năm', 'Lí lịch tư pháp sạch', 'Kỹ năng giao tiếp'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-bold">
                                        <CheckBadgeIcon className="h-4 w-4 text-brand" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="luxury-card p-8 bg-brand-soft border-brand/10 shadow-none">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Chi phí dịch vụ</h4>
                            <div className="text-3xl font-black text-brand mb-2">
                                {selectedService?.basePrice.toLocaleString('vi-VN')}đ
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giá gốc cho 1 buổi • {selectedService?.estimatedDurationMinutes} phút</div>
                        </div>
                    </aside>

                    {/* Nurse Grid */}
                    <main className="flex-1">
                        <div className="mb-12 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2">Điều dưỡng sẵn sàng</h2>
                                <p className="text-slate-500 font-medium">Tìm thấy {nurses.length} chuyên gia cho dịch vụ {selectedService?.name}</p>
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
                                        className="flex flex-col items-center justify-center py-40 bg-slate-50 rounded-xl"
                                    >
                                        <AcademicCapIcon className="h-16 w-16 text-slate-300 mb-6" />
                                        <h3 className="text-xl font-black text-slate-900">Không tìm thấy kết quả</h3>
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
                                                className="group bg-white rounded-xl border border-slate-100 p-8 hover:border-brand/20 hover:shadow-2xl hover:shadow-pink-500/5 transition-all duration-500"
                                            >
                                                <div className="flex items-start justify-between mb-8">
                                                    <div className="relative">
                                                        <div className="h-24 w-24 overflow-hidden rounded-xl border-4 border-slate-50 bg-slate-100">
                                                            {nurse.avatar 
                                                                ? <img src={nurse.avatar} alt={nurse.fullName} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" /> 
                                                                : <div className="h-full w-full flex items-center justify-center text-3xl font-black text-brand">{nurse.fullName.charAt(0)}</div>
                                                            }
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-brand border-4 border-white flex items-center justify-center shadow-lg">
                                                            <CheckBadgeIcon className="h-4 w-4 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end text-right">
                                                        <div className="flex items-center gap-1 rounded-xl bg-yellow-50 px-3 py-1.5 text-yellow-600 border border-yellow-100">
                                                            <StarSolid className="h-3.5 w-3.5" />
                                                            <span className="text-xs font-black">{nurse.averageRating.toFixed(1)}</span>
                                                        </div>
                                                        <div className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            Đánh giá tốt
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className="text-2xl font-black text-slate-900 mb-2">{nurse.fullName}</h3>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em] mb-8">Điều dưỡng chuyên môn cao</p>

                                                <div className="grid grid-cols-2 gap-4 mb-10">
                                                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                                        <ClockIcon className="h-5 w-5 text-brand mb-2" />
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kinh nghiệm</div>
                                                        <div className="text-sm font-black text-slate-900">{nurse.yearsExperience}+ Năm</div>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                                        <HeartIcon className="h-5 w-5 text-brand mb-2" />
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bán kính</div>
                                                        <div className="text-sm font-black text-slate-900">{nurse.serviceRadiusKm} km</div>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => navigate(`/nurses/${nurse.userId}?serviceId=${selectedServiceId}`)} 
                                                    className="w-full btn-primary group/btn"
                                                >
                                                    Xem hồ sơ & Đặt lịch
                                                    <ArrowRightIcon className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
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

