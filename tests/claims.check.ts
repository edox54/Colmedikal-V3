// Runnable check for src/server/claims.ts: `npx tsx tests/claims.check.ts`
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import assert from 'assert';
import { registerClaimRoutes } from '../src/server/claims';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'claims-'));
const app = express();
registerClaimRoutes(app, {
  dataDir: dir,
  verifyPortalToken: (req, res, next) => { const t = req.headers.authorization?.split(' ')[1]; if (!t?.startsWith('lead')) return res.status(401).end(); (req as any).leadId = t.slice(4); next(); },
  requireAdmin: (req, res, next) => (req.headers.authorization === 'Bearer admin' ? next() : res.status(403).end()),
});
const srv = app.listen(0);
const base = `http://127.0.0.1:${(srv.address() as any).port}`;
const j = (p: string, tok: string, body?: any, method = body ? 'POST' : 'GET') =>
  fetch(base + p, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` }, body: body && JSON.stringify(body) }).then(async r => ({ s: r.status, b: await r.json().catch(() => null) }));
const up = (id: string, tok: string, kind: string, bytes: Buffer, name = 'doc.pdf') =>
  fetch(`${base}/api/portal/claims/${id}/files`, { method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/octet-stream', 'X-File-Kind': kind, 'X-File-Name': encodeURIComponent(name) }, body: bytes }).then(async r => ({ s: r.status, b: await r.json() }));
const PDF = Buffer.from('%PDF-1.4\n%fake\n');

(async () => {
  const form = { tipoAtencion: 'Ambulatoria', ciudad: 'Quito', titular: 'Ana', cedula: '1712345678', correo: 'a@b.co', celular: '0999', paciente: 'Ana', parentesco: 'Titular', evil: 'x' };
  const d = (await j('/api/portal/claims', 'lead7', { type: 'reembolso', form, invoices: [{ numero: '001-001', emisor: 'Clínica', valor: '45,50', fecha: '2026-09-01' }] })).b.data;
  assert.equal(d.id, 'RB-000001'); assert.equal(d.status, 'Borrador'); assert.equal(d.totalRequested, 45.5); assert.equal(d.form.evil, undefined);
  assert.equal((await up(d.id, 'lead7', 'factura', Buffer.from('<html>'))).s, 415, 'rejects non-document');
  assert.equal((await up(d.id, 'lead7', 'bogus', PDF)).s, 400, 'rejects unknown kind');
  assert.equal((await up(d.id, 'lead8', 'factura', PDF)).s, 404, 'other client cannot touch it');
  const miss = await j(`/api/portal/claims/${d.id}/submit`, 'lead7', {});
  assert.equal(miss.s, 400); assert.ok(miss.b.missing.some((m: string) => m.includes('Formulario')));
  const f1 = (await up(d.id, 'lead7', 'formulario', PDF, 'formulario firmado.pdf')).b.data;
  await up(d.id, 'lead7', 'factura', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2]), 'factura.jpg');
  await j('/api/portal/claims', 'lead7', { id: d.id, type: 'reembolso', form, invoices: [{ numero: '001-001', valor: 45.5 }], declarationAccepted: true });
  const sub = await j(`/api/portal/claims/${d.id}/submit`, 'lead7', {});
  assert.equal(sub.b.data.status, 'Recibida');
  assert.equal((await j(`/api/portal/claims/${d.id}/files/${f1.id}`, 'lead7', undefined, 'DELETE')).s, 409, 'no deleting after submit');
  const file = await fetch(`${base}/api/portal/claims/${d.id}/files/${f1.id}`, { headers: { Authorization: 'Bearer lead7' } });
  assert.equal(file.headers.get('content-type'), 'application/pdf');
  assert.equal((await fetch(`${base}/api/admin/claims/${d.id}/files/${f1.id}`, { headers: { Authorization: 'Bearer lead7' } })).status, 403);
  assert.equal((await j(`/api/admin/claims/${d.id}`, 'admin', { status: 'Rechazada' })).s, 400, 'rejection needs reason');
  assert.equal((await j(`/api/admin/claims/${d.id}`, 'admin', { status: 'Pagada' })).s, 400, 'pay only after approval');
  await j(`/api/admin/claims/${d.id}`, 'admin', { status: 'Documentos pendientes', comment: 'Falta receta', by: 'Aud' });
  await up(d.id, 'lead7', 'receta', PDF);
  assert.equal((await j(`/api/portal/claims/${d.id}/submit`, 'lead7', { comment: 'listo' })).b.data.status, 'En revisión');
  const ok = await j(`/api/admin/claims/${d.id}`, 'admin', { status: 'Aprobada', approvedAmount: 40.95 });
  assert.equal(ok.b.data.approvedAmount, 40.95);
  const list = (await j('/api/admin/claims', 'admin')).b.data;
  assert.equal(list.length, 1); assert.equal(list[0].files.length, 3);
  assert.equal((await j('/api/portal/claims', 'lead8')).b.data.length, 0, 'isolation');
  const pa = (await j('/api/portal/claims', 'lead7', { type: 'preautorizacion', form: { honorariosCirujano: '800', costoClinica: '1200.5' } })).b.data;
  assert.equal(pa.id, 'PA-000001'); assert.equal(pa.totalRequested, 2000.5);
  console.log('claims.check OK');
  srv.close();
})().catch(e => { console.error(e); process.exit(1); });
