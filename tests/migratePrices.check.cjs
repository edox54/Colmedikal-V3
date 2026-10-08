// Runnable check: `node tests/migratePrices.check.cjs` — scripts/migrate-plan-prices.cjs against a mock API.
const assert = require('assert');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const run = (args, opts) => new Promise((ok, ko) => execFile(process.execPath, args, opts, (e, out, err) => (e ? ko(new Error(err || e.message)) : ok(out))));
const { migrateRecord, fixText } = require('../scripts/migrate-plan-prices.cjs');

assert.deepEqual(migrateRecord('plus', 'Plan Plus 5K — $22/mes', 33), { selectedPlanName: 'Plan Plus 5K — $24/mes', estimatedPrice: 36 });
assert.equal(migrateRecord('plus', 'Plan Plus 5K — $24/mes', 36), null, 'already new');
assert.deepEqual(migrateRecord('inicio', '', 8), { selectedPlanName: '', estimatedPrice: 10 }, 'single person without price in name');
assert.equal(migrateRecord('inicio', '', 15), null, 'ambiguous family quote left alone');
assert.equal(migrateRecord(undefined, 'Plan raro — $22/mes', 22), null);
assert.equal(migrateRecord('proteccion', 'Plan Protección 3K — $120/mes', 120), null, '$120 is not $12');
assert.equal(fixText('Planes desde $8/mes y Plus $22 USD.'), 'Planes desde $10/mes y Plus $24 USD.');
assert.equal(fixText('desde $35 al mes'), 'desde $10 al mes');

const leads = [
  { id: 1, quote_data: JSON.stringify({ basePlanId: 'plus', selectedPlanName: 'Plan Plus 5K — $22/mes', fullName: 'A' }), estimated_price: 41.8 },
  { id: 2, quote_data: { basePlanId: 'inicio', selectedPlanName: 'Plan Inicio 2K — $10/mes' }, estimated_price: 10 },
];
const settings = { meta_home: '{"description":"Planes desde $8/mes"}', other: 'sin precio' };
const puts = [];
const srv = http.createServer((req, res) => {
  let b = ''; req.on('data', c => (b += c)); req.on('end', () => {
    const send = (j) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(j)); };
    if (req.url === '/api/auth/login') return send({ token: 't' });
    if (req.url.startsWith('/api/admin/leads?')) return send({ data: leads });
    if (req.url === '/api/public/settings') return send({ data: settings });
    if (req.url === '/api/public/blog') return send({ data: [{ title: 'Precios', content: 'desde $8' }] });
    if (req.method === 'PUT') { puts.push([req.url, JSON.parse(b)]); return send({ ok: 1 }); }
    res.statusCode = 404; res.end();
  });
}).listen(0, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mig-'));
  fs.mkdirSync(path.join(dir, 'data'));
  fs.writeFileSync(path.join(dir, 'data/lead-plan-overrides.json'), JSON.stringify({ 1: { selectedPlanName: 'Plan Plus 5K — $22/mes', basePlanId: 'plus', estimatedPrice: 22, updatedAt: 1 } }));
  const env = { ...process.env, API_BASE: `http://127.0.0.1:${srv.address().port}`, API_ADMIN_EMAIL: 'svc@x', API_ADMIN_PASSWORD: 'p', DATA_DIR: path.join(dir, 'data') };
  const script = path.join(__dirname, '../scripts/migrate-plan-prices.cjs');
  const dry = await run([script], { env, cwd: dir });
  assert.match(dry, /DRY RUN/); assert.equal(puts.length, 0, 'dry run writes nothing');
  assert.match(dry, /Blog: 1 artículo/);
  await run([script, '--apply'], { env, cwd: dir });
  const leadPut = puts.find(([u]) => u === '/api/admin/leads/1');
  assert.equal(leadPut[1].quote_data.selectedPlanName, 'Plan Plus 5K — $24/mes');
  assert.equal(leadPut[1].quote_data.fullName, 'A', 'rest of quote_data kept');
  assert.equal(leadPut[1].estimated_price, 45.6);
  assert.ok(!puts.some(([u]) => u === '/api/admin/leads/2'), 'already-new lead untouched');
  assert.deepEqual(puts.find(([u]) => u === '/api/admin/settings')[1], { meta_home: '{"description":"Planes desde $10/mes"}' });
  const ov = JSON.parse(fs.readFileSync(path.join(dir, 'data/lead-plan-overrides.json'), 'utf8'))[1];
  assert.equal(ov.selectedPlanName, 'Plan Plus 5K — $24/mes'); assert.equal(ov.estimatedPrice, 24);
  console.log('migratePrices.check OK');
  srv.close();
}).on('error', e => { console.error(e); process.exit(1); });
