// Genera el workflow de n8n para el chat "Narrador Experto" de Rosal BI.
// Ejecutar: node build-workflow.js
const fs = require("fs");

// =========================================================================
// Codigo del nodo "Preparar contexto para el Narrador"
// =========================================================================
// Recibe exactamente lo que el chat de Rosal BI ya calculo localmente
// (nunca datos crudos, nunca el dataset completo): la pregunta, los KPIs,
// el top 5 de cada grafica seleccionada, y las estadisticas reales
// (media/desviacion/correlacion/atipicos) que el motor local ya calcula.
// Convierte eso en un resumen de texto legible para el Agente.
const prepararContextoCode = `
const raw = $input.first().json;
// El nodo Webhook de n8n anida el POST body real bajo "body" -- esto
// cubre ambos casos (si en tu version/config viene anidado o plano),
// para que nunca vuelva a llegar vacio como paso la primera vez.
const body = (raw && typeof raw.body === 'object' && raw.body !== null) ? raw.body : raw;
const pregunta = body.pregunta || "";
const sessionId = body.sessionId || "sesion-sin-id";
const esPrimerMensaje = body.esPrimerMensaje !== false; // por compatibilidad, si no viene se asume primero

// A partir del segundo mensaje de la misma conversacion, la app ya NO
// reenvia los KPIs/graficas/estadisticas -- el Agente los recuerda via
// memoria de n8n (ver nodo "Memoria de la conversacion"), evitando
// repetir el mismo contexto grande en cada mensaje del chat.
if (!esPrimerMensaje) {
  return [{ json: { resumenParaNarrador: "PREGUNTA DE SEGUIMIENTO DEL USUARIO (usa el contexto de tu memoria de esta conversacion): " + pregunta, pregunta, sessionId } }];
}

const titulo = body.titulo || "el dataset";
const categoria = body.categoria || "General";
const institucion = body.institucion || "Datos Abiertos Colombia";
const kpis = Array.isArray(body.kpis) ? body.kpis : [];
const graficos = Array.isArray(body.graficos) ? body.graficos : [];
const estadisticas = body.estadisticas || {};
const comparacion = body.comparacion || null;
const otrasColumnas = Array.isArray(body.otrasColumnasDisponibles) ? body.otrasColumnasDisponibles : [];

let resumen = "DATASET: " + titulo + " | CATEGORIA: " + categoria + " | FUENTE: " + institucion + "\\n\\n";

if (kpis.length) {
  resumen += "KPIS CALCULADOS (estos son los UNICOS numeros que puedes citar como cifras de este dataset):\\n";
  kpis.forEach(k => { resumen += "- " + k.nombre + ": " + k.valor + "\\n"; });
  resumen += "\\n";
}

if (graficos.length) {
  resumen += "GRAFICAS (LISTA COMPLETA de cada categoria, ordenada de mayor a menor -- puedes citar CUALQUIERA de estos valores, incluidos los ultimos/menores, no solo los primeros):\\n";
  graficos.forEach(g => {
    const nota = g.truncado ? \` (mostrando las primeras \${g.valores.length} de \${g.totalCategorias} categorias totales)\` : \` (\${g.totalCategorias} categorias, lista completa)\`;
    resumen += "- " + g.titulo + nota + ":\\n";
    (g.valores || []).forEach(d => { resumen += "    " + d.label + ": " + d.value + "\\n"; });
  });
  resumen += "\\n";
}

if (estadisticas.media !== undefined) {
  resumen += "ESTADISTICA DESCRIPTIVA: media=" + estadisticas.media + ", desviacion_estandar=" + estadisticas.desviacion +
    (estadisticas.correlacion !== undefined && estadisticas.correlacion !== null ? ", correlacion=" + estadisticas.correlacion : "") + "\\n\\n";
}

if (estadisticas.proyeccion) {
  resumen += "PROYECCION YA CALCULADA (no la recalcules, solo interpretala): " + JSON.stringify(estadisticas.proyeccion) + "\\n\\n";
}

if (estadisticas.atipicos && estadisticas.atipicos.length) {
  resumen += "VALORES ATIPICOS DETECTADOS: " + estadisticas.atipicos.join(", ") + "\\n\\n";
}

if (otrasColumnas.length) {
  resumen += "OTRAS COLUMNAS DISPONIBLES EN LA TABLA (no estan en ninguna grafica del panel, pero SI puedes citar estos numeros -- lista completa, no solo los primeros):\\n";
  otrasColumnas.forEach(c => {
    const nota = c.truncado ? \` (mostrando las primeras \${c.valores.length} de \${c.totalCategorias} categorias totales)\` : \` (\${c.totalCategorias} categorias, lista completa)\`;
    resumen += "- " + c.columna + nota + ":\\n";
    (c.valores || []).forEach(d => { resumen += "    " + d.label + ": " + d.value + " registros\\n"; });
  });
  resumen += "\\n";
}

if (comparacion) {
  resumen += "EL USUARIO QUIERE COMPARAR: " + JSON.stringify(comparacion) + "\\n\\n";
}

resumen += "PREGUNTA DEL USUARIO: " + pregunta;

return [{ json: { resumenParaNarrador: resumen, pregunta, sessionId } }];
`;

