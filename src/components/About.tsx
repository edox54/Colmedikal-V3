import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck, Eye, Heart, Scale,
  ArrowRight, Gem, Award, Quote, MapPin,
} from 'lucide-react';
import { Page } from '../types';
import { useNavigate } from 'react-router-dom';

interface AboutProps { setCurrentPage: (page: Page) => void; }

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const fadeIn  = { hidden: { opacity: 0 },        visible: { opacity: 1 }       };
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };

function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(false);
  const elemRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = elemRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !ref.current) {
        ref.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          setCount(Math.round(p * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { count, elemRef };
}

const counters = [
  { id: 'years',   target: new Date().getFullYear() - 2011, suffix: '+', label: 'Años de servicio',       sub: 'Desde el 5 oct. 2011' },
  { id: 'members', target: 10,  suffix: 'K+', label: 'Afiliados protegidos',    sub: 'En todo el Ecuador' },
  { id: 'doctors', target: 200, suffix: '+',  label: 'Médicos y especialistas', sub: 'Red certificada' },
  { id: 'plans',   target: 3,   suffix: '',   label: 'Planes disponibles',      sub: 'Inicio · Protección · Plus' },
];

function CounterItem({ target, suffix, label, sub }: typeof counters[0]) {
  const { count, elemRef } = useCounter(target);
  return (
    <div className="flex flex-col items-center py-5 px-4">
      <span ref={elemRef} className="text-5xl font-extrabold text-white leading-none font-display">
        {count}{suffix}
      </span>
      <span className="text-sm text-white/70 mt-2 text-center">{label}</span>
      <span className="text-[11px] text-white/35 mt-1 text-center">{sub}</span>
    </div>
  );
}

export default function About({ setCurrentPage }: AboutProps) {
  const navigate = useNavigate();

  const values = [
    { title: 'Honestidad',    description: 'Actuamos con rectitud y transparencia en cada decisión. Tu confianza es nuestro activo más valioso.',                                                                   icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { title: 'Transparencia', description: 'Claridad que genera confianza, trabajamos con proactividad y procesos diseñados para asegurar tu máximo beneficio.',                                                    icon: Eye,         color: 'bg-sky-50 text-sky-600 border-sky-100'           },
    { title: 'Compromiso',    description: 'Trabajamos de manera responsable porque mereces recibir el mejor servicio.',                                                                                            icon: Heart,       color: 'bg-rose-50 text-rose-600 border-rose-100'         },
    { title: 'Respeto',       description: 'Nos respaldamos en el marco legal vigente como herramienta clave para proteger y hacer valer los derechos de nuestros afiliados.',                                     icon: Scale,       color: 'bg-indigo-50 text-indigo-600 border-indigo-100'   },
  ];

  const testimonials = [
    { quote: 'Colmedikal me ofreció una solución accesible con sus microseguros. Es una tranquilidad saber que, aunque mi presupuesto sea limitado, puedo contar con cobertura médica para emergencias. Ha sido una bendición para mí y mi familia.',                                                                               name: 'Juan Echeverría',    location: 'Quito — Ecuador'   },
    { quote: 'Desde que me afilié a Colmedikal, mi familia y yo hemos recibido una atención excepcional. Los médicos siempre están disponibles para responder nuestras inquietudes y nos han ayudado a mantenernos saludables con chequeos regulares.',                                                                            name: 'Marcela Merino',     location: 'Quito — Ecuador'   },
    { quote: 'Siempre he tenido miedo de ir al dentista, pero en Colmedikal me hicieron sentir cómodo desde el primer momento. Los odontólogos son amables y explican cada procedimiento con detalle. Ahora tengo una sonrisa saludable.',                                                                                        name: 'Eduardo Manosalvas', location: 'Tumbaco — Ecuador' },
  ];

  return (
    <div className="space-y-0 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedikal-about-view">

      {/* 1. HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pb-14">
        <motion.div
          className="lg:col-span-6 space-y-6"
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          variants={fadeUp}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Nosotros</span>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Desde 2011</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-[#0C4169] tracking-tight leading-tight">
            Tu salud merece estar protegida,{' '}
            <span className="text-teal-600">siempre.</span>
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            En Colmedikal S.A. entendemos que la salud de tu familia es lo más valioso. Por eso creamos planes de medicina prepagada pensados para brindarte atención médica de calidad, respaldo permanente y la tranquilidad de saber que nunca estarás solo cuando más lo necesites.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <motion.button
              onClick={() => navigate('/cotizador')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0C4169] hover:bg-[#0a3558] text-white font-semibold rounded-xl text-sm shadow-md transition-all cursor-pointer"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Ver planes <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => navigate('/contacto')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm border border-slate-200 shadow-sm transition-all cursor-pointer"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Contáctanos
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-6 relative"
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          variants={scaleIn}
        >
          <div className="relative bg-gradient-to-br from-[#0C4169] to-[#4597CA] rounded-3xl overflow-hidden min-h-[320px] flex flex-col justify-end p-6 shadow-xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] opacity-10">
              <svg viewBox="0 0 100 100" fill="none" className="w-52 h-52">
                <path d="M35 35L25 35A15 15 0 0 0 25 65L35 65L35 75A15 15 0 0 0 65 75L65 65Z" fill="white"/>
                <path d="M35 35L35 25A15 15 0 0 1 65 25L65 35L75 35A15 15 0 0 1 75 65L65 65Z" fill="white"/>
              </svg>
            </div>
            <div className="relative z-10 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg border border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Sede principal</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Colmedikal S.A. — Quito, Ecuador</p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Av. República E6-447 y Eloy Alfaro
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. CONTADOR */}
      <motion.section
        className="rounded-3xl bg-gradient-to-r from-[#0C4169] via-[#1D3557] to-[#0C4169] overflow-hidden relative"
        initial="hidden" whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        variants={fadeIn}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10">
          {counters.map((c) => <CounterItem key={c.id} {...c} />)}
        </div>
      </motion.section>

      {/* 3. HISTORIA */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start py-16">
        <motion.div
          className="lg:col-span-4 lg:sticky lg:top-24 space-y-4"
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          variants={fadeUp}
        >
          <span className="text-[11px] font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Nuestra historia</span>
          <h2 className="text-3xl font-display font-extrabold text-[#0C4169] leading-tight tracking-tight">
            Un aliado comprometido con tu bienestar
          </h2>
          <div className="w-12 h-1 bg-teal-500 rounded-full" />
        </motion.div>

        <motion.div
          className="lg:col-span-8 space-y-5"
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
          variants={fadeUp}
        >
          <div className="border-l-4 border-[#0C4169] pl-5 py-1">
            <p className="text-base sm:text-lg text-slate-800 font-semibold leading-relaxed italic">
              "Nuestra misión es hacer que el acceso a la salud sea más fácil, más humano y verdaderamente accesible para todos los ecuatorianos."
            </p>
          </div>
          <p className="text-base text-slate-600 leading-relaxed">
            Trabajamos junto a una amplia red de médicos, especialistas, clínicas y hospitales para ofrecerte soluciones oportunas, con procesos ágiles y un servicio cercano que pone a las personas en el centro de cada decisión.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Creemos que cuidar tu salud no debe ser un privilegio, sino un derecho al alcance de todos. Por eso desarrollamos planes con excelente cobertura, atención profesional y beneficios que se adaptan a las necesidades de las personas, las familias y las empresas.
          </p>
          <p className="text-base text-slate-700 font-medium leading-relaxed">
            Más que una empresa de medicina prepagada, somos un aliado comprometido con tu bienestar, acompañándote en cada etapa de tu vida con responsabilidad, calidez y excelencia.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Porque cuando cuentas con el respaldo adecuado, tú y tu familia pueden vivir con mayor tranquilidad, seguridad y confianza.
          </p>
        </motion.div>
      </section>

      {/* 4. VALORES */}
      <motion.section
        className="space-y-10 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm"
        initial="hidden" whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        variants={fadeUp}
      >
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-[11px] font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Valores</span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">Lo que nos define</h2>
          <p className="text-base text-slate-500">
            No solo ofrecemos servicios, creamos relaciones de confianza. Estos son los valores que guían nuestro compromiso contigo y tu familia.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <motion.div
                key={idx}
                className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                initial="hidden" whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                variants={fadeUp}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${val.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">{val.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{val.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 5. MISIÓN Y VISIÓN */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
        <motion.div
          className="bg-gradient-to-tr from-slate-50 to-teal-50/30 p-8 sm:p-10 rounded-3xl border border-slate-150 relative overflow-hidden"
          initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          variants={fadeUp}
        >
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center mb-6">
            <Gem className="w-6 h-6" />
          </div>
          <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">Misión</h3>
          <p className="text-base text-slate-700 leading-relaxed">
            Proporcionar a nuestros usuarios acceso oportuno y eficiente en servicios médicos integrales, a través de una red de prestadores médicos de primer nivel.
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-tr from-slate-50 to-indigo-50/30 p-8 sm:p-10 rounded-3xl border border-slate-150 relative overflow-hidden"
          initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          variants={fadeUp}
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center mb-6">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Visión</h3>
          <p className="text-base text-slate-700 leading-relaxed">
            Otorgar acceso a soluciones de salud integral, basados en principios de calidad y oportunidad, aportando de esta manera al bienestar social de nuestros usuarios.
          </p>
        </motion.div>
      </section>

      {/* 6. CTA BANNER */}
      <motion.section
        className="bg-gradient-to-r from-[#0C4169] via-[#1D3557] to-[#0C4169] text-white p-10 sm:p-14 rounded-3xl relative overflow-hidden"
        initial="hidden" whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        variants={fadeIn}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl animate-pulse pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase tracking-wide">
              Protege tu salud y patrimonio
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              Contrata tu plan a tiempo y asegura tu bienestar futuro y el de tu familia.
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/contacto')}
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-base shadow-lg transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          >
            Contáctanos hoy <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.section>

      {/* 7. TESTIMONIOS */}
      <motion.section
        className="space-y-10 py-6"
        initial="hidden" whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        variants={fadeUp}
      >
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-[11px] font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Testimonios</span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">Casos de éxito</h2>
          <p className="text-base text-slate-500 leading-relaxed">
            Para Colmedikal siempre será un privilegio brindar un servicio acorde a sus necesidades. La confianza de nuestros afiliados es el mejor reflejo de nuestro compromiso.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              initial="hidden" whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.12 }}
              variants={scaleIn}
            >
              <div className="space-y-4">
                <Quote className="w-9 h-9 text-teal-200" />
                <p className="text-sm text-slate-600 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-base border border-teal-100">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" /> {t.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

    </div>
  );
}
