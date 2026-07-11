import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  ShieldCheck, 
  QrCode, 
  DollarSign,
  Clock,
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
  HeartPulse,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Check,
  X
} from 'lucide-react';
import { Page } from '../types';
import { useColmedikal } from '../context/ColmedikalContext';
import AgendamientoCitas from './AgendamientoCitas';

interface PortalAfiliadosProps {
  setCurrentPage: (page: Page) => void;
}

interface Member {
  name: string;
  relationship: string;
  cardId: string;
}

// Plan details — duplicated from Cotizador.tsx's plansComparativo (same
// duplication-over-shared-module pattern already used for specialties/cities
// across this codebase) since there's no real contract/PDF system to link to.
// Kept field-for-field identical so the portal's plan modal matches the
// Cotizador one exactly.
const PLAN_DETAILS: Record<string, {
  name: string;
  cobertura: string;
  dedHosp: string;
  maternidad: string;
  muerteAccidente: string;
  sepelio: string;
  ambulancia: string;
  especialidades: Record<string, boolean>;
  caracteristicas: string[];
}> = {
  inicio: {
    name: 'Plan Inicio 2K',
    cobertura: '$2.000,00 USD Anual',
    dedHosp: '$40,00 USD Anual',
    maternidad: '$250,00 USD',
    muerteAccidente: '$1.500,00 USD',
    sepelio: '$500,00 USD',
    ambulancia: '$200,00 USD',
    especialidades: {
      'Medicina General': true,
      'Medicina Familiar': true,
      'Ginecología': true,
      'Gastroenterología': true,
      'Urología': false,
      'Traumatología': false,
      'Medicina Interna': false,
      'Cardiología': false,
      'Odontología (6 proced./año)': true,
    },
    caracteristicas: [
      'Entrega de medicina al 100% (Sin costo ni copago)',
      'Especialidades: Medicina General, Familiar, Ginecología y Odontología',
      'Telemedicina sin carencia (activa desde el primer día)',
      'Odontología (Consultas, profilaxis, restauraciones resina)',
    ],
  },
  proteccion: {
    name: 'Plan Protección 3K',
    cobertura: '$3.000,00 USD Anual',
    dedHosp: '$40,00 USD Anual',
    maternidad: '$500,00 USD',
    muerteAccidente: '$2.500,00 USD',
    sepelio: '$500,00 USD',
    ambulancia: '$200,00 USD',
    especialidades: {
      'Medicina General': true,
      'Medicina Familiar': true,
      'Ginecología': true,
      'Gastroenterología': true,
      'Urología': true,
      'Traumatología': true,
      'Medicina Interna': false,
      'Cardiología': false,
      'Odontología (6 proced./año)': true,
    },
    caracteristicas: [
      'Especialidades: Incluye Urología y Traumatología',
      'Telemedicina ilimitada sin carencia (activa desde el primer día)',
      'Bono de Maternidad de $500,00 para titular',
      'Entrega de medicina al 100% sin copago',
      'Soporte a cirugías programadas preautorizadas',
    ],
  },
  plus: {
    name: 'Plan Plus 5K',
    cobertura: '$5.000,00 USD Anual',
    dedHosp: '$40,00 USD Anual',
    maternidad: '$700,00 USD',
    muerteAccidente: '$3.500,00 USD',
    sepelio: '$800,00 USD',
    ambulancia: '$200,00 USD',
    especialidades: {
      'Medicina General': true,
      'Medicina Familiar': true,
      'Ginecología': true,
      'Gastroenterología': true,
      'Urología': true,
      'Traumatología': true,
      'Medicina Interna': true,
      'Cardiología': true,
      'Odontología (6 proced./año)': true,
    },
    caracteristicas: [
      'Especialidades: Medicina Interna, Cardiología y Odontología premium',
      'Telemedicina ilimitada sin carencia (activa desde el primer día)',
      'Bono de Maternidad premium de $700,00 USD',
      'Límite de Gastos Hospitalarios de $5.000,00 USD',
      'Exámenes de lab e imágenes diagnósticas: $100 totales (ambos incluidos)',
    ],
  },
};

