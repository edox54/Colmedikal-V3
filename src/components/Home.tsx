import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  PhoneCall, 
  Plus, 
  Award,
  Clock,
  Heart,
  Calendar,
  FileText,
  Mail
} from 'lucide-react';
import { Plan, Page } from '../types';
import { MEDICAL_PLANS } from '../data';
import Logo from './Logo';
const heroBannerImg = "./src/assets/images/colmedikal_doctor_family_hero_1780008609458.png";

interface HomeProps {
  setCurrentPage: (page: Page) => void;
  setSelectedPlanId: (id: string) => void;
}

export default function Home({ setCurrentPage, setSelectedPlanId }: HomeProps) {
  
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setCurrentPage('cotizador');
  };

  const stats = [
    { value: '+20 Años', label: 'Líderes en Medicina Prepagada' },
    { value: '98.7%', label: 'Satisfacción en atención y reembolsos' },
    { value: '+600', label: 'Especialistas clínicos asociados' },
    { value: '24 Horas', label: 'Asistencia inmediata de emergencias' },
  ];

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden" id="colmedical-home-view">
      
      {/* 1. HERO SECTION - NEW STUNNING BANNER PORTAL MATCHING THE CLIENT'S DESIGN */}
      <section className="relative pt-6 md:pt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="colmedikal-custom-hero-banner">
        
        {/* Banner Card Frame styled like a premium mock website window */}
        <div className="relative w-full rounded-3xl border border-slate-200/95 bg-gradient-to-r from-slate-100 via-[#ecf3f8] to-[#f4f8fb] shadow-xl overflow-hidden min-h-[420px] lg:min-h-[480px] flex flex-col lg:flex-row items-stretch justify-between transition-all duration-300">
          
          {/* Subtle medical crosses watermarks on left/middle background matching draft */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Top-left big subtle medical cross */}
            <svg className="absolute -top-12 -left-12 w-60 h-60 text-[#dbe5f0] opacity-80" viewBox="0 0 100 100" fill="currentColor">
              <path d="M 38 10 H 62 V 38 H 90 V 62 H 62 V 90 H 38 V 62 H 10 V 38 H 38 Z" />
            </svg>
            {/* Middle subtle medical cross */}
            <svg className="absolute top-[20%] left-[32%] w-28 h-28 text-[#e3edf7] opacity-65" viewBox="0 0 100 100" fill="currentColor">
              <path d="M 38 10 H 62 V 38 H 90 V 62 H 62 V 90 H 38 V 62 H 10 V 38 H 38 Z" />
            </svg>
            {/* Bottom subtle cross pointer */}
            <svg className="absolute bottom-4 left-16 w-20 h-20 text-[#dae6f2] opacity-50" viewBox="0 0 100 100" fill="currentColor">
              <path d="M 38 10 H 62 V 38 H 90 V 62 H 62 V 90 H 38 V 62 H 10 V 38 H 38 Z" />
            </svg>
          </div>

          {/* Left Column content: Branding identity, titles, buttons */}
          <div className="relative z-10 flex-1 flex flex-col justify-between p-7 sm:p-10 lg:p-12 space-y-8 lg:space-y-0 max-w-2xl">
            
            {/* Dynamic Brand Logo Integration inside banner as per draft */}
            <div className="flex items-center">
              <Logo className="h-10 sm:h-12 w-auto" />
            </div>

            {/* Standard texts from client's mockup */}
            <div className="space-y-3 sm:space-y-4 pt-4">
              <p className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#5d7c9a] uppercase font-sans">
                BIENVENIDOS A TU PORTAL DE BIENESTAR
              </p>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#143b67] tracking-tight leading-[1.1] font-sans">
                TU SALUD EN LAS <br />
                <span className="font-black text-[#143b67] tracking-tighter">MEJORES MANOS</span>
              </h1>
              
              <p className="text-[10px] sm:text-xs font-bold text-[#143b67]/90 tracking-wide font-sans uppercase">
                CUIDANDO DE TI Y TU FAMILIA, HOY Y SIEMPRE.
              </p>
            </div>

            {/* Micro pills / buttons on bottom left */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 lg:pt-0">
              <button
                onClick={() => setCurrentPage('directorio')}
                className="px-6 py-3 sm:py-3.5 rounded-full bg-[#10b981] hover:bg-[#059669] active:scale-97 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all duration-300 text-center cursor-pointer border border-[#34d399]"
                id="banner-cta-directorio"
              >
                AGENDAR CITA PREVENTIVA
              </button>
              
              <button
                onClick={() => setCurrentPage('portal')}
                className="px-6 py-3 sm:py-3.5 rounded-full bg-[#11294a] hover:bg-[#091b34] active:scale-97 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all duration-300 text-center cursor-pointer border border-[#1e3a63]"
                id="banner-cta-portal"
              >
                INGRESAR AL PORTAL DE PACIENTES
              </button>
            </div>

          </div>

          {/* Right Column Content - Integrated Doctor Family Graphic + Floating Side Control Tabs */}
          <div className="relative flex-1 min-h-[320px] lg:min-h-full overflow-hidden bg-slate-100 flex flex-col lg:flex-row items-stretch">
            
            {/* The beautiful generated doctor family illustration */}
            <div className="relative flex-1 min-h-[300px] lg:min-h-full overflow-hidden">
              <img 
                src={heroBannerImg}
                alt="Doctora Colmedikal y Familia Satisfecha"
                className="absolute inset-0 w-full h-full object-cover z-0 object-center"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Adaptive shortcuts panel:
                On mobile and tablet, it sits horizontally below the graphic without cut-offs.
                On desktop, it is a vertical panel next to the image.
            */}
            <div className="w-full lg:w-28 xl:w-32 bg-[#0C4169]/95 lg:bg-[#0C4169]/85 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/10 flex flex-row lg:flex-col justify-around lg:justify-center items-stretch z-20 divide-x lg:divide-x-0 lg:divide-y divide-white/10">
              
              <button 
                onClick={() => setCurrentPage('directorio')}
                className="flex-1 lg:flex-none lg:py-8 flex flex-col items-center justify-center p-3 text-white hover:bg-white/10 transition-colors group cursor-pointer"
                title="Ver Red de Afiliados"
              >
                <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-emerald-500/20 group-hover:scale-105 flex items-center justify-center transition-all shadow-sm">
                  <Calendar className="w-4.5 h-4.5 text-[#10b981]" />
                </div>
                <span className="text-[10px] lg:text-[11px] mt-2 font-bold tracking-tight text-slate-200 text-center leading-tight">
                  Red de <br className="hidden lg:block" /> Afiliados
                </span>
              </button>

              <button 
                onClick={() => setCurrentPage('cotizador')}
                className="flex-1 lg:flex-none lg:py-8 flex flex-col items-center justify-center p-3 text-white hover:bg-white/10 transition-colors group cursor-pointer"
                title="Cotizar tu plan de medicina prepagada"
              >
                <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-indigo-400/20 group-hover:scale-105 flex items-center justify-center transition-all shadow-sm">
                  <FileText className="w-4.5 h-4.5 text-indigo-300" />
                </div>
                <span className="text-[10px] lg:text-[11px] mt-2 font-bold tracking-tight text-slate-200 text-center leading-tight">
                  Cotizar <br className="hidden lg:block" /> Plan
                </span>
              </button>

              <button 
                onClick={() => setCurrentPage('contacto')}
                className="flex-1 lg:flex-none lg:py-8 flex flex-col items-center justify-center p-3 text-white hover:bg-white/10 transition-colors group cursor-pointer"
                title="Contacto y Soporte"
              >
                <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-rose-400/20 group-hover:scale-105 flex items-center justify-center transition-all shadow-sm">
                  <Mail className="w-4.5 h-4.5 text-rose-400" />
                </div>
                <span className="text-[10px] lg:text-[11px] mt-2 font-bold tracking-tight text-slate-200 text-center leading-tight">
                  Mensajes
                </span>
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* 2. STATS SECTION */}
      <section className="bg-gradient-to-r from-teal-600 to-indigo-700 py-12 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-2 border-r last:border-r-0 border-white/20 px-2" id={`stat-${idx}`}>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-teal-100/90 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-brand-light tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Nuestra Misión y Valores
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
            "El mejor servicio en seguros de salud para socios Cooperativistas"
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Guiados por nuestros pilares fundamentales de <span className="font-semibold text-brand-dark">Honestidad, Transparencia, Compromiso, Respeto</span>, ofrecemos el verdadero resguardo médico que supera las expectativas del sector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-2xl border border-slate-150 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Red Hospitalaria Selecta</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Atención garantizada en los mejores centros y complejos hospitalarios del país. Tú decides el especialista que prefieres a través de nuestra red abierta de salud.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-150 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Telemedicina Integral 24/7</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Consultas ilimitadas online de atención primaria en medicina general, nutrición y psicología, directo desde cualquier dispositivo y sin necesidad de copagos.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-150 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Trámites e Historial Online</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Descarga recetas, tramita autorizaciones, consulta reembolsos y actualiza tus beneficiarios directo desde nuestra app web. El control en la palma de tu mano.
            </p>
          </div>

        </div>
      </section>

      {/* 4. PLANS HIGHLIGHT SECTION */}
      <section className="bg-slate-50 py-20 border-y border-slate-200/60" id="planes-destacados">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">Portafolio de Coberturas</span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              Planes a tu medida inspirados en bienestar real
            </h2>
            <p className="text-slate-600">
              Analiza las coberturas y tarifas de nuestros tres planes principales diseñados con la flexibilidad e integridad de los esquemas médicos de Humana.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {MEDICAL_PLANS.map((plan) => {
              const itemColor = plan.color === 'emerald' ? 'emerald' : plan.color === 'teal' ? 'teal' : 'indigo';
              const isRecommended = plan.id === 'esencial';

              return (
                <div 
                  key={plan.id}
                  className={`bg-white rounded-3xl p-8 border transition-all relative flex flex-col justify-between ${
                    isRecommended 
                      ? 'border-indigo-500 shadow-xl lg:scale-105 z-10' 
                      : 'border-slate-200 hover:border-teal-400 hover:shadow-md'
                  }`}
                  id={`plan-card-${plan.id}`}
                >
                  {isRecommended && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0C4169] to-[#4597CA] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      Recomendado por Colmedikal
                    </span>
                  )}

                  <div className="space-y-6">
                    {/* Header Plan */}
                    <div className="space-y-1">
                      <h3 className={`text-2xl font-bold ${
                        itemColor === 'emerald' ? 'text-emerald-700' : itemColor === 'teal' ? 'text-teal-700' : 'text-indigo-700'
                      }`}>
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 italic max-w-sm">
                        {plan.tagline}
                      </p>
                    </div>

                    {/* Price and Cover summary */}
                    <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-100 divide-y divide-slate-200/50 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-500 uppercase font-medium">Tarifa Base</span>
                        <div className="text-right">
                          <span className="text-3xl font-mono font-bold text-slate-900">${plan.basePrice.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-500 block">/ Mes por afiliado</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-3 text-xs">
                        <span className="text-slate-500">Cobertura Máxima</span>
                        <span className="font-semibold text-slate-900 font-mono">${plan.maxCoverage.toLocaleString()} USD</span>
                      </div>

                      <div className="flex justify-between pt-2.5 text-xs">
                        <span className="text-slate-500">Copago del Afiliado</span>
                        <span className="font-semibold text-slate-800 font-mono">{plan.copayPercent}%</span>
                      </div>
                    </div>

                    {/* Bullet Inclusions */}
                    <div className="space-y-3 pt-2">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Cobertura Incluida:</span>
                      <ul className="space-y-2.5">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                              itemColor === 'emerald' ? 'bg-emerald-500' : itemColor === 'teal' ? 'bg-teal-500' : 'bg-indigo-500'
                            }`} />
                            <span className="text-slate-600 leading-tight">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pricing CTA */}
                  <div className="pt-8">
                    <button
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all text-center flex items-center justify-center gap-2 group cursor-pointer ${
                        isRecommended
                          ? 'bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white shadow-lg shadow-[#0C4169]/15 hover:shadow-[#0C4169]/25'
                          : 'bg-slate-100 hover:bg-[#4597CA]/10 hover:text-[#0C4169] text-slate-700 border border-slate-200'
                      }`}
                      id={`btn-quote-${plan.id}`}
                    >
                      <span>Simular Cotización</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <span className="block text-[10px] text-center text-slate-400 mt-2">
                      Sujeto a preexistencias y condiciones generales de salud
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. USER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Testimonios Reales</span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight leading-tight">
              Personas que confían su salud a Colmedical
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              La cercanía y calidez de un plan prepagado se mide en momentos difíciles. Estuvimos ahí para nuestros clientes cuando más lo necesitaron. Conoce sus historias de tranquilidad con el respaldo médico de Colmedical.
            </p>
            
            <div className="flex gap-4 items-center pt-2">
              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span className="font-semibold text-slate-900 text-sm">4.9 / 5.0</span>
                <span className="text-xs text-slate-400 font-medium">Score Dr. Clientes</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:translate-y-[-4px] transition-transform flex flex-col justify-between space-y-4">
              <p className="text-xs italic text-slate-600 leading-relaxed">
                "Como profesional de la salud corporal, sé lo valioso que es un soporte hospitalario veloz y confiable. Colmedical siempre me ha dado la mejor red de respuesta y el cotizador me permitió ver exactamente qué pagaría sin tarifas ocultas."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  className="w-10 h-10 rounded-full object-cover shrink-0" 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120" 
                  alt="Dra. Valentina"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900">Dra. Valentina Mendoza</span>
                  <span className="block text-[10px] text-slate-500">Odontóloga / Afiliada</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:translate-y-[-4px] transition-transform flex flex-col justify-between space-y-4">
              <p className="text-xs italic text-slate-600 leading-relaxed">
                "Con tres hijos pequeños, las visitas al pediatra son constantes. Nuestro plan familiar nos ahorra cientos de dólares en copagos y la cobertura hospitalaria nos dio paz total en una hospitalización menor de nuestro hijo mayor."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  className="w-10 h-10 rounded-full object-cover shrink-0" 
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=120" 
                  alt="Carlos y Elena"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900">Carlos & Elena Ramos</span>
                  <span className="block text-[10px] text-slate-500">Plan Familiar Integral</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. CONVERTING CALL TO ACTION AREA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-tight">
              ¿Listo para dar el paso hacia un cuidado médico premium?
            </h2>
            <p className="text-slate-300 text-base max-w-md mx-auto">
              Usa nuestro cotizador personalizado instantáneo para calcular los precios de tu plan ideal en menos de 2 minutos.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setSelectedPlanId('esencial');
                  setCurrentPage('cotizador');
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#4597CA] to-[#0C4169] hover:from-[#0C4169] hover:to-[#4597CA] text-white font-bold transition-all shadow-md group cursor-pointer"
                id="footer-cta-quote"
              >
                Ingresar al Cotizador
              </button>
              <button
                onClick={() => setCurrentPage('contacto')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-850 hover:bg-slate-800 text-white font-medium border border-slate-750 transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="footer-cta-support"
              >
                <PhoneCall className="w-4.5 h-4.5 text-[#4597CA]" />
                <span>Hablar con un asesor</span>
              </button>
            </div>
            <span className="block text-xs text-slate-400 font-mono pt-2">
              Asistencia telefónica inmediata: 1800-COLMED (265633)
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
