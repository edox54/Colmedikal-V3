/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Page } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Cotizador from './components/Cotizador';
import DirectorioMedico from './components/DirectorioMedico';
import PortalAfiliados from './components/PortalAfiliados';
import PreguntasFrecuentes from './components/PreguntasFrecuentes';
import AdminPanel from './components/AdminPanel';
import { ColmedicalProvider } from './context/ColmedicalContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('integral');

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            setCurrentPage={setCurrentPage} 
            setSelectedPlanId={(id) => {
              setSelectedPlanId(id);
              setCurrentPage('cotizador');
            }} 
          />
        );
      case 'servicios':
        return <Services setCurrentPage={setCurrentPage} />;
      case 'directorio':
        return <DirectorioMedico setCurrentPage={setCurrentPage} />;
      case 'portal':
        return <PortalAfiliados setCurrentPage={setCurrentPage} />;
      case 'faqs':
        return <PreguntasFrecuentes setCurrentPage={setCurrentPage} />;
      case 'nosotros':
        return <About setCurrentPage={setCurrentPage} />;
      case 'contacto':
        return <Contact setCurrentPage={setCurrentPage} />;
      case 'admin':
        return <AdminPanel setCurrentPage={setCurrentPage} />;
      case 'cotizador':
        return (
          <Cotizador 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            selectedPlanId={selectedPlanId}
          />
        );
      default:
        return (
          <Home 
            setCurrentPage={setCurrentPage} 
            setSelectedPlanId={setSelectedPlanId} 
          />
        );
    }
  };

  // Scroll to top automatically when swapping pages
  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ColmedicalProvider>
      <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-800" id="colmedical-portal-root">
        
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
        
      </div>
    </ColmedicalProvider>
  );
}

