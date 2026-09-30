import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { AdminSharedProps } from '../adminTypes';
import LeadsTable from '../crm/LeadsTable';
import PipelineBoard from '../crm/PipelineBoard';

type Props = Pick<AdminSharedProps, 'leads' | 'admins' | 'updateLeadStatus' | 'assignLead' | 'setLeadLostReason' | 'deleteLead' | 'refreshData' | 'canDeleteLeads' | 'resolvePlanName' | 'exportLeadsCSV'>;

// Cotizaciones: simplified table (SEOefectivo-style) or Kanban pipeline.
// Per-lead actions (contact, notes, tasks, email, history) live in the lead file drawer.
export default function LeadsSection(props: Props) {
  const { refreshData } = props;
  const [view, setViewState] = useState<'lista' | 'pipeline'>(() => {
    try { return localStorage.getItem('colmedikal_leads_view') === 'pipeline' ? 'pipeline' : 'lista'; } catch { return 'lista'; }
  });
  const setView = (v: 'lista' | 'pipeline') => { setViewState(v); try { localStorage.setItem('colmedikal_leads_view', v); } catch { /* ignore */ } };

  return (
    <div className="space-y-4 animate-in fade-in duration-200" id="admin-leads-panel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-950 dark:text-white">Cotizaciones</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Todo lo que entra por el cotizador, con su etapa y siguiente paso. Clic en un nombre para abrir la ficha.</p>
        </div>
        <div className="flex items-center gap-2">
          <div role="radiogroup" aria-label="Vista" className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5">
            {(['lista', 'pipeline'] as const).map(v => (
              <button key={v} role="radio" aria-checked={view === v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${view === v ? 'bg-[#0C4169] text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                {v === 'lista' ? 'Lista' : 'Pipeline'}
              </button>
            ))}
          </div>
          <button onClick={() => refreshData()} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-[11px] font-bold rounded-xl transition cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /><span>Actualizar</span>
          </button>
        </div>
      </div>
      {view === 'pipeline' ? <PipelineBoard {...props} /> : <LeadsTable {...props} />}
    </div>
  );
}
