import { useEffect, useMemo, useState } from 'react';
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
        showToast('Không thể tải chi tiết dịch vụ.', 'error');
        navigate('/services', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [navigate, serviceId, showToast]);

  const schedule = useMemo(() => getVisiblePackageSchedule(service), [service]);
  const included = useMemo(() => (service ? getIncludedServiceLabels(service) : []), [service]);
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
    <div className="min-h-screen bg-[#fbfcff]">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_500px] lg:px-8 lg:py-12">
          <div>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-black text-slate-600 transition hover:bg-brand-soft hover:text-brand"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Quay lại dịch vụ
            </button>

            <div className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-400">
              <Link to="/" className="hover:text-brand">Trang chủ</Link>
              <span>/</span>
              <Link to="/services" className="hover:text-brand">Dịch vụ</Link>
              <span>/</span>
              <span className="text-brand">{service.name}</span>
            </div>

            <div className="inline-flex rounded-full bg-brand-soft px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-brand">
              {getCategoryLabel(service.category)}
            </div>
            <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-tight text-[#10233F] sm:text-5xl">
              {service.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600">
              {service.description || 'Chưa có mô tả từ hệ thống.'}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <InfoChip icon={<ClockIcon className="h-4 w-4" />} label={`${service.packageDays ?? 1} buổi`} />
              <InfoChip icon={<ClockIcon className="h-4 w-4" />} label={`${service.estimatedDurationMinutes} phút/buổi`} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Thông tin từ hệ thống</div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <DataTile label="Mã dịch vụ" value={`#${service.id}`} />
              <DataTile label="Nhóm" value={getCategoryLabel(service.category)} />
              <DataTile label="Số buổi" value={`${service.packageDays ?? 1}`} />
              <DataTile label="Thời lượng" value={`${service.estimatedDurationMinutes} phút/buổi`} />
            </div>
            <div className="mt-5 rounded-3xl bg-brand-soft p-5">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-brand/70">Chi phí từ</div>
              <div className="mt-1 text-4xl font-black text-brand">{formatCurrency(service.basePrice)}</div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="space-y-6">
          <Section title="Dịch vụ bao gồm">
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
              <EmptyRealData message="Hệ thống chưa cấu hình danh sách hạng mục cho dịch vụ này." />
            )}
          </Section>

          <Section title="Lịch trình chi tiết">
            {schedule.length > 0 ? (
              <div className="space-y-3">
                {schedule.map((item, index) => (
                  <details key={`${item.day}-${item.title}`} open={index === 0} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-white px-4 py-4 text-left transition group-open:bg-brand-soft">
                      <div>
                        <div className="text-xs font-black uppercase tracking-[0.14em] text-brand">Ngày {item.day}</div>
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
              <EmptyRealData message="Hệ thống chưa cấu hình lịch trình chi tiết cho dịch vụ này." />
            )}
          </Section>

          <Section title="Điều dưỡng phù hợp">
            {previewNurses.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  {previewNurses.map((nurse) => (
                    <article key={nurse.userId} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex items-start gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-soft text-lg font-black text-brand">
                          {nurse.avatar ? <img src={nurse.avatar} alt={nurse.fullName} className="h-full w-full object-cover" /> : nurse.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-black text-[#10233F]">{nurse.fullName}</div>
                          <div className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{nurse.specialization || 'Chưa cập nhật chuyên môn'}</div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black text-slate-600">
                        <span className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-50 px-2 py-2">
                          <StarIcon className="h-4 w-4 text-amber-500" />
                          {nurse.averageRating.toFixed(1)}
                        </span>
                        <span className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-50 px-2 py-2">
                          <MapPinIcon className="h-4 w-4 text-brand" />
                          {nurse.distanceKm != null ? `${nurse.distanceKm.toFixed(1)} km` : `Bán kính ${nurse.serviceRadiusKm} km`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/nurses/${nurse.userId}?serviceId=${service.id}`)}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand/20 px-3 py-2.5 text-sm font-black text-brand transition hover:bg-brand hover:text-white"
                      >
                        Xem hồ sơ
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
                  Xem tất cả điều dưỡng ({nurses.length})
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm font-black text-[#10233F]">Chưa có điều dưỡng hiển thị nhanh cho gói này.</div>
                <button
                  type="button"
                  onClick={() => navigate(`/find-nurse?serviceId=${service.id}`)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-black text-white"
                >
                  Mở trang tìm điều dưỡng
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </Section>

          {relatedServices.length > 0 && (
            <Section title="Dịch vụ liên quan">
              <div className="grid gap-4 md:grid-cols-3">
                {relatedServices.map((item) => (
                  <Link key={item.id} to={`/services/${item.id}`} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="h-24 bg-[linear-gradient(135deg,#fdf2f8,#ffffff_55%,#ecfdf5)] p-4">
                      <div className="text-xs font-black uppercase tracking-[0.16em] text-brand">{getCategoryLabel(item.category)}</div>
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

        <aside className="h-fit rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:sticky lg:top-24">
          <div className="text-sm font-black text-[#10233F]">{service.name}</div>
          <div className="mt-4 text-xs font-bold text-slate-400">Tổng chi phí từ</div>
          <div className="mt-1 text-4xl font-black text-brand">{formatCurrency(service.basePrice)}</div>

          <div className="mt-5 space-y-3 text-sm font-bold text-slate-600">
            <InfoLine label={`${service.packageDays ?? 1} buổi`} />
            <InfoLine label={`${service.estimatedDurationMinutes} phút/buổi`} />
          </div>

          <button
            type="button"
            onClick={() => navigate(`/find-nurse?serviceId=${service.id}`)}
            className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-sm font-black text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-brand-deep"
          >
            Đặt lịch ngay
            <ArrowRightIcon className="h-4 w-4" />
          </button>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-center text-xs font-bold leading-5 text-slate-500">
            Giá và thời lượng được lấy trực tiếp từ dữ liệu dịch vụ hiện tại.
          </div>
        </aside>
      </main>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
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
