import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  AlertCircle,
  PhoneCall,
  Lock,
  LogOut,
  Video
} from 'lucide-react';
import { Page, Doctor } from '../types';
import { useColmedikal } from '../context/ColmedikalContext';

interface AgendamientoCitasProps {
  setCurrentPage: (page: Page) => void;
  // When rendered inside Mi Colmedikal (PortalAfiliados), hide the "Volver al
  // Inicio" exits back to the marketing site — the portal is a clean, app-like
  // experience with no path back out.
  embedded?: boolean;
}

// Same province groupings used by the Directorio Médico filter — kept in sync
// so "Ciudad de Atención" here always matches what /directorio offers.
const CITY_GROUPS = [
  { id: 'quito', name: 'Quito y Valles (Pichincha)' },
  { id: 'guayaquil', name: 'Guayaquil y Vías (Guayas)' },
  { id: 'santodomingo', name: 'Santo Domingo de los Tsáchilas' },
  { id: 'manabi', name: 'Manabí (Manta / Portoviejo / El Carmen)' },
  { id: 'esmeraldas', name: 'Esmeraldas / Atacames' },
  { id: 'imbabura', name: 'Imbabura (Ibarra / Otavalo / Atuntaqui)' },
  { id: 'losrios', name: 'Los Ríos (Babahoyo / Quevedo)' },
  { id: 'eloro', name: 'El Oro (Machala / Santa Rosa / Arenillas)' },
  { id: 'azuay', name: 'Azuay (Cuenca)' },
  { id: 'santaelena', name: 'Santa Elena (Libertad / Salinas)' },
  { id: 'sierracentro', name: 'Sierra Centro (Ambato / Riobamba / Latacunga / Tulcán)' },
  { id: 'loja', name: 'Loja' },
  { id: 'amazonia', name: 'Amazonía (Tena / Puyo / Macas)' },
];

// Identical predicate to DirectorioMedico's city filter — same taxonomy everywhere.
function matchesCityGroup(cityRaw: string, groupId: string): boolean {
  const c = (cityRaw || '').toLowerCase();
  switch (groupId) {
    case 'quito': return c.includes('quito') || c.includes('tumbaco') || c.includes('puellaro') || c.includes('puéllaro') || c.includes('guayllabamba') || c.includes('carapungo') || c.includes('batán') || c.includes('batan') || c.includes('villaflora') || c.includes('tabacundo') || c.includes('quinche') || c.includes('cayambe') || c.includes('pifo') || c.includes('chilibulo');
    case 'guayaquil': return c.includes('guay') || c.includes('samborondon') || c.includes('samborondón');
    case 'santodomingo': return c.includes('santo domingo') || c.includes('concordia');
    case 'manabi': return c.includes('manta') || c.includes('portoviejo') || c.includes('carmen') || c.includes('manabi') || c.includes('manabí');
    case 'esmeraldas': return c.includes('esmeraldas');
    case 'imbabura': return c.includes('ibarra') || c.includes('otavalo') || c.includes('atuntaqui') || c.includes('imbabura');
    case 'losrios': return c.includes('quevedo') || c.includes('babahoyo') || c.includes('rios') || c.includes('ríos');
    case 'eloro': return c.includes('machala') || c.includes('el oro') || c.includes('pasaje') || c.includes('santa rosa') || c.includes('arenillas') || c.includes('triunfo');
    case 'azuay': return c.includes('cuenca') || c.includes('azuay');
    case 'santaelena': return c.includes('santa elena') || c.includes('libertad') || c.includes('salinas') || c.includes('san pablo');
    case 'sierracentro': return c.includes('ambato') || c.includes('tungurahua') || c.includes('riobamba') || c.includes('chimborazo') || c.includes('latacunga') || c.includes('cotopaxi') || c.includes('tulcan') || c.includes('tulcán') || c.includes('carchi') || c.includes('troncal') || c.includes('cañar') || c.includes('machachi');
    case 'loja': return c.includes('loja');
    case 'amazonia': return c.includes('tena') || c.includes('napo') || c.includes('puyo') || c.includes('pastaza') || c.includes('macas') || c.includes('morona');
    default: return false;
  }
}

// Services listed in a provider's education field that aren't a bookable
// clinical specialty — excluded from the token-count derivation below.
const NON_SPECIALTY_TOKENS = new Set(['LABORATORIO', 'RAYOS X', 'TELEMEDICINA']);
const toTitleCase = (s: string) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