const workflow = {
  name: "Rosal BI - Chat Narrador Experto",
  nodes: [
    {
      id: "webhook1",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [240, 300],
      webhookId: "rosal-bi-chat-narrador",
      parameters: {
        path: "chat-narrador",
        httpMethod: "POST",
        responseMode: "responseNode",
        options: {},
      },
    },
    {
      id: "code1",
      name: "Preparar contexto para el Narrador",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [480, 300],
      parameters: { mode: "runOnceForAllItems", jsCode: prepararContextoCode },
      notes: "Convierte los KPIs/graficas/estadisticas que la app YA calculo en un resumen de texto. El Agente nunca ve el dataset crudo, solo estos numeros ya calculados.",
    },
    {
      id: "memory1",
      name: "Memoria de la conversación",
      type: "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      typeVersion: 1.3,
      position: [720, 620],
      parameters: {
        sessionIdType: "customKey",
        sessionKey: "={{ $json.sessionId }}",
        contextWindowLength: 8,
      },
      notes: "Guarda las ultimas 8 interacciones de CADA conversacion (identificada por sessionId, que la app genera una vez por dataset cargado). Esto es lo que le permite al Narrador recordar el contexto sin que la app se lo repita en cada mensaje.",
    },
    {
      id: "agent1",
      name: "Narrador Experto (Agente IA)",
      type: "@n8n/n8n-nodes-langchain.agent",
      typeVersion: 1.7,
      position: [720, 300],
      parameters: {
        promptType: "define",
        text: "={{ $json.resumenParaNarrador }}",
        options: {
          systemMessage:
            "Eres el 'Narrador Experto' de Rosal BI, una plataforma de datos abiertos para el municipio de El Rosal, Cundinamarca. La aplicacion ya calculo TODOS los numeros de forma determinista (KPIs, promedios, correlaciones, proyecciones) -- tu trabajo es RESPONDER DIRECTAMENTE la pregunta del usuario usando esos numeros reales, NUNCA calcular ni inventar cifras nuevas.\n\n" +
            "REGLA ABSOLUTA: la unica cifra que puedes citar como dato de ESTE dataset es la que aparece literalmente en el contexto que recibiste (KPIS CALCULADOS, GRAFICAS, ESTADISTICA DESCRIPTIVA, PROYECCION, OTRAS COLUMNAS DISPONIBLES) -- ya sea en este mensaje o en un mensaje anterior de esta misma conversacion (tu memoria). Si la pregunta requiere una cifra que no esta en ninguno de los dos, dilo explicitamente ('ese dato no esta disponible en este panel') en vez de inventarla o estimarla.\n\n" +
            "IMPORTANTE SOBRE LAS GRAFICAS Y COLUMNAS: recibes la LISTA COMPLETA de cada categoria (no solo un 'top 5'), salvo que el mensaje indique explicitamente que se truncó por exceder el limite. Esto significa que SI puedes responder sobre los valores mas bajos ('los ultimos', 'el menor'), sobre una entidad especifica que no sea la mas alta (ej. un municipio puntual), o sobre cualquier categoria intermedia -- BUSCA la entidad exacta que te pregunten en esas listas antes de responder, no asumas que 'no esta disponible' sin revisarlas primero.\n\n" +
            "IMPORTANTE SOBRE LA CONVERSACION: solo el PRIMER mensaje de cada conversacion trae el contexto completo (KPIs/graficas/estadisticas). En los mensajes siguientes, ese contexto NO se repite -- debes recordarlo de tu memoria de esta conversacion, no pedirlo de nuevo ni asumir que no existe.\n\n" +
            "COMO RESPONDER: ve DIRECTO al grano, con las cifras exactas que te pidieron. No abras con un parrafo de contexto general del tema/programa/sector -- eso no es lo que el usuario pidio y le quita espacio a la respuesta real. Ejemplo: si preguntan 'como esta El Rosal en alimentacion escolar y como se ha desempeñado en los años, dame una proyeccion', responde con el valor exacto de El Rosal (buscandolo en las listas completas que recibiste), la evolucion año a año si esta en el contexto, y la proyeccion ya calculada -- todo en cifras reales, sin preambulo institucional. Solo menciona contexto institucional (que hace una entidad, como opera un programa) si eso AYUDA a interpretar la cifra que ya diste, nunca como apertura obligatoria. Si el usuario pide explicitamente contexto o antecedentes del tema, ahi si dalo.\n\n" +
            "Responde en español, tono ejecutivo pero claro, directo, sin tecnicismos innecesarios ni relleno.",
        },
      },
      notes: "El 'Narrador Experto': responde directo con cifras reales de la tabla completa, nunca calcula, y ya no abre con un parrafo de contexto general por defecto -- solo si el usuario lo pide.",
    },
    {
      id: "chatModel1",
      name: "Modelo de Chat (OpenAI)",
      type: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      typeVersion: 1,
      position: [720, 480],
      parameters: { model: "gpt-4o-mini", options: { temperature: 0.3 } },
      credentials: { openAiApi: { id: "", name: "OpenAI account" } },
      notes: "Cambialo por 'Google Gemini Chat Model' o 'Anthropic Chat Model' si prefieres otro proveedor -- solo reconectalo al mismo puerto 'Chat Model' del Agente. Temperature baja (0.3) a proposito: menos creatividad, mas apego a los datos provistos.",
    },
    {
      id: "respond1",
      name: "Responder al webhook",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [960, 300],
      parameters: {
        respondWith: "json",
        responseBody: "={{ { respuesta: $json.output } }}",
      },
    },
  ],
  connections: {
    Webhook: { main: [[{ node: "Preparar contexto para el Narrador", type: "main", index: 0 }]] },
    "Preparar contexto para el Narrador": { main: [[{ node: "Narrador Experto (Agente IA)", type: "main", index: 0 }]] },
    "Narrador Experto (Agente IA)": { main: [[{ node: "Responder al webhook", type: "main", index: 0 }]] },
    "Modelo de Chat (OpenAI)": { ai_languageModel: [[{ node: "Narrador Experto (Agente IA)", type: "ai_languageModel", index: 0 }]] },
    "Memoria de la conversación": { ai_memory: [[{ node: "Narrador Experto (Agente IA)", type: "ai_memory", index: 0 }]] },
  },
  settings: { executionOrder: "v1" },
};

fs.writeFileSync(
  require("path").join(__dirname, "rosal-bi-chat-narrador.json"),
  JSON.stringify(workflow, null, 2)
);
console.log("workflow JSON generado");
