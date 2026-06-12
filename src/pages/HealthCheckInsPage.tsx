import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
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
  { value: 'Tired', label: 'Mệt' },
  { value: 'Stressed', label: 'Căng thẳng' },
  { value: 'Anxious', label: 'Lo âu' },
  { value: 'Overwhelmed', label: 'Quá tải' },
];

const milkStatusOptions = [
  { value: 'Normal', label: 'Bình thường' },
  { value: 'Low', label: 'Ít sữa' },
  { value: 'Painful', label: 'Đau/tắc sữa' },
  { value: 'Improving', label: 'Đang cải thiện' },
];

const babyFeedingOptions = [
  { value: 'Normal', label: 'Bú bình thường' },
  { value: 'LessThanUsual', label: 'Bú ít hơn' },
  { value: 'RefusesFeeding', label: 'Từ chối bú' },
  { value: 'FrequentFeeding', label: 'Bú nhiều lần' },
];

const babySleepOptions = [
  { value: 'Normal', label: 'Ngủ bình thường' },
  { value: 'CryingOften', label: 'Hay quấy khóc' },
  { value: 'WakingFrequently', label: 'Thức giấc nhiều' },
  { value: 'SleepingLonger', label: 'Ngủ lâu hơn' },
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
  const [latest, setLatest] = useState<LatestHealthCheckInDto | null>(null);
  const [analysis, setAnalysis] = useState<HealthAnalysisResponse | null>(null);
  const [history, setHistory] = useState<HealthCheckInHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const activeAnalysis = analysis ?? latest?.analysis ?? null;
  const triage = normalizeTriage(activeAnalysis?.warningLevel);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [latestCheckIn, historyData] = await Promise.all([
          caremateApi.getLatestHealthCheckIn().catch(() => null),
          caremateApi.getHealthCheckInHistory({ page: 1, pageSize: 6 }).catch(() => []),
        ]);
        setLatest(latestCheckIn);
        setHistory(historyData);
      } catch {
        showToast('Không thể tải kết quả mới nhất.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [showToast]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const result = await caremateApi.analyzeHealthCheckIn({
        sleepHours: form.sleepHours,
        painLevel: form.painLevel,
        symptoms: [],
        medicalHistory: [],
        contextData: {},
        tookMedicationToday: false,
        mood: form.mood,
        milkStatus: form.milkStatus,
        babyFeeding: form.babyFeeding,
        babySleep: form.babySleep,
        note: form.note.trim() || undefined,
      });
      setAnalysis(result);
      setHistory((prev) => [
        {
          checkInId: result.checkInId,
          createdAt: new Date().toISOString(),
          sleepHours: form.sleepHours,
          painLevel: form.painLevel,
          painLocation: null,
          painType: null,
          painDuration: null,
          painTrend: null,
          symptoms: [],
          medicalHistory: [],
          contextData: {},
          motherAge: null,
          systolicBloodPressure: null,
          diastolicBloodPressure: null,
          temperatureCelsius: null,
          tookMedicationToday: false,
          medicationNote: null,
          mood: form.mood,
          milkStatus: form.milkStatus,
          babyFeeding: form.babyFeeding,
          babySleep: form.babySleep,
          note: form.note.trim() || null,
          analysis: result,
        },
        ...prev,
      ].slice(0, 6));
      showToast('Đã phân tích check-in hôm nay.', 'success');
    } catch {
      showToast('Không thể phân tích lúc này.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7fbf8] px-4 py-6 lg:px-8">
      <div className="mx-auto grid max-w-[1840px] items-start gap-5 md:grid-cols-[minmax(420px,0.92fr)_minmax(560px,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <CardTitle icon={<SparklesIcon className="h-4 w-4" />} title="Kết quả mới nhất" />
          {loading ? (
            <div className="mt-5 h-80 animate-pulse rounded-lg bg-slate-100" />
          ) : activeAnalysis ? (
            <ResultCard analysis={activeAnalysis} triage={triage} />
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
              Chưa có kết quả phân tích.
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <CardTitle icon={<ClipboardDocumentCheckIcon className="h-4 w-4" />} title="Check-in hôm nay" />
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Số giờ ngủ">
                <NumberInput value={form.sleepHours} min={0} max={24} step={0.5} onChange={(sleepHours) => setForm((prev) => ({ ...prev, sleepHours }))} />
              </Field>
              <Field label="Mức độ đau">
                <NumberInput value={form.painLevel} min={0} max={10} onChange={(painLevel) => setForm((prev) => ({ ...prev, painLevel }))} />
              </Field>
              <Field label="Tâm trạng">
                <Select value={form.mood} options={moodOptions} onChange={(mood) => setForm((prev) => ({ ...prev, mood }))} />
              </Field>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Tình trạng sữa">
                <Select value={form.milkStatus} options={milkStatusOptions} onChange={(milkStatus) => setForm((prev) => ({ ...prev, milkStatus }))} />
              </Field>
              <Field label="Tình trạng bú của bé">
                <Select value={form.babyFeeding} options={babyFeedingOptions} onChange={(babyFeeding) => setForm((prev) => ({ ...prev, babyFeeding }))} />
              </Field>
              <Field label="Giấc ngủ của bé">
                <Select value={form.babySleep} options={babySleepOptions} onChange={(babySleep) => setForm((prev) => ({ ...prev, babySleep }))} />
              </Field>
            </div>

            <Field label="Ghi chú thêm">
              <textarea
                value={form.note}
                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                rows={5}
                maxLength={1000}
                placeholder="Ví dụ: Mẹ mệt hơn hôm qua, bé bú ít, vết mổ hơi đau..."
                className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium leading-6 text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-teal-400 focus:ring-3 focus:ring-teal-50"
              />
              <div className="mt-1 text-right text-[11px] font-bold text-slate-400">{form.note.length}/1000</div>
            </Field>

            <div className="flex items-center justify-between gap-4 rounded-md bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-800">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>Thông tin từ AI chỉ mang tính tham khảo, không thay thế tư vấn từ bác sĩ hoặc chuyên gia y tế.</span>
              </div>
              <button
                disabled={submitting}
                className="h-11 shrink-0 rounded-lg bg-slate-950 px-6 text-sm font-black text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                {submitting ? 'Đang phân tích...' : 'Phân tích'}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
          <CardTitle icon={<ClipboardDocumentCheckIcon className="h-4 w-4" />} title="Lịch sử check-in" />
          <HistoryList items={history} />
        </section>
      </div>
    </main>
  );
};

function ResultCard({ analysis, triage }: { analysis: HealthAnalysisResponse; triage: string }) {
  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-black ${getBadgeClass(triage)}`}>{toTriageLabel(triage)}</span>
        <span className="text-xs font-bold text-slate-400">Mô phỏng triage chính thức</span>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4">
        <Metric label="Điểm rủi ro" value={`${analysis.riskScore}/100`} large />
        <Metric label="Độ đầy đủ dữ liệu" value={`${analysis.dataCoveragePercent}%`} />
      </div>

      <p className="text-sm font-semibold leading-6 text-slate-700">{analysis.summary}</p>

      <InfoBlock title="Xu hướng & lần cần nhất" tone="teal">
        {analysis.trendSummary || analysis.narrativeSummary || 'Chưa đủ dữ liệu để nhận diện xu hướng.'}
      </InfoBlock>

      <ListBlock title="Khuyến nghị cá nhân hóa" items={analysis.recommendations} />

      {analysis.carePlan.length > 0 && (
        <div>
          <SectionLabel>Kế hoạch chăm sóc</SectionLabel>
          <div className="space-y-2">
            {analysis.carePlan.slice(0, 2).map((item) => (
              <div key={`${item.timeframe}-${item.action}`} className="rounded-md bg-slate-50 p-3">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">{item.timeframe}</div>
                <div className="mt-1 text-sm font-black text-slate-900">{item.action}</div>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <ServiceSuggestions services={analysis.suggestedServices} />

      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">{analysis.disclaimer}</p>
    </div>
  );
}

function CardTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-teal-50 text-teal-700">{icon}</div>
      <h1 className="text-lg font-black text-slate-950">{title}</h1>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ value, min, max, step, onChange }: { value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step ?? 1}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-400 focus:ring-3 focus:ring-teal-50"
    />
  );
}

function Select({ value, options, onChange }: { value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-400 focus:ring-3 focus:ring-teal-50"
    >
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}

function Metric({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className={`mt-1 font-black text-slate-950 ${large ? 'text-4xl' : 'text-2xl'}`}>{value}</div>
    </div>
  );
}

function InfoBlock({ title, children, tone }: { title: string; children: React.ReactNode; tone: 'teal' }) {
  return (
    <div className="rounded-md bg-teal-50 p-3">
      <SectionLabel tone={tone}>{title}</SectionLabel>
      <p className="mt-1 text-sm font-semibold leading-6 text-teal-900">{children}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-2 grid gap-2">
        {items.slice(0, 3).map((item) => (
          <p key={item} className="rounded-md bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">{item}</p>
        ))}
      </div>
    </div>
  );
}

function ServiceSuggestions({ services }: { services: HealthAnalysisResponse['suggestedServices'] }) {
  if (!services.length) return null;
  return (
    <div>
      <SectionLabel>Dịch vụ gợi ý</SectionLabel>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {services.slice(0, 2).map((service) => (
          <Link key={service.serviceKey} to={`/services/${encodeURIComponent(service.serviceKey)}`} className="rounded-md bg-teal-50 p-3 transition hover:bg-teal-100">
            <div className="text-sm font-black text-teal-950">{service.serviceName}</div>
            <p className="mt-1 text-xs font-semibold leading-5 text-teal-800">{service.reason}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function HistoryList({ items }: { items: HealthCheckInHistoryDto[] }) {
  if (!items.length) {
    return <p className="mt-4 rounded-md bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">Chưa có lịch sử check-in.</p>;
  }

  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const triage = normalizeTriage(item.analysis?.warningLevel);
        return (
          <article key={item.checkInId} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-950">{formatDateTime(item.createdAt)}</div>
                <div className="mt-1 text-xs font-bold text-slate-500">Đau {item.painLevel}/10 · Ngủ {item.sleepHours}h</div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${getBadgeClass(triage)}`}>{toTriageLabel(triage)}</span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-slate-700">
              {item.analysis?.summary ?? item.note ?? 'Chưa có tóm tắt.'}
            </p>
          </article>
        );
      })}
    </div>
  );
}

function SectionLabel({ children, tone }: { children: React.ReactNode; tone?: 'teal' }) {
  return <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${tone === 'teal' ? 'text-teal-700' : 'text-slate-500'}`}>{children}</div>;
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

function normalizeTriage(level?: string) {
  switch (level) {
    case 'Emergency': return 'Emergency';
    case 'Red':
    case 'High': return 'Red';
    case 'Yellow':
    case 'Medium': return 'Yellow';
    default: return 'Green';
  }
}

function toTriageLabel(level?: string) {
  switch (normalizeTriage(level)) {
    case 'Emergency': return 'Đỏ khẩn cấp';
    case 'Red': return 'Cao';
    case 'Yellow': return 'Trung bình';
    default: return 'Thấp';
  }
}

function getBadgeClass(level: string) {
  switch (level) {
    case 'Emergency': return 'bg-red-100 text-red-700';
    case 'Red': return 'bg-rose-100 text-rose-700';
    case 'Yellow': return 'bg-amber-100 text-amber-700';
    default: return 'bg-teal-50 text-teal-700';
  }
}

export default HealthCheckInsPage;
