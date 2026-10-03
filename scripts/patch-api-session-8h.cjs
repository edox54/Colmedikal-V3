#!/usr/bin/env node
// Patches the API backend (api.colmedikal.com/backend/dist/server.cjs) so admin panel sessions last 8 hours:
// the JWT issued at login gets expiresIn '8h' (the panel logs out exactly when the token expires).
// Usage on the server:  node scripts/patch-api-session-8h.cjs ~/api.colmedikal.com/backend/dist/server.cjs
// Safe to re-run. Writes a timestamped backup and restores it if the result doesn't parse.
const fs = require('fs');
const { execFileSync } = require('child_process');

const file = process.argv[2];
if (!file || !fs.existsSync(file)) { console.error('Usage: node patch-api-session-8h.cjs <path/to/server.cjs>'); process.exit(1); }
const MARK = '/* colmedikal-patch:session-8h-v1 */';
let src = fs.readFileSync(file, 'utf8');
if (src.includes(MARK)) { console.log('Already patched — nothing to do.'); process.exit(0); }

// jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, <secret>, { expiresIn: <anything> })
const RE = /(jwt\.sign\(\s*\{\s*id: admin\.id,\s*email: admin\.email,\s*role: admin\.role\s*\},\s*[\w.]+,\s*\{\s*expiresIn:\s*)([^}]+?)(\s*\})/g;
const hits = [...src.matchAll(RE)];
if (hits.length !== 1) {
  console.error(`Login token call found ${hits.length} times (expected 1) — not modified. Context:`);
  const i = src.indexOf('role: admin.role');
  console.error(i < 0 ? '(no "role: admin.role" in file)' : src.slice(Math.max(0, i - 200), i + 200));
  process.exit(1);
}
console.log(`Current expiresIn: ${hits[0][2]}`);
src = src.replace(RE, `$1'8h' ${MARK}$3`);

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
console.log(`Patched OK (expiresIn '8h'). Backup: ${backup}. Restart the API; people must log in again to get an 8 h token.`);
