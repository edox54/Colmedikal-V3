import type React from 'react';
// Activity + tasks timeline for one lead (ported from the SEOefectivo CRM).
// Reads the shared server store; legacy notes (LeadNote[]) are merged in so
// nothing written before the timeline existed disappears.
import { useState } from 'react';
import { ArrowRightLeft, Bot, CalendarClock, Handshake, Mail, MessageCircle, NotebookPen, Phone, Trash, TriangleAlert } from 'lucide-react';
import { useColmedikal } from '../../../context/ColmedikalContext';
import type { CrmActivity, LeadNote } from '../../../types';
import { Card, EmptyState, Spin, btn, cx, fmtDateTime, inputCls, isOverdue, timeAgo, toast } from './ui';

const ICONS: Record<string, typeof Phone> = { nota: NotebookPen, llamada: Phone, email: Mail, whatsapp: MessageCircle, reunion: Handshake, cambio_etapa: ArrowRightLeft, sistema: Bot };
export const ACTIVITY_LABEL: Record<string, string> = { nota: 'Nota', llamada: 'Llamada', email: 'Correo', whatsapp: 'WhatsApp', reunion: 'Reunión', cambio_etapa: 'Cambio de etapa', sistema: 'Sistema' };
const TYPES = ['nota', 'llamada', 'whatsapp', 'email', 'reunion'] as const;

type Row = CrmActivity & { legacy?: boolean };

export default function LeadTimeline({ leadId, activities, notes }: { leadId: string; activities: CrmActivity[]; notes: LeadNote[] }) {
  const { addLeadActivity, updateLeadActivity } = useColmedikal();
  const [type, setType] = useState<(typeof TYPES)[number]>('nota');
  const [body, setBody] = useState('');
  const [isTask, setIsTask] = useState(false);
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);

  const rows: Row[] = [
    ...activities,
    ...notes.map((n, i) => ({ id: `legacy-${i}`, type: 'nota' as const, body: n.text, by: n.author, at: n.timestamp, legacy: true })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  const open = activities.filter(a => a.dueAt && !a.doneAt).sort((a, b) => +new Date(a.dueAt!) - +new Date(b.dueAt!));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTask && !due) return toast('Elige la fecha de vencimiento', 'error');
    setBusy(true);
    try {
      await addLeadActivity(leadId, { type, body: body.trim(), dueAt: isTask ? new Date(due).toISOString() : undefined });
      setBody(''); setIsTask(false); setDue('');
      toast(isTask ? 'Tarea creada' : 'Actividad registrada');
    } catch (err) { toast(err instanceof Error ? err.message : 'Error', 'error'); } finally { setBusy(false); }
  };
  const act = async (a: CrmActivity, change: { done?: boolean; delete?: boolean }) => {
    if (change.delete && !confirm('¿Eliminar esta entrada del historial? No se puede deshacer.')) return;
    try { await updateLeadActivity(leadId, a.id, change); if (change.delete) toast('Actividad eliminada'); }
    catch (err) { toast(err instanceof Error ? err.message : 'Error', 'error'); }
  };

  return (
    <Card title="Actividad y tareas">
      <form onSubmit={submit} className="mb-4 space-y-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Tipo de actividad">
          {TYPES.map(t => {
            const Icon = ICONS[t];
            return (
              <button key={t} type="button" role="radio" aria-checked={type === t} onClick={() => setType(t)}
                className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold cursor-pointer border', type === t ? 'bg-[#0C4169] text-white border-[#0C4169]' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700')}>
                <Icon size={12} aria-hidden />{ACTIVITY_LABEL[t]}
              </button>
            );
          })}
        </div>
        <textarea rows={2} maxLength={5000} value={body} onChange={e => setBody(e.target.value)} className={inputCls}
          placeholder={isTask ? 'Qué hay que hacer. Ej.: llamar para confirmar el plan' : type === 'nota' ? 'Escribe una nota…' : 'Qué se habló o qué se acordó (opcional)'} aria-label="Contenido" />
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700 dark:text-slate-300"><input type="checkbox" checked={isTask} onChange={e => setIsTask(e.target.checked)} className="size-4 accent-teal-600" />Es una tarea con fecha</label>
          {isTask && <input type="datetime-local" required value={due} onChange={e => setDue(e.target.value)} className={cx(inputCls, '!w-auto')} aria-label="Vence" />}
          <button type="submit" disabled={busy || (!body.trim() && (type === 'nota' || isTask))} className={cx(btn.teal, 'ml-auto')}>{busy && <Spin />}{isTask ? 'Crear tarea' : 'Guardar'}</button>
        </div>
      </form>

      {open.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"><CalendarClock size={14} aria-hidden />Tareas pendientes ({open.length})</h4>
          <ul className="space-y-1.5">
            {open.map(a => {
              const late = isOverdue(a.dueAt);
              return (
                <li key={a.id} className={cx('flex items-start gap-3 rounded-lg border px-3 py-2', late ? 'border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900' : 'border-slate-200 dark:border-slate-700')}>
                  <input type="checkbox" onChange={() => act(a, { done: true })} aria-label={`Marcar como hecha: ${a.body}`} className="mt-0.5 size-4 accent-teal-600 cursor-pointer" />
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap break-words text-xs text-slate-800 dark:text-slate-100">{a.body}</p>
                    <p className={cx('flex items-center gap-1 text-[10px]', late ? 'font-bold text-rose-700 dark:text-rose-400' : 'text-slate-400')}>
                      {late && <TriangleAlert size={11} aria-hidden />}{late ? 'Vencida' : 'Vence'} {fmtDateTime(a.dueAt)} · {timeAgo(a.dueAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <h4 className="mb-2 text-xs font-bold text-slate-800 dark:text-slate-200">Historial</h4>
      {rows.length === 0 ? <EmptyState title="Sin actividad todavía">Registra la primera llamada, nota o tarea arriba.</EmptyState> : (
        <ol className="relative ml-2.5 space-y-3 border-l border-slate-200 dark:border-slate-700 pl-5">
          {rows.map(a => {
            const Icon = ICONS[a.type] ?? NotebookPen;
            const system = a.type === 'cambio_etapa' || a.type === 'sistema';
            return (
              <li key={a.id} className="relative">
                <span aria-hidden className={cx('absolute -left-[31px] grid size-5 place-items-center rounded-full border bg-white dark:bg-slate-900', system ? 'border-slate-200 dark:border-slate-700 text-slate-400' : 'border-teal-300 text-teal-700 dark:text-teal-400')}><Icon size={11} /></span>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-[10px] text-slate-400"><span className="font-bold text-slate-700 dark:text-slate-200">{ACTIVITY_LABEL[a.type] ?? a.type}</span>{a.by ? ` · ${a.by}` : ''} · <time dateTime={a.at} title={fmtDateTime(a.at)}>{timeAgo(a.at)}</time></p>
                  {!system && !a.legacy && <button type="button" onClick={() => act(a, { delete: true })} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 cursor-pointer" aria-label="Eliminar actividad"><Trash size={12} /></button>}
                </div>
                {a.body && <p className={cx('whitespace-pre-wrap break-words text-xs', system ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100', a.doneAt && 'line-through opacity-60')}>{a.body}</p>}
                {a.dueAt && (
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {a.doneAt ? <>Hecha {fmtDateTime(a.doneAt)} · <button type="button" onClick={() => act(a, { done: false })} className="underline cursor-pointer">reabrir</button></> : <>Tarea · vence {fmtDateTime(a.dueAt)}</>}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
