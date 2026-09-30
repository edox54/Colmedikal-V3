import type React from 'react';
// Dependency-free SVG charts, ported from the SEOefectivo admin (thin 2px line,
// hairline grid, text in neutral ink — never in the series color) and recolored
// to Colmedikal teal/navy.
import { useEffect, useRef, useState } from 'react';

const VIZ = { line: '#0d9488', grid: 'rgb(100 116 139 / 0.15)', axis: 'rgb(100 116 139 / 0.4)', muted: '#94a3b8' };
const FUNNEL_RAMP = ['#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0C4169'];
const nf = new Intl.NumberFormat('es-EC');
const dayFmt = new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short' });
const fmtDay = (ymd: string) => dayFmt.format(new Date(`${ymd}T12:00:00`));
const pct = (v: number | null) => (v == null || !Number.isFinite(v) ? '—' : `${Math.round(v * 100)} %`);

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}
const niceMax = (v: number) => { if (v <= 4) return 4; const mag = 10 ** Math.floor(Math.log10(v)); return Math.ceil(v / (mag / 2)) * (mag / 2); };

export function AreaChart({ data, height = 200, unit = 'leads', label }: { data: { d: string; n: number }[]; height?: number; unit?: string; label: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const m = { l: 30, r: 12, t: 12, b: 22 };
  const w = Math.max(width, 260);
  const iw = w - m.l - m.r, ih = height - m.t - m.b;
  const max = niceMax(Math.max(0, ...data.map(p => p.n)));
  const x = (i: number) => m.l + (data.length > 1 ? (i * iw) / (data.length - 1) : iw / 2);
  const y = (v: number) => m.t + ih - (v / max) * ih;
  const line = data.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.n).toFixed(1)}`).join(' ');
  const area = data.length ? `${line} L${x(data.length - 1).toFixed(1)} ${m.t + ih} L${x(0).toFixed(1)} ${m.t + ih} Z` : '';
  const step = Math.max(1, Math.round(data.length / (w < 480 ? 4 : 7)));
  const xTicks = data.map((_, i) => i).filter(i => i % step === 0 && data.length - 1 - i >= step * 0.6);
  if (data.length > 1) xTicks.push(data.length - 1);
  const hp = hover !== null ? data[hover] : null;
  return (
    <div ref={ref} className="relative" style={{ height }}>
      {width > 0 && (
        <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-label={`${label}: ${data.reduce((a, p) => a + p.n, 0)} ${unit} en total`} className="block touch-pan-y"
          onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); const rel = ((e.clientX - r.left) / r.width) * w; setHover(Math.min(data.length - 1, Math.max(0, Math.round(((rel - m.l) / iw) * (data.length - 1))))); }}
          onPointerLeave={() => setHover(null)}>
          {[0, 1, 2, 3, 4].map(i => (max / 4) * i).map(t => (
            <g key={t}>
              <line x1={m.l} x2={w - m.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? VIZ.axis : VIZ.grid} />
              <text x={m.l - 6} y={y(t) + 4} textAnchor="end" fontSize={10} fill={VIZ.muted}>{nf.format(Math.round(t))}</text>
            </g>
          ))}
          {xTicks.map(i => <text key={i} x={x(i)} y={height - 5} textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'} fontSize={10} fill={VIZ.muted}>{fmtDay(data[i].d)}</text>)}
          {area && <path d={area} fill={VIZ.line} fillOpacity={0.12} />}
          {line && <path d={line} fill="none" stroke={VIZ.line} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
          {hp && <g pointerEvents="none"><line x1={x(hover!)} x2={x(hover!)} y1={m.t} y2={m.t + ih} stroke={VIZ.axis} /><circle cx={x(hover!)} cy={y(hp.n)} r={5} fill={VIZ.line} stroke="#fff" strokeWidth={2} /></g>}
        </svg>
      )}
      {hp && (
        <div className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0C4169] px-2.5 py-1.5 text-[11px] text-white shadow-lg" style={{ left: Math.min(w - 60, Math.max(60, x(hover!))), top: Math.max(0, y(hp.n) - 46) }}>
          <span className="block text-white/70">{fmtDay(hp.d)}</span><span className="font-bold">{nf.format(hp.n)} {unit}</span>
        </div>
      )}
    </div>
  );
}

export function HBars({ items, total, empty = 'Sin datos en este periodo.' }: { items: { key: string; label: React.ReactNode; value: number }[]; total?: number; empty?: string }) {
  if (!items.length) return <p className="py-6 text-center text-xs text-slate-400">{empty}</p>;
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <ul className="space-y-2.5">
      {items.map(it => (
        <li key={it.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
            <span className="min-w-0 break-words text-slate-700 dark:text-slate-200">{it.label}</span>
            <span className="shrink-0 tabular-nums text-slate-800 dark:text-slate-100"><strong>{nf.format(it.value)}</strong>{total ? <span className="ml-1.5 text-[10px] text-slate-400">{pct(it.value / total)}</span> : null}</span>
          </div>
          <div className="h-2 rounded-full bg-teal-50 dark:bg-slate-800"><div className="h-2 rounded-full" style={{ width: `${Math.max(2, (it.value / max) * 100)}%`, background: VIZ.line }} /></div>
        </li>
      ))}
    </ul>
  );
}

export function FunnelChart({ steps }: { steps: { key: string; label: string; n: number; pctPrev: number | null; pctTotal: number }[] }) {
  const max = Math.max(...steps.map(s => s.n), 1);
  return (
    <ol className="space-y-1">
      {steps.map((s, i) => (
        <li key={s.key}>
          {i > 0 && <p className="py-0.5 pl-1 text-[10px] text-slate-400"><span aria-hidden>↓ </span>{pct(s.pctPrev)} pasa a la siguiente etapa</p>}
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-slate-700 dark:text-slate-200">{s.label}</span>
            <div className="h-6 flex-1 rounded-r-lg bg-slate-100 dark:bg-slate-800"><div className="h-6 rounded-r-lg" style={{ width: `${Math.max(2, (s.n / max) * 100)}%`, background: FUNNEL_RAMP[i] ?? FUNNEL_RAMP[FUNNEL_RAMP.length - 1] }} /></div>
            <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-slate-800 dark:text-slate-100">{nf.format(s.n)}</span>
            <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-slate-400" title="Sobre el total de leads del periodo">{pct(s.pctTotal)}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
