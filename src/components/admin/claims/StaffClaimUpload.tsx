// Staff (e.g. Equipo Comercial) files a reembolso / preautorización on behalf of a client:
// pick the client, then the same wizard the client uses in Mi Colmedikal, against the staff routes.
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, UserRound } from 'lucide-react';
import { useColmedikal } from '../../../context/ColmedikalContext';
import { CLAIM_LABEL, type Claim, type ClaimType } from '../../../data/claims';
import type { LeadQuote } from '../../../types';
import ClaimWizard from '../../portal/ClaimWizard';
import { staffMode } from '../../portal/claimsApi';
import { cx, inputCls } from '../crm/ui';

export default function StaffClaimUpload({ type, onClose }: { type: ClaimType; onClose: (created?: Claim) => void }) {
  const { leads, token } = useColmedikal();
  const [q, setQ] = useState('');
  const [lead, setLead] = useState<LeadQuote | null>(null);

  // Point the shared claims client at the staff routes for this lead while the wizard is open.
  useEffect(() => (lead && token ? staffMode(lead.id, token) : undefined), [lead, token]);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return (leads as LeadQuote[])
      .filter(l => [l.quoteData?.fullName, l.quoteData?.docNumber, l.quoteData?.email, l.quoteData?.phone].some(v => String(v || '').toLowerCase().includes(s)))
      .sort((a, b) => Number(b.status === 'Cierre Efectivo') - Number(a.status === 'Cierre Efectivo')) // clients first
      .slice(0, 8);
  }, [leads, q]);

  if (lead) {
    const qd = lead.quoteData || ({} as LeadQuote['quoteData']);
    const profile = { fullName: qd.fullName, docNumber: qd.docNumber, email: qd.email, phone: qd.phone, address: { province: qd.province } };
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Cargando a nombre de <b>{qd.fullName}</b> ({qd.docNumber}). El cliente la verá en Mi Colmedikal y recibirá los correos de estado.
        </div>
        <ClaimWizard type={type} profile={profile} onDone={c => onClose(c)} onCancel={() => setLead(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <button onClick={() => onClose()} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#0C4169] cursor-pointer"><ArrowLeft className="h-3.5 w-3.5" />Volver</button>
      <div>
        <h4 className="text-base font-bold text-slate-900 dark:text-white">Cargar {CLAIM_LABEL[type].toLowerCase()} manual</h4>
        <p className="text-xs text-slate-500">Busca al cliente por nombre, cédula, correo o celular.</p>
      </div>
      <div className="relative max-w-md">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input autoFocus type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Ej. 1712345678 o María" className={cx(inputCls, 'pl-8')} aria-label="Buscar cliente" />
      </div>
      {q.trim().length >= 2 && (matches.length === 0
        ? <p className="text-xs text-slate-500">Sin resultados. Si el cliente no existe, créalo primero en Clientes.</p>
        : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {matches.map(l => (
              <li key={l.id}>
                <button onClick={() => setLead(l)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">{l.quoteData?.fullName || '—'}</span>
                    <span className="block truncate text-[11px] text-slate-500">{l.quoteData?.docNumber || 'sin cédula'} · {l.quoteData?.email || 'sin correo'}</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{l.status}</span>
                </button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
