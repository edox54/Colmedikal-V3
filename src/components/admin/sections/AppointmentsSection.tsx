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

type Props = Pick<AdminSharedProps, 'appointments' | 'updateAppointmentStatus' | 'refreshData'>;

export default function AppointmentsSection(props: Props) {
  const { appointments, updateAppointmentStatus, refreshData } = props;
        const pendientes = appointments.filter(a => a.status === 'Pendiente');
        const confirmadas = appointments.filter(a => a.status === 'Confirmada');
        const completadas = appointments.filter(a => a.status === 'Completada');
        const canceladas = appointments.filter(a => a.status === 'Cancelada');
        const today = new Date().toISOString().split('T')[0];
        const citasHoy = appointments.filter(a => a.aptDate === today);

        const handleAptStatus = (id: string, status: AppointmentItem['status']) => {
          updateAppointmentStatus(id, status);
        };

        return (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-appointments-panel">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">Citas Medicas Agendadas</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gestiona las citas de los asegurados. Los cambios se sincronizan con la base de datos.</p>
            </div>
            <button onClick={() => refreshData()} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-[11px] font-bold rounded-xl transition cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /><span>Actualizar</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{appointments.length}</span>
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Total</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
              <span className="text-lg font-black text-amber-700 font-mono">{pendientes.length}</span>
              <span className="block text-[9px] text-amber-600 font-bold uppercase">Pendientes</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-lg font-black text-emerald-700 font-mono">{confirmadas.length}</span>
              <span className="block text-[9px] text-emerald-600 font-bold uppercase">Confirmadas</span>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-center">
              <span className="text-lg font-black text-indigo-700 font-mono">{completadas.length}</span>
              <span className="block text-[9px] text-indigo-600 font-bold uppercase">Completadas</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl text-center">
              <span className="text-lg font-black text-teal-400 font-mono">{citasHoy.length}</span>
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Hoy</span>
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <div key={apt.id} className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
                  apt.status === 'Cancelada' ? 'border-red-100 opacity-60' : apt.status === 'Completada' ? 'border-emerald-100' : 'border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="space-y-3">
                    {/* Patient header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{apt.patientName}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          ID: {apt.patientId} • <a href={`tel:${apt.patientPhone}`} className="text-indigo-600 hover:underline">{apt.patientPhone}</a>
                        </p>
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        apt.status === 'Confirmada' ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : apt.status === 'Completada' ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                        : apt.status === 'Cancelada' ? 'text-red-700 bg-red-50 border-red-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}>{apt.status}</span>
                    </div>

                    {/* Doctor + Specialty */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{apt.doctorName}</span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase">{apt.specialty}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>{apt.clinic} ({apt.city})</span>
                        <span className={`font-bold uppercase ${apt.modality === 'telemedicina' ? 'text-indigo-600' : 'text-rose-600'}`}>
                          {apt.modality === 'telemedicina' ? 'Virtual' : 'Presencial'}
                        </span>
                      </div>
                    </div>

                    {/* Date/Time */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        <span className="font-mono font-bold">{apt.aptDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{apt.aptTime}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {apt.notes && apt.notes !== 'Sin comentarios adicionales' && (
                      <p className="text-[10px] text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg italic">
                        {apt.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 justify-end">
                    {apt.status === 'Pendiente' && (
                      <button onClick={() => handleAptStatus(apt.id, 'Confirmada')} className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg cursor-pointer">
                        Confirmar
                      </button>
                    )}
                    {apt.status === 'Confirmada' && (
                      <button onClick={() => handleAptStatus(apt.id, 'Completada')} className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer">
                        Completada
                      </button>
                    )}
                    {apt.status !== 'Cancelada' && apt.status !== 'Completada' && (
                      <button onClick={() => handleAptStatus(apt.id, 'Cancelada')} className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] rounded-lg border border-red-200 cursor-pointer">
                        Cancelar
                      </button>
                    )}
                    {/* Revert buttons */}
                    {apt.status === 'Confirmada' && (
                      <button onClick={() => handleAptStatus(apt.id, 'Pendiente')} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 font-bold text-[10px] rounded-lg cursor-pointer">
                        ← Pendiente
                      </button>
                    )}
                    {apt.status === 'Completada' && (
                      <button onClick={() => handleAptStatus(apt.id, 'Confirmada')} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 font-bold text-[10px] rounded-lg cursor-pointer">
                        ← Confirmada
                      </button>
                    )}
                    {apt.status === 'Cancelada' && (
                      <button onClick={() => handleAptStatus(apt.id, 'Pendiente')} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 font-bold text-[10px] rounded-lg cursor-pointer">
                        ← Reactivar
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No hay citas agendadas.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Las citas aparecen cuando los pacientes las solicitan desde /agendamiento.</p>
              </div>
            )}
          </div>
        </div>
        );
}
