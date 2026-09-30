// Client-side calls for Mi Colmedikal reembolsos / preautorizaciones (server: src/server/claims.ts)
import type { Claim, ClaimFile, ClaimType, InvoiceRow } from '../../data/claims';

const tok = () => sessionStorage.getItem('colmedikal_portal_token') || '';
async function call<T>(url: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(url, { ...init, headers: { Authorization: `Bearer ${tok()}`, ...(init.headers || {}) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.success) throw Object.assign(new Error(j.message || `Error ${r.status}`), { missing: j.missing as string[] | undefined });
  return j.data as T;
}
const json = (body: unknown): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const listClaims = () => call<Claim[]>('/api/portal/claims');
export const saveDraft = (d: { id?: string; type: ClaimType; form: Record<string, string>; invoices: InvoiceRow[]; declarationAccepted: boolean }) =>
  call<Claim>('/api/portal/claims', json(d));
export const submitClaim = (id: string, comment?: string) => call<Claim>(`/api/portal/claims/${id}/submit`, json({ comment }));
export const discardDraft = (id: string) => call<void>(`/api/portal/claims/${id}`, { method: 'DELETE' });
export const removeFile = (id: string, fileId: string) => call<void>(`/api/portal/claims/${id}/files/${fileId}`, { method: 'DELETE' });
export const uploadFile = (id: string, kind: string, file: File) =>
  call<ClaimFile>(`/api/portal/claims/${id}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream', 'X-File-Kind': kind, 'X-File-Name': encodeURIComponent(file.name) },
    body: file,
  });

/** Open a protected document in a new tab (the token can't ride on a plain link). */
export async function openFile(url: string, token = tok()) {
  const win = window.open('', '_blank'); // open synchronously so popup blockers allow it
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error();
    const blobUrl = URL.createObjectURL(await r.blob());
    if (win) win.location.href = blobUrl; else window.location.href = blobUrl;
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch {
    win?.close();
    alert('No se pudo abrir el documento.');
  }
}

export const MAX_UPLOAD_MB = 10;
export const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,image/heic,.heic';
