import type { ReactNode } from 'react';
import {
  Building2,
  LayoutGrid,
  DollarSign,
  Calendar,
  FileCheck,
  Bell,
  UserCheck,
  Stethoscope,
  Users,
  Settings,
  X,
} from 'lucide-react';
import { ActiveTab } from './adminTypes';

interface NavItem {
  tab: ActiveTab;
  label: string;
  icon: ReactNode;
  badge?: number;
  badgeColor?: string;
  count?: number;
  id: string;
}

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (t: ActiveTab) => void;
  canSeeTab: (tab: string) => boolean;
  canManageAdmins: boolean;
  pendingRefundsCount: number;
  activeAppointmentsCount: number;
  pendingAuthsCount: number;
  totalLeadsUncontacted: number;
  clientesCount: number;
  doctorsCount: number;
  adminsCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  canSeeTab,
  canManageAdmins,
  pendingRefundsCount,
  activeAppointmentsCount,
  pendingAuthsCount,
  totalLeadsUncontacted,
  clientesCount,
  doctorsCount,
  adminsCount,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const items: (NavItem | null)[] = [
    canSeeTab('kpis') ? { tab: 'kpis', label: 'Consola General', icon: <LayoutGrid className="w-4.5 h-4.5" />, id: 'admin-tab-kpis' } : null,
    canSeeTab('refunds') ? { tab: 'refunds', label: 'Auditar Reembolsos', icon: <DollarSign className="w-4.5 h-4.5" />, badge: pendingRefundsCount, badgeColor: 'bg-rose-500 text-white', id: 'admin-tab-refunds' } : null,
    canSeeTab('appointments') ? { tab: 'appointments', label: 'Citas Médicas', icon: <Calendar className="w-4.5 h-4.5" />, badge: activeAppointmentsCount, badgeColor: 'bg-teal-500 text-slate-950', id: 'admin-tab-appointments' } : null,
    canSeeTab('auths') ? { tab: 'auths', label: 'Autorizaciones', icon: <FileCheck className="w-4.5 h-4.5" />, badge: pendingAuthsCount, badgeColor: 'bg-indigo-500 text-white', id: 'admin-tab-auths' } : null,
    canSeeTab('leads') ? { tab: 'leads', label: 'Cotizaciones Recibidas', icon: <Bell className="w-4.5 h-4.5" />, badge: totalLeadsUncontacted, badgeColor: 'bg-emerald-500 text-slate-950', id: 'admin-tab-leads' } : null,
    canSeeTab('clientes') ? { tab: 'clientes', label: 'Clientes', icon: <UserCheck className="w-4.5 h-4.5" />, count: clientesCount, id: 'admin-tab-clientes' } : null,
    canSeeTab('doctors') ? { tab: 'doctors', label: 'Directorio Médico', icon: <Stethoscope className="w-4.5 h-4.5" />, count: doctorsCount, id: 'admin-tab-doctors' } : null,
    canSeeTab('admins') ? { tab: 'admins', label: 'Gestionar Accesos', icon: <Users className="w-4.5 h-4.5" />, count: adminsCount, id: 'admin-tab-admins' } : null,
    canManageAdmins ? { tab: 'sitio', label: 'Sitio', icon: <Settings className="w-4.5 h-4.5" />, id: 'admin-tab-sitio' } : null,
  ];

  const nav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      {items.map((item) => {
        if (!item) return null;
        const active = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            id={item.id}
            onClick={() => {
              setActiveTab(item.tab);
              onCloseMobile();
            }}
            className={`admin-menu-item ${active ? 'admin-menu-item-active' : 'admin-menu-item-inactive'}`}
          >
            <span className={active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}>{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {typeof item.badge === 'number' && item.badge > 0 && (
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
            )}
            {typeof item.count === 'number' && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-normal">({item.count})</span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <SidebarBrand />
        {nav}
      </aside>

      {/* Mobile off-canvas sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 w-72 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left-4 duration-200">
            <div className="flex items-center justify-between px-4 pt-4">
              <SidebarBrand compact />
              <button onClick={onCloseMobile} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarBrand({ compact }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? 'px-0 pb-4' : 'px-5 py-6'}`}>
      <div className="w-10 h-10 bg-slate-900 dark:bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 border border-slate-750 dark:border-brand-500/30 shrink-0">
        <Building2 className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <span className="block text-sm font-display font-black text-slate-950 dark:text-white uppercase tracking-tight truncate">Colmedikal</span>
        <span className="block text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Consola Corporativa</span>
      </div>
    </div>
  );
}
