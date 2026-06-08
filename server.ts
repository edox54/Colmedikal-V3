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
Paso 2: Actualiza tu dashboard.html
Añade la llamada a checkAuth() cuando se carga la página:
html<script>
const API_URL = '/api';

async function checkAuth() {
  const token = localStorage.getItem('admin_token');
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      showDashboard();
      loadForms(); // ✅ AÑADIR ESTO
    } else {
      logout();
    }
  } catch (error) {
    console.error(error);
  }
}

async function login() {
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('admin_token', data.token);
      errorMsg.style.display = 'none';
      showDashboard();
      loadForms(); // ✅ AÑADIR ESTO
    } else {
      errorMsg.textContent = data.message || 'Error de autenticación';
      errorMsg.style.display = 'block';
    }
  } catch (error) {
    errorMsg.textContent = 'Error de conexión';
    errorMsg.style.display = 'block';
  }
}

function logout() {
  localStorage.removeItem('admin_token');
  document.getElementById('loginContainer').style.display = 'block';
  document.getElementById('dashboardContainer').style.display = 'none';
  document.getElementById('password').value = '';
}

async function loadForms() { // ✅ NUEVA FUNCIÓN
  const token = localStorage.getItem('admin_token');

  try {
    const res = await fetch(`${API_URL}/forms`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    const dataList = document.getElementById('dataList');

    if (data.success) {
      if (!data.forms || data.forms.length === 0) {
        dataList.innerHTML = '<p>No hay formularios registrados</p>';
        return;
      }

      dataList.innerHTML = data.forms.map(form => `
        <div class="form-card">
          <strong>Tipo:</strong> ${form.type}<br>
          <strong>Fecha:</strong> ${new Date(form.createdAt || Date.now()).toLocaleString()}<br>
          <pre style="margin-top: 10px; background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(form.data, null, 2)}</pre>
        </div>
      `).join('');
    } else {
      dataList.innerHTML = '<p>Error al cargar los datos</p>';
    }
  } catch (error) {
    console.error('Error cargando formularios:', error);
    document.getElementById('dataList').innerHTML = '<p>Error de conexión</p>';
  }
}

function showDashboard() {
  document.getElementById('loginContainer').style.display = 'none';
  document.getElementById('dashboardContainer').style.display = 'block';
}

// ✅ LLAMAR checkAuth() AL CARGAR LA PÁGINA
window.addEventListener('load', checkAuth);
</script>
