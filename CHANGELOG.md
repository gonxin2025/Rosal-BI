# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

## [0.7.1] — Corrección de clasificación de columnas (identificadores mal detectados como fecha)

### Corregido
- Bug real, encontrado probando con un dataset real de presupuesto de la Contraloría: columnas identificadoras (`codigomunicipio`, `codigovigencia`, cualquier nombre con "id"/"cod") se clasificaban como columnas de Fecha porque coincidían con los patrones de detección (4 dígitos, o "vigencia" en el nombre) sin revisar primero si ya eran un identificador. Producía "tendencias" sin sentido comparando códigos de municipio como si fueran años.
- Bug relacionado: `Date.parse()` de JavaScript interpreta números grandes como años absurdos (`Date.parse("201500")` es válido) — una medida numérica con valores grandes podía colarse como fecha por accidente. Ahora ese reconocimiento solo se intenta sobre columnas no puramente numéricas.
- Nuevo `tests/test-column-classification.js` reproduce y verifica ambos casos.

## [0.7.0] — Regresión lineal opcional, corrección de PDF, especificación de dashboards temáticos

### Agregado
- Botón "📈 Ver con regresión lineal" en la pestaña Análisis IA — aparece solo con 8+ periodos históricos válidos (criterio de elegibilidad), como alternativa transparente al método por defecto. El usuario elige, nunca una IA. Documentado en detalle en `docs/data_dictionary.md`.
- Especificación real (dataset sugerido + KPIs + gráficos) para los 7 dashboards temáticos en `dashboards/` — reemplaza los placeholders vacíos.

### Corregido
- Bug real: la exportación a PDF cortaba gráficas y tablas a la mitad cuando el corte de página caía en medio de una tarjeta. Ahora el algoritmo detecta los límites reales de cada KPI/gráfica/tabla y ajusta el corte al inicio del siguiente bloque — verificado con un dataset de 500 filas que generó 4 páginas, 7 bloques protegidos, cero cortes problemáticos.

### Actualizado
- `docs/roadmap.md`: registro en herramientas.datos.gov.co/usos y confirmación del equipo (Luzaira Henao, líder; ingenieros Luis Sandoval, Kevin Ramírez, Iván Bermúdez) marcados como completados.
- Nota de transparencia y pestaña de Ayuda actualizadas para explicar ambos métodos de proyección.

## [0.6.0] — Estructura de repositorio alineada con la guía avanzada de MinTIC

### Agregado
- `docs/planteamiento_problema.md`, `docs/marco_metodologico.md` (renombrado de `metodologia.md`), `docs/fuentes_datos.md`, `docs/data_dictionary.md`, `docs/validacion_guide.md`, `docs/conclusiones.md`.
- `docs/public_impact_assessment.md` (reemplaza `impacto.md`): impacto + nueva sección de ética y mitigación de sesgos.
- `tests/`: 3 scripts reales de Puppeteer (PDF, columnas tipo tasa, rendimiento con 10.000 filas) que reproducen y verifican la corrección de los bugs documentados, más `README.md` explicando la metodología de pruebas.
- Nota explícita en `docs/README.md` y en el README raíz sobre por qué no existen `notebooks/`, `models/`, `deployments/`, `config/` — la plantilla sugerida por MinTIC asume un proyecto Python/ML con modelos entrenados; Rosal BI es frontend puro con un Agente de IA vía n8n, por decisión de diseño.

### Por hacer
- Registrar el proyecto en https://herramientas.datos.gov.co/usos (requisito del concurso).

## [0.5.1] — Transparencia del modelo predictivo y pestaña de Ayuda

### Agregado
- Nueva pestaña "❓ Ayuda" en la app: manual de uso, APIs y variantes de análisis documentadas, explicación del modelo predictivo, sobre nosotros, preguntas frecuentes, y enlace al repositorio.
- Nota de transparencia visible en la pestaña de Análisis IA explicando el método de proyección (tasa de crecimiento promedio ± 1 desviación estándar) cada vez que aparece una proyección.
- `presentacion/guion-presentacion.md` y `presentacion/preguntas-tecnicas.md`: material de apoyo para la exposición ante el jurado.

### Decisión documentada
- Se evaluó que la IA eligiera dinámicamente el método de proyección según el patrón de los datos. Se pospuso a propósito: se prefiere un único método simple y transparente sobre uno adaptativo, para no introducir complejidad sin probar a fondo cerca de la entrega. Queda en `docs/roadmap.md` como mejora futura.

## [0.5.0] — Rosal BI: rediseño completo, estadística real, IA conectada

### Agregado
- Rediseño completo de la interfaz: navegación por menú lateral, identidad visual "Rosal BI" con logo real, tema oscuro.
- Motor estadístico real: desviación estándar, correlación entre variables, detección automática de valores atípicos — probado con 10.000 filas en menos de 100ms.
- Proyecciones con rango de confianza en vez de un número único.
- Comparador de pares (entidad específica vs. grupo de pares).
- Referencias externas asíncronas y no-bloqueantes: resumen de Wikipedia + datasets relacionados de datos.gov.co.
- Chat con IA real ("Narrador Experto"): flujo de n8n (`ai/n8n/`) con Agente + modelo de chat intercambiable, memoria de conversación por sesión, y acceso a la lista completa de cada gráfica (no solo un "top 5") para responder sobre cualquier categoría.
- Diseño responsive: menú lateral deslizable en tablet/celular, sin desborde horizontal verificado en 375px/768px/1440px.
- Presentación actualizada con la identidad visual real y las nuevas capacidades de IA.

### Corregido
- Bug real: columnas tipo tasa/porcentaje se sumaban en vez de promediarse a través de años/entidades, amplificando valores corruptos del dataset de origen hasta cifras absurdas (2.7×10¹⁷ en un caso real). Ahora se detectan por nombre y se promedian, con rechazo de outliers de formato.
- Bug real: el nodo del webhook de n8n leía el cuerpo del POST en el lugar equivocado (`$json` en vez de `$json.body`), causando que el contexto le llegara vacío al Narrador Experto.
- Bug real del bucle infinito en PDF, que volvió a aparecer al regenerarse el archivo — documentado explícitamente para evitar que se repita una tercera vez.

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
