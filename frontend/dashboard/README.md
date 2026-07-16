# Rosal BI — Lienzo Ejecutivo (dashboard principal)

Este es el dashboard principal de Rosal BI — reemplazó a la consola
original (`el-rosal-consola`) a partir de julio de 2026. Vive en
producción en [rosal-bi.netlify.app](https://rosal-bi.netlify.app).

## Qué hace

1. **Cargar datos**: busca en el catálogo de datos.gov.co o sube un
   archivo (CSV/JSON). Trae también los metadatos reales del dataset
   (vistas, descargas, entidad publicadora, fecha de creación/
   actualización) cuando la fuente es la API de datos.gov.co.
2. **Revisar el plan del panel**: el sistema perfila las columnas
   (fechas, dimensiones, medidas) y propone automáticamente KPIs,
   gráficos y tablas de resumen — incluida una tabla con **proyección
   estadística** cuando hay una columna de fecha y una medida (calcula
   la tasa de crecimiento histórica y estima el próximo periodo,
   marcado como "Estimado"). El usuario marca/desmarca qué incluir, y
   puede cambiar el tipo de cada gráfico antes de generar.
3. **Generar el lienzo**: arma el panel final y permite exportarlo a
   PDF (multipágina, con lógica de recorte/"slicing" para lienzos
   largos).
4. **Datos originales**: pestaña aparte con la ficha completa de
   metadatos y la muestra de datos crudos.

## Diferencias clave vs. la consola anterior (`el-rosal-consola`)

| | Consola anterior | Lienzo Ejecutivo |
|---|---|---|
| Perfilado de columnas | Fijo por reglas de nombre | Heurístico (fecha/dimensión/medida) |
| Selección antes de generar | No — mostraba todo de una vez | Sí — plan revisable con checkboxes |
| Predicción | No | Sí — proyección de próximo periodo |
| Metadatos del dataset | Básicos | Completos, desde la API real de Socrata |

## Bug real corregido: el PDF se colgaba indefinidamente

La función de exportar a PDF (`downloadPdfBtn`) tenía un bucle infinito
real: cuando la altura del lienzo caía muy cerca de un múltiplo exacto
de una página, quedaba un residuo de punto flotante que nunca dejaba
que el bucle terminara. Se reprodujo el colgado exactamente (300 filas,
varias gráficas y tablas seleccionadas — el navegador se quedaba
esperando indefinidamente) y se corrigió con una tolerancia en la
condición del bucle más un salvavidas defensivo. Verificado: el mismo
caso que antes colgaba el proceso ahora termina en ~2.4 segundos y
descarga un PDF real y válido.

## Pendiente

- Cambiar el nombre del archivo/carpeta de `dashboard` a algo que
  refleje "Lienzo Ejecutivo" si se quiere, por ahora se mantuvo la ruta
  para no romper enlaces existentes.
