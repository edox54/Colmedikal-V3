// Runnable check: `npx tsx tests/adminAccess.check.ts` (no SMTP in tests → /link stops at 503 after the auth checks).
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import assert from 'assert';
import { registerAdminAccessRoutes } from '../src/server/adminAccess';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-'));
const jwt = (email: string) => `x.${Buffer.from(JSON.stringify({ email })).toString('base64url')}.y`;
const users = [
  { email: 'boss@x.co', name: 'Boss', role: 'Super Admin', active: 1 },
  { email: 'aud@x.co', name: 'Aud', role: 'Auditor', active: 1 },
];
const puts: { url: string; auth: string; body: string }[] = [];
const app = express();
registerAdminAccessRoutes(app, {
  dataDir: dir,
  getApiToken: async () => 'svc',
  httpsJson: async (url, opts = {}) => {
    if (opts.method === 'PUT') { puts.push({ url, auth: opts.headers!.Authorization, body: opts.body! }); return {}; }
    if (opts.headers?.Authorization === 'Bearer bad') throw Object.assign(new Error('HTTP 401'), { status: 401 });
    return { data: users };
  },
});
const srv = app.listen(0);
const base = `http://127.0.0.1:${(srv.address() as any).port}`;
const post = (p: string, body: any, tok?: string) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) }, body: JSON.stringify(body) }).then(r => r.status);

(async () => {
  assert.equal(await post('/api/admin/access/link', { email: 'aud@x.co' }), 401);
  assert.equal(await post('/api/admin/access/link', { email: 'aud@x.co' }, 'bad'), 403, 'token rejected by API');
  assert.equal(await post('/api/admin/access/link', { email: 'boss@x.co' }, jwt('aud@x.co')), 403, 'only Super Admin');
  assert.equal(await post('/api/admin/access/link', { email: 'nadie@x.co' }, jwt('boss@x.co')), 404);
  assert.equal(await post('/api/admin/access/link', { email: 'aud@x.co' }, jwt('boss@x.co')), 503, 'reaches mail step');
  const token = 'tok-123';
  fs.writeFileSync(path.join(dir, 'admin-password-tokens.json'), JSON.stringify({ [crypto.createHash('sha256').update(token).digest('hex')]: { email: 'aud@x.co', exp: Date.now() + 60_000 } }));
  assert.equal(await post('/api/admin/access/set-password', { token: 'wrong', password: 'Nueva2026x' }), 400);
  assert.equal(await post('/api/admin/access/set-password', { token, password: 'corta' }), 400);
  assert.equal(await post('/api/admin/access/set-password', { token, password: 'Nueva2026x' }), 200);
  assert.deepEqual(puts, [{ url: 'https://api.colmedikal.com/api/admin/users/aud%40x.co', auth: 'Bearer svc', body: '{"password":"Nueva2026x"}' }]);
  assert.equal(await post('/api/admin/access/set-password', { token, password: 'Otra2026xx' }), 400, 'single use');
  console.log('adminAccess.check OK');
  srv.close();
})().catch(e => { console.error(e); process.exit(1); });
