/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Cotizador from './components/Cotizador';
import DirectorioMedico from './components/DirectorioMedico';
import TramitesOnline from './components/TramitesOnline';
import AgendamientoCitas from './components/AgendamientoCitas';
import PreguntasFrecuentes from './components/PreguntasFrecuentes';
import PrivacyPolicy from './components/PrivacyPolicy';
import Blog from './components/Blog';
import FloatingWidget from './components/FloatingWidget';
import SEOController from './seo/SEOController';
import { ColmedikalProvider } from './context/ColmedikalContext';
import AdminPanel from './components/AdminPanel';
import NotFound from './components/NotFound';
import TrackingManager from './components/TrackingManager';
import SEOPanel from './components/SEOPanel';
import MapaRedMedica from './components/MapaRedMedica';

// ponytail: flip to false to disable maintenance mode
const MAINTENANCE_MODE = true;

function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('dev_bypass') === '1');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  if (!MAINTENANCE_MODE || authed) return <>{children}</>;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'dev' && pass === 'dev123') {
      sessionStorage.setItem('dev_bypass', '1');
      setAuthed(true);
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/10 border border-teal-500/30 mb-6">
          <svg viewBox="0 0 100 100" fill="none" className="w-10 h-10">
            <path d="M 35 35 L 25 35 A 15 15 0 0 0 25 65 L 35 65 L 35 75 A 15 15 0 0 0 65 75 L 65 65 Z" fill="#4597CA"/>
            <path d="M 35 35 L 35 25 A 15 15 0 0 1 65 25 L 65 35 L 75 35 A 15 15 0 0 1 75 65 L 65 65 Z" fill="white"/>
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Sitio en Mantenimiento</h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Estamos realizando mejoras para brindarte una mejor experiencia. Volvemos pronto.
        </p>
      </div>

      <details className="w-full max-w-sm">
        <summary className="text-slate-500 text-sm cursor-pointer hover:text-slate-400 text-center select-none">
          Ingresar como desarrollador
        </summary>
        <form onSubmit={handleLogin} className="mt-4 bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            value={user}
            onChange={e => setUser(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <input
            type="password"
            placeholder="Clave"
            value={pass}
            onChange={e => setPass(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-colors">
            Acceder
          </button>
        </form>
      </details>

      <p className="text-slate-600 text-xs mt-12">&copy; {new Date().getFullYear()} Colmedikal S.A.</p>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function useSetCurrentPageMapper() {
  const navigate = useNavigate();
  return (page: string) => {
    switch (page) {
      case 'home': navigate('/'); break;
      case 'blog-detalle': navigate('/blog'); break;
      default: navigate('/' + page); break;
    }
  };
}

export default function App() {
  return (
    <MaintenanceGate>
    <ColmedikalProvider>
      <BrowserRouter>
        <ScrollToTop />
        <SEOController />
        <TrackingManager />
        <Routes>
          <Route path="/" element={<HomeLayout component={Home} />} />
          <Route path="/servicios" element={<HomeLayout component={Services} />} />
          <Route path="/directorio" element={<HomeLayout component={DirectorioMedico} />} />
          <Route path="/tramites" element={<HomeLayout component={TramitesOnline} />} />
          <Route path="/agendamiento" element={<HomeLayout component={AgendamientoCitas} />} />
          <Route path="/faqs" element={<HomeLayout component={PreguntasFrecuentes} />} />
          <Route path="/privacy" element={<HomeLayout component={PrivacyPolicy} />} />
          <Route path="/nosotros" element={<HomeLayout component={About} />} />
          <Route path="/contacto" element={<HomeLayout component={Contact} />} />
          <Route path="/blog/*" element={<HomeLayout component={Blog} />} />
          <Route path="/cotizador" element={<AdminLayout component={Cotizador} />} />
          <Route path="/mapa-red-medica" element={<HomeLayout component={MapaRedMedica} />} />
          <Route path="/admin" element={<AdminLayout component={AdminPanel} />} />
          <Route path="/seo-panel" element={<SEOPanelLayout />} />
          <Route path="*" element={<HomeLayout component={NotFound} />} />
        </Routes>
      </BrowserRouter>
    </ColmedikalProvider>
    </MaintenanceGate>
  );
}

function HomeLayout({ component: Component }: { component: React.ElementType }) {
  const setCurrentPage = useSetCurrentPageMapper();
  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-800" id="colmedikal-portal-root">
      <Header />
      <main className="flex-grow pt-4">
        <div className="animate-in fade-in duration-500">
          <Component setCurrentPage={setCurrentPage} />
        </div>
      </main>
      <Footer />
      <FloatingWidget />
    </div>
  );
}

function AdminLayout({ component: Component }: { component: React.ElementType }) {
  const setCurrentPage = useSetCurrentPageMapper();
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
    return () => { if (meta) meta.content = 'index, follow'; };
  }, []);
  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-800" id="colmedikal-portal-layout-root">
      <main className="flex-grow">
        <div className="animate-in fade-in duration-300">
          <Component setCurrentPage={setCurrentPage} />
        </div>
      </main>
    </div>
  );
}

function SEOPanelLayout() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta); }
    meta.content = 'noindex, nofollow';
    return () => { if (meta) meta.content = 'index, follow'; };
  }, []);
  return <SEOPanel />;
}

