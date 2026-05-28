import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  QrCode, 
  DollarSign, 
  FileText, 
  Clock, 
  FileCheck, 
  LogOut, 
  Lock, 
  Upload, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Video,
  ChevronRight,
  Bell,
  Stethoscope,
  HeartPulse
} from 'lucide-react';
import { Page } from '../types';
import { useColmedical } from '../context/ColmedicalContext';

interface PortalAfiliadosProps {
  setCurrentPage: (page: Page) => void;
}

interface Member {
  name: string;
  relationship: string;
  cardId: string;
}

export default function PortalAfiliados({ setCurrentPage }: PortalAfiliadosProps) {
  const { refunds, authorizations, addRefund, addAuthorization } = useColmedical();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dash' | 'carnet' | 'reembolsos' | 'autorizaciones' | 'triage'>('dash');
  
  // Login State
  const [username, setUsername] = useState('demo@colmedical.ec');
  const [password, setPassword] = useState('colmedical2026');
  const [loginError, setLoginError] = useState('');

  // User Profile Data Info
  const userProfile = {
    name: 'Ing. Carlos Ramos Valdiviezo',
    cardId: 'EC-445892-01',
    planName: 'Plan Colmedikal Esencial',
    validUntil: '31/12/2026',
    familyGroup: [
      { name: 'Elena Mendoza de Ramos', relationship: 'Cónyuge', cardId: 'EC-445892-02' },
      { name: 'Mateo Ramos Mendoza', relationship: 'Hijo (8 años)', cardId: 'EC-445892-03' },
      { name: 'Sofía Ramos Mendoza', relationship: 'Hija (4 años)', cardId: 'EC-445892-04' }
    ]
  };

  // Form states for creating refund
  const [newRefund, setNewRefund] = useState({
    familyMember: 'Carlos Ramos Valdiviezo',
    specialty: 'Pediatría',
    amount: '',
    invoiceNumber: '',
    fileName: ''
  });
  const [refundIsSubmitting, setRefundIsSubmitting] = useState(false);
  const [refundAlert, setRefundAlert] = useState('');

  // Form states for creating authorization
  const [newAuth, setNewAuth] = useState({
    patient: 'Carlos Ramos Valdiviezo',
    procedure: 'Radiografía de Tórax',
    facility: 'Hospital Metropolitano',
    fileName: '',
    clinicalNote: ''
  });
  const [authIsSubmitting, setAuthIsSubmitting] = useState(false);
  const [authAlert, setAuthAlert] = useState('');

  // Chat Triage states
  const [triageStep, setTriageStep] = useState<0 | 1 | 2 | 3>(0);
  const [symptoms, setSymptoms] = useState('');
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<any>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Código corporativo o clave inválida.');
    }
  };

  const submitRefundRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefund.amount || !newRefund.invoiceNumber) {
      setRefundAlert('Por favor ingrese el monto y el número de factura.');
      return;
    }

    setRefundIsSubmitting(true);
    setRefundAlert('');

    // Simulate approval and ledger addition
    setTimeout(() => {
      addRefund({
        familyMember: newRefund.familyMember,
        specialty: newRefund.specialty,
        amount: Number(newRefund.amount),
        status: 'Procesando',
        invoiceNumber: newRefund.invoiceNumber
      });

      setRefundIsSubmitting(false);
      setNewRefund({
        familyMember: 'Carlos Ramos Valdiviezo',
        specialty: 'Pediatría',
        amount: '',
        invoiceNumber: '',
        fileName: ''
      });
      setRefundAlert('¡Solicitud de reembolso ingresada con éxito! Pendiente de aprobación por auditoría médica (Ver estado abajo).');
    }, 1500);
  };

  const submitAuthRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuth.procedure || !newAuth.clinicalNote) {
      setAuthAlert('Describa el procedimiento e ingrese la orden médica.');
      return;
    }
    setAuthIsSubmitting(true);
    setAuthAlert('');

    setTimeout(() => {
      addAuthorization({
        patient: newAuth.patient,
        procedure: newAuth.procedure,
        facility: newAuth.facility,
        status: 'Pendiente'
      });

      setAuthIsSubmitting(false);
      setNewAuth({
        patient: 'Carlos Ramos Valdiviezo',
        procedure: 'Radiografía de Tórax',
        facility: 'Hospital Metropolitano',
        fileName: '',
        clinicalNote: ''
      });
      setAuthAlert('¡Procedimiento médico enviado a auditoría de Colmedical! Código en trámite; recibirás el dictamen de inmediato.');
    }, 1200);
  };


  const handleTriageQuery = (symptomKey: string) => {
    setTriageLoading(true);
    setTimeout(() => {
      let result = {
        level: 'Verde - No Urgente',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        advice: 'Tus síntomas sugieren una afección estacional menor. Se recomienda telemedicina remota.',
        specialist: 'Medicina General o Pediatría',
        hospital: 'Telemedicial VIP Colmedical / Farmacia en red'
      };

      if (symptomKey === 'chest_pain') {
        result = {
          level: 'Rojo - EMERGENCIA CRÍTICA',
          color: 'text-red-750 bg-red-50 border-red-150',
          advice: 'Dolores pectorales u opresión severa requieren inmediato chequeo físico presencial.',
          specialist: 'Cardiólogo e Intensivista',
          hospital: 'Sala de Emergencia - Hospital Metropolitano (Quito) o Clínica Kennedy (Gye)'
        };
      } else if (symptomKey === 'fever_child') {
        result = {
          level: 'Amarillo - Atención Prioritaria',
          color: 'text-amber-700 bg-amber-50 border-amber-150',
          advice: 'Fiebre persistente en menores de 8 años requiere control oportuno en menos de 12 horas.',
          specialist: 'Pediatra Tratante',
          clinic: 'Clínica San Francisco (UIO) o Clínica Santa Inés (Cuenca)'
        } as any;
      }

      setTriageResult(result);
      setTriageLoading(false);
      setTriageStep(2);
    }, 1200);
  };

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedical-portal-view">
      
      {!isLoggedIn ? (
        /* LOGIN PANEL WITH DEMO BYPASS */
        <section className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden" id="portal-login-screen">
          <div className="bg-slate-900 p-8 text-center text-white relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-teal-500/10 to-indigo-650/15"></div>
            <div className="w-12 h-12 bg-teal-500 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-teal-500/10 scale-102">
              <Lock className="w-5.5 h-5.5" />
            </div>
            <h2 className="text-2xl font-bold font-display">Oficina Virtual Afiliados</h2>
            <p className="text-xs text-slate-400 mt-1">Ingresa para realizar trámites inmediatos y vigilar tus coberturas</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-650 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Email registrado o Cuenta:</label>
                <input 
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-teal-555 font-mono text-center"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Clave de Seguridad:</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-teal-555 font-mono text-center"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <label className="flex items-center gap-1.5 text-slate-500">
                <input type="checkbox" defaultChecked className="accent-teal-500 rounded" />
                <span>Recordar sesión</span>
              </label>
              <a href="#reset" onClick={(e) => { e.preventDefault(); alert("Contacto telefónico de soporte para recuperación: 1800-COLMED"); }} className="text-indigo-650 font-semibold hover:underline">
                ¿Olvidaste tu clave?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
              id="btn-login"
            >
              Iniciar Sesión Seguro
            </button>

            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400">
                ¿No eres afiliado activo? <button onClick={() => setCurrentPage('cotizador')} className="text-teal-650 font-bold hover:underline cursor-pointer">Cotiza un plan médico aquí</button>
              </p>
            </div>
          </form>
        </section>
      ) : (
        /* PORTAL AREA (IS LOGGED IN) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start align-stretch" id="portal-affiliate-area">
          
          {/* A. SIDENAV TAB CONTROLLER */}
          <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Minimal Affiliate avatar info */}
            <div className="flex gap-3.5 items-center pb-4 border-b border-slate-100">
              <div className="w-11 h-11 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-bold font-display text-lg">
                CR
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 truncate max-w-[150px]" title={userProfile.name}>{userProfile.name}</h4>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">ID: {userProfile.cardId}</span>
                </div>
              </div>
            </div>

            {/* Menu Nav Links */}
            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab('dash')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl transition-all text-left ${
                  activeTab === 'dash'
                    ? 'bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white shadow-sm'
                    : 'text-slate-650 hover:bg-slate-50'
                }`}
                id="portal-tab-dash"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4.5 h-4.5 shrink-0" />
                  <span>Resumen de Póliza</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('carnet')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl transition-all text-left ${
                  activeTab === 'carnet'
                    ? 'bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white shadow-sm'
                    : 'text-slate-650 hover:bg-slate-50'
                }`}
                id="portal-tab-carnet"
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-4.5 h-4.5 shrink-0" />
                  <span>Carné Digital Familiar</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('reembolsos')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl transition-all text-left ${
                  activeTab === 'reembolsos'
                    ? 'bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white shadow-sm'
                    : 'text-slate-655 hover:bg-slate-50'
                }`}
                id="portal-tab-reembolsos"
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4.5 h-4.5 shrink-0" />
                  <span>Solicitar Reembolso</span>
                </div>
                <span className="bg-teal-50 text-teal-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold font-sans">90%</span>
              </button>

              <button
                onClick={() => setActiveTab('autorizaciones')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl transition-all text-left ${
                  activeTab === 'autorizaciones'
                    ? 'bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white shadow-sm'
                    : 'text-slate-650 hover:bg-slate-50'
                }`}
                id="portal-tab-autorizaciones"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4.5 h-4.5 shrink-0" />
                  <span>Autorizaciones Médicas</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('triage')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl transition-all text-left ${
                  activeTab === 'triage'
                    ? 'bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white shadow-sm'
                    : 'text-slate-650 hover:bg-slate-50'
                }`}
                id="portal-tab-triage"
              >
                <div className="flex items-center gap-2.5">
                  <HeartPulse className="w-4.5 h-4.5 shrink-0 animate-bounce" />
                  <span>Triage de Síntomas AI</span>
                </div>
                <span className="bg-rose-50 text-rose-700 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider font-sans">Nuevo</span>
              </button>
            </nav>

            <button
              onClick={() => setIsLoggedIn(false)}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-650 font-bold hover:bg-red-50 transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer mt-12"
              id="btn-logout"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Cerrar Oficina Virtual</span>
            </button>

          </div>

          {/* B. MAIN TAB FRAME CONTENT */}
          <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
            
            {/* B1: DASHBOARD SUMMARY */}
            {activeTab === 'dash' && (
              <div className="space-y-8 animate-in fade-in duration-200" id="portal-panel-dashboard">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bienvenido Afiliado</span>
                    <h2 className="text-2xl font-bold font-display text-slate-900">{userProfile.name}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Póliza Vigente: <strong className="text-slate-800">{userProfile.planName}</strong>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-teal-50 text-teal-800 px-3.5 py-2 rounded-xl border border-teal-100 text-xs font-semibold inline-fit">
                    <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                    <span>Póliza Activa al día</span>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Cobertura */}
                  <div className="p-4 p-5 bg-gradient-to-tr from-slate-50 to-teal-50/20 rounded-2xl border border-slate-150 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gimnasio y Dental</span>
                    <span className="block text-xl font-bold text-teal-700">Incluido (100%)</span>
                    <p className="text-[10px] text-slate-500">Beneficios complementarios activos.</p>
                  </div>

                  {/* Reembolsos pagados */}
                  <div className="p-4 p-5 bg-gradient-to-tr from-slate-50 to-indigo-50/20 rounded-2xl border border-slate-150 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reembolsos Procesados</span>
                    <span className="block text-xl font-bold text-indigo-700">$95.00 USD</span>
                    <p className="text-[10px] text-slate-500">Últimos 30 días calendario.</p>
                  </div>

                  {/* Auto autorizadas */}
                  <div className="p-4 p-5 bg-gradient-to-tr from-slate-50 to-emerald-50/20 rounded-2xl border border-slate-150 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Autorizaciones Emitidas</span>
                    <span className="block text-xl font-bold text-emerald-700">{authorizations.length} Aprobados</span>
                    <p className="text-[10px] text-slate-500">Disponibles para clínicas.</p>
                  </div>
                </div>

                {/* Quick actions row */}
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-950 font-sans flex items-center gap-2">
                    <Bell className="w-4.5 h-4.5 text-indigo-600 animate-swing" />
                    <span>¿Necesitas una Consulta Médica de Emergencia?</span>
                  </h4>
                  <p className="text-xs text-indigo-800 leading-relaxed">
                    Utiliza la videoconsulta inmediata de telemedicina para que un especialista general evalúe tus síntomas en red en menos de 5 minutos, totalmente gratis y sin copagos adicionales.
                  </p>
                  <button
                    onClick={() => setActiveTab('triage')}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Iniciar Telemedicina Express</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* List of family members */}
                <div className="space-y-3 pt-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Grupo Familiar Asegurado</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {userProfile.familyGroup.map((fam, idx) => (
                      <div key={idx} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                          {fam.name[0]}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-900">{fam.name}</span>
                          <span className="block text-[10px] text-slate-500">{fam.relationship}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* B2: CARNET DIGITAL */}
            {activeTab === 'carnet' && (
              <div className="space-y-8 animate-in fade-in duration-200" id="portal-panel-carnet">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <QrCode className="w-6 h-6 text-teal-600" />
                    <span>Carné Digital de Medicina Prepagada</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Presenta este documento virtual en recepción de clínicas asociadas y laboratorios para que apliquen tu copago preferencial directo.
                  </p>
                </div>

                {/* Real simulated Card with layout */}
                <div className="max-w-md mx-auto bg-gradient-to-tr from-slate-900 via-teal-950 to-indigo-950 rounded-3xl text-white p-6 shadow-2xl relative overflow-hidden aspect-[1.6/1] flex flex-col justify-between border border-teal-500/20">
                  <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-teal-500/15 blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-indigo-500/10 blur-2xl"></div>

                  <div className="flex justify-between items-start z-10 relative">
                    <div className="space-y-0.5">
                      <span className="text-xl font-display font-bold tracking-tight bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">Colmedical</span>
                      <span className="block text-[8px] font-mono tracking-widest text-teal-300 font-bold uppercase">Medicina Prepagada</span>
                    </div>

                    <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-center font-mono">
                      <span className="block text-[7px] text-slate-350 uppercase">Copago Fijo</span>
                      <span className="text-[11px] font-bold text-white">15% Consulta</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 z-10 relative">
                    <span className="block text-[8px] text-teal-450 uppercase tracking-widest font-bold">Asegurado Titular</span>
                    <h3 className="text-lg font-bold font-sans tracking-wide leading-tight">{userProfile.name}</h3>
                    <div className="flex justify-between text-[11px] font-mono text-slate-350 bg-white/5 px-3 py-1.5 rounded-lg">
                      <span>Cél: {userProfile.cardId}</span>
                      <span>Plan: Colmedikal Esencial</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end z-10 relative border-t border-white/10 pt-3">
                    <div className="space-y-0.5 text-[10px] font-mono">
                      <span className="text-slate-400 block text-[8px] uppercase">Vencimiento</span>
                      <span className="text-slate-200 font-semibold">{userProfile.validUntil}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white p-1 rounded-md">
                      <QrCode className="w-8 h-8 text-slate-900" />
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2 space-y-3">
                  <span className="text-xs text-slate-600 block">
                    ¿Quieres ver el carné de un familiar integrante del plan?
                  </span>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {userProfile.familyGroup.map((fam, idx) => (
                      <button
                        key={idx}
                        onClick={() => alert(`Cargando credencial familiar para: ${fam.name}`)}
                        className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        {fam.relationship}: {fam.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* B3: SOLICITAR REEMBOLSOS */}
            {activeTab === 'reembolsos' && (
              <div className="space-y-8 animate-in fade-in duration-200" id="portal-panel-reembolsos">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-teal-600" />
                    <span>Ingreso Digital de Reembolsos</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Carga los datos de tu factura comercial autorizada por el SRI y tus prescripciones para reembolsar honorarios médicos en menos de 48 horas.
                  </p>
                </div>

                {refundAlert && (
                  <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs rounded-xl flex items-center gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{refundAlert}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Refund Intake form */}
                  <form onSubmit={submitRefundRequest} className="lg:col-span-5 space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nueva Solicitud</span>

                    {/* Member select */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">Paciente Atendido:</label>
                      <select 
                        value={newRefund.familyMember}
                        onChange={(e) => setNewRefund({...newRefund, familyMember: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="Carlos Ramos Valdiviezo">Carlos Ramos (Titular)</option>
                        {userProfile.familyGroup.map((f, i) => (
                          <option key={i} value={f.name}>{f.name} ({f.relationship})</option>
                        ))}
                      </select>
                    </div>

                    {/* Speciality */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">Especialidad:</label>
                      <select 
                        value={newRefund.specialty}
                        onChange={(e) => setNewRefund({...newRefund, specialty: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="Pediatría">Pediatría y Neonatología</option>
                        <option value="Cardiología">Cardiología</option>
                        <option value="Ginecología">Ginecología</option>
                        <option value="Osteopatía">Osteopatía / Traumatología</option>
                        <option value="Odontología">Odontología</option>
                        <option value="Dermatología">Dermatología</option>
                      </select>
                    </div>

                    {/* Invoice Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">N° Factura (SRI):</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ej. 001-002-145"
                          value={newRefund.invoiceNumber}
                          onChange={(e) => setNewRefund({...newRefund, invoiceNumber: e.target.value})}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Valor Total Facturado:</label>
                        <input 
                          type="number"
                          required
                          min="1"
                          max="2000"
                          placeholder="Monto $' USD"
                          value={newRefund.amount}
                          onChange={(e) => setNewRefund({...newRefund, amount: e.target.value})}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-center"
                        />
                      </div>
                    </div>

                    {/* Drag & drop mock receipt */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">Cargar PDF Factura o Receta:</label>
                      
                      <div 
                        onClick={() => setNewRefund({...newRefund, fileName: 'factura_medica_sri.pdf'})}
                        className="bg-white border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-4 text-center cursor-pointer transition-colors"
                      >
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-500 block truncate font-medium">
                          {newRefund.fileName || 'Haz clic para seleccionar o soltar archivo'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={refundIsSubmitting}
                      className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      {refundIsSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Auditoriando Facturas...</span>
                        </>
                      ) : (
                        <span>Ingresar Reembolso Electrónico</span>
                      )}
                    </button>
                  </form>

                  {/* Refunds list ledger */}
                  <div className="lg:col-span-7 space-y-4">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historial de Honorarios Ingresados</span>
                    
                    <div className="space-y-3.5">
                      {refunds.map((ref) => (
                        <div key={ref.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="inline-block bg-slate-100 text-slate-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                {ref.id}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 mt-1">{ref.familyMember}</h4>
                              <p className="text-[10px] text-slate-500">{ref.specialty} - Factura: {ref.invoiceNumber}</p>
                            </div>

                            <div className="text-right space-y-1">
                              <span className="text-sm font-bold text-slate-900 font-mono">${ref.amount.toFixed(2)}</span>
                              <span className={`block text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider font-sans border text-center ${
                                ref.status === 'Reembolsado' 
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
                                  : 'text-indigo-700 bg-indigo-50 border-indigo-100'
                              }`}>
                                {ref.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-[10px] text-slate-400 border-t border-slate-50 pt-2 flex justify-between">
                            <span>Ingresado el: {ref.refundDate}</span>
                            <span>Valor Aprobado (90%): <strong>${(ref.amount * 0.9).toFixed(2)}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* B4: AUTORIZACIONES */}
            {activeTab === 'autorizaciones' && (
              <div className="space-y-8 animate-in fade-in duration-200" id="portal-panel-autorizaciones">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-teal-600" />
                    <span>Gestión de Autorizaciones Médicas</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Envíanos tu orden médica programada para cirugías, exámenes de imagen médica diagnóstica o laboratorios. Recibe tu código de respuesta en menos de 4 horas hábiles.
                  </p>
                </div>

                {authAlert && (
                  <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs rounded-xl flex items-center gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{authAlert}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Authorization Application Intake */}
                  <form onSubmit={submitAuthRequest} className="lg:col-span-5 space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Crear Autorización</span>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">Paciente:</label>
                      <select 
                        value={newAuth.patient}
                        onChange={(e) => setNewAuth({...newAuth, patient: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="Carlos Ramos Valdiviezo">Carlos Ramos (Titular)</option>
                        {userProfile.familyGroup.map((f, i) => (
                          <option key={i} value={f.name}>{f.name} ({f.relationship})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">Procedimiento / Examen:</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ej. Resonancia Magnética de Cerebro, Ecocardiograma..."
                        value={newAuth.procedure}
                        onChange={(e) => setNewAuth({...newAuth, procedure: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">Clínica Preestablecida de Convenio:</label>
                      <select 
                        value={newAuth.facility}
                        onChange={(e) => setNewAuth({...newAuth, facility: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="Hospital Metropolitano">Hospital Metropolitano (UIO)</option>
                        <option value="Clínica San Francisco">Clínica San Francisco (UIO)</option>
                        <option value="Clínica Kennedy">Clínica Kennedy (GYE)</option>
                        <option value="Hospital Alcívar">Hospital Alcívar (GYE)</option>
                        <option value="Clínica Santa Inés">Clínica Santa Inés (Cue)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">Diagnóstico médico u Orden Médica textual:</label>
                      <textarea 
                        rows={3}
                        required
                        placeholder="Escriba el diagnóstico del especialista e indicación médica..."
                        value={newAuth.clinicalNote}
                        onChange={(e) => setNewAuth({...newAuth, clinicalNote: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authIsSubmitting}
                      className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      {authIsSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Emitiendo Autorización...</span>
                        </>
                      ) : (
                        <span>Enviar para Autorización</span>
                      )}
                    </button>
                  </form>

                  {/* Ledger of authorizations */}
                  <div className="lg:col-span-7 space-y-4">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historial de Autorizaciones Activas</span>
                    
                    <div className="space-y-3.5">
                      {authorizations.map((auth) => (
                        <div key={auth.id} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="inline-block bg-slate-150 text-slate-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                                {auth.id}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 mt-1">{auth.patient}</h4>
                              <p className="text-[11px] text-slate-600 font-medium">{auth.procedure}</p>
                              <p className="text-[10px] text-slate-500">Destino: {auth.facility}</p>
                            </div>

                            <span className={`block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 font-sans border shrink-0 ${
                              auth.status === 'Aprobado'
                                ? 'text-emerald-800 bg-emerald-50 border-emerald-100'
                                : auth.status === 'Rechazado'
                                ? 'text-rose-800 bg-rose-50 border-rose-100'
                                : 'text-amber-800 bg-amber-50 border-amber-100'
                            }`}>
                              <FileCheck className="w-3.5 h-3.5" /> {auth.status}
                            </span>
                          </div>

                          {auth.adminComment && (
                            <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg text-[10px] text-slate-600 leading-relaxed">
                              <strong>Nota Auditada:</strong> {auth.adminComment}
                            </div>
                          )}

                          <div className="text-[9px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between items-center font-mono">
                            <span>Solicitado: {auth.requestDate}</span>
                            <span className="text-indigo-600 font-bold">Oficina de Trámites Colmedical</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* B5: TRIAGE DECISION ENGINE (AI SYMPTOM CHECKER) */}
            {activeTab === 'triage' && (
              <div className="space-y-8 animate-in fade-in duration-200" id="portal-panel-triage">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <HeartPulse className="w-6 h-6 text-rose-500 animate-pulse animate-bounce" />
                    <span>Simulador de Triage y Sintomatología AI</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Nuestro sistema clínico de pre-evaluación te guía indicando qué nivel de gravedad estiman tus síntomas y qué tipo de especialista te sugerimos agendar directamente.
                  </p>
                </div>

                {triageStep === 0 && (
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-150 text-center space-y-5 max-w-xl mx-auto">
                    <Stethoscope className="w-12 h-12 text-teal-600 mx-auto" />
                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-slate-900">¿Cómo te sientes hoy?</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal">
                        Declara de inmediato cuál es la molestia principal que presencias en ti o tus familiares para iniciar el triage automatizado de seguridad.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handleTriageQuery('gripe_fever')}
                        className="p-3 bg-white hover:border-teal-400 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex flex-col items-center gap-1 hover:bg-slate-50 cursor-pointer"
                      >
                        <span className="text-base">🤒</span>
                        <span>Fiebre o Gripe Común</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriageQuery('fever_child')}
                        className="p-3 bg-white hover:border-teal-400 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex flex-col items-center gap-1 hover:bg-slate-50 cursor-pointer"
                      >
                        <span className="text-base">👶</span>
                        <span>Fiebre en Niño Pequeño</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriageQuery('chest_pain')}
                        className="p-3 bg-white hover:border-teal-400 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex flex-col items-center gap-1 hover:bg-slate-50 cursor-pointer"
                      >
                        <span className="text-base">💔</span>
                        <span>Dolor de Pecho u Opresión</span>
                      </button>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] text-slate-450 block leading-relaxed">
                        ⚠️ <strong>AVISO LEGAL CLÍNICO:</strong> El simulador de triage es un evaluador preliminar informativo simplificado. No sustituye el diagnóstico clínico presencial de un profesional matriculado ni debe retrasar la asistencia ante emergencias reales.
                      </span >
                    </div>
                  </div>
                )}

                {triageLoading && (
                  <div className="text-center py-12 space-y-4">
                    <Clock className="w-10 h-10 text-teal-600 animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-slate-500">Analizando sintomatología clínica e historial de la red médica de Colmedical...</p>
                  </div>
                )}

                {triageStep === 2 && triageResult && (
                  <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95" id="triage-output-panel">
                    
                    {/* Level representation card */}
                    <div className={`p-5 rounded-2xl border ${triageResult.color} flex items-start gap-4`}>
                      <Activity className="w-8 h-8 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Nivel de Gravedad Asignado</span>
                        <h4 className="text-lg font-bold mt-0.5">{triageResult.level}</h4>
                        <p className="text-xs leading-relaxed mt-2">{triageResult.advice}</p>
                      </div>
                    </div>

                    {/* Next step recommendation details */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-250 space-y-4 text-xs select-none">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Guía de Acción y Cuidado Sugerido:</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-xl border border-slate-150">
                          <span className="text-slate-400 block text-[9px] font-bold uppercase">Especialista Recomendado:</span>
                          <span className="font-semibold text-slate-800 text-sm block mt-0.5">{triageResult.specialist}</span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-150">
                          <span className="text-slate-400 block text-[9px] font-bold uppercase">Prestador o Centro en Red Sugerido:</span>
                          <span className="font-semibold text-slate-800 text-sm block mt-0.5">{triageResult.hospital || triageResult.clinic}</span>
                        </div>
                      </div>

                      <div className="bg-teal-500/10 p-3.5 rounded-xl border border-teal-200 flex justify-between items-center text-[11px] text-teal-900 font-medium">
                        <span>¿Quieres agendar consulta directa con un médico en red de esta especialidad?</span>
                        <button
                          onClick={() => setCurrentPage('directorio')}
                          className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Ir al Directorio Médico
                        </button>
                      </div>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={() => setTriageStep(0)}
                        className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Reiniciar Simulador de triage
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
