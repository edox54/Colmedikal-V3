import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'colmedikal2024';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // ✅ MIDDLEWARE GLOBAL PARA JSON
  app.use(express.json());
  app.use(express.static('public')); // Servir archivos estáticos de public/

  // ✅ API ROUTES DEBEN IR PRIMERO (antes de Vite/dist)
  
  // ENDPOINTS DE AUTENTICACIÓN
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ success: false, message: 'Contraseña requerida' });
      }

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

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Endpoint para recibir datos de formularios
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

  // ✅ VITE/DIST ROUTES VAN DESPUÉS
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
