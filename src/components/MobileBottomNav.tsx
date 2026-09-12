/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Home,
  Layers,
  Warehouse,
  MessageSquare,
  Calculator
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenRain?: () => void;
  rainMm?: number;
  isRainOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenSimulator?: () => void;
}

export default function MobileBottomNav({ onOpenSimulator }: MobileBottomNavProps = {}) {
  const [activeSection, setActiveSection] = useState('inicio');

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'inicio',
        'quienes-somos',
        'servicios',
        'infraestructura',
        'ubicacion',
        'contacto'
      ];
      const scrollPosition = window.scrollY + 140;

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

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 75;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  const navItems = [
    {
      id: 'inicio',
      targetId: 'inicio',
      label: 'Inicio',
      icon: Home,
    },
    {
      id: 'servicios',
      targetId: 'servicios',
      label: 'Servicios',
      icon: Layers,
    },
    {
      id: 'simulador',
      targetId: 'simulador',
      label: 'Simulador',
      icon: Calculator,
      highlighted: true, // Central destacado como BOTÓN PRINCIPAL
    },
    {
      id: 'infraestructura',
      targetId: 'infraestructura',
      label: 'Plantas',
      icon: Warehouse,
    },
    {
      id: 'contacto',
      targetId: 'ubicacion',
      label: 'Contacto',
      icon: MessageSquare,
    }
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Navegación móvil"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] transition-all duration-300"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)' }}
    >
      <div className="max-w-md mx-auto px-1.5 pt-1.5 pb-1 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const target = item.targetId || item.id;
          const isActive = activeSection === item.id || activeSection === target;
          const isHighlighted = item.highlighted;

          if (isHighlighted) {
            return (
              <button
                key={item.id}
                id={`mobile-tab-${item.id}`}
                onClick={() => {
                  if (item.id === 'simulador' && onOpenSimulator) {
                    onOpenSimulator();
                  } else {
                    scrollToSection(target);
                  }
                }}
                className="flex flex-col items-center justify-center flex-1 -mt-5 group active:scale-95 transition-transform cursor-pointer"
                title={item.label}
              >
                <div className="w-13 h-13 rounded-full bg-brand-green-dark text-white shadow-[0_6px_20px_rgba(7,42,22,0.45)] border-[3px] border-white flex items-center justify-center transition-transform group-hover:scale-105 ring-2 ring-brand-green/20">
                  <Icon className="w-6 h-6 stroke-[2.2] text-brand-gold-light" />
                </div>
                <span className="text-[10px] sm:text-[11px] mt-1 font-black text-brand-green-dark tracking-tight uppercase">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`mobile-tab-${item.id}`}
              onClick={() => scrollToSection(target)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-brand-green font-bold'
                  : 'text-gray-500 hover:text-brand-green'
              }`}
              title={item.label}
            >
              <div className={`relative p-1 rounded-full transition-colors ${
                isActive ? 'bg-brand-green-pale text-brand-green' : ''
              }`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[9.5px] sm:text-[10px] mt-0.5 tracking-tighter sm:tracking-tight font-semibold text-center whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
