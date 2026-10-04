// Runnable check: `npx tsx tests/appointments.check.ts`
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import assert from 'assert';
import { registerAppointmentRoutes, mergeAppointment } from '../src/server/appointments';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apt-'));
const apts = [{ id: 11, patient_name: 'Eduardo', patient_phone: '0979284074', specialty: 'Cardiología', appointment_date: '2026-10-05', appointment_time: '12:00:00', status: 'Pendiente' }];
const puts: string[] = [];
const app = express();
const { load } = registerAppointmentRoutes(app, {
  dataDir: dir,
  requireAdmin: (req, res, next) => (req.headers.authorization?.startsWith('Bearer admin') ? next() : res.status(403).end()),
  verifyPortalToken: (req, res, next) => { const t = req.headers.authorization?.split(' ')[1]; if (!t?.startsWith('lead')) return res.status(401).end(); (req as any).leadId = t.slice(4); next(); },
  httpsJson: async (url, opts = {}) => { puts.push(`${opts.method} ${url} ${opts.body}`); throw Object.assign(new Error('HTTP 500'), { status: 500 }); },
  listAppointments: async () => apts,
  findClient: async () => ({ leadId: '7', email: 'e@x.co', fullName: 'Eduardo Marín' }),
  portalContact: async id => (id === '7' ? { email: 'e@x.co', phone: '097 928 4074' } : { email: 'o@x.co', phone: '0999999999' }),
});
const srv = app.listen(0);
const base = `http://127.0.0.1:${(srv.address() as any).port}`;
const post = (p: string, tok: string, body: any) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` }, body: JSON.stringify(body) }).then(async r => ({ s: r.status, b: await r.json().catch(() => null) }));

(async () => {
  assert.equal((await post('/api/admin/appointments/11/update', 'lead7', { status: 'Confirmada' })).s, 403);
  assert.equal((await post('/api/admin/appointments/11/update', 'admin', { status: 'Inventada' })).s, 400);
  assert.equal((await post('/api/admin/appointments/11/update', 'admin', { status: 'Cancelada' })).s, 400, 'cancel needs a reason');
  assert.equal((await post('/api/admin/appointments/11/update', 'admin', { status: 'Reagendada', aptDate: '2026-10-07' })).s, 400, 'reschedule needs date+time');
  assert.equal((await post('/api/admin/appointments/99/update', 'admin', { status: 'Confirmada' })).s, 404);
  const ok = await post('/api/admin/appointments/11/update', 'admin', { status: 'Confirmada', doctorName: 'Dr. Ruiz' });
  assert.equal(ok.s, 200, 'API PUT failure does not block the change');
  assert.ok(puts[0].startsWith('PUT https://api.colmedikal.com/api/admin/appointments/11'));
  await post('/api/admin/appointments/11/update', 'admin', { status: 'Reagendada', aptDate: '2026-10-07', aptTime: '09:30', note: 'El médico cambió su agenda' });
  const merged: any = mergeAppointment({ id: 11, status: 'Pendiente', doctorName: 'Por Asignar', aptDate: '2026-10-05', aptTime: '12:00:00' }, load());
  assert.equal(merged.status, 'Reagendada'); assert.equal(merged.doctorName, 'Dr. Ruiz'); assert.equal(merged.aptDate, '2026-10-07'); assert.equal(merged.note, 'El médico cambió su agenda');
  assert.equal(merged.history.length, 2);
  // patient cancel: only the owner (phone match, spaces ignored)
  assert.equal((await post('/api/portal/appointments/11/cancel', 'lead8', {})).s, 404, 'not your appointment');
  assert.equal((await post('/api/portal/appointments/11/cancel', 'lead7', { reason: 'viaje' })).s, 200);
  assert.equal(load()['11'].status, 'Cancelada');
  assert.equal((await post('/api/portal/appointments/11/cancel', 'lead7', {})).s, 409, 'already cancelled');
  console.log('appointments.check OK');
  srv.close();
})().catch(e => { console.error(e); process.exit(1); });
