import {
  Building2,
  Users,
  LogOut,
  DollarSign,
  FileCheck,
  Calendar,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  TrendingUp,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  HeartPulse,
  UserCheck,
  FileText,
  Stethoscope,
  Eye,
  X,
  Sparkles,
  ArrowRight,
  Filter,
  Download,
  Edit,
  Bell,
  RefreshCw,
  Hospital,
  Activity,
  FlaskConical,
  AlertCircle,
  Lock,
  EyeOff,
  ChevronRight,
} from 'lucide-react';
import { AdminSharedProps } from '../adminTypes';

type Props = Pick<AdminSharedProps, 'leads' | 'admins' | 'updateLeadStatus' | 'addLeadNote' | 'assignLead' | 'setLeadFollowUp' | 'setLeadLostReason' | 'deleteLead' | 'refreshData' | 'leadDateFilter' | 'setLeadDateFilter' | 'leadStatusFilter' | 'setLeadStatusFilter' | 'leadSourceFilter' | 'setLeadSourceFilter' | 'leadSearchFilter' | 'setLeadSearchFilter' | 'openNoteLeadId' | 'setOpenNoteLeadId' | 'noteText' | 'setNoteText' | 'canDeleteLeads' | 'resolvePlanName' | 'SOURCE_BADGE' | 'PLAN_CATALOG' | 'handlePlanChange' | 'exportLeadsCSV'>;

