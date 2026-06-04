import { useEffect, useMemo, useState } from 'react';
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

const trustItems = [
  'Điều dưỡng chuyên nghiệp',
  'Tư vấn tận tâm',
  'An toàn và uy tín',
  'Linh hoạt thời gian',
];

const ServicesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceDetailDto[]>([]);
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
        showToast('Không thể tải danh sách dịch vụ.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [showToast]);

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
      <section className="relative overflow-hidden border-b border-pink-100 bg-[linear-gradient(115deg,#fff7fb_0%,#ffffff_48%,#eefdf8_100%)]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-8 lg:py-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-brand shadow-sm">
              <SparklesIcon className="h-4 w-4" />
              CareMate services
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight tracking-tight text-[#10233F] sm:text-5xl lg:text-6xl">
              Chọn dịch vụ <span className="text-brand">chăm sóc phù hợp</span> cho gia đình bạn
            </h1>
            <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-slate-600">
              Mỗi dịch vụ được tách thành một trang chi tiết riêng để gia đình xem rõ gói gồm gì, lịch trình ra sao và chi phí trước khi tìm điều dưỡng.
            </p>

            <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:flex-row">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Bạn cần dịch vụ gì?"
                  className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-12 pr-4 text-sm font-bold text-[#10233F] outline-none transition focus:border-brand/30 focus:bg-white focus:ring-4 focus:ring-brand/10"
                />
              </div>
              <a href="#service-list" className="inline-flex h-12 items-center justify-center rounded-2xl bg-brand px-7 text-sm font-black text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-brand-deep">
                Tìm kiếm
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="hidden lg:block">
            <div className="rounded-[2rem] border border-pink-100 bg-white p-8 shadow-[0_30px_80px_rgba(236,72,153,0.12)]">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Dữ liệu hiện có</div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-brand-soft p-5">
                  <div className="text-4xl font-black text-brand">{services.length}</div>
                  <div className="mt-2 text-sm font-black text-[#10233F]">dịch vụ đang hoạt động</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="text-4xl font-black text-[#10233F]">{Math.max(0, categories.length - 1)}</div>
                  <div className="mt-2 text-sm font-black text-[#10233F]">nhóm dịch vụ</div>
                </div>
              </div>
              <div className="mt-5 rounded-3xl bg-[#10233F] p-5 text-white">
                <div className="text-sm font-black">Quy trình</div>
                <div className="mt-2 text-sm font-semibold text-white/75">Chọn dịch vụ, xem chi tiết thật từ hệ thống, rồi chọn điều dưỡng.</div>
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
              <h2 className="text-2xl font-black tracking-tight text-[#10233F]">Tất cả dịch vụ</h2>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">{filteredServices.length} dịch vụ phù hợp với nhu cầu của bạn.</p>
          </div>

          <div className="flex flex-wrap gap-2">
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
                  {category === 'all' ? 'Tất cả' : getCategoryLabel(category)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service, index) => {
            const included = getIncludedServiceLabels(service).slice(0, 2);

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group overflow-hidden rounded-[1.35rem] border border-slate-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(236,72,153,0.16)]"
              >
                <Link to={`/services/${service.id}`} className="block">
                  <div className="relative h-40 overflow-hidden bg-[linear-gradient(135deg,#fdf2f8,#ffffff_55%,#ecfdf5)]">
                    <div className="absolute inset-0 p-5">
                      <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-white/80 bg-white/70 p-4">
                        <div className="text-xs font-black uppercase tracking-[0.16em] text-brand">{getCategoryLabel(service.category)}</div>
                        <div className="text-2xl font-black leading-tight text-[#10233F]">{service.packageDays ?? 1} buổi</div>
                      </div>
                    </div>
                    <div className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1.5 text-xs font-black text-white shadow-lg shadow-pink-200">
                      {service.serviceKind === 'package' ? 'Gói chăm sóc' : getCategoryLabel(service.category)}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-black leading-tight text-[#10233F]">{service.name}</h3>
                    <p className="mt-3 line-clamp-2 min-h-[3.5rem] text-sm font-semibold leading-7 text-slate-600">
                      {service.description || 'Chưa có mô tả từ hệ thống.'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-slate-600">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5">
                        <ClockIcon className="h-4 w-4" />
                        {service.packageDays ?? 1} buổi
                      </span>
                      <span className="rounded-full bg-slate-50 px-3 py-1.5">{service.estimatedDurationMinutes} phút/buổi</span>
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
                        <div className="text-xs font-bold text-slate-400">Từ</div>
                        <div className="text-xl font-black text-brand">{formatCurrency(service.basePrice)}</div>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-xl border border-brand/20 px-4 py-2 text-sm font-black text-brand transition group-hover:bg-brand group-hover:text-white">
                        Xem chi tiết
                        <ArrowRightIcon className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-12 grid gap-3 rounded-[1.5rem] bg-brand-soft p-5 sm:grid-cols-2 lg:grid-cols-4">
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
