// Runnable check: `npx tsx tests/network.check.ts`
import assert from 'assert';
import { doctorNivel, planCoversSpecialty } from '../src/data/network';
assert.equal(doctorNivel({ name: 'X', nivel: 2 }), 2, 'DB value wins');
assert.equal(doctorNivel({ name: 'X', nivel: '3' }), 3);
assert.equal(doctorNivel({ name: 'CLÍNICA AVANZADA DEL LITORAL (DEMO)' }), 2, 'legacy name fallback');
assert.equal(doctorNivel({ name: 'X', nivel: 1 }), 1);
assert.equal(planCoversSpecialty('inicio', 'Cardiología'), false);
assert.equal(planCoversSpecialty('inicio', 'Ginecología'), true);
assert.equal(planCoversSpecialty('inicio', 'Odontología'), true, 'matches "Odontología (6 proced./año)"');
assert.equal(planCoversSpecialty(undefined, 'Cardiología'), true, 'unknown plan not blocked');
assert.equal(planCoversSpecialty('inicio', 'Dermatología'), true, 'unlisted specialty not blocked');
console.log('network.check OK');
