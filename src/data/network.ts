// Provider network rules shared by Directorio Médico and Agendamiento de Citas.
import { PLANS } from './plans';

// Legacy fallback for providers saved before the API stored `nivel` (see scripts/patch-api-doctors-columns.cjs).
const NIVEL2_NAMES = new Set(['CENTRO MÉDICO ESPECIALIZADO NORTE (DEMO)', 'CLÍNICA AVANZADA DEL LITORAL (DEMO)']);
const NIVEL3_NAMES = new Set(['HOSPITAL DE ESPECIALIDADES COLMEDIKAL (DEMO)', 'CLÍNICA INTERNACIONAL COLMEDIKAL (DEMO)']);

// ponytail: the external API drops `nivel` on save/read, so the admin also stores it in the
// `doctor_niveles` setting ({ [id | "name:<NAME>"]: 1|2|3 }). Drop this once the API returns `nivel`.
export function nivelOverrides(settings?: Record<string, string>): Record<string, number> {
  try { return JSON.parse(settings?.doctor_niveles || '{}'); } catch { return {}; }
}

/** Network level of a provider: the value set in Directorio Médico, else the legacy name list, else 1. */
export function doctorNivel(d: { id?: string; name: string; nivel?: number | string | null }, settings?: Record<string, string>): number {
  const o = nivelOverrides(settings);
  const n = Number(o[d.id || ''] ?? o['name:' + d.name] ?? d.nivel);
  if (n === 2 || n === 3) return n;
  return NIVEL3_NAMES.has(d.name) ? 3 : NIVEL2_NAMES.has(d.name) ? 2 : 1;
}

/** Highest network level each plan reaches (every current plan is Nivel 1). */
export const PLAN_NIVEL: Record<string, number> = { inicio: 1, proteccion: 1, plus: 1 };
export const planNivel = (planId?: string) => PLAN_NIVEL[planId || ''] ?? 1;

const base = (s: string) => s.split('(')[0].trim().toLowerCase();
/** false only when the client's plan explicitly excludes the specialty (e.g. Plan Inicio → Cardiología).
 *  Unknown plans or specialties not listed in the plan sheet stay bookable. */
export function planCoversSpecialty(planId: string | undefined, specialty: string): boolean {
  const plan = PLANS.find(p => p.id === planId);
  if (!plan) return true;
  const hit = Object.entries(plan.especialidades || {}).find(([k]) => base(k) === base(specialty));
  return hit ? hit[1] !== false : true;
}
