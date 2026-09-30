// Step-by-step self-service form for a reembolso / preautorización, mirroring
// the official PDF. The draft is saved on the server at every step so
// documents can be attached and nothing is lost if the client leaves.
import { useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Download, Loader2, Plus, Send, Trash2 } from 'lucide-react';
import {
  BLANK_FORM_URL, CLAIM_LABEL, DECLARATION, SECTIONS, claimTotal, missingForSubmit,
  type Claim, type ClaimType, type InvoiceRow,
} from '../../data/claims';
import { SectionInputs, SectionView } from './ClaimFields';
import ClaimDocuments from './ClaimDocuments';
import { discardDraft, saveDraft, submitClaim } from './claimsApi';

type Profile = { fullName?: string; docNumber?: string; email?: string; phone?: string; contractNumber?: string; address?: { city?: string; address1?: string; province?: string } };
const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none';

function prefill(type: ClaimType, p: Profile | null): Record<string, string> {
  if (!p) return {};
  const base = { titular: p.fullName || '', cedula: p.docNumber || '', correo: p.email || '', celular: p.phone || '', paciente: p.fullName || '', parentesco: 'Titular', ciudad: p.address?.city || '' };
  return type === 'reembolso'
    ? { ...base, tipoAtencion: 'Ambulatoria', direccion: [p.address?.address1, p.address?.city].filter(Boolean).join(', ') }
    : { ...base, contrato: p.contractNumber || '' };
}

