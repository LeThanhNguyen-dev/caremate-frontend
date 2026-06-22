import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import caremateApi from '../api/caremateApi';
import type {
  AnalyzeHealthCheckInPayload,
  CarePlanResponse,
  RecommendedCareServiceDto,
} from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(initialForm);
  const [carePlan, setCarePlan] = useState<CarePlanResponse | null>(null);
  const [carePlanError, setCarePlanError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const payload = useMemo(() => buildPayload(form), [form]);

  const runRecommendation = async () => {
    try {
      setSubmitting(true);
      setCarePlanError(null);
      const result = await caremateApi.recommendCarePlan({ checkIn: payload });
      setCarePlan(result);
      setCarePlanError(null);
      showToast(t('healthCheckins.toastSuccess'), 'success');
    } catch (error) {
      setCarePlan(null);
      setCarePlanError(getCarePlanErrorMessage(error, t));
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await runRecommendation();
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
                <h1 className="text-xl font-black text-slate-950">{t('healthCheckins.title')}</h1>
                <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                  {t('healthCheckins.subtitle')}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700">
              {t('healthCheckins.badge')}
            </span>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-6">
            <section className="grid gap-4 lg:grid-cols-3">
              <Field label={t('healthCheckins.fields.postpartumDay')}>
                <NumberInput value={form.postpartumDay} min={0} max={365} unit={t('healthCheckins.fields.dayUnit')} onChange={(postpartumDay) => setForm((prev) => ({ ...prev, postpartumDay }))} />
              </Field>
              <Field label={t('healthCheckins.fields.deliveryMethod')}>
                <Select
                  value={form.deliveryMethod}
                  options={[
                    ['', t('healthCheckins.fields.deliveryMethods.unselected')],
                    ['Vaginal', t('healthCheckins.fields.deliveryMethods.vaginal')],
                    ['CSection', t('healthCheckins.fields.deliveryMethods.csection')],
                    ['Assisted', t('healthCheckins.fields.deliveryMethods.assisted')],
                  ]}
                  onChange={(deliveryMethod) => setForm((prev) => ({ ...prev, deliveryMethod }))}
                />
              </Field>
              <Field label={t('healthCheckins.fields.sleepHours')}>
                <NumberInput value={form.sleepHours} min={0} max={24} step={0.5} unit={t('healthCheckins.fields.hourUnit')} onChange={(sleepHours) => setForm((prev) => ({ ...prev, sleepHours }))} />
              </Field>
              <Field label={t('healthCheckins.fields.painLevel')}>
                <NumberInput value={form.painLevel} min={1} max={10} unit="/10" onChange={(painLevel) => setForm((prev) => ({ ...prev, painLevel }))} />
              </Field>
              <Field label={t('healthCheckins.fields.painLocation')}>
                <Select
                  value={form.painLocation}
                  options={[
                    ['', t('healthCheckins.fields.painLocations.unknown')],
                    ['bung duoi', t('healthCheckins.fields.painLocations.lowerAbdomen')],
                    ['vet mo/khau', t('healthCheckins.fields.painLocations.incision')],
                    ['tang sinh mon', t('healthCheckins.fields.painLocations.perineum')],
                    ['nguc/sua', t('healthCheckins.fields.painLocations.breast')],
                    ['bap chan', t('healthCheckins.fields.painLocations.calf')],
                    ['lung', t('healthCheckins.fields.painLocations.back')],
                  ]}
                  onChange={(painLocation) => setForm((prev) => ({ ...prev, painLocation }))}
                />
              </Field>
              <Field label={t('healthCheckins.fields.temperature')}>
                <NumberInput value={form.temperatureCelsius} min={30} max={45} step={0.1} unit="°C" onChange={(temperatureCelsius) => setForm((prev) => ({ ...prev, temperatureCelsius }))} />
              </Field>
              <Field label={t('healthCheckins.fields.bloodPressure')}>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput value={form.systolicBloodPressure} min={0} max={300} unit="SYS" onChange={(systolicBloodPressure) => setForm((prev) => ({ ...prev, systolicBloodPressure }))} />
                  <NumberInput value={form.diastolicBloodPressure} min={0} max={220} unit="DIA" onChange={(diastolicBloodPressure) => setForm((prev) => ({ ...prev, diastolicBloodPressure }))} />
                </div>
              </Field>
              <Field label={t('healthCheckins.fields.bleedingLevel')}>
                <Select
                  value={form.bleedingLevel}
                  options={[
                    ['', t('healthCheckins.fields.bleedingLevels.unselected')],
                    ['Normal', t('healthCheckins.fields.bleedingLevels.normal')],
                    ['Light', t('healthCheckins.fields.bleedingLevels.light')],
                    ['Heavy', t('healthCheckins.fields.bleedingLevels.heavy')],
                  ]}
                  onChange={(bleedingLevel) => setForm((prev) => ({ ...prev, bleedingLevel }))}
                />
              </Field>
              <Field label={t('healthCheckins.fields.incisionStatus')}>
                <Select
                  value={form.incisionStatus}
                  options={[
                    ['', t('healthCheckins.fields.incisionStatuses.unknown')],
                    ['Normal', t('healthCheckins.fields.incisionStatuses.normal')],
                    ['Painful', t('healthCheckins.fields.incisionStatuses.painful')],
                    ['RedSwollen', t('healthCheckins.fields.incisionStatuses.redSwollen')],
                    ['Discharge', t('healthCheckins.fields.incisionStatuses.discharge')],
                  ]}
                  onChange={(incisionStatus) => setForm((prev) => ({ ...prev, incisionStatus }))}
                />
              </Field>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Field label={t('healthCheckins.fields.milkStatus')}>
                <Select
                  value={form.milkStatus}
                  options={[
                    ['Normal', t('healthCheckins.fields.milkStatuses.normal')],
                    ['Low', t('healthCheckins.fields.milkStatuses.low')],
                    ['Painful', t('healthCheckins.fields.milkStatuses.painful')],
                    ['Improving', t('healthCheckins.fields.milkStatuses.improving')],
                  ]}
                  onChange={(milkStatus) => setForm((prev) => ({ ...prev, milkStatus }))}
                />
              </Field>
              <Field label={t('healthCheckins.fields.mood')}>
                <Select
                  value={form.mood}
                  options={[
                    ['Calm', t('healthCheckins.fields.moods.calm')],
                    ['Tired', t('healthCheckins.fields.moods.tired')],
                    ['Stressed', t('healthCheckins.fields.moods.stressed')],
                    ['Anxious', t('healthCheckins.fields.moods.anxious')],
                    ['Overwhelmed', t('healthCheckins.fields.moods.overwhelmed')],
                  ]}
                  onChange={(mood) => setForm((prev) => ({ ...prev, mood }))}
                />
              </Field>
              <Field label={t('healthCheckins.fields.babyFeeding')}>
                <Select
                  value={form.babyFeeding}
                  options={[
                    ['Normal', t('healthCheckins.fields.babyFeedings.normal')],
                    ['LessThanUsual', t('healthCheckins.fields.babyFeedings.less')],
                    ['RefusesFeeding', t('healthCheckins.fields.babyFeedings.refuses')],
                    ['FrequentFeeding', t('healthCheckins.fields.babyFeedings.frequent')],
                  ]}
                  onChange={(babyFeeding) => setForm((prev) => ({ ...prev, babyFeeding }))}
                />
              </Field>
              <Field label={t('healthCheckins.fields.babySleep')}>
                <Select
                  value={form.babySleep}
                  options={[
                    ['Normal', t('healthCheckins.fields.babySleeps.normal')],
                    ['CryingOften', t('healthCheckins.fields.babySleeps.crying')],
                    ['WakingFrequently', t('healthCheckins.fields.babySleeps.waking')],
                    ['SleepingLonger', t('healthCheckins.fields.babySleeps.longer')],
                  ]}
                  onChange={(babySleep) => setForm((prev) => ({ ...prev, babySleep }))}
                />
              </Field>
              <Field label={t('healthCheckins.fields.babyWetDiapers')}>
                <NumberInput value={form.babyWetDiapers} min={0} max={20} unit={t('healthCheckins.fields.diaperUnit')} onChange={(babyWetDiapers) => setForm((prev) => ({ ...prev, babyWetDiapers }))} />
              </Field>
              <Field label={t('healthCheckins.fields.babyActivity')}>
                <Select
                  value={form.babyActivity}
                  options={[
                    ['', t('healthCheckins.fields.babyActivities.unselected')],
                    ['Normal', t('healthCheckins.fields.babyActivities.normal')],
                    ['Sleepy', t('healthCheckins.fields.babyActivities.sleepy')],
                    ['Lethargic', t('healthCheckins.fields.babyActivities.lethargic')],
                    ['Irritable', t('healthCheckins.fields.babyActivities.irritable')],
                  ]}
                  onChange={(babyActivity) => setForm((prev) => ({ ...prev, babyActivity }))}
                />
              </Field>
            </section>

            <Field label={t('healthCheckins.fields.note')}>
              <textarea
                value={form.note}
                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                rows={5}
                maxLength={1000}
                placeholder={t('healthCheckins.fields.notePlaceholder')}
                className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-3 focus:ring-teal-50"
              />
            </Field>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold leading-5 text-slate-500">
                {t('healthCheckins.disclaimerAI')}
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                <ClipboardDocumentCheckIcon className="h-4 w-4" />
                {submitting ? t('healthCheckins.btnSubmitting') : t('healthCheckins.btnSubmit')}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={<CalendarDaysIcon className="h-5 w-5" />} title={t('healthCheckins.resultTitle')} />
            {carePlanError ? (
              <CarePlanErrorCard message={carePlanError} submitting={submitting} onRetry={runRecommendation} t={t} />
            ) : carePlan ? (
              <CarePlanResult plan={carePlan} t={t} />
            ) : (
              <p className="mt-5 rounded-md border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
                {t('healthCheckins.resultEmpty')}
              </p>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
};

function CarePlanResult({ plan, t }: { plan: CarePlanResponse; t: any }) {
  return (
    <div className="mt-5 space-y-5">
      <SafetyNoticeCard level={plan.safetyLevel} notice={plan.safetyNotice} t={t} />
      <CarePlanSummaryCard plan={plan} t={t} />
      {plan.recommendedServices.length > 0 && <RecommendedServicesCard services={plan.recommendedServices} t={t} />}
      <p className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-xs font-semibold leading-6 text-amber-900">
        {plan.disclaimer}
      </p>
    </div>
  );
}

function CarePlanErrorCard({
  message,
  submitting,
  onRetry,
  t,
}: {
  message: string;
  submitting: boolean;
  onRetry: () => Promise<void>;
  t: any;
}) {
  return (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-800">
        <ExclamationTriangleIcon className="h-4 w-4" />
        {t('healthCheckins.errorTitle')}
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-amber-950">{message}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        disabled={submitting}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-amber-900 px-4 text-sm font-black text-white transition hover:bg-amber-800 disabled:opacity-50"
      >
        {submitting ? t('healthCheckins.btnRetrying') : t('healthCheckins.btnRetry')}
      </button>
    </div>
  );
}

function SafetyNoticeCard({ level, notice, t }: { level: string; notice: string | null; t: any }) {
  if (level === 'normal' && !notice) return null;
  const urgent = level === 'urgent';

  return (
    <div
      className={`rounded-md border p-3 text-sm font-bold leading-6 ${urgent ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}
    >
      <div className="mb-1 flex items-center gap-2 font-black">
        <ExclamationTriangleIcon className="h-5 w-5" />
        {urgent ? t('healthCheckins.safetyUrgent') : t('healthCheckins.safetyAttention')}
      </div>
      {notice ?? t('healthCheckins.safetyDefault')}
    </div>
  );
}

function CarePlanSummaryCard({ plan, t }: { plan: CarePlanResponse; t: any }) {
  return (
    <div className="rounded-xl border border-teal-100 bg-[linear-gradient(180deg,#f2fffb_0%,#ecfdf7_100%)] p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-teal-700">
        <SparklesIcon className="h-4 w-4" />
        {t('healthCheckins.summaryTitle')}
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-7 text-slate-800">{plan.summary}</p>
    </div>
  );
}

function RecommendedServicesCard({ services, t }: { services: RecommendedCareServiceDto[]; t: any }) {
  return (
    <div>
      <SectionLabel>{t('healthCheckins.recommendedTitle')}</SectionLabel>
      <div className="mt-3 grid gap-2">
        {services.map((service) => (
          <Link
            key={service.serviceId}
            to={`/services/${service.serviceId}`}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-teal-50"
          >
            <div className="text-sm font-black text-slate-950">{service.name}</div>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{service.reason}</p>
            <div className="mt-3 inline-flex rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700">
              {service.sessionCount ? `${service.sessionCount} ${t('healthCheckins.sessionLabel')}` : ''}
              {service.estimatedPrice.toLocaleString('vi-VN')}đ
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
  return (
    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
      <UserGroupIcon className="h-4 w-4" />
      {children}
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

function NumberInput({
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  value: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: string) => void;
}) {
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

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-400 focus:ring-3 focus:ring-teal-50"
    >
      {options.map(([optionValue, label]) => (
        <option key={`${optionValue}-${label}`} value={optionValue}>
          {label}
        </option>
      ))}
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
  if (value.trim()) {
    target[key] = value.trim();
  }
}

function toNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getCarePlanErrorMessage(error: unknown, t: any): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message?.trim();
    if (message) {
      return message;
    }
  }

  return t('healthCheckins.errorMessage');
}

export default HealthCheckInsPage;
