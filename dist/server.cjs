process.on("unhandledRejection",(r)=>{if(r&&r.toString().includes("WebAssembly"))return;process.exit(1);});
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express6 = __toESM(require("express"), 1);
var import_path5 = __toESM(require("path"), 1);
var import_fs5 = __toESM(require("fs"), 1);
var import_https = __toESM(require("https"), 1);
var import_vite = require("vite");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_crypto6 = __toESM(require("crypto"), 1);

// src/server/crm.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_express = __toESM(require("express"), 1);
var ACTIVITY_TYPES = ["nota", "llamada", "whatsapp", "email", "reunion", "cambio_etapa", "sistema"];
var STATUSES = ["Nuevo Plan", "Contactado", "Cierre Efectivo", "Perdido"];
var FILE = "";
var load = () => {
  try {
    return JSON.parse(import_fs.default.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
};
var save = (s) => {
  import_fs.default.mkdirSync(import_path.default.dirname(FILE), { recursive: true });
  import_fs.default.writeFileSync(FILE, JSON.stringify(s));
};
var entry = (s, id) => s[id] ||= { activities: [], updatedAt: Date.now() };
var str = (v, max) => typeof v === "string" ? v.trim().slice(0, max) : "";
var validId = (id) => /^[\w-]{1,40}$/.test(id);
function logActivity(leadId, type, body, by = "Sistema") {
  try {
    if (!FILE || !validId(leadId)) return;
    const s = load();
    const e = entry(s, leadId);
    e.activities.unshift({ id: import_crypto.default.randomUUID(), type, body, by, at: (/* @__PURE__ */ new Date()).toISOString() });
    e.updatedAt = Date.now();
    save(s);
  } catch (err) {
    console.error("[crm-log]", err);
  }
}
var LOGINS_FILE = "";
function recordPortalLogin(leadId) {
  try {
    let s = {};
    try {
      s = JSON.parse(import_fs.default.readFileSync(LOGINS_FILE, "utf8"));
    } catch {
    }
    s[leadId] = (/* @__PURE__ */ new Date()).toISOString();
    import_fs.default.writeFileSync(LOGINS_FILE, JSON.stringify(s));
  } catch (err) {
    console.error("[portal-login-record]", err);
  }
}
function makeRequireAdmin(httpsJson) {
  const okTokens = /* @__PURE__ */ new Map();
  return async (req, res, next) => {
    const tok = req.headers.authorization?.split(" ")[1];
    if (!tok) return res.status(401).json({ success: false, message: "Token de administrador requerido" });
    const key = import_crypto.default.createHash("sha256").update(tok).digest("hex");
    if ((okTokens.get(key) || 0) > Date.now()) return next();
    try {
      await httpsJson("https://api.colmedikal.com/api/admin/leads?limit=1", { headers: { Authorization: `Bearer ${tok}` } });
      okTokens.set(key, Date.now() + 5 * 6e4);
      next();
    } catch (e) {
      res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: "No autorizado" });
    }
  };
}
function registerCrmRoutes(app, deps) {
  FILE = import_path.default.join(deps.dataDir, "lead-crm.json");
  LOGINS_FILE = import_path.default.join(deps.dataDir, "portal-logins.json");
  const requireAdmin = makeRequireAdmin(deps.httpsJson);
  app.get("/api/admin/crm", requireAdmin, (_req, res) => {
    let logins = {};
    try {
      logins = JSON.parse(import_fs.default.readFileSync(LOGINS_FILE, "utf8"));
    } catch {
    }
    const portal = {};
    for (const [id, c] of Object.entries(deps.loadPortalCreds())) {
      portal[id] = { hasPassword: true, passwordSetAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : void 0, lastLoginAt: logins[id] };
    }
    res.json({ success: true, data: load(), portal });
  });
  app.post("/api/admin/crm/:leadId", requireAdmin, import_express.default.json({ limit: "200kb" }), (req, res) => {
    const id = req.params.leadId;
    if (!validId(id)) return res.status(400).json({ success: false, message: "ID inv\xE1lido" });
    const b = req.body || {};
    const by = str(b.by, 80) || "Admin";
    const s = load();
    const e = entry(s, id);
    if (b.status !== void 0) {
      if (!STATUSES.includes(b.status)) return res.status(400).json({ success: false, message: "Estado inv\xE1lido" });
      if (e.status !== b.status && !b.silent) e.activities.unshift({ id: import_crypto.default.randomUUID(), type: "cambio_etapa", body: `${e.status || "Nuevo Plan"} \u2192 ${b.status}${b.lostReason ? ` (${str(b.lostReason, 120)})` : ""}`, by, at: (/* @__PURE__ */ new Date()).toISOString() });
      e.status = b.status;
    }
    if (b.lostReason !== void 0) e.lostReason = str(b.lostReason, 120);
    if (b.assignedTo !== void 0) {
      const to = str(b.assignedTo, 120);
      if (e.assignedTo !== to && !b.silent) e.activities.unshift({ id: import_crypto.default.randomUUID(), type: "sistema", body: to ? `Asignado a ${to}` : "Sin asignar", by, at: (/* @__PURE__ */ new Date()).toISOString() });
      e.assignedTo = to;
    }
    if (b.followUpDate !== void 0) {
      const d = str(b.followUpDate, 10);
      if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) return res.status(400).json({ success: false, message: "Fecha inv\xE1lida" });
      e.followUpDate = d;
    }
    if (Array.isArray(b.notes)) {
      e.notes = b.notes.slice(0, 500).map((n) => ({ text: str(n?.text, 2e3), author: str(n?.author, 80), timestamp: str(n?.timestamp, 40) })).filter((n) => n.text);
    }
    e.updatedAt = Date.now();
    save(s);
    res.json({ success: true, data: e });
  });
  app.post("/api/admin/crm/:leadId/activities", requireAdmin, import_express.default.json(), (req, res) => {
    const id = req.params.leadId;
    const type = req.body?.type;
    const body = str(req.body?.body, 5e3);
    const dueAt = str(req.body?.dueAt, 40);
    if (!validId(id) || !ACTIVITY_TYPES.includes(type) || type === "cambio_etapa") return res.status(400).json({ success: false, message: "Datos inv\xE1lidos" });
    if (!body && (type === "nota" || dueAt)) return res.status(400).json({ success: false, message: "Escribe el contenido" });
    if (dueAt && Number.isNaN(Date.parse(dueAt))) return res.status(400).json({ success: false, message: "Fecha inv\xE1lida" });
    const s = load();
    const e = entry(s, id);
    const a = { id: import_crypto.default.randomUUID(), type, body, by: str(req.body?.by, 80) || "Admin", at: (/* @__PURE__ */ new Date()).toISOString(), ...dueAt ? { dueAt: new Date(dueAt).toISOString() } : {} };
    e.activities.unshift(a);
    e.updatedAt = Date.now();
    save(s);
    res.json({ success: true, data: a });
  });
  app.post("/api/admin/crm/:leadId/activities/:actId", requireAdmin, import_express.default.json(), (req, res) => {
    const s = load();
    const e = s[req.params.leadId];
    const a = e?.activities.find((x) => x.id === req.params.actId);
    if (!e || !a) return res.status(404).json({ success: false, message: "No encontrado" });
    if (req.body?.delete) {
      if (a.type === "cambio_etapa" || a.type === "sistema") return res.status(400).json({ success: false, message: "No se puede borrar un registro del sistema" });
      e.activities = e.activities.filter((x) => x !== a);
    } else if (typeof req.body?.done === "boolean") {
      if (req.body.done) a.doneAt = (/* @__PURE__ */ new Date()).toISOString();
      else delete a.doneAt;
    }
    e.updatedAt = Date.now();
    save(s);
    res.json({ success: true });
  });
}

// src/server/claims.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_crypto2 = __toESM(require("crypto"), 1);
var import_express2 = __toESM(require("express"), 1);

// src/data/claims.ts
var CLAIM_STATUSES = {
  reembolso: ["Recibida", "En revisi\xF3n", "Documentos pendientes", "Aprobada", "Pagada", "Rechazada"],
  preautorizacion: ["Recibida", "En revisi\xF3n", "Documentos pendientes", "Aprobada", "Rechazada"]
};
var CLIENT_EDITABLE = ["Borrador", "Recibida", "En revisi\xF3n", "Documentos pendientes"];
var PARENTESCO = ["Titular", "C\xF3nyuge", "Hijo/a", "Padre/Madre", "Otro"];
var CAUSA_REEMBOLSO = ["Enfermedad", "Accidente", "Cong\xE9nita", "Embarazo", "Otros"];
var CAUSA_PREAUT = ["Enfermedad", "Accidente", "Cong\xE9nita", "Embarazo", "Otros"];
var REEMBOLSO_SECTIONS = [
  {
    id: "general",
    title: "Datos de la solicitud",
    fields: [
      { key: "tipoAtencion", label: "Tipo de atenci\xF3n", type: "select", options: ["Ambulatoria", "Hospitalaria"], required: true, half: true },
      { key: "ciudad", label: "Ciudad", required: true, half: true },
      { key: "broker", label: "Br\xF3ker / Asesor", half: true }
    ]
  },
  {
    id: "afiliado",
    title: "1. Informaci\xF3n del afiliado",
    fields: [
      { key: "titular", label: "Titular", required: true, half: true },
      { key: "cedula", label: "C\xE9dula", required: true, half: true },
      { key: "direccion", label: "Direcci\xF3n", half: true },
      { key: "correo", label: "Correo", type: "email", required: true, half: true },
      { key: "telefonoOficina", label: "Tel\xE9fono oficina", type: "tel", half: true },
      { key: "celular", label: "Celular", type: "tel", required: true, half: true },
      { key: "paciente", label: "Paciente", required: true, half: true },
      { key: "parentesco", label: "Parentesco", type: "select", options: PARENTESCO, required: true, half: true },
      { key: "edad", label: "Edad del paciente", type: "number", half: true }
    ]
  },
  {
    id: "profesional",
    title: "2. Datos del profesional",
    hint: "Exclusivo del m\xE9dico. Puedes copiarlos del formulario firmado por tu m\xE9dico; si no los tienes, basta con subir el formulario firmado.",
    fields: [
      { key: "medico", label: "Nombre del m\xE9dico", doctor: true, half: true },
      { key: "especialidad", label: "Especialidad", doctor: true, half: true },
      { key: "telefonoMedico", label: "Tel\xE9fono del m\xE9dico", type: "tel", doctor: true, half: true },
      { key: "inicioEnfermedad", label: "Inicio de enfermedad", type: "date", doctor: true, half: true },
      { key: "motivo", label: "Motivo de consulta", type: "textarea", doctor: true },
      { key: "tratamiento", label: "Tratamiento y/o procedimientos recibidos", type: "textarea", doctor: true },
      { key: "examenes", label: "Ex\xE1menes practicados", type: "textarea", doctor: true },
      { key: "causa", label: "La enfermedad actual es causa de", type: "select", options: CAUSA_REEMBOLSO, doctor: true, half: true },
      { key: "causaOtros", label: "Especifique", doctor: true, half: true, showIf: { key: "causa", equals: "Otros" } },
      { key: "fum", label: "F.U.M. (fecha de \xFAltima menstruaci\xF3n)", type: "date", doctor: true, half: true, showIf: { key: "causa", equals: "Embarazo" } },
      { key: "diagnostico", label: "Diagn\xF3stico definitivo", type: "textarea", doctor: true },
      { key: "cie10", label: "CIE-10", doctor: true, half: true },
      { key: "procedimiento", label: "Procedimiento realizado", doctor: true, half: true },
      { key: "codigoAccess", label: "C\xF3digo de registro en Access", doctor: true, half: true }
    ]
  }
];
var PREAUT_SECTIONS = [
  {
    id: "afiliado",
    title: "Datos generales del afiliado",
    fields: [
      { key: "ciudad", label: "Ciudad", required: true, half: true },
      { key: "fechaAtencion", label: "Fecha de atenci\xF3n", type: "date", half: true },
      { key: "titular", label: "Nombre del titular", required: true, half: true },
      { key: "referencia", label: "N.\xBA de solicitud / referencia", half: true },
      { key: "paciente", label: "Nombre del paciente", required: true, half: true },
      { key: "contrato", label: "Nombre / N.\xBA del contrato", half: true },
      { key: "cedula", label: "C\xE9dula del titular", required: true, half: true },
      { key: "celular", label: "N.\xBA de celular", type: "tel", required: true, half: true },
      { key: "parentesco", label: "Parentesco", type: "select", options: PARENTESCO, required: true, half: true },
      { key: "edad", label: "Edad del paciente", type: "number", half: true },
      { key: "correo", label: "E-mail", type: "email", required: true, half: true }
    ]
  },
  {
    id: "medico",
    title: "Antecedentes m\xE9dico-quir\xFArgicos",
    hint: "Exclusivo del m\xE9dico. Los datos marcados con * son necesarios para programar la preautorizaci\xF3n.",
    fields: [
      { key: "hospital", label: "Hospital / cl\xEDnica de atenci\xF3n", required: true, half: true },
      { key: "fechaIngreso", label: "Fecha probable de ingreso", type: "date", required: true, half: true },
      { key: "medico", label: "Nombre del m\xE9dico", required: true, half: true },
      { key: "especialidad", label: "Especialidad", doctor: true, half: true },
      { key: "telefonoMedico", label: "Tel\xE9fono del m\xE9dico", type: "tel", doctor: true, half: true },
      { key: "inicioEnfermedad", label: "Inicio de la enfermedad", type: "date", doctor: true, half: true },
      { key: "motivo", label: "Motivo de la consulta", type: "textarea", doctor: true },
      { key: "evolucion", label: "Evoluci\xF3n de la enfermedad", type: "textarea", doctor: true },
      { key: "tratamiento", label: "Tratamiento y/o procedimiento recibido (cu\xE1nto tiempo)", type: "textarea", doctor: true },
      { key: "diagnostico", label: "Diagn\xF3stico definitivo", type: "textarea", required: true },
      { key: "cie10", label: "C\xF3digo CIE-10", doctor: true, half: true },
      { key: "fechaDiagnostico", label: "Fecha de diagn\xF3stico", type: "date", doctor: true, half: true },
      { key: "causa", label: "La enfermedad actual es", type: "select", options: CAUSA_PREAUT, doctor: true, half: true },
      { key: "fum", label: "F.U.M.", type: "date", doctor: true, half: true, showIf: { key: "causa", equals: "Embarazo" } },
      { key: "descripcionAccidente", label: "En caso de accidente: c\xF3mo sucedi\xF3, fecha, lugar y hora", type: "textarea", doctor: true, showIf: { key: "causa", equals: "Accidente" } }
    ]
  },
  {
    id: "presupuesto",
    title: "Presupuesto",
    hint: "Valores en USD seg\xFAn la proforma del m\xE9dico / cl\xEDnica.",
    fields: [
      { key: "honorariosCirujano", label: "Honorarios de cirujano", type: "money", half: true },
      { key: "codigoCirujano", label: "C\xF3digo quir\xFArgico", half: true },
      { key: "honorariosAyudante", label: "Honorarios de ayudante", type: "money", half: true },
      { key: "codigoAyudante", label: "C\xF3digo quir\xFArgico", half: true },
      { key: "honorariosAnestesiologo", label: "Honorarios de anestesi\xF3logo", type: "money", half: true },
      { key: "codigoAnestesiologo", label: "C\xF3digo quir\xFArgico", half: true },
      { key: "otrosMedicos", label: "Otros m\xE9dicos", type: "money", half: true },
      { key: "codigoOtros", label: "C\xF3digo quir\xFArgico", half: true },
      { key: "costoClinica", label: "Costo cl\xEDnica", type: "money", half: true }
    ]
  }
];
var BUDGET_KEYS = ["honorariosCirujano", "honorariosAyudante", "honorariosAnestesiologo", "otrosMedicos", "costoClinica"];
var SECTIONS = { reembolso: REEMBOLSO_SECTIONS, preautorizacion: PREAUT_SECTIONS };
var FILE_KINDS = {
  reembolso: [
    { kind: "formulario", label: "Formulario de reembolso firmado por el m\xE9dico", required: true, hint: "Descarga el formulario, ll\xE9valo a tu m\xE9dico y sube una foto o escaneo." },
    { kind: "factura", label: "Facturas (SRI)", required: true },
    { kind: "receta", label: "Recetas / prescripciones" },
    { kind: "examenes", label: "Resultados de ex\xE1menes" },
    { kind: "otro", label: "Otros documentos" }
  ],
  preautorizacion: [
    { kind: "formulario", label: "Formulario de preautorizaci\xF3n firmado y sellado por el m\xE9dico", required: true, hint: "Descarga el formulario, ll\xE9valo a tu m\xE9dico y sube una foto o escaneo." },
    { kind: "informe", label: "Informe m\xE9dico / justificaci\xF3n cl\xEDnica", required: true },
    { kind: "laboratorio", label: "Resultados de laboratorio" },
    { kind: "imagenes", label: "Im\xE1genes: Rayos X / TC / RM / Ecograf\xEDa" },
    { kind: "historia", label: "Historia cl\xEDnica completa" },
    { kind: "presupuesto", label: "Proforma / presupuesto de la cl\xEDnica" },
    { kind: "otro", label: "Otros documentos" }
  ]
};
var CLAIM_LABEL = { reembolso: "Reembolso de gastos m\xE9dicos", preautorizacion: "Preautorizaci\xF3n quir\xFArgica y hospitalaria" };
function claimTotal(type, form, invoices) {
  const n = (v) => {
    const x = Number(String(v ?? "").replace(",", "."));
    return Number.isFinite(x) && x > 0 ? x : 0;
  };
  const t = type === "reembolso" ? invoices.reduce((a, i) => a + n(i.valor), 0) : BUDGET_KEYS.reduce((a, k) => a + n(form[k]), 0);
  return Math.round(t * 100) / 100;
}
function missingForSubmit(c) {
  const out = [];
  for (const s of SECTIONS[c.type]) for (const f of s.fields) {
    const visible = !f.showIf || c.form[f.showIf.key] === f.showIf.equals;
    if (f.required && visible && !String(c.form[f.key] ?? "").trim()) out.push(f.label);
  }
  if (c.type === "reembolso" && !c.invoices.some((i) => i.numero && Number(i.valor) > 0)) out.push("Al menos una factura con n\xFAmero y valor");
  for (const k of FILE_KINDS[c.type]) if (k.required && !c.files.some((f) => f.kind === k.kind)) out.push(`Documento: ${k.label}`);
  if (!c.declarationAccepted) out.push("Aceptar la autorizaci\xF3n y declaraci\xF3n");
  return out;
}
var CLAIM_SLA_HOURS = 72;
var SLA_RUNNING = ["Recibida", "En revisi\xF3n"];
var openHours = (c, at = Date.now()) => Math.max(0, (at - new Date(c.submittedAt || c.createdAt).getTime()) / 36e5);
var slaDeadline = (c) => new Date(new Date(c.submittedAt || c.createdAt).getTime() + CLAIM_SLA_HOURS * 36e5);
function slaLight(c, at = Date.now()) {
  if (!SLA_RUNNING.includes(c.status)) return null;
  const h = openHours(c, at);
  return h >= CLAIM_SLA_HOURS ? "rojo" : h >= 48 ? "amarillo" : "verde";
}

