#!/usr/bin/env node
// Patches the API backend (api.colmedikal.com/backend/dist/server.cjs) so its startup migration adds the
// doctors columns the admin panel sends (`image`, `nivel`). Without them every doctor create/edit fails with
// "Unknown column 'image' in 'field list'", so Directorio Médico changes (incl. nivel) were never saved.
// Usage on the server:  node scripts/patch-api-doctors-columns.cjs ~/api.colmedikal.com/backend/dist/server.cjs
// Safe to re-run. Writes a timestamped backup and restores it if the result doesn't parse.
const fs = require('fs');
const { execFileSync } = require('child_process');

const file = process.argv[2];
if (!file || !fs.existsSync(file)) { console.error('Usage: node patch-api-doctors-columns.cjs <path/to/server.cjs>'); process.exit(1); }
const MARK = '/* colmedikal-patch:doctors-columns-v1 */';
let src = fs.readFileSync(file, 'utf8');
if (src.includes(MARK)) { console.log('Already patched — nothing to do.'); process.exit(0); }

// Last statement of the existing startup role migration
const ANCHOR = `await executeQuery("UPDATE admin_users SET role = 'Auditor' WHERE role = 'Auditor Clínico'");`;
const n = src.split(ANCHOR).length - 1;
if (n !== 1) { console.error(`Anchor found ${n} times (expected 1). File differs from what the patch expects — not modified.`); process.exit(1); }

const ADD = `${ANCHOR}
    ${MARK}
    // Each column on its own: "Duplicate column" just means it already exists.
    for (const ddl of [
      "ALTER TABLE doctors ADD COLUMN image VARCHAR(255) NULL",
      "ALTER TABLE doctors ADD COLUMN nivel TINYINT NOT NULL DEFAULT 1",
    ]) {
      try { await executeQuery(ddl); console.log('[migration] ' + ddl); }
      catch (e) { if (!/Duplicate column/i.test(String(e && e.message))) console.error('[migration] ' + ddl, e && e.message); }
    }`;
src = src.replace(ANCHOR, ADD);

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
console.log(`Patched OK. Backup: ${backup}. Restart the API so the migration runs.`);
