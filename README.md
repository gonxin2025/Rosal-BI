# 🏛️ Rosal BI

Plataforma de inteligencia de datos y datos abiertos para el municipio de **El Rosal, Cundinamarca**.

Desarrollado para el **Concurso Datos al Ecosistema 2026: IA para Colombia** (Ministerio TIC), categoría **Innovación y Tecnología** — reto: *"Diseñar asistentes virtuales que faciliten el acceso ciudadano a datos abiertos"*.

## ¿Qué hace este proyecto?

- Un ciudadano busca o carga un conjunto de datos (desde datos.gov.co, un Excel/CSV, o una API/URL propia).
- La plataforma lo analiza automáticamente: detecta columnas, totaliza, genera hallazgos en texto y gráficas — sin que nadie configure nada a mano.
- Se puede pedir un resumen ejecutivo, una infografía con diseño temático (generada localmente o vía IA a través de un flujo de n8n), o exportar todo a PDF.
- Antes de publicar cualquier dataset en datos.gov.co, se puede verificar en segundos contra el listado oficial de errores de calidad (22 códigos, ERR001–ERR022) y descargar el mismo Excel con las celdas problemáticas marcadas.

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| [`docs/`](docs/) | Documentación técnica y funcional completa |
| [`frontend/`](frontend/) | La consola web, el verificador de calidad y assets visuales |
| [`backend/`](backend/) | Servicios de apoyo (API, modelos, rutas) — en construcción |
| [`datasets/`](datasets/) | Datos originales, procesados, y catálogo |
| [`dashboards/`](dashboards/) | Tableros temáticos por sector |
| [`ai/`](ai/) | Prompts, workflow de n8n, y todo lo relacionado con IA |
| [`scripts/`](scripts/) | Utilidades de importación, limpieza y exportación de datos |
| [`database/`](database/) | Esquema y migraciones |
| [`images/`](images/) | Recursos gráficos del proyecto |

## Empezar rápido

1. Abre `frontend/index.html` en el navegador — no necesita servidor ni build.
2. Para conectar el flujo de IA (imagen temática + narrativa), importa `ai/n8n/asistente-el-rosal-imagen.json` en tu instancia de n8n — instrucciones en [`ai/n8n/README.md`](ai/n8n/README.md).
3. Para verificar la calidad de un dataset antes de publicarlo, abre `frontend/verificador-calidad/index.html`.

Ver [`docs/arquitectura.md`](docs/arquitectura.md) para el detalle técnico completo.

## Licencia

Este proyecto se publica bajo licencia MIT — ver [`LICENSE`](LICENSE).

## Estado del proyecto

Ver [`CHANGELOG.md`](CHANGELOG.md) para el historial de cambios y [`docs/roadmap.md`](docs/roadmap.md) para lo que sigue.
