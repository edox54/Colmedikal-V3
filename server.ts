import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// ============================================
// CONFIGURACIÓN DE KOMMO
// ============================================
const KOMMO_CONFIG = {
    workspaceId: '36580363',
    accessToken: process.env.KOMMO_ACCESS_TOKEN || '', // Será necesario configurar en variables de entorno
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
              // Campos personalizados según tipo de formulario
              custom_fields: prepareCustomFields(formData, formType)
      };

      console.log(`[Kommo] Enviando ${formType}:`, kommoPayload);

      // Aquí irá la lógica para enviar a Kommo vía API
      // Por ahora solo registramos el intento
      return {
              success: true,
              message: `${formType} enviado correctamente a Kommo`,
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
 * Body: { formType: 'contact' | 'quote' | 'reimbursement', formData: {...} }
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

      // Procesar formulario
      console.log(`[API] Formulario ${formType} recibido`);

      // Enviar a Kommo
      const kommoResult = await sendToKommo(formType, formData);

      // Registrar en logs (opcional)
      console.log(`[API] Resultado Kommo:`, kommoResult);

      // Responder al cliente
      return res.json({
              success: kommoResult.success,
              message: kommoResult.message,
              formType: formType
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
 * Endpoint para recibir webhooks de Kommo
 * POST /api/kommo/webhook
 */
app.post('/api/kommo/webhook', express.json(), async (req, res) => {
    try {
          const event = req.body;

      console.log('[Kommo Webhook] Evento recibido:', event.event_type);

      // Aquí puedes procesar eventos de Kommo
      // Ejemplos:
      // - Lead creado
      // - Lead actualizado
      // - Etapa cambiada
      // - Contacto agregado

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
        console.log(`✓ Kommo Integration activa`);
        console.log(`✓ Endpoint: POST /api/forms/submit`);
        console.log(`✓ Webhook: POST /api/kommo/webhook`);
  });
}

// Iniciar el servidor
startServer().catch((err) => {
    console.error('Error iniciando servidor:', err);
    process.exit(1);
});
