/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  const [selectedPlanId, setSelectedPlanId] = useState<string>('esencial');

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
      case 'portal':
        return <PortalAfiliados setCurrentPage={handlePageChange} />;
      case 'faqs':
        return <PreguntasFrecuentes setCurrentPage={handlePageChange} />;
      case 'nosotros':
        return <About setCurrentPage={handlePageChange} />;
      case 'contacto':
        return <Contact setCurrentPage={handlePageChange} />;
      case 'admin':
        return <AdminPanel setCurrentPage={handlePageChange} />;
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

