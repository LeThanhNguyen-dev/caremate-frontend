import { useEffect, useMemo, useState, useCallback } from 'react';
import caremateApi from '../api/caremateApi';
import type { NurseServiceDto, ServiceDetailDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';
import { 
     
    PlusIcon, 
    TrashIcon, 
    CurrencyDollarIcon,
    SparklesIcon,
    TagIcon
} from '@heroicons/react/24/outline';

const NurseServicesPage = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [myServices, setMyServices] = useState<NurseServiceDto[]>([]);
    const [allServices, setAllServices] = useState<ServiceDetailDto[]>([]);
    const [form, setForm] = useState({ serviceId: '', price: '', unit: 'hourly' });

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [mine, catalog] = await Promise.all([
                caremateApi.getNurseServices(),
                caremateApi.getServices()
            ]);
            setMyServices(mine);
            setAllServices(catalog);
        } catch {
            showToast('Không thể tải danh sách dịch vụ.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const catalogOptions = useMemo(
        () => allServices.filter((item) => item.status === 'active' && !myServices.some((mine) => mine.serviceId === item.id)),
        [allServices, myServices],
    );

    const addService = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await caremateApi.createNurseService({
                serviceId: Number(form.serviceId),
                price: Number(form.price),
                unit: form.unit,
            });
            setForm({ serviceId: '', price: '', unit: 'hourly' });
            showToast('Đã thêm dịch vụ mới.', 'success');
            await load();
        } catch {
            showToast('Không thể thêm dịch vụ.', 'error');
        }
    };

    const removeService = async (serviceId: number) => {
        try {
            await caremateApi.deleteNurseService(serviceId);
            showToast('Đã gỡ dịch vụ khỏi hồ sơ.', 'success');
            await load();
        } catch {
            showToast('Không thể xóa dịch vụ.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-nurse border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">Đang tải dịch vụ...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 selection:bg-nurse/10">
            <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
                <div className="luxury-card bg-[#111827] text-white p-12 border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-nurse/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10">
                        <div className="accent-label !bg-white/10 !text-white border-white/10">Danh mục dịch vụ</div>
                        <h1 className="text-4xl font-black text-white mt-4">Kinh doanh chuyên môn</h1>
                    </div>
                </div>

                <div className="grid gap-4">
                    {[
                        { label: 'Đang cung cấp', value: myServices.length, icon: SparklesIcon, color: 'text-nurse bg-nurse/5' },
                        { label: 'Dịch vụ khả dụng', value: catalogOptions.length, icon: TagIcon, color: 'text-green-600 bg-green-50' },
                        { label: 'Giá trung bình', value: myServices.length ? `${Math.round(myServices.reduce((sum, item) => sum + item.price, 0) / myServices.length).toLocaleString('vi-VN')}đ` : '0đ', icon: CurrencyDollarIcon, color: 'text-blue-600 bg-blue-50' },
                    ].map((item) => (
                        <div key={item.label} className="luxury-card p-6 flex items-center gap-5 border-none shadow-lg">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                                <div className="mt-1 text-xl font-black text-slate-900">{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
                <div className="luxury-card p-10 border-none shadow-xl">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-[#111827]">Đăng ký dịch vụ mới</h3>
                        </div>
                        <PlusIcon className="h-8 w-8 text-nurse/20" />
                    </div>

                    <form onSubmit={addService} className="space-y-8">
                        <div>
                            <label className="form-label">Tên dịch vụ</label>
                            <select 
                                className="form-input appearance-none bg-slate-50" 
                                value={form.serviceId} 
                                onChange={(event) => setForm((prev) => ({ ...prev, serviceId: event.target.value }))} 
                                required
                            >
                                <option value="">Chọn dịch vụ...</option>
                                {catalogOptions.map((item) => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="form-label">Mức giá (VNĐ)</label>
                                <input type="number" className="form-input" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} required />
                            </div>
                            <div>
                                <label className="form-label">Đơn vị tính</label>
                                <select className="form-input" value={form.unit} onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}>
                                    <option value="hourly">Theo giờ</option>
                                    <option value="fixed">Trọn gói</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full py-4 rounded-2xl shadow-lg shadow-nurse/20 flex items-center justify-center gap-2">
                            <PlusIcon className="h-5 w-5" /> Thêm dịch vụ
                        </button>
                    </form>
                </div>

                <div className="luxury-card p-10 border-none shadow-xl">
                    <div className="mb-10 flex items-center justify-between">
                        <h3 className="text-xl font-black text-[#111827]">Danh mục đang mở</h3>
                    </div>
                    <div className="space-y-4">
                        {myServices.map((service) => (
                            <div key={service.id} className="p-6 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-nurse shadow-sm">
                                            <SparklesIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900">{service.serviceName}</div>
                                            <div className="mt-1 text-[11px] font-bold text-nurse uppercase">
                                                {service.price.toLocaleString('vi-VN')}đ / {service.unit}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => void removeService(service.id)} className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NurseServicesPage;

