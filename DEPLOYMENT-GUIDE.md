# 🚀 Colmedikal-V3-Secured: Guía de Deployment

## 📌 Resumen: ¿Qué Cambió?

Este repositorio (`Colmedikal-V3-Secured`) contiene **todas las mejoras de seguridad** necesarias para proteger la aplicación en producción.

### Cambios de Seguridad (7 fixes críticos) ✅
1. ✅ JWT tokens criptográficamente seguros (no más tokens predecibles)
2. ✅ Validación de contraseña resistente a timing attacks
3. ✅ Variables de ambiente requeridas (fail-fast si faltan)
4. ✅ Token verification middleware (JWT validation)
5. ✅ Input validation en formularios (whitelist)
6. ✅ Security headers automáticos (Helmet + custom)
7. ✅ No exponemos errores detallados al cliente

**Documentación:**
- `SECURITY.md` — Documentación técnica en inglés
- `CAMBIOS-SEGURIDAD.md` — Explicación detallada en español
- `DEPLOYMENT-GUIDE.md` — Este archivo

---

## 🔧 Instalación Local

### 1. Copiar y navegar al directorio
```bash
cd /Users/edox54/Colmedikal-V3-Secured
```

### 2. Configurar variables de ambiente (opción A: asistente)
```bash
# Ejecutar el script helper (recomendado)
bash scripts/setup-security.sh

# Esto:
# - Genera JWT_SECRET seguro
# - Pide contraseña y valida fortaleza
# - Crea .env con permisos seguros (600)
# - Agrega .env a .gitignore
```

### 2. Configurar variables de ambiente (opción B: manual)
```bash
# Copiar template
cp .env.secure .env

# Generar JWT_SECRET
openssl rand -base64 32
# Copiar el output a JWT_SECRET en .env

# Agregar contraseña fuerte
# Editar .env y cambiar DASHBOARD_PASSWORD

# Verificar:
cat .env
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Verificar build
```bash
npm run build
```

### 5. Probar localmente
```bash
npm start
# Server estará en http://localhost:3000
```

---

## ✅ Pre-deployment Checklist

Antes de hacer push y deploy:

- [ ] `JWT_SECRET` configurado en `.env` (32 caracteres base64)
- [ ] `DASHBOARD_PASSWORD` es fuerte (16+ chars, mayúsculas, números, símbolos)
- [ ] `.env` está en `.gitignore` (verificar: `git check-ignore .env`)
- [ ] `npm run build` funciona sin errores
- [ ] `npm start` inicia el servidor correctamente
- [ ] Test de login funciona:
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"password":"tu_password"}'
  ```
- [ ] Test de verify con token funciona
- [ ] Test de verify sin token falla (401)
- [ ] Test de token expirado falla (después de 1 hora)

---

## 📤 Subir a GitHub

### 1. Agregar cambios
```bash
cd /Users/edox54/Colmedikal-V3-Secured

# Ver qué cambió
git status

# Agregar archivos (excepto .env)
git add -A

# Verificar que .env NO se agregó
git status | grep "\.env"  # Debe estar vacío o no mostrar .env
```

### 2. Crear commit
```bash
git commit -m "Security hardening: JWT tokens, input validation, security headers

- Replace weak token generation with JWT (1h expiration)
- Add timing-safe password comparison (crypto.timingSafeEqual)
- Require JWT_SECRET and DASHBOARD_PASSWORD env vars (fail-fast)
- Implement token verification middleware
- Add input validation (whitelist form types)
- Deploy helmet + custom security headers
- Hide error details from clients

New dependencies: helmet, jsonwebtoken, zod

Documentation:
- SECURITY.md: Technical security guide
- CAMBIOS-SEGURIDAD.md: Detailed changes in Spanish
- scripts/setup-security.sh: Interactive setup script"
```

### 3. Push a GitHub
```bash
git push origin main
# O tu rama actual: git push origin <branch-name>
```

### 4. Verificar en GitHub
```bash
open https://github.com/edox54/Colmedikal-V3
# Verifica que los archivos se subieron correctamente
# Verifica que .env NO está en el repositorio
```

---

## 🚀 Deploy en el Server

### 1. SSH al servidor
```bash
ssh user@colmedikal.com
# O tu servidor de hosting
```

### 2. Clonar/actualizar repositorio
```bash
# Si es la primera vez:
git clone https://github.com/edox54/Colmedikal-V3.git
cd Colmedikal-V3

# Si ya existe:
cd Colmedikal-V3
git pull origin main
```

### 3. Configurar variables de ambiente en el servidor
```bash
# En el servidor, crear .env (NO copiar del local)
nano .env

# Agregar:
# JWT_SECRET=<valor_generado_en_servidor>
# DASHBOARD_PASSWORD=<tu_password>
# NODE_ENV=production
```

**IMPORTANTE:** Generar `JWT_SECRET` DIFERENTE en el servidor
```bash
# En el servidor:
openssl rand -base64 32
# Copiar output a .env → JWT_SECRET
```

### 4. Instalar dependencias
```bash
npm install --production
# O:
npm ci --production
```

### 5. Build
```bash
npm run build
```

### 6. Iniciar aplicación

