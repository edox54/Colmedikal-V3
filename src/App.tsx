/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Page, BlogPost } from './types';
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
import Blog from './components/Blog';
import FloatingWidget from './components/FloatingWidget';
import SEOController from './seo/SEOController';
import { ColmedikalProvider } from './context/ColmedikalContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('esencial');
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            setCurrentPage={handlePageChange} 
            setSelectedPlanId={(id) => {
              setSelectedPlanId(id);
              handlePageChange('cotizador');
            }} 
          />
        );
      case 'servicios':
        return <Services setCurrentPage={handlePageChange} />;
      case 'directorio':
        return <DirectorioMedico setCurrentPage={handlePageChange} />;
      case 'tramites':
        return <TramitesOnline setCurrentPage={handlePageChange} />;
      case 'agendamiento':
        return <AgendamientoCitas setCurrentPage={handlePageChange} />;
      case 'faqs':
        return <PreguntasFrecuentes setCurrentPage={handlePageChange} />;
      case 'nosotros':
        return <About setCurrentPage={handlePageChange} />;
      case 'contacto':
        return <Contact setCurrentPage={handlePageChange} />;
      case 'blog':
      case 'blog-detalle':
        return (
          <Blog 
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
            activeBlogPost={activeBlogPost}
            setActiveBlogPost={setActiveBlogPost}
            setSelectedPlanId={setSelectedPlanId}
          />
        );
      case 'cotizador':
        return (
          <Cotizador 
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
            selectedPlanId={selectedPlanId}
          />
        );
      default:
        return (
          <Home 
            setCurrentPage={handlePageChange} 
            setSelectedPlanId={setSelectedPlanId} 
          />
        );
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
  };

  const isCotizador = currentPage === 'cotizador';

  if (isCotizador) {
    return (
      <ColmedikalProvider>
        <SEOController currentPage={currentPage} activeBlogPost={activeBlogPost} />
        <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-800" id="colmedikal-portal-cotizador-root">
          <main className="flex-grow">
            <div className="animate-in fade-in duration-300">
              {renderContent()}
            </div>
          </main>
        </div>
      </ColmedikalProvider>
    );
  }

  return (
    <ColmedikalProvider>
      <SEOController currentPage={currentPage} activeBlogPost={activeBlogPost} />
      <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-800" id="colmedikal-portal-root">
        
        {/* 1. Header Banner */}
        <Header currentPage={currentPage} setCurrentPage={handlePageChange} />

        {/* 2. Main content container */}
        <main className="flex-grow pt-4">
          <div className="animate-in fade-in duration-500">
            {renderContent()}
          </div>
        </main>

        {/* 3. Footer content */}
        <Footer setCurrentPage={handlePageChange} />

        {/* 4. Support Widget (Desktop support rail / Mobile bottom floating glass pill) */}
        <FloatingWidget currentPage={currentPage} setCurrentPage={handlePageChange} />
        
      </div>
    </ColmedikalProvider>
  );
}

