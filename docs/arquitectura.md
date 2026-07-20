# Arquitectura del sistema

## Visión general

Rosal BI es 100% frontend estático para todo lo determinístico, con
una única pieza de backend externa (n8n) exclusivamente para el chat
con IA:

```
Ciudadano → Rosal BI (frontend/dashboard, en Netlify)
                │
                ├── Llama directo a la API de datos.gov.co
                │   (búsqueda, metadatos y carga de datasets)
                │
                ├── Llama a la API pública de Wikipedia
                │   (contexto de la entidad detectada, opcional,
                │   asíncrono, nunca bloquea la interfaz)
                │
                └── Chat "Narrador Experto": llama a un Webhook de n8n
                    (ai/n8n/rosal-bi-chat-narrador.json)
                        │
                        ├── Prepara el contexto (Code) — nunca el
                        │   dataset crudo, solo KPIs/listas completas/
                        │   estadísticas que el navegador ya calculó
                        ├── Memoria de conversación (por sessionId)
                        └── Agente IA (modelo de chat intercambiable:
                            OpenAI / Gemini / Anthropic) — responde
                            directo con las cifras recibidas, nunca
                            calcula ni inventa una cifra nueva
```

## Principio de diseño: lo determinístico nunca depende de un modelo de IA

Perfilar un dataset, proponer KPIs/gráficos/tablas, calcular
desviación estándar, correlación, detección de valores atípicos, y la
proyección con rango de confianza del próximo periodo — todo es
JavaScript puro, corre 100% en el navegador, gratis e instantáneo
(10.000 filas se procesan en menos de 100 ms). El Narrador Experto (la
única pieza de IA del proyecto) solo recibe los números que el
navegador ya calculó y los explica — nunca es la fuente de una cifra.

## Componentes

### `frontend/dashboard/` — Rosal BI
Dashboard principal: búsqueda en datos.gov.co (API Socrata) con
metadatos reales, carga manual de Excel/CSV/JSON, perfilado heurístico
de columnas, plan de panel revisable, motor estadístico (desviación
estándar / correlación / atípicos), proyecciones con rango de
confianza, comparador de pares, referencias externas (Wikipedia +
datasets relacionados), chat con IA real, exportación a PDF
multipágina, y diseño responsive (tablet/celular).

### `frontend/verificador-calidad/`
Herramienta independiente que revisa un dataset contra el listado
oficial de errores de calidad de datos.gov.co (ERR001–ERR022) antes de
publicarlo, y permite descargar el Excel original con las celdas
problemáticas marcadas.

### `ai/n8n/` — Chat "Narrador Experto"
Workflow de n8n que recibe la pregunta del chat más el contexto ya
calculado por el navegador (KPIs, listas completas de cada gráfica —
no solo un "top 5" — estadísticas, proyección), y responde con un
modelo de lenguaje configurable. Tiene memoria de conversación por
sesión, así que solo el primer mensaje de cada dataset manda el
contexto completo. Ver [`../ai/n8n/README.md`](../ai/n8n/README.md)
para el detalle y la instalación.

### `datasets/`
- `originales/`: archivos tal como se recibieron (no se versionan si
  contienen datos personales — ver `.gitignore`).
- `procesados/`: versiones limpias/anonimizadas, listas para publicar.
- `catalogo.csv`: inventario de todos los datasets del municipio
  (pendiente de poblar con el inventario real).

