import { useState, type FormEvent } from 'react';
import { AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';

// Landing for the emailed link /admin?setpw=TOKEN — the team member creates their own password.
export default function AdminSetPassword({ token, onDone }: { token: string; onDone: (email: string, message: string) => void }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setErr('La contraseña debe tener al menos 8 caracteres.');
    if (pw !== pw2) return setErr('Las contraseñas no coinciden.');
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/admin/access/set-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: pw }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error(j.message || 'No se pudo guardar la contraseña.');
      onDone(String(j.email || ''), String(j.message));
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'No se pudo guardar la contraseña.');
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 font-sans">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <span className="rounded-2xl bg-white px-5 py-3 shadow-lg">
            <img src="/brand/colmedikal-logo.png" alt="Colmedikal — Medicina Prepagada S.A." className="h-14 w-auto" />
          </span>
        </div>
        <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-black text-white">Crea tu contraseña</h2>
          </div>
          <p className="text-xs text-slate-400">Panel administrativo de Colmedikal. Mínimo 8 caracteres.</p>
          {err && <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-xl flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{err}</span></div>}
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nueva contraseña
            <div className="relative mt-1">
              <input type={show ? 'text' : 'password'} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={input} autoFocus />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </label>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmar contraseña
            <input type={show ? 'text' : 'password'} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={`${input} mt-1`} />
          </label>
          <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold cursor-pointer">{busy ? 'Guardando…' : 'Guardar contraseña'}</button>
        </form>
      </div>
    </div>
  );
}
