import React, { useState, useEffect } from 'react';
import {
  SERVICES_LIST,
} from '../data';
import { Doctor } from '../types';
import heroAppointmentImg from '../assets/images/colmedikal_appointment_doctor_1780587953695.webp';
import { 
  Search, 
  Hospital, 
  MapPin, 
  Activity, 
  ArrowRight,
  ClipboardCheck,
  Globe,
  Sparkles,
  PhoneCall,
  Stethoscope,
  Heart,
  CalendarDays
} from 'lucide-react';
import { Page } from '../types';

interface ServicesProps {
  setCurrentPage: (page: Page) => void;
}

export default function Services({ setCurrentPage }: ServicesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    fetch('https://api.colmedikal.com/api/doctors?limit=500')
      .then(r => r.json())
      .then(d => setDoctors((d.data || []).filter((doc: Doctor) => doc.active !== false)))
      .catch(() => {});
  }, []);

  const filteredDoctors = doctors.filter(doc =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.city?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 6);

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedikal-services-view">
      
      {/* 1. Header & Lead */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Redes y Servicios</span>
        <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Nuestra Cobertura de Prestadores y Servicios Médicos
        </h1>
        <p className="text-slate-600">
          En Colmedikal nos enorgullece brindar acceso preferencial a los mejores especialistas, clínicas privadas y laboratorios del país. Conoce nuestros beneficios integrales.
        </p>
      </div>

      {/* 1.5. HOSPITAL VISUAL BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 -mt-6">
        <div className="relative rounded-3xl overflow-hidden shadow-lg h-64 bg-gradient-to-br from-[#0C4169] to-[#4597CA] flex items-center justify-center">
          <svg viewBox="0 0 100 100" fill="none" className="w-32 h-32 opacity-90 drop-shadow-xl">
            <path d="M 35 35 L 25 35 A 15 15 0 0 0 25 65 L 35 65 L 35 75 A 15 15 0 0 0 65 75 L 65 65 Z" fill="#4597CA"/>
            <path d="M 35 35 L 35 25 A 15 15 0 0 1 65 25 L 65 35 L 75 35 A 15 15 0 0 1 75 65 L 65 65 Z" fill="white"/>
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C4169]/70 to-transparent flex items-end p-6">
            <div>
              <span className="text-xs font-bold text-teal-300 uppercase tracking-widest block mb-1">Red Hospitalaria</span>
              <h3 className="text-lg font-extrabold text-white leading-tight">Hospitales y Clínicas de Primer Nivel</h3>
            </div>
          </div>
        </div>
        <div className="relative rounded-3xl overflow-hidden shadow-lg h-64">
          <img
            src={heroAppointmentImg}
            alt="Atención médica de especialistas Colmedikal"
            className="w-full h-full object-cover object-top"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C4169]/70 to-transparent flex items-end p-6">
            <div>
              <span className="text-xs font-bold text-teal-300 uppercase tracking-widest block mb-1">Especialistas Certificados</span>
              <h3 className="text-lg font-extrabold text-white leading-tight">Atención Médica Especializada sin Barreras</h3>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SERVICES GRID CARD MODULE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
        {SERVICES_LIST.map((service) => {
          return (
            <div 
              key={service.id}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-300 flex flex-col justify-between group"
              id={`service-card-${service.id}`}
            >
              <div className="space-y-5">
                {/* Header Icon Representation */}
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                  {service.id === 'consulta-externa' && <Stethoscope className="w-6 h-6" />}
                  {service.id === 'hospitalizacion' && <Hospital className="w-6 h-6" />}
                  {service.id === 'emergencias-24-7' && <Activity className="w-6 h-6" />}
                  {service.id === 'maternidad' && <Heart className="w-6 h-6" />}
                  {service.id === 'odontologia' && <Sparkles className="w-6 h-6" />}
                  {service.id === 'farmacia' && <ClipboardCheck className="w-6 h-6" />}
                </div>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {service.title}
                </h3>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">Incluido en Plan Esencial/Premium</span>
                <button
                  onClick={() => setCurrentPage('cotizador')}
                  className="text-teal-600 font-semibold group-hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                >
                  Cotizar cobertura <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. REFUND AND AUTHORIZATION HOW-TO */}
      <section className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white overflow-hidden shadow-xl border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono tracking-widest text-teal-400 uppercase font-semibold">Procesos Ágiles</span>
            <h2 className="text-3xl font-display font-bold leading-tight">
              ¿Cómo funcionan nuestros reembolsos y autorizaciones?
            </h2>
            <p className="text-slate-350 text-xs leading-relaxed">
              En Colmedikal honramos el tiempo de nuestros afiliados. Olvidad los trámites burocráticos engorrosos de seguros médicos del pasado.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold shrink-0 mt-0.5 text-sm">1</div>
                <div>
                  <h4 className="text-sm font-bold">Autorización en tiempo récord</h4>
                  <p className="text-xs text-slate-400">Envíanos tu orden médica desde el celular. El 92% de las autorizaciones quirúrgicas se gestionan en menos de 4 horas hábiles.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold shrink-0 mt-0.5 text-sm">2</div>
                <div>
                  <h4 className="text-sm font-bold">Reembolso directo simplificado</h4>
                  <p className="text-xs text-slate-400">Si te atiendes de forma externa fuera de nuestra red de convenio, sube la factura digitalizada y tu prescripción médica para recibir el dinero de vuelta en 48hs hábiles.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-800/55 p-6 rounded-2xl border border-slate-700/80 space-y-6">
            <h3 className="text-lg font-bold text-center border-b border-slate-700 pb-3">Canales de Atención Alternos</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-slate-900/60 p-4.5 rounded-xl border border-slate-700/50 space-y-1 text-center">
                <PhoneCall className="w-5 h-5 text-teal-400 mx-auto mb-2" />
                <span className="block text-xs font-bold font-mono">02-2567191</span>
                <span className="block text-[10px] text-slate-400">Atención telefónica gratuita</span>
              </div>

              <div className="bg-slate-900/60 p-4.5 rounded-xl border border-slate-700/50 space-y-1 text-center">
                <Globe className="w-5 h-5 text-teal-400 mx-auto mb-2" />
                <span className="block text-xs font-bold">Telemedicina Express</span>
                <span className="block text-[10px] text-slate-400">Videoconsulta sin cita</span>
              </div>

            </div>

            <div className="bg-teal-500/10 p-4 rounded-xl border border-teal-500/30">
              <span className="block text-xs text-teal-300 font-bold mb-1">💡 Nota de preexistencia</span>
              <p className="text-[11px] text-teal-100/80 leading-relaxed">
                De acuerdo con la reglamentación ecuatoriana y de medicina prepagada de Ecuador, las enfermedades preexistentes declaradas tienen un periodo de carencia estándar y tratamiento especial. Consulta con un asesor para los detalles de cobertura.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. DIRECTORIO DE MÉDICOS EN RED */}
      <section className="space-y-8 bg-slate-50 p-8 rounded-3xl border border-slate-200">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-slate-900">
              Médicos de Nuestra Red
            </h2>
            <p className="text-xs text-slate-500">
              Especialistas certificados disponibles para atención directa con cobertura Colmedikal.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, especialidad o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder:text-slate-400"
              id="doctor-network-search"
            />
          </div>
        </div>

        {doctors.length === 0 ? (
          <div className="bg-white text-center py-12 rounded-2xl border border-slate-200 space-y-4">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm text-slate-600 font-semibold">Cargando directorio médico...</p>
              <p className="text-xs text-slate-400">Los especialistas se mostrarán en un momento.</p>
            </div>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-teal-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 font-black text-base">
                    {doc.name?.charAt(0) || 'M'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{doc.name}</h4>
                    <p className="text-[11px] text-teal-600 font-semibold">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" /> {doc.city}
                    </p>
                  </div>
                </div>

                {doc.clinic && (
                  <div className="text-[10.5px] text-slate-600 border-t border-slate-100 pt-3">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-0.5">Clínica</span>
                    {doc.clinic}
                  </div>
                )}

                {doc.phone && (
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Contacto:</span>
                    <a href={`tel:${doc.phone}`} className="font-mono text-teal-600 hover:underline font-semibold">
                      {doc.phone}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white text-center py-12 rounded-2xl border border-slate-200 space-y-4">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm text-slate-600 font-semibold">No se encontraron médicos para ese criterio.</p>
              <p className="text-xs text-slate-400">Prueba con otra especialidad o ciudad.</p>
            </div>
            <button onClick={() => setSearchTerm('')} className="text-xs font-semibold text-teal-600 hover:underline">
              Ver todos los médicos
            </button>
          </div>
        )}

        <div className="bg-indigo-50/50 p-4 rounded-2xl text-xs text-indigo-950 border border-indigo-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>¿Deseas ver el directorio completo o agendar una cita con alguno de nuestros especialistas?</span>
          </div>
          <button
            onClick={() => setCurrentPage('directorio')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shrink-0 text-xs font-mono"
          >
            Ver Directorio Completo
          </button>
        </div>

      </section>

    </div>
  );
}
