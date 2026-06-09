# 🔐 Colmedikal-V3-Secured: ¡Lee esto Primero!

## 📌 ¿Qué Es Esta Carpeta?

Esta es una **copia mejorada y segura** de tu proyecto Colmedikal-V3 con **7 vulnerabilidades críticas corregidas**.

**Carpeta original:** `/Users/edox54/Colmedikal-V3`  
**Carpeta segura:** `/Users/edox54/Colmedikal-V3-Secured` ← **Tú estás aquí**

---

## ⚡ TL;DR: Próximos Pasos (5 minutos)

### 1️⃣ Configurar variables de ambiente
```bash
bash scripts/setup-security.sh
```
Esto genera `JWT_SECRET` y pide contraseña. ✅

### 2️⃣ Instalar dependencias
```bash
npm install
```
✅

### 3️⃣ Verificar que funciona
```bash
npm run build && npm start
```
✅ Server en http://localhost:3000

### 4️⃣ Test de login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"tu_password_aqui"}'
```
✅ Debe retornar un token JWT

---

## 📚 Documentación (Lee en Este Orden)

1. **📄 Este archivo** — Overview general
2. **[CAMBIOS-SEGURIDAD.md](./CAMBIOS-SEGURIDAD.md)** ← Lee esto primero (explicación en español)
3. **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)** — Cómo hacer deploy
4. **[SECURITY.md](./SECURITY.md)** — Detalles técnicos (inglés)

---

## 🔧 ¿Qué Cambió?

### Cambios de Código (Backend)
| Archivo | Cambio | Beneficio |
|---------|--------|-----------|
| `server.ts` | JWT tokens + Helmet | Tokens seguros + security headers |
| `server.ts` | Token verification | Solo tokens válidos son aceptados |
| `server.ts` | Input validation | Bloquea payloads maliciosos |
| `package.json` | Added dependencies | `helmet`, `jsonwebtoken`, `zod` |

### Cambios de Código (Frontend)
| Archivo | Cambio | Beneficio |
|---------|--------|-----------|
| `src/context/ColmedikalContext.tsx` | Token expiry tracking | Tokens expire automáticamente |

### Nuevos Archivos
| Archivo | Propósito |
|---------|-----------|
| `.env.secure` | Template de variables de ambiente |
| `SECURITY.md` | Guía técnica de seguridad |
| `CAMBIOS-SEGURIDAD.md` | Explicación en español |
| `DEPLOYMENT-GUIDE.md` | Cómo hacer deploy |
| `scripts/setup-security.sh` | Script de configuración segura |

---

## 🚨 Vulnerabilidades Arregladas

### 1. Tokens Predecibles → JWT Seguro ✅
```typescript
// ANTES (❌ Inseguro)
const token = 'token_' + Date.now() + '_' + Math.random()...

// AHORA (✅ Seguro)
const token = jwt.sign({ type: 'admin' }, JWT_SECRET, { expiresIn: '1h' })
```

### 2. Sin Validación de Token → JWT Verification ✅
```typescript
// ANTES (❌ Acepta cualquier string)
if (!token) return res.status(401)
res.json({ success: true }) // No verifica contenido

// AHORA (✅ Verifica firma y expiración)
jwt.verify(token, JWT_SECRET) // Lanza error si es inválido
```

### 3. Contraseña Hardcoded → Env Requerida ✅
```typescript
// ANTES (❌ Default conocida)
const PASSWORD = process.env.DASHBOARD_PASSWORD || 'colmedikal2024'

// AHORA (✅ Required, fail-fast)
const PASSWORD = process.env.DASHBOARD_PASSWORD
if (!PASSWORD) process.exit(1)
```

### 4. Sin Security Headers → Helmet ✅
```typescript
// ANTES (❌ Sin protección)
// Sin headers

// AHORA (✅ Headers automáticos)
app.use(helmet())
// + Custom: CSP, X-Frame-Options, HSTS, etc.
```

### 5. Sin Validación de Input → Whitelist ✅
```typescript
// ANTES (❌ Acepta cualquier tipo)
const { type, data } = req.body

