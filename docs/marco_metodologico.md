# Metodología (CRISP-ML)

Este proyecto sigue los lineamientos de **CRISP-ML** (Cross-Industry
Standard Process for Machine Learning), tal como lo sugieren los
términos de referencia del Concurso Datos al Ecosistema 2026.

## Nivel de complejidad declarado

**Intermedio.** El proyecto integra 3 o más conjuntos de datos abiertos
(catálogo completo de datos.gov.co vía API + datasets propios del
municipio + registros federados por URL), con más de 10 variables por
dataset típico, e incorpora procesos de limpieza, transformación e
integración de datos (ver fase de *Data Preparation* abajo), además de
perfilado heurístico automático de columnas, proyección estadística
con rango de confianza, y un Agente de IA conectado vía n8n (el
"Narrador Experto") que interpreta esos resultados ya calculados. No
se clasifica como "avanzado" porque no integra fuentes en tiempo real
de Big Data, modelos de machine learning entrenados propios, ni
arquitecturas multiagente.

## 1. Business & Data Understanding

**Problema de negocio:** los ciudadanos y funcionarios de El Rosal no
tienen forma sencilla de explorar los datos abiertos del municipio —
la mayoría existen como tablas de Excel sin visualización, y publicar
nuevos datasets en datos.gov.co implica un ciclo de 3 a 5 días de
espera por errores de calidad que, en su mayoría, son detectables de
antemano.

**Fuentes de datos identificadas:**
- Catálogo nacional de datos.gov.co (API Socrata pública).
- Registros sectoriales propios de la Alcaldía (trámites SUIT,
  población SISBEN, presupuesto/SECOP).
- El propio dataset público de datos.gov.co con el listado oficial de
  22 códigos de error de calidad (`xbc7-65j4`), usado como fuente de
  verdad para el verificador — no una lista inventada.

**Validación de viabilidad:** se probó con un archivo real rechazado
por datos.gov.co (Plan Anual de Adquisiciones de El Rosal) y con
datasets sintéticos diseñados a propósito para activar cada regla, para
confirmar que el enfoque generaliza más allá de un solo caso.

## 2. Data Preparation

- **Limpieza determinística**: detección y remoción de filas de
  "TOTAL"/resumen (menos del 40% de campos llenos), sin intervención
  manual.
- **Inferencia de tipos por columna**: categórica, numérica, fecha o
  identificador — con reglas explícitas para excluir columnas casi
  únicas (probables IDs) y columnas constantes (sin variación útil).
- **Sin techo artificial de cardinalidad**: se corrigió un primer
  diseño que descartaba columnas con más de 25 valores distintos —esto
  eliminaba justo las columnas más informativas (ej. "Diagnóstico" con
  30 enfermedades distintas). Ahora se agrupan las categorías menos
  frecuentes en "Otros" en vez de perderlas.

## 3. Modeling

No hay un modelo de machine learning entrenado propio — el "modelado"
determinístico de este proyecto (motor de perfilado de columnas,
motor de propuesta de KPIs y gráficos, estadística descriptiva,
correlación, detección de atípicos, y proyección con rango de
confianza) es una capa de reglas fijas en JavaScript, corre en el
navegador, y es la ÚNICA fuente de cualquier cifra que ve el usuario.

Aparte de eso, el proyecto sí tiene un componente de IA generativa: el
"Narrador Experto", un Agente conectado vía n8n a un modelo de
lenguaje (OpenAI/Gemini/Anthropic, intercambiable) que responde
preguntas del chat. Su rol está deliberadamente acotado: recibe los
números que el navegador ya calculó y los explica — nunca calcula, ni
estima, ni tiene acceso al dataset crudo. Es una decisión de diseño
motivada por rigor técnico: eliminar el riesgo de alucinación
numérica en un contexto de datos públicos, sin renunciar a que un
modelo de lenguaje aporte donde sí es bueno — interpretar y explicar.

## 4. Evaluation

- Cada componente se probó con **datos reales o sintéticos diseñados
  para activar casos límite** (no solo con datos "felices"): archivo
  real rechazado por datos.gov.co, dataset de 650 registros de
  población con 15 dimensiones, archivo con 10 problemas de calidad
  simultáneos a propósito, y un valor numérico corrupto inyectado a
  propósito para confirmar que el motor estadístico lo descarta en vez
  de dejarlo contaminar un promedio.
- El motor estadístico se probó con 10.000 filas sintéticas, confirmando
  que el cálculo completo (perfilado + KPIs + estadística) toma menos
  de 100 ms — sin bloquear la interfaz incluso con datasets grandes.
- Las pruebas de extremo a extremo se hicieron con un navegador real
  (Chromium vía Puppeteer), no solo revisando el código — incluyendo
  verificación pixel por pixel de que los colores/notas del Excel
  anotado caen exactamente donde deben, y de que ningún texto se
  desborda de las tarjetas en la presentación.
- El flujo del Narrador Experto se probó simulando tanto una respuesta
  exitosa como una caída de red — confirmando que el chat nunca se
  queda "pensando" indefinidamente ni falla en silencio.
- Se comparó el archivo real subido a GitHub contra lo entregado,
  confirmando cero diferencias y verificando la sintaxis del código
  directo desde el repositorio publicado.

## 5. Deployment

- **Frontend**: sitio estático (`frontend/`), desplegado en Netlify sin
  build step — accesible desde cualquier navegador sin instalar nada.
- **IA**: el flujo de n8n (`ai/n8n/`) es la única pieza que no vive en
  el navegador — necesita una instancia de n8n activa con una
  credencial de modelo de chat configurada.
- **Reproducibilidad**: todo el código fuente vive en este repositorio
  público, sin dependencias privadas ni claves embebidas en el código
  (la credencial del modelo de chat se configura en n8n, nunca en el
  repositorio).

## 6. Monitoring (propuesto, no implementado aún)

Pendiente para una fase posterior a la entrega: registrar cuántas
consultas ciudadanas se hacen por dataset (ver propuesta de esquema en
`database/schema.sql`, tabla `consultas_ciudadanas`), para priorizar
qué datasets vale la pena profundizar primero.
