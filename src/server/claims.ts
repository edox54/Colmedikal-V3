// Server-only. Self-service reembolsos + preautorizaciones.
//
// Requests and their documents live on THIS server (data/claims.json +
// data/claims-files/<claimId>/<fileId>), outside the public web root: the
// external API never stored attachments, and medical documents must only be
// readable by their owner (portal token) or an admin (admin token).
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import express from 'express';
import type { Express, Request, Response, RequestHandler } from 'express';
import {
  CLAIM_LABEL, CLAIM_STATUSES, CLIENT_EDITABLE, FILE_KINDS, SECTIONS,
  CLAIM_SLA_HOURS, SLA_RUNNING, claimTotal, missingForSubmit, openHours, slaDeadline, slaLight, type Claim, type ClaimStatus, type ClaimType, type InvoiceRow,
} from '../data/claims';
import { CLAIMS_NOTIFY_TO, CLIENT_REPLY_TO, LEAD_NOTIFY_TO, MAIL_FROM, esc, layout, mailer, rows, sendEach } from './leadMail';
import { logActivity } from './crm';

const MAX_FILE = 10 * 1024 * 1024; // 10 MB per document
const MAX_FILES = 30;
// Accepted document types, verified by magic bytes (never trust the client's MIME)
const SIGNATURES: { mime: string; ext: string; test: (b: Buffer) => boolean }[] = [
  { mime: 'application/pdf', ext: 'pdf', test: b => b.subarray(0, 5).toString() === '%PDF-' },
  { mime: 'image/jpeg', ext: 'jpg', test: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png', ext: 'png', test: b => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/webp', ext: 'webp', test: b => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' },
  { mime: 'image/heic', ext: 'heic', test: b => b.subarray(4, 12).toString().startsWith('ftyphei') || b.subarray(4, 12).toString().startsWith('ftypmif1') },
];

let FILE = '';
let HIDDEN_FILE = '';
/** IDs of legacy (external-API) refunds/authorizations deleted by an admin. The
 *  external API has no DELETE for them, so this list hides them everywhere. */
export function loadLegacyHidden(): string[] { try { return JSON.parse(fs.readFileSync(HIDDEN_FILE, 'utf8')); } catch { return []; } }
let FILES_DIR = '';
const load = (): Claim[] => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return []; } };
const save = (list: Claim[]) => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(list)); };
const str = (v: unknown, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : typeof v === 'number' ? String(v) : '');
const now = () => new Date().toISOString();

function nextId(list: Claim[], type: ClaimType) {
  const prefix = type === 'reembolso' ? 'RB' : 'PA';
  const n = list.filter(c => c.type === type).reduce((m, c) => Math.max(m, Number(c.id.split('-')[1]) || 0), 0) + 1;
  return `${prefix}-${String(n).padStart(6, '0')}`;
}

/** Keep only the schema's fields (strings, capped) — never store arbitrary client keys. */
function cleanForm(type: ClaimType, raw: any): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of SECTIONS[type]) for (const f of s.fields) {
    const v = str(raw?.[f.key], f.type === 'textarea' ? 3000 : 300);
    if (v) out[f.key] = v;
  }
  return out;
}
function cleanInvoices(raw: any): InvoiceRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 30).map((r: any) => ({
    fecha: str(r?.fecha, 10), numero: str(r?.numero, 60), emisor: str(r?.emisor, 160),
    valor: Math.max(0, Math.round((Number(String(r?.valor ?? '').replace(',', '.')) || 0) * 100) / 100),
  })).filter(r => r.numero || r.emisor || r.valor);
}

/** What the client sees (no internal-only data). */
const forClient = (c: Claim) => ({ ...c, history: c.history.map(h => ({ ...h, by: h.by === 'Cliente' ? 'Tú' : 'Colmedikal' })) });

