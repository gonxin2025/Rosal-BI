# El Rosal — Asistente de datos abiertos (consola ciudadana)

Prototipo para el reto de Innovacion y Tecnologia, Concurso Datos al Ecosistema 2026: IA para Colombia.

## Que es esto

Una pagina estatica (`index.html`) que sirve como consola para el ciudadano:

1. **Busca datasets en vivo** directamente contra el catalogo publico de
   datos.gov.co (corre sobre la plataforma Socrata) usando su API de
   Discovery — el ciudadano escribe una palabra clave (ej. "tramites",
   "presupuesto") y ve resultados reales del portal, con nombre, entidad
   que publica, fecha de actualizacion y las columnas disponibles.
2. El ciudadano selecciona un dataset de esos resultados, y presiona
   **"Cargar datos y generar filtros"**. Esto trae hasta 1000 registros
   reales del dataset (directo desde el navegador, sin pasar por n8n),
   analiza cada columna y arma filtros automaticamente:
   - Columnas con pocos valores distintos (2 a 25) -> filtro tipo dropdown.
   - Columnas numericas -> filtro de rango (minimo / maximo).
   - Columnas de texto libre o casi-unicas (probablemente IDs o
     descripciones largas) -> se ignoran como filtro, pero pueden
     aparecer igual en la tabla de resultados.
   Al presionar "Graficar", el filtrado y el armado de la tabla/grafico
   ocurre 100% en el navegador con los datos ya cargados — instantaneo y
   sin costo de IA.
3. Alternativamente, el ciudadano puede escribir su pregunta en lenguaje
   natural y presionar "Consultar": ahi si se llama al webhook de n8n,
   que usa un LLM para interpretar la pregunta (util cuando el ciudadano
   no sabe que filtros usar, o cuando la pregunta combina varias cosas a
   la vez, ej. "comparame esto con el año pasado").
4. Ambos caminos terminan en la misma vista de resultado:
   - `type: "resumen"` -> tarjetas de KPI + barras por sector + logros.
   - `type: "tablero"` -> filtros aplicados + tabla + grafico de barras.

