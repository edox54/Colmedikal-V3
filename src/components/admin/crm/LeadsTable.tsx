// Simplified leads table (ported from the SEOefectivo CRM): filters, sortable
// columns, pagination and bulk actions. One row per person (newest quote);
// everything else — contact, notes, tasks, history, email — lives in the lead file.
import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Search, Users } from 'lucide-react';
import { useColmedikal } from '../../../context/ColmedikalContext';
import type { LeadQuote } from '../../../types';
import type { AdminSharedProps } from '../adminTypes';
import { useCrmUI } from './CrmProvider';
import type { Stage } from './ui';
import { Avatar, EmptyState, STAGES, STAGE_LABEL, StageBadge, btn, cx, inputCls, isOverdue, money, toast } from './ui';

type Props = Pick<AdminSharedProps, 'leads' | 'admins' | 'updateLeadStatus' | 'assignLead' | 'deleteLead' | 'canDeleteLeads' | 'resolvePlanName' | 'exportLeadsCSV'>;
type SortKey = 'name' | 'status' | 'source' | 'price' | 'due' | 'created';
type Row = { lead: LeadQuote; cluster: LeadQuote[]; due?: string };

const norm = (s?: string) => (s || '').toLowerCase().replace(/\s/g, '');
const shortFmt = new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', year: '2-digit' });
const fmtShort = (v?: string) => (v ? shortFmt.format(new Date(v)) : '—');
const EMPTY = { q: '', source: '', owner: '', stage: [] as Stage[], from: '', to: '', overdue: false };

