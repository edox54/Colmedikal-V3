import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Home, Search, ArrowLeft } from 'lucide-react';
import Logo from './Logo';

export default function NotFound() {
  const navigate = useNavigate();
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => p + 1), 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex flex-col items-center justify-center px-4 text-center">

      {/* Logo */}
      <div className="mb-10 opacity-80">
        <Logo className="h-10 w-auto mx-auto" />
      </div>

      {/* ECG / flatline animation */}
      <div className="relative w-64 h-16 mb-8 overflow-hidden">
        <svg viewBox="0 0 260 60" className="w-full h-full" fill="none">
          <polyline
            points="0,30 30,30 40,30 50,5 60,55 70,20 80,30 110,30 120,30 130,30 140,30 170,30 180,5 190,55 200,20 210,30 260,30"
            stroke="#4597CA"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/0 to-white/90" />
      </div>

      {/* Error code */}
      <div className="relative mb-4">
        <span className="text-[120px] sm:text-[160px] font-black text-slate-100 leading-none select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <HeartPulse key={pulse} className="w-10 h-10 text-rose-400 animate-bounce" />
          <span className="text-2xl sm:text-3xl font-black text-slate-700">Página no encontrada</span>
        </div>
      </div>

      {/* Diagnosis card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm px-8 py-6 max-w-md w-full mb-8 text-left space-y-2">
        <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Diagnóstico Médico</p>
        <p className="text-sm font-semibold text-slate-800">
          La URL que buscas no existe o fue dada de alta (redirigida).
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-slate-500 font-mono">
          <div><span className="font-bold text-slate-700">Código:</span> HTTP 404</div>
          <div><span className="font-bold text-slate-700">Estado:</span> No Encontrado</div>
          <div><span className="font-bold text-slate-700">Pronóstico:</span> Leve</div>
          <div><span className="font-bold text-slate-700">Tratamiento:</span> Ver abajo</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver atrás
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white text-sm font-medium hover:shadow-md transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Ir al inicio
        </button>
        <button
          onClick={() => navigate('/cotizador')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all cursor-pointer"
        >
          <Search className="w-4 h-4" />
          Cotizar plan
        </button>
      </div>

      <p className="mt-10 text-[11px] text-slate-400">
        ¿Crees que esto es un error? Escríbenos a{' '}
        <a href="mailto:info@colmedikal.com" className="underline hover:text-slate-600">info@colmedikal.com</a>
      </p>
    </div>
  );
}
