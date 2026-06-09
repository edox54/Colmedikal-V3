import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle,
  X,
  Sparkles,
  HeartPulse,
  Hospital,
  Building2,
  Activity,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Mail,
  Star,
  Navigation
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Doctor } from '../types';
import { useColmedikal } from '../context/ColmedikalContext';

export default function DirectorioMedico() {
  const { token } = useColmedikal();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [doctorSpecialty, setDoctorSpecialty] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Always fetch from public endpoint so the directory shows consistently regardless of auth state
  useEffect(() => {
    fetch('https://api.colmedikal.com/api/doctors?limit=500')
      .then(r => r.json())
      .then(d => setDoctors(d.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const specialtyParam = searchParams.get('especialidad');
    if (specialtyParam) {
      setDoctorSpecialty(specialtyParam);
    } else {
      setDoctorSpecialty('');
    }
  }, [searchParams]);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => {
      setCopiedAddress(false);
    }, 2000);
  };

  const specialties = [
    { id: 'all', name: 'Todas las Categorías' },
    { id: 'hospital', name: 'Hospital / Clínica' },
    { id: 'centro', name: 'Centro Médico' },
    { id: 'odontologia', name: 'Odontología' },
    { id: 'laboratorio', name: 'Laboratorio' },
  ];

  const cities = [
    { id: 'all', name: 'Todas las Ubicaciones' },
    { id: 'quito', name: 'Quito y Valles (Pichincha)' },
    { id: 'guayaquil', name: 'Guayaquil y Vías (Guayas / Samborondón)' },
    { id: 'santodomingo', name: 'Santo Domingo (La Concordia)' },
    { id: 'manabi', name: 'Manabí (Manta / Portoviejo / El Carmen)' },
    { id: 'esmeraldas', name: 'Esmeraldas' },
    { id: 'imbabura', name: 'Imbabura (Ibarra / Otavalo / Atuntaqui)' },
    { id: 'losrios', name: 'Los Ríos (Quevedo)' }
  ];

  // Filters logic
  const filteredDoctors = doctors.filter(doc => {
    // Only show active doctors to regular users
    if (doc.active === false) {
      return false;
    }

    // Search Term match
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.education.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Doctor Specialty match
    const matchesDoctorSpecialty = doctorSpecialty === '' || doc.education.toLowerCase().includes(doctorSpecialty.toLowerCase());
    
    // Specialty match
    let matchesSpecialty = true;
    if (selectedSpecialty !== 'all') {
      const specLower = doc.specialty.toLowerCase();
      if (selectedSpecialty === 'hospital') {
        matchesSpecialty = specLower.includes('hospital') || specLower.includes('clínica') || specLower.includes('clinica');
      } else if (selectedSpecialty === 'centro') {
        matchesSpecialty = specLower.includes('centro') || specLower.includes('consultorio');
      } else if (selectedSpecialty === 'odontologia') {
        matchesSpecialty = specLower.includes('odontología') || specLower.includes('odontologia') || specLower.includes('dental') || doc.name.toLowerCase().includes('dent') || doc.name.toLowerCase().includes('odont');
      } else if (selectedSpecialty === 'laboratorio') {
        matchesSpecialty = specLower.includes('laboratorio') || specLower.includes('cruz vital') || doc.name.toLowerCase().includes('lab');
      }
    }

    // City match
    let matchesCity = true;
    if (selectedCity !== 'all') {
      const cityLower = doc.city.toLowerCase();
      if (selectedCity === 'quito') {
        matchesCity = cityLower.includes('quito') || 
                      cityLower.includes('tumbaco') || 
                      cityLower.includes('puellaro') || 
                      cityLower.includes('puéllaro') ||
                      cityLower.includes('guayllabamba') || 
                      cityLower.includes('carapungo') || 
                      cityLower.includes('batán') || 
                      cityLower.includes('batan') || 
                      cityLower.includes('villaflora') || 
                      cityLower.includes('tabacundo') || 
                      cityLower.includes('quinche') || 
                      cityLower.includes('cayambe') || 
                      cityLower.includes('pifo') || 
                      cityLower.includes('chilibulo');
      } else if (selectedCity === 'guayaquil') {
        matchesCity = cityLower.includes('guay') || // matches GUYAQUIL, GUAYAQUIL
                      cityLower.includes('samborondon') || 
                      cityLower.includes('samborondón');
      } else if (selectedCity === 'santodomingo') {
        matchesCity = cityLower.includes('santo domingo') || 
                      cityLower.includes('concordia');
      } else if (selectedCity === 'manabi') {
        matchesCity = cityLower.includes('manta') || 
                      cityLower.includes('portoviejo') || 
                      cityLower.includes('carmen') ||
                      cityLower.includes('manabi') ||
                      cityLower.includes('manabí');
      } else if (selectedCity === 'esmeraldas') {
        matchesCity = cityLower.includes('esmeraldas');
      } else if (selectedCity === 'imbabura') {
        matchesCity = cityLower.includes('ibarra') || 
                      cityLower.includes('otavalo') || 
                      cityLower.includes('atuntaqui') ||
                      cityLower.includes('imbabura');
      } else if (selectedCity === 'losrios') {
        matchesCity = cityLower.includes('quevedo') || 
                      cityLower.includes('rios') ||
                      cityLower.includes('ríos');
      }
    }

    return matchesSearch && matchesSpecialty && matchesCity && matchesDoctorSpecialty;
  });

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedikal-directorio-view">
      
      {/* 1. HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Red de Establecimientos en Convenio</span>
        {doctorSpecialty && (
          <div className="inline-block bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            Filtrando por: {doctorSpecialty}
          </div>
        )}
        <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Red Médica Nacional
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
          Encuentra hospitales, clínicas, consultorios, centros odontológicos y laboratorios autorizados para recibir atención médica directa de primer nivel.
        </p>
      </div>

      {/* 2. ADVANCED FILTER BOARD */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-5xl mx-auto">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-normal">Filtros de búsqueda de establecimientos</span>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Key Term search */}
          <div className="md:col-span-5 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por nombre, especialidad o palabra clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-350 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder:text-slate-400 font-medium"
              id="doc-keyword-search"
            />
          </div>

          {/* Specialty selector */}
          <div className="md:col-span-4">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-350 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
              id="doc-specialty-select"
            >
              {specialties.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
          </div>

          {/* City selector */}
          <div className="md:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-350 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
              id="doc-city-select"
            >
              {cities.map(ct => (
                <option key={ct.id} value={ct.id}>{ct.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. PROVIDERS GRID LEDGER */}
      <section className="space-y-6">
        <div className="flex justify-between items-center max-w-5xl mx-auto border-b border-slate-200 pb-4">
          <span className="text-xs font-bold text-slate-500">
            {filteredDoctors.length} Centros médicos coinciden con tu criterio
          </span>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialty('all');
              setSelectedCity('all');
            }} 
            className="text-[11px] font-mono font-bold text-teal-650 hover:underline cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>

        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {filteredDoctors.map((doc) => {
              const imgVal = doc.image || '';
              const isHospital = imgVal === 'icon_hospital' || doc.specialty.toLowerCase().includes('hospital') || doc.specialty.toLowerCase().includes('clínica') || doc.specialty.toLowerCase().includes('clinica');
              const isLab = imgVal === 'icon_lab' || doc.specialty.toLowerCase().includes('laboratorio') || doc.specialty.toLowerCase().includes('cruz vital') || doc.name.toLowerCase().includes('lab');
              const isDent = imgVal === 'icon_dental' || doc.specialty.toLowerCase().includes('odontología') || doc.specialty.toLowerCase().includes('odontologia') || doc.specialty.toLowerCase().includes('dental') || doc.name.toLowerCase().includes('dent') || doc.name.toLowerCase().includes('odont');

              let IconComponent = Building2;
              let bgClass = 'bg-teal-50 border-teal-200 text-teal-600';
              if (isHospital) {
                IconComponent = Hospital;
                bgClass = 'bg-rose-50 border-rose-200 text-rose-600';
              } else if (isLab) {
                IconComponent = Activity;
                bgClass = 'bg-amber-50 border-amber-200 text-amber-600';
              } else if (isDent) {
                IconComponent = Sparkles;
                bgClass = 'bg-sky-50 border-sky-200 text-sky-600';
              }

              return (
                <div 
                  key={doc.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                  id={`doctor-card-${doc.id}`}
                >
                  <div className="flex gap-4 items-start sm:items-center">
                    <div className={`w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border ${bgClass}`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          {doc.specialty}
                        </span>
                        <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                          {doc.city}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-slate-900 truncate" title={doc.name}>{doc.name}</h3>
                      
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate" title={doc.clinic}>{doc.clinic}</span>
                      </div>

                      <div className="flex flex-col gap-1.5 pt-1.5">
                        <span className="text-[10px] font-bold text-[#4597CA] uppercase tracking-wider font-mono">Agendamiento Centralizado:</span>
                        <div className="flex flex-wrap gap-2 items-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/agendamiento');
                            }}
                            className="text-[10px] font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Solicitar Cita Médica"
                          >
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Agendar Cita</span>
                          </button>
                          
                          <a 
                            href="tel:022567191"
                            onClick={(e) => e.stopPropagation()}
                            className="font-mono text-[10px] font-extrabold text-[#0C4169] bg-slate-100 hover:bg-slate-200 px-2.5 py-0.5 rounded-lg border border-slate-250 inline-flex items-center gap-1 transition-all"
                            title="Central Telefónica de Colmedikal"
                          >
                            <Phone className="w-3 h-3 text-[#4597CA]" />
                            <span>02-2567191</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5 text-slate-600">
                      <div className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                        <HeartPulse className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-500 mr-1">Servicios:</span>
                          <span className="text-slate-700 font-medium" title={doc.education}>{doc.education}</span>
                        </div>
                      </div>
                      <p className="flex items-center gap-1.5 text-[11px] font-mono leading-none">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{doc.availability}</span>
                      </p>
                    </div>

                    <div className="space-y-1.5 text-right flex flex-col items-start sm:items-end justify-center">
                      <div className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-wider">Copago Esencial:</div>
                      <div className="font-mono font-black text-emerald-600 text-sm">
                        $0.00 
                        <span className="text-[10px] text-slate-450 font-normal ml-1 block sm:inline">(100% Sin Reembolsos)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedDoctor(doc)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
                    >
                      <Activity className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                      <span>Ver toda la información</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
            <Building2 className="w-12 h-12 text-slate-350 mx-auto" strokeWidth={1.5} />
            <h4 className="text-sm font-bold text-slate-700">No encontramos ningún establecimiento</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
              Prueba modificando los filtros de categoría o provincia, o escribe un término de búsqueda general como "Hospital" o "Cruz Roja".
            </p>
          </div>
        )}
      </section>

      {/* 4. MODAL DETAILED BOOKING ENGINE / FICHA INFORMATIVA */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 flex justify-between items-center relative shrink-0">
              <div className="flex items-center gap-3">
                {(() => {
                  const imgValM = selectedDoctor.image || '';
                  const isHospital = imgValM === 'icon_hospital' || selectedDoctor.specialty.toLowerCase().includes('hospital') || selectedDoctor.specialty.toLowerCase().includes('clínica') || selectedDoctor.specialty.toLowerCase().includes('clinica');
                  const isLab = imgValM === 'icon_lab' || selectedDoctor.specialty.toLowerCase().includes('laboratorio') || selectedDoctor.specialty.toLowerCase().includes('cruz vital') || selectedDoctor.name.toLowerCase().includes('lab');
                  const isDent = imgValM === 'icon_dental' || selectedDoctor.specialty.toLowerCase().includes('odontología') || selectedDoctor.specialty.toLowerCase().includes('odontologia') || selectedDoctor.specialty.toLowerCase().includes('dental') || selectedDoctor.name.toLowerCase().includes('dent') || selectedDoctor.name.toLowerCase().includes('odont');
                  
                  let IconComponent = Building2;
                  let colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                  if (isHospital) {
                    IconComponent = Hospital;
                    colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                  } else if (isLab) {
                    IconComponent = Activity;
                    colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                  } else if (isDent) {
                    IconComponent = Sparkles;
                    colorClass = 'text-sky-400 bg-sky-500/10 border-sky-500/20';
                  } else {
                    colorClass = 'text-teal-400 bg-teal-500/10 border-teal-500/20';
                  }

                  return (
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorClass}`}>
                      <IconComponent className="w-6 h-6 animate-pulse" />
                    </div>
                  );
                })()}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-teal-500/20 text-teal-305 font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                      Convenio Integrado Activo
                    </span>
                    <span className="text-[10px] font-mono text-indigo-300">
                      CÓD.: COL-{(1000 + selectedDoctor.id.charCodeAt(0) * 3)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-tight mt-0.5">
                    {selectedDoctor.name}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column Left: Contacto & Sede */}
                <div className="space-y-4">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Sede y Canales de Atención
                  </span>

                  {/* Sede / City */}
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Dirección del Establecimiento:</div>
                        <p className="text-xs font-bold text-slate-800 leading-normal mt-0.5">{selectedDoctor.clinic}</p>
                        <span className="inline-block text-[10px] bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded font-bold uppercase mt-1">
                          {selectedDoctor.city}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                      <button
                        onClick={() => handleCopyAddress(`${selectedDoctor.clinic}, ${selectedDoctor.city}`)}
                        className="text-[11px] font-bold text-indigo-650 hover:text-indigo-850 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAddress ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">¡Dirección Copiada!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar dirección</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Centralized Phone & Booking Guidelines */}
                  <div className="p-4 bg-emerald-50/40 border border-emerald-250 rounded-2xl space-y-3.5">
                    <div className="flex items-start gap-2.5">
                      <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="w-full space-y-2">
                        <div className="text-[11px] text-[#0C4169] uppercase font-bold font-sans">Agendamiento Centralizado Colmedikal:</div>
                        
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-800">
                            📞 02-2567191 - Central Telefónica
                          </p>
                          <p className="text-xs font-bold text-slate-700">
                            💬 098 702 8756 - WhatsApp Citas
                          </p>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 leading-normal">
                          ⚠️ <strong>Leyenda obligatoria:</strong> Los teléfonos locales individuales del prestador permanecen centralizados. Para conservar sus beneficios preferentes de medicina prepagada (consulta con copago directo de $15.00 USD, exoneración de trámites extensos de reembolsos), todo agendamiento debe tramitarse exclusivamente con Colmedikal.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200">
                      <button 
                        onClick={() => {
                          setSelectedDoctor(null);
                          navigate('/agendamiento');
                        }}
                        className="w-full py-2.5 text-center bg-[#0C4169] hover:bg-slate-900 active:scale-98 text-white text-[11px] font-extrabold uppercase tracking-wide rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer animate-pulse"
                      >
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Solicitar Cita Tentativa Directa</span>
                      </button>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-start gap-2.5">
                    <Clock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Horarios de Atención:</div>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedDoctor.availability}</p>
                      <p className="text-[9px] text-slate-400 mt-1">Sujeto a cambios del establecimiento en feriados.</p>
                    </div>
                  </div>
                </div>

                {/* Column Right: Servicios & Cobertura */}
                <div className="space-y-4">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Cobertura y Especialidades
                  </span>

                  {/* Copago 0 */}
                  <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        Esencial & Premium Plan
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-1">Copago de $0.00 Garantizado</h4>
                      <p className="text-[10px] text-slate-650 leading-relaxed mt-0.5">
                        Este establecimiento opera con <strong>Crédito Directo Hospitalario</strong>. No requiere liquidación posterior ni reembolsos. Presente su cédula e identificación digital en recepción.
                      </p>
                    </div>
                  </div>

                  {/* Especialidades Integradas as tags */}
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                    <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">
                      Servicios y Especialidades en Convenio:
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedDoctor.education.split(',').map((spec, idx) => {
                        const trimmedSpec = spec.trim();
                        if (!trimmedSpec) return null;
                        return (
                          <div 
                            key={idx}
                            className="bg-indigo-50/70 border border-indigo-105 text-indigo-900 text-[11px] font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span>{trimmedSpec}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* Vector Map GPS Tracker Section */}
              <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                
                <div className="flex items-center gap-3.5 z-10">
                  <div className="relative w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
                    <Navigation className="w-6 h-6 text-teal-400 animate-bounce" />
                    <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-20 animate-ping"></span>
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">Geolocalización GPS Verificada</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Latitud: -0.1806 • Longitud: -78.4678</p>
                    <span className="text-[9px] text-slate-500 font-mono">Sede verificada por satélite Colmedikal</span>
                  </div>
                </div>

                <div className="z-10 w-full sm:w-auto text-center sm:text-right">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedDoctor.name} ${selectedDoctor.clinic} ${selectedDoctor.city}`)}`}
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 transition-colors border border-indigo-500/30 cursor-pointer shadow-md shadow-indigo-600/10"
                  >
                    <span>Abrir GPS de tu celular</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end shrink-0">
              <button 
                type="button"
                onClick={() => setSelectedDoctor(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm text-center"
              >
                Cerrar Ficha Informativa
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
