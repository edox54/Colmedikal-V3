// Staff creates a client by hand (server: src/server/clients.ts). The client gets a welcome
// email with a link to create their Mi Colmedikal password.
import { useState, type FormEvent } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useColmedikal } from '../../../context/ColmedikalContext';
import { PLANS } from '../../../data/plans';
import { inputCls } from './ui';

export default function NewClientDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (leadId: string, msg: string) => void }) {
  const { token } = useColmedikal();
  const [f, setF] = useState({ fullName: '', docType: 'cedula', docNumber: '', email: '', phone: '', province: '', planId: '', sendWelcome: true });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      let by = 'Admin';
      try { by = JSON.parse(sessionStorage.getItem('colmedikal_user') || '{}')?.name || by; } catch { /* default */ }
      const r = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...f, by }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error(j.message || 'No se pudo crear el cliente');
      onCreated(j.leadId, j.welcomeSent ? `Cliente creado. Enviamos a ${f.email} el correo para crear su contraseña.` : 'Cliente creado. No se envió el correo de bienvenida; crea su acceso desde su ficha.');
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'No se pudo crear el cliente');
    } finally {
      setBusy(false);
    }
  };

  const label = 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="new-client-title" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="new-client-title" className="text-base font-black text-slate-900 dark:text-white">Nuevo cliente</h3>
            <p className="text-xs text-slate-500 mt-0.5">Se registra como cliente (cierre efectivo) con acceso a Mi Colmedikal.</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer" aria-label="Cerrar"><X className="w-4 h-4" /></button>
        </div>
        {err && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{err}</span></div>}
        <label className={label}>Nombres y apellidos
          <input required value={f.fullName} onChange={set('fullName')} className={`${inputCls} mt-1`} autoComplete="off" />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className={label}>Documento
            <select value={f.docType} onChange={set('docType')} className={`${inputCls} mt-1`}>
              <option value="cedula">Cédula</option>
              <option value="pasaporte">Pasaporte</option>
            </select>
          </label>
          <label className={`${label} sm:col-span-2`}>Número
            <input required value={f.docNumber} onChange={set('docNumber')} inputMode={f.docType === 'cedula' ? 'numeric' : 'text'} className={`${inputCls} mt-1`} />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className={label}>Correo
            <input required type="email" value={f.email} onChange={set('email')} className={`${inputCls} mt-1`} />
          </label>
          <label className={label}>Celular
            <input required type="tel" value={f.phone} onChange={set('phone')} className={`${inputCls} mt-1`} />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className={label}>Plan contratado
            <select value={f.planId} onChange={set('planId')} className={`${inputCls} mt-1`}>
              <option value="">Sin definir</option>
              {PLANS.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.basePrice}/mes</option>)}
            </select>
          </label>
          <label className={label}>Provincia
            <input value={f.province} onChange={set('province')} className={`${inputCls} mt-1`} />
          </label>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
          <input type="checkbox" checked={f.sendWelcome} onChange={e => setF({ ...f, sendWelcome: e.target.checked })} className="w-4 h-4 accent-indigo-600" />
          Enviar correo de bienvenida para que cree su contraseña
        </label>
        <button type="submit" disabled={busy} className="w-full py-2.5 rounded-xl bg-[#0C4169] hover:bg-slate-900 disabled:opacity-60 text-white text-sm font-bold cursor-pointer">{busy ? 'Creando…' : 'Crear cliente'}</button>
      </form>
    </div>
  );
}
