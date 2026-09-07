/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ABOUT_CONTENT } from '../data/content';
import { Leaf, Award, TrendingUp } from 'lucide-react';

export default function AboutUs() {
  return (
    <section id="quienes-somos" className="py-24 bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text content - 7 columns on desktop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 text-brand-green font-semibold text-sm uppercase tracking-wider">
              <Leaf className="w-4 h-4 text-brand-gold" />
              <span>{ABOUT_CONTENT.title}</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-green-dark tracking-tight leading-tight">
              {ABOUT_CONTENT.highlight}
            </h2>

            <div className="h-1 w-20 bg-brand-gold rounded-full my-6" />

            <div className="space-y-4 text-gray-600 leading-relaxed text-base">
              {ABOUT_CONTENT.paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? "text-lg text-gray-700 font-medium" : ""}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Visual card/accent - 5 columns on desktop */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-green to-brand-green-light rounded-3xl transform rotate-3 scale-98 opacity-10" />
            
            <div className="relative bg-white p-8 rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-brand-gold/10 rounded-full blur-xl" />
              
              {/* Agricultural graphic/photo placeholder */}
              <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-8 border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600&auto=format&fit=crop"
                  alt="Trigo cosechado y campo argentino"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-semibold tracking-wider uppercase bg-brand-green/80 backdrop-blur-sm py-1 px-3 rounded-full">
                    Garantía de Origen
                  </span>
                </div>
              </div>

              {/* Trust highlights */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2.5 bg-brand-green-pale rounded-xl text-brand-green">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-green-dark text-sm">Respaldo Absoluto</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      El prestigio de firmas con décadas liderando la comercialización y servicios del agro.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2.5 bg-brand-green-pale rounded-xl text-brand-green">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-green-dark text-sm">Visión de Futuro</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Tecnología, logística sincronizada y procesos modernos adaptados a los desafíos de hoy.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
