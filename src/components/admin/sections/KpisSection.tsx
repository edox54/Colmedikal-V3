import { createPortal } from 'react-dom';
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
import { AppointmentItem } from '../../../types';
import { AdminSharedProps } from '../adminTypes';

type Props = Pick<AdminSharedProps, 'doctors' | 'refunds' | 'appointments' | 'leads' | 'activeTab' | 'setActiveTab' | 'pendingRefunds' | 'totalRefundAmountPending' | 'totalLeadsUncontacted' | 'pendingAuthsCount'>;

export default function KpisSection(props: Props) {
  const { doctors, refunds, appointments, leads, setActiveTab, pendingRefunds, totalRefundAmountPending, totalLeadsUncontacted, pendingAuthsCount } = props;
  return (
        <div className="space-y-8 animate-in fade-in duration-200" id="admin-kpi-panel">
          
          {/* Bento Statistcs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* KPI 1: REEMBOLSOS */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Reembolsos a Liquidar</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">${totalRefundAmountPending.toFixed(2)}</span>
                <span className="text-[10px] text-rose-650 font-bold block">{pendingRefunds.length} Solicitudes entrantes hoy</span>
              </div>
            </div>

            {/* KPI 2: PROSPECTOS */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Cotizaciones Recibidas Activas</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{leads.length} Unidades</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">{totalLeadsUncontacted} pendientes de revisión</span>
              </div>
            </div>

            {/* KPI 3: AUTORIZACIONES */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Auditorías Complejas</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{pendingAuthsCount} Quirúrgicos</span>
                <span className="text-[10px] text-indigo-650 font-semibold block">Pendiente de dictamen clínico</span>
              </div>
            </div>

            {/* KPI 4: DOCTORS Listings */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Especialistas Asegurados</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{doctors.length} Médicos</span>
                <span className="text-[10px] text-teal-650 font-semibold block">Habilitados en Quito, Gye y Cuenca</span>
              </div>
            </div>

          </div>

          {/* Embudo de Conversión */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h4 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-500" />
              Embudo de Conversión de Prospectos
            </h4>
            {[
              { label: 'Nuevo Plan', count: leads.filter(l => l.status === 'Nuevo Plan').length, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
              { label: 'Contactado', count: leads.filter(l => l.status === 'Contactado').length, color: 'bg-amber-500', textColor: 'text-amber-700' },
              { label: 'Cierre Efectivo', count: leads.filter(l => l.status === 'Cierre Efectivo').length, color: 'bg-indigo-600', textColor: 'text-indigo-700' },
            ].map((stage, i, arr) => {
              const maxCount = Math.max(...arr.map(s => s.count), 1);
              const pct = Math.round((stage.count / maxCount) * 100);
              const convRate = i > 0 && arr[i - 1].count > 0
                ? Math.round((stage.count / arr[i - 1].count) * 100)
                : null;
              return (
                <div key={stage.label} className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${stage.textColor} w-28 shrink-0 text-right`}>{stage.label}</span>
                  <div className="flex-1 relative">
                    <div
                      className={`${stage.color} h-8 rounded-lg flex items-center justify-center transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      <span className="text-white text-xs font-black drop-shadow">{stage.count}</span>
                    </div>
                  </div>
                  {convRate !== null && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold shrink-0 flex items-center gap-0.5">
                      <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {convRate}%
                    </span>
                  )}
                  {convRate === null && <span className="w-10 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Connected state simulator guide banner */}
          <section className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1 md:max-w-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
                <span>¿Cómo funciona el Control Conectado de Colmedikal?</span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                Este panel manipula de forma exclusiva los datos del servidor central virtual (simulado en <code>localStorage</code>). Al autorizar un reembolso o agregar un doctor, los cambios se propagan de inmediato al Portal de Clientes y al cotizador web, simulando un entrono real de producción.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('refunds')} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 dark:text-white text-[11px] font-bold rounded-lg cursor-pointer">
                Auditar Facturas
              </button>
              <button onClick={() => setActiveTab('leads')} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-teal-400 text-[11px] font-semibold rounded-lg border border-slate-700 cursor-pointer">
                Analizar Cotizaciones
              </button>
            </div>
          </section>

          {/* Quick logs representation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick prospects leads tracker list */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Últimas Cotizaciones del Portal</span>
                </h4>
                <button onClick={() => setActiveTab('leads')} className="text-[10px] font-bold text-teal-650 hover:underline cursor-pointer">
                  Ver todo
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {leads.slice(0, 3).map((ld) => (
                  <div key={ld.id} className="py-3 flex justify-between items-start text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">{ld.quoteData?.fullName || '—'}</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{ld.quoteData?.leadCode || ld.id.slice(0, 12).toUpperCase()} • {ld.quoteData?.phone || '—'}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">{new Date(ld.timestamp).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">${Number(ld.estimatedPrice || 0).toFixed(2)}/mes</span>
                      <span className="block text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded uppercase text-center w-full">
                        {ld.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick upcoming consultation medical logs */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Últimas Citas Agendadas por Pacientes</span>
                </h4>
                <button onClick={() => setActiveTab('appointments')} className="text-[10px] font-bold text-teal-650 hover:underline cursor-pointer">
                  Ver todas
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="py-3 flex justify-between items-start text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">{apt.patientName}</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Médico: {apt.doctorName} ({apt.specialty})</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{apt.aptDate} @ {apt.aptTime}</span>
                      <span className={`block text-[9px] font-bold px-1.5 py-0.2 rounded uppercase text-center ${
                        apt.status === 'Confirmada' ? 'text-teal-700 bg-teal-50' : 'text-amber-700 bg-amber-50'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
  );
}
