// Server-only (imported by server.ts). Shared CRM store for the AdminPanel.
//
// Why: lead status / notes / assignee / follow-up used to live only in each
// admin's browser localStorage (the external API's PUT doesn't reliably
// persist them), so two people on the team never saw the same pipeline. This
// JSON file is the single source of truth all admins read and write, plus a
// per-lead activity timeline (notes, calls, WhatsApp, tasks, stage changes,
// emails sent).
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Express, Request, Response, NextFunction } from 'express';
import express from 'express';

export const ACTIVITY_TYPES = ['nota', 'llamada', 'whatsapp', 'email', 'reunion', 'cambio_etapa', 'sistema'] as const;
type ActivityType = (typeof ACTIVITY_TYPES)[number];
const STATUSES = ['Nuevo Plan', 'Contactado', 'Cierre Efectivo', 'Perdido'];

export interface CrmActivity { id: string; type: ActivityType; body: string; by: string; at: string; dueAt?: string; doneAt?: string }
export interface CrmNote { text: string; author: string; timestamp: string }
export interface CrmEntry {
  status?: string; assignedTo?: string; followUpDate?: string; lostReason?: string;
  notes?: CrmNote[]; activities: CrmActivity[]; updatedAt: number;
}
type CrmStore = Record<string, CrmEntry>;

let FILE = '';
const load = (): CrmStore => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; } };
const save = (s: CrmStore) => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(s)); };
const entry = (s: CrmStore, id: string) => (s[id] ||= { activities: [], updatedAt: Date.now() });
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const validId = (id: string) => /^[\w-]{1,40}$/.test(id);

/** Append an activity from elsewhere in the server (e.g. "cotización enviada"). Never throws. */
export function logActivity(leadId: string, type: ActivityType, body: string, by = 'Sistema') {
  try {
    if (!FILE || !validId(leadId)) return;
    const s = load();
    const e = entry(s, leadId);
    e.activities.unshift({ id: crypto.randomUUID(), type, body, by, at: new Date().toISOString() });
    e.updatedAt = Date.now();
    save(s);
  } catch (err) { console.error('[crm-log]', err); }
}

/** Record a successful client-portal login so the admin can see who actually uses it. */
let LOGINS_FILE = '';
export function recordPortalLogin(leadId: string) {
  try {
    let s: Record<string, string> = {};
    try { s = JSON.parse(fs.readFileSync(LOGINS_FILE, 'utf8')); } catch { /* first */ }
    s[leadId] = new Date().toISOString();
    fs.writeFileSync(LOGINS_FILE, JSON.stringify(s));
  } catch (err) { console.error('[portal-login-record]', err); }
}

