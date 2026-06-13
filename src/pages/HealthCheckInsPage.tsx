import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import caremateApi from '../api/caremateApi';
import type {
  AnalyzeHealthCheckInPayload,
  FollowUpQuestionDto,
  HealthAnalysisResponse,
  HealthCheckInFollowUpPreviewResponse,
  HealthCheckInHistoryDto,
  LatestHealthCheckInDto,
} from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';

type FormState = {
  postpartumDay: string;
  deliveryMethod: string;
  motherAge: string;
  medicalHistory: string[];
  sleepHours: string;
  painLevel: string;
  painLocation: string;
  painType: string;
  painTrend: string;
  temperatureCelsius: string;
  systolicBloodPressure: string;
  diastolicBloodPressure: string;
  bleedingLevel: string;
  incisionStatus: string;
  swellingLevel: string;
  urinationIssue: string;
  symptoms: string[];
  babyFeeding: string;
  babySleep: string;
  babyWetDiapers: string;
  babyActivity: string;
  milkStatus: string;
  mood: string;
  tookMedicationToday: boolean;
  medicationNote: string;
  note: string;
};

const steps = [
  { title: 'Nền tảng', caption: 'Ngày sau sinh, kiểu sinh, tiền sử' },
  { title: 'Triệu chứng mẹ', caption: 'Đau, huyết áp, nhiệt độ, sản dịch' },
  { title: 'Bé & cho bú', caption: 'Bú, ngủ, tã ướt, sữa mẹ' },
  { title: 'Xác nhận', caption: 'Ghi chú, câu hỏi bổ sung, phân tích' },
];

const symptomOptions = ['Sốt', 'Đau đầu', 'Chóng mặt', 'Buồn nôn', 'Khó thở', 'Đau ngực', 'Mờ mắt', 'Mệt nhiều'];
const historyOptions = ['Huyết áp', 'Tiểu đường', 'Tim mạch', 'Sinh mổ', 'Thiếu máu', 'Trầm cảm sau sinh'];

const initialForm: FormState = {
  postpartumDay: '',
  deliveryMethod: '',
  motherAge: '',
  medicalHistory: [],
  sleepHours: '6',
  painLevel: '',
  painLocation: '',
  painType: '',
  painTrend: '',
  temperatureCelsius: '',
  systolicBloodPressure: '',
  diastolicBloodPressure: '',
  bleedingLevel: '',
  incisionStatus: '',
  swellingLevel: '',
  urinationIssue: '',
  symptoms: [],
  babyFeeding: 'Normal',
  babySleep: 'Normal',
  babyWetDiapers: '',
  babyActivity: '',
  milkStatus: 'Normal',
  mood: 'Tired',
  tookMedicationToday: false,
  medicationNote: '',
  note: '',
};

