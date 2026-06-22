import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import caremateApi from '../api/caremateApi';
import type { ServiceDetailDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';
import { formatCurrency, getCategoryLabel, getIncludedServiceLabels } from '../utils/servicePresentation';

const ServicesPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceDetailDto[]>([]);

  const trustItems = [
    t('services.trust1'),
    t('services.trust2'),
    t('services.trust3'),
    t('services.trust4'),
  ];
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const serviceIdFromUrl = searchParams.get('serviceId');
  const categoryFromUrl = searchParams.get('category');

  useEffect(() => {
    if (serviceIdFromUrl) {
      navigate(`/services/${serviceIdFromUrl}`, { replace: true });
    }
  }, [navigate, serviceIdFromUrl]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const serviceData = await caremateApi.getServices();
        setServices(serviceData.filter((service) => service.status === 'active'));
      } catch {
        showToast(t('services.toastError'), 'error');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [showToast, i18n.language]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(services.map((service) => service.category?.trim()).filter(Boolean)));
    return ['all', ...unique];
  }, [services]);

  useEffect(() => {
    if (!categoryFromUrl) {
      setSelectedCategory('all');
      return;
    }

    if (categories.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categories, categoryFromUrl]);

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    const next = new URLSearchParams(searchParams);
    next.delete('serviceId');
    if (category === 'all') {
      next.delete('category');
    } else {
      next.set('category', category);
    }
    setSearchParams(next, { replace: true });
  };

  const filteredServices = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return services.filter((service) => {
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      const matchesSearch =
        !keyword ||
        service.name.toLowerCase().includes(keyword) ||
        (service.description?.toLowerCase().includes(keyword) ?? false);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, services]);

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-[#10233F] border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(236,72,153,0.24),transparent_32%),radial-gradient(circle_at_84%_22%,rgba(16,185,129,0.12),transparent_30%)]" />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-8 lg:py-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-brand shadow-sm">
              <SparklesIcon className="h-4 w-4" />
              {t('services.label')}
            </div>
            <h1 className="mt-6 text-[38px] font-black leading-[1.1] tracking-tight text-white sm:text-[48px] lg:text-[58px]">
              {t('services.title1')}
              <span className="mt-2 block font-semibold italic text-brand sm:mt-3">{t('services.title2')}</span>
              {t('services.title3')}
            </h1>
            <p className="mt-6 max-w-xl text-[16px] font-semibold leading-[1.8] text-white/80">
              {t('services.desc')}
            </p>

            <div data-tour="service-search" className="mt-8 flex max-w-2xl flex-col gap-3 rounded-xl border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-md sm:flex-row">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t('services.searchPlaceholder')}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm font-bold text-white placeholder-white/50 outline-none transition focus:border-brand/30 focus:bg-white/20 focus:ring-4 focus:ring-brand/10"
                />
              </div>
              <a href="#service-list" className="inline-flex h-12 items-center justify-center rounded-2xl bg-brand px-7 text-sm font-black text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-brand-deep">
                {t('services.searchBtn')}
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="hidden lg:block">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-white/40">{t('services.dataAvailable')}</div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-brand/10 border border-brand/20 p-5">
                  <div className="text-4xl font-black text-brand">{services.length}</div>
                  <div className="mt-2 text-sm font-black text-white">{t('services.activeServices')}</div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                  <div className="text-4xl font-black text-white">{Math.max(0, categories.length - 1)}</div>
                  <div className="mt-2 text-sm font-black text-white">{t('services.categories')}</div>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-5 text-white">
                <div className="text-sm font-black text-brand">{t('services.process')}</div>
                <div className="mt-2 text-sm font-semibold text-white/70">{t('services.processDesc')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main id="service-list" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Squares2X2Icon className="h-6 w-6 text-brand" />
              <h2 className="text-2xl font-black tracking-tight text-[#10233F]">{t('services.allServicesTitle')}</h2>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">{t('services.servicesMatch', { count: filteredServices.length })}</p>
          </div>

          <div data-tour="service-categories" className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => selectCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-black transition ${
                    active ? 'bg-[#10233F] text-white shadow-lg shadow-slate-200' : 'bg-slate-50 text-slate-600 hover:bg-brand-soft hover:text-brand'
                  }`}
                >
                  {category === 'all' ? t('services.all') : getCategoryLabel(t, category)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service, index) => {
            const included = getIncludedServiceLabels(t, service).slice(0, 2);

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(236,72,153,0.16)]"
              >
                <Link to={`/services/${service.id}`} data-tour="service-card" className="block">
                  <div className="relative h-40 overflow-hidden bg-[linear-gradient(135deg,#fdf2f8,#ffffff_55%,#ecfdf5)]">
                    <div className="absolute inset-0 p-5">
                      <div className="flex h-full items-end rounded-xl border border-white/80 bg-white/70 p-4">
                        <div className="text-2xl font-black leading-tight text-[#10233F]">{service.packageDays ?? 1} {t('services.sessions')}</div>
                      </div>
                    </div>
                    <div className="absolute left-4 top-4 z-10 max-w-[calc(100%-2rem)] truncate whitespace-nowrap rounded-full bg-brand px-3 py-1.5 text-xs font-black text-white shadow-lg shadow-pink-200">
                      {service.serviceKind === 'package' ? t('services.carePackage') : getCategoryLabel(t, service.category)}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-black leading-tight text-[#10233F]">{service.name}</h3>
                    <p className="mt-3 line-clamp-2 min-h-[3.5rem] text-sm font-semibold leading-7 text-slate-600">
                      {service.description || t('services.noDesc')}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-slate-600">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5">
                        <ClockIcon className="h-4 w-4" />
                        {service.packageDays ?? 1} {t('services.sessions')}
                      </span>
                      <span className="rounded-full bg-slate-50 px-3 py-1.5">{service.estimatedDurationMinutes} {t('services.minsPerSession')}</span>
                    </div>

                    {included.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {included.map((item) => (
                          <div key={item} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <ShieldCheckIcon className="h-4 w-4 shrink-0 text-brand" />
                            <span className="line-clamp-1">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <div className="text-xs font-bold text-slate-400">{t('services.from')}</div>
                        <div className="text-xl font-black text-brand">{formatCurrency(service.basePrice)}</div>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-xl border border-brand/20 px-4 py-2 text-sm font-black text-brand transition group-hover:bg-brand group-hover:text-white">
                        {t('services.viewDetail')}
                        <ArrowRightIcon className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-12 grid gap-3 rounded-2xl bg-brand-soft p-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item} className="rounded-2xl bg-white px-4 py-4 text-center text-sm font-black text-[#10233F] shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ServicesPage;
