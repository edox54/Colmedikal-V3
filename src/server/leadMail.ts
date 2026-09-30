// Server-only (imported by server.ts, never by the React app).
// SMTP through the cPanel mailbox. nodemailer is pure JS — no fetch/undici/WASM,
// so it's safe under the CloudLinux LVE memory limits (see httpsGetJson in server.ts).
import nodemailer from 'nodemailer';
import { PLANS } from '../data/plans';
import { generateQuotePDF } from '../utils/pdfGenerator';

const port = Number(process.env.SMTP_PORT) || 465;
export const mailer = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export const MAIL_FROM = process.env.MAIL_FROM || `Colmedikal <${process.env.SMTP_USER}>`;
// Team inbox: receives new-lead alerts AND the customer's replies (Reply-To on the quote email).
export const LEAD_NOTIFY_TO = (process.env.LEAD_NOTIFY_TO || 'colnexos2@gmail.com,contabilidad@grupocolnexos.com,info@colmedikal.com')
  .split(',').map(s => s.trim()).filter(Boolean);

const WHATSAPP = '098 702 8756';
const LOGO_URL = 'https://colmedikal.com/brand/colmedikal-logo.png';

const findPlan = (d: LeadMailData) =>
  PLANS.find(p => p.id === d.planId) || (d.plan ? PLANS.find(p => d.plan.startsWith(p.name)) : undefined);

/** The same "Cotización certificada" PDF the customer can download in the Cotizador. Null until a plan is chosen. */
export function quotePdfAttachment(d: LeadMailData): { filename: string; content: Buffer; contentType: string } | null {
  const plan = findPlan(d);
  if (!plan) return null;
  const doc = generateQuotePDF({
    download: false,
    leadCode: d.code,
    fullName: d.fullName,
    email: d.email,
    phone: d.phone,
    docNumber: d.docNumber || '—',
    docType: d.docType || 'cedula',
    planName: plan.name,
    basePrice: plan.basePrice,
    finalPrice: d.price > 0 ? d.price : plan.basePrice,
    province: d.province || '—',
    coverageStartDate: '',
    dependents: (d.childrenAges || []).map(age => ({ relation: 'Dependiente', age })),
    hospitalNetwork: 'Red Cobertura Directa Colmedikal',
    maxCoverage: plan.cobertura,
    dedHosp: plan.dedHosp,
    features: plan.caracteristicas || [],
    especialidades: plan.especialidades || {},
  });
  return { filename: `Colmedikal_Cotizacion_${d.code}.pdf`, content: Buffer.from(doc.output('arraybuffer')), contentType: 'application/pdf' };
}
const WHATSAPP_URL = 'https://wa.me/593987028756';

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const money = (n: number) => `$${n.toFixed(2)}`;

export interface LeadMailData {
  code: string;
  fullName: string;
  email: string;
  phone: string;
  docNumber?: string;
  birthDate?: string;
  province?: string;
  members: number; // titular + dependientes
  plan: string; // '' = todavía no eligió plan
  planId?: string;
  docType?: string;
  childrenAges?: number[];
  price: number;
  source?: { channel?: string; detail?: string; utmCampaign?: string; landingPage?: string };
  createdAt?: string;
}

const rows = (pairs: [string, unknown][]) =>
  pairs
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `<tr><td style="padding:8px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0">${esc(k)}</td><td style="padding:8px 12px;color:#0f172a;font-size:13px;font-weight:600;border-bottom:1px solid #e2e8f0">${esc(v)}</td></tr>`)
    .join('');

const layout = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#fff;padding:18px 24px;border-top:4px solid #0C4169;border-bottom:1px solid #e2e8f0"><img src="${LOGO_URL}" alt="Colmedikal — Medicina Prepagada S.A." width="180" style="display:block;width:180px;height:auto;border:0"></td></tr>
<tr><td style="padding:24px"><h1 style="margin:0 0 16px;font-size:18px;color:#0C4169">${esc(title)}</h1>${body}</td></tr>
<tr><td style="padding:16px 24px;background:#f8fafc;color:#64748b;font-size:12px">Colmedikal · Medicina prepagada · <a href="https://colmedikal.com" style="color:#0d9488">colmedikal.com</a> · WhatsApp <a href="${WHATSAPP_URL}" style="color:#0d9488">${WHATSAPP}</a></td></tr>
</table></td></tr></table></body></html>`;

export function clientMail(d: LeadMailData) {
  const first = d.fullName.split(' ')[0] || d.fullName;
  const title = d.plan ? `Tu cotización ${d.plan.split(' — ')[0]}` : 'Recibimos tu solicitud de cotización';
  const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Hola ${esc(first)}, gracias por cotizar con Colmedikal. Estos son los datos de tu solicitud:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 20px">${rows([
    ['Código de cotización', d.code],
    ['Plan', d.plan || 'Por definir con tu asesor'],
    ['Valor mensual referencial', d.price > 0 ? money(d.price) : ''],
    ['Personas a cubrir', d.members],
    ['Provincia', d.province],
  ])}</table>
${d.plan && findPlan(d) ? '<p style="font-size:14px;color:#334155;line-height:1.6">Adjuntamos en PDF la información de tu plan para que la tengas siempre a mano.</p>' : ''}
<p style="font-size:14px;color:#334155;line-height:1.6">Un asesor de afiliación se pondrá en contacto contigo para confirmar tu cotización. Si prefieres adelantarte, escríbenos por WhatsApp indicando tu código <b>${esc(d.code)}</b>.</p>
<p style="text-align:center;margin:24px 0"><a href="${WHATSAPP_URL}?text=${encodeURIComponent(`Hola, mi código de cotización es ${d.code}`)}" style="background:#0d9488;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px">Escribir por WhatsApp</a></p>`;
  return { subject: `${title} · ${d.code}`, html: layout(title, body) };
}

export function teamMail(d: LeadMailData, isNew: boolean) {
  const title = isNew ? 'Nuevo lead desde el cotizador' : 'Lead eligió un plan';
  const src = d.source;
  const body = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">${rows([
    ['Código', d.code],
    ['Nombre', d.fullName],
    ['Correo', d.email],
    ['Teléfono', d.phone],
    ['Cédula / Pasaporte', d.docNumber],
    ['Fecha de nacimiento', d.birthDate],
    ['Provincia', d.province],
    ['Personas a cubrir', d.members],
    ['Plan', d.plan || 'Sin plan elegido aún'],
    ['Valor mensual estimado', d.price > 0 ? money(d.price) : ''],
    ['Origen', src ? [src.channel, src.detail, src.utmCampaign].filter(Boolean).join(' · ') : ''],
    ['Página de entrada', src?.landingPage],
    ['Fecha', d.createdAt],
  ])}</table>
<p style="text-align:center"><a href="https://colmedikal.com/admin" style="background:#0C4169;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px">Abrir panel de leads</a></p>`;
  return { subject: `${title}: ${d.fullName} · ${d.code}`, html: layout(title, body) };
}