export default function LeadsSection(props: Props) {
  const { leads, admins, updateLeadStatus, addLeadNote, assignLead, setLeadFollowUp, setLeadLostReason, deleteLead, refreshData, leadDateFilter, setLeadDateFilter, leadStatusFilter, setLeadStatusFilter, leadSourceFilter, setLeadSourceFilter, leadSearchFilter, setLeadSearchFilter, openNoteLeadId, setOpenNoteLeadId, noteText, setNoteText, canDeleteLeads, resolvePlanName, SOURCE_BADGE, PLAN_CATALOG, handlePlanChange, exportLeadsCSV } = props;
        const today = new Date().toISOString().split('T')[0];
        const nuevos = leads.filter(l => l.status === 'Nuevo Plan');
        const contactados = leads.filter(l => l.status === 'Contactado');
        const cerrados = leads.filter(l => l.status === 'Cierre Efectivo');
        const perdidos = leads.filter(l => l.status === 'Perdido');
        const overdueFollowUps = leads.filter(l => l.followUpDate && l.followUpDate < today && l.status !== 'Cierre Efectivo' && l.status !== 'Perdido');
        const leadsHoy = leads.filter(l => l.timestamp?.startsWith(today));
        const pipelineTotal = leads.reduce((s, l) => s + Number(l.estimatedPrice || 0), 0);
        const pipelineNuevos = nuevos.reduce((s, l) => s + Number(l.estimatedPrice || 0), 0);
        const pipelineContactados = contactados.reduce((s, l) => s + Number(l.estimatedPrice || 0), 0);

        // Group duplicates by email/phone into clusters
        const clusterMap = new Map<string, typeof leads>();
        const assigned = new Set<string>();
        leads.forEach(ld => {
          if (assigned.has(ld.id)) return;
          const key = (ld.quoteData?.email?.toLowerCase().trim()) || ld.id;
          const phone = ld.quoteData?.phone?.replace(/\s/g, '') || '';
          const cluster = leads.filter(other => {
            if (assigned.has(other.id)) return false;
            const oEmail = other.quoteData?.email?.toLowerCase().trim() || '';
            const oPhone = other.quoteData?.phone?.replace(/\s/g, '') || '';
            return other.id === ld.id || (key && oEmail === key) || (phone && oPhone === phone);
          });
          cluster.forEach(c => assigned.add(c.id));
          clusterMap.set(ld.id, cluster);
        });

        // Apply filters
        let filteredClusters = Array.from(clusterMap.entries());
        if (leadDateFilter) {
          filteredClusters = filteredClusters.filter(([, cluster]) =>
            cluster.some(l => l.timestamp?.startsWith(leadDateFilter))
          );
        }
        if (leadStatusFilter !== 'all') {
          filteredClusters = filteredClusters.filter(([, cluster]) =>
            cluster.some(l => l.status === leadStatusFilter)
          );
        }
        if (leadSourceFilter !== 'all') {
          filteredClusters = filteredClusters.filter(([, cluster]) =>
            cluster.some(l => (l.quoteData?.source?.channel || 'Directo') === leadSourceFilter)
          );
        }
        if (leadSearchFilter) {
          const q = leadSearchFilter.toLowerCase();
          filteredClusters = filteredClusters.filter(([, cluster]) =>
            cluster.some(l =>
              l.quoteData?.fullName?.toLowerCase().includes(q) ||
              l.quoteData?.email?.toLowerCase().includes(q) ||
              l.quoteData?.phone?.includes(q) ||
              l.quoteData?.docNumber?.includes(q)
            )
          );
        }

        return (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-leads-panel">
          {/* Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">Cotizaciones Emitidas desde el Portal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">CRM de prospectos con deduplicación automática.</p>
            </div>
            <button onClick={() => refreshData()} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-[11px] font-bold rounded-xl transition cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /><span>Actualizar</span>
            </button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{leads.length}</span>
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Total Leads</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-lg font-black text-emerald-600 font-mono">{leadsHoy.length}</span>
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Hoy</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-lg font-black text-emerald-700 font-mono">{nuevos.length}</span>
              <span className="block text-[9px] text-emerald-600 font-bold uppercase">Nuevos</span>
              <span className="text-[9px] text-emerald-500 font-mono">${pipelineNuevos.toFixed(0)}/mes</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
              <span className="text-lg font-black text-amber-700 font-mono">{contactados.length}</span>
              <span className="block text-[9px] text-amber-600 font-bold uppercase">Contactados</span>
              <span className="text-[9px] text-amber-500 font-mono">${pipelineContactados.toFixed(0)}/mes</span>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-center">
              <span className="text-lg font-black text-indigo-700 font-mono">{cerrados.length}</span>
              <span className="block text-[9px] text-indigo-600 font-bold uppercase">Cerrados</span>
            </div>
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
              <span className="text-lg font-black text-rose-600 font-mono">{perdidos.length}</span>
              <span className="block text-[9px] text-rose-500 font-bold uppercase">Perdidos</span>
            </div>
            {overdueFollowUps.length > 0 && (
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-300 text-center col-span-2 sm:col-span-1">
                <span className="text-lg font-black text-orange-600 font-mono">{overdueFollowUps.length}</span>
                <span className="block text-[9px] text-orange-600 font-bold uppercase">Seguim. Vencidos</span>
              </div>
            )}
            <div className="bg-slate-900 p-3 rounded-xl text-center">
              <span className="text-lg font-black text-teal-400 font-mono">${pipelineTotal.toFixed(0)}</span>
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Pipeline/mes</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="date"
              value={leadDateFilter}
              onChange={e => setLeadDateFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-teal-500"
            />
            <select
              value={leadStatusFilter}
              onChange={e => setLeadStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-teal-500"
            >
              <option value="all">Todos los estados</option>
              <option value="Nuevo Plan">Nuevo Plan</option>
              <option value="Contactado">Contactado</option>
              <option value="Cierre Efectivo">Cierre Efectivo</option>
              <option value="Perdido">Perdido</option>
            </select>
            <select
              value={leadSourceFilter}
              onChange={e => setLeadSourceFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-teal-500"
            >
              <option value="all">Todos los orígenes</option>
              <option value="Directo">Directo</option>
              <option value="Orgánico">Orgánico</option>
              <option value="Redes sociales">Redes sociales</option>
              <option value="Pago">Pago</option>
              <option value="Referido">Referido</option>
              <option value="Campaña">Campaña</option>
              <option value="Otro sitio">Otro sitio</option>
            </select>
            <input
              type="text"
              value={leadSearchFilter}
              onChange={e => setLeadSearchFilter(e.target.value)}
              placeholder="Buscar nombre, email, cedula..."
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-teal-500 flex-1 min-w-[180px]"
            />
            {(leadDateFilter || leadStatusFilter !== 'all' || leadSourceFilter !== 'all' || leadSearchFilter) && (
              <button onClick={() => { setLeadDateFilter(''); setLeadStatusFilter('all'); setLeadSourceFilter('all'); setLeadSearchFilter(''); }} className="text-[10px] text-teal-600 font-bold hover:underline cursor-pointer">
                Limpiar filtros
              </button>
            )}
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{filteredClusters.length} grupo(s)</span>
            <button
              onClick={() => exportLeadsCSV(filteredClusters)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition"
              title="Descargar Excel (CSV) con los leads filtrados"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
              Exportar CSV
            </button>
          </div>

          {/* Lead list — grouped by duplicate cluster. Compact rows (not tall
              cards) so more leads fit on screen without scrolling; secondary
              info (duplicates/asignación/notas) is tucked behind "Más detalles". */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {filteredClusters.length > 0 ? (
              filteredClusters.map(([clusterId, cluster]) => {
                const primary = cluster[0];
                const hasDupes = cluster.length > 1;
                const planName = resolvePlanName(primary);
                return (
                <div key={clusterId} className={`p-3.5 ${hasDupes ? 'bg-amber-50/40' : ''}`}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {/* Identity */}
                    <div className="min-w-[160px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest font-mono">
                          {primary.quoteData?.leadCode || primary.id.slice(0, 12).toUpperCase()}
                        </span>
                        {hasDupes && (
                          <span className="text-[8px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                            {cluster.length} registros
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{primary.quoteData?.fullName || '—'}</h4>
                      {planName
                        ? <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold uppercase inline-block">{planName}</span>
                        : <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded font-medium italic inline-block">Sin plan seleccionado</span>}
                      <select
                        defaultValue=""
                        onChange={(e) => { handlePlanChange(primary.id, e.target.value); e.target.value = ''; }}
                        className="mt-1 block text-[9px] px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 outline-none cursor-pointer"
                        title="Cambiar el plan del cliente"
                      >
                        <option value="" disabled>Cambiar plan…</option>
                        {Object.entries(PLAN_CATALOG).map(([id, p]) => (
                          <option key={id} value={id}>{p.name} — ${p.basePrice}/mes</option>
                        ))}
                      </select>
                    </div>

                    {/* Contact */}
                    <div className="min-w-[140px] text-xs">
                      <a href={`tel:${primary.quoteData?.phone}`} className="font-bold text-indigo-650 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" /><span>{primary.quoteData?.phone || '—'}</span>
                      </a>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block max-w-[160px]">{primary.quoteData?.email || '—'}</span>
                    </div>

                    {/* Doc */}
                    <div className="min-w-[120px] text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px] block">{primary.quoteData?.docNumber || '—'}</span>
                      <span className="block text-[9px] text-slate-400 dark:text-slate-500 capitalize">
                        {primary.quoteData?.docType === 'pasaporte' ? 'Pasaporte' : 'Cedula'} • {primary.quoteData?.type || '—'}
                        {(primary.quoteData?.childrenCount ?? 0) > 0 ? ` • ${primary.quoteData?.childrenCount} dep.` : ''}
                      </span>
                      {primary.quoteData?.birthDate && (
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500">Nac.: {primary.quoteData.birthDate}</span>
                      )}
                    </div>

                    {/* Origin */}
                    <div className="min-w-[110px]">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase inline-block ${SOURCE_BADGE[primary.quoteData?.source?.channel || 'Directo']}`}>
                        {primary.quoteData?.source?.channel || 'Directo'}
                      </span>
                      {primary.quoteData?.source?.detail && (
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[110px]" title={primary.quoteData.source.detail}>
                          {primary.quoteData.source.detail}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {/* Without a chosen plan, this is a rough ballpark, not a quote for
                          a specific plan — labeled distinctly so it can't be misread as
                          "the customer picked the $X/mes plan" when none was picked. */}
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block">{planName ? 'Est.:' : 'Est. Preliminar:'}</span>
                      <span className={`text-sm font-black font-mono ${planName ? 'text-indigo-750' : 'text-slate-400 dark:text-slate-500'}`}>${Number(primary.estimatedPrice || 0).toFixed(2)}/m</span>
                    </div>

                    {/* Status */}
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">
                        {new Date(primary.timestamp).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase mt-0.5 inline-block ${
                        primary.status === 'Cierre Efectivo' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        : primary.status === 'Contactado' ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : primary.status === 'Perdido' ? 'bg-rose-50 text-rose-700 border border-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>{primary.status}</span>
                      {primary.lostReason && (
                        <span className="block text-[9px] text-rose-400 mt-0.5">{primary.lostReason}</span>
                      )}
                      {primary.followUpDate && primary.status !== 'Cierre Efectivo' && primary.status !== 'Perdido' && (
                        <span className={`block text-[9px] mt-0.5 font-mono ${primary.followUpDate < today ? 'text-orange-600 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                          {primary.followUpDate < today ? '⚠ Vencido: ' : '📅 Seguim.: '}{primary.followUpDate}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 items-center flex-wrap ml-auto">
                      {/* WhatsApp quick contact */}
                      {primary.quoteData?.phone && (
                        <a
                          href={`https://wa.me/${primary.quoteData.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${primary.quoteData?.fullName?.split(' ')[0] || ''}, te contactamos de Colmedikal. Vimos tu cotización del ${resolvePlanName(primary) || 'plan médico'} por $${Number(primary.estimatedPrice||0).toFixed(2)}/mes. ¿Tienes un momento para conversar sobre tu cobertura?`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition cursor-pointer"
                          title="Contactar por WhatsApp"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </a>
                      )}
                      {/* Follow-up date picker */}
                      {primary.status !== 'Cierre Efectivo' && primary.status !== 'Perdido' && (
                        <input
                          type="date"
                          value={primary.followUpDate || ''}
                          onChange={e => setLeadFollowUp(primary.id, e.target.value)}
                          className={`px-1.5 py-1 text-[10px] border rounded-lg focus:outline-none focus:border-teal-400 cursor-pointer font-mono ${primary.followUpDate && primary.followUpDate < today ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'}`}
                          title="Fecha de seguimiento"
                        />
                      )}
                      {/* Pipeline forward buttons */}
                      {primary.status === 'Nuevo Plan' && (
                        <button onClick={() => updateLeadStatus(primary.id, 'Contactado')} className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg cursor-pointer">
                          Contactado
                        </button>
                      )}
                      {primary.status === 'Contactado' && (
                        <button onClick={() => updateLeadStatus(primary.id, 'Cierre Efectivo')} className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer">
                          Cierre Efectivo
                        </button>
                      )}
                      {/* Revert buttons */}
                      {primary.status === 'Contactado' && (
                        <button onClick={() => updateLeadStatus(primary.id, 'Nuevo Plan')} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 font-bold text-[10px] rounded-lg cursor-pointer" title="Regresar a Nuevo Plan">
                          ← Nuevo
                        </button>
                      )}
                      {primary.status === 'Cierre Efectivo' && (
                        <button onClick={() => updateLeadStatus(primary.id, 'Contactado')} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 font-bold text-[10px] rounded-lg cursor-pointer" title="Regresar a Contactado">
                          ← Contactado
                        </button>
                      )}
                      {/* Lost */}
                      {primary.status !== 'Cierre Efectivo' && primary.status !== 'Perdido' && (
                        <select
                          defaultValue=""
                          onChange={e => { if (e.target.value) setLeadLostReason(primary.id, e.target.value); e.target.value = ''; }}
                          className="px-1.5 py-1 text-[10px] border border-rose-200 bg-rose-50 text-rose-600 rounded-lg focus:outline-none cursor-pointer font-sans"
                          title="Marcar como perdido"
                        >
                          <option value="" disabled>✕ Perdido…</option>
                          <option value="Precio muy alto">Precio muy alto</option>
                          <option value="Eligió competencia">Eligió competencia</option>
                          <option value="No contestó">No contestó</option>
                          <option value="No está interesado">No está interesado</option>
                          <option value="Otro motivo">Otro motivo</option>
                        </select>
                      )}
                      {primary.status === 'Perdido' && (
                        <button onClick={() => updateLeadStatus(primary.id, 'Nuevo Plan')} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 font-bold text-[10px] rounded-lg cursor-pointer">
                          ↺ Reabrir
                        </button>
                      )}
                      {canDeleteLeads && (
                        <button
                          onClick={async () => {
                            const name = primary.quoteData?.fullName || primary.id;
                            const msg = cluster.length > 1
                              ? `¿Eliminar los ${cluster.length} registros de "${name}"?`
                              : `¿Eliminar la cotización de "${name}"?`;
                            if (!confirm(msg)) return;
                            await Promise.all(cluster.map(l => deleteLead(l.id)));
                          }}
                          className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar cotización"
                        ><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </div>

                  {/* Everything used less often lives behind this toggle — keeps
                      the default row short so more leads fit without scrolling. */}
                  <details className="mt-2 text-[10px] group">
                    <summary className="cursor-pointer text-slate-400 dark:text-slate-500 font-semibold hover:text-teal-600 list-none flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                      <span>Más detalles</span>
                      {(primary.notes || []).length > 0 && <span className="text-amber-500">({(primary.notes || []).length} nota{(primary.notes || []).length === 1 ? '' : 's'})</span>}
                    </summary>
                    <div className="mt-2 space-y-2.5 pl-4 border-l-2 border-slate-150">
                      {/* Duplicate history */}
                      {hasDupes && (
                        <div className="space-y-1.5">
                          <span className="block font-bold text-amber-600">{cluster.length - 1} cotizacion(es) anterior(es):</span>
                          {cluster.slice(1).map(dup => (
                            <div key={dup.id} className="text-slate-500 dark:text-slate-400 flex justify-between">
                              <span>{new Date(dup.timestamp).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })} — ${Number(dup.estimatedPrice || 0).toFixed(2)}/m</span>
                              <span className="text-slate-400 dark:text-slate-500">{dup.status}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Assign to */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Asignado:</span>
                        <select
                          value={primary.assignedTo || ''}
                          onChange={e => assignLead(primary.id, e.target.value)}
                          className="flex-1 px-2 py-1 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:border-teal-400 font-sans max-w-[220px]"
                        >
                          <option value="">— Sin asignar —</option>
                          {admins.filter(a => a.active).map(a => (
                            <option key={a.email} value={a.email}>{a.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Notes list */}
                      {(primary.notes || []).length > 0 && (
                        <div className="space-y-1.5 max-h-24 overflow-y-auto">
                          {(primary.notes || []).map((n, i) => (
                            <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                              <span className="text-amber-800 font-medium leading-snug block">{n.text}</span>
                              <span className="text-amber-500 font-mono">{n.author} · {new Date(n.timestamp).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add note */}
                      {openNoteLeadId === primary.id ? (
                        <div className="flex gap-1.5">
                          <input
                            autoFocus
                            type="text"
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && noteText.trim()) {
                                const stored = sessionStorage.getItem('colmedikal_user');
                                const author = stored ? JSON.parse(stored)?.name || 'Admin' : 'Admin';
                                addLeadNote(primary.id, { text: noteText.trim(), author, timestamp: new Date().toISOString() });
                                setNoteText(''); setOpenNoteLeadId(null);
                              }
                              if (e.key === 'Escape') { setNoteText(''); setOpenNoteLeadId(null); }
                            }}
                            placeholder="Escribe una nota... (Enter para guardar)"
                            className="flex-1 px-2.5 py-1.5 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 bg-teal-50"
                          />
                          <button
                            onClick={() => {
                              if (noteText.trim()) {
                                const stored = sessionStorage.getItem('colmedikal_user');
                                const author = stored ? JSON.parse(stored)?.name || 'Admin' : 'Admin';
                                addLeadNote(primary.id, { text: noteText.trim(), author, timestamp: new Date().toISOString() });
                              }
                              setNoteText(''); setOpenNoteLeadId(null);
                            }}
                            className="px-2 py-1 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg cursor-pointer"
                          >✓</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setOpenNoteLeadId(primary.id); setNoteText(''); }}
                          className="text-slate-400 dark:text-slate-500 hover:text-teal-600 font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <span>+</span> Agregar nota
                        </button>
                      )}
                    </div>
                  </details>
                </div>
                );
              })
            ) : (
              <div className="text-center py-12 p-6">
                <Briefcase className="w-12 h-12 text-slate-350 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{leads.length === 0 ? 'No hay cotizaciones registradas.' : 'No hay resultados con los filtros actuales.'}</p>
              </div>
            )}
          </div>
        </div>
        );
}
