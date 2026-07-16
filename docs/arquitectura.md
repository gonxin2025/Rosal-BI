# Arquitectura del sistema

## Visión general

Rosal BI corre completamente en el navegador, sin backend propio:

```
Ciudadano → Rosal BI / Lienzo Ejecutivo (frontend/dashboard, en Netlify)
                │
                └── Llama directo a la API de datos.gov.co
                    (búsqueda, metadatos y carga de datasets)
```

## Principio de diseño: lo determinístico nunca depende de un modelo de IA

Perfilar un dataset (fechas, dimensiones, medidas), proponer
KPIs/gráficos/tablas, y calcular la proyección estadística del próximo
periodo — todo es lógica de reglas fijas, corre 100% en el navegador,
gratis e instantáneo. Ninguna cifra que ve el usuario depende de que un
modelo de lenguaje la calcule o la redacte.

## Componentes

### `frontend/dashboard/` — Lienzo Ejecutivo
Dashboard principal: búsqueda en el catálogo de datos.gov.co (API
Socrata) con metadatos reales, carga manual de Excel/CSV, perfilado
heurístico de columnas, plan de panel revisable (KPIs/gráficos/tablas
con checkboxes), tabla de proyección estadística, y exportación a PDF
multipágina.

### `frontend/verificador-calidad/`
Herramienta independiente que revisa un dataset contra el listado
oficial de errores de calidad de datos.gov.co (ERR001–ERR022) antes de
publicarlo, y permite descargar el Excel original con las celdas
problemáticas marcadas.

### `datasets/`
- `originales/`: archivos tal como se recibieron (no se versionan si
  contienen datos personales — ver `.gitignore`).
- `procesados/`: versiones limpias/anonimizadas, listas para publicar.
- `catalogo.csv`: inventario de todos los datasets del municipio.