// src/server/leadMail.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);

// src/data/plans.ts
var PLANS = [
  {
    id: "inicio",
    name: "Plan Inicio 2K",
    basePrice: 8,
    cobertura: "$2.000,00 USD Anual",
    dedHosp: "$40,00 USD Anual",
    maternidad: "$250,00 USD",
    muerteAccidente: "$1.500,00 USD",
    sepelio: "$500,00 USD",
    ambulancia: "$200,00 USD",
    evacuacion: "$200,00 USD",
    laboratorio: "$100,00 USD/A\xF1o",
    imagen: "$100,00 USD/A\xF1o",
    especialidades: {
      "Medicina General": true,
      "Medicina Familiar": true,
      "Ginecolog\xEDa": true,
      "Gastroenterolog\xEDa": true,
      "Urolog\xEDa": false,
      "Traumatolog\xEDa": false,
      "Medicina Interna": false,
      "Cardiolog\xEDa": false,
      "Odontolog\xEDa (6 proced./a\xF1o)": true
    },
    caracteristicas: [
      "Entrega de medicina al 100% (Sin costo ni copago)",
      "Especialidades: Medicina General, Familiar, Ginecolog\xEDa y Odontolog\xEDa",
      "Telemedicina sin carencia (activa desde el primer d\xEDa)",
      "Odontolog\xEDa (Consultas, profilaxis, restauraciones resina)"
    ]
  },
  {
    id: "proteccion",
    name: "Plan Protecci\xF3n 3K",
    basePrice: 12,
    cobertura: "$3.000,00 USD Anual",
    dedHosp: "$40,00 USD Anual",
    maternidad: "$500,00 USD",
    muerteAccidente: "$2.500,00 USD",
    sepelio: "$500,00 USD",
    ambulancia: "$200,00 USD",
    evacuacion: "$200,00 USD",
    laboratorio: "$100,00 USD/A\xF1o",
    imagen: "$100,00 USD/A\xF1o",
    especialidades: {
      "Medicina General": true,
      "Medicina Familiar": true,
      "Ginecolog\xEDa": true,
      "Gastroenterolog\xEDa": true,
      "Urolog\xEDa": true,
      "Traumatolog\xEDa": true,
      "Medicina Interna": false,
      "Cardiolog\xEDa": false,
      "Odontolog\xEDa (6 proced./a\xF1o)": true
    },
    caracteristicas: [
      "Especialidades: Incluye Urolog\xEDa y Traumatolog\xEDa",
      "Telemedicina ilimitada sin carencia (activa desde el primer d\xEDa)",
      "Bono de Maternidad de $500,00 para titular",
      "Entrega de medicina al 100% sin copago",
      "Soporte a cirug\xEDas programadas preautorizadas"
    ]
  },
  {
    id: "plus",
    name: "Plan Plus 5K",
    basePrice: 22,
    cobertura: "$5.000,00 USD Anual",
    dedHosp: "$40,00 USD Anual",
    maternidad: "$700,00 USD",
    muerteAccidente: "$3.500,00 USD",
    sepelio: "$800,00 USD",
    ambulancia: "$200,00 USD",
    evacuacion: "$200,00 USD",
    laboratorio: "$100,00/A\xF1o",
    imagen: "$100,00/A\xF1o",
    especialidades: {
      "Medicina General": true,
      "Medicina Familiar": true,
      "Ginecolog\xEDa": true,
      "Gastroenterolog\xEDa": true,
      "Urolog\xEDa": true,
      "Traumatolog\xEDa": true,
      "Medicina Interna": true,
      "Cardiolog\xEDa": true,
      "Odontolog\xEDa (6 proced./a\xF1o)": true
    },
    caracteristicas: [
      "Especialidades: Medicina Interna, Cardiolog\xEDa y Odontolog\xEDa premium",
      "Telemedicina ilimitada sin carencia (activa desde el primer d\xEDa)",
      "Bono de Maternidad premium de $700,00 USD",
      "L\xEDmite de Gastos Hospitalarios de $5.000,00 USD",
      "Ex\xE1menes de lab e im\xE1genes diagn\xF3sticas: $100 totales (ambos incluidos)"
    ]
  }
];

// src/utils/pdfGenerator.ts
var import_jspdf = require("jspdf");

// src/assets/brand-logo.ts
var LOGO_PNG_BASE64 = "data:image/png;base64,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";
var LOGO_RATIO = 780 / 252;

// src/utils/pdfGenerator.ts
function generateQuotePDF(options) {
  const doc = new import_jspdf.jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const NAVY = "#0C4169";
  const LIGHT_BLUE = "#E6F0F6";
  const STEEL_MUTED = "#4597CA";
  const TEXT_DARK = "#1C2E3C";
  const TEXT_MUTED = "#5C6C7C";
  const SUCCESS_GREEN = "#10B981";
  const drawHeader = () => {
    doc.setFillColor(12, 65, 105);
    doc.rect(0, 0, pageWidth, 3, "F");
    const logoW = 58;
    doc.addImage(LOGO_PNG_BASE64, "PNG", 12, 9, logoW, logoW / LOGO_RATIO);
    doc.setDrawColor(12, 65, 105);
    doc.setLineWidth(0.6);
    doc.line(0, 40, pageWidth, 40);
    doc.setFillColor(69, 151, 202);
    doc.rect(pageWidth - 85, 12, 70, 16, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("COTIZACI\xD3N CERTIFICADA", pageWidth - 80, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(240, 248, 255);
    doc.text(`CUC: ${options.leadCode}-SECURE`, pageWidth - 80, 24);
  };
  const drawFooter = () => {
    doc.setFillColor(241, 245, 249);
    doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Colmedikal - Sede Principal: Av. Rep\xFAblica E6-447 Y Eloy Alfaro Ed. Castillo S\xE1nchez, Quito - Ecuador.", 15, pageHeight - 9);
    doc.text("Superintendencia de Compa\xF1\xEDas del Ecuador Registro Reg: 923-CO. Tel\xE9fono: 02-2567191 | WhatsApp: 098 702 8756 | Correo: info@colmedikal.com", 15, pageHeight - 5);
    doc.setFont("helvetica", "bold");
    doc.text("P\xE1gina 1 de 1", pageWidth - 30, pageHeight - 7);
  };
  drawHeader();
  drawFooter();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(12, 65, 105);
  doc.text("1. DATOS DEL CONTRAYENTE TITULAR", 15, 52);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, 54, pageWidth - 15, 54);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(28, 46, 60);
  doc.text(`Asegurado Titular:`, 15, 61);
  doc.setFont("helvetica", "bold");
  doc.text(options.fullName, 48, 61);
  doc.setFont("helvetica", "normal");
  doc.text(`${options.docType.toUpperCase()}:`, 15, 67);
  doc.text(options.docNumber, 48, 67);
  doc.text(`Provincia Residencia:`, 15, 73);
  doc.text(options.province, 48, 73);
  doc.text(`Correo Electr\xF3nico:`, 110, 61);
  doc.text(options.email, 142, 61);
  doc.text(`Tel\xE9fono Celular:`, 110, 67);
  doc.text(options.phone, 142, 67);
  doc.text(`Inicio de Cobertura:`, 110, 73);
  const formattedDate = options.coverageStartDate ? new Date(options.coverageStartDate).toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" }) : (/* @__PURE__ */ new Date()).toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(formattedDate, 142, 73);
  if (options.dependents && options.dependents.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Beneficiarios Familiares Adicionales:", 15, 82);
    doc.setFont("helvetica", "normal");
    let xOffset = 15;
    options.dependents.forEach((dep, index) => {
      const depText = `[Familiar] ${dep.relation} (${dep.age} a\xF1os)`;
      doc.text(depText, xOffset, 87);
      xOffset += 50 + depText.length * 0.4;
    });
  }
  doc.line(15, 93, pageWidth - 15, 93);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(12, 65, 105);
  doc.text("2. PLAN M\xC9DICO E INFORME DE COBERTURAS", 15, 101);
  doc.line(15, 103, pageWidth - 15, 103);
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 108, pageWidth - 30, 48, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, 108, pageWidth - 30, 48, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(12, 65, 105);
  doc.text(`Programa Cobertura Seleccionada: ${options.planName} de Red Directa`, 20, 115);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(28, 46, 60);
  doc.text("Cobertura Anual M\xE1xima:", 20, 122);
  doc.setFont("helvetica", "bold");
  doc.text(`${options.maxCoverage} por asegurado`, 70, 122);
  doc.setFont("helvetica", "normal");
  doc.text("Red Cl\xEDnicas Asociadas:", 20, 128);
  doc.setFont("helvetica", "bold");
  doc.text(options.hospitalNetwork, 70, 128);
  doc.setFont("helvetica", "normal");
  doc.text("Deducible Anual en Hospital:", 20, 134);
  doc.setFont("helvetica", "bold");
  doc.text(options.dedHosp, 70, 134);
  doc.setFont("helvetica", "normal");
  doc.text("Cobertura de Citas M\xE9dicas:", 20, 140);
  doc.setFont("helvetica", "bold");
  doc.text("Cobertura del 100% en consultas m\xE9dicas (Sin copago)", 70, 140);
  doc.setFont("helvetica", "normal");
  doc.text("Cobertura en Medicamentos:", 20, 146);
  doc.setFont("helvetica", "bold");
  doc.text("100% de cobertura (Fybeca, Medicity, Sana Sana o Econ\xF3micas)", 70, 146);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(12, 65, 105);
  doc.text("Beneficios Claves de Cobertura Complementaria:", 15, 163);
  doc.text("Especialidades Principales:", 110, 163);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 80, 90);
  let bulletY = 169;
  options.features.filter((feat) => !feat.toLowerCase().includes("especialidad")).slice(0, 4).forEach((feat) => {
    doc.setFillColor(16, 185, 129);
    doc.circle(18, bulletY - 1, 1.2, "F");
    doc.setTextColor(28, 46, 60);
    const lines = doc.splitTextToSize(feat, 82);
    doc.text(lines, 22, bulletY);
    bulletY += 4 * lines.length + 1.5;
  });
  if (options.especialidades) {
    let specY = 169;
    let count = 0;
    for (const [spec, inc] of Object.entries(options.especialidades)) {
      if (count >= 5) break;
      if (inc) {
        doc.setFillColor(16, 185, 129);
        doc.circle(112, specY - 1, 1.2, "F");
        doc.setTextColor(28, 46, 60);
        doc.text(spec, 116, specY);
        specY += 5.5;
        count++;
      }
    }
  }
  doc.line(15, 198, pageWidth - 15, 198);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(12, 65, 105);
  doc.text("3. DETALLE DE APORTES MENSUALES Y FISCALIDAD", 15, 203);
  doc.line(15, 205, pageWidth - 15, 205);
  doc.setFillColor(230, 240, 246);
  doc.setDrawColor(190, 215, 230);
  doc.rect(15, 210, pageWidth - 30, 20, "F");
  doc.rect(15, 210, pageWidth - 30, 20, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(12, 65, 105);
  doc.text("APORTE MENSUAL TOTAL PROPUESTO:", 20, 222);
  doc.setFontSize(16);
  doc.setTextColor(12, 65, 105);
  doc.text(`$${options.finalPrice.toFixed(2)} USD`, 105, 222.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Este valor incluye todos los impuestos gubernamentales, tasas del reaseguro internacional y descuentos de red aplicados.", 20, 227);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(12, 65, 105);
  doc.text("4. DECLARACI\xD3N JURAMENTADA DE SALUD Y CONSENTIMIENTO", 15, 238);
  doc.line(15, 240, pageWidth - 15, 240);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(doc.splitTextToSize("Declaro bajo la gravedad del juramento que todos los datos consignados en esta suscripci\xF3n digital son verdaderos y fidedignos. Ratifico conocer los periodos obligatorios de carencia (30 d\xEDas para atenci\xF3n ambulatoria, 90 d\xEDas para hospitalizaci\xF3n y maternidad).", pageWidth - 65 - 15 - 5), 15, 245);
  if (options.signatureText) {
    doc.setDrawColor(12, 65, 105);
    doc.setLineWidth(0.3);
    doc.line(15, 263, 85, 263);
    doc.setFont("times", "italic");
    doc.setFontSize(14);
    doc.setTextColor(12, 65, 105);
    doc.text(options.signatureText, 25, 259);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Firma Digital del Propitente Afiliado", 15, 267);
    doc.text(`C.I. ${options.docNumber}`, 15, 270.5);
  }
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.4);
  doc.rect(pageWidth - 65, 245, 50, 22, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(16, 185, 129);
  doc.text("COLMEDIKAL S.A.", pageWidth - 60, 250);
  doc.text("VALIDADO ELECTR\xD3NICAMENTE", pageWidth - 60, 253.5);
  doc.setFont("helvetica", "normal");
  doc.text(`C\xD3DIGO: CLM-${options.leadCode}`, pageWidth - 60, 257);
  doc.text(`FECHA: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`, pageWidth - 60, 260.5);
  doc.text("ESTADO: SUSCRIPCION PENDIENTE", pageWidth - 60, 264);
  if (options.download !== false) doc.save(`Colmedikal_Cotizacion_${options.leadCode}.pdf`);
  return doc;
}

// src/server/leadMail.ts
var port = Number(process.env.SMTP_PORT) || 465;
var mailer = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS ? import_nodemailer.default.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
}) : null;
var MAIL_FROM = process.env.MAIL_FROM || `Colmedikal <${process.env.SMTP_USER}>`;
var LEAD_NOTIFY_TO = (process.env.LEAD_NOTIFY_TO || "colnexos2@gmail.com,contabilidad@grupocolnexos.com,info@colmedikal.com").split(",").map((s) => s.trim()).filter(Boolean);
var CLAIMS_NOTIFY_TO = (process.env.CLAIMS_NOTIFY_TO || "liquidaciones@colmedikal.com").split(",").map((s) => s.trim()).filter(Boolean);
var WHATSAPP = "098 702 8756";
var LOGO_URL = "https://colmedikal.com/brand/colmedikal-logo.png";
var findPlan = (d) => PLANS.find((p) => p.id === d.planId) || (d.plan ? PLANS.find((p) => d.plan.startsWith(p.name)) : void 0);
function quotePdfAttachment(d) {
  const plan = findPlan(d);
  if (!plan) return null;
  const doc = generateQuotePDF({
    download: false,
    leadCode: d.code,
    fullName: d.fullName,
    email: d.email,
    phone: d.phone,
    docNumber: d.docNumber || "\u2014",
    docType: d.docType || "cedula",
    planName: plan.name,
    basePrice: plan.basePrice,
    finalPrice: d.price > 0 ? d.price : plan.basePrice,
    province: d.province || "\u2014",
    coverageStartDate: "",
    dependents: (d.childrenAges || []).map((age) => ({ relation: "Dependiente", age })),
    hospitalNetwork: "Red Cobertura Directa Colmedikal",
    maxCoverage: plan.cobertura,
    dedHosp: plan.dedHosp,
    features: plan.caracteristicas || [],
    especialidades: plan.especialidades || {}
  });
  return { filename: `Colmedikal_Cotizacion_${d.code}.pdf`, content: Buffer.from(doc.output("arraybuffer")), contentType: "application/pdf" };
}
var WHATSAPP_URL = "https://wa.me/593987028756";
var esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var money = (n) => `$${n.toFixed(2)}`;
var rows = (pairs) => pairs.filter(([, v]) => v !== void 0 && v !== null && v !== "").map(([k, v]) => `<tr><td style="padding:8px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0">${esc(k)}</td><td style="padding:8px 12px;color:#0f172a;font-size:13px;font-weight:600;border-bottom:1px solid #e2e8f0">${esc(v)}</td></tr>`).join("");
var layout = (title, body) => `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#fff;padding:18px 24px;border-top:4px solid #0C4169;border-bottom:1px solid #e2e8f0"><img src="${LOGO_URL}" alt="Colmedikal \u2014 Medicina Prepagada S.A." width="180" style="display:block;width:180px;height:auto;border:0"></td></tr>
<tr><td style="padding:24px"><h1 style="margin:0 0 16px;font-size:18px;color:#0C4169">${esc(title)}</h1>${body}</td></tr>
<tr><td style="padding:16px 24px;background:#f8fafc;color:#64748b;font-size:12px">Colmedikal \xB7 Medicina prepagada \xB7 <a href="https://colmedikal.com" style="color:#0d9488">colmedikal.com</a> \xB7 WhatsApp <a href="${WHATSAPP_URL}" style="color:#0d9488">${WHATSAPP}</a></td></tr>
</table></td></tr></table></body></html>`;
function clientMail(d) {
  const first = d.fullName.split(" ")[0] || d.fullName;
  const title = d.plan ? `Tu cotizaci\xF3n ${d.plan.split(" \u2014 ")[0]}` : "Recibimos tu solicitud de cotizaci\xF3n";
  const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Hola ${esc(first)}, gracias por cotizar con Colmedikal. Estos son los datos de tu solicitud:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 20px">${rows([
    ["C\xF3digo de cotizaci\xF3n", d.code],
    ["Plan", d.plan || "Por definir con tu asesor"],
    ["Valor mensual referencial", d.price > 0 ? money(d.price) : ""],
    ["Personas a cubrir", d.members],
    ["Provincia", d.province]
  ])}</table>
