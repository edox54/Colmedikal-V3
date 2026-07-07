import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Phone, Home, Calculator } from 'lucide-react';

/**
 * Post-submission "thank you" page. Contact (and other lead forms) redirect here
 * after a successful submission, passing the ticket/reference code via router state.
 */
export default function Gracias() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as { ticketId?: string; name?: string; subject?: string };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16" id="colmedikal-gracias-view">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto animate-in zoom-in-95 duration-300">
          <CheckCircle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            ¡Gracias{state.name ? `, ${state.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hemos recibido tu solicitud correctamente. Un asesor especialista de Colmedikal se
            comunicará contigo por teléfono o correo electrónico en las próximas 2 horas hábiles.
          </p>
        </div>

        {state.ticketId && (
          <div className="space-y-1">
            <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Código de atención
            </span>
            <div className="bg-slate-100 px-5 py-2.5 rounded-xl text-base font-mono font-bold text-slate-800 tracking-wide border border-slate-200 w-fit mx-auto">
              {state.ticketId}
            </div>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 flex items-center gap-3 text-left">
          <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-800">
            ¿Necesitas ayuda inmediata? Escríbenos por WhatsApp al{' '}
            <a href="https://wa.me/593987028756" target="_blank" rel="noreferrer" className="font-bold underline">
              098 702 8756
            </a>{' '}
            o llama al <a href="tel:022567191" className="font-bold underline">02-2567191</a>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0C4169] text-white hover:bg-slate-900 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>
          <Link
            to="/cotizador"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white hover:bg-teal-600 text-xs font-bold rounded-xl transition-colors"
          >
            <Calculator className="w-4 h-4" />
            <span>Cotizar un Plan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
