# Rosal BI (dashboard principal)

El dashboard principal del proyecto. Vive en producción en
[rosal-bi.netlify.app](https://rosal-bi.netlify.app).

## Qué hace

1. **Cargar datos**: busca en vivo en el catálogo de datos.gov.co (API
   Socrata, con metadatos reales — vistas, descargas, entidad
   publicadora) o sube tu propio Excel/CSV/JSON.
2. **Revisar el plan del panel**: perfila cada columna automáticamente
   (Fecha, Dimensión o Medida) y propone KPIs, gráficos y tablas de
   resumen. Se puede marcar/desmarcar qué incluir y cambiar el tipo de
   cada gráfico antes de generar.
3. **Estadística real**: desviación estándar, correlación entre
   variables, y detección automática de valores atípicos — calculado en
   el navegador, nunca estimado por IA. Probado con 10.000 filas en
   menos de 100 ms, sin bloquear la interfaz.
4. **Proyecciones con rango de confianza**: en vez de un número
   falsamente preciso, estima el próximo periodo con un rango que se
   ensancha si la tendencia histórica ha sido volátil.
5. **Comparador de pares**: compara una entidad específica contra el
   total general o contra un grupo de pares (ej. El Rosal vs. otros
   municipios de Cundinamarca) — ranking, promedio del grupo y posición
   relativa.
6. **Referencias externas**: resumen real de Wikipedia sobre la entidad
   detectada + datasets relacionados en datos.gov.co, presentados
   siempre como enlaces externos, nunca mezclados con los hallazgos
   calculados sobre los datos del usuario.
7. **Narrador Experto (chat con IA real)**: preguntas rápidas ("top 10
   de X", "promedio de Y") se responden al instante y gratis, sin
   llamar a nada externo. Preguntas más abiertas se escalan a un modelo
   de lenguaje conectado vía n8n (ver [`../../ai/n8n/README.md`](../../ai/n8n/README.md))
   que responde directo con cifras reales — nunca calcula ni inventa un
   número, y nunca abre con un párrafo de contexto genérico que no fue
   lo que se preguntó. Solo el primer mensaje de cada dataset manda el
   contexto completo; los siguientes usan memoria de conversación.
8. **Exportación a PDF**: el lienzo completo, multipágina si hace
   falta, en alta resolución.
9. **Responsive**: el menú lateral se convierte en panel deslizable en
   tablet/celular; probado sin desborde horizontal en 375px, 768px y
   1440px de ancho.

## Principio de diseño

Todo lo determinístico (perfilado, KPIs, correlación, desviación
estándar, proyección, agregaciones de las gráficas) corre en
JavaScript puro en el navegador. La IA (el Narrador Experto) solo
recibe los números ya calculados y los explica — nunca es la fuente de
una cifra.

## Bugs reales corregidos (documentados porque se repitieron más de
una vez al regenerar el archivo)

- **PDF con bucle infinito**: cuando la altura del lienzo caía cerca de
  un múltiplo exacto de página, un residuo de punto flotante impedía
  que el bucle de paginado terminara. Corregido con una tolerancia en
  la condición del bucle (`> 0.5` en vez de `> 0`) más un salvavidas
  defensivo (`if (alto <= 0) break`).
- **Suma en vez de promedio en columnas tipo tasa/porcentaje**: sumar
  una tasa a través de años o entidades no tiene sentido matemático, y
  además amplificaba cualquier valor corrupto del dataset de origen.
  Se detectan columnas tipo tasa por nombre y se promedian por defecto,
  con rechazo de valores fuera de un rango razonable (protege contra
  errores de formato/exportación del dataset original).
- **PDF cortando gráficas/tablas a la mitad**: el corte de página caía
  a veces en medio de una tarjeta. Se calculan los límites reales de
  cada KPI/gráfica/tabla y el corte se ajusta al inicio del siguiente
  bloque, en vez de partirlo.
- **Columnas identificadoras clasificadas como fecha**: una columna
  como `codigomunicipio` o `codigovigencia` contiene "cod" (debería
  excluirse como identificador) pero también podía coincidir con los
  patrones de detección de fecha (4 dígitos, o la palabra "vigencia" en
  el nombre) — y la lógica nunca revisaba si ya era un identificador
  antes de marcarla como fecha. Producía "tendencias" sin sentido
  comparando códigos de municipio como si fueran años. Corregido:
  ningún identificador puede clasificarse como fecha.
- **Números grandes mal interpretados como fecha**: `Date.parse("201500")`
  en JavaScript lo interpreta como "el año 201500" — cualquier columna
  numérica con valores grandes podía colarse como fecha por accidente.
  Corregido: el reconocimiento de fecha por `Date.parse()` ya no se
  intenta sobre columnas puramente numéricas.

## Pendiente

- El nombre de la carpeta sigue siendo `dashboard` por compatibilidad
  con enlaces existentes, aunque la marca del proyecto es "Rosal BI".
