/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modal de Exportacion y Descarga PDF de Cotizacion de Canje ADG
 * Adaptado a la estructura oficial del Excel Simulador_Canje_Agro.xlsx
 */

import React, { useState } from 'react';
import {
  Printer,
  Copy,
  Check,
  X,
  FileText,
  MessageSquare,
  Calendar,
  Truck,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { CanjeDetailedResult, CanjeConfigData } from '../data/canjeConfig';
import Logo from './Logo';
import GrainIcon from './GrainIcons';

interface CanjeQuoteExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CanjeDetailedResult | null;
  config: CanjeConfigData;
  moneda?: 'ARS' | 'USD';
  selectedGrainId?: string;
}

export default function CanjeQuoteExportModal({
  isOpen,
  onClose,
  result,
  config,
  moneda = 'ARS',
  selectedGrainId = 'soja'
}: CanjeQuoteExportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formatMoney = (val: number) => {
    return '$ ' + Math.round(val).toLocaleString('es-AR');
  };

  const formatMoneyPrecise = (val: number) => {
    return '$ ' + val.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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

  const handlePrint = () => {
    window.print();
  };

  const formatUSD = (val: number) => {
    return 'USD ' + Math.round(val).toLocaleString('es-AR');
  };

  const montoUSDCalculado = result ? Math.round(result.input.montoACanjear / config.dolarBNA.venta) : 0;
  const precioUSDCalculado = result ? Number((result.input.precioPorTonelada / config.dolarBNA.venta).toFixed(2)) : 0;

  const handleCopy = () => {
    if (!result) return;
    const montoText = moneda === 'USD'
      ? `${formatUSD(montoUSDCalculado)} (${formatMoney(result.input.montoACanjear)} ARS @ BNA $${config.dolarBNA.venta})`
      : `${formatMoney(result.input.montoACanjear)} (~ ${formatUSD(montoUSDCalculado)})`;

    const summaryText =
      `*COTIZACIÓN OFICIAL DE CANJE - ADG ALMACÉN DE GRANOS*\n` +
      `Fecha: ${currentDateStr} ${currentTimeStr} | Ref: #${quoteId}\n\n` +
      `• *Monto a Canjear:* ${montoText}\n` +
      `• *Grano:* ${result.input.granoNombre || 'Cereal'} (${formatMoney(result.input.precioPorTonelada)}/Tn${moneda === 'USD' ? ` / USD ${precioUSDCalculado}/Tn` : ''})\n` +
      `• *Plaza Referencia:* ${result.input.plazaSeleccionada === 'bahia_blanca' ? 'Bahía Blanca' : 'Rosario'}\n` +
      `• *Flete:* ${result.input.kilometrosFlete} km (${formatMoneyPrecise(result.fleteInfo.ratePerTon)}/Tn)\n` +
      `• *Score SISA:* Estado ${result.input.sisaScore}\n` +
      `• *Dólar BNA:* $ ${config.dolarBNA.venta}\n\n` +
      `*RESULTADOS COMPARATIVOS:*\n` +
      `• *Entrega por Canje ADG:* ${formatTn(result.canje.toneladasNecesarias)} (Disponible: ${formatMoneyPrecise(result.canje.montoFinalPorTonelada)}/Tn)\n` +
      `• *Venta Tradicional:* ${formatTn(result.ventaNormal.toneladasNecesarias)} (Disponible: ${formatMoneyPrecise(result.ventaNormal.montoFinalPorTonelada)}/Tn)\n\n` +
      `*BENEFICIO DIRECTO DEL PRODUCTOR:*\n` +
      `• *Ahorro de Cereal:* ${formatTn(result.ventaja.ahorroToneladas)} menos a entregar\n` +
      `• *Ventaja Económica:* ${formatMoney(result.ventaja.ahorroMonto)} (~ ${formatUSD(result.ventaja.ahorroMonto / config.dolarBNA.venta)}) (+${result.ventaja.porcentajeVentaja.toFixed(2)}%)\n` +
      `• *Retenciones Fiscales en Canje:* 0% de IVA y 0% de Ganancias\n\n` +
      `ADG Almacén de Granos S.A. | Daireaux, Buenos Aires\n` +
      `Tel: +54 9 2314 40-5179 | www.almacendegranos.com.ar`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const whatsappUrl = result
    ? `https://wa.me/5492314405179?text=${encodeURIComponent(
        `Hola equipo comercial de ADG, les comparto la cotización de Canje #${quoteId}:\n\n` +
        `• Monto Operación: ${formatMoney(result.input.montoACanjear)}\n` +
        `• Grano: ${result.input.granoNombre || 'Cereal'} a ${formatMoney(result.input.precioPorTonelada)}/Tn\n` +
        `• Flete: ${result.input.kilometrosFlete} km (${formatMoneyPrecise(result.fleteInfo.ratePerTon)}/Tn)\n` +
        `• Ahorro estimado: ${formatTn(result.ventaja.ahorroToneladas)} (${formatMoney(result.ventaja.ahorroMonto)})\n\n` +
        `Quisiera formalizar y coordinar la entrega de cereal.`
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
                Imprimí, guardá en PDF o compartí esta simulación oficial
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              id="modal-btn-print"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-brand-gold hover:bg-brand-gold-light text-slate-900 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Abrir diálogo de impresión o Guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

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
          
          <div
            id="printable-canje-quote"
            className="w-full max-w-2xl bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8 text-gray-800 font-sans print:shadow-none print:border-none print:p-0"
          >
            {/* Header with ADG Branding & Reference Numbers */}
            <div className="border-b-2 border-brand-green/20 pb-4 mb-5 flex flex-wrap items-center justify-between gap-4">
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
                <div className="text-gray-500 text-[10.5px]">
                  Dólar BNA: <strong>${config.dolarBNA.venta}</strong>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold-light bg-brand-green px-3 py-1 rounded-full inline-block mb-1">
                Simulación Oficial de Canje
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                Presupuesto Comparativo de Cereal
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-lg mx-auto">
                Cálculo comparativo bajo el régimen de canje agropecuario vs. venta tradicional de cereal con retenciones fiscales.
              </p>
            </div>

            {/* Parameters Block */}
            {result && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs mb-5">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Monto Operación:</span>
                  <span className="font-extrabold text-sm text-gray-900">
                    {moneda === 'USD'
                      ? `USD ${montoUSDCalculado.toLocaleString('es-AR')}`
                      : formatMoney(result.input.montoACanjear)}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {moneda === 'USD'
                      ? `(${formatMoney(result.input.montoACanjear)} ARS)`
                      : `(~ USD ${montoUSDCalculado.toLocaleString('es-AR')})`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Grano & Precio:</span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <div className="p-0.5 rounded-md bg-brand-green-pale text-brand-green shrink-0">
                      <GrainIcon type={selectedGrainId || result.input.granoNombre || 'soja'} className="w-4 h-4" strokeWidth={1.8} />
                    </div>
                    <span className="font-extrabold text-sm text-brand-green uppercase">{result.input.granoNombre || 'Cereal'}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 block">
                    {formatMoney(result.input.precioPorTonelada)} / Tn
                    {moneda === 'USD' ? ` (USD ${precioUSDCalculado}/Tn)` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Flete & Plaza:</span>
                  <span className="font-extrabold text-xs text-gray-800">{result.input.kilometrosFlete} km</span>
                  <span className="text-[10px] text-gray-500 block">
                    {formatMoneyPrecise(result.fleteInfo.ratePerTon)}/t ({result.input.plazaSeleccionada === 'bahia_blanca' ? 'Bahía Blanca' : 'Rosario'})
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Situación SISA:</span>
                  <span className="font-extrabold text-xs text-gray-800">
                    Estado {result.input.sisaScore}
                  </span>
                  <span className="text-[10px] text-emerald-700 block">
                    IIBB Bs. As.: {result.input.correspondeIibbBsAs ? 'Sí (0.75%)' : 'No'}
                  </span>
                </div>
              </div>
            )}

            {/* Comparison Table matching the Excel */}
            {result && (
              <div className="overflow-x-auto mb-5">
                <table className="w-full text-left text-xs border-collapse border border-gray-200 rounded-xl">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="p-2">Concepto ($ / Tn)</th>
                      <th className="p-2 text-center bg-emerald-50 text-brand-green border-x border-emerald-200">
                        Canje ADG
                      </th>
                      <th className="p-2 text-center">Venta Normal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-2 text-gray-600">Precio del grano</td>
                      <td className="p-2 text-center font-bold bg-emerald-50/40 text-brand-green border-x border-emerald-100">
                        {formatMoneyPrecise(result.canje.precioGrano)}
                      </td>
                      <td className="p-2 text-center font-medium text-gray-700">
                        {formatMoneyPrecise(result.ventaNormal.precioGrano)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-gray-600">IVA cereal (+10.5%)</td>
                      <td className="p-2 text-center font-bold bg-emerald-50/40 text-emerald-700 border-x border-emerald-100">
                        + {formatMoneyPrecise(result.canje.ivaCereal)}
                      </td>
                      <td className="p-2 text-center font-medium text-gray-700">
                        + {formatMoneyPrecise(result.ventaNormal.ivaCereal)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-gray-600">Comisión (-3.0%)</td>
                      <td className="p-2 text-center font-medium bg-emerald-50/40 text-gray-600 border-x border-emerald-100">
                        {formatMoneyPrecise(result.canje.comision)}
                      </td>
                      <td className="p-2 text-center font-medium text-gray-600">
                        {formatMoneyPrecise(result.ventaNormal.comision)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-gray-600">IVA Comisión (-10.5%)</td>
                      <td className="p-2 text-center font-medium bg-emerald-50/40 text-gray-600 border-x border-emerald-100">
                        {formatMoneyPrecise(result.canje.ivaComision)}
                      </td>
                      <td className="p-2 text-center font-medium text-gray-600">
                        {formatMoneyPrecise(result.ventaNormal.ivaComision)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-gray-600">Sellado (-1.25%)</td>
                      <td className="p-2 text-center font-medium bg-emerald-50/40 text-gray-600 border-x border-emerald-100">
                        {formatMoneyPrecise(result.canje.sellado)}
                      </td>
                      <td className="p-2 text-center font-medium text-gray-600">
                        {formatMoneyPrecise(result.ventaNormal.sellado)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-gray-600">Retención IVA</td>
                      <td className="p-2 text-center font-bold bg-emerald-50/40 text-emerald-700 border-x border-emerald-100">
                        {result.canje.retencionIva === 0 ? '$ 0,00 (0% Exento)' : formatMoneyPrecise(result.canje.retencionIva)}
                      </td>
                      <td className="p-2 text-center font-semibold text-rose-600">
                        {formatMoneyPrecise(result.ventaNormal.retencionIva)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-gray-600">Retención Ganancias</td>
                      <td className="p-2 text-center font-bold bg-emerald-50/40 text-emerald-700 border-x border-emerald-100">
                        {result.canje.retencionGanancias === 0 ? '$ 0,00 (0% Exento)' : formatMoneyPrecise(result.canje.retencionGanancias)}
                      </td>
                      <td className="p-2 text-center font-semibold text-rose-600">
                        {formatMoneyPrecise(result.ventaNormal.retencionGanancias)}
                      </td>
                    </tr>
                    {result.input.kilometrosFlete > 0 && (
                      <>
                        <tr>
                          <td className="p-2 text-gray-600">Flete ({result.input.kilometrosFlete} km)</td>
                          <td className="p-2 text-center font-medium bg-emerald-50/40 text-gray-600 border-x border-emerald-100">
                            {formatMoneyPrecise(result.canje.flete)}
                          </td>
                          <td className="p-2 text-center font-medium text-gray-600">
                            {formatMoneyPrecise(result.ventaNormal.flete)}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 text-gray-600">IVA Flete (-10.5%)</td>
                          <td className="p-2 text-center font-medium bg-emerald-50/40 text-gray-600 border-x border-emerald-100">
                            {formatMoneyPrecise(result.canje.ivaFlete)}
                          </td>
                          <td className="p-2 text-center font-medium text-gray-600">
                            {formatMoneyPrecise(result.ventaNormal.ivaFlete)}
                          </td>
                        </tr>
                      </>
                    )}
                    {result.ventaNormal.depCbuIva > 0 && (
                      <tr>
                        <td className="p-2 text-gray-600">Depósito CBU IVA (Venta Normal)</td>
                        <td className="p-2 text-center bg-emerald-50/40 text-gray-400 border-x border-emerald-100 font-normal">
                          —
                        </td>
                        <td className="p-2 text-center font-semibold text-amber-700">
                          - {formatMoneyPrecise(result.ventaNormal.depCbuIva)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-50/80 font-bold">
                      <td className="p-2 text-gray-800">Monto Final Disponible / Tn</td>
                      <td className="p-2 text-center bg-emerald-100 text-brand-green border-x border-emerald-200 text-sm">
                        {formatMoneyPrecise(result.canje.montoFinalPorTonelada)}
                      </td>
                      <td className="p-2 text-center text-gray-800 text-sm">
                        {formatMoneyPrecise(result.ventaNormal.montoFinalPorTonelada)}
                      </td>
                    </tr>
                    <tr className="border-t-2 border-gray-300 bg-gray-100">
                      <td className="p-2.5 font-extrabold text-gray-900 text-sm">
                        TOTAL TONELADAS REQUERIDAS:
                      </td>
                      <td className="p-2.5 text-center bg-emerald-700 text-white font-black text-base border-x border-emerald-800">
                        {formatTn(result.canje.toneladasNecesarias)}
                      </td>
                      <td className="p-2.5 text-center text-gray-800 font-bold text-base">
                        {formatTn(result.ventaNormal.toneladasNecesarias)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Big Highlight: Savings Summary Box */}
            {result && (
              <div className="bg-gradient-to-r from-emerald-800 to-brand-green text-white p-4 rounded-xl mb-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-brand-gold-light block">
                    Beneficio Neto para el Productor
                  </span>
                  <div className="text-xl font-black">
                    Ahorrás {formatTn(result.ventaja.ahorroToneladas)} de {result.input.granoNombre || 'Cereal'}
                  </div>
                  <span className="text-xs text-emerald-100">
                    {result.ventaja.resumenTexto}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-200 block font-bold">
                    Ventaja Económica Estimada:
                  </span>
                  <div className="text-xl font-black text-brand-gold-light">
                    {formatMoney(result.ventaja.ahorroMonto)}
                  </div>
                  <span className="text-[10.5px] text-emerald-200 font-semibold block">
                    +{result.ventaja.porcentajeVentaja.toFixed(2)}% de rendimiento
                  </span>
                </div>
              </div>
            )}

            {/* Commercial terms and legal note */}
            <div className="border-t border-gray-200 pt-3 text-[10px] text-gray-500 space-y-1">
              <p>
                <strong>Marco Normativo:</strong> Régimen de Canje de Granos (RG AFIP 4310/2118). La cancelación total mediante entrega de granos no sufre retenciones de IVA ni Ganancias en la liquidación primaria.
              </p>
              <p>
                <strong>Validez:</strong> Cotización de carácter orientativo sujeta a confirmación diaria con la Mesa de Operaciones de ADG Almacén de Granos S.A.
              </p>
            </div>

            {/* Footer Sign-off */}
            <div className="mt-5 pt-3 border-t-2 border-brand-green/20 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
              <div>
                <strong className="text-brand-green block">ADG Almacén de Granos S.A.</strong>
                <span>Daireaux, Pcia. de Buenos Aires</span>
              </div>
              <div className="text-right">
                <span className="block font-semibold">Mesa de Operaciones & Cereales</span>
                <span>Tel: +54 9 2314 40-5179 • info@almacendegranos.com.ar</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar with Actions (Hidden on Print) */}
        <div className="no-print bg-white p-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              id="modal-btn-copy"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors active:scale-95 cursor-pointer"
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
            <button
              onClick={handlePrint}
              id="modal-btn-download-pdf"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-light text-white text-xs font-extrabold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-brand-gold-light" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
