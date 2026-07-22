// Prueba real: reproduce el bug donde una columna tipo tasa/porcentaje,
// con un valor corrupto inyectado a proposito (simulando un error de
// formato del dataset de origen), se sumaba en vez de promediarse,
// produciendo cifras del orden de 10^17. Confirma que ahora se
// promedia correctamente y el valor corrupto se descarta.
//
// Requiere internet real (el HTML carga Chart.js via CDN).
// Ejecutar: node test-rate-columns.js

const puppeteer = require("puppeteer");
const path = require("path");

const HTML_PATH = path.resolve(__dirname, "../frontend/dashboard/index.html");

async function main() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("file://" + HTML_PATH, { waitUntil: "networkidle0" });

  const result = await page.evaluate(() => {
    const rows = [];
    const municipios = ["Bogota", "Medellin", "Cali", "Barranquilla", "Cartagena"];
    const anios = ["2019", "2020", "2021", "2022"];
    anios.forEach((anio) => {
      municipios.forEach((m) => {
        rows.push({ municipio: m, anio, tasa_matriculacion_5_16: (75 + Math.random() * 20).toFixed(1) });
      });
    });
    // Fila con el valor corrupto que causo el bug real (error de formato/exportacion)
    rows.push({ municipio: "Quibdo", anio: "2021", tasa_matriculacion_5_16: "270600000000000000" });

    loadDataSample(rows, "MEN_prueba", "MEN", {
      title: "x", description: "x", createdAt: null, updatedAt: null,
      views: 0, downloads: 0, entityName: "MEN", entityOrder: "Nacional", link: "#", category: "Educacion",
    });

    const esTasa = isRateLikeColumn("tasa_matriculacion_5_16");
    const porAnio = aggregateData("anio", "tasa_matriculacion_5_16", "avg");
    const valoresRazonables = porAnio.every((d) => d.value >= 0 && d.value <= 100);

    return { esTasa, valoresPorAnio: porAnio.map((d) => ({ label: d.label, value: Math.round(d.value * 10) / 10 })), valoresRazonables };
  });

  await browser.close();

  console.log("Columna detectada como tipo tasa:", result.esTasa);
  console.log("Valores por año:", JSON.stringify(result.valoresPorAnio));

  if (!result.esTasa) {
    console.error("❌ FALLO: la columna no se detectó como tipo tasa.");
    process.exit(1);
  }
  if (!result.valoresRazonables) {
    console.error("❌ FALLO: algún valor quedó fuera del rango 0-100 — posible regresión del bug de suma/corrupción.");
    process.exit(1);
  }
  console.log("✅ OK: todos los valores están en un rango razonable (0-100), el dato corrupto se descartó correctamente.");
}

main().catch((e) => { console.error("ERROR:", e); process.exit(1); });
