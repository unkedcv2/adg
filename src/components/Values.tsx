/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VALUES_CONTENT } from '../data/content';
import { ShieldCheck, Handshake, Users, Lightbulb } from 'lucide-react';

const iconsMap: Record<string, any> = {
  ShieldCheck,
  Handshake,
  Users,
  Lightbulb
};

export default function Values() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h3 className="text-xs font-bold text-brand-green uppercase tracking-widest mb-3">
            Nuestros Pilares Fundacionales
          </h3>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-green-dark tracking-tight">
            Nuestra Esencia
          </h2>
          <p className="text-gray-500 mt-4 text-base leading-relaxed">
            Cuatro valores que guían nuestra labor diaria y definen la forma en la que nos vinculamos con cada productor del país.
          </p>
        </div>

        {/* Grid of Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {VALUES_CONTENT.map((value) => {
            const IconComponent = iconsMap[value.iconName] || ShieldCheck;
            
            return (
              <div
                key={value.id}
                id={value.id}
                className="group relative bg-white border border-gray-100 rounded-3xl p-8 hover:border-brand-green/20 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Decorative border accent that glows on hover */}
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-green to-brand-green-light rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div>
                  {/* Icon Plate */}
                  <div className="w-14 h-14 bg-brand-green-pale text-brand-green rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-green group-hover:text-white transition-all duration-300 shadow-sm">
                    <IconComponent className="w-7 h-7" />
                  </div>

                  <h4 className="font-display font-bold text-xl text-brand-green-dark mb-3 group-hover:text-brand-green transition-colors">
                    {value.title}
                  </h4>
                  
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {value.description}
                  </p>
                </div>

                {/* Little decorative index */}
                <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold">ADG S.A.</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold group-hover:scale-150 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
