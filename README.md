<img src="images/banner/banner-rosal-bi.png" alt="Rosal BI — Datos que transforman El Rosal">

# Rosal BI

*"Transformamos datos abiertos de datos.gov.co mediante IA que perfila, grafica y predice tendencias automáticamente, eliminando la barrera técnica para que gobiernos y ciudadanos tomen decisiones ejecutivas en segundos."*

Desarrollado para el **Concurso Datos al Ecosistema 2026: IA para Colombia** (Ministerio TIC), categoría **Innovación y Tecnología** — reto: *"Diseñar asistentes virtuales que faciliten el acceso ciudadano a datos abiertos"*.

## ¿Qué hace Rosal BI?

- Un ciudadano busca o carga un conjunto de datos (desde datos.gov.co, un Excel/CSV, o una API/URL propia) — incluyendo sus metadatos reales (vistas, descargas, entidad publicadora).
- La plataforma perfila las columnas automáticamente (fechas, dimensiones, medidas) y **propone** KPIs, gráficos y tablas de resumen — el usuario revisa el plan y marca qué incluir antes de generar.
- Cuando hay datos históricos, calcula una **proyección estadística** del próximo periodo (tasa de crecimiento promedio), marcada claramente como "Estimado".
- El lienzo final se exporta a PDF, multipágina si hace falta.
- Antes de publicar cualquier dataset en datos.gov.co, se puede verificar en segundos contra el listado oficial de errores de calidad (22 códigos, ERR001–ERR022) y descargar el mismo Excel con las celdas problemáticas marcadas.

**Demo en vivo**: [rosal-bi.netlify.app](https://rosal-bi.netlify.app)

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| [`docs/`](docs/) | Documentación técnica y funcional completa |
| [`frontend/`](frontend/) | Rosal BI (dashboard principal) y el verificador de calidad |
| [`backend/`](backend/) | Servicios de apoyo (API, modelos, rutas) — en construcción |
| [`datasets/`](datasets/) | Datos originales, procesados, y catálogo |
| [`dashboards/`](dashboards/) | Tableros temáticos por sector |
| [`scripts/`](scripts/) | Utilidades de importación, limpieza y exportación de datos |
| [`database/`](database/) | Esquema y migraciones |
| [`images/`](images/) | Recursos gráficos del proyecto |
| [`presentacion/`](presentacion/) | Deck de la presentación ante el jurado |

## Empezar rápido

1. Abre `frontend/dashboard/index.html` en el navegador — no necesita servidor ni build. También disponible en [rosal-bi.netlify.app](https://rosal-bi.netlify.app).
2. Para verificar la calidad de un dataset antes de publicarlo, abre `frontend/verificador-calidad/index.html`.

Ver [`docs/arquitectura.md`](docs/arquitectura.md) para el detalle técnico completo.

## Licencia

Este proyecto se publica bajo licencia MIT — ver [`LICENSE`](LICENSE).

## Estado del proyecto

Ver [`CHANGELOG.md`](CHANGELOG.md) para el historial de cambios y [`docs/roadmap.md`](docs/roadmap.md) para lo que sigue.
