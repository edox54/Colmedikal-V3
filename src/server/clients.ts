// Server-only. Staff creates a client by hand (no cotizador): a lead in api.colmedikal.com with
// status "Cierre Efectivo", plus a Mi Colmedikal account and a welcome email to create the password.
//   POST /api/admin/clients
import crypto from 'crypto';
import express from 'express';
import type { Express, RequestHandler } from 'express';
import { PLANS } from '../data/plans';
import { logActivity } from './crm';

type HttpsJson = (url: string, opts?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<any>;
const norm = (s: unknown) => (typeof s === 'string' ? s.toLowerCase().replace(/\s/g, '') : '');
const str = (v: unknown, max = 160) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function registerClientRoutes(app: Express, deps: {
  requireAdmin: RequestHandler;
  httpsJson: HttpsJson;
  getLeads: (force?: boolean) => Promise<any[]>;
  parseQuoteData: (lead: any) => any;
  sendWelcome: (leadId: string, docNumber: string, contact: { email: string; fullName: string }) => Promise<boolean>;
}) {
  app.post('/api/admin/clients', deps.requireAdmin, express.json(), async (req, res) => {
    try {
      const b = req.body || {};
      const fullName = str(b.fullName, 120);
      const docType = b.docType === 'pasaporte' ? 'pasaporte' : 'cedula';
      const docNumber = str(b.docNumber, 20).replace(/\s/g, '');
      const email = str(b.email, 160).toLowerCase();
      const phone = str(b.phone, 20);
      const province = str(b.province, 60);
      const plan = PLANS.find(p => p.id === b.planId);

      if (fullName.split(' ').filter(Boolean).length < 2) return res.status(400).json({ success: false, message: 'Ingresa nombres y apellidos.' });
      if (docType === 'cedula' ? !/^\d{10}$/.test(docNumber) : !/^[A-Za-z0-9]{5,20}$/.test(docNumber)) {
        return res.status(400).json({ success: false, message: docType === 'cedula' ? 'La cédula debe tener 10 dígitos.' : 'Pasaporte inválido.' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Correo inválido.' });
      if (!/^\+?\d{7,15}$/.test(phone.replace(/[\s-]/g, ''))) return res.status(400).json({ success: false, message: 'Celular inválido.' });

      // Same cédula already registered → open that one instead of creating a duplicate
      const existing = (await deps.getLeads(true)).find(l => norm(deps.parseQuoteData(l).docNumber) === norm(docNumber));
      if (existing) return res.status(409).json({ success: false, message: 'Ya existe un registro con esa cédula. Ábrelo desde Clientes para darle acceso.', leadId: String(existing.id) });

      const leadCode = `CM-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const quote = {
        fullName, email, phone, docType, docNumber, province,
        type: 'individual', primaryAge: 35, childrenCount: 0, childrenAges: [],
        basePlanId: plan?.id || '', selectedPlanName: plan ? `${plan.name} — $${plan.basePrice}/mes` : '',
        leadCode, source: { channel: 'Manual', detail: 'Creado en el panel' },
      };
      const tok = req.headers.authorization!.split(' ')[1]; // caller's own token: the API records who created it
      const created = await deps.httpsJson('https://api.colmedikal.com/api/admin/leads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_data: quote, estimated_price: plan?.basePrice || 0, status: 'Cierre Efectivo' }),
      });
      const leadId = String(created?.id ?? created?.data?.id ?? '');
      if (!leadId) throw new Error('API did not return the new lead id');

      logActivity(leadId, 'sistema', 'Cliente creado manualmente en el panel', str(b.by, 80) || 'Admin');
      let welcomeSent = false;
      if (b.sendWelcome !== false) {
        welcomeSent = await deps.sendWelcome(leadId, docNumber, { email, fullName }).catch(e => { console.error('[admin-clients-welcome]', e?.message || e); return false; });
      }
      console.log('[admin-clients] created', leadId, leadCode);
      res.json({ success: true, leadId, leadCode, welcomeSent });
    } catch (e: any) {
      console.error('[admin-clients]', e?.status || '', e?.message || e);
      res.status(500).json({ success: false, message: 'No se pudo crear el cliente' });
    }
  });
}
