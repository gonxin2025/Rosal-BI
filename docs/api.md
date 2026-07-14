# API — contrato de datos entre la consola y n8n

La consola (`frontend/dashboard/`) y el workflow de n8n (`ai/n8n/`) se
comunican por un único webhook HTTPS con dos modos de uso.

## Endpoint

```
POST https://TU-DOMINIO/webhook/asistente-el-rosal-imagen
Content-Type: application/json
```

## Modo 1 — Análisis completo desde cero

La consola envía el dataset (o su identificador) para que n8n lo analice:

```json
{
  "query": "como van los tramites",
  "datasetId": "abcd-1234",
  "datasetName": "Tramites SUIT El Rosal"
}
```

O, para datos cargados manualmente en la consola:

```json
{
  "query": "como van los tramites",
  "manualData": [{ "columna1": "valor", "columna2": 123 }],
  "datasetName": "Archivo cargado manualmente"
}
```

## Modo 2 — Solo la parte visual (recomendado)

Cuando la consola ya analizó y totalizó los datos (botón "Generar
infografía"), le manda a n8n el análisis ya hecho, para que n8n no
vuelva a calcular nada — solo redacte la narrativa y genere la imagen:

```json
{
  "mode": "infografia",
  "analysis": {
    "datasetName": "Tramites SUIT El Rosal",
    "category": "Trámites",
    "totalRows": 69,
    "stats": [{ "label": "Total de registros", "value": "69" }],
    "insights": ["Se analizaron 69 registros en total."],
    "charts": [
      { "type": "donut", "title": "Cantidad de registros por Costo", "labels": ["Gratuito", "Con costo"], "values": [57, 12] }
    ]
  }
}
```

## Respuesta

En ambos modos, n8n responde con el mismo contrato que ya usa la
consola para renderizar resultados:

```json
{
  "type": "tablero",
  "title": "Tramites municipales",
  "category": "Trámites",
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
  "stats": [{ "label": "Total de registros", "value": "12" }],
  "insights": ["..."],
  "charts": [
    { "type": "grouped-bar", "title": "Dependencia por año", "labels": ["2017", "2018"],
      "series": [{ "name": "Secretaria de Gobierno", "values": [3, 5] }] },
    { "type": "line", "title": "Tendencia por año", "labels": ["2017", "2018"], "values": [8, 61] },
    { "type": "donut", "title": "Tramites por Dependencia", "labels": ["A", "B"], "values": [5, 3] }
  ],
  "columns": ["Tramite", "Dependencia", "Valor", "Lugar"],
  "rows": [["Certificado de residencia", "Secretaria de Gobierno", "Gratuito", "Sede principal"]]
}
```

`charts[].type` acepta `"bar"`, `"donut"`, `"line"` o `"grouped-bar"`.
`imageBase64` es opcional (PNG en base64, sin el prefijo
`data:image/png;base64,`) — cuando está presente, la consola la muestra
junto al resumen y permite descargarla directamente.

Todos los campos son opcionales salvo `type`; la consola renderiza solo
lo que reciba.

## Ver también

- [`ai/n8n/README.md`](../ai/n8n/README.md) — cómo importar y configurar
  el workflow completo en tu propia instancia de n8n.
