import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

type TourStep = {
  selector: string;
  path?: RegExp;
  title: string;
  body: string;
  action?: 'navigate-services' | 'click-target';
};

const tourStorageKey = 'caremate_booking_tour_completed';

const steps: TourStep[] = [
  {
    selector: '[data-tour="nav-services"]',
    title: 'Bắt đầu từ Dịch vụ',
    body: 'Bấm vào mục Dịch vụ để xem các gói chăm sóc đang mở trên CareMate.',
    action: 'navigate-services',
  },
  {
    selector: '[data-tour="service-search"]',
    path: /^\/services$/,
    title: 'Tìm dịch vụ phù hợp',
    body: 'Bạn có thể tìm theo tên dịch vụ hoặc lọc theo nhóm để thấy đúng nhu cầu chăm sóc.',
  },
  {
    selector: '[data-tour="service-categories"]',
    path: /^\/services$/,
    title: 'Chọn nhóm dịch vụ',
    body: 'Các nút nhóm giúp bạn lọc nhanh theo nhu cầu, ví dụ chăm sóc sau sinh, chăm bé hoặc gói dài ngày.',
  },
  {
    selector: '[data-tour="service-card"]',
    path: /^\/services$/,
    title: 'Chọn một dịch vụ',
    body: 'Mở thẻ dịch vụ để xem chi tiết giá, thời lượng và các hạng mục được chăm sóc.',
    action: 'click-target',
  },
  {
    selector: '[data-tour="service-detail-info"]',
    path: /^\/services\/[^/]+$/,
    title: 'Xem thông tin dịch vụ',
    body: 'Kiểm tra nhóm dịch vụ, số buổi, thời lượng và chi phí dự kiến trước khi chuyển sang bước chọn y tá.',
  },
  {
    selector: '[data-tour="service-book-now"]',
    path: /^\/services\/[^/]+$/,
    title: 'Đi tới bước chọn y tá',
    body: 'Sau khi đã xem kỹ thông tin, bấm Đặt lịch ngay để xem danh sách y tá phù hợp.',
    action: 'click-target',
  },
  {
    selector: '[data-tour="nurse-filters"]',
    path: /^\/find-nurse$/,
    title: 'Lọc danh sách y tá',
    body: 'Danh sách này đã được lọc theo dịch vụ. Bạn có thể tìm tên, lọc khu vực hoặc sắp xếp theo đánh giá, khoảng cách, kinh nghiệm.',
  },
  {
    selector: '[data-tour="nurse-card"]',
    path: /^\/find-nurse$/,
    title: 'Chọn hồ sơ y tá',
    body: 'Mở hồ sơ y tá để xem kinh nghiệm, đánh giá và các khung giờ còn trống.',
    action: 'click-target',
  },
  {
    selector: '[data-tour="booking-schedule"]',
    path: /^\/nurses\/[^/]+$/,
    title: 'Chọn ngày và khung giờ',
    body: 'Ở đây chỉ hiển thị các khung giờ y tá còn có thể nhận lịch. Chọn một giờ phù hợp với gia đình bạn.',
  },
  {
    selector: '[data-tour="booking-slot"]',
    path: /^\/nurses\/[^/]+$/,
    title: 'Bấm vào giờ muốn đặt',
    body: 'Khi khung giờ đổi màu, lịch đã được chọn. Với gói nhiều buổi, chọn đủ giờ cho từng ngày.',
  },
  {
    selector: '[data-tour="booking-address"]',
    path: /^\/nurses\/[^/]+$/,
    title: 'Nhập địa chỉ phục vụ',
    body: 'Điền địa chỉ để y tá biết nơi đến. Nếu bản đồ bật, bạn có thể chọn vị trí chính xác trên bản đồ.',
  },
  {
    selector: '[data-tour="booking-submit"]',
    path: /^\/nurses\/[^/]+$/,
    title: 'Hoàn tất đặt lịch',
    body: 'Kiểm tra lại thông tin rồi bấm tiếp tục. Nếu chưa đăng nhập, hệ thống sẽ đưa bạn tới trang đăng nhập trước.',
  },
];

