import React, { useEffect, useState } from 'react';
import { HeartPulse, Mail, Phone, MapPin, ShieldCheck, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

interface VersionInfo {
  version: string;
  commit: string;
  deployedAt: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    fetch('/api/version')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setVersionInfo(data); })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-350 border-t border-slate-800 pt-16 pb-36 md:pb-8" id="colmedikal-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Logo & Vision Block */}
          <div className="md:col-span-1 space-y-4">
            <Link
              to="/"
              className="flex items-center gap-3 group"
              id="footer-logo"
              aria-label="Colmedikal - Inicio"
            >
              <Logo className="w-auto h-10 transition-transform duration-300 group-hover:scale-105 brightness-0 invert opacity-90 group-hover:opacity-100" />
            </Link>
            <p className="text-sm text-white/80 leading-relaxed">
              Cuidamos lo que más importa con la red de atención médica, hospitalización y apoyo preventivo de mayor prestigio en el país. Inspirados en estándares de excelencia.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-mono bg-teal-950/40 px-3 py-1.5 rounded-lg border border-teal-800/40 w-fit">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>SCVS (Superintendencia de Compañías, Valores y Seguros)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Enlaces Corporativos</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-white text-left">
                  Inicio <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-white text-left">
                  Servicios de Salud <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/directorio" className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-white text-left">
                  Directorio de Médicos <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/tramites" className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-white text-left">
                  Trámites y Reembolsos <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/agendamiento" className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-white text-left">
                  Agendar Cita Médica <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-white text-left">
                  Preguntas Frecuentes (FAQs) <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-white text-left">
                  Sobre Nosotros <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-teal-400 transition-colors flex items-center gap-1 group text-white text-left">
                  Blog de Salud <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-800">
                <Link to="/admin" className="text-amber-450 hover:text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  🔒 Portal Administrativo <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Planes Disponibles</h3>
            <ul className="space-y-2.5 text-sm text-white">
              <li><Link to="/cotizador" state={{ planId: 'inicio' }} className="hover:text-teal-400 transition-colors text-left">Plan Inicio 2K</Link></li>
              <li><Link to="/cotizador" state={{ planId: 'proteccion' }} className="hover:text-teal-400 transition-colors text-left">Plan Protección 3K</Link></li>
              <li><Link to="/cotizador" state={{ planId: 'plus' }} className="hover:text-teal-400 transition-colors text-left">Plan Plus 5K</Link></li>
              <li><Link to="/cotizador" className="hover:text-teal-400 transition-colors text-left">Planes Corporativos para Pymes y Grandes Empresas</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Soporte Médico 24/7</h3>
            <ul className="space-y-3.5 text-sm text-white">
              <li className="flex items-start gap-2.5">
                <Phone className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs text-slate-500 font-medium">Asistencia Telefónica</span>
                  <a href="tel:022567191" className="text-white hover:text-teal-300 font-medium font-mono text-base">02-2567191</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 flex items-center justify-center text-teal-400 shrink-0 mt-0.5 font-bold">💬</span>
                <div>
                  <span className="block text-xs text-slate-500 font-medium">WhatsApp</span>
                  <a href="https://wa.me/593987028756" target="_blank" rel="noreferrer" className="text-white hover:text-teal-300 font-medium font-mono text-base">098 702 8756</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-xs text-white">Av. República E6-447 Y Eloy Alfaro Ed. Castillo Sánchez, Quito, Ecuador.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-xs text-white">Horario de atención: Lun - Vie: 08:30 a 18:30.<br />Emergencias clínicas: Atención continua 24 horas.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Separator */}
        <div className="border-t border-slate-800 my-8"></div>

        {/* Bottom Legal */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            © {currentYear} Colmedikal S.A. Todos los derechos reservados. Hecho con cariño ♥ por{' '}
            <a href="https://seoefectivo.com" target="_blank" rel="noreferrer" className="hover:text-slate-400 underline underline-offset-2">SeoEfectivo</a>.
          </div>
          <div className="flex gap-6 items-center">
            {versionInfo && (
              <span className="font-mono text-slate-600">
                {versionInfo.version} • {versionInfo.commit} • {versionInfo.deployedAt}
              </span>
            )}
            <Link to="/privacy" className="hover:text-slate-400">
              Políticas de Privacidad
            </Link>
            <button
              onClick={() => window.dispatchEvent(new Event('colmedikal:open-cookies'))}
              className="hover:text-slate-400 cursor-pointer transition-colors">
              Preferencias de cookies
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
