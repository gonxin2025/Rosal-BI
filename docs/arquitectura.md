# Arquitectura del sistema

## Visión general

Rosal BI tiene tres piezas que se hablan por HTTPS, cada una con una responsabilidad clara:

```
Ciudadano → Consola web (frontend/dashboard, en Netlify)
                │
                ├── Llama directo a datos.gov.co (búsqueda y carga de datasets)
                │
                └── Llama al webhook de n8n (ai/n8n) solo cuando hace falta
                    interpretar una pregunta en lenguaje natural o generar
                    una imagen con IA
                        │
                        ├── Agente de IA (modelo de chat intercambiable:
                        │   OpenAI / Gemini / Anthropic) — redacta texto
                        ├── Generador de imagen (DALL·E u otro proveedor)
                        │   — solo la ilustración decorativa, nunca cifras
                        └── Microservicio Puppeteer (ai/n8n/html-image-service)
                            — captura la imagen final exacta
```

## Por qué esta separación

- **Lo determinístico nunca depende de IA.** Analizar un dataset (tipos de
  columna, totales, hallazgos, gráficas) es lógica de reglas fijas —
  corre 100% en el navegador, gratis e instantáneo, sin importar si n8n
  está prendido.
- **La IA solo hace lo que la IA hace bien.** Redactar una narrativa en
  lenguaje natural, o generar una ilustración temática. Nunca se le pide
  a un modelo de imagen que "dibuje" cifras exactas — eso es trabajo de
  la capa determinística.

## Componentes

### `frontend/dashboard/`
Consola principal: búsqueda en el catálogo de datos.gov.co (API Socrata),
carga manual de Excel/CSV/API propia, motor de análisis automático
(detección de columnas, límite de calidad, generación de hallazgos y
gráficas), exportación a PDF, y generación de infografía (local o vía el
flujo de IA).

### `frontend/verificador-calidad/`
Herramienta independiente que revisa un dataset contra el listado
oficial de errores de calidad de datos.gov.co (ERR001–ERR022) antes de
publicarlo, y permite descargar el Excel original con las celdas
problemáticas marcadas.

### `ai/n8n/`
Workflow de automatización: recibe datos ya analizados por la consola
(o los analiza el mismo si hace falta), llama a un Agente de IA para
redactar una narrativa corta, genera una imagen temática según la
categoría del dataset, y compone el resultado final con el microservicio
de captura HTML→imagen.

### `datasets/`
- `originales/`: archivos tal como se recibieron (no se versionan si
  contienen datos personales — ver `.gitignore`).
- `procesados/`: versiones limpias/anonimizadas, listas para publicar.
- `catalogo.csv`: inventario de todos los datasets del municipio.

## Contrato de datos entre la consola y n8n

Ver [`api.md`](api.md) para el detalle completo del formato JSON que se
intercambia entre el frontend y el webhook de n8n.
