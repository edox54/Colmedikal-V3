import type React from 'react';
// Sales dashboard (ported from the SEOefectivo admin): KPIs vs. previous
// period, leads per day, conversion funnel, origin / plan breakdown and
// overdue follow-ups. Computed client-side from the leads already loaded.
import { useMemo, useState } from 'react';
import { TrendingDown, TrendingUp, TriangleAlert } from 'lucide-react';
import { useColmedikal } from '../../../context/ColmedikalContext';
import type { AdminSharedProps } from '../adminTypes';
import { AreaChart, FunnelChart, HBars } from './charts';
import { useCrmUI } from './CrmProvider';
import { Card, StageBadge, cx, isOverdue, money, timeAgo } from './ui';
import { CLAIM_SLA_HOURS, SLA_RUNNING, openHours, slaLight, type Claim } from '../../../data/claims';
import { SlaBadge } from '../sections/ClaimsSection';

type Props = Pick<AdminSharedProps, 'leads' | 'resolvePlanName'>;
const DAY = 86_400_000;
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function Tile({ label, value, children, alert }: { label: string; value: string; children?: React.ReactNode; alert?: boolean }) {
  return (
    <div className={cx('rounded-xl border bg-white dark:bg-slate-900 p-4', alert ? 'border-rose-200 dark:border-rose-900' : 'border-slate-200 dark:border-slate-800')}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums text-[#0C4169] dark:text-white">{value}</p>
      <div className="mt-1 space-y-0.5">{children}</div>
    </div>
  );
}
function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (!prev) return <p className="text-[10px] text-slate-400">Sin datos del periodo anterior</p>;
  const d = (cur - prev) / prev;
  const up = d >= 0;
  return <p className={cx('flex items-center gap-1 text-[10px] font-bold', up ? 'text-emerald-600' : 'text-rose-600')}>{up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{up ? '+' : ''}{Math.round(d * 100)} % vs. periodo anterior ({prev})</p>;
}

export default function CrmDashboard({ leads, resolvePlanName }: Props) {
  const { crm, claims } = useColmedikal();
  // Open reembolsos / preautorizaciones by SLA light (KPI: answer within CLAIM_SLA_HOURS)
  const openClaims = (claims as Claim[]).filter(c => SLA_RUNNING.includes(c.status)).sort((a, b) => openHours(b) - openHours(a));
  const lightCount = (l: 'verde' | 'amarillo' | 'rojo') => openClaims.filter(c => slaLight(c) === l).length;
  const { openLead } = useCrmUI();
  const [days, setDays] = useState(30);

  const s = useMemo(() => {
    const now = Date.now();
    const t = (l: (typeof leads)[number]) => +new Date(l.timestamp);
    const cur = leads.filter(l => t(l) >= now - days * DAY);
    const prev = leads.filter(l => t(l) >= now - 2 * days * DAY && t(l) < now - days * DAY);
    const won = cur.filter(l => l.status === 'Cierre Efectivo');
    const reached = cur.filter(l => l.status === 'Contactado' || l.status === 'Cierre Efectivo');

    const series: { d: string; n: number }[] = [];
    for (let i = days - 1; i >= 0; i--) series.push({ d: ymd(new Date(now - i * DAY)), n: 0 });
    const idx = new Map(series.map((p, i) => [p.d, i]));
    for (const l of cur) { const i = idx.get(ymd(new Date(l.timestamp))); if (i !== undefined) series[i].n++; }

    const count = (key: (l: (typeof leads)[number]) => string) => {
      const m = new Map<string, number>();
      for (const l of cur) m.set(key(l), (m.get(key(l)) || 0) + 1);
      return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ key: k, label: k, value: v }));
    };

    const open = leads.filter(l => l.status === 'Nuevo Plan' || l.status === 'Contactado');
    const overdue: { id: string; name: string; what: string; due: string; status: (typeof leads)[number]['status'] }[] = [];
    for (const l of open) {
      const id = String(l.id);
      for (const a of crm.data[id]?.activities || []) if (a.dueAt && !a.doneAt && isOverdue(a.dueAt)) overdue.push({ id, name: l.quoteData?.fullName || '', what: a.body, due: a.dueAt, status: l.status });
      if (l.followUpDate && isOverdue(`${l.followUpDate}T23:59:00`)) overdue.push({ id, name: l.quoteData?.fullName || '', what: 'Fecha de seguimiento', due: `${l.followUpDate}T23:59:00`, status: l.status });
    }
    overdue.sort((a, b) => +new Date(a.due) - +new Date(b.due));

    return {
      cur, prev, won, series, overdue, open,
      wonPrev: prev.filter(l => l.status === 'Cierre Efectivo').length,
      unassigned: open.filter(l => !l.assignedTo).length,
      pipelineValue: open.reduce((a, l) => a + Number(l.estimatedPrice || 0), 0),
      wonValue: won.reduce((a, l) => a + Number(l.estimatedPrice || 0), 0),
      funnel: [
        { key: 'n', label: 'Cotizaciones', n: cur.length, pctPrev: null, pctTotal: 1 },
        { key: 'c', label: 'Contactados', n: reached.length, pctPrev: cur.length ? reached.length / cur.length : null, pctTotal: cur.length ? reached.length / cur.length : 0 },
        { key: 'w', label: 'Cierre efectivo', n: won.length, pctPrev: reached.length ? won.length / reached.length : null, pctTotal: cur.length ? won.length / cur.length : 0 },
      ],
      bySource: count(l => l.quoteData?.source?.channel || 'Directo'),
      byPlan: count(l => (resolvePlanName(l) || 'Sin plan').split(' — ')[0]),
      lost: count(l => (l.status === 'Perdido' ? l.lostReason || 'Sin motivo' : '')).filter(x => x.key),
    };
  }, [leads, days, crm, resolvePlanName]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Rendimiento comercial</h3>
        <div role="radiogroup" aria-label="Periodo" className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5">
          {[7, 30, 90].map(d => (
            <button key={d} role="radio" aria-checked={days === d} onClick={() => setDays(d)} className={cx('rounded-md px-3 py-1 text-[11px] font-bold cursor-pointer', days === d ? 'bg-[#0C4169] text-white' : 'text-slate-600 dark:text-slate-300')}>{d} días</button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Tile label="Cotizaciones" value={String(s.cur.length)}><Delta cur={s.cur.length} prev={s.prev.length} /></Tile>
        <Tile label="Cierres efectivos" value={String(s.won.length)}>
          <p className="text-[10px] text-slate-500">Conversión {s.cur.length ? Math.round((s.won.length / s.cur.length) * 100) : 0} % · {money(s.wonValue)}/mes</p>
          <Delta cur={s.won.length} prev={s.wonPrev} />
        </Tile>
        <Tile label="Leads abiertos" value={String(s.open.length)}><p className="text-[10px] text-slate-500">{s.unassigned} sin responsable</p></Tile>
        <Tile label="Pipeline abierto" value={money(s.pipelineValue)}><p className="text-[10px] text-slate-500">Valor mensual potencial</p></Tile>
        <Tile label="Seguimientos vencidos" value={String(s.overdue.length)} alert={s.overdue.length > 0}>
          <p className="flex items-center gap-1 text-[10px] text-slate-500">{s.overdue.length > 0 && <TriangleAlert size={11} className="text-rose-600" />}Tareas y fechas de seguimiento</p>
        </Tile>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Cotizaciones por día" className="lg:col-span-2"><AreaChart data={s.series} label="Cotizaciones por día" unit="cotizaciones" /></Card>
        <Card title="Embudo de conversión"><FunnelChart steps={s.funnel} /></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Origen de los leads"><HBars items={s.bySource} total={s.cur.length} /></Card>
        <Card title="Plan elegido"><HBars items={s.byPlan} total={s.cur.length} /></Card>
        <Card title="Motivos de pérdida"><HBars items={s.lost} empty="Sin leads perdidos en este periodo." /></Card>
      </div>

      <Card title={`Reembolsos y preautorizaciones abiertos · semáforo ${CLAIM_SLA_HOURS} h`}>
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" /><b>{lightCount('verde')}</b> en tiempo (&lt; 48 h)</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden="true" /><b>{lightCount('amarillo')}</b> por vencer (48–{CLAIM_SLA_HOURS} h)</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-600" aria-hidden="true" /><b>{lightCount('rojo')}</b> vencidas</span>
        </div>
        {openClaims.length === 0 ? <p className="text-xs text-slate-500">No hay solicitudes abiertas.</p> : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {openClaims.slice(0, 10).map(c => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
                <SlaBadge c={c} />
                <span className="font-mono font-bold text-[#0C4169] dark:text-sky-300">{c.id}</span>
                <button onClick={() => openLead(c.leadId)} className="min-w-0 flex-1 truncate text-left font-bold text-slate-900 dark:text-white hover:underline cursor-pointer">{c.form.paciente || c.form.titular}</button>
                <span className="text-slate-500">{c.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {s.overdue.length > 0 && (
        <Card title="Seguimientos vencidos">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {s.overdue.slice(0, 10).map((o, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
                <button onClick={() => openLead(o.id)} className="font-bold text-slate-900 dark:text-white hover:underline cursor-pointer">{o.name}</button>
                <span className="min-w-0 flex-1 truncate text-slate-500">{o.what}</span>
                <span className="font-bold text-rose-600">{timeAgo(o.due)}</span>
                <StageBadge stage={o.status} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
