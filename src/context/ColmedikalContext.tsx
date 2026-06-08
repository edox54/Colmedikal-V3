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
  addLead: (quote: QuoteState, estimatedPrice: number) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadQuote['status']) => Promise<void>;
  addAdmin: (email: string, name: string, role: 'Administrador' | 'Auditor Clínico') => Promise<void>;
  deleteAdmin: (email: string) => Promise<void>;
  toggleAdminActiveStatus: (email: string) => Promise<void>;
  fetchDashboard: () => Promise<any>;
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
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('colmedikal_token');
  });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize: Load data on mount
  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall('/api/auth/login', 'POST', { email, password });
      setToken(response.token);
      setUser(response.admin);
      sessionStorage.setItem('colmedikal_token', response.token);
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
    sessionStorage.removeItem('colmedikal_user');
  };

  // Fetch all data
  const fetchAllData = async (currentToken?: string) => {
    const authToken = currentToken || token;
    if (!authToken) return;

    setIsLoading(true);
    try {
      const [doctorsRes, refundsRes, appointmentsRes, authorizationsRes, leadsRes] = await Promise.all([
        apiCall('/api/admin/doctors?limit=100', 'GET', undefined, authToken),
        apiCall('/api/admin/refunds?limit=100', 'GET', undefined, authToken),
        apiCall('/api/admin/appointments?limit=100', 'GET', undefined, authToken),
        apiCall('/api/admin/authorizations?limit=100', 'GET', undefined, authToken),
        apiCall('/api/admin/leads?limit=100', 'GET', undefined, authToken),
      ]);

      setDoctors(doctorsRes.data || []);
      setRefunds(refundsRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setAuthorizations(authorizationsRes.data || []);
      setLeads(leadsRes.data || []);
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
    const doctor = doctors.find(d => d.id === id);
    if (!doctor) throw new Error('Doctor not found');

    await updateDoctor({
      ...doctor,
      active: !doctor.active,
    });
  };

  // ==================== REFUNDS ====================
  const addRefund = async (refund: Omit<RefundItem, 'id' | 'refundDate'>) => {
    if (!token) throw new Error('Not authenticated');
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
    if (!token) throw new Error('Not authenticated');
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
    if (!token) throw new Error('Not authenticated');
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
    if (!token) throw new Error('Not authenticated');
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

  // ==================== ADMINS ====================
  const addAdmin = async (email: string, name: string, role: 'Administrador' | 'Auditor Clínico') => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      const newAdmin: AdminUser = {
        id: Math.random().toString(),
        email,
        name,
        role,
        active: true,
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

  const value: ColmedikalContextType = {
    doctors,
    refunds,
    appointments,
    authorizations,
    leads,
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
    updateLeadStatus,
    addAdmin,
    deleteAdmin,
    toggleAdminActiveStatus,
    fetchDashboard,
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
