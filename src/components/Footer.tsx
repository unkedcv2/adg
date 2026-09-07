/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Facebook, Instagram, Linkedin, ArrowUp } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-brand-green-dark text-white border-t border-white/5 font-sans">
      
      {/* Upper Footer: Logo and quick info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Col 1: Brand presentation (5 cols) */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center">
              <Logo lightBg={false} height={64} />
            </div>

            <p className="text-gray-300 text-sm max-w-sm leading-relaxed">
              Una nueva empresa, respaldada por la experiencia de quienes conocen el agro desde hace años y el compromiso inquebrantable de acompañar al productor en cada campaña.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4 pt-2">
              
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-gold hover:text-brand-green-dark text-white flex items-center justify-center transition-all shadow-sm"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>

              <a
                href="https://www.instagram.com/adgsa.oficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-gold hover:text-brand-green-dark text-white flex items-center justify-center transition-all shadow-sm"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-gold hover:text-brand-green-dark text-white flex items-center justify-center transition-all shadow-sm"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>

            </div>
          </div>

          {/* Col 2: Navigation map (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-display font-semibold text-brand-gold text-xs uppercase tracking-widest">Navegación</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#inicio" className="hover:text-white transition-colors">Inicio</a></li>
              <li><a href="#quienes-somos" className="hover:text-white transition-colors">Quiénes Somos</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Servicios</a></li>
              <li><a href="#infraestructura" className="hover:text-white transition-colors">Infraestructura</a></li>
              <li><a href="#ubicacion" className="hover:text-white transition-colors">Ubicación</a></li>
              <li><a href="#contacto" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Col 3: Quick Terms/Legals (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-display font-semibold text-brand-gold text-xs uppercase tracking-widest">Soporte y Legal</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <button
                  onClick={() => alert("Política de Privacidad de ADG:\n\nSus datos de contacto se procesan con absoluta reserva para coordinar fletes, acopio e insumos. No compartimos su información personal con terceros ajenos a la operatoria comercial de ADG Almacén de Granos S.A.")}
                  className="hover:text-white transition-colors text-left focus:outline-none"
                >
                  Política de Privacidad
                </button>
              </li>
              <li>
                <button
                  onClick={() => alert("Términos y Condiciones:\n\nTodos los cupos de descarga y transacciones de granos se rigen por la normativa vigente de la Bolsa de Cereales de la República Argentina.")}
                  className="hover:text-white transition-colors text-left focus:outline-none"
                >
                  Términos y Condiciones
                </button>
              </li>
              <li>
                <span className="block text-xs text-gray-400 leading-relaxed mt-4">
                  Rivadavia 82, Daireaux, Buenos Aires.<br />
                  Cereales S.A. Reg. Nro. 2401-A
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Lower Footer: Copyright & Scroll to Top */}
      <div className="border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            © 2026 ADG Almacén de Granos S.A. Todos los derechos reservados. Desarrollado con el respaldo de Monasterio Tattersall S.A. y PGL.
          </p>
          <button
            onClick={handleScrollToTop}
            className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition-colors bg-white/5 py-2 px-4 rounded-full border border-white/5 hover:border-white/25 focus:outline-none"
            title="Volver arriba"
          >
            <span>Volver Arriba</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </footer>
  );
}
