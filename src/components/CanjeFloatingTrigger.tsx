/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrigoIcon } from './GrainIcons';

interface CanjeFloatingTriggerProps {
  onOpenSimulator?: () => void;
}

export default function CanjeFloatingTrigger({}: CanjeFloatingTriggerProps = {}) {
  const handleOpenInNewWindow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof window !== 'undefined') {
      // Build safe URL that works seamlessly across all hosting environments, subdomains, and preview windows without 404
      const baseUrl = window.location.href.split('#')[0].split('?')[0];
      const targetUrl = `${baseUrl}?page=simulador#simulador`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <aside
      id="canje-floating-trigger-container"
      aria-label="Acceso al Simulador de Canje de Granos"
      className="fixed z-40 font-sans top-[96px] sm:top-[104px] lg:top-[108px] right-3 sm:right-6 lg:right-8 xl:right-12 2xl:right-[calc((100vw-1280px)/2+36px)] select-none"
    >
      <a
        id="canje-btn-circular-trigo"
        href="?page=simulador#simulador"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleOpenInNewWindow}
        className="group relative flex items-center justify-center p-0 bg-transparent focus:outline-none cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 text-inherit no-underline"
        title="Abrir Simulador de Canje de Granos en una nueva ventana"
      >
        {/* Pulsating heartbeat rings ('efecto latido') to subtly catch attention */}
        <span className="absolute inset-[22px] sm:inset-[25px] rounded-full bg-brand-green/25 animate-ping pointer-events-none opacity-80" />
        <span className="absolute inset-[18px] sm:inset-[20px] rounded-full border border-brand-green/30 animate-pulse pointer-events-none" />

        {/* Outer Rotating SVG Circular Text - Closer to the inner circle */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center">
          
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full animate-[spin_32s_linear_infinite] group-hover:[animation-play-state:paused] origin-center pointer-events-none drop-shadow-xs"
            aria-hidden="true"
          >
            <defs>
              {/* Circular Path tightened closer around the inner icon container (Radius: 43.5, Center: 60,60) */}
              <path
                id="canjeTextCirclePath"
                d="M 60, 60 m -43.5, 0 a 43.5,43.5 0 1,1 87,0 a 43.5,43.5 0 1,1 -87,0"
              />
            </defs>

            {/* Circular Text moving along the tightened outer path */}
            <text
              fill="#155D34"
              className="text-[8.4px] font-black tracking-[0.14em] uppercase fill-brand-green group-hover:fill-brand-green-dark transition-colors"
            >
              <textPath
                href="#canjeTextCirclePath"
                xlinkHref="#canjeTextCirclePath"
                startOffset="0%"
                textLength="268"
                lengthAdjust="spacing"
              >
                • SIMULADOR DE CANJE DE GRANOS • ADG 
              </textPath>
            </text>
          </svg>

          {/* Inner Circle: Container solely for the Trigo Icon with Negative Hover State */}
          <div className="absolute inset-[24px] sm:inset-[27px] rounded-full bg-white group-hover:bg-brand-green border-2 border-brand-green/25 group-hover:border-white shadow-[0_6px_18px_rgba(21,93,52,0.22)] group-hover:shadow-[0_10px_26px_rgba(21,93,52,0.4)] flex items-center justify-center transition-all duration-300 overflow-hidden z-10">
            
            {/* Wheat / Trigo Icon: Green on white -> Pure White on Green in Negative Hover */}
            <div className="text-brand-green group-hover:text-white group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
              <TrigoIcon
                className="w-7 h-7 sm:w-8 sm:h-8"
                strokeWidth={1.5}
              />
            </div>

          </div>

        </div>
      </a>
    </aside>
  );
}
