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

export function SojaIcon({ className = "w-4 h-4", strokeWidth = 1.3 }: { className?: string; strokeWidth?: number | string }) {
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
      {/* Vaina / Grano de Soja lineal plano */}
      <path d="M5 16c2.8 3.2 7.8 4.2 12.2 2.2 2.8-1.3 4.2-3.2 4.8-5.2-2.8-3.2-7.8-4.2-12.2-2.2-2.8 1.3-4.2 3.2-4.8 5.2z" />
      <circle cx="9" cy="14" r="1.3" />
      <circle cx="13" cy="13.2" r="1.3" />
      <circle cx="17" cy="12.5" r="1.3" />
      {/* Tallo / Brote sutil */}
      <path d="M5 16c-1.5-2-1.8-4.2-.5-6.2 1.8-2.5 5-3.2 7.5-2.2" />
    </svg>
  );
}

export function MaizIcon({ className = "w-4 h-4", strokeWidth = 1.3 }: { className?: string; strokeWidth?: number | string }) {
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
      {/* Espiga de Maíz lineal plana */}
      <path d="M8.5 7.5c0-3 2-5.5 4.5-5.5s4.5 2.5 4.5 5.5c0 4-2.2 7.5-4.5 9-2.3-1.5-4.5-5-4.5-9z" />
      {/* Hojas / Chalas laterales */}
      <path d="M6.5 17c1.8-1 3.5-2.8 4.5-5.5" />
      <path d="M15 11.5c1 2.7 2.7 4.5 4.5 5.5" />
      <path d="M13 16.5v4.5" />
      {/* Líneas horizontales de granos */}
      <line x1="10.8" y1="5.5" x2="15.2" y2="5.5" />
      <line x1="10.2" y1="8" x2="15.8" y2="8" />
      <line x1="10.8" y1="10.5" x2="15.2" y2="10.5" />
      <line x1="11.8" y1="13" x2="14.2" y2="13" />
      {/* Línea central */}
      <line x1="13" y1="3" x2="13" y2="14" />
    </svg>
  );
}

export function TrigoIcon({ className = "w-4 h-4", strokeWidth = 1.3 }: { className?: string; strokeWidth?: number | string }) {
  return (
    <Wheat className={className} strokeWidth={Number(strokeWidth)} aria-label="Icono de Trigo" />
  );
}

export function GirasolIcon({ className = "w-4 h-4", strokeWidth = 1.3 }: { className?: string; strokeWidth?: number | string }) {
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
      {/* Centro de semillas */}
      <circle cx="12" cy="9.5" r="3.2" />
      {/* Pétalos lineales flat */}
      <path d="M12 2.5v2" />
      <path d="M12 14.5v2" />
      <path d="M5 9.5h2" />
      <path d="M17 9.5h2" />
      <path d="M7 4.5l1.5 1.5" />
      <path d="M15.5 13l1.5 1.5" />
      <path d="M17 4.5l-1.5 1.5" />
      <path d="M8.5 13L7 14.5" />
      {/* Tallo y hoja lineal */}
      <path d="M12 16.5V22" />
      <path d="M12 19c2.2 0 4-1 4.5-2.2-1.5 0-3.3.5-4.5 2.2z" />
    </svg>
  );
}

export function CebadaIcon({ className = "w-4 h-4", strokeWidth = 1.3 }: { className?: string; strokeWidth?: number | string }) {
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
      <path d="M12 21v-7" />
      <path d="M12 14c-1.5-1.5-2.5-3.5-2.5-6 2.5 0 4.5 1 5 3-1 2-2.5 3-2.5 3z" />
      <path d="M14.5 11l4.5-6.5" />
      <path d="M12 8l2-6" />
      <path d="M9.5 11L5 4.5" />
    </svg>
  );
}

export function SorgoIcon({ className = "w-4 h-4", strokeWidth = 1.3 }: { className?: string; strokeWidth?: number | string }) {
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
      <path d="M12 21v-8" />
      <circle cx="12" cy="7" r="2" />
      <circle cx="9" cy="10" r="1.8" />
      <circle cx="15" cy="10" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="8" cy="13" r="1.5" />
      <circle cx="16" cy="13" r="1.5" />
    </svg>
  );
}

export function ArvejaIcon({ className = "w-4 h-4", strokeWidth = 1.3 }: { className?: string; strokeWidth?: number | string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Icono de Arveja Verde"
    >
      <path d="M4 17C6 19 11 20 18 16c2-1 3-3 3-5-2 0-7 1-13 4-2 1-3 2-4 2z" />
      <circle cx="9" cy="14" r="1.5" />
      <circle cx="13" cy="12.5" r="1.5" />
      <circle cx="17" cy="11" r="1.5" />
      <path d="M4 17c-1-2-1-5 2-8" />
    </svg>
  );
}

export function ManiIcon({ className = "w-4 h-4", strokeWidth = 1.3 }: { className?: string; strokeWidth?: number | string }) {
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
      <path d="M8 6c-2.5 1.5-3 5-1.5 8 1 2 .5 3-1 4.5 1.5 2 4.5 2 6.5.5 2-1.5 3-1.5 5 0 2 1.5 5 1.5 6.5-.5-1.5-1.5-2-2.5-1-4.5 1.5-3 1-6.5-1.5-8-2-1.2-4.5-.5-6.5 1-2-1.5-4.5-2.2-6.5-1z" />
    </svg>
  );
}

export default function GrainIcon({ type, className = "w-4 h-4", strokeWidth = 1.3 }: GrainIconProps) {
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
  return <Wheat className={className} strokeWidth={Number(strokeWidth)} />;
}
