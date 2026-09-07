/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { HERO_CONTENT } from '../data/content';
import { ArrowRight, Lock } from 'lucide-react';

// @ts-ignore
import heroVideo from '../assets/images/video.mp4';

const BACKGROUND_VIDEOS = [
  heroVideo
];

export default function Hero() {
  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    if (BACKGROUND_VIDEOS.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % BACKGROUND_VIDEOS.length);
    }, 7000); // Change video every 7 seconds
    return () => clearInterval(interval);
  }, []);

  const handleContactClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const element = document.getElementById('contacto');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      {/* Background Video Sequence with elegant white gradient overlay */}
      <div className="absolute inset-0 z-0 bg-white">
        {/* Fallback Static Image (rendered behind the video) */}
        <img
          src="/src/assets/images/agricultural_silos_drone_shot_1784129623203.jpg"
          alt="Instalaciones de acopio ADG Almacén de Granos"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
          referrerPolicy="no-referrer"
        />

        {/* Multi-video layers for a smooth hardware-accelerated crossfade */}
        {BACKGROUND_VIDEOS.map((src, index) => (
          <video
            key={src}
            src={src}
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1500 ease-in-out ${
              index === currentVideo ? 'opacity-95' : 'opacity-0'
            }`}
          />
        ))}

        {/* Seamless vertical gradient from transparent at the top to white at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/25 via-white/55 to-white/90 z-1" />

        {/* Decorative bottom gradient to blend perfectly into the Quiénes Somos section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent z-2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-brand-green-pale/90 border border-brand-green/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-xs shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green font-semibold">
              Nueva Empresa · Respaldo de Trayectoria
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-black tracking-tight leading-[1.1] md:leading-[67px] mb-[18px]"
          >
            Dos trayectorias. <br />
            <span className="inline-block mt-0 pt-0 pl-0 text-brand-green">
              Un mismo compromiso.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-800 font-normal leading-relaxed mb-10 max-w-2xl"
          >
            {HERO_CONTENT.description}
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <button
              onClick={handleContactClick}
              className="flex items-center justify-center space-x-2 bg-brand-green hover:bg-brand-green-light text-white font-bold text-sm uppercase tracking-wider py-4 px-8 rounded-full transition-all hover:scale-102 hover:shadow-lg focus:outline-none shadow-md w-full sm:w-auto"
            >
              <span>{HERO_CONTENT.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
