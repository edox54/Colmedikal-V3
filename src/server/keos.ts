// Server-only. Pushes new leads to the KEOS CRM (webhook flow that sends WhatsApp / manages the lead).
// Native https (no fetch/undici/WASM) — same reason as leadMail.ts. Fire-and-forget: never blocks the quote flow.
import https from 'https';
import type { LeadMailData } from './leadMail';

const KEOS_WEBHOOK_URL = process.env.KEOS_WEBHOOK_URL || '';
const KEOS_WEBHOOK_TOKEN = process.env.KEOS_WEBHOOK_TOKEN || '';

/** Ecuador mobile → E.164 digits (0987028756 / 987028756 / +593987028756 → 593987028756). '' if not plausible. */
export function toE164Ec(raw: string): string {
  const d = String(raw || '').replace(/\D/g, '');
  const n = d.startsWith('593') ? d : d.startsWith('0') ? '593' + d.slice(1) : d.length === 9 ? '593' + d : d;
  return /^5939\d{8}$/.test(n) ? n : '';
}

export function sendLeadToKeos(d: LeadMailData, isNew: boolean): Promise<void> {
  return postToKeos(d.code, {
    event: isNew ? 'lead_created' : 'lead_plan_selected',
    code: d.code,
    fullName: d.fullName,
    firstName: d.fullName.split(' ')[0] || d.fullName,
    email: d.email,
    phone: d.phone,
    whatsapp: toE164Ec(d.phone),
    docNumber: d.docNumber || '',
    province: d.province || '',
    members: d.members,
    plan: d.plan,
    price: d.price,
    channel: d.source?.channel || '',
    utmCampaign: d.source?.utmCampaign || '',
    landingPage: d.source?.landingPage || '',
    createdAt: d.createdAt || '',
  });
}

export interface ContactData { ticket: string; fullName: string; email: string; phone: string; city: string; topic: string; message: string }

/** Contact-page form → same Keos flow as quotes (event 'contact_form'; topic goes in `plan`, text in `message`). */
export function sendContactToKeos(c: ContactData): Promise<void> {
  return postToKeos(c.ticket, {
    event: 'contact_form',
    code: c.ticket,
    fullName: c.fullName,
    firstName: c.fullName.split(' ')[0] || c.fullName,
    email: c.email,
    phone: c.phone,
    whatsapp: toE164Ec(c.phone),
    province: c.city,
    plan: c.topic,
    message: c.message,
    channel: 'contacto',
  });
}

function postToKeos(code: string, payload: Record<string, unknown>): Promise<void> {
  if (!KEOS_WEBHOOK_URL) return Promise.resolve();
  const body = JSON.stringify(payload);
  return new Promise(resolve => {
    const req = https.request(KEOS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(KEOS_WEBHOOK_TOKEN ? { Authorization: `Bearer ${KEOS_WEBHOOK_TOKEN}` } : {}),
      },
    }, res => {
      res.resume();
      if ((res.statusCode || 500) >= 300) console.error(`[keos] ${code}: HTTP ${res.statusCode}`);
      resolve();
    });
    req.on('error', e => { console.error(`[keos] ${code}:`, e.message); resolve(); });
    req.setTimeout(8000, () => req.destroy(new Error('timeout')));
    req.end(body);
  });
}
