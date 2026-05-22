import { useEffect, useMemo, useState } from 'react';
import {
  ChartBarSquareIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  MoonIcon,
  SparklesIcon,
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const activeAnalysis = analysisResult ?? latestCheckIn?.analysis ?? null;
  const activeWarning = activeAnalysis?.warningLevel ?? 'Low';

  const stats = useMemo(() => {
    const highCount = history.filter((item) => item.analysis?.warningLevel === 'High').length;
    const mediumCount = history.filter((item) => item.analysis?.warningLevel === 'Medium').length;
    const avgSleep = history.length ? history.reduce((sum, item) => sum + item.sleepHours, 0) / history.length : 0;
    return { highCount, mediumCount, avgSleep };
  }, [history]);

  const loadData = async (targetPage = page) => {
    try {
      setLoading(true);
      const [latest, historyData] = await Promise.all([
        caremateApi.getLatestHealthCheckIn().catch(() => null),
        caremateApi.getHealthCheckInHistory({ page: targetPage, pageSize: 8 }),
      ]);

      setLatestCheckIn(latest);
      setHistory(historyData);
      setExpandedId((current) => current ?? historyData[0]?.checkInId ?? null);
    } catch {
      showToast('Không thể tải dữ liệu check-in sức khỏe.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(page);
  }, [page]);

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
      setPage(1);
      showToast('Đã phân tích check-in sức khỏe thành công.', 'success');
      await loadData(1);
    } catch {
      showToast('Không thể phân tích check-in lúc này.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-xl border border-teal-100 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="p-6 lg:p-7">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-teal-700">AI Health Check-in</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Theo dõi sức khỏe mẹ và bé</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                Ghi nhận tình trạng hằng ngày, xem cảnh báo, xu hướng 7 lần check-in gần nhất, kế hoạch chăm sóc và lịch sử chi tiết trong một màn hình dễ quan sát.
              </p>
            </div>
            <div className="border-t border-teal-100 bg-teal-50/70 p-6 lg:border-l lg:border-t-0">
              <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getWarningTone(activeWarning)}`}>
                Mức cảnh báo: {toWarningLabel(activeWarning)}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat label="Check-in" value={history.length.toString()} />
                <Stat label="Ngủ TB" value={history.length ? `${stats.avgSleep.toFixed(1)}h` : '--'} />
                <Stat label="Cần chú ý" value={(stats.highCount + stats.mediumCount).toString()} />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Panel title="Kết quả mới nhất" icon={<SparklesIcon className="h-5 w-5" />}>
            {activeAnalysis ? <AnalysisSummary analysis={activeAnalysis} /> : <EmptyState message="Chưa có kết quả phân tích. Hãy gửi check-in đầu tiên hôm nay." />}
          </Panel>

          <Panel title="Check-in hôm nay" icon={<ClipboardDocumentCheckIcon className="h-5 w-5" />}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Số giờ ngủ">
                  <NumberInput value={form.sleepHours} min={0} max={24} step={0.5} icon={<MoonIcon />} onChange={(value) => setForm((prev) => ({ ...prev, sleepHours: value }))} />
                </Field>
                <Field label="Mức độ đau">
                  <NumberInput value={form.painLevel} min={1} max={10} icon={<HeartIcon />} onChange={(value) => setForm((prev) => ({ ...prev, painLevel: value }))} />
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
                  onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                  rows={3}
                  maxLength={1000}
                  placeholder="Ví dụ: Mẹ mệt hơn hôm qua, bé bú ít, vết mổ hơi đau..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                />
                <div className="mt-1 text-right text-xs font-bold text-slate-400">{form.note.length}/1000</div>
              </Field>

              <div className="flex flex-col gap-3 rounded-lg border border-amber-100 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <p className="text-xs font-semibold leading-5 text-amber-800">Thông tin từ AI chỉ mang tính tham khảo, không thay thế tư vấn từ bác sĩ hoặc chuyên gia y tế.</p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="shrink-0 rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Đang phân tích...' : 'Phân tích'}
                </button>
              </div>
            </form>
          </Panel>
        </section>

        <Panel title="Lịch sử check-in chi tiết" icon={<ChartBarSquareIcon className="h-5 w-5" />}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-teal-600 border-t-transparent" />
            </div>
          ) : history.length === 0 ? (
            <EmptyState message="Chưa có lịch sử check-in." />
          ) : (
            <>
              <div className="space-y-3">
                {history.map((item) => (
                  <HistoryItem
                    key={item.checkInId}
                    item={item}
                    expanded={expandedId === item.checkInId}
                    onToggle={() => setExpandedId((current) => (current === item.checkInId ? null : item.checkInId))}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:border-teal-300 hover:text-teal-700 disabled:opacity-40"
                >
                  Trang trước
                </button>
                <div className="text-sm font-bold text-slate-400">Trang {page}</div>
                <button
                  type="button"
                  disabled={history.length < 8}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:border-teal-300 hover:text-teal-700 disabled:opacity-40"
                >
                  Trang sau
                </button>
              </div>
            </>
          )}
        </Panel>
      </div>
    </main>
  );
};

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">{icon}</div>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3 text-center shadow-sm">
      <div className="text-lg font-black text-slate-950">{value}</div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  min,
  max,
  step,
  icon,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  icon: React.ReactElement;
  onChange: (value: number) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300">{icon}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
      />
    </div>
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
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-3 pr-10 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
    </div>
  );
}

function AnalysisSummary({ analysis }: { analysis: HealthAnalysisResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${getWarningTone(analysis.warningLevel)}`}>
          {toWarningLabel(analysis.warningLevel)}
        </span>
        <span className="text-xs font-bold text-slate-400">Mã phân tích: {analysis.analysisId.slice(0, 8)}</span>
      </div>

      <RiskScorePanel analysis={analysis} />

      <p className="text-sm font-semibold leading-6 text-slate-700">{analysis.summary}</p>

      {analysis.trendSummary && <InfoBlock title="Xu hướng 7 lần gần nhất" content={analysis.trendSummary} tone="teal" />}
      {analysis.trendSignals?.length > 0 && <TrendSignalGrid signals={analysis.trendSignals} />}
      {analysis.riskFactors?.length > 0 && <RiskFactorList factors={analysis.riskFactors} />}

      <ListBlock title="Khuyến nghị cá nhân hóa" items={analysis.recommendations} />

      {analysis.carePlan?.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Kế hoạch chăm sóc</h3>
          <div className="space-y-2">
            {analysis.carePlan.map((item) => (
              <CarePlanRow key={`${item.timeframe}-${item.action}`} item={item} />
            ))}
          </div>
        </div>
      )}

      <ServiceSuggestions services={analysis.suggestedServices} />
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">{analysis.disclaimer}</p>
    </div>
  );
}

