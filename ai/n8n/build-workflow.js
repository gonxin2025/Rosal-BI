// Genera el workflow de n8n para el boton "Crear Infografia" del
// Lienzo Ejecutivo. Ejecutar: node build-workflow.js
const fs = require("fs");

// =========================================================================
// Codigo del nodo "Construir HTML de la infografia"
// =========================================================================
// Recibe { titulo, kpis: [{nombre, valor}], graficos: [{titulo, top5: [{label, value}]}], imageBase64? }
// Los KPIs/graficos siguen siendo exactamente lo que ya envia el boton
// "Crear Infografia" -- ese contrato no cambia. Lo nuevo es imageBase64:
// una ilustracion DECORATIVA elegida por un Agente de IA segun el tema
// del lienzo. Nunca se le pide al modelo de imagen que dibuje cifras --
// esas siempre vienen de aqui, de este codigo determinista.
const construirHtmlCode = `
const body = $input.first().json;
const titulo = body.titulo || "Informe Ejecutivo";
const kpis = Array.isArray(body.kpis) ? body.kpis : [];
const graficos = Array.isArray(body.graficos) ? body.graficos : [];
const imageBase64 = body.imageBase64 || null;

// Paleta de categorias, rotando -- misma logica que ya se uso en el
// generador de infografias de Rosal BI: colores + icono por tarjeta,
// nunca depende de un modelo de IA para dibujar cifras.
const PALETTE = [
  { color: "#0EA5E9", bg: "#E0F2FE", icon: "chart" },   // sky
  { color: "#16A34A", bg: "#DCFCE7", icon: "leaf" },     // green
  { color: "#9333EA", bg: "#F3E8FF", icon: "people" },   // purple
  { color: "#DC2626", bg: "#FEE2E2", icon: "shield" },   // red
  { color: "#D97706", bg: "#FEF3C7", icon: "star" },     // amber
  { color: "#0F172A", bg: "#E2E8F0", icon: "doc" },      // slate
];
const ICONS = {
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20v-4" stroke-width="2.4" stroke-linecap="round"/>',
  leaf: '<path d="M5 20c9 0 14-6 14-15-9 0-14 6-14 15Z"/><path d="M5 20c2-6 6-10 12-13" stroke-width="1.6" fill="none"/>',
  people: '<circle cx="9" cy="8" r="3.4"/><path d="M3 20c0-3.6 2.7-6.4 6-6.4s6 2.8 6 6.4" /><circle cx="17" cy="9" r="2.6" fill-opacity="0.6"/>',
  shield: '<path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z"/>',
  star: '<path d="M12 2l2.9 6.6 7.1.6-5.4 4.7L18.2 21 12 17.1 5.8 21l1.6-7.1L2 9.2l7.1-.6L12 2Z"/>',
  doc: '<path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M15 3v5h5" fill="none" stroke-width="1.6"/>',
};

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

const kpiCardsHtml = kpis.map((k, i) => {
  const theme = PALETTE[i % PALETTE.length];
  return \`
    <div style="background:\${theme.bg};border-radius:14px;padding:18px 20px;flex:1;min-width:180px">
      <div style="width:38px;height:38px;border-radius:10px;background:\${theme.color};display:flex;align-items:center;justify-content:center;margin-bottom:10px">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff">\${ICONS[theme.icon]}</svg>
      </div>
      <p style="font-size:11px;font-weight:700;color:\${theme.color};text-transform:uppercase;letter-spacing:.04em;margin:0 0 4px">\${esc(k.nombre)}</p>
      <p style="font-size:26px;font-weight:800;color:#0F172A;margin:0">\${esc(k.valor)}</p>
    </div>\`;
}).join("");

const graficoCardsHtml = graficos.map((g, i) => {
  const theme = PALETTE[(i + 1) % PALETTE.length];
  const top5 = Array.isArray(g.top5) ? g.top5 : [];
  const max = Math.max(1, ...top5.map(d => Number(d.value) || 0));
  const filas = top5.map(d => {
    const pct = Math.round((Number(d.value) || 0) / max * 100);
    return \`
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;color:#334155;margin-bottom:3px">
          <span>\${esc(d.label)}</span><span style="font-weight:700">\${esc(Math.round(d.value).toLocaleString("es-CO"))}</span>
        </div>
        <div style="background:#E2E8F0;border-radius:5px;height:8px">
          <div style="background:\${theme.color};width:\${pct}%;height:8px;border-radius:5px"></div>
        </div>
      </div>\`;
  }).join("");
  return \`
    <div style="background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:18px 20px">
      <p style="font-size:13.5px;font-weight:700;color:#0F172A;margin:0 0 12px">\${esc(g.titulo)}</p>
      \${filas}
    </div>\`;
}).join("");

const datosRapidosHtml = kpis.slice(0, 5).map((k, i) => {
  const theme = PALETTE[i % PALETTE.length];
  return \`
    <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:150px">
      <div style="width:34px;height:34px;border-radius:50%;background:\${theme.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff">\${ICONS[theme.icon]}</svg>
      </div>
      <div>
        <p style="font-size:15px;font-weight:800;color:#0F172A;margin:0">\${esc(k.valor)}</p>
        <p style="font-size:10px;color:#64748B;text-transform:uppercase;margin:0">\${esc(k.nombre)}</p>
      </div>
    </div>\`;
}).join("");

// El header lleva la ilustracion de IA (si llego) como textura de fondo,
// atenuada detras de un degradado -- nunca reemplaza el titulo ni carga
// cifras, solo le da ambiente visual. Si el Agente/imagen fallan, el
// header sigue viendose bien con el degradado solo (nunca se cae el flujo
// por culpa de la parte decorativa).
const headerBgImage = imageBase64
  ? \`<img src="data:image/png;base64,\${imageBase64}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.32" />\`
  : "";

const html = \`
<div style="width:900px;background:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;padding:0">
  <div style="position:relative;background:linear-gradient(135deg,#0F172A,#1E3A5F);padding:44px 50px 36px;text-align:center;overflow:hidden">
    \${headerBgImage}
    <div style="position:relative">
      <p style="color:#7DD3FC;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin:0 0 10px">Informe generado automaticamente</p>
      <h1 style="color:#fff;font-size:34px;font-weight:800;margin:0;line-height:1.2">\${esc(titulo.toUpperCase())}</h1>
    </div>
  </div>

  <div style="padding:34px 50px">
    <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:28px">\${kpiCardsHtml}</div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:28px">\${graficoCardsHtml}</div>

    <div style="background:#0F172A;border-radius:14px;padding:20px 24px">
      <p style="color:#94A3B8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin:0 0 14px;text-align:center">Datos Rapidos</p>
      <div style="display:flex;flex-wrap:wrap;gap:18px;justify-content:center">\${datosRapidosHtml}</div>
    </div>

    <p style="text-align:center;font-size:10px;color:#94A3B8;margin-top:24px">Generado automaticamente | Concurso Datos al Ecosistema 2026</p>
  </div>
</div>
\`;

return [{ json: { html, titulo } }];
`;

