/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wheat } from 'lucide-react';

interface GrainIconProps {
  type: string;
  className?: string;
  strokeWidth?: number | string;
}

/**
 * Icono de Maíz / Choclo
 * Inspirado directamente en el diseño de referencia:
 * Mazorca vertical limpia, con chalas curvas abiertas y cuadrícula clara de granos.
 */
export function MaizIcon({ className = "w-7 h-7 sm:w-8 sm:h-8", strokeWidth = 1.4 }: { className?: string; strokeWidth?: number | string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Icono de Maíz"
    >
      {/* Tallo base inferior */}
      <path d="M11 20.5v2h2v-2" />

      {/* Mazorca / Choclo central (cuerpo redondeado) */}
      <path d="M8.5 15.5C8.5 8 9.5 3 12 3s3.5 5 3.5 12.5" />

      {/* Granos de maíz: líneas horizontales y división central limpias */}
      <path d="M10 6h4" />
      <path d="M9.5 8.5h5" />
      <path d="M9.5 11h5" />
      <path d="M10 13.5h4" />
      <path d="M12 4.5v11" />

      {/* Chala izquierda abierta con punta elegante */}
      <path d="M11 20.5C7 19.5 4.5 15.5 4.5 11.5c1.8 2.5 4 3.5 5 4" />

      {/* Chala derecha abierta con punta elegante */}
      <path d="M13 20.5C17 19.5 19.5 15.5 19.5 11.5c-1.8 2.5-4 3.5-5 4" />
    </svg>
  );
}

/**
 * Icono de Trigo (Versión anterior favorita con espiga estilizada)
 */
export function TrigoIcon({ className = "w-7 h-7 sm:w-8 sm:h-8", strokeWidth = 1.4 }: { className?: string; strokeWidth?: number | string }) {
  return (
    <Wheat className={className} strokeWidth={Number(strokeWidth)} aria-label="Icono de Trigo" />
  );
}

/**
 * Icono de Soja
 * Vaina con granos redondeados prominentes y hoja germinada.
 */
export function SojaIcon({ className = "w-7 h-7 sm:w-8 sm:h-8", strokeWidth = 1.4 }: { className?: string; strokeWidth?: number | string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Icono de Soja"
    >
      {/* Vaina exterior suavemente ondulada */}
      <path d="M3.5 16.5C5.5 19.8 11.5 20.5 18 16.5C21 14.8 21.8 12.2 21 10.5C18.5 10.5 12.5 11.8 6.5 15C5 15.8 4 16.2 3.5 16.5Z" />

      {/* 3 granos de soja bien redondos y claros */}
      <circle cx="8" cy="15.2" r="1.8" />
      <circle cx="12.8" cy="13.8" r="1.8" />
      <circle cx="17.5" cy="12.2" r="1.8" />

      {/* Tallo y brote de hoja superior */}
      <path d="M3.5 16.5C2.5 14 3 11 5 8.5C7.5 5.5 11.5 5 14 6" />
      <path d="M5 8.5C7 9.5 9 9.5 10 9" />
    </svg>
  );
}

/**
 * Icono de Girasol
 * Silueta geométrica limpia con centro semillero y pétalos claros.
 */
export function GirasolIcon({ className = "w-7 h-7 sm:w-8 sm:h-8", strokeWidth = 1.4 }: { className?: string; strokeWidth?: number | string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Icono de Girasol"
    >
      {/* Centro de la flor */}
      <circle cx="12" cy="9.5" r="3.2" />

      {/* Pétalos cardinales y diagonales limpios */}
      <path d="M12 2.5v3.8" />
      <path d="M12 12.7v3.8" />
      <path d="M5 9.5h3.8" />
      <path d="M15.2 9.5H19" />

      <path d="M7 4.5l2.7 2.7" />
      <path d="M14.3 11.8l2.7 2.7" />
      <path d="M17 4.5l-2.7 2.7" />
      <path d="M9.7 11.8L7 14.5" />

      {/* Tallo */}
      <path d="M12 16.5V22" />

      {/* Hoja de girasol curva */}
      <path d="M12 19.5c3.5 0 5.5-1.5 6-3.5-2.2 0-4.8.8-6 3.5z" />
    </svg>
  );
}

/**
 * Icono de Cebada
 * Espiga con aristas largas y finas características.
 */
