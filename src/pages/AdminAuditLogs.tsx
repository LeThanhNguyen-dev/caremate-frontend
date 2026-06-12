import { useEffect, useState } from 'react';
import { ArrowDownTrayIcon, ArrowPathIcon, ClipboardDocumentListIcon, FunnelIcon } from '@heroicons/react/24/outline';
import caremateApi from '../api/caremateApi';
import type { AuditLogDto } from '../api/frontend-api-contract';

const methodClass = (method: string) => {
  if (method === 'POST') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (method === 'DELETE') return 'bg-rose-50 text-rose-700 border-rose-100';
  if (method === 'PUT' || method === 'PATCH') return 'bg-blue-50 text-blue-700 border-blue-100';
  return 'bg-slate-50 text-slate-700 border-slate-100';
};

const statusClass = (statusCode: number) => {
  if (statusCode >= 200 && statusCode < 300) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
  if (statusCode >= 400) return 'text-rose-700 bg-rose-50 border-rose-100';
  return 'text-amber-700 bg-amber-50 border-amber-100';
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [actorUserId, setActorUserId] = useState('');
  const [path, setPath] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await caremateApi.getAdminAuditLogs({
        actorUserId: actorUserId ? Number(actorUserId) : undefined,
        path: path || undefined,
        from: from || undefined,
        to: to || undefined
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
      setError('Không tải được audit logs. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const downloadCsv = () => {
    if (logs.length === 0) return;
    const headers = Object.keys(logs[0]);
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [headers.join(','), ...logs.map((row) => headers.map((header) => escape(row[header as keyof AuditLogDto])).join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'caremate-audit-logs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-admin border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">{error}</div>}

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3 text-xl font-black text-slate-900">
              <ClipboardDocumentListIcon className="h-7 w-7 text-admin" />
              Audit logs
            </div>
            <div className="mt-1 text-sm font-medium text-slate-500">Theo dõi thao tác thay đổi dữ liệu trong khu vực admin.</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              value={actorUserId}
              onChange={(event) => setActorUserId(event.target.value)}
              placeholder="Actor user ID"
              inputMode="numeric"
              className="rounded-xl border-slate-200 text-sm font-bold"
            />
            <input
              value={path}
              onChange={(event) => setPath(event.target.value)}
              placeholder="/api/admin/..."
              className="min-w-64 rounded-xl border-slate-200 text-sm font-bold"
            />
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="rounded-xl border-slate-200 text-sm font-bold" />
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="rounded-xl border-slate-200 text-sm font-bold" />
            <button onClick={() => void load()} className="flex items-center gap-2 rounded-xl bg-admin px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white">
              <FunnelIcon className="h-4 w-4" />
              Lọc
            </button>
            <button onClick={downloadCsv} className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </button>
            <button onClick={() => void load()} className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700">
              <ArrowPathIcon className="h-4 w-4" />
              Tải lại
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="py-4">Thời gian</th>
                <th>Actor</th>
                <th>Method</th>
                <th>Path</th>
                <th>Status</th>
                <th>IP</th>
                <th>User agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id} className="text-sm font-bold text-slate-700">
                  <td className="py-4">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                  <td>{log.actorName ?? `User #${log.actorUserId ?? '-'}`}</td>
                  <td>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${methodClass(log.method)}`}>{log.method}</span>
                  </td>
                  <td className="max-w-sm truncate font-mono text-xs">{log.path}{log.queryString ?? ''}</td>
                  <td>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusClass(log.statusCode)}`}>{log.statusCode}</span>
                  </td>
                  <td>{log.ipAddress ?? '-'}</td>
                  <td className="max-w-xs truncate text-xs text-slate-400">{log.userAgent ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <div className="py-10 text-center text-sm font-bold text-slate-400">Chưa có audit log phù hợp.</div>}
        </div>
      </section>
    </div>
  );
};

export default AdminAuditLogs;