// Parses "$5.000,00 USD Anual" style strings (Latin thousands/decimal
// separators) into a plain number, for the reembolsos progress bar.
// ponytail: string-parsing a display value instead of a real numeric cap
// field — fine since it's just a visual approximation of "cuánto llevas
// usado de tu cobertura", not a billing-accurate figure.
const parseCoberturaAmount = (s?: string): number | null => {
  if (!s) return null;
  const n = Number(s.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
};

// Same province list as Cotizador.tsx (duplicated — same pattern as
// specialties/cities elsewhere in this codebase).
const PROVINCES = [
  'Pichincha (Quito, etc.)', 'Guayas (Guayaquil, etc.)', 'Azuay (Cuenca, etc.)',
  'Manabí (Manta, Portoviejo)', 'Loja', 'Tungurahua (Ambato)', 'El Oro (Machala)',
  'Imbabura (Ibarra)', 'Santo Domingo de los Tsáchilas', 'Santa Elena', 'Los Ríos',
  'Esmeraldas', 'Chimborazo (Riobamba)', 'Cotopaxi (Latacunga)', 'Carchi', 'Bolívar',
  'Cañar', 'Galápagos', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza',
  'Sucumbíos', 'Zamora Chinchipe',
];

interface AddressFormState {
  province: string;
  city: string;
  address1: string;
  address2: string;
  postalCode: string;
}
const EMPTY_ADDRESS: AddressFormState = { province: '', city: '', address1: '', address2: '', postalCode: '' };

// Shared by the "Mis Datos y Plan" tab and the mandatory first-login modal.
function AddressFormFields({ value, onChange }: { value: AddressFormState; onChange: (v: AddressFormState) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-slate-700">Provincia: *</label>
        <select
          value={value.province}
          onChange={(e) => onChange({ ...value, province: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
        >
          <option value="">Selecciona...</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-slate-700">Ciudad: *</label>
        <input
          type="text"
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          placeholder="Ej. Quito"
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className="block text-[11px] font-semibold text-slate-700">Dirección 1: *</label>
        <input
          type="text"
          value={value.address1}
          onChange={(e) => onChange({ ...value, address1: e.target.value })}
          placeholder="Calle principal y secundaria, número"
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className="block text-[11px] font-semibold text-slate-700">Dirección 2 (opcional):</label>
        <input
          type="text"
          value={value.address2}
          onChange={(e) => onChange({ ...value, address2: e.target.value })}
          placeholder="Referencia, edificio, conjunto..."
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-slate-700">Código Postal: *</label>
        <input
          type="text"
          value={value.postalCode}
          onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
          placeholder="Ej. 170150"
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
        />
      </div>
    </div>
  );
}

export default function PortalAfiliados({ setCurrentPage }: PortalAfiliadosProps) {
  const { addRefund } = useColmedikal();

  const [activeTab, setActiveTab] = useState<'dash' | 'carnet' | 'reembolsos' | 'triage' | 'agendamiento' | 'datos'>('dash');

  // Top bar: avatar dropdown + notification bell. The "seen" count is a
  // simple per-client localStorage marker — not a real read/unread system,
  // just enough to show "something changed since your last visit".
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [seenUpdatesCount, setSeenUpdatesCount] = useState(0);

  // Real cédula + password login against /api/portal/login (server.ts)
  const [portalToken, setPortalToken] = useState<string | null>(() => sessionStorage.getItem('colmedikal_portal_token'));
  const isLoggedIn = !!portalToken;
  const [docNumberInput, setDocNumberInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Real profile + dashboard data (refunds/authorizations/appointments), loaded after login
  const [profile, setProfile] = useState<any | null>(null);
  const [portalData, setPortalData] = useState<{ refunds: any[]; authorizations: any[]; appointments: any[] }>({ refunds: [], authorizations: [], appointments: [] });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const refreshPortalDashboard = async () => {
    if (!portalToken) return;
    try {
      const res = await fetch('/api/portal/dashboard', { headers: { Authorization: `Bearer ${portalToken}` } });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) setPortalData(json.data);
    } catch { /* keep previous data on failure */ }
  };

  useEffect(() => {
    if (!portalToken) return;
    let cancelled = false;
    (async () => {
      setProfileLoading(true);
      setProfileError('');
      try {
        const headers = { Authorization: `Bearer ${portalToken}` };
        const [meRes, dashRes] = await Promise.all([
          fetch('/api/portal/me', { headers }),
          fetch('/api/portal/dashboard', { headers }),
        ]);
        const meJson = await meRes.json().catch(() => ({}));
        const dashJson = await dashRes.json().catch(() => ({}));
        if (!meRes.ok || !meJson.success) throw new Error(meJson.message || 'Sesión expirada, ingresa de nuevo.');
        if (cancelled) return;
        setProfile(meJson.data);
        setPortalData(dashJson.success ? dashJson.data : { refunds: [], authorizations: [], appointments: [] });
      } catch (err) {
        if (cancelled) return;
        setProfileError(err instanceof Error ? err.message : 'No se pudo cargar tu información.');
        sessionStorage.removeItem('colmedikal_portal_token');
        setPortalToken(null);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [portalToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docNumber: docNumberInput, password: passwordInput }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.success) {
        setLoginError(result.message || 'Cédula o contraseña incorrecta.');
        return;
      }
      sessionStorage.setItem('colmedikal_portal_token', result.token);
      setPortalToken(result.token);
    } catch {
      setLoginError('No se pudo conectar con el portal. Intenta de nuevo.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('colmedikal_portal_token');
    setPortalToken(null);
    setProfile(null);
    setPortalData({ refunds: [], authorizations: [], appointments: [] });
    setActiveTab('dash');
  };

  // No per-dependent name data exists yet — only aggregate count/ages — so we
  // show honest placeholders instead of fabricating family member names.
  const familyMembers = useMemo(() => {
    if (!profile) return [] as { name: string; relationship: string }[];
    const count = profile.childrenCount || 0;
    const ages: number[] = profile.childrenAges || [];
    return Array.from({ length: count }, (_, i) => ({
      name: `Dependiente ${i + 1}`,
      relationship: ages[i] ? `${ages[i]} años` : 'Beneficiario',
    }));
  }, [profile]);

  // ponytail: no real billing/invoicing system exists yet, so "próximo pago"
  // is a heuristic — same day-of-month as the client's start date, next
  // occurrence from today. Upgrade to a real due-date once billing exists.
  const billingDates = useMemo(() => {
    if (!profile?.clientSince) return null;
    const since = new Date(profile.clientSince);
    if (isNaN(since.getTime())) return null;
    const today = new Date();
    const next = new Date(today.getFullYear(), today.getMonth(), since.getDate());
    if (next <= today) next.setMonth(next.getMonth() + 1);
    const fmt = (d: Date) => d.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
    return { since: fmt(since), next: fmt(next) };
  }, [profile?.clientSince]);

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  // Soonest upcoming appointment, for the "próxima cita" banner
  const nextAppointment = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return portalData.appointments
      .filter(a => a.aptDate >= today && a.status !== 'Cancelada')
      .sort((a, b) => a.aptDate.localeCompare(b.aptDate) || a.aptTime.localeCompare(b.aptTime))[0];
  }, [portalData.appointments]);

  // Notification bell — resolved refunds/appointments since last visit. Just
  // a "seen count" marker in localStorage, not a real read/unread system.
  useEffect(() => {
    if (!profile?.docNumber) return;
    const stored = Number(localStorage.getItem(`colmedikal_portal_seen_${profile.docNumber}`) || 0);
    setSeenUpdatesCount(stored);
  }, [profile?.docNumber]);

  const resolvedUpdatesCount = useMemo(() =>
    portalData.refunds.filter(r => r.status === 'Reembolsado').length +
    portalData.appointments.filter(a => a.status === 'Confirmada' || a.status === 'Completada').length,
  [portalData]);

  const hasUnseenUpdates = resolvedUpdatesCount > seenUpdatesCount;

  const markNotificationsSeen = () => {
    if (!profile?.docNumber) return;
    localStorage.setItem(`colmedikal_portal_seen_${profile.docNumber}`, String(resolvedUpdatesCount));
    setSeenUpdatesCount(resolvedUpdatesCount);
  };

  // Form states for creating refund
  const [newRefund, setNewRefund] = useState({
    familyMember: '',
    specialty: 'Pediatría',
    amount: '',
    invoiceNumber: '',
    fileName: ''
  });
  const [refundIsSubmitting, setRefundIsSubmitting] = useState(false);
  const [refundAlert, setRefundAlert] = useState('');

  // Keep the refund form defaulting to the real titular's name
  useEffect(() => {
    if (!profile?.fullName) return;
    setNewRefund(prev => ({ ...prev, familyMember: profile.fullName }));
  }, [profile?.fullName]);

  // Plan detail modal — same content/layout as Cotizador's, without the
  // "Contratar" CTA since this client is already contracted.
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Client-editable structured address (synced server-side, see /api/portal/address).
  // Mandatory on first login — the modal is forced open until addressComplete is true.
  const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressSaveMsg, setAddressSaveMsg] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setAddressForm({
      province: profile.address?.province || '',
      city: profile.address?.city || '',
      address1: profile.address?.address1 || '',
      address2: profile.address?.address2 || '',
      postalCode: profile.address?.postalCode || '',
    });
    setShowAddressModal(!profile.addressComplete);
  }, [profile]);

  const saveAddress = async () => {
    if (!portalToken) return;
    if (!addressForm.province || !addressForm.city || !addressForm.address1 || !addressForm.postalCode) {
      setAddressSaveMsg('Provincia, ciudad, Dirección 1 y código postal son obligatorios.');
      return;
    }
    setAddressSaving(true);
    setAddressSaveMsg('');
    try {
      const res = await fetch('/api/portal/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${portalToken}` },
        body: JSON.stringify(addressForm),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.success) throw new Error(result.message || 'No se pudo guardar');
      setProfile((prev: any) => prev ? { ...prev, address: result.address, addressComplete: true } : prev);
      setAddressSaveMsg('¡Dirección guardada!');
      setShowAddressModal(false);
    } catch (err) {
      setAddressSaveMsg(err instanceof Error ? err.message : 'No se pudo guardar la dirección.');
    } finally {
      setAddressSaving(false);
    }
  };

  // Chat Triage states
  const [triageStep, setTriageStep] = useState<0 | 1 | 2 | 3>(0);
  const [symptoms, setSymptoms] = useState('');
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<any>(null);

  const submitRefundRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefund.amount || !newRefund.invoiceNumber) {
      setRefundAlert('Por favor ingrese el monto y el número de factura.');
      return;
    }

    setRefundIsSubmitting(true);
    setRefundAlert('');

    setTimeout(async () => {
      await addRefund({
        familyMember: newRefund.familyMember,
        specialty: newRefund.specialty,
        amount: Number(newRefund.amount),
        status: 'Procesando',
        invoiceNumber: newRefund.invoiceNumber,
        userEmail: profile?.email,
        userPhone: profile?.phone,
      });
      await refreshPortalDashboard();

      setRefundIsSubmitting(false);
      setNewRefund({
        familyMember: profile?.fullName || '',
        specialty: 'Pediatría',
        amount: '',
        invoiceNumber: '',
        fileName: ''
      });
      setRefundAlert('¡Solicitud de reembolso ingresada con éxito! Pendiente de aprobación por auditoría médica (Ver estado abajo).');
    }, 1500);
  };



  const handleTriageQuery = (symptomKey: string) => {
    setTriageLoading(true);
    setTimeout(() => {
      let result = {
        level: 'Verde - No Urgente',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        advice: 'Tus síntomas sugieren una afección estacional menor. Se recomienda telemedicina remota.',
        specialist: 'Medicina General o Pediatría',
        hospital: 'Telemedicial VIP Colmedikal / Farmacia en red'
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
    <div className="min-h-screen bg-[#F4F7F9]">
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedikal-portal-view">

      {!isLoggedIn ? (
        /* LOGIN PANEL — cédula + contraseña real contra /api/portal/login */
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
                <label className="block text-xs font-semibold text-slate-700">Cédula:</label>
                <input
                  type="text"
                  value={docNumberInput}
                  onChange={(e) => setDocNumberInput(e.target.value)}
                  placeholder="Ej. 1712345678"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-teal-555 font-mono text-center"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Contraseña:</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-teal-555 font-mono text-center"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end text-[11px]">
              <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Para restablecer tu contraseña contacta a tu asesor Colmedikal: 02-2567191 o WhatsApp: 098 702 8756'); }} className="text-indigo-650 font-semibold hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-60"
              id="btn-login"
            >
              {isLoggingIn ? 'Ingresando...' : 'Iniciar Sesión Seguro'}
            </button>

            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400">
                ¿No eres afiliado activo? <button onClick={() => setCurrentPage('cotizador')} className="text-teal-650 font-bold hover:underline cursor-pointer">Cotiza un plan médico aquí</button>
              </p>
            </div>
          </form>
        </section>
      ) : !profile ? (
        /* Profile still loading (or failed and about to log out) */
        <section className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center space-y-3" id="portal-profile-loading">
          {profileLoading ? (
            <>
              <div className="w-8 h-8 border-2 border-slate-200 border-t-[#4597CA] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Cargando tu información...</p>
            </>
          ) : (
            <>
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
              <p className="text-xs text-red-600">{profileError || 'No se pudo cargar tu información.'}</p>
            </>
          )}
        </section>
      ) : (
        /* PORTAL AREA (IS LOGGED IN) */
        <>
        {/* Mandatory first-login address modal — blocks until Provincia/Ciudad/
            Dirección 1/Código Postal are completed; skipped automatically once
            addressComplete is true (no close button while incomplete). */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" id="mandatory-address-modal">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="bg-[#0C4169] text-white px-6 py-4 rounded-t-3xl">
                <p className="text-[10px] font-mono tracking-widest text-sky-300 uppercase">Paso obligatorio</p>
                <h3 className="text-lg font-black">Completa tu dirección</h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500">
                  Antes de continuar, necesitamos tu dirección para envíos de carné físico, correspondencia y verificación de cobertura por zona.
                </p>
                <AddressFormFields value={addressForm} onChange={setAddressForm} />
                {addressSaveMsg && (
                  <p className={`text-[11px] font-semibold ${addressSaveMsg.startsWith('¡') ? 'text-emerald-600' : 'text-red-600'}`}>{addressSaveMsg}</p>
                )}
                <button
                  onClick={saveAddress}
                  disabled={addressSaving}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  {addressSaving ? 'Guardando...' : 'Guardar y Continuar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOP BAR — logo/title + notification bell + avatar dropdown (with
            Cerrar sesión). Keeps the sidebar free of account chrome. */}
        <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-1">
          <div>
            <span className="text-lg font-black font-display text-[#0C4169]">Mi Colmedikal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => { markNotificationsSeen(); }}
                className="relative p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-colors"
                title="Notificaciones"
              >
                <Bell className="w-4.5 h-4.5 text-slate-500" />
                {hasUnseenUpdates && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
                )}
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setAvatarMenuOpen(v => !v)}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl pl-1.5 pr-3 py-1.5 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center font-bold font-display text-xs shrink-0">
                  {(profile.fullName || '?').trim().split(/\s+/).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                </div>
                <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{profile.fullName}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${avatarMenuOpen ? '-rotate-90' : 'rotate-90'}`} />
              </button>
              {avatarMenuOpen && (
                <>
                  <button className="fixed inset-0 z-10 cursor-default" onClick={() => setAvatarMenuOpen(false)} aria-label="Cerrar menú" />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 p-2 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{profile.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Cédula: {profile.docNumber}</p>
                      {profile.contractNumber && (
                        <p className="text-[10px] text-teal-700 font-mono font-bold">Contrato: {profile.contractNumber}</p>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-650 hover:bg-red-50 rounded-xl cursor-pointer transition-colors"
                      id="btn-logout"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Cerrar Oficina Virtual</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start align-stretch" id="portal-affiliate-area">

          {/* A. SIDENAV TAB CONTROLLER */}
          <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-6">

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
                onClick={() => setActiveTab('agendamiento')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl transition-all text-left ${
                  activeTab === 'agendamiento'
                    ? 'bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white shadow-sm'
                    : 'text-slate-650 hover:bg-slate-50'
                }`}
                id="portal-tab-agendamiento"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4.5 h-4.5 shrink-0" />
                  <span>Agendar Cita</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('datos')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl transition-all text-left ${
                  activeTab === 'datos'
                    ? 'bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white shadow-sm'
                    : 'text-slate-650 hover:bg-slate-50'
                }`}
                id="portal-tab-datos"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4.5 h-4.5 shrink-0" />
                  <span>Mis Datos y Plan</span>
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
                type="button"
                disabled
                title="Próximamente disponible"
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl text-left text-slate-350 cursor-not-allowed opacity-60"
                id="portal-tab-triage"
              >
                <div className="flex items-center gap-2.5">
                  <HeartPulse className="w-4.5 h-4.5 shrink-0" />
                  <span>Triage de Síntomas AI</span>
                </div>
                <span className="bg-sky-50 text-sky-700 border border-sky-100 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider font-sans">Próximamente</span>
              </button>
            </nav>

          </div>

          {/* B. MAIN TAB FRAME CONTENT */}
          <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
            
            {/* B1: DASHBOARD SUMMARY */}
            {activeTab === 'dash' && (
              <div className="space-y-8 animate-in fade-in duration-200" id="portal-panel-dashboard">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{greeting}</span>
                    <h2 className="text-2xl font-bold font-display text-slate-900">{profile.fullName.split(' ')[0]} 👋</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Plan: <strong className="text-slate-800">{(profile.selectedPlanName || 'Por confirmar con tu asesor').replace(/^Plan\s+/i, '')}</strong>
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    {profile.paymentStatus === 'Atrasado' ? (
                      <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3.5 py-2 rounded-xl border border-red-150 text-xs font-semibold inline-fit">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                        <span>Pago Atrasado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-teal-50 text-teal-800 px-3.5 py-2 rounded-xl border border-teal-100 text-xs font-semibold inline-fit">
                        <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                        <span>{profile.paymentStatus === 'Pagado' ? 'Póliza Activa al día' : 'Póliza Activa — Pago Pendiente'}</span>
                      </div>
                    )}
                    {billingDates && (
                      <p className="text-[10px] text-slate-400">Próximo pago: <strong className="text-slate-600">{billingDates.next}</strong></p>
                    )}
                  </div>
                </div>

                {/* Próxima cita destacada */}
                {nextAppointment && (
                  <div className="bg-gradient-to-r from-teal-600 to-[#0C4169] text-white p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
                      <Calendar className="w-5.5 h-5.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-teal-200 block">Tu próxima cita</span>
                      <p className="text-sm font-bold truncate">
                        {nextAppointment.specialty} — {nextAppointment.doctorName}
                      </p>
                      <p className="text-[11px] text-teal-100">
                        {new Date(nextAppointment.aptDate + 'T00:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {nextAppointment.aptTime ? ` · ${nextAppointment.aptTime}` : ''}
                        {nextAppointment.clinic ? ` · ${nextAppointment.clinic}` : ''}
                      </p>
                    </div>
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                      nextAppointment.status === 'Confirmada' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-amber-400/20 text-amber-100'
                    }`}>
                      {nextAppointment.status}
                    </span>
                  </div>
                )}

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Cliente desde */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2 hover-lift">
                    <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cliente Desde</span>
                    <span className="block text-xl font-bold text-teal-700">{billingDates?.since || '—'}</span>
                    <p className="text-[10px] text-slate-500">Fecha de afiliación a Colmedikal.</p>
                  </div>

                  {/* Reembolsos pagados */}
                  {(() => {
                    const totalRefunded = portalData.refunds.reduce((s, r) => s + Number(r.amount || 0), 0);
                    const cap = parseCoberturaAmount(PLAN_DETAILS[profile.basePlanId]?.cobertura);
                    const pct = cap ? Math.min(100, (totalRefunded / cap) * 100) : null;
                    return (
                      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2 hover-lift">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reembolsos Aprobados (90%)</span>
                        <span className="block text-xl font-bold text-indigo-700">
                          ${(totalRefunded * 0.9).toFixed(2)} USD
                        </span>
                        {pct !== null ? (
                          <>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-500">${totalRefunded.toFixed(0)} de ${cap?.toFixed(0)} de tu cobertura anual.</p>
                          </>
                        ) : (
                          <p className="text-[10px] text-slate-500">Sobre {portalData.refunds.length} solicitud(es) ingresada(s).</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Citas agendadas */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2 hover-lift">
                    <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Citas Agendadas</span>
                    <span className="block text-xl font-bold text-emerald-700">{portalData.appointments.length} Registradas</span>
                    <p className="text-[10px] text-slate-500">Ver histórico en "Mis Datos y Plan".</p>
                  </div>
                </div>

                {/* Quick actions — bento grid */}
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Accesos Rápidos</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { icon: Calendar, label: 'Agendar Cita', tab: 'agendamiento' as const, iconBg: 'bg-teal-50 text-teal-600' },
                      { icon: QrCode, label: 'Ver Carné', tab: 'carnet' as const, iconBg: 'bg-indigo-50 text-indigo-600' },
                      { icon: DollarSign, label: 'Solicitar Reembolso', tab: 'reembolsos' as const, iconBg: 'bg-emerald-50 text-emerald-600' },
                      { icon: User, label: 'Mis Datos y Plan', tab: 'datos' as const, iconBg: 'bg-sky-50 text-sky-600' },
                    ].map(({ icon: Icon, label, tab, iconBg }) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="hover-lift bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2 cursor-pointer"
                      >
                        <div className={`w-11 h-11 mx-auto rounded-2xl flex items-center justify-center ${iconBg}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="block text-[11px] font-bold text-slate-700 leading-tight">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* List of family members */}
                {familyMembers.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Grupo Familiar Asegurado</span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {familyMembers.map((fam, idx) => (
                        <div key={idx} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-900">{fam.name}</span>
                            <span className="block text-[10px] text-slate-500">{fam.relationship}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                      <span className="text-xl font-display font-bold tracking-tight bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">Colmedikal</span>
                      <span className="block text-[8px] font-mono tracking-widest text-teal-300 font-bold uppercase">Medicina Prepagada</span>
                    </div>

                    <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-center font-mono">
                      <span className="block text-[7px] text-slate-350 uppercase">Copago Fijo</span>
                      <span className="text-[11px] font-bold text-white">15% Consulta</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 z-10 relative">
                    <span className="block text-[8px] text-teal-450 uppercase tracking-widest font-bold">Asegurado Titular</span>
                    <h3 className="text-lg font-bold font-sans tracking-wide leading-tight">{profile.fullName}</h3>
                    <div className="flex justify-between text-[11px] font-mono text-slate-350 bg-white/5 px-3 py-1.5 rounded-lg">
                      <span>Cél: {profile.docNumber}</span>
                      <span>Plan: {(profile.selectedPlanName || 'Por confirmar').replace(/^Plan\s+/i, '')}</span>
                    </div>
                    {profile.contractNumber && (
                      <div className="text-[10px] font-mono text-teal-300 px-3">N° Contrato: {profile.contractNumber}</div>
                    )}
                  </div>

                  <div className="flex justify-between items-end z-10 relative border-t border-white/10 pt-3">
                    <div className="space-y-0.5 text-[10px] font-mono">
                      <span className="text-slate-400 block text-[8px] uppercase">Estado de Pago</span>
                      <span className="text-slate-200 font-semibold">{profile.paymentStatus || 'Pendiente'}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-md">
                      <QrCode className="w-8 h-8 text-slate-900" />
                    </div>
                  </div>
                </div>

                {familyMembers.length > 0 && (
                  <div className="text-center pt-2 space-y-3">
                    <span className="text-xs text-slate-600 block">
                      Beneficiarios adicionales en tu plan:
                    </span>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {familyMembers.map((fam, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                        >
                          {fam.relationship}: {fam.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
                        <option value={profile.fullName}>{profile.fullName} (Titular)</option>
                        {familyMembers.map((f, i) => (
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
                      {portalData.refunds.map((ref) => (
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
                              <span className="text-sm font-bold text-slate-900 font-mono">${Number(ref.amount || 0).toFixed(2)}</span>
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
                            <span>Valor Aprobado (90%): <strong>${(Number(ref.amount || 0) * 0.9).toFixed(2)}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* B4.5: AGENDAMIENTO EMBEBIDO — reuses AgendamientoCitas as-is; it
                shares the same sessionStorage portal token so it's already
                authenticated and nivel-filtered for this same client. */}
            {activeTab === 'agendamiento' && (
              <div className="-m-6 sm:-m-8 animate-in fade-in duration-200" id="portal-panel-agendamiento">
                <AgendamientoCitas setCurrentPage={setCurrentPage} embedded />
              </div>
            )}

            {/* B4.6: MIS DATOS Y PLAN — personal data, dependants, plan benefits,
                and appointment history (fetched by portalData.appointments but
                previously never shown anywhere). */}
            {activeTab === 'datos' && (
              <div className="space-y-8 animate-in fade-in duration-200" id="portal-panel-datos">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <User className="w-6 h-6 text-teal-600" />
                    <span>Mis Datos y Mi Plan</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Información de contacto, beneficiarios y detalle de cobertura de tu plan contratado.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.contractNumber && (
                    <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100 flex items-center gap-3 sm:col-span-2">
                      <QrCode className="w-4.5 h-4.5 text-teal-600 shrink-0" />
                      <div>
                        <span className="block text-[10px] font-bold text-teal-700 uppercase">Número de Contrato</span>
                        <span className="text-xs font-black text-teal-900 font-mono">{profile.contractNumber}</span>
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-150 flex items-center gap-3">
                    <Mail className="w-4.5 h-4.5 text-teal-600 shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Correo</span>
                      <span className="text-xs font-semibold text-slate-800">{profile.email || 'No registrado'}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-150 flex items-center gap-3">
                    <Phone className="w-4.5 h-4.5 text-teal-600 shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Teléfono</span>
                      <span className="text-xs font-semibold text-slate-800">{profile.phone || 'No registrado'}</span>
                    </div>
                  </div>
                </div>

                {/* Editable structured address — synced with the DB and visible in the AdminPanel */}
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-150 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5 text-teal-600 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Dirección</span>
                  </div>
                  <AddressFormFields value={addressForm} onChange={setAddressForm} />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={saveAddress}
                      disabled={addressSaving}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shrink-0"
                    >
                      {addressSaving ? 'Guardando...' : 'Guardar Dirección'}
                    </button>
                    {addressSaveMsg && (
                      <p className={`text-[10px] font-semibold ${addressSaveMsg.startsWith('¡') ? 'text-emerald-600' : 'text-red-600'}`}>{addressSaveMsg}</p>
                    )}
                  </div>
                </div>

                {familyMembers.length > 0 && (
                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Otras Personas en tu Plan</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {familyMembers.map((fam, idx) => (
                        <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-xs">
                          <span className="block font-bold text-slate-900">{fam.name}</span>
                          <span className="block text-[10px] text-slate-500">{fam.relationship}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Plan benefits / "contract" summary */}
                <div className="bg-teal-50/60 p-5 rounded-2xl border border-teal-100 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold text-teal-950">
                      Beneficios de tu {PLAN_DETAILS[profile.basePlanId]?.name || profile.selectedPlanName || 'Plan'}
                    </h4>
                    <div className="flex items-center gap-3 shrink-0">
                      {PLAN_DETAILS[profile.basePlanId] && (
                        <button
                          onClick={() => setShowPlanModal(true)}
                          className="text-[10px] font-bold text-teal-700 hover:underline cursor-pointer"
                        >
                          Ver detalle completo del plan →
                        </button>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-700">
                    {(PLAN_DETAILS[profile.basePlanId]?.caracteristicas || ['Contacta a tu asesor para el detalle completo de tu cobertura.']).map((b, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Appointment history */}
                <div className="space-y-3">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Histórico de Citas Agendadas</span>
                  {portalData.appointments.length === 0 ? (
                    <p className="text-xs text-slate-400">Aún no has agendado citas médicas.</p>
                  ) : (
                    <div className="space-y-3">
                      {portalData.appointments.map((apt) => (
                        <div key={apt.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{apt.specialty} — {apt.doctorName}</h4>
                            <p className="text-[10px] text-slate-500">{apt.clinic} ({apt.city})</p>
                            <p className="text-[10px] text-slate-400 font-mono">{apt.aptDate} {apt.aptTime}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border shrink-0 ${
                            apt.status === 'Confirmada'
                              ? 'text-emerald-800 bg-emerald-50 border-emerald-100'
                              : apt.status === 'Completada'
                              ? 'text-indigo-800 bg-indigo-50 border-indigo-100'
                              : apt.status === 'Cancelada'
                              ? 'text-rose-800 bg-rose-50 border-rose-100'
                              : 'text-amber-800 bg-amber-50 border-amber-100'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Plan detail modal — same layout as Cotizador's, read-only */}
                {showPlanModal && PLAN_DETAILS[profile.basePlanId] && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowPlanModal(false)}
                  >
                    <div
                      className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="sticky top-0 bg-[#0C4169] text-white px-6 py-4 rounded-t-3xl flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-mono tracking-widest text-sky-300 uppercase">Detalle del Plan</p>
                          <h3 className="text-lg font-black">{PLAN_DETAILS[profile.basePlanId].name}</h3>
                        </div>
                        <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition cursor-pointer">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="space-y-2">
                          <span className="block text-[9.5px] font-black tracking-widest text-[#0C4169] uppercase font-mono">Coberturas</span>
                          <div className="space-y-1.5 text-[11px] text-slate-700">
                            {[
                              ['Cobertura Anual Máxima', PLAN_DETAILS[profile.basePlanId].cobertura],
                              ['Deducible Hospitalización', PLAN_DETAILS[profile.basePlanId].dedHosp],
                              ['Bono Maternidad', PLAN_DETAILS[profile.basePlanId].maternidad],
                              ['Muerte por Accidente', PLAN_DETAILS[profile.basePlanId].muerteAccidente],
                              ['Sepelio por Accidente', PLAN_DETAILS[profile.basePlanId].sepelio],
                              ['Ambulancias Terrestres', PLAN_DETAILS[profile.basePlanId].ambulancia],
                              ['Lab e Imágenes (ambos)', '$100 USD/Año'],
                            ].map(([label, val]) => (
                              <div key={label} className="flex justify-between border-b border-slate-100 py-1.5">
                                <span className="text-slate-500">{label}</span>
                                <span className="font-bold text-slate-800">{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="block text-[9.5px] font-black tracking-widest text-[#0C4169] uppercase font-mono">Especialidades Cubiertas</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {Object.entries(PLAN_DETAILS[profile.basePlanId].especialidades).sort(([, a], [, b]) => Number(b) - Number(a)).map(([spec, inc]) => (
                              <div key={spec} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10.5px] ${inc ? 'bg-emerald-50/50 border-emerald-100 text-slate-800' : 'bg-slate-50 border-slate-100 text-slate-400 line-through'}`}>
                                {inc
                                  ? <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"><Check className="w-2.5 h-2.5 stroke-[3.5]" /></span>
                                  : <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0"><X className="w-2.5 h-2.5 stroke-[3.5]" /></span>
                                }
                                <span className="font-bold leading-tight">{spec}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="block text-[9.5px] font-black tracking-widest text-[#0C4169] uppercase font-mono">Beneficios Destacados</span>
                          <ul className="space-y-1.5">
                            {PLAN_DETAILS[profile.basePlanId].caracteristicas.map((feat, idx) => (
                              <li key={idx} className="flex gap-2 items-start text-[11px] text-slate-600">
                                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                    <p className="text-xs font-semibold text-slate-500">Analizando sintomatología clínica e historial de la red médica de Colmedikal...</p>
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

        {/* Minimal footer — low visual weight, doesn't compete with the panel's actions */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
          <span>© {new Date().getFullYear()} Colmedikal</span>
          <div className="flex items-center gap-4">
            <a href="tel:022567191" className="hover:text-slate-600">Soporte</a>
            {/* Opens in a new tab — legal links, but without pulling the
                client out of their logged-in portal session/tab. */}
            <a href="/faqs" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600">Términos y Condiciones</a>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600">Política de Privacidad</a>
          </div>
        </div>
        </>
      )}

    </div>
    </div>
  );
}