// Odontología/Laboratorio providers are identified by name/specialty, not the
// education field — same completion applied to the Directorio filter.
const isDentalProvider = (d: { specialty: string; name: string }) => {
  const s = d.specialty.toLowerCase();
  return s.includes('odontología') || s.includes('odontologia') || s.includes('dental') ||
    d.name.toLowerCase().includes('dent') || d.name.toLowerCase().includes('odont');
};
const isLabProvider = (d: { specialty: string; name: string }) => {
  const s = d.specialty.toLowerCase();
  return s.includes('laboratorio') || s.includes('cruz vital') || d.name.toLowerCase().includes('lab');
};
const matchesSpecialtyToken = (d: Doctor, token: string): boolean => {
  if (token === 'Odontología') return isDentalProvider(d);
  if (token === 'Laboratorio') return isLabProvider(d);
  return (d.education || '').toLowerCase().includes(token.toLowerCase());
};

// Same nivel taxonomy as DirectorioMedico — the network's demo Nivel 2/3
// centers aren't reachable by any currently sellable plan, so only Nivel 1
// providers are ever bookable today. Kept data-driven so a future plan tied
// to a higher nivel just works once added here.
const NIVEL2_NAMES = new Set(['CENTRO MÉDICO ESPECIALIZADO NORTE (DEMO)', 'CLÍNICA AVANZADA DEL LITORAL (DEMO)']);
const NIVEL3_NAMES = new Set(['HOSPITAL DE ESPECIALIDADES COLMEDIKAL (DEMO)', 'CLÍNICA INTERNACIONAL COLMEDIKAL (DEMO)']);
const docNivel = (d: Doctor): number => NIVEL3_NAMES.has(d.name) ? 3 : NIVEL2_NAMES.has(d.name) ? 2 : 1;
const PLAN_NIVEL: Record<string, number> = { inicio: 1, proteccion: 1, plus: 1 };