export default function ClaimWizard({ type, profile, draft, onDone, onCancel }: {
  type: ClaimType; profile: Profile | null; draft?: Claim; onDone: (c: Claim) => void; onCancel: () => void;
}) {
  const sections = SECTIONS[type];
  // Steps: data sections… (+ invoices for reembolso), documents, review
  const steps = [...sections.map(s => s.title), ...(type === 'reembolso' ? ['3. Recepción de facturas'] : []), 'Documentos', 'Revisar y enviar'];
  const [step, setStep] = useState(0);
  const [claim, setClaim] = useState<Claim | null>(draft || null);
  const [form, setForm] = useState<Record<string, string>>(draft?.form || prefill(type, profile));
  const [invoices, setInvoices] = useState<InvoiceRow[]>(draft?.invoices?.length ? draft.invoices : [{ fecha: '', numero: '', emisor: '', valor: 0 }]);
  const [accepted, setAccepted] = useState(draft?.declarationAccepted || false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string[]>([]);

  const invoiceStep = type === 'reembolso' ? sections.length : -1;
  const docsStep = steps.length - 2;
  const reviewStep = steps.length - 1;
  const total = claimTotal(type, form, invoices);
  const ingresoSoon = type === 'preautorizacion' && form.fechaIngreso && new Date(`${form.fechaIngreso}T23:59`).getTime() - Date.now() < 72 * 3600_000;

  const persist = async (declarationAccepted = accepted) => {
    const saved = await saveDraft({ id: claim?.id, type, form, invoices, declarationAccepted });
    setClaim(saved);
    return saved;
  };
  const go = async (to: number) => {
    setBusy(true); setErr([]);
    try { await persist(); setStep(to); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (e) { setErr([e instanceof Error ? e.message : 'No se pudo guardar']); } finally { setBusy(false); }
  };
  const submit = async () => {
    if (!claim) return;
    const missing = missingForSubmit({ ...claim, form, invoices, declarationAccepted: accepted });
    if (missing.length) return setErr(missing);
    setBusy(true); setErr([]);
    try { await persist(true); onDone(await submitClaim(claim.id)); }
    catch (e: any) { setErr(e?.missing || [e?.message || 'No se pudo enviar']); } finally { setBusy(false); }
  };
  const discard = async () => {
    if (claim && !confirm('¿Descartar este borrador y sus documentos?')) return;
    if (claim) await discardDraft(claim.id).catch(() => {});
    onCancel();
  };
  const setInv = (i: number, k: keyof InvoiceRow, v: string) => setInvoices(xs => xs.map((x, j) => (j === i ? { ...x, [k]: k === 'valor' ? Number(v) : v } : x)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">{claim ? `Borrador ${claim.id}` : 'Nueva solicitud'}</p>
          <h3 className="text-lg font-black text-[#0C4169]">{CLAIM_LABEL[type]}</h3>
          {type === 'preautorizacion' && <p className="text-[11px] text-slate-500">Preséntala al menos 72 horas antes de la hospitalización o procedimiento programado.</p>}
        </div>
        <a href={BLANK_FORM_URL[type]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-[#0C4169] hover:bg-slate-50">
          <Download className="h-3.5 w-3.5" />Formulario para tu médico (PDF)
        </a>
      </div>

      {/* Stepper */}
      <ol className="flex gap-1.5 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <li key={s} className="min-w-0 flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-teal-500' : 'bg-slate-200'}`} />
            <p className={`mt-1 truncate text-[10px] font-bold ${i === step ? 'text-[#0C4169]' : 'text-slate-400'}`} title={s}>{i + 1}. {s.replace(/^\d\.\s*/, '')}</p>
          </li>
        ))}
      </ol>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        {step < sections.length && <SectionInputs section={sections[step]} form={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} />}

        {ingresoSoon && step < sections.length && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />La fecha de ingreso es en menos de 72 horas. Envía la solicitud cuanto antes; podría no alcanzar a procesarse a tiempo.</p>
        )}

        {step === invoiceStep && (
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#0C4169]">3. Recepción de facturas</h4>
            <p className="-mt-1 text-[11px] text-slate-500">Registra cada factura autorizada por el SRI. Luego subirás la foto o PDF de cada una.</p>
            {invoices.map((inv, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-[120px_1fr_1.3fr_110px_auto]">
                <input type="date" value={inv.fecha} onChange={e => setInv(i, 'fecha', e.target.value)} className={input} aria-label="Fecha" />
                <input value={inv.numero} onChange={e => setInv(i, 'numero', e.target.value)} placeholder="N.º factura" className={input} aria-label="Número de factura" />
                <input value={inv.emisor} onChange={e => setInv(i, 'emisor', e.target.value)} placeholder="Emisor (clínica, farmacia, médico)" className={`${input} col-span-2 sm:col-span-1`} aria-label="Emisor" />
                <input type="number" min={0} step="0.01" inputMode="decimal" value={inv.valor || ''} onChange={e => setInv(i, 'valor', e.target.value)} placeholder="Valor $" className={input} aria-label="Valor" />
                <button type="button" onClick={() => setInvoices(xs => (xs.length > 1 ? xs.filter((_, j) => j !== i) : xs))} disabled={invoices.length === 1} className="justify-self-end rounded-lg p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer" aria-label="Quitar factura"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setInvoices(xs => [...xs, { fecha: '', numero: '', emisor: '', valor: 0 }])} className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"><Plus className="h-3.5 w-3.5" />Agregar otra factura</button>
              <p className="text-xs font-black text-[#0C4169]">Total: ${total.toFixed(2)}</p>
            </div>
          </div>
        )}

        {step === docsStep && claim && (
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#0C4169]">Documentos de respaldo</h4>
            <ClaimDocuments claim={claim} onChange={setClaim} canUpload canRemove />
          </div>
        )}

        {step === reviewStep && claim && (
          <div className="space-y-5">
            {sections.map(s => <div key={s.id}><SectionView section={s} form={form} /></div>)}
            {type === 'reembolso' && (
              <div>
                <h4 className="mb-2 text-xs font-black text-[#0C4169]">Facturas</h4>
                <ul className="divide-y divide-slate-100 text-xs">{invoices.filter(i => i.numero || i.valor).map((i, k) => <li key={k} className="flex justify-between py-1.5"><span>{i.fecha} · {i.numero} · {i.emisor}</span><b>${Number(i.valor).toFixed(2)}</b></li>)}</ul>
              </div>
            )}
            <p className="text-xs"><b>{type === 'reembolso' ? 'Total solicitado' : 'Presupuesto total'}:</b> ${total.toFixed(2)} · <b>Documentos:</b> {claim.files.length}</p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-[11px] font-black text-[#0C4169]">{type === 'reembolso' ? '4. Autorización y declaración' : 'Declaración juramentada y autorización'}</p>
              <p className="max-h-40 overflow-y-auto text-[10.5px] leading-relaxed text-slate-600">{DECLARATION[type]}</p>
              <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs font-bold text-slate-800">
                <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-0.5 size-4 accent-teal-600" />
                Yo, {form.titular || 'el titular'}, con C.I. {form.cedula || '—'}, acepto la autorización y declaración anteriores.
              </label>
            </div>
          </div>
        )}

        {err.length > 0 && (
          <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-700">
            <p className="font-bold">Revisa lo siguiente:</p>
            <ul className="ml-4 list-disc">{err.map(e => <li key={e}>{e}</li>)}</ul>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={discard} className="text-[11px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer">{claim ? 'Descartar borrador' : 'Cancelar'}</button>
        <div className="flex gap-2">
          {step > 0 && <button type="button" onClick={() => go(step - 1)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"><ArrowLeft className="h-3.5 w-3.5" />Atrás</button>}
          {step < reviewStep
            ? <button type="button" onClick={() => go(step + 1)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-[#0C4169] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-900 cursor-pointer">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}Guardar y continuar<ArrowRight className="h-3.5 w-3.5" /></button>
            : <button type="button" onClick={submit} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-700 cursor-pointer">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}Enviar solicitud</button>}
        </div>
      </div>
    </div>
  );
}
