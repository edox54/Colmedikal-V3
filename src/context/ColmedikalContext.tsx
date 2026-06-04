import React, { createContext, useContext, useState, useEffect } from 'react';
import { Doctor, RefundItem, AuthorizationItem, AppointmentItem, LeadQuote, QuoteState, AdminUser } from '../types';
import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  getDocFromServer
} from 'firebase/firestore';

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

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
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
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test-connection-probe', 'probe-id'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  // Monitor Auth User to determine if it is the Corporate Administrator
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u && u.emailVerified && u.email) {
        if (u.email === "edox54@gmail.com") {
          setIsAdminUser(true);
        } else {
          try {
            // Check in firestore
            const adminDocRef = doc(db, 'admins', u.email);
            const adminSnap = await getDocFromServer(adminDocRef);
            if (adminSnap.exists() && adminSnap.data()?.active !== false) {
              setIsAdminUser(true);
            } else {
              setIsAdminUser(false);
            }
          } catch (e) {
            console.error("Error verifying admin role in Firestore: ", e);
            setIsAdminUser(false);
          }
        }
      } else {
        setIsAdminUser(false);
      }
    });
    return unsub;
  }, []);

  // Sync /doctors live for everyone (Public directory)
  useEffect(() => {
    const seedDoctorsIfEmpty = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'doctors'));
        if (querySnapshot.empty) {
          console.log('Seeding doctors collection...');
          for (const docItem of initialDoctors) {
            await setDoc(doc(db, 'doctors', docItem.id), {
              ...docItem,
              active: docItem.active ?? true
            });
          }
        }
      } catch (error) {
        console.error('Initial check or seeding failed: ', error);
      }
    };

    seedDoctorsIfEmpty().then(() => {
      const unsub = onSnapshot(collection(db, 'doctors'), (snapshot) => {
        const docsArr: Doctor[] = [];
        snapshot.forEach((snapDoc) => {
          docsArr.push(snapDoc.data() as Doctor);
        });
        setDoctors(docsArr);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'doctors');
      });
      return unsub;
    });
  }, []);

  // Synchronize all administration records in real-time once admin is authenticated
  useEffect(() => {
    if (!isAdminUser) return;

    console.log('Syncing administrative data feeds in real-time...');

    const unsubRefunds = onSnapshot(collection(db, 'refunds'), (snapshot) => {
      const arr: RefundItem[] = [];
      snapshot.forEach((snapDoc) => {
        arr.push(snapDoc.data() as RefundItem);
      });
      setRefunds(arr);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'refunds');
    });

    const unsubAuths = onSnapshot(collection(db, 'authorizations'), (snapshot) => {
      const arr: AuthorizationItem[] = [];
      snapshot.forEach((snapDoc) => {
        arr.push(snapDoc.data() as AuthorizationItem);
      });
      setAuthorizations(arr);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'authorizations');
    });

    const unsubApts = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      const arr: AppointmentItem[] = [];
      snapshot.forEach((snapDoc) => {
        arr.push(snapDoc.data() as AppointmentItem);
      });
      setAppointments(arr);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'appointments');
    });

    const unsubLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
      const arr: LeadQuote[] = [];
      snapshot.forEach((snapDoc) => {
        arr.push(snapDoc.data() as LeadQuote);
      });
      setLeads(arr);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'leads');
    });

    const unsubAdmins = onSnapshot(collection(db, 'admins'), (snapshot) => {
      const arr: AdminUser[] = [];
      snapshot.forEach((snapDoc) => {
        arr.push(snapDoc.data() as AdminUser);
      });
      setAdmins(arr);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'admins');
    });

    return () => {
      unsubRefunds();
      unsubAuths();
      unsubApts();
      unsubLeads();
      unsubAdmins();
    };
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
    const docObj = {
      ...doctor,
      active: doctor.active ?? true
    };
    try {
      await setDoc(doc(db, 'doctors', doctor.id), docObj);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `doctors/${doctor.id}`);
    }
  };

  const deleteDoctor = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'doctors', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `doctors/${id}`);
    }
  };

  const toggleDoctorActiveStatus = async (id: string) => {
    const docToToggle = doctors.find((d) => d.id === id);
    if (!docToToggle) return;
    const nextActive = docToToggle.active === false ? true : false;
    try {
      await updateDoc(doc(db, 'doctors', id), {
        active: nextActive
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `doctors/${id}`);
    }
  };

  const updateDoctor = async (updatedDoc: Doctor) => {
    try {
      await setDoc(doc(db, 'doctors', updatedDoc.id), updatedDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `doctors/${updatedDoc.id}`);
    }
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

    try {
      await setDoc(doc(db, 'refunds', id), newRef);
      setRefunds((prev) => [newRef, ...prev]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `refunds/${id}`);
    }
  };

  const updateRefundStatus = async (id: string, status: RefundItem['status'], comment?: string) => {
    const payload: Partial<RefundItem> = { status };
    if (comment !== undefined) {
      payload.adminComment = comment;
    }
    try {
      await updateDoc(doc(db, 'refunds', id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `refunds/${id}`);
    }
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

    try {
      await setDoc(doc(db, 'authorizations', id), newAuth);
      setAuthorizations((prev) => [newAuth, ...prev]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `authorizations/${id}`);
    }
  };

  const updateAuthorizationStatus = async (id: string, status: AuthorizationItem['status'], comment?: string) => {
    const payload: Partial<AuthorizationItem> = { status };
    if (comment !== undefined) {
      payload.adminComment = comment;
    }
    try {
      await updateDoc(doc(db, 'authorizations', id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `authorizations/${id}`);
    }
  };

  const addAppointment = async (appointment: Omit<AppointmentItem, 'id'>) => {
    const id = `APT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newApt: AppointmentItem = {
      ...appointment,
      id,
      status: 'Pendiente'
    };

    try {
      await setDoc(doc(db, 'appointments', id), newApt);
      setAppointments((prev) => [newApt, ...prev]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `appointments/${id}`);
    }
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentItem['status']) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
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

    try {
      await setDoc(doc(db, 'leads', id), newLead);
      setLeads((prev) => [newLead, ...prev]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leads/${id}`);
    }
  };

  const updateLeadStatus = async (id: string, status: LeadQuote['status']) => {
    try {
      await updateDoc(doc(db, 'leads', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${id}`);
    }
  };

  const addAdmin = async (email: string, name: string, role: 'Administrador' | 'Auditor Clínico') => {
    const addedBy = auth.currentUser?.email || 'edox54@gmail.com';
    const newAdminObj: AdminUser = {
      email,
      name,
      role,
      addedAt: new Date().toISOString(),
      addedBy,
      active: true
    };
    try {
      await setDoc(doc(db, 'admins', email), newAdminObj);
      setAdmins((prev) => [newAdminObj, ...prev.filter(a => a.email !== email)]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `admins/${email}`);
    }
  };

  const deleteAdmin = async (email: string) => {
    try {
      await deleteDoc(doc(db, 'admins', email));
      setAdmins((prev) => prev.filter(a => a.email !== email));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admins/${email}`);
    }
  };

  const toggleAdminActiveStatus = async (email: string) => {
    const adminToToggle = admins.find((a) => a.email === email);
    if (!adminToToggle) return;
    const nextActive = !adminToToggle.active;
    try {
      await updateDoc(doc(db, 'admins', email), {
        active: nextActive
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `admins/${email}`);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setIsAdminUser(false);
      setUser(null);
    } catch (error) {
      console.error("Logout error: ", error);
    }
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
