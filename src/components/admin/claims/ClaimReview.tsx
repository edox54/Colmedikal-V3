// Admin review drawer for one reembolso / preautorización: form data, invoices,
// inline document viewer, history and the decision (approve / reject / ask
// for documents / mark paid). Every decision emails the client.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Clock, FileText, Image as ImageIcon, Loader2, UserRound, X } from 'lucide-react';
import { useColmedikal } from '../../../context/ColmedikalContext';
import { CLAIM_LABEL, FILE_KINDS, FINAL_STATUSES, SECTIONS, type Claim, type ClaimFile, type ClaimStatus } from '../../../data/claims';
import { SectionView } from '../../portal/ClaimFields';
import { StatusPill } from '../../portal/ClaimsPanel';
import { useAdminTheme } from '../AdminThemeContext';
import { useCrmUI } from '../crm/CrmProvider';
import { Card, btn, cx, fmtDateTime, inputCls, toast } from '../crm/ui';

function useFileUrl(claimId: string, file: ClaimFile | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (!file) return;
    let revoke = '';
    setUrl(null); setErr(false);
    fetch(`/api/admin/claims/${claimId}/files/${file.id}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem('colmedikal_token') || ''}` } })
      .then(r => (r.ok ? r.blob() : Promise.reject()))
      .then(b => { revoke = URL.createObjectURL(b); setUrl(revoke); })
      .catch(() => setErr(true));
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [claimId, file?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return { url, err };
}

