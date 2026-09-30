// Server-only. Client-portal password self-service:
//   - "¿Olvidaste tu contraseña?"  POST /api/portal/forgot  → emailed one-time link (30 min)
//   - reset from that link         POST /api/portal/reset
//   - change while logged in       POST /api/portal/change-password (needs current password)
// Every change emails a "tu contraseña cambió" notice to the account's email.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import express from 'express';
import type { Express, RequestHandler } from 'express';
import { LEAD_NOTIFY_TO, MAIL_FROM, esc, layout, mailer } from './leadMail';
import { logActivity } from './crm';
import { passwordProblem } from '../data/password';

type Creds = Record<string, { docNumber: string; hash: string; salt: string; updatedAt: number }>;
type Tokens = Record<string, { leadId: string; exp: number }>; // key = sha256(token)

const TOKEN_TTL = 30 * 60_000;
const PORTAL_URL = 'https://colmedikal.com/mi-colmedikal';
export { passwordProblem } from '../data/password';

export function registerPortalPasswordRoutes(app: Express, deps: {
  dataDir: string;
  verifyPortalToken: RequestHandler;
  loadPortalCreds: () => Creds;
  savePortalCreds: (c: Creds) => void;
  hashPortalPassword: (p: string) => { hash: string; salt: string };
  verifyPortalPassword: (p: string, hash: string, salt: string) => boolean;
  /** Contact info of the lead behind a portal account (from the leads API). */
  getContact: (leadId: string) => Promise<{ email: string; fullName: string } | null>;
  /** Account whose password only lives in the lead's quote_data (never logged in since the local store existed). */
  findLegacyAccount?: (docNumber: string) => Promise<{ leadId: string; hash: string; salt: string } | null>;
}) {
  const TOKENS_FILE = path.join(deps.dataDir, 'portal-reset-tokens.json');
  const loadTokens = (): Tokens => { try { return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8')); } catch { return {}; } };
  const saveTokens = (t: Tokens) => {
    const now = Date.now();
    for (const k of Object.keys(t)) if (t[k].exp < now) delete t[k]; // prune expired
    fs.mkdirSync(deps.dataDir, { recursive: true });
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(t));
  };
  const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
  const normId = (s: unknown) => (typeof s === 'string' ? s.toLowerCase().replace(/\s/g, '').trim() : '');

  // ponytail: in-memory throttle (single process); resets on restart.
  const hits = new Map<string, number[]>();
  const throttled = (key: string, max: number, windowMs: number) => {
    const now = Date.now();
    const list = (hits.get(key) || []).filter(t => now - t < windowMs);
    list.push(now);
    hits.set(key, list);
    return list.length > max;
  };

  // Behind LiteSpeed/Passenger req.ip is the proxy; use the forwarded client IP
  // (spoofable, so it's only one of two throttles — the per-cédula one still holds).
  const clientIp = (req: express.Request) => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || '';

  const setPassword = (leadId: string, password: string) => {
    const store = deps.loadPortalCreds();
    const { hash, salt } = deps.hashPortalPassword(password);
    store[leadId] = { ...store[leadId], hash, salt, updatedAt: Date.now() };
    deps.savePortalCreds(store);
  };

  const sendChangedNotice = async (leadId: string, how: string) => {
    const c = await deps.getContact(leadId).catch(() => null);
    if (!mailer || !c?.email) return;
    const title = 'Tu contraseña de Mi Colmedikal cambió';
    const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Hola ${esc(c.fullName.split(' ')[0])}, la contraseña de tu cuenta en Mi Colmedikal se cambió ${esc(how)} el ${esc(new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil', dateStyle: 'long', timeStyle: 'short' }))}.</p>
<p style="font-size:14px;color:#334155;line-height:1.6">Si fuiste tú, no necesitas hacer nada. <b>Si no reconoces este cambio</b>, restablece tu contraseña de inmediato desde <a href="${PORTAL_URL}" style="color:#0d9488">Mi Colmedikal</a> y escríbenos por WhatsApp al 098 702 8756.</p>`;
    await mailer.sendMail({ from: MAIL_FROM, to: c.email, replyTo: LEAD_NOTIFY_TO, subject: title, html: layout(title, body) });
  };

  // 1) Request a reset link. Always answers the same way so it can't be used
  //    to discover which cédulas have an account.
  app.post('/api/portal/forgot', express.json(), async (req, res) => {
    const generic = { success: true, message: 'Si la cédula tiene una cuenta activa, enviamos un enlace para restablecer la contraseña al correo registrado. Revisa también la carpeta de spam.' };
    try {
      const doc = normId(req.body?.docNumber);
      if (!/^[a-z0-9]{5,20}$/.test(doc)) return res.status(400).json({ success: false, message: 'Ingresa tu número de cédula o pasaporte.' });
      if (throttled(`ip:${clientIp(req)}`, 10, 60 * 60_000) || throttled(`doc:${doc}`, 3, 15 * 60_000)) {
        return res.status(429).json({ success: false, message: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.' });
      }
      const store = deps.loadPortalCreds();
      let leadId = Object.entries(store).find(([, c]) => normId(c.docNumber) === doc)?.[0];
      if (!leadId) {
        const legacy = await deps.findLegacyAccount?.(doc).catch(() => null);
        if (!legacy) return res.json(generic);
        // Adopt it into the local store so the reset keeps the docNumber (login matches on it).
        leadId = legacy.leadId;
        store[leadId] = { docNumber: doc, hash: legacy.hash, salt: legacy.salt, updatedAt: Date.now() };
        deps.savePortalCreds(store);
      }
      if (!mailer) return res.json(generic);
      const contact = await deps.getContact(leadId).catch(() => null);
      if (!contact?.email) return res.json(generic);

      const token = crypto.randomBytes(32).toString('base64url');
      const tokens = loadTokens();
      for (const [k, v] of Object.entries(tokens)) if (v.leadId === leadId) delete tokens[k]; // one live link per account
      tokens[sha(token)] = { leadId, exp: Date.now() + TOKEN_TTL };
      saveTokens(tokens);

      const link = `${PORTAL_URL}?reset=${token}`;
      const title = 'Restablece tu contraseña de Mi Colmedikal';
      const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Hola ${esc(contact.fullName.split(' ')[0])}, recibimos una solicitud para restablecer la contraseña de tu cuenta en Mi Colmedikal.</p>
<p style="text-align:center;margin:28px 0"><a href="${link}" style="background:#0C4169;color:#fff;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:bold;font-size:14px">Crear nueva contraseña</a></p>
<p style="font-size:12px;color:#64748b;line-height:1.6">El enlace vence en 30 minutos y sirve una sola vez. Si no solicitaste este cambio, ignora este correo: tu contraseña actual sigue funcionando.</p>
<p style="font-size:11px;color:#94a3b8;word-break:break-all">Si el botón no funciona, copia este enlace en tu navegador:<br>${esc(link)}</p>`;
      await mailer.sendMail({ from: MAIL_FROM, to: contact.email, replyTo: LEAD_NOTIFY_TO, subject: title, html: layout(title, body) });
      logActivity(leadId, 'sistema', 'El cliente solicitó restablecer su contraseña del portal', 'Cliente');
      res.json(generic);
    } catch (e) {
      console.error('[portal-forgot]', e);
      res.json(generic); // never reveal internals here
    }
  });

  // 2) Set a new password with the emailed token (single use)
  app.post('/api/portal/reset', express.json(), async (req, res) => {
    try {
      const token = typeof req.body?.token === 'string' ? req.body.token : '';
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      if (throttled(`reset:${clientIp(req)}`, 20, 15 * 60_000)) return res.status(429).json({ success: false, message: 'Demasiados intentos. Espera unos minutos.' });
      const tokens = loadTokens();
      const rec = token ? tokens[sha(token)] : undefined;
      if (!rec || rec.exp < Date.now()) return res.status(400).json({ success: false, message: 'El enlace no es válido o ya venció. Solicita uno nuevo.' });
      const problem = passwordProblem(password);
      if (problem) return res.status(400).json({ success: false, message: problem });
      delete tokens[sha(token)];
      saveTokens(tokens);
      setPassword(rec.leadId, password);
      logActivity(rec.leadId, 'sistema', 'El cliente restableció su contraseña del portal (enlace por correo)', 'Cliente');
      sendChangedNotice(rec.leadId, 'mediante el enlace de restablecimiento').catch(e => console.error('[portal-reset-mail]', e?.message || e));
      res.json({ success: true, message: 'Contraseña actualizada. Ya puedes ingresar con tu cédula y la nueva contraseña.' });
    } catch (e) {
      console.error('[portal-reset]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  // 3) Change password from inside the portal (requires the current one)
  app.post('/api/portal/change-password', deps.verifyPortalToken, express.json(), async (req, res) => {
    try {
      const leadId = String((req as any).leadId);
      const current = typeof req.body?.current === 'string' ? req.body.current : '';
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      if (throttled(`chg:${leadId}`, 5, 15 * 60_000)) return res.status(429).json({ success: false, message: 'Demasiados intentos. Espera unos minutos.' });
      const cred = deps.loadPortalCreds()[leadId];
      if (!cred || !deps.verifyPortalPassword(current, cred.hash, cred.salt)) return res.status(400).json({ success: false, message: 'La contraseña actual no es correcta.' });
      const problem = passwordProblem(password);
      if (problem) return res.status(400).json({ success: false, message: problem });
      if (password === current) return res.status(400).json({ success: false, message: 'La nueva contraseña debe ser distinta de la actual.' });
      setPassword(leadId, password);
      logActivity(leadId, 'sistema', 'El cliente cambió su contraseña del portal', 'Cliente');
      sendChangedNotice(leadId, 'desde tu panel').catch(e => console.error('[portal-change-mail]', e?.message || e));
      res.json({ success: true, message: 'Contraseña actualizada.' });
    } catch (e) {
      console.error('[portal-change-password]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });
}
