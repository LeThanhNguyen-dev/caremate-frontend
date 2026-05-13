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
import { useAuth } from '../hooks/useAuth';
import NursePendingApproval from '../components/nurse/NursePendingApproval';

const NurseServicesPage = () => {
    const { user } = useAuth();
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
            showToast('Đã thêm dịch vụ mới thành công.', 'success');
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

    if (user?.role !== 'nurse_confirmed') {
        return <NursePendingApproval />;
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#10B981] border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang đồng bộ dịch vụ chuyên môn...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 selection:bg-emerald-100">
            {/* Header Section */}
            <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
                <div className="luxury-card bg-slate-900 text-white p-12 border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] mb-4">Quản trị dịch vụ</div>
                        <h1 className="text-4xl font-black text-white mt-4 tracking-tight">Kinh doanh chuyên môn</h1>
                        <p className="mt-4 text-white/50 font-medium">Thiết lập các gói chăm sóc và mức giá phục vụ khách hàng.</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {[
                        { label: 'Dịch vụ đang mở', value: myServices.length, icon: SparklesIcon, color: 'text-[#10B981] bg-emerald-50' },
                        { label: 'Danh mục khả dụng', value: catalogOptions.length, icon: TagIcon, color: 'text-[#10B981] bg-emerald-50' },
                        { label: 'Giá trung bình', value: myServices.length ? `${Math.round(myServices.reduce((sum, item) => sum + item.price, 0) / myServices.length).toLocaleString('vi-VN')}đ` : '0đ', icon: CurrencyDollarIcon, color: 'text-[#10B981] bg-emerald-50' },
                    ].map((item) => (
                        <div key={item.label} className="luxury-card p-6 flex items-center gap-5 border-none shadow-lg transition-all hover:translate-x-2">
                            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${item.color}`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                                <div className="mt-1 text-2xl font-black text-slate-900">{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
                {/* Form Section */}
                <div className="luxury-card p-10 border-none shadow-xl bg-white">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Thêm dịch vụ mới</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gia tăng cơ hội kết nối khách hàng</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-[#10B981]">
                            <PlusIcon className="h-6 w-6" />
                        </div>
                    </div>

                    <form onSubmit={addService} className="space-y-8">
                        <div>
                            <label className="form-label">Tên dịch vụ từ hệ thống</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-slate-50 border-none rounded-lg py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all appearance-none cursor-pointer" 
                                    value={form.serviceId} 
                                    onChange={(event) => setForm((prev) => ({ ...prev, serviceId: event.target.value }))} 
                                    required
                                >
                                    <option value="">Chọn một dịch vụ chuyên môn...</option>
                                    {catalogOptions.map((item) => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <PlusIcon className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="form-label">Mức giá đề xuất (VNĐ)</label>
                                <input type="number" className="w-full bg-slate-50 border-none rounded-lg py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" placeholder="Ví dụ: 200000" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} required />
                            </div>
                            <div>
                                <label className="form-label">Đơn vị thanh toán</label>
                                <select className="w-full bg-slate-50 border-none rounded-lg py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={form.unit} onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}>
                                    <option value="hourly">Mỗi giờ làm việc</option>
                                    <option value="fixed">Tính trọn gói ca</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="bg-[#10B981] text-white w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all">
                            Xác nhận đăng ký dịch vụ
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="luxury-card p-10 border-none shadow-xl bg-white overflow-hidden">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Dịch vụ của bạn</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Đang hiển thị trên hồ sơ cá nhân</p>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {myServices.length === 0 ? (
                            <div className="py-20 text-center rounded-xl bg-slate-50 border-2 border-dashed border-slate-100">
                                <TagIcon className="h-12 w-12 mx-auto text-slate-200 mb-6" />
                                <p className="text-sm font-bold text-slate-400">Bạn chưa đăng ký dịch vụ nào.</p>
                            </div>
                        ) : (
                            myServices.map((service) => (
                                <div key={service.id} className="group p-6 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-emerald-600/5 border border-transparent hover:border-emerald-500/10 transition-all duration-300">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-lg bg-white flex items-center justify-center text-[#10B981] shadow-sm transition-transform group-hover:scale-110">
                                                <SparklesIcon className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <div className="text-lg font-black text-slate-900 tracking-tight">{service.serviceName}</div>
                                                <div className="mt-1 text-[11px] font-black text-[#10B981] uppercase tracking-widest">
                                                    {service.price.toLocaleString('vi-VN')}đ / {service.unit === 'hourly' ? 'Giờ' : 'Ca'}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => void removeService(service.id)} 
                                            className="h-12 w-12 rounded-lg bg-white flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 border border-slate-100 transition-all active:scale-90"
                                            title="Gỡ dịch vụ"
                                        >
                                            <TrashIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NurseServicesPage;
