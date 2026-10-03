// Runnable check: `node tests/apiAdminPatch.check.cjs` — applies scripts/patch-api-admin-users.cjs to a
// mock of the API backend's admin-users handler (same anchors as production) and exercises it.
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'apiadm-')), 'server.cjs');
fs.copyFileSync(path.join(__dirname, 'fixtures/api-server.mock.cjs'), tmp);
const patch = path.join(__dirname, '../scripts/patch-api-admin-users.cjs');
execFileSync(process.execPath, [patch, tmp]);
assert.match(execFileSync(process.execPath, [patch, tmp]).toString(), /Already patched/);

const { handleRequest, db } = require(tmp);
const call = async (who, method, url, body) => {
  const res = {};
  await handleRequest({ url, method, headers: { authorization: 'Bearer ' + JSON.stringify({ email: who }) } }, res, body);
  return res.code;
};
(async () => {
  assert.equal(await call('aud@x.co', 'PUT', '/api/admin/users/boss%40x.co', { password: 'Hacked123' }), 403, 'non-Super Admin blocked');
  assert.equal(await call('aud@x.co', 'DELETE', '/api/admin/users/boss%40x.co'), 403);
  assert.equal(await call('aud@x.co', 'GET', '/api/admin/users'), 200, 'listing unchanged');
  assert.equal(await call('boss@x.co', 'PUT', '/api/admin/users/aud%40x.co', { password: 'corta' }), 400);
  assert.equal(await call('boss@x.co', 'PUT', '/api/admin/users/aud%40x.co', { password: 'Nueva2026x' }), 200);
  assert.equal(db['aud@x.co'].password_hash, 'bc:Nueva2026x');
  assert.equal(await call('boss@x.co', 'PUT', '/api/admin/users/aud%40x.co', { role: 'Dios' }), 400);
  assert.equal(await call('boss@x.co', 'PUT', '/api/admin/users/boss%40x.co', { role: 'Auditor' }), 400, 'no self-demote');
  assert.equal(await call('boss@x.co', 'DELETE', '/api/admin/users/boss%40x.co'), 400, 'no self-delete');
  db['boss@x.co'].active = 0;
  assert.equal(await call('boss@x.co', 'PUT', '/api/admin/users/aud%40x.co', { role: 'Mid Admin' }), 403, 'suspended Super Admin blocked');
  // doctors columns migration (separate patch)
  const docPatch = path.join(__dirname, '../scripts/patch-api-doctors-columns.cjs');
  delete require.cache[require.resolve(tmp)]; delete require.cache[fs.realpathSync(tmp)];
  execFileSync(process.execPath, [docPatch, tmp]);
  assert.match(execFileSync(process.execPath, [docPatch, tmp]).toString(), /Already patched/);
  const m2 = require(tmp);
  await m2.initializePool();
  assert.ok(m2.cols.has('image') && m2.cols.has('nivel'), 'columns added');
  await m2.initializePool(); // second boot: duplicate columns are ignored
  assert.equal(m2.ddlLog.filter(s => s.includes('ADD COLUMN image')).length, 2);
  // 8 h admin sessions (separate patch)
  const sesPatch = path.join(__dirname, '../scripts/patch-api-session-8h.cjs');
  assert.equal(require(tmp).generateToken({ id: 1, email: 'a', role: 'r' }), 'tok:1h');
  execFileSync(process.execPath, [sesPatch, tmp]);
  assert.match(execFileSync(process.execPath, [sesPatch, tmp]).toString(), /Already patched/);
  delete require.cache[require.resolve(tmp)]; delete require.cache[fs.realpathSync(tmp)];
  assert.equal(require(tmp).generateToken({ id: 1, email: 'a', role: 'r' }), 'tok:8h');
  console.log('apiAdminPatch.check OK');
})().catch(e => { console.error(e); process.exit(1); });
