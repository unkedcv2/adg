/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GrainItem {
  id: string;
  name: string;
  shortName: string;
  category: 'oleaginosa' | 'cereal';
  priceARS: number; // Precio por tonelada en Pesos Argentinos
  priceUSD: number; // Precio por tonelada en Dólares Estadounidenses
  badgeColor?: string;
}

export interface DolarBNA {
  compra: number;
  venta: number;
  fecha: string;
}

export interface SisaScoreOption {
  id: 1 | 2 | 3;
  name: string;
  statusLabel: string;
  retencionIvaPercent: number;
  retencionGananciasPercent: number;
  description: string;
}

export interface CanjeConfigData {
  dolarBNA: DolarBNA;
  grains: GrainItem[];
  sisaOptions: SisaScoreOption[];
  ivaGranosAlicuota: number; // 0.105 (10.5%)
  impuestoChequeAlicuota: number; // 0.012 (1.2%)
}

export const TOP_GRAIN_IDS = ['soja', 'maiz', 'trigo', 'girasol'];

// Datos predeterminados de mercado (cotizaciones de pizarra y Dólar BNA)
export const DEFAULT_CANJE_CONFIG: CanjeConfigData = {
  dolarBNA: {
    compra: 1499,
    venta: 1508,
    fecha: "06/09/2026"
  },
  grains: [
    {
      id: "maiz",
      name: "MAÍZ",
      shortName: "Maíz",
      category: "cereal",
      priceARS: 285560,
      priceUSD: 189.36,
      badgeColor: "amber"
    },
    {
      id: "soja",
      name: "SOJA",
      shortName: "Soja",
      category: "oleaginosa",
      priceARS: 560000,
      priceUSD: 371.35,
      badgeColor: "emerald"
    },
    {
      id: "trigo",
      name: "TRIGO",
      shortName: "Trigo",
      category: "cereal",
      priceARS: 350000,
      priceUSD: 232.09,
      badgeColor: "orange"
    },
    {
      id: "girasol",
      name: "GIRASOL",
      shortName: "Girasol",
      category: "oleaginosa",
      priceARS: 390000,
      priceUSD: 258.62,
      badgeColor: "yellow"
    },
    {
      id: "sorgo",
      name: "SORGO",
      shortName: "Sorgo",
      category: "cereal",
      priceARS: 245000,
      priceUSD: 162.46,
      badgeColor: "red"
    },
    {
      id: "arveja_verde",
      name: "ARVEJA VERDE",
      shortName: "Arveja Verde",
      category: "oleaginosa",
      priceARS: 480000,
      priceUSD: 318.30,
      badgeColor: "green"
    },
    {
      id: "cebada",
      name: "CEBADA",
      shortName: "Cebada",
      category: "cereal",
      priceARS: 310000,
      priceUSD: 205.57,
      badgeColor: "sky"
    },
    {
      id: "mani",
      name: "MANÍ",
      shortName: "Maní",
      category: "oleaginosa",
      priceARS: 890000,
      priceUSD: 590.18,
      badgeColor: "stone"
    }
  ],
  sisaOptions: [
    {
      id: 1,
      name: "Situación 1",
      statusLabel: "Riesgo Bajo / Irrestricto",
      retencionIvaPercent: 5.0,
      retencionGananciasPercent: 0.0,
      description: "Estado activo sin inconsistencias. Retención IVA 5%, Retención Ganancias 0%."
    },
    {
      id: 2,
      name: "Situación 2",
      statusLabel: "Riesgo Medio / Sujeto a Verificación",
      retencionIvaPercent: 8.0,
      retencionGananciasPercent: 2.0,
      description: "Sujeto a verificación. Retención IVA 8%, Retención Ganancias 2%."
    },
    {
      id: 3,
      name: "Situación 3",
      statusLabel: "Riesgo Alto / Suspendido",
      retencionIvaPercent: 10.5,
      retencionGananciasPercent: 15.0,
      description: "Estado suspendido o no activo. Retención total IVA 10.5%, Retención Ganancias 15%."
    }
  ],
  ivaGranosAlicuota: 0.105,
  impuestoChequeAlicuota: 0.012
};

export interface CalculationResult {
  valorOperacion: number;
  moneda: 'ARS' | 'USD';
  grano: GrainItem;
  sisa: SisaScoreOption;
  tipoCambioUtilizado: number;
  
  // Precios base por Tn
  precioBaseTn: number;
  ivaMontoTn: number;

  // Liquidación por Canje ADG
  canje: {
    precioCerealTn: number;
    ivaLiquidacionTn: number;
    retencionIvaTn: number;
    retencionGananciasTn: number;
    precioFinalTn: number;
    totalToneladas: number;
  };

