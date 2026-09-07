/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IMPULSORES_CONTENT } from '../data/content';
import { Plus, MoveRight, Quote } from 'lucide-react';
// @ts-ignore
import logoCircular from '../assets/images/logo_circular_color.png';
// @ts-ignore
import logoTattersall from '../assets/images/logo_Tattersall.png';
// @ts-ignore
import logoPgl from '../assets/images/pgllogoweb.png';
// @ts-ignore
import logoCompletoBlanco from '../assets/images/logo_completo_blanco.png';

export default function Impulsores() {
  return (
    <section className="py-20 bg-white border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h3 className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3">
            El Origen de Nuestra Fortaleza
          </h3>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-green-dark tracking-tight">
            {IMPULSORES_CONTENT.title}
          </h2>
          <p className="text-gray-500 mt-4 text-base leading-relaxed">
            {IMPULSORES_CONTENT.description}
          </p>
        </div>

        {/* Visual Flow diagram: MT + PGL -> ADG */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch relative">
          
          {/* Card 1: Monasterio Tattersall (3 columns) */}
          <div className="lg:col-span-3 bg-gradient-to-b from-gray-50 to-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center h-full">
            {/* Custom MT Logo Emblem */}
            <div className="w-full h-[140px] flex items-center justify-center mb-0 relative overflow-hidden">
              <img 
                src={logoTattersall} 
                alt="Monasterio Tattersall" 
                className="max-h-[75px] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="h-0.5 w-10 bg-brand-gold/40 rounded-full mb-4" />
            <p className="text-xs text-gray-500 leading-relaxed mt-[3px]">
              {IMPULSORES_CONTENT.monasterio.detail}
            </p>
            <div className="mt-[27px] inline-flex items-center space-x-1 text-[10px] font-semibold text-brand-green uppercase tracking-wider bg-brand-green-pale px-3 py-1 rounded-full">
              <span>70+ Años de Confianza</span>
            </div>
          </div>

          {/* Plus Sign Separator (1 column) */}
          <div className="lg:col-span-1 flex items-center justify-center py-4 lg:py-0">
            <div className="w-10 h-10 rounded-full bg-brand-green-pale flex items-center justify-center border border-brand-green/10 text-brand-green shadow-sm">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
          </div>

          {/* Card 2: PGL – Productores General La Madrid (3 columns) */}
          <div className="lg:col-span-3 bg-gradient-to-b from-gray-50 to-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center h-full">
            {/* Custom PGL Logo Emblem */}
            <div className="w-full h-[140px] flex items-center justify-center mb-0 relative overflow-hidden">
              <img 
                src={logoPgl} 
                alt="Productores General La Madrid" 
                className="max-h-[95px] w-auto object-contain pb-0 mb-[14px] mt-[-15px]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="h-0.5 w-10 bg-brand-gold/40 rounded-full mb-4" />
            <p className="text-xs text-gray-500 leading-relaxed">
              {IMPULSORES_CONTENT.pgl.detail}
            </p>
            <div className="mt-4 inline-flex items-center space-x-1 text-[10px] font-semibold text-brand-gold uppercase tracking-wider bg-brand-gold/10 px-3 py-1 rounded-full">
              <span>Líder en Servicios Regionales</span>
            </div>
          </div>

          {/* Arrow Separator (1 column) */}
          <div className="lg:col-span-1 flex items-center justify-center py-4 lg:py-0">
            <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-brand-green-dark shadow-md transform rotate-90 lg:rotate-0">
              <MoveRight className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          {/* Card 3: ADG Almacén de Granos S.A. (3 columns - Highlighted!) */}
          <div className="lg:col-span-3 bg-brand-green border border-brand-green-light rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-center flex flex-col items-center h-full relative overflow-hidden ring-4 ring-brand-green/10">
            {/* Background grain watermark */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-5 pointer-events-none">
              <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
                <path d="M12 2C12 2 15 6 15 10C15 13.5 12.5 15 12 15C11.5 15 9 13.5 9 10C9 6 12 2 12 2Z" />
              </svg>
            </div>
            
            {/* Brand Logo Emblem */}
            <div className="w-full h-[140px] flex items-center justify-center mb-0 relative overflow-hidden">
              <img 
                src={logoCompletoBlanco} 
                alt="ADG Almacén de Granos S.A." 
                className="max-h-[60px] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="h-0.5 w-12 bg-brand-gold rounded-full mb-4" />
            <p className="text-xs text-gray-200 leading-relaxed mt-[7px]">
              {IMPULSORES_CONTENT.adg.detail}
            </p>
            
            <div className="mt-4 inline-flex items-center space-x-1.5 text-[10px] font-bold text-brand-green-dark uppercase tracking-wider bg-brand-gold px-4 py-1.5 rounded-full shadow-sm">
              <span>Sinergia Estratégica</span>
            </div>
          </div>

        </div>

        {/* Informative text below */}
        <div className="mt-20 text-center max-w-3xl mx-auto border-t border-gray-100 pt-12 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4">
            <Quote className="w-8 h-8 text-brand-gold/40" />
          </div>
          <blockquote className="font-display text-xl sm:text-2xl text-brand-green-dark font-medium leading-relaxed italic tracking-tight">
            "Combinamos décadas de trayectoria con la agilidad y las herramientas del campo moderno, garantizando cercanía en cada negocio."
          </blockquote>
          <div className="mt-5 flex items-center justify-center space-x-2">
            <span className="h-px w-6 bg-brand-gold/50" />
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">Nuestra Promesa</span>
            <span className="h-px w-6 bg-brand-gold/50" />
          </div>
        </div>

      </div>
    </section>
  );
}
