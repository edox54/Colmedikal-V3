import express from 'express';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// ============================================
// BASE DE DATOS SQLITE
// ============================================
const DB_PATH = path.join(process.cwd(), 'data', 'forms.db');
const DATA_DIR = path.join(process.cwd(), 'data');

// Asegurar que existe el directorio de datos
if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
              console.error('[DB Error]', err.message);
      } else {
              console.log('✓ Conectado a SQLite');
              initializeDatabase();
      }
});

// Inicializar tablas
function initializeDatabase() {
      db.serialize(() => {
              // Tabla para formularios de contacto
                       db.run(`
                             CREATE TABLE IF NOT EXISTS forms (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             form_type TEXT NOT NULL,
                                                     form_data TEXT NOT NULL,
                                                             timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                                     status TEXT DEFAULT 'pending',
                                                                             kommo_lead_id INTEGER,
                                                                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                                                                                           )
                                                                                               `);

                       console.log('✓ Tablas de BD inicializadas');
      });
}

// ============================================
// CONFIGURACIÓN DE KOMMO
// ============================================
const KOMMO_CONFIG = {
      workspaceId: '36580363',
      baseUrl: 'https://arealegal.kommo.com',
      apiEndpoint: '/api/v4'
};

// Mapeo de formularios a stages de Kommo
const FORM_TO_STAGE_MAPPING = {
      contact: {
              pipelineId: 13888315,    // Embudo de Ventas
              stageId: 57098341,        // NUEVA CONSULTA
              source: 'Contacto Web'
      },
      quote: {
              pipelineId: 13888315,
              stageId: 57098342,        // CUALIFICADO
              source: 'Cotizador Web'
      },
      reimbursement: {
              pipelineId: 13888315,
              stageId: 57098342,        // CUALIFICADO
              source: 'Solicitud Reembolso'
      }
};

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
});

// ============================================
// FUNCIONES DE BASE DE DATOS
// ============================================

/**
 * Guardar formulario en la base de datos
 */
function saveFormToDatabase(formType: string, formData: Record<string, any>): Promise<number> {
      return new Promise((resolve, reject) => {
              const query = `
                    INSERT INTO forms (form_type, form_data, status)
                          VALUES (?, ?, 'pending')
                              `;

                             db.run(
                                       query,
                                       [formType, JSON.stringify(formData)],
                                       function(err) {
                                                   if (err) {
                                                                 console.error('[DB Save Error]', err);
                                                                 reject(err);
                                                   } else {
                                                                 console.log(`[DB] Formulario ${formType} guardado con ID: ${this.lastID}`);
                                                                 resolve(this.lastID);
                                                   }
                                       }
                                     );
      });
}

/**
 * Obtener todos los formularios de la base de datos
 */
function getAllForms(): Promise<any[]> {
      return new Promise((resolve, reject) => {
              db.all(
                        'SELECT * FROM forms ORDER BY created_at DESC',
                        (err, rows) => {
                                    if (err) {
                                                  reject(err);
                                    } else {
                                                  resolve(rows || []);
                                    }
                        }
                      );
      });
}

/**
 * Actualizar estado del formulario con ID de Kommo lead
 */
function updateFormWithKommoId(formId: number, kommoLeadId: number): Promise<void> {
      return new Promise((resolve, reject) => {
              db.run(
                        'UPDATE forms SET status = ?, kommo_lead_id = ? WHERE id = ?',
                        ['synced', kommoLeadId, formId],
                        (err) => {
                                    if (err) {
                                                  reject(err);
                                    } else {
                                                  resolve();
                                    }
                        }
                      );
      });
}

// ============================================
// FUNCIONES DE INTEGRACIÓN CON KOMMO
// ============================================

/**
 * Envía datos de formulario a Kommo como un nuevo lead
 */
async function sendToKommo(formType: string, formData: Record<string, any>) {
      try {
              const stageConfig = FORM_TO_STAGE_MAPPING[formType];

        if (!stageConfig) {
                  throw new Error(`Tipo de formulario no válido: ${formType}`);
        }

        // Extraer datos principales
        const name = extractName(formData, formType);
              const email = formData.email || formData.correoElectronico || '';
              const phone = formData.phone || formData.telefono || formData.whatsapp || '';

        // Preparar payload para Kommo
        const kommoPayload = {
                  name: name,
                  phone: phone,
                  email: email,
                  source_id: stageConfig.source,
                  custom_fields: prepareCustomFields(formData, formType)
        };

        console.log(`[Kommo] Enviando ${formType}:`, kommoPayload);

        // Por ahora solo registramos (cuando tengas API token, aquí haremos la llamada real)
        return {
                  success: true,
                  message: `${formType} registrado en BD - Listo para sincronizar a Kommo`,
                  data: kommoPayload
        };
      } catch (error) {
              console.error('[Kommo Error]', error);
              return {
                        success: false,
                        message: `Error al procesar ${formType}: ${error.message}`
              };
      }
}

/**
 * Extrae el nombre del formulario según su tipo
 */
function extractName(data: Record<string, any>, formType: string): string {
      if (formType === 'quote') {
              const firstName = data.firstName || data.nombre || '';
              const lastName = data.lastName || data.apellido || '';
              return `${firstName} ${lastName}`.trim();
      }

  return data.name || data.nombreCompleto || data.nombre || 'Sin Nombre';
}

/**
 * Prepara los campos personalizados según el tipo de formulario
 */
