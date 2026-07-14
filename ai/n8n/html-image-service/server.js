/*
 * Servicio minimo de "HTML a imagen" para el flujo del asistente de El Rosal.
 *
 * Por que existe: pedirle a un modelo de generacion de imagenes (DALL-E,
 * Flux, etc.) que dibuje una infografia con cifras exactas es poco fiable
 * -- estos modelos no garantizan texto ni numeros correctos dentro de la
 * imagen. Este servicio en cambio renderiza el HTML real (con los datos
 * reales ya insertados) en un navegador headless y toma una captura exacta,
 * pixel por pixel. Cero riesgo de que un numero salga mal.
 *
 * Uso: el nodo "HTML a imagen" del workflow de n8n le hace POST a este
 * servicio con { html: "<html>...</html>" } y recibe un PNG de vuelta.
 *
 * Instalar y correr (en el mismo servidor donde vive n8n):
 *   cd html-image-service
 *   npm install
 *   node server.js
 *
 * Por defecto escucha en el puerto 4000. El workflow de n8n debe apuntar
 * a http://localhost:4000/render (o al host/puerto que uses).
 */

const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json({ limit: "5mb" }));

const PORT = process.env.PORT || 4000;

// Chart.js se sirve local (vendor/chart.umd.js) para que la generacion de
// imagenes nunca dependa de que el servidor tenga salida a un CDN externo.
const CHART_JS_SOURCE = fs.readFileSync(path.join(__dirname, "vendor", "chart.umd.js"), "utf8");

function injectLocalChartJs(html) {
  const inlineScript = "<script>" + CHART_JS_SOURCE + "</script>";
  if (html.includes("</head>")) return html.replace("</head>", inlineScript + "</head>");
  return inlineScript + html;
}

let browserPromise = null;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserPromise;
}

app.post("/render", async (req, res) => {
  const { html, width, height } = req.body || {};
  if (!html) {
    return res.status(400).json({ error: 'Falta el campo "html" en el body.' });
  }

  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setViewport({ width: width || 1080, height: height || 800, deviceScaleFactor: 2 });
    await page.setContent(injectLocalChartJs(html), { waitUntil: "networkidle0", timeout: 15000 });

    const bodyHandle = await page.$("body");
    const box = await bodyHandle.boundingBox();
    await bodyHandle.dispose();

    const buffer = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: Math.ceil(box.width), height: Math.ceil(box.height) },
    });

    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error("Error generando la imagen:", err);
    res.status(500).json({ error: "No se pudo generar la imagen.", detail: String(err) });
  } finally {
    if (page) await page.close();
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log("Servicio HTML->imagen escuchando en http://localhost:" + PORT);
  console.log('Prueba rapida: curl -X POST localhost:' + PORT + '/render -H "Content-Type: application/json" -d \'{"html":"<h1>Hola</h1>"}\' --output prueba.png');
});
