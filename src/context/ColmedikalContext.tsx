import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Doctor, RefundItem, AuthorizationItem, AppointmentItem, LeadQuote, LeadNote, QuoteState, AdminUser, ClientAddress } from '../types';
import { getStoredAttribution } from '../utils/attribution';

interface ColmedikalContextType {
  doctors: Doctor[];
  refunds: RefundItem[];
  appointments: AppointmentItem[];
  authorizations: AuthorizationItem[];
  leads: LeadQuote[];
  admins: AdminUser[];
  isAdminUser: boolean;
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  addDoctor: (doctor: Doctor) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  toggleDoctorActiveStatus: (id: string) => Promise<void>;
  updateDoctor: (doctor: Doctor) => Promise<void>;
  addRefund: (refund: Omit<RefundItem, 'id' | 'refundDate'>) => Promise<void>;
  updateRefundStatus: (id: string, status: RefundItem['status'], comment?: string) => Promise<void>;
  addAuthorization: (auth: Omit<AuthorizationItem, 'id' | 'requestDate'>) => Promise<void>;
  updateAuthorizationStatus: (id: string, status: AuthorizationItem['status'], comment?: string) => Promise<void>;
  addAppointment: (appointment: Omit<AppointmentItem, 'id'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: AppointmentItem['status']) => Promise<void>;
  addLead: (quote: QuoteState, estimatedPrice: number) => Promise<any>;
  deleteLead: (id: string | number) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadQuote['status']) => Promise<void>;
  updateClientPaymentStatus: (id: string, paymentStatus: NonNullable<QuoteState['paymentStatus']>) => Promise<void>;
  updateLeadPlan: (id: string, basePlanId: string, selectedPlanName: string, estimatedPrice: number) => Promise<void>;
  setClientContractNumber: (id: string, contractNumber: string) => Promise<void>;
  setClientPassword: (leadId: string, newPassword: string) => Promise<void>;
  addLeadNote: (id: string, note: LeadNote) => void;
  assignLead: (id: string, assignedTo: string) => void;
  setLeadFollowUp: (id: string, followUpDate: string) => void;
  setLeadLostReason: (id: string, lostReason: string) => void;
  refreshData: () => Promise<void>;
  addAdmin: (email: string, name: string, role: AdminUser['role'], password?: string) => Promise<void>;
  deleteAdmin: (email: string) => Promise<void>;
  toggleAdminActiveStatus: (email: string) => Promise<void>;
  updateAdminRole: (email: string, role: AdminUser['role']) => Promise<void>;
  fetchDashboard: () => Promise<any>;
  // SEO & CMS
  seoSettings: Record<string, string>;
  seoMetaOverrides: Record<string, { title: string; description: string; keywords: string }>;
  saveSEOSettings: (settings: Record<string, string>) => Promise<void>;
  saveSeoMetaOverride: (path: string, meta: { title: string; description: string; keywords: string }) => Promise<void>;
  blogPostsCMS: any[];
  createCMSBlogPost: (post: any) => Promise<void>;
  updateCMSBlogPost: (id: string, post: any) => Promise<void>;
  deleteCMSBlogPost: (id: string) => Promise<void>;
  publishSitemap: (xml: string) => Promise<void>;
  publishRobots: (txt: string) => Promise<void>;
}

const ColmedikalContext = createContext<ColmedikalContextType | undefined>(undefined);

// API Configuration
const API_BASE_URL = 'https://api.colmedikal.com';
const API_TIMEOUT = 10000;

