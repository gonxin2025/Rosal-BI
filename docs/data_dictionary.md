# Diccionario de datos

Rosal BI no trabaja con un dataset fijo — cualquier conjunto de datos
de datos.gov.co o un archivo local puede cargarse. Por eso este
diccionario no describe columnas específicas, sino la **taxonomía
interna** que el sistema usa para clasificar y estructurar cualquier
dataset que reciba.

## Clasificación automática de columnas (`profile`)

| Categoría | Cómo se detecta | Ejemplo típico |
|---|---|---|
| **Fecha** | Nombre contiene "fecha", "año"/"ano", "vigencia", "year"; o el valor es un año de 4 dígitos consistente; o `Date.parse()` lo reconoce en columnas no puramente numéricas. Nunca se aplica si la columna ya se detectó como identificador. | `fecha_registro`, `vigencia`, `ano` |
| **Medida** | Valores numéricos, columna no identificada como Fecha ni excluida por ser identificador. | `valor_tramite`, `tasa_matriculacion` |
| **Dimensión** | Texto corto (menos de 50 caracteres), no numérico, no identificador. | `municipio`, `dependencia`, `tipo_solicitud` |
| **Identificador (excluido)** | Nombre contiene "id" o "cod" — se excluye de Fecha, Medida y Dimensión por igual, sin importar si el valor coincide con un patrón de fecha o es numérico. | `id_tramite`, `codigo_dane`, `codigomunicipio` |

**Nota sobre un bug real corregido**: originalmente, la verificación de
identificador solo se aplicaba al excluir Medida y Dimensión — la
clasificación de Fecha se evaluaba primero, sin revisarla. Una columna
como `codigomunicipio` (contiene "cod") coincidía con el patrón de 4
dígitos y terminaba clasificada como Fecha, generando "tendencias" sin
sentido (comparando códigos de municipio como si fueran años). También
se corrigió que `Date.parse()` de JavaScript interpreta números
grandes como años absurdos (`Date.parse("201500")` es válido) — ahora
ese reconocimiento solo se intenta sobre columnas no puramente
numéricas. Ver `tests/test-column-classification.js`.

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

## Modelos de análisis predictivo

Rosal BI ofrece **dos** métodos de proyección, ambos 100% deterministas
(ninguno usa IA ni machine learning entrenado) — el usuario elige cuál
ver con un botón, nunca lo decide un algoritmo por detrás.

### 1. Tasa de crecimiento promedio (`calcPred`) — método por defecto

Se aplica siempre que hay al menos 2 periodos con datos válidos.

1. Se calcula la tasa de crecimiento entre cada par de periodos
   consecutivos: `(valor_actual - valor_anterior) / valor_anterior`.
2. Se promedian esas tasas y se calcula su desviación estándar.
3. La proyección del siguiente periodo es: `último_valor × (1 + tasa_promedio)`.
4. El rango de confianza es `último_valor × (1 + tasa_promedio ± 1 desviación_estándar)` —
   se ensancha si la tendencia ha sido volátil, se estrecha si ha sido estable.

Estructura de retorno: `{ label, value, rangeLow, rangeHigh, volatility, trend, isPrediction }`.

**Por qué se eligió sobre métodos más complejos (ARIMA, redes
neuronales):** con las series cortas típicas de datasets municipales
(3-10 años), un modelo complejo no es más preciso, es más difícil de
auditar y más propenso a sobreajustar al ruido con tan pocos puntos.
La literatura clásica de pronóstico (competencias M de Makridakis) ha
mostrado repetidamente que en series cortas y ruidosas, los métodos
simples igualan o superan a los complejos.

### 2. Regresión lineal (`calcPredLineal`) — alternativa opcional

**Criterio de elegibilidad**: solo se ofrece (aparece el botón "📈 Ver
con regresión lineal") cuando hay **8 o más periodos** con datos
válidos — con menos, ofrecer este método sería fingir un rigor que los
datos no respaldan.

1. Se ajusta una recta de mínimos cuadrados (`y = a + b·x`) sobre
   **todos** los puntos históricos a la vez — no solo las variaciones
   entre periodos consecutivos, como el método por defecto.
2. Se calcula el error estándar de la regresión (qué tan lejos caen los
   puntos reales de la recta ajustada).
3. El rango de confianza usa la fórmula estándar de intervalo de
   predicción para regresión lineal simple: incorpora tanto el error de
   ajuste como la incertidumbre de proyectar un punto nuevo.

Estructura de retorno: idéntica a `calcPred` — mismos campos, para que
la interfaz pueda mostrar cualquiera de los dos sin cambios.

**Por qué es "mejor" que el método por defecto, y por qué no es el
único**: usa más información histórica (todos los puntos, no solo las
tasas consecutivas) y tiene una fórmula de confianza estadísticamente
más formal. No se hizo el método por defecto porque, con menos de 8
periodos, una recta ajustada a 3-4 puntos es fácil de malinterpretar
como más rigurosa de lo que realmente es.

### Por qué no elige el sistema automáticamente

Se evaluó que la IA (o una heurística) eligiera el método según el
patrón de los datos (ej. detectar estacionalidad). Se decidió, a
propósito, dejar la elección en manos del usuario con un botón visible
— más simple de auditar, y evita la pregunta "¿por qué el sistema
eligió este modelo y no otro?" sin una respuesta clara. Ver
`docs/roadmap.md` para la discusión completa.

## Estructura del contexto enviado al Narrador Experto

Ver `ai/n8n/README.md` para el contrato completo — en resumen: `{
pregunta, titulo, categoria, institucion, kpis[], graficos[] (lista
completa por categoría, no solo un top 5), estadisticas{},
otrasColumnasDisponibles[], sessionId, esPrimerMensaje }`.
