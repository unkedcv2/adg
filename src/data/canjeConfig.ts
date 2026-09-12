/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modulo de Configuracion y Motor de Calculo de Canje Agro (ADG)
 * Basado al 100% en la formula y estructura oficial de Simulador_Canje_Agro.xlsx
 */

import { getFreightRate, FreightLookupResult } from './freightRates';

export type PlazaMercado = 'rosario' | 'bahia_blanca';

export interface GrainMarketPrices {
  rosarioARS: number;
  bahiaARS: number;
  precioUSD: number;
}

export interface GrainItem {
  id: string;
  name: string;
  shortName: string;
  category: 'oleaginosa' | 'cereal';
  prices: GrainMarketPrices;
  badgeColor?: string;
}

export interface DolarBNA {
  compra: number;
  venta: number;
  fecha: string;
  fuente?: string;
}

export interface SisaScoreOption {
  id: 1 | 2 | 3;
  name: string;
  statusLabel: string;
  retencionIvaVentaPercent: number;
  retencionGananciasVentaPercent: number;
  description: string;
}

export interface ParametrosImpositivos {
  ivaCerealAlicuota: number; // 0.105 (10.5%)
  comisionAlicuota: number; // 0.03 (3.0%)
  selladoAlicuota: number; // 0.0125 (1.25% sobre Precio + IVA)
  percepcionIibbAlicuota: number; // 0.0075 (0.75% si aplica)
  
  // Retenciones Venta Normal segun SISA (RG AFIP 4310 / 4325)
  sisa1RetIva: number; // 0.05
  sisa1RetGan: number; // 0.00
  sisa2RetIva: number; // 0.07
  sisa2RetGan: number; // 0.02
  sisa3RetIva: number; // 0.08
  sisa3RetGan: number; // 0.15
}

export const PARAMETROS_EXCEL: ParametrosImpositivos = {
  ivaCerealAlicuota: 0.105,
  comisionAlicuota: 0.03,
  selladoAlicuota: 0.0125,
  percepcionIibbAlicuota: 0.0075,
  sisa1RetIva: 0.05,
  sisa1RetGan: 0.00,
  sisa2RetIva: 0.07,
  sisa2RetGan: 0.02,
  sisa3RetIva: 0.08,
  sisa3RetGan: 0.15
};

export const SISA_OPTIONS: SisaScoreOption[] = [
  {
    id: 1,
    name: "Estado 1",
    statusLabel: "Riesgo Bajo / Irrestricto",
    retencionIvaVentaPercent: 5.0,
    retencionGananciasVentaPercent: 0.0,
    description: "Estado activo sin inconsistencias. Venta normal: Ret. IVA 5%, Ret. Ganancias 0%. En Canje: 0% retenciones."
  },
  {
    id: 2,
    name: "Estado 2",
    statusLabel: "Riesgo Medio / Sujeto a Verificación",
    retencionIvaVentaPercent: 7.0,
    retencionGananciasVentaPercent: 2.0,
    description: "Sujeto a verificación. Venta normal: Ret. IVA 7%, Ret. Ganancias 2%. En Canje: 0% retenciones."
  },
  {
    id: 3,
    name: "Estado 3",
    statusLabel: "Riesgo Alto / Suspendido",
    retencionIvaVentaPercent: 8.0,
    retencionGananciasVentaPercent: 15.0,
    description: "Inconsistencias fiscales. Venta normal: Ret. IVA 8%, Ret. Ganancias 15%. En Canje: alícuota manual si aplica."
  }
];

export const TOP_GRAIN_IDS = ['soja', 'maiz', 'trigo', 'girasol'];

