# Guía de Desarrollo - Colmedikal V3

## 📋 Resumen

Este documento contiene mejores prácticas, patrones de código, y guías para desarrollar en Colmedikal V3.

---

## 🏗️ Arquitectura

### Estructura de Carpetas
```
src/
├── components/          # Componentes React
│   ├── layout/         # Componentes de layout (Header, Footer)
│   ├── pages/          # Componentes de páginas
│   └── shared/         # Componentes reutilizables
├── context/            # React Context (estado global)
├── utils/              # Funciones utilitarias
│   ├── validation.ts   # Validación de formularios
│   ├── security.ts     # Funciones de seguridad
│   ├── errorHandler.ts # Manejo de errores
│   ├── quoteCalculator.ts # Cálculo de cotizaciones
│   └── crm.ts          # Integración CRM
├── types.ts            # Definiciones TypeScript
├── data/               # Datos estáticos
└── seo/                # SEO y esquemas

```

### Patrones Arquitectónicos

1. **Componentes Funcionales**: Todos son functional components con hooks
2. **Custom Hooks**: Para lógica reutilizable
3. **Context API**: Para estado global (no Redux por ahora)
4. **Composition over Inheritance**: Componentes pequeños y composables
5. **Separación de Concerns**: UI, lógica, datos separados

---

## 🎨 Componentes Compartidos

### Usando Componentes Compartidos

```typescript
// Formularios
import { FormInput, FormSelect, FormTextarea, FormFileInput } from '@/components/shared/FormInput';

// Botones
import { Button, ButtonGroup } from '@/components/shared/Button';

// Alertas
import { Alert, AlertList } from '@/components/shared/Alert';

// Badges de estado
import { Badge, StatusBadge } from '@/components/shared/Badge';

// Tablas de datos
import { DataTable, Column } from '@/components/shared/DataTable';
```

### Ejemplo: Crear un Formulario

```typescript
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');

const handleEmailChange = (value: string) => {
  setEmail(value);
  const validation = validators.email(value);
  setEmailError(validation.valid ? '' : validation.error);
};

return (
  <FormInput
    label="Correo Electrónico"
    type="email"
    value={email}
    onChange={handleEmailChange}
    error={emailError}
    required
    placeholder="tu@email.com"
  />
);
```

---

## ✅ Validación de Formularios

### Sistema de Validación

```typescript
import { validators } from '@/utils/validation';

// Validar email
const emailResult = validators.email('test@example.com');
if (!emailResult.valid) {
  console.error(emailResult.error);
}

// Validar monto (permite decimales)
const amountResult = validators.amount('123.45');

// Validar cédula ecuatoriana
const cedulaResult = validators.cedula('1234567890');

// Validar teléfono
const phoneResult = validators.phone('0999999999');
```

### Validación en Batch

```typescript
import { validateForm } from '@/utils/validation';

const data = { name: 'Juan', email: 'test@email.com', age: 25 };
const rules = {
  name: (v) => validators.name(v),
  email: (v) => validators.email(v),
  age: (v) => validators.age(v),
};

const { isValid, errors } = validateForm(data, rules);
```

---

## 🔒 Seguridad

### Sanitización de Entrada

```typescript
import { sanitizeInput, detectMaliciousInput } from '@/utils/security';

// Limpiar input del usuario
const cleanInput = sanitizeInput(userInput);

// Detectar patrones maliciosos
if (detectMaliciousInput(userInput)) {
  throw new Error('Entrada maliciosa detectada');
}

// Sanitizar objeto
const safeData = sanitizeFormData(userFormData);
```

### Prevención de XSS

```typescript
import { encodeHtmlEntities, sanitizeHtml } from '@/utils/security';

// En render
<div>{encodeHtmlEntities(userContent)}</div>
```

### Manejo de Errores Seguro

```typescript
import { safeLocalStorage, safeJsonParse } from '@/utils/errorHandler';

// Guardar datos de forma segura
safeLocalStorage.setItem('user_data', userData);

// Obtener datos de forma segura
const userData = safeLocalStorage.getItem('user_data', {});

// Parsear JSON de forma segura
const parsed = safeJsonParse(jsonString, {});
```

---

## 🛠️ Manejo de Errores

### Usar ErrorHandler

```typescript
import { 
  ColmedikalError, 
  ErrorCodes, 
  getErrorMessage,
  logError,
  handleAsyncError 
} from '@/utils/errorHandler';

// Crear error
throw new ColmedikalError(
  ErrorCodes.VALIDATION_ERROR,
  'El email no es válido',
  400,
  { field: 'email' }
);

// Obtener mensaje amigable
const message = getErrorMessage(ErrorCodes.INVALID_EMAIL);

// Manejar async sin try-catch
const { success, data, error } = await handleAsyncError(
  async () => await fetch('/api/data'),
  ErrorCodes.NETWORK_ERROR,
  'fetchData'
);

if (!success) {
  console.error(error?.message);
}
```

---

## 💰 Cálculo de Cotizaciones

### Usar Quote Calculator

