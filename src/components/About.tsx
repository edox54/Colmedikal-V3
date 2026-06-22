import React from 'react';
import {
  ShieldCheck,
  Eye,
  Heart,
  Scale,
  ArrowRight,
  Gem,
  Award,
  Quote,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Page } from '../types';
import { useNavigate } from 'react-router-dom';
import sedePrincipalBuilding from '../assets/images/sede_principal_building_1780025281820.png';

interface AboutProps {
  setCurrentPage: (page: Page) => void;
}

export default function About({ setCurrentPage }: AboutProps) {
  const navigate = useNavigate();

  const values = [
    {
      title: 'Honestidad',
      description: 'Actuamos siempre de forma responsable, con rectitud, honradez y veracidad en todos y cada uno de los actos, impidiendo toda forma de corrupción.',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Transparencia',
      description: 'En Colmedikal cumplimos nuestro trabajo con proactividad y cuidado, de acuerdo con los procesos establecidos para beneficiar a nuestros usuarios',
      icon: Eye,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      title: 'Compromiso',
      description: 'En Colmedikal cumplimos con lo que prometido a nuestros usuarios porque trabajamos de manera responsable, entregando lo mejor de nosotros.',
      icon: Heart,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    {
      title: 'Respeto',
      description: 'El marco de referencia legal vigente es una herramienta para hacer cumplir los derechos propios y los derechos de nuestros usuarios, evitando acciones que entorpezcan, alteren cumplimiento de la normativa actual.',
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
      quote: 'Siempre he tenido miedo de ir al dentista, pero en Colmedikal me hicieron sentir cómoda desde el primer momento. Los odontólogos son amables y explican cada procedimiento con detalle. Ahora tengo una sonrisa saludable y estoy más tranquila con mis visitas regulares',
      name: 'Eduardo Manosalvas',
      location: 'Tumbaco - Ecuador',
    },
  ];

  return (
    <div className="space-y-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedikal-about-view">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium -mb-14">
        <button onClick={() => navigate('/')} className="hover:text-teal-600 transition-colors cursor-pointer">Inicio</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-700 font-semibold">Nosotros</span>
      </div>

      {/* 1. HERO — POR QUÉ ELEGIRNOS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">¿POR QUÉ ELEGIRNOS?</span>
            <h1 className="text-4xl font-display font-extrabold text-[#0C4169] tracking-tight leading-tight">
              COLMEDIKAL
            </h1>
            <p className="text-lg font-semibold text-teal-700">Medicina Prepagada</p>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Porque contamos con un equipo técnico y de desarrollo para la administración del programa de microseguros, adicionalmente disponemos de la tecnología más moderna del mercado para brindar un soporte profesional y de calidad a nuestros socios, entregando un servicio preferencial y personalizado, además nos caracterizamos por manejar una gran diversidad y flexibilidad de los planes de salud: Lo que permite llegar a un amplio segmento del mercado.
          </p>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-3xl opacity-10 blur-xl"></div>
          <div className="relative bg-white rounded-3xl p-5 border border-slate-150 shadow-xl overflow-hidden">
            <img
              src={sedePrincipalBuilding}
              alt="Sede Colmedikal Ecuador"
              className="w-full h-80 object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-9 left-9 right-9 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-100 text-center">
              <h4 className="text-xs font-bold text-slate-900">Sede Principal Colmedikal</h4>
              <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Av. República E6-447 y Eloy Alfaro, Quito - Ecuador
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALORES */}
      <section className="space-y-10 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Nuestros Valores
          </h2>
          <p className="text-xs text-slate-500">
            Los principios que guían cada decisión y cada servicio que ofrecemos a nuestros usuarios.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div key={idx} className="space-y-3 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:shadow-md transition-all">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${val.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{val.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{val.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CTA BANNER */}
      <section className="bg-gradient-to-r from-[#0C4169] via-[#1D3557] to-[#0C4169] text-white p-8 sm:p-12 rounded-3xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl"></div>
        <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase tracking-wide">
            NO PIERDAS EL TIEMPO
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Contrata un SEGURO MÉDICO comprobado por su experiencia y excelentes precios
          </p>
          <button
            onClick={() => navigate('/contacto')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-sm shadow-lg transition-all cursor-pointer"
          >
            <span>Contáctenos Ahora Mismo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. MISIÓN Y VISIÓN */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-tr from-slate-50 to-teal-50/30 p-8 rounded-3xl border border-slate-150 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold mb-6">
            <Gem className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">MISIÓN</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            Proporcionar a nuestros usuarios acceso oportuno y eficiente en servicios médicos integrales, a través de la una red de prestadores médicos de primer nivel.
          </p>
        </div>

        <div className="bg-gradient-to-tr from-slate-50 to-indigo-50/30 p-8 rounded-3xl border border-slate-150 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-bold mb-6">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">VISIÓN</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            Otorgar acceso a soluciones de salud integral, basados en principios de calidad y oportunidad, aportando de esta manera al bienestar social de nuestros usuarios.
          </p>
        </div>
      </section>

      {/* 5. TESTIMONIOS */}
      <section className="space-y-10">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">TESTIMONIOS</span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Casos de Éxito
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Para Colmedikal siempre será un privilegio brindar un servicio acorde a sus necesidades. Nuestros clientes confían en la experiencia y solución inmediata en temas de salud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <Quote className="w-8 h-8 text-teal-200" />
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm border border-teal-100">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" /> {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
