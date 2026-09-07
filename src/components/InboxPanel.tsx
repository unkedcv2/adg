/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Mail, Check, Trash2, MailOpen } from 'lucide-react';
import { ContactMessage } from '../types';

interface InboxPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ContactMessage[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function InboxPanel({
  isOpen,
  onClose,
  messages,
  onMarkAsRead,
  onClearAll
}: InboxPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 bg-brand-green text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <Mail className="w-5 h-5 text-brand-gold" />
              <div>
                <h3 className="font-display font-bold text-lg">Consultas Recibidas</h3>
                <p className="text-[10px] text-gray-200 uppercase tracking-widest mt-0.5">Bandeja de Entrada (Demo)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors focus:outline-none"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader summary stats */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{messages.length} mensaje(s) registrado(s)</span>
            {messages.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-bold transition-colors focus:outline-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar bandeja</span>
              </button>
            )}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-20 px-4 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <MailOpen className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-gray-700 text-sm">Bandeja de Entrada Vacía</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Los mensajes que envíe a través del formulario de contacto aparecerán aquí en tiempo real para que pueda verificar los campos y el funcionamiento.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`border rounded-2xl p-4 transition-all relative ${
                    msg.status === 'new'
                      ? 'bg-brand-green-pale/40 border-brand-green/15 shadow-xs'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  {/* Subject Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block text-[10px] bg-brand-gold/15 text-brand-green-dark font-extrabold uppercase tracking-wider py-0.5 px-2 rounded-md">
                      {msg.subject}
                    </span>
                    <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                  </div>

                  {/* Sender details */}
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-800 text-sm leading-none">{msg.name}</h4>
                    <span className="text-xs text-gray-400 mt-1 block">{msg.email}</span>
                    {msg.phone && (
                      <span className="text-[10px] text-brand-green font-medium block mt-0.5">📞 Tel: {msg.phone}</span>
                    )}
                  </div>

                  {/* Message body */}
                  <p className="text-xs text-gray-600 bg-gray-50/70 p-3 rounded-lg border border-gray-100/50 leading-relaxed italic my-3 whitespace-pre-wrap">
                    "{msg.message}"
                  </p>

                  {/* Actions */}
                  {msg.status === 'new' && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onMarkAsRead(msg.id)}
                        className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-brand-green hover:text-brand-green-light py-1 px-2.5 bg-brand-green-pale rounded-lg border border-brand-green/10"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Marcar como leído</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer branding */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 text-center text-[10px] text-gray-400">
            ADG Almacén de Granos S.A. © 2026 · Consola de Control de Formulario
          </div>

        </div>
      </div>
    </div>
  );
}
