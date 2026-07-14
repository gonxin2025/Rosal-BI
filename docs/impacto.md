# Impacto y escalabilidad

## Impacto directo en El Rosal

- **Reduce el tiempo de espera de 3–5 días a segundos** para saber si un
  dataset cumple los criterios de calidad de datos.gov.co antes de
  publicarlo — usando el mismo listado oficial de 22 códigos de error
  (ERR001–ERR022) que usa el equipo de Calidad del portal.
- **Elimina la barrera técnica** para que un ciudadano sin conocimientos
  de análisis de datos pueda explorar cualquier dataset municipal:
  carga un archivo o busca uno del catálogo nacional, y obtiene totales,
  hallazgos en texto y gráficas sin configurar nada.
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
   trámites municipales, presupuesto, y un dataset sintético de
   población con 15 dimensiones (género, discapacidad, estrato,
   vivienda, servicios públicos...) sin cambiar una línea de código —
   la misma lógica de detección de columnas generaliza a cualquier
   tabla.
4. **La capa de IA es opcional y sustituible.** Si un municipio no
   tiene presupuesto para APIs de IA, el sistema sigue funcionando al
   100% en su modo determinístico (sin narrativa generada ni imagen
   temática) — no hay una dependencia dura de un proveedor de pago.

## Métricas propuestas para medir impacto (a futuro)

Ver la tabla `consultas_ciudadanas` en `database/schema.sql` — permite
registrar cuántas veces se consulta cada dataset y con qué preguntas,
para priorizar qué información municipal genera más interés ciudadano
real (en vez de asumirlo).

## Riesgos conocidos y cómo se mitigan

| Riesgo | Mitigación |
|---|---|
| El LLM podría inventar cifras | Arquitectura separa estrictamente cálculo (determinístico) de redacción (IA) — el modelo nunca ve ni genera números, solo texto y una ilustración decorativa |
| Dependencia de un proveedor de IA | El nodo del modelo de chat es intercambiable (OpenAI/Gemini/Anthropic) sin tocar el resto del flujo |
| Falsos positivos/negativos en el verificador de calidad | Se declara explícitamente que no reemplaza la revisión oficial de datos.gov.co — es una capa de detección temprana, no la decisión final |
