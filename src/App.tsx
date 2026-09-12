/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import Impulsores from './components/Impulsores';
import Values from './components/Values';
import Services from './components/Services';
import WhyUs from './components/WhyUs';
import Infrastructure from './components/Infrastructure';
import Location from './components/Location';
import ClientAccess from './components/ClientAccess';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import RainWidget from './components/RainWidget';
import MobileBottomNav from './components/MobileBottomNav';
import CanjeSimulator from './components/CanjeSimulator';
import CanjeFloatingTrigger from './components/CanjeFloatingTrigger';

export default function App() {
  // Check URL pathname, query, or hash to determine initial page
  const [currentPage, setCurrentPage] = useState<'landing' | 'simulador'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const search = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      if (
        path === '/simulador' ||
        path.endsWith('/simulador') ||
        search.get('page') === 'simulador' ||
        search.get('view') === 'simulador' ||
        hash === '#simulador' ||
        hash === '#/simulador' ||
        hash.includes('simulador')
      ) {
        return 'simulador';
      }
    }
    return 'landing';
  });

  // Pluviómetro preservado en código (oculto de la visualización actual por pedido del cliente)
  const [isRainOpen, setIsRainOpen] = useState(false);

  // Synchronize browser history / back-forward navigation & hash changes
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const search = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      if (
        path === '/simulador' ||
        path.endsWith('/simulador') ||
        search.get('page') === 'simulador' ||
        search.get('view') === 'simulador' ||
        hash === '#simulador' ||
        hash === '#/simulador' ||
        hash.includes('simulador')
      ) {
        setCurrentPage('simulador');
      } else {
        setCurrentPage('landing');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const goToSimulator = () => {
    setCurrentPage('simulador');
    if (window.location.pathname !== '/simulador') {
      window.history.pushState({}, '', '?page=simulador#simulador');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToLanding = () => {
    setCurrentPage('landing');
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.href.split('?')[0].split('#')[0];
      window.history.pushState({}, '', baseUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated standalone Canje Simulator page (outside of the landing)
  if (currentPage === 'simulador') {
    return <CanjeSimulator onBackToLanding={goToLanding} />;
  }

  // Main ADG Landing Page
  return (
    <div id="app-root" className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-x-hidden">
      
      {/* Navigation Header */}
      <Header onOpenSimulator={goToSimulator} />

      {/* Main Single Page Sections with bottom padding on mobile to clear the bottom nav */}
      <main className="flex-grow pb-24 lg:pb-0">
        
        {/* Section 1: Hero Banner */}
        <Hero />

        {/* Section 2: Quiénes Somos */}
        <AboutUs />

        {/* Section 2b: Quienes Impulsan este Proyecto (Origen de Marca) */}
        <Impulsores />

        {/* Section 3: Nuestra Esencia (Valores) */}
        <Values />

        {/* Section 4: Servicios (Acopio, Logística, Asesoramiento) */}
        <Services />

        {/* Section 5: ¿Por qué ADG? */}
        <WhyUs />

        {/* Section 6: Nuestra Infraestructura */}
        <Infrastructure />

        {/* Section 7: Dónde Estamos (Ubicación & Google Maps) */}
        <Location />

        {/* Section 8: Acceso Clientes Info Block */}
        <ClientAccess />

        {/* Section 9: Contacto & Formulario de Envío */}
        <ContactForm />

      </main>

      {/* Footer Details */}
      <Footer />

      {/* Floating Channels */}
      <WhatsAppButton />

      {/* Acceso Directo Flotante al Simulador de Canje de Granos (ubicado donde estaba el pluviómetro) */}
      <CanjeFloatingTrigger onOpenSimulator={goToSimulator} />

      {/* 
        Pluviómetro preservado en el código para reactivación futura:
        <RainWidget 
          isOpen={isRainOpen}
          onOpenChange={setIsRainOpen}
        />
      */}

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav onOpenSimulator={goToSimulator} />

    </div>
  );
}

