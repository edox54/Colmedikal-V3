// Admin: review self-service reembolsos / preautorizaciones submitted from
// Mi Colmedikal. Replaces the old Refunds/Auths tabs (no documents, fake
// uploads, status-only); legacy API records are still listed at the bottom.
import { useMemo, useState } from 'react';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { useColmedikal } from '../../../context/ColmedikalContext';
import { CLAIM_LABEL, CLAIM_SLA_HOURS, CLAIM_STATUSES, openHours, slaLight, type Claim, type ClaimStatus, type ClaimType } from '../../../data/claims';
import StaffClaimUpload from '../claims/StaffClaimUpload';
import { StatusPill } from '../../portal/ClaimsPanel';
import { EmptyState, cx, inputCls } from '../crm/ui';
import ClaimReview from '../claims/ClaimReview';
import LegacyRequests from '../claims/LegacyRequests';
import type { AdminSharedProps } from '../adminTypes';

type Props = Pick<AdminSharedProps, 'refunds' | 'authorizations' | 'updateRefundStatus' | 'updateAuthorizationStatus'> & { type: ClaimType };
const OPEN: ClaimStatus[] = ['Recibida', 'En revisión', 'Documentos pendientes'];
const LIGHT = { verde: 'bg-emerald-500', amarillo: 'bg-amber-400', rojo: 'bg-rose-600' } as const;
const LIGHT_LABEL = { verde: 'En tiempo', amarillo: 'Por vencer', rojo: `Vencida (+${CLAIM_SLA_HOURS} h)` } as const;
export function SlaBadge({ c }: { c: Claim }) {
  const light = slaLight(c);
  if (!light) return <span className="text-[10px] text-slate-400">{c.status === 'Documentos pendientes' ? 'Esperando cliente' : '—'}</span>;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold text-slate-700 dark:text-slate-200" title={LIGHT_LABEL[light]}>
      <span className={cx('h-2.5 w-2.5 rounded-full', LIGHT[light])} aria-hidden="true" />{Math.floor(openHours(c))} h<span className="sr-only"> — {LIGHT_LABEL[light]}</span>
    </span>
  );
}
const fmt = (v?: string) => (v ? new Date(v).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: '2-digit' }) : '—');

