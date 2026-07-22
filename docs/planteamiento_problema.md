# Planteamiento del problema

## El reto: datos disponibles, decisiones ciegas

Colombia tiene miles de conjuntos de datos disponibles en el portal
nacional datos.gov.co — pero llegan en **formato crudo**: filas y
columnas sin interpretar. Analizarlos exige tiempo, licencias de
software costosas, y personal especializado en analítica que un
municipio como El Rosal, Cundinamarca, no siempre tiene a la mano.

El resultado: la información técnicamente existe, es pública, es
gratuita — pero no llega a tiempo a las mesas donde de verdad se toman
las decisiones de gobierno. Un funcionario con un archivo de miles de
filas y decenas de columnas no tiene minutos para procesarlo antes de
una reunión.

## Por qué es un problema real, no hipotético

Este proyecto nació de la experiencia directa de la Alcaldía de El
Rosal al intentar publicar y usar sus propios datasets — incluyendo un
Plan Anual de Adquisiciones que fue inicialmente rechazado por
problemas de calidad en datos.gov.co, la motivación original de
construir primero un verificador de calidad y después la plataforma de
análisis completa.

## A quién afecta

- **Funcionarios públicos** que necesitan tomar decisiones basadas en
  evidencia sin depender de un equipo de analítica que no siempre
  existe en municipios pequeños.
- **Ciudadanos** que quieren ejercer control social sobre la gestión de
  su municipio, pero no tienen las herramientas técnicas para
  interpretar un archivo CSV de miles de filas.
- **Otros municipios** en la misma situación — El Rosal no es un caso
  aislado; es representativo de la mayoría de municipios de sexta
  categoría en Colombia.

## La pregunta que responde este proyecto

¿Se puede eliminar la barrera técnica entre "el dato existe" y "el dato
se entiende", sin licencias costosas, sin personal especializado, y
sin sacrificar el rigor — de forma que cualquier funcionario o
ciudadano pueda cargar un dataset y, en menos de un minuto, tener un
informe ejecutivo confiable?

Ver `docs/marco_metodologico.md` (metodología CRISP-ML) para cómo se
abordó la respuesta, y `docs/conclusiones.md` para los resultados.
