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

type Props = Pick<AdminSharedProps, 'refunds' | 'updateRefundStatus' | 'setSelectedDocument' | 'selectedRefundId' | 'setSelectedRefundId' | 'adminComment' | 'setAdminComment'>;

export default function RefundsSection(props: Props) {
  const { refunds, updateRefundStatus, setSelectedDocument, selectedRefundId, setSelectedRefundId, adminComment, setAdminComment } = props;
  return (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-refunds-panel">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Consola de Auditoría y Liquidación de Reembolsos</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verifica los importes presentados por afiliados, analiza la validez y aprueba al 90% o rechaza las facturas comerciales. Los pacientes obtienen respuesta de forma instantánea.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Refunds list list */}
            <div className="lg:col-span-12 space-y-4">
              {refunds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {refunds.map((ref) => {
                    const isPending = ref.status === 'Procesando';
                    const isSelected = selectedRefundId === ref.id;

                    return (
                      <div 
                        key={ref.id}
                        className={`bg-white dark:bg-slate-900 p-5 rounded-3xl border transition-all ${
                          isSelected ? 'border-indigo-600 ring-2 ring-indigo-600/10' : 'border-slate-200 dark:border-slate-800 shadow-sm'
                        }`}
                        id={`admin-refund-card-${ref.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-805 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                                {ref.id}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans border ${
                                ref.status === 'Reembolsado' || ref.status === 'Aprobado'
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
                                  : ref.status === 'Rechazado'
                                  ? 'text-red-700 bg-red-50 border-red-100'
                                  : 'text-amber-700 bg-amber-50 border-amber-100 animate-pulse'
                              }`}>
                                {ref.status}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 dark:text-white pt-1.5">{ref.familyMember}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{ref.specialty} — Factura N° {ref.invoiceNumber}</p>
                          </div>

                          <div className="text-right space-y-1">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Monto Declarado:</span>
                            <p className="text-lg font-black font-mono text-slate-950 dark:text-white">${Number(ref.amount || 0).toFixed(2)}</p>
                            <p className="text-[10px] text-emerald-600 font-semibold font-mono">Retorno Est. 90%: ${(Number(ref.amount || 0) * 0.9).toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Live document button */}
                        <div className="mt-3 pb-3 border-b border-dashed border-slate-150">
                          <button
                            type="button"
                            onClick={() => setSelectedDocument({
                              id: ref.id,
                              type: 'refund',
                              fullName: ref.familyMember,
                              fileName: ref.fileName || 'factura_original_sri.pdf',
                              date: ref.refundDate || new Date().toLocaleDateString(),
                              amount: ref.amount,
                              invoiceNumber: ref.invoiceNumber,
                              phone: ref.userPhone || '+593 98 440 3311',
                              email: ref.userEmail || `${ref.familyMember.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
                              fileData: ref.fileData
                            })}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-[#e2f0fb] border border-slate-200 dark:border-slate-800 text-[#0C4169] text-[11px] font-bold rounded-xl transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-[#4597CA]" />
                            <span>Ver Comprobante Digital Recibido (En Vivo)</span>
                          </button>
                        </div>

                        {ref.adminComment && (
                          <div className="mt-3.5 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-150 rounded-xl text-[11px] text-slate-650 leading-relaxed">
                            <strong>Dictamen Interno:</strong> {ref.adminComment}
                          </div>
                        )}

                        {isPending ? (
                          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                            <div className="space-y-1.5">
                              <label className="block text-[11px] font-bold text-slate-750">Nota de Auditoría Clínica:</label>
                              <input 
                                type="text"
                                placeholder="Escribe el comentario (ej: Factura SRI aprobada, reembolso asignado)"
                                value={isSelected ? adminComment : ''}
                                onChange={(e) => {
                                  setSelectedRefundId(ref.id);
                                  setAdminComment(e.target.value);
                                }}
                                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                                id={`input-comment-${ref.id}`}
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const comment = isSelected ? adminComment : 'Reembolso auditado y verificado';
                                  updateRefundStatus(ref.id, 'Reembolsado', comment);
                                  setSelectedRefundId(null);
                                  setAdminComment('');
                                }}
                                className="flex-1 py-2 text-center bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Aprobar y Transferir</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const comment = isSelected ? adminComment : 'Reclamo rechazado por duplicidad o preexistencia no declarada';
                                  updateRefundStatus(ref.id, 'Rechazado', comment);
                                  setSelectedRefundId(null);
                                  setAdminComment('');
                                }}
                                className="flex-1 py-2 text-center bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-655 hover:border-red-200 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Rechazar Solicitud</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3.5 text-right">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Procesado el: {ref.refundDate}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border p-6">
                  <DollarSign className="w-12 h-12 text-slate-350 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No hay reembolsos registrados.</p>
                </div>
              )}
            </div>

          </div>

        </div>
  );
}
