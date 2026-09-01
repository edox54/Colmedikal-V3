import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
// import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
// import { auth } from '../firebase';
import { 
  useColmedikal 
} from '../context/ColmedikalContext';
import { 
  Building2,
  Users,
  LogOut,
  DollarSign,
  FileCheck,
  Calendar,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  TrendingUp,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  HeartPulse,
  UserCheck,
  FileText,
  Stethoscope,
  Eye,
  X,
  Sparkles,
  ArrowRight,
  Filter,
  Download,
  Edit,
  Bell,
  RefreshCw,
  Hospital,
  Activity,
  FlaskConical,
  AlertCircle,
  Lock,
  EyeOff,
  ChevronRight,
} from 'lucide-react';
import { Page, Doctor, AppointmentItem } from '../types';
import avatarGomez from '../assets/images/avatar_gomez_1780024902226.png';
import avatarRestrepo from '../assets/images/avatar_restrepo_1780024921091.png';
import avatarDoctorM2 from '../assets/images/avatar_doctor_m2_1780025298286.png';
import avatarDoctorF2 from '../assets/images/avatar_doctor_f2_1780025316717.png';

import AdminSidebar from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';
import AdminLoginScreen from './admin/AdminLoginScreen';
import DocumentPreviewModal from './admin/DocumentPreviewModal';
import { AdminThemeProvider, useAdminTheme } from './admin/AdminThemeContext';
import { AdminSharedProps, ActiveTab } from './admin/adminTypes';
import KpisSection from './admin/sections/KpisSection';
import RefundsSection from './admin/sections/RefundsSection';
import AppointmentsSection from './admin/sections/AppointmentsSection';
import AuthsSection from './admin/sections/AuthsSection';
import LeadsSection from './admin/sections/LeadsSection';
import ClientesSection from './admin/sections/ClientesSection';
import DoctorsSection from './admin/sections/DoctorsSection';
import AdminsSection from './admin/sections/AdminsSection';
import SitioSection from './admin/sections/SitioSection';

interface AdminPanelProps {
  setCurrentPage: (page: Page) => void;
}

