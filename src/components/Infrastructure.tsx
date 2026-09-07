/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { INFRA_CONTENT } from '../data/content';
import { TrendingUp, Database, MapPin, Briefcase } from 'lucide-react';

const iconsMap: Record<string, any> = {
  TrendingUp,
  Database,
  MapPin,
  Briefcase
};

export default function Infrastructure() {
  return (
    <section id="infraestructura" className="py-24 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h3 className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3">
            Capacidad Operativa y Logística
          </h3>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-green-dark tracking-tight">
            Nuestra Infraestructura
          </h2>
          <p className="text-gray-500 mt-4 text-base leading-relaxed">
            ADG cuenta con instalaciones diseñadas para brindar un servicio seguro y eficiente, acompañando las necesidades del productor desde la recepción hasta la logística final de su producción.
          </p>
        </div>

        {/* Info Grid (Bento Grid Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {INFRA_CONTENT.map((metric) => {
            const IconComponent = iconsMap[metric.iconName] || TrendingUp;
            
            return (
              <div
                key={metric.id}
                className="group relative bg-gray-50 border border-gray-100 rounded-3xl p-8 hover:bg-white hover:border-brand-green/20 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Decorative glowing gradient behind icon */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-brand-green-pale rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Metric Icon */}
                  <div className="w-12 h-12 bg-white text-brand-green border border-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-green-pale transition-all">
                    <IconComponent className="w-6 h-6 text-brand-green" />
                  </div>

                  {/* Value / Badge */}
                  <div className="flex items-baseline mb-3">
                    <span className="font-display font-extrabold text-3xl text-brand-green-dark group-hover:text-brand-green transition-colors">
                      {metric.value}
                    </span>
                  </div>

                  {/* Label */}
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">
                    {metric.label}
                  </h4>
                  
                  {/* Description */}
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {metric.description}
                  </p>
                </div>

                {/* Accent corner mark */}
                <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-brand-gold rounded-full opacity-50" />
              </div>
            );
          })}
        </div>

        {/* Large summary feature layout */}
        <div className="mt-16 bg-brand-green-pale border border-brand-green/10 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest bg-white border border-brand-green/10 px-3 py-1 rounded-full">
              Preparados para acompañar cada campaña
            </span>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-green-dark">
              ¿Tu logística necesita respuestas ágiles?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              En épocas de cosecha, el tiempo es dinero. Nuestra sólida estructura operativa, combinada con un parque de más de 100 camiones dedicados y personal altamente especializado, nos permite ofrecer turnos rápidos de descarga para optimizar tus tiempos.
            </p>
          </div>
          <div className="flex-shrink-0">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center space-x-2 bg-brand-green hover:bg-brand-green-light text-white font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-full shadow-md transition-all focus:outline-none"
            >
              <span>Consultar por Cupos</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
