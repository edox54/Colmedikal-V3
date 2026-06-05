// Global error handling utilities

export class ColmedikalError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ColmedikalError';
  }
}

export const ErrorCodes = {
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_FILE: 'INVALID_FILE',

  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Business logic errors
  QUOTE_CALCULATION_ERROR: 'QUOTE_CALCULATION_ERROR',
  REFUND_SUBMISSION_ERROR: 'REFUND_SUBMISSION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  APPOINTMENT_BOOKING_ERROR: 'APPOINTMENT_BOOKING_ERROR',

  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',

  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
} as const;

// User-friendly error messages in Spanish
const errorMessages: Record<string, string> = {
  [ErrorCodes.VALIDATION_ERROR]: 'Por favor verifica los datos ingresados',
  [ErrorCodes.INVALID_EMAIL]: 'El correo electrónico no es válido',
  [ErrorCodes.INVALID_PHONE]: 'El teléfono no es válido',
  [ErrorCodes.INVALID_AMOUNT]: 'El monto debe ser un número válido',
  [ErrorCodes.INVALID_FILE]: 'El archivo no es válido',
  [ErrorCodes.UNAUTHORIZED]: 'Debes iniciar sesión para continuar',
  [ErrorCodes.FORBIDDEN]: 'No tienes permisos para realizar esta acción',
  [ErrorCodes.SESSION_EXPIRED]: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
  [ErrorCodes.QUOTE_CALCULATION_ERROR]: 'Error al calcular la cotización. Intenta nuevamente',
  [ErrorCodes.REFUND_SUBMISSION_ERROR]: 'Error al enviar la solicitud de reembolso',
  [ErrorCodes.AUTHORIZATION_ERROR]: 'Error al procesar la autorización médica',
  [ErrorCodes.APPOINTMENT_BOOKING_ERROR]: 'Error al agendar la cita',
  [ErrorCodes.INTERNAL_ERROR]: 'Ocurrió un error interno. Por favor intenta más tarde',
  [ErrorCodes.NETWORK_ERROR]: 'Error de conexión. Verifica tu internet',
  [ErrorCodes.STORAGE_ERROR]: 'Error al guardar datos. Intenta nuevamente',
  [ErrorCodes.FILE_TOO_LARGE]: 'El archivo es demasiado grande',
  [ErrorCodes.INVALID_FILE_TYPE]: 'Tipo de archivo no permitido',
  [ErrorCodes.FILE_UPLOAD_ERROR]: 'Error al cargar el archivo',
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (code: string, fallback?: string): string => {
  return errorMessages[code] || fallback || 'Ocurrió un error inesperado';
};

/**
 * Log error to console in development
 */
export const logError = (
  error: Error | ColmedikalError,
  context?: string
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'Error'}]`, error);
  }

  // In production, could send to error tracking service (Sentry, etc)
  // sendToErrorTracking(error, context);
};

/**
 * Handle async errors with proper logging
 */
export const handleAsyncError = async <T,>(
  fn: () => Promise<T>,
  errorCode: string = ErrorCodes.INTERNAL_ERROR,
  context?: string
): Promise<{ success: boolean; data?: T; error?: ColmedikalError }> => {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const err = error instanceof ColmedikalError
      ? error
      : new ColmedikalError(
          errorCode,
          getErrorMessage(errorCode),
          500,
          { originalError: error }
        );

    logError(err, context);
    return { success: false, error: err };
  }
};

/**
 * Type-safe error handler for forms
 */
export const createFormErrorHandler = () => {
  const errors: Record<string, string> = {};

  return {
    addError: (field: string, message: string) => {
      errors[field] = message;
    },
    addErrors: (newErrors: Record<string, string>) => {
      Object.assign(errors, newErrors);
    },
    clearError: (field: string) => {
      delete errors[field];
    },
    clearAll: () => {
      Object.keys(errors).forEach((key) => delete errors[key]);
    },
    getErrors: () => errors,
    hasErrors: () => Object.keys(errors).length > 0,
    hasError: (field: string) => Boolean(errors[field]),
    getError: (field: string) => errors[field] || '',
  };
};

/**
 * Safe JSON operations
 */
export const safeJsonParse = <T,>(
  json: string,
  fallback: T
): T => {
  try {
    return JSON.parse(json);
  } catch (error) {
    logError(
      new ColmedikalError(
        ErrorCodes.STORAGE_ERROR,
        'Error al parsear JSON',
        400,
        { json }
      ),
      'safeJsonParse'
    );
    return fallback;
  }
};

/**
 * Safe localStorage operations
 */
export const safeLocalStorage = {
  getItem: <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      logError(
        new ColmedikalError(
          ErrorCodes.STORAGE_ERROR,
          `Error al leer localStorage: ${key}`,
          400
        ),
        'localStorage.getItem'
      );
      return fallback;
    }
  },

  setItem: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logError(
        new ColmedikalError(
          ErrorCodes.STORAGE_ERROR,
          `Error al guardar en localStorage: ${key}`,
          400
        ),
        'localStorage.setItem'
      );
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logError(
        new ColmedikalError(
          ErrorCodes.STORAGE_ERROR,
          `Error al eliminar de localStorage: ${key}`,
          400
        ),
        'localStorage.removeItem'
      );
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      logError(
        new ColmedikalError(
          ErrorCodes.STORAGE_ERROR,
          'Error al limpiar localStorage',
          400
        ),
        'localStorage.clear'
      );
      return false;
    }
  },
};
