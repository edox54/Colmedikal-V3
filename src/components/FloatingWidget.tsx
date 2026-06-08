import React from 'react';
import { Calculator, PhoneCall, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FloatingWidget() {
  const navigate = useNavigate();
  const location = useLocation();

  // WhatsApp Link for Colmedikal Ecuador
  const whatsappUrl = "https://wa.me/593987028756?text=Hola%20Colmedikal%2C%20quisiera%20asesoria%20sobre%20los%20planes%20de%20medicina%20prepagada.";

  const handlePageChange = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* =========================================================================
          DESKTOP WIDGET: Floating Vertical Rail (visible from md screen up)
          ========================================================================= */}
      <div 
        className="hidden md:flex flex-col gap-3.5 fixed right-5 bottom-8 z-50"
        id="colmedikal-desktop-floating-widget"
      >
        {/* WhatsApp Button (Floating Pulse) */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/25 border border-emerald-450 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Contactar por WhatsApp"
        >
          {/* Pulsing Aura */}
          <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping opacity-60 pointer-events-none"></span>
          
          <MessageCircle className="w-7 h-7 relative z-10 font-bold" />
          
          {/* Tooltip */}
          <span className="absolute right-16 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-md border border-slate-800">
            Charla por WhatsApp
          </span>
        </a>

        {/* Cotizador Button */}
        <button
          onClick={() => handlePageChange('/cotizador')}
          className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg border transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
            isActive('/cotizador')
              ? 'bg-teal-600 text-white border-teal-500 shadow-teal-600/25'
              : 'bg-white hover:bg-slate-50 text-[#1D3557] border-slate-200/80 shadow-slate-300/35'
          }`}
          aria-label="Calcular Tarifas"
        >
          <Calculator className="w-6 h-6" />
          
          {/* Tooltip */}
          <span className="absolute right-16 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-md border border-slate-800">
            Cotizador Inteligente 📊
          </span>
        </button>

        {/* Contacto Button */}
        <button
          onClick={() => handlePageChange('/contacto')}
          className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg border transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
            isActive('/contacto')
              ? 'bg-[#1D3557] text-white border-slate-800 shadow-[#1D3557]/20'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-slate-300/35'
          }`}
          aria-label="Oficinas y Teléfonos"
        >
          <PhoneCall className="w-5 h-5" />
          
          {/* Tooltip */}
          <span className="absolute right-16 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-md border border-slate-800">
            Líneas de Soporte y Directorio
          </span>
        </button>
      </div>

      {/* =========================================================================
          MOBILE WIDGET: Floating Bottom Pill Dock (visible below md screen)
          "Poco Invasiva" & elegant glassmorphism styling
          ========================================================================= */}
      <div 
        className="md:hidden fixed bottom-4 left-4 right-4 z-50"
        id="colmedikal-mobile-floating-dock-wrapper"
      >
        <div className="bg-[#0C4169] rounded-2xl px-5 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center justify-around gap-2 max-w-sm mx-auto border border-[#0C4169]/50">
          {/* WhatsApp Mobile Trigger */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center flex-1 py-1 text-center transition-transform active:scale-95 rounded-lg active:bg-white/10"
          >
            <div className="relative">
              <MessageCircle className="w-6 h-6 text-emerald-400 mb-0.5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <span className="text-[11px] text-white font-bold mt-1 tracking-tight">
              WhatsApp
            </span>
          </a>

          {/* Divider */}
          <div className="h-8 w-px bg-white/20 shrink-0"></div>

          {/* Cotizador Mobile Link */}
          <button
            onClick={() => handlePageChange('/cotizador')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-transform active:scale-95 rounded-lg ${
              isActive('/cotizador') ? 'bg-white/10 scale-105' : 'active:bg-white/10'
            }`}
          >
            <Calculator className={`w-6 h-6 mb-0.5 ${isActive('/cotizador') ? 'text-white' : 'text-slate-300'}`} />
            <span className={`text-[11px] mt-1 tracking-tight ${isActive('/cotizador') ? 'text-white font-extrabold' : 'text-slate-200 font-medium'}`}>
              Cotizar
            </span>
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-white/20 shrink-0"></div>

          {/* Contacto Mobile Link */}
          <button
            onClick={() => handlePageChange('/contacto')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-transform active:scale-95 rounded-lg ${
              isActive('/contacto') ? 'bg-white/10 scale-105' : 'active:bg-white/10'
            }`}
          >
            <PhoneCall className={`w-6 h-6 mb-0.5 ${isActive('/contacto') ? 'text-white' : 'text-slate-300'}`} />
            <span className={`text-[11px] mt-1 tracking-tight ${isActive('/contacto') ? 'text-white font-extrabold' : 'text-slate-200 font-medium'}`}>
              Contacto
            </span>
          </button>
        </div>
      </div>
    </>
  );
}