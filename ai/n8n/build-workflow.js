const fs = require("fs");

// =========================================================================
// Codigo del nodo "Analizar dataset" — version para n8n (Node.js puro,
// sin DOM) portada de la misma logica que ya corre en la consola web.
// Recibe { rows: [...], datasetName, query } y devuelve KPIs, hallazgos
// en texto y graficas agregadas listas para insertar en la plantilla HTML.
// =========================================================================
const analizarDatasetCode = `
const input = $input.first().json;
const rawRows = input.rows || [];
const datasetName = input.datasetName || "Dataset";
const query = input.query || "";

function cleanRows(rows) {
  if (!rows.length) return rows;
  const fieldCount = Object.keys(rows[0]).length;
  return rows.filter(r => {
    const filled = Object.values(r).filter(v => v !== undefined && v !== null && v !== "").length;
    return filled >= fieldCount * 0.4;
  });
}

function humanizeField(field) {
  return String(field).replace(/_/g, " ").split(" ")
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w)
    .join(" ");
}

function classifyDataset(name) {
  const n = (name || "").toLowerCase();
  const rules = [
    { label: "Tramites", kws: ["tramite", "suit", "servicio al ciudadano"] },
    { label: "Presupuesto y Finanzas", kws: ["presupuesto", "ejecucion", "gasto", "ingreso", "financ", "contratacion", "secop"] },
    { label: "Demografia y Poblacion", kws: ["poblacion", "demograf", "censo", "habitantes"] },
    { label: "Discapacidad", kws: ["discapacidad", "discapacitad"] },
    { label: "Salud", kws: ["salud", "vacuna", "epidemio", "eps", "hospital", "morbilidad"] },
    { label: "Educacion", kws: ["educacion", "colegio", "matricula", "escolar", "estudiante"] },
    { label: "Seguridad", kws: ["seguridad", "delito", "crimen", "hurto", "violencia"] },
    { label: "Movilidad", kws: ["movilidad", "transito", "transporte", "vehicular"] },
    { label: "Ambiente", kws: ["ambiente", "ambiental", "residuo", "agua", "bosque", "deforest"] },
    { label: "Agropecuario", kws: ["agricola", "agropecuario", "insumo", "cultivo", "cosecha"] },
    { label: "Construccion e Infraestructura", kws: ["construccion", "infraestructura", "obra", "vial", "vias", "urbanistic"] },
  ];
  for (const r of rules) { if (r.kws.some(k => n.includes(k))) return r.label; }
  return null;
}

function buildColumnDefs(rows) {
  const fields = Object.keys(rows[0]).filter(f => !f.startsWith(":"));
  const defs = [];
  fields.forEach(field => {
    const values = rows.map(r => r[field]).filter(v =>
      v !== undefined && v !== null && v !== "" && (typeof v !== "object" || v instanceof Date)
    );
    if (values.length < rows.length * 0.5) return;

    const isIdLike = /^(no\\.?[_ ]?|num(ero)?[_ ]?|id[_ ]?|consecutivo)/i.test(field);
    const distinctRaw = new Set(values.map(String));

    const looksLikeDate = v => v instanceof Date || (typeof v === "string" && /^\\d{4}-\\d{2}-\\d{2}/.test(v));
    if (values.filter(looksLikeDate).length >= values.length * 0.9) {
      const dateValues = values.map(v => v instanceof Date ? v : new Date(v)).filter(d => !isNaN(d.getTime()));
      const years = Array.from(new Set(dateValues.map(d => d.getUTCFullYear()))).sort();
      if (years.length >= 2) defs.push({ field, kind: "date", years });
      return;
    }

    const allNumeric = values.every(v => v !== "" && !isNaN(Number(v)));
    if (allNumeric) {
      const nums = values.map(Number);
      const allUnique = distinctRaw.size === values.length;
      const noVariance = distinctRaw.size === 1;
      if (isIdLike || noVariance || (allUnique && values.length > 15)) return;
      defs.push({ field, kind: "numeric", min: Math.min(...nums), max: Math.max(...nums) });
      return;
    }

    const distinct = Array.from(distinctRaw);
    const avgLen = values.reduce((a, v) => a + String(v).length, 0) / values.length;
    if (distinct.length >= 2 && distinct.length <= 25 && avgLen < 60) {
      defs.push({ field, kind: "categorical", values: distinct.sort() });
    }
  });
  const order = { categorical: 0, date: 1, numeric: 2 };
  defs.sort((a, b) => order[a.kind] - order[b.kind]);
  return defs.slice(0, 8);
}

function formatNum(n) { return Number(n).toLocaleString("es-CO"); }
function formatCell(v) {
  if (v === undefined || v === null) return "";
  if (typeof v === "object") return JSON.stringify(v).slice(0, 40);
  return String(v);
}

const filtered = cleanRows(rawRows);
if (!filtered.length) {
  return [{ json: { error: "El dataset no tiene filas utilizables tras la limpieza." } }];
}

const columnDefs = buildColumnDefs(filtered);
const categoricalDefs = columnDefs.filter(d => d.kind === "categorical");
const categoricalDef = categoricalDefs[0];
const numericDefs = columnDefs.filter(d => d.kind === "numeric");
const numericDef = numericDefs[0];
const dateDef = columnDefs.find(d => d.kind === "date");
const labelField = (categoricalDef && categoricalDef.field) || (columnDefs[0] && columnDefs[0].field) || Object.keys(filtered[0])[0];

const displayFields = [];
if (labelField) displayFields.push(labelField);
if (numericDef && numericDef.field !== labelField) displayFields.push(numericDef.field);
columnDefs.forEach(d => { if (!displayFields.includes(d.field) && displayFields.length < 6) displayFields.push(d.field); });

const insights = [];
insights.push("Se analizaron " + filtered.length.toLocaleString("es-CO") + " registros en total.");

const stats = [{ label: "Total de registros", value: filtered.length.toLocaleString("es-CO") }];
if (numericDef) {
  const nums = filtered.map(r => Number(r[numericDef.field])).filter(n => !isNaN(n));
  const isRateLike = /edad|age|porcentaje|percent|tasa|rate|promedio|indice|índice/i.test(numericDef.field);
  if (nums.length) {
    const sum = nums.reduce((a, b) => a + b, 0);
    const avg = sum / nums.length;
    if (!isRateLike) stats.push({ label: "Suma de " + humanizeField(numericDef.field), value: formatNum(Math.round(sum)) });
    stats.push({ label: "Promedio de " + humanizeField(numericDef.field), value: formatNum(Math.round(avg)) });
    stats.push({ label: "Maximo de " + humanizeField(numericDef.field), value: formatNum(Math.max(...nums)) });
    insights.push("El promedio de " + humanizeField(numericDef.field) + " es " + formatNum(Math.round(avg)) + ".");
  }
} else if (categoricalDef) {
  stats.push({ label: "Categorias distintas en " + humanizeField(categoricalDef.field), value: String(new Set(filtered.map(r => r[categoricalDef.field])).size) });
}

let yearCounts = null;
if (dateDef) {
  yearCounts = {};
  filtered.forEach(r => {
    const d = r[dateDef.field] instanceof Date ? r[dateDef.field] : new Date(r[dateDef.field]);
    if (!isNaN(d.getTime())) { const y = d.getUTCFullYear(); yearCounts[y] = (yearCounts[y] || 0) + 1; }
  });
  const years = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
  if (years.length >= 2) {
    const first = yearCounts[years[0]], last = yearCounts[years[years.length - 1]];
    const pct = first ? Math.round(((last - first) / first) * 100) : 0;
    stats.push({ label: years[0] + " -> " + years[years.length - 1], value: first + " -> " + last + " (" + (pct >= 0 ? "+" : "") + pct + "%)" });
    insights.push("Entre " + years[0] + " y " + years[years.length - 1] + ", los registros " + (pct >= 0 ? "aumentaron" : "disminuyeron") + " " + Math.abs(pct) + "%.");
  }
}

const charts = [];
categoricalDefs.forEach(def => {
  const groups = {};
  filtered.forEach(r => { groups[String(r[def.field] ?? "Sin dato")] = (groups[String(r[def.field] ?? "Sin dato")] || 0) + 1; });
  const entries = Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (entries.length < 2) return;
  charts.push({ type: entries.length <= 6 ? "donut" : "bar", title: "Cantidad de registros por " + humanizeField(def.field), labels: entries.map(e => e[0]), values: entries.map(e => e[1]) });
  const total = entries.reduce((a, e) => a + e[1], 0);
  const topShare = Math.round((entries[0][1] / total) * 100);
  insights.push("En " + humanizeField(def.field) + ", la categoria predominante es \\"" + entries[0][0] + "\\" con " + topShare + "% del total.");
});

if (dateDef && yearCounts) {
  const years = Object.keys(yearCounts).sort();
  if (years.length >= 2) charts.push({ type: "line", title: "Tendencia de registros por año", labels: years, values: years.map(y => yearCounts[y]) });
}

const result = {
  datasetName,
  query,
  category: classifyDataset(datasetName),
  totalRows: filtered.length,
  stats,
  insights: insights.slice(0, 6),
  charts: charts.slice(0, 8),
  columns: displayFields.map(humanizeField),
  rows: filtered.slice(0, 50).map(r => displayFields.map(f => formatCell(r[f])))
};

return [{ json: result }];
`.trim();

