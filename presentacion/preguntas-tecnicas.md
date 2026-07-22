# Preguntas técnicas rápidas — Rosal BI
### Para responder en vivo ante el jurado

Respuestas cortas y directas, listas para decir de memoria. Cada una
en 2-4 frases — si el jurado pide más detalle, ahí sí se profundiza.

---

## Arquitectura y hosting

**¿Tienen backend propio?**
No. Todo el análisis corre en el navegador del usuario — JavaScript
puro, sin servidor nuestro de por medio. La única pieza externa es un
flujo de automatización (n8n) que conecta el chat con un modelo de
lenguaje, y eso es opcional: si se cae, el resto de la app sigue
funcionando normal.

**¿Dónde está alojado?**
El sitio en Netlify, gratis, sin build step. El flujo de IA corre en
una instancia de n8n aparte. Nada depende de un servidor propio que
nosotros administremos.

**¿Qué pasa si Netlify o n8n se caen?**
Si Netlify se cae, se cae el sitio — es el mismo riesgo que cualquier
página estática. Si solo se cae n8n, la app entera sigue funcionando:
búsqueda, carga de datos, gráficas, estadística, comparador y PDF no
dependen de eso — solo el chat con el Narrador Experto quedaría sin
respuesta, con un mensaje de error claro, no un fallo silencioso.

---

## Inteligencia artificial

**¿Cómo evitan que la IA invente datos?**
Regla de diseño no negociable: la IA nunca calcula. Todo número
(sumas, promedios, correlación, desviación estándar, proyección) lo
calcula código determinístico en el navegador. La IA solo recibe esos
números ya calculados y los explica — si le preguntan algo que no está
en ese contexto, tiene instrucción explícita de decir que no lo tiene,
no de inventarlo.

**¿Qué modelo de IA usan?**
El flujo es intercambiable — hoy corre con Gemini, pero el mismo nodo
funciona con OpenAI o Anthropic sin cambiar arquitectura, solo la
credencial.

**¿Cuánto cuesta la parte de IA?**
Centavos de dólar por conversación. El contexto que se manda es un
resumen de KPIs y listas ya calculadas, no el dataset completo fila
por fila — eso mantiene el costo y la latencia bajos.

**¿Por qué no usaron ChatGPT directo en el navegador?**
Porque expondría la llave de API a cualquiera que abra el código de la
página — un riesgo de seguridad y de costo. Por eso la llamada al
modelo pasa por n8n, donde la credencial queda protegida del lado del
servidor.

---

## Datos y escala

**¿Cuántos datos puede procesar?**
Hasta 50.000 filas por dataset, procesadas directo en el navegador sin
saturar ningún servidor. Lo probamos con 10.000 filas sintéticas: el
perfilado completo (columnas, KPIs, estadística) toma menos de 100
milisegundos.

**¿Por qué el límite de 50.000?**
Es un techo de seguridad, no una limitación técnica dura — se puede
subir. Se eligió ese número porque cubre la gran mayoría de datasets
municipales y departamentales sin arriesgar que el navegador del
usuario se quede sin memoria.

**¿Qué pasa con datasets más grandes que eso?**
Se trunca con aviso explícito al usuario — nunca se corta en
silencio.

---

## Seguridad y privacidad

**¿Los datos de los ciudadanos quedan seguros?**
No se sube ningún archivo a un servidor nuestro. El análisis, el plan
del panel y el PDF se generan 100% en el navegador de quien lo usa.
Las únicas llamadas externas son a la API pública de datos.gov.co, a
Wikipedia para contexto opcional, y al chat si el usuario decide usarlo.

**¿Guardan información personal de quien usa la herramienta?**
No. No hay cuentas, no hay login, no hay tracking — es una herramienta
sin estado, cada sesión empieza limpia.

---

## Rigor estadístico

**¿Cómo calculan la proyección?**
Tasa de crecimiento histórica promedio entre periodos, aplicada al
último valor conocido. La diferencia clave: en vez de un número único,
calculamos también la desviación estándar de esa tasa de crecimiento y
mostramos un rango — más ancho si la tendencia ha sido volátil, en vez
de fingir una precisión que los datos no tienen.

**¿Qué tan confiable es esa proyección?**
Es una proyección lineal simple, no un modelo de series de tiempo
complejo (no usamos ARIMA ni redes neuronales) — es una decisión
deliberada: preferimos un método simple, transparente y explicable,
sobre uno más sofisticado pero opaco para un funcionario público sin
formación en estadística.

**¿Cómo detectan valores atípicos?**
Cualquier valor que se aleje más de 2 desviaciones estándar de la
media del grupo se marca como atípico, con una nota sugiriendo revisar
si es un caso real o un error del dato de origen.

---

## Stack técnico

**¿Qué tecnologías usaron?**
JavaScript vanilla (sin framework), Chart.js para gráficas, jsPDF y
html2canvas para la exportación a PDF, PapaParse y SheetJS para
leer CSV/Excel, Tailwind para el diseño. Todo vía CDN, cero
instalación, cero build step.

**¿Por qué no usaron React o Vue?**
Para que cualquiera pueda abrir el archivo directo en el navegador sin
compilar nada — reduce la barrera de entrada para que otro municipio
lo adapte, que es justo el objetivo de escalabilidad del proyecto.

---

## Escalabilidad y replicabilidad

**¿Sirve para otros municipios?**
Sí — la arquitectura es agnóstica a qué portal de datos abiertos se
use, siempre que exponga una API tipo Socrata (como datos.gov.co) o
DKAN. No hay nada codificado específicamente para El Rosal salvo la
marca visual.

**¿Qué tan fácil es que otro municipio lo adopte?**
Es un solo archivo HTML — se copia, se cambia el nombre y el logo, y
funciona. La parte de IA es opcional y se activa aparte.

---

## Limitaciones honestas (si preguntan qué falta)

- No hay un backend propio para guardar historial o favoritos entre
  sesiones — cada sesión es independiente.
- La proyección es un método estadístico simple, no un modelo
  predictivo entrenado.
- El motor de IA depende de que el flujo de n8n esté activo y con
  crédito disponible en el proveedor del modelo.
- El registro del proyecto en herramientas.datos.gov.co/usos y el
  inventario completo del catálogo municipal siguen en proceso.
