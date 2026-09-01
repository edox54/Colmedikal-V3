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

type Props = Pick<AdminSharedProps, 'seoSettings' | 'saveSEOSettings' | 'maintenanceSaving' | 'setMaintenanceSaving'>;

export default function SitioSection(props: Props) {
  const { seoSettings, saveSEOSettings, maintenanceSaving, setMaintenanceSaving } = props;
  return (
    <div className="space-y-6 animate-in fade-in duration-205" id="admin-sitio-panel">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <AlertCircle className="w-5 h-5 text-amber-650" />
            <span>Modo "En Construcción"</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Al activarlo, el sitio público muestra una página de "En construcción" a todos los
            visitantes. El panel de administración (esta página) sigue siendo accesible para
            poder desactivarlo.
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {seoSettings.maintenance_mode === 'true' ? 'Sitio en construcción (activo)' : 'Sitio publicado (normal)'}
          </span>
          <button
            disabled={maintenanceSaving}
            onClick={async () => {
              setMaintenanceSaving(true);
              try {
                await saveSEOSettings({ maintenance_mode: seoSettings.maintenance_mode === 'true' ? 'false' : 'true' });
              } finally {
                setMaintenanceSaving(false);
              }
            }}
            className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
              seoSettings.maintenance_mode === 'true' ? 'bg-amber-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow transition-transform ${
                seoSettings.maintenance_mode === 'true' ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
