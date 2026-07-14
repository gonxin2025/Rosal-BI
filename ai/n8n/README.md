# Flujo: Resumen Visual con IA — El Rosal

## Por que NO se genera la imagen con un modelo de IA generativa

Pedirle a un modelo de imagenes (DALL-E, Flux, Stable Diffusion...) que
dibuje una infografia con cifras exactas ("95,3% de ejecucion
presupuestal", una tabla comparativa 2024 vs 2025) es un riesgo real: estos
modelos son excelentes con ilustraciones pero **no garantizan texto ni
numeros correctos** dentro de la imagen. Para un informe de gestion
publica, un numero mal renderizado no es un detalle esteico -- es un
problema de credibilidad.

## La solucion: separar "quien redacta" de "quien dibuja"

Este flujo divide el trabajo en dos partes con responsabilidades claras:

1. **Motor deterministico** (Code node en n8n, sin IA): calcula los KPIs,
   los porcentajes y las graficas agregadas directamente de los datos
   reales. Nunca se equivoca en un numero porque no "genera" nada, solo
   suma y cuenta.
2. **Agente de IA** (LLM): solo redacta el titulo y el resumen narrativo
   en un tono profesional -- nunca inventa cifras, porque se le pide
   explicitamente que use unicamente los datos que le llegan.
3. **Captura exacta**: el HTML final (datos + narrativa) se renderiza en
   un navegador headless (Puppeteer) y se toma una captura de pantalla.
   Es una imagen real de datos reales, no una alucinacion visual.

## Archivos incluidos

- `asistente-el-rosal-imagen.json` -- workflow de n8n, listo para importar
  (Menu ⋮ → Import from File, dentro de n8n).
- `html-image-service/` -- microservicio Node.js que expone `POST /render`
  y convierte cualquier HTML en un PNG exacto usando Puppeteer.

## Instalar el microservicio de imagenes

En el mismo servidor donde corre n8n:

```bash
cd html-image-service
npm install
node server.js
```

Esto deja el servicio escuchando en `http://localhost:4000/render`. Puedes
probarlo directo:

```bash
curl -X POST localhost:4000/render -H "Content-Type: application/json" \
  -d '{"html":"<h1>Hola El Rosal</h1>"}' --output prueba.png
```

**Nota:** Puppeteer descarga su propio Chromium al hacer `npm install`
(~200 MB) -- necesitas conexion a internet en el servidor la primera vez.

### Alternativa sin self-hosting

Si prefieres no mantener este microservicio, puedes reemplazar el nodo
"HTML a imagen" del workflow por una llamada a un servicio pago como
[htmlcsstoimage.com](https://htmlcsstoimage.com) o
[urlbox.io](https://urlbox.io) -- ambos reciben HTML y devuelven una
imagen, con el mismo principio de "renderizar, no generar".

## Importar y conectar el workflow en n8n

1. Abre n8n → **Import from File** → selecciona `asistente-el-rosal-imagen.json`.
2. El workflow trae 10 nodos ya conectados. Solo necesitas:
   - **Credencial de IA**: el nodo "Agente IA (redacta narrativa)" llama a
     la API de Anthropic. Crea una credencial de tipo API Key en n8n y
     referenciala en el header `x-api-key` (o cambia la URL/headers si
     prefieres usar OpenAI u otro proveedor).
   - **URL del microservicio de imagenes**: si no corres el servicio en
     `localhost:4000` del mismo servidor, ajusta la URL en el nodo
     "HTML a imagen".
3. Activa el workflow y copia la URL del nodo Webhook (termina en
   `/webhook/asistente-el-rosal-imagen`) -- esa es la `WEBHOOK_URL` que ya
   tienes parametrizada en la consola de Netlify.

## Que espera recibir el webhook

```json
{
  "query": "como van los tramites",
  "datasetId": "abcd-1234",
  "datasetName": "Tramites SUIT El Rosal"
}
```

O, para datos cargados manualmente (Excel/API) en la consola:

```json
{
  "query": "como van los tramites",
  "manualData": [{ "columna1": "valor", "columna2": 123 }],
  "datasetName": "Archivo cargado manualmente"
}
```

## Que devuelve

El mismo contrato JSON `type: "tablero"` que ya usa la consola (`stats`,
`insights`, `charts`, `columns`, `rows`), mas un campo nuevo:

```json
{ "imageBase64": "iVBORw0KGgoAAAANSUh..." }
```

La consola puede mostrar la vista interactiva de siempre **y** ofrecer un
boton "Descargar imagen" usando ese base64 (`data:image/png;base64,...`),
para compartir el resumen como imagen en redes o WhatsApp -- que es
justo el formato de la infografia de referencia, pero con datos
verificables.

## Nuevo: modo directo "infografia" (sin volver a analizar los datos)

El boton **"Generar infografia"** de la consola ahora le manda al webhook
`{ mode: "infografia", analysis: {...} }`, donde `analysis` es
exactamente lo que la consola ya calculo (totales, hallazgos, graficas) —
sin filtros, sobre los datos consolidados completos, tal como se acordo.

El workflow detecta este modo con el nodo **"Viene ya analizado
(infografia)?"** justo despues del webhook, y si es asi, salta
completamente el analisis (no vuelve a traer datos de datos.gov.co ni
recorre columnas) -- va directo a redactar la narrativa y generar la
imagen tematica sobre lo que la consola ya totalizo. El camino viejo
(`datasetId` o `manualData`, sin `mode`) sigue funcionando igual que
antes para cuando se quiera pedir el analisis completo desde cero.

Se encontro y corrigio un problema real durante las pruebas: la consola
clasifica las categorias con tilde ("Trámites") pero el mapeo de
prompts de imagen las tenia sin tilde ("Tramites"), asi que el prompt
caia siempre al generico. Se normalizan acentos antes de comparar, para
que funcione igual venga la categoria de la consola o del propio
analisis de n8n.

El workflow ahora tiene una rama en paralelo que genera una **ilustracion
decorativa** segun el tema del dataset -- esta es la parte donde la IA
generativa de imagenes SI tiene sentido, porque no lleva texto ni cifras,
solo estilo. El nodo "Preparar prompt de imagen" mapea la categoria
detectada a una escena:

| Categoria detectada | Ilustracion |
|---|---|
| Salud | doctor con bata y estetoscopio |
| Educacion | maestro con libros |
| Tramites | funcionario con carpeta y checklist |
| Presupuesto y Finanzas | analista con grafico de barras |
| Construccion e Infraestructura | ingeniero con casco y planos |
| Seguridad | policia |
| Movilidad | ingeniero de transito junto a un bus |
| Ambiente | guardaparques sembrando un arbol |
| Agropecuario | agricultor con cosecha |
| Discapacidad | escena inclusiva, silla de ruedas y acompañante |
| Demografia y Poblacion | grupo diverso de la comunidad |
| (sin categoria) | funcionario generico con laptop y documentos |

Esa imagen se combina con el titulo y resumen del agente de texto en un
encabezado, y debajo se arma una cuadricula de **entre 4 y 7 bloques**
(tarjetas de KPI + graficas reales en Chart.js -- dona, barras, linea o
comparativo agrupado), priorizando hasta 3 tarjetas de estadisticas y
llenando el resto con graficas. Si el dataset no tiene suficientes
columnas utiles, se muestran los bloques que existan (nunca se inventan
datos para completar el numero).

### Nodos nuevos

- **Preparar prompt de imagen** (Code): arma el prompt segun la categoria.
- **Generar imagen IA** (HTTP Request): llama a la API de imagenes de
  OpenAI (`dall-e-3`, `response_format: "b64_json"`). Puedes cambiarlo por
  Flux, Stability u otro proveedor de imagenes -- solo debe devolver la
  imagen en base64.
- **Combinar narrativa e imagen** (Merge): sincroniza las dos ramas
  paralelas (texto + imagen) antes de armar el HTML final.

## Colores tematicos tambien en las graficas del flujo

Antes, las graficas dentro de la imagen generada por n8n siempre salian
en verde/navy fijo, sin importar el tema del dataset. Ahora usan el mismo
mapeo de color por categoria que la consola (`THEME_COLORS`, replica de
`CATEGORY_THEME`): Salud en tonos rojizos, Educacion en azul-teal,
Tramites en navy, etc. -- tanto el encabezado como las graficas.

Verificado con Chromium real: para un dataset de "Salud" el color de
fondo del encabezado salio exactamente `rgb(216, 90, 48)` (`#D85A30`), y
las graficas quedaron dibujadas en esos mismos tonos.

## Agente de IA intercambiable (en vez de una llamada HTTP fija)

El nodo que redacta el titulo y el resumen ya no es una llamada HTTP fija
a la API de Anthropic (esa forma tenia ademas un error real: usaba
`$credentials.anthropicApi.apiKey` en una expresion, algo que **no es
valido en n8n** — las credenciales no se leen asi desde una expresion).

Ahora es el nodo nativo **AI Agent** de n8n
(`@n8n/n8n-nodes-langchain.agent`), conectado a un nodo de modelo de chat
separado (**"Modelo de Chat (OpenAI)"**, usando `gpt-4o-mini` por
defecto) a traves del puerto especial `ai_languageModel` — no un puerto
normal de datos. Para cambiar de proveedor:

1. Borra el nodo "Modelo de Chat (OpenAI)".
2. Agrega el nodo equivalente que quieras — **Google Gemini Chat Model**,
   **Anthropic Chat Model**, etc. (busca "Chat Model" en el buscador de
   nodos de n8n).
3. Conectalo al mismo puerto `ai_languageModel` del nodo Agente.
4. Asigna su credencial nativa (cada uno usa el tipo de credencial normal
   de ese proveedor — OpenAI, Google, Anthropic — nada de Header Auth
   manual, eso ya lo maneja el nodo).

El resto del flujo no cambia: el Agente sigue recibiendo el mismo
analisis deterministico y devolviendo texto en su campo `output`, que
"Construir HTML" ya sabe leer.

**Sobre el error si algo esta mal configurado**: si el nodo del modelo de
chat no tiene una credencial valida (o la credencial esta vencida/mal
puesta), n8n marca el nodo Agente en rojo al ejecutar el workflow, con el
mensaje de error especifico (ej. "Unauthorized" o "Invalid API Key") —
no falla en silencio. Esto es el comportamiento estandar de n8n para
cualquier nodo con credenciales invalidas.

## Chart.js sin depender de un CDN externo

Durante las pruebas se detecto que si el servidor donde corre el
microservicio de imagenes tiene salida a internet restringida o lenta, la
carga de Chart.js desde un CDN puede fallar y las graficas salen en
blanco. Para evitarlo, `html-image-service/vendor/chart.umd.js` trae
Chart.js empaquetado localmente, y el servidor lo inyecta directo en cada
HTML que recibe -- cero dependencia de red externa en el momento de
generar la imagen.

## Verificado antes de entregar (con Chromium real, no solo por sintaxis)

- Se instalo Puppeteer con un Chromium real disponible en este entorno y
  se corrio el flujo completo: HTML generado por "Construir HTML" →
  inyeccion local de Chart.js → captura de pantalla.
- Con el archivo real de tramites SUIT de El Rosal: se detectaron 3
  tarjetas de estadisticas + 4 graficas (total 7, el maximo permitido),
  categoria "Tramites", y el prompt de imagen resultante fue *"a friendly
  civil servant holding a folder and a clipboard..."* -- justo el tipo de
  ilustracion que pediste para ese tema.
- Se confirmo que las 4 graficas quedaron con contenido real dibujado
  (se verifico pixel por pixel que no estaban en blanco) y que la pagina
  no tiro ningun error de JavaScript.

Lo unico que no se pudo probar en este entorno por no tener las
credenciales: la llamada real a la API de imagenes de OpenAI y a la de
Anthropic. Toda la logica que las rodea (armar el prompt, insertar la
respuesta en el HTML, mostrar el numero real sin importar lo que redacte
la IA) ya esta probada con datos reales.