// =========================================================================
// Codigo del nodo "Preparar datos para el Agente"
// =========================================================================
// Le da al Agente un resumen corto y legible (no el JSON crudo completo)
// para que el prompt que escriba sea mas preciso.
const prepararResumenCode = `
const body = $input.first().json;
const titulo = body.titulo || "";
const kpisResumen = (body.kpis || []).map(k => k.nombre).slice(0, 6).join(", ");
const graficosResumen = (body.graficos || []).map(g => g.titulo).slice(0, 4).join(", ");
return [{ json: { ...body, resumenParaAgente: "Titulo: " + titulo + ". KPIs: " + kpisResumen + ". Graficos: " + graficosResumen } }];
`;

const workflow = {
  name: "Lienzo Ejecutivo - Crear Infografia",
  nodes: [
    {
      id: "webhook1",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [180, 340],
      webhookId: "crear-infografia-lienzo",
      parameters: {
        path: "crear-infografia",
        httpMethod: "POST",
        responseMode: "responseNode",
        options: {},
      },
    },
    {
      id: "code0",
      name: "Preparar datos para el Agente",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [420, 220],
      parameters: { mode: "runOnceForAllItems", jsCode: prepararResumenCode },
    },
    {
      id: "agent1",
      name: "Agente IA (elige ilustracion)",
      type: "@n8n/n8n-nodes-langchain.agent",
      typeVersion: 1.7,
      position: [660, 220],
      parameters: {
        promptType: "define",
        text: "={{ $json.resumenParaAgente }}",
        options: {
          systemMessage:
            'Eres un director de arte para informes de gestion publica. A partir del resumen del panel que recibes, responde SOLO con un JSON valido de la forma {"prompt": string}. El prompt debe estar en ingles, describir una ilustracion decorativa de fondo (flat vector illustration, professional, navy and sky-blue color palette, no text, no numbers, no logos, no readable words, abstract or thematic scene related to the topic) para usar como textura detras de un titulo -- nunca debe pedir que la imagen incluya cifras, tablas, graficas ni texto legible.',
        },
      },
      notes: "Elige el tema/estilo de la ilustracion decorativa segun el titulo y los KPIs del lienzo. Nunca decide ni redacta las cifras -- esas siempre vienen del Code 'Construir HTML'. Si este nodo o el de imagen fallan, el header simplemente se queda con el degradado solo (ver 'Construir HTML').",
    },
    {
      id: "chatModel1",
      name: "Modelo de Chat (OpenAI)",
      type: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      typeVersion: 1,
      position: [660, 400],
      parameters: { model: "gpt-4o-mini", options: {} },
      credentials: { openAiApi: { id: "", name: "OpenAI account" } },
      notes: "Cambialo por 'Google Gemini Chat Model' o 'Anthropic Chat Model' si prefieres otro proveedor -- solo reconectalo al mismo puerto 'Chat Model' del Agente.",
    },
    {
      id: "http2",
      name: "Generar imagen IA (OpenAI)",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [900, 160],
      parameters: {
        method: "POST",
        url: "https://api.openai.com/v1/images/generations",
        authentication: "genericCredentialType",
        genericAuthType: "httpHeaderAuth",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "content-type", value: "application/json" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ JSON.stringify({ model: 'dall-e-3', prompt: JSON.parse($json.output).prompt, n: 1, size: '1792x1024', response_format: 'b64_json' }) }}",
        options: {},
      },
      credentials: { httpHeaderAuth: { id: "", name: "OpenAI API Key (Authorization)" } },
      notes: "Requiere una credencial 'Header Auth' llamada Authorization con valor 'Bearer sk-TU-LLAVE'.",
    },
    {
      id: "code2",
      name: "Normalizar imagen (OpenAI)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1020, 160],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: "const body = $input.first().json;\nconst imageBase64 = body.data && body.data[0] ? body.data[0].b64_json : null;\nreturn [{ json: { imageBase64 } }];",
      },
      notes: "IMPORTANTE: la respuesta cruda de OpenAI viene en data[0].b64_json, no en un campo 'imageBase64' -- este nodo la extrae al formato que espera 'Construir HTML'. Sin este paso, la imagen nunca llegaba (bug real que se corrigio aqui).",
    },
    {
      id: "http3",
      name: "Generar imagen IA (Gemini) [alternativa]",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [900, 300],
      disabled: true,
      parameters: {
        method: "POST",
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent",
        authentication: "genericCredentialType",
        genericAuthType: "httpHeaderAuth",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "content-type", value: "application/json" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ JSON.stringify({ contents: { role: 'user', parts: [{ text: JSON.parse($json.output).prompt }] }, generationConfig: { responseModalities: ['TEXT','IMAGE'], imageConfig: { aspectRatio: '16:9' } } }) }}",
        options: {},
      },
      credentials: { httpHeaderAuth: { id: "", name: "Gemini API Key (x-goog-api-key)" } },
      notes: "ALTERNATIVA a OpenAI -- endpoint HTTPS distinto (Google Gemini nativo, no hay un nodo dedicado 'Gemini Imagen' en n8n, se hace por HTTP Request igual que con OpenAI). Credencial 'Header Auth': nombre del header 'x-goog-api-key', valor la API key de Google AI Studio directa (sin 'Bearer'). Modelo gemini-3.1-flash-image vigente a julio 2026 -- si esta deprecado cuando lo uses, revisa el modelo recomendado actual en ai.google.dev/gemini-api/docs/models. Para activar esta alternativa: desactiva 'Generar imagen IA (OpenAI)', activa este nodo y 'Normalizar imagen (Gemini)', y reconecta el Agente hacia aca en vez de hacia OpenAI.",
    },
    {
      id: "code3",
      name: "Normalizar imagen (Gemini)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1020, 300],
      disabled: true,
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: "const body = $input.first().json;\nlet imageBase64 = null;\ntry {\n  const parts = body.candidates[0].content.parts;\n  const imgPart = parts.find(p => p.inlineData);\n  imageBase64 = imgPart ? imgPart.inlineData.data : null;\n} catch (e) { imageBase64 = null; }\nreturn [{ json: { imageBase64 } }];",
      },
      notes: "Gemini devuelve la imagen dentro de candidates[0].content.parts[].inlineData.data (base64) -- forma de respuesta distinta a la de OpenAI, por eso necesita su propio nodo de normalizacion.",
    },
    {
      id: "merge1",
      name: "Combinar datos e imagen",
      type: "n8n-nodes-base.merge",
      typeVersion: 3,
      position: [1260, 340],
      parameters: { mode: "combine", combineBy: "combineAll", options: {} },
    },
    {
      id: "code1",
      name: "Construir HTML de la infografia",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1380, 340],
      parameters: { mode: "runOnceForAllItems", jsCode: construirHtmlCode },
      notes: "Arma el HTML consolidando los KPIs y graficos que ya vienen calculados desde el navegador (nombre+valor, top5 por grafico), mas la ilustracion del Agente como fondo decorativo del encabezado. Nunca inventa cifras -- solo aplica diseño.",
    },
    {
      id: "http1d",
      name: "HTML a imagen (Rendex)",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1620, 300],
      parameters: {
        method: "POST",
        url: "https://api.rendex.dev/v1/screenshot",
        authentication: "genericCredentialType",
        genericAuthType: "httpHeaderAuth",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "content-type", value: "application/json" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ JSON.stringify({ html: $json.html, format: 'png', width: 900, height: 1200 }) }}",
        options: { response: { response: { responseFormat: "file" } } },
      },
      credentials: { httpHeaderAuth: { id: "", name: "Rendex API Key (Authorization)" } },
      notes: "Opcion mas simple: un solo paso (a diferencia de hcti.io que necesita crear + descargar por separado), y usa la MISMA forma de credencial que ya configuraste para OpenAI (Header Auth, header 'Authorization', valor 'Bearer TU-LLAVE'). 500 imagenes gratis al mes. Consigue la llave en rendex.dev.",
    },
    {
      id: "http1b",
      name: "HTML a imagen (crear en hcti.io) [alternativa]",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1620, 380],
      disabled: true,
      parameters: {
        method: "POST",
        url: "https://hcti.io/v1/image",
        authentication: "genericCredentialType",
        genericAuthType: "httpBasicAuth",
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ JSON.stringify({ html: $json.html }) }}",
        options: {},
      },
      credentials: { httpBasicAuth: { id: "", name: "hcti.io (User ID + API Key)" } },
      notes: "Alternativa a Rendex. Credencial 'Basic Auth': usuario = tu User ID, password = tu API Key, ambos en el dashboard de hcti.io. Plan gratis: 50 imagenes/mes. Devuelve { url, id }, no la imagen directamente -- necesita el nodo 'descargar de hcti.io' despues.",
    },
    {
      id: "http1c",
      name: "HTML a imagen (descargar de hcti.io) [alternativa]",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1740, 380],
      disabled: true,
      parameters: {
        method: "GET",
        url: "={{ $json.url }}",
        options: { response: { response: { responseFormat: "file" } } },
      },
      notes: "Solo se usa junto con 'crear en hcti.io'. hcti.io devuelve una URL (no el binario directo) -- este nodo la descarga.",
    },
    {
      id: "http1",
      name: "HTML a imagen (Puppeteer propio) [alternativa, requiere servidor]",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1620, 460],
      disabled: true,
      parameters: {
        method: "POST",
        url: "http://localhost:4000/render",
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ JSON.stringify({ html: $json.html, width: 900 }) }}",
        options: { response: { response: { responseFormat: "file" } } },
      },
      notes: "Alternativa si tienes tu propio servidor: usa el microservicio Puppeteer (ver html-image-service/ en esta carpeta). Reemplaza 'localhost' por el nombre real del servicio si lo despliegas en EasyPanel u otro PaaS basado en Docker.",
    },
    {
      id: "respond1",
      name: "Responder al webhook",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [1860, 300],
      parameters: {
        respondWith: "json",
        responseBody: "={{ { imageBase64: $binary.data.toString('base64') } }}",
      },
    },
  ],
  connections: {
    Webhook: {
      main: [[
        { node: "Preparar datos para el Agente", type: "main", index: 0 },
        { node: "Combinar datos e imagen", type: "main", index: 1 },
      ]],
    },
    "Preparar datos para el Agente": { main: [[{ node: "Agente IA (elige ilustracion)", type: "main", index: 0 }]] },
    "Agente IA (elige ilustracion)": {
      main: [[
        { node: "Generar imagen IA (OpenAI)", type: "main", index: 0 },
        { node: "Generar imagen IA (Gemini) [alternativa]", type: "main", index: 0 },
      ]],
    },
    "Modelo de Chat (OpenAI)": { ai_languageModel: [[{ node: "Agente IA (elige ilustracion)", type: "ai_languageModel", index: 0 }]] },
    "Generar imagen IA (OpenAI)": { main: [[{ node: "Normalizar imagen (OpenAI)", type: "main", index: 0 }]] },
    "Normalizar imagen (OpenAI)": { main: [[{ node: "Combinar datos e imagen", type: "main", index: 0 }]] },
    "Generar imagen IA (Gemini) [alternativa]": { main: [[{ node: "Normalizar imagen (Gemini)", type: "main", index: 0 }]] },
    "Normalizar imagen (Gemini)": { main: [[{ node: "Combinar datos e imagen", type: "main", index: 0 }]] },
    "Combinar datos e imagen": { main: [[{ node: "Construir HTML de la infografia", type: "main", index: 0 }]] },
    "Construir HTML de la infografia": { main: [[{ node: "HTML a imagen (Rendex)", type: "main", index: 0 }]] },
    "HTML a imagen (Rendex)": { main: [[{ node: "Responder al webhook", type: "main", index: 0 }]] },
  },
  settings: { executionOrder: "v1" },
};

fs.writeFileSync(
  require("path").join(__dirname, "lienzo-ejecutivo-infografia.json"),
  JSON.stringify(workflow, null, 2)
);
console.log("workflow JSON generado");

