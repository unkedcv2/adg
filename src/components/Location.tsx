/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LOCATION_CONTENT } from '../data/content';
import { MapPin, Clock, PhoneCall, ExternalLink } from 'lucide-react';

export default function Location() {
  return (
    <section id="ubicacion" className="py-24 bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h3 className="text-xs font-bold text-brand-green uppercase tracking-widest mb-3">
            Presencia Regional Activa
          </h3>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-green-dark tracking-tight">
            Dónde Estamos
          </h2>
          <p className="text-gray-500 mt-4 text-base leading-relaxed">
            Nuestra ubicación estratégica nos permite brindar respuestas rápidas y acompañar de manera eficiente a productores y empresas de toda la región.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Column 1: Detailed Location Cards (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Address & Hours card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex-1 space-y-6">
              
              {/* Address Block */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-brand-green-pale text-brand-green rounded-2xl">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-gray-800 text-sm">Dirección Principal</h4>
                  <p className="text-gray-600 text-sm mt-1">{LOCATION_CONTENT.address}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Daireaux, Provincia de Buenos Aires, Argentina</p>
                </div>
              </div>

              {/* Hours Block */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-brand-green-pale text-brand-green rounded-2xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-gray-800 text-sm">Horarios de Atención</h4>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">{LOCATION_CONTENT.hours}</p>
                  <span className="inline-block mt-2 text-[10px] bg-brand-green/10 text-brand-green font-semibold py-0.5 px-2.5 rounded-full">
                    Abierto de Lunes a Viernes
                  </span>
                </div>
              </div>

            </div>

            {/* Direct Phone Lines Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-5">
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-2">
                <PhoneCall className="w-4 h-4 text-brand-gold" />
                <h4 className="font-display font-bold text-brand-green-dark text-sm">Líneas Telefónicas Directas</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Cereales */}
                <a
                  href={`tel:${LOCATION_CONTENT.phones.cereales.replace('-', '')}`}
                  className="group flex flex-col p-3 bg-gray-50 hover:bg-brand-green-pale hover:border-brand-green/20 rounded-2xl border border-transparent transition-all"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-brand-green">
                    Comercial Cereales
                  </span>
                  <span className="text-sm font-semibold text-gray-800 mt-0.5 group-hover:text-brand-green-dark">
                    {LOCATION_CONTENT.phones.cereales}
                  </span>
                </a>

                {/* Logística */}
                <a
                  href={`tel:${LOCATION_CONTENT.phones.logistica.replace('-', '')}`}
                  className="group flex flex-col p-3 bg-gray-50 hover:bg-brand-green-pale hover:border-brand-green/20 rounded-2xl border border-transparent transition-all"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-brand-green">
                    Logística & Fletes
                  </span>
                  <span className="text-sm font-semibold text-gray-800 mt-0.5 group-hover:text-brand-green-dark">
                    {LOCATION_CONTENT.phones.logistica}
                  </span>
                </a>

                {/* Insumos */}
                <a
                  href={`tel:${LOCATION_CONTENT.phones.insumos.replace('-', '')}`}
                  className="group flex flex-col p-3 bg-gray-50 hover:bg-brand-green-pale hover:border-brand-green/20 rounded-2xl border border-transparent transition-all"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-brand-green">
                    Venta de Insumos
                  </span>
                  <span className="text-sm font-semibold text-gray-800 mt-0.5 group-hover:text-brand-green-dark">
                    {LOCATION_CONTENT.phones.insumos}
                  </span>
                </a>

                {/* Administración */}
                <a
                  href={`tel:${LOCATION_CONTENT.phones.administracion.replace('-', '')}`}
                  className="group flex flex-col p-3 bg-gray-50 hover:bg-brand-green-pale hover:border-brand-green/20 rounded-2xl border border-transparent transition-all"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-brand-green">
                    Administración General
                  </span>
                  <span className="text-sm font-semibold text-gray-800 mt-0.5 group-hover:text-brand-green-dark">
                    {LOCATION_CONTENT.phones.administracion}
                  </span>
                </a>

              </div>
            </div>

          </div>

          {/* Column 2: Google Maps Frame (7 cols) */}
          <div className="lg:col-span-7 relative h-96 lg:h-auto min-h-[350px]">
            <div className="absolute inset-0 bg-white border border-gray-200 rounded-3xl p-2.5 shadow-md overflow-hidden flex flex-col">
              
              {/* Actual Map frame */}
              <div className="flex-1 rounded-2xl overflow-hidden relative border border-gray-100">
                <iframe
                  title="Ubicación de ADG Almacén de Granos S.A."
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3222.147253504369!2d-61.75239122340331!3d-36.13840747244583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95c029307c9197c3%3A0xc3f8373b98c397cf!2sRivadavia%2082%2C%20Daireaux%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>

              {/* Quick interactive link */}
              <div className="pt-3 px-2 flex items-center justify-between text-xs text-gray-500 bg-white">
                <span>📍 Rivadavia 82, Daireaux, Buenos Aires, Argentina</span>
                <a
                  href="https://maps.google.com/?q=Rivadavia+82,+Daireaux,+Buenos+Aires"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 text-brand-green hover:text-brand-green-light font-bold"
                >
                  <span>Abrir en Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
