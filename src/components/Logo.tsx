/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
// @ts-ignore
import logoImageColor from '../assets/images/logo_completo_color.png';
// @ts-ignore
import logoImageWhite from '../assets/images/logo_completo_blanco.png';

// Componente de logo con transición suave de opacidad según el fondo
interface LogoProps {
  /**
   * Whether to render the logo for a light background (original colors) or a dark background (solid white).
   * @default true
   */
  lightBg?: boolean;
  /**
   * Additional CSS classes to apply to the container.
   */
  className?: string;
  /**
   * Height of the logo in pixels. Width scales automatically.
   * @default 40
   */
  height?: number;
  /**
   * Whether to show only the icon or the full brand logo (icon + "adg" text).
   * @default false
   */
  iconOnly?: boolean;
}

export default function Logo({
  lightBg = true,
  className = '',
  height = 40,
  iconOnly = false,
}: LogoProps) {
  return (
    <div className={`inline-flex items-center justify-center relative ${className}`} style={{ height }}>
      {/* Color Logo */}
      <img
        src={logoImageColor}
        alt="ADG Almacén de Granos S.A. - Color"
        className={`object-contain h-full w-auto transition-opacity duration-500 ease-in-out ${
          lightBg ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ maxHeight: height }}
      />
      {/* White Logo */}
      <img
        src={logoImageWhite}
        alt="ADG Almacén de Granos S.A. - Blanco"
        className={`object-contain h-full w-auto absolute top-0 left-0 transition-opacity duration-500 ease-in-out ${
          lightBg ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ maxHeight: height }}
      />
    </div>
  );
}


