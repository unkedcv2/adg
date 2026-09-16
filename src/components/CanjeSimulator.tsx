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
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Building2,
  Sliders,
  Sparkles,
  Printer,
  ArrowRight,
  Share2
} from 'lucide-react';
import Logo from './Logo';
import GrainIcon from './GrainIcons';
import CanjeQuoteExportModal from './CanjeQuoteExportModal';
// @ts-ignore
import adgLogoBlanco from '../assets/images/LOGO SIN ALMACEN DE GRANOS BLANCO.png';
// @ts-ignore
import fondoSimu from '../assets/images/fondo_simu.jfif';
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

  // Helper para formatear números de inputs con punto separando miles (ej: 5.500)
  const formatInputWithDots = (val: number | ''): string => {
    if (val === '' || val === null || val === undefined) return '';
    if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        return val.toLocaleString('es-AR');
      }
      return val.toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
    }
    return String(val);
  };

  // Parámetros principales del Simulador (emulando la hoja Simulador del Excel)
  const [montoACanjear, setMontoACanjear] = useState<number | ''>('');
  const [montoStr, setMontoStr] = useState<string>('');
  const [selectedGrainId, setSelectedGrainId] = useState<string>('soja');
  const [precioPorTonelada, setPrecioPorTonelada] = useState<number | ''>(555000);
  const [precioStr, setPrecioStr] = useState<string>('555.000');
  const [isPriceCustom, setIsPriceCustom] = useState(false);
  const [selectedSisaId, setSelectedSisaId] = useState<1 | 2 | 3>(2);
  const correspondeIibbBsAs = false;

  // Estado de navegación móvil adaptada a pantallas táctiles (Estilo App)
  const [mobileTab, setMobileTab] = useState<'parametros' | 'canje' | 'normal' | 'beneficio'>('parametros');

  // Control del diálogo de Exportación y Cotización PDF / WhatsApp
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
              const val = monedaRef.current === 'USD' ? Number((p / (config.dolarBNA?.compra || 1499)).toFixed(2)) : p;
              setPrecioStr(formatInputWithDots(val));
              return val;
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
    return moneda === 'USD' ? Math.round(montoACanjear * config.dolarBNA.compra) : montoACanjear;
  }, [montoACanjear, moneda, config.dolarBNA.compra]);

  const montoCalculadoUSD = useMemo(() => {
    if (montoACanjear === '' || typeof montoACanjear !== 'number' || montoACanjear <= 0) return 0;
    return moneda === 'USD' ? montoACanjear : Math.round(montoACanjear / config.dolarBNA.compra);
  }, [montoACanjear, moneda, config.dolarBNA.compra]);

  const precioCalculadoARS = useMemo(() => {
    if (precioPorTonelada === '' || typeof precioPorTonelada !== 'number' || precioPorTonelada <= 0) return 0;
    return moneda === 'USD' ? Math.round(precioPorTonelada * config.dolarBNA.compra) : precioPorTonelada;
  }, [precioPorTonelada, moneda, config.dolarBNA.compra]);

  const precioCalculadoUSD = useMemo(() => {
    if (precioPorTonelada === '' || typeof precioPorTonelada !== 'number' || precioPorTonelada <= 0) return 0;
    return moneda === 'USD' ? precioPorTonelada : Number((precioPorTonelada / config.dolarBNA.compra).toFixed(2));
  }, [precioPorTonelada, moneda, config.dolarBNA.compra]);

  // Función para obtener el precio de pizarra en la moneda actual
  const getGrainPriceForCurrency = (grain: GrainItem, pl: PlazaMercado, mon: 'ARS' | 'USD') => {
    const pARS = pl === 'bahia_blanca' ? grain.prices.bahiaARS : grain.prices.rosarioARS;
    if (mon === 'USD') {
      return Number((pARS / config.dolarBNA.compra).toFixed(2));
    }
    return pARS;
  };

  // Precio de pizarra de referencia según la plaza activa y moneda actual
  const precioPizarraActual = useMemo(() => {
    if (!selectedGrain) return moneda === 'USD' ? 346.90 : 520000;
    return getGrainPriceForCurrency(selectedGrain, plaza, moneda);
  }, [selectedGrain, plaza, moneda, config.dolarBNA.compra]);

  // Cambio de moneda con conversión inmediata de inputs
  const handleToggleMoneda = (newMoneda: 'ARS' | 'USD') => {
    if (newMoneda === moneda) return;
    setMoneda(newMoneda);

    if (newMoneda === 'USD') {
      if (montoACanjear !== '' && typeof montoACanjear === 'number') {
        const newM = Math.round(montoACanjear / config.dolarBNA.compra);
        setMontoACanjear(newM);
        setMontoStr(formatInputWithDots(newM));
      }
      if (precioPorTonelada !== '' && typeof precioPorTonelada === 'number') {
        const newP = Number((precioPorTonelada / config.dolarBNA.compra).toFixed(2));
        setPrecioPorTonelada(newP);
        setPrecioStr(formatInputWithDots(newP));
      }
    } else {
      if (montoACanjear !== '' && typeof montoACanjear === 'number') {
        const newM = Math.round(montoACanjear * config.dolarBNA.compra);
        setMontoACanjear(newM);
        setMontoStr(formatInputWithDots(newM));
      }
      if (precioPorTonelada !== '' && typeof precioPorTonelada === 'number') {
        const newP = Math.round(precioPorTonelada * config.dolarBNA.compra);
        setPrecioPorTonelada(newP);
        setPrecioStr(formatInputWithDots(newP));
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
      setPrecioStr(formatInputWithDots(p));
      setIsPriceCustom(false);
    }
  };

  const handleTogglePlaza = (newPlaza: PlazaMercado) => {
    setPlaza(newPlaza);
    if (!isPriceCustom && selectedGrain) {
      const p = getGrainPriceForCurrency(selectedGrain, newPlaza, moneda);
      setPrecioPorTonelada(p);
      setPrecioStr(formatInputWithDots(p));
    }
  };

  const handleResetToPizarra = () => {
    if (selectedGrain) {
      const p = getGrainPriceForCurrency(selectedGrain, plaza, moneda);
      setPrecioPorTonelada(p);
      setPrecioStr(formatInputWithDots(p));
      setIsPriceCustom(false);
    }
  };

  // Manejador de input para Monto con punto separando miles (ej: 5.500)
  const handleMontoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw.trim() === '') {
      setMontoStr('');
      setMontoACanjear('');
      return;
    }
    const withoutDots = raw.replace(/\./g, '');
    const parts = withoutDots.split(/[,]/);
    const intDigits = parts[0].replace(/\D/g, '');
    if (!intDigits && parts.length === 1) {
      setMontoStr('');
      setMontoACanjear('');
      return;
    }
    const intNum = intDigits ? parseInt(intDigits, 10) : 0;
    const formattedInt = intDigits ? intNum.toLocaleString('es-AR') : '';
    
    const hasComma = raw.includes(',');
    const decDigits = parts.length > 1 ? parts[1].replace(/\D/g, '').slice(0, 2) : '';
    
    let display = formattedInt;
    if (hasComma) {
      display += ',' + decDigits;
    }
    
    setMontoStr(display);
    const fullNum = decDigits ? parseFloat(`${intNum}.${decDigits}`) : intNum;
    setMontoACanjear(fullNum > 0 ? fullNum : '');
  };

  // Manejador de input para Precio por Tn con punto separando miles (ej: 5.500)
  const handlePrecioInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setIsPriceCustom(true);
    if (raw.trim() === '') {
      setPrecioStr('');
      setPrecioPorTonelada('');
      return;
    }
    const withoutDots = raw.replace(/\./g, '');
    const parts = withoutDots.split(/[,]/);
    const intDigits = parts[0].replace(/\D/g, '');
    if (!intDigits && parts.length === 1) {
      setPrecioStr('');
      setPrecioPorTonelada('');
      return;
    }
    const intNum = intDigits ? parseInt(intDigits, 10) : 0;
    const formattedInt = intDigits ? intNum.toLocaleString('es-AR') : '';
    
    const hasComma = raw.includes(',');
    const decDigits = parts.length > 1 ? parts[1].replace(/\D/g, '').slice(0, 2) : '';
    
    let display = formattedInt;
    if (hasComma) {
      display += ',' + decDigits;
    }
    
    setPrecioStr(display);
    const fullNum = decDigits ? parseFloat(`${intNum}.${decDigits}`) : intNum;
    setPrecioPorTonelada(fullNum > 0 ? fullNum : '');
  };

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
        retencionIvaManualSisa3: 0,
        retencionGananciasManualSisa3: 0,
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

  // Top 3 Granos para el ticker superior (Soja, Maíz, Trigo - Girasol excluido)
  const topGrains = useMemo(() => {
    const ids = ['soja', 'maiz', 'trigo'];
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
      `• *SISA:* Estado ${result.input.sisaScore}\n` +
      `• *Tn por Canje:* ${formatTn(result.canje.toneladasNecesarias)}\n` +
      `• *Tn Venta Normal:* ${formatTn(result.ventaNormal.toneladasNecesarias)}\n` +
      `• *Ahorro Estimado:* ${formatTn(result.ventaja.ahorroToneladas)} (${formatMoney(result.ventaja.ahorroMonto)} / ~ ${formatUSD(result.ventaja.ahorroMonto / config.dolarBNA.compra)})\n\n` +
      `Hola equipo ADG, quisiera cotizar y asesorarme para cerrar esta operación por canje.`
    );
    return `https://wa.me/5492314405179?text=${text}`;
  }, [result, plaza, moneda, montoCalculadoUSD, precioCalculadoUSD, config.dolarBNA.compra]);

  // =========================================================================
  // FUNCIONES DE RENDERIZADO MODULARES PARA VISTA DESKTOP Y EXPERIENCIA MOBILE
  // =========================================================================
  const renderParametrosCard = (isMobile = false) => (
    <div className="rounded-2xl bg-slate-50 text-gray-900 p-4 sm:p-5 shadow-xs flex flex-col justify-between border border-gray-300 h-full">
      <div>
        {/* Título de Parámetros */}
        <div className="border-b border-gray-200 pb-2.5 mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-gray-900">
              Parámetros
            </h2>
          </div>
          <div className="p-1.5 rounded-lg bg-amber-100 text-brand-gold-dark">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Resumen rápido para móvil si ya hay resultado */}
        {isMobile && result && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold text-gray-600 uppercase block leading-none">Entregás en Canje:</span>
              <span className="text-sm font-black text-emerald-900">{formatTn(result.canje.toneladasNecesarias)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block leading-none">Ahorrás:</span>
              <span className="text-sm font-black text-emerald-700">+{formatTn(result.ventaja.ahorroToneladas)}</span>
            </div>
          </div>
        )}

        {/* Selector de Moneda: ARS vs USD */}
        <div className="bg-white p-1 rounded-xl border border-gray-200 mb-3 flex items-center justify-between shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 pl-1.5 flex items-center space-x-1">
            <DollarSign className="w-3.5 h-3.5 text-brand-gold-dark" />
            <span>Moneda:</span>
          </span>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => handleToggleMoneda('ARS')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                moneda === 'ARS'
                  ? 'bg-brand-gold text-slate-950 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Pesos
            </button>
            <button
              type="button"
              onClick={() => handleToggleMoneda('USD')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                moneda === 'USD'
                  ? 'bg-brand-gold text-slate-950 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Dólar
            </button>
          </div>
        </div>

        {/* Controles del Formulario */}
        <div className="space-y-3">
          
          {/* 1. Monto a Canjear */}
          <div>
            <label htmlFor="param-monto-canjear" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
              <span>
                Monto a Canjear ({moneda === 'USD' ? 'USD' : '$ ARS'}) <span className="text-brand-gold-dark font-bold">*</span>
              </span>
              {(montoACanjear === '' || montoACanjear <= 0) && (
                <span className="text-[10px] text-amber-600 font-medium normal-case">Obligatorio</span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-extrabold text-sm pointer-events-none">
                {moneda === 'USD' ? 'USD' : '$'}
              </span>
              <input
                id="param-monto-canjear"
                type="text"
                inputMode="decimal"
                value={montoStr}
                onChange={handleMontoInputChange}
                placeholder={moneda === 'USD' ? 'Ej: 50.000' : 'Ej: 100.000.000'}
                className={`w-full ${moneda === 'USD' ? 'pl-14' : 'pl-8'} pr-3 py-2 bg-white text-gray-900 rounded-lg text-sm sm:text-base font-extrabold border border-gray-300 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none shadow-2xs placeholder:text-gray-400 placeholder:font-normal`}
                required
              />
            </div>
            {montoCalculadoARS > 0 && (
              <p className="text-[10.5px] text-gray-500 mt-0.5">
                {moneda === 'USD' ? (
                  <>Equivale a <strong>{formatMoney(montoCalculadoARS)}</strong> al Dólar BNA Divisa Compra (${config.dolarBNA.compra})</>
                ) : (
                  <>Equivale a <strong>USD {montoCalculadoUSD.toLocaleString('es-AR')}</strong> al Dólar BNA Divisa Compra (${config.dolarBNA.compra})</>
                )}
              </p>
            )}
          </div>

          {/* 2. Tipo de Grano a Entregar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="param-grano" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Grano a Entregar <span className="text-brand-gold-dark font-bold">*</span>
              </label>
              <span className="text-[10.5px] text-gray-500 font-medium">
                Plaza {plaza === 'bahia_blanca' ? 'Bahía Blanca' : 'Rosario'}
              </span>
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-green flex items-center justify-center p-1 bg-slate-100 rounded-md shadow-2xs">
                <GrainIcon type={selectedGrain.id} className="w-4 h-4 text-brand-green" strokeWidth={1.8} />
              </div>
              <select
                id="param-grano"
                value={selectedGrainId}
                onChange={(e) => handleSelectGrain(e.target.value)}
                className="w-full bg-white text-gray-900 rounded-lg pl-10 pr-9 py-2 text-xs sm:text-sm font-extrabold uppercase border border-gray-300 focus:border-brand-gold focus:outline-none shadow-2xs appearance-none cursor-pointer"
              >
                {config.grains.map((g) => (
                  <option key={g.id} value={g.id} className="py-2 font-bold text-gray-900 uppercase">
                    {g.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 3. Precio por Tonelada */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="param-precio-tn" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Precio ({moneda === 'USD' ? 'USD / Tn' : '$ / Tn'}) <span className="text-brand-gold-dark font-bold">*</span>
              </label>
              {isPriceCustom && (
                <button
                  type="button"
                  onClick={handleResetToPizarra}
                  className="text-[10px] text-brand-green hover:underline flex items-center space-x-1 cursor-pointer font-bold"
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-extrabold text-sm pointer-events-none">
                {moneda === 'USD' ? 'USD' : '$'}
              </span>
              <input
                id="param-precio-tn"
                type="text"
                inputMode="decimal"
                value={precioStr}
                onChange={handlePrecioInputChange}
                placeholder={moneda === 'USD' ? 'Ej: 350' : 'Ej: 550.000'}
                className={`w-full ${moneda === 'USD' ? 'pl-14' : 'pl-8'} pr-3 py-2 bg-white text-gray-900 rounded-lg text-sm sm:text-base font-extrabold border border-gray-300 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none shadow-2xs`}
                required
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5 flex items-center justify-between">
              <span>
                {moneda === 'USD' ? (
                  <>Equivale a <strong>{formatMoney(precioCalculadoARS)}/Tn</strong>. Editable a mano.</>
                ) : (
                  <>Equivale a <strong>USD {precioCalculadoUSD}/Tn</strong>. Editable a mano.</>
                )}
              </span>
            </p>
          </div>

          {/* 4. Score SISA */}
          <div>
            <label htmlFor="param-sisa" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
              <span>Score SISA <span className="text-brand-gold-dark font-bold">*</span></span>
            </label>
            <select
              id="param-sisa"
              value={selectedSisaId}
              onChange={(e) => setSelectedSisaId(Number(e.target.value) as 1 | 2 | 3)}
              className="w-full bg-white text-gray-900 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold border border-gray-300 focus:border-brand-gold focus:outline-none shadow-2xs cursor-pointer"
            >
              {config.sisaOptions.map((s) => (
                <option key={s.id} value={s.id} className="text-gray-900 font-bold">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Recuadro de notas aclaratorias */}
          <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200 text-[11px] text-gray-600 space-y-2 leading-relaxed shadow-2xs">
            <p className="flex items-start gap-1.5">
              <span className="text-brand-gold-dark font-black">•</span>
              <span>Cotización con precio pizarra del día. Ajustable a condiciones comerciales de cooperativa o acopio.</span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="text-brand-gold-dark font-black">•</span>
              <span>La simulación no contempla condiciones comerciales de acopio o cooperativa y es a modo de referencia.</span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="text-brand-gold-dark font-black">•</span>
              <span>El productor obtiene un ahorro del 1,2% correspondiente al impuesto al débito y crédito bancario, el cual no se encuentra reflejado en la simulación.</span>
            </p>
          </div>

        </div>
      </div>

      {/* Botones de acción rápida para vista mobile */}
      {isMobile && (
        <div className="pt-4 mt-4 border-t border-gray-200 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setMobileTab('canje')}
            className="bg-brand-green hover:bg-emerald-600 text-white py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span>Ver Canje ADG</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('beneficio')}
            className="bg-brand-gold hover:bg-yellow-400 text-slate-950 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span>Ver Ahorro</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  const renderCanjeCard = (isMobile = false) => (
    <div className="rounded-2xl bg-gradient-to-br from-[#072a16] to-[#044524] text-white p-4 sm:p-5 shadow-lg border-2 border-brand-green-light flex flex-col justify-between h-full relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-gold" />

      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Header Columna 2 */}
          <div className="border-b border-emerald-700/60 pb-3 mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                Liquidación Canje ADG
              </h2>
            </div>
            <div className="shrink-0 flex items-center justify-center pl-2" title="ADG Almacén de Granos">
              <img 
                src={adgLogoBlanco} 
                alt="ADG Logo" 
                className="h-6 sm:h-7 w-auto object-contain drop-shadow-xs" 
              />
            </div>
          </div>

          {/* Filas de conceptos de Canje: Etiquetas libres a la izquierda, Importes en recuadros alineados */}
          <div className="space-y-2.5 sm:space-y-3">
            
            {/* 1. Precio Cereal */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-semibold text-emerald-100">
                Precio ({moneda === 'USD' ? 'USD/Tn' : '$/Tn'}):
              </span>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="bg-white px-3 py-1.5 sm:py-2 rounded-lg border border-white/20 shadow-2xs text-right w-[130px] sm:w-[155px] flex flex-col justify-center">
                  <span className="text-sm sm:text-base font-black text-gray-800 leading-tight">
                    {result
                      ? moneda === 'USD'
                         ? formatUSDPrecise(result.canje.precioGrano / config.dolarBNA.compra)
                        : formatMoneyPrecise(result.canje.precioGrano)
                      : moneda === 'USD'
                        ? formatUSDPrecise(precioCalculadoUSD)
                        : formatMoneyPrecise(Number(precioPorTonelada || 0))}
                  </span>
                  {moneda === 'USD' && result && (
                    <span className="text-[10px] text-gray-400 font-semibold leading-tight">
                      ({formatMoneyPrecise(result.canje.precioGrano)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Retención IVA */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-semibold text-emerald-100">
                Ret. IVA (0%):
              </span>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="bg-white px-3 py-1.5 sm:py-2 rounded-lg border border-white/20 shadow-2xs text-right w-[130px] sm:w-[155px]">
                  <span className="text-sm sm:text-base font-black text-emerald-700">
                    $ 0,00 (0%)
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Retención Ganancias */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-semibold text-emerald-100">
                Ret. Ganancias (0%):
              </span>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="bg-white px-3 py-1.5 sm:py-2 rounded-lg border border-white/20 shadow-2xs text-right w-[130px] sm:w-[155px]">
                  <span className="text-sm sm:text-base font-black text-emerald-700">
                    $ 0,00 (0%)
                  </span>
                </div>
              </div>
            </div>

            {/* 4. IVA Cereal (+10.5%) */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-semibold text-emerald-100">
                IVA Cereal (+10.5%):
              </span>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="bg-white px-3 py-1.5 sm:py-2 rounded-lg border border-white/20 shadow-2xs text-right w-[130px] sm:w-[155px]">
                  <span className="text-sm sm:text-base font-black text-emerald-700">
                    + {result ? formatMoneyPrecise(result.canje.ivaCereal) : formatMoneyPrecise(Number(precioPorTonelada || 0) * 0.105)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sección inferior: Monto Final Disponible (TODO ENCUADRADO) + Total Toneladas */}
        <div className="pt-3 mt-3 border-t border-emerald-700/60 space-y-2.5">
          
          {/* Monto Final Disponible por Tn: TODO ENCUADRADO */}
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 shadow-xs flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-white">
              Monto Final Disponible / Tn:
            </span>
            <span className="text-base sm:text-lg font-black text-brand-gold-light">
              {result ? formatMoneyPrecise(result.canje.montoFinalPorTonelada) : '—'}
            </span>
          </div>

          {/* Total Toneladas a Entregar Box */}
          <div className="bg-white rounded-xl p-3 text-center shadow-xs border-2 border-brand-gold">
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-brand-green-dark block mb-0.5">
              Total Toneladas a Entregar:
            </span>
            <span className="text-2xl sm:text-3xl font-black text-brand-green-dark block leading-tight py-0.5">
              {result ? formatTn(result.canje.toneladasNecesarias) : '-- Tn'}
            </span>
            {!result && (
              <span className="text-[10.5px] text-emerald-800 font-semibold block">
                Ingresá el monto de la operación para calcular
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Botones de navegación en mobile */}
      {isMobile && (
        <div className="pt-3 mt-3 border-t border-emerald-700/60 flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMobileTab('normal')}
            className="flex-1 bg-white/15 hover:bg-white/25 text-white py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>Ver Venta Normal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('beneficio')}
            className="bg-brand-gold text-slate-950 py-2.5 px-3 rounded-xl font-black transition-all cursor-pointer"
          >
            Ver Ahorro
          </button>
        </div>
      )}
    </div>
  );

  const renderVentaNormalCard = (isMobile = false) => (
    <div className="rounded-2xl bg-slate-200/95 p-4 sm:p-5 shadow-md border border-slate-300 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-400" />

      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Header Columna 3 */}
          <div className="border-b border-slate-300 pb-3 mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800 leading-tight">
                Liquidación Normal
              </h2>
            </div>
          </div>

          {/* Filas de conceptos de Venta Normal: Etiquetas libres a la izquierda, Importes en recuadros alineados */}
          <div className="space-y-2.5 sm:space-y-3">
            
            {/* Precio Cereal */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-semibold text-slate-700">
                Precio ({moneda === 'USD' ? 'USD/Tn' : '$/Tn'}):
              </span>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="bg-white px-3 py-1.5 sm:py-2 rounded-lg border border-slate-300 shadow-2xs text-right w-[130px] sm:w-[155px] flex flex-col justify-center">
                  <span className="text-sm sm:text-base font-black text-slate-800 leading-tight">
                    {result
                      ? moneda === 'USD'
                        ? formatUSDPrecise(result.ventaNormal.precioGrano / config.dolarBNA.compra)
                        : formatMoneyPrecise(result.ventaNormal.precioGrano)
                      : moneda === 'USD'
                        ? formatUSDPrecise(precioCalculadoUSD)
                        : formatMoneyPrecise(Number(precioPorTonelada || 0))}
                  </span>
                  {moneda === 'USD' && result && (
                    <span className="text-[10px] text-gray-400 font-semibold leading-tight">
                      ({formatMoneyPrecise(result.ventaNormal.precioGrano)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Retención IVA SISA */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-semibold text-slate-700">
                Ret. IVA ({selectedSisaId === 1 ? '5%' : selectedSisaId === 2 ? '7%' : '8%'}):
              </span>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="bg-white px-3 py-1.5 sm:py-2 rounded-lg border border-slate-300 shadow-2xs text-right w-[130px] sm:w-[155px]">
                  <span className="text-sm sm:text-base font-black text-rose-600">
                    {result ? formatMoneyPrecise(result.ventaNormal.retencionIva) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Retención Ganancias SISA */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-semibold text-slate-700">
                Ret. Ganancias ({selectedSisaId === 1 ? '0%' : selectedSisaId === 2 ? '2%' : '15%'}):
              </span>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="bg-white px-3 py-1.5 sm:py-2 rounded-lg border border-slate-300 shadow-2xs text-right w-[130px] sm:w-[155px]">
                  <span className="text-sm sm:text-base font-black text-rose-600">
                    {result ? formatMoneyPrecise(result.ventaNormal.retencionGanancias) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Depósito CBU IVA */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-semibold text-slate-700">
                Dep. CBU IVA:
              </span>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="bg-white px-3 py-1.5 sm:py-2 rounded-lg border border-slate-300 shadow-2xs text-right w-[130px] sm:w-[155px]">
                  <span className="text-sm sm:text-base font-black text-amber-700">
                    {result ? formatMoneyPrecise(result.ventaNormal.depCbuIva) : '—'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sección inferior: Monto Final Disponible (TODO ENCUADRADO) + Total Toneladas */}
        <div className="pt-3 mt-3 border-t border-slate-300 space-y-2.5">
          
          {/* Monto Final Disponible por Tn: TODO ENCUADRADO */}
          <div className="bg-white p-3 rounded-xl border-2 border-slate-300 shadow-xs flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-slate-700">
              Monto Final Disponible / Tn:
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              {result ? formatMoneyPrecise(result.ventaNormal.montoFinalPorTonelada) : '—'}
            </span>
          </div>

          {/* Total Toneladas a Entregar Box */}
          <div className="bg-white border-2 border-slate-400 rounded-xl p-3 text-center shadow-xs">
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-600 block mb-0.5">
              Total Toneladas a Entregar:
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-tight py-0.5">
              {result ? formatTn(result.ventaNormal.toneladasNecesarias) : '-- Tn'}
            </span>
            {!result && (
              <span className="text-[10.5px] text-rose-600 font-semibold block">
                Cargá los parámetros para calcular
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Botones de navegación en mobile */}
      {isMobile && (
        <div className="pt-3 mt-3 border-t border-slate-300 flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMobileTab('canje')}
            className="flex-1 bg-brand-green hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>Ver Canje ADG</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('beneficio')}
            className="bg-slate-800 text-white py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer"
          >
            Ver Ahorro
          </button>
        </div>
      )}
    </div>
  );

  const renderBeneficioCard = (isMobile = false) => (
    <div 
      id="resumen-beneficio-productor-card"
      className="rounded-2xl bg-emerald-50/90 text-gray-900 p-4 sm:p-5 shadow-xs border-2 border-emerald-500/80 relative overflow-hidden"
    >
      {/* Brillo sutil de fondo muy tenue */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        
        {/* Fila principal con recuadros idénticos en ancho, estructura y tamaño de valor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          
          {/* Lado Izquierdo: Ahorro en Toneladas */}
          <div className="bg-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border border-emerald-300/90 shadow-2xs w-full flex flex-col justify-center">
            <span className="text-[10px] sm:text-[11px] uppercase font-black tracking-wider text-emerald-800 block">
              Ahorrás:
            </span>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-950 tracking-tight leading-none my-1">
              {result ? formatTn(result.ventaja.ahorroToneladas) : '0,00 Tn'}
            </div>
          </div>

          {/* Lado Derecho: Ahorro Económico Estimado */}
          <div className="bg-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border border-emerald-300/90 shadow-2xs w-full flex flex-col justify-center">
            <span className="text-[10px] sm:text-[11px] uppercase font-black tracking-wider text-emerald-800 block">
              Ahorro Económico Estimado:
            </span>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-950 tracking-tight leading-none my-1">
              {result
                ? moneda === 'USD'
                  ? formatUSD(result.ventaja.ahorroMonto / config.dolarBNA.compra)
                  : formatMoney(result.ventaja.ahorroMonto)
                : '$ 0'}
            </div>
          </div>

        </div>

        {/* Abajo centrado: Porcentaje de Ventaja */}
        {result && (
          <div className="mt-3.5 pt-2.5 border-t border-emerald-200/80 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-emerald-800 font-black text-xs sm:text-sm border border-emerald-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              +{result.ventaja.porcentajeVentaja.toFixed(2)}% de ventaja
            </span>
          </div>
        )}

      </div>
    </div>
  );

  return (
    <div id="canje-simulator-page" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans w-full overflow-x-clip relative">
      {/* Fondo temático con fondo_simu.jfif, mayor presencia para contrastar con las tarjetas */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.24]"
          style={{ backgroundImage: `url(${fondoSimu})` }}
        />
        {/* Degradado equilibrado que resalta los bloques de parámetros y resultados */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/60 via-slate-50/15 to-slate-100/75" />
      </div>
      
      {/* ============================================================ */}
      {/* HEADER PRINCIPAL: Marca ADG a la izquierda y Dólar BNA derecha*/}
      {/* ============================================================ */}
      <header id="simulator-header" className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo ADG + Línea divisoria finita + Título Simulador de Canje de Granos */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
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
              <div className="sm:hidden">
                <Logo lightBg={true} height={32} />
              </div>
              <div className="hidden sm:block">
                <Logo lightBg={true} height={42} />
              </div>
            </a>

            <div className="h-5 sm:h-7 w-px bg-gray-200 shrink-0" />

            <h1 className="text-xs sm:text-base md:text-lg font-black text-gray-800 tracking-tight truncate">
              <span className="sm:hidden">Simulador Canje</span>
              <span className="hidden sm:inline">Simulador de Canje de Granos</span>
            </h1>
          </div>

          {/* Margen derecho: Cotización Dólar BNA Divisa (Compra y Venta) adaptado chiquito en mobile */}
          <div 
            id="header-dolar-bna" 
            className="flex items-center space-x-1.5 sm:space-x-3.5 bg-slate-50 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-gray-200 shadow-2xs text-[10px] sm:text-xs shrink-0"
          >
            <div className="text-left flex items-center space-x-1 sm:space-x-1.5">
              <span className="text-[9px] sm:text-[11px] font-extrabold text-cyan-900 uppercase tracking-tight leading-tight">
                <span className="sm:hidden">BNA</span>
                <span className="hidden sm:inline">BNA DIVISA</span>
              </span>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dolarLiveStatus === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            </div>
            <div className="h-4 sm:h-5 w-px bg-gray-200" />
            <div className="flex items-center space-x-1.5 sm:space-x-3.5 text-[10px] sm:text-xs">
              <div className="text-gray-700 flex items-center">
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 mr-0.5 sm:mr-1">
                  <span className="sm:hidden">C:</span>
                  <span className="hidden sm:inline">COMPRA:</span>
                </span>
                <span className="font-black text-gray-900">${config.dolarBNA.compra}</span>
              </div>
              <div className="text-gray-700 flex items-center">
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 mr-0.5 sm:mr-1">
                  <span className="sm:hidden">V:</span>
                  <span className="hidden sm:inline">VENTA:</span>
                </span>
                <span className="font-black text-gray-900">${config.dolarBNA.venta}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Barra de Pizarras: Selector de Plaza a la izquierda y 3 Granos ocupando todo el ancho */}
        <div id="simulator-ticker" className="bg-slate-50/90 border-t border-gray-200/80 py-2.5 sm:py-3">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 w-full">
              
              {/* Selector de Plaza de Referencia: Pizarras Rosario / Bahía Blanca */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5 select-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  Pizarras:
                </span>
                <div id="selector-plaza-mercado" className="flex items-center bg-gray-200/70 p-1 rounded-xl border border-gray-200 text-xs">
                  <button
                    type="button"
                    onClick={() => handleTogglePlaza('rosario')}
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

              {/* Los 3 Granos Principales distribuidos en Grid para ocupar todo el ancho disponible */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3.5 flex-grow w-full">
                {topGrains.map((grain) => {
                  const isSelected = grain.id === selectedGrainId;
                  const grainPriceARS = plaza === 'bahia_blanca' ? grain.prices.bahiaARS : grain.prices.rosarioARS;
                  const grainPriceUSD = grainPriceARS / config.dolarBNA.compra;
                  return (
                    <button
                      key={grain.id}
                      onClick={() => handleSelectGrain(grain.id)}
                      className={`group flex flex-col sm:flex-row items-center justify-center sm:justify-between px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-[0.98] w-full text-center sm:text-left ${
                        isSelected
                          ? 'bg-brand-green text-white border-brand-green shadow-md ring-2 ring-brand-green/30'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-brand-green/50 hover:bg-emerald-50/40'
                      }`}
                    >
                      {/* Lado izquierdo: Ícono + Nombre del grano */}
                      <div className="flex items-center space-x-1 sm:space-x-3 min-w-0">
                        <div className={`shrink-0 transition-transform group-hover:scale-105 flex items-center justify-center ${
                          isSelected 
                            ? 'text-brand-gold-light' 
                            : 'text-brand-green'
                        }`}>
                          <GrainIcon type={grain.id} className="w-5 h-5 sm:w-11 sm:h-11" strokeWidth={1.8} />
                        </div>
                        
                        <span className="font-black uppercase text-[11px] sm:text-base tracking-tight sm:tracking-wide truncate">
                          {grain.shortName}
                        </span>
                      </div>
                      
                      {/* Lado derecho: Precio del grano */}
                      <span className={`text-[10.5px] sm:text-base font-black shrink-0 sm:pl-2 ${
                        isSelected ? 'text-brand-gold-light' : 'text-brand-green'
                      }`}>
                        {moneda === 'USD'
                          ? `USD ${Math.round(grainPriceUSD).toLocaleString('es-AR')}`
                          : `$ ${Math.round(grainPriceARS).toLocaleString('es-AR')}`}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* CONTENIDO PRINCIPAL: Simulador de Canje vs Venta Tradicional  */}
      {/* ============================================================ */}
      <main className="relative z-10 flex-grow max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-8 sm:pb-10">
        
        {/* ======================================================== */}
        {/* VISTA MOBILE DEDICADA: Experiencia tipo App (< lg)        */}
        {/* ======================================================== */}
        <div className="lg:hidden space-y-3.5">
          
          {/* 1. Tarjeta Hero de Ahorro Rápido en Vivo */}
          <div 
            onClick={() => setMobileTab("beneficio")}
            className="bg-emerald-50/95 text-gray-900 p-3 sm:p-3.5 rounded-2xl border-2 border-emerald-500/70 shadow-xs cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800 block leading-tight mb-1">
                  Ahorro al Productor:
                </span>
                <div className="bg-white px-2.5 py-1 sm:py-1.5 rounded-xl border border-emerald-300/80 shadow-2xs inline-flex items-baseline gap-1.5 max-w-full truncate">
                  {result ? (
                    <>
                      <span className="text-xs font-bold text-gray-600">Ahorrás:</span>
                      <span className="text-sm sm:text-base font-black text-emerald-700 leading-tight">
                        {formatTn(result.ventaja.ahorroToneladas)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-gray-600">Ingresá monto a canjear</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 bg-white px-3 py-1.5 rounded-xl border border-emerald-300/80 shadow-2xs">
                <div className="text-sm sm:text-base font-black text-emerald-950 leading-tight">
                  {result ? (moneda === "USD" ? formatUSD(result.ventaja.ahorroMonto / config.dolarBNA.compra) : formatMoney(result.ventaja.ahorroMonto)) : "$ 0"}
                </div>
                {result && (
                  <span className="text-[10px] font-bold text-emerald-700 block">
                    +{result.ventaja.porcentajeVentaja.toFixed(1)}% ventaja
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Barra de Navegación Segmentada (Pestañas estilo App nativa) */}
          <div className="grid grid-cols-4 gap-1 bg-slate-200/90 p-1 rounded-xl text-xs font-black shadow-inner">
            <button
              type="button"
              onClick={() => setMobileTab("parametros")}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                mobileTab === "parametros"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-700 hover:text-black"
              }`}
            >
              Parámetros
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("canje")}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                mobileTab === "canje"
                  ? "bg-brand-green text-white shadow-xs"
                  : "text-slate-700 hover:text-black"
              }`}
            >
              Canje ADG
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("normal")}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                mobileTab === "normal"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "text-slate-700 hover:text-black"
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("beneficio")}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                mobileTab === "beneficio"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-black"
              }`}
            >
              Ahorro
            </button>
          </div>

          {/* 3. Contenido de la pestaña activa en Mobile */}
          <div>
            {mobileTab === "parametros" && renderParametrosCard(true)}
            {mobileTab === "canje" && renderCanjeCard(true)}
            {mobileTab === "normal" && renderVentaNormalCard(true)}
            {mobileTab === "beneficio" && renderBeneficioCard(true)}
          </div>

        </div>

        {/* ======================================================== */}
        {/* VISTA DESKTOP: Tablero Completo de 3 Columnas (>= lg)    */}
        {/* ======================================================== */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          <div className="lg:col-span-4">
            {renderParametrosCard(false)}
          </div>
          <div className="lg:col-span-8 flex flex-col justify-between gap-4 h-full">
            <div className="grid grid-cols-2 gap-4 items-stretch flex-1">
              {renderCanjeCard(false)}
              {renderVentaNormalCard(false)}
            </div>
            {renderBeneficioCard(false)}
          </div>
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

      {/* Modal de Cotización y Exportación PDF / WhatsApp */}
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
