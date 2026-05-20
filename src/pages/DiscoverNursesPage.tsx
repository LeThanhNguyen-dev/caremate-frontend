import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import caremateApi from '../api/caremateApi';
import type { NurseDiscoveryDto, ServiceDetailDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';

const DiscoverNursesPage = () => {
    const [searchParams] = useSearchParams();
    const serviceId = searchParams.get('serviceId');
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [nurses, setNurses] = useState<NurseDiscoveryDto[]>([]);
    const [services, setServices] = useState<ServiceDetailDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('rating');

    useEffect(() => {
        if (!serviceId) {
            showToast('Hãy chọn dịch vụ trước khi tìm y tá.', 'warning');
            navigate('/services');
        }
    }, [navigate, serviceId, showToast]);

    useEffect(() => {
        const load = async () => {
            if (!serviceId) {
                return;
            }

            try {
                setLoading(true);
                const [nurseData, serviceData] = await Promise.all([
                    caremateApi.getNurses({ serviceId: Number(serviceId) }),
                    caremateApi.getServices(),
                ]);
                setNurses(nurseData);
                setServices(serviceData);
            } catch {
                showToast('Không thể tải danh sách y tá theo dịch vụ đã chọn.', 'error');
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [serviceId, showToast]);

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
            if (sortBy === 'experience') {
                return b.yearsExperience - a.yearsExperience;
            }
            if (sortBy === 'price') {
                return (a.servicePrice ?? 0) - (b.servicePrice ?? 0);
            }
            if (sortBy === 'name') {
                return a.fullName.localeCompare(b.fullName);
            }
            return b.averageRating - a.averageRating;
        });

        return result;
    }, [nurses, search, sortBy]);

    if (loading) {
        return (
            <div className="page-container flex min-h-[420px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="spinner"></div>
                    <div className="text-sm text-slate-500">Đang tìm y tá phù hợp...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container space-y-8">
            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="hero-shell">
                    <div className="accent-label">Bước 2</div>
                    <h1 className="mt-5 font-heading text-4xl font-extrabold text-white">
                        Danh sách y tá đã được lọc theo đúng dịch vụ bạn vừa chọn.
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                        Kết quả chỉ gồm những y tá có mở dịch vụ này, giúp bạn không mất thời gian xem nhầm hồ sơ
                        không phù hợp.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                    {[
                        { label: 'Dịch vụ đang chọn', value: selectedService?.name || 'Đang tải...' },
                        { label: 'Số y tá phù hợp', value: filtered.length },
                        {
                            label: 'Mức giá từ',
                            value: filtered.length
                                ? `${Math.min(...filtered.map((item) => item.servicePrice ?? 0)).toLocaleString('vi-VN')} VND`
                                : 'N/A',
                        },
                    ].map((card) => (
                        <div key={card.label} className="metric-card">
                            <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{card.label}</div>
                            <div className="mt-3 text-lg font-bold text-slate-900">{card.value}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section-shell">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Dịch vụ đã khóa</div>
                        <div className="mt-2 font-heading text-2xl font-bold text-slate-900">{selectedService?.name}</div>
                        <div className="mt-1 text-sm text-slate-600">
                            Cần đổi dịch vụ? Quay lại bước 1 để tìm đúng nhóm y tá tương ứng.
                        </div>
                    </div>
                    <Link to="/services" className="btn-secondary btn-sm">
                        Quay lại chọn dịch vụ
                    </Link>
                </div>
            </section>

            <section className="section-shell">
                <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                    <div className="relative">
                        <svg
                            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            className="form-input pl-12"
                            placeholder="Tìm theo tên, bio, chuyên môn..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                    <select className="form-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                        <option value="rating">Đánh giá cao nhất</option>
                        <option value="experience">Kinh nghiệm nhiều nhất</option>
                        <option value="price">Giá hợp lý nhất</option>
                        <option value="name">Tên A-Z</option>
                    </select>
                </div>
            </section>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-title">Không tìm thấy y tá phù hợp</div>
                    <div className="empty-state-text">Thử đổi từ khóa tìm kiếm hoặc quay lại chọn một dịch vụ khác.</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((nurse) => (
                        <div key={nurse.userId} className="card flex h-full flex-col">
                            <div className="card-body flex flex-1 flex-col">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 text-2xl font-black text-white">
                                            {nurse.fullName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-heading text-2xl font-bold text-slate-900">{nurse.fullName}</div>
                                            <div className="mt-1 text-sm font-medium text-slate-500">
                                                {nurse.specialization || 'Chuyên viên chăm sóc tại nhà'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="surface-tag">{nurse.averageRating.toFixed(1)}</div>
                                </div>

                                <p className="mt-5 flex-1 text-sm leading-7 text-slate-600">
                                    {nurse.bio || 'Hồ sơ đang được bổ sung mô tả chi tiết về kinh nghiệm chăm sóc.'}
                                </p>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Kinh nghiệm</div>
                                        <div className="mt-2 text-sm font-semibold text-slate-900">{nurse.yearsExperience} năm</div>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Giá cho dịch vụ này</div>
                                        <div className="mt-2 text-sm font-semibold text-slate-900">
                                            {(nurse.servicePrice ?? 0).toLocaleString('vi-VN')} VND
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Link to={`/nurses/${nurse.userId}?serviceId=${serviceId}`} className="btn-primary w-full justify-between">
                                        Xem hồ sơ và đặt lịch
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M13 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DiscoverNursesPage;
