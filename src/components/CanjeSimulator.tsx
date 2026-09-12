/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Simulador de Canje de Granos - ADG Almacén de Granos
 * Implementación 100% fiel al Excel Oficial Simulador_Canje_Agro.xlsx
 * con conexión a Dólar BNA en vivo y Pizarras de Granos (Rosario / Bahía Blanca).
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Coins,
  DollarSign,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Scale,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Printer,
  Truck,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Building2,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import Logo from './Logo';
import GrainIcon from './GrainIcons';
import CanjeQuoteExportModal from './CanjeQuoteExportModal';
import {
  GrainItem,
  SisaScoreOption,
  CanjeConfigData,
  DEFAULT_CANJE_CONFIG,
  PlazaMercado,
  calculateCanjeExactExcel,
  fetchLiveDolarBNA,
  fetchLivePizarras,
  loadStoredCanjeConfig,
  saveStoredCanjeConfig
} from '../data/canjeConfig';
import { getFreightRate } from '../data/freightRates';

interface CanjeSimulatorProps {
  onBackToLanding?: () => void;
}

export default function CanjeSimulator({ onBackToLanding }: CanjeSimulatorProps) {
  // Configuración con datos de mercado y persistencia local
  const [config, setConfig] = useState<CanjeConfigData>(() => loadStoredCanjeConfig());

  // Plaza de mercado activa: Rosario o Bahía Blanca
  const [plaza, setPlaza] = useState<PlazaMercado>('rosario');

  // Estado de carga para el Dólar BNA en vivo
  const [isUpdatingDolar, setIsUpdatingDolar] = useState(false);
  const [dolarLiveStatus, setDolarLiveStatus] = useState<'live' | 'cached'>('cached');

  // Estado de carga para Pizarras Oficiales en vivo
  const [isUpdatingPizarras, setIsUpdatingPizarras] = useState(false);
  const [pizarrasLiveStatus, setPizarrasLiveStatus] = useState<'live' | 'cached'>('cached');
  const [fechaPizarraActiva, setFechaPizarraActiva] = useState<string>('10/09/2026');

  // Moneda activa: 'ARS' (Pesos) o 'USD' (Dólares BNA)
  const [moneda, setMoneda] = useState<'ARS' | 'USD'>('ARS');

  // Parámetros principales del Simulador (emulando la hoja Simulador del Excel)
  const [montoACanjear, setMontoACanjear] = useState<number | ''>('');
  const [selectedGrainId, setSelectedGrainId] = useState<string>('soja');
  const [precioPorTonelada, setPrecioPorTonelada] = useState<number | ''>(555000);
  const [isPriceCustom, setIsPriceCustom] = useState(false);
  const [kilometrosFlete, setKilometrosFlete] = useState<number | ''>(300);
  const [selectedSisaId, setSelectedSisaId] = useState<1 | 2 | 3>(2);
  const [correspondeIibbBsAs, setCorrespondeIibbBsAs] = useState<boolean>(false);

  // Parámetros manuales para SISA 3 (si aplica)
  const [retIvaManualSisa3, setRetIvaManualSisa3] = useState<number | ''>(8);
  const [retGanManualSisa3, setRetGanManualSisa3] = useState<number | ''>(15);

  // Estado de UI para desplegables y modales
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Referencias para evitar stale closures en el intervalo de actualización periódica
  const selectedGrainIdRef = useRef(selectedGrainId);
  selectedGrainIdRef.current = selectedGrainId;
  const isPriceCustomRef = useRef(isPriceCustom);
  isPriceCustomRef.current = isPriceCustom;
  const plazaRef = useRef(plaza);
  plazaRef.current = plaza;
  const monedaRef = useRef(moneda);
  monedaRef.current = moneda;

  // Conexión automática al Dólar BNA y Pizarras Oficiales (con auto-refresco periódico)
  useEffect(() => {
    let isMounted = true;

    const syncLiveData = async () => {
      setIsUpdatingDolar(true);
      setIsUpdatingPizarras(true);

      // 1. Sincronización de Dólar BNA
      try {
        const liveBna = await fetchLiveDolarBNA();
        if (isMounted && liveBna) {
          setConfig((prev) => {
            const updated = { ...prev, dolarBNA: liveBna };
            saveStoredCanjeConfig(updated);
            return updated;
          });
          setDolarLiveStatus('live');
        }
      } catch (err) {
        console.warn("No se pudo obtener el Dólar BNA en vivo:", err);
      } finally {
        if (isMounted) setIsUpdatingDolar(false);
      }

      // 2. Sincronización de Pizarras Oficiales (Cámara Arbitral)
      try {
        const liveData = await fetchLivePizarras();
        if (isMounted && liveData && liveData.grains) {
          setConfig((prev) => {
            const updatedGrains = prev.grains.map((grain) => {
              const live = liveData.grains[grain.id];
              if (live) {
                const rARS = live.rosarioARS || grain.prices.rosarioARS;
                const bARS = live.bahiaARS || grain.prices.bahiaARS;
                return {
                  ...grain,
                  prices: {
                    rosarioARS: rARS,
                    bahiaARS: bARS,
                    precioUSD: Number((rARS / (prev.dolarBNA.venta || 1508)).toFixed(2))
                  }
                };
              }
              return grain;
            });
            const updated = {
              ...prev,
              grains: updatedGrains,
              ultimaActualizacionPizarras: `${liveData.fechaPizarra} (Cámara Arbitral)`
            };
            saveStoredCanjeConfig(updated);
            return updated;
          });

          setPizarrasLiveStatus('live');
          if (liveData.fechaPizarra) {
            setFechaPizarraActiva(liveData.fechaPizarra);
          }

          // Si el usuario aún no cambió a mano el precio, sincronizar con el precio oficial
          setPrecioPorTonelada((prevPrice) => {
            if (isPriceCustomRef.current) return prevPrice;
            const liveGrain = liveData.grains[selectedGrainIdRef.current];
            if (liveGrain) {
              const p = plazaRef.current === 'bahia_blanca' ? liveGrain.bahiaARS : liveGrain.rosarioARS;
              return monedaRef.current === 'USD' ? Number((p / (config.dolarBNA?.venta || 1508)).toFixed(2)) : p;
            }
            return prevPrice;
          });
        }
      } catch (err) {
        console.warn("No se pudo obtener las cotizaciones de pizarras en vivo:", err);
      } finally {
        if (isMounted) setIsUpdatingPizarras(false);
      }
    };

    // Consulta inicial inmediata
    syncLiveData();

    // Auto-actualización periódica en segundo plano cada 5 minutos
    const intervalId = setInterval(syncLiveData, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Grano seleccionado
  const selectedGrain = useMemo(() => {
    return config.grains.find((g) => g.id === selectedGrainId) || config.grains[0];
  }, [config.grains, selectedGrainId]);

  // Conversión bidireccional y valores normalizados en ARS para el motor del Excel
  const montoCalculadoARS = useMemo(() => {
    if (montoACanjear === '' || typeof montoACanjear !== 'number' || montoACanjear <= 0) return 0;
    return moneda === 'USD' ? Math.round(montoACanjear * config.dolarBNA.venta) : montoACanjear;
  }, [montoACanjear, moneda, config.dolarBNA.venta]);

  const montoCalculadoUSD = useMemo(() => {
    if (montoACanjear === '' || typeof montoACanjear !== 'number' || montoACanjear <= 0) return 0;
    return moneda === 'USD' ? montoACanjear : Math.round(montoACanjear / config.dolarBNA.venta);
  }, [montoACanjear, moneda, config.dolarBNA.venta]);

  const precioCalculadoARS = useMemo(() => {
    if (precioPorTonelada === '' || typeof precioPorTonelada !== 'number' || precioPorTonelada <= 0) return 0;
    return moneda === 'USD' ? Math.round(precioPorTonelada * config.dolarBNA.venta) : precioPorTonelada;
  }, [precioPorTonelada, moneda, config.dolarBNA.venta]);

  const precioCalculadoUSD = useMemo(() => {
    if (precioPorTonelada === '' || typeof precioPorTonelada !== 'number' || precioPorTonelada <= 0) return 0;
    return moneda === 'USD' ? precioPorTonelada : Number((precioPorTonelada / config.dolarBNA.venta).toFixed(2));
  }, [precioPorTonelada, moneda, config.dolarBNA.venta]);

  // Función para obtener el precio de pizarra en la moneda actual
  const getGrainPriceForCurrency = (grain: GrainItem, pl: PlazaMercado, mon: 'ARS' | 'USD') => {
    const pARS = pl === 'bahia_blanca' ? grain.prices.bahiaARS : grain.prices.rosarioARS;
    if (mon === 'USD') {
      return Number((pARS / config.dolarBNA.venta).toFixed(2));
    }
    return pARS;
  };

  // Precio de pizarra de referencia según la plaza activa y moneda actual
  const precioPizarraActual = useMemo(() => {
    if (!selectedGrain) return moneda === 'USD' ? 344.82 : 520000;
    return getGrainPriceForCurrency(selectedGrain, plaza, moneda);
  }, [selectedGrain, plaza, moneda, config.dolarBNA.venta]);

  // Cambio de moneda con conversión inmediata de inputs
  const handleToggleMoneda = (newMoneda: 'ARS' | 'USD') => {
    if (newMoneda === moneda) return;
    setMoneda(newMoneda);

    if (newMoneda === 'USD') {
      if (montoACanjear !== '' && typeof montoACanjear === 'number') {
        setMontoACanjear(Math.round(montoACanjear / config.dolarBNA.venta));
      }
      if (precioPorTonelada !== '' && typeof precioPorTonelada === 'number') {
        setPrecioPorTonelada(Number((precioPorTonelada / config.dolarBNA.venta).toFixed(2)));
      }
    } else {
      if (montoACanjear !== '' && typeof montoACanjear === 'number') {
        setMontoACanjear(Math.round(montoACanjear * config.dolarBNA.venta));
      }
      if (precioPorTonelada !== '' && typeof precioPorTonelada === 'number') {
        setPrecioPorTonelada(Math.round(precioPorTonelada * config.dolarBNA.venta));
      }
    }
  };

  // Si el usuario cambia de grano o de plaza, y no modificó manualmente el precio, se actualiza al precio de pizarra
  const handleSelectGrain = (grainId: string) => {
    setSelectedGrainId(grainId);
    const g = config.grains.find((item) => item.id === grainId);
    if (g) {
      const p = getGrainPriceForCurrency(g, plaza, moneda);
      setPrecioPorTonelada(p);
      setIsPriceCustom(false);
    }
  };

  const handleTogglePlaza = (newPlaza: PlazaMercado) => {
    setPlaza(newPlaza);
    if (!isPriceCustom && selectedGrain) {
      const p = getGrainPriceForCurrency(selectedGrain, newPlaza, moneda);
      setPrecioPorTonelada(p);
    }
  };

  const handleResetToPizarra = () => {
    if (selectedGrain) {
      const p = getGrainPriceForCurrency(selectedGrain, plaza, moneda);
      setPrecioPorTonelada(p);
      setIsPriceCustom(false);
    }
  };

  // Información de tarifa de flete en tiempo real
  const fleteLookup = useMemo(() => {
    return getFreightRate(kilometrosFlete || 0);
  }, [kilometrosFlete]);

  // Cálculo exacto del Excel
  const result = useMemo(() => {
    if (
      montoCalculadoARS <= 0 ||
      precioCalculadoARS <= 0
    ) {
      return null;
    }

    return calculateCanjeExactExcel(
      {
        montoACanjear: montoCalculadoARS,
        precioPorTonelada: precioCalculadoARS,
        sisaScore: selectedSisaId,
        correspondeIibbBsAs,
        retencionIvaManualSisa3: selectedSisaId === 3 ? Number(retIvaManualSisa3 || 0) : 0,
        retencionGananciasManualSisa3: selectedSisaId === 3 ? Number(retGanManualSisa3 || 0) : 0,
        kilometrosFlete: Number(kilometrosFlete || 0),
        granoNombre: selectedGrain.name,
        plazaSeleccionada: plaza
      },
      config.parametros
    );
  }, [
    montoCalculadoARS,
    precioCalculadoARS,
    selectedSisaId,
    correspondeIibbBsAs,
    retIvaManualSisa3,
    retGanManualSisa3,
    kilometrosFlete,
    selectedGrain,
    plaza,
    config.parametros
  ]);

  // Formateadores monetarios y numéricos
  const formatMoney = (val: number) => {
    return '$ ' + Math.round(val).toLocaleString('es-AR');
  };

  const formatMoneyPrecise = (val: number) => {
    return '$ ' + val.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatUSD = (val: number) => {
    return 'USD ' + Math.round(val).toLocaleString('es-AR');
  };

  const formatUSDPrecise = (val: number) => {
    return 'USD ' + val.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatTn = (val: number) => {
    return (
      val.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + ' Tn'
    );
  };

  // Top 4 Granos para el ticker superior
  const topGrains = useMemo(() => {
    const ids = ['soja', 'maiz', 'trigo', 'girasol'];
    return ids
      .map((id) => config.grains.find((g) => g.id === id))
      .filter((g): g is GrainItem => Boolean(g));
  }, [config.grains]);

  // Mensaje de WhatsApp
  const whatsappSimulatorUrl = useMemo(() => {
    if (!result) {
      const genericText = encodeURIComponent(
        `*Consulta Canje de Granos - ADG Almacén de Granos*\n\n` +
        `Hola equipo comercial de ADG, quisiera cotizar y asesorarme para operar por canje de cereal disponible.`
      );
      return `https://wa.me/5492314405179?text=${genericText}`;
    }
    const montoText = moneda === 'USD'
      ? `USD ${montoCalculadoUSD.toLocaleString('es-AR')} ($ ${Math.round(result.input.montoACanjear).toLocaleString('es-AR')} ARS)`
      : `${formatMoney(result.input.montoACanjear)} (~ USD ${montoCalculadoUSD.toLocaleString('es-AR')})`;

    const text = encodeURIComponent(
      `*Consulta Simulación de Canje - ADG Almacén de Granos*\n\n` +
      `• *Monto a Canjear:* ${montoText}\n` +
      `• *Grano:* ${result.input.granoNombre} a ${formatMoney(result.input.precioPorTonelada)}/Tn${moneda === 'USD' ? ` (USD ${precioCalculadoUSD}/Tn)` : ''}\n` +
      `• *Plaza Referencia:* ${plaza === 'bahia_blanca' ? 'Bahía Blanca' : 'Rosario'}\n` +
      `• *Flete:* ${result.input.kilometrosFlete} km (${formatMoneyPrecise(result.fleteInfo.ratePerTon)}/Tn)\n` +
      `• *SISA:* Estado ${result.input.sisaScore}\n` +
      `• *Tn por Canje:* ${formatTn(result.canje.toneladasNecesarias)}\n` +
      `• *Tn Venta Normal:* ${formatTn(result.ventaNormal.toneladasNecesarias)}\n` +
      `• *Ahorro Estimado:* ${formatTn(result.ventaja.ahorroToneladas)} (${formatMoney(result.ventaja.ahorroMonto)} / ~ ${formatUSD(result.ventaja.ahorroMonto / config.dolarBNA.venta)})\n\n` +
      `Hola equipo ADG, quisiera cotizar y asesorarme para cerrar esta operación por canje.`
    );
    return `https://wa.me/5492314405179?text=${text}`;
  }, [result, plaza, moneda, montoCalculadoUSD, precioCalculadoUSD, config.dolarBNA.venta]);

  return (
    <div id="canje-simulator-page" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans w-full overflow-x-clip">
      
      {/* ============================================================ */}
      {/* HEADER PRINCIPAL: Marca ADG a la izquierda y Dólar BNA derecha*/}
      {/* ============================================================ */}
      <header id="simulator-header" className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Logo ADG + Línea divisoria finita + Título Simulador de Canje de Granos */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (onBackToLanding) {
                  onBackToLanding();
                } else if (typeof window !== 'undefined') {
                  const baseUrl = window.location.href.split('#')[0].split('?')[0];
                  window.location.href = baseUrl;
                }
              }}
              className="flex items-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              title="ADG - Almacén de Granos"
            >
              <Logo lightBg={true} height={42} />
            </a>

            <div className="h-6 sm:h-7 w-px bg-gray-200" />

            <h1 className="text-sm sm:text-base md:text-lg font-black text-gray-800 tracking-tight whitespace-nowrap">
              Simulador de Canje de Granos
            </h1>
          </div>

          {/* Margen derecho: Cotización Dólar BNA */}
          <div id="header-dolar-bna" className="flex items-center space-x-2.5 sm:space-x-3.5 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs text-xs shrink-0">
            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-cyan-900 uppercase tracking-tight leading-tight">
                  DÓLAR BNA
                </span>
                <span className={`w-2 h-2 rounded-full ${dolarLiveStatus === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} title={dolarLiveStatus === 'live' ? 'Conectado a API oficial en vivo' : 'Valor de referencia diario'} />
              </div>
              <div 
                className="text-[9px] sm:text-[10px] text-gray-500 font-medium cursor-help"
                title={`Cotización oficial Banco Nación (última rueda registrada: ${config.dolarBNA.fecha})`}
              >
                Oficial BNA
              </div>
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center space-x-2.5 sm:space-x-3 text-xs">
              <div className="text-gray-700">
                <span className="text-[10px] font-bold text-gray-500 mr-1">COMPRA:</span>
                <span className="font-black text-gray-900">${config.dolarBNA.compra}</span>
              </div>
              <div className="text-gray-700">
                <span className="text-[10px] font-bold text-cyan-700 mr-1">VENTA:</span>
                <span className="font-black text-blue-700">${config.dolarBNA.venta}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Barra de Pizarras: Selector de Plaza a la izquierda y 4 Granos ocupando todo el ancho */}
        <div id="simulator-ticker" className="bg-slate-50/90 border-t border-gray-200/80 py-2.5 sm:py-3">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 w-full">
              
              {/* Selector de Plaza de Referencia: Pizarras Rosario / Bahía Blanca */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span 
                  className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5 cursor-help select-none"
                  title={`Cámara Arbitral de Cereales (${plaza === 'bahia_blanca' ? 'Bahía Blanca' : 'Rosario'}). Última rueda oficial registrada: ${fechaPizarraActiva}. Próxima actualización automática: hoy a las 17:00 hs.`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  Pizarras:
                </span>
                <div id="selector-plaza-mercado" className="flex items-center bg-gray-200/70 p-1 rounded-xl border border-gray-200 text-xs">
                  <button
                    type="button"
                    onClick={() => handleTogglePlaza('rosario')}
                    title={`Pizarra Oficial Rosario (última rueda oficial registrada: ${fechaPizarraActiva} - actualización diaria a las 17:00 hs)`}
                    className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                      plaza === 'rosario'
                        ? 'bg-brand-green text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Rosario
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTogglePlaza('bahia_blanca')}
                    title={`Pizarra Oficial Bahía Blanca (última rueda oficial registrada: ${fechaPizarraActiva} - actualización diaria a las 17:00 hs)`}
                    className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                      plaza === 'bahia_blanca'
                        ? 'bg-brand-green text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Bahía Blanca
                  </button>
                </div>
              </div>

              {/* Separador vertical para pantallas medianas/grandes */}
              <div className="hidden md:block h-9 w-px bg-gray-200 shrink-0" />

              {/* Los 4 Granos Principales distribuidos en Grid para ocupar todo el ancho disponible */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 flex-grow w-full">
                {topGrains.map((grain) => {
                  const isSelected = grain.id === selectedGrainId;
                  const grainPriceARS = plaza === 'bahia_blanca' ? grain.prices.bahiaARS : grain.prices.rosarioARS;
                  const grainPriceUSD = grainPriceARS / config.dolarBNA.venta;
                  return (
                    <button
                      key={grain.id}
                      onClick={() => handleSelectGrain(grain.id)}
                      className={`group flex items-center space-x-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-[0.98] w-full ${
                        isSelected
                          ? 'bg-brand-green text-white border-brand-green shadow-md ring-2 ring-brand-green/30'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-brand-green/50 hover:bg-emerald-50/40'
                      }`}
                      title={`Seleccionar ${grain.name} (${plaza === 'bahia_blanca' ? 'Bahía Blanca' : 'Rosario'})`}
                    >
                      {/* Ícono de grano agrandado 25% y sin cuadrado contenedor */}
                      <div className={`shrink-0 transition-transform group-hover:scale-105 flex items-center justify-center ${
                        isSelected 
                          ? 'text-brand-gold-light' 
                          : 'text-brand-green'
                      }`}>
                        <GrainIcon type={grain.id} className="w-9 h-9 sm:w-10 sm:h-10" strokeWidth={1.8} />
                      </div>
                      
                      <div className="flex flex-col items-start leading-tight min-w-0">
                        <span className="font-black uppercase text-xs sm:text-sm tracking-wide truncate w-full text-left">
                          {grain.shortName}
                        </span>
                        <span className={`text-xs sm:text-sm font-black mt-0.5 truncate w-full text-left ${
                          isSelected ? 'text-brand-gold-light' : 'text-brand-green'
                        }`}>
                          {moneda === 'USD'
                            ? `USD ${Math.round(grainPriceUSD).toLocaleString('es-AR')}`
                            : `$ ${Math.round(grainPriceARS).toLocaleString('es-AR')}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* CONTENIDO PRINCIPAL: Layout de 3 Columnas & Hero de Ahorro    */}
      {/* ============================================================ */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Texto introductorio antes de Parámetros */}
        <div className="mb-5 sm:mb-6 w-full">
          <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed text-left w-full">
            Compará con rigor exacto la cantidad de toneladas necesarias para cancelar tus compras entregando cereal por canje versus una venta tradicional con retenciones fiscales de AFIP y flete.
          </p>
        </div>

        {/* Grid de 3 Columnas: 1. Parámetros | 2. Canje ADG | 3. Venta Normal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          
          {/* ======================================================== */}
          {/* COLUMNA 1: PARÁMETROS DE LA OPERACIÓN                    */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-[#1b6b3e] to-[#0c381f] text-white p-5 sm:p-6 shadow-lg flex flex-col justify-between border border-emerald-800/40">
            <div>
              
              {/* Título de Parámetros */}
              <div className="border-b border-white/20 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Parámetros
                  </h2>
                  <p className="text-emerald-100/90 text-xs">Datos de la Operación y Flete</p>
                </div>
                <div className="p-2 rounded-xl bg-white/10 text-brand-gold">
                  <Coins className="w-5 h-5" />
                </div>
              </div>

              {/* Selector de Moneda: ARS vs USD */}
              <div className="bg-black/25 p-1.5 rounded-xl border border-white/15 mb-4 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 pl-1.5 flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Moneda:</span>
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleToggleMoneda('ARS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      moneda === 'ARS'
                        ? 'bg-brand-gold text-slate-900 shadow-xs'
                        : 'text-emerald-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    $ ARS (Pesos)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleMoneda('USD')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      moneda === 'USD'
                        ? 'bg-brand-gold text-slate-900 shadow-xs'
                        : 'text-emerald-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    U$S USD (Dólares)
                  </button>
                </div>
              </div>

              {/* Controles del Formulario */}
              <div className="space-y-4">
                
                {/* 1. Monto a Canjear */}
                <div>
                  <label htmlFor="param-monto-canjear" className="block text-xs font-bold uppercase tracking-wider text-emerald-100 mb-1.5 flex items-center justify-between">
                    <span>
                      Monto a Canjear ({moneda === 'USD' ? 'USD' : '$ ARS'}) <span className="text-brand-gold-light">*</span>
                    </span>
                    {(montoACanjear === '' || montoACanjear <= 0) && (
                      <span className="text-[10px] text-amber-200/90 font-normal normal-case">Obligatorio</span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold text-sm pointer-events-none">
                      {moneda === 'USD' ? 'USD' : '$'}
                    </span>
                    <input
                      id="param-monto-canjear"
                      type="number"
                      min={1}
                      step={moneda === 'USD' ? 100 : 10000}
                      value={montoACanjear === '' ? '' : montoACanjear}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMontoACanjear(val === '' ? '' : Math.max(0, Number(val)));
                      }}
                      placeholder={moneda === 'USD' ? 'Ej: 50.000' : 'Ej: 100.000.000'}
                      className={`w-full ${moneda === 'USD' ? 'pl-14' : 'pl-9'} pr-3.5 py-2.5 bg-white text-gray-900 rounded-xl text-base font-extrabold border-2 border-transparent focus:border-brand-gold focus:outline-none shadow-xs placeholder:text-gray-400 placeholder:font-normal`}
                      required
                    />
                  </div>
                  {montoCalculadoARS > 0 && (
                    <p className="text-[11px] text-emerald-200/90 mt-1">
                      {moneda === 'USD' ? (
                        <>Equivale a <strong>{formatMoney(montoCalculadoARS)}</strong> al Dólar BNA Venta (${config.dolarBNA.venta})</>
                      ) : (
                        <>Equivale a <strong>USD {montoCalculadoUSD.toLocaleString('es-AR')}</strong> al Dólar BNA Venta (${config.dolarBNA.venta})</>
                      )}
                    </p>
                  )}
                </div>

                {/* 2. Tipo de Grano a Entregar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="param-grano" className="block text-xs font-bold uppercase tracking-wider text-emerald-100">
                      Grano a Entregar <span className="text-brand-gold-light">*</span>
                    </label>
                    <span className="text-[11px] text-emerald-200/90 font-medium">
                      Plaza {plaza === 'bahia_blanca' ? 'Bahía Blanca' : 'Rosario'}
                    </span>
                  </div>

                  {/* Menú desplegable completo con ícono del grano activo */}
                  <div className="relative flex items-center">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-green flex items-center justify-center p-1.5 bg-emerald-50 rounded-lg shadow-2xs">
                      <GrainIcon type={selectedGrain.id} className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <select
                      id="param-grano"
                      value={selectedGrainId}
                      onChange={(e) => handleSelectGrain(e.target.value)}
                      className="w-full bg-white text-gray-900 rounded-xl pl-12 pr-10 py-2.5 sm:py-3 text-sm sm:text-base font-extrabold uppercase border-2 border-transparent focus:border-brand-gold focus:outline-none shadow-xs appearance-none cursor-pointer"
                    >
                      {config.grains.map((g) => (
                        <option key={g.id} value={g.id} className="py-2 font-bold text-gray-900 uppercase">
                          {g.name} ({g.category})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-600">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* 3. Precio por Tonelada - EDITABLE A MANO COMO PIDIÓ EL CLIENTE */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="param-precio-tn" className="block text-xs font-bold uppercase tracking-wider text-emerald-100">
                      Precio ({moneda === 'USD' ? 'USD / Tn' : '$ / Tn'}) <span className="text-brand-gold-light">*</span>
                    </label>
                    {isPriceCustom && (
                      <button
                        type="button"
                        onClick={handleResetToPizarra}
                        className="text-[10px] text-brand-gold-light hover:underline flex items-center space-x-1 cursor-pointer"
                        title="Restablecer al valor oficial de pizarra"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>
                          Pizarra: {moneda === 'USD' ? `USD ${precioPizarraActual}` : `$ ${Math.round(precioPizarraActual).toLocaleString('es-AR')}`}
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold text-sm pointer-events-none">
                      {moneda === 'USD' ? 'USD' : '$'}
                    </span>
                    <input
                      id="param-precio-tn"
                      type="number"
                      min={1}
                      step={moneda === 'USD' ? 0.5 : 100}
                      value={precioPorTonelada === '' ? '' : precioPorTonelada}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPrecioPorTonelada(val === '' ? '' : Math.max(0, Number(val)));
                        setIsPriceCustom(true);
                      }}
                      className={`w-full ${moneda === 'USD' ? 'pl-14' : 'pl-9'} pr-3.5 py-2.5 bg-white text-gray-900 rounded-xl text-base font-extrabold border-2 border-transparent focus:border-brand-gold focus:outline-none shadow-xs`}
                      required
                    />
                  </div>
                  <p className="text-[10.5px] text-emerald-200/90 mt-1 flex items-center justify-between">
                    <span>
                      {moneda === 'USD' ? (
                        <>Equivale a <strong>{formatMoney(precioCalculadoARS)}/Tn</strong>. Editable a mano.</>
                      ) : (
                        <>Equivale a <strong>USD {precioCalculadoUSD}/Tn</strong>. Editable a mano.</>
                      )}
                    </span>
                  </p>
                </div>

                {/* 4. Kilómetros de Flete & Búsqueda Automática de Tarifa */}
                <div>
                  <label htmlFor="param-km-flete" className="block text-xs font-bold uppercase tracking-wider text-emerald-100 mb-1.5 flex items-center justify-between">
                    <span>Distancia de Flete (km)</span>
                    <span className="text-[10px] text-emerald-200 font-normal">Matriz 1 a 1000 km</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold text-sm pointer-events-none">
                      <Truck className="w-4 h-4 text-gray-500" />
                    </span>
                    <input
                      id="param-km-flete"
                      type="number"
                      min={0}
                      max={1500}
                      value={kilometrosFlete === '' ? '' : kilometrosFlete}
                      onChange={(e) => {
                        const val = e.target.value;
                        setKilometrosFlete(val === '' ? '' : Math.max(0, Number(val)));
                      }}
                      placeholder="0 para sin flete"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold border-2 border-transparent focus:border-brand-gold focus:outline-none shadow-xs"
                    />
                  </div>
                  
                  {/* Badge con la tarifa de flete encontrada en la matriz */}
                  <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-xs border border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-100">
                      {fleteLookup.statusLabel}:
                    </span>
                    <span className="font-extrabold text-brand-gold-light">
                      {formatMoneyPrecise(fleteLookup.ratePerTon)} / Tn
                    </span>
                  </div>
                </div>

                {/* 5. Score SISA */}
                <div>
                  <label htmlFor="param-sisa" className="block text-xs font-bold uppercase tracking-wider text-emerald-100 mb-1.5 flex items-center justify-between">
                    <span>Score SISA (ARCA / AFIP) <span className="text-brand-gold-light">*</span></span>
                  </label>
                  <select
                    id="param-sisa"
                    value={selectedSisaId}
                    onChange={(e) => setSelectedSisaId(Number(e.target.value) as 1 | 2 | 3)}
                    className="w-full bg-white text-gray-900 rounded-xl px-3.5 py-2.5 text-sm font-bold border-2 border-transparent focus:border-brand-gold focus:outline-none shadow-xs cursor-pointer"
                  >
                    {config.sisaOptions.map((s) => (
                      <option key={s.id} value={s.id} className="text-gray-900 font-bold">
                        {s.name} - {s.statusLabel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Percepción IIBB Buenos Aires (0.75%) */}
                <div className="pt-1">
                  <div className="flex items-center justify-between bg-white/10 p-2.5 rounded-xl border border-white/15">
                    <div>
                      <span className="text-xs font-bold block text-white">¿Percepción IIBB Bs. As.?</span>
                      <span className="text-[10px] text-emerald-200">Alícuota general 0.75%</span>
                    </div>
                    <div className="flex items-center bg-black/20 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setCorrespondeIibbBsAs(false)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                          !correspondeIibbBsAs ? 'bg-white text-gray-900 shadow-xs' : 'text-emerald-200 hover:text-white'
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setCorrespondeIibbBsAs(true)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                          correspondeIibbBsAs ? 'bg-brand-gold text-slate-900 shadow-xs' : 'text-emerald-200 hover:text-white'
                        }`}
                      >
                        Sí
                      </button>
                    </div>
                  </div>
                </div>

                {/* Campos opcionales si se selecciona SISA Estado 3 */}
                {selectedSisaId === 3 && (
                  <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/40 space-y-2.5 text-xs">
                    <span className="font-extrabold text-amber-200 block text-[11px] uppercase tracking-wider">
                      Alícuotas Manuales Canje (SISA 3)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-amber-100 block mb-1">Ret. IVA Canje (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={retIvaManualSisa3}
                          onChange={(e) => setRetIvaManualSisa3(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white text-gray-900 px-2.5 py-1.5 rounded-lg font-bold text-xs"
                          placeholder="8"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-amber-100 block mb-1">Ret. Ganancias (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={retGanManualSisa3}
                          onChange={(e) => setRetGanManualSisa3(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white text-gray-900 px-2.5 py-1.5 rounded-lg font-bold text-xs"
                          placeholder="15"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Footer con enlace a SISA AFIP */}
            <div className="pt-4 mt-5 border-t border-white/15">
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
          {/* COLUMNA 2: LIQUIDACIÓN CANJE ADG                         */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 rounded-2xl bg-emerald-50/50 p-5 sm:p-6 shadow-md border-2 border-emerald-300/80 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-green to-emerald-500" />

            <div>
              {/* Header Columna 2 */}
              <div className="border-b border-emerald-200/70 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-brand-green">
                    Liquidación Canje ADG
                  </h2>
                  <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mt-0.5">
                    Régimen Especial sin Retenciones
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-emerald-200 text-brand-green shrink-0 flex items-center justify-center shadow-2xs" title={`Grano seleccionado: ${selectedGrain.name}`}>
                  <GrainIcon type={selectedGrain.id} className="w-6 h-6 text-brand-green" strokeWidth={1.8} />
                </div>
              </div>

              {/* Filas de conceptos de Canje */}
              <div className="space-y-3 text-xs sm:text-sm">
                
                {/* Precio Cereal */}
                <div>
                  <span className="text-xs font-semibold text-gray-600 block">
                    Precio del Grano ({moneda === 'USD' ? 'USD / Tn' : '$/Tn'}):
                  </span>
                  <div className="bg-white px-3.5 py-2 rounded-lg font-bold text-gray-800 border border-emerald-200/70 mt-1 flex items-center justify-between shadow-2xs">
                    <span>
                      {result
                        ? moneda === 'USD'
                          ? formatUSDPrecise(result.canje.precioGrano / config.dolarBNA.venta)
                          : formatMoneyPrecise(result.canje.precioGrano)
                        : moneda === 'USD'
                          ? formatUSDPrecise(precioCalculadoUSD)
                          : formatMoneyPrecise(Number(precioPorTonelada || 0))}
                    </span>
                    {moneda === 'USD' && result && (
                      <span className="text-[11px] text-gray-500 font-semibold">
                        ({formatMoneyPrecise(result.canje.precioGrano)})
                      </span>
                    )}
                  </div>
                </div>

                {/* IVA Cereal (+10.5%) */}
                <div>
                  <span className="text-xs font-semibold text-gray-600 block">IVA Cereal (+10.5%):</span>
                  <div className="bg-white px-3.5 py-2 rounded-lg font-bold text-emerald-700 border border-emerald-200/70 mt-1 flex items-center justify-between shadow-2xs">
                    <span>
                      + {result ? formatMoneyPrecise(result.canje.ivaCereal) : formatMoneyPrecise(Number(precioPorTonelada || 0) * 0.105)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold uppercase">Computable</span>
                  </div>
                </div>

                {/* Retenciones Fiscales en Canje: 0% */}
                <div>
                  <span className="text-xs font-semibold text-gray-600 block">Retenciones Fiscales (IVA y Ganancias):</span>
                  <div className="bg-white px-3.5 py-2 rounded-lg font-extrabold text-emerald-700 border border-emerald-200/70 mt-1 flex items-center justify-between shadow-2xs">
                    <span>
                      {result && (result.canje.retencionIva < 0 || result.canje.retencionGanancias < 0)
                        ? formatMoneyPrecise(result.canje.retencionIva + result.canje.retencionGanancias)
                        : '$ 0,00 (0%)'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider font-bold">
                      {selectedSisaId === 3 ? 'Manual SISA 3' : 'Exento en Canje'}
                    </span>
                  </div>
                </div>

                {/* Flete Deducción si aplica */}
                {Number(kilometrosFlete) > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-600 block">Flete ({kilometrosFlete} km + IVA):</span>
                    <div className="bg-white px-3.5 py-2 rounded-lg font-medium text-gray-600 border border-emerald-200/70 mt-1 flex items-center justify-between shadow-2xs">
                      <span>- {formatMoneyPrecise((result?.canje.flete ? Math.abs(result.canje.flete) : fleteLookup.ratePerTon) * 1.105)}</span>
                      <span className="text-[10px] text-gray-500">Tarifa Oficial</span>
                    </div>
                  </div>
                )}

                {/* Monto Final Disponible por Tn */}
                <div>
                  <span className="text-xs font-semibold text-gray-600 block">Monto Final Disponible / Tn:</span>
                  <div className="bg-white px-3.5 py-2 rounded-lg font-extrabold text-brand-green border-2 border-brand-green/30 mt-1 text-sm shadow-2xs">
                    {result ? formatMoneyPrecise(result.canje.montoFinalPorTonelada) : '—'}
                  </div>
                </div>

              </div>
            </div>

            {/* Total Toneladas a Entregar Box */}
            <div className="mt-5 pt-4 border-t border-emerald-200/70">
              <div className="bg-white border-2 border-brand-green/50 rounded-xl p-4 text-center shadow-xs">
                <span className="text-xs uppercase font-extrabold tracking-wider text-brand-green block mb-0.5">
                  Total Toneladas a Entregar:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-brand-green block">
                  {result ? formatTn(result.canje.toneladasNecesarias) : '-- Tn'}
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold mt-0.5 block">
                  {result ? 'Menor cantidad de cereal gracias al canje' : 'Ingresá el monto de la operación para calcular'}
                </span>
              </div>
            </div>

          </div>


          {/* ======================================================== */}
          {/* COLUMNA 3: LIQUIDACIÓN VENTA NORMAL                      */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 rounded-2xl bg-slate-100/80 p-5 sm:p-6 shadow-md border border-slate-300/80 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gray-400/60" />

            <div>
              {/* Header Columna 3 */}
              <div className="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-700">
                    Liquidación Normal
                  </h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                    Venta Tradicional con Retenciones
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 shrink-0 shadow-2xs">
                  <Scale className="w-5 h-5 text-gray-600" />
                </div>
              </div>

              {/* Filas de conceptos de Venta Normal */}
              <div className="space-y-3 text-xs sm:text-sm">
                
                {/* Precio Cereal */}
                <div>
                  <span className="text-xs font-semibold text-gray-600 block">
                    Precio del Grano ({moneda === 'USD' ? 'USD / Tn' : '$/Tn'}):
                  </span>
                  <div className="bg-white px-3.5 py-2 rounded-lg font-bold text-gray-700 border border-gray-200 mt-1 flex items-center justify-between shadow-2xs">
                    <span>
                      {result
                        ? moneda === 'USD'
                          ? formatUSDPrecise(result.ventaNormal.precioGrano / config.dolarBNA.venta)
                          : formatMoneyPrecise(result.ventaNormal.precioGrano)
                        : moneda === 'USD'
                          ? formatUSDPrecise(precioCalculadoUSD)
                          : formatMoneyPrecise(Number(precioPorTonelada || 0))}
                    </span>
                    {moneda === 'USD' && result && (
                      <span className="text-[11px] text-gray-500 font-semibold">
                        ({formatMoneyPrecise(result.ventaNormal.precioGrano)})
                      </span>
                    )}
                  </div>
                </div>

                {/* Retención IVA SISA */}
                <div>
                  <span className="text-xs font-semibold text-gray-600 block">
                    Retención IVA AFIP ({selectedSisaId === 1 ? '5%' : selectedSisaId === 2 ? '7%' : '8%'}):
                  </span>
                  <div className="bg-rose-50 px-3.5 py-2 rounded-lg font-bold text-rose-700 border border-rose-200 mt-1 flex items-center justify-between shadow-2xs">
                    <span>{result ? formatMoneyPrecise(result.ventaNormal.retencionIva) : '—'}</span>
                    <span className="text-[10px] font-bold uppercase text-rose-600">Quita Fiscal</span>
                  </div>
                </div>

                {/* Retención Ganancias SISA */}
                <div>
                  <span className="text-xs font-semibold text-gray-600 block">
                    Retención Ganancias AFIP ({selectedSisaId === 1 ? '0%' : selectedSisaId === 2 ? '2%' : '15%'}):
                  </span>
                  <div className="bg-rose-50 px-3.5 py-2 rounded-lg font-bold text-rose-700 border border-rose-200 mt-1 flex items-center justify-between shadow-2xs">
                    <span>{result ? formatMoneyPrecise(result.ventaNormal.retencionGanancias) : '—'}</span>
                    <span className="text-[10px] font-bold uppercase text-rose-600">Quita Fiscal</span>
                  </div>
                </div>

                {/* Depósito CBU IVA */}
                <div>
                  <span className="text-xs font-semibold text-gray-600 block">Depósito CBU IVA (Diferimiento):</span>
                  <div className="bg-amber-50 px-3.5 py-2 rounded-lg font-bold text-amber-800 border border-amber-200 mt-1 flex items-center justify-between shadow-2xs">
                    <span>{result ? `- ${formatMoneyPrecise(result.ventaNormal.depCbuIva)}` : '—'}</span>
                    <span className="text-[10px] font-bold uppercase text-amber-700">No Inmediato</span>
                  </div>
                </div>

                {/* Monto Final Disponible por Tn */}
                <div>
                  <span className="text-xs font-semibold text-gray-600 block">Monto Final Disponible / Tn:</span>
                  <div className="bg-white px-3.5 py-2 rounded-lg font-extrabold text-gray-700 border border-gray-300 mt-1 text-sm shadow-2xs">
                    {result ? formatMoneyPrecise(result.ventaNormal.montoFinalPorTonelada) : '—'}
                  </div>
                </div>

              </div>
            </div>

            {/* Total Toneladas a Entregar Box */}
            <div className="mt-5 pt-4 border-t border-gray-200">
              <div className="bg-white border-2 border-gray-300 rounded-xl p-4 text-center shadow-xs">
                <span className="text-xs uppercase font-extrabold tracking-wider text-gray-600 block mb-0.5">
                  Total Toneladas a Entregar:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-gray-800 block">
                  {result ? formatTn(result.ventaNormal.toneladasNecesarias) : '-- Tn'}
                </span>
                <span className="text-[11px] text-rose-600 font-semibold mt-0.5 block">
                  {result ? `+ ${formatTn(result.ventaja.ahorroToneladas)} más requeridas por retenciones` : 'Cargá los parámetros para calcular'}
                </span>
              </div>
            </div>

          </div>

        </div>


        {/* ======================================================== */}
        {/* HERO AHORRO SECTION: Resumen de Beneficios para el Productor */}
        {/* ======================================================== */}
        <div 
          id="ahorro-summary-card" 
          className="mt-6 sm:mt-8 rounded-2xl bg-gradient-to-r from-emerald-800 via-brand-green to-emerald-900 text-white p-5 sm:p-8 shadow-xl border border-emerald-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Izquierda: Ahorro en Cereal */}
            <div className="md:col-span-7">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-white/15 text-brand-gold-light border border-white/20 shrink-0">
                  <GrainIcon type={selectedGrain.id} className="w-8 h-8" strokeWidth={2} />
                </div>
                <div>
                  <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold-light text-[11px] font-bold uppercase tracking-wider mb-0.5">
                    <span>Beneficio Directo al Productor</span>
                  </div>
                  {result ? (
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
                      Ahorrás <span className="text-brand-gold-light underline decoration-brand-gold">{formatTn(result.ventaja.ahorroToneladas)}</span> de {selectedGrain.name}
                    </h3>
                  ) : (
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      Simulá tu operación en {selectedGrain.name}
                    </h3>
                  )}
                </div>
              </div>

              {result ? (
                <p className="text-emerald-100 text-xs sm:text-sm mt-2 max-w-xl">
                  {result.ventaja.resumenTexto} Operando con <strong>ADG Almacén de Granos</strong> evitás la quita de retenciones de IVA y Ganancias de AFIP, compensando facturas de insumos directamente con tu producción.
                </p>
              ) : (
                <p className="text-emerald-100 text-xs sm:text-sm mt-2 max-w-xl">
                  Colocá el valor en {moneda === 'USD' ? 'dólares (USD)' : 'pesos ($ ARS)'} en la columna de Parámetros para calcular de inmediato el ahorro exacto en toneladas y dinero.
                </p>
              )}

              {/* Badges de Ventajas */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-100 text-xs font-bold border border-white/10 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>0% Retenciones de IVA y Ganancias</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-100 text-xs font-bold border border-white/10 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Sin Impuesto al Cheque (1.2%)</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-100 text-xs font-bold border border-white/10 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Tarifas Oficiales de Flete</span>
                </span>
              </div>
            </div>

            {/* Derecha: Resumen Económico y Botones de Acción */}
            <div className="md:col-span-5 bg-white/10 backdrop-blur-xs rounded-xl p-5 border border-white/15 text-center sm:text-left">
              
              <div className="mb-3">
                <span className="text-xs uppercase font-bold text-emerald-200 block">
                  Ahorro Económico Estimado:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-brand-gold-light block">
                  {result
                    ? moneda === 'USD'
                      ? formatUSD(result.ventaja.ahorroMonto / config.dolarBNA.venta)
                      : formatMoney(result.ventaja.ahorroMonto)
                    : '--'}
                </span>
                {result && (
                  <span className="text-xs text-emerald-200 block mt-0.5">
                    {moneda === 'USD' ? (
                      <>Equivale a <strong>{formatMoney(result.ventaja.ahorroMonto)}</strong> • Rendimiento: <strong>+{result.ventaja.porcentajeVentaja.toFixed(2)}%</strong></>
                    ) : (
                      <>Equivale a <strong>~ {formatUSD(result.ventaja.ahorroMonto / config.dolarBNA.venta)}</strong> • Rendimiento: <strong>+{result.ventaja.porcentajeVentaja.toFixed(2)}%</strong></>
                    )}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-white/15 space-y-2">
                <button
                  id="btn-export-quote-pdf"
                  onClick={() => setIsExportModalOpen(true)}
                  disabled={!result}
                  className={`w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer ${
                    result
                      ? 'bg-white hover:bg-emerald-50 text-brand-green border-2 border-brand-gold hover:shadow-lg'
                      : 'bg-white/20 text-white/50 border border-white/10 cursor-not-allowed'
                  }`}
                  title={result ? "Exportar cotización a PDF o imprimir" : "Ingresá los datos para exportar"}
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
              </div>

            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* NOTAS LEGALES Y RÉGIMEN IMPOSITIVO                       */}
        {/* ======================================================== */}
        <div className="mt-6 sm:mt-8 bg-white rounded-xl p-5 sm:p-6 border border-gray-200 text-xs text-gray-500 space-y-2.5">
          <h4 className="font-bold text-gray-800 text-sm flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-brand-green shrink-0" />
            <span>Marco Normativo del Canje de Granos (ADG)</span>
          </h4>
          <p>
            • <strong>Resolución General AFIP 4310/2118:</strong> En operaciones de canje de granos por insumos, bienes o servicios, cuando el importe se cancela íntegramente mediante la entrega física de granos disponibles o a fijar, las partes no sufren retención de IVA ni de Impuesto a las Ganancias en la liquidación primaria de granos.
          </p>
          <p>
            • <strong>Sistema SISA (ARCA / AFIP):</strong> En las ventas tradicionales, los operadores sufren retenciones automáticas según su scoring (Estado 1: 5% IVA / 0% Ganancias; Estado 2: 7% IVA / 2% Ganancias; Estado 3: 8% IVA / 15% Ganancias).
          </p>
          <p className="text-[11px] text-gray-400 italic">
            * Cotizaciones orientativas de Cámara Arbitral sujetas a confirmación comercial con la Mesa de Operaciones de ADG Almacén de Granos S.A.
          </p>
        </div>

      </main>

      {/* Footer del Simulador */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center space-x-2">
            <Logo lightBg={true} height={26} />
            <span>© {new Date().getFullYear()} ADG Almacén de Granos S.A. Todos los derechos reservados.</span>
          </div>
          <div>
            <span>Daireaux, Buenos Aires, Argentina • Tel: +54 9 2314 40-5179</span>
          </div>
        </div>
      </footer>

      {/* Modal de Exportación y PDF */}
      <CanjeQuoteExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        result={result}
        config={config}
        moneda={moneda}
        selectedGrainId={selectedGrainId}
      />

    </div>
  );
}