// =========================================================================
// Codigo del nodo "Preparar prompt de imagen" — decide que ilustracion
// tematica pedirle al modelo de imagenes segun la categoria detectada
// del dataset (salud -> doctor, educacion -> maestro, etc).
// =========================================================================
const prepararPromptImagenCode = `
const analysis = $input.first().json;
const rawCategory = analysis.category || "";
const category = rawCategory.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");

const styleBase = "professional flat vector illustration, standing confidently, friendly expression, municipal government branding, navy blue and green color palette, simple clean background, no text, no logos";

const promptsByCategory = {
  "Salud": "a friendly doctor wearing a white coat and a stethoscope, " + styleBase,
  "Educacion": "a friendly teacher holding a stack of books, " + styleBase,
  "Tramites": "a friendly civil servant holding a folder and a clipboard, " + styleBase,
  "Presupuesto y Finanzas": "a financial analyst holding a report with a bar chart, " + styleBase,
  "Demografia y Poblacion": "a small diverse group of community members standing together, " + styleBase,
  "Discapacidad": "an inclusive scene with a person using a wheelchair next to a companion, warm and accessible, " + styleBase,
  "Seguridad": "a friendly police officer, " + styleBase,
  "Movilidad": "a transit engineer standing next to a bus and a bicycle, " + styleBase,
  "Ambiente": "a park ranger planting a tree, " + styleBase,
  "Agropecuario": "a farmer holding a basket of fresh produce, " + styleBase,
  "Construccion e Infraestructura": "a civil engineer wearing a hard hat holding blueprints, " + styleBase,
};

const defaultPrompt = "a friendly municipal government employee holding a laptop and documents, " + styleBase;
const imagePrompt = promptsByCategory[category] || defaultPrompt;

return [{ json: { imagePrompt } }];
`.trim();

