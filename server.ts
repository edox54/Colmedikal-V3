import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'colmedikal123'; // CAMBIAR ESTO

// Generar token simple (para producción usar JWT)
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

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
        const token = generateToken();
        // Guardar token en memoria (o en BD para mejor seguridad)
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
      
      // Aquí podrías validar el token contra una BD
      // Por ahora solo verificamos que exista
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
    // Serve static files in the dist folder
    app.use(express.static(distPath));
    // Provide general routing fallback to index.html for react-router-dom
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
