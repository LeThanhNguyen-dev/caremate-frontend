import { useEffect, useMemo, useState, useCallback } from 'react';
import caremateApi from '../api/caremateApi';
import type { NurseServiceDto, ServiceDetailDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';
import { 
    PlusIcon, 
    TrashIcon, 
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon,
    CurrencyDollarIcon,
    SparklesIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import NursePendingApproval from '../components/nurse/NursePendingApproval';
import { useTranslation } from 'react-i18next';

const NurseServicesPage = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [myServices, setMyServices] = useState<NurseServiceDto[]>([]);
    const [allServices, setAllServices] = useState<ServiceDetailDto[]>([]);
    const [form, setForm] = useState({ serviceId: '', price: '', unit: 'fixed' });
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ price: '', unit: 'fixed' });
    const [savingEdit, setSavingEdit] = useState(false);

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
            showToast(t('nurseServices.toast.errorLoad'), 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast, i18n.language]);

    useEffect(() => {
        void load();
    }, [load]);

    const catalogOptions = useMemo(
        () => allServices.filter((item) => item.status === 'active' && !myServices.some((mine) => mine.serviceId === item.id)),
        [allServices, myServices],
    );

    const selectedCatalogService = useMemo(
        () => allServices.find((item) => item.id === Number(form.serviceId)),
        [allServices, form.serviceId],
    );

    const getCatalogService = (serviceId: number) => allServices.find((item) => item.id === serviceId);

    const addService = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await caremateApi.createNurseService({
                serviceId: Number(form.serviceId),
                price: Number(form.price),
                unit: form.unit,
            });
            setForm({ serviceId: '', price: '', unit: 'fixed' });
            showToast(t('nurseServices.toast.addSuccess'), 'success');
            await load();
        } catch {
            showToast(t('nurseServices.toast.addFail'), 'error');
        }
    };

    const removeService = async (serviceId: number) => {
        try {
            await caremateApi.deleteNurseService(serviceId);
            showToast(t('nurseServices.toast.removeSuccess'), 'success');
            if (editingServiceId === serviceId) {
                setEditingServiceId(null);
            }
            await load();
        } catch {
            showToast(t('nurseServices.toast.removeFail'), 'error');
        }
    };

    const startEditService = (service: NurseServiceDto) => {
        setEditingServiceId(service.id);
        setEditForm({
            price: String(service.price),
            unit: service.unit,
        });
    };

    const cancelEditService = () => {
        setEditingServiceId(null);
        setEditForm({ price: '', unit: 'fixed' });
    };

    const saveEditService = async (serviceId: number) => {
        try {
            setSavingEdit(true);
            await caremateApi.updateNurseService(serviceId, {
                price: Number(editForm.price),
                unit: editForm.unit,
            });
            showToast(t('nurseServices.toast.updateSuccess'), 'success');
            cancelEditService();
            await load();
        } catch {
            showToast(t('nurseServices.toast.updateFail'), 'error');
        } finally {
            setSavingEdit(false);
        }
    };

    const toggleServiceStatus = async (service: NurseServiceDto) => {
        try {
            await caremateApi.updateNurseService(service.id, {
                price: service.price,
                unit: service.unit,
                status: service.status === 'enabled' ? 'disabled' : 'enabled',
            });
            showToast(
                service.status === 'enabled' ? t('nurseServices.toast.statusHidden') : t('nurseServices.toast.statusVisible'),
                'success',
            );
            await load();
        } catch {
            showToast(t('nurseServices.toast.statusFail'), 'error');
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
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t('nurseServices.hero.loading')}</span>
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] mb-4">{t('nurseServices.hero.badge')}</div>
                        <h1 className="text-4xl font-black text-white mt-4 tracking-tight">{t('nurseServices.hero.title')}</h1>
                        <p className="mt-4 text-white/50 font-medium">{t('nurseServices.hero.desc')}</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {[
                        { label: t('nurseServices.hero.activeServices'), value: myServices.length, icon: SparklesIcon, color: 'text-[#10B981] bg-emerald-50' },
                        { label: t('nurseServices.hero.availableCatalog'), value: catalogOptions.length, icon: TagIcon, color: 'text-[#10B981] bg-emerald-50' },
                        { label: t('nurseServices.hero.avgPrice'), value: myServices.length ? `${Math.round(myServices.reduce((sum, item) => sum + item.price, 0) / myServices.length).toLocaleString('vi-VN')}đ` : t('nurseServices.hero.avgPriceFormat'), icon: CurrencyDollarIcon, color: 'text-[#10B981] bg-emerald-50' },
                    ].map((item) => (
                        <div key={item.label} className="luxury-card p-6 flex items-center gap-5 border-none shadow-lg transition-all hover:translate-x-2">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.color}`}>
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
                <div data-tour="nurse-services-form" className="luxury-card p-10 border-none shadow-xl bg-white">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('nurseServices.form.addTitle')}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('nurseServices.form.addSubtitle')}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#10B981]">
                            <PlusIcon className="h-6 w-6" />
                        </div>
                    </div>

                    <form onSubmit={addService} className="space-y-8">
                        <div>
                            <label className="form-label">{t('nurseServices.form.serviceNameLabel')}</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all appearance-none cursor-pointer" 
                                    value={form.serviceId} 
                                    onChange={(event) => setForm((prev) => ({ ...prev, serviceId: event.target.value }))} 
                                    required
                                >
                                    <option value="">{t('nurseServices.form.selectPlaceholder')}</option>
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
                                <label className="form-label">{t('nurseServices.form.suggestedPriceLabel')}</label>
                                <input type="number" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" placeholder={t('nurseServices.form.pricePlaceholder')} value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} required />
                            </div>
                            <div>
                                <label className="form-label">{t('nurseServices.form.billingUnitLabel')}</label>
                                <select className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={form.unit} onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}>
                                    <option value="fixed">{t('nurseServices.form.fixedPrice')}</option>
                                    <option value="hourly">{t('nurseServices.form.hourlyPrice')}</option>
                                </select>
                            </div>
                        </div>
                        {selectedCatalogService && (
                            <div 
                                className="rounded-xl bg-emerald-50 px-5 py-4 text-sm font-semibold leading-6 text-slate-700"
                                dangerouslySetInnerHTML={{ __html: t('nurseServices.form.durationNote', { duration: selectedCatalogService.estimatedDurationMinutes }) }}
                            />
                        )}
                        <button type="submit" className="bg-[#10B981] text-white w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all">
                            {t('nurseServices.form.btnSubmit')}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div data-tour="nurse-services-list" className="luxury-card p-10 border-none shadow-xl bg-white overflow-hidden">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('nurseServices.list.listTitle')}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('nurseServices.list.listSubtitle')}</p>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {myServices.length === 0 ? (
                            <div className="py-20 text-center rounded-xl bg-slate-50 border-2 border-dashed border-slate-100">
                                <TagIcon className="h-12 w-12 mx-auto text-slate-200 mb-6" />
                                <p className="text-sm font-bold text-slate-400">{t('nurseServices.list.noServices')}</p>
                            </div>
                        ) : (
                            myServices.map((service) => (
                                <div key={service.id} className="group p-6 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-emerald-600/5 border border-transparent hover:border-emerald-500/10 transition-all duration-300">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-5">
                                            <div className="h-14 w-14 rounded-xl bg-white flex items-center justify-center text-[#10B981] shadow-sm transition-transform group-hover:scale-110">
                                                <SparklesIcon className="h-7 w-7" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-lg font-black text-slate-900 tracking-tight">{service.serviceName}</div>
                                                <div className="mt-2">
                                                    <span
                                                        className={`inline-flex rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                                            service.status === 'enabled'
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : 'bg-slate-200 text-slate-500'
                                                        }`}
                                                    >
                                                        {service.status === 'enabled' ? t('nurseServices.list.statusEnabled') : t('nurseServices.list.statusDisabled')}
                                                    </span>
                                                </div>
                                                {editingServiceId === service.id ? (
                                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="w-full rounded-xl border-none bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5"
                                                            value={editForm.price}
                                                            onChange={(event) =>
                                                                setEditForm((prev) => ({ ...prev, price: event.target.value }))
                                                            }
                                                            placeholder={t('nurseServices.list.pricePlaceholderEdit')}
                                                        />
                                                        <select
                                                            className="w-full rounded-xl border-none bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5"
                                                            value={editForm.unit}
                                                            onChange={(event) =>
                                                                setEditForm((prev) => ({ ...prev, unit: event.target.value }))
                                                            }
                                                        >
                                                            <option value="fixed">{t('nurseServices.form.fixedPrice')}</option>
                                                            <option value="hourly">{t('nurseServices.form.hourlyPrice')}</option>
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="mt-1 text-[11px] font-black text-[#10B981] uppercase tracking-widest">
                                                            {t('nurseServices.list.priceFormat', { price: service.price.toLocaleString('vi-VN'), unit: service.unit === 'hourly' ? t('nurseServices.list.unitHour') : t('nurseServices.list.unitSession') })}
                                                        </div>
                                                        <div className="mt-1 text-xs font-semibold text-slate-400">
                                                            {service.unit === 'hourly'
                                                                ? t('nurseServices.list.noteHourly', { duration: getCatalogService(service.serviceId)?.estimatedDurationMinutes ?? '?' })
                                                                : t('nurseServices.list.noteFixed', { duration: getCatalogService(service.serviceId)?.estimatedDurationMinutes ?? '?' })}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => void toggleServiceStatus(service)}
                                                className={`rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                                    service.status === 'enabled'
                                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                }`}
                                                title={service.status === 'enabled' ? t('nurseServices.list.btnHide') : t('nurseServices.list.btnShow')}
                                            >
                                                {service.status === 'enabled' ? t('nurseServices.list.btnHide') : t('nurseServices.list.btnShow')}
                                            </button>

                                            {editingServiceId === service.id ? (
                                                <>
                                                    <button
                                                        onClick={() => void saveEditService(service.id)}
                                                        disabled={savingEdit || !editForm.price || Number(editForm.price) <= 0}
                                                        className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#10B981] border border-emerald-100 transition-all disabled:opacity-50"
                                                        title={t('nurseServices.list.btnSaveEdit')}
                                                    >
                                                        <CheckIcon className="h-6 w-6" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditService}
                                                        disabled={savingEdit}
                                                        className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 border border-slate-100 transition-all disabled:opacity-50"
                                                        title={t('nurseServices.list.btnCancelEdit')}
                                                    >
                                                        <XMarkIcon className="h-6 w-6" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => startEditService(service)}
                                                    className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-slate-400 hover:text-[#10B981] hover:bg-emerald-50 border border-slate-100 transition-all active:scale-90"
                                                    title={t('nurseServices.list.btnEdit')}
                                                >
                                                    <PencilSquareIcon className="h-6 w-6" />
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => void removeService(service.id)} 
                                                className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 border border-slate-100 transition-all active:scale-90"
                                                title={t('nurseServices.list.btnRemove')}
                                            >
                                                <TrashIcon className="h-6 w-6" />
                                            </button>
                                        </div>
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
