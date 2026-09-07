/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Coins,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Scale,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  Printer,
  FileDown,
  FileText
} from 'lucide-react';
import Logo from './Logo';
import GrainIcon from './GrainIcons';
import CanjeQuoteExportModal from './CanjeQuoteExportModal';
import {
  GrainItem,
  SisaScoreOption,
  CanjeConfigData,
  DEFAULT_CANJE_CONFIG,
  calculateCanje,
  loadStoredCanjeConfig
} from '../data/canjeConfig';
import { HERO_CONTENT } from '../data/content';

interface CanjeSimulatorProps {
  onBackToLanding?: () => void;
}

export default function CanjeSimulator({ onBackToLanding }: CanjeSimulatorProps) {
  // State for config
  const [config, setConfig] = useState<CanjeConfigData>(() => loadStoredCanjeConfig());

  // Input states - start empty per user request
  const [moneda, setMoneda] = useState<'ARS' | 'USD' | ''>('');
  const [valorOperacion, setValorOperacion] = useState<number | ''>('');
  const [selectedGrainId, setSelectedGrainId] = useState<string>('');
  const [selectedSisaId, setSelectedSisaId] = useState<1 | 2 | 3 | ''>('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Selected grain and SISA objects
  const selectedGrain = useMemo(() => {
    if (!selectedGrainId) return null;
    return config.grains.find(g => g.id === selectedGrainId) || null;
  }, [config.grains, selectedGrainId]);

  const selectedSisa = useMemo(() => {
    if (!selectedSisaId) return null;
    return config.sisaOptions.find(s => s.id === selectedSisaId) || null;
  }, [config.sisaOptions, selectedSisaId]);

  // Mandatory fields check: All fields are required
  const isFormComplete = Boolean(
    moneda &&
    valorOperacion !== '' &&
    typeof valorOperacion === 'number' &&
    valorOperacion > 0 &&
    selectedGrain &&
    selectedSisa
  );

  // Top 4 Major Grains for quick visual prominence in header
  const topGrains = useMemo(() => {
    const ids = ['soja', 'maiz', 'trigo', 'girasol'];
    return ids
      .map(id => config.grains.find(g => g.id === id))
      .filter((g): g is GrainItem => Boolean(g));
  }, [config.grains]);

  // Main calculation result
  const result = useMemo(() => {
    if (!isFormComplete || !selectedGrain || !selectedSisa || !moneda || valorOperacion === '') {
      return null;
    }
    return calculateCanje({
      valorOperacion: Number(valorOperacion),
      moneda,
      grano: selectedGrain,
      sisa: selectedSisa,
      config
    });
  }, [isFormComplete, valorOperacion, moneda, selectedGrain, selectedSisa, config]);

  // Formatter helpers
  const currentCurrency = moneda || 'ARS';
  const formatMoney = (val: number, curr: 'ARS' | 'USD' = currentCurrency) => {
    const prefix = curr === 'ARS' ? '$ ' : 'U$S ';
    return prefix + Math.round(val).toLocaleString('es-AR');
  };

  const formatTn = (val: number) => {
    return val.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Tn';
  };

  // WhatsApp message generation
  const whatsappSimulatorUrl = useMemo(() => {
    if (!result) {
      const genericText = encodeURIComponent(
        `*Consulta Canje de Granos - ADG Almacén de Granos*\n\n` +
        `Hola equipo comercial de ADG, quisiera cotizar y recibir asesoramiento para operar por canje de cereal disponible.`
      );
      return `https://wa.me/5492314405179?text=${genericText}`;
    }
    const text = encodeURIComponent(
      `*Consulta Simulación de Canje - ADG Almacén de Granos*\n\n` +
      `• *Operación:* ${formatMoney(result.valorOperacion, moneda as 'ARS' | 'USD')}\n` +
      `• *Grano:* ${result.grano.name}\n` +
      `• *Score SISA:* ${result.sisa.name} (${result.sisa.statusLabel})\n` +
      `• *Tn por Canje:* ${formatTn(result.canje.totalToneladas)}\n` +
      `• *Tn Venta Normal:* ${formatTn(result.normal.totalToneladas)}\n` +
      `• *Ahorro Estimado:* ${formatTn(result.ahorroToneladas)} (${formatMoney(result.ahorroMonto, moneda as 'ARS' | 'USD')})\n\n` +
      `Hola equipo ADG, quisiera cotizar y asesorarme para cerrar esta operación por canje.`
    );
    return `https://wa.me/5492314405179?text=${text}`;
  }, [result, moneda]);

  return (
    <div id="canje-simulator-page" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans w-full overflow-x-clip">
      
      {/* Top Bar with ADG Branding, Dólar BNA & Grain Ticker - STICKY FIXED MENU AS REQUESTED */}
      <header id="simulator-header" className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm transition-shadow duration-200">
        
        {/* Main Brand & Dólar BNA Header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2">
          
          {/* Logo ADG + Back to Landing */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              id="back-to-landing-btn"
              onClick={onBackToLanding || (() => window.location.href = '/')}
              className="group flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-brand-green/20 bg-white text-gray-700 hover:text-brand-green hover:border-brand-green hover:bg-brand-green-pale/50 transition-all text-xs sm:text-sm font-semibold active:scale-95 shrink-0 shadow-2xs"
              title="Volver a la página principal de ADG"
            >
              <ArrowLeft className="w-4 h-4 text-brand-green animate-arrow-back group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Volver a ADG</span>
              <span className="sm:hidden">Volver</span>
            </button>

            <a 
              href="/" 
              onClick={(e) => {
                if (onBackToLanding) {
                  e.preventDefault();
                  onBackToLanding();
                }
              }}
              className="flex items-center group shrink-0"
            >
              <Logo lightBg={true} height={38} />
            </a>
          </div>

          {/* Cotización Dólar BNA positioned in top right (Responsive & compact for mobile) */}
          <div id="header-dolar-bna" className="flex items-center space-x-1.5 sm:space-x-3 bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-gray-200 shadow-2xs text-[11px] sm:text-xs shrink-0">
            <div className="text-left">
              <div className="text-[9.5px] sm:text-[11px] font-extrabold text-cyan-800 uppercase tracking-tight leading-tight">
                COTIZACIÓN DÓLAR BNA
              </div>
              <div className="text-[8.5px] sm:text-[10px] text-gray-500 font-medium">
                ({config.dolarBNA.fecha})
              </div>
            </div>
            <div className="h-4 sm:h-6 w-px bg-gray-200" />
            <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs">
              <div className="text-gray-700">
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 mr-1">COMPRA:</span>
                <span className="font-extrabold text-gray-800">${config.dolarBNA.compra}</span>
              </div>
              <div className="text-gray-700">
                <span className="text-[9px] sm:text-[10px] font-bold text-cyan-700 mr-1">VENTA:</span>
                <span className="font-extrabold text-blue-700">${config.dolarBNA.venta}</span>
              </div>
            </div>
          </div>

          {/* Quick Export Button in Header */}
          <button
            id="header-btn-export-quote"
            onClick={() => setIsExportModalOpen(true)}
            disabled={!result}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 border ${
              result
                ? 'bg-brand-green hover:bg-brand-green-light text-white border-brand-green cursor-pointer'
                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            }`}
            title={result ? "Exportar cotización a PDF o imprimir" : "Completá los campos del simulador para exportar"}
          >
            <Printer className="w-3.5 h-3.5 text-brand-gold-light" />
            <span className="hidden sm:inline">Exportar Cotización</span>
            <span className="sm:hidden">Exportar</span>
          </button>

        </div>

        {/* Top 4 Major Grains: Fixed margin grid on desktop so cards do not move or shift */}
        <div id="simulator-ticker" className="bg-slate-100/90 border-t border-gray-200 py-2.5 sm:py-3">
          <div className="max-w-5xl mx-auto px-3.5 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
              {topGrains.map((grain) => {
                const isSelected = grain.id === selectedGrainId;
                return (
                  <button
                    key={grain.id}
                    onClick={() => setSelectedGrainId(grain.id)}
                    className={`flex items-center space-x-2.5 sm:space-x-3 p-2.5 sm:px-4 sm:py-3 rounded-xl border-2 transition-colors text-left w-full cursor-pointer ${
                      isSelected
                        ? 'bg-brand-green text-white border-brand-green shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-green/40 hover:bg-gray-50 shadow-2xs'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-white/20 text-brand-gold-light' : 'bg-brand-green-pale text-brand-green'}`}>
                      <GrainIcon
                        type={grain.name}
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        strokeWidth={1.3}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold uppercase tracking-tight text-xs sm:text-sm truncate">
                        {grain.name}
                      </div>
                      <div className={`text-xs sm:text-sm font-extrabold truncate ${isSelected ? 'text-brand-gold-light' : 'text-brand-green'}`}>
                        {moneda === 'ARS' ? `$ ${Math.round(grain.priceARS).toLocaleString('es-AR')}` : `U$S ${grain.priceUSD.toFixed(1)}`}
                        <span className="text-[10px] font-normal ml-1 opacity-70">TT</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Title Header */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-extrabold text-brand-green">
            Simulador de Canje de Granos
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1 max-w-3xl">
            Calculá de forma transparente el beneficio financiero y fiscal de cancelar tus compras e insumos entregando granos en lugar de operar por venta tradicional.
          </p>
        </div>

        {/* 3-Column Layout: Parameters, Canje ADG, Liquidación Normal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          
          {/* ======================================================== */}
          {/* COLUMN 1: PARÁMETROS */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-[#1b6b3e] to-[#0c381f] text-white p-5 sm:p-7 shadow-lg flex flex-col justify-between border border-emerald-800/40">
            <div>
              
              {/* Header */}
              <div className="border-b border-white/20 pb-4 mb-5">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-between">
                  <span>Parámetros</span>
                  <Coins className="w-6 h-6 text-brand-gold" />
                </h2>
                <p className="text-emerald-100/90 text-xs mt-1">Detalle de la Operación</p>
              </div>

              {/* Form Controls */}
              <div className="space-y-4">
                
                {/* 1. Moneda */}
                <div>
                  <label htmlFor="param-moneda" className="block text-xs font-bold uppercase tracking-wider text-emerald-100 mb-1.5 flex items-center justify-between">
                    <span>Moneda <span className="text-brand-gold-light">*</span></span>
                    {!moneda && <span className="text-[10px] text-amber-200/90 font-normal normal-case">Obligatorio</span>}
                  </label>
                  <select
                    id="param-moneda"
                    value={moneda}
                    onChange={(e) => {
                      const newMoneda = e.target.value as 'ARS' | 'USD';
                      setMoneda(newMoneda);
                    }}
                    className={`w-full bg-white rounded-xl px-3.5 py-2.5 text-sm border-2 border-transparent focus:border-brand-gold focus:outline-none shadow-xs cursor-pointer ${
                      !moneda ? 'text-gray-400 font-normal' : 'text-gray-900 font-bold'
                    }`}
                    required
                  >
                    <option value="" disabled className="text-gray-400 font-normal">
                      selecciona la moneda
                    </option>
                    <option value="ARS" className="text-gray-900 font-bold">$ Pesos Argentinos (ARS)</option>
                    <option value="USD" className="text-gray-900 font-bold">U$S Dólares Estadounidenses (USD)</option>
                  </select>
                </div>

                {/* 2. Valor Operación (Solo campo con placeholder en gris, sin botones de valores) */}
                <div>
                  <label htmlFor="param-valor" className="block text-xs font-bold uppercase tracking-wider text-emerald-100 mb-1.5 flex items-center justify-between">
                    <span>Valor de la Operación <span className="text-brand-gold-light">*</span></span>
                    {(valorOperacion === '' || valorOperacion <= 0) && <span className="text-[10px] text-amber-200/90 font-normal normal-case">Obligatorio</span>}
                  </label>
                  
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold text-base pointer-events-none">
                      {moneda === 'USD' ? 'U$S' : '$'}
                    </span>
                    <input
                      id="param-valor"
                      type="number"
                      min={1}
                      value={valorOperacion === '' ? '' : valorOperacion}
                      onChange={(e) => {
                        const val = e.target.value;
                        setValorOperacion(val === '' ? '' : Math.max(0, Number(val)));
                      }}
                      placeholder="coloca el valor de la operacion"
                      className="w-full pl-10 pr-3.5 py-3 bg-white text-gray-900 rounded-xl text-base font-extrabold border-2 border-transparent focus:border-brand-gold focus:outline-none shadow-xs placeholder:text-gray-400 placeholder:font-normal"
                      required
                    />
                  </div>
                </div>

                {/* 3. Tipo de Grano: Desplegable con todos los granos */}
                <div>
                  <label htmlFor="param-grano" className="block text-xs font-bold uppercase tracking-wider text-emerald-100 mb-1.5 flex items-center justify-between">
                    <span>Tipo de Grano <span className="text-brand-gold-light">*</span></span>
                    {!selectedGrainId && <span className="text-[10px] text-amber-200/90 font-normal normal-case">Obligatorio</span>}
                  </label>
                  
                  <div className="relative">
                    <select
                      id="param-grano"
                      value={selectedGrainId}
                      onChange={(e) => setSelectedGrainId(e.target.value)}
                      className={`w-full bg-white rounded-xl px-4 py-3 text-sm sm:text-base border-2 border-transparent focus:border-brand-gold focus:outline-none shadow-xs appearance-none pr-10 cursor-pointer ${
                        !selectedGrainId ? 'text-gray-400 font-normal normal-case' : 'text-gray-900 font-extrabold uppercase'
                      }`}
                      required
                    >
                      <option value="" disabled className="text-gray-400 font-normal normal-case">
                        seleccione el tipo de grano
                      </option>
                      {config.grains.map((grain) => (
                        <option key={grain.id} value={grain.id} className="py-2 font-bold text-gray-800 uppercase">
                          {grain.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-600">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Visual indication card of the selected grain (only if selected) */}
                  {selectedGrain && (
                    <div className="mt-2.5 flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/10 text-xs text-white border border-white/15">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1 rounded-lg bg-white/20 text-brand-gold-light shrink-0">
                          <GrainIcon type={selectedGrain.name} className="w-5 h-5" strokeWidth={1.3} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold uppercase tracking-wide block truncate">{selectedGrain.name}</span>
                          <span className="text-[10px] text-emerald-200 capitalize">{selectedGrain.category}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="font-extrabold text-brand-gold-light text-sm block">
                          {moneda === 'USD' ? `U$S ${selectedGrain.priceUSD.toFixed(1)}` : `$ ${Math.round(selectedGrain.priceARS).toLocaleString('es-AR')}`}
                        </span>
                        <span className="text-[10px] text-emerald-200">por Tonelada</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Score SISA */}
                <div>
                  <label htmlFor="param-sisa" className="block text-xs font-bold uppercase tracking-wider text-emerald-100 mb-1.5 flex items-center justify-between">
                    <span>Score SISA <span className="text-brand-gold-light">*</span></span>
                    {!selectedSisaId && <span className="text-[10px] text-amber-200/90 font-normal normal-case">Obligatorio</span>}
                  </label>
                  <select
                    id="param-sisa"
                    value={selectedSisaId}
                    onChange={(e) => setSelectedSisaId(Number(e.target.value) as 1 | 2 | 3)}
                    className={`w-full bg-white rounded-xl px-3.5 py-2.5 text-sm border-2 border-transparent focus:border-brand-gold focus:outline-none shadow-xs cursor-pointer ${
                      !selectedSisaId ? 'text-gray-400 font-normal' : 'text-gray-900 font-bold'
                    }`}
                    required
                  >
                    <option value="" disabled className="text-gray-400 font-normal">
                      seleccione la situacion
                    </option>
                    {config.sisaOptions.map((sisa) => (
                      <option key={sisa.id} value={sisa.id} className="text-gray-900 font-bold">
                        {sisa.name} - {sisa.statusLabel}
                      </option>
                    ))}
                  </select>
                  {selectedSisa && (
                    <p className="text-[11px] text-emerald-200/90 mt-1">
                      {selectedSisa.description}
                    </p>
                  )}
                </div>

                {/* Mandatory fields footnote */}
                <div className="pt-2 text-[11px] text-emerald-100/90 flex items-center space-x-1.5">
                  <span className="text-brand-gold font-bold">*</span>
                  <span>Todos los campos son obligatorios</span>
                </div>

              </div>
            </div>

            {/* Footer Link to SISA AFIP */}
            <div className="pt-5 mt-5 border-t border-white/15">
              <a
                id="link-consultar-sisa"
                href="https://www.afip.gob.ar/sisa/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-gold-light hover:text-white underline underline-offset-4 transition-colors"
              >
                <span>Consultar Score de SISA en ARCA / AFIP</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>


          {/* ======================================================== */}
          {/* COLUMN 2: LIQUIDACIÓN CANJE ADG */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 rounded-2xl bg-white p-5 sm:p-7 shadow-md border-2 border-brand-green/30 flex flex-col justify-between relative overflow-hidden">
            
            {/* Top Accent Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-green to-emerald-500" />

            <div>
              {/* Card Header */}
              <div className="border-b border-gray-100 pb-4 mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-brand-green">
                    Liquidación Canje adg
                  </h2>
                  <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mt-0.5">
                    Operación con ADG
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-brand-green-pale text-brand-green shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              {/* Data Rows */}
              <div className="space-y-3.5 text-sm">
                
                {/* Precio Cereal / Tn */}
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">Precio Cereal/Tn:</span>
                  <div className="bg-gray-50 px-3.5 py-2 rounded-lg font-bold text-gray-800 border border-gray-100 mt-1">
                    {result ? formatMoney(result.canje.precioCerealTn) : selectedGrain ? formatMoney(moneda === 'USD' ? selectedGrain.priceUSD : selectedGrain.priceARS) : '—'}
                  </div>
                </div>

                {/* IVA Liquidación Canje (10.5%) */}
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">IVA Liquidación Canje (10.5%):</span>
                  <div className="bg-emerald-50/60 px-3.5 py-2 rounded-lg font-bold text-emerald-700 border border-emerald-100 mt-1 flex items-center justify-between">
                    <span>
                      {result 
                        ? `+ ${formatMoney(result.canje.ivaLiquidacionTn)}`
                        : selectedGrain 
                          ? `+ ${formatMoney((moneda === 'USD' ? selectedGrain.priceUSD : selectedGrain.priceARS) * 0.105)}`
                          : '—'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold uppercase">Computable</span>
                  </div>
                </div>

                {/* Retenciones de IVA */}
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">Retenciones de IVA:</span>
                  <div className="bg-emerald-50/80 px-3.5 py-2 rounded-lg font-extrabold text-emerald-700 border border-emerald-200 mt-1 flex items-center justify-between">
                    <span>$ 0 (0%)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider font-bold">
                      Exento en Canje
                    </span>
                  </div>
                </div>

                {/* Retenciones de Ganancias */}
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">Retenciones de Ganancias:</span>
                  <div className="bg-emerald-50/80 px-3.5 py-2 rounded-lg font-extrabold text-emerald-700 border border-emerald-200 mt-1 flex items-center justify-between">
                    <span>$ 0 (0%)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider font-bold">
                      Exento en Canje
                    </span>
                  </div>
                </div>

                {/* Precio Cereal Final / Tn */}
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">Precio Cereal Final/Tn:</span>
                  <div className="bg-gray-100 px-3.5 py-2 rounded-lg font-extrabold text-brand-green border border-gray-200 mt-1">
                    {result 
                      ? formatMoney(result.canje.precioFinalTn) 
                      : selectedGrain 
                        ? formatMoney((moneda === 'USD' ? selectedGrain.priceUSD : selectedGrain.priceARS) * 1.105) 
                        : '—'}
                  </div>
                </div>

              </div>
            </div>

            {/* Total Toneladas a Entregar Box */}
            <div className="mt-6 pt-5 border-t border-gray-200">
              <div className="bg-brand-green-pale/90 border border-brand-green/30 rounded-xl p-4 text-center">
                <span className="text-xs uppercase font-extrabold tracking-wider text-brand-green block mb-1">
                  Total Toneladas a Entregar:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-brand-green block">
                  {result ? formatTn(result.canje.totalToneladas) : '-- Tn'}
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold mt-0.5 block">
                  {result ? 'Valor 100% computable sin quitas fiscales' : 'Completá todos los campos para calcular'}
                </span>
              </div>
            </div>

          </div>


          {/* ======================================================== */}
          {/* COLUMN 3: LIQUIDACIÓN NORMAL */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 rounded-2xl bg-white p-5 sm:p-7 shadow-md border border-gray-200 flex flex-col justify-between relative overflow-hidden">
            
            {/* Top Gray Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gray-300" />

            <div>
              {/* Card Header */}
              <div className="border-b border-gray-100 pb-4 mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-700">
                    Liquidación Normal
                  </h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                    Venta tradicional de cereal
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-gray-100 text-gray-500 shrink-0">
                  <Scale className="w-5 h-5 text-gray-600" />
                </div>
              </div>

              {/* Data Rows */}
              <div className="space-y-3.5 text-sm">
                
                {/* Precio Cereal / Tn */}
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">Precio Cereal/Tn:</span>
                  <div className="bg-gray-50 px-3.5 py-2 rounded-lg font-bold text-gray-700 border border-gray-100 mt-1">
                    {result ? formatMoney(result.normal.precioCerealTn) : selectedGrain ? formatMoney(moneda === 'USD' ? selectedGrain.priceUSD : selectedGrain.priceARS) : '—'}
                  </div>
                </div>

                {/* IVA Venta (10.5%) */}
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">IVA Venta (10.5%):</span>
                  <div className="bg-gray-50 px-3.5 py-2 rounded-lg font-bold text-gray-700 border border-gray-100 mt-1">
                    {result 
                      ? `+ ${formatMoney(result.normal.ivaLiquidacionTn)}`
                      : selectedGrain 
                        ? `+ ${formatMoney((moneda === 'USD' ? selectedGrain.priceUSD : selectedGrain.priceARS) * 0.105)}`
                        : '—'}
                  </div>
                </div>

                {/* Retenciones de IVA */}
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">
                    Retenciones de IVA {selectedSisa ? `(${selectedSisa.retencionIvaPercent}% SISA)` : ''}:
                  </span>
                  <div className="bg-rose-50 px-3.5 py-2 rounded-lg font-bold text-rose-700 border border-rose-200 mt-1 flex items-center justify-between">
                    <span>{result ? `- ${formatMoney(result.normal.retencionIvaTn)}` : selectedSisa ? `Retención ${selectedSisa.retencionIvaPercent}%` : '—'}</span>
                    <span className="text-[10px] font-bold uppercase text-rose-600">Retenido AFIP</span>
                  </div>
                </div>

                {/* Retenciones de Ganancias */}
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">
                    Retenciones de Ganancias {selectedSisa ? `(${selectedSisa.retencionGananciasPercent}% SISA)` : ''}:
                  </span>
                  <div className="bg-rose-50 px-3.5 py-2 rounded-lg font-bold text-rose-700 border border-rose-200 mt-1 flex items-center justify-between">
                    <span>{result ? `- ${formatMoney(result.normal.retencionGananciasTn)}` : selectedSisa ? `Retención ${selectedSisa.retencionGananciasPercent}%` : '—'}</span>
                    <span className="text-[10px] font-bold uppercase text-rose-600">Retenido AFIP</span>
                  </div>
                </div>

                {/* Precio Cereal Final / Tn */}
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">Precio Cereal Final /Tn (Neto):</span>
                  <div className="bg-gray-100 px-3.5 py-2 rounded-lg font-extrabold text-gray-700 border border-gray-200 mt-1">
                    {result ? formatMoney(result.normal.precioFinalTn) : '—'}
                  </div>
                </div>

              </div>
            </div>

            {/* Total Toneladas a Entregar Box */}
            <div className="mt-6 pt-5 border-t border-gray-200">
              <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 text-center">
                <span className="text-xs uppercase font-extrabold tracking-wider text-gray-600 block mb-1">
                  Total Toneladas a Entregar:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-gray-800 block">
                  {result ? formatTn(result.normal.totalToneladas) : '-- Tn'}
                </span>
                <span className="text-[11px] text-rose-600 font-semibold mt-0.5 block">
                  {result ? `+ ${formatTn(result.ahorroToneladas)} más de cereal requeridas` : 'Completá todos los campos para calcular'}
                </span>
              </div>
            </div>

          </div>

        </div>


        {/* ======================================================== */}
        {/* HERO AHORRO SECTION: Visual Summary of Savings */}
        {/* ======================================================== */}
        <div 
          id="ahorro-summary-card" 
          className="mt-6 sm:mt-8 rounded-2xl bg-gradient-to-r from-emerald-800 via-brand-green to-emerald-900 text-white p-5 sm:p-8 shadow-xl border border-emerald-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Big Savings Headline */}
            <div className="md:col-span-7">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold-light text-xs font-bold uppercase tracking-wider mb-2">
                <span>Beneficio Neto para el Productor</span>
              </div>

              {result ? (
                <>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Ahorrás <span className="text-brand-gold-light underline decoration-brand-gold">{formatTn(result.ahorroToneladas)}</span> de {result.grano.shortName}
                  </h3>
                  
                  <p className="text-emerald-100 text-xs sm:text-sm mt-2 max-w-xl">
                    Operando por canje con <strong className="text-white">ADG Almacén de Granos</strong> conservás más cereal en tu silo o campo, sin sufrir retenciones de IVA ni de Ganancias y ahorrando comisiones de movimiento bancario.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Completá los parámetros para ver tu beneficio
                  </h3>
                  <p className="text-emerald-100 text-xs sm:text-sm mt-2 max-w-xl">
                    Seleccioná la moneda, colocá el valor de la operación, el tipo de grano y la situación SISA en el panel izquierdo para calcular al instante tu ahorro neto en cereal y pesos.
                  </p>
                </>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-100 text-xs font-bold border border-white/10 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>0% Retenciones Fiscales</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-100 text-xs font-bold border border-white/10 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Sin Impuesto al Cheque (1.2%)</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-100 text-xs font-bold border border-white/10 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Pago calzado a Cosecha</span>
                </span>
              </div>
            </div>

            {/* Right: Numerical Highlights & CTA */}
            <div className="md:col-span-5 bg-white/10 backdrop-blur-xs rounded-xl p-5 border border-white/15 text-center sm:text-left">
              
              <div className="mb-3">
                <span className="text-xs uppercase font-bold text-emerald-200 block">
                  Ahorro Económico Estimado:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-brand-gold-light">
                  {result ? formatMoney(result.ahorroMonto, moneda as 'ARS' | 'USD') : '--'}
                </span>
                {result && moneda === 'ARS' && (
                  <span className="text-xs text-emerald-200 block mt-0.5">
                    + {formatMoney(result.ahorroImpuestoCheque, 'ARS')} adicionales de impuesto al cheque
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-white/15 space-y-2">
                {/* Exportar Cotización Button */}
                <button
                  id="btn-export-quote-pdf"
                  onClick={() => setIsExportModalOpen(true)}
                  disabled={!result}
                  className={`w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-extrabold text-sm shadow-md transition-all active:scale-95 ${
                    result
                      ? 'bg-white hover:bg-emerald-50 text-brand-green border-2 border-brand-gold cursor-pointer hover:shadow-lg'
                      : 'bg-white/20 text-white/50 border border-white/10 cursor-not-allowed'
                  }`}
                  title={result ? "Exportar cotización a PDF o imprimir" : "Completá los campos para exportar la cotización"}
                >
                  <Printer className="w-4 h-4 text-brand-green" />
                  <span>Exportar Cotización (PDF / Imprimir)</span>
                </button>

                <a
                  id="cta-whatsapp-quote-bottom"
                  href={whatsappSimulatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-brand-gold hover:bg-brand-gold-light text-slate-900 font-extrabold text-sm shadow-md transition-transform active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{result ? 'Consultar esta Operación en WhatsApp' : 'Consultar Canje en WhatsApp'}</span>
                </a>
                <p className="text-[11px] text-center text-emerald-200/80 mt-1.5">
                  Atención directa con nuestro equipo comercial en Daireaux y la región
                </p>
              </div>

            </div>

          </div>
        </div>


        {/* ======================================================== */}
        {/* LEGAL NOTES & REGULATORY FRAMEWORK */}
        {/* ======================================================== */}
        <div className="mt-6 sm:mt-8 bg-white rounded-xl p-5 sm:p-6 border border-gray-200 text-xs text-gray-500 space-y-3">
          <h4 className="font-bold text-gray-800 text-sm flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-brand-green shrink-0" />
            <span>Marco Normativo y Consideraciones del Canje</span>
          </h4>
          
          <p>
            • <strong>Régimen Fiscal (RG AFIP 4310/2118):</strong> En las operaciones de canje de granos por bienes, insumos o servicios, cuando el valor de la operación es cancelado íntegramente mediante la entrega de cereal disponible o a fijar, las partes no sufren retenciones de Impuesto al Valor Agregado (IVA) ni retenciones de Impuesto a las Ganancias en la liquidación primaria de granos.
          </p>
          <p>
            • <strong>Sistema SISA (ARCA / AFIP):</strong> El Sistema de Información Simplificado Agrícola califica a los operadores en Situaciones 1, 2 o 3. En una liquidación tradicional de granos, las alícuotas de retención varían según dicho score (5% a 10.5% en IVA y 0% a 15% en Ganancias), reduciendo sustancialmente el efectivo disponible inmediato del productor.
          </p>
          <p>
            • <strong>Impuesto a los Débitos y Créditos Bancarios:</strong> Al instrumentarse como un intercambio directo de bienes sin mediar transferencias bancarias de fondos por el cobro del cereal y el posterior pago de la factura, se evita la alícuota general del 1.2% bancario.
          </p>
          <p className="text-[11px] text-gray-400 italic">
            * Valores y cotizaciones estimativas sujetas a confirmación diaria con la Mesa de Operaciones de ADG Almacén de Granos S.A.
          </p>
        </div>

      </main>

      {/* Simulator Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center space-x-2">
            <Logo lightBg={true} height={28} />
            <span>© {new Date().getFullYear()} ADG Almacén de Granos S.A. Todos los derechos reservados.</span>
          </div>
          <div>
            <span>Daireaux, Buenos Aires, Argentina</span>
          </div>
        </div>
      </footer>

      {/* Export Quotation Modal Dialog */}
      <CanjeQuoteExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        result={result}
        config={config}
        moneda={(moneda as 'ARS' | 'USD') || 'ARS'}
      />

    </div>
  );
}
