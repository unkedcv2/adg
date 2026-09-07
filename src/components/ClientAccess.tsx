/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CLIENT_ACCESS_CONTENT } from '../data/content';
import { Lock, ArrowRight, ShieldCheck, FileText, Database } from 'lucide-react';

export default function ClientAccess() {
  const handleRedirect = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Standard alert + open behavior as this redirects to an independent external platform
    const confirmRedirect = window.confirm(
      "Usted está saliendo hacia la plataforma de Clientes ADG Almacén de Granos S.A.\n\n¿Desea continuar?"
    );
    if (!confirmRedirect) {
      e.preventDefault();
    }
  };

  return (
    <section id="acceso-clientes" className="py-24 bg-brand-green-dark text-white relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-brand-gold rounded-full filter blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-green-light rounded-full filter blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 lg:p-16 backdrop-blur-md shadow-2xl relative">
          
          {/* Badge */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 md:translate-x-0 md:right-12 -translate-y-4 bg-brand-gold text-brand-green-dark font-display font-bold text-xs uppercase tracking-widest px-5 py-1.5 rounded-full shadow-lg">
            Muy Pronto
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Texts */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 text-brand-gold">
                <Lock className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-widest">{CLIENT_ACCESS_CONTENT.subtitle}</span>
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-white leading-tight">
                {CLIENT_ACCESS_CONTENT.title}
              </h2>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {CLIENT_ACCESS_CONTENT.description}
              </p>

              {/* Portal Features list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                
                <div className="flex items-center space-x-2 bg-white/5 rounded-xl p-3 border border-white/5">
                  <FileText className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-200">Facturas y Contratos</span>
                </div>

                <div className="flex items-center space-x-2 bg-white/5 rounded-xl p-3 border border-white/5">
                  <Database className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-200">Entregas de Grano</span>
                </div>

                <div className="flex items-center space-x-2 bg-white/5 rounded-xl p-3 border border-white/5">
                  <ShieldCheck className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-200">Cuentas Corrientes</span>
                </div>

              </div>
            </div>

            {/* Action Card Button */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="bg-white rounded-3xl p-6 shadow-xl text-center w-full max-w-sm border border-gray-100">
                <div className="w-14 h-14 bg-brand-green-pale rounded-full flex items-center justify-center mx-auto mb-4 text-brand-green">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-brand-green-dark font-display font-bold text-lg mb-2">Ingresar a la Intranet</h3>
                <p className="text-xs text-gray-500 mb-6">
                  El sistema le redirigirá a nuestra plataforma de autogestión comercial de granos.
                </p>
                
                <a
                  href={CLIENT_ACCESS_CONTENT.destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleRedirect}
                  className="flex items-center justify-center space-x-2 w-full bg-brand-green hover:bg-brand-green-light text-white font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg"
                >
                  <span>{CLIENT_ACCESS_CONTENT.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
