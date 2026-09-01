import { Menu, ArrowRight, LogOut, Sun, Moon } from 'lucide-react';
import { useAdminTheme } from './AdminThemeContext';

interface Props {
  title: string;
  subtitle: string;
  onOpenMobileSidebar: () => void;
  onBackToPortal: () => void;
  onLogout: () => void;
}

export default function AdminHeader({ title, subtitle, onOpenMobileSidebar, onBackToPortal, onLogout }: Props) {
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-display font-black text-slate-950 dark:text-white uppercase tracking-tight truncate">{title}</h1>
              <span className="hidden sm:inline-block bg-brand-100 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider shrink-0">
                MODO EMPRESA
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onBackToPortal}
            className="hidden sm:flex px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Portal de Clientes</span>
            <ArrowRight className="w-4 h-4 text-slate-450" />
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            id="admin-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
