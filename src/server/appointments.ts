// Server-only. Appointment management shared by the whole admin team and the patient's portal.
//
// Appointments live in api.colmedikal.com, but its PUT never reliably persisted status changes (the
// admin UI kept them in each browser's localStorage, so the patient and the rest of the team never saw
// them). Changes are now authoritative here, in data/appointment-updates.json, merged over the API
// record everywhere; the API PUT is still attempted (best effort, failures logged).
//   GET  /api/admin/appointment-updates          admin: every update (merged client-side)
//   POST /api/admin/appointments/:id/update      admin: confirm / reschedule / cancel / complete / message
//   POST /api/portal/appointments/:id/cancel     patient cancels their own appointment
import fs from 'fs';
import path from 'path';
import express from 'express';
import type { Express, Request, RequestHandler } from 'express';
import { CLIENT_REPLY_TO, LEAD_NOTIFY_TO, MAIL_FROM, esc, layout, mailer, rows, sendEach } from './leadMail';
import { logActivity } from './crm';

export const APT_STATUSES = ['Pendiente', 'Confirmada', 'Reagendada', 'Cancelada', 'Completada', 'No asistió'] as const;
export type AptStatus = typeof APT_STATUSES[number];
export interface AptEvent { at: string; by: string; action: string; note?: string }
export interface AptUpdate {
  status: AptStatus;
  doctorName?: string;
  aptDate?: string;
  aptTime?: string;
  note?: string; // last message shown to the patient
  history: AptEvent[];
}
type Store = Record<string, AptUpdate>;
type HttpsJson = (url: string, opts?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<any>;

const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const normId = (s: unknown) => (typeof s === 'string' ? s.toLowerCase().replace(/[\s-]/g, '') : '');
const fmtDate = (d?: string, t?: string) => {
  if (!d) return '';
  const [y, m, day] = d.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, day || 1).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return t ? `${date}, ${t.slice(0, 5)}` : date;
};

/** Apply the stored update over an appointment already mapped to the panel/portal shape. */
export function mergeAppointment<T extends { id: string | number; status?: string; doctorName?: string; aptDate?: string; aptTime?: string }>(a: T, store: Store) {
  const u = store[String(a.id)];
  if (!u) return a;
  return { ...a, status: u.status, doctorName: u.doctorName || a.doctorName, aptDate: u.aptDate || a.aptDate, aptTime: u.aptTime || a.aptTime, note: u.note, history: u.history };
}

