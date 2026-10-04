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
import { useState, type FormEvent } from 'react';
import type { AppointmentChange, AppointmentItem } from '../../../types';
import { AdminSharedProps } from '../adminTypes';

type Props = Pick<AdminSharedProps, 'appointments' | 'updateAppointmentStatus' | 'refreshData'>;
type Mode = 'confirm' | 'reschedule' | 'cancel' | 'complete' | 'noshow' | 'message' | 'reactivate';

const BADGE: Record<AppointmentItem['status'], string> = {
  Pendiente: 'text-amber-700 bg-amber-50 border-amber-200',
  Confirmada: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Reagendada: 'text-sky-700 bg-sky-50 border-sky-200',
  Completada: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  Cancelada: 'text-red-700 bg-red-50 border-red-200',
  'No asistió': 'text-slate-600 bg-slate-100 border-slate-300',
};
const ACTIVE: AppointmentItem['status'][] = ['Pendiente', 'Confirmada', 'Reagendada'];
const fmtAt = (v: string) => new Date(v).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AppointmentsSection(props: Props) {
  const { appointments, updateAppointmentStatus, refreshData } = props;
  const [action, setAction] = useState<{ apt: AppointmentItem; mode: Mode } | null>(null);
  const [flash, setFlash] = useState('');
  const pendientes = appointments.filter(a => a.status === 'Pendiente');
  const confirmadas = appointments.filter(a => a.status === 'Confirmada' || a.status === 'Reagendada');
  const completadas = appointments.filter(a => a.status === 'Completada');
  const today = new Date().toISOString().split('T')[0];
  const citasHoy = appointments.filter(a => a.aptDate === today && ACTIVE.includes(a.status));

  const btn = 'px-2.5 py-1 font-bold text-[10px] rounded-lg cursor-pointer';
  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="admin-appointments-panel">
      {action && <AptActionDialog apt={action.apt} mode={action.mode} onClose={() => setAction(null)}
        onSave={async change => { const r = await updateAppointmentStatus(action.apt.id, change); setAction(null); setFlash(r.emailed ? `Cita actualizada. Avisamos al paciente por correo.` : 'Cita actualizada. No encontramos el correo del paciente; avísale por teléfono.'); setTimeout(() => setFlash(''), 6000); }} />}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-950 dark:text-white">Citas Medicas Agendadas</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cada cambio se guarda para todo el equipo, se refleja en Mi Colmedikal y se avisa al paciente por correo.</p>
        </div>
        <button onClick={() => refreshData()} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-[11px] font-bold rounded-xl transition cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /><span>Actualizar</span>
        </button>
      </div>
      {flash && <div role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">{flash}</div>}

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
          <span className="block text-[9px] text-emerald-600 font-bold uppercase">Confirmadas / reagendadas</span>
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
              apt.status === 'Cancelada' || apt.status === 'No asistió' ? 'border-red-100 opacity-70' : apt.status === 'Completada' ? 'border-emerald-100' : 'border-slate-200 dark:border-slate-800'
            }`}>
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{apt.patientName}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      ID: {apt.patientId} • <a href={`tel:${apt.patientPhone}`} className="text-indigo-600 hover:underline">{apt.patientPhone}</a>
                      {' '}• <a href={`https://wa.me/593${apt.patientPhone.replace(/\D/g, '').replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">WhatsApp</a>
                    </p>
                  </div>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border whitespace-nowrap ${BADGE[apt.status] || BADGE.Pendiente}`}>{apt.status}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    {apt.doctorName ? <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{apt.doctorName}</span> : <span className="text-[11px] italic text-slate-400">Médico por asignar (al confirmar)</span>}
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase">{apt.specialty}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 gap-2">
                    <span>{apt.clinic} ({apt.city})</span>
                    <span className={`font-bold uppercase ${apt.modality === 'telemedicina' ? 'text-indigo-600' : 'text-rose-600'}`}>
                      {apt.modality === 'telemedicina' ? 'Virtual' : 'Presencial'}
                    </span>
                  </div>
                </div>

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

                {apt.notes && apt.notes !== 'Sin comentarios adicionales' && (
                  <p className="text-[10px] text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg italic">Paciente: {apt.notes}</p>
                )}
                {apt.note && <p className="text-[10px] text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg">Al paciente: {apt.note}</p>}
                {apt.history && apt.history.length > 0 && (
                  <details className="text-[10px] text-slate-500">
                    <summary className="cursor-pointer font-bold">Historial ({apt.history.length})</summary>
                    <ul className="mt-1 space-y-0.5">
                      {[...apt.history].reverse().map((h, i) => <li key={i}>{fmtAt(h.at)} · {h.by}: {h.action}{h.note ? ` — ${h.note}` : ''}</li>)}
                    </ul>
                  </details>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 justify-end">
                {apt.status === 'Pendiente' && <button onClick={() => setAction({ apt, mode: 'confirm' })} className={`${btn} bg-emerald-500 hover:bg-emerald-600 text-white`}>Confirmar</button>}
                {ACTIVE.includes(apt.status) && <button onClick={() => setAction({ apt, mode: 'reschedule' })} className={`${btn} bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200`}>Reagendar</button>}
                {(apt.status === 'Confirmada' || apt.status === 'Reagendada') && <button onClick={() => setAction({ apt, mode: 'complete' })} className={`${btn} bg-indigo-600 hover:bg-indigo-700 text-white`}>Atendida</button>}
                {(apt.status === 'Confirmada' || apt.status === 'Reagendada') && <button onClick={() => setAction({ apt, mode: 'noshow' })} className={`${btn} bg-slate-100 hover:bg-slate-200 text-slate-600`}>No asistió</button>}
                {ACTIVE.includes(apt.status) && <button onClick={() => setAction({ apt, mode: 'cancel' })} className={`${btn} bg-red-50 hover:bg-red-100 text-red-700 border border-red-200`}>Cancelar</button>}
                {!ACTIVE.includes(apt.status) && <button onClick={() => setAction({ apt, mode: 'reactivate' })} className={`${btn} bg-slate-100 hover:bg-slate-200 text-slate-600`}>← Reactivar</button>}
                <button onClick={() => setAction({ apt, mode: 'message' })} className={`${btn} bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200`}>Mensaje</button>
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

const MODE: Record<Mode, { title: string; status?: AppointmentItem['status']; cta: string; noteLabel: string; noteRequired?: boolean }> = {
  confirm: { title: 'Confirmar cita', status: 'Confirmada', cta: 'Confirmar y avisar', noteLabel: 'Indicaciones para el paciente (opcional)' },
  reschedule: { title: 'Reagendar cita', status: 'Reagendada', cta: 'Reagendar y avisar', noteLabel: 'Motivo del cambio (opcional)' },
  cancel: { title: 'Cancelar cita', status: 'Cancelada', cta: 'Cancelar y avisar', noteLabel: 'Motivo para el paciente', noteRequired: true },
  complete: { title: 'Marcar como atendida', status: 'Completada', cta: 'Guardar', noteLabel: 'Comentario (opcional)' },
  noshow: { title: 'Paciente no asistió', status: 'No asistió', cta: 'Guardar', noteLabel: 'Comentario (opcional)' },
  message: { title: 'Mensaje al paciente', cta: 'Enviar mensaje', noteLabel: 'Mensaje', noteRequired: true },
  reactivate: { title: 'Reactivar cita', status: 'Pendiente', cta: 'Reactivar', noteLabel: 'Comentario (opcional)' },
};

function AptActionDialog({ apt, mode, onSave, onClose }: { apt: AppointmentItem; mode: Mode; onSave: (c: AppointmentChange) => Promise<void>; onClose: () => void }) {
  const m = MODE[mode];
  const [doctorName, setDoctorName] = useState(apt.doctorName || '');
  const [aptDate, setAptDate] = useState(apt.aptDate);
  const [aptTime, setAptTime] = useState((apt.aptTime || '').slice(0, 5));
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const showDoctor = mode === 'confirm' || mode === 'reschedule';
  const showWhen = mode === 'confirm' || mode === 'reschedule';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (m.noteRequired && !note.trim()) return setErr('Escribe el mensaje para el paciente.');
    if (mode === 'reschedule' && (!aptDate || !aptTime)) return setErr('Indica la nueva fecha y hora.');
    setBusy(true); setErr('');
    try {
      await onSave({
        status: m.status || apt.status,
        note: note.trim() || undefined,
        ...(showDoctor && doctorName.trim() ? { doctorName: doctorName.trim() } : {}),
        ...(showWhen && aptDate !== apt.aptDate ? { aptDate } : {}),
        ...(showWhen && aptTime && aptTime !== (apt.aptTime || '').slice(0, 5) ? { aptTime } : {}),
      });
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : 'No se pudo guardar'); setBusy(false); }
  };

  const input = 'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400';
  const label = 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="apt-action-title" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-xl p-6 space-y-4">
        <div>
          <h3 id="apt-action-title" className="text-base font-black text-slate-900 dark:text-white">{m.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{apt.patientName} · {apt.specialty} · {apt.clinic}</p>
        </div>
        {err && <p className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{err}</p>}
        {showDoctor && (
          <label className={label}>Médico asignado
            <input value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Ej. Dr. Juan Ruiz" className={input} />
          </label>
        )}
        {showWhen && (
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>Fecha<input type="date" value={aptDate} onChange={e => setAptDate(e.target.value)} className={input} required={mode === 'reschedule'} /></label>
            <label className={label}>Hora<input type="time" value={aptTime} onChange={e => setAptTime(e.target.value)} className={input} required={mode === 'reschedule'} /></label>
          </div>
        )}
        <label className={label}>{m.noteLabel}
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className={input} />
        </label>
        <p className="text-[11px] text-slate-400">El paciente lo verá en Mi Colmedikal y recibirá un correo.</p>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer">Volver</button>
          <button type="submit" disabled={busy} className="flex-1 py-2.5 rounded-xl bg-[#0C4169] hover:bg-slate-900 disabled:opacity-60 text-white text-xs font-bold cursor-pointer">{busy ? 'Guardando…' : m.cta}</button>
        </div>
      </form>
    </div>
  );
}
