import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../hooks/useToast';
import caremateApi from '../api/caremateApi';
import type { AdminOcrSettingsDto, ServiceDetailDto } from '../api/frontend-api-contract';
import {
    Cog8ToothIcon,
    PencilSquareIcon,
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon,
    SparklesIcon,
    DocumentMagnifyingGlassIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AdminSettings = () => {
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [services, setServices] = useState<ServiceDetailDto[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({
        name: '',
        category: '',
        description: '',
        basePrice: '',
        estimatedDurationMinutes: '',
        serviceKind: 'single',
        packageDays: '',
        includedServiceKeys: '',
        packageScheduleJson: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(true);
    const [ocrSettings, setOcrSettings] = useState<AdminOcrSettingsDto | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [data, ocr] = await Promise.all([
                caremateApi.getServices(),
                caremateApi.getAdminOcrSettings()
            ]);
            setServices(data);
            setOcrSettings(ocr);
        } catch {
            showToast(t('adminSettings.loadError'), 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const startEdit = async (id: number) => {
        try {
            const s = await caremateApi.getServiceById(id);
            setEditingId(id);
            setForm({
                name: s.name,
                category: s.category || '',
                description: s.description || '',
                basePrice: String(s.basePrice),
                estimatedDurationMinutes: String(s.estimatedDurationMinutes),
                serviceKind: s.serviceKind || 'single',
                packageDays: s.packageDays ? String(s.packageDays) : '',
                includedServiceKeys: s.includedServiceKeys || '',
                packageScheduleJson: s.packageSchedule?.length ? JSON.stringify(s.packageSchedule) : '',
                status: s.status
            });
        } catch {
            showToast(t('adminSettings.serviceLoadError'), 'error');
        }
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        try {
            await caremateApi.updateService(editingId, {
                name: form.name,
                category: form.category,
                description: form.description,
                basePrice: Number(form.basePrice),
                estimatedDurationMinutes: Number(form.estimatedDurationMinutes),
                serviceKind: form.serviceKind,
                packageDays: form.packageDays ? Number(form.packageDays) : undefined,
                includedServiceKeys: form.includedServiceKeys || undefined,
                packageScheduleJson: form.packageScheduleJson || undefined,
                status: form.status
            });
            setEditingId(null);
            showToast('Cập nhật dịch vụ thành công!', 'success');
            await load();
        } catch {
            showToast('Cập nhật thất bại.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#3B82F6] border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang tải cài đặt...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#3B82F6] text-[9px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
                        <Cog8ToothIcon className="h-3 w-3" />
                        Quản trị hệ thống
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                        Cài đặt <span className="text-[#3B82F6]">hệ thống</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        Quản lý danh mục dịch vụ và cấu hình hệ thống CareMate.
                    </p>
                </div>
                <button
                    onClick={load}
                    className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all shadow-sm active:scale-95"
                >
                    <ArrowPathIcon className="h-4 w-4" />
                    Làm mới
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="bg-white rounded-xl border border-slate-50 p-8 shadow-xl shadow-slate-200/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <div className="h-14 w-14 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                <DocumentMagnifyingGlassIcon className="h-7 w-7 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">
                                    FPT AI OCR
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                    Nhận diện CCCD cho hồ sơ điều dưỡng
                                </h2>
                                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                                    Admin có thể kiểm tra trạng thái cấu hình OCR dùng cho bước quét CCCD trước khi điều dưỡng nộp hồ sơ xác minh.
                                </p>
                            </div>
                        </div>
                        <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
                            ocrSettings?.isConfigured
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                        }`}>
                            {ocrSettings?.isConfigured ? (
                                <ShieldCheckIcon className="h-4 w-4" />
                            ) : (
                                <ExclamationTriangleIcon className="h-4 w-4" />
                            )}
                            {ocrSettings?.isConfigured ? 'Đã cấu hình' : 'Thiếu API key'}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-50 p-8 shadow-xl shadow-slate-200/20">
                    <div className="space-y-5">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Provider</div>
                            <div className="text-sm font-black text-slate-900">{ocrSettings?.provider ?? 'FPT AI'}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Endpoint</div>
                            <div className="break-all rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600">
                                {ocrSettings?.idCardEndpoint ?? 'https://api.fpt.ai/vision/idr/vnm'}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">API key</div>
                            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600">
                                {ocrSettings?.maskedApiKey ?? 'Chưa cấu hình'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services List */}
            <div className="space-y-4">
                {services.map((s) => (
                    <div
                        key={s.id}
                        className="bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20 hover:shadow-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <SparklesIcon className="h-7 w-7 text-[#3B82F6]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{s.name}</h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400 mt-2">
                                    <span>{s.basePrice.toLocaleString()} VNĐ</span>
                                    <span className="text-slate-200">·</span>
                                    <span>{s.estimatedDurationMinutes} phút</span>
                                    <span className="text-slate-200">·</span>
                                    {s.status === 'active' ? (
                                        <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">Hoạt động</span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">Ngừng</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            className="bg-slate-50 text-slate-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-[#3B82F6] transition-all active:scale-95 flex items-center gap-2 shrink-0"
                            onClick={() => void startEdit(s.id)}
                        >
                            <PencilSquareIcon className="h-4 w-4" />
                            Chỉnh sửa
                        </button>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingId && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-md">
                    <div className="w-full max-w-2xl rounded-xl bg-white p-12 shadow-2xl">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chỉnh sửa dịch vụ #{editingId}</h2>
                            <button
                                onClick={() => setEditingId(null)}
                                className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={save} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Tên dịch vụ</label>
                                    <input
                                        className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Trạng thái</label>
                                    <select
                                        className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all"
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Ngừng</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Đơn giá (VNĐ)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all"
                                        value={form.basePrice}
                                        onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Thời gian (Phút)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all"
                                        value={form.estimatedDurationMinutes}
                                        onChange={(e) => setForm({ ...form, estimatedDurationMinutes: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Mô tả</label>
                                    <textarea
                                        className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="bg-[#3B82F6] text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <CheckIcon className="h-4 w-4" />
                                    Lưu thay đổi
                                </button>
                                <button
                                    type="button"
                                    className="bg-slate-50 text-slate-600 px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                                    onClick={() => setEditingId(null)}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
