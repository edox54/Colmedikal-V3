// Schema of the two self-service requests, transcribed from the official forms:
//   - COLMEDIKAL_Formulario_Reembolso (Solicitud de reembolso de gastos médicos)
//   - Colmedikal_Solicitud_Preautorizacion_Hospitalaria (Pre-autorización quirúrgica y hospitalaria)
// Single source for the client portal form, server validation and the admin detail view.

export type ClaimType = 'reembolso' | 'preautorizacion';

export const CLAIM_STATUSES = {
  reembolso: ['Recibida', 'En revisión', 'Documentos pendientes', 'Aprobada', 'Pagada', 'Rechazada'],
  preautorizacion: ['Recibida', 'En revisión', 'Documentos pendientes', 'Aprobada', 'Rechazada'],
} as const;
export type ClaimStatus = 'Borrador' | (typeof CLAIM_STATUSES)[ClaimType][number];
/** Statuses where the client may still add documents. */
export const CLIENT_EDITABLE: ClaimStatus[] = ['Borrador', 'Recibida', 'En revisión', 'Documentos pendientes'];
export const FINAL_STATUSES: ClaimStatus[] = ['Pagada', 'Rechazada'];

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'datetime' | 'textarea' | 'select' | 'email' | 'tel' | 'number' | 'money';
  options?: string[];
  required?: boolean;
  /** Medical section: filled from the doctor's report; optional because the signed form is uploaded too. */
  doctor?: boolean;
  half?: boolean;
  showIf?: { key: string; equals: string };
}
export interface SectionDef { id: string; title: string; hint?: string; fields: FieldDef[] }

const PARENTESCO = ['Titular', 'Cónyuge', 'Hijo/a', 'Padre/Madre', 'Otro'];
const CAUSA_REEMBOLSO = ['Enfermedad', 'Accidente', 'Congénita', 'Embarazo', 'Otros'];
const CAUSA_PREAUT = ['Enfermedad', 'Accidente', 'Congénita', 'Embarazo', 'Otros'];

export const REEMBOLSO_SECTIONS: SectionDef[] = [
  {
    id: 'general', title: 'Datos de la solicitud', fields: [
      { key: 'tipoAtencion', label: 'Tipo de atención', type: 'select', options: ['Ambulatoria', 'Hospitalaria'], required: true, half: true },
      { key: 'ciudad', label: 'Ciudad', required: true, half: true },
      { key: 'broker', label: 'Bróker / Asesor', half: true },
    ],
  },
  {
    id: 'afiliado', title: '1. Información del afiliado', fields: [
      { key: 'titular', label: 'Titular', required: true, half: true },
      { key: 'cedula', label: 'Cédula', required: true, half: true },
      { key: 'direccion', label: 'Dirección', half: true },
      { key: 'correo', label: 'Correo', type: 'email', required: true, half: true },
      { key: 'telefonoOficina', label: 'Teléfono oficina', type: 'tel', half: true },
      { key: 'celular', label: 'Celular', type: 'tel', required: true, half: true },
      { key: 'paciente', label: 'Paciente', required: true, half: true },
      { key: 'parentesco', label: 'Parentesco', type: 'select', options: PARENTESCO, required: true, half: true },
      { key: 'edad', label: 'Edad del paciente', type: 'number', half: true },
    ],
  },
  {
    id: 'profesional', title: '2. Datos del profesional', hint: 'Exclusivo del médico. Puedes copiarlos del formulario firmado por tu médico; si no los tienes, basta con subir el formulario firmado.', fields: [
      { key: 'medico', label: 'Nombre del médico', doctor: true, half: true },
      { key: 'especialidad', label: 'Especialidad', doctor: true, half: true },
      { key: 'telefonoMedico', label: 'Teléfono del médico', type: 'tel', doctor: true, half: true },
      { key: 'inicioEnfermedad', label: 'Inicio de enfermedad', type: 'date', doctor: true, half: true },
      { key: 'motivo', label: 'Motivo de consulta', type: 'textarea', doctor: true },
      { key: 'tratamiento', label: 'Tratamiento y/o procedimientos recibidos', type: 'textarea', doctor: true },
      { key: 'examenes', label: 'Exámenes practicados', type: 'textarea', doctor: true },
      { key: 'causa', label: 'La enfermedad actual es causa de', type: 'select', options: CAUSA_REEMBOLSO, doctor: true, half: true },
      { key: 'causaOtros', label: 'Especifique', doctor: true, half: true, showIf: { key: 'causa', equals: 'Otros' } },
      { key: 'fum', label: 'F.U.M. (fecha de última menstruación)', type: 'date', doctor: true, half: true, showIf: { key: 'causa', equals: 'Embarazo' } },
      { key: 'diagnostico', label: 'Diagnóstico definitivo', type: 'textarea', doctor: true },
      { key: 'cie10', label: 'CIE-10', doctor: true, half: true },
      { key: 'procedimiento', label: 'Procedimiento realizado', doctor: true, half: true },
      { key: 'codigoAccess', label: 'Código de registro en Access', doctor: true, half: true },
    ],
  },
];

