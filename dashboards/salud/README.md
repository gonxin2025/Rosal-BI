# Dashboard temático: Salud

## Qué dataset buscar en Rosal BI

- **"Morbilidad Atendida"** (Secretaría de Salud / Ministerio de Salud) —
  usado como ejemplo real en la presentación del proyecto. Confirmado
  existente en datos.gov.co, con metadatos reales (48.302 vistas,
  6.117 descargas al momento de la prueba).
- Buscar también: "cobertura de vacunación", "afiliación al régimen
  subsidiado/contributivo", "mortalidad" — por municipio o
  departamento.

## KPIs y gráficos sugeridos

- Total de atenciones/casos registrados (KPI).
- Tendencia por año — para activar la proyección con rango de
  confianza si hay 2+ años, o el botón de regresión lineal si hay 8+.
- Distribución por tipo de diagnóstico o dependencia (gráfico de
  barras o anillo).
- Comparador de pares: El Rosal vs. otros municipios de Cundinamarca en
  la misma métrica.

## Estado

Especificación lista — no requiere desarrollo adicional, solo cargar
el dataset sugerido en `frontend/dashboard/`.