// el texto que redacto el agente de IA, y arma el HTML final que se le
// manda al servicio de captura de imagen.
// =========================================================================
const construirHtmlCode = `
let analysis;
try { analysis = $('Usar analisis del cliente').first().json; } catch (e) { analysis = null; }
if (!analysis || !Object.keys(analysis).length) { analysis = $('Analizar dataset').first().json; }

let aiText = "";
try {
  const aiRaw = $('Agente IA (redacta narrativa)').first().json;
  aiText = aiRaw.output || (aiRaw.content && aiRaw.content[0] && aiRaw.content[0].text) || (aiRaw.choices && aiRaw.choices[0] && aiRaw.choices[0].message.content) || aiRaw.text || "";
} catch (e) { aiText = ""; }

let aiParsed = {};
try { aiParsed = JSON.parse(aiText); } catch (e) { aiParsed = { titulo: analysis.datasetName, resumen: aiText.slice(0, 400) }; }

const titulo = aiParsed.titulo || analysis.datasetName;
const resumen = aiParsed.resumen || (analysis.insights || []).join(" ");

let imageBase64 = "";
try {
  const imgRaw = $('Generar imagen IA').first().json;
  imageBase64 = (imgRaw.data && imgRaw.data[0] && imgRaw.data[0].b64_json) || "";
} catch (e) { imageBase64 = ""; }

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

// Mismo mapeo categoria -> color que usa la consola (CATEGORY_THEME), para
// que las graficas generadas aqui combinen con el resto del sistema.
const THEME_COLORS = {
  "Salud": "#D85A30",
  "Educacion": "#1C7293",
  "Tramites": "#065A82",
  "Presupuesto y Finanzas": "#2E8B57",
  "Demografia y Poblacion": "#7F77DD",
  "Discapacidad": "#D4537E",
  "Seguridad": "#21295C",
  "Movilidad": "#2E6DA4",
  "Ambiente": "#639922",
  "Agropecuario": "#854F0B",
  "Construccion e Infraestructura": "#5B6B7A",
};
const normalizedCategory = (analysis.category || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const themeColor = THEME_COLORS[normalizedCategory] || "#11233F";
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// -------------------------------------------------------------------------
// Escoge entre 4 y 7 bloques visuales en total, priorizando hasta 3
// tarjetas de estadisticas y llenando el resto con graficas reales.
// Si hay menos de 4 disponibles, se muestran los que existan (no se
// inventan datos para rellenar).
// -------------------------------------------------------------------------
const MAX_BLOQUES = 7;
const statsToShow = (analysis.stats || []).slice(0, 3);
const chartSlots = Math.max(0, MAX_BLOQUES - statsToShow.length);
const chartsToShow = (analysis.charts || []).slice(0, chartSlots);

const statBlocksHtml = statsToShow.map(function(s) {
  return '<div class="block stat-block">'
    + '<div class="stat-label">' + esc(s.label) + '</div>'
    + '<div class="stat-value" style="color:' + themeColor + '">' + esc(s.value) + '</div></div>';
}).join("");

const chartBlocksHtml = chartsToShow.map(function(c, i) {
  return '<div class="block chart-block">'
    + '<p class="block-title">' + esc(c.title) + '</p>'
    + '<canvas id="chart' + i + '"></canvas></div>';
}).join("");

const chartScripts = chartsToShow.map(function(c, i) {
  const isDonut = c.type === "donut";
  const isLine = c.type === "line";
  const isGrouped = c.type === "grouped-bar";
  let datasets;
  if (isGrouped) {
    const palette = [themeColor, shade(themeColor, 60), shade(themeColor, -40), shade(themeColor, 100)];
    datasets = JSON.stringify((c.series || []).map(function(s, j) {
      return { label: s.name, data: s.values, backgroundColor: palette[j % palette.length] };
    }));
  } else {
    const palette = [0, 40, -30, 70, -55, 90, -15, 110].map(function(d) { return shade(themeColor, d); });
    datasets = JSON.stringify([{
      data: c.values,
      backgroundColor: isDonut ? palette : themeColor,
      borderColor: isLine ? themeColor : "#fff",
      borderWidth: isDonut ? 2 : (isLine ? 2 : 0),
      fill: isLine,
      tension: isLine ? 0.3 : 0
    }]);
  }
  const chartType = isDonut ? "doughnut" : (isLine ? "line" : "bar");
  return "new Chart(document.getElementById('chart" + i + "'), { type: '" + chartType + "', "
    + "data: { labels: " + JSON.stringify(c.labels) + ", datasets: " + datasets + " }, "
    + "options: { responsive: false, animation: false, plugins: { legend: { display: " + (isDonut || isGrouped) + ", position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }, "
    + "scales: " + (isDonut ? "{}" : "{ y: { beginAtZero: true } }") + " } });";
}).join("\\n");

const imageHtml = imageBase64
  ? '<img src="data:image/png;base64,' + imageBase64 + '" class="hero-img" alt="">'
  : '<div class="hero-img hero-img-fallback"></div>';

const html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">'
  + '<style>'
  + "body{font-family:'Segoe UI',Arial,sans-serif;background:#F3F5F7;margin:0;padding:0}"
  + '.wrap{width:1080px;padding:40px}'
  + 'header{border-radius:16px;padding:32px;margin-bottom:24px;display:flex;gap:28px;align-items:center}'
  + '.hero-img{width:170px;height:170px;border-radius:16px;object-fit:cover;flex-shrink:0;background:rgba(255,255,255,.2)}'
  + '.hero-text{color:#fff}'
  + '.badge{display:inline-block;background:rgba(255,255,255,.22);color:#fff;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin:0 0 12px}'
  + '.hero-text h1{font-size:28px;margin:0 0 10px;line-height:1.2}'
  + '.hero-text p{font-size:14px;color:rgba(255,255,255,.85);line-height:1.5;margin:0;max-width:720px}'
  + '.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}'
  + '.block{background:#fff;border-radius:12px;padding:18px 20px;border:1px solid #E2E6EA}'
  + '.stat-block{background:#F3F5F7;border:none;display:flex;flex-direction:column;justify-content:center}'
  + '.stat-label{font-size:12px;color:#5B6B7A;margin-bottom:6px}'
  + '.stat-value{font-size:26px;font-weight:700}'
  + '.block-title{font-size:12.5px;font-weight:600;color:#11233F;margin:0 0 10px;text-align:center}'
  + '.chart-block canvas{max-height:170px}'
  + 'footer{margin-top:22px;font-size:11px;color:#8B95A3}'
  + '</style></head><body><div class="wrap">'
  + '<header style="background:' + themeColor + '">'
  + imageHtml
  + '<div class="hero-text">'
  + '<p class="badge">' + esc(analysis.category || "Datos Abiertos") + ' &middot; El Rosal</p>'
  + '<h1>' + esc(titulo) + '</h1>'
  + '<p>' + esc(resumen) + '</p>'
  + '</div></header>'
  + '<div class="grid">' + statBlocksHtml + chartBlocksHtml + '</div>'
  + '<footer>Generado automaticamente a partir de ' + esc(analysis.datasetName) + ' &middot; ' + analysis.totalRows + ' registros analizados.</footer>'
  + '</div>'
  + '<script>' + chartScripts + '</' + 'script>'
  + '</body></html>';

return [{ json: { html: html, analysis: analysis } }];
`.trim();

