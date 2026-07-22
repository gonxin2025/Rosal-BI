// Prueba real: reproduce el bug del bucle infinito en la exportacion a PDF
// (residuo de punto flotante en el calculo de paginado) y confirma que
// el PDF se genera en segundos, no que se cuelga.
//
// Requiere internet real (el HTML carga Chart.js/jsPDF/html2canvas via CDN).
// Ejecutar: node test-pdf-export.js

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const HTML_PATH = path.resolve(__dirname, "../frontend/dashboard/index.html");
const DOWNLOAD_DIR = path.resolve(__dirname, "_test-downloads");

async function main() {
  if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: DOWNLOAD_DIR,
  });

  await page.goto("file://" + HTML_PATH, { waitUntil: "networkidle0" });

  // Dataset sintetico con suficientes filas y variedad de columnas para
  // generar varias graficas/tablas -- mientras mas contenido, mas facil
  // reproducir el bug original (altura del lienzo cerca de un multiplo
  // exacto de pagina A4).
  await page.evaluate(() => {
    const rows = [];
    const tipos = ["Certificado", "Licencia", "Permiso", "Registro", "Constancia"];
    const deps = ["Gobierno", "Hacienda", "Planeacion", "Salud", "Educacion"];
    for (let i = 0; i < 300; i++) {
      rows.push({
        tipo: tipos[i % tipos.length],
        dependencia: deps[i % deps.length],
        anio: String(2019 + (i % 6)),
        valor: Math.round(Math.random() * 100000),
      });
    }
    loadDataSample(rows, "dataset_prueba_pdf.csv", "Prueba", {
      title: "x", description: "x", createdAt: null, updatedAt: null,
      views: 0, downloads: 0, entityName: "x", entityOrder: "x", link: "#", category: "x",
    });
  });

  await page.click("#buildPanelBtn");
  await new Promise((r) => setTimeout(r, 1000));

  const start = Date.now();
  await page.click("#downloadPdfBtn");

  // Si el bug del bucle infinito reaparece, el boton nunca se reactiva
  // y este bucle de espera se agota sin encontrar el archivo.
  let downloaded = false;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const files = fs.readdirSync(DOWNLOAD_DIR).filter((f) => f.endsWith(".pdf"));
    if (files.length > 0) { downloaded = true; break; }
  }
  const elapsedMs = Date.now() - start;

  await browser.close();

  if (!downloaded) {
    console.error("❌ FALLO: el PDF nunca se generó en 20 segundos — posible regresión del bucle infinito.");
    process.exit(1);
  }
  console.log(`✅ OK: el PDF se generó en ${elapsedMs}ms (no se colgó).`);
}

main().catch((e) => { console.error("ERROR:", e); process.exit(1); });
