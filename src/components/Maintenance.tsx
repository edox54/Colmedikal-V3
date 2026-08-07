import React from 'react';
import { HeartPulse } from 'lucide-react';
import Logo from './Logo';

export default function Maintenance() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-16 bg-gradient-to-br from-brand-dark via-[#0f3155] to-slate-950 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-light/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <Logo className="h-10 sm:h-12" isDarkBg />
        </div>

        <div className="relative mx-auto w-20 h-20">
          <span className="absolute inset-0 rounded-full bg-teal-400/30 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
            <HeartPulse className="w-9 h-9 text-teal-300" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Estamos mejorando tu experiencia
          </h1>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-sm mx-auto">
            El sitio de Colmedikal está en mantenimiento por un corto momento.
            Vuelve a intentarlo en unos minutos.
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-2">
          <span className="w-2 h-2 rounded-full bg-teal-300 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-teal-300 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-teal-300 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
