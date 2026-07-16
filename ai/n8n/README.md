# Flujo de n8n — Crear Infografía (Lienzo Ejecutivo)

> **Estado actual**: este flujo está construido y probado de extremo a
> extremo, pero la versión que hoy corre en producción
> (`frontend/dashboard/index.html`) **no tiene el botón "Crear
> Infografía" conectado** — se quitó en una simplificación reciente del
> HTML. El flujo sigue siendo válido y reutilizable; para activarlo de
> nuevo hay que volver a agregar el botón y su llamada `fetch` al HTML
> (ver `docs/api.md` para el contrato de datos exacto que espera).

Genera una imagen consolidando la informacion del lienzo, en el estilo
de un informe de rendicion de cuentas (encabezado, tarjetas por
categoria, franja "Datos Rapidos"), a partir de exactamente los datos
que ya envia el boton "✨ Crear Infografia" del Lienzo Ejecutivo — no se
cambio ese contrato.

## Decision de diseño importante

La referencia que compartiste ("Informe de Rendicion de Cuentas 2025")
usa la foto de una persona generica. **Esta plantilla NO genera una foto
realista de una persona** — el encabezado usa un tratamiento tipografico
limpio en su lugar. Dos razones:

1. Generar con IA la foto de un "funcionario" para un documento oficial
   puede confundirse con una foto real de alguien -- mejor evitarlo.
2. Es 100% deterministico: nunca depende de un modelo de generacion de
   imagenes ni de creditos de API para funcionar.

Los colores, iconos y tarjetas si siguen el mismo espiritu visual de la
referencia (tarjetas redondeadas por categoria, franja de KPIs al final).

## Cómo funciona

```
Boton "Crear Infografia" (ya en tu HTML)
        │  POST { titulo, kpis: [{nombre,valor}], graficos: [{titulo,top5}] }
        ▼
  Webhook (n8n)
        │
        ▼
  Construir HTML de la infografia (Code)
        │  arma las tarjetas de color segun los KPIs y graficos recibidos
        │  -- nunca inventa cifras, solo aplica el diseño
        ▼
  HTML a imagen (HTTP Request → microservicio Puppeteer)
        │
        ▼
  Responder al webhook → { imageBase64 }
        │
        ▼
  El boton recibe la imagen y la descarga automaticamente
```

## Instalación

1. Importa `lienzo-ejecutivo-infografia.json` en tu n8n.
2. **Ya no necesitas servidor propio para la conversión HTML→imagen** —
   el workflow viene configurado por defecto con
   [hcti.io](https://htmlcsstoimage.com), un servicio en la nube (ver
   sección de abajo para configurar la credencial). Si prefieres seguir
   usando tu propio microservicio Puppeteer, esta disponible como
   alternativa desactivada (ver más abajo).
3. Activa el workflow y copia la URL real del webhook.
4. En `index.html`, reemplaza:
   ```js
   const N8N_WEBHOOK_URL = "https://tu-instancia-n8n.app/webhook/crear-infografia";
   ```
   por tu URL real.

## Convertir el HTML en imagen sin servidor propio (default)

