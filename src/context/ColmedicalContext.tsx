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

const initialDoctors: Doctor[] = [
  {
    id: 'dr-mendoza',
    name: 'Dr. Alejandro Mendoza',
    specialty: 'Cardiología',
    city: 'Quito',
    phone: '02-3951025',
    email: 'a.mendoza@colmedical.center',
    clinic: 'Clínica San Francisco',
    rating: '4.95 (120 valoraciones)',
    availability: 'Disponible Lunes y Miércoles 08:00 - 13:00',
    education: 'Especialización en Cardiología - Cleveland Clinic, USA',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
    cost: 45
  },
  {
    id: 'dra-alarcon',
    name: 'Dra. Gabriela Alarcón',
    specialty: 'Pediatría y Neonatología',
    city: 'Quito',
    phone: '02-3998112',
    email: 'g.alarcon@colmedical.center',
    clinic: 'Hospital Metropolitano',
    rating: '4.98 (245 valoraciones)',
    availability: 'Disponible de Lunes a Viernes 09:00 - 16:00',
    education: 'Subespecialidad en Neonatología - Universidad Complutense, Madrid',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150',
    cost: 40
  },
  {
    id: 'dr-pacheco',
    name: 'Dr. Fernando Pacheco',
    specialty: 'Traumatología y Ortopedia',
    city: 'Guayaquil',
    phone: '04-2289650',
    email: 'f.pacheco@colmedical.center',
    clinic: 'Clínica Kennedy',
    rating: '4.92 (98 valoraciones)',
    availability: 'Disponible Martes y Jueves de 14:00 - 19:00',
    education: 'Cirugía Ortopédica Avanzada - Hospital Clínic de Barcelona',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
    cost: 50
  },
  {
    id: 'dra-salinas',
    name: 'Dra. Marina Salinas',
    specialty: 'Ginecología y Obstetricia',
    city: 'Guayaquil',
    phone: '04-2583344',
    email: 'm.salinas@colmedical.center',
    clinic: 'Hospital Alcívar',
    rating: '4.96 (180 valoraciones)',
    availability: 'Disponible Lunes, Miércoles e Interdiario',
    education: 'Obstetricia y Medicina Reproductiva - Universidad de Buenos Aires',
    image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=150',
    cost: 45
  },
  {
    id: 'dra-vintimilla',
    name: 'Dra. Estefanía Vintimilla',
    specialty: 'Dermatología',
    city: 'Cuenca',
    phone: '07-2815520',
    email: 'e.vintimilla@colmedical.center',
    clinic: 'Clínica Santa Inés',
    rating: '4.94 (112 valoraciones)',
    availability: 'Disponible de Lunes a Viernes 10:00 - 13:00 / 15:00 - 18:00',
    education: 'Especialista en Dermatología Clínica y Estética - Universidad Central de Venezuela',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=150',
    cost: 45
  },
  {
    id: 'dr-barrera',
    name: 'Dr. Javier Barrera',
    specialty: 'Medicina General',
    city: 'Quito',
    phone: '02-3951111',
    email: 'j.barrera@colmedical.center',
    clinic: 'Colmedical Center Sede Amazonas',
    rating: '4.91 (500+ valoraciones)',
    availability: 'Disponible Hoy - Cobertura Telemedicina en Red 24/7',
    education: 'Título de Médico Cirujano - Universidad de Chile',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150',
    cost: 25
  },
  {
    id: 'dra-pombo',
    name: 'Dra. Julia Pombo',
    specialty: 'Odontología y Maxilofacial',
    city: 'Guayaquil',
    phone: '04-2289901',
    email: 'j.pombo@colmedical.center',
    clinic: 'Clínica Dental del Pacífico',
    rating: '4.97 (88 valoraciones)',
    availability: 'Disponible con cita programada de 08:30 - 17:30',
    education: 'Diseño de Sonrisa y Rehabilitación Oral - Universidad de São Paulo',
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&q=80&w=150',
    cost: 30
  }
];

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
      dentalAddon: true,
      maternityAddon: false,
      intlAddon: true,
      rxAddon: true
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
      type: 'corporativo',
      primaryAge: 45,
      childrenCount: 0,
      childrenAges: [],
      basePlanId: 'elite',
      dentalAddon: true,
      maternityAddon: false,
      intlAddon: true,
      rxAddon: true
    },
    estimatedPrice: 380.00,
    status: 'Contactado'
  }
];

export const ColmedicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('colmedical_doctors');
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
    localStorage.setItem('colmedical_doctors', JSON.stringify(doctors));
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