  // Liquidación Normal (Venta tradicional de cereal)
  normal: {
    precioCerealTn: number;
    ivaLiquidacionTn: number;
    retencionIvaTn: number;
    retencionGananciasTn: number;
    precioFinalTn: number;
    totalToneladas: number;
  };

  // Beneficio / Ahorro
  ahorroToneladas: number;
  ahorroMonto: number;
  ahorroPorcentaje: number;
  ahorroImpuestoCheque: number;
  ahorroFinancieroTotal: number;
}

export function calculateCanje({
  valorOperacion,
  moneda,
  grano,
  sisa,
  config = DEFAULT_CANJE_CONFIG
}: {
  valorOperacion: number;
  moneda: 'ARS' | 'USD';
  grano: GrainItem;
  sisa: SisaScoreOption;
  config?: CanjeConfigData;
}): CalculationResult {
  const safeValor = Math.max(0, valorOperacion || 0);
  const tipoCambio = config.dolarBNA.venta || 1508;

  // Precio base por tonelada en la moneda elegida
  const precioBaseTn = moneda === 'ARS'
    ? grano.priceARS
    : grano.priceUSD > 0
      ? grano.priceUSD
      : grano.priceARS / tipoCambio;

  const ivaAlicuota = config.ivaGranosAlicuota; // 10.5%
  const ivaMontoTn = precioBaseTn * ivaAlicuota;

  // 1. CANJE DE GRANOS ADG (Régimen Especial RG AFIP 4310/2118)
  // En canje total, no aplican retenciones de IVA ni de Ganancias
  const canjeRetIvaTn = 0;
  const canjeRetGananciasTn = 0;
  const canjePrecioFinalTn = precioBaseTn + ivaMontoTn - canjeRetIvaTn - canjeRetGananciasTn;
  const canjeTotalTn = canjePrecioFinalTn > 0 ? safeValor / canjePrecioFinalTn : 0;

  // 2. LIQUIDACIÓN NORMAL (Venta disponible tradicional sujeta a retenciones SISA)
  const normalRetIvaTn = precioBaseTn * (sisa.retencionIvaPercent / 100);
  const normalRetGananciasTn = precioBaseTn * (sisa.retencionGananciasPercent / 100);
  const normalPrecioFinalTn = precioBaseTn + ivaMontoTn - normalRetIvaTn - normalRetGananciasTn;
  const normalTotalTn = normalPrecioFinalTn > 0 ? safeValor / normalPrecioFinalTn : 0;

  // 3. AHORRO Y BENEFICIO
  const ahorroToneladas = Math.max(0, normalTotalTn - canjeTotalTn);
  const ahorroMonto = ahorroToneladas * precioBaseTn;
  const ahorroPorcentaje = normalTotalTn > 0 ? ((normalTotalTn - canjeTotalTn) / normalTotalTn) * 100 : 0;
  const ahorroImpuestoCheque = safeValor * config.impuestoChequeAlicuota;
  const ahorroFinancieroTotal = ahorroMonto + ahorroImpuestoCheque;

  return {
    valorOperacion: safeValor,
    moneda,
    grano,
    sisa,
    tipoCambioUtilizado: tipoCambio,
    precioBaseTn,
    ivaMontoTn,
    canje: {
      precioCerealTn: precioBaseTn,
      ivaLiquidacionTn: ivaMontoTn,
      retencionIvaTn: canjeRetIvaTn,
      retencionGananciasTn: canjeRetGananciasTn,
      precioFinalTn: canjePrecioFinalTn,
      totalToneladas: canjeTotalTn
    },
    normal: {
      precioCerealTn: precioBaseTn,
      ivaLiquidacionTn: ivaMontoTn,
      retencionIvaTn: normalRetIvaTn,
      retencionGananciasTn: normalRetGananciasTn,
      precioFinalTn: normalPrecioFinalTn,
      totalToneladas: normalTotalTn
    },
    ahorroToneladas,
    ahorroMonto,
    ahorroPorcentaje,
    ahorroImpuestoCheque,
    ahorroFinancieroTotal
  };
}

// Utilidad para persistir y cargar configuración personalizada (por ejemplo de un Excel o archivo subido)
const STORAGE_KEY = 'adg_canje_custom_config_v2';

export function loadStoredCanjeConfig(): CanjeConfigData {
  if (typeof window === 'undefined') return DEFAULT_CANJE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CANJE_CONFIG;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.grains) && parsed.grains.length >= 8 && parsed.dolarBNA) {
      return parsed;
    }
  } catch (e) {
    console.error('Error loading stored canje config', e);
  }
  return DEFAULT_CANJE_CONFIG;
}

export function saveStoredCanjeConfig(config: CanjeConfigData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving canje config', e);
  }
}

export function resetStoredCanjeConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error resetting canje config', e);
  }
}
