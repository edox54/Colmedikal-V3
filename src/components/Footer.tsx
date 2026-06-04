import React from 'react';
import { HeartPulse, Mail, Phone, MapPin, ShieldCheck, Clock, ArrowUpRight } from 'lucide-react';
import { Page } from '../types';
import Logo from './Logo';

interface FooterProps {
  setCurrentPage: (page: Page) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-350 border-t border-slate-800 pt-16 pb-8" id="colmedikal-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Logo & Vision Block */}
          <div className="md:col-span-1 space-y-4">
            <div 
              onClick={() => setCurrentPage('home')} 
              className="flex items-center gap-3 cursor-pointer group"
              id="footer-logo"
            >
              <Logo className="w-auto h-10 transition-transform duration-300 group-hover:scale-105 brightness-0 invert opacity-90 group-hover:opacity-100" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cuidamos lo que más importa con la red de atención médica, hospitalización y apoyo preventivo de mayor prestigio en el país. Inspirados en estándares de excelencia.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-mono bg-teal-950/40 px-3 py-1.5 rounded-lg border border-teal-800/40 w-fit">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Supervigilado Superintendencia de Salud</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Enlaces Corporativos</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => setCurrentPage('home')} 
                  className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-slate-400 text-left"
                >
                  Inicio <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('servicios')} 
                  className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-slate-400 text-left"
                >
                  Servicios de Salud <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('directorio')} 
                  className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-slate-400 text-left"
                >
                  Directorio de Médicos <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('tramites')} 
                  className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-slate-400 text-left"
                >
                  Trámites y Reembolsos <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('agendamiento')} 
                  className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-slate-400 text-left"
                >
                  Agendar Cita Médica <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('faqs')} 
                  className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-slate-400 text-left"
                >
                  Preguntas Frecuentes (FAQs) <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('nosotros')} 
                  className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-slate-400 text-left"
                >
                  Sobre Nosotros <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('blog')} 
                  className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-slate-400 text-left"
                >
                  Blog de Salud <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            </ul>
          </div>

          {/* Services Tab */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Planes Disponibles</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button 
                  onClick={() => setCurrentPage('cotizador')} 
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Plan Colmedikal Basico
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('cotizador')} 
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Plan Colmedikal Esencial
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('cotizador')} 
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Plan Colmedikal Premium
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('cotizador')} 
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Planes Corporativos para Pymes y Grandes Empresas
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Support Block */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Soporte Médico 24/7</h3>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Phone className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs text-slate-500 font-medium">Asistencia Telefónica</span>
                  <a href="tel:1800265633" className="text-white hover:text-teal-300 font-medium font-mono text-base">
                    1800-COLMED (265633)
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-xs">
                  Av. de la República E6-447, 170102 Quito, Ecuador.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-xs">
                  Oficinas: Lun - Vie: 08:30 a 17:30.<br />
                  Emergencias clínicas: Atención continua 24 horas.
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Separator Line */}
        <div className="border-t border-slate-800 my-8"></div>

        {/* Bottom Legal / Attributions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            © {currentYear} Colmedikal S.A. Todos los derechos reservados. Inspirado en el diseño líder de Humana Medicina Prepagada.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">Políticas de Privacidad</a>
            <a href="#" className="hover:text-slate-400">Términos del Servicio</a>
            <a href="#" className="hover:text-slate-400">Defensor del Afiliado</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