export function registerAppointmentRoutes(app: Express, deps: {
  dataDir: string;
  requireAdmin: RequestHandler;
  verifyPortalToken: RequestHandler;
  httpsJson: HttpsJson;
  /** Raw API appointments (cached list). */
  listAppointments: () => Promise<any[]>;
  /** Lead (client) whose phone/email matches the appointment — for the patient email and the CRM timeline. */
  findClient: (apt: any) => Promise<{ leadId: string; email: string; fullName: string } | null>;
  /** Phone/email of the portal account (ownership check for patient cancel). */
  portalContact: (leadId: string) => Promise<{ email: string; phone: string } | null>;
}) {
  const FILE = path.join(deps.dataDir, 'appointment-updates.json');
  const load = (): Store => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; } };
  const save = (s: Store) => { fs.mkdirSync(deps.dataDir, { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(s)); };
  const staffName = (req: Request) => {
    try { const p = JSON.parse(Buffer.from(String(req.headers.authorization || '').split(' ')[1].split('.')[1], 'base64url').toString('utf8')); return str(p.name || p.email, 80) || 'Equipo Colmedikal'; }
    catch { return 'Equipo Colmedikal'; }
  };
  const findApt = async (id: string) => (await deps.listAppointments()).find(a => String(a.id) === id);

  app.get('/api/admin/appointment-updates', deps.requireAdmin, (_req, res) => res.json({ success: true, data: load() }));

  app.post('/api/admin/appointments/:id/update', deps.requireAdmin, express.json(), async (req, res) => {
    try {
      const id = str(req.params.id, 80);
      const status = req.body?.status as AptStatus;
      const note = str(req.body?.note, 1000);
      const doctorName = str(req.body?.doctorName, 120);
      const aptDate = str(req.body?.aptDate, 10);
      const aptTime = str(req.body?.aptTime, 8);
      const silent = req.body?.silent === true; // migration of old browser-only changes: no patient email
      if (!APT_STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'Estado inválido' });
      if (aptDate && !/^\d{4}-\d{2}-\d{2}$/.test(aptDate)) return res.status(400).json({ success: false, message: 'Fecha inválida' });
      if (aptTime && !/^\d{2}:\d{2}(:\d{2})?$/.test(aptTime)) return res.status(400).json({ success: false, message: 'Hora inválida' });
      if (status === 'Reagendada' && (!aptDate || !aptTime)) return res.status(400).json({ success: false, message: 'Indica la nueva fecha y hora' });
      if (status === 'Cancelada' && !note && !silent) return res.status(400).json({ success: false, message: 'Indica el motivo de la cancelación para el paciente' });
      const apt = await findApt(id);
      if (!apt) return res.status(404).json({ success: false, message: 'Cita no encontrada' });

      const store = load();
      const prev = store[id];
      const by = staffName(req);
      const u: AptUpdate = {
        status,
        doctorName: doctorName || prev?.doctorName,
        aptDate: aptDate || prev?.aptDate,
        aptTime: aptTime || prev?.aptTime,
        note: note || (prev?.status === status ? prev?.note : undefined),
        history: [...(prev?.history || []), { at: new Date().toISOString(), by, action: prev?.status === status ? 'Mensaje al paciente' : `${prev?.status || apt.status || 'Pendiente'} → ${status}`, note: note || undefined }],
      };
      store[id] = u;
      save(store);

      // Best effort: keep the API record in sync too (its failures were silent before)
      const tok = req.headers.authorization!.split(' ')[1];
      deps.httpsJson(`https://api.colmedikal.com/api/admin/appointments/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: u.status, ...(u.doctorName ? { doctor_name: u.doctorName } : {}), ...(u.aptDate ? { appointment_date: u.aptDate } : {}), ...(u.aptTime ? { appointment_time: u.aptTime } : {}) }),
      }).catch((e: any) => console.warn('[appointments] API PUT failed (kept locally):', id, e?.status || '', JSON.stringify(e?.json || e?.message || '')));

      const client = await deps.findClient(apt).catch(() => null);
      if (client) logActivity(client.leadId, 'sistema', `Cita ${apt.specialty || ''} (${u.aptDate || ''}): ${u.history[u.history.length - 1].action}${note ? ` — ${note}` : ''}`, by);
      if (!silent && client?.email) notifyPatient(apt, u, client).catch(e => console.error('[appointments-mail]', e?.message || e));
      res.json({ success: true, data: u, emailed: !silent && !!client?.email });
    } catch (e: any) {
      console.error('[appointments-update]', e?.message || e);
      res.status(500).json({ success: false, message: 'No se pudo actualizar la cita' });
    }
  });

  app.post('/api/portal/appointments/:id/cancel', deps.verifyPortalToken, express.json(), async (req, res) => {
    try {
      const id = str(req.params.id, 80);
      const leadId = String((req as any).leadId);
      const [apt, me] = await Promise.all([findApt(id), deps.portalContact(leadId)]);
      const owns = apt && me && ((me.phone && normId(apt.patient_phone) === normId(me.phone)) || (me.email && normId(apt.user_email) === normId(me.email)));
      if (!owns) return res.status(404).json({ success: false, message: 'Cita no encontrada' });
      const store = load();
      const current = store[id]?.status || apt.status || 'Pendiente';
      if (!['Pendiente', 'Confirmada', 'Reagendada'].includes(current)) return res.status(409).json({ success: false, message: 'Esta cita ya no se puede cancelar' });
      const reason = str(req.body?.reason, 500);
      store[id] = { ...(store[id] || { history: [] }), status: 'Cancelada', note: 'Cancelada por ti desde Mi Colmedikal.', history: [...(store[id]?.history || []), { at: new Date().toISOString(), by: 'Paciente', action: `${current} → Cancelada`, note: reason || undefined }] };
      save(store);
      logActivity(leadId, 'sistema', `El paciente canceló su cita ${apt.specialty || ''} (${store[id].aptDate || String(apt.appointment_date || '').split('T')[0]})${reason ? ` — ${reason}` : ''}`, 'Cliente');
      if (mailer) {
        const title = `Cita cancelada por el paciente · ${apt.patient_name || ''}`;
        const body = `<table width="100%" cellpadding="0" cellspacing="0">${rows([['Paciente', apt.patient_name], ['Teléfono', apt.patient_phone], ['Especialidad', apt.specialty], ['Centro', apt.clinic], ['Fecha', fmtDate(store[id].aptDate || String(apt.appointment_date || '').split('T')[0], store[id].aptTime || apt.appointment_time)], ['Motivo', reason || '—']])}</table>`;
        sendEach(LEAD_NOTIFY_TO, { from: MAIL_FROM, subject: title, html: layout(title, body) }).catch(e => console.error('[appointments-mail-team]', e?.message || e));
      }
      res.json({ success: true });
    } catch (e: any) {
      console.error('[portal-apt-cancel]', e?.message || e);
      res.status(500).json({ success: false, message: 'No se pudo cancelar la cita' });
    }
  });

  return { load };
}

const COPY: Record<AptStatus, string> = {
  Pendiente: 'tu cita está pendiente de confirmación.',
  Confirmada: 'tu cita fue confirmada.',
  Reagendada: 'tu cita fue reagendada. Revisa la nueva fecha y hora.',
  Cancelada: 'tu cita fue cancelada.',
  Completada: 'gracias por asistir a tu cita.',
  'No asistió': 'registramos que no pudiste asistir a tu cita. Si necesitas una nueva, agéndala desde Mi Colmedikal.',
};
async function notifyPatient(apt: any, u: AptUpdate, client: { email: string; fullName: string }) {
  if (!mailer) return;
  const title = `Tu cita de ${apt.specialty || 'consulta'}: ${u.status}`;
  const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Hola ${esc(client.fullName.split(' ')[0])}, ${esc(COPY[u.status])}</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 16px">${rows([
    ['Especialidad', apt.specialty], ['Médico', u.doctorName || (apt.doctor_name !== 'Por Asignar' ? apt.doctor_name : '')],
    ['Centro', [apt.clinic, apt.city].filter(Boolean).join(' · ')],
    ['Fecha y hora', fmtDate(u.aptDate || String(apt.appointment_date || '').split('T')[0], u.aptTime || apt.appointment_time)],
    ['Estado', u.status],
  ])}</table>
${u.note ? `<p style="font-size:14px;color:#334155;line-height:1.6;background:#f8fafc;border-left:3px solid #0d9488;padding:10px 12px"><b>Mensaje de Colmedikal:</b><br>${esc(u.note).replace(/\n/g, '<br>')}</p>` : ''}
<p style="text-align:center;margin:24px 0"><a href="https://colmedikal.com/mi-colmedikal" style="background:#0d9488;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px">Ver mis citas</a></p>`;
  await mailer.sendMail({ from: MAIL_FROM, to: client.email, replyTo: CLIENT_REPLY_TO, subject: title, html: layout(title, body) });
}
