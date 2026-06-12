import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import caremateApi from '../api/caremateApi';
import type { AdminFinanceAnalyticsDto, PayOsWebhookLogDto, TransactionHistoryItemDto } from '../api/frontend-api-contract';

const transactionTypeLabel: Record<string, string> = {
  payment: 'Thanh toán',
  refund: 'Hoàn tiền',
  payout: 'Chi y tá'
};

const formatMoney = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`;
const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

const downloadCsv = (filename: string, rows: Array<Record<string, unknown>>) => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const statusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (['paid', 'completed', 'released', 'processed'].includes(normalized)) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (['failed', 'rejected', 'cancelled'].includes(normalized)) return 'bg-rose-50 text-rose-700 border-rose-100';
  return 'bg-amber-50 text-amber-700 border-amber-100';
};

const defaultFrom = () => {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return toDateInput(date);
};

const AdminFinance = () => {
  const [transactions, setTransactions] = useState<TransactionHistoryItemDto[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<PayOsWebhookLogDto[]>([]);
  const [analytics, setAnalytics] = useState<AdminFinanceAnalyticsDto | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionHistoryItemDto | null>(null);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(toDateInput(new Date()));
  const [webhookStatus, setWebhookStatus] = useState('failed');
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => ({
    payment: analytics?.grossRevenue ?? transactions.filter((item) => item.type === 'payment').reduce((sum, item) => sum + item.amount, 0),
    refund: analytics?.refundAmount ?? transactions.filter((item) => item.type === 'refund').reduce((sum, item) => sum + item.amount, 0),
    payout: analytics?.payoutAmount ?? transactions.filter((item) => item.type === 'payout').reduce((sum, item) => sum + item.amount, 0),
    platformFee: analytics?.platformFeeAmount ?? 0
  }), [analytics, transactions]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        type: type || undefined,
        status: status || undefined,
        userId: userId ? Number(userId) : undefined,
        bookingId: bookingId ? Number(bookingId) : undefined,
        from: from || undefined,
        to: to || undefined
      };
      const [transactionData, logData, analyticsData] = await Promise.all([
        caremateApi.getAdminTransactions(params),
        caremateApi.getPayOsWebhookLogs(webhookStatus || undefined),
        caremateApi.getAdminFinanceAnalytics({ from: from || undefined, to: to || undefined })
      ]);
      setTransactions(transactionData);
      setWebhookLogs(logData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load admin finance data', err);
      setError('Không tải được dữ liệu tài chính. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const retryWebhook = async (logId: string) => {
    setRetryingId(logId);
    setError(null);
    try {
      await caremateApi.retryPayOsWebhookLog(logId);
      await load();
    } catch (err) {
      console.error('Failed to retry PayOS webhook log', err);
      setError('Retry webhook chưa thành công. Kiểm tra cấu hình PayOS hoặc payment tương ứng.');
    } finally {
      setRetryingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-admin border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Tổng thu', value: formatMoney(totals.payment), icon: BanknotesIcon, className: 'text-emerald-600 bg-emerald-50' },
          { label: 'Hoàn tiền', value: formatMoney(totals.refund), icon: ArrowPathIcon, className: 'text-amber-600 bg-amber-50' },
          { label: 'Chi y tá', value: formatMoney(totals.payout), icon: CheckCircleIcon, className: 'text-blue-600 bg-blue-50' },
          { label: 'Webhook lỗi', value: analytics?.failedWebhookCount ?? 0, icon: ExclamationTriangleIcon, className: 'text-rose-600 bg-rose-50' }
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{item.value}</div>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.className}`}>
                <item.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xl font-black text-slate-900">Doanh thu theo ngày</div>
              <div className="mt-1 text-sm font-medium text-slate-500">Completion {analytics?.bookingCompletionRatePercent ?? 0}% • Refund rate {analytics?.refundRatePercent ?? 0}%</div>
            </div>
            <div className="text-right text-xs font-black uppercase tracking-widest text-slate-400">Platform fee {formatMoney(totals.platformFee)}</div>
          </div>
          <div className="mt-6 space-y-3">
            {(analytics?.dailyMetrics ?? []).slice(-14).map((metric) => {
              const max = Math.max(...(analytics?.dailyMetrics ?? []).map((item) => item.revenue), 1);
              return (
                <div key={metric.date} className="grid grid-cols-[84px_1fr_110px] items-center gap-3 text-sm font-bold">
                  <div className="text-slate-400">{new Date(metric.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-admin" style={{ width: `${Math.max(3, (metric.revenue / max) * 100)}%` }} />
                  </div>
                  <div className="text-right text-slate-900">{formatMoney(metric.revenue)}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="text-xl font-black text-slate-900">Top y tá theo doanh thu</div>
          <div className="mt-5 space-y-4">
            {(analytics?.nursePerformance ?? []).map((nurse) => (
              <div key={nurse.nurseId} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-slate-900">{nurse.nurseName}</div>
                    <div className="text-xs font-bold text-slate-400">{nurse.completedBookingCount} booking hoàn thành</div>
                  </div>
                  <div className="text-right text-sm font-black text-admin">{formatMoney(nurse.revenue)}</div>
                </div>
              </div>
            ))}
            {(analytics?.nursePerformance ?? []).length === 0 && <div className="py-8 text-center text-sm font-bold text-slate-400">Chưa có dữ liệu.</div>}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xl font-black text-slate-900">Lịch sử giao dịch</div>
            <div className="mt-1 text-sm font-medium text-slate-500">Lọc theo loại, trạng thái, user, booking và khoảng ngày.</div>
          </div>
          <button
            onClick={() => downloadCsv('caremate-transactions.csv', transactions)}
            className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-7">
          <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl border-slate-200 text-sm font-bold">
            <option value="">Tất cả loại</option>
            <option value="payment">Thanh toán</option>
            <option value="refund">Hoàn tiền</option>
            <option value="payout">Chi y tá</option>
          </select>
          <input value={status} onChange={(event) => setStatus(event.target.value)} placeholder="Status" className="rounded-xl border-slate-200 text-sm font-bold" />
          <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="User ID" inputMode="numeric" className="rounded-xl border-slate-200 text-sm font-bold" />
          <input value={bookingId} onChange={(event) => setBookingId(event.target.value)} placeholder="Booking ID" inputMode="numeric" className="rounded-xl border-slate-200 text-sm font-bold" />
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="rounded-xl border-slate-200 text-sm font-bold" />
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="rounded-xl border-slate-200 text-sm font-bold" />
          <button onClick={() => void load()} className="flex items-center justify-center gap-2 rounded-xl bg-admin px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white">
            <FunnelIcon className="h-4 w-4" />
            Lọc
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="py-4">Loại</th>
                <th>Booking</th>
                <th>Người dùng</th>
                <th>Dịch vụ</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((item) => (
                <tr key={item.id} className="text-sm font-bold text-slate-700">
                  <td className="py-4">{transactionTypeLabel[item.type] ?? item.type}</td>
                  <td>#{item.bookingId}</td>
                  <td>{item.userName ?? `User #${item.userId ?? '-'}`}</td>
                  <td>{item.serviceName ?? '-'}</td>
                  <td className="font-black text-slate-900">{formatMoney(item.amount)}</td>
                  <td><span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusClass(item.status)}`}>{item.status}</span></td>
                  <td>{new Date(item.createdAt).toLocaleString('vi-VN')}</td>
                  <td>
                    <button onClick={() => setSelectedTransaction(item)} className="rounded-xl bg-slate-50 p-2 text-slate-500 hover:bg-blue-50 hover:text-admin" title="Xem chi tiết">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && <div className="py-10 text-center text-sm font-bold text-slate-400">Không có giao dịch phù hợp.</div>}
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xl font-black text-slate-900">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
              PayOS webhook logs
            </div>
            <div className="mt-1 text-sm font-medium text-slate-500">Log webhook lỗi sẽ tự gửi notification realtime cho admin.</div>
          </div>
          <div className="flex gap-3">
            <select value={webhookStatus} onChange={(event) => setWebhookStatus(event.target.value)} className="rounded-xl border-slate-200 text-sm font-bold">
              <option value="">Tất cả log</option>
              <option value="failed">Lỗi/chưa xử lý</option>
              <option value="processed">Đã xử lý</option>
              <option value="unverified">Chưa verify</option>
            </select>
            <button onClick={() => downloadCsv('caremate-payos-webhooks.csv', webhookLogs)} className="rounded-xl border border-slate-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700">Export</button>
            <button onClick={() => void load()} className="rounded-xl border border-slate-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700">Tải lại</button>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {webhookLogs.map((log) => (
            <div key={log.id} className="rounded-xl border border-slate-100 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-sm font-black text-slate-900">Order {log.orderCode ?? '-'}</div>
                  <div className="mt-1 text-xs font-bold text-slate-400">{new Date(log.receivedAt).toLocaleString('vi-VN')} • Retry {log.retryCount}</div>
                  {log.processingError && <div className="mt-2 text-sm font-bold text-rose-600">{log.processingError}</div>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${log.isVerified ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                    {log.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${log.isProcessed ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-rose-100 bg-rose-50 text-rose-700'}`}>
                    {log.isProcessed ? 'Processed' : 'Pending'}
                  </span>
                  {!log.isProcessed && (
                    <button onClick={() => void retryWebhook(log.id)} disabled={retryingId === log.id} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-60">
                      <ArrowPathIcon className={`h-4 w-4 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {webhookLogs.length === 0 && <div className="py-10 text-center text-sm font-bold text-slate-400">Chưa có webhook log phù hợp.</div>}
        </div>
      </section>

      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-black text-slate-900">Chi tiết giao dịch</div>
                <div className="text-sm font-bold text-slate-400">{selectedTransaction.id}</div>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="rounded-xl bg-slate-50 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-3 text-sm font-bold">
              {Object.entries(selectedTransaction).map(([key, value]) => (
                <div key={key} className="grid grid-cols-[140px_1fr] gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="text-slate-400">{key}</div>
                  <div className="break-words text-slate-900">{String(value ?? '-')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinance;
