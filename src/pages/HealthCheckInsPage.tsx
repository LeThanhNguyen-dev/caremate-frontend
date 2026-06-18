import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import caremateApi from '../api/caremateApi';
import type { AnalyzeHealthCheckInPayload, CarePlanResponse, RecommendedCareServiceDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';

type FormState = {
  postpartumDay: string;
  deliveryMethod: string;
  sleepHours: string;
  painLevel: string;
  painLocation: string;
  temperatureCelsius: string;
  systolicBloodPressure: string;
  diastolicBloodPressure: string;
  bleedingLevel: string;
  incisionStatus: string;
  babyFeeding: string;
  babySleep: string;
  babyWetDiapers: string;
  babyActivity: string;
  milkStatus: string;
  mood: string;
  note: string;
};

const initialForm: FormState = {
  postpartumDay: '',
  deliveryMethod: '',
  sleepHours: '6',
  painLevel: '',
  painLocation: '',
  temperatureCelsius: '',
  systolicBloodPressure: '',
  diastolicBloodPressure: '',
  bleedingLevel: '',
  incisionStatus: '',
  babyFeeding: 'Normal',
  babySleep: 'Normal',
  babyWetDiapers: '',
  babyActivity: '',
  milkStatus: 'Normal',
  mood: 'Tired',
  note: '',
};

const HealthCheckInsPage = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(initialForm);
  const [carePlan, setCarePlan] = useState<CarePlanResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const payload = useMemo(() => buildPayload(form), [form]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const result = await caremateApi.recommendCarePlan({ checkIn: payload });
      setCarePlan(result);
      showToast('Đã tạo lộ trình chăm sóc cá nhân hóa.', 'success');
    } catch {
      showToast('Không thể tạo lộ trình lúc này. Vui lòng thử lại sau.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6faf8] px-4 py-6 lg:px-8">
      <div className="mx-auto grid max-w-[1680px] gap-5 xl:grid-cols-[minmax(680px,1fr)_460px]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-50 text-teal-700">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-950">Lộ trình chăm sóc của bạn</h1>
                <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                  Nhập tình trạng mẹ và bé để CareMate gợi ý gói dịch vụ chăm sóc phù hợp.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700">Không chẩn đoán, không kê đơn</span>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-6">
            <section className="grid gap-4 lg:grid-cols-3">
              <Field label="Ngày sau sinh">
                <NumberInput value={form.postpartumDay} min={0} max={365} unit="ngày" onChange={(postpartumDay) => setForm((prev) => ({ ...prev, postpartumDay }))} />
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
              <Field label="Mức đau hiện tại">
                <NumberInput value={form.painLevel} min={1} max={10} unit="/10" onChange={(painLevel) => setForm((prev) => ({ ...prev, painLevel }))} />
              </Field>
              <Field label="Vị trí đau">
                <Select value={form.painLocation} options={[
                  ['', 'Không rõ/chưa có'],
                  ['bụng dưới', 'Bụng dưới'],
                  ['vết mổ/khâu', 'Vết mổ/khâu'],
                  ['tầng sinh môn', 'Tầng sinh môn'],
                  ['ngực/sữa', 'Ngực/sữa'],
                  ['bắp chân', 'Bắp chân'],
                  ['lưng', 'Lưng'],
                ]} onChange={(painLocation) => setForm((prev) => ({ ...prev, painLocation }))} />
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
              <Field label="Vết mổ/vết khâu">
                <Select value={form.incisionStatus} options={[
                  ['', 'Không có/chưa rõ'],
                  ['Normal', 'Bình thường'],
                  ['Painful', 'Đau'],
                  ['RedSwollen', 'Sưng đỏ'],
                  ['Discharge', 'Chảy dịch'],
                ]} onChange={(incisionStatus) => setForm((prev) => ({ ...prev, incisionStatus }))} />
              </Field>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
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
            </section>

            <Field label="Ghi chú tự nhiên">
              <textarea
                value={form.note}
                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                rows={5}
                maxLength={1000}
                placeholder="Ví dụ: Mẹ hơi đau vết mổ, bé bú ít hơn hôm qua, muốn có y tá hỗ trợ tư thế cho bú..."
                className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-3 focus:ring-teal-50"
              />
            </Field>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold leading-5 text-slate-500">
                CareMate AI tạo lộ trình tham khảo. Nếu có dấu hiệu bất thường, hãy liên hệ bác sĩ hoặc y tá.
              </p>
              <button
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                <ClipboardDocumentCheckIcon className="h-4 w-4" />
                {submitting ? 'Đang tạo lộ trình...' : 'Tạo lộ trình chăm sóc'}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={<CalendarDaysIcon className="h-5 w-5" />} title="Kết quả lộ trình" />
            {carePlan ? (
              <CarePlanResult plan={carePlan} />
            ) : (
              <p className="mt-5 rounded-md border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
                Chưa có lộ trình. Hãy hoàn tất check-in để CareMate đề xuất kế hoạch phù hợp.
              </p>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
};

function CarePlanResult({ plan }: { plan: CarePlanResponse }) {
  return (
    <div className="mt-5 space-y-5">
      <SafetyNoticeCard level={plan.safetyLevel} notice={plan.safetyNotice} />
      <CarePlanSummaryCard plan={plan} />
      {plan.recommendedServices.length > 0 && <RecommendedServicesCard services={plan.recommendedServices} />}
      <p className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-xs font-semibold leading-6 text-amber-900">{plan.disclaimer}</p>
    </div>
  );
}



function SafetyNoticeCard({ level, notice }: { level: string; notice: string | null }) {
  if (level === 'normal' && !notice) return null;
  const urgent = level === 'urgent';
  return (
    <div className={`rounded-md border p-3 text-sm font-bold leading-6 ${urgent ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
      <div className="mb-1 flex items-center gap-2 font-black">
        <ExclamationTriangleIcon className="h-5 w-5" />
        {urgent ? 'Cần liên hệ y tế' : 'Cần chú ý thêm'}
      </div>
      {notice ?? 'Có một số dấu hiệu cần theo dõi sát hơn trong lộ trình chăm sóc.'}
    </div>
  );
}

function CarePlanSummaryCard({ plan }: { plan: CarePlanResponse }) {
  return (
    <div className="rounded-[1.25rem] border border-teal-100 bg-[linear-gradient(180deg,#f2fffb_0%,#ecfdf7_100%)] p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-teal-700">
        <SparklesIcon className="h-4 w-4" />
        Tóm tắt CareMate AI
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-7 text-slate-800">{plan.summary}</p>
    </div>
  );
}



function RecommendedServicesCard({ services }: { services: RecommendedCareServiceDto[] }) {
  return (
    <div>
      <SectionLabel>Gói dịch vụ phù hợp</SectionLabel>
      <div className="mt-3 grid gap-2">
        {services.map((service) => (
          <Link key={service.serviceId} to={`/services/${service.serviceId}`} className="rounded-[1.1rem] bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-teal-50">
            <div className="text-sm font-black text-slate-950">{service.name}</div>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{service.reason}</p>
            <div className="mt-3 inline-flex rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700">
              {service.sessionCount ? `${service.sessionCount} buổi • ` : ''}{service.estimatedPrice.toLocaleString('vi-VN')}đ
            </div>
          </Link>
        ))}
      </div>
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
  return <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500"><UserGroupIcon className="h-4 w-4" />{children}</div>;
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

function buildPayload(form: FormState): AnalyzeHealthCheckInPayload {
  const contextData: Record<string, string> = {};
  addContext(contextData, 'postpartumDay', form.postpartumDay);
  addContext(contextData, 'deliveryMethod', form.deliveryMethod);
  addContext(contextData, 'bleedingLevel', form.bleedingLevel);
  addContext(contextData, 'incisionStatus', form.incisionStatus);
  addContext(contextData, 'babyWetDiapers', form.babyWetDiapers);
  addContext(contextData, 'babyActivity', form.babyActivity);

  return {
    sleepHours: toNumber(form.sleepHours) ?? 0,
    painLevel: toNumber(form.painLevel),
    painLocation: emptyToNull(form.painLocation),
    symptoms: [],
    medicalHistory: [],
    contextData,
    systolicBloodPressure: toNumber(form.systolicBloodPressure),
    diastolicBloodPressure: toNumber(form.diastolicBloodPressure),
    temperatureCelsius: toNumber(form.temperatureCelsius),
    tookMedicationToday: false,
    mood: form.mood,
    milkStatus: form.milkStatus,
    babyFeeding: form.babyFeeding,
    babySleep: form.babySleep,
    note: emptyToNull(form.note),
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

export default HealthCheckInsPage;