export function registerCrmRoutes(app: Express, deps: {
  dataDir: string;
  httpsJson: (url: string, opts?: any) => Promise<any>;
  loadPortalCreds: () => Record<string, { updatedAt: number }>;
}) {
  FILE = path.join(deps.dataDir, 'lead-crm.json');
  LOGINS_FILE = path.join(deps.dataDir, 'portal-logins.json');

  // Admin auth = the external API accepts the caller's token (same check as the
  // other /api/admin/* routes). Validated tokens are cached 5 min so the
  // pipeline's frequent polling doesn't hit the API on every request.
  const okTokens = new Map<string, number>();
  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const tok = req.headers.authorization?.split(' ')[1];
    if (!tok) return res.status(401).json({ success: false, message: 'Token de administrador requerido' });
    const key = crypto.createHash('sha256').update(tok).digest('hex');
    if ((okTokens.get(key) || 0) > Date.now()) return next();
    try {
      await deps.httpsJson('https://api.colmedikal.com/api/admin/leads?limit=1', { headers: { Authorization: `Bearer ${tok}` } });
      okTokens.set(key, Date.now() + 5 * 60_000);
      next();
    } catch (e: any) {
      res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: 'No autorizado' });
    }
  };

  // Whole store + portal access info. ponytail: full dump each poll; fine for
  // hundreds of leads — paginate if the file grows past a few MB.
  app.get('/api/admin/crm', requireAdmin, (_req, res) => {
    let logins: Record<string, string> = {};
    try { logins = JSON.parse(fs.readFileSync(LOGINS_FILE, 'utf8')); } catch { /* none yet */ }
    const portal: Record<string, { hasPassword: boolean; passwordSetAt?: string; lastLoginAt?: string }> = {};
    for (const [id, c] of Object.entries(deps.loadPortalCreds())) {
      portal[id] = { hasPassword: true, passwordSetAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined, lastLoginAt: logins[id] };
    }
    res.json({ success: true, data: load(), portal });
  });

  // Patch lead fields. Status/assignee changes are logged to the timeline.
  app.post('/api/admin/crm/:leadId', requireAdmin, express.json({ limit: '200kb' }), (req, res) => {
    const id = req.params.leadId;
    if (!validId(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
    const b = req.body || {};
    const by = str(b.by, 80) || 'Admin';
    const s = load();
    const e = entry(s, id);
    if (b.status !== undefined) {
      if (!STATUSES.includes(b.status)) return res.status(400).json({ success: false, message: 'Estado inválido' });
      if (e.status !== b.status && !b.silent) e.activities.unshift({ id: crypto.randomUUID(), type: 'cambio_etapa', body: `${e.status || 'Nuevo Plan'} → ${b.status}${b.lostReason ? ` (${str(b.lostReason, 120)})` : ''}`, by, at: new Date().toISOString() });
      e.status = b.status;
    }
    if (b.lostReason !== undefined) e.lostReason = str(b.lostReason, 120);
    if (b.assignedTo !== undefined) {
      const to = str(b.assignedTo, 120);
      if (e.assignedTo !== to && !b.silent) e.activities.unshift({ id: crypto.randomUUID(), type: 'sistema', body: to ? `Asignado a ${to}` : 'Sin asignar', by, at: new Date().toISOString() });
      e.assignedTo = to;
    }
    if (b.followUpDate !== undefined) {
      const d = str(b.followUpDate, 10);
      if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) return res.status(400).json({ success: false, message: 'Fecha inválida' });
      e.followUpDate = d;
    }
    if (Array.isArray(b.notes)) {
      e.notes = b.notes.slice(0, 500).map((n: any) => ({ text: str(n?.text, 2000), author: str(n?.author, 80), timestamp: str(n?.timestamp, 40) })).filter((n: CrmNote) => n.text);
    }
    e.updatedAt = Date.now();
    save(s);
    res.json({ success: true, data: e });
  });

  // New activity (optionally a task with dueAt).
  app.post('/api/admin/crm/:leadId/activities', requireAdmin, express.json(), (req, res) => {
    const id = req.params.leadId;
    const type = req.body?.type as ActivityType;
    const body = str(req.body?.body, 5000);
    const dueAt = str(req.body?.dueAt, 40);
    if (!validId(id) || !ACTIVITY_TYPES.includes(type) || type === 'cambio_etapa') return res.status(400).json({ success: false, message: 'Datos inválidos' });
    if (!body && (type === 'nota' || dueAt)) return res.status(400).json({ success: false, message: 'Escribe el contenido' });
    if (dueAt && Number.isNaN(Date.parse(dueAt))) return res.status(400).json({ success: false, message: 'Fecha inválida' });
    const s = load();
    const e = entry(s, id);
    const a: CrmActivity = { id: crypto.randomUUID(), type, body, by: str(req.body?.by, 80) || 'Admin', at: new Date().toISOString(), ...(dueAt ? { dueAt: new Date(dueAt).toISOString() } : {}) };
    e.activities.unshift(a);
    e.updatedAt = Date.now();
    save(s);
    res.json({ success: true, data: a });
  });

  // Mark a task done/undone, or delete an activity (not system-generated ones).
  app.post('/api/admin/crm/:leadId/activities/:actId', requireAdmin, express.json(), (req, res) => {
    const s = load();
    const e = s[req.params.leadId];
    const a = e?.activities.find(x => x.id === req.params.actId);
    if (!e || !a) return res.status(404).json({ success: false, message: 'No encontrado' });
    if (req.body?.delete) {
      if (a.type === 'cambio_etapa' || a.type === 'sistema') return res.status(400).json({ success: false, message: 'No se puede borrar un registro del sistema' });
      e.activities = e.activities.filter(x => x !== a);
    } else if (typeof req.body?.done === 'boolean') {
      if (req.body.done) a.doneAt = new Date().toISOString(); else delete a.doneAt;
    }
    e.updatedAt = Date.now();
    save(s);
    res.json({ success: true });
  });
}
