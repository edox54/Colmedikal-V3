import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import crypto from 'crypto';

// GET a JSON URL using the native https module (pure JS — avoids undici/fetch's
// WASM-based llhttp parser, which fails under CloudLinux LVE memory limits).
function httpsGetJson(url: string, timeoutMs = 4000): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
  });
}

// Security: Require JWT_SECRET to be set, fail fast if missing
const JWT_SECRET = process.env.JWT_SECRET;
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

if (!DASHBOARD_PASSWORD) {
  console.error('FATAL: DASHBOARD_PASSWORD environment variable is required');
  process.exit(1);
}

// Optional: external payment-provider integration. Unset by default — the
// endpoint below refuses all requests until this is configured, so its
// absence never breaks the rest of the app. Generate a long random value
// (e.g. `openssl rand -hex 32`) and set it in .env (never committed) and
// share ONLY that value with the provider through a secure channel — not
// email/Slack in plaintext, and never put it in this repo.
const PARTNER_API_KEY = process.env.PARTNER_API_KEY;

// Middleware: Verify JWT token
function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // SEO: www → non-www 301 redirect (canonical domain)
  app.use((req, res, next) => {
    if (req.hostname === 'www.colmedikal.com') {
      return res.redirect(301, 'https://colmedikal.com' + req.originalUrl);
    }
    next();
  });

  // Security: Apply helmet middleware (CSP desactivado para configuración manual)
  app.use(helmet({ contentSecurityPolicy: false }));

  // Security: Add custom security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // CSP: permite self + api externa + CDNs necesarios
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "connect-src 'self' https://api.colmedikal.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://*.tile.openstreetmap.org",
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "frame-src 'self' https://www.google.com https://maps.google.com https://www.openstreetmap.org",
        "media-src 'self' blob: data:",
        "worker-src 'self' blob:",
        "frame-ancestors 'none'",
        "object-src 'none'",
      ].join('; ')
    );
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // ENDPOINTS DE AUTENTICACIÓN
  app.post('/api/auth/login', express.json(), async (req, res) => {
    try {
      const { password } = req.body;

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ success: false, message: 'Contraseña requerida' });
      }

      // Verify password (constant-time comparison to prevent timing attacks)
      const passwordBuffer = Buffer.from(password);
      const correctBuffer = Buffer.from(DASHBOARD_PASSWORD!);

      let isValid = false;
      if (passwordBuffer.length === correctBuffer.length) {
        try {
          isValid = crypto.timingSafeEqual(passwordBuffer, correctBuffer);
        } catch {
          isValid = false;
        }
      }

      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
      }

      // Generate JWT token with expiration (1 hour)
      const token = jwt.sign(
        { iat: Date.now(), type: 'admin' },
        JWT_SECRET!,
        { expiresIn: '1h' }
      );

      res.json({ success: true, token });
    } catch (error) {
      console.error('[Auth Error]', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  app.get('/api/auth/verify', verifyToken, (req, res) => {
    res.json({ success: true });
  });

  // PROTEGER ENDPOINT DE FORMULARIOS
  app.get('/api/forms', verifyToken, (req, res) => {
    res.json({ success: true, forms: [] });
  });

  // General API routes (if any) go here first
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Version endpoint - muestra en el footer la versión y commit del último deploy
  app.get('/api/version', (req, res) => {
    try {
      const { execSync } = require('child_process');
      const metaRaw = fs.readFileSync(path.join(process.cwd(), 'metadata.json'), 'utf-8');
      const meta = JSON.parse(metaRaw);
      const deployVersion = meta.deployVersion || '1.0';

      const gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8', cwd: process.cwd() }).trim();
      const deployedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

      res.json({
        version: `V${deployVersion}`,
        commit: gitCommit,
        deployedAt,
      });
    } catch (error) {
      res.json({
        version: 'V1.1',
        commit: 'unknown',
        deployedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });
    }
  });

  // Endpoint para recibir datos de formularios
  app.post('/api/forms/submit', express.json(), async (req, res) => {
    try {
      const { type, data } = req.body;

      // Input validation: type must be one of the allowed values
      if (!type || !['contact', 'quote', 'reimbursement'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid form type' });
      }

      if (!data || typeof data !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid form data' });
      }

      console.log(`[API] Formulario ${type} recibido`);

      // Aquí iría la lógica para enviar a Kommo
      // Por ahora solo registramos

      res.json({
        success: true,
        message: `Formulario ${type} procesado correctamente`
      });
    } catch (error) {
      console.error('[API Error]', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // ==================== CROSS-DEVICE LEAD DEDUP (reads the real DB) ====================
  // Anonymous duplicate detection must consult the real leads database. The public
  // API exposes no lead-read endpoint, so this server authenticates to the admin API
  // with credentials from env (API_ADMIN_EMAIL / API_ADMIN_PASSWORD), fetches leads,
  // and matches by email / phone / cédula — returning the quote code STORED IN THE DB
  // (single source of truth, so the code shown always matches what the admin sees).
  // Token and lead list are cached to avoid hammering the API. Fails open so a lookup
  // glitch never blocks a legitimate lead.
  // SECURITY: these env creds grant full admin API access from the web server. Prefer a
  // dedicated limited/read-only admin user, or a purpose-built dedup endpoint on the API.
  const API_ADMIN_EMAIL = process.env.API_ADMIN_EMAIL;
  const API_ADMIN_PASSWORD = process.env.API_ADMIN_PASSWORD;
  const normId = (s: unknown) =>
    typeof s === 'string' ? s.toLowerCase().replace(/\s/g, '').trim() : '';

  // Minimal native-https JSON request (project avoids fetch under CloudLinux LVE).
  const httpsJson = (url: string, opts: { method?: string; headers?: Record<string, string>; body?: string; timeoutMs?: number } = {}): Promise<any> =>
    new Promise((resolve, reject) => {
      const u = new URL(url);
      const req = https.request(u, { method: opts.method || 'GET', headers: opts.headers }, (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          const status = res.statusCode || 0;
          let json: any = null;
          try { json = data ? JSON.parse(data) : null; } catch { /* non-JSON */ }
          if (status >= 200 && status < 300) resolve(json);
          else reject(Object.assign(new Error(`HTTP ${status}`), { status, json }));
        });
      });
      req.on('error', reject);
      req.setTimeout(opts.timeoutMs || 5000, () => req.destroy(new Error('timeout')));
      if (opts.body) req.write(opts.body);
      req.end();
    });

  let apiToken = '';
  let apiTokenAt = 0;
  const getApiToken = async (force = false): Promise<string> => {
    if (!force && apiToken && Date.now() - apiTokenAt < 50 * 60_000) return apiToken;
    const r = await httpsJson('https://api.colmedikal.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: API_ADMIN_EMAIL, password: API_ADMIN_PASSWORD }),
    });
    if (!r?.token) throw new Error('API admin login returned no token');
    apiToken = r.token; apiTokenAt = Date.now();
    return apiToken;
  };

  let leadsCache: any[] = [];
  let leadsCacheAt = 0;
  // ponytail: 20s cache + linear scan; fine for lead volumes. A resubmit within
  //           20s is still caught same-browser client-side. Tighten if needed.
  const getLeads = async (force = false): Promise<any[]> => {
    if (!force && Date.now() - leadsCacheAt < 20_000) return leadsCache;
    const fetchWith = async (tok: string) =>
      httpsJson('https://api.colmedikal.com/api/admin/leads?limit=2000', { headers: { Authorization: `Bearer ${tok}` } });
    let r: any;
    try {
      r = await fetchWith(await getApiToken());
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) r = await fetchWith(await getApiToken(true)); // token expired → refresh once
      else throw e;
    }
    leadsCache = Array.isArray(r?.data) ? r.data : [];
    leadsCacheAt = Date.now();
    return leadsCache;
  };

  app.post('/api/leads/lookup', express.json(), async (req, res) => {
    try {
      if (!API_ADMIN_EMAIL || !API_ADMIN_PASSWORD) {
        return res.json({ isDuplicate: false, codes: [], configured: false });
      }
      const nEmail = normId(req.body?.email), nPhone = normId(req.body?.phone), nDoc = normId(req.body?.docNumber);
      if (!nEmail && !nPhone && !nDoc) return res.json({ isDuplicate: false, codes: [] });

      const leads = await getLeads();
      const deleted = loadDeletedLeads();
      const codes = new Set<string>();
      let matched = false;
      for (const l of leads) {
        if (deleted[String(l.id)]) continue; // admin deleted this — don't resurrect it as a "duplicate"
        let qd: any = l.quote_data ?? l.quoteData;
        if (typeof qd === 'string') { try { qd = JSON.parse(qd); } catch { qd = {}; } }
        qd = qd || {};
        const e = normId(qd.email), p = normId(qd.phone), d = normId(qd.docNumber);
        if ((nEmail && e && e === nEmail) || (nPhone && p && p === nPhone) || (nDoc && d && d === nDoc)) {
          matched = true;
          if (qd.leadCode) codes.add(qd.leadCode);
        }
      }
      res.json({ isDuplicate: matched, codes: Array.from(codes) });
    } catch (e) {
      console.error('[lead-lookup]', e);
      res.json({ isDuplicate: false, codes: [] }); // fail-open
    }
  });

  // ==================== PORTAL DE AFILIADOS (cédula + contraseña) ====================
  // Clients are leads with status 'Cierre Efectivo'. An admin sets a password for a
  // client from the AdminPanel "Clientes" tab (POST /api/portal/set-password, using
  // the admin's OWN already-authenticated external-API bearer token — forwarded and
  // validated by the external API itself, never re-implemented here).
  //
  // We ALSO mirror the hash/salt into a local JSON file (data/portal-credentials.json).
  // This is the authoritative store login actually checks: PUT /api/admin/leads/{id}
  // has turned out not to reliably persist quote_data changes on this external API
  // (the same reason every other lead mutation in this app — status, notes, plan name,
  // payment status — carries a client-side override fallback). A password can't rely on
  // a client-side override since ANY visitor must be able to verify it, so the fallback
  // lives here on the server instead. The external API write is still attempted
  // best-effort (harmless if it works, ignored if it doesn't).
  const PORTAL_HASH_ITERATIONS = 210_000;
  const PORTAL_HASH_KEYLEN = 32;
  const PORTAL_HASH_DIGEST = 'sha256';

  const PORTAL_DATA_DIR = path.join(process.cwd(), 'data');
  const PORTAL_CREDS_FILE = path.join(PORTAL_DATA_DIR, 'portal-credentials.json');
  // Same non-persistence issue as passwords above, but for paymentStatus: the
  // AdminPanel's "Clientes" tab change was only ever surviving via a
  // client-side (admin's own browser) localStorage override, so the portal
  // — served from this server, reading the external API directly — never saw
  // it. This file is now the authoritative store /api/portal/me checks first.
  const PAYMENT_OVERRIDES_FILE = path.join(PORTAL_DATA_DIR, 'payment-status-overrides.json');
  type PaymentOverridesStore = Record<string, { paymentStatus: string; updatedAt: number }>;
  function loadPaymentOverrides(): PaymentOverridesStore {
    try { return JSON.parse(fs.readFileSync(PAYMENT_OVERRIDES_FILE, 'utf8')); } catch { return {}; }
  }
  function savePaymentOverrides(store: PaymentOverridesStore) {
    fs.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
    fs.writeFileSync(PAYMENT_OVERRIDES_FILE, JSON.stringify(store));
  }
  type PortalCredsStore = Record<string, { docNumber: string; hash: string; salt: string; updatedAt: number }>;
  function loadPortalCreds(): PortalCredsStore {
    try { return JSON.parse(fs.readFileSync(PORTAL_CREDS_FILE, 'utf8')); } catch { return {}; }
  }
  function savePortalCreds(store: PortalCredsStore) {
    fs.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
    fs.writeFileSync(PORTAL_CREDS_FILE, JSON.stringify(store));
  }

  // Client-editable address — same non-persistence issue as passwords/payment
  // status above. The client sets this themselves from the portal; this file
  // is the single source of truth both /api/portal/me and the AdminPanel
  // (via GET /api/admin/client-addresses) read, instead of each side drifting
  // independently.
  const CLIENT_ADDRESS_FILE = path.join(PORTAL_DATA_DIR, 'client-address-overrides.json');
  type ClientAddressEntry = { province: string; city: string; address1: string; address2?: string; postalCode: string; updatedAt: number };
  type ClientAddressStore = Record<string, ClientAddressEntry>;
  function loadClientAddresses(): ClientAddressStore {
    try { return JSON.parse(fs.readFileSync(CLIENT_ADDRESS_FILE, 'utf8')); } catch { return {}; }
  }
  function saveClientAddresses(store: ClientAddressStore) {
    fs.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
    fs.writeFileSync(CLIENT_ADDRESS_FILE, JSON.stringify(store));
  }

  // Same non-persistence issue, but for an anonymous lead's chosen plan: a
  // customer first submits the generic 3-step quote (blank selectedPlanName/
  // basePlanId, by design), then picks a specific plan and hits "Contratar".
  // That second write is a duplicate-merge PUT to the external API (unreliable,
  // as above) with only a browser-localStorage fallback — which is useless here
  // because the WRITER (the anonymous customer's browser) is never the READER
  // (the admin's browser). This file is the cross-device fix.
  const LEAD_PLAN_FILE = path.join(PORTAL_DATA_DIR, 'lead-plan-overrides.json');
  type LeadPlanEntry = { selectedPlanName: string; basePlanId?: string; estimatedPrice?: number; updatedAt: number };
  type LeadPlanStore = Record<string, LeadPlanEntry>;
  // Canonical plan catalog — same 3 real plans as Cotizador.tsx's plansComparativo
  // (duplicated, same pattern as elsewhere). Used so admins can set a plan by id
  // and get a correct name+price without retyping them.
  const PLAN_CATALOG: Record<string, { name: string; basePrice: number }> = {
    inicio: { name: 'Plan Inicio 2K', basePrice: 8 },
    proteccion: { name: 'Plan Protección 3K', basePrice: 12 },
    plus: { name: 'Plan Plus 5K', basePrice: 22 },
  };
  function loadLeadPlanOverrides(): LeadPlanStore {
    try { return JSON.parse(fs.readFileSync(LEAD_PLAN_FILE, 'utf8')); } catch { return {}; }
  }
  function saveLeadPlanOverrides(store: LeadPlanStore) {
    fs.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
    fs.writeFileSync(LEAD_PLAN_FILE, JSON.stringify(store));
  }

  // Admin-set contract number — replaces the quote code (COT-xxxxxx) as the
  // client's primary identifier once they're an active client. Purely
  // internal/admin-facing, not derived from anything the external API stores.
  const CONTRACT_NUMBERS_FILE = path.join(PORTAL_DATA_DIR, 'client-contract-numbers.json');
  type ContractNumberStore = Record<string, { contractNumber: string; updatedAt: number }>;
  function loadContractNumbers(): ContractNumberStore {
    try { return JSON.parse(fs.readFileSync(CONTRACT_NUMBERS_FILE, 'utf8')); } catch { return {}; }
  }
  function saveContractNumbers(store: ContractNumberStore) {
    fs.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
    fs.writeFileSync(CONTRACT_NUMBERS_FILE, JSON.stringify(store));
  }

  // Same non-persistence issue, but for deletion: DELETE /api/admin/leads/{id}
  // on the external API doesn't reliably persist either, and the admin's
  // client-side "hide it locally" override only works in that one browser.
  // The real record survives, so /api/leads/lookup (used by anonymous
  // Cotizador submissions) kept matching it and reporting a false "ya tienes
  // una cotización" — this store is what that endpoint now checks to exclude
  // truly-deleted leads, and what the AdminPanel reads to hide them everywhere.
  const DELETED_LEADS_FILE = path.join(PORTAL_DATA_DIR, 'deleted-lead-ids.json');
  type DeletedLeadsStore = Record<string, number>; // leadId -> deletedAt
  function loadDeletedLeads(): DeletedLeadsStore {
    try { return JSON.parse(fs.readFileSync(DELETED_LEADS_FILE, 'utf8')); } catch { return {}; }
  }
  function saveDeletedLeads(store: DeletedLeadsStore) {
    fs.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
    fs.writeFileSync(DELETED_LEADS_FILE, JSON.stringify(store));
  }

  function hashPortalPassword(password: string, saltHex?: string): { hash: string; salt: string } {
    const salt = saltHex || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, PORTAL_HASH_ITERATIONS, PORTAL_HASH_KEYLEN, PORTAL_HASH_DIGEST).toString('hex');
    return { hash, salt };
  }

  function verifyPortalPassword(password: string, storedHashHex: string, saltHex: string): boolean {
    try {
      const candidate = crypto.pbkdf2Sync(password, saltHex, PORTAL_HASH_ITERATIONS, PORTAL_HASH_KEYLEN, PORTAL_HASH_DIGEST);
      const stored = Buffer.from(storedHashHex, 'hex');
      if (candidate.length !== stored.length) return false;
      return crypto.timingSafeEqual(candidate, stored);
    } catch {
      return false;
    }
  }

  function verifyPortalToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token requerido' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as any;
      if (decoded?.type !== 'portal' || !decoded?.leadId) {
        return res.status(403).json({ success: false, message: 'Token inválido' });
      }
      (req as any).leadId = decoded.leadId;
      next();
    } catch {
      return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
    }
  }

  // Simple in-memory brute-force throttle, keyed by normalized cédula.
  // ponytail: single-process memory, resets on restart — swap for a shared
  //           store (Redis) if this ever runs behind multiple instances.
  const loginAttempts = new Map<string, { count: number; lockUntil: number }>();
  const LOGIN_MAX_ATTEMPTS = 5;
  const LOGIN_LOCKOUT_MS = 15 * 60_000;

  const genericCaches: Record<'refunds' | 'authorizations' | 'appointments', { data: any[]; at: number }> = {
    refunds: { data: [], at: 0 },
    authorizations: { data: [], at: 0 },
    appointments: { data: [], at: 0 },
  };
  const getAdminList = async (resource: 'refunds' | 'authorizations' | 'appointments'): Promise<any[]> => {
    const cache = genericCaches[resource];
    if (Date.now() - cache.at < 20_000) return cache.data;
    const fetchWith = async (tok: string) =>
      httpsJson(`https://api.colmedikal.com/api/admin/${resource}?limit=2000`, { headers: { Authorization: `Bearer ${tok}` } });
    let r: any;
    try {
      r = await fetchWith(await getApiToken());
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) r = await fetchWith(await getApiToken(true));
      else throw e;
    }
    cache.data = Array.isArray(r?.data) ? r.data : [];
    cache.at = Date.now();
    return cache.data;
  };

  const parseQuoteData = (l: any): any => {
    let qd: any = l.quote_data ?? l.quoteData;
    if (typeof qd === 'string') { try { qd = JSON.parse(qd); } catch { qd = {}; } }
    return qd || {};
  };

  app.post('/api/portal/login', express.json(), async (req, res) => {
    try {
      if (!API_ADMIN_EMAIL || !API_ADMIN_PASSWORD) {
        return res.status(503).json({ success: false, message: 'Portal no disponible por el momento' });
      }
      const docNumber = normId(req.body?.docNumber);
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      if (!docNumber || !password) {
        return res.status(400).json({ success: false, message: 'Cédula y contraseña son requeridas' });
      }

      const now = Date.now();
      const attempt = loginAttempts.get(docNumber);
      if (attempt && attempt.lockUntil > now) {
        return res.status(429).json({ success: false, message: 'Demasiados intentos. Intenta de nuevo en unos minutos.' });
      }

      // Primary: local credentials store (authoritative — see comment above).
      const credsStore = loadPortalCreds();
      let matchedLeadId: string | null = null;
      for (const [leadId, cred] of Object.entries(credsStore)) {
        if (cred.docNumber === docNumber && verifyPortalPassword(password, cred.hash, cred.salt)) {
          matchedLeadId = leadId;
          break;
        }
      }

      // Fallback: hash/salt embedded in quote_data, in case it did persist.
      // Best-effort — the external API being unreachable must not turn into a
      // 500 here, since the local store above is already authoritative.
      if (!matchedLeadId) {
        const leads = await getLeads(true).catch(() => [] as any[]);
        const candidates = leads
          .map(l => ({ l, qd: parseQuoteData(l) }))
          .filter(({ qd }) => normId(qd.docNumber) === docNumber && qd.portalPasswordHash && qd.portalPasswordSalt)
          .sort((a, b) => new Date(b.l.timestamp || 0).getTime() - new Date(a.l.timestamp || 0).getTime());
        const match = candidates.find(({ qd }) => verifyPortalPassword(password, qd.portalPasswordHash, qd.portalPasswordSalt));
        if (match) matchedLeadId = String(match.l.id);
      }

      if (!matchedLeadId) {
        const next = { count: (attempt?.count || 0) + 1, lockUntil: 0 };
        if (next.count >= LOGIN_MAX_ATTEMPTS) next.lockUntil = now + LOGIN_LOCKOUT_MS;
        loginAttempts.set(docNumber, next);
        return res.status(401).json({ success: false, message: 'Cédula o contraseña incorrecta' });
      }

      loginAttempts.delete(docNumber);
      const token = jwt.sign({ type: 'portal', leadId: matchedLeadId, iat: Date.now() }, JWT_SECRET!, { expiresIn: '4h' });
      res.json({ success: true, token });
    } catch (e) {
      console.error('[portal-login]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  app.get('/api/portal/me', verifyPortalToken, async (req, res) => {
    try {
      const leadId = (req as any).leadId;
      const leads = await getLeads();
      const lead = leads.find(l => String(l.id) === String(leadId));
      if (!lead) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
      const qd = parseQuoteData(lead);
      const paymentOverride = loadPaymentOverrides()[String(leadId)];
      const addressOverride = loadClientAddresses()[String(leadId)];
      const planOverride = loadLeadPlanOverrides()[String(leadId)];
      const addressComplete = !!(addressOverride?.province && addressOverride?.city && addressOverride?.address1 && addressOverride?.postalCode);
      res.json({
        success: true,
        data: {
          fullName: qd.fullName || '',
          docType: qd.docType || 'cedula',
          docNumber: qd.docNumber || '',
          email: qd.email || '',
          phone: qd.phone || '',
          address: {
            province: addressOverride?.province || qd.province || '',
            city: addressOverride?.city || '',
            address1: addressOverride?.address1 || '',
            address2: addressOverride?.address2 || '',
            postalCode: addressOverride?.postalCode || '',
          },
          addressComplete,
          leadCode: qd.leadCode || '',
          // planOverride is authoritative here — it's what an admin's "Cambiar
          // Plan" action and a customer's own plan pick both write, neither of
          // which reliably persists into qd via the external API's PUT.
          selectedPlanName: planOverride?.selectedPlanName || qd.selectedPlanName || '',
          basePlanId: planOverride?.basePlanId || qd.basePlanId || '',
          type: qd.type || 'individual',
          childrenCount: qd.childrenCount || 0,
          childrenAges: qd.childrenAges || [],
          estimatedPrice: planOverride?.estimatedPrice ?? Number(lead.estimated_price ?? lead.estimatedPrice ?? 0),
          paymentStatus: paymentOverride?.paymentStatus || qd.paymentStatus || 'Pendiente',
          status: lead.status || 'Cierre Efectivo',
          clientSince: lead.timestamp || lead.created_at || '',
        },
      });
    } catch (e) {
      console.error('[portal-me]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  app.get('/api/portal/dashboard', verifyPortalToken, async (req, res) => {
    try {
      const leadId = (req as any).leadId;
      const leads = await getLeads();
      const lead = leads.find(l => String(l.id) === String(leadId));
      if (!lead) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
      const qd = parseQuoteData(lead);
      const email = normId(qd.email), phone = normId(qd.phone);

      const [refundsRaw, authsRaw, aptsRaw] = await Promise.all([
        getAdminList('refunds'),
        getAdminList('authorizations'),
        getAdminList('appointments'),
      ]);

      const mine = (r: any) => (email && normId(r.user_email) === email) || (phone && normId(r.user_phone) === phone);

      res.json({
        success: true,
        data: {
          refunds: refundsRaw.filter(mine).map((r: any) => ({
            id: r.id,
            familyMember: r.family_member || '',
            specialty: r.specialty || '',
            amount: Number(r.amount || 0),
            refundDate: r.refund_date ? String(r.refund_date).split('T')[0] : '',
            status: r.status || 'Procesando',
            invoiceNumber: r.invoice_number || '',
            adminComment: r.admin_comment || undefined,
          })),
          authorizations: authsRaw.filter(mine).map((a: any) => ({
            id: a.id,
            patient: a.patient || '',
            procedure: a.procedure || '',
            facility: a.facility || '',
            requestDate: a.request_date || a.requestDate || '',
            status: a.status || 'Pendiente',
            adminComment: a.admin_comment || a.adminComment,
          })),
          appointments: aptsRaw.filter((a: any) =>
            (phone && normId(a.patient_phone) === phone)
          ).map((a: any) => ({
            id: a.id,
            doctorName: a.doctor_name || 'Por Asignar',
            specialty: a.specialty || '',
            aptDate: a.appointment_date ? String(a.appointment_date).split('T')[0] : '',
            aptTime: a.appointment_time || '',
            modality: a.modality || 'presencial',
            clinic: a.clinic || '',
            city: a.city || '',
            status: a.status || 'Pendiente',
          })),
        },
      });
    } catch (e) {
      console.error('[portal-dashboard]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  // Admin-only: set/reset a client's portal password. Trust is delegated entirely
  // to the external API — we simply forward the caller's own admin bearer token for
  // both the read (to preserve existing quoteData) and the write; if that token
  // isn't a valid admin session, the external API itself rejects both calls.
  app.post('/api/portal/set-password', express.json(), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(' ')[1];
      if (!callerToken) return res.status(401).json({ success: false, message: 'Token de administrador requerido' });

      const leadId = req.body?.leadId;
      const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
      if (!leadId || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Datos inválidos (mínimo 6 caracteres)' });
      }

      // Fetch the lead's current quote_data using the CALLER's token — validates
      // the caller is a real admin session as a side effect.
      let current: any;
      try {
        current = await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=2000`, {
          headers: { Authorization: `Bearer ${callerToken}` },
        });
      } catch (e: any) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: 'No autorizado' });
      }
      const lead = (current?.data || []).find((l: any) => String(l.id) === String(leadId));
      if (!lead) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });

      const qd = parseQuoteData(lead);
      const docNumber = normId(qd.docNumber);
      if (!docNumber) return res.status(400).json({ success: false, message: 'Este lead no tiene cédula registrada' });
      const { hash, salt } = hashPortalPassword(newPassword);

      // Authoritative write — this is what /api/portal/login actually checks.
      const store = loadPortalCreds();
      store[String(leadId)] = { docNumber, hash, salt, updatedAt: Date.now() };
      savePortalCreds(store);

      // Best-effort mirror into quote_data — harmless if the external API
      // doesn't persist it, since the local store above is already authoritative.
      try {
        const mergedQuote = { ...qd, portalPasswordHash: hash, portalPasswordSalt: salt };
        await httpsJson(`https://api.colmedikal.com/api/admin/leads/${leadId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${callerToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ quote_data: mergedQuote }),
        });
      } catch (e) {
        console.warn('[portal-set-password] external API mirror failed (non-fatal):', e);
      }

      res.json({ success: true });
    } catch (e) {
      console.error('[portal-set-password]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  // Admin-only: authoritative paymentStatus write — same rationale/pattern as
  // /api/portal/set-password above (external API PUT doesn't reliably persist
  // quote_data). Validates the caller via their own admin bearer token.
  app.post('/api/admin/set-payment-status', express.json(), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(' ')[1];
      if (!callerToken) return res.status(401).json({ success: false, message: 'Token de administrador requerido' });

      const leadId = req.body?.leadId;
      const paymentStatus = req.body?.paymentStatus;
      if (!leadId || !['Pagado', 'Pendiente', 'Atrasado'].includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: 'Datos inválidos' });
      }

      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` },
        });
      } catch (e: any) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: 'No autorizado' });
      }

      const store = loadPaymentOverrides();
      store[String(leadId)] = { paymentStatus, updatedAt: Date.now() };
      savePaymentOverrides(store);

      res.json({ success: true });
    } catch (e) {
      console.error('[admin-set-payment-status]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  // Client self-service: set/update their own address. Authoritative store —
  // read by /api/portal/me and mirrored to the admin panel below.
  app.post('/api/portal/address', verifyPortalToken, express.json(), async (req, res) => {
    try {
      const leadId = (req as any).leadId;
      const str = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0, max) : '';
      const province = str(req.body?.province, 100);
      const city = str(req.body?.city, 100);
      const address1 = str(req.body?.address1, 200);
      const address2 = str(req.body?.address2, 200);
      const postalCode = str(req.body?.postalCode, 20);
      if (!province || !city || !address1 || !postalCode) {
        return res.status(400).json({ success: false, message: 'Provincia, ciudad, Dirección 1 y código postal son obligatorios' });
      }

      const store = loadClientAddresses();
      store[String(leadId)] = { province, city, address1, address2, postalCode, updatedAt: Date.now() };
      saveClientAddresses(store);

      res.json({ success: true, address: { province, city, address1, address2, postalCode } });
    } catch (e) {
      console.error('[portal-address]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  // Admin: read the client-set addresses so the Clientes tab stays in sync
  // with what clients actually entered (the external API PUT path is unreliable,
  // so this is server-side truth, not something the admin browser can drift from).
  app.get('/api/admin/client-addresses', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(' ')[1];
      if (!callerToken) return res.status(401).json({ success: false, message: 'Token de administrador requerido' });

      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` },
        });
      } catch (e: any) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: 'No autorizado' });
      }

      const store = loadClientAddresses();
      const data: Record<string, { province: string; city: string; address1: string; address2?: string; postalCode: string }> = {};
      for (const [leadId, v] of Object.entries(store)) {
        data[leadId] = { province: v.province, city: v.city, address1: v.address1, address2: v.address2, postalCode: v.postalCode };
      }
      res.json({ success: true, data });
    } catch (e) {
      console.error('[admin-client-addresses]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  // Public (anonymous, same as the existing duplicate-merge PUT it backs up):
  // record the plan a customer picked after their initial generic quote.
  // Guarded by matching the caller's own email/phone/docNumber against the
  // lead's, so this can't be used to graffiti an arbitrary lead by ID alone.
  app.post('/api/leads/plan-override', express.json(), async (req, res) => {
    try {
      const leadId = req.body?.leadId;
      const selectedPlanName = typeof req.body?.selectedPlanName === 'string' ? req.body.selectedPlanName.trim().slice(0, 200) : '';
      const basePlanId = typeof req.body?.basePlanId === 'string' ? req.body.basePlanId.trim().slice(0, 50) : undefined;
      const estimatedPrice = Number(req.body?.estimatedPrice);
      if (!leadId || !selectedPlanName) return res.status(400).json({ success: false, message: 'Datos inválidos' });

      const email = normId(req.body?.email), phone = normId(req.body?.phone), docNumber = normId(req.body?.docNumber);
      const leads = await getLeads();
      const lead = leads.find(l => String(l.id) === String(leadId));
      if (!lead) return res.status(404).json({ success: false, message: 'No encontrado' });
      const qd = parseQuoteData(lead);
      const owns = (email && normId(qd.email) === email) || (phone && normId(qd.phone) === phone) || (docNumber && normId(qd.docNumber) === docNumber);
      if (!owns) return res.status(403).json({ success: false, message: 'No autorizado' });

      const store = loadLeadPlanOverrides();
      // Merge (not replace) so a customer's plan pick never clobbers an
      // admin's own manual plan correction made via /api/admin/set-lead-plan.
      store[String(leadId)] = { ...store[String(leadId)], selectedPlanName, basePlanId, estimatedPrice: Number.isFinite(estimatedPrice) ? estimatedPrice : undefined, updatedAt: Date.now() };
      saveLeadPlanOverrides(store);

      res.json({ success: true });
    } catch (e) {
      console.error('[leads-plan-override]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  // Admin-only: directly set/change a client's plan (upgrade/downgrade), independent
  // of whatever the customer originally picked. Writes the same authoritative store
  // /api/portal/me and the AdminPanel both read, so it takes effect everywhere at once.
  app.post('/api/admin/set-lead-plan', express.json(), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(' ')[1];
      if (!callerToken) return res.status(401).json({ success: false, message: 'Token de administrador requerido' });

      const leadId = req.body?.leadId;
      const basePlanId = req.body?.basePlanId;
      const plan = PLAN_CATALOG[basePlanId];
      if (!leadId || !plan) return res.status(400).json({ success: false, message: 'Plan inválido' });
      const customPrice = Number(req.body?.estimatedPrice);
      const estimatedPrice = Number.isFinite(customPrice) && customPrice > 0 ? customPrice : plan.basePrice;

      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` },
        });
      } catch (e: any) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: 'No autorizado' });
      }

      const store = loadLeadPlanOverrides();
      store[String(leadId)] = {
        ...store[String(leadId)],
        selectedPlanName: `${plan.name} — $${plan.basePrice}/mes`,
        basePlanId,
        estimatedPrice,
        updatedAt: Date.now(),
      };
      saveLeadPlanOverrides(store);

      res.json({ success: true });
    } catch (e) {
      console.error('[admin-set-lead-plan]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  // Admin-only: set the client's contract number (replaces the quote code as
  // their primary identifier once active).
  app.post('/api/admin/set-contract-number', express.json(), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(' ')[1];
      if (!callerToken) return res.status(401).json({ success: false, message: 'Token de administrador requerido' });

      const leadId = req.body?.leadId;
      const contractNumber = typeof req.body?.contractNumber === 'string' ? req.body.contractNumber.trim().slice(0, 100) : '';
      if (!leadId || !contractNumber) return res.status(400).json({ success: false, message: 'Datos inválidos' });

      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` },
        });
      } catch (e: any) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: 'No autorizado' });
      }

      const store = loadContractNumbers();
      store[String(leadId)] = { contractNumber, updatedAt: Date.now() };
      saveContractNumbers(store);

      res.json({ success: true });
    } catch (e) {
      console.error('[admin-set-contract-number]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  // Admin: read the plan overrides so the leads list reflects what the
  // customer actually picked, not just what the external API happened to persist.
  app.get('/api/admin/lead-overrides', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(' ')[1];
      if (!callerToken) return res.status(401).json({ success: false, message: 'Token de administrador requerido' });

      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` },
        });
      } catch (e: any) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: 'No autorizado' });
      }

      const planStore = loadLeadPlanOverrides();
      const contractStore = loadContractNumbers();
      const leadIds = new Set([...Object.keys(planStore), ...Object.keys(contractStore)]);
      const data: Record<string, { selectedPlanName?: string; basePlanId?: string; estimatedPrice?: number; contractNumber?: string }> = {};
      for (const leadId of leadIds) {
        data[leadId] = {
          selectedPlanName: planStore[leadId]?.selectedPlanName,
          basePlanId: planStore[leadId]?.basePlanId,
          estimatedPrice: planStore[leadId]?.estimatedPrice,
          contractNumber: contractStore[leadId]?.contractNumber,
        };
      }
      res.json({ success: true, data });
    } catch (e) {
      console.error('[admin-lead-overrides]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  // Admin: authoritative delete. Called alongside the existing external-API
  // DELETE attempt (see deleteLead in ColmedikalContext) — this is what
  // actually sticks, both for /api/leads/lookup's dedup check and for the
  // AdminPanel across any browser/device.
  app.post('/api/admin/delete-lead', express.json(), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(' ')[1];
      if (!callerToken) return res.status(401).json({ success: false, message: 'Token de administrador requerido' });

      const leadId = req.body?.leadId;
      if (!leadId) return res.status(400).json({ success: false, message: 'Datos inválidos' });

      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` },
        });
      } catch (e: any) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: 'No autorizado' });
      }

      const store = loadDeletedLeads();
      store[String(leadId)] = Date.now();
      saveDeletedLeads(store);

      res.json({ success: true });
    } catch (e) {
      console.error('[admin-delete-lead]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  app.get('/api/admin/deleted-leads', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(' ')[1];
      if (!callerToken) return res.status(401).json({ success: false, message: 'Token de administrador requerido' });

      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` },
        });
      } catch (e: any) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: 'No autorizado' });
      }

      res.json({ success: true, data: Object.keys(loadDeletedLeads()) });
    } catch (e) {
      console.error('[admin-deleted-leads]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  // ==================== EXTERNAL PAYMENT PROVIDER (pull model) ====================
  // The provider calls this to get the minimal data it needs to generate and
  // send its own payment link to the client — we never handle the payment
  // itself, only hand over name/contact/amount/reference for clients who
  // owe a payment. Authenticated with a static API key (PARTNER_API_KEY, set
  // in .env, never in this repo) compared with a timing-safe check, same
  // pattern as the portal password verification above.
  function verifyPartnerApiKey(req: Request, res: Response, next: NextFunction) {
    if (!PARTNER_API_KEY) return res.status(503).json({ success: false, message: 'Integración no configurada' });
    const authHeader = req.headers.authorization;
    const provided = authHeader && authHeader.split(' ')[1];
    if (!provided) return res.status(401).json({ success: false, message: 'API key requerida' });
    const a = Buffer.from(provided);
    const b = Buffer.from(PARTNER_API_KEY);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(403).json({ success: false, message: 'API key inválida' });
    }
    next();
  }

  app.get('/api/partner/pending-payments', verifyPartnerApiKey, async (req, res) => {
    try {
      const leads = await getLeads();
      const paymentOverrides = loadPaymentOverrides();
      const deleted = loadDeletedLeads();

      const data = leads
        .filter(l => !deleted[String(l.id)] && l.status === 'Cierre Efectivo')
        .map(l => {
          const qd = parseQuoteData(l);
          const paymentStatus = paymentOverrides[String(l.id)]?.paymentStatus || qd.paymentStatus || 'Pendiente';
          return { l, qd, paymentStatus };
        })
        .filter(({ paymentStatus }) => paymentStatus === 'Pendiente' || paymentStatus === 'Atrasado')
        .map(({ l, qd }) => ({
          reference: qd.leadCode || String(l.id),
          fullName: qd.fullName || '',
          email: qd.email || '',
          phone: qd.phone || '',
          docNumber: qd.docNumber || '',
          amount: Number(l.estimated_price ?? l.estimatedPrice ?? 0),
        }));

      res.json({ success: true, data });
    } catch (e) {
      console.error('[partner-pending-payments]', e);
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  });

  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProd = process.env.NODE_ENV === 'production' || hasDist;

  // Serve static assets and router middleware
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in the dist folder (index:false so all HTML routing
    // goes through our meta-injection handler below, including "/")
    app.use(express.static(distPath, { index: false }));

    // Per-route meta tag injection
    const routes: Record<string, { title: string; description: string; keywords: string; og_image: string }> = {
      '/': {
        title: 'Colmedikal | Medicina Prepagada en Ecuador — Planes Familia e Individual',
        description: 'Planes de medicina prepagada en Ecuador desde $8/mes. Acceso directo a especialistas y clinicas privadas.',
        keywords: 'medicina prepagada Ecuador, seguro médico privado, plan médico familia, Colmedikal',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/servicios': {
        title: 'Servicios de Medicina Prepagada | Colmedikal Ecuador',
        description: 'Servicios Colmedikal: hospitalizacion, cirugias, maternidad y atencion ambulatoria. Planes desde $8/mes.',
        keywords: 'servicios medicina prepagada, hospitalización privada Ecuador, maternidad prepagada',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/directorio': {
        title: 'Directorio de Médicos Especialistas y Clínicas | Colmedikal Ecuador',
        description: 'Directorio de medicos especialistas y clinicas en Ecuador. Profesionales en Quito, Guayaquil y todo el pais.',
        keywords: 'médicos especialistas Ecuador, directorio médico Quito, clínicas privadas Ecuador',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/nosotros': {
        title: 'Sobre Colmedikal | Medicina Prepagada con Respaldo Real en Ecuador',
        description: 'Conoce al equipo de Colmedikal: nuestra misión, valores y el compromiso con la salud de las familias ecuatorianas.',
        keywords: 'Colmedikal Ecuador, empresa medicina prepagada, seguro médico privado',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/cotizador': {
        title: 'Cotiza tu Plan de Medicina Prepagada | Colmedikal Ecuador',
        description: 'Cotiza tu plan de medicina prepagada en linea. Precios segun edad y cobertura, sin compromisos.',
        keywords: 'cotizar medicina prepagada Ecuador, precio plan médico familiar, cotizador seguro salud',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/tramites': {
        title: 'Trámites en Línea | Portal de Afiliados Colmedikal',
        description: 'Gestiona tus trámites de medicina prepagada en línea: solicitudes de reembolso, autorizaciones médicas y más.',
        keywords: 'trámites medicina prepagada, reembolso médico Ecuador, portal afiliados',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/agendamiento': {
        title: 'Agendamiento de Citas Médicas | Colmedikal Ecuador',
        description: 'Agenda tu cita médica con especialistas de Colmedikal. Atención presencial y telemedicina disponibles.',
        keywords: 'agendar cita médica Ecuador, telemedicina prepagada, consulta médica online',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/faqs': {
        title: 'Preguntas Frecuentes sobre Medicina Prepagada | Colmedikal',
        description: 'Resolvemos tus dudas sobre medicina prepagada: carencias, copagos, reembolsos y preexistencias.',
        keywords: 'preguntas medicina prepagada, diferencia IESS seguro privado, cómo funciona prepagada',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/contacto': {
        title: 'Contacto | Colmedikal Ecuador — Asesores de Medicina Prepagada',
        description: 'Contacta a Colmedikal: asesoria sobre planes de salud. WhatsApp, email y atencion presencial.',
        keywords: 'contacto Colmedikal, asesor medicina prepagada Ecuador, WhatsApp salud',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/blog': {
        title: 'Blog Médico y Guía de Bienestar | Colmedikal Ecuador',
        description: 'Artículos sobre medicina prepagada, prevención y salud en Ecuador escritos por especialistas de Colmedikal.',
        keywords: 'blog salud Ecuador, artículos medicina prepagada, guía bienestar',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/blog-detalle': {
        title: 'Blog | Colmedikal Ecuador',
        description: 'Lee este artículo del blog médico de Colmedikal Ecuador.',
        keywords: 'blog salud Ecuador, Colmedikal',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
    };

    // Escape a value for safe insertion into an HTML attribute
    const esc = (s: string) =>
      String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Fetch SEO meta overrides from the API/DB, cached for 60s to avoid per-request load.
    // Overrides are stored under keys like "meta_/directorio" => {title, description, keywords}.
    const API_BASE_URL = 'https://api.colmedikal.com';
    let overrideCache: Record<string, { title?: string; description?: string; keywords?: string }> = {};
    let overrideCacheAt = 0;
    let lastOvErr = 'none';
    const getOverrides = async () => {
      if (Date.now() - overrideCacheAt < 60_000) return overrideCache;
      try {
        const json: any = await httpsGetJson(`${API_BASE_URL}/api/public/settings`);
        const data = json?.data || {};
        const next: Record<string, any> = {};
        for (const [k, v] of Object.entries(data)) {
          if (k.startsWith('meta_')) {
            try { next[k.slice(5)] = JSON.parse(v as string); } catch { /* skip bad json */ }
          }
        }
        overrideCache = next;
        overrideCacheAt = Date.now();
        lastOvErr = `ok:${Object.keys(next).length}`;
      } catch (e: any) {
        const cause = e?.cause ? `|cause:${e.cause.code || e.cause.message || e.cause}` : '';
        lastOvErr = `${e?.name || 'err'}:${e?.message || e}${cause}`.slice(0, 160);
      }
      return overrideCache;
    };
    // Dynamic sitemap.xml — auto-generated from routes + blog posts via API
    app.get('/sitemap.xml', async (_req, res) => {
      const BASE = 'https://colmedikal.com';
      const now = new Date().toISOString().split('T')[0];
      const staticUrls = Object.keys(routes)
        .filter(r => r !== '/blog-detalle' && r !== '/cotizador')
        .map(r => `  <url><loc>${BASE}${r === '/' ? '' : r}</loc><lastmod>${now}</lastmod><changefreq>${r === '/' ? 'daily' : 'weekly'}</changefreq><priority>${r === '/' ? '1.0' : '0.8'}</priority></url>`);
      // Fetch blog posts from API for dynamic URLs
      let blogUrls: string[] = [];
      try {
        const blogJson: any = await httpsGetJson('https://api.colmedikal.com/api/public/blog');
        const posts = blogJson?.data || [];
        blogUrls = posts.map((p: any) => {
          const slug = p.slug || p.id;
          return `  <url><loc>${BASE}/blog/${slug}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`;
        });
      } catch { /* static blog fallback */ }
      // Extra routes not in the routes map
      const extraUrls = [
        `  <url><loc>${BASE}/mapa-red-medica</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
        `  <url><loc>${BASE}/privacy</loc><lastmod>${now}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
      ];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticUrls, ...extraUrls, ...blogUrls].join('\n')}\n</urlset>`;
      res.set('Content-Type', 'application/xml; charset=UTF-8');
      res.send(xml);
    });

    // Blog post lookup for SSR — fetch from API, cached 5 min
    let blogCache: any[] = [];
    let blogCacheAt = 0;
    const getBlogPosts = async () => {
      if (Date.now() - blogCacheAt < 300_000 && blogCache.length) return blogCache;
      try {
        const json: any = await httpsGetJson('https://api.colmedikal.com/api/public/blog');
        blogCache = json?.data || [];
        blogCacheAt = Date.now();
      } catch { /* keep stale cache */ }
      return blogCache;
    };

    // Provide general routing fallback to index.html for react-router-dom with per-route meta injection
    app.get('*', async (req, res) => {
      const pathname = req.path.replace(/\/$/, '') || '/';
      const basePath = pathname.startsWith('/blog/') ? '/blog-detalle' : pathname;
      let base = routes[basePath] || routes['/'];

      // Dynamic blog post SSR: resolve actual post title/description
      if (pathname.startsWith('/blog/') && pathname !== '/blog') {
        const slug = pathname.replace('/blog/', '');
        if (slug) {
          const posts = await getBlogPosts();
          const post = posts.find((p: any) => p.slug === slug || p.id === slug);
          if (post) {
            base = {
              title: `${post.title} | Blog Colmedikal`,
              description: post.excerpt || post.description || base.description,
              keywords: (post.tags || []).join(', ') || base.keywords,
              og_image: post.image || base.og_image,
            };
          }
        }
      }

      // Determine robots directive — noindex for admin/seo routes
      const noindexRoutes = ['/admin', '/seo-panel', '/power-seo'];
      const robotsContent = noindexRoutes.some(r => pathname.startsWith(r)) ? 'noindex, nofollow' : 'index, follow';

      // DB override (from SEO panel) wins over the hardcoded defaults
      const overrides = await getOverrides();
      const ov = overrides[pathname] || overrides[basePath] || {};
      const meta = {
        title: ov.title || base.title,
        description: ov.description || base.description,
        keywords: ov.keywords || base.keywords,
        og_image: base.og_image,
      };

      let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');

      // Replace <title>
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);

      // Inject meta + OG + Twitter tags before </head>
      const ogType = pathname.startsWith('/blog/') && pathname !== '/blog' ? 'article' : 'website';
      const inject = `
  <meta name="description" content="${esc(meta.description)}" />
  <meta name="keywords" content="${esc(meta.keywords)}" />
  <meta name="robots" content="${robotsContent}" />
  <link rel="canonical" href="https://colmedikal.com${pathname}" />
  <meta property="og:title" content="${esc(meta.title)}" />
  <meta property="og:description" content="${esc(meta.description)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="https://colmedikal.com${pathname}" />
  <meta property="og:image" content="${esc(meta.og_image)}" />
  <meta property="og:site_name" content="Colmedikal Prepagada" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(meta.title)}" />
  <meta name="twitter:description" content="${esc(meta.description)}" />
  <meta name="twitter:image" content="${esc(meta.og_image)}" />`;

      html = html.replace('</head>', inject + '\n  </head>');

      // --- Server-side JSON-LD injection (visible to all AI crawlers) ---
      const schemas: object[] = [
        // Global entity — every page
        {
          '@context': 'https://schema.org',
          '@type': 'MedicalOrganization',
          '@id': 'https://colmedikal.com/#organization',
          name: 'Colmedikal S.A.',
          alternateName: 'Colmedikal',
          disambiguatingDescription: 'Empresa ecuatoriana de medicina prepagada, distinta de Colmédica Colombia',
          url: 'https://colmedikal.com',
          logo: { '@type': 'ImageObject', url: 'https://colmedikal.com/og-image.jpg' },
          description: 'Empresa ecuatoriana de medicina prepagada con planes de salud individual, familiar y corporativo. Acceso inmediato a más de 25 especialidades médicas en clínicas de alta complejidad en Ecuador.',
          foundingDate: '2011-10-05',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Av. República E6-447 y Eloy Alfaro, Ed. Castillo Sánchez',
            addressLocality: 'Quito',
            addressRegion: 'Pichincha',
            postalCode: '170150',
            addressCountry: 'EC',
          },
          contactPoint: [
            { '@type': 'ContactPoint', telephone: '+593-2-2567191', contactType: 'customer service', areaServed: 'EC', availableLanguage: 'Spanish' },
            { '@type': 'ContactPoint', telephone: '+593-98-7028756', contactType: 'customer service', contactOption: 'TollFree', areaServed: 'EC', availableLanguage: 'Spanish' },
          ],
          areaServed: [
            { '@type': 'City', name: 'Quito' }, { '@type': 'City', name: 'Guayaquil' },
            { '@type': 'City', name: 'Cuenca' }, { '@type': 'City', name: 'Manta' },
            { '@type': 'City', name: 'Ambato' },
          ],
          medicalSpecialty: ['Emergency', 'Geriatric', 'Pediatric', 'Obstetrics'],
          sameAs: [
            'https://www.facebook.com/colmedikal',
            'https://www.instagram.com/colmedikal',
            'https://www.linkedin.com/company/colmedikal',
          ],
        },
        // WebSite — sitelinks search box signal
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          '@id': 'https://colmedikal.com/#website',
          url: 'https://colmedikal.com',
          name: 'Colmedikal',
          inLanguage: 'es-EC',
          publisher: { '@id': 'https://colmedikal.com/#organization' },
        },
      ];

      // Page-specific schemas
      if (pathname === '/faqs') {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          '@id': 'https://colmedikal.com/faqs',
          url: 'https://colmedikal.com/faqs',
          inLanguage: 'es-EC',
          mainEntity: [
            { '@type': 'Question', name: '¿Qué es la medicina prepagada en Ecuador?', acceptedAnswer: { '@type': 'Answer', text: 'La medicina prepagada es un sistema de salud privado en el que el afiliado paga una cuota mensual a cambio de cobertura médica inmediata: consultas con especialistas sin referencia, hospitalización en clínicas privadas, cirugías, maternidad y emergencias 24/7, todo sin depender del IESS.' } },
            { '@type': 'Question', name: '¿Cuánto cuesta la medicina prepagada Colmedikal?', acceptedAnswer: { '@type': 'Answer', text: 'Colmedikal ofrece tres planes: Esencial desde $8 USD/mes por persona (cobertura $2,000/año), Recomendado desde $12 USD/mes ($3,000/año) y Platinum desde $22 USD/mes ($5,000/año). Los precios varían según edad y número de beneficiarios.' } },
            { '@type': 'Question', name: '¿Qué son los períodos de carencia?', acceptedAnswer: { '@type': 'Answer', text: 'El período de carencia es el tiempo de espera desde la afiliación antes de que se active cada cobertura. En Colmedikal: emergencias 24 horas, consultas ambulatorias 30 días, maternidad 60-90 días, hospitalización y cirugías 90 días, y preexistencias declaradas 730 días (24 meses).' } },
            { '@type': 'Question', name: '¿Cómo funcionan las preexistencias en Colmedikal?', acceptedAnswer: { '@type': 'Answer', text: 'Las enfermedades preexistentes declaradas al momento de la afiliación quedan cubiertas a partir del mes 25 de vigencia, hasta el límite anual contratado o 20 salarios básicos, conforme a la legislación ecuatoriana. Las preexistencias no declaradas quedan excluidas permanentemente.' } },
            { '@type': 'Question', name: '¿Cómo solicitar un reembolso médico en Colmedikal?', acceptedAnswer: { '@type': 'Answer', text: 'Ingresa a la sección de Trámites en Línea en colmedikal.com/tramites, sube la factura del médico particular, la historia clínica y la receta. El reembolso se procesa en un promedio de 5 días hábiles si la atención está dentro de las coberturas del plan.' } },
            { '@type': 'Question', name: '¿En qué ciudades de Ecuador opera Colmedikal?', acceptedAnswer: { '@type': 'Answer', text: 'Colmedikal opera en Quito (sede principal), Guayaquil, Cuenca, Ambato, Manta, Riobamba, Loja, Ibarra, Santo Domingo, Portoviejo, Machala y Esmeraldas, con una red de especialistas y clínicas afiliadas en cada ciudad.' } },
            { '@type': 'Question', name: '¿Puedo agendar citas directamente con especialistas?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. Una de las principales ventajas de Colmedikal es el acceso directo a más de 25 especialidades médicas sin necesidad de pasar primero por un médico general. Puedes agendar tu cita en colmedikal.com/agendamiento o llamando al 02-2567191.' } },
            { '@type': 'Question', name: '¿Qué diferencia hay entre Colmedikal y el IESS?', acceptedAnswer: { '@type': 'Answer', text: 'El IESS es el seguro social obligatorio del Estado ecuatoriano con tiempos de espera para especialistas. Colmedikal es un sistema privado de medicina prepagada que garantiza atención inmediata, acceso directo a especialistas, hospitalización en clínicas privadas de alta complejidad y cobertura de maternidad desde el primer mes según el plan.' } },
          ],
        });
      }

      if (pathname === '/' || pathname === '') {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://colmedikal.com/',
          url: 'https://colmedikal.com/',
          inLanguage: 'es-EC',
          name: 'Colmedikal | La Mejor Medicina Prepagada de Ecuador',
          about: { '@id': 'https://colmedikal.com/#organization' },
          speakable: { '@type': 'SpeakableSpecification', cssSelector: ['[data-speakable]', '.hero-headline', '.hero-description'] },
        });
      }

      if (pathname.startsWith('/blog/') && pathname !== '/blog') {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          '@id': `https://colmedikal.com${pathname}`,
          inLanguage: 'es-EC',
          publisher: { '@id': 'https://colmedikal.com/#organization' },
          isPartOf: { '@type': 'Blog', '@id': 'https://colmedikal.com/blog' },
          audience: { '@type': 'MedicalAudience', audienceType: 'Patient', geographicArea: { '@type': 'Country', name: 'Ecuador' } },
          speakable: { '@type': 'SpeakableSpecification', cssSelector: ['[data-speakable]', '.article-intro'] },
        });
      }

      const ldBlocks = schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n  ');
      html = html.replace('</head>', `  ${ldBlocks}\n  </head>`);

      res.set('Content-Type', 'text/html; charset=UTF-8');
      res.send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
