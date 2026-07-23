// Prueba real: reproduce el bug donde columnas identificadoras (que
// contienen "codigo"/"id" en el nombre, como "codigomunicipio" o
// "codigovigencia") se clasificaban como columnas de Fecha -- porque
// coincidian con los patrones de deteccion de fecha (4 digitos, o la
// palabra "vigencia" en el nombre) sin revisar primero si ya eran un
// identificador. Tambien reproduce el caso donde un numero grande
// (ej. 201500) era mal interpretado por Date.parse() como un año.
//
// Requiere internet real (el HTML carga Chart.js via CDN).
// Ejecutar: node test-column-classification.js

const puppeteer = require("puppeteer");
const path = require("path");

const HTML_PATH = path.resolve(__dirname, "../frontend/dashboard/index.html");

async function main() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("file://" + HTML_PATH, { waitUntil: "networkidle0" });

  // Caso 1: dataset real de presupuesto -- codigomunicipio y
  // codigovigencia NUNCA deben terminar en profile.dates.
  const caso1 = await page.evaluate(() => {
    const rows = [];
    const municipios = ["05001", "25260", "11001", "76001"];
    for (let anio = 2008; anio <= 2020; anio++) {
      municipios.forEach((m) => {
        rows.push({
          ano: String(anio),
          codigomunicipio: m,
          codigovigencia: String(((anio - 2007) % 6) + 1),
          periodotrimestral: Math.round(Math.random() * 1000),
        });
      });
    }
    loadDataSample(rows, "presupuesto_prueba", "Contraloria", {
      title: "x", description: "x", createdAt: null, updatedAt: null,
      views: 0, downloads: 0, entityName: "x", entityOrder: "x", link: "#", category: "x",
    });
    return { dates: profile.dates, dimensions: profile.dimensions, measures: profile.measures };
  });

  // Caso 2: una medida numerica con valores grandes no debe colarse como fecha.
  const caso2 = await page.evaluate(() => {
    const rows = [];
    for (let anio = 2015; anio <= 2023; anio++) rows.push({ fecha_registro: String(anio), valor: anio * 100 });
    loadDataSample(rows, "x", "x", {
      title: "x", description: "x", createdAt: null, updatedAt: null,
      views: 0, downloads: 0, entityName: "x", entityOrder: "x", link: "#", category: "x",
    });
    return { dates: profile.dates, measures: profile.measures };
  });

  await browser.close();

  console.log("Caso 1 (dataset con códigos):", JSON.stringify(caso1));
  console.log("Caso 2 (número grande como medida):", JSON.stringify(caso2));

  let fallo = false;
  if (caso1.dates.includes("codigomunicipio") || caso1.dates.includes("codigovigencia")) {
    console.error("❌ FALLO: un identificador (codigomunicipio o codigovigencia) se clasificó como fecha.");
    fallo = true;
  }
  if (!caso1.dates.includes("ano")) {
    console.error("❌ FALLO: la columna real de fecha (ano) no se detectó.");
    fallo = true;
  }
  if (caso2.dates.includes("valor")) {
    console.error("❌ FALLO: una medida numérica (valor) se clasificó como fecha por Date.parse().");
    fallo = true;
  }
  if (!caso2.dates.includes("fecha_registro")) {
    console.error("❌ FALLO: la columna real de fecha (fecha_registro) no se detectó.");
    fallo = true;
  }

  if (fallo) process.exit(1);
  console.log("✅ OK: los identificadores y los números grandes ya no se clasifican como fecha; las fechas reales sí se detectan.");
}

main().catch((e) => { console.error("ERROR:", e); process.exit(1); });
