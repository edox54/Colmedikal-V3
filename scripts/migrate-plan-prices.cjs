#!/usr/bin/env node
// Plan price change (2026-10): Inicio 2K $8→$10, Protección 3K $12→$14, Plus 5K $22→$24.
// Updates what the code change can't reach:
//   1. leads in api.colmedikal.com: quote_data.selectedPlanName ("… — $22/mes") + estimated_price
//   2. data/lead-plan-overrides.json on this server (same two fields)
//   3. settings (SEO texts, meta overrides) with "$8/mes", "desde $8", "$8 USD"…
//   4. blog posts stored in the API: only REPORTED (edit them in the SEO panel)
// Usage on the server (from ~/colmedikal.com):
//   node scripts/migrate-plan-prices.cjs            # dry run: shows what would change
//   node scripts/migrate-plan-prices.cjs --apply    # writes
// Re-runnable: rows already showing the new price are skipped.
// Uses the native https module (fetch/undici dies under the LVE memory limit on this host).
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const APPLY = process.argv.includes('--apply');
const PRICES = { inicio: [8, 10], proteccion: [12, 14], plus: [22, 24] };
const NAMES = { inicio: /inicio/i, proteccion: /protecci[oó]n/i, plus: /plus/i };

// .env of this app (no dotenv dependency needed for a one-off script)
try {
  for (const line of fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch { /* env may come from the shell */ }
const API = process.env.API_BASE || 'https://api.colmedikal.com';
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

function req(method, url, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'http:' ? http : https;
    const data = body === undefined ? undefined : JSON.stringify(body);
    const r = lib.request(u, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) } }, res => {
      let s = ''; res.on('data', c => (s += c));
      res.on('end', () => {
        let j = null; try { j = s ? JSON.parse(s) : null; } catch { /* non-JSON */ }
        res.statusCode >= 200 && res.statusCode < 300 ? resolve(j) : reject(Object.assign(new Error(`HTTP ${res.statusCode} ${method} ${u.pathname}`), { json: j }));
      });
    });
    r.on('error', reject);
    r.setTimeout(15000, () => r.destroy(new Error('timeout')));
    if (data) r.write(data);
    r.end();
  });
}

const planOf = (qd) => (PRICES[qd.basePlanId] ? qd.basePlanId : Object.keys(NAMES).find(id => NAMES[id].test(qd.selectedPlanName || '')));
/** New {selectedPlanName, estimatedPrice} for one record, or null when nothing to change. */
function migrateRecord(planId, name, estimated) {
  if (!planId) return null;
  const [oldP, newP] = PRICES[planId];
  const oldInName = new RegExp(`\\$\\s?${oldP}(?![0-9])`).test(name || '');
  // ponytail: also catches a single-person quote saved without the price in its name (estimated == old base);
  //           family quotes without the price in the name can't be told apart from new ones and are left alone.
  const est = Number(estimated);
  const estIsOld = oldInName || (Number.isFinite(est) && est === oldP);
  if (!oldInName && !estIsOld) return null;
  return {
    selectedPlanName: oldInName ? name.replace(new RegExp(`\\$\\s?${oldP}(?![0-9])`), `$${newP}`) : name,
    estimatedPrice: estIsOld && est > 0 ? Math.round(est * (newP / oldP) * 100) / 100 : estimated,
  };
}

// Free-text replacements (settings): only unambiguous price phrases
const TEXT_RULES = [
  [/(desde|Desde)\s*\$\s?(8|35|45)(?![0-9])/g, '$1 $$10'],
  [/\$\s?8(\s?USD|\/mes| al mes)/g, '$$10$1'],
  [/\$\s?12(\s?USD|\/mes| al mes)/g, '$$14$1'],
  [/\$\s?22(\s?USD|\/mes| al mes)/g, '$$24$1'],
];
const fixText = (s) => TEXT_RULES.reduce((acc, [re, rep]) => acc.replace(re, rep), s);
const OLD_PRICE_HINT = /\$\s?(8|12|22|35|45)(?![0-9])/;