export const INITIAL_GRAINS: GrainItem[] = [
  {
    id: "soja",
    name: "SOJA",
    shortName: "Soja",
    category: "oleaginosa",
    prices: {
      rosarioARS: 520000,
      bahiaARS: 518000,
      precioUSD: 344.82
    },
    badgeColor: "emerald"
  },
  {
    id: "maiz",
    name: "MAÍZ",
    shortName: "Maíz",
    category: "cereal",
    prices: {
      rosarioARS: 285560,
      bahiaARS: 288000,
      precioUSD: 189.36
    },
    badgeColor: "amber"
  },
  {
    id: "trigo",
    name: "TRIGO",
    shortName: "Trigo",
    category: "cereal",
    prices: {
      rosarioARS: 350000,
      bahiaARS: 345000,
      precioUSD: 232.09
    },
    badgeColor: "orange"
  },
  {
    id: "girasol",
    name: "GIRASOL",
    shortName: "Girasol",
    category: "oleaginosa",
    prices: {
      rosarioARS: 390000,
      bahiaARS: 395000,
      precioUSD: 258.62
    },
    badgeColor: "yellow"
  },
  {
    id: "sorgo",
    name: "SORGO",
    shortName: "Sorgo",
    category: "cereal",
    prices: {
      rosarioARS: 245000,
      bahiaARS: 240000,
      precioUSD: 162.46
    },
    badgeColor: "red"
  },
  {
    id: "cebada",
    name: "CEBADA",
    shortName: "Cebada",
    category: "cereal",
    prices: {
      rosarioARS: 310000,
      bahiaARS: 315000,
      precioUSD: 205.57
    },
    badgeColor: "sky"
  },
  {
    id: "arveja_verde",
    name: "ARVEJA VERDE",
    shortName: "Arveja Verde",
    category: "oleaginosa",
    prices: {
      rosarioARS: 480000,
      bahiaARS: 475000,
      precioUSD: 318.30
    },
    badgeColor: "green"
  },
  {
    id: "mani",
    name: "MANÍ",
    shortName: "Maní",
    category: "oleaginosa",
    prices: {
      rosarioARS: 890000,
      bahiaARS: 885000,
      precioUSD: 590.18
    },
    badgeColor: "stone"
  }
];

export interface CanjeConfigData {
  dolarBNA: DolarBNA;
  grains: GrainItem[];
  sisaOptions: SisaScoreOption[];
  parametros: ParametrosImpositivos;
  plazaActiva: PlazaMercado;
  ultimaActualizacionPizarras: string;
}

export const DEFAULT_CANJE_CONFIG: CanjeConfigData = {
  dolarBNA: {
    compra: 1499,
    venta: 1508,
    fecha: "09/09/2026",
    fuente: "Banco Nación"
  },
  grains: INITIAL_GRAINS,
  sisaOptions: SISA_OPTIONS,
  parametros: PARAMETROS_EXCEL,
  plazaActiva: 'rosario',
  ultimaActualizacionPizarras: "09/09/2026 17:00 hs (Cierre Cámara Arbitral)"
};

/**
 * Servicio para consultar el Dolar BNA en tiempo real mediante API publica argentina.
 */
export async function fetchLiveDolarBNA(): Promise<DolarBNA | null> {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/oficial', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.venta) {
      const fechaObj = data.fechaActualizacion ? new Date(data.fechaActualizacion) : new Date();
      const fechaStr = fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return {
        compra: Number(data.compra) || 1499,
        venta: Number(data.venta) || 1508,
        fecha: fechaStr,
        fuente: "Dólar Banco Nación (Oficial)"
      };
    }
  } catch (err) {
    console.warn("No se pudo obtener el Dolar BNA en vivo, usando datos de respaldo.", err);
  }
  return null;
}

export interface LivePizarrasResponse {
  status: string;
  source: string;
  fechaPizarra: string;
  dolarReferencia?: number;
  grains: Record<string, { rosarioARS: number; bahiaARS: number; fecha?: string }>;
  updatedAt: string;
}

/**
 * Servicio para consultar las cotizaciones de Pizarras Oficiales en tiempo real
 * desde el backend de la aplicación (/api/pizarras).
 */
