import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'colmedikal2024';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // ✅ IMPORTANTE: CORS MIDDLEWARE - DEBE VENIR PRIMERO
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ✅ Middleware para JSON
  app.use(express.json());
  
  // ✅ Servir archivos estáticos de public/
  app.use(express.static('public'));

  // ✅ API ROUTES - Deben ir ANTES de Vite/dist

  // ENDPOINT DE AUTENTICACIÓN
  app.post('/api/auth/login', async (req, res) => {
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

  // VERIFICAR TOKEN
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

  // OBTENER FORMULARIOS
  app.get('/api/forms', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    res.json({ success: true, forms: [] });
  });

  // HEALTH CHECK
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // RECIBIR FORMULARIOS
  app.post('/api/forms/submit', async (req, res) => {
    try {
      const { type, data } = req.body;

      console.log(`[API] Formulario ${type} recibido:`, data);

      res.json({
        success: true,
        message: `Formulario ${type} procesado correctamente`
      });
    } catch (error) {
      console.error('[API Error]', error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // ✅ VITE/DIST ROUTES - VAN AL FINAL
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProd = process.env.NODE_ENV === 'production' || hasDist;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