export const PREAUT_SECTIONS: SectionDef[] = [
  {
    id: 'afiliado', title: 'Datos generales del afiliado', fields: [
      { key: 'ciudad', label: 'Ciudad', required: true, half: true },
      { key: 'fechaAtencion', label: 'Fecha de atención', type: 'date', half: true },
      { key: 'titular', label: 'Nombre del titular', required: true, half: true },
      { key: 'referencia', label: 'N.º de solicitud / referencia', half: true },
      { key: 'paciente', label: 'Nombre del paciente', required: true, half: true },
      { key: 'contrato', label: 'Nombre / N.º del contrato', half: true },
      { key: 'cedula', label: 'Cédula del titular', required: true, half: true },
      { key: 'celular', label: 'N.º de celular', type: 'tel', required: true, half: true },
      { key: 'parentesco', label: 'Parentesco', type: 'select', options: PARENTESCO, required: true, half: true },
      { key: 'edad', label: 'Edad del paciente', type: 'number', half: true },
      { key: 'correo', label: 'E-mail', type: 'email', required: true, half: true },
    ],
  },
  {
    id: 'medico', title: 'Antecedentes médico-quirúrgicos', hint: 'Exclusivo del médico. Los datos marcados con * son necesarios para programar la preautorización.', fields: [
      { key: 'hospital', label: 'Hospital / clínica de atención', required: true, half: true },
      { key: 'fechaIngreso', label: 'Fecha probable de ingreso', type: 'date', required: true, half: true },
      { key: 'medico', label: 'Nombre del médico', required: true, half: true },
      { key: 'especialidad', label: 'Especialidad', doctor: true, half: true },
      { key: 'telefonoMedico', label: 'Teléfono del médico', type: 'tel', doctor: true, half: true },
      { key: 'inicioEnfermedad', label: 'Inicio de la enfermedad', type: 'date', doctor: true, half: true },
      { key: 'motivo', label: 'Motivo de la consulta', type: 'textarea', doctor: true },
      { key: 'evolucion', label: 'Evolución de la enfermedad', type: 'textarea', doctor: true },
      { key: 'tratamiento', label: 'Tratamiento y/o procedimiento recibido (cuánto tiempo)', type: 'textarea', doctor: true },
      { key: 'diagnostico', label: 'Diagnóstico definitivo', type: 'textarea', required: true },
      { key: 'cie10', label: 'Código CIE-10', doctor: true, half: true },
      { key: 'fechaDiagnostico', label: 'Fecha de diagnóstico', type: 'date', doctor: true, half: true },
      { key: 'causa', label: 'La enfermedad actual es', type: 'select', options: CAUSA_PREAUT, doctor: true, half: true },
      { key: 'fum', label: 'F.U.M.', type: 'date', doctor: true, half: true, showIf: { key: 'causa', equals: 'Embarazo' } },
      { key: 'descripcionAccidente', label: 'En caso de accidente: cómo sucedió, fecha, lugar y hora', type: 'textarea', doctor: true, showIf: { key: 'causa', equals: 'Accidente' } },
    ],
  },
  {
    id: 'presupuesto', title: 'Presupuesto', hint: 'Valores en USD según la proforma del médico / clínica.', fields: [
      { key: 'honorariosCirujano', label: 'Honorarios de cirujano', type: 'money', half: true },
      { key: 'codigoCirujano', label: 'Código quirúrgico', half: true },
      { key: 'honorariosAyudante', label: 'Honorarios de ayudante', type: 'money', half: true },
      { key: 'codigoAyudante', label: 'Código quirúrgico', half: true },
      { key: 'honorariosAnestesiologo', label: 'Honorarios de anestesiólogo', type: 'money', half: true },
      { key: 'codigoAnestesiologo', label: 'Código quirúrgico', half: true },
      { key: 'otrosMedicos', label: 'Otros médicos', type: 'money', half: true },
      { key: 'codigoOtros', label: 'Código quirúrgico', half: true },
      { key: 'costoClinica', label: 'Costo clínica', type: 'money', half: true },
    ],
  },
];