export async function fetchLivePizarras(): Promise<LivePizarrasResponse | null> {
  try {
    const res = await fetch('/api/pizarras', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data: LivePizarrasResponse = await res.json();
    return data;
  } catch (err) {
    console.warn("No se pudo obtener las cotizaciones de pizarras en vivo:", err);
    return null;
  }
}

// -------------------------------------------------------------
// MOTOR DE CÁLCULO IDÉNTICO AL EXCEL
// -------------------------------------------------------------

export interface ConceptoDesglose {
  precioGrano: number;
  ivaCereal: number;
  comision: number;
  ivaComision: number;
  sellado: number;
  retencionIva: number;
  retencionGanancias: number;
  percepcionIibb: number;
  flete: number;
  ivaFlete: number;
  depCbuIva: number;
  montoFinalPorTonelada: number;
  toneladasNecesarias: number;
}

export interface CanjeCalculationInput {
  montoACanjear: number; // Monto de la operacion ($)
  precioPorTonelada: number; // Precio unitario ($/t) editable a mano
  sisaScore: 1 | 2 | 3;
  correspondeIibbBsAs: boolean; // Si / No
  retencionIvaManualSisa3?: number; // % manual (ej: 8 para 8%)
  retencionGananciasManualSisa3?: number; // % manual (ej: 15 para 15%)
  kilometrosFlete: number; // km (0 si no aplica)
  granoNombre?: string;
  plazaSeleccionada?: PlazaMercado;
}

export interface CanjeDetailedResult {
  input: CanjeCalculationInput;
  fleteInfo: FreightLookupResult;
  auxiliares: {
    ivaCerealMonto: number;
    comisionMonto: number;
    ivaComisionMonto: number;
    selladoMonto: number;
    percepcionIibbMonto: number;
    fleteMonto: number;
    ivaFleteMonto: number;
    baseRetencionIva: number;
    alicuotaRetIvaVenta: number;
    alicuotaRetGananciasVenta: number;
  };
  canje: ConceptoDesglose;
  ventaNormal: ConceptoDesglose;
  ventaja: {
    ahorroToneladas: number;
    ahorroMonto: number;
    porcentajeVentaja: number;
    resumenTexto: string;
    convieneCanje: boolean;
  };
}

/**
 * Ejecuta el calculo comparativo replicando celda por celda la hoja "Simulador" del Excel.
 */
export function calculateCanjeExactExcel(
  input: CanjeCalculationInput,
  parametros: ParametrosImpositivos = PARAMETROS_EXCEL
): CanjeDetailedResult {
  const monto = Math.max(0, input.montoACanjear || 0);
  const precio = Math.max(0, input.precioPorTonelada || 0);
  const sisa = input.sisaScore || 2;
  const iibbAplica = Boolean(input.correspondeIibbBsAs);
  const km = Math.max(0, input.kilometrosFlete || 0);

  // 1. Tarifa de flete segun kilometros (Hoja 'Tarifas de Flete')
  const fleteInfo = getFreightRate(km);
  const fleteMonto = fleteInfo.ratePerTon;

  // 2. Calculos auxiliares (Filas 36 a 45 del Excel)
  const ivaCerealMonto = precio * parametros.ivaCerealAlicuota; // B36
  const comisionMonto = precio * parametros.comisionAlicuota; // B37
  const ivaComisionMonto = comisionMonto * parametros.ivaCerealAlicuota; // B38
  const selladoMonto = (precio + ivaCerealMonto) * parametros.selladoAlicuota; // B39
  const percepcionIibbMonto = iibbAplica ? precio * parametros.percepcionIibbAlicuota : 0; // B40
  const ivaFleteMonto = fleteMonto * parametros.ivaCerealAlicuota; // B42

  // Base Retencion IVA = precio - comision - flete ($) (B43)
  const baseRetencionIva = Math.max(0, precio - comisionMonto - fleteMonto);

  // Alicuotas segun SISA para Venta Normal (B44 y B45)
  let alicuotaRetIvaVenta = parametros.sisa2RetIva;
  let alicuotaRetGananciasVenta = parametros.sisa2RetGan;

  if (sisa === 1) {
    alicuotaRetIvaVenta = parametros.sisa1RetIva;
    alicuotaRetGananciasVenta = parametros.sisa1RetGan;
  } else if (sisa === 3) {
    alicuotaRetIvaVenta = parametros.sisa3RetIva;
    alicuotaRetGananciasVenta = parametros.sisa3RetGan;
  }

  // 3. DESGLOSE CANJE (Columna C)
  // En Canje, SISA 1 y 2 no tienen Retenciones (se compensan facturas)
  // SISA 3 si tiene si el operador carga % manual (B10 y B11)
  let canjeRetIva = 0;
  let canjeRetGanancias = 0;

  if (sisa === 3) {
    const manualIvaPct = Math.max(0, Number(input.retencionIvaManualSisa3) || 0);
    const manualGanPct = Math.max(0, Number(input.retencionGananciasManualSisa3) || 0);
    canjeRetIva = baseRetencionIva * (manualIvaPct / 100);
    canjeRetGanancias = precio * (manualGanPct / 100);
  }

  // Monto final Canje (C29 = SUM(C18:C27))
  const canjeMontoFinalTn =
    precio +
    ivaCerealMonto -
    comisionMonto -
    ivaComisionMonto -
    selladoMonto -
    canjeRetIva -
    canjeRetGanancias -
    percepcionIibbMonto -
    fleteMonto -
    ivaFleteMonto;

  const canjeTnNecesarias = canjeMontoFinalTn > 0 && monto > 0 ? monto / canjeMontoFinalTn : 0;

  const canje: ConceptoDesglose = {
    precioGrano: precio,
    ivaCereal: ivaCerealMonto,
    comision: -comisionMonto,
    ivaComision: -ivaComisionMonto,
    sellado: -selladoMonto,
    retencionIva: -canjeRetIva,
    retencionGanancias: -canjeRetGanancias,
    percepcionIibb: -percepcionIibbMonto,
    flete: -fleteMonto,
    ivaFlete: -ivaFleteMonto,
    depCbuIva: 0,
    montoFinalPorTonelada: canjeMontoFinalTn,
    toneladasNecesarias: canjeTnNecesarias
  };

  // 4. DESGLOSE VENTA NORMAL (Columna D)
  const ventaRetIva = baseRetencionIva * alicuotaRetIvaVenta; // D23
  const ventaRetGanancias = precio * alicuotaRetGananciasVenta; // D24

  // Dep CBU IVA: = +(D19 + D21 + D27) + D23 (en el Excel D21, D27, D23 son negativos)
  // Es decir: (ivaCerealMonto - ivaComisionMonto - ivaFleteMonto) - ventaRetIva
  const ventaDepCbuIva = Math.max(0, (ivaCerealMonto - ivaComisionMonto - ivaFleteMonto) - ventaRetIva);

  // Subtotal suma de rubros antes de CBU
  const ventaSubtotalRubros =
    precio +
    ivaCerealMonto -
    comisionMonto -
    ivaComisionMonto -
    selladoMonto -
    ventaRetIva -
    ventaRetGanancias -
    percepcionIibbMonto -
    fleteMonto -
    ivaFleteMonto;

  // Monto final Venta Normal (D29 = SUM(D18:D27) - D28)
  const ventaMontoFinalTn = ventaSubtotalRubros - ventaDepCbuIva;

  const ventaTnNecesarias = ventaMontoFinalTn > 0 && monto > 0 ? monto / ventaMontoFinalTn : 0;

  const ventaNormal: ConceptoDesglose = {
    precioGrano: precio,
    ivaCereal: ivaCerealMonto,
    comision: -comisionMonto,
    ivaComision: -ivaComisionMonto,
    sellado: -selladoMonto,
    retencionIva: -ventaRetIva,
    retencionGanancias: -ventaRetGanancias,
    percepcionIibb: -percepcionIibbMonto,
    flete: -fleteMonto,
    ivaFlete: -ivaFleteMonto,
    depCbuIva: ventaDepCbuIva,
    montoFinalPorTonelada: ventaMontoFinalTn,
    toneladasNecesarias: ventaTnNecesarias
  };

  // 5. VENTAJAS Y AHORROS (Fila 30 a 33 del Excel)
  const ahorroTn = Math.max(0, ventaTnNecesarias - canjeTnNecesarias);
  const ahorroMonto = ahorroTn * precio;
  const porcentajeVentaja = canjeTnNecesarias > 0 ? ((ventaTnNecesarias / canjeTnNecesarias) - 1) * 100 : 0;
  const convieneCanje = ventaTnNecesarias > canjeTnNecesarias;

  let resumenTexto = "Los dos esquemas piden la misma cantidad de toneladas.";
  if (convieneCanje) {
    const tnFormat = ahorroTn.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
    resumenTexto = `Conviene el CANJE: entregás ${tnFormat} t menos que con la Venta Normal.`;
  } else if (canjeTnNecesarias > ventaTnNecesarias) {
    const diff = (canjeTnNecesarias - ventaTnNecesarias).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
    resumenTexto = `Conviene la VENTA NORMAL: entregás ${diff} t menos que con el Canje.`;
  }

  return {
    input,
    fleteInfo,
    auxiliares: {
      ivaCerealMonto,
      comisionMonto,
      ivaComisionMonto,
      selladoMonto,
      percepcionIibbMonto,
      fleteMonto,
      ivaFleteMonto,
      baseRetencionIva,
      alicuotaRetIvaVenta,
      alicuotaRetGananciasVenta
    },
    canje,
    ventaNormal,
    ventaja: {
      ahorroToneladas: ahorroTn,
      ahorroMonto,
      porcentajeVentaja,
      resumenTexto,
      convieneCanje
    }
  };
}

// -------------------------------------------------------------
// PERSISTENCIA LOCAL (Configuracion y Pizarras personalizadas)
// -------------------------------------------------------------

const STORAGE_KEY = 'adg_canje_excel_config_v3';

export function loadStoredCanjeConfig(): CanjeConfigData {
  if (typeof window === 'undefined') return DEFAULT_CANJE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CANJE_CONFIG;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.grains) && parsed.grains.length >= 8 && parsed.dolarBNA) {
      return {
        ...DEFAULT_CANJE_CONFIG,
        ...parsed,
        parametros: {
          ...PARAMETROS_EXCEL,
          ...(parsed.parametros || {})
        }
      };
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