export default function AdminPanel({ setCurrentPage }: AdminPanelProps) {
  const {
    doctors,
    refunds,
    appointments,
    authorizations,
    leads,
    admins,
    login,
    addDoctor,
    deleteDoctor,
    toggleDoctorActiveStatus,
    updateDoctor,
    updateRefundStatus,
    updateAuthorizationStatus,
    updateAppointmentStatus,
    updateLeadStatus,
    updateClientPaymentStatus,
    updateLeadPlan,
    setClientContractNumber,
    setClientPassword,
    addLeadNote,
    assignLead,
    setLeadFollowUp,
    setLeadLostReason,
    deleteLead,
    refreshData,
    addAdmin,
    deleteAdmin,
    toggleAdminActiveStatus,
    updateAdminRole,
    seoSettings,
    saveSEOSettings
  } = useColmedikal();

  const prevLeadsCountRef = useRef(leads.length);

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  // Secure Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('colmedikal_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Document Viewer overlay state
  const [selectedDocument, setSelectedDocument] = useState<{
    id: string;
    type: 'refund' | 'auth';
    fullName: string;
    fileName: string;
    date: string;
    amount?: number;
    invoiceNumber?: string;
    procedure?: string;
    facility?: string;
    phone?: string;
    email?: string;
    fileData?: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'kpis' | 'refunds' | 'appointments' | 'auths' | 'leads' | 'clientes' | 'doctors' | 'admins' | 'sitio'>('kpis');
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);

  // Lead filters
  const [leadDateFilter, setLeadDateFilter] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'Nuevo Plan' | 'Contactado' | 'Cierre Efectivo' | 'Perdido'>('all');
  const [leadSourceFilter, setLeadSourceFilter] = useState('all');
  const [leadSearchFilter, setLeadSearchFilter] = useState('');

  // Clientes (leads with status 'Cierre Efectivo') filters + password modal
  const [clientSearchFilter, setClientSearchFilter] = useState('');
  const [passwordModalLeadId, setPasswordModalLeadId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordFieldVisible, setPasswordFieldVisible] = useState(false);
  const [passwordSaveLoading, setPasswordSaveLoading] = useState(false);
  const [passwordSaveError, setPasswordSaveError] = useState('');
  const [passwordSaveSuccess, setPasswordSaveSuccess] = useState<string | null>(null);
  // Notes UI — tracks which lead card has the note input open
  const [openNoteLeadId, setOpenNoteLeadId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  // Contract number inline edit — tracks which client row has the input open
  const [contractEditId, setContractEditId] = useState<string | null>(null);
  const [contractNumberInput, setContractNumberInput] = useState('');

  // Administradores form and registration states
  const [newAdmin, setNewAdmin] = useState<{
    email: string;
    name: string;
    role: 'Super Admin' | 'Mid Admin' | 'Equipo Comercial' | 'Auditor';
    password: string;
  }>({
    email: '',
    name: '',
    role: 'Mid Admin',
    password: '',
  });
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');
  const [adminErrorMsg, setAdminErrorMsg] = useState('');

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.name || !newAdmin.password) {
      setAdminErrorMsg('Por favor complete todos los campos.');
      return;
    }
    if (!newAdmin.email.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)) {
      setAdminErrorMsg('Por favor ingrese un correo válido.');
      return;
    }
    if (newAdmin.password.length < 8) {
      setAdminErrorMsg('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsSubmittingAdmin(true);
    setAdminErrorMsg('');
    setAdminSuccessMsg('');
    try {
      await addAdmin(newAdmin.email, newAdmin.name, newAdmin.role, newAdmin.password);
      setAdminSuccessMsg(`¡Acceso otorgado con éxito para ${newAdmin.name}!`);
      setNewAdmin({ email: '', name: '', role: 'Mid Admin', password: '' });
      setTimeout(() => setAdminSuccessMsg(''), 4000);
    } catch (err: any) {
      setAdminErrorMsg('Ocurrió un error al registrar el acceso seguro.');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  // Role of the currently logged-in user — comes directly from the JWT via sessionStorage
  const currentUserRole = (() => {
    try {
      const stored = sessionStorage.getItem('colmedikal_user');
      if (!stored) return 'Super Admin' as const;
      const userObj = JSON.parse(stored);
      const role = userObj?.role as string;
      const validRoles = ['Super Admin', 'Mid Admin', 'Equipo Comercial', 'Auditor'] as const;
      return validRoles.includes(role as any)
        ? role as 'Super Admin' | 'Mid Admin' | 'Equipo Comercial' | 'Auditor'
        : 'Super Admin' as const;
    } catch { return 'Super Admin' as const; }
  })();

  const canSeeTab = (tab: string) => {
    if (currentUserRole === 'Super Admin') return true;
    if (currentUserRole === 'Mid Admin') return tab !== 'seo';
    if (currentUserRole === 'Equipo Comercial') return tab === 'kpis' || tab === 'leads' || tab === 'auths' || tab === 'clientes';
    if (currentUserRole === 'Auditor') return tab === 'refunds';
    return false;
  };

  const canDeleteLeads = currentUserRole === 'Super Admin' || currentUserRole === 'Mid Admin';
  const canManageAdmins = currentUserRole === 'Super Admin';

  const normalizePlanName = (name?: string): string => {
    if (!name || /pendiente|individual/i.test(name)) return '';
    return name
      .replace(/Plan\s+(?:Colmedikal\s+)?Básico|Plan\s+1\s*[—\-]\s*Básico/gi, 'Plan Inicio 2K')
      .replace(/Plan\s+(?:Colmedikal\s+)?Esencial|Plan\s+2\s*[—\-]\s*Esencial/gi, 'Plan Protección 3K')
      .replace(/Plan\s+(?:Colmedikal\s+)?Premium|Plan\s+3\s*[—\-]\s*Premium/gi, 'Plan Plus 5K');
  };

  // basePlanId is now only ever set by the Cotizador when a real plan was chosen
  // (never a fabricated default) — safe to use as a display fallback when
  // selectedPlanName wasn't formatted for some reason.
  const PLAN_ID_TO_NAME: Record<string, string> = {
    inicio: 'Plan Inicio 2K',
    proteccion: 'Plan Protección 3K',
    plus: 'Plan Plus 5K',
  };
  const resolvePlanName = (l: { quoteData?: { selectedPlanName?: string; basePlanId?: string } }): string =>
    normalizePlanName(l.quoteData?.selectedPlanName) || PLAN_ID_TO_NAME[l.quoteData?.basePlanId || ''] || '';

  // Origin badge styling — where this lead came from (see src/utils/attribution.ts)
  const SOURCE_BADGE: Record<string, string> = {
    'Directo': 'bg-slate-100 text-slate-500 border-slate-200',
    'Orgánico': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Redes sociales': 'bg-pink-50 text-pink-700 border-pink-100',
    'Pago': 'bg-amber-50 text-amber-700 border-amber-100',
    'Referido': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'Campaña': 'bg-sky-50 text-sky-700 border-sky-100',
    'Otro sitio': 'bg-slate-100 text-slate-500 border-slate-200',
  };

  // Canonical catalog for the admin "Cambiar Plan" control — same 3 real
  // plans as Cotizador.tsx / server.ts's PLAN_CATALOG (duplicated, same
  // pattern used elsewhere in this codebase).
  const PLAN_CATALOG: Record<string, { name: string; basePrice: number }> = {
    inicio: { name: 'Plan Inicio 2K', basePrice: 8 },
    proteccion: { name: 'Plan Protección 3K', basePrice: 12 },
    plus: { name: 'Plan Plus 5K', basePrice: 22 },
  };
  const handlePlanChange = (leadId: string, basePlanId: string) => {
    if (!basePlanId) return;
    const plan = PLAN_CATALOG[basePlanId];
    if (!plan) return;
    updateLeadPlan(leadId, basePlanId, `${plan.name} — $${plan.basePrice}/mes`, plan.basePrice);
  };

  const exportLeadsCSV = (clusters: [string, typeof leads][]) => {
    const headers = ['Código','Nombre','Email','Teléfono','Cédula','Fecha de Nacimiento','Plan','Precio/mes','Estado','Asignado a','Fecha','Origen','Detalle de origen'];
    const rows = clusters.map(([, cluster]) => {
      const l = cluster[0];
      return [
        l.quoteData?.leadCode || l.id,
        l.quoteData?.fullName || '',
        l.quoteData?.email || '',
        l.quoteData?.phone || '',
        l.quoteData?.docNumber || '',
        l.quoteData?.birthDate || '',
        resolvePlanName(l),
        Number(l.estimatedPrice || 0).toFixed(2),
        l.status,
        l.assignedTo || '',
        new Date(l.timestamp).toLocaleString('es-EC'),
        l.quoteData?.source?.channel || 'Directo',
        l.quoteData?.source?.detail || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `leads_colmedikal_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // Doctors form state
  const [newDoc, setNewDoc] = useState({
    name: '',
    specialty: 'Medicina General',
    city: 'Quito',
    phone: '',
    email: '',
    clinic: '',
    availability: 'Disponible Lunes a Viernes',
    education: '',
    cost: 40,
    image: 'doctor_m',
    nivel: 1,
  });
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [docSuccessMsg, setDocSuccessMsg] = useState('');

  // Listen to Firebase Auth state for automatic session sync
  useEffect(() => {
    // Firebase auth disabled
    return () => {};
  }, []);

  // Auto-refresh every 10 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => { refreshData(); }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Redirect to the only accessible tab when user role is restrictive
  useEffect(() => {
    if (!isAuthenticated) return;
    if (currentUserRole === 'Auditor' && activeTab !== 'refunds') setActiveTab('refunds');
    if (currentUserRole === 'Equipo Comercial' && !['kpis', 'leads', 'auths', 'clientes'].includes(activeTab)) setActiveTab('kpis');
  }, [isAuthenticated, currentUserRole]);

  // Sound notification when new leads arrive
  useEffect(() => {
    if (leads.length > prevLeadsCountRef.current && isAuthenticated) {
      playNotificationSound();
    }
    prevLeadsCountRef.current = leads.length;
  }, [leads.length]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('Autenticación con Google deshabilitada temporalmente.');
    setIsLoggingIn(false);
  };

  // Secure Cryptographic Login Verification
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      // Usar el contexto para conectarse al backend
      await login(username.trim(), password.trim());
      setIsAuthenticated(true);
      sessionStorage.setItem('colmedikal_admin_auth', 'true');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Error al iniciar sesión');
      setIsAuthenticated(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('colmedikal_admin_auth');
    sessionStorage.removeItem('colmedikal_admin_auth_google');
    setUsername('');
    setPassword('');
  };

  // Selected details modal/panel state
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  // Handle addition or modification of a doctor
  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.clinic || !newDoc.education) {
      alert('Por favor complete los campos obligatorios del especialista o clínica.');
      return;
    }

    const imageMap: Record<string, string> = {
      doctor_m: avatarGomez,
      doctor_f: avatarRestrepo,
      doctor_m2: avatarDoctorM2,
      doctor_f2: avatarDoctorF2,
      // Establishment icons stored as sentinel values — resolved in DirectorioMedico
      icon_hospital: 'icon_hospital',
      icon_lab: 'icon_lab',
      icon_dental: 'icon_dental',
      icon_building: 'icon_building',
    };

    const imageUrl = imageMap[newDoc.image] || newDoc.image || avatarGomez;

    if (editingDocId) {
      const existingDoctorObj = doctors.find(d => d.id === editingDocId);
      const updatedDoctorObj: Doctor = {
        id: editingDocId,
        name: newDoc.name,
        specialty: newDoc.specialty,
        city: newDoc.city,
        phone: newDoc.phone || '02-500-0100',
        email: newDoc.email || `${newDoc.name.toLowerCase().replace(/\s/g, '.')}@colmedikal.center`,
        clinic: newDoc.clinic,
        rating: existingDoctorObj?.rating || '5.00',
        availability: newDoc.availability,
        education: newDoc.education,
        image: imageUrl,
        cost: Number(newDoc.cost),
        active: existingDoctorObj?.active ?? true,
        nivel: newDoc.nivel,
      };
      updateDoctor(updatedDoctorObj);
      setEditingDocId(null);
      setDocSuccessMsg('¡Especialista prestador actualizado con éxito!');
    } else {
      const newDoctorObj: Doctor = {
        id: `dr-${Date.now()}`,
        name: newDoc.name,
        specialty: newDoc.specialty,
        city: newDoc.city,
        phone: newDoc.phone || '02-500-0100',
        email: newDoc.email || `${newDoc.name.toLowerCase().replace(/\s/g, '.')}@colmedikal.center`,
        clinic: newDoc.clinic,
        rating: '5.00 (Nuevo Ingreso)',
        availability: newDoc.availability,
        education: newDoc.education,
        image: imageUrl,
        cost: Number(newDoc.cost),
        nivel: newDoc.nivel,
      };
      addDoctor(newDoctorObj);
      setDocSuccessMsg('¡Especialista registrado con éxito en el Directorio Médico!');
    }

    setNewDoc({
      name: '',
      specialty: 'Medicina General',
      city: 'Quito',
      phone: '',
      email: '',
      clinic: '',
      availability: 'Disponible Lunes a Viernes',
      education: '',
      cost: 40,
      image: 'doctor_m',
      nivel: 1,
    });
    setTimeout(() => setDocSuccessMsg(''), 4000);
  };

  const handleEditInitiate = (doc: Doctor) => {
    const matchAvatarId = (imgUrl: string) => {
      if (imgUrl === 'icon_hospital' || imgUrl === 'icon_lab' || imgUrl === 'icon_dental' || imgUrl === 'icon_building') return imgUrl;
      if (imgUrl.includes('gomez') || (imgUrl.includes('doctor_m') && !imgUrl.includes('doctor_m2'))) return 'doctor_m';
      if (imgUrl.includes('restrepo') || (imgUrl.includes('doctor_f') && !imgUrl.includes('doctor_f2'))) return 'doctor_f';
      if (imgUrl.includes('doctor_m2')) return 'doctor_m2';
      if (imgUrl.includes('doctor_f2')) return 'doctor_f2';
      return 'icon_building';
    };

    setEditingDocId(doc.id);
    setNewDoc({
      name: doc.name,
      specialty: doc.specialty,
      city: doc.city,
      phone: doc.phone || '',
      email: doc.email || '',
      clinic: doc.clinic,
      availability: doc.availability || 'Disponible Lunes a Viernes',
      education: doc.education || '',
      cost: doc.cost,
      image: matchAvatarId(doc.image),
      nivel: doc.nivel ?? 1,
    });
  };

  const handleCancelEdit = () => {
    setEditingDocId(null);
    setNewDoc({
      name: '',
      specialty: 'Medicina General',
      city: 'Quito',
      phone: '',
      email: '',
      clinic: '',
      availability: 'Disponible Lunes a Viernes',
      education: '',
      cost: 40,
      image: 'doctor_m',
      nivel: 1,
    });
  };

  // KPI Calculations
  const pendingRefunds = refunds.filter(r => r.status === 'Procesando');
  const totalRefundAmountPending = pendingRefunds.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const totalLeadsUncontacted = leads.filter(l => l.status === 'Nuevo Plan').length;
  const pendingAuthsCount = authorizations.filter(a => a.status === 'Pendiente' || a.status === 'Auditoría').length;
  const activeAppointmentsCount = appointments.filter(a => a.status === 'Confirmada' || a.status === 'Pendiente').length;

  // Duplicate lead detection
  const duplicateGroups = useMemo(() => {
    const byEmail: Record<string, string[]> = {};
    const byPhone: Record<string, string[]> = {};
    leads.forEach(ld => {
      const email = ld.quoteData?.email?.toLowerCase().trim();
      const phone = ld.quoteData?.phone?.replace(/\s/g, '');
      if (email) { if (!byEmail[email]) byEmail[email] = []; byEmail[email].push(ld.id); }
      if (phone) { if (!byPhone[phone]) byPhone[phone] = []; byPhone[phone].push(ld.id); }
    });
    const dupIds = new Set<string>();
    Object.values(byEmail).filter(ids => ids.length > 1).forEach(ids => ids.forEach(id => dupIds.add(id)));
    Object.values(byPhone).filter(ids => ids.length > 1).forEach(ids => ids.forEach(id => dupIds.add(id)));
    return dupIds;
  }, [leads]);


  const data: AdminSharedProps = {
    doctors, refunds, appointments, authorizations, leads, admins,
    login, addDoctor, deleteDoctor, toggleDoctorActiveStatus, updateDoctor,
    updateRefundStatus, updateAuthorizationStatus, updateAppointmentStatus,
    updateLeadStatus, updateClientPaymentStatus, updateLeadPlan,
    setClientContractNumber, setClientPassword, addLeadNote, assignLead,
    setLeadFollowUp, setLeadLostReason, deleteLead, refreshData, addAdmin,
    deleteAdmin, toggleAdminActiveStatus, updateAdminRole, seoSettings,
    saveSEOSettings,
    setCurrentPage,
    isAuthenticated, setIsAuthenticated, username, setUsername, password,
    setPassword, loginError, isLoggingIn, handleLogin, handleLogout,
    selectedDocument, setSelectedDocument,
    activeTab, setActiveTab,
    maintenanceSaving, setMaintenanceSaving,
    leadDateFilter, setLeadDateFilter, leadStatusFilter, setLeadStatusFilter,
    leadSourceFilter, setLeadSourceFilter, leadSearchFilter, setLeadSearchFilter,
    clientSearchFilter, setClientSearchFilter, passwordModalLeadId, setPasswordModalLeadId,
    newPasswordInput, setNewPasswordInput, passwordFieldVisible, setPasswordFieldVisible,
    passwordSaveLoading, setPasswordSaveLoading, passwordSaveError, setPasswordSaveError,
    passwordSaveSuccess, setPasswordSaveSuccess,
    openNoteLeadId, setOpenNoteLeadId, noteText, setNoteText,
    contractEditId, setContractEditId, contractNumberInput, setContractNumberInput,
    newAdmin, setNewAdmin, isSubmittingAdmin, adminSuccessMsg, adminErrorMsg, handleRegisterAdmin,
    currentUserRole, canSeeTab, canDeleteLeads, canManageAdmins,
    resolvePlanName, SOURCE_BADGE, PLAN_CATALOG, handlePlanChange, exportLeadsCSV,
    newDoc, setNewDoc, editingDocId, docSuccessMsg, handleAddDoctor, handleEditInitiate, handleCancelEdit,
    avatarGomez, avatarRestrepo, avatarDoctorM2, avatarDoctorF2,
    selectedRefundId, setSelectedRefundId, adminComment, setAdminComment,
    pendingRefunds, totalRefundAmountPending, totalLeadsUncontacted, pendingAuthsCount,
    activeAppointmentsCount, duplicateGroups,
  };

  return (
    <>
      {!isAuthenticated ? (
        <AdminLoginScreen {...data} />
      ) : (
        <AdminThemeProvider>
          <AuthenticatedAdminShell data={data} />
        </AdminThemeProvider>
      )}

      <DocumentPreviewModal {...data} />
    </>
  );
}

const TAB_META: Record<ActiveTab, { title: string; subtitle: string }> = {
  kpis: { title: 'Colmedikal Corporativo', subtitle: 'Consola General — Módulo Administrativo Interno de Auditoría Médica y Gestión de Planes' },
  refunds: { title: 'Auditoría de Reembolsos', subtitle: 'Verificación y liquidación de facturas presentadas por afiliados' },
  appointments: { title: 'Citas Médicas', subtitle: 'Agenda de consultas solicitadas desde el portal de pacientes' },
  auths: { title: 'Autorizaciones', subtitle: 'Auditoría clínica de procedimientos complejos' },
  leads: { title: 'Cotizaciones Recibidas', subtitle: 'CRM de prospectos generados por el cotizador del sitio' },
  clientes: { title: 'Clientes', subtitle: 'Afiliados con cierre efectivo — plan, contrato y acceso al portal' },
  doctors: { title: 'Directorio Médico', subtitle: 'Especialistas y clínicas habilitadas en la red Colmedikal' },
  admins: { title: 'Gestionar Accesos', subtitle: 'Credenciales administrativas del equipo Colmedikal' },
  sitio: { title: 'Sitio', subtitle: 'Configuración y modo mantenimiento del sitio público' },
};

function AuthenticatedAdminShell({ data }: { data: AdminSharedProps }) {
  const { theme } = useAdminTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    activeTab, setActiveTab, canSeeTab, canManageAdmins,
    pendingRefunds, activeAppointmentsCount, pendingAuthsCount, totalLeadsUncontacted,
    leads, doctors, admins,
  } = data;

  const meta = TAB_META[activeTab];

  return (
    <div className={theme === 'dark' ? 'dark' : ''} id="colmedikal-admin-portal">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:flex">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          canSeeTab={canSeeTab}
          canManageAdmins={canManageAdmins}
          pendingRefundsCount={pendingRefunds.length}
          activeAppointmentsCount={activeAppointmentsCount}
          pendingAuthsCount={pendingAuthsCount}
          totalLeadsUncontacted={totalLeadsUncontacted}
          clientesCount={leads.filter(l => l.status === 'Cierre Efectivo').length}
          doctorsCount={doctors.length}
          adminsCount={admins ? admins.length : 0}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className="flex-1 min-w-0">
          <AdminHeader
            title={meta.title}
            subtitle={meta.subtitle}
            onOpenMobileSidebar={() => setMobileOpen(true)}
            onBackToPortal={() => data.setCurrentPage('home')}
            onLogout={data.handleLogout}
          />

          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {activeTab === 'kpis' && <KpisSection {...data} />}
            {activeTab === 'refunds' && <RefundsSection {...data} />}
            {activeTab === 'appointments' && <AppointmentsSection {...data} />}
            {activeTab === 'auths' && <AuthsSection {...data} />}
            {activeTab === 'leads' && <LeadsSection {...data} />}
            {activeTab === 'clientes' && <ClientesSection {...data} />}
            {activeTab === 'doctors' && <DoctorsSection {...data} />}
            {activeTab === 'admins' && <AdminsSection {...data} />}
            {activeTab === 'sitio' && <SitioSection {...data} />}
          </main>
        </div>
      </div>
    </div>
  );
}
