// "Cliente" block of the lead file: portal access status, password reset,
// payment status, contract number and plan — same actions as the Clientes tab.
import { useState } from 'react';
import { Eye, EyeOff, KeyRound, ShieldCheck, ShieldOff, Wand2 } from 'lucide-react';
import { useColmedikal } from '../../../context/ColmedikalContext';
import type { LeadQuote, PortalAccess } from '../../../types';
import type { AdminSharedProps } from '../adminTypes';
import { Card, Spin, btn, cx, fmtDateTime, inputCls, timeAgo, toast } from './ui';

// Readable temp password: no ambiguous chars (0/O, 1/l/I).
const genPassword = () => {
  const abc = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const buf = crypto.getRandomValues(new Uint32Array(10));
  return Array.from(buf, n => abc[n % abc.length]).join('');
};

export default function ClientAccessCard({ lead, portal, data }: { lead: LeadQuote; portal?: PortalAccess; data: AdminSharedProps }) {
  const { refreshCrm } = useColmedikal();
  const { setClientPassword, updateClientPaymentStatus, setClientContractNumber, PLAN_CATALOG, handlePlanChange } = data;
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');
  const [contract, setContract] = useState(lead.quoteData?.contractNumber || '');
  const hasAccess = !!portal?.hasPassword || !!lead.quoteData?.portalPasswordHash;
  const payment = lead.quoteData?.paymentStatus || 'Pendiente';

  const savePw = async () => {
    if (pw.length < 6) return toast('Mínimo 6 caracteres', 'error');
    setBusy(true);
    try {
      await setClientPassword(lead.id, pw);
      setDone(pw); setPw('');
      toast(hasAccess ? 'Contraseña restablecida' : 'Acceso al portal creado');
      await refreshCrm();
    } catch (e) { toast(e instanceof Error ? e.message : 'No se pudo guardar', 'error'); } finally { setBusy(false); }
  };

  return (
    <Card title="Cliente · Portal Mi Colmedikal">
      <div className={cx('mb-3 flex items-start gap-3 rounded-lg border p-3', hasAccess ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900' : 'border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700')}>
        {hasAccess ? <ShieldCheck className="mt-0.5 text-emerald-600" size={18} aria-hidden /> : <ShieldOff className="mt-0.5 text-slate-400" size={18} aria-hidden />}
        <div className="text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-100">{hasAccess ? 'Tiene acceso al portal' : 'Sin acceso al portal'}</p>
          <p className="text-slate-500 dark:text-slate-400">
            Ingresa con su cédula <strong className="font-mono">{lead.quoteData?.docNumber || '—'}</strong>.
            {portal?.passwordSetAt && <> Contraseña definida {fmtDateTime(portal.passwordSetAt)}.</>}
          </p>
          {hasAccess && <p className="text-slate-500 dark:text-slate-400">Último ingreso: {portal?.lastLoginAt ? `${timeAgo(portal.lastLoginAt)} (${fmtDateTime(portal.lastLoginAt)})` : 'nunca ha ingresado'}</p>}
        </div>
      </div>

      <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">{hasAccess ? 'Restablecer contraseña' : 'Crear acceso (contraseña inicial)'}</label>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-40 flex-1">
          <KeyRound size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
          <input type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Mínimo 6 caracteres" className={cx(inputCls, 'pl-8 pr-8 font-mono')} aria-label="Nueva contraseña" />
          <button type="button" onClick={() => setShow(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" aria-label={show ? 'Ocultar' : 'Mostrar'}>{show ? <EyeOff size={14} /> : <Eye size={14} />}</button>
        </div>
        <button type="button" onClick={() => { setPw(genPassword()); setShow(true); }} className={btn.secondary} title="Generar contraseña segura"><Wand2 size={13} />Generar</button>
        <button type="button" onClick={savePw} disabled={busy || pw.length < 6} className={btn.primary}>{busy && <Spin />}Guardar</button>
      </div>
      {done && (
        <p className="mt-2 rounded-lg bg-teal-50 dark:bg-teal-950/30 p-2.5 text-[11px] text-teal-800 dark:text-teal-300">
          Listo. Comparte con el cliente: cédula <strong className="font-mono">{lead.quoteData?.docNumber}</strong> · contraseña <strong className="font-mono select-all">{done}</strong> · en colmedikal.com/mi-colmedikal
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Estado de pago
          <select value={payment} onChange={e => { updateClientPaymentStatus(lead.id, e.target.value as NonNullable<typeof lead.quoteData.paymentStatus>); toast('Estado de pago actualizado'); }} className={cx(inputCls, 'mt-1')}>
            <option>Pagado</option><option>Pendiente</option><option>Atrasado</option>
          </select>
        </label>
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">N.º de contrato
          <input value={contract} onChange={e => setContract(e.target.value)} onBlur={() => { if (contract.trim() && contract.trim() !== lead.quoteData?.contractNumber) { setClientContractNumber(lead.id, contract.trim()); toast('Contrato guardado'); } }} placeholder="Ej. CTR-0001" className={cx(inputCls, 'mt-1 font-mono')} />
        </label>
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Cambiar plan
          <select value={lead.quoteData?.basePlanId || ''} onChange={e => { handlePlanChange(lead.id, e.target.value); toast('Plan actualizado'); }} className={cx(inputCls, 'mt-1')}>
            <option value="">—</option>
            {Object.entries(PLAN_CATALOG).map(([id, p]) => <option key={id} value={id}>{p.name} — ${p.basePrice}/mes</option>)}
          </select>
        </label>
      </div>
    </Card>
  );
}