function RiskScorePanel({ analysis }: { analysis: HealthAnalysisResponse }) {
  const score = Math.max(0, Math.min(100, analysis.riskScore ?? 0));
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Điểm rủi ro</div>
          <div className="mt-1 text-3xl font-black text-slate-950">{score}/100</div>
        </div>
        <div className="rounded-lg bg-white px-3 py-2 text-right shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Độ đầy đủ dữ liệu</div>
          <div className="text-lg font-black text-teal-700">{analysis.confidenceScore ?? 0}%</div>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white">
        <div className={`h-full rounded-full ${getRiskBarTone(score)}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function TrendSignalGrid({ signals }: { signals: HealthAnalysisResponse['trendSignals'] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Tín hiệu xu hướng</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {signals.map((signal) => (
          <div key={signal.metric} className="rounded-lg bg-slate-50 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-slate-950">{signal.metric}</span>
              <span className={`text-lg font-black ${getTrendTone(signal.direction)}`}>{toTrendIcon(signal.direction)}</span>
            </div>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{signal.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskFactorList({ factors }: { factors: HealthAnalysisResponse['riskFactors'] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Yếu tố làm tăng rủi ro</h3>
      <div className="flex flex-wrap gap-2">
        {factors.map((factor) => (
          <span key={factor.code} className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700">
            +{factor.points} {factor.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function HistoryItem({ item, expanded, onToggle }: { item: HealthCheckInHistoryDto; expanded: boolean; onToggle: () => void }) {
  const displayWarning = getDisplayWarningLevel(item);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button type="button" onClick={onToggle} className="flex w-full flex-col gap-3 p-4 text-left transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <ClockIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-slate-950">{formatDateTime(item.createdAt)}</h3>
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${getWarningTone(displayWarning)}`}>
                {toWarningLabel(displayWarning) ?? 'Chưa phân tích'}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
              <Metric label="Ngủ" value={`${item.sleepHours} giờ`} />
              <Metric label="Đau" value={`${item.painLevel}/10`} />
              <Metric label="Mẹ" value={toOptionLabel(item.mood, moodOptions)} />
              <Metric label="Sữa" value={toOptionLabel(item.milkStatus, milkStatusOptions)} />
              <Metric label="Bé bú" value={toOptionLabel(item.babyFeeding, babyFeedingOptions)} />
            </div>
          </div>
        </div>
        <ChevronDownIcon className={`h-5 w-5 shrink-0 text-slate-400 transition ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4">
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-lg bg-white p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Dữ liệu check-in</h4>
              <div className="grid gap-2 text-sm">
                <DetailRow label="Số giờ ngủ" value={`${item.sleepHours} giờ`} />
                <DetailRow label="Mức độ đau" value={`${item.painLevel}/10`} />
                <DetailRow label="Tâm trạng" value={toOptionLabel(item.mood, moodOptions)} />
                <DetailRow label="Tình trạng sữa" value={toOptionLabel(item.milkStatus, milkStatusOptions)} />
                <DetailRow label="Tình trạng bú của bé" value={toOptionLabel(item.babyFeeding, babyFeedingOptions)} />
                <DetailRow label="Giấc ngủ của bé" value={toOptionLabel(item.babySleep, babySleepOptions)} />
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Ghi chú</div>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-700">{item.note || 'Không có ghi chú.'}</p>
              </div>
            </div>

            <div className="rounded-lg bg-white p-4">
              {item.analysis ? <AnalysisSummary analysis={item.analysis} /> : <EmptyState message="Lần check-in này chưa có phân tích AI." />}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-right font-black text-slate-950">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1">
      {label}: <strong className="text-slate-800">{value}</strong>
    </span>
  );
}

function InfoBlock({ title, content, tone = 'slate' }: { title: string; content: string; tone?: 'slate' | 'teal' }) {
  const toneClass = tone === 'teal' ? 'bg-teal-50 text-teal-800' : 'bg-slate-50 text-slate-700';
  return (
    <div className={`rounded-lg px-3 py-3 ${toneClass}`}>
      <h3 className="text-xs font-black uppercase tracking-[0.16em]">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6">{content}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">{title}</h3>
      <ul className="grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium leading-6 text-slate-700">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CarePlanRow({ item }: { item: { timeframe: string; action: string; reason: string } }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-3">
      <div className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">{item.timeframe}</div>
      <div className="mt-1 text-sm font-black leading-6 text-slate-950">{item.action}</div>
      {item.reason && <div className="mt-1 text-sm font-medium leading-6 text-slate-600">{item.reason}</div>}
    </div>
  );
}

function ServiceSuggestions({ services }: { services: HealthAnalysisResponse['suggestedServices'] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Dịch vụ gợi ý</h3>
      {services.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500">Hiện chưa có gợi ý dịch vụ cụ thể.</p>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {services.map((service) => (
            <div key={service.serviceKey} className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-3">
              <div className="text-sm font-black text-teal-900">{service.serviceName}</div>
              <div className="mt-1 text-sm font-medium leading-6 text-teal-800">{service.reason}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <ClockIcon className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-3 text-sm font-bold text-slate-500">{message}</p>
    </div>
  );
}

function getWarningTone(level?: string) {
  switch (level) {
    case 'High':
      return 'border-red-100 bg-red-50 text-red-700';
    case 'Medium':
      return 'border-amber-100 bg-amber-50 text-amber-700';
    case 'Low':
      return 'border-emerald-100 bg-emerald-50 text-emerald-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
}

function getRiskBarTone(score: number) {
  if (score >= 60) {
    return 'bg-red-500';
  }

  if (score >= 30) {
    return 'bg-amber-500';
  }

  return 'bg-emerald-500';
}

function getTrendTone(direction?: string) {
  switch (direction) {
    case 'up':
      return 'text-amber-600';
    case 'down':
      return 'text-red-600';
    default:
      return 'text-emerald-600';
  }
}

function toTrendIcon(direction?: string) {
  switch (direction) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    default:
      return '→';
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

function getDisplayWarningLevel(item: HealthCheckInHistoryDto) {
  if (item.analysis && item.analysis.riskScore > 0) {
    return item.analysis.warningLevel;
  }

  if (item.painLevel >= 9 || item.babyFeeding === 'RefusesFeeding') {
    return 'High';
  }

  if (item.painLevel >= 7 || item.sleepHours < 5 || item.babyFeeding === 'LessThanUsual' || item.mood === 'Stressed' || item.mood === 'Anxious' || item.mood === 'Overwhelmed') {
    return 'Medium';
  }

  return item.analysis?.warningLevel ?? 'Low';
}

function toOptionLabel(value: string, options: Array<{ value: string; label: string }>) {
  return options.find((item) => item.value === value)?.label ?? value;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default HealthCheckInsPage;
