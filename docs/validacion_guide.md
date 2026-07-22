# Guía de validación para pares

Pensada para que cualquier persona (jurado, par evaluador, otro
municipio) pueda comprobar por sí misma las afirmaciones de este
proyecto, sin tener que confiar en nuestra palabra.

## 1. Verificar que los cálculos son reales, no inventados

1. Carga cualquier dataset con una columna numérica.
2. Anota el KPI "Suma de [columna]" que muestra la app.
3. Descarga el dataset original y súmalo tú mismo en Excel (`=SUMA(...)`).
4. Debe coincidir exactamente (redondeo aparte). Si no coincide, es un
   bug real que queremos que nos reporten.

## 2. Verificar que la IA no inventa cifras

1. Carga un dataset, genera el lienzo, abre el chat.
2. Pregúntale al Narrador Experto algo que **no** esté en ningún KPI ni
   gráfica (ej. una columna que decidiste no graficar).
3. Confirma que responde citando la lista completa que sí tiene, o que
   dice explícitamente que no tiene ese dato — nunca debería inventar
   un número.

## 3. Verificar el rendimiento con datasets grandes

1. Carga un dataset de varios miles de filas (o usa el catálogo de
   datos.gov.co, que tiene varios así).
2. Abre las herramientas de desarrollador del navegador (F12) → pestaña
   "Performance" o simplemente observa: el perfilado y las gráficas
   deben aparecer en menos de un segundo, sin que la página se congele.

## 4. Verificar la exportación a PDF

1. Genera un lienzo con varias gráficas y tablas (mientras más
   contenido, mejor prueba).
2. Descarga el PDF — debe completarse en segundos, nunca quedarse
   "Generando PDF..." indefinidamente (ese era un bug real que se
   corrigió, documentado en `frontend/dashboard/README.md`).

## 5. Verificar la responsividad

1. Abre [rosal-bi.netlify.app](https://rosal-bi.netlify.app) en un
   celular real, o usa el modo de dispositivo móvil del navegador
   (F12 → ícono de celular/tablet).
2. El menú lateral debe convertirse en un botón ☰ que despliega un
   panel — sin que nada se salga de la pantalla horizontalmente.

## 6. Verificar el código fuente directamente

Todo el código está en
[github.com/gonxin2025/Rosal-BI](https://github.com/gonxin2025/Rosal-BI) —
`frontend/dashboard/index.html` es el archivo completo. No hay
minificación ni ofuscación: se puede leer línea por línea.

## 7. Replicar en otro dataset o municipio

1. Descarga `frontend/dashboard/index.html`.
2. Ábrelo en el navegador — no requiere instalación ni configuración.
3. Búscalo con cualquier término relacionado con tu propio municipio
   o entidad en el buscador — si el portal usa Socrata o DKAN, debería
   funcionar igual.
