/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WHY_ADG_CONTENT } from '../data/content';
import { Check, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function WhyUs() {
  return (
    <section className="py-24 bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading and highlights */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 text-brand-green font-semibold text-sm uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              <span>¿POR QUÉ ADG?</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-green-dark tracking-tight leading-tight">
              Porque entendemos <br />
              <span className="text-brand-green">al productor.</span>
            </h2>

            <div className="h-1 w-20 bg-brand-gold rounded-full my-6" />

            <p className="text-gray-600 leading-relaxed text-base max-w-lg">
              Somos una empresa que combina experiencia, compromiso y una visión renovada para ofrecer un servicio cercano, ágil y de excelencia en el mercado agropecuario.
            </p>

            {/* Accent Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-start space-x-4 max-w-md">
              <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-brand-green-dark text-sm">Trato Directo</h4>
                <p className="text-xs text-gray-500 mt-1">
                  En ADG no sos un número más. Nos sentamos con vos a diseñar el mejor esquema para tu producción.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Beautiful custom bullet list */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 lg:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-brand-green/5 rounded-full blur-2xl" />
            
            <h3 className="font-display font-bold text-xl text-brand-green-dark mb-8">
              Nuestros Diferenciales de Valor
            </h3>

            <div className="space-y-6 relative z-10">
              {WHY_ADG_CONTENT.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-green-pale text-brand-green flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-all">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base font-medium group-hover:text-brand-green transition-colors">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Highlight quote at bottom */}
            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full">
                Compromiso ADG S.A.
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
