/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Printer,
  Copy,
  Check,
  X,
  Share2,
  FileText,
  MessageSquare,
  Sparkles,
  Calendar,
  Building2,
  Download
} from 'lucide-react';
import { CalculationResult, CanjeConfigData } from '../data/canjeConfig';
import Logo from './Logo';

interface CanjeQuoteExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult | null;
  config: CanjeConfigData;
  moneda: 'ARS' | 'USD';
}

export default function CanjeQuoteExportModal({
  isOpen,
  onClose,
  result,
  config,
  moneda
}: CanjeQuoteExportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentCurrency = moneda || 'ARS';
  const formatMoney = (val: number, curr: 'ARS' | 'USD' = currentCurrency) => {
    const prefix = curr === 'ARS' ? '$ ' : 'U$S ';
    return prefix + Math.round(val).toLocaleString('es-AR');
  };

  const formatTn = (val: number) => {
    return val.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' Tn';
  };

  const currentDateStr = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const currentTimeStr = new Date().toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const quoteId = `ADG-${Math.floor(100000 + Math.random() * 900000)}`;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Copy summary to clipboard
  const handleCopy = () => {
    if (!result) return;
    const summaryText =
      `*COTIZACIÓN DE CANJE DE GRANOS - ADG ALMACÉN DE GRANOS*\n` +
      `Fecha: ${currentDateStr} ${currentTimeStr} | Ref: ${quoteId}\n\n` +
      `• *Operación:* ${formatMoney(result.valorOperacion, moneda)}\n` +
      `• *Grano:* ${result.grano.name} (${formatMoney(result.precioBaseTn, moneda)}/Tn)\n` +
      `• *Score SISA:* ${result.sisa.name} (${result.sisa.statusLabel})\n` +
      `• *Dólar BNA:* $ ${config.dolarBNA.venta}\n\n` +
      `*RESULTADOS COMPARATIVOS:*\n` +
      `• *Entrega por Canje ADG:* ${formatTn(result.canje.totalToneladas)} (Precio final: ${formatMoney(result.canje.precioFinalTn, moneda)}/Tn)\n` +
      `• *Venta Tradicional:* ${formatTn(result.normal.totalToneladas)} (Precio final neto: ${formatMoney(result.normal.precioFinalTn, moneda)}/Tn)\n\n` +
      `*BENEFICIO NETO DEL PRODUCTOR:*\n` +
      `• *Cereal Ahorrado:* ${formatTn(result.ahorroToneladas)} de ${result.grano.shortName}\n` +
      `• *Ahorro Económico:* ${formatMoney(result.ahorroMonto, moneda)}\n` +
      `• *Retenciones Fiscales en Canje:* 0% (Sin retención de IVA ni Ganancias)\n\n` +
      `ADG Almacén de Granos | Daireaux, Buenos Aires\n` +
      `Tel: +54 9 2314 40-5179 | www.almacendegranos.com.ar`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // WhatsApp link
  const whatsappUrl = result
    ? `https://wa.me/5492314405179?text=${encodeURIComponent(
        `Hola equipo comercial de ADG, adjunto mi cotización de Canje #${quoteId}:\n\n` +
        `• Operación: ${formatMoney(result.valorOperacion, moneda)}\n` +
        `• Grano: ${result.grano.name}\n` +
        `• Ahorro estimado: ${formatTn(result.ahorroToneladas)} (${formatMoney(result.ahorroMonto, moneda)})\n\n` +
        `Quisiera formalizar y recibir asesoramiento para cerrar la operación.`
      )}`
    : `https://wa.me/5492314405179`;

  return (
    <div
      id="canje-export-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 my-auto flex flex-col max-h-[92vh]">
        
        {/* Top Modal Action Bar (Hidden on Print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-gold" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Exportar Cotización de Canje
              </h3>
              <p className="text-[11px] text-gray-400">
                Descargá en PDF, imprimí o compartí esta simulación comercial
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Direct Print / PDF Button */}
            <button
              onClick={handlePrint}
              id="modal-btn-print"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-gold hover:bg-brand-gold-light text-slate-900 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Abrir diálogo de impresión o Guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              id="modal-btn-close"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Preview */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          
          {/* Official Document Sheet */}
          <div
            id="printable-canje-quote"
            className="w-full max-w-2xl bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8 text-gray-800 font-sans print:shadow-none print:border-none print:p-0"
          >
            {/* Header with ADG Branding & Reference Numbers */}
            <div className="border-b-2 border-brand-green/20 pb-5 mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Logo />
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-brand-green uppercase tracking-tight">
                    ADG Almacén de Granos
                  </h1>
                  <span className="text-xs text-gray-500 block font-medium">
                    Servicios de Acopio, Acondicionamiento y Canje de Cereal
                  </span>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 mb-1">
                  Cotización #{quoteId}
                </span>
                <div className="text-gray-500 flex items-center justify-end space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{currentDateStr} • {currentTimeStr} hs</span>
                </div>
                <div className="text-gray-400 text-[10px]">
                  Dólar BNA Ref: <strong>${config.dolarBNA.venta}</strong>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-6">
              <span className="text-[10.5px] uppercase font-bold tracking-widest text-brand-gold-light bg-brand-green px-3 py-1 rounded-full inline-block mb-1.5">
                Simulación Oficial de Canje
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                Presupuesto Comparativo de Cereal
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-lg mx-auto">
                Cálculo comparativo entre el régimen especial de canje disponible sin retenciones versus venta tradicional con quitas fiscales.
              </p>
            </div>

            {/* Parameters Block */}
            {result && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs mb-6">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Valor Operación:</span>
                  <span className="font-extrabold text-sm text-gray-900">{formatMoney(result.valorOperacion, moneda)}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Grano:</span>
                  <span className="font-extrabold text-sm text-brand-green uppercase">{result.grano.name}</span>
                  <span className="text-[10px] text-gray-500 block">{formatMoney(result.precioBaseTn, moneda)} / Tn</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Estado SISA:</span>
                  <span className="font-extrabold text-xs text-gray-800">{result.sisa.name}</span>
                  <span className="text-[10px] text-emerald-700 block">{result.sisa.statusLabel}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Moneda:</span>
                  <span className="font-extrabold text-xs text-gray-800">
                    {moneda === 'ARS' ? 'Pesos Arg. (ARS)' : 'Dólares (USD)'}
                  </span>
                </div>
              </div>
            )}

            {/* Comparison Table */}
            {result ? (
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left text-xs border-collapse border border-gray-200 rounded-xl">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="p-2.5">Concepto Liquidación</th>
                      <th className="p-2.5 text-center bg-emerald-50 text-brand-green border-x border-emerald-200">
                        Canje de Granos ADG
                      </th>
                      <th className="p-2.5 text-center">Venta Tradicional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-2.5 font-medium text-gray-600">Precio Cereal Base / Tn</td>
                      <td className="p-2.5 text-center font-bold bg-emerald-50/40 text-brand-green border-x border-emerald-100">
                        {formatMoney(result.canje.precioCerealTn, moneda)}
                      </td>
                      <td className="p-2.5 text-center font-semibold text-gray-700">
                        {formatMoney(result.normal.precioCerealTn, moneda)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-gray-600">IVA Liquidación (+10.5%)</td>
                      <td className="p-2.5 text-center font-bold bg-emerald-50/40 text-emerald-700 border-x border-emerald-100">
                        + {formatMoney(result.canje.ivaLiquidacionTn, moneda)}
                      </td>
                      <td className="p-2.5 text-center font-semibold text-gray-700">
                        + {formatMoney(result.normal.ivaLiquidacionTn, moneda)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-gray-600">
                        Retención IVA SISA ({result.sisa.retencionIvaPercent}%)
                      </td>
                      <td className="p-2.5 text-center font-bold bg-emerald-50/40 text-emerald-700 border-x border-emerald-100">
                        <span className="text-emerald-700 font-extrabold">$ 0 (0% Exento)</span>
                      </td>
                      <td className="p-2.5 text-center font-semibold text-rose-600">
                        - {formatMoney(result.normal.retencionIvaTn, moneda)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-gray-600">
                        Retención Ganancias SISA ({result.sisa.retencionGananciasPercent}%)
                      </td>
                      <td className="p-2.5 text-center font-bold bg-emerald-50/40 text-emerald-700 border-x border-emerald-100">
                        <span className="text-emerald-700 font-extrabold">$ 0 (0% Exento)</span>
                      </td>
                      <td className="p-2.5 text-center font-semibold text-rose-600">
                        - {formatMoney(result.normal.retencionGananciasTn, moneda)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50/80 font-bold">
                      <td className="p-2.5 text-gray-800">Precio Cereal Final / Tn (Neto)</td>
                      <td className="p-2.5 text-center bg-emerald-100 text-brand-green border-x border-emerald-200 text-sm">
                        {formatMoney(result.canje.precioFinalTn, moneda)}
                      </td>
                      <td className="p-2.5 text-center text-gray-800 text-sm">
                        {formatMoney(result.normal.precioFinalTn, moneda)}
                      </td>
                    </tr>
                    <tr className="border-t-2 border-gray-300 bg-gray-100">
                      <td className="p-3 font-extrabold text-gray-900 text-sm">
                        TOTAL TONELADAS A ENTREGAR:
                      </td>
                      <td className="p-3 text-center bg-emerald-700 text-white font-black text-base sm:text-lg border-x border-emerald-800">
                        {formatTn(result.canje.totalToneladas)}
                      </td>
                      <td className="p-3 text-center text-gray-800 font-bold text-base">
                        {formatTn(result.normal.totalToneladas)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl">
                Completá los campos del simulador para calcular la comparativa.
              </div>
            )}

            {/* Big Highlight: Savings Summary Box */}
            {result && (
              <div className="bg-gradient-to-r from-emerald-800 to-brand-green text-white p-4 sm:p-5 rounded-xl mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-brand-gold-light block">
                    Beneficio Neto para el Productor
                  </span>
                  <div className="text-xl sm:text-2xl font-black">
                    Ahorrás {formatTn(result.ahorroToneladas)} de {result.grano.shortName}
                  </div>
                  <span className="text-xs text-emerald-100">
                    Cereal que conservás en tu campo operando por canje con ADG
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-200 block font-bold">
                    Ahorro Económico Estimado:
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-brand-gold-light">
                    {formatMoney(result.ahorroMonto, moneda)}
                  </span>
                  {moneda === 'ARS' && (
                    <span className="text-[10px] text-emerald-200 block">
                      + {formatMoney(result.ahorroImpuestoCheque, 'ARS')} ahorro Imp. al Cheque
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Commercial terms and legal note */}
            <div className="border-t border-gray-200 pt-4 text-[10px] text-gray-500 space-y-1.5">
              <p>
                <strong>Marco Normativo:</strong> Operación bajo régimen de Canje de Granos (RG AFIP 4310/2118 y concordantes). No aplica retención de IVA ni de Impuesto a las Ganancias en la liquidación primaria por entrega de cereal disponible o a fijar.
              </p>
              <p>
                <strong>Validez:</strong> Esta cotización es de carácter referencial según cotizaciones de mercado y tipo de cambio oficial del día de emisión.
              </p>
            </div>

            {/* Footer Sign-off */}
            <div className="mt-6 pt-4 border-t-2 border-brand-green/20 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
              <div>
                <strong className="text-brand-green block">ADG Almacén de Granos</strong>
                <span>Daireaux, Pcia. de Buenos Aires</span>
              </div>
              <div className="text-right">
                <span className="block font-semibold">Mesa Comercial / Cereales</span>
                <span>Tel: +54 9 2314 40-5179 • info@almacendegranos.com.ar</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar with Actions (Hidden on Print) */}
        <div className="no-print bg-white p-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              id="modal-btn-copy"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Resumen</span>
                </>
              )}
            </button>

            {/* WhatsApp Share Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="modal-btn-whatsapp"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors active:scale-95 border border-emerald-200"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Enviar por WhatsApp</span>
            </a>
          </div>

          <div className="flex items-center space-x-2">
            {/* Direct Print / PDF Button */}
            <button
              onClick={handlePrint}
              id="modal-btn-download-pdf"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-light text-white text-xs font-extrabold shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-brand-gold-light" />
              <span>Imprimir / Descargar en PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
            >
              Cerrar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
