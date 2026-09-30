// Client-portal password rule — shared by the server (src/server/portalPassword.ts) and the portal UI.
export const MIN_PASSWORD = 8;
/** '' when valid, otherwise the message to show. ≥8 chars with at least one letter and one digit. */
export const passwordProblem = (p: string) =>
  p.length < MIN_PASSWORD ? `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`
    : !/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(p) || !/\d/.test(p) ? 'La contraseña debe combinar letras y números.'
      : p.length > 200 ? 'La contraseña es demasiado larga.' : '';
