# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Por hacer
- Conectar el webhook de n8n en producción (`WEBHOOK_URL` en `frontend/dashboard/index.html`).
- Instalar y dejar corriendo el microservicio `ai/n8n/html-image-service`.
- Poblar `datasets/catalogo.csv` con los datasets reales de El Rosal.

## [0.3.0] — Verificador de calidad de datos abiertos

### Agregado
- Herramienta independiente (`frontend/verificador-calidad/`) para revisar un Excel/CSV o una URL contra el listado oficial de errores de calidad de datos.gov.co (ERR001–ERR022).
- Descarga del Excel original con las celdas problemáticas resaltadas por color y notas explicando cada error.
- Soporte para cargar datos por URL (datos federados), con validación de formato abierto (ERR010).

## [0.2.0] — Flujo de IA con n8n

### Agregado
- Workflow de n8n (`ai/n8n/asistente-el-rosal-imagen.json`): analiza datos ya consolidados, redacta una narrativa con un Agente de IA (modelo de chat intercambiable), genera una ilustración temática según la categoría del dataset, y compone una imagen final.
- Microservicio de captura HTML→imagen basado en Puppeteer (`ai/n8n/html-image-service`).

## [0.1.0] — Consola de datos abiertos

### Agregado
- Consola web (`frontend/dashboard/`): búsqueda en el catálogo de datos.gov.co, carga manual de Excel/CSV/API, análisis automático (KPIs, hallazgos en texto, gráficas), exportación a PDF e infografía.
