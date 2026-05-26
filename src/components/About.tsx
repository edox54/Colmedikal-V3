import React from 'react';
import { 
  Award, 
  ShieldAlert, 
  Smile, 
  Fingerprint, 
  MapPin, 
  Gem, 
  HeartHandshake,
  CheckCircle,
  Plus
} from 'lucide-react';
import { Page } from '../types';

interface AboutProps {
  setCurrentPage: (page: Page) => void;
}

export default function About({ setCurrentPage }: AboutProps) {
  
  const values = [
    {
      title: 'Empatía Genuina',
      description: 'Entendemos que detrás de cada consulta médica hay un ser humano buscando paz. Ponemos el bienestar personal antes de cualquier trámite financiero.',
      icon: Smile,
      color: 'text-emerald-500'
    },
    {
      title: 'Transparencia Absoluta',
      description: 'Nuestras coberturas, copagos, límites de reembolso y exclusiones son claros desde el inicio. Sin letra pequeña ni sorpresas en tus facturas.',
      icon: Fingerprint,
      color: 'text-teal-500'
    },
    {
      title: 'Respuesta Inmediata',
      description: 'En emergencias de salud, cada segundo cuenta. Automatizamos nuestras autorizaciones médicas para reducir tiempos de espera drásticamente.',
      icon: HeartHandshake,
      color: 'text-indigo-500'
    }
  ];

  return (
    <div className="space-y-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedical-about-view">
      
      {/* 1. HERO OF ABOUT US */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Sobre Nosotros</span>
          <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Cuidando de ti con excelencia médica y corazón humano
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Herederos de un compromiso sólido en el sector salud, en Colmedical nos enfocamos en reformular el concepto de la medicina prepagada. Creamos un canal de protección integrado que destaca por su velocidad tecnológica, calidez en la atención y respaldo clínico absoluto.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            Nuestros planes se inspiran en la solidez metodológica y de servicio que proyectan marcas como Humana, adaptados a la realidad y necesidades locales, garantizando tarifas competitivas y beneficios complementarios que realmente marcan la diferencia.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
              <span className="block text-2xl font-bold text-teal-700 font-mono">+150k</span>
              <span className="text-xs text-slate-500 font-medium">Consultas gestionadas anualmente</span>
            </div>
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <span className="block text-2xl font-bold text-indigo-700 font-mono">99.2%</span>
              <span className="text-xs text-slate-500 font-medium">De cirugías aprobadas con éxito</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-3xl opacity-10 blur-xl"></div>
          <div className="relative bg-white rounded-3xl p-6 border border-slate-150 shadow-xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600" 
              alt="Instalaciones de Colmedical Center"
              className="w-full h-80 object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-10 left-10 right-10 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-100 text-center">
              <h4 className="text-xs font-bold text-slate-900">Sede Principal Colmedical Center</h4>
              <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Av. Amazonas y Atahualpa, Quito - Ecuador
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MISSION AND VISION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-gradient-to-tr from-slate-50 to-teal-50/30 p-8 rounded-3xl border border-slate-150 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold mb-6">
            <Gem className="w-5.5 h-5.5" />
          </div>
          <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">Nuestra Misión</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Brindar protección de salud médica integral a través de un servicio de medicina prepagada empático, veloz y sin trabas burocráticas, permitiendo que cada afiliado acceda a la mayor red de especialistas con total confianza y bienestar familiar garantizado.
          </p>
        </div>

        <div className="bg-gradient-to-tr from-slate-50 to-indigo-50/30 p-8 rounded-3xl border border-slate-150 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-bold mb-6">
            <Award className="w-5.5 h-5.5" />
          </div>
          <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">Nuestra Visión</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Consolidarnos para el año 2028 como la entidad de medicina prepagada con el índice de recomendación y satisfacción tecnológica más alto en la región, extendiendo coberturas innovadoras, atención remota instantánea y garantizando tarifas coherentes y accesibles.
          </p>
        </div>

      </section>

      {/* 3. CORPORATE VALUES */}
      <section className="space-y-12 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Código Etico</span>
          <h3 className="text-2xl sm:text-3xl font-display font-semibold text-slate-900">
            Los pilares que fundamentan cada decisión médica
          </h3>
          <p className="text-xs text-slate-500">
            No somos solo una aseguradora de salud; somos un equipo humano dedicado a simplificar tu vida y asegurar tu futuro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div key={idx} className="space-y-3 p-4 rounded-2xl hover:bg-slate-50/80 transition-colors" id={`value-${idx}`}>
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold ${val.color} border border-slate-100 shadow-sm`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{val.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {val.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SOLIDITY AND ACCREDITATIONS */}
      <section className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1 bg-teal-950/80 border border-teal-800 text-teal-400 px-3 py-1 rounded-lg text-xs font-semibold uppercase">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Respaldo Institucional Sólido</span>
            </div>
            
            <h3 className="text-3xl font-display font-bold text-white tracking-tight leading-snug">
              Cumplimiento normativo y certificaciones del sector
            </h3>
            
            <p className="text-xs text-slate-450 leading-relaxed">
              Colmedical S.A. opera bajo la estricta vigilancia de la Superintendencia de Compañías, Valores y Seguros del Ecuador y cuenta con amplias reaseguradoras de prestigio nacional e internacional para garantizar la liquidez inmediata en casos de cirugías complejas de alta cobertura.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-350">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Auditoría médica del 100% de expedientes sin demoras</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Fondos de reserva custodiados y certificados legalmente</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Soporte del portafolio médico certificado ISO-9001</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-teal-400 font-mono text-center pb-2 border-b border-white/10">Estadísticas Clave del Último Periodo</h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Satisfacción del Afiliado</span>
                  <span className="font-mono text-teal-400">98.7%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '98.7%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Tiempo de procesado Reembolsos</span>
                  <span className="font-mono text-teal-400">Media 41 Horas</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Acreditación de Especialistas</span>
                  <span className="font-mono text-teal-400">Excelente (A1)</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => setCurrentPage('cotizador')}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Ingresar para Cotizar Planes
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
