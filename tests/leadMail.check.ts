// Runnable check: `npx tsx tests/leadMail.check.ts` — PDF attachment builds in Node.
import assert from 'assert';
import fs from 'fs';
import { quotePdfAttachment, clientMail } from '../src/server/leadMail';

const d = { code: 'COT-123456', fullName: 'Ana Pérez', email: 'a@b.co', phone: '0999999999', docNumber: '1712345678', province: 'Pichincha', members: 2, plan: 'Plan Plus 5K — $22/mes', planId: 'plus', price: 41.8, childrenAges: [10] };
const a = quotePdfAttachment(d)!;
assert.ok(a && a.content.subarray(0, 5).toString() === '%PDF-', 'valid PDF');
assert.equal(quotePdfAttachment({ ...d, plan: '', planId: undefined }), null, 'no plan → no PDF');
assert.equal(quotePdfAttachment({ ...d, planId: undefined })?.filename, a.filename, 'matches plan by name');
assert.ok(clientMail(d).html.includes('Adjuntamos en PDF'));
if (process.argv[2]) fs.writeFileSync(process.argv[2], a.content);
console.log('leadMail.check OK', a.content.length, 'bytes');
