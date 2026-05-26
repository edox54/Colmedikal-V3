import React, { useState } from 'react';
import { Menu, X, HeartPulse, Sparkles, ChevronRight, Calculator, User, ShieldCheck } from 'lucide-react';
import { Page } from '../types';
import Logo from './Logo';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export default function Header({ currentPage, setCurrentPage }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Inicio', id: 'home' as Page },
    { label: 'Servicios', id: 'servicios' as Page },
    { label: 'Directorio Médico', id: 'directorio' as Page },
    { label: 'Nosotros', id: 'nosotros' as Page },
    { label: 'FAQs', id: 'faqs' as Page },
    { label: 'Contacto', id: 'contacto' as Page },
  ];

  const handleNavClick = (pageId: Page) => {
    setCurrentPage(pageId);
    setIsOpen(false);
  };

  return (
    <div className="w-full flex flex-col z-50 sticky top-0 shadow-sm border-b border-teal-50">
      {/* Top Bar for Portals */}
      <div className="bg-slate-900 text-slate-200 py-1.5 px-4 sm:px-6 lg:px-8 flex justify-end items-center gap-4 text-[10px] sm:text-xs font-medium">
        <button
          onClick={() => handleNavClick('portal')}
          className={`flex items-center gap-1.5 transition-colors ${
            currentPage === 'portal' ? 'text-[#4f93c5] font-bold' : 'hover:text-white'
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
            currentPage === 'admin' ? 'text-[#4f93c5] font-bold' : 'hover:text-white'
          }`}
          id="topbar-nav-admin"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Portal Admin</span>
        </button>
      </div>

      <header className="bg-white/90 backdrop-blur-md transition-all duration-300">
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
            <nav className="hidden lg:flex space-x-5 xl:space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-1 py-2 text-xs xl:text-sm font-medium transition-colors duration-200 ${
                    currentPage === item.id 
                      ? 'text-[#4f93c5] font-semibold' 
                      : 'text-slate-600 hover:text-[#4f93c5]'
                  }`}
                  id={`nav-${item.id}`}
                >
                  {item.label}
                  {currentPage === item.id && (
                    <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#4f93c5] rounded-full" />
                  )}
                </button>
              ))}
            </nav>

            {/* Call to Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => handleNavClick('cotizador')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-md ${
                  currentPage === 'cotizador'
                    ? 'bg-gradient-to-r from-[#143b67] to-[#4f93c5] text-white shadow-[#143b67]/20 scale-95'
                    : 'bg-gradient-to-r from-[#4f93c5] to-[#143b67] text-white shadow-[#4f93c5]/10 hover:shadow-[#4f93c5]/20 hover:scale-102 hover:-translate-y-0.5'
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
          <div className="lg:hidden border-t border-slate-100 bg-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="px-4 pt-2 pb-6 space-y-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-[#4f93c5]/10 text-[#143b67] font-semibold border-l-4 border-[#4f93c5]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#4f93c5]'
                  }`}
                  id={`mobile-nav-${item.id}`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                <button
                  onClick={() => handleNavClick('cotizador')}
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#4f93c5] to-[#143b67] text-white font-bold text-xs shadow-md shadow-[#143b67]/15 active:scale-98 transition-all"
                  id="mobile-nav-cotizador"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Cotizar Plan</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
