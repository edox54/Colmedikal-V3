# 📊 GUÍA DE ALMACENAMIENTO LOCAL DE FORMULARIOS

## Overview
Los formularios de Colmedikal se almacenan automáticamente en una base de datos SQLite local mientras se configura la integración con Kommo CRM. Esto asegura que no se pierda ningún dato.

---

## 📁 Ubicación de la Base de Datos

```
/home/colmedikal/colmedikal.com/data/forms.db
```

Tamaño actual: Se actualiza automáticamente con cada formulario
Respaldo recomendado: Semanal

---

## 🔍 OPCIÓN 1: Acceder via API REST (Recomendado)

### Ver todos los formularios:
```bash
curl https://colmedikal.com/api/forms
```

**Respuesta JSON:**
```json
{
  "success": true,
  "total": 5,
  "forms": [
    {
      "id": 1,
      "form_type": "contact",
      "form_data": {
        "name": "Carlos Testín",
        "email": "carlos@example.com",
        "phone": "0987654321",
        "city": "Quito",
        "subject": "Información sobre planes",
        "query": "Pregunta sobre cobertura"
      },
      "timestamp": "2026-06-08 04:15:30",
      "status": "pending",
      "email_sent": 1,
      "created_at": "2026-06-08 04:15:30"
    }
  ]
}
```

### Ver solo formularios de un tipo:
```bash
# Contacto
curl https://colmedikal.com/api/forms/contact

# Cotización
curl https://colmedikal.com/api/forms/quote

# Reembolso
curl https://colmedikal.com/api/forms/reimbursement
```

### Descargar como JSON:
```bash
curl https://colmedikal.com/api/forms > formularios_backup.json
```

---

## 🔧 OPCIÓN 2: Acceder via SQLite (Avanzado)

### Conectarse a la BD directamente:
```bash
cd /home/colmedikal/colmedikal.com
sqlite3 data/forms.db
```

### Comandos útiles en SQLite:

**Ver estructura de la tabla:**
```sql
.schema forms
```

**Ver todos los registros:**
```sql
SELECT * FROM forms;
```

**Ver formularios de un tipo específico:**
```sql
SELECT * FROM forms WHERE form_type = 'contact';
```

**Contar total de formularios:**
```sql
SELECT form_type, COUNT(*) as total FROM forms GROUP BY form_type;
```

**Ver formularios no sincronizados aún:**
```sql
SELECT * FROM forms WHERE status = 'pending';
```

**Exportar a CSV desde SQLite:**
```sql
.mode csv
.headers on
.output formularios.csv
SELECT * FROM forms;
.quit
```

**Salir de SQLite:**
```sql
.quit
```

---

## 📋 Estructura de la Tabla

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID único del registro |
| `form_type` | TEXT | Tipo: contact, quote, reimbursement |
| `form_data` | TEXT | Datos JSON del formulario |
| `timestamp` | DATETIME | Cuándo se recibió |
| `status` | TEXT | pending, synced, error |
| `kommo_lead_id` | INTEGER | ID del lead en Kommo (cuando se sincronice) |
| `email_sent` | BOOLEAN | Si se envió copia a backup |
| `created_at` | DATETIME | Fecha de creación |

---

## 💾 OPCIÓN 3: Hacer Respaldo Manual

### Crear backup de la BD:
```bash
cp /home/colmedikal/colmedikal.com/data/forms.db \
   /home/colmedikal/colmedikal.com/data/forms_backup_$(date +%Y%m%d_%H%M%S).db
```

### Automatizar respaldos (cron):
```bash
# Editar crontab
crontab -e

# Agregar esta línea para backup diario a las 3 AM
0 3 * * * cp /home/colmedikal/colmedikal.com/data/forms.db /home/colmedikal/colmedikal.com/data/backups/forms_$(date +\%Y\%m\%d).db

# Crear carpeta de backups primero:
mkdir -p /home/colmedikal/colmedikal.com/data/backups
```

---

## 📊 Ver Estadísticas de Formularios

```bash
# Conectar a BD
sqlite3 /home/colmedikal/colmedikal.com/data/forms.db << EOF
.mode box
SELECT
  form_type,
  COUNT(*) as total,
  SUM(CASE WHEN email_sent = 1 THEN 1 ELSE 0 END) as emails_sent,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendientes
FROM forms
GROUP BY form_type;
EOF
```

---

## 🔐 Seguridad

- ✅ BD no se sincroniza a GitHub (está en .gitignore)
- - ✅ Datos sensibles (emails) están protegidos localmente
  - - ✅ Se recomienda hacer backups semanales
    - - ✅ Solo el servidor tiene acceso a los datos
     
      - ---

      ## ⚠️ Importantes

      **NO hacer:**
      - No eliminar manualmente la BD (usa truncate TABLE si necesitas limpiar)
      - - No modificar datos directamente sin conocimiento técnico
        - - No compartir el archivo forms.db (contiene datos personales)
         
          - **Sí hacer:**
          - - Hacer backups regularmente
            - - Revisar el estado de los formularios semanalmente
              - - Limpiar formularios antiguos después de sincronizar a Kommo
               
                - ---

                ## 🔄 Sincronización con Kommo (Próximo Paso)

                Una vez que corrijas el error de TypeScript y Kommo esté configurado:

                ```bash
                # Ver formularios pendientes de sincronizar
                sqlite3 /home/colmedikal/colmedikal.com/data/forms.db \
                  "SELECT id, form_type FROM forms WHERE status = 'pending';"

                # Después de sincronizar, cambiar estado:
                sqlite3 /home/colmedikal/colmedikal.com/data/forms.db \
                  "UPDATE forms SET status = 'synced' WHERE kommo_lead_id IS NOT NULL;"
                ```

                ---

                ## 📞 Soporte

                Si tienes dudas sobre cómo acceder a los datos:
                - Opción 1 (API): La forma más fácil, accesible desde cualquier máquina
                - - Opción 2 (SQLite): Para análisis técnico profundo
                  - - Opción 3 (Respaldos): Para seguridad y archivado
