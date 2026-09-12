/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lock, Calculator } from 'lucide-react';
import Logo from './Logo';

interface HeaderProps {
  onOpenInbox?: () => void;
  unreadCount?: number;
  onOpenSimulator?: () => void;
}

export default function Header({ onOpenSimulator }: HeaderProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Simple active link tracker on scroll
      const sections = ['inicio', 'quienes-somos', 'servicios', 'infraestructura', 'ubicacion', 'contacto', 'acceso-clientes'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Inicio', href: '#inicio', id: 'inicio' },
    { label: 'Quiénes Somos', href: '#quienes-somos', id: 'quienes-somos' },
    { label: 'Servicios', href: '#servicios', id: 'servicios' },
    { label: 'Infraestructura', href: '#infraestructura', id: 'infraestructura' },
    { label: 'Contacto', href: '#ubicacion', id: 'ubicacion' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(targetId);
    }
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-brand-green-dark/95 shadow-md py-1.5 sm:py-2 border-b border-brand-green/10 backdrop-blur-md'
          : 'bg-white/95 shadow-xs py-2 sm:py-2.5 border-b border-gray-100/60 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center lg:justify-between">
          
          {/* Logo ADG */}
          <a
            id="logo-link"
            href="#inicio"
            onClick={(e) => handleNavClick(e, '#inicio')}
            className="flex items-center justify-center group transition-transform active:scale-95"
            aria-label="ADG Almacén de Granos - Inicio"
          >
            <div className="hidden sm:block">
              <Logo lightBg={!isScrolled} height={isScrolled ? 50 : 60} />
            </div>
            <div className="block sm:hidden">
              <Logo lightBg={!isScrolled} height={isScrolled ? 46 : 54} />
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.href}
                  id={`nav-${item.id}`}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`text-sm font-semibold px-3.5 xl:px-4 py-2.5 rounded-full transition-all duration-500 ease-in-out hover:scale-[1.04] active:scale-95 ${
                    isScrolled
                      ? isActive
                        ? 'text-white bg-white/15 shadow-[0_3px_12px_-4px_rgba(255,255,255,0.15)] border border-white/20'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                      : isActive
                        ? 'text-brand-green bg-brand-green-pale/90 shadow-[0_3px_12px_-4px_rgba(4,69,36,0.18)] border border-brand-green/10'
                        : 'text-gray-600 hover:bg-brand-green-pale/50 hover:text-brand-green'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}

            {/* Botón Simulador: Activado y destacado en color verde oscuro con letras blancas */}
            <button
              id="header-nav-simulador-btn"
              type="button"
              onClick={onOpenSimulator}
              className={`flex items-center space-x-1.5 px-4 xl:px-5 py-2.5 rounded-full text-xs xl:text-sm font-extrabold uppercase tracking-wide transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 shadow-md cursor-pointer ${
                isScrolled
                  ? 'bg-[#052212] text-white border border-emerald-400/30 ring-1 ring-white/20 hover:bg-white hover:text-brand-green-dark'
                  : 'bg-brand-green-dark text-white border border-brand-green-dark/30 hover:bg-brand-green hover:shadow-lg ring-1 ring-brand-green/20'
              }`}
              title="Abrir Simulador de Canje de Granos"
            >
              <Calculator className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-brand-gold-light shrink-0" />
              <span>Simulador</span>
            </button>

            {/* Clients access action button */}
            <a
              id="header-client-access-btn"
              href="#acceso-clientes"
              onClick={(e) => handleNavClick(e, '#acceso-clientes')}
              className={`flex items-center space-x-1.5 px-4 xl:px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-500 ease-in-out border hover:scale-105 active:scale-95 hover:shadow-md ${
                isScrolled
                  ? activeSection === 'acceso-clientes'
                    ? 'bg-white text-brand-green-dark border-white shadow-sm'
                    : 'bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10'
                  : activeSection === 'acceso-clientes'
                    ? 'bg-brand-green text-white border-brand-green shadow-sm'
                    : 'bg-white text-brand-green border-brand-green/30 hover:border-brand-green hover:bg-brand-green/5'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Clientes</span>
            </a>
          </nav>

        </div>
      </div>
    </header>
  );
}
