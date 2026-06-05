// Validation utilities for forms and data
export const validators = {
  email: (email: string): { valid: boolean; error?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim().length === 0) {
      return { valid: false, error: 'Email es requerido' };
    }
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Email inválido' };
    }
    return { valid: true };
  },

  phone: (phone: string): { valid: boolean; error?: string } => {
    const phoneRegex = /^(\+593|0)?[0-9]{9,10}$/;
    if (!phone || phone.trim().length === 0) {
      return { valid: false, error: 'Teléfono es requerido' };
    }
    if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) {
      return { valid: false, error: 'Teléfono inválido (use formato 593 9 XXXXXXXX)' };
    }
    return { valid: true };
  },

  amount: (amount: string | number): { valid: boolean; error?: string } => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) {
      return { valid: false, error: 'Monto debe ser un número' };
    }
    if (num <= 0) {
      return { valid: false, error: 'Monto debe ser mayor que 0' };
    }
    if (num > 1000000) {
      return { valid: false, error: 'Monto excede límite máximo ($1,000,000)' };
    }
    if (!/^\d+(\.\d{1,2})?$/.test(num.toString())) {
      return { valid: false, error: 'Máximo 2 decimales permitidos' };
    }
    return { valid: true };
  },

  invoiceNumber: (invoice: string): { valid: boolean; error?: string } => {
    if (!invoice || invoice.trim().length === 0) {
      return { valid: false, error: 'Número de factura es requerido' };
    }
    const invoiceRegex = /^(\d{3}-\d{3}-\d{8}|[A-Z0-9]{1,20})$/;
    if (!invoiceRegex.test(invoice.trim())) {
      return { valid: false, error: 'Formato de factura inválido (ej: 001-001-000000001)' };
    }
    return { valid: true };
  },

  cedula: (cedula: string): { valid: boolean; error?: string } => {
    const cedulaRegex = /^\d{10}$/;
    if (!cedula || cedula.trim().length === 0) {
      return { valid: false, error: 'Cédula es requerida' };
    }
    if (!cedulaRegex.test(cedula.replace(/[-\s]/g, ''))) {
      return { valid: false, error: 'Cédula debe tener 10 dígitos' };
    }
    return { valid: true };
  },

  name: (name: string): { valid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Nombre es requerido' };
    }
    if (name.trim().length < 3) {
      return { valid: false, error: 'Nombre debe tener al menos 3 caracteres' };
    }
    if (name.length > 100) {
      return { valid: false, error: 'Nombre muy largo' };
    }
    return { valid: true };
  },

  password: (password: string): { valid: boolean; error?: string } => {
    if (!password || password.length === 0) {
      return { valid: false, error: 'Contraseña es requerida' };
    }
    if (password.length < 6) {
      return { valid: false, error: 'Contraseña debe tener al menos 6 caracteres' };
    }
    return { valid: true };
  },

  file: (file: File | null): { valid: boolean; error?: string } => {
    if (!file) {
      return { valid: false, error: 'Archivo es requerido' };
    }
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMA * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `Archivo no debe exceder ${maxSizeMA}MB` };
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de archivo no permitido (PDF, JPG, PNG, DOC)' };
    }
    return { valid: true };
  },

  age: (age: number): { valid: boolean; error?: string } => {
    if (age < 18) {
      return { valid: false, error: 'Debe ser mayor de 18 años' };
    }
    if (age > 125) {
      return { valid: false, error: 'Edad inválida' };
    }
    return { valid: true };
  },

  url: (url: string): { valid: boolean; error?: string } => {
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, error: 'URL inválida' };
    }
  },
};

// Batch validation for forms
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => { valid: boolean; error?: string }>
) => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.entries(rules).forEach(([field, validator]) => {
    const result = validator(data[field]);
    if (!result.valid) {
      errors[field] = result.error || 'Campo inválido';
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Sanitize string input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent XSS
    .substring(0, 500); // Limit length
};

// Generate secure random ID (replaces Math.random)
export const generateSecureId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}-${timestamp}${randomPart}` : `${timestamp}${randomPart}`;
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format phone number
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Check if email is from test/demo
export const isDemoEmail = (email: string): boolean => {
  const demoPatterns = ['demo@', 'test@', 'example@', 'colmedikal@'];
  return demoPatterns.some(pattern => email.toLowerCase().includes(pattern));
};

const maxSizeMA = 5;
