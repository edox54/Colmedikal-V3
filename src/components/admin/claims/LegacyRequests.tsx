// Requests created before the self-service module (stored in the external API,
// without documents). Read-only list + status change, collapsed by default.
import type { ClaimType } from '../../../data/claims';
import type { AdminSharedProps } from '../adminTypes';

type Props = Pick<AdminSharedProps, 'refunds' | 'authorizations' | 'updateRefundStatus' | 'updateAuthorizationStatus'> & { type: ClaimType };
const REFUND_STATUSES = ['Procesando', 'Aprobado', 'Reembolsado', 'Rechazado'] as const;
const AUTH_STATUSES = ['Pendiente', 'Auditoría', 'Aprobado', 'Rechazado'] as const;
const sel = 'rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';

export default function LegacyRequests({ type, refunds, authorizations, updateRefundStatus, updateAuthorizationStatus }: Props) {
  const items = type === 'reembolso' ? refunds : authorizations;
  if (!items.length) return null;
  return (
    <details className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <summary className="cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300">Solicitudes del sistema anterior ({items.length}) — sin documentos adjuntos</summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {type === 'reembolso'
              ? refunds.map(r => (
                <tr key={r.id}>
                  <td className="py-2 pr-3">{r.familyMember}<span className="block text-[10px] text-slate-400">{r.userEmail}</span></td>
                  <td className="pr-3">{r.specialty}</td><td className="pr-3">Fact. {r.invoiceNumber}</td>
                  <td className="pr-3 text-right tabular-nums">${Number(r.amount || 0).toFixed(2)}</td>
                  <td className="pr-3 text-slate-400">{r.refundDate}</td>
                  <td><select value={r.status} onChange={e => updateRefundStatus(r.id, e.target.value as typeof r.status)} className={sel}>{REFUND_STATUSES.map(s => <option key={s}>{s}</option>)}</select></td>
                </tr>
              ))
              : authorizations.map(a => (
                <tr key={a.id}>
                  <td className="py-2 pr-3">{a.patient}<span className="block text-[10px] text-slate-400">{a.userEmail}</span></td>
                  <td className="pr-3">{a.procedure}</td><td className="pr-3">{a.facility}</td>
                  <td className="pr-3 text-slate-400">{a.requestDate}</td>
                  <td><select value={a.status} onChange={e => updateAuthorizationStatus(a.id, e.target.value as typeof a.status)} className={sel}>{AUTH_STATUSES.map(s => <option key={s}>{s}</option>)}</select></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
