# Manual de usuario

## 1. Generar un panel ejecutivo (dashboard principal)

Abre `frontend/dashboard/index.html` (o [rosal-bi.netlify.app](https://rosal-bi.netlify.app)).
La navegación está en el menú lateral izquierdo (en celular/tablet, un
botón ☰ arriba a la izquierda lo despliega).

1. **🔍 Buscar / Cargar**: escribe una palabra clave (ej. "trámites",
   "PAE", "presupuesto") y presiona "Consultar API" — se consulta en
   vivo el catálogo de datos.gov.co, incluyendo metadatos reales
   (vistas, descargas, entidad publicadora). O usa "📂 Subir
   Excel/CSV/JSON" para un archivo local.
2. **Revisa el plan del panel**: el sistema perfila las columnas
   (Fecha, Dimensión, Medida) y propone KPIs, gráficos y tablas —
   incluida una fila con **proyección** cuando hay fecha + medida (con
   un rango de confianza, no un número único, si la tendencia ha sido
   volátil). Marca/desmarca cualquier elemento y cambia el tipo de
   cualquier gráfico (barras, líneas, anillo, área polar, dispersión)
   antes de generar.
3. **"✨ Generar Lienzo"**: arma el panel final (pestaña "📊 Lienzo
   Ejecutivo").
4. **"📄 Descargar PDF"**: exporta el panel completo, paginado
   automáticamente si es más largo que una página A4.
5. **Pestaña "🤖 Análisis IA"**: incluye
   - El **comparador de pares**: elige una entidad (ej. El Rosal),
     opcionalmente un grupo de pares (ej. solo municipios de
     Cundinamarca), y ve su ranking, promedio del grupo, y posición
     relativa.
   - Hallazgos automáticos por cada gráfica seleccionada, incluida
     estadística real (desviación estándar, correlación, valores
     atípicos) y referencias externas (resumen de Wikipedia + datasets
     relacionados, marcados claramente como enlaces externos).
6. **Pestaña "🗂️ Datos Originales"**: ficha completa de metadatos y una
   muestra de los datos crudos, con cada columna etiquetada según su
   tipo detectado.
7. **Chat (ícono 💬 abajo a la derecha)**: preguntas rápidas ("top 10
   de X", "promedio de Y", "cuántos registros hay") se responden al
   instante. Preguntas más abiertas ("cómo está El Rosal en este
   tema", "dame una proyección") las responde el **Narrador Experto**
   — un modelo de IA conectado vía n8n que usa los datos ya calculados
   del panel (la lista completa de cada gráfica, no solo lo más
   destacado) para responder directo, sin inventar cifras.

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

**¿Mis datos se suben a algún servidor?** El análisis, el plan del
panel y la generación del PDF corren 100% en tu navegador. Hay dos
excepciones puntuales, siempre visibles para el usuario: (1) el panel
de referencias externas hace una llamada a la API pública de Wikipedia
para el resumen de la entidad detectada; (2) si usas el chat con una
pregunta abierta, se manda al Narrador Experto (vía n8n) un resumen de
los KPIs/gráficas/estadísticas ya calculados — nunca el archivo
original completo fila por fila.

**¿Por qué el chat a veces tarda más la primera vez?** El primer
mensaje de cada dataset cargado manda el contexto completo (para que
el Narrador pueda responder sobre cualquier categoría, no solo lo más
destacado) — los mensajes siguientes de esa misma conversación son más
rápidos porque ya no repiten esa información.
