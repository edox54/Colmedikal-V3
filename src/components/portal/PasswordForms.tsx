import type React from 'react';
// Mi Colmedikal password self-service (server: src/server/portalPassword.ts)
import { useState } from 'react';
import { ArrowLeft, CheckCircle, Eye, EyeOff, KeyRound, Loader2, Mail } from 'lucide-react';
import { MIN_PASSWORD, passwordProblem } from '../../data/password';

const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500';
const btnCls = 'w-full py-3 bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2';

async function post(url: string, body: unknown, token?: string) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.success) throw new Error(j.message || 'No se pudo completar la solicitud.');
  return j.message as string;
}

function PasswordField({ label, value, onChange, autoComplete }: { label: string; value: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block space-y-1">
      <span className="block text-xs font-semibold text-slate-700">{label}</span>
      <span className="relative block">
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete} required className={`${inputCls} pr-10 font-mono`} />
        <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer" aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </span>
    </label>
  );
}

function NewPasswordFields({ pw, setPw, confirm, setConfirm }: { pw: string; setPw: (v: string) => void; confirm: string; setConfirm: (v: string) => void }) {
  const problem = pw ? passwordProblem(pw) : '';
  return (
    <>
      <PasswordField label="Nueva contraseña" value={pw} onChange={setPw} autoComplete="new-password" />
      <p className={`-mt-2 text-[10px] ${problem ? 'text-amber-700' : pw ? 'text-teal-700' : 'text-slate-400'}`}>{problem || (pw ? '✓ Contraseña válida' : `Mínimo ${MIN_PASSWORD} caracteres, con letras y números.`)}</p>
      <PasswordField label="Confirmar nueva contraseña" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      {confirm && confirm !== pw && <p className="-mt-2 text-[10px] text-rose-600">Las contraseñas no coinciden.</p>}
    </>
  );
}

const validate = (pw: string, confirm: string) => passwordProblem(pw) || (pw !== confirm ? 'Las contraseñas no coinciden.' : '');

/** Login screen → "¿Olvidaste tu contraseña?" */
export function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [doc, setDoc] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { setMsg(await post('/api/portal/forgot', { docNumber: doc })); } catch (e2) { setErr(e2 instanceof Error ? e2.message : 'Error'); } finally { setBusy(false); }
  };
  return (
    <div className="p-8 space-y-5">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#0C4169] cursor-pointer"><ArrowLeft className="w-3.5 h-3.5" />Volver al ingreso</button>
      <div>
        <h3 className="text-base font-black text-[#0C4169]">Restablecer contraseña</h3>
        <p className="text-xs text-slate-500 mt-1">Ingresa tu cédula. Te enviaremos un enlace al correo registrado en tu afiliación.</p>
      </div>
      {msg ? (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex gap-2"><Mail className="w-4 h-4 shrink-0 mt-0.5" /><span>{msg}</span></div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-1">
            <span className="block text-xs font-semibold text-slate-700">Cédula</span>
            <input value={doc} onChange={e => setDoc(e.target.value)} placeholder="Ej. 1712345678" required inputMode="numeric" className={`${inputCls} font-mono text-center`} />
          </label>
          {err && <p className="text-xs text-rose-600">{err}</p>}
          <button type="submit" disabled={busy || !doc.trim()} className={btnCls}>{busy && <Loader2 className="w-4 h-4 animate-spin" />}Enviar enlace</button>
        </form>
      )}
      <p className="text-[10px] text-slate-400 text-center">¿Cambiaste de correo? Escríbenos por WhatsApp al <a href="https://wa.me/593987028756" target="_blank" rel="noreferrer" className="font-bold text-teal-700">098 702 8756</a>.</p>
    </div>
  );
}

/** Landing from the emailed link (/mi-colmedikal?reset=TOKEN) */
export function ResetPassword({ token, onDone }: { token: string; onDone: (message: string) => void }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(pw, confirm);
    if (v) return setErr(v);
    setBusy(true); setErr('');
    try { onDone(await post('/api/portal/reset', { token, password: pw })); } catch (e2) { setErr(e2 instanceof Error ? e2.message : 'Error'); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="p-8 space-y-4">
      <div>
        <h3 className="text-base font-black text-[#0C4169] flex items-center gap-2"><KeyRound className="w-4 h-4" />Crea tu nueva contraseña</h3>
        <p className="text-xs text-slate-500 mt-1">El enlace es de un solo uso y vence 30 minutos después de solicitarlo.</p>
      </div>
      <NewPasswordFields pw={pw} setPw={setPw} confirm={confirm} setConfirm={setConfirm} />
      {err && <p className="text-xs text-rose-600">{err}</p>}
      <button type="submit" disabled={busy} className={btnCls}>{busy && <Loader2 className="w-4 h-4 animate-spin" />}Guardar nueva contraseña</button>
    </form>
  );
}

/** Inside the portal (Mis Datos) */
export function ChangePassword({ portalToken }: { portalToken: string }) {
  const [current, setCurrent] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(pw, confirm);
    if (v) return setErr(v);
    setBusy(true); setErr(''); setOk('');
    try {
      await post('/api/portal/change-password', { current, password: pw }, portalToken);
      setOk('Contraseña actualizada. Te enviamos un correo de confirmación.');
      setCurrent(''); setPw(''); setConfirm('');
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : 'Error'); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4" id="portal-change-password">
      <div>
        <h4 className="text-sm font-black text-[#0C4169] flex items-center gap-2"><KeyRound className="w-4 h-4" />Cambiar contraseña</h4>
        <p className="text-[11px] text-slate-500">Por seguridad te pedimos tu contraseña actual. Recibirás un correo confirmando el cambio.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 sm:max-w-sm"><PasswordField label="Contraseña actual" value={current} onChange={setCurrent} autoComplete="current-password" /></div>
        <div className="space-y-4"><NewPasswordFields pw={pw} setPw={setPw} confirm={confirm} setConfirm={setConfirm} /></div>
      </div>
      {err && <p className="text-xs text-rose-600">{err}</p>}
      {ok && <p className="text-xs text-teal-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />{ok}</p>}
      <button type="submit" disabled={busy || !current || !pw} className="px-5 py-2.5 bg-[#0C4169] hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Actualizar contraseña</button>
    </form>
  );
}