// Helper function for API calls
async function apiCall(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  token?: string | null
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API Error: ${error.message}`);
    }
    throw error;
  }
}

export const ColmedikalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [authorizations, setAuthorizations] = useState<AuthorizationItem[]>([]);
  const [leads, setLeads] = useState<LeadQuote[]>([]);
  const [localLeads, setLocalLeads] = useState<LeadQuote[]>(() => {
    try {
      const saved = localStorage.getItem('colmedikal_local_leads');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  // Local override layer — survives the 10s polling refresh when the backend
  // API doesn't persist PUT/DELETE. Keyed in refs so fetchAllData always reads
  // the latest values without stale closures.
  const loadOverride = <T,>(key: string, fallback: T): T => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
  };
  const aptStatusOverrides = useRef<Record<string, string>>(loadOverride('colmedikal_apt_overrides', {}));
  const leadStatusOverrides = useRef<Record<string, string>>(loadOverride('colmedikal_lead_overrides', {}));
  const leadNotesOverrides = useRef<Record<string, LeadNote[]>>(loadOverride('colmedikal_lead_notes', {}));
  const leadAssignOverrides = useRef<Record<string, string>>(loadOverride('colmedikal_lead_assign', {}));
  const leadFollowUpOverrides = useRef<Record<string, string>>(loadOverride('colmedikal_lead_followup', {}));
  const leadLostReasonOverrides = useRef<Record<string, string>>(loadOverride('colmedikal_lead_lost', {}));
  const leadPlanOverrides = useRef<Record<string, string>>(loadOverride('colmedikal_lead_plan', {}));
  const leadPaymentOverrides = useRef<Record<string, string>>(loadOverride('colmedikal_lead_payment', {}));
  const deletedLeadIds = useRef<string[]>(loadOverride('colmedikal_deleted_leads', []));
  // NOT a localStorage override — this one comes from our own server's
  // authoritative address store (GET /api/admin/client-addresses), refreshed
  // every fetchAllData cycle, so it stays correct across browsers/devices
  // instead of only in the admin's own browser like the overrides above.
  const clientAddressOverrides = useRef<Record<string, ClientAddress>>({});
  // Same rationale as clientAddressOverrides — server-authoritative, refreshed
  // every fetchAllData cycle, since leadPlanOverrides (browser localStorage,
  // populated when an ANONYMOUS customer picks a plan) can never reach the
  // admin's own browser on its own.
  const leadPriceOverrides = useRef<Record<string, number>>({});
  const leadBasePlanOverrides = useRef<Record<string, string>>({});
  const clientContractNumbers = useRef<Record<string, string>>({});
  const persistOverride = (key: string, value: any) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  };

  const [seoSettings, setSeoSettings] = useState<Record<string, string>>({});
  const [seoMetaOverrides, setSeoMetaOverrides] = useState<Record<string, any>>({});
  const [blogPostsCMS, setBlogPostsCMS] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(() => {
    // Only restore token if it's not expired
    const savedToken = sessionStorage.getItem('colmedikal_token');
    const savedExpiry = sessionStorage.getItem('colmedikal_token_expiry');

    if (savedToken && savedExpiry) {
      const expiryTime = parseInt(savedExpiry, 10);
      if (Date.now() < expiryTime) {
        return savedToken;
      } else {
        sessionStorage.removeItem('colmedikal_token');
        sessionStorage.removeItem('colmedikal_token_expiry');
      }
    }
    return null;
  });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize: Load data on mount
  useEffect(() => {
    fetchPublicData();
    if (token) fetchAllData();
  }, [token]);

  // Re-apply deactivated_doctors filter whenever settings or raw doctors change
  useEffect(() => {
    const deactivatedIds: string[] = (() => {
      try { return JSON.parse(seoSettings.deactivated_doctors || '[]'); } catch { return []; }
    })();
    if (deactivatedIds.length > 0) {
      setDoctors(prev => prev.map(d => ({
        ...d,
        active: deactivatedIds.includes(d.id) ? false : (d.active !== false),
      })));
    }
  }, [seoSettings.deactivated_doctors]);

  const fetchPublicData = async () => {
    try {
      const [settingsRes, blogRes] = await Promise.all([
        apiCall('/api/public/settings').catch(() => ({ data: {} })),
        apiCall('/api/public/blog').catch(() => ({ data: [] })),
      ]);
      const flat: Record<string, string> = {};
      const metaOverrides: Record<string, any> = {};
      Object.entries(settingsRes.data || {}).forEach(([k, v]) => {
        if (k.startsWith('meta_')) metaOverrides[k.replace('meta_', '')] = JSON.parse(v as string);
        else flat[k] = v as string;
      });
      setSeoSettings(flat);
      setSeoMetaOverrides(metaOverrides);
      setBlogPostsCMS(blogRes.data || []);
    } catch { /* silent */ }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall('/api/auth/login', 'POST', { email, password });
      setToken(response.token);
      setUser(response.admin);
      sessionStorage.setItem('colmedikal_token', response.token);
      // Token expires in 1 hour (JWT default)
      sessionStorage.setItem('colmedikal_token_expiry', String(Date.now() + 60 * 60 * 1000));
      sessionStorage.setItem('colmedikal_user', JSON.stringify(response.admin));

      // Load data after login
      await fetchAllData(response.token);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setToken(null);
    setUser(null);
    setDoctors([]);
    setRefunds([]);
    setAppointments([]);
    setAuthorizations([]);
    setLeads([]);
    sessionStorage.removeItem('colmedikal_token');
    sessionStorage.removeItem('colmedikal_token_expiry');
    sessionStorage.removeItem('colmedikal_user');
  };

  // Fetch all data
  const fetchAllData = async (currentToken?: string) => {
    const authToken = currentToken || token;
    if (!authToken) return;

    setIsLoading(true);
    try {
      // null (not an empty dataset) marks "this specific fetch failed" — a
      // transient network/API hiccup during the 10s poll must never wipe out
      // perfectly good data already on screen by replacing it with [].
      const [doctorsRes, refundsRes, appointmentsRes, authorizationsRes, leadsRes] = await Promise.all([
        apiCall('/api/admin/doctors?limit=500', 'GET', undefined, authToken).catch(() => null),
        apiCall('/api/admin/refunds?limit=100', 'GET', undefined, authToken).catch(() => null),
        apiCall('/api/admin/appointments?limit=100', 'GET', undefined, authToken).catch(() => null),
        apiCall('/api/admin/authorizations?limit=100', 'GET', undefined, authToken).catch(() => null),
        apiCall('/api/admin/leads?limit=100', 'GET', undefined, authToken).catch(() => null),
      ]);

      // Load admin users list from DB
      await fetchAdmins(authToken);

      // Server-authoritative client addresses (see clientAddressOverrides comment above)
      try {
        const addrRes = await fetch('/api/admin/client-addresses', { headers: { Authorization: `Bearer ${authToken}` } });
        const addrJson = await addrRes.json().catch(() => ({}));
        if (addrRes.ok && addrJson.success) clientAddressOverrides.current = addrJson.data || {};
      } catch { /* keep previous values on failure */ }

      // Server-authoritative plan-selection overrides (see leadPriceOverrides comment above)
      try {
        const planRes = await fetch('/api/admin/lead-overrides', { headers: { Authorization: `Bearer ${authToken}` } });
        const planJson = await planRes.json().catch(() => ({}));
        if (planRes.ok && planJson.success) {
          const prices: Record<string, number> = {};
          const basePlans: Record<string, string> = {};
          const contractNumbers: Record<string, string> = {};
          for (const [leadId, v] of Object.entries<any>(planJson.data || {})) {
            if (v.selectedPlanName) leadPlanOverrides.current[leadId] = v.selectedPlanName;
            if (typeof v.estimatedPrice === 'number') prices[leadId] = v.estimatedPrice;
            if (v.basePlanId) basePlans[leadId] = v.basePlanId;
            if (v.contractNumber) contractNumbers[leadId] = v.contractNumber;
          }
          leadPriceOverrides.current = prices;
          leadBasePlanOverrides.current = basePlans;
          clientContractNumbers.current = contractNumbers;
        }
      } catch { /* keep previous values on failure */ }

      // Server-authoritative deletions (see deletedLeadIds/deleteLead comments)
      try {
        const delRes = await fetch('/api/admin/deleted-leads', { headers: { Authorization: `Bearer ${authToken}` } });
        const delJson = await delRes.json().catch(() => ({}));
        if (delRes.ok && delJson.success && Array.isArray(delJson.data)) {
          for (const leadId of delJson.data) {
            if (!deletedLeadIds.current.includes(leadId)) deletedLeadIds.current.push(leadId);
          }
        }
      } catch { /* keep previous values on failure */ }

      if (doctorsRes) {
        let fetchedDoctors: any[] = doctorsRes.data || [];
        if (fetchedDoctors.length === 0) {
          try {
            const pub = await fetch(`${API_BASE_URL}/api/doctors?limit=500`);
            const pubData = await pub.json();
            fetchedDoctors = pubData.data || [];
          } catch { /* silent */ }
        }
        setDoctors(fetchedDoctors);
      }
      if (refundsRes) {
        setRefunds((refundsRes.data || []).map((r: any) => ({
          id: r.id,
          familyMember: r.family_member || '',
          specialty: r.specialty || '',
          amount: Number(r.amount || 0),
          refundDate: r.refund_date ? r.refund_date.split('T')[0] : '',
          status: r.status || 'Procesando',
          invoiceNumber: r.invoice_number || '',
          adminComment: r.admin_comment || undefined,
          fileName: r.file_url || undefined,
          userEmail: r.user_email || undefined,
          userPhone: r.user_phone || undefined,
        })));
      }
      if (appointmentsRes) {
        setAppointments((appointmentsRes.data || []).map((a: any) => ({
          id: a.id,
          doctorName: a.doctor_name || 'Por Asignar',
          specialty: a.specialty || '',
          patientName: a.patient_name || '',
          patientId: a.patient_id || '',
          patientPhone: a.patient_phone || '',
          aptDate: a.appointment_date ? a.appointment_date.split('T')[0] : '',
          aptTime: a.appointment_time || '',
          modality: a.modality || 'presencial',
          clinic: a.clinic || '',
          city: a.city || '',
          cost: Number(a.cost || 0),
          // Apply local status override if the backend didn't persist the change
          status: aptStatusOverrides.current[a.id] || a.status || 'Pendiente',
          notes: a.notes || '',
        })));
      }
      if (authorizationsRes) {
        setAuthorizations((authorizationsRes.data || []).map((a: any) => ({
          id: a.id,
          patient: a.patient || '',
          procedure: a.procedure || '',
          facility: a.facility || '',
          requestDate: a.request_date || a.requestDate || '',
          status: a.status || 'Pendiente',
          adminComment: a.admin_comment || a.adminComment,
          fileName: a.file_url || a.file_name || a.fileName,
          userEmail: a.user_email || a.userEmail,
          userPhone: a.user_phone || a.userPhone,
        })));
      }

      // Transform API leads: snake_case → camelCase, parse JSON quote_data
      // Load CMS blog posts (admin sees all, including drafts)
      fetchAdminBlog(authToken);

      if (leadsRes) setLeads((leadsRes.data || [])
        // Filter out leads the user deleted locally (backend may not persist DELETE)
        .filter((l: any) => !deletedLeadIds.current.includes(String(l.id)))
        .map((l: any) => ({
          ...l,
          quoteData: (() => {
            try {
              const qd = typeof l.quote_data === 'string'
                ? JSON.parse(l.quote_data)
                : (l.quote_data ?? l.quoteData ?? {});
              if (leadPlanOverrides.current[l.id]) qd.selectedPlanName = leadPlanOverrides.current[l.id];
              if (leadBasePlanOverrides.current[l.id]) qd.basePlanId = leadBasePlanOverrides.current[l.id];
              if (leadPaymentOverrides.current[l.id]) qd.paymentStatus = leadPaymentOverrides.current[l.id];
              if (clientAddressOverrides.current[l.id]) qd.address = clientAddressOverrides.current[l.id];
              if (clientContractNumbers.current[l.id]) qd.contractNumber = clientContractNumbers.current[l.id];
              return qd;
            } catch { return l.quoteData ?? {}; }
          })(),
          estimatedPrice: leadPriceOverrides.current[l.id] ?? Number(l.estimated_price ?? l.estimatedPrice ?? 0),
          timestamp: l.timestamp ?? l.created_at ?? new Date().toISOString(),
          status: (leadStatusOverrides.current[l.id] || l.status || 'Nuevo Plan') as LeadQuote['status'],
          notes: leadNotesOverrides.current[l.id] ?? l.notes ?? [],
          assignedTo: leadAssignOverrides.current[l.id] ?? l.assignedTo ?? '',
          followUpDate: leadFollowUpOverrides.current[l.id] ?? l.followUpDate ?? '',
          lostReason: leadLostReasonOverrides.current[l.id] ?? l.lostReason ?? '',
        })));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dashboard
  const fetchDashboard = async () => {
    if (!token) return;
    try {
      const response = await apiCall('/api/admin/dashboard', 'GET', undefined, token);
      return response;
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      throw err;
    }
  };

  // ==================== DOCTORS ====================
  const addDoctor = async (doctor: Doctor) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      const result = await apiCall('/api/admin/doctors', 'POST', doctor, token);
      await fetchAllData(token);
      setError(null);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add doctor';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDoctor = async (doctor: Doctor) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      await apiCall(`/api/admin/doctors/${doctor.id}`, 'PUT', doctor, token);
      await fetchAllData(token);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update doctor';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDoctor = async (id: string) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      await apiCall(`/api/admin/doctors/${id}`, 'DELETE', undefined, token);
      await fetchAllData(token);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete doctor';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDoctorActiveStatus = async (id: string) => {
    if (!token) throw new Error('Not authenticated');

    // Use deactivated_doctors list in settings — works regardless of DB doctor source
    const current: string[] = (() => {
      try { return JSON.parse(seoSettings.deactivated_doctors || '[]'); } catch { return []; }
    })();

    const isDeactivated = current.includes(id);
    const newList = isDeactivated ? current.filter(x => x !== id) : [...current, id];
    const newJson = JSON.stringify(newList);

    // Optimistic update
    setSeoSettings(prev => ({ ...prev, deactivated_doctors: newJson }));
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, active: isDeactivated } : d));

    try {
      await apiCall('/api/admin/settings', 'PUT', { deactivated_doctors: newJson }, token);
    } catch {
      // Revert
      setSeoSettings(prev => ({ ...prev, deactivated_doctors: JSON.stringify(current) }));
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, active: !isDeactivated } : d));
    }
  };

  // ==================== REFUNDS ====================
  const addRefund = async (refund: Omit<RefundItem, 'id' | 'refundDate'>) => {
    if (!token) {
      try {
        await apiCall('/api/refunds', 'POST', {
          family_member: refund.familyMember,
          specialty: refund.specialty,
          amount: refund.amount,
          status: refund.status || 'Procesando',
          invoice_number: refund.invoiceNumber,
          file_name: refund.fileName,
          file_data: refund.fileData,
          user_email: refund.userEmail,
          user_phone: refund.userPhone,
        });
      } catch { /* silent fail */ }
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiCall('/api/admin/refunds', 'POST', refund, token);
      await fetchAllData(token);
      setError(null);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add refund';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRefundStatus = async (id: string, status: RefundItem['status'], comment?: string) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      await apiCall(`/api/admin/refunds/${id}`, 'PUT', { status, admin_comment: comment }, token);
      await fetchAllData(token);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update refund';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== AUTHORIZATIONS ====================
  const addAuthorization = async (auth: Omit<AuthorizationItem, 'id' | 'requestDate'>) => {
    if (!token) {
      try {
        await apiCall('/api/authorizations', 'POST', {
          patient: auth.patient,
          procedure: auth.procedure,
          facility: auth.facility,
          status: auth.status || 'Pendiente',
          file_name: auth.fileName,
          file_data: auth.fileData,
          user_email: auth.userEmail,
          user_phone: auth.userPhone,
        });
      } catch { /* silent fail */ }
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiCall('/api/admin/authorizations', 'POST', auth, token);
      await fetchAllData(token);
      setError(null);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add authorization';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAuthorizationStatus = async (id: string, status: AuthorizationItem['status'], comment?: string) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      await apiCall(`/api/admin/authorizations/${id}`, 'PUT', { status, admin_comment: comment }, token);
      await fetchAllData(token);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update authorization';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== APPOINTMENTS ====================
  const addAppointment = async (appointment: Omit<AppointmentItem, 'id'>) => {
    if (!token) {
      try {
        await apiCall('/api/appointments', 'POST', {
          patient_name: appointment.patientName,
          patient_id: appointment.patientId,
          patient_phone: appointment.patientPhone,
          doctor_name: appointment.doctorName,
          specialty: appointment.specialty,
          apt_date: appointment.aptDate,
          apt_time: appointment.aptTime,
          modality: appointment.modality,
          clinic: appointment.clinic,
          city: appointment.city,
          cost: appointment.cost || 0,
          status: appointment.status || 'Pendiente',
        });
      } catch { /* silent fail */ }
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiCall('/api/admin/appointments', 'POST', appointment, token);
      await fetchAllData(token);
      setError(null);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add appointment';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentItem['status']) => {
    // Optimistic update + persist override so the 10s poll doesn't revert it
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    aptStatusOverrides.current[id] = status;
    persistOverride('colmedikal_apt_overrides', aptStatusOverrides.current);
    if (!token) return;
    try {
      await apiCall(`/api/admin/appointments/${id}`, 'PUT', { status }, token);
    } catch {
      // API may not support this endpoint yet — override layer keeps the change
    }
  };

  // ==================== LEADS ====================
  const addLead = async (quote: QuoteState, estimatedPrice: number) => {
    // Attach where this visitor came from (captured on page load — see
    // src/utils/attribution.ts). Only used when the quote doesn't already
    // carry one, so this stays first-touch across the duplicate-merge path below.
    const quoteWithSource: QuoteState = { ...quote, source: quote.source ?? getStoredAttribution() };

    // --- Duplicate detection: match on cédula, phone OR email ---
    // Local pass covers admin leads + this browser's own submissions.
    const normalize = (s?: string) => s?.toLowerCase().replace(/\s/g, '').trim() || '';
    const allLeads = [...leads, ...localLeads];
    const nEmail = normalize(quote.email);
    const nPhone = normalize(quote.phone);
    const nDoc = normalize(quote.docNumber);
    const matches = allLeads.filter(l => {
      const eEmail = normalize(l.quoteData?.email);
      const ePhone = normalize(l.quoteData?.phone);
      const eDoc = normalize(l.quoteData?.docNumber);
      return (eEmail && nEmail && eEmail === nEmail) ||
             (ePhone && nPhone && ePhone === nPhone) ||
             (eDoc && nDoc && eDoc === nDoc);
    });
    let existing = matches[0];
    // Codes from every matching prior request (deduped), so the UI can show them
    const previousCodes = Array.from(new Set(
      matches.map(m => m.quoteData?.leadCode).filter((c): c is string => !!c)
    ));

    // Cross-device pass: ask the same-origin server dedup index (server.ts) for
    // prior requests with these identifiers from ANY device/browser. Fail-open.
    let serverCodes: string[] = [];
    let serverDuplicate = false;
    let serverConfigured = false; // only trust a "not a duplicate" answer if the lookup actually ran
    if (!token) {
      try {
        const r = await fetch('/api/leads/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: quote.email, phone: quote.phone, docNumber: quote.docNumber }),
        });
        if (r.ok) {
          const j = await r.json();
          serverDuplicate = !!j.isDuplicate;
          serverConfigured = j.configured !== false;
          if (Array.isArray(j.codes)) serverCodes = j.codes.filter((c: unknown): c is string => typeof c === 'string');
        }
      } catch { /* fail-open: never block a legitimate lead on a lookup glitch */ }
    }

    // The server excludes admin-deleted leads (see /api/leads/lookup in
    // server.ts); this browser's own localLeads cache does not — it's never
    // pruned when a lead is deleted elsewhere. So if the server successfully
    // checked and found no duplicate, a stale local-only match (e.g. a lead
    // that was deleted after this same browser originally submitted it) must
    // not resurrect it as "ya tienes una cotización" forever.
    if (existing && serverConfigured && !serverDuplicate) {
      const staleId = existing.id;
      setLocalLeads(prev => {
        const pruned = prev.filter(l => l.id !== staleId);
        try { localStorage.setItem('colmedikal_local_leads', JSON.stringify(pruned)); } catch {}
        return pruned;
      });
      existing = undefined;
    }

    if (existing) {
      // Preserve the ORIGINAL quote code so the reference stays stable across resubmissions
      const preservedCode = existing.quoteData?.leadCode || quote.leadCode;
      // Preserve the ORIGINAL attribution too — whoever first brought this person
      // in keeps the credit, even if they come back later via a direct visit.
      const preservedSource = existing.quoteData?.source || quoteWithSource.source;
      const mergedQuote: QuoteState = { ...quoteWithSource, leadCode: preservedCode, source: preservedSource };
      const updated: LeadQuote = {
        ...existing,
        timestamp: new Date().toISOString(),
        quoteData: mergedQuote,
        estimatedPrice,
        // Keep existing status — don't reset to 'Nuevo Plan' if already progressed
      };
      // DB codes (serverCodes) first — they're the source of truth, so the code
      // shown matches what the admin sees; local codes only as fallback.
      const dupCodes = Array.from(new Set(
        [...serverCodes, preservedCode, ...previousCodes].filter((c): c is string => !!c)
      ));

      if (!token) {
        // Persist the selected plan name so the 10s poll doesn't overwrite it
        // (this browser-local override only helps THIS browser — see the
        // server-side plan-override call below for what actually reaches the admin)
        if (quote.selectedPlanName) {
          leadPlanOverrides.current[String(existing.id)] = quote.selectedPlanName;
          persistOverride('colmedikal_lead_plan', leadPlanOverrides.current);
        }
        // Update both leads (API state) and localLeads so mergedLeads reflects the change immediately
        setLeads(prev => prev.map(l => String(l.id) === String(existing.id) ? { ...l, quoteData: mergedQuote, estimatedPrice } : l));
        setLocalLeads(prev => {
          const newLeads = prev.map(l => l.id === existing.id ? updated : l);
          try { localStorage.setItem('colmedikal_local_leads', JSON.stringify(newLeads)); } catch {}
          return newLeads;
        });
        try {
          await apiCall(`/api/leads/${existing.id}`, 'PUT', { quote_data: mergedQuote, estimated_price: estimatedPrice });
        } catch { /* silent */ }
        if (quote.selectedPlanName) {
          try {
            // Authoritative for the admin: the PUT above and the localStorage
            // override are both invisible cross-device — this is what
            // /api/admin/lead-overrides actually reads.
            await fetch('/api/leads/plan-override', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                leadId: existing.id,
                selectedPlanName: quote.selectedPlanName,
                basePlanId: quote.basePlanId,
                estimatedPrice,
                email: quote.email,
                phone: quote.phone,
                docNumber: quote.docNumber,
              }),
            });
          } catch { /* silent — localStorage override above still keeps this browser correct */ }
        }
        return { ...updated, isDuplicate: true, previousCodes: dupCodes };
      }

      setIsLoading(true);
      try {
        await apiCall(`/api/admin/leads/${existing.id}`, 'PUT', {
          quote_data: mergedQuote,
          estimated_price: estimatedPrice,
        }, token);
        await fetchAllData(token);
        return { ...updated, isDuplicate: true, previousCodes: dupCodes };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error updating lead');
        throw err;
      } finally {
        setIsLoading(false);
      }
    }

    // Cross-device duplicate: the real DB already has this person (from another
    // device), but we have no local lead to upsert. Don't create a new one —
    // surface the prior code(s) from the DB and stop.
    if (!token && (serverDuplicate || serverCodes.length > 0)) {
      const stub: LeadQuote = {
        id: 'remote-dup',
        timestamp: new Date().toISOString(),
        quoteData: { ...quoteWithSource, leadCode: serverCodes[0] || quote.leadCode },
        estimatedPrice,
        status: 'Nuevo Plan',
      };
      return { ...stub, isDuplicate: true, previousCodes: serverCodes };
    }

    // --- No duplicate found: create new lead ---
    // Public submission path — save to API (public endpoint) + localStorage fallback
    if (!token) {
      const localId = 'local-' + Date.now();
      const newLead: LeadQuote = {
        id: localId,
        timestamp: new Date().toISOString(),
        quoteData: quoteWithSource,
        estimatedPrice,
        status: 'Nuevo Plan',
      };
      setLocalLeads(prev => {
        const updated = [newLead, ...prev];
        try { localStorage.setItem('colmedikal_local_leads', JSON.stringify(updated)); } catch {}
        return updated;
      });
      try {
        const result = await apiCall('/api/leads', 'POST', {
          quote_data: quoteWithSource,
          estimated_price: estimatedPrice,
          status: 'Nuevo Plan',
        });
        // Update localLead ID to API ID to prevent duplicate display
        if (result?.id) {
          setLocalLeads(prev => {
            const updated = prev.map(l => l.id === localId ? { ...l, id: result.id } : l);
            try { localStorage.setItem('colmedikal_local_leads', JSON.stringify(updated)); } catch {}
            return updated;
          });
        }
      } catch { /* silent fail — localStorage already captured it */ }
      // No separate index needed: the lead now lives in the real DB, so the next
      // /api/leads/lookup (which reads that DB) will find it automatically.
      return { ...newLead, isDuplicate: false, previousCodes: [] as string[] };
    }

    setIsLoading(true);
    try {
      const result = await apiCall('/api/admin/leads', 'POST', {
        quote_data: quoteWithSource,
        estimated_price: estimatedPrice,
        status: 'Nuevo Plan',
      }, token);
      await fetchAllData(token);
      setError(null);
      return { ...result, isDuplicate: false, previousCodes: [] as string[] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add lead';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, status: LeadQuote['status']) => {
    // Lead IDs from the external API are numeric at runtime despite the
    // `string` type annotation — .startsWith on a number throws and silently
    // kills this whole function (no state update, button looks "broken").
    const strId = String(id);
    if (strId.startsWith('local-')) {
      setLocalLeads(prev => {
        const updated = prev.map(l => String(l.id) === strId ? { ...l, status } : l);
        try { localStorage.setItem('colmedikal_local_leads', JSON.stringify(updated)); } catch {}
        return updated;
      });
      return;
    }
    // Optimistic update + persist override so the 10s poll doesn't revert it
    setLeads(prev => prev.map(l => String(l.id) === strId ? { ...l, status } : l));
    leadStatusOverrides.current[strId] = status;
    persistOverride('colmedikal_lead_overrides', leadStatusOverrides.current);
    if (!token) return;
    try {
      await apiCall(`/api/admin/leads/${strId}`, 'PUT', { status }, token);
    } catch {
      // API may fail — override layer keeps the change
    }
  };

  // ==================== CLIENTES (leads with status 'Cierre Efectivo') ====================
  const updateClientPaymentStatus = async (id: string, paymentStatus: NonNullable<QuoteState['paymentStatus']>) => {
    // Optimistic update + persist override so the 10s poll doesn't revert it
    setLeads(prev => prev.map(l => l.id === id ? { ...l, quoteData: { ...l.quoteData, paymentStatus } } : l));
    leadPaymentOverrides.current[id] = paymentStatus;
    persistOverride('colmedikal_lead_payment', leadPaymentOverrides.current);
    if (!token) return;
    const current = leads.find(l => l.id === id);
    if (!current) return;
    try {
      // quote_data appears to be replaced wholesale on PUT, so send the full merged object
      await apiCall(`/api/admin/leads/${id}`, 'PUT', {
        quote_data: { ...current.quoteData, paymentStatus },
      }, token);
    } catch {
      // API may fail — override layer keeps the change
    }
    try {
      // Authoritative for the portal: PUT above isn't reliably persisted by the
      // external API, so this server-side store is what /api/portal/me actually reads.
      await fetch('/api/admin/set-payment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadId: id, paymentStatus }),
      });
    } catch {
      // Local browser override above still keeps the admin's own view correct
    }
  };

  const updateLeadPlan = async (id: string, basePlanId: string, selectedPlanName: string, estimatedPrice: number) => {
    // Optimistic update + refs so the 10s poll doesn't revert it before the
    // next successful fetch of /api/admin/lead-overrides confirms it server-side.
    setLeads(prev => prev.map(l => String(l.id) === String(id) ? { ...l, quoteData: { ...l.quoteData, basePlanId, selectedPlanName }, estimatedPrice } : l));
    leadPlanOverrides.current[String(id)] = selectedPlanName;
    leadBasePlanOverrides.current[String(id)] = basePlanId;
    leadPriceOverrides.current[String(id)] = estimatedPrice;
    if (!token) return;
    try {
      await fetch('/api/admin/set-lead-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadId: id, basePlanId, estimatedPrice }),
      });
    } catch {
      // Local refs above still keep this admin's own view correct
    }
  };

  const setClientContractNumber = async (id: string, contractNumber: string) => {
    setLeads(prev => prev.map(l => String(l.id) === String(id) ? { ...l, quoteData: { ...l.quoteData, contractNumber } } : l));
    clientContractNumbers.current[String(id)] = contractNumber;
    if (!token) return;
    try {
      await fetch('/api/admin/set-contract-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadId: id, contractNumber }),
      });
    } catch {
      // Local ref above still keeps this admin's own view correct
    }
  };

  const setClientPassword = async (leadId: string, newPassword: string) => {
    if (!token) throw new Error('Not authenticated');
    const response = await fetch('/api/portal/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ leadId, newPassword }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudo establecer la contraseña');
    }
  };

  const addLeadNote = (id: string, note: LeadNote) => {
    const existing = leadNotesOverrides.current[id] || [];
    leadNotesOverrides.current[id] = [...existing, note];
    persistOverride('colmedikal_lead_notes', leadNotesOverrides.current);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, notes: leadNotesOverrides.current[id] } : l));
    setLocalLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, notes: leadNotesOverrides.current[id] } : l);
      try { localStorage.setItem('colmedikal_local_leads', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const assignLead = (id: string, assignedTo: string) => {
    leadAssignOverrides.current[id] = assignedTo;
    persistOverride('colmedikal_lead_assign', leadAssignOverrides.current);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, assignedTo } : l));
    setLocalLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, assignedTo } : l);
      try { localStorage.setItem('colmedikal_local_leads', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const setLeadFollowUp = (id: string, followUpDate: string) => {
    leadFollowUpOverrides.current[id] = followUpDate;
    persistOverride('colmedikal_lead_followup', leadFollowUpOverrides.current);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, followUpDate } : l));
    setLocalLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, followUpDate } : l);
      try { localStorage.setItem('colmedikal_local_leads', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const setLeadLostReason = (id: string, lostReason: string) => {
    leadLostReasonOverrides.current[id] = lostReason;
    persistOverride('colmedikal_lead_lost', leadLostReasonOverrides.current);
    leadStatusOverrides.current[id] = 'Perdido';
    persistOverride('colmedikal_lead_overrides', leadStatusOverrides.current);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'Perdido', lostReason } : l));
    setLocalLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, status: 'Perdido' as const, lostReason } : l);
      try { localStorage.setItem('colmedikal_local_leads', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const deleteLead = async (id: string | number) => {
    const strId = String(id);
    // Always purge from localLeads — a lead submitted publicly gets a backend ID
    // stored in localLeads, so it must be removed from both stores to stay gone.
    setLocalLeads(prev => {
      const updated = prev.filter(l => String(l.id) !== strId);
      try { localStorage.setItem('colmedikal_local_leads', JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (strId.startsWith('local-')) return;
    setLeads(prev => prev.filter(l => String(l.id) !== strId));
    if (!deletedLeadIds.current.includes(strId)) {
      deletedLeadIds.current.push(strId);
      persistOverride('colmedikal_deleted_leads', deletedLeadIds.current);
    }
    if (!token) return;
    try {
      await apiCall(`/api/admin/leads/${strId}`, 'DELETE', undefined, token);
    } catch {
      // API may not support DELETE — override layer keeps it deleted locally
    }
    try {
      // Authoritative: /api/leads/lookup and the AdminPanel (any browser/device)
      // both check this instead of relying on the DELETE above actually sticking.
      await fetch('/api/admin/delete-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadId: strId }),
      });
    } catch {
      // Local browser override above still keeps this admin's own view correct
    }
  };

  const refreshData = async () => {
    if (token) await fetchAllData(token);
  };

  // ==================== ADMINS ====================

  const addAdmin = async (email: string, name: string, role: AdminUser['role'], password?: string) => {
    if (!token) throw new Error('Not authenticated');
    if (!password) throw new Error('Password is required');
    setIsLoading(true);
    try {
      await apiCall('/api/admin/users', 'POST', { email, name, role, password }, token);
      await fetchAdmins(token);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add admin';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAdmin = async (email: string) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      await apiCall(`/api/admin/users/${encodeURIComponent(email)}`, 'DELETE', undefined, token);
      setAdmins(prev => prev.filter(a => a.email !== email));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete admin';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminActiveStatus = async (email: string) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      const target = admins.find(a => a.email === email);
      const newActive = target ? !target.active : false;
      await apiCall(`/api/admin/users/${encodeURIComponent(email)}`, 'PUT', { active: newActive }, token);
      setAdmins(prev => prev.map(a => a.email === email ? { ...a, active: newActive } : a));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle admin status';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAdminRole = async (email: string, role: AdminUser['role']) => {
    if (!token) throw new Error('Not authenticated');
    await apiCall(`/api/admin/users/${encodeURIComponent(email)}`, 'PUT', { role }, token);
    setAdmins(prev => prev.map(a => a.email === email ? { ...a, role } : a));
  };

  const fetchAdmins = async (authToken: string) => {
    try {
      const res = await apiCall('/api/admin/users', 'GET', undefined, authToken);
      const list: AdminUser[] = (res.data || []).map((u: any) => ({
        email: u.email,
        name: u.name,
        role: u.role as AdminUser['role'],
        active: Boolean(u.active),
        addedAt: u.created_at || new Date().toISOString(),
        addedBy: 'admin',
      }));
      setAdmins(list);
    } catch { /* non-fatal */ }
  };

  // SEO Settings
  const saveSEOSettings = async (settings: Record<string, string>) => {
    if (!token) throw new Error('Not authenticated');
    await apiCall('/api/admin/settings', 'PUT', settings, token);
    setSeoSettings(prev => ({ ...prev, ...settings }));
  };

  const saveSeoMetaOverride = async (path: string, meta: { title: string; description: string; keywords: string }) => {
    if (!token) throw new Error('Not authenticated');
    const key = `meta_${path}`;
    await apiCall('/api/admin/settings', 'PUT', { [key]: JSON.stringify(meta) }, token);
    setSeoMetaOverrides(prev => ({ ...prev, [path]: meta }));
  };

  // Blog CMS
  const fetchAdminBlog = async (authToken: string) => {
    try {
      const res = await apiCall('/api/admin/blog', 'GET', undefined, authToken);
      setBlogPostsCMS(res.data || []);
    } catch { /* silent */ }
  };

  const createCMSBlogPost = async (post: any) => {
    if (!token) throw new Error('Not authenticated');
    await apiCall('/api/admin/blog', 'POST', post, token);
    await fetchAdminBlog(token);
  };

  const updateCMSBlogPost = async (id: string, post: any) => {
    if (!token) throw new Error('Not authenticated');
    await apiCall(`/api/admin/blog/${id}`, 'PUT', post, token);
    await fetchAdminBlog(token);
  };

  const deleteCMSBlogPost = async (id: string) => {
    if (!token) throw new Error('Not authenticated');
    await apiCall(`/api/admin/blog/${id}`, 'DELETE', undefined, token);
    setBlogPostsCMS(prev => prev.filter(p => p.id !== id));
  };

  const publishSitemap = async (xml: string) => {
    if (!token) throw new Error('Not authenticated');
    await apiCall('/api/admin/sitemap/publish', 'POST', { content: xml }, token);
  };

  const publishRobots = async (txt: string) => {
    if (!token) throw new Error('Not authenticated');
    await apiCall('/api/admin/robots/publish', 'POST', { content: txt }, token);
  };

  // Merge API leads with locally-stored public leads; deduplicate by id
  const mergedLeads = [
    ...localLeads.filter(l => !leads.some(al => al.id === l.id)),
    ...leads,
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const value: ColmedikalContextType = {
    doctors,
    refunds,
    appointments,
    authorizations,
    leads: mergedLeads,
    admins,
    isAdminUser: !!user,
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    addDoctor,
    deleteDoctor,
    toggleDoctorActiveStatus,
    updateDoctor,
    addRefund,
    updateRefundStatus,
    addAuthorization,
    updateAuthorizationStatus,
    addAppointment,
    updateAppointmentStatus,
    addLead,
    deleteLead,
    updateLeadStatus,
    updateClientPaymentStatus,
    updateLeadPlan,
    setClientContractNumber,
    setClientPassword,
    addLeadNote,
    assignLead,
    setLeadFollowUp,
    setLeadLostReason,
    refreshData,
    addAdmin,
    deleteAdmin,
    toggleAdminActiveStatus,
    updateAdminRole,
    fetchDashboard,
    seoSettings,
    seoMetaOverrides,
    saveSEOSettings,
    saveSeoMetaOverride,
    blogPostsCMS,
    createCMSBlogPost,
    updateCMSBlogPost,
    deleteCMSBlogPost,
    publishSitemap,
    publishRobots,
  };

  return (
    <ColmedikalContext.Provider value={value}>
      {children}
    </ColmedikalContext.Provider>
  );
};

export const useColmedikal = () => {
  const context = useContext(ColmedikalContext);
  if (context === undefined) {
    throw new Error('useColmedikal must be used within ColmedikalProvider');
  }
  return context;
};
