# Evaluación de impacto público, ética y mitigación de sesgos

## Impacto directo en El Rosal

- **Reduce el tiempo de espera de 3–5 días a segundos** para saber si un
  dataset cumple los criterios de calidad de datos.gov.co antes de
  publicarlo — usando el mismo listado oficial de 22 códigos de error
  (ERR001–ERR022) que usa el equipo de Calidad del portal.
- **Elimina la barrera técnica** para que un ciudadano sin conocimientos
  de análisis de datos pueda explorar cualquier dataset municipal:
  carga un archivo o busca uno del catálogo nacional, y obtiene KPIs,
  estadística real, comparaciones y proyecciones sin configurar nada.
- **Detecta datos personales antes de que se filtren**: el verificador
  identifica columnas con posibles cédulas, correos o nombres — un
  riesgo real de cumplimiento (Ley 1581 de 2012) que hoy se revisa
  manualmente, si es que se revisa.

## Por qué escala más allá de El Rosal

1. **Cero dependencia de infraestructura pesada.** Todo el análisis de
   datos corre en el navegador del usuario (HTML + JavaScript puro) —
   cualquier municipio puede alojar una copia en un sitio estático
   gratuito (Netlify, GitHub Pages) sin servidor propio ni base de
   datos.
2. **Las reglas de calidad no son específicas de El Rosal.** El
   verificador usa el listado *oficial y nacional* de errores de
   datos.gov.co — funciona igual de bien para cualquier entidad pública
   de Colombia que publique en el portal.
3. **El motor de análisis es agnóstico al dominio.** Se probó con
   trámites municipales, presupuesto, educación y un dataset sintético
   de población con 15 dimensiones (género, discapacidad, estrato,
   vivienda, servicios públicos...) sin cambiar una línea de código —
   la misma lógica de detección de columnas generaliza a cualquier
   tabla.
4. **La capa de IA (el chat) es opcional y sustituible.** Si un
   municipio no tiene presupuesto para APIs de modelos de lenguaje, el
   sistema sigue funcionando al 100% en su modo determinístico —
   perfilado, KPIs, estadística, comparador y proyecciones no dependen
   de la IA en absoluto, solo el chat con el Narrador Experto.

## Ética y mitigación de sesgos

**Sesgo en la interpretación de la IA.** El mayor riesgo de un asistente
de IA sobre datos públicos es que "suene autoritativo" diciendo algo
impreciso o sesgado. Se mitiga arquitectónicamente, no solo con buenas
intenciones: el Narrador Experto nunca calcula ni tiene acceso al
dataset crudo — solo recibe los agregados ya calculados de forma
determinística, y tiene instrucción explícita de decir "ese dato no
está disponible" en vez de inventar o generalizar. Ver
`docs/data_dictionary.md` para el contrato exacto de lo que recibe.

**Sesgo en qué se destaca vs. qué se omite.** El motor heurístico
propone KPIs y gráficos "más relevantes" según la estructura de los
datos — no según qué historia sea más conveniente contar. Todas las
categorías (incluidas las de menor participación) quedan disponibles
en la lista completa que ve el Narrador Experto, no solo las
destacadas — así una entidad con cifras desfavorables no puede
"desaparecer" del análisis.

**Sesgo en poblaciones no representadas.** El proyecto no supone que
todos los datasets tengan igual calidad para todos los grupos
poblacionales — datasets con baja cobertura rural o de poblaciones
específicas heredan esa limitación de los datos de origen, y Rosal BI
no la corrige ni la oculta (el motor de detección de atípicos puede,
de hecho, ayudar a visibilizar huecos de cobertura si aparecen como
valores extremos).

**Transparencia sobre el método, no solo sobre el resultado.** La nota
de "¿Cómo se calculó la proyección?" (visible en la pestaña Análisis
IA) y la pestaña de Ayuda documentan explícitamente el método
estadístico usado — evita que un número se presente como más preciso
o más "inteligente" de lo que realmente es.

**Privacidad.** No se sube ningún dataset a un servidor propio — el
análisis corre en el navegador del usuario. El verificador de calidad
además ayuda a detectar datos personales *antes* de que se publiquen,
no después.

## Riesgos conocidos y cómo se mitigan

| Riesgo | Mitigación |
|---|---|
| El modelo de lenguaje podría inventar cifras | Arquitectura separa estrictamente cálculo (determinístico, en el navegador) de narración (IA, vía n8n) — el modelo nunca ve el dataset crudo, solo agregados ya calculados, con instrucción explícita de admitir cuando no tiene un dato |
| Dependencia de un proveedor de IA | El nodo del modelo de chat es intercambiable (OpenAI/Gemini/Anthropic) sin tocar el resto del flujo; y el chat es la única pieza que depende de esto — el resto de la app no |
| Falsos positivos/negativos en el verificador de calidad | Se declara explícitamente que no reemplaza la revisión oficial de datos.gov.co — es una capa de detección temprana, no la decisión final |
| Proyecciones interpretadas como certeza | Se muestra siempre un rango de confianza (no un número único) y una nota explícita del método, nunca se presenta como predicción garantizada |

## Métricas propuestas para medir impacto (a futuro)

Registrar cuántas veces se consulta cada dataset y con qué preguntas,
para priorizar qué información municipal genera más interés ciudadano
real (en vez de asumirlo) — pendiente de un backend propio, ver
`docs/roadmap.md`.
