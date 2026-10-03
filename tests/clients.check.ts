// Runnable check: `npx tsx tests/clients.check.ts`
import express from 'express';
import assert from 'assert';
import { registerClientRoutes } from '../src/server/clients';

const posted: any[] = [];
const welcomed: string[] = [];
const app = express();
registerClientRoutes(app, {
  requireAdmin: (req, res, next) => (req.headers.authorization === 'Bearer admin' ? next() : res.status(403).end()),
  httpsJson: async (_url, opts = {}) => { posted.push(JSON.parse(opts.body!)); return { id: 'new-1' }; },
  getLeads: async () => [{ id: 'old', quote_data: JSON.stringify({ docNumber: '1700000000' }) }],
  parseQuoteData: l => JSON.parse(l.quote_data),
  sendWelcome: async (leadId) => { welcomed.push(leadId); return true; },
});
const srv = app.listen(0);
const post = (body: any, tok = 'admin') => fetch(`http://127.0.0.1:${(srv.address() as any).port}/api/admin/clients`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` }, body: JSON.stringify(body) }).then(async r => ({ s: r.status, b: await r.json().catch(() => null) }));
const ok = { fullName: 'María López', docType: 'cedula', docNumber: '1712345678', email: 'Maria@x.co', phone: '0991234567', planId: 'inicio' };

(async () => {
  assert.equal((await post(ok, 'lead7')).s, 403);
  assert.equal((await post({ ...ok, fullName: 'María' })).s, 400, 'needs surname');
  assert.equal((await post({ ...ok, docNumber: '12345' })).s, 400, 'cédula 10 digits');
  assert.equal((await post({ ...ok, email: 'x' })).s, 400);
  const dup = await post({ ...ok, docNumber: '1700000000' });
  assert.equal(dup.s, 409); assert.equal(dup.b.leadId, 'old');
  const r = await post(ok);
  assert.equal(r.b.leadId, 'new-1'); assert.equal(r.b.welcomeSent, true);
  assert.equal(posted[0].status, 'Cierre Efectivo');
  assert.equal(posted[0].quote_data.email, 'maria@x.co');
  assert.equal(posted[0].quote_data.selectedPlanName, 'Plan Inicio 2K — $8/mes');
  assert.deepEqual(welcomed, ['new-1']);
  console.log('clients.check OK');
  srv.close();
})().catch(e => { console.error(e); process.exit(1); });
