import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarSquareIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  MoonIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import caremateApi from '../api/caremateApi';
import type { HealthAnalysisResponse, HealthCheckInHistoryDto, LatestHealthCheckInDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';

type FormState = {
  sleepHours: number;
  painLevel: number;
  mood: string;
  milkStatus: string;
  babyFeeding: string;
  babySleep: string;
  note: string;
};

const moodOptions = [
  { value: 'Calm', label: 'Bình tĩnh' },
  { value: 'Happy', label: 'Thoải mái' },
  { value: 'Tired', label: 'Mệt' },
  { value: 'Stressed', label: 'Căng thẳng' },
  { value: 'Anxious', label: 'Lo âu' },
  { value: 'Overwhelmed', label: 'Quá tải' },
];

const milkStatusOptions = [
  { value: 'Normal', label: 'Bình thường' },
  { value: 'Low', label: 'Ít sữa' },
  { value: 'Painful', label: 'Đau khi cho bú' },
  { value: 'Improving', label: 'Đang cải thiện' },
];

const babyFeedingOptions = [
  { value: 'Normal', label: 'Bú bình thường' },
  { value: 'LessThanUsual', label: 'Bú ít hơn thường ngày' },
  { value: 'RefusesFeeding', label: 'Bé từ chối bú' },
  { value: 'FrequentFeeding', label: 'Bé bú nhiều lần' },
];

const babySleepOptions = [
  { value: 'Normal', label: 'Ngủ bình thường' },
  { value: 'CryingOften', label: 'Hay quấy khóc' },
  { value: 'WakingFrequently', label: 'Thức giấc nhiều' },
  { value: 'SleepingLonger', label: 'Ngủ lâu hơn thường ngày' },
];

const initialForm: FormState = {
  sleepHours: 6,
  painLevel: 4,
  mood: 'Tired',
  milkStatus: 'Normal',
  babyFeeding: 'Normal',
  babySleep: 'Normal',
  note: '',
};

const HealthCheckInsPage = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<HealthAnalysisResponse | null>(null);
  const [latestCheckIn, setLatestCheckIn] = useState<LatestHealthCheckInDto | null>(null);
  const [history, setHistory] = useState<HealthCheckInHistoryDto[]>([]);
  const [page, setPage] = useState(1);

  const loadData = async (targetPage = page) => {
    try {
      setLoading(true);
      const [latest, historyData] = await Promise.all([
        caremateApi.getLatestHealthCheckIn().catch(() => null),
        caremateApi.getHealthCheckInHistory({ page: targetPage, pageSize: 10 }),
      ]);

      setLatestCheckIn(latest);
      setHistory(historyData);
    } catch {
      showToast('Không thể tải dữ liệu check-in sức khỏe.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(page);
  }, [page]);

  const warningTone = useMemo(() => {
    const warning = analysisResult?.warningLevel ?? latestCheckIn?.analysis?.warningLevel ?? 'Low';
    switch (warning) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  }, [analysisResult, latestCheckIn]);

  const validateForm = () => {
    if (form.sleepHours < 0 || form.sleepHours > 24) {
      showToast('Số giờ ngủ phải nằm trong khoảng từ 0 đến 24.', 'error');
      return false;
    }

    if (form.painLevel < 1 || form.painLevel > 10) {
      showToast('Mức độ đau phải nằm trong khoảng từ 1 đến 10.', 'error');
      return false;
    }

    if (form.note.length > 1000) {
      showToast('Ghi chú không được vượt quá 1000 ký tự.', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const result = await caremateApi.analyzeHealthCheckIn({
        sleepHours: form.sleepHours,
        painLevel: form.painLevel,
        mood: form.mood,
        milkStatus: form.milkStatus,
        babyFeeding: form.babyFeeding,
        babySleep: form.babySleep,
        note: form.note.trim() || undefined,
      });

      setAnalysisResult(result);
      showToast('Đã phân tích check-in sức khỏe thành công.', 'success');
      setPage(1);
      await loadData(1);
    } catch {
      showToast('Không thể phân tích check-in lúc này.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.12),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef6f5_100%)] py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 rounded-xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.35em] text-teal-700">AI Health Check-in</p>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Theo dõi tình trạng mẹ và bé mỗi ngày</h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                Nhập check-in hằng ngày, lưu lịch sử 7 ngày gần nhất và nhận phân tích, cảnh báo, gợi ý chăm sóc phù hợp từ CareMate.
              </p>
            </div>
            <div className={`w-fit rounded-xl border px-5 py-4 text-sm font-bold ${warningTone}`}>
              Mức cảnh báo hiện tại: {toWarningLabel(analysisResult?.warningLevel ?? latestCheckIn?.analysis?.warningLevel) ?? 'Chưa có'}
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white p-8 shadow-xl shadow-slate-200/60">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <ClipboardDocumentCheckIcon className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Check-in hôm nay</h2>
                <p className="text-sm font-medium text-slate-500">Thông tin này sẽ được gửi lên hệ thống để lưu và phân tích tự động.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Số giờ ngủ">
                  <div className="relative">
                    <MoonIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                    <input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      value={form.sleepHours}
                      onChange={(e) => setForm((prev) => ({ ...prev, sleepHours: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-50"
                    />
                  </div>
                </Field>

                <Field label="Mức độ đau (1-10)">
                  <div className="relative">
                    <HeartIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={form.painLevel}
                      onChange={(e) => setForm((prev) => ({ ...prev, painLevel: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-50"
                    />
                  </div>
                </Field>

                <Field label="Tâm trạng">
                  <Select value={form.mood} onChange={(value) => setForm((prev) => ({ ...prev, mood: value }))} options={moodOptions} />
                </Field>

                <Field label="Tình trạng sữa">
                  <Select value={form.milkStatus} onChange={(value) => setForm((prev) => ({ ...prev, milkStatus: value }))} options={milkStatusOptions} />
                </Field>

                <Field label="Tình trạng bú của bé">
                  <Select value={form.babyFeeding} onChange={(value) => setForm((prev) => ({ ...prev, babyFeeding: value }))} options={babyFeedingOptions} />
                </Field>

                <Field label="Giấc ngủ của bé">
                  <Select value={form.babySleep} onChange={(value) => setForm((prev) => ({ ...prev, babySleep: value }))} options={babySleepOptions} />
                </Field>
              </div>

              <Field label="Ghi chú thêm">
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                  rows={5}
                  maxLength={1000}
                  placeholder="Ví dụ: Mẹ mệt, bé bú ít, vết mổ hơi đau..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-50"
                />
                <div className="mt-2 text-right text-xs font-bold text-slate-400">{form.note.length}/1000</div>
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <p className="max-w-2xl text-xs font-semibold leading-6 text-amber-800">
                    Thông tin từ AI chỉ mang tính tham khảo, không thay thế tư vấn từ bác sĩ hoặc chuyên gia y tế.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-slate-900 px-6 py-4 text-sm font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Đang phân tích...' : 'Phân tích check-in'}
                </button>
              </div>
            </form>
          </motion.section>

          <div className="space-y-8">
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-slate-900 p-8 text-white shadow-xl shadow-slate-300/50">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <SparklesIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Kết quả mới nhất</h2>
                  <p className="text-sm font-medium text-slate-300">Bản tóm tắt và gợi ý từ lần phân tích gần nhất.</p>
                </div>
              </div>

              {analysisResult || latestCheckIn?.analysis ? (
                <AnalysisCard analysis={(analysisResult ?? latestCheckIn?.analysis)!} dark />
              ) : (
                <EmptyState message="Chưa có kết quả phân tích nào. Hãy gửi check-in đầu tiên hôm nay." />
              )}
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white p-8 shadow-xl shadow-slate-200/60">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <ChartBarSquareIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Lịch sử check-in</h2>
                  <p className="text-sm font-medium text-slate-500">Dữ liệu riêng của bạn, sắp xếp từ mới nhất đến cũ hơn.</p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-teal-600 border-t-transparent" />
                </div>
              ) : history.length === 0 ? (
                <EmptyState message="Chưa có lịch sử check-in." />
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <article key={item.checkInId} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-black text-slate-900">{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
                          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Ngủ {item.sleepHours} giờ • Đau {item.painLevel}/10
                          </div>
                        </div>
                        <div className={`rounded-xl border px-3 py-2 text-xs font-black ${getWarningTone(item.analysis?.warningLevel)}`}>
                          {toWarningLabel(item.analysis?.warningLevel) ?? 'Chưa phân tích'}
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm font-medium text-slate-600 md:grid-cols-2">
                        <span>Tâm trạng: <strong className="text-slate-900">{toOptionLabel(item.mood, moodOptions)}</strong></span>
                        <span>Tình trạng sữa: <strong className="text-slate-900">{toOptionLabel(item.milkStatus, milkStatusOptions)}</strong></span>
                        <span>Tình trạng bú của bé: <strong className="text-slate-900">{toOptionLabel(item.babyFeeding, babyFeedingOptions)}</strong></span>
                        <span>Giấc ngủ của bé: <strong className="text-slate-900">{toOptionLabel(item.babySleep, babySleepOptions)}</strong></span>
                      </div>

                      {item.note && <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-600">{item.note}</p>}

                      {item.analysis && (
                        <div className="mt-4 rounded-xl bg-white p-4">
                          <p className="text-sm font-semibold leading-6 text-slate-700">{item.analysis.summary}</p>
                          {item.analysis.suggestedServices.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {item.analysis.suggestedServices.map((service) => (
                                <span key={`${item.analysis?.analysisId}-${service.serviceKey}`} className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700">
                                  {service.serviceName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  ))}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:border-teal-300 hover:text-teal-700 disabled:opacity-40"
                    >
                      Trang trước
                    </button>
                    <div className="text-sm font-bold text-slate-400">Trang {page}</div>
                    <button
                      type="button"
                      disabled={history.length < 10}
                      onClick={() => setPage((prev) => prev + 1)}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:border-teal-300 hover:text-teal-700 disabled:opacity-40"
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-3 block text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 pr-12 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronRightIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-slate-300" />
    </div>
  );
}

function AnalysisCard({ analysis, dark = false }: { analysis: HealthAnalysisResponse; dark?: boolean }) {
  return (
    <div className={`rounded-[24px] border p-6 ${dark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-white'}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] ${dark ? 'bg-white/10 text-white' : getWarningTone(analysis.warningLevel)}`}>
          {toWarningLabel(analysis.warningLevel)}
        </span>
        <span className={`text-xs font-bold ${dark ? 'text-slate-300' : 'text-slate-400'}`}>Mã phân tích: {analysis.analysisId.slice(0, 8)}</span>
      </div>

      <p className={`text-sm font-semibold leading-7 ${dark ? 'text-white' : 'text-slate-700'}`}>{analysis.summary}</p>

      <div className="mt-6">
        <h3 className={`text-[11px] font-black uppercase tracking-[0.28em] ${dark ? 'text-slate-300' : 'text-slate-400'}`}>Khuyến nghị</h3>
        <ul className="mt-3 space-y-3">
          {analysis.recommendations.map((item) => (
            <li key={item} className={`rounded-xl px-4 py-3 text-sm font-medium leading-6 ${dark ? 'bg-white/5 text-slate-100' : 'bg-slate-50 text-slate-700'}`}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h3 className={`text-[11px] font-black uppercase tracking-[0.28em] ${dark ? 'text-slate-300' : 'text-slate-400'}`}>Dịch vụ gợi ý</h3>
        {analysis.suggestedServices.length === 0 ? (
          <p className={`mt-3 text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-500'}`}>Hiện chưa có gợi ý dịch vụ cụ thể.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {analysis.suggestedServices.map((service) => (
              <div key={service.serviceKey} className={`rounded-xl px-4 py-4 ${dark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{service.serviceName}</div>
                <div className={`mt-1 text-sm font-medium leading-6 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{service.reason}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className={`mt-6 text-xs font-semibold leading-6 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{analysis.disclaimer}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
      <ClockIcon className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-4 text-sm font-bold text-slate-500">{message}</p>
    </div>
  );
}

function getWarningTone(level?: string) {
  switch (level) {
    case 'High':
      return 'border-red-100 bg-red-50 text-red-700';
    case 'Medium':
      return 'border-amber-100 bg-amber-50 text-amber-700';
    default:
      return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  }
}

function toWarningLabel(level?: string) {
  switch (level) {
    case 'High':
      return 'Cao';
    case 'Medium':
      return 'Trung bình';
    case 'Low':
      return 'Thấp';
    default:
      return level;
  }
}

function toOptionLabel(value: string, options: Array<{ value: string; label: string }>) {
  return options.find((item) => item.value === value)?.label ?? value;
}

export default HealthCheckInsPage;
