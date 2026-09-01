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

type Props = Pick<AdminSharedProps, 'authorizations' | 'updateAuthorizationStatus' | 'setSelectedDocument' | 'adminComment' | 'setAdminComment'>;

export default function AuthsSection(props: Props) {
  const { authorizations, updateAuthorizationStatus, setSelectedDocument, adminComment, setAdminComment } = props;
  return (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-auths-panel">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Auditoría Quirúrgica y Autorizaciones Especiales</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Revisa, aprueba o pon en auditoría técnica las órdenes médicas que requieran cirugías programadas, resonancias o fármacos de alto coste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorizations.map((auth) => {
              const isPending = auth.status === 'Pendiente' || auth.status === 'Auditoría';
              return (
                <div key={auth.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between" id={`admin-auth-card-${auth.id}`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-150">
                      <span className="font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200">{auth.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        auth.status === 'Aprobado'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          : 'bg-amber-50 text-amber-800 border border-amber-100'
                      }`}>
                        {auth.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Asegurado Solicitante:</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{auth.patient}</h4>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Procedimiento Programado:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{auth.procedure}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Lugar: {auth.facility}</p>
                    </div>

                    {/* Live document button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDocument({
                          id: auth.id,
                          type: 'auth',
                          fullName: auth.patient,
                          fileName: auth.fileName || 'receta_orden_clinica.pdf',
                          date: auth.requestDate || new Date().toLocaleDateString(),
                          procedure: auth.procedure,
                          facility: auth.facility,
                          phone: auth.userPhone || '+593 99 521 1147',
                          email: auth.userEmail || `${auth.patient.toLowerCase().replace(/\s+/g, '')}@outlook.com`,
                          fileData: auth.fileData
                        })}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-[#e2f0fb] border border-slate-200 dark:border-slate-800 text-[#0C4169] text-[10px] font-bold rounded-xl transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#4597CA]" />
                        <span>Ver Órden Médica Recibida</span>
                      </button>
                    </div>

                    {auth.adminComment && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-150 rounded-xl text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                        🔍 <strong>Dictamen Auditor:</strong> {auth.adminComment}
                      </div>
                    )}
                  </div>

                  {isPending ? (
                    <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => updateAuthorizationStatus(auth.id, 'Aprobado', 'Procedimiento autorizado vía IA de auditoría inmediata. Ración médica asegurada.')}
                        className="py-2.5 text-center bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                      >
                        Autorizar SRI
                      </button>
                      <button
                        onClick={() => updateAuthorizationStatus(auth.id, 'Rechazado', 'Rechazado por ser cirugía estética u odontología estética fuera de póliza.')}
                        className="py-2.5 text-center bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-750 font-semibold text-xs border border-slate-205 rounded-xl text-slate-705 cursor-pointer"
                      >
                        Rechazar Código
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 text-right text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      Solicitado el: {auth.requestDate}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
  );
}
