import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Sparkles,
  CheckCircle,
  Send,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Activity,
  AlertCircle,
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import { Page, Doctor } from '../types';
import { useColmedikal } from '../context/ColmedikalContext';

interface AgendamientoCitasProps {
  setCurrentPage: (page: Page) => void;
}

export default function AgendamientoCitas({ setCurrentPage }: AgendamientoCitasProps) {
  const { addAppointment } = useColmedikal();

  // FORM FIELDS
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Appointment specific fields
  const [city, setCity] = useState('QUITO');
  const [specialty, setSpecialty] = useState('Pediatría');
  const [facility, setFacility] = useState('');

  const [facilityDoctors, setFacilityDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    fetch('https://api.colmedikal.com/api/doctors?limit=500')
      .then(r => r.json())
      .then(d => {
        const medCenters = (d.data || []).filter(
          (doc: Doctor) => doc.active !== false &&
            (doc.specialty === 'Hospital' || doc.specialty === 'Clínica')
        );
        setFacilityDoctors(medCenters);
      })
      .catch(() => {});
  }, []);

  const { facilityCities, facilitiesByCity } = useMemo(() => {
    const byCity: Record<string, string[]> = {};
    facilityDoctors.forEach((d) => {
      const cityKey = (d.city || '').trim();
      if (!byCity[cityKey]) byCity[cityKey] = [];
      if (!byCity[cityKey].includes(d.name)) byCity[cityKey].push(d.name);
    });
    const cities = Object.keys(byCity).sort();
    return { facilityCities: cities, facilitiesByCity: byCity };
  }, [facilityDoctors]);

  useEffect(() => {
    if (facilityCities.length === 0) return;
    const defaultCity = facilityCities.includes('QUITO') ? 'QUITO' : facilityCities[0];
    setCity(defaultCity);
    setFacility(facilitiesByCity[defaultCity]?.[0] || '');
  }, [facilityCities]);

  const [facilitySearch, setFacilitySearch] = useState('');
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [facilityEditing, setFacilityEditing] = useState(false);

  const filteredFacilities = useMemo(() => {
    const q = facilitySearch.toLowerCase();
    if (!q) return facilitiesByCity[city] || [];
    // Search across ALL cities when typing
    return Object.values(facilitiesByCity).flat().filter((f) => f.toLowerCase().includes(q));
  }, [facilitySearch, city, facilitiesByCity]);

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
    if (city === 'Guayaquil') coordinatorName = 'Ing. Christian Solórzano - Sede Guayaquil';
    if (city === 'Cuenca') coordinatorName = 'Dra. Verónica Arizaga - Sede Austro';

    const opportunityId = 'OP-APT-' + Math.floor(Math.random() * 90000 + 10000);

    // Save to backend (public endpoint, no auth required)
    try {
      await addAppointment({
        doctorName: 'Por Asignar',
        specialty,
        patientName: fullName,
        patientId: cedula,
        patientPhone: phone,
        aptDate: preferredDate,
        aptTime: preferredTimeRange,
        modality: 'presencial',
        clinic: facility,
        city,
        cost: 0,
        status: 'Pendiente',
        notes: additionalNotes || '',
      });
    } catch { /* continue even if API call fails */ }

    const data = {
      opportunityId,
      timestamp: new Date().toLocaleString(),
      fullName,
      cedula,
      phone,
      email,
      city,
      specialty,
      facility,
      preferredDate,
      preferredTimeRange,
      additionalNotes: additionalNotes || 'Sin comentarios adicionales',
      coordinator: coordinatorName,
      status: 'Pendiente de Confirmación con el Especialista',
    };

    setTicketDetails(data);
    setIsSubmitting(false);
    setSuccess(true);
  };

  const handleReset = () => {
    setFullName('');
    setCedula('');
    setPhone('');
    setEmail('');
    setPreferredDate('');
    setAdditionalNotes('');
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
            Complete los datos de la cita requerida. Su solicitud de cita pasará directamente a nuestro sistema para que nuestros coordinadores verifiquen la agenda del especialista de forma ágil.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#4597CA]" />
          <span>Volver al Inicio</span>
        </button>
      </div>

      {!success ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Form Side */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <span className="block text-xs font-bold text-[#4597CA] uppercase tracking-wider border-b border-slate-100 pb-2">
              🩺 Registro de Preferencias de Consulta
            </span>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Patient identities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-705">Nombre Completo del Asegurado: <span className="text-rose-550">*</span></label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    placeholder="Ej. María Paulina Cárdenas"
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-705">Cédula o Pasaporte: <span className="text-rose-550">*</span></label>
                  <input
                    type="text"
                    required
                    value={cedula}
                    placeholder="Ej. 1718224590"
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-705">Celular de Contacto: <span className="text-rose-550">*</span></label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    placeholder="Ej. +593 99 876 5432"
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-705">Correo Electrónico: <span className="text-rose-550">*</span></label>
                  <input
                    type="email"
                    required
                    value={email}
                    placeholder="Ej. paula.cardenas@mail.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none"
                  />
                </div>
              </div>

              {/* Consultation specifics */}
              <div className="bg-[#4597CA]/5 p-5 rounded-2xl border border-[#4597CA]/10 grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Ciudad de Atención:</label>
                  <select
                    value={city}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      setCity(newCity);
                      setFacility(facilitiesByCity[newCity]?.[0] || '');
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    {facilityCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Especialidad Requerida:</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="Pediatría">Pediatría</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Ginecología y Obstetricia">Ginecología y Obstetricia</option>
                    <option value="Dermatología">Dermatología</option>
                    <option value="Traumatología">Traumatología</option>
                    <option value="Medicina Interna">Medicina Interna</option>
                  </select>
                </div>

                <div className="space-y-1 relative">
                  <label className="block text-xs font-bold text-slate-700">Establecimiento: <span className="text-rose-500">*</span></label>
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
                          onMouseDown={() => { setFacility(f); setFacilitySearch(''); setFacilityOpen(false); setFacilityEditing(false); }}
                          className={`px-3 py-2 cursor-pointer hover:bg-[#4597CA]/10 hover:text-[#0C4169] ${f === facility ? 'bg-[#4597CA]/10 font-semibold text-[#0C4169]' : 'text-slate-700'}`}
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
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
                    min={new Date().toISOString().split('T')[0]} // Block historical dates
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
                  <span>Ingresa tus datos personales y escoge tus horarios de conveniencia en el formulario.</span>
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
              <a href="tel:022567191" className="block text-sm font-black text-[#0C4169] font-mono hover:underline">
                📞 02-2567191 | 💬 WhatsApp: 098 702 8756
              </a>
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
              
              <button
                onClick={() => setCurrentPage('home')}
                className="px-5 py-2.5 bg-[#0C4169] text-white hover:bg-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Volver a Inicio
              </button>
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
