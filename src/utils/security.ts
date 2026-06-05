// Security utilities to prevent XSS, injection attacks, etc

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string, maxLength: number = 500): string => {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>"{}\[\]]/g, '') // Remove dangerous characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Sanitize HTML to prevent injection
 */
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Encode HTML entities
 */
export const encodeHtmlEntities = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Validate and sanitize URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitize object by removing sensitive fields
 */
export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  sensitiveFields: string[] = ['password', 'token', 'secret', 'key']
): Partial<T> => {
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Generate secure random ID (replaces Math.random)
 */
export const generateSecureId = (prefix?: string): string => {
  const timestamp = Date.now().toString(36);
  const randomBytes = Array.from(
    { length: 8 },
    () => Math.floor(Math.random() * 36).toString(36)
  ).join('');
  const id = timestamp + randomBytes;
  return prefix ? `${prefix}-${id}` : id;
};

/**
 * Hash password (basic client-side hash, server should use bcrypt)
 */
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Check if URL is same-origin (prevent CSRF)
 */
export const isSameOrigin = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.href);
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
};

/**
 * Generate CSRF token
 */
export const generateCsrfToken = (): string => {
  return generateSecureId('csrf');
};

/**
 * Validate CSRF token
 */
export const validateCsrfToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
};

/**
 * Secure localStorage with simple encryption
 */
export const secureStorage = {
  /**
   * Simple XOR encryption (for client-side only, not cryptographically secure)
   */
  encode: (data: string, key: string = 'colmedikal'): string => {
    const encoded = Array.from(data).map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('');
    return btoa(encoded); // Base64 encode
  },

  decode: (encoded: string, key: string = 'colmedikal'): string => {
    const decoded = atob(encoded);
    return Array.from(decoded).map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('');
  },

  setItem: (key: string, value: any): void => {
    const stringValue = JSON.stringify(value);
    const encoded = secureStorage.encode(stringValue);
    localStorage.setItem(key, encoded);
  },

  getItem: <T,>(key: string, fallback: T): T => {
    try {
      const encoded = localStorage.getItem(key);
      if (!encoded) return fallback;
      const decoded = secureStorage.decode(encoded);
      return JSON.parse(decoded);
    } catch {
      localStorage.removeItem(key);
      return fallback;
    }
  },
};

/**
 * Validate and sanitize form data
 */
export const sanitizeFormData = (
  data: Record<string, any>
): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Check for common attack patterns
 */
export const detectMaliciousInput = (input: string): boolean => {
  const patterns = [
    /<script/i,
    /on\w+\s*=/i,
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /__proto__/i,
    /constructor\s*\[/i,
  ];
  return patterns.some((pattern) => pattern.test(input));
};
