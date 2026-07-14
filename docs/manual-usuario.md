# Manual de usuario

## 1. Consultar datos (consola principal)

Abre `frontend/dashboard/index.html` (o la URL publicada en Netlify).

1. **Busca un dataset**: escribe una palabra clave (ej. "trámites",
   "presupuesto") en el buscador — se consulta en vivo el catálogo de
   datos.gov.co.
2. **O carga el tuyo**: si no lo encuentras, usa "¿No encuentras tu
   dataset? Cargar archivo o API manualmente" para subir un Excel/CSV
   o pegar la URL de una API.
3. Los datos se cargan y totalizan solos — no hace falta ningún paso
   adicional. Vas a ver de inmediato: el total destacado, la categoría
   detectada, los hallazgos en texto, y una gráfica por cada columna
   relevante.
4. **Descargar PDF**: exporta tal cual se ve en pantalla.
5. **Generar infografía (con flujo IA)**: le pide al flujo de n8n que
   redacte una narrativa y genere una ilustración temática. Si el flujo
   no está conectado, muestra un error claro (no se inventa nada).
6. **Diseño local (sin IA)**: genera el mismo tipo de infografía pero con
   un ícono y color fijos según la categoría, sin depender de n8n.

También puedes preguntar en lenguaje natural (ej. *"qué trámites ofrece
la alcaldía y cuánto cuestan"*) en la caja correspondiente — esto sí
requiere que el flujo de n8n esté conectado.

## 2. Verificar calidad antes de publicar

Abre `frontend/verificador-calidad/index.html`.

1. Sube tu Excel/CSV, o pega la URL del recurso (si publicas por enlace).
2. (Opcional) Escribe el título y descripción que piensas usar al
   publicar — habilita 3 chequeos adicionales.
3. Clic en "Verificar calidad". Vas a ver una tabla con cada error
   detectado, el código oficial, la solución recomendada, y un enlace a
   la guía de apoyo.
4. Completa las descripciones de columna en el formulario de abajo para
   resolver el error de metadata incompleta.
5. **Descargar Excel con errores marcados**: te llevas una copia de tu
   archivo con las celdas problemáticas resaltadas en color y una nota
   explicando cada una — para revisarlo directo en Excel.

## Preguntas frecuentes

**¿Necesito instalar algo?** No. Ambas herramientas son un solo archivo
HTML que corre en el navegador.

**¿Mis datos se suben a algún servidor?** No, salvo que uses el botón
"Generar infografía (con flujo IA)" o la caja de pregunta en lenguaje
natural — ahí sí se envían al webhook de n8n que tú mismo configuras y
controlas.

**¿Por qué el botón de IA no hace nada?** Revisa que `WEBHOOK_URL` en el
código apunte a tu workflow de n8n real y que el workflow esté activo.
Ver [`../ai/n8n/README.md`](../ai/n8n/README.md).
