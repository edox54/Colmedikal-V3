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
    updateAdminRole
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

  const [activeTab, setActiveTab] = useState<'kpis' | 'refunds' | 'appointments' | 'auths' | 'leads' | 'clientes' | 'doctors' | 'admins'>('kpis');

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

  return (
    <>
      {!isAuthenticated ? (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-all duration-300" id="admin-login-screen">
          <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
            <div className="flex justify-center">
              <span className="p-4 bg-amber-500/10 text-amber-500 rounded-3xl border border-amber-500/20 shadow-inner">
                <Building2 className="w-10 h-10" />
              </span>
            </div>
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display text-center">
                Consola Corporativa Colmedikal
              </h2>
              <p className="text-xs text-slate-400 font-medium text-center">
                Acceso restringido para auditores médicos y directivos de Medicina Prepagada
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-slate-900 py-8 px-6 shadow-xl rounded-3xl border border-slate-800 space-y-6 mx-4 sm:mx-0">
              <form className="space-y-5" onSubmit={handleLogin} id="form-admin-login">
                {loginError && (
                  <div className="p-3 bg-red-950/60 border border-red-800/40 text-red-200 text-xs font-semibold rounded-xl flex items-start gap-2.5">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Usuario Administrativo:
                  </span>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <UserCheck className="w-4 h-4" />
                    </span>
                    <input
                      id="admin-user"
                      type="text"
                      required
                      placeholder="Ej. auditor_principal"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-105 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Contraseña de Verificación:
                  </span>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <input
                      id="admin-pass"
                      type="password"
                      required
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-105 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-indigo-500/10 cursor-pointer transition text-center uppercase tracking-widest"
                >
                  {isLoggingIn ? 'Verificando Hash...' : 'Ingresar al Panel Seguro ✓'}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-800/60 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage('home')}
                  className="text-center text-[11px] text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  ← Regresar al Portal de Clientes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedikal-admin-portal">
      
      {/* 1. TOP HEADER & SWITCHING BACK TO USER SITE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-teal-400 border border-slate-750">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-display font-black text-slate-950 uppercase tracking-tight">Colmedikal Corporativo</span>
              <span className="bg-indigo-100 text-indigo-805 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">MODO EMPRESA</span>
            </div>
            <p className="text-xs text-slate-500">Módulo Administrativo Interno de Auditoría Médica y Gestión de Planes</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-755 text-xs font-bold rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer font-sans"
          >
            <span>Volver al Portal de Clientes</span>
            <ArrowRight className="w-4 h-4 text-slate-450" />
          </button>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-705 text-xs font-bold rounded-xl border border-rose-200 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer font-sans"
            id="admin-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* 2. INNER NAVIGATION ACCORD */}
      <div className="flex flex-wrap gap-2.5 bg-slate-100 p-2.5 rounded-2xl border border-slate-200">
        {canSeeTab('kpis') && (
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'kpis' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200'
            }`}
            id="admin-tab-kpis"
          >
            Consola General (KPIs)
          </button>
        )}

        {canSeeTab('refunds') && (
          <button
            onClick={() => setActiveTab('refunds')}
            className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'refunds' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-655 hover:bg-slate-200'
            }`}
            id="admin-tab-refunds"
          >
            <span>Auditar Reembolsos</span>
            {pendingRefunds.length > 0 && (
              <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">{pendingRefunds.length}</span>
            )}
          </button>
        )}

        {canSeeTab('appointments') && (
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'appointments' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-655 hover:bg-slate-200'
            }`}
            id="admin-tab-appointments"
          >
            <span>Citas Médicas</span>
            {activeAppointmentsCount > 0 && (
              <span className="bg-teal-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded-full font-mono">{activeAppointmentsCount}</span>
            )}
          </button>
        )}

        {canSeeTab('auths') && (
          <button
            onClick={() => setActiveTab('auths')}
            className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'auths' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-655 hover:bg-slate-200'
            }`}
            id="admin-tab-auths"
          >
            <span>Autorizaciones</span>
            {pendingAuthsCount > 0 && (
              <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">{pendingAuthsCount}</span>
            )}
          </button>
        )}

        {canSeeTab('leads') && (
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leads' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-655 hover:bg-slate-200'
            }`}
            id="admin-tab-leads"
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span>Cotizaciones Recibidas</span>
            {totalLeadsUncontacted > 0 && (
              <span className="bg-emerald-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded-full font-mono">{totalLeadsUncontacted}</span>
            )}
          </button>
        )}

        {canSeeTab('clientes') && (
          <button
            onClick={() => setActiveTab('clientes')}
            className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'clientes' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-655 hover:bg-slate-200'
            }`}
            id="admin-tab-clientes"
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Clientes</span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">
              ({leads.filter(l => l.status === 'Cierre Efectivo').length})
            </span>
          </button>
        )}

        {canSeeTab('doctors') && (
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'doctors' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-655 hover:bg-slate-200'
            }`}
            id="admin-tab-doctors"
          >
            <span>Directorio Médico</span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">({doctors.length})</span>
          </button>
        )}

        {canSeeTab('admins') && (
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admins' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-655 hover:bg-slate-200'
            }`}
            id="admin-tab-admins"
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Gestionar Accesos</span>
            <span className="text-[10px] text-slate-450 font-mono font-normal">({admins ? admins.length : 0})</span>
          </button>
        )}

        {canSeeTab('seo') && (
          <a
            href="/seo-panel"
            className="px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
          >
            🔍 <span>Panel SEO</span>
          </a>
        )}
      </div>

      {/* 3. CONDITIONAL RENDER AREA */}

      {/* 3.1 GENERAL KPI DASHBOARD CONSOLE */}
      {activeTab === 'kpis' && (
        <div className="space-y-8 animate-in fade-in duration-200" id="admin-kpi-panel">
          
          {/* Bento Statistcs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* KPI 1: REEMBOLSOS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reembolsos a Liquidar</span>
                <span className="text-2xl font-black text-slate-900 font-mono">${totalRefundAmountPending.toFixed(2)}</span>
                <span className="text-[10px] text-rose-650 font-bold block">{pendingRefunds.length} Solicitudes entrantes hoy</span>
              </div>
            </div>

            {/* KPI 2: PROSPECTOS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cotizaciones Recibidas Activas</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{leads.length} Unidades</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">{totalLeadsUncontacted} pendientes de revisión</span>
              </div>
            </div>

            {/* KPI 3: AUTORIZACIONES */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auditorías Complejas</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{pendingAuthsCount} Quirúrgicos</span>
                <span className="text-[10px] text-indigo-650 font-semibold block">Pendiente de dictamen clínico</span>
              </div>
            </div>

            {/* KPI 4: DOCTORS Listings */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Especialistas Asegurados</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{doctors.length} Médicos</span>
                <span className="text-[10px] text-teal-650 font-semibold block">Habilitados en Quito, Gye y Cuenca</span>
              </div>
            </div>

          </div>

          {/* Embudo de Conversión */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-500" />
              Embudo de Conversión de Prospectos
            </h4>
            {[
              { label: 'Nuevo Plan', count: leads.filter(l => l.status === 'Nuevo Plan').length, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
              { label: 'Contactado', count: leads.filter(l => l.status === 'Contactado').length, color: 'bg-amber-500', textColor: 'text-amber-700' },
              { label: 'Cierre Efectivo', count: leads.filter(l => l.status === 'Cierre Efectivo').length, color: 'bg-indigo-600', textColor: 'text-indigo-700' },
            ].map((stage, i, arr) => {
              const maxCount = Math.max(...arr.map(s => s.count), 1);
              const pct = Math.round((stage.count / maxCount) * 100);
              const convRate = i > 0 && arr[i - 1].count > 0
                ? Math.round((stage.count / arr[i - 1].count) * 100)
                : null;
              return (
                <div key={stage.label} className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${stage.textColor} w-28 shrink-0 text-right`}>{stage.label}</span>
                  <div className="flex-1 relative">
                    <div
                      className={`${stage.color} h-8 rounded-lg flex items-center justify-center transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      <span className="text-white text-xs font-black drop-shadow">{stage.count}</span>
                    </div>
                  </div>
                  {convRate !== null && (
                    <span className="text-[10px] text-slate-500 font-semibold shrink-0 flex items-center gap-0.5">
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      {convRate}%
                    </span>
                  )}
                  {convRate === null && <span className="w-10 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Connected state simulator guide banner */}
          <section className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1 md:max-w-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
                <span>¿Cómo funciona el Control Conectado de Colmedikal?</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Este panel manipula de forma exclusiva los datos del servidor central virtual (simulado en <code>localStorage</code>). Al autorizar un reembolso o agregar un doctor, los cambios se propagan de inmediato al Portal de Clientes y al cotizador web, simulando un entrono real de producción.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('refunds')} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 text-[11px] font-bold rounded-lg cursor-pointer">
                Auditar Facturas
              </button>
              <button onClick={() => setActiveTab('leads')} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-teal-400 text-[11px] font-semibold rounded-lg border border-slate-700 cursor-pointer">
                Analizar Cotizaciones
              </button>
            </div>
          </section>

          {/* Quick logs representation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick prospects leads tracker list */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Últimas Cotizaciones del Portal</span>
                </h4>
                <button onClick={() => setActiveTab('leads')} className="text-[10px] font-bold text-teal-650 hover:underline cursor-pointer">
                  Ver todo
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {leads.slice(0, 3).map((ld) => (
                  <div key={ld.id} className="py-3 flex justify-between items-start text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900">{ld.quoteData?.fullName || '—'}</h5>
                      <p className="text-[10px] text-slate-500 font-mono">{ld.quoteData?.leadCode || ld.id.slice(0, 12).toUpperCase()} • {ld.quoteData?.phone || '—'}</p>
                      <p className="text-[9px] text-slate-400">{new Date(ld.timestamp).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-bold text-slate-900 font-mono">${Number(ld.estimatedPrice || 0).toFixed(2)}/mes</span>
                      <span className="block text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded uppercase text-center w-full">
                        {ld.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick upcoming consultation medical logs */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Últimas Citas Agendadas por Pacientes</span>
                </h4>
                <button onClick={() => setActiveTab('appointments')} className="text-[10px] font-bold text-teal-650 hover:underline cursor-pointer">
                  Ver todas
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {appointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="py-3 flex justify-between items-start text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900">{apt.patientName}</h5>
                      <p className="text-[10px] text-slate-500">Médico: {apt.doctorName} ({apt.specialty})</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-bold text-slate-900 font-mono">{apt.aptDate} @ {apt.aptTime}</span>
                      <span className={`block text-[9px] font-bold px-1.5 py-0.2 rounded uppercase text-center ${
                        apt.status === 'Confirmada' ? 'text-teal-700 bg-teal-50' : 'text-amber-700 bg-amber-50'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3.2 REFUNDS AUDITING MODULE */}
      {activeTab === 'refunds' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-refunds-panel">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-950">Consola de Auditoría y Liquidación de Reembolsos</h3>
            <p className="text-xs text-slate-500 mt-1">
              Verifica los importes presentados por afiliados, analiza la validez y aprueba al 90% o rechaza las facturas comerciales. Los pacientes obtienen respuesta de forma instantánea.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Refunds list list */}
            <div className="lg:col-span-12 space-y-4">
              {refunds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {refunds.map((ref) => {
                    const isPending = ref.status === 'Procesando';
                    const isSelected = selectedRefundId === ref.id;

                    return (
                      <div 
                        key={ref.id}
                        className={`bg-white p-5 rounded-3xl border transition-all ${
                          isSelected ? 'border-indigo-600 ring-2 ring-indigo-600/10' : 'border-slate-200 shadow-sm'
                        }`}
                        id={`admin-refund-card-${ref.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-slate-100 text-slate-805 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                                {ref.id}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans border ${
                                ref.status === 'Reembolsado' || ref.status === 'Aprobado'
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
                                  : ref.status === 'Rechazado'
                                  ? 'text-red-700 bg-red-50 border-red-100'
                                  : 'text-amber-700 bg-amber-50 border-amber-100 animate-pulse'
                              }`}>
                                {ref.status}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 pt-1.5">{ref.familyMember}</h4>
                            <p className="text-xs text-slate-500">{ref.specialty} — Factura N° {ref.invoiceNumber}</p>
                          </div>

                          <div className="text-right space-y-1">
                            <span className="text-[10px] text-slate-400 font-medium">Monto Declarado:</span>
                            <p className="text-lg font-black font-mono text-slate-950">${Number(ref.amount || 0).toFixed(2)}</p>
                            <p className="text-[10px] text-emerald-600 font-semibold font-mono">Retorno Est. 90%: ${(Number(ref.amount || 0) * 0.9).toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Live document button */}
                        <div className="mt-3 pb-3 border-b border-dashed border-slate-150">
                          <button
                            type="button"
                            onClick={() => setSelectedDocument({
                              id: ref.id,
                              type: 'refund',
                              fullName: ref.familyMember,
                              fileName: ref.fileName || 'factura_original_sri.pdf',
                              date: ref.refundDate || new Date().toLocaleDateString(),
                              amount: ref.amount,
                              invoiceNumber: ref.invoiceNumber,
                              phone: ref.userPhone || '+593 98 440 3311',
                              email: ref.userEmail || `${ref.familyMember.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
                              fileData: ref.fileData
                            })}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-[#e2f0fb] border border-slate-200 text-[#0C4169] text-[11px] font-bold rounded-xl transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-[#4597CA]" />
                            <span>Ver Comprobante Digital Recibido (En Vivo)</span>
                          </button>
                        </div>

                        {ref.adminComment && (
                          <div className="mt-3.5 p-3 bg-slate-50 border border-slate-150 rounded-xl text-[11px] text-slate-650 leading-relaxed">
                            <strong>Dictamen Interno:</strong> {ref.adminComment}
                          </div>
                        )}

                        {isPending ? (
                          <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                            <div className="space-y-1.5">
                              <label className="block text-[11px] font-bold text-slate-750">Nota de Auditoría Clínica:</label>
                              <input 
                                type="text"
                                placeholder="Escribe el comentario (ej: Factura SRI aprobada, reembolso asignado)"
                                value={isSelected ? adminComment : ''}
                                onChange={(e) => {
                                  setSelectedRefundId(ref.id);
                                  setAdminComment(e.target.value);
                                }}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                                id={`input-comment-${ref.id}`}
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const comment = isSelected ? adminComment : 'Reembolso auditado y verificado';
                                  updateRefundStatus(ref.id, 'Reembolsado', comment);
                                  setSelectedRefundId(null);
                                  setAdminComment('');
                                }}
                                className="flex-1 py-2 text-center bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Aprobar y Transferir</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const comment = isSelected ? adminComment : 'Reclamo rechazado por duplicidad o preexistencia no declarada';
                                  updateRefundStatus(ref.id, 'Rechazado', comment);
                                  setSelectedRefundId(null);
                                  setAdminComment('');
                                }}
                                className="flex-1 py-2 text-center bg-slate-100 hover:bg-red-50 hover:text-red-655 hover:border-red-200 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Rechazar Solicitud</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3.5 text-right">
                            <span className="text-[10px] text-slate-400 font-mono">Procesado el: {ref.refundDate}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border p-6">
                  <DollarSign className="w-12 h-12 text-slate-350 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No hay reembolsos registrados.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 3.3 APPOINTMENTS CALENDAR MANAGE */}
      {activeTab === 'appointments' && (() => {
        const pendientes = appointments.filter(a => a.status === 'Pendiente');
        const confirmadas = appointments.filter(a => a.status === 'Confirmada');
        const completadas = appointments.filter(a => a.status === 'Completada');
        const canceladas = appointments.filter(a => a.status === 'Cancelada');
        const today = new Date().toISOString().split('T')[0];
        const citasHoy = appointments.filter(a => a.aptDate === today);

        const handleAptStatus = (id: string, status: AppointmentItem['status']) => {
          updateAppointmentStatus(id, status);
        };

        return (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-appointments-panel">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-950">Citas Medicas Agendadas</h3>
              <p className="text-xs text-slate-500 mt-1">Gestiona las citas de los asegurados. Los cambios se sincronizan con la base de datos.</p>
            </div>
            <button onClick={() => refreshData()} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-xl transition cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /><span>Actualizar</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-lg font-black text-slate-900 font-mono">{appointments.length}</span>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Total</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
              <span className="text-lg font-black text-amber-700 font-mono">{pendientes.length}</span>
              <span className="block text-[9px] text-amber-600 font-bold uppercase">Pendientes</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-lg font-black text-emerald-700 font-mono">{confirmadas.length}</span>
              <span className="block text-[9px] text-emerald-600 font-bold uppercase">Confirmadas</span>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-center">
              <span className="text-lg font-black text-indigo-700 font-mono">{completadas.length}</span>
              <span className="block text-[9px] text-indigo-600 font-bold uppercase">Completadas</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl text-center">
              <span className="text-lg font-black text-teal-400 font-mono">{citasHoy.length}</span>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Hoy</span>
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <div key={apt.id} className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
                  apt.status === 'Cancelada' ? 'border-red-100 opacity-60' : apt.status === 'Completada' ? 'border-emerald-100' : 'border-slate-200'
                }`}>
                  <div className="space-y-3">
                    {/* Patient header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{apt.patientName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: {apt.patientId} • <a href={`tel:${apt.patientPhone}`} className="text-indigo-600 hover:underline">{apt.patientPhone}</a>
                        </p>
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        apt.status === 'Confirmada' ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : apt.status === 'Completada' ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                        : apt.status === 'Cancelada' ? 'text-red-700 bg-red-50 border-red-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}>{apt.status}</span>
                    </div>

                    {/* Doctor + Specialty */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{apt.doctorName}</span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase">{apt.specialty}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{apt.clinic} ({apt.city})</span>
                        <span className={`font-bold uppercase ${apt.modality === 'telemedicina' ? 'text-indigo-600' : 'text-rose-600'}`}>
                          {apt.modality === 'telemedicina' ? 'Virtual' : 'Presencial'}
                        </span>
                      </div>
                    </div>

                    {/* Date/Time */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        <span className="font-mono font-bold">{apt.aptDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.aptTime}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {apt.notes && apt.notes !== 'Sin comentarios adicionales' && (
                      <p className="text-[10px] text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg italic">
                        {apt.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
                    {apt.status === 'Pendiente' && (
                      <button onClick={() => handleAptStatus(apt.id, 'Confirmada')} className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg cursor-pointer">
                        Confirmar
                      </button>
                    )}
                    {apt.status === 'Confirmada' && (
                      <button onClick={() => handleAptStatus(apt.id, 'Completada')} className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer">
                        Completada
                      </button>
                    )}
                    {apt.status !== 'Cancelada' && apt.status !== 'Completada' && (
                      <button onClick={() => handleAptStatus(apt.id, 'Cancelada')} className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] rounded-lg border border-red-200 cursor-pointer">
                        Cancelar
                      </button>
                    )}
                    {/* Revert buttons */}
                    {apt.status === 'Confirmada' && (
                      <button onClick={() => handleAptStatus(apt.id, 'Pendiente')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded-lg cursor-pointer">
                        ← Pendiente
                      </button>
                    )}
                    {apt.status === 'Completada' && (
                      <button onClick={() => handleAptStatus(apt.id, 'Confirmada')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded-lg cursor-pointer">
                        ← Confirmada
                      </button>
                    )}
                    {apt.status === 'Cancelada' && (
                      <button onClick={() => handleAptStatus(apt.id, 'Pendiente')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded-lg cursor-pointer">
                        ← Reactivar
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">No hay citas agendadas.</p>
                <p className="text-xs text-slate-400 mt-1">Las citas aparecen cuando los pacientes las solicitan desde /agendamiento.</p>
              </div>
            )}
          </div>
        </div>
        );
      })()}

      {/* 3.4 AUTHORIZATIONS COMPLEX LISTINGS */}
      {activeTab === 'auths' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-auths-panel">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-950">Auditoría Quirúrgica y Autorizaciones Especiales</h3>
            <p className="text-xs text-slate-500 mt-1">
              Revisa, aprueba o pon en auditoría técnica las órdenes médicas que requieran cirugías programadas, resonancias o fármacos de alto coste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorizations.map((auth) => {
              const isPending = auth.status === 'Pendiente' || auth.status === 'Auditoría';
              return (
                <div key={auth.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between" id={`admin-auth-card-${auth.id}`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                      <span className="font-mono text-[10px] font-bold text-slate-800">{auth.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        auth.status === 'Aprobado'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          : 'bg-amber-50 text-amber-800 border border-amber-100'
                      }`}>
                        {auth.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Asegurado Solicitante:</span>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{auth.patient}</h4>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Procedimiento Programado:</span>
                      <p className="font-semibold text-slate-800 leading-snug">{auth.procedure}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Lugar: {auth.facility}</p>
                    </div>

                    {/* Live document button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDocument({
                          id: auth.id,
                          type: 'auth',
                          fullName: auth.patient,
                          fileName: auth.fileName || 'receta_orden_clinica.pdf',
                          date: auth.requestDate || new Date().toLocaleDateString(),
                          procedure: auth.procedure,
                          facility: auth.facility,
                          phone: auth.userPhone || '+593 99 521 1147',
                          email: auth.userEmail || `${auth.patient.toLowerCase().replace(/\s+/g, '')}@outlook.com`,
                          fileData: auth.fileData
                        })}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-[#e2f0fb] border border-slate-200 text-[#0C4169] text-[10px] font-bold rounded-xl transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#4597CA]" />
                        <span>Ver Órden Médica Recibida</span>
                      </button>
                    </div>

                    {auth.adminComment && (
                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-[10px] text-slate-600 font-medium">
                        🔍 <strong>Dictamen Auditor:</strong> {auth.adminComment}
                      </div>
                    )}
                  </div>

                  {isPending ? (
                    <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => updateAuthorizationStatus(auth.id, 'Aprobado', 'Procedimiento autorizado vía IA de auditoría inmediata. Ración médica asegurada.')}
                        className="py-2.5 text-center bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                      >
                        Autorizar SRI
                      </button>
                      <button
                        onClick={() => updateAuthorizationStatus(auth.id, 'Rechazado', 'Rechazado por ser cirugía estética u odontología estética fuera de póliza.')}
                        className="py-2.5 text-center bg-slate-100 hover:bg-red-50 hover:text-red-750 font-semibold text-xs border border-slate-205 rounded-xl text-slate-705 cursor-pointer"
                      >
                        Rechazar Código
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 text-right text-[10px] text-slate-400 font-mono">
                      Solicitado el: {auth.requestDate}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3.5 LEADS FROM PLAN QUOTER (CRM MODULE) */}
      {activeTab === 'leads' && (() => {
        const today = new Date().toISOString().split('T')[0];
        const nuevos = leads.filter(l => l.status === 'Nuevo Plan');
        const contactados = leads.filter(l => l.status === 'Contactado');
        const cerrados = leads.filter(l => l.status === 'Cierre Efectivo');
        const perdidos = leads.filter(l => l.status === 'Perdido');
        const overdueFollowUps = leads.filter(l => l.followUpDate && l.followUpDate < today && l.status !== 'Cierre Efectivo' && l.status !== 'Perdido');
        const leadsHoy = leads.filter(l => l.timestamp?.startsWith(today));
        const pipelineTotal = leads.reduce((s, l) => s + Number(l.estimatedPrice || 0), 0);
        const pipelineNuevos = nuevos.reduce((s, l) => s + Number(l.estimatedPrice || 0), 0);
        const pipelineContactados = contactados.reduce((s, l) => s + Number(l.estimatedPrice || 0), 0);

        // Group duplicates by email/phone into clusters
        const clusterMap = new Map<string, typeof leads>();
        const assigned = new Set<string>();
        leads.forEach(ld => {
          if (assigned.has(ld.id)) return;
          const key = (ld.quoteData?.email?.toLowerCase().trim()) || ld.id;
          const phone = ld.quoteData?.phone?.replace(/\s/g, '') || '';
          const cluster = leads.filter(other => {
            if (assigned.has(other.id)) return false;
            const oEmail = other.quoteData?.email?.toLowerCase().trim() || '';
            const oPhone = other.quoteData?.phone?.replace(/\s/g, '') || '';
            return other.id === ld.id || (key && oEmail === key) || (phone && oPhone === phone);
          });
          cluster.forEach(c => assigned.add(c.id));
          clusterMap.set(ld.id, cluster);
        });

        // Apply filters
        let filteredClusters = Array.from(clusterMap.entries());
        if (leadDateFilter) {
          filteredClusters = filteredClusters.filter(([, cluster]) =>
            cluster.some(l => l.timestamp?.startsWith(leadDateFilter))
          );
        }
        if (leadStatusFilter !== 'all') {
          filteredClusters = filteredClusters.filter(([, cluster]) =>
            cluster.some(l => l.status === leadStatusFilter)
          );
        }
        if (leadSourceFilter !== 'all') {
          filteredClusters = filteredClusters.filter(([, cluster]) =>
            cluster.some(l => (l.quoteData?.source?.channel || 'Directo') === leadSourceFilter)
          );
        }
        if (leadSearchFilter) {
          const q = leadSearchFilter.toLowerCase();
          filteredClusters = filteredClusters.filter(([, cluster]) =>
            cluster.some(l =>
              l.quoteData?.fullName?.toLowerCase().includes(q) ||
              l.quoteData?.email?.toLowerCase().includes(q) ||
              l.quoteData?.phone?.includes(q) ||
              l.quoteData?.docNumber?.includes(q)
            )
          );
        }

        return (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-leads-panel">
          {/* Header */}
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-950">Cotizaciones Emitidas desde el Portal</h3>
              <p className="text-xs text-slate-500 mt-1">CRM de prospectos con deduplicación automática.</p>
            </div>
            <button onClick={() => refreshData()} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-xl transition cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /><span>Actualizar</span>
            </button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-lg font-black text-slate-900 font-mono">{leads.length}</span>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Total Leads</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-lg font-black text-emerald-600 font-mono">{leadsHoy.length}</span>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Hoy</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-lg font-black text-emerald-700 font-mono">{nuevos.length}</span>
              <span className="block text-[9px] text-emerald-600 font-bold uppercase">Nuevos</span>
              <span className="text-[9px] text-emerald-500 font-mono">${pipelineNuevos.toFixed(0)}/mes</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
              <span className="text-lg font-black text-amber-700 font-mono">{contactados.length}</span>
              <span className="block text-[9px] text-amber-600 font-bold uppercase">Contactados</span>
              <span className="text-[9px] text-amber-500 font-mono">${pipelineContactados.toFixed(0)}/mes</span>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-center">
              <span className="text-lg font-black text-indigo-700 font-mono">{cerrados.length}</span>
              <span className="block text-[9px] text-indigo-600 font-bold uppercase">Cerrados</span>
            </div>
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
              <span className="text-lg font-black text-rose-600 font-mono">{perdidos.length}</span>
              <span className="block text-[9px] text-rose-500 font-bold uppercase">Perdidos</span>
            </div>
            {overdueFollowUps.length > 0 && (
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-300 text-center col-span-2 sm:col-span-1">
                <span className="text-lg font-black text-orange-600 font-mono">{overdueFollowUps.length}</span>
                <span className="block text-[9px] text-orange-600 font-bold uppercase">Seguim. Vencidos</span>
              </div>
            )}
            <div className="bg-slate-900 p-3 rounded-xl text-center">
              <span className="text-lg font-black text-teal-400 font-mono">${pipelineTotal.toFixed(0)}</span>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Pipeline/mes</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="date"
              value={leadDateFilter}
              onChange={e => setLeadDateFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500"
            />
            <select
              value={leadStatusFilter}
              onChange={e => setLeadStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500"
            >
              <option value="all">Todos los estados</option>
              <option value="Nuevo Plan">Nuevo Plan</option>
              <option value="Contactado">Contactado</option>
              <option value="Cierre Efectivo">Cierre Efectivo</option>
              <option value="Perdido">Perdido</option>
            </select>
            <select
              value={leadSourceFilter}
              onChange={e => setLeadSourceFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500"
            >
              <option value="all">Todos los orígenes</option>
              <option value="Directo">Directo</option>
              <option value="Orgánico">Orgánico</option>
              <option value="Redes sociales">Redes sociales</option>
              <option value="Pago">Pago</option>
              <option value="Referido">Referido</option>
              <option value="Campaña">Campaña</option>
              <option value="Otro sitio">Otro sitio</option>
            </select>
            <input
              type="text"
              value={leadSearchFilter}
              onChange={e => setLeadSearchFilter(e.target.value)}
              placeholder="Buscar nombre, email, cedula..."
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 flex-1 min-w-[180px]"
            />
            {(leadDateFilter || leadStatusFilter !== 'all' || leadSourceFilter !== 'all' || leadSearchFilter) && (
              <button onClick={() => { setLeadDateFilter(''); setLeadStatusFilter('all'); setLeadSourceFilter('all'); setLeadSearchFilter(''); }} className="text-[10px] text-teal-600 font-bold hover:underline cursor-pointer">
                Limpiar filtros
              </button>
            )}
            <span className="text-[10px] text-slate-400">{filteredClusters.length} grupo(s)</span>
            <button
              onClick={() => exportLeadsCSV(filteredClusters)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition"
              title="Descargar Excel (CSV) con los leads filtrados"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
              Exportar CSV
            </button>
          </div>

          {/* Lead list — grouped by duplicate cluster. Compact rows (not tall
              cards) so more leads fit on screen without scrolling; secondary
              info (duplicates/asignación/notas) is tucked behind "Más detalles". */}
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {filteredClusters.length > 0 ? (
              filteredClusters.map(([clusterId, cluster]) => {
                const primary = cluster[0];
                const hasDupes = cluster.length > 1;
                const planName = resolvePlanName(primary);
                return (
                <div key={clusterId} className={`p-3.5 ${hasDupes ? 'bg-amber-50/40' : ''}`}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {/* Identity */}
                    <div className="min-w-[160px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest font-mono">
                          {primary.quoteData?.leadCode || primary.id.slice(0, 12).toUpperCase()}
                        </span>
                        {hasDupes && (
                          <span className="text-[8px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                            {cluster.length} registros
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{primary.quoteData?.fullName || '—'}</h4>
                      {planName
                        ? <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold uppercase inline-block">{planName}</span>
                        : <span className="text-[9px] bg-slate-100 text-slate-400 border border-slate-200 px-2 py-0.5 rounded font-medium italic inline-block">Sin plan seleccionado</span>}
                      <select
                        defaultValue=""
                        onChange={(e) => { handlePlanChange(primary.id, e.target.value); e.target.value = ''; }}
                        className="mt-1 block text-[9px] px-1.5 py-0.5 border border-slate-200 rounded-lg bg-white text-slate-500 outline-none cursor-pointer"
                        title="Cambiar el plan del cliente"
                      >
                        <option value="" disabled>Cambiar plan…</option>
                        {Object.entries(PLAN_CATALOG).map(([id, p]) => (
                          <option key={id} value={id}>{p.name} — ${p.basePrice}/mes</option>
                        ))}
                      </select>
                    </div>

                    {/* Contact */}
                    <div className="min-w-[140px] text-xs">
                      <a href={`tel:${primary.quoteData?.phone}`} className="font-bold text-indigo-650 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" /><span>{primary.quoteData?.phone || '—'}</span>
                      </a>
                      <span className="text-[10px] text-slate-500 truncate block max-w-[160px]">{primary.quoteData?.email || '—'}</span>
                    </div>

                    {/* Doc */}
                    <div className="min-w-[120px] text-xs">
                      <span className="font-semibold text-slate-800 font-mono text-[11px] block">{primary.quoteData?.docNumber || '—'}</span>
                      <span className="block text-[9px] text-slate-400 capitalize">
                        {primary.quoteData?.docType === 'pasaporte' ? 'Pasaporte' : 'Cedula'} • {primary.quoteData?.type || '—'}
                        {(primary.quoteData?.childrenCount ?? 0) > 0 ? ` • ${primary.quoteData?.childrenCount} dep.` : ''}
                      </span>
                      {primary.quoteData?.birthDate && (
                        <span className="block text-[9px] text-slate-400">Nac.: {primary.quoteData.birthDate}</span>
                      )}
                    </div>

                    {/* Origin */}
                    <div className="min-w-[110px]">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase inline-block ${SOURCE_BADGE[primary.quoteData?.source?.channel || 'Directo']}`}>
                        {primary.quoteData?.source?.channel || 'Directo'}
                      </span>
                      {primary.quoteData?.source?.detail && (
                        <span className="block text-[9px] text-slate-400 mt-0.5 truncate max-w-[110px]" title={primary.quoteData.source.detail}>
                          {primary.quoteData.source.detail}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {/* Without a chosen plan, this is a rough ballpark, not a quote for
                          a specific plan — labeled distinctly so it can't be misread as
                          "the customer picked the $X/mes plan" when none was picked. */}
                      <span className="text-[9px] text-slate-400 font-mono block">{planName ? 'Est.:' : 'Est. Preliminar:'}</span>
                      <span className={`text-sm font-black font-mono ${planName ? 'text-indigo-750' : 'text-slate-400'}`}>${Number(primary.estimatedPrice || 0).toFixed(2)}/m</span>
                    </div>

                    {/* Status */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(primary.timestamp).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase mt-0.5 inline-block ${
                        primary.status === 'Cierre Efectivo' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        : primary.status === 'Contactado' ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : primary.status === 'Perdido' ? 'bg-rose-50 text-rose-700 border border-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>{primary.status}</span>
                      {primary.lostReason && (
                        <span className="block text-[9px] text-rose-400 mt-0.5">{primary.lostReason}</span>
                      )}
                      {primary.followUpDate && primary.status !== 'Cierre Efectivo' && primary.status !== 'Perdido' && (
                        <span className={`block text-[9px] mt-0.5 font-mono ${primary.followUpDate < today ? 'text-orange-600 font-bold' : 'text-slate-400'}`}>
                          {primary.followUpDate < today ? '⚠ Vencido: ' : '📅 Seguim.: '}{primary.followUpDate}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 items-center flex-wrap ml-auto">
                      {/* WhatsApp quick contact */}
                      {primary.quoteData?.phone && (
                        <a
                          href={`https://wa.me/${primary.quoteData.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${primary.quoteData?.fullName?.split(' ')[0] || ''}, te contactamos de Colmedikal. Vimos tu cotización del ${resolvePlanName(primary) || 'plan médico'} por $${Number(primary.estimatedPrice||0).toFixed(2)}/mes. ¿Tienes un momento para conversar sobre tu cobertura?`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition cursor-pointer"
                          title="Contactar por WhatsApp"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </a>
                      )}
                      {/* Follow-up date picker */}
                      {primary.status !== 'Cierre Efectivo' && primary.status !== 'Perdido' && (
                        <input
                          type="date"
                          value={primary.followUpDate || ''}
                          onChange={e => setLeadFollowUp(primary.id, e.target.value)}
                          className={`px-1.5 py-1 text-[10px] border rounded-lg focus:outline-none focus:border-teal-400 cursor-pointer font-mono ${primary.followUpDate && primary.followUpDate < today ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 bg-slate-50'}`}
                          title="Fecha de seguimiento"
                        />
                      )}
                      {/* Pipeline forward buttons */}
                      {primary.status === 'Nuevo Plan' && (
                        <button onClick={() => updateLeadStatus(primary.id, 'Contactado')} className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg cursor-pointer">
                          Contactado
                        </button>
                      )}
                      {primary.status === 'Contactado' && (
                        <button onClick={() => updateLeadStatus(primary.id, 'Cierre Efectivo')} className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer">
                          Cierre Efectivo
                        </button>
                      )}
                      {/* Revert buttons */}
                      {primary.status === 'Contactado' && (
                        <button onClick={() => updateLeadStatus(primary.id, 'Nuevo Plan')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded-lg cursor-pointer" title="Regresar a Nuevo Plan">
                          ← Nuevo
                        </button>
                      )}
                      {primary.status === 'Cierre Efectivo' && (
                        <button onClick={() => updateLeadStatus(primary.id, 'Contactado')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded-lg cursor-pointer" title="Regresar a Contactado">
                          ← Contactado
                        </button>
                      )}
                      {/* Lost */}
                      {primary.status !== 'Cierre Efectivo' && primary.status !== 'Perdido' && (
                        <select
                          defaultValue=""
                          onChange={e => { if (e.target.value) setLeadLostReason(primary.id, e.target.value); e.target.value = ''; }}
                          className="px-1.5 py-1 text-[10px] border border-rose-200 bg-rose-50 text-rose-600 rounded-lg focus:outline-none cursor-pointer font-sans"
                          title="Marcar como perdido"
                        >
                          <option value="" disabled>✕ Perdido…</option>
                          <option value="Precio muy alto">Precio muy alto</option>
                          <option value="Eligió competencia">Eligió competencia</option>
                          <option value="No contestó">No contestó</option>
                          <option value="No está interesado">No está interesado</option>
                          <option value="Otro motivo">Otro motivo</option>
                        </select>
                      )}
                      {primary.status === 'Perdido' && (
                        <button onClick={() => updateLeadStatus(primary.id, 'Nuevo Plan')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded-lg cursor-pointer">
                          ↺ Reabrir
                        </button>
                      )}
                      {canDeleteLeads && (
                        <button
                          onClick={async () => {
                            const name = primary.quoteData?.fullName || primary.id;
                            const msg = cluster.length > 1
                              ? `¿Eliminar los ${cluster.length} registros de "${name}"?`
                              : `¿Eliminar la cotización de "${name}"?`;
                            if (!confirm(msg)) return;
                            await Promise.all(cluster.map(l => deleteLead(l.id)));
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar cotización"
                        ><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </div>

                  {/* Everything used less often lives behind this toggle — keeps
                      the default row short so more leads fit without scrolling. */}
                  <details className="mt-2 text-[10px] group">
                    <summary className="cursor-pointer text-slate-400 font-semibold hover:text-teal-600 list-none flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                      <span>Más detalles</span>
                      {(primary.notes || []).length > 0 && <span className="text-amber-500">({(primary.notes || []).length} nota{(primary.notes || []).length === 1 ? '' : 's'})</span>}
                    </summary>
                    <div className="mt-2 space-y-2.5 pl-4 border-l-2 border-slate-150">
                      {/* Duplicate history */}
                      {hasDupes && (
                        <div className="space-y-1.5">
                          <span className="block font-bold text-amber-600">{cluster.length - 1} cotizacion(es) anterior(es):</span>
                          {cluster.slice(1).map(dup => (
                            <div key={dup.id} className="text-slate-500 flex justify-between">
                              <span>{new Date(dup.timestamp).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })} — ${Number(dup.estimatedPrice || 0).toFixed(2)}/m</span>
                              <span className="text-slate-400">{dup.status}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Assign to */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 uppercase tracking-wider shrink-0">Asignado:</span>
                        <select
                          value={primary.assignedTo || ''}
                          onChange={e => assignLead(primary.id, e.target.value)}
                          className="flex-1 px-2 py-1 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-teal-400 font-sans max-w-[220px]"
                        >
                          <option value="">— Sin asignar —</option>
                          {admins.filter(a => a.active).map(a => (
                            <option key={a.email} value={a.email}>{a.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Notes list */}
                      {(primary.notes || []).length > 0 && (
                        <div className="space-y-1.5 max-h-24 overflow-y-auto">
                          {(primary.notes || []).map((n, i) => (
                            <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                              <span className="text-amber-800 font-medium leading-snug block">{n.text}</span>
                              <span className="text-amber-500 font-mono">{n.author} · {new Date(n.timestamp).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add note */}
                      {openNoteLeadId === primary.id ? (
                        <div className="flex gap-1.5">
                          <input
                            autoFocus
                            type="text"
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && noteText.trim()) {
                                const stored = sessionStorage.getItem('colmedikal_user');
                                const author = stored ? JSON.parse(stored)?.name || 'Admin' : 'Admin';
                                addLeadNote(primary.id, { text: noteText.trim(), author, timestamp: new Date().toISOString() });
                                setNoteText(''); setOpenNoteLeadId(null);
                              }
                              if (e.key === 'Escape') { setNoteText(''); setOpenNoteLeadId(null); }
                            }}
                            placeholder="Escribe una nota... (Enter para guardar)"
                            className="flex-1 px-2.5 py-1.5 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 bg-teal-50"
                          />
                          <button
                            onClick={() => {
                              if (noteText.trim()) {
                                const stored = sessionStorage.getItem('colmedikal_user');
                                const author = stored ? JSON.parse(stored)?.name || 'Admin' : 'Admin';
                                addLeadNote(primary.id, { text: noteText.trim(), author, timestamp: new Date().toISOString() });
                              }
                              setNoteText(''); setOpenNoteLeadId(null);
                            }}
                            className="px-2 py-1 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg cursor-pointer"
                          >✓</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setOpenNoteLeadId(primary.id); setNoteText(''); }}
                          className="text-slate-400 hover:text-teal-600 font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <span>+</span> Agregar nota
                        </button>
                      )}
                    </div>
                  </details>
                </div>
                );
              })
            ) : (
              <div className="text-center py-12 p-6">
                <Briefcase className="w-12 h-12 text-slate-350 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">{leads.length === 0 ? 'No hay cotizaciones registradas.' : 'No hay resultados con los filtros actuales.'}</p>
              </div>
            )}
          </div>
        </div>
        );
      })()}

      {/* 3.55 CLIENTES — leads that closed successfully (status 'Cierre Efectivo') */}
      {activeTab === 'clientes' && (() => {
        const clients = leads.filter(l => l.status === 'Cierre Efectivo');
        const q = clientSearchFilter.toLowerCase().trim();
        const filtered = q
          ? clients.filter(c =>
              c.quoteData?.fullName?.toLowerCase().includes(q) ||
              c.quoteData?.email?.toLowerCase().includes(q) ||
              c.quoteData?.phone?.includes(q) ||
              c.quoteData?.docNumber?.includes(q) ||
              c.quoteData?.leadCode?.toLowerCase().includes(q)
            )
          : clients;

        const pagados = clients.filter(c => (c.quoteData?.paymentStatus || 'Pendiente') === 'Pagado').length;
        const pendientes = clients.filter(c => (c.quoteData?.paymentStatus || 'Pendiente') === 'Pendiente').length;
        const atrasados = clients.filter(c => c.quoteData?.paymentStatus === 'Atrasado').length;
        const conPortal = clients.filter(c => !!c.quoteData?.portalPasswordHash).length;

        const modalClient = passwordModalLeadId ? clients.find(c => c.id === passwordModalLeadId) : null;

        const handleSavePassword = async () => {
          if (!modalClient) return;
          if (newPasswordInput.length < 6) {
            setPasswordSaveError('La contraseña debe tener al menos 6 caracteres.');
            return;
          }
          setPasswordSaveLoading(true);
          setPasswordSaveError('');
          try {
            await setClientPassword(modalClient.id, newPasswordInput);
            setPasswordSaveSuccess(modalClient.quoteData?.docNumber || '');
            setNewPasswordInput('');
            await refreshData();
          } catch (err) {
            setPasswordSaveError(err instanceof Error ? err.message : 'No se pudo guardar la contraseña.');
          } finally {
            setPasswordSaveLoading(false);
          }
        };

        return (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-clientes-panel">
          {/* Header */}
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-950">Clientes</h3>
              <p className="text-xs text-slate-500 mt-1">
                Afiliados que cerraron un plan exitosamente. Gestiona su estado de pago y su acceso al Portal de Afiliados.
              </p>
            </div>
            <button onClick={() => refreshData()} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-xl transition cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /><span>Actualizar</span>
            </button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-lg font-black text-slate-900 font-mono">{clients.length}</span>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Total Clientes</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-lg font-black text-emerald-700 font-mono">{pagados}</span>
              <span className="block text-[9px] text-emerald-600 font-bold uppercase">Pagados</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
              <span className="text-lg font-black text-amber-700 font-mono">{pendientes}</span>
              <span className="block text-[9px] text-amber-600 font-bold uppercase">Pendientes</span>
            </div>
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-center">
              <span className="text-lg font-black text-red-700 font-mono">{atrasados}</span>
              <span className="block text-[9px] text-red-600 font-bold uppercase">Atrasados</span>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-center">
              <span className="text-lg font-black text-indigo-700 font-mono">{conPortal}</span>
              <span className="block text-[9px] text-indigo-600 font-bold uppercase">Con Portal Activo</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono, cédula o código..."
              value={clientSearchFilter}
              onChange={(e) => setClientSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]"
            />
          </div>

          {/* Client list — compact rows instead of tall cards, so more
              clients fit on screen without scrolling. */}
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {filtered.length > 0 ? (
              filtered.map((c) => {
                const planName = resolvePlanName(c);
                const paymentStatus = c.quoteData?.paymentStatus || 'Pendiente';
                const hasPortalAccess = !!c.quoteData?.portalPasswordHash;
                return (
                  <div key={c.id} className="p-3.5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      {/* Identity */}
                      <div className="min-w-[160px]">
                        {contractEditId === c.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              autoFocus
                              type="text"
                              value={contractNumberInput}
                              onChange={(e) => setContractNumberInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && contractNumberInput.trim()) {
                                  setClientContractNumber(c.id, contractNumberInput.trim());
                                  setContractEditId(null);
                                }
                                if (e.key === 'Escape') setContractEditId(null);
                              }}
                              placeholder="N° de contrato"
                              className="text-[10px] font-bold font-mono px-1.5 py-0.5 border border-teal-300 rounded bg-teal-50 outline-none w-28"
                            />
                            <button
                              onClick={() => { if (contractNumberInput.trim()) setClientContractNumber(c.id, contractNumberInput.trim()); setContractEditId(null); }}
                              className="text-teal-600 hover:text-teal-800 cursor-pointer"
                              title="Guardar"
                            >✓</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setContractEditId(c.id); setContractNumberInput(c.quoteData?.contractNumber || ''); }}
                            className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest font-mono block hover:underline cursor-pointer"
                            title="Clic para editar el número de contrato"
                          >
                            {c.quoteData?.contractNumber || c.quoteData?.leadCode || c.id.slice(0, 12).toUpperCase()}
                          </button>
                        )}
                        <h4 className="text-sm font-black text-slate-900">{c.quoteData?.fullName || '—'}</h4>
                        {planName
                          ? <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold uppercase inline-block">{planName}</span>
                          : <span className="text-[9px] bg-slate-100 text-slate-400 border border-slate-200 px-2 py-0.5 rounded font-medium italic inline-block">Sin plan registrado</span>}
                        <select
                          defaultValue=""
                          onChange={(e) => { handlePlanChange(c.id, e.target.value); e.target.value = ''; }}
                          className="mt-1 block text-[9px] px-1.5 py-0.5 border border-slate-200 rounded-lg bg-white text-slate-500 outline-none cursor-pointer"
                          title="Cambiar el plan del cliente"
                        >
                          <option value="" disabled>Cambiar plan…</option>
                          {Object.entries(PLAN_CATALOG).map(([id, p]) => (
                            <option key={id} value={id}>{p.name} — ${p.basePrice}/mes</option>
                          ))}
                        </select>
                      </div>

                      {/* Contact */}
                      <div className="min-w-[140px] text-xs">
                        <a href={`tel:${c.quoteData?.phone}`} className="font-bold text-indigo-650 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" /><span>{c.quoteData?.phone || '—'}</span>
                        </a>
                        <span className="text-[10px] text-slate-500 truncate block max-w-[160px]">{c.quoteData?.email || '—'}</span>
                      </div>

                      {/* Doc */}
                      <div className="min-w-[110px] text-xs">
                        <span className="font-semibold text-slate-800 font-mono text-[11px] block">{c.quoteData?.docNumber || '—'}</span>
                        {c.quoteData?.birthDate && (
                          <span className="block text-[9px] text-slate-400">Nac.: {c.quoteData.birthDate}</span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-mono block">Prima:</span>
                        <span className="text-sm font-black text-indigo-750 font-mono">${Number(c.estimatedPrice || 0).toFixed(2)}/m</span>
                      </div>

                      {/* Payment status */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Pago:</span>
                        <select
                          value={paymentStatus}
                          onChange={(e) => updateClientPaymentStatus(c.id, e.target.value as any)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                            paymentStatus === 'Pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : paymentStatus === 'Atrasado' ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="Pagado">Pagado</option>
                          <option value="Pendiente">Pendiente</option>
                          <option value="Atrasado">Atrasado</option>
                        </select>
                      </div>

                      {/* Portal access */}
                      <div className="flex items-center gap-2 ml-auto">
                        {hasPortalAccess ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700"><Lock className="w-3 h-3" /> Activo</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><Lock className="w-3 h-3" /> Sin acceso</span>
                        )}
                        <button
                          onClick={() => {
                            setPasswordModalLeadId(c.id);
                            setNewPasswordInput('');
                            setPasswordSaveError('');
                            setPasswordSaveSuccess(null);
                          }}
                          className="text-[10px] font-bold text-[#0C4169] hover:underline cursor-pointer whitespace-nowrap"
                        >
                          {hasPortalAccess ? 'Restablecer clave' : 'Establecer clave'}
                        </button>
                      </div>
                    </div>

                    {/* Address — collapsed by default, less frequently needed */}
                    <details className="mt-1.5 text-[10px] group">
                      <summary className="cursor-pointer text-slate-400 font-semibold hover:text-teal-600 list-none flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                        <span>Dirección</span>
                      </summary>
                      <div className="mt-1 pl-4 border-l-2 border-slate-150">
                        {c.quoteData?.address?.address1 ? (
                          <span className="text-slate-700">
                            {c.quoteData.address.address1}
                            {c.quoteData.address.address2 ? `, ${c.quoteData.address.address2}` : ''}
                            {' — '}{c.quoteData.address.city}, {c.quoteData.address.province} (CP {c.quoteData.address.postalCode})
                          </span>
                        ) : (
                          <span className="text-slate-400">No registrada por el cliente aún.</span>
                        )}
                      </div>
                    </details>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">
                  {clients.length === 0 ? 'Aún no hay clientes.' : 'No hay resultados con ese criterio de búsqueda.'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Un lead se convierte en cliente al marcarlo como "Cierre Efectivo" en Cotizaciones Recibidas.
                </p>
              </div>
            )}
          </div>

          {/* Set/Reset password modal — portal'd to <body> so this "fixed" element
              can't inherit a broken containing block from an ancestor on long pages. */}
          {modalClient && createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setPasswordModalLeadId(null)}
            >
              <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Portal de Afiliados</p>
                    <h3 className="text-lg font-black text-[#0C4169]">{modalClient.quoteData?.fullName}</h3>
                    <p className="text-[11px] text-slate-500">Cédula: {modalClient.quoteData?.docNumber || '—'}</p>
                  </div>
                  <button onClick={() => setPasswordModalLeadId(null)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {passwordSaveSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-emerald-800">Contraseña actualizada correctamente.</p>
                    <p className="text-[10px] text-emerald-700">
                      El cliente ya puede ingresar al Portal de Afiliados con su cédula ({passwordSaveSuccess}) y la nueva contraseña.
                    </p>
                    <button
                      onClick={() => setPasswordModalLeadId(null)}
                      className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Nueva contraseña (mín. 6 caracteres):</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={passwordFieldVisible ? 'text' : 'password'}
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="Ej. Colmedikal2026"
                          className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordFieldVisible(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {passwordFieldVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordSaveError && (
                        <span className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {passwordSaveError}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-2.5 leading-relaxed">
                      El cliente ingresará a Mi Colmedikal (<a href="/mi-colmedikal" target="_blank" rel="noreferrer" className="text-[#4597CA] underline">colmedikal.com/mi-colmedikal</a>) usando su cédula y esta contraseña.
                    </p>

                    <button
                      onClick={handleSavePassword}
                      disabled={passwordSaveLoading || newPasswordInput.length < 6}
                      className="w-full py-3 rounded-xl bg-[#0C4169] hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-black uppercase tracking-wider text-white cursor-pointer transition"
                    >
                      {passwordSaveLoading ? 'Guardando...' : 'Guardar Contraseña'}
                    </button>
                  </>
                )}
              </div>
            </div>,
            document.body
          )}
        </div>
        );
      })()}

      {/* 3.6 LIVE MEDICAL DIRECTORY MANAGE */}
      {activeTab === 'doctors' && (
        <div className="space-y-8 animate-in fade-in duration-200" id="admin-doctors-panel">
          
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-950">Módulo de Especialistas Médicos del País</h3>
            <p className="text-xs text-slate-500 mt-1">
              Agrega nuevos profesionales de la salud al live board para que los asegurados los agenden de forma instantánea. Elimina profesionales que dejen de pertenecer a la red de cobertura.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* New Doctor form block */}
            <form onSubmit={handleAddDoctor} className="lg:col-span-4 bg-slate-55 p-6 rounded-3xl border border-slate-200 space-y-4">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {editingDocId ? 'Editar Especialista de Red' : 'Registrar Nuevo Médico'}
              </span>
              
              {docSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-xl flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{docSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Doctor Name */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700">Nombre del Médico:</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Dr. Andrés Noboa"
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Specialty */}
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-bold text-slate-700">Especialidad / Tipo:</label>
                    <select
                      value={newDoc.specialty}
                      onChange={(e) => setNewDoc({...newDoc, specialty: e.target.value})}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <optgroup label="— Establecimientos —">
                        <option value="Hospital">Hospital</option>
                        <option value="Clínica">Clínica</option>
                        <option value="Centro Médico">Centro Médico</option>
                        <option value="Laboratorio Clínico">Laboratorio Clínico</option>
                        <option value="Odontología">Odontología</option>
                      </optgroup>
                      <optgroup label="— Especialidades médicas —">
                        <option value="Dermatología">Dermatología</option>
                        <option value="Cardiología">Cardiología</option>
                        <option value="Ginecología y Obstetricia">Ginecología</option>
                        <option value="Pediatría y Neonatología">Pediatría</option>
                        <option value="Traumatología y Ortopedia">Traumatología</option>
                        <option value="Odontología y Maxilofacial">Odontología Espec.</option>
                        <option value="Medicina General">Medicina General</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* City */}
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-bold text-slate-700">Ciudad:</label>
                    <select
                      value={newDoc.city}
                      onChange={(e) => setNewDoc({...newDoc, city: e.target.value})}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Quito">Quito</option>
                      <option value="Guayaquil">Guayaquil</option>
                      <option value="Cuenca">Cuenca</option>
                    </select>
                  </div>
                </div>

                {/* Nivel */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700">Nivel de Red:</label>
                  <select
                    value={newDoc.nivel}
                    onChange={(e) => setNewDoc({...newDoc, nivel: Number(e.target.value)})}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value={1}>Nivel 1 — Plan 2K, 3K y 5K</option>
                    <option value={2}>Nivel 2</option>
                    <option value={3}>Nivel 3</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Phone */}
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-bold text-slate-700">Teléfono:</label>
                    <input 
                      type="text"
                      placeholder="Ej. 02-390251"
                      value={newDoc.phone}
                      onChange={(e) => setNewDoc({...newDoc, phone: e.target.value})}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-bold text-slate-700">Costo Consulta ($):</label>
                    <input 
                      type="number"
                      min="0"
                      max="150"
                      value={newDoc.cost}
                      onChange={(e) => setNewDoc({...newDoc, cost: Number(e.target.value)})}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Address / clinic */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700">Dirección:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Av. República E6-447 y Eloy Alfaro, Quito"
                    value={newDoc.clinic}
                    onChange={(e) => setNewDoc({...newDoc, clinic: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                {/* Schedule / availability */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700">Horario de Atención:</label>
                  <input
                    type="text"
                    placeholder="Ej. Lu-Vi 08:00-17:00 | Sáb 09:00-13:00"
                    value={newDoc.availability}
                    onChange={(e) => setNewDoc({...newDoc, availability: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <p className="text-[9px] text-slate-400 pt-0.5">Puede usar | para separar bloques. Ej: Lu-Vi 08:30-18:30 | Sáb 09:00-13:00</p>
                </div>

                {/* Education and degree */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700">Educación o Subespecialidad:</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Cirujano de Tórax - Universidad de París, Francia"
                    value={newDoc.education}
                    onChange={(e) => setNewDoc({...newDoc, education: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                {/* Icon / Photo selector */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Ícono / Foto:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {/* Establishment icons */}
                    {[
                      { id: 'icon_hospital', label: 'Hospital', Icon: Hospital,     bg: 'bg-rose-50   border-rose-200   text-rose-600'   },
                      { id: 'icon_lab',      label: 'Lab',      Icon: FlaskConical, bg: 'bg-amber-50  border-amber-200  text-amber-600'  },
                      { id: 'icon_dental',   label: 'Dental',   Icon: Sparkles,     bg: 'bg-sky-50    border-sky-200    text-sky-600'    },
                      { id: 'icon_building', label: 'Centro',   Icon: Building2,    bg: 'bg-teal-50   border-teal-200   text-teal-600'   },
                    ].map(({ id, label, Icon, bg }) => (
                      <button type="button" key={id} onClick={() => setNewDoc({...newDoc, image: id})}
                        className={`p-1.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${newDoc.image === id ? 'border-indigo-600 scale-95' : 'border-slate-200'}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${bg}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[8px] font-bold text-slate-500">{label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mt-1">
                    {/* Doctor avatars */}
                    {[
                      { id: 'doctor_m',  alias: 'Dr. M1', img: avatarGomez },
                      { id: 'doctor_f',  alias: 'Dra. F1', img: avatarRestrepo },
                      { id: 'doctor_m2', alias: 'Dr. M2', img: avatarDoctorM2 },
                      { id: 'doctor_f2', alias: 'Dra. F2', img: avatarDoctorF2 }
                    ].map((avatar) => (
                      <button type="button" key={avatar.id} onClick={() => setNewDoc({...newDoc, image: avatar.id})}
                        className={`p-1 rounded-xl border-2 transition-all overflow-hidden ${newDoc.image === avatar.id ? 'border-indigo-600 scale-95' : 'border-slate-200'}`}>
                        <img src={avatar.img} alt="" className="w-full h-8 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <span className="text-[8px] font-bold text-slate-500 block text-center mt-0.5">{avatar.alias}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full py-3.5 text-center bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
                >
                  {editingDocId ? 'Guardar Cambios ✓' : 'Habilitar Doctor en Directorio Live'}
                </button>

                {editingDocId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full py-2.5 text-center bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>
            </form>

            {/* Live listings of active doctors list */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">médicos en convenio disponibles ({doctors.length})</span>
              
              <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto pr-2 space-y-1.5 scrollbar-thin">
                {doctors.map((doc) => (
                  <div key={doc.id} className="py-3 flex justify-between items-center text-xs gap-3">
                    <div className="flex gap-3.5 items-center">
                      <img 
                        src={doc.image} 
                        alt="" 
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900">{doc.name}</h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                          <span>{doc.specialty}</span>
                          {doc.nivel && <span className="bg-[#0C4169]/10 text-[#0C4169] px-1.5 py-0.5 rounded text-[8px] font-black uppercase">N{doc.nivel}</span>}
                          <strong>{doc.clinic} ({doc.city})</strong>
                        </p>
                        <p className="text-[9px] text-indigo-600 font-mono italic max-w-[320px] truncate" title={doc.education}>{doc.education}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-408 font-bold font-mono block">${doc.cost} / cons.</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full inline-block ${doc.active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                          {doc.active !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEditInitiate(doc)}
                        className="px-2 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1"
                        title="Editar prestador médico"
                      >
                        <Edit className="w-3 h-3 text-amber-600" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleDoctorActiveStatus(doc.id)}
                        className={`px-2 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${doc.active !== false ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200' : 'bg-[#e2f0fb] text-[#0C4169] border-[#4597CA] hover:bg-sky-50'}`}
                        title={doc.active !== false ? "Hacer de baja temporal" : "Reestablecer en el directorio"}
                      >
                        {doc.active !== false ? 'Desactivar' : 'Activar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Hacer de baja al ${doc.name} de la red de clínicas de Colmedikal?`)) {
                            deleteDoctor(doc.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar del Directorio"
                        id={`btn-del-doc-${doc.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  )}

  {/* 3.7 ADMINISTRATOR USER MANAGEMENT PANEL */}
  {activeTab === 'admins' && (
    <div className="space-y-8 animate-in fade-in duration-205" id="admin-users-panel">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form to add administrative user — Super Admin only */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 h-fit text-slate-850">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
              <UserCheck className="w-5 h-5 text-indigo-650" />
              <span>Registrar Nuevo Acceso</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Otorgar credenciales para auditoría o administración a miembros del equipo de Colmedikal.
            </p>
          </div>

          {!canManageAdmins && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl">
              Solo el Super Admin puede registrar o modificar accesos.
            </div>
          )}
          <form onSubmit={handleRegisterAdmin} className="space-y-4" style={canManageAdmins ? undefined : { pointerEvents: 'none', opacity: 0.45 }}>
            {adminSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold rounded-xl leading-normal">
                {adminSuccessMsg}
              </div>
            )}
            {adminErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 text-xs font-semibold rounded-xl leading-normal">
                {adminErrorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="new-admin-email" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Correo Electrónico:
              </label>
              <input
                id="new-admin-email"
                type="email"
                required
                placeholder="correo@colmedikal.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium font-sans"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-admin-name" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Nombre Completo del Colaborador:
              </label>
              <input
                id="new-admin-name"
                type="text"
                required
                placeholder="Ej. Dra. Alexandra Moreno"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium font-sans"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-admin-password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Contraseña de Acceso:
              </label>
              <input
                id="new-admin-password"
                type="password"
                required
                placeholder="Mínimo 8 caracteres"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium font-sans"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-admin-role" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Rol Administrativo Corp:
              </label>
              <select
                id="new-admin-role"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium cursor-pointer font-sans"
                value={newAdmin.role}
                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as any })}
              >
                <option value="Super Admin">Super Admin — Acceso completo</option>
                <option value="Mid Admin">Mid Admin — Sin Panel SEO</option>
                <option value="Equipo Comercial">Equipo Comercial — Solo leads y autorizaciones</option>
                <option value="Auditor">Auditor — Solo reembolsos</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmittingAdmin}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition text-center uppercase tracking-widest font-sans"
            >
              {isSubmittingAdmin ? 'Registrando...' : 'Otorgar Acceso Seguro ✓'}
            </button>
          </form>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-600 text-[10px] space-y-1 font-sans">
            <span className="font-bold uppercase tracking-wider block text-slate-700">🔒 Niveles de Acceso</span>
            <p className="leading-relaxed">
              Solo el Super Admin puede registrar, modificar roles, suspender o revocar accesos. Mid Admin puede visualizar este panel pero sin permisos de edición. Equipo Comercial solo ve cotizaciones y autorizaciones. Auditor solo accede a reembolsos.
            </p>
          </div>
        </div>

        {/* List of administrative users */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2 text-slate-800">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5 font-display">
                <Users className="w-4 h-4 text-slate-500" />
                <span>Miembros Autorizados y Auditores Activos</span>
              </h4>
              <p className="text-[10px] text-slate-400 font-medium">Lista de control de accesos dinámicos en producción</p>
            </div>
          </div>

          {(!admins || admins.length === 0) ? (
            <div className="text-center py-12 text-slate-405 text-xs font-mono">
              No hay administradores dinámicos registrados aún. (El correo root edox54@gmail.com tiene acceso por defecto).
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Detalle Administrador</th>
                    <th className="pb-3">Rol Corporativo</th>
                    <th className="pb-3 text-center">Estado</th>
                    {canManageAdmins && <th className="pb-3 text-center">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((adm) => (
                    <tr key={adm.email} className="hover:bg-slate-50/40">
                      <td className="py-3.5 pr-3">
                        <div className="font-bold text-slate-900 leading-snug">{adm.name}</div>
                        <div className="text-slate-450 font-mono text-[10px] mt-0.5">{adm.email}</div>
                        <div className="text-[9px] text-slate-400 mt-1">
                          Registrado el {new Date(adm.addedAt).toLocaleDateString()} por <span className="font-semibold">{adm.addedBy}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        {canManageAdmins ? (
                          <select
                            value={adm.role}
                            onChange={async (e) => {
                              const newRole = e.target.value as typeof adm.role;
                              try { await updateAdminRole(adm.email, newRole); } catch { /* ignore */ }
                            }}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider font-sans cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                              adm.role === 'Super Admin'
                                ? 'bg-violet-50 border-violet-200 text-violet-700'
                                : adm.role === 'Mid Admin'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : adm.role === 'Equipo Comercial'
                                ? 'bg-teal-50 border-teal-200 text-teal-700'
                                : 'bg-amber-50 border-amber-200 text-amber-700'
                            }`}
                          >
                            <option value="Super Admin">Super Admin</option>
                            <option value="Mid Admin">Mid Admin</option>
                            <option value="Equipo Comercial">Equipo Comercial</option>
                            <option value="Auditor">Auditor</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider font-sans inline-block ${
                            adm.role === 'Super Admin'
                              ? 'bg-violet-50 border-violet-200 text-violet-700'
                              : adm.role === 'Mid Admin'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : adm.role === 'Equipo Comercial'
                              ? 'bg-teal-50 border-teal-200 text-teal-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>{adm.role}</span>
                        )}
                      </td>
                      <td className="py-3.5 text-center">
                        {canManageAdmins ? (
                          <button
                            onClick={() => toggleAdminActiveStatus(adm.email)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer uppercase tracking-wider font-sans ${
                              adm.active
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-250'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-605 border-stone-300'
                            }`}
                            title={adm.active ? 'Haga clic para suspender' : 'Haga clic para habilitar'}
                          >
                            {adm.active ? 'Activo' : 'Suspendido'}
                          </button>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider font-sans inline-block ${
                            adm.active
                              ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                              : 'bg-stone-100 border-stone-300 text-stone-605'
                          }`}>
                            {adm.active ? 'Activo' : 'Suspendido'}
                          </span>
                        )}
                      </td>
                      {canManageAdmins && (
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`¿Está seguro de revocar permanentemente los privilegios de administración para ${adm.name}?`)) {
                                deleteAdmin(adm.email);
                              }
                            }}
                            className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                            title="Revocar acceso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

    </div>
  )}

  {/* 4. HIGH FIDELITY LIVE DOCUMENT PREVIEW MODAL — portal'd to <body>, see
      the password modal above for why. */}
    {selectedDocument && createPortal(
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col md:flex-row h-auto md:h-[620px] divide-y md:divide-y-0 md:divide-x divide-slate-800 animate-in zoom-in-95 duration-200">
          
          {/* Metadata Audit & Actions Column */}
          <div className="p-6 md:w-5/12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Verificación Física</span>
                <button 
                  onClick={() => setSelectedDocument(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">ID de Trámite Interno:</span>
                  <span className="font-mono text-xs font-bold text-white block">{selectedDocument.id}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Asegurado Solicitante:</span>
                  <span className="text-sm font-bold text-white block leading-tight">{selectedDocument.fullName}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold block uppercase">Celular:</span>
                    <span className="text-[11px] font-medium text-slate-300 block font-mono">{selectedDocument.phone}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-505 font-bold block uppercase">Correo:</span>
                    <span className="text-[11px] font-medium text-slate-300 block truncate" title={selectedDocument.email}>{selectedDocument.email}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-slate-505 font-bold block uppercase">Archivo Adjunto Recibido:</span>
                  <div className="flex items-center gap-2 mt-1 p-2 bg-slate-950 rounded-xl border border-slate-850">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span className="text-[11px] font-bold text-slate-300 font-mono truncate">{selectedDocument.fileName}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1 text-[11px] leading-relaxed text-slate-400">
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Firma Digital Colmedikal</span>
                </span>
                <p>Este documento es una copia viva recibida en nuestros servidores y pre-analizada con reconocimiento clínico automático.</p>
              </div>
            </div>

            <div className="pt-4 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  if (selectedDocument?.fileData) {
                    const link = document.createElement('a');
                    link.href = selectedDocument.fileData;
                    link.download = selectedDocument.fileName || 'documento_colmedikal';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    alert('No hay datos de archivo disponibles para este registro cargado.');
                  }
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                id="download-doc-btn"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Archivo Adjunto</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl text-center transition cursor-pointer"
              >
                Cerrar Visor
              </button>
            </div>
          </div>

          {/* Document Sheet Paper Visualizer Simulator Section */}
          <div className="p-4 md:p-6 md:w-7/12 bg-slate-950 flex flex-col justify-center items-center overflow-hidden">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mb-2 block">VISUALIZACIÓN DE DOCUMENTO ADJUNTO POR CLIENTE</span>
            
            <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner">
              {selectedDocument.fileData ? (
                <>
                  {selectedDocument.fileData.startsWith('data:image/') ? (
                    <img 
                      src={selectedDocument.fileData} 
                      alt="Vista previa del documento" 
                      className="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-500" 
                    />
                  ) : selectedDocument.fileData.startsWith('data:application/pdf') ? (
                    <iframe 
                      src={selectedDocument.fileData} 
                      className="w-full h-full border-none bg-white animate-in fade-in duration-500" 
                      title="PDF Preview" 
                    />
                  ) : (
                    <div className="text-center p-8 space-y-4">
                      <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                      <p className="text-slate-400 text-xs font-medium">Contenido del archivo no previsualizable.</p>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = selectedDocument.fileData!;
                          link.download = selectedDocument.fileName;
                          link.click();
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-705 text-white text-[10px] font-bold rounded-lg border border-slate-701"
                      >
                        Abrir / Descargar para Revisión
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Falling back to paper simulation if legacy record has no data */
                <div className="bg-amber-50/5 border border-amber-500/20 w-full rounded-2xl p-6 text-slate-800 space-y-4 shadow-xl select-none relative font-mono text-[10px] leading-relaxed overflow-hidden max-w-[340px] scale-90 sm:scale-100">
                  <div className="absolute inset-0 bg-white opacity-[0.96] pointer-events-none z-0"></div>
                  <div className="relative z-10 space-y-3">
                    <div className="text-center font-bold border-b border-slate-300 pb-2.5 tracking-tight">
                      <h5 className="text-[11px] uppercase tracking-wider text-slate-950">REPÚBLICA DEL ECUADOR</h5>
                      <p className="text-[8px] text-slate-500 mt-0.5 whitespace-nowrap">DOCUMENTO DE RESPALDO (SIN DATA BINARIA)</p>
                    </div>
                    <div className="p-8 text-center text-slate-400 italic">
                      Este registro fue creado antes de la implementación de carga directa de archivos.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