const isVisibleElement = (element: Element | null): element is HTMLElement => {
  if (!(element instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
};

const findVisibleTarget = (selector: string) => {
  const matches = Array.from(document.querySelectorAll(selector));
  return matches.find(isVisibleElement) ?? null;
};

const findFirstRouteStepIndex = (pathname: string) =>
  steps.findIndex((item) => item.path?.test(pathname));

const isCenteredEnough = (rect: DOMRect) =>
  rect.top >= 96 && rect.bottom <= window.innerHeight - 96;

const getTooltipPosition = (rect: DOMRect | null) => {
  const tooltipWidth = Math.min(360, window.innerWidth - 32);

  if (!rect) {
    return {
      left: `${(window.innerWidth - tooltipWidth) / 2}px`,
      top: 'max(16px, calc(50vh - 130px))',
    };
  }

  const left = Math.min(Math.max(16, rect.left), window.innerWidth - tooltipWidth - 16);
  const belowTop = rect.bottom + 16;
  const top = belowTop + 220 < window.innerHeight ? belowTop : Math.max(16, rect.top - 236);

  return {
    left: `${left}px`,
    top: `${top}px`,
  };
};

const BookingTour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const progressLabel = useMemo(() => `${stepIndex + 1}/${steps.length}`, [stepIndex]);

  useEffect(() => {
    if (!open) return;
    if (step.path?.test(location.pathname)) return;

    const routeStepIndex = findFirstRouteStepIndex(location.pathname);
    if (routeStepIndex !== -1) {
      setStepIndex(routeStepIndex);
    }
  }, [location.pathname, open, stepIndex]);

  useEffect(() => {
    if (!open) return;

    let attempts = 0;
    let didScrollToTarget = false;
    const updateTarget = () => {
      const target = findVisibleTarget(step.selector);
      if (target) {
        const rect = target.getBoundingClientRect();
        if (!didScrollToTarget && !isCenteredEnough(rect)) {
          didScrollToTarget = true;
          target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }

        window.requestAnimationFrame(() => {
          setTargetRect(target.getBoundingClientRect());
        });
        return true;
      }

      setTargetRect(null);
      return false;
    };

    updateTarget();
    const retryId = window.setInterval(() => {
      attempts += 1;
      if (updateTarget() || attempts > 12) {
        window.clearInterval(retryId);
      }
    }, 140);

    const handleUpdate = () => {
      const target = findVisibleTarget(step.selector);
      setTargetRect(target ? target.getBoundingClientRect() : null);
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      window.clearInterval(retryId);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [open, step.selector, location.pathname]);

  const closeTour = (completed = false) => {
    if (completed) {
      localStorage.setItem(tourStorageKey, 'true');
    }
    setOpen(false);
  };

  const goNext = () => {
    if (step.action === 'navigate-services') {
      navigate('/services');
    }

    if (step.action === 'click-target') {
      const target = findVisibleTarget(step.selector);
      target?.click();
    }

    if (isLastStep) {
      closeTour(true);
      return;
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const restart = () => {
    localStorage.removeItem(tourStorageKey);
    setStepIndex(0);
    setOpen(true);
  };

  const tooltipPosition = getTooltipPosition(targetRect);

  return (
    <>
      <button
        type="button"
        onClick={restart}
        className="group fixed bottom-24 left-4 z-[80] flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#10233F] text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-slate-900/20 ring-1 ring-white/20 transition hover:bg-brand sm:left-6 sm:h-auto sm:w-auto sm:px-5 sm:py-3.5 lg:bottom-6"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.16)_38%,rgba(255,255,255,0.72)_50%,rgba(255,255,255,0.16)_62%,transparent_100%)] animate-[booking-tour-shine_2.8s_ease-in-out_infinite]" />
        <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_18px_rgba(255,255,255,0.16),0_0_22px_rgba(236,72,153,0.18)]" />
        <QuestionMarkCircleIcon className="relative h-6 w-6 sm:hidden" />
        <span className="relative hidden sm:inline">Hướng dẫn đặt lịch</span>
      </button>

      <AnimatePresence>
        {open && (
        <motion.div
          className="fixed inset-0 z-[220] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          {targetRect && (
            <motion.div
              layout
              className="absolute rounded-2xl border-2 border-brand bg-transparent shadow-[0_12px_36px_rgba(236,72,153,0.18)] ring-4 ring-white/80"
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              style={{
                left: targetRect.left - 8,
                top: targetRect.top - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
            />
          )}

          <motion.div
            key={stepIndex}
            className="pointer-events-auto absolute w-[min(360px,calc(100vw-32px))] rounded-2xl border border-white/70 bg-white p-5 text-[#10233F] shadow-2xl shadow-slate-900/20"
            initial={{ opacity: 0, y: 6, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            style={tooltipPosition}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-brand">Bước {progressLabel}</div>
                <h2 className="mt-2 text-lg font-black leading-tight">{step.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => closeTour(true)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#10233F]"
                aria-label="Đóng hướng dẫn"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm font-semibold leading-6 text-slate-600">{step.body}</p>

            {!targetRect && (
              <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-700">
                Nếu trang đang tải dữ liệu, chờ một chút rồi bấm tiếp tục.
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                disabled={stepIndex === 0}
                className="rounded-xl px-4 py-2 text-sm font-black text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
              >
                Quay lại
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => closeTour(true)}
                  className="rounded-xl px-4 py-2 text-sm font-black text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                >
                  Bỏ qua
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-xl bg-brand px-4 py-2 text-sm font-black text-white shadow-lg shadow-pink-200 transition hover:bg-brand-deep"
                >
                  {isLastStep ? 'Hoàn tất' : 'Tiếp tục'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BookingTour;