```typescript
import { 
  calculateQuotePrice, 
  validateQuoteInput,
  formatPrice,
  getMonthlyPrice 
} from '@/utils/quoteCalculator';

const input = {
  planId: 'plan1',
  planType: 'familiar',
  primaryAge: 35,
  partnerAge: 32,
  childrenAges: [8, 5],
  hasPreexistingConditions: false,
};

// Validar
const { valid, errors } = validateQuoteInput(input);
if (!valid) return handleErrors(errors);

// Calcular
const { total, breakdown } = calculateQuotePrice(15, input);
console.log(formatPrice(total)); // "$285.00 USD"
console.log(getMonthlyPrice(total)); // 23.75
```

---

## 📝 Creación de Componentes

### Template de Componente Funcional

```typescript
import React, { useState, useEffect } from 'react';
import { Icon } from 'lucide-react';
import { useColmedikal } from '@/context/ColmedikalContext';
import { validators } from '@/utils/validation';

interface MyComponentProps {
  title: string;
  onClose?: () => void;
}

export default function MyComponent({ title, onClose }: MyComponentProps) {
  const [state, setState] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { /* context */ } = useColmedikal();

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    // Validate logic
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Do something
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2>{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields */}
      </form>
    </div>
  );
}
```

---

## 🎯 Mejores Prácticas

### ✅ DO's

1. **Validar siempre en el cliente Y servidor**
   ```typescript
   // Cliente
   const { valid, error } = validators.email(email);
   // Servidor (cuando exista): validar nuevamente
   ```

2. **Usar componentes compartidos**
   ```typescript
   import { Button } from '@/components/shared/Button';
   <Button variant="primary" size="md">Enviar</Button>
   ```

3. **Sanitizar entrada del usuario**
   ```typescript
   const clean = sanitizeInput(userInput);
   ```

4. **Manejar errores apropiadamente**
   ```typescript
   try {
     // something
   } catch (error) {
     logError(error);
     setError(getErrorMessage(errorCode));
   }
   ```

5. **Usar tipos TypeScript**
   ```typescript
   interface FormData {
     email: string;
     amount: number;
   }
   ```

### ❌ DON'Ts

1. **NO usar eval() o dangerouslySetInnerHTML**
   ```typescript
   // ❌ Nunca
   <div dangerouslySetInnerHTML={{ __html: userContent }} />
   
   // ✅ Hacer esto
   <div>{encodeHtmlEntities(userContent)}</div>
   ```

2. **NO guardar datos sensibles en localStorage sin encriptación**
   ```typescript
   // ❌
   localStorage.setItem('password', password);
   
   // ✅
   secureStorage.setItem('password', password);
   ```

3. **NO confiar en validación solo de cliente**
   ```typescript
   // ❌ Insuficiente
   if (email.includes('@')) { /* create account */ }
   
   // ✅
   const { valid } = validators.email(email);
   if (valid) { /* send to API for server validation */ }
   ```

4. **NO usar Math.random para IDs**
   ```typescript
   // ❌
   const id = `ID-${Math.random()}`;
   
   // ✅
   const id = generateSecureId('ID');
   ```

5. **NO duplicar código de formulario**
   ```typescript
   // ❌ Repetir mismo input en múltiples componentes
   
   // ✅ Crear componente reutilizable
   <FormInput label="Email" ... />
   ```

---

## 🧪 Testing

### Validación en Componentes

```typescript
// Test de validación
describe('FormInput', () => {
  it('should show error for invalid email', () => {
    const result = validators.email('invalid');
    expect(result.valid).toBe(false);
  });
});
```

---

## 📱 Accesibilidad (a11y)

### Mejores Prácticas

1. **Usar labels con inputs**
   ```typescript
   <label htmlFor="email">Email</label>
   <input id="email" type="email" />
   ```

2. **ARIA labels donde necesario**
   ```typescript
   <button aria-label="Cerrar" onClick={onClose}>×</button>
   ```

3. **Semantic HTML**
   ```typescript
   // ✅ Usar nav, main, section, article
   <nav>Navigation</nav>
   <main>Content</main>
   <section>Section</section>
   ```

4. **Color no como único indicador**
   ```typescript
   // ✅ Usar texto + color
   <span className="text-red-600">❌ Error</span>
   ```

---

## 🚀 Performance

### Code Splitting

```typescript
const AdminPanel = lazy(() => import('@/pages/Admin'));
const Blog = lazy(() => import('@/pages/Blog'));

<Suspense fallback={<Spinner />}>
  <AdminPanel />
</Suspense>
```

### Memoization

```typescript
const MemoizedComponent = memo(Component);
```

### useCallback para event handlers

```typescript
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

---

## 📚 Recursos

- [TypeScript Docs](https://www.typescriptlang.org/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [OWASP Security](https://owasp.org/www-project-top-ten/)

---

## 📞 Preguntas?

Consulta el archivo AUDIT_REPORT.md para más contexto sobre la arquitectura y vulnerabilidades conocidas.
