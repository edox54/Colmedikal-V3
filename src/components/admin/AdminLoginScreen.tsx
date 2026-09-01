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
import { AdminSharedProps } from './adminTypes';

type Props = Pick<AdminSharedProps, 'setCurrentPage' | 'username' | 'setUsername' | 'password' | 'setPassword' | 'loginError' | 'isLoggingIn' | 'handleLogin'>;

export default function AdminLoginScreen(props: Props) {
  const { setCurrentPage, username, setUsername, password, setPassword, loginError, isLoggingIn, handleLogin } = props;
  return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-all duration-300" id="admin-login-screen">
          <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
            <div className="flex justify-center">
              <span className="p-4 bg-amber-500/10 text-amber-500 rounded-3xl border border-amber-500/20 shadow-inner">
                <Building2 className="w-10 h-10" />
              </span>
            </div>
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display text-center">
                Consola Corporativa Colmedikal
              </h2>
              <p className="text-xs text-slate-400 font-medium text-center">
                Acceso restringido para auditores médicos y directivos de Medicina Prepagada
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-slate-900 py-8 px-6 shadow-xl rounded-3xl border border-slate-800 space-y-6 mx-4 sm:mx-0">
              <form className="space-y-5" onSubmit={handleLogin} id="form-admin-login">
                {loginError && (
                  <div className="p-3 bg-red-950/60 border border-red-800/40 text-red-200 text-xs font-semibold rounded-xl flex items-start gap-2.5">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Usuario Administrativo:
                  </span>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <UserCheck className="w-4 h-4" />
                    </span>
                    <input
                      id="admin-user"
                      type="text"
                      required
                      placeholder="Ej. auditor_principal"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-105 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Contraseña de Verificación:
                  </span>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <input
                      id="admin-pass"
                      type="password"
                      required
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-105 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-indigo-500/10 cursor-pointer transition text-center uppercase tracking-widest"
                >
                  {isLoggingIn ? 'Verificando Hash...' : 'Ingresar al Panel Seguro ✓'}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-800/60 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage('home')}
                  className="text-center text-[11px] text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  ← Regresar al Portal de Clientes
                </button>
              </div>
            </div>
          </div>
        </div>
  );
}
