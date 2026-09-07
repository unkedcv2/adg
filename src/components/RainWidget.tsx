/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudRain, 
  Droplets, 
  Calendar, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Info, 
  MapPin, 
  Clock
} from 'lucide-react';

export interface MeteorologicalData {
  temp: number;
  humidity: number;
  precipToday: number;
  precipYesterday: number;
  totalPast7Days: number;
  pastDays: { dayName: string; dateStr: string; amount: number; isToday: boolean }[];
  weatherCode: number;
  loading: boolean;
  error: boolean;
}

interface RainWidgetProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onWeatherDataLoaded?: (data: MeteorologicalData) => void;
}

export default function RainWidget({
  isOpen: controlledIsOpen,
  onOpenChange,
  onWeatherDataLoaded
}: RainWidgetProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    setInternalIsOpen(val);
    if (onOpenChange) onOpenChange(val);
  };
  
  // Real-time weather/rain state
  const [weatherData, setWeatherData] = useState<MeteorologicalData>({
    temp: 14.5,
    humidity: 78,
    precipToday: 0.0,
    precipYesterday: 0.0,
    totalPast7Days: 0.0,
    pastDays: [],
    weatherCode: 0,
    loading: true,
    error: false,
  });

  // Fetch meteorological data from Open-Meteo for Daireaux via local server proxy
  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setWeatherData(prev => ({ ...prev, loading: true, error: false }));
        
        // Fetch from our server-side proxy to bypass client/iframe network restrictions, with a direct client-side fallback if hosted statically
        let response;
        try {
          response = await fetch(`/api/weather`);
          if (!response.ok) throw new Error('Local API failed');
        } catch (apiErr) {
          console.warn('Backend proxy not available (/api/weather). Fetching directly from Open-Meteo API...', apiErr);
          const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=-36.602&longitude=-61.263&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code&daily=precipitation_sum&timezone=America/Argentina/Buenos_Aires&past_days=7`;
          response = await fetch(directUrl);
        }
        
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();

        // Parse current variables
        const currentTemp = data.current?.temperature_2m ?? 15.0;
        const currentHumidity = data.current?.relative_humidity_2m ?? 75;
        const weatherCode = data.current?.weather_code ?? 0;

        // Parse daily sums
        const precipSums: number[] = data.daily?.precipitation_sum ?? [];
        const dailyTimes: string[] = data.daily?.time ?? [];

        const past_days_count = 7;
        const todayIndex = past_days_count; // index 7 is today

        const precipToday = precipSums[todayIndex] ?? 0.0;
        const precipYesterday = precipSums[todayIndex - 1] ?? 0.0;

        // Calculate last 7 days total (including today)
        const past7DaysSums = precipSums.slice(todayIndex - 6, todayIndex + 1); // 7 elements ending in today
        const totalPast7Days = parseFloat(past7DaysSums.reduce((sum, val) => sum + (val ?? 0), 0).toFixed(1));

        // Format day names for the past 7 days list
        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const formattedDays = [];

        for (let i = todayIndex - 6; i <= todayIndex; i++) {
          if (dailyTimes[i] === undefined || precipSums[i] === undefined) continue;
          
          const dateObj = new Date(dailyTimes[i] + 'T00:00:00-03:00'); // set Argentina time
          const dayName = i === todayIndex ? 'Hoy' : i === todayIndex - 1 ? 'Ayer' : daysOfWeek[dateObj.getDay()];
          
          // Format date as DD/MM
          const parts = dailyTimes[i].split('-');
          const dateStr = `${parts[2]}/${parts[1]}`;

          formattedDays.push({
            dayName,
            dateStr,
            amount: parseFloat((precipSums[i] ?? 0.0).toFixed(1)),
            isToday: i === todayIndex
          });
        }

        const newWeatherData = {
          temp: currentTemp,
          humidity: currentHumidity,
          precipToday: parseFloat(precipToday.toFixed(1)),
          precipYesterday: parseFloat(precipYesterday.toFixed(1)),
          totalPast7Days,
          pastDays: formattedDays,
          weatherCode,
          loading: false,
          error: false
        };
        setWeatherData(newWeatherData);
        onWeatherDataLoaded?.(newWeatherData);

      } catch (err) {
        console.error('Error fetching Daireaux weather/rain data:', err);
        
        // TRANSPARENT Fallback - NEVER invent rain.
        // We set 0.0 mm as the safe default unless a connection to the server/API successfully proves otherwise.
        const defaultDays = Array.from({ length: 7 }).map((_, idx) => {
          const date = new Date(Date.now() - (6 - idx) * 24 * 60 * 60 * 1000);
          const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          const dayName = idx === 6 ? 'Hoy' : idx === 5 ? 'Ayer' : daysOfWeek[date.getDay()];
          const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
          return {
            dayName,
            dateStr,
            amount: 0.0,
            isToday: idx === 6
          };
        });

        const fallbackData = {
          temp: 14.0,
          humidity: 70,
          precipToday: 0.0,
          precipYesterday: 0.0,
          totalPast7Days: 0.0,
          pastDays: defaultDays,
          weatherCode: 0,
          loading: false,
          error: true // flag there was an error connecting to server API
        };
        setWeatherData(fallbackData);
        onWeatherDataLoaded?.(fallbackData);
      }
    }

    fetchWeatherData();
    
    // Refresh weather data every 15 minutes
    const interval = setInterval(fetchWeatherData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Weather code translator
  const getWeatherDesc = (code: number) => {
    if (code === 0) return { desc: 'Despejado', icon: '☀️' };
    if (code >= 1 && code <= 3) return { desc: 'Parcialmente Nublado', icon: '⛅' };
    if (code === 45 || code === 48) return { desc: 'Niebla', icon: '🌫️' };
    if (code >= 51 && code <= 55) return { desc: 'Llovizna', icon: '🌧️' };
    if (code >= 61 && code <= 65) return { desc: 'Lluvia', icon: '🌧️' };
    if (code >= 71 && code <= 77) return { desc: 'Nieve', icon: '❄️' };
    if (code >= 80 && code <= 82) return { desc: 'Chubascos', icon: '🌦️' };
    if (code >= 95 && code <= 99) return { desc: 'Tormenta Eléctrica', icon: '⛈️' };
    return { desc: 'Estable', icon: '🌤️' };
  };

  const weather = getWeatherDesc(weatherData.weatherCode);

  return (
    <div id="rain-widget-container" className="fixed top-28 right-4 md:top-32 md:right-6 z-40 font-sans">
      
      {/* Main floating trigger capsule */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
          }}
          className="flex items-center bg-white hover:bg-brand-green-pale border border-gray-100 hover:border-brand-green/20 p-1.5 md:py-2.5 md:px-4 rounded-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] hover:shadow-md transition-all duration-300 hover:scale-[1.03] text-gray-800 focus:outline-none group relative overflow-hidden"
          title="Ver registro de lluvia en Daireaux"
        >
          <div className="absolute inset-0 bg-brand-green/3 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Mobile compact: icon + mm only */}
          <div className="flex md:hidden items-center space-x-1 px-1.5 py-0.5">
            <CloudRain className="w-4.5 h-4.5 text-brand-green animate-bounce" style={{ animationDuration: '3s' }} />
            <span className="text-xs font-extrabold text-brand-gold">
              {weatherData.precipToday > 0 ? `${weatherData.precipToday} mm` : '0 mm'}
            </span>
          </div>

          {/* Desktop: complete detailed capsule */}
          <div className="hidden md:flex items-center space-x-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-brand-green-pale text-brand-green">
              <CloudRain className="w-4.5 h-4.5 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold leading-tight">Pluviómetro</p>
              <p className="text-xs font-bold text-brand-green flex items-center space-x-1">
                <span>Daireaux:</span>
                <span className="text-brand-gold font-extrabold">
                  {weatherData.precipToday > 0 ? `${weatherData.precipToday} mm` : '0 mm'}
                </span>
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-brand-green transition-transform group-hover:translate-y-0.5 duration-300 ml-1" />
          </div>
        </button>
      )}

      {/* Collapsible details modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs md:static md:bg-transparent md:backdrop-blur-none md:p-0">
            {/* Click outside backdrop for mobile */}
            <div
              className="absolute inset-0 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 w-full max-w-sm md:w-[370px] bg-white border border-gray-100/80 rounded-3xl shadow-[0_16px_50px_-8px_rgba(4,69,36,0.25)] overflow-hidden"
            >
            {/* Header with agricultural theme */}
            <div className="bg-brand-green text-white p-4 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-white/10 text-white">
                    <CloudRain className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm leading-tight text-white flex items-center space-x-1.5">
                      <span>Monitoreo de Lluvia Real</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-brand-gold text-brand-green-dark">
                        Daireaux
                      </span>
                    </h3>
                    <p className="text-[10px] text-white/75 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-brand-gold-light" />
                      <span>Provincia de Buenos Aires</span>
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Source disclaimer */}
              <p className="text-[9px] text-white/50 mt-3 border-t border-white/10 pt-2 flex items-center justify-between">
                <span>Modelos: SMN · SNIH · Copernicus ECMWF</span>
                <span className="flex items-center space-x-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${weatherData.error ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                  <span>{weatherData.error ? 'Offline (Conexión diferida)' : 'Sincronizado'}</span>
                </span>
              </p>
            </div>

            {/* Body Area */}
            <div className="p-4 max-h-[380px] overflow-y-auto custom-scrollbar">
              
              <div className="space-y-4">
                
                {/* Current Rainfall Summary Card */}
                <div className="bg-brand-green-pale border border-brand-green/10 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Lluvia de Hoy</p>
                    <div className="flex items-baseline space-x-1 mt-1">
                      <span className="text-3xl font-display font-black text-brand-green">
                        {weatherData.precipToday.toFixed(1)}
                      </span>
                      <span className="text-sm font-extrabold text-brand-green-light">mm</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-brand-gold" />
                      <span>Estado: {weather.desc} {weather.icon}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end border-l border-brand-green/10 pl-4">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase text-right">Ayer</p>
                    <p className="text-sm font-bold text-brand-green mt-0.5">
                      {weatherData.precipYesterday > 0 ? `${weatherData.precipYesterday} mm` : '0.0 mm'}
                    </p>
                    
                    <p className="text-[10px] text-gray-400 font-semibold uppercase text-right mt-1.5">Acumulado Semana</p>
                    <p className="text-sm font-extrabold text-brand-gold mt-0.5">
                      {weatherData.totalPast7Days} mm
                    </p>
                  </div>
                </div>

                {/* Weather Telemetry */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-[9px] text-gray-400 font-semibold">HUMEDAD RELATIVA</p>
                      <p className="font-bold text-gray-800">{weatherData.humidity}%</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center space-x-2">
                    <div className="text-orange-500 font-bold text-sm">🌡️</div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-semibold">TEMPERATURA LOCAL</p>
                      <p className="font-bold text-gray-800">{weatherData.temp}°C</p>
                    </div>
                  </div>
                </div>

                {/* Historical Rainfall Bar Chart / List */}
                <div>
                  <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Historial Últimos 7 Días</span>
                    <span className="text-[9px] font-normal text-gray-400 normal-case">Mediciones en mm</span>
                  </h4>

                  {weatherData.loading ? (
                    <div className="py-8 text-center text-xs text-gray-400">Consultando base de datos SMN / Copernicus...</div>
                  ) : (
                    <div className="space-y-1.5">
                      {weatherData.pastDays.map((item, index) => {
                        const maxAmount = Math.max(...weatherData.pastDays.map(d => d.amount), 5);
                        const percentage = Math.min((item.amount / maxAmount) * 100, 100);
                        
                        return (
                          <div key={index} className="flex items-center text-xs">
                            <div className="w-14 font-semibold text-gray-600 text-left flex items-center space-x-1">
                              {item.isToday && <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />}
                              <span>{item.dayName}</span>
                            </div>
                            <div className="w-10 text-gray-400 text-[10px]">{item.dateStr}</div>
                            <div className="flex-grow mx-2 h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                              {item.amount > 0 && (
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${
                                    item.isToday 
                                      ? 'bg-brand-gold' 
                                      : item.amount > 10 
                                      ? 'bg-brand-green' 
                                      : 'bg-brand-green-light/75'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              )}
                            </div>
                            <div className="w-14 text-right font-bold text-gray-700">
                              {item.amount > 0 ? `${item.amount} mm` : '0 mm'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>



              </div>

            </div>

            {/* Bottom panel indicator */}
            <div className="bg-gray-50 border-t border-gray-100 p-3 flex items-center justify-between text-[10px] text-gray-500">
              <span className="flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                <span>Daireaux, Buenos Aires</span>
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="font-bold text-brand-green hover:text-brand-green-light"
              >
                Cerrar
              </button>
            </div>

          </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