const HealthCheckInsPage = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState(0);
  const [latest, setLatest] = useState<LatestHealthCheckInDto | null>(null);
  const [analysis, setAnalysis] = useState<HealthAnalysisResponse | null>(null);
  const [history, setHistory] = useState<HealthCheckInHistoryDto[]>([]);
  const [preview, setPreview] = useState<HealthCheckInFollowUpPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const payload = useMemo(() => buildPayload(form), [form]);
  const activeAnalysis = analysis ?? latest?.analysis ?? null;
  const activeTriage = normalizeTriage(activeAnalysis?.warningLevel ?? preview?.estimatedRiskPreview.warningLevel);
  const coverage = preview?.dataCoveragePercent ?? activeAnalysis?.dataCoveragePercent ?? 0;

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
        showToast('Không thể tải dữ liệu check-in.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [showToast]);

  useEffect(() => {
    if (step === 0 && !form.postpartumDay && !form.motherAge && !form.note) return;

    const timer = window.setTimeout(async () => {
      try {
        setPreviewing(true);
        const result = await caremateApi.previewHealthCheckInFollowUp(payload);
        setPreview(result);
      } catch {
        setPreview(null);
      } finally {
        setPreviewing(false);
      }
    }, 550);

    return () => window.clearTimeout(timer);
  }, [payload, step, form.postpartumDay, form.motherAge, form.note]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const result = await caremateApi.analyzeHealthCheckIn(payload);
      setAnalysis(result);
      setPreview(null);
      setStep(3);
      setHistory((prev) => [buildHistoryItem(result, form), ...prev].slice(0, 6));
      showToast('Đã phân tích check-in hôm nay.', 'success');
    } catch {
      showToast('Không thể phân tích lúc này. Vui lòng thử lại sau.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6faf8] px-4 py-6 lg:px-8">
      <div className="mx-auto grid max-w-[1680px] gap-5 xl:grid-cols-[minmax(680px,1fr)_430px]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-50 text-teal-700">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-950">AI check-in mẹ và bé</h1>
                <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                  Trả lời theo từng bước để CareMate đánh giá rủi ro, hỏi thêm dữ liệu còn thiếu và gợi ý chăm sóc an toàn.
                </p>
              </div>
            </div>
            <TriagePill level={activeTriage} />
          </div>

          <StepNav activeStep={step} onStep={setStep} />

          <form onSubmit={submit} className="mt-6">
            {step === 0 && <BackgroundStep form={form} setForm={setForm} />}
            {step === 1 && <MotherSymptomsStep form={form} setForm={setForm} />}
            {step === 2 && <BabyStep form={form} setForm={setForm} />}
            {step === 3 && (
              <ConfirmStep
                form={form}
                setForm={setForm}
                preview={preview}
                activeAnalysis={activeAnalysis}
                previewing={previewing}
              />
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <CoverageSummary percent={coverage} missingItems={preview?.missingDataItems ?? activeAnalysis?.missingDataItems ?? []} />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => setStep((value) => Math.max(0, value - 1))}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Quay lại
                </button>
                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-teal-700"
                  >
                    Tiếp tục
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    disabled={submitting}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-teal-700 disabled:opacity-50"
                  >
                    <ShieldCheckIcon className="h-4 w-4" />
                    {submitting ? 'Đang phân tích...' : 'Phân tích chính thức'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={<ChartBarSquareIcon className="h-5 w-5" />} title="Kết quả mới nhất" />
            {loading ? (
              <div className="mt-5 h-72 animate-pulse rounded-lg bg-slate-100" />
            ) : activeAnalysis ? (
              <ResultCard analysis={activeAnalysis} />
            ) : preview ? (
              <PreviewCard preview={preview} />
            ) : (
              <p className="mt-5 rounded-md border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
                Chưa có kết quả phân tích. Hãy hoàn tất check-in đầu tiên.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={<ClipboardDocumentCheckIcon className="h-5 w-5" />} title="Lịch sử gần đây" />
            <HistoryList items={history} />
          </section>
        </aside>
      </div>
    </main>
  );
};

function BackgroundStep({ form, setForm }: StepProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Field label="Ngày sau sinh">
        <NumberInput value={form.postpartumDay} min={0} max={365} unit="ngày" onChange={(postpartumDay) => setForm((prev) => ({ ...prev, postpartumDay }))} />
      </Field>
      <Field label="Tuổi mẹ">
        <NumberInput value={form.motherAge} min={12} max={70} unit="tuổi" onChange={(motherAge) => setForm((prev) => ({ ...prev, motherAge }))} />
      </Field>
      <Field label="Kiểu sinh">
        <Select value={form.deliveryMethod} options={[
          ['', 'Chưa chọn'],
          ['Vaginal', 'Sinh thường'],
          ['CSection', 'Sinh mổ'],
          ['Assisted', 'Sinh có hỗ trợ'],
        ]} onChange={(deliveryMethod) => setForm((prev) => ({ ...prev, deliveryMethod }))} />
      </Field>
      <Field label="Số giờ ngủ trong 24h">
        <NumberInput value={form.sleepHours} min={0} max={24} step={0.5} unit="giờ" onChange={(sleepHours) => setForm((prev) => ({ ...prev, sleepHours }))} />
      </Field>
      <div className="lg:col-span-2">
        <Field label="Tiền sử cần lưu ý">
          <ChipGroup values={form.medicalHistory} options={historyOptions} onChange={(medicalHistory) => setForm((prev) => ({ ...prev, medicalHistory }))} />
        </Field>
      </div>
    </div>
  );
}

function MotherSymptomsStep({ form, setForm }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <Field label="Mức đau">
          <NumberInput value={form.painLevel} min={1} max={10} unit="/10" onChange={(painLevel) => setForm((prev) => ({ ...prev, painLevel }))} />
        </Field>
        <Field label="Vị trí đau">
          <Select value={form.painLocation} options={[
            ['', 'Không rõ/chưa có'],
            ['bụng dưới', 'Bụng dưới'],
            ['bụng trên', 'Bụng trên'],
            ['vết mổ/khâu', 'Vết mổ/khâu'],
            ['tầng sinh môn', 'Tầng sinh môn'],
            ['ngực/sữa', 'Ngực/sữa'],
            ['bắp chân', 'Bắp chân'],
            ['lưng', 'Lưng'],
          ]} onChange={(painLocation) => setForm((prev) => ({ ...prev, painLocation }))} />
        </Field>
        <Field label="Diễn tiến đau">
          <Select value={form.painTrend} options={[
            ['', 'Chưa rõ'],
            ['Better', 'Đang giảm'],
            ['Stable', 'Ổn định'],
            ['Worse', 'Tăng lên'],
          ]} onChange={(painTrend) => setForm((prev) => ({ ...prev, painTrend }))} />
        </Field>
        <Field label="Kiểu đau">
          <Select value={form.painType} options={[
            ['', 'Chưa rõ'],
            ['âm ỉ', 'Âm ỉ'],
            ['nhói', 'Nhói'],
            ['quặn', 'Quặn'],
            ['rát', 'Rát'],
          ]} onChange={(painType) => setForm((prev) => ({ ...prev, painType }))} />
        </Field>
        <Field label="Nhiệt độ">
          <NumberInput value={form.temperatureCelsius} min={30} max={45} step={0.1} unit="°C" onChange={(temperatureCelsius) => setForm((prev) => ({ ...prev, temperatureCelsius }))} />
        </Field>
        <Field label="Huyết áp">
          <div className="grid grid-cols-2 gap-2">
            <NumberInput value={form.systolicBloodPressure} min={0} max={300} unit="SYS" onChange={(systolicBloodPressure) => setForm((prev) => ({ ...prev, systolicBloodPressure }))} />
            <NumberInput value={form.diastolicBloodPressure} min={0} max={220} unit="DIA" onChange={(diastolicBloodPressure) => setForm((prev) => ({ ...prev, diastolicBloodPressure }))} />
          </div>
        </Field>
        <Field label="Sản dịch/ra máu">
          <Select value={form.bleedingLevel} options={[
            ['', 'Chưa chọn'],
            ['Normal', 'Bình thường'],
            ['Light', 'Ít'],
            ['Heavy', 'Nhiều/bất thường'],
          ]} onChange={(bleedingLevel) => setForm((prev) => ({ ...prev, bleedingLevel }))} />
        </Field>
        <Field label="Vết mổ/khâu">
          <Select value={form.incisionStatus} options={[
            ['', 'Không có/chưa rõ'],
            ['Normal', 'Bình thường'],
            ['Painful', 'Đau'],
            ['RedSwollen', 'Sưng đỏ'],
            ['Discharge', 'Chảy dịch'],
          ]} onChange={(incisionStatus) => setForm((prev) => ({ ...prev, incisionStatus }))} />
        </Field>
        <Field label="Phù chân">
          <Select value={form.swellingLevel} options={[
            ['', 'Chưa chọn'],
            ['None', 'Không phù'],
            ['Mild', 'Nhẹ'],
            ['Severe', 'Nặng'],
          ]} onChange={(swellingLevel) => setForm((prev) => ({ ...prev, swellingLevel }))} />
        </Field>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Field label="Khó tiểu">
          <Select value={form.urinationIssue} options={[
            ['', 'Chưa chọn'],
            ['false', 'Không'],
            ['true', 'Có'],
          ]} onChange={(urinationIssue) => setForm((prev) => ({ ...prev, urinationIssue }))} />
        </Field>
        <Field label="Triệu chứng">
          <ChipGroup values={form.symptoms} options={symptomOptions} onChange={(symptoms) => setForm((prev) => ({ ...prev, symptoms }))} />
        </Field>
      </div>
    </div>
  );
}

function BabyStep({ form, setForm }: StepProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Field label="Tình trạng sữa">
        <Select value={form.milkStatus} options={[
          ['Normal', 'Bình thường'],
          ['Low', 'Ít sữa'],
          ['Painful', 'Đau/tắc sữa'],
          ['Improving', 'Đang cải thiện'],
        ]} onChange={(milkStatus) => setForm((prev) => ({ ...prev, milkStatus }))} />
      </Field>
      <Field label="Tâm trạng">
        <Select value={form.mood} options={[
          ['Calm', 'Bình tĩnh'],
          ['Tired', 'Mệt'],
          ['Stressed', 'Căng thẳng'],
          ['Anxious', 'Lo âu'],
          ['Overwhelmed', 'Quá tải'],
        ]} onChange={(mood) => setForm((prev) => ({ ...prev, mood }))} />
      </Field>
      <Field label="Bé bú">
        <Select value={form.babyFeeding} options={[
          ['Normal', 'Bú bình thường'],
          ['LessThanUsual', 'Bú ít hơn'],
          ['RefusesFeeding', 'Từ chối bú'],
          ['FrequentFeeding', 'Bú nhiều lần'],
        ]} onChange={(babyFeeding) => setForm((prev) => ({ ...prev, babyFeeding }))} />
      </Field>
      <Field label="Giấc ngủ của bé">
        <Select value={form.babySleep} options={[
          ['Normal', 'Ngủ bình thường'],
          ['CryingOften', 'Hay quấy khóc'],
          ['WakingFrequently', 'Thức giấc nhiều'],
          ['SleepingLonger', 'Ngủ lâu hơn'],
        ]} onChange={(babySleep) => setForm((prev) => ({ ...prev, babySleep }))} />
      </Field>
      <Field label="Tã ướt trong 24h">
        <NumberInput value={form.babyWetDiapers} min={0} max={20} unit="tã" onChange={(babyWetDiapers) => setForm((prev) => ({ ...prev, babyWetDiapers }))} />
      </Field>
      <Field label="Hoạt động của bé">
        <Select value={form.babyActivity} options={[
          ['', 'Chưa chọn'],
          ['Normal', 'Tỉnh táo bình thường'],
          ['Sleepy', 'Ngủ nhiều hơn'],
          ['Lethargic', 'Lừ đừ/yếu'],
          ['Irritable', 'Khó chịu/quấy nhiều'],
        ]} onChange={(babyActivity) => setForm((prev) => ({ ...prev, babyActivity }))} />
      </Field>
    </div>
  );
}

function ConfirmStep({ form, setForm, preview, activeAnalysis, previewing }: StepProps & {
  preview: HealthCheckInFollowUpPreviewResponse | null;
  activeAnalysis: HealthAnalysisResponse | null;
  previewing: boolean;
}) {
  const questions = preview?.followUpQuestions ?? activeAnalysis?.followUpQuestions ?? [];
  const missingItems = preview?.missingDataItems ?? activeAnalysis?.missingDataItems ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="space-y-4">
        <Field label="Ghi chú tự nhiên">
          <textarea
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            rows={7}
            maxLength={1000}
            placeholder="Ví dụ: Mẹ đau bụng dưới nhiều hơn hôm qua, bé bú ít, vết mổ hơi đỏ..."
            className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-3 focus:ring-teal-50"
          />
          <div className="mt-1 text-right text-[11px] font-bold text-slate-400">{form.note.length}/1000</div>
        </Field>
        <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <input
            type="checkbox"
            checked={form.tookMedicationToday}
            onChange={(event) => setForm((prev) => ({ ...prev, tookMedicationToday: event.target.checked }))}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span>
            <span className="block text-sm font-black text-slate-900">Mẹ đã dùng thuốc theo dặn dò hôm nay</span>
            <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">Không nhập tên thuốc nếu không cần thiết; AI không kê đơn hoặc thay đổi chỉ định.</span>
          </span>
        </label>
        <Field label="Ghi chú thuốc">
          <input
            value={form.medicationNote}
            maxLength={300}
            onChange={(event) => setForm((prev) => ({ ...prev, medicationNote: event.target.value }))}
            placeholder="Ví dụ: quên một liều sắt, đã uống thuốc bác sĩ kê..."
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-400 focus:ring-3 focus:ring-teal-50"
          />
        </Field>
      </div>

      <div className="space-y-4">
        <SafetyNotice level={normalizeTriage(preview?.estimatedRiskPreview.warningLevel ?? activeAnalysis?.warningLevel)} />
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Câu hỏi bổ sung</SectionLabel>
            {previewing && <span className="text-[11px] font-black text-teal-700">Đang cập nhật...</span>}
          </div>
          {questions.length > 0 ? (
            <div className="mt-3 space-y-3">
              {questions.slice(0, 6).map((question) => (
                <FollowUpAnswer key={question.key} question={question} form={form} setForm={setForm} />
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-md bg-teal-50 p-3 text-sm font-bold leading-6 text-teal-800">Dữ liệu hiện đủ tốt để phân tích.</p>
          )}
          {missingItems.length > 0 && (
            <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">Còn thiếu: {missingItems.slice(0, 6).join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

type StepProps = {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
};

function FollowUpAnswer({ question, form, setForm }: { question: FollowUpQuestionDto } & StepProps) {
  if (question.key === 'painLevel') {
    return <CompactQuestion question={question}><NumberInput value={form.painLevel} min={1} max={10} unit="/10" onChange={(painLevel) => setForm((prev) => ({ ...prev, painLevel }))} /></CompactQuestion>;
  }
  if (question.key === 'bloodPressure') {
    return (
      <CompactQuestion question={question}>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput value={form.systolicBloodPressure} min={0} max={300} unit="SYS" onChange={(systolicBloodPressure) => setForm((prev) => ({ ...prev, systolicBloodPressure }))} />
          <NumberInput value={form.diastolicBloodPressure} min={0} max={220} unit="DIA" onChange={(diastolicBloodPressure) => setForm((prev) => ({ ...prev, diastolicBloodPressure }))} />
        </div>
      </CompactQuestion>
    );
  }
  if (question.key === 'temperatureCelsius') {
    return <CompactQuestion question={question}><NumberInput value={form.temperatureCelsius} min={30} max={45} step={0.1} unit="°C" onChange={(temperatureCelsius) => setForm((prev) => ({ ...prev, temperatureCelsius }))} /></CompactQuestion>;
  }
  if (question.key === 'postpartumDay') {
    return <CompactQuestion question={question}><NumberInput value={form.postpartumDay} min={0} max={365} unit="ngày" onChange={(postpartumDay) => setForm((prev) => ({ ...prev, postpartumDay }))} /></CompactQuestion>;
  }
  if (question.key === 'bleedingLevel') {
    return <CompactQuestion question={question}><Select value={form.bleedingLevel} options={[['', 'Chọn'], ['Normal', 'Bình thường'], ['Light', 'Ít'], ['Heavy', 'Nhiều/bất thường']]} onChange={(bleedingLevel) => setForm((prev) => ({ ...prev, bleedingLevel }))} /></CompactQuestion>;
  }
  if (question.key === 'incisionStatus') {
    return <CompactQuestion question={question}><Select value={form.incisionStatus} options={[['', 'Chọn'], ['Normal', 'Bình thường'], ['Painful', 'Đau'], ['RedSwollen', 'Sưng đỏ'], ['Discharge', 'Chảy dịch']]} onChange={(incisionStatus) => setForm((prev) => ({ ...prev, incisionStatus }))} /></CompactQuestion>;
  }
  if (question.key === 'babyWetDiapers') {
    return <CompactQuestion question={question}><NumberInput value={form.babyWetDiapers} min={0} max={20} unit="tã" onChange={(babyWetDiapers) => setForm((prev) => ({ ...prev, babyWetDiapers }))} /></CompactQuestion>;
  }
  if (question.key === 'babyActivity') {
    return <CompactQuestion question={question}><Select value={form.babyActivity} options={[['', 'Chọn'], ['Normal', 'Tỉnh táo'], ['Sleepy', 'Ngủ nhiều'], ['Lethargic', 'Lừ đừ/yếu'], ['Irritable', 'Quấy nhiều']]} onChange={(babyActivity) => setForm((prev) => ({ ...prev, babyActivity }))} /></CompactQuestion>;
  }
  if (question.key === 'motherAge') {
    return <CompactQuestion question={question}><NumberInput value={form.motherAge} min={12} max={70} unit="tuổi" onChange={(motherAge) => setForm((prev) => ({ ...prev, motherAge }))} /></CompactQuestion>;
  }
  return <p className="rounded-md bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-700">{question.questionVi}</p>;
}

function CompactQuestion({ question, children }: { question: FollowUpQuestionDto; children: ReactNode }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="mb-2 text-xs font-black leading-5 text-slate-800">{question.questionVi}</div>
      {children}
    </div>
  );
}

function StepNav({ activeStep, onStep }: { activeStep: number; onStep: (step: number) => void }) {
  return (
    <div className="mt-5 grid gap-2 md:grid-cols-4">
      {steps.map((item, index) => (
        <button
          key={item.title}
          type="button"
          onClick={() => onStep(index)}
          className={`rounded-md border p-3 text-left transition ${activeStep === index ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-2">
            <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-black ${activeStep >= index ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
            <span className="text-sm font-black text-slate-950">{item.title}</span>
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{item.caption}</p>
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ value, min, max, step, unit, onChange }: { value: string; min: number; max: number; step?: number; unit?: string; onChange: (value: string) => void }) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 pr-14 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-400 focus:ring-3 focus:ring-teal-50"
      />
      {unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">{unit}</span>}
    </div>
  );
}

function Select({ value, options, onChange }: { value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-400 focus:ring-3 focus:ring-teal-50"
    >
      {options.map(([optionValue, label]) => <option key={`${optionValue}-${label}`} value={optionValue}>{label}</option>)}
    </select>
  );
}

function ChipGroup({ values, options, onChange }: { values: string[]; options: string[]; onChange: (values: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = values.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(active ? values.filter((item) => item !== option) : [...values, option])}
            className={`rounded-full px-3 py-2 text-xs font-black transition ${active ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function CoverageSummary({ percent, missingItems }: { percent: number; missingItems: string[] }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-3">
        <span className="text-xs font-black text-slate-700">Độ đầy đủ dữ liệu: {percent}%</span>
        {percent > 0 && percent < 50 && <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-black text-amber-700">Độ tin cậy thấp</span>}
      </div>
      <div className="mt-2 h-2 max-w-md overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
      {missingItems.length > 0 && <p className="mt-2 truncate text-xs font-semibold text-slate-500">Nên bổ sung: {missingItems.slice(0, 5).join(', ')}</p>}
    </div>
  );
}

function ResultCard({ analysis }: { analysis: HealthAnalysisResponse }) {
  const triage = normalizeTriage(analysis.warningLevel);
  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between">
        <TriagePill level={triage} />
        <span className="text-xs font-black text-slate-400">{analysis.engineVersion}</span>
      </div>
      <MetricGrid risk={analysis.riskScore} coverage={analysis.dataCoveragePercent} confidence={analysis.confidenceScore} />
      <SafetyNotice level={triage} />
      <p className="text-sm font-semibold leading-6 text-slate-700">{analysis.summary}</p>
      <InfoBlock title="Hành động ưu tiên" tone={triage}>{analysis.urgencyAction}</InfoBlock>
      <ListBlock title="Yếu tố rủi ro chính" items={analysis.riskFactors.slice(0, 4).map((item) => item.label)} />
      <ListBlock title="Khuyến nghị cá nhân hóa" items={analysis.recommendations} />
      <CarePlan items={analysis.carePlan} />
      <Nutrition items={analysis.nutritionGuidance} />
      <ServiceSuggestions services={analysis.suggestedServices} triage={triage} />
      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">{analysis.disclaimer}</p>
    </div>
  );
}

function PreviewCard({ preview }: { preview: HealthCheckInFollowUpPreviewResponse }) {
  const triage = normalizeTriage(preview.estimatedRiskPreview.warningLevel);
  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between">
        <TriagePill level={triage} />
        <span className="text-xs font-black text-slate-400">Preview</span>
      </div>
      <MetricGrid risk={preview.estimatedRiskPreview.riskScore} coverage={preview.dataCoveragePercent} confidence={preview.estimatedRiskPreview.confidenceScore} />
      <SafetyNotice level={triage} />
      <p className="text-sm font-semibold leading-6 text-slate-700">{preview.estimatedRiskPreview.summary}</p>
      <ListBlock title="Cần hỏi thêm" items={preview.followUpQuestions.slice(0, 4).map((item) => item.questionVi)} />
    </div>
  );
}

function MetricGrid({ risk, coverage, confidence }: { risk: number; coverage: number; confidence: number }) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3">
      <Metric label="Rủi ro" value={`${risk}/100`} />
      <Metric label="Dữ liệu" value={`${coverage}%`} />
      <Metric label="Tin cậy" value={`${confidence}%`} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-black text-slate-950">{value}</div>
    </div>
  );
}

function SafetyNotice({ level }: { level: string }) {
  if (level === 'Emergency' || level === 'Red') {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold leading-6 text-red-800">
        <div className="mb-1 flex items-center gap-2 font-black">
          <ExclamationTriangleIcon className="h-5 w-5" />
          Ưu tiên an toàn y tế
        </div>
        Có dấu hiệu cần được nhân viên y tế đánh giá trực tiếp. Không tự xử lý tại nhà nếu triệu chứng đang nặng lên.
      </div>
    );
  }

  return (
    <div className="rounded-md bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800">
      AI chỉ hỗ trợ tham khảo, không chẩn đoán, không kê đơn và không thay thế bác sĩ hoặc chuyên gia y tế.
    </div>
  );
}

function InfoBlock({ title, children, tone }: { title: string; children: ReactNode; tone: string }) {
  const className = tone === 'Emergency' || tone === 'Red'
    ? 'bg-red-50 text-red-900'
    : tone === 'Yellow'
      ? 'bg-amber-50 text-amber-900'
      : 'bg-teal-50 text-teal-900';
  return (
    <div className={`rounded-md p-3 ${className}`}>
      <SectionLabel>{title}</SectionLabel>
      <p className="mt-1 text-sm font-semibold leading-6">{children}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-2 grid gap-2">
        {items.slice(0, 4).map((item) => (
          <p key={item} className="rounded-md bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">{item}</p>
        ))}
      </div>
    </div>
  );
}

function CarePlan({ items }: { items: HealthAnalysisResponse['carePlan'] }) {
  if (!items.length) return null;
  return (
    <div>
      <SectionLabel>Kế hoạch chăm sóc</SectionLabel>
      <div className="mt-2 space-y-2">
        {items.slice(0, 3).map((item) => (
          <div key={`${item.timeframe}-${item.action}`} className="rounded-md bg-slate-50 p-3">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">{item.timeframe}</div>
            <div className="mt-1 text-sm font-black text-slate-900">{item.action}</div>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{item.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Nutrition({ items }: { items: HealthAnalysisResponse['nutritionGuidance'] }) {
  if (!items.length) return null;
  return (
    <div>
      <SectionLabel>Dinh dưỡng gợi ý</SectionLabel>
      <div className="mt-2 grid gap-2">
        {items.slice(0, 3).map((item) => (
          <div key={item.category} className="rounded-md bg-emerald-50 p-3 text-sm font-semibold leading-6 text-emerald-900">
            <span className="font-black">{item.category}: </span>{item.tip}
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceSuggestions({ services, triage }: { services: HealthAnalysisResponse['suggestedServices']; triage: string }) {
  if (triage === 'Emergency' || triage === 'Red') {
    return (
      <div className="rounded-md border border-red-100 bg-white p-3">
        <SectionLabel>Hỗ trợ sau đánh giá y tế</SectionLabel>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">Dịch vụ CareMate có thể hỗ trợ chăm sóc sau khi mẹ đã được bác sĩ hoặc cơ sở y tế đánh giá.</p>
      </div>
    );
  }

  if (!services.length) {
    return (
      <Link to="/services" className="inline-flex h-10 items-center justify-center rounded-md bg-teal-600 px-4 text-sm font-black text-white transition hover:bg-teal-700">
        Xem dịch vụ phù hợp
      </Link>
    );
  }

  return (
    <div>
      <SectionLabel>Dịch vụ gợi ý</SectionLabel>
      <div className="mt-2 grid gap-2">
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
    <div className="mt-4 space-y-3">
      {items.map((item) => {
        const triage = normalizeTriage(item.analysis?.warningLevel);
        return (
          <article key={item.checkInId} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-950">{formatDateTime(item.createdAt)}</div>
                <div className="mt-1 text-xs font-bold text-slate-500">Ngủ {item.sleepHours}h</div>
              </div>
              <TriagePill level={triage} compact />
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

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-teal-50 text-teal-700">{icon}</div>
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{children}</div>;
}

function TriagePill({ level, compact = false }: { level?: string; compact?: boolean }) {
  const normalized = normalizeTriage(level);
  const icon = normalized === 'Green' ? <CheckCircleIcon className="h-4 w-4" /> : <ExclamationTriangleIcon className="h-4 w-4" />;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-black ${compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} ${getBadgeClass(normalized)}`}>
      {icon}
      {toTriageLabel(normalized)}
    </span>
  );
}

function buildPayload(form: FormState): AnalyzeHealthCheckInPayload {
  const contextData: Record<string, string> = {};
  addContext(contextData, 'postpartumDay', form.postpartumDay);
  addContext(contextData, 'deliveryMethod', form.deliveryMethod);
  addContext(contextData, 'bleedingLevel', form.bleedingLevel);
  addContext(contextData, 'incisionStatus', form.incisionStatus);
  addContext(contextData, 'swellingLevel', form.swellingLevel);
  addContext(contextData, 'urinationIssue', form.urinationIssue);
  addContext(contextData, 'babyWetDiapers', form.babyWetDiapers);
  addContext(contextData, 'babyActivity', form.babyActivity);

  return {
    sleepHours: toNumber(form.sleepHours) ?? 0,
    painLevel: toNumber(form.painLevel),
    painLocation: emptyToNull(form.painLocation),
    painType: emptyToNull(form.painType),
    painTrend: emptyToNull(form.painTrend),
    symptoms: form.symptoms,
    medicalHistory: form.medicalHistory,
    contextData,
    motherAge: toNumber(form.motherAge),
    systolicBloodPressure: toNumber(form.systolicBloodPressure),
    diastolicBloodPressure: toNumber(form.diastolicBloodPressure),
    temperatureCelsius: toNumber(form.temperatureCelsius),
    tookMedicationToday: form.tookMedicationToday,
    medicationNote: emptyToNull(form.medicationNote),
    mood: form.mood,
    milkStatus: form.milkStatus,
    babyFeeding: form.babyFeeding,
    babySleep: form.babySleep,
    note: emptyToNull(form.note),
  };
}

function buildHistoryItem(result: HealthAnalysisResponse, form: FormState): HealthCheckInHistoryDto {
  return {
    checkInId: result.checkInId,
    createdAt: new Date().toISOString(),
    sleepHours: toNumber(form.sleepHours) ?? 0,
    painLevel: toNumber(form.painLevel),
    painLocation: emptyToNull(form.painLocation),
    painType: emptyToNull(form.painType),
    painDuration: null,
    painTrend: emptyToNull(form.painTrend),
    symptoms: form.symptoms,
    medicalHistory: form.medicalHistory,
    contextData: buildPayload(form).contextData ?? {},
    motherAge: toNumber(form.motherAge),
    systolicBloodPressure: toNumber(form.systolicBloodPressure),
    diastolicBloodPressure: toNumber(form.diastolicBloodPressure),
    temperatureCelsius: toNumber(form.temperatureCelsius),
    tookMedicationToday: form.tookMedicationToday,
    medicationNote: emptyToNull(form.medicationNote),
    mood: form.mood,
    milkStatus: form.milkStatus,
    babyFeeding: form.babyFeeding,
    babySleep: form.babySleep,
    note: emptyToNull(form.note),
    analysis: result,
  };
}

function addContext(target: Record<string, string>, key: string, value: string) {
  if (value.trim()) target[key] = value.trim();
}

function toNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
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