Incluye tres botones de "modo demo" que renderizan datos de ejemplo sin
necesidad de tener n8n conectado, incluyendo uno ("Ver resumen con imagen
IA") que muestra como se ve el resultado cuando el flujo de n8n devuelve
una imagen generada (campo `imageBase64` del contrato de datos).

### Sobre la busqueda de datasets

La busqueda llama directo desde el navegador a:

```
https://api.us.socrata.com/api/catalog/v1?domains=datos.gov.co&search_context=datos.gov.co&only=datasets&q=TERMINO&limit=8
```

Esto **no pasa por n8n** — es una llamada publica de solo lectura al
catalogo de Socrata (la misma plataforma que usa datos.gov.co), que tiene
CORS habilitado para consumo desde paginas web. Cuando el ciudadano
selecciona un dataset, recien ahi se manda `datasetId` + `query` al
webhook de n8n para que la IA filtre los datos reales del recurso
(`https://www.datos.gov.co/resource/{datasetId}.json`).

La carga de datos para generar filtros (boton "Cargar datos y generar
filtros") llama directo a ese mismo endpoint de recurso, tambien sin pasar
por n8n:

```
https://www.datos.gov.co/resource/{datasetId}.json?$limit=1000
```

Tambien publico, tambien con CORS habilitado — es el endpoint estandar de
consumo de cualquier dataset Socrata. n8n solo entra en juego para el
camino de "pregunta en lenguaje natural".

## Otras formas de cargar datos

Si el dataset que buscas no aparece en datos.gov.co, el link **"¿No
encuentras tu dataset? Cargar archivo o API manualmente"** abre un panel
con dos opciones, ambas 100% en el navegador:

- **Archivo Excel o CSV**: se lee con la libreria SheetJS (`xlsx.full.min.js`),
  sin subir el archivo a ningun servidor.
- **URL de una API**: se hace un `fetch` directo a la URL pegada. Acepta
  tanto un arreglo JSON plano como un objeto con la data dentro de
  `data`, `results`, `records` o `rows`. La API debe permitir CORS desde
  el navegador, igual que el resto de fuentes de este prototipo.

Cualquiera de las dos rutas alimenta el mismo motor de inferencia de
columnas y generador de filtros que ya usa la busqueda de datos.gov.co.

## Vista de resultados

En cuanto los datos terminan de cargar (o de un archivo, una API, o de
datos.gov.co), la consola **muestra de una vez un panorama completo
basado en la totalidad de los datos**, sin esperar a que el ciudadano
elija un filtro — al estilo de un reporte de Power BI. Los filtros sirven
para refinar esa vista, no para "destrabarla".

La vista abre con un **bloque tipo resumen ejecutivo** (tarjeta oscura,
como un informe de rendición de cuentas):

- El dato mas importante (total de registros) en grande, como titular.
- La insignia de categoria del dataset (Trámites, Demografía y
  Población, Salud...), detectada por palabras clave en el nombre.
- Los **hallazgos automáticos** (Insight Engine): frases en lenguaje
  natural generadas por plantilla, sin IA. Ejemplos reales con el
  archivo de trámites de El Rosal:
  - "Entre 2017 y 2018, los registros aumentaron 663%."
  - "En Costo, la categoria predominante es 'Gratuito' con 83% del total."

Debajo de ese bloque vienen los detalles: mas tarjetas de estadisticas
(suma/promedio/máximo, comparativo por periodo), **una gráfica por cada
columna relevante de la tabla** (categorica → dona/barras, numerica →
distribucion o histograma por rangos, fecha → tendencia y comparativo
por categoria x año — hasta 8 en total), y la tabla de detalle.

### Resumen ejecutivo: que va en el cliente y que va en n8n

Hay dos formas de llegar a un "resumen ejecutivo" en esta consola, y
cada una vive donde tiene sentido:

- **En el cliente (ya funciona, sin IA)**: el bloque descrito arriba se
  genera automaticamente para *cualquier* dataset que el ciudadano
  cargue, con reglas fijas (total + hallazgos por plantilla). Es rapido,
  gratis, y funciona incluso si n8n esta caido.
- **En el flujo de n8n (pendiente de construir)**: cuando el ciudadano
  pregunta algo amplio en lenguaje natural (ej. "como va la gestion del
  municipio"), decidir *que* datasets combinar y *como agrupar* los
  hallazgos en secciones con sentido (Finanzas, Social, Logros...) — como
  en un informe de rendicion de cuentas real — requiere entender el
  significado del dataset, no solo su estructura de columnas. Eso es
  trabajo para el LLM del flujo de n8n, que puede devolver directamente
  un payload `type: "resumen"` (con `kpis`, `sectors`, `achievements`)
  curado para esa pregunta especifica. Ver la seccion "Contrato de datos
  esperado desde n8n" mas abajo para el formato exacto de ese tipo.

### Como se generan los filtros (reglas de inferencia)

Al cargar un dataset (de datos.gov.co, Excel/CSV o API), cada columna se
clasifica automaticamente para decidir que totalizar y graficar (ya no
se generan filtros interactivos — la consola siempre muestra el
panorama consolidado completo de la tabla):

- **Fecha**: si al menos 90% de los valores son fechas (objetos `Date` de
  Excel o strings ISO) y abarcan 2 años o mas -> tendencia + comparativo
  por año. Si solo hay un año, se ignora.
- **Categorica**: 2 o mas valores distintos, texto corto (promedio menor
  a 60 caracteres), y que **no sean mayoritariamente unicos** (menos del
  60% de valores unicos — esto excluye nombres/IDs de texto libre, pero
  ya no pone techo al numero de categorias). Una columna de "Diagnostico"
  con 30 enfermedades distintas, o "Causa de muerte" con muchas
  categorias, ahora si se totaliza — antes se descartaba si pasaba de 25
  valores distintos, que era exactamente el caso de estas columnas.
  Al graficar, se muestran las 7 categorias mas frecuentes y el resto se
  agrupa en "Otros" (nunca se pierde informacion silenciosamente: la
  suma de las porciones siempre da el 100% de los registros).
- **Numerica**: todos los valores son numeros, **excepto** si:
  - el nombre de la columna parece un identificador (`No.`, `Numero`,
    `Id`, `Consecutivo`...), o
  - todos los valores son distintos entre si (probable columna de ID), o
  - todos los valores son iguales (columna constante, sin variacion util).
  En esos tres casos se descarta (aunque siga siendo numerica).
- **Filas-resumen**: antes de inferir columnas, se descartan filas donde
  menos del 40% de los campos tienen dato — esto cubre filas de "TOTAL"
  o notas de fuente/licencia que suelen venir al final de los Excel que
  publican las entidades (confirmado con el archivo real de tramites SUIT
  de El Rosal, que trae exactamente ese patron).

Hasta 10 columnas se analizan a la vez, priorizando categoricas y fechas
sobre numericas.

## Generar infografia (dos botones, a proposito separados)

Hay dos botones distintos para esto, y la separacion es intencional:

- **"Generar infografia (con flujo IA)"**: SOLO llama al webhook de n8n
  con los datos ya consolidados (`{ mode: "infografia", analysis }`).
  Si el flujo no esta configurado, no responde, devuelve error, o
  responde sin imagen, **muestra el error especifico y se detiene ahi**
  — nunca cae en silencio a un resultado generado localmente. Esto es
  a proposito: un PDF que se ve bien pero que en realidad no paso por el
  flujo de IA seria enganoso.
- **"Diseño local (sin IA)"**: genera un diseño equivalente pero sin
  llamar a n8n — color e icono segun un mapeo fijo `CATEGORY_THEME`
  (Salud = rojo con icono de cruz, Educacion = azul con icono de libro,
  Tramites = navy con icono de carpeta, etc. -- 11 categorias + un tema
  por defecto). Es una eleccion consciente del usuario, no un
  respaldo automatico.

Los mensajes de error del boton de flujo son especificos segun la causa:
`WEBHOOK_URL` sigue en el placeholder, no hubo respuesta en 25 segundos
(workflow inactivo o microservicio de imagenes caido), el servidor
respondio con un codigo de error, o respondio pero sin `imageBase64`.

Probado con los cuatro escenarios: sin configurar, error 500 del
servidor, respuesta sin imagen, y exito real -- en los primeros tres
casos el mensaje de error es claro y el boton se reactiva sin generar
nada; en el cuarto, el PDF se arma con la imagen real que devolvio n8n.

### Diseño local: graficas reales con paleta calida (no barras CSS)

La primera version de "Diseño local (sin IA)" solo dibujaba barras con
CSS (una lista de rectangulos), sin donas ni lineas, con un unico color
plano por categoria, y traia una seccion de texto "Hallazgos
principales" que competia con las graficas por espacio. Se corrigio:

- **Se quito la seccion de hallazgos** — la idea de este boton es ser
  visual, no de texto; ese espacio ahora lo usan mas graficas.
- **Graficas reales con Chart.js** (donas, barras, lineas, comparativo
  agrupado) en vez de barras de CSS — el mismo motor de graficos que ya
  usa el resto de la consola, hasta 12 a la vez.
- **Paleta calida y natural** (`WARM_PALETTE`): terracota, ocre, oliva,
  cafe tierra, arcilla, salvia, mostaza, musgo — rotando un tono por
  grafica en vez de repetir el color de categoria en todo. Verificado
  pixel por pixel con Chromium real que los tonos exactos (`#C1694F`,
  `#D9A441`, etc.) quedan dibujados en los canvas.
- El PDF ahora pagina correctamente si el contenido crece (antes se
  cortaba en una sola pagina A4 sin importar cuantas graficas hubiera).


### Descargar PDF (captura de pantalla)

El boton **"Descargar PDF"** (arriba a la derecha del resultado) usa
`html2canvas` + `jsPDF`, ambos cargados desde CDN, para capturar las
tarjetas, el grafico y la tabla tal como se ven en pantalla y exportarlos
a un PDF de una o varias paginas. No requiere backend ni servidor de
generacion de PDF.

**Bug real que se corrigio**: con datasets de pocas graficas casi no se
notaba, pero con datasets ricos (como el de poblacion, 15 graficas) se
volvio evidente. Chart.js anima la aparicion de cada grafica por defecto
(~1 segundo), y como ahora los datos se cargan y muestran solos (sin el
boton manual que antes daba tiempo de sobra), un clic rapido en
"Descargar PDF" capturaba los canvas **antes de que Chart.js terminara de
dibujar** — graficas completamente en blanco, y como consecuencia, un PDF
que solo mostraba las pocas cifras sueltas en texto plano (total,
comparativo), dando la sensacion de que "los datos son irrelevantes"
cuando en realidad el contenido real estaba ahi, solo que invisible.

Se desactivo la animacion (`animation: false`) en las graficas del panel
principal y se agrego una espera corta antes de capturar. Verificado con
Chromium real comparando antes/despues: sin el fix, los canvas quedaban
en 0 pixeles dibujados al capturar de inmediato; con el fix, ya tienen
contenido real desde el primer instante.

Si en el futuro quieres limitar la busqueda a datasets publicados
especificamente por la Alcaldia de El Rosal (en vez de todo el catalogo
nacional), se puede agregar el parametro `&q=el rosal+TERMINO` o filtrar
por `domain_category`/`attribution` en `renderCatalogResults()`.

## Desplegar en Netlify (equipo confuturoivan)

1. Sube esta carpeta a un repositorio de GitHub o GitLab (esto tambien
   cumple el requisito del concurso de publicar el desarrollo en un
   repositorio abierto).
2. En Netlify: **Add new site -> Import an existing project** y conecta el
   repositorio.
3. Build settings: no se necesita build command. Publish directory: `.`
   (ya viene definido en `netlify.toml`).
4. Despliega. Netlify genera una URL tipo `https://nombre-al-azar.netlify.app`
   (se puede renombrar desde Site settings, o apuntar un dominio propio).
5. Cada push al repo vuelve a desplegar automaticamente.

## Conectar el webhook de n8n

1. Abre `index.html` y busca la constante `WEBHOOK_URL` al inicio del
   `<script>`. Reemplazala por la URL publica y HTTPS de tu webhook de n8n.
2. El webhook de n8n **debe estar en HTTPS**: Netlify sirve la consola por
   HTTPS, y un navegador bloquea llamadas a un endpoint HTTP (contenido
   mixto). Si tu servidor no tiene dominio + certificado todavia, la forma
   mas rapida de salir del paso para el prototipo es un tunel tipo
   Cloudflare Tunnel o ngrok apuntando al puerto de n8n; la solucion
   definitiva es un dominio propio con nginx + Let's Encrypt.
3. En el nodo **Respond to Webhook** de n8n, agrega el header
   `Access-Control-Allow-Origin` con el dominio de Netlify (o `*` mientras
   se prueba) para que el navegador no bloquee la respuesta por CORS.

## Verificar antes de publicar (checa errores de datos.gov.co al instante)

Boton nuevo, junto a "Cambiar", una vez cargado cualquier dataset:
**"Verificar antes de publicar en datos.gov.co"**. Replica en el cliente,
de forma instantanea, el listado **oficial y completo** de errores de
calidad que usa datos.gov.co — consultado directamente de su propio
dataset publico
([xbc7-65j4](https://www.datos.gov.co/resource/xbc7-65j4.csv), 22
codigos ERR001-ERR022), no una lista parcial ni inventada.

De esos 22 codigos oficiales, **13 se verifican automaticamente** solo
con el archivo (mas un titulo/descripcion opcional):

| Codigo | Que revisa |
|---|---|
| ERR001 | Titulo con año/vigencia, muy corto, o con caracteres especiales (si se diligencia un titulo propuesto) |
| ERR002 | Descripcion general del dataset sin diligenciar |
| ERR004 | Dataset sin ningun registro |
| ERR005 | Menos de 50 registros |
| ERR006 | El titulo sugiere ser uno de los 4 datasets obligatorios por Ley 1712/2014 que ya no deben publicarse por separado |
| ERR007 | Celdas vacias (% por columna) |
| ERR008 / ERR008_1 | Una sola columna / menos de 5 columnas |
| ERR008_2 | Columnas sin nombre claro ("Unnamed", "Column1"...) |
| ERR008_3 | Columnas sin descripcion (formulario incluido) |
| ERR009 | Hay columna de direccion pero no de latitud/longitud |
| ERR011 | Sin columna de fecha/año/vigencia (deberia consolidarse) |
| ERR016 | El archivo traia filas de "TOTAL" o resumen en vez de solo detalle (se detecta via el mismo `cleanRows` que ya limpia esas filas) |
| ERR018 | Datos personales o sensibles, por nombre de columna Y por contenido (regex de correo, patron de cedula) |
| ERR019 | Columnas con tipos de dato mezclados (numeros y texto revueltos) |
| ERR020 | Filas duplicadas exactas |

Los otros 9 codigos (ERR003, ERR010, ERR012, ERR013, ERR014, ERR015,
ERR017, ERR021, ERR022) requieren contexto que un archivo aislado no
tiene — comparar contra otros datasets ya publicados en el portal, el
nombre de la cuenta de usuario, el historial de actualizaciones — asi
que se muestran como **recordatorio de revision manual** en vez de
marcarse como error detectado, para que no se pierdan de vista.

El reporte se muestra en la misma estructura de tabla que trae el correo
oficial (Conjunto de datos | Codigo | Descripcion del error | Solucion
recomendada | Guia), con los mismos links de apoyo que manda datos.gov.co
(video de OpenRefine, guias de Google Drive, etc.) mas la guia real de
anonimizacion del Archivo General de la Nacion para ERR018 — todos los
links se verificaron contra la fuente oficial, no se inventaron.

**Importante**: esto NO reemplaza la revision oficial de datos.gov.co —
solo adelanta la deteccion de los problemas mas frecuentes para
corregirlos antes de enviar, en vez de enterarse 3 a 5 dias despues.

### Verificado

- Con un dataset sintetico diseñado a proposito con 10 problemas
  simultaneos (pocas filas, pocas columnas, celdas vacias, sin fecha,
  fila de totales, datos personales, tipos mezclados, duplicados, sin
  descripciones): detecto los 10 codigos correctamente, con el detalle
  exacto de que columnas/filas estaban afectadas.
- Con un dataset limpio y con metadata completa (fecha, sin datos
  personales, sin vacios, con titulo/descripcion/descripciones de
  columna diligenciadas): veredicto "No se detectaron errores
  automatizables", cero falsos positivos.
- Con un titulo de prueba que incluye un año ("PAA 2026"): disparo
  ERR001 correctamente. Con un titulo que coincide con uno de los 4
  datasets obligatorios por ley ("Registro de Activos de Informacion
  2026"): disparo ERR001 y ERR006 a la vez, como se esperaba.

## Contrato de datos esperado desde n8n

El webhook debe responder JSON con una de estas dos formas:

```json
{
  "type": "resumen",
  "kpis": [{ "label": "Ejecucion presupuestal", "value": "95,3%", "delta": "+3,2 pts vs 2024" }],
  "sectors": [{ "label": "Educacion", "value": 4698 }],
  "achievements": ["Cobertura de agua potable del 95,5%"]
}
```

```json
{
  "type": "tablero",
  "title": "Tramites municipales",
  "category": "Trámites",
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
  "filters": [{ "label": "Dependencia", "value": "Hacienda" }],
  "stats": [
    { "label": "Total de registros", "value": "12" },
    { "label": "2017 → 2018", "value": "8 → 61 (+663%)" }
  ],
  "insights": [
    "Se analizaron 12 registros con los filtros aplicados.",
    "En Dependencia, la categoria predominante es \"Hacienda\" con 40% del total."
  ],
  "charts": [
    { "type": "grouped-bar", "title": "Dependencia por año", "labels": ["2017", "2018"],
      "series": [{ "name": "Secretaria de Gobierno", "values": [3, 5] }, { "name": "Hacienda", "values": [1, 4] }] },
    { "type": "line", "title": "Tendencia por año", "labels": ["2017", "2018"], "values": [8, 61] },
    { "type": "donut", "title": "Tramites por Dependencia", "labels": ["Secretaria de Gobierno", "Planeacion", "Hacienda"], "values": [5, 3, 4] }
  ],
  "columns": ["Tramite", "Dependencia", "Valor", "Lugar"],
  "rows": [["Certificado de residencia", "Secretaria de Gobierno", "Gratuito", "Sede principal"]]
}
```

`imageBase64` es opcional (PNG en base64, sin el prefijo `data:image/png;base64,`).
Cuando esta presente, la consola la muestra junto al hero (imagen a la
izquierda, KPI y hallazgos a la derecha) y agrega un boton "Descargar
imagen generada" con esa misma imagen. Es exactamente lo que devuelve el
workflow de n8n `asistente-el-rosal-imagen.json` en el campo del mismo
nombre.

`category` es un texto libre corto que se muestra como insignia junto al
titulo (ej. "Trámites", "Demografía y Población"). `insights` es un
arreglo de frases cortas que se muestran en un panel destacado arriba de
las graficas — si el flujo de n8n usa un LLM para la pregunta en lenguaje
natural, este es un buen lugar para que el modelo redacte 2-4 hallazgos
en vez de (o ademas de) las frases por plantilla que genera la consola en
el camino de filtros automaticos.

`charts` es un arreglo de hasta 8 graficos, cada uno con `type`
(`"bar"`, `"donut"`, `"line"` o `"grouped-bar"`), un `title` corto, y:

- `labels` + `values` para `bar`/`donut`/`line` (un solo valor por etiqueta).
- `labels` + `series` (arreglo de `{ name, values }`, un array de valores
  por cada serie, mismo largo que `labels`) para `grouped-bar` — el
  comparativo tipo "categoria por año". La consola los muestra en
  cuadricula, hasta 4 a la vez.

Por compatibilidad, tambien se acepta el formato anterior de un solo
grafico: `chartSuggestion` (`"bar"` / `"donut"` / `"table"`) +
`chartData: { labels, values, valueLabel }`. Si no mandas ninguno de los
dos pero `chartSuggestion` es `"bar"`, la consola usa la primera columna
de `rows` como etiqueta y la segunda como valor.

Todos los campos son opcionales salvo `type`; la consola renderiza solo lo
que reciba (si no hay `achievements` ni `stats`, simplemente no se
muestra esa seccion).