export function registerClaimRoutes(app: Express, deps: {
  dataDir: string;
  verifyPortalToken: RequestHandler;
  requireAdmin: RequestHandler;
  /** Whether a lead (client) exists — staff can only file requests for real clients. */
  leadExists: (leadId: string) => Promise<boolean>;
  /** Emails of active "Equipo Comercial" members (SLA alerts). */
  commercialEmails: () => Promise<string[]>;
}) {
  FILE = path.join(deps.dataDir, 'claims.json');
  FILES_DIR = path.join(deps.dataDir, 'claims-files');
  HIDDEN_FILE = path.join(deps.dataDir, 'legacy-requests-deleted.json');
  const { verifyPortalToken, requireAdmin } = deps;

  const mine = (req: Request, res: Response): { list: Claim[]; claim: Claim } | null => {
    const list = load();
    const claim = list.find(c => c.id === req.params.id && c.leadId === String((req as any).leadId));
    if (!claim) { res.status(404).json({ success: false, message: 'Solicitud no encontrada' }); return null; }
    return { list, claim };
  };
  const sendFile = (res: Response, claim: Claim, fileId: string) => {
    const f = claim.files.find(x => x.id === fileId);
    const p = f && path.join(FILES_DIR, claim.id, f.id);
    if (!f || !p || !fs.existsSync(p)) return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    res.setHeader('Content-Type', f.mime);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(f.name)}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    fs.createReadStream(p).pipe(res);
  };

  // ---------- client (Mi Colmedikal), and staff filing on a client's behalf ----------
  // The same handlers serve both: the client under /api/portal/claims (lead from the portal token),
  // staff under /api/admin/claims-for/:leadId (admin token; lead from the URL).
  const clientRoutes = (base: string, auth: RequestHandler[], actor: (req: Request) => string, fileBy: 'cliente' | 'admin') => {
  app.get(base, ...auth, (req, res) => {
    const leadId = String((req as any).leadId);
    res.json({ success: true, data: load().filter(c => c.leadId === leadId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(forClient) });
  });

  // Create or update a draft (form data only; documents go through /files)
  app.post(base, ...auth, express.json({ limit: '200kb' }), (req, res) => {
    const type = req.body?.type as ClaimType;
    if (type !== 'reembolso' && type !== 'preautorizacion') return res.status(400).json({ success: false, message: 'Tipo inválido' });
    const leadId = String((req as any).leadId);
    const list = load();
    let claim = req.body?.id ? list.find(c => c.id === req.body.id && c.leadId === leadId) : undefined;
    if (req.body?.id && !claim) return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    if (claim && claim.status !== 'Borrador') return res.status(409).json({ success: false, message: 'La solicitud ya fue enviada' });
    if (!claim) {
      if (list.filter(c => c.leadId === leadId && c.status === 'Borrador').length >= 5) return res.status(429).json({ success: false, message: 'Tienes demasiados borradores; envía o descarta alguno.' });
      claim = { id: nextId(list, type), type, leadId, status: 'Borrador', createdAt: now(), updatedAt: now(), form: {}, invoices: [], declarationAccepted: false, files: [], history: [{ at: now(), by: actor(req), action: fileBy === 'admin' ? 'Borrador creado por el equipo Colmedikal' : 'Borrador creado' }], totalRequested: 0 };
      list.push(claim);
    }
    claim.form = cleanForm(type, req.body?.form);
    claim.invoices = type === 'reembolso' ? cleanInvoices(req.body?.invoices) : [];
    claim.declarationAccepted = req.body?.declarationAccepted === true;
    claim.totalRequested = claimTotal(type, claim.form, claim.invoices);
    claim.updatedAt = now();
    save(list);
    res.json({ success: true, data: forClient(claim) });
  });

  // Upload one document (raw body; name/kind in headers — avoids base64 bloat in memory)
  app.post(base + '/:id/files', ...auth, express.raw({ type: '*/*', limit: MAX_FILE }), (req, res) => {
    const m = mine(req, res); if (!m) return;
    const { list, claim } = m;
    if (!CLIENT_EDITABLE.includes(claim.status)) return res.status(409).json({ success: false, message: 'Esta solicitud ya no admite documentos' });
    if (claim.files.length >= MAX_FILES) return res.status(400).json({ success: false, message: `Máximo ${MAX_FILES} documentos por solicitud` });
    const kind = str(req.header('x-file-kind'), 30);
    if (!FILE_KINDS[claim.type].some(k => k.kind === kind)) return res.status(400).json({ success: false, message: 'Tipo de documento inválido' });
    const buf = req.body as Buffer;
    if (!Buffer.isBuffer(buf) || !buf.length) return res.status(400).json({ success: false, message: 'Archivo vacío' });
    const sig = SIGNATURES.find(s => s.test(buf));
    if (!sig) return res.status(415).json({ success: false, message: 'Formato no permitido. Sube PDF, JPG, PNG, WEBP o HEIC.' });
    let name = 'documento';
    try { name = decodeURIComponent(str(req.header('x-file-name'), 400)) || name; } catch { /* keep default */ }
    name = name.replace(/[\\/\0<>:"|?*\u0000-\u001f]/g, '_').slice(0, 120);
    const id = crypto.randomUUID();
    fs.mkdirSync(path.join(FILES_DIR, claim.id), { recursive: true });
    fs.writeFileSync(path.join(FILES_DIR, claim.id, id), buf);
    const file = { id, kind, name, mime: sig.mime, size: buf.length, uploadedAt: now(), by: fileBy };
    claim.files.push(file);
    if (claim.status !== 'Borrador') claim.history.push({ at: now(), by: actor(req), action: `Documento agregado: ${name}` });
    claim.updatedAt = now();
    save(list);
    res.json({ success: true, data: file });
  });

  app.delete(base + '/:id/files/:fileId', ...auth, (req, res) => {
    const m = mine(req, res); if (!m) return;
    const { list, claim } = m;
    // Once submitted, documents are part of the audit trail and can't be removed by the client
    if (claim.status !== 'Borrador') return res.status(409).json({ success: false, message: 'No se pueden quitar documentos de una solicitud enviada' });
    claim.files = claim.files.filter(f => f.id !== req.params.fileId);
    try { fs.unlinkSync(path.join(FILES_DIR, claim.id, path.basename(req.params.fileId))); } catch { /* already gone */ }
    save(list);
    res.json({ success: true });
  });

  app.get(base + '/:id/files/:fileId', ...auth, (req, res) => {
    const m = mine(req, res); if (!m) return;
    sendFile(res, m.claim, req.params.fileId);
  });

  app.delete(base + '/:id', ...auth, (req, res) => {
    const m = mine(req, res); if (!m) return;
    if (m.claim.status !== 'Borrador') return res.status(409).json({ success: false, message: 'Solo se pueden descartar borradores' });
    save(m.list.filter(c => c !== m.claim));
    fs.rmSync(path.join(FILES_DIR, m.claim.id), { recursive: true, force: true });
    res.json({ success: true });
  });

  // Submit a draft (validates required fields + documents), or reply to "Documentos pendientes"
  app.post(base + '/:id/submit', ...auth, express.json(), (req, res) => {
    const m = mine(req, res); if (!m) return;
    const { list, claim } = m;
    const comment = str(req.body?.comment, 1000);
    if (claim.status === 'Documentos pendientes') {
      claim.status = 'En revisión';
      claim.history.push({ at: now(), by: actor(req), action: 'Documentos enviados para revisión', status: 'En revisión', comment: comment || undefined });
    } else if (claim.status === 'Borrador') {
      const missing = missingForSubmit(claim);
      if (missing.length) return res.status(400).json({ success: false, message: 'Faltan datos o documentos', missing });
      claim.status = 'Recibida';
      claim.submittedAt = now();
      claim.history.push({ at: now(), by: actor(req), action: fileBy === 'admin' ? 'Solicitud cargada por el equipo Colmedikal' : 'Solicitud enviada', status: 'Recibida', comment: comment || undefined });
      logActivity(claim.leadId, 'sistema', `${CLAIM_LABEL[claim.type]} ${claim.id} ${fileBy === 'admin' ? 'cargada por el equipo' : 'enviada'} ($${claim.totalRequested.toFixed(2)})`, actor(req));
      notifyClient(claim, '').catch(e => console.error('[claims-mail-client]', e?.message || e)); // "recibida, respuesta en máx. 72 h"
    } else {
      return res.status(409).json({ success: false, message: 'Esta solicitud no está pendiente de envío' });
    }
    claim.updatedAt = now();
    save(list);
    notifyTeam(claim).catch(e => console.error('[claims-mail-team]', e?.message || e));
    res.json({ success: true, data: forClient(claim) });
  });
  };

  clientRoutes('/api/portal/claims', [verifyPortalToken], () => 'Cliente', 'cliente');

  // Staff: the admin token is checked by requireAdmin (API); the name shown in history comes from its payload.
  const staffName = (req: Request) => {
    try { const p = JSON.parse(Buffer.from(String(req.headers.authorization || '').split(' ')[1].split('.')[1], 'base64url').toString('utf8')); return str(p.name || p.email, 80) || 'Equipo Colmedikal'; }
    catch { return 'Equipo Colmedikal'; }
  };
  const staffLead: RequestHandler = async (req, res, next) => {
    const leadId = str(req.params.leadId, 80);
    if (!/^[\w-]{1,80}$/.test(leadId) || !(await deps.leadExists(leadId).catch(() => false))) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    (req as any).leadId = leadId;
    next();
  };
  clientRoutes('/api/admin/claims-for/:leadId', [requireAdmin, staffLead], staffName, 'admin');

  // ---------- admin ----------
  app.get('/api/admin/legacy-hidden', requireAdmin, (_req, res) => res.json({ success: true, data: loadLegacyHidden() }));
  app.post('/api/admin/legacy-hidden', requireAdmin, express.json(), (req, res) => {
    const id = str(req.body?.id, 60);
    if (!/^[\w-]{1,60}$/.test(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
    const list = loadLegacyHidden();
    if (!list.includes(id)) { list.push(id); fs.mkdirSync(path.dirname(HIDDEN_FILE), { recursive: true }); fs.writeFileSync(HIDDEN_FILE, JSON.stringify(list)); }
    console.log(`[legacy-hidden] ${id} eliminado por ${str(req.body?.by, 80) || 'admin'}`);
    res.json({ success: true });
  });

  app.get('/api/admin/claims', requireAdmin, (_req, res) => {
    checkSla(deps.commercialEmails).catch(e => console.error('[claims-sla]', e?.message || e)); // backup for an idle-stopped timer
    res.json({ success: true, data: load().filter(c => c.status !== 'Borrador').sort((a, b) => (b.submittedAt || b.createdAt).localeCompare(a.submittedAt || a.createdAt)) });
  });

  app.get('/api/admin/claims/:id/files/:fileId', requireAdmin, (req, res) => {
    const claim = load().find(c => c.id === req.params.id);
    if (!claim) return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    sendFile(res, claim, req.params.fileId);
  });

  // Decision: status change with comment / approved amount → timeline + client email
  app.post('/api/admin/claims/:id', requireAdmin, express.json(), (req, res) => {
    const list = load();
    const claim = list.find(c => c.id === req.params.id);
    if (!claim || claim.status === 'Borrador') return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    const status = req.body?.status as ClaimStatus;
    const comment = str(req.body?.comment, 2000);
    const by = str(req.body?.by, 80) || 'Admin';
    if (!(CLAIM_STATUSES[claim.type] as readonly string[]).includes(status)) return res.status(400).json({ success: false, message: 'Estado inválido' });
    if ((status === 'Rechazada' || status === 'Documentos pendientes') && !comment) return res.status(400).json({ success: false, message: 'Indica el motivo para el cliente' });
    if (status === 'Pagada' && claim.status !== 'Aprobada') return res.status(400).json({ success: false, message: 'Solo se puede marcar como pagada una solicitud aprobada' });
    if (status === 'Aprobada') {
      const amt = Number(req.body?.approvedAmount);
      if (!Number.isFinite(amt) || amt < 0) return res.status(400).json({ success: false, message: 'Indica el monto aprobado' });
      claim.approvedAmount = Math.round(amt * 100) / 100;
    }
    const prev = claim.status;
    claim.status = status;
    if (comment) claim.adminComment = comment;
    claim.history.push({ at: now(), by, action: prev === status ? 'Comentario agregado' : `${prev} → ${status}`, status, comment: comment || undefined });
    claim.updatedAt = now();
    save(list);
    logActivity(claim.leadId, 'sistema', `${CLAIM_LABEL[claim.type]} ${claim.id}: ${status}${status === 'Aprobada' ? ` ($${claim.approvedAmount?.toFixed(2)})` : ''}`, by);
    if (prev !== status || comment) notifyClient(claim, comment).catch(e => console.error('[claims-mail-client]', e?.message || e));
    res.json({ success: true, data: claim });
  });
}

// ---------- emails ----------
const TEAM_TO = () => [...new Set([...LEAD_NOTIFY_TO, ...CLAIMS_NOTIFY_TO])];
async function notifyTeam(c: Claim) {
  if (!mailer) return;
  const title = c.history.length && c.status === 'En revisión' ? `Documentos recibidos · ${c.id}` : `Nueva solicitud de ${c.type === 'reembolso' ? 'reembolso' : 'preautorización'} · ${c.id}`;
  const body = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">${rows([
    ['Solicitud', `${c.id} — ${CLAIM_LABEL[c.type]}`],
    ['Titular', c.form.titular], ['Paciente', `${c.form.paciente || ''} (${c.form.parentesco || ''})`],
    ['Cédula', c.form.cedula], ['Celular', c.form.celular], ['Correo', c.form.correo],
    [c.type === 'reembolso' ? 'Total facturas' : 'Presupuesto', `$${c.totalRequested.toFixed(2)}`],
    ...(c.type === 'preautorizacion' ? [['Hospital', c.form.hospital], ['Fecha probable de ingreso', c.form.fechaIngreso]] as [string, string][] : []),
    ['Documentos', c.files.length],
  ])}</table><p style="text-align:center"><a href="https://colmedikal.com/admin" style="background:#0C4169;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px">Revisar en el panel</a></p>`;
  await sendEach(TEAM_TO(), { from: MAIL_FROM, replyTo: c.form.correo || undefined, subject: title, html: layout(title, body) });
}

const STATUS_COPY: Partial<Record<ClaimStatus, string>> = {
  Recibida: `recibimos tu solicitud. Nuestro equipo la revisará y te responderá en un máximo de ${CLAIM_SLA_HOURS} horas.`,
  'En revisión': 'Nuestro equipo de auditoría médica está revisando tu solicitud.',
  'Documentos pendientes': 'Necesitamos documentos o información adicional para continuar. Ingresa a Mi Colmedikal y súbelos desde tu solicitud.',
  Aprobada: 'Tu solicitud fue aprobada.',
  Pagada: 'El valor aprobado de tu reembolso fue pagado.',
  Rechazada: 'Tu solicitud no pudo ser aprobada.',
};
async function notifyClient(c: Claim, comment: string) {
  const to = c.form.correo;
  if (!mailer || !to || !/\S+@\S+\.\S+/.test(to)) return;
  const title = `${c.type === 'reembolso' ? 'Reembolso' : 'Preautorización'} ${c.id}: ${c.status}`;
  const deadline = c.status === 'Recibida'
    ? `<p style="font-size:13px;color:#0f172a;background:#f0fdfa;border-left:3px solid #0d9488;padding:10px 12px">Respuesta a más tardar el <b>${esc(slaDeadline(c).toLocaleString('es-EC', { timeZone: 'America/Guayaquil', dateStyle: 'long', timeStyle: 'short' }))}</b>.</p>`
    : '';
  const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Hola ${esc((c.form.titular || '').split(' ')[0])}, ${esc(STATUS_COPY[c.status] || 'hay una actualización en tu solicitud.')}</p>${deadline}
<table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 16px">${rows([
    ['Solicitud', c.id], ['Paciente', c.form.paciente], ['Estado', c.status],
    ...(c.status === 'Aprobada' || c.status === 'Pagada' ? [['Monto aprobado', `$${(c.approvedAmount ?? 0).toFixed(2)}`]] as [string, string][] : []),
  ])}</table>
${comment ? `<p style="font-size:14px;color:#334155;line-height:1.6;background:#f8fafc;border-left:3px solid #0d9488;padding:10px 12px"><b>Comentario de Colmedikal:</b><br>${esc(comment).replace(/\n/g, '<br>')}</p>` : ''}
<p style="text-align:center;margin:24px 0"><a href="https://colmedikal.com/mi-colmedikal" style="background:#0d9488;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px">Ver mi solicitud</a></p>`;
  await mailer.sendMail({ from: MAIL_FROM, to, replyTo: CLIENT_REPLY_TO, subject: title, html: layout(title, body) });
}

// ---------- SLA alerts to the commercial team ----------
// Once per claim and threshold (24 h, 48 h, 72 h) while the clock runs; each email also lists every open case.
const SLA_THRESHOLDS = [24, 48, CLAIM_SLA_HOURS];
const LIGHT_COLOR = { verde: '#16a34a', amarillo: '#d97706', rojo: '#dc2626' } as const;
export async function checkSla(commercialEmails: () => Promise<string[]>, at = Date.now()) {
  if (!FILE) return;
  const list = load();
  const running = list.filter(c => SLA_RUNNING.includes(c.status));
  const due = running.filter(c => SLA_THRESHOLDS.some(t => openHours(c, at) >= t && !(c.slaAlerts || []).includes(t)));
  if (!due.length) return;
  const to = [...new Set([...(await commercialEmails().catch(() => [] as string[])), ...CLAIMS_NOTIFY_TO])];
  if (mailer && to.length) {
    const row = (c: Claim) => {
      const light = slaLight(c, at)!;
      return `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${LIGHT_COLOR[light]}"></span></td>
<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;font-family:monospace">${esc(c.id)}</td>
<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:13px">${esc(c.form.paciente || c.form.titular)}</td>
<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:13px">${esc(c.status)}</td>
<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:bold;text-align:right">${Math.floor(openHours(c, at))} h</td></tr>`;
    };
    const overdue = running.filter(c => openHours(c, at) >= CLAIM_SLA_HOURS).length;
    const title = overdue ? `${overdue} solicitud(es) superaron las ${CLAIM_SLA_HOURS} h` : `Solicitudes abiertas: ${due.map(c => c.id).join(', ')}`;
    const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Reembolsos y preautorizaciones abiertos. Compromiso con el cliente: respuesta en máximo ${CLAIM_SLA_HOURS} horas.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px">${running.sort((a, b) => openHours(b, at) - openHours(a, at)).map(row).join('')}</table>
<p style="font-size:12px;color:#64748b">● verde &lt; 48 h · ● amarillo 48–${CLAIM_SLA_HOURS} h · ● rojo ≥ ${CLAIM_SLA_HOURS} h</p>
<p style="text-align:center"><a href="https://colmedikal.com/admin" style="background:#0C4169;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px">Abrir el panel</a></p>`;
    await sendEach(to, { from: MAIL_FROM, subject: title, html: layout(title, body) });
  }
  // Mark as alerted even without SMTP, so a later SMTP fix doesn't send a burst of stale alerts.
  for (const c of due) c.slaAlerts = SLA_THRESHOLDS.filter(t => openHours(c, at) >= t);
  save(list);
  console.log('[claims-sla] alerted', due.map(c => c.id).join(','), 'to', to.length, 'recipients');
}

// ponytail: in-process timer — Passenger may stop an idle app, so checks also run on admin claim list loads.
//           Upgrade path: a cPanel cron hitting a secret-protected endpoint.
export function startSlaTimer(commercialEmails: () => Promise<string[]>) {
  const run = () => checkSla(commercialEmails).catch(e => console.error('[claims-sla]', e?.message || e));
  setTimeout(run, 60_000);
  setInterval(run, 30 * 60_000).unref();
  return run;
}
