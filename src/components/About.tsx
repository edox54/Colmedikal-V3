import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Eye,
  Heart,
  Scale,
  ArrowRight,
  Gem,
  Award,
  Quote,
  MapPin
} from 'lucide-react';
import { Page } from '../types';
import { useNavigate } from 'react-router-dom';

interface AboutProps {
  setCurrentPage: (page: Page) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export default function About({ setCurrentPage }: AboutProps) {
  const navigate = useNavigate();

  const values = [
    {
      title: 'Honestidad',
      description: 'Actuamos con rectitud y transparencia en cada decisión. Tu confianza es nuestro activo más valioso.',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Transparencia',
      description: 'Claridad que genera confianza, trabajamos con proactividad y procesos diseñados para asegurar tu máximo beneficio.',
      icon: Eye,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      title: 'Compromiso',
      description: 'Trabajamos de manera responsable porque mereces recibir el mejor servicio.',
      icon: Heart,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    {
      title: 'Respeto',
      description: 'Nos respaldamos en el marco legal vigente como herramienta clave para proteger y hacer valer los derechos de nuestros afiliados.',
      icon: Scale,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
  ];

  const testimonials = [
    {
      quote: 'Colmedikal me ofreció una solución accesible con sus microseguros. Es una tranquilidad saber que, aunque mi presupuesto sea limitado, puedo contar con cobertura médica para emergencias. Este servicio ha sido una bendición para mí y mi familia.',
      name: 'Juan Echeverría',
      location: 'Quito - Ecuador',
    },
    {
      quote: 'Desde que me afilié a Colmedikal, mi familia y yo hemos recibido una atención excepcional. Los médicos siempre están disponibles para responder nuestras inquietudes y nos han ayudado a mantenernos saludables con chequeos regulares. Es un alivio saber que contamos con un equipo tan profesional y dedicado',
      name: 'Marcela Merino',
      location: 'Quito - Ecuador',
    },
    {
      quote: 'Siempre he tenido miedo de ir al dentista, pero en Colmedikal me hicieron sentir cómodo desde el primer momento. Los odontólogos son amables y explican cada procedimiento con detalle. Ahora tengo una sonrisa saludable y estoy más tranquilo con mis visitas regulares',
      name: 'Eduardo Manosalvas',
      location: 'Tumbaco - Ecuador',
    },
  ];

  return (
    <div className="space-y-24 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedikal-about-view">

      {/* 1. HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div
          className="lg:col-span-6 space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          variants={fadeUp}
        >
          <div className="space-y-3">
            <span className="text-sm font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">POR QUÉ ELEGIRNOS</span>
            <h1 className="text-5xl font-display font-extrabold text-[#0C4169] tracking-tight leading-tight">
              COLMEDIKAL
            </h1>
            <p className="text-xl font-semibold text-teal-700">Medicina Prepagada</p>
          </div>
          <p className="text-base text-slate-600 leading-relaxed">
            En COLMEDIKAL combinamos tecnología de punta con un equipo técnico especializado para ofrecerte la mejor experiencia en medicina prepagada.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Nos diferenciamos por brindar un servicio preferencial, humano y exclusivo a nuestros afiliados, respaldados por planes flexibles y diversos que se adaptan a cada segmento del mercado.
          </p>
        </motion.div>

        <motion.div
          className="lg:col-span-6 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          variants={scaleIn}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-3xl opacity-10 blur-xl"></div>
          <div className="relative bg-white rounded-3xl p-5 border border-slate-150 shadow-xl overflow-hidden">
            <div className="w-full h-80 rounded-2xl bg-gradient-to-br from-[#0C4169] to-[#4597CA] flex items-center justify-center">
              <svg viewBox="0 0 100 100" fill="none" className="w-40 h-40 opacity-90 drop-shadow-xl">
                <path d="M 35 35 L 25 35 A 15 15 0 0 0 25 65 L 35 65 L 35 75 A 15 15 0 0 0 65 75 L 65 65 Z" fill="#4597CA"/>
                <path d="M 35 35 L 35 25 A 15 15 0 0 1 65 25 L 65 35 L 75 35 A 15 15 0 0 1 75 65 L 65 65 Z" fill="white"/>
              </svg>
            </div>
            <div className="absolute bottom-9 left-9 right-9 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-100 text-center">
              <h4 className="text-sm font-bold text-slate-900">Sede Principal Colmedikal</h4>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Av. República E6-447 y Eloy Alfaro, Quito - Ecuador
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. VALORES */}
      <motion.section
        className="space-y-10 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        variants={fadeUp}
      >
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">NUESTROS VALORES</span>
          <p className="text-base text-slate-500">
            No solo ofrecemos servicios, creamos relaciones de confianza. Estos son los valores que guían nuestro compromiso contigo y tu familia:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <motion.div
                key={idx}
                className="space-y-3 p-6 rounded-2xl bg-slate-50/50 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                variants={fadeUp}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${val.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">{val.title}</h4>
                <p className="text-base text-slate-600 leading-relaxed">{val.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 3. CTA BANNER */}
      <motion.section
        className="bg-gradient-to-r from-[#0C4169] via-[#1D3557] to-[#0C4169] text-white p-10 sm:p-14 rounded-3xl text-center relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        variants={fadeIn}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl animate-pulse"></div>
        <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-wide">
            PROTEGE TU SALUD Y PATRIMONIO
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Contrata tu plan A TIEMPO y asegura tu bienestar futuro y el de tu familia.
          </p>
          <motion.button
            onClick={() => navigate('/contacto')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-base shadow-lg transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>CONTÁCTANOS HOY</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.section>

      {/* 4. MISIÓN Y VISIÓN */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          className="bg-gradient-to-tr from-slate-50 to-teal-50/30 p-8 sm:p-10 rounded-3xl border border-slate-150 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          variants={fadeUp}
        >
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold mb-6">
            <Gem className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-3">MISIÓN</h3>
          <p className="text-base text-slate-700 leading-relaxed">
            Proporcionar a nuestros usuarios acceso oportuno y eficiente en servicios médicos integrales, a través de la una red de prestadores médicos de primer nivel.
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-tr from-slate-50 to-indigo-50/30 p-8 sm:p-10 rounded-3xl border border-slate-150 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          variants={fadeUp}
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-bold mb-6">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">VISIÓN</h3>
          <p className="text-base text-slate-700 leading-relaxed">
            Otorgar acceso a soluciones de salud integral, basados en principios de calidad y oportunidad, aportando de esta manera al bienestar social de nuestros usuarios.
          </p>
        </motion.div>
      </section>

      {/* 5. TESTIMONIOS */}
      <motion.section
        className="space-y-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        variants={fadeUp}
      >
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-sm font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">TESTIMONIOS</span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Casos de Éxito
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            Para Colmedikal siempre será un privilegio brindar un servicio acorde a sus necesidades. Nuestros clientes confían en la experiencia y solución inmediata en temas de salud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.12 }}
              variants={scaleIn}
            >
              <div className="space-y-4">
                <Quote className="w-9 h-9 text-teal-200" />
                <p className="text-base text-slate-600 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-base border border-teal-100">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" /> {t.location}
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
