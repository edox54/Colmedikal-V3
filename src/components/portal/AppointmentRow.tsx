// One appointment in Mi Colmedikal: status, Colmedikal's message and self-service cancel
// (server: src/server/appointments.ts). Used by the portal and the embedded booking page.
import { useState } from 'react';

const APT_BADGE: Record<string, string> = {
  Confirmada: 'text-emerald-800 bg-emerald-50 border-emerald-100',
  Reagendada: 'text-sky-800 bg-sky-50 border-sky-100',
  Completada: 'text-indigo-800 bg-indigo-50 border-indigo-100',
  Cancelada: 'text-rose-800 bg-rose-50 border-rose-100',
  'No asistió': 'text-slate-700 bg-slate-100 border-slate-200',
};
export default function AppointmentRow({ apt, portalToken, onChanged }: { apt: any; portalToken: string | null; onChanged: () => void; key?: string | number }) {
  const [step, setStep] = useState<'idle' | 'confirm' | 'busy'>('idle');
  const [err, setErr] = useState('');
  const cancellable = ['Pendiente', 'Confirmada', 'Reagendada'].includes(apt.status) && apt.aptDate >= new Date().toISOString().split('T')[0];
  const cancel = async () => {
    setStep('busy'); setErr('');
    try {
      const r = await fetch(`/api/portal/appointments/${encodeURIComponent(apt.id)}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${portalToken}` }, body: '{}' });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error(j.message || 'No se pudo cancelar');
      onChanged();
    } catch (e) { setErr(e instanceof Error ? e.message : 'No se pudo cancelar'); }
    setStep('idle');
  };
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900">{apt.specialty}{apt.doctorName ? ` — ${apt.doctorName}` : ''}</h4>
          {(apt.clinic || apt.city) && <p className="text-[10px] text-slate-500">{[apt.clinic, apt.city].filter(Boolean).join(' · ')}</p>}
          <p className="text-[10px] text-slate-400 font-mono">{apt.aptDate} {apt.aptTime}</p>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border shrink-0 ${APT_BADGE[apt.status] || 'text-amber-800 bg-amber-50 border-amber-100'}`}>{apt.status}</span>
      </div>
      {apt.note && <p className="text-[11px] text-teal-900 bg-teal-50 border-l-2 border-teal-500 px-3 py-2 rounded"><b>Colmedikal:</b> {apt.note}</p>}
      {err && <p className="text-[11px] text-rose-600">{err}</p>}
      {cancellable && (
        <div className="flex justify-end gap-2">
          {step === 'idle' && <button onClick={() => setStep('confirm')} className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer">Cancelar cita</button>}
          {step !== 'idle' && (
            <>
              <span className="text-[11px] text-slate-500 self-center">¿Seguro que quieres cancelarla?</span>
              <button onClick={() => setStep('idle')} disabled={step === 'busy'} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600 cursor-pointer">No</button>
              <button onClick={cancel} disabled={step === 'busy'} className="px-2.5 py-1 rounded-lg bg-rose-600 text-[11px] font-bold text-white disabled:opacity-60 cursor-pointer">{step === 'busy' ? 'Cancelando…' : 'Sí, cancelar'}</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
