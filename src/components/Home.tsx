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
  Heart
} from 'lucide-react';
import { Plan, Page } from '../types';
import { MEDICAL_PLANS } from '../data';

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
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 lg:pt-24 bg-gradient-to-b from-teal-50/60 via-white to-slate-50">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-12 left-1/4 w-80 h-80 rounded-full bg-teal-200/50 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-12 right-1/4 w-96 h-96 rounded-full bg-indigo-150/45 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Description */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/50 text-teal-800 border border-teal-200/50 text-xs font-semibold uppercase tracking-wide w-fit mx-auto lg:mx-0">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Salud que te protege en todo momento</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
                El respaldo médico que tu vida <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">merece tener</span>
              </h1>
              
              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Descubre planes de medicina prepagada diseñados para acomodarse a ti, a tu familia o a los colaboradores de tu empresa. Coberturas amplias, respuesta sin demoras y una red nacional destacada.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => {
                    setSelectedPlanId('integral');
                    setCurrentPage('cotizador');
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#4f93c5] to-[#143b67] hover:from-[#143b67] hover:to-[#4f93c5] text-white font-medium shadow-lg shadow-[#143b67]/25 hover:shadow-[#143b67]/35 transition-all text-center flex items-center justify-center gap-2 group"
                  id="hero-cta-quote"
                >
                  <span>Cotizar mi Plan Ideal</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </button>
                
                <button
                  onClick={() => setCurrentPage('servicios')}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-medium border border-slate-200 shadow-sm transition-all text-center"
                  id="hero-cta-services"
                >
                  Ver Red de Servicios
                </button>
              </div>

              {/* Minimalist Trust Features */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 text-left max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Sin papeleos complejos</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Trámite 100% en línea</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Médicos con red propia</span>
                </div>
              </div>
            </div>

            {/* Right Column Illustration Card */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-3xl rotate-3 scale-102 opacity-10 blur-xl"></div>
              
              {/* Overlapping layered medical imagery or UI cards */}
              <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-6 glow-teal">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600" 
                  alt="Doctora sonriendo con paciente" 
                  className="w-full h-64 object-cover rounded-2xl mb-6 shadow-neutral-200"
                  referrerPolicy="no-referrer"
                />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-teal-50 px-4 py-3.5 rounded-xl border border-teal-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center">
                        <ShieldCheck className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-teal-950">Atención Garantizada</span>
                        <span className="block text-[10px] text-teal-700">Copagos reducidos</span>
                      </div>
                    </div>
                    <span className="text-teal-600 font-mono text-sm font-bold">85% Cobertura</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <Award className="w-4 h-4 text-indigo-600" /> Líder en Calidad Médica
                    </span>
                    <span className="font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
                      Colmedical S.A.
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Floating micro-badges */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3 animate-bounce duration-5000">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Clock className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Respuesta Rápida</span>
                  <span className="block text-[10px] text-slate-500">Autorizaciones s/espera</span>
                </div>
              </div>
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
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">¿Por qué Colmedical?</span>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
            Ofrecemos el respaldo que los seguros tradicionales omiten
          </h2>
          <p className="text-slate-600">
            Combinamos una red hospitalaria de confianza con servicios digitales innovadores que agilizan tus consultas médicos, citas y reembolsos financieros.
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
              const isRecommended = plan.id === 'integral';

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
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      Recomendado por Humana
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
                          ? 'bg-gradient-to-r from-[#4f93c5] to-[#143b67] text-white shadow-lg shadow-[#143b67]/15 hover:shadow-[#143b67]/25'
                          : 'bg-slate-100 hover:bg-[#4f93c5]/10 hover:text-[#143b67] text-slate-700 border border-slate-200'
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
                  setSelectedPlanId('integral');
                  setCurrentPage('cotizador');
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#4f93c5] to-[#143b67] hover:from-[#143b67] hover:to-[#4f93c5] text-white font-bold transition-all shadow-md group"
                id="footer-cta-quote"
              >
                Ingresar al Cotizador
              </button>
              <button
                onClick={() => setCurrentPage('contacto')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-850 hover:bg-slate-800 text-white font-medium border border-slate-750 transition-all flex items-center justify-center gap-2"
                id="footer-cta-support"
              >
                <PhoneCall className="w-4.5 h-4.5 text-[#4f93c5]" />
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
