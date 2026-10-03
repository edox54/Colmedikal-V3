// Per-member admin panel permissions — shared by the server (src/server/adminAccess.ts) and the panel UI.
// A member without a saved entry gets their role's defaults. Super Admin always has everything.

export const ADMIN_MODULES = [
  { id: 'kpis', label: 'Consola General' },
  { id: 'refunds', label: 'Reembolsos' },
  { id: 'appointments', label: 'Citas Médicas' },
  { id: 'auths', label: 'Preautorizaciones' },
  { id: 'leads', label: 'Cotizaciones Recibidas' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'doctors', label: 'Directorio Médico' },
  { id: 'admins', label: 'Gestionar Accesos (solo ver)' },
] as const;
export type AdminModule = typeof ADMIN_MODULES[number]['id'];

export interface AdminPermissions {
  modules: AdminModule[];
  deleteLeads: boolean;
}

const ALL = ADMIN_MODULES.map(m => m.id);

export function roleDefaults(role: string): AdminPermissions {
  switch (role) {
    case 'Super Admin': return { modules: [...ALL], deleteLeads: true };
    case 'Mid Admin': return { modules: [...ALL], deleteLeads: true };
    case 'Equipo Comercial': return { modules: ['kpis', 'refunds', 'leads', 'auths', 'clientes'], deleteLeads: false }; // refunds: they file them manually
    case 'Auditor': return { modules: ['refunds'], deleteLeads: false };
    default: return { modules: [], deleteLeads: false };
  }
}

/** Validated copy of untrusted input, or null. */
export function cleanPermissions(p: unknown): AdminPermissions | null {
  if (!p || typeof p !== 'object') return null;
  const { modules, deleteLeads } = p as any;
  if (!Array.isArray(modules)) return null;
  return { modules: ALL.filter(id => modules.includes(id)), deleteLeads: deleteLeads === true };
}
