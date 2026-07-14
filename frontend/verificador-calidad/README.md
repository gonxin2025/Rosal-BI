# Verificador de Calidad de Datos Abiertos — El Rosal

Herramienta nueva, de un solo archivo, con un solo proposito: subir un
Excel o CSV y ver al instante que errores de calidad detectaria
datos.gov.co, sin esperar 3 a 5 dias por la respuesta oficial.

No tiene busqueda de datasets, ni dashboard, ni graficas, ni PDF, ni
conexion a n8n -- a proposito. Solo hace una cosa.

## Como usarla

1. Abre `index.html` en el navegador (funciona local, sin servidor).
2. Arrastra o selecciona tu archivo `.xlsx`, `.xls` o `.csv`.
3. (Opcional) Escribe el titulo y la descripcion que piensas usar al
   publicar -- esto habilita 3 chequeos adicionales (ERR001, ERR002,
   ERR006).
4. Click en "Verificar calidad".
5. Revisa la tabla de errores detectados, con el codigo, la descripcion,
   la solucion recomendada y un link a la guia de apoyo oficial.
6. Completa las descripciones de columna en el formulario de abajo y
   vuelve a verificar para que desaparezca ERR008_3.

## Publicar en Netlify

1. Sube este archivo (`index.html`) a un repositorio de GitHub.
2. En Netlify: **Add new site → Import an existing project** → conecta
   el repositorio.
3. No necesita build command ni configuracion adicional -- es HTML puro.
4. Cada push actualiza el sitio solo.

## De donde salen los codigos de error

Del propio dataset publico de datos.gov.co:
https://www.datos.gov.co/resource/xbc7-65j4.csv (22 codigos oficiales,
ERR001 a ERR022). De esos 22, esta herramienta verifica
automaticamente los 13 que se pueden revisar solo con el archivo:

ERR001, ERR002, ERR004, ERR005, ERR006, ERR007, ERR008, ERR008_1,
ERR008_2, ERR008_3, ERR009, ERR011, ERR016, ERR018, ERR019, ERR020.

Los otros 9 (ERR003, ERR010, ERR012, ERR013, ERR014, ERR015, ERR017,
ERR021, ERR022) necesitan contexto que no esta en un archivo aislado
(comparar con otros datasets publicados, la cuenta de usuario, el
historial de actualizaciones) y se muestran como recordatorio de
revision manual, no como error detectado.

**Importante**: no reemplaza la revision oficial de datos.gov.co, solo
adelanta la deteccion de los problemas mas frecuentes.

## Descargar Excel con los errores marcados directamente en las celdas

Además del reporte en pantalla, el botón **"Descargar Excel con errores
marcados"** genera una copia de tu archivo con:

- **Celdas resaltadas por color** según el problema: rojo = celda vacía
  (ERR007), naranja = columna con posible dato personal (ERR018),
  amarillo = valor con tipo de dato inconsistente (ERR019), azul = fila
  duplicada (ERR020), gris = fila de totales/resumen (ERR016).
- **Notas de Excel** (como un comentario normal, al pasar el mouse sobre
  la celda) explicando exactamente qué está mal ahí.
- Una hoja nueva **"Resumen de errores"** con la misma tabla del reporte
  (Código, Descripción, Solución, Guía).

`SheetJS` (la libreria que se usa para *leer* el archivo que subes) en
su version gratuita no puede escribir colores ni notas — por eso para
*generar* el archivo anotado se usa una libreria distinta,
[ExcelJS](https://github.com/exceljs/exceljs), que sí soporta relleno de
celdas y comentarios al escribir un `.xlsx` nuevo desde el navegador.

### Verificado (Excel anotado)

Se armó un archivo `.xlsx` de prueba real con 5 problemas deliberados
(celda vacía, fila duplicada, valor no numérico en columna numérica,
columnas con nombre de dato personal, fila de "TOTAL"), se subió con
Puppeteer (subida real de archivo, no simulada), se generó el Excel
anotado, y se **volvió a abrir con Python (openpyxl)** para confirmar
celda por celda que el color y la nota quedaron en el lugar exacto:

```
A1: 'Nombre'  color=naranja  nota="ERR018 — nombre de columna sugiere dato personal..."
C3: ''        color=rojo     nota="ERR007 — Celda vacía..."
A4: 'Ana'     color=azul     nota="ERR020 — Fila duplicada..."
C5: 'no aplica' color=amarillo nota="ERR019 — Valor no numérico... "no aplica""
A6: ''        color=gris     nota="ERR016 — Esta fila parece un total o resumen..."
```

Cero errores de JavaScript en todo el recorrido (carga → verificación →
descarga → apertura del archivo resultante).

## Cargar desde URL (datos federados)

Además de subir un archivo, se puede pegar una **URL** — así es como se
publican los "datos federados" en datos.gov.co: en vez de subir el
archivo, la entidad apunta a un enlace en su propio servidor.

Esto agrega automáticamente el chequeo de **ERR010** (el único de los 22
códigos oficiales que antes solo se podía revisar manualmente, y que
ahora sí se automatiza cuando la fuente es una URL):

- Si el enlace termina en `.pdf`, `.doc(x)`, `.ppt(x)`, `.jpg/.png/.gif`
  o `.htm(l)`, se detiene de inmediato (ni siquiera intenta conectarse)
  y marca ERR010: el enlace debe apuntar a un formato abierto.
- Si el enlace no tiene una extensión reconocible ni parece una API de
  datos.gov.co, igual intenta cargarlo pero marca ERR010 como
  advertencia ("no se pudo confirmar el formato").
- Si el servidor responde y el `content-type` real indica PDF, Word o
  imagen (aunque la URL no lo delate), también se detiene y marca ERR010.
- Soporta JSON (arreglo plano o con los datos dentro de `data`,
  `results`, `records` o `rows`) y CSV/XLS/XLSX vía la misma libreria
  SheetJS que ya se usa para archivos locales.

### Verificado (carga por URL)

Probado con Chromium real los tres casos: URL de un `.json` válido (no
marca ERR010, arma la verificación con normalidad); URL con extensión
`.pdf` (se detiene sin siquiera llamar `fetch`, confirmado explícitamente
que la llamada de red nunca se hizo); y URL ambigua sin extensión
reconocible (carga los datos pero marca ERR010 como advertencia,
exactamente con el texto esperado).

También se probó contra una URL real de datos.gov.co
(`https://www.datos.gov.co/resource/gt2j-8ykr.json`) desde este entorno
de pruebas — la llamada falló por la propia restricción de red de este
sandbox (no tiene salida a internet abierta), pero el manejo de error
fue correcto (mensaje claro, cero errores de JavaScript). La compatibilidad
real de esa API (CORS habilitado, JSON válido) ya se había confirmado
independientemente en pruebas anteriores de este mismo proyecto.

## Verificado

Probado de extremo a extremo con Chromium real (no solo revisando
codigo): subida real de archivo `.xlsx`, click real en "Verificar
calidad", sin errores de JavaScript. Con un dataset de prueba diseñado
con 10 problemas a proposito (pocas filas, celdas vacias, sin fecha,
fila de totales, datos personales, tipos mezclados, duplicados, sin
descripciones), detecto los 10 codigos correctamente.
