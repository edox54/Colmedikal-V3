import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { exec } from 'child_process';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para parsear JSON
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Webhook de GitHub para deploy automático
  app.post('/api/webhook/github', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return res.status(400).json({ error: 'Missing signature or secret' });
    }

    // Verificar la firma
    const payload = JSON.stringify(req.body);
    const hash = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Ejecutar el script de deploy
    exec('/home/colmedikal/scripts/deploy.sh', (error, stdout, stderr) => {
      if (error) {
        console.error(`Deploy error: ${error.message}`);
        return res.status(500).json({ error: 'Deploy failed', details: error.message });
      }
      console.log(`Deploy successful: ${stdout}`);
      res.json({ status: 'Deploy iniciado', message: stdout });
    });
  });

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
// Test webhook deploy Sat Jun  6 23:20:49 UTC 2026
