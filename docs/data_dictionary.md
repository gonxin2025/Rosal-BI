# Diccionario de datos

Rosal BI no trabaja con un dataset fijo — cualquier conjunto de datos
de datos.gov.co o un archivo local puede cargarse. Por eso este
diccionario no describe columnas específicas, sino la **taxonomía
interna** que el sistema usa para clasificar y estructurar cualquier
dataset que reciba.

## Clasificación automática de columnas (`profile`)

| Categoría | Cómo se detecta | Ejemplo típico |
|---|---|---|
| **Fecha** | Nombre contiene "fecha", "año"/"ano", "vigencia", "year"; o el valor es un año de 4 dígitos consistente; o `Date.parse()` lo reconoce. | `fecha_registro`, `vigencia`, `ano` |
| **Medida** | Valores numéricos, columna no identificada como Fecha ni excluida por ser identificador. | `valor_tramite`, `tasa_matriculacion` |
| **Dimensión** | Texto corto (menos de 50 caracteres), no numérico, no identificador. | `municipio`, `dependencia`, `tipo_solicitud` |
| **Identificador (excluido)** | Nombre contiene "id" o "cod" — se excluye de KPIs/gráficos por defecto. | `id_tramite`, `codigo_dane` |

Una columna especial: si el nombre contiene "tasa", "porcentaje",
"promedio", "índice", "cobertura", "desercion", "aprobacion",
"reprobacion", "ratio" o "proporcion", se marca como **columna tipo
tasa** — se agrega por promedio en vez de suma por defecto, y se
descarta cualquier valor fuera de un rango razonable (protege contra
errores de formato del dataset de origen).

## Estructura de un KPI (`proposedKPIs` / `selectedKPIs`)

```
{ id, title, type: "count_all"|"sum"|"avg"|"unique", col, desc, isAI }
```

## Estructura de un gráfico (`proposedCharts` / `selectedCharts`)

```
{ id, title, cat, val, op: "sum"|"avg"|"count", type: "bar"|"line"|"doughnut"|"polarArea"|"scatter"|"barHorizontal", desc, isAI }
```

## Estructura de estadística real (`calcStats`)

```
{ n, mean, stdDev, cv, min, max }
```
`cv` = coeficiente de variación (`stdDev / |mean| * 100`).

## Estructura de proyección (`calcPred`)

```
{ label, value, rangeLow, rangeHigh, volatility, trend, isPrediction }
```

## Estructura del contexto enviado al Narrador Experto

Ver `ai/n8n/README.md` para el contrato completo — en resumen: `{
pregunta, titulo, categoria, institucion, kpis[], graficos[] (lista
completa por categoría, no solo un top 5), estadisticas{},
otrasColumnasDisponibles[], sessionId, esPrimerMensaje }`.
