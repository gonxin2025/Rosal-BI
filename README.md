<img src="images/banner/banner-rosal-bi.png" alt="Rosal BI — Datos que transforman El Rosal">

# Rosal BI

*"Transformamos datos abiertos de datos.gov.co mediante IA que perfila, grafica y predice tendencias automáticamente, eliminando la barrera técnica para que gobiernos y ciudadanos tomen decisiones ejecutivas en segundos."*

Desarrollado para el **Concurso Datos al Ecosistema 2026: IA para Colombia** (Ministerio TIC), categoría **Innovación y Tecnología** — reto: *"Diseñar asistentes virtuales que faciliten el acceso ciudadano a datos abiertos"*.

**Demo en vivo**: [rosal-bi.netlify.app](https://rosal-bi.netlify.app)

## ¿Qué hace Rosal BI?

1. **Cargar datos**: busca en vivo en el catálogo de datos.gov.co (API Socrata, con metadatos reales — vistas, descargas, entidad publicadora) o sube tu propio Excel/CSV/JSON.
2. **Revisar el plan del panel**: el sistema perfila cada columna automáticamente (Fecha, Dimensión o Medida) y propone KPIs, gráficos y tablas de resumen. El usuario marca/desmarca qué incluir y puede cambiar el tipo de cada gráfico antes de generar.
3. **Estadística real, no solo reglas**: desviación estándar, correlación entre variables, y detección automática de valores atípicos — calculado en el navegador, nunca estimado por IA. Datasets de hasta 10.000 filas se procesan en menos de 100 ms.
4. **Proyecciones con rango de confianza**: en vez de un número falsamente preciso, estima el próximo periodo con un rango que se ensancha si la tendencia histórica ha sido volátil.
5. **Comparador de pares**: compara una entidad específica (ej. El Rosal) contra el total o contra un grupo de pares (ej. otros municipios de Cundinamarca) — ranking, promedio del grupo y posición relativa, todo calculado.
6. **Referencias externas reales**: un resumen de Wikipedia sobre la entidad detectada y datasets relacionados en datos.gov.co — presentados claramente como enlaces externos, nunca mezclados con los hallazgos calculados sobre tus datos.
7. **Narrador Experto (chat con IA real)**: además de responder preguntas rápidas al instante ("top 10 de X", "promedio de Y"), un modelo de lenguaje conectado vía n8n explica los hallazgos con contexto institucional (qué es el DANE, cómo opera el SGP, qué es el PAE, etc.) — con una regla estricta: **nunca calcula ni inventa una cifra**, solo interpreta los números que la app ya calculó. Solo el primer mensaje de cada conversación manda el contexto completo; los siguientes usan memoria de conversación en n8n.
8. **Exportación a PDF**: el lienzo completo, multipágina si hace falta, en alta resolución.
9. **Responsive**: funciona igual de bien en computador, tablet o celular — el menú se convierte en panel deslizable en pantallas chicas.

Por separado, **el verificador de calidad** revisa cualquier dataset contra el listado oficial de errores de datos.gov.co (22 códigos, ERR001–ERR022) antes de publicarlo, y descarga el mismo Excel con las celdas problemáticas marcadas.

## Principio de diseño: la IA nunca calcula

Todo lo determinístico (perfilado de columnas, KPIs, correlación, desviación estándar, proyección) corre en JavaScript puro en el navegador — nunca se le pide a un modelo de lenguaje que le saque cuentas a los datos. La IA (el Narrador Experto) solo recibe los números que ya se calcularon y los explica con contexto — la misma regla, sin excepciones, en cada pieza de IA del proyecto.

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| [`docs/`](docs/) | Documentación técnica y funcional completa |
| [`frontend/`](frontend/) | Rosal BI (dashboard principal) y el verificador de calidad |
| [`ai/n8n/`](ai/n8n/) | Flujo de n8n del Narrador Experto (chat con IA) |
| [`backend/`](backend/) | Servicios de apoyo — en construcción, no hay backend propio corriendo hoy |
| [`datasets/`](datasets/) | Datos originales, procesados, y catálogo |
| [`dashboards/`](dashboards/) | Tableros temáticos por sector |
| [`scripts/`](scripts/) | Utilidades de importación, limpieza y exportación de datos |
| [`database/`](database/) | Esquema y migraciones (borrador, no en uso) |
| [`images/`](images/) | Logo, banner y recursos gráficos oficiales |
| [`presentacion/`](presentacion/) | Deck de la presentación ante el jurado |

## Empezar rápido

1. Abre `frontend/dashboard/index.html` en el navegador — no necesita servidor ni build. También disponible en [rosal-bi.netlify.app](https://rosal-bi.netlify.app).
2. Para el chat con IA real (Narrador Experto): importa `ai/n8n/rosal-bi-chat-narrador.json` en tu n8n, asigna tu credencial de modelo de chat (OpenAI/Gemini/Anthropic), activa el workflow, y pega la Production URL en `CHAT_WEBHOOK_URL` dentro del HTML — ver [`ai/n8n/README.md`](ai/n8n/README.md).
3. Para verificar la calidad de un dataset antes de publicarlo, abre `frontend/verificador-calidad/index.html`.

Ver [`docs/arquitectura.md`](docs/arquitectura.md) para el detalle técnico completo.
