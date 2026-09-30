import type React from 'react';
// Lead file ("ficha") — slide-over with contact actions, stage/assignee/follow-up,
// quote data, quote history for the same person, client portal block and the
// activity timeline. Layout ported from the SEOefectivo LeadDetail page.
import { useEffect, useState } from 'react';
import { Copy, History, Mail, MessageCircle, Phone, Send, X } from 'lucide-react';
import { useColmedikal } from '../../../context/ColmedikalContext';
import type { AdminSharedProps } from '../adminTypes';
import type { Stage } from './ui';
import { Card, STAGES, STAGE_LABEL, STAGE_STYLE, Spin, StageBadge, btn, cx, fmtDate, fmtDateTime, inputCls, money, timeAgo, toast, waNumber } from './ui';
import { sendQuoteEmail } from './CrmProvider';
import LeadTimeline from './LeadTimeline';
import ClientAccessCard from './ClientAccessCard';

const LOST_REASONS = ['Precio muy alto', 'Eligió competencia', 'No contestó', 'No está interesado', 'Otro motivo'];
const norm = (s?: string) => (s || '').toLowerCase().replace(/\s/g, '');

export default function LeadDrawer({ data, leadId, onClose }: { data: AdminSharedProps; leadId: string; onClose: () => void }) {
  const { crm } = useColmedikal();
  const { leads, admins, updateLeadStatus, setLeadLostReason, assignLead, setLeadFollowUp, resolvePlanName } = data;
  const lead = leads.find(l => String(l.id) === leadId);
  const [sending, setSending] = useState(false);
  const [askLost, setAskLost] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  if (!lead) return null;
  const q = lead.quoteData || ({} as typeof lead.quoteData);
  const entry = crm.data[leadId];
  const portal = crm.portal[leadId];
  const plan = resolvePlanName(lead);
  const isClient = lead.status === 'Cierre Efectivo' || !!portal?.hasPassword;

  // Every quote this same person submitted (matched like the leads list clusters)
  const history = leads
    .filter(l => String(l.id) !== leadId && (
      (norm(q.email) && norm(l.quoteData?.email) === norm(q.email)) ||
      (norm(q.phone) && norm(l.quoteData?.phone) === norm(q.phone)) ||
      (norm(q.docNumber) && norm(l.quoteData?.docNumber) === norm(q.docNumber))))
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

  const move = (to: Stage) => {
    if (to === lead.status) return;
    if (to === 'Perdido') return setAskLost(true);
    updateLeadStatus(lead.id, to);
    toast(`Movido a ${STAGE_LABEL[to]}`);
  };
  const send = async () => {
    if (!confirm(`¿Enviar la cotización por correo a ${q.email}?`)) return;
    setSending(true);
    try { toast(`Cotización enviada a ${await sendQuoteEmail(lead.id)}`); }
    catch (e) { toast(`No se pudo enviar: ${e instanceof Error ? e.message : e}`, 'error'); } finally { setSending(false); }
  };
  const copy = (text: string, what: string) => navigator.clipboard?.writeText(text).then(() => toast(`${what} copiado`));

  const Info = ({ k, v }: { k: string; v?: React.ReactNode }) => (
    <div className="min-w-0"><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</dt><dd className="break-words text-xs text-slate-800 dark:text-slate-100">{v || '—'}</dd></div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label={`Ficha de ${q.fullName}`} onClick={e => e.stopPropagation()}
        className="flex h-dvh max-h-screen w-full max-w-2xl min-w-0 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-2xl">
        {/* Header */}
        <header className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4" style={{ borderTop: `4px solid ${STAGE_STYLE[lead.status]?.dot}` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] tracking-widest text-slate-400">{q.contractNumber ? `CONTRATO ${q.contractNumber}` : q.leadCode || `LEAD ${lead.id}`}</p>
              <h2 className="truncate text-lg font-black text-[#0C4169] dark:text-white">{q.fullName || q.email}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <StageBadge stage={lead.status} />
                <span>Creado {timeAgo(lead.timestamp)}</span>
                {lead.lostReason && lead.status === 'Perdido' && <span className="text-rose-600">· {lead.lostReason}</span>}
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" aria-label="Cerrar ficha"><X size={18} /></button>
          </div>
          {/* Quick actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {q.phone && <a href={`tel:${q.phone.replace(/[^\d+]/g, '')}`} className={btn.secondary}><Phone size={13} />Llamar</a>}
            {q.phone && <a href={`https://wa.me/${waNumber(q.phone)}?text=${encodeURIComponent(`Hola ${(q.fullName || '').split(' ')[0]}, te saluda Colmedikal respecto a tu cotización ${q.leadCode || ''}.`)}`} target="_blank" rel="noreferrer" className={btn.secondary}><MessageCircle size={13} />WhatsApp</a>}
            {q.email && <a href={`mailto:${q.email}`} className={btn.secondary}><Mail size={13} />Correo</a>}
            {q.email && <button onClick={send} disabled={sending} className={btn.teal}>{sending ? <Spin /> : <Send size={13} />}Enviar cotización</button>}
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden overscroll-contain p-4 sm:p-5">
          {/* Pipeline controls */}
          <Card>
            <div className="mb-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Etapa">
              {STAGES.map(s => (
                <button key={s} role="radio" aria-checked={lead.status === s} onClick={() => move(s)}
                  className={cx('flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-bold cursor-pointer transition', lead.status === s ? 'text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50')}
                  style={lead.status === s ? { background: STAGE_STYLE[s].dot, borderColor: STAGE_STYLE[s].dot } : undefined}>{STAGE_LABEL[s]}</button>
              ))}
            </div>
            {askLost && (
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 p-2.5">
                <span className="text-[11px] font-bold text-rose-700">Motivo de pérdida:</span>
                {LOST_REASONS.map(r => <button key={r} onClick={() => { setLeadLostReason(lead.id, r); setAskLost(false); toast('Marcado como perdido'); }} className="rounded-full border border-rose-200 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] text-rose-700 cursor-pointer hover:bg-rose-100">{r}</button>)}
                <button onClick={() => setAskLost(false)} className="ml-auto text-[11px] text-slate-500 underline cursor-pointer">Cancelar</button>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Responsable
                <select value={lead.assignedTo || ''} onChange={e => assignLead(lead.id, e.target.value)} className={cx(inputCls, 'mt-1')}>
                  <option value="">— Sin asignar —</option>
                  {admins.filter(a => a.active).map(a => <option key={a.email} value={a.email}>{a.name}</option>)}
                </select>
              </label>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Fecha de seguimiento
                <input type="date" value={lead.followUpDate || ''} onChange={e => setLeadFollowUp(lead.id, e.target.value)} className={cx(inputCls, 'mt-1 font-mono')} />
              </label>
            </div>
          </Card>

          {/* Contact + quote */}
          <Card title="Datos de contacto y cotización">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <Info k="Correo" v={q.email && <button onClick={() => copy(q.email, 'Correo')} className="inline-flex items-center gap-1 hover:text-teal-600 cursor-pointer break-all text-left">{q.email}<Copy size={11} className="shrink-0" /></button>} />
              <Info k="Teléfono" v={q.phone && <button onClick={() => copy(q.phone, 'Teléfono')} className="inline-flex items-center gap-1 hover:text-teal-600 cursor-pointer">{q.phone}<Copy size={11} /></button>} />
              <Info k={q.docType === 'pasaporte' ? 'Pasaporte' : 'Cédula'} v={q.docNumber} />
              <Info k="Nacimiento" v={q.birthDate && fmtDate(q.birthDate)} />
              <Info k="Provincia" v={q.province} />
              <Info k="Personas" v={`${1 + (q.childrenCount || 0)} (${q.type || 'individual'})`} />
              <Info k="Plan" v={plan || 'Sin plan elegido'} />
              <Info k="Valor mensual" v={money(lead.estimatedPrice)} />
              <Info k="Recibido" v={fmtDateTime(lead.timestamp)} />
              <Info k="Origen" v={[q.source?.channel, q.source?.detail, q.source?.utmCampaign].filter(Boolean).join(' · ')} />
              <Info k="Página de entrada" v={q.source?.landingPage} />
              {q.address && <Info k="Dirección" v={`${q.address.address1}${q.address.address2 ? `, ${q.address.address2}` : ''} — ${q.address.city}, ${q.address.province}`} />}
            </dl>
          </Card>

          {isClient && <ClientAccessCard lead={lead} portal={portal} data={data} />}

          {history.length > 0 && (
            <Card title={<span className="inline-flex items-center gap-1.5"><History size={14} />Historial de cotizaciones ({history.length})</span>}>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map(h => (
                  <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
                    <span className="font-mono text-slate-500">{h.quoteData?.leadCode || h.id}</span>
                    <span className="text-slate-700 dark:text-slate-200">{resolvePlanName(h) || 'Sin plan'} · {money(h.estimatedPrice)}</span>
                    <span className="text-slate-400">{fmtDate(h.timestamp)}</span>
                    <StageBadge stage={h.status} />
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <LeadTimeline leadId={leadId} activities={entry?.activities || []} notes={lead.notes || []} />
        </div>
      </aside>
    </div>
  );
}
