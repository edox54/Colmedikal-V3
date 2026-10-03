// Mi Colmedikal: list, create and follow reembolsos / preautorizaciones.
import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight, Clock, FileText, Loader2, Plus, Send } from 'lucide-react';
import { CLAIM_LABEL, CLAIM_SLA_HOURS, CLIENT_EDITABLE, SECTIONS, SLA_RUNNING, slaDeadline, type Claim, type ClaimStatus, type ClaimType } from '../../data/claims';
import { SectionView } from './ClaimFields';
import ClaimDocuments from './ClaimDocuments';
import ClaimWizard from './ClaimWizard';
import { listClaims, submitClaim } from './claimsApi';

export const STATUS_STYLE: Record<ClaimStatus, string> = {
  Borrador: 'bg-slate-100 text-slate-600 border-slate-200',
  Recibida: 'bg-sky-50 text-sky-700 border-sky-200',
  'En revisión': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Documentos pendientes': 'bg-amber-50 text-amber-800 border-amber-300',
  Aprobada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pagada: 'bg-teal-50 text-teal-800 border-teal-300',
  Rechazada: 'bg-rose-50 text-rose-700 border-rose-200',
};
const fmtDeadline = (c: Claim) => slaDeadline(c).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmt = (v?: string) => (v ? new Date(v).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const StatusPill = ({ s }: { s: ClaimStatus }) => <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${STATUS_STYLE[s]}`}>{s}</span>;

export default function ClaimsPanel({ type, profile, onChanged }: { type: ClaimType; profile: any; onChanged?: (all: Claim[]) => void }) {
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [view, setView] = useState<{ mode: 'list' } | { mode: 'new'; draft?: Claim } | { mode: 'detail'; id: string }>({ mode: 'list' });
  const [err, setErr] = useState('');

  const load = async () => {
    try { const all = await listClaims(); setClaims(all); onChanged?.(all); setErr(''); }
    catch (e) { setErr(e instanceof Error ? e.message : 'No se pudieron cargar tus solicitudes'); setClaims(c => c ?? []); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const mine = (claims || []).filter(c => c.type === type);

  if (view.mode === 'new') {
    return <ClaimWizard type={type} profile={profile} draft={view.draft}
      onCancel={() => { setView({ mode: 'list' }); load(); }}
      onDone={c => { load(); setView({ mode: 'detail', id: c.id }); }} />;
  }
  if (view.mode === 'detail') {
    const c = mine.find(x => x.id === view.id);
    if (c) return <ClaimDetail claim={c} onBack={() => setView({ mode: 'list' })} onChange={next => setClaims(xs => (xs || []).map(x => (x.id === next.id ? next : x)))} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-[#0C4169]">{CLAIM_LABEL[type]}</h3>
          <p className="text-xs text-slate-500">
            {type === 'reembolso'
              ? 'Llena el formulario, sube tus facturas y el formulario firmado por tu médico, y sigue el estado aquí mismo. Plazo máximo: 90 días desde la fecha del gasto.'
              : 'Solicita la autorización de tu cirugía u hospitalización programada con al menos 72 horas de anticipación.'}
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-800"><Clock className="h-3.5 w-3.5" />Revisamos cada solicitud en un máximo de {CLAIM_SLA_HOURS} horas y te avisamos por correo.</p>
        </div>
        <button onClick={() => setView({ mode: 'new' })} className="inline-flex items-center gap-1.5 rounded-xl bg-[#0C4169] px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-900 cursor-pointer"><Plus className="h-4 w-4" />Nueva solicitud</button>
      </div>

      {err && <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{err}</p>}
      {!claims ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
        : mine.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 py-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm font-bold text-slate-700">Aún no tienes solicitudes</p>
            <p className="text-xs text-slate-500">Pulsa “Nueva solicitud” para empezar.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200">
            {mine.map(c => (
              <li key={c.id}>
                <button onClick={() => (c.status === 'Borrador' ? setView({ mode: 'new', draft: c }) : setView({ mode: 'detail', id: c.id }))}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 cursor-pointer">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800">{c.id} · {c.form.paciente || '—'}</p>
                    <p className="truncate text-[11px] text-slate-500">
                      {c.type === 'reembolso' ? `${c.invoices.length} factura(s)` : c.form.hospital || 'Hospital por definir'} · ${c.totalRequested.toFixed(2)}
                      {c.approvedAmount != null && (c.status === 'Aprobada' || c.status === 'Pagada') && <> · aprobado <b className="text-emerald-700">${c.approvedAmount.toFixed(2)}</b></>}
                      {' · '}{fmt(c.submittedAt || c.createdAt)}
                    </p>
                    {SLA_RUNNING.includes(c.status) && <p className="text-[11px] font-semibold text-teal-700">Respuesta a más tardar el {fmtDeadline(c)}</p>}
                  </div>
                  <StatusPill s={c.status} />
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}

function ClaimDetail({ claim, onBack, onChange }: { claim: Claim; onBack: () => void; onChange: (c: Claim) => void }) {
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');
  const editable = CLIENT_EDITABLE.includes(claim.status);
  const reply = async () => {
    setBusy(true); setMsg('');
    try { onChange(await submitClaim(claim.id, comment)); setComment(''); setMsg('Enviamos tus documentos a revisión.'); }
    catch (e) { setMsg(e instanceof Error ? e.message : 'No se pudo enviar'); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#0C4169] cursor-pointer"><ArrowLeft className="h-3.5 w-3.5" />Mis solicitudes</button>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">{CLAIM_LABEL[claim.type]}</p>
          <h3 className="text-lg font-black text-[#0C4169]">{claim.id} · {claim.form.paciente}</h3>
          <p className="text-[11px] text-slate-500">Enviada {fmt(claim.submittedAt)} · {claim.type === 'reembolso' ? 'Solicitado' : 'Presupuesto'} ${claim.totalRequested.toFixed(2)}{claim.approvedAmount != null && (claim.status === 'Aprobada' || claim.status === 'Pagada') ? ` · Aprobado $${claim.approvedAmount.toFixed(2)}` : ''}</p>
        </div>
        <StatusPill s={claim.status} />
      </div>
      {SLA_RUNNING.includes(claim.status) && (
        <div className="flex items-start gap-2 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-xs text-teal-900">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Tu solicitud está siendo revisada. Te responderemos en un máximo de {CLAIM_SLA_HOURS} horas, <b>a más tardar el {fmtDeadline(claim)}</b>, y te avisaremos por correo.</span>
        </div>
      )}

      {claim.adminComment && (claim.status === 'Documentos pendientes' || claim.status === 'Rechazada' || claim.status === 'Aprobada') && (
        <div className={`rounded-2xl border p-4 text-xs ${claim.status === 'Documentos pendientes' ? 'border-amber-300 bg-amber-50 text-amber-900' : claim.status === 'Rechazada' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          <p className="font-black">Mensaje de Colmedikal</p>
          <p className="mt-1 whitespace-pre-wrap">{claim.adminComment}</p>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3">
        <h4 className="text-sm font-black text-[#0C4169]">Documentos</h4>
        <ClaimDocuments claim={claim} onChange={onChange} canUpload={editable} canRemove={false} />
        {claim.status === 'Documentos pendientes' && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} maxLength={1000} placeholder="Comentario para el equipo (opcional)" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs" />
            <button onClick={reply} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 cursor-pointer">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}Enviar documentos a revisión</button>
          </div>
        )}
        {msg && <p className="text-[11px] font-bold text-teal-700">{msg}</p>}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-black text-[#0C4169]">Seguimiento</h4>
        <ol className="relative ml-2 space-y-3 border-l border-slate-200 pl-5">
          {[...claim.history].reverse().map((h, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[27px] top-0.5 grid size-4 place-items-center rounded-full border border-slate-200 bg-white"><Clock className="h-2.5 w-2.5 text-slate-400" /></span>
              <p className="text-[10px] text-slate-400">{new Date(h.at).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })} · {h.by}</p>
              <p className="text-xs font-bold text-slate-800">{h.action}</p>
              {h.comment && <p className="whitespace-pre-wrap text-[11px] text-slate-600">{h.comment}</p>}
            </li>
          ))}
        </ol>
      </div>

      <details className="rounded-3xl border border-slate-200 bg-white p-5">
        <summary className="cursor-pointer text-sm font-black text-[#0C4169]">Datos del formulario</summary>
        <div className="mt-4 space-y-4">
          {SECTIONS[claim.type].map(s => <div key={s.id}><SectionView section={s} form={claim.form} /></div>)}
          {claim.type === 'reembolso' && claim.invoices.length > 0 && (
            <ul className="divide-y divide-slate-100 text-xs">{claim.invoices.map((i, k) => <li key={k} className="flex justify-between py-1.5"><span>{i.fecha} · {i.numero} · {i.emisor}</span><b>${Number(i.valor).toFixed(2)}</b></li>)}</ul>
          )}
        </div>
      </details>
    </div>
  );
}
