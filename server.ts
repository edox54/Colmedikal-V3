import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import crypto from 'crypto';

// GET a JSON URL using the native https module (pure JS — avoids undici/fetch's
// WASM-based llhttp parser, which fails under CloudLinux LVE memory limits).
function httpsGetJson(url: string, timeoutMs = 4000): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
  });
}

// Security: Require JWT_SECRET to be set, fail fast if missing
const JWT_SECRET = process.env.JWT_SECRET;
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

if (!DASHBOARD_PASSWORD) {
  console.error('FATAL: DASHBOARD_PASSWORD environment variable is required');
  process.exit(1);
}

// Middleware: Verify JWT token
function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // SEO: www → non-www 301 redirect (canonical domain)
  app.use((req, res, next) => {
    if (req.hostname === 'www.colmedikal.com') {
      return res.redirect(301, 'https://colmedikal.com' + req.originalUrl);
    }
    next();
  });

  // Security: Apply helmet middleware (CSP desactivado para configuración manual)
  app.use(helmet({ contentSecurityPolicy: false }));

  // Security: Add custom security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // CSP: permite self + api externa + CDNs necesarios
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "connect-src 'self' https://api.colmedikal.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://*.tile.openstreetmap.org",
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "frame-src 'self' https://www.google.com https://maps.google.com https://www.openstreetmap.org",
        "media-src 'self' blob: data:",
        "worker-src 'self' blob:",
        "frame-ancestors 'none'",
        "object-src 'none'",
      ].join('; ')
    );
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // ENDPOINTS DE AUTENTICACIÓN
  app.post('/api/auth/login', express.json(), async (req, res) => {
    try {
      const { password } = req.body;

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ success: false, message: 'Contraseña requerida' });
      }

      // Verify password (constant-time comparison to prevent timing attacks)
      const passwordBuffer = Buffer.from(password);
      const correctBuffer = Buffer.from(DASHBOARD_PASSWORD!);

      let isValid = false;
      if (passwordBuffer.length === correctBuffer.length) {
        try {
          isValid = crypto.timingSafeEqual(passwordBuffer, correctBuffer);
        } catch {
          isValid = false;
        }
      }

      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
      }

      // Generate JWT token with expiration (1 hour)
      const token = jwt.sign(
        { iat: Date.now(), type: 'admin' },
        JWT_SECRET!,
        { expiresIn: '1h' }
      );

      res.json({ success: true, token });
    } catch (error) {
      console.error('[Auth Error]', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  app.get('/api/auth/verify', verifyToken, (req, res) => {
    res.json({ success: true });
  });

  // PROTEGER ENDPOINT DE FORMULARIOS
  app.get('/api/forms', verifyToken, (req, res) => {
    res.json({ success: true, forms: [] });
  });

  // General API routes (if any) go here first
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Version endpoint - muestra en el footer la versión y commit del último deploy
  app.get('/api/version', (req, res) => {
    try {
      const { execSync } = require('child_process');
      const metaRaw = fs.readFileSync(path.join(process.cwd(), 'metadata.json'), 'utf-8');
      const meta = JSON.parse(metaRaw);
      const deployVersion = meta.deployVersion || '1.0';

      const gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8', cwd: process.cwd() }).trim();
      const deployedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

      res.json({
        version: `V${deployVersion}`,
        commit: gitCommit,
        deployedAt,
      });
    } catch (error) {
      res.json({
        version: 'V1.1',
        commit: 'unknown',
        deployedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });
    }
  });

  // Endpoint para recibir datos de formularios
  app.post('/api/forms/submit', express.json(), async (req, res) => {
    try {
      const { type, data } = req.body;

      // Input validation: type must be one of the allowed values
      if (!type || !['contact', 'quote', 'reimbursement'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid form type' });
      }

      if (!data || typeof data !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid form data' });
      }

      console.log(`[API] Formulario ${type} recibido`);

      // Aquí iría la lógica para enviar a Kommo
      // Por ahora solo registramos

      res.json({
        success: true,
        message: `Formulario ${type} procesado correctamente`
      });
    } catch (error) {
      console.error('[API Error]', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
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
        description: 'Planes de medicina prepagada en Ecuador desde $8/mes. Acceso directo a especialistas y clinicas privadas.',
        keywords: 'medicina prepagada Ecuador, seguro médico privado, plan médico familia, Colmedikal',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/servicios': {
        title: 'Servicios de Medicina Prepagada | Colmedikal Ecuador',
        description: 'Servicios Colmedikal: hospitalizacion, cirugias, maternidad y atencion ambulatoria. Planes desde $8/mes.',
        keywords: 'servicios medicina prepagada, hospitalización privada Ecuador, maternidad prepagada',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/directorio': {
        title: 'Directorio de Médicos Especialistas y Clínicas | Colmedikal Ecuador',
        description: 'Directorio de medicos especialistas y clinicas en Ecuador. Profesionales en Quito, Guayaquil y todo el pais.',
        keywords: 'médicos especialistas Ecuador, directorio médico Quito, clínicas privadas Ecuador',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/nosotros': {
        title: 'Sobre Colmedikal | Medicina Prepagada con Respaldo Real en Ecuador',
        description: 'Conoce al equipo de Colmedikal: nuestra misión, valores y el compromiso con la salud de las familias ecuatorianas.',
        keywords: 'Colmedikal Ecuador, empresa medicina prepagada, seguro médico privado',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/cotizador': {
        title: 'Cotiza tu Plan de Medicina Prepagada | Colmedikal Ecuador',
        description: 'Cotiza tu plan de medicina prepagada en linea. Precios segun edad y cobertura, sin compromisos.',
        keywords: 'cotizar medicina prepagada Ecuador, precio plan médico familiar, cotizador seguro salud',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/tramites': {
        title: 'Trámites en Línea | Portal de Afiliados Colmedikal',
        description: 'Gestiona tus trámites de medicina prepagada en línea: solicitudes de reembolso, autorizaciones médicas y más.',
        keywords: 'trámites medicina prepagada, reembolso médico Ecuador, portal afiliados',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/agendamiento': {
        title: 'Agendamiento de Citas Médicas | Colmedikal Ecuador',
        description: 'Agenda tu cita médica con especialistas de Colmedikal. Atención presencial y telemedicina disponibles.',
        keywords: 'agendar cita médica Ecuador, telemedicina prepagada, consulta médica online',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/faqs': {
        title: 'Preguntas Frecuentes sobre Medicina Prepagada | Colmedikal',
        description: 'Resolvemos tus dudas sobre medicina prepagada: carencias, copagos, reembolsos y preexistencias.',
        keywords: 'preguntas medicina prepagada, diferencia IESS seguro privado, cómo funciona prepagada',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/contacto': {
        title: 'Contacto | Colmedikal Ecuador — Asesores de Medicina Prepagada',
        description: 'Contacta a Colmedikal: asesoria sobre planes de salud. WhatsApp, email y atencion presencial.',
        keywords: 'contacto Colmedikal, asesor medicina prepagada Ecuador, WhatsApp salud',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/blog': {
        title: 'Blog Médico y Guía de Bienestar | Colmedikal Ecuador',
        description: 'Artículos sobre medicina prepagada, prevención y salud en Ecuador escritos por especialistas de Colmedikal.',
        keywords: 'blog salud Ecuador, artículos medicina prepagada, guía bienestar',
        og_image: 'https://colmedikal.com/og-image.jpg',
      },
      '/blog-detalle': {
        title: 'Blog | Colmedikal Ecuador',
        description: 'Lee este artículo del blog médico de Colmedikal Ecuador.',
        keywords: 'blog salud Ecuador, Colmedikal',
        og_image: 'https://colmedikal.com/og-image.jpg',
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
    let lastOvErr = 'none';
    const getOverrides = async () => {
      if (Date.now() - overrideCacheAt < 60_000) return overrideCache;
      try {
        const json: any = await httpsGetJson(`${API_BASE_URL}/api/public/settings`);
        const data = json?.data || {};
        const next: Record<string, any> = {};
        for (const [k, v] of Object.entries(data)) {
          if (k.startsWith('meta_')) {
            try { next[k.slice(5)] = JSON.parse(v as string); } catch { /* skip bad json */ }
          }
        }
        overrideCache = next;
        overrideCacheAt = Date.now();
        lastOvErr = `ok:${Object.keys(next).length}`;
      } catch (e: any) {
        const cause = e?.cause ? `|cause:${e.cause.code || e.cause.message || e.cause}` : '';
        lastOvErr = `${e?.name || 'err'}:${e?.message || e}${cause}`.slice(0, 160);
      }
      return overrideCache;
    };
    // Dynamic sitemap.xml — auto-generated from routes + blog posts via API
    app.get('/sitemap.xml', async (_req, res) => {
      const BASE = 'https://colmedikal.com';
      const now = new Date().toISOString().split('T')[0];
      const staticUrls = Object.keys(routes)
        .filter(r => r !== '/blog-detalle')
        .map(r => `  <url><loc>${BASE}${r === '/' ? '' : r}</loc><lastmod>${now}</lastmod><changefreq>${r === '/' ? 'daily' : 'weekly'}</changefreq><priority>${r === '/' ? '1.0' : '0.8'}</priority></url>`);
      // Fetch blog posts from API for dynamic URLs
      let blogUrls: string[] = [];
      try {
        const blogJson: any = await httpsGetJson('https://api.colmedikal.com/api/public/blog');
        const posts = blogJson?.data || [];
        blogUrls = posts.map((p: any) => {
          const slug = p.slug || p.id;
          return `  <url><loc>${BASE}/blog/${slug}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`;
        });
      } catch { /* static blog fallback */ }
      // Extra routes not in the routes map
      const extraUrls = [
        `  <url><loc>${BASE}/mapa-red-medica</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
        `  <url><loc>${BASE}/privacy</loc><lastmod>${now}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
      ];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticUrls, ...extraUrls, ...blogUrls].join('\n')}\n</urlset>`;
      res.set('Content-Type', 'application/xml; charset=UTF-8');
      res.send(xml);
    });

    // Blog post lookup for SSR — fetch from API, cached 5 min
    let blogCache: any[] = [];
    let blogCacheAt = 0;
    const getBlogPosts = async () => {
      if (Date.now() - blogCacheAt < 300_000 && blogCache.length) return blogCache;
      try {
        const json: any = await httpsGetJson('https://api.colmedikal.com/api/public/blog');
        blogCache = json?.data || [];
        blogCacheAt = Date.now();
      } catch { /* keep stale cache */ }
      return blogCache;
    };

    // Provide general routing fallback to index.html for react-router-dom with per-route meta injection
    app.get('*', async (req, res) => {
      const pathname = req.path.replace(/\/$/, '') || '/';
      const basePath = pathname.startsWith('/blog/') ? '/blog-detalle' : pathname;
      let base = routes[basePath] || routes['/'];

      // Dynamic blog post SSR: resolve actual post title/description
      if (pathname.startsWith('/blog/') && pathname !== '/blog') {
        const slug = pathname.replace('/blog/', '');
        if (slug) {
          const posts = await getBlogPosts();
          const post = posts.find((p: any) => p.slug === slug || p.id === slug);
          if (post) {
            base = {
              title: `${post.title} | Blog Colmedikal`,
              description: post.excerpt || post.description || base.description,
              keywords: (post.tags || []).join(', ') || base.keywords,
              og_image: post.image || base.og_image,
            };
          }
        }
      }

      // Determine robots directive — noindex for admin/seo routes
      const noindexRoutes = ['/admin', '/seo-panel'];
      const robotsContent = noindexRoutes.some(r => pathname.startsWith(r)) ? 'noindex, nofollow' : 'index, follow';

      // DB override (from SEO panel) wins over the hardcoded defaults
      const overrides = await getOverrides();
      const ov = overrides[pathname] || overrides[basePath] || {};
      const meta = {
        title: ov.title || base.title,
        description: ov.description || base.description,
        keywords: ov.keywords || base.keywords,
        og_image: base.og_image,
      };

      let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');

      // Replace <title>
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);

      // Inject meta + OG + Twitter tags before </head>
      const ogType = pathname.startsWith('/blog/') && pathname !== '/blog' ? 'article' : 'website';
      const inject = `
  <meta name="description" content="${esc(meta.description)}" />
  <meta name="keywords" content="${esc(meta.keywords)}" />
  <meta name="robots" content="${robotsContent}" />
  <link rel="canonical" href="https://colmedikal.com${pathname}" />
  <meta property="og:title" content="${esc(meta.title)}" />
  <meta property="og:description" content="${esc(meta.description)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="https://colmedikal.com${pathname}" />
  <meta property="og:image" content="${esc(meta.og_image)}" />
  <meta property="og:site_name" content="Colmedikal Prepagada" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(meta.title)}" />
  <meta name="twitter:description" content="${esc(meta.description)}" />
  <meta name="twitter:image" content="${esc(meta.og_image)}" />`;

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