${d.plan && findPlan(d) ? '<p style="font-size:14px;color:#334155;line-height:1.6">Adjuntamos en PDF la informaci\xF3n de tu plan para que la tengas siempre a mano.</p>' : ""}
<p style="font-size:14px;color:#334155;line-height:1.6">Un asesor de afiliaci\xF3n se pondr\xE1 en contacto contigo para confirmar tu cotizaci\xF3n. Si prefieres adelantarte, escr\xEDbenos por WhatsApp indicando tu c\xF3digo <b>${esc(d.code)}</b>.</p>
<p style="text-align:center;margin:24px 0"><a href="${WHATSAPP_URL}?text=${encodeURIComponent(`Hola, mi c\xF3digo de cotizaci\xF3n es ${d.code}`)}" style="background:#0d9488;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px">Escribir por WhatsApp</a></p>`;
  return { subject: `${title} \xB7 ${d.code}`, html: layout(title, body) };
}
function teamMail(d, isNew) {
  const title = isNew ? "Nuevo lead desde el cotizador" : "Lead eligi\xF3 un plan";
  const src = d.source;
  const body = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">${rows([
    ["C\xF3digo", d.code],
    ["Nombre", d.fullName],
    ["Correo", d.email],
    ["Tel\xE9fono", d.phone],
    ["C\xE9dula / Pasaporte", d.docNumber],
    ["Fecha de nacimiento", d.birthDate],
    ["Provincia", d.province],
    ["Personas a cubrir", d.members],
    ["Plan", d.plan || "Sin plan elegido a\xFAn"],
    ["Valor mensual estimado", d.price > 0 ? money(d.price) : ""],
    ["Origen", src ? [src.channel, src.detail, src.utmCampaign].filter(Boolean).join(" \xB7 ") : ""],
    ["P\xE1gina de entrada", src?.landingPage],
    ["Fecha", d.createdAt]
  ])}</table>
<p style="text-align:center"><a href="https://colmedikal.com/admin" style="background:#0C4169;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px">Abrir panel de leads</a></p>`;
  return { subject: `${title}: ${d.fullName} \xB7 ${d.code}`, html: layout(title, body) };
}

