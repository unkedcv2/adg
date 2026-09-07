/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { LOCATION_CONTENT } from '../data/content';
import { ContactMessage } from '../types';

interface ContactFormProps {
  onMessageSubmitted?: (message: ContactMessage) => void;
}

export default function ContactForm({ onMessageSubmitted }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Acopio de Granos',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const subjects = [
    'Acopio de Granos',
    'Logística y Camiones',
    'Insumos Agropecuarios',
    'Administración / Liquidaciones',
    'Otras Consultas'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Send real email via FormSubmit AJAX to unkedcv@gmail.com
      const response = await fetch('https://formsubmit.co/ajax/unkedcv@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: 'ADG Web',
          Nombre: formData.name,
          Email: formData.email,
          'Teléfono / Celular': formData.phone || 'No especificado',
          'Área de Consulta / Asunto': formData.subject,
          Mensaje: formData.message,
          _subject: 'Nuevo mensaje desde la web de ADG Almacén de Granos',
          _captcha: 'false',
          _template: 'table'
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar el formulario');
      }

      const newMessage: ContactMessage = {
        id: `msg-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'No especificado',
        subject: formData.subject,
        message: formData.message,
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('es-AR'),
        status: 'new'
      };

      // Persist the message in parent state if handler is provided
      onMessageSubmitted?.(newMessage);

      setIsSubmitting(false);
      setSubmitStatus('success');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Acopio de Granos',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      setSubmitStatus('error');
    }
  };

  return (
    <section id="contacto" className="py-24 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h3 className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3">
            Atención Inmediata al Productor
          </h3>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-green-dark tracking-tight">
            Estamos para ayudarte.
          </h2>
          <p className="text-gray-500 mt-4 text-base leading-relaxed">
            ¿Tenés una consulta o querés comunicarte con nuestro equipo? Completá el formulario o contactanos por cualquiera de nuestros canales institucionales.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start lg:items-stretch">
          
          {/* Left Column: Institutional info (5 cols) */}
          <div className="lg:col-span-5 lg:h-full">
            <div className="bg-brand-green-pale border border-brand-green/10 rounded-3xl p-8 lg:p-10 lg:h-full flex flex-col justify-between">
              
              <div className="flex flex-col flex-grow">
                <h3 className="font-display font-bold text-xl text-brand-green-dark">
                  Canales de Contacto
                </h3>

                <div className="mt-8 flex-grow flex flex-col justify-between space-y-6 lg:space-y-0 lg:py-4">
                  
                  {/* Dirección */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2.5 bg-white text-brand-green border border-brand-green/10 rounded-xl">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dirección</h4>
                      <p className="text-gray-800 text-sm font-semibold mt-1">{LOCATION_CONTENT.address}</p>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2.5 bg-white text-brand-green border border-brand-green/10 rounded-xl">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Teléfono Central</h4>
                      <a href="tel:2314405179" className="text-gray-800 hover:text-brand-green text-sm font-semibold mt-1 block">
                        {LOCATION_CONTENT.phones.cereales}
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2.5 bg-white text-brand-green border border-brand-green/10 rounded-xl">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">WhatsApp Directo</h4>
                      <a
                        href="https://wa.me/5492314405179"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-green hover:text-brand-green-light text-sm font-bold mt-1 block"
                      >
                        +54 9 2314 405179
                      </a>
                    </div>
                  </div>

                  {/* Correo */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2.5 bg-white text-brand-green border border-brand-green/10 rounded-xl">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</h4>
                      <a href="mailto:contacto@almacendegranos.com.ar" className="text-gray-800 hover:text-brand-green text-sm font-semibold mt-1 block">
                        contacto@almacendegranos.com.ar
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* Legal Notice */}
              <div className="pt-6 mt-8 border-t border-brand-green/10 text-xs text-gray-500 leading-relaxed">
                Su consulta será enviada directamente al departamento correspondiente (Cereales, Logística, Insumos o Administración) para brindarle una respuesta dentro de las primeras 24 horas hábiles.
              </div>

            </div>
          </div>

          {/* Right Column: Interactive Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 lg:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 -mt-8 -ml-8 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl" />

              <h3 className="font-display font-bold text-xl text-brand-green-dark mb-6">
                Envianos un Mensaje
              </h3>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-brand-green-pale border border-brand-green/20 rounded-2xl flex items-start space-x-3 text-brand-green">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold">¡Mensaje enviado con éxito!</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Hemos recibido su consulta correctamente. Nos pondremos en contacto con usted a la brevedad.
                    </p>
                    <button
                      onClick={() => setSubmitStatus('idle')}
                      className="mt-3 text-xs font-bold uppercase tracking-wider text-brand-green hover:underline focus:outline-none"
                    >
                      Enviar otra consulta
                    </button>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold">Error en el formulario</p>
                    <p className="text-xs mt-1">
                      Por favor, complete todos los campos obligatorios (*): Nombre, Email y Mensaje.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                
                {/* Nombre */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Nombre Completo / Razón Social <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej. Juan Pérez o Agropecuaria Don Carlos S.A."
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Correo Electrónico <span className="text-brand-gold">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ejemplo@correo.com"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Teléfono / Celular
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Ej. 2314-405179"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                    />
                  </div>
                </div>

                {/* Asunto */}
                <div>
                  <label htmlFor="subject" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Área o Motivo de Consulta <span className="text-brand-gold">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em', backgroundRepeat: 'no-repeat' }}
                  >
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Mensaje */}
                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Mensaje / Consulta <span className="text-brand-gold">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Escriba aquí los detalles de su consulta, lotes, flete requerido o insumos..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center space-x-2 w-full bg-brand-green hover:bg-brand-green-light text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-md focus:outline-none disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Mensaje</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
