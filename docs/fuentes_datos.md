# Fuentes de datos

Todas las fuentes reales que Rosal BI consume o puede consumir. No hay
datos simulados ni inventados en ninguna parte de la aplicación.

## Fuente principal: catálogo de datos.gov.co (API Socrata / SODA)

| Endpoint | Uso |
|---|---|
| `https://www.datos.gov.co/api/catalog/v1?q={busqueda}` | Búsqueda en vivo de datasets en todo el catálogo nacional. |
| `https://www.datos.gov.co/resource/{id}.json?$limit=100` | Muestra inicial (100 filas) al elegir un dataset del buscador. |
| `https://www.datos.gov.co/resource/{id}.json?$limit=50000` | Carga completa al generar el lienzo — límite de seguridad de 50.000 filas. |
| `https://www.datos.gov.co/api/views/{id}.json` | Metadatos reales: vistas, descargas, entidad publicadora, fecha de creación/actualización, categoría. |

No hay llave de API — el catálogo de datos.gov.co es de acceso público.

## Fuente secundaria: Wikipedia

`https://es.wikipedia.org/w/api.php?action=query&prop=extracts...` — se
llama con el nombre de la entidad geográfica detectada en el dataset
(municipio, departamento) para dar un resumen de contexto. Es
asíncrona y no bloqueante: si falla, simplemente no aparece nada, la
app sigue funcionando normal. Se presenta siempre como un enlace
externo, nunca como un hallazgo sobre los datos del usuario.

## Datasets de ejemplo con los que se probó el proyecto

- **Morbilidad Atendida** — Secretaría de Salud (usado en la presentación y en pruebas).
- **MEN_ESTADISTICAS_EN_EDUCACION_EN_PREESCOLAR, BÁSICA Y MEDIA_POR_ETC** — Ministerio de Educación Nacional (usado para el registro de "Usos" en datos.gov.co).
- **Presupuesto de Gastos Ordinarios Histórico** — Contraloría General de la República (candidato identificado para demostrar proyecciones con series largas).
- Datasets sintéticos generados para pruebas de estrés (10.000+ filas, valores atípicos inyectados a propósito) — documentados en `tests/`.

## Fuente de reglas de calidad (verificador)

El listado oficial de errores frecuentes de calidad de datos.gov.co
(`Listado de Errores Frecuentes de Calidad`, dataset público) es la
base de las 22 reglas (ERR001–ERR022) que implementa
`frontend/verificador-calidad/`.

## Lo que NO usamos (y por qué)

- **API del DANE**: no tiene un endpoint estructurado tipo Socrata —
  publica sus boletines en páginas web y PDFs. Evaluado y descartado
  por ahora para enriquecimiento automático de proyecciones (ver
  `docs/roadmap.md`).
- **Búsqueda web general (Tavily, Google, etc.)**: evaluado, con pros y
  contras documentados en el historial de decisiones del proyecto — no
  implementado todavía porque introduce el riesgo de que un modelo de
  lenguaje cite mal una cifra de una fuente en texto libre, a
  diferencia de las APIs estructuradas que sí usamos.
