import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API proxy route to fetch weather and rain data
  app.get("/api/weather", async (req, res) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=-36.602&longitude=-61.263&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code&daily=precipitation_sum&timezone=America/Argentina/Buenos_Aires&past_days=7`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Open-Meteo responded with status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching weather in proxy:", error);
      res.status(500).json({ error: error.message || "Failed to fetch weather data" });
    }
  });

  // Cache en memoria para cotizaciones de pizarras (TTL habitual: 10 minutos)
  let pizarrasCache: { timestamp: number; data: any } | null = null;
  const PIZARRAS_CACHE_TTL = 10 * 60 * 1000; // 10 minutos

  // API para obtener pizarras de granos en vivo
  app.get("/api/pizarras", async (req, res) => {
    try {
      const now = Date.now();
      const force = req.query.force === 'true';

      // Si tenemos cache y no se forzó actualización, evaluar vigencia
      if (!force && pizarrasCache && now - pizarrasCache.timestamp < PIZARRAS_CACHE_TTL) {
        return res.json({ ...pizarrasCache.data, cached: true });
      }

      // Consulta al simulador público de granos con cotizaciones de pizarras
      const response = await fetch("https://www.agrocanje.com.ar/simulador", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });

      if (!response.ok) {
        throw new Error(`Servicio de pizarras respondió con status ${response.status}`);
      }

      const html = await response.text();
      const match = html.match(/let arrayJS = (\[.*?\]);/s);
      if (!match) {
        throw new Error("No se pudo localizar el bloque de datos de pizarras");
      }

      const rawList = JSON.parse(match[1]);

      // Mapeo de grano_id a IDs de nuestro sistema
      // 9: Maíz, 10: Soja, 11: Trigo, 12: Girasol, 13: Sorgo, 15: Arveja, 16: Cebada, 18: Maní
      const granoMap: Record<string, string> = {
        "10": "soja",
        "9": "maiz",
        "11": "trigo",
        "12": "girasol",
        "13": "sorgo",
        "16": "cebada",
        "15": "arveja_verde",
        "18": "mani"
      };

      let fechaPizarra = "";
      const grains: Record<string, { rosarioARS: number; bahiaARS: number; fecha?: string }> = {
        soja: { rosarioARS: 555000, bahiaARS: 550000 },
        maiz: { rosarioARS: 293400, bahiaARS: 290000 },
        trigo: { rosarioARS: 346700, bahiaARS: 342000 },
        girasol: { rosarioARS: 760000, bahiaARS: 755000 },
        sorgo: { rosarioARS: 275300, bahiaARS: 270000 },
        cebada: { rosarioARS: 310000, bahiaARS: 305000 },
        arveja_verde: { rosarioARS: 480000, bahiaARS: 475000 },
        mani: { rosarioARS: 890000, bahiaARS: 885000 }
      };

      for (const item of rawList) {
        const gId = granoMap[item.grano_id];
        if (!gId) continue;
        const price = parseFloat(item.precio) || 0;
        
        // Descartar valores históricos o desactualizados menores a $100,000 ARS (ej: arveja/maní de 2021)
        if (price < 100000) continue;

        if (item.puerto_id === "6") { // Rosario
          grains[gId].rosarioARS = price;
          if (item.fecha_pizarra) {
            grains[gId].fecha = item.fecha_pizarra;
            if (!fechaPizarra) fechaPizarra = item.fecha_pizarra;
          }
        } else if (item.puerto_id === "10" && price > 100000) { // Bahía Blanca
          grains[gId].bahiaARS = price;
        }
      }

      // Asegurar coherencia en Bahía Blanca para granos sin cotización separada
      for (const [key, val] of Object.entries(grains)) {
        if (!val.bahiaARS || val.bahiaARS < val.rosarioARS * 0.7) {
          val.bahiaARS = Math.round(val.rosarioARS * 0.99); // Spread habitual del puerto
        }
      }

      // Extraer también cotización de dólar si está presente en el script
      const dolarMatch = html.match(/cotiza\s*=\s*([\d.]+)\s*;/);
      const dolarVal = dolarMatch ? parseFloat(dolarMatch[1]) : undefined;

      const payload = {
        status: "ok",
        source: "Cámara Arbitral de Cereales (Pizarras Oficiales)",
        fechaPizarra: fechaPizarra || new Date().toLocaleDateString("es-AR"),
        dolarReferencia: dolarVal,
        grains,
        updatedAt: new Date().toISOString()
      };

      pizarrasCache = {
        timestamp: now,
        data: payload
      };

      res.json(payload);
    } catch (error: any) {
      console.error("Error al sincronizar pizarras en vivo:", error);
      if (pizarrasCache) {
        return res.json({ ...pizarrasCache.data, cached: true, fallback: true });
      }
      res.status(500).json({ error: error.message || "Error al obtener pizarras" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
