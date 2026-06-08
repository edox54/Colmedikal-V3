// Configuración de integración con Kommo
export const KOMMO_CONFIG = {
  workspaceId: '36580363',
  baseUrl: 'https://arealegal.kommo.com',
  apiEndpoint: '/api/v4'
};

// Interfaz para datos de formularios
export interface FormData {
  type: 'contact' | 'quote' | 'reimbursement';
  data: Record<string, any>;
}

// Enviar a backend para procesar
export async function submitFormToKommo(formData: FormData) {
  try {
    const response = await fetch('/api/forms/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    console.log('[Kommo Integration]', result);
    return result;
  } catch (error) {
    console.error('[Kommo Error]', error);
    return { success: false, message: String(error) };
  }
}
