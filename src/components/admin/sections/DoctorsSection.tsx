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
import { Doctor } from '../../../types';
import { AdminSharedProps } from '../adminTypes';

type Props = Pick<AdminSharedProps, 'doctors' | 'deleteDoctor' | 'toggleDoctorActiveStatus' | 'newDoc' | 'setNewDoc' | 'editingDocId' | 'docSuccessMsg' | 'handleAddDoctor' | 'handleEditInitiate' | 'handleCancelEdit' | 'avatarGomez' | 'avatarRestrepo' | 'avatarDoctorM2' | 'avatarDoctorF2'>;

export default function DoctorsSection(props: Props) {
  const { doctors, deleteDoctor, toggleDoctorActiveStatus, newDoc, setNewDoc, editingDocId, docSuccessMsg, handleAddDoctor, handleEditInitiate, handleCancelEdit, avatarGomez, avatarRestrepo, avatarDoctorM2, avatarDoctorF2 } = props;
  return (
        <div className="space-y-8 animate-in fade-in duration-200" id="admin-doctors-panel">
          
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Módulo de Especialistas Médicos del País</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Agrega nuevos profesionales de la salud al live board para que los asegurados los agenden de forma instantánea. Elimina profesionales que dejen de pertenecer a la red de cobertura.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* New Doctor form block */}
            <form onSubmit={handleAddDoctor} className="lg:col-span-4 bg-slate-55 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {editingDocId ? 'Editar Especialista de Red' : 'Registrar Nuevo Médico'}
              </span>
              
              {docSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-xl flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{docSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Doctor Name */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Nombre del Médico:</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Dr. Andrés Noboa"
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Specialty */}
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Especialidad / Tipo:</label>
                    <select
                      value={newDoc.specialty}
                      onChange={(e) => setNewDoc({...newDoc, specialty: e.target.value})}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <optgroup label="— Establecimientos —">
                        <option value="Hospital">Hospital</option>
                        <option value="Clínica">Clínica</option>
                        <option value="Centro Médico">Centro Médico</option>
                        <option value="Laboratorio Clínico">Laboratorio Clínico</option>
                        <option value="Odontología">Odontología</option>
                      </optgroup>
                      <optgroup label="— Especialidades médicas —">
                        <option value="Dermatología">Dermatología</option>
                        <option value="Cardiología">Cardiología</option>
                        <option value="Ginecología y Obstetricia">Ginecología</option>
                        <option value="Pediatría y Neonatología">Pediatría</option>
                        <option value="Traumatología y Ortopedia">Traumatología</option>
                        <option value="Odontología y Maxilofacial">Odontología Espec.</option>
                        <option value="Medicina General">Medicina General</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* City */}
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Ciudad:</label>
                    <select
                      value={newDoc.city}
                      onChange={(e) => setNewDoc({...newDoc, city: e.target.value})}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="Quito">Quito</option>
                      <option value="Guayaquil">Guayaquil</option>
                      <option value="Cuenca">Cuenca</option>
                    </select>
                  </div>
                </div>

                {/* Nivel */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Nivel de Red:</label>
                  <select
                    value={newDoc.nivel}
                    onChange={(e) => setNewDoc({...newDoc, nivel: Number(e.target.value)})}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value={1}>Nivel 1 — Plan 2K, 3K y 5K</option>
                    <option value={2}>Nivel 2</option>
                    <option value={3}>Nivel 3</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Phone */}
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Teléfono:</label>
                    <input 
                      type="text"
                      placeholder="Ej. 02-390251"
                      value={newDoc.phone}
                      onChange={(e) => setNewDoc({...newDoc, phone: e.target.value})}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Costo Consulta ($):</label>
                    <input 
                      type="number"
                      min="0"
                      max="150"
                      value={newDoc.cost}
                      onChange={(e) => setNewDoc({...newDoc, cost: Number(e.target.value)})}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Address / clinic */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Dirección:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Av. República E6-447 y Eloy Alfaro, Quito"
                    value={newDoc.clinic}
                    onChange={(e) => setNewDoc({...newDoc, clinic: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                {/* Schedule / availability */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Horario de Atención:</label>
                  <input
                    type="text"
                    placeholder="Ej. Lu-Vi 08:00-17:00 | Sáb 09:00-13:00"
                    value={newDoc.availability}
                    onChange={(e) => setNewDoc({...newDoc, availability: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 pt-0.5">Puede usar | para separar bloques. Ej: Lu-Vi 08:30-18:30 | Sáb 09:00-13:00</p>
                </div>

                {/* Education and degree */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Educación o Subespecialidad:</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Cirujano de Tórax - Universidad de París, Francia"
                    value={newDoc.education}
                    onChange={(e) => setNewDoc({...newDoc, education: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                {/* Icon / Photo selector */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Ícono / Foto:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {/* Establishment icons */}
                    {[
                      { id: 'icon_hospital', label: 'Hospital', Icon: Hospital,     bg: 'bg-rose-50   border-rose-200   text-rose-600'   },
                      { id: 'icon_lab',      label: 'Lab',      Icon: FlaskConical, bg: 'bg-amber-50  border-amber-200  text-amber-600'  },
                      { id: 'icon_dental',   label: 'Dental',   Icon: Sparkles,     bg: 'bg-sky-50    border-sky-200    text-sky-600'    },
                      { id: 'icon_building', label: 'Centro',   Icon: Building2,    bg: 'bg-teal-50   border-teal-200   text-teal-600'   },
                    ].map(({ id, label, Icon, bg }) => (
                      <button type="button" key={id} onClick={() => setNewDoc({...newDoc, image: id})}
                        className={`p-1.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${newDoc.image === id ? 'border-indigo-600 scale-95' : 'border-slate-200 dark:border-slate-800'}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${bg}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mt-1">
                    {/* Doctor avatars */}
                    {[
                      { id: 'doctor_m',  alias: 'Dr. M1', img: avatarGomez },
                      { id: 'doctor_f',  alias: 'Dra. F1', img: avatarRestrepo },
                      { id: 'doctor_m2', alias: 'Dr. M2', img: avatarDoctorM2 },
                      { id: 'doctor_f2', alias: 'Dra. F2', img: avatarDoctorF2 }
                    ].map((avatar) => (
                      <button type="button" key={avatar.id} onClick={() => setNewDoc({...newDoc, image: avatar.id})}
                        className={`p-1 rounded-xl border-2 transition-all overflow-hidden ${newDoc.image === avatar.id ? 'border-indigo-600 scale-95' : 'border-slate-200 dark:border-slate-800'}`}>
                        <img src={avatar.img} alt="" className="w-full h-8 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 block text-center mt-0.5">{avatar.alias}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full py-3.5 text-center bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
                >
                  {editingDocId ? 'Guardar Cambios ✓' : 'Habilitar Doctor en Directorio Live'}
                </button>

                {editingDocId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full py-2.5 text-center bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>
            </form>

            {/* Live listings of active doctors list */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">médicos en convenio disponibles ({doctors.length})</span>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[550px] overflow-y-auto pr-2 space-y-1.5 scrollbar-thin">
                {doctors.map((doc) => (
                  <div key={doc.id} className="py-3 flex justify-between items-center text-xs gap-3">
                    <div className="flex gap-3.5 items-center">
                      <img 
                        src={doc.image} 
                        alt="" 
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{doc.name}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                          <span>{doc.specialty}</span>
                          {doc.nivel && <span className="bg-[#0C4169]/10 text-[#0C4169] px-1.5 py-0.5 rounded text-[8px] font-black uppercase">N{doc.nivel}</span>}
                          <strong>{doc.clinic} ({doc.city})</strong>
                        </p>
                        <p className="text-[9px] text-indigo-600 font-mono italic max-w-[320px] truncate" title={doc.education}>{doc.education}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-408 font-bold font-mono block">${doc.cost} / cons.</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full inline-block ${doc.active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                          {doc.active !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEditInitiate(doc)}
                        className="px-2 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1"
                        title="Editar prestador médico"
                      >
                        <Edit className="w-3 h-3 text-amber-600" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleDoctorActiveStatus(doc.id)}
                        className={`px-2 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${doc.active !== false ? 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800' : 'bg-[#e2f0fb] text-[#0C4169] border-[#4597CA] hover:bg-sky-50'}`}
                        title={doc.active !== false ? "Hacer de baja temporal" : "Reestablecer en el directorio"}
                      >
                        {doc.active !== false ? 'Desactivar' : 'Activar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Hacer de baja al ${doc.name} de la red de clínicas de Colmedikal?`)) {
                            deleteDoctor(doc.id);
                          }
                        }}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar del Directorio"
                        id={`btn-del-doc-${doc.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
  );
}
