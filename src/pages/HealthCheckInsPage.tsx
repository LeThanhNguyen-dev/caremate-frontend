import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownTrayIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon,
  ChartBarSquareIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  LifebuoyIcon,
  MapPinIcon,
  MicrophoneIcon,
  PhoneIcon,
  ShieldCheckIcon,
  SpeakerWaveIcon,
  SparklesIcon,
  StopCircleIcon,
} from '@heroicons/react/24/outline';
import caremateApi from '../api/caremateApi';
import type { HealthAnalysisResponse, HealthCheckInHistoryDto, LatestHealthCheckInDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';

type FormState = {
  sleepHours: number;
  painLevel: number;
  painLocation: string[];
  painType: string;
  painDuration: string;
  painTrend: string;
  symptoms: string[];
  medicalHistory: string[];
  postpartumDay: string;
  deliveryMethod: string;
  bleedingLevel: string;
  incisionStatus: string;
  swellingLevel: string;
  urinationIssue: boolean;
  babyWetDiapers: string;
  babyActivity: string;
  motherAge: string;
  systolicBloodPressure: string;
  diastolicBloodPressure: string;
  temperatureCelsius: string;
  tookMedicationToday: boolean;
  medicationNote: string;
  mood: string;
  milkStatus: string;
  babyFeeding: string;
  babySleep: string;
  note: string;
};

type SpeechRecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

const painLocations = ['Đầu', 'Ngực', 'Bụng trên', 'Bụng dưới', 'Lưng', 'Vết mổ', 'Ngực/sữa', 'Khớp', 'Chân', 'Toàn thân'];
const painTypes = ['Âm ỉ', 'Nhói', 'Quặn', 'Rát', 'Căng tức', 'Theo cơn', 'Lan sang vùng khác'];
const painDurations = ['Mới xuất hiện', 'Dưới 6 giờ', '6-24 giờ', '1-2 ngày', 'Trên 2 ngày'];
const painTrends = [
  { value: 'Better', label: 'Đang giảm' },
  { value: 'Same', label: 'Không đổi' },
  { value: 'Worse', label: 'Đang tăng' },
];
const symptomOptions = ['Sốt', 'Khó thở', 'Đau ngực', 'Chóng mặt', 'Mờ mắt', 'Buồn nôn', 'Ra máu bất thường', 'Vết mổ sưng đỏ', 'Vết mổ chảy dịch', 'Bé bỏ bú'];
const historyOptions = ['Tăng huyết áp', 'Tiểu đường', 'Tim mạch', 'Thiếu máu', 'Sinh mổ', 'Tiền sản giật', 'Dị ứng thuốc'];
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
const deliveryMethodOptions = [
  { value: '', label: 'Chưa chọn' },
  { value: 'Vaginal', label: 'Sinh thường' },
  { value: 'CSection', label: 'Sinh mổ' },
];
const bleedingLevelOptions = [
  { value: '', label: 'Chưa chọn' },
  { value: 'None', label: 'Không/rất ít' },
  { value: 'Light', label: 'Ít' },
  { value: 'Moderate', label: 'Vừa' },
  { value: 'Heavy', label: 'Nhiều' },
];
const incisionStatusOptions = [
  { value: '', label: 'Không áp dụng' },
  { value: 'Normal', label: 'Bình thường' },
  { value: 'Painful', label: 'Đau/tăng đau' },
  { value: 'RedSwollen', label: 'Sưng đỏ' },
  { value: 'Discharge', label: 'Chảy dịch' },
];
const swellingLevelOptions = [
  { value: '', label: 'Chưa chọn' },
  { value: 'None', label: 'Không' },
  { value: 'Mild', label: 'Nhẹ' },
  { value: 'Moderate', label: 'Vừa' },
  { value: 'Severe', label: 'Nhiều' },
];
const babyActivityOptions = [
  { value: '', label: 'Chưa chọn' },
  { value: 'Normal', label: 'Bình thường' },
  { value: 'Sleepier', label: 'Buồn ngủ hơn' },
  { value: 'Fussy', label: 'Quấy khóc' },
  { value: 'Lethargic', label: 'Lừ đừ/yếu' },
];

const initialForm: FormState = {
  sleepHours: 6,
  painLevel: 4,
  painLocation: [],
  painType: '',
  painDuration: '',
  painTrend: 'Same',
  symptoms: [],
  medicalHistory: [],
  postpartumDay: '',
  deliveryMethod: '',
  bleedingLevel: '',
  incisionStatus: '',
  swellingLevel: '',
  urinationIssue: false,
  babyWetDiapers: '',
  babyActivity: '',
  motherAge: '',
  systolicBloodPressure: '',
  diastolicBloodPressure: '',
  temperatureCelsius: '',
  tookMedicationToday: false,
  medicationNote: '',
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
  const [listening, setListening] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<HealthAnalysisResponse | null>(null);
  const [latestCheckIn, setLatestCheckIn] = useState<LatestHealthCheckInDto | null>(null);
  const [history, setHistory] = useState<HealthCheckInHistoryDto[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const activeAnalysis = analysisResult ?? latestCheckIn?.analysis ?? null;
  const activeWarning = normalizeTriage(activeAnalysis?.warningLevel);

  const stats = useMemo(() => {
    const avgSleep = history.length ? history.reduce((sum, item) => sum + item.sleepHours, 0) / history.length : 0;
    const avgPain = history.length ? history.reduce((sum, item) => sum + item.painLevel, 0) / history.length : 0;
    const redCount = history.filter((item) => ['Red', 'Emergency'].includes(normalizeTriage(item.analysis?.warningLevel))).length;
    return { avgSleep, avgPain, redCount };
  }, [history]);

  const conditionalPrompts = useMemo(() => buildConditionalPrompts(form), [form]);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm(form, showToast)) return;

    try {
      setSubmitting(true);
      const result = await caremateApi.analyzeHealthCheckIn({
        sleepHours: form.sleepHours,
        painLevel: form.painLevel,
        painLocation: form.painLocation.length ? form.painLocation.join(', ') : undefined,
        painType: form.painType || undefined,
        painDuration: form.painDuration || undefined,
        painTrend: form.painTrend || undefined,
        symptoms: form.symptoms,
        medicalHistory: form.medicalHistory,
        contextData: buildContextData(form),
        motherAge: toOptionalNumber(form.motherAge),
        systolicBloodPressure: toOptionalNumber(form.systolicBloodPressure),
        diastolicBloodPressure: toOptionalNumber(form.diastolicBloodPressure),
        temperatureCelsius: toOptionalNumber(form.temperatureCelsius),
        tookMedicationToday: form.tookMedicationToday,
        medicationNote: form.medicationNote.trim() || undefined,
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

  const startVoiceInput = () => {
    const SpeechRecognition = (window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition
      ?? (window as Window & { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Trình duyệt hiện chưa hỗ trợ nhập giọng nói.', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      setForm((prev) => ({ ...prev, note: [prev.note, transcript].filter(Boolean).join(' ') }));
    };
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  const exportReport = () => {
    const rows = history.slice(0, 14).map((item) => [
      formatDateTime(item.createdAt),
      `${item.painLevel}/10`,
      item.painLocation ?? '',
      `${item.sleepHours}h`,
      toOptionLabel(item.mood, moodOptions),
      normalizeTriage(item.analysis?.warningLevel),
      item.analysis?.summary ?? '',
    ]);
    const html = buildPrintableReport(activeAnalysis, rows);
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      showToast('Không thể mở cửa sổ báo cáo.', 'error');
      return;
    }
    reportWindow.document.write(html);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  };

  return (
    <main className="min-h-screen bg-[#f6fbf9] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_20px_60px_rgba(15,118,110,0.09)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="p-6 lg:p-8">
              <p className="inline-flex rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-800">Theo dõi sức khỏe</p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Check-in sức khỏe theo ngữ cảnh</h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600 md:text-base">
                Mẹ nhập theo kiểu hội thoại, chọn vùng đau trên body map, ghi thêm dấu hiệu đi kèm, rồi CareMate phân loại xanh, vàng, đỏ hoặc đỏ khẩn cấp kèm hành động tiếp theo.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Capability label="Body map" />
                <Capability label="Câu hỏi động" />
                <Capability label="Voice input" />
                <Capability label="Xuất báo cáo" />
                <Capability label={activeAnalysis?.engineVersion ? `CareMate Engine ${activeAnalysis.engineVersion.replace('rule-', '')}` : 'CareMate Engine v3.0'} />
              </div>
            </div>
            <div className={`border-t p-6 text-white lg:border-l lg:border-t-0 ${getTriageHeroClass(activeWarning)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-white/75">Triage hiện tại</div>
                  <div className="mt-2 text-3xl font-black">{toTriageLabel(activeWarning)}</div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/80">{activeAnalysis?.urgencyAction ?? 'Chưa có dữ liệu check-in mới.'}</p>
                </div>
                <div className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-black">{activeAnalysis ? `${activeAnalysis.riskScore}/100` : '--'}</div>
              </div>
              {activeWarning === 'Emergency' && (
                <a href="tel:115" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-red-700 shadow-lg">
                  <PhoneIcon className="h-5 w-5" />
                  Gọi cấp cứu 115
                </a>
              )}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat label="Đau TB" value={history.length ? stats.avgPain.toFixed(1) : '--'} dark />
                <Stat label="Ngủ TB" value={history.length ? `${stats.avgSleep.toFixed(1)}h` : '--'} dark />
                <Stat label="Red" value={stats.redCount.toString()} dark />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_400px]">
          <Panel title="Check-in dạng hội thoại" icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <ChatPrompt text="Hôm nay mẹ thấy thế nào? Chọn vùng đau và dấu hiệu đi kèm trước, hệ thống sẽ hỏi tiếp đúng ngữ cảnh." />

              <FormSection title="Vùng đau và mức độ" subtitle="Chọn một hoặc nhiều vị trí, sau đó mô tả cường độ và diễn tiến để hệ thống hiểu ngữ cảnh chính.">
                <BodyMap selected={form.painLocation} onChange={(painLocation) => setForm((prev) => ({ ...prev, painLocation }))} />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Mức đau">
                    <RangeInput value={form.painLevel} min={0} max={10} onChange={(painLevel) => setForm((prev) => ({ ...prev, painLevel }))} suffix="/10" />
                  </Field>
                  <Field label="Kiểu đau">
                    <Select value={form.painType} onChange={(painType) => setForm((prev) => ({ ...prev, painType }))} options={[{ value: '', label: 'Chọn kiểu đau' }, ...painTypes.map((value) => ({ value, label: value }))]} />
                  </Field>
                  <Field label="Đau bao lâu">
                    <Select value={form.painDuration} onChange={(painDuration) => setForm((prev) => ({ ...prev, painDuration }))} options={[{ value: '', label: 'Chọn thời gian' }, ...painDurations.map((value) => ({ value, label: value }))]} />
                  </Field>
                  <Field label="Diễn tiến đau">
                    <Select value={form.painTrend} onChange={(painTrend) => setForm((prev) => ({ ...prev, painTrend }))} options={painTrends} />
                  </Field>
                  <Field label="Số giờ ngủ">
                    <NumberInput value={form.sleepHours} min={0} max={24} step={0.5} onChange={(sleepHours) => setForm((prev) => ({ ...prev, sleepHours }))} />
                  </Field>
                  <Field label="Tâm trạng">
                    <Select value={form.mood} onChange={(mood) => setForm((prev) => ({ ...prev, mood }))} options={moodOptions} />
                  </Field>
                </div>
              </FormSection>

              <FormSection title="Triệu chứng và tiền sử" subtitle="Các tag này giúp hệ thống nhận diện dấu hiệu nguy cơ và xu hướng lặp lại.">
                <ChipGroup label="Triệu chứng đi kèm" options={symptomOptions} values={form.symptoms} onChange={(symptoms) => setForm((prev) => ({ ...prev, symptoms }))} />
                <ChipGroup label="Tiền sử cần lưu ý" options={historyOptions} values={form.medicalHistory} onChange={(medicalHistory) => setForm((prev) => ({ ...prev, medicalHistory }))} />

                {conditionalPrompts.length > 0 && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/90 p-4 shadow-inner">
                    <div className="mb-2 flex items-center gap-2 text-sm font-black text-amber-900">
                      <BellAlertIcon className="h-5 w-5" />
                      Hỏi thêm theo triệu chứng
                    </div>
                    <div className="space-y-2">
                      {conditionalPrompts.map((prompt) => (
                        <p key={prompt} className="text-sm font-semibold leading-6 text-amber-800">{prompt}</p>
                      ))}
                    </div>
                  </div>
                )}
              </FormSection>

              <FormSection title="Chỉ số đo được" subtitle="Nhập các chỉ số hiện có. Bỏ trống nếu chưa đo để tránh nhiễu dữ liệu.">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Tuổi mẹ">
                    <TextInput value={form.motherAge} inputMode="numeric" onChange={(motherAge) => setForm((prev) => ({ ...prev, motherAge }))} placeholder="VD: 32" />
                  </Field>
                  <Field label="Huyết áp trên">
                    <TextInput value={form.systolicBloodPressure} inputMode="numeric" onChange={(systolicBloodPressure) => setForm((prev) => ({ ...prev, systolicBloodPressure }))} placeholder="VD: 120" />
                  </Field>
                  <Field label="Huyết áp dưới">
                    <TextInput value={form.diastolicBloodPressure} inputMode="numeric" onChange={(diastolicBloodPressure) => setForm((prev) => ({ ...prev, diastolicBloodPressure }))} placeholder="VD: 80" />
                  </Field>
                  <Field label="Nhiệt độ">
                    <TextInput value={form.temperatureCelsius} inputMode="decimal" onChange={(temperatureCelsius) => setForm((prev) => ({ ...prev, temperatureCelsius }))} placeholder="VD: 37.5" />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Tình trạng sữa">
                    <Select value={form.milkStatus} onChange={(milkStatus) => setForm((prev) => ({ ...prev, milkStatus }))} options={milkStatusOptions} />
                  </Field>
                  <Field label="Bé bú">
                    <Select value={form.babyFeeding} onChange={(babyFeeding) => setForm((prev) => ({ ...prev, babyFeeding }))} options={babyFeedingOptions} />
                  </Field>
                  <Field label="Bé ngủ">
                    <Select value={form.babySleep} onChange={(babySleep) => setForm((prev) => ({ ...prev, babySleep }))} options={babySleepOptions} />
                  </Field>
                </div>
              </FormSection>

              <FormSection title="Dữ liệu bổ sung" subtitle="Các tín hiệu sau sinh và sơ sinh giúp hệ thống cá nhân hóa phân tích hơn.">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Ngày sau sinh">
                    <TextInput value={form.postpartumDay} inputMode="numeric" onChange={(postpartumDay) => setForm((prev) => ({ ...prev, postpartumDay }))} placeholder="VD: 12" />
                  </Field>
                  <Field label="Kiểu sinh">
                    <Select value={form.deliveryMethod} onChange={(deliveryMethod) => setForm((prev) => ({ ...prev, deliveryMethod }))} options={deliveryMethodOptions} />
                  </Field>
                  <Field label="Sản dịch/ra máu">
                    <Select value={form.bleedingLevel} onChange={(bleedingLevel) => setForm((prev) => ({ ...prev, bleedingLevel }))} options={bleedingLevelOptions} />
                  </Field>
                  <Field label="Vết mổ/vết khâu">
                    <Select value={form.incisionStatus} onChange={(incisionStatus) => setForm((prev) => ({ ...prev, incisionStatus }))} options={incisionStatusOptions} />
                  </Field>
                  <Field label="Phù chân/tay">
                    <Select value={form.swellingLevel} onChange={(swellingLevel) => setForm((prev) => ({ ...prev, swellingLevel }))} options={swellingLevelOptions} />
                  </Field>
                  <Field label="Tã ướt của bé/ngày">
                    <TextInput value={form.babyWetDiapers} inputMode="numeric" onChange={(babyWetDiapers) => setForm((prev) => ({ ...prev, babyWetDiapers }))} placeholder="VD: 6" />
                  </Field>
                  <Field label="Hoạt động của bé">
                    <Select value={form.babyActivity} onChange={(babyActivity) => setForm((prev) => ({ ...prev, babyActivity }))} options={babyActivityOptions} />
                  </Field>
                  <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition hover:border-teal-200">
                    <input
                      type="checkbox"
                      checked={form.urinationIssue}
                      onChange={(event) => setForm((prev) => ({ ...prev, urinationIssue: event.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm font-black leading-5 text-slate-900">Khó tiểu/tiểu buốt</span>
                  </label>
                </div>
              </FormSection>

              <FormSection title="Ghi chú cuối cùng" subtitle="Thêm điều mẹ muốn kể, hoặc dùng microphone để nhập nhanh bằng giọng nói.">
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-inner">
                  <input
                    type="checkbox"
                    checked={form.tookMedicationToday}
                    onChange={(event) => setForm((prev) => ({ ...prev, tookMedicationToday: event.target.checked }))}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-slate-900">Hôm nay mẹ đã uống thuốc theo dặn dò</span>
                    <TextInput value={form.medicationNote} onChange={(medicationNote) => setForm((prev) => ({ ...prev, medicationNote }))} placeholder="Ghi chú thuốc nếu cần" className="mt-3" />
                  </span>
                </label>

                <Field label="Mẹ kể thêm">
                  <div className="relative">
                    <textarea
                      value={form.note}
                      onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                      rows={4}
                      maxLength={1000}
                      placeholder="VD: Mẹ đau bụng dưới từ sáng, hơi chóng mặt, bé bú ít hơn..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-14 text-sm font-semibold leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-300 hover:border-teal-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                    />
                    <button type="button" onClick={startVoiceInput} className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl shadow-sm transition hover:-translate-y-0.5 ${listening ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-teal-50 text-teal-700 ring-1 ring-teal-100'}`}>
                      <MicrophoneIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-1 text-right text-xs font-bold text-slate-400">{form.note.length}/1000</div>
                </Field>
              </FormSection>

              <div className="flex flex-col gap-3 rounded-xl border border-amber-100 bg-amber-50/80 p-4 shadow-inner sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold leading-5 text-amber-800">Hệ thống chỉ hỗ trợ sàng lọc và theo dõi, không thay thế bác sĩ. Nếu có dấu hiệu đỏ, ưu tiên liên hệ cơ sở y tế.</p>
                <button type="submit" disabled={submitting} className="h-12 shrink-0 rounded-xl bg-slate-950 px-6 text-sm font-black text-white shadow-[0_12px_26px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {submitting ? 'Đang phân tích...' : 'Phân tích'}
                </button>
              </div>
            </form>
          </Panel>

          <Panel title="Tóm tắt mới nhất" icon={<SparklesIcon className="h-5 w-5" />}>
            {activeAnalysis ? <AnalysisSummary analysis={activeAnalysis} /> : <EmptyState message="Chưa có kết quả phân tích. Hãy gửi check-in đầu tiên hôm nay." />}
          </Panel>
        </section>

        <section className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel title="Health timeline" icon={<ChartBarSquareIcon className="h-5 w-5" />}>
            <TimelineChart history={history} />
          </Panel>
          <Panel title="Báo cáo đi khám" icon={<ArrowDownTrayIcon className="h-5 w-5" />}>
            <p className="text-sm font-semibold leading-6 text-slate-600">Xuất báo cáo 14 check-in gần nhất để gia đình hoặc bác sĩ xem nhanh mức đau, giấc ngủ, triage và tóm tắt phân tích.</p>
            <button type="button" onClick={exportReport} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-teal-700">
              <ArrowDownTrayIcon className="h-5 w-5" />
              Xuất PDF
            </button>
          </Panel>
        </section>

        <Panel title="Lịch sử check-in chi tiết" icon={<ClipboardDocumentCheckIcon className="h-5 w-5" />}>
          {loading ? (
            <div className="grid gap-3 py-4">
              {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : history.length === 0 ? (
            <EmptyState message="Chưa có lịch sử check-in." />
          ) : (
            <>
              <div className="space-y-3">
                {history.map((item) => (
                  <HistoryItem key={item.checkInId} item={item} expanded={expandedId === item.checkInId} onToggle={() => setExpandedId((current) => (current === item.checkInId ? null : item.checkInId))} />
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <button type="button" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-40">Trang trước</button>
                <div className="text-sm font-bold text-slate-400">Trang {page}</div>
                <button type="button" disabled={history.length < 8} onClick={() => setPage((prev) => prev + 1)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-40">Trang sau</button>
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
    <section className="rounded-xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_55px_rgba(15,118,110,0.08)] ring-1 ring-white lg:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100/80">{icon}</div>
        <h2 className="text-[19px] font-black tracking-tight text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function FormSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="mb-4 flex flex-col gap-1 border-b border-slate-100 pb-3">
        <h3 className="text-base font-black tracking-tight text-slate-950">{title}</h3>
        <p className="text-sm font-semibold leading-6 text-slate-500">{subtitle}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function BodyMap({ selected, onChange }: { selected: string[]; onChange: (value: string[]) => void }) {
  const toggle = (location: string) => {
    onChange(selected.includes(location)
      ? selected.filter((item) => item !== location)
      : [...selected, location]);
  };

  return (
    <div className="rounded-xl border border-teal-100 bg-gradient-to-br from-white via-teal-50/40 to-slate-50 p-4 shadow-inner sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-teal-100 bg-white px-3.5 py-2.5 text-sm font-black text-slate-900 shadow-sm">
          <MapPinIcon className="h-4 w-4 shrink-0 text-teal-700" />
          <span className="truncate">Vùng đau đang chọn:</span>
          <span className="shrink-0 text-teal-700">{selected.length ? `${selected.length} vùng` : 'Chưa chọn'}</span>
        </div>
        {selected.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="w-fit rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800">
            Bỏ chọn tất cả
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((location) => (
            <button key={location} type="button" onClick={() => toggle(location)} className="rounded-full bg-teal-600 px-3 py-1.5 text-xs font-black text-white shadow-sm transition hover:bg-teal-700">
              {location} ×
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {painLocations.map((location) => {
          const active = selected.includes(location);
          return (
            <button
              key={location}
              type="button"
              onClick={() => toggle(location)}
              className={`min-h-14 rounded-xl border px-3 py-3 text-sm font-black leading-5 shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-teal-100 ${active ? 'border-teal-600 bg-teal-600 text-white shadow-teal-100' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800'}`}
            >
              {location}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AnalysisSummary({ analysis }: { analysis: HealthAnalysisResponse }) {
  const triage = normalizeTriage(analysis.warningLevel);
  const [speaking, setSpeaking] = useState(false);

  const speakAnalysis = () => {
    const speechSynthesis = (window as Window & { speechSynthesis?: SpeechSynthesis }).speechSynthesis;
    if (!speechSynthesis) {
      globalThis.alert('Trình duyệt hiện chưa hỗ trợ đọc giọng nói.');
      return;
    }

    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(buildAnalysisSpeechText(analysis, triage));
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border p-4 ${getTriagePanelClass(triage)}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]">
                <ShieldCheckIcon className="h-4 w-4" />
                {toTriageLabel(triage)}
              </div>
              <button
                type="button"
                onClick={speakAnalysis}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-black shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-white"
              >
                {speaking ? <StopCircleIcon className="h-4 w-4" /> : <SpeakerWaveIcon className="h-4 w-4" />}
                {speaking ? 'Dừng đọc' : 'Nghe đọc'}
              </button>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6">{analysis.summary}</p>
          </div>
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-white/80 text-center shadow-sm">
            <div>
              <div className="text-3xl font-black">{analysis.riskScore}</div>
              <div className="text-xs font-black opacity-70">/100</div>
            </div>
          </div>
        </div>
        {analysis.urgencyAction && (
          <div className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-black shadow-sm">{analysis.urgencyAction}</div>
        )}
      </div>
      {analysis.narrativeSummary && <NarrativeSummaryCard summary={analysis.narrativeSummary} engineVersion={analysis.engineVersion} />}
      <div className="grid gap-4 lg:grid-cols-2">
        <PpdGauge score={analysis.ppdScreeningScore ?? 0} level={analysis.ppdScreeningLevel} note={analysis.ppdScreeningNote} />
        <DataCoverageRing percent={analysis.dataCoveragePercent ?? 0} filled={analysis.dataCoverageItems ?? []} missing={analysis.missingDataItems ?? []} />
      </div>
      {analysis.nutritionGuidance?.length > 0 && <NutritionGuidancePanel tips={analysis.nutritionGuidance} />}
      {analysis.weeklySummary && <InfoBlock title="Tóm tắt 7 ngày" content={analysis.weeklySummary} />}
      {analysis.trendSummary && <InfoBlock title="Xu hướng gần đây" content={analysis.trendSummary} />}
      {analysis.riskFactors?.length > 0 && <RiskFactorList factors={analysis.riskFactors} />}
      <ListBlock title="Khuyến nghị cá nhân hóa" items={analysis.recommendations} />
      <ServiceSuggestions services={analysis.suggestedServices} triage={triage} />
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">{analysis.disclaimer}</p>
    </div>
  );
}

function TimelineChart({ history }: { history: HealthCheckInHistoryDto[] }) {
  const data = history.slice(0, 7).reverse();
  if (data.length === 0) return <EmptyState message="Chưa có dữ liệu để vẽ timeline." />;
  const maxPain = 10;
  return (
    <div className="space-y-4">
      <div className="grid min-h-56 grid-cols-7 items-end gap-2 rounded-xl bg-slate-50 p-4">
        {data.map((item) => {
          const triage = normalizeTriage(item.analysis?.warningLevel);
          return (
            <div key={item.checkInId} className="flex h-48 flex-col items-center justify-end gap-2">
              <div className="text-xs font-black text-slate-500">{item.painLevel}</div>
              <div className={`w-full rounded-t-lg ${getTriageBarClass(triage)}`} style={{ height: `${Math.max(12, (item.painLevel / maxPain) * 160)}px` }} />
              <div className="text-[10px] font-bold text-slate-400">{new Date(item.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <TrendMini title="Đau" current={data.at(-1)?.painLevel ?? 0} previous={data[0]?.painLevel ?? 0} suffix="/10" />
        <TrendMini title="Ngủ" current={data.at(-1)?.sleepHours ?? 0} previous={data[0]?.sleepHours ?? 0} suffix="h" inverse />
        <TrendMini title="Check-in" current={data.length} previous={7} suffix="/7" />
      </div>
    </div>
  );
}

function HistoryItem({ item, expanded, onToggle }: { item: HealthCheckInHistoryDto; expanded: boolean; onToggle: () => void }) {
  const triage = normalizeTriage(item.analysis?.warningLevel);
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
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${getTriageBadgeClass(triage)}`}>{toTriageLabel(triage)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
              <Metric label="Đau" value={`${item.painLevel}/10`} />
              <Metric label="Vùng" value={item.painLocation ?? 'Chưa chọn'} />
              <Metric label="Ngủ" value={`${item.sleepHours}h`} />
              <Metric label="Mẹ" value={toOptionLabel(item.mood, moodOptions)} />
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
                <DetailRow label="Mức đau" value={`${item.painLevel}/10`} />
                <DetailRow label="Vùng đau" value={item.painLocation ?? 'Chưa chọn'} />
                <DetailRow label="Kiểu đau" value={item.painType ?? 'Chưa chọn'} />
                <DetailRow label="Triệu chứng" value={item.symptoms?.join(', ') || 'Không ghi nhận'} />
                <DetailRow label="Huyết áp" value={item.systolicBloodPressure && item.diastolicBloodPressure ? `${item.systolicBloodPressure}/${item.diastolicBloodPressure}` : 'Chưa nhập'} />
                <DetailRow label="Nhiệt độ" value={item.temperatureCelsius ? `${item.temperatureCelsius}°C` : 'Chưa nhập'} />
                <DetailRow label="Dữ liệu bổ sung" value={formatContextData(item.contextData)} />
              </div>
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm font-medium leading-6 text-slate-700">{item.note || 'Không có ghi chú.'}</p>
            </div>
            <div className="rounded-lg bg-white p-4">{item.analysis ? <AnalysisSummary analysis={item.analysis} /> : <EmptyState message="Lần check-in này chưa có phân tích." />}</div>
          </div>
        </div>
      )}
    </article>
  );
}

function ChipGroup({ label, options, values, onChange }: { label: string; options: string[]; values: string[]; onChange: (values: string[]) => void }) {
  const toggle = (value: string) => onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  return (
    <div>
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => toggle(option)} className={`min-h-10 rounded-xl border px-3.5 py-2 text-sm font-black leading-5 shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-teal-100 ${values.includes(option) ? 'border-teal-600 bg-teal-600 text-white shadow-teal-100' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800'}`}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ value, min, max, step, onChange }: { value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return <input type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-[52px] min-h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-300 hover:border-teal-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-50" />;
}

function TextInput({ value, onChange, placeholder, inputMode, className = '' }: { value: string; onChange: (value: string) => void; placeholder?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; className?: string }) {
  return <input value={value} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`h-[52px] min-h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-300 hover:border-teal-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-50 ${className}`} />;
}

function RangeInput({ value, min, max, suffix, onChange }: { value: number; min: number; max: number; suffix: string; onChange: (value: number) => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-teal-200">
      <div className="mb-2 flex items-center justify-between text-sm font-black text-slate-900"><span>{value}{suffix}</span><HeartIcon className="h-5 w-5 text-teal-600" /></div>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-teal-600" />
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <div className="relative">
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-[52px] min-h-[52px] w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-900 shadow-sm outline-none transition hover:border-teal-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-50">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
    </div>
  );
}

function ChatPrompt({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-900/80 bg-slate-950 px-5 py-4 text-sm font-bold leading-6 text-white shadow-[0_14px_34px_rgba(15,23,42,0.16)]">
      <div className="absolute inset-y-0 left-0 w-1 bg-teal-400" />
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-teal-100 ring-1 ring-white/10">
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
        </div>
        <p>{text}</p>
      </div>
    </div>
  );
}

function Capability({ label }: { label: string }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm"><CheckCircleIcon className="h-4 w-4 text-teal-600" />{label}</span>;
}

function Stat({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return <div className={`rounded-xl p-3 text-center ${dark ? 'bg-white/10 ring-1 ring-white/10' : 'bg-white shadow-sm'}`}><div className={`text-lg font-black ${dark ? 'text-white' : 'text-slate-950'}`}>{value}</div><div className={`mt-1 text-[11px] font-bold uppercase tracking-[0.12em] ${dark ? 'text-white/70' : 'text-slate-400'}`}>{label}</div></div>;
}

function NarrativeSummaryCard({ summary, engineVersion }: { summary: string; engineVersion: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_18px_42px_rgba(15,23,42,0.16)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-teal-100">
          <SparklesIcon className="h-4 w-4" />
          AI narrative
        </div>
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black text-white/80">{engineVersion || 'rule-v3.0'}</span>
      </div>
      <p className="text-sm font-semibold leading-7 text-slate-100">{summary}</p>
    </div>
  );
}

function PpdGauge({ score, level, note }: { score: number; level?: string; note?: string }) {
  const normalized = Math.max(0, Math.min(30, score));
  const percent = (normalized / 30) * 100;
  const levelLabel = toPpdLabel(level);
  const levelClass = normalized >= 16 ? 'text-rose-700 bg-rose-50 border-rose-100' : normalized >= 9 ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100';
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">PPD screening</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">Sàng lọc tâm lý sau sinh</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${levelClass}`}>{levelLabel}</span>
      </div>
      <div className="relative mx-auto h-24 w-48 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-48 rounded-full bg-[conic-gradient(from_270deg,#10b981_0deg,#10b981_60deg,#f59e0b_60deg,#f59e0b_108deg,#e11d48_108deg,#e11d48_180deg,transparent_180deg)]" />
        <div className="absolute inset-x-5 top-5 h-40 rounded-full bg-white" />
        <div className="absolute bottom-0 left-1/2 h-1 w-20 origin-left rounded-full bg-slate-950 transition" style={{ transform: `rotate(${Math.max(0, Math.min(180, percent * 1.8))}deg)` }} />
      </div>
      <div className="mt-2 text-center">
        <div className="text-3xl font-black text-slate-950">{normalized}<span className="text-sm text-slate-400">/30</span></div>
        <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-600">{note || 'Chưa có ghi chú sàng lọc tâm lý.'}</p>
      </div>
    </div>
  );
}

function DataCoverageRing({ percent, filled, missing }: { percent: number; filled: string[]; missing: string[] }) {
  const safePercent = Math.max(0, Math.min(100, percent));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Data coverage</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">{filled.length}/20 chỉ số đã nhập</p>
        </div>
        <ClipboardDocumentCheckIcon className="h-6 w-6 text-teal-600" />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#0d9488 ${safePercent * 3.6}deg, #e2e8f0 0deg)` }}>
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-xl font-black text-slate-950">{safePercent}%</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-700">Thiếu dữ liệu ưu tiên</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(missing.length ? missing.slice(0, 6) : ['Đã đủ dữ liệu chính']).map((item) => (
              <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NutritionGuidancePanel({ tips }: { tips: HealthAnalysisResponse['nutritionGuidance'] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Gợi ý dinh dưỡng</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {tips.map((tip) => (
          <div key={`${tip.category}-${tip.tip}`} className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
                {tip.icon ? <span className="text-lg leading-none">{tip.icon}</span> : <HeartIcon className="h-5 w-5" />}
              </div>
              <div className="text-sm font-black text-emerald-950">{tip.category}</div>
            </div>
            <p className="text-sm font-black leading-6 text-emerald-950">{tip.tip}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-emerald-800">{tip.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoBlock({ title, content }: { title: string; content: string }) {
  return <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3"><h3 className="text-xs font-black uppercase tracking-[0.16em] text-teal-900">{title}</h3><p className="mt-2 text-sm font-semibold leading-6 text-teal-900">{content}</p></div>;
}

function RiskFactorList({ factors }: { factors: HealthAnalysisResponse['riskFactors'] }) {
  const groups = factors.reduce<Record<string, HealthAnalysisResponse['riskFactors']>>((acc, factor) => {
    const key = factor.category || 'General';
    acc[key] = [...(acc[key] ?? []), factor];
    return acc;
  }, {});
  return (
    <div>
      <h3 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Yếu tố làm tăng rủi ro</h3>
      <div className="grid gap-3">
        {Object.entries(groups).map(([category, items]) => (
          <div key={category} className="rounded-xl border border-rose-100 bg-rose-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-rose-700">
              <ExclamationTriangleIcon className="h-4 w-4" />
              {toCategoryLabel(category)}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((factor) => (
                <div key={factor.code} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm">
                  <span className="text-sm font-black text-rose-900">{factor.label}</span>
                  <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">+{factor.points}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return <div><h3 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">{title}</h3><ul className="grid gap-2 md:grid-cols-2">{items.map((item, index) => <li key={item} className="flex gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold leading-6 text-slate-700 shadow-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-50 text-xs font-black text-teal-700 ring-1 ring-teal-100">{index + 1}</span>{item}</li>)}</ul></div>;
}

function ServiceSuggestions({ services, triage }: { services: HealthAnalysisResponse['suggestedServices']; triage: string }) {
  if (triage === 'Emergency') {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4"><div className="flex items-start gap-3"><ExclamationTriangleIcon className="h-5 w-5 text-red-700" /><p className="text-sm font-black leading-6 text-red-900">Ưu tiên cấp cứu hoặc cơ sở y tế trước khi đặt dịch vụ tại nhà.</p></div></div>;
  }
  return <div><h3 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Dịch vụ gợi ý</h3>{services.length === 0 ? <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500">Hiện chưa có gợi ý dịch vụ cụ thể.</p> : <div className="grid gap-3 md:grid-cols-2">{services.map((service) => <Link key={service.serviceKey} to={`/services/${encodeURIComponent(service.serviceKey)}`} className="group rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white"><div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-teal-700 shadow-sm"><LifebuoyIcon className="h-5 w-5" /></div><div><div className="text-sm font-black text-teal-950">{service.serviceName}</div><div className="mt-1 text-sm font-semibold leading-6 text-teal-800">{service.reason}</div></div></div></Link>)}</div>}</div>;
}

function TrendMini({ title, current, previous, suffix, inverse = false }: { title: string; current: number; previous: number; suffix: string; inverse?: boolean }) {
  const diff = current - previous;
  const better = inverse ? diff > 0 : diff < 0;
  return <div className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-center justify-between"><span className="text-sm font-black text-slate-900">{title}</span>{better ? <ArrowTrendingDownIcon className="h-5 w-5 text-emerald-600" /> : <ArrowTrendingUpIcon className="h-5 w-5 text-amber-600" />}</div><div className="mt-2 text-xl font-black text-slate-950">{current.toFixed(title === 'Check-in' ? 0 : 1)}{suffix}</div></div>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"><span className="font-semibold text-slate-500">{label}</span><span className="text-right font-black text-slate-950">{value}</span></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-1">{label}: <strong className="text-slate-800">{value}</strong></span>;
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center"><ClockIcon className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-500">{message}</p></div>;
}

function buildConditionalPrompts(form: FormState) {
  const prompts: string[] = [];
  if (hasPainLocation(form, 'Đầu')) prompts.push('Mẹ có chóng mặt, mờ mắt hoặc đau đầu dữ dội không?');
  if (hasPainLocation(form, 'Ngực') || form.symptoms.includes('Đau ngực')) prompts.push('Có khó thở, hồi hộp, vã mồ hôi hoặc đau lan sang tay/hàm không?');
  if (hasPainLocation(form, 'Bụng') || hasPainLocation(form, 'Vết mổ')) prompts.push('Có sốt, ra máu bất thường, vết mổ sưng đỏ hoặc chảy dịch không?');
  if (form.babyFeeding === 'RefusesFeeding' || form.symptoms.includes('Bé bỏ bú')) prompts.push('Bé bỏ bú bao lâu rồi, có sốt hoặc lừ đừ không?');
  if (form.painLevel >= 8) prompts.push('Mức đau cao: nếu đau tăng nhanh hoặc kèm dấu hiệu bất thường, nên liên hệ y tế sớm.');
  return prompts;
}

function hasPainLocation(form: FormState, keyword: string) {
  return form.painLocation.some((location) => location.includes(keyword));
}

function validateForm(form: FormState, showToast: (message: string, type?: 'success' | 'error' | 'info') => void) {
  if (form.sleepHours < 0 || form.sleepHours > 24) {
    showToast('Số giờ ngủ phải nằm trong khoảng 0 đến 24.', 'error');
    return false;
  }
  if (form.painLevel < 0 || form.painLevel > 10) {
    showToast('Mức độ đau phải nằm trong khoảng 0 đến 10.', 'error');
    return false;
  }
  if (form.note.length > 1000) {
    showToast('Ghi chú không được vượt quá 1000 ký tự.', 'error');
    return false;
  }
  return true;
}

function buildContextData(form: FormState) {
  const entries: Record<string, string> = {};
  addContext(entries, 'postpartumDay', form.postpartumDay);
  addContext(entries, 'deliveryMethod', form.deliveryMethod);
  addContext(entries, 'bleedingLevel', form.bleedingLevel);
  addContext(entries, 'incisionStatus', form.incisionStatus);
  addContext(entries, 'swellingLevel', form.swellingLevel);
  addContext(entries, 'babyWetDiapers', form.babyWetDiapers);
  addContext(entries, 'babyActivity', form.babyActivity);
  if (form.urinationIssue) entries.urinationIssue = 'true';
  return entries;
}

function addContext(target: Record<string, string>, key: string, value: string) {
  if (value.trim()) target[key] = value.trim();
}

function formatContextData(contextData?: Record<string, string> | null) {
  if (!contextData || Object.keys(contextData).length === 0) return 'Chưa nhập';
  const labels: Record<string, string> = {
    postpartumDay: 'Ngày sau sinh',
    deliveryMethod: 'Kiểu sinh',
    bleedingLevel: 'Sản dịch',
    incisionStatus: 'Vết mổ/khâu',
    swellingLevel: 'Phù',
    urinationIssue: 'Khó tiểu',
    babyWetDiapers: 'Tã ướt/ngày',
    babyActivity: 'Hoạt động bé',
  };
  return Object.entries(contextData)
    .map(([key, value]) => `${labels[key] ?? key}: ${value}`)
    .join('; ');
}

function buildAnalysisSpeechText(analysis: HealthAnalysisResponse, triage: string) {
  const parts = [
    `Kết quả phân tích hiện tại ở mức ${toTriageLabel(triage)}.`,
    `Điểm rủi ro là ${analysis.riskScore} trên 100.`,
    analysis.summary,
    analysis.urgencyAction ? `Hành động ưu tiên: ${analysis.urgencyAction}` : '',
    analysis.recommendations?.length ? `Khuyến nghị chính: ${analysis.recommendations.slice(0, 3).join('. ')}` : '',
    'Thông tin từ CareMate chỉ mang tính tham khảo và không thay thế tư vấn từ bác sĩ.',
  ];

  return parts.filter(Boolean).join(' ');
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
    case 'Red': return 'Đỏ';
    case 'Yellow': return 'Vàng';
    default: return 'Xanh';
  }
}

function toPpdLabel(level?: string) {
  switch (level) {
    case 'High': return 'Cao';
    case 'Moderate': return 'Trung bình';
    default: return 'Thấp';
  }
}

function toCategoryLabel(category?: string) {
  switch (category) {
    case 'VitalSigns': return 'Chỉ số sinh tồn';
    case 'Pain': return 'Đau';
    case 'Baby': return 'Sơ sinh';
    case 'Mental': return 'Tâm lý';
    case 'Wound': return 'Vết mổ/khâu';
    case 'Feeding': return 'Cho bú';
    case 'Bleeding': return 'Sản dịch/ra máu';
    case 'Medication': return 'Thuốc';
    default: return 'Tổng quát';
  }
}

function getTriageHeroClass(level: string) {
  switch (level) {
    case 'Emergency': return 'border-red-900 bg-red-700';
    case 'Red': return 'border-red-800 bg-red-600';
    case 'Yellow': return 'border-amber-700 bg-amber-600';
    default: return 'border-teal-900 bg-slate-950';
  }
}

function getTriagePanelClass(level: string) {
  switch (level) {
    case 'Emergency': return 'border-red-200 bg-red-50 text-red-950';
    case 'Red': return 'border-rose-200 bg-rose-50 text-rose-950';
    case 'Yellow': return 'border-amber-200 bg-amber-50 text-amber-950';
    default: return 'border-emerald-200 bg-emerald-50 text-emerald-950';
  }
}

function getTriageBadgeClass(level: string) {
  switch (level) {
    case 'Emergency': return 'border-red-200 bg-red-50 text-red-700';
    case 'Red': return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'Yellow': return 'border-amber-200 bg-amber-50 text-amber-700';
    default: return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
}

function getTriageBarClass(level: string) {
  switch (level) {
    case 'Emergency': return 'bg-red-700';
    case 'Red': return 'bg-rose-500';
    case 'Yellow': return 'bg-amber-400';
    default: return 'bg-emerald-500';
  }
}

function toOptionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toOptionLabel(value: string, options: Array<{ value: string; label: string }>) {
  return options.find((item) => item.value === value)?.label ?? value;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function buildPrintableReport(analysis: HealthAnalysisResponse | null, rows: string[][]) {
  const bodyRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>CareMate Health Report</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#0f172a}h1{margin:0 0 8px}p{line-height:1.6}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{border:1px solid #e2e8f0;padding:10px;text-align:left;font-size:12px}th{background:#f8fafc}.box{border:1px solid #cbd5e1;border-radius:12px;padding:16px;margin-top:16px}</style></head><body><h1>CareMate Health Report</h1><p>Ngày xuất: ${new Date().toLocaleString('vi-VN')}</p><div class="box"><strong>Triage:</strong> ${escapeHtml(toTriageLabel(analysis?.warningLevel))}<br><strong>Risk score:</strong> ${analysis?.riskScore ?? '--'}/100<p>${escapeHtml(analysis?.summary ?? 'Chưa có phân tích mới.')}</p></div><table><thead><tr><th>Thời gian</th><th>Đau</th><th>Vùng đau</th><th>Ngủ</th><th>Mood</th><th>Triage</th><th>Tóm tắt</th></tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char] ?? char);
}

export default HealthCheckInsPage;
