// Runnable check for src/server/crm.ts: `npx tsx tests/crm.check.ts`
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import assert from 'assert';
import { registerCrmRoutes, logActivity } from '../src/server/crm';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'crm-'));
fs.writeFileSync(path.join(dir, 'portal-logins.json'), JSON.stringify({ '7': '2026-09-01T10:00:00.000Z' }));
const app = express();
registerCrmRoutes(app, {
  dataDir: dir,
  httpsJson: async (_u: string, o: any) => { if (o.headers.Authorization !== 'Bearer good') throw Object.assign(new Error('x'), { status: 401 }); return {}; },
  loadPortalCreds: () => ({ '7': { updatedAt: 1 } }),
});
const srv = app.listen(0);
const base = `http://127.0.0.1:${(srv.address() as any).port}`;
const call = (p: string, body?: any, tok = 'good') => fetch(base + p, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` }, body: body && JSON.stringify(body) }).then(async r => ({ status: r.status, j: await r.json() }));

(async () => {
  assert.equal((await call('/api/admin/crm', undefined, 'bad')).status, 403);
  assert.equal((await call('/api/admin/crm/7', { status: 'Contactado', by: 'Ana' })).j.success, true);
  assert.equal((await call('/api/admin/crm/7', { status: 'Nope' })).status, 400);
  await call('/api/admin/crm/7', { assignedTo: 'a@b.co', followUpDate: '2026-10-01' });
  assert.equal((await call('/api/admin/crm/7/activities', { type: 'nota', body: '' })).status, 400);
  const task = (await call('/api/admin/crm/7/activities', { type: 'llamada', body: 'Llamar', dueAt: '2026-10-02T15:00:00Z' })).j.data;
  await call(`/api/admin/crm/7/activities/${task.id}`, { done: true });
  logActivity('7', 'email', 'Cotización enviada');
  const { j } = await call('/api/admin/crm');
  const e = j.data['7'];
  assert.equal(e.status, 'Contactado');
  assert.equal(e.assignedTo, 'a@b.co');
  assert.deepEqual(e.activities.map((a: any) => a.type), ['email', 'llamada', 'sistema', 'cambio_etapa']);
  assert.ok(e.activities[1].doneAt);
  assert.equal(j.portal['7'].lastLoginAt, '2026-09-01T10:00:00.000Z');
  const stage = e.activities.find((a: any) => a.type === 'cambio_etapa');
  assert.equal((await call(`/api/admin/crm/7/activities/${stage.id}`, { delete: true })).status, 400);
  // silent patch (migration) must not add timeline entries
  await call('/api/admin/crm/8', { status: 'Perdido', silent: true });
  assert.equal((await call('/api/admin/crm')).j.data['8'].activities.length, 0);
  console.log('crm.check OK');
  srv.close();
})().catch(e => { console.error(e); process.exit(1); });
