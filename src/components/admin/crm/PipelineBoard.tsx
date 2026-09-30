// Kanban pipeline (ported from the SEOefectivo CRM): drag cards between stages,
// or use the per-card select (keyboard / touch). Duplicate quotes of the same
// person collapse into one card (newest), like the leads list does.
import { useMemo, useState } from 'react';
import { GripVertical, Search, TriangleAlert } from 'lucide-react';
import { useColmedikal } from '../../../context/ColmedikalContext';
import type { LeadQuote } from '../../../types';
import type { AdminSharedProps } from '../adminTypes';
import { useCrmUI } from './CrmProvider';
import type { Stage } from './ui';
import { Avatar, STAGES, STAGE_LABEL, STAGE_STYLE, cx, inputCls, isOverdue, money, timeAgo, toast } from './ui';

const LOST_REASONS = ['Precio muy alto', 'Eligió competencia', 'No contestó', 'No está interesado', 'Otro motivo'];
const norm = (s?: string) => (s || '').toLowerCase().replace(/\s/g, '');

type Props = Pick<AdminSharedProps, 'leads' | 'admins' | 'updateLeadStatus' | 'setLeadLostReason' | 'resolvePlanName'>;

export default function PipelineBoard({ leads, admins, updateLeadStatus, setLeadLostReason, resolvePlanName }: Props) {
  const { crm } = useColmedikal();
  const { openLead } = useCrmUI();
  const [q, setQ] = useState('');
  const [owner, setOwner] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<Stage | null>(null);
  const [lostFor, setLostFor] = useState<string | null>(null);
  let me = '';
  try { me = JSON.parse(sessionStorage.getItem('colmedikal_user') || '{}')?.email || ''; } catch { /* anon */ }

  const cards = useMemo(() => {
    const byPerson = new Map<string, LeadQuote>();
    for (const l of leads) {
      const key = norm(l.quoteData?.email) || norm(l.quoteData?.phone) || String(l.id);
      const prev = byPerson.get(key);
      if (!prev || +new Date(l.timestamp) > +new Date(prev.timestamp)) byPerson.set(key, l);
    }
    const s = q.trim().toLowerCase();
    return [...byPerson.values()]
      .filter(l => !s || [l.quoteData?.fullName, l.quoteData?.email, l.quoteData?.phone, l.quoteData?.docNumber, l.quoteData?.leadCode].some(v => v?.toLowerCase().includes(s)))
      .filter(l => !owner || (owner === 'me' ? l.assignedTo === me : owner === 'none' ? !l.assignedTo : l.assignedTo === owner))
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  }, [leads, q, owner, me]);

  const move = (id: string, to: Stage) => {
    const l = leads.find(x => String(x.id) === id);
    if (!l || l.status === to) return;
    if (to === 'Perdido') return setLostFor(id);
    updateLeadStatus(l.id, to);
    toast(`${l.quoteData?.fullName || 'Lead'} → ${STAGE_LABEL[to]}`);
  };
  const adminName = (email?: string) => admins.find(a => a.email === email)?.name || email;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
        <div className="relative min-w-52 flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
          <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar nombre, correo, cédula, código…" className={cx(inputCls, 'pl-8')} aria-label="Buscar en el pipeline" />
        </div>
        <select value={owner} onChange={e => setOwner(e.target.value)} className={cx(inputCls, '!w-auto')} aria-label="Responsable">
          <option value="">Todos los responsables</option><option value="me">Mis leads</option><option value="none">Sin asignar</option>
          {admins.filter(a => a.active).map(a => <option key={a.email} value={a.email}>{a.name}</option>)}
        </select>
        <p className="w-full text-[10px] text-slate-400">Arrastra las tarjetas entre etapas o usa el selector de cada tarjeta. Clic en el nombre para abrir la ficha.</p>
      </div>

      {lostFor && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-3">
          <span className="text-xs font-bold text-rose-700">¿Por qué se perdió?</span>
          {LOST_REASONS.map(r => <button key={r} onClick={() => { setLeadLostReason(lostFor, r); setLostFor(null); toast('Marcado como perdido'); }} className="rounded-full border border-rose-200 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] text-rose-700 cursor-pointer hover:bg-rose-100">{r}</button>)}
          <button onClick={() => setLostFor(null)} className="ml-auto text-[11px] text-slate-500 underline cursor-pointer">Cancelar</button>
        </div>
      )}

      <div className="flex snap-x gap-3 overflow-x-auto pb-3">
        {STAGES.map(stage => {
          const items = cards.filter(l => l.status === stage);
          const value = items.reduce((s, l) => s + Number(l.estimatedPrice || 0), 0);
          const target = over === stage;
          return (
            <section key={stage} aria-label={STAGE_LABEL[stage]}
              onDragOver={e => { if (dragId) { e.preventDefault(); setOver(stage); } }}
              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(s => (s === stage ? null : s)); }}
              onDrop={e => { e.preventDefault(); const id = dragId; setDragId(null); setOver(null); if (id) move(id, stage); }}
              className={cx('flex min-w-[240px] flex-1 snap-start flex-col rounded-xl border bg-white/70 dark:bg-slate-900/70 transition-colors', target ? 'border-teal-500 ring-2 ring-teal-400/50' : 'border-slate-200 dark:border-slate-800')}>
              <header className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 px-3 py-2.5" style={{ borderTop: `3px solid ${STAGE_STYLE[stage].dot}`, borderRadius: '0.75rem 0.75rem 0 0' }}>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{STAGE_LABEL[stage]}</h3>
                  <p className="text-[10px] text-slate-400 tabular-nums">{money(value)}/mes</p>
                </div>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-700 dark:text-slate-200">{items.length}</span>
              </header>
              {items.length === 0 ? (
                <p className="m-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-3 py-8 text-center text-[11px] text-slate-400">{target ? 'Soltar aquí' : 'Sin leads'}</p>
              ) : (
                <ul className="max-h-[calc(100vh-20rem)] min-h-24 space-y-2 overflow-y-auto p-2">
                  {items.map(l => {
                    const id = String(l.id);
                    const acts = crm.data[id]?.activities || [];
                    const nextTask = acts.filter(a => a.dueAt && !a.doneAt).sort((a, b) => +new Date(a.dueAt!) - +new Date(b.dueAt!))[0];
                    const due = nextTask?.dueAt || (l.followUpDate ? `${l.followUpDate}T23:59:00` : undefined);
                    const late = due && isOverdue(due) && stage !== 'Cierre Efectivo' && stage !== 'Perdido';
                    return (
                      <li key={id} draggable onDragStart={e => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id); }} onDragEnd={() => { setDragId(null); setOver(null); }}
                        className={cx('cursor-grab rounded-lg border bg-white dark:bg-slate-900 p-3 shadow-sm active:cursor-grabbing', late ? 'border-rose-200 dark:border-rose-900' : 'border-slate-200 dark:border-slate-700', dragId === id && 'opacity-40')}>
                        <div className="flex items-start gap-1.5">
                          <GripVertical size={14} className="mt-0.5 shrink-0 text-slate-300" aria-hidden />
                          <div className="min-w-0 flex-1">
                            <button onClick={() => openLead(id)} draggable={false} className="block break-words text-left text-xs font-bold leading-snug text-slate-900 dark:text-white hover:underline cursor-pointer">{l.quoteData?.fullName || l.quoteData?.email}</button>
                            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{resolvePlanName(l) || 'Sin plan'} · {money(l.estimatedPrice)}</p>
                          </div>
                          {l.assignedTo && <Avatar name={adminName(l.assignedTo)} />}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-1.5 text-[10px] text-slate-400">
                          <span>{l.quoteData?.source?.channel || 'Directo'}</span><span aria-hidden>·</span><span>{timeAgo(l.timestamp)}</span>
                          {acts.length > 0 && <><span aria-hidden>·</span><span>{acts.length} act.</span></>}
                        </div>
                        {due && stage !== 'Cierre Efectivo' && stage !== 'Perdido' && (
                          <p className={cx('mt-1 flex items-center gap-1 text-[10px]', late ? 'font-bold text-rose-700 dark:text-rose-400' : 'text-slate-400')}>
                            {late && <TriangleAlert size={11} aria-hidden />}{late ? 'Seguimiento vencido' : 'Seguimiento'} · {timeAgo(due)}
                          </p>
                        )}
                        <select value={l.status} onChange={e => move(id, e.target.value as Stage)} aria-label={`Mover ${l.quoteData?.fullName} a otra etapa`}
                          className="mt-2 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[10px] text-slate-700 dark:text-slate-200 cursor-pointer">
                          {STAGES.map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
                        </select>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
