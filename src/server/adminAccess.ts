// Server-only. Admin-team password links ("Gestionar Accesos"):
//   POST /api/admin/access/link          Super Admin emails a member a one-time link (24 h)
//                                         to create their password (new access) or set a new one.
//   POST /api/admin/access/set-password  the member sets it from that link.
//   GET  /api/admin/access/permissions   panel permissions (own; Super Admin gets everyone's)
//   PUT  /api/admin/access/permissions/:email   Super Admin sets a member's modules/actions
// Admin accounts live in api.colmedikal.com; the password is written there with the
// service account (API_ADMIN_EMAIL), which must be a Super Admin.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import express from 'express';
import type { Express } from 'express';
import { MAIL_FROM, esc, layout, mailer } from './leadMail';
import { cleanPermissions, roleDefaults, type AdminPermissions } from '../data/adminPermissions';

type Tokens = Record<string, { email: string; exp: number }>; // key = sha256(token)
type HttpsJson = (url: string, opts?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<any>;

const API = 'https://api.colmedikal.com';
const TOKEN_TTL = 24 * 60 * 60_000;
const ADMIN_URL = 'https://colmedikal.com/admin';
export const MIN_ADMIN_PASSWORD = 8;

// Payload of a JWT already accepted by the API (we only read it, the API verified it).
const jwtPayload = (tok: string): any => {
  try { return JSON.parse(Buffer.from(tok.split('.')[1], 'base64url').toString('utf8')); } catch { return null; }
};

export function registerAdminAccessRoutes(app: Express, deps: {
  dataDir: string;
  httpsJson: HttpsJson;
  getApiToken: (force?: boolean) => Promise<string>;
}) {
  const FILE = path.join(deps.dataDir, 'admin-password-tokens.json');
  const load = (): Tokens => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; } };
  const save = (t: Tokens) => {
    const now = Date.now();
    for (const k of Object.keys(t)) if (t[k].exp < now) delete t[k];
    fs.mkdirSync(deps.dataDir, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(t));
  };
  const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

  // ponytail: in-memory throttle (single process); resets on restart.
  const hits = new Map<string, number[]>();
  const throttled = (key: string, max: number, windowMs: number) => {
    const now = Date.now();
    const list = (hits.get(key) || []).filter(t => now - t < windowMs);
    list.push(now);
    hits.set(key, list);
    return list.length > max;
  };
  // Caller's token must be accepted by the API; returns the caller's row and the member list.
  const whoIs = async (req: express.Request) => {
    const tok = req.headers.authorization?.split(' ')[1] || '';
    if (!tok) return { status: 401 as const };
    let users: any[];
    const email = String(jwtPayload(tok)?.email || '').toLowerCase();
    try { users = (await deps.httpsJson(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${tok}` } }))?.data || []; }
    catch (e: any) { console.warn('[admin-whois] API rejected token of', email || '(no email)', e?.status || e?.message); return { status: 403 as const }; }
    const caller = users.find(u => String(u.email).toLowerCase() === email);
    if (!caller || !caller.active) { console.warn('[admin-whois]', email || '(no email)', caller ? 'is suspended' : 'not in admin_users'); return { status: 403 as const }; }
    return { status: 200 as const, caller, users, isSuper: caller.role === 'Super Admin' };
  };

  type PermStore = Record<string, AdminPermissions & { updatedAt: number; by: string }>;
  const PERMS_FILE = path.join(deps.dataDir, 'admin-permissions.json');
  const loadPerms = (): PermStore => { try { return JSON.parse(fs.readFileSync(PERMS_FILE, 'utf8')); } catch { return {}; } };
  const effective = (u: any, store: PermStore): AdminPermissions => {
    if (u.role === 'Super Admin') return roleDefaults('Super Admin'); // never restrictable → no lockout
    const saved = store[String(u.email).toLowerCase()];
    return saved ? { modules: saved.modules, deleteLeads: saved.deleteLeads } : roleDefaults(u.role);
  };

  app.get('/api/admin/access/permissions', async (req, res) => {
    const w = await whoIs(req);
    if (w.status !== 200) return res.status(w.status).json({ success: false, message: 'No autorizado' });
    const store = loadPerms();
    const mine = effective(w.caller, store);
    if (!w.isSuper) return res.json({ success: true, mine });
    const all: Record<string, AdminPermissions & { custom: boolean }> = {};
    for (const u of w.users) {
      const key = String(u.email).toLowerCase();
      all[key] = { ...effective(u, store), custom: !!store[key] && u.role !== 'Super Admin' };
    }
    res.json({ success: true, mine, all });
  });

  app.put('/api/admin/access/permissions/:email', express.json(), async (req, res) => {
    try {
      const w = await whoIs(req);
      if (w.status !== 200) return res.status(w.status).json({ success: false, message: 'No autorizado' });
      if (!w.isSuper) return res.status(403).json({ success: false, message: 'Solo el Super Admin puede gestionar accesos' });
      const target = String(req.params.email || '').toLowerCase();
      const member = w.users.find(u => String(u.email).toLowerCase() === target);
      if (!member) return res.status(404).json({ success: false, message: 'Miembro no encontrado' });
      if (member.role === 'Super Admin') return res.status(400).json({ success: false, message: 'El Super Admin siempre tiene acceso total.' });
      const store = loadPerms();
      if (req.body?.reset === true) delete store[target]; // back to role defaults
      else {
        const p = cleanPermissions(req.body);
        if (!p) return res.status(400).json({ success: false, message: 'Permisos inválidos' });
        store[target] = { ...p, updatedAt: Date.now(), by: String(w.caller.email) };
      }
      fs.mkdirSync(deps.dataDir, { recursive: true });
      fs.writeFileSync(PERMS_FILE, JSON.stringify(store));
      console.log('[admin-permissions]', target, 'set by', w.caller.email);
      res.json({ success: true, permissions: { ...effective(member, store), custom: !!store[target] } });
    } catch (e: any) {
      console.error('[admin-permissions]', e?.message || e);
      res.status(500).json({ success: false, message: 'No se pudieron guardar los permisos' });
    }
  });

  const clientIp = (req: express.Request) => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || '';

  // 1) Super Admin sends the link
  app.post('/api/admin/access/link', express.json(), async (req, res) => {
    try {
      const target = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      const isNew = req.body?.isNew === true;
      const w = await whoIs(req);
      if (w.status === 401) return res.status(401).json({ success: false, message: 'Token de administrador requerido' });
      if (w.status !== 200) return res.status(403).json({ success: false, message: 'No autorizado' });
      if (!w.isSuper) return res.status(403).json({ success: false, message: 'Solo el Super Admin puede gestionar accesos' });
      const { caller, users } = w;
      const callerEmail = String(caller.email).toLowerCase();
      const member = users.find(u => String(u.email).toLowerCase() === target);
      if (!member) return res.status(404).json({ success: false, message: 'Miembro no encontrado' });
      if (!mailer) return res.status(503).json({ success: false, message: 'El correo no está configurado en el servidor' });
      if (throttled(`link:${target}`, 5, 60 * 60_000)) return res.status(429).json({ success: false, message: 'Demasiados envíos para este miembro. Intenta más tarde.' });

      const token = crypto.randomBytes(32).toString('base64url');
      const tokens = load();
      for (const [k, v] of Object.entries(tokens)) if (v.email === target) delete tokens[k]; // one live link per member
      tokens[sha(token)] = { email: target, exp: Date.now() + TOKEN_TTL };
      save(tokens);

      const link = `${ADMIN_URL}?setpw=${token}`;
      const first = String(member.name || '').split(' ')[0];
      const title = isNew ? 'Tu acceso al panel de Colmedikal' : 'Crea tu nueva contraseña del panel de Colmedikal';
      const intro = isNew
        ? `${esc(caller.name || 'El administrador')} te dio acceso al panel administrativo de Colmedikal con el rol <b>${esc(member.role)}</b>. Para ingresar, primero crea tu contraseña.`
        : `${esc(caller.name || 'El administrador')} pidió que crees una nueva contraseña para tu acceso al panel administrativo de Colmedikal. Tu contraseña anterior seguirá funcionando hasta que la cambies.`;
      const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Hola ${esc(first)}, ${intro}</p>
<p style="text-align:center;margin:28px 0"><a href="${link}" style="background:#0C4169;color:#fff;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:bold;font-size:14px">Crear mi contraseña</a></p>
<p style="font-size:12px;color:#64748b;line-height:1.6">Tu usuario es <b>${esc(target)}</b>. El enlace vence en 24 horas y sirve una sola vez. Si no esperabas este correo, ignóralo.</p>
<p style="font-size:11px;color:#94a3b8;word-break:break-all">Si el botón no funciona, copia este enlace en tu navegador:<br>${esc(link)}</p>`;
      await mailer.sendMail({ from: MAIL_FROM, to: target, subject: title, html: layout(title, body) });
      console.log('[admin-access-link] sent to', target, 'by', callerEmail);
      res.json({ success: true, message: `Enviamos el enlace a ${target}.` });
    } catch (e: any) {
      console.error('[admin-access-link]', e?.message || e);
      res.status(500).json({ success: false, message: 'No se pudo enviar el correo' });
    }
  });

  // 2) Member sets the password from the link (single use)
  app.post('/api/admin/access/set-password', express.json(), async (req, res) => {
    try {
      const token = typeof req.body?.token === 'string' ? req.body.token : '';
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      if (throttled(`setpw:${clientIp(req)}`, 20, 15 * 60_000)) return res.status(429).json({ success: false, message: 'Demasiados intentos. Espera unos minutos.' });
      const tokens = load();
      const rec = token ? tokens[sha(token)] : undefined;
      if (!rec || rec.exp < Date.now()) return res.status(400).json({ success: false, message: 'El enlace no es válido o ya venció. Pide uno nuevo al administrador.' });
      if (password.length < MIN_ADMIN_PASSWORD || password.length > 200) return res.status(400).json({ success: false, message: `La contraseña debe tener al menos ${MIN_ADMIN_PASSWORD} caracteres.` });

      const put = async (svc: string) => deps.httpsJson(`${API}/api/admin/users/${encodeURIComponent(rec.email)}`, {
        method: 'PUT', headers: { Authorization: `Bearer ${svc}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
      });
      try { await put(await deps.getApiToken()); }
      catch (e: any) {
        if (e?.status !== 401) throw e;
        await put(await deps.getApiToken(true)); // service token expired → refresh once
      }
      delete tokens[sha(token)];
      save(tokens);
      console.log('[admin-set-password] password set for', rec.email);
      res.json({ success: true, message: 'Contraseña creada. Ya puedes ingresar con tu correo y la nueva contraseña.', email: rec.email });
    } catch (e: any) {
      // 403 here = the service account (API_ADMIN_EMAIL) is not a Super Admin in the API.
      console.error('[admin-set-password]', e?.status || '', e?.message || e);
      res.status(500).json({ success: false, message: 'No se pudo guardar la contraseña. Intenta de nuevo o contacta al administrador.' });
    }
  });
}
