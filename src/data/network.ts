// Provider network rules shared by Directorio Médico and Agendamiento de Citas.
import { PLANS } from './plans';

// Legacy fallback for providers saved before the API stored `nivel` (see scripts/patch-api-doctors-columns.cjs).
const NIVEL2_NAMES = new Set(['CENTRO MÉDICO ESPECIALIZADO NORTE (DEMO)', 'CLÍNICA AVANZADA DEL LITORAL (DEMO)']);
const NIVEL3_NAMES = new Set(['HOSPITAL DE ESPECIALIDADES COLMEDIKAL (DEMO)', 'CLÍNICA INTERNACIONAL COLMEDIKAL (DEMO)']);

/** Network level of a provider: the value set in Directorio Médico, else the legacy name list, else 1. */
export function doctorNivel(d: { name: string; nivel?: number | string | null }): number {
  const n = Number(d.nivel);
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
