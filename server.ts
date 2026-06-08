import express from 'express';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3000;

// ============================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ============================================
const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const BACKUP_EMAIL = process.env.BACKUP_EMAIL || 'seoefectivo1@gmail.com';

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
                  db.run(`
                        CREATE TABLE IF NOT EXISTS forms (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        form_type TEXT NOT NULL,
                                                form_data TEXT NOT NULL,
                                                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                                status TEXT DEFAULT 'pending',
                                                                        kommo_lead_id INTEGER,
                                                                                email_sent BOOLEAN DEFAULT 0,
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
                  pipelineId: 13888315,
                  stageId: 57098341,
                  source: 'Contacto Web'
        },
        quote: {
                  pipelineId: 13888315,
                  stageId: 57098342,
                  source: 'Cotizador Web'
        },
        reimbursement: {
                  pipelineId: 13888315,
                  stageId: 57098342,
                  source: 'Solicitud Reembolso'
        }
};

// ============================================
// CONFIGURACIÓN DE NODEMAILER
// ============================================
let transporter: any = null;

if (GMAIL_USER && GMAIL_APP_PASSWORD) {
        transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                              user: GMAIL_USER,
                              pass: GMAIL_APP_PASSWORD
                  }
        });

  // Verificar conexión
  transporter.verify((error: any, success: boolean) => {
            if (error) {
                        console.error('[Nodemailer Error]', error);
            } else {
                        console.log('✓ Nodemailer configurado correctamente');
            }
  });
} else {
        console.warn('⚠ Advertencia: Gmail no configurado. Las copias de correos NO se enviarán.');
}

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

function updateFormWithEmailSent(formId: number): Promise<void> {
        return new Promise((resolve, reject) => {
                  db.run(
                              'UPDATE forms SET email_sent = 1 WHERE id = ?',
                              [formId],
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
// FUNCIONES DE ENVÍO DE CORREOS
// ============================================

async function sendBackupEmail(formId: number, formType: string, formData: Record<string, any>, userEmail?: string) {
        if (!transporter) {
                  console.warn('[Email] Nodemailer no configurado, saltando envío de backup');
                  return;
        }

  try {
            const timestamp = new Date().toLocaleString('es-ES');
            const htmlContent = `
                  <html>
                          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                                <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">📋 Copia de Formulario Recibido</h2>

                                                                        <p><strong>Tipo de Formulario:</strong> ${formType}</p>
                                                                                    <p><strong>ID Interno:</strong> ${formId}</p>
                                                                                                <p><strong>Fecha y Hora:</strong> ${timestamp}</p>
                                                                                                            ${userEmail ? `<p><strong>Email del Usuario:</strong> ${userEmail}</p>` : ''}
                                                                                                                        
                                                                                                                                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                                                                                                                                                
                                                                                                                                                            <h3 style="color: #333;">Datos del Formulario:</h3>
                                                                                                                                                                        <table style="width: 100%; border-collapse: collapse;">
                                                                                                                                                                            `;

          // Agregar datos dinámicamente
          Object.entries(formData).forEach(([key, value]) => {
                      const displayKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                      const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
                      htmlContent += `
                              <tr>
                                        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">${displayKey}</td>
                                                  <td style="padding: 10px; border: 1px solid #ddd;">${displayValue}</td>
                                                          </tr>
                                                                `;
          });

          htmlContent += `
                      </table>

                                              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

                                                                      <p style="font-size: 12px; color: #666; margin-top: 20px;">
                                                                                    ✓ Este correo es una copia de seguridad automática de un formulario recibido en colmedikal.com<br>
                                                                                                  ✓ El usuario también recibió confirmación de su envío
                                                                                                              </p>
                                                                                                                        </div>
                                                                                                                                </body>
                                                                                                                                      </html>
                                                                                                                                          `;

          const mailOptions = {
                      from: GMAIL_USER,
                      to: BACKUP_EMAIL,
                      subject: `[BACKUP] Formulario ${formType} - ID ${formId} - ${timestamp}`,
                      html: htmlContent,
                      replyTo: userEmail || 'noreply@colmedikal.com'
          };

          transporter.sendMail(mailOptions, async (error: any, info: any) => {
                      if (error) {
                                    console.error('[Email Send Error]', error);
                      } else {
                                    console.log(`[Email] Backup enviado a ${BACKUP_EMAIL} - ${info.response}`);
                                    // Marcar como enviado en BD
                        await updateFormWithEmailSent(formId).catch(err => console.error('[DB Update Error]', err));
                      }
          });
  } catch (error) {
            console.error('[Email Function Error]', error);
  }
}

// ============================================
// FUNCIONES DE INTEGRACIÓN CON KOMMO
// ============================================

async function sendToKommo(formType: string, formData: Record<string, any>) {
        try {
                  const stageConfig = FORM_TO_STAGE_MAPPING[formType];

          if (!stageConfig) {
                      throw new Error(`Tipo de formulario no válido: ${formType}`);
          }

          const name = extractName(formData, formType);
                  const email = formData.email || formData.correoElectronico || '';
                  const phone = formData.phone || formData.telefono || formData.whatsapp || '';

          const kommoPayload = {
                      name: name,
                      phone: phone,
                      email: email,
                      source_id: stageConfig.source,
                      custom_fields: prepareCustomFields(formData, formType)
          };

          console.log(`[Kommo] Enviando ${formType}:`, kommoPayload);

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

function extractName(data: Record<string, any>, formType: string): string {
        if (formType === 'quote') {
                  const firstName = data.firstName || data.nombre || '';
                  const lastName = data.lastName || data.apellido || '';
                  return `${firstName} ${lastName}`.trim();
        }

  return data.name || data.nombreCompleto || data.nombre || 'Sin Nombre';
}

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

app.get('/api/health', (req, res) => {
        res.json({ status: 'ok' });
});

app.post('/api/forms/submit', express.json(), async (req, res) => {
        try {
                  const { formType, formData } = req.body;

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

          // Guardar en BD
          const formId = await saveFormToDatabase(formType, formData);

          // Procesar con Kommo
          const kommoResult = await sendToKommo(formType, formData);

          // Enviar backup de correo
          const userEmail = formData.email || formData.correoElectronico;
                  sendBackupEmail(formId, formType, formData, userEmail);

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

app.get('/api/forms', async (req, res) => {
        try {
                  const forms = await getAllForms();

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

app.post('/api/kommo/webhook', express.json(), async (req, res) => {
        try {
                  const event = req.body;

          console.log('[Kommo Webhook] Evento recibido:', event.event_type);

          if (event.event_type === 'add_lead') {
                      console.log('[Kommo Webhook] Lead creado:', event.leads);
          } else if (event.event_type === 'update_lead') {
                      console.log('[Kommo Webhook] Lead actualizado:', event.leads);
          }

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

  vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa'
  });

  app.use(vite.middlewares);

  const publicDir = path.join(process.cwd(), 'public');
        app.use(express.static(publicDir));

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

  app.listen(PORT, () => {
            console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
            console.log(`✓ Base de datos: SQLite en ${DB_PATH}`);
            console.log(`✓ Endpoint: POST /api/forms/submit`);
            console.log(`✓ Ver formularios: GET /api/forms`);
            console.log(`✓ Webhook: POST /api/kommo/webhook`);
            console.log(`✓ Email backup configurado: ${GMAIL_USER ? 'Sí' : 'No'}`);
  });
}

startServer().catch((err) => {
        console.error('Error iniciando servidor:', err);
        process.exit(1);
});
