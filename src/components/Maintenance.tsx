import React from 'react';
import { HeartPulse } from 'lucide-react';

export default function Maintenance() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-800 px-6 text-center gap-4">
      <HeartPulse className="w-12 h-12 text-teal-600" />
      <h1 className="text-2xl font-bold font-display">Estamos en mantenimiento</h1>
      <p className="text-sm text-slate-500 max-w-md">
        Colmedikal está actualizando su sitio. Vuelve a intentarlo en unos minutos.
      </p>
    </div>
  );
}