export const BUDGET_KEYS = ['honorariosCirujano', 'honorariosAyudante', 'honorariosAnestesiologo', 'otrosMedicos', 'costoClinica'];

export const SECTIONS: Record<ClaimType, SectionDef[]> = { reembolso: REEMBOLSO_SECTIONS, preautorizacion: PREAUT_SECTIONS };

export interface FileKindDef { kind: string; label: string; required?: boolean; hint?: string }
export const FILE_KINDS: Record<ClaimType, FileKindDef[]> = {
  reembolso: [
    { kind: 'formulario', label: 'Formulario de reembolso firmado por el médico', required: true, hint: 'Descarga el formulario, llévalo a tu médico y sube una foto o escaneo.' },
    { kind: 'factura', label: 'Facturas (SRI)', required: true },
    { kind: 'receta', label: 'Recetas / prescripciones' },
    { kind: 'examenes', label: 'Resultados de exámenes' },
    { kind: 'otro', label: 'Otros documentos' },
  ],
  preautorizacion: [
    { kind: 'formulario', label: 'Formulario de preautorización firmado y sellado por el médico', required: true, hint: 'Descarga el formulario, llévalo a tu médico y sube una foto o escaneo.' },
    { kind: 'informe', label: 'Informe médico / justificación clínica', required: true },
    { kind: 'laboratorio', label: 'Resultados de laboratorio' },
    { kind: 'imagenes', label: 'Imágenes: Rayos X / TC / RM / Ecografía' },
    { kind: 'historia', label: 'Historia clínica completa' },
    { kind: 'presupuesto', label: 'Proforma / presupuesto de la clínica' },
    { kind: 'otro', label: 'Otros documentos' },
  ],
};

export const BLANK_FORM_URL: Record<ClaimType, string> = {
  reembolso: '/formularios/Colmedikal_Formulario_Reembolso.pdf',
  preautorizacion: '/formularios/Colmedikal_Solicitud_Preautorizacion.pdf',
};
export const CLAIM_LABEL: Record<ClaimType, string> = { reembolso: 'Reembolso de gastos médicos', preautorizacion: 'Preautorización quirúrgica y hospitalaria' };

// Legal text verbatim from the official forms (section 4 / declaración juramentada)
export const DECLARATION: Record<ClaimType, string> = {
  reembolso: 'Autorizo a todos los médicos y/o personas que me atendieron, y/o a todas las clínicas o instituciones prestadoras de servicios de salud para que suministren a COLMEDIKAL MEDICINA PREPAGADA S.A. cualquier información médica, incluyendo copias exactas de historia clínica y/o ficha médica, exámenes de laboratorio y rayos X y cualquier otro examen de diagnóstico correspondiente a esta atención médica, a fin de evaluar y procesar la presente solicitud de reembolso.',
  preautorizacion: 'DECLARO BAJO JURAMENTO que toda la información consignada en la Declaración de Salud es exacta y verídica, reconociendo que cualquier omisión, falsedad u ocultamiento anulará la cobertura y facultará la terminación unilateral del contrato por parte de Colmedikal S.A. sin derecho a devolución de valores pagados. COMPRENDO QUE LA COBERTURA APLICA ÚNICAMENTE para los servicios explícitamente detallados en el plan contratado y que las enfermedades preexistentes y congénitas tendrán cobertura únicamente tras veinticuatro meses de contratación ininterrumpida. Acepto cumplir con los tiempos de carencia establecidos además del pago de los deducibles o copagos aplicables. AUTORIZO DE FORMA EXPRESA E INFORMADA EL TRATAMIENTO, VERIFICACIÓN Y REPORTE DE MIS DATOS PERSONALES a organismos competentes, así como su uso para notificaciones, cobranza y facturación, asumiendo la responsabilidad exclusiva de mantener mi información debidamente actualizada de forma anual. ACEPTO QUE EL PLAZO IMPRORROGABLE PARA PRESENTAR SOLICITUDES DE REEMBOLSO con sus respectivos documentos de soporte es de noventa días desde la fecha del gasto, y que el derecho al cobro de valores aprobados caducará definitivamente a los ciento ochenta días. Finalmente, RECONOZCO LA FACULTAD DE LA COMPAÑÍA PARA MODIFICAR LA RED DE PRESTADORES MÉDICOS sin lugar a reclamos y acepto que cualquier solicitud de terminación anticipada tras haber utilizado la cobertura hospitalaria quedará sujeta al análisis previo de la empresa.',
};