Se usa **[Rendex](https://rendex.dev)**: le mandas HTML, te devuelve la
imagen directo, en un solo paso. **500 imágenes gratis al mes** (el
doble que hcti.io), y usa la **misma forma de credencial que ya
configuraste para OpenAI** — un header `Authorization: Bearer TU-LLAVE`,
nada nuevo que aprender.

### Cómo quedó (1 solo paso, a diferencia de hcti.io que necesitaba 2)

**"HTML a imagen (Rendex)"** — `POST https://api.rendex.dev/v1/screenshot`
con `{ html, format: "png", width, height }`. Devuelve la imagen
directamente (no una URL a descargar aparte).

### Configurar la credencial

1. Crea una cuenta gratis en [rendex.dev](https://rendex.dev) (sin
   tarjeta) y copia tu API key.
2. En n8n, crea una credencial **"Header Auth"** (la misma que usaste
   para OpenAI):
   - **Name**: `Authorization`
   - **Value**: `Bearer TU-LLAVE-DE-RENDEX`
3. Asignala en el nodo **"HTML a imagen (Rendex)"**.

### Otras alternativas ya armadas en el workflow (desactivadas)

Si Rendex no te sirve por algún motivo, quedaron listas para activar:

- **hcti.io** (2 nodos: "crear" + "descargar") — Basic Auth (User ID +
  API Key), 50 imágenes/mes.
- **Puppeteer propio** (requiere tu servidor) — ver
  `html-image-service/` en esta carpeta.

Para cambiar de una a otra: desactiva la que esté activa, activa la que
quieras usar, y reconecta "Construir HTML de la infografia" hacia ella
(y esa hacia "Responder al webhook").


## Nota sobre el nodo "Responder al webhook"

La expresion `$binary.data.toString('base64')` para convertir el
binario recibido a base64 puede variar segun la version de n8n. Si al
probarlo el campo `imageBase64` llega vacio, revisa el nombre exacto
del binario en la salida del nodo "HTML a imagen (descargar de hcti.io)"
(normalmente aparece como `data`) y ajusta la expresion en consecuencia.

## Agente de IA que elige la ilustración (nuevo)

Se agregó un Agente de IA real al flujo, conectado a un modelo de chat
intercambiable (mismo patrón que Rosal BI):

```
Webhook ──┬── Preparar datos para el Agente → Agente IA (elige ilustracion) → Generar imagen IA ──┐
          │                                        ↑                                              │
          │                          Modelo de Chat (OpenAI, intercambiable)                       │
          │                                                                                         ▼
          └─────────────────────────────────────────────────────────────────────────→ Combinar datos e imagen
                                                                                                      │
                                                                                                      ▼
                                                                                    Construir HTML de la infografia
                                                                                                      │
                                                                                                      ▼
                                                                                              HTML a imagen → Responder
```

**Regla que se mantiene firme**: el Agente y el modelo de imagen **nunca
deciden ni dibujan cifras**. El Agente solo lee un resumen del panel
(título + nombres de KPIs + títulos de gráficos) y redacta un prompt en
inglés para una ilustración *decorativa* (estilo vector plano, sin
texto, sin números, sin logos) que se usa como textura de fondo detrás
del título — las tarjetas de KPIs y gráficos siguen viniendo 100% del
código determinista de "Construir HTML de la infografia", exactamente
igual que antes.

**Si el Agente o la generación de imagen fallan**, el header simplemente
se ve con el degradado navy solo (sin imagen de fondo) — el flujo no se
cae, y el resultado final sigue siendo un documento completo y legible.

### Cambiar de proveedor de IA

- **Modelo de texto** (elige el prompt): borra "Modelo de Chat (OpenAI)"
  y conecta el equivalente de Gemini/Anthropic al mismo puerto
  `ai_languageModel` del Agente.
- **Modelo de imagen**: cambia la URL/body del nodo "Generar imagen IA"
  por el de otro proveedor (Flux, Stability), manteniendo la salida en
  `b64_json`.

### Verificado

Se probaron los dos nodos Code por separado con datos de ejemplo: con
`imageBase64` presente, el HTML incluye la imagen como fondo semi-
transparente del encabezado (confirmado renderizando con Chromium real,
sin errores); sin `imageBase64` (simulando que el Agente o la imagen
fallaron), el HTML se genera igual de bien, solo con el degradado —
confirmando que la parte de IA es un enriquecimiento opcional, nunca una
dependencia dura del flujo.

## Otra opción para generar la imagen: Google Gemini (HTTPS distinto)

n8n no tiene un nodo nativo dedicado a "generar imagen con Gemini" — se
hace con un **HTTP Request** apuntando directo a la API de Google, igual
que se hizo con OpenAI. Ya está armado en el workflow, **desactivado por
defecto** (nodos "Generar imagen IA (Gemini) [alternativa]" y
"Normalizar imagen (Gemini)").

| | OpenAI (activo por defecto) | Gemini (alternativa) |
|---|---|---|
| Endpoint | `https://api.openai.com/v1/images/generations` | `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent` |
| Header de auth | `Authorization: Bearer sk-...` | `x-goog-api-key: TU-LLAVE` (sin "Bearer") |
| La imagen llega en | `data[0].b64_json` | `candidates[0].content.parts[].inlineData.data` |

### Para activar Gemini en vez de OpenAI

1. En n8n, desactiva (clic derecho → Deactivate) **"Generar imagen IA
   (OpenAI)"** y **"Normalizar imagen (OpenAI)"**.
2. Activa **"Generar imagen IA (Gemini) [alternativa]"** y
   **"Normalizar imagen (Gemini)"**.
3. Crea una credencial "Header Auth" con nombre de header
   `x-goog-api-key` y valor tu API key de
   [Google AI Studio](https://aistudio.google.com/) (la llave sola, sin
   prefijo "Bearer").
4. Asignala en el nodo de Gemini.

**Nota sobre el nombre del modelo**: `gemini-3.1-flash-image` es el
modelo vigente a julio de 2026 según la documentacion oficial de
Google. Los modelos de imagen de Gemini cambian de nombre con cierta
frecuencia (varios ya se deprecaron durante 2026) -- si al usarlo te
da error de modelo no encontrado, revisa el nombre actual en
[ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
y actualiza la URL del nodo.

## Bug real corregido: la imagen de OpenAI nunca llegaba

En la primera version de este agregado, el nodo "Generar imagen IA"
pasaba directo la respuesta cruda de OpenAI (`{ data: [{ b64_json }] }`)
al merge, pero "Construir HTML" esperaba un campo llamado
`imageBase64` -- ese campo nunca existia, asi que la imagen de IA jamas
se habria usado (el header se habria visto siempre con el degradado
solo, sin que nadie se diera cuenta de por que). Se agrego el nodo
**"Normalizar imagen (OpenAI)"** que hace ese traspaso explicito.
Verificado con la forma real de respuesta de cada API (no solo con datos
inventados): ambos normalizadores (OpenAI y Gemini) extraen
correctamente el base64 a `imageBase64`.

## Verificado

- El HTML generado por el nodo "Construir HTML de la infografia" se
  probo con datos de ejemplo (4 KPIs, 2 graficos con top 5 cada uno) y
  se renderizo con Chromium real: se confirmo por pixeles que el
  degradado del encabezado, los colores de las tarjetas (celeste,
  verde, morado) y la franja oscura de "Datos Rapidos" quedan
  exactamente donde deben.
- El boton "Crear Infografia" del HTML se probo con una respuesta
  simulada exitosa del flujo: recibe la imagen, la descarga
  automaticamente como PNG, y muestra el mensaje de exito -- sin
  errores de JavaScript.
