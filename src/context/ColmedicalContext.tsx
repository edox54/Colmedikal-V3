import React, { createContext, useContext, useState, useEffect } from 'react';
import { Doctor, RefundItem, AuthorizationItem, AppointmentItem, LeadQuote, QuoteState } from '../types';

interface ColmedicalContextType {
  doctors: Doctor[];
  refunds: RefundItem[];
  appointments: AppointmentItem[];
  authorizations: AuthorizationItem[];
  leads: LeadQuote[];
  addDoctor: (doctor: Doctor) => void;
  deleteDoctor: (id: string) => void;
  addRefund: (refund: Omit<RefundItem, 'id' | 'refundDate'>) => void;
  updateRefundStatus: (id: string, status: RefundItem['status'], comment?: string) => void;
  addAuthorization: (auth: Omit<AuthorizationItem, 'id' | 'requestDate'>) => void;
  updateAuthorizationStatus: (id: string, status: AuthorizationItem['status'], comment?: string) => void;
  addAppointment: (appointment: Omit<AppointmentItem, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentItem['status']) => void;
  addLead: (quote: QuoteState, estimatedPrice: number) => void;
  updateLeadStatus: (id: string, status: LeadQuote['status']) => void;
}

const ColmedicalContext = createContext<ColmedicalContextType | undefined>(undefined);

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

export const ColmedicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('colmedical_doctors_v3');
    return saved ? JSON.parse(saved) : initialDoctors;
  });

  const [refunds, setRefunds] = useState<RefundItem[]>(() => {
    const saved = localStorage.getItem('colmedical_refunds');
    return saved ? JSON.parse(saved) : initialRefunds;
  });

  const [appointments, setAppointments] = useState<AppointmentItem[]>(() => {
    const saved = localStorage.getItem('colmedical_appointments');
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [authorizations, setAuthorizations] = useState<AuthorizationItem[]>(() => {
    const saved = localStorage.getItem('colmedical_authorizations');
    return saved ? JSON.parse(saved) : initialAuthorizations;
  });

  const [leads, setLeads] = useState<LeadQuote[]>(() => {
    const saved = localStorage.getItem('colmedical_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });

  useEffect(() => {
    localStorage.setItem('colmedical_doctors_v3', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('colmedical_refunds', JSON.stringify(refunds));
  }, [refunds]);

  useEffect(() => {
    localStorage.setItem('colmedical_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('colmedical_authorizations', JSON.stringify(authorizations));
  }, [authorizations]);

  useEffect(() => {
    localStorage.setItem('colmedical_leads', JSON.stringify(leads));
  }, [leads]);

  const addDoctor = (doctor: Doctor) => {
    setDoctors((prev) => [doctor, ...prev]);
  };

  const deleteDoctor = (id: string) => {
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  };

  const addRefund = (refund: Omit<RefundItem, 'id' | 'refundDate'>) => {
    const newRef: RefundItem = {
      ...refund,
      id: `REF-${Math.floor(10000 + Math.random() * 90000)}`,
      refundDate: new Date().toISOString().split('T')[0]
    };
    setRefunds((prev) => [newRef, ...prev]);
  };

  const updateRefundStatus = (id: string, status: RefundItem['status'], comment?: string) => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, adminComment: comment || r.adminComment } : r))
    );
  };

  const addAuthorization = (auth: Omit<AuthorizationItem, 'id' | 'requestDate'>) => {
    const newAuth: AuthorizationItem = {
      ...auth,
      id: `AUT-${Math.floor(80000 + Math.random() * 19500)}`,
      requestDate: new Date().toISOString().split('T')[0]
    };
    setAuthorizations((prev) => [newAuth, ...prev]);
  };

  const updateAuthorizationStatus = (id: string, status: AuthorizationItem['status'], comment?: string) => {
    setAuthorizations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, adminComment: comment || a.adminComment } : a))
    );
  };

  const addAppointment = (appointment: Omit<AppointmentItem, 'id'>) => {
    const newApt: AppointmentItem = {
      ...appointment,
      id: `APT-${Math.floor(10000 + Math.random() * 90000)}`
    };
    setAppointments((prev) => [newApt, ...prev]);
  };

  const updateAppointmentStatus = (id: string, status: AppointmentItem['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const addLead = (quote: QuoteState, estimatedPrice: number) => {
    const newLead: LeadQuote = {
      id: `LEAD-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
      timestamp: new Date().toISOString(),
      quoteData: quote,
      estimatedPrice,
      status: 'Nuevo Plan'
    };
    setLeads((prev) => [newLead, ...prev]);
  };

  const updateLeadStatus = (id: string, status: LeadQuote['status']) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  };

  return (
    <ColmedicalContext.Provider
      value={{
        doctors,
        refunds,
        appointments,
        authorizations,
        leads,
        addDoctor,
        deleteDoctor,
        addRefund,
        updateRefundStatus,
        addAuthorization,
        updateAuthorizationStatus,
        addAppointment,
        updateAppointmentStatus,
        addLead,
        updateLeadStatus
      }}
    >
      {children}
    </ColmedicalContext.Provider>
  );
};

export const useColmedical = () => {
  const context = useContext(ColmedicalContext);
  if (context === undefined) {
    throw new Error('useColmedical must be used within a ColmedicalProvider');
  }
  return context;
};
