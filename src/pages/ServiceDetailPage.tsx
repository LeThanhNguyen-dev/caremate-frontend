import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import caremateApi from '../api/caremateApi';
import type { NurseDiscoveryDto, ServiceDetailDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';
import {
  formatCurrency,
  getCategoryLabel,
  getIncludedServiceLabels,
  getScheduleTitle,
  getVisiblePackageSchedule,
} from '../utils/servicePresentation';

const ServiceDetailPage = () => {
  const { t, i18n } = useTranslation();
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [service, setService] = useState<ServiceDetailDto | null>(null);
  const [services, setServices] = useState<ServiceDetailDto[]>([]);
  const [nurses, setNurses] = useState<NurseDiscoveryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const id = Number(serviceId);
      if (!Number.isFinite(id)) {
        navigate('/services', { replace: true });
        return;
      }

      try {
        setLoading(true);
        const [serviceData, allServices, nurseData] = await Promise.all([
          caremateApi.getServiceById(id),
          caremateApi.getServices().catch(() => []),
          caremateApi.getNurses({ serviceId: id }).catch(() => []),
        ]);
        setService(serviceData);
        setServices(allServices.filter((item) => item.status === 'active'));
        setNurses(nurseData);
      } catch {
        showToast(t('serviceDetail.toastError'), 'error');
        navigate('/services', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [navigate, serviceId, showToast, i18n.language]);

  const schedule = useMemo(() => getVisiblePackageSchedule(service), [service]);
  const included = useMemo(() => (service ? getIncludedServiceLabels(t, service) : []), [service, t]);
  const relatedServices = useMemo(
    () => services.filter((item) => item.id !== service?.id && item.category === service?.category).slice(0, 3),
    [service, services],
  );
  const previewNurses = useMemo(() => nurses.slice(0, 3), [nurses]);

  if (loading || !service) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfcff] pb-24 lg:pb-0">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-12">
          <div>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-black text-slate-600 transition hover:bg-brand-soft hover:text-brand"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {t('serviceDetail.back')}
            </button>

            <div className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-400">
              <Link to="/" className="hover:text-brand">{t('serviceDetail.home')}</Link>
              <span>/</span>
              <Link to="/services" className="hover:text-brand">{t('serviceDetail.services')}</Link>
              <span>/</span>
              <span className="text-brand">{service.name}</span>
            </div>

            <div className="inline-flex rounded-full bg-brand-soft px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-brand">
              {getCategoryLabel(t, service.category)}
            </div>
            <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-tight text-[#10233F] sm:text-5xl">
              {service.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600">
              {service.description || t('serviceDetail.noDesc')}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <InfoChip icon={<ClockIcon className="h-4 w-4" />} label={t('serviceDetail.sessionsCount', { count: service.packageDays ?? 1 })} />
              <InfoChip icon={<ClockIcon className="h-4 w-4" />} label={t('serviceDetail.durationPerSession', { count: service.estimatedDurationMinutes })} />
            </div>
          </div>

          <div data-tour="service-detail-info" className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{t('serviceDetail.sysInfo')}</div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <DataTile label={t('serviceDetail.serviceCode')} value={`#${service.id}`} />
              <DataTile label={t('serviceDetail.category')} value={getCategoryLabel(t, service.category)} />
              <DataTile label={t('serviceDetail.sessions')} value={`${service.packageDays ?? 1}`} />
              <DataTile label={t('serviceDetail.duration')} value={`${service.estimatedDurationMinutes} phút`} />
            </div>
            <div className="mt-5 rounded-2xl bg-brand-soft p-5">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-brand/70">{t('serviceDetail.priceFrom')}</div>
              <div className="mt-1 text-4xl font-black text-brand">{formatCurrency(service.basePrice)}</div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="space-y-6">
          <Section title={t('serviceDetail.included')}>
            {included.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {included.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <span className="text-sm font-bold leading-6 text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyRealData message={t('serviceDetail.noIncluded')} />
            )}
          </Section>

          <Section title={t('serviceDetail.schedule')}>
            {schedule.length > 0 ? (
              <div className="space-y-3">
                {schedule.map((item, index) => (
                  <details key={`${item.day}-${item.title}`} open={index === 0} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-white px-4 py-4 text-left transition group-open:bg-brand-soft">
                      <div>
                        <div className="text-xs font-black uppercase tracking-[0.14em] text-brand">{t('serviceDetail.day', { day: item.day })}</div>
                        <div className="mt-1 text-sm font-black text-[#10233F]">{getScheduleTitle(item)}</div>
                      </div>
                      <span className="text-lg font-black text-brand">+</span>
                    </summary>
                    <div className="border-t border-slate-100 px-4 py-4 text-sm font-semibold leading-7 text-slate-600">
                      {item.description}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <EmptyRealData message={t('serviceDetail.noSchedule')} />
            )}
          </Section>

          <Section title={t('serviceDetail.nurses')}>
            {previewNurses.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {previewNurses.map((nurse) => (
                    <article key={nurse.userId} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex items-start gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-soft text-lg font-black text-brand">
                          {nurse.avatar ? <img src={nurse.avatar} alt={nurse.fullName} className="h-full w-full object-cover" /> : nurse.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-black text-[#10233F]">{nurse.fullName}</div>
                          <div className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{nurse.specialization || t('serviceDetail.noSpec')}</div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black text-slate-600">
                        <span className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-50 px-2 py-2">
                          <StarIcon className="h-4 w-4 text-amber-500" />
                          {nurse.averageRating.toFixed(1)}
                        </span>
                        <span className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-50 px-2 py-2">
                          <MapPinIcon className="h-4 w-4 text-brand" />
                          {nurse.distanceKm != null ? `${nurse.distanceKm.toFixed(1)} km` : t('serviceDetail.radius', { km: nurse.serviceRadiusKm })}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/nurses/${nurse.userId}?serviceId=${service.id}`)}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand/20 px-3 py-2.5 text-sm font-black text-brand transition hover:bg-brand hover:text-white"
                      >
                        {t('serviceDetail.viewProfile')}
                        <ArrowRightIcon className="h-4 w-4" />
                      </button>
                    </article>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/find-nurse?serviceId=${service.id}`)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10233F] px-5 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand md:w-auto"
                >
                  {t('serviceDetail.viewAllNurses', { count: nurses.length })}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm font-black text-[#10233F]">{t('serviceDetail.noNurses')}</div>
                <button
                  type="button"
                  onClick={() => navigate(`/find-nurse?serviceId=${service.id}`)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-black text-white"
                >
                  {t('serviceDetail.openNurseSearch')}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </Section>

          {relatedServices.length > 0 && (
            <Section title={t('serviceDetail.related')}>
              <div className="grid gap-4 md:grid-cols-3">
                {relatedServices.map((item) => (
                  <Link key={item.id} to={`/services/${item.id}`} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="h-24 bg-[linear-gradient(135deg,#fdf2f8,#ffffff_55%,#ecfdf5)] p-4">
                      <div className="text-xs font-black uppercase tracking-[0.16em] text-brand">{getCategoryLabel(t, item.category)}</div>
                    </div>
                    <div className="p-4">
                      <div className="line-clamp-2 text-sm font-black text-[#10233F]">{item.name}</div>
                      <div className="mt-2 text-sm font-black text-brand">Từ {formatCurrency(item.basePrice)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:sticky lg:top-24">
          <div className="text-sm font-black text-[#10233F]">{service.name}</div>
          <div className="mt-4 text-xs font-bold text-slate-400">{t('serviceDetail.totalCostFrom')}</div>
          <div className="mt-1 text-4xl font-black text-brand">{formatCurrency(service.basePrice)}</div>

          <div className="mt-5 space-y-3 text-sm font-bold text-slate-600">
            <InfoLine label={t('serviceDetail.sessionsCount', { count: service.packageDays ?? 1 })} />
            <InfoLine label={t('serviceDetail.durationPerSession', { count: service.estimatedDurationMinutes })} />
          </div>

          <button
            type="button"
            data-tour="service-book-now"
            onClick={() => navigate(`/find-nurse?serviceId=${service.id}`)}
            className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-sm font-black text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-brand-deep"
          >
            {t('serviceDetail.bookNow')}
            <ArrowRightIcon className="h-4 w-4" />
          </button>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-center text-xs font-bold leading-5 text-slate-500">
            {t('serviceDetail.disclaimer')}
          </div>
        </aside>
      </main>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-400">{t('serviceDetail.totalCostFrom')}</div>
            <div className="mt-0.5 text-lg font-black text-brand">{formatCurrency(service.basePrice)}</div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/find-nurse?serviceId=${service.id}`)}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand px-6 text-sm font-black text-white shadow-lg shadow-pink-200 transition active:scale-95 sm:flex-none sm:px-10"
          >
            {t('serviceDetail.bookNow')}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
      <h2 className="mb-4 text-xl font-black text-[#10233F]">{title}</h2>
      {children}
    </section>
  );
}

function DataTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-black text-[#10233F]">{value}</div>
    </div>
  );
}

function EmptyRealData({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500">
      {message}
    </div>
  );
}

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-black text-slate-700">
      {icon}
      {label}
    </span>
  );
}

function InfoLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3">
      <ShieldCheckIcon className="h-5 w-5 text-brand" />
      {label}
    </div>
  );
}

export default ServiceDetailPage;
