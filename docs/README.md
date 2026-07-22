# 📊 Documentación de Rosal BI

Esta carpeta contiene toda la documentación técnica y funcional del
proyecto **Rosal BI**. La estructura sigue la guía de repositorio
avanzado sugerida por el equipo de Datos Abiertos de MinTIC, adaptada
a nuestra arquitectura real (frontend + Agente de IA vía n8n, sin
modelos entrenados ni infraestructura Python/Docker — ver la nota al
final de este documento).

## Contenido

1. [Planteamiento del problema](planteamiento_problema.md)
2. [Marco metodológico (CRISP-ML)](marco_metodologico.md)
3. [Fuentes de datos](fuentes_datos.md)
4. [Diccionario de datos](data_dictionary.md)
5. [Arquitectura del sistema](arquitectura.md)
6. [Evaluación de impacto público, ética y mitigación de sesgos](public_impact_assessment.md)
7. [Guía de validación para pares](validacion_guide.md)
8. [Conclusiones](conclusiones.md)
9. [Roadmap del proyecto](roadmap.md)
10. [Manual de usuario](manual-usuario.md)
11. [Catálogo de datos abiertos](datos-abiertos.md)
12. [Licencias de terceros](licencias-terceros.md)
13. [Diagramas de la solución](capturas/)

## Nota sobre la plantilla de repositorio avanzado

La guía sugerida por MinTIC (`notebooks/`, `models/`, `src/agents/`,
`deployments/docker`, `deployments/kubernetes`, `config/`,
`.github/workflows`) está pensada para proyectos con modelos de machine
learning entrenados en Python y desplegados en contenedores. Rosal BI
es deliberadamente distinto: frontend puro (HTML/JavaScript) sin
backend propio, con un único Agente de IA (no un modelo entrenado)
conectado vía n8n — la misma decisión de diseño que sostiene todo el
proyecto: preferir un sistema simple, transparente y 100% verificable,
sobre uno más sofisticado en apariencia pero más difícil de auditar.

Por eso no existen carpetas `notebooks/`, `models/`, `deployments/` ni
`config/` vacías en este repositorio — se documenta aquí el porqué en
vez de simular una infraestructura que no tenemos. Lo que sí se adoptó
de la guía: la subdivisión de `docs/` (arriba), y una carpeta `tests/`
con la metodología y los scripts reales que se usaron para probar el
proyecto durante su desarrollo.
