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
  logout: () => Promise<void>;
  addDoctor: (doctor: Doctor) => void;
  deleteDoctor: (id: string) => void;
  toggleDoctorActiveStatus: (id: string) => void;
  updateDoctor: (doctor: Doctor) => void;
  addRefund: (refund: Omit<RefundItem, 'id' | 'refundDate'>) => void;
  updateRefundStatus: (id: string, status: RefundItem['status'], comment?: string) => void;
  addAuthorization: (auth: Omit<AuthorizationItem, 'id' | 'requestDate'>) => void;
  updateAuthorizationStatus: (id: string, status: AuthorizationItem['status'], comment?: string) => void;
  addAppointment: (appointment: Omit<AppointmentItem, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentItem['status']) => void;
  addLead: (quote: QuoteState, estimatedPrice: number) => void;
  updateLeadStatus: (id: string, status: LeadQuote['status']) => void;
  addAdmin: (email: string, name: string, role: 'Administrador' | 'Auditor Clínico') => Promise<void>;
  deleteAdmin: (email: string) => Promise<void>;
  toggleAdminActiveStatus: (email: string) => Promise<void>;
}

const ColmedikalContext = createContext<ColmedikalContextType | undefined>(undefined);

import { initialDoctors } from '../data/doctors';

const initialRefunds: RefundItem[] = [
  { id: 'REF-92051', familyMember: 'Carlos Ramos Valdiviezo', specialty: 'Dermatología', amount: 55.00, refundDate: '2026-05-15', status: 'Reembolsado', invoiceNumber: '001-001-12542', adminComment: 'Factura autorizada por SRI. Transferencia liquidada el 16/05' },
  { id: 'REF-92012', familyMember: 'Mateo Ramos Mendoza', specialty: 'Pediatría', amount: 40.00, refundDate: '2026-05-02', status: 'Reembolsado', invoiceNumber: '002-005-00942', adminComment: 'Reembolso liquidado al 90%' },
  { id: 'REF-83145', familyMember: 'Elena Mendoza de Ramos', specialty: 'Ginecología', amount: 85.00, refundDate: '2026-05-21', status: 'Procesando', invoiceNumber: '005-010-44910' }
];

const initialAuthorizations: AuthorizationItem[] = [
  { id: 'AUT-88125', patient: 'Elena Mendoza de Ramos', procedure: 'Cardiografía Ecocardiograma', facility: 'Hospital Metropolitano', requestDate: '2026-05-18', status: 'Aprobado', adminComment: 'Aprobación inmediata. Diagnóstico de control preventivo.' },
  { id: 'AUT-88091', patient: 'Carlos Ramos Valdiviezo', procedure: 'Resonancia Magnética de Rodilla', facility: 'Clínica San Francisco', requestDate: '2026-05-10', status: 'Aprobado', adminComment: 'Procedimiento programado.' },
  { id: 'AUT-77140', patient: 'Mateo Ramos Mendoza', procedure: 'Terapia Física y Rehabilitación (10 sesiones)', facility: 'Hospital Metropolitano', requestDate: '2026-05-22', status: 'Pendiente' }
];

const initialAppointments: AppointmentItem[] = [
  {
    id: 'APT-10492',
    doctorName: 'Dr. Alejandro Mendoza',
    specialty: 'Cardiología',
    patientName: 'Elena Mendoza de Ramos',
    patientId: '1725458921',
    patientPhone: '0995102555',
    aptDate: '2026-05-26',
    aptTime: '09:00',
    modality: 'presencial',
    clinic: 'Clínica San Francisco',
    city: 'Quito',
    cost: 45,
    status: 'Confirmada'
  },
  {
    id: 'APT-11204',
    doctorName: 'Dra. Gabriela Alarcón',
    specialty: 'Pediatría y Neonatología',
    patientName: 'Mateo Ramos Mendoza',
    patientId: '1755102941',
    patientPhone: '0995102556',
    aptDate: '2026-05-27',
    aptTime: '10:00',
    modality: 'presencial',
    clinic: 'Hospital Metropolitano',
    city: 'Quito',
    cost: 40,
    status: 'Pendiente'
  }
];

const initialLeads: LeadQuote[] = [
  {
    id: 'LEAD-5510-1',
    timestamp: '2026-05-22T19:40:00Z',
    quoteData: {
      fullName: 'Dra. Lucía Guerrero Torres',
      email: 'lucia.guerrero@gmail.com',
      phone: '0984920251',
      type: 'familiar',
      primaryAge: 38,
      partnerAge: 41,
      childrenCount: 2,
      childrenAges: [10, 6],
      basePlanId: 'premium',
    },
    estimatedPrice: 228.50,
    status: 'Nuevo Plan'
  },
  {
    id: 'LEAD-9204-2',
    timestamp: '2026-05-22T11:15:00Z',
    quoteData: {
      fullName: 'Ing. Rodrigo Cevallos Placa',
      email: 'rcevallos@cevallostrans.ec',
      phone: '0992451002',
      type: 'individual',
      primaryAge: 45,
      childrenCount: 0,
      childrenAges: [],
      basePlanId: 'premium',
    },
    estimatedPrice: 380.00,
    status: 'Contactado'
  }
];

// 3. Error handler helper
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Firebase disabled, logging locally only
  console.error('Operation Error: ', operationType, path, error);
}