export interface InvoiceRow { fecha: string; numero: string; emisor: string; valor: number }
export interface ClaimFile { id: string; kind: string; name: string; mime: string; size: number; uploadedAt: string; by: 'cliente' | 'admin' }
export interface ClaimEvent { at: string; by: string; action: string; status?: ClaimStatus; comment?: string }
export interface Claim {
  id: string;
  type: ClaimType;
  leadId: string;
  status: ClaimStatus;
  createdAt: string;
  submittedAt?: string;
  updatedAt: string;
  form: Record<string, string>;
  invoices: InvoiceRow[];
  declarationAccepted: boolean;
  files: ClaimFile[];
  history: ClaimEvent[];
  totalRequested: number;
  approvedAmount?: number;
  adminComment?: string;
  /** SLA thresholds (hours) already alerted to the commercial team. */
  slaAlerts?: number[];
}

/** Sum of invoices (reembolso) or budget lines (preautorización). */
export function claimTotal(type: ClaimType, form: Record<string, string>, invoices: InvoiceRow[]): number {
  const n = (v: unknown) => { const x = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(x) && x > 0 ? x : 0; };
  const t = type === 'reembolso' ? invoices.reduce((a, i) => a + n(i.valor), 0) : BUDGET_KEYS.reduce((a, k) => a + n(form[k]), 0);
  return Math.round(t * 100) / 100;
}

/** Missing required fields/files for submission — shared by client UI and server. */
export function missingForSubmit(c: Pick<Claim, 'type' | 'form' | 'invoices' | 'files' | 'declarationAccepted'>): string[] {
  const out: string[] = [];
  for (const s of SECTIONS[c.type]) for (const f of s.fields) {
    const visible = !f.showIf || c.form[f.showIf.key] === f.showIf.equals;
    if (f.required && visible && !String(c.form[f.key] ?? '').trim()) out.push(f.label);
  }
  if (c.type === 'reembolso' && !c.invoices.some(i => i.numero && Number(i.valor) > 0)) out.push('Al menos una factura con número y valor');
  for (const k of FILE_KINDS[c.type]) if (k.required && !c.files.some(f => f.kind === k.kind)) out.push(`Documento: ${k.label}`);
  if (!c.declarationAccepted) out.push('Aceptar la autorización y declaración');
  return out;
}

// ---------- review SLA (KPI del equipo comercial) ----------
/** Colmedikal commits to answer a submitted request within this many hours. */
export const CLAIM_SLA_HOURS = 72;
/** Statuses where the clock runs (Documentos pendientes waits on the client, so it's paused). */
export const SLA_RUNNING: ClaimStatus[] = ['Recibida', 'En revisión'];
// ponytail: clock runs from submittedAt and ignores time spent in "Documentos pendientes";
//           track pause intervals in history if the KPI must exclude it exactly.
export const openHours = (c: Pick<Claim, 'submittedAt' | 'createdAt'>, at = Date.now()) =>
  Math.max(0, (at - new Date(c.submittedAt || c.createdAt).getTime()) / 3_600_000);
export const slaDeadline = (c: Pick<Claim, 'submittedAt' | 'createdAt'>) =>
  new Date(new Date(c.submittedAt || c.createdAt).getTime() + CLAIM_SLA_HOURS * 3_600_000);
/** Traffic light: verde < 48 h, amarillo 48–72 h, rojo ≥ 72 h (SLA vencido). null when the clock isn't running. */
export function slaLight(c: Pick<Claim, 'status' | 'submittedAt' | 'createdAt'>, at = Date.now()): 'verde' | 'amarillo' | 'rojo' | null {
  if (!SLA_RUNNING.includes(c.status)) return null;
  const h = openHours(c, at);
  return h >= CLAIM_SLA_HOURS ? 'rojo' : h >= 48 ? 'amarillo' : 'verde';
}
