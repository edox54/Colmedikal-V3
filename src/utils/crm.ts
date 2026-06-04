/**
 * Kommo CRM API Integration Engine
 * Provides direct, real-world integration capabilities with Kommo CRM
 * (formerly amoCRM) via REST endpoints or webhook triggers.
 */

export interface CRMLeadData {
  name: string; // Contact full name
  email: string; // Contact email
  phone: string; // Contact phone
  subject: string; // Form subject (e.g., "Cotización Online", "Contacto Web", "Reserva de Cita", "Trámite de Reembolso")
  amount?: number; // Estimated value/premium
  province?: string; // Geographic field
  planName?: string; // Plan selected
  details?: string; // Additional context/comments
  leadCode?: string; // Reference ID
}

/**
 * Sends form submission data to Kommo CRM.
 * 
 * To connect to a live Kommo CRM production pipeline:
 * 1. Log in to your Kommo account.
 * 2. Go to "Settings" -> "Integrations" -> "Webhooks" or set up a Zapier/Make incoming webhook.
 * 3. Paste the Webhook URL into the "Configuración CRM" area of the MODO EMPRESA Admin Panel.
 * 4. The system will automatically forward every submission to your CRM.
 */
export async function sendLeadToKommoCRM(data: CRMLeadData): Promise<{ success: boolean; mode: 'live' | 'simulation'; error?: string }> {
  // Check if user has configured a custom webhook URL in their localStorage
  const localWebhook = localStorage.getItem('kommo_webhook_url');
  
  // Also check standard environment variables
  const envWebhook = import.meta.env.VITE_KOMMO_WEBHOOK_URL;
  
  const webhookUrl = localWebhook || envWebhook;

  // Track the transaction locally in a simulated CRM log for visual verification
  saveCRMTransmissionLog(data, webhookUrl ? 'live' : 'simulation');

  if (!webhookUrl) {
    console.log('CRM Simulation Mode Active: Payload prepared for Kommo CRM:', data);
    return { success: true, mode: 'simulation' };
  }

  try {
    // Format payload specifically for CRM integration (compatible with standard lead webhooks, Zapier, Make, or Albato integrations)
    const payload = {
      lead_title: `${data.subject}: ${data.name} [${data.leadCode || 'WEB'}]`,
      lead_status: 'Nuevo Prospecto',
      sale_value: data.amount || 0,
      contacts: [
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
        }
      ],
      custom_fields: {
        provincia_cobertura: data.province || 'No especificada',
        plan_interes: data.planName || 'Ninguno',
        codigo_referencia: data.leadCode || 'N/A',
        comentarios_web: data.details || '',
        origen_contacto: 'Portal Web Oficial Colmedikal'
      },
      submitted_at: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`CRM endpoint returned HTTP status ${response.status}`);
    }

    return { success: true, mode: 'live' };
  } catch (err: any) {
    console.warn('CRM dispatch failed:', err.message);
    return { success: false, mode: 'live', error: err.message };
  }
}

// Internal structure to log transactions on-screen in the internal Corporate panel
export interface CRMHistoryLog {
  id: string;
  timestamp: string;
  name: string;
  phone: string;
  subject: string;
  planName: string;
  amount: number;
  mode: 'live' | 'simulation';
  destination: string;
}

function saveCRMTransmissionLog(data: CRMLeadData, mode: 'live' | 'simulation') {
  try {
    const saved = localStorage.getItem('colmedikal_crm_logs');
    const logs: CRMHistoryLog[] = saved ? JSON.parse(saved) : [];
    
    const newLog: CRMHistoryLog = {
      id: `CRM-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      name: data.name,
      phone: data.phone,
      subject: data.subject,
      planName: data.planName || 'N/A',
      amount: data.amount || 0,
      mode,
      destination: mode === 'live' 
        ? (localStorage.getItem('kommo_webhook_url') || 'Env Var Configured Webhook') 
        : 'Consola del Desarrollador / Registro Interno'
    };

    logs.unshift(newLog);
    // Keep only last 50 logs
    localStorage.setItem('colmedikal_crm_logs', JSON.stringify(logs.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to save CRM history log:', e);
  }
}