// src/server/claims.ts
var MAX_FILE = 10 * 1024 * 1024;
var MAX_FILES = 30;
var SIGNATURES = [
  { mime: "application/pdf", ext: "pdf", test: (b) => b.subarray(0, 5).toString() === "%PDF-" },
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 255 && b[1] === 216 && b[2] === 255 },
  { mime: "image/png", ext: "png", test: (b) => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  { mime: "image/webp", ext: "webp", test: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  { mime: "image/heic", ext: "heic", test: (b) => b.subarray(4, 12).toString().startsWith("ftyphei") || b.subarray(4, 12).toString().startsWith("ftypmif1") }
];
var FILE2 = "";
var HIDDEN_FILE = "";
function loadLegacyHidden() {
  try {
    return JSON.parse(import_fs2.default.readFileSync(HIDDEN_FILE, "utf8"));
  } catch {
    return [];
  }
}
var FILES_DIR = "";
var load2 = () => {
  try {
    return JSON.parse(import_fs2.default.readFileSync(FILE2, "utf8"));
  } catch {
    return [];
  }
};
var save2 = (list) => {
  import_fs2.default.mkdirSync(import_path2.default.dirname(FILE2), { recursive: true });
  import_fs2.default.writeFileSync(FILE2, JSON.stringify(list));
};
var str2 = (v, max = 2e3) => typeof v === "string" ? v.trim().slice(0, max) : typeof v === "number" ? String(v) : "";
var now = () => (/* @__PURE__ */ new Date()).toISOString();
function nextId(list, type) {
  const prefix = type === "reembolso" ? "RB" : "PA";
  const n = list.filter((c) => c.type === type).reduce((m, c) => Math.max(m, Number(c.id.split("-")[1]) || 0), 0) + 1;
  return `${prefix}-${String(n).padStart(6, "0")}`;
}
function cleanForm(type, raw) {
  const out = {};
  for (const s of SECTIONS[type]) for (const f of s.fields) {
    const v = str2(raw?.[f.key], f.type === "textarea" ? 3e3 : 300);
    if (v) out[f.key] = v;
  }
  return out;
}
function cleanInvoices(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 30).map((r) => ({
    fecha: str2(r?.fecha, 10),
    numero: str2(r?.numero, 60),
    emisor: str2(r?.emisor, 160),
    valor: Math.max(0, Math.round((Number(String(r?.valor ?? "").replace(",", ".")) || 0) * 100) / 100)
  })).filter((r) => r.numero || r.emisor || r.valor);
}
var forClient = (c) => ({ ...c, history: c.history.map((h) => ({ ...h, by: h.by === "Cliente" ? "T\xFA" : "Colmedikal" })) });
function registerClaimRoutes(app, deps) {
  FILE2 = import_path2.default.join(deps.dataDir, "claims.json");
  FILES_DIR = import_path2.default.join(deps.dataDir, "claims-files");
  HIDDEN_FILE = import_path2.default.join(deps.dataDir, "legacy-requests-deleted.json");
  const { verifyPortalToken, requireAdmin } = deps;
  const mine = (req, res) => {
    const list = load2();
    const claim = list.find((c) => c.id === req.params.id && c.leadId === String(req.leadId));
    if (!claim) {
      res.status(404).json({ success: false, message: "Solicitud no encontrada" });
      return null;
    }
    return { list, claim };
  };
  const sendFile = (res, claim, fileId) => {
    const f = claim.files.find((x) => x.id === fileId);
    const p = f && import_path2.default.join(FILES_DIR, claim.id, f.id);
    if (!f || !p || !import_fs2.default.existsSync(p)) return res.status(404).json({ success: false, message: "Archivo no encontrado" });
    res.setHeader("Content-Type", f.mime);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(f.name)}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    import_fs2.default.createReadStream(p).pipe(res);
  };
  const clientRoutes = (base, auth, actor, fileBy) => {
    app.get(base, ...auth, (req, res) => {
      const leadId = String(req.leadId);
      res.json({ success: true, data: load2().filter((c) => c.leadId === leadId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(forClient) });
    });
    app.post(base, ...auth, import_express2.default.json({ limit: "200kb" }), (req, res) => {
      const type = req.body?.type;
      if (type !== "reembolso" && type !== "preautorizacion") return res.status(400).json({ success: false, message: "Tipo inv\xE1lido" });
      const leadId = String(req.leadId);
      const list = load2();
      let claim = req.body?.id ? list.find((c) => c.id === req.body.id && c.leadId === leadId) : void 0;
      if (req.body?.id && !claim) return res.status(404).json({ success: false, message: "Solicitud no encontrada" });
      if (claim && claim.status !== "Borrador") return res.status(409).json({ success: false, message: "La solicitud ya fue enviada" });
      if (!claim) {
        if (list.filter((c) => c.leadId === leadId && c.status === "Borrador").length >= 5) return res.status(429).json({ success: false, message: "Tienes demasiados borradores; env\xEDa o descarta alguno." });
        claim = { id: nextId(list, type), type, leadId, status: "Borrador", createdAt: now(), updatedAt: now(), form: {}, invoices: [], declarationAccepted: false, files: [], history: [{ at: now(), by: actor(req), action: fileBy === "admin" ? "Borrador creado por el equipo Colmedikal" : "Borrador creado" }], totalRequested: 0 };
        list.push(claim);
      }
      claim.form = cleanForm(type, req.body?.form);
      claim.invoices = type === "reembolso" ? cleanInvoices(req.body?.invoices) : [];
      claim.declarationAccepted = req.body?.declarationAccepted === true;
      claim.totalRequested = claimTotal(type, claim.form, claim.invoices);
      claim.updatedAt = now();
      save2(list);
      res.json({ success: true, data: forClient(claim) });
    });
    app.post(base + "/:id/files", ...auth, import_express2.default.raw({ type: "*/*", limit: MAX_FILE }), (req, res) => {
      const m = mine(req, res);
      if (!m) return;
      const { list, claim } = m;
      if (!CLIENT_EDITABLE.includes(claim.status)) return res.status(409).json({ success: false, message: "Esta solicitud ya no admite documentos" });
      if (claim.files.length >= MAX_FILES) return res.status(400).json({ success: false, message: `M\xE1ximo ${MAX_FILES} documentos por solicitud` });
      const kind = str2(req.header("x-file-kind"), 30);
      if (!FILE_KINDS[claim.type].some((k) => k.kind === kind)) return res.status(400).json({ success: false, message: "Tipo de documento inv\xE1lido" });
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || !buf.length) return res.status(400).json({ success: false, message: "Archivo vac\xEDo" });
      const sig = SIGNATURES.find((s) => s.test(buf));
      if (!sig) return res.status(415).json({ success: false, message: "Formato no permitido. Sube PDF, JPG, PNG, WEBP o HEIC." });
      let name = "documento";
      try {
        name = decodeURIComponent(str2(req.header("x-file-name"), 400)) || name;
      } catch {
      }
      name = name.replace(/[\\/\0<>:"|?*\u0000-\u001f]/g, "_").slice(0, 120);
      const id = import_crypto2.default.randomUUID();
      import_fs2.default.mkdirSync(import_path2.default.join(FILES_DIR, claim.id), { recursive: true });
      import_fs2.default.writeFileSync(import_path2.default.join(FILES_DIR, claim.id, id), buf);
      const file = { id, kind, name, mime: sig.mime, size: buf.length, uploadedAt: now(), by: fileBy };
      claim.files.push(file);
      if (claim.status !== "Borrador") claim.history.push({ at: now(), by: actor(req), action: `Documento agregado: ${name}` });
      claim.updatedAt = now();
      save2(list);
      res.json({ success: true, data: file });
    });
    app.delete(base + "/:id/files/:fileId", ...auth, (req, res) => {
      const m = mine(req, res);
      if (!m) return;
      const { list, claim } = m;
      if (claim.status !== "Borrador") return res.status(409).json({ success: false, message: "No se pueden quitar documentos de una solicitud enviada" });
      claim.files = claim.files.filter((f) => f.id !== req.params.fileId);
      try {
        import_fs2.default.unlinkSync(import_path2.default.join(FILES_DIR, claim.id, import_path2.default.basename(req.params.fileId)));
      } catch {
      }
      save2(list);
      res.json({ success: true });
    });
    app.get(base + "/:id/files/:fileId", ...auth, (req, res) => {
      const m = mine(req, res);
      if (!m) return;
      sendFile(res, m.claim, req.params.fileId);
    });
    app.delete(base + "/:id", ...auth, (req, res) => {
      const m = mine(req, res);
      if (!m) return;
      if (m.claim.status !== "Borrador") return res.status(409).json({ success: false, message: "Solo se pueden descartar borradores" });
      save2(m.list.filter((c) => c !== m.claim));
      import_fs2.default.rmSync(import_path2.default.join(FILES_DIR, m.claim.id), { recursive: true, force: true });
      res.json({ success: true });
    });
    app.post(base + "/:id/submit", ...auth, import_express2.default.json(), (req, res) => {
      const m = mine(req, res);
      if (!m) return;
      const { list, claim } = m;
      const comment = str2(req.body?.comment, 1e3);
      if (claim.status === "Documentos pendientes") {
        claim.status = "En revisi\xF3n";
        claim.history.push({ at: now(), by: actor(req), action: "Documentos enviados para revisi\xF3n", status: "En revisi\xF3n", comment: comment || void 0 });
      } else if (claim.status === "Borrador") {
        const missing = missingForSubmit(claim);
        if (missing.length) return res.status(400).json({ success: false, message: "Faltan datos o documentos", missing });
        claim.status = "Recibida";
        claim.submittedAt = now();
        claim.history.push({ at: now(), by: actor(req), action: fileBy === "admin" ? "Solicitud cargada por el equipo Colmedikal" : "Solicitud enviada", status: "Recibida", comment: comment || void 0 });
        logActivity(claim.leadId, "sistema", `${CLAIM_LABEL[claim.type]} ${claim.id} ${fileBy === "admin" ? "cargada por el equipo" : "enviada"} ($${claim.totalRequested.toFixed(2)})`, actor(req));
        notifyClient(claim, "").catch((e) => console.error("[claims-mail-client]", e?.message || e));
      } else {
        return res.status(409).json({ success: false, message: "Esta solicitud no est\xE1 pendiente de env\xEDo" });
      }
      claim.updatedAt = now();
      save2(list);
      notifyTeam(claim).catch((e) => console.error("[claims-mail-team]", e?.message || e));
      res.json({ success: true, data: forClient(claim) });
    });
  };
  clientRoutes("/api/portal/claims", [verifyPortalToken], () => "Cliente", "cliente");
  const staffName = (req) => {
    try {
      const p = JSON.parse(Buffer.from(String(req.headers.authorization || "").split(" ")[1].split(".")[1], "base64url").toString("utf8"));
      return str2(p.name || p.email, 80) || "Equipo Colmedikal";
    } catch {
      return "Equipo Colmedikal";
    }
  };
  const staffLead = async (req, res, next) => {
    const leadId = str2(req.params.leadId, 80);
    if (!/^[\w-]{1,80}$/.test(leadId) || !await deps.leadExists(leadId).catch(() => false)) {
      return res.status(404).json({ success: false, message: "Cliente no encontrado" });
    }
    req.leadId = leadId;
    next();
  };
  clientRoutes("/api/admin/claims-for/:leadId", [requireAdmin, staffLead], staffName, "admin");
  app.get("/api/admin/legacy-hidden", requireAdmin, (_req, res) => res.json({ success: true, data: loadLegacyHidden() }));
  app.post("/api/admin/legacy-hidden", requireAdmin, import_express2.default.json(), (req, res) => {
    const id = str2(req.body?.id, 60);
    if (!/^[\w-]{1,60}$/.test(id)) return res.status(400).json({ success: false, message: "ID inv\xE1lido" });
    const list = loadLegacyHidden();
    if (!list.includes(id)) {
      list.push(id);
      import_fs2.default.mkdirSync(import_path2.default.dirname(HIDDEN_FILE), { recursive: true });
      import_fs2.default.writeFileSync(HIDDEN_FILE, JSON.stringify(list));
    }
    console.log(`[legacy-hidden] ${id} eliminado por ${str2(req.body?.by, 80) || "admin"}`);
    res.json({ success: true });
  });
  app.get("/api/admin/claims", requireAdmin, (_req, res) => {
    checkSla(deps.commercialEmails).catch((e) => console.error("[claims-sla]", e?.message || e));
    res.json({ success: true, data: load2().filter((c) => c.status !== "Borrador").sort((a, b) => (b.submittedAt || b.createdAt).localeCompare(a.submittedAt || a.createdAt)) });
  });
  app.get("/api/admin/claims/:id/files/:fileId", requireAdmin, (req, res) => {
    const claim = load2().find((c) => c.id === req.params.id);
    if (!claim) return res.status(404).json({ success: false, message: "Solicitud no encontrada" });
    sendFile(res, claim, req.params.fileId);
  });
  app.post("/api/admin/claims/:id", requireAdmin, import_express2.default.json(), (req, res) => {
    const list = load2();
    const claim = list.find((c) => c.id === req.params.id);
    if (!claim || claim.status === "Borrador") return res.status(404).json({ success: false, message: "Solicitud no encontrada" });
    const status = req.body?.status;
    const comment = str2(req.body?.comment, 2e3);
    const by = str2(req.body?.by, 80) || "Admin";
    if (!CLAIM_STATUSES[claim.type].includes(status)) return res.status(400).json({ success: false, message: "Estado inv\xE1lido" });
    if ((status === "Rechazada" || status === "Documentos pendientes") && !comment) return res.status(400).json({ success: false, message: "Indica el motivo para el cliente" });
    if (status === "Pagada" && claim.status !== "Aprobada") return res.status(400).json({ success: false, message: "Solo se puede marcar como pagada una solicitud aprobada" });
    if (status === "Aprobada") {
      const amt = Number(req.body?.approvedAmount);
      if (!Number.isFinite(amt) || amt < 0) return res.status(400).json({ success: false, message: "Indica el monto aprobado" });
      claim.approvedAmount = Math.round(amt * 100) / 100;
    }
    const prev = claim.status;
    claim.status = status;
    if (comment) claim.adminComment = comment;
    claim.history.push({ at: now(), by, action: prev === status ? "Comentario agregado" : `${prev} \u2192 ${status}`, status, comment: comment || void 0 });
    claim.updatedAt = now();
    save2(list);
    logActivity(claim.leadId, "sistema", `${CLAIM_LABEL[claim.type]} ${claim.id}: ${status}${status === "Aprobada" ? ` ($${claim.approvedAmount?.toFixed(2)})` : ""}`, by);
    if (prev !== status || comment) notifyClient(claim, comment).catch((e) => console.error("[claims-mail-client]", e?.message || e));
    res.json({ success: true, data: claim });
  });
}
var TEAM_TO = () => [.../* @__PURE__ */ new Set([...LEAD_NOTIFY_TO, ...CLAIMS_NOTIFY_TO])];
async function notifyTeam(c) {
  if (!mailer) return;
  const title = c.history.length && c.status === "En revisi\xF3n" ? `Documentos recibidos \xB7 ${c.id}` : `Nueva solicitud de ${c.type === "reembolso" ? "reembolso" : "preautorizaci\xF3n"} \xB7 ${c.id}`;
  const body = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">${rows([
    ["Solicitud", `${c.id} \u2014 ${CLAIM_LABEL[c.type]}`],
    ["Titular", c.form.titular],
    ["Paciente", `${c.form.paciente || ""} (${c.form.parentesco || ""})`],
    ["C\xE9dula", c.form.cedula],
    ["Celular", c.form.celular],
    ["Correo", c.form.correo],
    [c.type === "reembolso" ? "Total facturas" : "Presupuesto", `$${c.totalRequested.toFixed(2)}`],
    ...c.type === "preautorizacion" ? [["Hospital", c.form.hospital], ["Fecha probable de ingreso", c.form.fechaIngreso]] : [],
    ["Documentos", c.files.length]
  ])}</table><p style="text-align:center"><a href="https://colmedikal.com/admin" style="background:#0C4169;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px">Revisar en el panel</a></p>`;
  await mailer.sendMail({ from: MAIL_FROM, to: TEAM_TO(), replyTo: c.form.correo || void 0, subject: title, html: layout(title, body) });
}
var STATUS_COPY = {
  Recibida: `recibimos tu solicitud. Nuestro equipo la revisar\xE1 y te responder\xE1 en un m\xE1ximo de ${CLAIM_SLA_HOURS} horas.`,
  "En revisi\xF3n": "Nuestro equipo de auditor\xEDa m\xE9dica est\xE1 revisando tu solicitud.",
  "Documentos pendientes": "Necesitamos documentos o informaci\xF3n adicional para continuar. Ingresa a Mi Colmedikal y s\xFAbelos desde tu solicitud.",
  Aprobada: "Tu solicitud fue aprobada.",
  Pagada: "El valor aprobado de tu reembolso fue pagado.",
  Rechazada: "Tu solicitud no pudo ser aprobada."
};
async function notifyClient(c, comment) {
  const to = c.form.correo;
  if (!mailer || !to || !/\S+@\S+\.\S+/.test(to)) return;
  const title = `${c.type === "reembolso" ? "Reembolso" : "Preautorizaci\xF3n"} ${c.id}: ${c.status}`;
  const deadline = c.status === "Recibida" ? `<p style="font-size:13px;color:#0f172a;background:#f0fdfa;border-left:3px solid #0d9488;padding:10px 12px">Respuesta a m\xE1s tardar el <b>${esc(slaDeadline(c).toLocaleString("es-EC", { timeZone: "America/Guayaquil", dateStyle: "long", timeStyle: "short" }))}</b>.</p>` : "";
  const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Hola ${esc((c.form.titular || "").split(" ")[0])}, ${esc(STATUS_COPY[c.status] || "hay una actualizaci\xF3n en tu solicitud.")}</p>${deadline}
<table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 16px">${rows([
    ["Solicitud", c.id],
    ["Paciente", c.form.paciente],
    ["Estado", c.status],
    ...c.status === "Aprobada" || c.status === "Pagada" ? [["Monto aprobado", `$${(c.approvedAmount ?? 0).toFixed(2)}`]] : []
  ])}</table>
${comment ? `<p style="font-size:14px;color:#334155;line-height:1.6;background:#f8fafc;border-left:3px solid #0d9488;padding:10px 12px"><b>Comentario de Colmedikal:</b><br>${esc(comment).replace(/\n/g, "<br>")}</p>` : ""}
<p style="text-align:center;margin:24px 0"><a href="https://colmedikal.com/mi-colmedikal" style="background:#0d9488;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px">Ver mi solicitud</a></p>`;
  await mailer.sendMail({ from: MAIL_FROM, to, replyTo: LEAD_NOTIFY_TO, subject: title, html: layout(title, body) });
}
var SLA_THRESHOLDS = [24, 48, CLAIM_SLA_HOURS];
var LIGHT_COLOR = { verde: "#16a34a", amarillo: "#d97706", rojo: "#dc2626" };
async function checkSla(commercialEmails, at = Date.now()) {
  if (!FILE2) return;
  const list = load2();
  const running = list.filter((c) => SLA_RUNNING.includes(c.status));
  const due = running.filter((c) => SLA_THRESHOLDS.some((t) => openHours(c, at) >= t && !(c.slaAlerts || []).includes(t)));
  if (!due.length) return;
  const to = [.../* @__PURE__ */ new Set([...await commercialEmails().catch(() => []), ...CLAIMS_NOTIFY_TO])];
  if (mailer && to.length) {
    const row = (c) => {
      const light = slaLight(c, at);
      return `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${LIGHT_COLOR[light]}"></span></td>
<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;font-family:monospace">${esc(c.id)}</td>
<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:13px">${esc(c.form.paciente || c.form.titular)}</td>
<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:13px">${esc(c.status)}</td>
<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:bold;text-align:right">${Math.floor(openHours(c, at))} h</td></tr>`;
    };
    const overdue = running.filter((c) => openHours(c, at) >= CLAIM_SLA_HOURS).length;
    const title = overdue ? `${overdue} solicitud(es) superaron las ${CLAIM_SLA_HOURS} h` : `Solicitudes abiertas: ${due.map((c) => c.id).join(", ")}`;
    const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Reembolsos y preautorizaciones abiertos. Compromiso con el cliente: respuesta en m\xE1ximo ${CLAIM_SLA_HOURS} horas.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px">${running.sort((a, b) => openHours(b, at) - openHours(a, at)).map(row).join("")}</table>
<p style="font-size:12px;color:#64748b">\u25CF verde &lt; 48 h \xB7 \u25CF amarillo 48\u2013${CLAIM_SLA_HOURS} h \xB7 \u25CF rojo \u2265 ${CLAIM_SLA_HOURS} h</p>
<p style="text-align:center"><a href="https://colmedikal.com/admin" style="background:#0C4169;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px">Abrir el panel</a></p>`;
    await mailer.sendMail({ from: MAIL_FROM, to, subject: title, html: layout(title, body) });
  }
  for (const c of due) c.slaAlerts = SLA_THRESHOLDS.filter((t) => openHours(c, at) >= t);
  save2(list);
  console.log("[claims-sla] alerted", due.map((c) => c.id).join(","), "to", to.length, "recipients");
}
function startSlaTimer(commercialEmails) {
  const run = () => checkSla(commercialEmails).catch((e) => console.error("[claims-sla]", e?.message || e));
  setTimeout(run, 6e4);
  setInterval(run, 30 * 6e4).unref();
  return run;
}

// src/server/portalPassword.ts
var import_fs3 = __toESM(require("fs"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_crypto3 = __toESM(require("crypto"), 1);
var import_express3 = __toESM(require("express"), 1);

// src/data/password.ts
var MIN_PASSWORD = 8;
var passwordProblem = (p) => p.length < MIN_PASSWORD ? `La contrase\xF1a debe tener al menos ${MIN_PASSWORD} caracteres.` : !/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(p) || !/\d/.test(p) ? "La contrase\xF1a debe combinar letras y n\xFAmeros." : p.length > 200 ? "La contrase\xF1a es demasiado larga." : "";

// src/server/portalPassword.ts
var TOKEN_TTL = 30 * 6e4;
var WELCOME_TTL = 72 * 60 * 6e4;
var PORTAL_URL = "https://colmedikal.com/mi-colmedikal";
function registerPortalPasswordRoutes(app, deps) {
  const TOKENS_FILE = import_path3.default.join(deps.dataDir, "portal-reset-tokens.json");
  const loadTokens = () => {
    try {
      return JSON.parse(import_fs3.default.readFileSync(TOKENS_FILE, "utf8"));
    } catch {
      return {};
    }
  };
  const saveTokens = (t) => {
    const now2 = Date.now();
    for (const k of Object.keys(t)) if (t[k].exp < now2) delete t[k];
    import_fs3.default.mkdirSync(deps.dataDir, { recursive: true });
    import_fs3.default.writeFileSync(TOKENS_FILE, JSON.stringify(t));
  };
  const sha = (s) => import_crypto3.default.createHash("sha256").update(s).digest("hex");
  const normId = (s) => typeof s === "string" ? s.toLowerCase().replace(/\s/g, "").trim() : "";
  const hits = /* @__PURE__ */ new Map();
  const throttled = (key, max, windowMs) => {
    const now2 = Date.now();
    const list = (hits.get(key) || []).filter((t) => now2 - t < windowMs);
    list.push(now2);
    hits.set(key, list);
    return list.length > max;
  };
  const clientIp = (req) => String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip || "";
  const setPassword = (leadId, password) => {
    const store = deps.loadPortalCreds();
    const { hash, salt } = deps.hashPortalPassword(password);
    store[leadId] = { ...store[leadId], hash, salt, updatedAt: Date.now() };
    deps.savePortalCreds(store);
  };
  const sendChangedNotice = async (leadId, how) => {
    const c = await deps.getContact(leadId).catch(() => null);
    if (!mailer || !c?.email) return;
    const title = "Tu contrase\xF1a de Mi Colmedikal cambi\xF3";
    const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Hola ${esc(c.fullName.split(" ")[0])}, la contrase\xF1a de tu cuenta en Mi Colmedikal se cambi\xF3 ${esc(how)} el ${esc((/* @__PURE__ */ new Date()).toLocaleString("es-EC", { timeZone: "America/Guayaquil", dateStyle: "long", timeStyle: "short" }))}.</p>
<p style="font-size:14px;color:#334155;line-height:1.6">Si fuiste t\xFA, no necesitas hacer nada. <b>Si no reconoces este cambio</b>, restablece tu contrase\xF1a de inmediato desde <a href="${PORTAL_URL}" style="color:#0d9488">Mi Colmedikal</a> y escr\xEDbenos por WhatsApp al 098 702 8756.</p>`;
    await mailer.sendMail({ from: MAIL_FROM, to: c.email, replyTo: LEAD_NOTIFY_TO, subject: title, html: layout(title, body) });
  };
  const issueLink = (leadId, ttl) => {
    const token = import_crypto3.default.randomBytes(32).toString("base64url");
    const tokens = loadTokens();
    for (const [k, v] of Object.entries(tokens)) if (v.leadId === leadId) delete tokens[k];
    tokens[sha(token)] = { leadId, exp: Date.now() + ttl };
    saveTokens(tokens);
    return `${PORTAL_URL}?reset=${token}`;
  };
  app.post("/api/portal/forgot", import_express3.default.json(), async (req, res) => {
    const generic = { success: true, message: "Si la c\xE9dula tiene una cuenta activa, enviamos un enlace para restablecer la contrase\xF1a al correo registrado. Revisa tambi\xE9n la carpeta de spam." };
    try {
      const doc = normId(req.body?.docNumber);
      if (!/^[a-z0-9]{5,20}$/.test(doc)) return res.status(400).json({ success: false, message: "Ingresa tu n\xFAmero de c\xE9dula o pasaporte." });
      if (throttled(`ip:${clientIp(req)}`, 10, 60 * 6e4) || throttled(`doc:${doc}`, 3, 15 * 6e4)) {
        return res.status(429).json({ success: false, message: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." });
      }
      const store = deps.loadPortalCreds();
      const ids = Object.entries(store).filter(([, c]) => normId(c.docNumber) === doc).sort(([, x], [, y]) => (y.updatedAt || 0) - (x.updatedAt || 0)).map(([id]) => id);
      let leadId = ids[0];
      if (!leadId) {
        const legacy = await deps.findLegacyAccount?.(doc).catch(() => null);
        if (!legacy) {
          console.warn("[portal-forgot] no account for doc", doc.slice(-4));
          return res.json(generic);
        }
        leadId = legacy.leadId;
        store[leadId] = { docNumber: doc, hash: legacy.hash, salt: legacy.salt, updatedAt: Date.now() };
        deps.savePortalCreds(store);
      }
      if (!mailer) {
        console.error("[portal-forgot] mailer not configured (SMTP_* env missing)");
        return res.json(generic);
      }
      let contact = null;
      for (const id of ids.length ? ids : [leadId]) {
        contact = await deps.getContact(id).catch(() => null);
        if (contact?.email) {
          leadId = id;
          break;
        }
      }
      if (!contact?.email) {
        console.warn("[portal-forgot] no email on lead", leadId);
        return res.json(generic);
      }
      const link = issueLink(leadId, TOKEN_TTL);
      const title = "Restablece tu contrase\xF1a de Mi Colmedikal";
      const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Hola ${esc(contact.fullName.split(" ")[0])}, recibimos una solicitud para restablecer la contrase\xF1a de tu cuenta en Mi Colmedikal.</p>
<p style="text-align:center;margin:28px 0"><a href="${link}" style="background:#0C4169;color:#fff;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:bold;font-size:14px">Crear nueva contrase\xF1a</a></p>
<p style="font-size:12px;color:#64748b;line-height:1.6">El enlace vence en 30 minutos y sirve una sola vez. Si no solicitaste este cambio, ignora este correo: tu contrase\xF1a actual sigue funcionando.</p>
<p style="font-size:11px;color:#94a3b8;word-break:break-all">Si el bot\xF3n no funciona, copia este enlace en tu navegador:<br>${esc(link)}</p>`;
      await mailer.sendMail({ from: MAIL_FROM, to: contact.email, replyTo: LEAD_NOTIFY_TO, subject: title, html: layout(title, body) });
      console.log("[portal-forgot] reset link sent, lead", leadId);
      logActivity(leadId, "sistema", "El cliente solicit\xF3 restablecer su contrase\xF1a del portal", "Cliente");
      res.json(generic);
    } catch (e) {
      console.error("[portal-forgot]", e);
      res.json(generic);
    }
  });
  app.post("/api/portal/reset", import_express3.default.json(), async (req, res) => {
    try {
      const token = typeof req.body?.token === "string" ? req.body.token : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (throttled(`reset:${clientIp(req)}`, 20, 15 * 6e4)) return res.status(429).json({ success: false, message: "Demasiados intentos. Espera unos minutos." });
      const tokens = loadTokens();
      const rec = token ? tokens[sha(token)] : void 0;
      if (!rec || rec.exp < Date.now()) return res.status(400).json({ success: false, message: "El enlace no es v\xE1lido o ya venci\xF3. Solicita uno nuevo." });
      const problem = passwordProblem(password);
      if (problem) return res.status(400).json({ success: false, message: problem });
      delete tokens[sha(token)];
      saveTokens(tokens);
      setPassword(rec.leadId, password);
      logActivity(rec.leadId, "sistema", "El cliente restableci\xF3 su contrase\xF1a del portal (enlace por correo)", "Cliente");
      sendChangedNotice(rec.leadId, "mediante el enlace de restablecimiento").catch((e) => console.error("[portal-reset-mail]", e?.message || e));
      res.json({ success: true, message: "Contrase\xF1a actualizada. Ya puedes ingresar con tu c\xE9dula y la nueva contrase\xF1a." });
    } catch (e) {
      console.error("[portal-reset]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.post("/api/portal/change-password", deps.verifyPortalToken, import_express3.default.json(), async (req, res) => {
    try {
      const leadId = String(req.leadId);
      const current = typeof req.body?.current === "string" ? req.body.current : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (throttled(`chg:${leadId}`, 5, 15 * 6e4)) return res.status(429).json({ success: false, message: "Demasiados intentos. Espera unos minutos." });
      const cred = deps.loadPortalCreds()[leadId];
      if (!cred || !deps.verifyPortalPassword(current, cred.hash, cred.salt)) return res.status(400).json({ success: false, message: "La contrase\xF1a actual no es correcta." });
      const problem = passwordProblem(password);
      if (problem) return res.status(400).json({ success: false, message: problem });
      if (password === current) return res.status(400).json({ success: false, message: "La nueva contrase\xF1a debe ser distinta de la actual." });
      setPassword(leadId, password);
      logActivity(leadId, "sistema", "El cliente cambi\xF3 su contrase\xF1a del portal", "Cliente");
      sendChangedNotice(leadId, "desde tu panel").catch((e) => console.error("[portal-change-mail]", e?.message || e));
      res.json({ success: true, message: "Contrase\xF1a actualizada." });
    } catch (e) {
      console.error("[portal-change-password]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  const sendWelcome = async (leadId, docNumber, contact) => {
    const store = deps.loadPortalCreds();
    if (!store[leadId]) {
      const { hash, salt } = deps.hashPortalPassword(import_crypto3.default.randomBytes(24).toString("base64url"));
      store[leadId] = { docNumber: normId(docNumber), hash, salt, updatedAt: Date.now() };
      deps.savePortalCreds(store);
    }
    if (!mailer || !contact.email) return false;
    const link = issueLink(leadId, WELCOME_TTL);
    const title = "Bienvenido a Mi Colmedikal";
    const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Hola ${esc(contact.fullName.split(" ")[0])}, ya tienes acceso a <b>Mi Colmedikal</b>, tu portal de afiliado: solicita reembolsos y preautorizaciones, agenda citas y revisa tu plan.</p>
<p style="font-size:14px;color:#334155;line-height:1.6">Tu usuario es tu n\xFAmero de c\xE9dula o pasaporte: <b>${esc(docNumber)}</b>. Para entrar, primero crea tu contrase\xF1a:</p>
<p style="text-align:center;margin:28px 0"><a href="${link}" style="background:#0C4169;color:#fff;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:bold;font-size:14px">Crear mi contrase\xF1a</a></p>
<p style="font-size:12px;color:#64748b;line-height:1.6">El enlace vence en 72 horas. Si vence, usa \u201C\xBFOlvidaste tu contrase\xF1a?\u201D en Mi Colmedikal.</p>
<p style="font-size:11px;color:#94a3b8;word-break:break-all">Si el bot\xF3n no funciona, copia este enlace en tu navegador:<br>${esc(link)}</p>`;
    await mailer.sendMail({ from: MAIL_FROM, to: contact.email, replyTo: LEAD_NOTIFY_TO, subject: title, html: layout(title, body) });
    logActivity(leadId, "email", "Correo de bienvenida a Mi Colmedikal enviado (crear contrase\xF1a)", "Sistema");
    return true;
  };
  return { sendWelcome };
}

// src/server/adminAccess.ts
var import_fs4 = __toESM(require("fs"), 1);
var import_path4 = __toESM(require("path"), 1);
var import_crypto4 = __toESM(require("crypto"), 1);
var import_express4 = __toESM(require("express"), 1);

// src/data/adminPermissions.ts
var ADMIN_MODULES = [
  { id: "kpis", label: "Consola General" },
  { id: "refunds", label: "Reembolsos" },
  { id: "appointments", label: "Citas M\xE9dicas" },
  { id: "auths", label: "Preautorizaciones" },
  { id: "leads", label: "Cotizaciones Recibidas" },
  { id: "clientes", label: "Clientes" },
  { id: "doctors", label: "Directorio M\xE9dico" },
  { id: "admins", label: "Gestionar Accesos (solo ver)" }
];
var ALL = ADMIN_MODULES.map((m) => m.id);
function roleDefaults(role) {
  switch (role) {
    case "Super Admin":
      return { modules: [...ALL], deleteLeads: true };
    case "Mid Admin":
      return { modules: [...ALL], deleteLeads: true };
    case "Equipo Comercial":
      return { modules: ["kpis", "refunds", "leads", "auths", "clientes"], deleteLeads: false };
    // refunds: they file them manually
    case "Auditor":
      return { modules: ["refunds"], deleteLeads: false };
    default:
      return { modules: [], deleteLeads: false };
  }
}
function cleanPermissions(p) {
  if (!p || typeof p !== "object") return null;
  const { modules, deleteLeads } = p;
  if (!Array.isArray(modules)) return null;
  return { modules: ALL.filter((id) => modules.includes(id)), deleteLeads: deleteLeads === true };
}

// src/server/adminAccess.ts
var API = "https://api.colmedikal.com";
var TOKEN_TTL2 = 24 * 60 * 6e4;
var ADMIN_URL = "https://colmedikal.com/admin";
var MIN_ADMIN_PASSWORD = 8;
var jwtPayload = (tok) => {
  try {
    return JSON.parse(Buffer.from(tok.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
};
function registerAdminAccessRoutes(app, deps) {
  const FILE3 = import_path4.default.join(deps.dataDir, "admin-password-tokens.json");
  const load3 = () => {
    try {
      return JSON.parse(import_fs4.default.readFileSync(FILE3, "utf8"));
    } catch {
      return {};
    }
  };
  const save3 = (t) => {
    const now2 = Date.now();
    for (const k of Object.keys(t)) if (t[k].exp < now2) delete t[k];
    import_fs4.default.mkdirSync(deps.dataDir, { recursive: true });
    import_fs4.default.writeFileSync(FILE3, JSON.stringify(t));
  };
  const sha = (s) => import_crypto4.default.createHash("sha256").update(s).digest("hex");
  const hits = /* @__PURE__ */ new Map();
  const throttled = (key, max, windowMs) => {
    const now2 = Date.now();
    const list = (hits.get(key) || []).filter((t) => now2 - t < windowMs);
    list.push(now2);
    hits.set(key, list);
    return list.length > max;
  };
  const whoIs = async (req) => {
    const tok = req.headers.authorization?.split(" ")[1] || "";
    if (!tok) return { status: 401 };
    let users;
    const email = String(jwtPayload(tok)?.email || "").toLowerCase();
    try {
      users = (await deps.httpsJson(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${tok}` } }))?.data || [];
    } catch (e) {
      console.warn("[admin-whois] API rejected token of", email || "(no email)", e?.status || e?.message);
      return { status: 403 };
    }
    const caller = users.find((u) => String(u.email).toLowerCase() === email);
    if (!caller || !caller.active) {
      console.warn("[admin-whois]", email || "(no email)", caller ? "is suspended" : "not in admin_users");
      return { status: 403 };
    }
    return { status: 200, caller, users, isSuper: caller.role === "Super Admin" };
  };
  const PERMS_FILE = import_path4.default.join(deps.dataDir, "admin-permissions.json");
  const loadPerms = () => {
    try {
      return JSON.parse(import_fs4.default.readFileSync(PERMS_FILE, "utf8"));
    } catch {
      return {};
    }
  };
  const effective = (u, store) => {
    if (u.role === "Super Admin") return roleDefaults("Super Admin");
    const saved = store[String(u.email).toLowerCase()];
    return saved ? { modules: saved.modules, deleteLeads: saved.deleteLeads } : roleDefaults(u.role);
  };
  app.get("/api/admin/access/permissions", async (req, res) => {
    const w = await whoIs(req);
    if (w.status !== 200) return res.status(w.status).json({ success: false, message: "No autorizado" });
    const store = loadPerms();
    const mine = effective(w.caller, store);
    if (!w.isSuper) return res.json({ success: true, mine });
    const all = {};
    for (const u of w.users) {
      const key = String(u.email).toLowerCase();
      all[key] = { ...effective(u, store), custom: !!store[key] && u.role !== "Super Admin" };
    }
    res.json({ success: true, mine, all });
  });
  app.put("/api/admin/access/permissions/:email", import_express4.default.json(), async (req, res) => {
    try {
      const w = await whoIs(req);
      if (w.status !== 200) return res.status(w.status).json({ success: false, message: "No autorizado" });
      if (!w.isSuper) return res.status(403).json({ success: false, message: "Solo el Super Admin puede gestionar accesos" });
      const target = String(req.params.email || "").toLowerCase();
      const member = w.users.find((u) => String(u.email).toLowerCase() === target);
      if (!member) return res.status(404).json({ success: false, message: "Miembro no encontrado" });
      if (member.role === "Super Admin") return res.status(400).json({ success: false, message: "El Super Admin siempre tiene acceso total." });
      const store = loadPerms();
      if (req.body?.reset === true) delete store[target];
      else {
        const p = cleanPermissions(req.body);
        if (!p) return res.status(400).json({ success: false, message: "Permisos inv\xE1lidos" });
        store[target] = { ...p, updatedAt: Date.now(), by: String(w.caller.email) };
      }
      import_fs4.default.mkdirSync(deps.dataDir, { recursive: true });
      import_fs4.default.writeFileSync(PERMS_FILE, JSON.stringify(store));
      console.log("[admin-permissions]", target, "set by", w.caller.email);
      res.json({ success: true, permissions: { ...effective(member, store), custom: !!store[target] } });
    } catch (e) {
      console.error("[admin-permissions]", e?.message || e);
      res.status(500).json({ success: false, message: "No se pudieron guardar los permisos" });
    }
  });
  const clientIp = (req) => String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip || "";
  app.post("/api/admin/access/link", import_express4.default.json(), async (req, res) => {
    try {
      const target = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
      const isNew = req.body?.isNew === true;
      const w = await whoIs(req);
      if (w.status === 401) return res.status(401).json({ success: false, message: "Token de administrador requerido" });
      if (w.status !== 200) return res.status(403).json({ success: false, message: "No autorizado" });
      if (!w.isSuper) return res.status(403).json({ success: false, message: "Solo el Super Admin puede gestionar accesos" });
      const { caller, users } = w;
      const callerEmail = String(caller.email).toLowerCase();
      const member = users.find((u) => String(u.email).toLowerCase() === target);
      if (!member) return res.status(404).json({ success: false, message: "Miembro no encontrado" });
      const svcEmail = String(deps.serviceEmail || "").toLowerCase();
      const svc = users.find((u) => String(u.email).toLowerCase() === svcEmail);
      if (!svc || svc.role !== "Super Admin" || !svc.active) {
        console.warn("[admin-access-link] service account not usable:", svcEmail || "(unset)", svc ? `${svc.role}/${svc.active ? "activo" : "suspendido"}` : "not in admin_users");
        return res.status(409).json({ success: false, message: `Los enlaces por correo no funcionar\xE1n hasta que la cuenta ${svcEmail || "de servicio"} sea Super Admin y est\xE9 activa en Gestionar Accesos. Mientras tanto usa "o as\xEDgnala t\xFA".` });
      }
      if (!mailer) return res.status(503).json({ success: false, message: "El correo no est\xE1 configurado en el servidor" });
      if (throttled(`link:${target}`, 5, 60 * 6e4)) return res.status(429).json({ success: false, message: "Demasiados env\xEDos para este miembro. Intenta m\xE1s tarde." });
      const token = import_crypto4.default.randomBytes(32).toString("base64url");
      const tokens = load3();
      for (const [k, v] of Object.entries(tokens)) if (v.email === target) delete tokens[k];
      tokens[sha(token)] = { email: target, exp: Date.now() + TOKEN_TTL2 };
      save3(tokens);
      const link = `${ADMIN_URL}?setpw=${token}`;
      const first = String(member.name || "").split(" ")[0];
      const title = isNew ? "Tu acceso al panel de Colmedikal" : "Crea tu nueva contrase\xF1a del panel de Colmedikal";
      const intro = isNew ? `${esc(caller.name || "El administrador")} te dio acceso al panel administrativo de Colmedikal con el rol <b>${esc(member.role)}</b>. Para ingresar, primero crea tu contrase\xF1a.` : `${esc(caller.name || "El administrador")} pidi\xF3 que crees una nueva contrase\xF1a para tu acceso al panel administrativo de Colmedikal. Tu contrase\xF1a anterior seguir\xE1 funcionando hasta que la cambies.`;
      const body = `<p style="font-size:14px;color:#334155;line-height:1.6">Hola ${esc(first)}, ${intro}</p>
<p style="text-align:center;margin:28px 0"><a href="${link}" style="background:#0C4169;color:#fff;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:bold;font-size:14px">Crear mi contrase\xF1a</a></p>
<p style="font-size:12px;color:#64748b;line-height:1.6">Tu usuario es <b>${esc(target)}</b>. El enlace vence en 24 horas y sirve una sola vez. Si no esperabas este correo, ign\xF3ralo.</p>
<p style="font-size:11px;color:#94a3b8;word-break:break-all">Si el bot\xF3n no funciona, copia este enlace en tu navegador:<br>${esc(link)}</p>`;
      await mailer.sendMail({ from: MAIL_FROM, to: target, subject: title, html: layout(title, body) });
      console.log("[admin-access-link] sent to", target, "by", callerEmail);
      res.json({ success: true, message: `Enviamos el enlace a ${target}.` });
    } catch (e) {
      console.error("[admin-access-link]", e?.message || e);
      res.status(500).json({ success: false, message: "No se pudo enviar el correo" });
    }
  });
  app.post("/api/admin/access/set-password", import_express4.default.json(), async (req, res) => {
    try {
      const token = typeof req.body?.token === "string" ? req.body.token : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (throttled(`setpw:${clientIp(req)}`, 20, 15 * 6e4)) return res.status(429).json({ success: false, message: "Demasiados intentos. Espera unos minutos." });
      const tokens = load3();
      const rec = token ? tokens[sha(token)] : void 0;
      if (!rec || rec.exp < Date.now()) return res.status(400).json({ success: false, message: "El enlace no es v\xE1lido o ya venci\xF3. Pide uno nuevo al administrador." });
      if (password.length < MIN_ADMIN_PASSWORD || password.length > 200) return res.status(400).json({ success: false, message: `La contrase\xF1a debe tener al menos ${MIN_ADMIN_PASSWORD} caracteres.` });
      const put = async (svc) => deps.httpsJson(`${API}/api/admin/users/${encodeURIComponent(rec.email)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${svc}`, "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      try {
        await put(await deps.getApiToken());
      } catch (e) {
        if (e?.status !== 401) throw e;
        await put(await deps.getApiToken(true));
      }
      delete tokens[sha(token)];
      save3(tokens);
      console.log("[admin-set-password] password set for", rec.email);
      res.json({ success: true, message: "Contrase\xF1a creada. Ya puedes ingresar con tu correo y la nueva contrase\xF1a.", email: rec.email });
    } catch (e) {
      console.error("[admin-set-password]", e?.status || "", e?.message || e);
      res.status(500).json({ success: false, message: e?.status === 403 ? "El panel a\xFAn no est\xE1 configurado para guardar contrase\xF1as desde este enlace. Pide al administrador que te asigne la clave directamente." : "No se pudo guardar la contrase\xF1a. Intenta de nuevo o contacta al administrador." });
    }
  });
}

// src/server/clients.ts
var import_crypto5 = __toESM(require("crypto"), 1);
var import_express5 = __toESM(require("express"), 1);
var norm = (s) => typeof s === "string" ? s.toLowerCase().replace(/\s/g, "") : "";
var str3 = (v, max = 160) => typeof v === "string" ? v.trim().slice(0, max) : "";
function registerClientRoutes(app, deps) {
  app.post("/api/admin/clients", deps.requireAdmin, import_express5.default.json(), async (req, res) => {
    try {
      const b = req.body || {};
      const fullName = str3(b.fullName, 120);
      const docType = b.docType === "pasaporte" ? "pasaporte" : "cedula";
      const docNumber = str3(b.docNumber, 20).replace(/\s/g, "");
      const email = str3(b.email, 160).toLowerCase();
      const phone = str3(b.phone, 20);
      const province = str3(b.province, 60);
      const plan = PLANS.find((p) => p.id === b.planId);
      if (fullName.split(" ").filter(Boolean).length < 2) return res.status(400).json({ success: false, message: "Ingresa nombres y apellidos." });
      if (docType === "cedula" ? !/^\d{10}$/.test(docNumber) : !/^[A-Za-z0-9]{5,20}$/.test(docNumber)) {
        return res.status(400).json({ success: false, message: docType === "cedula" ? "La c\xE9dula debe tener 10 d\xEDgitos." : "Pasaporte inv\xE1lido." });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: "Correo inv\xE1lido." });
      if (!/^\+?\d{7,15}$/.test(phone.replace(/[\s-]/g, ""))) return res.status(400).json({ success: false, message: "Celular inv\xE1lido." });
      const existing = (await deps.getLeads(true)).find((l) => norm(deps.parseQuoteData(l).docNumber) === norm(docNumber));
      if (existing) return res.status(409).json({ success: false, message: "Ya existe un registro con esa c\xE9dula. \xC1brelo desde Clientes para darle acceso.", leadId: String(existing.id) });
      const leadCode = `CM-${import_crypto5.default.randomBytes(3).toString("hex").toUpperCase()}`;
      const quote = {
        fullName,
        email,
        phone,
        docType,
        docNumber,
        province,
        type: "individual",
        primaryAge: 35,
        childrenCount: 0,
        childrenAges: [],
        basePlanId: plan?.id || "",
        selectedPlanName: plan ? `${plan.name} \u2014 $${plan.basePrice}/mes` : "",
        leadCode,
        source: { channel: "Manual", detail: "Creado en el panel" }
      };
      const tok = req.headers.authorization.split(" ")[1];
      const created = await deps.httpsJson("https://api.colmedikal.com/api/admin/leads", {
        method: "POST",
        headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
        body: JSON.stringify({ quote_data: quote, estimated_price: plan?.basePrice || 0, status: "Cierre Efectivo" })
      });
      const leadId = String(created?.id ?? created?.data?.id ?? "");
      if (!leadId) throw new Error("API did not return the new lead id");
      logActivity(leadId, "sistema", "Cliente creado manualmente en el panel", str3(b.by, 80) || "Admin");
      let welcomeSent = false;
      if (b.sendWelcome !== false) {
        welcomeSent = await deps.sendWelcome(leadId, docNumber, { email, fullName }).catch((e) => {
          console.error("[admin-clients-welcome]", e?.message || e);
          return false;
        });
      }
      console.log("[admin-clients] created", leadId, leadCode);
      res.json({ success: true, leadId, leadCode, welcomeSent });
    } catch (e) {
      console.error("[admin-clients]", e?.status || "", e?.message || e);
      res.status(500).json({ success: false, message: "No se pudo crear el cliente" });
    }
  });
}

// server.ts
function httpsGetJson(url, timeoutMs = 4e3) {
  return new Promise((resolve, reject) => {
    const req = import_https.default.get(url, (res) => {
      let data = "";
      res.on("data", (c) => {
        data += c;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error("timeout")));
  });
}
var JWT_SECRET = process.env.JWT_SECRET;
var DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is required");
  process.exit(1);
}
if (!DASHBOARD_PASSWORD) {
  console.error("FATAL: DASHBOARD_PASSWORD environment variable is required");
  process.exit(1);
}
var PARTNER_API_KEY = process.env.PARTNER_API_KEY;
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token required" });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
}
async function startServer() {
  const app = (0, import_express6.default)();
  const PORT = Number(process.env.PORT) || 3e3;
  app.use((req, res, next) => {
    if (req.hostname === "www.colmedikal.com") {
      return res.redirect(301, "https://colmedikal.com" + req.originalUrl);
    }
    next();
  });
  app.use((0, import_helmet.default)({ contentSecurityPolicy: false }));
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "connect-src 'self' https://api.colmedikal.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://*.tile.openstreetmap.org",
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "frame-src 'self' blob: https://www.google.com https://maps.google.com https://www.openstreetmap.org",
        "media-src 'self' blob: data:",
        "worker-src 'self' blob:",
        "frame-ancestors 'none'",
        "object-src 'none'"
      ].join("; ")
    );
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });
  app.post("/api/auth/login", import_express6.default.json(), async (req, res) => {
    try {
      const { password } = req.body;
      if (!password || typeof password !== "string") {
        return res.status(400).json({ success: false, message: "Contrase\xF1a requerida" });
      }
      const passwordBuffer = Buffer.from(password);
      const correctBuffer = Buffer.from(DASHBOARD_PASSWORD);
      let isValid = false;
      if (passwordBuffer.length === correctBuffer.length) {
        try {
          isValid = import_crypto6.default.timingSafeEqual(passwordBuffer, correctBuffer);
        } catch {
          isValid = false;
        }
      }
      if (!isValid) {
        return res.status(401).json({ success: false, message: "Contrase\xF1a incorrecta" });
      }
      const token = import_jsonwebtoken.default.sign(
        { iat: Date.now(), type: "admin" },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ success: true, token });
    } catch (error) {
      console.error("[Auth Error]", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app.get("/api/auth/verify", verifyToken, (req, res) => {
    res.json({ success: true });
  });
  app.get("/api/forms", verifyToken, (req, res) => {
    res.json({ success: true, forms: [] });
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.get("/api/version", (req, res) => {
    try {
      const { execSync } = require("child_process");
      const metaRaw = import_fs5.default.readFileSync(import_path5.default.join(process.cwd(), "metadata.json"), "utf-8");
      const meta = JSON.parse(metaRaw);
      const deployVersion = meta.deployVersion || "1.0";
      const gitCommit = execSync("git rev-parse --short HEAD", { encoding: "utf-8", cwd: process.cwd() }).trim();
      const deployedAt = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
      res.json({
        version: `V${deployVersion}`,
        commit: gitCommit,
        deployedAt
      });
    } catch (error) {
      res.json({
        version: "V1.1",
        commit: "unknown",
        deployedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ")
      });
    }
  });
  app.post("/api/forms/submit", import_express6.default.json(), async (req, res) => {
    try {
      const { type, data } = req.body;
      if (!type || !["contact", "quote", "reimbursement"].includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid form type" });
      }
      if (!data || typeof data !== "object") {
        return res.status(400).json({ success: false, message: "Invalid form data" });
      }
      console.log(`[API] Formulario ${type} recibido`);
      res.json({
        success: true,
        message: `Formulario ${type} procesado correctamente`
      });
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  const API_ADMIN_EMAIL = process.env.API_ADMIN_EMAIL;
  const API_ADMIN_PASSWORD = process.env.API_ADMIN_PASSWORD;
  const normId = (s) => typeof s === "string" ? s.toLowerCase().replace(/\s/g, "").trim() : "";
  const httpsJson = (url, opts = {}) => new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = import_https.default.request(u, { method: opts.method || "GET", headers: opts.headers }, (res) => {
      let data = "";
      res.on("data", (c) => {
        data += c;
      });
      res.on("end", () => {
        const status = res.statusCode || 0;
        let json = null;
        try {
          json = data ? JSON.parse(data) : null;
        } catch {
        }
        if (status >= 200 && status < 300) resolve(json);
        else reject(Object.assign(new Error(`HTTP ${status}`), { status, json }));
      });
    });
    req.on("error", reject);
    req.setTimeout(opts.timeoutMs || 5e3, () => req.destroy(new Error("timeout")));
    if (opts.body) req.write(opts.body);
    req.end();
  });
  let apiToken = "";
  let apiTokenAt = 0;
  const getApiToken = async (force = false) => {
    if (!force && apiToken && Date.now() - apiTokenAt < 50 * 6e4) return apiToken;
    const r = await httpsJson("https://api.colmedikal.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: API_ADMIN_EMAIL, password: API_ADMIN_PASSWORD })
    });
    if (!r?.token) throw new Error("API admin login returned no token");
    apiToken = r.token;
    apiTokenAt = Date.now();
    return apiToken;
  };
  let leadsCache = [];
  let leadsCacheAt = 0;
  const getLeads = async (force = false) => {
    if (!force && Date.now() - leadsCacheAt < 2e4) return leadsCache;
    const fetchWith = async (tok) => httpsJson("https://api.colmedikal.com/api/admin/leads?limit=2000", { headers: { Authorization: `Bearer ${tok}` } });
    let r;
    try {
      r = await fetchWith(await getApiToken());
    } catch (e) {
      if (e?.status === 401 || e?.status === 403) r = await fetchWith(await getApiToken(true));
      else throw e;
    }
    leadsCache = Array.isArray(r?.data) ? r.data : [];
    leadsCacheAt = Date.now();
    return leadsCache;
  };
  const getLeadById = async (leadId) => {
    const fetchWith = async (tok) => httpsJson(`https://api.colmedikal.com/api/admin/leads/${leadId}`, { headers: { Authorization: `Bearer ${tok}` } });
    try {
      let r;
      try {
        r = await fetchWith(await getApiToken());
      } catch (e) {
        if (e?.status === 401 || e?.status === 403) r = await fetchWith(await getApiToken(true));
        else throw e;
      }
      const lead = r?.data ?? r;
      return lead && typeof lead === "object" && "id" in lead ? lead : null;
    } catch {
      return null;
    }
  };
  app.post("/api/leads/lookup", import_express6.default.json(), async (req, res) => {
    try {
      if (!API_ADMIN_EMAIL || !API_ADMIN_PASSWORD) {
        return res.json({ isDuplicate: false, codes: [], configured: false });
      }
      const nEmail = normId(req.body?.email), nPhone = normId(req.body?.phone), nDoc = normId(req.body?.docNumber);
      if (!nEmail && !nPhone && !nDoc) return res.json({ isDuplicate: false, codes: [] });
      const leads = await getLeads(true);
      const deleted = loadDeletedLeads();
      const codes = /* @__PURE__ */ new Set();
      let matched = false;
      for (const l of leads) {
        if (deleted[String(l.id)]) continue;
        let qd = l.quote_data ?? l.quoteData;
        if (typeof qd === "string") {
          try {
            qd = JSON.parse(qd);
          } catch {
            qd = {};
          }
        }
        qd = qd || {};
        const e = normId(qd.email), p = normId(qd.phone), d = normId(qd.docNumber);
        if (nEmail && e && e === nEmail || nPhone && p && p === nPhone || nDoc && d && d === nDoc) {
          matched = true;
          if (qd.leadCode) codes.add(qd.leadCode);
        }
      }
      res.json({ isDuplicate: matched, codes: Array.from(codes) });
    } catch (e) {
      console.error("[lead-lookup]", e);
      res.json({ isDuplicate: false, codes: [], configured: false });
    }
  });
  const PORTAL_HASH_ITERATIONS = 21e4;
  const PORTAL_HASH_KEYLEN = 32;
  const PORTAL_HASH_DIGEST = "sha256";
  const PORTAL_DATA_DIR = import_path5.default.join(process.cwd(), "data");
  const PORTAL_CREDS_FILE = import_path5.default.join(PORTAL_DATA_DIR, "portal-credentials.json");
  const PAYMENT_OVERRIDES_FILE = import_path5.default.join(PORTAL_DATA_DIR, "payment-status-overrides.json");
  function loadPaymentOverrides() {
    try {
      return JSON.parse(import_fs5.default.readFileSync(PAYMENT_OVERRIDES_FILE, "utf8"));
    } catch {
      return {};
    }
  }
  function savePaymentOverrides(store) {
    import_fs5.default.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
    import_fs5.default.writeFileSync(PAYMENT_OVERRIDES_FILE, JSON.stringify(store));
  }
  function loadPortalCreds() {
    try {
      return JSON.parse(import_fs5.default.readFileSync(PORTAL_CREDS_FILE, "utf8"));
    } catch {
      return {};
    }
  }
  function savePortalCreds(store) {
    import_fs5.default.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
    import_fs5.default.writeFileSync(PORTAL_CREDS_FILE, JSON.stringify(store));
  }
  const CLIENT_ADDRESS_FILE = import_path5.default.join(PORTAL_DATA_DIR, "client-address-overrides.json");
  function loadClientAddresses() {
    try {
      return JSON.parse(import_fs5.default.readFileSync(CLIENT_ADDRESS_FILE, "utf8"));
    } catch {
      return {};
    }
  }
  function saveClientAddresses(store) {
    import_fs5.default.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
    import_fs5.default.writeFileSync(CLIENT_ADDRESS_FILE, JSON.stringify(store));
  }
  const LEAD_PLAN_FILE = import_path5.default.join(PORTAL_DATA_DIR, "lead-plan-overrides.json");
  const PLAN_CATALOG = {
    inicio: { name: "Plan Inicio 2K", basePrice: 8 },
    proteccion: { name: "Plan Protecci\xF3n 3K", basePrice: 12 },
    plus: { name: "Plan Plus 5K", basePrice: 22 }
  };
  function loadLeadPlanOverrides() {
    try {
      return JSON.parse(import_fs5.default.readFileSync(LEAD_PLAN_FILE, "utf8"));
    } catch {
      return {};
    }
  }
  function saveLeadPlanOverrides(store) {
    import_fs5.default.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
    import_fs5.default.writeFileSync(LEAD_PLAN_FILE, JSON.stringify(store));
  }
  const CONTRACT_NUMBERS_FILE = import_path5.default.join(PORTAL_DATA_DIR, "client-contract-numbers.json");
  function loadContractNumbers() {
    try {
      return JSON.parse(import_fs5.default.readFileSync(CONTRACT_NUMBERS_FILE, "utf8"));
    } catch {
      return {};
    }
  }
  function saveContractNumbers(store) {
    import_fs5.default.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
    import_fs5.default.writeFileSync(CONTRACT_NUMBERS_FILE, JSON.stringify(store));
  }
  const DELETED_LEADS_FILE = import_path5.default.join(PORTAL_DATA_DIR, "deleted-lead-ids.json");
  function loadDeletedLeads() {
    try {
      return JSON.parse(import_fs5.default.readFileSync(DELETED_LEADS_FILE, "utf8"));
    } catch {
      return {};
    }
  }
  function saveDeletedLeads(store) {
    import_fs5.default.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
    import_fs5.default.writeFileSync(DELETED_LEADS_FILE, JSON.stringify(store));
  }
  function hashPortalPassword(password, saltHex) {
    const salt = saltHex || import_crypto6.default.randomBytes(16).toString("hex");
    const hash = import_crypto6.default.pbkdf2Sync(password, salt, PORTAL_HASH_ITERATIONS, PORTAL_HASH_KEYLEN, PORTAL_HASH_DIGEST).toString("hex");
    return { hash, salt };
  }
  function verifyPortalPassword(password, storedHashHex, saltHex) {
    try {
      const candidate = import_crypto6.default.pbkdf2Sync(password, saltHex, PORTAL_HASH_ITERATIONS, PORTAL_HASH_KEYLEN, PORTAL_HASH_DIGEST);
      const stored = Buffer.from(storedHashHex, "hex");
      if (candidate.length !== stored.length) return false;
      return import_crypto6.default.timingSafeEqual(candidate, stored);
    } catch {
      return false;
    }
  }
  function verifyPortalToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Token requerido" });
    try {
      const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
      if (decoded?.type !== "portal" || !decoded?.leadId) {
        return res.status(403).json({ success: false, message: "Token inv\xE1lido" });
      }
      req.leadId = decoded.leadId;
      next();
    } catch {
      return res.status(403).json({ success: false, message: "Token inv\xE1lido o expirado" });
    }
  }
  const loginAttempts = /* @__PURE__ */ new Map();
  const LOGIN_MAX_ATTEMPTS = 5;
  const LOGIN_LOCKOUT_MS = 15 * 6e4;
  const genericCaches = {
    refunds: { data: [], at: 0 },
    authorizations: { data: [], at: 0 },
    appointments: { data: [], at: 0 }
  };
  const getAdminList = async (resource) => {
    const cache = genericCaches[resource];
    if (Date.now() - cache.at < 2e4) return cache.data;
    const fetchWith = async (tok) => httpsJson(`https://api.colmedikal.com/api/admin/${resource}?limit=2000`, { headers: { Authorization: `Bearer ${tok}` } });
    let r;
    try {
      r = await fetchWith(await getApiToken());
    } catch (e) {
      if (e?.status === 401 || e?.status === 403) r = await fetchWith(await getApiToken(true));
      else throw e;
    }
    cache.data = Array.isArray(r?.data) ? r.data : [];
    cache.at = Date.now();
    return cache.data;
  };
  const parseQuoteData = (l) => {
    let qd = l.quote_data ?? l.quoteData;
    if (typeof qd === "string") {
      try {
        qd = JSON.parse(qd);
      } catch {
        qd = {};
      }
    }
    return qd || {};
  };
  registerCrmRoutes(app, { dataDir: PORTAL_DATA_DIR, httpsJson, loadPortalCreds });
  const commercialEmails = async () => {
    const r = await httpsJson("https://api.colmedikal.com/api/admin/users", { headers: { Authorization: `Bearer ${await getApiToken()}` } });
    return (r?.data || []).filter((u) => u.role === "Equipo Comercial" && u.active).map((u) => String(u.email));
  };
  registerClaimRoutes(app, {
    dataDir: PORTAL_DATA_DIR,
    verifyPortalToken,
    requireAdmin: makeRequireAdmin(httpsJson),
    commercialEmails,
    leadExists: async (leadId) => !!(await getLeadById(leadId) || (await getLeads()).find((l) => String(l.id) === leadId))
  });
  startSlaTimer(commercialEmails);
  registerAdminAccessRoutes(app, { dataDir: PORTAL_DATA_DIR, httpsJson, getApiToken, serviceEmail: API_ADMIN_EMAIL });
  const portalPw = registerPortalPasswordRoutes(app, {
    dataDir: PORTAL_DATA_DIR,
    verifyPortalToken,
    loadPortalCreds,
    savePortalCreds,
    hashPortalPassword,
    verifyPortalPassword,
    getContact: async (leadId) => {
      const lead = await getLeadById(leadId) || (await getLeads()).find((l) => String(l.id) === leadId);
      if (!lead) {
        console.warn("[portal-contact] lead not found in API", leadId);
        return null;
      }
      const qd = parseQuoteData(lead);
      if (!qd.email) console.warn("[portal-contact] lead has no quote_data.email", leadId, "keys:", Object.keys(qd).join(","));
      return { email: String(qd.email || ""), fullName: String(qd.fullName || "") };
    },
    findLegacyAccount: async (doc) => {
      const leads = await getLeads(true).catch(() => []);
      const hit = leads.map((l) => ({ l, qd: parseQuoteData(l) })).filter(({ qd }) => normId(qd.docNumber) === doc && qd.portalPasswordHash && qd.portalPasswordSalt).sort((a, b) => new Date(b.l.timestamp || 0).getTime() - new Date(a.l.timestamp || 0).getTime())[0];
      return hit ? { leadId: String(hit.l.id), hash: hit.qd.portalPasswordHash, salt: hit.qd.portalPasswordSalt } : null;
    }
  });
  registerClientRoutes(app, { requireAdmin: makeRequireAdmin(httpsJson), httpsJson, getLeads, parseQuoteData, sendWelcome: portalPw.sendWelcome });
  app.post("/api/portal/login", import_express6.default.json(), async (req, res) => {
    try {
      if (!API_ADMIN_EMAIL || !API_ADMIN_PASSWORD) {
        return res.status(503).json({ success: false, message: "Portal no disponible por el momento" });
      }
      const docNumber = normId(req.body?.docNumber);
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (!docNumber || !password) {
        return res.status(400).json({ success: false, message: "C\xE9dula y contrase\xF1a son requeridas" });
      }
      const now2 = Date.now();
      const attempt = loginAttempts.get(docNumber);
      if (attempt && attempt.lockUntil > now2) {
        return res.status(429).json({ success: false, message: "Demasiados intentos. Intenta de nuevo en unos minutos." });
      }
      const credsStore = loadPortalCreds();
      let matchedLeadId = null;
      const deletedLeads = loadDeletedLeads();
      const credEntries = Object.entries(credsStore).filter(([leadId, cred]) => cred.docNumber === docNumber && !deletedLeads[leadId]).sort(([, x], [, y]) => (y.updatedAt || 0) - (x.updatedAt || 0));
      for (const [leadId, cred] of credEntries) {
        if (verifyPortalPassword(password, cred.hash, cred.salt)) {
          matchedLeadId = leadId;
          break;
        }
      }
      if (!matchedLeadId) {
        const leads = await getLeads(true).catch(() => []);
        const candidates = leads.map((l) => ({ l, qd: parseQuoteData(l) })).filter(({ l, qd }) => !credsStore[String(l.id)] && normId(qd.docNumber) === docNumber && qd.portalPasswordHash && qd.portalPasswordSalt).sort((a, b) => new Date(b.l.timestamp || 0).getTime() - new Date(a.l.timestamp || 0).getTime());
        const match = candidates.find(({ qd }) => verifyPortalPassword(password, qd.portalPasswordHash, qd.portalPasswordSalt));
        if (match) {
          matchedLeadId = String(match.l.id);
          credsStore[matchedLeadId] = { docNumber, hash: match.qd.portalPasswordHash, salt: match.qd.portalPasswordSalt, updatedAt: Date.now() };
          savePortalCreds(credsStore);
        }
      }
      if (!matchedLeadId) {
        const next = { count: (attempt?.count || 0) + 1, lockUntil: 0 };
        if (next.count >= LOGIN_MAX_ATTEMPTS) next.lockUntil = now2 + LOGIN_LOCKOUT_MS;
        loginAttempts.set(docNumber, next);
        return res.status(401).json({ success: false, message: "C\xE9dula o contrase\xF1a incorrecta" });
      }
      loginAttempts.delete(docNumber);
      recordPortalLogin(matchedLeadId);
      const token = import_jsonwebtoken.default.sign({ type: "portal", leadId: matchedLeadId, iat: Date.now() }, JWT_SECRET, { expiresIn: "4h" });
      res.json({ success: true, token });
    } catch (e) {
      console.error("[portal-login]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.get("/api/portal/me", verifyPortalToken, async (req, res) => {
    try {
      const leadId = req.leadId;
      let lead = await getLeadById(String(leadId));
      if (!lead) {
        const leads = await getLeads();
        lead = leads.find((l) => String(l.id) === String(leadId));
      }
      if (!lead) return res.status(404).json({ success: false, message: "Cliente no encontrado" });
      const qd = parseQuoteData(lead);
      const paymentOverride = loadPaymentOverrides()[String(leadId)];
      const addressOverride = loadClientAddresses()[String(leadId)];
      const planOverride = loadLeadPlanOverrides()[String(leadId)];
      const contractNumber = loadContractNumbers()[String(leadId)]?.contractNumber || "";
      const addressComplete = !!(addressOverride?.province && addressOverride?.city && addressOverride?.address1 && addressOverride?.postalCode);
      res.json({
        success: true,
        data: {
          fullName: qd.fullName || "",
          docType: qd.docType || "cedula",
          docNumber: qd.docNumber || "",
          contractNumber,
          email: qd.email || "",
          phone: qd.phone || "",
          address: {
            province: addressOverride?.province || qd.province || "",
            city: addressOverride?.city || "",
            address1: addressOverride?.address1 || "",
            address2: addressOverride?.address2 || "",
            postalCode: addressOverride?.postalCode || ""
          },
          addressComplete,
          leadCode: qd.leadCode || "",
          // planOverride is authoritative here — it's what an admin's "Cambiar
          // Plan" action and a customer's own plan pick both write, neither of
          // which reliably persists into qd via the external API's PUT.
          selectedPlanName: planOverride?.selectedPlanName || qd.selectedPlanName || "",
          basePlanId: planOverride?.basePlanId || qd.basePlanId || "",
          type: qd.type || "individual",
          childrenCount: qd.childrenCount || 0,
          childrenAges: qd.childrenAges || [],
          estimatedPrice: planOverride?.estimatedPrice ?? Number(lead.estimated_price ?? lead.estimatedPrice ?? 0),
          paymentStatus: paymentOverride?.paymentStatus || qd.paymentStatus || "Pendiente",
          status: lead.status || "Cierre Efectivo",
          clientSince: lead.timestamp || lead.created_at || ""
        }
      });
    } catch (e) {
      console.error("[portal-me]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.get("/api/portal/dashboard", verifyPortalToken, async (req, res) => {
    try {
      const leadId = req.leadId;
      let lead = await getLeadById(String(leadId));
      if (!lead) {
        const leads = await getLeads();
        lead = leads.find((l) => String(l.id) === String(leadId));
      }
      if (!lead) return res.status(404).json({ success: false, message: "Cliente no encontrado" });
      const qd = parseQuoteData(lead);
      const email = normId(qd.email), phone = normId(qd.phone);
      const [refundsRaw, authsRaw, aptsRaw] = await Promise.all([
        getAdminList("refunds"),
        getAdminList("authorizations"),
        getAdminList("appointments")
      ]);
      const hidden = new Set(loadLegacyHidden());
      const mine = (r) => !hidden.has(String(r.id)) && (email && normId(r.user_email) === email || phone && normId(r.user_phone) === phone);
      res.json({
        success: true,
        data: {
          refunds: refundsRaw.filter(mine).map((r) => ({
            id: r.id,
            familyMember: r.family_member || "",
            specialty: r.specialty || "",
            amount: Number(r.amount || 0),
            refundDate: r.refund_date ? String(r.refund_date).split("T")[0] : "",
            status: r.status || "Procesando",
            invoiceNumber: r.invoice_number || "",
            adminComment: r.admin_comment || void 0
          })),
          authorizations: authsRaw.filter(mine).map((a) => ({
            id: a.id,
            patient: a.patient || "",
            procedure: a.procedure || "",
            facility: a.facility || "",
            requestDate: a.request_date || a.requestDate || "",
            status: a.status || "Pendiente",
            adminComment: a.admin_comment || a.adminComment
          })),
          appointments: aptsRaw.filter(
            (a) => phone && normId(a.patient_phone) === phone
          ).map((a) => ({
            id: a.id,
            doctorName: a.doctor_name || "Por Asignar",
            specialty: a.specialty || "",
            aptDate: a.appointment_date ? String(a.appointment_date).split("T")[0] : "",
            aptTime: a.appointment_time || "",
            modality: a.modality || "presencial",
            clinic: a.clinic || "",
            city: a.city || "",
            status: a.status || "Pendiente"
          }))
        }
      });
    } catch (e) {
      console.error("[portal-dashboard]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.post("/api/portal/set-password", import_express6.default.json(), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(" ")[1];
      if (!callerToken) return res.status(401).json({ success: false, message: "Token de administrador requerido" });
      const leadId = req.body?.leadId;
      const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
      if (!leadId || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Datos inv\xE1lidos (m\xEDnimo 6 caracteres)" });
      }
      let current;
      try {
        current = await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=2000`, {
          headers: { Authorization: `Bearer ${callerToken}` }
        });
      } catch (e) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: "No autorizado" });
      }
      const lead = (current?.data || []).find((l) => String(l.id) === String(leadId));
      if (!lead) return res.status(404).json({ success: false, message: "Cliente no encontrado" });
      const qd = parseQuoteData(lead);
      const docNumber = normId(qd.docNumber);
      if (!docNumber) return res.status(400).json({ success: false, message: "Este lead no tiene c\xE9dula registrada" });
      const { hash, salt } = hashPortalPassword(newPassword);
      const store = loadPortalCreds();
      const hadPassword = !!store[String(leadId)];
      store[String(leadId)] = { docNumber, hash, salt, updatedAt: Date.now() };
      savePortalCreds(store);
      logActivity(String(leadId), "sistema", hadPassword ? "Contrase\xF1a del portal restablecida" : "Acceso al portal de clientes creado", typeof req.body?.by === "string" ? req.body.by.slice(0, 80) : "Admin");
      try {
        const mergedQuote = { ...qd, portalPasswordHash: hash, portalPasswordSalt: salt };
        await httpsJson(`https://api.colmedikal.com/api/admin/leads/${leadId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${callerToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ quote_data: mergedQuote })
        });
      } catch (e) {
        console.warn("[portal-set-password] external API mirror failed (non-fatal):", e);
      }
      res.json({ success: true });
    } catch (e) {
      console.error("[portal-set-password]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.post("/api/admin/set-payment-status", import_express6.default.json(), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(" ")[1];
      if (!callerToken) return res.status(401).json({ success: false, message: "Token de administrador requerido" });
      const leadId = req.body?.leadId;
      const paymentStatus = req.body?.paymentStatus;
      if (!leadId || !["Pagado", "Pendiente", "Atrasado"].includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: "Datos inv\xE1lidos" });
      }
      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` }
        });
      } catch (e) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: "No autorizado" });
      }
      const store = loadPaymentOverrides();
      store[String(leadId)] = { paymentStatus, updatedAt: Date.now() };
      savePaymentOverrides(store);
      res.json({ success: true });
    } catch (e) {
      console.error("[admin-set-payment-status]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.post("/api/portal/address", verifyPortalToken, import_express6.default.json(), async (req, res) => {
    try {
      const leadId = req.leadId;
      const str4 = (v, max) => typeof v === "string" ? v.trim().slice(0, max) : "";
      const province = str4(req.body?.province, 100);
      const city = str4(req.body?.city, 100);
      const address1 = str4(req.body?.address1, 200);
      const address2 = str4(req.body?.address2, 200);
      const postalCode = str4(req.body?.postalCode, 20);
      if (!province || !city || !address1 || !postalCode) {
        return res.status(400).json({ success: false, message: "Provincia, ciudad, Direcci\xF3n 1 y c\xF3digo postal son obligatorios" });
      }
      const store = loadClientAddresses();
      store[String(leadId)] = { province, city, address1, address2, postalCode, updatedAt: Date.now() };
      saveClientAddresses(store);
      res.json({ success: true, address: { province, city, address1, address2, postalCode } });
    } catch (e) {
      console.error("[portal-address]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.get("/api/admin/client-addresses", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(" ")[1];
      if (!callerToken) return res.status(401).json({ success: false, message: "Token de administrador requerido" });
      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` }
        });
      } catch (e) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: "No autorizado" });
      }
      const store = loadClientAddresses();
      const data = {};
      for (const [leadId, v] of Object.entries(store)) {
        data[leadId] = { province: v.province, city: v.city, address1: v.address1, address2: v.address2, postalCode: v.postalCode };
      }
      res.json({ success: true, data });
    } catch (e) {
      console.error("[admin-client-addresses]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.post("/api/leads/plan-override", import_express6.default.json(), async (req, res) => {
    try {
      const leadId = req.body?.leadId;
      const selectedPlanName = typeof req.body?.selectedPlanName === "string" ? req.body.selectedPlanName.trim().slice(0, 200) : "";
      const basePlanId = typeof req.body?.basePlanId === "string" ? req.body.basePlanId.trim().slice(0, 50) : void 0;
      const estimatedPrice = Number(req.body?.estimatedPrice);
      if (!leadId || !selectedPlanName) return res.status(400).json({ success: false, message: "Datos inv\xE1lidos" });
      const email = normId(req.body?.email), phone = normId(req.body?.phone), docNumber = normId(req.body?.docNumber);
      const leads = await getLeads();
      const lead = leads.find((l) => String(l.id) === String(leadId));
      if (!lead) return res.status(404).json({ success: false, message: "No encontrado" });
      const qd = parseQuoteData(lead);
      const owns = email && normId(qd.email) === email || phone && normId(qd.phone) === phone || docNumber && normId(qd.docNumber) === docNumber;
      if (!owns) return res.status(403).json({ success: false, message: "No autorizado" });
      const store = loadLeadPlanOverrides();
      store[String(leadId)] = { ...store[String(leadId)], selectedPlanName, basePlanId, estimatedPrice: Number.isFinite(estimatedPrice) ? estimatedPrice : void 0, updatedAt: Date.now() };
      saveLeadPlanOverrides(store);
      res.json({ success: true });
    } catch (e) {
      console.error("[leads-plan-override]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  const LEAD_MAIL_FILE = import_path5.default.join(PORTAL_DATA_DIR, "lead-mail-sent.json");
  let leadsRefresh = null;
  const refreshLeadsShared = () => leadsRefresh ||= getLeads(true).finally(() => {
    leadsRefresh = null;
  });
  const pdfFor = (d) => {
    try {
      const a = quotePdfAttachment(d);
      return a ? [a] : [];
    } catch (e) {
      console.error("[lead-pdf]", d.code, e);
      return [];
    }
  };
  const leadMailData = (lead) => {
    const qd = parseQuoteData(lead);
    const ov = loadLeadPlanOverrides()[String(lead.id)];
    return {
      code: String(qd.leadCode || lead.id),
      fullName: String(qd.fullName || ""),
      email: String(qd.email || ""),
      phone: String(qd.phone || ""),
      docNumber: qd.docNumber,
      birthDate: qd.birthDate,
      province: qd.province,
      members: 1 + (Number(qd.childrenCount) || 0),
      plan: ov?.selectedPlanName || qd.selectedPlanName || "",
      planId: ov?.basePlanId || qd.basePlanId || void 0,
      docType: qd.docType,
      childrenAges: Array.isArray(qd.childrenAges) ? qd.childrenAges.map(Number).filter(Number.isFinite) : [],
      price: Number(ov?.estimatedPrice ?? lead.estimated_price ?? lead.estimatedPrice) || 0,
      source: qd.source,
      createdAt: lead.created_at || lead.timestamp
    };
  };
  app.post("/api/leads/notify", import_express6.default.json(), async (req, res) => {
    try {
      if (!mailer) return res.json({ success: false, configured: false });
      const code = typeof req.body?.leadCode === "string" ? req.body.leadCode.trim() : "";
      if (!/^COT-\d{6}$/.test(code)) return res.status(400).json({ success: false, message: "C\xF3digo inv\xE1lido" });
      const deleted = loadDeletedLeads();
      const find = (list) => list.find((l) => !deleted[String(l.id)] && parseQuoteData(l).leadCode === code);
      let lead = find(await getLeads());
      for (let i = 0; !lead && i < 2; i++) {
        if (i) await new Promise((r) => setTimeout(r, 2e3));
        lead = find(await refreshLeadsShared());
      }
      if (!lead) {
        console.error(`[lead-notify] ${code}: lead no encontrado en la API`);
        return res.status(404).json({ success: false, message: "No encontrado" });
      }
      const d = leadMailData(lead);
      const { plan } = d;
      let sent = {};
      try {
        sent = JSON.parse(import_fs5.default.readFileSync(LEAD_MAIL_FILE, "utf8"));
      } catch {
      }
      const key = `${code}|${plan}`;
      if (sent[key]) return res.json({ success: true, skipped: true });
      const isNew = !Object.keys(sent).some((k) => k.startsWith(code + "|"));
      sent[key] = Date.now();
      import_fs5.default.mkdirSync(PORTAL_DATA_DIR, { recursive: true });
      import_fs5.default.writeFileSync(LEAD_MAIL_FILE, JSON.stringify(sent));
      const client = clientMail(d);
      const team = teamMail(d, isNew);
      const results = await Promise.allSettled([
        /\S+@\S+\.\S+/.test(d.email) ? mailer.sendMail({ from: MAIL_FROM, to: d.email, replyTo: LEAD_NOTIFY_TO, ...client, attachments: pdfFor(d) }) : Promise.reject(new Error("lead sin email v\xE1lido")),
        LEAD_NOTIFY_TO.length ? mailer.sendMail({ from: MAIL_FROM, to: LEAD_NOTIFY_TO, replyTo: d.email || void 0, ...team }) : Promise.reject(new Error("LEAD_NOTIFY_TO vac\xEDo"))
      ]);
      results.forEach((r, i) => {
        if (r.status === "rejected") console.error(`[lead-notify] ${i ? "team" : "client"} ${code}:`, r.reason?.message || r.reason);
      });
      if (results.every((r) => r.status === "rejected")) {
        delete sent[key];
        import_fs5.default.writeFileSync(LEAD_MAIL_FILE, JSON.stringify(sent));
        return res.status(502).json({ success: false, message: "No se pudo enviar" });
      }
      if (results[0].status === "fulfilled") logActivity(String(lead.id), "email", `Cotizaci\xF3n enviada autom\xE1ticamente a ${d.email}${plan ? ` (${plan})` : ""}`);
      res.json({ success: true, client: results[0].status === "fulfilled", team: results[1].status === "fulfilled" });
    } catch (e) {
      console.error("[lead-notify]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.post("/api/admin/send-quote-email", import_express6.default.json(), async (req, res) => {
    try {
      const callerToken = req.headers.authorization?.split(" ")[1];
      if (!callerToken) return res.status(401).json({ success: false, message: "Token de administrador requerido" });
      try {
        await httpsJson("https://api.colmedikal.com/api/admin/leads?limit=1", { headers: { Authorization: `Bearer ${callerToken}` } });
      } catch (e) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: "No autorizado" });
      }
      if (!mailer) return res.status(503).json({ success: false, message: "Correo no configurado en el servidor (SMTP)" });
      const leadId = String(req.body?.leadId || "");
      const lead = leadId && await getLeadById(leadId) || (await getLeads(true)).find((l) => String(l.id) === leadId);
      if (!lead) return res.status(404).json({ success: false, message: "Lead no encontrado" });
      const d = leadMailData(lead);
      if (!/\S+@\S+\.\S+/.test(d.email)) return res.status(400).json({ success: false, message: "El lead no tiene un correo v\xE1lido" });
      await mailer.sendMail({ from: MAIL_FROM, to: d.email, replyTo: LEAD_NOTIFY_TO, ...clientMail(d), attachments: pdfFor(d) });
      logActivity(String(lead.id), "email", `Cotizaci\xF3n enviada a ${d.email}${d.plan ? ` (${d.plan})` : ""}`, typeof req.body?.by === "string" ? req.body.by.slice(0, 80) : "Admin");
      res.json({ success: true, to: d.email });
    } catch (e) {
      console.error("[admin-send-quote-email]", e?.message || e);
      res.status(502).json({ success: false, message: "No se pudo enviar el correo" });
    }
  });
  app.post("/api/admin/set-lead-plan", import_express6.default.json(), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(" ")[1];
      if (!callerToken) return res.status(401).json({ success: false, message: "Token de administrador requerido" });
      const leadId = req.body?.leadId;
      const basePlanId = req.body?.basePlanId;
      const plan = PLAN_CATALOG[basePlanId];
      if (!leadId || !plan) return res.status(400).json({ success: false, message: "Plan inv\xE1lido" });
      const customPrice = Number(req.body?.estimatedPrice);
      const estimatedPrice = Number.isFinite(customPrice) && customPrice > 0 ? customPrice : plan.basePrice;
      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` }
        });
      } catch (e) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: "No autorizado" });
      }
      const store = loadLeadPlanOverrides();
      store[String(leadId)] = {
        ...store[String(leadId)],
        selectedPlanName: `${plan.name} \u2014 $${plan.basePrice}/mes`,
        basePlanId,
        estimatedPrice,
        updatedAt: Date.now()
      };
      saveLeadPlanOverrides(store);
      res.json({ success: true });
    } catch (e) {
      console.error("[admin-set-lead-plan]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.post("/api/admin/set-contract-number", import_express6.default.json(), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(" ")[1];
      if (!callerToken) return res.status(401).json({ success: false, message: "Token de administrador requerido" });
      const leadId = req.body?.leadId;
      const contractNumber = typeof req.body?.contractNumber === "string" ? req.body.contractNumber.trim().slice(0, 100) : "";
      if (!leadId || !contractNumber) return res.status(400).json({ success: false, message: "Datos inv\xE1lidos" });
      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` }
        });
      } catch (e) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: "No autorizado" });
      }
      const store = loadContractNumbers();
      store[String(leadId)] = { contractNumber, updatedAt: Date.now() };
      saveContractNumbers(store);
      res.json({ success: true });
    } catch (e) {
      console.error("[admin-set-contract-number]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.get("/api/admin/lead-overrides", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(" ")[1];
      if (!callerToken) return res.status(401).json({ success: false, message: "Token de administrador requerido" });
      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` }
        });
      } catch (e) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: "No autorizado" });
      }
      const planStore = loadLeadPlanOverrides();
      const contractStore = loadContractNumbers();
      const leadIds = /* @__PURE__ */ new Set([...Object.keys(planStore), ...Object.keys(contractStore)]);
      const data = {};
      for (const leadId of leadIds) {
        data[leadId] = {
          selectedPlanName: planStore[leadId]?.selectedPlanName,
          basePlanId: planStore[leadId]?.basePlanId,
          estimatedPrice: planStore[leadId]?.estimatedPrice,
          contractNumber: contractStore[leadId]?.contractNumber
        };
      }
      res.json({ success: true, data });
    } catch (e) {
      console.error("[admin-lead-overrides]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.post("/api/admin/delete-lead", import_express6.default.json(), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(" ")[1];
      if (!callerToken) return res.status(401).json({ success: false, message: "Token de administrador requerido" });
      const leadId = req.body?.leadId;
      if (!leadId) return res.status(400).json({ success: false, message: "Datos inv\xE1lidos" });
      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` }
        });
      } catch (e) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: "No autorizado" });
      }
      const store = loadDeletedLeads();
      store[String(leadId)] = Date.now();
      saveDeletedLeads(store);
      res.json({ success: true });
    } catch (e) {
      console.error("[admin-delete-lead]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  app.get("/api/admin/deleted-leads", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const callerToken = authHeader && authHeader.split(" ")[1];
      if (!callerToken) return res.status(401).json({ success: false, message: "Token de administrador requerido" });
      try {
        await httpsJson(`https://api.colmedikal.com/api/admin/leads?limit=1`, {
          headers: { Authorization: `Bearer ${callerToken}` }
        });
      } catch (e) {
        return res.status(e?.status === 401 || e?.status === 403 ? 403 : 502).json({ success: false, message: "No autorizado" });
      }
      res.json({ success: true, data: Object.keys(loadDeletedLeads()) });
    } catch (e) {
      console.error("[admin-deleted-leads]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  function verifyPartnerApiKey(req, res, next) {
    if (!PARTNER_API_KEY) return res.status(503).json({ success: false, message: "Integraci\xF3n no configurada" });
    const authHeader = req.headers.authorization;
    const provided = authHeader && authHeader.split(" ")[1];
    if (!provided) return res.status(401).json({ success: false, message: "API key requerida" });
    const a = Buffer.from(provided);
    const b = Buffer.from(PARTNER_API_KEY);
    if (a.length !== b.length || !import_crypto6.default.timingSafeEqual(a, b)) {
      return res.status(403).json({ success: false, message: "API key inv\xE1lida" });
    }
    next();
  }
  app.get("/api/partner/pending-payments", verifyPartnerApiKey, async (req, res) => {
    try {
      const leads = await getLeads();
      const paymentOverrides = loadPaymentOverrides();
      const deleted = loadDeletedLeads();
      const data = leads.filter((l) => !deleted[String(l.id)] && l.status === "Cierre Efectivo").map((l) => {
        const qd = parseQuoteData(l);
        const paymentStatus = paymentOverrides[String(l.id)]?.paymentStatus || qd.paymentStatus || "Pendiente";
        return { l, qd, paymentStatus };
      }).filter(({ paymentStatus }) => paymentStatus === "Pendiente" || paymentStatus === "Atrasado").map(({ l, qd }) => ({
        reference: qd.leadCode || String(l.id),
        fullName: qd.fullName || "",
        email: qd.email || "",
        phone: qd.phone || "",
        docNumber: qd.docNumber || "",
        amount: Number(l.estimated_price ?? l.estimatedPrice ?? 0)
      }));
      res.json({ success: true, data });
    } catch (e) {
      console.error("[partner-pending-payments]", e);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  });
  const distPath = import_path5.default.join(process.cwd(), "dist");
  const hasDist = import_fs5.default.existsSync(import_path5.default.join(distPath, "index.html"));
  const isProd = process.env.NODE_ENV === "production" || hasDist;
  if (!isProd) {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(import_express6.default.static(distPath, { index: false }));
    const routes = {
      "/": {
        title: "Colmedikal | Medicina Prepagada en Ecuador \u2014 Planes Familia e Individual",
        description: "Planes de medicina prepagada en Ecuador desde $8/mes. Acceso directo a especialistas y clinicas privadas.",
        keywords: "medicina prepagada Ecuador, seguro m\xE9dico privado, plan m\xE9dico familia, Colmedikal",
        og_image: "https://colmedikal.com/og-image.jpg"
      },
      "/servicios": {
        title: "Servicios de Medicina Prepagada | Colmedikal Ecuador",
        description: "Servicios Colmedikal: hospitalizacion, cirugias, maternidad y atencion ambulatoria. Planes desde $8/mes.",
        keywords: "servicios medicina prepagada, hospitalizaci\xF3n privada Ecuador, maternidad prepagada",
        og_image: "https://colmedikal.com/og-image.jpg"
      },
      "/directorio": {
        title: "Directorio de M\xE9dicos Especialistas y Cl\xEDnicas | Colmedikal Ecuador",
        description: "Directorio de medicos especialistas y clinicas en Ecuador. Profesionales en Quito, Guayaquil y todo el pais.",
        keywords: "m\xE9dicos especialistas Ecuador, directorio m\xE9dico Quito, cl\xEDnicas privadas Ecuador",
        og_image: "https://colmedikal.com/og-image.jpg"
      },
      "/nosotros": {
        title: "Sobre Colmedikal | Medicina Prepagada con Respaldo Real en Ecuador",
        description: "Conoce al equipo de Colmedikal: nuestra misi\xF3n, valores y el compromiso con la salud de las familias ecuatorianas.",
        keywords: "Colmedikal Ecuador, empresa medicina prepagada, seguro m\xE9dico privado",
        og_image: "https://colmedikal.com/og-image.jpg"
      },
      "/cotizador": {
        title: "Cotiza tu Plan de Medicina Prepagada | Colmedikal Ecuador",
        description: "Cotiza tu plan de medicina prepagada en linea. Precios segun edad y cobertura, sin compromisos.",
        keywords: "cotizar medicina prepagada Ecuador, precio plan m\xE9dico familiar, cotizador seguro salud",
        og_image: "https://colmedikal.com/og-image.jpg"
      },
      "/tramites": {
        title: "Tr\xE1mites en L\xEDnea | Portal de Afiliados Colmedikal",
        description: "Gestiona tus tr\xE1mites de medicina prepagada en l\xEDnea: solicitudes de reembolso, autorizaciones m\xE9dicas y m\xE1s.",
        keywords: "tr\xE1mites medicina prepagada, reembolso m\xE9dico Ecuador, portal afiliados",
        og_image: "https://colmedikal.com/og-image.jpg"
      },
      "/agendamiento": {
        title: "Agendamiento de Citas M\xE9dicas | Colmedikal Ecuador",
        description: "Agenda tu cita m\xE9dica con especialistas de Colmedikal. Atenci\xF3n presencial y telemedicina disponibles.",
        keywords: "agendar cita m\xE9dica Ecuador, telemedicina prepagada, consulta m\xE9dica online",
        og_image: "https://colmedikal.com/og-image.jpg"
      },
      "/faqs": {
        title: "Preguntas Frecuentes sobre Medicina Prepagada | Colmedikal",
        description: "Resolvemos tus dudas sobre medicina prepagada: carencias, copagos, reembolsos y preexistencias.",
        keywords: "preguntas medicina prepagada, diferencia IESS seguro privado, c\xF3mo funciona prepagada",
        og_image: "https://colmedikal.com/og-image.jpg"
      },
      "/contacto": {
        title: "Contacto | Colmedikal Ecuador \u2014 Asesores de Medicina Prepagada",
        description: "Contacta a Colmedikal: asesoria sobre planes de salud. WhatsApp, email y atencion presencial.",
        keywords: "contacto Colmedikal, asesor medicina prepagada Ecuador, WhatsApp salud",
        og_image: "https://colmedikal.com/og-image.jpg"
      },
      "/blog": {
        title: "Blog M\xE9dico y Gu\xEDa de Bienestar | Colmedikal Ecuador",
        description: "Art\xEDculos sobre medicina prepagada, prevenci\xF3n y salud en Ecuador escritos por especialistas de Colmedikal.",
        keywords: "blog salud Ecuador, art\xEDculos medicina prepagada, gu\xEDa bienestar",
        og_image: "https://colmedikal.com/og-image.jpg"
      },
      "/blog-detalle": {
        title: "Blog | Colmedikal Ecuador",
        description: "Lee este art\xEDculo del blog m\xE9dico de Colmedikal Ecuador.",
        keywords: "blog salud Ecuador, Colmedikal",
        og_image: "https://colmedikal.com/og-image.jpg"
      }
    };
    const esc2 = (s) => String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const API_BASE_URL = "https://api.colmedikal.com";
    let overrideCache = {};
    let ga4IdCache = "";
    let overrideCacheAt = 0;
    let lastOvErr = "none";
    const getOverrides = async () => {
      if (Date.now() - overrideCacheAt < 6e4) return overrideCache;
      try {
        const json = await httpsGetJson(`${API_BASE_URL}/api/public/settings`);
        const data = json?.data || {};
        const next = {};
        for (const [k, v] of Object.entries(data)) {
          if (k.startsWith("meta_")) {
            try {
              next[k.slice(5)] = JSON.parse(v);
            } catch {
            }
          }
        }
        overrideCache = next;
        ga4IdCache = /^[A-Za-z0-9_-]{1,40}$/.test(data.ga4_id || "") ? data.ga4_id : "";
        overrideCacheAt = Date.now();
        lastOvErr = `ok:${Object.keys(next).length}`;
      } catch (e) {
        const cause = e?.cause ? `|cause:${e.cause.code || e.cause.message || e.cause}` : "";
        lastOvErr = `${e?.name || "err"}:${e?.message || e}${cause}`.slice(0, 160);
      }
      return overrideCache;
    };
    app.get("/sitemap.xml", async (_req, res) => {
      const BASE = "https://colmedikal.com";
      const now2 = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const staticUrls = Object.keys(routes).filter((r) => r !== "/blog-detalle" && r !== "/cotizador").map((r) => `  <url><loc>${BASE}${r === "/" ? "" : r}</loc><lastmod>${now2}</lastmod><changefreq>${r === "/" ? "daily" : "weekly"}</changefreq><priority>${r === "/" ? "1.0" : "0.8"}</priority></url>`);
      let blogUrls = [];
      try {
        const blogJson = await httpsGetJson("https://api.colmedikal.com/api/public/blog");
        const posts = blogJson?.data || [];
        blogUrls = posts.map((p) => {
          const slug = p.slug || p.id;
          return `  <url><loc>${BASE}/blog/${slug}</loc><lastmod>${now2}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`;
        });
      } catch {
      }
      const extraUrls = [
        `  <url><loc>${BASE}/mapa-red-medica</loc><lastmod>${now2}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
        `  <url><loc>${BASE}/privacy</loc><lastmod>${now2}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>`
      ];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...extraUrls, ...blogUrls].join("\n")}
</urlset>`;
      res.set("Content-Type", "application/xml; charset=UTF-8");
      res.send(xml);
    });
    let blogCache = [];
    let blogCacheAt = 0;
    const getBlogPosts = async () => {
      if (Date.now() - blogCacheAt < 3e5 && blogCache.length) return blogCache;
      try {
        const json = await httpsGetJson("https://api.colmedikal.com/api/public/blog");
        blogCache = json?.data || [];
        blogCacheAt = Date.now();
      } catch {
      }
      return blogCache;
    };
    app.get("*", async (req, res) => {
      const pathname = req.path.replace(/\/$/, "") || "/";
      const basePath = pathname.startsWith("/blog/") ? "/blog-detalle" : pathname;
      let base = routes[basePath] || routes["/"];
      if (pathname.startsWith("/blog/") && pathname !== "/blog") {
        const slug = pathname.replace("/blog/", "");
        if (slug) {
          const posts = await getBlogPosts();
          const post = posts.find((p) => p.slug === slug || p.id === slug);
          if (post) {
            base = {
              title: `${post.title} | Blog Colmedikal`,
              description: post.excerpt || post.description || base.description,
              keywords: (post.tags || []).join(", ") || base.keywords,
              og_image: post.image || base.og_image
            };
          }
        }
      }
      const noindexRoutes = ["/admin", "/seo-panel", "/power-seo"];
      const robotsContent = noindexRoutes.some((r) => pathname.startsWith(r)) ? "noindex, nofollow" : "index, follow";
      const overrides = await getOverrides();
      const ov = overrides[pathname] || overrides[basePath] || {};
      const meta = {
        title: ov.title || base.title,
        description: ov.description || base.description,
        keywords: ov.keywords || base.keywords,
        og_image: base.og_image
      };
      let html = import_fs5.default.readFileSync(import_path5.default.join(distPath, "index.html"), "utf8");
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc2(meta.title)}</title>`);
      const ogType = pathname.startsWith("/blog/") && pathname !== "/blog" ? "article" : "website";
      const inject = `
  <meta name="description" content="${esc2(meta.description)}" />
  <meta name="keywords" content="${esc2(meta.keywords)}" />
  <meta name="robots" content="${robotsContent}" />
  <link rel="canonical" href="https://colmedikal.com${pathname}" />
  <meta property="og:title" content="${esc2(meta.title)}" />
  <meta property="og:description" content="${esc2(meta.description)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="https://colmedikal.com${pathname}" />
  <meta property="og:image" content="${esc2(meta.og_image)}" />
  <meta property="og:site_name" content="Colmedikal Prepagada" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc2(meta.title)}" />
  <meta name="twitter:description" content="${esc2(meta.description)}" />
  <meta name="twitter:image" content="${esc2(meta.og_image)}" />`;
      html = html.replace("</head>", inject + "\n  </head>");
      const schemas = [
        // Global entity — every page
        {
          "@context": "https://schema.org",
          "@type": "MedicalOrganization",
          "@id": "https://colmedikal.com/#organization",
          name: "Colmedikal S.A.",
          alternateName: "Colmedikal",
          disambiguatingDescription: "Empresa ecuatoriana de medicina prepagada, distinta de Colm\xE9dica Colombia",
          url: "https://colmedikal.com",
          logo: { "@type": "ImageObject", url: "https://colmedikal.com/og-image.jpg" },
          description: "Empresa ecuatoriana de medicina prepagada con planes de salud individual, familiar y corporativo. Acceso inmediato a m\xE1s de 25 especialidades m\xE9dicas en cl\xEDnicas de alta complejidad en Ecuador.",
          foundingDate: "2011-10-05",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Av. Rep\xFAblica E6-447 y Eloy Alfaro, Ed. Castillo S\xE1nchez",
            addressLocality: "Quito",
            addressRegion: "Pichincha",
            postalCode: "170150",
            addressCountry: "EC"
          },
          contactPoint: [
            { "@type": "ContactPoint", telephone: "+593-2-2567191", contactType: "customer service", areaServed: "EC", availableLanguage: "Spanish" },
            { "@type": "ContactPoint", telephone: "+593-98-7028756", contactType: "customer service", contactOption: "TollFree", areaServed: "EC", availableLanguage: "Spanish" }
          ],
          areaServed: [
            { "@type": "City", name: "Quito" },
            { "@type": "City", name: "Guayaquil" },
            { "@type": "City", name: "Cuenca" },
            { "@type": "City", name: "Manta" },
            { "@type": "City", name: "Ambato" }
          ],
          medicalSpecialty: ["Emergency", "Geriatric", "Pediatric", "Obstetrics"],
          sameAs: [
            "https://www.facebook.com/colmedikal",
            "https://www.instagram.com/colmedikal",
            "https://www.linkedin.com/company/colmedikal"
          ]
        },
        // WebSite — sitelinks search box signal
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://colmedikal.com/#website",
          url: "https://colmedikal.com",
          name: "Colmedikal",
          inLanguage: "es-EC",
          publisher: { "@id": "https://colmedikal.com/#organization" }
        }
      ];
      if (pathname === "/faqs") {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": "https://colmedikal.com/faqs",
          url: "https://colmedikal.com/faqs",
          inLanguage: "es-EC",
          mainEntity: [
            { "@type": "Question", name: "\xBFQu\xE9 es la medicina prepagada en Ecuador?", acceptedAnswer: { "@type": "Answer", text: "La medicina prepagada es un sistema de salud privado en el que el afiliado paga una cuota mensual a cambio de cobertura m\xE9dica inmediata: consultas con especialistas sin referencia, hospitalizaci\xF3n en cl\xEDnicas privadas, cirug\xEDas, maternidad y emergencias 24/7, todo sin depender del IESS." } },
            { "@type": "Question", name: "\xBFCu\xE1nto cuesta la medicina prepagada Colmedikal?", acceptedAnswer: { "@type": "Answer", text: "Colmedikal ofrece tres planes: Esencial desde $8 USD/mes por persona (cobertura $2,000/a\xF1o), Recomendado desde $12 USD/mes ($3,000/a\xF1o) y Platinum desde $22 USD/mes ($5,000/a\xF1o). Los precios var\xEDan seg\xFAn edad y n\xFAmero de beneficiarios." } },
            { "@type": "Question", name: "\xBFQu\xE9 son los per\xEDodos de carencia?", acceptedAnswer: { "@type": "Answer", text: "El per\xEDodo de carencia es el tiempo de espera desde la afiliaci\xF3n antes de que se active cada cobertura. En Colmedikal: emergencias 24 horas, consultas ambulatorias 30 d\xEDas, maternidad 60-90 d\xEDas, hospitalizaci\xF3n y cirug\xEDas 90 d\xEDas, y preexistencias declaradas 730 d\xEDas (24 meses)." } },
            { "@type": "Question", name: "\xBFC\xF3mo funcionan las preexistencias en Colmedikal?", acceptedAnswer: { "@type": "Answer", text: "Las enfermedades preexistentes declaradas al momento de la afiliaci\xF3n quedan cubiertas a partir del mes 25 de vigencia, hasta el l\xEDmite anual contratado o 20 salarios b\xE1sicos, conforme a la legislaci\xF3n ecuatoriana. Las preexistencias no declaradas quedan excluidas permanentemente." } },
            { "@type": "Question", name: "\xBFC\xF3mo solicitar un reembolso m\xE9dico en Colmedikal?", acceptedAnswer: { "@type": "Answer", text: "Ingresa a la secci\xF3n de Tr\xE1mites en L\xEDnea en colmedikal.com/tramites, sube la factura del m\xE9dico particular, la historia cl\xEDnica y la receta. El reembolso se procesa en un promedio de 5 d\xEDas h\xE1biles si la atenci\xF3n est\xE1 dentro de las coberturas del plan." } },
            { "@type": "Question", name: "\xBFEn qu\xE9 ciudades de Ecuador opera Colmedikal?", acceptedAnswer: { "@type": "Answer", text: "Colmedikal opera en Quito (sede principal), Guayaquil, Cuenca, Ambato, Manta, Riobamba, Loja, Ibarra, Santo Domingo, Portoviejo, Machala y Esmeraldas, con una red de especialistas y cl\xEDnicas afiliadas en cada ciudad." } },
            { "@type": "Question", name: "\xBFPuedo agendar citas directamente con especialistas?", acceptedAnswer: { "@type": "Answer", text: "S\xED. Una de las principales ventajas de Colmedikal es el acceso directo a m\xE1s de 25 especialidades m\xE9dicas sin necesidad de pasar primero por un m\xE9dico general. Puedes agendar tu cita en colmedikal.com/agendamiento o llamando al 02-2567191." } },
            { "@type": "Question", name: "\xBFQu\xE9 diferencia hay entre Colmedikal y el IESS?", acceptedAnswer: { "@type": "Answer", text: "El IESS es el seguro social obligatorio del Estado ecuatoriano con tiempos de espera para especialistas. Colmedikal es un sistema privado de medicina prepagada que garantiza atenci\xF3n inmediata, acceso directo a especialistas, hospitalizaci\xF3n en cl\xEDnicas privadas de alta complejidad y cobertura de maternidad desde el primer mes seg\xFAn el plan." } }
          ]
        });
      }
      if (pathname === "/" || pathname === "") {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://colmedikal.com/",
          url: "https://colmedikal.com/",
          inLanguage: "es-EC",
          name: "Colmedikal | La Mejor Medicina Prepagada de Ecuador",
          about: { "@id": "https://colmedikal.com/#organization" },
          speakable: { "@type": "SpeakableSpecification", cssSelector: ["[data-speakable]", ".hero-headline", ".hero-description"] }
        });
      }
      if (pathname.startsWith("/blog/") && pathname !== "/blog") {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `https://colmedikal.com${pathname}`,
          inLanguage: "es-EC",
          publisher: { "@id": "https://colmedikal.com/#organization" },
          isPartOf: { "@type": "Blog", "@id": "https://colmedikal.com/blog" },
          audience: { "@type": "MedicalAudience", audienceType: "Patient", geographicArea: { "@type": "Country", name: "Ecuador" } },
          speakable: { "@type": "SpeakableSpecification", cssSelector: ["[data-speakable]", ".article-intro"] }
        });
      }
      const ldBlocks = schemas.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n  ");
      const gtagSnippet = ga4IdCache ? `
  <script id="ga4-consent-default">window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','wait_for_update':500});</script>
  <script id="ga4-script" async src="https://www.googletagmanager.com/gtag/js?id=${esc2(ga4IdCache)}"></script>
  <script id="ga4-init">gtag('js',new Date());gtag('config','${esc2(ga4IdCache)}');</script>` : "";
      html = html.replace("</head>", `  ${ldBlocks}${gtagSnippet}
  </head>`);
      res.set("Content-Type", "text/html; charset=UTF-8");
      res.send(html);
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