export default function LeadsTable({ leads, admins, updateLeadStatus, assignLead, deleteLead, canDeleteLeads, resolvePlanName, exportLeadsCSV }: Props) {
  const { crm } = useColmedikal();
  const { openLead } = useCrmUI();
  const [f, setF] = useState(EMPTY);
  const [sort, setSort] = useState<SortKey>('created');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStage, setBulkStage] = useState('');
  const [bulkOwner, setBulkOwner] = useState('');
  let me = '';
  try { me = JSON.parse(sessionStorage.getItem('colmedikal_user') || '{}')?.email || ''; } catch { /* anon */ }

  // One row per person (same email/phone/cédula = same cluster), newest first
  const rows = useMemo<Row[]>(() => {
    const groups = new Map<string, LeadQuote[]>();
    for (const l of leads) {
      const key = norm(l.quoteData?.email) || norm(l.quoteData?.phone) || norm(l.quoteData?.docNumber) || String(l.id);
      groups.set(key, [...(groups.get(key) || []), l]);
    }
    return [...groups.values()].map(c => {
      const cluster = [...c].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
      const lead = cluster[0];
      const task = (crm.data[String(lead.id)]?.activities || []).filter(a => a.dueAt && !a.doneAt).sort((a, b) => +new Date(a.dueAt!) - +new Date(b.dueAt!))[0];
      const due = [task?.dueAt, lead.followUpDate ? `${lead.followUpDate}T23:59:00` : undefined].filter(Boolean).sort()[0];
      return { lead, cluster, due };
    });
  }, [leads, crm]);

  const sources = useMemo(() => [...new Set(rows.map(r => r.lead.quoteData?.source?.channel || 'Directo'))].sort(), [rows]);
  const countBy = (s: Stage) => rows.filter(r => r.lead.status === s).length;

  const filtered = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const out = rows.filter(({ lead: l, due }) => {
      const qd = l.quoteData || ({} as LeadQuote['quoteData']);
      if (q && ![qd.fullName, qd.email, qd.phone, qd.docNumber, qd.leadCode, qd.contractNumber].some(v => v?.toLowerCase().includes(q))) return false;
      if (f.source && (qd.source?.channel || 'Directo') !== f.source) return false;
      if (f.owner && (f.owner === 'me' ? l.assignedTo !== me : f.owner === 'none' ? !!l.assignedTo : l.assignedTo !== f.owner)) return false;
      if (f.stage.length && !f.stage.includes(l.status)) return false;
      const day = l.timestamp?.slice(0, 10);
      if (f.from && day < f.from) return false;
      if (f.to && day > f.to) return false;
      if (f.overdue && !(due && isOverdue(due) && (l.status === 'Nuevo Plan' || l.status === 'Contactado'))) return false;
      return true;
    });
    const val = (r: Row): string | number => {
      switch (sort) {
        case 'name': return (r.lead.quoteData?.fullName || '').toLowerCase();
        case 'status': return STAGES.indexOf(r.lead.status);
        case 'source': return r.lead.quoteData?.source?.channel || 'Directo';
        case 'price': return Number(r.lead.estimatedPrice || 0);
        case 'due': return r.due ? +new Date(r.due) : Number.MAX_SAFE_INTEGER;
        default: return +new Date(r.lead.timestamp);
      }
    };
    return out.sort((a, b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * (dir === 'asc' ? 1 : -1); });
  }, [rows, f, sort, dir, me]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const items = filtered.slice((cur - 1) * pageSize, cur * pageSize);
  const allOnPage = items.length > 0 && items.every(r => selected.has(String(r.lead.id)));
  const hasFilters = JSON.stringify(f) !== JSON.stringify(EMPTY);
  const patch = (p: Partial<typeof EMPTY>) => { setF(v => ({ ...v, ...p })); setPage(1); };
  const toggleSort = (k: SortKey) => { if (sort === k) setDir(d => (d === 'asc' ? 'desc' : 'asc')); else { setSort(k); setDir(k === 'name' || k === 'due' ? 'asc' : 'desc'); } };
  const selRows = rows.filter(r => selected.has(String(r.lead.id)));
  const adminName = (email?: string) => admins.find(a => a.email === email)?.name || email;

  const bulkMove = () => {
    if (bulkStage === 'Perdido') return toast('Para marcar como perdido abre la ficha y elige el motivo', 'error');
    selRows.forEach(r => updateLeadStatus(r.lead.id, bulkStage as Stage));
    toast(`Etapa cambiada: ${selRows.length}`); setSelected(new Set()); setBulkStage('');
  };
  const bulkAssign = () => {
    selRows.forEach(r => assignLead(r.lead.id, bulkOwner === 'none' ? '' : bulkOwner));
    toast(`Asignados: ${selRows.length}`); setSelected(new Set()); setBulkOwner('');
  };
  const bulkDelete = async () => {
    const n = selRows.reduce((a, r) => a + r.cluster.length, 0);
    if (!confirm(`¿Eliminar ${n} cotización(es) de ${selRows.length} persona(s)? No se puede deshacer.`)) return;
    await Promise.all(selRows.flatMap(r => r.cluster.map(l => deleteLead(l.id))));
    toast(`Eliminados: ${selRows.length}`); setSelected(new Set());
  };

  const Th = ({ k, label, cls }: { k: SortKey; label: string; cls?: string }) => {
    const on = sort === k;
    const Icon = !on ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
    return (
      <th scope="col" aria-sort={on ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={cx('px-3 py-2.5 font-bold', cls)}>
        <button type="button" onClick={() => toggleSort(k)} className={cx('inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-900 dark:hover:text-white cursor-pointer', on && 'text-slate-900 dark:text-white')}>{label}<Icon size={11} aria-hidden /></button>
      </th>
    );
  };

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 space-y-3">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
            <input type="search" value={f.q} onChange={e => patch({ q: e.target.value })} placeholder="Buscar nombre, correo, teléfono, cédula, código…" className={cx(inputCls, 'pl-8')} aria-label="Buscar" maxLength={120} />
          </div>
          <select value={f.source} onChange={e => patch({ source: e.target.value })} className={inputCls} aria-label="Origen">
            <option value="">Todos los orígenes</option>{sources.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={f.owner} onChange={e => patch({ owner: e.target.value })} className={inputCls} aria-label="Responsable">
            <option value="">Cualquier responsable</option><option value="me">Mis leads</option><option value="none">Sin asignar</option>
            {admins.filter(a => a.active).map(a => <option key={a.email} value={a.email}>{a.name}</option>)}
          </select>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700 dark:text-slate-300"><input type="checkbox" checked={f.overdue} onChange={e => patch({ overdue: e.target.checked })} className="size-4 accent-teal-600" />Seguimiento vencido</label>
        </div>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <fieldset className="min-w-0">
            <legend className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Etapa</legend>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map(s => {
                const on = f.stage.includes(s);
                return (
                  <button key={s} type="button" aria-pressed={on} onClick={() => patch({ stage: on ? f.stage.filter(x => x !== s) : [...f.stage, s] })}
                    className={cx('rounded-full border px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer', on ? 'border-[#0C4169] bg-[#0C4169] text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50')}>
                    {STAGE_LABEL[s]} <span className="tabular-nums opacity-70">{countBy(s)}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Desde<input type="date" value={f.from} max={f.to || undefined} onChange={e => patch({ from: e.target.value })} className={cx(inputCls, 'mt-1 !py-1.5')} /></label>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hasta<input type="date" value={f.to} min={f.from || undefined} onChange={e => patch({ to: e.target.value })} className={cx(inputCls, 'mt-1 !py-1.5')} /></label>
          {hasFilters && <button type="button" onClick={() => { setF(EMPTY); setPage(1); }} className={cx(btn.ghost, 'underline')}>Limpiar filtros</button>}
          <button type="button" onClick={() => exportLeadsCSV(filtered.map(r => [String(r.lead.id), r.cluster]))} className={cx(btn.secondary, 'ml-auto')}><Download size={13} />Exportar CSV</button>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div role="region" aria-label="Acciones masivas" className="sticky top-16 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-md">
          <strong className="text-xs text-slate-800 dark:text-slate-100">{selected.size} seleccionado{selected.size > 1 ? 's' : ''}</strong>
          <span className="flex items-center gap-1">
            <select value={bulkStage} onChange={e => setBulkStage(e.target.value)} className={cx(inputCls, '!w-auto !py-1.5')} aria-label="Mover a etapa">
              <option value="">Mover a etapa…</option>{STAGES.filter(s => s !== 'Perdido').map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
            </select>
            <button type="button" disabled={!bulkStage} onClick={bulkMove} className={btn.secondary}>Aplicar</button>
          </span>
          <span className="flex items-center gap-1">
            <select value={bulkOwner} onChange={e => setBulkOwner(e.target.value)} className={cx(inputCls, '!w-auto !py-1.5')} aria-label="Asignar a">
              <option value="">Asignar a…</option><option value="none">Sin asignar</option>{admins.filter(a => a.active).map(a => <option key={a.email} value={a.email}>{a.name}</option>)}
            </select>
            <button type="button" disabled={!bulkOwner} onClick={bulkAssign} className={btn.secondary}>Aplicar</button>
          </span>
          {canDeleteLeads && <button type="button" onClick={bulkDelete} className={cx(btn.danger, 'ml-auto')}>Eliminar</button>}
          <button type="button" onClick={() => setSelected(new Set())} className={cx(btn.ghost, !canDeleteLeads && 'ml-auto')}>Quitar selección</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {items.length === 0 ? (
          <EmptyState icon={<Users size={30} />} title={hasFilters ? 'Ningún lead coincide con estos filtros' : 'Aún no hay cotizaciones'}>
            {hasFilters ? <button type="button" onClick={() => { setF(EMPTY); setPage(1); }} className={cx(btn.secondary, 'mt-2')}>Limpiar filtros</button> : 'Cuando alguien cotice en el sitio aparecerá aquí.'}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:min-w-[560px]">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <tr>
                  <th scope="col" className="w-10 px-3 py-2.5"><input type="checkbox" aria-label="Seleccionar todos los de esta página" checked={allOnPage} onChange={e => setSelected(e.target.checked ? new Set(items.map(r => String(r.lead.id))) : new Set())} className="size-4 accent-teal-600" /></th>
                  <Th k="name" label="Lead" />
                  <Th k="status" label="Etapa" cls="hidden sm:table-cell" />
                  <Th k="source" label="Origen" cls="hidden md:table-cell" />
                  <Th k="price" label="Valor/mes" />
                  <th scope="col" className="hidden px-3 py-2.5 font-bold lg:table-cell">Responsable</th>
                  <Th k="due" label="Seguimiento" cls="hidden md:table-cell" />
                  <Th k="created" label="Recibido" cls="hidden sm:table-cell" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map(({ lead: l, cluster, due }) => {
                  const id = String(l.id);
                  const checked = selected.has(id);
                  const late = due && isOverdue(due) && (l.status === 'Nuevo Plan' || l.status === 'Contactado');
                  return (
                    <tr key={id} className={cx('align-top hover:bg-slate-50 dark:hover:bg-slate-800/40', checked && 'bg-teal-50/60 dark:bg-teal-950/20')}>
                      <td className="px-3 py-3"><input type="checkbox" checked={checked} onChange={e => setSelected(s => { const n = new Set(s); if (e.target.checked) n.add(id); else n.delete(id); return n; })} aria-label={`Seleccionar ${l.quoteData?.fullName}`} className="size-4 accent-teal-600" /></td>
                      <td className="max-w-[18rem] px-3 py-3">
                        <button type="button" onClick={() => openLead(id)} className="block break-words text-left text-[13px] font-bold text-slate-900 dark:text-white hover:underline cursor-pointer">{l.quoteData?.fullName || l.quoteData?.email || '—'}</button>
                        <span className="block break-all text-[11px] text-slate-500 dark:text-slate-400">{l.quoteData?.email}{l.quoteData?.phone ? ` · ${l.quoteData.phone}` : ''}</span>
                        <span className="block text-[11px] text-slate-400">
                          {resolvePlanName(l) || 'Sin plan'}
                          {cluster.length > 1 && <span className="ml-1.5 rounded bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 text-[10px] font-bold text-amber-700" title="Cotizó más de una vez">×{cluster.length}</span>}
                        </span>
                        <span className="mt-1.5 block sm:hidden"><StageBadge stage={l.status} /></span>
                      </td>
                      <td className="hidden px-3 py-3 sm:table-cell"><StageBadge stage={l.status} /></td>
                      <td className="hidden px-3 py-3 text-slate-500 dark:text-slate-400 md:table-cell">{l.quoteData?.source?.channel || 'Directo'}</td>
                      <td className="px-3 py-3 font-bold tabular-nums text-slate-800 dark:text-slate-100">{money(l.estimatedPrice)}</td>
                      <td className="hidden px-3 py-3 lg:table-cell">
                        {l.assignedTo ? <span className="inline-flex items-center gap-2"><Avatar name={adminName(l.assignedTo)} /><span className="max-w-28 truncate text-slate-700 dark:text-slate-200">{adminName(l.assignedTo)}</span></span> : <span className="text-slate-400">Sin asignar</span>}
                      </td>
                      <td className="hidden px-3 py-3 md:table-cell">
                        {due ? <span className={cx(late ? 'font-bold text-rose-700 dark:text-rose-400' : 'text-slate-500')}>{late ? 'Vencido · ' : ''}{fmtShort(due)}</span> : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-3 text-slate-500 sm:table-cell">{fmtShort(l.timestamp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-xs text-slate-500">
            <span>Mostrando {(cur - 1) * pageSize + 1}–{Math.min(cur * pageSize, filtered.length)} de {filtered.length}</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5">Por página
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className={cx(inputCls, '!w-auto !py-1')}>{[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}</select>
              </label>
              <button type="button" onClick={() => setPage(cur - 1)} disabled={cur <= 1} className={btn.secondary} aria-label="Página anterior"><ChevronLeft size={14} /></button>
              <span aria-live="polite" className="tabular-nums text-slate-800 dark:text-slate-100">{cur} / {pages}</span>
              <button type="button" onClick={() => setPage(cur + 1)} disabled={cur >= pages} className={btn.secondary} aria-label="Página siguiente"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