export const ColmedikalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  
  const [refunds, setRefunds] = useState<RefundItem[]>(() => {
    const saved = localStorage.getItem('colmedikal_refunds');
    return saved ? JSON.parse(saved) : initialRefunds;
  });

  const [appointments, setAppointments] = useState<AppointmentItem[]>(() => {
    const saved = localStorage.getItem('colmedikal_appointments');
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [authorizations, setAuthorizations] = useState<AuthorizationItem[]>(() => {
    const saved = localStorage.getItem('colmedikal_authorizations');
    return saved ? JSON.parse(saved) : initialAuthorizations;
  });

  const [leads, setLeads] = useState<LeadQuote[]>(() => {
    const saved = localStorage.getItem('colmedikal_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });

  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('colmedikal_admins');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);

  // Validate Firestore Connection on initial boot (Critical Constraint)
  useEffect(() => {
    // Firebase disabled
  }, []);

  // Monitor Auth User to determine if it is the Corporate Administrator
  useEffect(() => {
    // Firebase disabled
    const unsub = () => {};
    return unsub;
  }, []);

  // Sync /doctors live for everyone (Public directory)
  useEffect(() => {
    // Firebase disabled
  }, []);

  // Synchronize all administration records in real-time once admin is authenticated
  useEffect(() => {
    // Firebase disabled
    return () => {};
  }, [isAdminUser]);

  // Persist guest offline data to local storage for portal history fallback
  useEffect(() => {
    localStorage.setItem('colmedikal_refunds', JSON.stringify(refunds));
  }, [refunds]);

  useEffect(() => {
    localStorage.setItem('colmedikal_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('colmedikal_authorizations', JSON.stringify(authorizations));
  }, [authorizations]);

  useEffect(() => {
    localStorage.setItem('colmedikal_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('colmedikal_admins', JSON.stringify(admins));
  }, [admins]);

  // Database handlers

  const addDoctor = async (doctor: Doctor) => {
    setDoctors((prev) => [...prev, { ...doctor, active: doctor.active ?? true }]);
  };

  const deleteDoctor = async (id: string) => {
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  };

  const toggleDoctorActiveStatus = async (id: string) => {
    setDoctors((prev) => prev.map((d) => d.id === id ? { ...d, active: d.active === false ? true : false } : d));
  };

  const updateDoctor = async (updatedDoc: Doctor) => {
    setDoctors((prev) => prev.map((d) => d.id === updatedDoc.id ? updatedDoc : d));
  };

  const addRefund = async (refund: Omit<RefundItem, 'id' | 'refundDate'>) => {
    const id = `REF-${Math.floor(10000 + Math.random() * 90000)}`;
    const refundDate = new Date().toISOString().split('T')[0];
    const newRef: RefundItem = {
      ...refund,
      id,
      refundDate,
      status: 'Procesando'
    };
    setRefunds((prev) => [newRef, ...prev]);
  };

  const updateRefundStatus = async (id: string, status: RefundItem['status'], comment?: string) => {
    setRefunds((prev) => prev.map((r) => r.id === id ? { ...r, status, adminComment: comment ?? r.adminComment } : r));
  };

  const addAuthorization = async (authItem: Omit<AuthorizationItem, 'id' | 'requestDate'>) => {
    const id = `AUT-${Math.floor(80000 + Math.random() * 19500)}`;
    const requestDate = new Date().toISOString().split('T')[0];
    const newAuth: AuthorizationItem = {
      ...authItem,
      id,
      requestDate,
      status: 'Pendiente'
    };
    setAuthorizations((prev) => [newAuth, ...prev]);
  };

  const updateAuthorizationStatus = async (id: string, status: AuthorizationItem['status'], comment?: string) => {
    setAuthorizations((prev) => prev.map((a) => a.id === id ? { ...a, status, adminComment: comment ?? a.adminComment } : a));
  };

  const addAppointment = async (appointment: Omit<AppointmentItem, 'id'>) => {
    const id = `APT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newApt: AppointmentItem = {
      ...appointment,
      id,
      status: 'Pendiente'
    };
    setAppointments((prev) => [newApt, ...prev]);
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentItem['status']) => {
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  const addLead = async (quote: QuoteState, estimatedPrice: number) => {
    const id = `LEAD-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;
    const newLead: LeadQuote = {
      id,
      timestamp: new Date().toISOString(),
      quoteData: quote,
      estimatedPrice,
      status: 'Nuevo Plan'
    };
    setLeads((prev) => [newLead, ...prev]);
  };

  const updateLeadStatus = async (id: string, status: LeadQuote['status']) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  };

  const addAdmin = async (email: string, name: string, role: 'Administrador' | 'Auditor Clínico') => {
    const addedBy = 'edox54@gmail.com';
    const newAdminObj: AdminUser = {
      email,
      name,
      role,
      addedAt: new Date().toISOString(),
      addedBy,
      active: true
    };
    setAdmins((prev) => [newAdminObj, ...prev.filter(a => a.email !== email)]);
  };

  const deleteAdmin = async (email: string) => {
    setAdmins((prev) => prev.filter(a => a.email !== email));
  };

  const toggleAdminActiveStatus = async (email: string) => {
    setAdmins((prev) => prev.map((a) => a.email === email ? { ...a, active: !a.active } : a));
  };

  const logout = async () => {
    setIsAdminUser(false);
    setUser(null);
  };

  return (
    <ColmedikalContext.Provider
      value={{
        doctors,
        refunds,
        appointments,
        authorizations,
        leads,
        admins,
        isAdminUser,
        user,
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
        toggleAdminActiveStatus
      }}
    >
      {children}
    </ColmedikalContext.Provider>
  );
};

export const useColmedikal = () => {
  const context = useContext(ColmedikalContext);
  if (context === undefined) {
    throw new Error('useColmedikal must be used within a ColmedikalProvider');
  }
  return context;
};