function prepareCustomFields(data: Record<string, any>, formType: string): Record<string, any> {
      const customFields: Record<string, any> = {};

  switch (formType) {
      case 'contact':
                if (data.city || data.ciudad) customFields.ciudad = data.city || data.ciudad;
                if (data.subject || data.asunto) customFields.asunto = data.subject || data.asunto;
                if (data.query || data.consulta) customFields.consulta = data.query || data.consulta;
                break;

      case 'quote':
                if (data.province || data.provincia) customFields.provincia = data.province || data.provincia;
                if (data.serviceType || data.tipoServicio) customFields.tipoServicio = data.serviceType || data.tipoServicio;
                break;

      case 'reimbursement':
                if (data.cedula) customFields.cedula = data.cedula;
                if (data.serviceType || data.tipoServicio) customFields.tipoServicio = data.serviceType || data.tipoServicio;
                if (data.invoice || data.factura) customFields.factura = data.invoice || data.factura;
                if (data.amount || data.monto) customFields.monto = data.amount || data.monto;
                break;
  }

  return customFields;
}

// ============================================
// RUTAS API
// ============================================

// Health check
app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' });
});

/**
 * Endpoint para recibir datos de formularios
 * POST /api/forms/submit
 */
app.post('/api/forms/submit', express.json(), async (req, res) => {
      try {
              const { formType, formData } = req.body;

        // Validar entrada
        if (!formType || !formData) {
                  return res.status(400).json({
                              success: false,
                              message: 'Falta formType o formData'
                  });
        }

        if (!['contact', 'quote', 'reimbursement'].includes(formType)) {
                  return res.status(400).json({
                              success: false,
                              message: 'Tipo de formulario no válido'
                  });
        }

        console.log(`[API] Formulario ${formType} recibido`);

        // 1. Guardar en base de datos
        const formId = await saveFormToDatabase(formType, formData);

        // 2. Procesar con Kommo (cuando tengas token API)
        const kommoResult = await sendToKommo(formType, formData);

        console.log(`[API] Resultado Kommo:`, kommoResult);

        // Responder al cliente
        return res.json({
                  success: kommoResult.success,
                  message: kommoResult.message,
                  formType: formType,
                  formId: formId,
                  data: kommoResult.data
        });

      } catch (error) {
              console.error('[API Error]', error);
              return res.status(500).json({
                        success: false,
                        message: 'Error interno del servidor'
              });
      }
});

/**
 * Endpoint para ver todos los formularios capturados
 * GET /api/forms
 */
app.get('/api/forms', async (req, res) => {
      try {
              const forms = await getAllForms();

        // Parsear los datos JSON almacenados
        const parsedForms = forms.map(form => ({
                  ...form,
                  form_data: typeof form.form_data === 'string' ? JSON.parse(form.form_data) : form.form_data
        }));

        return res.json({
                  success: true,
                  total: parsedForms.length,
                  forms: parsedForms
        });
      } catch (error) {
              console.error('[API Error]', error);
              return res.status(500).json({
                        success: false,
                        message: 'Error al obtener formularios'
              });
      }
});

/**
 * Endpoint para ver formularios por tipo
 * GET /api/forms/:type
 */
app.get('/api/forms/:type', async (req, res) => {
      try {
              const { type } = req.params;
              const forms = await getAllForms();

        const filtered = forms
                .filter(f => f.form_type === type)
                .map(form => ({
                            ...form,
                            form_data: typeof form.form_data === 'string' ? JSON.parse(form.form_data) : form.form_data
                }));

        return res.json({
                  success: true,
                  type: type,
                  total: filtered.length,
                  forms: filtered
        });
      } catch (error) {
              console.error('[API Error]', error);
              return res.status(500).json({
                        success: false,
                        message: 'Error al obtener formularios'
              });
      }
});

/**
 * Endpoint para recibir webhooks de Kommo
 * POST /api/kommo/webhook
 */
app.post('/api/kommo/webhook', express.json(), async (req, res) => {
      try {
              const event = req.body;

        console.log('[Kommo Webhook] Evento recibido:', event);
              console.log('[Kommo Webhook] Tipo de evento:', event.event_type);

        // Procesar diferentes tipos de eventos
        if (event.event_type === 'add_lead') {
                  console.log('[Kommo Webhook] Lead creado:', event.leads);
        } else if (event.event_type === 'update_lead') {
                  console.log('[Kommo Webhook] Lead actualizado:', event.leads);
        }

        // Por ahora, solo reconocemos el webhook
        res.json({ success: true, message: 'Webhook procesado' });

      } catch (error) {
              console.error('[Kommo Webhook Error]', error);
              res.status(500).json({ success: false, error: error.message });
      }
});

// ============================================
// SSR CON VITE
// ============================================

async function startServer() {
      let vite;

  // Crear servidor Vite en modo middleware
  vite = await createViteServer({
          server: { middlewareMode: true },
          appType: 'spa'
  });

  app.use(vite.middlewares);

  // Servir archivos estáticos
  const publicDir = path.join(process.cwd(), 'public');
      app.use(express.static(publicDir));

  // Ruta catch-all para SPA
  app.get('*', async (req, res, next) => {
          try {
                    const indexPath = path.join(process.cwd(), 'index.html');
                    const template = fs.readFileSync(indexPath, 'utf-8');
                    const html = await vite.transformIndexHtml(req.originalUrl, template);
                    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
          } catch (e) {
                    if (e instanceof Error) vite!.ssrFixStacktrace(e);
                    next(e);
          }
  });

  // Iniciar servidor
  app.listen(PORT, () => {
          console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
          console.log(`✓ Base de datos: SQLite en ${DB_PATH}`);
          console.log(`✓ Endpoint: POST /api/forms/submit`);
          console.log(`✓ Ver formularios: GET /api/forms`);
          console.log(`✓ Webhook: POST /api/kommo/webhook`);
  });
}

// Iniciar el servidor
startServer().catch((err) => {
      console.error('Error iniciando servidor:', err);
      process.exit(1);
});
