// Runnable check: `npx tsx tests/portalPassword.check.ts` (mailer unset → reset link read from the token file is not possible,
// so the test injects a token the same way the server stores it).
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import assert from 'assert';
import { registerPortalPasswordRoutes, passwordProblem } from '../src/server/portalPassword';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-'));
const hash = (p: string, salt = crypto.randomBytes(8).toString('hex')) => ({ hash: crypto.createHash('sha256').update(salt + p).digest('hex'), salt });
let creds: any = { '7': { docNumber: '1712345678', ...hash('Vieja1234'), updatedAt: 1 } };
const app = express();
registerPortalPasswordRoutes(app, {
  dataDir: dir,
  verifyPortalToken: (req, res, next) => (req.headers.authorization === 'Bearer lead7' ? (((req as any).leadId = '7'), next()) : res.status(401).end()),
  loadPortalCreds: () => creds, savePortalCreds: c => { creds = c; },
  hashPortalPassword: p => hash(p), verifyPortalPassword: (p, h, s) => hash(p, s).hash === h,
  getContact: async () => ({ email: 'a@b.co', fullName: 'Ana' }),
  findLegacyAccount: async doc => (doc === '0911111111' ? { leadId: '9', ...hash('Legacy1234') } : null),
});
const srv = app.listen(0);
const base = `http://127.0.0.1:${(srv.address() as any).port}`;
const post = (p: string, body: any, tok?: string) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) }, body: JSON.stringify(body) }).then(async r => ({ s: r.status, b: await r.json() }));

(async () => {
  assert.equal(passwordProblem('corta1'), 'La contraseña debe tener al menos 8 caracteres.');
  assert.ok(passwordProblem('soloLetras'));
  assert.equal(passwordProblem('Nueva2026x'), '');
  // forgot: same answer for existing and unknown cédula (no enumeration)
  const a = await post('/api/portal/forgot', { docNumber: '1712345678' });
  const b = await post('/api/portal/forgot', { docNumber: '0999999999' });
  assert.equal(a.b.message, b.b.message);
  // forgot on a legacy account (hash only in quote_data) adopts it into the local store
  await post('/api/portal/forgot', { docNumber: '0911111111' });
  assert.equal(creds['9']?.docNumber, '0911111111', 'legacy account adopted');
  assert.equal(creds['0999999999'], undefined);
  // change-password
  assert.equal((await post('/api/portal/change-password', { current: 'mal', password: 'Nueva2026x' }, 'lead7')).s, 400);
  assert.equal((await post('/api/portal/change-password', { current: 'Vieja1234', password: 'corta' }, 'lead7')).s, 400);
  assert.equal((await post('/api/portal/change-password', { current: 'Vieja1234', password: 'Nueva2026x' }, 'lead7')).b.success, true);
  assert.equal(hash('Nueva2026x', creds['7'].salt).hash, creds['7'].hash);
  assert.equal(creds['7'].docNumber, '1712345678', 'docNumber preserved');
  // reset with token (inject like /forgot stores it: sha256(token))
  const token = 'tok-abc';
  fs.writeFileSync(path.join(dir, 'portal-reset-tokens.json'), JSON.stringify({ [crypto.createHash('sha256').update(token).digest('hex')]: { leadId: '7', exp: Date.now() + 60_000 } }));
  assert.equal((await post('/api/portal/reset', { token: 'wrong', password: 'Otra2026x' })).s, 400);
  assert.equal((await post('/api/portal/reset', { token, password: 'Otra2026x' })).b.success, true);
  assert.equal((await post('/api/portal/reset', { token, password: 'Otra2026y' })).s, 400, 'token is single-use');
  assert.equal(hash('Otra2026x', creds['7'].salt).hash, creds['7'].hash);
  console.log('portalPassword.check OK');
  srv.close();
})().catch(e => { console.error(e); process.exit(1); });