const workflow = {
  name: "Asistente El Rosal - Resumen Visual",
  nodes: [
    {
      id: "webhook1",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [-200, 300],
      parameters: {
        httpMethod: "POST",
        path: "asistente-el-rosal-imagen",
        responseMode: "responseNode",
        options: {},
      },
    },
    {
      id: "ifModo",
      name: "Viene ya analizado (infografia)?",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [-100, 300],
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "loose" },
          conditions: [
            {
              leftValue: "={{ $json.body.mode }}",
              rightValue: "infografia",
              operator: { type: "string", operation: "equals" },
            },
          ],
          combinator: "and",
        },
        options: {},
      },
      notes: "Si la consola ya consolido y totalizo los datos (boton Generar infografia), se salta el analisis y va directo a redactar + generar la imagen.",
    },
    {
      id: "codeModoDirecto",
      name: "Usar analisis del cliente",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [120, 220],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode:
          "const body = $('Webhook').first().json.body;\nreturn [{ json: body.analysis || {} }];",
      },
    },
    {
      id: "if1",
      name: "Tiene datasetId?",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [120, 400],
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "loose" },
          conditions: [
            {
              leftValue: "={{ $json.body.datasetId }}",
              rightValue: "",
              operator: { type: "string", operation: "notEmpty" },
            },
          ],
          combinator: "and",
        },
        options: {},
      },
    },
    {
      id: "http1",
      name: "Traer datos de datos.gov.co",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [280, 180],
      parameters: {
        url: "=https://www.datos.gov.co/resource/{{ $json.body.datasetId }}.json",
        qs: { parameters: [{ name: "$limit", value: "1000" }] },
        options: {},
      },
    },
    {
      id: "set1",
      name: "Normalizar filas (Socrata)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [520, 180],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode:
          "const rows = $input.all().map(i => i.json);\nconst trigger = $('Webhook').first().json.body;\nreturn [{ json: { rows, datasetName: trigger.datasetName || trigger.datasetId, query: trigger.query || '' } }];",
      },
    },
    {
      id: "set2",
      name: "Normalizar filas (manual)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [280, 420],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode:
          "const body = $('Webhook').first().json.body;\nreturn [{ json: { rows: body.manualData || [], datasetName: body.datasetName || 'Dataset cargado manualmente', query: body.query || '' } }];",
      },
    },
    {
      id: "code1",
      name: "Analizar dataset",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [760, 300],
      parameters: { mode: "runOnceForAllItems", jsCode: analizarDatasetCode },
    },
    {
      id: "agent1",
      name: "Agente IA (redacta narrativa)",
      type: "@n8n/n8n-nodes-langchain.agent",
      typeVersion: 1.7,
      position: [1000, 140],
      parameters: {
        promptType: "define",
        text: "={{ 'Pregunta del ciudadano: ' + $json.query + '. Analisis de datos (unica fuente de cifras permitida): ' + JSON.stringify($json) }}",
        options: {
          systemMessage:
            'Eres un redactor de informes de gestion publica para la Alcaldia de El Rosal. A partir del analisis de datos que recibes, responde SOLO con un JSON valido de la forma {"titulo": string, "resumen": string de maximo 3 frases}. No inventes cifras que no esten en los datos recibidos.',
        },
      },
      notes: "Este nodo solo redacta texto (titulo + resumen) -- los numeros y graficas siempre vienen del analisis deterministico, nunca de aqui. Conecta el modelo de chat que prefieras (OpenAI, Gemini, Anthropic...) al puerto inferior 'Chat Model'; si el modelo no tiene credencial valida, n8n marca este nodo en rojo con el error al ejecutar.",
    },
    {
      id: "chatModel1",
      name: "Modelo de Chat (OpenAI)",
      type: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      typeVersion: 1,
      position: [1000, 320],
      parameters: {
        model: "gpt-4o-mini",
        options: {},
      },
      credentials: { openAiApi: { id: "", name: "OpenAI account" } },
      notes: "Cambialo por 'Google Gemini Chat Model' o 'Anthropic Chat Model' si prefieres otro proveedor -- solo borralo y conecta el nuevo al mismo puerto 'Chat Model' del Agente, el resto del flujo no cambia.",
    },
    {
      id: "code3",
      name: "Preparar prompt de imagen",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1000, 460],
      parameters: { mode: "runOnceForAllItems", jsCode: prepararPromptImagenCode },
    },
    {
      id: "http4",
      name: "Generar imagen IA",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1240, 460],
      parameters: {
        method: "POST",
        url: "https://api.openai.com/v1/images/generations",
        authentication: "genericCredentialType",
        genericAuthType: "httpHeaderAuth",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: "content-type", value: "application/json" },
          ],
        },
        sendBody: true,
        specifyBody: "json",
        jsonBody:
          "={{ JSON.stringify({ model: 'dall-e-3', prompt: $json.imagePrompt, n: 1, size: '1024x1024', response_format: 'b64_json' }) }}",
        options: {},
      },
      credentials: { httpHeaderAuth: { id: "", name: "OpenAI API Key (Authorization)" } },
      notes: "Requiere una credencial 'Header Auth' llamada Authorization con valor 'Bearer sk-TU-LLAVE' (incluye la palabra Bearer). Solo genera la ilustracion decorativa (sin texto ni cifras); puedes cambiar por otro proveedor de imagenes (Flux, Stability) manteniendo el mismo formato de salida b64_json.",
    },
    {
      id: "merge1",
      name: "Combinar narrativa e imagen",
      type: "n8n-nodes-base.merge",
      typeVersion: 3,
      position: [1480, 300],
      parameters: { mode: "combine", combinationMode: "multiplex" },
    },
    {
      id: "code2",
      name: "Construir HTML",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1720, 300],
      parameters: { mode: "runOnceForAllItems", jsCode: construirHtmlCode },
    },
    {
      id: "http3",
      name: "HTML a imagen",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1960, 300],
      parameters: {
        method: "POST",
        url: "http://localhost:4000/render",
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ JSON.stringify({ html: $json.html, width: 1080 }) }}",
        options: { response: { response: { responseFormat: "file" } } },
      },
      notes: "Apunta al microservicio Puppeteer incluido (html-image-service/) o a un servicio pago como htmlcsstoimage.com.",
    },
    {
      id: "respond1",
      name: "Responder al webhook",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1,
      position: [2200, 300],
      parameters: {
        respondWith: "json",
        responseBody:
          "={{ JSON.stringify({ type: 'tablero', title: $('Construir HTML').first().json.analysis.datasetName, category: $('Construir HTML').first().json.analysis.category, stats: $('Construir HTML').first().json.analysis.stats, insights: $('Construir HTML').first().json.analysis.insights, charts: $('Construir HTML').first().json.analysis.charts, columns: $('Construir HTML').first().json.analysis.columns, rows: $('Construir HTML').first().json.analysis.rows, imageBase64: $binary.data.toString('base64') }) }}",
      },
    },
  ],
  connections: {
    Webhook: {
      main: [
        [
          { node: "Viene ya analizado (infografia)?", type: "main", index: 0 },
        ],
      ],
    },
    "Viene ya analizado (infografia)?": {
      main: [
        [{ node: "Usar analisis del cliente", type: "main", index: 0 }],
        [{ node: "Tiene datasetId?", type: "main", index: 0 }],
      ],
    },
    "Tiene datasetId?": {
      main: [
        [{ node: "Traer datos de datos.gov.co", type: "main", index: 0 }],
        [{ node: "Normalizar filas (manual)", type: "main", index: 0 }],
      ],
    },
    "Traer datos de datos.gov.co": {
      main: [[{ node: "Normalizar filas (Socrata)", type: "main", index: 0 }]],
    },
    "Normalizar filas (Socrata)": {
      main: [[{ node: "Analizar dataset", type: "main", index: 0 }]],
    },
    "Normalizar filas (manual)": {
      main: [[{ node: "Analizar dataset", type: "main", index: 0 }]],
    },
    "Usar analisis del cliente": {
      main: [
        [
          { node: "Agente IA (redacta narrativa)", type: "main", index: 0 },
          { node: "Preparar prompt de imagen", type: "main", index: 0 },
        ],
      ],
    },
    "Analizar dataset": {
      main: [
        [
          { node: "Agente IA (redacta narrativa)", type: "main", index: 0 },
          { node: "Preparar prompt de imagen", type: "main", index: 0 },
        ],
      ],
    },
    "Agente IA (redacta narrativa)": {
      main: [[{ node: "Combinar narrativa e imagen", type: "main", index: 0 }]],
    },
    "Modelo de Chat (OpenAI)": {
      ai_languageModel: [[{ node: "Agente IA (redacta narrativa)", type: "ai_languageModel", index: 0 }]],
    },
    "Preparar prompt de imagen": {
      main: [[{ node: "Generar imagen IA", type: "main", index: 0 }]],
    },
    "Generar imagen IA": {
      main: [[{ node: "Combinar narrativa e imagen", type: "main", index: 1 }]],
    },
    "Combinar narrativa e imagen": {
      main: [[{ node: "Construir HTML", type: "main", index: 0 }]],
    },
    "Construir HTML": {
      main: [[{ node: "HTML a imagen", type: "main", index: 0 }]],
    },
    "HTML a imagen": {
      main: [[{ node: "Responder al webhook", type: "main", index: 0 }]],
    },
  },
  pinData: {},
  meta: { instanceId: "el-rosal-asistente" },
};

fs.writeFileSync("/home/claude/n8n-flow/asistente-el-rosal-imagen.json", JSON.stringify(workflow, null, 2));
console.log("workflow JSON generado");
