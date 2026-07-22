# Pruebas

Rosal BI no tiene un pipeline de CI/CD automatizado (Netlify despliega
directo con cada push, sin build step) — pero sí se probó
rigurosamente durante el desarrollo, con un navegador real (Chromium
vía Puppeteer), no solo revisando el código. Esta carpeta deja esos
scripts como artefacto real, para que cualquiera pueda repetir las
pruebas.

## Cómo ejecutarlas

```bash
cd tests
npm install puppeteer --save-dev
node test-pdf-export.js
node test-rate-columns.js
node test-statistical-performance.js
```

Cada script carga `frontend/dashboard/index.html` en un navegador real
(headless), simula datos, y verifica el resultado con aserciones
explícitas — no solo "no truena", sino que el número/comportamiento es
el esperado.

## Qué prueba cada uno

- **`test-pdf-export.js`** — reproduce el bug real que colgaba la
  exportación a PDF indefinidamente (residuo de punto flotante en el
  cálculo de paginado) y confirma que el PDF se genera en segundos, no
  que se cuelga.
- **`test-rate-columns.js`** — reproduce el bug real donde una columna
  tipo tasa/porcentaje, con un valor corrupto inyectado a propósito
  (simulando un error de formato del dataset de origen), producía
  cifras del orden de 10¹⁷. Confirma que ahora se promedia
  correctamente y el valor corrupto se descarta.
- **`test-statistical-performance.js`** — confirma que el motor
  estadístico (perfilado, KPIs, desviación estándar, correlación) no
  bloquea la interfaz ni siquiera con 10.000 filas sintéticas — mide el
  tiempo real de ejecución.

## Por qué no hay `tests/unit/`, `tests/integration/`, `tests/bias_tests/` como carpetas separadas

El motor determinístico de Rosal BI es JavaScript puro sin
dependencias externas de lógica de negocio (no hay una API propia que
integrar, no hay un modelo entrenado que auditar por sesgo en el
sentido clásico de ML) — por eso las pruebas de extremo a extremo
(cargar datos reales, generar el panel, exportar el PDF) cubren más
valor real que separar en unitarias/integración para este proyecto en
particular. La mitigación de sesgos del proyecto es arquitectónica
(ver `docs/public_impact_assessment.md`), no un conjunto de tests de
equidad sobre un modelo entrenado que no existe.