export default function AgendamientoCitas({ setCurrentPage, embedded }: AgendamientoCitasProps) {
  const { addAppointment, seoSettings } = useColmedikal();

  // ==================== CLIENT AUTH GATE (same session as /mi-colmedikal) ====================
  const [portalToken, setPortalToken] = useState<string | null>(() => sessionStorage.getItem('colmedikal_portal_token'));
  const [profile, setProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [docNumberInput, setDocNumberInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!portalToken) { setProfile(null); return; }
    let cancelled = false;
    (async () => {
      setProfileLoading(true);
      try {
        const res = await fetch('/api/portal/me', { headers: { Authorization: `Bearer ${portalToken}` } });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error();
        if (!cancelled) setProfile(json.data);
      } catch {
        if (!cancelled) {
          sessionStorage.removeItem('colmedikal_portal_token');
          setPortalToken(null);
          setProfile(null);
        }
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
      setLoginError('No se pudo conectar. Intenta de nuevo.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('colmedikal_portal_token');
    setPortalToken(null);
    setProfile(null);
  };

  // ==================== APPOINTMENT FIELDS ====================
  const [cityGroup, setCityGroup] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [facility, setFacility] = useState('');

  const [rawDoctors, setRawDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    fetch('https://api.colmedikal.com/api/doctors?limit=500')
      .then(r => r.json())
      .then(d => setRawDoctors(d.data || []))
      .catch(() => {});
  }, []);

  // Same active-provider filter as the Directorio (respects deactivated_doctors)
  const activeDoctors = useMemo(() => {
    let deactivatedIds: string[] = [];
    try { deactivatedIds = JSON.parse(seoSettings.deactivated_doctors || '[]'); } catch { /* noop */ }
    return rawDoctors.filter(d => !deactivatedIds.includes(d.id) && d.active !== false);
  }, [rawDoctors, seoSettings.deactivated_doctors]);

  // Only providers within the nivel that the client's current plan grants access to.
  const clientNivel = profile ? (PLAN_NIVEL[profile.basePlanId] ?? 1) : 1;
  const nivelDoctors = useMemo(
    () => activeDoctors.filter(d => docNivel(d) === clientNivel),
    [activeDoctors, clientNivel]
  );

  // Real, live specialties — same derivation (and completion) as the Directorio filter.
  const specialtyOptions = useMemo(() => {
    const counts = new Map<string, number>();
    nivelDoctors.forEach(d => {
      (d.education || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean).forEach(tok => {
        if (NON_SPECIALTY_TOKENS.has(tok)) return;
        counts.set(tok, (counts.get(tok) || 0) + 1);
      });
    });
    const list = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tok]) => toTitleCase(tok));
    if (nivelDoctors.some(isDentalProvider)) list.push('Odontología');
    if (nivelDoctors.some(isLabProvider)) list.push('Laboratorio');
    return list;
  }, [nivelDoctors]);

  useEffect(() => {
    if (!specialty && specialtyOptions.length > 0) setSpecialty(specialtyOptions[0]);
  }, [specialtyOptions]);

  // Only offer city groups that actually have a provider for the chosen specialty
  const availableCityGroups = useMemo(() => {
    if (!specialty) return [];
    return CITY_GROUPS.filter(g =>
      nivelDoctors.some(d => matchesCityGroup(d.city, g.id) && matchesSpecialtyToken(d, specialty))
    );
  }, [nivelDoctors, specialty]);

  useEffect(() => {
    if (availableCityGroups.length === 0) { setCityGroup(''); return; }
    if (!availableCityGroups.some(g => g.id === cityGroup)) {
      const preferred = availableCityGroups.find(g => g.id === 'quito') || availableCityGroups[0];
      setCityGroup(preferred.id);
    }
  }, [availableCityGroups]);

  // Establishments matching the selected city group + specialty
  const facilitiesForSelection = useMemo(() => {
    if (!specialty || !cityGroup) return [];
    const names = new Set<string>();
    nivelDoctors.forEach(d => {
      if (matchesCityGroup(d.city, cityGroup) && matchesSpecialtyToken(d, specialty)) names.add(d.name);
    });
    return [...names].sort((a, b) => a.localeCompare(b, 'es'));
  }, [nivelDoctors, specialty, cityGroup]);

  useEffect(() => {
    if (facilitiesForSelection.length === 0) { setFacility(''); return; }
    if (!facilitiesForSelection.includes(facility)) setFacility(facilitiesForSelection[0]);
  }, [facilitiesForSelection]);

  // Same establishments but across ALL cities — used while the user is typing
  // a facility search, so they can find a specialist outside their default city.
  const facilitiesAllCitiesForSpecialty = useMemo(() => {
    if (!specialty) return [];
    const names = new Set<string>();
    nivelDoctors.forEach(d => { if (matchesSpecialtyToken(d, specialty)) names.add(d.name); });
    return [...names].sort((a, b) => a.localeCompare(b, 'es'));
  }, [nivelDoctors, specialty]);

  const [facilitySearch, setFacilitySearch] = useState('');
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [facilityEditing, setFacilityEditing] = useState(false);

  const filteredFacilities = useMemo(() => {
    const q = facilitySearch.toLowerCase();
    if (!q) return facilitiesForSelection;
    return facilitiesAllCitiesForSpecialty.filter((f) => f.toLowerCase().includes(q));
  }, [facilitySearch, facilitiesForSelection, facilitiesAllCitiesForSpecialty]);

  // The exact directory record behind the chosen establishment — used at submit
  // time so the appointment stores the REAL city/address, not just the province group.
  const selectedDoctorRecord = useMemo(
    () => nivelDoctors.find(d => d.name === facility),
    [nivelDoctors, facility]
  );

  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeRange, setPreferredTimeRange] = useState('Mañana (08:00 - 12:00)');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!privacyAccepted) {
      alert('Debe aceptar las políticas de protección de datos personales.');
      return;
    }
    if (!facility) {
      alert('Por favor seleccione un establecimiento.');
      return;
    }
    if (!preferredDate) {
      alert('Por favor seleccione una fecha preferida.');
      return;
    }

    setIsSubmitting(true);

    let coordinatorName = 'Lcda. Carmen Falconí - Sede Quito';
    if (cityGroup === 'guayaquil') coordinatorName = 'Ing. Christian Solórzano - Sede Guayaquil';
    if (cityGroup === 'azuay') coordinatorName = 'Dra. Verónica Arizaga - Sede Austro';

    const opportunityId = 'OP-APT-' + Math.floor(Math.random() * 90000 + 10000);
    // The real city/address from the chosen directory provider — more precise
    // than the province group used for filtering, and consistent with /directorio.
    const realCity = selectedDoctorRecord?.city || CITY_GROUPS.find(g => g.id === cityGroup)?.name || cityGroup;

    // Save to backend (public endpoint, no auth required)
    try {
      await addAppointment({
        doctorName: 'Por Asignar',
        specialty,
        patientName: profile.fullName,
        patientId: profile.docNumber,
        patientPhone: profile.phone,
        aptDate: preferredDate,
        aptTime: preferredTimeRange,
        modality: 'presencial',
        clinic: facility,
        city: realCity,
        cost: 0,
        status: 'Pendiente',
        notes: additionalNotes || '',
      });
    } catch { /* continue even if API call fails */ }

    setTicketDetails({
      opportunityId,
      fullName: profile.fullName,
      phone: profile.phone,
      city: realCity,
      specialty,
      facility,
      preferredDate,
      preferredTimeRange,
      coordinator: coordinatorName,
    });
    setIsSubmitting(false);
    setSuccess(true);
  };

  const handleReset = () => {
    setPreferredDate('');
    setAdditionalNotes('');
    setPrivacyAccepted(false);
    setSuccess(false);
    setTicketDetails(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12" id="agendamiento-citas-view">

      {/* Top Title Head with go back triggers */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest font-mono">Agendamiento de Citas</span>
          <h1 className="text-3xl font-extrabold text-[#0C4169] tracking-tight mt-1">
            Solicitud de Cita Médica Tentativa
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl">
            Este servicio está disponible exclusivamente para clientes activos de Colmedikal.
          </p>
        </div>

        {!embedded && (
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#4597CA]" />
            <span>Volver al Inicio</span>
          </button>
        )}
      </div>

      {profileLoading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-[#4597CA] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-3">Verificando tu cuenta...</p>
        </div>
      ) : !profile ? (
        /* ==================== NOT A RECOGNIZED CLIENT ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-[#0C4169]">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-bold">Ingresa como Cliente</span>
            </div>
            <p className="text-xs text-slate-500">
              El agendamiento de citas es exclusivo para clientes con un plan activo. Ingresa con la misma cédula y contraseña de tu cuenta Mi Colmedikal.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-650 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Cédula:</label>
                <input
                  type="text"
                  required
                  value={docNumberInput}
                  onChange={(e) => setDocNumberInput(e.target.value)}
                  placeholder="Ej. 1712345678"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Contraseña:</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoggingIn ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-[#1D3557] to-[#0C4169] text-white p-6 sm:p-8 rounded-3xl flex flex-col justify-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-300">¿Aún no eres cliente?</span>
            <h3 className="text-lg font-extrabold leading-snug">
              Contrata un plan de medicina prepagada para acceder al agendamiento directo de citas.
            </h3>
            <p className="text-xs text-slate-300">
              Cotiza en minutos y, una vez tu plan quede activo, tu asesor te entregará las credenciales de acceso a Mi Colmedikal.
            </p>
            <button
              onClick={() => setCurrentPage('cotizador')}
              className="px-5 py-3 bg-[#4597CA] hover:bg-[#4597CA]/90 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer w-fit"
            >
              Cotizar un Plan Ahora
            </button>
          </div>
        </div>
      ) : !success ? (
        /* ==================== RECOGNIZED CLIENT — SCHEDULING FORM ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">

          {/* Form Side */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="block text-xs font-bold text-[#4597CA] uppercase tracking-wider">
                🩺 Registro de Preferencias de Consulta
              </span>
              <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-red-500 cursor-pointer">
                <LogOut className="w-3 h-3" /> Cerrar sesión
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Verified patient identity */}
              <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="block text-[9px] text-emerald-700 font-bold uppercase">Asegurado Titular</span>
                  <span className="text-sm font-bold text-slate-900">{profile.fullName}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-emerald-700 font-bold uppercase">Plan Activo</span>
                  <span className="text-sm font-bold text-slate-900">{profile.selectedPlanName || 'Por confirmar'}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-emerald-700 font-bold uppercase">Cédula</span>
                  <span className="text-xs font-mono text-slate-700">{profile.docNumber}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-emerald-700 font-bold uppercase">Celular de Contacto</span>
                  <span className="text-xs font-mono text-slate-700">{profile.phone}</span>
                </div>
              </div>

              {/* Consultation specifics */}
              <div className="bg-[#4597CA]/5 p-5 rounded-2xl border border-[#4597CA]/10 grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Especialidad Requerida:</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    {specialtyOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Ciudad de Atención:</label>
                  <select
                    value={cityGroup}
                    onChange={(e) => setCityGroup(e.target.value)}
                    disabled={availableCityGroups.length === 0}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none disabled:opacity-50"
                  >
                    {availableCityGroups.length === 0 && <option value="">Sin cobertura para esta especialidad</option>}
                    {availableCityGroups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 relative md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700">Establecimiento (según tu plan): <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={facilityEditing ? facilitySearch : facility}
                    placeholder="Buscar clínica u hospital..."
                    onFocus={() => { setFacilityEditing(true); setFacilitySearch(''); setFacilityOpen(true); }}
                    onChange={(e) => { setFacilitySearch(e.target.value); setFacilityOpen(true); }}
                    onBlur={() => setTimeout(() => { setFacilityOpen(false); setFacilityEditing(false); setFacilitySearch(''); }, 150)}
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs outline-none focus:border-[#4597CA] ${!facility ? 'border-slate-200' : 'border-emerald-300'}`}
                  />
                  {facilityOpen && filteredFacilities.length > 0 && (
                    <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto text-xs">
                      {filteredFacilities.map((f) => (
                        <li
                          key={f}
                          onMouseDown={() => {
                            setFacility(f);
                            const doc = nivelDoctors.find(d => d.name === f);
                            const grp = doc && CITY_GROUPS.find(g => matchesCityGroup(doc.city, g.id));
                            if (grp && grp.id !== cityGroup) setCityGroup(grp.id);
                            setFacilitySearch(''); setFacilityOpen(false); setFacilityEditing(false);
                          }}
                          className={`px-3 py-2 cursor-pointer hover:bg-[#4597CA]/10 hover:text-[#0C4169] ${f === facility ? 'bg-[#4597CA]/10 font-semibold text-[#0C4169]' : 'text-slate-700'}`}
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Modalidad — Telemedicina disabled for now */}
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700">Modalidad:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-[#0C4169] text-white rounded-xl text-xs font-bold">
                      <User className="w-4 h-4" />
                      <span>Presencial</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed" title="Próximamente disponible">
                      <Video className="w-4 h-4" />
                      <span>Telemedicina</span>
                      <span className="ml-auto text-[8px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full uppercase">Próximamente</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Preferred calendar inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Fecha Tentativa Deseada: <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA] font-mono text-center cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Horario de Preferencia:</label>
                  <select
                    value={preferredTimeRange}
                    onChange={(e) => setPreferredTimeRange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="Mañana (08:00 - 12:00)">Mañana (08:00 - 12:00)</option>
                    <option value="Mediodía (12:00 - 14:00)">Mediodía (12:00 - 14:00)</option>
                    <option value="Tarde (14:00 - 18:00)">Tarde (14:00 - 18:00)</option>
                  </select>
                </div>

              </div>

              {/* Additional notes/text */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">¿Desea agregar algún comentario o referir un médico específico?</label>
                <textarea
                  rows={3}
                  value={additionalNotes}
                  placeholder="Ej. Prefiero cita con el Dr. Juan Carlos Ramos si está disponible..."
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-xs resize-none outline-none focus:border-[#4597CA]"
                />
              </div>

              {/* Note disclaimer */}
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-normal border border-slate-150">
                ⚠️ <strong>Nota regulatoria:</strong> En cumplimiento con las políticas de medicina prepagada, la reserva de citas con especialistas de red en clínicas premium no requiere aprobación de un médico familiar. El agendamiento procesado a través de Colmedikal garantiza cobros con copagos directos del 15%.
              </div>

              <div className="pt-2 pb-1 text-left">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Acepto las políticas de protección de datos personales.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl text-[#0C4169] bg-gradient-to-r from-emerald-500 to-teal-400 border border-teal-500/10 text-xs font-extrabold uppercase tracking-wider text-center text-white cursor-pointer shadow-md shadow-emerald-500/10 active:scale-98 hover:shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Procesando Solicitud...</span>
                  </span>
                ) : (
                  <span>Solicitar Cita Médica Tentativa</span>
                )}
              </button>

            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6 shrink-0 justify-between">
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4">
              <span className="text-[10px] font-bold text-[#4597CA] bg-[#4597CA]/10 p-1 px-2.5 rounded uppercase tracking-wider block w-fit">
                Paso a Paso
              </span>
              <h3 className="text-sm font-extrabold text-white">¿Cómo funciona la asignación?</h3>

              <ul className="space-y-4 text-xs text-slate-350">
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-[#4597CA] shrink-0">1</span>
                  <span>Elige la especialidad y ciudad; el establecimiento se ajusta automáticamente a tu plan.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-[#4597CA] shrink-0">2</span>
                  <span>El sistema crea instantáneamente tu solicitud de agendamiento y la enruta al asesor correspondiente.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-[#4597CA] shrink-0">3</span>
                  <span>El coordinador verifica disponibilidad de agendas clínicas e interactúa con el médico propuesto.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-[#4597CA] shrink-0">4</span>
                  <span>Se realiza la confirmación oficial a su WhatsApp con los detalles e indicaciones de la suite médica.</span>
                </li>
              </ul>
            </div>

            <div className="bg-teal-50 border border-teal-150 p-5 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-teal-600" />
                <span>Atención de Llamadas Directas</span>
              </h4>
              <p className="text-[11px] text-slate-600 leading-normal">
                Si prefiere soporte telefónico expedito para emergencias de hospital o requiere un traslado de ambulancia inmediato, no dude en llamar:
              </p>
              {clientNivel === 1 ? (
                <a href="tel:0963360000" className="block text-sm font-black text-[#0C4169] font-mono hover:underline">
                  📞 096 336 0000 | 💬 WhatsApp: 099 179 3751
                </a>
              ) : (
                <a href="tel:022567191" className="block text-sm font-black text-[#0C4169] font-mono hover:underline">
                  📞 02-2567191 | 💬 WhatsApp: 098 702 8756
                </a>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* SUCCESS PORTRAIT DISPLAYING OPPORTUNITY INTEGRATION */
        <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-lg shadow-emerald-500/10">
              ✓
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Oportunidad Registrada
              </span>
              <h2 className="text-2xl font-extrabold text-[#0C4169] tracking-tight">Solicitud de Cita Enviada</h2>
              <p className="text-xs text-slate-500">
                Código de Seguimiento: <strong className="text-slate-800 font-mono font-bold leading-none">{ticketDetails.opportunityId}</strong>
              </p>
            </div>

            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              Muchas gracias, Sr(a). <strong>{ticketDetails.fullName}</strong>. Su requerimiento para una cita de <strong>{ticketDetails.specialty}</strong> en <strong>{ticketDetails.facility}</strong> ha sido recibido exitosamente por nuestro equipo de Colmedikal.
            </p>

            <div className="pt-4 flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Solicitar Otra Cita
              </button>

              {!embedded && (
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-5 py-2.5 bg-[#0C4169] text-white hover:bg-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Volver a Inicio
                </button>
              )}
            </div>
          </div>

          {/* Pipeline and assignment visualization */}
          <div className="bg-slate-950 text-slate-350 p-6 rounded-3xl shadow-xl space-y-5 border border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest font-mono">
                  Sincronización Automática de la Solicitud
                </h4>
              </div>
              <span className="text-[9px] font-bold text-slate-500 font-mono">ESTADO: TRANSMITIDO</span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
                <div>
                  <span className="block text-[10px] text-slate-500">Oportunidad ID:</span>
                  <span className="text-white font-bold">{ticketDetails.opportunityId}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Canal de Entrada:</span>
                  <span className="text-white font-bold">Portal Web Agendamiento</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
                <div>
                  <span className="block text-[10px] text-slate-500">Ejecutivo de Coordinación Asignado:</span>
                  <span className="text-teal-400 font-bold">{ticketDetails.coordinator}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Plan Asignado Responsable:</span>
                  <span className="text-white font-bold">Asignación Directa por Territorio</span>
                </div>
              </div>

              <div className="space-y-2 select-none">
                <span className="block text-[10px] text-slate-500">Historial de Eventos del Sistema:</span>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-sans space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="text-emerald-400">● [19:19:07]</span>
                    <span>Lead unificado creado con nombre direct-link de <strong>{ticketDetails.fullName}</strong>.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-emerald-400">● [19:19:08]</span>
                    <span>Oportunidad <strong>{ticketDetails.opportunityId}</strong> instanciada en etapa "Pre-Agendamiento".</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-emerald-400">● [19:19:08]</span>
                    <span>Notificación webhook enviada con éxito al terminal del coordinador <strong>{ticketDetails.coordinator}</strong>.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-amber-400">● [Acción Próxima]</span>
                    <span>Asesor contrastará la disponibilidad de suites del Hospital con la fecha del <strong>{ticketDetails.preferredDate}</strong> y confirmará al paciente al <strong>{ticketDetails.phone}</strong>.</span>
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
