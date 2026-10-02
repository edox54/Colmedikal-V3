#!/usr/bin/env node
// Patches the hand-written API backend (api.colmedikal.com/backend/dist/server.cjs) so that:
//   - only an active Super Admin can create / edit / delete admin users (it only required a valid JWT),
//   - PUT /api/admin/users/:email accepts { password } (bcrypt) and validates { role },
//   - nobody can demote, suspend or delete themselves (avoids locking the panel out).
// Usage on the server:  node scripts/patch-api-admin-users.cjs ~/api.colmedikal.com/backend/dist/server.cjs
// Safe to re-run: exits if already patched. Writes a timestamped backup and restores it if the result doesn't parse.
const fs = require('fs');
const { execFileSync } = require('child_process');

const file = process.argv[2];
if (!file || !fs.existsSync(file)) { console.error('Usage: node patch-api-admin-users.cjs <path/to/server.cjs>'); process.exit(1); }
const MARK = '/* colmedikal-patch:admin-users-v1 */';
let src = fs.readFileSync(file, 'utf8');
if (src.includes(MARK)) { console.log('Already patched — nothing to do.'); process.exit(0); }

const GUARD_ANCHOR = '// POST /api/admin/users\n';
const ROLE_ANCHOR = "if (body.role) { sets.push('role = ?'); vals.push(body.role); }";
const DELETE_ANCHOR = "if (method === 'DELETE') {\n        await executeQuery('DELETE FROM admin_users WHERE email = ?', [targetEmail]);";
for (const [name, a] of [['guard', GUARD_ANCHOR], ['role', ROLE_ANCHOR], ['delete', DELETE_ANCHOR]]) {
  const n = src.split(a).length - 1;
  if (n !== 1) { console.error(`Anchor "${name}" found ${n} times (expected 1). File differs from what the patch expects — not modified.`); process.exit(1); }
}

const GUARD = `${MARK}
    // Only an active Super Admin (checked in the DB, not just the token) may change admin users.
    let adminCaller = null;
    if (pathname.startsWith('/api/admin/users') && method !== 'GET') {
      let claims = null;
      try { claims = verifyToken(String(req.headers.authorization || '').split(' ')[1] || ''); } catch (e) { claims = null; }
      const rows = claims && claims.email ? await executeQuery('SELECT email, role, active FROM admin_users WHERE email = ? LIMIT 1', [claims.email]) : [];
      adminCaller = rows[0] || null;
      if (!adminCaller || adminCaller.role !== 'Super Admin' || !adminCaller.active) {
        sendResponse(res, 403, { error: 'Only an active Super Admin can manage admin users' });
        return;
      }
    }

    `;

const PASSWORD_AND_ROLE = `if (body.role !== undefined && !['Super Admin', 'Mid Admin', 'Equipo Comercial', 'Auditor'].includes(body.role)) { sendResponse(res, 400, { error: 'Invalid role' }); return; }
        if (adminCaller && targetEmail === adminCaller.email && ((body.role && body.role !== 'Super Admin') || body.active === false)) { sendResponse(res, 400, { error: 'You cannot demote or suspend yourself' }); return; }
        ${ROLE_ANCHOR}
        if (body.password !== undefined) {
          if (typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 200) { sendResponse(res, 400, { error: 'Password must be 8-200 characters' }); return; }
          sets.push('password_hash = ?'); vals.push(await bcrypt.hash(body.password, 12));
        }`;

const DELETE_GUARD = `if (method === 'DELETE') {
        if (adminCaller && targetEmail === adminCaller.email) { sendResponse(res, 400, { error: 'You cannot delete yourself' }); return; }
        await executeQuery('DELETE FROM admin_users WHERE email = ?', [targetEmail]);`;

src = src.replace(GUARD_ANCHOR, GUARD + GUARD_ANCHOR).replace(ROLE_ANCHOR, PASSWORD_AND_ROLE).replace(DELETE_ANCHOR, DELETE_GUARD);

const backup = `${file}.bak-${new Date().toISOString().replace(/[:.]/g, '-')}`;
fs.copyFileSync(file, backup);
fs.writeFileSync(file, src);
try {
  execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
} catch (e) {
  fs.copyFileSync(backup, file);
  console.error('Patched file does not parse — original restored.\n' + String(e.stderr || e.message));
  process.exit(1);
}
console.log(`Patched OK. Backup: ${backup}`);
