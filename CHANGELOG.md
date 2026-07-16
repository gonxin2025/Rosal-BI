# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Por hacer
- Registrar el proyecto en https://herramientas.datos.gov.co/usos (requisito del concurso).

## [0.4.0] — Lienzo Ejecutivo reemplaza la consola original

### Cambiado
- `frontend/dashboard/` ahora contiene **Lienzo Ejecutivo** en vez de la consola original (`el-rosal-consola`): perfilado heurístico de columnas (fecha/dimensión/medida), plan de panel revisable con checkboxes antes de generar, tabla de proyección estadística, metadatos reales del dataset desde la API de Socrata.

### Corregido
- Bug real de bucle infinito en la exportación a PDF: cuando la altura del lienzo caía cerca de un múltiplo exacto de página A4, un residuo de punto flotante impedía que el bucle de paginado terminara, colgando el navegador indefinidamente. Corregido con una tolerancia en la condición del bucle más un salvavidas defensivo.

### Eliminado
- Archivo duplicado `docs/README (3).md` (artefacto de una subida anterior).

### Agregado
- Identidad visual real de Rosal BI: logo, favicon y banner oficiales (reemplazan los placeholders generados).
- `presentacion/`: deck de la presentación ante el jurado.

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
