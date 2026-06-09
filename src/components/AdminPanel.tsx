import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { Page, Doctor } from '../types';
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
    deleteLead,
    refreshData,
    addAdmin,
    deleteAdmin,
    toggleAdminActiveStatus
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

  const [activeTab, setActiveTab] = useState<'kpis' | 'refunds' | 'appointments' | 'auths' | 'leads' | 'doctors' | 'admins'>('kpis');
  
  // Administradores form and registration states
  const [newAdmin, setNewAdmin] = useState<{
    email: string;
    name: string;
    role: 'Administrador' | 'Auditor Clínico';
  }>({
    email: '',
    name: '',
    role: 'Administrador'
  });
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');
  const [adminErrorMsg, setAdminErrorMsg] = useState('');

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.name) {
      setAdminErrorMsg('Por favor complete todos los campos.');
      return;
    }
    
    if (!newAdmin.email.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)) {
      setAdminErrorMsg('Por favor ingrese un correo válido.');
      return;
    }

    setIsSubmittingAdmin(true);
    setAdminErrorMsg('');
    setAdminSuccessMsg('');
    try {
      await addAdmin(newAdmin.email, newAdmin.name, newAdmin.role);
      setAdminSuccessMsg(`¡Acceso administrador otorgado con éxito para ${newAdmin.name}!`);
      setNewAdmin({
        email: '',
        name: '',
        role: 'Administrador'
      });
      setTimeout(() => setAdminSuccessMsg(''), 4000);
    } catch (err: any) {
      setAdminErrorMsg('Ocurrió un error al registrar el acceso seguro.');
    } finally {
      setIsSubmittingAdmin(false);
    }
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
    image: 'doctor_m'
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
      doctor_f2: avatarDoctorF2
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
        active: existingDoctorObj?.active ?? true
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
        cost: Number(newDoc.cost)
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
      image: 'doctor_m'
    });
    setTimeout(() => setDocSuccessMsg(''), 4000);
  };

  const handleEditInitiate = (doc: Doctor) => {
    const matchAvatarId = (imgUrl: string) => {
      if (imgUrl.includes('gomez') || imgUrl.includes('doctor_m')) return 'doctor_m';
      if (imgUrl.includes('restrepo') || imgUrl.includes('doctor_f')) return 'doctor_f';
      if (imgUrl.includes('doctor_m2')) return 'doctor_m2';
      if (imgUrl.includes('doctor_f2')) return 'doctor_f2';
      return 'doctor_m';
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
      image: matchAvatarId(doc.image)
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
      image: 'doctor_m'
    });
  };

  // KPI Calculations
  const pendingRefunds = refunds.filter(r => r.status === 'Procesando');
  const totalRefundAmountPending = pendingRefunds.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const totalLeadsUncontacted = leads.filter(l => l.status === 'Nuevo Plan').length;
  const pendingAuthsCount = authorizations.filter(a => a.status === 'Pendiente' || a.status === 'Auditoría').length;
  const activeAppointmentsCount = appointments.filter(a => a.status === 'Confirmada' || a.status === 'Pendiente').length;

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
        <button
          onClick={() => setActiveTab('kpis')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'kpis'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-650 hover:bg-slate-200'
          }`}
          id="admin-tab-kpis"
        >
          Consola General (KPIs)
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'refunds'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-655 hover:bg-slate-200'
          }`}
          id="admin-tab-refunds"
        >
          <span>Auditar Reembolsos</span>
          {pendingRefunds.length > 0 && (
            <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">{pendingRefunds.length}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'appointments'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-655 hover:bg-slate-200'
          }`}
          id="admin-tab-appointments"
        >
          <span>Citas Médicas</span>
          {activeAppointmentsCount > 0 && (
            <span className="bg-teal-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded-full font-mono">{activeAppointmentsCount}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('auths')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'auths'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-655 hover:bg-slate-200'
          }`}
          id="admin-tab-auths"
        >
          <span>Autorizaciones</span>
          {pendingAuthsCount > 0 && (
            <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">{pendingAuthsCount}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'leads'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-655 hover:bg-slate-200'
          }`}
          id="admin-tab-leads"
        >
          <Bell className="w-3.5 h-3.5 shrink-0" />
          <span>Cotizaciones Recibidas</span>
          {totalLeadsUncontacted > 0 && (
            <span className="bg-emerald-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded-full font-mono">{totalLeadsUncontacted}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'doctors'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-655 hover:bg-slate-200'
          }`}
          id="admin-tab-doctors"
        >
          <span>Directorio Médico</span>
          <span className="text-[10px] text-slate-400 font-mono font-normal">({doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'admins'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-655 hover:bg-slate-200'
          }`}
          id="admin-tab-admins"
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Gestionar Accesos</span>
          <span className="text-[10px] text-slate-450 font-mono font-normal">({admins ? admins.length : 0})</span>
        </button>

        <a
          href="/seo-panel"
          className="px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
        >
          🔍 <span>Panel SEO</span>
        </a>
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
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-appointments-panel">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-950">Libro General de Consultas y Citas Médicas</h3>
            <p className="text-xs text-slate-500 mt-1">
              Vigila, autoriza o cancela las citas presenciales y virtuales agendadas por los asegurados en los centros médicos de convenio del país.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Código / Paciente</th>
                    <th className="p-4">Médicos / Especialidad</th>
                    <th className="p-4">Fecha y Hora</th>
                    <th className="p-4">Sede / Modalidad</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.length > 0 ? (
                    appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 space-y-1">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.2 rounded inline-block">
                            {apt.id}
                          </span>
                          <p className="font-bold text-slate-900 text-sm">{apt.patientName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {apt.patientId} | Tel: {apt.patientPhone}</p>
                        </td>

                        <td className="p-4 space-y-1">
                          <p className="font-bold text-slate-850 leading-none">{apt.doctorName}</p>
                          <span className="inline-block bg-indigo-50 text-indigo-700 text-[9px] px-2 py-0.2 rounded font-bold uppercase">
                            {apt.specialty}
                          </span>
                        </td>

                        <td className="p-4 font-mono font-semibold text-slate-800">
                          {apt.aptDate} <span className="block text-[10px] text-slate-405 font-normal">{apt.aptTime}</span>
                        </td>

                        <td className="p-4 space-y-1">
                          <p className="text-slate-700 font-medium">{apt.clinic}</p>
                          <div className="flex items-center gap-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                              apt.modality === 'telemedicina' ? 'bg-indigo-50 text-indigo-750' : 'bg-rose-50 text-rose-750'
                            }`}>
                              {apt.modality === 'telemedicina' ? 'Videollamada' : 'Presencial'}
                            </span>
                            <span className="text-[10px] text-slate-400">({apt.city})</span>
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            apt.status === 'Confirmada' || apt.status === 'Completada'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                              : apt.status === 'Cancelada'
                              ? 'text-red-700 bg-red-50 border-red-100'
                              : 'text-amber-705 bg-amber-50 border-amber-100'
                          }`}>
                            {apt.status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {apt.status === 'Pendiente' && (
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'Confirmada')}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                Confirmar
                              </button>
                            )}

                            {apt.status !== 'Cancelada' && apt.status !== 'Completada' && (
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'Cancelada')}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-750 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                Cancelar
                              </button>
                            )}

                            {apt.status === 'Confirmada' && (
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'Completada')}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                Completar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-450">
                        No hay citas agendadas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
      {activeTab === 'leads' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-leads-panel">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-950">Cotizaciones Emitidas desde el Panel</h3>
              <p className="text-xs text-slate-500 mt-1">
                Visualiza en tiempo real las cotizaciones de seguros de salud realizadas por tus usuarios. Se actualiza cada 10 segundos.
              </p>
            </div>
            <button
              onClick={() => refreshData()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-xl transition cursor-pointer"
              title="Actualizar ahora"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leads.length > 0 ? (
              leads.map((ld) => (
                <div key={ld.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between" id={`admin-lead-card-${ld.id}`}>

                  {/* Lead details header */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest font-mono">
                          {ld.quoteData?.leadCode || ld.id.slice(0, 14).toUpperCase()}
                        </span>
                        <h4 className="text-base font-black text-slate-900 leading-tight">{ld.quoteData?.fullName || '—'}</h4>
                        {ld.quoteData?.selectedPlanName && (
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold uppercase">
                            {ld.quoteData.selectedPlanName}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-semibold font-mono block">Valor Est.:</span>
                        <span className="text-base font-black text-indigo-750 font-mono">${Number(ld.estimatedPrice || 0).toFixed(2)}<span className="text-[10px] font-normal">/m</span></span>
                      </div>
                    </div>

                    {/* Meta info tags */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase">Contacto:</span>
                        <a href={`tel:${ld.quoteData?.phone}`} className="font-bold text-indigo-650 hover:underline flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{ld.quoteData?.phone || '—'}</span>
                        </a>
                        <a href={`mailto:${ld.quoteData?.email}`} className="text-[10px] text-slate-500 truncate block hover:underline">
                          {ld.quoteData?.email || '—'}
                        </a>
                      </div>

                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase">Estructura Plan:</span>
                        <span className="font-semibold text-slate-800 capitalize leading-none">{ld.quoteData?.type || '—'}</span>
                        <span className="block text-[10px] text-slate-500">
                          {ld.quoteData?.primaryAge ? `${ld.quoteData.primaryAge} años` : ''}
                          {(ld.quoteData?.childrenCount ?? 0) > 0 ? ` • Hijos: ${ld.quoteData?.childrenCount}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Addons preference ledger */}
                    <div className="space-y-1.5">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Tipo de Segmento:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-block bg-slate-100 text-slate-700 text-[9px] px-2 py-0.5 rounded font-medium">
                          Plan base: {ld.quoteData?.basePlanId?.toUpperCase() || 'N/A'}
                        </span>
                        {(ld.quoteData?.childrenCount ?? 0) > 0 && (
                          <span className="inline-block bg-teal-50 text-teal-700 text-[9px] px-2 py-0.5 rounded font-medium">
                            {ld.quoteData?.childrenCount} dependiente(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(ld.timestamp).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase mt-0.5 inline-block ${
                        ld.status === 'Cierre Efectivo'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : ld.status === 'Contactado'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {ld.status}
                      </span>
                    </div>

                    <div className="flex gap-2 items-center">
                      {ld.status === 'Nuevo Plan' && (
                        <button
                          onClick={() => updateLeadStatus(ld.id, 'Contactado')}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer"
                        >
                          Contactado
                        </button>
                      )}

                      {ld.status === 'Contactado' && (
                        <button
                          onClick={() => updateLeadStatus(ld.id, 'Cierre Efectivo')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer"
                        >
                          Cierre Exitoso ✔
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la cotización de ${ld.quoteData?.fullName || ld.id}?`)) {
                            deleteLead(ld.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar cotización"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 bg-white rounded-3xl border p-6">
                <Briefcase className="w-12 h-12 text-slate-350 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No hay prospectos cotizaciones guardadas aún.</p>
              </div>
            )}
          </div>
        </div>
      )}

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
                    <label className="block text-[11px] font-bold text-slate-700">Especialidad:</label>
                    <select
                      value={newDoc.specialty}
                      onChange={(e) => setNewDoc({...newDoc, specialty: e.target.value})}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Dermatología">Dermatología</option>
                      <option value="Cardiología">Cardiología</option>
                      <option value="Ginecología y Obstetricia">Ginecología</option>
                      <option value="Pediatría y Neonatología">Pediatría</option>
                      <option value="Traumatología y Ortopedia">Traumatología</option>
                      <option value="Odontología y Maxilofacial">Odontología</option>
                      <option value="Medicina General">Medicina General</option>
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
                      min="10"
                      max="150"
                      value={newDoc.cost}
                      onChange={(e) => setNewDoc({...newDoc, cost: Number(e.target.value)})}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Clinic */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700">Clínica de Convenio:</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Hospital Metropolitano, Clínica Kennedy..."
                    value={newDoc.clinic}
                    onChange={(e) => setNewDoc({...newDoc, clinic: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
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

                {/* Photo profile choose mock */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Foto del Especialista (Mockup):</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'doctor_m', alias: 'M-1', img: avatarGomez },
                      { id: 'doctor_f', alias: 'F-1', img: avatarRestrepo },
                      { id: 'doctor_m2', alias: 'M-2', img: avatarDoctorM2 },
                      { id: 'doctor_f2', alias: 'F-2', img: avatarDoctorF2 }
                    ].map((avatar) => (
                      <button
                        type="button"
                        key={avatar.id}
                        onClick={() => setNewDoc({...newDoc, image: avatar.id})}
                        className={`p-1 rounded-xl border-2 transition-all overflow-hidden ${
                          newDoc.image === avatar.id ? 'border-indigo-600 scale-95' : 'border-slate-200'
                        }`}
                      >
                        <img src={avatar.img} alt="" className="w-full h-8 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <span className="text-[8px] font-bold text-slate-500 block text-center mt-1">{avatar.alias}</span>
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
                        <p className="text-[10px] text-slate-500">
                          {doc.specialty} • <strong>{doc.clinic} ({doc.city})</strong>
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
        
        {/* Form to add administrative user */}
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

          <form onSubmit={handleRegisterAdmin} className="space-y-4">
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
                Correo de Google (Gmail / Workspace):
              </label>
              <input
                id="new-admin-email"
                type="email"
                required
                placeholder="ejemplo@gmail.com o @colmedikal.com"
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
              <label htmlFor="new-admin-role" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Rol Administrativo Corp:
              </label>
              <select
                id="new-admin-role"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium cursor-pointer font-sans"
                value={newAdmin.role}
                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as any })}
              >
                <option value="Administrador">Administrador de Red</option>
                <option value="Auditor Clínico">Auditor Clínico</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmittingAdmin}
              className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-350 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-indigo-500/10 cursor-pointer transition text-center uppercase tracking-widest font-sans"
            >
              {isSubmittingAdmin ? 'Registrando...' : 'Otorgar Acceso Seguro ✓'}
            </button>
          </form>

          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50 text-amber-950 text-[10px] space-y-1 font-sans">
            <span className="font-bold uppercase tracking-wider block">🔒 Protección y Regla de Acceso</span>
            <p className="leading-relaxed">
              Las cuentas asignadas aquí son persistidas en la base de datos cloud de Google Firebase y validadas por firma criptográfica de Google Token.
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
                    <th className="pb-3 text-center">Acciones</th>
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
                      <td className="py-3.5 text-slate-750">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider font-sans ${
                          adm.role === 'Administrador'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {adm.role}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
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
                      </td>
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

  {/* 4. HIGH FIDELITY LIVE DOCUMENT PREVIEW MODAL */}
    {selectedDocument && (
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
      </div>
    )}
    </>
  );
}
