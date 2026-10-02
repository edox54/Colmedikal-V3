import type { AdminPermissions } from '../../data/adminPermissions';

export type MemberPermissions = AdminPermissions & { custom: boolean };
export interface PermissionsResponse { mine: AdminPermissions; all?: Record<string, MemberPermissions> }

// Served by this site's server (src/server/adminAccess.ts), not by api.colmedikal.com.
const call = async (method: string, path: string, token: string, body?: unknown) => {
  const r = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.success) throw new Error(j.message || 'Error de permisos');
  return j;
};

export const fetchPermissions = (token: string): Promise<PermissionsResponse> =>
  call('GET', '/api/admin/access/permissions', token);

export const savePermissions = (token: string, email: string, p: AdminPermissions | { reset: true }) =>
  call('PUT', `/api/admin/access/permissions/${encodeURIComponent(email)}`, token, p);
