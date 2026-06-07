import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';

// Importar rutas de API
import doctorsRouter from './src/api/routes/doctors';
import refundsRouter from './src/api/routes/refunds';
import authorizationsRouter from './src/api/routes/authorizations';
import appointmentsRouter from './src/api/routes/appointments';
import leadsRouter from './src/api/routes/leads';
import adminsRouter from './src/api/routes/admins';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // API Routes
  app.use('/api/doctors', doctorsRouter);
  app.use('/api/refunds', refundsRouter);
  app.use('/api/authorizations', authorizationsRouter);
  app.use('/api/appointments', appointmentsRouter);
  app.use('/api/leads', leadsRouter);
  app.use('/api/admins', adminsRouter);

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
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