export function CebadaIcon({ className = "w-7 h-7 sm:w-8 sm:h-8", strokeWidth = 1.4 }: { className?: string; strokeWidth?: number | string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Icono de Cebada"
    >
      {/* Tallo vertical */}
      <path d="M12 22V11" />

      {/* Espiguillas centrales */}
      <path d="M12 13.5C10 12.5 9 10.5 9.5 8.5C11.5 9 12 10.5 12 11C12 10.5 12.5 9 14.5 8.5C15 10.5 14 12.5 12 13.5Z" />
      <path d="M12 10C10.5 9 9.8 7.5 10.2 6C11.8 6.5 12 7.5 12 8C12 7.5 12.2 6.5 13.8 6C14.2 7.5 13.5 9 12 10Z" />

      {/* Aristas largas características de la cebada */}
      <path d="M10.2 6L6 1.5" />
      <path d="M12 6V1" />
      <path d="M13.8 6L18 1.5" />
      <path d="M9.5 8.5L4.5 4.5" />
      <path d="M14.5 8.5L19.5 4.5" />
    </svg>
  );
}

/**
 * Icono de Sorgo
 * Tallo con panoja abierta de semillas redondeadas.
 */
export function SorgoIcon({ className = "w-7 h-7 sm:w-8 sm:h-8", strokeWidth = 1.4 }: { className?: string; strokeWidth?: number | string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Icono de Sorgo"
    >
      <path d="M12 22V12" />
      <path d="M12 14c-2.5-1.5-3.5-3.5-3.5-5.5" />
      <path d="M12 14c2.5-1.5 3.5-3.5 3.5-5.5" />

      {/* Semillas redondas de la panoja */}
      <circle cx="12" cy="5.5" r="2.2" />
      <circle cx="8.5" cy="8.5" r="1.8" />
      <circle cx="15.5" cy="8.5" r="1.8" />
      <circle cx="12" cy="10.5" r="1.8" />
      <circle cx="7.5" cy="12.5" r="1.6" />
      <circle cx="16.5" cy="12.5" r="1.6" />
    </svg>
  );
}

/**
 * Icono de Arveja
 * Vaina abierta con arvejas redondas alineadas.
 */
export function ArvejaIcon({ className = "w-7 h-7 sm:w-8 sm:h-8", strokeWidth = 1.4 }: { className?: string; strokeWidth?: number | string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Icono de Arveja"
    >
      <path d="M3 17.5C5.5 20.5 11.5 21.5 18.5 17C21 15.2 21.8 12.8 21.5 10.5C19 10.5 13 12 6.5 15.5C5 16.3 4 17 3 17.5Z" />
      <circle cx="8.5" cy="15" r="1.8" />
      <circle cx="13.2" cy="13.5" r="1.8" />
      <circle cx="17.8" cy="11.8" r="1.8" />
      <path d="M3 17.5c-1-2.5-.5-5.5 2-8 2.2-2.2 5.5-2.8 7.5-2.2" />
    </svg>
  );
}

/**
 * Icono de Maní
 * Vaina de maní con forma de ocho y textura sutil.
 */
export function ManiIcon({ className = "w-7 h-7 sm:w-8 sm:h-8", strokeWidth = 1.4 }: { className?: string; strokeWidth?: number | string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Icono de Maní"
    >
      <path d="M8 5C5.5 7 5 10.5 6.5 13.5C7.2 15 7 16 5.5 17.5C7 19.5 10.5 19.5 12.5 18C14 16.8 15.2 16.8 17 18C19 19.5 22.5 17.5 21.5 14.5C20.5 12 20.5 10.8 22 9C20.5 7 17.5 6.5 15.5 8C14 9.2 12.8 9.2 11 8C9.5 6.5 8.5 4.5 8 5Z" />
      <path d="M9.5 10.5c.2 2 1.5 3.5 3 3.5" />
      <path d="M15 11c.2 2 1.5 3.5 3 3.5" />
    </svg>
  );
}

export default function GrainIcon({ type, className = "w-7 h-7 sm:w-8 sm:h-8", strokeWidth = 1.4 }: GrainIconProps) {
  const normalized = type.toLowerCase();
  if (normalized.includes('soja')) {
    return <SojaIcon className={className} strokeWidth={strokeWidth} />;
  }
  if (normalized.includes('maiz') || normalized.includes('maíz')) {
    return <MaizIcon className={className} strokeWidth={strokeWidth} />;
  }
  if (normalized.includes('trigo')) {
    return <TrigoIcon className={className} strokeWidth={strokeWidth} />;
  }
  if (normalized.includes('girasol')) {
    return <GirasolIcon className={className} strokeWidth={strokeWidth} />;
  }
  if (normalized.includes('sorgo')) {
    return <SorgoIcon className={className} strokeWidth={strokeWidth} />;
  }
  if (normalized.includes('arveja')) {
    return <ArvejaIcon className={className} strokeWidth={strokeWidth} />;
  }
  if (normalized.includes('cebada')) {
    return <CebadaIcon className={className} strokeWidth={strokeWidth} />;
  }
  if (normalized.includes('mani') || normalized.includes('maní')) {
    return <ManiIcon className={className} strokeWidth={strokeWidth} />;
  }
  return <TrigoIcon className={className} strokeWidth={strokeWidth} />;
}