export default function ClaimsSection({ type, ...legacy }: Props) {
  const { claims, refreshClaims } = useColmedikal();
  const [status, setStatus] = useState<ClaimStatus | 'abiertas' | ''>('abiertas');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [filing, setFiling] = useState(false);

  const mine = useMemo(() => (claims as Claim[]).filter(c => c.type === type), [claims, type]);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return mine
      .filter(c => !status || (status === 'abiertas' ? OPEN.includes(c.status) : c.status === status))
      .filter(c => !s || [c.id, c.form.titular, c.form.paciente, c.form.cedula, c.form.correo, c.form.hospital].some(v => v?.toLowerCase().includes(s)));
  }, [mine, status, q]);
  const count = (s: ClaimStatus) => mine.filter(c => c.status === s).length;
  const pendingAmount = mine.filter(c => OPEN.includes(c.status)).reduce((a, c) => a + c.totalRequested, 0);
  const open = mine.find(c => c.id === openId);
  const lights = { verde: 0, amarillo: 0, rojo: 0 };
  for (const c of mine) { const l = slaLight(c); if (l) lights[l]++; }

  if (filing) return <StaffClaimUpload type={type} onClose={created => { setFiling(false); if (created) { refreshClaims(); setOpenId(created.id); } }} />;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-950 dark:text-white">{CLAIM_LABEL[type]}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Solicitudes enviadas por los afiliados desde Mi Colmedikal. {mine.filter(c => OPEN.includes(c.status)).length} abiertas · ${pendingAmount.toFixed(2)} {type === 'reembolso' ? 'solicitados' : 'en presupuestos'} por resolver.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFiling(true)} className="flex items-center gap-1.5 rounded-xl bg-[#0C4169] px-3 py-2 text-[11px] font-bold text-white hover:bg-slate-900 cursor-pointer"><Plus className="h-3.5 w-3.5" />Cargar solicitud manual</button>
          <button onClick={() => refreshClaims()} className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 cursor-pointer"><RefreshCw className="h-3.5 w-3.5" />Actualizar</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300" aria-label="Semáforo de tiempo de respuesta">
        <span className="font-bold uppercase tracking-wide text-slate-500">Semáforo {CLAIM_SLA_HOURS} h</span>
        {(['verde', 'amarillo', 'rojo'] as const).map(l => (
          <span key={l} className="inline-flex items-center gap-1.5"><span className={cx('h-2.5 w-2.5 rounded-full', LIGHT[l])} aria-hidden="true" /><b>{lights[l]}</b> {LIGHT_LABEL[l].toLowerCase()}</span>
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative max-w-md">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar código, titular, paciente, cédula…" className={cx(inputCls, 'pl-8')} aria-label="Buscar" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {([['abiertas', `Abiertas ${mine.filter(c => OPEN.includes(c.status)).length}`], ...CLAIM_STATUSES[type].map(s => [s, `${s} ${count(s)}`]), ['', `Todas ${mine.length}`]] as [string, string][]).map(([v, label]) => (
            <button key={v || 'all'} aria-pressed={status === v} onClick={() => setStatus(v as typeof status)}
              className={cx('rounded-full border px-3 py-1 text-[11px] font-bold cursor-pointer', status === v ? 'border-[#0C4169] bg-[#0C4169] text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300')}>{label}</button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {rows.length === 0 ? <EmptyState title={mine.length ? 'Nada con este filtro' : 'Aún no hay solicitudes'}>Las solicitudes que los afiliados envíen desde Mi Colmedikal aparecerán aquí.</EmptyState> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:min-w-[640px]">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2.5">Solicitud</th>
                  <th className="px-3 py-2.5">Paciente / titular</th>
                  {type === 'preautorizacion' && <th className="hidden px-3 py-2.5 md:table-cell">Hospital · ingreso</th>}
                  <th className="px-3 py-2.5 text-right">{type === 'reembolso' ? 'Solicitado' : 'Presupuesto'}</th>
                  <th className="hidden px-3 py-2.5 text-right sm:table-cell">Aprobado</th>
                  <th className="px-3 py-2.5">Estado</th>
                  <th className="px-3 py-2.5">Abierta</th>
                  <th className="hidden px-3 py-2.5 sm:table-cell">Enviada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map(c => (
                  <tr key={c.id} onClick={() => setOpenId(c.id)} className="cursor-pointer align-top hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-3 font-mono font-bold text-[#0C4169] dark:text-sky-300">{c.id}<span className="block font-sans text-[10px] font-normal text-slate-400">{c.files.length} doc.</span></td>
                    <td className="px-3 py-3"><span className="block font-bold text-slate-900 dark:text-white">{c.form.paciente}</span><span className="text-[11px] text-slate-500">{c.form.parentesco === 'Titular' ? 'Titular' : `${c.form.parentesco} de ${c.form.titular}`}</span></td>
                    {type === 'preautorizacion' && <td className="hidden px-3 py-3 text-slate-600 dark:text-slate-300 md:table-cell">{c.form.hospital}<span className="block text-[10px] text-slate-400">{c.form.fechaIngreso}</span></td>}
                    <td className="px-3 py-3 text-right font-bold tabular-nums text-slate-800 dark:text-slate-100">${c.totalRequested.toFixed(2)}</td>
                    <td className="hidden px-3 py-3 text-right tabular-nums text-emerald-700 sm:table-cell">{c.approvedAmount != null ? `$${c.approvedAmount.toFixed(2)}` : '—'}</td>
                    <td className="px-3 py-3"><StatusPill s={c.status} /></td>
                    <td className="px-3 py-3"><SlaBadge c={c} /></td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-slate-500 sm:table-cell">{fmt(c.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LegacyRequests type={type} {...legacy} />
      {open && <ClaimReview claim={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}
