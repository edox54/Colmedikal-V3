// CRM UI kit — structure/feel ported from the SEOefectivo admin, recolored to
// Colmedikal (navy #0C4169 + teal) and dark-mode aware like the rest of the panel.
import React, { useEffect, useId, useState } from 'react';
import { CircleCheck, CircleX, LoaderCircle, X } from 'lucide-react';
import type { LeadQuote } from '../../../types';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export type Stage = LeadQuote['status'];
export const STAGES: Stage[] = ['Nuevo Plan', 'Contactado', 'Cierre Efectivo', 'Perdido'];
export const STAGE_LABEL: Record<Stage, string> = { 'Nuevo Plan': 'Nuevo', Contactado: 'Contactado', 'Cierre Efectivo': 'Cierre efectivo', Perdido: 'Perdido' };
export const STAGE_STYLE: Record<Stage, { bg: string; dot: string }> = {
  'Nuevo Plan': { bg: '#d6ecf7', dot: '#0C4169' },
  Contactado: { bg: '#cdeee9', dot: '#0d9488' },
  'Cierre Efectivo': { bg: '#c9edc9', dot: '#0b6b0b' },
  Perdido: { bg: '#e6e6ec', dot: '#69727d' },
};

const btnBase = 'inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';
export const btn = {
  primary: `${btnBase} bg-[#0C4169] text-white hover:bg-slate-900 px-3.5 py-2`,
  teal: `${btnBase} bg-teal-600 text-white hover:bg-teal-700 px-3.5 py-2`,
  secondary: `${btnBase} border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2`,
  ghost: `${btnBase} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5`,
  danger: `${btnBase} border border-rose-300 bg-white dark:bg-slate-900 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-2`,
};
export const inputCls = 'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500';

export function Card({ title, actions, children, className }: { title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  const hid = useId();
  return (
    <section aria-labelledby={title ? hid : undefined} className={cx('rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4', className)}>
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h3 id={hid} className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function StageBadge({ stage }: { stage: Stage }) {
  const st = STAGE_STYLE[stage] || STAGE_STYLE['Nuevo Plan'];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold text-slate-900" style={{ background: st.bg }}>
      {stage === 'Cierre Efectivo' ? <CircleCheck size={12} aria-hidden /> : stage === 'Perdido' ? <CircleX size={12} aria-hidden /> : <span aria-hidden className="size-2 rounded-full" style={{ background: st.dot }} />}
      {STAGE_LABEL[stage] || stage}
    </span>
  );
}

export const initials = (name?: string | null) =>
  (name || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('');

export function Avatar({ name, className }: { name?: string | null; className?: string }) {
  return (
    <span title={name || ''} className={cx('grid size-6 shrink-0 place-items-center rounded-full bg-[#0C4169] text-[9px] font-bold text-white', className)}>
      <span aria-hidden>{initials(name)}</span><span className="sr-only">{name}</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cx('animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-800', className)} />;
}

export function EmptyState({ icon, title, children }: { icon?: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      {icon && <div className="text-slate-400" aria-hidden>{icon}</div>}
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</p>
      {children && <div className="max-w-md text-xs text-slate-500 dark:text-slate-400">{children}</div>}
    </div>
  );
}

export const Spin = () => <LoaderCircle size={14} className="animate-spin" aria-hidden />;

// ---------- fechas ----------
const dtf = new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
const df = new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' });
const toDate = (v?: string | null) => { if (!v) return null; const d = new Date(v); return Number.isNaN(+d) ? null : d; };
export const fmtDateTime = (v?: string | null) => { const d = toDate(v); return d ? dtf.format(d) : '—'; };
export const fmtDate = (v?: string | null) => { const d = toDate(v); return d ? df.format(d) : '—'; };
const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
export function timeAgo(v?: string | null): string {
  const d = toDate(v);
  if (!d) return '—';
  const s = (d.getTime() - Date.now()) / 1000;
  const a = Math.abs(s);
  if (a < 60) return 'ahora';
  if (a < 3600) return rtf.format(Math.round(s / 60), 'minute');
  if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour');
  if (a < 86400 * 30) return rtf.format(Math.round(s / 86400), 'day');
  return df.format(d);
}
export const isOverdue = (v?: string | null) => { const d = toDate(v); return !!d && d.getTime() < Date.now(); };
export const money = (n: number) => `$${Number(n || 0).toFixed(2)}`;
export const digitsOnly = (p?: string | null) => (p || '').replace(/\D/g, '');
/** Ecuadorian mobile → wa.me number (09xxxxxxxx → 5939xxxxxxxx). */
export const waNumber = (p?: string | null) => { const d = digitsOnly(p); return d.startsWith('0') ? `593${d.slice(1)}` : d; };

// ---------- toasts ----------
type ToastMsg = { id: number; text: string; tone: 'ok' | 'error' };
let push: ((t: ToastMsg) => void) | null = null;
let seq = 0;
export const toast = (text: string, tone: 'ok' | 'error' = 'ok') => push?.({ id: ++seq, text, tone });

export function Toaster() {
  const [items, setItems] = useState<ToastMsg[]>([]);
  useEffect(() => {
    push = t => {
      setItems(xs => [...xs, t]);
      setTimeout(() => setItems(xs => xs.filter(x => x.id !== t.id)), 3500);
    };
    return () => { push = null; };
  }, []);
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2" role="status" aria-live="polite">
      {items.map(t => (
        <div key={t.id} className={cx('flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-bold shadow-lg', t.tone === 'ok' ? 'bg-[#0C4169] text-white' : 'bg-rose-600 text-white')}>
          {t.tone === 'ok' ? <CircleCheck size={14} aria-hidden /> : <CircleX size={14} aria-hidden />}{t.text}
          <button onClick={() => setItems(xs => xs.filter(x => x.id !== t.id))} className="ml-1 opacity-70 hover:opacity-100 cursor-pointer" aria-label="Cerrar"><X size={12} /></button>
        </div>
      ))}
    </div>
  );
}