async function main() {
  console.log(`${APPLY ? 'APPLY' : 'DRY RUN (add --apply to write)'} · API ${API} · data ${DATA_DIR}\n`);
  const email = process.env.API_ADMIN_EMAIL, password = process.env.API_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('API_ADMIN_EMAIL / API_ADMIN_PASSWORD missing (.env)');
  const { token } = await req('POST', `${API}/api/auth/login`, { body: { email, password } });
  if (!token) throw new Error('login returned no token');

  // 1) leads
  const leads = (await req('GET', `${API}/api/admin/leads?limit=2000`, { token }))?.data || [];
  let changed = 0, failed = 0;
  for (const l of leads) {
    let qd = l.quote_data ?? l.quoteData;
    if (typeof qd === 'string') { try { qd = JSON.parse(qd); } catch { qd = {}; } }
    qd = qd || {};
    const m = migrateRecord(planOf(qd), qd.selectedPlanName, l.estimated_price);
    if (!m) continue;
    changed++;
    console.log(`lead ${l.id}: "${qd.selectedPlanName || ''}" $${l.estimated_price} → "${m.selectedPlanName || ''}" $${m.estimatedPrice}`);
    if (APPLY) {
      try { await req('PUT', `${API}/api/admin/leads/${encodeURIComponent(l.id)}`, { token, body: { quote_data: { ...qd, selectedPlanName: m.selectedPlanName }, estimated_price: m.estimatedPrice } }); }
      catch (e) { failed++; console.error(`  ✗ ${e.message}`); }
    }
  }
  console.log(`\nLeads: ${changed} de ${leads.length} con precio anterior${APPLY ? `, ${failed} fallidos` : ''}.\n`);

  // 2) local plan overrides
  const file = path.join(DATA_DIR, 'lead-plan-overrides.json');
  if (fs.existsSync(file)) {
    const store = JSON.parse(fs.readFileSync(file, 'utf8'));
    let n = 0;
    for (const [id, e] of Object.entries(store)) {
      const m = migrateRecord(planOf(e), e.selectedPlanName, e.estimatedPrice);
      if (!m) continue;
      n++;
      console.log(`override ${id}: "${e.selectedPlanName}" $${e.estimatedPrice} → "${m.selectedPlanName}" $${m.estimatedPrice}`);
      store[id] = { ...e, ...m, updatedAt: Date.now() };
    }
    if (APPLY && n) { fs.copyFileSync(file, `${file}.bak-${Date.now()}`); fs.writeFileSync(file, JSON.stringify(store)); }
    console.log(`\nOverrides locales: ${n}.\n`);
  }

  // 3) settings
  const settings = (await req('GET', `${API}/api/public/settings`))?.data || {};
  const patch = {};
  for (const [k, v] of Object.entries(settings)) {
    if (typeof v !== 'string' || !OLD_PRICE_HINT.test(v)) continue;
    const fixed = fixText(v);
    if (fixed !== v) { patch[k] = fixed; console.log(`setting ${k}: actualizado`); }
    if (OLD_PRICE_HINT.test(fixed)) console.log(`setting ${k}: ⚠ queda un precio para revisar a mano → ${fixed.match(OLD_PRICE_HINT)[0]}`);
  }
  if (APPLY && Object.keys(patch).length) await req('PUT', `${API}/api/admin/settings`, { token, body: patch });
  console.log(`\nAjustes: ${Object.keys(patch).length} actualizados.\n`);

  // 4) blog (report only)
  const posts = (await req('GET', `${API}/api/public/blog`).catch(() => null))?.data || [];
  const withPrice = posts.filter(p => OLD_PRICE_HINT.test(JSON.stringify(p)));
  for (const p of withPrice) console.log(`blog "${p.title || p.slug || p.id}": menciona un precio anterior → editar en el panel SEO`);
  console.log(`Blog: ${withPrice.length} artículo(s) para revisar.`);
}

if (require.main === module) main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
module.exports = { migrateRecord, fixText };
