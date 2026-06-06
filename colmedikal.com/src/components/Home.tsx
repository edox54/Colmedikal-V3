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
import { Plan } from '../types';
import { MEDICAL_PLANS } from '../data';
import Logo from './Logo';
import { useNavigate } from 'react-router-dom';
import heroBannerImg from '../assets/images/colmedikal_doctor_family_hero_1780008609458.png';
import heroBuildingImg from '../assets/images/sede_principal_building_1780025281820.png';
import heroAppointmentImg from '../assets/images/colmedikal_appointment_doctor_1780587953695.png';
import avatarValentina from '../assets/images/avatar_valentina_1780025241348.png';
import avatarCarlosElena from '../assets/images/avatar_carlos_elena_1780025264251.png';

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const slides = [
    {
      id: 'cotizador',
      badge: 'BIENVENIDOS A COLMEDIKAL',
      title: 'TRANQUILIDAD PARA TU VIDA, SEGURIDAD PARA TU FAMILIA',
      subtitle: 'CUIDANDO DE TI Y TU FAMILIA, HOY Y SIEMPRE.',
      extraText: 'Calcula tu propuesta médica prepagada 100% personalizada en 2 minutos.',
      buttonText: 'COTIZAR MI PLAN DE SALUD',
      image: heroBannerImg,
      targetPath: '/cotizador',
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
    {
      id: 'directorio',
      badge: 'RED NACIONAL DE CLÍNICAS',
      title: 'CONVENIOS DIRECTOS CON LAS MEJORES CLÍNICAS DEL PAÍS',
      subtitle: 'FILTRA Y UBICA PRESTADORES MÉDICOS INSTANTÁNEAMENTE.',
      extraText: 'Accede a nuestro directorio de clínicas premium y especialistas certificados.',
      buttonText: 'EXPLORAR RED MÉDICA',
      image: heroBuildingImg,
      targetPath: '/directorio',
      color: 'bg-[#4597CA] hover:bg-sky-600',
    },
    {
      id: 'agendamiento',
      badge: 'RESERVA DE TURNOS',
      title: 'AGENDAMIENTO DE CITAS MÉDICAS AL SEGUNDO',
      subtitle: 'RESERVA TU CONSULTA CON ESPECIALISTAS Y CENTROS COLMEDIKAL.',
      extraText: 'Indica la fecha, ciudad o especialidad y recibe confirmación directa en línea.',
      buttonText: 'AGENDAR MI CITA AHORA',
      image: heroAppointmentImg,
      targetPath: '/agendamiento',
      color: 'bg-teal-600 hover:bg-teal-700',
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const handlePlanSelect = (planId: string) => {
    // Note: I'll need to pass the planId to cotizador if I want to "select" it there. 
    // For now, I'll just navigate.
    navigate('/cotizador');
  };

  const stats = [
    { value: '+20 Años', label: 'Líderes en Medicina Prepagada' },
    { value: '98.7%', label: 'Satisfacción en atención y reembolsos' },
    { value: '+600', label: 'Especialistas clínicos asociados' },
    { value: '24 Horas', label: 'Asistencia inmediata de emergencias' },
  ];

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden" id="colmedikal-home-view">
      
      {/* 1. HERO SECTION - NEW STUNNING TRIPLE PORTAL SLIDING BANNER */}
      <section className="relative pt-6 md:pt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="colmedikal-custom-hero-banner">
        
        {/* Banner Card Frame styled like a premium mock website window */}
        <div className="relative w-full rounded-3xl border border-slate-200 bg-[#EBF3F9] shadow-xl overflow-hidden flex flex-col md:flex-row items-stretch min-h-[460px] lg:min-h-[500px]">
          
          {/* Subtle medical crosses watermarks on background (Left Side) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
            <svg className="absolute -top-12 -left-12 w-60 h-60 text-[#d2e2f1]" viewBox="0 0 100 100" fill="currentColor">
              <path d="M 38 10 H 62 V 38 H 90 V 62 H 62 V 90 H 38 V 62 H 10 V 38 H 38 Z" />
            </svg>
            <svg className="absolute bottom-6 left-1/3 w-32 h-32 text-[#d2e2f1]" viewBox="0 0 100 100" fill="currentColor">
              <path d="M 38 10 H 62 V 38 H 90 V 62 H 62 V 90 H 38 V 62 H 10 V 38 H 38 Z" />
            </svg>
          </div>

          {/* LEFT CONTENT AREA */}
          <div className="relative z-10 w-full md:w-[50%] lg:w-[55%] p-8 sm:p-12 flex flex-col justify-between gap-8 self-stretch">
            <div className="space-y-6 sm:space-y-8">
              {/* Logo (Matches image exactly but scaled safely) */}
              <div>
                <Logo className="h-9 sm:h-11 w-auto" />
              </div>

              {/* Slide text with beautiful animation transitions when changing slide */}
              <div key={currentSlide} className="space-y-3 sm:space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#4597CA] uppercase font-mono block">
                  {slides[currentSlide].badge}
                </span>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0C4169] tracking-tight leading-tight uppercase font-sans">
                  {slides[currentSlide].title}
                </h1>
                
                <p className="text-xs sm:text-sm font-black text-[#4597CA] tracking-wider uppercase font-sans">
                  {slides[currentSlide].subtitle}
                </p>
                
                <p className="text-xs sm:text-sm text-slate-500 max-w-md font-sans leading-relaxed">
                  {slides[currentSlide].extraText}
                </p>
              </div>
            </div>

            {/* Slide Action Button ONLY (Removed "Ingresar al portal de pacientes" as requested!) */}
            <div className="pt-2">
              <button
                onClick={() => navigate(slides[currentSlide].targetPath)}
                className={`px-8 py-3.5 rounded-full text-white font-extrabold text-xs uppercase tracking-wider text-center cursor-pointer shadow-md hover:scale-102 hover:shadow-lg transition-all flex items-center justify-center gap-2 ${slides[currentSlide].color}`}
                id={`btn-hero-slide-${slides[currentSlide].id}`}
              >
                <span>{slides[currentSlide].buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MIDDLE PHOTO / VISUAL CONTAINER (Using flex-1 and min-height to guarantee visibility) */}
          <div className="relative w-full md:w-[35%] lg:w-[33%] min-h-[300px] md:min-h-0 self-stretch overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-[#0C4169]/5 mix-blend-multiply pointer-events-none z-10"></div>
            
            {/* Visual Slide Transitioning images */}
            {slides.map((slide, idx) => (
              <img
                key={slide.id}
                src={slide.image}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  idx === currentSlide 
                    ? 'opacity-100 z-0 scale-100' 
                    : 'opacity-0 -z-10 scale-105 pointer-events-none'
                }`}
              />
            ))}
          </div>

          {/* RIGHT SIDEBAR PANEL TRACKER (Matches the image sidebar perfectly!) */}
          <div className="relative w-full md:w-[15%] lg:w-[12%] bg-[#1E4365] flex md:flex-col justify-stretch overflow-hidden divide-y divide-[#2A597E]/30 shrink-0 border-t md:border-t-0 md:border-l border-[#2A597E]/30" id="hero-slider-rail">
            
            {/* Slide Navigation Buttons */}
            {slides.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 sm:p-5 text-center flex-1 transition-all duration-300 select-none cursor-pointer group ${
                    isActive 
                      ? 'bg-[#295479] text-white' 
                      : 'bg-transparent text-[#97B8D6] hover:bg-[#20496E] hover:text-white'
                  }`}
                  id={`rail-tab-${slide.id}`}
                >
                  <div className="shrink-0 p-2 rounded-full bg-white/5 group-hover:scale-105 transition-transform">
                    {slide.id === 'cotizador' && <FileText className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'text-[#97B8D6]'}`} />}
                    {slide.id === 'directorio' && <Activity className={`w-5 h-5 ${isActive ? 'text-sky-300' : 'text-[#97B8D6]'}`} />}
                    {slide.id === 'agendamiento' && <Calendar className={`w-5 h-5 ${isActive ? 'text-rose-450' : 'text-[#97B8D6]'}`} />}
                  </div>
                  <span className="text-[9.5px] uppercase font-black tracking-wider leading-tight max-w-[80px] break-words">
                    {slide.id === 'cotizador' && 'Cotizar Plan'}
                    {slide.id === 'directorio' && 'Red Médica'}
                    {slide.id === 'agendamiento' && 'Agendar Cita'}
                  </span>
                </button>
              );
            })}

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
              Personas que confían su salud a Colmedikal
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              La cercanía y calidez de un plan prepagado se mide en momentos difíciles. Estuvimos ahí para nuestros clientes cuando más lo necesitaron. Conoce sus historias de tranquilidad con el respaldo médico de Colmedikal.
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
                "Como profesional de la salud corporal, sé lo valioso que es un soporte hospitalario veloz y confiable. Colmedikal siempre me ha dado la mejor red de respuesta y el cotizador me permitió ver exactamente qué pagaría sin tarifas ocultas."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  className="w-10 h-10 rounded-full object-cover shrink-0" 
                  src={avatarValentina} 
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
                  src={avatarCarlosElena} 
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
                  navigate('/cotizador');
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#4597CA] to-[#0C4169] hover:from-[#0C4169] hover:to-[#4597CA] text-white font-bold transition-all shadow-md group cursor-pointer"
                id="footer-cta-quote"
              >
                Ingresar al Cotizador
              </button>
              <button
                onClick={() => navigate('/contacto')}
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
