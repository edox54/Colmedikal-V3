import React, { useState } from 'react';
import { 
  SERVICES_LIST, 
} from '../data';
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
  Flame,
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
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'clinica' | 'especialidad'>('all');

  // Interactive diagnostic search database
  const clinicNetworkData = [
    { name: 'Clínica San Francisco', city: 'Quito', rating: 'Nivel A1', specialty: 'Urgencias, Cardiología, Maternidad', tel: '02-3951000' },
    { name: 'Hospital Metropolitano', city: 'Quito', rating: 'Nivel A1 Premium', specialty: 'Cirugías de alta complejidad', tel: '02-3998000' },
    { name: 'Clínica Kennedy', city: 'Guayaquil', rating: 'Nivel A1', specialty: 'Dermatología, Traumatología, Neo', tel: '04-2289600' },
    { name: 'Hospital Alcívar', city: 'Guayaquil', rating: 'Nivel A2', specialty: 'Especialistas traumatología general', tel: '04-2583300' },
    { name: 'Clínica Santa Inés', city: 'Cuenca', rating: 'Nivel A1', specialty: 'Cirugía pediátrica, Oncología', tel: '07-2815500' },
    { name: 'Clínica Manta', city: 'Manta', rating: 'Nivel A2', specialty: 'Ginecología y urgencias respiratorias', tel: '05-2621400' }
  ];

  const filteredClinics = clinicNetworkData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedical-services-view">
      
      {/* 1. Header & Lead */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Redes y Servicios</span>
        <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Nuestra Cobertura de Prestadores y Servicios Médicos
        </h1>
        <p className="text-slate-600">
          En Colmedical nos enorgullece brindar acceso preferencial a los mejores especialistas, clínicas privadas y laboratorios del país. Conoce nuestros beneficios integrales.
        </p>
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

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Benefits Bullet points */}
                <div className="pt-3 space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Beneficios Destacados:</span>
                  <ul className="space-y-2">
                    {service.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-2 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">Incluido en Plan Integral/Elite</span>
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
              En Colmedical honramos el tiempo de nuestros afiliados. Olvidad los trámites burocráticos engorrosos de seguros médicos del pasado.
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
                <span className="block text-xs font-bold font-mono">1800-265633</span>
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
                De acuerdo con la reglamentación ecuatoriana y de medicina prepagada colombiana, las enfermedades preexistentes declaradas tienen un periodo de carencia estándar y tratamiento especial. Consulta con un asesor para los detalles de cobertura.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE CLINICS NETWORK DIRECTORY */}
      <section className="space-y-8 bg-slate-50 p-8 rounded-3xl border border-slate-200">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-slate-900">
              Directorio Interactivo de Clínicas en Red
            </h2>
            <p className="text-xs text-slate-500">
              Usa el campo de búsqueda para ubicar de inmediato cuáles clínicas cuentan con cobertura directa Colmedical.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por Nombre, Ciudad o Especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder:text-slate-400"
              id="clinic-network-search"
            />
          </div>
        </div>

        {/* Clinics render table/cards */}
        {filteredClinics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClinics.map((clinic, index) => (
              <div 
                key={index} 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-indigo-200 transition-colors"
                id={`clinic-item-${index}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <Hospital className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{clinic.name}</h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" /> {clinic.city}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-mono font-semibold">
                    {clinic.rating}
                  </span>
                </div>

                <div className="text-xs border-t border-slate-100 pt-3 space-y-1.5 text-slate-600">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Especialidades con Tratamiento Directo:</span>
                  <p>{clinic.specialty}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Teléfono Directo:</span>
                  <a href={`tel:${clinic.tel}`} className="font-mono text-indigo-600 hover:underline font-semibold">
                    {clinic.tel}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white text-center py-12 rounded-2xl border border-slate-200 space-y-4">
            <Hospital className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm text-slate-600 font-semibold">No se encontraron clínicas para tu criterio de búsqueda.</p>
              <p className="text-xs text-slate-400">Prueba con "Quito", "Guayaquil", "Mantenimiento" o ingresando otro término.</p>
            </div>
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              Reiniciar búsqueda
            </button>
          </div>
        )}

        <div className="bg-indigo-50/50 p-4 rounded-2xl text-xs text-indigo-950 border border-indigo-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>¿Requieres agendar un turno con un médico en particular en estas clínicas?</span>
          </div>
          <button
            onClick={() => setCurrentPage('contacto')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shrink-0 text-xs font-mono"
          >
            Soporte Citas Online
          </button>
        </div>

      </section>

    </div>
  );
}
