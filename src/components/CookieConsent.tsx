import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie, Shield } from 'lucide-react';

export const CONSENT_KEY = 'colmedikal_cookie_consent';

export interface CookieConsentData {
  functional: true;
  statistics: boolean;
  marketing: boolean;
  savedAt: string;
}

export function getStoredConsent(): CookieConsentData | null {
  try {
    const s = localStorage.getItem(CONSENT_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function saveConsent(statistics: boolean, marketing: boolean) {
  const consent: CookieConsentData = {
    functional: true, statistics, marketing,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent('colmedikal:consent-updated', { detail: consent }));
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-checked={checked}
      role="switch"
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none shrink-0 ${checked ? 'bg-teal-500' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function CookieConsent() {
  const [visible, setVisible]     = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [stats, setStats]         = useState(true);
  const [mkt, setMkt]             = useState(true);

  useEffect(() => {
    if (!getStoredConsent()) {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }

    // Allow re-opening from footer
    const handler = () => { setVisible(true); setPanelOpen(true); };
    window.addEventListener('colmedikal:open-cookies', handler);
    return () => window.removeEventListener('colmedikal:open-cookies', handler);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handler = () => { setVisible(true); setPanelOpen(true); };
    window.addEventListener('colmedikal:open-cookies', handler);
    return () => window.removeEventListener('colmedikal:open-cookies', handler);
  }, [visible]);

  const acceptAll = () => { saveConsent(true, true);   setVisible(false); setPanelOpen(false); };
  const rejectAll = () => { saveConsent(false, false); setVisible(false); setPanelOpen(false); };
  const save      = () => { saveConsent(stats, mkt);   setVisible(false); setPanelOpen(false); };

  if (!visible) return null;

  return (
    <>
      {/* Panel backdrop */}
      {panelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[998] backdrop-blur-sm"
          onClick={() => setPanelOpen(false)}
        />
      )}

      {/* Preferences panel — slides from bottom */}
      {panelOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-2xl mx-auto px-6 sm:px-8 py-6 space-y-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Preferencias de Privacidad y Cookies</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Gestiona tu consentimiento por categoría</p>
              </div>
              <button onClick={() => setPanelOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legal notice */}
            <div className="bg-slate-50 rounded-2xl p-4 text-[11px] text-slate-600 leading-relaxed space-y-2.5 border border-slate-100">
              <p>
                Este sitio utiliza cookies o tecnologías similares para fines técnicos y, con su consentimiento, para mejorar la experiencia de navegación, realizar mediciones y ofrecer contenido o publicidad personalizada, según se describe en nuestra{' '}
                <Link to="/privacy" onClick={() => setPanelOpen(false)} className="text-teal-600 font-semibold hover:underline">Política de Cookies</Link>.
              </p>
              <p>
                En la sección de Carreras, procesamos los datos personales que usted envíe —incluyendo información de su currículum, formularios y documentación relacionada— conforme a nuestra{' '}
                <Link to="/privacy" onClick={() => setPanelOpen(false)} className="text-teal-600 font-semibold hover:underline">Política de Privacidad</Link>{' '}
                y a la normativa de protección de datos del Ecuador.
              </p>
              <p>Usted puede otorgar, denegar o modificar su consentimiento en cualquier momento desde este panel. Rechazar ciertas cookies puede limitar funcionalidades del sitio.</p>
            </div>

            {/* Category: Funcional */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-sm font-bold text-slate-900">Funcional</span>
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 uppercase tracking-wide whitespace-nowrap">Siempre activo</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pl-7">
                El almacenamiento o acceso técnico es estrictamente necesario para el propósito legítimo de permitir el uso de un servicio específico explícitamente solicitado por el usuario, o con el único propósito de llevar a cabo la transmisión de una comunicación a través de una red de comunicaciones electrónicas.
              </p>
            </div>

            {/* Category: Estadísticas */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-base shrink-0">📊</span>
                  <span className="text-sm font-bold text-slate-900">Estadísticas</span>
                </div>
                <Toggle checked={stats} onChange={() => setStats(s => !s)} />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pl-7">
                El almacenamiento o acceso técnico que es utilizado exclusivamente con fines estadísticos anónimos. Nos permite medir el tráfico y mejorar la experiencia de navegación del sitio web sin identificar a los usuarios.
              </p>
            </div>

            {/* Category: Marketing */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-base shrink-0">📣</span>
                  <span className="text-sm font-bold text-slate-900">Marketing</span>
                </div>
                <Toggle checked={mkt} onChange={() => setMkt(m => !m)} />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pl-7">
                El almacenamiento o acceso técnico es necesario para crear perfiles de usuario para enviar publicidad, o para rastrear al usuario en una web o en varias web con fines de marketing similares.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1 pb-2">
              <button onClick={rejectAll}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors">
                Rechazar todo
              </button>
              <button onClick={save}
                className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm">
                Guardar preferencias
              </button>
              <button onClick={acceptAll}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0C4169] hover:bg-[#0a3558] text-white text-xs font-bold cursor-pointer transition-colors shadow-sm">
                Aceptar todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom banner — only when panel is closed */}
      {!panelOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[997] animate-in slide-in-from-bottom-3 duration-500">
          <div className="bg-slate-900/95 backdrop-blur border-t border-slate-700/80 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

                {/* Icon + text */}
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <Cookie className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white leading-none mb-0.5">Aviso de Privacidad y Uso de Cookies</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Utilizamos cookies para mejorar tu experiencia y realizar mediciones. Consulta nuestra{' '}
                      <Link to="/privacy" className="text-teal-400 hover:underline font-medium">Política de Privacidad</Link>.
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button onClick={rejectAll}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-[11px] font-semibold cursor-pointer transition-all">
                    Rechazar todo
                  </button>
                  <button onClick={() => setPanelOpen(true)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-teal-700/70 text-teal-400 hover:bg-teal-950/60 text-[11px] font-semibold cursor-pointer transition-all">
                    Personalizar
                  </button>
                  <button onClick={acceptAll}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold cursor-pointer transition-all shadow-md">
                    Aceptar todo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
