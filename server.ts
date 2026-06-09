import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'colmedikal2024';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // ENDPOINTS DE AUTENTICACIÓN
  app.post('/api/auth/login', express.json(), async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ success: false, message: 'Contraseña requerida' });
      }
      
      // Verificar contraseña
      if (password === DASHBOARD_PASSWORD) {
        const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        res.json({ success: true, token });
      } else {
        res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
  });

  app.get('/api/auth/verify', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ success: false });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ success: false });
    }
  });

  // PROTEGER ENDPOINT DE FORMULARIOS
  app.get('/api/forms', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    
    res.json({ success: true, forms: [] });
  });

  // General API routes (if any) go here first
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Endpoint para recibir datos de formularios
  app.post('/api/forms/submit', express.json(), async (req, res) => {
    try {
      const { type, data } = req.body;
      
      console.log(`[API] Formulario ${type} recibido:`, data);
      
      // Aquí iría la lógica para enviar a Kommo
      // Por ahora solo registramos
      
      res.json({
        success: true,
        message: `Formulario ${type} procesado correctamente`
      });
    } catch (error) {
      console.error('[API Error]', error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProd = process.env.NODE_ENV === 'production' || hasDist;

  // Serve static assets and router middleware
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in the dist folder (index:false so all HTML routing
    // goes through our meta-injection handler below, including "/")
    app.use(express.static(distPath, { index: false }));

    // Per-route meta tag injection
    const routes: Record<string, { title: string; description: string; keywords: string; og_image: string }> = {
      '/': {
        title: 'Colmedikal | Medicina Prepagada en Ecuador — Planes Familia e Individual',
        description: 'Compara planes de medicina prepagada en Ecuador. Cobertura completa sin IESS obligatorio, acceso a médicos especialistas y clínicas privadas desde $35/mes.',
        keywords: 'medicina prepagada Ecuador, seguro médico privado, plan médico familia, Colmedikal',
        og_image: 'https://colmedikal.com/og-image.png',
      },
      '/servicios': {
        title: 'Servicios de Medicina Prepagada | Colmedikal Ecuador',
        description: 'Conoce todos los servicios de Colmedikal: hospitalización, cirugías, maternidad, atención ambulatoria y más. Planes desde $35 al mes.',
        keywords: 'servicios medicina prepagada, hospitalización privada Ecuador, maternidad prepagada',
        og_image: 'https://colmedikal.com/og-image.png',
      },
      '/directorio': {
        title: 'Directorio de Médicos Especialistas y Clínicas | Colmedikal Ecuador',
        description: 'Encuentra médicos especialistas, clínicas y hospitales en Ecuador. Directorio verificado con profesionales de salud en Quito, Guayaquil y todo el país.',
        keywords: 'médicos especialistas Ecuador, directorio médico Quito, clínicas privadas Ecuador',
        og_image: 'https://colmedikal.com/og-image.png',
      },
      '/nosotros': {
        title: 'Sobre Colmedikal | Medicina Prepagada con Respaldo Real en Ecuador',
        description: 'Conoce al equipo de Colmedikal: nuestra misión, valores y el compromiso con la salud de las familias ecuatorianas.',
        keywords: 'Colmedikal Ecuador, empresa medicina prepagada, seguro médico privado',
        og_image: 'https://colmedikal.com/og-image.png',
      },
      '/cotizador': {
        title: 'Cotiza tu Plan de Medicina Prepagada | Colmedikal Ecuador',
        description: 'Cotiza en línea tu plan de medicina prepagada. Precios personalizados según edad y tipo de cobertura. Sin compromisos ni papeleo.',
        keywords: 'cotizar medicina prepagada Ecuador, precio plan médico familiar, cotizador seguro salud',
        og_image: 'https://colmedikal.com/og-image.png',
      },
      '/tramites': {
        title: 'Trámites en Línea | Portal de Afiliados Colmedikal',
        description: 'Gestiona tus trámites de medicina prepagada en línea: solicitudes de reembolso, autorizaciones médicas y más.',
        keywords: 'trámites medicina prepagada, reembolso médico Ecuador, portal afiliados',
        og_image: 'https://colmedikal.com/og-image.png',
      },
      '/agendamiento': {
        title: 'Agendamiento de Citas Médicas | Colmedikal Ecuador',
        description: 'Agenda tu cita médica con especialistas de Colmedikal. Atención presencial y telemedicina disponibles.',
        keywords: 'agendar cita médica Ecuador, telemedicina prepagada, consulta médica online',
        og_image: 'https://colmedikal.com/og-image.png',
      },
      '/faqs': {
        title: 'Preguntas Frecuentes sobre Medicina Prepagada | Colmedikal',
        description: '¿Qué es la medicina prepagada? ¿En qué se diferencia del IESS? Resolvemos todas tus dudas sobre planes médicos privados en Ecuador.',
        keywords: 'preguntas medicina prepagada, diferencia IESS seguro privado, cómo funciona prepagada',
        og_image: 'https://colmedikal.com/og-image.png',
      },
      '/contacto': {
        title: 'Contacto | Colmedikal Ecuador — Asesores de Medicina Prepagada',
        description: 'Contáctanos para asesoría personalizada sobre planes de medicina prepagada en Ecuador. WhatsApp, email y atención presencial disponibles.',
        keywords: 'contacto Colmedikal, asesor medicina prepagada Ecuador, WhatsApp salud',
        og_image: 'https://colmedikal.com/og-image.png',
      },
      '/blog': {
        title: 'Blog Médico y Guía de Bienestar | Colmedikal Ecuador',
        description: 'Artículos sobre medicina prepagada, prevención y salud en Ecuador escritos por especialistas de Colmedikal.',
        keywords: 'blog salud Ecuador, artículos medicina prepagada, guía bienestar',
        og_image: 'https://colmedikal.com/og-image.png',
      },
      '/blog-detalle': {
        title: 'Blog | Colmedikal Ecuador',
        description: 'Lee este artículo del blog médico de Colmedikal Ecuador.',
        keywords: 'blog salud Ecuador, Colmedikal',
        og_image: 'https://colmedikal.com/og-image.png',
      },
    };

    // Escape a value for safe insertion into an HTML attribute
    const esc = (s: string) =>
      String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Fetch SEO meta overrides from the API/DB, cached for 60s to avoid per-request load.
    // Overrides are stored under keys like "meta_/directorio" => {title, description, keywords}.
    const API_BASE_URL = 'https://api.colmedikal.com';
    let overrideCache: Record<string, { title?: string; description?: string; keywords?: string }> = {};
    let overrideCacheAt = 0;
    const getOverrides = async () => {
      if (Date.now() - overrideCacheAt < 60_000) return overrideCache;
      try {
        const r = await fetch(`${API_BASE_URL}/api/public/settings`);
        const json: any = await r.json();
        const data = json?.data || {};
        const next: Record<string, any> = {};
        for (const [k, v] of Object.entries(data)) {
          if (k.startsWith('meta_')) {
            try { next[k.slice(5)] = JSON.parse(v as string); } catch { /* skip bad json */ }
          }
        }
        overrideCache = next;
        overrideCacheAt = Date.now();
      } catch { /* keep last good cache on failure */ }
      return overrideCache;
    };

    // Provide general routing fallback to index.html for react-router-dom with per-route meta injection
    app.get('*', async (req, res) => {
      const pathname = req.path.replace(/\/$/, '') || '/';
      const basePath = pathname.startsWith('/blog/') ? '/blog-detalle' : pathname;
      const base = routes[basePath] || routes['/'];

      // DB override (from SEO panel) wins over the hardcoded defaults; match on the
      // real pathname first, then the normalized basePath.
      const overrides = await getOverrides();
      const ov = overrides[pathname] || overrides[basePath] || {};
      const meta = {
        title: ov.title || base.title,
        description: ov.description || base.description,
        keywords: ov.keywords || base.keywords,
        og_image: base.og_image,
      };

      // Diagnostic headers (safe to keep; helps verify deploy + override source)
      res.set('X-Meta-Build', 'override-v2');
      res.set('X-Meta-Override', ov.title ? 'hit' : 'miss');
      res.set('X-Meta-OvKeys', String(Object.keys(overrides).length));

      let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');

      // Replace <title>
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);

      // Inject meta + OG tags before </head>
      const inject = `
  <meta name="description" content="${esc(meta.description)}" />
  <meta name="keywords" content="${esc(meta.keywords)}" />
  <link rel="canonical" href="https://colmedikal.com${pathname}" />
  <meta property="og:title" content="${esc(meta.title)}" />
  <meta property="og:description" content="${esc(meta.description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://colmedikal.com${pathname}" />
  <meta property="og:image" content="${esc(meta.og_image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(meta.title)}" />
  <meta name="twitter:description" content="${esc(meta.description)}" />`;

      html = html.replace('</head>', inject + '\n  </head>');

      res.set('Content-Type', 'text/html; charset=UTF-8');
      res.send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
