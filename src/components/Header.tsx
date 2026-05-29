import React, { useState, useRef } from 'react';
import { 
  Menu, 
  X, 
  HeartPulse, 
  Sparkles, 
  ChevronRight, 
  ChevronDown,
  Calculator, 
  User, 
  ShieldCheck,
  Hospital,
  Activity,
  PhoneCall,
  CheckCircle,
  FileText,
  MousePointerClick
} from 'lucide-react';
import { Page } from '../types';
import Logo from './Logo';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export default function Header({ currentPage, setCurrentPage }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Megamenu state managers
  const [activeMegamenu, setActiveMegamenu] = useState<'servicios' | 'directorio' | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const menuItems = [
    { label: 'Inicio', id: 'home' as Page },
    { label: 'Servicios', id: 'servicios' as Page, hasMega: true },
    { label: 'Directorio Médico', id: 'directorio' as Page, hasMega: true },
    { label: 'Nosotros', id: 'nosotros' as Page },
    { label: 'Blog', id: 'blog' as Page },
    { label: 'FAQs', id: 'faqs' as Page },
    { label: 'Contacto', id: 'contacto' as Page },
  ];

  const handleOpenMenu = (menu: 'servicios' | 'directorio') => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setActiveMegamenu(menu);
  };

  const handleCloseMenu = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveMegamenu(null);
    }, 120); // Smooth buffer to let cursors glide over gaps
  };

  const handleKeepMenuOpen = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  const handleNavClick = (pageId: Page) => {
    setCurrentPage(pageId);
    setIsOpen(false);
    setActiveMegamenu(null);
  };

  return (
    <div className="w-full flex flex-col z-50 sticky top-0 shadow-sm border-b border-teal-50">
      {/* Top Bar for Portals */}
      <div className="bg-slate-900 text-slate-200 py-1.5 px-4 sm:px-6 lg:px-8 flex justify-end items-center gap-4 text-[10px] sm:text-xs font-medium">
        <button
          onClick={() => handleNavClick('portal')}
          className={`flex items-center gap-1.5 transition-colors ${
            currentPage === 'portal' ? 'text-[#4597CA] font-bold' : 'hover:text-white'
          }`}
          id="topbar-nav-portal"
        >
          <User className="w-3.5 h-3.5" />
          <span>Portal Cliente</span>
        </button>
        <div className="w-px h-3.5 bg-slate-700"></div>
        <button
          onClick={() => handleNavClick('admin')}
          className={`flex items-center gap-1.5 transition-colors ${
            currentPage === 'admin' ? 'text-[#4597CA] font-bold' : 'hover:text-white'
          }`}
          id="topbar-nav-admin"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Portal Admin</span>
        </button>
      </div>

      <header 
        className="relative bg-white/95 backdrop-blur-md transition-all duration-300"
        onMouseLeave={handleCloseMenu}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Branding */}
            <div 
              onClick={() => handleNavClick('home')} 
              className="flex items-center gap-3 cursor-pointer group"
              id="colmedical-brand-logo"
            >
              <Logo className="w-auto h-10 sm:h-11 transition-transform duration-300 group-hover:scale-105" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-4 xl:space-x-7 items-center h-full">
              {menuItems.map((item) => {
                const isMega = item.hasMega;
                const isCurrent = currentPage === item.id;
                
                return (
                  <div
                    key={item.id}
                    className="relative flex items-center h-full"
                    onMouseEnter={() => {
                      if (isMega) {
                        handleOpenMenu(item.id as 'servicios' | 'directorio');
                      } else {
                        handleCloseMenu();
                      }
                    }}
                  >
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`relative flex items-center gap-1 px-1 py-2 text-xs xl:text-sm font-medium transition-colors duration-200 cursor-pointer ${
                        isCurrent 
                          ? 'text-[#4597CA] font-semibold' 
                          : 'text-slate-600 hover:text-[#4597CA]'
                      }`}
                      id={`nav-${item.id}`}
                    >
                      <span>{item.label}</span>
                      {isMega && (
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          activeMegamenu === item.id ? 'transform rotate-180 text-[#4597CA]' : 'text-slate-400'
                        }`} />
                      )}
                      {isCurrent && (
                        <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#4597CA] rounded-full" />
                      )}
                    </button>
                  </div>
                );
              })}
            </nav>

            {/* Call to Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => handleNavClick('cotizador')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-md ${
                  currentPage === 'cotizador'
                    ? 'bg-gradient-to-r from-[#0C4169] to-[#4597CA] text-white shadow-[#0C4169]/20 scale-95'
                    : 'bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white shadow-[#4597CA]/10 hover:shadow-[#4597CA]/20 hover:scale-102 hover:-translate-y-0.5'
                }`}
                id="cta-nav-cotizador"
              >
                <Calculator className="w-4 h-4" />
                <span>Cotizar Plan</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none border border-slate-200 transition-colors"
                aria-label="Abrir menú"
                id="mobile-menu-toggle"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* =========================================================================
            MEGAMENU INTERACTIVO (DESKTOP)
            ========================================================================= */}
        {activeMegamenu && (
          <div 
            className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-slate-100 border-b border-teal-500/10 z-50 animate-in fade-in slide-in-from-top-1.5 duration-200 overflow-hidden"
            onMouseEnter={handleKeepMenuOpen}
            onMouseLeave={handleCloseMenu}
            id="colmedikal-megamenu-panel"
          >
            <div className="max-w-7xl mx-auto py-8 sm:py-10 px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {activeMegamenu === 'servicios' ? (
                <>
                  {/* Category 1: Atención del día a día */}
                  <div className="col-span-12 md:col-span-4 space-y-5">
                    <h3 className="text-xs font-bold text-[#4597CA] tracking-wider uppercase border-b border-slate-100 pb-2">
                      🩺 Atención Primaria y Control
                    </h3>
                    <div className="space-y-4">
                      <button 
                        onClick={() => handleNavClick('servicios')}
                        className="group text-left block w-full p-2.5 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer"
                      >
                        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 group-hover:text-[#4597CA]">
                          <Activity className="w-4 h-4 text-emerald-500" />
                          <span>Consulta Externa</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 pl-5">
                          Atención directa en más de 25 especialidades médicas sin médico general.
                        </p>
                      </button>

                      <button 
                        onClick={() => handleNavClick('servicios')}
                        className="group text-left block w-full p-2.5 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer"
                      >
                        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 group-hover:text-[#4597CA]">
                          <Sparkles className="w-4 h-4 text-teal-550" />
                          <span>Odontología Preventiva</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 pl-5">
                          Limpiezas anuales gratuitas, cirugías y atención odontológica.
                        </p>
                      </button>

                      <button 
                        onClick={() => handleNavClick('servicios')}
                        className="group text-left block w-full p-2.5 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer"
                      >
                        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 group-hover:text-[#4597CA]">
                          <FileText className="w-4 h-4 text-sky-500" />
                          <span>Cobertura de Farmacia</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 pl-5">
                          Convenios con las principales cadenas para medicamentos de marca.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Category 2: Alta Complejidad */}
                  <div className="col-span-12 md:col-span-4 space-y-5">
                    <h3 className="text-xs font-bold text-[#4597CA] tracking-wider uppercase border-b border-slate-100 pb-2">
                      🏥 Alta Complejidad y Maternidad
                    </h3>
                    <div className="space-y-4">
                      <button 
                        onClick={() => handleNavClick('servicios')}
                        className="group text-left block w-full p-2.5 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer"
                      >
                        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 group-hover:text-[#4597CA]">
                          <Hospital className="w-4 h-4 text-blue-500" />
                          <span>Hospitalización y Cirugía</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 pl-5">
                          Cobertura del 100% en suite privada y honorarios quirúrgicos programados.
                        </p>
                      </button>

                      <button 
                        onClick={() => handleNavClick('servicios')}
                        className="group text-left block w-full p-2.5 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer"
                      >
                        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 group-hover:text-[#4597CA]">
                          <PhoneCall className="w-4 h-4 text-orange-500" />
                          <span>Maternidad y Neonatología</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 pl-5">
                          Cuidados críticos neonatales y controles prenatales con ecografía 4D.
                        </p>
                      </button>

                      <button 
                        onClick={() => handleNavClick('servicios')}
                        className="group text-left block w-full p-2.5 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer"
                      >
                        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 group-hover:text-[#4597CA]">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Urgencias Médicas 24/7</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 pl-5">
                          Línea telefónica dedicada, ambulancias equipadas y traslados sin esperas.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Highlight Column: Cotizador */}
                  <div className="col-span-12 md:col-span-4 bg-gradient-to-br from-slate-900 via-[#1D3557] to-[#0C4169] text-white p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 bg-white/10 text-teal-300 w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                        <Sparkles className="w-3 h-3 text-teal-300" />
                        <span>Recomendación Inteligente</span>
                      </div>
                      <h4 className="text-base font-extrabold text-white tracking-tight leading-snug">
                        Calcula tu tarifa exacta de Medicina Prepagada
                      </h4>
                      <p className="text-xs text-slate-300/95 leading-relaxed mt-2">
                        Simula precios al instante ingresando las edades de tu núcleo familiar. Planes personalizados desde $45 USD sin cuotas sorpresa.
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => handleNavClick('cotizador')}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#4597CA] hover:bg-[#4597CA]/90 active:scale-98 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <Calculator className="w-4 h-4" />
                        <span>Simular Plan Familiar</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Category 1: Especialidades */}
                  <div className="col-span-12 md:col-span-4 space-y-5">
                    <h3 className="text-xs font-bold text-[#4597CA] tracking-wider uppercase border-b border-slate-100 pb-2">
                      🏢 Especialidades Médicas
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Cardiología',
                        'Pediatría',
                        'Ginecobstetricia',
                        'Medicina Interna',
                        'Traumatología',
                        'Dermatología',
                        'Oftalmología',
                        'Nutriología'
                      ].map((specialty) => (
                        <button
                          key={specialty}
                          onClick={() => handleNavClick('directorio')}
                          className="text-left py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                          <span>{specialty}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 2: Prestadores Destacados */}
                  <div className="col-span-12 md:col-span-4 space-y-5">
                    <h3 className="text-xs font-bold text-[#4597CA] tracking-wider uppercase border-b border-slate-100 pb-2">
                      🏥 Centros Médicos y Clínicas
                    </h3>
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-2.5">
                        <span className="text-[10px] uppercase font-bold text-teal-650 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-150 mt-0.5 shrink-0">UIO</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Hospital Vozandes & Northospital</h4>
                          <p className="text-[11px] text-slate-500">Clínicas con máxima infraestructura en Quito.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-[10px] uppercase font-bold text-sky-650 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-150 mt-0.5 shrink-0">GYE</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Clínica Panamericana & Kennedy</h4>
                          <p className="text-[11px] text-slate-500">Prestigio de atención quirúrgica en Guayaquil.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-[10px] uppercase font-bold text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-150 mt-0.5 shrink-0">CUE</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Hospital Santa Inés Cuenca</h4>
                          <p className="text-[11px] text-slate-500">Excelente red acreditada en el Austro ecuatoriano.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Información de Acceso */}
                  <div className="col-span-12 md:col-span-4 bg-teal-50/70 border border-teal-500/10 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-[#0C4169] tracking-tight flex items-center gap-1.5">
                        <MousePointerClick className="w-4 h-4 text-teal-600" />
                        <span>Acceso Directo Exclusivo</span>
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-2">
                        En Colmedikal no te exigimos pasar por un médico general obligatoriamente para ver un cardiólogo o pediatra. Consulta el Directorio interactivo y reserva con tu médico preferido de inmediato sin cartas de aprobación.
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => handleNavClick('directorio')}
                        className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-[#0C4169] hover:bg-[#0C4169]/90 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Buscar Médico o Clínica</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        )}
      </header>
    </div>
  );
}