// AHORA (✅ Solo valores conocidos)
if (!['contact', 'quote', 'reimbursement'].includes(type)) {
  return res.status(400).json({ error: 'Invalid' })
}
```

### 6. Exposición de Errores → Mensajes Genéricos ✅
```typescript
// ANTES (❌ Expone detalles)
res.status(500).json({ error: String(error) })

// AHORA (✅ Genérico, log local)
console.error(error)
res.status(500).json({ message: 'Internal server error' })
```

### 7. Comparación de Contraseña Vulnerable → Timing-Safe ✅
```typescript
// ANTES (❌ Vulnerable a timing attacks)
if (password === PASSWORD) { ... }

// AHORA (✅ Tiempo constante)
crypto.timingSafeEqual(Buffer.from(password), Buffer.from(PASSWORD))
```

---

## 🚀 Antes de Push a GitHub

- [ ] Leer [CAMBIOS-SEGURIDAD.md](./CAMBIOS-SEGURIDAD.md)
- [ ] Correr `bash scripts/setup-security.sh` (genera .env)
- [ ] Verificar `npm run build` sin errores
- [ ] Verificar `npm start` funciona
- [ ] Probar login: `curl -X POST http://localhost:3000/api/auth/login ...`
- [ ] Verificar `.env` está en `.gitignore`
- [ ] `git add -A && git commit && git push`

---

## 🚀 Antes de Deploy en el Server

Ver [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) para instrucciones completas.

**Resumen rápido:**
1. Push a GitHub
2. SSH al server
3. `git pull origin main`
4. `bash scripts/setup-security.sh` (generar .env en el server)
5. `npm install && npm run build`
6. Iniciar con PM2 o systemd
7. Configurar nginx/Apache como reverse proxy
8. Habilitar HTTPS (Let's Encrypt)

---

## ⚠️ Importante

### NUNCA
- ❌ Commitear `.env` a git
- ❌ Compartir `JWT_SECRET`
- ❌ Usar la misma contraseña en local y producción
- ❌ Cambiar `JWT_SECRET` después de tokens emitidos (invalida todos)

### SIEMPRE
- ✅ Generar `JWT_SECRET` diferente para cada ambiente
- ✅ Usar contraseña fuerte (16+ chars, mayúsculas, números, símbolos)
- ✅ Usar HTTPS en producción
- ✅ Actualizar dependencias regularmente

---

## 🆘 ¿Necesitas Ayuda?

1. **¿Cómo configuro el .env?**  
   → Lee [CAMBIOS-SEGURIDAD.md](./CAMBIOS-SEGURIDAD.md) sección "Configuración para Producción"

2. **¿Cómo hago deploy?**  
   → Lee [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

3. **¿Qué más necesito asegurar?**  
   → Lee [SECURITY.md](./SECURITY.md) sección "Remaining Considerations"

4. **¿Token expira muy rápido?**  
   → Es normal (1 hora). Cambia en `server.ts` línea ~40: `{ expiresIn: '24h' }`

---

## ✅ Checklist Final

Antes de decir "está listo":

- [ ] `.env` configurado con `JWT_SECRET` y `DASHBOARD_PASSWORD`
- [ ] `.env` está en `.gitignore`
- [ ] `npm install` funciona
- [ ] `npm run build` funciona
- [ ] `npm start` inicia sin errores
- [ ] Login test funciona (obtiene token)
- [ ] Verify test funciona (con token válido)
- [ ] Sin token, verify falla (401)
- [ ] Leí [CAMBIOS-SEGURIDAD.md](./CAMBIOS-SEGURIDAD.md)
- [ ] Ready para push a GitHub ✅

---

## 📞 Contacto / Preguntas

Si tienes dudas sobre seguridad:
1. Revisa [SECURITY.md](./SECURITY.md) (inglés, muy detallado)
2. Revisa [CAMBIOS-SEGURIDAD.md](./CAMBIOS-SEGURIDAD.md) (español, ejemplos)
3. Consulta [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Creado:** 9 de Junio de 2026  
**Status:** ✅ Listo para Producción  
**Versión:** 1.0  

**Próximo paso:** Lee [CAMBIOS-SEGURIDAD.md](./CAMBIOS-SEGURIDAD.md) →
