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
import { createPortal } from 'react-dom';
import { AdminSharedProps } from '../adminTypes';

type Props = Pick<AdminSharedProps, 'leads' | 'updateClientPaymentStatus' | 'setClientContractNumber' | 'setClientPassword' | 'refreshData' | 'clientSearchFilter' | 'setClientSearchFilter' | 'passwordModalLeadId' | 'setPasswordModalLeadId' | 'newPasswordInput' | 'setNewPasswordInput' | 'passwordFieldVisible' | 'setPasswordFieldVisible' | 'passwordSaveLoading' | 'setPasswordSaveLoading' | 'passwordSaveError' | 'setPasswordSaveError' | 'passwordSaveSuccess' | 'setPasswordSaveSuccess' | 'contractEditId' | 'setContractEditId' | 'contractNumberInput' | 'setContractNumberInput' | 'resolvePlanName' | 'PLAN_CATALOG' | 'handlePlanChange'>;

export default function ClientesSection(props: Props) {
  const { leads, updateClientPaymentStatus, setClientContractNumber, setClientPassword, refreshData, clientSearchFilter, setClientSearchFilter, passwordModalLeadId, setPasswordModalLeadId, newPasswordInput, setNewPasswordInput, passwordFieldVisible, setPasswordFieldVisible, passwordSaveLoading, setPasswordSaveLoading, passwordSaveError, setPasswordSaveError, passwordSaveSuccess, setPasswordSaveSuccess, contractEditId, setContractEditId, contractNumberInput, setContractNumberInput, resolvePlanName, PLAN_CATALOG, handlePlanChange } = props;
        const clients = leads.filter(l => l.status === 'Cierre Efectivo');
        const q = clientSearchFilter.toLowerCase().trim();
        const filtered = q
          ? clients.filter(c =>
              c.quoteData?.fullName?.toLowerCase().includes(q) ||
              c.quoteData?.email?.toLowerCase().includes(q) ||
              c.quoteData?.phone?.includes(q) ||
              c.quoteData?.docNumber?.includes(q) ||
              c.quoteData?.leadCode?.toLowerCase().includes(q)
            )
          : clients;

        const pagados = clients.filter(c => (c.quoteData?.paymentStatus || 'Pendiente') === 'Pagado').length;
        const pendientes = clients.filter(c => (c.quoteData?.paymentStatus || 'Pendiente') === 'Pendiente').length;
        const atrasados = clients.filter(c => c.quoteData?.paymentStatus === 'Atrasado').length;
        const conPortal = clients.filter(c => !!c.quoteData?.portalPasswordHash).length;

        const modalClient = passwordModalLeadId ? clients.find(c => c.id === passwordModalLeadId) : null;

        const handleSavePassword = async () => {
          if (!modalClient) return;
          if (newPasswordInput.length < 6) {
            setPasswordSaveError('La contraseña debe tener al menos 6 caracteres.');
            return;
          }
          setPasswordSaveLoading(true);
          setPasswordSaveError('');
          try {
            await setClientPassword(modalClient.id, newPasswordInput);
            setPasswordSaveSuccess(modalClient.quoteData?.docNumber || '');
            setNewPasswordInput('');
            await refreshData();
          } catch (err) {
            setPasswordSaveError(err instanceof Error ? err.message : 'No se pudo guardar la contraseña.');
          } finally {
            setPasswordSaveLoading(false);
          }
        };

        return (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-clientes-panel">
          {/* Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">Clientes</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Afiliados que cerraron un plan exitosamente. Gestiona su estado de pago y su acceso al Portal de Afiliados.
              </p>
            </div>
            <button onClick={() => refreshData()} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-[11px] font-bold rounded-xl transition cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /><span>Actualizar</span>
            </button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{clients.length}</span>
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Total Clientes</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-lg font-black text-emerald-700 font-mono">{pagados}</span>
              <span className="block text-[9px] text-emerald-600 font-bold uppercase">Pagados</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
              <span className="text-lg font-black text-amber-700 font-mono">{pendientes}</span>
              <span className="block text-[9px] text-amber-600 font-bold uppercase">Pendientes</span>
            </div>
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-center">
              <span className="text-lg font-black text-red-700 font-mono">{atrasados}</span>
              <span className="block text-[9px] text-red-600 font-bold uppercase">Atrasados</span>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-center">
              <span className="text-lg font-black text-indigo-700 font-mono">{conPortal}</span>
              <span className="block text-[9px] text-indigo-600 font-bold uppercase">Con Portal Activo</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono, cédula o código..."
              value={clientSearchFilter}
              onChange={(e) => setClientSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-[#4597CA]"
            />
          </div>

          {/* Client list — compact rows instead of tall cards, so more
              clients fit on screen without scrolling. */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {filtered.length > 0 ? (
              filtered.map((c) => {
                const planName = resolvePlanName(c);
                const paymentStatus = c.quoteData?.paymentStatus || 'Pendiente';
                const hasPortalAccess = !!c.quoteData?.portalPasswordHash;
                return (
                  <div key={c.id} className="p-3.5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      {/* Identity */}
                      <div className="min-w-[160px]">
                        {contractEditId === c.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              autoFocus
                              type="text"
                              value={contractNumberInput}
                              onChange={(e) => setContractNumberInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && contractNumberInput.trim()) {
                                  setClientContractNumber(c.id, contractNumberInput.trim());
                                  setContractEditId(null);
                                }
                                if (e.key === 'Escape') setContractEditId(null);
                              }}
                              placeholder="N° de contrato"
                              className="text-[10px] font-bold font-mono px-1.5 py-0.5 border border-teal-300 rounded bg-teal-50 outline-none w-28"
                            />
                            <button
                              onClick={() => { if (contractNumberInput.trim()) setClientContractNumber(c.id, contractNumberInput.trim()); setContractEditId(null); }}
                              className="text-teal-600 hover:text-teal-800 cursor-pointer"
                              title="Guardar"
                            >✓</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setContractEditId(c.id); setContractNumberInput(c.quoteData?.contractNumber || ''); }}
                            className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest font-mono block hover:underline cursor-pointer"
                            title="Clic para editar el número de contrato"
                          >
                            {c.quoteData?.contractNumber || c.quoteData?.leadCode || c.id.slice(0, 12).toUpperCase()}
                          </button>
                        )}
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{c.quoteData?.fullName || '—'}</h4>
                        {planName
                          ? <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold uppercase inline-block">{planName}</span>
                          : <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded font-medium italic inline-block">Sin plan registrado</span>}
                        <select
                          defaultValue=""
                          onChange={(e) => { handlePlanChange(c.id, e.target.value); e.target.value = ''; }}
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
                        <a href={`tel:${c.quoteData?.phone}`} className="font-bold text-indigo-650 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" /><span>{c.quoteData?.phone || '—'}</span>
                        </a>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block max-w-[160px]">{c.quoteData?.email || '—'}</span>
                      </div>

                      {/* Doc */}
                      <div className="min-w-[110px] text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px] block">{c.quoteData?.docNumber || '—'}</span>
                        {c.quoteData?.birthDate && (
                          <span className="block text-[9px] text-slate-400 dark:text-slate-500">Nac.: {c.quoteData.birthDate}</span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block">Prima:</span>
                        <span className="text-sm font-black text-indigo-750 font-mono">${Number(c.estimatedPrice || 0).toFixed(2)}/m</span>
                      </div>

                      {/* Payment status */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Pago:</span>
                        <select
                          value={paymentStatus}
                          onChange={(e) => updateClientPaymentStatus(c.id, e.target.value as any)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                            paymentStatus === 'Pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : paymentStatus === 'Atrasado' ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="Pagado">Pagado</option>
                          <option value="Pendiente">Pendiente</option>
                          <option value="Atrasado">Atrasado</option>
                        </select>
                      </div>

                      {/* Portal access */}
                      <div className="flex items-center gap-2 ml-auto">
                        {hasPortalAccess ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700"><Lock className="w-3 h-3" /> Activo</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500"><Lock className="w-3 h-3" /> Sin acceso</span>
                        )}
                        <button
                          onClick={() => {
                            setPasswordModalLeadId(c.id);
                            setNewPasswordInput('');
                            setPasswordSaveError('');
                            setPasswordSaveSuccess(null);
                          }}
                          className="text-[10px] font-bold text-[#0C4169] hover:underline cursor-pointer whitespace-nowrap"
                        >
                          {hasPortalAccess ? 'Restablecer clave' : 'Establecer clave'}
                        </button>
                      </div>
                    </div>

                    {/* Address — collapsed by default, less frequently needed */}
                    <details className="mt-1.5 text-[10px] group">
                      <summary className="cursor-pointer text-slate-400 dark:text-slate-500 font-semibold hover:text-teal-600 list-none flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                        <span>Dirección</span>
                      </summary>
                      <div className="mt-1 pl-4 border-l-2 border-slate-150">
                        {c.quoteData?.address?.address1 ? (
                          <span className="text-slate-700 dark:text-slate-300">
                            {c.quoteData.address.address1}
                            {c.quoteData.address.address2 ? `, ${c.quoteData.address.address2}` : ''}
                            {' — '}{c.quoteData.address.city}, {c.quoteData.address.province} (CP {c.quoteData.address.postalCode})
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">No registrada por el cliente aún.</span>
                        )}
                      </div>
                    </details>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  {clients.length === 0 ? 'Aún no hay clientes.' : 'No hay resultados con ese criterio de búsqueda.'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Un lead se convierte en cliente al marcarlo como "Cierre Efectivo" en Cotizaciones Recibidas.
                </p>
              </div>
            )}
          </div>

          {/* Set/Reset password modal — portal'd to <body> so this "fixed" element
              can't inherit a broken containing block from an ancestor on long pages. */}
          {modalClient && createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setPasswordModalLeadId(null)}
            >
              <div
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase">Portal de Afiliados</p>
                    <h3 className="text-lg font-black text-[#0C4169]">{modalClient.quoteData?.fullName}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Cédula: {modalClient.quoteData?.docNumber || '—'}</p>
                  </div>
                  <button onClick={() => setPasswordModalLeadId(null)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
                    <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>

                {passwordSaveSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-emerald-800">Contraseña actualizada correctamente.</p>
                    <p className="text-[10px] text-emerald-700">
                      El cliente ya puede ingresar al Portal de Afiliados con su cédula ({passwordSaveSuccess}) y la nueva contraseña.
                    </p>
                    <button
                      onClick={() => setPasswordModalLeadId(null)}
                      className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Nueva contraseña (mín. 6 caracteres):</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={passwordFieldVisible ? 'text' : 'password'}
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="Ej. Colmedikal2026"
                          className="w-full pl-9 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordFieldVisible(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 cursor-pointer"
                        >
                          {passwordFieldVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordSaveError && (
                        <span className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {passwordSaveError}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-lg p-2.5 leading-relaxed">
                      El cliente ingresará a Mi Colmedikal (<a href="/mi-colmedikal" target="_blank" rel="noreferrer" className="text-[#4597CA] underline">colmedikal.com/mi-colmedikal</a>) usando su cédula y esta contraseña.
                    </p>

                    <button
                      onClick={handleSavePassword}
                      disabled={passwordSaveLoading || newPasswordInput.length < 6}
                      className="w-full py-3 rounded-xl bg-[#0C4169] hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-black uppercase tracking-wider text-white cursor-pointer transition"
                    >
                      {passwordSaveLoading ? 'Guardando...' : 'Guardar Contraseña'}
                    </button>
                  </>
                )}
              </div>
            </div>,
            document.body
          )}
        </div>
        );
}
