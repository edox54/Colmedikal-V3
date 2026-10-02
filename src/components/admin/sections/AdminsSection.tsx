import { useState, type FormEvent } from 'react';
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
  KeyRound,
} from 'lucide-react';
import { AdminSharedProps } from '../adminTypes';

type Props = Pick<AdminSharedProps, 'admins' | 'deleteAdmin' | 'toggleAdminActiveStatus' | 'updateAdminRole' | 'updateAdminPassword' | 'sendAdminPasswordLink' | 'newAdmin' | 'setNewAdmin' | 'isSubmittingAdmin' | 'adminSuccessMsg' | 'adminErrorMsg' | 'handleRegisterAdmin' | 'canManageAdmins'>;

export default function AdminsSection(props: Props) {
  const { admins, deleteAdmin, toggleAdminActiveStatus, updateAdminRole, updateAdminPassword, sendAdminPasswordLink, newAdmin, setNewAdmin, isSubmittingAdmin, adminSuccessMsg, adminErrorMsg, handleRegisterAdmin, canManageAdmins } = props;
  const [pwFor, setPwFor] = useState<{ email: string; name: string } | null>(null);
  return (
    <div className="space-y-8 animate-in fade-in duration-205" id="admin-users-panel">
      {pwFor && <ChangeAdminPassword target={pwFor} onSave={updateAdminPassword} onSendLink={sendAdminPasswordLink} onClose={() => setPwFor(null)} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form to add administrative user — Super Admin only */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 h-fit text-slate-850">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
              <UserCheck className="w-5 h-5 text-indigo-650" />
              <span>Registrar Nuevo Acceso</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Otorgar credenciales para auditoría o administración a miembros del equipo de Colmedikal.
            </p>
          </div>

          {!canManageAdmins && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl">
              Solo el Super Admin puede registrar o modificar accesos.
            </div>
          )}
          <form onSubmit={handleRegisterAdmin} className="space-y-4" style={canManageAdmins ? undefined : { pointerEvents: 'none', opacity: 0.45 }}>
            {adminSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold rounded-xl leading-normal">
                {adminSuccessMsg}
              </div>
            )}
            {adminErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 text-xs font-semibold rounded-xl leading-normal">
                {adminErrorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="new-admin-email" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Correo Electrónico:
              </label>
              <input
                id="new-admin-email"
                type="email"
                required
                placeholder="correo@colmedikal.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium font-sans"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-admin-name" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Nombre Completo del Colaborador:
              </label>
              <input
                id="new-admin-name"
                type="text"
                required
                placeholder="Ej. Dra. Alexandra Moreno"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-205 rounded-xl text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium font-sans"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-admin-password" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Contraseña de Acceso (opcional):
              </label>
              <input
                id="new-admin-password"
                type="password"
                autoComplete="new-password"
                placeholder="Vacío = la persona la crea desde el correo"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-205 rounded-xl text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium font-sans"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-admin-role" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Rol Administrativo Corp:
              </label>
              <select
                id="new-admin-role"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-205 rounded-xl text-xs text-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium cursor-pointer font-sans"
                value={newAdmin.role}
                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as any })}
              >
                <option value="Super Admin">Super Admin — Acceso completo</option>
                <option value="Mid Admin">Mid Admin — Sin Panel SEO</option>
                <option value="Equipo Comercial">Equipo Comercial — Solo leads y autorizaciones</option>
                <option value="Auditor">Auditor — Solo reembolsos</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmittingAdmin}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition text-center uppercase tracking-widest font-sans"
            >
              {isSubmittingAdmin ? 'Registrando...' : 'Otorgar Acceso Seguro ✓'}
            </button>
          </form>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[10px] space-y-1 font-sans">
            <span className="font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-300">🔒 Niveles de Acceso</span>
            <p className="leading-relaxed">
              Solo el Super Admin puede registrar, modificar roles, suspender o revocar accesos. Mid Admin puede visualizar este panel pero sin permisos de edición. Equipo Comercial solo ve cotizaciones y autorizaciones. Auditor solo accede a reembolsos.
            </p>
          </div>
        </div>

        {/* List of administrative users */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-2 text-slate-800 dark:text-slate-200">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-display">
                <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Miembros Autorizados y Auditores Activos</span>
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Lista de control de accesos dinámicos en producción</p>
            </div>
          </div>

          {(!admins || admins.length === 0) ? (
            <div className="text-center py-12 text-slate-405 text-xs font-mono">
              No hay administradores dinámicos registrados aún. (El correo root edox54@gmail.com tiene acceso por defecto).
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Detalle Administrador</th>
                    <th className="pb-3">Rol Corporativo</th>
                    <th className="pb-3 text-center">Estado</th>
                    {canManageAdmins && <th className="pb-3 text-center">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {admins.map((adm) => (
                    <tr key={adm.email} className="hover:bg-slate-50/40">
                      <td className="py-3.5 pr-3">
                        <div className="font-bold text-slate-900 dark:text-white leading-snug">{adm.name}</div>
                        <div className="text-slate-450 font-mono text-[10px] mt-0.5">{adm.email}</div>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
                          Registrado el {new Date(adm.addedAt).toLocaleDateString()} por <span className="font-semibold">{adm.addedBy}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        {canManageAdmins ? (
                          <select
                            value={adm.role}
                            onChange={async (e) => {
                              const newRole = e.target.value as typeof adm.role;
                              try { await updateAdminRole(adm.email, newRole); } catch { /* ignore */ }
                            }}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider font-sans cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                              adm.role === 'Super Admin'
                                ? 'bg-violet-50 border-violet-200 text-violet-700'
                                : adm.role === 'Mid Admin'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : adm.role === 'Equipo Comercial'
                                ? 'bg-teal-50 border-teal-200 text-teal-700'
                                : 'bg-amber-50 border-amber-200 text-amber-700'
                            }`}
                          >
                            <option value="Super Admin">Super Admin</option>
                            <option value="Mid Admin">Mid Admin</option>
                            <option value="Equipo Comercial">Equipo Comercial</option>
                            <option value="Auditor">Auditor</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider font-sans inline-block ${
                            adm.role === 'Super Admin'
                              ? 'bg-violet-50 border-violet-200 text-violet-700'
                              : adm.role === 'Mid Admin'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : adm.role === 'Equipo Comercial'
                              ? 'bg-teal-50 border-teal-200 text-teal-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>{adm.role}</span>
                        )}
                      </td>
                      <td className="py-3.5 text-center">
                        {canManageAdmins ? (
                          <button
                            onClick={() => toggleAdminActiveStatus(adm.email)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer uppercase tracking-wider font-sans ${
                              adm.active
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-250'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-605 border-stone-300'
                            }`}
                            title={adm.active ? 'Haga clic para suspender' : 'Haga clic para habilitar'}
                          >
                            {adm.active ? 'Activo' : 'Suspendido'}
                          </button>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider font-sans inline-block ${
                            adm.active
                              ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                              : 'bg-stone-100 border-stone-300 text-stone-605'
                          }`}>
                            {adm.active ? 'Activo' : 'Suspendido'}
                          </span>
                        )}
                      </td>
                      {canManageAdmins && (
                        <td className="py-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => setPwFor({ email: adm.email, name: adm.name })}
                            className="p-2 mr-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer"
                            title="Cambiar contraseña"
                            aria-label={`Cambiar contraseña de ${adm.name}`}
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Está seguro de revocar permanentemente los privilegios de administración para ${adm.name}?`)) {
                                deleteAdmin(adm.email);
                              }
                            }}
                            className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                            title="Revocar acceso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

function ChangeAdminPassword({ target, onSave, onSendLink, onClose }: {
  target: { email: string; name: string };
  onSave: (email: string, password: string) => Promise<void>;
  onSendLink: (email: string) => Promise<string>;
  onClose: () => void;
}) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [linkMsg, setLinkMsg] = useState('');
  const [sending, setSending] = useState(false);
  const sendLink = async () => {
    setSending(true); setErr('');
    try { setLinkMsg(await onSendLink(target.email)); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message : 'No se pudo enviar el correo.'); }
    finally { setSending(false); }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setErr('La contraseña debe tener al menos 8 caracteres.');
    if (pw !== pw2) return setErr('Las contraseñas no coinciden.');
    setBusy(true); setErr('');
    try { await onSave(target.email, pw); setDone(true); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message.replace(/^API Error: /, '') : 'No se pudo cambiar la contraseña.'); }
    finally { setBusy(false); }
  };

  const input = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="chg-admin-pw-title" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="chg-admin-pw-title" className="text-base font-black text-slate-900 dark:text-white">Cambiar contraseña</h3>
            <p className="text-xs text-slate-500 mt-0.5">{target.name} · <span className="font-mono">{target.email}</span></p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer" aria-label="Cerrar"><X className="w-4 h-4" /></button>
        </div>
        {done ? (
          <>
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex gap-2"><CheckCircle className="w-4 h-4 shrink-0" /><span>Contraseña actualizada. Compártela con {target.name.split(' ')[0]} por un canal seguro.</span></div>
            <button type="button" onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold cursor-pointer">Listo</button>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-300">Recomendado: enviamos a <b>{target.email}</b> un enlace (válido 24 h) para que cree su propia contraseña.</p>
              {linkMsg
                ? <p className="text-xs font-semibold text-emerald-700 flex gap-1.5"><CheckCircle className="w-4 h-4 shrink-0" />{linkMsg}</p>
                : <button type="button" onClick={sendLink} disabled={sending} className="w-full py-2 rounded-xl bg-[#0C4169] hover:bg-[#0a3557] disabled:opacity-60 text-white text-xs font-bold cursor-pointer">{sending ? 'Enviando…' : 'Enviar enlace por correo'}</button>}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">o asígnala tú</p>
            {err && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{err}</span></div>}
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nueva contraseña
              <div className="relative mt-1">
                <input type={show ? 'text' : 'password'} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={input} autoFocus />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" aria-label={show ? 'Ocultar' : 'Mostrar'}>{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </label>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confirmar contraseña
              <input type={show ? 'text' : 'password'} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={`${input} mt-1`} />
            </label>
            <p className="text-[11px] text-slate-400">Mínimo 8 caracteres. La sesión actual de esa persona sigue abierta hasta que expire.</p>
            <button type="submit" disabled={busy} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold cursor-pointer">{busy ? 'Guardando…' : 'Guardar contraseña'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
