/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SERVICES_CONTENT } from '../data/content';
import { Warehouse, Truck, FileSpreadsheet } from 'lucide-react';

const iconsMap: Record<string, any> = {
  Warehouse,
  Truck,
  FileSpreadsheet
};

export default function Services() {
  return (
    <section id="servicios" className="py-24 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl">
            <h3 className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3">
              Soluciones para toda la campaña
            </h3>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-green-dark tracking-tight">
              Soluciones integrales para el agro.
            </h2>
          </div>
          <p className="text-gray-500 mt-4 md:mt-0 max-w-sm text-sm leading-relaxed">
            Ofrecemos un servicio unificado desde el acopio de la cosecha hasta la comercialización y coordinación logística, garantizando fluidez y confianza.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES_CONTENT.map((service, index) => {
            const IconComponent = iconsMap[service.iconName] || Warehouse;
            
            return (
              <div
                key={service.id}
                id={service.id}
                className="group relative bg-gray-50 border border-gray-100 rounded-3xl p-8 hover:bg-brand-green hover:text-white transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between"
              >
                {/* Background watermarked grain */}
                <div className="absolute right-4 bottom-4 w-24 h-24 opacity-5 group-hover:opacity-10 pointer-events-none transition-opacity">
                  <IconComponent className="w-full h-full stroke-[1]" />
                </div>

                <div>
                  {/* Service Icon Panel */}
                  <div className="w-14 h-14 bg-white text-brand-green rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-white/10 group-hover:text-brand-gold transition-all duration-300">
                    <IconComponent className="w-7 h-7" />
                  </div>

                  <h4 className="font-display font-extrabold text-2xl text-brand-green-dark mb-4 group-hover:text-white transition-colors">
                    {service.title}
                  </h4>

                  <p className="text-sm text-gray-500 group-hover:text-gray-200 transition-colors leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Arrow or interactive tag */}
                <div className="mt-8 pt-6 border-t border-gray-100 group-hover:border-white/10 flex items-center justify-between">
                  <span className="text-xs font-semibold group-hover:text-brand-gold transition-colors text-brand-green">
                    {index === 1 ? "Flota de +100 Camiones" : "Atención Premium"}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-brand-gold group-hover:translate-x-1.5 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
