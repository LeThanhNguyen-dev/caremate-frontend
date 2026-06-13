import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

type NurseTourStep = {
  selector: string;
  path: RegExp;
  title: string;
  body: string;
  navigateTo?: string;
};

const tourStorageKey = 'caremate_nurse_action_tour_completed';

const steps: NurseTourStep[] = [
  {
    selector: '[data-tour="nurse-nav-overview"]',
    path: /^\/nurse\/overview$/,
    title: 'Bắt đầu ở Tổng quan',
    body: 'Đây là nơi chị xem nhanh ca sắp tới, slot còn trống và tiền thực nhận. Mỗi ngày đăng nhập, chị nên kiểm tra màn hình này trước.',
    navigateTo: '/nurse/overview',
  },
  {
    selector: '[data-tour="nurse-overview-actions"]',
    path: /^\/nurse\/overview$/,
    title: 'Hai thao tác hay dùng nhất',
    body: 'Chị có thể bấm Cập nhật lịch rảnh để mở thời gian nhận khách, hoặc Danh sách lịch hẹn để xử lý booking khách vừa đặt.',
  },
  {
    selector: '[data-tour="nurse-nav-profile"]',
    path: /^\/nurse\/profile$/,
    title: 'Hồ sơ cá nhân',
    body: 'Mục này dùng để cập nhật thông tin chuyên môn, địa chỉ phục vụ, tài khoản ngân hàng và giấy tờ xác minh.',
    navigateTo: '/nurse/profile',
  },
  {
    selector: '[data-tour="nurse-profile-form"]',
    path: /^\/nurse\/profile$/,
    title: 'Cập nhật thông tin y tá',
    body: 'Chị nhập giới thiệu, chuyên môn, số năm kinh nghiệm, khu vực phục vụ và thông tin ngân hàng. Những thông tin này giúp khách hàng tin tưởng hơn khi đặt lịch.',
  },
  {
    selector: '[data-tour="nurse-profile-documents"]',
    path: /^\/nurse\/profile$/,
    title: 'Tải giấy tờ xác minh',
    body: 'Chị chọn loại giấy tờ, tải file lên rồi gửi duyệt hồ sơ. Khi quản trị viên duyệt xong, chị mới dùng đầy đủ các chức năng nhận lịch.',
  },
  {
    selector: '[data-tour="nurse-nav-services"]',
    path: /^\/nurse\/services$/,
    title: 'Dịch vụ của tôi',
    body: 'Ở đây chị khai báo những dịch vụ mình có thể nhận, đặt giá và bật/tắt dịch vụ hiển thị cho khách hàng.',
    navigateTo: '/nurse/services',
  },
  {
    selector: '[data-tour="nurse-services-form"]',
    path: /^\/nurse\/services$/,
    title: 'Thêm dịch vụ mới',
    body: 'Chị chọn dịch vụ từ danh mục, nhập giá, chọn cách tính tiền theo lượt hoặc theo giờ, rồi xác nhận đăng ký dịch vụ.',
  },
  {
    selector: '[data-tour="nurse-services-list"]',
    path: /^\/nurse\/services$/,
    title: 'Quản lý dịch vụ đã mở',
    body: 'Danh sách này cho phép chị chỉnh giá, tạm ẩn, mở lại hoặc gỡ dịch vụ khỏi hồ sơ của mình.',
  },
  {
    selector: '[data-tour="nurse-nav-schedule"]',
    path: /^\/nurse\/schedule$/,
    title: 'Lịch làm việc',
    body: 'Mục này dùng để tạo các khung giờ rảnh. Khách hàng chỉ đặt được vào những khoảng thời gian chị đã mở.',
    navigateTo: '/nurse/schedule',
  },
  {
    selector: '[data-tour="nurse-schedule-create"]',
    path: /^\/nurse\/schedule$/,
    title: 'Tạo slot rảnh',
    body: 'Chị bấm nút này, chọn ngày, giờ bắt đầu và giờ kết thúc rồi lưu lại. Slot rảnh sẽ xuất hiện trên lịch tuần.',
  },
  {
    selector: '[data-tour="nurse-schedule-calendar"]',
    path: /^\/nurse\/schedule$/,
    title: 'Theo dõi lịch tuần',
    body: 'Khu vực này hiển thị slot rảnh, lịch khách đã đặt và các buổi trong gói dịch vụ. Chị có thể bấm vào ô giờ để tạo slot nhanh.',
  },
  {
    selector: '[data-tour="nurse-nav-bookings"]',
    path: /^\/nurse\/bookings$/,
    title: 'Quản lý lịch hẹn',
    body: 'Đây là nơi chị xem booking của khách, kiểm tra địa chỉ, ghi chú và cập nhật trạng thái từng ca.',
    navigateTo: '/nurse/bookings',
  },
  {
    selector: '[data-tour="nurse-bookings-list"]',
    path: /^\/nurse\/bookings$/,
    title: 'Xử lý booking',
    body: 'Với booking chờ xác nhận, chị bấm Chấp nhận nếu có thể phục vụ hoặc Từ chối nếu không nhận được. Với ca đã nhận, chị mở chi tiết để chat và check-in/check-out.',
  },
  {
    selector: '[data-tour="nurse-nav-chat"]',
    path: /^\/nurse\/chat$/,
    title: 'Tin nhắn với khách hàng',
    body: 'Chị dùng mục Tin nhắn để xác nhận địa chỉ, hỏi thêm nhu cầu chăm sóc và trao đổi các lưu ý trước hoặc sau buổi làm.',
    navigateTo: '/nurse/chat',
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

const isCenteredEnough = (rect: DOMRect) =>
  rect.top >= 96 && rect.bottom <= window.innerHeight - 96;

const getTooltipPosition = (rect: DOMRect | null) => {
  if (!rect) {
    return {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const tooltipWidth = Math.min(380, window.innerWidth - 32);
  const left = Math.min(Math.max(16, rect.left), window.innerWidth - tooltipWidth - 16);
  const belowTop = rect.bottom + 16;
  const top = belowTop + 240 < window.innerHeight ? belowTop : Math.max(16, rect.top - 256);

  return {
    left: `${left}px`,
    top: `${top}px`,
    transform: 'none',
  };
};

const findStepForPath = (pathname: string) =>
  steps.findIndex((item) => item.path.test(pathname));

const NurseActionTour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const progressLabel = useMemo(() => `${stepIndex + 1}/${steps.length}`, [stepIndex]);

  useEffect(() => {
    if (!open || step.path.test(location.pathname)) return;

    const currentRouteStep = findStepForPath(location.pathname);
    if (currentRouteStep !== -1) {
      setStepIndex(currentRouteStep);
    }
  }, [location.pathname, open, step.path]);

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
      if (updateTarget() || attempts > 14) {
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
  }, [location.pathname, open, step.selector]);

  const closeTour = (completed = false) => {
    if (completed) {
      localStorage.setItem(tourStorageKey, 'true');
    }
    setOpen(false);
  };

  const restart = () => {
    localStorage.removeItem(tourStorageKey);
    setStepIndex(0);
    navigate('/nurse/overview');
    setOpen(true);
  };

  const goNext = () => {
    if (isLastStep) {
      closeTour(true);
      return;
    }

    const nextIndex = Math.min(stepIndex + 1, steps.length - 1);
    const nextStep = steps[nextIndex];
    setStepIndex(nextIndex);
    if (nextStep.navigateTo && nextStep.navigateTo !== location.pathname) {
      navigate(nextStep.navigateTo);
    }
  };

  const goBack = () => {
    const previousIndex = Math.max(stepIndex - 1, 0);
    const previousStep = steps[previousIndex];
    setStepIndex(previousIndex);
    if (previousStep.navigateTo && previousStep.navigateTo !== location.pathname) {
      navigate(previousStep.navigateTo);
    }
  };

  const tooltipPosition = getTooltipPosition(targetRect);

  return (
    <>
      <button
        type="button"
        onClick={restart}
        className="group fixed bottom-5 right-5 z-[90] inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#10B981] px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-emerald-700/20 ring-1 ring-white/30 transition hover:bg-emerald-600 sm:bottom-6 sm:right-6"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.14)_38%,rgba(255,255,255,0.58)_50%,rgba(255,255,255,0.14)_62%,transparent_100%)] animate-[booking-tour-shine_2.8s_ease-in-out_infinite]" />
        <QuestionMarkCircleIcon className="relative h-4 w-4" />
        <span className="relative">Hướng dẫn thao tác</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[230] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {targetRect && (
              <motion.div
                layout
                className="absolute rounded-2xl border-2 border-[#10B981] bg-transparent shadow-[0_12px_36px_rgba(16,185,129,0.2)] ring-4 ring-white/80"
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
              className="pointer-events-auto absolute w-[min(380px,calc(100vw-32px))] rounded-2xl border border-white/70 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-900/20"
              initial={{ opacity: 0, y: 6, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              style={tooltipPosition}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#10B981]">Bước {progressLabel}</div>
                  <h2 className="mt-2 text-lg font-black leading-tight">{step.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => closeTour(true)}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Đóng hướng dẫn"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm font-semibold leading-6 text-slate-600">{step.body}</p>

              {!targetRect && (
                <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-700">
                  Nếu trang đang tải dữ liệu, chị chờ một chút rồi bấm tiếp tục.
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
                    className="rounded-xl bg-[#10B981] px-4 py-2 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
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

export default NurseActionTour;
