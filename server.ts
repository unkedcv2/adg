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
