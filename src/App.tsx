/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
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
import ComparadorPlanes from './components/ComparadorPlanes';
import MapaRedMedica from './components/MapaRedMedica';

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
          <Route path="/comparador" element={<HomeLayout component={ComparadorPlanes} />} />
          <Route path="/mapa-red-medica" element={<HomeLayout component={MapaRedMedica} />} />
          <Route path="/admin" element={<AdminLayout component={AdminPanel} />} />
          <Route path="/seo-panel" element={<SEOPanelLayout />} />
          <Route path="*" element={<HomeLayout component={NotFound} />} />
        </Routes>
      </BrowserRouter>
    </ColmedikalProvider>
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

