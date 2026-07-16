# Manual de usuario

## 1. Generar un lienzo ejecutivo (dashboard principal)

Abre `frontend/dashboard/index.html` (o [rosal-bi.netlify.app](https://rosal-bi.netlify.app)).

1. **Busca un dataset**: escribe una palabra clave (ej. "trámites",
   "presupuesto") y presiona "Consultar" — se consulta en vivo el
   catálogo de datos.gov.co, incluyendo sus metadatos reales (vistas,
   descargas, entidad publicadora).
2. **O carga el tuyo**: usa "📂 Subir Archivo" para un CSV o JSON local.
3. **Revisa el plan del panel** (pestaña "Resumen del panel"): el
   sistema perfila las columnas (fechas, dimensiones, medidas) y
   propone automáticamente tarjetas KPI, gráficos y tablas de resumen
   — incluida una tabla de **proyección** cuando hay fecha + medida
   (marca el periodo estimado con una etiqueta "Estimado").
   - Usa "✨ Ver solo sugerencias IA" para ver solo lo que el sistema
     considera más relevante, o desactívalo para ver todas las
     combinaciones posibles.
   - Marca o desmarca cualquier tarjeta/gráfico/tabla con el checkbox.
   - Cambia el tipo de cualquier gráfico (barras, líneas, anillo, área
     polar) con el menú desplegable.
4. **"✨ Generar Lienzo"**: arma el panel final con lo que dejaste
   marcado (pestaña "Lienzo Ejecutivo").
5. **"📄 Descargar PDF"**: exporta el lienzo completo, paginado
   automáticamente si es más largo que una página A4.
6. **Pestaña "Datos Originales"**: ficha completa de metadatos
   (creación, actualización, vistas/descargas, entidad, categoría) y
   una muestra de los datos crudos, con cada columna etiquetada según
   su tipo detectado (Fecha, Categoría, Numérica, Texto).

## 2. Verificar calidad antes de publicar

Abre `frontend/verificador-calidad/index.html`.

1. Sube tu Excel/CSV, o pega la URL del recurso (si publicas por enlace).
2. (Opcional) Escribe el título y descripción que piensas usar al
   publicar — habilita 3 chequeos adicionales.
3. Clic en "Verificar calidad". Vas a ver una tabla con cada error
   detectado, el código oficial, la solución recomendada, y un enlace a
   la guía de apoyo.
4. Completa las descripciones de columna en el formulario de abajo para
   resolver el error de metadata incompleta.
5. **Descargar Excel con errores marcados**: te llevas una copia de tu
   archivo con las celdas problemáticas resaltadas en color y una nota
   explicando cada una — para revisarlo directo en Excel.

## Preguntas frecuentes

**¿Necesito instalar algo?** No. Ambas herramientas son un solo archivo
HTML que corre en el navegador.

**¿Mis datos se suben a algún servidor?** No. Todo el análisis, el plan
del panel y la generación del PDF corren en tu navegador. La única
llamada externa es a la API pública de datos.gov.co para buscar/cargar
datasets.
