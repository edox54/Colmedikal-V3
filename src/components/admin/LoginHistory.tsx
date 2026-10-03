// Super Admin: who logged into the panel, when and from where (server: src/server/adminAccess.ts).
import { useEffect, useMemo, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { useColmedikal } from '../../context/ColmedikalContext';

type Entry = { email: string; name: string; role: string; at: string; ip: string; device: string };
const fmt = (v: string) => new Date(v).toLocaleString('es-EC', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function LoginHistory() {
  const { token } = useColmedikal();
  const [rows, setRows] = useState<Entry[] | null>(null);
  const [who, setWho] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    if (!token) return;
    setErr('');
    try {
      const r = await fetch('/api/admin/access/logins', { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error(j.message || 'No se pudo cargar el historial');
      setRows(j.data);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Error'); }
  };
  useEffect(() => { load(); }, [token]);

  const people = useMemo(() => [...new Map((rows || []).map(r => [r.email, r.name || r.email])).entries()], [rows]);
  const shown = (rows || []).filter(r => !who || r.email === who).slice(0, 200);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4" id="admin-login-history">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-black text-slate-900 dark:text-white">Historial de ingresos al panel</h4>
        </div>
        <div className="flex items-center gap-2">
          <select value={who} onChange={e => setWho(e.target.value)} aria-label="Filtrar por usuario" className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200">
            <option value="">Todos los usuarios</option>
            {people.map(([email, name]) => <option key={email} value={email}>{name}</option>)}
          </select>
          <button onClick={load} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 cursor-pointer" aria-label="Actualizar historial"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {err ? <p className="text-xs text-rose-600">{err}</p>
        : !rows ? <p className="text-xs text-slate-400">Cargando…</p>
        : shown.length === 0 ? <p className="text-xs text-slate-500">Aún no hay ingresos registrados. Se registran desde esta versión en adelante.</p>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2 pr-3">Fecha y hora</th><th className="py-2 pr-3">Usuario</th><th className="py-2 pr-3 hidden sm:table-cell">Rol</th><th className="py-2 pr-3 hidden md:table-cell">Dispositivo</th><th className="py-2 hidden md:table-cell">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {shown.map((r, i) => (
                  <tr key={`${r.at}-${i}`}>
                    <td className="py-2 pr-3 whitespace-nowrap tabular-nums text-slate-700 dark:text-slate-200">{fmt(r.at)}</td>
                    <td className="py-2 pr-3"><span className="font-bold text-slate-900 dark:text-white">{r.name || r.email}</span><span className="block text-[10px] font-mono text-slate-400">{r.email}</span></td>
                    <td className="py-2 pr-3 hidden sm:table-cell text-slate-600 dark:text-slate-300">{r.role}</td>
                    <td className="py-2 pr-3 hidden md:table-cell text-slate-600 dark:text-slate-300">{r.device}</td>
                    <td className="py-2 hidden md:table-cell font-mono text-[11px] text-slate-500">{r.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