**Opción A: Manual (para testing)**
```bash
npm start
# Logs en consola
```

**Opción B: PM2 (recomendado para producción)**
```bash
npm install -g pm2

pm2 start dist/server.cjs --name "colmedikal"
pm2 save
pm2 startup

# Ver logs:
pm2 logs colmedikal

# Reiniciar:
pm2 restart colmedikal
```

**Opción C: Systemd (si es VPS/CloudLinux)**
```bash
# Crear /etc/systemd/system/colmedikal.service
[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/colmedikal
ExecStart=/usr/bin/node dist/server.cjs
EnvironmentFile=/var/www/colmedikal/.env
Restart=always
RestartSec=10

# Habilitar y iniciar:
sudo systemctl enable colmedikal
sudo systemctl start colmedikal
sudo systemctl status colmedikal
```

### 7. Configurar reverse proxy (nginx/Apache)

**Nginx example:**
```nginx
server {
    listen 80;
    server_name colmedikal.com www.colmedikal.com;
    
    # Redirect HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name colmedikal.com www.colmedikal.com;
    
    ssl_certificate /etc/ssl/certs/colmedikal.crt;
    ssl_certificate_key /etc/ssl/private/colmedikal.key;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8. Test en producción
```bash
# Desde tu máquina local:
curl https://colmedikal.com/api/health
# Respuesta esperada: {"status":"ok"}

curl -X POST https://colmedikal.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"tu_password"}'
# Respuesta esperada: {"success":true,"token":"eyJhbGc..."}
```

---

## 🔒 Seguridad en Producción

### Verificar que todo está seguro:

```bash
# 1. Verificar que HTTPS está habilitado
curl -I https://colmedikal.com | grep "Strict-Transport-Security"
# Debe mostrar: Strict-Transport-Security: max-age=31536000...

# 2. Verificar que .env NO es accesible
curl https://colmedikal.com/.env
# Debe retornar: 404 Not Found (o ser bloqueado)

# 3. Verificar que tokens expiran después de 1 hora
# Login y prueba el mismo token después de 61 minutos
# Debe fallar con: 403 Forbidden

# 4. Verificar que errores no son expostos
# Enviar request malformada
curl -X GET https://colmedikal.com/api/invalid
# Debe retornar error genérico, no detalles del servidor
```

---

## 📊 Monitoreo Post-Deployment

### Logs a monitorear:
```bash
# PM2
pm2 logs colmedikal

# Systemd
journalctl -u colmedikal -f

# Buscar errores de autenticación
grep "Auth Error" logs/app.log
```

### Métricas importantes:
- ✅ Tiempos de respuesta de `/api/auth/login` (< 500ms normal, > 2s = problema)
- ✅ Intentos fallidos de login (spike = posible ataque)
- ✅ Errores de token expirado (esperado después de 1h)
- ✅ Uso de CPU y memoria (pm2 monit)

---

## 🆘 Troubleshooting

### Error: "FATAL: JWT_SECRET environment variable is required"
**Solución:**
```bash
# .env no está cargado o JWT_SECRET no está configurado
nano .env
# Verificar que JWT_SECRET está:
# JWT_SECRET=abc123...
```

### Error: "DASHBOARD_PASSWORD environment variable is required"
**Solución:**
```bash
nano .env
# Verificar que DASHBOARD_PASSWORD está configurado
```

### Token inválido/expirado
**Problema:** Login fue hace más de 1 hora  
**Solución:** Usuario debe hacer login nuevamente (tokens expiran a propósito)

### CORS errors en frontend
**Solución:**
```bash
# Si el frontend está en dominio diferente, agregar CORS en server.ts:
import cors from 'cors';
app.use(cors({
  origin: 'https://tu-frontend-domain.com',
  credentials: true
}));
```

### Request timeout en login
**Verificar:**
```bash
# 1. Servidor está corriendo
curl http://localhost:3000/api/health

# 2. Firewall no bloquea puerto 3000
# 3. Reverse proxy timeout es suficiente (nginx: proxy_read_timeout 60s;)
```

---

## 📚 Documentación Relacionada

- **SECURITY.md** — Detalles técnicos de seguridad (inglés)
- **CAMBIOS-SEGURIDAD.md** — Cambios explicados (español)
- **OWASP Top 10 2025** — https://owasp.org/www-project-top-ten/
- **Express.js Security** — https://expressjs.com/en/advanced/best-practice-security.html

---

## ✅ Próximos Pasos (Después del Deployment)

Después de que el sitio esté en línea:

1. ✅ Habilitar HTTPS (Let's Encrypt es gratis)
2. ✅ Configurar backups automáticos de base de datos
3. ✅ Implementar rate limiting en `/api/auth/login`
4. ✅ Configurar logging y monitoreo de seguridad
5. ✅ Revisar permisos IDOR en backend API (`api.colmedikal.com`)
6. ✅ Encriptar datos sensibles en base de datos

---

**Última actualización:** 9 de Junio de 2026  
**Versión:** 1.0  
**Status:** ✅ Listo para Producción

¿Preguntas? Revisa SECURITY.md o CAMBIOS-SEGURIDAD.md