export default function ClaimReview({ claim, onClose }: { claim: Claim; onClose: () => void }) {
  const { theme } = useAdminTheme();
  const { decideClaim } = useColmedikal();
  const { openLead } = useCrmUI();
  const [file, setFile] = useState<ClaimFile | null>(claim.files[0] || null);
  const { url, err } = useFileUrl(claim.id, file);
  const [comment, setComment] = useState('');
  const [amount, setAmount] = useState(String(claim.approvedAmount ?? claim.totalRequested));
  const [busy, setBusy] = useState<ClaimStatus | null>(null);
  const kindLabel = (k: string) => FILE_KINDS[claim.type].find(x => x.kind === k)?.label || k;
  const final = FINAL_STATUSES.includes(claim.status);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const decide = async (status: ClaimStatus) => {
    if ((status === 'Rechazada' || status === 'Documentos pendientes') && !comment.trim()) return toast('Escribe el motivo para el afiliado', 'error');
    const approvedAmount = status === 'Aprobada' ? Number(amount) : undefined;
    if (status === 'Aprobada' && !(approvedAmount! >= 0)) return toast('Monto aprobado inválido', 'error');
    if (!confirm(`¿Cambiar ${claim.id} a "${status}"? Se enviará un correo al afiliado.`)) return;
    setBusy(status);
    try { await decideClaim(claim.id, { status, comment: comment.trim() || undefined, approvedAmount }); setComment(''); toast(`${claim.id}: ${status}`); }
    catch (e) { toast(e instanceof Error ? e.message : 'No se pudo guardar', 'error'); } finally { setBusy(null); }
  };

  const Action = ({ status, label, cls }: { status: ClaimStatus; label: string; cls: string }) => (
    <button type="button" onClick={() => decide(status)} disabled={!!busy || claim.status === status} className={cls}>{busy === status ? <Loader2 size={13} className="animate-spin" /> : null}{label}</button>
  );

  return createPortal(
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
        <aside role="dialog" aria-modal="true" aria-label={`Solicitud ${claim.id}`} onClick={e => e.stopPropagation()}
          className="flex h-dvh w-full max-w-6xl flex-col overflow-hidden bg-slate-50 shadow-2xl dark:bg-slate-950">
          <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">{CLAIM_LABEL[claim.type]}</p>
                <h2 className="truncate text-lg font-black text-[#0C4169] dark:text-white">{claim.id} · {claim.form.paciente}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <StatusPill s={claim.status} />
                  <span>{claim.type === 'reembolso' ? 'Solicitado' : 'Presupuesto'} <b className="text-slate-800 dark:text-slate-100">${claim.totalRequested.toFixed(2)}</b></span>
                  {claim.approvedAmount != null && <span>Aprobado <b className="text-emerald-700">${claim.approvedAmount.toFixed(2)}</b></span>}
                  <span>Enviada {fmtDateTime(claim.submittedAt)}</span>
                  <button onClick={() => openLead(claim.leadId)} className="inline-flex items-center gap-1 font-bold text-teal-700 hover:underline cursor-pointer"><UserRound size={12} />Ficha del afiliado</button>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" aria-label="Cerrar"><X size={18} /></button>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[1fr_1.1fr] lg:overflow-hidden">
            {/* Left: data + decision */}
            <div className="min-h-0 space-y-4 p-4 sm:p-5 lg:overflow-y-auto">
              <Card title="Decisión">
                {final ? <p className="text-xs text-slate-500">Solicitud cerrada ({claim.status}). Puedes dejar un comentario adicional; se enviará al afiliado.</p> : null}
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} maxLength={2000} className={inputCls}
                  placeholder="Mensaje para el afiliado (obligatorio para rechazar o pedir documentos)" aria-label="Comentario" />
                {!final && (
                  <label className="mt-2 flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {claim.type === 'reembolso' ? 'Monto a reembolsar' : 'Valor autorizado'} $
                    <input type="number" min={0} step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={cx(inputCls, '!w-32 font-mono')} />
                  </label>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {!final && <>
                    <Action status="En revisión" label="En revisión" cls={btn.secondary} />
                    <Action status="Documentos pendientes" label="Pedir documentos" cls={cx(btn.secondary, '!border-amber-300 !text-amber-800')} />
                    <Action status="Aprobada" label="Aprobar" cls={btn.teal} />
                    <Action status="Rechazada" label="Rechazar" cls={btn.danger} />
                  </>}
                  {claim.type === 'reembolso' && claim.status === 'Aprobada' && <Action status="Pagada" label="Marcar como pagada" cls={btn.primary} />}
                  {final && <button type="button" disabled={!comment.trim() || !!busy} onClick={() => decide(claim.status)} className={btn.secondary}>Enviar comentario</button>}
                </div>
              </Card>

              <Card title="Formulario">
                <div className="space-y-4">
                  {SECTIONS[claim.type].map(s => <div key={s.id}><SectionView section={s} form={claim.form} dark /></div>)}
                  {claim.type === 'reembolso' && (
                    <div>
                      <h4 className="mb-2 text-xs font-black text-slate-800 dark:text-slate-100">3. Recepción de facturas</h4>
                      <table className="w-full text-xs">
                        <thead className="text-[10px] uppercase text-slate-400"><tr><th className="py-1 text-left">Fecha</th><th className="text-left">N.º</th><th className="text-left">Emisor</th><th className="text-right">Valor</th></tr></thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                          {claim.invoices.map((i, k) => <tr key={k}><td className="py-1.5">{i.fecha}</td><td>{i.numero}</td><td>{i.emisor}</td><td className="text-right tabular-nums">${Number(i.valor).toFixed(2)}</td></tr>)}
                          <tr className="font-black"><td colSpan={3} className="py-1.5">Total</td><td className="text-right tabular-nums">${claim.totalRequested.toFixed(2)}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-500"><Check size={13} className={claim.declarationAccepted ? 'text-emerald-600' : 'text-rose-600'} />Declaración y autorización {claim.declarationAccepted ? 'aceptadas' : 'NO aceptadas'} por el titular</p>
                </div>
              </Card>

              <Card title="Historial">
                <ol className="relative ml-2 space-y-3 border-l border-slate-200 pl-5 dark:border-slate-700">
                  {[...claim.history].reverse().map((h, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[27px] top-0.5 grid size-4 place-items-center rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"><Clock size={9} className="text-slate-400" /></span>
                      <p className="text-[10px] text-slate-400">{fmtDateTime(h.at)} · {h.by}</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{h.action}</p>
                      {h.comment && <p className="whitespace-pre-wrap text-[11px] text-slate-600 dark:text-slate-300">{h.comment}</p>}
                    </li>
                  ))}
                </ol>
              </Card>
            </div>

            {/* Right: document viewer */}
            <div className="flex min-h-[70vh] flex-col border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:min-h-0 lg:border-l lg:border-t-0">
              <div className="shrink-0 border-b border-slate-200 p-3 dark:border-slate-800">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Documentos ({claim.files.length})</p>
                <div className="flex max-h-36 flex-col gap-1 overflow-y-auto">
                  {claim.files.length === 0 && <p className="text-xs text-rose-600">El afiliado no subió documentos.</p>}
                  {FILE_KINDS[claim.type].map(k => {
                    const fs = claim.files.filter(f => f.kind === k.kind);
                    if (!fs.length) return k.required ? <p key={k.kind} className="text-[11px] text-rose-600">Falta: {k.label}</p> : null;
                    return fs.map(f => (
                      <button key={f.id} onClick={() => setFile(f)} className={cx('flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] cursor-pointer', file?.id === f.id ? 'bg-[#0C4169] text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800')}>
                        {f.mime === 'application/pdf' ? <FileText size={13} className="shrink-0" /> : <ImageIcon size={13} className="shrink-0" />}
                        <span className="shrink-0 font-bold">{kindLabel(f.kind).split(/[(/]/)[0].trim()}:</span><span className="truncate">{f.name}</span>
                      </button>
                    ));
                  })}
                </div>
              </div>
              <div className="relative min-h-0 flex-1 bg-slate-100 dark:bg-slate-950">
                {!file ? null : err ? <p className="p-6 text-center text-xs text-rose-600">No se pudo cargar el documento.</p>
                  : !url ? <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                  : file.mime === 'application/pdf' ? <iframe title={file.name} src={url} className="h-full min-h-[60vh] w-full" />
                  : file.mime === 'image/heic' ? <p className="p-6 text-center text-xs text-slate-500">Vista previa no disponible para HEIC. <a href={url} download={file.name} className="font-bold text-teal-700 underline">Descargar</a></p>
                  : <div className="h-full overflow-auto p-3"><img src={url} alt={file.name} className="mx-auto max-w-full" /></div>}
                {url && <a href={url} download={file?.name} className="absolute right-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow hover:bg-white">Descargar</a>}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>,
    document.body,
  );
}
