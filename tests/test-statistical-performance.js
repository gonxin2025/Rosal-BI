// Prueba real: confirma que el motor estadistico (perfilado, KPIs,
// desviacion estandar, correlacion) no bloquea la interfaz ni siquiera
// con 10.000 filas sinteticas -- mide el tiempo real de ejecucion.
//
// Requiere internet real (el HTML carga Chart.js via CDN).
// Ejecutar: node test-statistical-performance.js

const puppeteer = require("puppeteer");
const path = require("path");

const HTML_PATH = path.resolve(__dirname, "../frontend/dashboard/index.html");
const MAX_MS_ACEPTABLE = 1000; // umbral generoso -- en la practica corre en ~100ms

async function main() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("file://" + HTML_PATH, { waitUntil: "networkidle0" });

  const result = await page.evaluate(() => {
    const rows = [];
    const municipios = ["Bogota", "Medellin", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Manizales", "Ibague", "Pasto"];
    const anios = ["2018", "2019", "2020", "2021", "2022", "2023"];
    for (let i = 0; i < 10000; i++) {
      rows.push({
        municipio: municipios[i % municipios.length],
        anio: anios[i % anios.length],
        tasa_matriculacion_5_16: (75 + Math.random() * 20).toFixed(1),
        valor_presupuesto: Math.round(Math.random() * 1000000),
      });
    }

    const t0 = performance.now();
    loadDataSample(rows, "dataset_grande_prueba", "MEN", {
      title: "x", description: "x", createdAt: null, updatedAt: null,
      views: 0, downloads: 0, entityName: "MEN", entityOrder: "Nacional", link: "#", category: "Educacion",
    });
    const t1 = performance.now();

    generateInsights();
    const t2 = performance.now();

    return {
      filas: rows.length,
      msLoadDataSample: Math.round(t1 - t0),
      msGenerateInsights: Math.round(t2 - t1),
      msTotal: Math.round(t2 - t0),
    };
  });

  await browser.close();

  console.log(`Filas procesadas: ${result.filas}`);
  console.log(`loadDataSample: ${result.msLoadDataSample}ms | generateInsights: ${result.msGenerateInsights}ms | total: ${result.msTotal}ms`);

  if (result.msTotal > MAX_MS_ACEPTABLE) {
    console.error(`❌ FALLO: el procesamiento tardó ${result.msTotal}ms, más del umbral de ${MAX_MS_ACEPTABLE}ms.`);
    process.exit(1);
  }
  console.log(`✅ OK: 10.000 filas procesadas en ${result.msTotal}ms, muy por debajo del umbral de ${MAX_MS_ACEPTABLE}ms.`);
}

main().catch((e) => { console.error("ERROR:", e); process.exit(1); });
