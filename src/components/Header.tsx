import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  MousePointerClick,
  LogOut,
  Settings
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useColmedikal } from '../context/ColmedikalContext';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdminUser } = useColmedikal();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  
  // Megamenu state managers
  const [activeMegamenu, setActiveMegamenu] = useState<'servicios' | 'directorio' | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Top Info Bar mobile ticker
  const topBarItems = [
    { id: 'horario', content: <span>🕒 Lunes a Viernes 08:30 - 18:30</span> },
    { id: 'presencia', content: <span>📍 Presencia en UIO, GYE, CUE y todo el país</span> },
    { id: 'tel', content: <a href="tel:022567191" className="hover:text-white transition-colors">📞 02-2567191</a> },
    { id: 'whatsapp', content: <a href="https://wa.me/593987028756" target="_blank" rel="noreferrer" className="hover:text-emerald-450 text-emerald-400 transition-colors">💬 WhatsApp: 098 702 8756</a> }
  ];

  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTickerIdx((prev) => (prev + 1) % topBarItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [topBarItems.length]);

  const menuItems = [
    { label: 'Inicio', id: 'inicio', path: '/', items: [
        { label: 'Nosotros', path: '/nosotros' },
        { label: 'FAQ\'s', path: '/faqs' },
    ]},
    { label: 'Servicios', path: '/servicios', hasMega: true, id: 'servicios' },
    { label: 'Directorio Médico', path: '/directorio', hasMega: true, id: 'directorio' },
    { label: 'Trámites en línea', id: 'tramites_menu', items: [
        { label: 'Trámites en línea (reembolsos y autorizaciones)', path: '/tramites' },
        { label: 'Agendar Cita', path: '/agendamiento' },
    ]},
    { label: 'Blog', path: '/blog', id: 'blog' },
    { label: 'Contacto', path: '/contacto', id: 'contacto' },
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

  const handleNavClick = (path: string, specialty?: string) => {
    navigate(specialty ? `${path}?especialidad=${encodeURIComponent(specialty)}` : path);
    setIsOpen(false);
    setActiveMegamenu(null);
  };

  return (
    <div className="w-full flex flex-col z-50 sticky top-0 shadow-sm border-b border-teal-50">
      {/* Top Info Bar Mobile Animated Version */}
      <div className={`sm:hidden bg-slate-900 text-slate-300 px-4 flex justify-center items-center text-[11px] font-medium relative overflow-hidden transition-all duration-300 ${isScrolled ? 'h-0 py-0 opacity-0' : 'h-9 py-2.5 opacity-100'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTickerIdx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="absolute w-full flex justify-center items-center px-4 text-center"
          >
            {topBarItems[currentTickerIdx].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Top Info Bar Desktop Static Version */}
      <div className={`hidden sm:flex bg-slate-900 text-slate-300 px-4 sm:px-6 lg:px-8 justify-between items-center text-[10px] sm:text-xs font-medium transition-all duration-300 ${isScrolled ? 'h-0 py-0 opacity-0 overflow-hidden' : 'h-9 py-2.5 opacity-100'}`}>
        <div className="flex items-center gap-3">
          <span>🕒 Lunes a Viernes 08:30 - 18:30</span>
          <span className="text-slate-700">|</span>
          <span>📍 Presencia en UIO, GYE, CUE y todo el país</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="tel:022567191" className="hover:text-white transition-colors">📞 02-2567191</a>
          <span className="text-slate-700">|</span>
          <a href="https://wa.me/593987028756" target="_blank" rel="noreferrer" className="hover:text-emerald-450 text-emerald-400 transition-colors">💬 WhatsApp: 098 702 8756</a>
          <span className="text-slate-700">|</span>
          <button onClick={() => navigate('/admin')} className="text-slate-500 hover:text-slate-300 transition-colors text-[10px]">🔐 Admin</button>
        </div>
      </div>

      <header 
        className="relative bg-white/95 backdrop-blur-md transition-all duration-300"
        onMouseLeave={handleCloseMenu}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-20'}`}>
            
            {/* Logo Branding */}
            <div 
              onClick={() => handleNavClick('/')} 
              className="flex items-center gap-3 cursor-pointer group"
              id="colmedikal-brand-logo"
            >
              <Logo className={`w-auto transition-all duration-300 group-hover:scale-105 ${isScrolled ? 'h-8 sm:h-9' : 'h-10 sm:h-11'}`} />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-4 xl:space-x-7 items-center h-full">
              {menuItems.map((item) => {
                const isMega = item.hasMega;
                const hasDropdown = !!item.items;
                const isCurrent = location.pathname === item.path;
                
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
                    {hasDropdown ? (
                      <div className="relative group">
                          <button
                            onClick={() => item.path && handleNavClick(item.path)}
                            className="flex items-center gap-1 px-1 py-2 text-xs xl:text-sm font-medium text-slate-600 hover:text-[#4597CA] cursor-pointer"
                          >
                              <span>{item.label}</span>
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                          <div className="absolute top-full left-0 bg-white shadow-xl border border-slate-100 rounded-xl p-2 min-w-[180px] hidden group-hover:block z-50">
                              {item.items?.map(subItem => (
                                  <button
                                    key={subItem.path}
                                    onClick={() => handleNavClick(subItem.path)}
                                    className="block w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-[#4597CA] rounded-lg cursor-pointer"
                                  >
                                      {subItem.label}
                                  </button>
                              ))}
                          </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleNavClick(item.path!)}
                        className={`relative flex items-center gap-1 px-1 py-2 text-xs xl:text-sm font-medium transition-colors duration-200 cursor-pointer ${
                          isCurrent 
                            ? 'text-[#4597CA] font-semibold' 
                            : 'text-slate-600 hover:text-[#4597CA]'
                        }`}
                        id={`nav-${item.id || item.label}`}
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
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Call to Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 mr-2">
                  {isAdminUser && (
                    <button
                      onClick={() => handleNavClick('/admin')}
                      className={`p-2.5 rounded-full transition-all duration-300 border border-slate-200 ${
                        location.pathname === '/admin' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                      title="Panel Administrativo"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
                    title="Cerrar Sesión"
                    id="header-logout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden xl:inline">Salir</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => handleNavClick('/cotizador')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-md ${
                  location.pathname === '/cotizador'
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

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-top-4 duration-200 max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className="px-4 pt-2 pb-24 space-y-1.5">
              {menuItems.map((item) => (
                <div key={item.id}>
                  {item.items ? (
                    <div className="space-y-1 my-1">
                      <button
                        onClick={() => setExpandedMobileMenu(expandedMobileMenu === item.id ? null : item.id)}
                        className="flex items-center justify-between w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedMobileMenu === item.id ? 'rotate-180 text-[#4597CA]' : 'text-slate-400'}`} />
                      </button>
                      
                      <AnimatePresence>
                        {expandedMobileMenu === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="py-1 space-y-1 bg-slate-50/50 rounded-xl mt-1">
                              {item.items.map((subItem) => (
                                <button
                                  key={subItem.path}
                                  onClick={() => handleNavClick(subItem.path)}
                                  className={`block w-full text-left pl-8 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                                  location.pathname === subItem.path
                                      ? 'bg-[#4597CA]/10 text-[#0C4169] font-semibold border-l-2 border-[#4597CA]'
                                      : 'text-slate-600 hover:bg-white hover:text-[#4597CA]'
                                  }`}
                                >
                                  <span className="text-[#4597CA] opacity-50 mr-2">•</span>{subItem.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <button
                      onClick={() => item.path ? handleNavClick(item.path) : void 0}
                      className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      location.pathname === item.path
                          ? 'bg-[#4597CA]/10 text-[#0C4169] font-semibold border-l-4 border-[#4597CA]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-[#4597CA]'
                      }`}
                      id={`mobile-nav-${item.id}`}
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
              
              {user && (
                <div className="pt-2 flex flex-col gap-2">
                  {isAdminUser && (
                    <button
                      onClick={() => handleNavClick('/admin')}
                      className="flex items-center w-full gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-900 font-bold text-xs cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Panel Administrativo</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center w-full gap-3 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs border border-rose-100 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                <button
                  onClick={() => handleNavClick('/cotizador')}
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white font-bold text-xs shadow-md shadow-[#0C4169]/15 active:scale-98 transition-all cursor-pointer"
                  id="mobile-nav-cotizador"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Cotizar Plan</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
                        onClick={() => handleNavClick('/servicios')}
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
                        onClick={() => handleNavClick('/servicios')}
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
                        onClick={() => handleNavClick('/servicios')}
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
                        onClick={() => handleNavClick('/servicios')}
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
                        onClick={() => handleNavClick('/servicios')}
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
                        onClick={() => handleNavClick('/servicios')}
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
                        onClick={() => handleNavClick('/cotizador')}
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
                          onClick={() => handleNavClick('/directorio', specialty)}
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
                        onClick={() => handleNavClick('/directorio')}
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
