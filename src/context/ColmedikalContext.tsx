import React, { createContext, useContext, useState, useEffect } from 'react';
import { Doctor, RefundItem, AuthorizationItem, AppointmentItem, LeadQuote, QuoteState, AdminUser } from '../types';

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
  deleteLead: (id: string) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadQuote['status']) => Promise<void>;
  refreshData: () => Promise<void>;
  addAdmin: (email: string, name: string, role: 'Administrador' | 'Auditor Clínico') => Promise<void>;
  deleteAdmin: (email: string) => Promise<void>;
  toggleAdminActiveStatus: (email: string) => Promise<void>;
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
      const empty = { data: [] };
      const [doctorsRes, refundsRes, appointmentsRes, authorizationsRes, leadsRes] = await Promise.all([
        apiCall('/api/admin/doctors?limit=500', 'GET', undefined, authToken).catch(() => empty),
        apiCall('/api/admin/refunds?limit=100', 'GET', undefined, authToken).catch(() => empty),
        apiCall('/api/admin/appointments?limit=100', 'GET', undefined, authToken).catch(() => empty),
        apiCall('/api/admin/authorizations?limit=100', 'GET', undefined, authToken).catch(() => empty),
        apiCall('/api/admin/leads?limit=100', 'GET', undefined, authToken).catch(() => empty),
      ]);

      let fetchedDoctors: any[] = doctorsRes.data || [];
      if (fetchedDoctors.length === 0) {
        try {
          const pub = await fetch(`${API_BASE_URL}/api/doctors?limit=500`);
          const pubData = await pub.json();
          fetchedDoctors = pubData.data || [];
        } catch { /* silent */ }
      }
      setDoctors(fetchedDoctors);
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
        status: a.status || 'Pendiente',
        notes: a.notes || '',
      })));
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

      // Transform API leads: snake_case → camelCase, parse JSON quote_data
      // Load CMS blog posts (admin sees all, including drafts)
      fetchAdminBlog(authToken);

      setLeads((leadsRes.data || []).map((l: any) => ({
        ...l,
        quoteData: (() => {
          try {
            return typeof l.quote_data === 'string'
              ? JSON.parse(l.quote_data)
              : (l.quote_data ?? l.quoteData ?? {});
          } catch { return l.quoteData ?? {}; }
        })(),
        estimatedPrice: Number(l.estimated_price ?? l.estimatedPrice ?? 0),
        timestamp: l.timestamp ?? l.created_at ?? new Date().toISOString(),
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
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      await apiCall(`/api/admin/appointments/${id}`, 'PUT', { status }, token);
      await fetchAllData(token);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update appointment';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== LEADS ====================
  const addLead = async (quote: QuoteState, estimatedPrice: number) => {
    // Public submission path — save to API (public endpoint) + localStorage fallback
    if (!token) {
      const localId = 'local-' + Date.now();
      const newLead: LeadQuote = {
        id: localId,
        timestamp: new Date().toISOString(),
        quoteData: quote,
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
          quote_data: quote,
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
      return newLead;
    }

    setIsLoading(true);
    try {
      const result = await apiCall('/api/admin/leads', 'POST', {
        quote_data: quote,
        estimated_price: estimatedPrice,
        status: 'Nuevo Plan',
      }, token);
      await fetchAllData(token);
      setError(null);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add lead';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, status: LeadQuote['status']) => {
    if (id.startsWith('local-')) {
      setLocalLeads(prev => {
        const updated = prev.map(l => l.id === id ? { ...l, status } : l);
        try { localStorage.setItem('colmedikal_local_leads', JSON.stringify(updated)); } catch {}
        return updated;
      });
      return;
    }

    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      await apiCall(`/api/admin/leads/${id}`, 'PUT', { status }, token);
      await fetchAllData(token);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update lead';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLead = async (id: string) => {
    if (id.startsWith('local-')) {
      setLocalLeads(prev => {
        const updated = prev.filter(l => l.id !== id);
        try { localStorage.setItem('colmedikal_local_leads', JSON.stringify(updated)); } catch {}
        return updated;
      });
      return;
    }
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      await apiCall(`/api/admin/leads/${id}`, 'DELETE', undefined, token);
      await fetchAllData(token);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete lead';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (token) await fetchAllData(token);
  };

  // ==================== ADMINS ====================
  const addAdmin = async (email: string, name: string, role: 'Administrador' | 'Auditor Clínico') => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      const newAdmin: AdminUser = {
        email,
        name,
        role,
        active: true,
        addedAt: new Date().toISOString(),
        addedBy: 'admin',
      };
      setAdmins([...admins, newAdmin]);
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
      setAdmins(admins.filter(a => a.email !== email));
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
      setAdmins(admins.map(a =>
        a.email === email ? { ...a, active: !a.active } : a
      ));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle admin status';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
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
    refreshData,
    addAdmin,
    deleteAdmin,
    toggleAdminActiveStatus,
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
