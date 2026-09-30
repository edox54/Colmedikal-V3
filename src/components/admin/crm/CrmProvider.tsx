import type React from 'react';
// Mounts the CRM overlays (lead file drawer + toasts) once for the whole admin
// shell, so any section can open a lead's file with useCrmUI().openLead(id).
import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAdminTheme } from '../AdminThemeContext';
import type { AdminSharedProps } from '../adminTypes';
import LeadDrawer from './LeadDrawer';
import { Toaster } from './ui';

const Ctx = createContext<{ openLead: (id: string) => void }>({ openLead: () => {} });
export const useCrmUI = () => useContext(Ctx);

/** POST /api/admin/send-quote-email — throws with the server's message on failure. */
export async function sendQuoteEmail(leadId: string) {
  let by = 'Admin';
  try { by = JSON.parse(sessionStorage.getItem('colmedikal_user') || '{}')?.name || by; } catch { /* default */ }
  const r = await fetch('/api/admin/send-quote-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('colmedikal_token') || ''}` },
    body: JSON.stringify({ leadId, by }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.success) throw new Error(j.message || `HTTP ${r.status}`);
  return j.to as string;
}

export default function CrmProvider({ data, children }: { data: AdminSharedProps; children: React.ReactNode }) {
  const [leadId, setLeadId] = useState<string | null>(null);
  const { theme } = useAdminTheme();
  return (
    <Ctx.Provider value={{ openLead: id => setLeadId(String(id)) }}>
      {children}
      {/* Portaled to <body>: the admin sits inside an `animate-in` wrapper whose
          (fill-mode: both) transform animation turns it into the containing
          block for position:fixed, so an in-tree drawer grew to the page height.
          The wrapper div re-applies the admin's dark theme outside the tree. */}
      {createPortal(
        <div className={theme === 'dark' ? 'dark' : ''}>
          {leadId && <LeadDrawer data={data} leadId={leadId} onClose={() => setLeadId(null)} />}
          <Toaster />
        </div>,
        document.body,
      )}
    </Ctx.Provider>
  );
}
